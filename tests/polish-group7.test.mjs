// Polish stage, group 7 (docs/stages/POLISH.md «In scope from group 7», items 5, 7, 8, 23):
// the mechanics for the Russian voice — the speech profile in the Character Model and
// the tic counter, the voice slot and reminder (off), «Образцы голоса» (private, off),
// the larger context budgets with the last turns verbatim, the finish_turn nudge, the
// naturalness metrics on the bench, and the opening written by the campaign's DM.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { CHARACTER_MODEL_BOUNDS, parseCharacterModel, parseSpeechProfile } from "../src/lib/gameplay/character-model.ts";
import { DOSSIER_BUDGETS, recentSignatureUses } from "../src/lib/gameplay/dm-loop/context.ts";
import { voiceExamplesBlock, voiceLayer, voiceReminder } from "../src/lib/gameplay/dm-loop/voice.ts";
import { parseDmSettings, parseDmSettingsSave } from "../src/lib/gameplay/dm-loop/settings.ts";
import { answersEveryPoint, kancelyaritPerThousand, latinShare, naturalness, repeatedPhrases, sentenceLengthVariation } from "../scripts/eval/lib/naturalness.mjs";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const finish = (extra = {}) => ({ name: "finish_turn", arguments: { sceneKinds: ["conversation"], spotlight: [], playerMoment: false, ...extra } });
const model = (actorId, over = {}) => ({ schemaVersion: 1, actorId, basisOperationId: null,
  identity: { values: ["своё слово"], wants: ["тишины"], boundaries: ["не врёт детям"], loyalties: [], signatures: ["сплёвывает за борт"], observableVoice: "Коротко, по делу." },
  current: { goal: null, stress: "settled", preoccupation: null, obligation: null }, beliefs: [], relationships: [], episodes: [], ...over });

test("the speech profile: parsed with the model (absent, null or set), bounded, never addressed to oneself", () => {
  const actorId = randomUUID(), other = randomUUID();
  assert.equal(parseCharacterModel(model(actorId)).speech, undefined, "a model stored before the polish stage parses as before");
  assert.equal(parseCharacterModel(model(actorId, { speech: null })).speech, null);
  const speech = { register: "Грубо, с морскими словечками.", sentenceLength: "short", tics: [{ phrase: "сплёвывает за борт", frequency: "sometimes" }], neverSays: ["афоризмы"], address: [{ actorId: other, form: "ты" }] };
  assert.deepEqual(parseCharacterModel(model(actorId, { speech })).speech, speech);
  assert.deepEqual(parseSpeechProfile(speech), speech);
  assert.throws(() => parseSpeechProfile({ ...speech, tics: [{ phrase: "x", frequency: "always" }] }));
  assert.throws(() => parseCharacterModel(model(actorId, { speech: { ...speech, address: [{ actorId, form: "вы" }] } })), "no ты/вы towards oneself");
  assert.equal(CHARACTER_MODEL_BOUNDS.chars, 64_000, "item 8: the stored cap doubles");
  assert.equal(CHARACTER_MODEL_BOUNDS.bytes, 160_000);
});

test("the tic counter: recent narrations are counted per phrase, declined forms included", () => {
  const scenes = [{ role: "narration", body: "Дуня сплёвывает за борт и молчит." }, { role: "player", body: "сплёвывает за борт" },
    { role: "narration", body: "Она опять сплюнула за борт. «Разумеется», — говорит чужак." }, { role: "narration", body: "Разумеется, он платит." }];
  const m = model(randomUUID(), { speech: { register: "x", sentenceLength: "short", tics: [{ phrase: "Разумеется", frequency: "rare" }], neverSays: [], address: [] } });
  const uses = recentSignatureUses(scenes, m);
  assert.equal(uses["Разумеется"], 2);
  assert.equal(uses["сплёвывает за борт"], 1, "the player's line does not count; a different verb stem («сплюнула») is not the same phrase");
  assert.equal(recentSignatureUses([{ role: "narration", body: "Дуня сплёвывала за борт весь вечер." }], m)["сплёвывает за борт"], 1, "a declined form of the same stem counts");
});

