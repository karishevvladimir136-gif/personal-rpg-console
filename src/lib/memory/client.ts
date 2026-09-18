import type {
  ContinueSessionInput,
  EndSessionInput,
  MemorySnapshot,
  RetryMemoryInput,
} from "./contracts.ts";

const errorCodes = new Set([
  "unauthenticated",
  "forbidden",
  "not_found",
  "conflict",
  "validation",
  "configuration",
  "not_configured",
  "context",
  "unavailable",
]);
export class MemoryClientError extends Error {
  code: string;
  constructor(code = "unavailable") {
    super(errorCodes.has(code) ? code : "unavailable");
    this.code = this.message;
  }
}
export function memoryErrorMessage(cause: unknown): string {
  const code = cause instanceof MemoryClientError ? cause.code : "unavailable";
  switch (code) {
    case "unauthenticated":
      return "Please sign in again. Your saved session is preserved.";
    case "forbidden":
      return "Only the configured owner can access this application.";
    case "conflict":
      return "Campaign records changed. Refresh the session before continuing.";
    case "configuration":
    case "not_configured":
      return "Recap generation needs local setup. Your saved session is preserved.";
    case "context":
    case "validation":
      return "The saved session needs to be refreshed before continuing. No gameplay outcome was changed.";
    default:
      return "The connection was interrupted. Check the saved session or retry the same request.";
  }
}
async function request(
  campaignId: string,
  action = "",
  body?: EndSessionInput | ContinueSessionInput | RetryMemoryInput,
): Promise<MemorySnapshot> {
  let response: Response;
  try {
    response = await fetch(
      `/api/campaigns/${encodeURIComponent(campaignId)}/memory${action}`,
      {
        method: body === undefined ? "GET" : "POST",
        credentials: "same-origin",
        cache: "no-store",
        ...(body === undefined
          ? {}
          : {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            }),
      },
    );
  } catch {
    throw new MemoryClientError();
  }
  const value = await response.json().catch(() => null);
  if (!response.ok)
    throw new MemoryClientError(
      typeof value?.error?.code === "string" ? value.error.code : "unavailable",
    );
  if (
    !value ||
    value.campaignId !== campaignId ||
    !Number.isSafeInteger(value.runtimeRevision) ||
    !Array.isArray(value.sessions) ||
    !(
      value.currentBoundary === null ||
      typeof value.currentBoundary === "object"
    ) ||
    value.sessions.some(
      (row: { campaign_id?: unknown }) => row?.campaign_id !== campaignId,
    ) ||
    (value.currentBoundary && value.currentBoundary.campaign_id !== campaignId)
  )
    throw new MemoryClientError();
  return value as MemorySnapshot;
}
export const loadMemory = (campaignId: string) => request(campaignId);
export const endSession = (input: EndSessionInput) =>
  request(input.campaignId, "/end", input);
export const continueSession = (input: ContinueSessionInput) =>
  request(input.campaignId, "/continue", input);
export const retryMemory = (input: RetryMemoryInput) =>
  request(input.campaignId, "/retry", input);
