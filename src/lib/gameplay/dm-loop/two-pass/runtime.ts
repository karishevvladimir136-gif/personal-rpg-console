// The writer + bookkeeper turn runtime (polish 3 §2, from the bake-off of
// docs/stages/DM_ARCH.md, variants C and D): the same durable turn as dm-loop-v1
// (begin → claim → checkpoints → one atomic commit, the same store, the same tools
// and validators), played in two passes by two models:
//
//   writer     — the full dossier with the writer role, the player's input, the roll
//                tool only; streams the narration and closes with a private <ledger>;
//   bookkeeper — its own role, the dossier's living part, tail and «now», the
//                narration, the ledger and the rolls; makes every record with
//                today's tools and finish_turn. The narration is canon.
//
// The turn row is a dm-loop-v1 turn (the store, the SQL and the player's screen see
// no difference); the pin carries the bookkeeper, the bookkeeper's conversation
// follows the writer's in the one transcript after a marker message. A campaign
// chooses the split in its DM settings (`split`); `runCampaignTurn` dispatches a
// turn to this runtime or to the default loop by the campaign's choice, and a
// resume by the turn's own pin.
import { createHash } from "node:crypto";
import type { JsonObject as JsonObjectValue, PublicTurn, ResumeInput, TurnInput } from "../../contracts.ts";
import type { RecordedCheck, RuntimeSource, TurnClaim } from "../../server-contracts.ts";
import { withUnifiedMemory } from "../../../memory/unified-context.ts";
import { isDisplayedCheck, recordServerRoll, stableGameplayId, withNatural } from "../../dice.ts";
import { requireClaimTimeline, requireTurnTimeline } from "../../timeline.ts";
import { requireRule, safeTurnFailure, TurnError } from "../../turn-errors.ts";
import { DmError } from "../../dm-errors.ts";
import { compileToolset } from "../../../server/dm/model/schema-compiler.ts";
import type { DmEffort, DmMessage, DmModel, DmModelRequest, DmProviderId, DmToolCall } from "../../../server/dm/model/contracts.ts";
import { DmModelError } from "../../../server/dm/model/contracts.ts";
import { dmModelSpec, dmUsageCost } from "../../../model-runtime/dm-models.ts";
import { buildDmLoopContext, instructionsRu, suspectedLiteralLeaks } from "../context.ts";
import { NUDGES_RU } from "../roles-ru.ts";
import { untoldRollsMessage, visibleRolls, type RollCheckResult } from "../roll-check.ts";
import { advanceLedger, parseLedger, serializeLedger } from "../ledger.ts";
import { advanceMetrics, parseMetrics, serializeMetrics } from "../metrics.ts";
import { chooseDepth, lowerEffort, parseDepthRange, parseDepthState, tensionSignals } from "../depth.ts";
import { ledgerCheckState, ledgerChip, ledgerCorrectionMessage, type LedgerCheckResult, type LedgerCheckState } from "../ledger-check.ts";
import { executeDmLoopTool } from "../execute.ts";
import { chip } from "../receipt-text.ts";
import type { PublicProfile } from "../../../persistence/contracts.ts";
import { dmLoopLimits as L, DM_LOOP_DEFAULT_LIMITS } from "../limits.ts";
import { ShadowState } from "../shadow.ts";
import { dmLoopTools } from "../tools.ts";
import type { DmSplit } from "../settings.ts";
import { DM_LOOP_RUNTIME, workOf, type DmLoopCheckpoint, type DmLoopLiveEvent, type DmLoopMeta, type DmLoopObservation,
  type DmLoopPin, type DmLoopReceipt, type DmLoopUsageEntry } from "../contracts.ts";
import { combatEnded, combatStarted, continuation, declaredLine, dmOutputCap, executeDmLoopTurn, heroIdOf, joinText, leaseHeartbeat, narrationNames, pausesForPlayer, plainCutMessage, retriableRejection, retryClaimable, rollTextOffsets, type DmLoopDependencies } from "../loop.ts";

/** Fix run A6: what the writer is sent after a request the output cap cut (the loop's CUT_BY_CAP, with the ledger). */
export const WRITER_CUT_BY_CAP = "Your last message was cut off by the output limit. Continue exactly where it stopped — do not repeat what is already written — finish the narration briefly, then close with the ledger. Keep your thinking short.";
import { parseTimeCheckNote, timeCheckNote, timeWordsAgainstClock, TIME_CHECK_KEY } from "../time-words.ts";
import { BOOKKEEPER_MARKER, bookkeeperBrief, bookkeeperSystem, createLedgerGate, rejectedCallsMessage, splitLedger, writerSystem } from "./prompts.ts";

export const TWO_PASS_RUNTIME = "dm-loop-v1/two-pass" as const;

export type BookkeeperSelection = { providerId: DmProviderId; modelId: string; effort: DmEffort };
export type TwoPassBookkeeper = BookkeeperSelection & { model: DmModel };

export type TwoPassDependencies = DmLoopDependencies & {
  /** The bookkeeper of a new turn: its selection and (the bench, the tests) its adapter. A resumed
   * turn takes the selection from its pin; the adapter then comes from `bookkeeperModel`. */
  bookkeeper?: TwoPassBookkeeper | BookkeeperSelection;
  /** The adapter for a pinned bookkeeper selection (the app). */
  bookkeeperModel?: (selection: BookkeeperSelection) => DmModel;
  /** Fix run A6: the ledger checker (Haiku in the app; a fake in tests) — absent: no check. */
  ledgerCheck?: (input: { narration: string; ledger: string; receipts: DmLoopReceipt[]; language: "ru" | "en"; state?: LedgerCheckState }) => Promise<LedgerCheckResult>;
};

