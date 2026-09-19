import type { TimelineFence } from "../saves/contracts.ts";
// Lead-owned public DTOs. Never expose private jobs, sources, coverage or diagnostics.
import type { TurnStatus } from "../gameplay/contracts.ts";

export type RecapStatus =
  "pending" | "generating" | "ready" | "failed" | "stale";
export type PublicResumePoint = {
  sceneId: string | null;
  locationId: string | null;
  worldMinutes: number;
  participantIds: string[];
  lastAction: string | null;
  lastOutcome: string | null;
  situation: string;
  expectedInput: string;
  pendingOperationId: string | null;
  pendingStatus: TurnStatus | null;
};
export type PublicSessionMemory = {
  id: string;
  campaign_id: string;
  sessionId: string;
  endedAt: string;
  state: "ended" | "resuming" | "continued";
  nextSessionId: string | null;
  checkpointStatus: "ready" | "rebuild_required";
  resume: PublicResumePoint;
  recap: { status: RecapStatus; text: string | null; canRetry: boolean };
};
export type MemorySnapshot = {
  // Optional only for legacy unfenced fixtures; live Phase 3.5 projections include it.
  timeline?: TimelineFence;
  campaignId: string;
  runtimeRevision: number;
  currentBoundary: PublicSessionMemory | null;
  sessions: PublicSessionMemory[];
};
export type EndSessionInput = {
  // Optional only for legacy unfenced fixtures; live Phase 3.5 projections include it.
  timeline?: TimelineFence;
  requestId: string;
  campaignId: string;
  expectedRevision: number;
  sessionId: string;
};
export type ContinueSessionInput = {
  // Optional only for legacy unfenced fixtures; live Phase 3.5 projections include it.
  timeline?: TimelineFence;
  requestId: string;
  campaignId: string;
  expectedRevision: number;
  boundaryId: string;
};
export type RetryMemoryInput = {
  // Optional only for legacy unfenced fixtures; live Phase 3.5 projections include it.
  timeline?: TimelineFence;
  requestId: string;
  campaignId: string;
  boundaryId: string | null;
};
