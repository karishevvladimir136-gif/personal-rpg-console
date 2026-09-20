import type { WorldConsequence } from "./consequences.ts";
import type {
  EvidenceLocator,
  FoundationCommand,
  FoundationSnapshot,
  WorldSettlement,
} from "../production/contracts.ts";
import type {
  MechanicsResolution,
  RuntimeSource,
  RecordFamily,
} from "../gameplay/server-contracts.ts";

// Server-owned domain. Never a browser DTO or a second character/mechanics store.
export type WorldPolicy = {
  simulation: boolean;
  autonomy: "low" | "moderate" | "high";
  deadlinePressure: "off" | "critical_only" | "normal";
};
export type WorldActor = {
  id: string;
  campaignId: string;
  revision: number;
  kind: "entity" | "group" | "faction" | "location";
  entityId: string | null;
  control: "player" | "autonomous";
  publicName: string | null;
  locationId: string | null;
  capabilities: string[];
  knowledge: EvidenceLocator[];
};
export type WorldStepTrigger =
  | {
      kind: "deadline";
      atWorldMinutes: number;
      scenarioCritical: boolean;
      established: boolean;
    }
  | {
      kind: "autonomy";
      atWorldMinutes: number;
      scope: "local" | "related" | "broad";
    }
  | { kind: "causal"; family: RecordFamily; recordId: string };
export type PublicWorldOutcome = {
  text: string;
  actorIds: string[];
  evidence: EvidenceLocator[];
};
export type WorldStep = {
  id: string;
  trigger: WorldStepTrigger;
  resolution: "deterministic" | "resolver_required";
  consequence: "background" | "surface_before_complete" | "hard_deadline";
  privateText: string;
  evidence: EvidenceLocator[];
  publicOutcome: PublicWorldOutcome | null;
  warning: {
    forStepId: string;
    opportunityMinutes: number;
    recipientActorIds: string[];
  } | null;
  hookChanges: { hookId: string; status: "resolved" | "expired" }[];
  consequences?: WorldConsequence[];
};
export type WorldThread = {
  id: string;
  campaignId: string;
  revision: number;
  title: string;
  publicTitle: string | null;
  actorIds: string[];
  decisionActorIds: string[];
  locationIds: string[];
  prerequisiteThreadIds: string[];
  status: "active" | "resolved" | "paused";
  cursor: number;
  steps: WorldStep[];
};
export type WorldHook = {
  id: string;
  campaignId: string;
  locationId: string;
  threadId: string | null;
  privatePremise: string;
  status: "latent" | "discovered" | "resolved" | "expired";
  discovery: {
    label: string;
    text: string;
    kind:
      "observation" | "geography" | "rumor" | "clue" | "map" | "public_event";
    eventId: string | null;
    evidence: EvidenceLocator[];
  } | null;
};
export type WorldWarning = {
  stepId: string;
  eventId: string;
  atWorldMinutes: number;
  opportunityUntilWorldMinutes: number;
  recipientActorIds: string[];
};
export type WorldState = {
  schemaVersion: 1;
  campaignId: string;
  policy: WorldPolicy;
  policyChangedAtWorldMinutes: number;
  actors: WorldActor[];
  threads: WorldThread[];
  hooks: WorldHook[];
  warnings: WorldWarning[];
};
export type WorldTrigger =
  | "action"
  | "travel"
  | "rest"
  | "time_skip"
  | "state_change"
  | "session_boundary"
  | "none";
export type WorldStageInput = {
  snapshot: FoundationSnapshot;
  command: FoundationCommand;
  source: RuntimeSource;
  resolution: MechanicsResolution;
  trigger: WorldTrigger;
};
export type PublicWorldEvent = {
  id: string;
  worldMinutes: number;
  text: string;
  actorIds: string[];
};
export type WorldPauseReason =
  | "work_limit"
  | "resolver_required"
  | "warning_required"
  | "player_agency"
  | "knowledge_required";
export type WorldStageResult =
  | { status: "noop"; modelRequests: 0 }
  | { status: "paused"; reason: WorldPauseReason; modelRequests: 0 }
  | {
      status: "staged";
      settlement: WorldSettlement;
      publicEvents: PublicWorldEvent[];
      modelRequests: 0;
    };
