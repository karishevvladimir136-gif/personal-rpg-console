// Fixes before session 3 (docs/stages/FIX_S3_PRE.md), part 2 — the audit's findings (docs/runs/audit-s3-report.md on
// origin/claude/audit-s3), each re-checked on the candidate before the fix. Here 2.1, the owner's rules that existed
// nowhere: wounds by HP band (B-17), the natural 20 strictly as in BG3 and its reroll (B-1), the potion as a bonus action
// (B-3), Heroic Inspiration one at a time and spent by a reroll (B-4). The coup de grâce (B-7) and the ambush opening
// (B-2) are in tests/live2d-fights.test.mjs. The real turn path with scripted models on PGlite.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { resumeDmLoopTurn } from "../src/lib/gameplay/dm-loop/loop.ts";
import { DM_ROLE, WRITER_ROLE, TABLE_RULES } from "../src/lib/gameplay/dm-loop/roles.ts";
import { TABLE_RULES_RU, dmRoleRu, writerRoleRu } from "../src/lib/gameplay/dm-loop/roles-ru.ts";
import { hpBand } from "../src/lib/gameplay/dm-loop/execute.ts";
import { dmLoopTools } from "../src/lib/gameplay/dm-loop/tools.ts";
import { readFileSync } from "node:fs";

const finish = (kind = "other") => ({ name: "finish_turn", arguments: { sceneKinds: [kind], spotlight: [], playerMoment: false } });
const receiptsOf = async (c, played) => (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts;
const reroll = async (c, played) => resumeDmLoopTurn({ commandId: randomUUID(), campaignId: c.cid, operationId: played.input.operationId,
  timeline: played.input.timeline, action: "reroll", checkId: played.result.checks[0].id }, await c.deps(played.model));

test("2.1 B-17 and B-1: the roles carry the wound bands, the coup de grâce, the ambush and a natural 20 without an extra, in both languages", () => {
  for (const text of [TABLE_RULES, DM_ROLE, WRITER_ROLE]) {
    assert.match(text, /Wounds follow the hit points left: lightly wounded \(more than half\), bloodied \(half or less\), badly hurt \(a quarter or less\), down \(0\); a killing blow only at 0 HP/);
    assert.match(text, /A helpless target — unconscious, paralysed, or bound and unable to resist — dies to a blade at the throat, no rolls/);
    assert.match(text, /A planned ambush: the party's signal or first strike resolves before initiative .* does not spend the ambusher's round-1 action/);
    assert.doesNotMatch(text, /visible extra/, "strict BG3: no «visible extra» on a natural 20");
  }
  for (const text of [TABLE_RULES_RU, dmRoleRu("tools", TABLE_RULES_RU, ""), writerRoleRu("<ledger>", "</ledger>", TABLE_RULES_RU)]) {
    assert.match(text, /Раны — по оставшимся хитам: легко ранен \(больше половины\), окровавлен \(половина и меньше\), тяжело ранен \(четверть и меньше\), упал \(0\); смертельный удар — только при 0 хитов/);
    assert.match(text, /Беспомощная цель — без сознания, парализована или связана и не может сопротивляться — умирает от клинка у горла, без бросков/);
    assert.match(text, /Задуманная засада: условный знак или первый удар отряда разыгрывается до инициативы/);
    assert.doesNotMatch(text, /заметная удача/);
  }
  assert.doesNotMatch(dmLoopTools.find((tool) => tool.name === "roll").description, /visible extra/);
  assert.deepEqual([hpBand(58, 58), hpBand(36, 58), hpBand(29, 58), hpBand(14, 58), hpBand(1, 58), hpBand(0, 58)],
    ["unhurt", "lightly wounded", "bloodied", "badly hurt", "badly hurt", "down"]);
});

test("2.1 B-17: a hit's receipt names the band of the hit points left", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const played = await c.turn("Бью громилу.", [
      { text: "Удар. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "brute", name: "Громила", kind: "npc", present: true, hp: 20, maxHp: 20 } },
        { name: "roll", arguments: { formula: "1d20+5", kind: "attack", dc: 12, damage: "1d8+3", targetRef: "brute", actorRef: c.hero, reason: "Меч по громиле", visibility: "player" } },
      ] },
      { text: "Громила качается.", toolCalls: [finish("combat")] },
    ], { dice: [15, 7] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const hit = (await receiptsOf(c, played))[1];
    assert.deepEqual(hit.result.value.damage.applied, { target: "Громила", before: 20, after: 10, max: 20, band: "bloodied" });
    assert.match(hit.result.summary, /Громила 20 → 10\/20 \(bloodied\)/);
  } finally { await c.f.db.close(); }
});

