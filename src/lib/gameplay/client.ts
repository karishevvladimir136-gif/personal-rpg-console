import type {
  ConfigurePlayInput,
  GuidanceApprovalInput,
  GuidanceApprovalResult,
  PlaySnapshot,
  PublicTurn,
  ResumeInput,
  TurnInput,
} from "./contracts.ts";
import type { CombatReadinessConfirmation, CombatReadinessProposal } from "./combat-readiness.ts";

export class GameplayClientError extends Error {
  code: string;
  /** The HTTP status of a server answer; null when no answer arrived (the outcome is unknown). */
  status: number | null;
  constructor(code = "unavailable", status: number | null = null) {
    super(code);
    this.code = code;
    this.status = status;
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
    case "startup_pending":
      return "The Adventure opening and DM setup must finish before your first action. Your text is still here.";
    case "configuration":
    case "not_configured":
      return "The DM needs local setup before it can respond. Your action is preserved.";
    case "validation":
      return "This action needs clarification or uses unsupported rules. No outcome was applied.";
    case "context":
      return "The DM context could not be prepared. Your text is still here.";
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
      response.status,
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
export const loadCombatReadiness = (campaignId: string) =>
  request<CombatReadinessProposal>(`${base(campaignId)}/combat-readiness`);
export const confirmCombatReadiness = (campaignId: string, input: CombatReadinessConfirmation) =>
  request<{ campaignId: string; requestId: string; ready: true }>(`${base(campaignId)}/combat-readiness`, input);
/** Polish 2 §6: the combat profile drafted by the DM's model from the hero's text (a proposal; the owner approves). */
export const draftCombatReadiness = (campaignId: string) =>
  request<{ status: "drafted"; draft: { hp: number; attack: number; defense: number; skill: number; weaponIndex: number | null; weaponDamage: number | null; why: string } } | { status: "not_configured" | "failed"; error?: string }>(`${base(campaignId)}/combat-readiness`, { action: "draft" });
