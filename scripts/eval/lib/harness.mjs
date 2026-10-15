// Runs one scenario against a fresh disposable PGlite campaign through the
// real Astra turn path: durable begin, claim, provider, validators, ordered
// effects, atomic commit and after-commit memory maintenance.
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { takenOver } from "../../../tests/astra-freedom-fixture.mjs";
import { createRpcTurnStore } from "../../../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../../../src/lib/memory/store.ts";
import { runAstraTurn, resumeAstraTurn } from "../../../src/lib/gameplay/astra-primary.ts";
import { runWithAstraMemoryMaintenance } from "../../../src/lib/memory/after-commit.ts";
import { snapshot, diff, resolvePlaceholders, evaluateCheck } from "./state.mjs";

// The production provider module is marked server-only; outside Next.js the
// marker is replaced by an empty module, exactly as the provider tests do.
const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only"
    ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
    : nextResolve(specifier, context);
} });
const { createAstraPrimaryProvider } = await import("../../../src/lib/server/dm/astra-primary-provider.ts");
hook.deregister();

const MAX_CONTINUES = 8;

function seededRandom(seed) {
  let state = [...seed].reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619), 2166136261) >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** randomInt-compatible source: integer in [min, max). Scripted dice values
 * are used first when they fit the requested range. */
function diceSource(seed) {
  const next = seededRandom(seed);
  const forced = [];
  const random = (min, max) => {
    if (forced.length && forced[0] >= min && forced[0] < max) return forced.shift();
    return min + Math.floor(next() * (max - min));
  };
  return { random, force: (values = []) => forced.splice(0, forced.length, ...values) };
}

function captureConsole(events, verbose) {
  const original = { info: console.info, warn: console.warn };
  for (const level of ["info", "warn"]) {
    console[level] = (...args) => {
      if (args.length === 1 && typeof args[0] === "string" && args[0].startsWith("{")) {
        try {
          const parsed = JSON.parse(args[0]);
          if (parsed?.event) {
            events.push(parsed);
            if (!verbose) return;
          }
        } catch { /* not a structured event */ }
      }
      original[level](...args);
    };
  }
  return () => Object.assign(console, original);
}

async function createCampaign() {
  const started = performance.now();
  // Same preparation as tests/astra-freedom-fixture.mjs: World, character
  // creation, opening, configuration and Astra takeover through the existing
  // services and RPCs, on PGlite with all migrations.
  const { f, hero, npc } = await takenOver(51);
  const errors = [];
  const rpc = async (args) => {
    try { return { data: await f.runtime(args.p_campaign_id, args.p_action, args.p_payload, args.p_timeline) }; }
    catch (error) {
      errors.push({ action: args.p_action, code: error.code ?? null, message: String(error.message).slice(0, 200) });
      return { error: { message: error.message, code: error.code } };
    }
  };
  const memoryRpc = async (args) => {
    try { return { data: await f.memory(args.p_campaign_id, args.p_action, args.p_payload, args.p_timeline) }; }
    catch (error) { return { error: { message: error.message, code: error.code } }; }
  };
  return { f, cid: f.cid, hero, npc, rpc, memoryRpc, errors, setupMs: Math.round(performance.now() - started) };
}

/** Ordered (schemaVersion 2) plans live in turns.astra_ordered_effects;
 * older single-effect plans stay in the checkpoint. */
function effectsOf(row) {
  const plan = row?.astra_ordered_effects ?? row?.checkpoint?.astraEffects;
  if (!plan) return { proposed: [], accepted: [], rejected: [] };
  const intents = plan.intents ?? plan.effects?.map((effect) => effect.intent) ?? [];
  const describe = (intent) => intent?.kind === "unsupported_optional"
    ? `unsupported_optional: ${intent.description}` : intent?.kind;
  return {
    proposed: intents.map(describe),
    accepted: (plan.indices ?? intents.map((_, index) => index)).map((index) => intents[index]?.kind),
    rejected: (plan.rejected ?? []).map(({ index, reason }) => ({ index, reason, effect: describe(intents[index]) })),
  };
}

