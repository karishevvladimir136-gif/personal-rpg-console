import type { LabRequest } from "./contracts.ts";

/** The browser selects visible choices; immutable authority is resolved on the server. */
export function parseLabRequest(value: unknown): LabRequest {
  const fail = (): never => {
    throw new Error("Invalid World Lab request");
  };
  const object = (raw: unknown, keys: string[]): Record<string, unknown> => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return fail();
    const row = raw as Record<string, unknown>;
    if (
      Object.keys(row).length !== keys.length ||
      keys.some((key) => !Object.hasOwn(row, key))
    )
      return fail();
    return row;
  };
  const uuid = (raw: unknown): string =>
    typeof raw === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)
      ? raw
      : fail();
  const integer = (raw: unknown, max: number): number =>
    typeof raw === "number" &&
    Number.isSafeInteger(raw) &&
    raw > 0 &&
    raw <= max
      ? raw
      : fail();
  const request = object(value, ["action", "input"]);
  if (request.action === "prepare") {
    const row = object(request.input, [
      "operationId",
      "campaignId",
      "saveId",
      "scenarioVersionId",
      "divergenceVersionId",
      "label",
      "horizonMinutes",
    ]);
    if (
      typeof row.label !== "string" ||
      row.label.trim().length === 0 ||
      row.label.length > 160 ||
      row.label.includes("\0")
    )
      return fail();
    return {
      action: "prepare",
      input: {
        operationId: uuid(row.operationId),
        campaignId: uuid(row.campaignId),
        saveId: uuid(row.saveId),
        scenarioVersionId: uuid(row.scenarioVersionId),
        divergenceVersionId: uuid(row.divergenceVersionId),
        label: row.label.trim(),
        horizonMinutes: integer(row.horizonMinutes, 43200),
      },
    };
  }
  if (
    request.action !== "continue" &&
    request.action !== "pause" &&
    request.action !== "cancel" &&
    request.action !== "resume"
  )
    return fail();
  const row = object(request.input, [
    "operationId",
    "campaignId",
    "runId",
    "expectedRevision",
  ]);
  return {
    action: request.action,
    input: {
      operationId: uuid(row.operationId),
      campaignId: uuid(row.campaignId),
      runId: uuid(row.runId),
      expectedRevision: integer(row.expectedRevision, 2147483647),
    },
  };
}
