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
import { resolveWho, type ScenePerson } from "./shot.ts";

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
  /** Fix run E (item 78b): the moment the picture shows, in the campaign language — the frame's caption. */
  caption: string | null;
  /** Fix run E (item 79): each person's direction for this moment — gaze, expression, action, and which hand does
   * what when both are busy (the three-handed James). By name from the known list; never printed as a name. */
  people: BriefDirection[];
};
export type BriefDirection = { who: string; label: string; looksAt: string; expression: string; action: string; hands: string | null };
export type BriefProfileInput = { name: string; kind: "person" | "place"; look: string; changes: string[] };
export type BriefRequestInput = {
  /** The whole turn's narration the player has received (public text only). */
  narration: string;
  heroName: string | null;
  /** Public names (hero first) the brief may list under `who`. */
  names: string[];
  /** Fix run E (item 78a): who each known person is, so a role word in the narration finds its person. */
  people?: { name: string; role: string }[];
  placeName: string | null;
  profiles: BriefProfileInput[];
  /** From the records: what each named person wears or holds and carries packed away now, visible conditions. */
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
  const language = input.language === "ru" ? "Russian" : "English";
  const system = [
    "You are the shot director of an illustrated role-playing campaign. You read one turn of the narration and write a visual brief for an illustrator who draws a single picture of it.",
    "Reply with one JSON object only, no prose around it:",
    "{\"who\":[...],\"beat\":\"...\",\"caption\":\"...\",\"people\":[{\"who\":\"...\",\"label\":\"...\",\"looksAt\":\"...\",\"expression\":\"...\",\"action\":\"...\",\"hands\":\"...\"|null}],\"brief\":\"...\",\"short\":\"...\",\"avoid\":\"...\",\"timeOfDay\":\"...\"|null,\"weather\":\"...\"|null,\"profileUpdates\":[{\"who\":\"...\",\"change\":\"...\"}],\"edit\":\"...\"|null}",
    "who: the people in the chosen moment, by the known names given below (only those), at most 4. The narration speaks to the hero in the second person (you, your; ты, тебя, тебе, твой): when the hero is in the moment, list the hero's name. It also calls known people by a role or a description instead of the name (the mage, the sergeant, the merchant, the boy; маг, сержант, купец, мальчишка): find which known person that is from who they are — very often the role word is the hero (the hero's class: «маг» is the hero when the hero is the mage), then a member of the party — and list that name. Never list a role word, never leave a known person out because the text used a role word.",
    "beat: one sentence naming the most visual moment of the whole turn — not simply its first sentence: the moment with the strongest action, gesture or reveal that a reader would want to see.",
    `caption: that same moment for the reader, one sentence of at most 160 characters in ${language}, in the narration's own words where it can — from the narration only, never from the private notes.`,
    "people: one entry per person in `who`: label — how the brief calls this person (\"the hero\", \"the sergeant\", \"the bound prisoner\"); looksAt — at whom or what this person looks in this moment, by role (\"the sergeant\", \"the prisoner\", \"the map in his hands\", \"the fire\"); people who talk or work together look at each other or at their task, never at the viewer and never up into the distance unless the text says so; expression — this moment's expression in a few words (a person at 0 hit points or unconscious: eyes closed); action — what the body does, a concrete action, not a pose for a portrait; hands — when the action uses both hands or holds things, which hand does what (\"left hand pours from the waterskin, right hand holds the ash\"), else null.",
    "brief: 80–150 words of plain English prose, never more than 160, present tense, as a brief to an artist: the composition (foreground, middle, background); where the hero is in the moment — in the open, hidden or behind what, standing, kneeling, lying — exactly as the narration has it (a hidden hero is drawn hidden); for each person in frame the action, gaze and expression above, what they hold, and only the clothes and visible state that matter now, exactly as the profiles and the state lines say (never invent a look; never change a stated look; do not restate a whole profile — the illustrator has the profiles and the reference pictures); the place — materials, light sources, layout; the light: what lights the scene and what lies in darkness, from the text and the clock; the time of day and the weather; light and palette; the camera — distance, angle, lens feel; continuity with the previous frame when one is given (what is still there, what changed).",
    "Things in hands and on bodies come only from the state lines (what the person wears, holds or carries) and from what the narration shows them taking up this turn: never add a weapon, a shield, a lantern, a torch, a staff, a light or any other thing that neither gives; a thing carried packed away is not in hand unless the narration says so. Name in `avoid` the likely inventions this scene invites that the records do not have (\"no shield\", \"no lantern\").",
    "Refer to people by role or appearance (\"the hero\", \"the tavern keeper\", \"a red-haired woman\"), never by name, in any alphabet — names are for `who` and people[].who only; inside people[] (looksAt, action, hands) call others by their labels. Say how many people are in frame. The reference pictures the illustrator has show identity only: never describe a pose, a head angle or a gaze taken from them.",
    "short: the same scene in at most 60 words, the subject and action first.",
    "avoid: what must not appear (extra people, text, objects the scene does not have, the inventions above), one sentence.",
    "timeOfDay / weather: from the clock given below and the text; null when neither says.",
    "profileUpdates: only when the text itself changes a named person's or place's look this turn: a lasting change (a wound, a bandage, a borrowed shirt, a shaved beard, a burnt room) or a temporary look the story set (soot or ash paste on the face, a burned robe, mud, blood, a disguise): the name from the known list and the change in one English clause. When the text removes such a look (the face washed, the robe changed, the bandage off), write the change as \"no longer: \" and the look it removes. Otherwise an empty list. Not for a momentary pose or gesture.",
    "edit: null — unless an owner's comment is given below; then write that one change as a single edit instruction in English (\"make it night\", \"remove his helmet\"), and also fold it into the brief.",
    "Use only what the narration, the profiles, the state lines and the clock say; never add facts, people, items or places that are not there. Write every value in English except the caption.",
  ].join("\n");
  const profiles = input.profiles.filter((row) => row.look.trim() || row.changes.length).map((row) =>
    `${row.name} (${row.kind === "person" ? "person" : "place"}): ${clip(row.look, 1200)}${row.changes.length ? ` Now: ${row.changes.map((change) => clip(change, 200)).join("; ")}.` : ""}`);
  const state = input.state.filter((row) => row.lines.length).map((row) => `${row.name}: ${row.lines.map((line) => clip(line, 300)).join("; ")}`);
  const roles = (input.people ?? []).filter((row) => row.role.trim()).slice(0, 16).map((row) => `${row.name} — ${clip(row.role, 200).replace(/\s+/g, " ")}`);
  const user = [
    input.heroName ? `The hero (addressed as "you"): ${input.heroName}.` : "",
    names.length ? `Known names: ${names.join(", ")}.` : "",
    roles.length ? `Who they are:\n${roles.join("\n")}` : "",
    input.placeName ? `The scene is at: ${input.placeName}.` : "",
    input.clock.timeOfDay ? `The clock says: ${input.clock.timeOfDay}.` : "",
    profiles.length ? `Visual profiles:\n${profiles.join("\n")}` : "",
    state.length ? `Visible state from the records (what each person wears, holds and carries — nothing else):\n${state.join("\n")}` : "",
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
    const people = Array.isArray(v.people) ? v.people.map((row) => {
      const r = (row ?? {}) as Record<string, unknown>;
      return { who: str(r.who, 60), label: str(r.label, 60), looksAt: str(r.looksAt, 120), expression: str(r.expression, 120), action: str(r.action, 240), hands: str(r.hands, 240) || null };
    }).filter((row) => row.who && (row.looksAt || row.expression || row.action || row.hands)).slice(0, 4) : [];
    return {
      who, beat: str(v.beat, 300), brief, short: str(v.short, 600) || wordsOf(brief).slice(0, 60).join(" "), avoid: str(v.avoid, 300),
      timeOfDay: str(v.timeOfDay, 60) || null, weather: str(v.weather, 120) || null, profileUpdates: updates, edit: str(v.edit, 300) || null,
      caption: str(v.caption, 200) || null, people,
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
    // Fix run E (item 79): the anchor's pose, head angle and gaze were copied into every frame (the sergeant
    // always looking up and to the right): the reference gives identity only.
    locks.push(`${capital(person.label)} is the person in ${refName(positions, family)}: keep ${own} face, facial features, skin tone, hair, age and build exactly as there. That picture shows identity only: do not copy its pose, head angle, gaze or expression — ${own} pose, gaze, expression and clothes follow this moment.`);
  }
  // Each person's direction for this moment and what the records give them to hold (items 78, 79: no invented shield or lantern).
  const direction = people.map((person) => {
    const d = person.direction;
    if (!d) return "";
    const parts = [d.action, d.looksAt ? `looks at ${d.looksAt}` : "", d.expression ? `expression: ${d.expression}` : "", d.hands ?? ""].map((part) => part.replace(/[.\s]+$/, "")).filter(Boolean);
    return parts.length ? `${capital(person.label)}: ${parts.join("; ")}.` : "";
  }).filter(Boolean);
  const gear = people.map((person) => {
    if (!person.gear) return "";
    const worn = person.gear.worn.slice(0, 8), packed = person.gear.packed.slice(0, 8);
    if (flux) return worn.length ? `${capital(person.label)}'s gear: ${worn.join(", ")}.` : "";
    const has = worn.length ? `${capital(person.label)} wears or holds: ${worn.join(", ")}` : `${capital(person.label)} holds no weapon or tool of ${possessive(person.pronoun)} own`;
    return `${has}${packed.length ? `; packed away, not in hand: ${packed.join(", ")}` : ""}. Besides what this moment puts in ${possessive(person.pronoun)} hands, nothing else: no other weapon, no shield, no lantern, no torch.`;
  }).filter(Boolean);
  const state = people.flatMap((person) => (person.state ?? []).filter(Boolean).slice(0, 3).map((line) => `${capital(person.label)}: ${line.replace(/[.\s]+$/, "")}.`));
  locks.push(...direction, ...gear, ...state);
  locks.push(flux ? "Natural anatomy: every person has two arms and two hands with five fingers each." : "Every person has exactly two arms and two hands with five fingers each; no extra or missing arms, hands or legs.");
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

/** Fix run E (items 78a, 79): the people of a brief for the compiler — role words resolved to the scene's people (the
 * hero first), each with the brief's own label (never a name), its direction (gaze, expression, action, hands, names
 * inside it turned into labels), the records' gear and «eyes closed» at 0 HP; a name nobody records stays a generic
 * person. Returns the people and the matched records' IDs in that order. */
export function directPeople(brief: Pick<VisualBrief, "who" | "people">, scene: ScenePerson[], records: { id: string; kind: string; hp: number | null; max_hp: number | null }[],
  read: { look: (id: string) => string; gear: (id: string) => { worn: string[]; packed: string[] } }): { people: BriefPerson[]; entityIds: string[] } {
  const resolvedIds = resolveWho(brief.who, scene);
  const matched = brief.who.map((_, index) => (resolvedIds[index] ? records.find((row) => row.id === resolvedIds[index]) ?? null : null));
  const entityIds = [...new Set(matched.filter((row): row is NonNullable<typeof row> => row !== null).sort((a, b) => (a.kind === "player" ? -1 : 0) - (b.kind === "player" ? -1 : 0)).map((row) => row.id))];
  const directionOf = (id: string) => brief.people.find((row) => resolveWho([row.who], scene)[0] === id) ?? null;
  const labels = new Map<string, string>();
  entityIds.forEach((id, index) => {
    const entity = records.find((row) => row.id === id)!;
    const own = directionOf(id)?.label.toLowerCase().replace(/[^\p{L}\p{N}' -]/gu, "").trim() ?? "";
    const hasName = !!own && scene.some((person) => relabel(own, [{ name: person.name, label: "\u0000" }]).includes("\u0000"));
    const label = entity.kind === "player" ? "the hero" : own && !hasName && own !== "the hero" && ![...labels.values()].includes(own) ? own : `person ${index + 1}`;
    labels.set(id, label.slice(0, 48));
  });
  const named = scene.map((person) => ({ name: person.name, label: labels.get(person.id) ?? "another person" }));
  const people: BriefPerson[] = entityIds.map((id) => {
    const entity = records.find((row) => row.id === id)!;
    const d = directionOf(id);
    const down = entity.hp === 0 && (entity.max_hp ?? 0) > 0;
    return { key: id, label: labels.get(id)!, pronoun: "they", appearance: read.look(id), gear: read.gear(id),
      state: down ? [entity.kind === "npc" ? "down at 0 hit points (unconscious or dead): eyes closed" : "down at 0 hit points: unconscious, eyes closed"] : [],
      ...(d ? { direction: { looksAt: relabel(d.looksAt, named), expression: d.expression, action: relabel(d.action, named), hands: d.hands ? relabel(d.hands, named) : null } } : {}) };
  });
  brief.who.forEach((name, index) => { if (!matched[index]) people.push({ key: `${name}#${people.length}`, label: `person ${people.length + 1}`, pronoun: "they", appearance: "as described in the scene" }); });
  return { people, entityIds };
}

/** Known names in a direction («looks at Горн») become the brief's labels: names in a prompt become lettering. */
export function relabel(text: string, people: { name: string; label: string }[]): string {
  let out = text;
  for (const person of people) {
    // The brief model sometimes writes a Russian name in Latin letters («Lira», «Halvar»): both spellings go.
    const parts = person.name.split(/\s+/).filter((word) => word.length >= 3);
    for (const part of [...parts, ...parts.flatMap(latinSpellings)]) {
      const stem = part.length > 5 ? part.slice(0, part.length - 1) : part;
      out = out.replace(new RegExp(`(?<!\\p{L})${stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\p{L}*`, "giu"), person.label);
    }
    out = out.replace(new RegExp(`(${person.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(\\s+\\1)+`, "gi"), "$1");
  }
  return out;
}

const LATIN: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya" };
/** A Cyrillic name in Latin letters, the two usual ways («Хальвар» → «Khalvar», «Halvar»); none for a Latin name. */
export function latinSpellings(word: string): string[] {
  if (!/[а-яё]/i.test(word)) return [];
  const spell = (h: string) => [...word.toLowerCase()].map((ch) => (ch === "х" ? h : LATIN[ch] ?? ch)).join("");
  return [...new Set([spell("kh"), spell("h")])].filter((row) => row.length >= 3);
}

const keyWords = (text: string) => text.toLowerCase().split(/[^\p{L}]+/u).filter((word) => word.length >= 4 && !["with", "from", "that", "this", "their", "longer", "still", "anymore"].includes(word));
const likeWord = (a: string, b: string) => a === b || (a.length >= 5 && b.length >= 5 && a.slice(0, 5) === b.slice(0, 5));
/** Fix run E (item 79, the ash on James's face): a profile's story changes after one update — a new look joins
 * them; «no longer: …» removes the change it names (most words in common, half at least). Null: nothing changes. */
export function applyLookChange(changes: string[], change: string): string[] | null {
  const removal = /^\s*no longer\s*[:,-]?\s*/i.exec(change);
  if (removal) {
    const gone = keyWords(change.slice(removal[0].length));
    let best = -1, score = 0;
    changes.forEach((row, index) => {
      const own = keyWords(row);
      const common = gone.filter((word) => own.some((mine) => likeWord(word, mine))).length;
      const value = common / Math.max(1, Math.min(gone.length, own.length));
      if (value > score) { score = value; best = index; }
    });
    return best >= 0 && score >= 0.5 ? changes.filter((_, index) => index !== best) : null;
  }
  if (changes.some((row) => row.toLowerCase() === change.toLowerCase())) return null;
  return [...changes, change.slice(0, 300)].slice(-12);
}

/** Brief words for a stored record and a quick sanity check. */
export const briefWordCount = (brief: Pick<VisualBrief, "brief">) => wordsOf(brief.brief).length;
