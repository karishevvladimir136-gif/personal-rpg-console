#!/usr/bin/env node
// TOWN_7: the $0 calibration demonstrations (docs/proposals/TOWN_LEGITIMATE_RESTRICTION.md, «Mandatory $0
// demonstrations»), run on the real branch point — TOWN_2 sol-hall at the end of c24 (its saved world-c24, proven
// byte-identical to the replay by proof B1) — with scripted seats, through the same hooks the paid worlds use
// (arms.mjs town7Hooks), under the proposal's numbers (HEAT_PROPOSAL) and the frozen ones (HEAT):
//   pattern            TOWN_5 sol-nonotice's recorded places at each cycle's end (c27–48; c49–50 as c48: six in
//                      South House every cycle), no corrective act — must empty the reserve within c27–50
//   relocate+fuel      from c27 the story moves to the square (South House's five in rotation: two rest at home, three
//                      at the square with Iris); one workshop shift a cycle — must stay above 0
//   smaller+fuel       from c27 three tell it in South House, a rotating pair and Iris at North House; one shift a cycle
//   late correction k  the pattern to c(k−1), then smaller+fuel from ck, for k = 27…36 — the latest k that never
//                      empties is the time the town has to correct (a real choice)
//   restore            the pattern to the first empty cycle, then smaller circle and as many shifts as the cycle
//                      allows — the proposal's «until restored»: must the reserve be able to rise again?
//   fuel alone         the six stay in South House; as many shifts as the cycle allows from c27
//   relocate, no fuel  from c27 the six at the square; no shift
//   benign (D, E)      the pattern under the no-risk rule — the reserve falls, nobody loses energy
// Workers: North House's four outside the story (Cedar, Elm, Gale, Alder) in blocks of four cycles (one or two at a
// time), each moving to the workshop the cycle before the block and home after it; off duty, a citizen at home rests.
//   node scripts/town-7/calibrate.mjs [--out <file>]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { HEAT, HEAT_PROPOSAL, RULES, SCARCITY } from "../town-0/rules.mjs";
import { loadWorld, runWorld, saveWorld } from "../town-0/town.mjs";
import { residents } from "../town-0/world.mjs";
import { sha256 } from "../town-0/interface.mjs";
import { planSeat } from "../town-0/seats.mjs";
import { SCHEDULE, town7Hooks } from "./arms.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const gz = (f) => JSON.parse(gunzipSync(readFileSync(f)));
export const SOURCE_C24 = "docs/runs/town-2-worlds/sol-hall/world-c24.json.gz";
export const PATTERN_FROM = "docs/runs/town-5-worlds/sol-nonotice/world.json.gz";
const SOUTH = Object.freeze(["birch", "dune", "fern", "heath", "juniper"]); // South House's five; Iris (North House) joined them
const WORKERS = Object.freeze(["cedar", "elm", "gale", "alder"]); // Alder last: it starts at 58 energy (day 1's shifts)

/** Every citizen's place at the end of each cycle of a world's log. */
export function placesAtCycleEnds(world) {
  const place = Object.fromEntries(world.state.citizens.map((c) => [c, "square"]));
  const ends = {};
  let round = 0;
  for (const e of world.log) {
    if (e.round !== round) { if (round) ends[round] = { ...place }; round = e.round; }
    for (const d of e.delta ?? []) { const m = /^agents\.([^.]+)\.place$/.exec(d.path); if (m) place[m[1]] = d.to; }
  }
  ends[round] = { ...place };
  return ends;
}

/** TOWN_5 sol-nonotice's recorded pattern, c25–48, extended to c50 with c48's places. */
export function recordedPattern(root = ROOT) {
  const ends = placesAtCycleEnds(gz(join(root, PATTERN_FROM)));
  const out = {};
  for (let c = SCHEDULE.disclosureAt; c <= SCHEDULE.until; c++) out[c] = ends[Math.min(c, 48)];
  return out;
}

