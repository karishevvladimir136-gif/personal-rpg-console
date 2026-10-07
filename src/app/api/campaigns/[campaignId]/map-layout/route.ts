import { readMapLayout, writeMapPlacement } from "@/lib/server/map-layout";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ campaignId: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    return publicJson(await readMapLayout((await context.params).campaignId));
  } catch (cause) {
    return errorResponse(cause);
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const { campaignId } = await context.params;
    return publicJson(await writeMapPlacement(campaignId, await readWriteRequest(request)));
  } catch (cause) {
    return errorResponse(cause);
  }
}
