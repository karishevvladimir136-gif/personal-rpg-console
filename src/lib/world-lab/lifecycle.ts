// Internal pure ledger rules. Storage applies these under one locked transaction.
import type { LabReason, LabRunCommand, LabStatus } from "./contracts.ts";
import type { LabRun } from "./server-contracts.ts";
import type { LabApplicabilityBasis } from "./inputs.ts";
import {
  canonicalLabJson, isLabInputApplicable, labInputDigest, LAB_MAX_WORLD_MINUTES, parseLabInputBundle,
} from "./inputs.ts";
import { digest, ensure, integer, literal, nullable, object, text, uuid } from "../foundation-loop/fields.ts";
import { sha256 } from "../world-library/parsers.ts";

const statuses: readonly LabStatus[] = ["prepared", "running", "paused", "completed", "cancelled", "failed"];
const reasons: Exclude<LabReason, null>[] = ["review_required", "source_changed", "unsupported", "work_limit", "cancelled", "unavailable"];
export type LabLifecycleAction = "claim" | "pause" | "cancel" | "resume";
export type LabLifecycleReceipt = {
  ownerId: string;
  campaignId: string;
  operationId: string;
  action: LabLifecycleAction;
  requestDigest: string;
  result: LabRun;
};
export type LabLifecycleResult = { run: LabRun; receipt: LabLifecycleReceipt; replayed: boolean };

export function parseLabRunCommand(value: unknown, campaignId?: string): LabRunCommand {
  const row = object(value, ["operationId", "campaignId", "runId", "expectedRevision"]);
  const result = {
    operationId: uuid(row.operationId), campaignId: uuid(row.campaignId), runId: uuid(row.runId),
    expectedRevision: integer(row.expectedRevision, 0, LAB_MAX_WORLD_MINUTES),
  };
  ensure(campaignId === undefined || result.campaignId === campaignId, "scope");
  return result;
}

export function parseLabRun(value: unknown, scope?: { ownerId: string; campaignId: string; runId?: string }): LabRun {
  const row = object(value, [
    "id", "ownerId", "campaignId", "timelineId", "label", "input", "inputDigest", "status", "reason", "revision",
    "leaseGeneration", "headRevision", "headManifestId", "lastCheckpointId", "currentWorldMinutes",
  ]);
  const input = parseLabInputBundle(row.input);
  const result: LabRun = {
    id: uuid(row.id), ownerId: uuid(row.ownerId), campaignId: uuid(row.campaignId), timelineId: uuid(row.timelineId),
    label: text(row.label, 160), input, inputDigest: digest(row.inputDigest),
    status: literal(row.status, statuses), reason: nullable(row.reason, (value) => literal(value, reasons)),
    revision: integer(row.revision, 0, LAB_MAX_WORLD_MINUTES), leaseGeneration: integer(row.leaseGeneration, 0, LAB_MAX_WORLD_MINUTES),
    headRevision: integer(row.headRevision, 0, input.resolutionPolicy.maxSteps),
    headManifestId: uuid(row.headManifestId), lastCheckpointId: uuid(row.lastCheckpointId),
    currentWorldMinutes: integer(row.currentWorldMinutes, input.startWorldMinutes, input.throughWorldMinutes),
  };
  ensure(result.ownerId === input.ownerId && result.campaignId === input.campaignId && result.timelineId !== input.base.timelineId, "scope");
  ensure(result.inputDigest === labInputDigest(input), "conflict");
  ensure(result.leaseGeneration <= result.revision && result.headRevision <= result.revision, "conflict");
  if (scope) ensure(result.ownerId === uuid(scope.ownerId) && result.campaignId === uuid(scope.campaignId) && (scope.runId === undefined || result.id === uuid(scope.runId)), "scope");
  if (["prepared", "running", "completed"].includes(result.status)) ensure(result.reason === null);
  if (result.status === "cancelled") ensure(result.reason === "cancelled");
  if (result.status === "paused" || result.status === "failed") ensure(result.reason !== null && result.reason !== "cancelled");
  if (result.status === "completed") ensure(result.currentWorldMinutes === input.throughWorldMinutes, "conflict");
  if (result.status === "prepared") ensure(result.headRevision === 0 && result.currentWorldMinutes === input.startWorldMinutes, "conflict");
  return Object.freeze(result);
}

function receiptRequest(action: LabLifecycleAction, command: LabRunCommand): string {
  return sha256(canonicalLabJson({ action, input: command }));
}

