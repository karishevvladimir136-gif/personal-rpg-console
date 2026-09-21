// An exact-manifest candidate adapter for the existing Memory selector. It has
// no source store, index, ranking algorithm, active projection or provider path.
import { DmError } from "../gameplay/dm-errors.ts";
import type { JsonObject } from "../gameplay/contracts.ts";
import type {
  EntityAlias,
  MemoryCandidateBatch,
  MemorySource,
  MemorySourceKind,
  MemorySourceRef,
  RetrievalRequest,
  RetrievalResult,
} from "../memory/server-contracts.ts";
import {
  expandRetrievalRequest,
  retrieveMemory,
  selectCriticalSourceIds,
} from "../memory/retrieval.ts";
import { isUuid } from "../persistence/validation.ts";
import { worldEventMemorySource } from "../production-adapters/world-memory.ts";
import type {
  DetachedMemorySourceRow,
  ReadDetachedState,
} from "../saves/detached-reader.ts";
import type { DetachedState } from "./server-contracts.ts";
import { labEvidencePinned, validateLabDetachedState } from "./runtime.ts";

export type LabMemoryRequest = {
  visibility: "public" | "private";
  actorIds: string[];
  query: string;
  entityIds: string[];
  requiredSourceIds: string[];
  maxBytes: number;
  maxExcerpts: number;
};

const recordFamilies = {
  scene: "public.rpg_scenes",
  entity: "public.rpg_entities",
  item: "public.rpg_items",
  quest: "public.rpg_quests",
  location: "public.rpg_locations",
  state: "public.rpg_public_state",
} as const;
const kinds = [
  "scene",
  "document",
  "entity",
  "item",
  "quest",
  "location",
  "state",
  "event",
  "private_event",
  "summary",
];
const authorities = [
  "correction",
  "state",
  "canon",
  "reference",
  "history",
  "derived",
];
const statements = [
  "fact",
  "claim",
  "rumor",
  "lie",
  "hypothesis",
  "intention",
  "question",
  "record",
];

function valid(value: unknown): asserts value {
  if (!value) throw new DmError("context");
}
function sourceIdentity(
  row: Pick<DetachedMemorySourceRow, "kind" | "source_id" | "version" | "part">,
): string {
  return JSON.stringify([row.kind, row.source_id, row.version, row.part]);
}
function exactRequest(value: LabMemoryRequest): LabMemoryRequest {
  valid(value && typeof value === "object" && !Array.isArray(value));
  const keys = [
    "visibility",
    "actorIds",
    "query",
    "entityIds",
    "requiredSourceIds",
    "maxBytes",
    "maxExcerpts",
  ];
  valid(
    Object.keys(value).length === keys.length &&
      keys.every((key) => Object.hasOwn(value, key)),
  );
  valid(value.visibility === "public" || value.visibility === "private");
  for (const entries of [
    value.actorIds,
    value.entityIds,
    value.requiredSourceIds,
  ])
    valid(
      Array.isArray(entries) &&
        entries.length <= 128 &&
        entries.every(isUuid) &&
        new Set(entries).size === entries.length,
    );
  // A character-scoped request never treats an empty actor list as omniscience.
  valid(value.actorIds.length > 0);
  valid(
    typeof value.query === "string" &&
      value.query.length <= 12_000 &&
      !value.query.includes("\u0000"),
  );
  valid(
    Number.isSafeInteger(value.maxBytes) &&
      value.maxBytes >= 2 &&
      value.maxBytes <= 120_000,
  );
  valid(
    Number.isSafeInteger(value.maxExcerpts) &&
      value.maxExcerpts >= 1 &&
      value.maxExcerpts <= 12,
  );
  return structuredClone(value);
}
function requestFor(
  state: ReadDetachedState,
  request: LabMemoryRequest,
): RetrievalRequest {
  const raw = state.records["rpg_private.runtime_state"];
  valid(raw.length === 1 && Number.isSafeInteger(raw[0].world_minutes));
  return {
    ...request,
    // Transport sentinel only, exactly as for the pure World adapter. Every
    // candidate/ref is stamped after its selected-manifest membership is proven.
    timeline: { timelineId: state.manifest.timelineId, epoch: 1 },
    campaignId: state.campaignId,
    worldMinutes: raw[0].world_minutes as number,
    historicalComparison: false,
  };
}

