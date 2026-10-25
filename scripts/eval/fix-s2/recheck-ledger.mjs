// Fix run A6: the ledger checker once more over committed replay records (a fraction of a cent each), with the
// records' state from the probe file — to compare a checker change on the same turns without replaying them.
//   FIX_S2_STAGE=A node scripts/eval/fix-s2/recheck-ledger.mjs --probes scripts/eval/out/fix-s2-probes-a.json --budget-usd 0.2 <records.jsonl> [...]
import { readFile } from "node:fs/promises";
import { openRun } from "../real-replay/lib/ledger.mjs";
import { anthropicKey } from "../lib/anthropic-endpoint.mjs";
import { checkLedger, ledgerCheckState } from "../../../src/lib/gameplay/dm-loop/ledger-check.ts";

const args = { probes: null, budgetUsd: 0, files: [] };
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === "--probes") args.probes = process.argv[++i];
  else if (process.argv[i] === "--budget-usd") args.budgetUsd = Number(process.argv[++i]);
  else args.files.push(process.argv[i]);
}
if (!args.probes || !(args.budgetUsd > 0) || !args.files.length) throw new Error("--probes <file> --budget-usd N <records…> are required");
const apiKey = anthropicKey();
const probes = JSON.parse(await readFile(args.probes, "utf8")).snapshots;
const run = `ledger-recheck-${new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-")}`;
const ledger = await openRun(run, args.budgetUsd, "fix run A6: the ledger checker with the records' state over the stage A probe records");
let spent = 0;
try {
  for (const file of args.files) {
    for (const row of (await readFile(file, "utf8")).trim().split("\n").map((line) => JSON.parse(line))) {
      if (row.type !== "turn" || row.outcome !== "committed" || !row.narration) continue;
      if (spent + 0.01 > ledger.budgetUsd) throw new Error("budget reached");
      const probe = probes.find((p) => p.turnNo === row.turnNo);
      const result = await checkLedger(apiKey, { narration: row.narration, ledger: row.ledger ?? "", receipts: row.receipts,
        language: "ru", state: ledgerCheckState(probe.payload.source) });
      spent += result.costUsdMicros / 1_000_000;
      console.log(`${row.variant.label ?? row.variant.id} · ${probe.probe.id}: before ${row.ledgerCheck?.post?.misses?.length ?? "–"} → now ${result.misses.length}${result.misses.length ? ` (${result.misses.map((m) => m.event).join("; ")})` : ""}${result.error ? ` [${result.error}]` : ""}`);
    }
  }
} finally { await ledger.settle(spent, `scripts/eval/fix-s2/recheck-ledger.mjs (${run})`); }
console.log(`spent $${spent.toFixed(4)}`);
