import "server-only";
import { modelBudget } from "../../gameplay/dm-context.ts";
import { DmError } from "../../gameplay/dm-errors.ts";

export type ReasoningEffort =
  "none" | "low" | "medium" | "high" | "xhigh" | "max";

// Verified 2026-09-18 against the official gpt-6-astra, gpt-5.4 and
// gpt-5.4-mini model pages. Astra does not support none/minimal; 5.4 has no max.
export function modelReasoning(
  model: string,
  configured?: string,
): ReasoningEffort {
  modelBudget(model); // Explicit supported model required; never select a fallback.
  const astra = model === "gpt-6-astra";
  const effort = configured ?? (astra ? "xhigh" : "none");
  const allowed: readonly string[] = astra
    ? ["low", "medium", "high", "xhigh", "max"]
    : ["none", "low", "medium", "high", "xhigh"];
  if (!allowed.includes(effort)) throw new DmError("configuration", true);
  return effort as ReasoningEffort;
}
