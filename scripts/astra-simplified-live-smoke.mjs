// Explicitly authorized synthetic text smoke only. Never imports an owner DB,
// environment file, UI session or media provider. Importing does not dispatch.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";
import { simplifiedFixture } from "../tests/astra-simplified-fixture.mjs";
import { diagnosticState, diagnosticFetcher, diagnosticProvider,
  diagnosticStore, privateSnapshot } from "./astra-primary-production-smoke.mjs";

export const LIVE_SMOKE_LIMITS = Object.freeze({
  maxRequests: 4, maxSpendUsd: 5, maxInputUpperBytes: 64000,
  maxOutputTokens: 4096, inputUsdPerMillion: 12.5, outputUsdPerMillion: 50,
});
const usd = (input, output, rate = LIVE_SMOKE_LIMITS.inputUsdPerMillion) =>
  (input * rate + output * LIVE_SMOKE_LIMITS.outputUsdPerMillion) / 1_000_000;
const round = (value) => Number(value.toFixed(6));
const errorCode = (error) => typeof error?.code === "string" ? error.code :
  typeof error?.message === "string" && /^smoke_[a-z_]+$/.test(error.message)
    ? error.message : error instanceof Error ? error.name : "unknown";

export function smokeBudget() {
  return { calls: 0, reservedUsd: 0, requests: [] };
}

/** Reserve before dispatch, retain the entire upper bound even after errors.
 * UTF-8 bytes plus framing conservatively upper-bound input token count. */
export function boundedSmokeFetcher(budget, nextFetch) {
  return async (url, init) => {
    if (url !== "https://api.openai.com/v1/responses") throw Error("smoke_endpoint_not_allowed");
    if (budget.calls >= LIVE_SMOKE_LIMITS.maxRequests) throw Error("smoke_request_cap");
    const serialized = String(init?.body ?? "");
    let body;
    try { body = JSON.parse(serialized); } catch { throw Error("smoke_request_invalid"); }
    if (body.model !== "gpt-6-astra" || body.reasoning?.effort !== "high" ||
      body.service_tier !== "default" || body.stream === true)
      throw Error("smoke_configuration_mismatch");
    const inputUpperBytes = Buffer.byteLength(serialized, "utf8") + 2048;
    if (inputUpperBytes > LIVE_SMOKE_LIMITS.maxInputUpperBytes)
      throw Error("smoke_input_cap");
    if (!Number.isSafeInteger(body.max_output_tokens) || body.max_output_tokens < 1 ||
      body.max_output_tokens > LIVE_SMOKE_LIMITS.maxOutputTokens)
      throw Error("smoke_output_cap");
    const reservation = usd(inputUpperBytes, body.max_output_tokens);
    if (budget.reservedUsd + reservation > LIVE_SMOKE_LIMITS.maxSpendUsd)
      throw Error("smoke_spend_cap");
    budget.calls++;
    budget.reservedUsd += reservation;
    const entry = { request: budget.calls, requestBytes: Buffer.byteLength(serialized),
      inputUpperBytes, maxOutputTokens: body.max_output_tokens,
      reservationUsd: round(reservation), httpStatus: null, completeLatencyMs: null,
      error: null };
    budget.requests.push(entry);
    const started = performance.now();
    try {
      const response = await nextFetch(url, init);
      entry.httpStatus = response.status;
      return response;
    } catch (error) {
      entry.error = errorCode(error);
      throw error;
    } finally { entry.completeLatencyMs = round(performance.now() - started); }
  };
}

