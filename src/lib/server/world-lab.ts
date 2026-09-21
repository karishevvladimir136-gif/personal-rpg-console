import "server-only";
import { createClient } from "@supabase/supabase-js";
import { authorizeCampaign } from "./campaign-authorization";
import { PersistenceError } from "./errors";
import { createLabService } from "../world-lab/service";
import type { ErrorCode } from "../persistence/contracts";

export async function worldLabService(
  campaignId: string,
  language: "en" | "ru" = "en",
) {
  const { user } = await authorizeCampaign(campaignId);
  if (user.id !== process.env.RPG_OWNER_USER_ID)
    throw new PersistenceError("forbidden");
  const url = process.env.SUPABASE_URL,
    key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new PersistenceError("not_configured");
  const client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return createLabService(
    user.id,
    async (args) => await client.rpc("rpg_world_lab", args),
    language,
  );
}
export function worldLabError(cause: unknown): PersistenceError {
  if (cause instanceof PersistenceError) return cause;
  const code =
    cause && typeof cause === "object" && "code" in cause
      ? String(cause.code)
      : "validation";
  const allowed: ErrorCode[] = [
    "unauthenticated",
    "forbidden",
    "not_configured",
    "not_found",
    "validation",
    "conflict",
    "unavailable",
  ];
  return new PersistenceError(
    allowed.includes(code as ErrorCode) ? (code as ErrorCode) : "validation",
  );
}
