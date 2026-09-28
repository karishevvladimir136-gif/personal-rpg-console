import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Mutation, MutationResult } from "../persistence/contracts";
import { isUuid } from "../persistence/validation";
import { isTimelineFence } from "../saves/fence";
import { databaseError, PersistenceError } from "./errors";

// Called only after the owning route has authorized the campaign. The existing
// SQL receipt ledger validates the exact request and current timeline/epoch.
export async function readMutationReceipt(
  ownerId: string,
  input: Mutation,
): Promise<MutationResult | null> {
  const url = process.env.SUPABASE_URL,
    key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (
    !url ||
    !key ||
    !isUuid(ownerId) ||
    ownerId !== process.env.RPG_OWNER_USER_ID
  )
    throw new PersistenceError("not_configured");
  const client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  const response = await client.rpc("rpg_mutation_receipt", {
    p_owner_id: ownerId,
    p_mutation: input,
  });
  if (response.error) throw databaseError(response.error);
  if (response.data === null) return null;
  const r = response.data as MutationResult;
  if (
    !r ||
    !isUuid(r.id) ||
    !Number.isSafeInteger(r.revision) ||
    r.revision < 1 ||
    !isTimelineFence(r.timeline) ||
    !("campaignId" in input) ||
    r.campaign_id !== input.campaignId
  )
    throw new PersistenceError("unavailable");
  return {
    id: r.id,
    revision: r.revision,
    campaign_id: r.campaign_id,
    timeline: r.timeline,
  };
}