/** The writer's one tool and the bookkeeper's fifteen. */
/** The writer's tools: the dice, and (fix run B2) recall — a read of the private notes, nothing recorded. */
export const isWriterTool = (name: string) => name === "roll" || name === "recall";
export const writerToolset = compileToolset(dmLoopTools.filter((tool) => isWriterTool(tool.name)));
export const bookkeeperToolset = compileToolset(dmLoopTools.filter((tool) => tool.name !== "roll"));

/** Bench observations of the split, reported through `observe` beside the loop's own. The
 * ledger travels on `writer_finished` for the server's private consumers only (never the player). */
export type TwoPassObservation =
  | { type: "two_pass"; operationId: string; event: "writer_finished"; atMs: number; requests: number; ledgerFound: boolean; ledgerChars: number; narrationChars: number; ledger: string }
  | { type: "two_pass"; operationId: string; event: "bookkeeper_finished"; atMs: number; requests: number; calls: number; rejected: number; finished: boolean };

const WRAP_UP = "The tool budget of this turn is used up. Send no further tool calls except finish_turn.";
const RECORDS_NOW = "No records were made yet. Send the records the narration and the ledger call for now, as tool calls, and finish_turn in the same message as the time call.";
const PENDING_OUTCOME = "The player saw the roll but not what came of it. Narrate the outcome of that roll now, as text, in the campaign language, within the result you received. Then close with the ledger.";
const LEDGER_NOW = "The narration is complete but the ledger is missing. Send the ledger now — the private <ledger> … </ledger> block with the headings that apply (items, money, debts and promises, people, places, time, plans, combat, secrets, the player, scene) — and nothing else: no more narration, no rolls.";

/** Polish 3 §2: a Fable writer is pinned to high (xhigh is where its cost and wait double). */
export const FABLE_WRITER_EFFORT: DmEffort = "high";
const FABLE_MODEL = "claude-fable-5-1";

