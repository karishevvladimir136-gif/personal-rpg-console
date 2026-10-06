import type {
  MemoryCandidateBatch,
  MemorySource,
  MemorySourceRef,
  RetrievalRequest,
  RetrievalResult,
} from "./server-contracts.ts";
import { memoryTerms, mentionedEntityIds } from "./source-analysis.ts";
import { sameTimeline, sourceOnTimeline } from "./timeline.ts";
export { expandRetrievalRequest } from "./source-analysis.ts";

const authority = {
  correction: 6,
  state: 5,
  canon: 4,
  reference: 3,
  history: 3,
  derived: 1,
} as const;
const byteLength = (value: unknown) =>
  new TextEncoder().encode(JSON.stringify(value)).length;
const identity = (ref: MemorySourceRef) =>
  JSON.stringify([ref.campaignId, ref.visibility, ref.kind, ref.id, ref.part]);
const exactIdentity = (ref: MemorySourceRef) =>
  `${identity(ref)}:${ref.version}`;

function authorized(request: RetrievalRequest, source: MemorySource): boolean {
  if (
    !sourceOnTimeline(request.timeline, source) ||
    source.campaignId !== request.campaignId ||
    source.ref.campaignId !== request.campaignId ||
    source.ref.visibility !== request.visibility ||
    (request.visibility === "public" && source.ref.kind === "private_event") ||
    source.status === "invalid" ||
    (!request.historicalComparison &&
      (!source.current || source.status !== "valid")) ||
    !Object.hasOwn(authority, source.authority) ||
    !source.text.trim() ||
    !Number.isFinite(source.sequence) ||
    !Number.isFinite(source.significance) ||
    (!request.historicalComparison &&
      source.validFrom !== null &&
      source.validFrom > request.worldMinutes) ||
    (!request.historicalComparison &&
      source.validTo !== null &&
      source.validTo <= request.worldMinutes) ||
    request.actorIds.some((id) => !source.knownBy.includes(id))
  )
    return false;
  if (
    (source.authority === "derived" || source.ref.kind === "summary") &&
    !source.sourceRefs.length
  )
    return false;
  return source.sourceRefs.every(
    (ref) =>
      ref.campaignId === request.campaignId &&
      ref.visibility === request.visibility &&
      ref.id.length > 0 &&
      ref.version.length > 0 &&
      Number.isSafeInteger(ref.part) &&
      ref.part >= 0,
  );
}

function factPriority(left: MemorySource, right: MemorySource): number {
  const rank = authority[left.authority] - authority[right.authority];
  if (rank) return rank;
  if (
    left.validFrom !== null &&
    right.validFrom !== null &&
    left.validFrom !== right.validFrom
  )
    return left.validFrom - right.validFrom;
  // Versions are only comparable within the same source identity. A UUID or an
  // unrelated document's larger revision is not evidence that it is more correct.
  if (
    identity(left.ref) === identity(right.ref) &&
    /^\d+$/.test(left.ref.version) &&
    /^\d+$/.test(right.ref.version)
  )
    return Number(left.ref.version) - Number(right.ref.version);
  return 0;
}

/** Promote relevant obligations from authorized candidates, not every unresolved
 * thread in the campaign. Call with the original query, before lexical expansion. */
export function selectCriticalSourceIds(
  request: RetrievalRequest,
  batch: MemoryCandidateBatch,
): string[] {
  if (!sameTimeline(request.timeline, batch.timeline))
    return [...request.requiredSourceIds];
  const entities = new Set(mentionedEntityIds(request, batch.aliases));
  const terms = memoryTerms(request.query);
  const asksHistory =
    /\b(remember|earlier|previously|promis(?:e|ed|es)|pledge|owed|obligation)\b|помни|раньше|ранее|обещ|долг/iu.test(
      request.query,
    );
  return [
    ...new Set([
      ...request.requiredSourceIds,
      ...batch.sources
        .filter((source) => {
          if (!authorized(request, source)) return false;
          const sourceTerms = new Set(memoryTerms(source.text));
          const overlap = terms.filter((term) => sourceTerms.has(term)).length;
          const namedActor = source.entityIds.some((id) => entities.has(id));
          // A relevant owner correction or Canon source cannot become an
          // optional casualty of a smaller long-campaign retrieval allowance.
          if (source.authority === "correction" || source.authority === "canon")
            return overlap >= 2 || namedActor;
          if (!source.unresolved) return false;
          return (
            (asksHistory &&
              (overlap > 0 || namedActor)) ||
            overlap >= 2
          );
        })
        .map((source) => source.id),
    ]),
  ];
}

/** Pure final selection. The store verifies current source versions/existence in
 * its authorized query; this repeats scope, time, knowledge and derivative checks
 * before any excerpt can reach context. It does not query a provider or database. */
