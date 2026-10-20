// Campaign DM settings: which turn runtime plays new turns and which DM model
// the turn uses. Not world canon (editable after a takeover), pinned per turn.
import { validateModelSelection } from "../../model-runtime/registry.ts";
import type { ModelSelection } from "../../production/contracts.ts";
import { DM_LOOP_RUNTIME } from "./contracts.ts";
import { effectiveDmLoopLimits, parseDmLoopLimits, type DmLoopTurnLimits } from "./limits.ts";
import { DEFAULT_DEPTH_RANGE, parseDepthRange, type DepthRange } from "./depth.ts";
import { isVoiceMode, VOICE_TOKEN_CAP_DEFAULT, VOICE_TOKEN_CAP_MAX, VOICE_TOKEN_CAP_MIN, type VoiceMode } from "./voice.ts";
import { parseDmOptions, parseDmOptionsPatch, type DmOptions } from "./options.ts";

export type DmRuntimeId = "astra-primary-v1" | typeof DM_LOOP_RUNTIME;
/** Polish 3 §2: the split — a writer that narrates (with the roll tool) and closes with a
 * private ledger, and a bookkeeper that records with today's tools. null: today's loop. */
export type DmSplit = { writer: ModelSelection; bookkeeper: ModelSelection };
export const DM_WRITER_MODELS: readonly string[] = ["claude-opus-5-5", "claude-fable-5-1"];
export const DM_BOOKKEEPER_MODELS: readonly string[] = ["claude-opus-5-5", "claude-sonnet-5-5"];
export function parseDmSplit(value: unknown): DmSplit | null {
  if (value === null || value === undefined) return null;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new DmSettingsError("validation");
  const v = value as Record<string, unknown>;
  const keys = Object.keys(v);
  if (keys.length !== 2 || !keys.includes("writer") || !keys.includes("bookkeeper")) throw new DmSettingsError("validation");
  let writer: ModelSelection, bookkeeper: ModelSelection;
  try { writer = validateModelSelection(v.writer, "dm.turn"); bookkeeper = validateModelSelection(v.bookkeeper, "dm.turn"); }
  catch { throw new DmSettingsError("validation"); }
  if (writer.providerId !== "anthropic" || !DM_WRITER_MODELS.includes(writer.modelId) ||
    bookkeeper.providerId !== "anthropic" || !DM_BOOKKEEPER_MODELS.includes(bookkeeper.modelId)) throw new DmSettingsError("validation");
  return { writer, bookkeeper };
}
export type DmSettings = {
  campaignId: string;
  runtime: DmRuntimeId;
  /** The DM model for the turn; null means the Stage 1 "dm.turn" override or the default. */
  dmTurn: ModelSelection | null;
  /** The per-turn limits in force for the next turn: the campaign's own or the defaults (stage 3). */
  limits: DmLoopTurnLimits;
  /** Whether the campaign stores its own limits (false: the defaults above). */
  customLimits: boolean;
  /** Stage 4 §7: the effort range a turn picks its level from; null: the fixed effort of dmTurn. */
  depth: DepthRange | null;
  /** Stage 4 §4: «заглянуть в блокнот мастера» — the owner may read the DM prep notebook. */
  notebookVisible: boolean;
  /** Stage 4 §7: «⚡ важный ход» — the next turn takes the top of the range, then the flag clears. */
  boostNext: boolean;
  /** Polish group 7: the voice layer may quote the owner's «Образцы голоса» (mirrors voiceMode !== "off"). */
  voiceExamples: boolean;
  /** Voice stage part 3: the examples mode — off · five (diverse by kind, stable per session) · all (up to the cap). */
  voiceMode: VoiceMode;
  /** Voice stage part 3: the token cap of the «all» mode (estimated tokens; default 30 000). */
  voiceTokenCap: number;
  /** Polish 3 §2: the writer + bookkeeper split; null — today's loop (the default for every campaign). */
  split: DmSplit | null;
  /** Polish 3 §4: how many of the newest turn snapshots to keep; null — all (the default). */
  snapshotsKeep: number | null;
  /** Fix run after session 2: the DM's options (migration 73), with the defaults filled in. */
  options: DmOptions;
  revision: number;
};

export { DM_OPTION_DEFAULTS, parseDmOptions, type DmOptions } from "./options.ts";
/** A save's options: only known keys with allowed values (anything else is a validation error). */
export function parseDmOptionsSave(value: unknown): Partial<DmOptions> {
  try { return parseDmOptionsPatch(value); } catch { throw new DmSettingsError("validation"); }
}
export type DmSettingsSave = {
  expectedRevision: number; runtime: DmRuntimeId; dmTurn: ModelSelection | null;
  /** Omitted: keep the stored limits. null: return to the defaults. An object: the campaign's own limits. */
  limits?: DmLoopTurnLimits | null;
  /** Omitted: keep. null: a fixed effort. */
  depth?: DepthRange | null;
  notebookVisible?: boolean;
  boostNext?: boolean;
  voiceExamples?: boolean;
  /** Omitted: keep. The mode wins over the old boolean when both are sent. */
  voiceMode?: VoiceMode;
  voiceTokenCap?: number;
  /** Omitted: keep. null: today's loop. An object: the split. */
  split?: DmSplit | null;
  /** Omitted: keep. null: keep every snapshot. */
  snapshotsKeep?: number | null;
  /** Omitted: keep. The keys given are merged into the stored options. */
  options?: Partial<DmOptions>;
};

