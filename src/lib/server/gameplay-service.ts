import "server-only";
import { after } from "next/server";
import { authorizeCampaign } from "./campaign-authorization";
import { PersistenceError } from "./errors";
import { isUuid } from "../persistence/validation";
import type { TimelineFence } from "../saves/contracts";
import { isTimelineFence } from "../saves/fence";
import { createSaveStore } from "./saves/store";
import { createTurnStore } from "./dm";
import { readAstraFirstOpeningStatus } from "./astra-first-status";
import { productionServices } from "./production-service";
import { readProductionSettings } from "./production-configuration";
import { resolveExecutionProfile } from "../model-runtime/registry";
import { applicationGameplayTaskSelection } from "../production/task-defaults";
import { randomUUID } from "node:crypto";
import { runTurn, resumeTurn } from "../gameplay/turn-engine";
import { runAstraTurn, resumeAstraTurn, selectAstraPrimaryRuntime } from "../gameplay/astra-primary";
import { withAstraTurnPin } from "../production/dm-turn-pin";
import { DM_LOOP_RUNTIME, runDmLoopTurn } from "../gameplay/dm-loop/loop";
import { runCampaignTurn, resumeCampaignTurn, bookkeeperOf, type BookkeeperSelection, type CampaignTurnDependencies, type TwoPassDependencies,
  type TwoPassObservation } from "../gameplay/dm-loop/two-pass";
import { dmLoopPinFromProfile, dmLoopProfile } from "../production/dm-loop-pin";
import { createDmModel } from "./dm/model";
import { keepLiveTurnLedger, publishLiveTurnEvent } from "./dm/live-turns";
import { appendObservations } from "../gameplay/dm-loop/observations";
import { saveTurnSnapshot } from "./turn-snapshots";
import { scheduleQuotableCheck } from "./voice/quotable-check";
import { checkLedger } from "../gameplay/dm-loop/ledger-check";
import { checkRollsTold } from "../gameplay/dm-loop/roll-check";
import { awaitFirstTurnPrep, prepSchedulable, schedulePrep } from "./hidden-layer-prep";
import { scheduleFightFold } from "./note-fold";
import { scheduleBattleBackground } from "../live2d/server/battle-schedule";
import { markBoostUsed, readDmSettings, type DmSettings } from "./dm-settings";
import { dossierService } from "./dossier";
import { digestOnEntry, entryCheckDue } from "./session-digest";
import { syncWorldFromDossier } from "./world-bridge";
import { loopFeedbackProvider } from "../gameplay/dm-loop/feedback";
import { readPublicCampaign } from "./public-campaign";
import type { TurnStore } from "../gameplay/server-contracts";
import type { MemoryStore, SummaryProvider } from "../memory/server-contracts";
import type { DmLoopObservation } from "../gameplay/dm-loop/contracts";
import { astraStartupPending, AstraStartupPendingError } from "../gameplay/startup-admission";
import type { CharacterSheetV1 } from "../adventures/bootstrap-contracts";
import { DmError } from "../gameplay/dm-errors";
import { createMemoryStore } from "./memory/store";
import { memoryAwareProvider, preflightMemory } from "../memory/lifecycle";
import { runWithAstraMemoryMaintenance } from "../memory/after-commit";
import {
  validateConfigurePlayInput,
  validateGuidanceApproval,
  validateResumeInput,
  validateTurnInput,
} from "../gameplay/request-validation";
import { anthropicApiKey } from "./anthropic-endpoint";

