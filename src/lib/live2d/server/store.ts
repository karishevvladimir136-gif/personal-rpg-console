import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { authorizeCampaign } from "../../server/campaign-authorization";
import { databaseError, PersistenceError } from "../../server/errors";
import { isUuid } from "../../persistence/validation";
import { parseLive2dBoard, parseLive2dScene, parseLive2dSettings, parsePoi, parsePoiSeed, parseRegionMap, type Live2dBoard, type Live2dScene, type Poi, type PoiSeed, type RegionMap } from "../contracts";

// The 2D board's store: one RPC (rpg_live2d, migration 202610210200) with the
// owner's service credentials, server-side only. The client receives the public
// projection; seeds (the DM's hidden layer) never leave the server.

export type Live2dRpcAction =
  | "read" | "settings.save" | "scene.save" | "scene.update" | "poi.replace" | "poi.save" | "region.save"
  | "seed.plant" | "seed.list" | "seed.discover" | "battle.save"
  // Fix S3-accept Д3 (migration 202610230541): the region's prep (public part) and the owner's moved marker.
  | "region.prep.save" | "region.marker.save";
export type Live2dContext = {
  campaignId: string;
  ownerId: string;
  client: SupabaseClient;
  rpc: (action: Live2dRpcAction, payload?: unknown) => Promise<unknown>;
};

function serviceClient(ownerId: string) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !isUuid(ownerId) || ownerId !== process.env.RPG_OWNER_USER_ID) throw new PersistenceError("not_configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}
export async function live2dContext(campaignId: string): Promise<Live2dContext> {
  const { user } = await authorizeCampaign(campaignId);
  const client = serviceClient(user.id);
  return {
    campaignId, ownerId: user.id, client,
    rpc: async (action, payload = {}) => {
      const response = await client.rpc("rpg_live2d", { p_owner_id: user.id, p_campaign_id: campaignId, p_action: action, p_payload: payload });
      if (response.error) throw databaseError(response.error);
      return response.data;
    },
  };
}

export async function boardOf(ctx: Pick<Live2dContext, "rpc">): Promise<Live2dBoard> {
  const board = parseLive2dBoard(await ctx.rpc("read"));
  if (!board) throw new PersistenceError("unavailable");
  return board;
}
export async function readLive2dBoard(campaignId: string): Promise<Live2dBoard> {
  return boardOf(await live2dContext(campaignId));
}
export async function saveScene(ctx: Pick<Live2dContext, "rpc">, payload: unknown): Promise<Live2dScene> {
  const scene = parseLive2dScene(await ctx.rpc("scene.save", payload));
  if (!scene) throw new PersistenceError("unavailable");
  return scene;
}
export async function updateScene(ctx: Pick<Live2dContext, "rpc">, payload: unknown): Promise<Live2dScene> {
  const scene = parseLive2dScene(await ctx.rpc("scene.update", payload));
  if (!scene) throw new PersistenceError("unavailable");
  return scene;
}
export async function replacePois(ctx: Pick<Live2dContext, "rpc">, payload: unknown): Promise<Poi[]> {
  const rows = await ctx.rpc("poi.replace", payload);
  return Array.isArray(rows) ? rows.map(parsePoi).filter((row): row is Poi => row !== null) : [];
}
export async function savePoi(ctx: Pick<Live2dContext, "rpc">, payload: unknown): Promise<Poi> {
  const poi = parsePoi(await ctx.rpc("poi.save", payload));
  if (!poi) throw new PersistenceError("unavailable");
  return poi;
}
export async function saveRegionMap(ctx: Pick<Live2dContext, "rpc">, payload: unknown): Promise<RegionMap> {
  const row = parseRegionMap(await ctx.rpc("region.save", payload));
  if (!row) throw new PersistenceError("unavailable");
  return row;
}
/** Fix S3-accept Д3: the prep's public part on its map (fenced by the prep revision; every version kept). */
export async function saveRegionPrep(ctx: Pick<Live2dContext, "rpc">, payload: unknown): Promise<RegionMap> {
  const row = parseRegionMap(await ctx.rpc("region.prep.save", payload));
  if (!row) throw new PersistenceError("unavailable");
  return row;
}
/** Fix S3-accept Д3: the owner moves one marker of the painted region (fenced by the map revision). */
export async function saveRegionMarker(ctx: Pick<Live2dContext, "rpc">, payload: unknown): Promise<RegionMap> {
  const row = parseRegionMap(await ctx.rpc("region.marker.save", payload));
  if (!row) throw new PersistenceError("unavailable");
  return row;
}
export async function saveSettings(ctx: Pick<Live2dContext, "rpc">, payload: unknown) {
  return parseLive2dSettings(await ctx.rpc("settings.save", payload));
}
/** Server-only: the latent hooks of the campaign (never through the HTTP route). */
export async function listSeeds(ctx: Pick<Live2dContext, "rpc">): Promise<PoiSeed[]> {
  const rows = await ctx.rpc("seed.list");
  return Array.isArray(rows) ? rows.map(parsePoiSeed).filter((row): row is PoiSeed => row !== null) : [];
}
export async function plantSeed(ctx: Pick<Live2dContext, "rpc">, payload: unknown): Promise<PoiSeed | null> {
  return parsePoiSeed(await ctx.rpc("seed.plant", payload));
}
