// Polish stage, group 10 (docs/stages/POLISH.md «Wizard and the path to the first turn»):
// any sheet creates and a grey button says why, a single item counts as one, the hero's
// name is offered capitalised, the wizard's start travels into the first adventure, the
// opening scene sets the clock (item 18), and «Ещё» is split into the player's actions and
// the owner's campaign editor.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { capitalizedName, creationBlockedReason, parseWizardStart, startMinutesFromText, wizardAdventureSetup } from "../src/lib/adventures/wizard-text.ts";
import { initialCreationReview, parseBootstrapCommand } from "../src/lib/adventures/bootstrap-validation.ts";
import { wizardCreationReview } from "../src/lib/adventures/wizard-text.ts";
import { examples, setup } from "./universal-bootstrap-fixture.mjs";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("the hero's name is offered as a name; the opening's words set the clock", () => {
  assert.equal(capitalizedName("рэй"), "Рэй");
  assert.equal(capitalizedName("рэй кривой"), "Рэй Кривой");
  assert.equal(capitalizedName("иван из пскова"), "Иван из Пскова");
  assert.equal(capitalizedName("анна-мария"), "Анна-Мария");
  assert.equal(capitalizedName("РЭЙ"), "РЭЙ", "never forced: an all-capitals name stays");
  assert.equal(startMinutesFromText("Утро. Понтоны скрипят, Марта ещё не пришла."), 8 * 60);
  assert.equal(startMinutesFromText("Вечером в кабаке Марты душно."), 19 * 60);
  assert.equal(startMinutesFromText("Ты приходишь к семи вечера."), 19 * 60);
  assert.equal(startMinutesFromText("В 17:30 у причала пусто."), 17 * 60 + 30);
  assert.equal(startMinutesFromText("Он пришёл в шесть утра."), 6 * 60);
  assert.equal(startMinutesFromText("Полдень, солнце в зените."), 12 * 60);
  assert.equal(startMinutesFromText("Ночь, волны бьют в сваи."), 23 * 60);
  assert.equal(startMinutesFromText("At dawn the harbour wakes."), 6 * 60);
  assert.equal(startMinutesFromText("A notice board offers paid work."), null, "no time word, no guess");
});

test("a single item counts as one; the commit may carry the start time; the grey button explains itself", () => {
  const proposal = { schemaVersion: 1, capabilities: [], limitations: [], questions: [], resources: [],
    possessions: [{ name: "нож", description: "", quantity: null, quote: "нож" }, { name: "патроны", description: "", quantity: 12, quote: "12 патронов" }] };
  const input = { name: "рэй", description: "нож и 12 патронов" };
  assert.deepEqual(wizardCreationReview(input, proposal).possessions.map((row) => row.quantity), [1, 12]);
  assert.deepEqual(initialCreationReview(input, proposal).possessions.map((row) => row.quantity), [null, 12], "the policy baseline still needs an explicit number");
  assert.match(src("src/components/bootstrap/use-bootstrap.ts"), /wizardCreationReview\(next\.input, next\.proposal\)/);
  const base = { requestId: randomUUID(), campaignId: randomUUID(), draftId: randomUUID(),
    review: { location: { name: "Причал", description: "Доски." }, situation: "Утро.", narration: "Утро на причале.", actors: [], answers: [], publicOpeningConfirmed: true } };
  assert.equal(parseBootstrapCommand({ action: "opening.commit", input: { ...base, startMinutes: 480 } }).input.startMinutes, 480);
  assert.equal(parseBootstrapCommand({ action: "opening.commit", input: { ...base, startMinutes: null } }).input.startMinutes, null);
  assert.equal("startMinutes" in parseBootstrapCommand({ action: "opening.commit", input: base }).input, false, "older clients send none");
  assert.throws(() => parseBootstrapCommand({ action: "opening.commit", input: { ...base, startMinutes: 1500 } }));
  const questions = [{ question: "Сколько стрел?", consequential: true }];
  const ok = { possessions: [{ name: "нож", quantity: 1 }], resources: [], answers: ["десять"], sheet: { mode: "narrative" } };
  assert.match(creationBlockedReason({ ...ok, possessions: [{ name: "нож", quantity: null }] }, questions, "ru"), /Укажи количество: нож/);
  assert.match(creationBlockedReason({ ...ok, answers: [null] }, questions, "ru"), /Ответь на вопрос ведущего: Сколько стрел\?/);
  assert.match(creationBlockedReason({ ...ok, sheet: { mode: "structured_rpg" } }, questions, "ru"), /Утверди боевой профиль|повествовательный лист/);
  assert.match(creationBlockedReason({ ...ok, possessions: [{ name: " ", quantity: 1 }] }, questions, "en"), /Name the unnamed item/);
});