export function scrubSmokeReport(report, secret = "") {
  let serialized = JSON.stringify(report);
  if (secret) serialized = serialized.replaceAll(secret, "[REDACTED]");
  serialized = serialized.replace(/Bearer\s+[^\s,;"\\]+/gi, "Bearer [REDACTED]")
    .replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, "[REDACTED]");
  return JSON.parse(serialized);
}

async function productionProvider(options) {
  const hook = registerHooks({ resolve(specifier, context, nextResolve) {
    return specifier === "server-only"
      ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
      : nextResolve(specifier, context);
  } });
  try {
    const { createAstraPrimaryProvider } = await import("../src/lib/server/dm/astra-primary-provider.ts");
    return createAstraPrimaryProvider(options);
  } finally { hook.deregister(); }
}

/** All paid work is inside the injected production fetcher. No semantic retry,
 * output repair or fixture change occurs after the first dispatch. */
export async function runSimplifiedLiveSmoke({ apiKey, fetcher = fetch,
  confirmation, outputPath = null, candidateSha = null } = {}) {
  if (confirmation !== "authorize-four-text-requests-five-usd")
    throw Error("smoke_explicit_confirmation_required");
  if (typeof apiKey !== "string" || !apiKey.trim()) throw Error("smoke_key_missing");
  const budget = smokeBudget();
  const diagnostics = diagnosticState(apiKey, { maxRequests: 4, maxSpendUsd: 5 });
  const attempts = [], parseDiagnostics = [], turns = [];
  const h = await simplifiedFixture({ publicSceneOnly: true, npcKind: "npc",
    openingAddendum: "Nera publicly offers Ari one ordinary loaf of bread as a gift: 'You may have a loaf when you are ready.'" });
  let outcome = "not-started", stoppedReason = null;
  const started = performance.now();
  try {
    // Author the complete disposable scene before any request. There really is
    // a meaningful, harmless skill uncertainty; no rest supplies are available.
    const location = await h.f.one("select name,description,status,revision from public.rpg_locations where id=$1", [h.home]);
    await h.f.mutation("location.save", h.f.cid, { id: h.home, name: location.name,
      description: "The ordinary village square borders a shallow millrace. A narrow loose plank offers an unstable crossing; slipping means wet clothes in the shallow water, not unrecorded injury.",
      status: location.status }, location.revision);
    await h.f.one("update public.rpg_entities set hp=4 where id=$1", [h.hero]);
    await h.f.one("update public.rpg_items set quantity=0 where id=$1", [h.supplies]);
    const initialState = await h.snapshot();
    const actual = await productionProvider({ apiKey,
      fetcher: boundedSmokeFetcher(budget, diagnosticFetcher(diagnostics, fetcher)),
      attemptObserver: (attempt) => { if (attempts.length < 12) attempts.push(attempt); },
      planDiagnosticObserver: (diagnostic) => { if (parseDiagnostics.length < 12) parseDiagnostics.push(diagnostic); },
    });
    let narratorCalls = 0;
    const provider = diagnosticProvider(diagnostics, { ...actual,
      narrate: async (...args) => { narratorCalls++; return actual.narrate(...args); } });
    Object.assign(h.store, diagnosticStore(diagnostics, { ...h.store }));
    const scenarios = [
      { id: "ordinary-conversation", input: "Nera, how has your morning been? I listen to her answer." },
      { id: "movement-search-and-skill", input: "I search the loose boards beside the square's millrace for a safe crossing, then carefully try the unstable narrow plank. Let a skill check decide the meaningful risk of slipping into the shallow water." },
      { id: "safe-optional-mundane-gift", input: "Nera, thank you; I accept the ordinary loaf of bread you offered me. I put it in my pack and ask how I can help you later." },
    ];
    for (const scenario of scenarios) {
      if (budget.calls >= LIVE_SMOKE_LIMITS.maxRequests) {
        outcome = "stopped"; stoppedReason = "request_cap_before_next_scenario"; break;
      }
      const before = await h.snapshot();
      const callStart = budget.calls;
      const narratorStart = narratorCalls;
      const turnStart = performance.now();
      const operationId = randomUUID();
      let result;
      try { result = await h.turn(scenario.input, provider, { operationId }); }
      catch (error) {
        turns.push({ scenario: scenario.id, operationId, input: scenario.input,
          status: "threw", failure: errorCode(error), providerRequests: budget.calls - callStart,
          totalLatencyMs: round(performance.now() - turnStart), before, after: await h.snapshot(),
          privateCheckpoint: await privateSnapshot(h.f, h.f.cid, operationId), rejectedEffects: [] });
        outcome = "stopped"; stoppedReason = "runtime_threw"; break;
      }
      const after = await h.snapshot();
      const privateState = await privateSnapshot(h.f, h.f.cid, result.input.operationId);
      const saved = await h.f.one("select astra_ordered_effects plan,astra_response_mode response_mode from rpg_private.turns where id=$1", [result.input.operationId]);
      const effects = saved.plan;
      turns.push({ scenario: scenario.id, operationId: result.input.operationId,
        input: scenario.input, status: result.result.status, failure: result.result.failure,
        canRetry: result.result.canRetry, providerRequests: budget.calls - callStart,
        responseMode: saved.response_mode, narratorCalls: narratorCalls - narratorStart,
        totalLatencyMs: round(performance.now() - turnStart), before, after,
        narration: result.result.narration, checks: result.result.checks,
        effectIndexes: effects?.indices ?? [], rejectedEffects: effects?.rejected ?? [],
        privateCheckpoint: privateState });
      if (result.result.status !== "committed") {
        outcome = "stopped";
        stoppedReason = parseDiagnostics.some((row) => row.resultStatus !== "success")
          ? "provider_parse_or_contract_failure" : `turn_${result.result.failure ?? result.result.status}`;
        break;
      }
      if (saved.response_mode !== "public-unified" || narratorCalls !== narratorStart) {
        outcome = "stopped"; stoppedReason = "unexpected_private_response_route"; break;
      }
      // No next scenario can start from a false recovery or tactical movement.
      if (after.state.hp !== before.state.hp || after.rests !== before.rests ||
        after.state.location !== before.state.location) {
        outcome = "stopped"; stoppedReason = "unexpected_synthetic_state_transition"; break;
      }
      outcome = "completed";
    }
    const finalState = await h.snapshot();
    const report = scrubSmokeReport({ schemaVersion: 1, syntheticOnly: true,
      candidateSha, model: "gpt-6-astra", reasoning: "high", serviceTier: "default",
      outcome, stoppedReason, limits: LIVE_SMOKE_LIMITS,
      campaignId: h.f.cid, heroId: h.hero, initialState, finalState,
      requests: budget.calls, reservedCeilingUsd: round(budget.reservedUsd),
      estimatedStandardSpendUsd: diagnostics.usageKnown ? round(usd(diagnostics.inputTokens, diagnostics.outputTokens, 10)) : null,
      conservativeSpendUsd: diagnostics.usageKnown ? round(usd(diagnostics.inputTokens, diagnostics.outputTokens)) : null,
      usageKnown: diagnostics.usageKnown, inputTokens: diagnostics.inputTokens,
      outputTokens: diagnostics.outputTokens,
      reasoningTokens: diagnostics.responses.reduce((n, row) => n + (row.usage.reasoningTokens ?? 0), 0),
      cachedInputTokens: diagnostics.responses.reduce((n, row) => n + (row.usage.cachedTokens ?? 0), 0),
      totalLatencyMs: round(performance.now() - started), requestBudget: budget.requests,
      attempts, responses: diagnostics.responses.map((response, index) => ({ ...response,
        schemaParseSucceeded: parseDiagnostics[index]?.resultStatus === "success" })),
      parsedDecisions: diagnostics.parsedDecisions,
      parseDiagnostics, orderedBoundaries: diagnostics.events,
      sqlErrors: [...diagnostics.sqlErrors, ...h.errors.slice(0, 12).map((entry) => ({
        action: String(entry.action ?? "").slice(0, 100),
        error: { code: String(entry.code ?? "").slice(0, 100),
          message: String(entry.message ?? "").slice(0, 4000),
          path: String(entry.where ?? "").slice(0, 4000) } }))],
      turns, toolContinuationCovered: turns.some((turn) => turn.privateCheckpoint?.toolReceipts?.some((receipt) => receipt.call.kind === "skill") && turn.status === "committed"),
      rejectedOptionalEffectCovered: turns.some((turn) => turn.rejectedEffects.length > 0 && turn.status === "committed"),
      acceptedDurableEffectCovered: turns.some((turn) => turn.effectIndexes.length > 0 && turn.status === "committed"),
      narratorCalls,
      summaryProviderCalls: h.summaryCalls(), mediaProviderCalls: 0, ownerDataUsed: false,
    }, apiKey);
    if (outputPath) {
      await mkdir(dirname(resolve(outputPath)), { recursive: true });
      await writeFile(resolve(outputPath), JSON.stringify(report, null, 2) + "\n", "utf8");
    }
    return report;
  } finally { await h.f.db.close(); }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  if (process.env.ASTRA_SIMPLIFIED_LIVE_SMOKE !== "yes")
    throw Error("smoke_explicit_opt_in_required");
  const report = await runSimplifiedLiveSmoke({ apiKey: process.env.OPENAI_API_KEY,
    confirmation: "authorize-four-text-requests-five-usd",
    outputPath: process.env.ASTRA_SIMPLIFIED_SMOKE_REPORT ?? "test-results/p0-runtime/live-smoke.json",
    candidateSha: process.env.ASTRA_SIMPLIFIED_CANDIDATE_SHA ?? null });
  process.stdout.write(JSON.stringify({ outcome: report.outcome, stoppedReason: report.stoppedReason,
    requests: report.requests, estimatedStandardSpendUsd: report.estimatedStandardSpendUsd,
    reservedCeilingUsd: report.reservedCeilingUsd,
    reportPath: process.env.ASTRA_SIMPLIFIED_SMOKE_REPORT ?? "test-results/p0-runtime/live-smoke.json" }) + "\n");
  if (report.outcome !== "completed") process.exitCode = 1;
}
