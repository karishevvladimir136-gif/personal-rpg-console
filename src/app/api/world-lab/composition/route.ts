import { worldLabError, worldLabService } from "@/lib/server/world-lab";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
import { isUuid } from "@/lib/persistence/validation";
import { parseLabAuthoringRequest } from "@/lib/world-lab/authoring";

export const runtime = "nodejs";
// One 180-second provider request plus validation and immutable review storage.
export const maxDuration = 240;

const language = (request: Request) => request.headers.get("Accept-Language")?.startsWith("ru") ? "ru" as const : "en" as const;
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const campaignId = params.get("campaignId");
    if (params.size !== 1 || !isUuid(campaignId)) throw new Error("validation");
    return publicJson(await (await worldLabService(campaignId, language(request))).authoring.catalog(campaignId));
  } catch (cause) { return errorResponse(worldLabError(cause)); }
}
export async function POST(request: Request) {
  try {
    const value = parseLabAuthoringRequest(await readWriteRequest(request));
    return publicJson(await (await worldLabService(value.input.campaignId, language(request))).authoring.perform(value));
  } catch (cause) { return errorResponse(worldLabError(cause)); }
}
