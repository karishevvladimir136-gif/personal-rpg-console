import type { DmStyle } from "../campaign-settings.ts";
import type { TimelineFence } from "../saves/contracts.ts";

export const CRAFT_SELECTOR_POLICY = "mega-dm-v1-literal-1" as const;
export type CraftStage = "plan" | "narrate";
export type CraftKind = "doctrine" | "card";
export type CraftLocaleText = { title: string; guidance: string; avoid: string };
export type CraftVersion = {
  id: string;
  key: string;
  version: number;
  kind: CraftKind;
  category: string;
  stages: CraftStage[];
  triggers: string[];
  en: CraftLocaleText;
  ru: CraftLocaleText;
  provenance: string;
  createdAt: string;
};
// Stored only in rpg_private.turns.source. Never add this to a public DTO.
export type PinnedCraft = {
  policyVersion: typeof CRAFT_SELECTOR_POLICY;
  ownerId: string;
  campaignId: string;
  operationId: string;
  timeline?: TimelineFence;
  styleRevision: number;
  style: DmStyle;
  doctrine: CraftVersion | null;
  plan: CraftVersion[];
  narrate: CraftVersion[];
};
export type CraftEffective = {
  key: string;
  activeVersionId: string | null;
  activationRevision: number;
};
export type CraftOwnerView = {
  policyVersion: typeof CRAFT_SELECTOR_POLICY;
  versions: CraftVersion[];
  effective: CraftEffective[];
};
export type CraftVersionInput = Omit<CraftVersion, "id" | "version" | "createdAt">;
export type CraftCommand =
  | { action: "save"; requestId: string; expectedActivationRevision: number; entry: CraftVersionInput }
  | { action: "activate"; requestId: string; expectedActivationRevision: number; key: string; versionId: string };

export type TeachCommand =
  | {
      action: "approve-style";
      requestId: string;
      campaignId: string;
      timeline: { timelineId: string; epoch: number };
      operationId: string;
      proposalId: string;
      expectedSettingsRevision: number;
      style: DmStyle;
    }
  | {
      action: "approve-global";
      requestId: string;
      campaignId: string;
      timeline: { timelineId: string; epoch: number };
      operationId: string;
      proposalId: string;
      expectedActivationRevision: number;
      entry: CraftVersionInput;
    }
  | {
      action: "reject";
      requestId: string;
      campaignId: string;
      timeline: { timelineId: string; epoch: number };
      operationId: string;
      proposalId: string;
    };
