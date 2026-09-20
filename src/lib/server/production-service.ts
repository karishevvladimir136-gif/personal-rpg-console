import { readWorldFoundation } from "./world/store";
import { resolveExecutionProfile } from "../model-runtime/registry";
import { randomUUID } from "node:crypto";
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { TimelineFence } from "../saves/contracts";
import type { FoundationRpc } from "../production/contracts";
import {
  persistentProfileResolver,
  type ProfileRpc,
} from "../production/profiles";
import { worldTurnPreparer } from "../production/turn-world";
import { DmError } from "../gameplay/dm-errors";
import { createDmProvider } from "./dm";
import { createSummaryProvider } from "./memory/provider";

// Call only after authorizeCampaign. RPC rechecks owner and activation fence.
export function productionServices(
  ownerId: string,
  campaignId: string,
  timeline: TimelineFence,
  suppliedClient?: SupabaseClient,
) {
  let client = suppliedClient;
  const database = () => {
    if (!client) {
      const url = process.env.SUPABASE_URL,
        key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key || process.env.RPG_OWNER_USER_ID !== ownerId)
        throw new DmError("configuration");
      client = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });
    }
    return client;
  };
  const world: FoundationRpc = async (args) =>
    await database().rpc("rpg_world", args);
  const profiles: ProfileRpc = async (args) =>
    await database().rpc("rpg_execution_profile", args);
  const globalDefault = {
    providerId: "openai",
    modelId: process.env.OPENAI_DM_MODEL ?? "",
    reasoning: process.env.OPENAI_DM_REASONING ?? null,
  };
  const resolve = persistentProfileResolver(
    ownerId,
    campaignId,
    timeline,
    world,
    profiles,
    globalDefault,
  );
  return {
    planModel: async () =>
      resolveExecutionProfile({
        task: "dm.plan",
        profileId: randomUUID(),
        campaignPolicy: (
          await readWorldFoundation(world, ownerId, campaignId, timeline)
        ).executionPolicy,
        globalDefault,
      }).modelId,
    validateFoundation: async (
      claim: import("../gameplay/server-contracts").TurnClaim,
    ) => {
      if (
        claim.turn.input.mode === "feedback" ||
        claim.turn.input.mode === "ooc"
      )
        return;
      const snapshot = await readWorldFoundation(
        world,
        ownerId,
        campaignId,
        timeline,
      );
      if (
        snapshot.ruleset.id !== "console-basic-v1" ||
        snapshot.ruleset.mode !== "full_ruleset" ||
        snapshot.ruleset.version !== 1 ||
        snapshot.ruleset.validatorVersion !== "console-basic-v1"
      )
        throw new DmError("configuration");
    },
    prepareWorld: worldTurnPreparer(world),
    provider: createDmProvider({
      resolveProfile: async (task, _source, input) => {
        const values = await resolve(
          input.operationId,
          input.mode === "feedback" || input.mode === "ooc"
            ? ["dm.feedback"]
            : ["dm.plan", "dm.narrate"],
        );
        const profile = values[task];
        if (!profile) throw new DmError("configuration");
        return profile;
      },
    }),
    summaries: createSummaryProvider({
      resolveProfile: async (job) => {
        const values = await resolve(job.id, ["memory.summary"], job.token);
        const profile = values["memory.summary"];
        if (!profile) throw new DmError("configuration");
        return profile;
      },
    }),
  };
}
