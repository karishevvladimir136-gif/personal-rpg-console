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

// Internal operation input. Never serialize this object to a provider or browser.
export type WorldLogicInput = {
  snapshot: FoundationSnapshot;
  command: FoundationCommand;
  source: RuntimeSource;
  input: TurnInput;
};
export type WorldLogicProposal = {
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
export type WorldLogicContext = {
  schemaVersion: 1;
  input: string;
  language: string;
  worldMinutes: number;
  actors: {
    id: string;
    name: string;
    capabilities: string[];
    evidence: EvidenceLocator[];
  }[];
  circumstances: { id: string; text: string }[];
  locations: { id: string; name: string }[];
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
    };
