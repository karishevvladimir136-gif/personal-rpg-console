// Polish stage, group 10 (docs/stages/POLISH.md «Wizard and the path to the first turn»):
// two pure text helpers the wizard and the opening review use. No model call.
import type { CreationInput, CreationProposal, CreationReview, HeroProposal, HeroReview } from "./bootstrap-contracts.ts";
import { initialCreationReview } from "./bootstrap-validation.ts";
import { initialHeroReview } from "./hero-draft.ts";

const PARTICLES = new Set([
  "из", "де", "фон", "ван", "да", "ди", "ла", "ле", "дель", "аль", "бен", "ибн",
  "of", "de", "von", "van", "da", "di", "la", "le", "del", "al",
]);
/** The hero's name as the DM should write it: «рэй кривой» → «Рэй Кривой»; particles stay
 * («Иван из Пскова»). Only the first letter of each word changes, so «РЭЙ» is left alone
 * (the wizard offers the result, it never forces it). */
export function capitalizedName(name: string): string {
  return name.trim().replace(/\s+/g, " ").split(" ").map((word, index) => {
    if (index > 0 && PARTICLES.has(word.toLocaleLowerCase())) return word;
    return word.split("-").map((part) => (part ? part[0].toLocaleUpperCase() + part.slice(1) : part)).join("-");
  }).join(" ");
}

type Lang = "en" | "ru";

/** The wizard's first review of a creation draft: a possession the draft could not count is
 * one item until the owner says otherwise (the wizard no longer asks for every single knife).
 * The policy baseline, initialCreationReview, stays null so a server commit still needs an
 * explicit number. */
export function wizardCreationReview(input: CreationInput, proposal: CreationProposal): CreationReview;
export function wizardCreationReview(input: CreationInput, proposal: CreationProposal | HeroProposal): CreationReview | HeroReview;
export function wizardCreationReview(input: CreationInput, proposal: CreationProposal | HeroProposal): CreationReview | HeroReview {
  // Fix run F: the hero the DM built in one pass opens as it is (its things already have their quantities).
  if (proposal.schemaVersion === 3) return initialHeroReview(input, proposal);
  const review = initialCreationReview(input, proposal);
  return { ...review, possessions: review.possessions.map((row) => ({ ...row, quantity: row.quantity ?? 1 })) };
}
const HOUR_WORDS: Record<string, number> = {
  час: 1, одного: 1, два: 2, двух: 2, три: 3, трёх: 3, трех: 3, четыре: 4, четырёх: 4, четырех: 4,
  пять: 5, пяти: 5, шесть: 6, шести: 6, семь: 7, семи: 7, восемь: 8, восьми: 8, девять: 9, девяти: 9,
  десять: 10, десяти: 10, одиннадцать: 11, одиннадцати: 11, двенадцать: 12, двенадцати: 12,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
};
/** Part-of-day words with the clock they imply, in reading order of the text. The first
 * mention wins; an explicit clock («в 17:30», «в шесть утра», «at 6 am») wins over a word. */
// JavaScript's \b knows ASCII letters only; Cyrillic words take explicit boundaries.
const w = (pattern: string) => new RegExp(`(?<!\\p{L})(?:${pattern})`, "iu");
const PARTS: Array<[RegExp, number]> = [
  [w("полноч|midnight"), 0],
  [w("полдень|полудн|полуден|noon(?!\\p{L})|midday"), 12 * 60],
  [w("рассвет|на заре|заря|dawn(?!\\p{L})|sunrise|first light"), 6 * 60],
  [w("утр(?:о|а|у|ом|е|енн)|morning"), 8 * 60],
  [w("закат|сумерк|dusk(?!\\p{L})|sunset|twilight|evening|вечер"), 19 * 60],
  [w("ноч(?:ь|и|ью|но|н)|night"), 23 * 60],
  [w("дн(?:ём|ем|я)(?!\\p{L})|днев|afternoon|daytime"), 14 * 60],
];
const qualified = (hour: number, qualifier: string): number => {
  const q = qualifier.toLocaleLowerCase();
  if (/утра|ночи|\bam\b|morning/.test(q)) return hour === 12 ? 0 : hour;
  if (/дня|вечера|\bpm\b|afternoon|evening/.test(q)) return hour === 12 ? 12 : hour + 12;
  return hour;
};
/** Fix S4 11u: a time word that is not the scene's present — «Last night's luck still weighs…», «yesterday», «the night
 * before», «since midnight», «вчера вечером» — is not the clock of the opening (C-fable's dawn read as «night» from «last
 * night's», and the first action's bookkeeping then jumped the clock seven hours). Such phrases are blanked before the
 * words are read. */