export function retrieveMemory(
  request: RetrievalRequest,
  batch: MemoryCandidateBatch,
): RetrievalResult {
  const paused = (
    reason: "missing" | "conflict" | "budget",
  ): RetrievalResult => ({
    sources: [],
    paused: true,
    reason,
    expanded: request.expanded === true,
    bytes: 2,
  });
  if (
    !sameTimeline(request.timeline, batch.timeline) ||
    batch.campaignId !== request.campaignId ||
    !request.campaignId ||
    !Number.isSafeInteger(request.maxBytes) ||
    request.maxBytes < 2 ||
    !Number.isSafeInteger(request.maxExcerpts) ||
    request.maxExcerpts < 1 ||
    !Number.isSafeInteger(request.worldMinutes) ||
    request.worldMinutes < 0
  )
    return paused("missing");
  const limit = Math.min(12, request.maxExcerpts);
  const required = new Set(request.requiredSourceIds);
  if (required.size > limit) return paused("budget");
  const entities = new Set(mentionedEntityIds(request, batch.aliases));
  const query = new Set(memoryTerms(request.query));
  const approved = batch.sources.filter((source) =>
    authorized(request, source),
  );
  const byIdentity = new Map<string, MemorySource[]>();
  for (const source of batch.sources) {
    if (
      source.campaignId !== request.campaignId ||
      source.ref.visibility !== request.visibility
    )
      continue;
    const key = identity(source.ref);
    byIdentity.set(key, [...(byIdentity.get(key) ?? []), source]);
  }
  const fresh = approved.filter((source) =>
    source.sourceRefs.every((ref) => {
      const originals = byIdentity.get(identity(ref));
      // A bounded batch cannot contain every source in a summary. The DB validates
      // absent references; when present, reject visibly stale or unauthorized refs.
      return (
        !originals ||
        originals.some(
          (original) =>
            original.ref.version === ref.version &&
            original.current &&
            original.status === "valid" &&
            authorized(request, original),
        )
      );
    }),
  );
  const ranked = fresh
    .map((source) => {
      const entityRelevance = source.entityIds.filter((id) =>
        entities.has(id),
      ).length;
      const terms = new Set(memoryTerms(source.text));
      const relevance = [...query].filter((term) => terms.has(term)).length;
      return { source, entityRelevance, relevance };
    })
    .filter(
      ({ source, entityRelevance, relevance }) =>
        required.has(source.id) || entityRelevance > 0 || relevance > 0,
    );
  const spans = new Map<string, string>();
  for (const { source } of ranked) {
    const key = exactIdentity(source.ref);
    if (spans.has(key) && spans.get(key) !== source.text)
      return paused("conflict");
    spans.set(key, source.text);
  }

  // Only explicit fact keys represent comparable assertions. Rumors, intentions,
  // hypotheses and quoted records retain their provenance and are not promoted.
  const facts = new Map<string, MemorySource[]>();
  for (const { source } of ranked) {
    if (
      source.factKey &&
      source.factValue !== null &&
      source.statementKind === "fact" &&
      source.current
    ) {
      const rows = facts.get(source.factKey) ?? [];
      rows.push(source);
      facts.set(source.factKey, rows);
    }
  }
  const overridden = new Set<string>();
  for (const rows of facts.values()) {
    const top = [...rows].sort((a, b) => factPriority(b, a))[0];
    const equallyAuthoritative = rows.filter(
      (row) => factPriority(row, top) === 0,
    );
    if (new Set(equallyAuthoritative.map((row) => row.factValue)).size > 1)
      return paused("conflict");
    for (const row of rows)
      if (row.factValue !== top.factValue && factPriority(row, top) < 0)
        overridden.add(row.id);
  }

  ranked.sort(
    (a, b) =>
      Number(required.has(b.source.id)) - Number(required.has(a.source.id)) ||
      authority[b.source.authority] - authority[a.source.authority] ||
      b.entityRelevance - a.entityRelevance ||
      Number(b.source.unresolved) - Number(a.source.unresolved) ||
      b.source.significance - a.source.significance ||
      b.relevance - a.relevance ||
      b.source.sequence - a.source.sequence ||
      a.source.id.localeCompare(b.source.id),
  );
  const sources: MemorySource[] = [];
  const seen = new Set<string>();
  const included = new Set<string>();
  let budgetRejected = false;
  for (const { source } of ranked) {
    if (overridden.has(source.id)) continue;
    const key = exactIdentity(source.ref);
    if (seen.has(key)) {
      if (required.has(source.id)) return paused("missing");
      continue;
    }
    if (
      sources.length >= limit ||
      byteLength([...sources, source]) > request.maxBytes
    ) {
      if (required.has(source.id)) return paused("budget");
      budgetRejected = true;
      continue;
    }
    seen.add(key);
    included.add(source.id);
    sources.push(source);
  }
  if ([...required].some((id) => !included.has(id))) return paused("missing");
  if (!sources.length && budgetRejected) return paused("budget");
  if (
    !sources.length &&
    request.visibility === "public" &&
    /\b(remember|earlier|previously|promis(?:e|ed|es)|pledge|owed)\b|помни|раньше|ранее|обещ|долг/iu.test(
      request.query,
    )
  )
    return paused("missing");
  return {
    sources,
    paused: false,
    reason: null,
    expanded: request.expanded === true,
    bytes: byteLength(sources),
  };
}
