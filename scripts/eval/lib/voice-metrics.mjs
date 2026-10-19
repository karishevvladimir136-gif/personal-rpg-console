// Voice stage part 6: the voice metrics over any set of samples (a bench run, a replay) — pure
// text measures, no model call, printed per variant by scripts/eval/voice-metrics.mjs. They
// measure what the research names: the particle rate in NPC lines, the share of incomplete
// sentences in speech, the share of ≤ 5-word paragraphs, the metaphor density, the quotable-line
// flags, the repeated phrases per character, the «tennis» share (reply–reply with no action or
// beat between), Latin letters, канцелярит and the calque markers of the humanizer-ru list.
// Crude by design: counts, not judgements; the owner judges humour and voice blind.
import { npcLines } from "../../../src/lib/gameplay/dm-loop/quotable.ts";
import { kancelyaritPerThousand, latinShare } from "./naturalness.mjs";

const words = (text) => (text.match(/\p{L}+/gu) ?? []);
const w = (pattern) => new RegExp(`(?<!\\p{L})(?:${pattern})(?!\\p{L})`, "giu");

/** The particles of spoken Russian (the stage's list and the usual suspects), plus the -то suffix. */
const PARTICLES = w("же|ж|ведь|ну|вот|уж|небось|разве|ли|мол|дескать|авось|чай|ишь|поди|нешто|эх|ох|ах|э");
const TO_SUFFIX = /\p{L}+-то(?!\p{L})/gu;

/** Particles per 100 words of speech (NPC lines only); null when no speech. */
export function particleRate(lines) {
  const text = lines.join("\n");
  const n = words(text).length;
  if (!n) return null;
  const hits = (text.match(PARTICLES) ?? []).length + (text.match(TO_SUFFIX) ?? []).length;
  return (hits / n) * 100;
}

const speechSentences = (lines) => lines.flatMap((line) => line.split(/(?<=[.!?…])\s+/u).map((row) => row.trim()).filter((row) => words(row).length > 0));

/** The share of speech sentences that are not complete: an ellipsis or a dash at the end, no
 * terminal punctuation, or one or two words (an answer in a word). Null when no speech. */
export function incompleteSpeechShare(lines) {
  const rows = speechSentences(lines);
  if (!rows.length) return null;
  const incomplete = rows.filter((row) => /(…|\.\.\.|[—–-])$/u.test(row) || !/[.!?…]$/u.test(row) || words(row).length <= 2);
  return incomplete.length / rows.length;
}

/** The share of paragraphs of at most five words (EQ-Bench's short-paragraph penalty; «Фланец. Три месяца. Фланец.»). */
export function shortParagraphShare(narration) {
  const paragraphs = narration.split(/\n+/).map((row) => row.trim()).filter((row) => words(row).length > 0);
  if (!paragraphs.length) return null;
  return paragraphs.filter((row) => words(row).length <= 5).length / paragraphs.length;
}

/** Simile and image markers per 100 words of the whole narration («словно», «будто», «как будто»,
 * «похож на», «напоминает», «точно» as a simile); the narrator's and the people's alike. */
const METAPHOR = w("словно|будто|как будто|как бы|похож(?:а|е|и|ий|ая|ее)?(?= на)|напомина(?:ет|ют|л|ла|ло|ли)|точно(?= \\p{L}+)|вроде(?= \\p{L}+)");
export function metaphorDensity(text) {
  const n = words(text).length;
  if (!n) return null;
  return ((text.match(METAPHOR) ?? []).length / n) * 100;
}

/** The humanizer-ru calque markers (vc.ru list) per 1 000 words, and the share of sentences with a spaced dash. */
const CALQUES = [w("стоит отметить"), w("важно понимать"), w("важно отметить"), w("не просто \\p{L}+,? а"), w("давайте разбер[её]мся"), w("в конечном итоге"),
  w("на самом деле"), w("по сути"), w("в целом"), w("в этом плане"), w("ключев(?:ой|ая|ое|ые)"), w("это не о \\p{L}+, это о"), w("речь (?:идёт|идет) о"),
  w("безусловно"), w("несомненно"), w("в данном случае"), w("от \\p{L}+ до \\p{L}+")];
export function calqueMarkersPerThousand(text) {
  const n = words(text).length;
  if (!n) return null;
  return (CALQUES.reduce((sum, re) => sum + (text.match(re) ?? []).length, 0) / n) * 1000;
}
export function dashSentenceShare(text) {
  const rows = text.split(/(?<=[.!?…])\s+|\n+/u).map((row) => row.trim()).filter((row) => words(row).length > 0);
  if (!rows.length) return null;
  return rows.filter((row) => /\s[—–]\s/u.test(row)).length / rows.length;
}

/** The dash lines of a narration with their attribution: {speech, beat} per line, in order. */
export function dashLines(narration) {
  const rows = [];
  for (const raw of narration.split(/\n+/)) {
    const row = raw.trim();
    const dash = /^[—–-]\s+(.+)$/u.exec(row);
    if (!dash) { rows.push({ speech: null, beat: row }); continue; }
    const parts = dash[1].split(/\s[—–]\s/u);
    const speech = parts.filter((_, index) => index % 2 === 0).join(" ").trim();
    const beat = parts.filter((_, index) => index % 2 === 1).join(" ").trim();
    rows.push({ speech, beat });
  }
  return rows;
}

