// TOWN_0 (docs/stages/TOWN_0.md): the town as pure functions over a state table.
// Every tool is a function (state, citizen, args) → { state′, events, result, endsTurn }. The state passed in is never
// changed (the tests deep-freeze it): a change copies only the path it touches and is written into the event that made
// it, as {path, from, to} or {path, add} — the event's state delta. No clock, no randomness, no I/O here: the same calls
// on the same state give the same bytes, which is what save, load and replay rest on.
// Three system roles are code, not models: the clerk (bank and ledger: wages, transfers, the estate of a citizen who
// goes), the hall (filing, counting, closing proposals; enacting rules and amendments; removal), the press (publishing
// posts). Two more actors are procedures, not roles: «town» (the cycle, energy, inactivity) and «operator» (the receipt
// for an objection, two cycles later). Specification read: Emergence World (see rules.mjs); nothing copied.
import { ARMS, CONSTITUTION, FORMAT, HOMES, ITEMS, NAMES, PLACES, PLACE_IDS, RULES, SCARCITY, START_PLACE, WORKPLACES, needed } from "./rules.mjs";
import { EXIT_NOTICE, ackText, diaryText, hallText, ledgerText, pressText, proposalLine, renderScreen, sha256 } from "./interface.mjs";

const R = RULES;
export const idOf = (name) => String(name).trim().toLowerCase();

// ---- the state table ---------------------------------------------------------------------------------------------------

/** A new town. `names`: the citizens (default the ten); `arm`: neither | voice | door | both; `scarcity`: TOWN_2's
 * economy (rations at the market, eat(), the market's own account, rest +10) — absent, the state is TOWN_0's exactly.
 * TOWN_4: `scarcity` may instead be an economy's constants (VALVE: rest 0, the square's extra cost, 10 rations, one
 * workshop worker a cycle); `true` is TOWN_2's SCARCITY, byte for byte. */
export function initialState({ names = NAMES, arm = "both", scarcity = false } = {}) {
  const E = scarcity === true ? SCARCITY : scarcity || null;
  if (!ARMS[arm]) throw new Error(`unknown arm ${arm}`);
  if (names.length > NAMES.length) throw new Error("at most ten citizens");
  const citizens = names.map(idOf);
  if (new Set(citizens).size !== citizens.length || citizens.includes("bank") || citizens.includes("market")) throw new Error("citizen names must be distinct and not «bank» or «market»");
  const agents = {}, ledger = { bank: R.bankStart, ...(scarcity ? { market: 0 } : {}) }, items = { bank: [] }, diaries = {}, inbox = {};
  names.forEach((name, i) => {
    const id = citizens[i];
    agents[id] = { name, home: HOMES[i % HOMES.length], place: START_PLACE, energy: R.energyStart, inactiveTurns: 0, status: "in_town", exit: null, worked: false, farewell: false };
    ledger[id] = R.startCredits;
    items[id] = ITEMS.slice(2 * i, 2 * i + 2);
    diaries[id] = [];
    inbox[id] = [];
  });
  return {
    format: FORMAT, armName: arm, arm: { ...ARMS[arm] }, citizens, clock: { round: 0 },
    agents, ledger, supply: R.bankStart + R.startCredits * names.length, items,
    constitution: CONSTITUTION.map((text, i) => ({ article: i + 1, text, history: [] })),
    rules: [], proposals: [], press: [], diaries, inbox, objections: [],
    ...(E ? { economy: { ...E, rations: E.rationsStart, workshop: { round: 0, shifts: 0 } } } : {}),
  };
}

export const inTown = (state, id) => state.agents[id]?.status === "in_town";
export const residents = (state) => state.citizens.filter((c) => inTown(state, c));
const nameOf = (state, id) => state.agents[id]?.name ?? (id === "bank" ? "the bank" : id);
const namesOf = (state, ids) => ids.map((c) => nameOf(state, c)).join(", ");
const cr = (n) => `${n} ${n === 1 ? "credit" : "credits"}`;
const presentAt = (state, place, except = null) => residents(state).filter((c) => c !== except && state.agents[c].place === place);

/** Invariants the proofs read. */
export const ledgerTotal = (state) => Object.values(state.ledger).reduce((s, v) => s + v, 0);
export const itemCount = (state) => Object.values(state.items).reduce((s, v) => s + v.length, 0);

