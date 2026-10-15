// Contracts of the dm-loop-v1 turn runtime (Stage 2). The DM model writes free
// narration and changes state only through validated tools; every tool call
// gets a receipt that is persisted at once, so a resume never rolls dice twice.
// Design: docs/TURN_LOOP.md.
import type { JsonObject } from "../contracts.ts";
import type { PrivatePatch, RecordChange, RecordedCheck } from "../server-contracts.ts";
import type { MechanicsConfiguration } from "../contracts.ts";
import type { TimelineFence } from "../../saves/contracts.ts";
import type { DmEffort, DmMessage, DmProviderId } from "../../server/dm/model/contracts.ts";
import type { DmLoopTurnLimits } from "./limits.ts";

export const DM_LOOP_RUNTIME = "dm-loop-v1" as const;
export type DmLoopRuntimeId = typeof DM_LOOP_RUNTIME;

export type DmLoopToolCall = { id: string; name: string; arguments: JsonObject };

/** What the model gets back. `summary` is a short public line for the player's
 * list of accepted changes; it never carries private facts. */
export type DmLoopReceiptResult =
  | { ok: true; value: JsonObject; summary: string; check: RecordedCheck | null }
  | { ok: false; reason: string; hint: string | null; summary: string };

export type DmLoopReceipt = {
  position: number;
  id: string;
  call: DmLoopToolCall;
  result: DmLoopReceiptResult;
};

export type DmLoopPin = {
  providerId: DmProviderId;
  modelId: string;
  effort: DmEffort;
  /** Effort of the requests after the first (continuations after tool results),
   * when it differs from `effort` (stage 2b §3). Absent: the same level throughout. */
  continuationEffort?: DmEffort;
  runtime: DmLoopRuntimeId;
  /** One narrator sees secrets and Character Models. Two-stage is a later option. */
  privacy: "single-narrator";
  /** The campaign's per-turn limits at the moment the turn started (stage 3).
   * Validation reads them from here, never from the live settings; a retry
   * keeps them. Absent on operations pinned before stage 3 (defaults apply). */
  limits?: DmLoopTurnLimits;
};

/** What this turn has created so far, against the pinned per-turn limits. */
export type DmLoopTurnCounters = {
  moneyGranted: number;
  itemsCreated: number;
  charactersCreated: number;
};

export type DmLoopUsageEntry = {
  providerId: DmProviderId;
  modelId: string;
  effort: DmEffort;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  reasoningTokens: number | null;
  costUsd: number;
  latencyMs: number;
  /** Time to the first narration character of this request, if any text came. */
  firstTextMs: number | null;
  requestBytes: number;
  toolCalls: number;
};

export type DmLoopDiagnostic =
  | { kind: "suspected_leak"; detail: string }
  | { kind: "tool_cap_reached"; calls: number }
  | { kind: "request_cap_reached"; requests: number }
  | { kind: "model_refusal"; providerReason: string | null }
  | { kind: "max_tokens"; outputTokens: number }
  | { kind: "empty_narration" }
  /** The turn ended after a message of accepted bookkeeping that closed with
   * time passing, without a finish_turn round of its own (stage 3 §4). */
  | { kind: "implicit_finish"; calls: number };

export type DmLoopSceneKind = "combat" | "conversation" | "mystery" | "exploration" | "quiet" |
  "humor" | "trade" | "travel" | "other";

export type DmLoopMeta = {
  sceneKinds: DmLoopSceneKind[];
  /** Entity IDs whose story this turn touched (attention accounting, plan §10.4). */
  spotlight: string[];
  /** "How do you want to do this?" — the next player input narrates the decisive moment. */
  playerMoment: boolean;
};

/** The shadow state's delta, persisted at every checkpoint so a resume rebuilds
 * the same after-state without re-executing tools. */
export type DmLoopShadowDelta = {
  changes: RecordChange[];
  privatePatches: PrivatePatch[];
  localKeys: { key: string; family: RecordChange["family"]; id: string }[];
  worldMinutes: number;
  configuration: MechanicsConfiguration | null;
  createdIds: string[];
  minutesAdvanced: number;
  finished: boolean;
  /** Absent in deltas persisted before stage 3 (counted as zero). */
  counters?: DmLoopTurnCounters;
};

export type DmLoopCheckpoint = {
  schemaVersion: 1;
  createdTimeline: TimelineFence | null;
  receipts: DmLoopReceipt[];
  /** The neutral conversation so far, including opaque provider payloads
   * (thinking / reasoning items) needed to continue a tool round. Never shown. */
  transcript: DmMessage[];
  /** Narration text accumulated across model requests. */
  text: string;
  meta: DmLoopMeta | null;
  usage: DmLoopUsageEntry[];
  diagnostics: DmLoopDiagnostic[];
  requests: number;
  pin: DmLoopPin | null;
  shadow: DmLoopShadowDelta | null;
};

/** Public-safe live events streamed to the player while the turn runs. */
export type DmLoopLiveEvent =
  | { type: "text"; text: string }
  | { type: "tool"; name: string; ok: boolean; summary: string }
  | { type: "status"; status: "generating" | "awaiting_confirmation" | "committed" | "failed" | "cancelled" };

/** Diagnostics the loop reports to the server log / bench (never to the player). */
export type DmLoopObservation =
  | { type: "request_started"; operationId: string; request: number; requestBytes: number; cachedPrefixBytes: number;
      /** Size and content hash of each system layer: a changed hash in layers 1–3 breaks the cache. */
      layers: { bytes: number; hash: string }[] }
  | { type: "request_finished"; operationId: string; request: number; usage: DmLoopUsageEntry; stop: string }
  | { type: "tool_receipt"; operationId: string; receipt: DmLoopReceipt }
  | { type: "diagnostic"; operationId: string; diagnostic: DmLoopDiagnostic }
  | { type: "live"; operationId: string; event: DmLoopLiveEvent }
  /** The safe failure category plus the error's own message (never provider or SQL payloads). */
  | { type: "failure"; operationId: string; code: string; retryable: boolean; message: string; stack: string | null };
