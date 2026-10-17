// One turn of the bake-off on a loop campaign: the variant's writer (and
// bookkeeper) models behind the money guard, the real turn path (single loop
// or two-pass), and a research record in the shape of the loop bench's turn
// records plus the split's own timings and the writer's ledger.
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loopCampaign } from "../../../../tests/dm-loop-fixture.mjs";
import { runDmLoopTurn, resumeDmLoopTurn, thinkingAllowance } from "../../../../src/lib/gameplay/dm-loop/loop.ts";
import { runTwoPassTurn, resumeTwoPassTurn, splitLedger, bookkeeperStart } from "../../../../src/lib/gameplay/dm-loop/two-pass/index.ts";
import { dmLoopLimits } from "../../../../src/lib/gameplay/dm-loop/limits.ts";
import { dmModels, dmRequestReservation } from "../../../../src/lib/model-runtime/dm-models.ts";
import { snapshot, diff, evaluateCheck } from "../../lib/state.mjs";
import { naturalness as naturalnessOf } from "../../lib/naturalness.mjs";
import { createLoopBudget } from "../../lib/loop-harness.mjs";
import { MODELS, SCENARIO } from "./variants.mjs";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only"
    ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
    : nextResolve(specifier, context);
} });
const { createDmModel } = await import("../../../../src/lib/server/dm/model/index.ts");
hook.deregister();

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(here, "..", "..", "..", "..");
export const STATES_DIR = join(ROOT, "scripts", "eval", "out", "dmarch-states");
export const RUNS_DIR = join(ROOT, "docs", "runs");
const MAX_CONTINUES = 8;
/** The worst case of one request for the guard: the narration allowance plus the deepest thinking allowance. */
const RESERVE_OUTPUT_TOKENS = dmLoopLimits.maxOutputTokens + thinkingAllowance("xhigh");

export async function loadScenario(name = SCENARIO) {
  const file = join(ROOT, "scripts", "eval", "scenarios", `${name}.json`);
  return { name, ...JSON.parse(await readFile(file, "utf8")) };
}

export function stamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
}

/** A fresh loop campaign from the scenario's fixture, the craft activated, the
 * settings on the loop with Opus (the SQL-valid choice; the bench pins the variant's models over it). */
export async function openCampaign(scenario) {
  const c = await loopCampaign({ language: scenario.language, example: scenario.fixture, startMinutes: scenario.startMinutes });
  await c.activateStage4Craft();
  await c.settings.save({ expectedRevision: (await c.settings.read()).revision, runtime: "dm-loop-v1",
    dmTurn: { providerId: MODELS.opus.providerId, modelId: MODELS.opus.modelId, reasoning: "high" } });
  return c;
}

export { createLoopBudget };

/** A live adapter behind the money guard (the loop bench's own rule: the worst
 * case of every request is reserved before dispatch; a request that could
 * cross the cap is not sent). */
function guardedModel(selection, budget, apiKey, log) {
  const spec = dmModels[`${selection.providerId}/${selection.modelId}`];
  if (!spec) throw new Error(`unknown model ${selection.providerId}/${selection.modelId}`);
  const reservations = new Map();
  const fetcher = async (url, init) => {
    const bytes = Buffer.byteLength(String(init?.body ?? ""), "utf8");
    const reservation = dmRequestReservation(spec, bytes, RESERVE_OUTPUT_TOKENS);
    if (budget.spentUsd + budget.reservedUsd + reservation > budget.limitUsd) {
      budget.exhausted = true;
      log.push({ event: "budget_reached", model: selection.modelId, requestBytes: bytes, reservationUsd: reservation });
      throw Object.assign(new Error("eval_budget_reached"), { name: "EvalBudget" });
    }
    budget.reservedUsd += reservation;
    budget.requests++;
    const started = performance.now();
    try {
      const response = await fetch(url, init);
      log.push({ event: "http", model: selection.modelId, status: response.status, requestBytes: bytes, latencyMs: Math.round(performance.now() - started) });
      if (response.ok) reservations.set(budget.requests, reservation);
      else budget.reservedUsd -= reservation;
      return response;
    } catch (error) {
      budget.reservedUsd -= reservation;
      throw error;
    }
  };
  const model = createDmModel(selection, { apiKey, fetcher, maxRetries: 1 });
  const settle = (costUsd) => {
    for (const [key, reservation] of reservations) { budget.reservedUsd -= reservation; reservations.delete(key); }
    budget.spentUsd += costUsd;
    if (budget.spentUsd >= budget.limitUsd) budget.exhausted = true;
  };
  const abandon = () => {
    for (const [key, reservation] of reservations) { budget.reservedUsd -= reservation; budget.spentUsd += reservation; reservations.delete(key); }
    if (budget.spentUsd >= budget.limitUsd) budget.exhausted = true;
  };
  return { model, settle, abandon };
}

