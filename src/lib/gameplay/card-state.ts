// Fix S4 run 1 (FIX_S4_TABLE items 3, 11b, 11r): the roll cards of a turn, as the public turn marks them (migration
// 202610250701): a card still waits only while its turn waits and it was neither resolved at an earlier pause
// («Onward»), nor withdrawn before it counted, nor voided after the roll. One reading for the game screen, the text
// harness (scripts/game-player-1) and the server's own check of a reroll or a correction. Pure: no imports.

type CardTurn = { status: string };
type CardCheck = {
  id: string;
  interactive?: boolean;
  canReroll?: boolean;
  resolved?: boolean;
  withdrawn?: { by: "dm" | "owner"; reason: string | null } | null;
  voided?: { by: "owner"; note: string | null; at?: string | null } | null;
  bundledDamage?: boolean;
};

export type CardState = "waiting" | "resolved" | "withdrawn" | "voided";

/** Where a card stands: a committed (or ended) turn's cards are resolved unless withdrawn or voided. */
export function cardState(turn: CardTurn, check: CardCheck): CardState {
  if (check.withdrawn) return "withdrawn";
  if (check.voided) return "voided";
  if (check.resolved || turn.status !== "awaiting_confirmation") return "resolved";
  return "waiting";
}

/** The cards the turn waits on now (a paused turn's own, never one resolved at an earlier pause). */
export function waitingCards<T extends CardCheck>(turn: CardTurn & { checks?: readonly T[] | null }): T[] {
  return (turn.checks ?? []).filter((check) => cardState(turn, check) === "waiting");
}

/** The cards an allowed reroll may touch now: waiting cards the server offers a reroll on — never one whose roll
 * carried its damage (a new die would not redo the damage already dealt). */
export function rerollableCards<T extends CardCheck>(turn: CardTurn & { checks?: readonly T[] | null }): T[] {
  return waitingCards(turn).filter((check) => check.canReroll === true && !check.bundledDamage);
}

/** A waiting card that takes no reroll because its roll carried its damage. */
export function rerollBlockedByDamage(turn: CardTurn, check: CardCheck): boolean {
  return cardState(turn, check) === "waiting" && check.bundledDamage === true;
}

/** A rolled card the owner may void (a correction): resolved, on a paused or a committed turn. */
export function voidable(turn: CardTurn, check: CardCheck): boolean {
  return (turn.status === "awaiting_confirmation" || turn.status === "committed") && cardState(turn, check) === "resolved";
}

/** «Rerolls left: N» or «unlimited» (null rerolls = unlimited, the server's own count). */
export function rerollsLeftText(rerolls: number | null, language: "ru" | "en"): string {
  if (rerolls === null) return language === "ru" ? "Перебросов: без ограничений" : "Rerolls left: unlimited";
  return language === "ru" ? `Перебросов осталось: ${rerolls}` : `Rerolls left: ${rerolls}`;
}
