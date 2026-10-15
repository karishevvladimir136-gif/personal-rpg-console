import { DmError } from "../gameplay/dm-errors.ts";
import type { TurnInput } from "../gameplay/contracts.ts";
import type { RuntimeSource } from "../gameplay/server-contracts.ts";
import type { MemoryStore, MemorySource, MemorySummary, RetrievalRequest } from "./server-contracts.ts";
import { expandRetrievalRequest, retrieveMemory, selectCriticalSourceIds } from "./retrieval.ts";
import { sameTimeline, refsOnTimeline, sourceOnTimeline } from "./timeline.ts";
import { curateAstraContextSource } from "../gameplay/astra-privacy-context.ts";

const bytes = (value: unknown) => new TextEncoder().encode(JSON.stringify(value)).length;

/** Unified play reads bounded evidence. Optional maintenance never runs here.
 * Current records and Canon remain in RuntimeSource regardless of this index. */
export async function withUnifiedMemory(source: RuntimeSource, input: TurnInput,
  store: MemoryStore, includePrivate: boolean, query: string = input.input): Promise<RuntimeSource> {
  const cid = input.campaignId;
  const timeline = source.runtime.timeline;
  if (!source.ownerId || source.snapshot.campaign.id !== cid ||
    source.runtime.campaignId !== cid || source.runtime.revision !== input.expectedRevision ||
    !sameTimeline(timeline, input.timeline) || !sameTimeline(timeline, source.snapshot.timeline))
    throw new DmError("conflict");
  let memory: Awaited<ReturnType<MemoryStore["context"]>>;
  try { memory = await store.context(cid, [], includePrivate); }
  catch (error) {
    if (error instanceof DmError && ["conflict", "validation", "configuration"].includes(error.code)) throw error;
    // An unavailable derived index cannot remove current state or Canon.
    return curateAstraContextSource({ ...source, historyComplete: true, checkpoint: null, memory: { timeline, campaignId: cid,
      generation: 0, stateRevision: source.runtime.revision, checkpoint: null,
      exactEvents: [], historical: [], privateHistorical: [], publicSummary: null,
      privateSummary: null, complete: true } }, input);
  }
  if (memory.campaignId !== cid || !sameTimeline(timeline, memory.timeline) ||
    memory.stateRevision !== source.runtime.revision)
    throw new DmError("conflict");
  const scoped = (row: MemorySource, visibility: "public" | "private") => {
    if (row.campaignId !== cid || row.ref.campaignId !== cid ||
      row.ref.visibility !== visibility || !sourceOnTimeline(timeline, row) ||
      row.sourceRefs.some((ref) => ref.campaignId !== cid || ref.visibility !== visibility))
      throw new DmError("conflict");
    return row.current && row.status === "valid";
  };
  const summary = (value: MemorySummary | null, visibility: "public" | "private") => {
    if (!value || !value.valid || value.campaignId !== cid || value.generation !== memory.generation ||
      value.visibility !== visibility || !sameTimeline(timeline, value.timeline) ||
      !refsOnTimeline(timeline, value.sourceRefs)) return null;
    const entries = value.entries.filter((row) => scoped(row, visibility));
    // Retain complete original statements; a large optional digest is not a
    // correctness failure and may be omitted while originals stay retrievable.
    const required = entries.filter((row) => row.authority === "correction" || row.authority === "canon");
    const optional = entries.filter((row) => !required.includes(row) && bytes(row) <= 4000).slice(0, 24);
    return { ...value, entries: [...required, ...optional] };
  };
  const aliases = memory.aliases.filter((row) => row.campaignId === cid && sameTimeline(timeline, row.timeline));
  async function retrieve(visibility: "public" | "private") {
    const request: RetrievalRequest = expandRetrievalRequest({ timeline, campaignId: cid,
      visibility, actorIds: [], historicalOnly: true, query, entityIds: [],
      requiredSourceIds: [], worldMinutes: source.runtime.worldMinutes,
      maxBytes: visibility === "public" ? 24000 : 8000, maxExcerpts: visibility === "public" ? 12 : 4,
      historicalComparison: false }, aliases);
    let batch;
    try { batch = await store.search(request); }
    catch (error) {
      if (error instanceof DmError && ["conflict", "validation", "configuration"].includes(error.code)) throw error;
      return { sources: [] as MemorySource[], required: [] as string[] };
    }
    if (batch.campaignId !== cid || !sameTimeline(timeline, batch.timeline)) throw new DmError("conflict");
    if (batch.generation !== memory.generation) return { sources: [] as MemorySource[], required: [] as string[] };
    batch.sources.forEach((row) => scoped(row, visibility));
    const required = selectCriticalSourceIds({ ...request, query }, batch);
    const selected = retrieveMemory({ ...request, requiredSourceIds: required }, batch);
    if (!selected.paused) return { sources: selected.sources, required };
    // Required Canon/corrections survive optional selection pressure. Other
    // history can remain uncertain in fiction without inventing a past event.
    const sources = batch.sources.filter((row) => scoped(row, visibility) &&
      (row.authority === "correction" || row.authority === "canon"));
    return { sources, required: required.filter((id) => sources.some((row) => row.id === id)) };
  }
  const publicSelection = await retrieve("public");
  const privateSelection = includePrivate ? await retrieve("private") : { sources: [], required: [] };
  const uncovered = memory.uncovered.filter((row) => {
    if (!includePrivate && row.ref.visibility === "private") return false;
    return scoped(row, row.ref.visibility);
  });
  function selectedRecent(visibility: "public" | "private", retrieved: MemorySource[]) {
    const rows = uncovered.filter((row) => row.ref.visibility === visibility);
    const required = rows.filter((row) => row.authority === "correction" || row.authority === "canon");
    const optional = rows.filter((row) => !required.includes(row) && bytes(row) <= 4000).slice(-8);
    return [...new Map([...required, ...retrieved, ...optional].map((row) => [row.id, row])).values()];
  }
  const point = memory.checkpoint;
  const checkpoint = point?.valid && point.campaignId === cid &&
    point.stateRevision === source.runtime.revision && sameTimeline(timeline, point.timeline) &&
    refsOnTimeline(timeline, point.sourceRefs) &&
    point.sourceRefs.every((ref) => ref.visibility === "public") &&
    bytes({ resume: point.resume, sourceRefs: point.sourceRefs }) <= 12000 ? point : null;
  // runtime_source deliberately bounds old turn rows after64. The Memory
  // projection supplies authorized bounded continuity instead of requiring
  // the entire transcript; this is the same coverage seam as legacy Memory.
  return curateAstraContextSource({ ...source, historyComplete: true, checkpoint: null, memory: { timeline, campaignId: cid,
    generation: memory.generation, stateRevision: source.runtime.revision, checkpoint,
    exactEvents: [], historical: selectedRecent("public", publicSelection.sources),
    privateHistorical: privateSelection.sources,
    requiredHistoricalSourceIds: publicSelection.required,
    requiredPrivateHistoricalSourceIds: privateSelection.required,
    publicSummary: summary(memory.publicSummary, "public"),
    privateSummary: includePrivate ? summary(memory.privateSummary, "private") : null, complete: true } }, input);
}
