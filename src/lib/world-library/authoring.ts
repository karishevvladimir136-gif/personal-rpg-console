import type {
  LibraryRecord,
  LibraryRecordKind,
} from "../production/contracts.ts";
import type { BodyMap, TypedLibraryRecord, TypedRecord } from "./types.ts";
import type {
  OwnerJobSummary,
  OwnerLibraryIndex,
  OwnerLibraryResult,
  OwnerPackDetail,
  OwnerPackSummary,
  OwnerSourceDetail,
  OwnerSourceSummary,
} from "./owner-contracts.ts";
import type { LibraryStore } from "./store.ts";
import { canonical, compilerInputDigest } from "./store.ts";
import { parseLibraryRecord, parsePack, sha256 } from "./parsers.ts";
import { advanceCompilerJob } from "./compiler.ts";
import {
  compileTextDraft,
  libraryId,
  LOCAL_COMPILER_LIMITS,
  LOCAL_COMPILER_VERSION,
  verifyTextEvidence,
} from "./local-compiler.ts";
import {
  ensure,
  ids,
  integer,
  list,
  literal,
  nullable,
  object,
  sameSet,
  text,
  uuid,
} from "./validation.ts";

const sourceSummary = (r: TypedRecord<"source">): OwnerSourceSummary => ({
  id: r.id,
  versionId: r.versionId,
  version: r.version,
  title: r.body.title,
  format: r.body.format,
  visibility: r.body.visibility,
  knowledge: r.body.knowledge ?? "source",
  digest: r.body.digest,
});
const packSummary = (r: TypedRecord<"pack">): OwnerPackSummary => ({
  id: r.id,
  versionId: r.versionId,
  version: r.version,
  title: r.body.title,
  status: r.body.status,
  sourceVersionIds: [...r.body.sourceVersionIds],
});
const jobSummary = (r: TypedRecord<"compiler_job">): OwnerJobSummary => ({
  id: r.id,
  versionId: r.versionId,
  version: r.version,
  packId: r.body.targetPackId,
  status: r.body.status,
  maxUnits: r.body.budget.maxUnits,
  checkpoints: r.body.checkpoints.map((c) => ({ ...c })),
  errorCode: r.body.errorCode,
});
function latest<T extends TypedLibraryRecord>(records: T[]): T[] {
  const values = new Map<string, T>();
  for (const r of records)
    if ((values.get(r.id)?.version ?? 0) < r.version) values.set(r.id, r);
  return [...values.values()];
}

