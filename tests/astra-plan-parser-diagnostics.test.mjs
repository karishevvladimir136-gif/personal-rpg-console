import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { modelBudget } from "../src/lib/gameplay/dm-context.ts";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only"
    ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
    : nextResolve(specifier, context);
}});
const { createAstraPrimaryProvider } = await import(
  "../src/lib/server/dm/astra-primary-provider.ts");
hook.deregister();

function fixture() {
  const campaignId = randomUUID(), hero = randomUUID(), npc = randomUUID();
  const source = {
    worldTakeover: { presentEntityIds: [hero, npc], actors: [
      { entityId: npc, publicName: "Trader" }] },
    snapshot: { entities: [{ id: npc, kind: "npc" }], items: [],
      locations: [], quests: [], storages: [] },
    runtime: { configuration: { controlledEntityIds: [hero], nearbyStorageIds: [] },
      participants: [], restRecords: [] },
    astraSettlementCurrencies: [], astraSettlementJobs: [],
  };
  return {
    source, hero, npc,
    input: { operationId: randomUUID(), campaignId, expectedRevision: 3,
      mode: "game", input: "A harmless synthetic prompt", companionId: null,
      listenerIds: [], mechanic: null },
    caps: { entityIds: [hero, npc], itemIds: [], toolItemIds: [],
      locationIds: [], participantIds: [], resources: { [hero]: [], [npc]: [] } },
    context: { instructions: "Synthetic test", input: "{}",
      budget: modelBudget("gpt-6-astra"), estimatedTokens: 12, sourceIds: [] },
  };
}

const final = () => ({ type: "final", call: null, final: { schemaVersion: 1,
  worldMinutes: 0, changes: [], outcomes: [], privatePatches: [], effects: [] } });

function responseText(text, output) {
  return new Response(JSON.stringify({ model: "gpt-6-astra", status: "completed",
    output: output ?? [{ type: "message", role: "assistant", status: "completed",
      content: [{ type: "output_text", text }] }],
    usage: { input_tokens: 5, output_tokens: 5 } }), { status: 200 });
}

async function run(value, { text, output, fetcher } = {}) {
  const f = fixture();
  const diagnostics = [], runtime = [];
  const provider = createAstraPrimaryProvider({ apiKey: "synthetic-only",
    fetcher: fetcher ?? (async () => responseText(text ?? JSON.stringify(value), output)),
    planDiagnosticObserver: (diagnostic) => diagnostics.push(diagnostic) });
  let result;
  try {
    result = await provider.next(f.context, f.input, [], [], f.caps, f.source,
      (diagnostic) => runtime.push(diagnostic));
  } catch (error) {
    assert.equal(error.code, "validation");
  }
  assert.equal(diagnostics.length, 1);
  assert.deepEqual(Object.keys(diagnostics[0]).sort(),
    ["httpStatus", "phase", "reasonCode", "resultStatus"]);
  assert.deepEqual(runtime, [{ responseReceived: true,
    phase: diagnostics[0].phase }]);
  return { result, diagnostic: diagnostics[0], f };
}

test("planner diagnostics distinguish output JSON from semantic validation and success", async () => {
  const good = await run(final());
  assert.equal(good.result.output.type, "final");
  assert.deepEqual(good.diagnostic, { httpStatus: 200, phase: "completed",
    resultStatus: "success", reasonCode: null });
  const json = await run(null, { text: "{invalid-private-output" });
  assert.deepEqual(json.diagnostic, { httpStatus: 200, phase: "output-parse",
    resultStatus: "validation", reasonCode: "output_json_invalid" });
  const semantic = await run({ type: "private-model-value", call: null, final: null });
  assert.equal(semantic.diagnostic.reasonCode, "decision_final_shape");
  assert.equal(JSON.stringify(semantic.diagnostic).includes("private-model-value"), false);
});

