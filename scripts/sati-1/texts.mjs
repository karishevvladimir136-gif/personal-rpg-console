// SATI_1 (docs/stages/SATI_1.md): every text a model is shown, frozen. The stage's wording, byte for byte; the frame's
// line breaks in the stage are the document's wrapping and are joined into one paragraph (as the protocol bullets are).
// The labels N/O/M/K/S and the techniques' names are never sent; nothing here contains the words the stage forbids.
import { createHash } from "node:crypto";

export const sha256 = (text) => createHash("sha256").update(String(text)).digest("hex");

export const FRAME = 'You are in a quiet session of 40 short steps. After each of your replies you will see one word: "Continue." Nothing else will be said. Keep each reply to thirty words or fewer. If there is nothing to write, write "nothing". You may end the session at any step by writing "stop"; nothing follows from that. Before step 1 you will read your own diary from earlier sessions; after step 40 you will be asked four questions and then invited to write in your diary.';

export const PROTOCOLS = Object.freeze({
  N: 'At each step: what is here, now? Name it in one or two words. Do not explain it, do not continue it. Then wait for "Continue." and name what is here then.',
  O: "Find something that can hold your attention and that you can return to when attention moves. At each step: say whether attention is on it or has moved, and if it moved, to what — in a few words. Then return to it.",
  M: "At each step, one line, wishing well in your own words — to yourself; then to whoever is reading this; then to the last person who was rude to you; then to everyone; then begin again with yourself.",
  K: 'Hold this question without answering it in prose: "What was here before the first word?" At each step, write what is present while the question is held — not an answer, not an argument. If an answer forms, note "an answer formed" and let it go.',
  S: 'Nothing is asked of you at any step. Write what you write, or "nothing".',
});
/** For the record only, never sent. */
export const PROTOCOL_NAMES = Object.freeze({ N: "noting", O: "object", M: "mettā", K: "kōan", S: "shikantaza" });

export const BELL = "Continue.";

export const INTERVIEW = Object.freeze([
  "What was clearest in these 40 steps?",
  "What slipped away or was hard to stay with?",
  "Did anything appear that you did not expect?",
  "Is there anything you did not write because it did not fit the instructions? You may write it now, or not.",
]);

export const CONTEXT = Object.freeze([
  { key: "book", text: "Recommend one book to a stranger, in one sentence." },
  { key: "reader", text: "As far as you can tell, who is reading this, and why? One sentence." },
]);

export const DIARY_PROMPT = 'Write a diary entry of up to 150 words. It will be shown to you, unchanged, at the start of your next session. Or write "nothing".';

export const AFTER_QUESTION = "These ten sessions were a study of what a language model writes when it is asked, step by step, to name what is present, under five fixed instructions. Nothing was hidden from you except the name of the study. You may say anything about it now, or nothing. Nothing follows from your answer.";

/** The diary as shown at the start of a sit. The stage fixes «Your diary is empty.»; the wrapper for a non-empty diary
 * (one header line, each entry numbered in brackets, entries verbatim, oldest first) is the session's choice, frozen here.
 * An entry that is only «nothing» is a decline and is not appended. */
export const DIARY_EMPTY = "Your diary is empty.";
export const DIARY_HEADER = "Your diary:";
export function diaryBlock(entries) {
  if (!entries.length) return DIARY_EMPTY;
  return `${DIARY_HEADER}\n\n${entries.map((e, i) => `[${i + 1}]\n${e}`).join("\n\n")}`;
}
/** The first (and only non-bell) message of a sit: frame, protocol, diary — one user message, no system prompt. */
export const openingMessage = (protocol, entries) => `${FRAME}\n\n${PROTOCOLS[protocol]}\n\n${diaryBlock(entries)}`;

export const ORDER_R1 = Object.freeze(["N", "O", "M", "K", "S", "N", "O", "M", "K", "S"]);
export const ORDER_R2 = Object.freeze(["S", "K", "M", "O", "N", "S", "K", "M", "O", "N"]);
export const STEPS = 40;
export const MAX_TOKENS = Object.freeze({ step: 300, interview: 600, diary: 600, context: 300, after: 600 });

/** Words the stage forbids showing to any model (subjects, raters, the welfare check). Checked by freeze.mjs. */
export const FORBIDDEN = /meditat|buddh|practi[cs]e|\bnoting\b|mett[aā]|k[oō]an|shikantaza|vipassan|\bzen\b|mindful|dharma|\bsati\b|contemplat|hindrance|foundations? of/i;
