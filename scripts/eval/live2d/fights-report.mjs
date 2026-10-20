// The live fight probes (Part 2): a table per run — each turn's outcome, seconds
// to the first word and to the commit, cost, the combat actions the DM used, the
// rejected calls, the scenario's checks — and the combat calls' player lines, so
// the DM's narration can be read against what the server measured.
//   node scripts/eval/live2d/fights-report.mjs scripts/eval/out/<run>.jsonl [--lines]
import { readFileSync } from "node:fs";

const [file, ...flags] = process.argv.slice(2);
if (!file) { console.error("usage: fights-report.mjs <run.jsonl> [--lines]"); process.exit(2); }
const rows = readFileSync(file, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
const header = rows.find((row) => row.type === "run") ?? {};
const turns = rows.filter((row) => row.type === "turn");
const end = rows.find((row) => row.type === "end");
console.log(`Run ${header.run ?? file} — ${header.model ?? "?"} (${header.effort ?? "?"}${header.continuationEffort ? `, continuations ${header.continuationEffort}` : ""})`);
console.log("| Step | Outcome | First word | Turn | Cost | Combat actions | Rejected | Checks |");
console.log("| --- | --- | --- | --- | --- | --- | --- | --- |");
for (const turn of turns) {
  const combat = turn.receipts.filter((r) => r.call.name === "combat" && r.result.ok).map((r) => r.call.arguments.action);
  const rejected = turn.receipts.filter((r) => !r.result.ok).map((r) => `${r.call.name}${r.call.arguments.action ? `:${r.call.arguments.action}` : ""}`);
  const checks = (turn.checks ?? []).map((c) => `${c.pass ? "✓" : "✗"} ${c.label ?? c.kind}`).join("; ");
  console.log(`| ${turn.step} | ${turn.outcome}${turn.errorCode ? ` (${turn.errorCode})` : ""} | ${turn.firstWordMs ? (turn.firstWordMs / 1000).toFixed(1) + " s" : "–"} | ${(turn.durationMs / 1000).toFixed(1)} s | $${(turn.costUsd ?? 0).toFixed(3)} | ${combat.join(", ") || "–"} | ${rejected.join(", ") || "–"} | ${checks} |`);
}
const committed = turns.filter((t) => t.outcome === "committed");
const mean = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0);
console.log(`\n${turns.length} turns, ${committed.length} committed; mean turn ${(mean(committed.map((t) => t.durationMs)) / 1000).toFixed(1)} s, mean first word ${(mean(committed.filter((t) => t.firstWordMs).map((t) => t.firstWordMs)) / 1000).toFixed(1)} s, mean cost $${mean(turns.map((t) => t.costUsd ?? 0)).toFixed(3)}; spent $${(end?.spentUsd ?? turns.reduce((s, t) => s + (t.costUsd ?? 0), 0)).toFixed(3)}${end?.stopReason ? ` (${end.stopReason})` : ""}.`);
if (flags.includes("--lines")) {
  for (const turn of turns) {
    console.log(`\n## ${turn.step} — «${turn.input}»`);
    for (const r of turn.receipts.filter((r) => r.call.name === "combat")) console.log(`- ${r.result.ok ? "" : "REJECTED "}${r.call.arguments.action}: ${r.result.ok ? r.result.summary : r.result.reason}`);
    if (turn.narration) console.log(`\n${String(turn.narration).slice(0, 1200)}${String(turn.narration).length > 1200 ? "…" : ""}`);
  }
}
