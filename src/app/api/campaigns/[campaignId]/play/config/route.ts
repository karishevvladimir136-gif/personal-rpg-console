import { configurePlay } from "@/lib/server/gameplay-service";
import { publicJson } from "@/lib/persistence/route-response";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { gameplayErrorResponse } from "@/lib/gameplay/http-response";
export const runtime = "nodejs";
export async function POST(
  request: Request,
  context: { params: Promise<{ campaignId: string }> },
) {
  try {
    const { campaignId } = await context.params;
    return publicJson(
      await configurePlay(campaignId, await readWriteRequest(request)),
    );
  } catch (cause) {
    return gameplayErrorResponse(cause);
  }
}
