import { readCampaign } from "@/lib/server/repository";
import { publicJson, errorResponse } from "@/lib/persistence/route-response";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  try {
    return publicJson(await readCampaign((await params).campaignId));
  } catch (error) {
    return errorResponse(error);
  }
}
