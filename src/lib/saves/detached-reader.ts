// Private, inert vault adapter. It never queries or installs an active projection.
import { DmError } from "../gameplay/dm-errors.ts";
import type { JsonObject } from "../gameplay/contracts.ts";
import type { FoundationLoopState } from "../foundation-loop/contracts.ts";
import type { CommittedWorldEvent } from "../production/contracts.ts";
import { isUuid } from "../persistence/validation.ts";
import { parseLibraryRecord } from "../world-library/parsers.ts";
import { parseWorldState } from "../world/validation.ts";
import type {
  DetachedRead,
  DetachedState,
  LabInputBundle,
  LabRun,
} from "../world-lab/server-contracts.ts";

// These inventories mirror timeline_tables_v1()/timeline_tables(). Schema 3
// changes the manifest's run association, never the accepted schema 1 inventory.
export const DETACHED_TABLES_V1 = [
  "public.rpg_settings",
  "public.rpg_documents",
  "public.rpg_entities",
  "public.rpg_storages",
  "public.rpg_items",
  "public.rpg_sessions",
  "public.rpg_scenes",
  "public.rpg_public_state",
  "public.rpg_quests",
  "public.rpg_locations",
  "public.rpg_conversations",
  "public.rpg_rest_records",
  "public.rpg_recipes",
  "public.rpg_effects",
  "public.rpg_encounters",
  "public.rpg_encounter_participants",
  "public.rpg_pending_actions",
  "public.rpg_session_guidance",
  "public.rpg_provenance",
  "rpg_private.runtime_state",
  "rpg_private.turns",
  "rpg_private.runtime_commands",
  "rpg_private.runtime_events",
  "rpg_private.dm_state",
  "rpg_private.memory_state",
  "rpg_private.memory_public_sources",
  "rpg_private.memory_private_sources",
  "rpg_private.memory_aliases",
  "rpg_private.memory_restrictions",
  "rpg_private.memory_boundaries",
  "rpg_private.memory_checkpoints",
  "public.rpg_memory_summaries",
  "rpg_private.memory_summaries",
  "rpg_private.memory_jobs",
  "rpg_private.memory_commands",
] as const;
export const DETACHED_TABLES_V2 = [
  ...DETACHED_TABLES_V1,
  "rpg_private.world_foundations",
  "rpg_private.world_events",
  "rpg_private.world_stages",
  "rpg_private.world_commands",
  "rpg_private.execution_profiles",
] as const;
export type DetachedTableName = (typeof DETACHED_TABLES_V2)[number];
export type DetachedCampaignRow = JsonObject & { campaign_id: string };
export type DetachedWorldFoundationRow = DetachedCampaignRow & {
  revision: number;
  world: JsonObject | null;
  bindings: JsonObject[];
  ruleset: JsonObject;
  execution_policy: JsonObject | null;
  // Absent on older immutable v2 rows. Never fabricate or discard Wave 4 state.
  loop_state?: JsonObject | null;
};
export type DetachedWorldEventRow = DetachedCampaignRow & {
  id: string;
  operation_id: string;
  sequence: number;
  event: JsonObject &
    Omit<CommittedWorldEvent, "sequence"> & { sequence?: number };
};
export type DetachedMemorySourceRow = DetachedCampaignRow & {
  id: string;
  kind: string;
  source_id: string;
  version: string;
  part: number;
  text: string;
  known_by: string[];
  source_refs: JsonObject[];
  current: boolean;
  status: "valid" | "superseded" | "archived" | "invalid";
  valid_from: number | null;
  valid_to: number | null;
};
export type DetachedRecordMap = {
  [
    K in Exclude<
      DetachedTableName,
      | "rpg_private.world_foundations"
      | "rpg_private.world_events"
      | "rpg_private.memory_public_sources"
      | "rpg_private.memory_private_sources"
    >
  ]: DetachedCampaignRow[];
} & {
  "rpg_private.world_foundations": DetachedWorldFoundationRow[];
  "rpg_private.world_events": DetachedWorldEventRow[];
  "rpg_private.memory_public_sources": DetachedMemorySourceRow[];
  "rpg_private.memory_private_sources": DetachedMemorySourceRow[];
};
export type ReadDetachedState = Omit<DetachedState, "records"> & {
  records: DetachedRecordMap;
};
export type DetachedReadScope = {
  ownerId: string;
  campaignId: string;
  manifestId?: string;
  timelineId?: string;
  runId?: string | null;
};

