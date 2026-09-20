import type {
  EvidenceLocator,
  LibraryRecord,
} from "../production/contracts.ts";

export type SourceBody = {
  schemaVersion: 1;
  title: string;
  format: "txt" | "md" | "pdf" | "docx" | "epub" | "png" | "jpg" | "webp";
  digest: string;
  original:
    | { kind: "text"; text: string }
    | {
        kind: "storage";
        bucket: "world-sources";
        path: string;
        byteLength: number;
      };
  attribution: {
    author: string | null;
    publisher: string | null;
    canonicalUrl: string | null;
  };
  visibility: "public" | "private";
  extraction: {
    version: string;
    status: "unprocessed" | "partial" | "complete" | "unreadable";
    gaps: string[];
  };
};
export const FACT_ORIGINS = [
  "source_fact",
  "source_inference",
  "scenario_assumption",
  "simulation_fact",
] as const;
// Simulation facts belong to committed campaign Events, never reusable source packs.
export type PackClaim = {
  id: string;
  subjectId: string;
  predicate: string;
  text: string;
  origin: Exclude<(typeof FACT_ORIGINS)[number], "simulation_fact">;
  epistemic: "fact" | "rumor" | "lie" | "hypothesis" | "intention" | "unknown";
  authority: "reference" | "approved_canon";
  visibility: "public" | "private";
  knowledge: EvidenceLocator["knowledge"];
  validFrom: number | null;
  validUntil: number | null;
  knownByEntityIds: string[];
  evidence: EvidenceLocator[];
  uncertainty: string | null;
};
export type PackEntity = {
  id: string;
  name: string;
  kind: "person" | "group" | "faction" | "location" | "object" | "institution";
  aliases: string[];
};
export type Contradiction = {
  id: string;
  claimIds: string[];
  status: "unresolved" | "resolved";
  resolution: string | null;
};
export type Coverage = {
  sourceVersionId: string;
  status: "unprocessed" | "partial" | "complete" | "unreadable";
  processedUnits: number;
  totalUnits: number | null;
  gaps: string[];
};
export type Unknown = { id: string; question: string; entityId: string | null };
export type Approval = {
  ownerId: string;
  reviewedConflictIds: string[];
  reviewedUnknownIds: string[];
};
export type PackBody = {
  schemaVersion: 1;
  title: string;
  status: "draft" | "approved";
  sourceVersionIds: string[];
  sourcePriority: string[];
  entities: PackEntity[];
  claims: PackClaim[];
  contradictions: Contradiction[];
  coverage: Coverage[];
  unknowns: Unknown[];
  compilerJobVersionId: string | null;
  approval: Approval | null;
};
export type ScenarioBody = {
  schemaVersion: 1;
  title: string;
  status: "draft" | "approved";
  packVersionIds: string[];
  sourceVersionIds: string[];
  sourcePriority: string[];
  entry: { label: string; worldMinutes: number; evidence: EvidenceLocator[] };
  adaptation: "original" | "literal_crossover" | "native_adaptation";
  identities: {
    packVersionId: string;
    packEntityId: string;
    scenarioEntityId: string;
  }[];
  assumptions: { id: string; text: string; visibility: "public" | "private" }[];
  carriedClaimIds: string[];
  localHistory: string | null;
  unresolvedConflictIds: string[];
  approval: Approval | null;
};
export type DivergenceBody = {
  schemaVersion: 1;
  scenarioVersionId: string;
  title: string;
  changes: { id: string; text: string; visibility: "public" | "private" }[];
  approval: Approval | null;
};
export const COMPILER_STATES = [
  "queued",
  "extracting",
  "indexing",
  "auditing",
  "awaiting_review",
  "completed",
  "failed",
  "invalidated",
] as const;
export type CompilerState = (typeof COMPILER_STATES)[number];
export type CompilerJobBody = {
  schemaVersion: 1;
  targetPackId: string;
  sourceVersionIds: string[];
  sourcePriority: string[];
  inputDigest: string;
  status: CompilerState;
  budget: { maxUnits: number; maxPasses: number };
  checkpoints: {
    pass: "extracting" | "indexing" | "auditing";
    cursor: number;
    digest: string;
  }[];
  errorCode: "unreadable" | "unsupported" | "budget" | "invalidated" | null;
};
export type BodyMap = {
  source: SourceBody;
  pack: PackBody;
  scenario: ScenarioBody;
  divergence: DivergenceBody;
  compiler_job: CompilerJobBody;
};
export type TypedRecord<K extends keyof BodyMap> = Omit<
  LibraryRecord,
  "kind" | "body"
> & { kind: K; body: BodyMap[K] };
export type TypedLibraryRecord = {
  [K in keyof BodyMap]: TypedRecord<K>;
}[keyof BodyMap];
