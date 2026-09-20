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
import type { AssistedCompiler } from "./assisted-contracts.ts";
import { createAssistedAuthoring } from "./assisted-authoring.ts";
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
  ...(r.body.provenance
    ? {
        provenance: {
          kind: r.body.provenance.kind,
          method: r.body.provenance.method,
          language: r.body.provenance.language,
        },
      }
    : {}),
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
  ...(r.body.assistance
    ? {
        mode: "assisted" as const,
        executionProfile: r.body.assistance.executionProfile,
        refinement: r.body.assistance.refinement,
        requestPending:
          r.body.status === "indexing" &&
          r.body.checkpoints.some((c) => c.pass === "indexing"),
      }
    : {}),
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
  provider?: AssistedCompiler,
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
      "source.describe",
      "compiler.start",
      "compiler.step",
      "compiler.retry",
      "pack.refine",
      "pack.save",
      "pack.approve",
    ] as const);
    const assisted = createAssistedAuthoring(
      ownerId,
      store,
      record,
      put,
      provider,
    );
    if (action === "pack.refine") return assisted.refine(input);
    if (action === "compiler.retry") return assisted.retry(input);
    if (action === "source.save" || action === "source.describe") {
      const describe = action === "source.describe";
      const v = object(input, [
        "action",
        "operationId",
        "sourceId",
        "expectedVersionId",
        "title",
        ...(describe ? ["language"] : ["format"]),
        "text",
        ...(describe ? [] : ["author"]),
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
      ensure(!previous || !!previous.body.provenance === describe, "conflict");
      const original = text(v.text, 250_000);
      const row = record(
        "source",
        sourceId ?? libraryId(`${ownerId}:${op}:source`),
        op,
        {
          schemaVersion: 1,
          title: text(v.title, 240),
          format: describe ? "txt" : literal(v.format, ["txt", "md"] as const),
          digest: sha256(original),
          original: { kind: "text", text: original },
          attribution: {
            author: describe ? null : nullable(v.author, (a) => text(a, 240)),
            publisher: previous?.body.attribution.publisher ?? null,
            canonicalUrl: previous?.body.attribution.canonicalUrl ?? null,
          },
          visibility: literal(v.visibility, ["public", "private"] as const),
          knowledge: literal(v.knowledge, ["source", "future_source"] as const),
          ...(describe
            ? {
                provenance: {
                  kind: "owner_authored" as const,
                  method: "describe" as const,
                  language: literal(v.language, ["en", "ru"] as const),
                  authoredBy: ownerId,
                },
              }
            : {}),
          extraction: {
            version: LOCAL_COMPILER_VERSION,
            status: "complete",
            gaps: [],
          },
        },
        previous,
      );
      const result = await put(op, row);
      if (previous) {
        // Corrections create immutable invalidation versions. Approved Pack
        // history and campaign pins remain intact; pending work must restart.
        const jobs = latest(await store.read({ kind: "compiler_job" }));
        for (const job of jobs) {
          if (
            job.kind !== "compiler_job" ||
            !job.body.sourceVersionIds.includes(previous.versionId) ||
            ["failed", "invalidated"].includes(job.body.status)
          )
            continue;
          const invalidateOp = libraryId(
            `${ownerId}:${op}:${job.id}:invalidate`,
          );
          await put(
            invalidateOp,
            advanceCompilerJob(
              job,
              libraryId(`${ownerId}:${invalidateOp}:version`),
              {
                status: "invalidated",
                checkpoints: job.body.checkpoints,
                errorCode: "invalidated",
              },
            ),
          );
        }
      }
      return result;
    }
    if (action === "compiler.start") {
      const hasMode = Object.hasOwn(input, "mode");
      const v = object(input, [
        "action",
        "operationId",
        "sourcePriority",
        "maxUnits",
        ...(hasMode ? ["mode"] : []),
      ]);
      if (
        hasMode &&
        literal(v.mode, ["deterministic", "assisted"] as const) === "assisted"
      )
        return assisted.start(v);
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
      if (current.body.assistance) return assisted.step(v, current);
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
      const newest = latest(
        await store.read({ kind: "compiler_job", id: current.id }),
      )[0];
      if (
        newest?.kind === "compiler_job" &&
        newest.body.status === "invalidated"
      )
        return {
          kind: "compiler_job",
          id: newest.id,
          versionId: newest.versionId,
        };
      if (current.body.status === "awaiting_review" && !changed) {
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
      const hasRejected = Object.hasOwn(input, "rejectedClaimIds");
      const hasEntities = Object.hasOwn(input, "entities");
      const hasUnknownNotes = Object.hasOwn(input, "unknownNotes");
      const v = object(input, [
        "action",
        "operationId",
        "expectedVersionId",
        "title",
        "claims",
        "resolutions",
        ...(hasRejected ? ["rejectedClaimIds"] : []),
        ...(hasEntities ? ["entities"] : []),
        ...(hasUnknownNotes ? ["unknownNotes"] : []),
      ]);
      const op = uuid(v.operationId),
        previous = await store.get("pack", uuid(v.expectedVersionId));
      const entityEdits = hasEntities
        ? list(
            v.entities,
            (entry) => object(entry, ["id", "name", "kind", "aliases"]),
            500,
          )
        : previous.body.entities;
      ensure(
        sameSet(
          ids(
            entityEdits.map((e) => e.id),
            500,
          ),
          previous.body.entities.map((e) => e.id),
        ),
      );
      const unknownNotes = hasUnknownNotes
        ? list(v.unknownNotes, (entry) => {
            const note = object(entry, ["id", "note"]);
            return {
              id: uuid(note.id),
              note: nullable(note.note, (value) => text(value, 2000)),
            };
          })
        : previous.body.unknowns.map((u) => ({
            id: u.id,
            note: u.ownerNote ?? null,
          }));
      ensure(
        sameSet(
          ids(unknownNotes.map((u) => u.id)),
          previous.body.unknowns.map((u) => u.id),
        ),
      );
      const rejected = hasRejected ? ids(v.rejectedClaimIds, 1000) : [];
      ensure(
        rejected.every((id) => previous.body.claims.some((c) => c.id === id)),
      );
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
          previous.body.claims
            .filter((c) => !rejected.includes(c.id))
            .map((c) => c.id),
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
      const claims = previous.body.claims
        .filter((c) => !rejected.includes(c.id))
        .map((claim) => {
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
        entities: previous.body.entities.map((entity) => {
          const edit = entityEdits.find((e) => e.id === entity.id)!;
          return {
            ...entity,
            name: edit.name,
            kind: edit.kind,
            aliases: edit.aliases,
          };
        }),
        unknowns: previous.body.unknowns.map((unknown) => {
          const next = { ...unknown };
          const note = unknownNotes.find((u) => u.id === unknown.id)!.note;
          if (note === null) delete next.ownerNote;
          else next.ownerNote = note;
          return next;
        }),
        contradictions: previous.body.contradictions
          .map((c) => ({
            ...c,
            claimIds: c.claimIds.filter((id) => !rejected.includes(id)),
          }))
          .filter((c) => c.claimIds.length >= 2)
          .map((c) => {
            const resolution = resolutions.find(
              (r) => r.id === c.id,
            )!.resolution;
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
    const proposed = record("pack", previous.id, op, body, previous);
    const replay = await store.read({
      kind: "pack",
      versionId: proposed.versionId,
    });
    if (!replay.length) {
      for (const sourceId of body.sourceVersionIds) {
        const source = await store.get("source", sourceId);
        ensure(
          latest(await store.read({ kind: "source", id: source.id }))[0]
            ?.versionId === source.versionId,
          "conflict",
        );
      }
      if (body.compilerJobVersionId) {
        const job = await store.get("compiler_job", body.compilerJobVersionId);
        const current = latest(
          await store.read({ kind: "compiler_job", id: job.id }),
        )[0];
        ensure(
          current?.kind === "compiler_job" &&
            ["awaiting_review", "completed"].includes(current.body.status),
          "conflict",
        );
      }
    }
    return put(op, proposed);
  }
  return { read, source, pack, execute };
}
