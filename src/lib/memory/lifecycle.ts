import { DmError } from "../gameplay/dm-errors.ts";
import { buildContext, modelBudget } from "../gameplay/dm-context.ts";
import type { TurnInput } from "../gameplay/contracts.ts";
import type { DmProvider } from "../gameplay/server-contracts.ts";
import type { MemoryStore, SummaryProvider } from "./server-contracts.ts";
import { withMemory } from "./context.ts";
import { processMemoryJobs } from "./jobs.ts";
import { sameTimeline } from "./timeline.ts";
import { validateCharacterPatches } from "../gameplay/character-model.ts";

export function memoryAwareProvider(
  provider: DmProvider,
  memory: MemoryStore,
): DmProvider {
  return {
    plan: async (source, input) => {
      const selected = await withMemory(source, input, memory, true);
      const result = await provider.plan(selected, input);
      validateCharacterPatches(selected, input, result.output.privatePatches);
      return result;
    },
    narrate: async (source, input, resolution, checks) =>
      provider.narrate(
        await withMemory(source, input, memory, false),
        input,
        resolution,
        checks,
      ),
    feedback: (source, input) => provider.feedback(source, input),
  };
}

export async function preflightMemory(
  input: TurnInput,
  store: MemoryStore,
  summaries: SummaryProvider,
  model: string,
) {
  if (input.mode !== "game" && input.mode !== "companion") return;
  // An ended session cannot start paid preflight work before the runtime gate.
  const status = await store.read(input.campaignId);
  if (!sameTimeline(input.timeline, status.timeline))
    throw new DmError("conflict");
  if (status.currentBoundary) throw new DmError("unavailable", true);
  const source = await store.source(input.campaignId, input.mode);
  if (
    source.runtime.revision !== input.expectedRevision ||
    !sameTimeline(input.timeline, source.runtime.timeline)
  )
    throw new DmError("conflict");
  const budget = modelBudget(model);
  let pressure = false;
  let rebuild = false;
  try {
    const selected = await withMemory(source, input, store);
    const built = buildContext(selected, input, "plan", { model });
    pressure =
      built.estimatedTokens >
        0.8 *
          Math.min(
            budget.inputCap,
            budget.contextLimit - budget.outputReserve - budget.safetyMargin,
          ) && !!selected.memory?.exactEvents.length;
  } catch (cause) {
    if (!(cause instanceof DmError) || cause.code !== "context") throw cause;
    rebuild = true;
  }
  if (!pressure && !rebuild) return;
  await store.enqueue(input.campaignId, rebuild ? "rebuild" : "pressure");
  // Two bounded batches leave room for the ordinary planner/narrator timeout.
  const result = await processMemoryJobs(
    input.campaignId,
    store,
    summaries,
    2,
    input.timeline,
  );
  if (result.failed) throw new DmError("context", true);
  const refreshed = await store.source(input.campaignId, input.mode);
  if (
    refreshed.runtime.revision !== input.expectedRevision ||
    !sameTimeline(input.timeline, refreshed.runtime.timeline)
  )
    throw new DmError("conflict");
  buildContext(await withMemory(refreshed, input, store), input, "plan", {
    model,
  });
}
