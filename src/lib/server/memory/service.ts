import "server-only";
import { authorizeCampaign } from "../campaign-authorization";
import { createMemoryStore } from "./store";
import { createSummaryProvider } from "./provider";
import { processMemoryJobs } from "../../memory/jobs";
import { validateMemoryRequest } from "../../memory/request-validation";

async function authorizedMemory(campaignId: string) {
  const { user } = await authorizeCampaign(campaignId);
  return createMemoryStore(user.id);
}
export async function readMemory(campaignId: string) {
  return (await authorizedMemory(campaignId)).read(campaignId);
}
export async function mutateMemory(
  campaignId: string,
  action: "end" | "continue" | "retry",
  value: unknown,
) {
  const store = await authorizedMemory(campaignId);
  const snapshot =
    action === "end"
      ? await store.end(validateMemoryRequest(value, campaignId, "end"))
      : action === "continue"
        ? await store.continueSession(
            validateMemoryRequest(value, campaignId, "continue"),
          )
        : await store.retry(validateMemoryRequest(value, campaignId, "retry"));
  return {
    snapshot,
    // Capture already-authorized store, not request cookies, for after-response work.
    run: async () => {
      try {
        await processMemoryJobs(campaignId, store, createSummaryProvider());
      } catch {
        console.info(
          JSON.stringify({
            event: "memory_work_pending",
            category: "unavailable",
          }),
        );
      }
    },
  };
}
