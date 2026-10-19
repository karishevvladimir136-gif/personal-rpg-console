// The voice stage (docs/stages/VOICE.md «The build»): the Russian voice layer and the reminder
// (part 1), «want before the line» in the turn shape (part 2), the passage format and the examples
// mode (part 3), the owner's fix of the snapshot list. Every passage in this file is a SYNTHETIC
// placeholder written for the test — never the owner's bank, never another author's text.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { buildDmLoopContext, estimateTokens } from "../src/lib/gameplay/dm-loop/context.ts";
import { VOICE_LAYER_RU, VOICE_REMINDER_RU, VOICE_EXAMPLES_HEAD, VOICE_TOKEN_CAP_DEFAULT, parseVoicePassages, pickFivePassages, voiceExamplesBlock, voiceLayer, voiceReminder } from "../src/lib/gameplay/dm-loop/voice.ts";
import { dmTurnShape, writerTurnShape, WANT_BEFORE_THE_LINE_EN, WANT_BEFORE_THE_LINE_RU } from "../src/lib/gameplay/dm-loop/roles.ts";
import { writerSystem } from "../src/lib/gameplay/dm-loop/two-pass/index.ts";
import { parseDmSettings } from "../src/lib/gameplay/dm-loop/settings.ts";
import { listTurnSnapshotsWith, readTurnSnapshotWith } from "../src/lib/gameplay/turn-snapshot.ts";
import { checkQuotableLines, npcLines, parseQuotableFlags, quotableLine, quotableRequest, QUOTABLE_MODEL } from "../src/lib/gameplay/dm-loop/quotable.ts";
import { readFileSync } from "node:fs";

const finish = (kind = "quiet") => ({ name: "finish_turn", arguments: { sceneKinds: [kind], spotlight: [], playerMoment: false, nextTension: "calm" } });
const time = (minutes = 5) => ({ name: "advance_time", arguments: { minutes, reason: "время" } });

test("§1 the voice layer is native Russian prose of about 400–600 tokens, the reminder at most 120, and both say what the research asks", () => {
  const tokens = estimateTokens(VOICE_LAYER_RU);
  assert.ok(tokens >= 400 && tokens <= 650, `layer ${tokens} tokens`);
  assert.ok(estimateTokens(VOICE_REMINDER_RU) <= 120, "the reminder is short");
  // Prose, not a list, not a translation: no bullet lines, no Latin words, paragraphs of sentences.
  assert.doesNotMatch(VOICE_LAYER_RU, /^\s*[-*•\d]+[.)]?\s/m, "not a list");
  assert.doesNotMatch(VOICE_LAYER_RU, /[A-Za-z]/, "no Latin letters");
  assert.ok(VOICE_LAYER_RU.split(/\n\s*\n/).length >= 4, "several paragraphs");
  // What it carries: the want, speaking is not answering, the particles, game information in narration,
  // metaphors with the narrator, the owner's test, the tic once a scene, dark deadpan humour never explained, the «Э?» pause.
  for (const needle of ["чего он хочет от героя", "Говорить — не значит отвечать", "же, ведь, -то, ну, вот, уж, небось, разве", "Цены, условия, риски — в рассказ",
    "Сравнения остаются у рассказчика", "сказал бы это живой человек вслух, в лицо, в ту секунду?", "не чаще раза за сцену", "Юмор чёрный и сухой", "никто её не объясняет", "«Э?»"])
    assert.ok(VOICE_LAYER_RU.includes(needle), needle);
  for (const needle of ["чего человек хочет от героя сейчас", "Не отвечай на всё по порядку", "в рассказ, не в реплики", "в ту секунду?"])
    assert.ok(VOICE_REMINDER_RU.includes(needle), needle);
  // Russian campaigns only; the examples block is separate (part 3).
  assert.equal(voiceLayer("Russian", null, "off"), VOICE_LAYER_RU);
  assert.equal(voiceLayer("English", null, "off"), "");
  assert.equal(voiceReminder("Russian"), VOICE_REMINDER_RU);
  assert.equal(voiceReminder("English"), "");
});

