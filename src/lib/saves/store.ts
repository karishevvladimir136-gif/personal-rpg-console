import type { SaveStore } from "./server-contracts.ts";
import { DmError } from "../gameplay/dm-errors.ts";

export type SaveRpc = (args: {
  p_owner_id: string;
  p_campaign_id: string;
  p_action: string;
  p_payload: unknown;
}) => Promise<{
  data: unknown;
  error?: { message?: string; code?: string } | null;
}>;

export function createRpcSaveStore(
  ownerId: string,
  execute: SaveRpc,
): SaveStore {
  async function rpc<T>(
    campaignId: string,
    action: string,
    payload: unknown = {},
  ): Promise<T> {
    try {
      const result = await execute({
        p_owner_id: ownerId,
        p_campaign_id: campaignId,
        p_action: action,
        p_payload: payload,
      });
      if (result.error) {
        if (result.error.message?.includes("rpg_conflict"))
          throw new DmError("conflict");
        if (
          result.error.message?.includes("rpg_validation") ||
          result.error.code?.startsWith("22") ||
          result.error.code?.startsWith("23")
        )
          throw new DmError("validation");
        throw new DmError(
          "unavailable",
          !result.error.message?.includes("rpg_forbidden"),
        );
      }
      return result.data as T;
    } catch (error) {
      if (error instanceof DmError) throw error;
      throw new DmError("unavailable", true);
    }
  }
  return {
    read: (id) => rpc(id, "read"),
    fence: (id) => rpc(id, "fence"),
    campaign: (id) => rpc(id, "campaign"),
    create: (input) => rpc(input.campaignId, "create", input),
    load: (input) => rpc(input.campaignId, "load", input),
    switchTimeline: (input) => rpc(input.campaignId, "switch", input),
    policy: (input) => rpc(input.campaignId, "policy", input),
  };
}
