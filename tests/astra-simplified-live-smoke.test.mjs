import assert from "node:assert/strict";
import test from "node:test";
import { LIVE_SMOKE_LIMITS, smokeBudget, boundedSmokeFetcher, scrubSmokeReport,
  runSimplifiedLiveSmoke } from "../scripts/astra-simplified-live-smoke.mjs";

const syntheticKey = "sk-synthetic-harness-secret-never-record";
const request = (overrides = {}) => ({ method: "POST",
  headers: { Authorization: `Bearer ${syntheticKey}` },
  body: JSON.stringify({ model: "gpt-6-astra", reasoning: { effort: "high" },
    service_tier: "default", max_output_tokens: 4096, input: "Synthetic only", ...overrides }) });
const endpoint = "https://api.openai.com/v1/responses";
const response = (decision) => new Response(JSON.stringify({ id: "resp_synthetic_smoke",
  model: "gpt-6-astra", service_tier: "default", status: "completed",
  output: [{ type: "message", role: "assistant", status: "completed",
    content: [{ type: "output_text", text: typeof decision === "string" ? decision : JSON.stringify(decision) }] }],
  usage: { input_tokens: 1200, output_tokens: 250,
    input_tokens_details: { cached_tokens: 100 }, output_tokens_details: { reasoning_tokens: 150 } },
}), { status: 200, headers: { "x-request-id": "req_synthetic_smoke" } });
function final(body, narration, extra = {}) {
  const context = JSON.parse(body.input).context;
  return { type: "final", call: null, final: { schemaVersion: 1,
    worldMinutes: context.mandatory.current.worldMinutes,
    changes: [], outcomes: [], privatePatches: [], effects: [], ...extra,
    publicNarration: extra.publicNarration ?? {
      beats: [{ text: narration, requiresEffects: [] }],
      visualDescription: { text: "", requiresEffects: [] },
    } } };
}

test("live smoke reservation guard preserves fetch arguments and response while enforcing four calls", async () => {
  const budget = smokeBudget();
  const init = request();
  const actual = new Response("synthetic response");
  let sent = 0;
  const guarded = boundedSmokeFetcher(budget, async (url, unchanged) => {
    sent++;
    assert.equal(url, endpoint);
    assert.equal(unchanged, init);
    return actual;
  });
  for (let i = 0; i < 4; i++) assert.equal(await guarded(endpoint, init), actual);
  await assert.rejects(() => guarded(endpoint, init), /smoke_request_cap/);
  assert.equal(sent, 4);
  assert.ok(budget.reservedUsd <= 5);
  assert.equal(4 * (64000 * 12.5 + 4096 * 50) / 1_000_000, 4.0192);
  assert.equal(JSON.stringify(budget).includes(syntheticKey), false);
  assert.equal(JSON.stringify(budget).includes("Authorization"), false);
});

test("live smoke refuses configuration drift and excessive inputs/output before dispatch", async () => {
  let calls = 0;
  const guarded = boundedSmokeFetcher(smokeBudget(), async () => { calls++; return new Response("unused"); });
  for (const body of [
    { model: "gpt-6-sol" }, { reasoning: { effort: "medium" } },
    { service_tier: "fast" }, { stream: true },
  ]) await assert.rejects(() => guarded(endpoint, request(body)), /smoke_configuration_mismatch/);
  await assert.rejects(() => guarded(endpoint, request({ input: "x".repeat(64000) })), /smoke_input_cap/);
  await assert.rejects(() => guarded(endpoint, request({ max_output_tokens: 4097 })), /smoke_output_cap/);
  await assert.rejects(() => guarded("https://example.invalid/", request()), /smoke_endpoint_not_allowed/);
  const full = smokeBudget(); full.reservedUsd = 4.99;
  await assert.rejects(() => boundedSmokeFetcher(full, async () => { calls++; })(endpoint, request()), /smoke_spend_cap/);
  assert.equal(calls, 0);
  assert.equal(LIVE_SMOKE_LIMITS.maxRequests, 4);
});

test("live smoke report redacts credentials and never serializes hidden request headers", () => {
  const report = scrubSmokeReport({ outputText: `quoted ${syntheticKey} and Bearer OTHER_SYNTHETIC_SECRET`,
    nested: { text: syntheticKey }, requests: [{ requestBytes: 100 }] }, syntheticKey);
  assert.equal(JSON.stringify(report).includes(syntheticKey), false);
  assert.equal(JSON.stringify(report).includes("OTHER_SYNTHETIC_SECRET"), false);
  assert.match(report.outputText, /REDACTED/);
});

test("imported live smoke requires explicit confirmation before reading fixtures or dispatching", async () => {
  let calls = 0;
  await assert.rejects(() => runSimplifiedLiveSmoke({ apiKey: syntheticKey,
    fetcher: async () => { calls++; } }), /smoke_explicit_confirmation_required/);
  assert.equal(calls, 0);
});

