// Persona memory 1: words, stems and periods for recall. English and Russian, no dictionary: a word matches another
// when one's stem is a prefix of the other (the DM's recall matched whole words; the journal is in Russian, where a
// cue «журнал» must find «журналом»). A query that names a period («в октябре», «last week», «2026-10-20») is
// time-aware: the period is cut out of the words and restricts the episodes to those that began in it.

const STOP = new Set(("a an the and or but of to in on at for with by from as is are was were be been it its this that these those i me my we our you your he him his she her they them their " +
  "what which who whom when where why how do did does done not no so if then than there here about into over after before again also just very can could would should will " +
  "и в во на не что как а но да же ли ну к ко с со у о об от до по за из для при это этот эта эти то тот та те я мы ты вы он она они его её ее их мне меня мой моя мои наш наша " +
  "был была было были быть есть где когда почему зачем который которая которые чем тоже уже ещё еще бы вот там тут всё все так " +
  // Question verbs that name no thing: «what happened last week», «что произошло вчера».
  "happen happened happens going went talk talked discussed remember recall произошло случилось происходило говорили обсуждали помнишь вспомни").split(/\s+/));

export const normalize = (text: string) => text.toLowerCase().replace(/ё/g, "е");

/** Words of a text, lower-case, stop words out. */
export function words(text: string): string[] {
  return normalize(text).split(/[^\p{L}\p{N}]+/u).filter((word) => word.length >= 2 && !STOP.has(word));
}

/** A stem good enough for prefix matching: short words stay whole, longer ones lose their last two letters. */
export const stem = (word: string) => (word.length <= 4 ? word : word.slice(0, Math.max(4, word.length - 2)));

/** Whether a query stem meets any of the text's words. */
export function stemHits(queryStem: string, textWords: Iterable<string>): boolean {
  for (const word of textWords) if (word.startsWith(queryStem) || queryStem.startsWith(stem(word))) return true;
  return false;
}

// ---- periods --------------------------------------------------------------------------------------------------------

export type Period = { from: string; to: string; label: string };

// Full names and three-letter abbreviations; Russian in the cases a date takes («октябрь», «октября», «в октябре»).
const EN_MONTHS = ["jan(?:uary)?", "feb(?:ruary)?", "mar(?:ch)?", "apr(?:il)?", "may", "june?", "july?", "aug(?:ust)?", "sept?(?:ember)?", "oct(?:ober)?", "nov(?:ember)?", "dec(?:ember)?"];
const RU_MONTHS = ["январ[ьяе]", "феврал[ьяе]", "март[ае]?", "апрел[ьяе]", "ма[йяе]", "июн[ьяе]", "июл[ьяе]", "август[ае]?", "сентябр[ьяе]", "октябр[ьяе]", "ноябр[ьяе]", "декабр[ьяе]"];
const MONTH = `(?:${EN_MONTHS.map((m, i) => `(?<m${i}>${m}|${RU_MONTHS[i]})`).join("|")})`;
/** «may» and «march» are also a verb and a noun: alone, without a day or a year, they are not a period. */
const AMBIGUOUS_ALONE = /^(?:may|mar|march)$/;
const monthOf = (groups: Record<string, string | undefined> | undefined) => {
  for (let i = 0; i < 12; i++) if (groups?.[`m${i}`]) return i;
  return -1;
};

const day = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d));
const iso = (date: Date) => date.toISOString();
const span = (from: Date, to: Date, label: string): Period => ({ from: iso(from), to: iso(to), label });
const startOfDay = (date: Date) => day(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86_400_000);
/** Monday of the week of a date. */
const weekStart = (date: Date) => addDays(startOfDay(date), -((date.getUTCDay() + 6) % 7));
/** A month without a year is its latest occurrence not after now. */
const yearFor = (month: number, now: Date) => (month > now.getUTCMonth() ? now.getUTCFullYear() - 1 : now.getUTCFullYear());

