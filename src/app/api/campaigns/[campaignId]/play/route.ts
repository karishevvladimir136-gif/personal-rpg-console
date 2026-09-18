import { readPlay } from "@/lib/server/gameplay-service";
import { publicJson } from "@/lib/persistence/route-response";
import { gameplayErrorResponse } from "@/lib/gameplay/http-response";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  context: { params: Promise<{ campaignId: string }> },
) {
  try {
    const { campaignId } = await context.params;
    return publicJson(await readPlay(campaignId));
  } catch (cause) {
    return gameplayErrorResponse(cause);
  }
}
