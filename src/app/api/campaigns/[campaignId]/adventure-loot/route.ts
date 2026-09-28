import { readAdventureLoot } from "@/lib/server/foundation-loop";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  context: { params: Promise<{ campaignId: string }> },
) {
  try {
    return publicJson(
      await readAdventureLoot((await context.params).campaignId),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
