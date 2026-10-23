// Fix S3-accept, block В (docs/stages/FIX_S3_ACCEPT.md «В — spells as items»): the wizard's spells as records like
// things — a card per spell (school, level, time, range, components, duration, text, history, known / prepared), the tab
// with «Заговоры», «Подготовлено сегодня» and «Книга заклинаний», a school filter, the slot pips that dim when the server
// records the cast, a picture per spell within the daily cap, the one-time conversion of the «Умения» prose. Disposable
// PGlite databases and synthetic sheets only.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { spellId } from "../src/lib/inventory/model.ts";
import { conversionPatch, convertSpellProse, dmSheetView, spellCard, SPELL_CARDS_RU, spellTabView } from "../src/lib/inventory/spell-records.ts";
import { applyPlan, planSheet } from "../src/lib/inventory/owner-moves.ts";
import { patchSheet } from "../src/lib/inventory/sheet.ts";
import { sheetOf } from "../src/lib/ui/campaign-view.ts";
import { applyLiveEvent, emptyLiveTurn, withLiveCounters } from "../src/lib/gameplay/live-turn-client.ts";
import { anchorSet, capRemaining, defaultPictureSettings, emptyPictureBoard, parsePicture, planAutopilot, spellSubjects } from "../src/lib/visual-frame/pictures.ts";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const finish = { name: "finish_turn", arguments: { sceneKinds: ["exploration"], spotlight: [], playerMoment: false, nextTension: "calm" } };
const time = { name: "advance_time", arguments: { minutes: 1, reason: "время" } };

// The owner's wizard as his sheet holds him before this stage: schema 1 (no level, no spell records — the bootstrap's
// sheet), the spells as prose in «Умения» next to lines that are not spells.
const CANTRIPS = ["Огненный снаряд", "Электрошок", "Волшебная рука", "Сообщение"];
const LEVELLED = { "Щит": 1, "Доспехи мага": 1, "Огненные ладони": 1, "Палящий луч": 2, "Туманный шаг": 2, "Удержание личности": 2, "Огненный шар": 3, "Молния": 3, "Контрзаклинание": 3 };
const OTHER = ["Магическое восстановление: раз в день после короткого отдыха", "Книга заклинаний с полным списком известных заклинаний"];
const ownerSheet = (abilities) => ({ schemaVersion: 1, mode: "structured_rpg", role: "Волшебник", background: "Выпускник академии Кормира.", level: null, tier: null,
  attributes: { strength: 8, dexterity: 14, constitution: 13, intelligence: 18, wisdom: 12, charisma: 10 }, skills: ["Магия +7", "История +7"],
  abilities, limitations: [], spells: [] });
const BY_LEVEL = ["Заговоры: Огненный снаряд, Электрошок, Волшебная рука, Сообщение", "Подготовленные заклинания 1 круга: Щит, Доспехи мага, Огненные ладони",
  "Подготовленные заклинания 2 круга: Палящий луч, Туманный шаг, Удержание личности", "Подготовленные заклинания 3 круга: Огненный шар, Молния, Контрзаклинание", ...OTHER];
const ONE_LINE = ["Заговоры: Огненный снаряд, Электрошок, Волшебная рука, Сообщение",
  "Подготовлено: 1 круг — Щит, Доспехи мага, Огненные ладони; 2 круг — Палящий луч, Туманный шаг, Удержание личности; 3 круг — Огненный шар, Молния, Контрзаклинание", ...OTHER];
const SLOTS = { spell_slots_1: 4, spell_slots_1_max: 4, spell_slots_2: 3, spell_slots_2_max: 3, spell_slots_3: 2, spell_slots_3_max: 2 };

const send = async (c, plan) => {
  assert.equal(plan.ok, true, plan.reason);
  const revisions = new Map();
  for (const step of plan.steps) {
    const saved = await c.f.mutation(step.operation, c.cid, step.payload, revisions.get(step.payload.id) ?? step.before?.revision ?? 0);
    revisions.set(step.payload.id, saved.revision);
  }
};
const heroSheet = async (c) => (await c.f.one("select character_sheet s, revision from public.rpg_entities where id=$1", [c.hero]));
const withOwnerSheet = async (c, abilities = BY_LEVEL) =>
  c.f.db.query("update public.rpg_entities set character_sheet=$2::jsonb, resources=resources||$3::jsonb where id=$1", [c.hero, JSON.stringify(ownerSheet(abilities)), JSON.stringify(SLOTS)]);
