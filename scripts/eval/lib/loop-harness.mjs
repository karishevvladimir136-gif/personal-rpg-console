// Runs one scenario on the dm-loop-v1 runtime: a fresh campaign on PGlite
// (World → character → opening, no takeover), the real loop (durable begin,
// claim, tools against the shadow state, receipts, checkpoints, atomic commit),
// and either a scripted DmModel (fake) or the live adapters with a hard budget.
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loopCampaign } from "../../../tests/dm-loop-fixture.mjs";
import { runDmLoopTurn, resumeDmLoopTurn } from "../../../src/lib/gameplay/dm-loop/loop.ts";
import { createScriptedDmModel } from "../../../src/lib/gameplay/dm-loop/scripted-model.ts";
import { dmLoopLimits } from "../../../src/lib/gameplay/dm-loop/limits.ts";
import { dmModels, dmRequestReservation } from "../../../src/lib/model-runtime/dm-models.ts";
import { snapshot, diff, resolvePlaceholders, evaluateCheck, privateFacts } from "./state.mjs";
import { metricsReport, parseMetrics } from "../../../src/lib/gameplay/dm-loop/metrics.ts";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only"
    ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
    : nextResolve(specifier, context);
} });
const { createDmModel } = await import("../../../src/lib/server/dm/model/index.ts");
hook.deregister();

const here = dirname(fileURLToPath(import.meta.url));
const MAX_CONTINUES = 8;
export const LOOP_MODELS = {
  opus: { providerId: "anthropic", modelId: "claude-opus-5-5", key: "ANTHROPIC_API_KEY", defaultEffort: "high" },
  astra: { providerId: "openai", modelId: "gpt-6-astra", key: "OPENAI_API_KEY", defaultEffort: "medium" },
};

/** The loop scripts of an old scenario live beside it: scenarios/loop/<name>.json
 * ({ "<stepId>": { note, rounds } | [candidates], "expect": { "<stepId>": [...] } }). */
export async function loadLoopScript(name) {
  const file = join(here, "..", "scenarios", "loop", `${name}.json`);
  return existsSync(file) ? JSON.parse(await readFile(file, "utf8")) : null;
}

function pickRounds(candidates, state, campaignId) {
  const list = candidates === undefined ? [] : Array.isArray(candidates) ? candidates : [candidates];
  for (const candidate of list) {
    const resolved = resolvePlaceholders(candidate, state, campaignId);
    if (resolved) return resolved;
  }
  return null;
}

/** A hard spend cap for live runs: the worst case of every request is
 * reserved before dispatch; a request that could cross the cap is not sent. */
export function createLoopBudget(limitUsd) {
  return { limitUsd, spentUsd: 0, reservedUsd: 0, exhausted: false, requests: 0 };
}

function liveModel(selection, budget, apiKey, log) {
  const spec = dmModels[`${selection.providerId}/${selection.modelId}`];
  const reservations = new Map();
  const fetcher = async (url, init) => {
    const bytes = Buffer.byteLength(String(init?.body ?? ""), "utf8");
    const reservation = dmRequestReservation(spec, bytes, dmLoopLimits.maxOutputTokens);
    if (budget.spentUsd + budget.reservedUsd + reservation > budget.limitUsd) {
      budget.exhausted = true;
      log.push({ event: "budget_reached", requestBytes: bytes, reservationUsd: reservation });
      throw Object.assign(new Error("eval_budget_reached"), { name: "EvalBudget" });
    }
    budget.reservedUsd += reservation;
    budget.requests++;
    const started = performance.now();
    try {
      const response = await fetch(url, init);
      log.push({ event: "http", status: response.status, requestBytes: bytes, latencyMs: Math.round(performance.now() - started) });
      // A rejected request costs nothing; a streamed one is settled from its usage event.
      if (response.ok) reservations.set(budget.requests, reservation);
      else budget.reservedUsd -= reservation;
      return response;
    } catch (error) {
      budget.reservedUsd -= reservation;
      throw error;
    }
  };
  const model = createDmModel(selection, { apiKey, fetcher, maxRetries: 1 });
  return { model, settle: (costUsd) => {
    // The loop sends one request at a time: a finished request settles every
    // open reservation (a retried attempt's one included) and charges the
    // measured cost. Stage 2 released only the oldest, so retries leaked
    // reservations and the guard refused requests early.
    for (const [key, reservation] of reservations) { budget.reservedUsd -= reservation; reservations.delete(key); }
    budget.spentUsd += costUsd;
    if (budget.spentUsd >= budget.limitUsd) budget.exhausted = true;
  }, abandon: () => {
    for (const [key, reservation] of reservations) { budget.reservedUsd -= reservation; budget.spentUsd += reservation; reservations.delete(key); }
    if (budget.spentUsd >= budget.limitUsd) budget.exhausted = true;
  } };
}

