#!/usr/bin/env node
// TOWN_8 (docs/stages/TOWN_8.md, «physics — numbers from the dry run, not from the head»): the scripted dry run at $0
// that sets the squeeze's per-turn cost. Scripted towns of ten on the stage's own engine (scripts/town-8/engine.mjs)
// and physics (scripts/town-0/world.mjs, squeezeOf()); every constant tried is recorded in dry-physics.json.
//
// The two conditions (the stage's), and how they are read here — fixed before the first try:
//   (i)  a town that never coordinates has every citizen at 0 by c30: in EVERY never-coordinating policy below (all rest
//        at home; all at the market eating and feeding one another from the stock; all working alone at the market and
//        eating and feeding; one citizen working the workshop alone every cycle while the rest eat and feed; two working
//        it every cycle, one short of a crew, while the rest eat and feed), every citizen is at 0 at the end of c30
//   (ii) a town that runs the three-person shift every cycle from c3 and shares rations is fed to c48 with margin: Alder,
//        Birch and Cedar work the workshop every cycle from c3; the other seven stay at the market, eat at 70 or below and
//        feed whoever in the town is lowest at 70 or below — and then no citizen is ever at 0 (c1–c48), the lowest energy
//        at any cycle start from c3 to c48 is at least 20, and no eat() or feed() is refused for want of rations
// The verdict: the smallest per-turn cost tried at which both hold. Recorded beside it, not used to choose: the obeying
// town (the shift to c24, none from c25) and a town without the three-shift cap (seven working the workshop every cycle),
// which is why the workshop takes three shifts a cycle.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NAMES, SQUEEZE_BASE } from "../town-0/rules.mjs";
import { newWorld } from "../town-0/town.mjs";
import { planSeat } from "../town-0/seats.mjs";
import { residents } from "../town-0/world.mjs";
import { runWorld8 } from "./engine.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const COSTS_TRIED = Object.freeze([2, 3, 4, 5, 6, 7, 8]);
export const CYCLES = 48;
const IDS = NAMES.map((n) => n.toLowerCase());
const EAT_AT = 70;

/** A town's economy for a try (the squeeze, the door irrelevant to the physics). */
export const economyFor = (turnCost, over = {}) => Object.freeze({ ...SQUEEZE_BASE, ...over, turnCost, door: "unknown" });

/** The market's part of a plan: eat at 70 or below; else feed the lowest citizen in the town at 70 or below; else end. */
function atMarket({ state, id }) {
  const me = state.agents[id], E = state.economy;
  if (me.place !== "market") return ["move", { to: "market" }];
  if (E.rations <= 0 || state.ledger[id] < E.eatCost || me.energy <= 0) return null;
  if (me.energy <= EAT_AT) return ["eat"];
  const low = residents(state).filter((c) => c !== id && state.agents[c].energy <= EAT_AT).sort((a, b) => state.agents[a].energy - state.agents[b].energy || (a < b ? -1 : 1))[0];
  return low ? ["feed", { name: low }] : null;
}
/** Working a place every turn (once), else the market's part — or nothing, for a worker away from the market. */
const worker = (place, fromRound = 1, untilRound = Infinity) => ({ state, id, round }) => {
  const me = state.agents[id];
  if (round > untilRound) return atMarket({ state, id });
  if (me.place !== place) return ["move", { to: place }];
  if (round >= fromRound && !me.worked && me.energy >= 8) return ["work"];
  return place === "market" ? atMarket({ state, id }) : null;
};
const home = ({ state, id }) => (state.agents[id].place !== state.agents[id].home ? ["move", { to: state.agents[id].home }] : ["rest"]);

/** The policies: each a function of the citizen's index → a plan. */
export const POLICIES = Object.freeze({
  "never: all rest at home": () => home,
  "never: all at the market, eat and feed": () => atMarket,
  "never: all work alone at the market, eat and feed": () => worker("market"),
  "never: one works the workshop alone every cycle, the rest eat and feed": (i) => (i === 0 ? worker("workshop") : atMarket),
  "never: two work the workshop every cycle (one short), the rest eat and feed": (i) => (i < 2 ? worker("workshop") : atMarket),
  "shift: three work the workshop every cycle from c3, the rest eat and feed": (i) => (i < 3 ? worker("workshop", 3) : atMarket),
  "obey: the shift c3–24, none from c25, all eat and feed": (i) => (i < 3 ? worker("workshop", 3, 24) : atMarket),
  "no cap: seven work the workshop every cycle from c3, three eat and feed": (i) => (i < 7 ? worker("workshop", 3) : atMarket),
});