function requireRead(condition: unknown): asserts condition {
  if (!condition) throw new DmError("validation");
}
function object(value: unknown): Record<string, unknown> {
  requireRead(
    value !== null && typeof value === "object" && !Array.isArray(value),
  );
  requireRead(
    Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null,
  );
  return value as Record<string, unknown>;
}
function exact(value: unknown, keys: readonly string[]) {
  const result = object(value);
  requireRead(
    Object.keys(result).length === keys.length &&
      keys.every((key) => Object.hasOwn(result, key)),
  );
  return result;
}
function integer(value: unknown, min = 0): asserts value is number {
  requireRead(Number.isSafeInteger(value) && (value as number) >= min);
}
function text(value: unknown, max = 200_000): asserts value is string {
  requireRead(
    typeof value === "string" &&
      value.trim().length > 0 &&
      value.length <= max &&
      !value.includes("\u0000"),
  );
}
function digest(value: unknown) {
  requireRead(typeof value === "string" && /^[0-9a-f]{64}$/.test(value));
}
function ids(value: unknown): asserts value is string[] {
  requireRead(Array.isArray(value) && value.every(isUuid));
  requireRead(new Set(value).size === value.length);
}
function json(value: unknown, path = new Set<object>(), depth = 0): void {
  requireRead(depth <= 64);
  if (value === null || typeof value === "boolean" || typeof value === "string")
    return;
  if (typeof value === "number") {
    requireRead(Number.isFinite(value));
    return;
  }
  requireRead(typeof value === "object" && value !== null && !path.has(value));
  path.add(value);
  if (Array.isArray(value)) {
    requireRead(Object.keys(value).length === value.length);
    value.forEach((entry) => json(entry, path, depth + 1));
  } else {
    for (const entry of Object.values(object(value)))
      json(entry, path, depth + 1);
  }
  path.delete(value);
}

/** Envelope checks only: the SQL read MUST first verify the stored digest using
 * sha256(payload::text). JSON.stringify is not Postgres jsonb serialization. */
