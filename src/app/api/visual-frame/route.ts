import { saveVisualFrame } from "@/lib/visual-frame/server";
import {
  mediaCapability,
  prepareMediaFrame,
  prepareSubjectVisual,
  prepareMapVisual,
  runMediaFrame,
  signedFrameImage,
  signedFrameDraft,
} from "@/lib/server/media/server";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { imageProviderCapability } from "@/lib/server/media/fal-image-provider";
import { after } from "next/server";
import {
  activatePictureStyle,
  clearPictureStyle,
  hidePicture,
  readPictureBoard,
  savePictureSettings,
  savePictureStyle,
  saveVisualProfile,
  signedPictureUrl,
  signedStyleReferenceUrl,
} from "@/lib/server/media/pictures-store";
import { autopilotStep, draftVisualProfile, requestAnchor, requestFrame, restyleCampaign, type Schedule } from "@/lib/server/media/pictures-service";
import { publicJson, errorResponse } from "@/lib/persistence/route-response";
import { exactKeys } from "@/lib/visual-frame/real-frame";
import { PersistenceError } from "@/lib/server/errors";
export const maxDuration = 240; // Image deadline + bounded foreground visual QA + storage/receipt overhead.

export async function POST(request: Request) {
  try {
    const value = await readWriteRequest(request);
    if (exactKeys(value, ["action", "campaignId", "input"]) && typeof value.action === "string" && value.action.startsWith("pictures.") && typeof value.campaignId === "string")
      return publicJson(await picturesAction(value.action, value.campaignId, value.input));
    if (
      exactKeys(value, ["action", "input"]) &&
      value.action === "media.prepare"
    )
      return publicJson(await prepareMediaFrame(value.input));
    if (
      exactKeys(value, ["action", "input"]) &&
      value.action === "media.prepareSubject"
    )
      return publicJson(await prepareSubjectVisual(value.input));
    if (
      exactKeys(value, ["action", "input"]) &&
      value.action === "media.prepareMap"
    )
      return publicJson(await prepareMapVisual(value.input));
    if (
      value &&
      typeof value === "object" &&
      "action" in value &&
      typeof value.action === "string" &&
      value.action.startsWith("media.")
    )
      return publicJson(await runMediaFrame(value));
    return publicJson(await saveVisualFrame(value));
  } catch (error) {
    return errorResponse(error);
  }
}
export async function GET(request: Request) {
  try {
    const url = new URL(request.url),
      campaignId = url.searchParams.get("campaignId") ?? "";
    if (url.searchParams.get("action") === "capability")
      return publicJson(await mediaCapability(campaignId));
    if (url.searchParams.get("action") === "image-providers")
      return publicJson(await imageProviderCapability(campaignId));
    if (url.searchParams.get("action") === "pictures")
      return publicJson(await readPictureBoard(campaignId));
    if (url.searchParams.get("action") === "picture" || url.searchParams.get("action") === "style-reference") {
      const signed = url.searchParams.get("action") === "picture"
        ? await signedPictureUrl(campaignId, url.searchParams.get("pictureId") ?? "")
        : await signedStyleReferenceUrl(campaignId, url.searchParams.get("styleId") ?? "");
      return new Response(null, { status: 302, headers: { Location: signed, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
    }
    const signed =
      url.searchParams.get("action") === "draft"
        ? await signedFrameDraft(
            campaignId,
            url.searchParams.get("jobId") ?? "",
          )
        : await signedFrameImage(
            campaignId,
            url.searchParams.get("assetId") ?? "",
          );
    return new Response(null, {
      status: 302,
      headers: {
        Location: signed,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// Stage V pictures: the paid work runs after the response (a turn never waits for a picture).
const schedule: Schedule = (work) => after(() => work().catch((error) => console.error(JSON.stringify({ event: "picture_job_failed", message: String((error as Error)?.message ?? error).slice(0, 200) }))));
async function picturesAction(action: string, campaignId: string, input: unknown) {
  switch (action) {
    case "pictures.frame": return requestFrame(campaignId, input, schedule);
    case "pictures.anchor": return requestAnchor(campaignId, input, schedule);
    case "pictures.autopilot": return autopilotStep(campaignId, schedule);
    case "pictures.restyle": return restyleCampaign(campaignId, input, schedule);
    case "pictures.settings": return savePictureSettings(campaignId, input);
    case "pictures.style.save": return savePictureStyle(campaignId, input);
    case "pictures.style.activate": return activatePictureStyle(campaignId, input);
    case "pictures.style.clear": return clearPictureStyle(campaignId, input);
    case "pictures.hide": return hidePicture(campaignId, input);
    case "pictures.profile.save": return saveVisualProfile(campaignId, input);
    case "pictures.profile.draft": return draftVisualProfile(campaignId, input);
    default: throw new PersistenceError("validation");
  }
}
