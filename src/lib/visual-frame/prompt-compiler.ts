// The prompt layer: one shot (who, action, where, angle, mood) plus what the
// records say is visible now becomes a prompt written the way each model family
// is told to be prompted. Deterministic and pure: no model call, no randomness,
// no environment. The compiled prompt is stored with the picture (private, never
// shown to the player). Vendor guidance it follows (picture bake-off, 2026-10-17,
// docs/runs/pictures-README.md):
// - natural sentences, not tag lists: subject, action, setting, light, materials,
//   mood, as a brief to an artist (Google's Nano Banana Pro rules; OpenAI's GPT
//   Image guide; BFL: FLUX.2 reads prose);
// - references with one role each, subject references first, fewer and cleaner;
//   GPT Image by number and purpose («Image 1 — …»), Nano Banana, Seedream, Qwen,
//   Grok and FLUX by position («the first image …»);
// - lock identity explicitly, then say what may change, in every frame;
// - the current visible state (clothes worn now, wounds and bandages, items in
//   hand, wet or dry) and the time of day and weather come from the records and
//   the world clock, written as constraints — never invented here;
// - one of each named person, the exact number of people, an anatomy guard;
// - no lettering unless the scene needs it, said plainly — except to FLUX, which
//   has no negative prompts (BFL), so plain unmarked surfaces are described instead;
// - «Перерисовать» of a nearly-right frame is an edit: «change only X; keep everything else».
import type { Shot } from "./shot.ts";

export type PromptFamily = "gpt-image" | "nano-banana" | "seedream" | "flux" | "qwen" | "grok";
/** The prompt dialect of a model ID from the fal or OpenAI catalogue. */
export function promptFamily(modelId: string): PromptFamily {
  if (/^gpt-image|gpt-image/.test(modelId)) return "gpt-image";
  if (/nano-banana|gemini/.test(modelId)) return "nano-banana";
  if (/seedream/.test(modelId)) return "seedream";
  if (/qwen/.test(modelId)) return "qwen";
  if (/grok/.test(modelId)) return "grok";
  return "flux";
}

export type ReferenceRole = "face" | "figure" | "person" | "place" | "style";
/** One reference picture as sent; `person` is the key of a person in the brief. */
export type BriefReference = { role: ReferenceRole; person?: string };
export type BriefPerson = {
  /** The name the shot used (matching only; never printed — names become captions). */
  key: string;
  /** How the prompt refers to this person: "the man", "the tavern keeper". */
  label: string;
  pronoun: "he" | "she" | "they";
  /** Approved visible traits: age range, skin tone, hair, build, usual clothes. */
  appearance: string;
  /** Visible state now, from the records, each a full clause: "he wears …", "both his hands are wrapped in …". */
  state?: string[];
};
export type FrameBrief = {
  shot: Shot;
  /** The people in the frame, the hero first; one entry per person. */
  people: BriefPerson[];
  /** The reference pictures in the order they are sent. Use orderReferences() to get that order. */
  references: BriefReference[];
  /** From the world clock and the narration; omitted parts are not mentioned. */
  clock?: { timeOfDay?: string | null; weather?: string | null } | null;
  style: string;
  /** Only when the scene itself needs readable writing (a sign the narration quotes). */
  allowText?: boolean;
};

/** The fixed reference order: each referenced person's face then figure (the hero first, in brief
 * order), the other people's pictures, the place, the style; trimmed to the model's limit, so
 * subjects survive the cut and the style goes first. */
export function orderReferences<T extends BriefReference>(references: T[], people: Pick<BriefPerson, "key">[], max: number): T[] {
  const personIndex = (key?: string) => { const at = people.findIndex((row) => row.key === key); return at < 0 ? people.length : at; };
  const rank = (row: BriefReference) =>
    row.role === "face" || row.role === "figure" ? personIndex(row.person) * 2 + (row.role === "face" ? 0 : 1)
      : row.role === "person" ? 10_000 + personIndex(row.person) : row.role === "place" ? 20_000 : 30_000;
  return references.map((row, index) => ({ row, index })).sort((a, b) => rank(a.row) - rank(b.row) || a.index - b.index)
    .map(({ row }) => row).slice(0, Math.max(0, max));
}

