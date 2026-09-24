import { executeDmTeach } from "@/lib/server/dm-craft";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";

export const runtime = "nodejs";
export async function POST(
  request: Request,
  context: { params: Promise<{ campaignId: string }> },
) {
  try {
    const { campaignId } = await context.params;
    return publicJson(
      await executeDmTeach(campaignId, await readWriteRequest(request)),
    );
  } catch (cause) {
    return errorResponse(cause);
  }
}