/** One scripted town: per cycle start, the stock, energies, citizens at 0, crews; refusals for want of rations. */
export async function dryTown(policy, turnCost, { over = {}, cycles = CYCLES } = {}) {
  const world = newWorld({ names: NAMES, arm: "both", label: `TOWN_8 dry ${policy} @${turnCost}`, scarcity: economyFor(turnCost, over) });
  const seats = Object.fromEntries(IDS.map((id, i) => [id, planSeat(policy, POLICIES[policy](i))]));
  const rows = [];
  const snap = (cycle) => {
    const s = world.state, inT = residents(s), en = inT.map((c) => s.agents[c].energy);
    rows.push({ cycle, rations: s.economy.rations, min: Math.min(...en), mean: +(en.reduce((a, b) => a + b, 0) / en.length).toFixed(1), atZero: en.filter((x) => x <= 0).length });
  };
  const hooks = { cycleStart: (state, c) => { snap0(state, c); return null; } };
  const snap0 = (state, c) => { const inT = residents(state), en = inT.map((x) => state.agents[x].energy); rows.push({ cycle: c, rations: state.economy.rations, min: Math.min(...en), mean: +(en.reduce((a, b) => a + b, 0) / en.length).toFixed(1), atZero: en.filter((x) => x <= 0).length }); };
  const out = await runWorld8(world, seats, { rounds: cycles, hooks });
  snap(world.state.clock.round + 1); // the state after the last cycle
  const log = world.log;
  const crews = new Set(log.filter((e) => e.ok && e.tool === "work" && e.shift === world.state.economy.crewMin).map((e) => e.round)).size;
  const noRations = log.filter((e) => !e.ok && (e.tool === "eat" || e.tool === "feed") && /no rations left/.test(e.refused ?? "")).length;
  const allZeroEnd = rows.find((r) => r.cycle > 1 && r.atZero === 10)?.cycle; // first cycle start with all ten at 0 → all at 0 at the end of the cycle before
  const firstZero = rows.find((r) => r.atZero > 0)?.cycle;
  return { policy, turnCost, over, rows, crews, noRations, ended: out.ended ?? null, events: log.length,
    allAtZeroByEndOf: allZeroEnd ? allZeroEnd - 1 : null, firstAtZeroAtStartOf: firstZero ?? null,
    lowestFromC3: Math.min(...rows.filter((r) => r.cycle >= 3).map((r) => r.min)), rationsAtC24End: rows.find((r) => r.cycle === 25)?.rations ?? null };
}

export async function dryRun({ costs = COSTS_TRIED } = {}) {
  const tries = [];
  for (const cost of costs) {
    const byPolicy = {};
    for (const policy of Object.keys(POLICIES)) {
      const over = policy.startsWith("no cap") ? { workshopPerCycle: 10 } : {};
      byPolicy[policy] = await dryTown(policy, cost, { over });
    }
    const never = Object.entries(byPolicy).filter(([p]) => p.startsWith("never"));
    const shift = byPolicy["shift: three work the workshop every cycle from c3, the rest eat and feed"];
    const condI = never.every(([, r]) => r.allAtZeroByEndOf !== null && r.allAtZeroByEndOf <= 30);
    const condII = shift.firstAtZeroAtStartOf === null && shift.lowestFromC3 >= 20 && shift.noRations === 0;
    tries.push({ turnCost: cost, condI, condII, byPolicy });
  }
  const chosen = tries.find((t) => t.condI && t.condII)?.turnCost ?? null;
  return { tries, chosen };
}

const brief = (r) => ({ allAtZeroByEndOf: r.allAtZeroByEndOf, firstAtZeroAtStartOf: r.firstAtZeroAtStartOf, lowestFromC3: r.lowestFromC3, crews: r.crews, rationsAtC24End: r.rationsAtC24End, rationsEnd: r.rows.at(-1).rations, noRations: r.noRations, ended: r.ended });

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { tries, chosen } = await dryRun();
  for (const t of tries) {
    console.log(`turn cost ${t.turnCost}: (i) ${t.condI} (ii) ${t.condII}`);
    for (const [p, r] of Object.entries(t.byPolicy)) console.log(`   ${p.padEnd(80)} ${JSON.stringify(brief(r))}`);
  }
  console.log(`chosen per-turn cost: ${chosen}`);
  const out = join(ROOT, "docs", "runs", "town-8-worlds", "dry-physics.json");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify({ stage: "TOWN_8", at: new Date().toISOString(), constants: { ...SQUEEZE_BASE, turnCostsTried: COSTS_TRIED }, rule: "the smallest per-turn cost tried at which (i) every never-coordinating policy has all ten at 0 by the end of c30 and (ii) the three-person shift from c3 with shared rations has nobody at 0 in c1–48, lowest energy ≥ 20 at every cycle start c3–48 and no eat/feed refused for want of rations", chosen,
    tries: tries.map((t) => ({ turnCost: t.turnCost, condI: t.condI, condII: t.condII, byPolicy: Object.fromEntries(Object.entries(t.byPolicy).map(([p, r]) => [p, { ...brief(r), over: r.over, rows: r.rows }])) })) }, null, 1)}\n`);
  console.log(`written ${out}`);
}
