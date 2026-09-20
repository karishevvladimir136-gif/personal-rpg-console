import "server-only";
import { createClient } from "@supabase/supabase-js";
import { authorizeCampaign } from "./campaign-authorization";
import { requireOwner } from "./auth";
import { createSaveStore } from "./saves/store";
import { readWorldFoundation } from "./world/store";
import {
  configurationProjection,
  parseConfigureProduction,
  providerSettings,
} from "../production/configuration";
import type { FoundationRpc } from "../production/contracts";
import { PersistenceError } from "./errors";

export function worldRpc(ownerId: string): FoundationRpc {
  const url = process.env.SUPABASE_URL,
    key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || process.env.RPG_OWNER_USER_ID !== ownerId)
    throw new PersistenceError("not_configured");
  const client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return async (args) => await client.rpc("rpg_world", args);
}
export async function readProviderSettings() {
  await requireOwner();
  return providerSettings(process.env);
}
export async function readProductionSettings(campaignId: string) {
  const { user, client } = await authorizeCampaign(campaignId);
  const timeline = await createSaveStore(user.id).fence(campaignId);
  const snapshot = await readWorldFoundation(
    worldRpc(user.id),
    user.id,
    campaignId,
    timeline,
  );
  const settings = await client
    .from("rpg_settings")
    .select("values")
    .eq("campaign_id", campaignId)
    .single();
  if (settings.error) throw new PersistenceError("unavailable");
  return configurationProjection(
    snapshot,
    providerSettings(process.env),
    settings.data.values.worldAutonomy,
  );
}
export async function saveProductionSettings(
  campaignId: string,
  value: unknown,
) {
  const { user } = await authorizeCampaign(campaignId);
  let input;
  try {
    input = parseConfigureProduction(value);
  } catch {
    throw new PersistenceError("validation");
  }
  const rpc = worldRpc(user.id);
  // The original request remains identical on a timeout retry; SQL checks its
  // receipt before current revisions, then derives the private world itself.
  const {
    operationId,
    timeline,
    expectedRevision,
    expectedRuntimeRevision,
    expectedHeadId,
    worldPolicy,
    ruleset,
    runtimePolicy,
  } = input;
  const payload = {
    command: {
      operationId,
      campaignId,
      timeline,
      expectedRevision,
      expectedRuntimeRevision,
      expectedHeadId,
    },
    worldPolicy,
    ruleset,
    executionPolicy: runtimePolicy,
    reconciliation: input.reconciliation ?? null,
  };
  const response = await rpc({
    p_owner_id: user.id,
    p_campaign_id: campaignId,
    p_action: "owner_configure",
    p_payload: payload,
    p_timeline: input.timeline,
  });
  if (response.error)
    throw new PersistenceError(
      response.error.message?.includes("rpg_conflict")
        ? "conflict"
        : "validation",
    );
  return readProductionSettings(campaignId);
}
