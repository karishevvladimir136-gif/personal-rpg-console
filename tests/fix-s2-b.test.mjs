// Fix run after session 2, stage B (docs/stages/FIX_S2_AB.md): the hidden layer (B1), memory hygiene (B2), the
// session's rules (B3), the voice (B4). Disposable PGlite databases and scripted models only; nothing paid.
import test from "node:test";
import assert from "node:assert/strict";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { buildDmLoopContext, privateNotesGauge } from "../src/lib/gameplay/dm-loop/context.ts";
import { archiveKey, parseNoteValue, privateNotes, rankNotes, recallNotes, serializeNote, HIDDEN_LAYER_KEY } from "../src/lib/gameplay/dm-loop/private-notes.ts";
import { parsePrep, prepWrites } from "../src/lib/gameplay/dm-loop/hidden-layer.ts";
import { DM_ROLE, TABLE_RULES, WRITER_ROLE } from "../src/lib/gameplay/dm-loop/roles.ts";
import { VOICE_LAYER_RU } from "../src/lib/gameplay/dm-loop/voice.ts";
import { readFileSync } from "node:fs";

const bootstrapInstructions = readFileSync(new URL("../src/lib/server/adventure-bootstrap-provider.ts", import.meta.url), "utf8");

const finish = () => ({ name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [], playerMoment: false, nextTension: "calm" } });
const time = (minutes) => ({ name: "advance_time", arguments: { minutes, reason: "время идёт" } });
const note = (key, value) => ({ name: "note_world", arguments: { kind: "fact", key, operation: "set", value } });

// --- B2: validity, the archive, closing, recall ---------------------------------------------------------
test("B2: a note is true since it was set; a different text keeps the old one closed; close ends a note; recall answers «what was true then»", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const first = await c.turn("Ищу Тарра.", [{ text: "Тарр сидит на складе. ", toolCalls: [note("tarr", "Тарр прячется на складе у отмели"), time(60), finish()] }]);
    assert.equal(first.result.status, "committed", JSON.stringify(c.errors));
    let state = await c.state();
    const stored = parseNoteValue(state.dmState.fact.tarr);
    assert.deepEqual(stored, { text: "Тарр прячется на складе у отмели", since: 0, until: null });
    const second = await c.turn("Жду до вечера.", [{ text: "Вечереет. ", toolCalls: [time(120), note("tarr", "Тарр ушёл в доки"), finish()] }]);
    assert.equal(second.result.status, "committed", JSON.stringify(c.errors));
    state = await c.state();
    assert.deepEqual(parseNoteValue(state.dmState.fact.tarr), { text: "Тарр ушёл в доки", since: 180, until: null });
    assert.deepEqual(parseNoteValue(state.dmState.fact[archiveKey("tarr", 180)]), { text: "Тарр прячется на складе у отмели", since: 0, until: 180 });
    const third = await c.turn("Вспоминаю, где был Тарр утром.", [{ text: "Ты вспоминаешь. ", toolCalls: [
      { name: "recall", arguments: { query: "Тарр", atWorldMinutes: 30 } }, { name: "recall", arguments: { query: "Тарр" } }] },
      { text: "Утром он был на складе.", toolCalls: [{ name: "note_world", arguments: { kind: "fact", key: "tarr", operation: "close" } }, time(5), finish()] }]);
    assert.equal(third.result.status, "committed", JSON.stringify(c.errors));
    const receipts = (await c.row(third.input.operationId)).checkpoint.dmLoop.receipts;
    const [then, all] = receipts.filter((r) => r.call.name === "recall").map((r) => r.result.value.notes);
    assert.deepEqual(then.map((n) => n.text), ["Тарр прячется на складе у отмели"], "only what was true at minute 30");
    assert.deepEqual(all.map((n) => n.text), ["Тарр ушёл в доки", "Тарр прячется на складе у отмели"], "open first, then closed");
    state = await c.state();
    assert.equal(parseNoteValue(state.dmState.fact.tarr).until, 180, "closed before the five minutes of the same message");
    // The player never sees a recall in the list of changes.
    const play = await (await c.deps((await import("../src/lib/gameplay/dm-loop/scripted-model.ts")).createScriptedDmModel([]))).store.readPlay(c.cid);
    const turn = play.turns.find((t) => t.id === third.input.operationId);
    assert.ok(!turn.changes.some((change) => change.tool === "recall"), JSON.stringify(turn.changes));
    // Closing twice, closing nothing, writing a server key are refused.
    const refused = await c.turn("Ещё раз.", [{ text: "Тихо. ", toolCalls: [
      { name: "note_world", arguments: { kind: "fact", key: "tarr", operation: "close" } },
      { name: "note_world", arguments: { kind: "fact", key: "nobody", operation: "close" } },
      note(HIDDEN_LAYER_KEY, "подмена"), note(archiveKey("tarr", 1), "подмена"), time(1), finish()] }]);
    const reasons = (await c.row(refused.input.operationId)).checkpoint.dmLoop.receipts.filter((r) => !r.result.ok).map((r) => r.result.reason);
    assert.equal(reasons.length, 4, JSON.stringify(reasons));
  } finally { await c.f.db.close(); }
});

