// Russian naturalness metrics for the bench (polish item 7, «In scope from group 7»):
// measured, not yet acted on — the voice stage reads them in the A/B. Pure text
// measures over the narrations of a run: Latin letters in visible text, канцелярит
// markers, sentence-length variance, phrases repeated across turns, and the share
// of NPC replies that answer every point of the player's message (the «assistant
// shape» of item 24). No model call, no reference corpus yet.

// JavaScript's \b knows ASCII letters only, so Cyrillic words take explicit boundaries.
const w = (pattern) => new RegExp(`(?<!\\p{L})(?:${pattern})(?!\\p{L})`, "giu");
const KANCELYARIT = [
  w("явля(ет|ют)ся"), w("представля(ет|ют) собой"), w("осуществля(ет|ют|ть)"), w("данн(ый|ая|ое|ые|ого|ой|ом|ых)"),
  w("в настоящее время"), w("в целях"), w("в рамках"), w("производит(ся)?"), w("обеспечива(ет|ют)"),
  w("следует отметить"), w("в связи с"), w("значительн(ый|ая|ое|ые|о)"),
];
const PARTICIPLE_CHAIN = /(\p{L}+(ющ|ящ|ущ|ащ|вш|ем|им)\p{L}*\s+){2,}\p{L}+(ющ|ящ|ущ|ащ|вш|ем|им)\p{L}*/gu;

const words = (text) => (text.match(/\p{L}+/gu) ?? []);
const sentences = (text) => text.split(/(?<=[.!?…])\s+|\n+/u).map((row) => row.trim()).filter((row) => words(row).length > 0);

/** Share of letters that are Latin in the visible text (0 for pure Cyrillic). */
export function latinShare(text) {
  const letters = text.match(/\p{L}/gu) ?? [];
  if (!letters.length) return 0;
  const latin = text.match(/[A-Za-z]/g) ?? [];
  return latin.length / letters.length;
}

/** Канцелярит markers per 1 000 words, participle chains included. */
export function kancelyaritPerThousand(text) {
  const n = words(text).length;
  if (!n) return 0;
  const hits = KANCELYARIT.reduce((sum, re) => sum + (text.match(re) ?? []).length, 0) + (text.match(PARTICIPLE_CHAIN) ?? []).length;
  return (hits / n) * 1000;
}

/** Coefficient of variation of sentence length in words: flat prose reads mechanical. */
export function sentenceLengthVariation(text) {
  const lengths = sentences(text).map((row) => words(row).length);
  if (lengths.length < 2) return null;
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, value) => sum + (value - mean) ** 2, 0) / lengths.length;
  return mean ? Math.sqrt(variance) / mean : null;
}

/** Three-word phrases that recur across turns (3+ times), lowercased; the voice stage judges them. */
export function repeatedPhrases(narrations, minCount = 3, limit = 8) {
  const counts = new Map();
  for (const text of narrations) {
    const seen = new Set();
    const w = words(text.toLocaleLowerCase());
    for (let i = 0; i + 2 < w.length; i++) {
      const gram = `${w[i]} ${w[i + 1]} ${w[i + 2]}`;
      if (w[i].length < 4 && w[i + 1].length < 4) continue;
      if (seen.has(gram)) continue;
      seen.add(gram);
      counts.set(gram, (counts.get(gram) ?? 0) + 1);
    }
  }
  return [...counts.entries()].filter(([, n]) => n >= minCount).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([phrase, n]) => ({ phrase, turns: n }));
}

/** The «assistant shape» (item 24): when the player asks several questions, does the reply
 * answer every one in order? Counted as: turns with 2+ questions whose dialogue lines are at
 * least as many as the questions. A share over the turns that had 2+ questions; null when none. */
export function answersEveryPoint(exchanges) {
  const rows = exchanges.filter((row) => (row.input.match(/\?/g) ?? []).length >= 2);
  if (!rows.length) return null;
  const full = rows.filter((row) => {
    const questions = (row.input.match(/\?/g) ?? []).length;
    const lines = (row.narration.match(/^\s*[—–-]\s*\S/gmu) ?? []).length + (row.narration.match(/«[^»]{12,}»/gu) ?? []).length;
    return lines >= questions;
  });
  return full.length / rows.length;
}

/** All of the above for one run: narrations and the (input, narration) pairs. */
export function naturalness(narrations, exchanges = []) {
  const text = narrations.join("\n\n");
  return {
    latinShare: latinShare(text),
    kancelyaritPerThousand: kancelyaritPerThousand(text),
    sentenceLengthVariation: sentenceLengthVariation(text),
    repeatedPhrases: repeatedPhrases(narrations),
    answersEveryPoint: answersEveryPoint(exchanges),
    words: words(text).length,
  };
}
