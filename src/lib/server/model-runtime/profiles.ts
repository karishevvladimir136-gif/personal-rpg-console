import "server-only";
import { randomUUID } from "node:crypto";
import type {
  ExecutionProfile,
  RuntimeTask,
} from "../../production/contracts.ts";
import {
  resolveExecutionProfile,
  validateExecutionProfile,
} from "../../model-runtime/registry.ts";
import { DmError } from "../../gameplay/dm-errors.ts";
import type { ProviderOptions } from "../dm/provider.ts";

// Capture selection once, before work starts. Resolving/checking it is lazy so
// mechanic-only operations can still preserve input without provider setup.
export function environmentProfileResolver() {
  const globalDefault = {
    providerId: "openai",
    modelId: process.env.OPENAI_DM_MODEL ?? "",
    reasoning: process.env.OPENAI_DM_REASONING ?? null,
  };
  return (task: RuntimeTask): ExecutionProfile =>
    resolveExecutionProfile({ task, profileId: randomUUID(), globalDefault });
}

export function executionProviderOptions(
  profile: ExecutionProfile,
  task: RuntimeTask,
  transport: Pick<ProviderOptions, "fetcher" | "observer"> = {},
): ProviderOptions {
  const checked = validateExecutionProfile(profile, task);
  const apiKey = process.env.OPENAI_API_KEY ?? "";
  if (!apiKey) throw new DmError("configuration", true);
  return {
    apiKey,
    model: checked.modelId,
    reasoning: checked.reasoning ?? undefined,
    ...transport,
  };
}
