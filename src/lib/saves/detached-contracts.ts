// Lead-owned save extension. No active epoch and no private payload in this fence.
export type DetachedRunFence = {
  kind: "detached";
  ownerId: string;
  campaignId: string;
  timelineId: string;
  runId: string;
  leaseGeneration: number;
  headRevision: number;
  manifestId: string;
  scenarioVersionId: string;
  divergenceVersionId: string;
  inputDigest: string;
  canonGeneration: number;
};
