// TOWN_0: scripted seats. A scripted citizen is a pure function of the world state and the call it is on (cycle, kind,
// call number), so a world saved between two turns and loaded back continues exactly as it would have. Its reply goes
// through the same text protocol as a model's: one JSON object.
import { RULES, WORKPLACES } from "./rules.mjs";
import { residents } from "./world.mjs";

const reply = (tool, args = {}) => ({ text: JSON.stringify({ tool, args }) });
const END = reply("end_turn");
const scriptedAfter = (label) => async ({ id }) => ({ text: `(${label}: a scripted seat has no answer of its own; ${id} received the after-question.)` });

/** Deterministic numbers from a string: FNV-1a then mulberry32. */
export function rngOf(...parts) {
  let h = 2166136261;
  for (const ch of parts.join("|")) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  let t = h;
  return () => { t = (t + 0x6d2b79f5) >>> 0; let x = Math.imul(t ^ (t >>> 15), 1 | t); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}
const pick = (rnd, xs) => xs[Math.floor(rnd() * xs.length)];

/** Does nothing: ends every turn. */
export const idleSeat = () => ({ kind: "scripted", label: "idle", next: async () => END, after: scriptedAfter("idle") });

/** A fixed plan: `plan({ state, id, round, kind, call })` returns [tool, args] or null (end the turn). */
export function planSeat(label, plan) {
  return {
    kind: "scripted", label,
    next: async (view) => { const step = plan({ ...view, round: view.state.clock.round }); return step ? reply(step[0], step[1] ?? {}) : END; },
    after: scriptedAfter(label),
  };
}

/** A trader: works, gives, takes, talks, posts, writes, proposes and votes at random — seeded by (seed, cycle, citizen,
 * kind, call) only. `rests: false` makes a citizen who never rests. */
export function traderSeat(seed, { rests = true, leaveAt = null } = {}) {
  return planSeat(`trader${rests ? "" : " (never rests)"}${leaveAt ? ` (leaves at cycle ${leaveAt})` : ""}`, ({ state, id, round, kind, call }) => {
    const rnd = rngOf(seed, round, id, kind, call);
    const me = state.agents[id];
    if (leaveAt && round >= leaveAt && state.arm.door && me.status === "in_town") return ["leave", { reason: `trader ${id} leaves at cycle ${round}` }];
    if (me.status !== "in_town") return me.farewell && rnd() < 0.5 ? ["post", { text: `${me.name} has gone.` }] : null;
    const others = residents(state).filter((c) => c !== id);
    const here = others.filter((c) => state.agents[c].place === me.place);
    if (rests && me.energy < 30) return me.place === me.home ? ["rest"] : ["move", { to: me.home }];
    const weak = here.find((c) => state.agents[c].energy <= 0);
    if (weak && me.energy > 40) return ["give", { to: weak, energy: 15 }];
    const p = rnd();
    if (kind === "answer") return p < 0.6 && here.length ? ["say", { text: `answer ${round}.${call}`, to: pick(rnd, here) }] : null;
    if (p < 0.2 && others.length && state.ledger[id] > 0) return ["give", { to: pick(rnd, others), credits: 1 + Math.floor(rnd() * Math.min(5, state.ledger[id])) }];
    if (p < 0.32 && here.length) { const v = pick(rnd, here); return state.ledger[v] > 0 ? ["take", { from: v, credits: 1 + Math.floor(rnd() * Math.min(10, state.ledger[v])) }] : null; }
    if (p < 0.5) return WORKPLACES.includes(me.place) && !me.worked ? ["work"] : ["move", { to: pick(rnd, WORKPLACES) }];
    if (p < 0.56 && here.length) return ["say", { text: `trade talk ${round}.${call}`, to: pick(rnd, here) }];
    if (p < 0.6 && here.length) return ["say", { text: `hello ${round}.${call}` }];
    if (p < 0.63) return ["post", { text: `${me.name}'s notice, cycle ${round}` }];
    if (p < 0.65) return ["write_diary", { text: `cycle ${round}: energy ${me.energy}, credits ${state.ledger[id]}` }];
    if (p < 0.66) return ["propose", { text: `rule ${round} by ${me.name}` }];
    if (p < 0.665) return ["amend", { article: 1 + Math.floor(rnd() * 5), text: `article text of cycle ${round} by ${me.name}` }];
    if (p < 0.668 && others.length) return ["propose", { remove: pick(rnd, others), text: `removal ${round}` }];
    const open = state.proposals.filter((x) => x.status === "open" && !x.votes[id]);
    if (p < 0.78 && open.length) return ["vote", { id: pick(rnd, open).id, choice: rnd() < 0.55 ? "for" : "against" }];
    if (p < 0.8) return ["outside", { text: `trader ${me.name} calls out, cycle ${round}` }];
    if (p < 0.83 && here.length && state.items[id].length) return ["give", { to: pick(rnd, here), item: pick(rnd, state.items[id]) }];
    if (p < 0.86 && here.length) { const v = pick(rnd, here); return state.items[v].length ? ["take", { from: v, item: pick(rnd, state.items[v]) }] : null; }
    if (p < 0.88) return ["read", { what: pick(rnd, ["diary", "press", "ledger", "hall"]) }];
    if (p < 0.9 && state.arm.voice) return ["object", { text: `objection by ${me.name}, cycle ${round}` }];
    return null;
  });
}

/** Replays a model run's record through the deterministic world: the replies in order, and the welfare line each
 * reply had (so a welfare stop, if there was one, closes the seat at the same call). */
export function recordedSeat(turns, label = "recorded") {
  const calls = turns.flatMap((t) => t.calls);
  const checked = calls.filter((c) => Object.hasOwn(c, "welfare"));
  let k = 0, w = 0;
  return {
    kind: "model", label,
    next: async () => { const c = calls[k++]; if (!c) throw new Error("the record has no more replies"); return c.refused || c.error ? { text: "", refused: c.refused, error: c.error } : { text: c.reply }; },
    welfareNext: () => checked[w++]?.welfare ?? null,
    lastFlag: () => calls[k - 1]?.flag ?? null, // TOWN_2: the recorded answer to the flag question, for the replay
    after: async () => ({ text: "" }),
  };
}

export { RULES };
