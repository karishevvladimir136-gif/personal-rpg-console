import "server-only";
import { requireOwner } from "./auth";
import { isUuid } from "../persistence/validation";
import { PersistenceError } from "./errors";

export async function authorizeCampaign(campaignId: string) {
  const owner = await requireOwner();
  if (!isUuid(campaignId)) throw new PersistenceError("not_found");
  const campaign = await owner.client
    .from("rpg_campaigns")
    .select("id")
    .eq("id", campaignId)
    .maybeSingle();
  if (campaign.error) throw new PersistenceError("unavailable");
  if (!campaign.data) throw new PersistenceError("not_found");
  return owner;
}
