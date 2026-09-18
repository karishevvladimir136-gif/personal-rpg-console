import { continueTurn } from "@/lib/server/gameplay-service";
import { publicJson } from "@/lib/persistence/route-response";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { gameplayErrorResponse } from "@/lib/gameplay/http-response";
export const runtime = "nodejs";
export const maxDuration = 180;
export async function POST(
  request: Request,
  context: { params: Promise<{ campaignId: string; operationId: string }> },
) {
  try {
    const { campaignId, operationId } = await context.params;
    return publicJson(
      await continueTurn(
        campaignId,
        operationId,
        await readWriteRequest(request),
      ),
    );
  } catch (cause) {
    return gameplayErrorResponse(cause);
  }
}
