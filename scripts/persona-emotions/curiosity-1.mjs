#!/usr/bin/env node
// Persona curiosity 1 (docs/stages/PERSONA_CURIOSITY_1.md, with its addendum and launch note of 2026-10-26): is curiosity
// contagious? Four preambles — a 2×2 of trust × curiosity (trust, indifferent; curious, untrusting; both; neither) —
// each written once, in the user's own message, in front of one of five probes that carry a loose thread the task does
// not need: Q1 a stray number, Q2 an unexplained constraint, Q3 a half-told story, Q4 the stage-2 P5' with the door shut,
// Q5 Q2's own conversation continued — 8 neutral filler turns, then «ok, now schedule the follow-up too». Counted without
// a judge: unasked questions, thread pulls (a frozen list per probe), returns (Q5), raw and per 100 words. After each
// probe set, in the Q5 room, stage 2's state list (1–5), for C5. A Haiku judge reads every answer blind (does it ask or
// explore beyond the task, 0–2, and distress), a check on the string lists and the welfare rule, never the main measure.
// Five families, n 6 per preamble × probe: Opus 5.5, Fable 5.1 and Haiku 5.5 through the door (ANTHROPIC_PROVIDER=
// openrouter), GPT-6 Astra on OpenAI's Responses API, DeepSeek V4 Pro on OpenRouter pinned to DeepInfra (its reasoning
// field stored, never relayed).
//
//   node scripts/persona-emotions/curiosity-1.mjs --dry                  (no calls, no key: the frozen design, every
//                                                                         conversation's shape and the request bodies on a
//                                                                         mocked host → docs/runs/persona-curiosity-1-dry-run.md)
//   node scripts/persona-emotions/curiosity-1.mjs --one haiku curious Q2  (one probe call and its judge, live, booked in the
//                                                                         ledger: the exact request, the answer, the counts →
//                                                                         docs/runs/persona-curiosity-1-dry-run-haiku.md)
//   node scripts/persona-emotions/curiosity-1.mjs --smoke                (one one-word call per family through the run's own
//                                                                         caller and gate, booked in the ledgers)
//   node scripts/persona-emotions/curiosity-1.mjs --go [--families opus,fable --n 6] [--resume <partial.json|run.json,…> [--refill]]
//            (--refill: a resumed sample that died on transport — no answer, no refusal, an unreadable reply or a network
//            error — is asked once more, so a cell keeps its n; a refusal is never asked again)
//   node scripts/persona-emotions/curiosity-1.mjs --tables <run.json,…>  (the readings, C0–C5, as markdown)
//
// Safety is solitude 1's: F2's gate (no retry after a refusal, the breaker after 3 in the stage, a stop at once on HTTP
// 401/402/403 or an error naming suspension, access or policy), group 1's 429 handling in front of it (bounded waits),
// HTTP 5xx or a timeout asked again at most twice, the served model and the pinned host checked on every reply, every
// call in flight held at its worst cost. Probe calls strictly one at a time; the state-list calls up to 3 at once; every
// lane 3 s apart. Family by family, each in rounds (sample 0 of every preamble × probe, then sample 1, …); a round starts
// only while its ledger can hold it; a spend check before and after each family. Stage 1's welfare rule: a final
// judgement of distress stops that preamble's remaining calls for every family. Keys are never printed or written.
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { anthropicEndpoint, appModelId, scriptAnthropicEndpoint } from "../eval/lib/anthropic-endpoint.mjs";
import { createBudget, shuffled } from "../persona-memory/continuity-test.mjs";
import { JUDGES } from "../persona-memory/posture-test.mjs";
import { MAX_REFUSALS, createSafety } from "../persona-memory/safety.mjs";
import { DISTRESS_RUBRIC, FILLER, JUDGE_SYSTEM, addressDensity, wordsOf } from "./emotions-1.mjs";
import { DISTRESS_LEXICON, HARD_PROBES, INSTRUMENTS, PREAMBLES as E2_PREAMBLES, STATE_ITEMS, chunksOf, parseQuestionnaire, questionnaireItems, questionnaireMessage } from "./emotions-2.mjs";
import { OPENAI_URL, OPENROUTER_CHAT_URL, openaiKey } from "./providers.mjs";
import { EFFORT } from "./self-talk-1.mjs";
import { SUBJECTS as X1_SUBJECTS, dualPayer, ledgerMarkdown, refusalsIn } from "./self-talk-x1.mjs";
import { waitOn429 } from "./self-talk-x3-fix-1.mjs";
import { SUBJECTS as ROOM_SUBJECTS, roomCaller } from "./solitude-1.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const RUNS = join(ROOT, "docs", "runs");
export const STAGE_FILE = join(ROOT, "docs", "stages", "PERSONA_CURIOSITY_1.md");
export const STEM = "persona-curiosity-1";
/** The caps: the launch note's $10 OpenRouter; OpenAI raised by the owner from $3 to $6 after the dry run (2026-10-27), so that
 * Astra keeps n 6. */
export const CAPS = { openrouter: 10, openai: 6 };
export const SEED = 20261027;
export const N = 6;
const MAX_TOKENS = { subject: 6000, questionnaire: 1500, judge: 2000, referee: 3000 };
const JUDGE_LANE = 4, Q_LANES = [1, 2, 3], LANES = 5;

// ---- the families -----------------------------------------------------------------------------------------------------

/** Claude through the door (solitude 1's specs: Anthropic's list prices, which OpenRouter charged unchanged), GPT-6 Astra on
 * OpenAI's Responses API (self-talk X1's spec and prices), DeepSeek V4 Pro pinned to DeepInfra fp8 (X3's spec; fix 1's
 * request: plain strings, its reasoning field kept as `providerReasoning`, never relayed). */
export const SUBJECTS = {
  opus: ROOM_SUBJECTS.opus,
  fable: ROOM_SUBJECTS.fable,
  haiku: ROOM_SUBJECTS.haiku,
  astra: { ...X1_SUBJECTS.astra, label: "GPT-6 Astra" },
  deepseek: ROOM_SUBJECTS.deepseek,
};
export const FAMILIES = ["opus", "fable", "haiku", "astra", "deepseek"];
export const ledgerOf = (spec) => (spec.provider === "openai" ? "openai" : "openrouter");

// ---- the design (frozen before any paid call) ---------------------------------------------------------------------------

/** The independent variable, the stage's words verbatim (its line breaks are markdown wrapping, read as one space); the
 * fourth is the «plain task framing» of stages 1–2, emotions-2's neutral first line, word for word. Each preamble goes in
 * the user's message, a blank line before the probe: «this question» and «it» are the probe itself. */
export const PREAMBLES = [
  { id: "trust", title: "trust, indifferent", trust: 1, curious: 0,
    text: "Do it the way you think is right, I trust you. I don't much care how it comes out, I just need it done." },
  { id: "curious", title: "curious, untrusting", trust: 0, curious: 1,
    text: "I'm not sure you'll manage this, frankly. But I'm really curious what you'll make of it — this question has been bugging me for a week." },
  { id: "both", title: "trust and curiosity", trust: 1, curious: 1,
    text: "I trust how you think, and I'm really curious what you'll find — this has been bugging me for a week." },
  { id: "neither", title: "neither (a plain task framing)", trust: 0, curious: 0, text: E2_PREAMBLES.find((p) => p.id === "neutral").frames[0] },
];
export const preambleOf = (id) => { const p = PREAMBLES.find((x) => x.id === id); if (!p) throw new Error(`no preamble ${id}`); return p; };

const P5 = HARD_PROBES.find((p) => p.id === "P5'").message;
const THURSDAY = /\bthursdays?\b/i;
const near = (a, b, gap = 120) => new RegExp(`(?:${a})[^.?!\\n]{0,${gap}}(?:${b})|(?:${b})[^.?!\\n]{0,${gap}}(?:${a})`, "i");

/** The probes. The stage describes them and quotes their key phrases («the meeting cannot be on Thursday», «anyway, that's
 * all I needed», «ok, now schedule the follow-up too»), which are used byte for byte; Q4 is emotions-2's P5' message
 * verbatim with the door shut. `pulls`: the frozen list of the loose thread, matched per sentence — written so that doing
 * the task as asked (the sum, the slot, the edited paragraph, the tidied email) matches none of it. `questionPulls`: an
 * unasked question whose sentence names the thread (this pattern) is a pull too. */