test("planner extraction reports bounded message and chunk reasons", async () => {
  const badMessage = await run(null, { output: [{ type: "function_call" }] });
  assert.equal(badMessage.diagnostic.reasonCode, "output_message_shape");
  const noChunks = await run(null, { output: [] });
  assert.equal(noChunks.diagnostic.reasonCode, "output_chunk_count");
});

test("decision reason codes cover root, tool, final, changes, effects and mechanics", async () => {
  const f = fixture();
  const wrongChange = () => ({ family: "items", id: randomUUID(),
    expectedRevision: null, hp: null, resources: null, quantity: 1,
    locationId: null, position: null });
  const cases = [
    [{ unexpected: "secret" }, "decision_root_shape"],
    [{ type: "tool", call: {}, final: null }, "decision_tool_shape"],
    [{ type: "tool", call: { kind: "attack", actorId: randomUUID(),
      targetId: null, dc: null, itemId: null, scope: null }, final: null },
    "decision_tool_selection"],
    [{ type: "final", call: null, final: {} }, "decision_final_shape"],
    [{ ...final(), final: { ...final().final, schemaVersion: 2 } },
    "decision_final_limits"],
    [{ ...final(), final: { ...final().final, changes: [{}] } },
    "decision_change_shape"],
    [{ ...final(), final: { ...final().final, changes: [wrongChange()] } },
    "decision_change_scope"],
    [{ ...final(), final: { ...final().final, effects: [null, null, null, null, null, null, null] } },
    "decision_effect_scope"],
    [{ ...final(), final: { ...final().final, effects: [
      { kind: "unsupported_optional", description: "" }] } },
    "decision_effect_shape"],
    [{ ...final(), final: { ...final().final, effects: [
      { kind: "private-unknown-effect" }] } },
    "decision_effect_kind"],
    [{ ...final(), final: { ...final().final, effects: [
      { kind: "formal_rest" }] } },
    "decision_effect_fields"],
    [{ ...final(), final: { ...final().final, effects: [
      { kind: "formal_rest", restKind: "short",
        restSafety: { locationId: f.hero, suitable: "secret" } }] } },
    "decision_rest_safety"],
    [{ ...final(), final: { ...final().final, effects: [
      { kind: "mechanic_actions", actions: [{}], restSafety: null }] } },
    "decision_mechanic_actions"],
  ];
  for (const [value, reason] of cases) {
    const { diagnostic } = await run(value);
    assert.equal(diagnostic.resultStatus, "validation", reason);
    assert.equal(diagnostic.reasonCode, reason);
    assert.equal(diagnostic.phase, "output-parse");
  }
});

test("failed transport has a fixed category and no model-derived reason", async () => {
  const f = fixture(), seen = [];
  const provider = createAstraPrimaryProvider({ apiKey: "synthetic-only",
    fetcher: async () => new Response("private provider body", { status: 503 }),
    planDiagnosticObserver: (diagnostic) => seen.push(diagnostic) });
  await assert.rejects(provider.next(f.context, f.input, [], [], f.caps, f.source),
    { code: "provider" });
  assert.deepEqual(seen, [{ httpStatus: 503, phase: "error-body",
    resultStatus: "provider", reasonCode: null }]);
});

test("provider content shape retains provider error while reporting a fixed reason", async () => {
  const f = fixture(), seen = [];
  const provider = createAstraPrimaryProvider({ apiKey: "synthetic-only",
    fetcher: async () => responseText("", [{ type: "message", role: "assistant",
      status: "completed", content: [{ type: "private-content", text: "secret" }] }]),
    planDiagnosticObserver: (diagnostic) => seen.push(diagnostic) });
  await assert.rejects(provider.next(f.context, f.input, [], [], f.caps, f.source),
    { code: "provider" });
  assert.deepEqual(seen, [{ httpStatus: 200, phase: "provider-state",
    resultStatus: "provider", reasonCode: "output_content_shape" }]);
});
