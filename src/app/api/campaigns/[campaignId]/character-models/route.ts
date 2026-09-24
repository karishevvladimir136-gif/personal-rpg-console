import { characterModelCommand } from "@/lib/server/character-model";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request, context: { params: Promise<{ campaignId: string }> }) {
  try {
    const { campaignId } = await context.params;
    return publicJson(await characterModelCommand(campaignId, await readWriteRequest(request)));
  } catch (cause) {
    return errorResponse(cause);
  }
}
