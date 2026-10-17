// Client view of a running dm-loop-v1 turn: provisional narration and the
// accepted changes, read from the server-sent event stream. The text is
// provisional until the turn is committed; on failure the client discards it.
import type { DmLoopLiveEvent } from "./dm-loop/contracts.ts";

export type LiveTurnView = {
  operationId: string;
  text: string;
  /** The player's lines (campaign language) of the accepted calls the hero would notice. */
  changes: { name: string; ok: boolean; summary: string; action?: string }[];
  /** finish_turn handed the decisive description to the player (server-checked, polish). */
  moment?: { reason: string | null } | null;
  status: "generating" | "awaiting_confirmation" | "committed" | "failed" | "cancelled" | null;
};

export const emptyLiveTurn = (operationId: string): LiveTurnView => ({ operationId, text: "", changes: [], moment: null, status: null });

export function applyLiveEvent(view: LiveTurnView, event: DmLoopLiveEvent): LiveTurnView {
  if (event.type === "text") return { ...view, text: view.text + event.text };
  if (event.type === "tool") return { ...view, changes: [...view.changes, { name: event.name, ok: event.ok, summary: event.summary, ...(event.action ? { action: event.action } : {}) }] };
  if (event.type === "moment") return { ...view, moment: { reason: event.reason } };
  return { ...view, status: event.status };
}

export function parseLiveEvent(data: string): DmLoopLiveEvent | null {
  try {
    const value = JSON.parse(data) as DmLoopLiveEvent;
    return value && typeof value === "object" && typeof value.type === "string" ? value : null;
  } catch {
    return null;
  }
}

/** Opens the event stream of a turn; returns a function that closes it. */
export function followLiveTurn(campaignId: string, operationId: string, onView: (view: LiveTurnView) => void): () => void {
  if (typeof EventSource === "undefined") return () => {};
  let view = emptyLiveTurn(operationId);
  const source = new EventSource(`/api/campaigns/${encodeURIComponent(campaignId)}/turns/${encodeURIComponent(operationId)}/stream`);
  source.onmessage = (message) => {
    const event = parseLiveEvent(String(message.data));
    if (!event) return;
    view = applyLiveEvent(view, event);
    onView(view);
    if (event.type === "status" && event.status !== "generating") source.close();
  };
  source.onerror = () => { source.close(); };
  return () => source.close();
}
