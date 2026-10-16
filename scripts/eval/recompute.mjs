// Recompute the Stage 4 metrics of a research record from its receipts:
//   node scripts/eval/recompute.mjs docs/runs/<run>.jsonl
// The record's turns carry every tool receipt and the finish_turn meta; the
// resistance metrics (src/lib/gameplay/dm-loop/metrics.ts) are a pure function
// of those, so the stored per-scenario metrics must match what this prints.
import { loadRun, formatReport, stage4Report } from "./report.mjs";
import { advanceMetrics, EMPTY_METRICS, metricsReport } from "../../src/lib/gameplay/dm-loop/metrics.ts";

const file = process.argv[2];
if (!file) { console.error("usage: node scripts/eval/recompute.mjs <run.jsonl>"); process.exit(2); }
const records = await loadRun(file);
const scenarios = records.filter((record) => record.type === "scenario");
const turns = records.filter((record) => record.type === "turn");
console.log(formatReport(records));
console.log("\nRecomputed from the receipts in this record:");
for (const scenario of scenarios) {
  let metrics = structuredClone(EMPTY_METRICS);
  for (const turn of turns.filter((row) => row.scenario === scenario.scenario && row.outcome === "committed")) {
    // The record keeps receipts by outcome (accepted / rejected / summaries) and the
    // pinned party is not stored, so the recomputation uses the receipts it has.
    const receipts = (turn.receipts ?? []);
    ({ metrics } = advanceMetrics(metrics, receipts, turn.meta ?? null, new Set(turn.partyNames ?? []), turn.party ?? []));
  }
  const recomputed = metricsReport(metrics);
  const stored = scenario.metrics ?? null;
  const same = stored ? JSON.stringify(stored) === JSON.stringify(recomputed) : null;
  console.log(`  ${scenario.scenario}: ${JSON.stringify(recomputed)}${stored ? ` — ${same ? "matches the stored metrics" : `differs from stored ${JSON.stringify(stored)}`}` : " (no stored metrics)"}`);
}
console.log(stage4Report(turns, scenarios).join("\n"));
