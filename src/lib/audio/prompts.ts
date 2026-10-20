// Generation prompts for a world's soundtrack: the world's musical style (owner-editable),
// one mood, a loop-friendly shape, no vocals. Pure.
import { musicModel, type MusicRequest } from "./models.ts";
import { mood, type MoodId } from "./moods.ts";

export const MAX_STYLE_TEXT = 1200;

export const NEGATIVE_PROMPT = "vocals, singing, lyrics, choir with words, spoken word, rap, voice, abrupt ending, applause, crowd noise, silence";

/** The length to ask for per mood: calm beds may be shorter, driving cues want room before the loop seam. */
export function cueSeconds(id: MoodId) {
  const energy = mood(id).energy;
  return energy >= 4 ? 90 : energy === 3 ? 75 : 60;
}

/** The style words for a section plan (ElevenLabs): the style text cut into short phrases. */
export function styleWords(styleText: string) {
  return styleText.split(/[.;:\n]/).flatMap((part) => part.split(",")).map((word) => word.trim()).filter((word) => word.length >= 3 && word.length <= 60).slice(0, 12);
}

export function musicPrompt(input: { styleText: string; moodId: MoodId; model: string; seconds: number; variant?: number }) {
  const model = musicModel(input.model);
  const m = mood(input.moodId);
  const style = input.styleText.trim().slice(0, MAX_STYLE_TEXT);
  const variantNote = input.variant && input.variant > 1 ? ` Variation ${input.variant}: a different motif and instrumentation from the first take, the same mood.` : "";
  const lengthNote = model?.duration === "prompt" ? ` About ${input.seconds} seconds long.` : "";
  return [
    `Instrumental background music for a tabletop role-playing session.`,
    `World and musical style: ${style}`,
    `Mood: ${m.hint}.`,
    `Shaped to loop in the background: a steady texture from the first second, no long intro, no big final cadence, no fade-out, ending as it begins so it can repeat. Even dynamics; nothing sudden or jarring.`,
    `No vocals, no lyrics, no singing.${lengthNote}${variantNote}`,
  ].join(" ");
}

export function musicRequestFor(input: { styleText: string; moodId: MoodId; model: string; seconds?: number; seed?: number | null; variant?: number }): MusicRequest {
  const seconds = input.seconds ?? cueSeconds(input.moodId);
  return {
    model: input.model,
    prompt: musicPrompt({ styleText: input.styleText, moodId: input.moodId, model: input.model, seconds, variant: input.variant }),
    negativePrompt: NEGATIVE_PROMPT,
    seconds,
    seed: input.seed ?? null,
    styleWords: [...styleWords(input.styleText), "instrumental", "cinematic", "loopable"],
  };
}

/** A starting musical style for a world, from its premise and visual style (the owner edits it). */
export function suggestMusicStyle(input: { title?: string | null; premise?: string | null; visualStyle?: string | null; language?: string | null }) {
  const text = [input.title, input.premise, input.visualStyle].filter(Boolean).join(". ");
  const lower = text.toLowerCase();
  const hints: string[] = [];
  const has = (...words: string[]) => words.some((word) => lower.includes(word));
  if (has("стимпанк", "steampunk", "паров", "steam", "дирижабл", "airship", "clockwork", "латун", "brass")) hints.push("orchestral-mechanical: strings and brass with ticking clockwork percussion, organ hum, accordion colours, 19th-century adventure romance");
  if (has("noir", "нуар", "neon", "неон", "cyber", "кибер", "implant", "имплант", "synd", "синдикат")) hints.push("synthwave noir: muted trumpet and saxophone over analog synth pads, slow brushed jazz drums, upright bass, tape hiss and rain");
  if (has("dragon", "дракон", "sword", "меч", "kingdom", "королев", "эльф", "elf", "dwarf", "гном", "magic", "маги", "fantasy", "фэнтези")) hints.push("orchestral fantasy: strings, horns, low drums, Celtic flute and harp, a touch of choir without words");
  if (has("space", "космос", "star", "звезд", "ship", "корабл", "galaxy", "галакт")) hints.push("cinematic space: wide synth pads, slow strings, distant percussion, vast and cold");
  if (has("horror", "ужас", "жуть", "призрак", "ghost", "dark", "тьма")) hints.push("dark ambient: low drones, bowed metal, sparse piano, unease");
  if (has("west", "вестерн", "desert", "пустын", "frontier")) hints.push("frontier: acoustic guitar, dusty harmonica, slow drums, wide open spaces");
  if (has("sea", "море", "pirate", "пират", "harbor", "гавань", "порт")) hints.push("sea voyage: accordion and fiddle, creaking wood, swelling strings");
  if (hints.length === 0) hints.push("cinematic orchestral with light electronic textures, intimate when calm, driving when in danger");
  const premise = (input.premise ?? "").trim().slice(0, 300);
  return [premise ? `The world: ${premise}` : "", hints.join("; ") + "."].filter(Boolean).join(" ").slice(0, MAX_STYLE_TEXT);
}
