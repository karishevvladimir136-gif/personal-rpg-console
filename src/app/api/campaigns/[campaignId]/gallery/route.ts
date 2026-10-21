import { readGalleryTurns } from "@/lib/server/gallery-turns";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ campaignId: string }> };

// Fix S3-pre (B-13): the gallery's turns — every committed game turn, grouped by session on the page. Owner-only.
export async function GET(_request: Request, context: Context) {
  try {
    const { campaignId } = await context.params;
    return publicJson({ turns: await readGalleryTurns(campaignId) });
  } catch (error) { return errorResponse(error); }
}
