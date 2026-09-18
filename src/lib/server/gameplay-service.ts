import "server-only";
import { requireOwner } from "./auth";
import { PersistenceError } from "./errors";
import { isUuid } from "../persistence/validation";
import { createDmProvider, createTurnStore } from "./dm";
import { runTurn, resumeTurn } from "../gameplay/turn-engine";
import {
  validateConfigurePlayInput,
  validateGuidanceApproval,
  validateResumeInput,
  validateTurnInput,
} from "../gameplay/request-validation";

// Service credentials do not replace the verified browser-owner and campaign guard.
async function authorizedStore(campaignId: string) {
  const { client, user } = await requireOwner();
  if (!isUuid(campaignId)) throw new PersistenceError("not_found");
  const campaign = await client
    .from("rpg_campaigns")
    .select("id")
    .eq("id", campaignId)
    .maybeSingle();
  if (campaign.error) throw new PersistenceError("unavailable");
  if (!campaign.data) throw new PersistenceError("not_found");
  return createTurnStore(user.id);
}
export async function readPlay(campaignId: string) {
  return (await authorizedStore(campaignId)).readPlay(campaignId);
}
export async function readTurn(campaignId: string, operationId: string) {
  const store = await authorizedStore(campaignId);
  if (!isUuid(operationId)) throw new PersistenceError("not_found");
  return store.getPublic(campaignId, operationId);
}
export async function submitTurn(campaignId: string, value: unknown) {
  const store = await authorizedStore(campaignId);
  const input = validateTurnInput(value, campaignId);
  return runTurn(input, { store, provider: createDmProvider() });
}
export async function continueTurn(
  campaignId: string,
  operationId: string,
  value: unknown,
) {
  const store = await authorizedStore(campaignId);
  const input = validateResumeInput(value, campaignId, operationId);
  return resumeTurn(input, { store, provider: createDmProvider() });
}
export async function configurePlay(campaignId: string, value: unknown) {
  const store = await authorizedStore(campaignId);
  return store.configure(validateConfigurePlayInput(value, campaignId));
}
export async function approveGuidance(campaignId: string, value: unknown) {
  const store = await authorizedStore(campaignId);
  return store.approveGuidance(validateGuidanceApproval(value, campaignId));
}