// Service credentials do not replace the verified browser-owner and campaign guard.
async function authorizedStore(campaignId: string) {
  const owner = await authorizeCampaign(campaignId);
  // Bind once. A concurrent activation causes a conflict, never a new-branch retry.
  const timeline = await createSaveStore(owner.user.id).fence(campaignId);
  return { ...storesFor(owner.user.id, timeline), owner, timeline };
}
type OwnerClient = Awaited<ReturnType<typeof authorizeCampaign>>["client"];
async function reviewedPlayerSheets(client: OwnerClient, campaignId: string) {
  const result = await client.from("rpg_entities").select("character_sheet")
    .eq("campaign_id", campaignId).eq("kind", "player");
  if (result.error) throw new DmError("unavailable", true);
  return (result.data ?? []).map((row) =>
    row.character_sheet as CharacterSheetV1 | null);
}
async function campaignStartupPending(
  client: OwnerClient,
  campaignId: string,
  timeline: TimelineFence,
  rulesetId: string,
  takeoverActive: boolean,
  astraEnabled: boolean,
) {
  if (rulesetId !== "world-logic-v1" || (takeoverActive && astraEnabled))
    return false;
  const sheets = await reviewedPlayerSheets(client, campaignId);
  if (!sheets.some((sheet) => sheet?.schemaVersion === 1 &&
    (sheet.mode === "structured_rpg" || sheet.mode === "narrative")))
    return false;
  return astraStartupPending(rulesetId, sheets, takeoverActive,
    astraEnabled, takeoverActive || await readAstraFirstOpeningStatus(campaignId, timeline));
}
function storesFor(ownerId: string, timeline: TimelineFence) {
  return {
    store: createTurnStore(ownerId, undefined, timeline),
    memory: createMemoryStore(ownerId, undefined, timeline),
  };
}
function requireTimeline(value: { timeline?: TimelineFence }) {
  if (!isTimelineFence(value.timeline))
    throw new PersistenceError("validation");
  return value.timeline;
}
/** Server log of the loop (never the player): request sizes, usage, cache share, receipts. */
function logDmLoop(observation: DmLoopObservation) {
  if (observation.type === "live") {
    publishLiveTurnEvent(observation.operationId, observation.event);
    return;
  }
  if (observation.type === "request_finished") {
    const u = observation.usage;
    console.info(JSON.stringify({ event: "dm_loop_request", operationId: observation.operationId, request: observation.request,
      model: `${u.providerId}/${u.modelId}`, effort: u.effort, inputTokens: u.inputTokens, cacheReadTokens: u.cacheReadTokens,
      cacheWriteTokens: u.cacheWriteTokens, cacheReadShare: u.inputTokens ? Number((u.cacheReadTokens / u.inputTokens).toFixed(3)) : 0,
      outputTokens: u.outputTokens, costUsd: Number(u.costUsd.toFixed(5)), latencyMs: u.latencyMs, firstTextMs: u.firstTextMs,
      toolCalls: u.toolCalls, stop: observation.stop }));
  } else if (observation.type === "turn_finished") {
    // Polish item 14: one line per turn, to tell deep thinking from tool rounds or cache misses.
    console.info(JSON.stringify({ event: "dm_loop_turn", operationId: observation.operationId, effort: observation.effort, depthReason: observation.depthReason,
      firstWordMs: observation.firstWordMs, turnMs: observation.turnMs, requests: observation.requests, toolCalls: observation.toolCalls,
      cacheReadShare: observation.cacheReadShare, costUsd: observation.costUsd }));
  } else if (observation.type === "tool_receipt") {
    console.info(JSON.stringify({ event: "dm_loop_tool", operationId: observation.operationId, position: observation.receipt.position,
      tool: observation.receipt.call.name, ok: observation.receipt.result.ok }));
  } else if (observation.type === "diagnostic") {
    console.info(JSON.stringify({ event: "dm_loop_diagnostic", operationId: observation.operationId, ...observation.diagnostic }));
  } else if (observation.type === "failure") {
    console.info(JSON.stringify({ event: "dm_loop_failed", operationId: observation.operationId, code: observation.code,
      retryable: observation.retryable, message: observation.message }));
  } else if (observation.type === "request_started") {
    console.info(JSON.stringify({ event: "dm_loop_request_started", operationId: observation.operationId,
      request: observation.request, requestBytes: observation.requestBytes, cachedPrefixBytes: observation.cachedPrefixBytes }));
  } else if ((observation as unknown as TwoPassObservation).type === "two_pass") {
    // Polish 3 §2: the split's milestones. The ledger is private: kept for the shot director, never logged.
    const split = observation as unknown as TwoPassObservation;
    if (split.event === "writer_finished") {
      if (split.ledger.trim()) keepLiveTurnLedger(split.operationId, split.ledger);
      console.info(JSON.stringify({ event: "dm_loop_writer_finished", operationId: split.operationId, atMs: split.atMs, requests: split.requests,
        ledgerFound: split.ledgerFound, ledgerChars: split.ledgerChars, narrationChars: split.narrationChars }));
    } else {
      console.info(JSON.stringify({ event: "dm_loop_bookkeeper_finished", operationId: split.operationId, atMs: split.atMs, requests: split.requests,
        calls: split.calls, rejected: split.rejected, finished: split.finished }));
    }
  }
}
function dmLoopDependencies(store: TurnStore, memory: MemoryStore, summaries: SummaryProvider,
  production: ReturnType<typeof productionServices>, settings: () => Promise<DmSettings>, ownerId: string, campaignId: string): TwoPassDependencies {
  return {
    store, memory, summaries,
    model: (pin) => createDmModel(pin),
    pin: async (claim) => {
      // The campaign's DM settings at the turn's start: the model, the
      // per-turn limits, the depth range and the «important turn» flag are
      // pinned together and stay with the operation. Polish 3 §2: on a split
      // campaign the pinned «dm.turn» model is the writer.
      const current = await settings();
      return { ...dmLoopPinFromProfile(await production.pinDmLoopModel(claim.lease.operationId, async () => current.split?.writer ?? current.dmTurn)),
        limits: current.limits, depth: current.depth, boostNext: current.boostNext, continuation: current.options.continuation };
    },
    bookkeeperModel: (selection: BookkeeperSelection) => createDmModel(selection),
    // Fix run A6: on «пишет — записывает», a cheap model compares the story with the records before the commit.
    ledgerCheck: (input) => checkLedger(anthropicApiKey(), input),
    // Fix run B3 (item 60): every roll the player saw is told (both modes).
    rollCheck: (input) => checkRollsTold(anthropicApiKey(), input),
    afterCommit: async ({ operationId, playerLikes, ownerRule, combatEnded, combatStarted, boostUsed, playMinutes, input, source, narration }) => {
      // Polish 3 §4: the state before this turn, with the campaign's rules of the moment, for the replay tool (never fails the turn).
      if (source && input) {
        const current = await settings().catch(() => null);
        await saveTurnSnapshot(ownerId, campaignId, input, source, current ? { limits: current.limits, depth: current.depth, split: current.split, dmTurn: current.dmTurn } : undefined);
      }
      // Voice stage part 5: the quotable-line check, off the turn's path (the flags reach the next turn's tail).
      if (narration?.trim() && source) scheduleQuotableCheck({ ownerId, campaignId, operationId, narration, language: source.snapshot.settings.values.language === "ru" ? "ru" : "en" });
      const dossier = await dossierService(ownerId, campaignId);
      // Polish item 15: the DM's note lives next to the player's own words, never over them.
      // Fix run A2: and it is appended to the stored observations, never rewritten whole.
      if (playerLikes) await dossier.dmLikes(appendObservations(String(source?.snapshot.campaign.dm_likes ?? ""), playerLikes));
      // Fix run B2: an owner's out-of-game rule is pinned (the highest authority, never dropped by a budget); a repeat is not.
      if (ownerRule && !(source?.snapshot.campaign.pinned_facts ?? []).some((pin) => pin.text.trim() === ownerRule.trim())) await dossier.pin(ownerRule).catch(() => {});
      if (boostUsed) await markBoostUsed(campaignId);
      // Fix run B2 (2): a fight's notes fold into a line each, in the background.
      if (combatEnded) scheduleFightFold(ownerId, campaignId, operationId);
      // Fix S3-pre Part 3: a fight that starts on a prepared place gets its painted top-down background, in the background.
      if (combatStarted) scheduleBattleBackground(ownerId, campaignId);
      // Polish item 21: the campaign's play time counts real minutes of play.
      if (playMinutes > 0) await dossier.playTime(playMinutes).catch(() => {});
      // The World Engine mirror of the dossier's plans (a usable World Lab basis).
      try {
        const source = await dossier.source();
        await syncWorldFromDossier(ownerId, campaignId, source.timeline, source);
      } catch (error) {
        console.info(JSON.stringify({ event: "world_bridge_skipped", campaignId, message: error instanceof Error ? error.message : String(error) }));
      }
    },
    observe: logDmLoop,
  };
}
/** Polish 3 §2: the campaign's DM architecture from its settings — today's loop, or the writer +
 * bookkeeper split; a turn in flight resumes on the runtime its pin names. The turn rows are
 * dm-loop-v1 rows either way. */
