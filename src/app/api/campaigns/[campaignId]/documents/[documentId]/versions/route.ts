import { readDocumentVersions } from "@/lib/server/repository";
import { publicJson, errorResponse } from "@/lib/persistence/route-response";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ campaignId: string; documentId: string }> },
) {
  try {
    const { campaignId, documentId } = await params;
    return publicJson(await readDocumentVersions(campaignId, documentId));
  } catch (error) {
    return errorResponse(error);
  }
}
