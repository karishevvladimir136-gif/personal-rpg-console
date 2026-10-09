import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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

const campaignId = "00000000-0000-4000-8000-000000000001";
const hero = "00000000-0000-4000-8000-000000000002";
const npc = "00000000-0000-4000-8000-000000000003";
const input = { operationId: "00000000-0000-4000-8000-000000000004",
  campaignId, expectedRevision: 1, mode: "game", input: "Synthetic optional intent",
  companionId: null, listenerIds: [], mechanic: null };
const source = { worldTakeover: { presentEntityIds: [hero, npc],
  actors: [{ entityId: npc, publicName: "Trader" }] },
  snapshot: { entities: [{ id: npc, kind: "npc" }], items: [],
    locations: [], quests: [], storages: [] },
  runtime: { configuration: { controlledEntityIds: [hero], nearbyStorageIds: [] },
    participants: [], restRecords: [] },
  astraSettlementCurrencies: [], astraSettlementJobs: [] };
const caps = { entityIds: [hero, npc], itemIds: [], toolItemIds: [],
  locationIds: [], participantIds: [], resources: { [hero]: [], [npc]: [] } };
const context = { instructions: "Synthetic test", input: "{}",
  budget: modelBudget("gpt-6-astra"), estimatedTokens: 12, sourceIds: [] };

function output(description) {
  return { type: "final", call: null, final: { schemaVersion: 1,
    worldMinutes: 0, changes: [], outcomes: [], privatePatches: [],
    effects: [{ kind: "unsupported_optional", description }] } };
}

async function invoke(description) {
  let schema;
  const diagnostics = [];
  const provider = createAstraPrimaryProvider({ apiKey: "synthetic-only",
    planDiagnosticObserver: (diagnostic) => diagnostics.push(diagnostic),
    fetcher: async (_url, request) => {
      schema = JSON.parse(request.body).text.format.schema;
      return new Response(JSON.stringify({ model: "gpt-6-astra", status: "completed",
        output: [{ type: "message", role: "assistant", status: "completed",
          content: [{ type: "output_text", text: JSON.stringify(output(description)) }] }],
        usage: { input_tokens: 5, output_tokens: 5 } }));
    } });
  let result, error;
  try { result = await provider.next(context, input, [], [], caps, source); }
  catch (caught) { error = caught; }
  return { result, error, schema, diagnostic: diagnostics[0] };
}

function optionalDescriptionSchema(schema) {
  const final = schema.properties.final.anyOf.find((node) => node.type === "object");
  const effect = final.properties.effects.items.anyOf.find((node) =>
    node.properties?.kind.enum?.[0] === "unsupported_optional");
  assert.ok(effect);
  return effect.properties.description;
}

test("optional description schema is 1–160 characters and all other schema remains frozen", async () => {
  const { schema } = await invoke("a");
  const description = optionalDescriptionSchema(schema);
  assert.deepEqual(description, { type: "string", minLength: 1, maxLength: 160 });

  // Baseline is the diagnostic version of this deterministic fixture schema.
  // Remove only the new two string limits before comparing the entire tree.
  const baselineShape = structuredClone(schema);
  const baselineDescription = optionalDescriptionSchema(baselineShape);
  delete baselineDescription.minLength;
  delete baselineDescription.maxLength;
  const baselineHash = createHash("sha256")
    .update(JSON.stringify(baselineShape)).digest("hex");
  assert.equal(baselineHash, "d9d5189151b046184e5f7ae9e5dd5a084c64005bde9a87cac00968d355fd0a46");
});

test("schema and unchanged parser agree at ASCII description boundaries", async () => {
  for (const [length, accepted] of [[0, false], [1, true], [160, true], [161, false]]) {
    const description = "x".repeat(length);
    const { result, error, schema, diagnostic } = await invoke(description);
    const constraint = optionalDescriptionSchema(schema);
    const schemaAccepts = typeof description === "string" &&
      description.length >= constraint.minLength &&
      description.length <= constraint.maxLength;
    assert.equal(schemaAccepts, accepted, `schema length ${length}`);
    if (accepted) {
      assert.equal(error, undefined);
      assert.equal(result.output.final.effects[0].description, description);
      assert.equal(diagnostic.resultStatus, "success");
    } else {
      assert.equal(error?.code, "validation", `parser length ${length}`);
      assert.equal(diagnostic.reasonCode, "decision_effect_shape");
    }
  }
});