function parseArguments(call: DmToolCall): Record<string, unknown> {
  try {
    const parsed = JSON.parse(call.arguments || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function toolOutput(receipt: DmLoopReceipt, checks: RecordedCheck[]): string {
  const result = receipt.result;
  if (!result.ok) return JSON.stringify({ ok: false, reason: result.reason, ...(result.hint ? { hint: result.hint } : {}) });
  const check = result.check ? checks.find((row) => row.id === result.check!.id) ?? result.check : null;
  const value = check ? { ...result.value, dice: [...check.dice], kept: check.kept, total: check.total, success: check.success } : result.value;
  return JSON.stringify({ ok: true, ...value });
}

function rendered(messages: DmMessage[], receipts: DmLoopReceipt[], checks: RecordedCheck[]): DmMessage[] {
  return messages.map((message) => {
    if (message.role !== "tool_results") return message;
    return { role: "tool_results", results: message.results.map((entry) => {
      const receipt = receipts.find((row) => row.call.id === entry.callId);
      return receipt ? { callId: entry.callId, output: toolOutput(receipt, checks), isError: !receipt.result.ok } : entry;
    }) };
  });
}

function implicitMeta(receipts: DmLoopReceipt[]): DmLoopMeta {
  const spotlight = receipts.flatMap((receipt) => {
    if (!receipt.result.ok || receipt.call.name !== "upsert_character") return [];
    const id = receipt.result.value.id;
    return typeof id === "string" ? [id] : [];
  });
  return { sceneKinds: [], spotlight: [...new Set(spotlight)], playerMoment: false, playerMomentReason: null };
}

/** Where the bookkeeper's conversation starts in the one transcript (−1: not yet). */
export function bookkeeperStart(transcript: DmMessage[]): number {
  return transcript.findIndex((message) => message.role === "user" && message.text.startsWith(BOOKKEEPER_MARKER));
}

/** The writer's effort for a selection: the depth rule applies to any writer but Fable, which is pinned to high. */
export function writerEffort(modelId: string, chosen: DmEffort): DmEffort {
  return modelId === FABLE_MODEL ? FABLE_WRITER_EFFORT : chosen;
}

export async function executeTwoPassTurn(claim: TurnClaim, deps: TwoPassDependencies, command: ResumeInput | null): Promise<PublicTurn> {
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
  const twoPass = (event: TwoPassObservation) => observe(event as unknown as DmLoopObservation);
  const now = deps.now ?? (() => performance.now());
  const random = deps.random ?? ((min: number, max: number) => min + Math.floor(Math.random() * (max - min)));
  try {
    requireRule(claim.runtimeIdentity === DM_LOOP_RUNTIME && loop && loop.schemaVersion === 1 &&
      (input.mode === "game" || input.mode === "companion") && input.expectedRevision === source.runtime.revision);
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
    if (input.mode === "companion" && source.runtime.encounters.some((row) => row.status === "active")) throw new DmError("validation");
    live({ type: "status", status: "generating" });
    if (!loop.pin) {
      const selected = await deps.pin(claim);
      const bookkeeper = deps.bookkeeper;
      requireRule(bookkeeper);
      // The depth rule (stage 4 §7) applies to the writer only; the bookkeeper runs at its fixed effort.
      const fable = selected.modelId === FABLE_MODEL;
      const range = fable ? null : parseDepthRange(selected.depth ?? null);
      const lastLoopTurn = [...source.runtime.turns].reverse().find((turn) => turn.status === "committed" && turn.nextTension !== undefined && turn.id !== operationId);
      const signal = tensionSignals(source, input, lastLoopTurn?.nextTension ?? null);
      const depth = chooseDepth(range, writerEffort(selected.modelId, selected.effort), parseDepthState(source.privateState), signal, !fable && !!selected.boostNext);
      const turnEffort = writerEffort(selected.modelId, depth.effort);
      // Fix run A6 (A3): a lighter continuation runs the writer's requests after a roll one notch below the turn.
      const continuationEffort = selected.continuation === "lighter" ? writerEffort(selected.modelId, lowerEffort(turnEffort)) : undefined;
      loop.pin = { providerId: selected.providerId, modelId: selected.modelId, effort: turnEffort,
        ...(continuationEffort && continuationEffort !== turnEffort ? { continuationEffort } : {}),
        ...(range && depth.effort !== selected.effort ? { baseEffort: selected.effort } : {}),
        runtime: DM_LOOP_RUNTIME, privacy: "single-narrator", limits: { ...(selected.limits ?? DM_LOOP_DEFAULT_LIMITS) },
        ...(range ? { depth: { min: range.min, max: range.max, tension: depth.tension, reason: depth.reason, boosted: !!selected.boostNext, streak: depth.streak } } : {}),
        bookkeeper: { providerId: bookkeeper.providerId, modelId: bookkeeper.modelId, effort: bookkeeper.effort } };
      if (range) loop.diagnostics.push({ kind: "depth", effort: depth.effort, tension: depth.tension, reason: depth.reason });
    }
    const pin = loop.pin;
    requireRule(pin.bookkeeper);
    const limits = pin.limits ?? DM_LOOP_DEFAULT_LIMITS;
    const writerSpec = dmModelSpec(pin.providerId, pin.modelId);
    const bookkeeperSpec = dmModelSpec(pin.bookkeeper.providerId, pin.bookkeeper.modelId);
    if (!writerSpec || !bookkeeperSpec) throw new DmError("configuration");
    const writer = deps.model(pin);
    const bookkeeperModel = deps.bookkeeperModel?.(pin.bookkeeper) ?? (deps.bookkeeper && "model" in deps.bookkeeper ? deps.bookkeeper.model : null);
    if (!bookkeeperModel) throw new DmError("configuration");
    const bookkeeper = bookkeeperModel;
    let informed: RuntimeSource = source;
    try {
      informed = await withUnifiedMemory(source, input, memory, true, buildDmLoopContext(source, input).memoryQuery);
    } catch (error) {
      if (error instanceof DmError && error.code === "conflict") throw error;
      informed = source;
    }
    const narrationSceneId = stableGameplayId(operationId, "scene:narration");
    const sentAt = Date.parse(claim.turn.public.created_at) || Date.now();
    const shadow = ShadowState.restore(source, operationId, loop.shadow);
    // Polish 3 §2: the writer's layers are the loop's own with the writer role (the voice slot,
    // the doctrine, the style, the approved cards and the append-only history included).
    const context = buildDmLoopContext(informed, input, { role: "writer" });
    const language: "ru" | "en" = source.snapshot.settings.values.language === "ru" ? "ru" : "en";
    const languageName = language === "ru" ? "Russian" : "English";
    const lastHint = [...source.runtime.turns].reverse().find((turn) => turn.status === "committed" && turn.nextTension !== undefined && turn.id !== operationId)?.nextTension ?? null;
    const turnTension = pin.depth?.tension ?? tensionSignals(source, input, lastHint).tension;
    const showDc = !!(source.snapshot.settings.values as { showDc?: boolean }).showDc;
    if (loop.transcript.length === 0) {
      loop.transcript.push({ role: "user", text: context.user });
      for (const layer of context.layers)
        if (layer.dropped.length || layer.usedTokens > layer.budgetTokens)
          loop.diagnostics.push({ kind: "dossier_budget", layer: layer.layer, budgetTokens: layer.budgetTokens, usedTokens: layer.usedTokens, dropped: layer.dropped });
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
    const asked = (kind: DmLoopCheckpoint["diagnostics"][number]["kind"]) => loop.diagnostics.some((row) => row.kind === kind);
    let outcomePending = false;
    const executeCalls = async (calls: DmToolCall[], phase: "writer" | "bookkeeper") => {
      let pause = false;
      // Stage C (item 53): the writer's pause names its dice; the bookkeeper's pass already reads «записывает».
      const work = phase === "writer" ? workOf(calls.filter((call) => !loop.receipts.some((row) => row.call.id === call.id)).map((call) => call.name)) : [];
      if (work.length) live({ type: "working", tools: work });
      for (const call of calls) {
        if (loop.receipts.some((row) => row.call.id === call.id)) continue;
        const toolCall = { id: call.id, name: call.name, arguments: parseArguments(call) as DmLoopReceipt["call"]["arguments"] };
        // The writer may only roll; the bookkeeper never rolls (their toolsets say so; this guards a stray call).
        const allowed = phase === "writer" ? isWriterTool(call.name) : call.name !== "roll";
        const executed = allowed ? executeDmLoopTool(shadow, toolCall, { input, checks: checkpoint.checks, random,
          narrationSceneId, toolCalls: loop.receipts.length, limits, language, tension: turnTension, receipts: loop.receipts, showDc })
          : { result: { ok: false as const, reason: `The ${phase} has no tool "${call.name}".`, hint: null, summary: `${call.name}: not available in this pass` } };
        const receipt = await recordDmTool(lease, loop.receipts.length, toolCall, executed.result);
        loop.receipts.push(receipt);
        if (executed.result.ok && executed.result.check) {
          checkpoint.checks.push(executed.result.check);
          const check = executed.result.check;
          if (pausesForPlayer(source, check)) pause = true;
          if (isDisplayedCheck(source, check)) outcomePending = true;
        }
        if ("meta" in executed && executed.meta) loop.meta = executed.meta;
        if (loop.receipts.length === limits.toolCallsPerTurn) diagnostic({ kind: "tool_cap_reached", calls: loop.receipts.length });
        observe({ type: "tool_receipt", operationId, receipt });
        if (receipt.result.ok && receipt.result.player)
          live({ type: "tool", name: call.name, ok: true, summary: receipt.result.player, ...(typeof toolCall.arguments.action === "string" ? { action: toolCall.arguments.action } : {}) });
        if (call.name === "finish_turn" && "meta" in executed && executed.meta?.playerMoment) live({ type: "moment", reason: executed.meta.playerMomentReason ?? null });
      }
      return pause;
    };
    /** The narration and the ledger the bookkeeper works on (its craft cards are selected on them; polish 3 §7). */
    const bookkeeperText = () => {
      const at = bookkeeperStart(loop.transcript);
      const writerText = (at >= 0 ? loop.transcript.slice(0, at) : loop.transcript).filter((m) => m.role === "assistant").reduce((text, m) => joinText(text, m.text), "");
      const split = splitLedger(writerText);
      return { narration: split.narration, ledger: split.ledger };
    };
    /** One model request of either pass; returns what came back. */
    // Fix run A6: the writer's request after a cut by the output cap thinks one notch lower (as the loop's).
    // Fix run B4: the writer's nudges in the instructions' language (compared by text, so chosen once per turn).
    const WN = instructionsRu(source) ? { CUT: NUDGES_RU.WRITER_CUT_BY_CAP, OUTCOME: NUDGES_RU.WRITER_PENDING_OUTCOME, LEDGER: NUDGES_RU.LEDGER_NOW }
      : { CUT: WRITER_CUT_BY_CAP, OUTCOME: PENDING_OUTCOME, LEDGER: LEDGER_NOW };
    let writerCut = false;
    const request = async (phase: "writer" | "bookkeeper", messages: DmMessage[], firstRound: boolean) => {
      const model = phase === "writer" ? writer : bookkeeper;
      const spec = phase === "writer" ? writerSpec : bookkeeperSpec;
      // Fix run A6: the writer's continuations (after a roll) take the pinned continuation depth (A3).
      // Fix run A3: «narrate the outcome» is answered at the turn's own depth (the lighter one skipped the narration).
      const asksOutcome = (() => { const lastAsk = messages.at(-1); return lastAsk?.role === "user" && lastAsk.text === WN.OUTCOME; })();
      const writerEffort = !firstRound && pin.continuationEffort && !asksOutcome ? pin.continuationEffort : pin.effort;
      const effort = phase === "writer" ? (writerCut ? lowerEffort(writerEffort) : writerEffort) : pin.bookkeeper!.effort;
      writerCut = false;
      const system = phase === "writer" ? writerSystem(context) : bookkeeperSystem(context, languageName, bookkeeperText());
      const body: DmModelRequest = { system, messages, toolset: phase === "writer" ? writerToolset : bookkeeperToolset, effort,
        maxOutputTokens: dmOutputCap(), operationId, cacheKey: input.campaignId, cacheTurn: true };
      const requestBytes = new TextEncoder().encode(JSON.stringify(body.system) + JSON.stringify(body.messages)).length;
      observe({ type: "request_started", operationId, request: loop.requests + 1, requestBytes,
        cachedPrefixBytes: system.filter((block) => block.cache).reduce((sum, block) => sum + new TextEncoder().encode(block.text).length, 0),
        layers: system.map((block, index) => ({ bytes: new TextEncoder().encode(block.text).length,
          hash: createHash("sha256").update(block.text).digest("hex").slice(0, 12),
          tokens: phase === "writer" ? context.layers[index]?.usedTokens ?? 0 : 0, budgetTokens: phase === "writer" ? context.layers[index]?.budgetTokens ?? 0 : 0 })) });
      const started = now();
      let firstTextMs: number | null = null;
      let firstWordMs: number | null = null;
      let roundText = "";
      let shownRound = "";
      let partStart = true;
      const gate = createLedgerGate();
      const toolCalls: DmToolCall[] = [];
      let usage: DmLoopUsageEntry | null = null;
      let stop: Extract<Awaited<ReturnType<DmModel["stream"]>> extends AsyncIterable<infer E> ? E : never, { type: "stop" }> | null = null;
      const show = (text: string) => {
        if (!text) return;
        if (partStart && shownRound.trim()) {
          const piece = continuation(shownRound, text);
          shownRound += piece;
          if (piece.trim()) partStart = false;
          if (piece) live({ type: "text", text: piece });
        } else {
          const fresh = !shownRound.trim();
          shownRound += text;
          const piece = fresh ? continuation(loop.text, shownRound) : text;
          if (piece.trim()) partStart = false;
          if (piece) live({ type: "text", text: piece });
        }
      };
      const stopHeartbeat = leaseHeartbeat(store, lease, deps.heartbeatMs);
      try {
        for await (const event of model.stream(body)) {
          if (event.type === "text_delta") {
            if (firstTextMs === null) firstTextMs = Math.round(now() - started);
            roundText += event.text;
            if (phase !== "writer") continue; // the bookkeeper's text never reaches the player
            const visible = gate.push(event.text);
            if (visible.trim() && firstWordMs === null && firstRound && !loop.text.trim() && !shownRound.trim() &&
              !loop.usage.some((entry) => entry.firstWordMs != null)) firstWordMs = Math.max(0, Date.now() - sentAt);
            if (visible.trim()) outcomePending = false;
            show(visible);
          } else if (event.type === "tool_call") {
            if (phase === "writer") show(gate.flush());
            partStart = true;
            toolCalls.push({ id: event.id, name: event.name, arguments: event.arguments });
          } else if (event.type === "usage") {
            usage = { providerId: spec.providerId, modelId: spec.modelId, effort, ...event.usage,
              costUsd: dmUsageCost(spec, event.usage), latencyMs: 0, firstTextMs, requestBytes, toolCalls: 0 };
          } else if (event.type === "stop") {
            stop = event;
          }
        }
        if (phase === "writer") show(gate.flush());
      } catch (error) {
        // A broken stream after text reached the player: what was shown stays shown; the retry
        // (below) or the player's «Повторить» continues from the checkpoint.
        if (error instanceof DmModelError) {
          diagnostic({ kind: "provider_error", errorKind: error.kind, httpStatus: error.detail.httpStatus ?? null,
            providerCode: error.detail.providerCode ?? null, message: error.message.slice(0, 300) });
          if (error.kind === "not_configured") throw new DmError("configuration");
          // Fix run A1/A6: the writer's request after a cut, refused — the cut message goes back once as plain text.
          if (phase === "writer" && error.kind === "provider_rejected" && !asked("cut_plain_retry") && plainCutMessage(loop.transcript, WN.CUT)) {
            diagnostic({ kind: "cut_plain_retry" });
            await persist("generating");
            stopHeartbeat();
            writerCut = true;
            return request(phase, rendered(loop.transcript, loop.receipts, checkpoint.checks), firstRound);
          }
          if (error.kind === "provider_rejected" || error.kind === "fatal") throw new DmError("provider", false);
          throw new DmError("provider", true);
        }
        throw new DmError("provider", true);
      } finally {
        stopHeartbeat();
      }
      requireRule(stop);
      const entry: DmLoopUsageEntry = { ...(usage ?? { providerId: spec.providerId, modelId: spec.modelId, effort,
        inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, reasoningTokens: null, costUsd: 0,
        firstTextMs, requestBytes }), latencyMs: Math.round(now() - started), toolCalls: toolCalls.length, firstTextMs, firstWordMs };
      loop.usage.push(entry);
      loop.requests++;
      observe({ type: "request_finished", operationId, request: loop.requests, usage: entry, stop: stop.reason });
      // Fix run A6: a request the cap cut before it wrote anything leaves no (invalid) empty assistant message.
      if (roundText.trim() || toolCalls.length) loop.transcript.push({ role: "assistant", text: roundText, toolCalls, native: stop.native });
      return { toolCalls, stop, roundText, shownRound };
    };
    /** Polish 3 §3: rejected record calls of the last message go back once with their reasons. */
    const retryRejected = async (calls: DmToolCall[]) => {
      const rejected = calls.flatMap((call) => {
        const receipt = loop.receipts.find((row) => row.call.id === call.id);
        return receipt && !receipt.result.ok && retriableRejection(receipt.call) ? [{ name: call.name, reason: receipt.result.reason }] : [];
      });
      if (!rejected.length || asked("records_retry_asked")) return false;
      const bookkeeperRequests = loop.transcript.slice(Math.max(0, bookkeeperStart(loop.transcript))).filter((m) => m.role === "assistant").length;
      if (bookkeeperRequests >= limits.modelRequestsPerTurn - 1 || loop.receipts.length >= limits.toolCallsPerTurn) return false;
      diagnostic({ kind: "records_retry_asked", calls: rejected.map((row) => row.name) });
      loop.transcript.push({ role: "user", text: rejectedCallsMessage(rejected) });
      shadow.finished = false;
      return true;
    };

    // ---- The writer's pass -------------------------------------------------
    let markerAt = bookkeeperStart(loop.transcript);
    if (markerAt < 0) {
      // On a resume the shown text so far is the narration without a ledger (a
      // ledger only comes with the writer's last message).
      for (;;) {
        const part = loop.transcript;
        const last = part.at(-1);
        if (last?.role === "assistant" && last.toolCalls.length &&
          last.toolCalls.some((call) => !loop.receipts.some((row) => row.call.id === call.id) ||
            !part.some((m) => m.role === "tool_results" && m.results.some((r) => r.callId === call.id)))) {
          const pause = await executeCalls(last.toolCalls, "writer");
          loop.transcript.push({ role: "tool_results", results: last.toolCalls.map((call) => {
            const receipt = loop.receipts.find((row) => row.call.id === call.id)!;
            return { callId: call.id, output: toolOutput(receipt, checkpoint.checks), isError: !receipt.result.ok };
          }) });
          await persist(pause ? "awaiting_confirmation" : "generating");
          if (pause) {
            live({ type: "status", status: "awaiting_confirmation" });
            return store.getPublic(input.campaignId, operationId);
          }
          continue;
        }
        const writerRequests = part.filter((m) => m.role === "assistant").length;
        if (writerRequests >= limits.modelRequestsPerTurn) { diagnostic({ kind: "request_cap_reached", requests: loop.requests }); break; }
        if (writerRequests === limits.modelRequestsPerTurn - 1 && last?.role !== "user")
          loop.transcript.push({ role: "user", text: "This is the last request of the turn: finish the narration now and close with the ledger; no more rolls." });
        // Polish 3 §2: a retryable transport failure of a continuation (after a dice pause, after the
        // ledger request) is retried once before the turn fails; the first request fails as today.
        let round: Awaited<ReturnType<typeof request>>;
        try {
          round = await request("writer", rendered(loop.transcript, loop.receipts, checkpoint.checks), writerRequests === 0);
        } catch (error) {
          const retryable = error instanceof DmError && error.code === "provider" && error.retryable;
          const alreadyRetried = loop.diagnostics.some((row) => row.kind === "writer_retried" && row.request === writerRequests + 1);
          if (!retryable || writerRequests === 0 || alreadyRetried) throw error;
          diagnostic({ kind: "writer_retried", request: writerRequests + 1 });
          await persist("generating");
          round = await request("writer", rendered(loop.transcript, loop.receipts, checkpoint.checks), false);
        }
        loop.text = joinText(loop.text, round.shownRound);
        await persist("generating");
        if (round.stop.reason === "refusal") { diagnostic({ kind: "model_refusal", providerReason: round.stop.providerReason }); break; }
        if (round.stop.reason === "max_tokens") {
          diagnostic({ kind: "max_tokens", outputTokens: loop.usage.at(-1)?.outputTokens ?? 0 });
          // Fix run A6 (as A1): a cut never fails the turn — once, the writer continues from the complete part.
          if (!asked("cut_continued") && writerRequests + 1 < limits.modelRequestsPerTurn) {
            diagnostic({ kind: "cut_continued", toolCalls: round.toolCalls.length });
            writerCut = true;
            if (!round.toolCalls.length) {
              loop.transcript.push({ role: "user", text: WN.CUT });
              await persist("generating");
              continue;
            }
          }
        }
        if (!round.toolCalls.length) {
          if (outcomePending && !asked("outcome_asked") && writerRequests + 1 < limits.modelRequestsPerTurn) {
            diagnostic({ kind: "outcome_asked" });
            loop.transcript.push({ role: "user", text: WN.OUTCOME });
            await persist("generating");
            continue;
          }
          // Polish 3 §2: a missing ledger is asked for once, as the loop asks for finish_turn.
          const soFar = loop.transcript.filter((m) => m.role === "assistant").reduce((text, m) => joinText(text, m.text), "");
          if (!splitLedger(soFar).found && loop.text.trim() && !asked("ledger_asked") && round.stop.reason !== "max_tokens" && writerRequests + 1 < limits.modelRequestsPerTurn) {
            diagnostic({ kind: "ledger_asked" });
            loop.transcript.push({ role: "user", text: WN.LEDGER });
            await persist("generating");
            continue;
          }
          // Fix run B3 (item 60): every roll the player saw is told — checked in code before the bookkeeper; one
          // continuation (no new ledger) when the story skipped one.
          if (deps.rollCheck && !asked("rolls_checked") && writerRequests + 1 < limits.modelRequestsPerTurn) {
            // Fix S3-pre 2: the fight's attacks count, the hero's own rolls are marked, the player's declared actions are read.
            const rolls = visibleRolls(loop.receipts, heroIdOf(source));
            const declared = declaredLine(input);
            if (rolls.length || declared) {
              const check = await deps.rollCheck({ narration: splitLedger(soFar).narration, rolls: rolls.map((roll) => roll.line), language, ...(declared ? { playerInput: declared } : {}),
                heroRolls: rolls.flatMap((roll, index) => (roll.hero ? [index + 1] : [])) })
                .catch((error: unknown): RollCheckResult => ({ untold: [], undeclared: [], costUsdMicros: 0, error: String((error as Error)?.message ?? error).slice(0, 120) }));
              const undeclared = check.undeclared ?? [];
              diagnostic({ kind: "rolls_checked", rolls: rolls.length, untold: check.untold.length, undeclared: undeclared.length, costUsd: check.costUsdMicros / 1_000_000, error: check.error });
              await persist("generating");
              if (check.untold.length || undeclared.length) {
                loop.transcript.push({ role: "user", text: untoldRollsMessage(instructionsRu(source) ? "ru" : "en", check.untold.map((n) => rolls[n - 1].line), "writer", undeclared) });
                await persist("generating");
                continue;
              }
            }
          }
          break;
        }
      }
      // The writer's whole text (the narration plus the ledger) is in the assistant messages.
      const writerText = loop.transcript.filter((m) => m.role === "assistant").reduce((text, m) => joinText(text, m.text), "");
      const split = splitLedger(writerText);
      loop.text = split.narration;
      if (split.clipped) diagnostic({ kind: "ledger_clipped", chars: split.ledger.length });
      if (!loop.text.trim()) {
        diagnostic({ kind: "empty_narration" });
        await persist("generating");
        throw new DmError("provider", true);
      }
      const rolls = loop.receipts.filter((receipt) => receipt.call.name === "roll");
      const brief = bookkeeperBrief({ playerInput: input.input, narration: loop.text, ledger: split.ledger, found: split.found, rolls,
        checks: checkpoint.checks.map((row) => ({ id: row.id, total: row.total, success: row.success, dice: [...row.dice] })) });
      loop.transcript.push({ role: "user", text: brief });
      markerAt = loop.transcript.length - 1;
      await persist("generating");
      // The text is complete: the player may read and type; the composer holds the send until the commit.
      live({ type: "status", status: "recording" });
      twoPass({ type: "two_pass", operationId, event: "writer_finished", atMs: Math.max(0, Date.now() - sentAt),
        requests: loop.transcript.slice(0, markerAt).filter((m) => m.role === "assistant").length,
        ledgerFound: split.found, ledgerChars: split.ledger.length, narrationChars: loop.text.length, ledger: split.ledger });
    } else {
      // A resume inside the bookkeeper's pass: the text was complete before the failure.
      live({ type: "status", status: "recording" });
    }

    // ---- The bookkeeper's pass --------------------------------------------
    const bookkeeperPart = () => loop.transcript.slice(markerAt);
    const runBookkeeper = async () => { for (;;) {
      const part = bookkeeperPart();
      const last = part.at(-1);
      if (last?.role === "assistant" && last.toolCalls.length &&
        last.toolCalls.some((call) => !loop.receipts.some((row) => row.call.id === call.id) ||
          !part.some((m) => m.role === "tool_results" && m.results.some((r) => r.callId === call.id)))) {
        await executeCalls(last.toolCalls, "bookkeeper");
        loop.transcript.push({ role: "tool_results", results: last.toolCalls.map((call) => {
          const receipt = loop.receipts.find((row) => row.call.id === call.id)!;
          return { callId: call.id, output: toolOutput(receipt, checkpoint.checks), isError: !receipt.result.ok };
        }) });
        const retrying = await retryRejected(last.toolCalls);
        await persist("generating");
        if (retrying) continue;
        if (shadow.finished) break;
        continue;
      }
      if (shadow.finished) break;
      const requests = part.filter((m) => m.role === "assistant").length;
      if (requests >= limits.modelRequestsPerTurn) { diagnostic({ kind: "request_cap_reached", requests: loop.requests }); break; }
      const lastRequest = requests === limits.modelRequestsPerTurn - 1 || loop.receipts.length >= limits.toolCallsPerTurn;
      if (lastRequest && last?.role !== "user") loop.transcript.push({ role: "user", text: WRAP_UP });
      const round = await request("bookkeeper", rendered(bookkeeperPart(), loop.receipts, checkpoint.checks), false);
      await persist("generating");
      if (round.stop.reason === "refusal") { diagnostic({ kind: "model_refusal", providerReason: round.stop.providerReason }); break; }
      if (round.stop.reason === "max_tokens") diagnostic({ kind: "max_tokens", outputTokens: loop.usage.at(-1)?.outputTokens ?? 0 });
      if (!round.toolCalls.length) {
        const bookkeeperReceipts = loop.receipts.filter((receipt) => !isWriterTool(receipt.call.name));
        if (!bookkeeperReceipts.length && round.stop.reason !== "max_tokens" && !asked("finish_asked")) {
          diagnostic({ kind: "finish_asked" });
          loop.transcript.push({ role: "user", text: RECORDS_NOW });
          await persist("generating");
          continue;
        }
        break;
      }
    } };
    await runBookkeeper();
    // Fix run A6: the ledger checker — the story against the records; one correcting bookkeeper call;
    // what still does not match becomes the owner's chip. Never fails the turn.
    if (deps.ledgerCheck && !asked("ledger_checked")) {
      const writerText = loop.transcript.slice(0, markerAt).filter((m) => m.role === "assistant").reduce((text, m) => joinText(text, m.text), "");
      const ledgerText = splitLedger(writerText).ledger;
      const check = () => deps.ledgerCheck!({ narration: loop.text, ledger: ledgerText, receipts: loop.receipts, language,
        state: ledgerCheckState({ snapshot: shadow.snapshot, runtime: shadow.runtime }) }).catch((error: unknown) =>
        ({ misses: [], usage: null, costUsdMicros: 0, elapsedMs: 0, error: String((error as Error)?.message ?? error).slice(0, 120) }));
      const first = await check();
      diagnostic({ kind: "ledger_checked", misses: first.misses.map((miss) => miss.event), costUsd: first.costUsdMicros / 1_000_000, error: first.error });
      let remaining = first.misses;
      if (first.misses.length && bookkeeperPart().filter((m) => m.role === "assistant").length < limits.modelRequestsPerTurn) {
        loop.transcript.push({ role: "user", text: ledgerCorrectionMessage(first.misses) });
        shadow.finished = false;
        await persist("generating");
        await runBookkeeper();
        const second = await check();
        diagnostic({ kind: "ledger_checked", misses: second.misses.map((miss) => miss.event), costUsd: second.costUsdMicros / 1_000_000, error: second.error });
        remaining = second.error ? first.misses : second.misses;
      }
      if (remaining.length) {
        diagnostic({ kind: "ledger_unrecorded", chips: remaining.map((miss) => ledgerChip(language, miss)) });
        for (const miss of remaining) live({ type: "tool", name: "ledger_check", ok: false, summary: ledgerChip(language, miss) });
      }
      await persist("generating");
    }
    if (!loop.meta) { loop.meta = implicitMeta(loop.receipts); if (loop.receipts.some((r) => !isWriterTool(r.call.name))) diagnostic({ kind: "implicit_finish", calls: loop.receipts.length }); }
    twoPass({ type: "two_pass", operationId, event: "bookkeeper_finished", atMs: Math.max(0, Date.now() - sentAt),
      requests: bookkeeperPart().filter((m) => m.role === "assistant").length,
      calls: loop.receipts.filter((r) => !isWriterTool(r.call.name)).length, rejected: loop.receipts.filter((r) => !isWriterTool(r.call.name) && !r.result.ok).length,
      finished: shadow.finished });

    // ---- The commit: the default loop's own tail ----------------------------
    let narration = loop.text.trim();
    if (narration.length > L.maxNarrationChars) narration = `${narration.slice(0, L.maxNarrationChars - 1)}…`;
    const leakCheck = suspectedLiteralLeaks(informed, input, narration);
    for (const leak of leakCheck.leaks) diagnostic({ kind: "suspected_leak", detail: leak });
    for (const detail of leakCheck.selfDisclosures) diagnostic({ kind: "self_disclosure", detail });
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
    // Stage C: each of the writer's rolls in its place in the told text (the writer's messages; the ledger comes last).
    const textAt = rollTextOffsets(loop.transcript, loop.receipts);
    if (Object.keys(textAt).length) loop.meta = { ...(loop.meta ?? implicitMeta(loop.receipts)), textAt };
    await persist("generating");
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

export async function runTwoPassTurn(input: TurnInput, deps: TwoPassDependencies): Promise<PublicTurn> {
  const current = requireTurnTimeline(await deps.store.begin(input, DM_LOOP_RUNTIME), input.campaignId, input.operationId, input.timeline);
  if (["committed", "cancelled", "awaiting_confirmation"].includes(current.status) ||
    (current.status === "failed" && !current.canRetry)) return current;
  const claim = await deps.store.claim(input.campaignId, input.operationId);
  if (claim) requireClaimTimeline(claim, input.campaignId, input.operationId, input.timeline);
  return requireTurnTimeline(claim ? await executeTwoPassTurn(claim, deps, null)
    : await deps.store.getPublic(input.campaignId, input.operationId), input.campaignId, input.operationId, input.timeline);
}

export async function resumeTwoPassTurn(command: ResumeInput, deps: TwoPassDependencies): Promise<PublicTurn> {
  const current = requireTurnTimeline(await deps.store.getPublic(command.campaignId, command.operationId),
    command.campaignId, command.operationId, command.timeline);
  if (["committed", "cancelled"].includes(current.status)) return current;
  if (command.action === "cancel") return deps.store.cancel(command);
  requireRule(command.action === "retry" ? retryClaimable(current) : current.status === "awaiting_confirmation");
  const claim = await deps.store.claim(command.campaignId, command.operationId);
  if (claim) requireClaimTimeline(claim, command.campaignId, command.operationId, command.timeline);
  return requireTurnTimeline(claim ? await executeTwoPassTurn(claim, deps, command)
    : await deps.store.getPublic(command.campaignId, command.operationId), command.campaignId, command.operationId, command.timeline);
}

// ---- The campaign's choice ---------------------------------------------------
export type CampaignTurnDependencies = TwoPassDependencies & {
  /** The campaign's DM settings choice at the turn's start: null — today's loop. */
  split: DmSplit | null;
};

/** The bookkeeper selection of a split (its fixed effort: the selection's reasoning, else high). */
export function bookkeeperOf(split: DmSplit): BookkeeperSelection {
  return { providerId: split.bookkeeper.providerId as DmProviderId, modelId: split.bookkeeper.modelId,
    effort: (split.bookkeeper.reasoning ?? "high") as DmEffort };
}

/** Which runtime a claimed turn plays on: a pinned turn by its pin (a retry keeps the pair,
 * whatever the settings say now), a new turn by the campaign's choice. */
function isSplitTurn(claim: TurnClaim, split: DmSplit | null): boolean {
  const pin: DmLoopPin | null = claim.turn.checkpoint.dmLoop?.pin ?? null;
  if (pin) return !!pin.bookkeeper;
  // Fix run A6 (A3, item 75): a council line is the loop's light call on a split campaign too — it records
  // only notes and time, so it needs no bookkeeper.
  if (claim.turn.input.mode === "companion") return false;
  return !!split;
}

function twoPassDeps(deps: CampaignTurnDependencies): TwoPassDependencies {
  return { ...deps, ...(deps.split && !deps.bookkeeper ? { bookkeeper: bookkeeperOf(deps.split) } : {}) };
}

/** Runs a dm-loop-v1 turn on the campaign's runtime: the split when the settings say so, today's loop otherwise. */
export async function runCampaignTurn(input: TurnInput, deps: CampaignTurnDependencies): Promise<PublicTurn> {
  const current = requireTurnTimeline(await deps.store.begin(input, DM_LOOP_RUNTIME), input.campaignId, input.operationId, input.timeline);
  if (["committed", "cancelled", "awaiting_confirmation"].includes(current.status) ||
    (current.status === "failed" && !current.canRetry)) return current;
  const claim = await deps.store.claim(input.campaignId, input.operationId);
  if (claim) requireClaimTimeline(claim, input.campaignId, input.operationId, input.timeline);
  const played = claim ? (isSplitTurn(claim, deps.split) ? await executeTwoPassTurn(claim, twoPassDeps(deps), null) : await executeDmLoopTurn(claim, deps, null))
    : await deps.store.getPublic(input.campaignId, input.operationId);
  return requireTurnTimeline(played, input.campaignId, input.operationId, input.timeline);
}

export async function resumeCampaignTurn(command: ResumeInput, deps: CampaignTurnDependencies): Promise<PublicTurn> {
  const current = requireTurnTimeline(await deps.store.getPublic(command.campaignId, command.operationId),
    command.campaignId, command.operationId, command.timeline);
  if (["committed", "cancelled"].includes(current.status)) return current;
  if (command.action === "cancel") return deps.store.cancel(command);
  requireRule(command.action === "retry" ? retryClaimable(current) : current.status === "awaiting_confirmation");
  const claim = await deps.store.claim(command.campaignId, command.operationId);
  if (claim) requireClaimTimeline(claim, command.campaignId, command.operationId, command.timeline);
  const played = claim ? (isSplitTurn(claim, deps.split) ? await executeTwoPassTurn(claim, twoPassDeps(deps), command) : await executeDmLoopTurn(claim, deps, command))
    : await deps.store.getPublic(command.campaignId, command.operationId);
  return requireTurnTimeline(played, command.campaignId, command.operationId, command.timeline);
}
