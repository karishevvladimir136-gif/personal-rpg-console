import { readDmView } from "@/lib/server/dm-view";
import { PersistenceError } from "@/lib/server/errors";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ campaignId: string }> };

// Fix run A5: «Что видит ведущий» — the layers the DM received on the last committed turn (`?turn=N` for
// another), rebuilt from that turn's snapshot. Owner-only through the campaign authorization; the private
// layers' texts only when the owner opted in to the DM's secrets.
export async function GET(request: Request, context: Context) {
  try {
    const { campaignId } = await context.params;
    const turn = new URL(request.url).searchParams.get("turn");
    let turnNo: number | undefined;
    if (turn !== null) {
      turnNo = Number(turn);
      if (!Number.isSafeInteger(turnNo) || turnNo < 1) throw new PersistenceError("validation");
    }
    return publicJson({ view: await readDmView(campaignId, turnNo) });
  } catch (error) { return errorResponse(error); }
}
