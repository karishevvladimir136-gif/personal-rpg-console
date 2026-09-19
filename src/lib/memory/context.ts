import { DmError } from "../gameplay/dm-errors.ts";
import type { TurnInput } from "../gameplay/contracts.ts";
import type { RuntimeSource } from "../gameplay/server-contracts.ts";
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

export async function withMemory(
  source: RuntimeSource,
  input: TurnInput,
  store: MemoryStore,
  includePrivate = true,
): Promise<RuntimeSource> {
  if (input.mode === "feedback" || input.mode === "ooc") return source;
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
    maxBytes: 12000,
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
    let result = retrieveMemory(
      {
        ...request,
        requiredSourceIds: selectCriticalSourceIds(original, first),
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
      result = retrieveMemory(
        {
          ...expanded,
          requiredSourceIds: selectCriticalSourceIds(original, second),
        },
        second,
      );
    }
    if (result.paused) throw new DmError("context", true);
    return result.sources;
  }
  // Expand once before SQL so aliases and bilingual paraphrases can enter the
  // filtered candidate pool. The helper records the bounded expansion flag.
  const historical = await search(
    expandRetrievalRequest(query, memory.aliases),
  );
  const privateHistorical = !privateAllowed
    ? []
    : await search({
        ...query,
        visibility: "private",
        requiredSourceIds: [],
        maxBytes: 4000,
        maxExcerpts: 4,
      });
  const publicSummary = memory.publicSummary?.valid
    ? memory.publicSummary
    : null;
  const privateSummary =
    privateAllowed && memory.privateSummary?.valid
      ? memory.privateSummary
      : null;
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
      historical,
      privateHistorical,
      publicSummary: companion ? null : publicSummary,
      privateSummary,
      complete: true,
    },
  };
}
