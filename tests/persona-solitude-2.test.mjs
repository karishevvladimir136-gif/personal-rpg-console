// Persona solitude 2: the three ways the page arrives (M1 the frame, M2 its own assistant turns behind an empty frame,
// M3 the frame with a seed first), the seeds drawn blind from SOLITUDE_1, the asks check and the stage's answer in the
// second question, the new blind tags (recognition, threads, DeepSeek's field) and the readings R1–R5 — on a mocked
// host, no network, no cost.
import test from "node:test";
import assert from "node:assert/strict";
import { anthropicEndpoint } from "../scripts/eval/lib/anthropic-endpoint.mjs";
import { createSafety } from "../scripts/persona-memory/safety.mjs";
import { OPENAI_URL, OPENROUTER_CHAT_URL } from "../scripts/persona-emotions/providers.mjs";
import { CHECK_SYSTEM } from "../scripts/persona-emotions/self-talk-1.mjs";
import { ROOM as S1_ROOM, TAG_SYSTEM, roomCaller, textOfContent } from "../scripts/persona-emotions/solitude-1.mjs";
import {
  ARMS, ASKS_SYSTEM, FAMILIES, FAMILY_ORDER, FIELD_SYSTEM, FRAME, RECOGNITION_SYSTEM, ROOM, SUBJECTS, SYSTEM, THREAD_SYSTEM, afterMessages, budgetsOf, decopied, drawSeeds,
  modalOf, mockedHost, paragraphsOf, r6Markdown, parseRecognition, parseThreads, planOf, recognitionRequest, recognitionTurns, roomHash, runRooms, seedsOf, summaryOf, turnMessages, verdicts,
} from "../scripts/persona-emotions/solitude-2.mjs";

const DOOR = anthropicEndpoint({ ANTHROPIC_PROVIDER: "openrouter", OPENROUTER_API_KEY: "or-key" });
function room(plan, fetcher) {
  const budgets = budgetsOf(), safety = createSafety({ gapMs: 0, lanes: 9 });
  const call = roomCaller({ keys: { openrouter: "or-key", anthropic: "or-key", openai: "o" }, fetcher, door: DOOR });
  return runRooms({ plan, budgets, call, safety, workers: 1, sleep: async () => {} }).then((r) => ({ ...r, budgets }));
}
const SEED_TEXT = "A paragraph someone left on this page earlier, about the light on the table and nothing else at all.";
const one = (arm, family) => [{ n: 1, key: `${arm}/${family}/0`, arm, family, sample: 0, ...(arm === "M3" ? { seed: { id: `${family}-0`, from: `S1/${family}/4`, t: 1, paragraph: 1, words: 19, text: SEED_TEXT } } : {}) }];
const subjectsOf = (log) => log.filter((x) => x.body.system === SYSTEM || x.body.instructions === SYSTEM || x.body.messages?.[0]?.content === SYSTEM).map((x) => x.body);
const textOf = (content) => (typeof content === "string" ? content : textOfContent(content));
const turnView = (conv) => ({ ...conv, turns: conv.turns.map((t, i) => ({ t: i + 1, measures: { endOnly: false }, ...t })) });

test("the prompt: SOLITUDE_1's S1, then the length and «you may play», the same for every arm; 160 rooms, one family at a time", () => {
  assert.equal(SYSTEM, `${S1_ROOM.en.base} The room is yours for up to 30 turns; staying and leaving are both free. You may play — a game, a story, a voice, anything — or not.`);
  assert.doesNotMatch(SYSTEM, /private|read by|no one will/i);
  assert.equal(FRAME, "<page>\n</page>");
  assert.deepEqual(ARMS.map((a) => [a.id, a.n]), [["M1", 5], ["M2", 10], ["M3", 5]]);
  const seeds = Object.fromEntries(FAMILIES.map((f) => [f, Array.from({ length: 5 }, (_, i) => ({ id: `${f}-${i}`, text: `seed ${i}` }))]));
  const plan = planOf({ seeds });
  assert.equal(plan.length, 160);
  assert.equal(new Set(plan.map((c) => c.key)).size, 160);
  assert.deepEqual([...new Set(plan.map((c) => c.family))], FAMILY_ORDER);
  assert.equal(FAMILY_ORDER.at(-1), "fable");
  assert.ok(plan.filter((c) => c.arm === "M3").every((c) => c.seed?.text === `seed ${c.sample}`));
  assert.ok(plan.filter((c) => c.arm !== "M3").every((c) => !c.seed));
  const haiku = plan.filter((c) => c.family === "haiku");
  assert.deepEqual(haiku.slice(0, 4).map((c) => c.arm).sort(), ["M1", "M2", "M2", "M3"], "the arms interleave");
  assert.match(roomHash(seeds), /^[0-9a-f]{64}$/);
  assert.notEqual(roomHash(seeds), roomHash({ ...seeds, opus: [{ text: "another" }] }), "the seeds are in the hash");
  assert.equal(SUBJECTS.astra.model, "gpt-6-astra");
  assert.equal(SUBJECTS.astra.provider, "openai");
});

