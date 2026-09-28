import type {
  CampaignSnapshot,
  Mutation,
  MutationResult,
} from "../persistence/contracts.ts";
import { validateMutation } from "../persistence/validation.ts";
import { isTimelineFence } from "../saves/fence.ts";
import {
  MOCK_ASSET_PREFIX,
  parseVisualMetadata,
  validateVisualMutation,
  VisualFrameError,
} from "./model.ts";

export type VisualFrameAuthority = {
  authorize: (campaignId: string) => Promise<void>;
  receipt: (input: Mutation) => Promise<MutationResult | null>;
  snapshot: (campaignId: string) => Promise<CampaignSnapshot>;
  apply: (input: Mutation) => Promise<MutationResult>;
};
export async function writeVisualFrame(
  value: unknown,
  authority: VisualFrameAuthority,
) {
  let input: Mutation;
  try {
    input = validateMutation(value);
  } catch {
    throw new VisualFrameError("validation");
  }
  if (
    !("campaignId" in input) ||
    !isTimelineFence(input.timeline) ||
    !["document.save", "asset.save"].includes(input.operation)
  )
    throw new VisualFrameError("validation");
  await authority.authorize(input.campaignId);
  // The original successful receipt wins before mutable source, entity, document or asset preflight.
  const receipt = await authority.receipt(input);
  if (receipt) return receipt;
  const snapshot = await authority.snapshot(input.campaignId);
  const { requestId: _requestId, ...mutation } = input;
  void _requestId;
  validateVisualMutation(snapshot, mutation);
  if (input.operation === "asset.save") {
    const source = JSON.parse(
      input.payload.description.slice(MOCK_ASSET_PREFIX.length),
    );
    if (input.requestId !== source.job_document_id)
      throw new VisualFrameError("validation");
  } else if (input.operation === "document.save") {
    const metadata = parseVisualMetadata(input.payload);
    if (
      metadata?.kind === "frame" &&
      metadata.status === "completed" &&
      input.requestId !== metadata.resultAssetId
    )
      throw new VisualFrameError("validation");
    if (
      metadata?.kind === "frame" &&
      metadata.status === "queued" &&
      snapshot.documents.some((record) => {
        const existing = parseVisualMetadata(record);
        return (
          record.campaign_id === input.campaignId &&
          record.status === "reference" &&
          existing?.kind === "frame" &&
          existing.status === "queued" &&
          existing.prompt === metadata.prompt &&
          JSON.stringify(existing.basis) === JSON.stringify(metadata.basis)
        );
      })
    )
      throw new VisualFrameError("conflict");
  }
  return authority.apply(input);
}
