// Fixes before session 3 (docs/stages/FIX_S3_PRE.md 2.4, rows F-owner-1/2, F-2d-6/7, F-play-6): the soundtrack's words
// on the owner's screens in Russian — the mood reasons (mood-select.ts writes them in English for the logs and tests)
// and the track titles (music-job.ts names a track by its mood's English label). Applied at render; nothing stored
// changes. The style fields that feed the English-only generators stay English. Pure, client-safe.
import { MOODS } from "./moods.ts";
import { AMBIENT_KINDS } from "./ambient.ts";

const REASONS_RU: Readonly<Record<string, string>> = {
  "combat with the player's moment": "бой, момент игрока", "combat with a climax tension": "бой на пике напряжения",
  "an encounter is active": "идёт бой", "a combat scene": "сцена боя", "a climax tension without a fight": "пик напряжения без боя",
  "a tense mystery underground": "напряжённая тайна под землёй", "a tense mystery at night": "напряжённая тайна ночью",
  "a tense mystery": "напряжённая тайна", "a mystery scene": "сцена тайны", "a tense conversation": "напряжённый разговор",
  "a trade scene": "торг", "a humour scene": "шутливая сцена", "a quiet talk with a companion": "тихий разговор со спутником",
  "a quiet scene at night": "тихая сцена ночью", "a quiet scene": "тихая сцена", "a tense journey": "напряжённая дорога",
  "travelling at night": "дорога ночью", "on the road": "в дороге", "a tense exploration": "напряжённая разведка",
  "exploring underground": "разведка под землёй", "an exploration scene": "разведка", "a conversation in a tavern": "разговор в таверне",
  "a conversation at a market": "разговор на рынке", "a conversation at night": "разговор ночью", "a calm conversation": "спокойный разговор",
  "a tavern": "таверна", "a market": "рынок", "a town at night": "город ночью", "a town by day": "город днём", "underground": "под землёй",
  "outdoors at night": "под открытым небом ночью", "outdoors": "под открытым небом", "night": "ночь", "nothing in particular": "ничего особенного",
  pinned: "закреплено", "skipped by hand": "переключено вручную",
};
const SUFFIXES_RU: [RegExp, (...groups: string[]) => string][] = [
  [/^first track$/, () => "первый трек"], [/^unchanged$/, () => "без смены"], [/^escalation, switched at once$/, () => "накал, сразу"],
  [/^held for (\d+) turns$/, (n) => `держалось ${n} хода`], [/^the current mood played its minimum$/, () => "прежнее настроение отыграло минимум"],
  [/^waiting: (\d+)\/(\d+) turns, (\d+) s of (\d+)$/, (a, b, s, m) => `ждёт: ${a}/${b} хода, ${s} с из ${m}`],
];

/** A mood reason as the player reads it («в дороге (первый трек)»); an unknown phrase stays as written. */
export function moodReasonText(reason: string, language: string): string {
  if (language !== "ru" || !reason) return reason;
  const match = /^(.*?)(?: \((.+)\))?$/.exec(reason.trim());
  const base = match?.[1] ?? reason, suffix = match?.[2] ?? null;
  const head = REASONS_RU[base] ?? base;
  if (!suffix) return head;
  for (const [pattern, say] of SUFFIXES_RU) {
    const found = pattern.exec(suffix);
    if (found) return `${head} (${say(...found.slice(1))})`;
  }
  return `${head} (${suffix})`;
}

/** A track's title in the campaign language: «On the road 2» → «Дорога 2» (the mood's or the place sound's label). */
export function trackTitle(title: string, language: string): string {
  if (language !== "ru" || !title) return title;
  for (const row of [...MOODS, ...AMBIENT_KINDS]) {
    const en = row.label.en;
    if (title === en || title.startsWith(`${en} `)) return `${row.label.ru}${title.slice(en.length)}`;
  }
  return title;
}
