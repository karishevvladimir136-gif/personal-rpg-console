import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { fixture as worldFixture, id } from "./wave1-world-fixtures.mjs";
import { fixture as logicFixture, proposal } from "./wave2-logic-fixtures.mjs";
import { applyResolution, turn } from "./phase2-mechanics-fixtures.mjs";
import {
  NATURAL_PHYSICAL_ACTION_GUIDANCE,
  naturalMechanicPlan,
  validateNaturalMechanicIntent,
} from "../src/lib/rulesets/natural-mechanics.ts";
import {
  NATURAL_COMBAT_TURN_GUIDANCE,
  naturalCombatTurnPlan,
  validateNaturalCombatTurn,
} from "../src/lib/rulesets/natural-combat-turn.ts";
import { resolveWorldLogic, worldLogicContext } from "../src/lib/rulesets/world-logic.ts";
import { WORLD_LOGIC_REF } from "../src/lib/rulesets/profiles.ts";
import {
  checkModifier,
  resolveMechanics,
  validatePlan,
} from "../src/lib/gameplay/mechanics/resolve.ts";
import { recordServerRoll } from "../src/lib/gameplay/dice.ts";

const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    return specifier === "server-only"
      ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
      : nextResolve(specifier, context);
  },
});
const { createWorldResolverProvider } = await import("../src/lib/server/world/resolver-provider.ts");
hook.deregister();

function physicalInput(text) {
  const f = worldFixture();
  f.snapshot.world.actors[1].publicName = "Synthetic enemy";
  f.input = { ...turn(f.source), input: text };
  return f;
}

function intent(f, method = "attack", armed = true) {
  return {
    schemaVersion: 4,
    input: f.input.input,
    actorId: id("player"),
    targetId: id("enemy"),
    method,
    itemId: armed ? id("weapon") : null,
    equipmentName: armed ? "weapon" : null,
  };
}

function resolve(f, selected, die = 20) {
  const validated = validateNaturalMechanicIntent(f, selected);
  const plan = naturalMechanicPlan(f.source, f.input, validated);
  validatePlan(f.source, f.input, plan);
  const checks = plan.checks.map((check) => recordServerRoll(
    f.input.operationId, check, checkModifier(f.source, check), 1, () => die,
  ));
  const resolution = resolveMechanics(f.source, f.input, plan, checks);
  return { plan, checks, resolution, after: applyResolution(f.source, resolution) };
}

function activeCombatInput(text) {
  const f = physicalInput("I strike him with my weapon.");
  f.source = resolve(f, intent(f), 1).after;
  f.source.runtime.participants.find((row) => row.entity_id === id("player")).public_resources.action = 1;
  f.input = { ...f.input, input: text, expectedRevision: f.source.runtime.revision,
    operationId: f.command.operationId, timeline: structuredClone(f.snapshot.timeline) };
  f.snapshot.ruleset = { ...WORLD_LOGIC_REF };
  f.snapshot.runtimeRevision = f.source.runtime.revision;
  f.command.expectedRuntimeRevision = f.source.runtime.revision;
  return f;
}

function combatStep(action, fields = {}) {
  return { action, targetId: null, itemId: null, equipmentName: null, position: null, ...fields };
}

