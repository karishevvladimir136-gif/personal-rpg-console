// Fix run A3/A6: the owner panel's reading of a turn's price — when a turn is flagged, its causes in the owner's
// language, the unrecorded-events phrase. Pure, so the tests read it without the React screen.
import type { PublicTurn } from "@/lib/gameplay/contracts";
import { effortLabel } from "./effort.ts";

/** Fix run A3: a turn over $1 or over four requests is flagged (the owner: «ход за 2,5 доллара — это треш»). */
export const EXPENSIVE_COST_USD = 1;
export const EXPENSIVE_REQUESTS = 4;
export function turnFlagged(turn: Pick<PublicTurn, "stats">): boolean {
  return !!turn.stats && (turn.stats.costUsd > EXPENSIVE_COST_USD || turn.stats.requests > EXPENSIVE_REQUESTS);
}

/** The server names an expensive turn's causes in engineering English (`expensiveTurn`, loop.ts); the owner reads them in his language. */
export function causeLabel(cause: string, language: "ru" | "en"): string {
  if (language !== "ru") return cause;
  const rules: [RegExp, (m: RegExpMatchArray) => string][] = [
    [/^rolls not bundled: (\d+) requests ended on rolls alone$/, (m) => `броски не собраны вместе: ${m[1]} запроса только с бросками`],
    [/^a long continuation chain: (\d+) requests$/, (m) => `длинная цепочка продолжений: ${m[1]} запросов`],
    [/^deep thinking \((\w+)\)$/, (m) => `глубокое обдумывание (${effortLabel(m[1], "ru")})`],
    [/^a request cut by the output cap$/, () => "ответ обрезан пределом длины"],
    [/^rejected records sent back$/, () => "отклонённые записи отправлены на исправление"],
    [/^(\d+) output tokens$/, (m) => `${m[1]} токенов ответа`],
    [/^a low cache share \(([\d.]+)\)$/, (m) => `мало прочитано из кэша (${Math.round(Number(m[1]) * 100)}%)`],
    [/^a large context$/, () => "большой контекст"],
  ];
  for (const [pattern, label] of rules) { const match = cause.match(pattern); if (match) return label(match); }
  return cause;
}
/** «1 незаписанное событие», «3 незаписанных события», «5 незаписанных событий». */
export function unrecordedPhrase(n: number): string {
  const tens = n % 100, ones = n % 10;
  if (ones === 1 && tens !== 11) return `${n} незаписанное событие`;
  if (ones >= 2 && ones <= 4 && (tens < 12 || tens > 14)) return `${n} незаписанных события`;
  return `${n} незаписанных событий`;
}