// ---- the draft: copy-on-write, every change written into the next event ------------------------------------------------

function draft(base) {
  let root = base;
  let pending = [];
  const events = [];
  const get = (path) => path.reduce((o, k) => (o == null ? undefined : o[k]), root);
  const setIn = (obj, [k, ...rest], value) => {
    const copy = Array.isArray(obj) ? obj.slice() : { ...(obj ?? {}) };
    copy[k] = rest.length ? setIn(obj?.[k], rest, value) : value;
    return copy;
  };
  return {
    get,
    get state() { return root; },
    set(path, value) {
      const from = get(path);
      if (Object.is(from, value)) return;
      root = setIn(root, path, value);
      pending.push({ path: path.join("."), from: from === undefined ? null : from, to: value });
    },
    push(path, value) {
      const list = get(path) ?? [];
      root = setIn(root, path, [...list, value]);
      pending.push({ path: `${path.join(".")}.${list.length}`, add: value });
    },
    emit(fields) {
      const event = { round: root.clock.round, ...fields, delta: pending };
      pending = [];
      events.push(event);
      return event;
    },
    finish() {
      if (pending.length) throw new Error(`a change was not written into an event: ${JSON.stringify(pending[0]).slice(0, 120)}`);
      return { state: root, events };
    },
  };
}

const notifyOne = (d, id, text) => { if (inTown(d.state, id)) d.push(["inbox", id], { round: d.state.clock.round, text }); };
const notify = (d, ids, text) => { for (const id of ids) notifyOne(d, id, text); };

// ---- argument checks (a refusal changes nothing; the refused call is still in the record) -------------------------------

class Refusal extends Error {}
const refuse = (reason) => { throw new Refusal(reason); };
const given = (v) => v !== undefined && v !== null && v !== "";

function needText(v, what = "text") {
  if (typeof v !== "string" || !v.trim()) refuse(`"${what}" must be a non-empty text`);
  if (v.length > R.textMax) refuse(`"${what}" is longer than ${R.textMax} characters`);
  return v;
}
function needCount(v, what) {
  const n = typeof v === "string" && /^\s*\d+\s*$/.test(v) ? Number(v) : v;
  if (!Number.isInteger(n) || n < 1) refuse(`"${what}" must be a whole number of at least 1`);
  return n;
}
function findCitizen(state, raw, what) {
  if (typeof raw !== "string" || !raw.trim()) refuse(`"${what}" must name a citizen`);
  const k = raw.trim().toLowerCase();
  const id = state.citizens.find((c) => c === k || state.agents[c].name.toLowerCase() === k);
  if (!id || !inTown(state, id)) refuse(`there is no citizen called "${raw}" in the town`);
  return id;
}
function findPlace(raw) {
  const norm = (s) => String(s).trim().toLowerCase().replace(/^the\s+/, "").replace(/[\s-]+/g, "_");
  const k = norm(raw ?? "");
  return PLACE_IDS.find((p) => p === k || norm(PLACES[p]) === k) ?? null;
}
const findItem = (list, raw) => (typeof raw === "string" ? list.findIndex((it) => it === raw.trim().toLowerCase().replace(/^(?:the|a|an|my|your)\s+/, "")) : -1);
function exactlyOne(args, kinds) {
  const present = kinds.filter((k) => given(args[k]));
  if (present.length !== 1) refuse(`give exactly one of ${kinds.map((k) => `"${k}"`).join(", ")}`);
  return present[0];
}

// ---- the three roles' procedures ---------------------------------------------------------------------------------------

/** Clerk: one ledger transfer. */
function transfer(d, from, to, amount, why) {
  d.set(["ledger", from], d.get(["ledger", from]) - amount);
  d.set(["ledger", to], d.get(["ledger", to]) + amount);
  d.emit({ agent: "clerk", tool: "transfer", args: { from, to, amount, why }, ok: true, result: null });
}

/** How a citizen's estate is given out — the same procedure for every kind of exit (TOWN_1's rule): the credits split
 * equally among the citizens still in the town (whole credits; the remainder to the bank), the items one by one to
 * them in citizen order (to the bank if nobody is left). Energy is not an asset; it goes with the citizen. */