for (const [text, steps, kinds] of [
  ["I duck behind the bar and insult him", [combatStep("move", { position: "cover" })], ["move"]],
  ["I raise my guard and tell him to come and get me", [combatStep("defend")], ["defend"]],
  ["I scream at him but do nothing", [], []],
  ["I step around the table and strike him with my weapon", [combatStep("move", { position: "nearby" }),
    combatStep("attack", { targetId: id("enemy"), itemId: id("weapon"), equipmentName: "weapon" })], ["move", "attack"]],
  ["I jump on the table to get advantage and slash him", [combatStep("attack", { targetId: id("enemy"), itemId: id("weapon"), equipmentName: "weapon" })], ["attack"]],
  ["I kick him toward the wall", [combatStep("attempt", { targetId: id("enemy") })], ["attempt"]],
  ["I shove him down, then stab him while prone", [combatStep("attempt", { targetId: id("enemy") })], ["attempt"]],
]) test(`bounded whole-turn interpretation: ${text}`, () => {
  const f = activeCombatInput(text);
  const selected = validateNaturalCombatTurn(f, { schemaVersion: 5, input: text,
    actorId: id("player"), steps });
  const plan = naturalCombatTurnPlan(f.source, f.input, selected);
  assert.deepEqual(plan.publicPatches.map((row) => row.action), kinds);
  assert.ok(plan.checks.length <= 1);
  assert.ok(plan.checks.every((row) => row.advantage === "normal"));
  validatePlan(f.source, f.input, plan);
  const checks = plan.checks.map((check) => recordServerRoll(f.input.operationId, check,
    checkModifier(f.source, check), 1, () => 1));
  const resolution = resolveMechanics(f.source, f.input, plan, checks);
  assert.ok(resolution.changes.every((row) =>
    ["encounter_participants", "pending_actions", "entities", "effects"].includes(row.family)));
  assert.ok(!resolution.changes.some((row) => row.family === "items" || row.values.conditions?.includes("taunted")));
  if (steps.length === 0) assert.deepEqual(resolution.changes, []);
  if (text.includes("kick him toward") || text.includes("shove him down"))
    assert.ok(!resolution.changes.some((row) => row.family === "entities"));
});

test("whole-turn intent rejects duplicate budget steps, forged effects and missing target", () => {
  const f = activeCombatInput("I move and defend.");
  const base = { schemaVersion: 5, input: f.input.input, actorId: id("player"), steps: [] };
  for (const steps of [
    [combatStep("move", { position: "cover" }), combatStep("move", { position: "nearby" })],
    [combatStep("attack", { targetId: id("enemy") }), combatStep("defend")],
    [combatStep("attack", { targetId: id("missing") })],
    [combatStep("attack", { targetId: id("enemy"), advantage: "advantage" })],
    [combatStep("move", { position: "cover", targetId: id("enemy") })],
  ]) assert.throws(() => validateNaturalCombatTurn(f, { ...base, steps }));
  assert.match(NATURAL_COMBAT_TURN_GUIDANCE, /at most one Move and one Action/);
  assert.match(NATURAL_COMBAT_TURN_GUIDANCE, /unproven result/);
});

test("resolver transport exposes only bounded public encounter options for a whole turn", async () => {
  const f = activeCombatInput("I duck behind the bar and insult him");
  let request;
  const output = { action: { schemaVersion: 5, input: f.input.input,
    actorId: id("player"), steps: [combatStep("move", { position: "cover" })] } };
  const provider = createWorldResolverProvider({ apiKey: "synthetic", model: "gpt-6-astra",
    fetcher: async (_url, init) => {
      request = JSON.parse(init.body);
      return new Response(JSON.stringify({ status: "completed", model: "gpt-6-astra",
        output: [{ type: "message", role: "assistant", status: "completed",
          content: [{ type: "output_text", text: JSON.stringify(output) }] }],
        usage: { input_tokens: 20, output_tokens: 10 } }), { status: 200 });
    } });
  const result = await provider.action(f);
  assert.equal(result.output.schemaVersion, 5);
  assert.equal(JSON.parse(request.input).naturalCombatTurnOptions.participants.find((row)=>row.controlled).action,1);
  assert.match(request.instructions,/ordered steps with at most one Move and one Action/);
});

// Starting an encounter stamps the NPC revision even when scaling retains its HP.
const entityValues = (source) => source.snapshot.entities.map((row) => ({ ...row, revision: 0 }));