function requestSummary(entries) {
  const sum = (key) => entries.some((entry) => entry[key] === null)
    ? null : entries.reduce((total, entry) => total + (entry[key] ?? 0), 0);
  return {
    modelRequests: {
      total: entries.length,
      plan: entries.filter((entry) => entry.stage === "plan").length,
      narrate: entries.filter((entry) => entry.stage === "narrate").length,
      other: entries.filter((entry) => !["plan", "narrate"].includes(entry.stage)).length,
    },
    tokens: { input: sum("inputTokens"), output: sum("outputTokens"),
      cached: sum("cachedInputTokens"), reasoning: sum("reasoningTokens"),
      estimated: entries.some((entry) => entry.tokensEstimated) },
    requestBytes: entries.map((entry) => entry.requestBytes),
    costUsd: entries.reduce((total, entry) => total + (entry.costUsd ?? 0), 0),
    calls: entries.map((entry) => ({ stage: entry.stage, httpStatus: entry.httpStatus ?? null,
      latencyMs: entry.latencyMs, inputTokens: entry.inputTokens, cachedInputTokens: entry.cachedInputTokens,
      cacheWriteTokens: entry.cacheWriteTokens ?? null, outputTokens: entry.outputTokens,
      reasoningTokens: entry.reasoningTokens, costUsd: entry.costUsd, estimated: entry.tokensEstimated })),
    scriptProblems: entries.flatMap((entry) => [
      ...(entry.scriptError ? [entry.scriptError] : []),
      ...entry.schemaViolations.map((violation) => `schema: ${violation}`)]),
  };
}

function pickCandidate(model, state, campaignId) {
  const candidates = model === undefined ? [] : Array.isArray(model) ? model : [model];
  for (const candidate of candidates) {
    const resolved = resolvePlaceholders(candidate, state, campaignId);
    if (resolved) return resolved;
  }
  return null;
}

/**
 * @param scenario parsed scenario JSON
 * @param options { transport, apiKey, write(record), verbose, runId }
 */
