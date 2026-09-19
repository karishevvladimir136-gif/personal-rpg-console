import { readSaves } from "@/lib/server/saves/service";
import { publicJson, errorResponse } from "@/lib/persistence/route-response";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  context: { params: Promise<{ campaignId: string }> },
) {
  try {
    const { campaignId } = await context.params;
    return publicJson(await readSaves(campaignId));
  } catch (cause) {
    return errorResponse(cause);
  }
}
