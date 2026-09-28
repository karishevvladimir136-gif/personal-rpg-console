import type {
  CampaignSnapshot,
  DocumentRecord,
  Mutation,
  MutationResult,
} from "../persistence/contracts.ts";
import { createMutationAttempt } from "../persistence/client.ts";
import { sameTimeline } from "../saves/fence.ts";
import {
  buildFrame,
  frameIsCurrent,
  mockAssetMutation,
  parseVisualMetadata,
  visualDocumentMutation,
  visualDocuments,
  VisualFrameError,
} from "./model.ts";
import type { VisualFrame } from "./model.ts";

export type CurrentSceneFrameAttempt = {
  frame: VisualFrame;
  queue: Mutation | null;
  record: DocumentRecord | null;
  asset: Mutation | null;
  completion: Mutation | null;
};
export type CurrentSceneFrameTransport = {
  save: (input: Mutation) => Promise<MutationResult>;
  load: (campaignId: string) => Promise<CampaignSnapshot>;
};

/** An explicit Game action binds only the exact public resume scene. No latest-scene fallback. */
export function prepareCurrentSceneFrame(
  snapshot: CampaignSnapshot,
): CurrentSceneFrameAttempt {
  const sceneId = snapshot.publicState.current_scene_id;
  if (!sceneId) throw new VisualFrameError("not_found");
  const frame = buildFrame(snapshot, sceneId, [], "wide");
  const queued = visualDocuments(snapshot).find(
    ({ value }) =>
      value.kind === "frame" &&
      value.status === "queued" &&
      frameIsCurrent(snapshot, value) &&
      value.prompt === frame.prompt &&
      JSON.stringify(value.basis) === JSON.stringify(frame.basis),
  );
  return {
    frame,
    queue: queued
      ? null
      : createMutationAttempt(null, visualDocumentMutation(snapshot, frame)),
    record: queued ? structuredClone(queued.record) : null,
    asset: null,
    completion: null,
  };
}

/** Reuses existing MOCK queue/asset/completion receipts. There is no image/model request. */
export async function finishCurrentSceneFrame(
  attempt: CurrentSceneFrameAttempt,
  transport: CurrentSceneFrameTransport,
) {
  const cid = attempt.frame.campaign_id;
  if (!attempt.record) {
    if (!attempt.queue) throw new VisualFrameError("validation");
    const result = await transport.save(structuredClone(attempt.queue));
    const snapshot = await transport.load(cid);
    const record = snapshot.documents.find(
      (row) => row.id === result.id && row.campaign_id === cid,
    );
    const value = record && parseVisualMetadata(record);
    if (
      !record ||
      record.revision !== result.revision ||
      !value ||
      JSON.stringify(value) !== JSON.stringify(attempt.frame)
    )
      throw new VisualFrameError("conflict");
    attempt.record = structuredClone(record);
  }
  // Keep the original version/fence even after a lost response. Successful
  // receipts are replayed by the existing authority before mutable preflight.
  const snapshot = await transport.load(cid);
  if (
    snapshot.campaign.id !== cid ||
    !sameTimeline(snapshot.timeline, attempt.frame.basis.timeline) ||
    !frameIsCurrent(snapshot, attempt.frame)
  )
    throw new VisualFrameError("conflict");
  attempt.asset ??= {
    ...mockAssetMutation(snapshot, attempt.record, attempt.frame),
    requestId: attempt.record.id,
  };
  const result = await transport.save(structuredClone(attempt.asset));
  attempt.completion ??= {
    ...visualDocumentMutation(
      snapshot,
      { ...attempt.frame, status: "completed", resultAssetId: result.id },
      attempt.record,
    ),
    requestId: result.id,
  };
  await transport.save(structuredClone(attempt.completion));
  return result.id;
}
