import { randomUUID } from "node:crypto";
import type { ExecutionProfile, ModelSelection, RuntimePolicy } from "./contracts.ts";
import type { ProfileRpc } from "./profiles.ts";
import type { TimelineFence } from "../saves/contracts.ts";
import { resolveExecutionProfile, validateExecutionProfile } from "../model-runtime/registry.ts";
import { dmModelSpec, type DmEffort } from "../model-runtime/dm-models.ts";
import { DmError } from "../gameplay/dm-errors.ts";
import type { DmLoopPin } from "../gameplay/dm-loop/contracts.ts";

/** The campaign's DM model for a dm-loop-v1 turn: the DM settings choice first,
 * then the Stage 1 "dm.turn" override of the runtime policy, then the default. */
export function dmLoopProfile(policy: RuntimePolicy | null, dmTurn: ModelSelection | null): ExecutionProfile {
  const campaignPolicy: RuntimePolicy | null = dmTurn
    ? { schemaVersion: 1, revision: (policy?.revision ?? 0) + 1, primary: policy?.primary ?? null,
        taskOverrides: { ...policy?.taskOverrides, "dm.turn": dmTurn } }
    : policy;
  return resolveExecutionProfile({ task: "dm.turn", profileId: randomUUID(), campaignPolicy, globalDefault: null });
}

export function dmLoopPinFromProfile(profile: ExecutionProfile): Pick<DmLoopPin, "providerId" | "modelId" | "effort"> {
  const spec = dmModelSpec(profile.providerId, profile.modelId);
  if (!spec || !profile.reasoning || !spec.reasoning.includes(profile.reasoning)) throw new DmError("configuration");
  return { providerId: spec.providerId, modelId: spec.modelId, effort: profile.reasoning as DmEffort };
}

/** Pins once per operation through rpg_execution_profile (read-first). */
export async function pinDmLoopModel(rpc: ProfileRpc, args: {
  ownerId: string; campaignId: string; operationId: string; timeline: TimelineFence;
}, read: () => Promise<{ policy: RuntimePolicy | null; dmTurn: ModelSelection | null }>): Promise<ExecutionProfile> {
  const base = { p_owner_id: args.ownerId, p_campaign_id: args.campaignId, p_operation_id: args.operationId, p_timeline: args.timeline };
  const record = (value: unknown): Record<string, unknown> => {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new DmError("configuration");
    return value as Record<string, unknown>;
  };
  const existing = await rpc({ ...base, p_profiles: null });
  if (existing.error) throw new DmError("configuration");
  let values = record(existing.data);
  if (Object.keys(values).length === 0) {
    const selection = await read();
    const pinned = await rpc({ ...base, p_profiles: { "dm.turn": dmLoopProfile(selection.policy, selection.dmTurn) } });
    if (pinned.error) throw new DmError("configuration");
    values = record(pinned.data);
  }
  return validateExecutionProfile(values["dm.turn"], "dm.turn");
}