test("§1 the layer sits in the cached layer 1 after the turn shape and the reminder in the last block next to the input, for both roles of a Russian campaign", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const first = await c.turn("Смотрю на воду.", [{ text: "Вода. ", toolCalls: [finish()] }]);
    const system = first.model.requests[0].system;
    const layer1 = system[0].text;
    assert.ok(layer1.includes(VOICE_LAYER_RU), "the voice prose is in layer 1");
    assert.ok(layer1.indexOf("Форма хода") < layer1.indexOf(VOICE_LAYER_RU), "after the turn shape");
    assert.ok(layer1.indexOf(VOICE_LAYER_RU) < layer1.indexOf("Campaign language: Russian"), "before the language line");
    assert.equal(system[0].cache, true);
    const last = system.at(-1);
    assert.equal(last.cache, false);
    assert.ok(last.text.endsWith(VOICE_REMINDER_RU), "the reminder closes the last block");
    // The writer's layers carry the same slot (polish 3 §2: the voice slot is shared by the roles).
    const source = (await c.row(first.input.operationId)).source;
    const context = buildDmLoopContext(source, first.input, { role: "writer" });
    const writer = writerSystem(context);
    assert.ok(writer[0].text.includes(VOICE_LAYER_RU));
    assert.ok(writer.at(-1).text.endsWith(VOICE_REMINDER_RU));
  } finally { await c.f.db.close(); }
});

test("§1 an English campaign gets neither the layer nor the reminder", async () => {
  const c = await loopCampaign({ language: "en" });
  try {
    const first = await c.turn("I look at the water.", [{ text: "Water. ", toolCalls: [finish()] }]);
    const system = first.model.requests[0].system;
    assert.doesNotMatch(system[0].text, /Голос\. Люди говорят/);
    assert.doesNotMatch(system.at(-1).text, /Перед репликой/);
  } finally { await c.f.db.close(); }
});