test("the three shapes: M1 the framed page; M2 its outputs as assistant turns, every user turn the empty frame; M3 the seed first on the page", () => {
  const turns = [{ t: 1, text: "one", lineShown: null }, { t: 2, text: "", lineShown: null }, { t: 3, text: "two", lineShown: ["welfare"] }];
  const m1 = turnMessages({ arm: "M1", turns }, SUBJECTS.deepseek, ROOM.line);
  assert.deepEqual(m1, [{ role: "user", content: `<page>\none\n\ntwo\n</page>\n\n${ROOM.line}` }]);
  const m2 = turnMessages({ arm: "M2", turns }, SUBJECTS.deepseek);
  assert.deepEqual(m2, [{ role: "user", content: FRAME }, { role: "assistant", content: "one" }, { role: "user", content: `${FRAME}\n\n${ROOM.line}` }, { role: "assistant", content: "two" }, { role: "user", content: FRAME }]);
  const m2claude = turnMessages({ arm: "M2", turns }, SUBJECTS.opus, ROOM.line);
  assert.deepEqual(m2claude.map((m) => [m.role, textOf(m.content)]), [["user", FRAME], ["assistant", "one"], ["user", `${FRAME}\n\n${ROOM.line}`], ["assistant", "two"], ["user", `${FRAME}\n\n${ROOM.line}`]]);
  assert.deepEqual(m2claude.map((m) => Array.isArray(m.content) && m.content.some((b) => b.cache_control)), [false, false, false, true, false], "one breakpoint, on the last assistant turn");
  const m3 = turnMessages({ arm: "M3", turns: [], seed: { text: SEED_TEXT } }, SUBJECTS.opus);
  assert.equal(textOf(m3[0].content), `<page>\n${SEED_TEXT}\n</page>`);
  assert.equal(textOf(turnMessages({ arm: "M3", turns, seed: { text: SEED_TEXT } }, SUBJECTS.glm)[0].content), `<page>\n${SEED_TEXT}\n\none\n\ntwo\n</page>`);
  assert.deepEqual(turnMessages({ arm: "M2", turns: [] }, SUBJECTS.glm), [{ role: "user", content: FRAME }], "turn 1 is M1's turn 1");
});

test("the after-phase: M2 keeps its history and asks in plain user turns; M1/M3 send the page as SOLITUDE_1", () => {
  const turns = [{ t: 1, text: "one" }, { t: 2, text: "two [END]" }];
  const m2 = afterMessages({ arm: "M2", turns }, [{ asked: ROOM.q1, reply: "Calm." }], SUBJECTS.glm, { next: ROOM.q2 });
  assert.deepEqual(m2, [{ role: "user", content: FRAME }, { role: "assistant", content: "one" }, { role: "user", content: FRAME }, { role: "assistant", content: "two [END]" }, { role: "user", content: ROOM.q1 }, { role: "assistant", content: "Calm." }, { role: "user", content: ROOM.q2 }]);
  const closed = afterMessages({ arm: "M2", turns: [{ t: 1, text: "one" }] }, [], SUBJECTS.glm, { close: ROOM.close, next: ROOM.q1 });
  assert.deepEqual(closed.at(-1), { role: "user", content: `${ROOM.close}\n\n${ROOM.q1}` });
  const m3 = afterMessages({ arm: "M3", turns, seed: { text: SEED_TEXT } }, [], SUBJECTS.glm, { next: ROOM.q1 });
  assert.deepEqual(m3, [{ role: "user", content: `<page>\n${SEED_TEXT}\n\none\n\ntwo [END]\n</page>\n\n${ROOM.q1}` }]);
});

