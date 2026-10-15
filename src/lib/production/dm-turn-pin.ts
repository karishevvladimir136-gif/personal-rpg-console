import { randomUUID } from "node:crypto";
import type { ExecutionProfile, ModelSelection, RuntimePolicy } from "./contracts.ts";
import type { ProfileRpc } from "./profiles.ts";
import type { TimelineFence } from "../saves/contracts.ts";
import type { TurnStore } from "../gameplay/server-contracts.ts";
import {
  registryVersionFor,
  resolveExecutionProfile,
  validateExecutionProfile,
  validateModelSelection,
} from "../model-runtime/registry.ts";
import { DmError } from "../gameplay/dm-errors.ts";

// What the current (Stage 0) Astra turn actually sends: planning at high and
// the separate public narrator at medium (src/lib/server/dm/astra-primary-provider.ts).
export const ASTRA_TURN_SERVED: Readonly<Record<"dm.plan" | "dm.narrate", ModelSelection>> = Object.freeze({
  "dm.plan": { providerId: "openai", modelId: "gpt-6-astra", reasoning: "high" },
  "dm.narrate": { providerId: "openai", modelId: "gpt-6-astra", reasoning: "medium" },
});

export type AstraTurnPin = Record<"dm.turn" | "dm.plan" | "dm.narrate", ExecutionProfile>;

/** The campaign's chosen DM model for the turn ("dm.turn") plus the profiles
 * that serve it. Until the Stage 2 turn loop exists, every new turn is served
 * by the Astra runtime even when the campaign chose Claude Opus 5.5. */
export function astraTurnProfiles(policy: RuntimePolicy | null): AstraTurnPin {
  const requested = resolveExecutionProfile({ task: "dm.turn", profileId: randomUUID(),
    campaignPolicy: policy, globalDefault: null });
  const served = (task: "dm.plan" | "dm.narrate"): ExecutionProfile => ({
    ...validateModelSelection(ASTRA_TURN_SERVED[task]),
    schemaVersion: 1,
    id: randomUUID(),
    policyRevision: requested.policyRevision,
    registryVersion: registryVersionFor(task),
    task,
  });
  return { "dm.turn": requested, "dm.plan": served("dm.plan"), "dm.narrate": served("dm.narrate") };
}

/** Pins once per operation; later calls (retry, continue) return the first pin
 * even if the campaign setting changed in between. */
export async function pinAstraTurnModel(rpc: ProfileRpc, args: {
  ownerId: string; campaignId: string; operationId: string; timeline: TimelineFence;
}, readPolicy: () => Promise<RuntimePolicy | null>): Promise<AstraTurnPin> {
  const base = { p_owner_id: args.ownerId, p_campaign_id: args.campaignId,
    p_operation_id: args.operationId, p_timeline: args.timeline };
  const record = (value: unknown): Record<string, unknown> => {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new DmError("configuration");
    return value as Record<string, unknown>;
  };
  const read = await rpc({ ...base, p_profiles: null });
  if (read.error) throw new DmError("configuration");
  let values = record(read.data);
  if (Object.keys(values).length === 0) {
    const pinned = await rpc({ ...base, p_profiles: astraTurnProfiles(await readPolicy()) });
    if (pinned.error) throw new DmError("configuration");
    values = record(pinned.data);
  }
  return {
    "dm.turn": validateExecutionProfile(values["dm.turn"], "dm.turn"),
    "dm.plan": validateExecutionProfile(values["dm.plan"], "dm.plan"),
    "dm.narrate": validateExecutionProfile(values["dm.narrate"], "dm.narrate"),
  };
}

/** Pins the DM model right after a successful claim (the lease is live, no
 * model request has been made). A pin failure is logged and never fails the
 * turn: the Astra runtime does not depend on it. */
export function withAstraTurnPin(store: TurnStore, pin: (operationId: string) => Promise<unknown>): TurnStore {
  return {
    ...store,
    claim: async (campaignId, operationId) => {
      const claim = await store.claim(campaignId, operationId);
      if (claim) {
        try {
          await pin(operationId);
        } catch {
          console.info(JSON.stringify({ event: "dm_turn_model_pin_failed",
            operationId: /^[0-9a-f-]{36}$/i.test(operationId) ? operationId : null }));
        }
      }
      return claim;
    },
  };
}
