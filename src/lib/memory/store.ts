import type { MemoryStore } from "./server-contracts.ts";
import { DmError } from "../gameplay/dm-errors.ts";
import type { TimelineFence } from "../saves/contracts.ts";
import { sameTimeline, validTimeline } from "./timeline.ts";

export type MemoryRpc = (args: {
  p_owner_id: string;
  p_campaign_id: string;
  p_action: string;
  p_payload: unknown;
  p_timeline?: TimelineFence | null;
}) => Promise<{
  data: unknown;
  error?: { message?: string; code?: string } | null;
}>;

export function createRpcMemoryStore(
  ownerId: string,
  execute: MemoryRpc,
  timeline?: TimelineFence,
): MemoryStore {
  const boundTimelines = new Map<string, TimelineFence>();
  if (timeline !== undefined && !validTimeline(timeline))
    throw new DmError("validation");
  async function rpc<T>(
    campaignId: string,
    action: string,
    payload: unknown = {},
  ): Promise<T> {
    let boundTimeline = boundTimelines.get(campaignId) ?? timeline;
    const body = payload as Record<string, unknown>;
    const { timeline: requestedTimeline, ...legacyPayload } = body;
    if (requestedTimeline !== undefined && !validTimeline(requestedTimeline))
      throw new DmError("validation");
    if (requestedTimeline !== undefined) {
      if (boundTimeline && !sameTimeline(boundTimeline, requestedTimeline))
        throw new DmError("conflict");
      boundTimeline ??= requestedTimeline;
      boundTimelines.set(campaignId, boundTimeline);
    }
    let response: Awaited<ReturnType<MemoryRpc>>;
    try {
      response = await execute({
        p_owner_id: ownerId,
        p_campaign_id: campaignId,
        p_action: action,
        p_payload: legacyPayload,
        p_timeline: boundTimeline ?? null,
      });
    } catch (error) {
      if (error instanceof DmError) throw error;
      throw new DmError("unavailable", true);
    }
    if (response.error) {
      const message = response.error.message ?? "";
      if (message.includes("rpg_memory_paused"))
        throw new DmError("unavailable", true);
      if (message.includes("rpg_conflict")) throw new DmError("conflict");
      if (message.includes("rpg_context")) throw new DmError("context", true);
      if (
        message.includes("rpg_validation") ||
        response.error.code?.startsWith("22") ||
        response.error.code?.startsWith("23")
      )
        throw new DmError("validation");
      throw new DmError(
        "unavailable",
        !message.includes("rpg_forbidden") &&
          !message.includes("rpg_not_found"),
      );
    }
    if (response.data && typeof response.data === "object") {
      const data = response.data as {
        timeline?: TimelineFence;
        runtime?: { timeline?: TimelineFence };
      };
      const received = data.timeline ?? data.runtime?.timeline;
      if (received !== undefined) {
        if (
          !validTimeline(received) ||
          (boundTimeline && !sameTimeline(boundTimeline, received))
        )
          throw new DmError("conflict");
        // Bind once. A later callback may never migrate itself to a new branch.
        boundTimeline ??= received;
        boundTimelines.set(campaignId, boundTimeline);
      } else if (boundTimeline) {
        throw new DmError("context");
      }
    }
    return response.data as T;
  }
  return {
    source: (id, mode) => rpc(id, "source", { mode }),
    read: (id) => rpc(id, "read"),
    end: (input) => rpc(input.campaignId, "end", input),
    continueSession: (input) => rpc(input.campaignId, "continue", input),
    retry: (input) => rpc(input.campaignId, "retry", input),
    enqueue: (id, reason) => rpc(id, "enqueue", { reason }),
    claim: (id) => rpc(id, "claim"),
    publish: (job, summary) =>
      rpc(job.campaignId, "publish", {
        timeline: job.timeline,
        jobId: job.id,
        token: job.token,
        summary,
      }),
    fail: (job, category) =>
      rpc(job.campaignId, "fail", {
        timeline: job.timeline,
        jobId: job.id,
        token: job.token,
        category,
      }),
    context: (id, actorIds, includePrivate) =>
      rpc(id, "context", { actorIds, includePrivate }),
    search: (request) => rpc(request.campaignId, "search", request),
  };
}
