import { isDeepStrictEqual } from "node:util";
import type {
  LoopContext,
  MerchantDefinition,
} from "../foundation-loop/contracts.ts";
import type {
  CommittedWorldEvent,
  RulesetProfileRef,
} from "../production/contracts.ts";
import type { TimelineFence } from "../saves/contracts.ts";
import { sameTimeline } from "../saves/fence.ts";
import { integer, object, requireCommerce, uuid } from "./validation.ts";

export const HAGGLE_EVENT_KIND = "commerce.haggle_granted";
export const TRADE_EVENT_KIND = "commerce.trade";

// Emitted only by the existing validated Game action settlement. It conveys
// semantic eligibility; the profile's merchant definition supplies the amount.
export type HaggleGrantPayload = {
  schemaVersion: 1;
  merchantActorId: string;
  playerEntityId: string;
  profile: RulesetProfileRef;
  stateVersion: number;
  merchantVersion: number;
  timeline: TimelineFence;
  worldMinutes: number;
};

/** Finds a current single-use, already committed semantic grant. Never infer a
 * grant from narrative text, an uncommitted proposal, or client intent. */
export function findHaggleGrant(
  context: LoopContext,
  merchant: MerchantDefinition,
  playerEntityId: string,
): CommittedWorldEvent | null {
  const candidates = context.events
    .filter((event) => {
      if (
        event.schemaVersion !== 1 ||
        event.kind !== HAGGLE_EVENT_KIND ||
        event.visibility !== "public" ||
        event.campaignId !== context.foundation.campaignId ||
        event.originTimelineId !== context.foundation.timeline.timelineId ||
        !event.actorIds.includes(merchant.actorId) ||
        !event.actorIds.includes(playerEntityId) ||
        event.worldMinutes !== context.foundation.worldMinutes
      )
        return false;
      try {
        uuid(event.id);
        uuid(event.operationId);
        integer(event.sequence, 1);
        const p = object(event.payload, [
          "schemaVersion",
          "merchantActorId",
          "playerEntityId",
          "profile",
          "stateVersion",
          "merchantVersion",
          "timeline",
          "worldMinutes",
        ]);
        const timeline = object(p.timeline, ["timelineId", "epoch"]);
        requireCommerce(
          p.schemaVersion === 1 &&
            p.merchantActorId === merchant.actorId &&
            p.playerEntityId === playerEntityId &&
            p.stateVersion === context.state.version &&
            p.merchantVersion === merchant.version &&
            p.worldMinutes === context.foundation.worldMinutes &&
            isDeepStrictEqual(p.profile, context.state.profile) &&
            sameTimeline(
              timeline as TimelineFence,
              context.foundation.timeline,
            ),
        );
        return true;
      } catch {
        return false;
      }
    })
    .sort((a, b) => b.sequence - a.sequence || a.id.localeCompare(b.id));
  return (
    candidates.find(
      (grant) =>
        !context.events.some(
          (event) =>
            event.kind === TRADE_EVENT_KIND &&
            (event.payload.haggleEventId === grant.id ||
              (event.sequence > grant.sequence &&
                event.payload.playerEntityId === playerEntityId &&
                event.payload.merchantActorId === merchant.actorId)),
        ),
    ) ?? null
  );
}
