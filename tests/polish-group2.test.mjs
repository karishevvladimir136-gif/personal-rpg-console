// Polish stage, group 2 (docs/stages/POLISH.md): rolls — the skill named on the
// card, bonuses from the sheet (numbers, or +2 / +4 / +6 in the sheet's words)
// and from the fiction (capped, with sources), advantage with a reason, the
// difficulty ladder, hero checks always the player's and NPC rolls always
// private, a natural 20 / 1 flagged, and the card's words in the public turn.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { resumeDmLoopTurn } from "../src/lib/gameplay/dm-loop/loop.ts";
import { DIFFICULTY_LADDER, FICTION_BONUS_CAP, proficiencyValue, sheetBonus } from "../src/lib/gameplay/dm-loop/execute.ts";

const finish = (extra = {}) => ({ name: "finish_turn", arguments: { sceneKinds: ["exploration"], spotlight: [], playerMoment: false, ...extra } });
const publicTurn = async (c, operationId) => (await (await c.deps(createScriptedDmModel([]))).store.readPlay(c.cid)).turns.find((row) => row.id === operationId);
const SHEET = { schemaVersion: 1, mode: "narrative", role: "ныряльщик Гильдии", background: "Бывший ныряльщик Гильдии; хорошо плавает, знает старую технику.",
  level: null, tier: null, attributes: null, skills: ["Плавание +2", "мастер по замкам", "Знание старой техники"], abilities: ["Умеет чинить компрессоры"], limitations: [], spells: [] };
const withSheet = async (c) => c.f.one("update public.rpg_entities set character_sheet=$2::jsonb where id=$1 returning id", [c.hero, JSON.stringify(SHEET)]);

test("sheet bonuses: a number on the line, the sheet's words, a numeric stat, the trade in the background", () => {
  const actor = (sheet, stats = {}, details = "") => ({ id: "x", name: "Рэй", kind: "player", stats, details, character_sheet: sheet });
  assert.deepEqual(sheetBonus(actor(SHEET), "плавание"), { value: 2, source: "Плавание +2" });
  assert.deepEqual(sheetBonus(actor(SHEET), "замки"), { value: 6, source: "мастер по замкам +6" });
  assert.deepEqual(sheetBonus(actor(SHEET), "старая техника"), { value: 2, source: "Знание старой техники +2" });
  assert.deepEqual(sheetBonus(actor(SHEET), "ныряльщик"), { value: 2, source: "ныряльщик +2" }, "the trade is named in the role: a named skill");
  assert.deepEqual(sheetBonus(actor({ ...SHEET, role: null }), "ныряльщик"), { value: 4, source: "ныряльщик +4" }, "named in a background line that calls him good");
  assert.deepEqual(sheetBonus(actor(SHEET), "чинить компрессоры"), { value: 2, source: "Умеет чинить компрессоры +2" });
  assert.equal(sheetBonus(actor(SHEET), "магия"), null);
  assert.deepEqual(sheetBonus(actor(null, { stealth: 3 }), "stealth"), { value: 3, source: "stealth +3" });
  assert.equal(proficiencyValue("мастер-кузнец"), 6);
  assert.equal(proficiencyValue("хорошо стреляет"), 4);
  assert.equal(proficiencyValue("умеет вязать узлы"), 2);
  assert.equal(proficiencyValue("an expert sailor"), 6);
  assert.deepEqual(DIFFICULTY_LADDER, { easy: 8, normal: 10, hard: 13, very_hard: 16, nearly_impossible: 19 });
  assert.equal(FICTION_BONUS_CAP, 6);
});