test("B2: the DM reads open clocks and consequences first, open facts newest first, closed notes last — the budget cuts the closed ones", () => {
  const state = { fact: { old: serializeNote("старое", 10), fresh: serializeNote("свежее", 500), gone: serializeNote("было", 5, 400), legacy: "без даты",
    clock_storm: serializeNote("буря близко", 100) }, clock: { clock_storm: 3 }, consequence: { debt: serializeNote("долг гильдии", 300) } };
  const ranked = rankNotes(privateNotes(state)).map((n) => `${n.kind}:${n.key}`);
  assert.deepEqual(ranked, ["clock:clock_storm", "consequence:debt", "fact:fresh", "fact:old", "fact:legacy", "fact:gone"]);
  assert.match(privateNotes(state).find((n) => n.kind === "clock").text, /^3 — буря близко$/);
  assert.deepEqual(recallNotes(privateNotes(state), "было", 100).map((n) => n.key), ["gone"]);
  assert.deepEqual(recallNotes(privateNotes(state), "было", 450).map((n) => n.key), [], "closed at 400");
});

// --- B1: the hidden layer -------------------------------------------------------------------------------
test("B1: the prep's answer becomes the hidden layer (bounded) and its clocks; unreadable answers are refused", () => {
  const answer = `Вот подготовка: ${JSON.stringify({
    truth: "За кражами стоит смотритель маяка: он продаёт контрабандистам огни.",
    factions: [{ name: "Гильдия водолазов", hiddenAim: "скрыть, что их люди ныряли за грузом" }],
    secrets: Array.from({ length: 12 }, (_, i) => `тайна ${i + 1}`),
    clocks: [{ key: "Lighthouse Deal!", label: "сделка маяка", segments: 20, trigger: "груз уходит морем" }],
    wonder: { thing: "медная печать с чужим гербом", history: "печать старого ордена", question: "кто её носит теперь?" },
    clues: ["след смолы на ступенях маяка"] })}`;
  const prep = parsePrep(answer, "ru");
  assert.match(prep.text, /^Тайный слой кампании/);
  assert.match(prep.text, /Правда: За кражами стоит смотритель маяка/);
  assert.equal((prep.text.match(/тайна \d+/g) ?? []).length, 10, "at most ten secrets");
  assert.deepEqual(prep.clocks, [{ key: "clock_lighthouse_deal", label: "сделка маяка", segments: 8, trigger: "груз уходит морем" }]);
  assert.match(prep.text, /Чудо: медная печать с чужим гербом/);
  const writes = prepWrites(prep, { privateState: { clock: {} } });
  assert.deepEqual(writes.map((w) => `${w.kind}:${w.key}`), ["fact:hidden_layer", "clock:clock_lighthouse_deal", "fact:clock_lighthouse_deal"]);
  assert.equal(parsePrep("нет JSON", "ru"), null);
  assert.equal(parsePrep(JSON.stringify({ factions: [] }), "ru"), null, "no truth, no layer");
});