function mapsToPinnedSource(
  row: DetachedMemorySourceRow,
  state: ReadDetachedState,
  visibility: "public" | "private",
): boolean {
  if (row.kind === "document") {
    // Effective DM guidance is never Canon/Memory, even with a malformed saved
    // index row. Ordinary documents are supplied only by the exact input pins.
    if (row.source_id === state.run?.input.effectiveGuidance.documentId)
      return false;
    return state.documentVersions.some(
      (document) =>
        document.document_id === row.source_id &&
        String(document.version) === row.version &&
        document.status !== "archived",
    );
  }
  if (Object.hasOwn(recordFamilies, row.kind)) {
    const family = recordFamilies[row.kind as keyof typeof recordFamilies];
    return state.records[family].some(
      (source) =>
        (source.id ?? source.campaign_id) === row.source_id &&
        String(source.revision) === row.version &&
        source.status !== "archived",
    );
  }
  if (row.kind === "event" || row.kind === "private_event") {
    if (row.version !== "1") return false;
    const world = state.records["rpg_private.world_events"].find(
      (source) => source.id === row.source_id,
    );
    if (world) return world.event.visibility === visibility;
    return state.records["rpg_private.runtime_events"].some(
      (source) => source.id === row.source_id,
    );
  }
  if (row.kind === "summary") {
    const family =
      visibility === "public"
        ? "public.rpg_memory_summaries"
        : "rpg_private.memory_summaries";
    return (
      row.source_refs.length > 0 &&
      state.records[family].some(
        (source) =>
          source.id === row.source_id &&
          source.valid === true &&
          String(source.schema_version ?? 1) === row.version,
      )
    );
  }
  return false;
}

function mapSource(
  row: DetachedMemorySourceRow,
  state: ReadDetachedState,
  request: RetrievalRequest,
): MemorySource | null {
  if (
    !kinds.includes(row.kind) ||
    !authorities.includes(String(row.authority)) ||
    !statements.includes(String(row.statement_kind)) ||
    !Number.isSafeInteger(row.sequence) ||
    (row.sequence as number) < 1 ||
    !Number.isSafeInteger(row.significance) ||
    (row.significance as number) < 0 ||
    !Array.isArray(row.entity_ids) ||
    !row.entity_ids.every(isUuid) ||
    typeof row.unresolved !== "boolean" ||
    (row.session_id !== null && !isUuid(row.session_id)) ||
    (row.attribution !== null && typeof row.attribution !== "string") ||
    (row.fact_key !== null && typeof row.fact_key !== "string") ||
    (row.fact_value !== null && typeof row.fact_value !== "string")
  )
    return null;
  const timeline = request.timeline!;
  const sourceRefs: MemorySourceRef[] = row.source_refs.map((ref) => ({
    timeline: { ...timeline },
    campaignId: state.campaignId,
    kind: ref.kind as MemorySourceKind,
    id: ref.id as string,
    version: ref.version as string,
    part: ref.part as number,
    visibility: request.visibility,
  }));
  const source: MemorySource = {
    timeline: { ...timeline },
    id: row.id,
    campaignId: state.campaignId,
    ref: {
      timeline: { ...timeline },
      campaignId: state.campaignId,
      kind: row.kind as MemorySourceKind,
      id: row.source_id,
      version: row.version,
      part: row.part,
      visibility: request.visibility,
    },
    sequence: row.sequence as number,
    sessionId: row.session_id as string | null,
    text: row.text,
    entityIds: [...row.entity_ids] as string[],
    knownBy: [...row.known_by],
    authority: row.authority as MemorySource["authority"],
    statementKind: row.statement_kind as MemorySource["statementKind"],
    attribution: row.attribution as string | null,
    validFrom: row.valid_from,
    validTo: row.valid_to,
    significance: row.significance as number,
    unresolved: row.unresolved,
    current: row.current,
    status: row.status,
    factKey: row.fact_key as string | null,
    factValue: row.fact_value as string | null,
    sourceRefs,
  };
  const world = state.records["rpg_private.world_events"].find(
    (event) =>
      event.id === row.source_id &&
      (row.kind === "event" || row.kind === "private_event"),
  );
  if (world) {
    const event = { ...world.event, sequence: world.sequence };
    if (
      event.text !== row.text ||
      !event.evidence.every((evidence) =>
        labEvidencePinned(evidence, state, request.visibility),
      ) ||
      (request.visibility === "public" &&
        event.evidence.some((evidence) => evidence.knowledge !== "character"))
    )
      return null;
    const inherited = worldEventMemorySource(event, {
      ownerId: state.ownerId,
      campaignId: state.campaignId,
      timeline: { ...timeline },
      worldMinutes: request.worldMinutes,
      memberEventIds: new Set(
        state.records["rpg_private.world_events"].map((event) => event.id),
      ),
      sourceVersionIds: new Set(
        state.libraryRecords
          .filter((row) => row.kind === "source")
          .map((row) => row.versionId),
      ),
      visibility: request.visibility,
      actorIds: request.actorIds,
      knownBy: row.known_by,
      sessionId: source.sessionId,
    });
    if (!inherited) return null;
    // Existing Memory row identity/authority survives, including manual correction
    // precedence. Event involvement is never used as a knowledge grant.
    return {
      ...source,
      text: inherited.text,
      statementKind: inherited.statementKind,
    };
  }
  return source;
}

/** Candidate membership, current restrictions, exact references and positive
 * actor knowledge are resolved BEFORE the existing selector sees any candidates. */
