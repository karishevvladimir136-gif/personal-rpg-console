import "server-only";
import {
  createStructuredRequester,
  type ProviderOptions,
} from "../dm/provider.ts";
import {
  buildSummaryContext,
  parseSummary,
  summarySchemaFor,
} from "../../memory/summary.ts";
import type {
  MemoryJob,
  SummaryProvider,
} from "../../memory/server-contracts.ts";
import type { ExecutionProfile } from "../../production/contracts.ts";
import {
  environmentProfileResolver,
  executionProviderOptions,
} from "../model-runtime/profiles.ts";

export function openAiSummaryProvider(
  options: ProviderOptions,
): SummaryProvider {
  const request = createStructuredRequester(options);
  return {
    summarize: (job) =>
      request(
        buildSummaryContext(job, options.model),
        "summary",
        job.id,
        (value) => parseSummary(value, job),
        summarySchemaFor(job),
      ),
  };
}

export function createSummaryProvider(
  options: {
    resolveProfile?: (
      job: MemoryJob,
    ) => ExecutionProfile | Promise<ExecutionProfile>;
    fetcher?: ProviderOptions["fetcher"];
    observer?: ProviderOptions["observer"];
  } = {},
): SummaryProvider {
  const environmentProfile = environmentProfileResolver();
  return {
    summarize: async (job) => {
      const profile = options.resolveProfile
        ? await options.resolveProfile(job)
        : environmentProfile("memory.summary");
      return openAiSummaryProvider(
        executionProviderOptions(profile, "memory.summary", {
          fetcher: options.fetcher,
          observer:
            options.observer ??
            ((attempt) =>
              console.info(
                JSON.stringify({
                  event: "memory_provider_attempt",
                  ...attempt,
                }),
              )),
        }),
      ).summarize(job);
    },
  };
}