test("B1: the owner's «Тайны» (world and campaign) and the hidden layer head the DM's private notes, never budget-dropped; the player's snapshot never has them", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const saved = (await c.f.one("select public.rpg_dm_secrets($1,'campaign',$2,'save',$3::jsonb) r", [c.owner, c.cid, JSON.stringify({ body: "Настоятель — сын убитого графа." })])).r;
    assert.equal(saved.revision, 1);
    await assert.rejects(c.f.one("select public.rpg_dm_secrets($1,'campaign',$2,'save',$3::jsonb) r", [c.owner, c.cid, JSON.stringify({ body: "x", expectedRevision: 7 })]), /rpg_conflict/);
    const play = await (await c.deps((await import("../src/lib/gameplay/dm-loop/scripted-model.ts")).createScriptedDmModel([]))).store.readPlay(c.cid);
    const timeline = play.timeline;
    const layer = "Тайный слой кампании (подготовка ведущего):\nПравда: маяк продаёт огни.";
    const written = await c.dossier("private_notes", { set: [{ kind: "fact", key: HIDDEN_LAYER_KEY, value: layer }, { kind: "clock", key: "clock_deal", value: "0" }], remove: [] }, timeline);
    assert.equal(written.set, 2);
    await assert.rejects(c.dossier("private_notes", { set: [{ kind: "fact", key: "character_x", value: "x" }], remove: [] }, timeline), /rpg_validation/);
    await assert.rejects(c.dossier("private_notes", { set: [{ kind: "clock", key: "clock_deal", value: "много" }], remove: [] }, timeline), /rpg_validation/);
    await assert.rejects(c.dossier("private_notes", { set: [{ kind: "fact", key: "a", value: "b" }], remove: [] }, { ...timeline, epoch: timeline.epoch + 5 }));
    // Many notes: the budget drops some, never the owner's secrets or the layer.
    const many = Array.from({ length: 60 }, (_, i) => ({ kind: "fact", key: `note_${i}`, value: serializeNote(`заметка номер ${i} `.repeat(20), i) }));
    await c.dossier("private_notes", { set: many, remove: [] }, timeline);
    const source = (await c.f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) r", [c.owner, c.cid])).r;
    assert.equal(source.dmSecrets.campaign, "Настоятель — сын убитого графа.");
    const input = await c.input("Осматриваюсь.");
    const context = buildDmLoopContext(source, input);
    const tail = context.parts.tail;
    assert.match(tail, /The owner's own secrets[\s\S]*Настоятель — сын убитого графа\.[\s\S]*Тайный слой кампании[\s\S]*Private DM notes/);
    const gauge = privateNotesGauge(source);
    assert.ok(gauge.dropped > 0 && gauge.hiddenLayer && gauge.notes >= 60, JSON.stringify(gauge));
    // The player's snapshot (public) carries neither.
    const snapshot = JSON.stringify(await c.state().then((s) => ({ entities: s.entities, scenes: s.scenes })));
    assert.ok(!snapshot.includes("Настоятель") && !snapshot.includes("маяк продаёт"));
  } finally { await c.f.db.close(); }
});

