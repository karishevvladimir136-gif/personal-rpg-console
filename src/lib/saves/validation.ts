import { isUuid, ValidationError } from "../persistence/validation.ts";
import { isTimelineFence } from "./fence.ts";
import type { SaveCommand } from "./contracts.ts";

function requireValue(value: unknown): asserts value {
  if (!value) throw new ValidationError();
}
function record(value: unknown) {
  requireValue(value && typeof value === "object" && !Array.isArray(value));
  return value as Record<string, unknown>;
}
function exact(row: Record<string, unknown>, keys: string[]) {
  requireValue(
    Object.keys(row).length === keys.length &&
      keys.every((key) => Object.hasOwn(row, key)),
  );
}
function label(value: unknown, max: number) {
  requireValue(
    typeof value === "string" &&
      value.trim().length > 0 &&
      value.length <= max &&
      !value.includes("\u0000"),
  );
}
export function validateSaveCommand(
  value: unknown,
  campaignId: string,
  action: string,
): SaveCommand {
  requireValue(["create", "load", "switch", "policy"].includes(action));
  const row = record(value);
  const fields: Record<string, string[]> = {
    create: ["kind", "name"],
    load: ["saveId", "label", "recovery"],
    switch: ["timelineId", "recovery"],
    policy: ["policy"],
  };
  exact(row, [
    "requestId",
    "campaignId",
    "timeline",
    "expectedRevision",
    "expectedSavesRevision",
    ...fields[action],
  ]);
  requireValue(
    isUuid(campaignId) &&
      row.campaignId === campaignId &&
      isUuid(row.requestId) &&
      isTimelineFence(row.timeline),
  );
  for (const key of ["expectedRevision", "expectedSavesRevision"])
    requireValue(
      Number.isSafeInteger(row[key]) &&
        (row[key] as number) >= 0 &&
        (row[key] as number) <= 2147483646,
    );
  if (action === "create") {
    requireValue(row.kind === "manual" || row.kind === "quick");
    label(row.name, 160);
  } else if (action === "load") {
    requireValue(isUuid(row.saveId) && typeof row.recovery === "boolean");
    label(row.label, 160);
  } else if (action === "switch") {
    requireValue(isUuid(row.timelineId) && typeof row.recovery === "boolean");
  } else {
    const policy = record(row.policy);
    exact(policy, ["autosave", "retention", "loadMode"]);
    requireValue(
      ["off", "session", "turn"].includes(policy.autosave as string),
    );
    requireValue(
      ["unrestricted", "checkpoints", "restricted"].includes(
        policy.loadMode as string,
      ),
    );
    requireValue(
      Number.isInteger(policy.retention) &&
        (policy.retention as number) >= 10 &&
        (policy.retention as number) <= 20,
    );
  }
  return { action, input: structuredClone(row) } as SaveCommand;
}
