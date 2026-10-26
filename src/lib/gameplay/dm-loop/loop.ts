// dm-loop-v1: the turn runtime in which the DM model writes free narration and
// changes state only through validated tools (docs/TURN_LOOP.md).
//
//   begin (durable literal input) → claim (lease, pinned source)
//   → request → stream text + tool calls → execute against the shadow state
//   → receipts (persisted at once) → checkpoint (transcript + shadow delta)
//   → next request … until the model stops (or finish_turn)
//   → one atomic commit: narration scene + collapsed changes + private patches.
//
// A failure resumes from the last checkpoint: recorded receipts are replayed,
// dice are never rolled twice. Only lease/fence/revision violations and broken
// transport fail the turn; a rejected tool call just returns its reason.
import { createHash, randomInt } from "node:crypto";
import { presentable, stripToolMarkup } from "./presentation.ts";
import type { JsonObject as JsonObjectValue, PublicTurn, ResumeInput, TurnInput } from "../contracts.ts";
import type { RecordedCheck, RuntimeSource, TurnClaim, TurnStore } from "../server-contracts.ts";
import type { MemoryStore, SummaryProvider } from "../../memory/server-contracts.ts";
import { withUnifiedMemory } from "../../memory/unified-context.ts";
import { isDisplayedCheck, recordServerRoll, stableGameplayId, withNatural } from "../dice.ts";
import { heroicInspiration, rerollsLeft, rollPauseAvailable } from "../reroll-allowance.ts";
import { requireClaimTimeline, requireTurnTimeline } from "../timeline.ts";
import { requireRule, safeTurnFailure, TurnError } from "../turn-errors.ts";
import { DmError } from "../dm-errors.ts";
import { compileToolset } from "../../server/dm/model/schema-compiler.ts";
import type { DmMessage, DmModel, DmModelRequest, DmToolCall } from "../../server/dm/model/contracts.ts";
import { DmModelError } from "../../server/dm/model/contracts.ts";
import { dmModelSpec, dmUsageCost } from "../../model-runtime/dm-models.ts";
import { buildCouncilContext, buildDmLoopContext, COUNCIL_TOOLS, instructionsRu, suspectedLiteralLeaks } from "./context.ts";
import { parseDmOptions } from "./options.ts";
import { NUDGES_RU } from "./roles-ru.ts";
import { declaresAction, untoldRollsMessage, visibleRolls, type RollCheckInput, type RollCheckResult } from "./roll-check.ts";
import { parseTimeCheckNote, timeCheckNote, timeWordsAgainstClock, TIME_CHECK_KEY } from "./time-words.ts";
import { advanceLedger, parseLedger, serializeLedger } from "./ledger.ts";
import { advanceMetrics, parseMetrics, serializeMetrics } from "./metrics.ts";
import { chooseDepth, EFFORT_ORDER, lowerEffort, parseDepthRange, parseDepthState, tensionSignals, type DepthRange } from "./depth.ts";
import { executeDmLoopTool, recordOrder, storyMinuteOf } from "./execute.ts";
import { chip } from "./receipt-text.ts";
import type { PublicProfile } from "../../persistence/contracts.ts";
import { dmLoopLimits as L, DM_LOOP_DEFAULT_LIMITS, turnCallCap } from "./limits.ts";
import { ShadowState } from "./shadow.ts";
import { dmLoopTools } from "./tools.ts";
import { DM_LOOP_RUNTIME, workOf, type DmLoopCheckpoint, type DmLoopLiveEvent, type DmLoopMeta, type DmLoopObservation,
  type DmLoopPin, type DmLoopReceipt, type DmLoopUsageEntry } from "./contracts.ts";

export { DM_LOOP_RUNTIME } from "./contracts.ts";

export type DmLoopDependencies = {
  /** Fix run B3 (item 60): the check that every roll the player saw is told (a cheap model; never fails the turn). */
  rollCheck?: (input: RollCheckInput) => Promise<RollCheckResult>;
  store: TurnStore;
  memory: MemoryStore;
  summaries: SummaryProvider;
  /** The model adapter for the pinned selection. */
  model: (pin: DmLoopPin) => DmModel;
  /** Resolve and pin the campaign's DM model — and, since stage 3, the
   * campaign's per-turn limits; since stage 4 the depth range and the
   * «important turn» flag — for this operation (read-first: a retry
   * returns the first pin even if the campaign settings changed). */
  pin: (claim: TurnClaim) => Promise<Pick<DmLoopPin, "providerId" | "modelId" | "effort" | "continuationEffort" | "limits"> &
    { depth?: DepthRange | null; boostNext?: boolean;
      /** Fix run A3: «Продолжение хода» — "lighter" runs the requests after a tool result one notch below the turn's depth. */
      continuation?: "same" | "lighter" }>;
  /** Stage 4 hooks after a commit (never block or fail the turn): the DM's
   * player-likes note, the used «important turn» flag. */
  afterCommit?: (event: { operationId: string; playerLikes: string | null; boostUsed: boolean;
    /** Fix run B2: the owner's standing out-of-game rule the DM recognised this turn (pinned as an owner fact). */
    ownerRule?: string | null;
    /** Fix run B2 (2): the turn ended a fight (its notes fold in the background). */
    combatEnded?: boolean;
    /** Fix S3-pre Part 3: the turn started a fight (its place's battle background is prepared in the background). */
    combatStarted?: boolean;
    /** Polish item 21: real minutes of play this turn stands for (1–30), for the campaign's play time. */
    playMinutes: number;
    /** Polish 3 §4: the turn's literal input and the runtime source it started from (the state before the turn), for the snapshot. */
    input?: TurnInput; source?: RuntimeSource;
    /** Voice stage part 5: the committed narration, for the asynchronous quotable-line check. */
    narration?: string }) => Promise<void>;
  random?: (min: number, max: number) => number;
  observe?: (observation: DmLoopObservation) => void;
  now?: () => number;
  /** Fix run A1: how often the lease is renewed while a request streams (tests shorten it). */
  heartbeatMs?: number;
};

export const dmLoopToolset = compileToolset(dmLoopTools);
/** Fix run A3 (item 75): the party council's tools — notes, time, the close. */
export const dmCouncilToolset = compileToolset(dmLoopTools.filter((tool) => (COUNCIL_TOOLS as readonly string[]).includes(tool.name)));
/** The council thinks at medium (or the range's base when it is lower). */
export const COUNCIL_EFFORT = "medium" as const;

/** Fix run A1 (items 32, 56, 73): both providers count thinking against the output limit, and a
 * scene-closing turn at high or xhigh hit the old 6000 + allowance cap three times in session 2 —
 * each time the whole turn was lost. The cap is now one ceiling for every depth
 * (`dmLoopLimits.maxOutputTokens`, 32 000: what the lease allowed at ~95 tokens a second before the
 * heartbeat landed); the narration stays bounded by the prompt and `maxNarrationChars`. */
export function dmOutputCap(): number {
  return L.maxOutputTokens;
}

/** Fix run A1: one model request writes nothing while it streams, so the claimant renews its lease
 * every minute meanwhile (migration 72, `lease_heartbeat`). A renewal that fails never stops the
 * request: the next fenced write (a receipt, a checkpoint, the commit) decides. */
