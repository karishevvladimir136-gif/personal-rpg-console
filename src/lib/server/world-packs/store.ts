import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { TimelineFence } from "../../saves/contracts.ts";
import { createRpcPackStore } from "../../world-packs/bindings.ts";
import { createLibraryStore } from "../world-library/store.ts";
import {
  ensure,
  FoundationValidationError,
} from "../../world-library/validation.ts";

export function createPackStore(
  ownerId: string,
  campaignId: string,
  timeline: TimelineFence,
  suppliedClient?: SupabaseClient,
) {
  let client = suppliedClient;
  return createRpcPackStore(
    ownerId,
    campaignId,
    timeline,
    createLibraryStore(ownerId, suppliedClient),
    async (args) => {
      ensure(ownerId === process.env.RPG_OWNER_USER_ID, "scope");
      if (!client) {
        const url = process.env.SUPABASE_URL,
          key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) throw new FoundationValidationError("configuration");
        client = createClient(url, key, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        });
      }
      return await client.rpc("rpg_world", args);
    },
  );
}
