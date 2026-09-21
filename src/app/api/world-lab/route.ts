import { worldLabError, worldLabService } from "@/lib/server/world-lab";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
import { isUuid } from "@/lib/persistence/validation";
import { parseLabRequest } from "@/lib/world-lab/validation";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const campaignId = params.get("campaignId");
    if (params.size !== 1 || !isUuid(campaignId)) throw new Error("validation");
    return publicJson(
      await (
        await worldLabService(
          campaignId,
          request.headers.get("Accept-Language")?.startsWith("ru")
            ? "ru"
            : "en",
        )
      ).catalog(campaignId),
    );
  } catch (cause) {
    return errorResponse(worldLabError(cause));
  }
}
export async function POST(request: Request) {
  try {
    const input = parseLabRequest(await readWriteRequest(request));
    return publicJson(
      await (
        await worldLabService(
          input.input.campaignId,
          request.headers.get("Accept-Language")?.startsWith("ru")
            ? "ru"
            : "en",
        )
      ).perform(input),
    );
  } catch (cause) {
    return errorResponse(worldLabError(cause));
  }
}
