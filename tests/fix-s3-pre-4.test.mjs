// Fixes before session 3 (docs/stages/FIX_S3_PRE.md, «Smaller, do if cheap»): the pace in feet (A-70), the companion's
// kept die on its chip and the «Броски спутников» switch on a screen (A-44), the wallet in words (A-33), the digest's parse
// repair (A-17). The action box's half screen (A-42) is in tests/fix-s2-c-ui, the typography floor (A-5) in
// tests/fix-s2-f2.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { TABLE_RULES } from "../src/lib/gameplay/dm-loop/roles.ts";
import { TABLE_RULES_RU } from "../src/lib/gameplay/dm-loop/roles-ru.ts";
import { buildTurnTimeline } from "../src/lib/ui/turn-timeline.ts";
import { coinAmountWord, walletParts } from "../src/lib/inventory/model.ts";
import { repairDigestJson, parseDigest } from "../src/lib/gameplay/dm-loop/digest.ts";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("A-70: the distance rule gives the pace in feet, in both languages", () => {
  assert.match(TABLE_RULES, /paces only as an approximation of feet \(a pace is about three feet\)/);
  assert.match(TABLE_RULES_RU, /шаги — только как примерный перевод футов \(шаг — около трёх футов\)/);
});

test("A-44: a companion's chip shows its kept die before the total; the hero's roll stays a card; the switch is on the Settings screen", () => {
  const check = { id: "c1", kind: "skill", actorId: "bram", actorName: "Брам", dice: [14], kept: 14, modifier: 3, total: 17, success: true, dc: 15,
    advantage: "normal", interactive: false, reason: "Восприятие", natural: null };
  const base = { text: "Брам прислушивается.", checks: [check], heroId: "hero", party: ["Брам"], companionRolls: "dm", status: "committed", idle: false, language: "ru" };
  const told = buildTurnTimeline({ ...base, rolls: [{ summary: "Брам: Восприятие: 17 против 15 — получилось", at: 5 }] });
  const chip = told.items.find((item) => item.kind === "chip");
  assert.equal(chip.who, "Брам");
  assert.equal(chip.text, "Восприятие: кубик 14 → 17 против 15 — получилось", "who, what, the die, the total, the result");
  // A recorded check without its own line gets the die too.
  const bare = buildTurnTimeline({ ...base, rolls: [] }).items.find((item) => item.kind === "chip");
  assert.equal(bare.text, "Восприятие: кубик 14 → 17 — получилось");
  const english = buildTurnTimeline({ ...base, language: "en", rolls: [{ summary: "Брам: Восприятие: 17 vs 15 — success", at: 5 }] }).items.find((item) => item.kind === "chip");
  assert.equal(english.text, "Восприятие: die 14 → 17 vs 15 — success");
  // A plain line that is no recorded check (a hit on the party) is left as the server wrote it.
  const hit = buildTurnTimeline({ ...base, checks: [], rolls: [{ summary: "Брам: хиты 20 → 14 (крюк)", at: 5 }] }).items.find((item) => item.kind === "chip");
  assert.equal(hit.text, "хиты 20 → 14 (крюк)");
  assert.deepEqual(buildTurnTimeline({ ...base, companionRolls: "player", rolls: [] }).items.map((item) => item.kind), ["card", "text"], "the player rolls for them: a card");
  const settings = src("src/components/registry/settings-screen.tsx");
  assert.match(settings, /c\("Броски спутников", "Companions' rolls"\)/);
  assert.match(settings, /value=\{current\?\.options\.companionRolls \?\? "dm"\}/);
  assert.match(settings, /saveDepth\(\{ options: \{ companionRolls: value as DmSettings\["options"\]\["companionRolls"\] \} \}\)/);
});

test("A-33: the wallet reads in words — Russian plurals, English names; the compact line keeps the code", () => {
  const word = (code, n) => coinAmountWord(code, n, "ru");
  assert.deepEqual([1, 2, 4, 5, 10, 11, 12, 14, 21, 22, 25, 101, 111].map((n) => `${n} ${word("зм", n)}`),
    ["1 золотая", "2 золотые", "4 золотые", "5 золотых", "10 золотых", "11 золотых", "12 золотых", "14 золотых", "21 золотая", "22 золотые", "25 золотых", "101 золотая", "111 золотых"]);
  assert.equal(word("см", 11), "серебряных");
  assert.equal(word("мм", 26), "медных");
  assert.equal(word("пм", 3), "платиновые");
  assert.equal(word("эм", 1), "электрумовая");
  assert.equal(word("ракушки", 7), "ракушки", "an unknown currency keeps its label");
  assert.equal(coinAmountWord("gp", 10, "en"), "gold");
  assert.deepEqual(walletParts({ "зм": 10, "см": 11, "мм": 26 }, "ru").map((part) => `${part.amount} ${word(part.label, part.amount)}`), ["10 золотых", "11 серебряных", "26 медных"]);
  const primitives = src("src/components/registry/primitives.tsx");
  assert.match(primitives, /\{compact \? <abbr title=\{part\.title\}[^>]*>\{part\.label\}<\/abbr>\s*: <span title=\{part\.title\}>\{coinAmountWord\(part\.label, part\.amount, c\.language\)\}<\/span>\}/);
});

