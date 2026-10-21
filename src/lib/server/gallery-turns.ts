import "server-only";
import { createClient } from "@supabase/supabase-js";
import { authorizeCampaign } from "./campaign-authorization";
import { databaseError, PersistenceError } from "./errors";
import { isUuid } from "../persistence/validation";
import { parseGalleryTurns, type GalleryTurn } from "../visual-frame/gallery-turns";

// Fixes before session 3 (2.3, audit row B-13): the gallery's own read over every committed game turn (migration
// 202610210403) — /play carries only the last 64, so the earlier sessions' frames dropped out of «Кадры». Owner-only.
export async function readGalleryTurns(campaignId: string): Promise<GalleryTurn[]> {
  const { user } = await authorizeCampaign(campaignId);
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !isUuid(user.id) || user.id !== process.env.RPG_OWNER_USER_ID) throw new PersistenceError("not_configured");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const response = await client.rpc("rpg_gallery_turns", { p_owner_id: user.id, p_campaign_id: campaignId });
  if (response.error) throw databaseError(response.error);
  return parseGalleryTurns(response.data);
}
