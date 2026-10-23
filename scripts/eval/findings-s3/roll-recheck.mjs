// Findings S3 §7: the «every roll told» check on the FINAL narration of committed replay turns. In a turn the app checks
// once, before the DM's continuation that tells what was missing, so the in-turn count is of first drafts; this reads
// what the player would have read at the commit. The app's own check (Haiku 5.5, no thinking), sequential, in the findings
// ledger. Writes docs/runs/findings-s3-roll-recheck-<stamp>.json and prints a line per scene and arm.
//   node scripts/eval/findings-s3/roll-recheck.mjs --snapshots a.json,b.json --budget-usd 0.2 <records.jsonl> …
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { openRun, ROOT } from "../real-replay/lib/ledger.mjs";
import { providerKey } from "../lib/keys.mjs";
import { checkRollsTold, visibleRolls } from "../../../src/lib/gameplay/dm-loop/roll-check.ts";

const args = { snapshots: [], budgetUsd: 0, records: [] };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i];
  if (flag === "--snapshots") args.snapshots = process.argv[++i].split(",");
  else if (flag === "--budget-usd") args.budgetUsd = Number(process.argv[++i]);
  else args.records.push(flag);
}
if (!(args.budgetUsd > 0) || !args.records.length) throw new Error("--budget-usd and the records are required");
const apiKey = providerKey("ANTHROPIC_API_KEY");
const heroOf = new Map();
for (const file of args.snapshots) {
  const value = JSON.parse(await readFile(file, "utf8"));
  for (const row of Array.isArray(value) ? value : value.snapshots) heroOf.set(row.probe?.id, row.payload.source.snapshot.entities.find((e) => e.kind === "player")?.id ?? null);
}
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
const run = `findings-s3-roll-recheck-${stamp}`;
const ledger = await openRun(run, args.budgetUsd, "findings S3 §7: the roll check on the final narrations of the item-1 «after» and the notes arms (Haiku 5.5)", "findingss3");
let spent = 0;
const rows = [];
try {
  for (const file of args.records) {
    for (const line of (await readFile(file, "utf8")).split("\n")) {
      if (!line.trim()) continue;
      const turn = JSON.parse(line);
      if (turn.type !== "turn" || turn.outcome !== "committed" || !turn.narration) continue;
      const probe = turn.variant?.probe?.id ?? "?";
      const rolls = visibleRolls(turn.receipts ?? [], heroOf.get(probe) ?? null);
      if (!rolls.length) { rows.push({ file, arm: turn.variant?.label, probe, rolls: 0, untold: 0 }); continue; }
      if (spent + 0.01 > ledger.budgetUsd) break;
      const check = await checkRollsTold(apiKey, { narration: turn.narration, rolls: rolls.map((roll) => roll.line), language: "ru" });
      spent += check.costUsdMicros / 1_000_000;
      rows.push({ file, arm: turn.variant?.label, probe, rolls: rolls.length, untold: check.untold.length, error: check.error, inTurn: (turn.diagnostics ?? []).find((d) => d.kind === "rolls_checked")?.untold ?? null });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
} finally {
  await writeFile(join(ROOT, "docs", "runs", `${run}.json`), `${JSON.stringify({ run, rows }, null, 2)}\n`, "utf8");
  await ledger.settle(spent, `docs/runs/${run}.json`);
}
const groups = new Map();
for (const row of rows) { const key = `${row.probe} · ${row.arm}`; (groups.get(key) ?? groups.set(key, []).get(key)).push(row); }
for (const [key, list] of groups) {
  const withRolls = list.filter((row) => row.rolls > 0);
  console.log(`${key}: final narration — ${withRolls.filter((row) => row.untold > 0).length} of ${withRolls.length} turns with rolls leave one untold (in-turn first drafts: ${withRolls.filter((row) => row.inTurn > 0).length}); errors ${list.filter((row) => row.error).length}`);
}
console.log(`spent $${spent.toFixed(4)}`);
