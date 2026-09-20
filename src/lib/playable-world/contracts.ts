import type { CampaignPackBinding } from "../production/contracts.ts";
import type { LoopPlan } from "../foundation-loop/contracts.ts";
import type { TypedRecord } from "../world-library/types.ts";

/** Server input. Raw Pack/source records and evidence never belong in review DTOs. */
export type PreparationSource = {
  binding: CampaignPackBinding;
  pack: TypedRecord<"pack">;
  sources: TypedRecord<"source">[];
  characterEntityId: string;
  worldMinutes: number;
  language?: "en" | "ru";
};

/** Lead folds these into the existing atomic ordinary-storage write boundary. */
export type PreparationStorageCreate = {
  id: string;
  expectedRevision: null;
  values: { name: string; kind: "merchant"; entity_id: string };
};

export type PreparationPlan = LoopPlan & {
  storageCreates: PreparationStorageCreate[];
};
