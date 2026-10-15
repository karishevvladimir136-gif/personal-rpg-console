import { readDmSettings, saveDmSettings } from "@/lib/server/dm-settings";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ campaignId: string }> };
export async function GET(_request: Request, context: Context) {
  try { return publicJson(await readDmSettings((await context.params).campaignId)); } catch (error) { return errorResponse(error); }
}
export async function POST(request: Request, context: Context) {
  try { return publicJson(await saveDmSettings((await context.params).campaignId, await readWriteRequest(request))); } catch (error) { return errorResponse(error); }
}