test("§2 «want before the line» is one sentence at the head of both turn shapes, in both languages, and names no tool", () => {
  for (const shape of [dmTurnShape("Russian"), writerTurnShape("Russian")]) {
    assert.ok(shape.split("\n")[1] === WANT_BEFORE_THE_LINE_RU, "the first line after the heading");
    assert.match(WANT_BEFORE_THE_LINE_RU, /чего этот человек хочет от героя прямо сейчас/);
  }
  for (const shape of [dmTurnShape("English"), writerTurnShape("English")]) assert.equal(shape.split("\n")[1], WANT_BEFORE_THE_LINE_EN);
  assert.match(WANT_BEFORE_THE_LINE_EN, /what they want from the hero right now/);
  assert.equal((WANT_BEFORE_THE_LINE_EN.match(/[.!?](\s|$)/g) ?? []).length, 1, "one sentence");
  assert.doesNotMatch(WANT_BEFORE_THE_LINE_EN, /note_character|note_world|query_state|finish_turn|roll\(/, "no tool");
});

// --- Part 3: the passage format and the examples mode -------------------------------------
// SYNTHETIC passages, written for this test only (not the owner's bank, not any author's text).
const synthetic = (kind, n) => `## ${kind}\nСинтетический отрывок ${n} (${kind}): тестовый текст, написанный для проверки.\n\n— Реплика, — сказал кто-то.\n— Ответ.\n${"Ещё одна строка синтетического текста, чтобы отрывок весил примерно двести токенов. ".repeat(6)}`;
const BANK = [synthetic("торг", 1), synthetic("ссора", 2), synthetic("быт", 3), synthetic("торг", 4), synthetic("тишина", 5), synthetic("ссора", 6), synthetic("драка", 7), synthetic("быт", 8)].join("\n---\n");

test("§3 the passage format: `---` separates, `## kind` names the kind, a multi-paragraph piece stays one passage, CRLF is fine", () => {
  const rows = parseVoicePassages(BANK);
  assert.equal(rows.length, 8);
  assert.deepEqual(rows.map((row) => row.kind), ["торг", "ссора", "быт", "торг", "тишина", "ссора", "драка", "быт"]);
  assert.ok(rows[0].text.startsWith("Синтетический отрывок 1"), "the kind line is stripped");
  assert.ok(rows[0].text.includes("\n\n— Реплика"), "the blank line inside the passage is kept");
  const plain = parseVoicePassages("Первый абзац.\n\nВторой абзац того же отрывка.");
  assert.deepEqual(plain, [{ kind: null, text: "Первый абзац.\n\nВторой абзац того же отрывка." }], "no `---`: one passage");
  assert.deepEqual(parseVoicePassages("A\r\n---\r\nB"), [{ kind: null, text: "A" }, { kind: null, text: "B" }]);
  assert.deepEqual(parseVoicePassages("  \n---\n  "), []);
});

test("§3 «five» is diverse by kind (round-robin), stable for a seed and different for another; «all» keeps whole passages up to the cap and counts the dropped", () => {
  const rows = parseVoicePassages(BANK);
  const a = pickFivePassages(rows, "session-a");
  assert.equal(a.length, 5);
  assert.deepEqual(a, pickFivePassages(rows, "session-a"), "stable per seed");
  const kindsSeen = [...new Set(rows.map((row) => row.kind))].sort();
  assert.deepEqual([...new Set(a.map((row) => row.kind))].sort(), kindsSeen, "every kind once when five kinds exist");
  const seeds = ["session-a", "session-b", "session-c", "session-d", "session-e", "session-f"];
  const texts = seeds.map((seed) => pickFivePassages(rows, seed).map((row) => row.text).join("|"));
  assert.ok(new Set(texts).size > 1, "another session sees another pick");
  assert.deepEqual(pickFivePassages(rows.slice(0, 3), "x"), rows.slice(0, 3), "fewer than five: all of them");
  const plainRows = ["a", "b", "c", "d", "e", "f", "g"].map((text) => ({ kind: null, text }));
  assert.equal(pickFivePassages(plainRows, "s").length, 5, "no kinds: still five");
  // The block.
  const five = voiceExamplesBlock(BANK, "five", { seed: "session-a" });
  assert.equal(five.passages, 5);
  assert.equal(five.total, 8);
  assert.equal((five.text.match(/<example>/g) ?? []).length, 5);
  assert.ok(five.text.startsWith(VOICE_EXAMPLES_HEAD));
  assert.doesNotMatch(five.text, /^## /m, "the kind lines never reach the prompt");
  const all = voiceExamplesBlock(BANK, "all");
  assert.equal(all.passages, 8);
  assert.equal(all.dropped, 0);
  assert.equal(all.tokens, estimateTokens(VOICE_EXAMPLES_HEAD) + rows.reduce((sum, row) => sum + estimateTokens(row.text) + 8, 0));
  const capped = voiceExamplesBlock(BANK, "all", { tokenCap: 1000 });
  assert.ok(capped.passages >= 1 && capped.passages < 8, `capped at ${capped.passages}`);
  assert.equal(capped.dropped, 8 - capped.passages);
  assert.ok(capped.tokens <= 1000);
  assert.equal(voiceExamplesBlock(BANK, "off").text, "");
  assert.equal(voiceExamplesBlock(BANK, true).passages, 5, "the old boolean means five");
  assert.equal(voiceLayer("Russian", BANK, "off", { layerOff: true }), "", "the replay's off variant: nothing");
});

test("§3 the mode is a campaign setting (migration 70): saved and read, the old boolean maps to five/off, the cap is bounded, the store takes 200 000 characters", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const s0 = await c.settings.read();
    assert.equal(s0.voiceMode, "off");
    assert.equal(s0.voiceTokenCap, VOICE_TOKEN_CAP_DEFAULT);
    assert.equal(s0.voiceExamples, false);
    const s1 = await c.settings.save({ expectedRevision: s0.revision, runtime: s0.runtime, dmTurn: s0.dmTurn, voiceMode: "all", voiceTokenCap: 12000 });
    assert.equal(s1.voiceMode, "all");
    assert.equal(s1.voiceTokenCap, 12000);
    assert.equal(s1.voiceExamples, true, "the boolean mirrors the mode");
    const s2 = await c.settings.save({ expectedRevision: s1.revision, runtime: s1.runtime, dmTurn: s1.dmTurn, voiceExamples: false });
    assert.equal(s2.voiceMode, "off", "the old boolean off turns the mode off");
    const s3 = await c.settings.save({ expectedRevision: s2.revision, runtime: s2.runtime, dmTurn: s2.dmTurn, voiceExamples: true });
    assert.equal(s3.voiceMode, "five", "the old boolean on means five");
    assert.equal(s3.voiceTokenCap, 12000, "the cap is kept");
    await assert.rejects(c.settings.save({ expectedRevision: s3.revision, runtime: s3.runtime, dmTurn: s3.dmTurn, voiceMode: "many" }), /validation/);
    await assert.rejects(c.settings.save({ expectedRevision: s3.revision, runtime: s3.runtime, dmTurn: s3.dmTurn, voiceTokenCap: 500 }), /validation/);
    await assert.rejects(c.f.one("select public.rpg_dm_settings($1,$2,'save',$3::jsonb) r", [c.owner, c.cid, JSON.stringify({ expectedRevision: s3.revision, runtime: s3.runtime, dmTurn: null, voiceMode: "many" })]), /rpg_validation/);
    assert.equal(parseDmSettings({ campaignId: "c", runtime: "dm-loop-v1", dmTurn: null, limits: null, depth: null, notebookVisible: false, boostNext: false, voiceExamples: true, revision: 2 }).voiceMode, "five", "a row from before migration 70");
    // The source carries the mode and the cap; the samples store takes a bank-sized text.
    const call = async (action, payload) => (await c.f.one("select public.rpg_dossier($1,$2,$3,$4::jsonb,null) result", [c.owner, c.cid, action, JSON.stringify(payload)])).result;
    const big = Array.from({ length: 60 }, (_, n) => synthetic("быт", n)).join("\n---\n").padEnd(150_000, "\nещё строка синтетического текста");
    await call("voice_save", { requestId: randomUUID(), scope: "campaign", samples: big });
    await assert.rejects(call("voice_save", { requestId: randomUUID(), scope: "campaign", samples: "x".repeat(200_001) }), /rpg_validation/);
    const source = (await c.f.one("select rpg_private.runtime_source($1,$2,'game') s", [c.cid, c.owner])).s;
    assert.equal(source.voiceMode, "five");
    assert.equal(source.voiceTokenCap, 12000);
    assert.equal(source.voiceExamplesOn, true);
    assert.equal(source.voiceSamples.length, big.length);
    assert.equal(source.voiceFlags, null, "no quotable flags yet");
  } finally { await c.f.db.close(); }
});

