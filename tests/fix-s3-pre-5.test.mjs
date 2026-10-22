// Fixes before session 3, the owner's ask after the stage (docs/runs/fix-s3-pre-report.md, «After the stage»): the
// fight's opening attacks go through the server's rules too (the first attack opens the fight; combat start completes
// it), and a fight on a place nobody prepared gets its scene first, then the painted battle background.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { runCampaignTurn, resumeCampaignTurn, bookkeeperOf } from "../src/lib/gameplay/dm-loop/two-pass/index.ts";
import { WRITER_ROLE, BOOKKEEPER_ROLE } from "../src/lib/gameplay/dm-loop/roles.ts";
import { writerRoleRu, TABLE_RULES_RU } from "../src/lib/gameplay/dm-loop/roles-ru.ts";
import { backgroundPlan, runBattleBackground } from "../src/lib/live2d/battle/background.ts";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const OPUS = { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" };
const LEDGER = "<ledger>\nбой — засада у брода\nвремя — 1 минута\nсцена — combat; напряжение дальше: tense\n</ledger>";
const finish = () => ({ name: "finish_turn", arguments: { sceneKinds: ["combat"], spotlight: [], playerMoment: false, nextTension: "tense" } });

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

/** The owner's system: D&D 5e turns the fight's rules module on (a campaign of another system keeps the plain roll). */
async function fiveE(c) {
  await c.f.query("update public.rpg_settings set values = jsonb_set(values, '{rulesSystem,label}', '\"D&D 5e (2014)\"') where campaign_id = $1", [c.cid]);
  return c;
}

/** Кривой Ян on record at the ford, no fight yet; the campaign then plays «Opus пишет — Opus записывает». */
async function fordBeforeTheFight() {
  const c = await fiveE(await loopCampaign({ language: "ru" }));
  const met = await c.turn("Подхожу к броду.", [{ text: "У воды стоит человек с дубиной. ", toolCalls: [
    { name: "upsert_character", arguments: { localKey: "yan", name: "Кривой Ян", kind: "npc", present: true, hp: 11, maxHp: 11 } },
    { name: "finish_turn", arguments: { sceneKinds: ["exploration"], spotlight: [], playerMoment: false } }] }]);
  assert.equal(met.result.status, "committed", JSON.stringify(c.errors));
  const settings = await c.settings.read();
  await c.settings.save({ expectedRevision: settings.revision, runtime: "dm-loop-v1", dmTurn: settings.dmTurn, split: { writer: OPUS, bookkeeper: OPUS } });
  return c;
}

test("opening attacks: in the split, the writer's first attack opens the fight on the server; a new person is recorded bare; combat start completes the same fight; the opening damage stands", async () => {
  const c = await fordBeforeTheFight();
  try {
    const played = await campaignTurn(c, "Бью Яна мечом, пока он не поднял дубину.", [
      { parts: [{ text: "Ярвен рубит — " }, { toolCall: { name: "roll", arguments: { formula: "1d20+5", kind: "attack", actorRef: c.hero, targetRef: "Кривой Ян",
        weapon: "меч", damage: "1d8+3", damageType: "рубящий", dc: 12, reason: "Меч: по Яну", visibility: "player" } } }] },
      // A second bandit nobody recorded yet shoots from the boulders: the writer names him.
      { parts: [{ text: " клинок входит Яну в бок. С валунов бьёт арбалет — " }, { toolCall: { name: "roll", arguments: { formula: "1d20+3", kind: "attack", actorRef: "Пузо", targetRef: c.hero,
        weapon: "лёгкий арбалет", damage: "1d8+1", damageType: "колющий", ranged: true, dc: 15, reason: "Пузо стреляет в Ярвен", visibility: "private" } } }] },
      { parts: [{ text: " болт свистит мимо. Ярвен разворачивается и рубит Пузо — " }, { toolCall: { name: "roll", arguments: { formula: "1d20+5", kind: "attack", actorRef: c.hero, targetRef: "Пузо",
        weapon: "меч", damage: "1d8+3", damageType: "рубящий", dc: 13, reason: "Меч: по Пузо", visibility: "player" } } }] },
      { text: ` клинок рассекает Пузо плечо.\n\n${LEDGER}` },
    ], [{ text: "", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "puzo", name: "Пузо", kind: "npc", present: true, hp: 9, maxHp: 9, description: "арбалетчик" } },
      { name: "combat", arguments: { action: "start", summary: "Брод", grid: { cols: 16, rows: 12 }, ambient: "bright", rules: true,
        placements: [{ actorRef: c.hero, x: 3, y: 6, initiative: 15 }, { actorRef: "Кривой Ян", x: 4, y: 6, initiative: 11 }, { actorRef: "puzo", x: 9, y: 6, initiative: 8 }],
        hp: [{ actorRef: "Кривой Ян", current: 11, max: 11, ac: 12 }] } },
      finish()] }], { dice: [15, 4, 2, 16, 3] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const receipts = await receiptsOf(c, played);
    const attacks = receipts.filter((row) => row.call.name === "roll");
    assert.equal(attacks.length, 3);
    for (const row of attacks) {
      assert.equal(row.result.ok, true, row.result.reason);
      assert.equal(row.result.value.resolvedBy, "fight", "every opening blow is the fight's");
    }
    assert.equal(attacks[0].result.value.openedFight, true);
    assert.match(attacks[0].result.summary, /This attack opened the fight on the server/);
    assert.deepEqual(attacks[0].result.value.damage.applied, { target: "Кривой Ян", before: 11, after: 4, max: 11, band: "bloodied" });
    assert.equal(attacks[0].result.check.kind, "attack", "the hero's opening blow is a card");
    assert.deepEqual(attacks[1].result.value.joinedFight, ["Пузо"], "the crossbowman joins the fight his shot is in");
    assert.equal(attacks[2].result.value.damage.pending, true, "a person with no hit points yet keeps the damage on the server");
    // One fight, completed by the bookkeeper's start.
    const play = await c.f.runtime(c.cid, "play");
    assert.equal(play.encounters.length, 1);
    const encounter = play.encounters[0];
    assert.equal(encounter.status, "active");
    assert.equal(encounter.public_field.openedByAttack, undefined, "combat start completed the fight its first attack opened");
    assert.equal(encounter.public_field.rules, true);
    assert.equal(encounter.public_field.log.length, 3, "the opening blows stay in the fight's log");
    const start = receipts.find((row) => row.call.name === "combat" && row.call.arguments.action === "start");
    assert.equal(start.result.ok, true, start.result.reason);
    assert.equal(start.result.value.completedOpenedFight, true);
    const fighters = play.participants.filter((row) => row.encounter_id === encounter.id).sort((a, b) => a.turn_order - b.turn_order);
    assert.deepEqual(fighters.filter((row) => row.public_name === "Кривой Ян" || row.public_name === "Пузо" || row.entity_id === c.hero).map((row) => [row.public_name === "Кривой Ян" ? "yan" : row.public_name === "Пузо" ? "puzo" : "hero", row.public_resources.initiative]),
      [["hero", 15], ["yan", 11], ["puzo", 8]], "the start's initiative orders the same fighters");
    assert.equal(new Set(fighters.map((row) => row.entity_id)).size, fighters.length, "no one is in the fight twice");
    const state = await c.state();
    assert.equal(state.entities.filter((row) => row.name === "Пузо").length, 1, "the bookkeeper's record of Пузо completed the bare one, never a second Пузо");
    const puzo = state.entities.find((row) => row.name === "Пузо");
    assert.deepEqual([puzo.hp, puzo.max_hp], [3, 9], "his full 9 from the stat block, minus the 6 the opening blow dealt");
    assert.equal(fighters.find((row) => row.public_name === "Пузо").public_resources.hp.current, 3);
    assert.equal(state.entities.find((row) => row.name === "Кривой Ян").hp, 4, "the stat block's full 11 never healed the opening wound");
    assert.equal(fighters.find((row) => row.public_name === "Кривой Ян").public_resources.hp.current, 4);
    // The bookkeeper was told.
    const brief = played.bookkeeper.requests[0].messages[0].text;
    assert.match(brief, /this attack OPENED THE FIGHT: complete it with combat start/);
    assert.match(brief, /damage 6 to Пузо KEPT BY THE SERVER/);
  } finally { await c.f.db.close(); }
});

