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
  | { ok: true; value: JsonObject; summary: string; check: RecordedCheck | null;
      /** The player's line in the campaign language (polish item 19); null when
       * the hero would not notice (private rolls, DM notes, lookups). Absent on
       * receipts recorded before the polish stage. */
      player?: string | null }
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
  /** The campaign's configured effort when depth per scene (stage 4 §7) chose
   * another level for this turn. OpenAI keeps it as the request-level value
   * (part of the cached prefix) and asks for `effort` through a
   * configuration_update item, so a change of depth never restarts the cache;
   * Anthropic sends the chosen level directly (measured cache-safe on Opus 5.5). */
  baseEffort?: DmEffort;
  runtime: DmLoopRuntimeId;
  /** One narrator sees secrets and Character Models. Two-stage is a later option. */
  privacy: "single-narrator";
  /** The campaign's per-turn limits at the moment the turn started (stage 3).
   * Validation reads them from here, never from the live settings; a retry
   * keeps them. Absent on operations pinned before stage 3 (defaults apply). */
  limits?: DmLoopTurnLimits;
  /** Stage 4 depth per scene: the campaign's range, the tension class this
   * turn was judged at and why. `effort` above is the level chosen inside the range. */
  depth?: { min: DmEffort; max: DmEffort; tension: DmLoopTension; reason: string; boosted: boolean;
    /** Tense turns in a row counting this one (session 2 prep: at most three deep ones; a calm turn or a climax resets it). */
    streak?: number };
  /** Polish 3 §2: the bookkeeper of a split turn (the writer is the pin itself), fixed at the
   * turn's start so a retry keeps the pair; absent on a single-loop turn. */
  bookkeeper?: { providerId: DmProviderId; modelId: string; effort: DmEffort };
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
  /** Polish 2 §4: the part of the cache writes at the one-hour rate (Anthropic reports it). */
  cacheWrite1hTokens?: number;
  reasoningTokens: number | null;
  costUsd: number;
  latencyMs: number;
  /** Time to the first narration character of this request, if any text came. */
  firstTextMs: number | null;
  /** Polish item 14: time from the player's send (the durable begin) to the first
   * visible narration character of the whole turn, on the request where it came. */
  firstWordMs?: number | null;
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
  | { kind: "implicit_finish"; calls: number }
  /** Stage 4: the dossier layers against their token budgets. */
  | { kind: "dossier_budget"; layer: number; budgetTokens: number; usedTokens: number; dropped: string[] }
  /** Stage 4: the depth chosen for this turn inside the campaign's range. */
  | { kind: "depth"; effort: DmEffort; tension: DmLoopTension; reason: string }
  /** Stage 4: an NPC revealed their own information in character (not a DM leak). */
  | { kind: "self_disclosure"; detail: string }
  /** Polish item 1: the model ended on a player-visible roll with no text after
   * it; the loop asked once for the narration of the outcome. */
  | { kind: "outcome_asked" }
  /** Polish group 7 (item 5): the model stopped after narration without finish_turn and was asked once. */
  | { kind: "finish_asked" }
  /** Polish 3 §2: the writer closed without a ledger and was asked once for it. */
  | { kind: "ledger_asked" }
  /** Polish 3 §2: the writer's ledger was longer than the budget and was clipped. */
  | { kind: "ledger_clipped"; chars: number }
  /** Polish 3 §2: a retryable transport failure of the writer's continuation was retried once. */
  | { kind: "writer_retried"; request: number }
  /** Polish 3 §3: rejected record calls were sent back with their reasons for one retry. */
  | { kind: "records_retry_asked"; calls: string[] }
  /** Polish 3 §7: the narration's time-of-day words disagreed with the clock (the note the next turn's tail shows). */
  | { kind: "time_words"; detail: string }
  /** Fix run A1 (items 32, 56, 73): the request after a cut by the output cap continues the turn once. */
  | { kind: "cut_continued"; toolCalls: number }
  /** Fix run A6: the ledger checker's pass (the events without a record it found) and what stayed unrecorded. */
  | { kind: "cut_plain_retry" }
  | { kind: "ledger_checked"; misses: string[]; costUsd: number; error: string | null }
  | { kind: "ledger_unrecorded"; chips: string[] }
  /** Fix run A3: a turn over $1, over four requests or over 32 000 output tokens, with its causes. */
  | { kind: "expensive_turn"; costUsd: number; requests: number; outputTokens: number; latencyMs: number; causes: string[] }
  /** Fix run A1 (item 32c): the provider's own error (kind, HTTP status, code, the message with secrets filtered). */
  | { kind: "provider_error"; errorKind: string; httpStatus: number | null; providerCode: string | null; message: string };

