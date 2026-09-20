import type { LibraryRecordKind } from "../production/contracts.ts";
import type {
  AssistedCompiler,
  AssistedCompilerInput,
} from "./assisted-contracts.ts";
import type {
  BodyMap,
  CompilerJobBody,
  TypedLibraryRecord,
  TypedRecord,
} from "./types.ts";
import type { OwnerLibraryResult } from "./owner-contracts.ts";
import type { LibraryStore } from "./store.ts";
import { canonical, compilerInputDigest } from "./store.ts";
import { advanceCompilerJob } from "./compiler.ts";
import {
  compileAssistedDraft,
  prepareAssistedCompilation,
} from "./assisted-compiler.ts";
import { libraryId, LOCAL_COMPILER_LIMITS } from "./local-compiler.ts";
import { sha256 } from "./parsers.ts";
import { ensure, ids, integer, object, text, uuid } from "./validation.ts";
import { validateExecutionProfile } from "../model-runtime/registry.ts";
import { DmError } from "../gameplay/dm-errors.ts";
import { randomUUID } from "node:crypto";
import { parseCompilerJob } from "./parsers.ts";

type RecordFactory = <K extends LibraryRecordKind>(
  kind: K,
  id: string,
  operationId: string,
  body: BodyMap[K],
  predecessor?: TypedRecord<K> | null,
) => TypedRecord<K>;
const newest = <T extends TypedLibraryRecord>(rows: T[]) =>
  [...rows].sort((a, b) => b.version - a.version)[0];
const resultOf = (row: TypedLibraryRecord): OwnerLibraryResult => ({
  kind: row.kind as OwnerLibraryResult["kind"],
  id: row.id,
  versionId: row.versionId,
});

