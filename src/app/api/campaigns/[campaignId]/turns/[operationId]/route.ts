import { readTurn } from "@/lib/server/gameplay-service";
import { publicJson } from "@/lib/persistence/route-response";
import { gameplayErrorResponse } from "@/lib/gameplay/http-response";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  context: { params: Promise<{ campaignId: string; operationId: string }> },
) {
  try {
    const { campaignId, operationId } = await context.params;
    return publicJson(await readTurn(campaignId, operationId));
  } catch (cause) {
    return gameplayErrorResponse(cause);
  }
}