test("A-17: the digest's answer is repaired — a trailing comma, an answer cut mid-field; nothing invented", () => {
  assert.deepEqual(repairDigestJson('{"title":"Застава","recap":"Мы у заставы.",}'), { title: "Застава", recap: "Мы у заставы." });
  const cut = '```json\n{"title":"Застава","recap":"Мы у заставы, и ] это не скобка.","notebook":"Ян ушёл.","plans":[{"key":"plan_yan","value":"Ян ведёт своих"},{"key":"plan_puzo","value":"Пузо прячет бля';
  assert.deepEqual(repairDigestJson(cut), { title: "Застава", recap: "Мы у заставы, и ] это не скобка.", notebook: "Ян ушёл.", plans: [{ key: "plan_yan", value: "Ян ведёт своих" }, { key: "plan_puzo" }] });
  assert.deepEqual(repairDigestJson('{"title":"Застава","rec'), { title: "Застава" }, "only the complete fields are kept");
  assert.equal(repairDigestJson("нет ответа"), null);
  // Through parseDigest: a cut answer with its recap and title is a digest; without a recap it is still none.
  const source = { snapshot: { campaign: { id: "c" }, entities: [], settings: { values: { language: "ru" } } }, runtime: { worldMinutes: 0 }, privateState: { fact: {} } };
  const digest = parseDigest(cut, source, 0);
  assert.equal(digest?.title, "Застава");
  assert.equal(digest?.recap, "Мы у заставы, и ] это не скобка.");
  assert.equal(parseDigest('{"title":"Застава","notebook":"x","rec', source, 0), null);
});

test("Part 3: a turn that starts a fight asks for its place's painted battle background after the commit (both runtimes); a turn without one does not", async () => {
  const { battleLocationOf } = await import("../src/lib/live2d/battle/contracts.ts");
  const { combatStarted, combatEnded } = await import("../src/lib/gameplay/dm-loop/loop.ts");
  const { loopCampaign } = await import("./dm-loop-fixture.mjs");
  const start = { call: { id: "a", name: "combat", arguments: { action: "start" } }, result: { ok: true }, position: 0 };
  assert.equal(combatStarted([start]), true);
  assert.equal(combatEnded([start]), false);
  assert.equal(combatStarted([{ ...start, result: { ok: false } }]), false, "a refused start is no fight");
  const place = "1f6c5d4e-3a2b-4c1d-9e8f-7a6b5c4d3e2f";
  assert.equal(battleLocationOf([{ status: "ended", public_field: { locationId: "x" } }, { status: "active", public_field: { locationId: place } }]), place);
  assert.equal(battleLocationOf([{ status: "active", public_field: {} }]), null, "a fight on no place: plain ground");
  assert.equal(battleLocationOf([]), null);
  const c = await loopCampaign({ language: "ru" });
  try {
    const events = [];
    const afterCommit = async (event) => { events.push(event); };
    const opened = await c.turn("Засада у брода.", [{ text: "Ян выходит из ельника. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "yan", name: "Кривой Ян", kind: "npc", present: true, hp: 11, maxHp: 11 } },
      { name: "combat", arguments: { action: "start", summary: "Брод", grid: { cols: 12, rows: 10 }, rules: true,
        placements: [{ actorRef: c.hero, x: 3, y: 5, initiative: 15 }, { actorRef: "yan", x: 6, y: 5, initiative: 9 }], hp: [{ actorRef: "yan", current: 11, max: 11, ac: 12 }] } },
      { name: "finish_turn", arguments: { sceneKinds: ["combat"], spotlight: [], playerMoment: false } }] }], { deps: { afterCommit } });
    assert.equal(opened.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(events.at(-1).combatStarted, true);
    const quiet = await c.turn("Смотрю на Яна.", [{ text: "Он ждёт.", toolCalls: [{ name: "finish_turn", arguments: { sceneKinds: ["combat"], spotlight: [], playerMoment: false } }] }], { deps: { afterCommit } });
    assert.equal(quiet.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(events.at(-1).combatStarted, false, "an ongoing fight asks nothing again");
  } finally { await c.f.db.close(); }
  // The wiring: the app's hook schedules the background off the turn's path; prepareBattleMap keeps «one per place and
  // sheet revision», the scene requirement and the pictures' cap.
  const service = src("src/lib/server/gameplay-service.ts");
  assert.match(service, /if \(combatStarted\) scheduleBattleBackground\(ownerId, campaignId\);/);
  const schedule = src("src/lib/live2d/server/battle-schedule.ts");
  assert.match(schedule, /try \{ after\(run\); \} catch \{ void run\(\); \}/);
  assert.match(schedule, /battleLocationOf\(source\.runtime\.encounters\)[\s\S]*prepareBattleMap\(campaignId, \{ locationId \}\)/);
  const battle = src("src/lib/live2d/server/battle.ts");
  assert.match(battle, /if \(!scene \|\| !scene\.sheet\.features\.length\) return \{ status: "no_scene", locationId \};/);
  assert.match(battle, /existing\.sheetRevision === scene\.revision && existing\.status !== "failed" && value\.force !== true\) return \{ status: "existing", locationId \};/);
  assert.match(battle, /if \(!capRemaining\(await picturesBoardOf\(pictures\)\)\) return \{ status: "cap", locationId \};/);
  assert.match(src("src/components/live2d/battle/battle-screen.tsx"), /battleMapOf\(board, field\.locationId\)\?\.pictureId/, "the battle map draws the place's picture");
});