// These fixtures provide the intended semantic classification explicitly.
// They verify its deterministic authority, not a mocked model's comprehension.
for (const text of [
  "I leap onto the table to gain advantage and slash him with my weapon.",
  "I make a feint to his left, then stab with my weapon.",
  "I strike him with my weapon to stun him.",
  "I aim my weapon at his hand to disarm him.",
]) test(`attack phrasing authorizes one ordinary strike only: ${text}`, () => {
  const f = physicalInput(text);
  const before = structuredClone(f.source);
  const { plan, after } = resolve(f, intent(f));
  assert.equal(plan.checks.length, 1);
  assert.equal(plan.checks[0].kind, "attack");
  assert.equal(plan.checks[0].advantage, "normal");
  assert.deepEqual(plan.publicPatches.map((patch) => patch.kind), ["encounter.start", "encounter.action"]);
  assert.equal(plan.publicPatches[1].action, "attack");
  assert.equal(plan.publicPatches[1].position, null);
  assert.equal(after.snapshot.entities.find((row) => row.id === id("enemy")).hp, 3);
  assert.deepEqual(after.snapshot.items, before.snapshot.items);
  assert.deepEqual(after.snapshot.entities.map((row) => row.conditions), before.snapshot.entities.map((row) => row.conditions));
  assert.ok(after.runtime.participants.every((row) => row.public_position.position === "nearby"));
  assert.equal(after.runtime.participants.find((row) => row.entity_id === id("player")).public_resources.action, 0);
  assert.match(plan.narration, /one independently consequential player action/);
  assert.match(plan.narration, /any separately validated autonomous response/);
  assert.match(plan.narration, /no successful preparation, advantage or positional change/);
  assert.match(plan.narration, /Do not claim stun, disarm, forced movement, a later strike, taking valuables/);
});

for (const text of [
  "I shove him back, then stab him with my weapon.",
  "I kick him toward the wall to force him out of my way.",
  "I catch his weapon hand and try to wrench the weapon away.",
  "I grab a mug, throw it at his face, and while he is stunned take the gold.",
]) test(`bounded first attempt grants no follow-through: ${text}`, () => {
  const f = physicalInput(text);
  const before = structuredClone(f.source);
  const { plan, after } = resolve(f, intent(f, "improvise", false));
  assert.equal(plan.checks.length, 1);
  assert.equal(plan.checks[0].kind, "skill");
  assert.equal(plan.publicPatches[1].action, "attempt");
  assert.equal(plan.publicPatches[1].itemId, null);
  assert.equal(plan.publicPatches[1].position, null);
  assert.deepEqual(entityValues(after), entityValues(before));
  assert.deepEqual(after.snapshot.items, before.snapshot.items);
  assert.deepEqual(after.snapshot.publicState, before.snapshot.publicState);
  assert.ok(after.runtime.participants.every((row) => row.public_position.position === "nearby"));
  assert.equal(after.runtime.participants.find((row) => row.entity_id === id("player")).public_resources.action, 0);
  assert.match(plan.narration, /No stun, condition, damage, transfer, or later conditional step was authorized/);
});

test("an injuring kick remains an unarmed attack; desired displacement is never free", () => {
  const f = physicalInput("I kick him hard in the ribs, hoping he lands against the wall.");
  const { plan, after } = resolve(f, intent(f, "attack", false));
  assert.equal(plan.checks[0].kind, "attack");
  assert.equal(plan.publicPatches[1].itemId, null);
  assert.ok(after.runtime.participants.every((row) => row.public_position.position === "nearby"));
  assert.deepEqual(after.snapshot.entities.map((row) => row.conditions), [[], [], []]);
  assert.match(plan.narration, /unarmed attack/);
});

