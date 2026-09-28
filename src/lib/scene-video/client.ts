import {
  ClientPersistenceError,
  createMutationAttempt,
  loadCampaign,
  readJson,
} from "../persistence/client.ts";
import type {
  Asset,
  CampaignSnapshot,
  DocumentRecord,
  Mutation,
  MutationResult,
} from "../persistence/contracts.ts";
import { sameTimeline } from "../saves/fence.ts";
import {
  ownerAcceptedFrameAsset,
  parseRealFrame,
} from "../visual-frame/real-frame.ts";
import { parseSceneVideo, videoDocumentMutation } from "./model.ts";
import type { SceneVideo } from "./model.ts";

export type VideoCapability = {
  enabled: boolean;
  model: string | null;
  parameters: SceneVideo["parameters"] | null;
  reservationUsdMicros: number | null;
};
export type VideoPrepareIntent = {
  campaignId: string;
  timeline: NonNullable<CampaignSnapshot["timeline"]>;
  expectedPublicStateRevision: number;
  sourceAssetId: string;
  retryOf: string | null;
};
export type VideoCommand =
  | { action: "video.save" | "video.dispatch"; input: Mutation }
  | { action: "video.poll"; campaignId: string; jobId: string };
export type VideoResult = {
  result: MutationResult | null;
  status: SceneVideo["status"];
  dispatched: boolean;
};
export type VideoTransport = {
  capability: (campaignId: string) => Promise<VideoCapability>;
  prepare: (input: VideoPrepareIntent) => Promise<SceneVideo>;
  send: (command: VideoCommand) => Promise<VideoResult>;
  load: (campaignId: string) => Promise<CampaignSnapshot>;
  videoUrl: (campaignId: string, assetId: string) => string;
};
export const defaultVideoTransport: VideoTransport = {
  capability: (campaignId) =>
    readJson(
      `/api/scene-video?action=capability&campaignId=${encodeURIComponent(campaignId)}`,
    ),
  prepare: (input) =>
    readJson("/api/scene-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "video.prepare", input }),
    }),
  send: (command) =>
    readJson("/api/scene-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(command),
    }),
  load: loadCampaign,
  videoUrl: (campaignId, assetId) =>
    `/api/scene-video?campaignId=${encodeURIComponent(campaignId)}&assetId=${encodeURIComponent(assetId)}`,
};

/** Public eligibility is a UI guard; the server still validates exact source/head/reference authority. */
export function eligibleVideoSources(snapshot: CampaignSnapshot): Asset[] {
  const scene = snapshot.scenes.find(
    (s) =>
      s.campaign_id === snapshot.campaign.id &&
      s.id === snapshot.publicState.current_scene_id &&
      s.session_id === snapshot.publicState.current_session_id &&
      s.role === "narration",
  );
  if (!scene || !snapshot.timeline) return [];
  return snapshot.assets
    .filter((asset) => {
      const approved = ownerAcceptedFrameAsset(snapshot, asset);
      const record =
        approved &&
        snapshot.documents.find(
          (d) =>
            d.id === approved.job_document_id &&
            d.campaign_id === snapshot.campaign.id,
        );
      const frame = record && parseRealFrame(record);
      return (
        frame?.schema === 4 &&
        frame.status === "completed" &&
        frame.parameters.size === "1536x1024" &&
        frame.basis.publicStateRevision === snapshot.publicState.revision &&
        sameTimeline(frame.basis.timeline, snapshot.timeline) &&
        frame.basis.scene.id === scene.id &&
        frame.basis.scene.revision === scene.revision &&
        frame.basis.scene.title === scene.title &&
        frame.basis.scene.body === scene.body
      );
    })
    .sort((a, b) => a.updated_at.localeCompare(b.updated_at));
}
export type SceneVideoAttempt = {
  video: SceneVideo;
  queue: Mutation;
  dispatch: Mutation | null;
  reservationUsdMicros: number;
};
export function createSceneVideoAttempt(
  snapshot: CampaignSnapshot,
  video: SceneVideo,
  reservationUsdMicros: number,
): SceneVideoAttempt {
  if (
    video.status !== "queued" ||
    video.campaign_id !== snapshot.campaign.id ||
    !Number.isSafeInteger(reservationUsdMicros) ||
    reservationUsdMicros <= 0 ||
    !eligibleVideoSources(snapshot).some((a) => a.id === video.source.assetId)
  )
    throw new ClientPersistenceError("validation");
  return {
    video: structuredClone(video),
    queue: createMutationAttempt(null, videoDocumentMutation(snapshot, video)),
    dispatch: null,
    reservationUsdMicros,
  };
}
export function createStoredVideoDispatch(
  snapshot: CampaignSnapshot,
  record: DocumentRecord,
  reservationUsdMicros: number,
): Mutation {
  const video = parseSceneVideo(record);
  if (
    !video ||
    video.status !== "queued" ||
    record.campaign_id !== snapshot.campaign.id ||
    !snapshot.documents.some(
      (d) =>
        d.id === record.id &&
        d.revision === record.revision &&
        d.body === record.body,
    ) ||
    !eligibleVideoSources(snapshot).some((a) => a.id === video.source.assetId)
  )
    throw new ClientPersistenceError("conflict");
  const requestId = crypto.randomUUID();
  return {
    ...videoDocumentMutation(
      snapshot,
      {
        ...video,
        status: "generating",
        dispatch: { requestId, reservationUsdMicros },
      },
      record,
    ),
    requestId,
  };
}
export async function finishSceneVideoAttempt(
  attempt: SceneVideoAttempt,
  transport: VideoTransport,
): Promise<VideoResult> {
  // Replay the retained receipt before any mutable projection read; this never invents another paid attempt.
  if (attempt.dispatch)
    return transport.send({
      action: "video.dispatch",
      input: structuredClone(attempt.dispatch),
    });
  const queued = await transport.send({
    action: "video.save",
    input: structuredClone(attempt.queue),
  });
  const snapshot = await transport.load(attempt.video.campaign_id);
  const record = snapshot.documents.find(
    (d) =>
      d.id === queued.result?.id && d.campaign_id === attempt.video.campaign_id,
  );
  if (
    !record ||
    record.revision !== queued.result?.revision ||
    JSON.stringify(parseSceneVideo(record)) !== JSON.stringify(attempt.video)
  )
    throw new ClientPersistenceError("conflict");
  attempt.dispatch = createStoredVideoDispatch(
    snapshot,
    record,
    attempt.reservationUsdMicros,
  );
  return transport.send({
    action: "video.dispatch",
    input: structuredClone(attempt.dispatch),
  });
}
