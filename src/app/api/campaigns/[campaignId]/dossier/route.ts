import { readDossier, readNotebook, readVoiceSamples, saveVoiceSamples, updateDossier } from "@/lib/server/dossier";
import { authorizeCampaign } from "@/lib/server/campaign-authorization";
import { readDigestStatus, retryDigest } from "@/lib/server/session-digest";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ campaignId: string }> };
/** GET: pins, likes, theme, status, play time; ?view=notebook: the DM notebook when the campaign allows it;
 * ?view=digest&session=<id>: where the session digest stands (polish item 11). */
export async function GET(request: Request, context: Context) {
  try {
    const { campaignId } = await context.params;
    const params = new URL(request.url).searchParams;
    if (params.get("view") === "notebook") return publicJson(await readNotebook(campaignId));
    // Polish group 7: the owner's voice samples (private; never logged).
    if (params.get("view") === "voice") return publicJson(await readVoiceSamples(campaignId));
    if (params.get("view") === "digest") {
      await authorizeCampaign(campaignId);
      const sessionId = params.get("session") ?? "";
      return publicJson({ campaignId, sessionId, status: readDigestStatus(campaignId, sessionId) });
    }
    return publicJson(await readDossier(campaignId));
  } catch (error) { return errorResponse(error); }
}
/** POST {action: pin|unpin|likes|theme|status, ...}: an owner note on the dossier;
 * {action: "digest", sessionId}: run the session digest again. */
export async function POST(request: Request, context: Context) {
  try {
    const { campaignId } = await context.params;
    const body = await readWriteRequest(request) as Record<string, unknown>;
    if (body && body.action === "voice_save") return publicJson(await saveVoiceSamples(campaignId, body));
    if (body && body.action === "digest" && typeof body.sessionId === "string")
      return publicJson({ campaignId, sessionId: body.sessionId, status: await retryDigest(campaignId, body.sessionId) });
    return publicJson(await updateDossier(campaignId, body));
  } catch (error) { return errorResponse(error); }
}
