import "server-only";
import { createClient } from "@supabase/supabase-js";
import { authorizeCampaign } from "./campaign-authorization";
import { PersistenceError } from "./errors";
import { readDmSettingsWith, saveDmSettingsWith, type DmSettings, type DmSettingsRpc } from "../gameplay/dm-loop/settings";

export type { DmSettings } from "../gameplay/dm-loop/settings";

function serviceRpc(ownerId: string): DmSettingsRpc {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || process.env.RPG_OWNER_USER_ID !== ownerId) throw new PersistenceError("not_configured");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  return async (args) => await client.rpc("rpg_dm_settings", args);
}

export async function readDmSettings(campaignId: string): Promise<DmSettings> {
  const { user } = await authorizeCampaign(campaignId);
  return readDmSettingsWith(serviceRpc(user.id), user.id, campaignId);
}

export async function saveDmSettings(campaignId: string, value: unknown): Promise<DmSettings> {
  const { user } = await authorizeCampaign(campaignId);
  return saveDmSettingsWith(serviceRpc(user.id), user.id, campaignId, value);
}
