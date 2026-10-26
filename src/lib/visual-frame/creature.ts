// Fix S4 item 5 (the owner's hour: «the cat's portrait came out as a man with a raven», and the visual profile was then
// drafted from that picture — «The Cat is a large, glossy black raven, not a feline»): a companion whose kind is an animal
// or a familiar is drawn as the animal alone — no human figure, no full-length «doll» framing — and its look is written
// from the records' words, never from a picture. Pure: the species from the record's own words, and the portrait prompt.
import type { Entity } from "../persistence/contracts.ts";
import type { PromptFamily } from "./prompt-compiler.ts";

/** The species words (English and Russian stems) and the English word the prompt uses. */
const SPECIES: [string, string][] = [
  ["cat|cats|kitten|tomcat|кот|кота|коту|котом|коте|котик|кошк\\p{L}*|котён\\p{L}*|котен\\p{L}*", "cat"],
  ["dog|hound|puppy|пёс|пес|пса|собак\\p{L}*|щен\\p{L}*|гончая", "dog"],
  ["wolf|wolves|волк\\p{L}*", "wolf"],
  ["fox|лиса|лис|лисиц\\p{L}*", "fox"],
  ["raven|crow|ворон\\p{L}*", "raven"],
  ["owl|сова|сову|совы|филин\\p{L}*", "owl"],
  ["hawk|falcon|ястреб\\p{L}*|сокол\\p{L}*", "hawk"],
  ["eagle|орёл|орел|орл\\p{L}*", "eagle"],
  ["bat|летуч\\p{L}* мыш\\p{L}*", "bat"],
  ["rat|mouse|крыс\\p{L}*|мыш\\p{L}*", "rat"],
  ["snake|serpent|viper|змея|змею|змеи|гадюк\\p{L}*", "snake"],
  ["toad|frog|жаба|жабу|лягушк\\p{L}*", "toad"],
  ["lizard|ящериц\\p{L}*", "lizard"],
  ["spider|паук\\p{L}*", "spider"],
  ["weasel|ferret|stoat|хорёк|хорек|ласка", "weasel"],
  ["monkey|обезьян\\p{L}*", "monkey"],
  ["octopus|осьминог\\p{L}*", "octopus"],
  ["crab|краб\\p{L}*", "crab"],
  ["pseudodragon|псевдодракон\\p{L}*", "pseudodragon"],
];
const FAMILIAR = /(?<![\p{L}])(?:familiar|фамильяр\p{L}*)(?![\p{L}])/iu;
const PERSON = /(?<![\p{L}])(?:man|woman|boy|girl|person|human|elf|dwarf|halfling|gnome|tiefling|orc|мужчина|женщина|парень|девушка|мальчик|девочка|человек|эльф|гном|дварф)(?![\p{L}])/iu;
const word = (pattern: string) => new RegExp(`(?<![\\p{L}])(?:${pattern})(?![\\p{L}])`, "iu");
const speciesIn = (text: string): { species: string; at: number } | null => {
  let best: { species: string; at: number } | null = null;
  for (const [pattern, species] of SPECIES) {
    const match = word(pattern).exec(text);
    if (match && (!best || match.index < best.at)) best = { species, at: match.index };
  }
  return best;
};

export type CreatureSource = { kind: string; name: string; role?: string | null; details?: string | null; appearance?: string | null };
/** The animal a companion or an NPC is, from its own words: its name («The cat»), its sheet's role («Cat familiar»), or
 * the first words of its description or the owner's appearance text («A lean black cat with…», «James's familiar, a
 * cat»); a person who keeps an animal («A woman with a cat on her shoulder») is not one. A familiar whose form is not
 * named is «a small animal familiar». Null for the hero, a place's people, a mount or a vehicle. */
