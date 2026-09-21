// Internal detached authority. Never import this module into browser code.
import { isDeepStrictEqual } from "node:util";
import type { JsonObject } from "../gameplay/contracts.ts";
import type { EvidenceLocator } from "../production/contracts.ts";
import type {
  TypedLibraryRecord,
  TypedRecord,
} from "../world-library/types.ts";
import type { LabPrepareInput } from "./contracts.ts";
import type { DetachedState, LabInputBundle } from "./server-contracts.ts";
import { validateSettings } from "../persistence/validation.ts";
import { parseRulesetRef, resolveRuleset } from "../rulesets/profiles.ts";
import { parseWorldState } from "../world/validation.ts";
import { parseBinding } from "../world-packs/bindings.ts";
import {
  parseLibraryRecord,
  recordEvidence,
  sha256,
} from "../world-library/parsers.ts";
import {
  digest,
  ensure,
  ids,
  integer,
  list,
  literal,
  object,
  sameSet,
  text,
  unique,
  uuid,
} from "../foundation-loop/fields.ts";

export const LAB_LIMITS = Object.freeze({
  horizonMinutes: 43_200,
  maxSteps: 32,
});
export const LAB_MAX_WORLD_MINUTES = 2_147_483_646;

export type LabSourceHead = LabInputBundle["sourceHeads"][number];
export type LabDocumentPin = LabInputBundle["documentVersions"][number];
export type LabApplicabilityBasis = {
  ownerId: string;
  campaignId: string;
  canonGeneration: number;
  sourceHeads: LabSourceHead[];
  documentVersions: LabDocumentPin[];
};
export type LabPreparationAuthority = {
  ownerId: string;
  campaignId: string;
  saveId: string;
  state: DetachedState;
  // Resolved by authenticated storage, never accepted from a browser command.
  sourceHeads: LabSourceHead[];
  documents: LabDocumentPin[];
};

/** SHA input shared with SQL: sorted ASCII object keys, ordered arrays, compact
 * JSON primitives. Numbers are finite, exactly represented ordinary decimals;
 * approval/settings validators further constrain their allowed values. */
export function canonicalLabJson(value: unknown): string {
  let nodes = 0;
  const visit = (item: unknown, depth: number): string => {
    ensure(++nodes <= 100_000 && depth <= 32);
    if (item === null || typeof item === "boolean") return JSON.stringify(item);
    if (typeof item === "string") {
      ensure(!item.includes("\u0000"));
      // PostgreSQL UTF-8 JSON cannot represent lone UTF-16 surrogates.
      ensure(
        !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(
          item,
        ),
      );
      return JSON.stringify(item);
    }
    if (typeof item === "number") {
      ensure(
        Number.isFinite(item) && Math.abs(item) <= Number.MAX_SAFE_INTEGER,
      );
      ensure(item === 0 || Math.abs(item) >= 0.000001);
      return JSON.stringify(item);
    }
    ensure(item !== null && typeof item === "object");
    if (Array.isArray(item)) {
      ensure(Object.keys(item).length === item.length);
      return `[${item.map((child) => visit(child, depth + 1)).join(",")}]`;
    }
    ensure(
      Object.getPrototypeOf(item) === Object.prototype ||
        Object.getPrototypeOf(item) === null,
    );
    const row = item as Record<string, unknown>;
    const keys = Object.keys(row).sort();
    ensure(
      keys.every(
        (key) =>
          /^[\x20-\x7e]+$/.test(key) &&
          !["__proto__", "constructor", "prototype"].includes(key),
      ),
    );
    return `{${keys.map((key) => `${JSON.stringify(key)}:${visit(row[key], depth + 1)}`).join(",")}}`;
  };
  const result = visit(value, 0);
  ensure(result.length <= 1_000_000);
  return result;
}

function json(value: unknown): JsonObject {
  ensure(value !== null && typeof value === "object" && !Array.isArray(value));
  return JSON.parse(canonicalLabJson(value)) as JsonObject;
}

function freeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export function parseLabSourceHeads(value: unknown): LabSourceHead[] {
  const result = unique(
    list(
      value,
      (raw) => {
        const row = object(raw, ["sourceId", "versionId"]);
        return { sourceId: uuid(row.sourceId), versionId: uuid(row.versionId) };
      },
      200,
    ),
    (row) => row.sourceId,
  );
  unique(result, (row) => row.versionId);
  return result;
}

export function parseLabDocumentPins(value: unknown): LabDocumentPin[] {
  const result = unique(
    list(
      value,
      (raw) => {
        const row = object(raw, ["documentId", "versionId", "digest"]);
        return {
          documentId: uuid(row.documentId),
          versionId: uuid(row.versionId),
          digest: digest(row.digest),
        };
      },
      500,
    ),
    (row) => row.documentId,
  );
  unique(result, (row) => row.versionId);
  return result;
}

function sortedHeads(value: LabSourceHead[]) {
  return [...value].sort((a, b) => a.sourceId.localeCompare(b.sourceId));
}
function sortedDocuments(value: LabDocumentPin[]) {
  return [...value].sort((a, b) => a.documentId.localeCompare(b.documentId));
}

export function parseLabInputBundle(value: unknown): LabInputBundle {
  const row = object(value, [
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
  const base = object(row.base, [
    "saveId",
    "timelineId",
    "manifestId",
    "schemaVersion",
  ]);
  const policy = object(row.resolutionPolicy, ["id", "version", "maxSteps"]);
  const campaignId = uuid(row.campaignId);
  const effectiveSettings = json(row.effectiveSettings);
  // The base manifest pins the settings row/revision; retain its complete values.
  validateSettings(effectiveSettings, campaignId);
  const effectiveGuidance = json(row.effectiveGuidance);
  const guidance = object(effectiveGuidance, [
    "documentId",
    "versionId",
    "sessionGuidance",
  ]);
  uuid(guidance.documentId);
  uuid(guidance.versionId);
  unique(
    list(
      guidance.sessionGuidance,
      (raw) => {
        const entry = object(raw, [
          "id",
          "campaign_id",
          "session_id",
          "text",
          "created_at",
        ]);
        uuid(entry.id);
        ensure(entry.campaign_id === campaignId, "scope");
        uuid(entry.session_id);
        text(entry.text, 2000);
        text(entry.created_at, 64);
        return entry;
      },
      1000,
    ),
    (entry) => entry.id,
  );
  const documentVersions = parseLabDocumentPins(row.documentVersions);
  ensure(
    documentVersions.some(
      (pin) =>
        pin.documentId === guidance.documentId &&
        pin.versionId === guidance.versionId,
    ),
    "scope",
  );
  const startWorldMinutes = integer(
    row.startWorldMinutes,
    0,
    LAB_MAX_WORLD_MINUTES,
  );
  const throughWorldMinutes = integer(
    row.throughWorldMinutes,
    startWorldMinutes + 1,
    LAB_MAX_WORLD_MINUTES,
  );
  ensure(throughWorldMinutes - startWorldMinutes <= LAB_LIMITS.horizonMinutes);
  ensure(row.nonCanon === true);
  const result: LabInputBundle = {
    schemaVersion: literal(row.schemaVersion, [1]),
    purpose: literal(row.purpose, ["simulation"]),
    nonCanon: true,
    ownerId: uuid(row.ownerId),
    campaignId,
    base: {
      saveId: uuid(base.saveId),
      timelineId: uuid(base.timelineId),
      manifestId: uuid(base.manifestId),
      schemaVersion: literal(base.schemaVersion, [1, 2, 3]),
    },
    scenarioVersionId: uuid(row.scenarioVersionId),
    divergenceVersionId: uuid(row.divergenceVersionId),
    packVersionIds: ids(row.packVersionIds),
    sourceVersionIds: ids(row.sourceVersionIds),
    documentVersions,
    sourceHeads: parseLabSourceHeads(row.sourceHeads),
    canonGeneration: integer(row.canonGeneration, 1, LAB_MAX_WORLD_MINUTES),
    ruleset: parseRulesetRef(row.ruleset),
    effectiveSettings,
    effectiveGuidance,
    resolutionPolicy: {
      id: literal(policy.id, ["deterministic-world-v1"]),
      version: literal(policy.version, [1]),
      maxSteps: integer(policy.maxSteps, 1, LAB_LIMITS.maxSteps),
    },
    startWorldMinutes,
    throughWorldMinutes,
  };
  ensure(result.sourceHeads.length === result.sourceVersionIds.length, "scope");
  ensure(result.scenarioVersionId !== result.divergenceVersionId, "scope");
  canonicalLabJson(result);
  return freeze(result);
}

export function labInputDigest(value: LabInputBundle): string {
  return sha256(canonicalLabJson(parseLabInputBundle(value)));
}

/** A correction changes applicability, never the historical input or its digest. */
export function isLabInputApplicable(
  input: LabInputBundle,
  basis: LabApplicabilityBasis,
): boolean {
  const pin = parseLabInputBundle(input);
  const current = object(basis, [
    "ownerId",
    "campaignId",
    "canonGeneration",
    "sourceHeads",
    "documentVersions",
  ]);
  ensure(
    uuid(current.ownerId) === pin.ownerId &&
      uuid(current.campaignId) === pin.campaignId,
    "scope",
  );
  const generation = integer(current.canonGeneration, 1, LAB_MAX_WORLD_MINUTES);
  return (
    generation === pin.canonGeneration &&
    canonicalLabJson(sortedHeads(parseLabSourceHeads(current.sourceHeads))) ===
      canonicalLabJson(sortedHeads(pin.sourceHeads)) &&
    canonicalLabJson(
      sortedDocuments(parseLabDocumentPins(current.documentVersions)),
    ) === canonicalLabJson(sortedDocuments(pin.documentVersions))
  );
}

function rows(state: DetachedState, table: string): JsonObject[] {
  const result = state.records[table];
  ensure(Array.isArray(result), "scope");
  ensure(
    result.every((row) => row.campaign_id === state.campaignId),
    "scope",
  );
  return result;
}
function one(state: DetachedState, table: string): JsonObject {
  const values = rows(state, table);
  ensure(values.length === 1, "scope");
  return values[0];
}

function evidenceMatches(
  evidence: EvidenceLocator,
  sources: TypedRecord<"source">[],
) {
  const source = sources.find(
    (row) => row.versionId === evidence.sourceVersionId,
  );
  ensure(
    source &&
      source.id === evidence.sourceId &&
      source.ownerId === evidence.ownerId,
    "scope",
  );
  ensure(
    evidence.visibility === "private" || source.body.visibility === "public",
    "scope",
  );
  ensure(
    source.body.knowledge !== "future_source" ||
      evidence.knowledge === "future_source",
    "scope",
  );
  if (
    source.body.extraction.version === "text-evidence-v1" &&
    source.body.original.kind === "text" &&
    evidence.locator.kind === "text"
  ) {
    const span = /^(0|[1-9]\d*):(0|[1-9]\d*)$/.exec(evidence.locator.value);
    ensure(span, "scope");
    const start = integer(Number(span[1]), 0, source.body.original.text.length);
    const end = integer(
      Number(span[2]),
      start + 1,
      source.body.original.text.length,
    );
    ensure(
      sha256(source.body.original.text.slice(start, end)) === evidence.digest,
      "conflict",
    );
  }
}

function requireLibrary<K extends TypedLibraryRecord["kind"]>(
  records: TypedLibraryRecord[],
  kind: K,
  versionId: string,
): TypedRecord<K> {
  const record = records.find(
    (row) => row.kind === kind && row.versionId === versionId,
  );
  ensure(record, "scope");
  return record as TypedRecord<K>;
}

export function parseLabPrepareSelection(value: unknown): LabPrepareInput {
  const row = object(value, [
    "operationId",
    "campaignId",
    "saveId",
    "scenarioVersionId",
    "divergenceVersionId",
    "label",
    "horizonMinutes",
  ]);
  return {
    operationId: uuid(row.operationId),
    campaignId: uuid(row.campaignId),
    saveId: uuid(row.saveId),
    scenarioVersionId: uuid(row.scenarioVersionId),
    divergenceVersionId: uuid(row.divergenceVersionId),
    label: text(row.label, 160),
    horizonMinutes: integer(row.horizonMinutes, 1, LAB_LIMITS.horizonMinutes),
  };
}

export function prepareLabInput(
  request: LabPrepareInput,
  authority: LabPreparationAuthority,
): { input: LabInputBundle; inputDigest: string } {
  // Repeat the allowlist even when a route already ran the public-safe parser.
  const selection = parseLabPrepareSelection(request);
  const horizon = selection.horizonMinutes;
  const campaignId = uuid(selection.campaignId),
    ownerId = uuid(authority.ownerId);
  ensure(
    authority.campaignId === campaignId &&
      authority.saveId === uuid(selection.saveId),
    "scope",
  );
  const state = authority.state;
  ensure(
    state.ownerId === ownerId &&
      state.campaignId === campaignId &&
      state.manifest.campaignId === campaignId,
    "scope",
  );
  ensure(
    state.run === null &&
      state.manifest.runId === null &&
      state.manifest.schemaVersion === 2,
    "scope",
  );
  ensure(state.manifest.canonGeneration === state.canonGeneration, "conflict");
  // DetachedState is supplied by the injected exact-membership reader. Confirm
  // no caller replaced its derived rows after validation.
  for (const [table, recordRows] of Object.entries(state.records)) {
    const versions = (state.manifest.refs[table] ?? []).map((id) =>
      state.versions.find(
        (version) => version.id === id && version.tableName === table,
      ),
    );
    ensure(
      versions.every(Boolean) &&
        isDeepStrictEqual(
          recordRows,
          versions.map((version) => version!.payload),
        ),
      "scope",
    );
  }
  const runtime = one(state, "rpg_private.runtime_state");
  const startWorldMinutes = integer(
    runtime.world_minutes,
    0,
    LAB_MAX_WORLD_MINUTES - horizon,
  );
  ensure(
    state.manifest.publicMetadata.worldMinutes === startWorldMinutes,
    "conflict",
  );
  ensure(state.manifest.publicMetadata.pendingAction === false, "conflict");
  for (const turn of rows(state, "rpg_private.turns")) {
    ensure(turn.owner_id === ownerId, "scope");
    ensure(
      ["committed", "cancelled", "failed"].includes(String(turn.status)),
      "conflict",
    );
    ensure(turn.status !== "failed" || turn.retryable === false, "conflict");
  }
  ensure(
    rows(state, "public.rpg_pending_actions").every(
      (row) => row.status === "resolved" || row.status === "cancelled",
    ),
    "conflict",
  );
  ensure(
    rows(state, "rpg_private.world_stages").every((stage) =>
      rows(state, "rpg_private.turns").some(
        (turn) => turn.id === stage.id && turn.status === "committed",
      ),
    ),
    "conflict",
  );
  const foundation = one(state, "rpg_private.world_foundations");
  ensure(
    foundation.world !== null && foundation.world !== undefined,
    "conflict",
  );
  parseWorldState(foundation.world, campaignId);
  const ruleset = parseRulesetRef(foundation.ruleset);
  // D1 has no authority to fetch/install a missing custom profile definition.
  const profile = resolveRuleset(ruleset);
  ensure(profile.implementation !== "unsupported", "conflict");
  const bindings = unique(
    list(foundation.bindings, parseBinding),
    (row) => row.id,
  );
  ensure(
    bindings.every(
      (row) => row.ownerId === ownerId && row.campaignId === campaignId,
    ),
    "scope",
  );
  const library = unique(
    state.libraryRecords.map((row) => parseLibraryRecord(row, ownerId)),
    (row) => row.versionId,
  );
  const scenario = requireLibrary(
    library,
    "scenario",
    uuid(selection.scenarioVersionId),
  );
  const divergence = requireLibrary(
    library,
    "divergence",
    uuid(selection.divergenceVersionId),
  );
  ensure(
    scenario.body.status === "approved" &&
      scenario.body.approval !== null &&
      divergence.body.approval !== null,
    "conflict",
  );
  ensure(divergence.body.scenarioVersionId === scenario.versionId, "scope");
  ensure(scenario.body.unresolvedConflictIds.length === 0, "conflict");
  ensure(scenario.body.entry.worldMinutes <= startWorldMinutes, "conflict");
  const scenarioBindings = bindings.filter(
    (binding) => binding.scenarioVersionId === scenario.versionId,
  );
  ensure(
    scenario.body.packVersionIds.length === 0 || scenarioBindings.length > 0,
    "scope",
  );
  ensure(
    scenario.body.packVersionIds.length > 0 ||
      scenario.body.assumptions.length > 0,
    "conflict",
  );
  // Every binding participates in the exact source basis; unrelated bound packs
  // cannot disappear from the run merely because another Scenario is selected.
  const packIds = new Set(scenario.body.packVersionIds);
  for (const binding of bindings) {
    packIds.add(binding.packVersionId);
    if (binding.scenarioVersionId !== null) {
      const linked = requireLibrary(
        library,
        "scenario",
        binding.scenarioVersionId,
      );
      ensure(linked.body.status === "approved", "conflict");
      linked.body.packVersionIds.forEach((id) => packIds.add(id));
      ensure(
        canonicalLabJson(binding.entry) === canonicalLabJson(linked.body.entry),
        "conflict",
      );
      ensure(
        canonicalLabJson(binding.sourcePriority) ===
          canonicalLabJson(linked.body.sourcePriority),
        "conflict",
      );
    }
  }
  const packs = [...packIds]
    .sort()
    .map((id) => requireLibrary(library, "pack", id));
  ensure(
    packs.every(
      (pack) => pack.body.status === "approved" && pack.body.approval !== null,
    ),
    "conflict",
  );
  ensure(
    packs.every((pack) =>
      pack.body.contradictions.every(
        (conflict) => conflict.status === "resolved",
      ),
    ),
    "conflict",
  );
  const sourceIds = [
    ...new Set(packs.flatMap((pack) => pack.body.sourceVersionIds)),
  ].sort();
  ensure(
    sameSet(sourceIds, [
      ...new Set(bindings.flatMap((binding) => binding.sourceVersionIds)),
    ]),
    "scope",
  );
  const sources = sourceIds.map((id) => requireLibrary(library, "source", id));
  unique(sources, (source) => source.id);
  const scenarioPacks = packs.filter((pack) =>
    scenario.body.packVersionIds.includes(pack.versionId),
  );
  ensure(
    sameSet(
      [...new Set(scenarioPacks.flatMap((pack) => pack.body.sourceVersionIds))],
      scenario.body.sourceVersionIds,
    ),
    "scope",
  );
  for (const binding of bindings) {
    const pack = requireLibrary(library, "pack", binding.packVersionId);
    ensure(pack.id === binding.packId, "scope");
    const linked =
      binding.scenarioVersionId === null
        ? null
        : requireLibrary(library, "scenario", binding.scenarioVersionId);
    const boundPacks = linked
      ? linked.body.packVersionIds.map((id) =>
          requireLibrary(library, "pack", id),
        )
      : [pack];
    ensure(
      boundPacks.some((row) => row.versionId === pack.versionId),
      "scope",
    );
    ensure(
      sameSet(
        [...new Set(boundPacks.flatMap((row) => row.body.sourceVersionIds))],
        binding.sourceVersionIds,
      ),
      "scope",
    );
    const entityIds = unique(
      boundPacks.flatMap((row) => row.body.entities.map((entity) => entity.id)),
    );
    ensure(
      sameSet(
        entityIds,
        binding.mappings.map((mapping) => mapping.packEntityId),
      ),
      "scope",
    );
    if (linked) {
      for (const identity of linked.body.identities)
        ensure(
          boundPacks.some(
            (row) =>
              row.versionId === identity.packVersionId &&
              row.body.entities.some(
                (entity) => entity.id === identity.packEntityId,
              ),
          ),
          "scope",
        );
      for (const claimId of linked.body.carriedClaimIds)
        ensure(
          boundPacks.some((row) =>
            row.body.claims.some(
              (claim) =>
                claim.id === claimId &&
                claim.knowledge === "character" &&
                claim.validFrom !== null &&
                claim.validFrom <= linked.body.entry.worldMinutes &&
                (claim.validUntil === null ||
                  claim.validUntil > linked.body.entry.worldMinutes),
            ),
          ),
          "scope",
        );
    }
    binding.entry.evidence.forEach((evidence) =>
      evidenceMatches(evidence, sources),
    );
  }
  for (const record of [
    ...packs,
    ...library.filter((row) => row.kind === "scenario"),
  ]) {
    recordEvidence(record).forEach((evidence) =>
      evidenceMatches(evidence, sources),
    );
    if (record.kind === "pack")
      for (const claim of record.body.claims)
        ensure(
          claim.origin !== "source_fact" ||
            claim.evidence.every(
              (evidence) =>
                !sources.find(
                  (source) => source.versionId === evidence.sourceVersionId,
                )?.body.provenance,
            ),
          "conflict",
        );
  }
  const sourceHeads = sortedHeads(parseLabSourceHeads(authority.sourceHeads));
  ensure(
    canonicalLabJson(sourceHeads) ===
      canonicalLabJson(
        sortedHeads(
          sources.map((source) => ({
            sourceId: source.id,
            versionId: source.versionId,
          })),
        ),
      ),
    "conflict",
  );
  const documents = sortedDocuments(parseLabDocumentPins(authority.documents));
  ensure(documents.length === state.documentVersions.length, "scope");
  for (const pin of documents) {
    const document = state.documentVersions.find(
      (row) => row.id === pin.versionId && row.document_id === pin.documentId,
    );
    ensure(document && document.campaign_id === campaignId, "scope");
    ensure(
      typeof document.body === "string" && sha256(document.body) === pin.digest,
      "conflict",
    );
  }
  const guide = one(state, "public.rpg_documents");
  ensure(
    documents.some(
      (pin) =>
        pin.documentId === guide.id &&
        pin.versionId === guide.current_version_id,
    ),
    "scope",
  );
  const guideVersion = state.documentVersions.find(
    (row) => row.id === guide.current_version_id,
  )!;
  ensure(
    guideVersion.body === guide.body &&
      guideVersion.title === guide.title &&
      guideVersion.status === guide.status,
    "conflict",
  );
  const sessionGuidance = rows(state, "public.rpg_session_guidance");
  const sessions = rows(state, "public.rpg_sessions");
  ensure(
    sessionGuidance.every((row) =>
      sessions.some((session) => session.id === row.session_id),
    ),
    "scope",
  );
  const input = parseLabInputBundle({
    schemaVersion: 1,
    purpose: "simulation",
    nonCanon: true,
    ownerId,
    campaignId,
    base: {
      saveId: authority.saveId,
      timelineId: state.manifest.timelineId,
      manifestId: state.manifest.id,
      schemaVersion: state.manifest.schemaVersion,
    },
    scenarioVersionId: scenario.versionId,
    divergenceVersionId: divergence.versionId,
    packVersionIds: packs.map((pack) => pack.versionId).sort(),
    sourceVersionIds: sourceIds,
    documentVersions: documents,
    sourceHeads,
    canonGeneration: state.canonGeneration,
    ruleset,
    effectiveSettings: one(state, "public.rpg_settings").values,
    effectiveGuidance: {
      documentId: guide.id,
      versionId: guide.current_version_id,
      sessionGuidance,
    },
    resolutionPolicy: {
      id: "deterministic-world-v1",
      version: 1,
      maxSteps: LAB_LIMITS.maxSteps,
    },
    startWorldMinutes,
    throughWorldMinutes: startWorldMinutes + horizon,
  });
  return { input, inputDigest: labInputDigest(input) };
}
