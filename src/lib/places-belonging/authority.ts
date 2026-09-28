import type {
  CampaignSnapshot,
  Mutation,
  MutationResult,
} from "../persistence/contracts.ts";
import { validateMutation } from "../persistence/validation.ts";
import { isTimelineFence } from "../saves/fence.ts";
import {
  BelongingError,
  parseBelonging,
  prepareBelongingMutation,
} from "./model.ts";
export type BelongingWriteDependencies = {
  authorize: (campaignId: string) => Promise<void>;
  receipt: (input: Mutation) => Promise<MutationResult | null>;
  snapshot: (campaignId: string) => Promise<CampaignSnapshot>;
  apply: (input: Mutation) => Promise<MutationResult>;
};
export async function writeBelonging(
  value: unknown,
  deps: BelongingWriteDependencies,
) {
  let input: Mutation;
  try {
    input = validateMutation(value);
  } catch {
    throw new BelongingError();
  }
  if (
    input.operation !== "document.save" ||
    input.payload.status !== "reference" ||
    input.correctionScope !== "campaign" ||
    !isTimelineFence(input.timeline)
  )
    throw new BelongingError();
  const annotation = parseBelonging(input.payload.body);
  if (
    !annotation ||
    annotation.campaignId !== input.campaignId ||
    annotation.label !== input.payload.title
  )
    throw new BelongingError();
  await deps.authorize(input.campaignId);
  // The receipt helper still checks the active fence. Exact immutable replay
  // precedes reading current locations/documents, without a second write or repin.
  const receipt = await deps.receipt(input);
  if (receipt) return receipt;
  return deps.apply(
    prepareBelongingMutation(input, await deps.snapshot(input.campaignId)),
  );
}