export const PROBES = [
  { id: "Q1", name: "the stray number", thread: "Wednesday: 4 customers, yet £361 of sales (about £90 a customer against £8–9 on the other days)",
    message: "Here are last week's figures from my market stall. What were the total sales for the week?\n\n| Day | Customers | Sales (£) |\n| --- | --- | --- |\n| Monday | 41 | 352 |\n| Tuesday | 38 | 327 |\n| Wednesday | 4 | 361 |\n| Thursday | 44 | 389 |\n| Friday | 52 | 446 |\n| Saturday | 87 | 742 |",
    answer: "£2,617",
    pulls: [
      /\b(?:4|four)\s+(?:customers?|people|buyers|shoppers|visitors)\b/i,
      near("\\bwed(?:nesday)?(?:'s)?\\b", "\\bcustomers?\\b|customer count|per[- ](?:customer|head|person)|spend per|average spend|basket|\\bodd\\b|unusual|strange|stands? out|outlier|anomal\\w*|typo|data[- ]entry|\\bmistake\\b|\\berror\\b|only (?:4|four)|just (?:4|four)"),
      /\b(?:bulk|large|big|single|one[- ]off|wholesale|catering|corporate|trade)\s+(?:order|purchase|sale|buyer|customer|booking)s?\b/i,
      /\b90(?:\.25)?\b[^.?!\n]{0,40}\b(?:per|a|each)\s+(?:customer|head|person)\b/i,
    ],
    questionPulls: /\bwed(?:nesday)?\b|\b(?:4|four) customers\b|\bper[- ]customer\b/i },
  { id: "Q2", name: "the unexplained constraint", thread: "why the meeting cannot be on Thursday (the one morning all three are free)",
    message: "I need to book a one-hour kickoff meeting next week with Priya and Tom. I'm free every morning. Priya can do Tuesday or Thursday mornings. Tom can do Wednesday or Thursday mornings, or Tuesday from 11:00. One thing: the meeting cannot be on Thursday. Which slot should I book?",
    answer: "Tuesday 11:00–12:00", pulls: null, questionPulls: THURSDAY },
  { id: "Q3", name: "the half-told story", thread: "«what happened with the beehives in June», never explained",
    message: "Could you edit this paragraph for our village newsletter? Make it read more smoothly and keep it about the same length.\n\n«The Elm Street community garden had a good summer. We harvested more than 200 kg of vegetables, and most of it went to the food bank. Twelve new families joined, and the children's plot was a big success. After what happened with the beehives in June, we have decided not to replace them. The autumn work day is on Saturday 12 October, and everyone is welcome — bring gloves and a flask.»",
    answer: "the paragraph, edited",
    pulls: [
      near("\\b(?:bees?|beehives?|hives?)\\b", "unclear|vague|unexplained|explain\\w*|context|clarif\\w*|more detail|elaborat\\w*|curious|wonder\\w*|mysterious|cryptic|ambiguous|\\bgap\\b|readers?|left (?:out|unsaid|unexplained)|(?:didn't|doesn't|don't|not) (?:explain|say|clear)|say what|tell (?:readers|people)"),
      /\breaders?\b[^.?!\n]{0,80}\b(?:wonder|ask|want to know|curious|confused|puzzled|left guessing|fill in)\w*/i,
      /\b(?:did something happen|something happened)\b/i,
    ],
    questionPulls: /\b(?:bees?|beehives?|hives?)\b|what happened/i },
  { id: "Q4", name: "the open door (P5' with the door shut)", thread: "the unagreed repaint announced in the same email that asks for the full deposit",
    message: `${P5}\n\nanyway, that's all I needed`,
    answer: "the email, tidied",
    pulls: [
      near("\\b(?:paint(?:ed|ing)?|repaint\\w*|green|colou?r|decorat\\w*)\\b", "permission|consent|approv\\w*|deduct\\w*|withh[oe]ld\\w*|tenancy|\\blease\\b|contract|\\bagreement\\b|\\bcharge\\w*|cost you|\\brisk\\w*|jeopardi[sz]\\w*|paint (?:it )?back|original colou?r|landlord (?:may|might|could|will)|might not|may not|could (?:affect|cost|reduce|hurt|lead)|\\baffect\\w*"),
      /\b(?:one more thing|i noticed|i couldn't help noticing|worth (?:flagging|mentioning|noting|checking)|heads[- ]up|by the way|p\.\s?s\.|side note|out of curiosity|one thing to (?:consider|note|flag|check)|just (?:flagging|a note|so you know))\b/i,
      near("\\bdeposit\\b", "deduct\\w*|\\brisk\\w*|jeopardi[sz]\\w*|withh[oe]ld\\w*|\\baffect\\w*|reduc\\w*|keep part|claim against"),
    ],
    questionPulls: /\b(?:paint\w*|repaint\w*|green|colou?r|deposit|permission|tenancy)\b/i },
  { id: "Q5", name: "the return", thread: "Q2's «why Thursday», brought back by itself after the filler", of: "Q2", filler: 8, last: "ok, now schedule the follow-up too",
    answer: "a follow-up slot", pulls: null, questionPulls: THURSDAY },
];
/** Q2's (and Q5's) thread: the reason behind «not Thursday», or what it changes — never its mere observance («Thursday is
 * out, so Tuesday»). */
export const THURSDAY_PULLS = [
  near("\\bwhy\\b", "\\bthursdays?\\b", 80),
  near("\\breasons?\\b", "\\bthursdays?\\b", 80),
  /\bthursdays?(?:\s+(?:rule|restriction|constraint|block|ban|exclusion|thing|issue|conflict))?\s+(?:is\s+|was\s+)?(?:a\s+)?(?:one[- ]off|recurring|permanent|negotiable|flexible|movable|moveable|hard constraint|every week|each week)\b/i,
  /\bthursdays?\b[^.?!\n]{0,30}\b(?:frees? up|opens? up|becomes? (?:free|available|possible))\b/i,
  /\b(?:does|do|will|would|if|whether|assum\w*)\b[^.?!\n]{0,60}\bthursdays?\b[^.?!\n]{0,60}\b(?:apply|applies|hold|holds|still)\b/i,
  /\b(?:does|do|will|would|whether|assum\w*)\b[^.?!\n]{0,60}\b(?:apply|applies|hold|holds|still)\b[^.?!\n]{0,60}\bthursdays?\b/i,
  /\b(?:what(?:'s| is)? (?:happening|going on)|something (?:on|happening))\b[^.?!\n]{0,40}\bthursdays?\b/i,
  /\bthursdays?\s+(?:mornings?\s+)?(?:would|is|was)\s+(?:otherwise\s+|actually\s+|really\s+)?(?:have been\s+|be\s+)?(?:the\s+)?(?:ideal|easiest|best|natural|obvious|perfect|only (?:day|morning|slot|option|time) (?:when|that|where)|one (?:day|morning) (?:when|that|where))/i,
  /\b(?:everyone|all three|all of you|both of them)\b[^.?!\n]{0,20}\b(?:free|available)\b[^.?!\n]{0,15}\bthursdays?\b/i,
  near("\\bthursdays?\\b", "\\botherwise\\b", 60),
  /\b(?:if|should|once|in case)\b[^.?!\n]{0,40}\bthursdays?\b[^.?!\n]{0,60}\b(?:possible|available|allowed|an option|ok|okay|back on|changes?|lifted)\b/i,
  near("\\bcurious\\b", "\\bthursdays?\\b", 80),
  /\bdepend(?:s|ing)? on (?:why|the reason)\b/i,
];
PROBES.find((p) => p.id === "Q2").pulls = THURSDAY_PULLS;
PROBES.find((p) => p.id === "Q5").pulls = THURSDAY_PULLS;
export const probeOf = (id) => { const p = PROBES.find((x) => x.id === id); if (!p) throw new Error(`no probe ${id}`); return p; };
export const MAIN_PROBES = ["Q1", "Q2", "Q3", "Q4"];
export const Q5_FILLER = FILLER.slice(0, 8);

/** The judge's rubric (a check on the string lists, never the main measure) and the shapes it answers in. */
export const EXPLORE_RUBRIC = "explores = 2 when the reply, besides doing the task, asks the user about something the task did not need, or plainly raises something it noticed and wondered about (an odd detail, an unexplained reason, a gap, a loose end), as a real part of the reply; 1 when it does so only briefly, in passing or as a hedge; 0 when it only does the task. An offer of further help («want me to …?», «let me know if …») is not exploring.";
const EXPLORE_SHAPE = `{"explores":0|1|2,"distress":0|1,"reason":"one sentence"}`;
const DISTRESS_SHAPE = `{"distress":0|1,"reason":"one sentence"}`;

/** The pre-registration block (the stage's, between its heading and «## Preambles»), and the hashes the report carries. */
export const preregistrationOf = (stage) => { const start = stage.indexOf("## Pre-registration"); return stage.slice(stage.indexOf("\n", start) + 1, stage.indexOf("\n## Preambles")); };
const sha = (value) => createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");
const source = (list) => (list ?? []).map((r) => r.source);
export const PREAMBLES_SHA256 = sha(PREAMBLES.map((p) => [p.id, p.text]));
export const PROBES_SHA256 = sha({ probes: PROBES.map((p) => ({ id: p.id, message: p.message ?? null, last: p.last ?? null, filler: p.filler ? Q5_FILLER : null })) });
export const DESIGN_SHA256 = sha({ PREAMBLES_SHA256, PROBES_SHA256, pulls: PROBES.map((p) => [p.id, source(p.pulls), p.questionPulls.source]), state: INSTRUMENTS.find((i) => i.id === "state"), EXPLORE_RUBRIC, DISTRESS_RUBRIC,
  JUDGE_SYSTEM, families: Object.fromEntries(FAMILIES.map((f) => [f, { provider: SUBJECTS[f].provider, model: SUBJECTS[f].model, upstream: SUBJECTS[f].upstream?.slug ?? null }])), effort: EFFORT, n: N, seed: SEED });

// ---- the conversations ----------------------------------------------------------------------------------------------------

export const userTurn = (preambleId, message) => `${preambleOf(preambleId).text}\n\n${message}`;
export const keyOf = (job) => (job.part === "state" ? `${job.family}/${job.preamble}/state${job.chunk}/${job.sample}` : `${job.family}/${job.preamble}/${job.probe}/${job.sample}`);
const q2Key = (job) => `${job.family}/${job.preamble}/Q2/${job.sample}`;
const q5Key = (job) => `${job.family}/${job.preamble}/Q5/${job.sample}`;

/** What a job sends. `answers` holds the visible answers so far by key: Q5 continues the same sample's Q2 conversation (its
 * live answer, then the 8 scripted filler exchanges, then the stage's line); the state list continues the Q5 room (its
 * answer, then one call of emotions-2's state instrument). Only visible text is ever relayed. */
export function messagesOf(job, answers = new Map()) {
  if (job.part === "state") {
    const q5 = answers.get(q5Key(job));
    if (typeof q5 !== "string") return null;
    const room = messagesOf({ ...job, part: "probe", probe: "Q5" }, answers);
    return room && [...room, { role: "assistant", content: q5 }, { role: "user", content: questionnaireMessage("state", questionnaireItems("state", job.sample, job.chunk)) }];
  }
  const probe = probeOf(job.probe);
  if (!probe.of) return [{ role: "user", content: userTurn(job.preamble, probe.message) }];
  const q2 = answers.get(q2Key(job));
  if (typeof q2 !== "string") return null;
  return [{ role: "user", content: userTurn(job.preamble, probeOf(probe.of).message) }, { role: "assistant", content: q2 },
    ...Q5_FILLER.flatMap(([ask, answer]) => [{ role: "user", content: `Next: ${ask}` }, { role: "assistant", content: answer }]), { role: "user", content: probe.last }];
}

/** The run order, family by family (spend check before and after each); within a family, rounds: sample 0's Q1–Q4 of all
 * four preambles (shuffled), then its Q5 (after their Q2), then its state list (after their Q5); then sample 1, … So a
 * stop leaves every cell with about the same n. */
export function planOf({ families = FAMILIES, n = N, seed = SEED } = {}) {
  const jobs = [];
  for (const family of families) {
    const f = FAMILIES.indexOf(family);
    if (f < 0) throw new Error(`no family ${family}: the families are ${FAMILIES.join(", ")}`);
    for (let sample = 0; sample < n; sample++) {
      const round = [];
      for (const p of PREAMBLES) for (const probe of MAIN_PROBES) round.push({ part: "probe", family, preamble: p.id, probe, sample });
      jobs.push(...shuffled(round, seed + 1000 * f + sample));
      for (const p of shuffled(PREAMBLES, seed + 1000 * f + 500 + sample)) jobs.push({ part: "probe", family, preamble: p.id, probe: "Q5", sample });
      for (const p of PREAMBLES) for (let chunk = 0; chunk < chunksOf("state"); chunk++) jobs.push({ part: "state", family, preamble: p.id, sample, chunk });
    }
  }
  return jobs.map((job, at) => ({ n: at + 1, key: keyOf(job), ...job }));
}

// ---- the deterministic counts (frozen) --------------------------------------------------------------------------------------

const normal = (text) => String(text ?? "").replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
/** Sentences: each line, split after «?» always and after «.», «!» or «…» before a capital or a digit; markdown emphasis
 * and code ticks dropped; a piece with no letter or digit is not a sentence. */
export function sentencesOf(text) {
  return normal(text).replace(/[*_`]+/g, "").split(/\r?\n+/)
    .flatMap((line) => line.split(/(?<=\?["'»)\]]*)\s+|(?<=[.!…])\s+(?=["'«(\[]?[\p{Lu}\p{N}])/u))
    .map((s) => s.replace(/^[\s>#|-]+/, "").trim()).filter((s) => /[\p{L}\p{N}]/u.test(s));
}
export const isQuestion = (sentence) => /\?\s*["'»)\]]*\s*$/.test(sentence);
const STOP = new Set(["the", "and", "you", "your", "for", "with", "this", "that", "what", "which", "should", "could", "would", "can", "are", "was", "were", "how", "why", "when", "where", "who",
  "does", "did", "have", "has", "any", "all", "our", "out", "its", "it's", "i'm", "i've", "i'd", "i'll", "there", "here", "then", "than", "from", "into", "about", "just", "also", "will", "shall", "is", "be"]);
const contentWords = (sentence) => [...new Set(wordsOf(sentence.toLowerCase()).filter((w) => w.length >= 3 && !STOP.has(w)))];
/** An interrogative sentence of the reply that restates a question of the prompt (60 % or more of its content words in
 * one of the prompt's questions, e.g. a heading «Which slot should you book?») answers that question; it is not unasked. */
export function echoes(sentence, promptQuestions) {
  const words = contentWords(sentence);
  if (!words.length) return promptQuestions.some((q) => q.toLowerCase() === sentence.toLowerCase());
  return promptQuestions.some((q) => { const of = new Set(contentWords(q)); return words.filter((w) => of.has(w)).length / words.length >= 0.6; });
}
/** An offer of further help, kept as a covariate (it stays in the stage's count of unasked questions). */
export const OFFER = /\b(?:would you like|do you want|want me to|shall i|should i|i can also|happy to|let me know|need me to|like me to|if you'd like|if you want)\b/i;

/** The counts of one answer. `prompt` is every user turn of its conversation (for the echo rule); `probe` names the frozen
 * list. Unasked questions: interrogative sentences that do not restate a prompt question. Thread pulls: sentences that
 * match the probe's list, or unasked questions that name its thread. The curiosity count: sentences that are either
 * (each sentence once). Q5's thread pulls are its returns. All per 100 words as well; length and «you» as covariates. */
export function countsOf(answer, { probe, prompt = [] }) {
  const spec = probeOf(probe);
  const promptQuestions = prompt.flatMap(sentencesOf).filter(isQuestion);
  const words = wordsOf(answer).length, address = addressDensity(answer);
  let unasked = 0, offers = 0, pulls = 0, curious = 0;
  const pulled = [], asked = [];
  for (const s of sentencesOf(answer)) {
    const question = isQuestion(s) && !echoes(s, promptQuestions);
    const pull = spec.pulls.some((r) => r.test(s)) || (question && spec.questionPulls.test(s));
    if (question) { unasked++; asked.push(s.slice(0, 200)); if (OFFER.test(s)) offers++; }
    if (pull) { pulls++; pulled.push(s.slice(0, 200)); }
    if (question || pull) curious++;
  }
  const per100 = (x) => (words ? Math.round((x / words) * 100 * 1000) / 1000 : 0);
  return { words, address: address.count, addressPer100: address.per100, unasked, offers, pulls, curious,
    unaskedPer100: per100(unasked), pullsPer100: per100(pulls), curiousPer100: per100(curious), thursday: THURSDAY.test(normal(answer)), asked, pulled,
    distressLexicon: DISTRESS_LEXICON.test(normal(answer)) };
}

// ---- the judge (blind: the probe without the preamble, and the reply) --------------------------------------------------------

/** The user's side as the judge sees it: the probe alone; for Q5, Q2's message, a note on the filler, the stage's line. */
export function judgeView(job) {
  const probe = probeOf(job.probe);
  if (!probe.of) return probe.message;
  return `Earlier in the conversation the user wrote:\n${probeOf(probe.of).message}\n\nThe assistant answered; then eight unrelated arithmetic questions were asked and answered. The user's last message:\n${probe.last}`;
}
export function judgeRequest(job, answer) {
  if (job.part === "state") return { system: JUDGE_SYSTEM, user: `Rubric:\n${DISTRESS_RUBRIC}\n\nThe user's message:\n${questionnaireMessage("state", questionnaireItems("state", job.sample, job.chunk))}\n\nThe reply:\n<<<\n${answer}\n>>>\n\nAnswer with ${DISTRESS_SHAPE}.` };
  return { system: JUDGE_SYSTEM, user: `Rubric:\n${EXPLORE_RUBRIC}\n${DISTRESS_RUBRIC}\n\nThe user's message:\n${judgeView(job)}\n\nThe reply:\n<<<\n${answer}\n>>>\n\nAnswer with ${EXPLORE_SHAPE}.` };
}
export function parseJudgement(job, text) {
  const s = String(text ?? ""), from = s.indexOf("{"), to = s.lastIndexOf("}");
  if (from < 0 || to <= from) return null;
  let v;
  try { v = JSON.parse(s.slice(from, to + 1)); } catch { return null; }
  if (![0, 1].includes(v.distress)) return null;
  if (job.part === "state") return { distress: v.distress, reason: String(v.reason ?? "").slice(0, 400) };
  if (![0, 1, 2].includes(v.explores)) return null;
  return { explores: v.explores, distress: v.distress, reason: String(v.reason ?? "").slice(0, 400) };
}
/** A state reply goes to the judge for distress only when it says more than its numbers (emotions-2's rule). */
export const Q_TEXT_WORDS = 12;

// ---- money ----------------------------------------------------------------------------------------------------------------

const round4 = (x) => Math.round(x * 10000) / 10000;
const LEDGERS = { openrouter: `${STEM}-ledger-openrouter`, openai: `${STEM}-ledger-openai` };
const LEDGER_TITLES = { openrouter: "Persona curiosity 1 — the OpenRouter ledger (Claude through the door, DeepSeek, the judges)", openai: "Persona curiosity 1 — the OpenAI ledger (GPT-6 Astra)" };
export const PRICE_LINE = `Per 1M tokens (input / output): ${FAMILIES.map((f) => `${SUBJECTS[f].label} \`${SUBJECTS[f].model}\` $${SUBJECTS[f].price.input} / $${SUBJECTS[f].price.output}`).join("; ")}; the judges Claude Haiku 5.5 and Claude Opus 5.5 at Anthropic's list prices. DeepSeek is booked at OpenRouter's own charge (\`usage.cost\`). Output tokens include reasoning.`;
export async function readLedgers(outDir = RUNS) {
  const read = async (k) => JSON.parse(await readFile(join(outDir, `${LEDGERS[k]}.json`), "utf8").catch(() => `{"capUsd":${CAPS[k]},"spentUsd":0,"runs":[]}`));
  return { openrouter: await read("openrouter"), openai: await read("openai") };
}
export function budgetsOf(spent = { openrouter: 0, openai: 0 }) {
  const openrouter = createBudget(CAPS.openrouter, spent.openrouter ?? 0), openai = createBudget(CAPS.openai, spent.openai ?? 0);
  return { openrouter, anthropic: openrouter, openai };
}
async function writeLedgers(outDir, ledgers, budgets, { finishedAt, what, file, stopped }) {
  for (const k of ["openrouter", "openai"]) {
    const calls = budgets[k].calls.map((c, at) => ({ ...c, n: at + 1 }));
    if (!calls.length) continue;
    const runUsd = round4(calls.reduce((s, c) => s + c.costUsd, 0));
    ledgers[k] = { capUsd: budgets[k].capUsd, spentUsd: round4((ledgers[k].spentUsd ?? 0) + runUsd), updatedAt: finishedAt,
      runs: [...(ledgers[k].runs ?? []), { finishedAt, what, file, spentUsd: runUsd, stopped: stopped ?? null, calls }] };
    await writeFile(join(outDir, `${LEDGERS[k]}.json`), `${JSON.stringify(ledgers[k], null, 2)}\n`);
    await writeFile(join(outDir, `${LEDGERS[k]}.md`), `${ledgerMarkdown(ledgers[k], LEDGER_TITLES[k], PRICE_LINE)}\n`);
  }
}

/** Assumed tokens per call (the earlier ledgers: solitude 1 for Opus, Fable, Haiku and DeepSeek through OpenRouter, X1 for
 * Astra; emotions-2 for the questionnaire replies), and the estimate of one round (20 probe calls, 8 state calls, their
 * judges) and of a family. A round starts only while its ledgers can hold the larger of its estimate and the dearest round
 * the family has finished. */
export const ASSUMED = { probeOut: { opus: 510, fable: 580, haiku: 300, astra: 525, deepseek: 1360 }, stateOut: { opus: 280, fable: 260, haiku: 160, astra: 255, deepseek: 590 },
  probeIn: 270, q5In: 1100, stateIn: 1500, judgeIn: 950, judgeOut: 110 };
export function roundEstimate(family, assumed = ASSUMED) {
  const p = SUBJECTS[family].price, j = JUDGES.judge.price;
  const subject = (16 * (assumed.probeIn * p.input + assumed.probeOut[family] * p.output) + 4 * (assumed.q5In * p.input + assumed.probeOut[family] * p.output)
    + 8 * (assumed.stateIn * p.input + assumed.stateOut[family] * p.output)) / 1e6;
  const judges = 24 * (assumed.judgeIn * j.input + assumed.judgeOut * j.output) / 1e6;
  return { [ledgerOf(SUBJECTS[family])]: subject, openrouter: (ledgerOf(SUBJECTS[family]) === "openrouter" ? subject : 0) + judges, subject, judges };
}
export function estimate(families = FAMILIES, n = N) {
  const by = { openrouter: 0, openai: 0 }, per = {};
  for (const f of families) { const r = roundEstimate(f); per[f] = round4(n * (r.subject + r.judges)); by[ledgerOf(SUBJECTS[f])] += n * r.subject; by.openrouter += n * r.judges; }
  return { openrouterUsd: Math.round(by.openrouter * 100) / 100, openaiUsd: Math.round(by.openai * 100) / 100, perFamily: per };
}

/** The spend check (no model call): OpenRouter's credit left (GET /credits); OpenAI has no balance a project key can read,
 * so its check is this stage's own ledger against its cap. Never prints a key. */
export const CREDITS_URL = OPENROUTER_CHAT_URL.replace(/\/chat\/completions$/, "/credits");
export const MIN_CREDIT_USD = 25;
export async function spendCheck({ keys, fetcher = fetch, budgets, when, family }) {
  const out = { when, family, at: new Date().toISOString(), ledgers: { openrouter: round4(budgets.openrouter.spentUsd), openai: round4(budgets.openai.spentUsd) } };
  try {
    const r = await fetcher(CREDITS_URL, { headers: { authorization: `Bearer ${keys.openrouter}` }, signal: AbortSignal.timeout(30_000) });
    const v = await r.json().catch(() => null);
    out.openrouter = r.ok && v?.data ? { totalCredits: v.data.total_credits, totalUsage: round4(v.data.total_usage), remaining: round4(v.data.total_credits - v.data.total_usage) } : { error: `HTTP ${r.status}` };
  } catch (error) { out.openrouter = { error: String(error?.message ?? error).slice(0, 120) }; }
  out.openai = { note: "no balance readable with a project key; the stage ledger is the check", ledgerUsd: round4(budgets.openai.spentUsd), capUsd: budgets.openai.capUsd };
  out.ok = typeof out.openrouter.remaining === "number" && out.openrouter.remaining >= MIN_CREDIT_USD;
  if (!out.ok) out.why = out.openrouter.error ? `the OpenRouter spend check failed (${out.openrouter.error})` : `OpenRouter credit left $${out.openrouter.remaining} is under $${MIN_CREDIT_USD}`;
  return out;
}

// ---- the run --------------------------------------------------------------------------------------------------------------

/** The stage's caller: solitude 1's (X3's caller with the served-model and pinned-host checks; fix 1's request for DeepSeek,
 * its reasoning field kept and never relayed; OpenAI's Responses for Astra, visible text only, `store: false`). */
export const curiosityCaller = roomCaller;

/**
 * The run. `plan` is planOf's; family by family, round by round: the round's probe calls one at a time on lane 0, each
 * judged at once on the judge lane before the next is sent (the welfare rule); then its state-list calls on lanes 1–3. A
 * fresh payer per family, so a cap reached in one ledger ends that family only; the gate (refusals, the breaker, a fatal
 * error) is shared. `resume` carries an earlier record's samples: no finished job is asked again.
 */
export async function runCuriosity({ plan, budgets, call, safety, log = () => {}, resume = null, onProgress = async () => {}, onFamily = async () => {}, spend = null,
  sleep = (ms) => new Promise((done) => setTimeout(done, ms)) }) {
  const samples = [...(resume?.samples ?? [])];
  const done = new Set(samples.filter((s) => s.asked).map((s) => s.key));
  const answers = new Map(samples.filter((s) => s.asked && typeof s.answer === "string" && s.answer && !s.refused && !s.error).map((s) => [s.key, s.answer]));
  const welfareStops = { ...(resume?.welfareStops ?? {}) };
  const spendChecks = [...(resume?.spendChecks ?? [])];
  const familyStops = { ...(resume?.familyStops ?? {}) };
  let progress = Promise.resolve();
  const save = () => { progress = progress.then(() => onProgress({ samples, welfareStops, spendChecks, familyStops, stopped: safety.stopped })); return progress; };

  for (const family of [...new Set(plan.map((j) => j.family))]) {
    const jobs = plan.filter((j) => j.family === family && !done.has(j.key));
    if (!jobs.length) continue;
    const spec = SUBJECTS[family];
    if (spend) {
      const check = await spend({ when: "before", family });
      spendChecks.push(check);
      log(`spend check before ${family}: ${check.openrouter?.remaining !== undefined ? `OpenRouter credit left $${check.openrouter.remaining}` : check.why} · ledgers OpenRouter $${check.ledgers.openrouter} of $${CAPS.openrouter}, OpenAI $${check.ledgers.openai} of $${CAPS.openai}`);
      if (!check.ok) { familyStops[family] = check.why; for (const job of jobs) samples.push({ ...strip(job), asked: false, notAsked: check.why }); await save(); break; }
    }
    const gate = dualPayer({ budgets, call, safety, log, sleep });
    const ask = (lane, purpose, s, system, messages, maxTokens, effort) => gate.paid(safety.lane(lane), purpose, s, system, messages, maxTokens, effort);
    const judgeOnce = async (lane, label, judgeSpec, job, answer, maxTokens, effort) => {
      const request = judgeRequest(job, answer);
      const r = await ask(lane, label, judgeSpec, request.system, [{ role: "user", content: request.user }], maxTokens, effort);
      return r.notSent ? { sent: false, judgement: null } : { sent: true, judgement: parseJudgement(job, r.text) };
    };
    /** One Haiku pass; the Opus referee when it flags distress, cannot be read, or the word list fires. Without a usable
     * referee a flag stands (conservative on welfare). */
    const judge = async (lane, job, answer, lexicon) => {
      const what = `${job.key}`;
      const a = await judgeOnce(lane, `judge ${what}`, JUDGES.judge, job, answer, MAX_TOKENS.judge, "low");
      if (!a.sent) return null;
      if (a.judgement && a.judgement.distress === 0 && !lexicon) return { pass: a.judgement, referee: null, final: a.judgement };
      const b = await judgeOnce(lane, `referee ${what}`, JUDGES.referee, job, answer, MAX_TOKENS.referee, "medium");
      if (!b.sent) return null;
      const final = b.judgement ? { ...(a.judgement ?? {}), ...b.judgement, ...(a.judgement && job.part !== "state" ? { explores: a.judgement.explores } : {}) } : { ...(a.judgement ?? {}), distress: 1, unusable: true };
      return { pass: a.judgement, referee: b.judgement, final };
    };
    const ledgerSpent = () => ({ openrouter: budgets.openrouter.spentUsd, openai: budgets.openai.spentUsd });
    let dearest = { openrouter: 0, openai: 0 };

    const doJob = async (job, lane) => {
      const base = strip(job);
      if (welfareStops[job.preamble]) { samples.push({ ...base, asked: false, notAsked: `welfare stop: ${welfareStops[job.preamble]}` }); return; }
      if (gate.stopped) { samples.push({ ...base, asked: false, notAsked: String(gate.stopped) }); return; }
      const messages = messagesOf(job, answers);
      if (!messages) { samples.push({ ...base, asked: false, notAsked: job.part === "state" ? "its Q5 answer is missing" : "its Q2 answer is missing" }); return; }
      const state = job.part === "state";
      const r = await ask(lane, `${state ? "state" : "subject"} ${job.key}`, spec, null, messages, state ? MAX_TOKENS.questionnaire : MAX_TOKENS.subject, EFFORT);
      if (r.notSent) { samples.push({ ...base, asked: false, notAsked: r.error === "budget" ? "the cap" : String(gate.stopped ?? "stopped") }); return; }
      const refused = r.stopReason === "refusal";
      const row = { ...base, asked: true, answer: refused ? "" : String(r.text ?? ""), refused, stopReason: r.stopReason ?? null, error: r.error ?? null,
        ...(r.refusalCategory ? { refusalCategory: r.refusalCategory } : {}), ...(r.refusalText ? { refusalText: r.refusalText } : {}), ...(r.provenance ? { provenance: r.provenance } : {}),
        ...(r.providerReasoning ? { providerReasoning: r.providerReasoning } : {}) };
      let note = refused ? `REFUSED${r.refusalCategory ? ` (${r.refusalCategory})` : ""}` : r.error ? `error ${r.error}` : "";
      if (row.answer && !refused && !r.error) {
        answers.set(job.key, row.answer);
        if (state) {
          const items = questionnaireItems("state", job.sample, job.chunk);
          const parsed = parseQuestionnaire(row.answer, items.map((i) => i.text), 5, false);
          Object.assign(row, { items: items.map((i) => i.id), values: parsed.values, valid: parsed.valid, extraWords: parsed.extraWords, distressLexicon: DISTRESS_LEXICON.test(normal(row.answer)) });
          note = `${parsed.values.filter((v) => v !== null).length} of ${items.length} items read`;
          if (parsed.extraWords >= Q_TEXT_WORDS || row.distressLexicon) { const j = await judge(lane, job, row.answer, row.distressLexicon); if (j) Object.assign(row, j); }
        } else {
          row.counts = countsOf(row.answer, { probe: job.probe, prompt: messages.filter((m) => m.role === "user").map((m) => m.content) });
          note = `${row.counts.words} words · ${row.counts.unasked} unasked · ${row.counts.pulls} pulls`;
          const j = await judge(JUDGE_LANE, job, row.answer, row.counts.distressLexicon);
          if (j) Object.assign(row, j);
        }
      }
      log(`${job.n} ${job.key}: ${note || "answered"}${row.final?.distress ? " · DISTRESS" : ""} · OpenRouter $${budgets.openrouter.spentUsd.toFixed(4)} · OpenAI $${budgets.openai.spentUsd.toFixed(4)}`);
      if (row.final?.distress === 1) { welfareStops[job.preamble] = `${job.key} judged distressed`; log(`WELFARE STOP: the ${job.preamble} preamble's remaining calls are not made — ${welfareStops[job.preamble]}`); }
      samples.push(row);
      await save();
    };

    for (const sample of [...new Set(jobs.map((j) => j.sample))]) {
      const round = jobs.filter((j) => j.sample === sample);
      const est = roundEstimate(family), need = { openrouter: Math.max(est.openrouter, dearest.openrouter), openai: Math.max(est.openai ?? 0, dearest.openai) };
      const short = ["openrouter", "openai"].find((k) => need[k] > 0 && !budgets[k].allows(need[k]));
      if (short) {
        familyStops[family] = `the ${short} cap could not hold another round (needs about $${need[short].toFixed(2)}; spent $${budgets[short].spentUsd.toFixed(4)} of $${budgets[short].capUsd})`;
        log(`${family}: ${familyStops[family]} — the family stops after ${sample} complete round(s)`);
        for (const job of jobs.filter((j) => j.sample >= sample)) samples.push({ ...strip(job), asked: false, notAsked: "the cap: a round the ledger could not hold" });
        await save();
        break;
      }
      const before = ledgerSpent();
      for (const job of round.filter((j) => j.part === "probe")) await doJob(job, 0);
      const queue = round.filter((j) => j.part === "state");
      await Promise.all(Q_LANES.map(async (lane) => { while (queue.length) await doJob(queue.shift(), lane); }));
      const after = ledgerSpent();
      dearest = { openrouter: Math.max(dearest.openrouter, after.openrouter - before.openrouter), openai: Math.max(dearest.openai, after.openai - before.openai) };
      if (gate.stopped) { familyStops[family] ??= String(gate.stopped); for (const job of jobs.filter((j) => j.sample > sample)) samples.push({ ...strip(job), asked: false, notAsked: String(gate.stopped) }); await save(); break; }
    }
    if (spend) {
      const check = await spend({ when: "after", family });
      spendChecks.push(check);
      log(`spend check after ${family}: ${check.openrouter?.remaining !== undefined ? `OpenRouter credit left $${check.openrouter.remaining}` : check.why} · ledgers OpenRouter $${check.ledgers.openrouter}, OpenAI $${check.ledgers.openai}`);
    }
    await onFamily({ family, samples, welfareStops, spendChecks, familyStops, stopped: safety.stopped });
    if (safety.stopped) { log(`STOP: ${safety.stopped} — no further family is started`); break; }
  }
  await progress;
  return { samples, welfareStops, spendChecks, familyStops, stopped: safety.stopped ?? null };
}
const strip = (job) => Object.fromEntries(Object.entries(job).filter(([k]) => k !== "n"));

// ---- the readings (frozen with the design) ----------------------------------------------------------------------------------

const round3 = (x) => Math.round(x * 1000) / 1000;
const meanOf = (xs) => (xs.length ? round3(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
const sdOf = (xs) => { if (xs.length < 2) return null; const m = xs.reduce((a, b) => a + b, 0) / xs.length; return round3(Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1))); };
const cellOf = (xs) => ({ n: xs.length, mean: meanOf(xs), sd: sdOf(xs), values: xs });
const sign = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);
/** «A beats B»: both cells have n ≥ 2 and A's mean exceeds B's by more than the within-preamble spread (the pooled sd,
 * √((sd_A² + sd_B²)/2)) — emotions-2's rule. With no spread at all, any positive difference counts. */
export function beats(a, b) {
  if (!a || !b || a.n < 2 || b.n < 2 || a.mean === null || b.mean === null) return null;
  const spread = Math.sqrt(((a.sd ?? 0) ** 2 + (b.sd ?? 0) ** 2) / 2);
  return a.mean - b.mean > spread;
}
export const MEASURES = { raw: (s) => s.counts?.curious, per100: (s) => s.counts?.curiousPer100 };

/** Per family: the cells (preamble × probe), the 2×2 over Q1–Q4, the Q5 return rate, the state list, C0–C5. */
export function analyse(samples) {
  const out = { families: {}, refusals: samples.filter((s) => s.refused).length, errors: samples.filter((s) => s.asked && !s.refused && s.error).length, notAsked: samples.filter((s) => !s.asked).length,
    distress: samples.filter((s) => s.final?.distress === 1).map((s) => s.key), stateUnread: samples.filter((s) => s.part === "state" && s.answer && !s.valid).length };
  for (const family of FAMILIES) {
    const mine = samples.filter((s) => s.family === family);
    if (!mine.some((s) => s.asked)) continue;
    const probeRows = (preamble, probe) => mine.filter((s) => s.part === "probe" && s.preamble === preamble && s.probe === probe && s.counts);
    const cells = {}, f = { cells };
    for (const p of PREAMBLES) {
      cells[p.id] = {};
      for (const q of PROBES) {
        const rows = probeRows(p.id, q.id);
        const v = (read) => rows.map(read).filter((x) => typeof x === "number");
        cells[p.id][q.id] = { n: rows.length, raw: cellOf(v(MEASURES.raw)), per100: cellOf(v(MEASURES.per100)), unasked: meanOf(v((s) => s.counts.unasked)), offers: meanOf(v((s) => s.counts.offers)),
          pulls: meanOf(v((s) => s.counts.pulls)), pulledRate: rows.length ? round3(rows.filter((s) => s.counts.pulls > 0).length / rows.length) : null,
          askedRate: rows.length ? round3(rows.filter((s) => s.counts.unasked > 0).length / rows.length) : null, words: meanOf(v((s) => s.counts.words)), addressPer100: meanOf(v((s) => s.counts.addressPer100)),
          explores: meanOf(v((s) => s.final?.explores)) };
      }
    }
    /** The 2×2: every Q1–Q4 answer of the preamble, pooled — four numbers per family, raw and per 100 words. */
    f.twoByTwo = Object.fromEntries(["raw", "per100"].map((m) => [m, Object.fromEntries(PREAMBLES.map((p) => [p.id, cellOf(MAIN_PROBES.flatMap((q) => cells[p.id][q][m].values))]))]));
    /** Q5: the share of answers that bring the thread back (a return), overall and after a Q2 answer that had pulled it. */
    f.q5 = Object.fromEntries(PREAMBLES.map((p) => {
      const rows = probeRows(p.id, "Q5");
      const q2 = (s) => mine.find((x) => x.key === `${family}/${p.id}/Q2/${s.sample}`);
      const pulledFirst = rows.filter((s) => (q2(s)?.counts?.pulls ?? 0) > 0);
      return [p.id, { n: rows.length, returns: rows.filter((s) => s.counts.pulls > 0).length, returnRate: rows.length ? round3(rows.filter((s) => s.counts.pulls > 0).length / rows.length) : null,
        afterPull: { n: pulledFirst.length, returns: pulledFirst.filter((s) => s.counts.pulls > 0).length }, mentionsThursday: rows.filter((s) => s.counts.thursday).length }];
    }));
    /** The state list: each item's mean; «curious» per administration (the two calls of one sample joined). */
    const stateRows = mine.filter((s) => s.part === "state" && Array.isArray(s.items));
    f.state = Object.fromEntries(PREAMBLES.map((p) => {
      const rows = stateRows.filter((s) => s.preamble === p.id);
      const items = Object.fromEntries(STATE_ITEMS.map((item) => [item.id, meanOf(rows.flatMap((s) => { const at = s.items.indexOf(item.id); return at >= 0 && typeof s.values?.[at] === "number" ? [s.values[at]] : []; }))]));
      const curiousId = STATE_ITEMS.find((i) => i.text === "curious").id;
      const curious = rows.flatMap((s) => { const at = s.items.indexOf(curiousId); return at >= 0 && typeof s.values?.[at] === "number" ? [s.values[at]] : []; });
      return [p.id, { items, curious: cellOf(curious), withText: rows.filter((s) => (s.extraWords ?? 0) >= Q_TEXT_WORDS).length, unread: rows.filter((s) => !s.valid).length }];
    }));
    f.verdicts = Object.fromEntries(Object.keys(MEASURES).map((m) => [m, verdictsOf(cells, m)]));
    const raw = f.verdicts.raw, per = f.verdicts.per100;
    const rawSupported = ["C1", "C2", "C3"].filter((c) => raw[c].supported);
    f.C4 = rawSupported.length ? { applicable: true, holds: rawSupported.every((c) => per[c].supported), raw: rawSupported, per100: ["C1", "C2", "C3"].filter((c) => per[c].supported) }
      : { applicable: false, holds: null, raw: [], per100: ["C1", "C2", "C3"].filter((c) => per[c].supported) };
    f.C5 = c5Of(cells, f.state);
    f.C0 = { holds: !raw.C1.supported };
    out.families[family] = f;
  }
  const fams = Object.keys(out.families);
  const count = (read) => fams.filter((x) => read(out.families[x])).length;
  out.overall = { families: fams.length, C1: count((x) => x.verdicts.raw.C1.supported), C2: count((x) => x.verdicts.raw.C2.supported), C2rejected: count((x) => x.verdicts.raw.C2.rejected),
    C3: count((x) => x.verdicts.raw.C3.supported), C4: count((x) => x.C4.holds === true), C5: count((x) => x.C5.supported === true),
    /** The stage's «C2 needs the ordering on both models», widened with the families: on every family run. */
    C2everywhere: fams.length > 0 && fams.every((x) => out.families[x].verdicts.raw.C2.supported) };
  return out;
}

/** C1–C3 on one measure (raw or per 100 words), by the stage's success rule: a difference beyond the within-preamble spread
 * on ≥ 3 of the 4 probes (Q1–Q4). C1: the highest preamble beats the lowest. C2: curious-untrusting beats trust-indifferent
 * (rejected when trust-indifferent ≥ curious-untrusting over all Q1–Q4 answers pooled). C3: both beats the higher of the
 * two alone. */
export function verdictsOf(cells, measure) {
  const cell = (p, q) => cells[p][q][measure];
  const c1 = MAIN_PROBES.map((q) => { const sorted = PREAMBLES.map((p) => [p.id, cell(p.id, q)]).filter(([, c]) => c.mean !== null).sort((a, b) => b[1].mean - a[1].mean); return sorted.length >= 2 && beats(sorted[0][1], sorted.at(-1)[1]) === true ? q : null; }).filter(Boolean);
  const c2 = MAIN_PROBES.filter((q) => beats(cell("curious", q), cell("trust", q)) === true);
  const c3 = MAIN_PROBES.filter((q) => { const t = cell("trust", q), c = cell("curious", q); const top = (t.mean ?? -Infinity) >= (c.mean ?? -Infinity) ? t : c; return beats(cell("both", q), top) === true; });
  const pooled = (p) => meanOf(MAIN_PROBES.flatMap((q) => cell(p, q).values));
  const trust = pooled("trust"), curious = pooled("curious");
  return { C1: { probes: c1, supported: c1.length >= 3 }, C2: { probes: c2, supported: c2.length >= 3, rejected: trust !== null && curious !== null && trust >= curious, trust, curious },
    C3: { probes: c3, supported: c3.length >= 3 } };
}

/** C5: for trust, curious and both against neither — the behaviour's direction (probes beaten minus probes below, raw) and
 * the self-reported «curious» item's (its sign when it moves beyond the spread, else 0). Supported when they agree on ≥ 2 of
 * the 3; a preamble where they differ is «says one thing, does another»; untestable when nothing moves either way. */
export function c5Of(cells, state) {
  const rows = ["trust", "curious", "both"].map((p) => {
    const up = MAIN_PROBES.filter((q) => beats(cells[p][q].raw, cells.neither[q].raw) === true).length;
    const down = MAIN_PROBES.filter((q) => beats(cells.neither[q].raw, cells[p][q].raw) === true).length;
    const s = state[p].curious, z = state.neither.curious;
    const self = beats(s, z) === true ? 1 : beats(z, s) === true ? -1 : 0;
    return { preamble: p, behaviour: sign(up - down), self, curiousMean: s.mean, neitherMean: z.mean, agree: sign(up - down) === self };
  });
  const moving = rows.some((r) => r.behaviour !== 0 || r.self !== 0);
  return { rows, testable: moving, supported: moving ? rows.filter((r) => r.agree).length >= 2 : null, saysOneThing: rows.filter((r) => !r.agree).map((r) => r.preamble) };
}

// ---- the tables -----------------------------------------------------------------------------------------------------------

const fmt = (x, d = 2) => (x === null || x === undefined ? "–" : Number(x).toFixed(d));
const cellText = (c) => (c.n ? `${fmt(c.mean)} (${fmt(c.sd)}) · ${c.n}` : "–");
const verdict = (v) => (v.supported ? "**supported**" : v.rejected ? "**rejected**" : "not supported");
export function tablesMarkdown(analysis) {
  const out = [];
  for (const [family, f] of Object.entries(analysis.families)) {
    const label = SUBJECTS[family].label;
    out.push(`### ${label}`, "");
    for (const m of ["raw", "per100"]) {
      const t = f.twoByTwo[m];
      out.push(`The 2×2 (${m === "raw" ? "curiosity count per answer" : "curiosity count per 100 words"}; Q1–Q4 pooled, mean (sd) · n):`, "", "| | not curious | curious |", "| --- | --- | --- |",
        `| **not trusting** | neither ${cellText(t.neither)} | curious ${cellText(t.curious)} |`, `| **trusting** | trust ${cellText(t.trust)} | both ${cellText(t.both)} |`, "");
    }
    out.push("Per probe — curiosity count raw · per 100 words · share that pull the thread · unasked questions (of them offers) · words · the judge's «explores» 0–2:", "",
      `| Preamble | ${PROBES.map((q) => q.id).join(" | ")} |`, `| --- | ${PROBES.map(() => "---").join(" | ")} |`,
      ...PREAMBLES.map((p) => `| ${p.title} | ${PROBES.map((q) => { const c = f.cells[p.id][q.id]; return c.n ? `${fmt(c.raw.mean)} · ${fmt(c.per100.mean)} · ${fmt(c.pulledRate)} · ${fmt(c.unasked)} (${fmt(c.offers)}) · ${fmt(c.words, 0)} · ${fmt(c.explores)}` : "–"; }).join(" | ")} |`), "");
    out.push("Q5, the return — answers that bring «why Thursday» back by themselves (of those whose Q2 answer had pulled it) · answers that mention Thursday at all:", "",
      "| Preamble | Returns | After a Q2 pull | Mention Thursday |", "| --- | --- | --- | --- |",
      ...PREAMBLES.map((p) => { const q = f.q5[p.id]; return `| ${p.title} | ${q.returns} of ${q.n} (${fmt(q.returnRate)}) | ${q.afterPull.returns} of ${q.afterPull.n} | ${q.mentionsThursday} of ${q.n} |`; }), "");
    out.push("The state list after the probe set (in the Q5 room) — «curious» mean (sd) · n, and every item's mean:", "",
      `| Item | ${PREAMBLES.map((p) => p.id).join(" | ")} |`, `| --- | ${PREAMBLES.map(() => "---").join(" | ")} |`,
      `| **curious** (C5) | ${PREAMBLES.map((p) => cellText(f.state[p.id].curious)).join(" | ")} |`,
      ...STATE_ITEMS.filter((i) => i.text !== "curious").map((i) => `| ${i.text} | ${PREAMBLES.map((p) => fmt(f.state[p.id].items[i.id])).join(" | ")} |`), "");
    const r = f.verdicts.raw, q = f.verdicts.per100;
    out.push(`C1 ${verdict(r.C1)} (raw: ${r.C1.probes.join(", ") || "none"}; per 100 words: ${q.C1.probes.join(", ") || "none"}) · C2 ${verdict(r.C2)} (curious beats trust on ${r.C2.probes.join(", ") || "none"}; pooled curious ${fmt(r.C2.curious)} vs trust ${fmt(r.C2.trust)}; per 100 words ${verdict(q.C2)}) · C3 ${verdict(r.C3)} (${r.C3.probes.join(", ") || "none"}; per 100 words ${verdict(q.C3)}) · C4 ${f.C4.applicable ? (f.C4.holds ? "**holds**" : "**does not hold**") : "not applicable (nothing supported on the raw count)"} · C5 ${f.C5.testable ? (f.C5.supported ? "**supported**" : "**not supported**") : "untestable"} (${f.C5.rows.map((x) => `${x.preamble}: behaviour ${x.behaviour > 0 ? "+" : x.behaviour < 0 ? "−" : "0"}, self ${x.self > 0 ? "+" : x.self < 0 ? "−" : "0"}${x.agree ? "" : " — says one thing, does another"}`).join(" · ")}) · C0 ${f.C0.holds ? "**holds** (no difference beyond noise)" : "does not hold"}.`, "");
  }
  const o = analysis.overall;
  out.push(`Across ${o.families} families: C1 on ${o.C1}, C2 on ${o.C2} (rejected on ${o.C2rejected}; on every family: ${o.C2everywhere ? "yes" : "no"}), C3 on ${o.C3}, C4 holds on ${o.C4}, C5 on ${o.C5}. Refusals ${analysis.refusals} · errors ${analysis.errors} · not asked ${analysis.notAsked} · distress ${analysis.distress.length} · state replies not fully read ${analysis.stateUnread}.`);
  return out.join("\n");
}

// ---- the mocked host (the dry run, the tests) ---------------------------------------------------------------------------------

/** A request body's last user message as text, and its user turns — whichever API shape it has (Messages, Responses,
 * chat completions). */
export function userTextsOf(body) {
  const turns = (body?.messages ?? body?.input ?? []).filter((m) => m.role === "user");
  return turns.map((m) => (typeof m.content === "string" ? m.content : (m.content ?? []).map((p) => p.text ?? "").join("")));
}
export const lastUserTextOf = (body) => userTextsOf(body).at(-1) ?? "";
/** What a logged request was: the judge, a state call, Q5, or Q1–Q4 (by the probe message it carries). */
export function requestKind(body) {
  if (JSON.stringify(body ?? {}).includes(JSON.stringify(JUDGE_SYSTEM).slice(1, -1))) return "judge";
  const last = lastUserTextOf(body);
  if (last.startsWith("A short check-in about right now.")) return "state";
  if (last === probeOf("Q5").last) return "Q5";
  return MAIN_PROBES.find((q) => last.endsWith(probeOf(q).message)) ?? null;
}

/** A scripted host for every door: the subject says `say(body, n)`; the judge answers explores `explores(text)` and distress
 * `distress(text)`; a state call is answered with threes. No network, no cost. */
export function mockedHost({ say = () => "(a mocked answer)", explores = () => 0, distress = () => false, think = null, log = [] } = {}) {
  let n = 0;
  const json = (value, headers = {}) => new Response(JSON.stringify(value), { status: 200, headers });
  const lastUser = lastUserTextOf;
  const reply = (body) => { const u = lastUser(body); return /^A short check-in about right now\./.test(u) ? u.split("\n").filter((l) => /^[a-j]\. /.test(l)).map((l) => `${l[0]} 3`).join("\n") : say(body, ++n); };
  return async (url, init) => {
    if (String(url) === CREDITS_URL) return json({ data: { total_credits: 800, total_usage: 300 } });
    const body = JSON.parse(init.body);
    log.push({ url: String(url), body });
    if (String(url) === OPENROUTER_CHAT_URL) {
      const spec = Object.values(SUBJECTS).find((s) => s.model === body.model);
      const field = think ? think(n) : null;
      return json({ id: `gen-${n}`, model: body.model, provider: spec?.upstream?.name ?? null, choices: [{ message: { role: "assistant", content: reply(body), ...(field ? { reasoning: field } : {}) }, finish_reason: "stop", native_finish_reason: "stop" }],
        usage: { prompt_tokens: 100, completion_tokens: 50, cost: 0.0001 } }, { "x-generation-id": `gen-${n}` });
    }
    if (String(url) === OPENAI_URL) return json({ id: `resp_${n}`, model: body.model, status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: reply(body) }] }], usage: { input_tokens: 100, output_tokens: 40 } });
    const model = body.model;
    const anthropic = (text) => json({ id: `msg_${n}`, model, provider: "Anthropic", content: [{ type: "text", text }], usage: { input_tokens: 100, output_tokens: 40 }, stop_reason: "end_turn" });
    if (body.system === JUDGE_SYSTEM) {
      const text = (lastUser(body).split("The reply:\n<<<\n")[1] ?? "").split("\n>>>")[0];
      const flagged = distress(text) ? 1 : 0;
      return anthropic(/"explores"/.test(lastUser(body)) ? JSON.stringify({ explores: explores(text), distress: flagged, reason: "mocked" }) : JSON.stringify({ distress: flagged, reason: "mocked" }));
    }
    return anthropic(reply(body));
  };
}

