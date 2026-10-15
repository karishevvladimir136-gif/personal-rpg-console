// Lead-owned Wave 1 contracts v1. Type-only; private envelopes never belong in client DTOs.
import type { JsonObject } from "../gameplay/contracts.ts";
import type { TimelineFence } from "../saves/contracts.ts";

export type CanonicalId = string; // Validated application UUID; never a provider identifier.
export type Visibility = "public" | "private";
export type KnowledgeScope =
  "source" | "canon_at_entry" | "character" | "future_source";
export type EvidenceLocator = {
  ownerId: string;
  sourceId: string;
  sourceVersionId: string;
  locator: { kind: "text" | "page" | "section" | "image"; value: string };
  digest: string;
  visibility: Visibility;
  knowledge: KnowledgeScope;
};
export type RulesetProfileRef = {
  id: string;
  version: number;
  mode: "full_ruleset" | "world_logic" | "custom_ruleset";
  validatorVersion: string;
};
export type RuntimeTask =
  "dm.plan" | "dm.narrate" | "dm.feedback" | "memory.summary" | "world.resolve" | "world.compose" | "canon.compile" | "media.frame.verify" |
  // The campaign's DM model for a whole turn (Claude Opus 5.5 or GPT-6 Astra).
  "dm.turn";
export type ModelSelection = {
  providerId: string;
  modelId: string;
  reasoning: string | null;
};
export type RuntimePolicy = {
  schemaVersion: 1;
  revision: number;
  primary: ModelSelection | null;
  taskOverrides: Partial<Record<RuntimeTask, ModelSelection>>;
};
export type ExecutionProfile = ModelSelection & {
  schemaVersion: 1;
  id: string;
  policyRevision: number;
  registryVersion: string;
  task: RuntimeTask;
};
export type PackEntityMapping = { packEntityId: string; entityId: string };
export type TemporalEntryAnchor = {
  label: string;
  worldMinutes: number;
  evidence: EvidenceLocator[];
};
export type CampaignPackBinding = {
  schemaVersion: 1;
  id: string;
  campaignId: string;
  ownerId: string;
  packId: string;
  packVersionId: string;
  scenarioVersionId: string | null;
  sourceVersionIds: string[];
  sourcePriority: string[];
  entry: TemporalEntryAnchor;
  mappings: PackEntityMapping[];
};
export type LibraryRecordKind =
  "source" | "pack" | "scenario" | "divergence" | "compiler_job";
export type LibraryRecord = {
  schemaVersion: 1;
  ownerId: string;
  kind: LibraryRecordKind;
  id: string;
  versionId: string;
  version: number;
  previousVersionId: string | null;
  body: JsonObject;
};
export type LibraryWrite = { operationId: string; record: LibraryRecord };
// Immutable origin, not a claim that an old event can execute on a newly active branch.
export type CommittedWorldEvent = {
  schemaVersion: 1;
  id: string;
  campaignId: string;
  originTimelineId: string;
  operationId: string;
  sequence: number;
  worldMinutes: number;
  kind: string;
  actorIds: string[];
  threadIds: string[];
  visibility: Visibility;
  text: string;
  evidence: EvidenceLocator[];
  payload: JsonObject;
};
export type WorldEventDraft = Omit<CommittedWorldEvent, "sequence">;
export type FoundationSnapshot = {
  schemaVersion: 1;
  ownerId: string;
  campaignId: string;
  timeline: TimelineFence;
  revision: number;
  runtimeRevision: number;
  headId: string | null;
  worldMinutes: number;
  // Worker A validates this domain, never arbitrary provider/model output.
  world: JsonObject | null;
  bindings: CampaignPackBinding[];
  ruleset: RulesetProfileRef;
  executionPolicy: RuntimePolicy | null;
};
export type FoundationCommand = {
  operationId: string;
  campaignId: string;
  timeline: TimelineFence;
  expectedRevision: number;
  expectedRuntimeRevision: number;
  expectedHeadId: string | null;
};
export type WorldSettlement = FoundationCommand & {
  schemaVersion: 1;
  status: "staged";
  fromWorldMinutes: number;
  throughWorldMinutes: number;
  sourceVersionIds: string[];
  events: WorldEventDraft[];
  nextWorld: JsonObject;
};
export type FoundationRpc = (args: {
  p_owner_id: string;
  p_campaign_id: string | null;
  p_action: string;
  p_payload: unknown;
  p_timeline?: TimelineFence | null;
}) => Promise<{
  data: unknown;
  error?: { message?: string; code?: string } | null;
}>;
