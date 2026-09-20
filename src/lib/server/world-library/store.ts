import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createRpcLibraryStore } from "../../world-library/store.ts";
import {
  ensure,
  FoundationValidationError,
} from "../../world-library/validation.ts";

// Caller obtains ownerId through requireOwner; env and SQL independently enforce it.
export function createLibraryStore(
  ownerId: string,
  suppliedClient?: SupabaseClient,
) {
  let client = suppliedClient;
  return createRpcLibraryStore(ownerId, async (args) => {
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
    return await client.rpc("rpg_library", args);
  });
}
