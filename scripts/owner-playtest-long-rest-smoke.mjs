// One explicit, disposable long-rest acceptance turn. Never connects to owner DB.
import { registerHooks } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { createOwnerLongRestWorld } from "../tests/owner-long-rest-fixture.mjs";
import { syntheticSummaries } from "../tests/astra-iris-fixture.mjs";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn } from "../src/lib/gameplay/astra-primary.ts";
import { diagnosticState, diagnosticFetcher, diagnosticProvider, privateSnapshot }
  from "./astra-primary-production-smoke.mjs";

const estimatedSpend = (input, output) => (input * 10 + output * 50) / 1_000_000;

export function longRestTextGate(realFetch, state) {
  const seen = new Set();
  const observed = diagnosticFetcher(state, realFetch);
  return async (url, init) => {
    const body = JSON.parse(String(init?.body ?? "{}"));
    const stage = body.text?.format?.name;
    if (String(url) !== "https://api.openai.com/v1/responses" ||
        !["dm_plan", "dm_narrate"].includes(stage) ||
        body.model !== "gpt-6-astra" || body.store !== false ||
        body.service_tier !== "default" || body.text?.format?.strict !== true ||
        body.reasoning?.effort !== (stage === "dm_plan" ? "high" : "medium") ||
        body.tools || body.audio || body.image || body.video ||
        body.input?.some?.((m) => m.content?.some?.((p) => p.type !== "input_text")))
      throw Error("long_rest_text_route_rejected");
    if (seen.has(stage) || (stage === "dm_narrate" && !seen.has("dm_plan")))
      throw Error("single_long_rest_request_per_stage");
    seen.add(stage);
    const previousResponses = state.responses.length;
    const previousRequests = state.requests;
    try {
      const response = await observed(url, init);
      if (state.responses.length === previousResponses) state.usageKnown = false;
      return response;
    } catch (error) {
      if (state.requests > previousRequests) state.usageKnown = false;
      throw error;
    }
  };
}