/** A dry stand-in per role (no provider): the writer narrates and closes with a
 * ledger; the bookkeeper records time and finishes. The dry run proves the
 * harness, the states and the records, never the models. */
export function dryModel(selection, role) {
  let calls = 0;
  async function* stream(request) {
    const last = [...request.messages].reverse().find((m) => m.role === "user");
    const said = (last?.text ?? "").replace(/\s+/g, " ").slice(0, 120);
    const hasFinish = request.toolset?.tools.some((tool) => tool.name === "finish_turn") ?? false;
    const text = role === "writer" && !hasFinish
      ? `Сухой прогон. Ты сказал: «${said}». Марта вытирает руки о передник и ждёт.\n\n<ledger>\nвремя — 10 минут, герой на причале\nсцена — conversation; в фокусе Марта; напряжение дальше: calm\n</ledger>`
      : `Сухой прогон. Ты сказал: «${said}». Утро на причале тянется дальше.`;
    for (let at = 0; at < text.length; at += 24) yield { type: "text_delta", text: text.slice(at, at + 24) };
    const toolCalls = hasFinish ? [
      { id: `dry_${++calls}`, name: "advance_time", arguments: JSON.stringify({ minutes: 10, reason: "сухой прогон" }) },
      { id: `dry_${++calls}`, name: "finish_turn", arguments: JSON.stringify({ sceneKinds: ["conversation"], spotlight: [], playerMoment: false, nextTension: "calm" }) },
    ] : [];
    for (const call of toolCalls) yield { type: "tool_call", ...call };
    yield { type: "usage", usage: { inputTokens: 1000, outputTokens: Math.ceil(text.length / 4), cacheReadTokens: 0, cacheWriteTokens: 0, reasoningTokens: 0 } };
    yield { type: "stop", reason: toolCalls.length ? "tool_use" : "end", providerReason: "dry", native: { providerId: selection.providerId, modelId: selection.modelId, items: [] } };
  }
  return { providerId: selection.providerId, modelId: selection.modelId, stream };
}

function sum(entries, key) {
  return entries.reduce((total, entry) => total + (entry[key] ?? 0), 0);
}

function callsByRequest(usage, receipts) {
  let offset = 0;
  return usage.map((entry) => {
    const own = receipts.slice(offset, offset + (entry.toolCalls ?? 0));
    offset += entry.toolCalls ?? 0;
    return own.map((r) => ({ name: r.call.name, ok: r.result.ok }));
  });
}

function phaseTotals(usage) {
  return { requests: usage.length, inputTokens: sum(usage, "inputTokens"), outputTokens: sum(usage, "outputTokens"),
    cacheReadTokens: sum(usage, "cacheReadTokens"), cacheWriteTokens: sum(usage, "cacheWriteTokens"),
    cacheWrite1hTokens: sum(usage, "cacheWrite1hTokens"), costUsd: Number(sum(usage, "costUsd").toFixed(5)),
    latencyMs: sum(usage, "latencyMs") };
}

/**
 * Play one scenario step on the campaign `c` with the variant.
 * @param options { live, apiKeys: {anthropic, openai}, budget, runId, scene: bool, transport: [] }
 */