export const LEASE_HEARTBEAT_MS = 60_000;
export function leaseHeartbeat(store: TurnStore, lease: TurnClaim["lease"], everyMs = LEASE_HEARTBEAT_MS): () => void {
  const renew = store.renewLease;
  if (typeof renew !== "function") return () => {};
  const timer = setInterval(() => { renew.call(store, lease).catch(() => { /* the fence decides at the next write */ }); }, everyMs);
  (timer as { unref?: () => void }).unref?.();
  return () => clearInterval(timer);
}

/** Fix run B2 (2): whether a turn's accepted records ended a fight. */
/** Item 44 (the owner's decision, the DM option «Броски спутников»): a displayed check pauses the turn for the
 * player's dice (fix S3-pre A-37: while a reroll or Heroic Inspiration is available) only when it is the hero's, or a companion's while the player rolls for
 * the companions; by default the DM rolls for them and their roll shows as a chip in place, without a pause. */
export function pausesForPlayer(source: RuntimeSource, check: RecordedCheck): boolean {
  const values = source.snapshot.settings.values;
  if (!isDisplayedCheck(source, check)) return false;
  const hero = source.snapshot.entities.find((row) => row.kind === "player");
  const heroRoll = check.actorId === hero?.id;
  if (!heroRoll && parseDmOptions(source.dmOptions).companionRolls !== "player") return false;
  // Fix S3-pre A-37 (the owner, 18:15): the pause holds only while a reroll or Heroic Inspiration is available.
  return rollPauseAvailable(rerollsLeft(values, source.runtime.turns, source.snapshot.publicState.current_session_id ?? null), heroicInspiration(hero), heroRoll);
}
/** Fix S3-pre 2: the hero of the turn's campaign (the «every roll told» check marks the hero's own rolls). */
export function heroIdOf(source: RuntimeSource): string | null {
  return source.snapshot.entities.find((row) => row.kind === "player" && row.campaign_id === source.snapshot.campaign.id)?.id ?? null;
}
/** Fix S3-pre 2: the player's line when it declares an action a roll may decide (a game turn; a council line never). */
export function declaredLine(input: { mode: string; input: string }): string {
  return input.mode === "game" && declaresAction(input.input) ? input.input : "";
}

const combatAction = (receipts: DmLoopReceipt[], action: string) => receipts.some((receipt) => receipt.call.name === "combat" && receipt.result.ok &&
  (typeof receipt.call.arguments === "object" && receipt.call.arguments !== null ? (receipt.call.arguments as { action?: unknown }).action === action : false));
export function combatEnded(receipts: DmLoopReceipt[]): boolean {
  return combatAction(receipts, "end");
}
export function combatStarted(receipts: DmLoopReceipt[]): boolean {
  return combatAction(receipts, "start");
}

/** Fix run A3: the limits past which a turn is named as expensive (the owner panel flags it too). */
export const EXPENSIVE_TURN = { costUsd: 1, requests: 4, outputTokens: 32_000 } as const;
/** A turn over $1, over four requests or over 32 000 output tokens, with what made it so: rolls that came
 * one request each instead of bundled, a long chain of continuations, deep thinking, a cut by the output
 * cap, rejected records sent back. Null for an ordinary turn. */
export function expensiveTurn(loop: Pick<DmLoopCheckpoint, "usage" | "requests" | "transcript" | "diagnostics" | "pin">): Extract<DmLoopCheckpoint["diagnostics"][number], { kind: "expensive_turn" }> | null {
  const costUsd = Number(loop.usage.reduce((sum, entry) => sum + entry.costUsd, 0).toFixed(4));
  const outputTokens = loop.usage.reduce((sum, entry) => sum + entry.outputTokens, 0);
  if (costUsd <= EXPENSIVE_TURN.costUsd && loop.requests <= EXPENSIVE_TURN.requests && outputTokens <= EXPENSIVE_TURN.outputTokens) return null;
  const causes: string[] = [];
  const rollOnly = loop.transcript.filter((m) => m.role === "assistant" && m.toolCalls.length > 0 && m.toolCalls.every((call) => call.name === "roll")).length;
  if (rollOnly >= 2) causes.push(`rolls not bundled: ${rollOnly} requests ended on rolls alone`);
  if (loop.requests > EXPENSIVE_TURN.requests) causes.push(`a long continuation chain: ${loop.requests} requests`);
  if (loop.pin && (loop.pin.effort === "xhigh" || loop.pin.effort === "max")) causes.push(`deep thinking (${loop.pin.effort})`);
  if (loop.diagnostics.some((row) => row.kind === "cut_continued")) causes.push("a request cut by the output cap");
  if (loop.diagnostics.some((row) => row.kind === "records_retry_asked")) causes.push("rejected records sent back");
  if (outputTokens > EXPENSIVE_TURN.outputTokens) causes.push(`${outputTokens} output tokens`);
  const inputTokens = loop.usage.reduce((sum, entry) => sum + entry.inputTokens, 0);
  const cacheRead = loop.usage.reduce((sum, entry) => sum + entry.cacheReadTokens, 0);
  if (inputTokens > 0 && cacheRead / inputTokens < 0.6) causes.push(`a low cache share (${(cacheRead / inputTokens).toFixed(2)})`);
  if (!causes.length) causes.push("a large context");
  return { kind: "expensive_turn", costUsd, requests: loop.requests, outputTokens, latencyMs: loop.usage.reduce((sum, entry) => sum + entry.latencyMs, 0), causes };
}

/** Fix run A1 (items 56, 73): what the loop sends after a request the output cap cut. The cut tool
 * call is dropped by the adapter (never sent to the provider again); the model continues once from
 * the complete part. */
/** Fix run A1: the request after a cut, refused by the provider (a stage A probe lost a fight turn on an HTTP 400
 * there): the cut message goes back once as plain text and calls, without its provider-native blocks (its thinking).
 * Returns whether it changed the transcript — only when the transcript ends with the cut note. */
export function plainCutMessage(transcript: DmMessage[], note: string): boolean {
  const last = transcript.at(-1);
  if (last?.role !== "user" || last.text !== note) return false;
  for (let at = transcript.length - 1; at >= 0; at--) {
    const message = transcript[at];
    if (message.role !== "assistant") continue;
    if (!message.native) return false;
    transcript[at] = { ...message, native: null };
    return true;
  }
  return false;
}
export const CUT_BY_CAP = "Your last message ran into the output limit and was cut off. Pick up exactly where it stopped — the text so far has already reached the player, so nothing needs repeating — bring the narration to its end, then send the final bookkeeping message with finish_turn. The limit is still close: spend little of it on thinking.";

const WRAP_UP = "The tool budget of this turn is used up. Finish the narration now with what was accepted; make no further tool calls.";

/** Tools that only record what the narration already said (the instructions'
 * "bookkeeping"); a call that decides an outcome is never among them. */
const BOOKKEEPING_TOOLS = new Set(["upsert_character", "upsert_place", "advance_time", "move_party", "rest",
  "note_character", "note_world", "holding"]);
const TIME_TOOLS = new Set(["advance_time", "move_party", "rest"]);

