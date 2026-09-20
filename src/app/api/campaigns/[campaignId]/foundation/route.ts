import {
  readFoundationCampaign,
  writeFoundationCampaign,
} from "@/lib/server/foundation-loop";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ campaignId: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    return publicJson(
      await readFoundationCampaign((await context.params).campaignId),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
export async function POST(request: Request, context: Context) {
  try {
    return publicJson(
      await writeFoundationCampaign(
        (await context.params).campaignId,
        await readWriteRequest(request),
      ),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