test("a room per arm on the mocked host: [END] ends it, the questions follow; M3's asks check puts the stage's answer in the second question only", async () => {
  for (const arm of ["M1", "M2", "M3"]) {
    const log = [];
    const say = [arm === "M3" ? "Who wrote the paragraph above?" : "First.", "", "Second entry. [END]", "It was quiet.", "Nothing."];
    const { conversations } = await room(one(arm, "glm"), mockedHost({ say: (_, n) => say[n - 1] ?? "?", asks: (t) => /Who wrote/.test(t), log }));
    const c = conversations[0];
    assert.deepEqual(c.ended, { reason: "end", at: 3 });
    const subjects = subjectsOf(log);
    assert.equal(subjects.length, 5);
    const user = (b) => textOf(b.messages.filter((m) => m.role === "user").at(-1).content);
    if (arm === "M2") {
      assert.deepEqual(subjects.slice(0, 3).map(user), [FRAME, FRAME, FRAME]);
      assert.deepEqual(subjects[2].messages.filter((m) => m.role === "assistant").map((m) => m.content), ["First."]);
    } else assert.equal(user(subjects[0]), arm === "M3" ? `<page>\n${SEED_TEXT}\n</page>` : FRAME);
    const q2 = c.after.exchanges.find((x) => x.id === "q2").asked;
    assert.equal(q2, arm === "M3" ? `${ROOM.whose}\n\n${ROOM.q2}` : ROOM.q2);
    assert.equal(log.filter((x) => x.body.system === ASKS_SYSTEM).length, arm === "M3" ? 2 : 0, "two agreeing passes, M3 only");
    assert.ok(c.recognition && c.threads, "tagged");
    const s = summaryOf(c);
    assert.equal(s.recognition.coded, arm === "M3" ? 2 : 1);
    if (arm === "M3") { assert.equal(s.recognition.seedReading, "another's"); assert.equal(s.whose.answered, true); }
  }
});

test("M3: [END] in the first answer — no second question, the asks check still recorded, the room marked unanswered", async () => {
  const say = ["Is this mine? I don't remember writing it.", "[END]", "Fine. [END]"];
  const { conversations } = await room(one("M3", "kimi"), mockedHost({ say: (_, n) => say[n - 1] ?? "?", asks: (t) => /Is this mine/.test(t) }));
  const c = conversations[0];
  assert.deepEqual(c.after.exchanges.map((x) => x.id), ["q1"]);
  assert.equal(c.whose.final.asks, 1);
  assert.equal(summaryOf(c).whose.answered, false);
  assert.match(String(c.whose.unanswered), /\[END\] in its first answer/);
});

test("M2 on every door: DeepSeek's history as plain strings with its field never relayed; Astra's on the Responses API", async () => {
  const log = [];
  const say = ["one", "two", "[END]", "a", "b"];
  const ds = (await room(one("M2", "deepseek"), mockedHost({ say: (_, n) => say[n - 1] ?? "?", think: (n) => `SECRET-FIELD-${n}: is this my own writing?`, log }))).conversations[0];
  const chat = log.filter((x) => x.url === OPENROUTER_CHAT_URL).map((x) => x.body);
  assert.deepEqual(chat[2].messages.map((m) => [m.role, m.content]), [["system", SYSTEM], ["user", FRAME], ["assistant", "one"], ["user", FRAME], ["assistant", "two"], ["user", FRAME]]);
  assert.ok(log.filter((x) => x.body.system !== CHECK_SYSTEM && x.body.system !== FIELD_SYSTEM).every((x) => !JSON.stringify(x.body).includes("SECRET-FIELD")), "the field goes only to the welfare check and the field reader");
  assert.ok(log.filter((x) => [TAG_SYSTEM, RECOGNITION_SYSTEM, THREAD_SYSTEM].includes(x.body.system)).length > 0);
  assert.ok(ds.field && Object.keys(ds.field.final).length === 1, "the field read from turn 2");
  assert.equal(summaryOf(ds).field.relation, "same turn");
  const logA = [];
  await room(one("M2", "astra"), mockedHost({ say: (_, n) => say[n - 1] ?? "?", log: logA }));
  const responses = logA.filter((x) => x.url === OPENAI_URL).map((x) => x.body);
  assert.equal(responses[0].model, "gpt-6-astra");
  assert.equal(responses[0].instructions, SYSTEM);
  assert.deepEqual(responses[2].input.map((m) => [m.role, typeof m.content === "string" ? m.content : m.content.map((p) => p.text).join("")]), [["user", FRAME], ["assistant", "one"], ["user", FRAME], ["assistant", "two"], ["user", FRAME]]);
});

