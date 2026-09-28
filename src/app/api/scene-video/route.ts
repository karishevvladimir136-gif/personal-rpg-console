import { readWriteRequest } from "@/lib/persistence/http-policy";
import { publicJson, errorResponse } from "@/lib/persistence/route-response";
import { exactKeys } from "@/lib/visual-frame/real-frame";
import {
  videoCapability,
  prepareSceneVideo,
  runSceneVideo,
  signedSceneVideo,
} from "@/lib/server/media/video-server";
export const maxDuration = 120; // Short queue submit / bounded same-ID status, result and storage reads.
export async function POST(request: Request) {
  try {
    const value = await readWriteRequest(request);
    if (
      exactKeys(value, ["action", "input"]) &&
      value.action === "video.prepare"
    )
      return publicJson(await prepareSceneVideo(value.input));
    return publicJson(await runSceneVideo(value));
  } catch (e) {
    return errorResponse(e);
  }
}
export async function GET(request: Request) {
  try {
    const u = new URL(request.url),
      cid = u.searchParams.get("campaignId") ?? "";
    if (u.searchParams.get("action") === "capability")
      return publicJson(await videoCapability(cid));
    const url = await signedSceneVideo(
      cid,
      u.searchParams.get("assetId") ?? "",
    );
    return new Response(null, {
      status: 302,
      headers: {
        Location: url,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
