// Multi-hero 1 (docs/stages/MULTI_HERO_1.md): the app's company table — the DM option `company` — on the loop's own
// fixture with a scripted DM. A1: nothing the DM is sent for the mode says «hero» (the frame, the dossier, the state,
// the tools, the tool results), while the story's own words go as they are. A3/A6: each player character earns and
// spends their own Heroic Inspiration; each player has their own allowed rerolls (the third of one player is refused
// while another still has two). A5: with the option off, the owner's table sends and counts exactly as before.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { resumeDmLoopTurn, dmLoopToolset } from "../src/lib/gameplay/dm-loop/loop.ts";
import { COMPANY_SENTENCES, COMPANY_TABLE, companyRequest, companyText, companyOpening, isPlayerCharacter } from "../src/lib/gameplay/dm-loop/company.ts";
import { DM_ROLE, WRITER_ROLE, BOOKKEEPER_ROLE, FRAME, TABLE_RULES, dmTurnShape, writerTurnShape } from "../src/lib/gameplay/dm-loop/roles.ts";
import { dmLoopTools } from "../src/lib/gameplay/dm-loop/tools.ts";
import { DM_OPTION_DEFAULTS, parseDmOptions } from "../src/lib/gameplay/dm-loop/options.ts";
import { rerollsLeft, rerollsLeftFor } from "../src/lib/gameplay/reroll-allowance.ts";
import { COMPANY_PREP, companyLinesOf, parsePrep } from "../src/lib/gameplay/dm-loop/hidden-layer.ts";
import { readFileSync } from "node:fs";

/** The opening's instructions as the provider sends them (its module is server-only: read from its source). */
const bootstrapInstructions = (() => {
  const source = readFileSync(new URL("../src/lib/server/adventure-bootstrap-provider.ts", import.meta.url), "utf8");
  const start = source.indexOf("export const bootstrapInstructions = `") + "export const bootstrapInstructions = `".length;
  return source.slice(start, source.indexOf("`;", start));
})();

const HERO = /\bhero\b/i;
const finish = (kind = "exploration") => ({ name: "finish_turn", arguments: { sceneKinds: [kind], spotlight: [], playerMoment: false } });
const command = (c, played, action, checkId = null) => ({ commandId: randomUUID(), campaignId: c.cid, operationId: played.input.operationId,
  timeline: played.input.timeline, action, checkId });
const sheet = (skills) => ({ schemaVersion: 2, mode: "structured_rpg", role: null, skills, saves: [] });
const noCheck = async () => ({ untold: [], undeclared: [], costUsdMicros: 0, error: null });

/** A loop campaign with two more player characters beside the wizard's record: companions, controlled and present. */
async function companyCampaign({ company = true } = {}) {
  const c = await loopCampaign();
  const hero = await c.f.one("select equipment_slots from public.rpg_entities where id=$1", [c.hero]);
  const ids = [];
  for (const [name, skill] of [["Sefa Marrin", "Insight +5"], ["Pell Dunmore", "Stealth +7"]]) {
    const saved = await c.f.mutation("entity.save", c.cid, { kind: "companion", name, details: `${name}, a player character.`, hp: 30, max_hp: 30,
      stats: { skill: 2, attack: 3, defense: 14 }, resources: {}, conditions: [], equipment_slots: hero.equipment_slots, character_sheet: sheet([skill]) });
    ids.push(saved.id);
  }
  await c.f.one("update public.rpg_entities set character_sheet=$2::jsonb where id=$1 returning id", [c.hero, JSON.stringify(sheet(["Athletics +6"]))]);
  const row = await c.f.one("select configuration from rpg_private.runtime_state where campaign_id=$1", [c.cid]);
  const config = row?.configuration ?? { profile: "console-basic-v1", controlledEntityIds: [c.hero], presentEntityIds: [c.hero], nearbyStorageIds: [], safeLocationIds: [], itemRules: [] };
  await c.f.one("update rpg_private.runtime_state set configuration=$2::jsonb, revision=revision+1 where campaign_id=$1 returning revision", [c.cid,
    JSON.stringify({ ...config, controlledEntityIds: [...config.controlledEntityIds, ...ids], presentEntityIds: [...new Set([...config.presentEntityIds, c.hero, ...ids])] })]);
  const current = await c.settings.read();
  await c.settings.save({ expectedRevision: current.revision, runtime: current.runtime, dmTurn: current.dmTurn,
    options: { companionRolls: "player", instructions: "en", ...(company ? { company: true } : {}) } });
  return { ...c, sefa: ids[0], pell: ids[1] };
}
const roll = (actorRef, skill, extra = {}) => ({ name: "roll", arguments: { formula: "1d20", kind: "skill", skill, reason: `${skill}: a try`, actorRef, visibility: "player", dc: 15, ...extra } });
const resources = async (c, id) => (await c.f.one("select resources from public.rpg_entities where id=$1", [id])).resources;

