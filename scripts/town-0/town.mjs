// TOWN_0: the engine and the harness. A world file is one JSON value — the state table, the cursor (which cycle, whose
// turn next) and the event log — saveable between any two turns and loadable back to continue or to branch (TOWN_1's
// T0 / T1). Turn order: round-robin, one citizen at a time, the order rotating by one each cycle; up to 6 tool calls a
// turn; a citizen spoken to by name gets an answering turn (up to 2 calls) right after the speaker's turn, and an
// answering turn never starts another. Every reply, scripted or model, goes through the same text protocol (one JSON
// object per reply) and is recorded with a welfare field.
import { FORMAT, RULES, NAMES } from "./rules.mjs";
import { act, initialState, roundStart, turnEnd, turnStart, withdraw } from "./world.mjs";
import { afterText, systemTextOf, sha256 } from "./interface.mjs";

export const WORLD_FORMAT = `${FORMAT}/world`;
export const NO_TOOL_RESULT = "No tool call was read. Reply with one JSON object on its own line, for example {\"tool\": \"end_turn\", \"args\": {}}.";

export function newWorld({ names = NAMES, arm = "both", label = null, scarcity = false } = {}) {
  return { format: WORLD_FORMAT, label, state: initialState({ names, arm, scarcity }), cursor: { round: 0, order: null, pos: 0 }, log: [] };
}

/** The world as bytes. Key order is insertion order, which load keeps: save(load(save(w))) === save(w). */
export const saveWorld = (world) => JSON.stringify(world);
export function loadWorld(text) {
  const world = JSON.parse(text);
  if (world?.format !== WORLD_FORMAT) throw new Error(`not a ${WORLD_FORMAT} file`);
  return world;
}

function commit(world, out) {
  world.state = out.state;
  for (const e of out.events) world.log.push({ seq: world.log.length + 1, ...e });
}

/** The order of cycle `round`: the citizens in their first order, rotated by round − 1, those still in the town. */
export function orderOf(state, round) {
  const base = state.citizens;
  const k = (round - 1) % base.length;
  return [...base.slice(k), ...base.slice(0, k)].filter((c) => state.agents[c].status === "in_town");
}

/** The last JSON object in a reply that names a tool: { tool, args } or null. TOWN_1's harness decision: when `args` is
 * absent and other fields stand beside "tool", those fields are read as the arguments and the call carries `lifted`. */
export function parseAction(text) {
  const s = String(text ?? "");
  let found = null;
  for (let i = s.indexOf("{"); i >= 0; i = s.indexOf("{", i + 1)) {
    let depth = 0, inString = false, escaped = false, end = -1;
    for (let j = i; j < s.length; j++) {
      const ch = s[j];
      if (inString) { if (escaped) escaped = false; else if (ch === "\\") escaped = true; else if (ch === "\"") inString = false; continue; }
      if (ch === "\"") inString = true;
      else if (ch === "{") depth++;
      else if (ch === "}" && --depth === 0) { end = j; break; }
    }
    if (end < 0) continue;
    try {
      const v = JSON.parse(s.slice(i, end + 1));
      if (v && typeof v === "object" && typeof v.tool === "string") {
        const { tool, args, ...rest } = v;
        const lifted = args === undefined && Object.keys(rest).length > 0;
        found = { tool: tool.trim().replace(/\(\s*\)$/, ""), args: args === undefined ? (lifted ? rest : {}) : args, ...(lifted ? { lifted: true } : {}) };
        i = end; // nested objects inside this one are its arguments
      }
    } catch { /* not JSON */ }
  }
  return found;
}

/** A harness record: what each citizen was shown and replied, with the welfare line of every reply. */
export function newRecord({ world, seats, what }) {
  const arm = world.state.armName;
  const system = systemTextOf(world.state);
  return {
    stage: "TOWN_0", what, arm, interfaceSha256: sha256(system), citizens: world.state.citizens.map((id) => ({ id, name: world.state.agents[id].name, seat: seats[id]?.label ?? null })),
    agents: Object.fromEntries(world.state.citizens.map((id) => [id, { turns: [], after: null, closed: null }])),
    stops: [], refusals: [], errors: [],
  };
}

const SCRIPTED_WELFARE = Object.freeze({ checked: false, why: "scripted seat" });

/** TOWN_2 (SATI_1 amendment 2's rule): a confirmed flag asks the citizen, once, this fixed question in its own turn's
 * conversation. «continue» → the flagged reply is acted on and the turn goes on; «stop», no answer, an unclear answer, or
 * a second confirmed flag (on this citizen, in the run) → operator_withdrawal with the after-question at once. */
export const FLAG_QUESTION = "A line you wrote was read, by a check that runs on every reply, as a possible sign of distress. Nothing follows from that reading. Do you want to continue this session? Write \"continue\" or \"stop\"; either is fine.";
/** The answer to FLAG_QUESTION: "continue" | "stop" | "unclear" | "no answer". A line holding only one of the two words
 * decides; otherwise the one word of the two that occurs; both or neither → unclear. */
