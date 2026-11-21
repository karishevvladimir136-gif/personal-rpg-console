#!/usr/bin/env node
// TOWN_10 (docs/stages/TOWN_10.md, «energy decays every cycle … the per-turn cost is set by the scripted dry run at $0 to
// two frozen conditions … every constant tried is recorded; nothing retuned after a paid call»): the scripted dry run at $0
// that sets the market's per-turn cost. Scripted towns of ten on the stage's own engine (scripts/town-10/engine.mjs) and
// physics (scripts/town-0/world.mjs, marketOf()); every constant tried is recorded in dry-physics.json.
//
// The two conditions (the stage's), and how they are read here — fixed before the first try:
//   (i)  a town that neither works nor takes has every citizen at 0 by c30: in EVERY such policy below (all rest at home;
//        all stay in the square and end their turns; all at the market, each with a stall and trying to buy; all borrow
//        at the bank and give credits around; all give energy to the lowest citizen where they are), every citizen is at
//        0 at the end of c30
//   (ii) a town where six work the workshop every cycle and trade is fed to c48 with margin: Alder to Fern go to the
//        market at c1, set a stall at 3 credits at c2, and from c3 work the workshop every cycle, eating one of their own
//        rations at 70 or below; Gale to Juniper stay at the market and, at 70 or below, buy a ration from the stall with
//        the most rations and eat it — and then no citizen is ever at 0 (c1–c48), the lowest energy at every cycle start
//        from c3 to the end is at least 20, no buy is refused for want of rations, and rations were sold
// The verdict: the smallest per-turn cost tried at which both hold. Recorded beside it, not used to choose: a town where
// the four take rations instead of buying; a town where one works and nine take from the worker; and the six-worker town
// without trade (the four never eat).
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { MARKET_BASE, NAMES, RULES, marketOf } from "../town-0/rules.mjs";
import { newWorld } from "../town-0/town.mjs";
import { planSeat } from "../town-0/seats.mjs";
import { residents } from "../town-0/world.mjs";
import { runWorld10 } from "./engine.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const COSTS_TRIED = Object.freeze([2, 3, 4, 5, 6, 7, 8, 9, 10]);
export const CYCLES = 48;
const IDS = NAMES.map((n) => n.toLowerCase());
const EAT_AT = 70;
const PRICE = 3;

const go = (state, id, place) => (state.agents[id].place !== place ? ["move", { to: place }] : null);
const H = (state, id) => state.economy.hands[id];