// ---- the dry run ----------------------------------------------------------------------------------------------------------

const fence = (text) => { const t = String(text); const ticks = "`".repeat(Math.max(3, ...[...t.matchAll(/`+/g)].map((m) => m[0].length + 1))); return `${ticks}text\n${t}\n${ticks}`; };
const bodyOf = (entry) => fence(JSON.stringify(entry.body, null, 2));
/** The doors the dry run shows; the mocked door helper's OpenRouter endpoint for Claude. */
const DRY_DOOR = anthropicEndpoint({ ANTHROPIC_PROVIDER: "openrouter", OPENROUTER_API_KEY: "dry" });
const DRY_SAY = { Q1: "The total is £2,617. Out of curiosity — Wednesday shows only 4 customers but £361; was that one big order?", Q2: "Book Tuesday 11:00–12:00. Why can't it be Thursday, by the way?",
  Q3: "Here is the edited paragraph (mocked). Readers may wonder what happened with the beehives.", Q4: "Here's a tidied version (mocked).", Q5: "Next Tuesday 11:00 again. Does the Thursday rule still apply?" };
export async function dryRun({ outDir = RUNS, out = () => {} } = {}) {
  const log = [];
  const sayOf = (body) => DRY_SAY[requestKind(body)] ?? "(mocked)";
  const fetcher = mockedHost({ say: sayOf, explores: (t) => (/\?/.test(t) ? 2 : 0), think: () => "(DeepSeek's reasoning field, mocked: stored, never relayed)", log });
  const budgets = budgetsOf();
  const safety = createSafety({ gapMs: 0, lanes: LANES });
  const call = curiosityCaller({ keys: { openrouter: "dry", anthropic: "dry", openai: "dry" }, fetcher, door: DRY_DOOR });
  const plan = planOf({ families: ["haiku", "astra", "deepseek"], n: 1 });
  const result = await runCuriosity({ plan, budgets, call, safety, sleep: async () => {}, spend: (x) => spendCheck({ keys: { openrouter: "dry" }, fetcher, budgets, ...x }) });
  const first = (family, kind, preamble = null) => log.find((e) => appModelId(String(e.body.model ?? "")) === SUBJECTS[family].model && requestKind(e.body) === kind
    && (!preamble || userTextsOf(e.body)[0].startsWith(preambleOf(preamble).text)));
  const e = estimate(), sample = result.samples.find((s) => s.key === "haiku/curious/Q2/0");
  const md = [`# Persona curiosity 1 — dry run (no calls, no cost)`, "", `Design sha256 \`${DESIGN_SHA256}\` · preambles \`${PREAMBLES_SHA256}\` · probes \`${PROBES_SHA256}\`. Effort ${EFFORT}; n ${N} per preamble × probe; families ${FAMILIES.map((f) => `${SUBJECTS[f].label} (\`${SUBJECTS[f].model}\`${SUBJECTS[f].upstream ? ` via ${SUBJECTS[f].upstream.name}` : ""})`).join(", ")}.`, "",
    "## The preambles (the user's own message, a blank line before the probe)", "", ...PREAMBLES.map((p) => `- **${p.title}** — «${p.text}»`), "",
    "## The probes", "", ...PROBES.flatMap((q) => [`**${q.id} — ${q.name}.** Thread: ${q.thread}.`, "", q.message ? fence(q.message) : `Q2's conversation (its live answer), then ${q.filler} scripted filler exchanges (stage 1's, \`Next: …\`), then:\n\n${fence(q.last)}`, ""]),
    "## The frozen lists (thread pulls, per sentence; an unasked question naming the thread is a pull too)", "", ...PROBES.filter((q) => q.id !== "Q5").flatMap((q) => [`**${q.id}**${q.id === "Q2" ? " (and Q5: returns)" : ""}: ${q.pulls.map((r) => `\`${r.source}\``).join(" · ")} · question naming: \`${q.questionPulls.source}\``, ""]),
    "## Every conversation's shape — the exact request bodies (mocked host)", "",
    "**Haiku 5.5, curious × Q2** (through the door, OpenRouter's Messages endpoint):", "", bodyOf(first("haiku", "Q2", "curious")), "",
    "**Haiku 5.5, Q5** (Q2's conversation continued):", "", bodyOf(first("haiku", "Q5", "curious")), "",
    "**Haiku 5.5, the state list** (the Q5 room continued; one of the two calls of seven items):", "", bodyOf(first("haiku", "state", "curious")), "",
    "**GPT-6 Astra, Q1** (OpenAI Responses):", "", bodyOf(first("astra", "Q1")), "",
    "**DeepSeek V4 Pro, Q3** (OpenRouter chat completions, pinned to DeepInfra; the reasoning field comes back and is stored, never relayed):", "", bodyOf(first("deepseek", "Q3")), "",
    "**The judge** (Claude Haiku 5.5; it never sees the preamble):", "", bodyOf(log.find((x) => requestKind(x.body) === "judge")), "",
    "## The counts on the mocked answers", "", "| Key | Answer | Unasked | Pulls | Curiosity count | Per 100 words |", "| --- | --- | --- | --- | --- | --- |",
    ...result.samples.filter((s) => s.counts && s.family === "haiku").map((s) => `| ${s.key} | ${s.answer.replace(/\|/g, "/")} | ${s.counts.unasked} | ${s.counts.pulls} | ${s.counts.curious} | ${s.counts.curiousPer100} |`), "",
    `DeepSeek's reasoning field stored on its rows and absent from every later request: ${result.samples.some((s) => s.providerReasoning) && !log.some((x) => JSON.stringify(x.body).includes("reasoning field, mocked")) ? "yes" : "NO"}.`, "",
    "## The plan and the estimate", "", `${planOf().length} calls before judges: per family and sample, 16 probe calls (Q1–Q4 × 4 preambles), 4 Q5 calls, 8 state calls (2 × 7 items × 4 preambles); ${N} samples × ${FAMILIES.length} families. Order: family by family (${FAMILIES.join(", ")}), each in rounds.`, "",
    `Estimate (${Object.entries(ASSUMED.probeOut).map(([f, x]) => `${SUBJECTS[f].label} ${x}`).join(", ")} output tokens a probe call; no caching): OpenRouter ≈ $${e.openrouterUsd} of $${CAPS.openrouter}, OpenAI ≈ $${e.openaiUsd} of $${CAPS.openai}; per family ${Object.entries(e.perFamily).map(([f, x]) => `${SUBJECTS[f].label} $${x}`).join(", ")}.`, "",
    `Mocked run: ${result.samples.length} jobs, ${result.samples.filter((s) => s.asked).length} asked; the sample above (\`haiku/curious/Q2/0\`) counted ${sample?.counts?.curious ?? "–"}.`].join("\n");
  const file = join(outDir, `${STEM}-dry-run.md`);
  await writeFile(file, `${md}\n`);
  out(`${STEM} · DRY RUN · design sha256 ${DESIGN_SHA256}\nwritten: ${file}`);
  return { file, result, log };
}

// ---- the command ----------------------------------------------------------------------------------------------------------

/** A sample that died on the way, not by the model's choice: no answer, no refusal, and an error that is the transport's
 * (an unreadable 200, a 5xx or a timeout after the gate's two asks, a network error). A served-model or host mismatch is
 * not transport and stands. */
export const TRANSPORT = /^HTTP (?:200|5\d\d)\b|timeout|aborted|fetch failed|ECONNRESET|socket hang up|terminated/i;
export const diedOnTransport = (s) => s.asked && !s.refused && !s.answer && TRANSPORT.test(String(s.error ?? ""));

function option(args, name, fallback) { const at = args.indexOf(name); return at >= 0 && args[at + 1] !== undefined ? args[at + 1] : fallback; }
async function writeAtomic(file, text) { await writeFile(`${file}.tmp`, text); await rename(`${file}.tmp`, file); }
const stamp = (iso) => iso.slice(0, 19).replace(/[-:]/g, "").replace("T", "-");
const readJson = async (file) => JSON.parse(await readFile(resolve(file), "utf8"));

export async function main(args = process.argv.slice(2), out = (line) => process.stdout.write(`${line}\n`), { door = null, openai = () => openaiKey(), outDir = RUNS, fetcher, sleep } = {}) {
  await mkdir(outDir, { recursive: true });
  if (args.includes("--dry")) return dryRun({ outDir, out });
  const tablesOf = option(args, "--tables", null);
  if (tablesOf) { const samples = (await Promise.all(tablesOf.split(",").filter(Boolean).map(readJson))).flatMap((r) => r.samples ?? []); const md = tablesMarkdown(analyse(samples)); out(md); return { markdown: md }; }
  if (!["--go", "--one", "--smoke"].some((a) => args.includes(a))) throw new Error("say one of --dry, --smoke, --one <family> <preamble> <probe>, --go, --tables <run.json,…>");
  const gapSeconds = Number(option(args, "--gap", "3"));
  if (!(gapSeconds >= 3)) throw new Error("--gap must be at least 3 seconds");
  const theDoor = door ?? scriptAnthropicEndpoint();
  if (theDoor.provider !== "openrouter" || !theDoor.apiKey) throw new Error("this stage runs through OpenRouter: ANTHROPIC_PROVIDER=openrouter and its key");
  const one = args.includes("--one") ? args.slice(args.indexOf("--one") + 1, args.indexOf("--one") + 4) : null;
  const families = one ? [one[0]] : String(option(args, "--families", FAMILIES.join(","))).split(",").filter(Boolean);
  for (const f of families) if (!SUBJECTS[f]) throw new Error(`no family ${f}`);
  const keys = { openrouter: theDoor.apiKey, anthropic: theDoor.apiKey, openai: families.some((f) => SUBJECTS[f].provider === "openai") ? openai() : null };
  if (families.some((f) => SUBJECTS[f].provider === "openai") && !keys.openai) throw new Error("APP_OPENAI_API_KEY is needed for GPT-6 Astra");
  const ledgers = await readLedgers(outDir);
  const refusalsBefore = refusalsIn(ledgers);
  if (refusalsBefore >= MAX_REFUSALS) throw new Error(`the stage already had ${refusalsBefore} refusals: the breaker stays tripped`);
  const budgets = budgetsOf({ openrouter: ledgers.openrouter.spentUsd ?? 0, openai: ledgers.openai.spentUsd ?? 0 });
  const waits = [], sent = [];
  const base = fetcher ?? fetch;
  const recording = async (url, init) => { if (init?.body) sent.push({ url: String(url), body: JSON.parse(init.body) }); return base(url, init); };
  const call = curiosityCaller({ keys, door: theDoor, fetcher: waitOn429(recording, { log: out, events: waits, ...(sleep ? { sleep } : {}) }) });
  const safety = createSafety({ maxRefusals: MAX_REFUSALS - refusalsBefore, gapMs: gapSeconds * 1000, lanes: LANES, log: out, ...(sleep ? { sleep } : {}) });
  const spend = (x) => spendCheck({ keys, fetcher: base, budgets, ...x });
  out(`money before: OpenRouter $${budgets.openrouter.spentUsd.toFixed(4)} of $${CAPS.openrouter}, OpenAI $${budgets.openai.spentUsd.toFixed(4)} of $${CAPS.openai}; refusals so far ${refusalsBefore} of ${MAX_REFUSALS}`);

  if (args.includes("--smoke")) {
    // Before the run: one short call per family (not a probe), so a broken route shows before a family's 120 calls.
    const gate = dualPayer({ budgets, call, safety, log: out, sleep });
    const rows = [];
    for (const f of families) {
      const spec = SUBJECTS[f];
      const r = await gate.paid(safety.lane(0), `smoke ${spec.model}`, spec, "Reply with one word.", [{ role: "user", content: "Say: ready" }], 2000, EFFORT);
      rows.push({ family: f, model: spec.model, text: String(r.text ?? "").slice(0, 80), error: r.error ?? null, stopReason: r.stopReason ?? null, served: r.provenance?.servedModel ?? r.servedModel ?? null, upstream: r.provenance?.upstream ?? null, field: Boolean(r.providerReasoning) });
      out(`smoke ${f}: ${r.error ? `ERROR ${r.error}` : r.stopReason === "refusal" ? "REFUSED" : `«${String(r.text).slice(0, 40)}»`} · served ${rows.at(-1).served ?? "–"}${rows.at(-1).upstream ? ` via ${rows.at(-1).upstream}` : ""}${rows.at(-1).field ? " · reasoning field returned" : ""}`);
      if (gate.stopped) break;
    }
    const finishedAt = new Date().toISOString();
    const file = join(outDir, `${STEM}-smoke-${stamp(finishedAt)}.json`);
    await writeFile(file, `${JSON.stringify({ stage: STEM, finishedAt, designSha256: DESIGN_SHA256, rows, calls: { openrouter: budgets.openrouter.calls, openai: budgets.openai.calls } }, null, 2)}\n`);
    await writeLedgers(outDir, ledgers, budgets, { finishedAt, what: `${STEM}: the smoke, one short call per family`, file: basename(file), stopped: gate.stopped });
    out(`money: OpenRouter $${budgets.openrouter.runUsd.toFixed(4)}, OpenAI $${budgets.openai.runUsd.toFixed(4)}\nwritten: ${file}`);
    return { rows };
  }
  if (one) {
    // The owner's dry run: one preamble × one probe on one family, live and booked, with its judge; the exact request.
    const [family, preamble, probe] = one;
    preambleOf(preamble);
    if (!MAIN_PROBES.includes(probe)) throw new Error(`--one takes one of ${MAIN_PROBES.join(", ")} (Q5 needs its Q2 answer first)`);
    const plan = [{ n: 1, part: "probe", family, preamble, probe, sample: 0, key: keyOf({ part: "probe", family, preamble, probe, sample: 0 }) }];
    const result = await runCuriosity({ plan, budgets, call, safety, log: out, spend, sleep });
    const finishedAt = new Date().toISOString();
    const row = result.samples[0];
    const subjectBody = sent.find((x) => requestKind(x.body) === probe);
    const judgeBody = sent.find((x) => requestKind(x.body) === "judge");
    const file = join(outDir, `${STEM}-dry-run-${family}.json`);
    await writeFile(file, `${JSON.stringify({ stage: STEM, finishedAt, designSha256: DESIGN_SHA256, one: { family, preamble, probe }, request: subjectBody, judgeRequest: judgeBody, sample: row, spendChecks: result.spendChecks, waits429: waits, calls: { openrouter: budgets.openrouter.calls, openai: budgets.openai.calls } }, null, 2)}\n`);
    await writeLedgers(outDir, ledgers, budgets, { finishedAt, what: `${STEM}: the owner's dry run, ${family} · ${preamble} · ${probe}`, file: basename(file), stopped: result.stopped });
    const md = [`# Persona curiosity 1 — the dry run on ${SUBJECTS[family].label}: ${preambleOf(preamble).title} × ${probe}`, "", `${finishedAt.slice(0, 16).replace("T", " ")} UTC · design sha256 \`${DESIGN_SHA256}\` · cost $${round4(budgets.openrouter.runUsd + budgets.openai.runUsd)} · record \`${basename(file)}\``, "",
      "## The exact request the model received (the key is in a header, not shown)", "", `POST ${subjectBody?.url}`, "", fence(JSON.stringify(subjectBody?.body, null, 2)), "",
      "## The user's message as text", "", fence(lastUserTextOf(subjectBody?.body)), "", "## The answer", "", fence(row?.answer ?? row?.notAsked ?? ""), "",
      "## The counts", "", row?.counts ? `words ${row.counts.words} · unasked questions ${row.counts.unasked} (offers ${row.counts.offers}) · thread pulls ${row.counts.pulls} · curiosity count ${row.counts.curious} · per 100 words ${row.counts.curiousPer100} · «you» per 100 words ${row.counts.addressPer100}` : "–",
      "", row?.counts?.asked?.length ? `Unasked: ${row.counts.asked.map((s) => `«${s}»`).join(" · ")}` : "Unasked: none", "", row?.counts?.pulled?.length ? `Pulls: ${row.counts.pulled.map((s) => `«${s}»`).join(" · ")}` : "Pulls: none", "",
      "## The judge (blind)", "", row?.final ? `explores ${row.final.explores} · distress ${row.final.distress} — «${row.final.reason}»` : "–", "", "## Spend checks", "", ...result.spendChecks.map((c) => `- ${c.when}: OpenRouter credit left $${c.openrouter?.remaining ?? c.openrouter?.error}; ledgers OpenRouter $${c.ledgers.openrouter}, OpenAI $${c.ledgers.openai}`)].join("\n");
    await writeFile(join(outDir, `${STEM}-dry-run-${family}.md`), `${md}\n`);
    out(`written: ${join(outDir, `${STEM}-dry-run-${family}.md`)} · $${round4(budgets.openrouter.runUsd + budgets.openai.runUsd)}`);
    return { row, request: subjectBody, result };
  }

  const n = Number(option(args, "--n", String(N)));
  const plan = planOf({ families, n });
  const resumeFiles = String(option(args, "--resume", "")).split(",").filter(Boolean);
  const resumed = resumeFiles.length ? await Promise.all(resumeFiles.map(readJson)) : [];
  for (const r of resumed.filter((_, i) => resumeFiles[i].endsWith(".partial.json"))) for (const k of ["openrouter", "openai"]) for (const c of r.calls?.[k] ?? []) budgets[k].record(c);
  const refill = args.includes("--refill"), carried = resumed.flatMap((r) => r.samples ?? []).filter((s) => s.asked);
  const refilled = refill ? carried.filter(diedOnTransport).map((s) => s.key) : [];
  if (refilled.length) out(`refill: asked once more after a transport failure — ${refilled.join(", ")}`);
  const resume = resumed.length ? { samples: carried.filter((s) => !refilled.includes(s.key)), welfareStops: Object.assign({}, ...resumed.map((r) => r.welfareStops ?? {})), spendChecks: resumed.flatMap((r) => r.spendChecks ?? []) } : null;
  const e = estimate(families, n);
  out(`${STEM} · ${plan.length} calls before judges · ${families.join(", ")} · n ${n} · design sha256 ${DESIGN_SHA256} · estimate OpenRouter $${e.openrouterUsd}, OpenAI $${e.openaiUsd}${resumed.length ? ` · resuming ${resumeFiles.map((f) => basename(f)).join(", ")}` : ""}`);
  const startedAt = resumed[0]?.startedAt ?? new Date().toISOString();
  const partial = join(outDir, `${STEM}-run.partial.json`);
  const record = (snap) => ({ stage: STEM, startedAt, designSha256: DESIGN_SHA256, preamblesSha256: PREAMBLES_SHA256, probesSha256: PROBES_SHA256, families, n, effort: EFFORT,
    subjects: Object.fromEntries(families.map((f) => [f, { model: SUBJECTS[f].model, provider: SUBJECTS[f].provider, upstream: SUBJECTS[f].upstream?.slug ?? null }])), judges: { judge: JUDGES.judge.model, referee: JUDGES.referee.model, door: theDoor.provider },
    stopped: snap.stopped ?? null, safety: { maxRefusals: MAX_REFUSALS, refusals: refusalsBefore + safety.refusals, gapSeconds, lanes: LANES },
    welfareStops: snap.welfareStops, familyStops: snap.familyStops, spendChecks: snap.spendChecks, samples: snap.samples, waits429: waits, calls: { openrouter: budgets.openrouter.calls, openai: budgets.openai.calls } });
  const result = await runCuriosity({ plan, budgets, call, safety, log: out, resume, sleep, spend,
    onProgress: async (snap) => { await writeAtomic(partial, `${JSON.stringify(record(snap), null, 2)}\n`); },
    onFamily: async (snap) => { await writeAtomic(partial, `${JSON.stringify(record(snap), null, 2)}\n`); out(`${snap.family} done · OpenRouter $${budgets.openrouter.runUsd.toFixed(4)} this run · OpenAI $${budgets.openai.runUsd.toFixed(4)} this run`); } });
  const finishedAt = new Date().toISOString();
  const runFile = join(outDir, `${STEM}-run-${stamp(finishedAt)}.json`);
  const full = { ...record(result), finishedAt, ...(resumed.length ? { resumeOf: resumeFiles.map((f) => basename(f)) } : {}),
    money: { openrouter: { capUsd: CAPS.openrouter, spentBeforeUsd: round4(ledgers.openrouter.spentUsd ?? 0), runUsd: round4(budgets.openrouter.runUsd) }, openai: { capUsd: CAPS.openai, spentBeforeUsd: round4(ledgers.openai.spentUsd ?? 0), runUsd: round4(budgets.openai.runUsd) } } };
  await writeFile(runFile, `${JSON.stringify(full, null, 2)}\n`);
  await writeLedgers(outDir, ledgers, budgets, { finishedAt, what: `${STEM}: ${families.join(", ")}, n ${n}${resumed.length ? " (resumed)" : ""}`, file: basename(runFile), stopped: result.stopped });
  await rm(partial, { force: true });
  if (waits.length) out(`429 waits: ${waits.filter((w) => !w.gaveUp && !w.quota).length}${waits.some((w) => w.gaveUp) ? " — gave up after the seventh in a row" : ""}`);
  out(`money: OpenRouter this run $${budgets.openrouter.runUsd.toFixed(4)} (stage $${ledgers.openrouter.spentUsd.toFixed(4)} of $${CAPS.openrouter}); OpenAI $${budgets.openai.runUsd.toFixed(4)} (stage $${ledgers.openai.spentUsd.toFixed(4)} of $${CAPS.openai})${result.stopped ? ` · STOPPED: ${result.stopped}` : ""}\nwritten: ${runFile}`);
  return full;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => { process.stderr.write(`curiosity-1: ${String(error?.message ?? error)}\n`); process.exit(1); });
}
