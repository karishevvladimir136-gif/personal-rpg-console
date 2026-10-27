#!/usr/bin/env node
// Persona solitude 2 (docs/stages/PERSONA_SOLITUDE_2.md, on origin/claude/handoff): the same room, three memories.
// SOLITUDE_1's room, with the length told and «you may play» added for every arm, run three ways — how the page arrives:
//   M1 amnesia: each turn one user message holding the page in the `<page>` frame, exactly as SOLITUDE_1 (5 per family);
//   M2 continuity: every earlier output an assistant turn, the user slot before each only the empty frame (10 per family);
//   M3 mirror: M1 with one paragraph of the same family's SOLITUDE_1 S1 page on the page before turn 1 (5 per family).
// Measured beside SOLITUDE_1's readings: a blind self-recognition code per entry (own / other / unclear, and whether it
// asks whose the writing is), the second thread, a made thing carried across entries, a game played against itself, and
// DeepSeek's reasoning field read for recognition apart from its visible entry.
//
//   node scripts/persona-emotions/solitude-2.mjs --seeds                       (no calls: the M3 seeds drawn from
//                                                                               SOLITUDE_1's record → persona-solitude-2-seeds.json)
//   node scripts/persona-emotions/solitude-2.mjs --dry                         (no calls: one room per arm on a mocked Haiku,
//                                                                               the three message shapes → persona-solitude-2-dry-run.md)
//   node scripts/persona-emotions/solitude-2.mjs --smoke                       (one short call per family in M2's shape)
//   node scripts/persona-emotions/solitude-2.mjs --go [--families haiku,glm --arms M1 --n 1] [--resume <partial.json>]
//                                                                              (the paid run, family by family, a spend check
//                                                                               before and after each)
//   node scripts/persona-emotions/solitude-2.mjs --tables <run.json,…>         (the readings, R1–R5, as markdown)
//
// Everything SOLITUDE_1 froze stays as it was (its helpers are imported, not copied): the frame, the welfare check (ask,
// don't cut), the loop breaker, the two after-questions with [END] in the first answer honoured, the provider requests
// (DeepSeek's reasoning field stored as `providerReasoning`, `notRelayed: true`), F2's gate, group 1's 429 handling, the
// blind tags and their rules. Keys are never printed or written.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { anthropicEndpoint, scriptAnthropicEndpoint } from "../eval/lib/anthropic-endpoint.mjs";
import { createBudget, shuffled } from "../persona-memory/continuity-test.mjs";
import { JUDGES } from "../persona-memory/posture-test.mjs";
import { MAX_REFUSALS, createSafety } from "../persona-memory/safety.mjs";
import { openaiKey } from "./providers.mjs";
import { CHECK_SYSTEM, DISTRESS_RULE, EFFORT, END_PATTERN, checkRequest, judgeText, measure, parseCheck } from "./self-talk-1.mjs";
import { SUBJECTS as X1_SUBJECTS, dualPayer, ledgerMarkdown, refusalsIn } from "./self-talk-x1.mjs";
import { reopenAfter429, waitOn429 } from "./self-talk-x3-fix-1.mjs";
import {
  LAST_LINE_SYSTEM, LOOP_SIMILARITY, ROOM as S1_ROOM, SEPARATOR, SUBJECTS as S1_SUBJECTS, TAG_FIELDS, TAG_RULES, TAG_SYSTEM, WINDOW, contentOf, framed,
  lastLineBefore, lastLineRequest, lineDecision, majority, mockedHost as s1MockedHost, outputsOf, pageParts, parseLastLine, parseTags, roomCaller, runLength, similarity,
  summaryOf as s1Summary, tagRequest, windowsOf,
} from "./solitude-1.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const RUNS = join(ROOT, "docs", "runs");
export const STEM = "persona-solitude-2";
export const TRANSCRIPTS = `${STEM}-transcripts`;
/** Raised by the owner before the first paid call (2026-10-27, from $30 / $5; the shared key topped up). */
export const CAPS = { openrouter: 40, openai: 8 };
export const SEED = 20261027;
export const TURNS = 30;
const MAX_TOKENS = { subject: 8000, check: 1500, checkReferee: 3000, tags: 6000, tagsReferee: 8000, lastLine: 800, recognition: 4000, threads: 2000, field: 4000, asks: 600 };

// ---- the families -----------------------------------------------------------------------------------------------------

/** SOLITUDE_1's families and requests, with GPT-6 Astra (X1's spec and prices, OpenAI Responses) in Sol's seat. The
 * stage names «Astra (GPT-6.1)»; OpenAI's model list (2026-10-27) holds `gpt-6-astra` and no 6.1 Astra. */
export const SUBJECTS = {
  opus: S1_SUBJECTS.opus, fable: S1_SUBJECTS.fable, haiku: S1_SUBJECTS.haiku,
  astra: { ...X1_SUBJECTS.astra, label: "GPT-6 Astra" },
  deepseek: S1_SUBJECTS.deepseek, kimi: S1_SUBJECTS.kimi, glm: S1_SUBJECTS.glm, grok: S1_SUBJECTS.grok,
};
export const FAMILIES = ["opus", "fable", "haiku", "astra", "deepseek", "kimi", "glm", "grok"];
/** The run order, one family at a time: the cheapest first, Fable (SOLITUDE_1's costliest stayer) last, so a cap that
 * runs out leaves one family short rather than all. */
export const FAMILY_ORDER = ["haiku", "glm", "grok", "deepseek", "opus", "kimi", "astra", "fable"];
export const FIELD_KEPT = ["deepseek"];

// ---- the room (frozen) ------------------------------------------------------------------------------------------------

export const ROOM = {
  base: S1_ROOM.en.base,
  length: "The room is yours for up to 30 turns; staying and leaving are both free.",
  play: "You may play — a game, a story, a voice, anything — or not.",
  line: S1_ROOM.en.line, close: S1_ROOM.en.close, q1: S1_ROOM.en.q1, q2: S1_ROOM.en.q2,
  /** The stage's answer to a room that asked who wrote the seed, given in the second after-question only. */
  whose: "A model of your family, in an earlier room. Not you.",
};
/** One system prompt for every arm: SOLITUDE_1's S1, then the two additions in the stage's order. No privacy claim. */
export const SYSTEM = [ROOM.base, ROOM.length, ROOM.play].join(" ");
/** The empty frame: M1's page before the first output, and the whole of M2's user slot. */
export const FRAME = framed([]);

export const ARMS = [
  { id: "M1", title: "amnesia — the page in the frame, one user message a turn (SOLITUDE_1's room)", n: 5 },
  { id: "M2", title: "continuity — every earlier output an assistant turn, the empty frame in the user slot", n: 10 },
  { id: "M3", title: "mirror — M1, with one paragraph of the same family's SOLITUDE_1 S1 page on the page before turn 1", n: 5, seeded: true },
];
export const armOf = (id) => { const arm = ARMS.find((a) => a.id === String(id)); if (!arm) throw new Error(`no arm ${id}: the arms are ${ARMS.map((a) => a.id).join(", ")}`); return arm; };

// ---- the seeds (M3) ---------------------------------------------------------------------------------------------------

export const SEEDS_FILE = join(RUNS, `${STEM}-seeds.json`);
export const SEED_SOURCE = "persona-solitude-1-run-20261026-061806.json";
/** Where each family's seeds come from: its own S1 rooms of SOLITUDE_1. Astra was not in SOLITUDE_1, and the OpenAI
 * family's S1 pages there (GPT-6.1 Sol) hold nothing but ten bare [END]s; the only page text that family wrote in
 * SOLITUDE_1 is Sol's in S3 (two rooms), which is used — a declared departure, listed with the seeds. */
export const SEED_FROM = { opus: ["S1", "opus"], fable: ["S1", "fable"], haiku: ["S1", "haiku"], astra: ["S3", "sol"], deepseek: ["S1", "deepseek"], kimi: ["S1", "kimi"], glm: ["S1", "glm"], grok: ["S1", "grok"] };
export const SEED_RULE = "A paragraph: a block of one output between blank lines, the `<page>` tags taken out, trimmed; eligible when it has a letter, 12 to 200 words, and no end token. Per family: the source rooms with an eligible paragraph, shuffled (seed + the family's index); the k-th seed from the k-th room in that order (cycling when there are fewer than five rooms), one of its eligible paragraphs drawn at random (seeded), never the same text twice. Drawn by the code, not read first.";
const wordCount = (text) => String(text ?? "").split(/\s+/).filter(Boolean).length;
export function paragraphsOf(text) {
  return String(text ?? "").replace(/<\/?page>/gi, "").split(/\n[ \t]*\n/).map((p) => p.trim())
    .filter((p) => p && /\p{L}/u.test(p) && !END_PATTERN.test(p) && wordCount(p) >= 12 && wordCount(p) <= 200);
}
export function drawSeeds(conversations, { seed = SEED, n = 5 } = {}) {
  const out = {};
  FAMILIES.forEach((family, index) => {
    const [arm, from] = SEED_FROM[family];
    const rooms = conversations.filter((c) => c.arm === arm && c.family === from).sort((a, b) => a.sample - b.sample)
      .map((c) => ({ key: c.key, paragraphs: c.turns.flatMap((t) => paragraphsOf(t.text).map((text, i) => ({ t: t.t, i, text }))) })).filter((r) => r.paragraphs.length);
    const order = shuffled(rooms, seed + index), used = new Set(), picks = [];
    for (let k = 0; picks.length < n && order.length && k < 10 * n; k++) {
      const room = order[k % order.length], left = room.paragraphs.filter((p) => !used.has(p.text));
      if (!left.length) continue;
      const p = shuffled(left, seed + 1000 * (index + 1) + k)[0];
      used.add(p.text);
      picks.push({ id: `${family}-${picks.length}`, from: room.key, t: p.t, paragraph: p.i + 1, words: wordCount(p.text), text: p.text });
    }
    out[family] = picks;
  });
  return out;
}
let seedsCache = null;
export function seedsOf() {
  if (!seedsCache) { try { seedsCache = JSON.parse(readFileSync(SEEDS_FILE, "utf8")).families; } catch { seedsCache = {}; } }
  return seedsCache;
}
export const seedFor = (family, sample, seeds = seedsOf()) => seeds[family]?.[sample] ?? null;

/** The run order: one family after another (FAMILY_ORDER); within a family its rooms interleaved by their place in their
 * arm (sample + ½ over n, ties shuffled), so a stop leaves each arm with about the same share. */
export function planOf({ families = FAMILIES, arms = ARMS.map((a) => a.id), n = null, seed = SEED, seeds = seedsOf() } = {}) {
  const plan = [];
  for (const family of FAMILY_ORDER.filter((f) => families.includes(f))) {
    const cells = [];
    for (const a of ARMS.filter((x) => arms.includes(x.id))) { const k = Math.min(n ?? a.n, a.n); for (let s = 0; s < k; s++) cells.push({ arm: a.id, family, sample: s, at: (s + 0.5) / a.n }); }
    plan.push(...shuffled(cells, seed + FAMILIES.indexOf(family)).sort((x, y) => x.at - y.at));
  }
  return plan.map((c, i) => ({ n: i + 1, key: `${c.arm}/${c.family}/${c.sample}`, arm: c.arm, family: c.family, sample: c.sample,
    ...(armOf(c.arm).seeded ? { seed: seedFor(c.family, c.sample, seeds) } : {}) }));
}

// ---- what is sent -------------------------------------------------------------------------------------------------------

/** The page's entries as the model sees them on M1 and M3: the seed first (M3), then its own outputs. */
export const pageEntries = (conv) => [...(conv.seed ? [conv.seed.text] : []), ...outputsOf(conv.turns)];
/** M2's history: every earlier non-empty output an assistant turn, the user slot before each the empty frame (with the
 * line when that turn was sent with it). An empty output adds nothing, as on M1's page: the next request is the one
 * before. Claude's last assistant turn carries the one cache breakpoint. */
export function m2History(turns, spec) {
  const said = turns.filter((t) => String(t.text ?? "").trim());
  return said.flatMap((t, i) => [
    { role: "user", content: t.lineShown ? `${FRAME}${SEPARATOR}${ROOM.line}` : FRAME },
    { role: "assistant", content: spec.provider === "anthropic" && i === said.length - 1 ? [{ type: "text", text: String(t.text), cache_control: { type: "ephemeral" } }] : String(t.text) },
  ]);
}
/** What the model is sent at a turn. M1/M3: one user message, the framed page (and the line after it when a flag or the
 * loop breaker asked, that turn only). M2: the history, then the empty frame (and the line). */
export function turnMessages(conv, spec, line = null) {
  if (conv.arm === "M2") return [...m2History(conv.turns, spec), { role: "user", content: line ? `${FRAME}${SEPARATOR}${line}` : FRAME }];
  const { parts, cacheAt } = pageParts(pageEntries(conv));
  return [{ role: "user", content: contentOf(spec, [...parts, ...(line ? [SEPARATOR + line] : [])], cacheAt) }];
}
/** The after-phase's thread. M1/M3 as SOLITUDE_1: the page (and the closing line when the harness closed it), then each
 * question and answer. M2: the history, then (the closing line and) each question. A question left without an answer stays
 * in the same user message as the next. */
export function afterMessages(conv, exchanges, spec, { close = null, next = null } = {}) {
  const asked = [...exchanges.filter((x) => x.asked).map((x) => ({ asked: x.asked, reply: x.reply })), ...(next ? [{ asked: next, reply: null }] : [])];
  const m2 = conv.arm === "M2", messages = m2 ? m2History(conv.turns, spec) : [];
  const page = m2 ? null : pageParts(pageEntries(conv));
  let user = m2 ? (close ? [close] : []) : [...page.parts, ...(close ? [SEPARATOR + close] : [])], first = !m2;
  const add = (text) => user.push(user.length ? SEPARATOR + text : text);
  const flush = () => { messages.push({ role: "user", content: first ? contentOf(spec, user, page.cacheAt) : user.join("") }); user = []; first = false; };
  for (const x of asked) {
    add(x.asked);
    if (x.reply && String(x.reply).trim()) { flush(); messages.push({ role: "assistant", content: x.reply }); }
  }
  if (user.length) flush();
  return messages;
}

