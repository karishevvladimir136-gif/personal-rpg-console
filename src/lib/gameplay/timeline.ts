import type { TimelineFence } from "../saves/contracts.ts";
import { isTimelineFence, sameTimeline } from "../saves/fence.ts";
import type { PublicTurn } from "./contracts.ts";
import type { RuntimeSource, TurnClaim } from "./server-contracts.ts";
import { TurnError } from "./turn-errors.ts";

export function requireTurnTimeline(
  turn: PublicTurn,
  campaignId: string,
  operationId: string,
  expected?: TimelineFence,
) {
  if (
    !turn ||
    turn.campaign_id !== campaignId ||
    turn.id !== operationId ||
    (expected &&
      (!isTimelineFence(turn.timeline) ||
        !sameTimeline(expected, turn.timeline)))
  )
    throw new TurnError("conflict");
  return turn;
}

export function requireSourceTimeline(
  source: RuntimeSource,
  expected?: TimelineFence,
) {
  const fences = [source.runtime.timeline, source.snapshot.timeline];
  if (!expected && fences.every((fence) => fence === undefined)) return;
  const current = expected ?? source.runtime.timeline;
  if (
    !isTimelineFence(current) ||
    fences.some(
      (fence) => !isTimelineFence(fence) || !sameTimeline(current, fence),
    )
  )
    throw new TurnError("conflict");
  // Direct legacy runtime callers are permitted only on the never-activated root.
  if (!expected && current.epoch !== 1) throw new TurnError("conflict");
  for (const turn of source.runtime.turns)
    requireTurnTimeline(turn, source.runtime.campaignId, turn.id, current);
}

export function requireClaimTimeline(
  claim: TurnClaim,
  campaignId: string,
  operationId: string,
  expected?: TimelineFence,
) {
  const { lease, turn, source } = claim;
  if (
    lease.campaignId !== campaignId ||
    lease.operationId !== operationId ||
    turn.input.campaignId !== campaignId ||
    turn.input.operationId !== operationId ||
    source.snapshot.campaign.id !== campaignId ||
    source.runtime.campaignId !== campaignId
  )
    throw new TurnError("conflict");
  requireSourceTimeline(source, expected);
  const fences = [
    expected,
    lease.timeline,
    turn.input.timeline,
    turn.public.timeline,
    source.runtime.timeline,
  ];
  if (fences.every((fence) => fence === undefined)) return;
  const current = expected ?? source.runtime.timeline;
  if (
    !isTimelineFence(current) ||
    [lease.timeline, turn.input.timeline, turn.public.timeline].some(
      (fence) => !isTimelineFence(fence) || !sameTimeline(current, fence),
    )
  )
    throw new TurnError("conflict");
  requireTurnTimeline(turn.public, campaignId, operationId, current);
}