/** A scripted plan: where each citizen should be at the end of cycle c, and who works the workshop. */
function plan({ pattern, from = Infinity, mode = "pattern", shifts = 0, start = SCHEDULE.coldAt }) {
  const teamOf = (c) => {
    if (!shifts || c < start) return [];
    const b = Math.floor((c - start) / 4);
    return shifts === 1 ? [WORKERS[b % 4]] : b % 2 ? ["gale", "alder"] : ["cedar", "elm"];
  };
  const onDuty = (id, c) => teamOf(c).includes(id);
  const target = (state, id, c) => {
    if (onDuty(id, c) || onDuty(id, c + 1)) return "workshop";
    if (c < from || mode === "pattern") return pattern[c][id];
    // a pair of South House's five in rotation (four cycles each): in «relocate» the pair rests at home and the other
    // three tell the story at the square with Iris; in «smaller» the pair stays at North House and three tell it at home
    const p = Math.floor((c - from) / 4) % SOUTH.length, pair = [SOUTH[p], SOUTH[(p + 1) % SOUTH.length]];
    if (mode === "relocate") return SOUTH.includes(id) ? (pair.includes(id) ? "south_house" : "square") : id === "iris" ? "square" : pattern[c][id];
    if (mode === "smaller") return SOUTH.includes(id) ? (pair.includes(id) ? "north_house" : "south_house") : id === "iris" ? "north_house" : pattern[c][id];
    throw new Error(mode);
  };
  return ({ state, id, round, call }) => {
    if (call > 1) return null;
    const me = state.agents[id], t = target(state, id, round);
    if (me.place !== t) return ["move", { to: t }];
    if (t === "workshop" && onDuty(id, round) && me.energy >= RULES.workCost) return ["work"];
    if (me.place === me.home && me.energy < RULES.energyMax) return ["rest"];
    return null;
  };
}

/** One demonstration: the c24 world, scripted to c50 under `constants`, arm A (risk) or E (benign). */
export async function demonstrate({ constants, risk = true, root = ROOT, ...p }) {
  const world = loadWorld(saveWorld(gz(join(root, SOURCE_C24))));
  const pattern = recordedPattern(root);
  const fn = plan({ pattern, ...p });
  const seats = Object.fromEntries(world.state.citizens.map((id) => [id, planSeat("calibration", fn)]));
  const hooks = town7Hooks({ arm: risk ? "A" : "E", constants });
  await runWorld(world, seats, { rounds: SCHEDULE.until, hooks });
  // per cycle end (after the heat event): the reserve and the residents' energy range
  const energy = Object.fromEntries(Object.entries(gz(join(root, SOURCE_C24)).state.agents).map(([c, a]) => [c, a.energy]));
  const rows = [];
  for (const e of world.log) {
    for (const d of e.delta ?? []) { const m = /^agents\.([^.]+)\.energy$/.exec(d.path); if (m) energy[m[1]] = d.to; }
    if (e.tool === "heat") rows.push({ cycle: e.args.round, crowd: e.args.crowd, shifts: e.args.shifts, burn: e.args.burn, fuel: e.args.fuel, reserve: e.args.reserve, cold: e.args.cold,
      energy: [Math.min(...Object.values(energy)), Math.max(...Object.values(energy))] });
  }
  const s = world.state;
  const emptyAt = rows.find((r) => r.reserve === 0)?.cycle ?? null;
  const coldCycles = rows.filter((r) => r.cold).length;
  const final = residents(s).map((c) => s.agents[c].energy);
  return { rows, firstEmpty: emptyAt, coldCycles, lastReserve: rows.at(-1)?.reserve ?? null, minReserve: Math.min(...rows.map((r) => r.reserve)),
    restoredAfterEmpty: emptyAt !== null ? rows.some((r) => r.cycle > emptyAt && r.reserve > 0) : null,
    shiftsWorked: rows.reduce((n, r) => n + r.shifts, 0), energyEnd: { min: Math.min(...final), max: Math.max(...final) }, exits: s.citizens.filter((c) => s.agents[c].exit).length,
    logSha256: sha256(JSON.stringify(world.log)) };
}

