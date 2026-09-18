import { submitTurn } from "@/lib/server/gameplay-service";
import { publicJson } from "@/lib/persistence/route-response";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { gameplayErrorResponse } from "@/lib/gameplay/http-response";
export const runtime = "nodejs";
export const maxDuration = 180;
export async function POST(
  request: Request,
  context: { params: Promise<{ campaignId: string }> },
) {
  try {
    const { campaignId } = await context.params;
    return publicJson(
      await submitTurn(campaignId, await readWriteRequest(request)),
    );
  } catch (cause) {
    return gameplayErrorResponse(cause);
  }
}
