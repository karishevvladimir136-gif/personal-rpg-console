import type { ModelSelection } from "../production/contracts.ts";
import { GameplayClientError } from "./client.ts";
import type { DmRuntimeId, DmSettings } from "./dm-loop/settings.ts";

export type { DmRuntimeId, DmSettings } from "./dm-loop/settings.ts";

/** The two DM models a campaign may choose for its turn (docs/MODELS.md). */
export const dmTurnModels: readonly { providerId: "anthropic" | "openai"; modelId: string; label: string; efforts: readonly string[] }[] = [
  { providerId: "anthropic", modelId: "claude-opus-5-5", label: "Claude Opus 5.5", efforts: ["low", "medium", "high", "xhigh", "max"] },
  { providerId: "openai", modelId: "gpt-6-astra", label: "GPT-6 Astra", efforts: ["low", "medium", "high", "xhigh", "max"] },
];

export const dmRuntimeOptions: readonly { value: DmRuntimeId; label: string; description: string }[] = [
  { value: "dm-loop-v1", label: "New turn loop (tools and streaming)",
    description: "The DM writes freely and changes the world through checked tools. New campaigns use it." },
  { value: "astra-primary-v1", label: "Previous Astra turn",
    description: "The earlier runtime kept for existing campaigns until they are switched." },
];

function parse(value: unknown): DmSettings {
  if (!value || typeof value !== "object") throw new GameplayClientError();
  const v = value as Record<string, unknown>;
  if (typeof v.campaignId !== "string" || (v.runtime !== "dm-loop-v1" && v.runtime !== "astra-primary-v1") ||
    !Number.isSafeInteger(v.revision)) throw new GameplayClientError();
  const dmTurn = v.dmTurn && typeof v.dmTurn === "object" ? v.dmTurn as ModelSelection : null;
  return { campaignId: v.campaignId, runtime: v.runtime, dmTurn, revision: v.revision as number };
}

async function request(url: string, body?: unknown): Promise<DmSettings> {
  let response: Response;
  try {
    response = await fetch(url, { method: body === undefined ? "GET" : "POST", credentials: "same-origin", cache: "no-store",
      ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }) });
  } catch {
    throw new GameplayClientError();
  }
  const value = await response.json().catch(() => null);
  if (!response.ok) throw new GameplayClientError(typeof value?.error?.code === "string" ? value.error.code : "unavailable");
  return parse(value);
}

const base = (campaignId: string) => `/api/campaigns/${encodeURIComponent(campaignId)}/dm-settings`;
export const loadDmSettings = (campaignId: string) => request(base(campaignId));
export const saveDmSettings = (campaignId: string, input: { expectedRevision: number; runtime: DmRuntimeId; dmTurn: ModelSelection | null }) =>
  request(base(campaignId), input);
