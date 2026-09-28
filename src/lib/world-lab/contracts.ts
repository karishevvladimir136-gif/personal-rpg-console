// Lead-owned public allowlist. Browser code must not import server-contracts.
export type LabStatus =
  "prepared" | "running" | "paused" | "completed" | "cancelled" | "failed";
export type LabReason =
  | "review_required"
  | "source_changed"
  | "unsupported"
  | "work_limit"
  | "cancelled"
  | "unavailable"
  | null;
export type LabBaseChoice = {
  saveId: string;
  timelineId: string;
  label: string;
  worldMinutes: number;
};
export type LabScenarioChoice = {
  scenarioVersionId: string;
  divergenceVersionId: string;
  scenarioTitle: string;
  divergenceTitle: string;
  assumptions: string[];
  changes: string[];
};
export type LabCheckpoint = {
  id: string;
  ordinal: number;
  worldMinutes: number;
  summary: string;
  events: { id: string; text: string; worldMinutes: number }[];
};
export type PublicLabRun = {
  id: string;
  campaignId: string;
  timelineId: string;
  label: string;
  purpose: "simulation";
  nonCanon: true;
  status: LabStatus;
  reason: LabReason;
  revision: number;
  base: LabBaseChoice;
  scenario: LabScenarioChoice;
  startWorldMinutes: number;
  throughWorldMinutes: number;
  currentWorldMinutes: number;
  checkpoints: LabCheckpoint[];
  // Authorized public run/checkpoint identities only; no private basis digest.
  continuation?: { sourceRunId: string; sourceCheckpointId: string };
  execution?: {
    modelId: string;
    reasoning: string | null;
    recordedResponses: number;
    inputTokens: number | null;
    outputTokens: number | null;
  };
};
export type LabCatalog = {
  campaignId: string;
  bases: LabBaseChoice[];
  scenarios: LabScenarioChoice[];
  runs: PublicLabRun[];
};
export type LabPrepareInput = {
  operationId: string;
  campaignId: string;
  saveId: string;
  scenarioVersionId: string;
  divergenceVersionId: string;
  label: string;
  horizonMinutes: number;
};
export type LabRunCommand = {
  operationId: string;
  campaignId: string;
  runId: string;
  expectedRevision: number;
};
export type LabRequest =
  | { action: "prepare"; input: LabPrepareInput }
  | {
      action: "continue" | "pause" | "cancel" | "resume";
      input: LabRunCommand;
    };