export async function runLongRestSmoke({ live = false,
  apiKey = process.env.OPENAI_API_KEY, realFetch = fetch,
  worldFactory = createOwnerLongRestWorld } = {}) {
  if (!live) throw Error("explicit_live_flag_required");
  if (typeof apiKey !== "string" || !apiKey.trim()) throw Error("server_key_required");
  const diagnostics = diagnosticState(apiKey, { maxRequests: 2, maxSpendUsd: 2 });
  const report = { scope: "one-fresh-disposable-PGlite-long-rest-turn",
    input: "i take long rest", maxRequests: 2, maxEstimatedSpendUsd: 2,
    status: "not_started", acceptance: "not_evaluated", mediaRequests: 0,
    before: null, after: null, replayProviderCalls: 0, replayUnchanged: null,
    diagnostics };
  let world;
  try {
    world = await worldFactory();
    report.before = await world.readState();
    const runtime = world.f.runtime.bind(world.f);
    world.f.runtime = async (...args) => {
      const action = args[1];
      diagnostics.events.push({ method: `runtime.${action}`, phase: "entered" });
      try {
        const value = await runtime(...args);
        diagnostics.events.push({ method: `runtime.${action}`, phase: "returned" });
        return value;
      } catch (error) {
        // Disposable SQL only. Never retain SQL statements, payloads or headers.
        diagnostics.sqlErrors.push({ action, code: String(error.code ?? "").slice(0, 80),
          message: String(error.message ?? "").replaceAll(apiKey, "[REDACTED]").slice(0, 512),
          where: String(error.where ?? "").replaceAll(apiKey, "[REDACTED]").slice(0, 2000) });
        throw error;
      }
    };
    const hook = registerHooks({ resolve(specifier, context, nextResolve) {
      return specifier === "server-only"
        ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
        : nextResolve(specifier, context);
    } });
    let createAstraPrimaryProvider;
    try { ({ createAstraPrimaryProvider } = await import(
      "../src/lib/server/dm/astra-primary-provider.ts")); }
    finally { hook.deregister(); }
    const provider = diagnosticProvider(diagnostics, createAstraPrimaryProvider({
      apiKey, fetcher: longRestTextGate(realFetch, diagnostics),
    }));
    const first = await world.runTurn(provider);
    report.status = first.result.status;
    report.failure = first.result.failure;
    report.operationId = first.input.operationId;
    report.after = await world.readState();
    diagnostics.privateSnapshot = await privateSnapshot(world.f, world.f.cid, first.input.operationId);
    const vegetableQuantity = (state) => state.items.filter((item) =>
      item.name === "vegetables for a meal").reduce((sum, item) => sum + item.quantity, 0);
    report.delta = {
      provisions: vegetableQuantity(report.after) - vegetableQuantity(report.before),
      worldMinutes: report.after.world_minutes - report.before.world_minutes,
      hp: report.after.hp - report.before.hp,
      quests: report.after.quests - report.before.quests,
      rests: report.after.completed_rests - report.before.completed_rests,
      locationChanged: report.after.location_id !== report.before.location_id,
      resourcesChanged: !isDeepStrictEqual(report.after.resources, report.before.resources),
    };
    report.acceptance = first.result.status === "committed" &&
      report.delta.provisions === -1 && report.delta.worldMinutes === 480 &&
      report.delta.hp === 0 && report.after.hp === 10 && report.after.max_hp === 10 &&
      report.delta.quests === 0 && report.delta.rests === 1 &&
      !report.delta.locationChanged && !report.delta.resourcesChanged &&
      report.after.items.length === report.before.items.length
      ? "passed" : "failed";
    // Only an already committed operation is read/replayed; failures are never resumed.
    if (first.result.status === "committed") {
      const memory = createRpcMemoryStore(world.f.owner, async (args) => ({
        data: await world.f.memory(args.p_campaign_id, args.p_action, args.p_payload, args.p_timeline),
      }), world.timeline);
      const refuse = async () => { report.replayProviderCalls++; throw Error("replay_provider_refused"); };
      const replay = await runAstraTurn(first.input, { store: first.store, memory,
        provider: { next: refuse, narrate: refuse }, summaries: syntheticSummaries });
      report.replayUnchanged = replay.status === "committed" &&
        isDeepStrictEqual(await world.readState(), report.after) && report.replayProviderCalls === 0;
      if (!report.replayUnchanged) report.acceptance = "failed";
    }
  } catch (error) {
    report.status = "harness_stopped";
    report.acceptance = "failed";
    report.error = String(error.code ?? error.message ?? error.name)
      .replaceAll(apiKey, "[REDACTED]").slice(0, 160);
  } finally {
    if (world) await world.f.db.close();
  }
  report.accounting = {
    requests: diagnostics.requests, inputTokens: diagnostics.inputTokens,
    outputTokens: diagnostics.outputTokens,
    cachedTokens: diagnostics.responses.reduce((n, r) => n + (r.usage.cachedTokens ?? 0), 0),
    reasoningTokens: diagnostics.responses.reduce((n, r) => n + (r.usage.reasoningTokens ?? 0), 0),
    usageKnown: diagnostics.usageKnown,
    estimatedSpendUsd: diagnostics.usageKnown
      ? estimatedSpend(diagnostics.inputTokens, diagnostics.outputTokens) : null,
    providerLatencyMs: diagnostics.latenciesMs,
  };
  return report;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  if (process.argv.length !== 3 || process.argv[2] !== "--live") {
    process.stderr.write("Explicit --live is required. No request was made.\n");
    process.exitCode = 2;
  } else {
    const report = await runLongRestSmoke({ live: true });
    process.stdout.write(JSON.stringify(report) + "\n");
    if (report.acceptance !== "passed") process.exitCode = 1;
  }
}