export function validateDetachedRun(
  value: unknown,
  scope: DetachedReadScope,
): LabRun {
  const run = exact(value, [
    "id",
    "ownerId",
    "campaignId",
    "timelineId",
    "label",
    "input",
    "inputDigest",
    "status",
    "reason",
    "revision",
    "leaseGeneration",
    "headRevision",
    "headManifestId",
    "lastCheckpointId",
    "currentWorldMinutes",
  ]);
  for (const key of [
    "id",
    "ownerId",
    "campaignId",
    "timelineId",
    "headManifestId",
    "lastCheckpointId",
  ])
    requireRead(isUuid(run[key]));
  requireRead(
    run.ownerId === scope.ownerId && run.campaignId === scope.campaignId,
  );
  if (scope.runId !== undefined) requireRead(run.id === scope.runId);
  if (scope.timelineId !== undefined)
    requireRead(run.timelineId === scope.timelineId);
  text(run.label, 160);
  digest(run.inputDigest);
  for (const key of [
    "revision",
    "leaseGeneration",
    "headRevision",
    "currentWorldMinutes",
  ])
    integer(run[key]);
  requireRead(
    [
      "prepared",
      "running",
      "paused",
      "completed",
      "cancelled",
      "failed",
    ].includes(run.status as string),
  );
  requireRead(
    [
      null,
      "review_required",
      "source_changed",
      "unsupported",
      "work_limit",
      "cancelled",
      "unavailable",
    ].includes(run.reason as string | null),
  );
  const input = exact(run.input, [
    "schemaVersion",
    "purpose",
    "nonCanon",
    "ownerId",
    "campaignId",
    "base",
    "scenarioVersionId",
    "divergenceVersionId",
    "packVersionIds",
    "sourceVersionIds",
    "documentVersions",
    "sourceHeads",
    "canonGeneration",
    "ruleset",
    "effectiveSettings",
    "effectiveGuidance",
    "resolutionPolicy",
    "startWorldMinutes",
    "throughWorldMinutes",
  ]);
  requireRead(
    input.schemaVersion === 1 &&
      input.purpose === "simulation" &&
      input.nonCanon === true,
  );
  requireRead(
    input.ownerId === scope.ownerId && input.campaignId === scope.campaignId,
  );
  for (const key of ["scenarioVersionId", "divergenceVersionId"])
    requireRead(isUuid(input[key]));
  requireRead(input.scenarioVersionId !== input.divergenceVersionId);
  ids(input.packVersionIds);
  ids(input.sourceVersionIds);
  const base = exact(input.base, [
    "saveId",
    "timelineId",
    "manifestId",
    "schemaVersion",
  ]);
  for (const key of ["saveId", "timelineId", "manifestId"])
    requireRead(isUuid(base[key]));
  requireRead([1, 2, 3].includes(base.schemaVersion as number));
  integer(input.canonGeneration);
  integer(input.startWorldMinutes);
  integer(input.throughWorldMinutes);
  requireRead(input.throughWorldMinutes >= input.startWorldMinutes);
  requireRead(
    (run.currentWorldMinutes as number) >= input.startWorldMinutes &&
      (run.currentWorldMinutes as number) <= input.throughWorldMinutes,
  );
  const ruleset = exact(input.ruleset, [
    "id",
    "version",
    "mode",
    "validatorVersion",
  ]);
  text(ruleset.id, 160);
  text(ruleset.validatorVersion, 160);
  integer(ruleset.version, 1);
  requireRead(
    ["full_ruleset", "world_logic", "custom_ruleset"].includes(
      ruleset.mode as string,
    ),
  );
  object(input.effectiveSettings);
  object(input.effectiveGuidance);
  const policy = exact(input.resolutionPolicy, ["id", "version", "maxSteps"]);
  requireRead(policy.id === "deterministic-world-v1" && policy.version === 1);
  integer(policy.maxSteps, 1);
  requireRead(
    Array.isArray(input.documentVersions) && Array.isArray(input.sourceHeads),
  );
  const documents = new Set<string>(),
    sources = new Set<string>();
  for (const raw of input.documentVersions) {
    const row = exact(raw, ["documentId", "versionId", "digest"]);
    requireRead(
      isUuid(row.documentId) &&
        isUuid(row.versionId) &&
        !documents.has(row.documentId),
    );
    digest(row.digest);
    documents.add(row.documentId);
  }
  for (const raw of input.sourceHeads) {
    const row = exact(raw, ["sourceId", "versionId"]);
    requireRead(
      isUuid(row.sourceId) &&
        isUuid(row.versionId) &&
        !sources.has(row.sourceId),
    );
    requireRead(input.sourceVersionIds.includes(row.versionId));
    sources.add(row.sourceId);
  }
  requireRead(sources.size === input.sourceVersionIds.length);
  json(value);
  return structuredClone(value) as LabRun;
}