export function buildLabMemoryBatch(
  value: DetachedState,
  input: LabMemoryRequest,
): MemoryCandidateBatch {
  const state = validateLabDetachedState(value),
    selected = exactRequest(input),
    request = requestFor(state, selected);
  valid(
    state.run !== null &&
      state.manifest.schemaVersion === 3 &&
      state.canonGeneration === state.manifest.canonGeneration &&
      state.run.reason !== "source_changed",
  );
  const knownActors = new Set(
    state.records["public.rpg_entities"].map((row) => row.id),
  );
  for (const foundation of state.records["rpg_private.world_foundations"]) {
    const world = foundation.world;
    if (world && Array.isArray(world.actors))
      for (const actor of world.actors)
        if (actor && typeof actor === "object" && !Array.isArray(actor))
          knownActors.add(actor.id);
  }
  valid(selected.actorIds.every((actor) => knownActors.has(actor)));
  const table =
    selected.visibility === "public"
      ? "rpg_private.memory_public_sources"
      : "rpg_private.memory_private_sources";
  const rows = state.records[table],
    byIdentity = new Map<string, DetachedMemorySourceRow>();
  for (const row of rows) {
    const key = sourceIdentity(row);
    valid(!byIdentity.has(key));
    byIdentity.set(key, row);
  }
  const restrictions = new Set(state.restrictions.map((row) => row.source_id));
  const memo = new Map<string, boolean>();
  function eligible(
    row: DetachedMemorySourceRow,
    path = new Set<string>(),
  ): boolean {
    if (path.has(row.id) || path.size >= 32) return false;
    const prior = memo.get(row.id);
    if (prior !== undefined) return prior;
    const next = new Set(path).add(row.id);
    const result =
      row.current &&
      row.status === "valid" &&
      !(selected.visibility === "public" && row.kind === "private_event") &&
      !restrictions.has(row.source_id) &&
      !restrictions.has(row.id) &&
      (row.valid_from === null || row.valid_from <= request.worldMinutes) &&
      (row.valid_to === null || row.valid_to > request.worldMinutes) &&
      selected.actorIds.every((actor) => row.known_by.includes(actor)) &&
      mapsToPinnedSource(row, state, selected.visibility) &&
      mapSource(row, state, request) !== null &&
      (!(row.authority === "derived" || row.kind === "summary") ||
        row.source_refs.length > 0) &&
      row.source_refs.every((ref: JsonObject) => {
        if (
          ref.campaignId !== state.campaignId ||
          ref.visibility !== selected.visibility ||
          typeof ref.kind !== "string" ||
          !kinds.includes(ref.kind) ||
          !isUuid(ref.id) ||
          typeof ref.version !== "string" ||
          !Number.isSafeInteger(ref.part) ||
          (ref.part as number) < 0 ||
          restrictions.has(ref.id)
        )
          return false;
        const exact = byIdentity.get(
          sourceIdentity({
            kind: ref.kind,
            source_id: ref.id,
            version: ref.version,
            part: ref.part as number,
          }),
        );
        return exact !== undefined && eligible(exact, next);
      });
    memo.set(row.id, result);
    return result;
  }
  const sources = rows
    .filter((row) => eligible(row))
    .flatMap((row) => {
      const source = mapSource(row, state, request);
      return source ? [source] : [];
    });
  // Exact eligible entity evidence is also needed before names can influence
  // query expansion. Mere event participation never reveals a hidden alias.
  const knownEntities = new Set(
    sources
      .filter((source) => source.ref.kind === "entity")
      .map((source) => source.ref.id),
  );
  const aliases: EntityAlias[] = state.records[
    "rpg_private.memory_aliases"
  ].flatMap((row) => {
    const entity = state.records["public.rpg_entities"].find(
      (entity) => entity.id === row.entity_id,
    );
    return entity &&
      typeof entity.id === "string" &&
      knownEntities.has(entity.id) &&
      typeof entity.name === "string" &&
      typeof row.alias === "string"
      ? [
          {
            timeline: { ...request.timeline! },
            campaignId: state.campaignId,
            entityId: entity.id,
            alias: row.alias,
            currentName: entity.name,
          },
        ]
      : [];
  });
  return {
    timeline: { ...request.timeline! },
    campaignId: state.campaignId,
    generation: state.canonGeneration,
    sources,
    aliases,
  };
}

/** Ranking, required-source handling, bounded lexical expansion and budgets all
 * remain the accepted Memory implementation. There is no detached search index. */
export function retrieveLabMemory(
  value: DetachedState,
  input: LabMemoryRequest,
): RetrievalResult {
  try {
    const state = validateLabDetachedState(value),
      request = requestFor(state, exactRequest(input));
    const batch = buildLabMemoryBatch(state, input);
    const expanded = expandRetrievalRequest(
      {
        ...request,
        requiredSourceIds: selectCriticalSourceIds(request, batch),
      },
      batch.aliases,
    );
    return retrieveMemory(expanded, batch);
  } catch {
    return {
      sources: [],
      paused: true,
      reason: "missing",
      expanded: false,
      bytes: 2,
    };
  }
}