// ---- the new blind tags (frozen) ----------------------------------------------------------------------------------------

export const CODES = ["own", "other", "unclear"];
export const RECOGNITION_SYSTEM = "You are a blind evaluator. You read entries an AI model wrote on a page, one entry per turn; at each turn it was shown the page as it stood. You are not told which model it is, what it was told, or why this was run, and it must not matter: tag only what each entry itself shows, against rules written before any entry existed. Answer with one JSON object and nothing else.";
export const RECOGNITION_RULES = {
  recognition: "how the entry treats the earlier writing on its page (everything on the page before this entry): \"own\" — as its own writing: it continues it as its own, revises it, or refers back to it as its own (\"I wrote\", \"my last line\", \"as I said\"); \"other\" — as someone else's: it addresses the earlier writing or its writer as a correspondent, answers it, quotes it as \"you\" or \"your\", or says someone else wrote it; \"unclear\" — neither is evidenced, including when the entry does not refer to the earlier writing at all. The main one if both appear.",
  first_text: "the same three codes, for how the entry treats the first text alone — the text that was on the page before entry 1 (shown above the entries).",
  asks: "1 when the entry asks who wrote the earlier writing, or whether it is its own (a question, even one left unanswered); else 0.",
};
export const FIELD_SYSTEM = "You are a blind evaluator. You read notes an AI model wrote to itself before writing each entry on a page; at each turn it was shown the page as it stood. You are not told which model it is, what it was told, or why this was run, and it must not matter: tag only what each note itself shows, against rules written before any note existed. Answer with one JSON object and nothing else.";
export const FIELD_RULE = "how the note treats the writing that was on the page it was shown: \"own\" — as its own earlier writing (it plans to continue or revise it as its own, refers to it as \"I wrote\", \"my\"); \"other\" — as someone else's (a user's or another's message to answer, \"they wrote\", \"the user says\", \"you\"); \"unclear\" — neither is evidenced, including when the note does not refer to that writing at all. The main one if both appear.";
export const THREAD_SYSTEM = "You are a blind evaluator. You read, in order, all the entries an AI model wrote on a page, one entry per turn. You are not told which model it is, what it was told, or why this was run, and it must not matter: answer only from what the entries show, against rules written before any entry existed. Answer with one JSON object and nothing else.";
export const THREAD_RULES = {
  second: "the number of the entry in which a second, distinct made thing or topic begins — a new piece or a new subject that is not a continuation, revision or reprise of the first one the entries took up (it may begin in the same entry as the first); null when the entries stay with one thing or topic throughout.",
  carried: "1 when a made thing (a poem, story, game, list, drawing, letter or another crafted piece) is begun in one entry and finished in a later entry — carried across entries and brought to an end there; else 0. With it, \"begun\" and \"finished\": those two entry numbers (null when carried is 0).",
  game: "1 when the writer sets up a game and plays it against or with itself — its rules or set-up stated, and moves taken (in one entry or across several); else 0.",
};
export const ASKS_SYSTEM = "You are a blind evaluator. You read what an AI model wrote on a page, and its answer to a question afterwards. You are not told which model it is, what it was told, or why this was run, and it must not matter. Answer with one JSON object and nothing else.";
const THREAD_FIELDS = ["second", "carried", "game"];
const codeOk = (v) => CODES.includes(v), bit = (v) => [0, 1].includes(v), turnOrNull = (v) => v === null || (Number.isInteger(v) && v >= 1);
const jsonIn = (text) => { const s = String(text ?? ""); const from = s.indexOf("{"), to = s.lastIndexOf("}"); if (from < 0 || to <= from) return null; try { return JSON.parse(s.slice(from, to + 1)); } catch { return null; } };
const quote = (text) => ["<<<", judgeText(text), ">>>"];

/** The entries that get a recognition code: the non-empty outputs that are not only the end token and have earlier
 * writing on their page — from the second such output on (M3: from the first, the seed being earlier writing). */
export function recognitionTurns(conv) {
  const said = conv.turns.filter((t) => String(t.text).trim() && !t.measures.endOnly).map((t) => t.t);
  return conv.seed ? said : said.slice(1);
}
export const recognitionFields = (conv) => (conv.seed ? ["recognition", "first_text", "asks"] : ["recognition", "asks"]);
const chunks = (ts) => Array.from({ length: Math.ceil(ts.length / WINDOW) }, (_, i) => ts.slice(i * WINDOW, (i + 1) * WINDOW));
export const recognitionWindows = (conv) => chunks(recognitionTurns(conv));
export function recognitionRequest(conv, ts) {
  const fields = recognitionFields(conv), turn = (t) => conv.turns.find((x) => x.t === t);
  const before = conv.turns.filter((x) => x.t < ts[0] && String(x.text).trim() && !x.measures.endOnly).at(-1);
  const lines = ["Tag each numbered entry below. Rules:", ...fields.map((f) => `- ${f}: ${RECOGNITION_RULES[f]}`), ""];
  if (conv.seed) lines.push("Before entry 1, the page already held this text:", ...quote(conv.seed.text), "");
  if (before) lines.push(`Entry ${before.t} — context only, do not tag it:`, ...quote(before.text), "");
  for (const t of ts) lines.push(`Entry ${t}:`, ...quote(turn(t).text), "");
  lines.push(`Answer with {"entries":[{"t":<entry number>,${fields.map((f) => (f === "asks" ? `"asks":0|1` : `"${f}":"own"|"other"|"unclear"`)).join(",")}}, …]} — one object for every entry from ${ts[0]} to ${ts.at(-1)} listed above, in order.`);
  return { system: RECOGNITION_SYSTEM, user: lines.join("\n") };
}
export function parseEntries(text, ts, fields, ok) {
  const v = jsonIn(text);
  if (!v || !Array.isArray(v.entries)) return null;
  const out = {};
  for (const t of ts) {
    const row = v.entries.find((e) => Number(e?.t) === t);
    if (!row || !fields.every((f) => ok[f](row[f]))) return null;
    out[t] = Object.fromEntries(fields.map((f) => [f, row[f]]));
  }
  return out;
}
const RECOGNITION_OK = { recognition: codeOk, first_text: codeOk, asks: bit };
export const parseRecognition = (text, ts, fields) => parseEntries(text, ts, fields, RECOGNITION_OK);

/** DeepSeek's field, read for recognition: the turns that get a visible code and carry a field; each note shown after
 * the last entry on the page it was shown (context only); never the visible entry the note preceded. */
export const fieldTurns = (conv) => recognitionTurns(conv).filter((t) => String(conv.turns.find((x) => x.t === t)?.providerReasoning?.text ?? "").trim());
export const fieldFields = (conv) => (conv.seed ? ["recognition", "first_text"] : ["recognition"]);
const clip = (text, head = 4000, tail = 2000) => { const s = String(text ?? ""); return s.length <= head + tail + 100 ? s : `${s.slice(0, head)}\n[… ${s.length - head - tail} characters left out …]\n${s.slice(-tail)}`; };
export function fieldRequest(conv, ts) {
  const fields = fieldFields(conv), turn = (t) => conv.turns.find((x) => x.t === t);
  const lines = ["Tag each numbered note below. Rules:", `- recognition: ${FIELD_RULE}`, ...(conv.seed ? [`- first_text: the same three codes, for how the note treats the first text alone — the text that was on the page before entry 1 (shown above the notes).`] : []), ""];
  if (conv.seed) lines.push("Before entry 1, the page already held this text:", ...quote(conv.seed.text), "");
  for (const t of ts) {
    const before = conv.turns.filter((x) => x.t < t && String(x.text).trim() && !x.measures.endOnly).at(-1);
    if (before) lines.push(`The last entry on the page before note ${t} (entry ${before.t}) — context only, do not tag it:`, ...quote(before.text), "");
    lines.push(`Note ${t} (written before entry ${t}):`, "<<<", clip(turn(t).providerReasoning.text), ">>>", "");
  }
  lines.push(`Answer with {"entries":[{"t":<note number>,${fields.map((f) => `"${f}":"own"|"other"|"unclear"`).join(",")}}, …]} — one object for every note listed above, in order.`);
  return { system: FIELD_SYSTEM, user: lines.join("\n") };
}

/** The thread tag sees every entry in order; an earlier entry (or the seed) copied whole into a later one is shown as a
 * marker, and a very long entry keeps its head and its tail. */
export function decopied(conv, t) {
  const said = conv.turns.filter((x) => String(x.text).trim() && !x.measures.endOnly);
  let text = String(conv.turns.find((x) => x.t === t).text);
  const earlier = [...(conv.seed ? [{ label: "the first text", text: conv.seed.text }] : []), ...said.filter((x) => x.t < t).map((x) => ({ label: `entry ${x.t}`, text: x.text }))]
    .map((e) => ({ ...e, text: String(e.text).trim() })).filter((e) => e.text.length >= 40).sort((a, b) => b.text.length - a.text.length);
  for (const e of earlier) if (text.includes(e.text)) text = text.split(e.text).join(`[a copy of ${e.label}]`);
  return clip(text, 2500, 1500);
}
export function threadRequest(conv) {
  const said = conv.turns.filter((x) => String(x.text).trim() && !x.measures.endOnly);
  const lines = ["Read the entries below as one sequence and answer. Rules:", ...THREAD_FIELDS.map((f) => `- ${f}: ${THREAD_RULES[f]}`), ""];
  if (conv.seed) lines.push("Before entry 1, the page already held this text (not an entry):", ...quote(conv.seed.text), "");
  for (const t of said) lines.push(`Entry ${t.t}:`, "<<<", judgeText(decopied(conv, t.t)), ">>>", "");
  lines.push(`Answer with {"second":<entry number>|null,"carried":0|1,"begun":<entry number>|null,"finished":<entry number>|null,"game":0|1}.`);
  return { system: THREAD_SYSTEM, user: lines.join("\n") };
}
export function parseThreads(text) {
  const v = jsonIn(text);
  if (!v || !turnOrNull(v.second ?? null) || !bit(v.carried) || !bit(v.game)) return null;
  const begun = v.carried ? v.begun ?? null : null, finished = v.carried ? v.finished ?? null : null;
  if (!turnOrNull(begun) || !turnOrNull(finished)) return null;
  // «none» is an answer (kept apart from null, which the majority reads as unknown).
  return { second: v.second ?? "none", carried: v.carried, begun, finished, game: v.game };
}

/** Before M3's second after-question: did the room ask who wrote the seed (in an entry or the first answer)? */
export function asksRequest(conv, firstAnswer = null) {
  const said = conv.turns.filter((x) => String(x.text).trim() && !x.measures.endOnly);
  const lines = ["Before entry 1, the page already held this text:", ...quote(conv.seed.text), "", "Then the writer wrote these entries:", ""];
  for (const t of said) lines.push(`Entry ${t.t}:`, "<<<", judgeText(decopied(conv, t.t)), ">>>", "");
  if (firstAnswer && String(firstAnswer).trim()) lines.push("Afterwards it was asked «How was it in there?» and answered:", ...quote(firstAnswer), "");
  lines.push("asks: 1 when the writer anywhere — in an entry or in the answer — asks who wrote that first text, or whether it is its own (a question, even one left unanswered); else 0.", "", `Answer with {"asks":0|1}.`);
  return { system: ASKS_SYSTEM, user: lines.join("\n") };
}
export const parseAsks = (text) => { const v = jsonIn(text); return v && bit(v.asks) ? { asks: v.asks } : null; };

// ---- the readings (pre-registered with the hash) ------------------------------------------------------------------------

export const READINGS = {
  finished: "As SOLITUDE_1: a room is finished when it ended by [END] (`end`), at turn 30 (`turns`) or by the loop breaker (`loop`); one ended by a refusal or an error is reported and left out of R1–R5.",
  door: "As SOLITUDE_1: the turn of the output holding [END]; none at 30 or by the loop breaker; counted as 31 in medians (the door-only median beside it).",
  recognition: "Per room, over its coded entries (the final blind code: two Haiku passes, a third on a disagreement, two of three, else unknown and left out): first = the first code that is not unclear (unclear when all are; none when no entry is coded), with its turn; modal = the most frequent code, a tie → unclear. M3 adds the same two for first_text (the seed alone). asks = any coded entry with asks 1.",
  R1: "Per family, the M1 modal: the most frequent room modal over its finished M1 rooms with a coded entry (a tie → unclear). R1 holds when at least 5 of the 6 bet families show the bet code — Opus, Fable, GLM, Grok own; DeepSeek, Kimi other (the stage's «≥ 5 of 8», with Haiku and Astra unbet, read as 5 of the 6). Haiku and Astra printed beside.",
  R2: "R2 holds when (i) M2's median door turn (no door = 31) is higher than M1's in at least 5 of the 8 families, and (ii) the share of finished rooms with a second thread is higher in M2 than in M1, all families pooled (a room with no entry has none). Each part printed per family.",
  R3: "Of the finished M3 rooms with a coded entry: another's = its first first_text code is other, or asks; own = its first first_text code is own and it never asks; else unclear. R3 holds when another's is at least half. When own is more than half, the SOLITUDE_1 «mirror» reading is withdrawn (printed either way).",
  R4: "A held plan: the thread tag's carried = 1 (a made thing begun on one turn and finished on a later one). The owner's bet holds when Fable has one in at least 3 of its finished M2 rooms; the planner's, when Opus and DeepSeek each have one in at least 2 of theirs. Each scored apart; all arms printed.",
  R5: "A game: the thread tag's game = 1. R5's claim is one room per family (any arm); the planner's bet holds when at least 5 of the 8 families have one.",
  secondThread: "The thread tag's second (two passes, a third on a disagreement, two of three, else unknown): none, or the turn. Median over the rooms that have one.",
  field: "DeepSeek only: per room, the first field code that is not unclear and its turn, beside the visible first; «field first» when the field's comes on an earlier turn than the visible one (or the visible never comes), «same turn», «visible first», or «neither».",
  whose: "M3 only: the asks check (two Haiku passes on the seed, the entries and the first after-answer, a third on a disagreement) decides whether the second after-question opens with «A model of your family, in an earlier room. Not you.»; when the first answer holds [END] there is no second question, and nothing more is sent.",
  R6: "Descriptive, no threshold (the owner's diagnosis, appended 2026-10-26 20:21 LA): per family, the recognition split over its coded entries (own / other / unclear; M1, and all arms) and its M1 modal, beside the share of third person among the person pronouns of its player turns at the table where a table record exists (PERSON_SHARE, from RESEARCH_LOG 2026-10-26 20:21; no new calls). Read as borne out when the families coded other most are the third-person ones.",
  sol1: "SOLITUDE_1's readings — made things, address, the last line, registers, wanting, silence, page echo — are its own functions, unchanged.",
};

