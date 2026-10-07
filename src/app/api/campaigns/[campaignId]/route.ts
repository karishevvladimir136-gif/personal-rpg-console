import { readPublicCampaign } from "@/lib/server/public-campaign";
import { publicJson, errorResponse } from "@/lib/persistence/route-response";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  try {
    return publicJson(await readPublicCampaign((await params).campaignId));
  } catch (error) {
    return errorResponse(error);
  }
}
