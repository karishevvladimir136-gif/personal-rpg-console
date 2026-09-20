import "server-only";
import type {
  DmProvider,
  RuntimeSource,
} from "../../gameplay/server-contracts.ts";
import type { TurnInput } from "../../gameplay/contracts.ts";
import type {
  ExecutionProfile,
  RuntimeTask,
} from "../../production/contracts.ts";
import {
  environmentProfileResolver,
  executionProviderOptions,
} from "../model-runtime/profiles.ts";
import { openAiProvider, type ProviderOptions } from "./provider.ts";
export { createTurnStore } from "./store.ts";

// The integration callback resolves/persists a profile in the accepted operation
// ledger before returning. Retries must return that exact recorded profile.
export function createDmProvider(
  options: {
    resolveProfile?: (
      task: Exclude<RuntimeTask, "memory.summary">,
      source: RuntimeSource,
      input: TurnInput,
    ) => ExecutionProfile | Promise<ExecutionProfile>;
    fetcher?: ProviderOptions["fetcher"];
    observer?: ProviderOptions["observer"];
  } = {},
): DmProvider {
  const environmentProfile = environmentProfileResolver();
  const provider = async (
    task: Exclude<RuntimeTask, "memory.summary">,
    source: RuntimeSource,
    input: TurnInput,
  ) => {
    const profile = options.resolveProfile
      ? await options.resolveProfile(task, source, input)
      : environmentProfile(task);
    return openAiProvider(
      executionProviderOptions(profile, task, {
        fetcher: options.fetcher,
        observer:
          options.observer ??
          ((attempt) =>
            console.info(
              JSON.stringify({ event: "dm_provider_attempt", ...attempt }),
            )),
      }),
    );
  };
  return {
    plan: async (source, input) =>
      (await provider("dm.plan", source, input)).plan(source, input),
    narrate: async (source, input, resolution, checks) =>
      (await provider("dm.narrate", source, input)).narrate(
        source,
        input,
        resolution,
        checks,
      ),
    feedback: async (source, input) =>
      (await provider("dm.feedback", source, input)).feedback(source, input),
  };
}
