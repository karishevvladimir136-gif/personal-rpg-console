import "server-only";
import { createClient } from "@supabase/supabase-js";
import { authorizeCampaign } from "../campaign-authorization";
import { readCampaign } from "../repository";
import { readMutationReceipt } from "../mutation-receipt";
import { PersistenceError, databaseError } from "../errors";
import { isUuid } from "../../persistence/validation";
import { isTimelineFence, sameTimeline } from "../../saves/fence";
import type { Mutation, MutationResult } from "../../persistence/contracts";
import {
  exactKeys,
  frameStoragePath,
  ownerAcceptedFrameAsset,
} from "../../visual-frame/real-frame";
import {
  buildSceneVideo,
  VIDEO_MODEL,
  VIDEO_PARAMETERS,
  VIDEO_RESERVATION_USD_MICROS,
  isVideoOutput,
  videoStoragePath,
  safeVideoAsset,
} from "../../scene-video/model";
import type { FrameSourceAuthority } from "../../visual-frame/real-frame";
import { executeSceneVideo } from "./video-orchestration";
import type {
  VideoPolicy,
  VideoAuthority,
  VideoDependencies,
} from "./video-orchestration";
import {
  falVideoProvider,
  checkedMp4,
  MAX_VIDEO_BYTES,
} from "./video-provider";
import { storedPixels } from "./png";
function service(owner: string) {
  const url = process.env.SUPABASE_URL,
    key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !isUuid(owner) || owner !== process.env.RPG_OWNER_USER_ID)
    throw new PersistenceError("not_configured");
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
function policy(): VideoPolicy | null {
  return process.env.RPG_VIDEO_ENABLED === "true" &&
    process.env.RPG_VIDEO_MODEL === VIDEO_MODEL &&
    process.env.FAL_KEY &&
    isUuid(process.env.RPG_MEDIA_BUDGET_ID)
    ? {
        model: VIDEO_MODEL,
        budgetId: process.env.RPG_MEDIA_BUDGET_ID!,
        reservationUsdMicros: VIDEO_RESERVATION_USD_MICROS,
      }
    : null;
}
function result(value: unknown, m: Mutation): MutationResult {
  const v = value as MutationResult;
  if (
    !v ||
    !("campaignId" in m) ||
    !isUuid(v.id) ||
    !Number.isSafeInteger(v.revision) ||
    v.revision < 1 ||
    v.campaign_id !== m.campaignId ||
    !isTimelineFence(v.timeline) ||
    !sameTimeline(v.timeline, m.timeline)
  )
    throw new PersistenceError("unavailable");
  return {
    id: v.id,
    revision: v.revision,
    campaign_id: v.campaign_id,
    timeline: v.timeline,
  };
}
async function rpc(owner: string, name: string, args: Record<string, unknown>) {
  const response = await service(owner).rpc(name, {
    p_owner_id: owner,
    ...args,
  });
  if (response.error) throw databaseError(response.error);
  return response.data;
}
function source(v: unknown): FrameSourceAuthority {
  if (
    !exactKeys(v, ["expectedHeadId", "canonGeneration"]) ||
    !(v.expectedHeadId === null || isUuid(v.expectedHeadId)) ||
    !Number.isSafeInteger(v.canonGeneration) ||
    (v.canonGeneration as number) < 0
  )
    throw new PersistenceError("unavailable");
  return v as FrameSourceAuthority;
}
function authority(): VideoAuthority {
  let owner = "";
  const own = () => {
    if (!owner) throw new PersistenceError("forbidden");
    return owner;
  };
  return {
    authorize: async (cid) => {
      owner = (await authorizeCampaign(cid)).user.id;
    },
    receipt: (m) => readMutationReceipt(own(), m),
    snapshot: readCampaign,
    source: async (cid) => {
      const s = await readCampaign(cid);
      return source(
        await rpc(own(), "rpg_frame_basis", {
          p_campaign_id: cid,
          p_timeline: s.timeline,
        }),
      );
    },
    lifecycle: async (m) =>
      result(await rpc(own(), "rpg_video_lifecycle", { p_mutation: m }), m),
    claim: async (m, bid) => {
      const v = await rpc(own(), "rpg_video_claim", {
        p_mutation: m,
        p_budget_id: bid,
      });
      if (
        !exactKeys(v, ["result", "claimed"]) ||
        typeof v.claimed !== "boolean"
      )
        throw new PersistenceError("unavailable");
      return { result: result(v.result, m), claimed: v.claimed };
    },
    submission: async (cid, jid, rid) => {
      const v = await rpc(own(), "rpg_video_submission", {
        p_campaign_id: cid,
        p_job_id: jid,
        p_provider_request_id: rid ?? null,
      });
      if (v !== null && !isUuid(v)) throw new PersistenceError("unavailable");
      return v;
    },
    complete: async (m, asset, output) =>
      result(
        await rpc(own(), "rpg_video_complete", {
          p_mutation: m,
          p_asset: asset,
          p_output: output,
        }),
        m,
      ),
  };
}
function store(): VideoDependencies["store"] {
  async function bucket(cid: string) {
    const { user } = await authorizeCampaign(cid);
    return service(user.id).storage.from("rpg-media");
  }
  return {
    async frame(cid, aid) {
      const snapshot = await readCampaign(cid),
        asset = snapshot.assets.find(
          (a) => a.id === aid && a.campaign_id === cid,
        );
      if (!asset || !ownerAcceptedFrameAsset(snapshot, asset))
        throw new PersistenceError("conflict");
      const r = await (await bucket(cid)).download(frameStoragePath(cid, aid));
      if (
        r.error ||
        !r.data ||
        r.data.size > 12_000_000 ||
        r.data.type !== "image/png"
      )
        throw new PersistenceError("unavailable");
      return storedPixels(cid, aid, new Uint8Array(await r.data.arrayBuffer()));
    },
    async read(cid, jid) {
      const b = await bucket(cid),
        r = await b.download(videoStoragePath(cid, jid));
      if (r.error) {
        if (
          String(r.error.status) === "404" ||
          r.error.message === "Object not found"
        )
          return null;
        throw new PersistenceError("unavailable");
      }
      if (
        !r.data ||
        r.data.size > MAX_VIDEO_BYTES ||
        r.data.type !== "video/mp4"
      )
        throw new PersistenceError("unavailable");
      const bytes = new Uint8Array(await r.data.arrayBuffer()),
        info = await b.info(videoStoragePath(cid, jid));
      const output: unknown = info.data?.metadata?.videoOutput;
      if (
        info.error ||
        !isVideoOutput(output) ||
        output.storagePath !== videoStoragePath(cid, jid) ||
        output.bytes !== bytes.length ||
        output.sha256 !== checkedMp4(bytes)
      )
        throw new PersistenceError("unavailable");
      return { bytes, output };
    },
    async put(cid, jid, pixels) {
      if (
        !isVideoOutput(pixels.output) ||
        pixels.output.storagePath !== videoStoragePath(cid, jid) ||
        pixels.output.bytes !== pixels.bytes.length ||
        checkedMp4(pixels.bytes) !== pixels.output.sha256
      )
        throw new PersistenceError("validation");
      const r = await (
        await bucket(cid)
      ).upload(pixels.output.storagePath, pixels.bytes, {
        upsert: false,
        contentType: "video/mp4",
        cacheControl: "3600",
        metadata: { videoOutput: pixels.output },
      });
      if (r.error) throw new PersistenceError("unavailable");
    },
  };
}
export async function videoCapability(cid: string) {
  await authorizeCampaign(cid);
  const p = policy();
  return {
    enabled: p !== null,
    model: p?.model ?? null,
    parameters: p ? { ...VIDEO_PARAMETERS } : null,
    reservationUsdMicros: p?.reservationUsdMicros ?? null,
  };
}
export async function prepareSceneVideo(value: unknown) {
  if (
    !exactKeys(value, [
      "campaignId",
      "timeline",
      "expectedPublicStateRevision",
      "sourceAssetId",
      "retryOf",
    ]) ||
    !isUuid(value.campaignId) ||
    !isTimelineFence(value.timeline) ||
    !Number.isSafeInteger(value.expectedPublicStateRevision) ||
    !isUuid(value.sourceAssetId) ||
    !(value.retryOf === null || isUuid(value.retryOf))
  )
    throw new PersistenceError("validation");
  const { user } = await authorizeCampaign(value.campaignId);
  if (!policy()) throw new PersistenceError("not_configured");
  const s = await readCampaign(value.campaignId);
  if (
    !sameTimeline(s.timeline, value.timeline) ||
    s.publicState.revision !== value.expectedPublicStateRevision
  )
    throw new PersistenceError("conflict");
  const proof = source(
    await rpc(user.id, "rpg_video_source", {
      p_campaign_id: value.campaignId,
      p_asset_id: value.sourceAssetId,
    }),
  );
  return buildSceneVideo(
    s,
    value.sourceAssetId,
    proof,
    value.retryOf as string | null,
  );
}
export async function runSceneVideo(value: unknown) {
  return executeSceneVideo(value, {
    authority: authority(),
    policy: policy(),
    provider: falVideoProvider(process.env.FAL_KEY ?? ""),
    store: store(),
  });
}
export async function signedSceneVideo(cid: string, aid: string) {
  if (!isUuid(cid) || !isUuid(aid)) throw new PersistenceError("not_found");
  const { user } = await authorizeCampaign(cid);
  const s = await readCampaign(cid),
    a = s.assets.find((a) => a.id === aid && a.campaign_id === cid);
  if (!a || !safeVideoAsset(s, a)) throw new PersistenceError("not_found");
  const output = await rpc(user.id, "rpg_video_pixels", {
    p_campaign_id: cid,
    p_asset_id: aid,
  });
  if (
    !isVideoOutput(output) ||
    output.storagePath !== videoStoragePath(cid, aid)
  )
    throw new PersistenceError("not_found");
  const r = await service(user.id)
    .storage.from("rpg-media")
    .createSignedUrl(output.storagePath, 300);
  if (r.error || !r.data?.signedUrl) throw new PersistenceError("unavailable");
  return r.data.signedUrl;
}
