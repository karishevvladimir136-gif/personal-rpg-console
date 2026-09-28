import "server-only";
import { authorizeCampaign } from "../server/campaign-authorization";
import { applyMutation, readCampaign } from "../server/repository";
import { PersistenceError } from "../server/errors";
import { readMutationReceipt } from "../server/mutation-receipt";
import { applyFrameLifecycleMutation } from "../server/frame-lifecycle-mutation";
import { writeVisualFrame } from "./authority";

export async function saveVisualFrame(value: unknown) {
  let ownerId: string | null = null;
  return writeVisualFrame(value, {
    authorize: async (campaignId) => {
      ownerId = (await authorizeCampaign(campaignId)).user.id;
    },
    receipt: async (input) => {
      if (!ownerId) throw new PersistenceError("forbidden");
      return readMutationReceipt(ownerId, input);
    },
    snapshot: readCampaign,
    apply: applyMutation,
    applyFrame: async (input) => {
      if (!ownerId) throw new PersistenceError("forbidden");
      return applyFrameLifecycleMutation(ownerId, input);
    },
  });
}
