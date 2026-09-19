// Lead-owned public-only contracts. Private save contents never enter these DTOs.
export type TimelineFence = { timelineId: string; epoch: number };
export type CorrectionScope = "campaign" | "timeline";
export type SaveKind = "manual" | "quick" | "autosave" | "safety";
export type SavePolicy = {
  autosave: "off" | "session" | "turn";
  retention: number;
  loadMode: "unrestricted" | "checkpoints" | "restricted";
};
export type PublicSave = {
  id: string;
  campaign_id: string;
  timelineId: string;
  name: string;
  kind: SaveKind;
  createdAt: string;
  sessionTitle: string | null;
  sceneTitle: string | null;
  locationName: string | null;
  worldMinutes: number;
  pendingAction: boolean;
};
export type PublicTimeline = {
  id: string;
  campaign_id: string;
  label: string;
  parentTimelineId: string | null;
  forkSaveId: string | null;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  quickSaveId: string | null;
  locationName: string | null;
  worldMinutes: number;
};
export type SavesSnapshot = {
  campaignId: string;
  timeline: TimelineFence;
  runtimeRevision: number;
  revision: number;
  saves: PublicSave[];
  timelines: PublicTimeline[];
  policy: SavePolicy;
};
export type SaveCommandBase = {
  requestId: string;
  campaignId: string;
  timeline: TimelineFence;
  expectedRevision: number;
  expectedSavesRevision: number;
};
export type CreateSaveInput = SaveCommandBase & {
  kind: "manual" | "quick";
  name: string;
};
export type LoadSaveInput = SaveCommandBase & {
  saveId: string;
  label: string;
  recovery: boolean;
};
export type SwitchTimelineInput = SaveCommandBase & {
  timelineId: string;
  recovery: boolean;
};
export type SavePolicyInput = SaveCommandBase & { policy: SavePolicy };
export type SaveCommand =
  | { action: "create"; input: CreateSaveInput }
  | { action: "load"; input: LoadSaveInput }
  | { action: "switch"; input: SwitchTimelineInput }
  | { action: "policy"; input: SavePolicyInput };
export type SaveResult = {
  snapshot: SavesSnapshot;
  requestId: string;
  saveId: string | null;
  timelineId: string;
  safetySaveId: string | null;
};
