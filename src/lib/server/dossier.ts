import "server-only";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { authorizeCampaign } from "./campaign-authorization";
import { PersistenceError, databaseError } from "./errors";
import { readDmSettings } from "./dm-settings";
import type { DossierRpc } from "../gameplay/dossier/contracts";
import type { RuntimeSource } from "../gameplay/server-contracts";
import type { TimelineFence } from "../saves/contracts";
import { parseDossier, parseNotebook, type DossierView, type NotebookView } from "../gameplay/dossier/contracts";

export type { DossierView, NotebookView } from "../gameplay/dossier/contracts";

function serviceRpc(ownerId: string): DossierRpc {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || process.env.RPG_OWNER_USER_ID !== ownerId) throw new PersistenceError("not_configured");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  return async (args) => await client.rpc("rpg_dossier", args);
}

async function call(ownerId: string, campaignId: string, action: string, payload: unknown, timeline: unknown = null) {
  const response = await serviceRpc(ownerId)({ p_owner_id: ownerId, p_campaign_id: campaignId, p_action: action, p_payload: payload, p_timeline: timeline });
  if (response.error) throw databaseError(response.error as { message?: string; code?: string });
  return response.data;
}

export async function readDossier(campaignId: string): Promise<DossierView> {
  const { user } = await authorizeCampaign(campaignId);
  return parseDossier(await call(user.id, campaignId, "read", {}));
}

/** Owner actions on the dossier: pin, unpin, likes, theme, status (campaign-level notes). */
export async function updateDossier(campaignId: string, value: unknown): Promise<DossierView> {
  const { user } = await authorizeCampaign(campaignId);
  if (!value || typeof value !== "object") throw new PersistenceError("validation");
  const v = value as Record<string, unknown>;
  const action = v.action;
  if (action !== "pin" && action !== "unpin" && action !== "likes" && action !== "theme" && action !== "status") throw new PersistenceError("validation");
  const { action: _action, ...payload } = v;
  void _action;
  return parseDossier(await call(user.id, campaignId, action, { requestId: randomUUID(), ...payload }));
}

/** The DM prep notebook, only when the campaign's «заглянуть в блокнот мастера» option is on. */
export async function readNotebook(campaignId: string): Promise<NotebookView | null> {
  const { user } = await authorizeCampaign(campaignId);
  const settings = await readDmSettings(campaignId);
  if (!settings.notebookVisible) return null;
  return parseNotebook(await call(user.id, campaignId, "notebook", {}));
}

/** Server-side writes the loop and the digest make (never from a client route). */
export async function dossierService(ownerId: string, campaignId: string) {
  return {
    likes: (playerLikes: string) => call(ownerId, campaignId, "likes", { requestId: randomUUID(), playerLikes }),
    playTime: (minutes: number) => call(ownerId, campaignId, "play_time", { requestId: randomUUID(), minutes }),
    notebook: () => call(ownerId, campaignId, "notebook", {}).then(parseNotebook),
    /** The same source a turn claims (private state included); server-only. */
    source: () => call(ownerId, campaignId, "source", {}) as Promise<RuntimeSource & { timeline: TimelineFence }>,
    digest: (payload: { sessionId: string; recap: string; title: string; notebook: string; plans: { key: string; value: string }[]; playerLikes?: string }, timeline: unknown) =>
      call(ownerId, campaignId, "digest", { requestId: randomUUID(), ...payload }, timeline),
  };
}
