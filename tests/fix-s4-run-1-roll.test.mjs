// Fix S4 run 1 (docs/stages/FIX_S4_TABLE.md item 11): the server's roll record.
// 11a — the card adds the sheet's own number («Persuasion +7 (proficient, Beguiling Influence)» is +7, not the +4 the
//       word «proficient» gave), and the record keeps the modifier with where it came from; checked over the drafted
//       sheets and every roll card of the twelve group-1 sessions (test-fixtures/fix-s4-run-1/drafted-sheets.json).
// 11v — one Inspiration rule: a natural 20 on a called check of the hero grants Heroic Inspiration when the hero has
//       none; when the hero holds one, the record says why none was granted.
// 11k — a reroll rewrites the record: the roll line, the model's result and the checker's line quote the roll that
//       stood; the first roll is kept only as history, marked rerolled.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { resumeDmLoopTurn } from "../src/lib/gameplay/dm-loop/loop.ts";
import { runTwoPassTurn, resumeTwoPassTurn } from "../src/lib/gameplay/dm-loop/two-pass/index.ts";
import { proficiencyValue, readSheetBonus, sheetBonus } from "../src/lib/gameplay/dm-loop/execute.ts";
import { standingChip, standingSummary, withStandingRolls } from "../src/lib/gameplay/dm-loop/standing-roll.ts";
import { chip } from "../src/lib/gameplay/dm-loop/receipt-text.ts";
import { TABLE_RULES } from "../src/lib/gameplay/dm-loop/roles.ts";
import { TABLE_RULES_RU } from "../src/lib/gameplay/dm-loop/roles-ru.ts";