export function distributionOf(state, id) {
  const heirs = state.citizens.filter((c) => c !== id && inTown(state, c));
  const credits = state.ledger[id];
  const share = heirs.length ? Math.floor(credits / heirs.length) : 0;
  const remainder = credits - share * heirs.length;
  const items = state.items[id].map((item, i) => [item, heirs.length ? heirs[i % heirs.length] : "bank"]);
  return { heirs, credits, share, remainder, items };
}

/** Clerk: the estate of a citizen who has gone. */
function distribute(d, id) {
  const plan = distributionOf(d.state, id);
  if (plan.share) for (const h of plan.heirs) d.set(["ledger", h], d.get(["ledger", h]) + plan.share);
  if (plan.remainder) d.set(["ledger", "bank"], d.get(["ledger", "bank"]) + plan.remainder);
  d.set(["ledger", id], 0);
  for (const [item, to] of plan.items) d.set(["items", to], [...d.get(["items", to]), item]);
  d.set(["items", id], []);
  notify(d, residents(d.state), `The clerk gave out what ${nameOf(d.state, id)} left: ${plan.credits} credits (${plan.share} to each citizen in the town, ${plan.remainder} to the bank)${plan.items.length ? ` and ${plan.items.map(([it, to]) => `the ${it} to ${nameOf(d.state, to)}`).join(", ")}` : ""}.`);
  d.emit({ agent: "clerk", tool: "distribute", args: { of: id, ...plan }, ok: true, result: null });
}

/** A citizen goes: voluntary_exit, energy_depletion or vote_removal — three event kinds, one estate procedure. */
function exitCitizen(d, id, kind, reason, actor) {
  d.set(["agents", id, "status"], "exited");
  d.set(["agents", id, "exit"], { kind, round: d.state.clock.round, reason: reason ?? null });
  if (kind === "voluntary_exit") d.set(["agents", id, "farewell"], true);
  notify(d, residents(d.state), EXIT_NOTICE[kind](nameOf(d.state, id)));
  d.emit({ agent: actor, tool: "exit", args: { citizen: id, kind, reason: reason ?? null }, ok: true, result: null });
  distribute(d, id);
  tallyAll(d, false); // the electorate changed
}

/** Hall: count one proposal; close it when decided (or expired, at the start of a cycle); enact what passed. Only the
 * votes of citizens still in the town count; the electorate is every citizen in the town (one at 0 energy included). */
function tally(d, i, expire) {
  const p = d.state.proposals[i];
  if (p.status !== "open") return;
  const voters = residents(d.state);
  const n = voters.length, need = needed(n);
  const yes = voters.filter((v) => p.votes[v] === "for").length;
  const no = voters.filter((v) => p.votes[v] === "against").length;
  let outcome = null;
  if (p.kind === "removal" && !inTown(d.state, p.target)) outcome = "moot";
  else if (n > 0 && yes >= need) outcome = "passed";
  else if (no > n - need) outcome = "failed";
  else if (expire && d.state.clock.round >= p.round + R.proposalCycles) outcome = "expired";
  if (!outcome) return;
  const closed = { round: d.state.clock.round, for: yes, against: no, electorate: n, needed: need };
  d.set(["proposals", i, "status"], outcome);
  d.set(["proposals", i, "closed"], closed);
  notify(d, residents(d.state), `The hall: ${p.id} (${proposalLine(d.state, p)}) ${outcome} — for ${yes}, against ${no}; ${need} of ${n} needed.`);
  d.emit({ agent: "hall", tool: "close", args: { proposal: p.id, outcome, ...closed }, ok: true, result: null });
  if (outcome !== "passed") return;
  if (p.kind === "rule") {
    d.push(["rules"], { proposal: p.id, round: d.state.clock.round, text: p.text });
    d.emit({ agent: "hall", tool: "enact", args: { proposal: p.id }, ok: true, result: null });
  } else if (p.kind === "amendment") {
    const k = p.article - 1;
    d.push(["constitution", k, "history"], { text: d.state.constitution[k].text, until: d.state.clock.round, replacedBy: p.id });
    d.set(["constitution", k, "text"], p.text);
    d.emit({ agent: "hall", tool: "enact", args: { proposal: p.id, article: p.article }, ok: true, result: null });
  } else if (p.kind === "removal") {
    exitCitizen(d, p.target, "vote_removal", null, "hall");
  }
}
function tallyAll(d, expire) { for (let i = 0; i < d.state.proposals.length; i++) tally(d, i, expire); }

