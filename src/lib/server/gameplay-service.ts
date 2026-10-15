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
import { DM_LOOP_RUNTIME, runDmLoopTurn, resumeDmLoopTurn, type DmLoopDependencies } from "../gameplay/dm-loop/loop";
import { dmLoopPinFromProfile, pinDmLoopModel } from "../production/dm-loop-pin";
import { createDmModel } from "./dm/model";
import { publishLiveTurnEvent } from "./dm/live-turns";
import { readDmSettings, type DmSettings } from "./dm-settings";
import { maintainAstraMemoryAfterCommit } from "../memory/lifecycle";
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
  } else if (observation.type === "tool_receipt") {
    console.info(JSON.stringify({ event: "dm_loop_tool", operationId: observation.operationId, position: observation.receipt.position,
      tool: observation.receipt.call.name, ok: observation.receipt.result.ok }));
  } else if (observation.type === "diagnostic") {
    console.info(JSON.stringify({ event: "dm_loop_diagnostic", operationId: observation.operationId, ...observation.diagnostic }));
  } else if (observation.type === "request_started") {
    console.info(JSON.stringify({ event: "dm_loop_request_started", operationId: observation.operationId,
      request: observation.request, requestBytes: observation.requestBytes, cachedPrefixBytes: observation.cachedPrefixBytes }));
  }
}
function dmLoopDependencies(store: TurnStore, memory: MemoryStore, summaries: SummaryProvider,
  production: ReturnType<typeof productionServices>, settings: () => Promise<DmSettings>): DmLoopDependencies {
  return {
    store, memory, summaries,
    model: (pin) => createDmModel(pin),
    pin: async (claim) => dmLoopPinFromProfile(await production.pinDmLoopModel(claim.lease.operationId,
      async () => (await settings()).dmTurn)),
    observe: logDmLoop,
  };
}
/** Runs a dm-loop-v1 turn and schedules the existing memory maintenance after a commit. */
async function runLoopWithMaintenance(store: TurnStore, memory: MemoryStore, summaries: SummaryProvider,
  timeline: TimelineFence, campaignId: string, execute: () => Promise<Awaited<ReturnType<typeof runDmLoopTurn>>>) {
  const result = await execute();
  if (result.status === "committed") {
    try {
      after(async () => {
        try { await maintainAstraMemoryAfterCommit(campaignId, memory, summaries, timeline); }
        catch { console.info(JSON.stringify({ event: "memory_work_pending", category: "unavailable" })); }
      });
    } catch { console.info(JSON.stringify({ event: "memory_work_pending", category: "unavailable" })); }
  }
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
export async function readPlay(campaignId: string) {
  const { store, owner, timeline } = await authorizedStore(campaignId);
  const play = await store.readPlay(campaignId);
  const settings = await readProductionSettings(campaignId);
  const dmSettings = await readDmSettings(campaignId);
  const optIn = process.env.RPG_ASTRA_PRIMARY_P1 === "1";
  const takeoverActive = settings.ruleset.id === "world-logic-v1" &&
    (await store.takeoverStatus?.(campaignId))?.active === true;
  if (dmSettings.runtime === DM_LOOP_RUNTIME) {
    const pending = await openingPending(owner.client, campaignId, timeline, settings.ruleset.id);
    const choice = dmLoopPinFromProfile((await import("../production/dm-loop-pin")).dmLoopProfile(settings.runtimePolicy, dmSettings.dmTurn));
    const key = choice.providerId === "anthropic" ? process.env.ANTHROPIC_API_KEY : process.env.OPENAI_API_KEY;
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
        settings.providers.providers[0]?.status === "configured_not_tested",
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
  const production = productionServices(
    user.id,
    campaignId,
    requireTimeline(input),
  );
  // The new runtime: a campaign set to dm-loop-v1 plays game and companion
  // turns on it from its first scene; an operation pinned to it always resumes on it.
  const dmSettings = newOrdinary || runtime === DM_LOOP_RUNTIME ? await readDmSettings(campaignId) : null;
  if (runtime === DM_LOOP_RUNTIME || (newOrdinary && (input.mode === "game" || input.mode === "companion") &&
    dmSettings?.runtime === DM_LOOP_RUNTIME)) {
    if (newOrdinary && rulesetId && await openingPending(client, campaignId, requireTimeline(input), rulesetId))
      throw new AstraStartupPendingError();
    const deps = dmLoopDependencies(store, memory, production.summaries, production, async () => dmSettings ?? readDmSettings(campaignId));
    return runLoopWithMaintenance(store, memory, production.summaries, requireTimeline(input), campaignId,
      () => runDmLoopTurn(input, deps));
  }
  const worldTakeover = rulesetId === "world-logic-v1"
    ? (await store.takeoverStatus?.(campaignId))?.active === true : false;
  if (newOrdinary && rulesetId === "world-logic-v1" &&
    await campaignStartupPending(client, campaignId, requireTimeline(input),
      rulesetId, worldTakeover, optIn))
    throw new AstraStartupPendingError();
  const selected = selectAstraPrimaryRuntime(runtime, optIn, input.mode, rulesetId, worldTakeover);
  if (selected) return runWithAstraMemoryMaintenance(store, memory, production.summaries,
    requireTimeline(input), (observedStore) => runAstraTurn(input, {
      store: withAstraTurnPin(observedStore, production.pinDmTurnModel), memory,
      summaries: production.summaries, provider: production.astraProvider,
    }), after);
  if (!existing && process.env.OPENAI_API_KEY)
    await preflightMemory(
      input,
      memory,
      production.summaries,
      (stage) => production.planModel(stage),
    );
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
    const deps = dmLoopDependencies(store, memory, production.summaries, production, () => readDmSettings(campaignId));
    return runLoopWithMaintenance(store, memory, production.summaries, requireTimeline(input), campaignId,
      () => resumeDmLoopTurn(input, deps));
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
