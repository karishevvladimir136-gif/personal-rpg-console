import type { ModelSelection } from "../production/contracts.ts";
import { GameplayClientError } from "./client.ts";
import type { DmRuntimeId, DmSettings, DmSettingsSave, DmSplit } from "./dm-loop/settings.ts";
import { parseDmOptions } from "./dm-loop/options.ts";
import { effectiveDmLoopLimits, type DmLoopTurnLimits } from "./dm-loop/limits.ts";
import { parseDepthRange } from "./dm-loop/depth.ts";

export type { DmRuntimeId, DmSettings, DmSettingsSave, DmSplit } from "./dm-loop/settings.ts";
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

/** The two DM models a campaign may choose for its turn (docs/MODELS.md). `defaultEffort` mirrors
 * `dmModels[].defaultReasoning` in src/lib/model-runtime/dm-models.ts (the server's default when a
 * selection carries no effort); a test keeps the two in step, since client code may not import model-runtime. */
export const dmTurnModels: readonly { providerId: "anthropic" | "openai"; modelId: string; label: string; efforts: readonly string[]; defaultEffort: string }[] = [
  { providerId: "anthropic", modelId: "claude-opus-5-5", label: "Claude Opus 5.5", efforts: ["low", "medium", "high", "xhigh", "max"], defaultEffort: "medium" },
  { providerId: "openai", modelId: "gpt-6-astra", label: "GPT-6 Astra", efforts: ["low", "medium", "high", "xhigh", "max"], defaultEffort: "high" },
];

/** Polish 3 §2: the models of the split's two roles (the SQL assert of migration 68 admits the same). */
export const dmWriterModels: readonly { modelId: string; label: string; efforts: readonly string[]; defaultEffort: string }[] = [
  { modelId: "claude-opus-5-5", label: "Claude Opus 5.5", efforts: ["low", "medium", "high", "xhigh", "max"], defaultEffort: "high" },
  { modelId: "claude-fable-5-1", label: "Claude Fable 5.1", efforts: ["high"], defaultEffort: "high" },
];
export const dmBookkeeperModels: readonly { modelId: string; label: string; efforts: readonly string[]; defaultEffort: string }[] = [
  { modelId: "claude-opus-5-5", label: "Claude Opus 5.5", efforts: ["medium", "high"], defaultEffort: "high" },
  { modelId: "claude-sonnet-5-5", label: "Claude Sonnet 5.5", efforts: ["medium", "high"], defaultEffort: "high" },
];
/** The three choices of «Ведущий» with the bake-off's numbers (2026-10-17, the same eight states each):
 * the median first word and the cost of a 41-turn session. `split` null is today's loop. */
export const dmArchitectures: readonly { id: "single" | "fable-opus" | "opus-sonnet"; ru: string; en: string; firstWordS: number; sessionUsd: number;
  split: DmSplit | null }[] = [
  { id: "single", ru: "Opus ведёт один", en: "Opus runs alone", firstWordS: 24.7, sessionUsd: 12, split: null },
  { id: "fable-opus", ru: "Fable пишет — Opus записывает", en: "Fable writes — Opus records", firstWordS: 26.7, sessionUsd: 27,
    split: { writer: { providerId: "anthropic", modelId: "claude-fable-5-1", reasoning: "high" }, bookkeeper: { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" } } },
  { id: "opus-sonnet", ru: "Opus пишет — Sonnet записывает", en: "Opus writes — Sonnet records", firstWordS: 15.7, sessionUsd: 11,
    split: { writer: { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" }, bookkeeper: { providerId: "anthropic", modelId: "claude-sonnet-5-5", reasoning: "high" } } },
];
/** Which of the three choices a stored split is (null: a custom pair from «Подробнее»). */
export function dmArchitectureOf(split: DmSplit | null): (typeof dmArchitectures)[number]["id"] | null {
  if (!split) return "single";
  const found = dmArchitectures.find((row) => row.split && row.split.writer.modelId === split.writer.modelId && row.split.bookkeeper.modelId === split.bookkeeper.modelId);
  return found?.id ?? null;
}

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
  const rawSplit = v.split && typeof v.split === "object" ? v.split as Record<string, unknown> : null;
  const split: DmSplit | null = rawSplit && rawSplit.writer && typeof rawSplit.writer === "object" && rawSplit.bookkeeper && typeof rawSplit.bookkeeper === "object"
    ? { writer: rawSplit.writer as ModelSelection, bookkeeper: rawSplit.bookkeeper as ModelSelection } : null;
  return { campaignId: v.campaignId, runtime: v.runtime, dmTurn, limits, customLimits: !!v.customLimits,
    depth: v.depth === null || v.depth === undefined ? null : parseDepthRange(v.depth),
    notebookVisible: v.notebookVisible === true, boostNext: v.boostNext === true, voiceExamples: v.voiceExamples === true,
    voiceMode: v.voiceMode === "five" || v.voiceMode === "all" ? v.voiceMode : "off",
    voiceTokenCap: Number.isSafeInteger(v.voiceTokenCap) ? v.voiceTokenCap as number : 30_000,
    split, snapshotsKeep: Number.isSafeInteger(v.snapshotsKeep) ? v.snapshotsKeep as number : null, options: parseDmOptions(v.options), revision: v.revision as number };
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
