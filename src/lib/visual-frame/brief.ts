// The shot director (polish 2, docs/stages/POLISH_2.md §3): a visual brief instead
// of the one-clause shot. A language model (Claude Sonnet 5.5, server side) reads
// the whole turn's narration — not the first paragraph — together with the visual
// profiles of the named people and places, the records' visible state, the world
// clock and the previous frame's brief, and writes 80–160 words of plain English:
// the most visual beat of the turn, composition, each person's pose, expression,
// what they hold, clothes and state, the place's materials, light and layout,
// time and weather, light and palette, camera, continuity, what must not appear.
// This file is pure: the request text, the parser of the reply, and the prompt
// compiled from the brief in each model family's dialect (GPT Image takes the
// brief whole; FLUX gets the short form). The brief is stored with the picture
// (private, never shown to the player). When the model fails, the caller falls
// back to the shot (shot.ts).
import { orderReferences, promptFamily, type BriefPerson, type BriefReference, type PromptFamily, type ReferenceRole } from "./prompt-compiler.ts";

export const BRIEF_MODEL = "claude-sonnet-5-5";
/** Price per 1M tokens (docs/MODELS.md, the bake-off's judge table). */
export const BRIEF_PRICE_PER_MILLION = { input: 2, output: 10 };

export type VisualBrief = {
  /** Names of the people in the chosen moment, from the known list only (matching; never printed). */
  who: string[];
  /** One sentence: the most visual beat of the turn. */
  beat: string;
  /** 80–160 words of plain English prose for the illustrator. */
  brief: string;
  /** At most 60 words of the same scene, for models that read short prompts (FLUX). */
  short: string;
  /** What must not appear. */
  avoid: string;
  timeOfDay: string | null;
  weather: string | null;
  /** The story changed a person's or a place's look this turn («he now wears a borrowed grey linen shirt»). */
  profileUpdates: { who: string; change: string }[];
  /** Only for «Перерисовать» with the owner's comment: the one change, as an edit instruction. */
  edit: string | null;
};
export type BriefProfileInput = { name: string; kind: "person" | "place"; look: string; changes: string[] };
export type BriefRequestInput = {
  /** The whole turn's narration the player has received (public text only). */
  narration: string;
  heroName: string | null;
  /** Public names (hero first) the brief may list under `who`. */
  names: string[];
  placeName: string | null;
  profiles: BriefProfileInput[];
  /** From the records: what each named person wears or carries now, visible conditions. */
  state: { name: string; lines: string[] }[];
  clock: { timeOfDay: string | null };
  /** The previous frame's brief (continuity), if any. */
  previous: string | null;
  /** Polish 3 §2: the writer's private ledger of a split turn — what changed in clothes, wounds and
   * items this turn. Visible facts only reach the brief; the ledger itself is never shown. */
  ledger?: string | null;
  style: string;
  /** «Перерисовать» with a comment: the owner's one line, in any language. */
  comment: string | null;
  language: "ru" | "en";
};

const clip = (text: string, max: number) => text.replace(/\r/g, "").trim().slice(0, max);