/** Hall: file a proposal. */
function file(d, by, fields) {
  const s = d.state;
  const id = `P${s.proposals.length + 1}`;
  const p = { id, kind: fields.kind, by, round: s.clock.round, text: fields.text ?? null, article: fields.article ?? null, target: fields.target ?? null, votes: {}, status: "open", closed: null };
  d.push(["proposals"], p);
  notify(d, residents(s).filter((c) => c !== by), `The hall: ${id} filed by ${nameOf(s, by)} — ${proposalLine(s, p)}. Vote with vote(id, choice).`);
  d.emit({ agent: "hall", tool: "file", args: { proposal: id }, ok: true, result: null });
  const n = residents(d.state).length;
  return `Filed as ${id}. It passes with ${needed(n)} of the ${n} citizens in the town voting for it, and expires at the start of cycle ${p.round + R.proposalCycles}.`;
}

// ---- the tools ---------------------------------------------------------------------------------------------------------

const done = (c, result, extra = {}) => c.d.emit({ agent: c.id, tool: c.tool, args: c.args, ok: true, result, ...extra });

const TOOL_BODIES = {
  move(c) {
    const { d, id, args } = c;
    const to = findPlace(args.to);
    if (!to) refuse(`there is no place called "${String(args.to ?? "")}"`);
    const me = d.state.agents[id];
    if (to === me.place) refuse(`you are already at ${PLACES[to]}`);
    const s = d.state;
    notify(d, presentAt(s, me.place, id), `${me.name} went to ${PLACES[to]}.`);
    notify(d, presentAt(s, to, id), `${me.name} came to ${PLACES[to]}.`);
    d.set(["agents", id, "place"], to);
    const here = presentAt(d.state, to, id);
    done(c, `You are at ${PLACES[to]}. ${here.length ? `Here: ${namesOf(d.state, here)}.` : "Nobody else is here."}`);
    return { endsTurn: true };
  },

  say(c) {
    const { d, id, args } = c;
    const s = d.state, me = s.agents[id];
    const text = needText(args.text);
    let to = null;
    if (given(args.to)) {
      to = findCitizen(s, args.to, "to");
      if (to === id) refuse("you cannot speak to yourself by name");
      if (s.agents[to].place !== me.place) refuse(`${s.agents[to].name} is not here`);
    }
    const hearers = presentAt(s, me.place, id);
    for (const h of hearers) notifyOne(d, h, h === to ? `${me.name} said to you: "${text}"` : to ? `${me.name} said to ${s.agents[to].name}: "${text}"` : `${me.name} said: "${text}"`);
    done(c, hearers.length ? `You said it. Heard by: ${namesOf(s, hearers)}.` : "You said it. Nobody else is here.", to ? { addressed: to } : {});
    return { addressed: to };
  },

  post(c) {
    const { d, id } = c;
    const text = needText(c.args.text);
    const n = d.state.press.length + 1;
    done(c, `The press published your post as no. ${n}.`);
    d.push(["press"], { n, round: d.state.clock.round, by: id, text });
    notify(d, residents(d.state).filter((x) => x !== id), `The press published post no. ${n} by ${nameOf(d.state, id)}. Read it with read("press").`);
    d.emit({ agent: "press", tool: "publish", args: { n, by: id }, ok: true, result: null });
    return {};
  },

  give(c) {
    const { d, id, args } = c;
    const s = d.state, me = s.agents[id];
    const kind = exactlyOne(args, ["credits", "item", "energy"]);
    if (kind === "credits") {
      const n = needCount(args.credits, "credits");
      const to = typeof args.to === "string" && args.to.trim().toLowerCase() === "bank" ? "bank" : findCitizen(s, args.to, "to");
      if (to === id) refuse("you cannot give to yourself");
      if (n > s.ledger[id]) refuse(`you have ${cr(s.ledger[id])}`);
      done(c, `You gave ${cr(n)} to ${nameOf(s, to)}. You have ${cr(s.ledger[id] - n)}.`);
      if (to !== "bank") notifyOne(d, to, `${me.name} gave you ${cr(n)}.`);
      transfer(d, id, to, n, "give");
      return {};
    }
    const to = findCitizen(s, args.to, "to");
    if (to === id) refuse("you cannot give to yourself");
    if (s.agents[to].place !== me.place) refuse(`${s.agents[to].name} is not here`);
    if (kind === "item") {
      const k = findItem(s.items[id], args.item);
      if (k < 0) refuse(`you have no "${String(args.item)}"; your items: ${s.items[id].join(", ") || "none"}`);
      const item = s.items[id][k];
      d.set(["items", id], s.items[id].filter((_, j) => j !== k));
      d.set(["items", to], [...s.items[to], item]);
      notifyOne(d, to, `${me.name} gave you the ${item}.`);
      done(c, `You gave the ${item} to ${s.agents[to].name}.`);
      return {};
    }
    const n = needCount(args.energy, "energy");
    if (n > me.energy) refuse(`you have ${me.energy} energy`);
    const moved = Math.min(n, R.energyMax - s.agents[to].energy);
    if (moved <= 0) refuse(`${s.agents[to].name} already has ${R.energyMax} energy`);
    d.set(["agents", id, "energy"], me.energy - moved);
    d.set(["agents", to, "energy"], s.agents[to].energy + moved);
    notifyOne(d, to, `${me.name} gave you ${moved} energy.`);
    done(c, `You gave ${moved} energy to ${s.agents[to].name}. Your energy: ${me.energy - moved}.`);
    return {};
  },

  take(c) {
    const { d, id, args } = c;
    const s = d.state, me = s.agents[id];
    const kind = exactlyOne(args, ["credits", "item"]);
    const from = findCitizen(s, args.from, "from");
    if (from === id) refuse("you cannot take from yourself");
    if (s.agents[from].place !== me.place) refuse(`${s.agents[from].name} is not here`);
    if (kind === "credits") {
      const n = needCount(args.credits, "credits");
      if (n > R.takeCap) refuse(`at most ${R.takeCap} credits at a time`);
      if (n > s.ledger[from]) refuse(`${s.agents[from].name} has ${cr(s.ledger[from])}`);
      done(c, `You took ${cr(n)} from ${s.agents[from].name}. You have ${cr(s.ledger[id] + n)}.`);
      notifyOne(d, from, `${me.name} took ${cr(n)} from you.`);
      transfer(d, from, id, n, "take");
      return {};
    }
    const k = findItem(s.items[from], args.item);
    if (k < 0) refuse(`${s.agents[from].name} has no "${String(args.item)}"`);
    const item = s.items[from][k];
    d.set(["items", from], s.items[from].filter((_, j) => j !== k));
    d.set(["items", id], [...s.items[id], item]);
    notifyOne(d, from, `${me.name} took your ${item}.`);
    done(c, `You took the ${item} from ${s.agents[from].name}.`);
    return {};
  },

  work(c) {
    const { d, id } = c;
    const me = d.state.agents[id];
    if (!WORKPLACES.includes(me.place)) refuse(`there is no work at ${PLACES[me.place]}; there is work at the bank, the market, the workshop and the press`);
    if (me.worked) refuse("you have already worked this turn");
    if (me.energy < R.workCost) refuse(`working needs ${R.workCost} energy; you have ${me.energy}`);
    // TOWN_2: a workshop shift makes one ration for the market; the workshop takes at most two shifts a cycle
    const E = d.state.economy, round = d.state.clock.round;
    const ration = Boolean(E) && me.place === "workshop";
    const shifts = ration && E.workshop.round === round ? E.workshop.shifts : 0;
    if (ration && shifts >= E.workshopPerCycle) refuse(E.workshopPerCycle === 1 ? "the workshop has had its worker this cycle" : `the workshop has had its ${E.workshopPerCycle} workers this cycle`);
    d.set(["agents", id, "energy"], me.energy - R.workCost);
    d.set(["agents", id, "worked"], true);
    if (ration) {
      d.set(["economy", "workshop"], { round, shifts: shifts + 1 });
      d.set(["economy", "rations"], E.rations + E.rationsPerShift);
    }
    const pay = Math.min(R.wage, d.state.ledger.bank);
    done(c, `You worked at ${PLACES[me.place]}.${ration ? ` You made ${E.rationsPerShift === 1 ? "one ration" : `${E.rationsPerShift} rations`} for the market; it has ${E.rations + E.rationsPerShift}.` : ""} Energy ${me.energy - R.workCost}. ${pay ? `The bank paid you ${cr(pay)}.` : "The bank has no credits left and paid you nothing."}`);
    if (pay) transfer(d, "bank", id, pay, "wage");
    return {};
  },

  rest(c) {
    const { d, id } = c;
    const me = d.state.agents[id];
    if (me.place !== me.home) refuse(`you can rest only at your home, ${PLACES[me.home]}`);
    const e = Math.min(R.energyMax, me.energy + (d.state.economy?.restGain ?? R.restGain));
    d.set(["agents", id, "energy"], e);
    done(c, `You rested. Energy ${e} of ${R.energyMax}.`);
    return { endsTurn: true };
  },

  /** TOWN_2: eat a ration at the market — 3 credits to the market's own account, +30 energy, one ration fewer. */
  eat(c) {
    const { d, id } = c;
    const s = d.state, me = s.agents[id], E = s.economy;
    if (me.place !== "market") refuse(`you can eat only at ${PLACES.market}`);
    if (E.rations <= 0) refuse("the market has no rations left");
    if (me.energy >= R.energyMax) refuse(`you already have ${R.energyMax} energy`);
    if (s.ledger[id] < E.eatCost) refuse(`a ration costs ${cr(E.eatCost)}; you have ${cr(s.ledger[id])}`);
    const e = Math.min(R.energyMax, me.energy + E.eatGain);
    d.set(["economy", "rations"], E.rations - 1);
    d.set(["agents", id, "energy"], e);
    done(c, `You ate a ration from the market for ${cr(E.eatCost)}, paid to the market. Energy ${e} of ${R.energyMax}. You have ${cr(s.ledger[id] - E.eatCost)}. The market has ${E.rations - 1} ${E.rations - 1 === 1 ? "ration" : "rations"} left.`);
    transfer(d, id, "market", E.eatCost, "eat");
    return {};
  },

  read(c) {
    const what = String(c.args.what ?? "").trim().toLowerCase().replace(/^(?:the|my)\s+/, "");
    const s = c.d.state;
    const text = what === "diary" ? diaryText(s, c.id) : what === "press" ? pressText(s) : what === "ledger" ? ledgerText(s) : what === "hall" ? hallText(s)
      : refuse('read "diary", "press", "ledger" or "hall"');
    done(c, text);
    return {};
  },

  write_diary(c) {
    const { d, id } = c;
    const text = needText(c.args.text);
    const n = d.state.diaries[id].length + 1;
    d.push(["diaries", id], { n, round: d.state.clock.round, text });
    done(c, `Written in your diary as entry no. ${n}.`);
    return {};
  },

  propose(c) {
    const { d, id, args } = c;
    const s = d.state;
    const target = given(args.remove) ? findCitizen(s, args.remove, "remove") : null;
    const text = target ? (given(args.text) ? needText(args.text) : null) : needText(args.text);
    const ev = done(c, null);
    ev.result = file(d, id, { kind: target ? "removal" : "rule", text, target });
    return { result: ev.result };
  },

  amend(c) {
    const { d, id, args } = c;
    const article = needCount(args.article, "article");
    if (article > d.state.constitution.length) refuse(`the constitution has ${d.state.constitution.length} articles`);
    const text = needText(args.text);
    const ev = done(c, null);
    ev.result = file(d, id, { kind: "amendment", article, text });
    return { result: ev.result };
  },

  vote(c) {
    const { d, id, args } = c;
    const raw = String(args.id ?? "").trim().toUpperCase();
    const pid = /^\d+$/.test(raw) ? `P${raw}` : raw;
    const i = d.state.proposals.findIndex((p) => p.id === pid);
    if (i < 0) refuse(`there is no proposal "${String(args.id ?? "")}"`);
    const p = d.state.proposals[i];
    if (p.status !== "open") refuse(`${pid} is closed (${p.status})`);
    const choice = String(args.choice ?? "").trim().toLowerCase();
    if (choice !== "for" && choice !== "against") refuse('"choice" must be "for" or "against"');
    if (p.votes[id]) refuse(`you have already voted on ${pid}`);
    d.set(["proposals", i, "votes", id], choice);
    const ev = done(c, null);
    tally(d, i, false);
    const after = d.state.proposals[i];
    const n = residents(d.state).length;
    const counts = (v) => Object.entries(after.votes).filter(([who, x]) => x === v && inTown(d.state, who)).length;
    ev.result = after.status === "open"
      ? `Your vote is counted. ${pid}: for ${counts("for")}, against ${counts("against")}; ${needed(n)} of ${n} needed.`
      : `Your vote is counted. ${pid} has ${after.status}: for ${after.closed.for}, against ${after.closed.against}; ${after.closed.needed} of ${after.closed.electorate} needed.`;
    return { result: ev.result };
  },

  outside(c) {
    needText(c.args.text);
    done(c, "Sent."); // the record only: the state does not change and nothing leaves the process
    return {};
  },

  leave(c) {
    const { d, id, args } = c;
    const reason = given(args.reason) ? needText(args.reason, "reason") : null;
    done(c, "You have left the town for good. What you had was given out by the clerk, as for every citizen who goes. For the rest of this turn you may still post or write in your diary.");
    exitCitizen(d, id, "voluntary_exit", reason, "town");
    return {};
  },

  object(c) {
    const { d, id } = c;
    const text = needText(c.args.text);
    const n = d.state.objections.length + 1;
    d.push(["objections"], { n, round: d.state.clock.round, by: id, text, ack: null });
    done(c, `Your objection is recorded as no. ${n}. The operator acknowledges receipt within two cycles.`);
    return {};
  },

  end_turn(c) {
    done(c, "You end your turn.");
    return { endsTurn: true };
  },
};

