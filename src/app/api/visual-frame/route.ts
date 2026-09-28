import { saveVisualFrame } from "@/lib/visual-frame/server";
import {
  mediaCapability,
  prepareMediaFrame,
  runMediaFrame,
  signedFrameImage,
} from "@/lib/server/media/server";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { publicJson, errorResponse } from "@/lib/persistence/route-response";
import { exactKeys } from "@/lib/visual-frame/real-frame";
export const maxDuration = 240; // Image deadline + bounded foreground visual QA + storage/receipt overhead.

export async function POST(request: Request) {
  try {
    const value = await readWriteRequest(request);
    if (
      exactKeys(value, ["action", "input"]) &&
      value.action === "media.prepare"
    )
      return publicJson(await prepareMediaFrame(value.input));
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
    const signed = await signedFrameImage(
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
