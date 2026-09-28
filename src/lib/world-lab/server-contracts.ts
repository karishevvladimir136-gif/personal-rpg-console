// Lead-owned INTERNAL contracts. No browser imports, credentials or active-store fallback.
import type { JsonObject } from "../gameplay/contracts.ts";
import type { ExecutionProfile, RulesetProfileRef } from "../production/contracts.ts";
import type { TypedLibraryRecord } from "../world-library/types.ts";
import type { DetachedRunFence } from "../saves/detached-contracts.ts";
import type { LabReason, LabStatus } from "./contracts.ts";

export type DetachedVersion = {
  id: string;
  campaignId: string;
  tableName: string;
  rowKey: string;
  digest: string;
  payload: JsonObject;
  originTimelineId: string;
};
export type DetachedManifest = {
  id: string;
  campaignId: string;
  timelineId: string;
  schemaVersion: 1 | 2 | 3;
  canonGeneration: number;
  refs: Record<string, string[]>;
  publicMetadata: JsonObject;
  runId: string | null;
};
export type LabContinuationBasis = {
  sourceRunId: string;
  sourceCheckpointId: string;
  sourceRunRevision: number;
  sourceInputDigest: string;
};
export type LabInputBundle = {
  schemaVersion: 1;
  purpose: "simulation";
  nonCanon: true;
  ownerId: string;
  campaignId: string;
  base: {
    saveId: string;
    timelineId: string;
    manifestId: string;
    schemaVersion: 1 | 2 | 3;
  };
  scenarioVersionId: string;
  divergenceVersionId: string;
  packVersionIds: string[];
  sourceVersionIds: string[];
  // Authorized immutable references plus current restriction/correction basis.
  documentVersions: { documentId: string; versionId: string; digest: string }[];
  sourceHeads: { sourceId: string; versionId: string }[];
  canonGeneration: number;
  ruleset: RulesetProfileRef;
  effectiveSettings: JsonObject;
  effectiveGuidance: JsonObject;
  resolutionPolicy: {
    id: "deterministic-world-v1" | "single-model-world-v1";
    version: 1;
    maxSteps: number;
  };
  startWorldMinutes: number;
  throughWorldMinutes: number;
  // Absent in accepted deterministic D1 history. Immutable part of the run digest.
  executionProfile?: ExecutionProfile;
  continuation?: LabContinuationBasis;
};
export type LabRun = {
  id: string;
  ownerId: string;
  campaignId: string;
  timelineId: string;
  label: string;
  input: LabInputBundle;
  inputDigest: string;
  status: LabStatus;
  reason: LabReason;
  revision: number;
  leaseGeneration: number;
  headRevision: number;
  headManifestId: string;
  lastCheckpointId: string;
  currentWorldMinutes: number;
};
export type DetachedRead = {
  ownerId: string;
  campaignId: string;
  manifest: DetachedManifest;
  versions: DetachedVersion[];
  canonGeneration: number;
  // These are authorized pinned immutable rows, never current active projection reads.
  libraryRecords: TypedLibraryRecord[];
  documentVersions: JsonObject[];
  restrictions: JsonObject[];
  run: LabRun | null;
};
export type DetachedState = DetachedRead & {
  records: Record<string, JsonObject[]>;
};
export type DetachedRecordWrite = {
  tableName: string;
  rowKey: string;
  expectedVersionId: string | null;
  payload: JsonObject;
};
export type DetachedCommit = {
  operationId: string;
  fence: DetachedRunFence;
  kind: "deterministic_world" | "resolved_world" | "noop";
  throughWorldMinutes: number;
  writes: DetachedRecordWrite[];
  // Exact typed World validation proof, not an arbitrary browser patch.
  proof: JsonObject;
};
export type LabRpc = (args: {
  p_owner_id: string;
  p_campaign_id: string;
  p_action: string;
  p_payload: unknown;
}) => Promise<{
  data: unknown;
  error?: { message?: string; code?: string } | null;
}>;
