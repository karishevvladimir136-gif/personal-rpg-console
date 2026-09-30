import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import {
  parseCreationProposal,
  parseCreationReview,
  parseOpeningProposal,
  parseOpeningReview,
  initialCreationReview,
  initialOpeningReview,
  parseBootstrapCommand,
} from "../src/lib/adventures/bootstrap-validation.ts";
import { fixture, proposal } from "./wave2-logic-fixtures.mjs";
import {
  worldLogicContext,
  resolveWorldLogic,
} from "../src/lib/rulesets/world-logic.ts";
import { examples } from "./universal-bootstrap-fixture.mjs";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";
import {
  characterPacket,
  validateCharacterPatches,
} from "../src/lib/gameplay/character-model.ts";
const input = {
  requestId: randomUUID(),
  worldId: randomUUID(),
  worldVersion: 1,
  title: "Synthetic",
  language: "en",
  name: examples.orbital.name,
  description: examples.orbital.description,
};
const p = {
  schemaVersion: 1,
  capabilities: [{ text: "piloting", quote: input.description }],
  limitations: [{ text: "no combat training", quote: input.description }],
  possessions: [],
  resources: [],
  questions: [],
};
test("Original extraction cannot invent capabilities, possessions, resource quantities or private authority", () => {
  assert.deepEqual(parseCreationProposal(p, input), p);
  for (const change of [
    { capabilities: [{ text: "teleportation", quote: input.description }] },
    {
      possessions: [
        {
          name: "sword",
          description: "",
          quantity: 1,
          quote: input.description,
        },
      ],
    },
    {
      resources: [
        {
          key: "credits",
          label: "credits",
          amount: 100,
          quote: input.description,
        },
      ],
    },
    { knowledge: ["secret"] },
    { hp: 10 },
    {
      capabilities: [
        { text: "world.travel:route", quote: "world.travel:route" },
      ],
    },
  ])
    assert.throws(() => parseCreationProposal({ ...p, ...change }, input));
  for (const key of [
    "manifestId",
    "ownerId",
    "privateState",
    "executionProfile",
  ])
    assert.throws(() =>
      parseBootstrapCommand({
        action: "creation.propose",
        input: { ...input, [key]: randomUUID() },
      }),
    );
});
test("Clearly singular ordinary possessions stay grounded while vague supplies and balances remain unresolved", () => {
  const description = "Mara carries a weatherproof cloak, a backpack, several days of food, a modest supply of arrows, and enough coin for several days.";
  const owner = { ...input, description };
  const grounded = {
    ...p,
    capabilities: [],
    limitations: [],
    possessions: [
      { name: "weatherproof cloak", description: "", quantity: 1, quote: "a weatherproof cloak" },
      { name: "backpack", description: "", quantity: 1, quote: "a backpack" },
      { name: "days of food", description: "", quantity: null, quote: "several days of food" },
      { name: "arrows", description: "", quantity: null, quote: "a modest supply of arrows" },
    ],
    resources: [{ key: "coin", label: "coin", amount: null, quote: "enough coin for several days" }],
  };
  assert.deepEqual(parseCreationProposal(grounded, owner), grounded);
  assert.throws(() => parseCreationProposal({ ...grounded, possessions: grounded.possessions.map((item, i) => i === 3 ? { ...item, quantity: 50 } : item) }, owner));
  assert.throws(() => parseCreationProposal({ ...grounded, resources: [{ ...grounded.resources[0], amount: 10 }] }, owner));
});
test("Descriptive impossible powers confer no consequence authority; controlled-PC and private knowledge remain protected", () => {
  const i = fixture();
  i.snapshot.world.actors[0].capabilities = ["teleportation"];
  i.snapshot.world.actors[0].limitations = ["Requires an unavailable gate"];
  i.source.snapshot.entities[0].details = "A non-humanoid explorer.";
  const before = structuredClone(i);
  const c = worldLogicContext(i);
  assert.equal(c.actors[0].description, "A non-humanoid explorer.");
  assert.deepEqual(c.actors[0].limitations, ["Requires an unavailable gate"]);
  assert.deepEqual(c.travelOptions, []);
  assert.deepEqual(
    resolveWorldLogic(
      i,
      proposal(i, {
        schemaVersion: 2,
        consequences: [],
        action: "move",
        destinationId: i.source.snapshot.locations[1].id,
        capabilityRefs: ["teleportation"],
      }),
    ),
    { status: "paused", reason: "unsupported" },
  );
  assert.deepEqual(
    resolveWorldLogic(
      i,
      proposal(i, {
        uncertainty: "unsupported",
        elapsedMinutes: 0,
        capabilityRefs: ["teleportation"],
      }),
    ),
    { status: "paused", reason: "unsupported" },
  );
  assert.deepEqual(i, before);
});
test("Absent/private/cross-campaign actor canaries stay out of new public circumstances", () => {
  const i = fixture(),
    e = i.source.snapshot.entities.find(
      (e) => e.id === i.snapshot.world.actors[1].entityId,
    );
  e.details = "HIDDEN_ACTOR_CANARY";
  i.source.privateState = { secret: "PRIVATE_CANARY" };
  i.source.adventureContext = { premise: "Owner adventure intent" };
  assert.doesNotMatch(
    JSON.stringify(worldLogicContext(i)),
    /HIDDEN_ACTOR_CANARY|PRIVATE_CANARY/,
  );
  i.snapshot.world.actors[1].publicName = e.name;
  i.snapshot.world.actors[1].locationId =
    i.source.snapshot.publicState.current_location_id;
  assert.match(JSON.stringify(worldLogicContext(i)), /HIDDEN_ACTOR_CANARY/);
  e.campaign_id = randomUUID();
  assert.doesNotMatch(
    JSON.stringify(worldLogicContext(i)),
    /HIDDEN_ACTOR_CANARY/,
  );
});
test("Owner answers never substitute for required reviewed numeric inventory amounts or public fields", () => {
  const unknown = {
    ...p,
    possessions: [
      { name: "tool", description: "", quantity: null, quote: "tool" },
    ],
    questions: [{ question: "How many?", consequential: true }],
  };
  const r = initialCreationReview(input, unknown);
  r.answers = ["One"];
  assert.throws(() => parseCreationReview(r, unknown));
  r.possessions[0].quantity = 1;
  assert.ok(parseCreationReview(r, unknown));
  const opening = {
    schemaVersion: 1,
    location: { name: null, description: null },
    situation: null,
    narration: null,
    actors: [],
    questions: [{ question: "Where?", consequential: true }],
  };
  const o = initialOpeningReview(opening);
  o.answers = ["Station"];
  o.publicOpeningConfirmed = true;
  assert.throws(() => parseOpeningReview(o, opening));
});