export type DmSettingsRpc = (args: {
  p_owner_id: string; p_campaign_id: string; p_action: "read" | "save" | "boost_used"; p_payload: unknown;
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
  // Polish item 13: a campaign that never set its depth (no settings row yet) thinks
  // at high and goes to xhigh for a climax; a stored null stays the owner's «fixed effort».
  const depth = v.depth === null || v.depth === undefined ? (v.revision === 0 ? { ...DEFAULT_DEPTH_RANGE } : null) : parseDepthRange(v.depth);
  if (v.depth !== null && v.depth !== undefined && !depth) throw new DmSettingsError("unavailable");
  let split: DmSplit | null = null;
  try { split = parseDmSplit(v.split); } catch { throw new DmSettingsError("unavailable"); }
  const keep = v.snapshotsKeep;
  if (keep !== null && keep !== undefined && !(Number.isSafeInteger(keep) && (keep as number) >= 1)) throw new DmSettingsError("unavailable");
  // Voice stage part 3: a row from before migration 70 carries the boolean only (true → five).
  const voiceMode: VoiceMode = isVoiceMode(v.voiceMode) ? v.voiceMode : v.voiceExamples === true ? "five" : "off";
  const voiceTokenCap = Number.isSafeInteger(v.voiceTokenCap) && (v.voiceTokenCap as number) >= VOICE_TOKEN_CAP_MIN && (v.voiceTokenCap as number) <= VOICE_TOKEN_CAP_MAX
    ? v.voiceTokenCap as number : VOICE_TOKEN_CAP_DEFAULT;
  return { campaignId: v.campaignId, runtime: v.runtime as DmRuntimeId, dmTurn, limits,
    customLimits: v.limits !== null && v.limits !== undefined, depth,
    notebookVisible: v.notebookVisible === true, boostNext: v.boostNext === true, voiceExamples: voiceMode !== "off", voiceMode, voiceTokenCap,
    split, snapshotsKeep: keep === null || keep === undefined ? null : keep as number, options: parseDmOptions(v.options), revision: v.revision as number };
}

export function parseDmSettingsSave(value: unknown): DmSettingsSave {
  if (!value || typeof value !== "object") throw new DmSettingsError("validation");
  const v = value as Record<string, unknown>;
  const keys = Object.keys(v);
  const allowed = new Set(["dmTurn", "expectedRevision", "runtime", "limits", "depth", "notebookVisible", "boostNext", "voiceExamples", "voiceMode", "voiceTokenCap", "split", "snapshotsKeep", "options"]);
  if (!["dmTurn", "expectedRevision", "runtime"].every((key) => keys.includes(key)) || keys.some((key) => !allowed.has(key)) ||
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
  if ("depth" in v) {
    if (v.depth === null) save.depth = null;
    else { const depth = parseDepthRange(v.depth); if (!depth) throw new DmSettingsError("validation"); save.depth = depth; }
  }
  if ("notebookVisible" in v) { if (typeof v.notebookVisible !== "boolean") throw new DmSettingsError("validation"); save.notebookVisible = v.notebookVisible; }
  if ("boostNext" in v) { if (typeof v.boostNext !== "boolean") throw new DmSettingsError("validation"); save.boostNext = v.boostNext; }
  if ("voiceExamples" in v) { if (typeof v.voiceExamples !== "boolean") throw new DmSettingsError("validation"); save.voiceExamples = v.voiceExamples; }
  if ("voiceMode" in v) { if (!isVoiceMode(v.voiceMode)) throw new DmSettingsError("validation"); save.voiceMode = v.voiceMode; }
  if ("voiceTokenCap" in v) {
    if (!Number.isSafeInteger(v.voiceTokenCap) || (v.voiceTokenCap as number) < VOICE_TOKEN_CAP_MIN || (v.voiceTokenCap as number) > VOICE_TOKEN_CAP_MAX) throw new DmSettingsError("validation");
    save.voiceTokenCap = v.voiceTokenCap as number;
  }
  if ("split" in v) save.split = parseDmSplit(v.split);
  if ("snapshotsKeep" in v) {
    if (v.snapshotsKeep === null) save.snapshotsKeep = null;
    else if (Number.isSafeInteger(v.snapshotsKeep) && (v.snapshotsKeep as number) >= 1 && (v.snapshotsKeep as number) <= 100_000) save.snapshotsKeep = v.snapshotsKeep as number;
    else throw new DmSettingsError("validation");
  }
  if ("options" in v) save.options = parseDmOptionsSave(v.options);
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

/** The turn that honoured «important turn» clears the flag (stage 4 §7). */
export async function markBoostUsedWith(rpc: DmSettingsRpc, ownerId: string, campaignId: string): Promise<void> {
  const response = await rpc({ p_owner_id: ownerId, p_campaign_id: campaignId, p_action: "boost_used", p_payload: {} });
  if (response.error) throw failure(response.error.message);
}

export async function saveDmSettingsWith(rpc: DmSettingsRpc, ownerId: string, campaignId: string, value: unknown): Promise<DmSettings> {
  const input = parseDmSettingsSave(value);
  // Polish item 13 (found by the final measurement): the first save of a new campaign (the
  // wizard's DM step, the bench) names no depth; a stored null would read as the owner's
  // «fixed effort» and the depth rule would never run. A fresh row gets the default range.
  if (!("depth" in input) && input.expectedRevision === 0) input.depth = { ...DEFAULT_DEPTH_RANGE };
  const response = await rpc({ p_owner_id: ownerId, p_campaign_id: campaignId, p_action: "save", p_payload: input });
  if (response.error) throw failure(response.error.message);
  return parseDmSettings(response.data);
}