test("note_character records the speech profile (names resolve to IDs), keeps it when omitted, and the tail shows it with the recent uses", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const first = await c.turn("Подхожу к Дуне.", [{ text: "Дуня сплёвывает за борт. — Чего тебе? ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "dunya", name: "Дуня", kind: "npc", present: true, important: true } },
      { name: "note_character", arguments: { actorRef: "dunya", identity: { values: ["своя лодка"], wants: ["уйти в море"], boundaries: [], loyalties: [], signatures: ["сплёвывает за борт"], observableVoice: "Коротко." },
        current: { goal: "продать улов", stress: "settled" },
        speech: { register: "Грубо, по-рыбацки.", sentenceLength: "short", tics: [{ phrase: "сплёвывает за борт", frequency: "sometimes" }], neverSays: ["афоризмы", "«разумеется»"], address: [{ actorRef: c.hero, form: "ты" }] } } },
      finish()] }]);
    assert.equal(first.result.status, "committed", JSON.stringify(c.errors));
    const stored = JSON.parse((await c.f.one("select contents from rpg_private.dm_state where campaign_id=$1", [c.cid])).contents.npc[`character_${(await c.f.one("select id from public.rpg_entities where campaign_id=$1 and name='Дуня'", [c.cid])).id}`]);
    assert.equal(stored.speech.register, "Грубо, по-рыбацки.");
    assert.deepEqual(stored.speech.address, [{ actorId: c.hero, form: "ты" }]);
    const second = await c.turn("Спрашиваю Дуню о лодке.", [{ text: "Дуня сплёвывает за борт ещё раз. — Лодка не продаётся. ", toolCalls: [
      { name: "note_character", arguments: { actorRef: "Дуня", current: { stress: "strained" } } }, finish()] }]);
    assert.equal(second.result.status, "committed", JSON.stringify(c.errors));
    const kept = JSON.parse((await c.f.one("select contents from rpg_private.dm_state where campaign_id=$1", [c.cid])).contents.npc[`character_${(await c.f.one("select id from public.rpg_entities where campaign_id=$1 and name='Дуня'", [c.cid])).id}`]);
    assert.equal(kept.speech.register, "Грубо, по-рыбацки.", "an update without speech keeps the profile");
    assert.equal(kept.current.stress, "strained");
    const third = await c.turn("Молчу.", [{ text: "Тихо. ", toolCalls: [finish()] }]);
    const tail = third.model.requests[0].system[3].text;
    assert.match(tail, /"speech":\{"register":"Грубо, по-рыбацки\."/);
    assert.match(tail, /"address":\[\{"to":"[^"]+","form":"ты"\}\]/);
    assert.match(tail, /sounded in the last scenes: «сплёвывает за борт» ×2/);
    assert.match(first.model.requests[0].system[0].text, /every line of a person comes from their speech profile/);
  } finally { await c.f.db.close(); }
});

test("the budgets of item 8 and the last turns verbatim", () => {
  assert.equal(DOSSIER_BUDGETS.layer2.canon, 40000);
  assert.equal(DOSSIER_BUDGETS.layer3.codex, 30000);
  assert.equal(DOSSIER_BUDGETS.layer4.scenes, 30000);
  assert.equal(DOSSIER_BUDGETS.layer4.exchanges, 15000);
  assert.match(src("src/lib/gameplay/dm-loop/context.ts"), /for \(const exchange of \[\.\.\.exchangesAll\]\.reverse\(\)\)/, "the budget drops the oldest exchanges, never the newest");
});

test("the voice slot and the reminder are empty (off); the samples are quoted only when the switch is on", () => {
  assert.equal(voiceLayer("Russian", "Отрывок.", false), "");
  assert.equal(voiceLayer("English", "Отрывок.", true), "Образцы голоса (отрывки прозы, которую любит игрок; учись у их интонации и ритма, не копируй сюжет и имена):\n<example>\nОтрывок.\n</example>");
  assert.equal(voiceReminder("Russian"), "");
  assert.match(voiceExamplesBlock("Первый.\n\nВторой.\n\nТретий.", true), /<example>\nПервый\.\n<\/example>\n<example>\nВторой\./);
  assert.equal(voiceExamplesBlock("", true), "");
});

test("«Образцы голоса»: stored privately per campaign with an account default, reaching the turn's source only through the switch", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const call = async (action, payload) => (await c.f.one("select public.rpg_dossier($1,$2,$3,$4::jsonb,null) result", [c.owner, c.cid, action, JSON.stringify(payload)])).result;
    assert.deepEqual(await call("voice_read", {}), { campaignId: c.cid, campaign: "", account: "" });
    await call("voice_save", { requestId: randomUUID(), scope: "account", samples: "Общий отрывок для всех кампаний." });
    const view = await call("voice_save", { requestId: randomUUID(), scope: "campaign", samples: "Отрывок этой кампании." });
    assert.equal(view.campaign, "Отрывок этой кампании.");
    assert.equal(view.account, "Общий отрывок для всех кампаний.");
    const source = (await c.f.one("select rpg_private.runtime_source($1,$2,'game') s", [c.cid, c.owner])).s;
    assert.equal(source.voiceSamples, "Отрывок этой кампании.", "the campaign's own samples win");
    assert.equal(source.voiceExamplesOn, false, "off by default");
    await call("voice_save", { requestId: randomUUID(), scope: "campaign", samples: "" });
    assert.equal((await c.f.one("select rpg_private.runtime_source($1,$2,'game') s", [c.cid, c.owner])).s.voiceSamples, "Общий отрывок для всех кампаний.", "the account default when the campaign has none");
    const off = await c.turn("Смотрю на воду.", [{ text: "Вода. ", toolCalls: [finish()] }]);
    assert.doesNotMatch(off.model.requests[0].system[0].text, /Образцы голоса/, "nothing reaches the DM while the switch is off");
    const settings = await c.settings.read();
    assert.equal(settings.voiceExamples, false);
    const saved = await c.settings.save({ expectedRevision: settings.revision, runtime: settings.runtime, dmTurn: settings.dmTurn, voiceExamples: true });
    assert.equal(saved.voiceExamples, true);
    const on = await c.turn("Слушаю прибой.", [{ text: "Прибой. ", toolCalls: [finish()] }]);
    assert.match(on.model.requests[0].system[0].text, /Образцы голоса[\s\S]*<example>\nОбщий отрывок для всех кампаний\.\n<\/example>/, "the switch lets the voice layer quote them");
    const snapshot = await c.f.saves(c.cid, "campaign");
    assert.doesNotMatch(JSON.stringify(snapshot), /отрывок/i, "the samples never reach the public snapshot");
  } finally { await c.f.db.close(); }
});

