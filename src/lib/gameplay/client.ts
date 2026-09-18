import type {
  ConfigurePlayInput,
  GuidanceApprovalInput,
  GuidanceApprovalResult,
  PlaySnapshot,
  PublicTurn,
  ResumeInput,
  TurnInput,
} from "./contracts.ts";

export class GameplayClientError extends Error {
  code: string;
  constructor(code = "unavailable") {
    super(code);
    this.code = code;
  }
}
export function gameplayErrorMessage(error: unknown) {
  const code =
    error instanceof GameplayClientError ? error.code : "unavailable";
  switch (code) {
    case "unauthenticated":
      return "Please sign in again. Your unsaved text is still here.";
    case "forbidden":
      return "Only the configured owner can access this application.";
    case "conflict":
      return "Campaign records changed. Review the latest state before sending a new action.";
    case "configuration":
    case "not_configured":
      return "The DM needs local setup before it can respond. Your action is preserved.";
    case "validation":
      return "This action needs clarification or uses unsupported rules. No outcome was applied.";
    default:
      return "The connection was interrupted. Check the saved turn before trying again.";
  }
}
async function request<T>(path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: body === undefined ? "GET" : "POST",
      credentials: "same-origin",
      cache: "no-store",
      ...(body === undefined
        ? {}
        : {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }),
    });
  } catch {
    throw new GameplayClientError();
  }
  const value = await response.json().catch(() => null);
  if (!response.ok)
    throw new GameplayClientError(
      typeof value?.error?.code === "string" ? value.error.code : "unavailable",
    );
  if (!value) throw new GameplayClientError();
  return value as T;
}
const base = (campaignId: string) =>
  `/api/campaigns/${encodeURIComponent(campaignId)}`;
export const loadPlay = (campaignId: string) =>
  request<PlaySnapshot>(`${base(campaignId)}/play`);
export const loadTurn = (campaignId: string, id: string) =>
  request<PublicTurn>(`${base(campaignId)}/turns/${encodeURIComponent(id)}`);
export const sendTurn = (input: TurnInput) =>
  request<PublicTurn>(`${base(input.campaignId)}/turns`, input);
export const resumeTurn = (input: ResumeInput) =>
  request<PublicTurn>(
    `${base(input.campaignId)}/turns/${encodeURIComponent(input.operationId)}/resume`,
    input,
  );
export const approveGuidance = (input: GuidanceApprovalInput) =>
  request<GuidanceApprovalResult>(`${base(input.campaignId)}/guidance`, input);
export const configurePlay = (input: ConfigurePlayInput) =>
  request<PlaySnapshot>(`${base(input.campaignId)}/play/config`, input);
