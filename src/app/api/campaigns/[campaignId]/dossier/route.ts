import { readDossier, readNotebook, updateDossier } from "@/lib/server/dossier";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ campaignId: string }> };
/** GET: pins, likes, theme, status, play time; ?view=notebook: the DM notebook when the campaign allows it. */
export async function GET(request: Request, context: Context) {
  try {
    const { campaignId } = await context.params;
    if (new URL(request.url).searchParams.get("view") === "notebook") return publicJson(await readNotebook(campaignId));
    return publicJson(await readDossier(campaignId));
  } catch (error) { return errorResponse(error); }
}
/** POST {action: pin|unpin|likes|theme|status, ...}: an owner note on the dossier. */
export async function POST(request: Request, context: Context) {
  try { return publicJson(await updateDossier((await context.params).campaignId, await readWriteRequest(request))); } catch (error) { return errorResponse(error); }
}
