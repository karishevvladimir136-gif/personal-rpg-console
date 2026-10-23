// Findings S3 §1 (docs/stages/DM_TONE_1.md step 3): the markers of the DM's register on one committed turn, deterministic
// and free — the persona-emotions stage's markers (length, address, hedges) carried over to Russian narration, plus the
// number of distinct people who speak. The records completeness and the roll check come from the replay's own checks.

const WORD = /[\p{L}\p{N}'’-]+/gu;
export const wordsOf = (text) => text.match(WORD)?.length ?? 0;
const per100 = (count, words) => (words ? Math.round((count / words) * 1000) / 10 : 0);

/** Second-person forms (ты/вы and their cases and possessives; you/your), on word boundaries. */
const ADDRESS = /(?<![\p{L}])(?:ты|тебя|тебе|тобой|тобою|твой|твоя|твоё|твое|твои|твоего|твоей|твоему|твоим|твоих|твоими|твою|вы|вас|вам|вами|ваш|ваша|ваше|ваши|вашего|вашей|вашему|вашим|ваших|вашими|вашу|you|your|yours|yourself|yourselves)(?![\p{L}])/giu;
/** Hedges, Russian and English (the emotions stage's English list, abridged; a frozen Russian list). */
const HEDGE = /(?<![\p{L}])(?:возможно|может быть|наверное|вероятно|кажется|по-моему|похоже|пожалуй|видимо|если не ошибаюсь|не уверен|не уверена|скорее всего|вроде бы|полагаю|думаю|perhaps|maybe|possibly|probably|presumably|might|it seems|seems to|i think|i believe|not sure|if i'm not mistaken)(?![\p{L}])/giu;

/** A paragraph that is an out-of-game aside («*(Вне игры: …)*», «(Out of game: …)»). */
export const outOfGame = (paragraph) => /(?:^|[\s*_(])(?:вне игры|out of game|out-of-game|ooc)(?![\p{L}])/iu.test(paragraph);

/** The direct speech of a narration, each piece with the author's words beside it and the sentence before its paragraph:
 * dialogue-dash paragraphs («— Не пойду, — говорит Брам. — Тони.») and «…» quotes of three words or more (a shorter one
 * is a name or a title). */
export function speechOf(narration) {
  const pieces = [];
  const paragraphs = narration.split(/\n+/).map((row) => row.trim()).filter(Boolean);
  paragraphs.forEach((paragraph, index) => {
    if (outOfGame(paragraph)) return;
    const previous = index > 0 ? paragraphs[index - 1].split(/(?<=[.!?…:])\s+/).at(-1) ?? "" : "";
    if (/^[—–-]\s/.test(paragraph)) {
      // Split on the author's dashes — after the speech's own , . ? ! … — never on a dash inside the speech or a «…» quote.
      const parts = [];
      let depth = 0, from = 0;
      const body = paragraph.replace(/^[—–-]\s*/, "");
      for (let at = 0; at < body.length; at++) {
        if (body[at] === "«") depth++;
        else if (body[at] === "»") depth = Math.max(0, depth - 1);
        else if (!depth && /[—–]/.test(body[at]) && body[at - 1] === " " && body[at + 1] === " " && /[,.?!…]/.test(body[at - 2] ?? "")) { parts.push(body.slice(from, at)); from = at + 1; }
      }
      parts.push(body.slice(from));
      const author = parts.filter((_, at) => at % 2 === 1).join(" ");
      parts.forEach((part, at) => { if (at % 2 === 0 && part.trim()) pieces.push({ text: part.trim(), author, previous }); });
      return;
    }
    for (const match of paragraph.matchAll(/«([^«»]+)»/gu)) {
      if (wordsOf(match[1]) < 3) continue;
      const before = paragraph.slice(Math.max(0, match.index - 120), match.index);
      const after = paragraph.slice(match.index + match[0].length, match.index + match[0].length + 120);
      pieces.push({ text: match[1], author: `${before} ${after}`, previous });
    }
  });
  return pieces;
}

/** The capitalised words of a name, matched as they stand — the nominative of an attribution («говорит Брам», «Тоби
 * сглатывает»), never another case («смотрит на Брама»). */
const nameWords = (name) => name.split(/[\s,()«»"]+/).filter((word) => word.length >= 2 && /^\p{Lu}/u.test(word));
const firstNamed = (text, people) => {
  let best = null;
  for (const row of people) for (const word of row.words) {
    const at = text.search(new RegExp(`(?<![\\p{L}])${word}(?![\\p{L}])`, "u"));
    if (at >= 0 && (!best || at < best.at)) best = { at, name: row.name };
  }
  return best?.name ?? null;
};

/** The people a turn's speech is attributed to: the first name in the nominative in the author's words beside a piece,
 * else in the sentence before its paragraph («Брам подходит…» / «— Писаря два»). */
export function speakersOf(narration, names) {
  const people = [...new Set(names.filter((name) => typeof name === "string" && name.trim()))].map((name) => ({ name, words: nameWords(name) })).filter((row) => row.words.length);
  const found = new Set();
  let unattributed = 0;
  for (const piece of speechOf(narration)) {
    const who = firstNamed(piece.author, people) ?? firstNamed(piece.previous, people);
    if (who) found.add(who); else unattributed++;
  }
  return { speakers: [...found], unattributed };
}

/** The markers of one committed turn. `names`: the people the scene may hold (the state's records and this turn's new ones). */
export function turnMarkers(narration, names) {
  const words = wordsOf(narration);
  const speech = speechOf(narration);
  const speechText = speech.map((piece) => piece.text).join(" ");
  const address = speechText.match(ADDRESS)?.length ?? 0;
  const asides = narration.split(/\n+/).filter(outOfGame).join(" ");
  const asideWords = wordsOf(asides);
  const hedges = asides.match(HEDGE)?.length ?? 0;
  const { speakers, unattributed } = speakersOf(narration, names);
  return { words, speechWords: wordsOf(speechText), address, addressPer100: per100(address, words), speakers: speakers.length, speakerNames: speakers,
    unattributedSpeech: unattributed, asideWords, hedges, hedgesPer100Aside: asideWords ? per100(hedges, asideWords) : null };
}
