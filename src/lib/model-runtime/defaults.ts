import type { ModelSelection } from "../production/contracts.ts";

// Owner-selected application default. This is separate from capability defaults
// so existing explicit policies and pinned execution profiles keep their meaning.
export const DEFAULT_GAMEPLAY_MODEL: Readonly<ModelSelection> = Object.freeze({
  providerId: "openai",
  modelId: "gpt-6-astra",
  reasoning: "high",
});
export const STANDARD_SERVICE_TIER = "default" as const;

// Validate at the existing runtime boundary. Explicit invalid/empty settings
// remain invalid; they must never be replaced by the application default.
export function applicationModelSelection(
  environment: Record<string, string | undefined>,
): ModelSelection {
  const modelId = environment.OPENAI_DM_MODEL ?? DEFAULT_GAMEPLAY_MODEL.modelId;
  return {
    providerId: "openai",
    modelId,
    reasoning:
      environment.OPENAI_DM_REASONING ??
      (modelId === DEFAULT_GAMEPLAY_MODEL.modelId
        ? DEFAULT_GAMEPLAY_MODEL.reasoning
        : null),
  };
}
