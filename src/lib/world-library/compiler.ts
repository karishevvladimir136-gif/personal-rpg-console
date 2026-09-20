import type { CompilerJobBody, CompilerState, TypedRecord } from "./types.ts";
import { parseCompilerJob, parseLibraryRecord } from "./parsers.ts";
import { ensure, uuid } from "./validation.ts";

const transitions: Record<CompilerState, readonly CompilerState[]> = {
  queued: ["queued", "extracting", "failed", "invalidated"],
  extracting: ["extracting", "indexing", "failed", "invalidated"],
  indexing: ["indexing", "auditing", "failed", "invalidated"],
  auditing: ["auditing", "awaiting_review", "failed", "invalidated"],
  awaiting_review: ["awaiting_review", "completed", "failed", "invalidated"],
  completed: ["invalidated"],
  failed: [],
  invalidated: [],
};
export function validateCompilerTransition(
  previous: CompilerJobBody,
  proposed: CompilerJobBody,
): void {
  const old = parseCompilerJob(previous),
    next = parseCompilerJob(proposed);
  ensure(transitions[old.status].includes(next.status), "conflict");
  for (const key of [
    "targetPackId",
    "sourceVersionIds",
    "sourcePriority",
    "inputDigest",
    "budget",
  ] as const)
    ensure(JSON.stringify(old[key]) === JSON.stringify(next[key]), "conflict");
  ensure(!!old.assistance === !!next.assistance, "conflict");
  if (old.assistance && next.assistance) {
    ensure(
      JSON.stringify({ ...old.assistance, result: null }) ===
        JSON.stringify({ ...next.assistance, result: null }),
      "conflict",
    );
    if (old.assistance.result !== null)
      ensure(
        JSON.stringify(old.assistance.result) ===
          JSON.stringify(next.assistance.result),
        "conflict",
      );
    else if (next.assistance.result !== null)
      ensure(
        old.status === "indexing" &&
          next.status === "auditing" &&
          old.checkpoints.some((c) => c.pass === "indexing" && c.cursor === 0),
        "conflict",
      );
  }
  ensure(
    next.checkpoints.length >= old.checkpoints.length &&
      old.checkpoints.every(
        (c, i) => JSON.stringify(c) === JSON.stringify(next.checkpoints[i]),
      ),
    "conflict",
  );
  const added = next.checkpoints.slice(old.checkpoints.length);
  ensure(
    added.every((c) => c.pass === old.status || c.pass === next.status),
    "conflict",
  );
  const passes = ["extracting", "indexing", "auditing"];
  const cursors = new Map<string, number>();
  let lastPass = -1;
  for (const c of next.checkpoints) {
    ensure(
      passes.indexOf(c.pass) >= lastPass &&
        c.cursor > (cursors.get(c.pass) ?? -1),
      "conflict",
    );
    lastPass = passes.indexOf(c.pass);
    cursors.set(c.pass, c.cursor);
    ensure(
      [...cursors.values()].reduce((sum, cursor) => sum + cursor, 0) <=
        next.budget.maxUnits,
      "conflict",
    );
  }
  if (
    passes.includes(old.status) &&
    next.status !== old.status &&
    !["failed", "invalidated"].includes(next.status)
  )
    ensure(
      next.checkpoints.some((c) => c.pass === old.status),
      "conflict",
    );
  if (old.status === next.status) ensure(added.length > 0, "conflict");
}
export function advanceCompilerJob(
  record: TypedRecord<"compiler_job">,
  versionId: string,
  next: Pick<CompilerJobBody, "status" | "checkpoints" | "errorCode"> &
    Partial<Pick<CompilerJobBody, "assistance">>,
): TypedRecord<"compiler_job"> {
  const current = parseLibraryRecord(record);
  ensure(current.kind === "compiler_job");
  const body = parseCompilerJob({ ...current.body, ...next });
  validateCompilerTransition(current.body, body);
  return parseLibraryRecord({
    ...current,
    version: current.version + 1,
    previousVersionId: current.versionId,
    versionId: uuid(versionId),
    body,
  }) as TypedRecord<"compiler_job">;
}
// Source replacement invalidates derived jobs, never rewrites historical packs or bindings.
export function planSourceInvalidation(
  ownerId: string,
  sourceVersionId: string,
  jobs: TypedRecord<"compiler_job">[],
): string[] {
  uuid(ownerId);
  uuid(sourceVersionId);
  return jobs
    .map((job) => parseLibraryRecord(job, ownerId))
    .filter(
      (job) =>
        job.kind === "compiler_job" &&
        job.body.sourceVersionIds.includes(sourceVersionId) &&
        !["failed", "invalidated"].includes(job.body.status),
    )
    .map((job) => job.versionId);
}
