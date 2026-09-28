import { worldLabContinuationService } from "@/lib/server/world-lab-continuation";
import { worldLabError } from "@/lib/server/world-lab";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
import { isUuid } from "@/lib/persistence/validation";
import {
  parseContinuationRequest,
  parseContinuationSelection,
} from "@/lib/world-lab/continuation-validation";

export const runtime = "nodejs";
export const maxDuration = 180;
const language = (request: Request) =>
  request.headers.get("Accept-Language")?.startsWith("ru") ? "ru" : "en";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const mode = params.get("mode"),
      campaignId = params.get("campaignId");
    const fields = [
      "campaignId",
      "mode",
      "sourceRunId",
      "sourceCheckpointId",
      ...(mode === "catalog" ? ["expectedRevision"] : []),
    ];
    if (
      !["inspect", "catalog"].includes(mode ?? "") ||
      params.size !== fields.length ||
      fields.some((field) => !params.has(field)) ||
      !isUuid(campaignId)
    )
      throw new Error("validation");
    const sourceRunId = params.get("sourceRunId"),
      sourceCheckpointId = params.get("sourceCheckpointId");
    if (!isUuid(sourceRunId) || !isUuid(sourceCheckpointId))
      throw new Error("validation");
    const service = await worldLabContinuationService(
      campaignId,
      language(request),
    );
    if (mode === "inspect")
      return publicJson(
        await service.inspect(campaignId, sourceRunId, sourceCheckpointId),
      );
    const revision = params.get("expectedRevision");
    if (!revision || !/^(0|[1-9]\d*)$/.test(revision))
      throw new Error("validation");
    const source = parseContinuationSelection({
      sourceRunId,
      sourceCheckpointId,
      expectedRevision: Number(revision),
    });
    return publicJson(await service.catalog(campaignId, source));
  } catch (cause) {
    return errorResponse(worldLabError(cause));
  }
}
export async function POST(request: Request) {
  try {
    const input = parseContinuationRequest(await readWriteRequest(request));
    return publicJson(
      await (
        await worldLabContinuationService(
          input.input.campaignId,
          language(request),
        )
      ).perform(input),
    );
  } catch (cause) {
    return errorResponse(worldLabError(cause));
  }
}
