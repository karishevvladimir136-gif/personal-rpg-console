import {
  readCampaignPacks,
  bindCampaignPack,
} from "@/lib/server/pack-configuration";
import { ownerLibraryError } from "@/lib/server/world-library/authoring";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ campaignId: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    return publicJson(
      await readCampaignPacks((await context.params).campaignId),
    );
  } catch (error) {
    return errorResponse(ownerLibraryError(error));
  }
}
export async function POST(request: Request, context: Context) {
  try {
    return publicJson(
      await bindCampaignPack(
        (await context.params).campaignId,
        await readWriteRequest(request),
      ),
    );
  } catch (error) {
    return errorResponse(ownerLibraryError(error));
  }
}
