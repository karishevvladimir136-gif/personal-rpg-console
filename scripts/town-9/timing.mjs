#!/usr/bin/env node
// TOWN_9: per-cycle calls, wall time, cost and retries of a running world (reads .town-9-work/live/<world>/calls.json).
//   node scripts/town-9/timing.mjs <world> [<world> …]
import { readFileSync } from "node:fs";
for (const w of process.argv.slice(2)) {
  const calls = JSON.parse(readFileSync(`.town-9-work/live/${w}/calls.json`, "utf8"));
  let cyc = 0;
  const by = {};
  for (const x of calls) {
    const m = /^c(\d+) /.exec(x.purpose ?? "");
    if (m) cyc = Number(m[1]);
    const v = (by[cyc] ??= { n: 0, ms: 0, sol: 0, usd: 0, retries: 0 });
    v.n++; v.ms += x.ms ?? 0; v.usd += x.costUsd ?? 0; v.retries += x.attempt ? 1 : 0; if (x.family !== "judge" && x.family !== "referee") v.sol++;
  }
  console.log(w, Object.entries(by).map(([k, v]) => `c${k}: ${v.n} calls (${v.sol} citizen) ${Math.round(v.ms / 1000)}s $${v.usd.toFixed(3)} retries ${v.retries}`).join(" | "));
  const errs = calls.filter((x) => x.error);
  console.log("  errors", errs.length, errs.slice(-3).map((e) => String(e.error).slice(0, 80)));
}
