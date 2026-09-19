import "server-only";
import { authorizeCampaign } from "../campaign-authorization";
import { PersistenceError } from "../errors";
import { ValidationError } from "../../persistence/validation";
import { validateSaveCommand } from "../../saves/validation";
import { createSaveStore } from "./store";

export async function readSaves(campaignId: string) {
  const { user } = await authorizeCampaign(campaignId);
  return createSaveStore(user.id).read(campaignId);
}
export async function mutateSaves(
  campaignId: string,
  action: string,
  value: unknown,
) {
  const { user } = await authorizeCampaign(campaignId);
  const store = createSaveStore(user.id);
  try {
    const command = validateSaveCommand(value, campaignId, action);
    switch (command.action) {
      case "create":
        return store.create(command.input);
      case "load":
        return store.load(command.input);
      case "switch":
        return store.switchTimeline(command.input);
      case "policy":
        return store.policy(command.input);
    }
  } catch (cause) {
    if (cause instanceof ValidationError)
      throw new PersistenceError("validation");
    throw cause;
  }
}