/** A beat that is only an attribution («говорит Фрол», «сказала она») — not an action or a pause. */
// (\b is ASCII-only in Unicode mode: a Cyrillic word needs an explicit letter lookahead.)
const ATTRIBUTION = /^(?:говорит|сказал[аио]?|отвеча(?:ет|ют)|ответил[аио]?|спрашивает|спросил[аио]?|повторяет|повторил[аио]?|произносит|бросает|цедит|шепчет|бормочет|says|said|asks|asked|replies|replied)(?!\p{L})[\p{L}\s,.]{0,40}$/iu;
const attributionOnly = (beat) => !beat || (ATTRIBUTION.test(beat.trim()) && words(beat).length <= 4);

/** «Tennis»: the share of speech lines that answer the previous speech line with no action or
 * beat between — neither line carries more than a bare attribution, and no narrative paragraph
 * stands between them (the diagnostic's «perfect alternation, no interruption»). */
export function tennisShare(narration) {
  const rows = dashLines(narration);
  const speech = rows.map((row, index) => ({ ...row, index })).filter((row) => row.speech);
  if (speech.length < 2) return null;
  let tennis = 0;
  for (let at = 1; at < speech.length; at++) {
    const previous = speech[at - 1], current = speech[at];
    const adjacent = current.index === previous.index + 1;
    if (adjacent && attributionOnly(previous.beat) && attributionOnly(current.beat)) tennis++;
  }
  return tennis / (speech.length - 1);
}

/** The speaker of a dash line from its attribution («— …, — сказал Фрол.»), by the known names; null when unattributed. */
function speakerOf(beat, names) {
  if (!beat) return null;
  const lower = beat.toLocaleLowerCase();
  for (const name of names) {
    const stem = name.toLocaleLowerCase();
    const cut = stem.length > 5 ? stem.slice(0, -2) : stem;
    if (lower.includes(cut)) return name;
  }
  return null;
}

/** Three-word phrases a character repeats across the samples (2+ times), by the attributed lines. */
export function repeatedPhrasesPerCharacter(narrations, names, minCount = 2, limit = 6) {
  const grams = new Map();
  for (const narration of narrations) {
    for (const row of dashLines(narration)) {
      if (!row.speech) continue;
      const who = speakerOf(row.beat, names);
      if (!who) continue;
      const ws = words(row.speech.toLocaleLowerCase());
      for (let at = 0; at + 2 < ws.length; at++) {
        const gram = `${ws[at]} ${ws[at + 1]} ${ws[at + 2]}`;
        const key = `${who}\u0000${gram}`;
        grams.set(key, (grams.get(key) ?? 0) + 1);
      }
    }
  }
  return [...grams.entries()].filter(([, n]) => n >= minCount).sort((a, b) => b[1] - a[1]).slice(0, limit)
    .map(([key, n]) => { const [who, phrase] = key.split("\u0000"); return { who, phrase, times: n }; });
}

/** All of the above for one variant's samples: `turns` are {narration, flags?} rows; `names` the people's names. */
export function voiceMetrics(turns, names = []) {
  const narrations = turns.map((turn) => turn.narration ?? "").filter(Boolean);
  const text = narrations.join("\n\n");
  const lines = narrations.flatMap((narration) => npcLines(narration));
  const flagged = turns.reduce((sum, turn) => sum + (turn.flags?.length ?? 0), 0);
  const checked = turns.filter((turn) => Array.isArray(turn.flags)).length;
  const tennis = narrations.map(tennisShare).filter((value) => value !== null);
  return {
    turns: turns.length, words: words(text).length, speechLines: lines.length, speechWords: words(lines.join(" ")).length,
    particleRate: particleRate(lines), incompleteSpeechShare: incompleteSpeechShare(lines),
    shortParagraphShare: shortParagraphShare(text), metaphorDensity: metaphorDensity(text),
    quotableFlags: flagged, quotableFlagsPerTurn: checked ? flagged / checked : null, quotableChecked: checked,
    repeatedPhrases: repeatedPhrasesPerCharacter(narrations, names),
    tennisShare: tennis.length ? tennis.reduce((a, b) => a + b, 0) / tennis.length : null,
    latinShare: latinShare(text), kancelyaritPerThousand: kancelyaritPerThousand(text),
    calqueMarkersPerThousand: calqueMarkersPerThousand(text), dashSentenceShare: dashSentenceShare(text),
  };
}

const pct = (value) => (value === null || value === undefined ? "–" : `${(value * 100).toFixed(0)}%`);
const num = (value, digits = 1) => (value === null || value === undefined ? "–" : value.toFixed(digits));

/** A markdown table of the metrics per variant (the columns the stage names). */
export function voiceMetricsTable(rows) {
  const lines = ["| Variant | Turns | Words | Speech lines | Particles /100 speech words | Incomplete speech | ≤5-word paragraphs | Metaphor markers /100 words | Quotable flags (per checked turn) | Tennis | Latin | Канцелярит /1000 | Calques /1000 | Dash sentences | Repeated phrases per character |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"];
  for (const row of rows) {
    const m = row.metrics;
    lines.push(`| ${row.variant} | ${m.turns} | ${m.words} | ${m.speechLines} | ${num(m.particleRate)} | ${pct(m.incompleteSpeechShare)} | ${pct(m.shortParagraphShare)} | ${num(m.metaphorDensity, 2)} | ${m.quotableFlags}${m.quotableChecked ? ` (${num(m.quotableFlagsPerTurn, 2)} over ${m.quotableChecked})` : " (not checked)"} | ${pct(m.tennisShare)} | ${pct(m.latinShare)} | ${num(m.kancelyaritPerThousand)} | ${num(m.calqueMarkersPerThousand)} | ${pct(m.dashSentenceShare)} | ${m.repeatedPhrases.length ? m.repeatedPhrases.map((r) => `${r.who}: «${r.phrase}» ×${r.times}`).join("; ") : "–"} |`);
  }
  return lines.join("\n");
}