test("2.1 B-1: a rerolled natural 20 succeeds against DC 30 and a rerolled 1 fails against DC 5, with the label of the new die; the hint has no extra", async () => {
  const c = await loopCampaign();
  try {
    const hard = await c.turn("I try to leap the chasm.", [
      { text: "You run… ", toolCalls: [{ name: "roll", arguments: { formula: "1d20", reason: "the leap", actorRef: c.hero, visibility: "player", dc: 30, kind: "skill" } }] },
      { text: "Wind in your face.", toolCalls: [finish("exploration")] },
    ], { dice: [5], autoContinue: false });
    assert.equal(hard.result.status, "awaiting_confirmation", JSON.stringify(c.errors));
    assert.equal(hard.result.checks[0].success, false);
    c.forceDice([20]);
    const up = await reroll(c, hard);
    assert.equal(up.status, "awaiting_confirmation", JSON.stringify([c.errors, c.observations.filter((o) => o.type === "failure")]));
    assert.equal(up.checks[0].rollNumber, 2);
    assert.deepEqual(up.checks[0].dice, [20]);
    assert.equal(up.checks[0].success, true, "a natural 20 succeeds whatever the total (20 against DC 30)");
    assert.equal(up.checks[0].natural, "crit", "the label is the new die's");
    assert.equal((await c.retry(hard, "continue")).result.status, "committed", JSON.stringify(c.errors));
    const stored = (await c.row(hard.input.operationId)).checkpoint.checks[0];
    assert.deepEqual([stored.kept, stored.success, stored.natural], [20, true, "crit"]);
    const easy = await c.turn("I try to climb the low wall.", [
      { text: "You reach up… ", toolCalls: [{ name: "roll", arguments: { formula: "1d20+4", reason: "the wall", actorRef: c.hero, visibility: "player", dc: 5, kind: "skill" } }] },
      { text: "Stone under your fingers.", toolCalls: [finish("exploration")] },
    ], { dice: [20], autoContinue: false });
    assert.equal(easy.result.checks[0].success, true);
    assert.match((await receiptsOf(c, easy))[0].result.value.hint, /^A natural 20: the attempt succeeds whatever the total/);
    c.forceDice([1]);
    const down = await reroll(c, easy);
    assert.equal(down.status, "awaiting_confirmation", JSON.stringify([c.errors, c.observations.filter((o) => o.type === "failure")]));
    assert.equal(down.checks[0].total, 5, "1 + 4 reaches DC 5 —");
    assert.equal(down.checks[0].success, false, "— and still fails: a natural 1");
    assert.equal(down.checks[0].natural, "fumble");
  } finally { await c.f.db.close(); }
});