const phrases = (parts: string[]) => parts.map((part) => `(?<!\\p{L})(?:${part})(?!\\p{L})`).join("|");
const NOT_NOW = new RegExp(phrases([
  "last\\s+(?:night|evening|morning)(?:'s|’s)?", "yester(?:day|night)(?:'s|’s)?(?:\\s+(?:morning|evening|night))?", "tomorrow(?:'s|’s)?(?:\\s+(?:morning|evening|night))?",
  "the\\s+(?:night|evening|morning|day)\\s+before", "that\\s+(?:night|evening|morning)", "overnight", "today",
  "since\\s+(?:dawn|midnight|nightfall|dark|dusk|noon|morning|evening|night|sunrise|sunset|first\\s+light)",
  "every\\s+(?:morning|evening|night)", "good\\s+night", "night\\s+before",
  "вчера(?:\\s+(?:утром|вечером|ночью|днём|днем))?", "завтра(?:\\s+(?:утром|вечером|ночью|днём|днем))?", "прошл\\p{L}*\\s+ноч\\p{L}*",
  "т(?:ой|у)\\s+(?:же\\s+)?ноч\\p{L}*", "с\\s+(?:утра|рассвета|вечера|полуночи|полудня)", "каждое\\s+утро", "каждый\\s+вечер", "по\\s+ночам", "наутро",
]), "giu");
/** Phrases about what is still ahead that tell the present's part of the day only by implication — «a line of people who
 * want to get through before full dark» (it is dusk), a porter's «bed for the night?» (evening), «we wait until dawn»
 * (night). Blanked like the others; read as the scene's light, after the plain words. */
const AHEAD: Array<[RegExp, number]> = [
  [new RegExp(phrases(["before\\s+(?:full\\s+)?(?:dark|nightfall|dusk|sunset)", "by\\s+nightfall", "tonight", "for\\s+the\\s+night", "до\\s+(?:темноты|заката)", "на\\s+ночь", "сегодня\\s+вечером"]), "iu"), 19 * 60],
  [new RegExp(phrases(["(?:until|till|before)\\s+(?:dawn|morning|first\\s+light|sunrise)", "by\\s+morning", "(?:all|through\\s+the)\\s+night", "до\\s+(?:утра|рассвета)", "всю\\s+ночь"]), "iu"), 23 * 60],
  [new RegExp(phrases(["(?:until|till|before)\\s+(?:evening|dusk)", "до\\s+вечера"]), "iu"), 14 * 60],
  [new RegExp(phrases(["(?:until|till|before)\\s+noon", "до\\s+полудня"]), "iu"), 8 * 60],
];
const AHEAD_ALL = new RegExp(AHEAD.map(([pattern]) => pattern.source).join("|"), "giu");
/** The light of the scene when no time word is said: lamps being lit at sundown, grey light through the shutters. */
const LIGHT: Array<[RegExp, number]> = [
  [w("(?:sun|солнце)\\s+(?:is\\s+)?(?:low|going down|goes down|drops|dropping|sinking|sets|setting|садится|опускается)|sundown|last light|(?:first\\s+)?(?:lamps|lanterns)\\s+(?:are\\s+)?(?:being\\s+)?(?:lit|flicker|coming on)|lamplighters|copper sky|зажига\\p{L}*\\s+фонар\\p{L}*"), 19 * 60],
  [w("(?:grey|gray|pale)\\s+light|(?:sun|солнце)\\s+(?:is\\s+)?(?:rising|rises|comes up|встаёт|встает|поднимается)|cock(?:erel)?s?\\s+crow|петух\\p{L}*|серый\\s+свет"), 7 * 60],
  [w("moonlight|moonlit|by the light of the moon|лунн\\p{L}*\\s+свет|при\\s+луне"), 23 * 60],
];
const firstOf = (text: string, patterns: Array<[RegExp, number]>) => {
  let best: { at: number; minutes: number } | null = null;
  for (const [pattern, minutes] of patterns) {
    const match = pattern.exec(text);
    if (match && (!best || match.index < best.at)) best = { at: match.index, minutes };
  }
  return best;
};
/** Minutes after midnight the opening scene starts at, read from its words; null when the
 * text names no time of day. The owner corrects it on the opening review. An explicit clock wins, then a spoken hour,
 * then the first part-of-day word of the scene's present (fix S4 11u: never «last night's», «yesterday», «the night
 * before»), then the scene's light and what it is still waiting for («before full dark»). */
