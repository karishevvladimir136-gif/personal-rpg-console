import { readMemory } from "@/lib/server/memory/service";
import { publicJson } from "@/lib/persistence/route-response";
import { gameplayErrorResponse } from "@/lib/gameplay/http-response";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  context: { params: Promise<{ campaignId: string }> },
) {
  try {
    return publicJson(await readMemory((await context.params).campaignId));
  } catch (cause) {
    return gameplayErrorResponse(cause);
  }
}