test("World Logic narration bridge uses positive server presence without legacy configuration; controlled/private actors and knowledge stay excluded", () => {
  const { source, input } = runtimeFixture(),
    pc = source.snapshot.entities[0];
  const [npc, absent, controlled, foreign] = [
    "Present",
    "Absent",
    "Controlled",
    "Foreign",
  ].map((name) => ({ ...pc, id: randomUUID(), kind: "npc", name }));
  foreign.campaign_id = randomUUID();
  source.snapshot.entities.push(npc, absent, controlled, foreign);
  source.runtime.configuration = null;
  source.worldLogicPresence = {
    controlledEntityIds: [pc.id, controlled.id],
    presentEntityIds: [pc.id, npc.id, controlled.id, foreign.id],
  };
  const model = (id) => ({
    schemaVersion: 1,
    actorId: id,
    basisOperationId: null,
    identity: {
      values: [],
      wants: [],
      boundaries: [],
      loyalties: [],
      signatures: [],
      observableVoice: "Public dry humor.",
    },
    current: {
      goal: "PRIVATE_GOAL_CANARY",
      stress: "settled",
      preoccupation: null,
      obligation: null,
    },
    beliefs: [],
    relationships: [],
    episodes: [],
  });
  source.privateState.npc = Object.fromEntries(
    [npc, absent, controlled, foreign].map((a) => [
      `character_${a.id}`,
      JSON.stringify(model(a.id)),
    ]),
  );
  input.input = "I look around";
  const packet = characterPacket(source, input, "narrate");
  assert.deepEqual(packet, [
    { actorId: npc.id, observableVoice: "Public dry humor." },
  ]);
  assert.doesNotMatch(JSON.stringify(packet), /PRIVATE_GOAL_CANARY/);
  const patch = (a) => [
    {
      kind: "npc",
      key: `character_${a.id}`,
      operation: "set",
      value: JSON.stringify({
        ...model(a.id),
        basisOperationId: input.operationId,
      }),
      amount: null,
    },
  ];
  assert.doesNotThrow(() =>
    validateCharacterPatches(source, input, patch(npc)),
  );
  for (const a of [absent, controlled, foreign])
    assert.throws(() => validateCharacterPatches(source, input, patch(a)));
});
const hook = registerHooks({
  resolve(s, c, next) {
    return s === "server-only"
      ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
      : next(s, c);
  },
});
const { createBootstrapProvider } =
  await import("../src/lib/server/adventure-bootstrap-provider.ts");