const clean = (text: string | null | undefined) => (text ?? "").replace(/\s+/g, " ").trim().replace(/[.;,\s]+$/, "");
const sentence = (text: string | null | undefined) => { const value = clean(text); return value ? value[0].toUpperCase() + value.slice(1) + "." : ""; };
const words = ["zero", "one", "two", "three", "four", "five", "six"];
const count = (n: number) => words[n] ?? String(n);
const possessive = (pronoun: BriefPerson["pronoun"]) => (pronoun === "he" ? "his" : pronoun === "she" ? "her" : "their");
const capital = (text: string) => (text ? text[0].toUpperCase() + text.slice(1) : text);
function listing(items: string[]) {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/** «Image 1», «Images 1–2» (GPT Image) or «the first image», «the first and second images» (by position). */
function refName(positions: number[], family: PromptFamily) {
  const sorted = [...positions].sort((a, b) => a - b).map((n) => n + 1);
  if (family === "gpt-image") {
    if (sorted.length === 1) return `Image ${sorted[0]}`;
    const consecutive = sorted.every((n, i) => i === 0 || n === sorted[i - 1] + 1);
    return consecutive ? `Images ${sorted[0]}–${sorted.at(-1)}` : `Images ${listing(sorted.map(String))}`;
  }
  const ordinals = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"];
  const names = sorted.map((n) => ordinals[n - 1] ?? `${n}th`);
  return sorted.length === 1 ? `the ${names[0]} image` : `the ${listing(names)} images`;
}
function roleText(reference: BriefReference, person: BriefPerson | undefined) {
  const who = person?.label ?? "a person in the frame";
  const own = person ? possessive(person.pronoun) : "their";
  switch (reference.role) {
    case "face": return { what: `${who}'s face and hair`, rule: "keep exact" };
    case "figure": return { what: `${who}'s full figure and build`, rule: `keep exact; ${own} clothes follow the text below` };
    case "person": return { what: who, rule: "keep exact" };
    case "place": return { what: "the place", rule: "setting only" };
    default: return { what: "the art style", rule: "style only" };
  }
}

/** The compiled prompt for one frame in the dialect of a model family. */
export function compileFramePrompt(brief: FrameBrief, family: PromptFamily): string {
  const shot = brief.shot;
  const people = brief.people;
  const byKey = new Map(people.map((row) => [row.key, row]));
  const refsOf = (key: string) => brief.references.map((row, index) => ({ row, index })).filter(({ row }) => row.person === key && row.role !== "place" && row.role !== "style").map(({ index }) => index);
  const flux = family === "flux";
  const time = clean(brief.clock?.timeOfDay), weather = clean(brief.clock?.weather);

  // The scene, as a brief to an artist.
  const where = clean(shot.where);
  const place = [where, time].filter(Boolean).join(", ");
  const setting = place ? `The setting: ${place}${weather ? `; ${weather}` : ""}` : weather ? `The weather: ${weather}` : "";
  const scene = [
    `A cinematic story illustration of one moment: ${clean(shot.action)}.`,
    setting ? sentence(setting) : "",
    shot.mood ? sentence(`Light and mood: ${shot.mood}`) : "",
    sentence(`Camera: ${shot.angle || "medium shot"}`),
  ].filter(Boolean).join(" ");

  // References, each with its role, in the order sent.
  const references = brief.references.map((row, index) => {
    const { what, rule } = roleText(row, row.person ? byKey.get(row.person) : undefined);
    return family === "gpt-image" ? `Image ${index + 1} — ${what} (${rule}).` : `${capital(refName([index], family))} shows ${what} (${rule}).`;
  });
  const referenceBlock = references.length ? (family === "gpt-image" ? `Reference images: ${references.join(" ")}` : references.join(" ")) : "";

  // People: how many, who, identity locks, visible state.
  const peopleLines: string[] = [];
  if (people.length) {
    peopleLines.push(people.length === 1 ? "Exactly one person is in the frame." : `Exactly ${count(people.length)} people are in the frame, each of them once.`);
    for (const person of people) {
      const positions = refsOf(person.key);
      const own = possessive(person.pronoun);
      const anchor = positions.length ? ` (${refName(positions, family)})` : "";
      peopleLines.push(sentence(`${capital(person.label)}${anchor}: ${clean(person.appearance)}`));
      if (positions.length)
        peopleLines.push(`Keep ${own} face, facial features, skin tone, hair, age and build exactly as in ${refName(positions, family)}; only ${own} pose, expression and the camera angle change.`);
      const state = (person.state ?? []).map(clean).filter(Boolean);
      if (state.length) peopleLines.push(`Right now: ${state.join("; ")}. Show exactly this, nothing more and nothing less.`);
    }
    peopleLines.push(flux
      ? "Natural anatomy: every person has two arms and two hands with five fingers each."
      : "Every person has two arms and two hands with five fingers each; no extra or missing limbs.");
  } else peopleLines.push(flux ? "The frame shows the place only." : "No people in the frame.");

  const text = brief.allowText ? "" : flux
    ? "All surfaces, clothing, signs and objects are plain and unmarked."
    : "No text, letters, numbers, logos, signs or watermarks anywhere in the picture.";
  const style = brief.style.trim() ? sentence(`Art style: ${brief.style.trim().slice(0, 800)}`) : "Art style: painterly illustration with cinematic light.";

  let parts: string[];
  switch (family) {
    // OpenAI: lead with the references and what to preserve, then the scene.
    case "gpt-image": parts = [referenceBlock, scene, peopleLines.join(" "), text, style]; break;
    // FLUX: the most important first (subject and action), prose, no negatives.
    case "flux": parts = [scene, peopleLines.join(" "), referenceBlock, style, text]; break;
    // Seedream: concise; references by position up front.
    case "seedream": parts = [referenceBlock, scene, peopleLines.join(" "), style, text]; break;
    // Nano Banana, Qwen and Grok: the scene as a brief, then the references and the fixed/variable split.
    default: parts = [scene, referenceBlock, peopleLines.join(" "), text, style];
  }
  return parts.filter(Boolean).join("\n").slice(0, 8000);
}

/** An anchor of one person (portrait or full figure), drawn with the same rules: the face reference
 * by role, the identity lock, the anatomy guard (the anchor is the reference of every later frame, so
 * an extra hand here spreads), no lettering. */
export function compileAnchorPrompt(input: {
  person: BriefPerson; composition: "portrait" | "figure"; references: BriefReference[]; style: string;
  /** Polish 2: the items the records say this person carries, as their own constraint — never «pistol in
   * hand, helmet in hands» inside the pose (the likely trigger of the owner's three-handed anchor). */
  carried?: string[];
}, family: PromptFamily): string {
  const { person } = input;
  const flux = family === "flux";
  const own = possessive(person.pronoun);
  const framing = input.composition === "figure"
    ? `A full-body character illustration of ${person.label}, standing in a relaxed pose, the whole figure visible from head to boots, arms down at ${own} sides, both hands empty, on a plain dark backdrop.`
    : `A head-and-shoulders character portrait of ${person.label}, three-quarter view, expressive face, plain dark background.`;
  const carried = (input.carried ?? []).map(clean).filter(Boolean).slice(0, 8);
  const gear = carried.length
    ? `${capital(own)} gear, worn on the body, slung or hung from the belt and straps, not held in the hands: ${listing(carried)}.`
    : "";
  const refs = input.references.map((row, index) => {
    const { what, rule } = roleText(row, person);
    return family === "gpt-image" ? `Image ${index + 1} — ${what} (${rule}).` : `${capital(refName([index], family))} shows ${what} (${rule}).`;
  });
  const faces = input.references.map((row, index) => ({ row, index })).filter(({ row }) => row.role === "face" || row.role === "figure" || row.role === "person").map(({ index }) => index);
  const lock = faces.length ? `Keep ${own} face, facial features, skin tone, hair, age and build exactly as in ${refName(faces, family)}.` : "";
  const anatomy = input.composition === "figure"
    ? (flux ? "Natural anatomy: exactly one person with one head, two arms, two hands with five fingers each and two legs." : "Exactly one person: one head, two arms, two hands with five fingers each, two legs; no extra or missing limbs.")
    : (flux ? "Exactly one person." : "Exactly one person; no extra faces.");
  const text = flux ? "Clothing and backdrop are plain and unmarked." : "No text, letters, numbers, logos or watermarks anywhere in the picture.";
  const style = input.style.trim() ? sentence(`Art style: ${input.style.trim().slice(0, 800)}`) : "";
  const body = [framing, sentence(`${capital(person.label)}: ${clean(person.appearance)}`), (person.state ?? []).length ? `Right now: ${(person.state ?? []).map(clean).join("; ")}.` : "", gear, lock, anatomy];
  const refBlock = refs.length ? (family === "gpt-image" ? `Reference images: ${refs.join(" ")}` : refs.join(" ")) : "";
  return (family === "gpt-image" || family === "seedream" ? [refBlock, ...body, text, style] : [...body, refBlock, flux ? style : text, flux ? text : style])
    .filter(Boolean).join("\n").slice(0, 8000);
}

/** «Перерисовать» of a nearly-right frame as an edit: the frame goes back as the only reference. */
export function compileEditPrompt(change: string, family: PromptFamily): string {
  const what = clean(change);
  const image = family === "gpt-image" ? "Image 1" : "the image";
  return family === "flux"
    ? `Change only this in the image: ${what}. Everything else stays exactly the same: the composition, every person's face, hair, body and clothes, the light and the art style.`
    : `Edit ${image}: change only this — ${what}. Keep everything else exactly as it is: the composition, every person's face, hair, body and clothes, the light and the art style. No text, letters or logos.`;
}

/** Time of day from the world clock (minutes since the campaign's start). */
export function timeOfDay(worldMinutes: number | null | undefined) {
  if (worldMinutes === null || worldMinutes === undefined || !Number.isFinite(worldMinutes) || worldMinutes < 0) return null;
  const hour = Math.floor((worldMinutes % 1440) / 60);
  if (hour < 5) return "at night";
  if (hour < 7) return "at dawn";
  if (hour < 11) return "in the morning";
  if (hour < 17) return "in the daytime";
  if (hour < 19) return "in the evening";
  if (hour < 21) return "at dusk";
  return "at night";
}

/** The app's frame from its records: the people the shot matched, what each wears now (equipped
 * items) and visible conditions, references with their roles in the fixed order, the clock when the
 * caller has it. Returns the prompt and the reference IDs in the order the prompt numbers them. */
export function compileRecordsFrame(input: {
  modelId: string;
  shot: Shot;
  style: string;
  /** shot.who name → the matched public record, if any. */
  people: { name: string; entity: { id: string; kind: string; conditions: string[] } | null; appearance: string }[];
  items: { name: string; quantity: number; equipped_entity_id: string | null }[];
  references: { id: string; role: ReferenceRole; entityId?: string | null }[];
  maxReferences: number;
  worldMinutes?: number | null;
}): { prompt: string; referenceIds: string[] } {
  const people: BriefPerson[] = input.people.map((row, index) => {
    const hero = row.entity?.kind === "player";
    const worn = row.entity ? input.items.filter((item) => item.equipped_entity_id === row.entity!.id && item.quantity > 0).map((item) => item.name).slice(0, 8) : [];
    const conditions = (row.entity?.conditions ?? []).filter(Boolean).slice(0, 4);
    return {
      key: row.entity?.id ?? `${row.name}#${index}`,
      label: hero ? "the hero" : `person ${index + 1}`,
      pronoun: "they",
      appearance: row.appearance || "as described in the scene",
      state: [worn.length ? `they wear or carry ${listing(worn)}` : "", conditions.length ? `visible condition: ${conditions.join(", ")}` : ""].filter(Boolean),
    };
  });
  const keyOf = (entityId?: string | null) => (entityId ? people.find((row) => row.key === entityId)?.key : undefined);
  const references = orderReferences(input.references.map((row) => ({ ...row, person: keyOf(row.entityId) })), people, input.maxReferences);
  const prompt = compileFramePrompt({
    shot: input.shot, people, references, style: input.style,
    clock: input.worldMinutes === undefined || input.worldMinutes === null ? null : { timeOfDay: timeOfDay(input.worldMinutes) },
  }, promptFamily(input.modelId));
  return { prompt, referenceIds: references.map((row) => row.id) };
}
