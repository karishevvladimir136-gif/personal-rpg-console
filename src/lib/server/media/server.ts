import "server-only";
import { createClient } from "@supabase/supabase-js";
import { authorizeCampaign } from "../campaign-authorization";
import { readCampaign } from "../repository";
import { readMutationReceipt } from "../mutation-receipt";
import { databaseError, PersistenceError } from "../errors";
import { isUuid } from "../../persistence/validation";
import { isTimelineFence, sameTimeline } from "../../saves/fence";
import type { Mutation, MutationResult } from "../../persistence/contracts";
import {
  buildRealFrame,
  exactKeys,
  IMAGE_MODELS,
  safeFrameAsset,
  frameStoragePath,
  isFrameOutput,
  parseRealFrame,
} from "../../visual-frame/real-frame";
import type {
  FrameSourceAuthority,
  ImageModel,
} from "../../visual-frame/real-frame";
import { executeMediaFrame } from "./orchestration";
import type {
  MediaFrameAuthority,
  MediaPolicy,
  MediaStore,
} from "./orchestration";
import { FRAME_RESERVATION_USD_MICROS } from "./pricing";
import { openAiFrameVerifier } from "./grounding";
import {
  FRAME_CHECK_MODEL,
  FRAME_CHECK_REASONING,
  FRAME_CHECK_RESERVATION_USD_MICROS,
  isFrameCheckResult,
} from "./grounding-state";
import { openAiFrameProvider } from "./provider";
import { checkedPng, storedPixels, MAX_FRAME_IMAGE_BYTES } from "./png";
import {
  buildSubjectVisualJob,
  parseSubjectVisualJob,
  safeSubjectVisualAsset,
} from "../../visual-frame/subject-job";
import type { PublicVisualSubject } from "../../visual-frame/subject-visual";

