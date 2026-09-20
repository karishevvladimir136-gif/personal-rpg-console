import { readWorldFoundation } from "./world/store";
import { resolveExecutionProfile } from "../model-runtime/registry";
import { randomUUID } from "node:crypto";
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { TimelineFence } from "../saves/contracts";
import type { FoundationRpc, RuntimeTask } from "../production/contracts";
import {
  persistentProfileResolver,
  type ProfileRpc,
} from "../production/profiles";
import {
  worldTurnPreparer,
  worldLogicTurnPreparer,
  type WorldTurnOptions,
} from "../production/turn-world";
import { createWorldResolverProvider } from "./world/resolver-provider";
import { executionProviderOptions } from "./model-runtime/profiles";
import { DmError } from "../gameplay/dm-errors";
import { createDmProvider } from "./dm";
import { createSummaryProvider } from "./memory/provider";
import type { RuntimeSource } from "../gameplay/server-contracts";
import type { JsonObject } from "../gameplay/contracts";
import { readFoundationLoop } from "../foundation-loop/authority";
import { foundationTurnPreparer } from "../foundation-loop/turn";
import { foundationActionContext } from "../foundation-actions";

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
    { allowLegacyDmProfiles: true },
  );
  const tasks = async (mode: string): Promise<RuntimeTask[]> => {
    if (mode === "feedback" || mode === "ooc") return ["dm.feedback"];
    const snapshot = await readWorldFoundation(
      world,
      ownerId,
      campaignId,
      timeline,
    );
    return snapshot.ruleset.id === "world-logic-v1"
      ? ["world.resolve", "dm.narrate"]
      : ["dm.plan", "dm.narrate", "world.resolve"];
  };
  const resolver = async (operationId: string) => {
    const values = await resolve(operationId, await tasks("game"));
    const profile = values["world.resolve"];
    if (!profile) throw new DmError("configuration");
    return createWorldResolverProvider(
      executionProviderOptions(profile, "world.resolve"),
    );
  };
  const worldOptions: WorldTurnOptions = {
    action: async (input) =>
      (await resolver(input.command.operationId)).action({
        ...input,
        source: await withFoundation(input.source),
      }),
    resolve: async (input) =>
      (await resolver(input.command.operationId)).resolve(input),
  };
  async function withFoundation(source: RuntimeSource): Promise<RuntimeSource> {
    const context = await readFoundationLoop(
      world,
      ownerId,
      campaignId,
      timeline,
    );
    if (!context.state.merchants.length) return source;
    const actorId =
      source.runtime.configuration?.controlledEntityIds[0] ??
      source.snapshot.entities.find((e) => e.kind === "player")?.id;
    if (
      !actorId ||
      !context.world.actors.some(
        (a) => a.id === actorId && a.control === "player",
      )
    )
      return source;
    return {
      ...source,
      foundationOptions: foundationActionContext(
        context,
        actorId,
      ) as unknown as JsonObject,
    };
  }
  const dm = createDmProvider({
    resolveProfile: async (task, _source, input) => {
      const values = await resolve(input.operationId, await tasks(input.mode));
      const profile = values[task];
      if (!profile) throw new DmError("configuration");
      return profile;
    },
  });
  return {
    planModel: async () => {
      const snapshot = await readWorldFoundation(
        world,
        ownerId,
        campaignId,
        timeline,
      );
      return resolveExecutionProfile({
        task:
          snapshot.ruleset.id === "world-logic-v1"
            ? "world.resolve"
            : "dm.plan",
        profileId: randomUUID(),
        campaignPolicy: snapshot.executionPolicy,
        globalDefault,
      }).modelId;
    },
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
      const r = snapshot.ruleset;
      const basic =
        r.id === "console-basic-v1" &&
        r.mode === "full_ruleset" &&
        r.version === 1 &&
        r.validatorVersion === "console-basic-v1";
      const logic =
        r.id === "world-logic-v1" &&
        r.mode === "world_logic" &&
        r.version === 1 &&
        r.validatorVersion === "world-logic-v1" &&
        claim.turn.input.mode === "game";
      if (!basic && !logic) throw new DmError("configuration");
    },
    prepareWorld: worldTurnPreparer(world, worldOptions),
    prepareWorldLogic: worldLogicTurnPreparer(world, worldOptions),
    prepareFoundation: foundationTurnPreparer(world),
    provider: {
      ...dm,
      plan: async (
        source: RuntimeSource,
        input: import("../gameplay/contracts").TurnInput,
      ) =>
        dm.plan(
          input.mode === "game" ? await withFoundation(source) : source,
          input,
        ),
    },
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
