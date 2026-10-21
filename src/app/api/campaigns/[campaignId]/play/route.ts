import { readPlay } from "@/lib/server/gameplay-service";
import { publicJson } from "@/lib/persistence/route-response";
import { gameplayErrorResponse } from "@/lib/gameplay/http-response";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  context: { params: Promise<{ campaignId: string }> },
) {
  try {
    const { campaignId } = await context.params;
    // Fix S3-pre (KF-hidden-layer): the Settings screen's read («?for=settings») never schedules the DM's prep.
    const forSettings = new URL(request.url).searchParams.get("for") === "settings";
    return publicJson(await readPlay(campaignId, forSettings ? { prep: false } : {}));
  } catch (cause) {
    return gameplayErrorResponse(cause);
  }
}
