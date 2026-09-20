import { randomUUID } from "node:crypto";
import type {
  ExecutionProfile,
  FoundationRpc,
  ModelSelection,
  RuntimeTask,
} from "./contracts.ts";
import type { TimelineFence } from "../saves/contracts.ts";
import { readWorldFoundation } from "../server/world/store.ts";
import {
  resolveExecutionProfile,
  validateExecutionProfile,
} from "../model-runtime/registry.ts";
import { DmError } from "../gameplay/dm-errors.ts";

export type ProfileRpc = (args: {
  p_owner_id: string;
  p_campaign_id: string;
  p_operation_id: string;
  p_profiles: unknown;
  p_timeline: TimelineFence;
  p_token?: string;
}) => Promise<{ data: unknown; error?: unknown }>;
export function persistentProfileResolver(
  ownerId: string,
  campaignId: string,
  timeline: TimelineFence,
  world: FoundationRpc,
  profiles: ProfileRpc,
  globalDefault: ModelSelection,
) {
  return async (
    operationId: string,
    tasks: RuntimeTask[],
    token?: string,
  ): Promise<Partial<Record<RuntimeTask, ExecutionProfile>>> => {
    const args = {
      p_owner_id: ownerId,
      p_campaign_id: campaignId,
      p_operation_id: operationId,
      p_timeline: timeline,
      ...(token ? { p_token: token } : {}),
    };
    const read = await profiles({ ...args, p_profiles: null });
    if (
      read.error ||
      !read.data ||
      typeof read.data !== "object" ||
      Array.isArray(read.data)
    )
      throw new DmError("configuration");
    let values = read.data as Record<string, unknown>;
    if (Object.keys(values).length === 0) {
      const foundation = await readWorldFoundation(
        world,
        ownerId,
        campaignId,
        timeline,
      );
      const selected = Object.fromEntries(
        tasks.map((task) => [
          task,
          resolveExecutionProfile({
            task,
            profileId: randomUUID(),
            campaignPolicy: foundation.executionPolicy,
            globalDefault,
          }),
        ]),
      );
      const pinned = await profiles({ ...args, p_profiles: selected });
      if (
        pinned.error ||
        !pinned.data ||
        typeof pinned.data !== "object" ||
        Array.isArray(pinned.data)
      )
        throw new DmError("configuration");
      values = pinned.data as Record<string, unknown>;
    }
    if (
      Object.keys(values).length !== tasks.length ||
      Object.keys(values).some((task) => !tasks.includes(task as RuntimeTask))
    )
      throw new DmError("configuration");
    return Object.fromEntries(
      tasks.map((task) => [task, validateExecutionProfile(values[task], task)]),
    );
  };
}