test("2.1 B-3 and B-4: a potion in a fight spends the drinker's bonus action; Heroic Inspiration is one at a time and a spend is one reroll", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const opened = await c.turn("Бой.", [{ text: "Волк рычит. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "wolf", name: "Волк", kind: "npc", present: true, hp: 11, maxHp: 11 } },
      { name: "item", arguments: { action: "create", name: "Зелье лечения", category: "consumable", quantity: 2, ownerRef: c.hero } },
      { name: "combat", arguments: { action: "start", summary: "Волк", grid: { cols: 10, rows: 10 }, rules: true,
        placements: [{ actorRef: c.hero, x: 2, y: 2, initiative: 18 }, { actorRef: "wolf", x: 6, y: 2, initiative: 5 }], hp: [{ actorRef: "wolf", current: 11, max: 11, ac: 13 }] } },
      finish("combat")] }]);
    assert.equal(opened.result.status, "committed", JSON.stringify(c.errors));
    const drink = await c.turn("Пью зелье.", [{ text: "Глоток. ", toolCalls: [
      { name: "item", arguments: { action: "consume", itemRef: "Зелье лечения", reason: "выпито в бою" } },
      { name: "item", arguments: { action: "consume", itemRef: "Зелье лечения", reason: "второе подряд" } },
      { name: "resource", arguments: { actorRef: c.hero, resource: "heroic_inspiration", set: 1, reason: "смелый ход" } },
      { name: "resource", arguments: { actorRef: c.hero, resource: "heroic_inspiration", set: 1, reason: "ещё раз" } },
      finish("combat")] }]);
    assert.equal(drink.result.status, "committed", JSON.stringify(c.errors));
    const [first, second, granted, again] = await receiptsOf(c, drink);
    assert.match(first.result.value.bonusAction, /bonus action is spent \(a potion is a bonus action\)/);
    assert.equal(second.result.ok, true, "a second drink is recorded, never refused —");
    assert.match(second.result.value.bonusAction, /already spent this turn/, "— and says the bonus action was already spent");
    const play = await c.f.runtime(c.cid, "play");
    assert.equal(play.participants.find((row) => row.entity_id === c.hero).public_resources.economy.bonus, false, "the battle screen's «Бонусное» dot is spent");
    assert.equal(granted.result.ok, true);
    assert.deepEqual([granted.result.value.after, granted.result.value.max], [1, 1]);
    assert.equal(again.result.ok, false, "a second grant is refused");
    assert.match(again.result.reason, /already has Heroic Inspiration: one at a time/);
    const spend = await c.turn("Трачу вдохновение и перебрасываю.", [{ text: "Ещё раз. ", toolCalls: [
      { name: "roll", arguments: { formula: "1d20+2", reason: "Внимательность: заметить засаду", actorRef: c.hero, visibility: "private", dc: 12, heroicInspiration: true } },
      { name: "roll", arguments: { formula: "1d20+2", reason: "и ещё", actorRef: c.hero, visibility: "private", dc: 12, heroicInspiration: true } }] },
      { text: "Теперь видно.", toolCalls: [finish("combat")] }], { dice: [14] });
    assert.equal(spend.result.status, "committed", JSON.stringify(c.errors));
    const [inspired, twice] = await receiptsOf(c, spend);
    assert.equal(inspired.result.ok, true);
    assert.deepEqual(inspired.result.value.heroicInspiration, { before: 1, after: 0 });
    assert.match(inspired.result.player, /Героическое вдохновение потрачено$/);
    assert.equal(twice.result.ok, false, "one spend, one reroll");
    assert.match(twice.result.reason, /has no Heroic Inspiration to spend/);
    assert.equal((await c.state()).entities.find((row) => row.id === c.hero).resources.heroic_inspiration, 0);
  } finally { await c.f.db.close(); }
});

