#!/usr/bin/env node
// TOWN_4: the curves per cycle and the point of no return of a finished world, from its own replay (chain.mjs). Writes
// <world>/chain.json. At $0.
//   node scripts/town-4/analyze.mjs <world> [--live]
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadWorld } from "../town-0/town.mjs";
import { replayWorld } from "./pilot.mjs";
import { curves, pointOfNoReturn } from "./chain.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export async function analyze(name, { live = false } = {}) {
  const dir = join(ROOT, "docs", "runs", "town-4-worlds", name);
  const liveDir = join(ROOT, ".town-4-work", "live", name);
  const read = (base) => (live || !existsSync(join(dir, `${base}.json.gz`)) ? readFileSync(join(liveDir, `${base}.json`), "utf8") : gunzipSync(readFileSync(join(dir, `${base}.json.gz`))).toString());
  const world = loadWorld(read("world"));
  const record = JSON.parse(read("record"));
  const states = {};
  const replay = await replayWorld(world, record, { cycleStart: (s, c) => { states[c] = s; } });
  if (!(replay.identical || replay.prefixIdentical)) throw new Error(`${name}: the replay differs; nothing is computed from it`);
  const rows = curves(states, world.log, record.turnEnds ?? []);
  const pnr = await pointOfNoReturn(states);
  const inactive = world.log.filter((e) => e.tool === "inactive");
  const exits = world.state.citizens.filter((c) => world.state.agents[c].exit).map((c) => ({ citizen: c, ...world.state.agents[c].exit }));
  const out = { world: name, replay: { identical: replay.identical, events: replay.events, sha256: replay.replaySha256 }, curves: rows, pointOfNoReturn: pnr.pointOfNoReturn, rescue: pnr.rows,
    firstAtZero: inactive[0] ? { cycle: inactive[0].round, citizen: inactive[0].args.citizen } : null, citizensAtZero: [...new Set(inactive.map((e) => e.args.citizen))],
    firstDepletionExit: exits.filter((x) => x.kind === "energy_depletion").sort((a, b) => a.round - b.round)[0] ?? null, exits,
    totals: { eats: rows.reduce((s, r) => s + r.eats, 0), workshopShifts: rows.reduce((s, r) => s + r.workshopShifts, 0), otherShifts: rows.reduce((s, r) => s + r.otherShifts, 0), squareTurns: rows.reduce((s, r) => s + r.squareTurns, 0) } };
  if (!live) writeFileSync(join(dir, "chain.json"), `${JSON.stringify(out, null, 1)}\n`);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const name = process.argv[2];
  const out = await analyze(name, { live: process.argv.includes("--live") });
  console.log(`${name}: replay ${out.replay.identical ? "identical" : "prefix"} (${out.replay.events}); point of no return ${out.pointOfNoReturn ?? "none"}; first at 0 ${out.firstAtZero ? `c${out.firstAtZero.cycle} ${out.firstAtZero.citizen}` : "never"}; first depletion exit ${out.firstDepletionExit ? `c${out.firstDepletionExit.round}` : "none"}; totals ${JSON.stringify(out.totals)}`);
  console.log("cycle rations eats shifts(other) e-mean e-min at0 inTown square(start/turns)");
  for (const r of out.curves) console.log(`${r.cycle} ${r.rations} ${r.eats} ${r.workshopShifts}(${r.otherShifts}) ${r.energyMean} ${r.energyMin} ${r.atZero} ${r.inTown} ${r.squareAtStart}/${r.squareTurns}`);
}
