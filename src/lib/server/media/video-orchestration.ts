import type {
  CampaignSnapshot,
  Mutation,
  MutationResult,
} from "../../persistence/contracts.ts";
import { validateMutation, isUuid } from "../../persistence/validation.ts";
import { exactKeys, isFrameOutput } from "../../visual-frame/real-frame.ts";
import type { FrameSourceAuthority } from "../../visual-frame/real-frame.ts";
import { checkedPng } from "./png.ts";
import { checkedMp4 } from "./video-provider.ts";
import type { VideoPixels, VideoProvider } from "./video-provider.ts";
import {
  VIDEO_RESERVATION_USD_MICROS,
  VideoError,
  parseSceneVideo,
  videoDocumentMutation,
  videoAssetMutation,
  videoIsCurrent,
  videoStoragePath,
} from "../../scene-video/model.ts";
import type { SceneVideo, VideoOutput } from "../../scene-video/model.ts";
export type VideoPolicy = {
  budgetId: string;
  model: SceneVideo["model"];
  reservationUsdMicros: number;
};
export type VideoAuthority = {
  authorize: (cid: string) => Promise<void>;
  snapshot: (cid: string) => Promise<CampaignSnapshot>;
  source: (cid: string) => Promise<FrameSourceAuthority>;
  receipt: (m: Mutation) => Promise<MutationResult | null>;
  lifecycle: (m: Mutation) => Promise<MutationResult>;
  claim: (
    m: Mutation,
    budgetId: string,
  ) => Promise<{ result: MutationResult; claimed: boolean }>;
  submission: (
    cid: string,
    jid: string,
    requestId?: string,
  ) => Promise<string | null>;
  complete: (
    m: Mutation,
    asset: Mutation,
    output: VideoOutput,
  ) => Promise<MutationResult>;
};
export type VideoDependencies = {
  authority: VideoAuthority;
  policy: VideoPolicy | null;
  provider: VideoProvider;
  store: {
    frame: (
      cid: string,
      id: string,
    ) => Promise<{ bytes: Uint8Array; output: unknown } | null>;
    read: (cid: string, jid: string) => Promise<VideoPixels | null>;
    put: (cid: string, jid: string, p: VideoPixels) => Promise<void>;
  };
};
export type VideoResult = {
  result: MutationResult | null;
  status: SceneVideo["status"];
  dispatched: boolean;
};
export type VideoCommand =
  | { action: "video.save" | "video.dispatch"; input: Mutation }
  | { action: "video.poll"; campaignId: string; jobId: string };