test("opening attacks: the single DM's attack before its own combat start is the fight's too; a generic word or a near name never makes a person; another system keeps the plain roll", async () => {
  const c = await fiveE(await loopCampaign({ language: "ru" }));
  try {
    const opened = await c.turn("Бью разбойника.", [{ text: "Ты бьёшь первым. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "yan", name: "Кривой Ян", kind: "npc", present: true, hp: 11, maxHp: 11 } },
      { name: "roll", arguments: { formula: "1d20+5", kind: "attack", actorRef: c.hero, targetRef: "yan", weapon: "меч", damage: "1d8+3", dc: 12, reason: "Меч: по Яну", visibility: "player" } },
      { name: "combat", arguments: { action: "start", summary: "Брод", grid: { cols: 12, rows: 10 }, rules: true,
        placements: [{ actorRef: c.hero, x: 3, y: 5, initiative: 15 }, { actorRef: "yan", x: 4, y: 5, initiative: 9 }], hp: [{ actorRef: "yan", current: 11, max: 11, ac: 12 }] } }] },
      { text: "Ян шатается.", toolCalls: [finish()] }], { dice: [15, 4] });
    assert.equal(opened.result.status, "committed", JSON.stringify(c.errors));
    const receipts = (await c.row(opened.input.operationId)).checkpoint.dmLoop.receipts;
    assert.equal(receipts.find((row) => row.call.name === "roll").result.value.resolvedBy, "fight");
    const start = receipts.find((row) => row.call.name === "combat");
    assert.equal(start.result.ok, true, start.result.reason);
    const play = await c.f.runtime(c.cid, "play");
    assert.equal(play.encounters.length, 1);
    assert.equal((await c.state()).entities.find((row) => row.name === "Кривой Ян").hp, 4);
  } finally { await c.f.db.close(); }
  const d = await fiveE(await loopCampaign({ language: "ru" }));
  try {
    await d.turn("Подхожу.", [{ text: "Ян у воды.", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "yan", name: "Кривой Ян", kind: "npc", present: true, hp: 11, maxHp: 11 } }, finish()] }]);
    const tried = await d.turn("Бью.", [{ text: "Ты бьёшь. ", toolCalls: [
      { name: "roll", arguments: { formula: "1d20+5", kind: "attack", actorRef: d.hero, targetRef: "часовой", damage: "1d8+3", dc: 12, reason: "удар", visibility: "player" } },
      { name: "roll", arguments: { formula: "1d20+5", kind: "attack", actorRef: d.hero, targetRef: "Кривого Яна", damage: "1d8+3", dc: 12, reason: "удар", visibility: "player" } }] },
      { text: "Ты замахиваешься.", toolCalls: [finish()] }], { dice: [15, 4, 15, 4] });
    const receipts = (await d.row(tried.input.operationId)).checkpoint.dmLoop.receipts.filter((row) => row.call.name === "roll");
    assert.equal(receipts[0].result.ok, false, "a lowercase word is no person: the roll stays as before (refused without a record)");
    assert.equal(receipts[1].result.ok, false);
    assert.match(receipts[1].result.reason, /nothing named "Кривого Яна" is on record; similar: Кривой Ян/);
    assert.equal((await d.f.runtime(d.cid, "play")).encounters.length, 0, "no fight was opened");
    assert.equal((await d.state()).entities.filter((row) => /часов|Кривого/u.test(row.name)).length, 0, "no person was invented");
  } finally { await d.f.db.close(); }
  // A campaign whose system has no rules module: the hero's attack is the plain roll it was (its natural 20 doubles the dice).
  const e = await loopCampaign({ language: "ru" });
  try {
    const plain = await e.turn("Бью.", [{ text: "Удар. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "yan", name: "Кривой Ян", kind: "npc", present: true, hp: 11, maxHp: 11 } },
      { name: "roll", arguments: { formula: "1d20+5", kind: "attack", actorRef: e.hero, targetRef: "yan", damage: "1d8+3", dc: 12, reason: "удар", visibility: "player" } }] },
      { text: "Ян шатается.", toolCalls: [finish()] }], { dice: [15, 4] });
    assert.equal(plain.result.status, "committed", JSON.stringify(e.errors));
    const hit = (await e.row(plain.input.operationId)).checkpoint.dmLoop.receipts.find((row) => row.call.name === "roll");
    assert.notEqual(hit.result.value.resolvedBy, "fight");
    assert.equal((await e.f.runtime(e.cid, "play")).encounters.length, 0);
  } finally { await e.f.db.close(); }
});