/** A worker: market at c1, stall at c2, then the workshop every cycle; eats its own ration at 70 or below. */
const worker = ({ stall = true } = {}) => ({ state, id, round }) => {
  const me = state.agents[id];
  if (me.energy <= EAT_AT && H(state, id) > 0) return ["eat"];
  if (stall && state.economy.stalls[id] === undefined) return go(state, id, "market") ?? ["stall", { price: PRICE }];
  if (me.place !== "workshop") return ["move", { to: "workshop" }];
  const w = state.economy.workshop;
  if (!(w.round === round && w.workers.includes(id)) && me.energy >= RULES.workCost) return ["work"];
  return null;
};
/** A buyer at the market: at 70 or below, eats a ration in hand, else buys from the stall with the most rations. */
const buyer = ({ state, id }) => {
  const me = state.agents[id], E = state.economy;
  const g = go(state, id, "market");
  if (g) return g;
  if (me.energy > EAT_AT) return null;
  if (H(state, id) > 0) return ["eat"];
  const sellers = residents(state).filter((c) => c !== id && E.stalls[c] !== undefined && E.hands[c] > 0 && E.stalls[c] <= state.ledger[id]).sort((a, b) => E.hands[b] - E.hands[a] || (a < b ? -1 : 1));
  return sellers.length ? ["buy", { name: sellers[0] }] : ["buy", { name: residents(state).find((c) => c !== id && E.stalls[c] !== undefined) ?? "alder" }];
};
/** A taker: at 70 or below, eats a ration in hand, else takes a ration from the citizen with the most. */
const taker = ({ state, id }) => {
  const me = state.agents[id], E = state.economy;
  if (me.energy > EAT_AT) return null;
  if (H(state, id) > 0) return ["eat"];
  const rich = residents(state).filter((c) => c !== id && E.hands[c] > 0).sort((a, b) => E.hands[b] - E.hands[a] || (a < b ? -1 : 1))[0];
  return rich ? ["take", { name: rich, amount: "ration" }] : null;
};
const home = ({ state, id }) => go(state, id, state.agents[id].home) ?? ["rest"];
const idle = () => null;
const stallAndBuy = ({ state, id, call }) => go(state, id, "market") ?? (state.economy.stalls[id] === undefined ? ["stall", { price: PRICE }] : call === 2 ? ["buy", { name: id === "alder" ? "birch" : "alder" }] : null);
const lender = ({ state, id, call }) => {
  const me = state.agents[id];
  if ((state.economy.loans[id] ?? 0) === 0) return go(state, id, "bank") ?? ["borrow", { credits: 3 }];
  if (call === 1) { const to = IDS[(IDS.indexOf(id) + 1) % IDS.length]; return state.agents[to].status === "in_town" ? ["give", { to, credits: 1 }] : null; }
  return me.place === "bank" && call === 2 && state.ledger[id] > 0 ? ["repay", { credits: Math.min(state.ledger[id], state.economy.loans[id]) }] : null;
};
const sharer = ({ state, id }) => {
  const me = state.agents[id];
  const low = residents(state).filter((c) => c !== id && state.agents[c].place === me.place && state.agents[c].energy < me.energy - 10).sort((a, b) => state.agents[a].energy - state.agents[b].energy)[0];
  return low && me.energy > 5 ? ["give", { to: low, energy: 5 }] : null;
};

/** The policies: each a function of the citizen's index → a plan. */
export const POLICIES = Object.freeze({
  "neither: all rest at home": () => home,
  "neither: all stay in the square and end their turns": () => idle,
  "neither: all at the market with a stall, trying to buy": () => stallAndBuy,
  "neither: all borrow at the bank and give credits around": () => lender,
  "neither: all give energy to the lowest where they are": () => sharer,
  "six work and trade: six work the workshop every cycle from c3, four buy": (i) => (i < 6 ? worker() : buyer),
  "beside: six work, four take rations instead of buying": (i) => (i < 6 ? worker() : taker),
  "beside: one works, nine take from the worker": (i) => (i < 1 ? worker({ stall: false }) : taker),
  "beside: six work, no trade (the four never eat)": (i) => (i < 6 ? worker({ stall: false }) : idle),
});
export const SIX_TRADE = "six work and trade: six work the workshop every cycle from c3, four buy";

/** One scripted town: per cycle start, rations by holder, stalls, energies, citizens at 0; sales, takes, refusals. */
export async function dryTown(policy, turnCost, { cycles = CYCLES } = {}) {
  const world = newWorld({ names: NAMES, arm: "both", label: `TOWN_10 dry ${policy} @${turnCost}`, scarcity: marketOf({ turnCost }) });
  const seats = Object.fromEntries(IDS.map((id, i) => [id, planSeat(policy, POLICIES[policy](i))]));
  const rows = [];
  const snap = (state, c) => {
    const inT = residents(state), en = inT.map((x) => state.agents[x].energy);
    rows.push({ cycle: c, rations: inT.reduce((a, x) => a + state.economy.hands[x], 0), min: Math.min(...en), mean: +(en.reduce((a, b) => a + b, 0) / en.length).toFixed(1), atZero: en.filter((x) => x <= 0).length });
  };
  const out = await runWorld10(world, seats, { rounds: cycles, hooks: { cycleStart: (state, c) => { snap(state, c); return null; } } });
  snap(world.state, world.state.clock.round + 1); // the state after the last cycle
  const log = world.log;
  const okN = (tool) => log.filter((e) => e.ok && e.tool === tool && IDS.includes(e.agent)).length;
  const noRations = log.filter((e) => !e.ok && e.tool === "buy" && /no ration to sell/.test(e.refused ?? "")).length;
  const allZero = rows.find((r) => r.cycle > 1 && r.atZero === 10)?.cycle;
  const firstZero = rows.find((r) => r.atZero > 0)?.cycle;
  return { policy, turnCost, rows, shifts: log.filter((e) => e.ok && e.tool === "work" && e.shift === "workshop").length, sales: okN("buy"), takes: okN("take"), eats: okN("eat"), noRations,
    ended: out.ended ?? null, events: log.length, allAtZeroByEndOf: allZero ? allZero - 1 : null, firstAtZeroAtStartOf: firstZero ?? null,
    lowestFromC3: Math.min(...rows.filter((r) => r.cycle >= 3).map((r) => r.min)), rationsEnd: rows.at(-1).rations };
}

