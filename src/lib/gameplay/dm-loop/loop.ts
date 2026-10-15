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
import type { PublicTurn, ResumeInput, TurnInput } from "../contracts.ts";
import type { RecordedCheck, RuntimeSource, TurnClaim, TurnStore } from "../server-contracts.ts";
import type { MemoryStore, SummaryProvider } from "../../memory/server-contracts.ts";
import { withUnifiedMemory } from "../../memory/unified-context.ts";
import { isDisplayedCheck, recordServerRoll, stableGameplayId } from "../dice.ts";
import { requireClaimTimeline, requireTurnTimeline } from "../timeline.ts";
import { requireRule, safeTurnFailure, TurnError } from "../turn-errors.ts";
import { DmError } from "../dm-errors.ts";
import { compileToolset } from "../../server/dm/model/schema-compiler.ts";
import type { DmMessage, DmModel, DmModelRequest, DmToolCall } from "../../server/dm/model/contracts.ts";
import { DmModelError } from "../../server/dm/model/contracts.ts";
import { dmModelSpec, dmUsageCost } from "../../model-runtime/dm-models.ts";
import { buildDmLoopContext, suspectedLiteralLeaks } from "./context.ts";
import { advanceLedger, parseLedger, serializeLedger } from "./ledger.ts";
import { advanceMetrics, parseMetrics, serializeMetrics } from "./metrics.ts";
import { chooseDepth, parseDepthRange, parseDepthState, tensionSignals, type DepthRange } from "./depth.ts";
import { executeDmLoopTool } from "./execute.ts";
import { dmLoopLimits as L, DM_LOOP_DEFAULT_LIMITS } from "./limits.ts";
import { ShadowState } from "./shadow.ts";
import { dmLoopTools } from "./tools.ts";
import { DM_LOOP_RUNTIME, type DmLoopCheckpoint, type DmLoopLiveEvent, type DmLoopMeta, type DmLoopObservation,
  type DmLoopPin, type DmLoopReceipt, type DmLoopUsageEntry } from "./contracts.ts";

export { DM_LOOP_RUNTIME } from "./contracts.ts";

export type DmLoopDependencies = {
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
    { depth?: DepthRange | null; boostNext?: boolean }>;
  /** Stage 4 hooks after a commit (never block or fail the turn): the DM's
   * player-likes note, the used «important turn» flag. */
  afterCommit?: (event: { operationId: string; playerLikes: string | null; boostUsed: boolean }) => Promise<void>;
  random?: (min: number, max: number) => number;
  observe?: (observation: DmLoopObservation) => void;
  now?: () => number;
};

export const dmLoopToolset = compileToolset(dmLoopTools);

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
  if (/[—–-]/.test(end) || /^\s*[—–-]/.test(next)) return "";
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
  return { sceneKinds: [], spotlight: [...new Set(spotlight)], playerMoment: false };
}

