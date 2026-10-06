import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { IDS } from "../spikes/astra-primary-dm/frozen-data.mjs";
import { acceptanceArc, acceptanceIds, acceptanceInitialState, acceptanceSnapshot,
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
