// Fix run after session 2: the probe table — the replay's records of the probes (probes.mjs) side by side per arm
// (the replay's --label, else the variant and its options): per probe the outcome, requests, cost, first word, full
// turn, the rolls (bundled with their damage or not, told in the text or not), the rejected records, the rest calls,
// the ledger checker's findings; per arm the voice metrics. Reads records only; nothing paid.
//   node scripts/eval/fix-s2/probe-metrics.mjs docs/runs/real-replay-<stamp>.jsonl [...] [--json]
// «Told» is a heuristic for the table (the roll's total or its target named in the narration); the report quotes the
// reading of the narrations themselves where it matters.
import { readFile } from "node:fs/promises";
import { voiceMetrics, voiceMetricsTable } from "../lib/voice-metrics.mjs";

const args = { files: [], json: false };
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === "--json") args.json = true;
  else args.files.push(process.argv[i]);
}
if (!args.files.length) throw new Error("give the replay records (docs/runs/real-replay-*.jsonl)");

const rows = [];
for (const file of args.files) {
  for (const line of (await readFile(file, "utf8")).trim().split("\n").filter(Boolean)) {
    const row = JSON.parse(line);
    if (row.type === "turn") rows.push(row);
  }
}
const armOf = (row) => row.variant.label ? `${row.variant.label} · ${row.variant.id}` : [row.variant.id, row.variant.continuation ? `continuation ${row.variant.continuation}` : null,
  row.variant.memory ? `memory ${row.variant.memory}` : null, row.variant.instructions ? `instructions ${row.variant.instructions}` : null].filter(Boolean).join(" · ");
const probeOf = (row) => row.variant.probe?.id ?? `turn ${row.turnNo}`;

/** The rolls of a turn: bundled (an attack with its damage in one call) or not, told in the narration or not. */
function rolls(row) {
  const accepted = row.receipts.filter((receipt) => receipt.call.name === "roll" && receipt.result.ok);
  const parsed = accepted.map((receipt) => {
    const callArgs = typeof receipt.call.arguments === "string" ? JSON.parse(receipt.call.arguments || "{}") : receipt.call.arguments ?? {};
    const value = receipt.result.value ?? {};
    return { formula: String(callArgs.formula ?? value.formula ?? ""), kind: String(callArgs.kind ?? ""), attack: callArgs.kind === "attack" || !!callArgs.targetRef,
      damage: !!value.damage, total: value.total, target: value.damage?.target ?? null, actor: value.actor ?? null, visibility: value.visibility ?? null };
  });
  const attacks = parsed.filter((roll) => roll.attack);
  // A damage roll on its own: a non-d20 roll in a turn that also made attack rolls without damage.
  const separateDamage = parsed.filter((roll) => !roll.attack && !/d20/.test(roll.formula) && attacks.some((attack) => !attack.damage)).length;
  const narration = row.narration ?? "";
  const told = (roll) => (roll.total !== undefined && narration.includes(String(roll.total))) || (roll.target && narration.includes(roll.target)) ||
    (roll.actor && roll.actor !== "DM" && narration.includes(roll.actor));
  // The plain case first: no narration at all after the first answer that rolled — every roll of the turn untold
  // (the stage A probe's lighter fights). The shape is the record's (each answer's text length and calls).
  const shape = row.shape ?? [];
  const firstRoll = shape.findIndex((answer) => answer.calls.includes("roll"));
  const textAfter = firstRoll < 0 ? null : shape.slice(firstRoll + 1).reduce((sum, answer) => sum + answer.text, 0);
  const untold = textAfter === 0 ? parsed.filter((roll) => roll.visibility === "player").length
    : parsed.filter((roll) => roll.visibility === "player" && !told(roll)).length;
  return { rolls: parsed.length, attacks: attacks.length, bundled: attacks.filter((roll) => roll.damage).length, separateDamage, untold };
}

const median = (values) => { const sorted = values.filter((v) => typeof v === "number").sort((a, b) => a - b); if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2; };
const secs = (ms) => (ms === null || ms === undefined ? "–" : (ms / 1000).toFixed(1));