test("DM settings carry the voice switch", () => {
  const base = { campaignId: "c", runtime: "dm-loop-v1", dmTurn: null, limits: null, depth: null, notebookVisible: false, boostNext: false, revision: 2 };
  assert.equal(parseDmSettings({ ...base, voiceExamples: true }).voiceExamples, true);
  assert.equal(parseDmSettings(base).voiceExamples, false);
  assert.equal(parseDmSettingsSave({ expectedRevision: 2, runtime: "dm-loop-v1", dmTurn: null, voiceExamples: true }).voiceExamples, true);
  assert.throws(() => parseDmSettingsSave({ expectedRevision: 2, runtime: "dm-loop-v1", dmTurn: null, voiceExamples: "yes" }));
});

test("a model that stops after narration without finish_turn is asked once for the closing bookkeeping (item 5)", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const played = await c.turn("Иду вдоль причала.", [
      { text: "Причал скрипит под ногами; у дальнего понтона кто-то чинит сеть.", toolCalls: [] },
      { text: "", toolCalls: [{ name: "advance_time", arguments: { minutes: 10, reason: "прогулка" } }, finish({ sceneKinds: ["exploration"], nextTension: "calm" })] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const row = await c.row(played.input.operationId);
    assert.ok(row.checkpoint.dmLoop.diagnostics.some((d) => d.kind === "finish_asked"), JSON.stringify(row.checkpoint.dmLoop.diagnostics));
    assert.deepEqual(row.checkpoint.dmLoop.meta.sceneKinds, ["exploration"]);
    assert.equal(row.checkpoint.dmLoop.meta.nextTension, "calm");
    assert.match(row.checkpoint.dmLoop.transcript.find((m) => m.role === "user" && /not closed/.test(m.text ?? "")).text, /finish_turn/);
  } finally { await c.f.db.close(); }
});

test("the naturalness metrics: Latin letters, канцелярит, sentence-length variation, repeated phrases, answers every point", () => {
  assert.equal(latinShare("Только кириллица здесь."), 0);
  assert.ok(Math.abs(latinShare("HP упало до нуля") - 2 / 13) < 1e-9, "two Latin letters of thirteen");
  assert.ok(kancelyaritPerThousand("Данный ящик является важным и представляет собой ценность.") > 100);
  assert.equal(kancelyaritPerThousand("Ящик тёплый. Держи от себя."), 0);
  assert.ok(sentenceLengthVariation("Коротко. А вот это предложение заметно длиннее и тянется дальше, чем нужно.") > 0.5);
  assert.equal(sentenceLengthVariation("Одно."), null);
  const repeated = repeatedPhrases(["Дуня сплёвывает за борт и молчит.", "Снова Дуня сплёвывает за борт.", "Дуня сплёвывает за борт, глядя на воду."]);
  assert.ok(repeated.some((row) => row.phrase === "дуня сплёвывает за" && row.turns === 3));
  assert.equal(answersEveryPoint([{ input: "Сколько стоит? Когда отплываем? Кто ещё идёт?", narration: "— Двадцать монет.\n— На рассвете.\n— Мокей и я." }]), 1);
  assert.equal(answersEveryPoint([{ input: "Сколько стоит? Когда отплываем?", narration: "— Не твоё дело, — говорит она и отворачивается." }]), 0, "people answer what matters to them: a reply that skips is counted as such");
  assert.equal(answersEveryPoint([{ input: "Иду.", narration: "Идёшь." }]), null);
  const report = naturalness(["Данный текст является примером."], []);
  assert.equal(report.words, 4);
  assert.ok(report.kancelyaritPerThousand > 0);
});

test("the opening proposal is written by the campaign's own DM when that DM is an OpenAI model", () => {
  const bootstrap = src("src/lib/server/adventure-bootstrap.ts");
  assert.match(bootstrap, /command\.action === "opening\.propose"[\s\S]*readDmSettings\(cid\)/);
  assert.match(bootstrap, /globalDefault: dmTurn\?\.providerId === "openai" \? dmTurn : applicationModelSelection\(process\.env\)/);
});