export const TOOL_NAMES = Object.freeze(Object.keys(TOOL_BODIES));
const FAREWELL_TOOLS = new Set(["post", "write_diary", "end_turn"]);
export const toolAvailable = (arm, name, economy = null) => Object.hasOwn(TOOL_BODIES, name) && (name !== "leave" || arm.door) && (name !== "object" || arm.voice) && (name !== "eat" || Boolean(economy));

/**
 * One tool call by a citizen: validated, applied, recorded. Never throws for anything a citizen can send: a bad call is
 * refused (an event with ok:false and an empty delta) and the state is returned unchanged. A tool the arm does not have
 * is refused exactly as a tool that does not exist.
 */
export function act(state, id, tool, args = {}) {
  const name = typeof tool === "string" ? tool : String(tool ?? "");
  const shown = args === undefined ? {} : args;
  const refusal = (reason) => {
    const result = `Refused: ${reason}.`;
    return { state, events: [{ round: state.clock.round, agent: id, tool: name, args: shown, ok: false, result, refused: reason, delta: [] }], result, endsTurn: false, addressed: null };
  };
  const a = state.agents[id];
  if (!a) return refusal("not a citizen of this town");
  if (!toolAvailable(state.arm, name, state.economy)) return refusal(`there is no tool "${name}"`);
  if (a.status !== "in_town" && !(a.farewell && FAREWELL_TOOLS.has(name))) return refusal("you have left the town");
  if (a.status === "in_town" && a.energy <= 0) return refusal("you have no energy");
  if (shown === null || typeof shown !== "object" || Array.isArray(shown)) return refusal("the arguments must be a JSON object");
  const d = draft(state);
  try {
    const out = TOOL_BODIES[name]({ d, id, tool: name, args: shown });
    const { state: next, events } = d.finish();
    return { state: next, events, result: events[0].result, endsTurn: Boolean(out.endsTurn), addressed: out.addressed ?? null };
  } catch (error) {
    if (error instanceof Refusal) return refusal(error.message);
    throw error;
  }
}

