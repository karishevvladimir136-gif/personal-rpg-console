import type { ModelSelection, RuntimeTask } from "./contracts.ts";

// Owner-selected application default. Gameplay task defaults below do not
// replace an explicit campaign primary or task override.
export const DEFAULT_GAMEPLAY_MODEL: Readonly<ModelSelection> = Object.freeze({
  providerId: "openai",
  modelId: "gpt-6-astra",
  reasoning: "high",
});
const DEFAULT_GAMEPLAY_RESOLVER: Readonly<ModelSelection> = Object.freeze({
  providerId: "openai",
  modelId: "gpt-6-astra",
  reasoning: "medium",
});

// Used only for new World Logic Game profiles and their public selection view.
export function applicationGameplayTaskSelection(
  task: RuntimeTask,
  globalDefault: ModelSelection | null,
): ModelSelection | null {
  const defaultAstra =
    globalDefault?.providerId === DEFAULT_GAMEPLAY_MODEL.providerId &&
    globalDefault.modelId === DEFAULT_GAMEPLAY_MODEL.modelId &&
    ["high", "xhigh"].includes(globalDefault.reasoning ?? "");
  if (!defaultAstra) return globalDefault;
  if (task === "world.resolve") return { ...DEFAULT_GAMEPLAY_RESOLVER };
  if (task === "dm.narrate") return { ...DEFAULT_GAMEPLAY_MODEL };
  return globalDefault;
}
