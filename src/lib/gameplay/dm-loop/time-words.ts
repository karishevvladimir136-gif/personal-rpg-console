// Polish 3 §7: code instead of a rule where code can check. The time-of-day words of a
// committed narration («утром», «вечером», «tonight») are compared with the game clock the
// turn started at (the bench's own check, polish item 18); a mismatch becomes one private
// line in the next turn's tail — what was written, what the clock said — and nothing
// otherwise. The DM reads the line next to the clock; the rule card need not say it.
import type { JsonObject } from "../contracts.ts";

export const TIME_CHECK_KEY = "time_check";

const WORDS: Record<"morning" | "day" | "evening" | "night", RegExp> = {
  morning: /(^|[^\p{L}])(утр[ао]м?|поутру|this morning|in the morning)/u,
  day: /(^|[^\p{L}])(днём|в полдень|this afternoon|at noon|midday)/u,
  evening: /(^|[^\p{L}])(вечером|под вечер|this evening|in the evening)/u,
  night: /(^|[^\p{L}])(ночью|за полночь|tonight|at night|in the night)/u,
};
// A sentence that tells of another time («той ночью», «наутро», «вчера», «в январе») is not a claim about now.
const PAST = /(вчера|yesterday|last night|прошл|завтра|tomorrow|той( же)? ночью|в ту( же)? ночь|тем вечером|тем утром|наутро|тогда|когда-то|давно|назад|в январе|в феврале|в марте|в апреле|в мае|в июне|в июле|в августе|в сентябре|в октябре|в ноябре|в декабре|бывало|раньше|the night before|that night|that morning|that evening|back then|years ago|weeks ago|days ago)/u;

export type TimeWordsCheck = { clock: "morning" | "day" | "evening" | "night"; hhmm: string; found: string[]; wrong: string[] };

/** The narration's time-of-day words against the clock at the turn's start (minutes of the world). */
export function timeWordsAgainstClock(narration: string, worldMinutes: number): TimeWordsCheck {
  const rest = ((worldMinutes % 1440) + 1440) % 1440;
  const hour = Math.floor(rest / 60);
  const clock = hour < 5 ? "night" : hour < 11 ? "morning" : hour < 17 ? "day" : hour < 22 ? "evening" : "night";
  const hhmm = `${String(hour).padStart(2, "0")}:${String(Math.floor(rest % 60)).padStart(2, "0")}`;
  const text = narration.toLocaleLowerCase();
  const present = text.split(/(?<=[.!?…])\s+|\n+/u).filter((row) => !PAST.test(row)).join(" ");
  const found = (Object.keys(WORDS) as (keyof typeof WORDS)[]).filter((name) => WORDS[name].test(present));
  return { clock, hhmm, found, wrong: found.filter((name) => name !== clock) };
}

export type TimeCheckNote = { turn: string; wrote: string[]; clock: string; hhmm: string };

/** The private note the commit keeps when the check fails (JSON in the «fact» bucket); null when it passed. */
export function timeCheckNote(operationId: string, check: TimeWordsCheck): string | null {
  return check.wrong.length ? JSON.stringify({ turn: operationId, wrote: check.wrong, clock: check.clock, hhmm: check.hhmm } satisfies TimeCheckNote) : null;
}

export function parseTimeCheckNote(privateState: JsonObject): TimeCheckNote | null {
  const facts = privateState.fact;
  const raw = facts && typeof facts === "object" && !Array.isArray(facts) ? facts[TIME_CHECK_KEY] : undefined;
  if (typeof raw !== "string") return null;
  try {
    const value = JSON.parse(raw) as Partial<TimeCheckNote>;
    return typeof value.turn === "string" && Array.isArray(value.wrote) && typeof value.clock === "string" && typeof value.hhmm === "string"
      ? { turn: value.turn, wrote: value.wrote.map(String), clock: value.clock, hhmm: value.hhmm } : null;
  } catch { return null; }
}

/** The one line of the next turn's tail (empty when the last turn's words agreed with the clock). */
export function timeCheckLine(privateState: JsonObject, language: "ru" | "en"): string {
  const note = parseTimeCheckNote(privateState);
  if (!note) return "";
  const word = (name: string) => (language === "ru" ? { morning: "утро", day: "день", evening: "вечер", night: "ночь" }[name] ?? name : name);
  return `Time words of the last turn against the clock: the narration said ${note.wrote.map((name) => `«${word(name)}»`).join(", ")} while the clock said ${word(note.clock)} (${note.hhmm}). Check every «morning / evening / since…» against the current clock below (${language === "ru" ? "утро / день / вечер / ночь" : "morning / day / evening / night"}); nothing else is wrong.`;
}
