import { listTurnSnapshots, readTurnSnapshot } from "@/lib/server/turn-snapshots";
import { isUuid } from "@/lib/persistence/validation";
import { PersistenceError } from "@/lib/server/errors";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ campaignId: string }> };

// Polish 3 §4: the owner's turn snapshots — the list (turn numbers, the player's lines, sizes), or
// one snapshot by `operationId` or `turn` with its payload (the state before that turn, decoded).
// Owner-only through the campaign authorization; never part of the DM's context or the player's screens.
export async function GET(request: Request, context: Context) {
  try {
    const { campaignId } = await context.params;
    const url = new URL(request.url);
    const operationId = url.searchParams.get("operationId");
    const turn = url.searchParams.get("turn");
    if (operationId !== null) {
      if (!isUuid(operationId)) throw new PersistenceError("validation");
      return publicJson(await readTurnSnapshot(campaignId, { operationId }));
    }
    if (turn !== null) {
      const turnNo = Number(turn);
      if (!Number.isSafeInteger(turnNo) || turnNo < 1) throw new PersistenceError("validation");
      return publicJson(await readTurnSnapshot(campaignId, { turnNo }));
    }
    return publicJson(await listTurnSnapshots(campaignId));
  } catch (error) { return errorResponse(error); }
}