function serviceClient(ownerId: string) {
  const url = process.env.SUPABASE_URL,
    key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (
    !url ||
    !key ||
    !isUuid(ownerId) ||
    ownerId !== process.env.RPG_OWNER_USER_ID
  )
    throw new PersistenceError("not_configured");
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
function policy(): MediaPolicy | null {
  const model = process.env.RPG_FRAME_MODEL,
    budgetId = process.env.RPG_MEDIA_BUDGET_ID;
  if (
    process.env.RPG_FRAME_ENABLED !== "true" ||
    !IMAGE_MODELS.includes(model as ImageModel) ||
    !isUuid(budgetId) ||
    !process.env.OPENAI_API_KEY ||
    process.env.RPG_FRAME_VERIFY_MODEL !== FRAME_CHECK_MODEL ||
    process.env.RPG_FRAME_VERIFY_REASONING !== FRAME_CHECK_REASONING
  )
    return null;
  return {
    model: model as ImageModel,
    budgetId,
    parameters: {
      size: "1536x1024",
      quality: "high",
      outputFormat: "png",
      n: 1,
    },
    reservationUsdMicros: FRAME_RESERVATION_USD_MICROS,
  };
}
function result(value: unknown, input: Mutation): MutationResult {
  if (
    !value ||
    typeof value !== "object" ||
    !("campaignId" in input) ||
    !isTimelineFence(input.timeline)
  )
    throw new PersistenceError("unavailable");
  const v = value as MutationResult;
  if (
    !isUuid(v.id) ||
    !Number.isSafeInteger(v.revision) ||
    v.revision < 1 ||
    v.campaign_id !== input.campaignId ||
    !isTimelineFence(v.timeline) ||
    !sameTimeline(v.timeline, input.timeline)
  )
    throw new PersistenceError("unavailable");
  return {
    id: v.id,
    revision: v.revision,
    campaign_id: v.campaign_id,
    timeline: v.timeline,
  };
}
async function basis(
  ownerId: string,
  campaignId: string,
): Promise<FrameSourceAuthority> {
  const snapshot = await readCampaign(campaignId);
  if (!isTimelineFence(snapshot.timeline))
    throw new PersistenceError("conflict");
  const response = await serviceClient(ownerId).rpc("rpg_frame_basis", {
    p_owner_id: ownerId,
    p_campaign_id: campaignId,
    p_timeline: snapshot.timeline,
  });
  if (response.error) throw databaseError(response.error);
  const v: unknown = response.data;
  if (
    !exactKeys(v, ["expectedHeadId", "canonGeneration"]) ||
    !(v.expectedHeadId === null || isUuid(v.expectedHeadId)) ||
    !Number.isSafeInteger(v.canonGeneration) ||
    (v.canonGeneration as number) < 0
  )
    throw new PersistenceError("unavailable");
  return v as FrameSourceAuthority;
}
function isSubjectVisualMutation(input: Mutation): boolean {
  return input.operation === "document.save" && Boolean(parseSubjectVisualJob(input.payload));
}
function authority(): MediaFrameAuthority {
  let ownerId: string | null = null;
  const owner = () => {
    if (!ownerId) throw new PersistenceError("forbidden");
    return ownerId;
  };
  return {
    authorize: async (campaignId) => {
      ownerId = (await authorizeCampaign(campaignId)).user.id;
    },
    receipt: (input) => readMutationReceipt(owner(), input),
    snapshot: readCampaign,
    source: (campaignId) => basis(owner(), campaignId),
    lifecycle: async (input) => {
      const id = owner(),
        response = await serviceClient(id).rpc(isSubjectVisualMutation(input) ? "rpg_subject_visual_lifecycle" : "rpg_real_frame_lifecycle", {
          p_owner_id: id,
          p_mutation: input,
        });
      if (response.error) throw databaseError(response.error);
      return result(response.data, input);
    },
    claim: async (input, budgetId) => {
      const id = owner(),
        response = await serviceClient(id).rpc(isSubjectVisualMutation(input) ? "rpg_subject_visual_claim" : "rpg_real_frame_claim", {
          p_owner_id: id,
          p_mutation: input,
          p_budget_id: budgetId,
        });
      if (response.error) throw databaseError(response.error);
      if (
        !exactKeys(response.data, ["result", "claimed"]) ||
        typeof response.data.claimed !== "boolean"
      )
        throw new PersistenceError("unavailable");
      return {
        result: result(response.data.result, input),
        claimed: response.data.claimed,
      };
    },
    checkClaim: async (input) => {
      const id = owner(),
        response = await serviceClient(id).rpc("rpg_frame_check_claim", {
          p_owner_id: id,
          p_campaign_id: input.campaignId,
          p_job_id: input.jobId,
          p_job_version_id: input.jobVersionId,
          p_image_sha256: input.imageSha256,
        });
      if (response.error) throw databaseError(response.error);
      if (
        !exactKeys(response.data, ["claimed", "result"]) ||
        typeof response.data.claimed !== "boolean" ||
        !(
          response.data.result === null ||
          isFrameCheckResult(response.data.result)
        )
      )
        throw new PersistenceError("unavailable");
      return { claimed: response.data.claimed, result: response.data.result };
    },
    checkComplete: async (input, checked) => {
      if (!isFrameCheckResult(checked))
        throw new PersistenceError("validation");
      const id = owner(),
        response = await serviceClient(id).rpc("rpg_frame_check_complete", {
          p_owner_id: id,
          p_campaign_id: input.campaignId,
          p_job_id: input.jobId,
          p_job_version_id: input.jobVersionId,
          p_image_sha256: input.imageSha256,
          p_result: checked,
        });
      if (response.error) throw databaseError(response.error);
      if (!isFrameCheckResult(response.data))
        throw new PersistenceError("unavailable");
      return response.data;
    },
    recoveryReceipt: async (input) => {
      const id = owner(),
        response = await serviceClient(id).rpc(
          isSubjectVisualMutation(input) ? "rpg_subject_visual_recovery_receipt" : "rpg_real_frame_recovery_receipt",
          { p_owner_id: id, p_intent: input },
        );
      if (response.error) throw databaseError(response.error);
      return response.data === null ? null : result(response.data, input);
    },
    draft: async (input, output) => {
      const id = owner(),
        response = await serviceClient(id).rpc(isSubjectVisualMutation(input) ? "rpg_subject_visual_draft" : "rpg_real_frame_draft", {
          p_owner_id: id,
          p_mutation: input,
          p_output: output,
        });
      if (response.error) throw databaseError(response.error);
      return result(response.data, input);
    },
    complete: async (input, asset, output) => {
      const id = owner(),
        response = await serviceClient(id).rpc(isSubjectVisualMutation(input) ? "rpg_subject_visual_complete" : "rpg_real_frame_complete", {
          p_owner_id: id,
          p_mutation: input,
          p_asset: asset,
          p_output: output,
        });
      if (response.error) throw databaseError(response.error);
      return result(response.data, input);
    },
  };
}
function privateStore(): MediaStore {
  // Authenticated service delegates each canonical scoped object operation. No arbitrary provider URL download.
  return {
    async read(campaignId, jobId) {
      const { user } = await authorizeCampaign(campaignId);
      const response = await serviceClient(user.id)
        .storage.from("rpg-media")
        .download(frameStoragePath(campaignId, jobId));
      if (response.error) {
        if (
          String(response.error.status) === "404" ||
          response.error.message === "Object not found"
        )
          return null;
        throw new PersistenceError("unavailable");
      }
      if (
        !response.data ||
        response.data.size > MAX_FRAME_IMAGE_BYTES ||
        response.data.type !== "image/png"
      )
        throw new PersistenceError("unavailable");
      const bytes = new Uint8Array(await response.data.arrayBuffer());
      const pixels = storedPixels(campaignId, jobId, bytes);
      const info = await serviceClient(user.id)
        .storage.from("rpg-media")
        .info(frameStoragePath(campaignId, jobId));
      if (info.error) throw new PersistenceError("unavailable");
      const metadata: unknown = info.data.metadata?.frameOutput;
      if (metadata !== undefined) {
        if (
          !isFrameOutput(metadata) ||
          metadata.sha256 !== pixels.output.sha256 ||
          metadata.bytes !== pixels.output.bytes ||
          metadata.storagePath !== pixels.output.storagePath
        )
          throw new PersistenceError("unavailable");
        pixels.output = metadata;
      }
      return pixels;
    },
    async put(campaignId, jobId, pixels) {
      const { user } = await authorizeCampaign(campaignId);
      if (
        pixels.output.storagePath !== frameStoragePath(campaignId, jobId) ||
        pixels.output.bytes !== pixels.bytes.byteLength ||
        checkedPng(pixels.bytes) !== pixels.output.sha256
      )
        throw new PersistenceError("validation");
      const response = await serviceClient(user.id)
        .storage.from("rpg-media")
        .upload(pixels.output.storagePath, pixels.bytes, {
          contentType: "image/png",
          upsert: false,
          cacheControl: "3600",
          metadata: { frameOutput: pixels.output },
        });
      if (response.error) throw new PersistenceError("unavailable");
    },
  };
}
export async function mediaCapability(campaignId: string) {
  await authorizeCampaign(campaignId);
  const selected = policy();
  return {
    enabled: selected !== null,
    model: selected?.model ?? null,
    parameters: selected?.parameters ?? null,
    reservationUsdMicros: selected?.reservationUsdMicros ?? null,
    verificationReservationUsdMicros: selected
      ? FRAME_CHECK_RESERVATION_USD_MICROS
      : null,
    totalReservationUsdMicros: selected
      ? selected.reservationUsdMicros + FRAME_CHECK_RESERVATION_USD_MICROS
      : null,
    imageReferencesEnabled: false,
  };
}
export async function prepareMediaFrame(value: unknown) {
  if (
    !exactKeys(value, [
      "campaignId",
      "timeline",
      "expectedPublicStateRevision",
      "referenceIds",
      "composition",
      "retryOf",
    ]) ||
    !isUuid(value.campaignId) ||
    !isTimelineFence(value.timeline) ||
    !Number.isSafeInteger(value.expectedPublicStateRevision) ||
    !Array.isArray(value.referenceIds) ||
    value.referenceIds.some((id) => !isUuid(id)) ||
    !["wide", "portrait", "location", "item"].includes(
      String(value.composition),
    ) ||
    !(value.retryOf === null || isUuid(value.retryOf))
  )
    throw new PersistenceError("validation");
  const { user } = await authorizeCampaign(value.campaignId);
  const selected = policy();
  if (!selected) throw new PersistenceError("not_configured");
  const snapshot = await readCampaign(value.campaignId);
  if (
    !sameTimeline(snapshot.timeline, value.timeline) ||
    snapshot.publicState.revision !== value.expectedPublicStateRevision
  )
    throw new PersistenceError("conflict");
  return buildRealFrame(
    snapshot,
    value.referenceIds as string[],
    value.composition as "wide" | "portrait" | "location" | "item",
    selected.model,
    selected.parameters,
    await basis(user.id, value.campaignId),
    value.retryOf as string | null,
  );
}
export async function prepareSubjectVisual(value: unknown) {
  if (
    !exactKeys(value, [
      "campaignId", "timeline", "expectedPublicStateRevision", "subject",
      "referenceIds", "retryOf",
    ]) ||
    !isUuid(value.campaignId) ||
    !isTimelineFence(value.timeline) ||
    !Number.isSafeInteger(value.expectedPublicStateRevision) ||
    !exactKeys(value.subject, ["kind", "id"]) ||
    !["entity", "item", "location"].includes(String(value.subject.kind)) ||
    !isUuid(value.subject.id) ||
    !Array.isArray(value.referenceIds) ||
    value.referenceIds.some((id) => !isUuid(id)) ||
    !(value.retryOf === null || isUuid(value.retryOf))
  )
    throw new PersistenceError("validation");
  const { user } = await authorizeCampaign(value.campaignId);
  const selected = policy();
  if (!selected) throw new PersistenceError("not_configured");
  const snapshot = await readCampaign(value.campaignId);
  if (
    !sameTimeline(snapshot.timeline, value.timeline) ||
    snapshot.publicState.revision !== value.expectedPublicStateRevision
  )
    throw new PersistenceError("conflict");
  return buildSubjectVisualJob(
    snapshot,
    value.subject as PublicVisualSubject,
    value.referenceIds as string[],
    selected.model,
    selected.parameters,
    await basis(user.id, value.campaignId),
    value.retryOf as string | null,
  );
}
export async function runMediaFrame(value: unknown) {
  // The production adapter is closed by default. Only an explicit authenticated dispatch reaches generate().
  return executeMediaFrame(value, {
    authority: authority(),
    policy: policy(),
    store: privateStore(),
    provider: openAiFrameProvider(process.env.OPENAI_API_KEY ?? ""),
    verifier: openAiFrameVerifier({
      apiKey: process.env.OPENAI_API_KEY ?? "",
      model: process.env.RPG_FRAME_VERIFY_MODEL ?? "",
      reasoning: process.env.RPG_FRAME_VERIFY_REASONING,
    }),
  });
}
export async function signedFrameImage(campaignId: string, assetId: string) {
  if (!isUuid(campaignId) || !isUuid(assetId))
    throw new PersistenceError("not_found");
  const { user } = await authorizeCampaign(campaignId);
  const snapshot = await readCampaign(campaignId);
  const asset = snapshot.assets.find(
    (a) => a.id === assetId && a.campaign_id === campaignId,
  );
  if (!asset || !(safeFrameAsset(snapshot, asset) || safeSubjectVisualAsset(snapshot, asset)) || !asset.storage_path)
    throw new PersistenceError("not_found");
  const response = await serviceClient(user.id)
    .storage.from("rpg-media")
    .createSignedUrl(asset.storage_path, 300);
  if (response.error || !response.data?.signedUrl)
    throw new PersistenceError("unavailable");
  return response.data.signedUrl;
}

/** Draft pixels are authorized review evidence, never ordinary accepted Assets. */
export async function signedFrameDraft(campaignId: string, jobId: string) {
  if (!isUuid(campaignId) || !isUuid(jobId))
    throw new PersistenceError("not_found");
  const { user } = await authorizeCampaign(campaignId);
  const snapshot = await readCampaign(campaignId);
  const record = snapshot.documents.find(
    (d) =>
      d.campaign_id === campaignId &&
      d.id === jobId &&
      d.status === "reference",
  );
  const frame = record && (parseRealFrame(record) ?? parseSubjectVisualJob(record));
  if (
    !record ||
    !frame || ![4, 5].includes(frame.schema) ||
    frame.status !== "draft" ||
    !frame.review
  )
    throw new PersistenceError("not_found");
  const check = await serviceClient(user.id).rpc(frame.schema === 5 ? "rpg_subject_visual_draft_pixels" : "rpg_frame_draft_pixels", {
    p_owner_id: user.id,
    p_campaign_id: campaignId,
    p_job_id: jobId,
  });
  if (check.error) throw databaseError(check.error);
  if (
    !exactKeys(check.data, ["storagePath", "imageSha256"]) ||
    check.data.storagePath !== frameStoragePath(campaignId, jobId) ||
    check.data.imageSha256 !== frame.review.imageSha256
  )
    throw new PersistenceError("not_found");
  const response = await serviceClient(user.id)
    .storage.from("rpg-media")
    .createSignedUrl(frameStoragePath(campaignId, jobId), 60);
  if (response.error || !response.data?.signedUrl)
    throw new PersistenceError("unavailable");
  return response.data.signedUrl;
}
