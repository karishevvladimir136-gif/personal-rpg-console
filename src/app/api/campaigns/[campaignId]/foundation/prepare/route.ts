import { readPreparation } from "@/lib/server/foundation-loop";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  context: { params: Promise<{ campaignId: string }> },
) {
  try {
    return publicJson(
      await readPreparation(
        (await context.params).campaignId,
        new URL(request.url).searchParams.get("bindingId") ?? "",
      ),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
