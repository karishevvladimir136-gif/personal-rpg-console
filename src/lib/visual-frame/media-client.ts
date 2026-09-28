import {
  createMutationAttempt,
  loadCampaign,
  readJson,
} from "../persistence/client.ts";
import type {
  CampaignSnapshot,
  DocumentRecord,
  Mutation,
} from "../persistence/contracts.ts";
import { parseRealFrame, realFrameDocumentMutation } from "./real-frame.ts";
import type { RealFrame, FrameParameters, ImageModel } from "./real-frame.ts";
import type {
  MediaCommand,
  MediaResult,
} from "../server/media/orchestration.ts";
export type MediaCapability = {
  enabled: boolean;
  model: ImageModel | null;
  parameters: FrameParameters | null;
  reservationUsdMicros: number | null;
  verificationReservationUsdMicros?: number | null;
  totalReservationUsdMicros?: number | null;
  imageReferencesEnabled: false;
};
export type FramePrepareIntent = {
  campaignId: string;
  timeline: NonNullable<CampaignSnapshot["timeline"]>;
  expectedPublicStateRevision: number;
  referenceIds: string[];
  composition: RealFrame["composition"];
  retryOf: string | null;
};
export type MediaFrameTransport = {
  capability: (campaignId: string) => Promise<MediaCapability>;
  prepare: (input: FramePrepareIntent) => Promise<RealFrame>;
  send: (command: MediaCommand) => Promise<MediaResult>;
  load: (campaignId: string) => Promise<CampaignSnapshot>;
  imageUrl: (campaignId: string, assetId: string) => string;
};
export const defaultMediaFrameTransport: MediaFrameTransport = {
  capability: (campaignId) =>
    readJson(
      `/api/visual-frame?action=capability&campaignId=${encodeURIComponent(campaignId)}`,
    ),
  prepare: (input) =>
    readJson("/api/visual-frame", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "media.prepare", input }),
    }),
  send: (command) =>
    readJson("/api/visual-frame", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(command),
    }),
  load: loadCampaign,
  imageUrl: (campaignId, assetId) =>
    `/api/visual-frame?campaignId=${encodeURIComponent(campaignId)}&assetId=${encodeURIComponent(assetId)}`,
};
export type RealFrameAttempt = {
  frame: RealFrame;
  queue: Mutation;
  record: DocumentRecord | null;
  dispatch: Mutation | null;
  recovery: Mutation | null;
  reservationUsdMicros: number;
};
export function createRealFrameAttempt(
  snapshot: CampaignSnapshot,
  frame: RealFrame,
  reservationUsdMicros: number,
): RealFrameAttempt {
  if (
    frame.status !== "queued" ||
    frame.campaign_id !== snapshot.campaign.id ||
    !Number.isSafeInteger(reservationUsdMicros) ||
    reservationUsdMicros <= 0
  )
    throw new Error("validation");
  return {
    frame: structuredClone(frame),
    queue: createMutationAttempt(
      null,
      realFrameDocumentMutation(snapshot, frame),
    ),
    record: null,
    dispatch: null,
    recovery: null,
    reservationUsdMicros,
  };
}
export async function finishRealFrameAttempt(
  attempt: RealFrameAttempt,
  transport: MediaFrameTransport,
) {
  // Retained submissions replay exact original receipts before any mutable projection load.
  if (attempt.recovery)
    return transport.send({
      action: "media.recover",
      input: structuredClone(attempt.recovery),
    });
  if (attempt.dispatch)
    return transport.send({
      action: "media.dispatch",
      input: structuredClone(attempt.dispatch),
    });
  const queued = await transport.send({
    action: "media.save",
    input: structuredClone(attempt.queue),
  });
  const snapshot = await transport.load(attempt.frame.campaign_id);
  const record = snapshot.documents.find(
    (r) =>
      r.id === queued.result.id && r.campaign_id === attempt.frame.campaign_id,
  );
  if (
    !record ||
    record.revision !== queued.result.revision ||
    JSON.stringify(parseRealFrame(record)) !== JSON.stringify(attempt.frame)
  )
    throw new Error("conflict");
  attempt.record = structuredClone(record);
  const requestId = crypto.randomUUID();
  attempt.dispatch = {
    ...realFrameDocumentMutation(
      snapshot,
      {
        ...attempt.frame,
        status: "generating",
        dispatch: {
          requestId,
          reservationUsdMicros: attempt.reservationUsdMicros,
        },
      },
      record,
    ),
    requestId,
  };
  return transport.send({
    action: "media.dispatch",
    input: structuredClone(attempt.dispatch),
  });
}
export function storedFrameRecovery(
  snapshot: CampaignSnapshot,
  record: DocumentRecord,
): Mutation {
  const frame = parseRealFrame(record);
  if (
    !frame ||
    frame.status !== "generating" ||
    !frame.dispatch ||
    record.campaign_id !== snapshot.campaign.id
  )
    throw new Error("validation");
  return {
    ...realFrameDocumentMutation(
      snapshot,
      { ...frame, status: "completed", resultAssetId: record.id },
      record,
    ),
    requestId: record.id,
  };
}
