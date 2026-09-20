import type {
  FoundationRpc,
  LibraryRecordKind,
  LibraryWrite,
} from "../production/contracts.ts";
import type { TypedLibraryRecord, TypedRecord } from "./types.ts";
import { parseLibraryRecord, recordEvidence, sha256 } from "./parsers.ts";
import {
  ensure,
  FoundationValidationError,
  literal,
  object,
  sameSet,
  uuid,
} from "./validation.ts";
import { validateCompilerTransition } from "./compiler.ts";
import {
  compileAssistedDraft,
  prepareAssistedCompilation,
} from "./assisted-compiler.ts";

export type LibraryFilter = {
  kind?: LibraryRecordKind;
  id?: string;
  versionId?: string;
};
export type LibraryStore = ReturnType<typeof createRpcLibraryStore>;
export function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`,
    )
    .join(",")}}`;
}
export function compilerInputDigest(
  sources: TypedRecord<"source">[],
  sourcePriority: string[],
): string {
  ensure(
    sameSet(
      sources.map((s) => s.versionId),
      sourcePriority,
    ),
  );
  return sha256(
    canonical(
      sourcePriority.map((id) => {
        const source = sources.find((s) => s.versionId === id)!;
        return {
          sourceId: source.id,
          versionId: source.versionId,
          digest: source.body.digest,
        };
      }),
    ),
  );
}
export function createRpcLibraryStore(ownerId: string, execute: FoundationRpc) {
  uuid(ownerId);
  async function rpc(action: string, payload: unknown) {
    let response: Awaited<ReturnType<FoundationRpc>>;
    try {
      response = await execute({
        p_owner_id: ownerId,
        p_campaign_id: null,
        p_action: action,
        p_payload: payload,
      });
    } catch {
      throw new FoundationValidationError("unavailable");
    }
    if (response.error) {
      const message = response.error.message ?? "";
      throw new FoundationValidationError(
        message.includes("conflict")
          ? "conflict"
          : message.includes("forbidden")
            ? "scope"
            : message.includes("validation")
              ? "validation"
              : "unavailable",
      );
    }
    return response.data;
  }
  async function read(
    filter: LibraryFilter = {},
  ): Promise<TypedLibraryRecord[]> {
    ensure(
      filter !== null &&
        typeof filter === "object" &&
        Object.keys(filter).every((key) =>
          ["kind", "id", "versionId"].includes(key),
        ),
    );
    const query: LibraryFilter = {};
    if (filter.kind !== undefined)
      query.kind = literal(filter.kind, [
        "source",
        "pack",
        "scenario",
        "divergence",
        "compiler_job",
      ] as const);
    if (filter.id !== undefined) query.id = uuid(filter.id);
    if (filter.versionId !== undefined)
      query.versionId = uuid(filter.versionId);
    const result = object(await rpc("read", query), ["records"]);
    ensure(Array.isArray(result.records) && result.records.length <= 500);
    const records = result.records.map((entry) =>
      parseLibraryRecord(entry, ownerId),
    );
    ensure(new Set(records.map((r) => r.versionId)).size === records.length);
    ensure(
      records.every(
        (r) =>
          (!query.kind || r.kind === query.kind) &&
          (!query.id || r.id === query.id) &&
          (!query.versionId || r.versionId === query.versionId),
      ),
      "scope",
    );
    return records;
  }
  async function get<K extends LibraryRecordKind>(
    kind: K,
    versionId: string,
  ): Promise<TypedRecord<K>> {
    const records = await read({ kind, versionId });
    ensure(records.length === 1, "scope");
    return records[0] as TypedRecord<K>;
  }
  async function requireFresh(record: TypedLibraryRecord) {
    const history = await read({ kind: record.kind, id: record.id });
    ensure(
      history.every((r) => r.version <= record.version),
      "conflict",
    );
  }
  async function validateReferences(record: TypedLibraryRecord): Promise<void> {
    const sourceIds =
      "sourceVersionIds" in record.body ? record.body.sourceVersionIds : [];
    const sources = await Promise.all(sourceIds.map((id) => get("source", id)));
    ensure(new Set(sources.map((s) => s.id)).size === sources.length);
    if (record.kind === "pack")
      for (const claim of record.body.claims) {
        ensure(
          claim.origin !== "source_fact" ||
            claim.evidence.every(
              (e) =>
                !sources.find((s) => s.versionId === e.sourceVersionId)?.body
                  .provenance,
            ),
          "conflict",
        );
      }
    for (const e of recordEvidence(record)) {
      const source = sources.find((s) => s.versionId === e.sourceVersionId);
      ensure(
        source?.id === e.sourceId && source.ownerId === e.ownerId,
        "scope",
      );
      ensure(
        e.visibility === "private" || source.body.visibility === "public",
        "scope",
      );
      ensure(
        source.body.knowledge !== "future_source" ||
          e.knowledge === "future_source",
        "scope",
      );
      // Wave 1 text locators were opaque. The local compiler declares exact UTF-16 spans.
      if (
        source.body.extraction.version === "text-evidence-v1" &&
        source.body.original.kind === "text" &&
        e.locator.kind === "text"
      ) {
        const span = /^(0|[1-9]\d*):(0|[1-9]\d*)$/.exec(e.locator.value);
        ensure(span, "scope");
        const start = Number(span[1]),
          end = Number(span[2]);
        ensure(
          Number.isSafeInteger(start) &&
            Number.isSafeInteger(end) &&
            end > start &&
            end <= source.body.original.text.length,
          "scope",
        );
        ensure(
          sha256(source.body.original.text.slice(start, end)) === e.digest,
          "conflict",
        );
      }
    }
    if (record.kind === "compiler_job") {
      ensure(
        record.body.inputDigest ===
          compilerInputDigest(sources, record.body.sourcePriority),
        "conflict",
      );
      if (record.body.assistance) {
        const a = record.body.assistance;
        const basePack = a.refinement
          ? await get("pack", a.refinement.packVersionId)
          : null;
        if (basePack)
          ensure(
            basePack.id === record.body.targetPackId &&
              canonical(basePack.body.sourcePriority) ===
                canonical(record.body.sourcePriority),
            "scope",
          );
        const input = {
          operationId: a.executionProfile.id,
          job: record.body,
          sources,
          basePack,
        };
        const prepared = prepareAssistedCompilation(input);
        const checkpoints = record.body.checkpoints;
        if (checkpoints.length)
          ensure(
            canonical(checkpoints[0]) ===
              canonical({
                pass: "extracting",
                cursor: prepared.evidence.length,
                digest: sha256(canonical(prepared.data)),
              }),
            "conflict",
          );
        if (a.result) {
          const compiled = compileAssistedDraft(input, a.result.proposal);
          ensure(
            canonical(checkpoints[2]) === canonical(compiled.checkpoints[1]),
            "conflict",
          );
          if (checkpoints.length === 4)
            ensure(
              canonical(checkpoints[3]) === canonical(compiled.checkpoints[2]),
              "conflict",
            );
        }
        if (!["failed", "invalidated"].includes(record.body.status)) {
          await Promise.all(sources.map(requireFresh));
          if (basePack) await requireFresh(basePack);
        }
      }
    }
    if (record.kind === "pack" && record.body.compilerJobVersionId !== null) {
      const job = await get("compiler_job", record.body.compilerJobVersionId);
      ensure(
        job.body.targetPackId === record.id &&
          sameSet(job.body.sourceVersionIds, record.body.sourceVersionIds) &&
          canonical(job.body.sourcePriority) ===
            canonical(record.body.sourcePriority),
        "scope",
      );
      ensure(
        ["awaiting_review", "completed"].includes(job.body.status),
        "conflict",
      );
      if (job.body.assistance) {
        const previous = record.previousVersionId
          ? await get("pack", record.previousVersionId)
          : null;
        if (previous?.body.compilerJobVersionId !== job.versionId) {
          const refinement = job.body.assistance.refinement;
          ensure(
            record.previousVersionId === (refinement?.packVersionId ?? null),
            "conflict",
          );
          const compiled = compileAssistedDraft(
            {
              operationId: job.body.assistance.executionProfile.id,
              job: job.body,
              sources,
              basePack: previous,
            },
            job.body.assistance.result?.proposal,
          );
          ensure(
            canonical(record.body) ===
              canonical({
                ...compiled.pack,
                compilerJobVersionId: job.versionId,
              }),
            "conflict",
          );
          await requireFresh(job);
          await Promise.all(sources.map(requireFresh));
        }
      }
    }
    if (record.kind === "pack" && record.body.status === "approved")
      await Promise.all(sources.map(requireFresh));
    if (record.kind === "scenario") {
      const packs = await Promise.all(
        record.body.packVersionIds.map((id) => get("pack", id)),
      );
      ensure(
        packs.every((p) => p.body.status === "approved"),
        "conflict",
      );
      ensure(
        sameSet(
          [...new Set(packs.flatMap((p) => p.body.sourceVersionIds))],
          sourceIds,
        ),
        "scope",
      );
      for (const i of record.body.identities)
        ensure(
          packs.some(
            (p) =>
              p.versionId === i.packVersionId &&
              p.body.entities.some((e) => e.id === i.packEntityId),
          ),
          "scope",
        );
      for (const id of record.body.carriedClaimIds)
        ensure(
          packs.some((p) =>
            p.body.claims.some(
              (c) =>
                c.id === id &&
                c.knowledge === "character" &&
                c.validFrom !== null &&
                c.validFrom <= record.body.entry.worldMinutes &&
                (c.validUntil === null ||
                  c.validUntil > record.body.entry.worldMinutes),
            ),
          ),
          "scope",
        );
    }
    if (record.kind === "divergence") {
      const scenario = await get("scenario", record.body.scenarioVersionId);
      ensure(scenario.body.status === "approved", "conflict");
    }
  }
  async function put(input: LibraryWrite): Promise<TypedLibraryRecord> {
    const write = object(input, ["operationId", "record"]);
    const operationId = uuid(write.operationId);
    const record = parseLibraryRecord(write.record, ownerId);
    const history = await read({ kind: record.kind, id: record.id });
    const repeated = history.find((r) => r.versionId === record.versionId);
    if (repeated) ensure(canonical(repeated) === canonical(record), "conflict");
    else {
      const latest = history.reduce<TypedLibraryRecord | null>(
        (last, r) => (!last || r.version > last.version ? r : last),
        null,
      );
      ensure(
        latest
          ? record.previousVersionId === latest.versionId &&
              record.version === latest.version + 1
          : record.version === 1,
        "conflict",
      );
      if (record.kind === "compiler_job") {
        if (latest) {
          ensure(latest.kind === "compiler_job");
          validateCompilerTransition(latest.body, record.body);
        } else
          ensure(
            record.body.status === "queued" &&
              record.body.checkpoints.length === 0 &&
              (!record.body.assistance ||
                record.body.assistance.result === null),
          );
      }
      if (record.kind === "source" && latest) {
        ensure(latest.kind === "source", "scope");
        ensure(
          !!latest.body.provenance === !!record.body.provenance,
          "conflict",
        );
        if (latest.body.provenance && record.body.provenance)
          ensure(
            latest.body.provenance.kind === record.body.provenance.kind &&
              latest.body.provenance.method === record.body.provenance.method &&
              latest.body.provenance.authoredBy ===
                record.body.provenance.authoredBy,
            "conflict",
          );
      }
      await validateReferences(record);
    }
    const received = parseLibraryRecord(
      await rpc("put", { operationId, record }),
      ownerId,
    );
    ensure(canonical(received) === canonical(record), "conflict");
    return received;
  }
  return { read, get, put, validateReferences };
}
