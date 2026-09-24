import "server-only";
import { modelBudget } from "../../gameplay/dm-context.ts";
import { DmError } from "../../gameplay/dm-errors.ts";
import { modelCapabilities } from "../../model-runtime/capabilities.ts";

export type ReasoningEffort =
  "none" | "low" | "medium" | "high" | "xhigh" | "max";

// Sol requires an explicit selection here; this adds no implicit production default.
export function modelReasoning(
  model: string,
  configured?: string,
): ReasoningEffort {
  modelBudget(model); // Explicit supported model required; never select a fallback.
  const capability = modelCapabilities(model);
  const effort = configured ?? capability?.defaultReasoning;
  if (!capability || !effort || !(capability.reasoning as readonly string[]).includes(effort))
    throw new DmError("configuration", true);
  return effort as ReasoningEffort;
}