export function createOwnerLibraryAuthoring(
  ownerId: string,
  store: LibraryStore,
) {
  uuid(ownerId);
  function record<K extends LibraryRecordKind>(
    kind: K,
    id: string,
    operationId: string,
    body: BodyMap[K],
    predecessor: TypedRecord<K> | null = null,
  ): TypedRecord<K> {
    return parseLibraryRecord(
      {
        schemaVersion: 1,
        kind,
        ownerId,
        id,
        versionId: libraryId(`${ownerId}:${operationId}:version`),
        version: predecessor ? predecessor.version + 1 : 1,
        previousVersionId: predecessor?.versionId ?? null,
        body,
      },
      ownerId,
    ) as TypedRecord<K>;
  }
  async function put(
    operationId: string,
    row: TypedLibraryRecord,
  ): Promise<OwnerLibraryResult> {
    const result = await store.put({
      operationId,
      record: row as LibraryRecord,
    });
    return {
      kind: result.kind as OwnerLibraryResult["kind"],
      id: result.id,
      versionId: result.versionId,
    };
  }
  async function read(): Promise<OwnerLibraryIndex> {
    const records = await Promise.all([
      store.read({ kind: "source" }),
      store.read({ kind: "pack" }),
      store.read({ kind: "compiler_job" }),
    ]);
    return {
      sources: latest(records[0] as TypedRecord<"source">[]).map(sourceSummary),
      packs: latest(records[1] as TypedRecord<"pack">[]).map(packSummary),
      jobs: latest(records[2] as TypedRecord<"compiler_job">[]).map(jobSummary),
    };
  }
  async function source(versionId: string): Promise<OwnerSourceDetail> {
    const row = await store.get("source", uuid(versionId));
    const history = (await store.read({
      kind: "source",
      id: row.id,
    })) as TypedRecord<"source">[];
    return {
      ...sourceSummary(row),
      text: row.body.original.kind === "text" ? row.body.original.text : null,
      author: row.body.attribution.author,
      history: history.sort((a, b) => b.version - a.version).map(sourceSummary),
    };
  }
  async function pack(versionId: string): Promise<OwnerPackDetail> {
    const row = await store.get("pack", uuid(versionId));
    const history = (await store.read({
      kind: "pack",
      id: row.id,
    })) as TypedRecord<"pack">[];
    const sources = await Promise.all(
      row.body.sourceVersionIds.map((id) => store.get("source", id)),
    );
    const evidence: OwnerPackDetail["evidence"] = [];
    for (const claim of row.body.claims)
      for (const locator of claim.evidence) {
        const original = sources.find(
          (s) => s.versionId === locator.sourceVersionId,
        )!;
        ensure(original, "scope");
        const excerpt =
          locator.locator.kind === "text" &&
          original.body.original.kind === "text"
            ? verifyTextEvidence(locator, original)
            : "This format has no text preview in this authoring slice.";
        evidence.push({
          claimId: claim.id,
          sourceTitle: original.body.title,
          sourceVersionId: original.versionId,
          locator: locator.locator.value,
          digest: locator.digest,
          excerpt,
        });
      }
    // PackBody is deliberately owner-only, never a campaign/public projection.
    return {
      ...packSummary(row),
      body: structuredClone(row.body),
      history: history.sort((a, b) => b.version - a.version).map(packSummary),
      evidence,
    };
  }
  async function execute(input: unknown): Promise<OwnerLibraryResult> {
    ensure(input !== null && typeof input === "object");
    const action = literal((input as Record<string, unknown>).action, [
      "source.save",
      "compiler.start",
      "compiler.step",
      "pack.save",
      "pack.approve",
    ] as const);
    if (action === "source.save") {
      const v = object(input, [
        "action",
        "operationId",
        "sourceId",
        "expectedVersionId",
        "title",
        "format",
        "text",
        "author",
        "visibility",
        "knowledge",
      ]);
      const op = uuid(v.operationId),
        previousId = nullable(v.expectedVersionId, uuid),
        sourceId = nullable(v.sourceId, uuid);
      ensure((sourceId === null) === (previousId === null));
      const previous = previousId
        ? await store.get("source", previousId)
        : null;
      ensure(!previous || previous.id === sourceId, "scope");
      const original = text(v.text, 250_000);
      const row = record(
        "source",
        sourceId ?? libraryId(`${ownerId}:${op}:source`),
        op,
        {
          schemaVersion: 1,
          title: text(v.title, 240),
          format: literal(v.format, ["txt", "md"] as const),
          digest: sha256(original),
          original: { kind: "text", text: original },
          attribution: {
            author: nullable(v.author, (a) => text(a, 240)),
            publisher: previous?.body.attribution.publisher ?? null,
            canonicalUrl: previous?.body.attribution.canonicalUrl ?? null,
          },
          visibility: literal(v.visibility, ["public", "private"] as const),
          knowledge: literal(v.knowledge, ["source", "future_source"] as const),
          extraction: {
            version: LOCAL_COMPILER_VERSION,
            status: "complete",
            gaps: [],
          },
        },
        previous,
      );
      return put(op, row);
    }
    if (action === "compiler.start") {
      const v = object(input, [
        "action",
        "operationId",
        "sourcePriority",
        "maxUnits",
      ]);
      const op = uuid(v.operationId),
        sourcePriority = ids(v.sourcePriority, LOCAL_COMPILER_LIMITS.sources);
      ensure(sourcePriority.length > 0);
      const sources = await Promise.all(
        sourcePriority.map((id) => store.get("source", id)),
      );
      const body: BodyMap["compiler_job"] = {
        schemaVersion: 1,
        targetPackId: libraryId(`${ownerId}:${op}:pack`),
        sourceVersionIds: [...sourcePriority],
        sourcePriority,
        inputDigest: compilerInputDigest(sources, sourcePriority),
        status: "queued",
        budget: {
          maxUnits: integer(v.maxUnits, 3, LOCAL_COMPILER_LIMITS.units),
          maxPasses: 3,
        },
        checkpoints: [],
        errorCode: null,
      };
      compileTextDraft(body, sources); // Validate the entire bounded input before creating a durable job.
      return put(
        op,
        record("compiler_job", libraryId(`${ownerId}:${op}:job`), op, body),
      );
    }
    if (action === "compiler.step") {
      const v = object(input, ["action", "operationId", "expectedVersionId"]);
      const op = uuid(v.operationId),
        current = await store.get("compiler_job", uuid(v.expectedVersionId));
      const sources = await Promise.all(
        current.body.sourceVersionIds.map((id) => store.get("source", id)),
      );
      async function materializeDraft(next: TypedRecord<"compiler_job">) {
        if (next.body.status !== "awaiting_review") return null;
        const compiled = compileTextDraft(next.body, sources);
        const draftOp = libraryId(
          `${ownerId}:${next.versionId}:draft-operation`,
        );
        return put(
          draftOp,
          record("pack", next.body.targetPackId, draftOp, {
            ...compiled.pack,
            compilerJobVersionId: next.versionId,
          }),
        );
      }
      const repeated = await store.read({
        kind: "compiler_job",
        versionId: libraryId(`${ownerId}:${op}:version`),
      });
      if (repeated.length) {
        const row = repeated[0] as TypedRecord<"compiler_job">;
        ensure(
          row.id === current.id && row.previousVersionId === current.versionId,
          "conflict",
        );
        const result = await put(op, row);
        await materializeDraft(row);
        return result;
      }
      const histories = await Promise.all(
        sources.map((s) => store.read({ kind: "source", id: s.id })),
      );
      const changed = histories.some(
        (rows, i) => latest(rows)[0]?.versionId !== sources[i].versionId,
      );
      if (current.body.status === "awaiting_review") {
        const draftOp = libraryId(
          `${ownerId}:${current.versionId}:draft-operation`,
        );
        const existing = await store.read({
          kind: "pack",
          versionId: libraryId(`${ownerId}:${draftOp}:version`),
        });
        if (existing.length)
          return {
            kind: "pack",
            id: existing[0].id,
            versionId: existing[0].versionId,
          };
        if (!changed) return (await materializeDraft(current))!;
      }
      if (changed) {
        const next = advanceCompilerJob(
          current,
          libraryId(`${ownerId}:${op}:version`),
          {
            status: "invalidated",
            checkpoints: current.body.checkpoints,
            errorCode: "invalidated",
          },
        );
        return put(op, next);
      }
      const compiled = compileTextDraft(current.body, sources);
      const states = [
        "queued",
        "extracting",
        "indexing",
        "auditing",
        "awaiting_review",
      ] as const;
      const index = states.indexOf(
        current.body.status as (typeof states)[number],
      );
      ensure(index >= 0 && index < states.length - 1, "conflict");
      // Validate saved checkpoints before continuing; no fabricated checkpoint may authorize approval.
      ensure(
        canonical(current.body.checkpoints) ===
          canonical(compiled.checkpoints.slice(0, Math.max(0, index - 1))),
        "conflict",
      );
      const next = advanceCompilerJob(
        current,
        libraryId(`${ownerId}:${op}:version`),
        {
          status: states[index + 1],
          checkpoints: compiled.checkpoints.slice(0, index),
          errorCode: null,
        },
      );
      const result = await put(op, next);
      await materializeDraft(next);
      return result;
    }
    if (action === "pack.save") {
      const v = object(input, [
        "action",
        "operationId",
        "expectedVersionId",
        "title",
        "claims",
        "resolutions",
      ]);
      const op = uuid(v.operationId),
        previous = await store.get("pack", uuid(v.expectedVersionId));
      const edits = list(
        v.claims,
        (entry) =>
          object(entry, [
            "id",
            "text",
            "origin",
            "epistemic",
            "visibility",
            "knowledge",
            "validFrom",
            "validUntil",
            "knownByEntityIds",
            "uncertainty",
          ]),
        1000,
      );
      ensure(
        sameSet(
          ids(
            edits.map((e) => e.id),
            1000,
          ),
          previous.body.claims.map((c) => c.id),
        ),
      );
      const resolutions = list(v.resolutions, (entry) => {
        const c = object(entry, ["id", "resolution"]);
        return {
          id: uuid(c.id),
          resolution: nullable(c.resolution, (r) => text(r, 240)),
        };
      });
      ensure(
        sameSet(
          ids(resolutions.map((r) => r.id)),
          previous.body.contradictions.map((c) => c.id),
        ),
      );
      const claims = previous.body.claims.map((claim) => {
        const edit = edits.find((e) => e.id === claim.id)!;
        return {
          ...claim,
          ...edit,
          authority: "reference",
          evidence: claim.evidence.map((e) => ({
            ...e,
            knowledge: edit.knowledge,
          })),
        };
      });
      const body = parsePack({
        ...previous.body,
        title: text(v.title, 240),
        status: "draft",
        approval: null,
        claims,
        contradictions: previous.body.contradictions.map((c) => {
          const resolution = resolutions.find((r) => r.id === c.id)!.resolution;
          return {
            ...c,
            status: resolution === null ? "unresolved" : "resolved",
            resolution,
          };
        }),
      });
      const sources = await Promise.all(
        body.sourceVersionIds.map((id) => store.get("source", id)),
      );
      for (const claim of body.claims) {
        const excerpts = claim.evidence.map((e) =>
          verifyTextEvidence(
            e,
            sources.find((s) => s.versionId === e.sourceVersionId)!,
          ),
        );
        ensure(
          claim.origin !== "source_fact" || excerpts.includes(claim.text),
          "conflict",
        );
        if (["canon_at_entry", "character"].includes(claim.knowledge))
          ensure(claim.validFrom !== null);
      }
      return put(op, record("pack", previous.id, op, body, previous));
    }
    const v = object(input, [
      "action",
      "operationId",
      "expectedVersionId",
      "reviewedConflictIds",
      "reviewedUnknownIds",
      "acknowledgeCoverage",
      "canonClaimIds",
    ]);
    const op = uuid(v.operationId),
      previous = await store.get("pack", uuid(v.expectedVersionId));
    ensure(
      previous.body.status === "draft" && v.acknowledgeCoverage === true,
      "conflict",
    );
    const canonIds = ids(v.canonClaimIds, 1000);
    ensure(
      canonIds.every((id) => previous.body.claims.some((c) => c.id === id)),
    );
    for (const claim of previous.body.claims.filter((c) =>
      canonIds.includes(c.id),
    )) {
      ensure(
        ["canon_at_entry", "character"].includes(claim.knowledge) &&
          claim.validFrom !== null &&
          claim.epistemic === "fact",
        "conflict",
      );
      ensure(
        !previous.body.contradictions.some(
          (c) => c.status === "unresolved" && c.claimIds.includes(claim.id),
        ),
        "conflict",
      );
    }
    const body = parsePack({
      ...previous.body,
      status: "approved",
      approval: {
        ownerId,
        reviewedConflictIds: ids(v.reviewedConflictIds),
        reviewedUnknownIds: ids(v.reviewedUnknownIds),
      },
      claims: previous.body.claims.map((c) => ({
        ...c,
        authority: canonIds.includes(c.id) ? "approved_canon" : "reference",
      })),
    });
    return put(op, record("pack", previous.id, op, body, previous));
  }
  return { read, source, pack, execute };
}
