// Findings S3 §6 (docs/stages/FINDINGS_S3.md, «People of the world written from the inside»; the owner: «НПС сделать
// супер живыми»): first-person text carries a character better than a description of it. Each person's private card
// holds, besides the facts, a short voice block the DM wrote as that person — what I want, what I fear, what I know and
// hide, how I talk — three or four lines in the campaign language, under 80 words. It is a private note (`fact`,
// `voice_<entity id>`, or `voice_<name>` for a person the prep names before the records do), written by the hidden-layer
// prep and by the session digest through the private notes they already write; the DM reads it inside the person's card
// when they are in the scene (it counts against the cards' budget there); the player never sees it. Pure.
import type { Entity } from "../../persistence/contracts.ts";
import type { RuntimeSource } from "../server-contracts.ts";
import { parseNoteValue } from "./private-notes.ts";

export const INNER_VOICE_PREFIX = "voice_";
export const INNER_VOICE_MAX_WORDS = 80;
/** At most this many blocks are asked for in one prep or digest. */
export const INNER_VOICES_PER_CALL = 8;

const LATIN: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya" };
/** A name as a note key's tail: transliterated, lowercase, words joined by «-» («Сержант Брам» → «serzhant-bram»). */
export function voiceSlug(name: string): string {
  return name.toLowerCase().replace(/[а-яё]/g, (ch) => LATIN[ch] ?? "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
}
export const innerVoiceKey = (person: { id?: string | null; name: string }) =>
  `${INNER_VOICE_PREFIX}${person.id ?? voiceSlug(person.name)}`;
export const isInnerVoiceKey = (key: string) => key.startsWith(INNER_VOICE_PREFIX);

/** The block as stored: whitespace folded; past 80 words cut at the last full sentence inside them (or at 80 words). */
export function boundInnerVoice(text: unknown): string | null {
  if (typeof text !== "string") return null;
  const folded = text.replace(/\s+/g, " ").trim();
  if (!folded) return null;
  const words = folded.split(" ");
  if (words.length <= INNER_VOICE_MAX_WORDS) return folded;
  const cut = words.slice(0, INNER_VOICE_MAX_WORDS).join(" ");
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "), cut.lastIndexOf("… "));
  return end > cut.length / 2 ? cut.slice(0, end + 1) : `${cut}…`;
}

/** The stored value: the person's name, then the block («Брам: Я …»), so a block written before the records still names whom it is for. */
export const innerVoiceValue = (name: string, block: string) => `${name.trim()}: ${block}`;

type Voice = { key: string; name: string; text: string };
/** Every stored block, by key. */
export function innerVoices(privateState: RuntimeSource["privateState"]): Map<string, Voice> {
  const out = new Map<string, Voice>();
  const facts = privateState.fact;
  if (!facts || typeof facts !== "object" || Array.isArray(facts)) return out;
  for (const [key, raw] of Object.entries(facts as Record<string, unknown>)) {
    if (!isInnerVoiceKey(key)) continue;
    const note = parseNoteValue(raw);
    if (!note.text.trim() || note.until !== null) continue;
    const at = note.text.indexOf(": ");
    out.set(key, at > 0 && at < 120 ? { key, name: note.text.slice(0, at), text: note.text.slice(at + 2) } : { key, name: "", text: note.text });
  }
  return out;
}

/** A person's block: by their record's ID, else by their name as the prep wrote it (the whole name, or its first word). */
export function innerVoiceFor(entity: Pick<Entity, "id" | "name">, voices: Map<string, Voice>): string | null {
  const first = entity.name.trim().split(/\s+/)[0] ?? "";
  for (const key of [innerVoiceKey({ id: entity.id, name: entity.name }), innerVoiceKey({ name: entity.name }), first.length >= 3 ? innerVoiceKey({ name: first }) : ""])
    if (key && voices.has(key)) return voices.get(key)!.text;
  return null;
}

/** The line a card carries for a person in the scene. */
export const innerVoiceLine = (text: string) => `in their own words — the voice you wrote as them (private): ${text}`;

/** The people who still need a block: the companions, then the given people (who recur), without one yet, at most eight. */
export function peopleWithoutVoice(source: Pick<RuntimeSource, "snapshot" | "privateState">, recurring: readonly string[] = []): { id: string; name: string }[] {
  const voices = innerVoices(source.privateState);
  const people = source.snapshot.entities.filter((row) => row.kind === "companion" || ((row.kind === "npc") && recurring.includes(row.id)));
  return people.sort((a, b) => Number(b.kind === "companion") - Number(a.kind === "companion"))
    .filter((row) => !innerVoiceFor(row, voices)).slice(0, INNER_VOICES_PER_CALL).map((row) => ({ id: row.id, name: row.name }));
}

/** The private-note writes of the blocks a prep or a digest returned: a person on record by their ID, a name not on
 * record yet by the name; a person who already has a block keeps it. */
export function innerVoiceWrites(voices: { name?: string; entityId?: string | null; inner: string }[], entities: readonly Pick<Entity, "id" | "name" | "kind">[],
  privateState: RuntimeSource["privateState"]): { kind: "fact"; key: string; value: string }[] {
  const stored = innerVoices(privateState);
  const writes: { kind: "fact"; key: string; value: string }[] = [];
  for (const voice of voices.slice(0, INNER_VOICES_PER_CALL)) {
    const block = boundInnerVoice(voice.inner);
    if (!block) continue;
    const entity = voice.entityId ? entities.find((row) => row.id === voice.entityId)
      : entities.find((row) => row.kind !== "player" && row.name.trim().toLowerCase() === (voice.name ?? "").trim().toLowerCase());
    const name = entity?.name ?? voice.name?.trim() ?? "";
    if (!name || (entity && innerVoiceFor(entity, stored))) continue;
    const key = innerVoiceKey(entity ? { id: entity.id, name } : { name });
    if (key === INNER_VOICE_PREFIX || stored.has(key) || writes.some((row) => row.key === key)) continue;
    writes.push({ kind: "fact", key, value: innerVoiceValue(name, block) });
  }
  return writes;
}
