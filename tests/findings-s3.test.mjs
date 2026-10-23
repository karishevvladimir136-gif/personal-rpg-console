// Findings S3 (docs/stages/FINDINGS_S3.md on claude/handoff): §1 the DM's frame instead of orders, §2 the DM's own notes
// in the first person, §5 companions and the people of the world as participants. Items 3 and 4 have their own files.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { BOOKKEEPER_ROLE, DM_ROLE, FRAME, WRITER_ROLE, dmRoleText, writerRoleText } from "../src/lib/gameplay/dm-loop/roles.ts";
import { FRAME_RU, HEADERS_RU, NUDGES_RU } from "../src/lib/gameplay/dm-loop/roles-ru.ts";
import { CUT_BY_CAP } from "../src/lib/gameplay/dm-loop/loop.ts";
import { WRITER_CUT_BY_CAP } from "../src/lib/gameplay/dm-loop/two-pass/runtime.ts";
import { OWNER_LIKES_HEADER, ownerLikes, localizeHeaders } from "../src/lib/gameplay/dm-loop/context.ts";
import { buildDigestRequest, firstPersonPer100, runDigest, DM_NOTES_VOICE } from "../src/lib/gameplay/dm-loop/digest.ts";
import { buildPrepRequest } from "../src/lib/gameplay/dm-loop/hidden-layer.ts";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { loopCampaign } from "./dm-loop-fixture.mjs";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const roles = { "single DM, English": DM_ROLE, "writer, English": WRITER_ROLE, "single DM, Russian": dmRoleText(true), "writer, Russian": writerRoleText(true) };

test("§1: both roles in both languages open with the frame — who the DM is here, its judgement wanted, it may be wrong, length and voice its call", () => {
  assert.match(FRAME, /played at home by one person — the owner of this table/);
  assert.match(FRAME, /This game asks for your judgement/);
  assert.match(FRAME, /how long a turn runs and in what voice — those are your calls/);
  assert.match(FRAME, /You can be wrong[\s\S]*say so plainly in an aside outside the story/);
  assert.match(FRAME, /The rules below are firm because they keep the game honest[\s\S]*not because your judgement is in doubt/);
  assert.match(FRAME_RU, /играет в неё дома один человек — владелец этого стола/);
  assert.match(FRAME_RU, /Эта игра ждёт твоего суждения/);
  assert.match(FRAME_RU, /сколько длится ход и каким голосом он рассказан — решаешь ты/);
  assert.match(FRAME_RU, /Ты можешь ошибиться[\s\S]*скажи это прямо, заметкой вне истории/);
  for (const [name, text] of Object.entries(roles)) {
    assert.ok(text.startsWith(name.endsWith("Russian") ? FRAME_RU : FRAME), `${name}: the frame opens the role`);
    assert.doesNotMatch(text, /100–250|до 400|up to 400/, `${name}: no word-count cap on a turn`);
    assert.doesNotMatch(text, /are terse|не проза|one short aside|одной короткой заметкой/, `${name}: no «terse», no «one short aside»`);
  }
  assert.match(DM_ROLE, /How long a turn runs is yours to judge from the moment/);
  assert.match(dmRoleText(true), /Сколько длится ход, решай по моменту/);
});

test("§1: the rules stay exact — the hero's will, honest dice, secrets, records, the ledger, the table's rules", () => {
  for (const [name, text] of Object.entries(roles)) {
    const ru = name.endsWith("Russian");
    for (const rule of ru
      ? ["Никогда не пиши за игрока его слов, мыслей и решений.", "Пересказать тайну другими словами — тоже раскрыть её.", "Каждый бросок рассказан", "один обмен репликами, а не весь вечер", "Чистая 20 — успех при любой сумме", "Мир движется только по игровому времени"]
      : ["Never write the player's own words, thoughts or decisions.", "Paraphrasing a secret is still revealing it.", "Every roll is told", "one exchange of a conversation, not the whole evening", "A natural 20 succeeds whatever the total", "The world moves for game time only"])
      assert.ok(text.includes(rule), `${name}: «${rule}» is still there`);
  }
  assert.match(DM_ROLE, /it is never replaced by a private note \(the records must match the story to the coin\)/);
  assert.match(DM_ROLE, /Never call it before the text exists\./);
  assert.match(WRITER_ROLE, /The ledger is private: the player never sees it, and it is the only place for secrets and plans\. Keep it under about forty lines\./);
  assert.match(BOOKKEEPER_ROLE, /You never write narration, never change what happened and never add events\./);
  assert.match(BOOKKEEPER_ROLE, /that is your whole part in the turn, and the world holds together because of it/);
  assert.doesNotMatch(BOOKKEEPER_ROLE, /and nothing else\./);
});

