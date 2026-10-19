import "server-only";
import { createClient } from "@supabase/supabase-js";
import { authorizeCampaign } from "./campaign-authorization";
import { PersistenceError } from "./errors";
import type { TurnInput } from "../gameplay/contracts";
import type { RuntimeSource } from "../gameplay/server-contracts";
import { listTurnSnapshotsWith, readTurnSnapshotWith, saveTurnSnapshotWith, type TurnSnapshotRpc, type TurnSnapshotSettings } from "../gameplay/turn-snapshot";

// Polish 3 §4: the owner-only snapshots of committed turns (rpg_turn_snapshots, service role).
function serviceRpc(ownerId: string): TurnSnapshotRpc {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || process.env.RPG_OWNER_USER_ID !== ownerId) throw new PersistenceError("not_configured");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  return async (args) => await client.rpc("rpg_turn_snapshots", args);
}

/** After a commit: never fails the turn; a failure is logged. */
export async function saveTurnSnapshot(ownerId: string, campaignId: string, input: TurnInput, source: RuntimeSource, settings?: TurnSnapshotSettings): Promise<void> {
  try {
    const result = await saveTurnSnapshotWith(serviceRpc(ownerId), ownerId, campaignId, input, source, settings);
    console.info(JSON.stringify({ event: "turn_snapshot_saved", campaignId, operationId: input.operationId, turnNo: result.turnNo, pruned: result.pruned }));
  } catch (error) {
    console.info(JSON.stringify({ event: "turn_snapshot_failed", campaignId, operationId: input.operationId, message: error instanceof Error ? error.message : String(error) }));
  }
}

export async function listTurnSnapshots(campaignId: string) {
  const { user } = await authorizeCampaign(campaignId);
  return listTurnSnapshotsWith(serviceRpc(user.id), user.id, campaignId);
}

export async function readTurnSnapshot(campaignId: string, which: { operationId: string } | { turnNo: number }) {
  const { user } = await authorizeCampaign(campaignId);
  return readTurnSnapshotWith(serviceRpc(user.id), user.id, campaignId, which);
}
