import { mutateSaves } from "@/lib/server/saves/service";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { publicJson, errorResponse } from "@/lib/persistence/route-response";
export const runtime = "nodejs";
export async function POST(
  request: Request,
  context: { params: Promise<{ campaignId: string; action: string }> },
) {
  try {
    const { campaignId, action } = await context.params;
    return publicJson(
      await mutateSaves(campaignId, action, await readWriteRequest(request)),
    );
  } catch (cause) {
    return errorResponse(cause);
  }
}
