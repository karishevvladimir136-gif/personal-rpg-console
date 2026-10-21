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
