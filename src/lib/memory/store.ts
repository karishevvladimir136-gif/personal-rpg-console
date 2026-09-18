import type { MemoryStore } from "./server-contracts.ts";
import { DmError } from "../gameplay/dm-errors.ts";

export type MemoryRpc = (args: {
  p_owner_id: string;
  p_campaign_id: string;
  p_action: string;
  p_payload: unknown;
}) => Promise<{ data: unknown; error?: { message?: string; code?: string } | null }>;

export function createRpcMemoryStore(ownerId: string, execute: MemoryRpc): MemoryStore {
  async function rpc<T>(campaignId: string, action: string, payload: unknown = {}): Promise<T> {
    let response: Awaited<ReturnType<MemoryRpc>>;
    try {
      response = await execute({ p_owner_id: ownerId, p_campaign_id: campaignId, p_action: action, p_payload: payload });
    } catch (error) {
      if (error instanceof DmError) throw error;
      throw new DmError("unavailable", true);
    }
    if (response.error) {
      const message = response.error.message ?? "";
      if (message.includes("rpg_memory_paused")) throw new DmError("unavailable", true);
      if (message.includes("rpg_conflict")) throw new DmError("conflict");
      if (message.includes("rpg_context")) throw new DmError("context", true);
      if (message.includes("rpg_validation") || response.error.code?.startsWith("22") || response.error.code?.startsWith("23")) throw new DmError("validation");
      throw new DmError("unavailable", !message.includes("rpg_forbidden") && !message.includes("rpg_not_found"));
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
    publish: (job, summary) => rpc(job.campaignId, "publish", { jobId: job.id, token: job.token, summary }),
    fail: (job, category) => rpc(job.campaignId, "fail", { jobId: job.id, token: job.token, category }),
    context: (id, actorIds, includePrivate) => rpc(id, "context", { actorIds, includePrivate }),
    search: (request) => rpc(request.campaignId, "search", request),
  };
}