test("§3 in play: «five» quotes five passages in the cached layer 1, the same five all session; «all» quotes the bank up to the cap; the samples never reach a log or the public state — and the layer sizes are measured", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const call = async (action, payload) => (await c.f.one("select public.rpg_dossier($1,$2,$3,$4::jsonb,null) result", [c.owner, c.cid, action, JSON.stringify(payload)])).result;
    await call("voice_save", { requestId: randomUUID(), scope: "campaign", samples: BANK });
    const sizes = {};
    const layer1Of = (played) => played.model.requests[0].system[0];
    const off = await c.turn("Смотрю.", [{ text: "Вода. ", toolCalls: [finish()] }]);
    assert.doesNotMatch(layer1Of(off).text, /Синтетический отрывок/, "off: nothing quoted");
    sizes.off = estimateTokens(layer1Of(off).text);
    let s = await c.settings.read();
    await c.settings.save({ expectedRevision: s.revision, runtime: s.runtime, dmTurn: s.dmTurn, voiceMode: "five" });
    const five1 = await c.turn("Слушаю.", [{ text: "Прибой. ", toolCalls: [finish()] }]);
    const five2 = await c.turn("Жду.", [{ text: "Ждёшь. ", toolCalls: [finish()] }]);
    const quoted = (text) => [...text.matchAll(/Синтетический отрывок (\d+)/g)].map((m) => Number(m[1]));
    assert.equal(quoted(layer1Of(five1).text).length, 5);
    assert.deepEqual(quoted(layer1Of(five1).text), quoted(layer1Of(five2).text), "the same five on the next turn of the session (the cache holds)");
    assert.equal(layer1Of(five1).cache, true);
    assert.ok(layer1Of(five1).text.indexOf(VOICE_LAYER_RU) < layer1Of(five1).text.indexOf(VOICE_EXAMPLES_HEAD), "the examples follow the prose");
    sizes.five = estimateTokens(layer1Of(five1).text);
    s = await c.settings.read();
    await c.settings.save({ expectedRevision: s.revision, runtime: s.runtime, dmTurn: s.dmTurn, voiceMode: "all" });
    const all = await c.turn("Иду.", [{ text: "Идёшь. ", toolCalls: [finish()] }]);
    assert.equal(quoted(layer1Of(all).text).length, 8, "all eight");
    sizes.all = estimateTokens(layer1Of(all).text);
    const context = buildDmLoopContext((await c.row(all.input.operationId)).source, all.input);
    assert.equal(context.layers[0].dropped.length, 0);
    s = await c.settings.read();
    await c.settings.save({ expectedRevision: s.revision, runtime: s.runtime, dmTurn: s.dmTurn, voiceTokenCap: 1000 });
    const capped = await c.turn("Стою.", [{ text: "Стоишь. ", toolCalls: [finish()] }]);
    assert.ok(quoted(layer1Of(capped).text).length < 8 && quoted(layer1Of(capped).text).length >= 1, "the cap keeps whole passages");
    const cappedContext = buildDmLoopContext((await c.row(capped.input.operationId)).source, capped.input);
    assert.match(cappedContext.layers[0].dropped[0], /voice examples: \d+ passage/);
    // Privacy: the observations (what the server logs) and the public state carry no passage.
    assert.ok(!JSON.stringify(c.observations.filter((o) => o.type !== "live")).includes("Синтетический отрывок"), "the logged observations carry no passage");
    const snapshot = await c.f.saves(c.cid, "campaign");
    assert.doesNotMatch(JSON.stringify(snapshot), /Синтетический отрывок/, "never in the public snapshot");
    console.log(`voice layer 1 sizes on the fixture campaign (estimated tokens): off ${sizes.off}, five ${sizes.five}, all ${sizes.all} — the synthetic bank is 8 short passages`);
  } finally { await c.f.db.close(); }
});

