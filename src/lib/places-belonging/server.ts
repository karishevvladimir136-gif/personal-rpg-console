import "server-only";
import { authorizeCampaign } from "../server/campaign-authorization";
import { readCampaign, applyMutation } from "../server/repository";
import { PersistenceError } from "../server/errors";
import { readMutationReceipt } from "../server/mutation-receipt";
import { writeBelonging } from "./authority";

export async function saveBelonging(value: unknown) {
  let ownerId: string | null = null;
  return writeBelonging(value, {
    authorize: async (campaignId) => {
      ownerId = (await authorizeCampaign(campaignId)).user.id;
    },
    receipt: async (input) => {
      if (!ownerId) throw new PersistenceError("not_configured");
      return readMutationReceipt(ownerId, input);
    },
    snapshot: readCampaign,
    apply: applyMutation,
  });
}
