import "server-only";
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
import { astraStartupPending, AstraStartupPendingError } from "../gameplay/startup-admission";
import type { CharacterSheetV1 } from "../adventures/bootstrap-contracts";
import { DmError } from "../gameplay/dm-errors";
import { createMemoryStore } from "./memory/store";
import { memoryAwareProvider, preflightMemory } from "../memory/lifecycle";
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
export async function readPlay(campaignId: string) {
  const { store, owner, timeline } = await authorizedStore(campaignId);
  const play = await store.readPlay(campaignId);
  const settings = await readProductionSettings(campaignId);
  const optIn = process.env.RPG_ASTRA_PRIMARY_P1 === "1";
  const takeoverActive = settings.ruleset.id === "world-logic-v1" &&
    (await store.takeoverStatus?.(campaignId))?.active === true;
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
  const selected = selectAstraPrimaryRuntime(runtime,optIn,input.mode,rulesetId,
    worldTakeover);
  if (selected) return runAstraTurn(input, {
    store, memory, summaries: production.summaries,
    provider: production.astraProvider,
  });
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
  if ((await store.runtimeIdentity?.(campaignId, operationId)) === "astra-primary-v1")
    return resumeAstraTurn(input, {
      store, memory, summaries: production.summaries,
      provider: production.astraProvider,
    });
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