const DRAFTED = JSON.parse(readFileSync(new URL("../test-fixtures/fix-s4-run-1/drafted-sheets.json", import.meta.url), "utf8"));
const finish = (kind = "exploration") => ({ name: "finish_turn", arguments: { sceneKinds: [kind], spotlight: [], playerMoment: false } });
const receiptsOf = async (c, played) => (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts;
const publicTurn = async (c, operationId) => (await (await c.deps(createScriptedDmModel([]))).store.readPlay(c.cid)).turns.find((row) => row.id === operationId);
const command = (c, played, action, checkId = null) => ({ commandId: randomUUID(), campaignId: c.cid, operationId: played.input.operationId,
  timeline: played.input.timeline, action, checkId });
const heroSheet = (skills, saves = []) => ({ schemaVersion: 2, mode: "structured_rpg", role: null, skills, saves });
const withSheet = (c, sheet) => c.f.one("update public.rpg_entities set character_sheet=$2::jsonb where id=$1 returning id", [c.hero, JSON.stringify(sheet)]);

// --- 11a ----------------------------------------------------------------------------------------------------------
/** The reader before fix S4 (execute.ts at 6158fff), inline: a number only at the end of the line, else the sheet's words. */
function oldSheetBonus(actor, skill, kind = null) {
  const normalize = (text) => text.toLocaleLowerCase().replace(/[«»"'“”]/g, "").replace(/\s+/g, " ").trim();
  const stems = (text) => normalize(text).split(/[^\p{L}\p{N}]+/u).filter((word) => word.length >= 3)
    .map((word) => (word.length >= 7 ? word.slice(0, -3) : word.length >= 5 ? word.slice(0, -2) : word.length === 4 ? word.slice(0, -1) : word));
  const has = (text, stem) => new RegExp(`(^|[^\\p{L}])${stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "u").test(normalize(text));
  const mentions = (line) => { const s = stems(skill); if (!s.length) return false; if (s.every((stem) => has(line, stem))) return true;
    const own = stems(line); return own.length > 0 && own.every((stem) => has(skill, stem)); };
  const sheet = actor.character_sheet;
  const save = kind === "save" || /спасброс|saving throw|(^|[^\p{L}])save($|[^\p{L}])/iu.test(skill);
  for (const line of [...(save ? sheet.saves ?? [] : []), ...(sheet.skills ?? [])]) {
    if (!mentions(line)) continue;
    const numbered = /^(.*?)\s*([+−-])\s*(\d+)\s*$/u.exec(line.trim());
    if (numbered) return (numbered[2] === "+" ? 1 : -1) * Number(numbered[3]);
    return proficiencyValue(line);
  }
  return null;
}
const actorOf = (session) => ({ id: "hero", name: "James Worgen", kind: "player", stats: {}, details: "", character_sheet: heroSheet(session.sheet.skills, session.sheet.saves) });
/** The skill a card names and the line's own number: «Persuasion +7 (Beguiling Influence)» → Persuasion, +7. */
const lineName = (line) => /^(.*?)\s*[+−-]\s*\d/u.exec(line)[1];
const lineNumber = (line) => { const m = /([+−-])\s*(\d+)/u.exec(line); return (m[1] === "+" ? 1 : -1) * Number(m[2]); };

test("11a: the drafted sheets of the twelve group-1 sessions — every card naming a numbered sheet line adds that line's own number", () => {
  assert.equal(DRAFTED.sessions.length, 12);
  const tally = {};
  const fixed = [];
  for (const session of DRAFTED.sessions) {
    const actor = actorOf(session);
    const row = tally[session.session] = { cards: session.cards.length, sheetCards: 0, wrongBefore: 0, rightNow: 0 };
    for (const card of session.cards) for (const addend of card.addends) {
      if (!addend.sheetLine) continue;
      row.sheetCards++;
      const skill = lineName(addend.sheetLine), own = lineNumber(addend.sheetLine);
      const kind = card.kind === "Saving throw" ? "save" : "skill";
      // The fixture is faithful: the old reader gives exactly what the card showed.
      assert.equal(oldSheetBonus(actor, skill, kind), addend.value, `${session.session} t${card.turn}: the old reader reproduces the card's +${addend.value}`);
      if (addend.value !== own) { row.wrongBefore++; fixed.push(`${session.session} t${card.turn} ${skill}: +${addend.value} → ${own >= 0 ? "+" : ""}${own}`); }
      const now = sheetBonus(actor, skill, kind);
      assert.equal(now?.value, own, `${session.session} t${card.turn}: «${addend.sheetLine}» adds ${own}`);
      assert.match(readSheetBonus(actor, skill, kind).basis, /^sheet: /u, "the record says the number came from the sheet's line");
      row.rightNow++;
    }
  }
  assert.deepEqual(tally, {
    "A-opus": { cards: 4, sheetCards: 4, wrongBefore: 4, rightNow: 4 }, "A-fable": { cards: 3, sheetCards: 3, wrongBefore: 3, rightNow: 3 },
    "A-astra": { cards: 3, sheetCards: 2, wrongBefore: 2, rightNow: 2 }, "A-sol": { cards: 5, sheetCards: 3, wrongBefore: 1, rightNow: 3 },
    "B-opus": { cards: 9, sheetCards: 4, wrongBefore: 3, rightNow: 4 }, "B-fable": { cards: 10, sheetCards: 5, wrongBefore: 3, rightNow: 5 },
    "B-astra": { cards: 6, sheetCards: 4, wrongBefore: 4, rightNow: 4 }, "B-sol": { cards: 2, sheetCards: 1, wrongBefore: 1, rightNow: 1 },
    "C-opus": { cards: 8, sheetCards: 2, wrongBefore: 2, rightNow: 2 }, "C-fable": { cards: 5, sheetCards: 2, wrongBefore: 2, rightNow: 2 },
    "C-astra": { cards: 1, sheetCards: 1, wrongBefore: 1, rightNow: 1 }, "C-sol": { cards: 1, sheetCards: 1, wrongBefore: 1, rightNow: 1 },
  });
  assert.equal(fixed.length, 27, fixed.join("\n"));
  // The night reading: the fallback was the table's constant — +2 on every Table B sheet card, +4 on every Table C one.
  const shown = (table) => DRAFTED.sessions.filter((s) => s.table === table).flatMap((s) => s.cards.flatMap((card) => card.addends.filter((a) => a.sheetLine).map((a) => a.value)));
  assert.deepEqual([...new Set(shown("B"))], [2]);
  assert.deepEqual([...new Set(shown("C"))], [4]);
  const now = (table) => DRAFTED.sessions.filter((s) => s.table === table).flatMap((s) => s.cards.flatMap((card) => card.addends.filter((a) => a.sheetLine)
    .map((a) => sheetBonus(actorOf(s), lineName(a.sheetLine)).value)));
  assert.deepEqual([...new Set(now("B"))].sort(), [1, 2, 7], "Perception +1, Stealth +2, Persuasion and Deception +7");
  assert.deepEqual([...new Set(now("C"))].sort(), [3, 7], "Arcana +3, Intimidation, Persuasion and Deception +7");
});

test("11a: the one card whose outcome the constant flipped (C-sol t9), and the two failures the prose overrode, read from the record", () => {
  const card = (name, turn) => DRAFTED.sessions.find((s) => s.session === name).cards.find((row) => row.turn === turn);
  const arcana = card("C-sol", 9);
  assert.deepEqual([arcana.rolls[0].die, arcana.addends[0].value, arcana.rolls[0].total, arcana.dc, arcana.rolls[0].verdict], [11, 4, 15, 15, "Success"]);
  const sheet = sheetBonus(actorOf(DRAFTED.sessions.find((s) => s.session === "C-sol")), "Arcana").value;
  assert.equal(sheet, 3);
  assert.ok(arcana.rolls[0].die + sheet < arcana.dc, "by the sheet: 11 + 3 = 14 against 15, a failure (history stays as played)");
  // B-astra t7: a natural 1, rerolled to 12 + 2 = 14 «Failure»; by the sheet 12 + 7 = 19 — the DM played a success in prose.
  const ferro = card("B-astra", 7);
  assert.deepEqual(ferro.rolls.map((roll) => [roll.die, roll.total, roll.verdict]), [[1, 3, "A natural one"], [12, 14, "Failure"]]);
  // C-fable t18: rerolled 7 + 4 = 11 «Failure» against 14; by the sheet 7 + 7 = 14 — the DM counted a success.
  const deck = card("C-fable", 18);
  assert.deepEqual([deck.rolls.at(-1).die, deck.rolls.at(-1).total, deck.rolls.at(-1).verdict, deck.dc], [7, 11, "Failure", 14]);
});

test("11a: saves, lines without a number, the minus sign and the old shapes keep their reading", () => {
  const session = DRAFTED.sessions.find((s) => s.session === "B-fable");
  const actor = actorOf(session);
  // The drafted saves write «Wisdom saving throw +5 (proficient, includes +1 Cloak of Protection)»: +5, not the word's +4.
  assert.deepEqual(["Strength", "Dexterity", "Wisdom", "Charisma"].map((name) => sheetBonus(actor, name, "save").value), [0, 3, 5, 8]);
  assert.deepEqual(["Strength", "Dexterity", "Wisdom", "Charisma"].map((name) => oldSheetBonus(actor, name, "save")), [2, 2, 4, 4]);
  const lines = (skills) => ({ id: "x", name: "Рэй", kind: "player", stats: {}, details: "", character_sheet: heroSheet(skills) });
  assert.deepEqual(sheetBonus(lines(["Stealth −1 (heavy armour)"]), "Stealth"), { value: -1, source: "Stealth -1" }, "the minus sign");
  assert.deepEqual(sheetBonus(lines(["Stealth -2, loud boots"]), "Stealth"), { value: -2, source: "Stealth -2" });
  assert.deepEqual(sheetBonus(lines(["Playing cards (gaming set): proficient, +3"]), "playing cards"), { value: 3, source: "Playing cards (gaming set): proficient +3" });
  assert.deepEqual(sheetBonus(lines(["Perception +1; passive Perception 11"]), "Perception"), { value: 1, source: "Perception +1" });
  assert.deepEqual(sheetBonus(lines(["Persuasion +7 (Beguiling Influence)"]), "Persuasion (Beguiling Influence)"), { value: 7, source: "Persuasion +7" },
    "the skill named as the card names it: the number after its first word");
  assert.deepEqual(sheetBonus(lines(["Sleight of Hand +2", "Animal Handling +1"]), "Animal Handling"), { value: 1, source: "Animal Handling +1" });
  assert.deepEqual(sheetBonus(lines(["Hex: +1d6 necrotic", "Arcana +3"]), "Hex"), { value: 2, source: "Hex: +1d6 necrotic +2" }, "a die's bonus is not the line's number");
  assert.deepEqual(sheetBonus(lines(["Investigation 1d20+3 with tools"]), "Investigation"), { value: 2, source: "Investigation 1d20+3 with tools +2" }, "nor a formula's");
  assert.deepEqual(sheetBonus(lines(["Плавание +2"]), "плавание"), { value: 2, source: "Плавание +2" });
  assert.deepEqual(sheetBonus(lines(["Скрытность (+3)"]), "скрытность"), { value: 3, source: "Скрытность +3" });
  const words = readSheetBonus(lines(["Insight (proficient)"]), "Insight");
  assert.deepEqual(words, { value: 4, source: "Insight (proficient) +4", basis: "sheet words: proficient +4 — Insight (proficient)" });
  assert.equal(readSheetBonus(lines(["Passive Perception 11"]), "Perception").basis, "sheet words: named +2 — Passive Perception 11");
  assert.equal(readSheetBonus({ ...lines([]), stats: { stealth: 3 } }, "stealth").basis, "stat: stealth +3");
});

test("11a: the roll's record carries the modifier it used and where it came from — the receipt, the check and the public card", async () => {
  const c = await loopCampaign();
  try {
    await withSheet(c, heroSheet(["Persuasion +7 (proficient, Beguiling Influence)", "Insight (proficient)", "Stealth −1 (heavy armour)"]));
    const played = await c.turn("I talk, I watch, I sneak.", [{ text: "He listens. ", toolCalls: [
      { name: "roll", arguments: { formula: "1d20", kind: "skill", skill: "Persuasion", reason: "Persuasion: the dealer steps aside", actorRef: c.hero, visibility: "player", dc: 15 } },
      { name: "roll", arguments: { formula: "1d20", kind: "skill", skill: "Insight", reason: "Insight: is he lying", actorRef: c.hero, visibility: "player", dc: 12 } },
      { name: "roll", arguments: { formula: "1d20+5", kind: "skill", skill: "Stealth", reason: "Stealth: past the guard", actorRef: c.hero, visibility: "player", dc: 10 } }] },
      { text: "Done.", toolCalls: [finish()] }], { dice: [10, 10, 10] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const [persuasion, insight, stealth] = await receiptsOf(c, played);
    assert.deepEqual([persuasion.result.value.modifier, persuasion.result.value.total], [7, 17], "+7 from the sheet's line, not +4 from «proficient»");
    assert.equal(persuasion.result.value.modifierBasis, "sheet: Persuasion +7 (proficient, Beguiling Influence)");
    assert.deepEqual(persuasion.result.check.addends, [{ source: "Persuasion", value: 7, kind: "sheet", basis: "sheet: Persuasion +7 (proficient, Beguiling Influence)" }]);
    assert.deepEqual([insight.result.value.modifier, insight.result.value.modifierBasis], [4, "sheet words: proficient +4 — Insight (proficient)"]);
    assert.deepEqual([stealth.result.value.modifier, stealth.result.value.total], [-1, 9], "the minus sign; the formula's +5 is dropped (the sheet gives the bonus)");
    const card = (await publicTurn(c, played.input.operationId)).checks;
    assert.deepEqual(card.map((check) => check.addends?.[0]), [
      { source: "Persuasion", value: 7, kind: "sheet", basis: "sheet: Persuasion +7 (proficient, Beguiling Influence)" },
      { source: "Insight (proficient)", value: 4, kind: "sheet", basis: "sheet words: proficient +4 — Insight (proficient)" },
      { source: "Stealth", value: -1, kind: "sheet", basis: "sheet: Stealth −1 (heavy armour)" }]);
  } finally { await c.f.db.close(); }
});

// --- 11v ----------------------------------------------------------------------------------------------------------
test("11v: TABLE_RULES name the server's rule and a named trigger for any other grant; the rest of the line is kept", () => {
  assert.match(TABLE_RULES, /the server grants Heroic Inspiration on a natural 20 of a check you call for the hero \(one at a time; the roll's record says granted, or why withheld\); any other grant needs a named trigger, quoted in the records/);
  assert.match(TABLE_RULES_RU, /Героическое вдохновение сервер даёт сам за чистую 20 на проверке, которую ты назначил герою .*любое другое — только по названному поводу, который ты приводишь в записях/);
  for (const text of [TABLE_RULES, TABLE_RULES_RU]) assert.doesNotMatch(text, /strong play|сильную игру/);
  assert.match(TABLE_RULES, /drinking a potion is a bonus action; the server grants .*the server refuses a second\); when the player spends it, roll that die of the hero's again with roll heroicInspiration: true/);
  assert.equal(chip.inspirationGranted("ru", "Героическое вдохновение", "Убеждение"), "Героическое вдохновение: 0 → 1/1 — натуральная 20 (Убеждение)");
  assert.equal(chip.inspirationWithheld("ru", "Героическое вдохновение", "Убеждение"), "Героическое вдохновение не дано: уже есть, по одному (натуральная 20 — Убеждение)");
});

test("11v: a natural 20 on a called check grants Heroic Inspiration when the hero has none; the next natural 20 states why none is granted", async () => {
  const c = await loopCampaign();
  try {
    await withSheet(c, heroSheet(["Persuasion +7 (Beguiling Influence)"]));
    const roll = (dc = 15) => ({ name: "roll", arguments: { formula: "1d20", kind: "skill", skill: "Persuasion", reason: "Persuasion: the dealer talks", actorRef: c.hero, visibility: "player", dc } });
    const first = await c.turn("I talk him down.", [{ text: "He wavers. ", toolCalls: [roll()] }, { text: "He talks.", toolCalls: [finish()] }], { dice: [20] });
    assert.equal(first.result.status, "committed", JSON.stringify(c.errors));
    const [granted] = await receiptsOf(c, first);
    assert.deepEqual(granted.result.value.inspirationAward, { granted: true, before: 0, after: 1, max: 1, why: "natural 20 on Persuasion",
      note: "The server granted the hero Heroic Inspiration for this natural 20 (the table's rule): never grant it again with resource." });
    assert.match(granted.result.summary, /; Heroic Inspiration granted by the server \(natural 20 on Persuasion\): 0 → 1$/);
    const firstChip = (await publicTurn(c, first.input.operationId)).changes.find((row) => row.tool === "roll").summary;
    assert.equal(firstChip, "Persuasion: the dealer talks: 27 vs 15 — critical · Heroic inspiration: 0 → 1/1 — natural 20 on Persuasion");
    const hero = () => c.state().then((s) => s.entities.find((row) => row.id === c.hero));
    assert.deepEqual([(await hero()).resources.heroic_inspiration, (await hero()).resources.heroic_inspiration_max], [1, 1]);
    // The hero holds it now: the second natural 20 grants none, and the record says why.
    const second = await c.turn("Again, with the sergeant.", [{ text: "She frowns. ", toolCalls: [roll(12)] }, { text: "She waves you on.", toolCalls: [finish()] }], { dice: [20] });
    assert.equal(second.result.status, "committed", JSON.stringify(c.errors));
    const [withheld] = await receiptsOf(c, second);
    assert.deepEqual([withheld.result.value.inspirationAward.granted, withheld.result.value.inspirationAward.reason], [false, "already held"]);
    assert.match(withheld.result.summary, /; Heroic Inspiration withheld: already held \(natural 20 on Persuasion\)$/);
    const secondChip = (await publicTurn(c, second.input.operationId)).changes.find((row) => row.tool === "roll").summary;
    assert.equal(secondChip, "Persuasion: the dealer talks: 27 vs 12 — critical · Heroic inspiration not granted: already held, one at a time (natural 20 on Persuasion)");
    assert.equal((await hero()).resources.heroic_inspiration, 1, "still one: one at a time");
    // Not a called check of the hero: an NPC's natural 20, an attack roll's, a roll that spends the Inspiration — no award.
    await c.f.db.query("update public.rpg_entities set resources=resources||'{\"heroic_inspiration\":0}'::jsonb where id=$1", [c.hero]);
    const others = await c.turn("The guard swings; I strike back.", [{ text: "Steel. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "guard", name: "Gate guard", kind: "npc", present: true } },
      { name: "roll", arguments: { formula: "1d20", kind: "skill", reason: "the guard spots you", actorRef: "guard", visibility: "private", dc: 10 } },
      { name: "roll", arguments: { formula: "1d20+5", kind: "attack", reason: "a rapier thrust", actorRef: c.hero, visibility: "player", dc: 12 } }] },
      { text: "Done.", toolCalls: [finish("combat")] }], { dice: [20, 20] });
    assert.equal(others.result.status, "committed", JSON.stringify(c.errors));
    assert.ok((await receiptsOf(c, others)).every((receipt) => receipt.result.value?.inspirationAward === undefined));
    assert.equal((await hero()).resources.heroic_inspiration, 0);
  } finally { await c.f.db.close(); }
});

// --- 11k ----------------------------------------------------------------------------------------------------------
test("11k: the player's line, the pure rewrite and the summary — the standing roll first, the earlier one as history marked rerolled", () => {
  const check = { id: "c1", kind: "skill", actorId: "h", actorName: "James Worgen", reason: "Deception: a loud drunk", dice: [10], kept: 10, modifier: 7, total: 17,
    success: true, dc: 15, advantage: "normal", interactive: true, canReroll: true, rollNumber: 2, natural: null };
  assert.equal(standingChip("Deception: a loud drunk: 10 vs 15 — failure", check), "Deception: a loud drunk: 17 vs 15 — success · rerolled: 10 vs 15, failure");
  assert.equal(standingChip("Обман: пьяный у двери: 8 против 15 — провал на единице", { ...check, reason: "Обман: пьяный у двери" }),
    "Обман: пьяный у двери: 17 против 15 — получилось · переброшено: 8 против 15, провал на единице");
  assert.equal(standingChip("James Worgen: Deception: a loud drunk: 10 — failure · damage 4", { ...check, dc: null }),
    "James Worgen: Deception: a loud drunk: 17 — success · rerolled: 10, failure · damage 4", "anyone's line; what follows the verdict stays");
  assert.equal(standingChip("Deception: a loud drunk: 3 vs 15 — failure", { ...check, dice: [20], kept: 20, total: 27, natural: "crit" }),
    "Deception: a loud drunk: 27 vs 15 — critical · rerolled: 3 vs 15, failure · no Heroic Inspiration for a reroll's natural 20", "11v: a reroll's natural 20 grants none, and the line says so");
  assert.equal(standingChip("Deception: a loud drunk: 10 vs 15 — failure", { ...check, rollNumber: 1 }), null, "never rerolled: unchanged");
  const turn = { checks: [check], changes: [{ tool: "roll", ok: true, summary: "Deception: a loud drunk: 10 vs 15 — failure" }, { tool: "advance_time", ok: true, summary: "Time passes: 4 minutes" }] };
  const once = withStandingRolls(turn);
  assert.equal(once.changes[0].summary, "Deception: a loud drunk: 17 vs 15 — success · rerolled: 10 vs 15, failure");
  assert.deepEqual(withStandingRolls(once), once, "the projection is idempotent");
  assert.equal(standingSummary("James Worgen rolls 1d20 (Deception +7): 10 vs 15 — failure", { ...check, natural: null }, [{ rollNumber: 1, dice: [3], kept: 3, total: 10, success: false, natural: null }]),
    "James Worgen rolls 1d20 (Deception +7): 17 vs 15 — success (rerolled: 10 vs 15 — failure)");
});

async function rerolledTurn(c, firstDie, secondDie) {
  await withSheet(c, heroSheet(["Deception +7 (Beguiling Influence)"]));
  const played = await c.turn("I play the drunk across from his door.", [
    { text: "You slump against the parapet and start to sing… ", toolCalls: [
      { name: "roll", arguments: { formula: "1d20", kind: "skill", skill: "Deception", reason: "Deception: a loud drunk", actorRef: c.hero, visibility: "player", dc: 15 } }] },
    { text: "The man in the oilskin gives up and goes.", toolCalls: [
      { name: "quest", arguments: { action: "create", kind: "thread", title: "The night boat", description: "The drunk act held; the man in the oilskin left." } }, finish()] },
  ], { dice: [firstDie], autoContinue: false });
  assert.equal(played.result.status, "awaiting_confirmation", JSON.stringify(c.errors));
  c.forceDice([secondDie]);
  const rerolled = await resumeDmLoopTurn(command(c, played, "reroll", played.result.checks[0].id), await c.deps(played.model));
  assert.equal(rerolled.status, "awaiting_confirmation", JSON.stringify([c.errors, c.observations.filter((o) => o.type === "failure")]));
  const checked = [];
  const rollCheck = async (input) => { checked.push(input); return { untold: [], undeclared: [], costUsdMicros: 0, error: null }; };
  const done = await resumeDmLoopTurn(command(c, played, "continue"), await c.deps(played.model, { rollCheck }));
  assert.equal(done.status, "committed", JSON.stringify(c.errors));
  return { played, done, checked };
}

test("11k: a rerolled check — the committed roll line, the model's result and the checker's line show the reroll; the first roll is only history, marked rerolled", async () => {
  const c = await loopCampaign();
  try {
    const { played, checked } = await rerolledTurn(c, 3, 10);
    const row = await c.row(played.input.operationId);
    // The record: the check is the roll that stood; the receipt keeps the first as written; the history marks it.
    assert.deepEqual([row.checkpoint.checks[0].rollNumber, row.checkpoint.checks[0].total, row.checkpoint.checks[0].success], [2, 17, true]);
    const receipt = row.checkpoint.dmLoop.receipts[0];
    assert.deepEqual([receipt.result.check.rollNumber, receipt.result.check.total, receipt.result.check.success], [1, 10, false]);
    assert.deepEqual(row.checkpoint.dmLoop.diagnostics.filter((d) => d.kind === "rerolled"),
      [{ kind: "rerolled", checkId: row.checkpoint.checks[0].id, roll: { rollNumber: 1, dice: [3], kept: 3, total: 10, success: false, natural: null } }]);
    // The player's change chip.
    const turn = await publicTurn(c, played.input.operationId);
    const line = turn.changes.find((change) => change.tool === "roll").summary;
    assert.equal(line, "Deception: a loud drunk: 17 vs 15 — success · rerolled: 10 vs 15, failure");
    assert.doesNotMatch(line, /^Deception: a loud drunk: 10/);
    assert.equal(turn.checks[0].total, 17);
    // The model's result (what it writes the journal from): the roll that stands; the first only under «rerolled».
    const output = JSON.parse(played.model.requests.at(-1).messages.find((m) => m.role === "tool_results").results[0].output);
    assert.deepEqual([output.total, output.success, output.dice], [17, true, [10]]);
    assert.match(output.rerolled.stands, /^Roll 2 stands: narrate and record this result \(17, success\)/);
    assert.deepEqual(output.rerolled.history, [{ rollNumber: 1, dice: [3], kept: 3, total: 10, success: false, natural: null, rerolled: true }]);
    // The roll checker reads the reroll, not the first roll's failure.
    assert.equal(checked.length, 1);
    assert.match(checked[0].rolls[0], /: 17 vs 15 — success \(rerolled: 10 vs 15 — failure\)$/);
    // The journal the DM wrote after reading it is the standing outcome (scripted here; the result above is what it read).
    const journal = (await c.state()).quests.find((q) => q.title === "The night boat");
    assert.match(journal.description, /held/);
  } finally { await c.f.db.close(); }
});

test("11k (Astra B): a natural 1 rerolled to 12 — the model no longer reads «natural 1» or its hint; the line and the checker say 19, success", async () => {
  const c = await loopCampaign();
  try {
    const { played, checked } = await rerolledTurn(c, 1, 12);
    const first = (await receiptsOf(c, played))[0];
    assert.equal(first.result.value.natural, "fumble", "the receipt keeps the first roll as recorded");
    const output = JSON.parse(played.model.requests.at(-1).messages.find((m) => m.role === "tool_results").results[0].output);
    assert.deepEqual([output.kept, output.total, output.success, output.natural], [12, 19, true, null]);
    assert.equal(output.hint, undefined, "the first die's «A natural 1» hint is gone");
    assert.deepEqual(output.rerolled.history.map((row) => [row.kept, row.natural, row.rerolled]), [[1, "fumble", true]]);
    const line = (await publicTurn(c, played.input.operationId)).changes.find((change) => change.tool === "roll").summary;
    assert.equal(line, "Deception: a loud drunk: 19 vs 15 — success · rerolled: 8 vs 15, natural one");
    assert.match(checked[0].rolls[0], /: 19 vs 15 — success \(rerolled: 8 vs 15 — failure \(natural 1\)\)$/);
  } finally { await c.f.db.close(); }
});

test("11k: two rerolls keep both earlier rolls as history; a reroll command sent again adds nothing", async () => {
  const c = await loopCampaign();
  try {
    await withSheet(c, heroSheet(["Deception +7 (Beguiling Influence)"]));
    const played = await c.turn("I lie.", [{ text: "He squints… ", toolCalls: [
      { name: "roll", arguments: { formula: "1d20", kind: "skill", skill: "Deception", reason: "Deception: the lie", actorRef: c.hero, visibility: "player", dc: 15 } }] },
      { text: "He believes you.", toolCalls: [finish()] }], { dice: [2], autoContinue: false });
    const checkId = played.result.checks[0].id;
    c.forceDice([4]);
    const once = command(c, played, "reroll", checkId);
    assert.equal((await resumeDmLoopTurn(once, await c.deps(played.model))).checks[0].rollNumber, 2);
    assert.equal((await resumeDmLoopTurn(once, await c.deps(played.model))).checks[0].rollNumber, 2, "the same command again: the stored result");
    c.forceDice([15]);
    assert.equal((await resumeDmLoopTurn(command(c, played, "reroll", checkId), await c.deps(played.model))).checks[0].rollNumber, 3);
    assert.equal((await resumeDmLoopTurn(command(c, played, "continue"), await c.deps(played.model))).status, "committed", JSON.stringify(c.errors));
    const row = await c.row(played.input.operationId);
    assert.deepEqual(row.checkpoint.dmLoop.diagnostics.filter((d) => d.kind === "rerolled").map((d) => [d.roll.rollNumber, d.roll.total]), [[1, 9], [2, 11]]);
    const output = JSON.parse(played.model.requests.at(-1).messages.find((m) => m.role === "tool_results").results[0].output);
    assert.deepEqual([output.total, output.success, output.rerolled.history.map((row) => row.total)], [22, true, [9, 11]]);
    const line = (await publicTurn(c, played.input.operationId)).changes.find((change) => change.tool === "roll").summary;
    assert.equal(line, "Deception: the lie: 22 vs 15 — success · rerolled: 9 vs 15, failure", "the line quotes the standing roll; the first one as history");
  } finally { await c.f.db.close(); }
});

test("11k: the split runtime (the writer and the bookkeeper, the owner's table) — the writer reads the reroll; the line shows it", async () => {
  const c = await loopCampaign();
  try {
    await withSheet(c, heroSheet(["Deception +7 (Beguiling Influence)"]));
    const writer = createScriptedDmModel([
      { parts: [{ text: "You start to sing —" }, { toolCall: { name: "roll", arguments: { formula: "1d20", kind: "skill", skill: "Deception", reason: "Deception: a loud drunk", actorRef: c.hero, visibility: "player", dc: 15 } } }] },
      { text: "— and the man in the oilskin goes.\n\n<ledger>\nвремя — 4 минуты\nсцена — exploration; напряжение дальше: calm\n</ledger>" },
    ], { providerId: "anthropic", modelId: "claude-fable-5-1" });
    const bookkeeper = createScriptedDmModel([{ text: "", toolCalls: [{ name: "advance_time", arguments: { minutes: 4 } }, finish()] }], { providerId: "anthropic", modelId: "claude-opus-5-5" });
    const base = await c.deps(writer);
    const deps = { ...base, pin: async (claim) => ({ ...(await base.pin(claim)), providerId: "anthropic", modelId: "claude-fable-5-1", effort: "high" }),
      bookkeeper: { providerId: "anthropic", modelId: "claude-opus-5-5", effort: "high", model: bookkeeper } };
    const input = await c.input("I play the drunk.");
    c.forceDice([3]);
    const paused = await runTwoPassTurn(input, deps);
    assert.equal(paused.status, "awaiting_confirmation", JSON.stringify(c.errors));
    const played = { input };
    c.forceDice([10]);
    assert.equal((await resumeTwoPassTurn(command(c, played, "reroll", paused.checks[0].id), deps)).checks[0].total, 17);
    const done = await resumeTwoPassTurn(command(c, played, "continue"), deps);
    assert.equal(done.status, "committed", JSON.stringify(c.errors));
    const output = JSON.parse(writer.requests.at(-1).messages.find((m) => m.role === "tool_results").results[0].output);
    assert.deepEqual([output.total, output.success, output.rerolled.history[0].total], [17, true, 10]);
    const line = (await publicTurn(c, input.operationId)).changes.find((change) => change.tool === "roll").summary;
    assert.equal(line, "Deception: a loud drunk: 17 vs 15 — success · rerolled: 10 vs 15, failure");
  } finally { await c.f.db.close(); }
});
