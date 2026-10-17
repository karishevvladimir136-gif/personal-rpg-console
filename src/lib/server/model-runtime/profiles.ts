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
import { applicationModelSelection } from "../../model-runtime/defaults.ts";

// Capture selection once, before work starts. Resolving/checking it is lazy so
// mechanic-only operations can still preserve input without provider setup.
export function environmentProfileResolver() {
  const globalDefault = applicationModelSelection(process.env);
  return (task: RuntimeTask): ExecutionProfile =>
    resolveExecutionProfile({ task, profileId: randomUUID(), globalDefault });
}

export function executionProviderOptions(
  profile: ExecutionProfile,
  task: RuntimeTask,
  transport: Pick<ProviderOptions, "fetcher" | "observer"> = {},
): ProviderOptions & { providerId: "openai" | "anthropic" } {
  const checked = validateExecutionProfile(profile, task);
  // Polish 2 §5: an Anthropic profile (the campaign's DM writing the opening) takes the Anthropic key.
  const apiKey = (checked.providerId === "anthropic" ? process.env.ANTHROPIC_API_KEY : process.env.OPENAI_API_KEY) ?? "";
  if (!apiKey) throw new DmError("configuration", true);
  return {
    apiKey,
    providerId: checked.providerId === "anthropic" ? "anthropic" : "openai",
    model: checked.modelId,
    reasoning: checked.reasoning ?? undefined,
    ...transport,
  };
}
