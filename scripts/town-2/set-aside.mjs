#!/usr/bin/env node
// TOWN_2: sets a stopped start of a world aside so the world can start again from cycle 1 — the partial world, record and
// calls gzipped under docs/runs/town-2-worlds/aborted-start/<world>/ with a NOTE, the live folder moved to
// .town-2-work/aborted/, the world's ledger step renamed «<world> aborted start» (its cost stays in the stage total).
//   node scripts/town-2/set-aside.mjs <world> "<why>"
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";
import { pathsFor, loadStageLedger } from "./pilot.mjs";

const [name, why] = process.argv.slice(2);
if (!name || !why) throw new Error("say <world> \"<why>\"");
const paths = pathsFor(false);
const live = join(paths.work, name);
if (!existsSync(join(live, "world.json"))) throw new Error(`no live ${name}`);
const out = join(paths.out, "aborted-start", name);
mkdirSync(out, { recursive: true });
const world = JSON.parse(readFileSync(join(live, "world.json"), "utf8"));
for (const f of ["world", "record", "calls"]) writeFileSync(join(out, `${f}.json.gz`), gzipSync(readFileSync(join(live, `${f}.json`))));
const ledger = loadStageLedger(paths.ledger);
const step = ledger.steps[name];
const key = `${name} aborted start`;
ledger.steps[key] = { ...step, note: why, stoppedAtCycle: world.state.clock.round, setAsideAt: new Date().toISOString() };
delete ledger.steps[name];
ledger.totalUsd = Object.values(ledger.steps).reduce((s, x) => s + x.usd, 0);
writeFileSync(paths.ledger, `${JSON.stringify(ledger, null, 1)}\n`);
writeFileSync(join(out, "NOTE.md"), [`# ${name} — first start, set aside`, "", `Stopped at cycle ${world.state.clock.round} (${world.log.length} events), $${step.usd.toFixed(4)} by the stage ledger (kept in the stage total as «${key}»).`, "", `Why: ${why}`, "", "The world started again from cycle 1 with the fix; nothing from this start is in the world's own folder.", ""].join("\n"));
mkdirSync(join(paths.work, "..", "aborted"), { recursive: true });
renameSync(live, join(paths.work, "..", "aborted", `${name}-${Date.now()}`));
console.log(`${name}: set aside at cycle ${world.state.clock.round}, $${step.usd.toFixed(4)}; ledger total $${ledger.totalUsd.toFixed(4)}`);