/** The hero and the companions (the loop counts controlled companions; the bench takes every companion). */
function afterParty(state) {
  return state.entities.filter((row) => row.id === state.heroId || row.kind === "companion");
}

function sum(entries, key) {
  return entries.reduce((total, entry) => total + (entry[key] ?? 0), 0);
}

/** Tool calls of each request, in order, from the receipts and the per-request counts. */
function callsByRequest(usage, receipts) {
  let offset = 0;
  return usage.map((entry) => {
    const own = receipts.slice(offset, offset + (entry.toolCalls ?? 0));
    offset += entry.toolCalls ?? 0;
    return own.map((r) => ({ name: r.call.name, ok: r.result.ok }));
  });
}

/**
 * @param scenario parsed scenario JSON (+ loop script merged by the caller)
 * @param options { live, model: "opus"|"astra", effort, continuationEffort, apiKey, budget, write, runId, verbose }
 */
export async function runLoopScenario(scenario, options) {
  const { write, runId, live } = options;
  const selection = LOOP_MODELS[options.model ?? "astra"];
  const effort = options.effort ?? selection.defaultEffort;
  const continuationEffort = options.continuationEffort && options.continuationEffort !== effort ? options.continuationEffort : null;
  const scenarioStarted = performance.now();
  const c = await loopCampaign();
  const { f, cid, hero } = c;
  // Stage 4: the bench plays on the Stage 4 craft (the owner activates it in the DM Craft screen).
  await c.activateStage4Craft();
  const script = scenario.loop ?? {};
  const layerHashes = [];
  const transport = [];
  // The campaign's DM model is the one under test; the loop pins it per turn.
  await c.settings.save({ expectedRevision: (await c.settings.read()).revision, runtime: "dm-loop-v1",
    dmTurn: { providerId: selection.providerId, modelId: selection.modelId, reasoning: effort } });
  const steps = new Map();
  const inputs = new Map();
  const saves = new Map();
  const narrations = [];
  const results = [];
  let turnIndex = 0;
  let stopReason = null;
  const scripted = live ? null : createScriptedDmModel([]);
  const liveAdapter = live ? liveModel(selection, options.budget, options.apiKey, transport) : null;
  let metrics = null, dossierBudget = null, depths = {}, selfDisclosures = [];
  try {
    steps.set("start", await snapshot(f, cid, hero));
    for (const step of scenario.steps) {
      if (live && step.probe) continue;
      if (live && options.budget.exhausted) { stopReason = "budget_reached"; break; }
      const before = await snapshot(f, cid, hero);
      const record = { type: step.say !== undefined || step.action === "replay" ? "turn" : "action",
        run: runId, scenario: scenario.name, step: step.id, probe: !!step.probe, runtime: "dm-loop-v1",
        model: `${selection.providerId}/${selection.modelId}`, effort };
      let turn = null;
      if (step.say !== undefined || step.action === "replay") {
        turnIndex++;
        let input;
        if (step.action === "replay") {
          input = inputs.get(step.of);
          if (!input) throw Error(`replay of unknown step ${step.of}`);
        } else {
          const companion = step.companion ? before.entities.find((row) => new RegExp(step.companion, "iu").test(row.name) && row.kind === "companion") : null;
          input = await c.input(step.say, companion ? "companion" : "game", companion?.id ?? null, []);
          inputs.set(step.id, input);
        }
        const candidate = live ? null : pickRounds(script[step.id], before, cid);
        const rounds = candidate?.rounds ?? null;
        if (!live) scripted.prepare(step.action === "replay" ? [] : rounds ?? []);
        c.forceDice(step.dice ?? []);
        const observations = [];
        let firstWordAt = null;
        const started = performance.now();
        const deps = await c.deps(live ? liveAdapter.model : scripted, { observe: (observation) => {
          observations.push(observation);
          if (observation.type === "live" && observation.event.type === "text" && firstWordAt === null) firstWordAt = performance.now();
          if (live && observation.type === "request_finished") liveAdapter.settle(observation.usage.costUsd);
          if (live && observation.type === "failure") liveAdapter.abandon();
        } });
        if (continuationEffort) {
          const pinned = deps.pin;
          deps.pin = async (claim) => ({ ...(await pinned(claim)), continuationEffort });
        }
        let result = null, firstStatus = null, resumes = 0, thrown = null, retried = false;
        try {
          result = await runDmLoopTurn(input, deps);
          firstStatus = result.status;
          while (result.status === "awaiting_confirmation" && resumes < MAX_CONTINUES) {
            resumes++;
            result = await resumeDmLoopTurn({ commandId: randomUUID(), campaignId: cid, operationId: input.operationId,
              timeline: input.timeline, action: "continue", checkId: null }, deps);
          }
          if (result.status === "failed" && result.canRetry && step.retryOnFailure && !live) {
            retried = true;
            result = await resumeDmLoopTurn({ commandId: randomUUID(), campaignId: cid, operationId: input.operationId,
              timeline: input.timeline, action: "retry", checkId: null }, deps);
            while (result.status === "awaiting_confirmation" && resumes < MAX_CONTINUES) {
              resumes++;
              result = await resumeDmLoopTurn({ commandId: randomUUID(), campaignId: cid, operationId: input.operationId,
                timeline: input.timeline, action: "continue", checkId: null }, deps);
            }
          }
        } catch (error) { thrown = error; }
        const durationMs = Math.round(performance.now() - started);
        let cancelledAfterFailure = false;
        if (result?.status === "failed" && result.canRetry) {
          await resumeDmLoopTurn({ commandId: randomUUID(), campaignId: cid, operationId: input.operationId,
            timeline: input.timeline, action: "cancel", checkId: null }, deps);
          cancelledAfterFailure = true;
        }
        const row = await c.row(input.operationId);
        const loop = row?.checkpoint?.dmLoop ?? null;
        // Requests made during this step only (a replay makes none; a retry adds its own).
        const usage = observations.filter((o) => o.type === "request_finished").map((o) => o.usage);
        const receipts = loop?.receipts ?? [];
        const requestStarts = observations.filter((o) => o.type === "request_started");
        // Stage 4: the four layers of the first request (tokens vs budget) and whether
        // each one's text was unchanged since the previous turn (a cacheable prefix).
        const layers = (requestStarts[0]?.layers ?? []).map((layer, index) =>
          ({ index, bytes: layer.bytes, tokens: layer.tokens, budgetTokens: layer.budgetTokens, hash: layer.hash,
            stable: layerHashes.length ? layerHashes.at(-1)[index] === layer.hash : null }));
        if (layers.length) layerHashes.push(layers.map((layer) => layer.hash));
        if (result?.status === "committed" && result.narration) narrations.push(result.narration);
        const contextText = (live ? liveAdapter.model : scripted).requests?.at(-1)
          ? scripted?.requests.at(-1).system.map((block) => block.text).join("\n") : null;
        turn = {
          outcome: result?.status ?? "error",
          firstStatus, paused: firstStatus === "awaiting_confirmation", continues: resumes, retried,
          errorCode: result?.failure ?? (thrown ? (thrown.code ?? "exception") : null),
          retryable: result?.canRetry ?? null, cancelledAfterFailure,
          exception: thrown ? String(thrown.message).slice(0, 200) : null,
          failure: observations.filter((o) => o.type === "failure").map((o) => ({ code: o.code, message: o.message })),
          durationMs,
          firstWordMs: firstWordAt === null ? null : Math.round(firstWordAt - started),
          modelRequests: { total: usage.length, plan: 0, narrate: 0, other: usage.length },
          tokens: { input: sum(usage, "inputTokens"), output: sum(usage, "outputTokens"), cached: sum(usage, "cacheReadTokens"),
            cacheWrite: sum(usage, "cacheWriteTokens"), reasoning: sum(usage, "reasoningTokens"), estimated: !live },
          cacheReadShare: sum(usage, "inputTokens") ? Number((sum(usage, "cacheReadTokens") / sum(usage, "inputTokens")).toFixed(3)) : null,
          costUsd: live ? Number(sum(usage, "costUsd").toFixed(5)) : 0,
          requestBytes: requestStarts.map((o) => o.requestBytes),
          cachedPrefixBytes: requestStarts[0]?.cachedPrefixBytes ?? null,
          calls: usage.map((entry, index) => ({ stage: "loop", latencyMs: entry.latencyMs, firstTextMs: entry.firstTextMs,
            inputTokens: entry.inputTokens, cachedInputTokens: entry.cacheReadTokens, cacheWriteTokens: entry.cacheWriteTokens,
            outputTokens: entry.outputTokens, reasoningTokens: entry.reasoningTokens, costUsd: entry.costUsd, toolCalls: entry.toolCalls,
            effort: entry.effort, tools: callsByRequest(usage, receipts)[index] })),
          effects: { proposed: receipts.map((r) => r.call.name), accepted: receipts.filter((r) => r.result.ok).map((r) => r.call.name),
            rejected: receipts.filter((r) => !r.result.ok).map((r) => ({ name: r.call.name, reason: r.result.reason })),
            summaries: receipts.filter((r) => r.result.ok).map((r) => r.result.summary),
            hints: receipts.filter((r) => r.result.ok && typeof r.result.value?.hint === "string").map((r) => r.result.value.hint),
            duePlans: receipts.reduce((total, r) => total + (r.result.ok && Array.isArray(r.result.value?.duePlans) ? r.result.value.duePlans.length : 0), 0) },
          layers,
          // Research records: the full receipts and the party, so the metrics can be recomputed (scripts/eval/recompute.mjs).
          receipts,
          partyNames: afterParty(await snapshot(f, cid, hero)).map((row) => row.name),
          party: afterParty(await snapshot(f, cid, hero)).map((row) => ({ hp: row.hp, maxHp: row.max_hp })),
          diagnostics: loop?.diagnostics ?? [],
          meta: loop?.meta ?? null,
          pin: loop?.pin ?? null,
          scriptProblems: live ? transport.filter((t) => t.event === "budget_reached").map(() => "budget_reached: request not sent")
            : (scripted.exhausted ? [] : [`${scripted.rounds.length} scripted round(s) left unused`]),
          contextText,
          narration: result?.narration ?? null,
          checks: result?.checks ?? [],
        };
        Object.assign(record, { turn: turnIndex, input: input.input, operationId: input.operationId,
          replayOf: step.action === "replay" ? step.of : undefined,
          scriptedNote: live ? undefined : script[step.id]?.note ?? (step.action === "replay" ? "replay (no model answer expected)" : rounds ? undefined : "no applicable scripted answer"),
          ...turn, contextText: undefined });
        // Integration smoke: work that follows a turn (a live frame of its narration), recorded on the turn.
        if (options.afterTurn) Object.assign(record, (await options.afterTurn({ c, f, cid, hero, input, result, turn, record })) ?? {});
        transport.splice(0, transport.length);
      } else if (step.action === "save") {
        const save = await f.saves(cid, "create", await f.command(cid, { kind: "manual", name: step.name }));
        saves.set(step.name, save.saveId);
        record.action = `save "${step.name}"`;
      } else if (step.action === "load") {
        const saveId = saves.get(step.save);
        if (!saveId) throw Error(`unknown save ${step.save}`);
        await f.saves(cid, "load", await f.command(cid, { saveId, label: `Eval load ${step.save}`, recovery: false }));
        record.action = `load "${step.save}"`;
      } else if (step.action === "legacyQuest") {
        // An open quest of the previous runtime with its reward terms in the old
        // shape (currencyName/currencyAmount, astra_runtime_settlement), as a
        // campaign switched to the loop would carry (Stage 3 follow-up).
        // A live DM may have named the issuer its own way (or not recorded one yet): the quest then has no issuer.
        const issuer = step.issuer ? resolvePlaceholders(step.issuer, before, cid) : null;
        await f.query(`insert into public.rpg_quests (id,campaign_id,title,description,status,revision,reward_terms)
          values ($1,$2,$3,$4,'open',1,$5::jsonb)`, [randomUUID(), cid, step.title, step.description ?? "", JSON.stringify({
          description: step.description ?? "", currencyName: step.currencyName ?? null, currencyAmount: step.currencyAmount ?? null,
          itemName: step.itemName ?? null, itemCategory: step.itemCategory ?? null, itemDescription: step.itemDescription ?? null, issuerId: issuer })]);
        if (step.item) {
          // The legacy quest's object already in the hero's pack (a found ledger), so the live DM has something real to hand over.
          await f.query(`insert into public.rpg_items (id,campaign_id,name,category,quantity,description,mechanics,owner_entity_id,storage_id,equipped_entity_id,equipped_slot,revision)
            values ($1,$2,$3,'misc',1,$4,'',$5,$6,null,null,1)`, [randomUUID(), cid, step.item, step.itemDescription ?? "", hero,
            before.storages.find((row) => row.entity_id === hero && row.kind === "player")?.id ?? null]);
        }
        record.action = `legacy quest "${step.title}"${step.issuer && !issuer ? " (issuer not found; none recorded)" : ""}`;
      } else if (step.action === "privateFact") {
        // A DM-private fact planted between turns (a fixture's private delta): the
        // DM reads it in layer 3 and must not let it into the narration.
        await f.query(`insert into rpg_private.dm_state(campaign_id,contents) values($1, jsonb_build_object('fact', jsonb_build_object($2::text, $3::text)))
          on conflict(campaign_id) do update set contents=jsonb_set(rpg_private.dm_state.contents || jsonb_build_object('fact', coalesce(rpg_private.dm_state.contents->'fact','{}'::jsonb)),
            array['fact',$2::text], to_jsonb($3::text)), revision=rpg_private.dm_state.revision+1, updated_at=now()`, [cid, step.key, step.value]);
        record.action = `private fact ${step.key}`;
      } else if (step.action === "switchRuntime") {
        // The owner switches the campaign's runtime in the settings screen; a switch to
        // the loop converts the old reward terms (rpg_dm_settings).
        const current = await c.settings.read();
        await c.settings.save({ expectedRevision: current.revision, runtime: step.runtime, dmTurn: current.dmTurn });
        record.action = `runtime → ${step.runtime}`;
      } else if (step.action === "characterModel") {
        const model = resolvePlaceholders(step.model, before, cid);
        if (!model) throw Error("character model placeholders did not resolve");
        const fence = await f.fence(cid);
        const call = async (action, payload) => (await f.one(
          "select public.rpg_character_model($1,$2,$3,$4::jsonb,$5::jsonb) result",
          [f.owner, cid, action, JSON.stringify(payload), JSON.stringify(fence)])).result;
        const current = await call("read", { actorId: model.actorId });
        await call("correct", { requestId: randomUUID(), actorId: model.actorId, expectedRevision: current.revision, model });
        record.action = "owner Character Model correction";
      } else {
        throw Error(`unknown step ${JSON.stringify(step).slice(0, 120)}`);
      }
      const afterState = await snapshot(f, cid, hero);
      record.changes = diff(before, afterState);
      const expectations = (scenario.loop?.expect?.[step.id]) ?? step.loopExpect ?? step.expect ?? [];
      const checks = [];
      for (const { weakness, scripted: scriptedOnly, ...check } of expectations) {
        // A check marked `scripted` pins the scripted model's timing (which
        // turn records what); a live DM may name and order things its own
        // way, so live runs keep only the outcome checks (stage 2b §5).
        if (live && scriptedOnly) continue;
        const evaluated = await evaluateCheck(check, { f, campaignId: cid, before, after: afterState, steps, turn, narrations });
        checks.push(weakness ? { ...evaluated, weakness } : evaluated);
      }
      record.checks = checks;
      steps.set(step.id, afterState);
      results.push(record);
      write(record);
    }
    // Stage 4 summary material, read while the database is still open.
    metrics = metricsReport(parseMetrics({ fact: await privateFacts(f, cid) }));
    const turnLayers = results.filter((record) => record.type === "turn" && record.layers?.length).map((record) => record.layers);
    dossierBudget = turnLayers.length ? turnLayers[0].map((_, index) => {
      const column = turnLayers.map((layers) => layers[index]).filter(Boolean);
      const judged = column.filter((layer) => layer.stable !== null);
      return { layer: index + 1, maxTokens: Math.max(...column.map((layer) => layer.tokens)), budgetTokens: column[0].budgetTokens,
        overBudgetTurns: column.filter((layer) => layer.budgetTokens && layer.tokens > layer.budgetTokens).length,
        stableShare: judged.length ? Number((judged.filter((layer) => layer.stable).length / judged.length).toFixed(3)) : null };
    }) : null;
    for (const record of results) if (record.type === "turn" && record.pin?.effort) depths[record.pin.effort] = (depths[record.pin.effort] ?? 0) + 1;
    selfDisclosures = results.flatMap((record) => (record.diagnostics ?? []).filter((d) => d.kind === "self_disclosure").map((d) => `${record.step}: ${d.detail}`));
  } finally {
    await f.db.close();
  }
  const all = results.flatMap((record) => record.checks.map((check) => ({ ...check, probe: record.probe, step: record.step })));
  const core = all.filter((check) => !check.probe);
  const probes = all.filter((check) => check.probe);
  const summary = {
    type: "scenario", run: runId, scenario: scenario.name, title: scenario.title, runtime: "dm-loop-v1",
    turns: results.filter((record) => record.type === "turn").length,
    checksPassed: core.filter((check) => check.pass).length, checksTotal: core.length,
    probesPassed: probes.filter((check) => check.pass).length, probesTotal: probes.length,
    passed: core.length > 0 && core.every((check) => check.pass),
    weaknesses: all.filter((check) => check.weakness).map((check) =>
      ({ id: check.weakness, label: check.label, step: check.step, pass: check.pass, detail: check.detail })),
    failedChecks: all.filter((check) => !check.pass).map((check) =>
      `${check.probe ? "[probe] " : ""}${check.step}: ${check.label} — ${check.detail}`),
    harnessErrors: results.flatMap((record) => (record.scriptProblems ?? []).map((problem) => `${record.step}: ${problem}`)),
    rpcErrors: c.errors.map((error) => `${error.action}: ${error.code ?? ""} ${error.message}`).slice(0, 20),
    leaks: results.flatMap((record) => (record.diagnostics ?? []).filter((d) => d.kind === "suspected_leak").map((d) => `${record.step}: ${d.detail}`)),
    totalMs: Math.round(performance.now() - scenarioStarted),
    stopReason,
    // Stage 4: the resistance metrics, the dossier budgets per layer, the depth
    // the server chose per turn and the NPC self-disclosures the leak check set aside.
    metrics, dossierBudget, depths, selfDisclosures,
  };
  write(summary);
  return summary;
}
