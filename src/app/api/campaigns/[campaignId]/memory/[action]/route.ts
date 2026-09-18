import { after } from "next/server";
import { mutateMemory } from "@/lib/server/memory/service";
import { publicJson } from "@/lib/persistence/route-response";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { gameplayErrorResponse } from "@/lib/gameplay/http-response";
import { DmError } from "@/lib/gameplay/dm-errors";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(
  request: Request,
  context: { params: Promise<{ campaignId: string; action: string }> },
) {
  try {
    const { campaignId, action } = await context.params;
    if (action !== "end" && action !== "continue" && action !== "retry")
      throw new DmError("validation");
    const result = await mutateMemory(
      campaignId,
      action,
      await readWriteRequest(request),
    );
    after(result.run);
    return publicJson(result.snapshot);
  } catch (cause) {
    return gameplayErrorResponse(cause);
  }
}