const B = "(?<![\\p{L}\\p{N}])", E = "(?![\\p{L}\\p{N}])";
type Rule = { pattern: RegExp; period: (match: RegExpMatchArray, now: Date) => Period | null };
const RULES: Rule[] = [
  { pattern: new RegExp(`${B}(\\d{4})-(\\d{2})-(\\d{2})${E}`, "u"), period: (m) => { const d = day(+m[1], +m[2] - 1, +m[3]); return span(d, addDays(d, 1), m[0]); } },
  { pattern: new RegExp(`${B}(\\d{4})-(\\d{2})${E}`, "u"), period: (m) => span(day(+m[1], +m[2] - 1, 1), day(+m[1], +m[2], 1), m[0]) },
  { pattern: new RegExp(`${B}(\\d{1,2})(?:-?(?:го|е|st|nd|rd|th))?\\s+${MONTH}(?:\\s+(\\d{4}))?${E}`, "iu"), period: (m, now) => {
    const month = monthOf(m.groups), year = m[m.length - 1] && /^\d{4}$/.test(m[m.length - 1]!) ? +m[m.length - 1]! : yearFor(month, now);
    const d = day(year, month, +m[1]);
    return month < 0 ? null : span(d, addDays(d, 1), m[0]);
  } },
  { pattern: new RegExp(`${B}${MONTH}\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?${E}`, "iu"), period: (m, now) => {
    const month = monthOf(m.groups), numbers = m.slice(1).filter((value) => value && /^\d+$/.test(value));
    const year = numbers[1] ? +numbers[1] : yearFor(month, now);
    const d = day(year, month, +numbers[0]!);
    return month < 0 || !numbers[0] ? null : span(d, addDays(d, 1), m[0]);
  } },
  { pattern: new RegExp(`${B}${MONTH}(?:\\s+(\\d{4}))?${E}`, "iu"), period: (m, now) => {
    const month = monthOf(m.groups), last = m[m.length - 1];
    const year = last && /^\d{4}$/.test(last) ? +last : yearFor(month, now);
    if (!last && AMBIGUOUS_ALONE.test(m[0].trim())) return null;
    return month < 0 ? null : span(day(year, month, 1), day(year, month + 1, 1), m[0]);
  } },
  { pattern: new RegExp(`${B}(?:yesterday|вчера)${E}`, "iu"), period: (m, now) => span(addDays(startOfDay(now), -1), startOfDay(now), m[0]) },
  { pattern: new RegExp(`${B}(?:today|сегодня)${E}`, "iu"), period: (m, now) => span(startOfDay(now), addDays(startOfDay(now), 1), m[0]) },
  { pattern: new RegExp(`${B}(\\d{1,3})\\s+(?:days?\\s+ago|(?:день|дня|дней)\\s+назад)${E}`, "iu"), period: (m, now) => {
    const d = addDays(startOfDay(now), -+m[1]); return span(d, addDays(d, 1), m[0]);
  } },
  { pattern: new RegExp(`${B}(?:last\\s+week|(?:на\\s+)?прошлой\\s+неделе)${E}`, "iu"), period: (m, now) => span(addDays(weekStart(now), -7), weekStart(now), m[0]) },
  { pattern: new RegExp(`${B}(?:this\\s+week|(?:на\\s+)?этой\\s+неделе)${E}`, "iu"), period: (m, now) => span(weekStart(now), addDays(weekStart(now), 7), m[0]) },
  { pattern: new RegExp(`${B}(?:last\\s+month|(?:в\\s+)?прошлом\\s+месяце)${E}`, "iu"), period: (m, now) => {
    const y = now.getUTCFullYear(), mo = now.getUTCMonth(); return span(day(y, mo - 1, 1), day(y, mo, 1), m[0]);
  } },
  { pattern: new RegExp(`${B}(?:this\\s+month|(?:в\\s+)?этом\\s+месяце)${E}`, "iu"), period: (m, now) => {
    const y = now.getUTCFullYear(), mo = now.getUTCMonth(); return span(day(y, mo, 1), day(y, mo + 1, 1), m[0]);
  } },
];

/** The first period a query names, the query without it, and where the period's words were. `null` when it names none. */
export function periodOf(query: string, now: Date): { period: Period; rest: string; index: number; length: number } | null {
  const text = normalize(query);
  for (const rule of RULES) {
    for (const match of text.matchAll(new RegExp(rule.pattern.source, `${rule.pattern.flags}g`))) {
      const period = match.index === undefined ? null : rule.period(match, now);
      if (!period || !Number.isFinite(Date.parse(period.from))) continue;
      // «in October», «в октябре»: the preposition left in front of the period is not a word to search for.
      const before = text.slice(0, match.index).replace(/(?:^|\s)(?:in|on|during|from|в|во|на)\s*$/u, " ");
      return { period, rest: `${before} ${text.slice(match.index! + match[0].length)}`.replace(/\s+/g, " ").trim(), index: match.index!, length: match[0].length };
    }
  }
  return null;
}
