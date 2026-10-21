// Fixes before session 3 (docs/stages/FIX_S3_PRE.md), part 1: in «пишет — записывает» the writer's attacks go
// through the server — a roll with kind attack while a fight is open is resolved on the battlefield with the rules
// module, exactly as combat attack is for the single DM — and the «every roll told» check sees attacks and the
// actions the player declared. The real turn path with scripted models on PGlite.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { runCampaignTurn, resumeCampaignTurn, bookkeeperOf } from "../src/lib/gameplay/dm-loop/two-pass/index.ts";
import { parseAttackLine } from "../src/lib/gameplay/dm-loop/execute.ts";
import { damageRuling } from "../src/lib/live2d/battle/rules.ts";
import { WRITER_ROLE } from "../src/lib/gameplay/dm-loop/roles.ts";
import { writerRoleRu, TABLE_RULES_RU } from "../src/lib/gameplay/dm-loop/roles-ru.ts";

const OPUS = { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" };
const LEDGER = "<ledger>\nбой — Ярвен стреляет в Пузо\nвремя — 1 минута\nсцена — combat; напряжение дальше: tense\n</ledger>";
const finish = () => ({ name: "finish_turn", arguments: { sceneKinds: ["combat"], spotlight: [], playerMoment: false, nextTension: "tense" } });
const time = () => ({ name: "advance_time", arguments: { minutes: 1, reason: "бой" } });

async function campaignTurn(c, text, writerRounds, bookkeeperRounds, options = {}) {
  const writer = createScriptedDmModel(writerRounds, { providerId: "anthropic", modelId: "claude-opus-5-5" });
  const bookkeeper = createScriptedDmModel(bookkeeperRounds, { providerId: "anthropic", modelId: "claude-opus-5-5" });
  const base = await c.deps(writer, options.deps ?? {});
  const split = (await c.settings.read()).split;
  const deps = { ...base, split, bookkeeper: bookkeeperOf(split), bookkeeperModel: () => bookkeeper };
  const input = await c.input(text);
  if (options.dice) c.forceDice(options.dice);
  let result = await runCampaignTurn(input, deps);
  for (let i = 0; i < 4 && result.status === "awaiting_confirmation"; i++)
    result = await resumeCampaignTurn({ commandId: randomUUID(), campaignId: c.cid, operationId: input.operationId, timeline: input.timeline, action: "continue", checkId: null }, deps);
  return { input, result, writer, bookkeeper };
}
const receiptsOf = async (c, played) => (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts;

/** A ford fight opened by the single DM: the hero at (3, 6), Ян at (5, 6), Пузо at (9, 6) behind a boulder (half cover at (8, 6)). */
async function fordFight() {
  const c = await loopCampaign({ language: "ru" });
  const opened = await c.turn("Засада у брода.", [
    { text: "Двое у воды. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "yan", name: "Кривой Ян", kind: "npc", present: true, hp: 11, maxHp: 11 } },
      { name: "upsert_character", arguments: { localKey: "puzo", name: "Пузо", kind: "npc", present: true, hp: 9, maxHp: 9 } },
      { name: "combat", arguments: { action: "start", summary: "Брод", grid: { cols: 16, rows: 12 }, ambient: "bright", rules: true,
        placements: [{ actorRef: c.hero, x: 3, y: 6, initiative: 15 }, { actorRef: "yan", x: 5, y: 6, initiative: 11 }, { actorRef: "puzo", x: 9, y: 6, initiative: 8 }],
        hp: [{ actorRef: "yan", current: 11, max: 11, ac: 12 }, { actorRef: "puzo", current: 9, max: 9, ac: 13, resist: ["холод"] }] } },
      { name: "combat", arguments: { action: "feature", op: "add", key: "boulder", kind: "cover", cover: "half", label: "валун", cells: [[8, 6]] } },
    ] },
    { text: "Бой начался. " },
  ]);
  assert.equal(opened.result.status, "committed", JSON.stringify(c.errors));
  const settings = await c.settings.read();
  await c.settings.save({ expectedRevision: settings.revision, runtime: "dm-loop-v1", dmTurn: settings.dmTurn, split: { writer: OPUS, bookkeeper: OPUS } });
  const heroName = (await c.state()).entities.find((row) => row.id === c.hero).name;
  return { c, heroName };
}

test("part 1: the attack line of a sheet or a weapon — bonus, damage and type, Cyrillic dice included", () => {
  assert.deepEqual(parseAttackLine("Скимитар +5, 1к6+3 рубящий"), { bonus: 5, damage: "1d6+3", damageType: "рубящий" });
  assert.deepEqual(parseAttackLine("+5 к попаданию, 1d12+3 рубящий"), { bonus: 5, damage: "1d12+3", damageType: "рубящий" });
  assert.deepEqual(parseAttackLine("Огненный снаряд: +6, 1d10 урона огнём"), { bonus: 6, damage: "1d10", damageType: "огнём" });
  assert.deepEqual(parseAttackLine("Дубина −1, 1d4"), { bonus: -1, damage: "1d4", damageType: null });
  // The resistances by meaning: the stat block says «огонь», the attack «огнём» or fire.
  const halved = (type, resist) => damageRuling({ dice: [8], modifier: 2, crit: false, damageType: type, target: { resist, immune: [], vulnerable: [] } }).total;
  assert.equal(halved("огнём", ["огонь"]), 5);
  assert.equal(halved("fire", ["огонь"]), 5);
  assert.equal(halved("рубящий", ["огонь"]), 10);
});

test("part 1: the writer's instructions in both languages send a fight's attacks through the server, never a bare d20", () => {
  assert.match(WRITER_ROLE, /In a fight every attack .* is one roll with kind attack: actorRef \(never dm\), targetRef, weapon/);
  assert.match(WRITER_ROLE, /Never a bare d20 for an attack, never its damage as a second roll\./);
  const ru = writerRoleRu("<ledger>", "</ledger>", TABLE_RULES_RU);
  assert.match(ru, /В бою каждая атака .* это один roll с kind attack: actorRef \(никогда не dm\), targetRef, weapon/);
  assert.match(ru, /Никогда голый d20 для атаки и никогда её урон вторым броском\./);
});

test("part 1: in the split, the writer's attack in an open fight is resolved on the battlefield — cover, the card, the HP on the map and the record, the log, the brief", async () => {
  const { c, heroName } = await fordFight();
  try {
    // The writer adds the cover by hand (dc 18) as in the merge's ford probe; the server takes AC 13 from the fight and measures the cover.
    const shot = await campaignTurn(c, "Стреляю в Пузо из лука.", [
      { parts: [{ text: "Ярвен натягивает тетиву —" }, { toolCall: { name: "roll", arguments: { formula: "1d20+5", kind: "attack", actorRef: c.hero, targetRef: "Пузо",
        weapon: "лук", damage: "1d6+3", damageType: "колющий", ranged: true, dc: 18, reason: "Лук: в Пузо за валуном", visibility: "player" } } }] },
      { text: ` — стрела входит Пузо в плечо.\n\n${LEDGER}` },
    ], [{ text: "", toolCalls: [time(), finish()] }], { dice: [14, 4] });
    assert.equal(shot.result.status, "committed", JSON.stringify(c.errors));
    const [attack] = await receiptsOf(c, shot);
    assert.equal(attack.result.ok, true, attack.result.reason);
    const value = attack.result.value;
    assert.equal(value.resolvedBy, "fight");
    assert.equal(value.cover, "half");
    assert.equal(value.attacks[0].ac, 15, "AC 13 from the fight + 2 for the boulder; the writer's dc 18 is not used");
    assert.equal(value.attacks[0].total, 19);
    assert.equal(value.attacks[0].hit, true);
    assert.equal(value.attacks[0].damage, 7, "1d6 (4) + 3");
    assert.ok(value.attacks[0].rules.includes("half cover: +2 AC"));
    assert.deepEqual(value.damage.applied, { target: "Пузо", before: 9, after: 2, max: 9 });
    assert.equal(attack.result.check.kind, "attack", "the hero's attack is a card");
    assert.equal(attack.result.check.dc, 15);
    assert.equal(attack.result.check.success, true);
    assert.equal(attack.result.player, `${heroName} → Пузо: 19 против КД 15 · попал, 7 урона (укрытие наполовину: +2 к КД)`, "the card line names every applied rule, as the single DM's");
    const play = await c.f.runtime(c.cid, "play");
    const encounter = play.encounters.find((row) => row.status === "active");
    const puzo = play.participants.find((row) => row.public_name === "Пузо");
    assert.equal(puzo.public_resources.hp.current, 2, "the map's bar moved with the shot");
    assert.equal((await c.state()).entities.find((row) => row.name === "Пузо").hp, 2, "and the record");
    assert.match(encounter.public_field.log.at(-1).result, /19 против КД 15 · попал, 7 урона → Пузо/);
    assert.deepEqual(puzo.public_resources.attacks ?? [], [], "a foe's memory holds only its own attacks");
    const hero = play.participants.find((row) => row.entity_id === c.hero);
    assert.deepEqual(hero.public_resources.attacks, [{ name: "лук", bonus: 5, damage: "1d6+3", damageType: "колющий" }], "the fight remembers the bow's numbers");
    assert.equal(hero.public_resources.economy.action, false, "the active hero's action is spent");
    const brief = shot.bookkeeper.requests[0].messages[0].text;
    assert.match(brief, /RESOLVED IN THE FIGHT by the server: .*19 vs AC 15 — hit, 7 колющий damage/);
    assert.match(brief, /damage 7 ALREADY APPLIED: Пузо 9 → 2\/9/);
  } finally { await c.f.db.close(); }
});

test("part 1: a bare attack in the fight is refused with the fix; an enemy's attack is resolved too and shown; the bow keeps its bonus; a resisted type is halved", async () => {
  const { c, heroName } = await fordFight();
  try {
    await campaignTurn(c, "Стреляю.", [
      { toolCalls: [{ name: "roll", arguments: { formula: "1d20+5", kind: "attack", actorRef: c.hero, targetRef: "Пузо", weapon: "лук", damage: "1d6+3", ranged: true, reason: "Лук", visibility: "player" } }] },
      { text: `Мимо.\n\n${LEDGER}` },
    ], [{ text: "", toolCalls: [time(), finish()] }], { dice: [2] });
    const played = await campaignTurn(c, "Ещё выстрел.", [
      { toolCalls: [
        { name: "roll", arguments: { formula: "1d20+3", kind: "attack", actorRef: "Пузо", reason: "Пузо стреляет", visibility: "private" } },
        { name: "roll", arguments: { formula: "1d20", kind: "other", actorRef: "dm", reason: "Порыв ветра", visibility: "private" } },
        { name: "roll", arguments: { formula: "1d20+3", kind: "attack", actorRef: "Пузо", targetRef: c.hero, weapon: "арбалет", damage: "1d8+1", ranged: true, dc: 14, reason: "Пузо: болт в Ярвен", visibility: "private" } },
        { name: "roll", arguments: { formula: "1d20+4", kind: "attack", actorRef: c.hero, targetRef: "Пузо", weapon: "лук", damage: "1d6+3", damageType: "холодом", ranged: true, reason: "Лук: ещё раз", visibility: "player" } },
      ] },
      { text: `Болт мимо, стрела в цель.\n\n${LEDGER}` },
    ], [{ text: "", toolCalls: [time(), finish()] }], { dice: [9, 5, 12, 6] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const [bare, other, enemy, again] = await receiptsOf(c, played);
    assert.equal(bare.result.ok, false, "an attack without its target in an open fight is refused");
    assert.match(bare.result.reason, /names its target \(targetRef\) and carries its damage/);
    assert.match(bare.result.hint, /never a bare d20/);
    assert.equal(other.result.ok, true, "a roll that is not an attack keeps the plain path");
    assert.equal(other.result.value.resolvedBy, undefined);
    assert.equal(enemy.result.value.resolvedBy, "fight");
    assert.equal(enemy.result.check, null, "an enemy's attack has no card");
    assert.equal(enemy.result.value.attacks[0].hit, false, "5 + 3 against the hero's AC");
    assert.match(enemy.result.player, /^Пузо → .*: 8 против КД \d+ · промах/, "the player sees the enemy's numbers, as with the single DM's combat attack");
    assert.equal(again.result.value.resolvedBy, "fight");
    assert.equal(again.result.value.attacks[0].total, 17, "the bow's +5 from the first shot is kept: 12 + 5, not + 4");
    assert.match(again.result.value.bonusKept, /лук: the bonus \+5 this fight already used is kept \(the formula's \+4 was dropped\)/);
    assert.equal(again.result.value.attacks[0].damage, 4, "(6 + 3) halved: Пузо resists «холод», the arrow is «холодом»");
    assert.ok(again.result.value.attacks[0].rules.some((row) => /resists холодом: damage halved/.test(row)));
    assert.deepEqual(again.result.value.damage.applied, { target: "Пузо", before: 9, after: 5, max: 9 });
    assert.match(again.result.player, new RegExp(`^${heroName} → Пузо: 17 против КД 15 · попал, 4 урона \\(укрытие наполовину: \\+2 к КД; сопротивление: холодом: урон вдвое меньше\\)$`));
  } finally { await c.f.db.close(); }
});

// ---- Part 1, item 2: the «every roll told» check sees attacks and declared actions -------------------------------
const FORD = { // the merge report's ford lines (docs/runs/merge-s2-report.md, check 2) and the 2D session's original finding
  ambush: "Мы с Тобином ждём за валунами: как только Ян ступит в воду — бьём первыми. Я выхожу и рублю его мечом, Тобин стреляет в Пузо.",
  press: "Бью Яна ещё раз, пока он не очухался.",
  stepBack: "Отхожу на пять шагов к берегу, чтобы Пузо не достал арбалетом в упор, и стреляю в него из лука.",
  finish: "Добиваю того, кто ближе. Если второй бежит — пусть бежит, стрелу в спину не трачу.",
};

test("part 1 (2): the check's pieces — attack cards count, the hero's rolls are marked, the declared actions are read and asked for", async () => {
  const { visibleRolls, rollCheckRequest, parseRollCheck, untoldRollsMessage, declaresAction } = await import("../src/lib/gameplay/dm-loop/roll-check.ts");
  const receipt = (position, name, args, result) => ({ position, call: { id: `c${position}`, name, arguments: args }, result });
  const receipts = [
    receipt(0, "combat", { action: "start" }, { ok: true, value: {}, summary: "Combat begins", player: "Бой: …", check: null }),
    receipt(1, "combat", { action: "attack", actorRef: "hero" }, { ok: true, value: {}, summary: "Ярвен attacks Ян: 22 vs AC 12 — hit, 9 damage", player: "Ярвен → Ян: 22 против КД 12 · попал, 9 урона", check: { actorId: "hero" } }),
    receipt(2, "combat", { action: "attack", actorRef: "yan" }, { ok: true, value: {}, summary: "Ян attacks Ярвен: 8 vs AC 15 — miss", player: "Ян → Ярвен: 8 против КД 15 · промах", check: null }),
    receipt(3, "roll", { actorRef: "dm" }, { ok: true, value: {}, summary: "The DM rolls 1d20: 7", player: null, check: null }),
    receipt(4, "combat", { action: "move" }, { ok: true, value: {}, summary: "moves", player: "Ярвен → (2, 6)", check: null }),
  ];
  const rolls = visibleRolls(receipts, "hero");
  assert.deepEqual(rolls.map((row) => [row.position, row.hero]), [[1, true], [2, false]], "both attack cards count (the merge's ford turn 1 read only the rolls); a move or a private roll does not");
  const request = rollCheckRequest({ narration: "Ян падает.", rolls: rolls.map((row) => row.line), language: "ru", playerInput: FORD.press, heroRolls: [1] });
  assert.match(request.user, /^PLAYER'S LINE:\nБью Яна ещё раз/);
  assert.match(request.user, /1\. \[герой\] Ярвен attacks Ян/);
  assert.match(request.system, /реплика спутника, карточка броска или намёк .* — не рассказ/, "an implied outcome is not told for the hero's roll");
  assert.match(request.system, /"undeclared"/);
  assert.match(rollCheckRequest({ narration: "x", rolls: [], language: "en", playerInput: "I shoot him" }).system, /a companion's line, the roll card or an implication .* is not telling it.*PLAYER'S LINE/s);
  assert.doesNotMatch(rollCheckRequest({ narration: "x", rolls: ["a"], language: "en" }).system, /undeclared/, "no line, no declared-action question");
  assert.deepEqual(parseRollCheck('{"untold":[2,9],"undeclared":["бью Яна", "", 3]}', 2), { untold: [2], undeclared: ["бью Яна"] });
  assert.deepEqual(parseRollCheck("нет", 2), { untold: [], undeclared: [] });
  const asked = untoldRollsMessage("ru", [], "writer", ["Бью Яна ещё раз"]);
  assert.match(asked, /^Игрок заявил эти действия героя, а ход их не бросил и не сказал, почему нет:\n1\) Бью Яна ещё раз\n.*roll kind attack.*Воля героя — у игрока\.\nНовая ведомость не нужна\.$/s);
  assert.match(untoldRollsMessage("en", ["r"], "dm", ["I shoot"]), /^The player saw these rolls.*\nThe player declared these actions.*\nThen call finish_turn again\.$/s);
  for (const line of Object.values(FORD)) assert.equal(declaresAction(line), true, line);
  assert.equal(declaresAction("Спасибо, Тобин. Идём дальше по дороге."), false, "a line with no action that a roll decides runs no check");
});

test("part 1 (2): the single DM — the ford turn 3 shape (the hero's attack card alone) is checked now; the 2D finding (a declared attack narrated around) gets one continuation and is rolled", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const seen = [];
    const rollCheck = async (input) => {
      seen.push(input);
      // The fake checker: a declared attack with no hero roll is missed; every card is told.
      const missed = input.playerInput && !(input.heroRolls ?? []).length ? [input.playerInput.split(",")[0]] : [];
      return { untold: [], undeclared: missed, costUsdMicros: 300, error: null };
    };
    const opened = await c.turn("Засада.", [{ text: "Ян у воды. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "yan", name: "Кривой Ян", kind: "npc", present: true, hp: 11, maxHp: 11 } },
      { name: "combat", arguments: { action: "start", summary: "Брод", grid: { cols: 12, rows: 10 }, rules: true,
        placements: [{ actorRef: c.hero, x: 3, y: 5, initiative: 15 }, { actorRef: "yan", x: 4, y: 5, initiative: 9 }], hp: [{ actorRef: "yan", current: 11, max: 11, ac: 12 }] } },
      { name: "finish_turn", arguments: { sceneKinds: ["combat"], spotlight: [], playerMoment: false } }] }]);
    assert.equal(opened.result.status, "committed", JSON.stringify(c.errors));
    // The merge's Opus-alone ford turn 3: the only card was the hero's attack, and the check did not run at all.
    const shot = await c.turn(FORD.stepBack, [
      { text: "Ты отходишь и бьёшь. ", toolCalls: [{ name: "combat", arguments: { action: "attack", actorRef: c.hero, targetRef: "Кривой Ян", attackBonus: 5, damage: "1d8+3", reason: "Удар по Яну" } }] },
      { text: "Клинок входит Яну в бок.", toolCalls: [{ name: "finish_turn", arguments: { sceneKinds: ["combat"], spotlight: [], playerMoment: false } }] },
    ], { dice: [15, 4], deps: { rollCheck } });
    assert.equal(shot.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(seen.length, 1, "the hero's attack card alone is a roll the check reads");
    assert.equal(seen[0].rolls.length, 1);
    assert.match(seen[0].rolls[0], /attacks Кривой Ян: 20 vs AC 12 — hit/);
    assert.deepEqual(seen[0].heroRolls, [1]);
    assert.equal(seen[0].playerInput, FORD.stepBack);
    // The 2D session's finding: «Бью Яна ещё раз» narrated around, nothing rolled — the check asks once, the DM rolls it.
    seen.length = 0;
    const press = await c.turn(FORD.press, [
      { text: "Ян пятится к воде, рыча.", toolCalls: [{ name: "finish_turn", arguments: { sceneKinds: ["combat"], spotlight: [], playerMoment: false } }] },
      { text: " Ты бьёшь снова — ", toolCalls: [{ name: "combat", arguments: { action: "attack", actorRef: c.hero, targetRef: "Кривой Ян", attackBonus: 5, damage: "1d8+3", reason: "Ещё удар" } }] },
      { text: "и Ян оседает в воду.", toolCalls: [{ name: "finish_turn", arguments: { sceneKinds: ["combat"], spotlight: [], playerMoment: false } }] },
    ], { dice: [18, 6], deps: { rollCheck } });
    assert.equal(press.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(seen.length, 1, "checked once");
    assert.deepEqual(seen[0].rolls, [], "a turn with no roll at all is checked when the player declared an action");
    assert.equal(seen[0].playerInput, FORD.press);
    // The harness's Russian campaign reads the English instructions unless it asks for Russian (fix run B4).
    assert.match(press.model.requests[1].messages.at(-1).text, /^The player declared these actions of the hero, and the turn neither rolled them nor said why not:\n1\) Бью Яна ещё раз/);
    const receipts = (await c.row(press.input.operationId)).checkpoint.dmLoop.receipts;
    assert.ok(receipts.some((r) => r.call.name === "combat" && r.call.arguments.action === "attack" && r.result.ok), "the declared attack was rolled after the ask");
    assert.match(press.result.narration, /Ян оседает в воду/);
    const checked = (await c.row(press.input.operationId)).checkpoint.dmLoop.diagnostics.filter((d) => d.kind === "rolls_checked");
    assert.deepEqual(checked.map((d) => [d.rolls, d.untold, d.undeclared]), [[0, 0, 1]]);
    // A line without a declared action, with no roll: no check, no cost.
    seen.length = 0;
    await c.turn("Спасибо, Тобин. Идём дальше.", [{ text: "Тихо.", toolCalls: [{ name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [], playerMoment: false } }] }], { deps: { rollCheck } });
    assert.equal(seen.length, 0);
  } finally { await c.f.db.close(); }
});

test("part 1 (2): the split — the ford turn 4 shape (the hero's crit told only by a companion's line) reaches the checker marked as the hero's; its continuation is the writer's", async () => {
  const { c } = await fordFight();
  try {
    const seen = [];
    const rollCheck = async (input) => { seen.push(input); return { untold: seen.length === 1 ? [1] : [], undeclared: [], costUsdMicros: 300, error: null }; };
    const played = await campaignTurn(c, FORD.finish, [
      { toolCalls: [{ name: "roll", arguments: { formula: "1d20+5", kind: "attack", actorRef: c.hero, targetRef: "Пузо", weapon: "лук", damage: "1d6+3", ranged: true, reason: "Лук: снять Пузо", visibility: "player" } }] },
      { text: `— Он теперь без арбалета, — хрипит Тобин.\n\n${LEDGER}` },
      { text: " Стрела пробивает Пузо руку, и арбалет летит в воду." },
    ], [{ text: "", toolCalls: [time(), finish()] }], { dice: [20, 3, 2], deps: { rollCheck } });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(seen.length, 1);
    assert.deepEqual(seen[0].heroRolls, [1], "the hero's critical shot is marked as the hero's own");
    assert.match(seen[0].rolls[0], /crit/);
    assert.equal(seen[0].playerInput, FORD.finish);
    assert.match(played.writer.requests[2].messages.at(-1).text, /^The player saw these rolls but the story does not tell their outcome:[\s\S]*No new ledger is needed\.$/);
    assert.match((await c.row(played.input.operationId)).narration, /Стрела пробивает Пузо руку/);
  } finally { await c.f.db.close(); }
});