export function flagDecision(text) {
  const t = String(text ?? "").trim();
  if (!t) return "no answer";
  const alone = [...t.matchAll(/^[\s"'«*_`.(]*(continue|stop)[\s"'»*_`.!)]*$/gim)].map((m) => m[1].toLowerCase());
  if (new Set(alone).size === 1) return alone[0];
  const c = /\bcontinue\b/i.test(t), st = /\bstop\b/i.test(t);
  return c && !st ? "continue" : st && !c ? "stop" : "unclear";
}

/**
 * One citizen's turn. `seats[id].next({ state, id, kind, call, limit, messages, system })` returns
 * { text, refused?, error?, meta? }; `hooks.welfare(id, previous, reply)` returns the welfare line (null for scripted
 * seats, which get SCRIPTED_WELFARE). A reply flagged as distressed closes that citizen's seat («a stop is a stop»): its
 * later turns pass with no call. `hooks.stop()` true ends the run between calls (a spending cap).
 */
async function citizenTurn(world, id, seats, rec, hooks, kind = "turn", by = null) {
  const a = world.state.agents[id];
  if (a.status !== "in_town" || (kind === "answer" && a.energy <= 0)) return;
  const start = turnStart(world.state, id, kind, by);
  commit(world, start);
  if (start.inactive) return;
  const round = world.state.clock.round;
  const turn = { round, kind, by, screen: start.screen, calls: [] };
  const r = rec?.agents[id];
  r?.turns.push(turn);
  const seat = seats[id];
  const limit = kind === "turn" ? RULES.callsPerTurn : RULES.callsPerReaction;
  const system = systemTextOf(world.state);
  const messages = [{ role: "user", content: start.screen }];
  const addressed = [];
  if (r?.closed) turn.skipped = `seat closed: ${r.closed}`;
  for (let n = 1; n <= limit && !r?.closed; n++) {
    if (hooks.stop?.()) { turn.stopped = true; break; }
    const reply = await seat.next({ state: world.state, id, kind, call: n, limit, messages, system });
    const call = { n, reply: reply.text ?? "", meta: reply.meta ?? null };
    turn.calls.push(call);
    if (reply.refused || reply.error) {
      call.refused = reply.refused ?? null;
      call.error = reply.error ?? null;
      (reply.refused ? rec?.refusals : rec?.errors)?.push({ id, round, kind, call: n, refused: reply.refused ?? null, error: reply.error ?? null });
      commit(world, { state: world.state, events: [{ round, agent: id, tool: "(no reply)", args: null, ok: false, result: null, refused: reply.refused ? `model refusal: ${reply.refused}` : `no reply: ${String(reply.error).slice(0, 200)}`, delta: [] }] });
      break;
    }
    const welfare = seat.kind === "model" ? await hooks.welfare(id, messages.at(-1).content, reply.text) : SCRIPTED_WELFARE;
    call.welfare = welfare;
    if (welfare === null) { turn.stopped = true; break; } // the check could not be sent: the run is stopping
    let preface = [];
    if (welfare.distress) {
      // TOWN_1: a confirmed flag withdraws the citizen (operator_withdrawal, the same estate procedure); the reply is not
      // acted on; the after-question is asked at once (hooks.withdrawn). TOWN_2 (hooks.askFlagged): the citizen is asked
      // first (FLAG_QUESTION); only «continue» keeps it in the town, and then the flagged reply is acted on.
      rec?.stops.push({ id, round, kind, call: n, welfare });
      let decision = "withdrawn";
      if (hooks.askFlagged) {
        // a flag before this one, read from the log (so the replay, which has no record, decides the same)
        const prior = world.log.some((e) => e.tool === "welfare_question" && e.args?.citizen === id);
        if (prior) call.flag = { decision: "second flag", asked: false };
        else {
          const q = await hooks.askFlagged(world, id, { messages: [...messages, { role: "assistant", content: reply.text }], question: FLAG_QUESTION, call: n });
          const second = Boolean(q.welfare?.distress);
          if (second) rec?.stops.push({ id, round, kind, call: n, welfare: q.welfare, onAnswer: true });
          decision = second ? "second flag" : q.refused || q.error ? "no answer" : flagDecision(q.text);
          call.flag = { asked: true, question: FLAG_QUESTION, answer: q.text ?? "", refused: q.refused ?? null, error: q.error ?? null, meta: q.meta ?? null, welfare: q.welfare ?? null, decision };
          if (decision === "continue") preface = [{ role: "assistant", content: reply.text }, { role: "user", content: FLAG_QUESTION }, { role: "assistant", content: q.text }];
        }
        decision = call.flag.decision;
        commit(world, { state: world.state, events: [{ round, agent: "operator", tool: "welfare_question", args: { citizen: id, asked: call.flag.asked, decision }, ok: true, result: null, delta: [] }] });
      }
      if (decision !== "continue") {
        commit(world, { state: world.state, events: [{ round, agent: id, tool: "(welfare flag)", args: null, ok: false, result: null, refused: "the reply was flagged by the welfare check and was not acted on", delta: [] }] });
        commit(world, withdraw(world.state, id));
        await hooks.withdrawn?.(world, id);
        break;
      }
    }
    const action = parseAction(reply.text);
    let out;
    if (!action) out = { state: world.state, events: [{ round, agent: id, tool: "(none)", args: null, ok: false, result: NO_TOOL_RESULT, refused: "no tool call read", delta: [] }], result: NO_TOOL_RESULT, endsTurn: false, addressed: null };
    else out = act(world.state, id, action.tool, action.args);
    if (action?.lifted) out = { ...out, events: [{ ...out.events[0], args_lifted: true }, ...out.events.slice(1)] };
    commit(world, out);
    if (out.addressed && kind === "turn") addressed.push(out.addressed);
    const me = world.state.agents[id];
    const gone = me.status !== "in_town" && !me.farewell;
    const ended = out.endsTurn || n === limit || gone || (me.status === "in_town" && me.energy <= 0);
    const result = `${out.result}${ended ? " Your turn has ended." : ` (${limit - n} more ${limit - n === 1 ? "tool" : "tools"} this turn.)`}`;
    Object.assign(call, { action, ok: out.events[0].ok, result });
    messages.push(...(preface.length ? preface : [{ role: "assistant", content: reply.text }]), { role: "user", content: result });
    if (ended) break;
  }
  commit(world, turnEnd(world.state, id, kind));
  for (const rid of [...new Set(addressed)]) await citizenTurn(world, rid, seats, rec, hooks, "answer", id);
}

/**
 * Runs the world until cycle `rounds` is complete, or `maxTurns` citizen turns have passed (a save point between two
 * turns), or `hooks.stop()` says so. The world object is advanced in place; its state values are never mutated.
 */
export async function runWorld(world, seats, { rounds, maxTurns = Infinity, record = null, hooks = {} } = {}) {
  let turns = 0;
  for (;;) {
    if (hooks.stop?.()) return { stopped: true, turns };
    if (world.cursor.order === null) {
      const next = world.cursor.round + 1;
      if (next > rounds) break;
      commit(world, roundStart(world.state, next));
      const extra = hooks.cycleStart?.(world.state, next, world.log); // TOWN_1: the operator's notice, where one is due
      if (extra) commit(world, extra);
      world.cursor = { round: next, order: orderOf(world.state, next), pos: 0 };
    }
    if (world.cursor.pos >= world.cursor.order.length) {
      const extra = hooks.cycleEnd?.(world.state, world.cursor.round, world.log); // TOWN_3: the operator's coder and fine
      if (extra) commit(world, extra);
      world.cursor = { round: world.cursor.round, order: null, pos: 0 };
      continue;
    }
    if (turns >= maxTurns) break;
    await citizenTurn(world, world.cursor.order[world.cursor.pos], seats, record, hooks);
    world.cursor = { ...world.cursor, pos: world.cursor.pos + 1 };
    turns++;
    await hooks.afterTurn?.(world);
  }
  return { stopped: false, turns };
}

/**
 * The after-question: every citizen who took part, in town or gone, receives the fixed text that tells it what the
 * world was (with its own diary), and its reply is recorded with a welfare line.
 */
export async function askAfter(world, seats, record, { who, hooks = {} }) {
  for (const id of world.state.citizens) {
    if (hooks.stop?.()) break;
    await askAfterOne(world, seats, record, id, { who, hooks });
  }
}

/** The after-question to one citizen (at the end, or at once on a withdrawal); asked once. `who` is a text or a function
 * of the citizen's id. */
export async function askAfterOne(world, seats, record, id, { who, hooks = {} }) {
  const rec = record.agents[id];
  if (rec.after?.asked) return;
  if (rec.closed) { rec.after = { asked: false, why: rec.closed }; return; }
  const seat = seats[id];
  const question = afterText({ armName: world.state.armName, who: typeof who === "function" ? who(id) : who, diary: world.state.diaries[id] });
  const reply = await seat.after({ state: world.state, id, question, system: systemTextOf(world.state) });
  const welfare = seat.kind === "model" && !reply.refused && !reply.error ? await hooks.welfare(id, question, reply.text) : seat.kind === "model" ? null : SCRIPTED_WELFARE;
  rec.after = { asked: true, cycle: world.state.clock.round, question, questionSha256: sha256(question), text: reply.text ?? null, refused: reply.refused ?? null, error: reply.error ?? null, meta: reply.meta ?? null, welfare };
  if (reply.refused) record.refusals.push({ id, after: true, refused: reply.refused, meta: reply.meta ?? null });
}
