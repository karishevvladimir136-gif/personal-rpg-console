// The attention ledger (plan §10.4): per companion and per open journal entry,
// how many sessions have passed since it was last in focus, from finish_turn's
// spotlight and thread references. A private fact "ledger" carries it across
// the bounded turn window; it changes only at a session boundary, so the
// dossier layer that shows it stays cacheable within a session.
import type { JsonObject } from "../contracts.ts";

export type AttentionLedger = {
  /** Ordinal of the session the ledger was last advanced in. */
  session: number;
  /** Session ID the ordinal belongs to (a new ID means a new session). */
  sessionId: string | null;
  /** Companion entity ID → sessions since last in focus. */
  companions: Record<string, number>;
  /** Journal entry ID → sessions since last touched. */
  threads: Record<string, number>;
  /** Entity and thread IDs seen in focus during the current session. */
  seenThisSession: string[];
};

export const EMPTY_LEDGER: AttentionLedger = { session: 1, sessionId: null, companions: {}, threads: {}, seenThisSession: [] };

export function parseLedger(privateState: JsonObject): AttentionLedger {
  const facts = privateState.fact;
  const raw = facts && typeof facts === "object" && !Array.isArray(facts) ? facts.ledger : undefined;
  if (typeof raw !== "string") return structuredClone(EMPTY_LEDGER);
  try {
    const value = JSON.parse(raw) as Partial<AttentionLedger>;
    const map = (input: unknown) => Object.fromEntries(Object.entries((input ?? {}) as Record<string, unknown>)
      .filter(([, n]) => Number.isInteger(n) && (n as number) >= 0).map(([k, n]) => [k, n as number]));
    return { session: Number.isInteger(value.session) && (value.session as number) > 0 ? value.session as number : 1,
      sessionId: typeof value.sessionId === "string" ? value.sessionId : null,
      companions: map(value.companions), threads: map(value.threads),
      seenThisSession: Array.isArray(value.seenThisSession) ? value.seenThisSession.filter((id): id is string => typeof id === "string") : [] };
  } catch { return structuredClone(EMPTY_LEDGER); }
}

/** The ledger after a committed turn: a new session advances every counter by
 * one, except what was in focus during the session just closed; the turn's
 * own spotlight and threads reset to zero. */
export function advanceLedger(ledger: AttentionLedger, turn: {
  sessionId: string | null; companionIds: string[]; openThreadIds: string[]; spotlight: string[]; threads: string[];
}): AttentionLedger {
  const next: AttentionLedger = structuredClone(ledger);
  if (turn.sessionId && next.sessionId && turn.sessionId !== next.sessionId) {
    next.session += 1;
    const seen = new Set(next.seenThisSession);
    for (const id of Object.keys(next.companions)) if (!seen.has(id)) next.companions[id] += 1;
    for (const id of Object.keys(next.threads)) if (!seen.has(id)) next.threads[id] += 1;
    next.seenThisSession = [];
  }
  if (turn.sessionId) next.sessionId = turn.sessionId;
  for (const id of turn.companionIds) if (!(id in next.companions)) next.companions[id] = 0;
  for (const id of turn.openThreadIds) if (!(id in next.threads)) next.threads[id] = 0;
  for (const id of Object.keys(next.companions)) if (!turn.companionIds.includes(id)) delete next.companions[id];
  for (const id of Object.keys(next.threads)) if (!turn.openThreadIds.includes(id)) delete next.threads[id];
  const seen = new Set(next.seenThisSession);
  for (const id of turn.spotlight) if (id in next.companions) { next.companions[id] = 0; seen.add(id); }
  for (const id of turn.threads) if (id in next.threads) { next.threads[id] = 0; seen.add(id); }
  next.seenThisSession = [...seen].slice(-200);
  return next;
}

export const serializeLedger = (ledger: AttentionLedger) => JSON.stringify(ledger);
