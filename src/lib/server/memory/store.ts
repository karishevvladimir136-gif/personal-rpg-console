import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createRpcMemoryStore } from "../../memory/store.ts";
import { DmError } from "../../gameplay/dm-errors.ts";

export function createMemoryStore(
  ownerId: string,
  suppliedClient?: SupabaseClient,
) {
  let client = suppliedClient;
  return createRpcMemoryStore(ownerId, async (args) => {
    if (ownerId !== process.env.RPG_OWNER_USER_ID)
      throw new DmError("unavailable");
    if (!client) {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key) throw new DmError("configuration");
      client = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });
    }
    return await client.rpc("rpg_memory", args);
  });
}
