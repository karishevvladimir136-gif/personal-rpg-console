import "server-only";
import { authorizeCampaign } from "./campaign-authorization";
import { createSaveStore } from "./saves/store";
import { databaseError, PersistenceError } from "./errors";
import { parseCampaignPremiseCommand } from "../production/premise";
import type { CampaignPremise } from "../production/premise-contracts";

export async function readCampaignPremise(campaignId: string, before: number | null = null): Promise<CampaignPremise> {
  const { user, client } = await authorizeCampaign(campaignId);
  if (before !== null && (!Number.isSafeInteger(before) || before < 1)) throw new PersistenceError("validation");
  const fence = await createSaveStore(user.id).fence(campaignId);
  const { data, error } = await client.rpc("rpg_campaign_premise", { p_campaign_id: campaignId, p_action: "read", p_payload: { before }, p_timeline: fence });
  if (error) throw databaseError(error);
  return data as CampaignPremise;
}
export async function saveCampaignPremise(campaignId: string, value: unknown): Promise<CampaignPremise> {
  const { client } = await authorizeCampaign(campaignId);
  let input;
  try { input = parseCampaignPremiseCommand(value); } catch { throw new PersistenceError("validation"); }
  const { data, error } = await client.rpc("rpg_campaign_premise", { p_campaign_id: campaignId, p_action: input.action, p_payload: input, p_timeline: input.timeline });
  if (error) throw databaseError(error);
  return data as CampaignPremise;
}