hook.deregister();
const ticket = {
  kind: "creation",
  input,
  context: {
    name: input.name,
    description: input.description,
    world: { title: "Jupiter", premise: "Orbital stations" },
  },
  profile: { modelId: "gpt-6-sol", reasoning: "high" },
};
function response(output, status = "completed", model = "gpt-6-sol") {
  return new Response(
    JSON.stringify({
      status,
      model,
      output: [
        {
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: JSON.stringify(output) }],
        },
      ],
      usage: { input_tokens: 100, output_tokens: 30 },
    }),
  );
}
test("Bootstrap uses the accepted Responses requester, pinned model and task budget; no tools/private input and no retry", async () => {
  let calls = 0;
  const provider = createBootstrapProvider({
    apiKey: "SYNTHETIC",
    model: "gpt-6-sol",
    reasoning: "high",
    fetcher: async (_url, options) => {
      calls++;
      const wire = JSON.parse(options.body);
      assert.equal(wire.model, "gpt-6-sol");
      assert.equal(wire.reasoning.effort, "high");
      assert.equal(wire.max_output_tokens, 16384);
      assert.equal(wire.tools, undefined);
      assert.equal(wire.background, undefined);
      assert.equal(wire.truncation, "disabled");
      assert.match(wire.instructions, /DATA/);
      assert.match(wire.instructions, /clearly singular ordinary possession/);
      assert.match(wire.instructions, /do not ask a duplicate general clarification question/);
      return response(p);
    },
  });
  assert.deepEqual((await provider(ticket)).output, p);
  assert.equal(calls, 1);
});
for (const [name, fetcher] of [
  ["malformed", async () => response({ ...p, hiddenTruth: "No" })],
  ["incomplete", async () => response(p, "incomplete")],
  ["wrong model", async () => response(p, "completed", "gpt-5.4")],
  [
    "timeout",
    async () => {
      throw new DOMException("Synthetic timeout", "TimeoutError");
    },
  ],
])
  test(`Bootstrap ${name} fails closed with one attempt and no fallback`, async () => {
    let calls = 0;
    const provider = createBootstrapProvider({
      apiKey: "SYNTHETIC",
      model: "gpt-6-sol",
      reasoning: "high",
      fetcher: async (...args) => {
        calls++;
        return fetcher(...args);
      },
    });
    await assert.rejects(provider(ticket));
    assert.equal(calls, 1);
  });

const opening = {
  schemaVersion: 1,
  location: {
    name: "Station arrivals",
    description: "A public arrivals concourse.",
  },
  situation: "A dock attendant stands beside a public display.",
  narration: "The dock attendant is available to speak.",
  actors: [
    {
      name: "Dock attendant",
      description: "A visible attendant.",
      capabilities: [],
      limitations: [],
    },
  ],
  questions: [],
};
const openingContext = {
  protagonist: {
    name: "Nadia Vale",
    publicName: "Nadia",
    description: "A cargo pilot.",
    capabilities: [],
    limitations: [],
  },
};
test("Opening proposal and owner review reject established protagonist identity, including normalized names and public label", () => {
  assert.deepEqual(parseOpeningProposal(opening, openingContext), opening);
  for (const name of ["Nadia Vale", "  NADIA   Vale ", "nadia"]) {
    const bad = { ...opening, actors: [{ ...opening.actors[0], name }] };
    assert.throws(() => parseOpeningProposal(bad, openingContext));
    assert.throws(() =>
      parseOpeningReview(
        { ...initialOpeningReview(bad), publicOpeningConfirmed: true },
        opening,
        openingContext,
      ),
    );
  }
  assert.throws(() => parseOpeningProposal(opening, {}));
  assert.throws(() =>
    parseOpeningProposal(
      {
        ...opening,
        actors: [
          ...opening.actors,
          { ...opening.actors[0], name: " DOCK   ATTENDANT " },
        ],
      },
      openingContext,
    ),
  );
  const old = structuredClone(openingContext);
  delete old.protagonist.publicName;
  assert.deepEqual(parseOpeningProposal(opening, old), opening);
  assert.throws(() =>
    parseOpeningProposal(
      { ...opening, actors: [{ ...opening.actors[0], name: "Nadia Vale" }] },
      old,
    ),
  );
});
test("Production opening provider rejects a protagonist copy before returning a draft, with one mocked request", async () => {
  let calls = 0;
  const provider = createBootstrapProvider({
    apiKey: "SYNTHETIC",
    model: "gpt-6-sol",
    reasoning: "high",
    fetcher: async (_url, options) => {
      calls++;
      const wire = JSON.parse(options.body);
      assert.match(wire.instructions, /ONLY additional NEW visible non-player/);
      assert.match(wire.instructions, /never optional future story choices/);
      return response({
        ...opening,
        actors: [{ ...opening.actors[0], name: "Nadia Vale" }],
      });
    },
  });
  await assert.rejects(
    provider({
      ...ticket,
      kind: "opening",
      input: { action: "start", input: { requestId: randomUUID() } },
      context: openingContext,
    }),
  );
  assert.equal(calls, 1);
});
test("Unasked null quantities/balances still block creation; direct owner values suffice without another model or inferred authority", () => {
  const unresolved = {
    ...p,
    possessions: [
      { name: "tool", description: "", quantity: null, quote: "tool" },
    ],
    resources: [
      { key: "charge", label: "charge", amount: null, quote: "charge" },
    ],
    questions: [],
  };
  const r = initialCreationReview(input, unresolved);
  assert.throws(() => parseCreationReview(r, unresolved));
  r.possessions[0].quantity = 6;
  assert.throws(() => parseCreationReview(r, unresolved));
  r.resources[0].amount = 0;
  assert.deepEqual(parseCreationReview(r, unresolved), r);
  assert.equal(unresolved.possessions[0].quantity, null);
  assert.equal(unresolved.resources[0].amount, null);
});
