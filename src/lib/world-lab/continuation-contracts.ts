// Browser-safe selection and projections. Checkpoint state stays server-side.
import type {
  LabAuthoringCatalog,
  LabCompositionItem,
  LabModelSelection,
} from "./authoring-contracts.ts";
import type { LabCheckpoint, LabStatus, PublicLabRun } from "./contracts.ts";
import type { CompositionReview } from "./composition-public.ts";

export type ContinuationSelection = {
  sourceRunId: string;
  sourceCheckpointId: string;
  expectedRevision: number;
};
export type ContinuationInspection = {
  campaignId: string;
  nonCanon: true;
  source: {
    runId: string;
    timelineId: string;
    label: string;
    revision: number;
    status: LabStatus;
  };
  checkpoint: LabCheckpoint;
  eligible: boolean;
};
export type ContinuationDraft = {
  source: ContinuationSelection;
  draft: LabCompositionItem;
};
export type ContinuationCatalog = {
  campaignId: string;
  source: ContinuationSelection;
  models: LabAuthoringCatalog["models"];
  drafts: LabCompositionItem[];
};
type Command = {
  operationId: string;
  campaignId: string;
  source: ContinuationSelection;
};
export type ContinuationRequest =
  | {
      action: "interpret";
      input: Command & { premise: string; model: LabModelSelection };
    }
  | {
      action: "edit";
      input: Command & {
        versionId: string;
        review: CompositionReview;
        model: LabModelSelection;
      };
    }
  | {
      action: "approve" | "retry_interpret";
      input: Command & { versionId: string };
    };
export type ContinuationResult = ContinuationDraft & {
  run: PublicLabRun | null;
};