test("the wizard's start becomes the first adventure's draft", () => {
  assert.equal(parseWizardStart(null), null);
  assert.equal(parseWizardStart("{\"choice\":\"x\"}"), null);
  const mine = parseWizardStart(JSON.stringify({ choice: "mine", phrase: "Утро на причале; я должен Марте сорок монет." }));
  assert.equal(wizardAdventureSetup(mine, "ru").premise, "Утро на причале; я должен Марте сорок монет.");
  assert.equal(wizardAdventureSetup(mine, "ru").title, "Первое приключение");
  const dm = wizardAdventureSetup({ choice: "dm", phrase: "" }, "ru");
  assert.match(dm.premise, /Ведущий выбирает начало сам/);
  assert.equal(dm.pacing.kind, "evening");
  // Fix run F (item 21): the wizard no longer hands a start phrase to the adventures screen — the adventure is
  // written in the wizard's own «Приключение» step (an empty text leaves the start to the DM) and the opening follows.
  const library = src("src/components/bootstrap/wizard.tsx");
  assert.match(library, /prepareAdventureAttempt\(current, \{ \.\.\.setup \}\)/, "the wizard prepares the first adventure itself");
  assert.match(library, /wizardAdventureSetup\(\{ choice: "dm", phrase: "" \}, language\)\.premise/, "an empty text leaves the start to the DM");
  const panel = src("src/components/adventures/adventures-panel.tsx");
  assert.match(panel, /parseWizardStart\(sessionStorage\.getItem\(wizardStartKey\(campaignId\)\)\)/, "the adventures screen reads it");
  assert.match(panel, /initial: wizardAdventureSetup\(handoff, language\)/, "the form opens prefilled");
  assert.match(panel, /if \(command\.action === "start"\) setOpeningStart\(command\)/, "a prepared first adventure goes straight to the opening");
  assert.doesNotMatch(panel, /\{c\.newCampaign\}/, "the stray «Новая Кампания» link is gone");
  assert.match(panel, /\{!draft && !openingStart && !nextToStart && \(/, "one next step at a time");
  const wizard = src("src/components/bootstrap/new-campaign.tsx");
  assert.doesNotMatch(wizard, /astraFirstCreationReviewReady|ведущим Astra/, "no Astra rule in the wizard");
  assert.match(wizard, /\{!canCreate && blocked && \(/, "a grey create button says why");
  assert.match(wizard, /Писать как имя: \$\{properName\}/);
  const review = src("src/components/bootstrap/review.tsx");
  assert.match(review, /"Хиты" : field === "attack" \? "Атака \(модификатор\)" : field === "defense" \? "Защита" : "Навык \(модификатор\)"/, "the combat profile speaks Russian");
  assert.match(review, /Время начала сцены/);
});

test("the opening commit sets the campaign clock once; a replay and a later commit leave it alone", async () => {
  const f = await setup(examples.fantasy, "en", Infinity);
  try {
    await f.create();
    await f.proposeOpening();
    f.openingCommit.input.startMinutes = 8 * 60;
    const started = await f.service.perform(f.openingCommit);
    assert.equal(started.requestId, f.openingCommit.input.requestId);
    const minutes = async () => (await f.one("select world_minutes from rpg_private.runtime_state where campaign_id=$1", [f.cid])).world_minutes;
    assert.equal(await minutes(), 480, "the first turn starts in the morning, not at 00:00");
    const adventure = started.snapshot.adventures.find((row) => row.status === "active");
    assert.equal(adventure.start.worldMinutes, 480, "the adventure's start carries the same clock");
    const replay = await f.service.perform(f.openingCommit);
    assert.equal(replay.requestId, started.requestId);
    assert.equal(await minutes(), 480, "a replay changes nothing");
    const event = await f.one("select event from rpg_private.world_events where campaign_id=$1 and event->>'kind'='campaign.bootstrap.opening_review'", [f.cid]);
    assert.equal("startMinutes" in event.event.payload.review, false, "the review record is exactly the older contract");
    await assert.rejects(f.rpc("opening.commit", f.cid, { ...f.openingCommit.input, requestId: randomUUID(), startMinutes: 1500 }), /rpg_validation|rpg_conflict/);
  } finally { await f.db.close(); }
});

test("the game screen: the player's actions in one row with one line each; the editor is a separate owner block", () => {
  const screen = src("src/components/registry/game-screen.tsx");
  assert.match(screen, /<section className=\{g\.playerActions\} aria-label=\{c\("Действия игрока", "Player actions"\)\}>/);
  assert.match(screen, /<SessionEnd sessionId=\{session\?\.id \?\? null\} compact \/>/);
  assert.match(screen, /c\("Редактор кампании · для владельца", "Campaign editor · for the owner"\)/);
  assert.doesNotMatch(screen, /Ещё · бой, отдых, сессия, записи и правки/);
  const editor = screen.slice(screen.indexOf("Редактор кампании · для владельца"));
  for (const line of ["Боевая готовность:", "Сессия как запись:", "Правка записей:", "Стенограмма:", "Ручное управление столкновением:"])
    assert.ok(editor.includes(line), `the editor explains «${line}»`);
  const actions = screen.slice(screen.indexOf("g.playerActions"), screen.indexOf("Редактор кампании"));
  assert.doesNotMatch(actions, /setResume|setSceneEditor|GameplayCombat|CombatReadiness/, "no editing tool among the player's actions");
});