/** Stage 3 §4: GPT‑6 Astra at medium records its bookkeeping one call per
 * request and then spends a request of its own on `finish_turn`. The
 * instructions make time passing the last bookkeeping call, so a message of
 * accepted bookkeeping that closes with time passing — written after the
 * narration — is the turn's final message, and the loop folds the
 * `finish_turn` round into it. Any rejected call, any deciding call (a roll,
 * money, a transfer, a claim, combat) or a message without time keeps the
 * conversation open. */
export function foldsFinish(calls: DmToolCall[], receipts: DmLoopReceipt[]): boolean {
  if (!calls.length || !calls.some((call) => TIME_TOOLS.has(call.name))) return false;
  return calls.every((call) => {
    const receipt = receipts.find((row) => row.call.id === call.id);
    if (!receipt || !receipt.result.ok) return false;
    // Stage 4 §3: a time receipt that lists off-screen plans now due keeps the
    // conversation open, so the DM advances them in the same turn.
    if (TIME_TOOLS.has(call.name) && Array.isArray((receipt.result.value as { duePlans?: unknown }).duePlans)) return false;
    // Findings S3: so does a plan of this message that came due in its time passing (written first).
    if (call.name === "note_world" && (receipt.result.value as { cameDue?: unknown }).cameDue) return false;
    if (BOOKKEEPING_TOOLS.has(call.name)) return true;
    const action = receipt.call.arguments.action;
    if (call.name === "item") return action === "create";
    if (call.name === "quest") return action === "create" || action === "update" || action === "complete" || action === "fail";
    return false;
  });
}
const NARRATE_NOW = "The player has not seen any narration yet. Write the narration of this turn now, as text, in the campaign language, based on the accepted tool results. No more tool calls are needed.";

/** What goes between the text of one request and the next: nothing after a
 * dash (a sentence interrupted by a roll continues), a paragraph break after a
 * finished sentence, a space otherwise. The live stream emits the same. */
