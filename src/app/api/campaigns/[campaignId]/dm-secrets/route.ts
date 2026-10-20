import { readDmSecrets, saveDmSecrets } from "@/lib/server/dm-secrets";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ campaignId: string }> };

// Fix run B1: the owner's «Тайны (видит только ведущий)» for this campaign and its world. Owner-only.
export async function GET(_request: Request, context: Context) {
  try {
    const { campaignId } = await context.params;
    return publicJson({ secrets: await readDmSecrets(campaignId) });
  } catch (error) { return errorResponse(error); }
}

export async function PUT(request: Request, context: Context) {
  try {
    const { campaignId } = await context.params;
    return publicJson({ secrets: await saveDmSecrets(campaignId, await request.json().catch(() => null)) });
  } catch (error) { return errorResponse(error); }
}
