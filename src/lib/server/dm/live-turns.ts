import "server-only";
import type { DmLoopLiveEvent } from "../../gameplay/dm-loop/contracts.ts";

// In-process registry of running dm-loop-v1 turns for the player's live view:
// narration deltas and accepted changes, marked provisional until commit. A
// restart of the single local server simply ends the stream; the client then
// falls back to the committed turn. Nothing private is ever published here:
// the writer's ledger of a split turn (polish 3 §2) is kept apart, for the
// server's own consumers (the shot director), and never reaches a listener.
type LiveTurn = { events: DmLoopLiveEvent[]; listeners: Set<(event: DmLoopLiveEvent) => void>; done: boolean; updated: number };
const turns = new Map<string, LiveTurn>();
const ledgers = new Map<string, { ledger: string; updated: number }>();
const RETENTION_MS = 10 * 60 * 1000;

/** A status that ends the turn's stream; `recording` (the bookkeeper's pass) keeps it open. */
export function liveTurnEnds(event: DmLoopLiveEvent): boolean {
  return event.type === "status" && event.status !== "generating" && event.status !== "recording";
}

function sweep() {
  const cutoff = Date.now() - RETENTION_MS;
  for (const [id, turn] of turns) if (turn.updated < cutoff) turns.delete(id);
  for (const [id, row] of ledgers) if (row.updated < cutoff) ledgers.delete(id);
}

export function publishLiveTurnEvent(operationId: string, event: DmLoopLiveEvent) {
  sweep();
  let turn = turns.get(operationId);
  if (!turn) {
    turn = { events: [], listeners: new Set(), done: false, updated: Date.now() };
    turns.set(operationId, turn);
  }
  turn.events.push(event);
  turn.updated = Date.now();
  if (liveTurnEnds(event)) turn.done = true;
  for (const listener of turn.listeners) listener(event);
}

/** Replays what happened so far, then follows. Returns an unsubscribe function. */
export function subscribeLiveTurn(operationId: string, listener: (event: DmLoopLiveEvent) => void): () => void {
  sweep();
  let turn = turns.get(operationId);
  if (!turn) {
    turn = { events: [], listeners: new Set(), done: false, updated: Date.now() };
    turns.set(operationId, turn);
  }
  for (const event of turn.events) listener(event);
  if (turn.done) return () => {};
  turn.listeners.add(listener);
  return () => { turn?.listeners.delete(listener); };
}

export function liveTurnFinished(operationId: string): boolean {
  return turns.get(operationId)?.done ?? false;
}

/** Polish 3 §2: the writer's private ledger of a running split turn, for the shot director's
 * brief (clothes, wounds, items changed this turn). Server-side only; never streamed. */
export function keepLiveTurnLedger(operationId: string, ledger: string) {
  sweep();
  ledgers.set(operationId, { ledger, updated: Date.now() });
}

export function liveTurnLedger(operationId: string): string | null {
  return ledgers.get(operationId)?.ledger ?? null;
}