export function createAssistedAuthoring(
  ownerId: string,
  store: LibraryStore,
  record: RecordFactory,
  put: (op: string, row: TypedLibraryRecord) => Promise<OwnerLibraryResult>,
  provider?: AssistedCompiler,
) {
  const version = (op: string) => libraryId(`${ownerId}:${op}:version`);
  async function fresh(sources: TypedRecord<"source">[]) {
    const current = await Promise.all(
      sources.map((s) => store.read({ kind: "source", id: s.id })),
    );
    return current.every(
      (rows, i) => newest(rows)?.versionId === sources[i].versionId,
    );
  }
  async function inputFor(
    current: TypedRecord<"compiler_job">,
    operationId: string,
  ): Promise<AssistedCompilerInput> {
    ensure(current.body.assistance);
    return {
      operationId,
      job: current.body,
      sources: await Promise.all(
        current.body.sourceVersionIds.map((id) => store.get("source", id)),
      ),
      basePack: current.body.assistance.refinement
        ? await store.get(
            "pack",
            current.body.assistance.refinement.packVersionId,
          )
        : null,
    };
  }
  async function inputsFresh(input: AssistedCompilerInput) {
    return (
      (await fresh(input.sources)) &&
      (!input.basePack ||
        newest(await store.read({ kind: "pack", id: input.basePack.id }))
          ?.versionId === input.basePack.versionId)
    );
  }
  async function begin(
    op: string,
    priority: string[],
    maxUnits: number,
    refinement: NonNullable<CompilerJobBody["assistance"]>["refinement"],
    prior?: TypedRecord<"compiler_job">,
  ) {
    const replay = (
      await store.read({ kind: "compiler_job", versionId: version(op) })
    )[0] as TypedRecord<"compiler_job"> | undefined;
    const executionProfile = validateExecutionProfile(
      replay?.body.assistance?.executionProfile ??
        prior?.body.assistance?.executionProfile ??
        provider?.resolveProfile(),
      "canon.compile",
    );
    const sources = await Promise.all(
      priority.map((id) => store.get("source", id)),
    );
    const basePack = refinement
      ? await store.get("pack", refinement.packVersionId)
      : null;
    const body: CompilerJobBody = {
      schemaVersion: 1,
      targetPackId:
        basePack?.id ??
        prior?.body.targetPackId ??
        libraryId(`${ownerId}:${op}:pack`),
      sourceVersionIds: priority,
      sourcePriority: [...priority],
      inputDigest: compilerInputDigest(sources, priority),
      status: "queued",
      budget: {
        maxUnits: integer(maxUnits, 3, LOCAL_COMPILER_LIMITS.units),
        maxPasses: 4,
      },
      checkpoints: [],
      errorCode: null,
      assistance: {
        schemaVersion: 1,
        executionProfile,
        refinement,
        result: prior?.body.assistance?.result ?? null,
      },
    };
    prepareAssistedCompilation({
      operationId: op,
      job: body,
      sources,
      basePack,
    });
    if (!replay) {
      ensure(await fresh(sources), "conflict");
      if (basePack)
        ensure(
          newest(await store.read({ kind: "pack", id: basePack.id }))
            ?.versionId === basePack.versionId,
          "conflict",
        );
    }
    return put(
      op,
      record("compiler_job", libraryId(`${ownerId}:${op}:job`), op, body),
    );
  }
  async function start(v: Record<string, unknown>) {
    const priority = ids(v.sourcePriority, 8);
    ensure(priority.length > 0);
    return begin(
      uuid(v.operationId),
      priority,
      integer(v.maxUnits, 3, 480),
      null,
    );
  }
  async function refine(value: unknown) {
    const v = object(value, [
      "action",
      "operationId",
      "expectedVersionId",
      "text",
      "maxUnits",
    ]);
    const previous = await store.get("pack", uuid(v.expectedVersionId));
    return begin(
      uuid(v.operationId),
      previous.body.sourcePriority,
      integer(v.maxUnits, 3, 480),
      { packVersionId: previous.versionId, text: text(v.text, 4000) },
    );
  }
  async function retry(value: unknown) {
    const v = object(value, ["action", "operationId", "expectedVersionId"]),
      op = uuid(v.operationId);
    const previous = await store.get("compiler_job", uuid(v.expectedVersionId));
    ensure(
      previous.body.assistance &&
        (previous.body.status === "failed" ||
          (previous.body.status === "indexing" &&
            previous.body.checkpoints.some(
              (c) => c.pass === "indexing" && c.cursor === 0,
            ))),
      "conflict",
    );
    const input = await inputFor(previous, op);
    ensure(await inputsFresh(input), "conflict");
    if (previous.body.status === "indexing") {
      const failOp = libraryId(`${op}:abandon-pending`);
      const failed = advanceCompilerJob(previous, version(failOp), {
        status: "failed",
        errorCode: "provider",
        checkpoints: previous.body.checkpoints,
      });
      await put(failOp, failed); // Fences any late response from the abandoned request.
    }
    return begin(
      op,
      previous.body.sourcePriority,
      previous.body.budget.maxUnits,
      previous.body.assistance.refinement,
      previous,
    );
  }
  async function materialize(
    current: TypedRecord<"compiler_job">,
    input: AssistedCompilerInput,
  ) {
    ensure(
      current.body.assistance?.result &&
        current.body.status === "awaiting_review",
    );
    const op = libraryId(`${ownerId}:${current.versionId}:draft-operation`);
    const existing = (
      await store.read({ kind: "pack", versionId: version(op) })
    )[0];
    if (existing) return resultOf(existing);
    ensure(await fresh(input.sources), "conflict");
    if (input.basePack)
      ensure(
        newest(await store.read({ kind: "pack", id: input.basePack.id }))
          ?.versionId === input.basePack.versionId,
        "conflict",
      );
    const compiled = compileAssistedDraft(
      { ...input, job: current.body },
      current.body.assistance.result.proposal,
    );
    return put(
      op,
      record(
        "pack",
        current.body.targetPackId,
        op,
        { ...compiled.pack, compilerJobVersionId: current.versionId },
        input.basePack,
      ),
    );
  }
  async function step(
    v: Record<string, unknown>,
    current: TypedRecord<"compiler_job">,
  ): Promise<OwnerLibraryResult> {
    const op = uuid(v.operationId),
      input = await inputFor(current, op);
    const repeated = (
      await store.read({ kind: "compiler_job", versionId: version(op) })
    )[0] as TypedRecord<"compiler_job"> | undefined;
    if (repeated) {
      ensure(
        repeated.id === current.id &&
          repeated.previousVersionId === current.versionId,
        "conflict",
      );
      const completed = (
        await store.read({
          kind: "compiler_job",
          versionId: version(libraryId(`${op}:response`)),
        })
      )[0] as TypedRecord<"compiler_job"> | undefined;
      const saved = completed ?? repeated;
      if (saved.body.status === "awaiting_review")
        await materialize(saved, { ...input, job: saved.body });
      return resultOf(saved); // Never repeat a request after its durable claim, including lost responses.
    }
    const latest = newest(
      await store.read({ kind: "compiler_job", id: current.id }),
    ) as TypedRecord<"compiler_job">;
    if (latest.body.status === "invalidated") return resultOf(latest);
    ensure(latest.versionId === current.versionId, "conflict");
    if (!(await inputsFresh(input)))
      return put(
        op,
        advanceCompilerJob(current, version(op), {
          status: "invalidated",
          errorCode: "invalidated",
          checkpoints: current.body.checkpoints,
        }),
      );
    if (current.body.status === "awaiting_review")
      return materialize(current, input);
    const prepared = prepareAssistedCompilation(input);
    const extractionCheckpoint = {
      pass: "extracting" as const,
      cursor: prepared.evidence.length,
      digest: sha256(canonical(prepared.data)),
    };
    const advance = async (
      status: CompilerJobBody["status"],
      checkpoints: CompilerJobBody["checkpoints"],
    ) => {
      const next = advanceCompilerJob(current, version(op), {
        status,
        checkpoints,
        errorCode: null,
      });
      const result = await put(op, next);
      if (status === "awaiting_review")
        await materialize(next, { ...input, job: next.body });
      return result;
    };
    if (current.body.status === "queued") {
      ensure(current.body.checkpoints.length === 0, "conflict");
      return advance("extracting", []);
    }
    if (current.body.status === "extracting") {
      ensure(current.body.checkpoints.length === 0, "conflict");
      return advance("indexing", [extractionCheckpoint]);
    }
    ensure(
      canonical(current.body.checkpoints[0]) ===
        canonical(extractionCheckpoint),
      "conflict",
    );
    if (current.body.status === "auditing") {
      ensure(current.body.assistance?.result, "conflict");
      const compiled = compileAssistedDraft(
        input,
        current.body.assistance.result.proposal,
      );
      ensure(
        current.body.checkpoints.length === 3 &&
          canonical(current.body.checkpoints[2]) ===
            canonical(compiled.checkpoints[1]),
        "conflict",
      );
      return advance("awaiting_review", [
        ...current.body.checkpoints,
        compiled.checkpoints[2],
      ]);
    }
    ensure(current.body.status === "indexing", "conflict");
    if (current.body.checkpoints.length === 2) {
      ensure(
        current.body.checkpoints[1].pass === "indexing" &&
          current.body.checkpoints[1].cursor === 0,
        "conflict",
      );
      return resultOf(current); // Pending/ambiguous request needs the explicit retry command.
    }
    ensure(
      current.body.checkpoints.length === 1 && !current.body.assistance?.result,
      "conflict",
    );
    const claim = advanceCompilerJob(current, version(op), {
      status: "indexing",
      errorCode: null,
      checkpoints: [
        ...current.body.checkpoints,
        {
          pass: "indexing",
          cursor: 0,
          digest: sha256(
            canonical({
              operationId: op,
              // An idempotent insert can be returned to two racing callers.
              // Distinct attempt digests make only the winning claim executable.
              attemptId: randomUUID(),
              inputDigest: current.body.inputDigest,
              assistance: current.body.assistance,
            }),
          ),
        },
      ],
    });
    await put(op, claim); // CAS wins before any provider request.
    const responseOp = libraryId(`${op}:response`);
    let result: NonNullable<CompilerJobBody["assistance"]>["result"] = null;
    let errorCode: CompilerJobBody["errorCode"] = null;
    try {
      ensure(provider, "configuration");
      const response = await provider.compile(
        structuredClone({ ...input, job: claim.body }),
      );
      result = {
        proposal: compileAssistedDraft(input, response.output).proposal,
        usage: response.usage,
      };
      const compiled = compileAssistedDraft(input, result.proposal);
      // Validate usage/model as well as content inside the durable failure path.
      parseCompilerJob({
        ...claim.body,
        status: "auditing",
        checkpoints: [...claim.body.checkpoints, compiled.checkpoints[1]],
        assistance: { ...claim.body.assistance!, result },
      });
    } catch (cause) {
      result = null;
      errorCode =
        cause instanceof DmError
          ? cause.code === "configuration"
            ? "configuration"
            : cause.code === "validation"
              ? "validation"
              : cause.code === "context"
                ? "budget"
                : "provider"
          : cause !== null &&
              typeof cause === "object" &&
              "code" in cause &&
              cause.code === "configuration"
            ? "configuration"
            : "validation";
    }
    const after = newest(
      await store.read({ kind: "compiler_job", id: current.id }),
    ) as TypedRecord<"compiler_job">;
    if (after.versionId !== claim.versionId) return resultOf(after); // A correction/retry fenced this response.
    if (!(await inputsFresh(input)))
      return put(
        responseOp,
        advanceCompilerJob(claim, version(responseOp), {
          status: "invalidated",
          errorCode: "invalidated",
          checkpoints: claim.body.checkpoints,
        }),
      );
    if (!result)
      return put(
        responseOp,
        advanceCompilerJob(claim, version(responseOp), {
          status: "failed",
          errorCode: errorCode ?? "validation",
          checkpoints: claim.body.checkpoints,
        }),
      );
    const compiled = compileAssistedDraft(input, result.proposal);
    return put(
      responseOp,
      advanceCompilerJob(claim, version(responseOp), {
        status: "auditing",
        errorCode: null,
        checkpoints: [...claim.body.checkpoints, compiled.checkpoints[1]],
        assistance: { ...claim.body.assistance!, result },
      }),
    );
  }
  return { start, refine, retry, step };
}