function parseArguments(call: DmToolCall): Record<string, unknown> {
  try {
    const parsed = JSON.parse(call.arguments || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

async function execute(claim: TurnClaim, deps: DmLoopDependencies, command: ResumeInput | null): Promise<PublicTurn> {
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
      const replacement = recordServerRoll(operationId, check, check.modifier, check.rollNumber + 1, random);
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
      const depth = chooseDepth(range, selected.effort, parseDepthState(source.privateState), signal, !!selected.boostNext);
      loop.pin = { providerId: selected.providerId, modelId: selected.modelId, effort: depth.effort,
        ...(selected.continuationEffort && selected.continuationEffort !== depth.effort ? { continuationEffort: selected.continuationEffort } : {}),
        runtime: DM_LOOP_RUNTIME, privacy: "single-narrator", limits: { ...(selected.limits ?? DM_LOOP_DEFAULT_LIMITS) },
        ...(range ? { depth: { min: range.min, max: range.max, tension: depth.tension, reason: depth.reason, boosted: !!selected.boostNext } } : {}) };
      if (range) loop.diagnostics.push({ kind: "depth", effort: depth.effort, tension: depth.tension, reason: depth.reason });
    }
    const pin = loop.pin;
    // Operations pinned before stage 3 carry no limits: the defaults apply to them.
    const limits = pin.limits ?? DM_LOOP_DEFAULT_LIMITS;
    const spec = dmModelSpec(pin.providerId, pin.modelId);
    if (!spec) throw new DmError("configuration");
    const model = deps.model(pin);
    let informed: RuntimeSource = source;
    try {
      // Memory query rewriting (plan §11): explicit questions with the names of
      // the scene's participants, mentioned entities and the open journal.
      informed = await withUnifiedMemory(source, input, memory, true, buildDmLoopContext(source, input).memoryQuery);
    } catch (error) {
      if (error instanceof DmError && error.code === "conflict") throw error;
      informed = source; // An unavailable Memory index never blocks play; current state and Canon stay.
    }
    const narrationSceneId = stableGameplayId(operationId, "scene:narration");
    const shadow = ShadowState.restore(source, operationId, loop.shadow);
    const context = buildDmLoopContext(informed, input);
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
    /** Execute the calls of one assistant message; recorded ones are replayed. */
    const executeCalls = async (calls: DmToolCall[]) => {
      let pause = false;
      for (const call of calls) {
        if (loop.receipts.some((row) => row.call.id === call.id)) continue;
        const toolCall = { id: call.id, name: call.name, arguments: parseArguments(call) as DmLoopReceipt["call"]["arguments"] };
        const executed = executeDmLoopTool(shadow, toolCall, { input, checks: checkpoint.checks, random,
          narrationSceneId, toolCalls: loop.receipts.length, limits });
        const receipt = await recordDmTool(lease, loop.receipts.length, toolCall, executed.result);
        loop.receipts.push(receipt);
        if (executed.result.ok && executed.result.check) {
          checkpoint.checks.push(executed.result.check);
          const check = executed.result.check;
          if (isDisplayedCheck(source, check) && (source.snapshot.settings.values.interactiveDice ||
            source.snapshot.settings.values.difficulty.rerolls !== "disabled")) pause = true;
        }
        if (executed.meta) loop.meta = executed.meta;
        if (loop.receipts.length === limits.toolCallsPerTurn) diagnostic({ kind: "tool_cap_reached", calls: loop.receipts.length });
        observe({ type: "tool_receipt", operationId, receipt });
        live({ type: "tool", name: call.name, ok: receipt.result.ok, summary: receipt.result.summary });
      }
      return pause;
    };
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
        // finish_turn ends the turn once narration exists; a model that calls it
        // before writing (Opus tends to put text last) is asked for the text.
        if (shadow.finished && !loop.text.trim()) {
          shadow.finished = false;
          loop.transcript.push({ role: "user", text: NARRATE_NOW });
        }
        // The OpenAI habit of a finish_turn round of its own is folded into the
        // final bookkeeping message (stage 3 §4); Opus batches finish_turn itself.
        if (!shadow.finished && !pause && pin.providerId === "openai" && loop.text.trim() && foldsFinish(last.toolCalls, loop.receipts)) {
          shadow.finished = true;
          loop.meta ??= implicitMeta(loop.receipts);
          diagnostic({ kind: "implicit_finish", calls: last.toolCalls.length });
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
      const lastRequest = loop.requests === limits.modelRequestsPerTurn - 1 || loop.receipts.length >= limits.toolCallsPerTurn;
      if (lastRequest && last?.role !== "user") loop.transcript.push({ role: "user", text: WRAP_UP });
      // Requests after the first (continuations after tool results) may run at
      // the pinned continuation effort (stage 2b §3).
      const effort = loop.requests > 0 && pin.continuationEffort ? pin.continuationEffort : pin.effort;
      const request: DmModelRequest = { system: context.system, messages: renderedTranscript(loop, checkpoint.checks),
        toolset: dmLoopToolset, effort, ...(effort !== pin.effort ? { turnEffort: pin.effort } : {}),
        maxOutputTokens: L.maxOutputTokens, operationId, cacheKey: input.campaignId };
      const requestBytes = new TextEncoder().encode(JSON.stringify(request.system) + JSON.stringify(request.messages)).length;
      observe({ type: "request_started", operationId, request: loop.requests + 1, requestBytes, cachedPrefixBytes: context.cachedPrefixBytes,
        layers: context.system.map((block, index) => ({ bytes: new TextEncoder().encode(block.text).length,
          hash: createHash("sha256").update(block.text).digest("hex").slice(0, 12),
          tokens: context.layers[index]?.usedTokens ?? 0, budgetTokens: context.layers[index]?.budgetTokens ?? 0 })) });
      const started = now();
      let firstTextMs: number | null = null;
      let roundText = "";
      const toolCalls: DmToolCall[] = [];
      let usage: DmLoopUsageEntry | null = null;
      let stop: Extract<Awaited<ReturnType<DmModel["stream"]>> extends AsyncIterable<infer E> ? E : never, { type: "stop" }> | null = null;
      try {
        for await (const event of model.stream(request)) {
          if (event.type === "text_delta") {
            if (firstTextMs === null) firstTextMs = Math.round(now() - started);
            // The live stream gets exactly what the saved narration will have
            // between this request's text and the previous one (joinText).
            const fresh = !roundText.trim();
            roundText += event.text;
            const piece = fresh ? continuation(loop.text, roundText) : event.text;
            if (piece) live({ type: "text", text: piece });
          } else if (event.type === "tool_call") {
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
          if (error.kind === "not_configured") throw new DmError("configuration");
          if (error.kind === "provider_rejected" || error.kind === "fatal") throw new DmError("provider", false);
          throw new DmError("provider", true);
        }
        throw new DmError("provider", true);
      }
      requireRule(stop);
      const entry: DmLoopUsageEntry = { ...(usage ?? { providerId: pin.providerId, modelId: pin.modelId, effort,
        inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, reasoningTokens: null, costUsd: 0,
        firstTextMs, requestBytes }), latencyMs: Math.round(now() - started), toolCalls: toolCalls.length, firstTextMs };
      loop.usage.push(entry);
      loop.requests++;
      observe({ type: "request_finished", operationId, request: loop.requests, usage: entry, stop: stop.reason });
      loop.transcript.push({ role: "assistant", text: roundText, toolCalls, native: stop.native });
      loop.text = joinText(loop.text, roundText);
      await persist("generating");
      if (stop.reason === "refusal") { diagnostic({ kind: "model_refusal", providerReason: stop.providerReason }); break; }
      if (stop.reason === "max_tokens") diagnostic({ kind: "max_tokens", outputTokens: entry.outputTokens });
      if (!toolCalls.length) break;
    }
    let narration = loop.text.trim();
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
    if (pin.depth) shadow.setPrivate("fact", "depth_state", JSON.stringify({ tension: pin.depth.tension, effort: pin.effort }));
    if (loop.diagnostics.some((row) => row.kind === "suspected_leak" || row.kind === "self_disclosure")) await persist("generating");
    const result = await store.commit(lease, {
      narration, visualDescription: "",
      resolution: { changes: shadow.orderedChanges(), worldMinutes: shadow.worldMinutes,
        configuration: shadow.runtime.configuration, outcomes: [] },
      privatePatches: shadow.privatePatches, checks: checkpoint.checks, guidanceProposal: null,
      dmLoop: { receipts: loop.receipts, meta: loop.meta, usage: loop.usage, requests: loop.requests },
    });
    live({ type: "status", status: result.status === "committed" ? "committed" : "failed" });
    if (result.status === "committed" && deps.afterCommit) {
      try { await deps.afterCommit({ operationId, playerLikes: loop.meta?.playerLikes ?? null, boostUsed: !!pin.depth?.boosted }); }
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

export async function runDmLoopTurn(input: TurnInput, deps: DmLoopDependencies): Promise<PublicTurn> {
  const current = requireTurnTimeline(await deps.store.begin(input, DM_LOOP_RUNTIME), input.campaignId, input.operationId, input.timeline);
  if (["committed", "cancelled", "awaiting_confirmation"].includes(current.status) ||
    (current.status === "failed" && !current.canRetry)) return current;
  const claim = await deps.store.claim(input.campaignId, input.operationId);
  if (claim) requireClaimTimeline(claim, input.campaignId, input.operationId, input.timeline);
  return requireTurnTimeline(claim ? await execute(claim, deps, null)
    : await deps.store.getPublic(input.campaignId, input.operationId), input.campaignId, input.operationId, input.timeline);
}

export async function resumeDmLoopTurn(command: ResumeInput, deps: DmLoopDependencies): Promise<PublicTurn> {
  const current = requireTurnTimeline(await deps.store.getPublic(command.campaignId, command.operationId),
    command.campaignId, command.operationId, command.timeline);
  if (["committed", "cancelled"].includes(current.status)) return current;
  if (command.action === "cancel") return deps.store.cancel(command);
  requireRule(command.action === "retry" ? current.status === "failed" && current.canRetry : current.status === "awaiting_confirmation");
  const claim = await deps.store.claim(command.campaignId, command.operationId);
  if (claim) requireClaimTimeline(claim, command.campaignId, command.operationId, command.timeline);
  return requireTurnTimeline(claim ? await execute(claim, deps, command)
    : await deps.store.getPublic(command.campaignId, command.operationId), command.campaignId, command.operationId, command.timeline);
}
