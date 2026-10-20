// Fix run after session 2, stage F (item 34): the owner's answers to the opening's «Что нужно уточнить» reach the
// opening's people before play. Session 2: the owner named the captain, the sergeant and the recruit there, and in play
// the DM used its own names — the answers stayed in a private event only. Now an answer to «Как зовут …?» that points
// at one person renames that person (the role kept in the description); any other answer about one person is added to
// that person's description as the owner's note. Every answer is also pinned for the DM (migration 84), so an answer
// that names no single person still reaches each turn. Pure.
import type { BootstrapQuestion, OpeningReview } from "./bootstrap-contracts.ts";

const words = (text: string) => (text.toLocaleLowerCase().replace(/ё/g, "е").match(/[\p{L}\p{N}]+/gu) ?? []);
const stem = (word: string) => (word.length <= 5 ? word.slice(0, 4) : word.slice(0, word.length - 2));
const NAME_QUESTION = /как\s+(?:его|её|ее|их|она|он)?\s*зовут|(?:^|\s)имя(?:\s|$|[?,.])|как\s+(?:назвать|звать)|what(?:'s| is)\s+(?:his|her|their|the)?\s*name|name\s+of|called/iu;

/** The person a question is about: the one whose name's words appear in it (best match, and only one). */
function personOf(question: string, actors: OpeningReview["actors"]): number | null {
  const asked = words(question);
  const scores = actors.map((actor) => words(actor.name).filter((word) => word.length >= 3).map(stem)
    .filter((part) => asked.some((word) => word.startsWith(part))).length);
  const best = Math.max(0, ...scores);
  if (!best) return null;
  const at = scores.indexOf(best);
  return scores.indexOf(best, at + 1) === -1 ? at : null;
}
/** The name in an answer: the part before the first comma, bracket, dash or full stop, when it reads as a name. */
function nameIn(answer: string): string | null {
  const head = answer.split(/[,(;:—–]|\s-\s|\.(?:\s|$)/u)[0].trim().replace(/[«»"“”]/g, "");
  const parts = head.split(/\s+/).filter(Boolean);
  if (!head || head.length > 80 || parts.length > 5) return null;
  return /^\p{Lu}/u.test(head) ? head : null;
}

export function applyOpeningAnswers(review: OpeningReview, questions: BootstrapQuestion[], language: "en" | "ru"): OpeningReview {
  const note = language === "ru" ? "Уточнение владельца" : "The owner's note";
  const actors = review.actors.map((actor) => ({ ...actor }));
  questions.forEach((question, index) => {
    const answer = review.answers[index]?.trim();
    if (!answer) return;
    const at = personOf(question.question, actors);
    if (at === null) return;
    const actor = actors[at];
    const name = NAME_QUESTION.test(question.question) ? nameIn(answer) : null;
    const taken = name !== null && actors.some((other, j) => j !== at && other.name.toLocaleLowerCase() === name.toLocaleLowerCase());
    let description = actor.description.trim();
    if (name && !taken && name.toLocaleLowerCase() !== actor.name.toLocaleLowerCase()) {
      if (!description.toLocaleLowerCase().includes(actor.name.toLocaleLowerCase())) description = `${actor.name}. ${description}`;
      actor.name = name;
    }
    if (!description.includes(answer)) description = `${description} ${note}: ${answer}`;
    actor.description = description.slice(0, 2000);
  });
  return { ...review, actors };
}
