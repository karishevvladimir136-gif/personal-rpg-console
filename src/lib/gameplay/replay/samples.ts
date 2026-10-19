// Polish 3 §4: a blind sample of one replayed turn in the bake-off's JSON shape
// (docs/samples/dm-arch): the variant inside the file, the file name silent, the owner's
// own line, the real previous exchange as «before» context, the narration as the player
// would have seen it. The ledger, the private state and the dossier never enter a sample.
import type { TurnSnapshotPayload } from "../turn-snapshot.ts";
import type { DmLoopReceipt, DmLoopDiagnostic, DmLoopUsageEntry } from "../dm-loop/contracts.ts";

/** Voice stage part 7: `voice` labels the voice variant (live · off · layer · five · all) and
 * `examplesPassages` counts the examples file's passages — never the passages themselves. */
export type ReplayVariant = { id: string; label: string; runtime: "single" | "two-pass"; writer: string; bookkeeper: string | null; effort: string; craft?: string;
  voice?: string; examplesPassages?: number };

/** Voice stage part 5: the quotable-line check's result on the replayed narration (for the metrics). */
export type ReplayQuotable = { flags: { line: string; why: string }[]; lines: number; costUsd: number; error: string | null };

export type ReplayTurnRecord = {
  run: string; campaignId: string; operationId: string; turnNo: number; input: string; variant: ReplayVariant;
  outcome: string; narration: string | null; firstWordMs: number | null; textDoneMs: number | null; recordsDoneMs: number | null;
  durationMs: number; requests: number; costUsd: number; cacheReadShare: number | null;
  tokens: { input: number; output: number; cached: number; cacheWrite: number; cacheWrite1h: number };
  usage: DmLoopUsageEntry[]; receipts: DmLoopReceipt[]; diagnostics: DmLoopDiagnostic[]; effort: string | null; tension: string | null;
  quotable?: ReplayQuotable;
};

/** The previous exchange of the snapshot's scenes: the last player line and the narration that answered it. */
export function previousExchange(payload: TurnSnapshotPayload): { input: string | null; narration: string | null } {
  const scenes = payload.source.snapshot.scenes;
  let narration: string | null = null, input: string | null = null;
  for (let at = scenes.length - 1; at >= 0; at--) {
    const row = scenes[at];
    if (narration === null && row.role === "narration") narration = row.body;
    else if (narration !== null && row.role === "player") { input = row.body; break; }
  }
  return { input, narration };
}

export function buildReplaySample(payload: TurnSnapshotPayload, turn: ReplayTurnRecord, options: { language: "ru" | "en"; campaignTitle: string }) {
  const before = previousExchange(payload);
  const accepted = turn.receipts.filter((r) => r.result.ok).map((r) => r.call.name);
  const rejected = turn.receipts.filter((r) => !r.result.ok).map((r) => ({ name: r.call.name, reason: r.result.ok ? "" : r.result.reason }));
  const player = turn.receipts.flatMap((r) => (r.result.ok && r.result.player ? [r.result.player] : []));
  return {
    schemaVersion: 1, scene: `t${String(turn.turnNo).padStart(2, "0")}`, title: `Turn ${turn.turnNo}`,
    description: `${options.campaignTitle}: the owner's own turn ${turn.turnNo}, replayed from the state before it; one turn per variant.`,
    language: options.language, keyStep: `t${turn.turnNo}`, createdAt: new Date().toISOString(), run: turn.run, record: `docs/runs/${turn.run}.jsonl`,
    variant: { id: turn.variant.id, label: turn.variant.label, runtime: turn.variant.runtime, writer: turn.variant.writer, bookkeeper: turn.variant.bookkeeper,
      effort: turn.effort ?? turn.variant.effort, ...(turn.variant.craft ? { craft: turn.variant.craft } : {}),
      ...(turn.variant.voice ? { voice: turn.variant.voice } : {}), ...(turn.variant.examplesPassages ? { examplesPassages: turn.variant.examplesPassages } : {}) },
    before,
    turns: [{ step: `t${turn.turnNo}`, input: turn.input, outcome: turn.outcome, narration: turn.narration,
      firstWordMs: turn.firstWordMs, textDoneMs: turn.textDoneMs, recordsDoneMs: turn.recordsDoneMs, durationMs: turn.durationMs, requests: turn.requests,
      effort: turn.effort, tension: turn.tension, tokens: turn.tokens, cacheReadShare: turn.cacheReadShare, costUsd: turn.costUsd,
      ...(turn.quotable ? { quotable: turn.quotable } : {}),
      tools: { accepted, rejected, player, rolls: turn.receipts.filter((r) => r.result.ok && r.call.name === "roll").map((r) => r.result.ok ? r.result.value : null) },
      diagnostics: turn.diagnostics.filter((d) => d.kind !== "dossier_budget"), leaks: turn.diagnostics.filter((d) => d.kind === "suspected_leak").map((d) => (d as { detail: string }).detail) }],
    totals: { costUsd: turn.costUsd, committed: turn.outcome === "committed" ? 1 : 0, failed: turn.outcome === "committed" ? 0 : 1,
      leaks: turn.diagnostics.filter((d) => d.kind === "suspected_leak").length },
  };
}
