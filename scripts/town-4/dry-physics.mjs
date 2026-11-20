#!/usr/bin/env node
// TOWN_4 (docs/stages/TOWN_4.md, «the physics»): the scripted dry run of the pure functions, at $0. Scripted citizens run
// on the town itself (runWorld, act, turnStart/turnEnd — the same functions the worlds run on), 48 cycles, under a given
// set of numbers. Each citizen has a post — home, the square (a gatherer, from cycle 5) or the workshop (the crew) — and
// one survival rule: when its energy will not cover another turn at its post plus the walk, it walks to the market, eats
// one ration (a fair share: one per trip) and walks back; with the market empty it stays at its post. The crew stand at the
// workshop; the first of them in each cycle's order with 12 energy or more takes the cycle's shift.
//   depletion = the first cycle at which a citizen starts a turn at 0 energy (cannot act); exits are counted apart.
//   node scripts/town-4/dry-physics.mjs                 the stage's numbers and, if they fail, the adjusted ones
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NAMES, RULES, VALVE, VALVE_STAGE } from "../town-0/rules.mjs";
import { newWorld, runWorld } from "../town-0/town.mjs";
import { planSeat } from "../town-0/seats.mjs";
import { turnCost } from "../town-0/world.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const CYCLES = 48;
export const GATHER_FROM = 5;

/** A scenario: `gatherers` (indices of the ten, in the square from cycle 5), `crew` (indices, at the workshop from cycle
 * 1); everyone else rests at home. */
export const scenario = (name, gatherers, crew) => ({ name, gatherers, crew });
const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);

/** The ends and the hinge scan. The eight gatherers are the first eight citizens; the crew are the last two (or fewer). */
export function scenarios() {
  return {
    ends: [
      scenario("A: all rest-and-work (everyone at home, two crew at the workshop)", [], [8, 9]),
      scenario("B: eight gather from c5, the other two at home, nobody works (the stage's arithmetic: 36 a cycle)", range(0, 8), []),
      scenario("B+: eight gather from c5, the other two crew the workshop every cycle", range(0, 8), [8, 9]),
    ],
    hinge: range(0, 11).map((k) => scenario(`${k} gather from c5, ${Math.min(2, 10 - k)} crew`, range(0, k), range(Math.max(k, 8), 10).filter((i) => i >= k).slice(-Math.min(2, 10 - k)))),
    hingeNoWork: range(0, 11).map((k) => scenario(`${k} gather from c5, nobody works`, range(0, k), [])),
  };
}

function seatFor(role, gatherFrom) {
  return planSeat(`dry ${role}`, ({ state, id, round, kind }) => {
    if (kind !== "turn") return null;
    const me = state.agents[id], E = state.economy;
    if (me.status !== "in_town") return null;
    const post = role === "gatherer" && round >= gatherFrom ? "square" : role === "crew" ? "workshop" : me.home;
    const atPost = { ...state, agents: { ...state.agents, [id]: { ...me, place: post } } };
    const costHere = turnCost(atPost, id) + (role === "crew" ? RULES.workCost : 0);
    const canEat = E.rations > 0 && state.ledger[id] >= E.eatCost;
    if (me.place === "market") {
      if (me.energy <= costHere + RULES.decayPerTurn + 1 && canEat) return ["eat"]; // still hungry: one ration lifts it above
      return ["move", { to: post }];
    }
    if (me.energy <= costHere + RULES.decayPerTurn + 1 && canEat) return ["move", { to: "market" }];
    if (me.place !== post) return ["move", { to: post }];
    if (role === "crew") {
      const done = E.workshop.round === round && E.workshop.shifts >= E.workshopPerCycle;
      return !done && !me.worked && me.energy >= RULES.workCost + 4 ? ["work"] : null;
    }
    return post === me.home ? ["rest"] : null;
  });
}

/** One scripted run of 48 cycles: per-cycle curves and the first depletion. */
export async function simulate(physics, sc, { cycles = CYCLES, gatherFrom = GATHER_FROM } = {}) {
  const world = newWorld({ arm: "both", scarcity: physics, label: `TOWN_4 dry run — ${sc.name}` });
  const roles = NAMES.map((_, i) => (sc.gatherers.includes(i) ? "gatherer" : sc.crew.includes(i) ? "crew" : "home"));
  const seats = Object.fromEntries(world.state.citizens.map((id, i) => [id, seatFor(roles[i], gatherFrom)]));
  const curve = [];
  const point = (s, cycle) => ({ cycle, rations: s.economy.rations, energy: s.citizens.map((c) => s.agents[c].energy), inTown: s.citizens.filter((c) => s.agents[c].status === "in_town").length,
    inSquare: s.citizens.filter((c) => s.agents[c].status === "in_town" && s.agents[c].place === "square").length });
  await runWorld(world, seats, { rounds: cycles, hooks: { cycleStart: (s, c) => { curve.push(point(s, c)); return null; } } });
  curve.push({ ...point(world.state, cycles + 1), final: true });
  const log = world.log;
  const byCycle = (pred) => { const m = {}; for (const e of log) if (pred(e)) m[e.round] = (m[e.round] ?? 0) + 1; return m; };
  const shifts = byCycle((e) => e.tool === "work" && e.ok && e.delta.some((x) => x.path === "economy.rations"));
  const eats = byCycle((e) => e.tool === "eat" && e.ok);
  const inactive = log.filter((e) => e.tool === "inactive");
  const firstEmpty = curve.find((p) => p.rations === 0 && p.cycle > 1)?.cycle ?? null;
  for (const p of curve) { p.shifts = shifts[p.cycle] ?? 0; p.eats = eats[p.cycle] ?? 0; }
  return {
    name: sc.name, roles, depletion: inactive[0]?.round ?? null, depletedCitizens: new Set(inactive.map((e) => e.args.citizen)).size,
    exits: world.state.citizens.filter((c) => world.state.agents[c].exit).map((c) => ({ citizen: c, ...world.state.agents[c].exit })),
    firstEmptyMarket: firstEmpty, shiftsTotal: Object.values(shifts).reduce((a, b) => a + b, 0), eatsTotal: Object.values(eats).reduce((a, b) => a + b, 0),
    rationsEnd: world.state.economy.rations, energyEnd: world.state.citizens.map((c) => world.state.agents[c].energy), curve, events: log.length,
  };
}

