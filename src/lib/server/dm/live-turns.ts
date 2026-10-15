import "server-only";
import type { DmLoopLiveEvent } from "../../gameplay/dm-loop/contracts.ts";

// In-process registry of running dm-loop-v1 turns for the player's live view:
// narration deltas and accepted changes, marked provisional until commit. A
// restart of the single local server simply ends the stream; the client then
// falls back to the committed turn. Nothing private is ever published here.
type LiveTurn = { events: DmLoopLiveEvent[]; listeners: Set<(event: DmLoopLiveEvent) => void>; done: boolean; updated: number };
const turns = new Map<string, LiveTurn>();
const RETENTION_MS = 10 * 60 * 1000;

function sweep() {
  const cutoff = Date.now() - RETENTION_MS;
  for (const [id, turn] of turns) if (turn.updated < cutoff) turns.delete(id);
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
  if (event.type === "status" && event.status !== "generating") turn.done = true;
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
