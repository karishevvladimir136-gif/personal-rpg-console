import { DmError } from "../gameplay/dm-errors.ts";
import type { MemoryStore, SummaryProvider } from "./server-contracts.ts";
import { assertSummaryJob, parseSummary } from "./summary.ts";
import { sameTimeline } from "./timeline.ts";
import type { TimelineFence } from "../saves/contracts.ts";

// Called on an explicit lifecycle trigger, never on a timer. A failed job stops
// this bounded attempt; retries require a later explicit owner/lifecycle request.
export async function processMemoryJobs(
  campaignId: string,
  store: MemoryStore,
  provider: SummaryProvider,
  limit = 4,
  timeline?: TimelineFence,
) {
  let processed = 0;
  for (let index = 0; index < Math.min(Math.max(limit, 0), 4); index++) {
    const job = await store.claim(campaignId);
    if (!job) return { processed, failed: false };
    if (job.campaignId !== campaignId || !sameTimeline(timeline, job.timeline))
      throw new DmError("context");
    try {
      assertSummaryJob(job);
      const output = job.sources.length
        ? (await provider.summarize(job)).output
        : { schemaVersion: 1 as const, selections: [] };
      await store.publish(job, parseSummary(output, job));
      processed++;
    } catch (cause) {
      const category =
        cause instanceof DmError &&
        ["provider", "validation", "context"].includes(cause.code)
          ? (cause.code as "provider" | "validation" | "context")
          : "unavailable";
      try {
        await store.fail(job, category);
      } catch {
        /* A newer generation/lease already superseded this job. */
      }
      return { processed, failed: true };
    }
  }
  return { processed, failed: false };
}
