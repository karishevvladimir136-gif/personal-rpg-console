import "server-only";
import { createClient } from "@supabase/supabase-js";
import { authorizeCampaign } from "./campaign-authorization.ts";
import { databaseError, PersistenceError } from "./errors.ts";
import { isUuid } from "../persistence/validation.ts";
import { isTimelineFence } from "../saves/fence.ts";
import { parseCharacterModel } from "../gameplay/character-model.ts";

export async function characterModelCommand(campaignId: string, value: unknown) {
  const { user } = await authorizeCampaign(campaignId);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new PersistenceError("validation");
  const v = value as Record<string, unknown>;
  const action = v.action;
  if ((action !== "read" && action !== "correct") || !isUuid(v.actorId) || !isTimelineFence(v.timeline))
    throw new PersistenceError("validation");
  if (action === "read") {
    if (Object.keys(v).length !== 3) throw new PersistenceError("validation");
  } else {
    if (Object.keys(v).length !== 6 || !isUuid(v.requestId) || !Number.isSafeInteger(v.expectedRevision) ||
        (v.expectedRevision as number) < 0) throw new PersistenceError("validation");
    try {
      if (parseCharacterModel(v.model).actorId !== v.actorId) throw new Error("actor_mismatch");
    } catch { throw new PersistenceError("validation"); }
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || user.id !== process.env.RPG_OWNER_USER_ID) throw new PersistenceError("not_configured");
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const { data, error } = await db.rpc("rpg_character_model", {
    p_owner_id: user.id,
    p_campaign_id: campaignId,
    p_action: action,
    p_payload: action === "read" ? { actorId: v.actorId } : {
      actorId: v.actorId, requestId: v.requestId, expectedRevision: v.expectedRevision, model: v.model,
    },
    p_timeline: v.timeline,
  });
  if (error) throw databaseError(error);
  return data;
}
