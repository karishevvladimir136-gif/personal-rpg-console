import "server-only";
import { after } from "next/server";
import { checkQuotableLines, QUOTABLE_MODEL } from "../../gameplay/dm-loop/quotable";
import { dossierService } from "../dossier";
import { anthropicApiKey } from "../anthropic-endpoint";

// Voice stage part 5: the quotable-line check runs after the turn's commit, off the turn's path
// (Next's `after`: once the response is done; outside a request, at once in the background).
// It never delays or fails a turn: a failure is one log line. The flags are stored per turn
// (rpg_private.voice_flags) — the next turn's tail quotes the newest row's flags, the metrics
// read the rows — and logged with their cost; the lines themselves are campaign text and are
// logged only as flagged (a flag is a diagnostic the owner reads).
export function scheduleQuotableCheck(args: { ownerId: string; campaignId: string; operationId: string; narration: string; language: "ru" | "en" }): void {
  const run = () => runQuotableCheck(args).catch((error) => {
    console.info(JSON.stringify({ event: "dm_loop_quotable_failed", operationId: args.operationId, message: error instanceof Error ? error.message : String(error) }));
  });
  try { after(run); } catch { void run(); }
}

export async function runQuotableCheck(args: { ownerId: string; campaignId: string; operationId: string; narration: string; language: "ru" | "en" }): Promise<void> {
  const apiKey = anthropicApiKey();
  const result = await checkQuotableLines(apiKey, args.narration, args.language);
  if (result.lines === 0) return;
  if (result.error) {
    console.info(JSON.stringify({ event: "dm_loop_quotable_skipped", operationId: args.operationId, lines: result.lines, error: result.error }));
    return;
  }
  const dossier = await dossierService(args.ownerId, args.campaignId);
  await dossier.voiceFlagsSave({ operationId: args.operationId, flags: result.flags, lines: result.lines, model: QUOTABLE_MODEL, usage: result.usage, costUsdMicros: result.costUsdMicros });
  console.info(JSON.stringify({ event: "dm_loop_quotable", operationId: args.operationId, lines: result.lines, flags: result.flags.length,
    flagged: result.flags, costUsd: Number((result.costUsdMicros / 1_000_000).toFixed(6)), elapsedMs: result.elapsedMs }));
}