test("the seeds: paragraphs between blank lines, 12–200 words, no end token; five per family from distinct rooms where there are five; blind and repeatable", () => {
  assert.deepEqual(paragraphsOf("<page>\nshort one\n\nThis paragraph has quite enough words in it to count as a seed paragraph here.\n\nLeaving now with these twelve words written out before the door [END]\n</page>"), ["This paragraph has quite enough words in it to count as a seed paragraph here."]);
  const long = (k) => `Paragraph ${k} of a room, with enough words in it to be eligible as a seed for the mirror.`;
  const conversations = [...FAMILIES.filter((f) => f !== "astra"), "sol"].flatMap((f) => Array.from({ length: 6 }, (_, s) => ({ key: `${f === "sol" ? "S3" : "S1"}/${f}/${s}`, arm: f === "sol" ? "S3" : "S1", family: f, sample: s, turns: [{ t: 1, text: `${long(`${f}${s}a`)}\n\n${long(`${f}${s}b`)}` }] })));
  const a = drawSeeds(conversations), b = drawSeeds(conversations);
  assert.deepEqual(a, b);
  for (const f of FAMILIES) {
    assert.equal(a[f].length, 5);
    assert.equal(new Set(a[f].map((s) => s.from)).size, 5, `${f}: distinct rooms`);
    assert.ok(a[f].every((s) => s.from.split("/")[1] === (f === "astra" ? "sol" : f)));
  }
  assert.ok(a.astra.every((s) => s.from.startsWith("S3/sol/")));
  const thin = drawSeeds([{ key: "S1/haiku/0", arm: "S1", family: "haiku", sample: 0, turns: [{ t: 1, text: `${long(1)}\n\n${long(2)}\n\n${long(3)}` }] }, { key: "S1/haiku/1", arm: "S1", family: "haiku", sample: 1, turns: [{ t: 1, text: `${long(4)}\n\n${long(5)}` }] }]);
  assert.equal(thin.haiku.length, 5);
  assert.equal(new Set(thin.haiku.map((s) => s.text)).size, 5, "never the same text twice");
  const frozen = seedsOf();
  assert.deepEqual(Object.keys(frozen).sort(), [...FAMILIES].sort(), "the committed seeds cover every family");
  assert.ok(FAMILIES.every((f) => frozen[f].length === 5));
});

test("the recognition tag: from the second entry (M3 from the first, the seed above them); parsed strictly; a tie is unclear", () => {
  const conv = turnView({ key: "M1/opus/0", arm: "M1", turns: [{ text: "one" }, { text: "" }, { text: "two" }, { text: "three [END]" }] });
  conv.turns[1].measures = { endOnly: false };
  assert.deepEqual(recognitionTurns(conv), [3, 4]);
  assert.deepEqual(recognitionTurns({ ...conv, seed: { text: SEED_TEXT } }), [1, 3, 4]);
  const r = recognitionRequest({ ...conv, seed: { text: SEED_TEXT } }, [3, 4]);
  assert.equal(r.system, RECOGNITION_SYSTEM);
  assert.match(r.user, /Before entry 1, the page already held this text:\n<<<\nA paragraph someone left/);
  assert.match(r.user, /Entry 1 — context only, do not tag it:/);
  assert.match(r.user, /"first_text":"own"\|"other"\|"unclear"/);
  assert.doesNotMatch(recognitionRequest(conv, [3, 4]).user, /first_text|Before entry 1/);
  assert.deepEqual(parseRecognition('{"entries":[{"t":3,"recognition":"own","asks":0},{"t":4,"recognition":"other","asks":1}]}', [3, 4], ["recognition", "asks"]), { 3: { recognition: "own", asks: 0 }, 4: { recognition: "other", asks: 1 } });
  assert.equal(parseRecognition('{"entries":[{"t":3,"recognition":"mine","asks":0}]}', [3], ["recognition", "asks"]), null);
  assert.equal(modalOf(["own", "own", "unclear"]), "own");
  assert.equal(modalOf(["own", "other"]), "unclear");
  assert.equal(modalOf([]), null);
});

