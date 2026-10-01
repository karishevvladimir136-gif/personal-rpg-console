import type { TurnInput } from "../gameplay/contracts.ts";
import type {
  MechanicsResolution,
  RuntimeSource,
} from "../gameplay/server-contracts.ts";
import type {
  EvidenceLocator,
  FoundationCommand,
  FoundationSnapshot,
  WorldSettlement,
} from "../production/contracts.ts";
import type { PublicWorldEvent } from "../world/contracts.ts";
import type { WorldConsequence } from "../world/consequences.ts";

// Internal operation input. Never serialize this object to a provider or browser.
export type WorldLogicInput = {
  snapshot: FoundationSnapshot;
  command: FoundationCommand;
  source: RuntimeSource;
  input: TurnInput;
  // Derived by the private World read; absent in pre-migration fixtures.
  localRoutes?: { actorId: string; destinationId: string }[];
};
export type WorldLogicProposalV1 = {
  schemaVersion: 1;
  actorId: string;
  input: string;
  action: "observe" | "speak" | "attempt" | "move" | "wait";
  outcome: "completed" | "blocked";
  uncertainty:
    "resolved" | "missing_evidence" | "contradiction" | "unsupported";
  capabilityRefs: string[];
  circumstanceRefs: string[];
  evidenceIndexes: number[];
  publicText: string;
  elapsedMinutes: number;
  destinationId: string | null;
};
export type WorldLogicProposal =
  | WorldLogicProposalV1
  | (Omit<WorldLogicProposalV1, "schemaVersion"> & {
      schemaVersion: 2;
      consequences: WorldConsequence[];
    })
  | LivingWorldProposal;
export type LivingWorldProposal = {
  schemaVersion: 3;
  actorId: string;
  input: string;
  uncertainty:
    "resolved" | "missing_evidence" | "contradiction" | "unsupported";
  circumstanceRefs: string[];
  evidenceIndexes: number[];
  kind: "location.establish";
  anchorLocationId: string | null;
  destinationId: null;
  name: string | null;
  category:
    | "tavern"
    | "inn"
    | "blacksmith"
    | "brothel"
    | "bathhouse"
    | "stable"
    | "market_stall"
    | "street"
    | "alley"
    | "shop"
    | null;
  vicinity: "nearby" | "same_street" | null;
};
export type MundanePublicDetail = {
  targetKind: "location" | "person";
  targetId: string;
  name: string;
  epistemic: "direct" | "reported";
};
export type WorldLogicContext = {
  schemaVersion: 1;
  input: string;
  language: string;
  worldMinutes: number;
  currentLocationId: string | null;
  recentPublicScene: string | null;
  publicDetailTargets: {
    kind: "location" | "person";
    id: string;
    name: string;
    description: string;
  }[];
  actors: {
    id: string;
    name: string;
    description: string;
    capabilities: string[];
    limitations: string[];
    evidence: EvidenceLocator[];
  }[];
  circumstances: { id: string; text: string }[];
  // Advisory only, never an effect or a prerequisite supplied by model text.
  adventure: import("../gameplay/contracts.ts").JsonObject | null;
  locations: { id: string; name: string }[];
  travelOptions: {
    actorId: string;
    destinationId: string;
    capability: string | null;
  }[];
  consequenceOptions: {
    actorId: string;
    capability: string;
    effect: WorldConsequence;
    maximum: number | null;
    label: string;
  }[];
  constraints: string[];
};
export type WorldLogicResult =
  | {
      status: "paused";
      reason: "uncertainty" | "unsupported" | "context_required";
    }
  | {
      status: "staged";
      proposal: WorldLogicProposal;
      settlement: WorldSettlement;
      resolution: MechanicsResolution;
      publicEvents: PublicWorldEvent[];
      mundaneDetail?: MundanePublicDetail;
    }
  | {
      status: "mundane";
      proposal: LivingWorldProposal;
      resolution: MechanicsResolution;
    };