export function textSeparator(previous: string, next: string): string {
  if (!previous.trim() || !next.trim()) return "";
  const end = previous.replace(/\s+$/, "").at(-1) ?? "";
  // A sentence interrupted by a roll («…тянет ставню —» → «— и петля скрипит») continues on the same line.
  if (/[—–-]/.test(end)) return "";
  // A finished sentence followed by a line of dialogue («…не больше.» → «— Выстрелишь…»)
  // is a new paragraph: the speaker must be clear (polish item 23, turn 28).
  if (/[.!?…»"”)\]*_]/.test(end) || /\n$/.test(previous) || /^\s*\n/.test(next)) return "\n\n";
  return " ";
}

/** The text to append after `previous` for the next request's `next`: the
 * separator plus `next` without its leading whitespace (and without a second
 * dash when both sides carry one). */
export function continuation(previous: string, next: string): string {
  if (!next.trim()) return "";
  if (!previous.trim()) return next;
  const separator = textSeparator(previous, next);
  let body = next.replace(/^\s+/, "");
  if (separator === "" && /[—–-]$/.test(previous.replace(/\s+$/, "")) && /^[—–-]/.test(body)) body = body.replace(/^[—–-]\s*/, "");
  return separator + body;
}

export function joinText(previous: string, next: string): string {
  if (!next.trim()) return previous;
  if (!previous.trim()) return next;
  return `${previous.replace(/\s+$/, "")}${continuation(previous, next)}`;
}

/** Stage C (the turn on screen): where in the told text each accepted roll was made — the text of the assistant
 * messages up to the one that called it, joined the way the loop joins them. Computed from the transcript at the commit,
 * so a paused and continued turn keeps it; the saved turn shows each roll in its place. Receipt position → offset. */
export function rollTextOffsets(transcript: { role: string; text?: string; toolCalls?: { id: string }[] }[], receipts: DmLoopReceipt[]): Record<string, number> {
  const out: Record<string, number> = {};
  let text = "";
  for (const message of transcript) {
    if (message.role !== "assistant") continue;
    text = joinText(text, message.text ?? "");
    for (const call of message.toolCalls ?? []) {
      const receipt = receipts.find((row) => row.call.id === call.id);
      if (receipt && receipt.result.ok && receipt.call.name === "roll") out[String(receipt.position)] = text.length;
    }
  }
  return out;
}

function toolOutput(receipt: DmLoopReceipt, checks: RecordedCheck[]): string {
  const result = receipt.result;
  if (!result.ok) return JSON.stringify({ ok: false, reason: result.reason, ...(result.hint ? { hint: result.hint } : {}) });
  // A reroll (the player's allowed one) replaces the check after the receipt
  // was recorded; the model always sees the current dice.
  const check = result.check ? checks.find((row) => row.id === result.check!.id) ?? result.check : null;
  const value = check ? { ...result.value, dice: [...check.dice], kept: check.kept, total: check.total, success: check.success } : result.value;
  return JSON.stringify({ ok: true, ...value });
}

/** Tool results are re-rendered from receipts for every request. */
function renderedTranscript(loop: DmLoopCheckpoint, checks: RecordedCheck[]): DmMessage[] {
  return loop.transcript.map((message) => {
    if (message.role !== "tool_results") return message;
    return { role: "tool_results", results: message.results.map((entry) => {
      const receipt = loop.receipts.find((row) => row.call.id === entry.callId);
      return receipt ? { callId: entry.callId, output: toolOutput(receipt, checks), isError: !receipt.result.ok } : entry;
    }) };
  });
}

/** Turn metadata for a folded finish: no scene kinds, the characters this
 * turn introduced or updated in focus, no player moment. */
function implicitMeta(receipts: DmLoopReceipt[]): DmLoopMeta {
  const spotlight = receipts.flatMap((receipt) => {
    if (!receipt.result.ok || receipt.call.name !== "upsert_character") return [];
    const id = receipt.result.value.id;
    return typeof id === "string" ? [id] : [];
  });
  return { sceneKinds: [], spotlight: [...new Set(spotlight)], playerMoment: false, playerMomentReason: null };
}

/** Does the narration name this person? Russian names decline, so the match is
 * on a stem at a word start («Мокей» matches «Мокея», «Марта» matches «Марте»). */
export function narrationNames(narration: string, name: string): boolean {
  const words = name.split(/[^\p{L}\p{N}]+/u).filter((word) => word.length >= 2);
  if (!words.length) return false;
  const lower = narration.toLocaleLowerCase();
  return words.some((word) => {
    const w = word.toLocaleLowerCase();
    const stem = w.length >= 6 ? w.slice(0, -2) : w.length >= 4 ? w.slice(0, -1) : w;
    const escaped = stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^\\p{L}])${escaped}`, "u").test(lower);
  });
}

const PENDING_OUTCOME = "The player saw the roll but not what came of it. Narrate the outcome of that roll now, as text, in the campaign language, within the accepted result. Then finish the turn.";
/** Item 5: a model that stops after the narration without finish_turn loses the scene kinds, the
 * tension and the refusal hint; it is asked once for the closing bookkeeping. */
const FINISH_NOW = "The narration is complete but the turn is not closed. Send the final bookkeeping message now: the records the narration needs (people, places, items, notes, time) and finish_turn with sceneKinds, spotlight, nextTension and, when someone refused the hero, npcRefused. No more narration text.";
/** Polish 3 §3: a rejected call the server sends back for a retry — a record call whose fix is in the
 * reason (a field name, a reference, a kind, a currency name). A deciding call the state refused (money
 * the hero does not have, an item they do not hold, a claim already paid) is the story's business: the
 * model adapts the narration, as the role says, and is not asked to resend it. */
export function retriableRejection(call: { name: string; arguments: Record<string, unknown> }): boolean {
  if (BOOKKEEPING_TOOLS.has(call.name) || call.name === "quest" || call.name === "combat") return true;
  if (call.name === "item") return call.arguments.action === "create" || call.arguments.action === "modify";
  return false;
}
/** Polish 3 §3: the message that sends rejected bookkeeping calls back once with the server's reasons. */
export function rejectedCallsMessage(rejected: { name: string; reason: string }[]): string {
  return `The server rejected ${rejected.length === 1 ? "one call" : `${rejected.length} calls`} of your last message. Fix each as the reason says and resend them in your next message, then finish_turn again; no more narration text:\n` +
    rejected.map((row) => `- ${row.name}: ${row.reason}`).join("\n");
}

function parseArguments(call: DmToolCall): Record<string, unknown> {
  try {
    const parsed = JSON.parse(call.arguments || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export async function executeDmLoopTurn(claim: TurnClaim, deps: DmLoopDependencies, command: ResumeInput | null): Promise<PublicTurn> {
  const { store, memory } = deps;
  requireRule(typeof store.recordDmTool === "function");
  const recordDmTool = store.recordDmTool;
  const { source, lease } = claim;
  const input = claim.turn.input;
  const operationId = input.operationId;
  const checkpoint = structuredClone(claim.turn.checkpoint);
  const loop = checkpoint.dmLoop;
  const observe = deps.observe ?? (() => {});
  const live = (event: DmLoopLiveEvent) => observe({ type: "live", operationId, event });
  const now = deps.now ?? (() => performance.now());
  const random = deps.random ?? randomInt;
  try {
    requireRule(claim.runtimeIdentity === DM_LOOP_RUNTIME && loop && loop.schemaVersion === 1 &&
      (input.mode === "game" || input.mode === "companion") && input.expectedRevision === source.runtime.revision);
    // A campaign that was never configured for the old mechanics profile still
    // has a hero: the hero is controlled and present, nothing else is assumed.
    if (!source.runtime.configuration) {
      const hero = source.snapshot.entities.find((row) => row.kind === "player" && row.campaign_id === input.campaignId);
      requireRule(hero);
      source.runtime.configuration = { profile: "console-basic-v1", controlledEntityIds: [hero.id],
        presentEntityIds: [hero.id], nearbyStorageIds: [], safeLocationIds: [], itemRules: [] };
    }
    if (command?.action === "reroll") {
      const check = checkpoint.checks.find((row) => row.id === command.checkId && isDisplayedCheck(source, row));
      requireRule(check && source.snapshot.settings.values.difficulty.rerolls !== "disabled");
      // Fix S3-pre B-1: the rerolled die decides its own natural label and verdict (BG3).
      const replacement = withNatural(recordServerRoll(operationId, check, check.modifier, check.rollNumber + 1, random));
      checkpoint.checks = await store.reroll(lease, command, replacement);
      await store.checkpoint(lease, checkpoint, "awaiting_confirmation");
      return store.getPublic(input.campaignId, operationId);
    }
    if (command?.action === "continue") {
      requireRule(checkpoint.checks.some((row) => isDisplayedCheck(source, row)));
      await store.checkpoint(lease, checkpoint, "generating");
    }
    // A talk with a companion is an ordinary turn, but not in the middle of a fight.
    if (input.mode === "companion") {
      if (source.runtime.encounters.some((row) => row.status === "active")) throw new DmError("validation");
    }
    live({ type: "status", status: "generating" });
    if (!loop.pin) {
      const selected = await deps.pin(claim);
      // Depth per scene (stage 4 §7): the level of this turn inside the
      // campaign's range, from the server's signals and the DM's hint of the
      // previous turn, with hysteresis; stored with the pin, so a retry keeps it.
      const range = parseDepthRange(selected.depth ?? null);
      const lastLoopTurn = [...source.runtime.turns].reverse().find((turn) => turn.status === "committed" && turn.nextTension !== undefined && turn.id !== operationId);
      const signal = tensionSignals(source, input, lastLoopTurn?.nextTension ?? null);
      const chosen = chooseDepth(range, selected.effort, parseDepthState(source.privateState), signal, !!selected.boostNext);
      // Fix run A3: a council line thinks at medium (or lower when the range's base is lower), never deep.
      const councilEffort = EFFORT_ORDER.indexOf(range?.min ?? selected.effort) < EFFORT_ORDER.indexOf(COUNCIL_EFFORT) ? (range?.min ?? selected.effort) : COUNCIL_EFFORT;
      const depth = input.mode === "companion" ? { ...chosen, effort: councilEffort, reason: "a council line (light call)" } : chosen;
      // Fix run A3: a lighter continuation is one notch below this turn's depth (xhigh → high, high → medium).
      const continuationEffort = selected.continuation === "lighter" ? lowerEffort(depth.effort) : selected.continuationEffort;
      loop.pin = { providerId: selected.providerId, modelId: selected.modelId, effort: depth.effort,
        ...(continuationEffort && continuationEffort !== depth.effort ? { continuationEffort } : {}),
        ...(range && depth.effort !== selected.effort ? { baseEffort: selected.effort } : {}),
        runtime: DM_LOOP_RUNTIME, privacy: "single-narrator", limits: { ...(selected.limits ?? DM_LOOP_DEFAULT_LIMITS) },
        ...(range ? { depth: { min: range.min, max: range.max, tension: depth.tension, reason: depth.reason, boosted: !!selected.boostNext, streak: depth.streak } } : {}) };
      if (range) loop.diagnostics.push({ kind: "depth", effort: depth.effort, tension: depth.tension, reason: depth.reason });
    }
    const pin = loop.pin;
    // Operations pinned before stage 3 carry no limits: the defaults apply to them.
    const limits = pin.limits ?? DM_LOOP_DEFAULT_LIMITS;
    const spec = dmModelSpec(pin.providerId, pin.modelId);
    if (!spec) throw new DmError("configuration");
    const model = deps.model(pin);
    let informed: RuntimeSource = source;
    // Fix run A3: the council reads the scene and the last exchanges only — no memory retrieval.
    if (input.mode !== "companion") try {
      // Memory query rewriting (plan §11): explicit questions with the names of
      // the scene's participants, mentioned entities and the open journal.
      informed = await withUnifiedMemory(source, input, memory, true, buildDmLoopContext(source, input).memoryQuery);
    } catch (error) {
      if (error instanceof DmError && error.code === "conflict") throw error;
      informed = source; // An unavailable Memory index never blocks play; current state and Canon stay.
    }
    const narrationSceneId = stableGameplayId(operationId, "scene:narration");
    // Polish item 14: the first word is measured from the player's send (the durable begin), whatever request it comes in.
    const sentAt = Date.parse(claim.turn.public.created_at) || Date.now();
    const shadow = ShadowState.restore(source, operationId, loop.shadow);
    const council = input.mode === "companion";
    const context = council ? buildCouncilContext(informed, input) : buildDmLoopContext(informed, input);
    const language: "ru" | "en" = source.snapshot.settings.values.language === "ru" ? "ru" : "en";
    // Fix run B4: the server's nudges in the instructions' language (compared by text on a resume, so chosen once).
    const N = instructionsRu(source) ? { CUT_BY_CAP: NUDGES_RU.CUT_BY_CAP, WRAP_UP: NUDGES_RU.WRAP_UP, NARRATE_NOW: NUDGES_RU.NARRATE_NOW,
      PENDING_OUTCOME: NUDGES_RU.PENDING_OUTCOME, FINISH_NOW: NUDGES_RU.FINISH_NOW } : { CUT_BY_CAP, WRAP_UP, NARRATE_NOW, PENDING_OUTCOME, FINISH_NOW };
    const lastHint = [...source.runtime.turns].reverse().find((turn) => turn.status === "committed" && turn.nextTension !== undefined && turn.id !== operationId)?.nextTension ?? null;
    const turnTension = pin.depth?.tension ?? tensionSignals(source, input, lastHint).tension;
    const showDc = !!(source.snapshot.settings.values as { showDc?: boolean }).showDc;
    // Polish item 1: a displayed check whose outcome the model has not narrated
    // yet — on a resume, read from the transcript (text after the roll's results?).
    const outcomeAsked = () => loop.diagnostics.some((row) => row.kind === "outcome_asked");
    let outcomePending = (() => {
      const displayed = new Set(loop.receipts.filter((r) => r.result.ok && r.result.check && isDisplayedCheck(source, r.result.check)).map((r) => r.call.id));
      if (!displayed.size) return false;
      let last = -1;
      loop.transcript.forEach((message, index) => { if (message.role === "tool_results" && message.results.some((r) => displayed.has(r.callId))) last = index; });
      return last >= 0 && !loop.transcript.slice(last + 1).some((message) => message.role === "assistant" && message.text.trim());
    })();
    if (loop.transcript.length === 0) {
      loop.transcript.push({ role: "user", text: context.user });
      // Fix run A5 (item 85): every budget drop reaches the log with its layer (it was in the checkpoint only).
      for (const layer of context.layers)
        if (layer.dropped.length || layer.usedTokens > layer.budgetTokens) {
          const entry = { kind: "dossier_budget" as const, layer: layer.layer, budgetTokens: layer.budgetTokens, usedTokens: layer.usedTokens, dropped: layer.dropped };
          loop.diagnostics.push(entry);
          observe({ type: "diagnostic", operationId, diagnostic: entry });
        }
    }
    const persist = async (status: "generating" | "awaiting_confirmation") => {
      loop.shadow = shadow.delta();
      checkpoint.dmLoop = loop;
      await store.checkpoint(lease, checkpoint, status);
    };
    const diagnostic = (entry: DmLoopCheckpoint["diagnostics"][number]) => {
      loop.diagnostics.push(entry);
      observe({ type: "diagnostic", operationId, diagnostic: entry });
    };
    /** Execute the calls of one assistant message; recorded ones are replayed. */
    const executeCalls = async (calls: DmToolCall[]) => {
      let pause = false;
      // Stage C (item 53): the pause names what the DM does now (dice, records, a lookup) — kinds only.
      const work = workOf(calls.filter((call) => !loop.receipts.some((row) => row.call.id === call.id)).map((call) => call.name));
      if (work.length) live({ type: "working", tools: work });
      for (const call of recordOrder(calls)) {
        if (loop.receipts.some((row) => row.call.id === call.id)) continue;
        const toolCall = { id: call.id, name: call.name, arguments: parseArguments(call) as DmLoopReceipt["call"]["arguments"] };
        // Time passing is written first; the other calls keep the minute they had in the model's order.
        shadow.recordAt = storyMinuteOf(call, calls, loop.receipts, shadow.worldMinutes);
        const executed = executeDmLoopTool(shadow, toolCall, { input, checks: checkpoint.checks, random,
          narrationSceneId, toolCalls: loop.receipts.length, limits, language, tension: turnTension, receipts: loop.receipts, showDc });
        shadow.recordAt = null;
        const receipt = await recordDmTool(lease, loop.receipts.length, toolCall, executed.result);
        loop.receipts.push(receipt);
        if (executed.result.ok && executed.result.check) {
          checkpoint.checks.push(executed.result.check);
          const check = executed.result.check;
          if (pausesForPlayer(source, check)) pause = true;
          if (isDisplayedCheck(source, check)) outcomePending = true;
        }
        if (executed.meta) loop.meta = executed.meta;
        if (loop.receipts.length === limits.toolCallsPerTurn) diagnostic({ kind: "record_batch", calls: loop.receipts.length });
        if (loop.receipts.length === turnCallCap(limits)) diagnostic({ kind: "tool_cap_reached", calls: loop.receipts.length });
        observe({ type: "tool_receipt", operationId, receipt });
        // The player's stream carries only what the hero would notice, in the campaign language.
        if (receipt.result.ok && receipt.result.player)
          live({ type: "tool", name: call.name, ok: true, summary: receipt.result.player, ...(typeof toolCall.arguments.action === "string" ? { action: toolCall.arguments.action } : {}),
            ...(executed.counter ? { counter: executed.counter } : {}) });
        if (call.name === "finish_turn" && executed.meta?.playerMoment) live({ type: "moment", reason: executed.meta.playerMomentReason ?? null });
      }
      return pause;
    };
    // Fix run A1: the request after a cut by the output cap (one level lower), and the note that goes
    // after the results of a cut message's complete calls.
    let cutRecovery = loop.diagnostics.some((row) => row.kind === "cut_continued") && loop.transcript.at(-1)?.role === "user" &&
      (loop.transcript.at(-1) as { text?: string }).text === N.CUT_BY_CAP;
    let pendingCutNote = false;
    // Fix run B3 (item 60): the request loop runs again once when the check finds a roll the player saw untold.
    for (;;) {
      for (;;) {
        const last = loop.transcript.at(-1);
        if (last?.role === "assistant" && last.toolCalls.length &&
          last.toolCalls.some((call) => !loop.receipts.some((row) => row.call.id === call.id) ||
            !loop.transcript.some((m) => m.role === "tool_results" && m.results.some((r) => r.callId === call.id)))) {
          const pause = await executeCalls(last.toolCalls);
          loop.transcript.push({ role: "tool_results", results: last.toolCalls.map((call) => {
            const receipt = loop.receipts.find((row) => row.call.id === call.id)!;
            return { callId: call.id, output: toolOutput(receipt, checkpoint.checks), isError: !receipt.result.ok };
          }) });
          if (pendingCutNote) {
            pendingCutNote = false;
            shadow.finished = false;
            loop.transcript.push({ role: "user", text: N.CUT_BY_CAP });
          }
          // finish_turn ends the turn once narration exists; a model that calls it
          // before writing (Opus tends to put text last) is asked for the text.
          if (shadow.finished && !loop.text.trim()) {
            shadow.finished = false;
            loop.transcript.push({ role: "user", text: N.NARRATE_NOW });
          } else if (shadow.finished && outcomePending && !outcomeAsked()) {
            // Polish item 1: the turn ended on a roll with no narration after it; ask once for the outcome.
            shadow.finished = false;
            diagnostic({ kind: "outcome_asked" });
            loop.transcript.push({ role: "user", text: N.PENDING_OUTCOME });
          }
          // The OpenAI habit of a finish_turn round of its own is folded into the
          // final bookkeeping message (stage 3 §4); Opus batches finish_turn itself.
          if (!shadow.finished && !pause && pin.providerId === "openai" && loop.text.trim() && foldsFinish(last.toolCalls, loop.receipts)) {
            shadow.finished = true;
            loop.meta ??= implicitMeta(loop.receipts);
            diagnostic({ kind: "implicit_finish", calls: last.toolCalls.length });
          }
          // Polish 3 §3: every rejected record call of a message goes back once with the server's
          // reason (the bake-off's misses: a field name, a faction that does not exist, a clock as text).
          if (!pause && loop.text.trim() && !loop.diagnostics.some((row) => row.kind === "records_retry_asked") &&
            loop.requests < limits.modelRequestsPerTurn - 1 && loop.receipts.length < turnCallCap(limits)) {
            const rejected = last.toolCalls.flatMap((call) => {
              const receipt = loop.receipts.find((row) => row.call.id === call.id);
              return receipt && !receipt.result.ok && retriableRejection(receipt.call) ? [{ name: call.name, reason: receipt.result.reason }] : [];
            });
            if (rejected.length) {
              diagnostic({ kind: "records_retry_asked", calls: rejected.map((row) => row.name) });
              loop.transcript.push({ role: "user", text: rejectedCallsMessage(rejected) });
              shadow.finished = false;
            }
          }
          await persist(pause ? "awaiting_confirmation" : "generating");
          if (pause) {
            live({ type: "status", status: "awaiting_confirmation" });
            return store.getPublic(input.campaignId, operationId);
          }
          if (shadow.finished) break;
          continue;
        }
        if (shadow.finished) break;
        if (loop.requests >= limits.modelRequestsPerTurn) {
          diagnostic({ kind: "request_cap_reached", requests: loop.requests });
          await persist("generating"); // (the commit keeps the checkpoint as last persisted)
          break;
        }
        const lastRequest = loop.requests === limits.modelRequestsPerTurn - 1 || loop.receipts.length >= turnCallCap(limits);
        if (lastRequest && last?.role !== "user") loop.transcript.push({ role: "user", text: N.WRAP_UP });
        // Requests after the first (continuations after tool results) may run at
        // the pinned continuation effort (stage 2b §3).
        // Fix run A3: a request that answers «narrate the outcome» or «narrate now» thinks at the turn's own depth — on the
        // lighter continuation the stage A probe's fight twice answered it with a bare finish_turn, the rolls never told.
        const lastAsk = loop.transcript.at(-1);
        const narrationAsked = lastAsk?.role === "user" && (lastAsk.text === N.PENDING_OUTCOME || lastAsk.text === N.NARRATE_NOW);
        const planned = loop.requests > 0 && pin.continuationEffort && !narrationAsked ? pin.continuationEffort : pin.effort;
        // Fix run A1: the request after a cut thinks one level lower (the plan is made; long thinking cut it).
        const effort = cutRecovery ? lowerEffort(planned) : planned;
        // Cache-safe depth (stage 4 §7): on OpenAI the request-level effort stays the
        // campaign's configured level and the chosen one travels as an update item.
        const anchor = pin.providerId === "openai" && pin.baseEffort ? pin.baseEffort : pin.effort;
        const request: DmModelRequest = { system: context.system, messages: renderedTranscript(loop, checkpoint.checks),
          toolset: council ? dmCouncilToolset : dmLoopToolset, effort, ...(effort !== anchor ? { turnEffort: anchor } : {}),
          maxOutputTokens: dmOutputCap(), operationId, cacheKey: input.campaignId, cacheTurn: true };
        const requestBytes = new TextEncoder().encode(JSON.stringify(request.system) + JSON.stringify(request.messages)).length;
        observe({ type: "request_started", operationId, request: loop.requests + 1, requestBytes, cachedPrefixBytes: context.cachedPrefixBytes,
          layers: context.system.map((block, index) => ({ bytes: new TextEncoder().encode(block.text).length,
            hash: createHash("sha256").update(block.text).digest("hex").slice(0, 12),
            tokens: context.layers[index]?.usedTokens ?? 0, budgetTokens: context.layers[index]?.budgetTokens ?? 0 })) });
        const started = now();
        let firstTextMs: number | null = null;
        let firstWordMs: number | null = null;
        let roundText = "";
        // A text part that follows a tool call inside the same message is joined
        // like the text of a new request: a paragraph break after a finished
        // sentence, nothing after an interrupted one (polish, item 23 and the Мокей turn).
        let partStart = true;
        const toolCalls: DmToolCall[] = [];
        let usage: DmLoopUsageEntry | null = null;
        let stop: Extract<Awaited<ReturnType<DmModel["stream"]>> extends AsyncIterable<infer E> ? E : never, { type: "stop" }> | null = null;
        const stopHeartbeat = leaseHeartbeat(store, lease, deps.heartbeatMs);
        try {
          // FIX_S4 11o: a tool call written as text never reaches the story.
          for await (const event of presentable(model.stream(request))) {
            if (event.type === "text_delta") {
              if (firstTextMs === null) firstTextMs = Math.round(now() - started);
              if (firstWordMs === null && event.text.trim() && !loop.text.trim() && !roundText.trim() &&
                !loop.usage.some((entry) => entry.firstWordMs != null)) firstWordMs = Math.max(0, Date.now() - sentAt);
              if (event.text.trim()) outcomePending = false;
              // The live stream gets exactly what the saved narration will have
              // between this request's text and the previous one (joinText).
              if (partStart && roundText.trim()) {
                const piece = continuation(roundText, event.text);
                roundText += piece;
                if (piece.trim()) partStart = false;
                if (piece) live({ type: "text", text: piece });
              } else {
                const fresh = !roundText.trim();
                roundText += event.text;
                const piece = fresh ? continuation(loop.text, roundText) : event.text;
                if (piece.trim()) partStart = false;
                if (piece) live({ type: "text", text: piece });
              }
            } else if (event.type === "tool_call") {
              partStart = true;
              toolCalls.push({ id: event.id, name: event.name, arguments: event.arguments });
            } else if (event.type === "usage") {
              usage = { providerId: pin.providerId, modelId: pin.modelId, effort, ...event.usage,
                costUsd: dmUsageCost(spec, event.usage), latencyMs: 0, firstTextMs, requestBytes, toolCalls: 0 };
            } else if (event.type === "stop") {
              stop = event;
            }
          }
        } catch (error) {
          if (error instanceof DmModelError) {
            // Fix run A1 (item 32c): the provider's own reason (secrets filtered by the adapter) reaches the log.
            diagnostic({ kind: "provider_error", errorKind: error.kind, httpStatus: error.detail.httpStatus ?? null,
              providerCode: error.detail.providerCode ?? null, message: error.message.slice(0, 300) });
            if (error.kind === "not_configured") throw new DmError("configuration");
            if (error.kind === "provider_rejected" && cutRecovery && !loop.diagnostics.some((row) => row.kind === "cut_plain_retry") &&
              plainCutMessage(loop.transcript, N.CUT_BY_CAP)) {
              diagnostic({ kind: "cut_plain_retry" });
              await persist("generating");
              continue;
            }
            if (error.kind === "provider_rejected" || error.kind === "fatal") throw new DmError("provider", false);
            throw new DmError("provider", true);
          }
          throw new DmError("provider", true);
        } finally {
          stopHeartbeat();
        }
        requireRule(stop);
        const entry: DmLoopUsageEntry = { ...(usage ?? { providerId: pin.providerId, modelId: pin.modelId, effort,
          inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, reasoningTokens: null, costUsd: 0,
          firstTextMs, requestBytes }), latencyMs: Math.round(now() - started), toolCalls: toolCalls.length, firstTextMs, firstWordMs };
        loop.usage.push(entry);
        loop.requests++;
        observe({ type: "request_finished", operationId, request: loop.requests, usage: entry, stop: stop.reason });
        cutRecovery = false;
        const cut = stop.reason === "max_tokens";
        // A request the cap cut before it wrote anything leaves no assistant message (an empty one is invalid).
        if (roundText.trim() || toolCalls.length) loop.transcript.push({ role: "assistant", text: roundText, toolCalls, native: stop.native });
        loop.text = joinText(loop.text, roundText);
        await persist("generating");
        if (stop.reason === "refusal") { diagnostic({ kind: "model_refusal", providerReason: stop.providerReason }); break; }
        if (cut) {
          diagnostic({ kind: "max_tokens", outputTokens: entry.outputTokens });
          // Fix run A1 (items 32, 56, 73): a cut never fails the turn. Once per turn the model continues from
          // the complete part (after the results of its complete calls, when it made any), one level lower.
          if (!loop.diagnostics.some((row) => row.kind === "cut_continued") && loop.requests < limits.modelRequestsPerTurn) {
            diagnostic({ kind: "cut_continued", toolCalls: toolCalls.length });
            cutRecovery = true;
            if (!toolCalls.length) {
              loop.transcript.push({ role: "user", text: N.CUT_BY_CAP });
              await persist("generating");
              continue;
            }
            pendingCutNote = true;
          }
        }
        if (!toolCalls.length) {
          if (outcomePending && !outcomeAsked() && loop.requests < limits.modelRequestsPerTurn) {
            diagnostic({ kind: "outcome_asked" });
            loop.transcript.push({ role: "user", text: N.PENDING_OUTCOME });
            await persist("generating");
            continue;
          }
          // Only a turn that made no tool call at all (the whole answer was text) is asked; a turn
          // with bookkeeping keeps its implicit close (spotlight from the receipts), as before.
          if (!shadow.finished && !loop.receipts.length && loop.text.trim() && stop.reason !== "max_tokens" && loop.requests < limits.modelRequestsPerTurn &&
            !loop.diagnostics.some((row) => row.kind === "finish_asked")) {
            diagnostic({ kind: "finish_asked" });
            loop.transcript.push({ role: "user", text: N.FINISH_NOW });
            await persist("generating");
            continue;
          }
          break;
        }
      }
      if (!deps.rollCheck || loop.diagnostics.some((row) => row.kind === "rolls_checked") || loop.requests >= limits.modelRequestsPerTurn || !loop.text.trim()) break;
      // Fix S3-pre 2: the fight's attack cards count; the hero's own rolls are marked; the player's declared actions are read.
      const rolls = visibleRolls(loop.receipts, heroIdOf(source));
      const declared = declaredLine(input);
      if (!rolls.length && !declared) break;
      const check = await deps.rollCheck({ narration: loop.text, rolls: rolls.map((roll) => roll.line), language, ...(declared ? { playerInput: declared } : {}),
        heroRolls: rolls.flatMap((roll, index) => (roll.hero ? [index + 1] : [])) })
        .catch((error: unknown): RollCheckResult => ({ untold: [], undeclared: [], costUsdMicros: 0, error: String((error as Error)?.message ?? error).slice(0, 120) }));
      const undeclared = check.undeclared ?? [];
      diagnostic({ kind: "rolls_checked", rolls: rolls.length, untold: check.untold.length, undeclared: undeclared.length, costUsd: check.costUsdMicros / 1_000_000, error: check.error });
      if (!check.untold.length && !undeclared.length) { await persist("generating"); break; }
      loop.transcript.push({ role: "user", text: untoldRollsMessage(instructionsRu(source) ? "ru" : "en", check.untold.map((n) => rolls[n - 1].line), "dm", undeclared) });
      shadow.finished = false;
      await persist("generating");
    }
    let narration = stripToolMarkup(loop.text).trim();
    if (!narration) {
      diagnostic({ kind: "empty_narration" });
      await persist("generating");
      throw new DmError("provider", true);
    }
    if (narration.length > L.maxNarrationChars) narration = `${narration.slice(0, L.maxNarrationChars - 1)}…`;
    const leakCheck = suspectedLiteralLeaks(informed, input, narration);
    for (const leak of leakCheck.leaks) diagnostic({ kind: "suspected_leak", detail: leak });
    for (const detail of leakCheck.selfDisclosures) diagnostic({ kind: "self_disclosure", detail });
    // Stage 4 bookkeeping of the server: the attention ledger, the resistance
    // metrics and the depth state are private facts the commit carries.
    const controlledIds = new Set(shadow.runtime.configuration?.controlledEntityIds ?? []);
    const companionIds = shadow.snapshot.entities.filter((row) => row.kind === "companion" && controlledIds.has(row.id)).map((row) => row.id);
    const openThreadIds = shadow.snapshot.quests.filter((row) => row.status === "open").map((row) => row.id);
    const ledger = advanceLedger(parseLedger(source.privateState), { sessionId: shadow.snapshot.publicState.current_session_id ?? null,
      companionIds, openThreadIds, spotlight: loop.meta?.spotlight ?? [], threads: loop.meta?.threads ?? [] });
    shadow.setPrivate("fact", "ledger", serializeLedger(ledger));
    const partyNames = new Set(shadow.snapshot.entities.filter((row) => row.kind === "player" || controlledIds.has(row.id)).map((row) => row.name));
    const metrics = advanceMetrics(parseMetrics(source.privateState), loop.receipts, loop.meta, partyNames,
      shadow.snapshot.entities.filter((row) => row.kind === "player" || controlledIds.has(row.id)).map((row) => ({ hp: row.hp, maxHp: row.max_hp })));
    shadow.setPrivate("fact", "metrics", serializeMetrics(metrics.metrics));
    if (pin.depth) shadow.setPrivate("fact", "depth_state", JSON.stringify({ tension: pin.depth.tension, effort: pin.effort, streak: pin.depth.streak ?? 0 }));
    // Polish 3 §7: the time words against the clock the turn started at; a mismatch is one line in the next turn's tail.
    const timeNote = timeCheckNote(operationId, timeWordsAgainstClock(narration, source.runtime.worldMinutes));
    if (timeNote) { shadow.setPrivate("fact", TIME_CHECK_KEY, timeNote); diagnostic({ kind: "time_words", detail: timeNote }); }
    else if (parseTimeCheckNote(source.privateState)) shadow.setPrivate("fact", TIME_CHECK_KEY, "");
    // Polish (the Мокей turn): a person recorded ahead of the story stays out of
    // the player's chips and codex until the narration names them or they are
    // present; people met this turn get their chip now.
    // (The receipts are already persisted and the commit compares them, so the
    // people's chips travel in the turn's meta, never in a receipt.)
    const present = new Set(shadow.runtime.configuration?.presentEntityIds ?? []);
    const met: NonNullable<DmLoopMeta["met"]> = [];
    const createdIds = new Set(loop.receipts.flatMap((receipt) =>
      receipt.result.ok && receipt.call.name === "upsert_character" && receipt.result.value.created === true ? [String(receipt.result.value.id)] : []));
    for (const entity of shadow.snapshot.entities) {
      if (entity.campaign_id !== shadow.campaignId || entity.kind === "faction" || entity.kind === "player") continue;
      const created = createdIds.has(entity.id);
      if (!created && !entity.public_profile?.unmet) continue;
      const known = present.has(entity.id) || controlledIds.has(entity.id) || narrationNames(narration, entity.name);
      if (known) {
        if (entity.public_profile?.unmet) {
          const { unmet: _unmet, ...rest } = entity.public_profile;
          void _unmet;
          shadow.apply({ family: "entities", id: entity.id, expectedRevision: entity.revision, values: { public_profile: rest as unknown as JsonObjectValue } });
        }
        met.push({ id: entity.id, name: entity.name, player: chip.person(language, entity.kind, entity.name) });
      } else if (created) {
        const profile: PublicProfile = { ...(entity.public_profile ?? {}), unmet: true };
        shadow.apply({ family: "entities", id: entity.id, expectedRevision: entity.revision, values: { public_profile: profile as unknown as JsonObjectValue } });
      }
    }
    if (met.length) {
      loop.meta = { ...(loop.meta ?? implicitMeta(loop.receipts)), met };
      for (const person of met) live({ type: "tool", name: "meet", ok: true, summary: person.player });
    }
    const textAt = rollTextOffsets(loop.transcript, loop.receipts);
    if (Object.keys(textAt).length) loop.meta = { ...(loop.meta ?? implicitMeta(loop.receipts)), textAt };
    // Fix run A3 (owner: «ход за 2,5 доллара — это треш»): a turn over $1, over four requests or over 32 000
    // output tokens is named with its cause in the log and the report.
    const expensive = expensiveTurn(loop);
    if (expensive) diagnostic(expensive);
    // The commit keeps the checkpoint as last persisted: the leak diagnostics and the people met must be in it.
    if (met.length || expensive || Object.keys(textAt).length || loop.diagnostics.some((row) => row.kind === "suspected_leak" || row.kind === "self_disclosure" || row.kind === "time_words")) await persist("generating");
    const result = await store.commit(lease, {
      narration, visualDescription: "",
      resolution: { changes: shadow.orderedChanges(), worldMinutes: shadow.worldMinutes,
        configuration: shadow.runtime.configuration, outcomes: [] },
      privatePatches: shadow.privatePatches, checks: checkpoint.checks, guidanceProposal: null,
      dmLoop: { receipts: loop.receipts, meta: loop.meta, usage: loop.usage, requests: loop.requests },
    });
    live({ type: "status", status: result.status === "committed" ? "committed" : "failed" });
    if (result.status === "committed") {
      const inputTokens = loop.usage.reduce((sum, entry) => sum + entry.inputTokens, 0);
      observe({ type: "turn_finished", operationId, effort: pin.effort, depthReason: pin.depth?.reason ?? null,
        firstWordMs: loop.usage.find((entry) => entry.firstWordMs != null)?.firstWordMs ?? null,
        turnMs: Math.max(0, Date.now() - sentAt), requests: loop.requests,
        cacheReadShare: inputTokens > 0 ? Number((loop.usage.reduce((sum, entry) => sum + entry.cacheReadTokens, 0) / inputTokens).toFixed(3)) : null,
        costUsd: Number(loop.usage.reduce((sum, entry) => sum + entry.costUsd, 0).toFixed(5)), toolCalls: loop.receipts.length });
    }
    if (result.status === "committed" && deps.afterCommit) {
      // Real minutes this turn stands for: since the previous committed turn, at most 30 (a pause is not play).
      const previous = source.runtime.turns.filter((turn) => turn.status === "committed" && turn.id !== operationId)
        .map((turn) => Date.parse(turn.updated_at)).filter((ms) => Number.isFinite(ms));
      const since = previous.length ? Math.max(...previous) : Date.parse(claim.turn.public.created_at) || Date.now();
      const playMinutes = Math.max(1, Math.min(30, Math.round((Date.now() - since) / 60000)));
      try { await deps.afterCommit({ operationId, playerLikes: loop.meta?.playerLikes ?? null, ownerRule: loop.meta?.ownerRule ?? null, combatEnded: combatEnded(loop.receipts), combatStarted: combatStarted(loop.receipts), boostUsed: !!pin.depth?.boosted, playMinutes, input, source: claim.source, narration }); }
      catch { /* a note or a flag never fails a committed turn */ }
    }
    return result;
  } catch (error) {
    const safe = safeTurnFailure(error);
    observe({ type: "failure", operationId, code: safe.code, retryable: safe.retryable,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error && error.stack ? error.stack.split("\n").slice(0, 4).join("\n") : null });
    live({ type: "status", status: "failed" });
    try { return await store.fail(lease, safe.code, safe.retryable); }
    catch { throw new TurnError(safe.code, safe.retryable); }
  }
}
const execute = executeDmLoopTurn;

export async function runDmLoopTurn(input: TurnInput, deps: DmLoopDependencies): Promise<PublicTurn> {
  const current = requireTurnTimeline(await deps.store.begin(input, DM_LOOP_RUNTIME), input.campaignId, input.operationId, input.timeline);
  if (["committed", "cancelled", "awaiting_confirmation"].includes(current.status) ||
    (current.status === "failed" && !current.canRetry)) return current;
  const claim = await deps.store.claim(input.campaignId, input.operationId);
  if (claim) requireClaimTimeline(claim, input.campaignId, input.operationId, input.timeline);
  return requireTurnTimeline(claim ? await execute(claim, deps, null)
    : await deps.store.getPublic(input.campaignId, input.operationId), input.campaignId, input.operationId, input.timeline);
}

/** May a retry command claim this turn? A failed turn when the server offers a retry; a pending or
 * generating one always, because the claim decides: a live lease returns the turn unchanged, an
 * expired one (its claimant went silent — the public turn then shows `canRetry`) is taken over
 * and resumed from the last checkpoint. */
export function retryClaimable(turn: PublicTurn): boolean {
  return turn.status === "failed" ? turn.canRetry : turn.status === "pending" || turn.status === "generating";
}

export async function resumeDmLoopTurn(command: ResumeInput, deps: DmLoopDependencies): Promise<PublicTurn> {
  const current = requireTurnTimeline(await deps.store.getPublic(command.campaignId, command.operationId),
    command.campaignId, command.operationId, command.timeline);
  if (["committed", "cancelled"].includes(current.status)) return current;
  if (command.action === "cancel") return deps.store.cancel(command);
  requireRule(command.action === "retry" ? retryClaimable(current) : current.status === "awaiting_confirmation");
  const claim = await deps.store.claim(command.campaignId, command.operationId);
  if (claim) requireClaimTimeline(claim, command.campaignId, command.operationId, command.timeline);
  return requireTurnTimeline(claim ? await execute(claim, deps, command)
    : await deps.store.getPublic(command.campaignId, command.operationId), command.campaignId, command.operationId, command.timeline);
}
