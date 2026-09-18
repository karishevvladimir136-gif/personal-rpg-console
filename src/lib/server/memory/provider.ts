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
import type { SummaryProvider } from "../../memory/server-contracts.ts";

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
export function createSummaryProvider(): SummaryProvider {
  return openAiSummaryProvider({
    apiKey: process.env.OPENAI_API_KEY ?? "",
    model: process.env.OPENAI_DM_MODEL ?? "",
    reasoning: process.env.OPENAI_DM_REASONING,
    observer: (attempt) =>
      console.info(
        JSON.stringify({ event: "memory_provider_attempt", ...attempt }),
      ),
  });
}
