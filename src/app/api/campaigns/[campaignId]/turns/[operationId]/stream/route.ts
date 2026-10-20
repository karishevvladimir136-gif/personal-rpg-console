import { authorizeCampaign } from "@/lib/server/campaign-authorization";
import { isUuid } from "@/lib/persistence/validation";
import { gameplayErrorResponse } from "@/lib/gameplay/http-response";
import { liveTurnEnds, subscribeLiveTurn } from "@/lib/server/dm/live-turns";
import { PersistenceError } from "@/lib/server/errors";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Live view of a running dm-loop-v1 turn: narration deltas and accepted changes
// as server-sent events. Public-safe only; the client treats the text as
// provisional until the turn is committed.
export async function GET(_request: Request, context: { params: Promise<{ campaignId: string; operationId: string }> }) {
  try {
    const { campaignId, operationId } = await context.params;
    await authorizeCampaign(campaignId);
    if (!isUuid(operationId)) throw new PersistenceError("not_found");
    const encoder = new TextEncoder();
    let unsubscribe = () => {};
    let timer: ReturnType<typeof setTimeout> | null = null;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const close = () => {
          unsubscribe();
          if (timer) clearTimeout(timer);
          try { controller.close(); } catch { /* already closed */ }
        };
        unsubscribe = subscribeLiveTurn(operationId, (event) => {
          try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`)); } catch { close(); return; }
          if (liveTurnEnds(event)) close();
        });
        timer = setTimeout(close, 10 * 60 * 1000);
      },
      cancel() {
        unsubscribe();
        if (timer) clearTimeout(timer);
      },
    });
    // Fix run A3 (item 75): «no-transform» keeps Next's gzip off the live stream — a compressed SSE buffers
    // the text and piled a drain listener per write (the MaxListenersExceededWarning of session 2).
    return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "private, no-store, no-transform",
      Connection: "keep-alive", "X-Accel-Buffering": "no" } });
  } catch (cause) {
    return gameplayErrorResponse(cause);
  }
}
