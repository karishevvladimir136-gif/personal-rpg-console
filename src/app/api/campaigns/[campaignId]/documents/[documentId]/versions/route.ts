import { readPublicDocumentVersions } from "@/lib/server/public-campaign";
import { publicJson, errorResponse } from "@/lib/persistence/route-response";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ campaignId: string; documentId: string }> },
) {
  try {
    const { campaignId, documentId } = await params;
    return publicJson(await readPublicDocumentVersions(campaignId, documentId));
  } catch (error) {
    return errorResponse(error);
  }
}
