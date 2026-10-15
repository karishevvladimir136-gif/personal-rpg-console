// Campaign DM settings: which turn runtime plays new turns and which DM model
// the turn uses. Not world canon (editable after a takeover), pinned per turn.
import { validateModelSelection } from "../../model-runtime/registry.ts";
import type { ModelSelection } from "../../production/contracts.ts";
import { DM_LOOP_RUNTIME } from "./contracts.ts";
import { effectiveDmLoopLimits, parseDmLoopLimits, type DmLoopTurnLimits } from "./limits.ts";

export type DmRuntimeId = "astra-primary-v1" | typeof DM_LOOP_RUNTIME;
export type DmSettings = {
  campaignId: string;
  runtime: DmRuntimeId;
  /** The DM model for the turn; null means the Stage 1 "dm.turn" override or the default. */
  dmTurn: ModelSelection | null;
  /** The per-turn limits in force for the next turn: the campaign's own or the defaults (stage 3). */
  limits: DmLoopTurnLimits;
  /** Whether the campaign stores its own limits (false: the defaults above). */
  customLimits: boolean;
  revision: number;
};
export type DmSettingsSave = {
  expectedRevision: number; runtime: DmRuntimeId; dmTurn: ModelSelection | null;
  /** Omitted: keep the stored limits. null: return to the defaults. An object: the campaign's own limits. */
  limits?: DmLoopTurnLimits | null;
};

export type DmSettingsRpc = (args: {
  p_owner_id: string; p_campaign_id: string; p_action: "read" | "save"; p_payload: unknown;
}) => Promise<{ data: unknown; error?: { message?: string } | null }>;

export class DmSettingsError extends Error {
  readonly code: "validation" | "conflict" | "not_found" | "unavailable";
  constructor(code: DmSettingsError["code"]) {
    super(code);
    this.name = "DmSettingsError";
    this.code = code;
  }
}

export function parseDmSettings(value: unknown): DmSettings {
  if (!value || typeof value !== "object") throw new DmSettingsError("unavailable");
  const v = value as Record<string, unknown>;
  if (typeof v.campaignId !== "string" || (v.runtime !== "astra-primary-v1" && v.runtime !== DM_LOOP_RUNTIME) ||
    !Number.isSafeInteger(v.revision)) throw new DmSettingsError("unavailable");
  let dmTurn: ModelSelection | null = null;
  if (v.dmTurn !== null && v.dmTurn !== undefined) {
    try { dmTurn = validateModelSelection(v.dmTurn, "dm.turn"); } catch { throw new DmSettingsError("unavailable"); }
  }
  let limits: DmLoopTurnLimits;
  try { limits = effectiveDmLoopLimits(v.limits); } catch { throw new DmSettingsError("unavailable"); }
  return { campaignId: v.campaignId, runtime: v.runtime as DmRuntimeId, dmTurn, limits,
    customLimits: v.limits !== null && v.limits !== undefined, revision: v.revision as number };
}

export function parseDmSettingsSave(value: unknown): DmSettingsSave {
  if (!value || typeof value !== "object") throw new DmSettingsError("validation");
  const v = value as Record<string, unknown>;
  const keys = Object.keys(v).sort().join(",");
  if ((keys !== "dmTurn,expectedRevision,runtime" && keys !== "dmTurn,expectedRevision,limits,runtime") ||
    !Number.isSafeInteger(v.expectedRevision) ||
    (v.runtime !== "astra-primary-v1" && v.runtime !== DM_LOOP_RUNTIME)) throw new DmSettingsError("validation");
  let dmTurn: ModelSelection | null = null;
  if (v.dmTurn !== null) {
    try { dmTurn = validateModelSelection(v.dmTurn, "dm.turn"); } catch { throw new DmSettingsError("validation"); }
  }
  const save: DmSettingsSave = { expectedRevision: v.expectedRevision as number, runtime: v.runtime as DmRuntimeId, dmTurn };
  if ("limits" in v) {
    if (v.limits === null) save.limits = null;
    else { try { save.limits = parseDmLoopLimits(v.limits); } catch { throw new DmSettingsError("validation"); } }
  }
  return save;
}

function failure(message: string | undefined): DmSettingsError {
  const text = message ?? "";
  return new DmSettingsError(text.includes("rpg_conflict") ? "conflict" : text.includes("rpg_not_found") ? "not_found"
    : text.includes("rpg_validation") ? "validation" : "unavailable");
}

export async function readDmSettingsWith(rpc: DmSettingsRpc, ownerId: string, campaignId: string): Promise<DmSettings> {
  const response = await rpc({ p_owner_id: ownerId, p_campaign_id: campaignId, p_action: "read", p_payload: {} });
  if (response.error) throw failure(response.error.message);
  return parseDmSettings(response.data);
}

export async function saveDmSettingsWith(rpc: DmSettingsRpc, ownerId: string, campaignId: string, value: unknown): Promise<DmSettings> {
  const input = parseDmSettingsSave(value);
  const response = await rpc({ p_owner_id: ownerId, p_campaign_id: campaignId, p_action: "save", p_payload: input });
  if (response.error) throw failure(response.error.message);
  return parseDmSettings(response.data);
}
