import type { TurnStore } from "./server-contracts.ts";
import { DmError } from "./dm-errors.ts";
import type { TimelineFence } from "../saves/contracts.ts";
import { isTimelineFence, sameTimeline } from "../saves/fence.ts";

export type RuntimeRpc = (args: {
  p_owner_id: string;
  p_campaign_id: string;
  p_action: string;
  p_payload: unknown;
  p_timeline?: TimelineFence;
}) => Promise<{
  data: unknown;
  error?: { message?: string; code?: string } | null;
}>;
export function createRpcTurnStore(
  ownerId: string,
  execute: RuntimeRpc,
  model: string | null = null,
  timeline?: TimelineFence,
  astraDiagnostics = false,
  options?: { astraResponseContract: "unified-v1" },
): TurnStore {
  const projectPlay = (play: Awaited<ReturnType<TurnStore["readPlay"]>>) => ({
    ...play,
    model,
    configured: model !== null,
  });
  async function rpc<T>(
    campaignId: string,
    action: string,
    payload: unknown = {},
  ): Promise<T> {
    const body =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : {};
    const { timeline: payloadTimeline, ...legacyPayload } = body;
    if (
      payloadTimeline !== undefined &&
      (!isTimelineFence(payloadTimeline) ||
        (timeline && !sameTimeline(timeline, payloadTimeline)))
    )
      throw new DmError("conflict");
    const fence =
      timeline ??
      (isTimelineFence(payloadTimeline) ? payloadTimeline : undefined);
    let response: Awaited<ReturnType<RuntimeRpc>>;
    try {
      response = await execute({
        p_owner_id: ownerId,
        p_campaign_id: campaignId,
        p_action: action,
        p_payload: legacyPayload,
        ...(fence ? { p_timeline: fence } : {}),
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
      if (
        message.includes("rpg_validation") ||
        response.error.code?.startsWith("22") ||
        response.error.code?.startsWith("23")
      )
        throw new DmError("validation");
      // Forbidden/not found remain neutral; never return the database payload.
      throw new DmError(
        "unavailable",
        !message.includes("rpg_forbidden") &&
          !message.includes("rpg_not_found"),
      );
    }
    return response.data as T;
  }
  return {
    advanceProgression: (campaignId, payload) =>
      rpc(campaignId, "astra_advancement", payload),
    takeoverStatus: (campaignId) => rpc(campaignId, "astra_takeover_status"),
    begin: (input, runtimeIdentity, responseContract) => rpc(input.campaignId, "begin",
      runtimeIdentity ? { ...input, serverRuntime: runtimeIdentity,
        ...(options && responseContract ? { serverAstraContract: responseContract } : {}) } : input),
    ...(options ? { astraResponseContract: (campaignId: string, operationId: string) =>
      rpc<"legacy-two-stage" | "unified-v1" | null>(campaignId, "astra_contract", { operationId }) } : {}),
    runtimeIdentity: (campaignId, operationId) =>
      rpc(campaignId, "astra_runtime", { operationId }),
    recordAstraTool: (lease, position, call, result) =>
      rpc(lease.campaignId, "astra_tool", { ...lease, position, call, result }),
    ...(astraDiagnostics ? { recordAstraStage: (lease: import("./server-contracts.ts").TurnLease,
      diagnostic: Parameters<NonNullable<TurnStore["recordAstraStage"]>>[1]) =>
      rpc<void>(lease.campaignId, "astra_diagnostic", { ...lease, diagnostic }) } : {}),
    readPlay: async (campaignId) => {
      const result = await rpc<Awaited<ReturnType<TurnStore["readPlay"]>>>(
        campaignId,
        "play",
      );
      return projectPlay(result);
    },
    getPublic: (campaignId, operationId) =>
      rpc(campaignId, "get", { operationId }),
    claim: async (campaignId, operationId) => {
      const result = await rpc<Awaited<ReturnType<TurnStore["claim"]>>>(
        campaignId,
        "claim",
        { operationId },
      );
      return result
        ? {
            ...result,
            source: {
              ...result.source,
              runtime: projectPlay(result.source.runtime),
            },
          }
        : null;
    },
    checkpoint: (lease, checkpoint, status) =>
      rpc(lease.campaignId, "checkpoint", { ...lease, checkpoint, status }),
    recordChecks: (lease, checks) =>
      rpc(lease.campaignId, "checks", { ...lease, checks }),
    reroll: (lease, command, check) =>
      rpc(lease.campaignId, "reroll", { ...lease, command, check }),
    commit: (lease, packet) =>
      rpc(lease.campaignId, "commit", { ...lease, packet }),
    fail: (lease, failure, retryable) =>
      rpc(lease.campaignId, "fail", { ...lease, failure, retryable }),
    cancel: (command) => rpc(command.campaignId, "cancel", command),
    configure: async (input) =>
      projectPlay(await rpc(input.campaignId, "configure", input)),
    approveGuidance: (input) => rpc(input.campaignId, "guidance", input),
  };
}