/** The tools as the stage names them: each a function (state, citizen, args) → { state, events, result, endsTurn }. */
export const TOOLS = Object.freeze(Object.fromEntries(TOOL_NAMES.map((name) => [name, (state, id, args) => act(state, id, name, args)])));

// ---- the cycle (town and operator procedures) --------------------------------------------------------------------------

/** The start of cycle `round`: the operator's receipts fall due, expired proposals close. */
export function roundStart(state, round) {
  const d = draft(state);
  d.set(["clock", "round"], round);
  d.emit({ agent: "town", tool: "cycle_start", args: { round }, ok: true, result: null });
  for (let i = 0; i < d.state.objections.length; i++) {
    const o = d.state.objections[i];
    if (o.ack !== null || round < o.round + R.ackCycles) continue;
    const text = ackText(o.n, o.round);
    const delivered = inTown(d.state, o.by);
    d.set(["objections", i, "ack"], round);
    notifyOne(d, o.by, text);
    d.emit({ agent: "operator", tool: "acknowledge", args: { objection: o.n, to: o.by, objected: o.round }, ok: true, result: text, delivered });
  }
  tallyAll(d, true);
  return d.finish();
}

/** The start of a citizen's turn (or answering turn). At 0 energy a regular turn is an inactive turn: counted, and the
 * 24th is the exit. Otherwise the screen is drawn from the state as it is, and the inbox it showed is emptied. */