// --- Part 4: speech profiles in play --------------------------------------------------------
test("§4 a named person who spoke without a profile is asked for in the next turn's last block (both roles); once drafted, the profiles of the people present sit there next to the reminder", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const first = await c.turn("Подхожу к Дуне.", [{ text: "Дуня вытирает руки.\n— Чего тебе? ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "dunya", name: "Дуня", kind: "npc", present: true, important: true } }, time(), finish("conversation")] }]);
    assert.equal(first.result.status, "committed", JSON.stringify(c.errors));
    assert.doesNotMatch(first.model.requests[0].system.at(-1).text, /spoke in the last turn without a speech profile/, "nothing to ask before anyone spoke");
    const second = await c.turn("Спрашиваю о лодке.", [{ text: "— Лодка не продаётся. ", toolCalls: [
      { name: "note_character", arguments: { actorRef: "Дуня", identity: { values: ["своя лодка"], wants: ["уйти в море"], boundaries: [], loyalties: [], signatures: [], observableVoice: "Коротко." },
        current: { goal: "продать улов", stress: "settled" },
        speech: { register: "Грубо, по-рыбацки.", sentenceLength: "short", tics: [{ phrase: "сплёвывает за борт", frequency: "sometimes" }], neverSays: ["афоризмы"], address: [{ actorRef: c.hero, form: "ты" }] } } },
      time(), finish("conversation")] }]);
    assert.equal(second.result.status, "committed", JSON.stringify(c.errors));
    const askedNow = second.model.requests[0].system.at(-1).text;
    assert.match(askedNow, /Дуня spoke in the last turn without a speech profile: draft it this turn — note_character speech/, "the single loop is asked for the profile");
    assert.ok(askedNow.indexOf("spoke in the last turn") < askedNow.indexOf(VOICE_REMINDER_RU), "next to the reminder, before it");
    // The writer's wording points at the ledger.
    const sourceTwo = (await c.row(second.input.operationId)).source;
    const writer = buildDmLoopContext(sourceTwo, second.input, { role: "writer" });
    assert.match(writer.parts.now, /in the ledger's people line say how they speak/);
    // Drafted: the profile travels in the last block now; nothing is asked any more.
    const third = await c.turn("Молчу.", [{ text: "— Ну и молчи. ", toolCalls: [time(), finish("conversation")] }]);
    const now = third.model.requests[0].system.at(-1).text;
    assert.match(now, /Speech profiles of the people in the scene[\s\S]*- Дуня: Грубо, по-рыбацки\.; sentences short; tics: «сплёвывает за борт» \(sometimes\); never says: афоризмы; address: [^\n]+ — ты/);
    assert.doesNotMatch(now, /without a speech profile/);
    assert.ok(now.indexOf("Speech profiles of the people") < now.indexOf(VOICE_REMINDER_RU), "the profiles stand right before the reminder");
    assert.ok(now.indexOf("Current state (before this turn") < now.indexOf("Speech profiles of the people"), "after the state");
    // A person not in the scene is not listed (the same source with nobody present).
    const sourceThree = (await c.row(third.input.operationId)).source;
    const nobody = structuredClone(sourceThree);
    nobody.runtime.configuration = { ...nobody.runtime.configuration, presentEntityIds: [] };
    assert.doesNotMatch(buildDmLoopContext(nobody, third.input).parts.now, /Speech profiles of the people/);
    assert.match(buildDmLoopContext(sourceThree, third.input).parts.now, /Speech profiles of the people/);
  } finally { await c.f.db.close(); }
});

// --- Part 5: the quotable-line check ---------------------------------------------------------
test("§5 the NPC lines of a narration: dash lines without their attribution, quoted speech, no fragments; the answer parses bounded; the tail line only for the last committed turn", () => {
  const narration = "Дуня вытирает руки о передник.\n— Чего тебе? — говорит она, не глядя. — Улов. Бери, даром.\n— Ну.\nФрол кивает: «Вы украли у нас небо. Я заберу у вас его кусок». Ветер «воет» в снастях.\n— Вы ответите за унижение нашего клана, — цедит он.";
  const lines = npcLines(narration);
  assert.deepEqual(lines, ["Чего тебе?", "Улов. Бери, даром.", "Вы украли у нас небо. Я заберу у вас его кусок", "Вы ответите за унижение нашего клана"]);
  const request = quotableRequest(lines, "ru");
  assert.match(request.system, /симметричные афоризмы/);
  assert.match(request.user, /^1\. Чего тебе\?\n2\. /);
  assert.deepEqual(parseQuotableFlags('Вот: {"flags":[{"n":3,"why":"симметричный афоризм с метафорой"},{"n":3,"why":"дубль"},{"n":9,"why":"нет такой"},{"n":"x"}]}', lines),
    [{ line: "Вы украли у нас небо. Я заберу у вас его кусок", why: "симметричный афоризм с метафорой" }]);
  assert.deepEqual(parseQuotableFlags("no json here", lines), []);
  assert.deepEqual(parseQuotableFlags('{"flags":"nope"}', lines), []);
  const stored = { operationId: "op-1", flags: [{ line: "Вы украли у нас небо. Я заберу у вас его кусок", why: "афоризм" }] };
  assert.match(quotableLine(stored, "op-1", "ru"), /^Проверка реплик прошлого хода: «Вы украли у нас небо\. Я заберу у вас его кусок» — афоризм\./);
  assert.match(quotableLine(stored, "op-1", "en"), /^The quotable-line check of the last turn/);
  assert.equal(quotableLine(stored, "op-2", "ru"), "", "an older turn's flags do not travel");
  assert.equal(quotableLine({ operationId: "op-1", flags: [] }, "op-1", "ru"), "", "no flag, no line");
  assert.equal(quotableLine(null, "op-1", "ru"), "");
});

test("§5 the cheap model's call: no lines → no request; a canned answer → flags with the usage and the cost; a failure → reported, never thrown", async () => {
  const calls = [];
  const fetcher = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    return { ok: true, status: 200, json: async () => ({ content: [{ type: "text", text: '{"flags":[{"n":1,"why":"лозунг"}]}' }], usage: { input_tokens: 400, output_tokens: 30 } }) };
  };
  const none = await checkQuotableLines("key", "Тихо. Только ветер.", "ru", { fetcher });
  assert.deepEqual(none, { flags: [], lines: 0, usage: null, costUsdMicros: 0, elapsedMs: 0, error: null });
  assert.equal(calls.length, 0, "a narration without speech costs nothing");
  const result = await checkQuotableLines("key", "— Мы вернём себе небо, — говорит он.", "ru", { fetcher });
  assert.deepEqual(result.flags, [{ line: "Мы вернём себе небо", why: "лозунг" }]);
  assert.equal(result.lines, 1);
  assert.deepEqual(result.usage, { inputTokens: 400, outputTokens: 30 });
  assert.equal(result.costUsdMicros, 55, "400 × $0.10/M + 30 × $0.50/M");
  assert.equal(calls[0].body.model, QUOTABLE_MODEL);
  assert.equal(calls[0].body.output_config.effort, "low");
  assert.equal(calls[0].url, "https://api.anthropic.com/v1/messages");
  const noKey = await checkQuotableLines("", "— Мы вернём себе небо, — говорит он.", "ru", { fetcher });
  assert.equal(noKey.error, "not_configured");
  const failed = await checkQuotableLines("key", "— Мы вернём себе небо, — говорит он.", "ru", { fetcher: async () => ({ ok: false, status: 529, json: async () => ({ error: { type: "overloaded_error" } }) }) });
  assert.equal(failed.error, "HTTP 529: overloaded_error");
  assert.deepEqual(failed.flags, []);
});

test("§5 the flags are logged per turn (migration 70) and the next turn's tail carries one line only while they belong to the last committed turn; both runtimes hand the narration to afterCommit", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    let handed = null;
    const one = await c.turn("Подхожу.", [{ text: "— Вы украли у нас небо, — говорит Фрол. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "frol", name: "Фрол", kind: "npc", present: true } }, time(), finish("conversation")] }],
      { deps: { afterCommit: async ({ narration }) => { handed = narration; } } });
    assert.equal(one.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(handed, "— Вы украли у нас небо, — говорит Фрол.", "the single loop hands the committed narration to afterCommit");
    assert.match(readFileSync(new URL("../src/lib/gameplay/dm-loop/two-pass/runtime.ts", import.meta.url), "utf8"), /input, source: claim\.source, narration \}\)/, "the split runtime hands it too");
    assert.match(readFileSync(new URL("../src/lib/server/gameplay-service.ts", import.meta.url), "utf8"), /scheduleQuotableCheck\(\{ ownerId, campaignId, operationId, narration/, "the server schedules the check after the commit");
    // The server's store of the check (as runQuotableCheck writes it).
    const call = async (action, payload) => (await c.f.one("select public.rpg_dossier($1,$2,$3,$4::jsonb,null) result", [c.owner, c.cid, action, JSON.stringify(payload)])).result;
    const flags = [{ line: "Вы украли у нас небо", why: "лозунг вместо обиды" }];
    const saved = await call("voice_flags_save", { requestId: randomUUID(), operationId: one.input.operationId, flags, lines: 1, model: QUOTABLE_MODEL, usage: { inputTokens: 400, outputTokens: 30 }, costUsdMicros: 55 });
    assert.equal(saved.operationId, one.input.operationId);
    assert.deepEqual(saved.flags, flags);
    await assert.rejects(call("voice_flags_save", { requestId: randomUUID(), operationId: randomUUID(), flags, lines: 1 }), /rpg_validation/, "only a committed turn of the campaign");
    await assert.rejects(call("voice_flags_save", { requestId: randomUUID(), operationId: one.input.operationId, flags: [{ line: "", why: "x" }], lines: 1 }), /rpg_validation/);
    const read = await call("voice_flags_read", { limit: 10 });
    assert.equal(read.rows.length, 1);
    assert.equal(read.rows[0].costUsdMicros, 55);
    const source = (await c.f.one("select rpg_private.runtime_source($1,$2,'game') s", [c.cid, c.owner])).s;
    assert.deepEqual(source.voiceFlags, { operationId: one.input.operationId, flags });
    // The next turn's tail carries the line (the flagged turn is the last committed one).
    const two = await c.turn("Молчу.", [{ text: "Фрол ждёт. ", toolCalls: [time(), finish("conversation")] }]);
    const tail = two.model.requests[0].system.at(-2).text;
    assert.match(tail, /Проверка реплик прошлого хода: «Вы украли у нас небо» — лозунг вместо обиды\./);
    assert.doesNotMatch(two.model.requests[0].system.at(-1).text, /Проверка реплик прошлого хода/, "in the tail, not in «now»");
    // Turn two committed without a check row: turn three's tail is clean (the flags are an older turn's).
    const three = await c.turn("Жду.", [{ text: "Ждёшь. ", toolCalls: [time(), finish("quiet")] }]);
    assert.doesNotMatch(three.model.requests[0].system.at(-2).text, /Проверка реплик прошлого хода/);
    // An empty check row (lines read, nothing flagged) puts no line either.
    await call("voice_flags_save", { requestId: randomUUID(), operationId: three.input.operationId, flags: [], lines: 2 });
    const four = await c.turn("Иду.", [{ text: "Идёшь. ", toolCalls: [time(), finish("travel")] }]);
    assert.doesNotMatch(four.model.requests[0].system.at(-2).text, /Проверка реплик прошлого хода/);
    // The public state never sees the flags.
    assert.doesNotMatch(JSON.stringify(await c.f.saves(c.cid, "campaign")), /лозунг вместо обиды/);
  } finally { await c.f.db.close(); }
});

test("owner's replay fix 1: the snapshot list names every committed loop turn, from its claim-time source when no snapshot row exists", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const rpc = async (args) => {
      try { return { data: (await c.f.one("select public.rpg_turn_snapshots($1,$2,$3,$4::jsonb) result", [args.p_owner_id, args.p_campaign_id, args.p_action, JSON.stringify(args.p_payload)])).result }; }
      catch (error) { return { error: { message: error.message } }; }
    };
    // The fixture's afterCommit saves no snapshot (as the app before migration 68 did not): the list must still name the turns.
    await c.turn("Жду.", [{ text: "Ждёшь.", toolCalls: [time(), finish("quiet")] }]);
    await c.turn("Иду.", [{ text: "Идёшь.", toolCalls: [time(), finish("travel")] }]);
    const list = await listTurnSnapshotsWith(rpc, c.owner, c.cid);
    assert.deepEqual(list.snapshots.map((row) => [row.turnNo, row.input, row.stored]), [[1, "Жду.", "turn"], [2, "Иду.", "turn"]]);
    const read = await readTurnSnapshotWith(rpc, c.owner, c.cid, { operationId: list.snapshots[1].operationId });
    assert.equal(read.payload.input.input, "Иду.");
  } finally { await c.f.db.close(); }
});
