import type {
  ExecutionProfile,
  ModelSelection,
  RuntimePolicy,
  RuntimeTask,
} from "../production/contracts.ts";
import { modelBudget } from "../gameplay/dm-context.ts";
import { DmError } from "../gameplay/dm-errors.ts";
import { modelCapabilities } from "./capabilities.ts";

// This registry admits only the already accepted direct Responses adapter.
// Budgets remain owned by the existing context builder; no provider probes occur.
export const registryVersion = "openai-responses-v1";
export const runtimeTasks = Object.freeze({
  "dm.plan": { contractVersion: "dm-plan-v1", boundary: "private" },
  "dm.narrate": { contractVersion: "dm-narration-v1", boundary: "public" },
  "dm.feedback": { contractVersion: "dm-feedback-v1", boundary: "public" },
  "memory.summary": { contractVersion: "memory-selection-v1", boundary: "job" },
  "world.resolve": { contractVersion: "world-resolver-v1", boundary: "private" },
  "world.compose": { contractVersion: "world-compose-v1", boundary: "job" },
  "canon.compile": { contractVersion: "canon-compiler-v1", boundary: "job" },
  "media.frame.verify": { contractVersion: "frame-grounding-v1", boundary: "job" },
} as const);

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail = (): never => {
  throw new DmError("configuration", true);
};
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function keys(value: Record<string, unknown>, names: string[]) {
  return (
    Object.keys(value).length === names.length &&
    names.every((name) => Object.hasOwn(value, name))
  );
}
function task(value: unknown): value is RuntimeTask {
  return typeof value === "string" && Object.hasOwn(runtimeTasks, value);
}

export function validateModelSelection(value: unknown): ModelSelection {
  if (
    !record(value) ||
    !keys(value, ["providerId", "modelId", "reasoning"]) ||
    value.providerId !== "openai" ||
    typeof value.modelId !== "string"
  )
    return fail();
  modelBudget(value.modelId);
  const capability = modelCapabilities(value.modelId);
  const reasoning =
    value.reasoning === null ? capability?.defaultReasoning : value.reasoning;
  if (
    !capability ||
    typeof reasoning !== "string" ||
    !(capability.reasoning as readonly string[]).includes(reasoning)
  )
    return fail();
  return { providerId: "openai", modelId: value.modelId, reasoning };
}

export function validateRuntimePolicy(value: unknown): RuntimePolicy {
  if (
    !record(value) ||
    !keys(value, ["schemaVersion", "revision", "primary", "taskOverrides"]) ||
    value.schemaVersion !== 1 ||
    !Number.isSafeInteger(value.revision) ||
    (value.revision as number) < 0 ||
    !record(value.taskOverrides)
  )
    return fail();
  const taskOverrides: RuntimePolicy["taskOverrides"] = {};
  for (const [name, selection] of Object.entries(value.taskOverrides)) {
    if (!task(name)) return fail();
    taskOverrides[name] = validateModelSelection(selection);
  }
  return {
    schemaVersion: 1,
    revision: value.revision as number,
    primary:
      value.primary === null ? null : validateModelSelection(value.primary),
    taskOverrides,
  };
}

// Profile validation does not check credentials: inspecting/restoring history
// must work even when its provider is unavailable. Execution checks separately.
export function validateExecutionProfile(
  value: unknown,
  expectedTask?: RuntimeTask,
): ExecutionProfile {
  if (
    !record(value) ||
    !keys(value, [
      "schemaVersion",
      "id",
      "policyRevision",
      "registryVersion",
      "task",
      "providerId",
      "modelId",
      "reasoning",
    ]) ||
    value.schemaVersion !== 1 ||
    typeof value.id !== "string" ||
    !uuid.test(value.id) ||
    !Number.isSafeInteger(value.policyRevision) ||
    (value.policyRevision as number) < 0 ||
    value.registryVersion !== registryVersion ||
    !task(value.task) ||
    (expectedTask !== undefined && value.task !== expectedTask)
  )
    return fail();
  const selection = validateModelSelection({
    providerId: value.providerId,
    modelId: value.modelId,
    reasoning: value.reasoning,
  });
  // A persisted execution profile contains the effective option, never a default
  // that could acquire a different meaning after a configuration edit.
  if (value.reasoning === null) return fail();
  return {
    ...selection,
    schemaVersion: 1,
    id: value.id,
    policyRevision: value.policyRevision as number,
    registryVersion,
    task: value.task,
  };
}

export function resolveExecutionProfile(options: {
  task: RuntimeTask;
  profileId: string;
  campaignPolicy?: RuntimePolicy | null;
  globalDefault: ModelSelection | null;
  providerAvailable?: (selection: ModelSelection) => boolean;
}): ExecutionProfile {
  if (!task(options.task) || !uuid.test(options.profileId)) return fail();
  const policy =
    options.campaignPolicy == null
      ? null
      : validateRuntimePolicy(options.campaignPolicy);
  // Only an intentionally unset value inherits. An explicit invalid choice
  // throws before it can fall through to a different model or provider.
  const selected =
    policy?.taskOverrides[options.task] ??
    policy?.primary ??
    options.globalDefault;
  const selection = validateModelSelection(selected);
  if (options.providerAvailable && !options.providerAvailable(selection))
    return fail();
  return {
    ...selection,
    schemaVersion: 1,
    id: options.profileId,
    policyRevision: policy?.revision ?? 0,
    registryVersion,
    task: options.task,
  };
}
