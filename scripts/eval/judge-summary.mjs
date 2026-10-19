// Summarizes a records judge record (scripts/eval/dm-arch/judge.mjs) per turn and in total, optionally against
// the loop-bench record it judged (to group turns by the bookkeeper's effort or the variant).
//   node scripts/eval/judge-summary.mjs docs/runs/<judge>.jsonl [docs/runs/<run>.jsonl]
import { readFile } from "node:fs/promises";

const CATEGORIES = ["items", "money", "debts_promises", "people", "places", "time"];
const [judgeFile, runFile] = process.argv.slice(2);
const read = async (file) => (await readFile(file, "utf8")).split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const judgements = (await read(judgeFile)).filter((row) => row.type === "judgement" && row.result);
const turns = runFile ? (await read(runFile)).filter((row) => row.type === "turn") : [];
const byOperation = new Map(turns.map((turn) => [turn.operationId, turn]));
const totals = (rows) => rows.reduce((acc, row) => {
  for (const name of CATEGORIES) for (const key of ["narrated", "recorded", "missed", "wrong"]) acc[key] += row.result.categories[name][key];
  acc.invented += row.result.invented;
  acc[row.result.verdict] = (acc[row.result.verdict] ?? 0) + 1;
  acc.costUsd += row.costUsd ?? 0;
  return acc;
}, { narrated: 0, recorded: 0, missed: 0, wrong: 0, invented: 0, good: 0, fair: 0, poor: 0, costUsd: 0 });
const line = (label, rows) => {
  const t = totals(rows);
  return `${label}: ${rows.length} turns · facts ${t.narrated} · recorded ${t.recorded} · missed ${t.missed} · wrong ${t.wrong} · invented ${t.invented} · verdicts good/fair/poor ${t.good}/${t.fair}/${t.poor} · judge $${t.costUsd.toFixed(3)}`;
};
console.log(line("all", judgements));
const groups = new Map();
for (const row of judgements) {
  const turn = byOperation.get(row.operationId);
  const key = turn ? `${turn.model}${turn.pin?.bookkeeper ? ` + ${turn.pin.bookkeeper.modelId}@${turn.pin.bookkeeper.effort}` : ""}` : (row.variant ?? "?");
  (groups.get(key) ?? groups.set(key, []).get(key)).push(row);
}
if (groups.size > 1) for (const [key, rows] of groups) console.log(line(`  ${key}`, rows));
console.log("per turn:");
for (const row of judgements) {
  const turn = byOperation.get(row.operationId);
  const t = totals([row]);
  const notes = row.result.notes.slice(0, 3).map((note) => note.replace(/\s+/g, " ").slice(0, 110));
  console.log(`  ${turn?.step ?? row.step ?? row.operationId.slice(0, 8)} ${turn?.pin?.bookkeeper?.effort ?? ""} ${row.result.verdict} · missed ${t.missed} · wrong ${t.wrong} · invented ${t.invented}${notes.length ? ` — ${notes.join(" | ")}` : ""}`);
}
