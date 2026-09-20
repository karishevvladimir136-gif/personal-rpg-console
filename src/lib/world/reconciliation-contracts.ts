import type { FoundationCommand } from "../production/contracts.ts";
import type { WorldPolicy, WorldState } from "./contracts.ts";

/** Browser-safe owner intent. It never accepts a private schedule identifier. */
export type WorldReconciliationChoice = {
  schemaVersion: 1;
  kind: "restart_overdue";
  graceMinutes: number;
};

export const WORLD_RECONCILIATION_GRACE = {
  minimum: 1,
  maximum: 10_080,
  default: 60,
} as const;

/** Server-only result. Never return this envelope or its row count to a client. */
export type WorldPolicyReconciliationPlan = {
  schemaVersion: 1;
  command: FoundationCommand;
  fromWorldMinutes: number;
  reconciliations: { stepId: string; atWorldMinutes: number }[];
  world: WorldState;
};

/** Review availability follows policy alone, including when no work exists.
 * Individual schedule details require a separate, established public authority. */
export type PublicWorldPolicyReconciliation = {
  schemaVersion: 1;
  campaignId: string;
  timeline: FoundationCommand["timeline"];
  revision: number;
  runtimeRevision: number;
  headId: string | null;
  worldMinutes: number;
  previousPolicy: WorldPolicy;
  nextPolicy: WorldPolicy;
  requiresReview: boolean;
  grace: typeof WORLD_RECONCILIATION_GRACE;
  knownSchedules: never[];
};