export function creatureOf(source: CreatureSource): { species: string } | null {
  if (source.kind !== "companion" && source.kind !== "npc") return null;
  const sentence = (text: string | null | undefined) => (text ?? "").replace(/\s+/g, " ").trim().split(/[.;!?\n]/u)[0];
  // What a description is about: its first words up to a comma, a dash, a colon or «who / that / with» — «A lean black
  // cat with…» is a cat; «The innkeeper, who keeps a cat» is not.
  const head = (text: string | null | undefined) => sentence(text).split(/[,:—–(]|\s(?:who|that|which|with|whose|keeps|holding|carrying|и|с|который|которая|держит)\s/iu)[0].split(" ").slice(0, 6).join(" ");
  for (const [text, whole] of [[source.name, source.name], [source.role ?? "", source.role ?? ""], [head(source.appearance), sentence(source.appearance)], [head(source.details), sentence(source.details)]]) {
    if (!text.trim()) continue;
    const found = speciesIn(text);
    const person = PERSON.exec(text);
    if (found && (!person || person.index > found.at)) return { species: found.species };
    if (!found && FAMILIAR.test(text) && !person) {
      // «James's familiar» — the form may be named a little further on («…, a black cat that…»).
      const later = speciesIn(whole);
      return { species: later?.species ?? "small animal familiar" };
    }
    if (person) return null;
  }
  return null;
}

/** The record's own creature reading: its kind, name, the role on its sheet and its description. */
export function creatureOfEntity(entity: Pick<Entity, "kind" | "name" | "details" | "character_sheet">, appearance: string | null = null) {
  const role = entity.character_sheet && typeof entity.character_sheet === "object" && typeof (entity.character_sheet as { role?: unknown }).role === "string"
    ? (entity.character_sheet as { role: string }).role : null;
  return creatureOf({ kind: entity.kind, name: entity.name, role, details: entity.details, appearance });
}
/** A drafted look that names another animal than the record's («The Cat is a large, glossy black raven» for the cat) —
 * drafted from a wrong picture; the records' words are used instead and the look is drafted again from them. The
 * record's own name («The Cat») is not a description. */
export function contradictsSpecies(look: string, species: string, name = ""): boolean {
  const own = name.trim() ? look.replace(new RegExp(`(?<![\\p{L}])${name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}])`, "giu"), " ") : look;
  const found = speciesIn(own);
  return !!found && found.species !== species && !word(SPECIES.find(([, row]) => row === species)?.[0] ?? species).test(own);
}

/** The words a visual profile is drafted from — never a picture: the owner's own description first (it wins), the
 * record's description, its sheet (role, background, features), the hero's sheet lines about a companion (the familiar's
 * line), what it wears and visible conditions. */
export function profileSourceText(input: {
  entity: Pick<Entity, "kind" | "name" | "details" | "character_sheet" | "conditions">;
  ownerText: string;
  hero: Pick<Entity, "character_sheet"> | null;
  worn: string[];
}): string {
  const sheet = (input.entity.character_sheet && typeof input.entity.character_sheet === "object" ? input.entity.character_sheet : {}) as
    { role?: unknown; background?: unknown; abilities?: unknown; limitations?: unknown };
  const lines = (value: unknown) => (Array.isArray(value) ? value.filter((row): row is string => typeof row === "string" && !!row.trim()) : []);
  const creature = creatureOfEntity(input.entity, input.ownerText || null);
  const heroSheet = (input.hero?.character_sheet && typeof input.hero.character_sheet === "object" ? input.hero.character_sheet : {}) as { abilities?: unknown; limitations?: unknown };
  const names = [input.entity.name.replace(/^(?:the|a|an)\s+/iu, ""), creature?.species ?? ""].filter((name) => name.trim().length >= 3);
  const aboutIt = input.entity.kind === "companion"
    ? [...lines(heroSheet.abilities), ...lines(heroSheet.limitations)].filter((line) => names.some((name) => word(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(line)))
    : [];
  return [
    input.ownerText.trim() ? `The owner's description (it wins over everything else): ${input.ownerText.trim()}` : "",
    input.entity.details?.trim() ? `Description: ${input.entity.details.trim()}` : "",
    typeof sheet.role === "string" && sheet.role.trim() ? `Its sheet: ${sheet.role.trim()}` : "",
    typeof sheet.background === "string" && sheet.background.trim() ? `Its sheet's background: ${sheet.background.trim().slice(0, 800)}` : "",
    lines(sheet.abilities).length ? `Its sheet's features: ${lines(sheet.abilities).slice(0, 12).join("; ")}` : "",
    aboutIt.length ? `The hero's sheet about it: ${aboutIt.slice(0, 6).join("; ")}` : "",
    input.worn.length ? `Wears or carries: ${input.worn.join(", ")}.` : "",
    input.entity.conditions.length ? `Visible condition: ${input.entity.conditions.join(", ")}.` : "",
  ].filter(Boolean).join("\n");
}

const clean = (value: string) => value.replace(/\s+/g, " ").trim();
/** The anchor of an animal companion: the animal alone, whole, in a natural pose, the look from the records' words (the
 * owner's text when he wrote one), the art style. Never a person's framing, a person's anatomy guard or a «doll». */
export function compileCreatureAnchorPrompt(input: { species: string; appearance: string; style: string; hasStyleReference: boolean }, family: PromptFamily): string {
  const species = clean(input.species);
  const flux = family === "flux";
  const framing = `A portrait of a single ${species}, an animal drawn alone: the whole ${species} from head to tail, sitting or standing naturally on the ground, its head turned a little toward the viewer, calm, on a plain dark background.`;
  const look = clean(input.appearance) ? `The ${species}: ${clean(input.appearance).slice(0, 1200)}${/[.!?]$/u.test(clean(input.appearance)) ? "" : "."}` : "";
  const alone = flux
    ? `The ${species} is alone in the picture, an ordinary animal with natural animal anatomy.`
    : `Only the ${species} is in the picture: no human figure, no face, hands, arms or clothes of anyone, no rider, owner or shoulder to perch on, no second animal. Natural animal anatomy.`;
  const reference = input.hasStyleReference ? (family === "gpt-image" ? "Image 1 — the art style (style only)." : "The first image shows the art style (style only).") : "";
  const text = flux ? "The background is plain and unmarked." : "No text, letters, numbers, logos or watermarks anywhere in the picture.";
  const style = clean(input.style) ? `Art style: ${clean(input.style).slice(0, 800)}${/[.!?]$/u.test(clean(input.style)) ? "" : "."}` : "";
  return [family === "gpt-image" || family === "seedream" ? reference : "", framing, look, alone, family === "gpt-image" || family === "seedream" ? "" : reference, text, style]
    .filter(Boolean).join("\n").slice(0, 8000);
}
