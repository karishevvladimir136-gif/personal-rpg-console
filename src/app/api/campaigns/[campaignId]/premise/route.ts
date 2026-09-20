import { readCampaignPremise, saveCampaignPremise } from "@/lib/server/campaign-premise";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ campaignId: string }> };
export async function GET(request: Request, context: Context) {
  try {
    const before = new URL(request.url).searchParams.get("before");
    return publicJson(await readCampaignPremise((await context.params).campaignId, before === null ? null : Number(before)));
  } catch (error) { return errorResponse(error); }
}
export async function POST(request: Request, context: Context) {
  try { return publicJson(await saveCampaignPremise((await context.params).campaignId, await readWriteRequest(request))); }
  catch (error) { return errorResponse(error); }
}
