import { combatReadiness } from "@/lib/server/combat-readiness";
import { publicJson } from "@/lib/persistence/route-response";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { gameplayErrorResponse } from "@/lib/gameplay/http-response";
import type { CombatReadinessConfirmation } from "@/lib/gameplay/combat-readiness";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ campaignId: string }> },
) {
  try {
    const { campaignId } = await context.params;
    return publicJson(await combatReadiness(campaignId, "inspect", {}));
  } catch (cause) {
    return gameplayErrorResponse(cause);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ campaignId: string }> },
) {
  try {
    const { campaignId } = await context.params;
    return publicJson(await combatReadiness(campaignId, "confirm", await readWriteRequest(request) as CombatReadinessConfirmation));
  } catch (cause) {
    return gameplayErrorResponse(cause);
  }
}