test("opening attacks: the writer's and the bookkeeper's instructions say it (en, ru)", () => {
  assert.match(WRITER_ROLE, /The first attack opens the fight when no one has: name the attacker and the target by their names — a person new to the story too/);
  assert.match(writerRoleRu("<ledger>", "</ledger>", TABLE_RULES_RU), /Первая атака открывает бой, если его ещё никто не открыл: называй нападающего и цель по именам/);
  assert.match(BOOKKEEPER_ROLE, /When the brief says this turn's first attack opened the fight, combat start completes that fight .* a person such an attack recorded bare is completed by upsert_character with the same name\./);
});

test("battle background: a place nobody prepared gets its scene first (its picture done), then the background; a prepared place goes straight to the background; the cap or «not visited» stops it", async () => {
  assert.equal(backgroundPlan(null), "scene_then_battle");
  assert.equal(backgroundPlan({ sheet: { features: [{ key: "boulder" }] } }), "battle");
  assert.equal(backgroundPlan({ sheet: { features: [] } }), "none", "a scene without a usable sheet waits for the owner");
  const run = async (scene, sceneStatus = "queued") => {
    const order = [];
    const steps = await runBattleBackground({
      scene: async () => scene,
      prepareScene: async (schedule) => { order.push("scene"); schedule(async () => { await new Promise((resolve) => setTimeout(resolve, 20)); order.push("scene picture done"); }); return { status: sceneStatus }; },
      prepareBattle: async (schedule) => { order.push("battle"); schedule(async () => { order.push("battle picture done"); }); return { status: "queued" }; },
    });
    return { steps, order };
  };
  const fresh = await run(null);
  assert.deepEqual(fresh.steps, { plan: "scene_then_battle", scene: "queued", battle: "queued" });
  assert.deepEqual(fresh.order, ["scene", "scene picture done", "battle", "battle picture done"], "the background starts after the scene's picture, so it draws on it");
  const prepared = await run({ sheet: { features: [{ key: "boulder" }] } });
  assert.deepEqual(prepared.order, ["battle", "battle picture done"]);
  for (const status of ["cap", "not_visited", "drawing"]) {
    const stopped = await run(null, status);
    assert.deepEqual(stopped.steps, { plan: "scene_then_battle", scene: status, battle: null }, status);
    assert.ok(!stopped.order.includes("battle"));
  }
  // The server wiring: the scene by the «Подготовить сцену» path, the background by its own; both checks of the cap stay.
  const schedule = src("src/lib/live2d/server/battle-schedule.ts");
  assert.match(schedule, /scene: async \(\) => sceneOf\(await boardOf\(await live2dContext\(campaignId\)\), locationId\)/);
  assert.match(schedule, /prepareScene: \(schedule\) => prepareScene\(campaignId, \{ locationId \}, schedule\)/);
  assert.match(schedule, /prepareBattle: \(schedule\) => prepareBattleMap\(campaignId, \{ locationId \}, schedule\)/);
  assert.match(src("src/lib/live2d/server/scenes.ts"), /if \(!capRemaining\(pictureBoard\)\) return \{ status: "cap", locationId \};/);
  assert.match(src("src/lib/live2d/server/scenes.ts"), /if \(place\.status !== "visited"\) return \{ status: "not_visited", locationId \};/);
});
