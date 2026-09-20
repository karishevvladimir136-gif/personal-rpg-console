import { createHash } from "node:crypto";
import type { EvidenceLocator } from "../production/contracts.ts";
import type {
  Approval,
  CompilerJobBody,
  Coverage,
  DivergenceBody,
  PackBody,
  PackClaim,
  ScenarioBody,
  SourceBody,
  TypedLibraryRecord,
} from "./types.ts";
import { COMPILER_STATES } from "./types.ts";
import {
  digest,
  ensure,
  ids,
  integer,
  list,
  literal,
  nullable,
  object,
  priority,
  sameSet,
  text,
  unique,
  uuid,
} from "./validation.ts";

export const sha256 = (value: string) =>
  createHash("sha256").update(value, "utf8").digest("hex");
const visibility = (value: unknown) =>
  literal(value, ["public", "private"] as const);
const knowledge = (value: unknown) =>
  literal(value, [
    "source",
    "canon_at_entry",
    "character",
    "future_source",
  ] as const);
const shortText = (value: unknown) => text(value, 240);
export function parseEvidence(value: unknown): EvidenceLocator {
  const v = object(value, [
    "ownerId",
    "sourceId",
    "sourceVersionId",
    "locator",
    "digest",
    "visibility",
    "knowledge",
  ]);
  const loc = object(v.locator, ["kind", "value"]);
  return {
    ownerId: uuid(v.ownerId),
    sourceId: uuid(v.sourceId),
    sourceVersionId: uuid(v.sourceVersionId),
    locator: {
      kind: literal(loc.kind, ["text", "page", "section", "image"] as const),
      value: text(loc.value, 1024),
    },
    digest: digest(v.digest),
    visibility: visibility(v.visibility),
    knowledge: knowledge(v.knowledge),
  };
}
export function parseSource(value: unknown): SourceBody {
  const v = object(value, [
    "schemaVersion",
    "title",
    "format",
    "digest",
    "original",
    "attribution",
    "visibility",
    "extraction",
  ]);
  ensure(v.original !== null && typeof v.original === "object");
  const kind = (v.original as Record<string, unknown>).kind;
  let original: SourceBody["original"];
  if (kind === "text") {
    const o = object(v.original, ["kind", "text"]);
    original = { kind, text: text(o.text, 250000) };
    ensure(sha256(original.text) === v.digest);
  } else {
    const o = object(v.original, ["kind", "bucket", "path", "byteLength"]);
    literal(o.kind, ["storage"]);
    const path = text(o.path, 512);
    ensure(
      !path.includes("..") &&
        !path.includes("\\") &&
        /^[a-zA-Z0-9/_\.\-]+$/.test(path),
    );
    original = {
      kind: "storage",
      bucket: literal(o.bucket, ["world-sources"]),
      path,
      byteLength: integer(o.byteLength, 1, 100000000),
    };
  }
  const a = object(v.attribution, ["author", "publisher", "canonicalUrl"]);
  const canonicalUrl = nullable(a.canonicalUrl, (url) => text(url, 2048));
  if (canonicalUrl !== null) {
    let url: URL;
    try {
      url = new URL(canonicalUrl);
    } catch {
      throw new Error("Invalid source URL");
    }
    ensure(
      ["http:", "https:"].includes(url.protocol) &&
        !url.username &&
        !url.password,
    );
  }
  const e = object(v.extraction, ["version", "status", "gaps"]);
  const result: SourceBody = {
    schemaVersion: literal(v.schemaVersion, [1]),
    title: shortText(v.title),
    format: literal(v.format, [
      "txt",
      "md",
      "pdf",
      "docx",
      "epub",
      "png",
      "jpg",
      "webp",
    ] as const),
    digest: digest(v.digest),
    original,
    attribution: {
      author: nullable(a.author, shortText),
      publisher: nullable(a.publisher, shortText),
      canonicalUrl,
    },
    visibility: visibility(v.visibility),
    extraction: {
      version: text(e.version, 80),
      status: literal(e.status, [
        "unprocessed",
        "partial",
        "complete",
        "unreadable",
      ] as const),
      gaps: list(e.gaps, shortText, 100),
    },
  };
  ensure(original.kind !== "text" || ["txt", "md"].includes(result.format));
  ensure(
    result.extraction.status !== "complete" ||
      result.extraction.gaps.length === 0,
  );
  return result;
}
export function parseApproval(value: unknown): Approval | null {
  if (value === null) return null;
  const v = object(value, [
    "ownerId",
    "reviewedConflictIds",
    "reviewedUnknownIds",
  ]);
  return {
    ownerId: uuid(v.ownerId),
    reviewedConflictIds: ids(v.reviewedConflictIds),
    reviewedUnknownIds: ids(v.reviewedUnknownIds),
  };
}
function parseClaim(value: unknown): PackClaim {
  const v = object(value, [
    "id",
    "subjectId",
    "predicate",
    "text",
    "origin",
    "epistemic",
    "authority",
    "visibility",
    "knowledge",
    "validFrom",
    "validUntil",
    "knownByEntityIds",
    "evidence",
    "uncertainty",
  ]);
  const result: PackClaim = {
    id: uuid(v.id),
    subjectId: uuid(v.subjectId),
    predicate: text(v.predicate, 100),
    text: text(v.text),
    origin: literal(v.origin, [
      "source_fact",
      "source_inference",
      "scenario_assumption",
    ] as const),
    epistemic: literal(v.epistemic, [
      "fact",
      "rumor",
      "lie",
      "hypothesis",
      "intention",
      "unknown",
    ] as const),
    authority: literal(v.authority, ["reference", "approved_canon"] as const),
    visibility: visibility(v.visibility),
    knowledge: knowledge(v.knowledge),
    validFrom: nullable(v.validFrom, integer),
    validUntil: nullable(v.validUntil, integer),
    knownByEntityIds: ids(v.knownByEntityIds),
    evidence: list(v.evidence, parseEvidence, 32),
    uncertainty: nullable(v.uncertainty, shortText),
  };
  ensure(
    result.validFrom === null ||
      result.validUntil === null ||
      result.validUntil > result.validFrom,
  );
  ensure(result.origin === "scenario_assumption" || result.evidence.length > 0);
  ensure(result.origin !== "source_inference" || result.uncertainty !== null);
  ensure(
    result.knowledge !== "character" || result.knownByEntityIds.length > 0,
  );
  ensure(
    result.knowledge === "character" || result.knownByEntityIds.length === 0,
  );
  ensure(
    result.evidence.every(
      (e) =>
        (result.visibility === "private" || e.visibility === "public") &&
        e.knowledge === result.knowledge,
    ),
  );
  return result;
}
function parseCoverage(value: unknown): Coverage {
  const v = object(value, [
    "sourceVersionId",
    "status",
    "processedUnits",
    "totalUnits",
    "gaps",
  ]);
  const result: Coverage = {
    sourceVersionId: uuid(v.sourceVersionId),
    status: literal(v.status, [
      "unprocessed",
      "partial",
      "complete",
      "unreadable",
    ] as const),
    processedUnits: integer(v.processedUnits, 0, 1000000),
    totalUnits: nullable(v.totalUnits, (n) => integer(n, 0, 1000000)),
    gaps: list(v.gaps, shortText, 100),
  };
  ensure(
    result.totalUnits === null || result.processedUnits <= result.totalUnits,
  );
  ensure(
    result.status !== "complete" ||
      (result.totalUnits !== null &&
        result.processedUnits === result.totalUnits &&
        result.gaps.length === 0),
  );
  return result;
}
export function parsePack(value: unknown): PackBody {
  const v = object(value, [
    "schemaVersion",
    "title",
    "status",
    "sourceVersionIds",
    "sourcePriority",
    "entities",
    "claims",
    "contradictions",
    "coverage",
    "unknowns",
    "compilerJobVersionId",
    "approval",
  ]);
  const sourceVersionIds = ids(v.sourceVersionIds);
  const entities = unique(
    list(
      v.entities,
      (entry) => {
        const e = object(entry, ["id", "name", "kind", "aliases"]);
        return {
          id: uuid(e.id),
          name: shortText(e.name),
          kind: literal(e.kind, [
            "person",
            "group",
            "faction",
            "location",
            "object",
            "institution",
          ] as const),
          aliases: unique(list(e.aliases, shortText, 20)),
        };
      },
      500,
    ),
    (e) => e.id,
  );
  const claims = unique(list(v.claims, parseClaim, 1000), (c) => c.id);
  const contradictions = unique(
    list(v.contradictions, (entry) => {
      const c = object(entry, ["id", "claimIds", "status", "resolution"]);
      const claimIds = ids(c.claimIds, 20);
      ensure(
        claimIds.length >= 2 &&
          claimIds.every((id) => claims.some((claim) => claim.id === id)),
      );
      const status = literal(c.status, ["unresolved", "resolved"] as const);
      const resolution = nullable(c.resolution, shortText);
      ensure((status === "resolved") === (resolution !== null));
      return { id: uuid(c.id), claimIds, status, resolution };
    }),
    (c) => c.id,
  );
  const coverage = unique(
    list(v.coverage, parseCoverage),
    (c) => c.sourceVersionId,
  );
  ensure(
    sameSet(
      sourceVersionIds,
      coverage.map((c) => c.sourceVersionId),
    ),
  );
  const unknowns = unique(
    list(v.unknowns, (entry) => {
      const u = object(entry, ["id", "question", "entityId"]);
      return {
        id: uuid(u.id),
        question: shortText(u.question),
        entityId: nullable(u.entityId, uuid),
      };
    }),
    (u) => u.id,
  );
  ensure(
    unknowns.every(
      (u) => u.entityId === null || entities.some((e) => e.id === u.entityId),
    ),
  );
  ensure(
    claims.every(
      (c) =>
        entities.some((e) => e.id === c.subjectId) &&
        c.knownByEntityIds.every((id) => entities.some((e) => e.id === id)) &&
        c.evidence.every((e) => sourceVersionIds.includes(e.sourceVersionId)),
    ),
  );
  const approval = parseApproval(v.approval);
  const status = literal(v.status, ["draft", "approved"] as const);
  ensure((status === "approved") === (approval !== null));
  ensure(
    approval !== null || claims.every((c) => c.authority !== "approved_canon"),
  );
  if (approval) {
    ensure(
      sameSet(
        approval.reviewedConflictIds,
        contradictions.map((c) => c.id),
      ),
    );
    ensure(
      sameSet(
        approval.reviewedUnknownIds,
        unknowns.map((u) => u.id),
      ),
    );
  }
  return {
    schemaVersion: literal(v.schemaVersion, [1]),
    title: shortText(v.title),
    status,
    sourceVersionIds,
    sourcePriority: priority(sourceVersionIds, v.sourcePriority),
    entities,
    claims,
    contradictions,
    coverage,
    unknowns,
    compilerJobVersionId: nullable(v.compilerJobVersionId, uuid),
    approval,
  };
}
export function parseEntry(value: unknown): ScenarioBody["entry"] {
  const v = object(value, ["label", "worldMinutes", "evidence"]);
  const result = {
    label: shortText(v.label),
    worldMinutes: integer(v.worldMinutes),
    evidence: list(v.evidence, parseEvidence, 32),
  };
  ensure(result.evidence.every((e) => e.knowledge !== "future_source"));
  return result;
}
const parseAssumption = (value: unknown) => {
  const v = object(value, ["id", "text", "visibility"]);
  return {
    id: uuid(v.id),
    text: text(v.text),
    visibility: visibility(v.visibility),
  };
};
export function parseScenario(value: unknown): ScenarioBody {
  const v = object(value, [
    "schemaVersion",
    "title",
    "status",
    "packVersionIds",
    "sourceVersionIds",
    "sourcePriority",
    "entry",
    "adaptation",
    "identities",
    "assumptions",
    "carriedClaimIds",
    "localHistory",
    "unresolvedConflictIds",
    "approval",
  ]);
  const sourceVersionIds = ids(v.sourceVersionIds),
    packVersionIds = ids(v.packVersionIds);
  const identities = unique(
    list(
      v.identities,
      (entry) => {
        const i = object(entry, [
          "packVersionId",
          "packEntityId",
          "scenarioEntityId",
        ]);
        return {
          packVersionId: uuid(i.packVersionId),
          packEntityId: uuid(i.packEntityId),
          scenarioEntityId: uuid(i.scenarioEntityId),
        };
      },
      500,
    ),
    (i) => `${i.packVersionId}:${i.packEntityId}`,
  );
  unique(identities, (i) => i.scenarioEntityId);
  ensure(identities.every((i) => packVersionIds.includes(i.packVersionId)));
  const adaptation = literal(v.adaptation, [
      "original",
      "literal_crossover",
      "native_adaptation",
    ] as const),
    localHistory = nullable(v.localHistory, (x) => text(x, 8000));
  const carriedClaimIds = ids(v.carriedClaimIds, 1000);
  ensure(
    adaptation !== "native_adaptation" ||
      (localHistory !== null && carriedClaimIds.length === 0),
  );
  ensure(adaptation === "literal_crossover" || carriedClaimIds.length === 0);
  const approval = parseApproval(v.approval),
    status = literal(v.status, ["draft", "approved"] as const),
    unresolvedConflictIds = ids(v.unresolvedConflictIds);
  ensure((status === "approved") === (approval !== null));
  if (approval)
    ensure(
      sameSet(approval.reviewedConflictIds, unresolvedConflictIds) &&
        approval.reviewedUnknownIds.length === 0,
    );
  const entry = parseEntry(v.entry);
  ensure(
    entry.evidence.every((e) => sourceVersionIds.includes(e.sourceVersionId)),
  );
  return {
    schemaVersion: literal(v.schemaVersion, [1]),
    title: shortText(v.title),
    status,
    packVersionIds,
    sourceVersionIds,
    sourcePriority: priority(sourceVersionIds, v.sourcePriority),
    entry,
    adaptation,
    identities,
    assumptions: unique(list(v.assumptions, parseAssumption), (a) => a.id),
    carriedClaimIds,
    localHistory,
    unresolvedConflictIds,
    approval,
  };
}
export function parseDivergence(value: unknown): DivergenceBody {
  const v = object(value, [
    "schemaVersion",
    "scenarioVersionId",
    "title",
    "changes",
    "approval",
  ]);
  const changes = unique(list(v.changes, parseAssumption), (c) => c.id);
  ensure(changes.length > 0);
  return {
    schemaVersion: literal(v.schemaVersion, [1]),
    scenarioVersionId: uuid(v.scenarioVersionId),
    title: shortText(v.title),
    changes,
    approval: parseApproval(v.approval),
  };
}
export function parseCompilerJob(value: unknown): CompilerJobBody {
  const v = object(value, [
    "schemaVersion",
    "targetPackId",
    "sourceVersionIds",
    "sourcePriority",
    "inputDigest",
    "status",
    "budget",
    "checkpoints",
    "errorCode",
  ]);
  const sourceVersionIds = ids(v.sourceVersionIds),
    b = object(v.budget, ["maxUnits", "maxPasses"]);
  const budget = {
    maxUnits: integer(b.maxUnits, 1, 100000),
    maxPasses: integer(b.maxPasses, 1, 20),
  };
  const checkpoints = list(
    v.checkpoints,
    (entry) => {
      const c = object(entry, ["pass", "cursor", "digest"]);
      return {
        pass: literal(c.pass, ["extracting", "indexing", "auditing"] as const),
        cursor: integer(c.cursor, 0, budget.maxUnits),
        digest: digest(c.digest),
      };
    },
    budget.maxPasses,
  );
  unique(checkpoints, (c) => `${c.pass}:${c.cursor}`);
  const status = literal(v.status, COMPILER_STATES),
    errorCode = nullable(v.errorCode, (e) =>
      literal(e, [
        "unreadable",
        "unsupported",
        "budget",
        "invalidated",
      ] as const),
    );
  ensure(
    (status === "failed" || status === "invalidated") === (errorCode !== null),
  );
  ensure((status === "invalidated") === (errorCode === "invalidated"));
  return {
    schemaVersion: literal(v.schemaVersion, [1]),
    targetPackId: uuid(v.targetPackId),
    sourceVersionIds,
    sourcePriority: priority(sourceVersionIds, v.sourcePriority),
    inputDigest: digest(v.inputDigest),
    status,
    budget,
    checkpoints,
    errorCode,
  };
}
export function parseLibraryRecord(
  value: unknown,
  ownerId?: string,
): TypedLibraryRecord {
  // Bound serialized records before traversing supplied structures; no unbounded provider data.
  let encoded: string;
  try {
    encoded = JSON.stringify(value);
  } catch {
    ensure(false);
  }
  ensure(typeof encoded === "string" && encoded.length <= 1000000);
  const v = object(value, [
    "schemaVersion",
    "ownerId",
    "kind",
    "id",
    "versionId",
    "version",
    "previousVersionId",
    "body",
  ]);
  const base = {
    schemaVersion: literal(v.schemaVersion, [1]),
    ownerId: uuid(v.ownerId),
    id: uuid(v.id),
    versionId: uuid(v.versionId),
    version: integer(v.version, 1),
    previousVersionId: nullable(v.previousVersionId, uuid),
  };
  ensure(ownerId === undefined || base.ownerId === ownerId, "scope");
  ensure((base.version === 1) === (base.previousVersionId === null));
  ensure(base.versionId !== base.previousVersionId);
  const kind = literal(v.kind, [
    "source",
    "pack",
    "scenario",
    "divergence",
    "compiler_job",
  ] as const);
  let result: TypedLibraryRecord;
  switch (kind) {
    case "source":
      result = { ...base, kind, body: parseSource(v.body) };
      if (result.body.original.kind === "storage")
        ensure(
          result.body.original.path.startsWith(
            `${base.ownerId}/${base.id}/${base.versionId}/`,
          ),
          "scope",
        );
      break;
    case "pack":
      result = { ...base, kind, body: parsePack(v.body) };
      break;
    case "scenario":
      result = { ...base, kind, body: parseScenario(v.body) };
      break;
    case "divergence":
      result = { ...base, kind, body: parseDivergence(v.body) };
      break;
    case "compiler_job":
      result = { ...base, kind, body: parseCompilerJob(v.body) };
      break;
  }
  if ("approval" in result.body && result.body.approval)
    ensure(result.body.approval.ownerId === result.ownerId, "scope");
  for (const e of recordEvidence(result))
    ensure(e.ownerId === result.ownerId, "scope");
  return result;
}
export function recordEvidence(record: TypedLibraryRecord): EvidenceLocator[] {
  if (record.kind === "pack")
    return record.body.claims.flatMap((c) => c.evidence);
  if (record.kind === "scenario") return record.body.entry.evidence;
  return [];
}