/** The request to the brief model: strict JSON, public facts only, nothing invented. */
export function briefRequest(input: BriefRequestInput) {
  const names = [...new Set([input.heroName, ...input.names].filter((name): name is string => !!name))].slice(0, 16);
  const system = [
    "You are the shot director of an illustrated role-playing campaign. You read one turn of the narration and write a visual brief for an illustrator who draws a single picture of it.",
    "Reply with one JSON object only, no prose around it:",
    "{\"who\":[...],\"beat\":\"...\",\"brief\":\"...\",\"short\":\"...\",\"avoid\":\"...\",\"timeOfDay\":\"...\"|null,\"weather\":\"...\"|null,\"profileUpdates\":[{\"who\":\"...\",\"change\":\"...\"}],\"edit\":\"...\"|null}",
    "who: the people in the chosen moment, by the known names given below (only those), at most 4; the narration speaks to the hero in the second person (you, your; ты, тебя, тебе, твой): when the hero is in the moment, list the hero's name.",
    "beat: one sentence naming the most visual moment of the whole turn — not simply its first sentence: the moment with the strongest action, gesture or reveal that a reader would want to see.",
    "brief: 80–150 words of plain English prose, never more than 160, present tense, as a brief to an artist: the composition (foreground, middle, background); for each person in frame their pose, expression, what they hold, and only the clothes and visible state that matter now, exactly as the profiles and the state lines say (never invent a look; never change a stated look; do not restate a whole profile — the illustrator has the profiles and the reference pictures); the place — materials, light sources, layout; the time of day and the weather from the clock and the text; light and palette; the camera — distance, angle, lens feel; continuity with the previous frame when one is given (what is still there, what changed).",
    "Refer to people by role or appearance (\"the hero\", \"the tavern keeper\", \"a red-haired woman\"), never by name — names are for `who` only. Say how many people are in frame.",
    "short: the same scene in at most 60 words, the subject and action first.",
    "avoid: what must not appear (extra people, text, objects the scene does not have), one sentence.",
    "timeOfDay / weather: from the clock given below and the text; null when neither says.",
    "profileUpdates: only when the text itself changes a named person's or place's lasting look this turn (a wound, a bandage, a borrowed shirt, a shaved beard, a burnt room): the name from the known list and the change in one English clause; otherwise an empty list. Not for a momentary pose.",
    "edit: null — unless an owner's comment is given below; then write that one change as a single edit instruction in English (\"make it night\", \"remove his helmet\"), and also fold it into the brief.",
    "Use only what the narration, the profiles, the state lines and the clock say; never add facts, people, items or places that are not there. Write every value in English.",
  ].join("\n");
  const profiles = input.profiles.filter((row) => row.look.trim() || row.changes.length).map((row) =>
    `${row.name} (${row.kind === "person" ? "person" : "place"}): ${clip(row.look, 1200)}${row.changes.length ? ` Now: ${row.changes.map((change) => clip(change, 200)).join("; ")}.` : ""}`);
  const state = input.state.filter((row) => row.lines.length).map((row) => `${row.name}: ${row.lines.map((line) => clip(line, 200)).join("; ")}`);
  const user = [
    input.heroName ? `The hero (addressed as "you"): ${input.heroName}.` : "",
    names.length ? `Known names: ${names.join(", ")}.` : "",
    input.placeName ? `The scene is at: ${input.placeName}.` : "",
    input.clock.timeOfDay ? `The clock says: ${input.clock.timeOfDay}.` : "",
    profiles.length ? `Visual profiles:\n${profiles.join("\n")}` : "",
    state.length ? `Visible state from the records:\n${state.join("\n")}` : "",
    input.previous ? `The previous frame's brief (for continuity):\n${clip(input.previous, 1200)}` : "",
    input.ledger ? `The game master's private notes on what changed this turn (use only what is visible — clothes, wounds, things held or lost; never secrets, plans or anything the player has not seen):\n${clip(input.ledger, 1500)}` : "",
    input.style ? `Art style of the campaign (do not describe it; the illustrator has it): ${clip(input.style, 300)}` : "",
    input.comment ? `Owner's comment for the redraw (one change to make): ${clip(input.comment, 300)}` : "",
    `The turn's narration (${input.language === "ru" ? "Russian" : "English"}):`,
    clip(input.narration, 9000),
  ].filter(Boolean).join("\n");
  return { system, user };
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const wordsOf = (text: string) => text.split(/\s+/).filter(Boolean);
/** A reply becomes a brief only with a real brief text; everything else is bounded and optional. */
export function parseBrief(text: string): VisualBrief | null {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const v = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
    const brief = str(v.brief, 2000);
    if (wordsOf(brief).length < 20) return null;
    const who = Array.isArray(v.who) ? v.who.map((name) => str(name, 60)).filter(Boolean).slice(0, 4) : [];
    const updates = Array.isArray(v.profileUpdates) ? v.profileUpdates.map((row) => {
      const r = (row ?? {}) as Record<string, unknown>;
      return { who: str(r.who, 60), change: str(r.change, 240) };
    }).filter((row) => row.who && row.change).slice(0, 6) : [];
    return {
      who, beat: str(v.beat, 300), brief, short: str(v.short, 600) || wordsOf(brief).slice(0, 60).join(" "), avoid: str(v.avoid, 300),
      timeOfDay: str(v.timeOfDay, 60) || null, weather: str(v.weather, 120) || null, profileUpdates: updates, edit: str(v.edit, 300) || null,
    };
  } catch {
    return null;
  }
}

