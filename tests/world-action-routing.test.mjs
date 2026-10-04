import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { fixture, id, proposal as worldProposal } from "./wave3-logic-fixtures.mjs";
import { fixture as foundationFixture } from "./wave4-actions-fixtures.mjs";
import { foundationActionContext } from "../src/lib/foundation-actions/index.ts";

const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    return specifier === "server-only"
      ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
      : nextResolve(specifier, context);
  },
});
const { createWorldResolverProvider } = await import("../src/lib/server/world/resolver-provider.ts");
hook.deregister();

const playerId = id("player");
const targetId = id("enemy");

function inputFor(text, { visible = true, sword = false } = {}) {
  const input = fixture();
  input.input.input = text;
  input.snapshot.world.actors[1].publicName = "Innkeeper";
  input.source.snapshot.entities.find((row) => row.id === targetId).name = "Innkeeper";
  if (!visible) input.snapshot.world.actors[1].locationId = id("destination");
  if (sword) {
    const item = input.source.snapshot.items.find((row) => row.id === id("supply"));
    item.name = "sword";
    item.category = "weapon";
    item.equipped_entity_id = playerId;
    item.equipped_slot = "hand";
  }
  return input;
}

function scriptedResolver(output, foundationAction) {
  const requests = [];
  const provider = createWorldResolverProvider({
    apiKey: "SYNTHETIC_PROVIDER_TEST_ONLY",
    model: "gpt-6-astra",
    reasoning: "medium",
    fetcher: async (_url, request) => {
      requests.push(JSON.parse(request.body));
      return new Response(JSON.stringify({
        model: "gpt-6-astra",
        status: "completed",
        output: [{
          type: "message", role: "assistant", status: "completed",
          content: [{ type: "output_text", text: JSON.stringify(foundationAction === undefined
            ? { action: output }
            : { action: output, foundationAction }) }],
        }],
        usage: { input_tokens: 2, output_tokens: 3 },
      }));
    },
  });
  return { provider, requests };
}

function version2(input, action, uncertainty = "resolved") {
  return {
    schemaVersion: 2, actorId: playerId, input: input.input.input,
    action, outcome: uncertainty === "resolved" ? "completed" : "blocked",
    uncertainty, capabilityRefs: [],
    circumstanceRefs: uncertainty === "resolved" ? [`actor:${targetId}`] : [],
    evidenceIndexes: [], publicText: "The innkeeper is present.",
    elapsedMinutes: 0, destinationId: null, consequences: [],
  };
}

test("resolver routing contract presents compound physical attempts before conditional effects", async () => {
  for (const [text, itemId, sword] of [
    ["I grab a mug from the nearest table, throw it in the innkeeper's face, and while he's stunned I grab the gold from the counter.", null, false],
    ["I kick the chair at him and if he falls I grab his purse.", null, false],
    ["I tackle him and while he's down I take the keys.", null, false],
    ["I throw my sword at him and then rush past him.", id("supply"), true],
  ]) {
    const input = inputFor(text, { sword });
    const output = {
      schemaVersion: 4, input: text, actorId: playerId, targetId,
      method: "improvise", itemId, equipmentName: sword ? "sword" : null,
    };
    const { provider, requests } = scriptedResolver(output);
    const result = await provider.action(input);
    assert.deepEqual(result.output, output);
    assert.equal(requests.length, 1);
    const body = requests[0];
    const context = JSON.parse(body.input);
    assert.equal(context.input, text);
    assert.deepEqual(context.naturalMechanicOptions.targets, [{ id: targetId, name: "Innkeeper" }]);
    assert.match(body.instructions, /FIRST uncertain intended step.*schemaVersion=4/s);
    assert.match(body.instructions, /later conditional outcome.*unproven condition, transfer or movement/s);
    assert.match(body.instructions, /incidental prop.*itemId=null/s);
    assert.match(context.constraints.join(" "), /Version 2 cannot establish.*Version 4 represents only the first eligible hostile physical attempt/s);
    assert.equal(Object.hasOwn(result.output, "foundationAction"), false);
    assert.equal(Object.hasOwn(result.output, "consequences"), false);
    assert.equal(Object.hasOwn(result.output, "destinationId"), false);
  }
});

test("speech, hidden truth and absent targets keep their protected routes", async () => {
  const demand = inputFor("Give me your gold or else.");
  const spoken = scriptedResolver(version2(demand, "speak"));
  assert.equal((await spoken.provider.action(demand)).output.action, "speak");
  assert.match(spoken.requests[0].instructions, /Pure speech, threats and demands use the speech path/);

  const secret = inputFor("Who is secretly the murderer?");
  const guarded = scriptedResolver(version2(secret, "observe", "unsupported"));
  assert.equal((await guarded.provider.action(secret)).output.uncertainty, "unsupported");
  assert.match(guarded.requests[0].instructions, /Hidden truth stays protected/);

  const absent = inputFor("I tackle the innkeeper.", { visible: false });
  const forged = scriptedResolver({
    schemaVersion: 4, input: absent.input.input, actorId: playerId,
    targetId, method: "improvise", itemId: null, equipmentName: null,
  });
  await assert.rejects(forged.provider.action(absent), { code: "validation" });
  assert.deepEqual(JSON.parse(forged.requests[0].input).naturalMechanicOptions.targets, []);
  assert.match(forged.requests[0].instructions, /never invent one or route to version 4/);
});

test("a supported theft remains under Foundation transfer authority", async () => {
  const foundation = foundationFixture("theft", "world_logic");
  const input = inputFor(foundation.proposal.input);
  input.snapshot = structuredClone(foundation.context.foundation);
  input.source.snapshot = structuredClone(foundation.context.snapshot);
  input.source.runtime.timeline = structuredClone(foundation.command.timeline);
  input.source.foundationOptions = foundationActionContext(foundation.context, playerId);
  input.command = structuredClone(foundation.command);
  input.input.operationId = foundation.command.operationId;
  input.input.campaignId = foundation.command.campaignId;
  input.input.timeline = structuredClone(foundation.command.timeline);
  input.input.expectedRevision = foundation.command.expectedRuntimeRevision;
  const output = worldProposal(input, [], {
    capabilityRefs: foundation.authorization.capabilities,
  });
  const { provider, requests } = scriptedResolver(output, foundation.proposal);
  const result = await provider.action(input);
  assert.equal(result.output.schemaVersion, 2);
  assert.deepEqual(result.output.foundationAction, foundation.proposal);
  assert.deepEqual(result.output.consequences, []);
  assert.match(requests[0].instructions, /actual supported transaction or transfer as the first executable act uses Foundation authority/);
});
