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
import { applicationGameplayTaskSelection } from "./task-defaults.ts";

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
  options: { allowLegacyDmProfiles?: boolean } = {},
) {
  return async (
    operationId: string,
    tasks: RuntimeTask[],
    token?: string,
  ): Promise<Partial<Record<RuntimeTask, ExecutionProfile>>> => {
    const worldLogicGame =
      tasks.length === 2 &&
      tasks.includes("world.resolve") &&
      tasks.includes("dm.narrate");
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
            globalDefault: worldLogicGame
              ? applicationGameplayTaskSelection(task, globalDefault)
              : globalDefault,
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
    const legacyDm =
      options.allowLegacyDmProfiles &&
      tasks.length === 3 &&
      tasks.includes("world.resolve") &&
      tasks.includes("dm.plan") &&
      tasks.includes("dm.narrate") &&
      Object.keys(values).length === 2 &&
      Object.hasOwn(values, "dm.plan") &&
      Object.hasOwn(values, "dm.narrate");
    const requiredTasks = legacyDm
      ? tasks.filter((task) => task !== "world.resolve")
      : tasks;
    if (
      Object.keys(values).length !== requiredTasks.length ||
      Object.keys(values).some(
        (task) => !requiredTasks.includes(task as RuntimeTask),
      )
    )
      throw new DmError("configuration");
    return Object.fromEntries(
      requiredTasks.map((task) => [
        task,
        validateExecutionProfile(values[task], task),
      ]),
    );
  };
}