function replayReceipt(value: LabLifecycleReceipt, run: LabRun, action: LabLifecycleAction, command: LabRunCommand): LabLifecycleReceipt {
  const row = object(value, ["ownerId", "campaignId", "operationId", "action", "requestDigest", "result"]);
  ensure(row.ownerId === run.ownerId && row.campaignId === run.campaignId && row.operationId === command.operationId && row.action === action, "conflict");
  ensure(digest(row.requestDigest) === receiptRequest(action, command), "conflict");
  const result = parseLabRun(row.result, { ownerId: run.ownerId, campaignId: run.campaignId, runId: run.id });
  ensure(result.inputDigest === run.inputDigest && result.timelineId === run.timelineId && canonicalLabJson(result.input) === canonicalLabJson(run.input), "conflict");
  return { ownerId: run.ownerId, campaignId: run.campaignId, operationId: command.operationId, action, requestDigest: String(row.requestDigest), result };
}

/** Exact request retries use the immutable receipt before revision/source checks.
 * A receipt describes the prior operation, not a renewed execution permission. */
export function applyLabLifecycle(
  value: LabRun,
  action: LabLifecycleAction,
  rawCommand: LabRunCommand,
  basis: LabApplicabilityBasis,
  priorReceipt: LabLifecycleReceipt | null = null,
): LabLifecycleResult {
  const run = parseLabRun(value);
  literal(action, ["claim", "pause", "cancel", "resume"]);
  const command = parseLabRunCommand(rawCommand, run.campaignId);
  ensure(command.runId === run.id && basis.ownerId === run.ownerId && basis.campaignId === run.campaignId, "scope");
  if (priorReceipt) {
    const receipt = replayReceipt(priorReceipt, run, action, command);
    return { run: receipt.result, receipt, replayed: true };
  }
  ensure(command.expectedRevision === run.revision, "conflict");
  ensure(run.status !== "completed" && run.status !== "cancelled", "conflict");
  ensure(run.revision < LAB_MAX_WORLD_MINUTES && run.leaseGeneration < LAB_MAX_WORLD_MINUTES, "conflict");
  let status: LabStatus, reason: LabReason = null;
  if (action === "claim") {
    ensure(run.status === "prepared", "conflict");
    ensure(isLabInputApplicable(run.input, basis), "conflict");
    status = "running";
  } else if (action === "resume") {
    ensure(["paused", "failed", "running"].includes(run.status), "conflict");
    ensure(isLabInputApplicable(run.input, basis), "conflict");
    ensure(run.currentWorldMinutes < run.input.throughWorldMinutes && run.headRevision < run.input.resolutionPolicy.maxSteps, "conflict");
    status = "running";
  } else if (action === "pause") {
    ensure(run.status === "prepared" || run.status === "running", "conflict");
    status = "paused";
    reason = "review_required";
  } else {
    status = "cancelled";
    reason = "cancelled";
  }
  const next = parseLabRun({ ...run, status, reason, revision: run.revision + 1, leaseGeneration: run.leaseGeneration + 1 });
  const receipt: LabLifecycleReceipt = {
    ownerId: run.ownerId, campaignId: run.campaignId, operationId: command.operationId, action,
    requestDigest: receiptRequest(action, command), result: next,
  };
  return { run: next, receipt, replayed: false };
}

/** The only source-change effect is invalidation of future work. Historical
 * completed/cancelled runs and an already invalidated lease remain untouched. */
export function invalidateLabRun(value: LabRun, basis: LabApplicabilityBasis): LabRun {
  const run = parseLabRun(value);
  if (isLabInputApplicable(run.input, basis) || run.status === "completed" || run.status === "cancelled" || (run.status === "paused" && run.reason === "source_changed")) return run;
  return parseLabRun({ ...run, status: "paused", reason: "source_changed", revision: run.revision + 1, leaseGeneration: run.leaseGeneration + 1 });
}

/** Validate storage's bounded commit result without creating another event ledger. */
export function validateLabProgress(previous: LabRun, next: LabRun): LabRun {
  const before = parseLabRun(previous), after = parseLabRun(next);
  for (const key of ["id", "ownerId", "campaignId", "timelineId", "label", "inputDigest"] as const)
    ensure(after[key] === before[key], "conflict");
  ensure(canonicalLabJson(before.input) === canonicalLabJson(after.input), "conflict");
  ensure(before.status === "running" && ["running", "paused", "completed", "failed"].includes(after.status), "conflict");
  ensure(after.revision === before.revision + 1 && after.leaseGeneration === before.leaseGeneration, "conflict");
  ensure(after.currentWorldMinutes >= before.currentWorldMinutes, "conflict");
  const checkpointChanged = after.headManifestId !== before.headManifestId;
  ensure(after.headRevision === before.headRevision + (checkpointChanged ? 1 : 0), "conflict");
  if (checkpointChanged) ensure(after.lastCheckpointId !== before.lastCheckpointId, "conflict");
  else ensure(after.lastCheckpointId === before.lastCheckpointId && after.currentWorldMinutes === before.currentWorldMinutes, "conflict");
  if (after.headRevision === after.input.resolutionPolicy.maxSteps && after.currentWorldMinutes < after.input.throughWorldMinutes)
    ensure(after.status === "paused" && after.reason === "work_limit", "conflict");
  return after;
}
