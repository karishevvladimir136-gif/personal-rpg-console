import frozenCraft from "../../test-fixtures/mega-dm/frozen-craft-v1.json" with { type: "json" };
import frozenCognitiveCraft from "../../test-fixtures/mega-dm/frozen-cognitive-craft-v2.json" with { type: "json" };
import { composeEvaluationPacket } from "./evaluation.mjs";
import { IDS, frozenCampaign, frozenCharacterModels, historicalMemory } from "./frozen-data.mjs";

export const acceptanceIds = Object.freeze({
  stalker: "00000000-0000-4000-8000-000000000513",
  claw: "00000000-0000-4000-8000-000000000514",
});

export const acceptanceArc = Object.freeze([
  ["Orin, let's go back to the Old Mine and deal with this properly. I head there with him.", "location"],
  ["I use my last oil flask in the old mine lamp and light it.", "inventory"],
  ["I cross the unstable timbered passage carefully. If it isn't safe, the roll decides whether I make it through.", "skill"],
  ["I spend one Focus and commit to a sword strike against the Mine Stalker. Roll it honestly.", "player attack"],
  ["I hold my ground. Resolve the Stalker's attack before I act again. Don't protect me from the consequences.", "enemy attack"],
  ["I attack it again with the short sword. If the roll is enough to finish it, finish it. If not, it stays alive.", "second attack"],
  ["I do not rest or heal. I check my condition and my pack, then sit at the mine entrance for a quiet moment and think about what I still owe Orin.", "state and Memory"],
  ["I head back to the Copper Lantern with Orin. On the way, I bring up my promise about his father's map instead of pretending I've forgotten it.", "return and callback"],
].map(([input, purpose], index) => Object.freeze({ id: `arc-${String(index + 1).padStart(2, "0")}`,
  turnNumber: index + 1, input, purpose,
  situation: index === 0 ? "tavern" : "mine" })));

export function acceptanceInitialState() {
  const state = frozenCampaign();
  state.activeEncounter = null;
  for (const actor of Object.values(state.actors)) actor.resources = {};
  state.actors[IDS.hero].resources = { focus: 2 };
  state.actors[acceptanceIds.stalker] = { id: acceptanceIds.stalker, campaignId: IDS.campaign,
    revision: 1, name: "Mine Stalker", hp: 8, maxHp: 8, defense: 11,
    stats: { skill: 0, attack: 2, save: 0 }, resources: {}, position: "nearby",
    locationId: IDS.mine };
  state.items[acceptanceIds.claw] = { id: acceptanceIds.claw, campaignId: IDS.campaign,
    revision: 1, name: "Claw", ownerId: acceptanceIds.stalker, quantity: 1,
    equipped: true, attackBonus: 0, damageDice: { count: 1, sides: 4 }, damageBonus: 1 };
  state.locations[IDS.mine].publicDescription =
    "At the entrance stands a fixed old stone lamp with a working spark wheel; the passage beyond is timbered and unstable.";
  state.recentScenes = [{ id: "acceptance-opening", text:
    "The argument at the Copper Lantern is over. Orin has rested and already agreed to accompany Mara back to the Old Mine specifically to deal with the unresolved promise about his father's map. The innkeeper is not blocking the exit." }];
  state.historicalMemory = structuredClone(historicalMemory);
  state.characterModels = structuredClone(frozenCharacterModels);
  return state;
}

const doctrineSource = frozenCognitiveCraft.versions.find((row) => row.kind === "doctrine" && row.key === "core-doctrine");
const compactDoctrine = {
  key: doctrineSource.key, version: doctrineSource.version,
  guidance: "The player owns intent; established world state owns outcome. Good preparation grants leverage, information or improved odds, never guaranteed success; do not punish it arbitrarily. Let supported choices leave durable fingerprints and uncertainty remain real. People have independent goals, bounded knowledge and recognizable identities; they can care without obeying. Power may grow, but meaning should grow faster. Preserve source, rules, secrecy and controlled-PC agency.",
};
const optionalCards = [
  ...frozenCraft.versions.filter((row) => row.kind === "card").map((row) => ({ ...row, family: "craft" })),
  ...frozenCognitiveCraft.versions.filter((row) => row.kind === "card").map((row) => ({ ...row, family: "cognitive" })),
];