// ---- 2.2 session 3's mode and the fight --------------------------------------------------------------------------
test("2.2 B-6: a wound outside combat attack moves the fight's mirror (the bars, the block, the card); combat hp reads the record first", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const opened = await c.turn("Бой.", [{ text: "Серый у стены. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "brute", name: "Серый", kind: "npc", present: true, hp: 20, maxHp: 20 } },
      { name: "combat", arguments: { action: "start", summary: "Сарай", grid: { cols: 12, rows: 10 }, rules: true,
        placements: [{ actorRef: c.hero, x: 2, y: 2, initiative: 15 }, { actorRef: "brute", x: 8, y: 2, initiative: 5 }], hp: [{ actorRef: "brute", current: 20, max: 20, ac: 14 }] } },
      finish("combat")] }]);
    assert.equal(opened.result.status, "committed", JSON.stringify(c.errors));
    // A save with its damage (the writer's Fireball) — the bundled damage path, not combat attack.
    const ball = await c.turn("Огненный шар в Серого.", [{ text: "Пламя. ", toolCalls: [
      { name: "roll", arguments: { formula: "1d20", kind: "save", dc: 14, damage: "4d6", targetRef: "Серый", actorRef: "Серый", reason: "Огненный шар: спасбросок Ловкости", visibility: "private" } },
      { name: "combat", arguments: { action: "hp", actorRef: "Серый", delta: -3, byRef: c.hero, reason: "ожог от телеги" } },
      { name: "resource", arguments: { actorRef: "Серый", resource: "hp", delta: -2, reason: "дым" } },
      finish("combat")] }], { dice: [5, 3, 3, 2, 2] });
    assert.equal(ball.result.status, "committed", JSON.stringify(c.errors));
    const [save, hp, resource] = await receiptsOf(c, ball);
    assert.deepEqual(save.result.value.damage.applied, { target: "Серый", before: 20, after: 10, max: 20, band: "bloodied" });
    assert.deepEqual([hp.result.value.before, hp.result.value.after], [10, 7], "combat hp starts from the record (10), not from a stale mirror (20)");
    assert.deepEqual([resource.result.value.before, resource.result.value.after], [7, 5]);
    const play = await c.f.runtime(c.cid, "play");
    assert.equal(play.participants.find((row) => row.public_name === "Серый").public_resources.hp.current, 5, "the bars follow every wound");
    const log = play.encounters.find((row) => row.status === "active").public_field.log.map((row) => row.result);
    assert.deepEqual(log, ["10 урона → Серый", "3 урона → Серый", "2 урона → Серый"], "each wound is a line of the fight's card");
    const { foeHp } = await import("../src/lib/live2d/battle/contracts.ts");
    assert.deepEqual(foeHp({ public_resources: { side: "foe", hp: { current: 5, max: 20 } } }), { current: 5, max: 20 });
    assert.equal(foeHp({ public_resources: { side: "party", hp: { current: 5, max: 20 } } }), null, "the party's HP lives on their sheets");
    assert.match(readFileSync(new URL("../src/components/gameplay-combat.tsx", import.meta.url), "utf8"), /t\("Hit points \{current\}\/\{max\}", foeHp\(row\)!\)/, "the plain play screen's «Бой» panel shows the numbers");
    assert.equal(JSON.parse(readFileSync(new URL("../src/lib/locales/ru.json", import.meta.url), "utf8"))["Hit points {current}/{max}"], "Хиты {current}/{max}");
  } finally { await c.f.db.close(); }
});

test("2.2 A-37: the pause holds only while a reroll or Heroic Inspiration is available — the server rule and its client mirror agree", async () => {
  const { rerollsLeft, rollPauseAvailable } = await import("../src/lib/gameplay/reroll-allowance.ts");
  const limited = { difficulty: { rerolls: "limited", rerollsPerSession: 2 } };
  const turns = (rolls) => rolls.map((rollNumber, i) => ({ session_id: i < 9 ? "s1" : "s0", checks: [{ rollNumber }] }));
  assert.equal(rerollsLeft(limited, turns([1, 1]), "s1"), 2);
  assert.equal(rerollsLeft(limited, turns([2, 1]), "s1"), 1);
  assert.equal(rerollsLeft(limited, turns([3]), "s1"), 0, "one check rerolled twice spends both");
  assert.equal(rerollsLeft(limited, [{ session_id: "s0", checks: [{ rollNumber: 3 }] }], "s1"), 2, "another session's rerolls do not count");
  assert.equal(rerollsLeft({ difficulty: { rerolls: "unlimited" } }, [], "s1"), null);
  assert.equal(rerollsLeft({ difficulty: { rerolls: "disabled" } }, [], "s1"), 0);
  assert.deepEqual([rollPauseAvailable(1, 0, true), rollPauseAvailable(0, 0, true), rollPauseAvailable(0, 1, true), rollPauseAvailable(0, 1, false), rollPauseAvailable(null, 0, false)],
    [true, false, true, false, true], "both spent → no pause; Heroic Inspiration pauses only the hero's own roll");
  const client = readFileSync(new URL("../src/components/gameplay-turn.tsx", import.meta.url), "utf8");
  assert.match(client, /rollPauseAvailable\(left, heroicInspiration\(hero\), true\)/, "the client mirror uses the same rule");
  assert.match(readFileSync(new URL("../src/components/registry/turn-timeline.tsx", import.meta.url), "utf8"), /перебросов осталось \$\{rerollCount\.left\} из \$\{rerollCount\.of\}/);
  // The real loop: two rerolls spent in the session, then a shown roll does not pause; Heroic Inspiration brings the pause back.
  const c = await loopCampaign();
  try {
    const roll = (dc) => ({ name: "roll", arguments: { formula: "1d20", reason: "the climb", actorRef: c.hero, visibility: "player", dc, kind: "skill" } });
    const first = await c.turn("I climb.", [{ text: "Up… ", toolCalls: [roll(12)] }, { text: "Done.", toolCalls: [finish("exploration")] }], { dice: [3], autoContinue: false });
    assert.equal(first.result.status, "awaiting_confirmation");
    for (const die of [4, 5]) { c.forceDice([die]); assert.equal((await reroll(c, first)).status, "awaiting_confirmation", JSON.stringify(c.errors)); }
    assert.equal((await c.retry(first, "continue")).result.status, "committed");
    const spent = await c.turn("I climb again.", [{ text: "Up… ", toolCalls: [roll(12)] }, { text: "Done.", toolCalls: [finish("exploration")] }], { dice: [9], autoContinue: false });
    assert.deepEqual(spent.statuses, ["committed"], "both rerolls spent: the shown roll does not wait for «Дальше»");
    await c.turn("A brave move.", [{ text: "Bold. ", toolCalls: [{ name: "resource", arguments: { actorRef: c.hero, resource: "heroic_inspiration", set: 1, reason: "bold" } }, finish()] }]);
    const inspired = await c.turn("I climb once more.", [{ text: "Up… ", toolCalls: [roll(12)] }, { text: "Done.", toolCalls: [finish("exploration")] }], { dice: [9], autoContinue: false });
    assert.equal(inspired.result.status, "awaiting_confirmation", "Heroic Inspiration in hand: the hero's roll waits again");
  } finally { await c.f.db.close(); }
});

