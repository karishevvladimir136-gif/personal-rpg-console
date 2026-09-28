import "server-only";
import { createClient } from "@supabase/supabase-js";
import { authorizeCampaign } from "../server/campaign-authorization";
import { readCampaign, applyMutation } from "../server/repository";
import { databaseError, PersistenceError } from "../server/errors";
import { isUuid } from "../persistence/validation";
import { isTimelineFence } from "../saves/fence";
import type { Mutation, MutationResult } from "../persistence/contracts";
import { writeBelonging } from "./authority";

export async function saveBelonging(value: unknown) {
  let ownerId: string | null = null;
  return writeBelonging(value, {
    authorize: async (campaignId) => {
      ownerId = (await authorizeCampaign(campaignId)).user.id;
    },
    receipt: async (input: Mutation) => {
      const url = process.env.SUPABASE_URL,
        key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!ownerId || !url || !key)
        throw new PersistenceError("not_configured");
      const client = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });
      // Lead-owned read-only RPC over the existing persistence receipt ledger.
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
        (r.campaign_id &&
          r.campaign_id !== (input as { campaignId: string }).campaignId)
      )
        throw new PersistenceError("unavailable");
      return {
        id: r.id,
        revision: r.revision,
        timeline: r.timeline,
        ...(r.campaign_id ? { campaign_id: r.campaign_id } : {}),
      };
    },
    snapshot: readCampaign,
    apply: applyMutation,
  });
}
