import "server-only";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { PersistenceError } from "./errors";
import { readWorldFoundation } from "./world/store";
import { parseWorldState } from "../world/validation";
import type { FoundationRpc } from "../production/contracts";
import type { TimelineFence } from "../saves/contracts";
import type { RuntimeSource } from "../gameplay/server-contracts";
import { worldPolicyFromSettings, worldStateFromDossier } from "../gameplay/dm-loop/world-bridge";

function worldRpc(ownerId: string): FoundationRpc {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || process.env.RPG_OWNER_USER_ID !== ownerId) throw new PersistenceError("not_configured");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  return async (args) => await client.rpc("rpg_world", args);
}

/** Projects the loop campaign's plans into the World Engine after a commit
 * (stage 4 §2b): the campaign gets a world save World Lab can start from.
 * Never throws into the turn; logs one event when the world changed. */
export async function syncWorldFromDossier(ownerId: string, campaignId: string, timeline: TimelineFence, source: RuntimeSource): Promise<boolean> {
  const rpc = worldRpc(ownerId);
  const foundation = await readWorldFoundation(rpc, ownerId, campaignId, timeline);
  let existing = null;
  try { existing = foundation.world ? parseWorldState(foundation.world, campaignId) : null; }
  catch { existing = null; }
  const next = worldStateFromDossier(source, existing, worldPolicyFromSettings(source.snapshot.settings.values));
  if (!next) return false;
  const response = await rpc({ p_owner_id: ownerId, p_campaign_id: campaignId, p_action: "configure", p_timeline: timeline,
    p_payload: { command: { operationId: randomUUID(), campaignId, timeline, expectedRevision: foundation.revision,
      expectedRuntimeRevision: foundation.runtimeRevision, expectedHeadId: foundation.headId }, world: next } });
  if (response.error) throw new PersistenceError(String(response.error.message ?? "").includes("rpg_conflict") ? "conflict" : "validation");
  console.info(JSON.stringify({ event: "world_bridge_synced", campaignId, threads: next.threads.length, actors: next.actors.length }));
  return true;
}