export async function playTurn(c, scenario, step, variantSpec, options) {
  const { live, budget, runId } = options;
  const transport = options.transport ?? [];
  const key = (selection) => options.apiKeys?.[selection.providerId];
  const writerLive = live ? guardedModel(variantSpec.writer, budget, key(variantSpec.writer), transport) : null;
  const bookkeeperLive = live && variantSpec.bookkeeper ? guardedModel(variantSpec.bookkeeper, budget, key(variantSpec.bookkeeper), transport) : null;
  const writerModel = live ? writerLive.model : dryModel(variantSpec.writer, "writer");
  const bookkeeperModel = variantSpec.bookkeeper ? (live ? bookkeeperLive.model : dryModel(variantSpec.bookkeeper, "bookkeeper")) : null;
  const settleFor = (modelId, costUsd) => {
    if (!live) return;
    if (bookkeeperLive && modelId === variantSpec.bookkeeper.modelId && modelId !== variantSpec.writer.modelId) bookkeeperLive.settle(costUsd);
    else writerLive.settle(costUsd);
  };
  const before = await snapshot(c.f, c.cid, c.hero);
  const companion = step.companion ? before.entities.find((row) => new RegExp(step.companion, "iu").test(row.name) && row.kind === "companion") : null;
  const input = await c.input(step.say, companion ? "companion" : "game", companion?.id ?? null, []);
  c.forceDice(step.dice ?? []);
  const observations = [];
  let firstWordAt = null;
  const started = performance.now();
  const base = await c.deps(writerModel, { observe: (observation) => {
    observations.push(observation);
    if (observation.type === "live" && observation.event.type === "text" && observation.event.text.trim() && firstWordAt === null) firstWordAt = performance.now();
    if (observation.type === "request_finished") settleFor(observation.usage.modelId, observation.usage.costUsd);
    if (live && observation.type === "failure") { writerLive.abandon(); bookkeeperLive?.abandon(); }
  } });
  const pinned = base.pin;
  const deps = { ...base,
    pin: async (claim) => ({ ...(await pinned(claim)), providerId: variantSpec.writer.providerId, modelId: variantSpec.writer.modelId, effort: variantSpec.effort }),
    ...(variantSpec.bookkeeper ? { bookkeeper: { providerId: variantSpec.bookkeeper.providerId, modelId: variantSpec.bookkeeper.modelId,
      effort: variantSpec.bookkeeper.effort, model: bookkeeperModel } } : {}) };
  const run = variantSpec.runtime === "two-pass" ? runTwoPassTurn : runDmLoopTurn;
  const resume = variantSpec.runtime === "two-pass" ? resumeTwoPassTurn : resumeDmLoopTurn;
  let result = null, firstStatus = null, resumes = 0, thrown = null;
  try {
    result = await run(input, deps);
    firstStatus = result.status;
    while (result.status === "awaiting_confirmation" && resumes < MAX_CONTINUES) {
      resumes++;
      result = await resume({ commandId: randomUUID(), campaignId: c.cid, operationId: input.operationId,
        timeline: input.timeline, action: "continue", checkId: null }, deps);
    }
  } catch (error) { thrown = error; }
  const durationMs = Math.round(performance.now() - started);
  let cancelledAfterFailure = false;
  if (result?.status === "failed" && result.canRetry) {
    await resume({ commandId: randomUUID(), campaignId: c.cid, operationId: input.operationId,
      timeline: input.timeline, action: "cancel", checkId: null }, deps);
    cancelledAfterFailure = true;
  }
  const row = await c.row(input.operationId);
  const loop = row?.checkpoint?.dmLoop ?? null;
  const usage = observations.filter((o) => o.type === "request_finished").map((o) => o.usage);
  const receipts = loop?.receipts ?? [];
  const requestStarts = observations.filter((o) => o.type === "request_started");
  const twoPass = observations.filter((o) => o.type === "two_pass");
  const isBookkeeper = (entry) => !!variantSpec.bookkeeper && entry.modelId === variantSpec.bookkeeper.modelId && entry.modelId !== variantSpec.writer.modelId;
  const writerUsage = usage.filter((entry) => !isBookkeeper(entry));
  const bookkeeperUsage = usage.filter((entry) => isBookkeeper(entry));
  const transcript = loop?.transcript ?? [];
  const markerAt = bookkeeperStart(transcript);
  const writerText = (markerAt >= 0 ? transcript.slice(0, markerAt) : transcript).filter((m) => m.role === "assistant").map((m) => m.text).join("\n");
  const ledger = variantSpec.runtime === "two-pass" ? splitLedger(writerText) : null;
  const after = await snapshot(c.f, c.cid, c.hero);
  const narration = result?.narration ?? null;
  const turn = {
    type: "turn", run: runId, variant: variantSpec.id, runtime: variantSpec.runtime,
    writer: `${variantSpec.writer.providerId}/${variantSpec.writer.modelId}`,
    bookkeeper: variantSpec.bookkeeper ? `${variantSpec.bookkeeper.providerId}/${variantSpec.bookkeeper.modelId}@${variantSpec.bookkeeper.effort}` : null,
    scenario: scenario.name, step: step.id, scene: !!options.scene, input: input.input, operationId: input.operationId,
    outcome: result?.status ?? "error", firstStatus, paused: firstStatus === "awaiting_confirmation", continues: resumes,
    errorCode: result?.failure ?? (thrown ? (thrown.code ?? "exception") : null), retryable: result?.canRetry ?? null, cancelledAfterFailure,
    exception: thrown ? String(thrown.message).slice(0, 200) : null,
    failure: observations.filter((o) => o.type === "failure").map((o) => ({ code: o.code, message: o.message })),
    durationMs,
    firstWordMs: firstWordAt === null ? null : Math.round(firstWordAt - started),
    loopFirstWordMs: usage.find((entry) => entry.firstWordMs != null)?.firstWordMs ?? null,
    textDoneMs: variantSpec.runtime === "two-pass" ? twoPass.find((o) => o.event === "writer_finished")?.atMs ?? null : (result?.status === "committed" ? durationMs : null),
    recordsDoneMs: result?.status === "committed" ? durationMs : null,
    requests: usage.length,
    phases: { writer: phaseTotals(writerUsage), bookkeeper: variantSpec.bookkeeper ? phaseTotals(bookkeeperUsage) : null },
    tokens: { input: sum(usage, "inputTokens"), output: sum(usage, "outputTokens"), cached: sum(usage, "cacheReadTokens"),
      cacheWrite: sum(usage, "cacheWriteTokens"), cacheWrite1h: sum(usage, "cacheWrite1hTokens"), reasoning: sum(usage, "reasoningTokens"), estimated: !live },
    cacheReadShare: sum(usage, "inputTokens") ? Number((sum(usage, "cacheReadTokens") / sum(usage, "inputTokens")).toFixed(3)) : null,
    costUsd: live ? Number(sum(usage, "costUsd").toFixed(5)) : 0,
    requestBytes: requestStarts.map((o) => o.requestBytes),
    calls: usage.map((entry, index) => ({ phase: isBookkeeper(entry) ? "bookkeeper" : "writer", modelId: entry.modelId, effort: entry.effort,
      latencyMs: entry.latencyMs, firstTextMs: entry.firstTextMs, inputTokens: entry.inputTokens, cachedInputTokens: entry.cacheReadTokens,
      cacheWriteTokens: entry.cacheWriteTokens, cacheWrite1hTokens: entry.cacheWrite1hTokens ?? 0, outputTokens: entry.outputTokens,
      costUsd: entry.costUsd, toolCalls: entry.toolCalls, tools: callsByRequest(usage, receipts)[index] })),
    effects: { proposed: receipts.map((r) => r.call.name), accepted: receipts.filter((r) => r.result.ok).map((r) => r.call.name),
      rejected: receipts.filter((r) => !r.result.ok).map((r) => ({ name: r.call.name, reason: r.result.reason })),
      summaries: receipts.filter((r) => r.result.ok).map((r) => r.result.summary),
      player: receipts.filter((r) => r.result.ok && r.result.player).map((r) => r.result.player),
      duePlans: receipts.reduce((total, r) => total + (r.result.ok && Array.isArray(r.result.value?.duePlans) ? r.result.value.duePlans.length : 0), 0),
      rolls: receipts.filter((r) => r.result.ok && r.call.name === "roll").map((r) => ({ actor: r.result.value.actor, reason: r.result.value.reason,
        modifier: r.result.value.modifier, bonuses: r.result.value.bonuses ?? [], advantage: r.result.value.advantage ?? "normal",
        dc: r.result.value.dc ?? null, difficulty: r.result.value.difficulty ?? null, natural: r.result.value.natural ?? null, visibility: r.result.value.visibility })) },
    layers: (requestStarts[0]?.layers ?? []).map((layer, index) => ({ index, bytes: layer.bytes, tokens: layer.tokens, hash: layer.hash })),
    receipts, diagnostics: loop?.diagnostics ?? [], meta: loop?.meta ?? null, pin: loop?.pin ?? null,
    twoPass: twoPass.length ? twoPass.map((o) => ({ event: o.event, atMs: o.atMs, requests: o.requests, ledgerFound: o.ledgerFound, ledgerChars: o.ledgerChars, narrationChars: o.narrationChars, calls: o.calls, rejected: o.rejected, finished: o.finished })) : null,
    ledger: ledger ? { found: ledger.found, text: ledger.ledger } : null,
    narration, checks: [],
    worldMinutesBefore: before.worldMinutes ?? null, worldMinutesAfter: after.worldMinutes ?? null,
    partyNames: after.entities.filter((row) => row.id === c.hero || row.kind === "companion").map((row) => row.name),
    changes: diff(before, after),
    leaks: (loop?.diagnostics ?? []).filter((d) => d.kind === "suspected_leak").map((d) => d.detail),
    selfDisclosures: (loop?.diagnostics ?? []).filter((d) => d.kind === "self_disclosure").map((d) => d.detail),
    naturalness: narration ? naturalnessOf([narration], [{ input: input.input, narration }]) : null,
    budgetReached: transport.some((t) => t.event === "budget_reached"),
    rpcErrors: c.errors.splice(0).map((error) => `${error.action}: ${error.code ?? ""} ${error.message}`).slice(0, 10),
  };
  const checks = [];
  for (const expectation of step.expect ?? []) {
    if (expectation.scripted) continue;
    const check = Object.fromEntries(Object.entries(expectation).filter(([key]) => key !== "weakness" && key !== "scripted"));
    checks.push(await evaluateCheck(check, { f: c.f, campaignId: c.cid, before, after, steps: new Map(), turn, narrations: narration ? [narration] : [] }));
  }
  turn.checks = checks;
  transport.splice(0, transport.length);
  return turn;
}
