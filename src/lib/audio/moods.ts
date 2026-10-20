// The mood vocabulary of the soundtrack (the music stage). A world's pack holds
// tracks per mood; the player picks a mood from the public scene signal. Pure.

export type MoodId =
  | "travel" | "explore" | "mystery" | "tension" | "combat" | "climax" | "quiet" | "warm"
  | "humor" | "trade" | "town" | "night" | "dread" | "sorrow" | "triumph";

export type Mood = {
  id: MoodId;
  label: { ru: string; en: string };
  /** What the music should feel like, for the generation prompt. */
  hint: string;
  /** 1 (still) … 5 (full force): a switch upward is urgent, a switch downward waits. */
  energy: 1 | 2 | 3 | 4 | 5;
};

export const MOODS: readonly Mood[] = [
  { id: "travel", label: { ru: "Дорога", en: "On the road" }, hint: "a steady walking pace on an open road, light hopeful forward motion, the party on the move", energy: 2 },
  { id: "explore", label: { ru: "Открытие", en: "Exploration" }, hint: "wonder and curiosity, a strange place slowly unfolding, discovery, wide and airy", energy: 2 },
  { id: "mystery", label: { ru: "Тайна", en: "Mystery" }, hint: "an uneasy investigation, unanswered questions, sparse and shadowy, a question hanging in the air", energy: 2 },
  { id: "tension", label: { ru: "Напряжение", en: "Rising tension" }, hint: "a standoff or an interrogation, pressure building, held breath, a pulse underneath, no release yet", energy: 3 },
  { id: "combat", label: { ru: "Бой", en: "Combat" }, hint: "a fight in progress, driving rhythm, urgency and danger, blows landing", energy: 4 },
  { id: "climax", label: { ru: "Кульминация", en: "Climax" }, hint: "the decisive battle, epic and relentless, everything at stake, full force", energy: 5 },
  { id: "quiet", label: { ru: "Тишина", en: "Quiet" }, hint: "a calm pause, rest, soft and still, room to breathe, nothing is wrong", energy: 1 },
  { id: "warm", label: { ru: "Тепло", en: "Warmth" }, hint: "a warm private moment with a companion, tender and intimate, gentle, close", energy: 1 },
  { id: "humor", label: { ru: "Шутка", en: "Humour" }, hint: "light-hearted banter, playful and witty, a wink and a bounce, nobody is in danger", energy: 2 },
  { id: "trade", label: { ru: "Торг", en: "Trade" }, hint: "a market or a shop, bustling and lively, bargaining, coins and voices around", energy: 2 },
  { id: "town", label: { ru: "Город", en: "Town" }, hint: "a settlement by day, life around, people at work, unhurried and civil", energy: 2 },
  { id: "night", label: { ru: "Ночь", en: "Night" }, hint: "night, stars or rain, hushed and nocturnal, slow, the world asleep", energy: 1 },
  { id: "dread", label: { ru: "Жуть", en: "Dread" }, hint: "a dark dangerous place, dread, low drones, something is wrong and getting closer", energy: 3 },
  { id: "sorrow", label: { ru: "Горе", en: "Sorrow" }, hint: "loss and aftermath, grief, slow and mournful, a weight that stays", energy: 1 },
  { id: "triumph", label: { ru: "Победа", en: "Triumph" }, hint: "victory and relief, a reward earned, uplifting and bright, the danger behind", energy: 3 },
] as const;

export const MOOD_IDS = MOODS.map((row) => row.id) as readonly MoodId[];
export function isMoodId(value: unknown): value is MoodId {
  return typeof value === "string" && (MOOD_IDS as readonly string[]).includes(value);
}
export function mood(id: MoodId): Mood {
  return MOODS.find((row) => row.id === id)!;
}
export function moodLabel(id: MoodId, lang: "ru" | "en") {
  return mood(id).label[lang];
}
