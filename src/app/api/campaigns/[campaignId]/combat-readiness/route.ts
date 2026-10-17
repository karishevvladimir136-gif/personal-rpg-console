import { combatReadiness } from "@/lib/server/combat-readiness";
import { draftCombatProfile } from "@/lib/server/combat-draft";
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
    const body = await readWriteRequest(request) as CombatReadinessConfirmation | { action?: string };
    // Polish 2 §6: «Предложить профиль» — the DM's model drafts the numbers; the owner still approves.
    if ((body as { action?: string }).action === "draft") return publicJson(await draftCombatProfile(campaignId));
    return publicJson(await combatReadiness(campaignId, "confirm", body as CombatReadinessConfirmation));
  } catch (cause) {
    return gameplayErrorResponse(cause);
  }
}