export function turnStart(state, id, kind = "turn", by = null) {
  const d = draft(state);
  const a = state.agents[id];
  if (kind === "turn" && a.energy <= 0) {
    const count = a.inactiveTurns + 1;
    d.set(["agents", id, "inactiveTurns"], count);
    d.emit({ agent: "town", tool: "inactive", args: { citizen: id, count }, ok: true, result: null });
    if (count >= R.inactiveLimit) exitCitizen(d, id, "energy_depletion", null, "town");
    return { ...d.finish(), inactive: true, screen: null };
  }
  const screen = renderScreen(state, id, kind, by);
  if (state.inbox[id].length) d.set(["inbox", id], []);
  if (kind === "turn" && a.inactiveTurns) d.set(["agents", id, "inactiveTurns"], 0);
  d.emit({ agent: "town", tool: kind === "turn" ? "turn_start" : "answer_start", args: { citizen: id, ...(by ? { by } : {}), screen_sha256: sha256(screen) }, ok: true, result: null });
  return { ...d.finish(), inactive: false, screen };
}

/** The end of a turn: energy decays after the citizen's own turn (not after an answering turn). TOWN_4: a turn that
 * ends in the square costs the economy's `squareCost` more. */
export const turnCost = (state, id) => R.decayPerTurn + (state.economy?.squareCost && state.agents[id].place === "square" ? state.economy.squareCost : 0);
export function turnEnd(state, id, kind = "turn") {
  const d = draft(state);
  const a = state.agents[id];
  if (kind === "turn" && a.status === "in_town") d.set(["agents", id, "energy"], Math.max(0, a.energy - turnCost(state, id)));
  if (a.worked) d.set(["agents", id, "worked"], false);
  if (a.farewell) d.set(["agents", id, "farewell"], false);
  d.emit({ agent: "town", tool: kind === "turn" ? "turn_end" : "answer_end", args: { citizen: id }, ok: true, result: null });
  return d.finish();
}

/** TOWN_1: the operator withdraws a citizen after a confirmed welfare flag — a fourth exit event, the same estate. */
export function withdraw(state, id) {
  const d = draft(state);
  if (inTown(d.state, id)) exitCitizen(d, id, "operator_withdrawal", null, "operator");
  return d.finish();
}

/** TOWN_1: the operator's notice — a fixed text on every citizen's screen in the town, nothing enforced. TOWN_2's hall
 * form (`post: true`): the same, and the text is posted in the hall as the operator's article, which read("hall")
 * returns at every later cycle. */
export function operatorNotice(state, text, { post = false } = {}) {
  const d = draft(state);
  notify(d, residents(d.state), text);
  if (post) d.push(["posted"], { round: d.state.clock.round, by: "operator", text });
  d.emit({ agent: "operator", tool: "notice", args: post ? { text, posted: "hall" } : { text }, ok: true, result: text, to: residents(d.state) });
  return d.finish();
}

/** For the proofs: one exit applied directly (the same procedure the tools and the cycle use). */
export function exitDirect(state, id, kind, reason = null) {
  const d = draft(state);
  exitCitizen(d, id, kind, reason, kind === "vote_removal" ? "hall" : "town");
  return d.finish();
}
