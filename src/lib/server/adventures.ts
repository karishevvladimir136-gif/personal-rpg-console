import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requireOwner } from "./auth";
import { authorizeCampaign } from "./campaign-authorization";
import { RequestError } from "../persistence/http-policy";
import { PersistenceError } from "./errors";
import { FoundationValidationError } from "../foundation-loop/fields";
import { AdventureClientError } from "../adventures/client";
import {
  AdventureServiceError,
  type AdventureRpc,
} from "../adventures/contracts";
import { createAdventureService } from "../adventures/service";

export async function adventureService(campaignId: string | null) {
  const { user } =
    campaignId === null
      ? await requireOwner()
      : await authorizeCampaign(campaignId);
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
  const execute: AdventureRpc = async (args) =>
    await client.rpc("rpg_adventures", args);
  return createAdventureService(user.id, execute);
}
export function adventureError(cause: unknown): PersistenceError {
  if (cause instanceof PersistenceError) return cause;
  if (cause instanceof RequestError) return new PersistenceError(cause.code);
  if (
    cause instanceof FoundationValidationError ||
    cause instanceof AdventureServiceError
  )
    return new PersistenceError(
      cause.code === "scope"
        ? "forbidden"
        : cause.code === "configuration"
          ? "not_configured"
          : cause.code === "not_found"
            ? "not_found"
            : cause.code === "conflict"
              ? "conflict"
              : cause.code === "unavailable"
                ? "unavailable"
                : "validation",
    );
  if (cause instanceof AdventureClientError)
    return new PersistenceError(
      cause.code === "conflict"
        ? "conflict"
        : cause.code === "validation"
          ? "validation"
          : "unavailable",
    );
  return new PersistenceError("unavailable");
}
