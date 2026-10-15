import { ContextCapacityError, DmError } from "../gameplay/dm-errors.ts";
import { buildContext, modelBudget } from "../gameplay/dm-context.ts";
import type { TurnInput } from "../gameplay/contracts.ts";
import type { BuiltContext, DmProvider, RuntimeSource } from "../gameplay/server-contracts.ts";
import type { MemoryStore, SummaryProvider } from "./server-contracts.ts";
import { withMemory } from "./context.ts";
import { processMemoryJobs } from "./jobs.ts";
import { sameTimeline } from "./timeline.ts";
import { validateCharacterPatches } from "../gameplay/character-model.ts";
import type { TimelineFence } from "../saves/contracts.ts";

/** A committed response may schedule this existing, bounded Memory lifecycle.
 * No timer, second store, or foreground model work is introduced. */
export async function maintainAstraMemoryAfterCommit(campaignId: string,
  store: MemoryStore, summaries: SummaryProvider, timeline?: TimelineFence) {
  const current = await store.context(campaignId, [], true);
  if (current.campaignId !== campaignId || !sameTimeline(timeline, current.timeline))
    throw new DmError("conflict");
  const bytes = new TextEncoder().encode(JSON.stringify(current.uncovered)).length;
  if (!current.overflow && current.uncovered.length < 8 && bytes < 12000)
    return { processed: 0, failed: false, scheduled: false };
  await store.enqueue(campaignId, "pressure");
  const result = await processMemoryJobs(campaignId, store, summaries, 3, timeline);
  return { ...result, scheduled: true };
}

export function memoryAwareProvider(
  provider: DmProvider,
  memory: MemoryStore,
  modelForStage?: (
    stage: "plan" | "narrate",
    input: TurnInput,
  ) => Promise<string>,
): DmProvider {
  return {
    plan: async (source, input) => {
      const selected = await withMemory(
        source,
        input,
        memory,
        true,
        modelForStage
          ? { model: await modelForStage("plan", input), stage: "plan" }
          : undefined,
      );
      const result = await provider.plan(selected, input);
      validateCharacterPatches(selected, input, result.output.privatePatches);
      return result;
    },
    narrate: async (source, input, resolution, checks) =>
      provider.narrate(
        await withMemory(
          source,
          input,
          memory,
          false,
          modelForStage
            ? { model: await modelForStage("narrate", input), stage: "narrate" }
            : undefined,
        ),
        input,
        resolution,
        checks,
      ),
    feedback: (source, input) => provider.feedback(source, input),
  };
}

/** Astra claims and pins its source before Memory work. One claimant performs
 * one bounded summary pass, then re-reads Memory once before any provider call. */
export async function preflightAstraPlanMemory(
  source: RuntimeSource,
  input: TurnInput,
  store: MemoryStore,
  summaries: SummaryProvider,
  builder: (source: RuntimeSource, input: TurnInput,
    requiredOnly: boolean) => BuiltContext,
): Promise<{ selected: RuntimeSource; context: BuiltContext }> {
  const evaluate = async () => {
    const selected = await withMemory(source, input, store, true, {
      model: "gpt-6-astra", stage: "plan", builder,
    });
    return { selected, context: builder(selected, input, false) };
  };
  if (source.astraResponseContract === "unified-v1") return evaluate();
  let current: Awaited<ReturnType<typeof evaluate>> | null = null;
  let rebuild = false;
  try {
    current = await evaluate();
  } catch (cause) {
    if (cause instanceof ContextCapacityError && !cause.summaryMayHelp)
      throw cause;
    if (!(cause instanceof DmError) || cause.code !== "context") throw cause;
    rebuild = true;
  }
  const pressure = !!current && current.context.estimatedTokens >
    0.8 * current.context.budget.inputCap &&
    !!current.selected.memory?.exactEvents.length;
  if (!rebuild && !pressure) return current!;
  await store.enqueue(input.campaignId, rebuild ? "rebuild" : "pressure");
  // The observed bounded generation can contain one private and two public
  // batches. Finish those owned batches before the single fresh read.
  const result = await processMemoryJobs(input.campaignId, store, summaries, 3, input.timeline);
  if (result.failed) throw new DmError("context", true);
  try {
    return await evaluate();
  } catch (cause) {
    // Another bounded worker may still own the relevant summary. Keep the
    // exact operation retryable; never issue a provider request on stale bytes.
    if (cause instanceof ContextCapacityError && cause.summaryMayHelp)
      throw new DmError("context", true);
    throw cause;
  }
}

export async function preflightMemory(
  input: TurnInput,
  store: MemoryStore,
  summaries: SummaryProvider,
  model: string | ((stage: "plan" | "narrate") => Promise<string>),
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
  // World Logic resolves through its own bounded context. The DM Memory input
  // used by that path is the public narrator context, not a Console Basic plan.
  const stage =
    input.mode === "game" &&
    source.snapshot.settings.values.rulesSystem.id === "world-logic-v1"
      ? "narrate"
      : "plan";
  const includePrivate = stage === "plan";
  const selectedModel = typeof model === "string" ? model : await model(stage);
  const budget = modelBudget(selectedModel);
  let pressure = false;
  let rebuild = false;
  try {
    const selected = await withMemory(source, input, store, includePrivate, {
      model: selectedModel,
      stage,
    });
    const built = buildContext(selected, input, stage, { model: selectedModel });
    pressure =
      built.estimatedTokens >
        0.8 *
          Math.min(
            budget.inputCap,
            budget.contextLimit - budget.outputReserve - budget.safetyMargin,
          ) && !!selected.memory?.exactEvents.length;
  } catch (cause) {
    if (cause instanceof ContextCapacityError && !cause.summaryMayHelp)
      throw cause;
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
  buildContext(
    await withMemory(refreshed, input, store, includePrivate, {
      model: selectedModel,
      stage,
    }),
    input,
    stage,
    { model: selectedModel },
  );
}