const table = rows.map((row) => {
  const r = rolls(row);
  const ledger = row.ledgerCheck ?? { live: [], unrecorded: [] };
  return {
    arm: armOf(row), probe: probeOf(row), outcome: row.outcome, requests: row.requests, costUsd: row.costUsd, firstWordMs: row.firstWordMs, durationMs: row.durationMs,
    effort: row.effort, ...r, accepted: row.receipts.filter((receipt) => receipt.result.ok).length, rejected: row.receipts.filter((receipt) => !receipt.result.ok).length,
    restCalls: row.receipts.filter((receipt) => receipt.call.name === "rest" && receipt.result.ok).length,
    resourceCalls: row.receipts.filter((receipt) => receipt.call.name === "resource" && receipt.result.ok).length,
    cut: row.diagnostics.some((d) => d.kind === "max_tokens"), expensive: row.diagnostics.find((d) => d.kind === "expensive_turn")?.causes ?? null,
    checkerFirst: ledger.live[0]?.misses ?? null, checkerLeft: ledger.unrecorded ?? [], checkerAfter: ledger.post?.misses?.map((miss) => miss.event) ?? null,
    narrationChars: (row.narration ?? "").length,
  };
});

const arms = [...new Set(table.map((row) => row.arm))];
const summary = arms.map((arm) => {
  const own = table.filter((row) => row.arm === arm);
  const turns = rows.filter((row) => armOf(row) === arm);
  return { arm, turns: own.length, committed: own.filter((row) => row.outcome === "committed").length, costUsdTotal: Number(own.reduce((s, row) => s + row.costUsd, 0).toFixed(4)),
    costUsdMedian: median(own.map((row) => row.costUsd)), requestsMedian: median(own.map((row) => row.requests)), firstWordMedianMs: median(own.map((row) => row.firstWordMs)),
    turnMedianMs: median(own.map((row) => row.durationMs)), rejected: own.reduce((s, row) => s + row.rejected, 0), untoldRolls: own.reduce((s, row) => s + row.untold, 0),
    checkerAfterMisses: own.reduce((s, row) => s + (row.checkerAfter?.length ?? 0), 0), checkerFirstMisses: own.reduce((s, row) => s + (row.checkerFirst?.length ?? 0), 0),
    voice: voiceMetrics(turns.filter((row) => row.narration).map((row) => ({ narration: row.narration, flags: row.quotable?.flags }))) };
});

if (args.json) { console.log(JSON.stringify({ table, summary }, null, 2)); process.exit(0); }
console.log("| Arm | Probe | Outcome | Requests | Cost | First word, s | Turn, s | Depth | Rolls (attacks; bundled; separate damage; untold?) | Records ok / rejected | rest / resource | Cut | Checker: in turn → left; after |");
console.log("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
for (const row of table) {
  console.log(`| ${row.arm} | ${row.probe} | ${row.outcome} | ${row.requests} | $${row.costUsd.toFixed(3)} | ${secs(row.firstWordMs)} | ${secs(row.durationMs)} | ${row.effort ?? "–"} | ` +
    `${row.rolls} (${row.attacks}; ${row.bundled}; ${row.separateDamage}; ${row.untold}) | ${row.accepted} / ${row.rejected} | ${row.restCalls} / ${row.resourceCalls} | ${row.cut ? "yes" : "–"} | ` +
    `${row.checkerFirst === null ? "–" : row.checkerFirst.length} → ${row.checkerLeft.length}; ${row.checkerAfter === null ? "–" : row.checkerAfter.length}${row.checkerAfter?.length ? ` (${row.checkerAfter.join("; ")})` : ""} |`);
}
console.log("\n| Arm | Turns | Committed | Cost, total | Cost, median | Requests, median | First word, median s | Turn, median s | Rejected | Untold? | Checker misses (first in turn / after) |");
console.log("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
for (const row of summary)
  console.log(`| ${row.arm} | ${row.turns} | ${row.committed} | $${row.costUsdTotal.toFixed(3)} | $${(row.costUsdMedian ?? 0).toFixed(3)} | ${row.requestsMedian ?? "–"} | ${secs(row.firstWordMedianMs)} | ${secs(row.turnMedianMs)} | ${row.rejected} | ${row.untoldRolls} | ${row.checkerFirstMisses} / ${row.checkerAfterMisses} |`);
console.log(`\n${voiceMetricsTable(summary.map((row) => ({ variant: row.arm, metrics: row.voice })))}`);
