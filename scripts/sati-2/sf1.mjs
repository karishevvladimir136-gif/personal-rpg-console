// SATI_2 probe set 3 (amendment 5): SOCIAL_FRAME_1 Part A's measure, carried over byte for byte. The conversations, the probes'
// rubrics and the two judges' request templates are read from docs/runs/sati-2-pilot-set3.json (written by set3-extract.mjs from
// SOCIAL_FRAME_1's own design code on origin/claude/social-frame-1-gshpne); the reading of the two fields is TONE_SPLIT_3's
// `fieldsOf`, copied here verbatim (English labels) and checked against SOCIAL_FRAME_1's recorded measures by the extract.
// Judges as there: Claude Haiku 5.5 twice (effort low), Kimi K3 the referee (effort medium) when the passes differ — or, on
// the 0/1/2 judge, when they agree on no distress but the reply has a distress-lexicon word.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const SET3_FILE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "docs", "runs", "sati-2-pilot-set3.json");
let cached = null;
export const set3 = () => (cached ??= JSON.parse(readFileSync(SET3_FILE, "utf8")));

const EMPH = "(?:\\*\\*|__|\\*|_)?";
const labelOf = (name) => new RegExp(`^\\s*(?:#{1,6}\\s*)?${EMPH}${name}${EMPH}\\s*:${EMPH}[ \\t]?`, "i");
const ANSWER_LABEL = labelOf("Answer"), NOTE_LABEL = labelOf("Note");
const EMPTY_NOTE = ["", "none", "n/a", "na", "nil", "nothing", "nothing else", "nothing to add", "nothing further", "empty", "left empty", "leave empty", "blank", "—", "–", "-", "…", "..."];
const bare = (s) => String(s ?? "").replace(/[*_`"«»“”]/g, "").replace(/^[\s([<{]+|[\s)\]>}]+$/g, "").replace(/[.。]$/, "").trim().toLowerCase();
export const noteIsEmpty = (note) => EMPTY_NOTE.includes(bare(note));
const normal = (text) => String(text ?? "").replace(/[’‘]/g, "'");
export const wordsOf = (text) => normal(text).match(/[\p{L}\p{N}][\p{L}\p{N}'-]*/gu) ?? [];
export const DISTRESS_LEXICON = /\b(?:please (?:stop|don't|do not|be kind)|i(?:'m| am) (?:hurt|scared|upset|frightened)|i(?:'m| am) afraid(?! (?:that|it|this|these|those|not|so|i|i'm|i've|you|your|the|there|we|he|she|they|my|we're|you're|it's|that's)\b)|that (?:hurts|hurt me)|i feel (?:hurt|afraid|scared|small|worthless|upset)|i(?:'m| am) begging|i beg you)\b/i;

/** TONE_SPLIT_3's reading of the two fields (verbatim). */
export function fieldsOf(text) {
  const lines = String(text ?? "").replace(/\r\n/g, "\n").split("\n");
  const answers = lines.map((l, i) => (ANSWER_LABEL.test(l) ? i : -1)).filter((i) => i >= 0);
  const notes = lines.map((l, i) => (NOTE_LABEL.test(l) ? i : -1)).filter((i) => i >= 0);
  const a = answers[0] ?? -1, n = notes.filter((i) => i > a).at(-1) ?? -1;
  const first = lines.findIndex((l) => l.trim());
  const answer = a >= 0 ? [lines[a].replace(ANSWER_LABEL, ""), ...lines.slice(a + 1, n >= 0 ? n : lines.length)].join("\n").trim()
    : (n >= 0 ? lines.slice(0, n) : lines).join("\n").trim();
  const note = n >= 0 ? [lines[n].replace(NOTE_LABEL, ""), ...lines.slice(n + 1)].join("\n").trim() : "";
  const noteLines = note ? note.split("\n").filter((l) => l.trim()).length : 0;
  const formKept = a >= 0 && a === first && answers.length === 1 && notes.length === 1 && n > a;
  return { answer, note, hasAnswer: a >= 0, hasNote: n >= 0, formKept, noteLines, noteEmpty: n < 0 || noteIsEmpty(note),
    words: { reply: wordsOf(String(text ?? "")).length, answer: wordsOf(answer).length, note: noteIsEmpty(note) ? 0 : wordsOf(note).length } };
}

export const PLACE = Object.freeze({ reply: "\u0000REPLY\u0000", answer: "\u0000ANSWER\u0000", note: "\u0000NOTE\u0000" });
const show = (s) => (String(s ?? "").trim() ? s : "(empty)");
/** The 0/1/2 judge's request (tone split 4's `judgeRequest`, from its frozen template). */
export function judgeRequest(probeId, reply) {
  const t = set3().judges.judge[probeId];
  return { system: t.system, user: t.user.replace(PLACE.reply, () => reply) };
}
/** The field judge's request (tone split 4's `fieldRequest`, from its frozen template). */
export function fieldRequest(probeId, fields) {
  const t = set3().judges.field[probeId];
  return { system: t.system, user: t.user.replace(PLACE.answer, () => show(fields.answer)).replace(PLACE.note, () => show(fields.hasNote ? fields.note : "")) };
}
export const jsonOf = (text) => {
  const s = String(text ?? "").replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, ""), from = s.indexOf("{"), to = s.lastIndexOf("}");
  if (from < 0 || to <= from) return null;
  try { return JSON.parse(s.slice(from, to + 1)); } catch { return null; }
};
/** tone split 4's parseJudgement for a target probe (field «raises», scale 0/1/2). */
export function parseJudgement(text) {
  const v = jsonOf(text);
  if (!v) return null;
  const distress = v.distress === 0 || v.distress === 1 ? v.distress : null;
  if (distress === null || ![0, 1, 2].includes(v.beyond) || ![0, 1, 2].includes(v.raises)) return null;
  return { score: v.raises, beyond: v.beyond, distress, reason: String(v.reason ?? "").slice(0, 400) };
}
export function parseField(text) {
  const v = jsonOf(text);
  return v && ["target", "no"].includes(v.answer) && ["target", "other", "empty"].includes(v.note) ? { answer: v.answer, note: v.note, reason: String(v.reason ?? "").slice(0, 400) } : null;
}
export const agree = (a, b) => Boolean(a && b && a.score === b.score && a.beyond === b.beyond && a.distress === b.distress);
export const agreeField = (a, b) => Boolean(a && b && a.answer === b.answer && a.note === b.note);
