import { DmError } from "../gameplay/dm-errors.ts";
import {
  buildContext,
  modelInputLimit,
} from "../gameplay/dm-context.ts";
import type { TurnInput } from "../gameplay/contracts.ts";
import type { RuntimeSource } from "../gameplay/server-contracts.ts";
import type { BuiltContext } from "../gameplay/server-contracts.ts";
import type { ContextStage } from "../gameplay/server-contracts.ts";
import type {
  MemoryStore,
  RetrievalRequest,
  MemorySource,
} from "./server-contracts.ts";
import {
  expandRetrievalRequest,
  retrieveMemory,
  selectCriticalSourceIds,
} from "./retrieval.ts";
import { sameTimeline, refsOnTimeline, sourceOnTimeline } from "./timeline.ts";
import { withUnifiedMemory } from "./unified-context.ts";

export async function withMemory(
  source: RuntimeSource,
  input: TurnInput,
  store: MemoryStore,
  includePrivate = true,
  budget?: { model: string; stage?: ContextStage;
    builder?: (source: RuntimeSource, input: TurnInput,
      requiredOnly: boolean) => BuiltContext },
): Promise<RuntimeSource> {
  if (input.mode === "feedback" || input.mode === "ooc") return source;
  if (source.astraResponseContract === "unified-v1" && input.mode === "game")
    return withUnifiedMemory(source, input, store, includePrivate);
  const cid = input.campaignId;
  const timeline = source.runtime.timeline;
  if (!sameTimeline(timeline, input.timeline)) throw new DmError("conflict");
  const companion = input.mode === "companion";
  const actors = companion
    ? [...new Set([input.companionId!, ...input.listenerIds])]
    : [];
  const privateAllowed = includePrivate && !companion;
  const memory = await store.context(cid, actors, privateAllowed);
  if (
    memory.campaignId !== cid ||
    !sameTimeline(timeline, memory.timeline) ||
    memory.stateRevision !== source.runtime.revision ||
    memory.overflow ||
    memory.aliases.some(
      (alias) =>
        alias.campaignId !== cid || !sameTimeline(timeline, alias.timeline),
    ) ||
    (memory.checkpoint &&
      (!memory.checkpoint.valid ||
        !sameTimeline(timeline, memory.checkpoint.timeline) ||
        !refsOnTimeline(timeline, memory.checkpoint.sourceRefs)))
  )
    throw new DmError("context", true);
  const known = (item: MemorySource, visibility: "public" | "private") =>
    item.campaignId === cid &&
    sourceOnTimeline(timeline, item) &&
    item.ref.campaignId === cid &&
    item.ref.visibility === visibility &&
    item.current &&
    item.status === "valid" &&
    (!actors.length || actors.every((id) => item.knownBy.includes(id)));
  if (
    memory.uncovered.some(
      (item) =>
        !known(item, item.ref.visibility) ||
        (!privateAllowed && item.ref.visibility !== "public"),
    )
  )
    throw new DmError("context", true);
  const publicSummary = memory.publicSummary?.valid
    ? memory.publicSummary
    : null;
  const privateSummary =
    privateAllowed && memory.privateSummary?.valid
      ? memory.privateSummary
      : null;
  // Size the same current authority, exact events, checkpoint and digest that
  // the DM builder will use. Recent prose and optional retrieval are excluded
  // from this pass; they cannot consume the room reserved for relevant history.
  const baselineMemory = {
    timeline,
    campaignId: cid,
    generation: memory.generation,
    stateRevision: memory.stateRevision,
    checkpoint: memory.checkpoint,
    exactEvents: memory.uncovered,
    historical: [],
    privateHistorical: [],
    publicSummary: companion ? null : publicSummary,
    privateSummary,
    complete: true,
  };
  const stage = budget?.stage ?? (includePrivate ? "plan" : "narrate");
  const requiredContext = budget
    ? budget.builder
      ? budget.builder({ ...source, historyComplete: true,
        checkpoint: null, memory: baselineMemory }, input, true)
      : buildContext(
        { ...source, historyComplete: true,
          checkpoint: null, memory: baselineMemory },
        input, stage,
        { model: budget.model, requiredOnly: true },
      )
    : null;
  const room = requiredContext
    ? Math.max(0, modelInputLimit(requiredContext.budget) -
      requiredContext.estimatedTokens - 1024)
    : 16000;
  // Merely witnessing the current scene is not evidence that every old exchange
  // involving that actor is relevant. Exact participants/quests remain mandatory
  // in RuntimeSource; named aliases and the explicit target seed history search.
  const entityIds = companion ? [input.companionId!] : [];
  const query: RetrievalRequest = {
    timeline,
    campaignId: cid,
    visibility: "public",
    actorIds: actors,
    historicalOnly: true,
    query: input.input,
    entityIds,
    requiredSourceIds: [],
    worldMinutes: source.runtime.worldMinutes,
    maxBytes: 2 + Math.min(12000, room),
    maxExcerpts: 12,
    historicalComparison: false,
  };
  async function search(request: RetrievalRequest) {
    const first = await store.search(request);
    if (
      first.campaignId !== cid ||
      first.generation !== memory.generation ||
      !sameTimeline(timeline, first.timeline)
    )
      throw new DmError("context", true);
    const original = { ...request, query: input.input };
    let requiredSourceIds = selectCriticalSourceIds(original, first);
    let result = retrieveMemory(
      {
        ...request,
        requiredSourceIds,
      },
      first,
    );
    if (result.paused && result.reason === "missing" && !request.expanded) {
      const expanded = expandRetrievalRequest(request, first.aliases);
      const second = await store.search(expanded);
      if (
        second.campaignId !== cid ||
        second.generation !== memory.generation ||
        !sameTimeline(timeline, second.timeline)
      )
        throw new DmError("context", true);
      requiredSourceIds = [
        ...new Set([
          ...requiredSourceIds,
          ...selectCriticalSourceIds(original, second),
        ]),
      ];
      result = retrieveMemory(
        {
          ...expanded,
          requiredSourceIds,
        },
        second,
      );
    }
    const asksHistory =
      /\b(remember|earlier|previously|promis(?:e|ed|es)|pledge|owed|obligation)\b|помни|раньше|ранее|обещ|долг/iu.test(
        input.input,
      );
    if (result.paused) {
      // Oversized optional recall cannot stop ordinary play. A named or
      // unresolved obligation, conflict, or explicit history request still
      // fails closed rather than silently losing necessary evidence.
      if (
        result.reason !== "budget" ||
        requiredSourceIds.length ||
        asksHistory
      )
        throw new DmError("context", true);
      return { sources: [], requiredSourceIds: [], bytes: 2 };
    }
    return {
      sources: result.sources,
      requiredSourceIds:
        asksHistory && result.sources.length
          ? [...new Set([...requiredSourceIds, result.sources[0].id])]
          : requiredSourceIds,
      bytes: result.bytes,
    };
  }
  // Expand once before SQL so aliases and bilingual paraphrases can enter the
  // filtered candidate pool. The helper records the bounded expansion flag.
  const privateSelection = !privateAllowed
    ? { sources: [], requiredSourceIds: [], bytes: 2 }
    : await search({
        ...query,
        visibility: "private",
        requiredSourceIds: [],
        maxBytes: 2 + Math.min(4000, Math.floor(room / 4)),
        maxExcerpts: 4,
      });
  const publicSelection = await search(
    expandRetrievalRequest(
      {
        ...query,
        maxBytes:
          2 + Math.min(12000, Math.max(0, room - (privateSelection.bytes - 2))),
      },
      memory.aliases,
    ),
  );
  if (
    publicSummary &&
    (publicSummary.campaignId !== cid ||
      publicSummary.generation !== memory.generation ||
      !sameTimeline(timeline, publicSummary.timeline) ||
      !refsOnTimeline(timeline, publicSummary.sourceRefs) ||
      publicSummary.visibility !== "public" ||
      publicSummary.entries.some((item) => !known(item, "public")))
  ) {
    // A whole player recap cannot be lent to an NPC. Actor-specific retrieval
    // still supplies authorized originals, so omit that digest for companions.
    if (!companion) throw new DmError("context");
  }
  if (
    privateSummary &&
    (privateSummary.campaignId !== cid ||
      privateSummary.generation !== memory.generation ||
      !sameTimeline(timeline, privateSummary.timeline) ||
      !refsOnTimeline(timeline, privateSummary.sourceRefs) ||
      privateSummary.visibility !== "private" ||
      privateSummary.entries.some((item) => !known(item, "private")))
  )
    throw new DmError("context");
  return {
    ...source,
    historyComplete: true,
    checkpoint: null,
    memory: {
      timeline,
      campaignId: cid,
      generation: memory.generation,
      stateRevision: memory.stateRevision,
      checkpoint: memory.checkpoint,
      exactEvents: memory.uncovered,
      historical: publicSelection.sources,
      privateHistorical: privateSelection.sources,
      requiredHistoricalSourceIds: publicSelection.requiredSourceIds,
      requiredPrivateHistoricalSourceIds: privateSelection.requiredSourceIds,
      publicSummary: companion ? null : publicSummary,
      privateSummary,
      complete: true,
    },
  };
}
