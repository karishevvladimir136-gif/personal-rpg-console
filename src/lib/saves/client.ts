import type { SaveCommand, SaveResult, SavesSnapshot } from "./contracts.ts";
import { validTimeline } from "./client-state.ts";

const codes = new Set([
  "unauthenticated",
  "forbidden",
  "not_found",
  "validation",
  "conflict",
  "busy",
  "restricted",
  "unavailable",
  "not_configured",
]);
export class SavesClientError extends Error {
  code: string;
  constructor(code = "unavailable") {
    super(codes.has(code) ? code : "unavailable");
    this.code = this.message;
  }
}
export function savesErrorMessage(cause: unknown) {
  switch (cause instanceof SavesClientError ? cause.code : "unavailable") {
    case "unauthenticated":
      return "Please sign in again. Your save request and title are preserved.";
    case "forbidden":
      return "Only the configured owner can access this application.";
    case "conflict":
      return "The campaign or active timeline changed. Your title is preserved. Refresh the saves, then review your choice again.";
    case "busy":
      return "An action is still being saved. Wait for it to finish, then retry this request.";
    case "restricted":
      return "The campaign's load policy requires explicit owner recovery for this choice.";
    case "validation":
      return "This save request could not be applied. Review the title and selected save; your current timeline is unchanged.";
    case "not_found":
      return "This save or timeline is no longer available in this campaign.";
    case "not_configured":
      return "Persistence setup is required before saving.";
    default:
      return "The request could not be confirmed. Your title is preserved. Retry the same request before starting another.";
  }
}
export function validateSavesSnapshot(
  value: unknown,
  campaignId: string,
): SavesSnapshot {
  const row = value as SavesSnapshot | null;
  if (
    !row ||
    row.campaignId !== campaignId ||
    !validTimeline(row.timeline) ||
    !Number.isSafeInteger(row.runtimeRevision) ||
    !Number.isSafeInteger(row.revision) ||
    !Array.isArray(row.saves) ||
    !Array.isArray(row.timelines) ||
    !row.policy ||
    !["off", "session", "turn"].includes(row.policy.autosave) ||
    !["unrestricted", "checkpoints", "restricted"].includes(
      row.policy.loadMode,
    ) ||
    !Number.isInteger(row.policy.retention) ||
    row.policy.retention < 10 ||
    row.policy.retention > 20
  )
    throw new SavesClientError();
  if (
    row.saves.some(
      (save) =>
        save.campaign_id !== campaignId ||
        typeof save.id !== "string" ||
        typeof save.timelineId !== "string" ||
        typeof save.name !== "string" ||
        !["manual", "quick", "autosave", "safety"].includes(save.kind) ||
        typeof save.createdAt !== "string" ||
        typeof save.pendingAction !== "boolean" ||
        !Number.isFinite(save.worldMinutes),
    ) ||
    row.timelines.some(
      (timeline) =>
        timeline.campaign_id !== campaignId ||
        typeof timeline.id !== "string" ||
        typeof timeline.label !== "string" ||
        typeof timeline.active !== "boolean",
    ) ||
    row.timelines.filter((timeline) => timeline.active).length !== 1 ||
    !row.timelines.some(
      (timeline) => timeline.active && timeline.id === row.timeline.timelineId,
    )
  )
    throw new SavesClientError();
  return row;
}
async function request(
  campaignId: string,
  command?: SaveCommand,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(
      `/api/campaigns/${encodeURIComponent(campaignId)}/saves${command ? `/${command.action}` : ""}`,
      {
        method: command ? "POST" : "GET",
        credentials: "same-origin",
        cache: "no-store",
        ...(command
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(command.input),
            }
          : {}),
      },
    );
  } catch {
    throw new SavesClientError();
  }
  const value = await response.json().catch(() => null);
  if (!response.ok)
    throw new SavesClientError(
      typeof value?.error?.code === "string" ? value.error.code : "unavailable",
    );
  return value;
}
export async function loadSaves(campaignId: string) {
  return validateSavesSnapshot(await request(campaignId), campaignId);
}
export async function runSaveCommand(
  command: SaveCommand,
): Promise<SaveResult> {
  const value = (await request(
    command.input.campaignId,
    command,
  )) as SaveResult | null;
  if (
    !value ||
    value.requestId !== command.input.requestId ||
    typeof value.timelineId !== "string" ||
    !(value.saveId === null || typeof value.saveId === "string") ||
    !(value.safetySaveId === null || typeof value.safetySaveId === "string")
  )
    throw new SavesClientError();
  validateSavesSnapshot(value.snapshot, command.input.campaignId);
  return value;
}
