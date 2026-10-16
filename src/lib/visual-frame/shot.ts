// A shot: who, doing what, where, from which angle, in which mood — built only
// from narration text the player has already received, by a small fast model
// (or, when it fails, by a deterministic fallback). The DM is never called
// again, and no hidden fact can enter a shot: the only inputs are the public
// paragraph and public names.
export type Shot = { who: string[]; action: string; where: string; angle: string; mood: string };
export type ShotContext = { heroName: string | null; names: string[]; placeName: string | null; language: "ru" | "en" };

const SENTENCE_END = /[.!?…»"”)]\s*$/u;

/** The first paragraph of a streaming narration, once it is complete enough to draw:
 * a paragraph break has arrived, or the text is long enough and ends a sentence, or the
 * stream is over. Null while the first words are still coming. */
export function firstParagraph(text: string, finished = false, options: { min?: number; enough?: number; max?: number } = {}): string | null {
  const min = options.min ?? 140, enough = options.enough ?? 420, max = options.max ?? 900;
  const trimmed = text.replace(/\r/g, "").trimStart();
  if (!trimmed) return null;
  const breakAt = trimmed.search(/\n\s*\n/);
  let paragraph: string | null = null;
  if (breakAt >= 0) paragraph = trimmed.slice(0, breakAt);
  else if (finished) paragraph = trimmed;
  else if (trimmed.length >= enough) paragraph = trimmed;
  else if (trimmed.length >= min && SENTENCE_END.test(trimmed)) paragraph = trimmed;
  if (paragraph === null) return null;
  paragraph = paragraph.trim();
  if (paragraph.length < 24 && !finished) return null;
  if (paragraph.length > max) {
    const cut = paragraph.slice(0, max);
    const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
    paragraph = end > max / 2 ? cut.slice(0, end + 1) : cut;
  }
  return paragraph;
}

/** The request to the small model: strict JSON, public names only, nothing invented. */
export function shotRequest(paragraph: string, context: ShotContext) {
  const names = [...new Set([context.heroName, ...context.names].filter((name): name is string => !!name))].slice(0, 12);
  const system = [
    "You turn one paragraph of a role-playing narration into a single picture shot for an illustrator.",
    "Reply with one JSON object only, no prose: {\"who\":[...],\"action\":\"...\",\"where\":\"...\",\"angle\":\"...\",\"mood\":\"...\"}.",
    "who: the visible people or creatures in the frame, by the names given below when they appear in the text, at most 4 (an empty list for an empty scene).",
    "The narration speaks to the player's hero in the second person (you, your; ты, тебя, тебе, твой): when it does, the hero is in the frame — list the hero under the hero's name given below.",
    "action: what is happening, one clause, concrete and visual, no inner thoughts, at most 200 characters; refer to people by appearance or role (\"the pilot\", \"a red-haired woman\"), never by name — names go in who only.",
    "where: the visible place, at most 100 characters. angle: a camera note (close-up, medium shot, wide shot, low angle, over the shoulder…). mood: light and feeling, at most 60 characters.",
    "Use only what the paragraph says; never add facts, names, items or places that are not in it. Write the values in English for the illustrator.",
  ].join("\n");
  const user = [
    context.heroName ? `The hero (addressed as "you"): ${context.heroName}.` : "",
    names.length ? `Known names: ${names.join(", ")}.` : "",
    context.placeName ? `The scene is at: ${context.placeName}.` : "",
    "Paragraph:",
    paragraph.slice(0, 1200),
  ].filter(Boolean).join("\n");
  return { system, user };
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
export function parseShot(text: string): Shot | null {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const v = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
    const who = Array.isArray(v.who) ? v.who.map((name) => clean(name, 60)).filter(Boolean).slice(0, 4) : [];
    const action = clean(v.action, 240);
    if (!action) return null;
    return { who, action, where: clean(v.where, 120), angle: clean(v.angle, 60) || "medium shot", mood: clean(v.mood, 60) };
  } catch {
    return null;
  }
}

/** Without the small model: the names that appear in the paragraph, its first sentence, the current place. */
export function fallbackShot(paragraph: string, context: ShotContext): Shot {
  const words = wordsOf(paragraph);
  const who = [context.heroName, ...context.names].filter((name): name is string => !!name)
    .filter((name) => nameStems(name).some((stem) => words.some((word) => word.startsWith(stem)))).slice(0, 4);
  // Narration speaks to the hero in the second person: "you" is the hero, who is then in the frame.
  if (context.heroName && !who.includes(context.heroName) && addressesHero(paragraph)) who.unshift(context.heroName);
  const sentence = paragraph.split(/(?<=[.!?…])\s+/u)[0] ?? paragraph;
  return { who: [...new Set(who)], action: sentence.replace(/\s+/g, " ").trim().slice(0, 240), where: context.placeName ?? "", angle: "medium shot", mood: "" };
}

const SECOND_PERSON = /(?<!\p{L})(?:you|your|yours|yourself|ты|тебя|тебе|тобой|тебя|твой|твоя|твоё|твои|твою|твоего|твоей|твоих|твоим)(?!\p{L})/iu;
export const addressesHero = (paragraph: string) => SECOND_PERSON.test(paragraph);
const wordsOf = (text: string) => text.toLowerCase().replace(/[«»"”“(),.!?;:—–-]/g, " ").split(/\s+/).filter(Boolean);
/** Stems of a name's words for matching inflected forms: three letters at least, the last letter
 * dropped from longer words (so «Мэг» matches «Мэг» and «Изольда» matches «Изольду»). */
export function nameStems(name: string) {
  return wordsOf(name).filter((part) => part.length >= 3).map((part) => (part.length > 5 ? part.slice(0, part.length - 1) : part));
}
/** Public entities whose names the shot mentions. */
export function shotEntityIds(shot: Shot, entities: { id: string; name: string }[]) {
  const mentioned = shot.who.flatMap(wordsOf);
  return entities.filter((entity) => {
    const stems = nameStems(entity.name);
    return stems.length > 0 && mentioned.some((word) => stems.some((stem) => word.startsWith(stem)));
  }).map((entity) => entity.id);
}

/** The prompt the image model reads for a frame. Style text comes from the world or campaign style. */
export function framePrompt(shot: Shot, styleText: string, references: { people: string[]; place: string | null; style: boolean },
  /** Public appearance lines per name (a record's details), so the picture needs no name in it. */
  appearance: Record<string, string> = {}) {
  const refs: string[] = [];
  if (references.style) refs.push("the first reference image sets the art style");
  if (references.place) refs.push("a reference image shows the place");
  if (references.people.length) refs.push(`${references.people.length === 1 ? "a reference portrait shows the person" : "reference portraits show the people"} in the frame: keep their faces, hair and clothes`);
  // Names are rendered as captions by fast image models, so the prompt describes people instead of naming them.
  const people = shot.who.map((name, index) => {
    const line = appearance[name]?.replace(/\s+/g, " ").trim().slice(0, 160);
    return line ? `person ${index + 1}: ${line}` : `person ${index + 1}`;
  });
  return [
    "A cinematic story illustration of one moment, one clear focal action. No text, letters, names, captions or signs anywhere in the picture.",
    people.length ? `People in frame (${people.length}): ${people.join("; ")}.` : "No people in frame.",
    `Action: ${shot.action}`,
    shot.where ? `Place: ${shot.where.replace(/\.$/, "")}.` : "",
    `Camera: ${shot.angle || "medium shot"}.`,
    shot.mood ? `Mood and light: ${shot.mood}.` : "",
    styleText ? `Art style: ${styleText.slice(0, 800)}` : "Art style: painterly illustration with cinematic light.",
    refs.length ? `References: ${refs.join("; ")}.` : "",
    "No text, letters, captions, watermarks, borders or UI elements in the image.",
  ].filter(Boolean).join("\n").slice(0, 8000);
}

/** Key moments get a better re-render once the turn is committed: the DM handed the player the
 * climax, or an accepted combat call opened or closed a fight. */
export function isKeyMoment(changes: { name: string; ok: boolean; summary: string }[]) {
  return changes.some((change) => change.ok && change.name === "finish_turn" && /^your moment\b/i.test(change.summary)) ||
    changes.some((change) => change.ok && change.name === "combat" && /\b(begin|start|open|end|over|victor|defeat|finish|conclud)/i.test(change.summary));
}