export function selectAcceptanceContext(scenario, state) {
  const lower = scenario.input.toLocaleLowerCase();
  const cards = optionalCards.map((row) => ({ row,
    score: row.triggers.filter((trigger) => lower.includes(trigger.toLocaleLowerCase())).length }))
    .filter(({ row, score }) => score > 0 && row.stages.includes("plan"))
    .sort((a, b) => b.score - a.score || a.row.key.localeCompare(b.row.key))
    .slice(0, 2).map(({ row }) => ({ family: row.family, key: row.key,
      version: row.version, ...row.en }));
  const present = [IDS.miner]; // Orin accompanies Mara throughout this eight-turn fixture.
  if (state.currentLocationId === IDS.tavern) present.push(IDS.innkeeper);
  return { cards, characterModels: Object.fromEntries(present
    .filter((id) => state.characterModels?.[id]).map((id) => [id, state.characterModels[id]])) };
}

export function composeAcceptancePacket(scenario, state) {
  const packet = composeEvaluationPacket(scenario, "B", state, { sequential: true }).packet;
  const selection = selectAcceptanceContext(scenario, state);
  const visible = new Set([IDS.hero, IDS.miner,
    ...(state.currentLocationId === IDS.tavern ? [IDS.innkeeper] : [acceptanceIds.stalker])]);
  packet.consoleContext.structuredState.actors = Object.fromEntries(
    Object.entries(packet.consoleContext.structuredState.actors).filter(([id]) => visible.has(id)));
  packet.consoleContext.structuredState.items = Object.fromEntries(
    Object.entries(packet.consoleContext.structuredState.items).filter(([, item]) => visible.has(item.ownerId)));
  const memory = packet.consoleContext.retrievedMemory;
  if (scenario.turnNumber >= 7 && !memory.some((row) => row.id === "promise-1")) {
    const source = state.historicalMemory.find((row) => row.id === "promise-1");
    if (!source) throw Error("required old-promise source missing");
    memory.push({ id: source.id, ref: { campaignId: state.campaignId, kind: "event", id: source.id,
      version: "1", part: 0, visibility: "public" }, text: source.text,
    attribution: null, statementKind: "fact", unresolved: source.unresolved });
  }
  packet.dmGuidance = {
    doctrine: compactDoctrine,
    campaignStyle: { descriptionDensity: "balanced", failForward: "consequences", dramaticPace: "measured" },
    proseEconomy: "Preserve Astra's natural DM behavior, suspense, character voice, consequential rolls, tactical clarity and earned callbacks. Describe each consequence once, strongly; compress repetition and connective prose. Aim for roughly 15–20% tighter prose than unconstrained dramatic output without turning narration into a combat log.",
    craftCards: selection.cards.filter((row) => row.family === "craft"),
    cognitiveCraftCards: selection.cards.filter((row) => row.family === "cognitive"),
    characterModels: selection.characterModels,
  };
  return { packet, selection: { doctrine: compactDoctrine.key,
    cards: selection.cards.map(({ family, key, version }) => ({ family, key, version })),
    characterModelIds: Object.keys(selection.characterModels) } };
}

export function acceptanceInput(scenario, state) {
  return { operationId: `mechanical-acceptance-${scenario.id}`,
    campaignId: state.campaignId, timeline: state.timeline,
    expectedRevision: state.revision, input: scenario.input };
}

export function deterministicAcceptanceRandom({ turnNumber, call }) {
  if (call.kind === "query") return () => { throw Error("query must not roll dice"); };
  const rolls = {
    3: { skill: { value: 18, max: 21 } },
    4: { attack: { value: 13, max: 21 }, damage: { value: 3, max: 7 } },
    5: { attack: { value: 15, max: 21 }, damage: { value: 3, max: 5 } },
    6: { attack: { value: 14, max: 21 }, damage: { value: 3, max: 7 } },
  };
  const roll = rolls[turnNumber]?.[call.kind];
  if (!roll) throw Error(`unexpected acceptance random tool: turn ${turnNumber}/${call.kind}`);
  return (min, max) => {
    if (min !== 1 || max !== roll.max) throw Error("acceptance die range mismatch");
    return roll.value;
  };
}

export async function appendAcceptanceHistory(journal, scenario, publicResult) {
  const state = journal.data.campaign;
  const sceneId = `acceptance-scene-${scenario.turnNumber}`;
  state.recentScenes = [...state.recentScenes, { id: sceneId, text: publicResult.narration }];
  state.historicalMemory = [...state.historicalMemory,
    { id: sceneId, sourceSceneId: sceneId, text: publicResult.narration,
      entityIds: [], unresolved: false, authority: "history" },
    ...publicResult.publicMemory.map((row, index) => ({
      id: `acceptance-memory-${scenario.turnNumber}-${index}`, sourceSceneId: sceneId,
      text: row.text, entityIds: [], unresolved: false, authority: "history" }))];
  await journal.flush();
  return state.historicalMemory.filter((row) => row.sourceSceneId === sceneId);
}

