import "server-only";
import type { DmProvider } from "../../gameplay/server-contracts.ts";
import { openAiProvider } from "./provider.ts";
export { createTurnStore } from "./store.ts";

// Configuration is checked only when a provider method is used, so begin() can
// durably preserve input first and mechanic-only actions never need an API key.
export function createDmProvider(): DmProvider {
  const provider = () =>
    openAiProvider({
      apiKey: process.env.OPENAI_API_KEY ?? "",
      model: process.env.OPENAI_DM_MODEL ?? "",
      reasoning: process.env.OPENAI_DM_REASONING,
      observer: (attempt) =>
        console.info(
          JSON.stringify({ event: "dm_provider_attempt", ...attempt }),
        ),
    });
  return {
    plan: (source, input) => provider().plan(source, input),
    narrate: (source, input, resolution, checks) =>
      provider().narrate(source, input, resolution, checks),
    feedback: (source, input) => provider().feedback(source, input),
  };
}