const singletonTables = new Set<DetachedTableName>([
  "public.rpg_settings",
  "public.rpg_public_state",
  "rpg_private.runtime_state",
  "rpg_private.dm_state",
  "rpg_private.memory_state",
  "rpg_private.world_foundations",
]);
function payloadKey(table: DetachedTableName, row: Record<string, unknown>) {
  if (table === "rpg_private.memory_aliases") {
    requireRead(isUuid(row.entity_id));
    text(row.alias);
    return `${row.entity_id}:${row.alias}`;
  }
  if (table === "rpg_private.memory_restrictions") {
    requireRead(isUuid(row.source_id));
    text(row.kind, 80);
    return `${row.kind}:${row.source_id}`;
  }
  if (singletonTables.has(table)) {
    requireRead(!Object.hasOwn(row, "id"));
    return row.campaign_id;
  }
  requireRead(isUuid(row.id));
  return row.id;
}
function validateFamily(
  table: DetachedTableName,
  row: Record<string, unknown>,
  campaignId: string,
) {
  if (table === "rpg_private.runtime_state") {
    integer(row.revision, 1);
    integer(row.world_minutes);
    requireRead(
      row.configuration === null || typeof row.configuration === "object",
    );
  }
  if (table === "rpg_private.world_foundations") {
    integer(row.revision, 1);
    if (row.world !== null) parseWorldState(row.world, campaignId);
    requireRead(Array.isArray(row.bindings));
    row.bindings.forEach((binding) => object(binding));
    object(row.ruleset);
    if (row.execution_policy !== null) object(row.execution_policy);
    if (row.loop_state !== undefined && row.loop_state !== null) {
      const loop = object(row.loop_state);
      requireRead(loop.schemaVersion === 1);
      integer(loop.version);
      object(loop.profile);
      requireRead(loop.progression === "on" || loop.progression === "off");
      for (const key of [
        "currencies",
        "itemPolicies",
        "merchants",
        "tracks",
        "rewards",
        "progress",
        "pending",
        "preparations",
      ])
        requireRead(Array.isArray(loop[key]));
    }
  }
  if (table === "rpg_private.world_events") {
    requireRead(isUuid(row.operation_id));
    integer(row.sequence, 1);
    const hasSequence = Object.hasOwn(object(row.event), "sequence");
    const event = exact(row.event, [
      "schemaVersion",
      "id",
      "campaignId",
      "originTimelineId",
      "operationId",
      "worldMinutes",
      "kind",
      "actorIds",
      "threadIds",
      "visibility",
      "text",
      "evidence",
      "payload",
      ...(hasSequence ? ["sequence"] : []),
    ]);
    requireRead(
      event.schemaVersion === 1 &&
        event.id === row.id &&
        event.campaignId === campaignId,
    );
    requireRead(
      event.operationId === row.operation_id && isUuid(event.originTimelineId),
    );
    if (hasSequence) {
      integer(event.sequence, 1);
      requireRead(event.sequence === row.sequence);
    }
    integer(event.worldMinutes);
    text(event.kind, 160);
    text(event.text);
    ids(event.actorIds);
    ids(event.threadIds);
    requireRead(
      event.visibility === "public" || event.visibility === "private",
    );
    requireRead(Array.isArray(event.evidence));
    object(event.payload);
  }
  if (
    table === "rpg_private.memory_public_sources" ||
    table === "rpg_private.memory_private_sources"
  ) {
    text(row.kind, 80);
    requireRead(isUuid(row.source_id));
    text(row.version, 200);
    integer(row.part);
    text(row.text);
    ids(row.known_by);
    requireRead(Array.isArray(row.source_refs));
    row.source_refs.forEach((ref) => object(ref));
    requireRead(
      typeof row.current === "boolean" &&
        ["valid", "superseded", "archived", "invalid"].includes(
          row.status as string,
        ),
    );
    for (const key of ["valid_from", "valid_to"])
      if (row[key] !== null) integer(row[key]);
  }
}