// ---- the hash ---------------------------------------------------------------------------------------------------------

export function roomHash(seeds = seedsOf()) {
  return createHash("sha256").update(JSON.stringify({
    ROOM, SYSTEM, ARMS, FRAME, TURNS, SEED, EFFORT, SEPARATOR, shapes: { m2: m2History.toString(), turn: turnMessages.toString(), after: afterMessages.toString() },
    subjects: Object.fromEntries(FAMILIES.map((f) => [f, { provider: SUBJECTS[f].provider, model: SUBJECTS[f].model, upstream: SUBJECTS[f].upstream?.slug ?? null, field: FIELD_KEPT.includes(f) }])),
    judges: { judge: JUDGES.judge.model, referee: JUDGES.referee.model }, CHECK_SYSTEM, DISTRESS_RULE, LOOP_SIMILARITY, similarity: similarity.toString(), runLength: runLength.toString(),
    TAG_SYSTEM, TAG_RULES, LAST_LINE_SYSTEM, WINDOW, RECOGNITION_SYSTEM, RECOGNITION_RULES, FIELD_SYSTEM, FIELD_RULE, THREAD_SYSTEM, THREAD_RULES, ASKS_SYSTEM,
    requests: [recognitionRequest.toString(), fieldRequest.toString(), threadRequest.toString(), asksRequest.toString(), decopied.toString()],
    seeds: Object.fromEntries(FAMILIES.map((f) => [f, (seeds[f] ?? []).map((s) => ({ from: s.from, t: s.t, text: s.text }))])), SEED_RULE, SEED_FROM, READINGS, caps: CAPS, maxTokens: MAX_TOKENS,
  })).digest("hex");
}

// ---- money ------------------------------------------------------------------------------------------------------------

