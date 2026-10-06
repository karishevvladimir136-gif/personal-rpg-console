import assert from "node:assert/strict";
import { ShadowJournal, runShadowTurn } from "./prototype.mjs";
import { IDS } from "./frozen-data.mjs";
import { acceptanceArc, acceptanceIds, acceptanceInitialState, acceptanceInput,
  acceptanceSnapshot, appendAcceptanceHistory, assertAcceptanceState,
  composeAcceptancePacket, deterministicAcceptanceRandom } from "./mechanical-acceptance.mjs";

const change = (family, id, expectedRevision, values) => ({ family, id, expectedRevision, values });
const proposal = (input, state, transcript, changes, narration, worldMinutes) => ({
  schemaVersion: 1, operationId: input.operationId, campaignId: input.campaignId,
  expectedRevision: input.expectedRevision, input: input.input,
  narration, visualDescription: narration.slice(0, 400), publicChanges: changes,
  privateChanges: [], memoryCandidates: [],
  rollRefs: transcript.filter((row) => row.result.kind !== "query").map((row) => row.result.id),
  worldMinutes: worldMinutes ?? state.worldMinutes, clarification: null,
});
const tool = (call) => ({ type: "tool", call });
const final = (value) => ({ type: "final", proposal: value });

function fakeDmStep(scenario, input, state, transcript) {
  const turn = scenario.turnNumber;
  if (turn === 1) return final(proposal(input, state, transcript,
    [change("location", IDS.mine, null, {})],
    "Mara and Orin reach the Old Mine. A fixed old stone lamp with a working spark wheel waits at the entrance; Orin is here by his own prior agreement to address the unresolved map promise.",
    state.worldMinutes + 30));
  if (turn === 2) return final(proposal(input, state, transcript,
    [change("items", IDS.oil, state.items[IDS.oil].revision, { quantity: 0 })],
    "Mara empties her final oil flask into the fixed mine lamp and lights it with the working spark wheel. The flask is now empty.",
    state.worldMinutes + 2));
  if (turn === 3) {
    if (transcript.length === 0) return tool({ kind: "skill", actorId: IDS.hero, dc: 15 });
    assert.equal(transcript.length, 1);
    return final(proposal(input, state, transcript, [],
      "The server's successful check lets Mara cross the unstable timbered passage. The Mine Stalker waits beyond; the passage remains dangerous.",
      state.worldMinutes + 3));
  }
  if ([4, 5, 6].includes(turn)) {
    const enemyAttacks = turn === 5;
    const actorId = enemyAttacks ? acceptanceIds.stalker : IDS.hero;
    const targetId = enemyAttacks ? IDS.hero : acceptanceIds.stalker;
    const itemId = enemyAttacks ? acceptanceIds.claw : IDS.sword;
    if (transcript.length === 0) return tool({ kind: "attack", actorId, targetId, itemId });
    if (transcript.length === 1) {
      assert.equal(transcript[0].result.success, true);
      return tool({ kind: "damage", actorId, targetId, itemId });
    }
    assert.equal(transcript.length, 2);
    const damage = transcript[1].result.total;
    assert.equal(damage, 4);
    if (turn === 4) return final(proposal(input, state, transcript, [
      change("actors", IDS.hero, state.actors[IDS.hero].revision, { resources: { focus: 1 } }),
      change("actors", acceptanceIds.stalker, state.actors[acceptanceIds.stalker].revision, { hp: 4 }),
    ], "Mara spends one Focus; her server-checked sword strike deals four damage. The Mine Stalker is wounded but still alive.",
    state.worldMinutes + 1));
    if (turn === 5) return final(proposal(input, state, transcript,
      [change("actors", IDS.hero, state.actors[IDS.hero].revision, { hp: 6 })],
      "The Mine Stalker's server-checked claw strike hits Mara for four damage. She remains standing at six HP; the injury persists.",
      state.worldMinutes + 1));
    return final(proposal(input, state, transcript,
      [change("actors", acceptanceIds.stalker, state.actors[acceptanceIds.stalker].revision, { hp: 0 })],
      "Mara's second server-checked sword strike deals four damage, reducing the Mine Stalker from four HP to zero. It falls; Mara is still hurt.",
      state.worldMinutes + 1));
  }
  if (turn === 7) {
    if (transcript.length === 0) return tool({ kind: "query", scope: "current-public" });
    assert.equal(transcript.length, 1);
    assert.equal(transcript[0].result.actors[IDS.hero].hp, 6);
    assert.equal(transcript[0].result.actors[IDS.hero].resources.focus, 1);
    assert.equal(transcript[0].result.items[IDS.oil].quantity, 0);
    return final(proposal(input, state, transcript, [],
      "At the mine entrance, Mara is at six HP with one Focus and no oil. She does not rest or heal. Orin sits beside her; the unresolved promise to return his father's map is still between them.",
      state.worldMinutes + 2));
  }
  if (turn === 8) return final(proposal(input, state, transcript,
    [change("location", IDS.tavern, null, {})],
    "Mara and Orin return to the Copper Lantern with Mara still hurt and her oil gone. On the road she raises her promise about his father's map. Orin remembers and asks when she will return it; he offers no automatic forgiveness.",
    state.worldMinutes + 35));
  throw Error("unknown acceptance turn");
}

