// The streamed turn as the Stage 5 game screen shows it. The stream carries the
// narration text, one public-safe summary per tool receipt and the turn status.
import type { LiveTurnView } from "../gameplay/live-turn-client.ts";
import type { PublicTurn } from "../gameplay/contracts.ts";

export type LivePhase = "streaming" | "saved" | "discarded";

/** Accepted changes for «Что изменилось за ход»: rejected calls and the closing
 * finish_turn bookkeeping are not changes of the world. */
export function liveChanges(view: LiveTurnView) {
  return view.changes.filter((change) => change.ok && change.name !== "finish_turn");
}

/** The server-checked moment event of the stream (polish); the receipt
 * summary of older streams is still understood. */
export function livePlayerMoment(view: LiveTurnView) {
  return !!view.moment || view.changes.some((change) => change.name === "finish_turn" && change.ok && /^your moment\b/i.test(change.summary));
}

export function liveTurnPhase(view: LiveTurnView, turns: Pick<PublicTurn, "id" | "status">[]): LivePhase {
  const turn = turns.find((row) => row.id === view.operationId);
  if (turn?.status === "committed") return "saved";
  if (turn?.status === "failed" || turn?.status === "cancelled" || view.status === "failed" || view.status === "cancelled") return "discarded";
  return "streaming";
}