export type DmLoopSceneKind = "combat" | "conversation" | "mystery" | "exploration" | "quiet" |
  "humor" | "trade" | "travel" | "other";

export type DmLoopTension = "calm" | "tense" | "climax";
export type DmLoopMeta = {
  sceneKinds: DmLoopSceneKind[];
  /** Entity IDs whose story this turn touched (attention accounting, plan §10.4). */
  spotlight: string[];
  /** "How do you want to do this?" — the next player input narrates the decisive moment.
   * Accepted by the server only after a successful player-visible check in a
   * tense or climactic scene (polish, «Твой момент»). */
  playerMoment: boolean;
  /** The moment in words for the banner («Ворот Мокея»): the accepted roll's reason. */
  playerMomentReason?: string | null;
  /** People the hero met this turn who were recorded ahead of the story: their
   * chip lines (the receipt that created them stayed silent). */
  met?: { id: string; name: string; player: string }[];
  /** The DM's hint about the next turn's tension (depth per scene, plan §8б). Absent before Stage 4. */
  nextTension?: DmLoopTension | null;
  /** Quest/thread/debt/promise IDs this turn touched (attention ledger). */
  threads?: string[];
  /** A new "what the player enjoys" note, when the DM wrote one (UI_DATA_NEEDS #19). */
  playerLikes?: string | null;
  /** Self-reported: an NPC refused the hero this turn (the one model-reported metric of §6). */
  npcRefused?: boolean;
  /** Fix run B2: an owner's standing out-of-game rule from this turn's input, pinned after the commit. */
  ownerRule?: string | null;
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
  /** An accepted call the hero would notice: `summary` is the player's line in
   * the campaign language; `action` the tool's action when it has one. */
  | { type: "tool"; name: string; ok: boolean; summary: string; action?: string }
  /** finish_turn handed the decisive description to the player (server-checked). */
  | { type: "moment"; reason: string | null }
  /** `recording` (polish 3 §2): the writer's text is complete and the bookkeeper records; the
   * turn is still running and its stream stays open until the commit. */
  | { type: "status"; status: "generating" | "recording" | "awaiting_confirmation" | "committed" | "failed" | "cancelled" };

/** Diagnostics the loop reports to the server log / bench (never to the player). */
export type DmLoopObservation =
  | { type: "request_started"; operationId: string; request: number; requestBytes: number; cachedPrefixBytes: number;
      /** Size and content hash of each system layer: a changed hash in layers 1–3 breaks the cache.
       * Stage 4 adds the estimated tokens and the layer's budget. */
      layers: { bytes: number; hash: string; tokens?: number; budgetTokens?: number }[] }
  | { type: "request_finished"; operationId: string; request: number; usage: DmLoopUsageEntry; stop: string }
  /** Polish item 14: one line per committed turn for the sandbox log — the depth
   * and why, the first word from the player's send, the full turn, requests,
   * the cache read share and the cost (to tell deep thinking from tool rounds or cache misses). */
  | { type: "turn_finished"; operationId: string; effort: DmEffort; depthReason: string | null; firstWordMs: number | null;
      turnMs: number; requests: number; cacheReadShare: number | null; costUsd: number; toolCalls: number }
  | { type: "tool_receipt"; operationId: string; receipt: DmLoopReceipt }
  | { type: "diagnostic"; operationId: string; diagnostic: DmLoopDiagnostic }
  | { type: "live"; operationId: string; event: DmLoopLiveEvent }
  /** The safe failure category plus the error's own message (never provider or SQL payloads). */
  | { type: "failure"; operationId: string; code: string; retryable: boolean; message: string; stack: string | null };