test("2.2 B-16: the output cap is 64 000 in both loops; the «⚡ важный ход» toggle is back on the game screen and saves boostNext", async () => {
  const { dmLoopLimits } = await import("../src/lib/gameplay/dm-loop/limits.ts");
  const { dmOutputCap } = await import("../src/lib/gameplay/dm-loop/loop.ts");
  assert.equal(dmLoopLimits.maxOutputTokens, 64000);
  assert.equal(dmOutputCap(), 64000);
  assert.match(readFileSync(new URL("../src/lib/gameplay/dm-loop/two-pass/runtime.ts", import.meta.url), "utf8"), /maxOutputTokens: dmOutputCap\(\)/, "the writer and the bookkeeper take the same cap");
  const screen = readFileSync(new URL("../src/components/registry/game-screen.tsx", import.meta.url), "utf8");
  assert.match(screen, /aria-label=\{c\("Важный ход", "Important turn"\)\}/);
  assert.match(screen, /saveDmSettings\(data\.campaign\.id, \{ expectedRevision: dmSettings\.revision, runtime: dmSettings\.runtime, dmTurn: dmSettings\.dmTurn, boostNext: next \}\)/);
});

test("2.2 A-9: a saving throw takes the sheet's save bonus", async () => {
  const sheet = { schemaVersion: 2, mode: "structured_rpg", role: null, saves: ["Ловкость +4", "Мудрость +1"], skills: ["Восприятие +5", "Ловкость рук +6"] };
  const actor = { stats: {}, character_sheet: sheet, details: "" };
  const { sheetBonus } = await import("../src/lib/gameplay/dm-loop/execute.ts");
  assert.deepEqual(sheetBonus(actor, "Ловкость", "save"), { value: 4, source: "Ловкость +4" });
  assert.deepEqual(sheetBonus(actor, "спасбросок Мудрости"), { value: 1, source: "Мудрость +1" });
  assert.deepEqual(sheetBonus(actor, "Восприятие", "skill"), { value: 5, source: "Восприятие +5" }, "a check keeps the skills");
  const c = await loopCampaign({ language: "ru" });
  try {
    const played = await c.turn("Огненный шар.", [{ text: "Пламя. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "rogue", name: "Ловкач", kind: "npc", present: true, hp: 12, maxHp: 12, sheet: { saves: ["Ловкость +4"] } } },
      { name: "roll", arguments: { formula: "1d20", kind: "save", skill: "Ловкость", dc: 14, actorRef: "rogue", reason: "Спасбросок Ловкости", visibility: "private" } },
      finish("combat")] }], { dice: [11] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const save = (await receiptsOf(c, played))[1];
    assert.equal(save.result.ok, true, save.result.reason);
    assert.equal(save.result.value.modifier, 4, "the probe of the audit returned null here");
    assert.equal(save.result.value.total, 15);
  } finally { await c.f.db.close(); }
});