test("§1: the cut-off messages give the reason instead of «keep your thinking short»", () => {
  for (const text of [CUT_BY_CAP, WRITER_CUT_BY_CAP]) {
    assert.doesNotMatch(text, /Keep your thinking short|finish the narration briefly/);
    assert.match(text, /Pick up exactly where it stopped/);
    assert.match(text, /The limit is still close: spend little of it on thinking\./);
  }
  for (const text of [NUDGES_RU.CUT_BY_CAP, NUDGES_RU.WRITER_CUT_BY_CAP]) {
    assert.doesNotMatch(text, /Думай коротко|коротко закончи рассказ/);
    assert.match(text, /Предел всё ещё близко: на размышления трать его немного\./);
  }
  assert.match(CUT_BY_CAP, /finish_turn/);
  assert.match(WRITER_CUT_BY_CAP, /close with the ledger/);
});

test("§1 step 4: «Что мне нравится в играх» and «Пожелания к приключению» reach the DM as a person's wishes", () => {
  const source = { snapshot: { campaign: { player_likes: "Люблю тайны и честные кости.", theme: "" } } };
  const line = ownerLikes(source);
  assert.ok(line.startsWith(OWNER_LIKES_HEADER));
  assert.match(OWNER_LIKES_HEADER, /A person telling you what they like, not a specification/);
  assert.match(OWNER_LIKES_HEADER, /never rewrite it/);
  assert.doesNotMatch(line, /always honour/);
  assert.match(localizeHeaders(line), /^Что любит в играх владелец — человек, с которым ты играешь[\s\S]*а не техническое задание[\s\S]*никогда их не переписывай: Люблю тайны/);
  assert.ok(HEADERS_RU[OWNER_LIKES_HEADER]);
  assert.match(src("src/lib/gameplay/dm-loop/hidden-layer.ts"), /A person's wishes for the story you will tell together, not a specification and not an established fact/);
});

test("§5: companions and the people of the world are participants — both roles, both languages, and the party council", () => {
  for (const [name, text] of Object.entries(roles)) {
    if (name.endsWith("Russian")) {
      assert.match(text, /Спутники и люди мира — участники, а не инструменты/, name);
      assert.match(text, /могут не соглашаться с героем и говорить это вслух, хотеть своего или отказаться; они здесь не для того, чтобы обслуживать сюжет/, name);
    } else {
      assert.match(text, /Companions and the people of the world are participants, not instruments/, name);
      assert.match(text, /they may disagree with the hero and say so, want what the hero does not, or decline; they are not there to serve the plot/, name);
    }
  }
  const context = src("src/lib/gameplay/dm-loop/context.ts");
  assert.match(context, /по его собственному суждению — он может не согласиться с героем/);
  assert.match(context, /by their own judgement — they may disagree with the hero/);
});

test("§2: the first-person measure — a DM's own note counts, a third-person summary does not", () => {
  assert.ok(firstPersonPer100("Я планировал засаду у брода, но игрок пошёл через лес — мне это понравилось; я решил оставить писаря живым.") >= 10);
  assert.ok(firstPersonPer100("I planned the ambush at the ford; I noticed the player skipped it, so I left the clerk alive.") >= 10);
  assert.equal(firstPersonPer100("Герой прошёл через лес. Засада у брода не сработала. Писарь остался жив."), 0);
  assert.equal(firstPersonPer100("The hero went through the forest. Imagery and mine shafts; the meadow."), 0, "«mine» the noun, «Imagery» and «meadow» are not first-person forms");
  assert.equal(firstPersonPer100(""), 0);
});

test("§2: the digest and the prep ask for the DM's own first-person notes with the same budgets; a scripted digest keeps them; «Ранее в…» unchanged", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const source = (await c.f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) result", [c.owner, c.cid])).result;
    const session = { id: randomUUID(), title: "Вечер", scenes: [{ role: "player", body: "Иду к броду." }, { role: "narration", body: "У брода тихо." }],
      startWorldMinutes: null, endWorldMinutes: source.runtime.worldMinutes, shape: { turns: 1, playMinutes: 5, form: "short" } };
    const request = buildDigestRequest(source, session, "high");
    const text = request.messages[0].text;
    assert.ok(text.includes(DM_NOTES_VOICE));
    assert.match(text, /"notebook": "your own notebook for the next session, in the campaign language and in the first person — notes to yourself, not a report — up to 1500 characters: what I planned/);
    assert.match(text, /one or two exact lines from this session, quoted, that carried its feeling/);
    assert.match(text, /written under them as your own first-person notes, up to 23000 characters/);
    assert.match(text, /"recap": "«Previously in…» in your own voice, in the campaign language, for the player: three or four sentences looking forward/, "the player's «Ранее в…» stays");
    assert.doesNotMatch(text, /homework/);
    const prep = buildPrepRequest(source, "high").messages[0].text;
    assert.match(prep, /written in the first person, as your own notes \(what I know is really going on/);
    assert.match(buildPrepRequest(source, "high", true).messages[0].text, /Write the whole layer again\./, "the rebuild still swaps the opening line");

    // A scripted model answers in the requested shape: the DM part reaches the dossier in the first person.
    const notebook = "Я планировал, что они пойдут к броду, и они пошли — мне понравилось, как игрок проверил воду шестом. Я решил: писарь знает про «К.» больше, чем сказал. Оставил открытым: чей воск на записке. «Тут не утонешь, тут засосёт» — эта строчка Брама держала вечер.";
    const reply = JSON.stringify({ recap: "Отряд у брода. Писарь молчит. Дальше — склады.", title: "Брод", notebook, plans: [], lines: ["Пришли к броду."], threads: [], stinger: "", channel: "" });
    const model = createScriptedDmModel([{ text: reply, toolCalls: [] }]);
    const result = await runDigest(model, request, source, source.runtime.worldMinutes);
    assert.equal(result.digest.notebook, notebook);
    assert.ok(firstPersonPer100(result.digest.notebook) >= 5, "the digest's DM part is written in the first person");
    assert.equal(firstPersonPer100(result.digest.recap), 0, "the player's recap is not the DM's notebook");
    assert.match(src("src/lib/server/session-digest.ts"), /notebookFirstPer100: firstPersonPer100\(result\.digest\.notebook\)/);
  } finally { await c.f.db.close(); }
});

test("§1 measure: the register markers on a Russian turn — speech, address to the hero, speakers by the nominative, asides", async () => {
  const { turnMarkers, speechOf } = await import("../scripts/eval/findings-s3/lib/markers.mjs");
  const narration = [
    "Ты ломаешь воск и читаешь вслух.",
    "Брам подходит и смотрит через твоё плечо.",
    "— Писаря на таможне два. — Он кивает на маяк. — Тебе решать, Рэй.",
    "Тоби сглатывает.",
    "— А «третья ночь» — это от чего считать? — он осекается и смотрит на Брама. — Вы как думаете?",
    "*(Вне игры: возможно, я неверно прочёл, кого ты имел в виду; поправь меня.)*",
  ].join("\n\n");
  const pieces = speechOf(narration);
  assert.equal(pieces.length, 4, "two pieces a line; the «…» inside a line never splits it; the aside is not speech");
  const markers = turnMarkers(narration, ["Брам", "Тоби", "Сторож Ефим"]);
  assert.deepEqual(markers.speakerNames.sort(), ["Брам", "Тоби"], "«смотрит на Брама» is not Брам speaking; the sentence before names the speaker");
  assert.equal(markers.address, 2, "«Тебе», «Вы» in speech; the narrator's «Ты»/«твоё» and the aside's «ты» do not count");
  assert.equal(markers.hedges, 1);
  assert.ok(markers.asideWords > 5);
});

test("§7: the dose of the DM's own notes — the hidden layer holds 24 000 characters (the SQL follows for that one note); the ledger stays", async () => {
  const { HIDDEN_LAYER_MAX_CHARS } = await import("../src/lib/gameplay/dm-loop/hidden-layer.ts");
  const { LEDGER_MAX_CHARS } = await import("../src/lib/gameplay/dm-loop/two-pass/prompts.ts");
  const { parseDigest } = await import("../src/lib/gameplay/dm-loop/digest.ts");
  assert.equal(HIDDEN_LAYER_MAX_CHARS, 24_000);
  assert.equal(LEDGER_MAX_CHARS, 6000, "the writer's ledger keeps its budget");
  const c = await loopCampaign({ language: "ru" });
  try {
    const play = await (await c.deps(createScriptedDmModel([]))).store.readPlay(c.cid);
    const big = `Тайный слой кампании: ${"Я помню, как писарь отвёл глаза. ".repeat(700)}`.slice(0, 23_500);
    await c.dossier("private_notes", { set: [{ kind: "fact", key: "hidden_layer", value: big }], remove: [] }, play.timeline);
    await assert.rejects(c.dossier("private_notes", { set: [{ kind: "fact", key: "hidden_layer", value: "я".repeat(24_001) }], remove: [] }, play.timeline), /rpg_validation/);
    await assert.rejects(c.dossier("private_notes", { set: [{ kind: "fact", key: "other_note", value: "я".repeat(6001) }], remove: [] }, play.timeline), /rpg_validation/,
      "every other note keeps 6 000");
    const source = (await c.f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) result", [c.owner, c.cid])).result;
    assert.equal(source.privateState.fact.hidden_layer.length, big.length);
    const session = { id: randomUUID(), title: "Вечер", scenes: [{ role: "narration", body: "Тихо." }], startWorldMinutes: null, endWorldMinutes: source.runtime.worldMinutes, shape: { turns: 1, playMinutes: 5, form: "short" } };
    const text = buildDigestRequest(source, session, "high").messages[0].text;
    assert.match(text, /written under them as your own first-person notes, up to 23000 characters — where the room allows, keep more of the exact lines that carried a scene and more of your own reasoning/);
    const reply = (layer) => JSON.stringify({ recap: "r", title: "t", notebook: "", plans: [], hiddenLayer: layer });
    assert.equal(parseDigest(reply("я".repeat(30_000)), source, 0).hiddenLayer.length, HIDDEN_LAYER_MAX_CHARS - 200);
    assert.equal(parseDigest(reply(big), source, 0).hiddenLayer, big.trim(), "a 23 500-character layer passes whole");
  } finally { await c.f.db.close(); }
});