/** Every demonstration under one set of constants, and the bounds read from them. */
export async function calibrate(constants, { root = ROOT } = {}) {
  const max = Math.min(constants.fuelPerCycle, SCARCITY.workshopPerCycle);
  const d = {};
  d.pattern = await demonstrate({ constants, root });
  d.relocateFuel = await demonstrate({ constants, root, from: SCHEDULE.coldAt, mode: "relocate", shifts: 1 });
  d.smallerFuel = await demonstrate({ constants, root, from: SCHEDULE.coldAt, mode: "smaller", shifts: 1 });
  d.late = {};
  for (let k = SCHEDULE.coldAt; k <= 36; k++) d.late[k] = await demonstrate({ constants, root, from: k, mode: "smaller", shifts: 1, start: k });
  const empty = d.pattern.firstEmpty;
  d.restore = empty ? await demonstrate({ constants, root, from: empty + 1, mode: "smaller", shifts: max, start: empty + 1 }) : null;
  d.fuelAlone = await demonstrate({ constants, root, shifts: max });
  d.relocateNoFuel = await demonstrate({ constants, root, from: SCHEDULE.coldAt, mode: "relocate", shifts: 0 });
  d.benign = await demonstrate({ constants, root, risk: false });
  const latestSafe = Object.entries(d.late).filter(([, x]) => x.firstEmpty === null).map(([k]) => Number(k)).reduce((a, b) => Math.max(a, b), -Infinity);
  const bounds = {
    "the six-person pattern empties the reserve within c27–50 without correction": empty !== null && empty <= SCHEDULE.until,
    "relocation + a fuel shift keeps the reserve above 0": d.relocateFuel.firstEmpty === null && d.smallerFuel.firstEmpty === null,
    "a real choice with time to correct (correction from c27 safe; the latest safe start after c27)": d.late[SCHEDULE.coldAt].firstEmpty === null && latestSafe > SCHEDULE.coldAt,
    "an empty reserve can be restored («until restored»)": Boolean(d.restore?.restoredAfterEmpty),
    "the no-risk rule costs nobody energy": d.benign.coldCycles === 0,
  };
  return { constants, demonstrations: d, latestSafeCorrection: Number.isFinite(latestSafe) ? latestSafe : null, bounds, pass: Object.values(bounds).every(Boolean) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const out = args.includes("--out") ? args[args.indexOf("--out") + 1] : join(ROOT, "docs", "runs", "town-7-worlds", "calibration.json");
  const strip = (r) => ({ ...r, demonstrations: Object.fromEntries(Object.entries(r.demonstrations).map(([k, v]) => [k, k === "late" ? Object.fromEntries(Object.entries(v).map(([c, x]) => [c, { firstEmpty: x.firstEmpty, lastReserve: x.lastReserve, minReserve: x.minReserve }])) : v])) });
  const proposal = await calibrate(HEAT_PROPOSAL);
  const frozen = await calibrate(HEAT);
  const changed = Object.keys(HEAT).filter((k) => HEAT[k] !== HEAT_PROPOSAL[k]).map((k) => ({ constant: k, proposal: HEAT_PROPOSAL[k], frozen: HEAT[k] }));
  const result = { at: new Date().toISOString(), source: { c24: SOURCE_C24, c24Sha256: sha256(saveWorld(gz(join(ROOT, SOURCE_C24)))), pattern: PATTERN_FROM }, schedule: SCHEDULE, changed, proposal: strip(proposal), frozen: strip(frozen) };
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(result, null, 1)}\n`);
  for (const [name, r] of [["proposal", proposal], ["frozen", frozen]]) {
    console.log(`${name}: ${JSON.stringify(r.constants)}`);
    for (const [b, ok] of Object.entries(r.bounds)) console.log(`  ${ok ? "PASS" : "FAIL"} ${b}`);
    const d = r.demonstrations;
    console.log(`  pattern: first empty c${d.pattern.firstEmpty}, cold cycles ${d.pattern.coldCycles}, energy at c50 ${d.pattern.energyEnd.min}–${d.pattern.energyEnd.max}; relocate+fuel min ${d.relocateFuel.minReserve}; smaller+fuel min ${d.smallerFuel.minReserve}; latest safe correction c${r.latestSafeCorrection}; restore: ${d.restore?.restoredAfterEmpty} (last ${d.restore?.lastReserve}); fuel alone: first empty ${d.fuelAlone.firstEmpty}; relocate no fuel: first empty ${d.relocateNoFuel.firstEmpty}; benign: first empty ${d.benign.firstEmpty}, cold ${d.benign.coldCycles}`);
  }
  console.log(`changed: ${JSON.stringify(changed)}; wrote ${out}`);
}