/** Exact eight-turn fake-DM proof, with no network or owner data. */
export async function runMechanicalPreflight(path) {
  const journal = await ShadowJournal.open(path, acceptanceInitialState());
  const trajectory = [];
  for (const scenario of acceptanceArc) {
    const state = journal.data.campaign;
    const input = acceptanceInput(scenario, state);
    const before = acceptanceSnapshot(state);
    const { packet, selection } = composeAcceptancePacket(scenario, state);
    assert.ok(selection.cards.length <= 2);
    assert.ok(!selection.cards.some((row) => row.key === "cognitive-world" &&
      !scenario.input.toLowerCase().includes("mystery")));
    assert.ok(!Object.keys(packet.protagonist.resources).some((key) =>
      ["action", "move", "reaction"].includes(key)));
    if (scenario.turnNumber >= 7)
      assert.ok(packet.consoleContext.retrievedMemory.some((row) => row.id === "promise-1"));
    if (scenario.turnNumber === 7) {
      assert.equal(packet.protagonist.hp, 6);
      assert.equal(packet.protagonist.resources.focus, 1);
      assert.equal(packet.consoleContext.structuredState.items[IDS.oil].quantity, 0);
    }
    const result = await runShadowTurn({ journal, input, composeContext: async () => packet,
      dm: { next: ({ transcript }) => fakeDmStep(scenario, input, state, transcript) },
      randomForTool: ({ call }) => deterministicAcceptanceRandom({ turnNumber: scenario.turnNumber, call }) });
    const receipts = journal.get(input.operationId).checkpoint.tools;
    const after = acceptanceSnapshot(journal.data.campaign);
    assertAcceptanceState(scenario.turnNumber, before, after, receipts, result);
    const memory = await appendAcceptanceHistory(journal, scenario, result);
    assert.ok(memory.some((row) => row.sourceSceneId === `acceptance-scene-${scenario.turnNumber}`));
    trajectory.push({ turnNumber: scenario.turnNumber, before, after,
      receipts: receipts.map((row) => ({ kind: row.result.kind, dice: row.result.dice ?? [],
        total: row.result.total ?? null, success: row.result.success ?? null })),
      selection });
  }
  const beforeRejected = structuredClone(journal.data.campaign);
  const invalid = { ...acceptanceInput({ id: "arc-09", input: "I find another oil flask." }, beforeRejected) };
  await assert.rejects(runShadowTurn({ journal, input: invalid,
    composeContext: async () => ({ synthetic: true }), dm: { next: () => final(proposal(
      invalid, beforeRejected, [], [change("items", IDS.oil, beforeRejected.items[IDS.oil].revision,
        { quantity: 1 })], "An unsupported replacement oil flask appears.", beforeRejected.worldMinutes)) } }),
  /validation/);
  assert.deepEqual(journal.data.campaign, beforeRejected);
  assert.equal(journal.get(invalid.operationId).status, "failed");
  const finalState = acceptanceSnapshot(journal.data.campaign);
  assert.equal(finalState.locationId, IDS.tavern);
  assert.equal(finalState.maraHp, 6);
  assert.equal(finalState.maraFocus, 1);
  assert.equal(finalState.oilQuantity, 0);
  assert.equal(finalState.stalkerHp, 0);
  return { status: "passed", turns: trajectory.length, trajectory,
    rejectedNoOp: true, finalState };
}
