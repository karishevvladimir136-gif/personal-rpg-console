import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { ShadowJournal, validateFinal } from "../spikes/astra-primary-dm/prototype.mjs";
import { responseSchemaForPacket, writableCapabilities } from
"../spikes/astra-primary-dm/provider-contract.mjs";
import { IDS } from "../spikes/astra-primary-dm/frozen-data.mjs";
import { acceptanceArc, acceptanceIds, acceptanceInitialState, acceptanceInput, acceptanceSnapshot,
  assertAcceptanceState, composeAcceptancePacket, selectAcceptanceContext } from
"../spikes/astra-primary-dm/mechanical-acceptance.mjs";
import { runMechanicalPreflight } from "../spikes/astra-primary-dm/mechanical-preflight.mjs";

test("exact eight-turn mechanical acceptance fixture commits every required generic transition", async () => {
  const directory = await mkdtemp(join(tmpdir(), "astra-mechanical-preflight-"));
  try {
    const result = await runMechanicalPreflight(join(directory, "journal.json"));
    assert.equal(result.status, "passed");
    assert.equal(result.turns, 8);
    assert.equal(result.rejectedNoOp, true);
    assert.equal(result.trajectory[0].after.locationId, IDS.mine);
    assert.equal(result.trajectory[1].after.oilQuantity, 0);
    assert.deepEqual(result.trajectory[2].receipts.map((row) => row.kind), ["skill"]);
    assert.deepEqual(result.trajectory[3].receipts.map((row) => row.kind), ["attack", "damage"]);
    assert.deepEqual(result.trajectory[4].receipts.map((row) => row.kind), ["attack", "damage"]);
    assert.deepEqual(result.trajectory[5].receipts.map((row) => row.kind), ["attack", "damage"]);
    assert.deepEqual(result.trajectory[6].receipts.map((row) => row.kind), ["query"]);
    assert.deepEqual(result.finalState, { revision: 15, locationId: IDS.tavern,
      worldMinutes: 795, maraHp: 6, maraFocus: 1, oilQuantity: 0, stalkerHp: 0 });
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("candidate context keeps optional guidance selective and NPC models relevant", () => {
  const state = acceptanceInitialState();
  assert.deepEqual(Object.keys(state.actors[IDS.hero].resources), ["focus"]);
  assert.equal(state.actors[acceptanceIds.stalker].defense, 11);
  assert.equal(state.items[acceptanceIds.claw].damageBonus, 1);
  for (const scenario of acceptanceArc) {
    const selection = selectAcceptanceContext(scenario, state);
    assert.ok(selection.cards.length <= 2);
    assert.ok(!selection.cards.some((row) => row.key === "cognitive-world"));
  }
  const tavern = composeAcceptancePacket(acceptanceArc[0], state);
  assert.ok(tavern.selection.characterModelIds.includes(IDS.miner));
  assert.ok(tavern.selection.characterModelIds.includes(IDS.innkeeper));
  assert.ok(!Object.hasOwn(tavern.packet.consoleContext.structuredState.actors, acceptanceIds.stalker));
  state.currentLocationId = IDS.mine;
  const mine = composeAcceptancePacket(acceptanceArc[1], state);
  assert.deepEqual(mine.selection.characterModelIds, [IDS.miner]);
  assert.ok(Object.hasOwn(mine.packet.consoleContext.structuredState.actors, acceptanceIds.stalker));
  assert.ok(!Object.hasOwn(mine.packet.consoleContext.structuredState.actors, IDS.innkeeper));
  assert.equal(mine.packet.currentLocation.publicDescription.includes("working spark wheel"), true);
});

test("acceptance gate rejects a forged heal or extra patch even if the generic validator is permissive", () => {
  const state = acceptanceInitialState();
  const before = acceptanceSnapshot(state);
  const after = { ...before, revision: before.revision + 1, maraHp: 10 };
  assert.throws(() => assertAcceptanceState(7, { ...before, maraHp: 6,
    maraFocus: 1, oilQuantity: 0, stalkerHp: 0, locationId: IDS.mine }, after, [],
  { status: "committed", changes: [], narration: "I remember the map promise." }), /acceptance_state_callback/);
  assert.throws(() => assertAcceptanceState(7, before, { ...before, revision: before.revision + 1 }, [],
    { status: "committed", changes: [{ family: "items", id: IDS.oil }], narration: "The map." }),
  /acceptance_unexpected_patch/);
});

test("non-encounter provider contract removes tactical position and non-authoritative resource keys", () => {
  const state = acceptanceInitialState();
  const { packet } = composeAcceptancePacket(acceptanceArc[0], state);
  const capabilities = writableCapabilities(packet);
  assert.equal(packet.activeEncounter, null);
  assert.deepEqual(capabilities.actors.find((actor) => actor.id === IDS.hero).resourceKeys, ["focus"]);
  assert.ok(capabilities.actors.every((actor) => !actor.positionWritable));
  const schema = responseSchemaForPacket(packet);
  const branches = schema.properties.proposal.anyOf[0].properties.publicChanges.items.anyOf;
  const actors = branches.filter((branch) => branch.properties.family.enum[0] === "actors");
  assert.ok(actors.every((branch) => branch.properties.values.properties.position.type === "null"));
  const hero = actors.find((branch) => branch.properties.id.enum.includes(IDS.hero));
  assert.deepEqual(Object.keys(hero.properties.values.properties.resources.anyOf[0].properties), ["focus"]);
  assert.ok(!JSON.stringify(hero.properties.values.properties.resources).match(/"action"|"move"|"reaction"/));
  const item = branches.find((branch) => branch.properties.family.enum[0] === "items");
  const location = branches.find((branch) => branch.properties.family.enum[0] === "location");
  assert.ok(item.properties.id.enum.includes(IDS.oil));
  assert.ok(location.properties.id.enum.includes(IDS.mine));
});

test("exploration check and scene can commit without Move, while location travel still needs time", async () => {
  const directory = await mkdtemp(join(tmpdir(), "astra-mechanical-contract-"));
  try {
    const state = acceptanceInitialState();
    const journal = await ShadowJournal.open(join(directory, "journal.json"), state);
    const input = acceptanceInput(acceptanceArc[0], state);
    const turn = await journal.begin(input);
    const base = { schemaVersion: 1, operationId: input.operationId,
      campaignId: input.campaignId, expectedRevision: input.expectedRevision,
      input: input.input, narration: "They travel to the Old Mine.",
      visualDescription: "At the mine entrance.", privateChanges: [],
      memoryCandidates: [], rollRefs: [], worldMinutes: state.worldMinutes,
      clarification: null };
    const location = { family: "location", id: IDS.mine, expectedRevision: null, values: {} };
    assert.throws(() => validateFinal(state, turn, { ...base, publicChanges: [location] }), /validation/);
    assert.doesNotThrow(() => validateFinal(state, turn, { ...base,
      worldMinutes: state.worldMinutes + 1, publicChanges: [location] }));
    const proof = await runMechanicalPreflight(join(directory, "preflight.json"));
    assert.equal(proof.trajectory[2].after.locationId, IDS.mine);
    assert.equal(proof.trajectory[2].after.maraFocus, 2);
    assert.equal(proof.trajectory[2].receipts[0].success, true);
    assert.deepEqual(proof.trajectory[2].selection.characterModelIds, [IDS.miner]);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("encounter position still needs an authoritative Move decrement; unknown resources remain invalid", async () => {
  const directory = await mkdtemp(join(tmpdir(), "astra-mechanical-encounter-"));
  try {
    const state = acceptanceInitialState();
    state.actors[IDS.hero].resources.move = 1;
    state.activeEncounter = { round: 1, activeActorId: IDS.hero };
    const { packet } = composeAcceptancePacket(acceptanceArc[0], state);
    const capabilities = writableCapabilities(packet);
    assert.equal(capabilities.actors.find((actor) => actor.id === IDS.hero).positionWritable, true);
    const schema = responseSchemaForPacket(packet);
    const branches = schema.properties.proposal.anyOf[0].properties.publicChanges.items.anyOf;
    const hero = branches.find((branch) => branch.properties.family.enum[0] === "actors" &&
      branch.properties.id.enum.includes(IDS.hero));
    assert.ok(hero.properties.values.properties.position.enum.includes("far"));
    assert.deepEqual(Object.keys(hero.properties.values.properties.resources.anyOf[0].properties),
      ["focus", "move"]);
    const journal = await ShadowJournal.open(join(directory, "journal.json"), state);
    const input = acceptanceInput(acceptanceArc[0], state);
    const turn = await journal.begin(input);
    const base = { schemaVersion: 1, operationId: input.operationId,
      campaignId: input.campaignId, expectedRevision: input.expectedRevision,
      input: input.input, narration: "Mara moves within the encounter.",
      visualDescription: "Mara crosses the floor.", privateChanges: [],
      memoryCandidates: [], rollRefs: [], worldMinutes: state.worldMinutes,
      clarification: null };
    const actor = (values) => ({ family: "actors", id: IDS.hero,
      expectedRevision: state.actors[IDS.hero].revision, values });
    assert.throws(() => validateFinal(state, turn, { ...base,
      publicChanges: [actor({ position: "far" })] }), /validation/);
    assert.doesNotThrow(() => validateFinal(state, turn, { ...base,
      publicChanges: [actor({ position: "far", resources: { move: 0 } })] }));
    assert.throws(() => validateFinal(state, turn, { ...base,
      publicChanges: [actor({ resources: { action: 0 } })] }), /validation/);
    state.activeEncounter = null;
    const outside = responseSchemaForPacket(composeAcceptancePacket(acceptanceArc[0], state).packet);
    const outsideHero = outside.properties.proposal.anyOf[0].properties.publicChanges.items.anyOf
      .find((branch) => branch.properties.family.enum[0] === "actors" &&
        branch.properties.id.enum.includes(IDS.hero));
    assert.equal(outsideHero.properties.values.properties.position.type, "null");
  } finally { await rm(directory, { recursive: true, force: true }); }
});
