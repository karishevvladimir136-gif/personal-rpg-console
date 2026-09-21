import "server-only";
import { createClient } from "@supabase/supabase-js";
import { authorizeCampaign } from "./campaign-authorization";
import { PersistenceError } from "./errors";
import { createLabService } from "../world-lab/service";
import type { ErrorCode } from "../persistence/contracts";
import { createWorldResolverProvider } from "./world/resolver-provider";
import { createComposerProvider } from "./world-lab/composer-provider";
import { executionProviderOptions } from "./model-runtime/profiles";
import { createLabAuthoringService } from "../world-lab/authoring";
import { createRpcLibraryStore } from "../world-library/store";
import { providerSettings } from "../production/configuration";

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
  const execute = async (args: Parameters<import("../world-lab/server-contracts").LabRpc>[0]) => await client.rpc("rpg_world_lab", args);
  const lab = createLabService(
    user.id,
    execute,
    language,
    { resolver: (profile) => createWorldResolverProvider(executionProviderOptions(profile, "world.resolve")) },
  );
  const settings = providerSettings(process.env);
  const authoring = createLabAuthoringService({
    ownerId: user.id, execute, lab, language,
    library: createRpcLibraryStore(user.id, async (args) => await client.rpc("rpg_library", args)),
    models: settings.models.map((model) => ({modelId: model.id, label: model.label, reasoning: model.reasoning, available: settings.providers.some((p) => p.id === model.providerId && p.status === "configured_not_tested")})),
    compose: (metadata) => createComposerProvider(executionProviderOptions(metadata.composeProfile, "world.compose"))(metadata),
  });
  return { ...lab, authoring };
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