export async function runScenario(scenario, options) {
  const { transport, write, runId } = options;
  const live = transport.kind === "live";
  const requestLog = options.requestLog;
  const events = [];
  const restoreConsole = captureConsole(events, options.verbose);
  const scenarioStarted = performance.now();
  const campaign = await createCampaign();
  const { f, cid, hero } = campaign;
  const dice = diceSource(scenario.name);
  const provider = createAstraPrimaryProvider({ apiKey: options.apiKey, fetcher: transport.fetcher });
  const counters = { summaries: 0 };
  const summaries = { summarize: async (job) => {
    // Extractive stand-in for the separate memory.summary model: selects
    // every offered source. It is counted, never paid.
    counters.summaries++;
    return { usage: { model: "eval-extractive-summary", inputTokens: 0, outputTokens: 0, calls: 1, latencyMs: 0 },
      output: { schemaVersion: 1, selections: job.sources.map((source) => ({ sourceId: source.id, version: source.ref.version })) } };
  } };
  const steps = new Map();
  const inputs = new Map();
  const saves = new Map();
  const narrations = [];
  const results = [];
  let turnIndex = 0;
  let stopReason = null;
  try {
    steps.set("start", await snapshot(f, cid, hero));
    for (const step of scenario.steps) {
      if (live && step.probe) continue;
      if (transport.budget?.exhausted) { stopReason = "budget_reached"; break; }
      const before = await snapshot(f, cid, hero);
      const record = { type: step.say !== undefined || step.action === "replay" ? "turn" : "action",
        run: runId, scenario: scenario.name, step: step.id, probe: !!step.probe };
      let turn = null;
      if (step.say !== undefined || step.action === "replay") {
        turnIndex++;
        const timeline = await f.fence(cid);
        const store = createRpcTurnStore(f.owner, campaign.rpc, "gpt-6-astra", timeline, true,
          { astraResponseContract: "unified-v1" });
        const memory = createRpcMemoryStore(f.owner, campaign.memoryRpc, timeline);
        let input;
        if (step.action === "replay") {
          input = inputs.get(step.of);
          if (!input) throw Error(`replay of unknown step ${step.of}`);
        } else {
          const play = await store.readPlay(cid);
          input = { operationId: randomUUID(), campaignId: cid, timeline: play.timeline,
            expectedRevision: play.revision, mode: "game", input: step.say,
            companionId: null, listenerIds: [], mechanic: null };
          inputs.set(step.id, input);
        }
        const candidate = live ? null : pickCandidate(step.model, before, cid);
        if (!live && step.action !== "replay") transport.prepare(candidate);
        if (!live && step.action === "replay") transport.prepare(null);
        dice.force(step.dice);
        const deps = { store, memory, summaries, provider, random: dice.random };
        const pending = [];
        const after = (callback) => pending.push(callback);
        const firstRequest = requestLog.length;
        const started = performance.now();
        let result = null, firstStatus = null, resumes = 0, thrown = null;
        try {
          result = await runWithAstraMemoryMaintenance(store, memory, summaries, timeline,
            (observed) => runAstraTurn(input, { ...deps, store: observed }), after);
          firstStatus = result.status;
          while (result.status === "awaiting_confirmation" && resumes < MAX_CONTINUES) {
            resumes++;
            result = await runWithAstraMemoryMaintenance(store, memory, summaries, timeline,
              (observed) => resumeAstraTurn({ commandId: randomUUID(), campaignId: cid,
                operationId: input.operationId, timeline, action: "continue", checkId: null },
              { ...deps, store: observed }), after);
          }
        } catch (error) { thrown = error; }
        const durationMs = Math.round(performance.now() - started);
        // A retryable failure blocks the next turn until it is retried or
        // cancelled. The bench cancels it, as a player would, and records that.
        let cancelledAfterFailure = false;
        if (result?.status === "failed" && result.canRetry) {
          await resumeAstraTurn({ commandId: randomUUID(), campaignId: cid, operationId: input.operationId,
            timeline, action: "cancel", checkId: null }, deps);
          cancelledAfterFailure = true;
        }
        const summaryCallsBefore = counters.summaries;
        const maintenanceStarted = performance.now();
        for (const callback of pending) await callback();
        const maintenanceMs = Math.round(performance.now() - maintenanceStarted);
        const row = await f.one(`select status,failure,retryable,astra_response_mode,checkpoint,
          astra_ordered_effects,astra_diagnostic from rpg_private.turns where id=$1`, [input.operationId]);
        const requests = requestSummary(requestLog.slice(firstRequest));
        if (result?.status === "committed" && result.narration) narrations.push(result.narration);
        turn = {
          outcome: result?.status ?? "error",
          firstStatus,
          paused: firstStatus === "awaiting_confirmation",
          continues: resumes,
          errorCode: result?.failure ?? (thrown ? (thrown.code ?? "exception") : null),
          retryable: result?.canRetry ?? null,
          cancelledAfterFailure,
          exception: thrown ? String(thrown.message).slice(0, 200) : null,
          responseMode: row?.astra_response_mode ?? null,
          // Last recorded Astra stage (e.g. narration_safety = literal privacy guard).
          stageDiagnostic: row?.astra_diagnostic ?? null,
          durationMs,
          maintenanceMs,
          ...requests,
          summaryCalls: counters.summaries - summaryCallsBefore,
          contextBytes: events.filter((event) => event.event === "astra_context_size" &&
            event.operationId === input.operationId).map((event) => event.contextBytes),
          // Provider-side parse/validation reasons for rejected model output.
          planDiagnostics: events.filter((event) => event.event === "astra_plan_diagnostic" &&
            event.operationId === input.operationId).map(({ stage, phase, resultStatus, reasonCode }) =>
            ({ stage, phase, resultStatus, reasonCode })),
          effects: effectsOf(row),
          narration: result?.narration ?? null,
        };
        Object.assign(record, { turn: turnIndex, input: input.input, operationId: input.operationId,
          replayOf: step.action === "replay" ? step.of : undefined,
          scriptedNote: candidate?.note ?? (live ? undefined : step.action === "replay" ? "replay (no model answer expected)" : "no applicable scripted answer"),
          scriptedEffects: candidate?.plan?.filter((decision) => decision.type === "final")
            .flatMap((decision) => decision.final?.effects ?? []).map((effect) => effect.kind),
          ...turn, narration: turn.narration ? turn.narration.slice(0, 600) : null });
      } else if (step.action === "save") {
        const save = await f.saves(cid, "create", await f.command(cid, { kind: "manual", name: step.name }));
        saves.set(step.name, save.saveId);
        record.action = `save "${step.name}"`;
      } else if (step.action === "load") {
        const saveId = saves.get(step.save);
        if (!saveId) throw Error(`unknown save ${step.save}`);
        await f.saves(cid, "load", await f.command(cid, { saveId, label: `Eval load ${step.save}`, recovery: false }));
        record.action = `load "${step.save}"`;
      } else if (step.action === "characterModel") {
        // Owner correction through the existing rpg_character_model RPC.
        const model = resolvePlaceholders(step.model, before, cid);
        if (!model) throw Error("character model placeholders did not resolve");
        const fence = await f.fence(cid);
        const call = async (action, payload) => (await f.one(
          "select public.rpg_character_model($1,$2,$3,$4::jsonb,$5::jsonb) result",
          [f.owner, cid, action, JSON.stringify(payload), JSON.stringify(fence)])).result;
        const current = await call("read", { actorId: model.actorId });
        await call("correct", { requestId: randomUUID(), actorId: model.actorId,
          expectedRevision: current.revision, model });
        record.action = "owner Character Model correction";
      } else {
        throw Error(`unknown step ${JSON.stringify(step).slice(0, 120)}`);
      }
      const afterState = await snapshot(f, cid, hero);
      record.changes = diff(before, afterState);
      const checks = [];
      for (const { weakness, ...check } of step.expect ?? []) {
        const evaluated = await evaluateCheck(check, { f, campaignId: cid, before, after: afterState,
          steps, turn, narrations });
        checks.push(weakness ? { ...evaluated, weakness } : evaluated);
      }
      record.checks = checks;
      steps.set(step.id, afterState);
      results.push(record);
      write(record);
    }
  } finally {
    restoreConsole();
    await f.db.close();
  }
  const all = results.flatMap((record) => record.checks.map((check) => ({ ...check, probe: record.probe, step: record.step })));
  const core = all.filter((check) => !check.probe);
  const probes = all.filter((check) => check.probe);
  const summary = {
    type: "scenario", run: runId, scenario: scenario.name, title: scenario.title,
    turns: results.filter((record) => record.type === "turn").length,
    checksPassed: core.filter((check) => check.pass).length, checksTotal: core.length,
    probesPassed: probes.filter((check) => check.pass).length, probesTotal: probes.length,
    passed: core.length > 0 && core.every((check) => check.pass),
    // Known weaknesses recorded in docs/BASELINE.md: red until the stage that closes them.
    weaknesses: all.filter((check) => check.weakness).map((check) =>
      ({ id: check.weakness, label: check.label, step: check.step, pass: check.pass, detail: check.detail })),
    failedChecks: all.filter((check) => !check.pass).map((check) =>
      `${check.probe ? "[probe] " : ""}${check.step}: ${check.label} — ${check.detail}`),
    harnessErrors: results.flatMap((record) => (record.scriptProblems ?? []).map((problem) => `${record.step}: ${problem}`)),
    rpcErrors: campaign.errors.map((error) => `${error.action}: ${error.code ?? ""} ${error.message}`).slice(0, 20),
    setupMs: campaign.setupMs,
    totalMs: Math.round(performance.now() - scenarioStarted),
    stopReason,
  };
  write(summary);
  return summary;
}
