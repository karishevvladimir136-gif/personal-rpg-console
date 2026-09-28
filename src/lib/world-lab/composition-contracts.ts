import type {
  EvidenceLocator,
  ExecutionProfile,
} from "../production/contracts.ts";
import type { ProviderUsage } from "../gameplay/server-contracts.ts";
import type { ScenarioBody } from "../world-library/types.ts";
import type {
  CompositionPolicy,
  CompositionProposal,
  CompositionReview,
} from "./composition-public.ts";
export type * from "./composition-public.ts";

// Inert types only. Public review fields contain indexes into offered choices,
// never record IDs, source authority, approval, patches or execution fences.
export type ComposeExecutionProfile = Omit<ExecutionProfile, "task"> & {
  task: "world.compose";
};
import type { LabContinuationBasis } from "./server-contracts.ts";
export type CompositionBasis = {
  ownerId: string;
  campaignId: string;
  saveId: string;
  baseManifestId: string;
  baseTimelineId: string;
  canonGeneration: number;
  basisDigest: string;
  sourceHeads: { sourceId: string; versionId: string }[];
  documents: { documentId: string; versionId: string; digest: string }[];
  packVersionIds: string[];
  sourceVersionIds: string[];
  startWorldMinutes: number;
  continuation?: LabContinuationBasis;
};
export type CompositionChoices = {
  policy: CompositionPolicy;
  actors: { id: string; label: string; control: "player" | "autonomous" }[];
  locations: { id: string; label: string }[];
  threads: {
    id: string;
    label: string;
    actorIndexes: number[];
    locationIndexes: number[];
  }[];
  evidence: {
    text: string;
    origin: "source_fact" | "source_inference" | "owner_assumption";
    knowledge: EvidenceLocator["knowledge"];
    knownActorIndexes: number[];
    locator: EvidenceLocator;
  }[];
};
export type CompositionMetadata = {
  schemaVersion: 1;
  phase: "requested" | "review" | "approved";
  operationId: string;
  premise: string;
  language: "en" | "ru";
  basis: CompositionBasis;
  composeProfile: ComposeExecutionProfile;
  simulationProfile: ExecutionProfile;
  choices: CompositionChoices;
  originalProposal: CompositionProposal | null;
  review: CompositionReview | null;
  ownerEdit: {
    ownerId: string;
    fromVersionId: string;
    fields: string[];
  } | null;
  usage: ProviderUsage | null;
};
export type CompositionScenarioBody = ScenarioBody & {
  composition: CompositionMetadata;
};
