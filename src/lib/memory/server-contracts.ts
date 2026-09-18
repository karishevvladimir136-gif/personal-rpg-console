// Lead-owned INTERNAL type-only contract. Browser modules must not import this file.
import type { JsonObject } from "../gameplay/contracts.ts";
import type {
  ProviderUsage,
  RuntimeSource,
} from "../gameplay/server-contracts.ts";
import type {
  ContinueSessionInput,
  EndSessionInput,
  MemorySnapshot,
  PublicResumePoint,
  RetryMemoryInput,
} from "./contracts.ts";

export type MemoryVisibility = "public" | "private";
export type StatementKind =
  | "fact"
  | "claim"
  | "rumor"
  | "lie"
  | "hypothesis"
  | "intention"
  | "question"
  | "record";
export type MemorySourceKind =
  | "scene"
  | "document"
  | "entity"
  | "item"
  | "quest"
  | "location"
  | "state"
  | "event"
  | "private_event"
  | "summary";
export type MemorySourceRef = {
  campaignId: string;
  kind: MemorySourceKind;
  id: string;
  version: string;
  part: number;
  visibility: MemoryVisibility;
};
export type MemorySource = {
  id: string;
  campaignId: string;
  ref: MemorySourceRef;
  sequence: number;
  sessionId: string | null;
  text: string;
  entityIds: string[];
  knownBy: string[];
  authority:
    "correction" | "state" | "canon" | "reference" | "history" | "derived";
  statementKind: StatementKind;
  attribution: string | null;
  validFrom: number | null;
  validTo: number | null;
  significance: number;
  unresolved: boolean;
  current: boolean;
  status: "valid" | "superseded" | "archived" | "invalid";
  factKey: string | null;
  factValue: string | null;
  sourceRefs: MemorySourceRef[];
};
export type EntityAlias = {
  campaignId: string;
  entityId: string;
  alias: string;
  currentName: string;
};
export type RetrievalRequest = {
  expanded?: boolean;
  campaignId: string;
  visibility: MemoryVisibility;
  actorIds: string[];
  query: string;
  entityIds: string[];
  requiredSourceIds: string[];
  worldMinutes: number;
  maxBytes: number;
  maxExcerpts: number;
  historicalComparison: boolean;
};
export type MemoryCandidateBatch = {
  campaignId: string;
  generation: number;
  sources: MemorySource[];
  aliases: EntityAlias[];
};
export type RetrievalResult = {
  sources: MemorySource[];
  paused: boolean;
  reason: "missing" | "conflict" | "budget" | null;
  expanded: boolean;
  bytes: number;
};
export type ExactMemoryCheckpoint = {
  id: string;
  campaignId: string;
  boundaryId: string | null;
  sessionId: string | null;
  stateRevision: number;
  settingsRevision: number;
  guideVersionId: string;
  sessionGuidanceIds: string[];
  publicWatermark: number;
  privateWatermark: number;
  sourceRefs: MemorySourceRef[];
  unresolvedSourceIds: string[];
  valid: boolean;
  resume: PublicResumePoint;
  // Audit snapshot only; never write this back into gameplay state.
  exactState: JsonObject;
};
// Extractive structured summaries select complete authorized source chunks.
// Rendering takes text/qualifiers from the source, not model-authored assertions.
export type SummarySelection = { sourceId: string; version: string };
export type SummaryOutput = {
  schemaVersion: 1;
  selections: SummarySelection[];
};
export type MemorySummary = {
  id: string;
  campaignId: string;
  visibility: MemoryVisibility;
  boundaryId: string | null;
  generation: number;
  fromSequence: number;
  throughSequence: number;
  sourceRefs: MemorySourceRef[];
  entries: MemorySource[];
  valid: boolean;
  createdAt: string;
};
export type MemoryJob = {
  id: string;
  campaignId: string;
  boundaryId: string | null;
  visibility: MemoryVisibility;
  generation: number;
  token: string;
  attempts: number;
  stateRevision: number;
  settingsRevision: number;
  guideVersionId: string;
  fromSequence: number;
  throughSequence: number;
  sources: MemorySource[];
  requiredSourceIds: string[];
};
export type MemoryReadContext = {
  campaignId: string;
  generation: number;
  stateRevision: number;
  checkpoint: ExactMemoryCheckpoint | null;
  publicSummary: MemorySummary | null;
  privateSummary: MemorySummary | null;
  publicWatermark: number;
  privateWatermark: number;
  publicHighWatermark: number;
  privateHighWatermark: number;
  // Exact uncaptured history, bounded by the store. overflow always pauses/rebuilds.
  uncovered: MemorySource[];
  overflow: boolean;
  aliases: EntityAlias[];
};
export type ContextMemory = {
  campaignId: string;
  generation: number;
  stateRevision: number;
  checkpoint: ExactMemoryCheckpoint | null;
  exactEvents: MemorySource[];
  historical: MemorySource[];
  privateHistorical: MemorySource[];
  publicSummary: MemorySummary | null;
  privateSummary: MemorySummary | null;
  complete: boolean;
};
export interface MemoryStore {
  source(
    campaignId: string,
    mode: "game" | "companion" | "mechanic",
  ): Promise<RuntimeSource>;
  read(campaignId: string): Promise<MemorySnapshot>;
  end(input: EndSessionInput): Promise<MemorySnapshot>;
  continueSession(input: ContinueSessionInput): Promise<MemorySnapshot>;
  retry(input: RetryMemoryInput): Promise<MemorySnapshot>;
  enqueue(campaignId: string, reason: "pressure" | "rebuild"): Promise<void>;
  claim(campaignId: string): Promise<MemoryJob | null>;
  publish(job: MemoryJob, summary: SummaryOutput): Promise<void>;
  fail(
    job: MemoryJob,
    category: "provider" | "validation" | "context" | "unavailable",
  ): Promise<void>;
  context(
    campaignId: string,
    actorIds: string[],
    includePrivate: boolean,
  ): Promise<MemoryReadContext>;
  search(request: RetrievalRequest): Promise<MemoryCandidateBatch>;
}
export interface SummaryProvider {
  summarize(
    job: MemoryJob,
  ): Promise<{ output: SummaryOutput; usage: ProviderUsage }>;
}
