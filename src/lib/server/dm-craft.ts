import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requireOwner } from "./auth";
import { authorizeCampaign } from "./campaign-authorization";
import { databaseError, PersistenceError } from "./errors";
import { parseCraftCommand, parseTeachCommand } from "../dm-craft/validation";
import type { CraftOwnerView } from "../dm-craft/contracts";

function clientFor(ownerId: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || ownerId !== process.env.RPG_OWNER_USER_ID)
    throw new PersistenceError("not_configured");
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
export async function readDmCraft(): Promise<CraftOwnerView> {
  const { user } = await requireOwner();
  const { data, error } = await clientFor(user.id).rpc("rpg_dm_craft", {
    p_owner_id: user.id,
    p_action: "read",
    p_payload: {},
  });
  if (error) throw databaseError(error);
  return data as CraftOwnerView;
}
export async function executeDmCraft(value: unknown): Promise<CraftOwnerView> {
  const { user } = await requireOwner();
  let command;
  try {
    command = parseCraftCommand(value);
  } catch {
    throw new PersistenceError("validation");
  }
  const { data, error } = await clientFor(user.id).rpc("rpg_dm_craft", {
    p_owner_id: user.id,
    p_action: command.action,
    p_payload: command,
  });
  if (error) throw databaseError(error);
  return data as CraftOwnerView;
}
export async function executeDmTeach(campaignId: string, value: unknown) {
  const { user } = await authorizeCampaign(campaignId);
  let command;
  try {
    command = parseTeachCommand(value, campaignId);
  } catch {
    throw new PersistenceError("validation");
  }
  const { data, error } = await clientFor(user.id).rpc("rpg_dm_teach", {
    p_owner_id: user.id,
    p_campaign_id: campaignId,
    p_payload: command,
  });
  if (error) throw databaseError(error);
  return data as { status: "applied" | "already_applied"; proposal: unknown };
}