const contextText = async (c) => {
  const { buildDmLoopContext } = await import("../src/lib/gameplay/dm-loop/context.ts");
  const source = (await c.f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) result", [c.owner, c.cid])).result;
  const context = buildDmLoopContext(source, { operationId: randomUUID(), campaignId: c.cid, timeline: source.timeline, expectedRevision: source.runtime.revision, mode: "game",
    input: "Дальше.", companionId: null, listenerIds: [], mechanic: null });
  return context.system.map((block) => block.text).join("\n");
};

test("В1: the cards — thirteen Russian spells of the owner's wizard at the 5e SRD level, each with its school, level and every field", () => {
  assert.equal(SPELL_CARDS_RU.length, 13);
  for (const name of CANTRIPS) assert.equal(spellCard(name)?.level, 0, name);
  for (const [name, level] of Object.entries(LEVELLED)) assert.equal(spellCard(name)?.level, level, name);
  for (const card of SPELL_CARDS_RU) {
    for (const key of ["school", "castingTime", "range", "components", "duration", "text"]) assert.ok(card[key]?.trim(), `${card.name}: ${key}`);
    for (const key of ["castingTime", "range", "components", "duration", "saveOrAttack", "damage"]) assert.ok(!card[key] || card[key].length <= 160, `${card.name}: ${key}`);
    assert.ok(card.text.length >= 150 && card.text.length <= 2400, card.name);
    assert.match(card.text, /[а-яё]/i, "Russian");
  }
  assert.equal(spellCard("Доспех мага")?.name, "Доспехи мага", "a common other name");
  assert.equal(spellCard("«огненный шар»")?.name, "Огненный шар");
  assert.equal(spellCard("Удержание личности").concentration, true);
  assert.match(spellCard("Огненный шар").higherLevels, /1к6 за каждый круг выше третьего/);
  assert.equal(spellId("Огненный шар"), spellId(" огненный  ШАР "), "one name, one id");
  assert.notEqual(spellId("Огненный шар"), spellId("Огненный снаряд"));
  assert.match(spellId("Щит"), /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test("В1: conversion on a fixture sheet — the «Умения» prose becomes thirteen records, the other lines stay, it runs once", () => {
  for (const abilities of [BY_LEVEL, ONE_LINE]) {
    const done = convertSpellProse(ownerSheet(abilities), "ru");
    assert.ok(done);
    assert.deepEqual(done.kept, OTHER, "lines that are not spells stay as they were");
    assert.equal(done.sheet.schemaVersion, 2);
    assert.deepEqual(done.sheet.skills, ["Магия +7", "История +7"]);
    const spells = done.sheet.spells;
    assert.deepEqual(spells.map((row) => row.name).sort(), [...CANTRIPS, ...Object.keys(LEVELLED)].sort());
    for (const row of spells) {
      const cantrip = CANTRIPS.includes(row.name);
      assert.equal(row.level, cantrip ? 0 : LEVELLED[row.name], row.name);
      assert.equal(row.known, true, row.name);
      assert.equal(row.prepared, cantrip ? undefined : true, `${row.name}: prepared as listed`);
      assert.equal(row.id, spellId(row.name));
      assert.deepEqual(row.history, ["перенесено из «Умений»"]);
      assert.ok(row.school && row.castingTime && row.range && row.components && row.duration && row.text, row.name);
    }
    assert.equal(convertSpellProse(done.sheet, "ru"), null, "a converted sheet converts no more");
  }
  // A sheet that already holds a record keeps the record's own words; a line that is not wholly spells is kept.
  const v2 = patchSheet(ownerSheet(["Заговоры: Огненный снаряд, Луч холода", "Подготовлено (1 круг): Щит"]), { spells: [{ name: "Щит", level: 1, prepared: false, text: "Мой щит." }] });
  const done = convertSpellProse(v2, "ru");
  assert.deepEqual(done.kept, [], "both lines are lists of spells");
  assert.equal(done.sheet.spells.find((row) => row.name === "Щит").text, "Мой щит.", "the record's own text wins over the card");
  assert.equal(done.sheet.spells.find((row) => row.name === "Луч холода")?.level, 0, "a name the cards do not know, on a cantrip line, is a cantrip");
  const dm = dmSheetView(ownerSheet(BY_LEVEL), "ru");
  assert.equal(dm.spells.length, 13, "the DM reads one line per spell");
  assert.deepEqual(dm.abilities, OTHER);
  assert.ok(dm.spells.includes("Контрзаклинание — 3, Ограждение, prepared"));
  assert.equal(convertSpellProse(ownerSheet(OTHER), "ru"), null, "no spell prose, nothing to do");
  assert.equal(convertSpellProse(ownerSheet(["Книга заклинаний: Обнаружение магии, Свет"]), "ru"), null, "a list without levels the cards do not know stays prose");
  assert.equal(convertSpellProse(ownerSheet(["Ячейки заклинаний: 4/3/2"]), "ru"), null);
});

test("В1: conversion on a fixture campaign — saved once through the owner's sheet correction (a new revision, its receipt kept); the DM reads the structured list", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    await withOwnerSheet(c, BY_LEVEL);
    // Before the conversion the DM already reads the spells as records (the prose read as converted), never as prose.
    let text = await contextText(c);
    assert.match(text, /Огненный шар — 3, Воплощение, prepared/);
    assert.match(text, /Огненный снаряд — cantrip, Воплощение/);
    assert.doesNotMatch(text, /Подготовленные заклинания 3 круга/);
    assert.match(text, /Магическое восстановление/, "the other lines stay in the DM's sheet");
    assert.doesNotMatch(text, /Сгусток пламени|срывается сгусток/, "the cards' texts stay on the screen");

    const before = await heroSheet(c);
    const snapshot = await c.f.saves(c.cid, "campaign");
    const patch = conversionPatch(before.s, "ru");
    assert.equal(patch.spells.length, 13);
    const plan = planSheet(snapshot, c.hero, patch, { language: "ru", at: 0, newId: () => randomUUID() });
    assert.deepEqual(plan.steps.map((step) => step.operation), ["entity.save"]);
    await send(c, plan);
    const after = await heroSheet(c);
    assert.equal(after.revision, before.revision + 1, "a new revision of the record");
    assert.equal(after.s.schemaVersion, 2);
    assert.equal(after.s.spells.length, 13);
    assert.deepEqual(after.s.abilities, OTHER);
    assert.equal((await c.f.one("select rpg_private.sheet_valid($1::jsonb) v", [JSON.stringify(after.s)])).v, true);
    const receipt = await c.f.one("select request from rpg_private.mutation_receipts where campaign_id=$1 and request->>'operation'='entity.save' order by created_at desc limit 1", [c.cid]);
    assert.equal(receipt.request.payload.character_sheet.spells.length, 13, "the correction is kept with its receipt");
    assert.equal(conversionPatch(after.s, "ru"), null, "once: the saved sheet has no spell prose left");
    const view = sheetOf({ character_sheet: after.s, stats: {} });
    assert.equal(view.spells.find((row) => row.name === "Удержание личности").school, "Очарование");
    text = await contextText(c);
    assert.match(text, /Удержание личности — 2, Очарование, prepared, concentration/);
  } finally { await c.f.db.close(); }
});

test("В1: prepared toggle — «Подготовлено сегодня» and «Книга заклинаний» from one record; the toggle is the owner's sheet edit; the school filter", () => {
  const sheet = convertSpellProse(ownerSheet(BY_LEVEL), "ru").sheet;
  let tab = spellTabView(sheet.spells, SLOTS, null, "ru");
  assert.equal(tab.preparing, true);
  assert.deepEqual(tab.cantrips.map((row) => row.name).sort(), [...CANTRIPS].sort());
  assert.deepEqual(tab.prepared.map((group) => [group.label, group.spells.length, group.slots]), [["1 круг", 3, { value: 4, max: 4 }], ["2 круг", 3, { value: 3, max: 3 }], ["3 круг", 3, { value: 2, max: 2 }]]);
  assert.deepEqual(tab.book.map((group) => [group.label, group.spells.length]), [["1 круг", 3], ["2 круг", 3], ["3 круг", 3]], "everything written in the book");
  assert.equal(tab.preparedCount, 9);
  assert.deepEqual(tab.schools.map((row) => row.word), ["Ограждение", "Вызов", "Очарование", "Воплощение", "Преобразование"]);
  // The owner puts «Молния» back in the book: the same planSheet a sheet edit is.
  const data = { campaign: { id: "c", language: "ru" }, entities: [{ id: "hero", campaign_id: "c", kind: "player", name: "Рэй", details: "", hp: 30, max_hp: 30, stats: {}, resources: SLOTS,
    conditions: [], equipment_slots: [], public_profile: {}, character_sheet: sheet, revision: 3, updated_at: "" }], storages: [], items: [], locations: [] };
  const bolt = sheet.spells.find((row) => row.name === "Молния");
  const plan = planSheet(data, "hero", { spells: [{ ...bolt, prepared: false }] }, { language: "ru", at: 0, newId: () => randomUUID() });
  assert.equal(plan.ok, true);
  assert.match(plan.note, /Рэй/);
  const next = applyPlan(data, plan.steps).entities[0].character_sheet;
  const row = next.spells.find((spell) => spell.name === "Молния");
  assert.equal(row.prepared, false);
  assert.equal(row.id, bolt.id, "the id stays");
  assert.deepEqual(row.history, bolt.history, "the history stays");
  assert.equal(row.text, bolt.text);
  tab = spellTabView(next.spells, SLOTS, null, "ru");
  assert.deepEqual(tab.prepared.find((group) => group.level === 3).spells.map((spell) => spell.name).sort(), ["Контрзаклинание", "Огненный шар"]);
  assert.equal(tab.book.find((group) => group.level === 3).spells.length, 3, "still in the book");
  assert.equal(tab.preparedCount, 8);
  // The school filter: evocation only — the slot pips stay for every level.
  const evocation = spellTabView(next.spells, SLOTS, null, "ru", "Воплощение");
  assert.deepEqual(evocation.cantrips.map((spell) => spell.name).sort(), ["Огненный снаряд", "Электрошок"]);
  assert.ok(evocation.book.flatMap((group) => group.spells).every((spell) => spell.school === "Воплощение"));
  assert.equal(evocation.slots.length, 3);
  // The tab on screen: three sections, a toggle from the book, a school filter, the pips, the card with its history.
  const tabSource = src("src/components/registry/spells-tab.tsx");
  for (const words of ["\"Заговоры\"", "\"Подготовлено сегодня\"", "\"Книга заклинаний\"", "\"Все школы\"", "\"История\"", "\"Колдовать\"", "\"подготовить\""]) assert.ok(tabSource.includes(words), words);
  assert.match(tabSource, /onPrepare\(spell, !spell\.prepared\)/);
  assert.match(tabSource, /<Pips left=\{group\.slots\.value\}/);
  const screen = src("src/components/registry/character-screen.tsx");
  assert.match(screen, /import \{ SpellsTab, useSpellConversion \} from "\.\/spells-tab"/);
  assert.match(screen, /planSheet\(view, entity\.id, \{ spells: \[\{ \.\.\.spell, prepared \}\] \}, ctx\)/);
});

test("В1: the DM's sheet tool adds a spell like a thing — its card, its history line, its id; the hero's prose converts in the same call", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    await withOwnerSheet(c, ONE_LINE);
    const played = await c.turn("Переписываю свиток в книгу.", [{ text: "Ты переписываешь свиток. ", toolCalls: [
      { name: "upsert_character", arguments: { ref: c.hero, reason: "переписал свиток", sheet: { spells: [
        { name: "Огненный шар", level: 3, history: "переписано со свитка" }, { name: "Стена огня", level: 4, known: true, prepared: false, school: "Воплощение", text: "Стена пламени." }] } } },
      time, finish] }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const receipts = (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts;
    const sheetCall = receipts.find((row) => row.call.name === "upsert_character");
    assert.equal(sheetCall.result.ok, true, sheetCall.result.reason);
    assert.match(sheetCall.result.player, /заклинания: Стена огня/, "the chip names the call's change, not the conversion");
    const { s } = await heroSheet(c);
    assert.equal(s.spells.length, 14);
    const fireball = s.spells.find((row) => row.name === "Огненный шар");
    assert.deepEqual(fireball.history, ["перенесено из «Умений»", "переписано со свитка"]);
    assert.equal(fireball.prepared, true, "still prepared as the prose listed it");
    assert.equal(fireball.school, "Воплощение");
    const wall = s.spells.find((row) => row.name === "Стена огня");
    assert.deepEqual([wall.level, wall.known, wall.prepared, wall.text, wall.id], [4, true, false, "Стена пламени.", spellId("Стена огня")]);
    assert.deepEqual(s.abilities, OTHER);
  } finally { await c.f.db.close(); }
});

test("В1: slot dims on a recorded cast — the server checks the spell, spends the slot, the live stream carries the counter at once, the commit keeps it", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    await withOwnerSheet(c, BY_LEVEL);
    const before = (await c.f.saves(c.cid, "campaign")).entities.find((row) => row.id === c.hero);
    const cast = (resource, spell) => ({ name: "resource", arguments: { actorRef: c.hero, resource, delta: -1, spell, reason: "колдует" } });
    const played = await c.turn("Колдую «Палящий луч» ячейкой 2 круга на волка.", [{ text: "Три луча срываются с пальцев. ", toolCalls: [
      cast("spell_slots_2", "Палящий луч"), cast("spell_slots_1", "Огненный шар"), cast("spell_slots_1", "Огненный снаряд"), cast("spell_slots_3", "Луч холода"), time, finish] }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const receipts = (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts.filter((row) => row.call.name === "resource");
    assert.equal(receipts[0].result.ok, true, receipts[0].result.reason);
    assert.equal(receipts[0].result.value.spell, "Палящий луч");
    assert.match(receipts[0].result.player, /^Палящий луч · Ячейки 2 круга: 3 → 2\/3/);
    assert.match(receipts[1].result.reason, /level 3 spell; a level 1 slot cannot cast it/);
    assert.match(receipts[2].result.reason, /cantrip: it spends no slot/);
    assert.match(receipts[3].result.reason, /no spell "Луч холода"/);
    // The live stream: the accepted call carries the counter; over the records it dims the pip at once.
    const event = c.live.find((row) => row.type === "tool" && row.name === "resource");
    assert.deepEqual(event.counter, { entityId: c.hero, key: "spell_slots_2", value: 2, max: 3 });
    let view = emptyLiveTurn(played.input.operationId);
    for (const row of c.live) view = applyLiveEvent(view, row);
    const live = withLiveCounters(before, view);
    assert.equal(before.resources.spell_slots_2, 3, "the records before the commit");
    assert.equal(live.resources.spell_slots_2, 2);
    const shown = spellTabView(sheetOf(live).spells.length ? sheetOf(live).spells : convertSpellProse(live.character_sheet, "ru").sheet.spells, live.resources, null, "ru");
    assert.deepEqual(shown.prepared.find((group) => group.level === 2).slots, { value: 2, max: 3 }, "one pip of three dim");
    assert.equal(withLiveCounters(before, { ...view, status: "failed" }).resources.spell_slots_2, 3, "a failed turn's changes never show");
    // The commit keeps it; the sheet the screens read shows the same.
    const after = (await c.f.saves(c.cid, "campaign")).entities.find((row) => row.id === c.hero);
    assert.equal(after.resources.spell_slots_2, 2);
    assert.equal(after.resources.spell_slots_1, 4, "refused casts spend nothing");
    // An unprepared spell is refused: the wizard casts only what he prepared today.
    const sheet = convertSpellProse(ownerSheet(BY_LEVEL), "ru").sheet;
    await c.f.db.query("update public.rpg_entities set character_sheet=$2::jsonb where id=$1",
      [c.hero, JSON.stringify(patchSheet(sheet, { spells: [{ ...sheet.spells.find((row) => row.name === "Молния"), prepared: false }] }))]);
    const second = await c.turn("Колдую «Молнию».", [{ text: "Ты тянешься к силе. ", toolCalls: [cast("spell_slots_3", "Молния"), time, finish] }]);
    const refused = (await c.row(second.input.operationId)).checkpoint.dmLoop.receipts.find((row) => row.call.name === "resource");
    assert.match(refused.result.reason, /in .* book but not prepared today/);
  } finally { await c.f.db.close(); }
});

test("В1: pictures requested within the cap — a spell is a picture subject drawn like a thing; the autopilot and the database keep to the daily cap", async () => {
  const sheet = convertSpellProse(ownerSheet(BY_LEVEL), "ru").sheet;
  const cid = randomUUID(), hero = randomUUID();
  const snapshot = { campaign: { id: cid, language: "ru" }, entities: [{ id: hero, campaign_id: cid, kind: "player", name: "Рэй", details: "", character_sheet: sheet, equipment_slots: [], resources: {}, revision: 1 }],
    items: [], locations: [], assets: [], documents: [] };
  const subjects = spellSubjects(snapshot);
  assert.equal(subjects.length, 13);
  assert.equal(subjects[0].description.startsWith("A spell of the school «"), true);
  assert.ok(subjects.slice(0, 4).every((row) => CANTRIPS.includes(row.name)), "cantrips first");
  const plan = anchorSet(snapshot, { items: true, portraits: false, figures: false, places: false, holdings: false });
  assert.deepEqual(plan.map((row) => [row.subject.kind, row.composition]).slice(0, 1), [["spell", "spell"]]);
  assert.equal(anchorSet(snapshot, { items: false, portraits: false, figures: false, places: false, holdings: false }).length, 0, "spells follow «Вещи»");
  const board = (count, cap = 5) => ({ ...emptyPictureBoard(cid), settings: { ...defaultPictureSettings, dailyCap: cap, autopilot: { ...defaultPictureSettings.autopilot, enabled: true } }, today: { count, costUsdMicros: 0 } });
  assert.equal(planAutopilot(snapshot, board(0), 20).length, 5, "never more than the cap allows");
  assert.equal(planAutopilot(snapshot, board(4), 20).length, 1);
  assert.equal(planAutopilot(snapshot, board(5), 20).length, 0, "the cap is spent");
  assert.equal(capRemaining(board(5)), 0);
  assert.ok(parsePicture({ id: randomUUID(), kind: "anchor", subjectKind: "spell", subjectId: subjects[0].id, composition: "spell", timeline: { timelineId: randomUUID(), epoch: 1 },
    version: 1, status: "queued", model: "x", tier: "quality", trigger: "autopilot", createdAt: "2026-10-23" }), "the board reads a spell's picture");

  // The database: a spell some sheet holds, its own composition, under the same cap.
  const f = await fixture();
  try {
    const w = await world(f);
    await f.db.query("update public.rpg_entities set character_sheet=$2::jsonb where id=$1", [w.hero, JSON.stringify(sheet)]);
    const call = (action, payload) => f.one("select public.rpg_pictures($1,$2,$3,$4::jsonb) result", [f.owner, w.cid, action, JSON.stringify(payload)]).then((row) => row.result);
    const fails = (promise, code) => assert.rejects(promise, (error) => error.message.includes(code));
    const read = await call("read", {});
    await call("settings.save", { expectedRevision: 0, frames: "every", quality: "fast", dailyCap: 2, autopilot: read.settings.autopilot });
    const fence = await f.fence(w.cid);
    const picture = (subjectId, composition = "spell") => ({ id: randomUUID(), kind: "anchor", subjectKind: "spell", subjectId, composition, timeline: fence,
      tier: "quality", trigger: "autopilot", model: "fal-ai/flux-2/klein/9b", styleVersionId: null, shot: null, prompt: "A sigil.", referenceIds: [] });
    const shield = sheet.spells.find((row) => row.name === "Щит").id;
    const made = await call("picture.create", picture(shield));
    assert.equal(parsePicture(made)?.subjectKind, "spell");
    await fails(call("picture.create", picture(randomUUID())), "rpg_not_found");
    await fails(call("picture.create", picture(shield, "item")), "rpg_validation");
    await call("picture.create", picture(sheet.spells.find((row) => row.name === "Молния").id));
    await fails(call("picture.create", picture(sheet.spells.find((row) => row.name === "Сообщение").id)), "rpg_conflict");
    assert.equal((await call("read", {})).today.count, 2, "two pictures today, the cap");
    // The sheet's spell takes its new fields; anything else is still refused.
    const valid = async (spell) => (await f.one("select rpg_private.sheet_valid($1::jsonb) v", [JSON.stringify({ ...sheet, spells: [spell] })])).v;
    assert.equal(await valid(sheet.spells[0]), true);
    assert.equal(await valid({ ...sheet.spells[0], id: "not-an-id" }), false);
    assert.equal(await valid({ ...sheet.spells[0], history: Array.from({ length: 13 }, (_, index) => `строка ${index}`) }), false);
    assert.equal(await valid({ ...sheet.spells[0], school: "" }), false);
    assert.equal(await valid({ ...sheet.spells[0], picture: "x" }), false);
  } finally { await f.db.close(); }
  // The screen and the server take the spell subject through the anchor path.
  assert.match(src("src/components/registry/spells-tab.tsx"), /pictures\.send\("pictures\.anchor", \{ subject: \{ kind: "spell", id: spell\.id \}, trigger: "manual" \}\)/);
  assert.match(src("src/lib/server/media/pictures-service.ts"), /subject\.kind === "spell"/);
});
