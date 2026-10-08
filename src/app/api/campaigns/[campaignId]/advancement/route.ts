import { chooseAstraAdvancement } from "@/lib/server/foundation-loop";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ campaignId: string }> };
export async function POST(request: Request, context: Context) {
  try {
    return publicJson(await chooseAstraAdvancement(
      (await context.params).campaignId, await readWriteRequest(request)));
  } catch (error) { return errorResponse(error); }
}