test("a check carries the sheet skill, the fiction's bonuses (capped), advantage with a reason and the difficulty in words", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    await withSheet(c);
    const played = await c.turn("Ныряю за ящиком, с рукавицами и на страховке Мокея.", [
      { text: "Вода тёмная.", toolCalls: [
        { name: "roll", arguments: { formula: "1d20", reason: "Ныряние: достать ящик с «Сельди»", actorRef: c.hero, visibility: "private", difficulty: "hard",
          skill: "ныряльщик", bonuses: [{ source: "смоляные рукавицы", value: 2 }, { source: "страховка Мокея", value: 3 }, { source: "ясная вода", value: 3 }],
          advantage: "advantage", advantageReason: "помощь Мокея на лине" } },
      ] },
      { text: " Пальцы находят скобу.", toolCalls: [finish({ nextTension: "tense" })] },
    ], { dice: [9, 6] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const receipt = (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts[0];
    assert.equal(receipt.result.ok, true, JSON.stringify(receipt.result));
    const v = receipt.result.value;
    assert.equal(v.modifier, 2 + FICTION_BONUS_CAP, "ныряльщик +2 (named in the role) plus the fiction's bonuses capped at +6");
    assert.match(v.modifierSource, /ныряльщик \+2/);
    assert.match(v.note, /capped/);
    assert.equal(v.dc, 13);
    assert.equal(v.difficulty, "hard");
    assert.equal(v.visibility, "player", "a hero's check is the player's even when the DM said private");
    assert.deepEqual(v.dice, [9, 6]);
    assert.equal(v.kept, 9);
    assert.equal(v.total, 17);
    const turn = await publicTurn(c, played.input.operationId);
    assert.equal(turn.checks.length, 1);
    const check = turn.checks[0];
    assert.equal(check.reason, "Ныряние: достать ящик с «Сельди»");
    assert.deepEqual(check.bonuses, [{ source: "смоляные рукавицы", value: 2 }, { source: "страховка Мокея", value: 3 }, { source: "ясная вода", value: 3 }]);
    assert.equal(check.advantage, "advantage");
    assert.equal(check.advantageReason, "помощь Мокея на лине");
    assert.equal(check.difficulty, "hard");
    assert.equal(check.modifier, 8);
    assert.equal(check.total, 17);
    assert.equal(check.success, true);
    const chip = turn.changes.find((change) => change.tool === "roll");
    assert.match(chip.summary, /^Ныряние: достать ящик с «Сельди»: 17( против 13)? — получилось$/);
  } finally { await c.f.db.close(); }
});

test("an NPC's roll stays private whatever the DM says; an unknown skill is refused with the sheet's own words", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    await withSheet(c);
    const played = await c.turn("Фрол смотрит на мой пояс.", [
      { text: "Фрол щурится.", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "frol", name: "Фрол", kind: "npc", description: "Человек чужака.", present: true, stats: [{ name: "insight", value: 2 }] } },
        { name: "roll", arguments: { formula: "1d20", reason: "заметить пустой пояс", actorRef: "frol", visibility: "player", dc: 11, modifierField: "insight" } },
        { name: "roll", arguments: { formula: "1d20", reason: "Магия: заговорить воду", actorRef: c.hero, visibility: "player", dc: 10, skill: "магия" } },
      ] },
      { text: " Он не замечает.", toolCalls: [finish()] },
    ], { dice: [14, 5] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const receipts = (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts;
    assert.equal(receipts[1].result.ok, true);
    assert.equal(receipts[1].result.value.visibility, "private");
    assert.equal(receipts[1].result.player, null, "no chip for the NPC's roll");
    assert.equal(receipts[2].result.ok, false);
    assert.match(receipts[2].result.reason, /names no skill or trade like "магия"/);
    assert.match(receipts[2].result.hint, /Плавание \+2/);
    const turn = await publicTurn(c, played.input.operationId);
    assert.equal(turn.checks.length, 0, "the NPC's check never reaches the player's card");
    assert.ok(!turn.changes.some((change) => change.tool === "roll"));
  } finally { await c.f.db.close(); }
});

test("a natural 20 is flagged for the card and the chip; the DM receives the hero's-moment hint; a reroll keeps the card's words", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    await withSheet(c);
    const played = await c.turn("Уворачиваюсь от весла.", [
      { text: "Весло свистит.", toolCalls: [
        { name: "roll", arguments: { formula: "1d20", reason: "Увернуться от весла", actorRef: c.hero, visibility: "player", difficulty: "very_hard", skill: "плавание" } },
      ] },
      { text: " Рэй уходит под удар.", toolCalls: [finish({ nextTension: "climax" })] },
    ], { dice: [20], autoContinue: false });
    assert.equal(played.result.status, "awaiting_confirmation", JSON.stringify(c.errors));
    const receipt = (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts[0];
    assert.equal(receipt.result.value.natural, "crit");
    assert.match(receipt.result.value.hint, /natural 20/);
    assert.match(receipt.result.player, /— крит$/);
    assert.equal(receipt.result.check.natural, "crit");
    assert.equal(receipt.result.check.dc, 16);
    // The player asks for the allowed reroll: the new die keeps the reason, the bonuses and the difficulty.
    const rerolled = await resumeDmLoopTurn({ commandId: randomUUID(), campaignId: c.cid, operationId: played.input.operationId,
      timeline: played.input.timeline, action: "reroll", checkId: played.result.checks[0].id }, await c.deps(played.model));
    assert.equal(rerolled.status, "awaiting_confirmation", JSON.stringify(c.errors));
    assert.equal(rerolled.checks[0].rollNumber, 2);
    assert.equal(rerolled.checks[0].reason, "Увернуться от весла");
    assert.equal(rerolled.checks[0].difficulty, "very_hard");
    const continued = await c.retry(played, "continue");
    assert.equal(continued.result.status, "committed", JSON.stringify(c.errors));
  } finally { await c.f.db.close(); }
});
