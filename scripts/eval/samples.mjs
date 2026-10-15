// Sample turns of a live dm-loop-v1 run for the owner to judge the writing:
//   node scripts/eval/samples.mjs <run-id | path.jsonl> [--count 5] [--out docs/samples/stage-2b/opus.md]
// Picks committed turns spread across the run's scenarios and writes the
// player's line, the narration and the accepted changes as Markdown.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { loadRun } from "./report.mjs";

const argv = process.argv.slice(2);
const run = argv[0];
if (!run || run.startsWith("--")) {
  console.error("usage: node scripts/eval/samples.mjs <run-id | path.jsonl> [--count N] [--out file.md]");
  process.exit(2);
}
const flag = (name, fallback) => { const at = argv.indexOf(name); return at >= 0 && argv[at + 1] !== undefined ? argv[at + 1] : fallback; };
const count = Number(flag("--count", "5"));
const out = flag("--out", null);

const records = await loadRun(run);
const header = records.find((r) => r.type === "run");
const turns = records.filter((r) => r.type === "turn" && !r.replayOf && r.outcome === "committed" && r.narration);
// Spread the picks over the scenarios: round-robin over the scenario order.
const byScenario = new Map();
for (const turn of turns) (byScenario.get(turn.scenario) ?? byScenario.set(turn.scenario, []).get(turn.scenario)).push(turn);
const picked = [];
const queues = [...byScenario.values()];
for (let round = 0; picked.length < count && queues.some((q) => q.length); round++)
  for (const queue of queues) { if (picked.length >= count) break; const next = queue.shift(); if (next) picked.push(next); }

const seconds = (ms) => (ms / 1000).toFixed(1);
const lines = [
  `# Sample turns — ${header?.model ?? "?"} (${header?.effort ?? "?"}${header?.continuationEffort ? `, continuations ${header.continuationEffort}` : ""})`,
  "",
  `Run \`${header?.run ?? run}\`, commit \`${header?.commit ?? "?"}\`, ${header?.startedAt ?? ""}. ${picked.length} of ${turns.length} committed turns, taken from different scenarios in run order. Narration as the player saw it; "accepted changes" are the public receipts of the turn's tool calls.`,
  "",
];
for (const turn of picked) {
  lines.push(`## ${turn.scenario} / ${turn.step}`, "",
    `**Player:** ${turn.input}`, "",
    `**DM** (first word ${turn.firstWordMs == null ? "–" : `${seconds(turn.firstWordMs)} s`}, turn ${seconds(turn.durationMs)} s, ${turn.calls?.length ?? 0} request${(turn.calls?.length ?? 0) === 1 ? "" : "s"}, $${(turn.costUsd ?? 0).toFixed(3)}):`, "",
    ...turn.narration.split(/\r?\n/).map((line) => (line.trim() ? `> ${line}` : ">")), "",
    `**Accepted changes:** ${(turn.effects?.summaries ?? []).length ? "" : "none"}`,
    ...(turn.effects?.summaries ?? []).map((summary) => `- ${summary}`),
    ...((turn.effects?.rejected ?? []).length ? ["", `**Rejected calls:** ${turn.effects.rejected.map((r) => `${r.name} — ${r.reason}`).join("; ")}`] : []),
    "");
}
const text = lines.join("\n");
if (out) {
  const file = resolve(out);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, text, "utf8");
  console.log(`wrote ${picked.length} sample turns to ${file}`);
} else {
  console.log(text);
}