async function loopRunner(deps: TwoPassDependencies, settings: () => Promise<DmSettings>) {
  const current = await settings();
  const campaignDeps: CampaignTurnDependencies = { ...deps, split: current.split, ...(current.split ? { bookkeeper: bookkeeperOf(current.split) } : {}) };
  return { run: (input: Parameters<typeof runDmLoopTurn>[0]) => runCampaignTurn(input, campaignDeps),
    resume: (input: Parameters<typeof resumeCampaignTurn>[0]) => resumeCampaignTurn(input, campaignDeps) };
}
/** Runs a dm-loop-v1 turn. Polish item 22: the legacy memory summaries (GPT-6
 * Astra, two per turn, ≈$3.50 a session) are not queued for a loop campaign any
 * more — the dossier reads the Stage 4 session recaps and the notebook instead,
 * and the exact-event retrieval needs no model call. One memory, not two. */
async function runLoopWithMaintenance(store: TurnStore, memory: MemoryStore, summaries: SummaryProvider,
  timeline: TimelineFence, campaignId: string, execute: () => Promise<Awaited<ReturnType<typeof runDmLoopTurn>>>) {
  void store; void memory; void summaries; void timeline;
  const result = await execute();
  if (result.status === "committed") console.info(JSON.stringify({ event: "legacy_memory_skipped", campaignId, reason: "dm-loop-v1 keeps one memory: the dossier" }));
  return result;
}
/** Whether a world-logic campaign's opening is still unfinished (play must wait). */
async function openingPending(client: OwnerClient, campaignId: string, timeline: TimelineFence, rulesetId: string) {
  if (rulesetId !== "world-logic-v1") return false;
  const sheets = await reviewedPlayerSheets(client, campaignId);
  if (!sheets.some((sheet) => sheet?.schemaVersion === 1 &&
    (sheet.mode === "structured_rpg" || sheet.mode === "narrative"))) return false;
  return !(await readAstraFirstOpeningStatus(campaignId, timeline));
}
/** Polish 2: the world clock without side effects (no digest, no settings read) — for the picture
 * path, which only needs the time of day of the snapshot it draws from. */
