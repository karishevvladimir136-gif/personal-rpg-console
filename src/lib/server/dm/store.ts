import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createRpcTurnStore } from "../../gameplay/dm-store.ts";
import { DmError } from "../../gameplay/dm-errors.ts";
import { modelBudget } from "../../gameplay/dm-context.ts";
import { modelReasoning } from "./config.ts";

export function createTurnStore(
  ownerId: string,
  suppliedClient?: SupabaseClient,
) {
  let client = suppliedClient;
  let model: string | null = null;
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_DM_MODEL) {
    try {
      modelReasoning(
        process.env.OPENAI_DM_MODEL,
        process.env.OPENAI_DM_REASONING,
      );
      model = modelBudget(process.env.OPENAI_DM_MODEL).model;
    } catch {
      /* Safe configuration status; no fallback. */
    }
  }
  return createRpcTurnStore(
    ownerId,
    async (args) => {
      if (!client) {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key || ownerId !== process.env.RPG_OWNER_USER_ID)
          throw new DmError("configuration");
        client = createClient(url, key, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        });
      }
      return await client.rpc("rpg_runtime", args);
    },
    model,
  );
}
