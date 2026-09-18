import "server-only";
import { authorizeCampaign } from "./campaign-authorization";
import { PersistenceError } from "./errors";
import { isUuid } from "../persistence/validation";
import { createDmProvider, createTurnStore } from "./dm";
import { runTurn, resumeTurn } from "../gameplay/turn-engine";
import { createMemoryStore } from "./memory/store";
import { createSummaryProvider } from "./memory/provider";
import { memoryAwareProvider, preflightMemory } from "../memory/lifecycle";
import {
  validateConfigurePlayInput,
  validateGuidanceApproval,
  validateResumeInput,
  validateTurnInput,
} from "../gameplay/request-validation";

// Service credentials do not replace the verified browser-owner and campaign guard.
async function authorizedStore(campaignId: string) {
  const { user } = await authorizeCampaign(campaignId);
  return {
    store: createTurnStore(user.id),
    memory: createMemoryStore(user.id),
  };
}
export async function readPlay(campaignId: string) {
  return (await authorizedStore(campaignId)).store.readPlay(campaignId);
}
export async function readTurn(campaignId: string, operationId: string) {
  const { store } = await authorizedStore(campaignId);
  if (!isUuid(operationId)) throw new PersistenceError("not_found");
  return store.getPublic(campaignId, operationId);
}
export async function submitTurn(campaignId: string, value: unknown) {
  const { store, memory } = await authorizedStore(campaignId);
  const input = validateTurnInput(value, campaignId);
  let existing = false;
  try {
    await store.getPublic(campaignId, input.operationId);
    existing = true;
  } catch {
    /* begin still enforces identity and access. */
  }
  if (!existing && process.env.OPENAI_API_KEY && process.env.OPENAI_DM_MODEL)
    await preflightMemory(
      input,
      memory,
      createSummaryProvider(),
      process.env.OPENAI_DM_MODEL,
    );
  return runTurn(input, {
    store,
    provider: memoryAwareProvider(createDmProvider(), memory),
  });
}
export async function continueTurn(
  campaignId: string,
  operationId: string,
  value: unknown,
) {
  const { store, memory } = await authorizedStore(campaignId);
  const input = validateResumeInput(value, campaignId, operationId);
  return resumeTurn(input, {
    store,
    provider: memoryAwareProvider(createDmProvider(), memory),
  });
}
export async function configurePlay(campaignId: string, value: unknown) {
  const { store } = await authorizedStore(campaignId);
  return store.configure(validateConfigurePlayInput(value, campaignId));
}
export async function approveGuidance(campaignId: string, value: unknown) {
  const { store } = await authorizedStore(campaignId);
  return store.approveGuidance(validateGuidanceApproval(value, campaignId));
}