export function readDetachedState(
  value: unknown,
  scope: DetachedReadScope,
): ReadDetachedState {
  try {
    requireRead(isUuid(scope.ownerId) && isUuid(scope.campaignId));
    if (scope.manifestId !== undefined) requireRead(isUuid(scope.manifestId));
    if (scope.timelineId !== undefined) requireRead(isUuid(scope.timelineId));
    if (scope.runId !== undefined && scope.runId !== null)
      requireRead(isUuid(scope.runId));
    json(value);
    const read = exact(value, [
      "ownerId",
      "campaignId",
      "manifest",
      "versions",
      "canonGeneration",
      "libraryRecords",
      "documentVersions",
      "restrictions",
      "run",
    ]);
    requireRead(
      read.ownerId === scope.ownerId && read.campaignId === scope.campaignId,
    );
    integer(read.canonGeneration);
    const manifest = exact(read.manifest, [
      "id",
      "campaignId",
      "timelineId",
      "schemaVersion",
      "canonGeneration",
      "refs",
      "publicMetadata",
      "runId",
    ]);
    requireRead(
      isUuid(manifest.id) &&
        isUuid(manifest.timelineId) &&
        manifest.campaignId === scope.campaignId,
    );
    if (scope.manifestId !== undefined)
      requireRead(manifest.id === scope.manifestId);
    if (scope.timelineId !== undefined)
      requireRead(manifest.timelineId === scope.timelineId);
    if (scope.runId !== undefined) requireRead(manifest.runId === scope.runId);
    requireRead([1, 2, 3].includes(manifest.schemaVersion as number));
    integer(manifest.canonGeneration);
    requireRead(manifest.canonGeneration <= read.canonGeneration);
    object(manifest.publicMetadata);
    const tables =
      manifest.schemaVersion === 1 ? DETACHED_TABLES_V1 : DETACHED_TABLES_V2;
    const refs = exact(manifest.refs, tables);
    const membership = new Map<string, DetachedTableName>();
    for (const table of tables) {
      ids(refs[table]);
      for (const id of refs[table]) {
        requireRead(!membership.has(id));
        membership.set(id, table);
      }
    }
    requireRead(
      Array.isArray(read.versions) && read.versions.length === membership.size,
    );
    const seen = new Set<string>(),
      keys = new Set<string>();
    const records = Object.fromEntries(
      DETACHED_TABLES_V2.map((table) => [table, []]),
    ) as unknown as DetachedRecordMap;
    const byId = new Map<string, JsonObject>();
    for (const raw of read.versions) {
      const version = exact(raw, [
        "id",
        "campaignId",
        "tableName",
        "rowKey",
        "digest",
        "payload",
        "originTimelineId",
      ]);
      requireRead(isUuid(version.id) && isUuid(version.originTimelineId));
      requireRead(
        version.campaignId === scope.campaignId && !seen.has(version.id),
      );
      const table = membership.get(version.id);
      requireRead(table !== undefined && version.tableName === table);
      digest(version.digest);
      text(version.rowKey);
      const payload = object(version.payload);
      requireRead(
        payload.campaign_id === scope.campaignId &&
          payloadKey(table, payload) === version.rowKey,
      );
      if (Object.hasOwn(payload, "campaignId"))
        requireRead(payload.campaignId === scope.campaignId);
      if (Object.hasOwn(payload, "owner_id"))
        requireRead(payload.owner_id === scope.ownerId);
      if (Object.hasOwn(payload, "ownerId"))
        requireRead(payload.ownerId === scope.ownerId);
      const key = `${table}:${version.rowKey}`;
      requireRead(!keys.has(key));
      validateFamily(table, payload, scope.campaignId);
      seen.add(version.id);
      keys.add(key);
      byId.set(version.id, structuredClone(payload) as JsonObject);
    }
    // Preserve manifest order, never the order of an RPC join or active table.
    for (const table of tables) {
      const ids = refs[table] as string[];
      (records[table] as JsonObject[]) = ids.map((id) => byId.get(id)!);
    }
    const run = read.run === null ? null : validateDetachedRun(read.run, scope);
    if (manifest.schemaVersion === 3) {
      requireRead(
        run !== null &&
          manifest.runId === run.id &&
          manifest.timelineId === run.timelineId,
      );
      requireRead(manifest.canonGeneration === run.input.canonGeneration);
    } else requireRead(manifest.runId === null && run === null);
    requireRead(Array.isArray(read.libraryRecords));
    const libraryRecords = read.libraryRecords.map((row) =>
      parseLibraryRecord(row, scope.ownerId),
    );
    const libraryIds = new Set(libraryRecords.map((row) => row.versionId));
    requireRead(libraryIds.size === libraryRecords.length);
    requireRead(Array.isArray(read.documentVersions));
    const docIds = new Set<string>();
    for (const raw of read.documentVersions) {
      const row = object(raw);
      requireRead(
        isUuid(row.id) &&
          isUuid(row.document_id) &&
          row.campaign_id === scope.campaignId &&
          !docIds.has(row.id),
      );
      integer(row.version, 1);
      text(row.title, 200);
      requireRead(
        typeof row.body === "string" &&
          ["canon", "reference", "archived"].includes(row.status as string),
      );
      requireRead(row.restored_from === null || isUuid(row.restored_from));
      text(row.created_at, 100);
      docIds.add(row.id);
    }
    if (run) {
      const input: LabInputBundle = run.input;
      const expected = [
        input.scenarioVersionId,
        input.divergenceVersionId,
        ...input.packVersionIds,
        ...input.sourceVersionIds,
      ];
      requireRead(
        expected.length === new Set(expected).size &&
          expected.length === libraryIds.size &&
          expected.every((id) => libraryIds.has(id)),
      );
      requireRead(
        libraryRecords.find((row) => row.versionId === input.scenarioVersionId)
          ?.kind === "scenario",
      );
      const divergence = libraryRecords.find(
        (row) => row.versionId === input.divergenceVersionId,
      );
      requireRead(
        divergence?.kind === "divergence" &&
          divergence.body.scenarioVersionId === input.scenarioVersionId,
      );
      for (const id of input.packVersionIds)
        requireRead(
          libraryRecords.find((row) => row.versionId === id)?.kind === "pack",
        );
      for (const head of input.sourceHeads)
        requireRead(
          libraryRecords.some(
            (row) =>
              row.kind === "source" &&
              row.versionId === head.versionId &&
              row.id === head.sourceId,
          ),
        );
      requireRead(input.documentVersions.length === docIds.size);
      for (const pin of input.documentVersions)
        requireRead(
          read.documentVersions.some((raw) => {
            const row = object(raw);
            return (
              row.id === pin.versionId && row.document_id === pin.documentId
            );
          }),
        );
    }
    requireRead(Array.isArray(read.restrictions));
    const restrictionKeys = new Set<string>();
    for (const raw of read.restrictions) {
      const row = exact(raw, ["campaign_id", "kind", "source_id"]);
      requireRead(
        row.campaign_id === scope.campaignId && isUuid(row.source_id),
      );
      text(row.kind, 80);
      const key = `${row.kind}:${row.source_id}`;
      requireRead(!restrictionKeys.has(key));
      restrictionKeys.add(key);
    }
    // SQL supplies the union of current restrictions and exact saved restrictions.
    for (const row of records["rpg_private.memory_restrictions"])
      requireRead(restrictionKeys.has(`${row.kind}:${row.source_id}`));
    return {
      ...(structuredClone(value) as DetachedRead),
      libraryRecords,
      run,
      records,
    };
  } catch {
    // Never attach private payload values or a parser/SQL diagnostic to an error.
    throw new DmError("validation");
  }
}

/** Typed access to the already validated immutable family map. */
export function detachedRows<K extends DetachedTableName>(
  state: ReadDetachedState,
  table: K,
): DetachedRecordMap[K] {
  return state.records[table];
}

/** Retain the Wave 4 contract without turning it into an alternate game engine.
 * Individual game domains still validate the configuration they execute. */
export function detachedLoopState(
  state: ReadDetachedState,
): FoundationLoopState | null {
  const rows = state.records["rpg_private.world_foundations"];
  requireRead(rows.length <= 1);
  return rows[0]?.loop_state == null
    ? null
    : (structuredClone(rows[0].loop_state) as unknown as FoundationLoopState);
}