test("offline smoke exercises actual provider parsing, tool continuation and safe optional rejection in four fake requests", async () => {
  let calls = 0;
  const report = await runSimplifiedLiveSmoke({ apiKey: syntheticKey,
    confirmation: "authorize-four-text-requests-five-usd", fetcher: async (_url, init) => {
      calls++;
      const body = JSON.parse(init.body);
      const context = JSON.parse(body.input).context;
      const hero = context.mandatory.current.configuration.controlledEntityIds[0];
      if (calls === 2) return response({ type: "tool", final: null,
        call: { kind: "skill", actorId: hero, targetId: null, itemId: null, dc: 12, scope: null } });
      if (calls === 3) {
        const wrapped = JSON.parse(body.input);
        assert.equal(wrapped.toolReceipts.length, 1);
        assert.equal(wrapped.toolReceipts[0].result.success, true);
        assert.equal(Object.hasOwn(wrapped.toolReceipts[0], "id"), false);
        return response(final(body, "You find a steady foothold and cross without slipping."));
      }
      if (calls === 4) return response(final(body, "", {
        effects: [{ kind: "mundane_grant", issuerId: context.mandatory.current.entities.find((actor) => actor.name === "Nera").id,
          recipientId: hero, currencyName: null, currencyAmount: null,
          itemName: "Ordinary bread", itemCategory: "food", itemDescription: "One ordinary loaf of bread." },
        { kind: "unsupported_optional", description: "An imagined magical blessing has no mechanical authority." }],
        publicNarration: { beats: [
          { text: "Nera smiles at your offer to help later.", requiresEffects: [] },
          { text: "You put the offered ordinary loaf of bread in your pack.", requiresEffects: [0] },
          { text: "The bread makes you permanently invulnerable.", requiresEffects: [1] },
        ], visualDescription: { text: "A magical shield surrounds the hero.", requiresEffects: [1] } },
      }));
      return response(final(body, "Nera describes an ordinary, busy morning."));
    } });
  assert.equal(report.outcome, "completed", JSON.stringify({ reason: report.stoppedReason,
    diagnostics: report.parseDiagnostics, sqlErrors: report.sqlErrors,
    boundaries: report.orderedBoundaries.slice(-10), turns: report.turns.map(({ status, failure, privateCheckpoint }) => ({ status, failure, privateCheckpoint })) }));
  assert.equal(report.requests, 4);
  assert.deepEqual(report.turns.map((turn) => turn.providerRequests), [1, 2, 1]);
  assert.ok(report.turns.every((turn) => turn.status === "committed"));
  assert.ok(report.turns.every((turn) => turn.responseMode === "public-unified" && turn.narratorCalls === 0));
  assert.equal(report.narratorCalls, 0);
  assert.equal(report.toolContinuationCovered, true);
  assert.equal(report.rejectedOptionalEffectCovered, true);
  assert.equal(report.acceptedDurableEffectCovered, true);
  assert.equal(report.summaryProviderCalls, 0);
  assert.equal(report.mediaProviderCalls, 0);
  assert.equal(report.ownerDataUsed, false);
  assert.equal(report.finalState.state.hp, 4);
  assert.equal(report.finalState.rests, 0);
  assert.doesNotMatch(report.turns[2].narration, /invulnerable/);
  assert.match(report.turns[2].narration, /ordinary loaf of bread/);
  assert.equal(report.finalState.items.length, report.initialState.items.length + 1);
  assert.equal(report.responses.length, 4);
  assert.ok(report.responses.every((entry) => entry.schemaParseSucceeded));
  assert.equal(report.responses[0].usage.reasoningTokens, 150);
  assert.equal(report.responses[0].usage.cachedTokens, 100);
  assert.equal(report.attempts.length, 4);
  assert.ok(report.attempts.every((attempt) => attempt.actualModel === "gpt-6-astra" && attempt.httpStatus === 200 && attempt.requestBytes > 0));
  assert.ok(report.orderedBoundaries.some((entry) => entry.method === "store.commit"));
  assert.equal(JSON.stringify(report).includes(syntheticKey), false);
});

test("systemic output parse failure preserves bounded synthetic evidence and stops after the first response", async () => {
  let calls = 0;
  const report = await runSimplifiedLiveSmoke({ apiKey: syntheticKey,
    confirmation: "authorize-four-text-requests-five-usd", fetcher: async () => {
      calls++;
      return response("{not valid JSON");
    } });
  assert.equal(calls, 1);
  assert.equal(report.requests, 1);
  assert.equal(report.outcome, "stopped");
  assert.equal(report.stoppedReason, "provider_parse_or_contract_failure");
  assert.equal(report.turns.length, 1);
  assert.equal(report.turns[0].status, "failed");
  assert.equal(report.responses[0].outputText.text, "{not valid JSON");
  assert.equal(report.turns[0].privateCheckpoint.finalProposal, null);
  assert.equal(report.finalState.events, report.initialState.events);
  assert.equal(report.finalState.state.hp, 4);
  assert.ok(report.parseDiagnostics.some((diagnostic) => diagnostic.reasonCode === "output_json_invalid"));
});