test("Part 3: the owner's existing campaign gets its hidden layer on the next /play read (never from Settings); the layer's text is never on a screen unless the owner opts in", async () => {
  const { prepDecision } = await import("../src/lib/gameplay/dm-loop/prep-schedule.ts");
  const { hiddenLayerOf } = await import("../src/lib/gameplay/dm-loop/hidden-layer.ts");
  const { HIDDEN_LAYER_KEY } = await import("../src/lib/gameplay/dm-loop/private-notes.ts");
  const { dmViewOf } = await import("../src/lib/gameplay/dm-loop/dm-view.ts");
  const { loopCampaign } = await import("./dm-loop-fixture.mjs");
  const c = await loopCampaign({ language: "ru" });
  try {
    // A campaign with its story (as «Приключения начинаются» after the sandbox load) and no layer.
    const played = await c.turn("Осматриваюсь.", [{ text: "Тихо.", toolCalls: [{ name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [], playerMoment: false } }] }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const read = async () => (await c.f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) r", [c.owner, c.cid])).r;
    const before = await read();
    assert.ok(!hiddenLayerOf(before), "no layer yet");
    const state = { hasLayer: false, running: false, failedRecently: false, waitedBefore: false, committedTurns: 1 };
    assert.equal(prepDecision("play", state), "background", "armed: the game screen's first read starts the prep");
    assert.equal(prepDecision("settings", state), "none", "the Settings screen never starts it");
    assert.equal(prepDecision("first_turn", state), "none", "a campaign with turns never makes a turn wait");
    // The service's gate: the prep is scheduled with «existing» for a campaign that has committed turns.
    assert.match(src("src/lib/server/gameplay-service.ts"), /if \(options\.prep !== false && prepSchedulable\(campaignId\)\) schedulePrep\(campaignId, owner\.user\.id, play\.turns\.some\(\(turn\) => turn\.status === "committed"\) \? "existing" : "first"\);/);
    // Once written, the layer: the DM reads it; the owner's «Что видит ведущий» shows only that it exists until opted in.
    const play = await (await c.deps((await import("../src/lib/gameplay/dm-loop/scripted-model.ts")).createScriptedDmModel([]))).store.readPlay(c.cid);
    await c.dossier("private_notes", { set: [{ kind: "fact", key: HIDDEN_LAYER_KEY, value: "Тайный слой кампании (подготовка ведущего):\nПравда: мельник продаёт зерно разбойникам." }], remove: [] }, play.timeline);
    const after = await read();
    assert.match(hiddenLayerOf(after) ?? "", /мельник продаёт зерно/);
    assert.equal(prepDecision("play", { ...state, hasLayer: true }), "none", "once a layer exists, nothing runs again");
    const input = await c.input("Иду к мельнице.");
    const hidden = dmViewOf({ ...after, dmOptions: { secretsVisible: false } }, input);
    assert.ok(!JSON.stringify(hidden).includes("мельник продаёт"), "the owner's view carries no layer text by default");
    assert.equal(hidden.memoryGauge.hiddenLayer, true, "only that a layer exists");
    const opened = dmViewOf({ ...after, dmOptions: { secretsVisible: true } }, input);
    assert.ok(JSON.stringify(opened).includes("мельник продаёт"), "the owner who opts in sees it");
    const publicPlay = JSON.stringify(await (await c.deps((await import("../src/lib/gameplay/dm-loop/scripted-model.ts")).createScriptedDmModel([]))).store.readPlay(c.cid));
    // The public tables (the fixture's dump also reads rpg_private.dm_state, the DM's own store, where the layer lives).
    const { dmState, ...records } = await c.state();
    assert.match(JSON.stringify(dmState), /мельник продаёт/, "the layer lives in the DM's private state");
    const publicState = JSON.stringify(records);
    assert.ok(!publicPlay.includes("мельник продаёт") && !publicState.includes("мельник продаёт"), "the player's play and records never have it");
  } finally { await c.f.db.close(); }
});
