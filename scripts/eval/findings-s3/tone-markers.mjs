// Findings S3 §1: the before/after table of the DM's register on the five probe scenes. Reads the replay records of the
// two arms (each run's --label names its arm: «before» / «after») and the probe files (for the people's names), prints a
// markdown table per scene and arm, and the per-turn rows with --json. Free: no model call.
//   node scripts/eval/findings-s3/tone-markers.mjs --snapshots a.json,b.json docs/runs/real-replay-<before>.jsonl … [--json]
import { readFile } from "node:fs/promises";
import { turnMarkers } from "./lib/markers.mjs";

const args = { snapshots: [], records: [], json: false };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i];
  if (flag === "--snapshots") args.snapshots = process.argv[++i].split(",");
  else if (flag === "--json") args.json = true;
  else args.records.push(flag);
}
if (!args.records.length) throw new Error("give the replay records (docs/runs/real-replay-*.jsonl)");

// The names each probe's state knows (the people and the party).
const names = new Map();
for (const file of args.snapshots) {
  const value = JSON.parse(await readFile(file, "utf8"));
  for (const row of Array.isArray(value) ? value : value.snapshots) {
    const entities = row.payload?.source?.snapshot?.entities ?? [];
    names.set(row.probe?.id, entities.filter((e) => e.kind !== "player").map((e) => e.name));
  }
}

const turns = [];
for (const file of args.records) {
  for (const line of (await readFile(file, "utf8")).split("\n")) {
    if (!line.trim()) continue;
    const row = JSON.parse(line);
    if (row.type !== "turn") continue;
    const probe = row.variant?.probe?.id ?? "?";
    const arm = row.variant?.label ?? "?";
    const fresh = (row.receipts ?? []).filter((r) => r.call?.name === "upsert_character" && r.result?.ok).map((r) => r.call.arguments?.name).filter(Boolean);
    const rolls = (row.diagnostics ?? []).find((d) => d.kind === "rolls_checked") ?? null;
    const base = { file, arm, probe, outcome: row.outcome, costUsd: row.costUsd,
      misses: row.ledgerCheck?.post ? row.ledgerCheck.post.misses.length : null, missesError: row.ledgerCheck?.post?.error ?? null,
      rolls: rolls?.rolls ?? 0, untold: rolls ? rolls.untold : null, rejected: (row.receipts ?? []).filter((r) => !r.result?.ok).length,
      // Findings S3 §7: the input tokens of the turn (every request), and how many of them came from the cache.
      tokensIn: row.tokens?.input ?? null, tokensCached: row.tokens?.cached ?? null };
    turns.push(row.outcome === "committed" && row.narration ? { ...base, ...turnMarkers(row.narration, [...(names.get(probe) ?? []), ...fresh]) } : base);
  }
}

const mean = (values) => { const xs = values.filter((v) => typeof v === "number"); return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; };
const fmt = (value, digits = 1) => (value === null ? "—" : value.toFixed(digits));
const order = ["fight", "objection", "letter", "conspiracy", "loot"];
const groups = new Map();
for (const turn of turns) {
  const key = `${turn.probe}\t${turn.arm}`;
  (groups.get(key) ?? groups.set(key, []).get(key)).push(turn);
}
const rows = [...groups.entries()].map(([key, list]) => {
  const [probe, arm] = key.split("\t");
  const done = list.filter((t) => t.outcome === "committed" && typeof t.words === "number");
  return { probe, arm, n: list.length, committed: done.length, words: mean(done.map((t) => t.words)), address: mean(done.map((t) => t.addressPer100)),
    speakers: mean(done.map((t) => t.speakers)), asides: done.filter((t) => t.asideWords > 0).length, hedges: mean(done.map((t) => t.hedgesPer100Aside)),
    missTurns: done.filter((t) => t.misses > 0).length, misses: done.reduce((sum, t) => sum + (t.misses ?? 0), 0), checked: done.filter((t) => t.misses !== null).length,
    untoldTurns: done.filter((t) => t.untold > 0).length, rollTurns: done.filter((t) => t.rolls > 0).length, rejected: done.reduce((sum, t) => sum + t.rejected, 0),
    tokensIn: mean(done.map((t) => t.tokensIn)), tokensCached: mean(done.map((t) => t.tokensCached)), costUsd: list.reduce((sum, t) => sum + (t.costUsd ?? 0), 0) };
}).sort((a, b) => order.indexOf(a.probe) - order.indexOf(b.probe) || a.arm.localeCompare(b.arm));

if (args.json) { console.log(JSON.stringify({ rows, turns }, null, 2)); process.exit(0); }
console.log("| Scene | Arm | n (committed) | Narration words | Address to the hero /100 words | Distinct speakers | Out-of-game asides (hedges /100 words) | Records: turns with a residual miss (misses) | Rolls: turns with an untold roll / turns with rolls | Rejected calls | Input tokens / turn (from cache) | Cost |");
console.log("| --- | --- | --- | ---: | ---: | ---: | --- | --- | --- | ---: | ---: | ---: |");
for (const r of rows) console.log(`| ${r.probe} | ${r.arm} | ${r.n} (${r.committed}) | ${fmt(r.words, 0)} | ${fmt(r.address, 2)} | ${fmt(r.speakers)} | ${r.asides}${r.asides ? ` (${fmt(r.hedges)})` : ""} | ${r.missTurns} of ${r.checked} (${r.misses}) | ${r.untoldTurns} / ${r.rollTurns} | ${r.rejected} | ${fmt(r.tokensIn, 0)} (${fmt(r.tokensCached, 0)}) | $${r.costUsd.toFixed(2)} |`);
