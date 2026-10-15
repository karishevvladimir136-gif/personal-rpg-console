import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createRpcTurnStore } from "../../gameplay/dm-store.ts";
import { DmError } from "../../gameplay/dm-errors.ts";
import { modelBudget } from "../../gameplay/dm-context.ts";
import { modelReasoning } from "./config.ts";
import { applicationModelSelection } from "../../model-runtime/defaults.ts";
import type { TimelineFence } from "../../saves/contracts.ts";

export function createTurnStore(
  ownerId: string,
  suppliedClient?: SupabaseClient,
  timeline?: TimelineFence,
) {
  let client = suppliedClient;
  let model: string | null = null;
  if (process.env.OPENAI_API_KEY) {
    try {
      const selected = applicationModelSelection(process.env);
      modelReasoning(selected.modelId, selected.reasoning ?? undefined);
      model = modelBudget(selected.modelId).model;
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
    timeline,
    true,
    { astraResponseContract: "unified-v1" },
  );
}
