import type {
  AdventureCommand,
  AdventureRpc,
  WorldCommand,
} from "./contracts.ts";
import { AdventureServiceError } from "./contracts.ts";
import {
  adventureTimeline,
  parseAdventureCatalog,
  parseAdventureCommand,
  parseWorldCatalog,
  parseWorldCommand,
} from "./validation.ts";
import {
  readAdventureResult,
  readNewHeroResult,
  readWorldResult,
} from "./client.ts";
import { uuid } from "../foundation-loop/fields.ts";
import type { TimelineFence } from "../saves/contracts.ts";

// The adapter validates scopes/DTOs; SQL remains the sole lifecycle, snapshot,
// immutable version and receipt authority. No local reconstruction of state.
export function createAdventureService(ownerId: string, execute: AdventureRpc) {
  uuid(ownerId);
  async function rpc(
    campaignId: string | null,
    action: Parameters<AdventureRpc>[0]["p_action"],
    payload: unknown,
    timeline: TimelineFence | null,
  ) {
    if (campaignId !== null) uuid(campaignId);
    let result: Awaited<ReturnType<AdventureRpc>>;
    try {
      result = await execute({
        p_owner_id: ownerId,
        p_campaign_id: campaignId,
        p_action: action,
        p_payload: payload,
        p_timeline: timeline,
      });
    } catch {
      throw new AdventureServiceError("unavailable");
    }
    if (result.error) {
      const message = result.error.message ?? "";
      throw new AdventureServiceError(
        message.includes("rpg_conflict")
          ? "conflict"
          : message.includes("rpg_not_found")
            ? "not_found"
            : message.includes("rpg_forbidden") || result.error.code === "42501"
              ? "scope"
              : message.includes("rpg_validation") ||
                  result.error.code?.startsWith("22") ||
                  result.error.code?.startsWith("23")
                ? "validation"
                : "unavailable",
      );
    }
    return result.data;
  }
  return {
    async worlds() {
      return parseWorldCatalog(await rpc(null, "worlds", {}, null));
    },
    async read(campaignId: string, value: TimelineFence) {
      const timeline = adventureTimeline(value);
      return parseAdventureCatalog(
        await rpc(campaignId, "read", { timeline }, timeline),
        campaignId,
      );
    },
    async perform(value: AdventureCommand) {
      const command = parseAdventureCommand(value);
      const receipt = readAdventureResult(
        await rpc(
          command.input.campaignId,
          command.action,
          command.input,
          command.input.timeline,
        ),
        command,
      );
      try {
        const snapshot = parseAdventureCatalog(
          await rpc(
            command.input.campaignId,
            "read",
            { timeline: command.input.timeline },
            command.input.timeline,
          ),
          command.input.campaignId,
        );
        return { requestId: receipt.requestId, snapshot };
      } catch {
        // A committed receipt plus a failed refresh is not a rejected write.
        // Preserve exact recovery rather than inviting a replacement command.
        throw new AdventureServiceError("unavailable");
      }
    },
    async performWorld(value: WorldCommand) {
      const command = parseWorldCommand(value),
        result = await rpc(null, command.action, command.input, null);
      return command.action === "world_create"
        ? readWorldResult(result, command)
        : readNewHeroResult(result, command);
    },
  };
}
