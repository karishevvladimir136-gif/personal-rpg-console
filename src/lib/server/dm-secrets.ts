import "server-only";
import { createClient } from "@supabase/supabase-js";
import { authorizeCampaign } from "./campaign-authorization";
import { PersistenceError, databaseError } from "./errors";
import { scheduleSecretsPrep } from "./hidden-layer-prep";

// Fix run B1: «Тайны (видит только ведущий)» — the owner's own DM-only text on the campaign and on its world
// (migration 74). Owner-only through the campaign authorization; the turn's source carries them to the DM; the player's
// snapshot never does.
export type DmSecretsEntry = { body: string; revision: number; title: string | null; available: boolean };
export type DmSecretsView = { campaign: DmSecretsEntry; world: DmSecretsEntry };
export const DM_SECRETS_MAX_CHARS = 20000;

async function rpc(ownerId: string, scope: "campaign" | "campaign_world", campaignId: string, action: "read" | "save", payload: Record<string, unknown> = {}) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || process.env.RPG_OWNER_USER_ID !== ownerId) throw new PersistenceError("not_configured");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const response = await client.rpc("rpg_dm_secrets", { p_owner_id: ownerId, p_scope: scope, p_subject: campaignId, p_action: action, p_payload: payload });
  if (response.error) throw databaseError(response.error as { message?: string; code?: string });
  const value = response.data as { subjectId: string | null; title: string | null; body: string; revision: number };
  return { body: String(value.body ?? ""), revision: Number(value.revision ?? 0), title: value.title ?? null, available: scope === "campaign" || value.subjectId !== null };
}

export async function readDmSecrets(campaignId: string): Promise<DmSecretsView> {
  const { user } = await authorizeCampaign(campaignId);
  const [campaign, world] = await Promise.all([rpc(user.id, "campaign", campaignId, "read"), rpc(user.id, "campaign_world", campaignId, "read")]);
  return { campaign, world };
}

export async function saveDmSecrets(campaignId: string, value: unknown): Promise<DmSecretsView> {
  const { user } = await authorizeCampaign(campaignId);
  const v = value && typeof value === "object" ? value as Record<string, unknown> : {};
  if ((v.scope !== "campaign" && v.scope !== "world") || typeof v.body !== "string" || v.body.length > DM_SECRETS_MAX_CHARS ||
    (v.expectedRevision !== undefined && !Number.isSafeInteger(v.expectedRevision))) throw new PersistenceError("validation");
  const before = await readDmSecrets(campaignId).catch(() => null);
  await rpc(user.id, v.scope === "campaign" ? "campaign" : "campaign_world", campaignId, "save",
    { body: v.body, ...(v.expectedRevision !== undefined ? { expectedRevision: v.expectedRevision } : {}) });
  const saved = await readDmSecrets(campaignId);
  // Fix S3-pre (KF-hidden-layer): «Тайны» that changed are built into the hidden layer — one prep, off the request's path.
  const was = before ? (v.scope === "campaign" ? before.campaign.body : before.world.body) : null;
  if (v.body.trim() && v.body.trim() !== (was ?? "").trim()) scheduleSecretsPrep(campaignId, user.id);
  return saved;
}