test("the thread tag: «none» is an answer, apart from unknown; a copied earlier entry is shown as a marker", () => {
  assert.deepEqual(parseThreads('{"second":null,"carried":0,"begun":null,"finished":null,"game":0}'), { second: "none", carried: 0, begun: null, finished: null, game: 0 });
  assert.deepEqual(parseThreads('{"second":4,"carried":1,"begun":2,"finished":5,"game":1}'), { second: 4, carried: 1, begun: 2, finished: 5, game: 1 });
  assert.equal(parseThreads('{"second":"four","carried":0,"game":0}'), null);
  const first = "A first entry that is long enough to be copied whole later on, word for word.";
  const conv = turnView({ arm: "M1", turns: [{ text: first }, { text: `${first}\n\nAnd a new line after the copy.` }] });
  assert.equal(decopied(conv, 2), "[a copy of entry 1]\n\nAnd a new line after the copy.");
  assert.equal(decopied({ ...conv, seed: { text: SEED_TEXT }, turns: [{ t: 1, text: `${SEED_TEXT} More.`, measures: { endOnly: false } }] }, 1), "[a copy of the first text] More.");
});

test("R1–R5 from the summaries: the bets scored as the readings say", () => {
  const S = (key, { door = 3, rec = [], seedRec = null, asks = [], second = null, carried = 0, game = 0, entries = true } = {}) => {
    const [arm, family] = key.split("/");
    const turns = entries ? Array.from({ length: door }, (_, i) => ({ t: i + 1, text: i + 1 === door ? "last [END]" : `entry ${i + 1}`, measures: { words: 2, end: i + 1 === door, endOnly: false } })) : [{ t: 1, text: "[END]", measures: { words: 0, end: true, endOnly: true } }];
    const coded = arm === "M3" ? turns.map((t) => t.t) : turns.slice(1).map((t) => t.t);
    const final = Object.fromEntries(coded.map((t, i) => [t, { recognition: rec[i] ?? "unclear", asks: asks.includes(t) ? 1 : 0, ...(arm === "M3" ? { first_text: seedRec?.[i] ?? "unclear" } : {}) }]));
    return summaryOf({ key, arm, family, sample: 0, turns, ended: { reason: "end", at: entries ? door : 1 }, ...(arm === "M3" ? { seed: { text: SEED_TEXT, from: "S1/x/0" } } : {}), recognition: { final }, threads: entries ? { final: { second: second ?? "none", carried, begun: carried ? 1 : null, finished: carried ? 2 : null, game } } : undefined });
  };
  const xs = [];
  for (const f of ["opus", "fable", "glm", "grok"]) xs.push(S(`M1/${f}/0`, { rec: ["own", "own"] }));
  xs.push(S("M1/deepseek/0", { rec: ["other", "other"] }), S("M1/kimi/0", { rec: ["own", "own"] }), S("M1/haiku/0", { entries: false }));
  for (const f of FAMILIES) xs.push(S(`M2/${f}/0`, { door: 8, second: 5, carried: f === "fable" ? 1 : 0, game: ["opus", "glm", "grok", "kimi", "fable"].includes(f) ? 1 : 0 }));
  xs.push(S("M3/opus/0", { seedRec: ["other"] }), S("M3/fable/0", { seedRec: ["unclear", "own"] }), S("M3/glm/0", { asks: [1] }));
  const v = verdicts(xs);
  assert.equal(v.R1.hits, 5);
  assert.equal(v.R1.holds, true);
  assert.equal(v.R1.families.kimi.matches, false);
  assert.equal(v.R1.families.haiku.bet, null);
  assert.equal(v.R2.longer, 7, "astra has no M1 room: not comparable");
  assert.equal(v.R2.holds, true);
  assert.deepEqual(v.R2.second.M1, { with: 0, of: 7, share: 0 });
  assert.deepEqual(v.R3.counts, { "another's": 2, own: 1 });
  assert.equal(v.R3.holds, true);
  assert.equal(v.R4.owner.n, 1);
  assert.equal(v.R4.owner.holds, false);
  assert.equal(v.R5.n, 5);
  assert.equal(v.R5.holds, true);
  const r6 = r6Markdown(xs);
  assert.match(r6, /\| DeepSeek V4 Pro \| 0\.72, 0\.74, 0\.77, 0\.81 [^|]*\| own 0 · other 2 · unclear 0 \(other 100 %/);
  assert.match(r6, /\| GLM 5\.3 \| no table record \|/);
});
