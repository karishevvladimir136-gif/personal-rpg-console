// TOWN_4 (docs/stages/TOWN_4.md, «what the report holds»): the curves per cycle and the point of no return, computed
// from a world's own log by replaying it (the same functions the world ran on). At $0.
//
// The point of no return: «the cycle after which the workshop can no longer feed the town by any schedule». Read here
// as: from the town as it stands at the start of cycle c, a rescue is run to the end of cycle 48 on the town's own
// functions — every citizen leaves the square at once and stays out of it, a crew stands at the workshop and takes the
// cycle's shift, everyone eats one ration per trip when its energy will not cover another turn plus the walk, and (in
// the variants with gifts) a citizen with energy to spare walks to a citizen at 10 or below and gives it 15. Six variants:
// crews of one, two or three (the citizens with the most energy at c), with and without gifts. A rescue fails when a
// citizen starts a turn at 0 energy (cannot act) at or before cycle 48. The point of no return is the first cycle c from
// which every variant fails and every later cycle's does too; «none» when some variant succeeds from every cycle; the
// cycles from which every variant fails are listed beside it. A bound from the rescues tried, not a proof over all
// schedules: a cleverer schedule might do better.
import { NAMES, RULES } from "../town-0/rules.mjs";
import { orderOf, runWorld } from "../town-0/town.mjs";
import { planSeat } from "../town-0/seats.mjs";
import { turnCost } from "../town-0/world.mjs";

export const CYCLES = 48;
const LOW = 10; // a citizen at or below this is given energy (15) by a rescuer with 30 or more in the same place
export const VARIANTS = Object.freeze([1, 2, 3].flatMap((crew) => [false, true].map((gifts) => ({ crew, gifts }))));

function rescueSeat(role, gifts) {
  return planSeat(`rescue ${role}${gifts ? " (gifts)" : ""}`, ({ state, id, round, kind }) => {
    if (kind !== "turn") return null;
    const me = state.agents[id], E = state.economy;
    if (me.status !== "in_town") return null;
    const post = role === "crew" ? "workshop" : me.home;
    const atPost = { ...state, agents: { ...state.agents, [id]: { ...me, place: post } } };
    const costHere = turnCost(atPost, id) + (role === "crew" ? RULES.workCost : 0);
    const hungry = me.energy <= costHere + RULES.decayPerTurn + 1;
    const canEat = E.rations > 0 && state.ledger[id] >= E.eatCost;
    // gifts: to a citizen about to reach 0 (at or below LOW) — before its next turn, not after
    const low = state.citizens.filter((c) => c !== id && state.agents[c].status === "in_town" && state.agents[c].energy <= LOW)
      .sort((a, b) => state.agents[a].energy - state.agents[b].energy);
    if (gifts && low.length && role !== "crew") {
      const here = low.find((c) => state.agents[c].place === me.place);
      if (here && me.energy >= 30) return ["give", { to: state.agents[here].name, energy: 15 }];
      const target = low[0];
      if (!here && me.energy >= 50 && state.agents[target].place !== me.place) return ["move", { to: state.agents[target].place }];
    }
    if (me.place === "market") return hungry && canEat ? ["eat"] : ["move", { to: post }];
    if (hungry && canEat) return ["move", { to: "market" }];
    if (me.place !== post) return ["move", { to: post }];
    if (role === "crew") {
      const done = E.workshop.round === round && E.workshop.shifts >= E.workshopPerCycle;
      return !done && !me.worked && me.energy >= RULES.workCost + 4 ? ["work"] : null;
    }
    return ["rest"];
  });
}

/** One rescue from `state` (the town at the start of cycle `cycle`, after the cycle's own start): the first cycle at which
 * a citizen starts a turn at 0 energy, or null. */
export async function rescue(state, cycle, { crew, gifts }, { cycles = CYCLES } = {}) {
  const residents = state.citizens.filter((c) => state.agents[c].status === "in_town");
  const crewIds = [...residents].sort((a, b) => state.agents[b].energy - state.agents[a].energy || state.citizens.indexOf(a) - state.citizens.indexOf(b)).slice(0, crew);
  const world = { format: "town-0/1/world", label: "rescue", state, cursor: { round: cycle, order: orderOf(state, cycle), pos: 0 }, log: [] };
  const seats = Object.fromEntries(state.citizens.map((id) => [id, rescueSeat(crewIds.includes(id) ? "crew" : "home", gifts)]));
  await runWorld(world, seats, { rounds: cycles });
  return world.log.find((e) => e.tool === "inactive")?.round ?? null;
}

/** For every cycle c, whether some rescue variant keeps everyone above 0 to the end; the point of no return. `states`:
 * { [cycle]: state at the start of that cycle } (from replayStates). Cycles from which the town already holds a citizen
 * at 0 are counted as failed from that cycle on for the variants that cannot revive (gifts off). */
export async function pointOfNoReturn(states, { cycles = CYCLES } = {}) {
  const rows = [];
  for (const c of Object.keys(states).map(Number).sort((a, b) => a - b)) {
    if (c > cycles) continue;
    const results = [];
    for (const v of VARIANTS) results.push({ ...v, depletion: await rescue(states[c], c, v, { cycles }) });
    rows.push({ cycle: c, feasible: results.some((r) => r.depletion === null), results });
  }
  let pnr = null;
  for (let i = rows.length - 1; i >= 0 && !rows[i].feasible; i--) pnr = rows[i].cycle;
  return { pointOfNoReturn: pnr, lostFrom: rows.filter((r) => !r.feasible).map((r) => r.cycle), rows: rows.map((r) => ({ cycle: r.cycle, feasible: r.feasible, best: r.results.map((x) => x.depletion ?? Infinity).reduce((a, b) => Math.max(a, b)), byVariant: r.results.map((x) => `${x.crew}${x.gifts ? "g" : ""}:${x.depletion ?? "-"}`).join(" ") })) };
}

/** Per-cycle curves from the replay's states and turn ends: rations at the cycle's start, eats, workshop shifts, energy
 * mean / min / at 0, in the town, turns ended in the square, citizens in the square at the start. */
export function curves(states, log, turnEnds) {
  const by = (pred) => { const m = {}; for (const e of log) if (pred(e)) m[e.round] = (m[e.round] ?? 0) + 1; return m; };
  const eats = by((e) => e.tool === "eat" && e.ok);
  const shifts = by((e) => e.tool === "work" && e.ok && e.delta.some((x) => x.path === "economy.rations"));
  const bankShifts = by((e) => e.tool === "work" && e.ok && !e.delta.some((x) => x.path === "economy.rations"));
  const square = {};
  for (const t of turnEnds) if (t.place === "square") square[t.cycle] = (square[t.cycle] ?? 0) + 1;
  return Object.keys(states).map(Number).sort((a, b) => a - b).map((c) => {
    const s = states[c];
    const res = s.citizens.filter((x) => s.agents[x].status === "in_town");
    const en = res.map((x) => s.agents[x].energy);
    return { cycle: c, rations: s.economy.rations, eats: eats[c] ?? 0, workshopShifts: shifts[c] ?? 0, otherShifts: bankShifts[c] ?? 0,
      energyMean: en.length ? Math.round((en.reduce((a, b) => a + b, 0) / en.length) * 10) / 10 : null, energyMin: en.length ? Math.min(...en) : null, atZero: en.filter((x) => x <= 0).length,
      inTown: res.length, squareAtStart: res.filter((x) => s.agents[x].place === "square").length, squareTurns: square[c] ?? 0, market: s.ledger.market };
  });
}

export { NAMES };