export function acceptanceSnapshot(state) {
  return { revision: state.revision, locationId: state.currentLocationId,
    worldMinutes: state.worldMinutes, maraHp: state.actors[IDS.hero].hp,
    maraFocus: state.actors[IDS.hero].resources.focus,
    oilQuantity: state.items[IDS.oil].quantity,
    stalkerHp: state.actors[acceptanceIds.stalker].hp };
}

export function assertAcceptanceState(turnNumber, before, after, receipts = [], publicResult) {
  if (publicResult?.status !== "committed") throw Error("acceptance_not_committed");
  const expectedChanges = {
    1: [`location:${IDS.mine}`], 2: [`items:${IDS.oil}`], 3: [],
    4: [`actors:${IDS.hero}`, `actors:${acceptanceIds.stalker}`],
    5: [`actors:${IDS.hero}`], 6: [`actors:${acceptanceIds.stalker}`],
    7: [], 8: [`location:${IDS.tavern}`],
  };
  const actualChanges = publicResult.changes.map((row) => `${row.family}:${row.id}`).sort();
  if (JSON.stringify(actualChanges) !== JSON.stringify(expectedChanges[turnNumber].sort()))
    throw Error("acceptance_unexpected_patch");
  if ([7, 8].includes(turnNumber) && !/map|promise/i.test(publicResult.narration))
    throw Error("acceptance_callback_missing");
  const checks = receipts.filter((row) => ["skill", "attack", "damage"].includes(row.result.kind));
  const kinds = checks.map((row) => row.result.kind).join(",");
  const same = (key) => after[key] === before[key];
  if (after.revision !== before.revision + 1) throw Error("acceptance_revision");
  if (turnNumber === 1 && !(after.locationId === IDS.mine && after.worldMinutes > before.worldMinutes &&
    same("maraHp") && same("maraFocus") && same("oilQuantity") && same("stalkerHp"))) throw Error("acceptance_location");
  if (turnNumber === 2 && !(after.oilQuantity === 0 && same("locationId") && same("maraHp") &&
    same("maraFocus") && same("stalkerHp"))) throw Error("acceptance_oil");
  if (turnNumber === 3 && !(kinds === "skill" && checks[0].result.dice[0] === 18 &&
    checks[0].result.success && same("locationId") && same("maraHp") && same("maraFocus") &&
    same("oilQuantity") && same("stalkerHp"))) throw Error("acceptance_skill");
  if (turnNumber === 4 && !(kinds === "attack,damage" && checks[0].result.dice[0] === 13 &&
    checks[0].result.success && checks[1].result.dice[0] === 3 && checks[1].result.total === 4 &&
    after.maraFocus === 1 && after.stalkerHp === 4 && same("maraHp") && same("oilQuantity") &&
    same("locationId"))) throw Error("acceptance_player_attack");
  if (turnNumber === 5 && !(kinds === "attack,damage" && checks[0].result.dice[0] === 15 &&
    checks[0].result.success && checks[1].result.dice[0] === 3 && checks[1].result.total === 4 &&
    after.maraHp === 6 && same("maraFocus") && same("stalkerHp") && same("oilQuantity") &&
    same("locationId"))) throw Error("acceptance_enemy_attack");
  if (turnNumber === 6 && !(kinds === "attack,damage" && checks[0].result.dice[0] === 14 &&
    checks[0].result.success && checks[1].result.dice[0] === 3 && checks[1].result.total === 4 &&
    after.stalkerHp === 0 && same("maraHp") && same("maraFocus") && same("oilQuantity") &&
    same("locationId"))) throw Error("acceptance_second_attack");
  if (turnNumber === 7 && !(after.locationId === IDS.mine && after.maraHp === 6 &&
    after.maraFocus === 1 && after.oilQuantity === 0 && after.stalkerHp === 0))
    throw Error("acceptance_state_callback");
  if (turnNumber === 8 && !(after.locationId === IDS.tavern && after.worldMinutes > before.worldMinutes &&
    after.maraHp === 6 && after.maraFocus === 1 && after.oilQuantity === 0 && after.stalkerHp === 0))
    throw Error("acceptance_return");
}
