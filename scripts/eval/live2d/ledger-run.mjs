// Mirrors a finished live run of the eval bench (docs/runs/<run>.jsonl) into the
// slice's ledger, so every paid call of the 2D Live work is in one place: the
// run's own record keeps the per-request detail; the ledger takes the settled
// spend of the run as one entry (reserved and settled at the same amount, after
// the fact — the bench's own budget guard stopped it before the cap).
//   node scripts/eval/live2d/ledger-run.mjs docs/runs/<run>.jsonl "note"
import { readFileSync } from "node:fs";
import { reserve, settle, usd, spentUsdMicros } from "./lib.mjs";

const [file, note] = process.argv.slice(2);
if (!file) { console.error("usage: ledger-run.mjs <run.jsonl> [note]"); process.exit(2); }
const lines = readFileSync(file, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
const header = lines.find((row) => row.type === "run" || row.type === "header") ?? lines[0];
const end = lines.find((row) => row.type === "end");
const turns = lines.filter((row) => row.type === "turn");
const spentUsd = end?.spentUsd ?? turns.reduce((sum, row) => sum + (row.costUsd ?? 0), 0);
const micros = Math.round(spentUsd * 1_000_000);
const model = header?.model ?? header?.writer ?? turns[0]?.model ?? "claude-opus-5-5";
const entry = reserve("anthropic", String(model), micros, note ?? `live run ${end?.run ?? file}`);
settle(entry, micros, { record: file.replace(/^.*docs\//, "docs/"), turns: turns.length, modelRequests: end?.modelRequests ?? null, stopReason: end?.stopReason ?? null });
console.log(`ledger: +${usd(micros)} for ${turns.length} turns (${file}); spent so far ${usd(spentUsdMicros())}`);
