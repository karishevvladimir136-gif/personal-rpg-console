import type { CompositionReview, PublicComposition } from "./composition-public.ts";
import type { LabBaseChoice, PublicLabRun } from "./contracts.ts";

export type LabModelSelection = { providerId: "openai"; modelId: string; reasoning: string | null };
export type LabCompositionItem = {
  id: string; versionId: string; version: number;
  base: LabBaseChoice; proposal: PublicComposition;
};
export type LabAuthoringCatalog = {
  models: { modelId: string; label: string; reasoning: string[]; available: boolean }[];
  drafts: LabCompositionItem[];
};
type Command = { operationId: string; campaignId: string };
export type LabAuthoringRequest =
  | { action: "interpret"; input: Command & { saveId: string; premise: string; model: LabModelSelection } }
  | { action: "edit"; input: Command & { versionId: string; review: CompositionReview; model: LabModelSelection } }
  | { action: "approve" | "retry_interpret"; input: Command & { versionId: string } };
export type LabAuthoringResult = { draft: LabCompositionItem; run: PublicLabRun | null };