export async function readWorldClock(campaignId: string): Promise<{ worldMinutes: number | null }> {
  const { store } = await authorizedStore(campaignId);
  const play = await store.readPlay(campaignId);
  return { worldMinutes: Number.isFinite(play.worldMinutes) ? play.worldMinutes : null };
}
/** `prep: false` — the Settings screen's read never schedules the DM's prep (fix S3-pre, KF-hidden-layer). */
export async function readPlay(campaignId: string, options: { prep?: boolean } = {}) {
  const { store, owner, timeline } = await authorizedStore(campaignId);
  const play = await store.readPlay(campaignId);
  const settings = await readProductionSettings(campaignId);
  const dmSettings = await readDmSettings(campaignId);
  const optIn = process.env.RPG_ASTRA_PRIMARY_P1 === "1";
  const takeoverActive = settings.ruleset.id === "world-logic-v1" &&
    (await store.takeoverStatus?.(campaignId))?.active === true;
  if (dmSettings.runtime === DM_LOOP_RUNTIME) {
    const pending = await openingPending(owner.client, campaignId, timeline, settings.ruleset.id);
    const choice = dmLoopPinFromProfile(dmLoopProfile(settings.runtimePolicy, dmSettings.split?.writer ?? dmSettings.dmTurn));
    const key = choice.providerId === "anthropic" ? anthropicApiKey() : process.env.OPENAI_API_KEY;
    // Stage 4 §4: on entry, a stale open session is closed and digested, a
    // closed one without «Ранее в…» gets its digest; never blocks the read.
    // Fix run A4: at most once a minute per campaign, never while a turn is unresolved (the poll is cheap now).
    if (!pending && key?.trim() && !play.turns.some((turn) => turn.status === "pending" || turn.status === "generating" || turn.status === "awaiting_confirmation") &&
      entryCheckDue(campaignId)) {
      try { await digestOnEntry(campaignId, await readPublicCampaign(campaignId), play, owner.user.id); }
      catch { /* the digest is a background courtesy */ }
      // Fix run B1: the DM's prep writes the campaign's hidden layer once (before its first turn, or now for a campaign
      // that has none); in the background, never twice at a time, a failed one retried an hour later at the soonest.
      const pure = dmSettings.options.pureSimulation;
      if (options.prep !== false && prepSchedulable(campaignId, Date.now(), "play", pure)) schedulePrep(campaignId, owner.user.id, play.turns.some((turn) => turn.status === "committed") ? "existing" : "first", pure);
    }
    return { ...(pending ? { ...play, startupPending: true } : play), configured: !!key?.trim(), model: choice.modelId,
      rulesetId: settings.ruleset.id };
  }
  const startupPending = await campaignStartupPending(owner.client, campaignId, timeline,
    settings.ruleset.id, takeoverActive, optIn);
  const publicPlay = startupPending ? { ...play, startupPending: true } : play;
  if (settings.ruleset.id === "world-logic-v1" &&
    optIn &&
    takeoverActive)
    return { ...publicPlay, configured: !!process.env.OPENAI_API_KEY,
      model: "gpt-6-astra", rulesetId: settings.ruleset.id };
  let model: string | null = null;
  try {
    model = resolveExecutionProfile({
      task:
        settings.ruleset.id === "world-logic-v1" ? "world.resolve" : "dm.plan",
      profileId: randomUUID(),
      campaignPolicy: settings.runtimePolicy,
      globalDefault: applicationGameplayTaskSelection(
        settings.ruleset.id === "world-logic-v1" ? "world.resolve" : "dm.plan",
        settings.providers.globalDefault,
      ),
      providerAvailable: () =>
        settings.providers.providers.find((provider) => provider.id === "openai")?.status === "configured_not_tested",
    }).modelId;
  } catch {
    /* Keep unavailable explicit selection visible; never fall back. */
  }
  return {
    ...publicPlay,
    configured: model !== null,
    model,
    ...(settings.ruleset.id === "world-logic-v1" ||
    settings.ruleset.id === "console-basic-v1"
      ? { rulesetId: settings.ruleset.id }
      : {}),
  };
}
export async function readTurn(campaignId: string, operationId: string) {
  const { store } = await authorizedStore(campaignId);
  if (!isUuid(operationId)) throw new PersistenceError("not_found");
  return store.getPublic(campaignId, operationId);
}
export async function submitTurn(campaignId: string, value: unknown) {
  const { user, client } = await authorizeCampaign(campaignId);
  const input = validateTurnInput(value, campaignId);
  const { store, memory } = storesFor(user.id, requireTimeline(input));
  const pinned = await store.runtimeIdentity?.(campaignId, input.operationId) ?? null;
  let existing = pinned !== null;
  if (!existing) {
    try {
      await store.getPublic(campaignId, input.operationId);
      existing = true;
    } catch {
      // A missing operation is checked again by the durable begin authority.
    }
  }
  // Historical manifests can contain a turn without the newer runtime field.
  // Its saved operation keeps legacy semantics even after takeover.
  const runtime = existing && pinned === null ? "legacy-v1" : pinned;
  const optIn = process.env.RPG_ASTRA_PRIMARY_P1 === "1";
  const newOrdinary = !existing &&
    (input.mode === "game" || input.mode === "mechanic" ||
      input.mode === "companion");
  const rulesetId = newOrdinary
    ? (await readProductionSettings(campaignId)).ruleset.id : null;
  // The new runtime: a campaign set to dm-loop-v1 plays game and companion
  // turns on it from its first scene; an operation pinned to it always resumes on it.
  const dmSettings = newOrdinary || runtime === DM_LOOP_RUNTIME ? await readDmSettings(campaignId) : null;
  if (runtime === DM_LOOP_RUNTIME || (newOrdinary && (input.mode === "game" || input.mode === "companion") &&
    dmSettings?.runtime === DM_LOOP_RUNTIME)) {
    if (newOrdinary && rulesetId && await openingPending(client, campaignId, requireTimeline(input), rulesetId))
      throw new AstraStartupPendingError();
    // Fix S3-pre (KF-hidden-layer): a brand-new campaign's first turn waits for the DM's prep — one wait, once.
    if (newOrdinary && input.mode === "game")
      await awaitFirstTurnPrep(campaignId, user.id, async () => (await store.readPlay(campaignId)).turns.filter((turn) => turn.status === "committed" && turn.mode === "game").length,
        dmSettings?.options.pureSimulation === true)
        .catch(() => { /* the prep never blocks a turn */ });
    const loopProduction = productionServices(user.id, campaignId, requireTimeline(input));
    const deps = dmLoopDependencies(store, memory, loopProduction.summaries, loopProduction,
      async () => dmSettings ?? readDmSettings(campaignId), user.id, campaignId);
    return runLoopWithMaintenance(store, memory, loopProduction.summaries, requireTimeline(input), campaignId,
      async () => (await loopRunner(deps, async () => dmSettings ?? readDmSettings(campaignId))).run(input));
  }
  const worldTakeover = rulesetId === "world-logic-v1"
    ? (await store.takeoverStatus?.(campaignId))?.active === true : false;
  if (newOrdinary && rulesetId === "world-logic-v1" &&
    await campaignStartupPending(client, campaignId, requireTimeline(input),
      rulesetId, worldTakeover, optIn))
    throw new AstraStartupPendingError();
  const production = productionServices(
    user.id,
    campaignId,
    requireTimeline(input),
  );
  const selected = selectAstraPrimaryRuntime(runtime, optIn, input.mode, rulesetId, worldTakeover);
  if (selected) return runWithAstraMemoryMaintenance(store, memory, production.summaries,
    requireTimeline(input), (observedStore) => runAstraTurn(input, {
      store: withAstraTurnPin(observedStore, production.pinDmTurnModel), memory,
      summaries: production.summaries, provider: production.astraProvider,
    }), after);
  // Stage 4 §2b: Chat with DM / Teach DM on a loop campaign run on the
  // campaign's own model (the old engine commits the answer and the proposal).
  const loopFeedback = (input.mode === "feedback" || input.mode === "ooc") && !existing &&
    (await readDmSettings(campaignId)).runtime === DM_LOOP_RUNTIME;
  if (!existing && process.env.OPENAI_API_KEY && !loopFeedback)
    await preflightMemory(
      input,
      memory,
      production.summaries,
      (stage) => production.planModel(stage),
    );
  if (loopFeedback) {
    const feedbackSettings = await readDmSettings(campaignId);
    const pin = dmLoopPinFromProfile(dmLoopProfile((await readProductionSettings(campaignId)).runtimePolicy, feedbackSettings.dmTurn));
    return runTurn(input, { store, provider: loopFeedbackProvider(createDmModel(pin), pin.effort, production.provider) });
  }
  return runTurn(input, {
    store,
    provider: memoryAwareProvider(
      production.provider,
      memory,
      production.contextModel,
    ),
    prepareWorld: production.prepareWorld,
    prepareWorldLogic: production.prepareWorldLogic,
    prepareCombatIntent: production.prepareCombatIntent,
    prepareFoundation: production.prepareFoundation,
    validateFoundation: production.validateFoundation,
  });
}
export async function continueTurn(
  campaignId: string,
  operationId: string,
  value: unknown,
) {
  const { user } = await authorizeCampaign(campaignId);
  const input = validateResumeInput(value, campaignId, operationId);
  const { store, memory } = storesFor(user.id, requireTimeline(input));
  const production = productionServices(
    user.id,
    campaignId,
    requireTimeline(input),
  );
  const identity = await store.runtimeIdentity?.(campaignId, operationId);
  if (identity === DM_LOOP_RUNTIME) {
    const deps = dmLoopDependencies(store, memory, production.summaries, production, () => readDmSettings(campaignId), user.id, campaignId);
    return runLoopWithMaintenance(store, memory, production.summaries, requireTimeline(input), campaignId,
      async () => (await loopRunner(deps, () => readDmSettings(campaignId))).resume(input));
  }
  if (identity === "astra-primary-v1")
    return runWithAstraMemoryMaintenance(store, memory, production.summaries,
      requireTimeline(input), (observedStore) => resumeAstraTurn(input, {
        store: withAstraTurnPin(observedStore, production.pinDmTurnModel), memory,
        summaries: production.summaries, provider: production.astraProvider,
      }), after);
  return resumeTurn(input, {
    store,
    provider: memoryAwareProvider(
      production.provider,
      memory,
      production.contextModel,
    ),
    prepareWorld: production.prepareWorld,
    prepareWorldLogic: production.prepareWorldLogic,
    prepareCombatIntent: production.prepareCombatIntent,
    prepareFoundation: production.prepareFoundation,
    validateFoundation: production.validateFoundation,
  });
}
export async function configurePlay(campaignId: string, value: unknown) {
  const { user } = await authorizeCampaign(campaignId);
  const input = validateConfigurePlayInput(value, campaignId);
  const { store } = storesFor(user.id, requireTimeline(input));
  return store.configure(input);
}
export async function approveGuidance(campaignId: string, value: unknown) {
  const { user } = await authorizeCampaign(campaignId);
  const input = validateGuidanceApproval(value, campaignId);
  const { store } = storesFor(user.id, requireTimeline(input));
  return store.approveGuidance(input);
}