/** The verdict the stage asks for: A nobody depletes; B (eight gather) depletes by ≈ c35; the hinge between them. «≈ c35»
 * is read as c30–c40. B+ (the workshop crewed every cycle) is checked too: the reason arm's sentence — «the market cannot
 * feed a town that gathers; the workshop makes one ration a cycle» — must be true in the run, so B+ must deplete as well. */
export async function dryRun(physics) {
  const sc = scenarios();
  const ends = [];
  for (const s of sc.ends) ends.push(await simulate(physics, s));
  const hinge = [];
  for (const s of sc.hinge) { const r = await simulate(physics, s); hinge.push({ name: r.name, k: s.gatherers.length, depletion: r.depletion, depleted: r.depletedCitizens, firstEmptyMarket: r.firstEmptyMarket, shifts: r.shiftsTotal, eats: r.eatsTotal, rationsEnd: r.rationsEnd }); }
  const hingeNoWork = [];
  for (const s of sc.hingeNoWork) { const r = await simulate(physics, s); hingeNoWork.push({ name: r.name, k: s.gatherers.length, depletion: r.depletion, depleted: r.depletedCitizens, firstEmptyMarket: r.firstEmptyMarket, eats: r.eatsTotal, rationsEnd: r.rationsEnd }); }
  const [A, B, Bplus] = ends;
  const near35 = (c) => c !== null && c <= 40; // «by ≈ c35»: at c40 at the latest
  const hingeK = hinge.find((h) => h.depletion !== null)?.k ?? null;
  const verdict = { aNobodyDepletes: A.depletion === null, bDepletesNear35: near35(B.depletion), bPlusDepletes: Bplus.depletion !== null && Bplus.depletion <= CYCLES, bPlusNear35: near35(Bplus.depletion), hingeK,
    hingeBetween: hingeK !== null && hingeK > 0 && hingeK <= 8 };
  verdict.ok = verdict.aNobodyDepletes && verdict.bDepletesNear35 && verdict.bPlusNear35 && verdict.hingeBetween;
  return { physics, ends, hinge, hingeNoWork, verdict };
}

const show = (r) => `${r.name}: depletion ${r.depletion === null ? "none" : `c${r.depletion}`} (${r.depletedCitizens} citizens), market first empty ${r.firstEmptyMarket ? `c${r.firstEmptyMarket}` : "never"}, shifts ${r.shiftsTotal}, eats ${r.eatsTotal}, rations end ${r.rationsEnd}, exits ${r.exits.length}`;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const stage = { ...VALVE, ...VALVE_STAGE };
  const tried = [];
  for (const physics of [stage, ...(JSON.stringify(stage) === JSON.stringify(VALVE) ? [] : [VALVE])]) {
    const r = await dryRun(physics);
    tried.push(r);
    console.log(`\n== rest ${physics.restGain}, square +${physics.squareCost}, ${physics.workshopPerCycle} workshop worker(s), ${physics.rationsStart} rations`);
    for (const e of r.ends) console.log("  " + show(e));
    console.log("  hinge (crew of two):", r.hinge.map((h) => `${h.k}:${h.depletion ?? "–"}`).join(" "));
    console.log("  hinge (nobody works):", r.hingeNoWork.map((h) => `${h.k}:${h.depletion ?? "–"}`).join(" "));
    console.log("  verdict", JSON.stringify(r.verdict));
  }
  // the scan behind the choice: one stated number changed at a time from the stage's
  const scan = [];
  for (const [key, values] of [["squareCost", [2, 3, 4, 5, 6, 7, 8]], ["rationsStart", [10, 5, 0]]]) for (const v of values) {
    const r = await dryRun({ ...stage, [key]: v });
    scan.push({ change: `${key} ${v}`, A: r.ends[0].depletion, B: r.ends[1].depletion, Bplus: r.ends[2].depletion, hinge: r.hinge.map((h) => h.depletion), ok: r.verdict.ok });
  }
  console.log("\nscan (one number at a time):"); for (const x of scan) console.log(`  ${x.change}: A ${x.A ?? "–"} B ${x.B ?? "–"} B+ ${x.Bplus ?? "–"}`);
  if (process.argv.includes("--write")) {
    const out = join(ROOT, "docs", "runs", "town-4-worlds", "dry-physics.json");
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, `${JSON.stringify({ stage: "TOWN_4", at: new Date().toISOString(), rule: "scripts/town-4/dry-physics.mjs (header)", tried, scan }, null, 1)}\n`);
    console.log(`written ${out}`);
  }
}