test("the option: absent by default, so the owner's stored options read exactly as before; parsed when a campaign sets it", () => {
  assert.equal("company" in DM_OPTION_DEFAULTS, false);
  assert.deepEqual(parseDmOptions({}), { continuation: "same", instructions: "ru", companionRolls: "dm", secretsVisible: false, memory: "standard", pureSimulation: false });
  assert.equal(parseDmOptions({ company: true }).company, true);
  assert.equal(parseDmOptions({ company: "yes" }).company, undefined);
  assert.equal(isPlayerCharacter({ id: "a", kind: "companion" }, ["a"], true), true);
  assert.equal(isPlayerCharacter({ id: "a", kind: "companion" }, ["a"], false), false, "at the owner's table a companion is not a player character");
  assert.equal(isPlayerCharacter({ id: "b", kind: "companion" }, ["a"], true), false, "not controlled: an NPC companion");
});

test("A1, the frame: every DM role, the turn shapes, the tools, the prep, the out-of-game answer and the opening read for a company — no «hero»", () => {
  const sources = [DM_ROLE, WRITER_ROLE, BOOKKEEPER_ROLE, dmTurnShape("English"), writerTurnShape("English"), JSON.stringify(dmLoopTools),
    readFileSync(new URL("../src/lib/gameplay/dm-loop/feedback.ts", import.meta.url), "utf8"), readFileSync(new URL("../src/lib/gameplay/dm-loop/roll-check.ts", import.meta.url), "utf8")].join("\n");
  for (const [from] of COMPANY_SENTENCES) assert.ok(sources.includes(from), `the sentence still stands in its source: ${from.slice(0, 70)}`);
  for (const text of [DM_ROLE, WRITER_ROLE, BOOKKEEPER_ROLE, dmTurnShape("English"), writerTurnShape("English"), JSON.stringify(dmLoopTools)]) {
    assert.match(text, HERO, "the owner's text names the hero (unchanged)");
    assert.doesNotMatch(companyText(text), HERO);
  }
  // The frame closes with the company's paragraph, once: no main character; the company moves when any of them acts.
  const role = companyText(DM_ROLE);
  assert.equal(role.split(COMPANY_TABLE).length, 2);
  assert.match(COMPANY_TABLE, /None of them is the main character/);
  assert.match(COMPANY_TABLE, /The company moves when any of them acts: you never wait on one character's decision/);
  assert.match(COMPANY_TABLE, /each player has their own allowed rerolls/);
  assert.doesNotMatch(role, /played at home by one person/);
  assert.match(role, /Each player character's will is their player's/);
  assert.match(companyText(TABLE_RULES), /each player character holds their own, one at a time/);
  assert.doesNotMatch(companyText(COMPANY_PREP), HERO);
  // The opening: its own paragraph replaced, the record sent as one player character among the company.
  const opening = companyOpening(bootstrapInstructions, { protagonist: { name: "Bram" }, language: "en" });
  assert.doesNotMatch(opening.instructions, HERO);
  assert.doesNotMatch(opening.instructions.slice(opening.instructions.indexOf("For opening")), /protagonist/);
  assert.deepEqual(opening.context, { language: "en", playerCharacter: { name: "Bram" } });
  assert.match(opening.instructions, /none of them the main character/);
  assert.ok(opening.instructions.startsWith(bootstrapInstructions.slice(0, bootstrapInstructions.indexOf("For opening"))), "the creation part as it was");
});

test("A1, the request: the story's own words and a player's message go as they are; everything else is rewritten; the toolset once", () => {
  const request = { system: [{ text: "the hero's will", cache: true }, { text: "Player wrote: a hero's welcome", cache: true, story: true }],
    messages: [{ role: "user", text: "Player: I am no hero." }, { role: "tool_results", results: [{ callId: "x", output: "{\"note\":\"The hero already holds it\"}", isError: false }] },
      { role: "user", text: "The player declared these actions of the hero, and the turn neither rolled them" }],
    toolset: dmLoopToolset };
  const out = companyRequest(request);
  assert.equal(out.system[0].text, "a player character's will");
  assert.equal(out.system[1], request.system[1], "the story block untouched");
  assert.equal(out.messages[0], request.messages[0], "the player's own message untouched");
  assert.doesNotMatch(out.messages[1].results[0].output, HERO);
  assert.match(out.messages[2].text, /^The players declared these actions of their characters/);
  assert.equal(companyRequest(request).toolset, out.toolset, "one rewritten toolset (the cached prefix stays byte-stable)");
  assert.doesNotMatch(JSON.stringify(out.toolset), HERO);
});

test("A1 and A6 on the loop: a company turn's every request says no «hero»; each player character's check is their own card", async () => {
  const c = await companyCampaign();
  try {
    const played = await c.turn("(Round 1 — one paragraph per character in this scene.)\n\nSefa Marrin: I watch his face.\n\nPell Dunmore: I slip past.", [
      { text: "Sefa reads him; Pell moves. ", toolCalls: [roll(c.sefa, "Insight"), roll(c.pell, "Stealth")] },
      { text: "Both done.", toolCalls: [finish()] }], { dice: [9, 11], deps: { rollCheck: noCheck } });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    assert.ok(played.model.requests.length >= 2);
    for (const request of played.model.requests) {
      for (const block of request.system) assert.doesNotMatch(block.text, HERO, block.text.match(/.{0,80}\bhero\b.{0,80}/i)?.[0]);
      assert.doesNotMatch(JSON.stringify(request.messages), HERO);
      assert.doesNotMatch(JSON.stringify(request.toolset), HERO);
    }
    // The state names the three alike: kind player, role player character; no record is the hero.
    const now = played.model.requests[0].system.at(-1).text;
    const state = JSON.parse(now.slice(now.indexOf("Current state")).split("\n")[1]);
    const pcs = state.characters.filter((row) => [c.hero, c.sefa, c.pell].includes(row.id));
    assert.deepEqual(pcs.map((row) => [row.kind, row.role]), [["player", "player character"], ["player", "player character"], ["player", "player character"]]);
    // Each check is its own character's card (A6).
    const checks = (await c.row(played.input.operationId)).checkpoint.checks;
    assert.deepEqual(checks.map((check) => check.actorId), [c.sefa, c.pell]);
  } finally { await c.f.db.close(); }
});

test("A3/A6: each player character earns Heroic Inspiration on a natural 20 and spends their own; at the owner's table a companion cannot", async () => {
  const c = await companyCampaign();
  try {
    for (const id of [c.hero, c.sefa, c.pell]) {
      const skill = id === c.hero ? "Athletics" : id === c.sefa ? "Insight" : "Stealth";
      const earned = await c.turn(`I try (${id}).`, [{ text: "A try. ", toolCalls: [roll(id, skill)] }, { text: "It works.", toolCalls: [finish()] }], { dice: [20], deps: { rollCheck: noCheck } });
      assert.equal(earned.result.status, "committed", JSON.stringify(c.errors));
      const [receipt] = (await c.row(earned.input.operationId)).checkpoint.dmLoop.receipts;
      assert.equal(receipt.result.value.inspirationAward.granted, true, `${skill}: granted`);
      assert.doesNotMatch(receipt.result.value.inspirationAward.note, HERO);
      assert.equal((await resources(c, id)).heroic_inspiration, 1);
      const spent = await c.turn(`I spend my Heroic Inspiration (${id}).`, [{ text: "Again. ", toolCalls: [roll(id, skill, { heroicInspiration: true })] }, { text: "So.", toolCalls: [finish()] }], { dice: [5], deps: { rollCheck: noCheck } });
      assert.equal(spent.result.status, "committed", JSON.stringify(c.errors));
      const [again] = (await c.row(spent.input.operationId)).checkpoint.dmLoop.receipts;
      assert.equal(again.result.ok, true, JSON.stringify(again.result));
      assert.deepEqual(again.result.value.heroicInspiration, { before: 1, after: 0 });
      assert.equal((await resources(c, id)).heroic_inspiration, 0, "spent: their own, nobody else's");
    }
  } finally { await c.f.db.close(); }
  const owner = await companyCampaign({ company: false });
  try {
    await owner.f.db.query("update public.rpg_entities set resources=resources||'{\"heroic_inspiration\":1}'::jsonb where id=$1", [owner.sefa]);
    const refused = await owner.turn("Sefa spends it.", [{ text: "Again. ", toolCalls: [roll(owner.sefa, "Insight", { heroicInspiration: true })] }, { text: "So.", toolCalls: [finish()] }], { dice: [5], deps: { rollCheck: noCheck } });
    const [receipt] = (await owner.row(refused.input.operationId)).checkpoint.dmLoop.receipts;
    assert.equal(receipt.result.ok, false);
    assert.match(receipt.result.reason, /Heroic Inspiration rerolls the hero's own die: actorRef is the hero\./, "the owner's table: unchanged");
  } finally { await owner.f.db.close(); }
});

/** One paused turn with one check of `actor`, rerolled `times` times; the reroll results. */
async function rerolls(c, actor, skill, times) {
  const played = await c.turn("I try.", [{ text: "A try. ", toolCalls: [roll(actor, skill)] }, { text: "Done.", toolCalls: [finish()] }], { dice: [3], autoContinue: false, deps: { rollCheck: noCheck } });
  assert.equal(played.result.status, "awaiting_confirmation", JSON.stringify(c.errors));
  const out = [];
  for (let i = 0; i < times; i++) {
    c.forceDice([4]);
    const turn = (await (await c.deps(played.model)).store.readPlay(c.cid)).turns.find((row) => row.id === played.input.operationId);
    out.push({ canReroll: turn.checks[0].canReroll });
    if (!turn.checks[0].canReroll) break;
    const result = await resumeDmLoopTurn(command(c, played, "reroll", played.result.checks[0].id), await c.deps(played.model, { rollCheck: noCheck }));
    out.at(-1).status = result.status;
  }
  const done = await resumeDmLoopTurn(command(c, played, "continue"), await c.deps(played.model, { rollCheck: noCheck }));
  assert.equal(done.status, "committed", JSON.stringify(c.errors));
  return out;
}

test("A3/A6: rerolls are counted per player — two each; the third of one is refused while the others still have theirs", async () => {
  const c = await companyCampaign();
  try {
    const bram = await rerolls(c, c.hero, "Athletics", 3);
    assert.deepEqual(bram.map((r) => r.canReroll), [true, true, false], "Bram's two, then none for Bram");
    for (const [id, skill] of [[c.sefa, "Insight"], [c.pell, "Stealth"]]) {
      const own = await rerolls(c, id, skill, 3);
      assert.deepEqual(own.map((r) => r.canReroll), [true, true, false], `${skill}: their own two, untouched by Bram's`);
    }
    const play = await (await c.deps(null)).store.readPlay(c.cid);
    const values = { difficulty: { rerolls: "limited", rerollsPerSession: 2 } };
    const session = play.turns.at(-1).session_id;
    for (const id of [c.hero, c.sefa, c.pell]) assert.equal(rerollsLeftFor(values, play.turns, session, id), 0);
    // The server's own count agrees: a reroll command beyond a character's two is refused by the SQL (the card says so).
    const extra = await c.turn("I try once more.", [{ text: "A try. ", toolCalls: [roll(c.sefa, "Insight")] }, { text: "Done.", toolCalls: [finish()] }], { dice: [3], autoContinue: false, deps: { rollCheck: noCheck } });
    assert.equal(extra.result.status, "committed", "Sefa has no reroll and no Inspiration left: her card does not wait");
  } finally { await c.f.db.close(); }
});

test("A5: at the owner's table (no option) the rerolls stay the table's two, and the requests go as built", async () => {
  const c = await companyCampaign({ company: false });
  try {
    const bram = await rerolls(c, c.hero, "Athletics", 2);
    assert.deepEqual(bram.map((r) => r.canReroll), [true, true]);
    // The table's two are spent: Sefa's card does not even wait (the pause holds only while a reroll is left).
    const sefa = await c.turn("I try.", [{ text: "A try. ", toolCalls: [roll(c.sefa, "Insight")] }, { text: "Done.", toolCalls: [finish()] }], { dice: [3], autoContinue: false, deps: { rollCheck: noCheck } });
    assert.equal(sefa.result.status, "committed", "no pause: the table has no reroll left");
    const play = await (await c.deps(null)).store.readPlay(c.cid);
    assert.equal(rerollsLeft({ difficulty: { rerolls: "limited", rerollsPerSession: 2 } }, play.turns, play.turns.at(-1).session_id), 0);
    const played = await c.turn("I look around.", [{ text: "Quiet.", toolCalls: [finish()] }], { deps: { rollCheck: noCheck } });
    const [request] = played.model.requests;
    assert.equal(request.toolset, dmLoopToolset, "the toolset object itself: nothing rewritten");
    assert.ok(request.system[0].text.startsWith(FRAME), "the owner's frame");
    assert.match(request.system[0].text, /The hero's will is the player's\./);
    assert.doesNotMatch(request.system[0].text, /None of them is the main character/);
  } finally { await c.f.db.close(); }
});

test("A8 support: the company prep asks for the addressees and the layer keeps them; the owner's prep is unchanged", () => {
  const raw = JSON.stringify({ truth: "Something old wakes under the inn.", secrets: ["a"], banTest: "a weakness", company: [
    { kind: "puzzle", for: "Sefa Marrin", what: "the lamp's words" }, { kind: "threat", for: "Bram Halloway", what: "the debt collector" },
    { kind: "reward", for: "Pell Dunmore", what: "the guild's key" }, { kind: "other", for: "Pell Dunmore", what: "dropped" }] });
  const prep = parsePrep(raw, "en", { company: true });
  assert.deepEqual(companyLinesOf(prep.text).map((row) => [row.kind, row.for]), [["puzzle", "Sefa Marrin"], ["threat", "Bram Halloway"], ["reward", "Pell Dunmore"]]);
  assert.doesNotMatch(prep.text, HERO);
  const owner = parsePrep(raw, "en");
  assert.match(owner.text, /The hero's weakness tested/);
  assert.deepEqual(companyLinesOf(owner.text), []);
});
