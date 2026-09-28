import "server-only";
import {
  planApplicableReward,
  planRewardIntegrityConfiguration,
} from "../progression/reward-integrity-authority";
import {
  planOwnerLootConfiguration,
  ownerLootView,
} from "../adventure-loot/owner-planning";
import { authorizeCampaign } from "./campaign-authorization";
import { createSaveStore } from "./saves/store";
import { worldRpc } from "./production-configuration";
import { createLibraryStore } from "./world-library/store";
import { PersistenceError } from "./errors";
import {
  assertLoopCommand,
  createLoopStore,
  parseLoopRequest,
  readFoundationLoop,
  LoopError,
} from "../foundation-loop/authority";
import { foundationLoopProjection } from "../foundation-loop/projection";
import { planCommerceConfiguration } from "../foundation-loop/configuration";
import {
  createTradeQuote,
  executeTradeQuote,
  parseTradeQuote,
  parseTradeIntent,
} from "../commerce";
import {
  planAdvancement,
  planProgressionCorrection,
  planProgressionDefinitions,
  type RewardClaim,
  type AdvancementChoice,
  type ProgressionCorrection,
  type ProgressionDefinitions,
} from "../progression";
import type { LoopContext, LoopPlan } from "../foundation-loop/contracts";
import {
  buildPreparationDraft,
  planPreparation,
} from "../playable-world/preparation";
import { object, uuid } from "../world-library/validation";

async function contextFor(campaignId: string) {
  const { user } = await authorizeCampaign(campaignId);
  const timeline = await createSaveStore(user.id).fence(campaignId);
  const rpc = worldRpc(user.id);
  const context = await readFoundationLoop(rpc, user.id, campaignId, timeline);
  return { user, rpc, context };
}
export async function readAdventureLoot(campaignId: string) {
  return ownerLootView((await contextFor(campaignId)).context);
}
export async function readFoundationCampaign(campaignId: string) {
  return foundationLoopProjection((await contextFor(campaignId)).context);
}
async function preparationSource(context: LoopContext, bindingId: string) {
  const binding = context.foundation.bindings.find((b) => b.id === bindingId);
  const player = context.snapshot.entities.find((e) => e.kind === "player");
  if (!binding || !player) throw new LoopError();
  const library = createLibraryStore(context.foundation.ownerId);
  const pack = await library.get("pack", binding.packVersionId);
  const sources = await Promise.all(
    binding.sourceVersionIds.map((id) => library.get("source", id)),
  );
  return {
    binding,
    pack,
    sources,
    characterEntityId: player.id,
    worldMinutes: context.foundation.worldMinutes,
    language: context.snapshot.campaign.language,
  };
}
export async function readPreparation(campaignId: string, bindingId: string) {
  uuid(bindingId);
  const { context } = await contextFor(campaignId);
  return {
    draft: buildPreparationDraft(
      await preparationSource(context, bindingId),
      context,
    ),
    command: foundationLoopProjection(context).command,
  };
}

export async function writeFoundationCampaign(
  campaignId: string,
  raw: unknown,
) {
  try {
    const request = parseLoopRequest(raw);
    if (request.command.campaignId !== campaignId) throw new LoopError();
    const { user } = await authorizeCampaign(campaignId);
    const rpc = worldRpc(user.id),
      store = createLoopStore(rpc, user.id, campaignId);
    if (request.kind !== "quote" && (await store.receipt(request)))
      return readFoundationCampaign(campaignId);
    const context = await readFoundationLoop(
      rpc,
      user.id,
      campaignId,
      request.command.timeline,
    );
    const command = assertLoopCommand(context, request.command);
    if (request.kind === "quote")
      return createTradeQuote(
        context,
        command,
        parseTradeIntent(request.input),
      );
    let plan: LoopPlan;
    switch (request.kind) {
      case "trade": {
        const quote = parseTradeQuote(request.input);
        if (JSON.stringify(quote.command) !== JSON.stringify(command)) {
          // JSON object order is not authority; compare each pinned field.
          assertLoopCommand(context, quote.command);
          if (quote.command.operationId !== command.operationId)
            throw new LoopError("conflict");
        }
        plan = executeTradeQuote(context, quote);
        break;
      }
      case "loot.configure":
        plan = planOwnerLootConfiguration(
          context,
          command,
          request.input,
          user.id,
        );
        break;
      case "commerce.configure":
        plan = planCommerceConfiguration(context, command, request.input);
        break;
      case "progression.configure": {
        const input = request.input as ProgressionDefinitions;
        const publicIds = new Set(
          foundationLoopProjection(context).owner.rewards.map((r) => r.id),
        );
        const hidden = context.state.rewards.filter(
          (r) => !publicIds.has(r.id),
        );
        if (
          !input ||
          !Array.isArray(input.rewards) ||
          input.rewards.some((r) => hidden.some((h) => h.id === r.id))
        )
          throw new LoopError();
        plan = planProgressionDefinitions(context, command, {
          ...input,
          rewards: [...input.rewards, ...hidden],
        });
        break;
      }
      case "progression.correct":
        plan = planProgressionCorrection(
          context,
          command,
          request.input as ProgressionCorrection,
        );
        break;
      case "reward.integrity.configure":
        plan = planRewardIntegrityConfiguration(
          context,
          command,
          request.input,
          new Set(
            foundationLoopProjection(context).owner.rewards.map((r) => r.id),
          ),
        );
        break;
      case "reward":
        plan = planApplicableReward(
          context,
          command,
          request.input as RewardClaim,
        );
        break;
      case "advancement":
        plan = planAdvancement(
          context,
          command,
          request.input as AdvancementChoice,
        );
        break;
      case "prepare": {
        const input = object(request.input, ["bindingId", "draft"]);
        const prepared = planPreparation(
          context,
          await preparationSource(context, uuid(input.bindingId)),
          input.draft,
        );
        const { storageCreates, ...base } = prepared;
        plan = {
          ...base,
          changes: [
            ...base.changes,
            ...storageCreates.map((s) => ({
              family: "storages" as const,
              ...s,
            })),
          ],
        };
        break;
      }
      default:
        throw new LoopError();
    }
    await store.commit(request, plan);
    return readFoundationCampaign(campaignId);
  } catch (error) {
    if (error instanceof PersistenceError) throw error;
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "validation";
    throw new PersistenceError(
      ["conflict", "stale_progression"].includes(code)
        ? "conflict"
        : code === "unavailable"
          ? "unavailable"
          : "validation",
    );
  }
}
