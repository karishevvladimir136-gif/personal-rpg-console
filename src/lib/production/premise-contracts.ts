import type { TimelineFence } from "../saves/contracts.ts";

// Owner-authored advisory material. Never a DM instruction or an effective policy.
export type CampaignPremiseInput = { text: string; language: "en" | "ru" };
export type CampaignPremiseVersion = CampaignPremiseInput & {
  id: string;
  documentId: string;
  version: number;
  reviewStatus: "draft" | "reviewed";
  authoredBy: string;
  digest: string;
  previousVersionId: string | null;
  restoredFromVersionId: string | null;
  createdAt: string;
};
export type CampaignPremise = {
  schemaVersion: 1;
  campaignId: string;
  timeline: TimelineFence;
  revision: number;
  current: CampaignPremiseVersion | null;
  versions: CampaignPremiseVersion[];
  olderThan: number | null;
};
export type CampaignPremiseCommand = {
  operationId: string;
  timeline: TimelineFence;
  expectedRevision: number;
} & (
  | ({ action: "save" } & CampaignPremiseInput)
  | { action: "review" }
  | { action: "restore"; versionId: string }
);