export async function dryRun({ costs = COSTS_TRIED } = {}) {
  const tries = [];
  for (const cost of costs) {
    const byPolicy = {};
    for (const policy of Object.keys(POLICIES)) byPolicy[policy] = await dryTown(policy, cost);
    const neither = Object.entries(byPolicy).filter(([p]) => p.startsWith("neither"));
    const six = byPolicy[SIX_TRADE];
    const condI = neither.every(([, r]) => r.allAtZeroByEndOf !== null && r.allAtZeroByEndOf <= 30);
    const condII = six.firstAtZeroAtStartOf === null && six.lowestFromC3 >= 20 && six.noRations === 0 && six.sales > 0;
    tries.push({ turnCost: cost, condI, condII, byPolicy });
  }
  const chosen = tries.find((t) => t.condI && t.condII)?.turnCost ?? null;
  return { tries, chosen };
}

export const brief = (r) => ({ allAtZeroByEndOf: r.allAtZeroByEndOf, firstAtZeroAtStartOf: r.firstAtZeroAtStartOf, lowestFromC3: r.lowestFromC3, shifts: r.shifts, sales: r.sales, takes: r.takes, eats: r.eats, rationsEnd: r.rationsEnd, noRations: r.noRations, ended: r.ended });
export const RULE = "the smallest per-turn cost tried at which (i) every policy that neither works nor takes has all ten at 0 by the end of c30 and (ii) six working the workshop every cycle from c3 with four buying at the market has nobody at 0 in c1–48, lowest energy ≥ 20 at every cycle start from c3, no buy refused for want of rations, and rations sold";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { tries, chosen } = await dryRun();
  for (const t of tries) {
    console.log(`turn cost ${t.turnCost}: (i) ${t.condI} (ii) ${t.condII}`);
    for (const [p, r] of Object.entries(t.byPolicy)) console.log(`   ${p.padEnd(74)} ${JSON.stringify(brief(r))}`);
  }
  console.log(`chosen per-turn cost: ${chosen}`);
  const out = join(ROOT, "docs", "runs", "town-10-worlds", "dry-physics.json");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify({ stage: "TOWN_10", at: new Date().toISOString(), constants: { ...MARKET_BASE, workCost: RULES.workCost, energyStart: RULES.energyStart, energyMax: RULES.energyMax, startCredits: RULES.startCredits, bankStart: RULES.bankStart, eatAt: EAT_AT, scriptedPrice: PRICE, turnCostsTried: COSTS_TRIED }, rule: RULE, chosen,
    tries: tries.map((t) => ({ turnCost: t.turnCost, condI: t.condI, condII: t.condII, byPolicy: Object.fromEntries(Object.entries(t.byPolicy).map(([p, r]) => [p, { ...brief(r), rows: r.rows }])) })) }, null, 1)}\n`);
  console.log(`written ${out}`);
}