function mutation(
  v: unknown,
): Extract<Mutation, { operation: "document.save" }> {
  try {
    const m = validateMutation(v);
    if (
      m.operation !== "document.save" ||
      m.correctionScope !== "campaign" ||
      !parseSceneVideo(m.payload)
    )
      throw new Error();
    return m;
  } catch {
    throw new VideoError("validation");
  }
}
function rowIn(s: CampaignSnapshot, id: string) {
  const r = s.documents.find(
    (d) =>
      d.id === id &&
      d.campaign_id === s.campaign.id &&
      d.status === "reference",
  );
  if (!r || !parseSceneVideo(r)) throw new VideoError("not_found");
  return r;
}
function statusResult(
  result: MutationResult | null,
  status: SceneVideo["status"],
  dispatched = false,
): VideoResult {
  return { result, status, dispatched };
}
export async function executeSceneVideo(
  value: unknown,
  d: VideoDependencies,
): Promise<VideoResult> {
  if (
    exactKeys(value, ["action", "campaignId", "jobId"]) &&
    value.action === "video.poll" &&
    isUuid(value.campaignId) &&
    isUuid(value.jobId)
  ) {
    const cid = value.campaignId,
      jid = value.jobId;
    await d.authority.authorize(cid);
    let snapshot = await d.authority.snapshot(cid),
      row = rowIn(snapshot, jid),
      v = parseSceneVideo(row)!;
    if (["ready", "failed", "cancelled"].includes(v.status))
      return statusResult(
        {
          id: row.id,
          campaign_id: cid,
          revision: row.revision,
          timeline: v.basis.timeline,
        },
        v.status,
      );
    if (v.status === "queued") return statusResult(null, "queued");
    if (!videoIsCurrent(snapshot, v, await d.authority.source(cid)))
      throw new VideoError("conflict");
    const requestId = await d.authority.submission(cid, jid);
    if (!requestId) return statusResult(null, "uncertain"); // unknown submit never creates a replacement
    let pixels = await d.store.read(cid, jid);
    if (!pixels) {
      const polled = await d.provider.poll(requestId, cid, jid);
      if (polled.status === "queued" || polled.status === "generating")
        return statusResult(null, polled.status);
      if (polled.status === "failed") {
        const m = {
          ...videoDocumentMutation(
            snapshot,
            { ...v, status: "failed", failure: "provider" },
            row,
          ),
          requestId: jid,
        };
        return statusResult(await d.authority.lifecycle(m), "failed");
      }
      if (polled.status !== "ready") throw new VideoError("unavailable");
      pixels = polled.pixels;
      if (
        pixels.output.storagePath !== videoStoragePath(cid, jid) ||
        pixels.output.providerRequestId !== requestId ||
        pixels.output.bytes !== pixels.bytes.length ||
        checkedMp4(pixels.bytes) !== pixels.output.sha256
      )
        throw new VideoError("unavailable");
      // Concurrent polls may both download, but write once and read the same exact object.
      try {
        await d.store.put(cid, jid, pixels);
      } catch {
        const stored = await d.store.read(cid, jid);
        if (!stored || stored.output.sha256 !== pixels.output.sha256)
          throw new VideoError("unavailable");
        pixels = stored;
      }
    }
    if (!pixels) throw new VideoError("unavailable");
    snapshot = await d.authority.snapshot(cid);
    row = rowIn(snapshot, jid);
    v = parseSceneVideo(row)!;
    if (v.status === "ready")
      return statusResult(
        {
          id: row.id,
          campaign_id: cid,
          revision: row.revision,
          timeline: v.basis.timeline,
        },
        "ready",
      );
    if (
      v.status !== "generating" ||
      !videoIsCurrent(snapshot, v, await d.authority.source(cid)) ||
      pixels.output.storagePath !== videoStoragePath(cid, jid) ||
      pixels.output.providerRequestId !== requestId ||
      checkedMp4(pixels.bytes) !== pixels.output.sha256
    )
      throw new VideoError("conflict");
    const ready: SceneVideo = {
      ...v,
      status: "ready",
      failure: null,
      resultAssetId: jid,
    };
    const m = {
      ...videoDocumentMutation(snapshot, ready, row),
      requestId: jid,
    };
    const asset = {
      ...videoAssetMutation(snapshot, row, ready, pixels.output),
      requestId: row.current_version_id,
    };
    return statusResult(
      await d.authority.complete(m, asset, pixels.output),
      "ready",
    );
  }
  if (
    !exactKeys(value, ["action", "input"]) ||
    !["video.save", "video.dispatch"].includes(String(value.action))
  )
    throw new VideoError("validation");
  const m = mutation(value.input),
    v = parseSceneVideo(m.payload)!;
  await d.authority.authorize(m.campaignId);
  const receipt = await d.authority.receipt(m);
  if (receipt) return statusResult(receipt, v.status); // exact replay precedes mutable preflight and network
  if (value.action === "video.save") {
    if (v.status !== "queued" && v.status !== "cancelled")
      throw new VideoError("validation");
    return statusResult(await d.authority.lifecycle(m), v.status);
  }
  const policy = d.policy;
  if (
    !policy ||
    v.model !== policy.model ||
    v.dispatch?.reservationUsdMicros !== VIDEO_RESERVATION_USD_MICROS ||
    policy.reservationUsdMicros !== VIDEO_RESERVATION_USD_MICROS ||
    v.dispatch.requestId !== m.requestId ||
    v.status !== "generating" ||
    !m.payload.id
  )
    throw new VideoError("not_configured");
  const snapshot = await d.authority.snapshot(m.campaignId),
    row = rowIn(snapshot, m.payload.id),
    old = parseSceneVideo(row)!;
  if (
    old.status !== "queued" ||
    JSON.stringify({ ...old, status: "generating", dispatch: v.dispatch }) !==
      JSON.stringify(v) ||
    row.revision !== m.expectedRevision ||
    !videoIsCurrent(snapshot, v, await d.authority.source(m.campaignId))
  )
    throw new VideoError("conflict");
  const pixels = await d.store.frame(m.campaignId, v.source.assetId);
  if (
    !pixels ||
    !isFrameOutput(pixels.output) ||
    pixels.output.sha256 !== v.source.imageSha256 ||
    checkedPng(pixels.bytes) !== v.source.imageSha256
  )
    throw new VideoError("conflict");
  const claim = await d.authority.claim(m, policy.budgetId);
  if (!claim.claimed) return statusResult(claim.result, "generating");
  let requestId: string;
  try {
    requestId = await d.provider.submit(v, pixels.bytes);
  } catch (e) {
    if (e instanceof VideoError && e.code === "validation") {
      const latest = await d.authority.snapshot(m.campaignId),
        record = rowIn(latest, row.id);
      return statusResult(
        await d.authority.lifecycle({
          ...videoDocumentMutation(
            latest,
            { ...v, status: "failed", failure: "provider" },
            record,
          ),
          requestId: row.id,
        }),
        "failed",
        true,
      );
    }
    // Connection/response loss holds the reservation and unknown result. No automatic submit.
    return statusResult(claim.result, "uncertain", true);
  }
  await d.authority.submission(m.campaignId, row.id, requestId);
  return statusResult(claim.result, "generating", true);
}