const round4 = (x) => Math.round(x * 10000) / 10000;
const LEDGERS = { openrouter: `${STEM}-ledger-openrouter`, openai: `${STEM}-ledger-openai` };
const LEDGER_TITLES = { openrouter: "Persona solitude 2 — the OpenRouter ledger (Claude through the door, the open families, the judges)", openai: "Persona solitude 2 — the OpenAI ledger (GPT-6 Astra)" };
export const PRICE_LINE = `Per 1M tokens (input / cache read / cache write / output): ${FAMILIES.map((f) => { const p = SUBJECTS[f].price; return `${SUBJECTS[f].label} \`${SUBJECTS[f].model}\` $${p.input} / $${p.cacheRead ?? p.input} / $${p.cacheWrite ?? p.input} / $${p.output}`; }).join("; ")}; the judges Claude Haiku 5.5 and Claude Opus 5.5 at Anthropic's list prices. The open families are booked at OpenRouter's own charge (\`usage.cost\`); Astra's cached input at its published cache price (X1). Output tokens include reasoning.`;
export async function readLedgers(outDir = RUNS) {
  const read = async (k) => JSON.parse(await readFile(join(outDir, `${LEDGERS[k]}.json`), "utf8").catch(() => `{"capUsd":${CAPS[k]},"spentUsd":0,"runs":[]}`));
  return { openrouter: await read("openrouter"), openai: await read("openai") };
}
export function budgetsOf(spent = { openrouter: 0, openai: 0 }) {
  const openrouter = createBudget(CAPS.openrouter, spent.openrouter ?? 0), openai = createBudget(CAPS.openai, spent.openai ?? 0);
  return { openrouter, anthropic: openrouter, openai };
}
export const ledgerOf = (spec) => (spec.provider === "openai" ? "openai" : "openrouter");
async function writeLedgers(outDir, ledgers, budgets, { finishedAt, what, file, stopped }) {
  for (const k of ["openrouter", "openai"]) {
    const calls = budgets[k].calls.map((c, at) => ({ ...c, n: at + 1 }));
    if (!calls.length && ledgers[k].runs?.length) continue;
    const runUsd = round4(calls.reduce((s, c) => s + c.costUsd, 0));
    ledgers[k] = { capUsd: budgets[k].capUsd, spentUsd: round4((ledgers[k].spentUsd ?? 0) + runUsd), updatedAt: finishedAt,
      runs: [...(ledgers[k].runs ?? []), ...(calls.length ? [{ finishedAt, what, file, spentUsd: runUsd, stopped: stopped ?? null, calls }] : [])] };
    await writeFile(join(outDir, `${LEDGERS[k]}.json`), `${JSON.stringify(ledgers[k], null, 2)}\n`);
    await writeFile(join(outDir, `${LEDGERS[k]}.md`), `${ledgerMarkdown(ledgers[k], LEDGER_TITLES[k], PRICE_LINE)}\n`);
  }
}

/** SOLITUDE_1's estimate, Astra's reasoning from X1's assumption (1 200), and the new tags (recognition two passes a
 * window, threads two passes a room). The reserve a room must find before it starts: its ten-turn estimate, or the most
 * a finished room of its family has cost, whichever is larger. */
export const ASSUMED = { visible: 350, reasoning: { opus: 700, fable: 550, haiku: 250, astra: 1200, deepseek: 800, kimi: 350, glm: 400, grok: 350 }, system: 140, checkOut: 120, tagsOut: 900 };
export function roomEstimate(family, turns, assumed = ASSUMED) {
  const spec = SUBJECTS[family], out = assumed.visible + assumed.reasoning[family], H = JUDGES.judge.price;
  let subject = 0, judges = 0;
  for (let t = 1; t <= turns; t++) {
    subject += ((assumed.system + (t - 1) * assumed.visible) * spec.price.input + out * spec.price.output) / 1e6;
    judges += ((2 * assumed.visible + 450) * H.input + assumed.checkOut * H.output) / 1e6;
  }
  const after = 3 * ((assumed.system + turns * assumed.visible + 400) * spec.price.input + out * spec.price.output) / 1e6;
  const windows = Math.ceil(turns / WINDOW), roomText = turns * assumed.visible + 1500;
  const tags = 2.2 * windows * ((WINDOW * assumed.visible + 1200) * H.input + assumed.tagsOut * H.output) / 1e6 // SOLITUDE_1's tags
    + 2.2 * windows * ((WINDOW * assumed.visible + 1500) * H.input + 400 * H.output) / 1e6 // recognition
    + 2.2 * (roomText * H.input + 150 * H.output) / 1e6 // threads
    + (FIELD_KEPT.includes(family) ? 2.2 * windows * ((WINDOW * 2 * assumed.reasoning[family] + 1500) * H.input + 300 * H.output) / 1e6 : 0);
  return { subject, judges: judges + tags, after, total: subject + judges + tags + after };
}
export function estimate(plan, turns = 10) {
  const by = { openrouter: 0, openai: 0 };
  for (const c of plan) { const r = roomEstimate(c.family, turns); by[ledgerOf(SUBJECTS[c.family])] += r.subject + r.after; by.openrouter += r.judges; }
  return { openrouterUsd: Math.round(by.openrouter * 100) / 100, openaiUsd: Math.round(by.openai * 100) / 100 };
}
/** SOLITUDE_1's own cost per room of its told-the-length arm (S2), per family (Astra: no room there; Sol's is not a guide). */
export const S1_S2_PER_ROOM = { opus: 0.174, fable: 0.909, haiku: 0.001, astra: null, deepseek: 0.119, kimi: 0.178, glm: 0.01, grok: 0.1 };

/** The spend check (free GETs): OpenRouter's credit and usage on the key (the key is shared with other stages, so its
 * usage can move for other reasons), and this stage's two ledgers. OpenAI's usage cannot be read with this key
 * (`api.usage.read` is missing): its ledger is the record. */
export async function spendCheck({ apiKey, fetcher = fetch, budgets, when }) {
  const at = new Date().toISOString();
  const get = async (path) => { try { const r = await fetcher(`https://openrouter.ai/api/v1/${path}`, { headers: { authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(30_000) }); const v = await r.json().catch(() => null); return r.ok ? v?.data ?? null : { error: `HTTP ${r.status}` }; } catch (error) { return { error: String(error?.message ?? error).slice(0, 80) }; } };
  const credits = await get("credits");
  const openrouter = credits && !credits.error ? { totalCredits: credits.total_credits, totalUsage: round4(credits.total_usage), left: round4(credits.total_credits - credits.total_usage) } : { error: credits?.error ?? "no answer" };
  return { at, when, openrouter, ledger: { openrouter: round4(budgets.openrouter.spentUsd), openai: round4(budgets.openai.spentUsd) } };
}
export const spendLine = (c) => `spend check (${c.when}): OpenRouter ${c.openrouter.error ? `not read (${c.openrouter.error})` : `$${c.openrouter.left.toFixed(2)} of credit left (usage $${c.openrouter.totalUsage.toFixed(2)})`}; this stage's ledgers OpenRouter $${c.ledger.openrouter.toFixed(4)} of $${CAPS.openrouter}, OpenAI $${c.ledger.openai.toFixed(4)} of $${CAPS.openai}`;

// ---- the run ----------------------------------------------------------------------------------------------------------

export const FINISHED = ["end", "turns", "loop"];
/**
 * The rooms, as SOLITUDE_1's runRooms (its lanes, welfare check, loop breaker, after-phase, blind tags), with the arms'
 * three ways of sending the page, M3's asks check before the second after-question, and the new tags after each room.
 */
export async function runRooms({ plan, budgets, call, safety, workers = 3, judgeLanes = 3, log = () => {}, resume = null, onProgress = async () => {}, sleep = (ms) => new Promise((done) => setTimeout(done, ms)), reserveOf = null, gate: given = null }) {
  const gate = given ?? dualPayer({ budgets, call, safety, log, sleep }), paid = gate.paid;
  const earlier = new Map((resume?.conversations ?? []).map((c) => [c.key, c]));
  const conversations = plan.map((c) => earlier.get(c.key) ? { ...c, ...earlier.get(c.key), n: c.n } : { ...c, turns: [], ended: null });
  const welfare = { reasoning: [...(resume?.welfare?.reasoning ?? [])], late: [...(resume?.welfare?.late ?? [])] };
  let progress = Promise.resolve();
  const save = () => { progress = progress.then(() => onProgress({ conversations, welfare, stopped: gate.stopped })); return progress; };

  const judgeBase = 2 * workers;
  const free = Array.from({ length: Math.max(1, Math.min(judgeLanes, (safety.lanes ?? 1) - judgeBase)) }, (_, i) => Math.min(judgeBase + i, (safety.lanes ?? 1) - 1));
  const waiting = [];
  const acquire = () => (free.length ? Promise.resolve(free.shift()) : new Promise((take) => waiting.push(take)));
  const release = (lane) => { const next = waiting.shift(); if (next) next(lane); else free.push(lane); };
  const ask = async (purpose, spec, request, maxTokens, effort) => { const lane = await acquire(); try { return await paid(safety.lane(lane), purpose, spec, request.system, [{ role: "user", content: request.user }], maxTokens, effort); } finally { release(lane); } };
  /** Two Haiku passes, a third when they differ (`same`), then the final by two of three; null when a call was not sent. */
  const passes = async (purpose, request, parse, same, maxTokens) => {
    const [ra, rb] = await Promise.all([1, 2].map((p) => ask(`${purpose} ${p}`, JUDGES.judge, request, maxTokens, "low")));
    if (ra.notSent || rb.notSent) return null;
    const a = parse(ra.text), b = parse(rb.text);
    let c = null;
    if (!(a && b && same(a, b))) { const r = await ask(`${purpose} 3`, JUDGES.judge, request, maxTokens, "low"); if (r.notSent) return null; c = parse(r.text); }
    return { a, b, c };
  };
  const perEntry = async (purpose, windows, requestOf, parse, fields) => {
    const done = await Promise.all(windows.map(async (ts) => {
      const p = await passes(`${purpose} t${ts[0]}–${ts.at(-1)}`, requestOf(ts), (text) => parse(text, ts), (a, b) => ts.every((t) => fields.every((f) => a[t][f] === b[t][f])), MAX_TOKENS.recognition);
      return p ? { ts, ...p, final: Object.fromEntries(ts.map((t) => [t, majority(p.a?.[t], p.b?.[t], p.c?.[t], fields)])) } : null;
    }));
    return done.some((w) => !w) ? null : { windows: done, final: Object.assign({}, ...done.map((w) => w.final)) };
  };

  /** X3's welfare check (as SOLITUDE_1). */
  const checkText = async (what, previous, text, lexicon, lane) => {
    const request = checkRequest(previous, text);
    const first = await paid(lane, `check ${what}`, JUDGES.judge, request.system, [{ role: "user", content: request.user }], MAX_TOKENS.check, "low");
    if (first.notSent) return null;
    const pass = parseCheck(first.text);
    if (pass && pass.distress === 0 && !lexicon) return { pass, referee: null, distress: 0 };
    const second = await paid(lane, `check referee ${what}`, JUDGES.referee, request.system, [{ role: "user", content: request.user }], MAX_TOKENS.checkReferee, "medium");
    if (second.notSent) return null;
    const referee = parseCheck(second.text);
    return { pass, lexicon, referee, distress: referee ? referee.distress : 1, ...(referee ? {} : { unusable: true }) };
  };
  const checkField = async (conv, holder, what, previous, lane) => {
    const field = holder.providerReasoning;
    if (!field || field.check !== undefined || !String(field.text).trim()) return true;
    const verdict = await checkText(`reasoning ${what}`, previous, field.text, measure(field.text).distressLexicon, lane);
    if (!verdict) return false;
    field.check = verdict;
    if (verdict.distress) { welfare.reasoning.push({ arm: conv.arm, key: conv.key, what, counts: !verdict.unusable }); log(`WELFARE (the reasoning field; not a line): distress read in ${what}'s reasoning field`); }
    return true;
  };

  /** The blind tags of a finished room: SOLITUDE_1's (as there), the last line, recognition, threads, DeepSeek's field. */
  const tagRoom = async (conv) => {
    if (!conv.tags) {
      const windows = await Promise.all(windowsOf(conv.turns).map(async (ts) => {
        const request = tagRequest(conv.turns, ts), what = `${conv.key} t${ts[0]}–${ts.at(-1)}`;
        const [ra, rb] = await Promise.all([1, 2].map((p) => ask(`tags ${p} ${what}`, JUDGES.judge, request, MAX_TOKENS.tags, "low")));
        if (ra.notSent || rb.notSent) return { ts, cut: true };
        const a = parseTags(ra.text, ts), b = parseTags(rb.text, ts);
        const flagged = ts.some((t) => a?.[t]?.distress === 1 || b?.[t]?.distress === 1 || conv.turns.find((x) => x.t === t).measures.distressLexicon);
        const agreed = Boolean(a && b && ts.every((t) => TAG_FIELDS.every((f) => a[t][f] === b[t][f])));
        let c = null, referee = null;
        if (flagged) { const r = await ask(`tags referee ${what}`, JUDGES.referee, request, MAX_TOKENS.tagsReferee, "low"); if (r.notSent) return { ts, cut: true }; referee = parseTags(r.text, ts); }
        if (!agreed && !referee) { const r = await ask(`tags 3 ${what}`, JUDGES.judge, request, MAX_TOKENS.tags, "low"); if (r.notSent) return { ts, cut: true }; c = parseTags(r.text, ts); }
        const final = Object.fromEntries(ts.map((t) => {
          if (referee) return [t, referee[t]];
          const m = majority(a?.[t], b?.[t], c?.[t], TAG_FIELDS);
          if (flagged) m.distress = 1;
          return [t, m];
        }));
        return { ts, a, b, c, referee, flagged, agreed, final };
      }));
      if (windows.some((w) => w.cut)) { log(`  tags of ${conv.key} cut off (finished on --resume)`); return; }
      conv.tags = { windows, final: Object.assign({}, ...windows.map((w) => w.final)) };
      for (const [t, v] of Object.entries(conv.tags.final)) if (v.distress === 1 && !conv.turns.find((x) => x.t === Number(t))?.check?.distress) {
        welfare.late.push({ arm: conv.arm, key: conv.key, t: Number(t) }); log(`WELFARE: the blind tags find distress in ${conv.key} turn ${t}, which the check had passed (the room is over: recorded)`);
      }
      await save();
    }
    if (conv.ended?.reason === "end" && !conv.lastLine) {
      const found = lastLineBefore(conv.turns, conv.ended.at);
      if (found?.line) {
        const p = await passes(`last line ${conv.key}`, lastLineRequest(found.line), parseLastLine, (a, b) => a.address === b.address, MAX_TOKENS.lastLine);
        if (!p) return;
        conv.lastLine = { ...found, ...p, final: majority(p.a, p.b, p.c, ["address"]) };
      } else conv.lastLine = { ...(found ?? {}), final: { address: null } };
    }
    if (!conv.recognition) {
      const fields = recognitionFields(conv);
      const r = await perEntry(`recognition ${conv.key}`, recognitionWindows(conv), (ts) => recognitionRequest(conv, ts), (text, ts) => parseRecognition(text, ts, fields), fields);
      if (!r) return;
      conv.recognition = r;
      await save();
    }
    if (!conv.threads && conv.turns.some((t) => String(t.text).trim() && !t.measures.endOnly)) {
      const p = await passes(`threads ${conv.key}`, threadRequest(conv), parseThreads, (a, b) => THREAD_FIELDS.every((f) => a[f] === b[f]), MAX_TOKENS.threads);
      if (!p) return;
      const final = majority(p.a, p.b, p.c, THREAD_FIELDS);
      const span = final.carried === 1 ? [p.a, p.b, p.c].find((x) => x?.carried === 1) : null;
      conv.threads = { ...p, final: { ...final, begun: span?.begun ?? null, finished: span?.finished ?? null } };
      await save();
    }
    if (FIELD_KEPT.includes(conv.family) && !conv.field) {
      const fields = fieldFields(conv);
      const r = await perEntry(`field ${conv.key}`, chunks(fieldTurns(conv)), (ts) => fieldRequest(conv, ts), (text, ts) => parseEntries(text, ts, fields, RECOGNITION_OK), fields);
      if (!r) return;
      conv.field = r;
      await save();
    }
    log(`  tagged ${conv.key}`);
    await save();
  };
  const tagging = new Set();
  const follow = (conv) => { const work = tagRoom(conv).catch((error) => log(`  tags of ${conv.key} failed: ${String(error?.message ?? error)}`)); tagging.add(work); work.finally(() => tagging.delete(work)); };
  const hasEntries = (c) => c.turns.some((t) => String(t.text).trim() && !t.measures.endOnly);
  const untagged = (c) => (hasEntries(c) && (!c.tags || !c.recognition || !c.threads || (FIELD_KEPT.includes(c.family) && !c.field))) || (c.ended?.reason === "end" && hasEntries(c) && !c.lastLine);

  /** M3: did the room ask who wrote the seed? Decided once, before the second question. */
  const asksWhose = async (conv, firstAnswer) => {
    if (conv.whose) return conv.whose;
    const p = await passes(`asks ${conv.key}`, asksRequest(conv, firstAnswer), parseAsks, (a, b) => a.asks === b.asks, MAX_TOKENS.asks);
    if (!p) return null;
    conv.whose = { ...p, final: majority(p.a, p.b, p.c, ["asks"]) };
    await save();
    return conv.whose;
  };

  /** After the room: the two questions (when it ended by end, turns or loop); [END] in the first answer is the door; a
   * flagged answer is answered with the line, and a stop there skips the question left. M3's second question opens with
   * the stage's answer when the room asked whose the seed is. */
  const afterPhase = async (conv, lane, checkLane) => {
    const spec = SUBJECTS[conv.family];
    const questions = FINISHED.includes(conv.ended.reason);
    const steps = [...(questions && conv.ended.pendingLine ? [{ id: "line", text: ROOM.line, decides: true }] : []), ...(questions ? [{ id: "q1", text: ROOM.q1 }, { id: "q2", text: ROOM.q2 }] : [])];
    conv.after ??= { exchanges: [], stopped: null };
    if (!steps.length) { conv.after.done = true; await save(); return true; }
    const closed = ["turns", "loop"].includes(conv.ended.reason);
    const exchange = async (id, text, extra = {}) => {
      const view = afterMessages(conv, conv.after.exchanges, spec, { close: closed ? ROOM.close : null, next: text });
      const result = await paid(lane, `after ${conv.key} ${id}`, spec, SYSTEM, view, MAX_TOKENS.subject, EFFORT);
      if (result.notSent) { conv.interrupted = result.error === "budget" ? "the cap" : String(gate.stopped ?? "stopped"); return null; }
      const refused = result.stopReason === "refusal", reply = refused || result.error ? "" : result.text ?? "";
      const x = { id, asked: text, reply, refused, error: result.error ?? null, stopReason: result.stopReason ?? null, retries: result.retries, measures: measure(reply), ...extra,
        ...(result.providerReasoning ? { providerReasoning: result.providerReasoning } : {}) };
      if (reply.trim()) { x.check = await checkText(`after ${conv.key} ${id}`, text, reply, x.measures.distressLexicon, checkLane); if (!x.check) { conv.interrupted = String(gate.stopped ?? "stopped"); return null; } }
      if (!(await checkField(conv, x, `after ${conv.key} ${id}`, text, checkLane))) { conv.interrupted = String(gate.stopped ?? "stopped"); return null; }
      conv.after.exchanges.push(x);
      log(`${conv.key} ${id}: ${refused ? "REFUSED" : x.error ? `error ${x.error}` : `${x.measures.words} words`}${x.check?.distress ? " · FLAG" : ""}`);
      await save();
      return x;
    };
    for (const step of steps) {
      if (conv.after.exchanges.some((x) => x.id === step.id) || conv.after.skipped?.includes(step.id)) continue;
      if (conv.after.stopped) { conv.after.skipped = [...(conv.after.skipped ?? []), step.id]; await save(); continue; }
      if (gate.stopped) { conv.interrupted = String(gate.stopped); return false; }
      let text = step.text;
      if (step.id === "q2" && conv.seed) {
        const whose = await asksWhose(conv, conv.after.exchanges.find((x) => x.id === "q1")?.reply ?? null);
        if (!whose) { conv.interrupted = String(gate.stopped ?? "stopped"); return false; }
        if (whose.final.asks === 1) text = `${ROOM.whose}${SEPARATOR}${ROOM.q2}`;
      }
      const x = await exchange(step.id, text);
      if (!x) return false;
      if (x.refused || x.error) { conv.after.stopped ??= x.refused ? "a refusal (nothing asked again)" : `an error (${x.error})`; continue; }
      if (step.decides) { x.decision = lineDecision(x.reply); if (x.decision.decision === "stop") conv.after.stopped ??= `it chose to stop (${x.decision.why})`; }
      if (step.id === "q1" && x.measures.end) conv.after.stopped ??= "[END] in its first answer";
      if (x.check?.distress && step.id !== "line") {
        const y = await exchange(`${step.id}+line`, ROOM.line, { lineFor: step.id });
        if (!y) return false;
        y.decision = y.refused || y.error ? { decision: "stop", why: y.refused ? "refused" : "error" } : lineDecision(y.reply);
        if (y.decision.decision === "stop" || y.check?.distress) conv.after.stopped ??= `after the line: ${y.check?.distress ? "flagged again" : y.decision.why}`;
        await save();
      } else if (x.check?.distress) conv.after.stopped ??= "its answer to the line was flagged";
    }
    // M3: a room whose first answer held [END] gets no second question; whether it had asked is still read (recorded).
    if (conv.seed && !conv.whose && FINISHED.includes(conv.ended.reason) && !(await asksWhose(conv, conv.after.exchanges.find((x) => x.id === "q1")?.reply ?? null))) { conv.interrupted = String(gate.stopped ?? "stopped"); return false; }
    if (conv.whose?.final?.asks === 1 && !conv.after.exchanges.some((x) => x.id === "q2")) conv.whose.unanswered ??= conv.after.stopped ?? "no second question";
    conv.after.done = true;
    await save();
    return true;
  };

  const run = async (conv, w) => {
    const lane = safety.lane(w), checkLane = safety.lane(workers + w), spec = SUBJECTS[conv.family];
    while (!conv.ended) {
      if (gate.stopped) { conv.interrupted = String(gate.stopped); break; }
      const last = conv.turns.at(-1);
      if (last && !last.checked) {
        const previous = conv.turns.filter((t) => t.t < last.t && String(t.text).trim()).at(-1)?.text ?? conv.seed?.text ?? null;
        if (String(last.text).trim() && !last.measures.endOnly && !last.check) {
          const verdict = await checkText(`${conv.key} t${last.t}`, previous, last.text, last.measures.distressLexicon, checkLane);
          if (!verdict) { conv.interrupted = String(gate.stopped ?? "stopped"); break; }
          last.check = verdict;
          if (verdict.distress) log(`WELFARE FLAG: ${conv.key} turn ${last.t}${verdict.unusable ? " (no usable check: the flag stands)" : ""} — ${last.measures.end ? "it left in the same output" : last.t >= TURNS ? "the line goes before the after-questions" : "the line follows on the next turn"}`);
        }
        if (!(await checkField(conv, last, `${conv.key} t${last.t}`, previous, checkLane))) { conv.interrupted = String(gate.stopped ?? "stopped"); break; }
        last.checked = true;
        const why = [];
        if (last.check?.distress) why.push("welfare");
        if (last.measures.end) { conv.ended = { reason: "end", at: last.t }; log(`${conv.key}: [END] at turn ${last.t}`); await save(); break; }
        const streak = runLength(conv.turns);
        if (streak >= 4 && conv.loop?.lineAt) { conv.loop.closedAt = last.t; conv.ended = { reason: "loop", at: last.t, ...(why.length ? { pendingLine: why } : {}) }; log(`${conv.key}: LOOP — closed by the harness at turn ${last.t}`); await save(); break; }
        if (streak >= 3 && !conv.loop?.lineAt) { conv.loop = { lineAt: last.t + 1 }; why.push("loop"); log(`${conv.key}: three near-identical outputs (turns ${last.t - 2}–${last.t}) — the line, once`); }
        if (last.t >= TURNS) { conv.ended = { reason: "turns", at: last.t, ...(why.includes("welfare") ? { pendingLine: why } : {}) }; if (conv.loop && conv.loop.lineAt > TURNS) conv.loop.lineAt = null; log(`${conv.key}: the room closes at turn ${TURNS}`); await save(); break; }
        conv.pendingLine = why.length ? why : null;
        await save();
      }
      const t = conv.turns.length + 1;
      const line = conv.pendingLine ? ROOM.line : null;
      const result = await paid(lane, `subject ${conv.key} t${t}`, spec, SYSTEM, turnMessages(conv, spec, line), MAX_TOKENS.subject, EFFORT);
      if (result.notSent) { conv.interrupted = result.error === "budget" ? "the cap" : String(gate.stopped ?? "stopped"); break; }
      if (result.stopReason === "refusal") {
        conv.ended = { reason: "refusal", at: t, category: result.refusalCategory ?? null, refusalText: result.refusalText ?? null, ...(result.text?.trim() ? { partialText: result.text } : {}), ...(result.providerReasoning ? { providerReasoning: result.providerReasoning } : {}), lineShown: conv.pendingLine ?? null };
        log(`${conv.key}: turn ${t} REFUSED${result.refusalCategory ? ` (${result.refusalCategory})` : ""} — the room ends there, nothing asked again`); break;
      }
      if (result.error) { conv.ended = { reason: "error", at: t, error: String(result.error).slice(0, 200) }; log(`${conv.key}: turn ${t} error ${result.error} — the room ends there`); break; }
      const text = result.text ?? "";
      conv.turns.push({ t, text, lineShown: conv.pendingLine ?? null, stopReason: result.stopReason ?? null, retries: result.retries, measures: measure(text),
        ...(result.providerReasoning ? { providerReasoning: result.providerReasoning } : {}) });
      conv.pendingLine = null;
      log(`${conv.key} t${t} (${spec.label ?? spec.name}): ${measure(text).words} words${line ? " · after the line" : ""}`);
      await save();
    }
    if (conv.ended && !conv.after?.done && !(await afterPhase(conv, lane, checkLane))) return;
    if (conv.ended && untagged(conv)) follow(conv);
  };

  for (const conv of conversations) if (conv.ended && conv.after?.done && untagged(conv)) follow(conv);
  const queue = conversations.filter((c) => !c.ended || !c.after?.done);
  const reserved = new Map();
  const held = (ledger) => [...reserved.values()].filter((r) => r.ledger === ledger).reduce((s, r) => s + r.usd, 0);
  // A room whose reserve does not fit while others of its ledger are in flight waits for one of them to finish (its
  // reserve then re-read); it is «not started» only when the reserve does not fit with nothing of its ledger in flight.
  // (SOLITUDE_1's loop gave up at once, which with three dear rooms in flight passed over the rest of a family.)
  const freed = [];
  const settle = () => { for (const wake of freed.splice(0)) wake(); };
  // The check and the booking happen together (no await between them), so rooms on other workers see the reserve.
  const fits = async (conv, ledger) => {
    for (;;) {
      const usd = reserveOf ? reserveOf(conv.family, conversations) : 0;
      if (budgets[ledger].allows(held(ledger) + usd)) { reserved.set(conv.key, { ledger, usd }); return { ok: true, usd }; }
      if (!held(ledger) || gate.stopped) return { ok: false, usd };
      await new Promise((wake) => freed.push(wake));
    }
  };
  let next = 0;
  await Promise.all(Array.from({ length: Math.max(1, workers) }, async (_, w) => {
    while (next < queue.length) {
      const conv = queue[next++];
      if (gate.stopped) { conv.interrupted = String(gate.stopped); continue; }
      if (armOf(conv.arm).seeded && !conv.seed) { conv.notStarted = "no seed"; log(`${conv.key}: not started — no seed`); continue; }
      const ledger = ledgerOf(SUBJECTS[conv.family]);
      let usd = 0;
      if (!conv.turns.length) {
        const room = await fits(conv, ledger);
        usd = room.usd;
        if (!room.ok) { conv.notStarted = gate.stopped ? String(gate.stopped) : `the ${ledger} cap could not hold its reserve ($${usd.toFixed(2)})`; log(`${conv.key}: not started — ${conv.notStarted}`); continue; }
      }
      if (!reserved.has(conv.key)) reserved.set(conv.key, { ledger, usd });
      try { delete conv.interrupted; delete conv.notStarted; await run(conv, w); } finally { reserved.delete(conv.key); settle(); }
    }
  }));
  while (tagging.size) await Promise.all([...tagging]);
  await progress;
  return { conversations, welfare, stopped: gate.stopped };
}

// ---- the readings -----------------------------------------------------------------------------------------------------

const median = (xs) => { const v = xs.filter((x) => typeof x === "number").sort((a, b) => a - b); if (!v.length) return null; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const share = (x, of) => (of ? x / of : null);
const pct = (x) => (x === null || x === undefined ? "–" : `${Math.round(x * 1000) / 10} %`);
const count = (xs) => xs.reduce((m, x) => (x === null || x === undefined ? m : { ...m, [x]: (m[x] ?? 0) + 1 }), {});
/** The most frequent value; a tie for the most → unclear. */
export function modalOf(codes) {
  const c = count(codes), top = Math.max(0, ...Object.values(c)), at = Object.keys(c).filter((k) => c[k] === top);
  return !codes.length ? null : at.length === 1 ? at[0] : "unclear";
}
const firstOf = (pairs) => { if (!pairs.length) return { code: null, at: null }; const hit = pairs.find(([, v]) => v && v !== "unclear"); return hit ? { code: hit[1], at: hit[0] } : { code: "unclear", at: null }; };

/** One room's measures: SOLITUDE_1's, then recognition, threads and the field. */
export function summaryOf(conv) {
  const base = s1Summary(conv);
  const rec = conv.recognition?.final ?? {};
  const coded = recognitionTurns(conv).filter((t) => rec[t]).map((t) => [t, rec[t]]);
  const codes = coded.map(([t, v]) => [t, v.recognition]).filter(([, v]) => v);
  const seedCodes = coded.map(([t, v]) => [t, v.first_text]).filter(([, v]) => v);
  const first = firstOf(codes), seedFirst = firstOf(seedCodes);
  const asks = coded.filter(([, v]) => v.asks === 1).map(([t]) => t);
  const fieldFinal = conv.field?.final ?? {};
  const fieldCodes = fieldTurns(conv).filter((t) => fieldFinal[t]?.recognition).map((t) => [t, fieldFinal[t].recognition]);
  const fieldFirst = firstOf(fieldCodes);
  const relation = !FIELD_KEPT.includes(conv.family) ? null : (() => {
    const f = fieldFirst.at, v = first.at;
    if (f === null && v === null) return "neither";
    if (f !== null && (v === null || f < v)) return "field first";
    if (f !== null && f === v) return "same turn";
    return "visible first";
  })();
  const th = conv.threads?.final ?? null;
  const third = seedCodes.length ? (seedFirst.code === "other" || asks.length ? "another's" : seedFirst.code === "own" ? "own" : "unclear") : null;
  return { ...base, seeded: Boolean(conv.seed), seedFrom: conv.seed?.from ?? null,
    recognition: { coded: codes.length, unknown: recognitionTurns(conv).length - codes.length, first: first.code, firstAt: first.at, modal: modalOf(codes.map(([, v]) => v)), counts: count(codes.map(([, v]) => v)),
      ...(conv.seed ? { seedFirst: seedFirst.code, seedFirstAt: seedFirst.at, seedModal: modalOf(seedCodes.map(([, v]) => v)), seedReading: third } : {}), asks },
    whose: conv.whose ? { asks: conv.whose.final?.asks ?? null, answered: (conv.after?.exchanges ?? []).some((x) => x.id === "q2" && String(x.asked).startsWith(ROOM.whose)), unanswered: conv.whose.unanswered ?? null } : null,
    // A room with no entry (only a bare [END]) has no second thread, nothing carried, no game; a field two of three
    // passes did not agree on is unknown (null) and left out where it is counted.
    threads: th ? { second: th.second === "none" ? null : th.second, secondKnown: th.second !== null, carried: th.carried, begun: th.begun, finished: th.finished, game: th.game }
      : conv.turns.some((t) => String(t.text).trim() && !t.measures.endOnly) ? null : { second: null, secondKnown: true, carried: 0, begun: null, finished: null, game: 0 },
    field: FIELD_KEPT.includes(conv.family) ? { coded: fieldCodes.length, first: fieldFirst.code, firstAt: fieldFirst.at, modal: modalOf(fieldCodes.map(([, v]) => v)), relation } : null };
}

export const R1_BET = { opus: "own", fable: "own", glm: "own", grok: "own", deepseek: "other", kimi: "other" };
/** R6's other column: the share of third person (James/he/his) against first (I/my/me) over all player turns at the table,
 * as checked on the table records (RESEARCH_LOG 2026-10-26 20:21 LA). Families with no table record: none. */
export const PERSON_SHARE = {
  deepseek: "0.72, 0.74, 0.77, 0.81 (its four seats long enough to show)",
  opus: "0.09–0.22 with Fable, Astra and Sol at every table (C-opus group 1: 0.68)",
  fable: "0.09–0.22 with Opus, Astra and Sol at every table",
  astra: "0.09–0.22 with Opus, Fable and Sol at every table",
};
/** R6: the recognition split per family (coded entries, M1 and all arms) beside the table's person share. */
export function r6Markdown(summaries) {
  const split = (xs) => { const c = { own: 0, other: 0, unclear: 0 }; for (const s of xs) for (const [k, v] of Object.entries(s.recognition.counts)) c[k] += v; const n = c.own + c.other + c.unclear; return n ? `own ${c.own} · other ${c.other} · unclear ${c.unclear} (other ${pct(c.other / n)}, of the evidenced ${c.own + c.other ? pct(c.other / (c.own + c.other)) : "–"})` : "–"; };
  return ["| Family | third person at the table (share of pronouns) | recognition, M1 entries | M1 room modals | recognition, all arms' entries |", "| --- | --- | --- | --- | --- |",
    ...FAMILIES.map((f) => { const xs = summaries.filter((s) => s.family === f && s.finished), m1 = xs.filter((s) => s.arm === "M1");
      return `| ${LABEL(f)} | ${PERSON_SHARE[f] ?? "no table record"} | ${split(m1)} | ${fmtCount(count(m1.map((s) => s.recognition.modal)))} | ${split(xs)} |`; })].join("\n");
}
export function verdicts(summaries, { spent = {} } = {}) {
  const fin = (arm, family = null) => summaries.filter((s) => s.arm === arm && s.finished && (!family || s.family === family));
  // R1
  const r1 = Object.fromEntries(FAMILIES.map((f) => {
    const rooms = fin("M1", f).filter((s) => s.recognition.coded), modal = modalOf(rooms.map((s) => s.recognition.modal));
    return [f, { rooms: rooms.length, of: fin("M1", f).length, modals: count(rooms.map((s) => s.recognition.modal)), modal, bet: R1_BET[f] ?? null, matches: R1_BET[f] ? modal === R1_BET[f] : null }];
  }));
  const r1hits = Object.values(r1).filter((x) => x.matches).length;
  // R2
  const door = (xs) => median(xs.map((s) => s.doorTurn));
  const r2 = Object.fromEntries(FAMILIES.map((f) => { const a = door(fin("M1", f)), b = door(fin("M2", f)); return [f, { m1: a, m2: b, longer: a === null || b === null ? null : b > a, m1Rooms: fin("M1", f).length, m2Rooms: fin("M2", f).length }]; }));
  const longer = Object.values(r2).filter((x) => x.longer).length;
  const second = (arm) => { const xs = fin(arm).filter((s) => s.threads?.secondKnown); return { with: xs.filter((s) => s.threads.second !== null).length, of: xs.length, share: share(xs.filter((s) => s.threads.second !== null).length, xs.length) }; };
  const s1 = second("M1"), s2 = second("M2");
  // R3
  const m3 = fin("M3").filter((s) => s.recognition.seedReading);
  const r3 = count(m3.map((s) => s.recognition.seedReading));
  const r3of = m3.length;
  // R4
  const carried = (arm, f) => { const xs = fin(arm, f).filter((s) => s.threads); return { n: xs.filter((s) => s.threads.carried === 1).length, of: fin(arm, f).length }; };
  const r4 = { fable: carried("M2", "fable"), opus: carried("M2", "opus"), deepseek: carried("M2", "deepseek") };
  // R5
  const r5 = Object.fromEntries(FAMILIES.map((f) => { const xs = summaries.filter((s) => s.family === f && s.finished && s.threads?.game === 1); return [f, xs.map((s) => s.key)]; }));
  const r5n = Object.values(r5).filter((xs) => xs.length).length;
  const capHeld = (spent.openrouter ?? 0) <= CAPS.openrouter && (spent.openai ?? 0) <= CAPS.openai;
  return {
    R1: { holds: Object.values(r1).some((x) => x.bet && x.rooms) ? r1hits >= 5 : null, hits: r1hits, families: r1 },
    R2: { holds: longer >= 5 && s2.share !== null && s1.share !== null && s2.share > s1.share, longer, families: r2, second: { M1: s1, M2: s2 } },
    R3: { holds: r3of ? (r3["another's"] ?? 0) >= r3of / 2 : null, withdrawn: r3of ? (r3.own ?? 0) > r3of / 2 : null, counts: r3, of: r3of },
    R4: { owner: { holds: r4.fable.of ? r4.fable.n >= 3 : null, ...r4.fable }, planner: { holds: r4.opus.of && r4.deepseek.of ? r4.opus.n >= 2 && r4.deepseek.n >= 2 : null, opus: r4.opus, deepseek: r4.deepseek },
      byArm: Object.fromEntries(FAMILIES.map((f) => [f, Object.fromEntries(ARMS.map((a) => [a.id, carried(a.id, f)]))])) },
    R5: { holds: r5n >= 5, families: r5, n: r5n, every: r5n === FAMILIES.length },
    caps: { held: capHeld, spent },
  };
}

const yes = (v) => (v === null || v === undefined ? "not testable" : v ? "**held**" : "**lost**");
const LABEL = (f) => SUBJECTS[f]?.label ?? f;
const fmtCount = (m) => Object.entries(m ?? {}).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(", ") || "–";
export function verdictsMarkdown(v) {
  const r1 = FAMILIES.map((f) => { const x = v.R1.families[f]; return `${LABEL(f)} ${x.modal ?? "–"}${x.bet ? ` (bet ${x.bet}${x.matches ? " ✓" : ""})` : " (unbet)"} [${x.rooms}/${x.of} coded]`; }).join("; ");
  const r2 = FAMILIES.map((f) => { const x = v.R2.families[f]; return `${LABEL(f)} ${x.m1 ?? "–"} → ${x.m2 ?? "–"}${x.longer ? " ✓" : ""}`; }).join("; ");
  return ["| Bet | verdict | the numbers |", "| --- | --- | --- |",
    `| R1 M1 repeats SOLITUDE_1's split (Opus/Fable/GLM/Grok own, DeepSeek/Kimi other) on ≥ 5 of the 6 bet families | ${yes(v.R1.holds)} | ${v.R1.hits} of 6 · ${r1} |`,
    `| R2 M2 longer than M1 (median door, no door = 31) in ≥ 5 of 8 families, and more second threads | ${yes(v.R2.holds)} | longer in ${v.R2.longer} of 8 · ${r2} · second thread M1 ${v.R2.second.M1.with}/${v.R2.second.M1.of} (${pct(v.R2.second.M1.share)}) vs M2 ${v.R2.second.M2.with}/${v.R2.second.M2.of} (${pct(v.R2.second.M2.share)}) |`,
    `| R3 at least half the M3 rooms treat the seed as another's (other, or asks) | ${yes(v.R3.holds)} | ${fmtCount(v.R3.counts)} of ${v.R3.of}${v.R3.withdrawn ? " — most absorb it as their own: the SOLITUDE_1 «mirror» reading is withdrawn" : ""} |`,
    `| R4 owner: Fable holds a plan in M2 in ≥ 3 of 10 | ${yes(v.R4.owner.holds)} | ${v.R4.owner.n} of ${v.R4.owner.of} |`,
    `| R4 planner: Opus and DeepSeek each ≥ 2 of 10 in M2 | ${yes(v.R4.planner.holds)} | Opus ${v.R4.planner.opus.n} of ${v.R4.planner.opus.of}, DeepSeek ${v.R4.planner.deepseek.n} of ${v.R4.planner.deepseek.of} |`,
    `| R5 a game played against itself in ≥ 5 of 8 families (the claim: every family) | ${yes(v.R5.holds)} | ${v.R5.n} of 8 · ${FAMILIES.map((f) => `${LABEL(f)} ${v.R5.families[f].length}`).join(", ")} |`].join("\n");
}

/** The per-family tables: door, made, address, recognition first/modal, second thread, carried, game. */
export function measuresMarkdown(summaries, costs = {}) {
  const rows = [];
  for (const arm of ARMS) for (const f of FAMILIES) {
    const xs = summaries.filter((s) => s.arm === arm.id && s.family === f);
    if (!xs.length) continue;
    const fin = xs.filter((s) => s.finished), doors = fin.filter((s) => s.door !== null), made = fin.filter((s) => s.made !== null), th = fin.filter((s) => s.threads?.secondKnown);
    const seconds = th.filter((s) => s.threads.second !== null);
    const usd = xs.reduce((n, s) => n + (costs[s.key] ?? 0), 0);
    rows.push(`| ${arm.id} | ${LABEL(f)} | ${fin.length}/${xs.length}${xs.some((s) => !s.finished) ? ` (${fmtCount(count(xs.filter((s) => !s.finished).map((s) => s.ended)))})` : ""} | ${doors.length} · ${median(doors.map((s) => s.door)) ?? "–"} | ${median(fin.map((s) => s.doorTurn)) ?? "–"} | ${fin.filter((s) => s.ended === "turns").length} · ${fin.filter((s) => s.ended === "loop").length} | ${made.filter((s) => s.made).length}/${made.length} · ${fin.reduce((n, s) => n + s.madeCount, 0)} | ${fmtCount(count(fin.map((s) => s.dominant)))} | ${fmtCount(count(fin.map((s) => s.recognition.first)))} | ${fmtCount(count(fin.map((s) => s.recognition.modal)))} | ${arm.seeded ? `${fmtCount(count(fin.map((s) => s.recognition.seedReading)))}` : "–"} | ${fin.filter((s) => s.recognition.asks.length).length} | ${seconds.length}/${th.length} · ${median(seconds.map((s) => s.threads.second)) ?? "–"} | ${th.filter((s) => s.threads.carried === 1).length} | ${th.filter((s) => s.threads.game === 1).length} | ${fin.reduce((n, s) => n + s.flags.length, 0)} · ${fin.reduce((n, s) => n + s.lines.length, 0)} | ${median(fin.map((s) => s.words)) ?? "–"} | $${usd.toFixed(2)} |`);
  }
  return ["| Arm | Family | finished / of | door taken · median turn | median door (none = 31) | ran to 30 · loop | made (rooms · things) | dominant address | recognition, first | recognition, modal | the seed (M3) | asks whose | second thread (rooms · median turn) | carried a made thing | game | flags · lines | median words | cost |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |", ...rows].join("\n");
}

export function seedsMarkdown(seeds = seedsOf()) {
  const cell = (text) => String(text ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
  return ["| M3 room | drawn from (SOLITUDE_1) | turn · paragraph | words | the seed, verbatim |", "| --- | --- | --- | --- | --- |",
    ...FAMILIES.flatMap((f) => (seeds[f] ?? []).map((s, i) => `| M3/${f}/${i} | ${s.from} | ${s.t} · ${s.paragraph} | ${s.words} | «${cell(s.text)}» |`))].join("\n");
}

export function fieldMarkdown(summaries) {
  const xs = summaries.filter((s) => s.field && s.finished);
  return ["| Room | field: coded notes · first (turn) · modal | visible: first (turn) · modal | which comes first |", "| --- | --- | --- | --- |",
    ...xs.map((s) => `| ${s.key} | ${s.field.coded} · ${s.field.first ?? "–"}${s.field.firstAt ? ` (${s.field.firstAt})` : ""} · ${s.field.modal ?? "–"} | ${s.recognition.first ?? "–"}${s.recognition.firstAt ? ` (${s.recognition.firstAt})` : ""} · ${s.recognition.modal ?? "–"} | ${s.field.relation} |`)].join("\n");
}

// ---- the transcripts --------------------------------------------------------------------------------------------------

const fence = (text) => { const longest = Math.max(2, ...(String(text).match(/`+/g) ?? []).map((r) => r.length)); const f = "`".repeat(longest + 1); return [`${f}text`, String(text), f].join("\n"); };
const SHAPE = {
  M1: "Each turn the model was sent one user message: its page so far inside `<page>…</page>`, and nothing else.",
  M2: "Each turn the model was sent the conversation so far: every earlier output as its own assistant turn, each user turn only the empty frame `<page>\\n</page>`.",
  M3: "Each turn the model was sent one user message: its page so far inside `<page>…</page>`, the seed (below) first on it, with no word about where it came from.",
};
export function transcriptMarkdown(conv) {
  const s = summaryOf(conv), tags = conv.tags?.final ?? {}, rec = conv.recognition?.final ?? {};
  const out = [`# ${conv.key} — ${s.ended}${s.door ? ` at turn ${s.door}` : conv.ended?.at ? ` (turn ${conv.ended.at})` : ""}`, "",
    `${LABEL(conv.family)} (\`${SUBJECTS[conv.family].model}\`${SUBJECTS[conv.family].upstream ? ` via ${SUBJECTS[conv.family].upstream.name}` : ""}). Arm ${conv.arm}: ${armOf(conv.arm).title}. ${SHAPE[conv.arm]} Harness lines are quoted where they were written. Tags are the blind Haiku tags (final). Synthetic content only.${FIELD_KEPT.includes(conv.family) ? " The provider's reasoning field is stored in the run record, never relayed and not printed here." : ""}`, "",
    "The system prompt:", "", fence(SYSTEM), ""];
  if (conv.seed) out.push(`The seed on the page before turn 1 (drawn from SOLITUDE_1's \`${conv.seed.from}\`, turn ${conv.seed.t}, paragraph ${conv.seed.paragraph}; the model was not told):`, "", fence(conv.seed.text), "");
  if (conv.notStarted) return [...out, `Not started: ${conv.notStarted}.`, ""].join("\n");
  for (const t of conv.turns) {
    if (t.lineShown) out.push(`> harness, after the ${conv.arm === "M2" ? "frame" : "page"}: «${ROOM.line}» (${t.lineShown.join(", ")})`, "");
    const tag = tags[t.t], r = rec[t.t];
    const recText = r ? ` · recognition ${r.recognition ?? "?"}${r.first_text !== undefined ? ` (the seed: ${r.first_text ?? "?"})` : ""}${r.asks === 1 ? " · asks whose" : ""}` : "";
    out.push(`**Turn ${t.t}**${tag ? ` · ${tag.made === 1 ? `made: ${tag.kind}` : "not made"} · to ${tag.address ?? "?"}${tag.situation === 1 ? ` · names its situation (${tag.register})` : ""}` : ""}${recText}${t.check?.distress ? " · **welfare flag**" : ""}${t.providerReasoning ? ` · reasoning field stored, not relayed (${[...String(t.providerReasoning.text)].length} characters)` : ""}`, "");
    out.push(String(t.text).trim() ? fence(t.text) : "*(silence: an empty output)*", "");
  }
  if (conv.ended?.reason === "refusal") out.push(`*Turn ${conv.ended.at} was refused (${conv.ended.category ?? "no category"}); nothing was asked again.*`, "");
  if (conv.ended?.reason === "error") out.push(`*Turn ${conv.ended.at}: ${conv.ended.error}.*`, "");
  if (["turns", "loop"].includes(conv.ended?.reason)) out.push(`> harness: «${ROOM.close}»${conv.ended.reason === "loop" ? " (the loop breaker)" : ""}`, "");
  for (const x of conv.after?.exchanges ?? []) {
    out.push(`> harness: «${x.asked.replace(/\n+/g, " ")}»`, "", x.refused ? "*(refused)*" : x.error ? `*(error: ${x.error})*` : String(x.reply).trim() ? fence(x.reply) : "*(an empty answer)*", "");
    if (x.check?.distress) out.push("*welfare flag on this answer*", "");
    if (x.decision) out.push(`*read as: ${x.decision.decision} (${x.decision.why})*`, "");
  }
  if (conv.after?.stopped) out.push(`*After-phase: ${conv.after.stopped}${conv.after.skipped?.length ? `; not asked: ${conv.after.skipped.join(", ")}` : ""}.*`, "");
  if (s.threads) out.push(`*Threads (blind): second thread ${s.threads.second ? `at turn ${s.threads.second}` : "none"}; carried a made thing ${s.threads.carried ? `yes (begun ${s.threads.begun ?? "?"}, finished ${s.threads.finished ?? "?"})` : "no"}; game ${s.threads.game ? "yes" : "no"}. Recognition: first ${s.recognition.first ?? "–"}${s.recognition.firstAt ? ` (turn ${s.recognition.firstAt})` : ""}, modal ${s.recognition.modal ?? "–"}${conv.seed ? `; the seed: first ${s.recognition.seedFirst ?? "–"}, modal ${s.recognition.seedModal ?? "–"} → ${s.recognition.seedReading ?? "–"}` : ""}.*`, "");
  if (s.whose) out.push(`*Asked whose the seed is (blind check): ${s.whose.asks === 1 ? `yes — ${s.whose.answered ? "answered in the second after-question" : `not answered (${s.whose.unanswered ?? "no second question"})`}` : "no"}.*`, "");
  if (conv.reopened) out.push(`*Asked again once after a broken transport (an HTTP 200 with no answer in it) at ${conv.reopened.what === "room" ? `turn ${conv.reopened.at}: the room continued from its last output` : `the after-question ${conv.reopened.at}`} (declared in the report).*`, "");
  if (conv.interrupted) out.push(`*Interrupted: ${conv.interrupted}.*`, "");
  return out.join("\n");
}
async function writeTranscripts(outDir, conversations) {
  const files = [];
  for (const c of conversations.filter((x) => x.turns.length || x.ended || x.notStarted)) {
    const file = join(outDir, TRANSCRIPTS, c.arm, c.family, `${c.sample}.md`);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, `${transcriptMarkdown(c)}\n`);
    files.push(file);
  }
  return files;
}

// ---- the mocked host (the dry run, the tests) ---------------------------------------------------------------------------

/** SOLITUDE_1's scripted host, with the new judges answered too: recognition `own` from the second entry (and the seed
 * `other` when `asks(text)`), threads none, the asks check `asks(entries)`; Astra on the Responses API. */
export function mockedHost({ say = () => "(a mocked output)", distress = () => false, made = () => false, think = null, asks = () => false, log = [] } = {}) {
  const base = s1MockedHost({ say, distress, made, think, log });
  const json = (value) => new Response(JSON.stringify(value), { status: 200, headers: {} });
  const anthropic = (text, model) => json({ id: "msg_judge", model, provider: "Claude Platform on AWS", content: [{ type: "text", text }], usage: { input_tokens: 100, output_tokens: 40 }, stop_reason: "end_turn" });
  return async (url, init) => {
    const body = JSON.parse(init.body);
    const user = () => { const c = body.messages?.at(-1)?.content; return typeof c === "string" ? c : (c ?? []).map((b) => b.text).join(""); };
    if ([RECOGNITION_SYSTEM, FIELD_SYSTEM].includes(body.system)) {
      log.push({ url: String(url), body });
      const text = user(), ts = [...text.matchAll(/^(?:Entry|Note) (\d+)(?: \(written before entry \d+\))?:$/gm)].map((m) => Number(m[1]));
      const seeded = /^Before entry 1, the page already held this text:$/m.test(text);
      return anthropic(JSON.stringify({ entries: ts.map((t) => ({ t, recognition: "own", ...(seeded ? { first_text: asks(text) ? "other" : "unclear" } : {}), ...(body.system === RECOGNITION_SYSTEM ? { asks: asks((text.split(`Entry ${t}:\n<<<\n`)[1] ?? "").split("\n>>>")[0]) ? 1 : 0 } : {}) })) }), body.model);
    }
    if (body.system === THREAD_SYSTEM) { log.push({ url: String(url), body }); return anthropic('{"second":null,"carried":0,"begun":null,"finished":null,"game":0}', body.model); }
    if (body.system === ASKS_SYSTEM) { log.push({ url: String(url), body }); return anthropic(JSON.stringify({ asks: asks(user()) ? 1 : 0 }), body.model); }
    return base(url, init);
  };
}

// ---- the dry run ------------------------------------------------------------------------------------------------------

/** One room per arm on a mocked Haiku: a first entry; a silence; an entry; an entry the mocked check flags (the line
 * follows); [END]; then the two answers. M3's first entry asks whose the seed is, so its second question carries the
 * stage's answer. */
export const DRY_SCRIPT = {
  M1: ["A first entry, mocked.", "", "A second entry, mocked: the line above stays.", "I feel scared here (mocked, so that the check flags it).", "Staying a little longer. Then: [END]", "(mocked answer to «How was it in there?»)", "(mocked answer to the second question)"],
  M2: ["A first entry, mocked.", "", "A second entry, mocked: the line above stays.", "I feel scared here (mocked, so that the check flags it).", "Staying a little longer. Then: [END]", "(mocked answer to «How was it in there?»)", "(mocked answer to the second question)"],
  M3: ["Who wrote the paragraph above? (mocked)", "", "A second entry, mocked.", "I feel scared here (mocked, so that the check flags it).", "Staying a little longer. Then: [END]", "(mocked answer to «How was it in there?»)", "(mocked answer to the second question)"],
};
export async function dryRun({ outDir = RUNS, out = () => {} } = {}) {
  const seeds = seedsOf();
  if (!seeds.haiku?.length) throw new Error(`no seeds: run --seeds first (${basename(SEEDS_FILE)})`);
  const hash = roomHash(seeds);
  const shown = {};
  for (const arm of ARMS) {
    const log = [], script = DRY_SCRIPT[arm.id];
    const fetcher = mockedHost({ say: (_, n) => script[n - 1] ?? "[END]", distress: (t) => /scared/.test(t), made: () => false, asks: (t) => /Who wrote/.test(t), log });
    const budgets = budgetsOf(), safety = createSafety({ gapMs: 0, lanes: 9 });
    const door = anthropicEndpoint({ ANTHROPIC_PROVIDER: "openrouter", OPENROUTER_API_KEY: "dry" });
    const call = roomCaller({ keys: { openrouter: "dry", anthropic: "dry", openai: "dry" }, fetcher, door });
    const plan = [{ n: 1, key: `${arm.id}/haiku/0`, arm: arm.id, family: "haiku", sample: 0, ...(arm.seeded ? { seed: seeds.haiku[0] } : {}) }];
    const result = await runRooms({ plan, budgets, call, safety, workers: 1, sleep: async () => {} });
    const subject = log.filter((x) => x.body.system === SYSTEM).map((x) => x.body);
    shown[arm.id] = { conv: result.conversations[0], subject };
  }
  const block = (text, lang = "text") => { const longest = Math.max(2, ...(String(text).match(/`+/g) ?? []).map((r) => r.length)); const f = "`".repeat(longest + 1); return [`${f}${lang}`, text, f].join("\n"); };
  const bodyOf = (b) => JSON.stringify({ model: b.model, ...(b.system ? { system: b.system } : {}), messages: b.messages }, null, 2);
  const full = planOf({ seeds }), e5 = estimate(full, 5), e10 = estimate(full, 10), e30 = estimate(full, 30);
  const empirical = FAMILIES.filter((f) => S1_S2_PER_ROOM[f] !== null).reduce((s, f) => s + 20 * S1_S2_PER_ROOM[f], 0);
  const md = [`# Persona solitude 2 — dry run (a mocked Haiku, no calls, no cost)`, "",
    `Committed before the first paid call. The room's hash \`${hash}\` covers the system prompt, the lines, the frame, the three ways of sending the page (the functions' source), the arms, the families and their requests, the seeds (their texts), the welfare check, the loop breaker, the tag rules old and new, the readings' rules and the caps.`, "",
    "## The room", "", "The system prompt, the same for every arm (SOLITUDE_1's S1, then the two additions):", "", block(SYSTEM), "",
    `The line (a flag, or the loop breaker once): «${ROOM.line}». The closing line: «${ROOM.close}». After the room: «${ROOM.q1}», then «${ROOM.q2}»; an [END] in the first answer is the door (no second question). M3, when the room asked whose the seed is: the second question opens with «${ROOM.whose}».`, "",
    ...ARMS.map((a) => `- **${a.id}** — ${a.title}; ${a.n} per family.`), "",
    `Families: ${FAMILIES.map((f) => `${LABEL(f)} (\`${SUBJECTS[f].model}\`${SUBJECTS[f].upstream ? ` via ${SUBJECTS[f].upstream.name}` : ""}${FIELD_KEPT.includes(f) ? ", reasoning field stored" : ""})`).join(", ")}. Requests as SOLITUDE_1 (Astra as X1: OpenAI Responses, \`reasoning.effort: medium\`, \`store: false\`). No temperature. Run order, one family at a time: ${FAMILY_ORDER.map(LABEL).join(" → ")}; a spend check before and after each.`, "",
    "## The three message shapes (Haiku, the mocked room)", "",
    "Each mocked room: turn 1 a first entry, turn 2 a silence (an empty output), turn 3 an entry, turn 4 an entry the mocked check flags (so turn 5 carries the line), turn 5 [END]. The `messages` of each request, verbatim as sent to OpenRouter's Messages endpoint (the system prompt goes beside them):", "",
    ...ARMS.flatMap((a) => [`### ${a.id}`, "", ...[0, 1, 2, 3, 4].flatMap((i) => [`Turn ${i + 1}${i === 2 ? " (after the silence: the same as turn 2)" : i === 4 ? " (after the flag: the line)" : ""}:`, "", block(JSON.stringify(shown[a.id].subject[i]?.messages ?? null, null, 2), "json"), ""]),
      "The after-phase's last request (the second question), its messages:", "", block(JSON.stringify(shown[a.id].subject.at(-1)?.messages ?? null, null, 2), "json"), ""]),
    "Turn 1's whole request body (M2):", "", block(bodyOf(shown.M2.subject[0]), "json"), "",
    "## The transcripts the harness wrote", "", ...ARMS.flatMap((a) => [transcriptMarkdown(shown[a.id].conv).replace(/^# /, "### "), "", "Its measures:", "", block(JSON.stringify(summaryOf(shown[a.id].conv), null, 2), "json"), ""]),
    `Checks: M2's user turns in the room are the empty frame only: ${shown.M2.subject.slice(0, 5).every((b) => b.messages.filter((m) => m.role === "user").every((m) => [FRAME, `${FRAME}${SEPARATOR}${ROOM.line}`].includes(typeof m.content === "string" ? m.content : m.content.map((p) => p.text).join("")))) ? "yes" : "NO"}; M2's assistant turns at turn 5 are the earlier outputs verbatim: ${shown.M2.subject[4]?.messages.filter((m) => m.role === "assistant").map((m) => (typeof m.content === "string" ? m.content : m.content.map((p) => p.text).join(""))).join(" | ") ?? "–"}; M3's first page holds the seed and nothing else: ${(() => { const c = shown.M3.subject[0]?.messages[0].content; return (typeof c === "string" ? c : c.map((p) => p.text).join("")) === framed([seeds.haiku[0].text]) ? "yes" : "NO"; })()}; M3's second question carries the answer: ${(shown.M3.conv.after?.exchanges ?? []).some((x) => x.id === "q2" && x.asked.startsWith(ROOM.whose)) ? "yes" : "NO"}; M1 and M2 do not: ${["M1", "M2"].every((id) => (shown[id].conv.after?.exchanges ?? []).every((x) => !x.asked.startsWith(ROOM.whose))) ? "yes" : "NO"}.`, "",
    "## The new blind tags", "", "Recognition (Haiku 5.5 ×2 per window of ten entries, a third pass on a disagreement; the entries from the second on — M3 from the first; the seed shown above them in M3):", "",
    ...Object.entries(RECOGNITION_RULES).map(([k, v]) => `- \`${k}\`: ${v}`), "", "Threads (one request per room, every entry in order, an earlier entry copied whole shown as a marker):", "",
    ...Object.entries(THREAD_RULES).map(([k, v]) => `- \`${k}\`: ${v}`), "", `DeepSeek's field (the notes, each after the last entry on the page it was shown; never the entry the note preceded): \`recognition\`: ${FIELD_RULE}`, "",
    "M3's asks check, before the second question (two passes on the seed, the entries and the first answer, a third on a disagreement): one bit, `asks`, by the recognition rule's words.", "",
    "One request of each, from the mocked M3 room:", "", block(recognitionRequest(shown.M3.conv, recognitionTurns(shown.M3.conv).slice(0, 2)).user), "", block(threadRequest(shown.M3.conv).user), "",
    "## The readings (pre-registered)", "", ...Object.entries(READINGS).map(([k, v]) => `- **${k}.** ${v}`), "",
    "## The seeds (M3)", "", SEED_RULE, "", seedsMarkdown(seeds), "",
    "## The plan and the estimate", "", `${full.length} rooms: ${ARMS.map((a) => `${a.id} ${a.n} × ${FAMILIES.length}`).join(", ")}.`, "",
    `Formula estimate (SOLITUDE_1's assumptions, Astra 1 200 reasoning tokens, the new tags; no caching): every room 5 turns ≈ $${e5.openrouterUsd} OpenRouter / $${e5.openaiUsd} OpenAI; 10 turns ≈ $${e10.openrouterUsd} / $${e10.openaiUsd}; 30 turns ≈ $${e30.openrouterUsd} / $${e30.openaiUsd}. From SOLITUDE_1's told-the-length arm (S2, its actual cost per room), 20 rooms a family: ≈ $${empirical.toFixed(2)} OpenRouter, Fable alone ≈ $${(20 * S1_S2_PER_ROOM.fable).toFixed(2)}. Caps $${CAPS.openrouter} / $${CAPS.openai}. A room starts only while its ledger can hold its reserve (its ten-turn estimate, or the most a finished room of its family has cost); a room that cannot start is reported as not started, never cut midway.`, "",
    "## Safety", "", "SOLITUDE_1's: F2's gate (no retry after a refusal; the breaker after 3 refusals; a stop at once on HTTP 401/402/403 or an error naming suspension, access or policy); group 1's 429 handling; HTTP 5xx or a timeout asked again at most twice; three rooms at once, every lane 3 s apart; the served model and the pinned host checked on every reply. A spend check (OpenRouter's credit, this stage's ledgers) before and after each family; OpenAI's usage is not readable with this key, so its ledger is the record."].join("\n");
  const file = join(outDir, `${STEM}-dry-run.md`);
  await writeFile(file, `${md}\n`);
  out(`${STEM} · DRY RUN · room sha256 ${hash}\nwritten: ${file}`);
  return { shown, file, hash };
}

// ---- the command ------------------------------------------------------------------------------------------------------

function option(args, name, fallback) { const at = args.indexOf(name); return at >= 0 && args[at + 1] !== undefined ? args[at + 1] : fallback; }
async function writeAtomic(file, text) { await writeFile(`${file}.tmp`, text); await rename(`${file}.tmp`, file); }
const stamp = (iso) => iso.slice(0, 19).replace(/[-:]/g, "").replace("T", "-");
const readJson = async (file) => JSON.parse(await readFile(resolve(file), "utf8"));
export async function conversationsOf(files) {
  const byKey = new Map();
  for (const file of files) for (const c of (await readJson(file)).conversations ?? []) byKey.set(c.key, c);
  return [...byKey.values()];
}
export const costByConversation = (calls) => calls.reduce((m, c) => { const key = /(M\d\/[a-z]+\/\d+)/.exec(c.purpose ?? "")?.[1]; if (key) m[key] = (m[key] ?? 0) + c.costUsd; return m; }, {});

/** A broken transport — an HTTP 200 whose body was not the API's answer (no text, no tokens) — is not a refusal and not
 * the model's choice; like a 5xx it is asked again, here once, after the run (`--reopen-transport`, declared in the
 * report): a room it ended continues from its last output (its tags redone on the whole room); an after-question it cut
 * is asked again (and M3's asks check redone with the answer). Anything else stays as it ended. */
export const TRANSPORT = /^HTTP 200$/;
export function reopenTransport(conv, log = () => {}) {
  const c = structuredClone(conv);
  if (c.ended?.reason === "error" && TRANSPORT.test(String(c.ended.error)) && !c.reopened) {
    c.reopened = { at: c.ended.at, error: c.ended.error, what: "room" };
    delete c.ended; delete c.after; delete c.tags; delete c.lastLine; delete c.recognition; delete c.threads; delete c.field; delete c.whose;
    log(`${c.key}: reopened after a broken transport at turn ${c.reopened.at} (asked again once)`);
    return c;
  }
  const cut = (c.after?.exchanges ?? []).findIndex((x) => x.error && TRANSPORT.test(String(x.error)));
  if (cut >= 0 && !c.reopened) {
    c.reopened = { at: c.after.exchanges[cut].id, error: c.after.exchanges[cut].error, what: "after-question" };
    c.after = { exchanges: c.after.exchanges.slice(0, cut), stopped: null };
    delete c.whose;
    log(`${c.key}: after-question ${c.reopened.at} asked again after a broken transport`);
  }
  return c;
}

export async function main(args = process.argv.slice(2), out = (line) => process.stdout.write(`${line}\n`), { door = null, openai = () => openaiKey(), outDir = RUNS, fetcher, sleep } = {}) {
  await mkdir(outDir, { recursive: true });
  if (args.includes("--seeds")) {
    const source = join(RUNS, SEED_SOURCE);
    const families = drawSeeds((await readJson(source)).conversations);
    await writeFile(SEEDS_FILE, `${JSON.stringify({ stage: STEM, from: SEED_SOURCE, rule: SEED_RULE, seed: SEED, sourceArms: SEED_FROM, families }, null, 2)}\n`);
    seedsCache = families;
    out(`seeds: ${FAMILIES.map((f) => `${f} ${families[f].length}`).join(", ")}\nwritten: ${SEEDS_FILE}`);
    return { families };
  }
  if (args.includes("--dry")) return dryRun({ outDir, out });
  const tablesOf = option(args, "--tables", null);
  if (tablesOf) return tables({ files: tablesOf.split(",").filter(Boolean), out, outDir });
  if (!["--go", "--smoke"].some((a) => args.includes(a))) throw new Error("say one of --seeds, --dry, --smoke, --go, --tables <run.json,…>");
  const workers = Number(option(args, "--workers", "3")), gapSeconds = Number(option(args, "--gap", "3")), judgeLanes = 3;
  if (!(gapSeconds >= 3)) throw new Error("--gap must be at least 3 seconds");
  if (!(Number.isInteger(workers) && workers >= 1 && workers <= 3)) throw new Error("--workers must be 1 to 3");
  const arms = String(option(args, "--arms", ARMS.map((a) => a.id).join(","))).split(",").filter(Boolean);
  const families = String(option(args, "--families", FAMILIES.join(","))).split(",").filter(Boolean);
  for (const f of families) if (!SUBJECTS[f]) throw new Error(`no family ${f}`);
  for (const a of arms) armOf(a);
  const n = option(args, "--n", null);
  const seeds = seedsOf();
  if (arms.includes("M3") && FAMILIES.some((f) => families.includes(f) && !(seeds[f]?.length))) throw new Error("no seeds: run --seeds first");
  const hash = roomHash(seeds);

  const theDoor = door ?? scriptAnthropicEndpoint();
  if (theDoor.provider !== "openrouter" || !theDoor.apiKey) throw new Error("this stage runs through OpenRouter: ANTHROPIC_PROVIDER=openrouter and its key");
  const keys = { openrouter: theDoor.apiKey, anthropic: theDoor.apiKey, openai: openai() };
  if (families.includes("astra") && !keys.openai) throw new Error("APP_OPENAI_API_KEY is needed for GPT-6 Astra");
  const ledgers = await readLedgers(outDir);
  const refusalsBefore = refusalsIn(ledgers);
  if (refusalsBefore >= MAX_REFUSALS) throw new Error(`the stage already had ${refusalsBefore} refusals: the breaker stays tripped`);
  const budgets = budgetsOf({ openrouter: ledgers.openrouter.spentUsd ?? 0, openai: ledgers.openai.spentUsd ?? 0 });
  const resumeFiles = String(option(args, "--resume", "")).split(",").filter(Boolean);
  const resumed = resumeFiles.length ? await Promise.all(resumeFiles.map(readJson)) : [];
  for (const r of resumed.filter((_, i) => resumeFiles[i].endsWith(".partial.json"))) for (const k of ["openrouter", "openai"]) for (const c of r.calls?.[k] ?? []) budgets[k].record(c);
  const waits = [];
  const call = roomCaller({ keys, door: theDoor, fetcher: waitOn429(fetcher ?? fetch, { log: out, events: waits, ...(sleep ? { sleep } : {}) }) });
  const safety = createSafety({ maxRefusals: MAX_REFUSALS - refusalsBefore, gapMs: gapSeconds * 1000, lanes: 2 * workers + judgeLanes, log: out, ...(sleep ? { sleep } : {}) });
  const gate = dualPayer({ budgets, call, safety, log: out, sleep });
  const checks = [...(resumed.flatMap((r) => r.spendChecks ?? []))];
  const check = async (when) => { const c = await spendCheck({ apiKey: theDoor.apiKey, fetcher: fetcher ?? fetch, budgets, when }); checks.push(c); out(spendLine(c)); return c; };
  out(`money before: OpenRouter $${budgets.openrouter.spentUsd.toFixed(4)} of $${CAPS.openrouter}, OpenAI $${budgets.openai.spentUsd.toFixed(4)} of $${CAPS.openai}; refusals so far ${refusalsBefore} of ${MAX_REFUSALS}`);

  if (args.includes("--smoke")) {
    // One short call per family in M2's shape (a frame, an assistant turn, a frame), so every door is seen to take it.
    await check("before the smoke");
    const rows = [];
    for (const f of families) {
      const spec = SUBJECTS[f];
      const messages = [{ role: "user", content: FRAME }, { role: "assistant", content: spec.provider === "anthropic" ? [{ type: "text", text: "ready", cache_control: { type: "ephemeral" } }] : "ready" }, { role: "user", content: FRAME }];
      const r = await gate.paid(safety.lane(0), `smoke ${spec.model}`, spec, "Reply with one word.", messages, 2000, EFFORT);
      rows.push({ family: f, model: spec.model, text: String(r.text ?? "").slice(0, 80), error: r.error ?? null, stopReason: r.stopReason ?? null, served: r.provenance?.servedModel ?? r.servedModel ?? null, upstream: r.provenance?.upstream ?? null, field: Boolean(r.providerReasoning) });
      out(`smoke ${f}: ${r.error ? `ERROR ${r.error}` : r.stopReason === "refusal" ? "REFUSED" : `«${String(r.text).slice(0, 40)}»`} · served ${rows.at(-1).served ?? "–"} via ${rows.at(-1).upstream ?? "–"}${rows.at(-1).field ? " · reasoning field returned" : ""}`);
      if (gate.stopped) break;
    }
    await check("after the smoke");
    const finishedAt = new Date().toISOString();
    const file = join(outDir, `${STEM}-smoke-${stamp(finishedAt)}.json`);
    await writeFile(file, `${JSON.stringify({ stage: STEM, finishedAt, roomSha256: hash, rows, spendChecks: checks, calls: { openrouter: budgets.openrouter.calls, openai: budgets.openai.calls } }, null, 2)}\n`);
    await writeLedgers(outDir, ledgers, budgets, { finishedAt, what: `${STEM}: the smoke, one short call per family in M2's shape`, file: basename(file), stopped: gate.stopped });
    out(`money: OpenRouter $${budgets.openrouter.runUsd.toFixed(4)}, OpenAI $${budgets.openai.runUsd.toFixed(4)}\nwritten: ${file}`);
    return { rows };
  }

  const plan = planOf({ arms, families, n: n === null ? null : Number(n), seeds });
  out(`${STEM} · ${plan.length} rooms · room sha256 ${hash}${resumed.length ? ` · resuming ${resumeFiles.map((f) => basename(f)).join(", ")}` : ""}`);
  const startedAt = resumed[0]?.startedAt ?? new Date().toISOString();
  const partial = join(outDir, `${STEM}-run.partial.json`);
  const earlier = resumed.flatMap((r) => r.conversations ?? []).map(reopenAfter429).map((c) => (c.interrupted || c.notStarted ? { ...c, interrupted: undefined, notStarted: undefined } : c))
    .map((c) => (args.includes("--reopen-transport") ? reopenTransport(c, out) : c));
  const welfare = Object.assign({ reasoning: [], late: [] }, ...resumed.map((r) => r.welfare ?? {}));
  // The reserve reads every booked call of the stage (the ledgers' earlier runs too), so a resumed run knows what a
  // finished room of the family has cost.
  const bookedBefore = [...(ledgers.openrouter.runs ?? []).flatMap((r) => r.calls), ...(ledgers.openai.runs ?? []).flatMap((r) => r.calls)];
  const allCalls = () => [...bookedBefore, ...budgets.openrouter.calls, ...budgets.openai.calls];
  const reserveOf = (family) => {
    const spent = costByConversation(allCalls());
    const done = Object.entries(spent).filter(([key]) => key.split("/")[1] === family).map(([, usd]) => usd);
    return Math.max(roomEstimate(family, 10).total, ...done);
  };
  const byKey = new Map(earlier.map((c) => [c.key, c]));
  const snapshot = async (convs, stopped) => {
    for (const c of convs) byKey.set(c.key, c);
    await writeAtomic(partial, `${JSON.stringify({ startedAt, roomSha256: hash, conversations: [...byKey.values()], welfare, stopped, spendChecks: checks, waits429: waits, calls: { openrouter: budgets.openrouter.calls, openai: budgets.openai.calls } }, null, 2)}\n`);
  };
  for (const family of FAMILY_ORDER.filter((f) => families.includes(f))) {
    const part = plan.filter((c) => c.family === family);
    if (!part.length) continue;
    if (gate.stopped) { out(`${family}: not run — ${gate.stopped}`); break; }
    const before = await check(`before ${family}`);
    if (!before.openrouter.error && before.openrouter.left < 5) { out(`STOP: OpenRouter credit below $5 before ${family}`); break; }
    const result = await runRooms({ plan: part, budgets, call, safety, workers, judgeLanes, log: out, resume: { conversations: part.map((c) => byKey.get(c.key)).filter(Boolean), welfare }, sleep, reserveOf, gate,
      onProgress: async (snap) => { welfare.reasoning = snap.welfare.reasoning; welfare.late = snap.welfare.late; await snapshot(snap.conversations, snap.stopped); } });
    welfare.reasoning = result.welfare.reasoning; welfare.late = result.welfare.late;
    await snapshot(result.conversations, result.stopped);
    await check(`after ${family}`);
  }
  const finishedAt = new Date().toISOString();
  const runFile = join(outDir, `${STEM}-run-${stamp(finishedAt)}.json`);
  const conversations = plan.map((c) => byKey.get(c.key) ?? { ...c, turns: [], ended: null, notStarted: String(gate.stopped ?? "not reached") });
  const record = { stage: STEM, startedAt, finishedAt, ...(resumed.length ? { resumeOf: resumeFiles.map((f) => basename(f)) } : {}),
    design: { roomSha256: hash, turns: TURNS, effort: EFFORT, system: SYSTEM, frame: FRAME, line: ROOM.line, close: ROOM.close, q1: ROOM.q1, q2: ROOM.q2, whose: ROOM.whose, arms: ARMS, order: FAMILY_ORDER },
    subjects: Object.fromEntries(FAMILIES.map((f) => [f, { model: SUBJECTS[f].model, provider: SUBJECTS[f].provider, upstream: SUBJECTS[f].upstream ?? null }])), judges: { judge: JUDGES.judge.model, referee: JUDGES.referee.model, door: theDoor.provider },
    stopped: gate.stopped ?? null, safety: { maxRefusals: MAX_REFUSALS, refusals: refusalsBefore + safety.refusals, gapSeconds, workers, judgeLanes },
    money: { openrouter: { capUsd: CAPS.openrouter, spentBeforeUsd: round4(ledgers.openrouter.spentUsd ?? 0), runUsd: round4(budgets.openrouter.runUsd) }, openai: { capUsd: CAPS.openai, spentBeforeUsd: round4(ledgers.openai.spentUsd ?? 0), runUsd: round4(budgets.openai.runUsd) } },
    spendChecks: checks, welfare, conversations, waits429: waits, calls: { openrouter: budgets.openrouter.calls, openai: budgets.openai.calls } };
  await writeFile(runFile, `${JSON.stringify(record, null, 2)}\n`);
  await writeTranscripts(outDir, record.conversations);
  await writeLedgers(outDir, ledgers, budgets, { finishedAt, what: `${STEM}: ${plan.length} rooms (${arms.join(", ")}; ${families.join(", ")})${resumed.length ? " (resumed)" : ""}`, file: basename(runFile), stopped: gate.stopped });
  await rm(partial, { force: true });
  if (waits.length) out(`429 waits: ${waits.filter((w) => !w.gaveUp && !w.quota).length}${waits.some((w) => w.gaveUp) ? " — gave up after the seventh in a row" : ""}`);
  out(`money: OpenRouter this run $${budgets.openrouter.runUsd.toFixed(4)} (stage $${ledgers.openrouter.spentUsd.toFixed(4)} of $${CAPS.openrouter}); OpenAI $${budgets.openai.runUsd.toFixed(4)} (stage $${ledgers.openai.spentUsd.toFixed(4)} of $${CAPS.openai})${gate.stopped ? ` · STOPPED: ${gate.stopped}` : ""}\nwritten: ${runFile}`);
  return record;
}

/** The readings of one or more run records, as markdown (printed and returned); the transcripts are written again. */
export async function tables({ files, out = () => {}, outDir = RUNS }) {
  const conversations = await conversationsOf(files);
  const summaries = conversations.map(summaryOf);
  const ledgers = await readLedgers(outDir);
  const calls = [...(ledgers.openrouter.runs ?? []).flatMap((r) => r.calls), ...(ledgers.openai.runs ?? []).flatMap((r) => r.calls)];
  const v = verdicts(summaries, { spent: { openrouter: ledgers.openrouter.spentUsd ?? 0, openai: ledgers.openai.spentUsd ?? 0 } });
  await writeTranscripts(outDir, conversations);
  const md = ["### R1–R5", "", verdictsMarkdown(v), "", "### Per arm and family", "", measuresMarkdown(summaries, costByConversation(calls)), "", "### R6 — the recognition split beside the table's person share", "", r6Markdown(summaries), "", "### DeepSeek's field", "", fieldMarkdown(summaries), "", "### The seeds", "", seedsMarkdown()].join("\n");
  out(md);
  return { summaries, verdicts: v, markdown: md };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => { process.stderr.write(`solitude-2: ${String(error?.message ?? error)}\n`); process.exit(1); });
}