test("B1/B3/B4: the table rules are in both roles; the bootstrap no longer forbids a hidden explanation; the humour recipe is gone", () => {
  for (const role of [DM_ROLE, WRITER_ROLE]) {
    assert.ok(role.includes(TABLE_RULES));
    assert.match(role, /hero's own check shows its difficulty/);
  }
  assert.match(TABLE_RULES, /hero's will is the player's/);
  assert.match(TABLE_RULES, /Mystery and wonder/);
  assert.match(TABLE_RULES, /natural 20 succeeds and a natural 1 fails/);
  assert.match(TABLE_RULES, /Distances are in feet/);
  assert.doesNotMatch(bootstrapInstructions, /Do not create a culprit, twist, hidden explanation/);
  assert.match(bootstrapInstructions, /DM's private prep/);
  assert.doesNotMatch(VOICE_LAYER_RU, /переворачивает чужие слова буквально и мрачно/);
  assert.match(VOICE_LAYER_RU, /Острот на чужие слова нет; шутка — не чаще раза за сцену/);
});

// --- B4: «Инструкции ведущего: русские» ----------------------------------------------------------------
test("B4: Russian instructions give a Russian campaign the native role, headers, table rules and nudges; English stays the default", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const source = (await c.f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) r", [c.owner, c.cid])).r;
    const input = await c.input("Осматриваюсь.");
    const en = buildDmLoopContext(source, input);
    assert.match(en.parts.howToDm, /^You are the game master/);
    const ruSource = { ...source, dmOptions: { instructions: "ru" } };
    const ru = buildDmLoopContext(ruSource, input);
    assert.match(ru.parts.howToDm, /^Ты ведёшь частную долгую ролевую кампанию/);
    assert.match(ru.parts.howToDm, /Правила стола \(владельца, после второй сессии\)/);
    assert.match(ru.parts.howToDm, /Язык кампании — русский/);
    assert.doesNotMatch(ru.system.map((b) => b.text).join("\n"), /Current state \(before this turn|Canon documents \(established|Private DM notes \(never shown/);
    assert.match(ru.parts.now + ru.user, /Текущее состояние \(до этого хода/);
    // Code identifiers stay Latin: every tool the DM may call is named in the Russian role.
    for (const name of ["roll", "note_world", "finish_turn", "upsert_character", "recall", "targetRef", "halfOnSave", "npcRefused"]) assert.ok(ru.parts.howToDm.includes(name), name);
    const writer = buildDmLoopContext(ruSource, input, { role: "writer" });
    assert.match(writer.parts.howToDm, /У тебя два инструмента: roll — кости, и recall/);
    assert.match(writer.parts.howToDm, /<ledger> … <\/ledger>/);
    // An English campaign ignores the setting.
    const english = { ...ruSource, snapshot: { ...source.snapshot, settings: { ...source.snapshot.settings, values: { ...source.snapshot.settings.values, language: "en" } } } };
    assert.match(buildDmLoopContext(english, input).parts.howToDm, /^You are the game master/);
    // The server's nudge comes in Russian: a roll with no outcome told is asked for it in Russian.
    const before = await c.settings.read();
    await c.settings.save({ expectedRevision: before.revision, runtime: "dm-loop-v1", dmTurn: before.dmTurn, options: { instructions: "ru" } });
    const played = await c.turn("Взламываю замок.", [
      { text: "Ты опускаешься к замку. ", toolCalls: [{ name: "roll", arguments: { formula: "1d20+2", reason: "взлом замка", actorRef: c.hero, visibility: "player", difficulty: "normal" } }] },
      { text: "", toolCalls: [time(5), finish()] },
      { text: "Штифты поддаются один за другим.", toolCalls: [finish()] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    assert.match(played.model.requests[2].messages.at(-1).text, /^Игрок видел бросок, но не видел, что из него вышло/);
  } finally { await c.f.db.close(); }
});

// --- B3: the session's rules on the server ---------------------------------------------------------------
test("B3: a natural 20 on a check succeeds and a natural 1 fails whatever the total; a formula modifier on top of the sheet's skill is dropped", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    c.forceDice([20, 1]);
    const played = await c.turn("Пробую невозможное и лёгкое.", [
      { text: "Ты пробуешь. ", toolCalls: [
        { name: "roll", arguments: { formula: "1d20+2", reason: "прыжок через пропасть", actorRef: c.hero, visibility: "player", dc: 30 } },
        { name: "roll", arguments: { formula: "1d20+10", reason: "открыть дверь", actorRef: c.hero, visibility: "player", dc: 5 } }] },
      { text: "Прыжок удался, а дверь не поддалась.", toolCalls: [time(1), finish()] },
    ], { dice: [20, 1] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const rolls = (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts.filter((r) => r.call.name === "roll");
    assert.deepEqual(rolls.map((r) => [r.result.value.kept, r.result.value.total, r.result.value.dc, r.result.value.success]), [[20, 22, 30, true], [1, 11, 5, false]]);
    assert.match(rolls[1].result.value.hint, /no extra harm/);
    const sheet = await c.turn("Ищу следы.", [{ text: "Ты осматриваешь пол. ", toolCalls: [
      { name: "roll", arguments: { formula: "1d20+5", reason: "поиск следов", actorRef: c.hero, visibility: "player", difficulty: "normal", modifierField: "level" } }] },
      { text: "Следы есть.", toolCalls: [time(1), finish()] }]);
    const roll = (await c.row(sheet.input.operationId)).checkpoint.dmLoop.receipts.find((r) => r.call.name === "roll");
    if (roll.result.ok) {
      assert.match(roll.result.value.modifierDropped, /formula's \+5 was dropped/);
      assert.equal(roll.result.value.modifier, (await c.state()).entities.find((e) => e.id === c.hero).stats.level);
    } else assert.match(roll.result.reason, /no sheet stat/);
  } finally { await c.f.db.close(); }
});

test("B3: one rest call refills the rest-based counters — the named ones, and every spell slot on a safe long rest; an unsafe rest refills nothing", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const setup = await c.turn("Колдую.", [{ text: "Ты тратишь силы. ", toolCalls: [
      { name: "resource", arguments: { actorRef: c.hero, resource: "spell_slots_1", set: 0, max: 3, reason: "заклинания" } },
      { name: "resource", arguments: { actorRef: c.hero, resource: "ki", set: 1, max: 4, reason: "приёмы" } },
      { name: "resource", arguments: { actorRef: c.hero, resource: "arrows", set: 5, max: 20, reason: "стрелы" } }, time(5), finish()] }]);
    assert.equal(setup.result.status, "committed", JSON.stringify(c.errors));
    const resources = async () => (await c.state()).entities.find((e) => e.id === c.hero).resources;
    const short = await c.turn("Короткий отдых.", [{ text: "Вы отдыхаете час. ", toolCalls: [{ name: "rest", arguments: { kind: "short", safe: true, restore: ["ki"] } }, finish()] }]);
    assert.equal(short.result.status, "committed", JSON.stringify(c.errors));
    assert.deepEqual([(await resources()).ki, (await resources()).spell_slots_1, (await resources()).arrows], [4, 0, 5], "a short rest refills what it names");
    const unsafe = await c.turn("Ночь у костра.", [{ text: "Ночью тревожно. ", toolCalls: [{ name: "rest", arguments: { kind: "long", safe: false } }, finish()] }]);
    assert.equal(unsafe.result.status, "committed", JSON.stringify(c.errors));
    assert.equal((await resources()).spell_slots_1, 0, "an interrupted rest refills nothing");
    const long = await c.turn("Долгий отдых.", [{ text: "Ночь проходит спокойно. ", toolCalls: [{ name: "rest", arguments: { kind: "long", safe: true } }, finish()] }]);
    assert.equal(long.result.status, "committed", JSON.stringify(c.errors));
    assert.deepEqual([(await resources()).spell_slots_1, (await resources()).arrows], [3, 5], "spell slots refilled; arrows are not rest-based");
    const receipt = (await c.row(long.input.operationId)).checkpoint.dmLoop.receipts.find((r) => r.call.name === "rest");
    assert.match(receipt.result.summary, /restored .*spell_slots_1 0→3/);
  } finally { await c.f.db.close(); }
});
