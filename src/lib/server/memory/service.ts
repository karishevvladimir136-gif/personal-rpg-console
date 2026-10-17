import "server-only";
import { authorizeCampaign } from "../campaign-authorization";
import { createMemoryStore } from "./store";
import { productionServices } from "../production-service";
import { processMemoryJobs } from "../../memory/jobs";
import { validateMemoryRequest } from "../../memory/request-validation";
import type { TimelineFence } from "../../saves/contracts";
import { createSaveStore } from "../saves/store";
import { DmError } from "../../gameplay/dm-errors";
import { scheduleDigest } from "../session-digest";
import { readDmSettings } from "../dm-settings";
import { DM_LOOP_RUNTIME } from "../../gameplay/dm-loop/contracts";

async function authorizedMemory(campaignId: string, timeline?: TimelineFence) {
  const { user } = await authorizeCampaign(campaignId);
  const bound = timeline ?? (await createSaveStore(user.id).fence(campaignId));
  return createMemoryStore(user.id, undefined, bound);
}
export async function readMemory(campaignId: string) {
  return (await authorizedMemory(campaignId)).read(campaignId);
}
export async function mutateMemory(
  campaignId: string,
  action: "end" | "continue" | "retry",
  value: unknown,
) {
  const { user } = await authorizeCampaign(campaignId);
  const input =
    action === "end"
      ? validateMemoryRequest(value, campaignId, "end")
      : action === "continue"
        ? validateMemoryRequest(value, campaignId, "continue")
        : validateMemoryRequest(value, campaignId, "retry");
  if (!input.timeline) throw new DmError("validation");
  const store = createMemoryStore(user.id, undefined, input.timeline);
  const production = productionServices(user.id, campaignId, input.timeline);
  const snapshot =
    action === "end"
      ? await store.end(validateMemoryRequest(value, campaignId, "end"))
      : action === "continue"
        ? await store.continueSession(
            validateMemoryRequest(value, campaignId, "continue"),
          )
        : await store.retry(validateMemoryRequest(value, campaignId, "retry"));
  // Stage 4 §4: «Закончить сессию» — a loop campaign's closed session is digested in the background.
  if (action === "end") scheduleDigest(campaignId, validateMemoryRequest(value, campaignId, "end").sessionId, "end");
  // Polish item 22: a loop campaign pays for one memory — the Stage 4 digest — never the legacy summaries.
  const loop = (await readDmSettings(campaignId).catch(() => null))?.runtime === DM_LOOP_RUNTIME;
  return {
    snapshot,
    // Capture already-authorized store, not request cookies, for after-response work.
    run: async () => {
      if (loop) { console.info(JSON.stringify({ event: "legacy_memory_skipped", campaignId, reason: "dm-loop-v1 session end: the Stage 4 digest is the memory" })); return; }
      try {
        await processMemoryJobs(
          campaignId,
          store,
          production.summaries,
          4,
          snapshot.timeline,
        );
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
