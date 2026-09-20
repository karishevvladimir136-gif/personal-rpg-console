import type { FoundationCommand } from "./contracts.ts";
export type CampaignPackSettings = Omit<FoundationCommand, "operationId"> & {
  worldMinutes: number;
  packs: { id: string; versionId: string; version: number; title: string }[];
  pins: {
    bindingId: string;
    packId: string;
    packVersionId: string;
    title: string;
    version: number;
    entry: { label: string; worldMinutes: number };
    sources: {
      versionId: string;
      title: string;
      version: number;
      digest: string;
    }[];
  }[];
};
export type BindCampaignPackInput = FoundationCommand & {
  packVersionId: string;
  entry: { label: string; worldMinutes: number };
};