test("called strikes still miss and established conditions alone determine advantage", () => {
  const f = physicalInput("I rise above him and strike to stun and disarm him.");
  const missed = resolve(f, intent(f), 1);
  assert.deepEqual(entityValues(missed.after), entityValues(f.source));
  assert.equal(missed.checks[0].success, false);
  f.source.snapshot.entities[0].conditions = ["advantage:attack"];
  const plan = naturalMechanicPlan(f.source, f.input, validateNaturalMechanicIntent(f, intent(f)));
  assert.equal(plan.checks[0].advantage, "advantage");
  f.source.snapshot.entities[0].conditions.push("disadvantage:attack");
  assert.equal(naturalMechanicPlan(f.source, f.input, intent(f)).checks[0].advantage, "normal");
});

test("semantic intent rejects effect fields, altered input, missing equipment and ineligible targets", () => {
  const f = physicalInput("I strike with my weapon.");
  const selected = intent(f);
  for (const fields of [
    { conditions: ["stunned"] }, { advantage: "advantage" }, { position: "cover" },
    { input: "I attack." }, { itemId: id("missing") }, { equipmentName: "invented sword" },
    { actorId: id("enemy") }, { targetId: id("companion") },
  ]) assert.throws(() => validateNaturalMechanicIntent(f, { ...selected, ...fields }));
  f.snapshot.world.actors[1].publicName = null;
  assert.throws(() => validateNaturalMechanicIntent(f, selected));
});

test("pure taunt or demand has no combat effect and a hidden identity remains unsupported", () => {
  for (const text of ["You're too afraid to hit me.", "Give me your gold or else."]) {
    const f = logicFixture();
    f.input.input = text;
    const p = proposal(f, { schemaVersion: 2, action: "speak", capabilityRefs: [], elapsedMinutes: 0, consequences: [] });
    const result = resolveWorldLogic(f, p);
    assert.equal(result.status, "staged");
    assert.deepEqual(result.resolution.changes, []);
    assert.deepEqual(result.resolution.outcomes.map((row) => row.kind), ["world.logic.receipt"]);
  }
  const f = logicFixture();
  f.input.input = "Tell me who the secret murderer is.";
  assert.deepEqual(resolveWorldLogic(f, proposal(f, {
    schemaVersion: 2, action: "speak", outcome: "blocked",
    uncertainty: "unsupported", elapsedMinutes: 0, consequences: [],
  })), { status: "paused", reason: "unsupported" });
});

test("the actual player request carries the same consequence-based guidance as public context", async () => {
  const f = logicFixture();
  const context = worldLogicContext(f);
  assert.ok(context.constraints.includes(NATURAL_PHYSICAL_ACTION_GUIDANCE));
  assert.match(NATURAL_PHYSICAL_ACTION_GUIDANCE, /first independently consequential uncertain action/);
  assert.match(NATURAL_PHYSICAL_ACTION_GUIDANCE, /not the first verb or a keyword/);
  assert.match(NATURAL_PHYSICAL_ACTION_GUIDANCE, /Pure speech, threats, demands and taunts/);
  let request;
  const provider = createWorldResolverProvider({
    apiKey: "synthetic", model: "gpt-6-astra",
    fetcher: async (_url, init) => {
      request = JSON.parse(init.body);
      return new Response(JSON.stringify({
        status: "completed", model: "gpt-6-astra",
        output: [{ type: "message", role: "assistant", status: "completed",
          content: [{ type: "output_text", text: JSON.stringify({ action: proposal(f, { schemaVersion: 2, consequences: [] }) }) }] }],
        usage: { input_tokens: 20, output_tokens: 10 },
      }), { status: 200 });
    },
  });
  await provider.action(f);
  assert.ok(request.instructions.includes(NATURAL_PHYSICAL_ACTION_GUIDANCE));
  assert.doesNotMatch(request.instructions, /select only the first uncertain physical step/);
  assert.match(request.instructions, /Threats and demands are speech, never mechanic or Foundation transfers/);
  assert.match(request.instructions, /Who is secretly the murderer/);
  assert.equal(JSON.stringify(request).includes("SYNTHETIC_PRIVATE_MARKER"), false);
});
