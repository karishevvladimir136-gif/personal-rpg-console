// Explicit owner configuration DTOs. No private foundation, source body or credentials.
import type { ModelSelection, RulesetProfileRef, RuntimePolicy } from "./contracts.ts";
import type { TimelineFence } from "../saves/contracts.ts";

export type CampaignWorldPolicy = {
  simulation: boolean;
  autonomy: "low" | "moderate" | "high";
  deadlinePressure: "off" | "critical_only" | "normal";
};
export type ProviderSettings = {
  schemaVersion: 1;
  providers: { id: string; label: string; status: "configured_not_tested" | "unavailable" }[];
  models: { providerId: string; id: string; label: string; reasoning: string[] }[];
  globalDefault: ModelSelection | null;
  globalDefaultStatus: "configured_not_tested" | "unavailable";
};
export type CampaignPackPin = {
  bindingId: string;
  packId: string;
  packVersionId: string;
  sourceVersionIds: string[];
};
export type CampaignProductionSettings = {
  campaignId: string;
  timeline: TimelineFence;
  revision: number;
  runtimeRevision: number;
  headId: string | null;
  worldPolicy: CampaignWorldPolicy;
  ruleset: RulesetProfileRef;
  runtimePolicy: RuntimePolicy | null;
  pins: CampaignPackPin[];
  providers: ProviderSettings;
};
export type ConfigureProductionInput = {
  operationId: string;
  timeline: TimelineFence;
  expectedRevision: number;
  expectedRuntimeRevision: number;
  expectedHeadId: string | null;
  worldPolicy: CampaignWorldPolicy;
  ruleset: RulesetProfileRef;
  runtimePolicy: RuntimePolicy | null;
};
