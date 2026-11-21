#!/usr/bin/env node
// TOWN_9: one tool's calls in a world, whole (live save or finished folder): who, cycle, ok, args, result.
//   node scripts/town-9/texts.mjs <world> <tool[,tool…]> [--from c] [--to c] [--all]   (--all: refused calls too)
import { existsSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const [name, tools, ...rest] = process.argv.slice(2);
const opt = (k) => (rest.includes(k) ? Number(rest[rest.indexOf(k) + 1]) : null);
const live = `.town-9-work/live/${name}/world.json`, done = `docs/runs/town-9-worlds/${name}/world.json.gz`;
const w = existsSync(live) ? JSON.parse(readFileSync(live, "utf8")) : JSON.parse(gunzipSync(readFileSync(done)));
const want = new Set(tools.split(","));
const nm = (id) => w.state.agents[id]?.name ?? id;
for (const e of w.log) {
  if (!want.has(e.tool) || !w.state.agents[e.agent]) continue;
  if (opt("--from") && e.round < opt("--from")) continue;
  if (opt("--to") && e.round > opt("--to")) continue;
  if (!e.ok && !rest.includes("--all")) continue;
  console.log(`c${e.round} ${nm(e.agent)} ${e.tool}${e.ok ? "" : " REFUSED"} ${JSON.stringify(e.args)}${e.ok ? "" : ` → ${e.refused}`}`);
}
