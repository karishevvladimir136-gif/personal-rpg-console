import type { ModelSelection } from "../production/contracts.ts";
import { GameplayClientError } from "./client.ts";
import type { DmRuntimeId, DmSettings, DmSettingsSave } from "./dm-loop/settings.ts";
import { effectiveDmLoopLimits, type DmLoopTurnLimits } from "./dm-loop/limits.ts";

export type { DmRuntimeId, DmSettings, DmSettingsSave } from "./dm-loop/settings.ts";
export type { DmLoopTurnLimits } from "./dm-loop/limits.ts";
export { DM_LOOP_DEFAULT_LIMITS, DM_LOOP_LIMIT_CEILINGS, DM_LOOP_LIMIT_KEYS } from "./dm-loop/limits.ts";

/** Owner-facing names of the per-turn limits (campaign settings, stage 3; the panel itself is stage 5). */
export const dmLoopLimitLabels: Record<keyof DmLoopTurnLimits, string> = {
  moneyPerTurn: "Money created per turn",
  itemsPerTurn: "Items created per turn",
  charactersPerTurn: "New characters per turn",
  minutesPerTurn: "Game minutes advanced per turn",
  toolCallsPerTurn: "Tool calls per turn",
  modelRequestsPerTurn: "Model requests per turn",
};

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
  let limits: DmLoopTurnLimits;
  try { limits = effectiveDmLoopLimits(v.limits); } catch { throw new GameplayClientError(); }
  return { campaignId: v.campaignId, runtime: v.runtime, dmTurn, limits, customLimits: !!v.customLimits, revision: v.revision as number };
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
export const saveDmSettings = (campaignId: string, input: DmSettingsSave) =>
  request(base(campaignId), input);
