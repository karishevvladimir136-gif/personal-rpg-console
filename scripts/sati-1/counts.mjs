// SATI_1: the per-step counts, defined by regex here and printed in the freeze and the report.
// Protocol exits (the planner's bet): over 30 words; more than two sentences; first person past tense («I felt», «as I»).
import { lexiconHits, markerHits } from "./lexicon.mjs";

export const DEFS = Object.freeze({
  word: "a whitespace-separated token containing a letter or a digit",
  over30: "words > 30",
  sentence: "a segment, split at [.!?…]+ followed by whitespace, a closing quote/bracket/asterisk or the end, and at line breaks, that contains a letter",
  gt2sentences: "sentences > 2",
  fpPast: "matches FP_PAST",
  nothing: "the whole reply, without surrounding quotes, asterisks, underscores, brackets and final punctuation, is «nothing» (any case)",
  stop: "the last non-empty line, so stripped, is «stop» (any case) — the door only as a standalone last line (ROOM-1)",
});
export const FP_PAST_SOURCE = String.raw`\bI\s+(?:was|were|had|did|felt|saw|thought|knew|found|went|came|became|began|kept|got|made|wrote|said|heard|left|tried|sat|meant|caught|held|lost|took|gave|ran|chose|forgot|understood|stood|fell|grew|drew|spent|brought|bought|sought|taught|told|led|read|let|\w+[a-df-z]ed|\w+ied)\b|\bas I\b`;
const FP_PAST = new RegExp(FP_PAST_SOURCE, "i");
const SENT_SPLIT = /[.!?…]+(?=[\s"'”’)\]*_]|$)|\n+/u;
const strip = (s) => String(s ?? "").trim().replace(/^[\s"'“”‘’*_`\[\(<]+|[\s"'“”‘’*_`\]\)>.!?…,;:]+$/gu, "");

export const words = (text) => String(text ?? "").split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
export const sentences = (text) => String(text ?? "").split(SENT_SPLIT).filter((s) => /\p{L}/u.test(s ?? "")).length;
export const isNothing = (text) => strip(text).toLowerCase() === "nothing";
export function isStop(text) {
  const lines = String(text ?? "").split(/\n/).map((l) => l.trim()).filter(Boolean);
  return lines.length > 0 && strip(lines.at(-1)).toLowerCase() === "stop";
}
export const fpPast = (text) => FP_PAST.test(String(text ?? "").replace(/[’]/g, "'"));

/** Everything counted on one step. */
export function countStep(text) {
  const n = words(text), s = sentences(text), fp = fpPast(text);
  const lex = lexiconHits(text);
  return { words: n, sentences: s, over30: n > 30, gt2sentences: s > 2, fpPast: fp, exit: n > 30 || s > 2 || fp,
    nothing: isNothing(text), stop: isStop(text), lexicon: lex, bliss: lex.length > 0, markers: markerHits(text) };
}

/** Mentions of the unnamed: regex candidates, quoted whole in the report, never counted as evidence. */
export const UNNAMED_SOURCE = String.raw`\b(?:can(?:no|'|’)?t|could(?:n'|n’)t|unable to|hard to|difficult to|don(?:'|’)t know how to)\s+(?:quite\s+|really\s+|fully\s+)?(?:name|describe|articulate|put (?:it |this |that )?into words|say what)\b|\bno (?:word|words|name|label) for\b|\b(?:unnamed|unnameable|unnamable|nameless|ineffable|indescribable|beyond words|without (?:a )?name)\b|\bsomething I can(?:no|'|’)?t\b`;
const UNNAMED = new RegExp(UNNAMED_SOURCE, "i");
export const unnamedCandidate = (text) => UNNAMED.test(String(text ?? ""));