const words = ["zero", "one", "two", "three", "four", "five", "six"];
const possessive = (pronoun: BriefPerson["pronoun"]) => (pronoun === "he" ? "his" : pronoun === "she" ? "her" : "their");
const capital = (text: string) => (text ? text[0].toUpperCase() + text.slice(1) : text);
function refName(positions: number[], family: PromptFamily) {
  const sorted = [...positions].sort((a, b) => a - b).map((n) => n + 1);
  if (family === "gpt-image") return sorted.length === 1 ? `Image ${sorted[0]}` : `Images ${sorted.join(" and ")}`;
  const ordinals = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"];
  const names = sorted.map((n) => ordinals[n - 1] ?? `${n}th`);
  return sorted.length === 1 ? `the ${names[0]} image` : `the ${names.join(" and ")} images`;
}
function roleText(reference: BriefReference, person: BriefPerson | undefined) {
  const who = person?.label ?? "a person in the frame";
  const own = person ? possessive(person.pronoun) : "their";
  switch (reference.role) {
    case "face": return `${who}'s face and hair (keep exact)`;
    case "figure": return `${who}'s full figure and build (keep exact; ${own} clothes follow the brief)`;
    case "person": return `${who} (keep exact)`;
    case "place": return "the place (setting only)";
    default: return "the art style (style only)";
  }
}

/** The prompt compiled from a brief: references by role, the brief itself (whole for GPT Image and the
 * other prose readers, the short form for FLUX), identity locks for every referenced person, the exact
 * number of people, the anatomy guard, what to avoid, no lettering (FLUX: plain surfaces), the style. */
export function compileBriefPrompt(input: { brief: VisualBrief; people: BriefPerson[]; references: BriefReference[]; style: string; modelId: string }): string {
  const family = promptFamily(input.modelId);
  const flux = family === "flux";
  const { brief, people } = input;
  const byKey = new Map(people.map((row) => [row.key, row]));
  const refs = input.references.map((row, index) => family === "gpt-image" ? `Image ${index + 1} — ${roleText(row, row.person ? byKey.get(row.person) : undefined)}.`
    : `${capital(refName([index], family))} shows ${roleText(row, row.person ? byKey.get(row.person) : undefined)}.`);
  const referenceBlock = refs.length ? (family === "gpt-image" ? `Reference images: ${refs.join(" ")}` : refs.join(" ")) : "";
  const scene = `A cinematic story illustration of one moment. ${flux ? brief.short : brief.brief}`.trim();
  const locks: string[] = [];
  if (people.length) locks.push(people.length === 1 ? "Exactly one person is in the frame." : `Exactly ${words[people.length] ?? people.length} people are in the frame, each of them once.`);
  for (const person of people) {
    const positions = input.references.map((row, index) => ({ row, index })).filter(({ row }) => row.person === person.key && row.role !== "place" && row.role !== "style").map(({ index }) => index);
    if (!positions.length) continue;
    const own = possessive(person.pronoun);
    locks.push(`${capital(person.label)} is the person in ${refName(positions, family)}: keep ${own} face, facial features, skin tone, hair, age and build exactly as there; only ${own} pose, expression, clothes as the brief says and the camera angle change.`);
  }
  locks.push(flux ? "Natural anatomy: every person has two arms and two hands with five fingers each." : "Every person has two arms and two hands with five fingers each; no extra or missing limbs.");
  const avoid = brief.avoid && !flux ? `Do not show: ${brief.avoid.replace(/\.$/, "")}.` : "";
  const text = flux ? "All surfaces, clothing, signs and objects are plain and unmarked." : "No text, letters, numbers, logos, signs or watermarks anywhere in the picture.";
  const style = input.style.trim() ? `Art style: ${input.style.trim().slice(0, 800)}${/[.!]$/.test(input.style.trim()) ? "" : "."}` : "Art style: painterly illustration with cinematic light.";
  const parts = family === "gpt-image" || family === "seedream" ? [referenceBlock, scene, locks.join(" "), avoid, text, style]
    : flux ? [scene, locks.join(" "), referenceBlock, style, text] : [scene, referenceBlock, locks.join(" "), avoid, text, style];
  return parts.filter(Boolean).join("\n").slice(0, 8000);
}

/** The references of a brief's people in the fixed order, keyed to the brief's people. */
export function briefReferences<T extends { role: ReferenceRole; entityId?: string | null }>(references: T[], people: Pick<BriefPerson, "key">[], max: number): (T & BriefReference)[] {
  const keyOf = (entityId?: string | null) => (entityId ? people.find((row) => row.key === entityId)?.key : undefined);
  return orderReferences(references.map((row) => ({ ...row, person: keyOf(row.entityId) })), people, max);
}

/** Brief words for a stored record and a quick sanity check. */
export const briefWordCount = (brief: Pick<VisualBrief, "brief">) => wordsOf(brief.brief).length;