export function startMinutesFromText(text: string, _language: Lang = "ru"): number | null {
  void _language;
  const clock = text.match(/(?<!\d)([01]?\d|2[0-3])[:.]([0-5]\d)(?!\d)/u);
  if (clock) return Number(clock[1]) * 60 + Number(clock[2]);
  const spoken = text.match(/(?<!\p{L})(?:в|к|около|после|at|around|by)\s+(\d{1,2}|\p{L}+)(?:\s+(?:часов|часа|часу|o'clock))?\s+(утра|дня|вечера|ночи|am|pm|in the morning|in the afternoon|in the evening)(?!\p{L})/iu);
  if (spoken) {
    const word = spoken[1].toLocaleLowerCase();
    const hour = /^\d+$/.test(word) ? Number(word) : HOUR_WORDS[word];
    if (hour !== undefined && hour >= 1 && hour <= 12) return qualified(hour, spoken[2]) * 60;
  }
  const blank = (phrase: string) => " ".repeat(phrase.length);
  const now = text.replace(NOT_NOW, blank);
  const present = now.replace(AHEAD_ALL, blank);
  const word = firstOf(present, PARTS);
  if (word) return word.minutes;
  const light = firstOf(present, LIGHT), ahead = firstOf(now, AHEAD);
  const cue = light && ahead ? (light.at <= ahead.at ? light : ahead) : light ?? ahead;
  return cue ? cue.minutes : null;
}
/** The choices the opening review offers, in the campaign language. */
export function startTimeChoices(language: Lang): Array<{ minutes: number; label: string }> {
  const ru = language === "ru";
  return [
    { minutes: 6 * 60, label: ru ? "Рассвет · 6:00" : "Dawn · 6:00" },
    { minutes: 8 * 60, label: ru ? "Утро · 8:00" : "Morning · 8:00" },
    { minutes: 12 * 60, label: ru ? "Полдень · 12:00" : "Noon · 12:00" },
    { minutes: 14 * 60, label: ru ? "День · 14:00" : "Afternoon · 14:00" },
    { minutes: 19 * 60, label: ru ? "Вечер · 19:00" : "Evening · 19:00" },
    { minutes: 23 * 60, label: ru ? "Ночь · 23:00" : "Night · 23:00" },
  ];
}

type BlockedReview = {
  possessions: { name: string; quantity: number | null }[];
  resources: { label: string; amount: number | null }[];
  answers: (string | null)[];
  sheet?: { mode: string };
  mechanics?: unknown;
};
/** Why «Создать персонажа и кампанию» is disabled, in one plain line (the button never
 * stays grey without a reason). Mirrors parseCreationReview's checks in words. */
export function creationBlockedReason(
  review: BlockedReview,
  questions: { question: string; consequential: boolean }[],
  language: Lang,
): string {
  const ru = language === "ru";
  const unnamed = review.possessions.find((row) => !row.name.trim()) ?? review.resources.find((row) => !row.label.trim());
  if (unnamed) return ru ? "Назови вещь или ресурс без названия — или убери строку." : "Name the unnamed item or resource, or remove the line.";
  const uncounted = review.possessions.find((row) => row.quantity === null);
  if (uncounted) return ru ? `Укажи количество: ${uncounted.name}.` : `Enter the quantity: ${uncounted.name}.`;
  const unbalanced = review.resources.find((row) => row.amount === null);
  if (unbalanced) return ru ? `Укажи, сколько: ${unbalanced.label}.` : `Enter the amount: ${unbalanced.label}.`;
  const open = questions.findIndex((row, index) => row.consequential && (review.answers[index] ?? null) === null);
  if (open >= 0) return ru ? `Ответь на вопрос ведущего: ${questions[open].question}` : `Answer the DM's question: ${questions[open].question}`;
  if (review.sheet?.mode === "structured_rpg" && review.mechanics === undefined)
    return ru ? "Утверди боевой профиль в «Исправить лист персонажа» — или выбери повествовательный лист." : "Approve the combat profile under “Correct character sheet”, or choose the narrative sheet.";
  return ru ? "В листе что-то не сходится — проверь исправления." : "Something in the sheet does not add up; check the corrections.";
}

/** The wizard's last step hands its start to the adventures screen through sessionStorage,
 * so the owner does not type the start twice (polish item «the flow breaks»). */
export type WizardStart = { choice: "dm" | "mine"; phrase: string };
export const wizardStartKey = (campaignId: string) => `rpg:wizard:start:${campaignId}`;
export function parseWizardStart(raw: string | null): WizardStart | null {
  try {
    const value = raw ? JSON.parse(raw) : null;
    if (!value || typeof value !== "object" || (value.choice !== "dm" && value.choice !== "mine") || typeof value.phrase !== "string") return null;
    return { choice: value.choice, phrase: value.phrase.slice(0, 2000) };
  } catch { return null; }
}
/** The first adventure's setup from the wizard's choice: the owner's own phrase, or a brief
 * that leaves the opening to the DM. */
export function wizardAdventureSetup(start: WizardStart, language: Lang) {
  const ru = language === "ru";
  const phrase = start.phrase.trim();
  return {
    title: ru ? "Первое приключение" : "First adventure",
    premise: start.choice === "mine" && phrase
      ? phrase
      : ru
        ? "Ведущий выбирает начало сам: сцена из мира и истории героя, с первой же минуты — что-то, на что хочется ответить."
        : "The DM chooses the opening: a scene from the world and the hero's story, with something to answer from the first minute.",
    pacing: { kind: "evening" as const, custom: null },
  };
}

/** Fix run F (item 21): the new-campaign wizard in story order — the world, the hero, the adventure, the DM, the
 * first scene. Each step's title and its one-line hint. */
export function wizardSteps(language: Lang): { id: "world" | "hero" | "adventure" | "dm" | "opening"; title: string; hint: string }[] {
  const ru = language === "ru";
  return [
    { id: "world", title: ru ? "Мир" : "World", hint: ru ? "выбрать или создать" : "pick or create" },
    { id: "hero", title: ru ? "Герой" : "Hero", hint: ru ? "своими словами" : "in your own words" },
    { id: "adventure", title: ru ? "Приключение" : "Adventure", hint: ru ? "во что играем" : "what we play" },
    { id: "dm", title: ru ? "Ведущий" : "DM", hint: ru ? "модель и глубина" : "model and depth" },
    { id: "opening", title: ru ? "Первая сцена" : "First scene", hint: ru ? "начало — и играть" : "the opening — and play" },
  ];
}
const DEPTH_NAMES: Record<string, [string, string]> = {
  low: ["низкая", "low"], medium: ["средняя", "medium"], high: ["высокая", "high"], xhigh: ["очень высокая", "extra high"], max: ["максимум", "max"],
};
/** Item 10: the depth range a campaign plays at, as the summary and the DM step say it («высокая — очень высокая»). */
export function depthRangeLabel(range: { min: string; max: string }, language: Lang): string {
  const name = (level: string) => DEPTH_NAMES[level]?.[language === "ru" ? 0 : 1] ?? level;
  return range.min === range.max ? name(range.min) : `${name(range.min)} — ${name(range.max)}`;
}
/** The first adventure's text from the wizard's adventure step: what we play, and who goes with the hero (item 15:
 * the whole text reaches every turn while the adventure is active). */
export function wizardAdventurePremise(premise: string, companions: string, language: Lang): string {
  const people = companions.trim();
  const body = premise.trim();
  return people ? `${body}${body ? "\n\n" : ""}${language === "ru" ? "С героем идут" : "Going with the hero"}: ${people}` : body;
}
