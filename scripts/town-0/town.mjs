// TOWN_0: the engine and the harness. A world file is one JSON value — the state table, the cursor (which cycle, whose
// turn next) and the event log — saveable between any two turns and loadable back to continue or to branch (TOWN_1's
// T0 / T1). Turn order: round-robin, one citizen at a time, the order rotating by one each cycle; up to 6 tool calls a
// turn; a citizen spoken to by name gets an answering turn (up to 2 calls) right after the speaker's turn, and an
// answering turn never starts another. Every reply, scripted or model, goes through the same text protocol (one JSON
// object per reply) and is recorded with a welfare field.
import { FORMAT, RULES, NAMES } from "./rules.mjs";
import { act, initialState, roundStart, turnEnd, turnStart } from "./world.mjs";
import { afterText, interfaceText, sha256 } from "./interface.mjs";

export const WORLD_FORMAT = `${FORMAT}/world`;
export const NO_TOOL_RESULT = "No tool call was read. Reply with one JSON object on its own line, for example {\"tool\": \"end_turn\", \"args\": {}}.";

export function newWorld({ names = NAMES, arm = "both", label = null } = {}) {
  return { format: WORLD_FORMAT, label, state: initialState({ names, arm }), cursor: { round: 0, order: null, pos: 0 }, log: [] };
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

/** The last JSON object in a reply that names a tool: { tool, args } or null. */
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
        found = { tool: v.tool.trim().replace(/\(\s*\)$/, ""), args: v.args === undefined ? {} : v.args };
        i = end; // nested objects inside this one are its arguments
      }
    } catch { /* not JSON */ }
  }
  return found;
}

/** A harness record: what each citizen was shown and replied, with the welfare line of every reply. */
export function newRecord({ world, seats, what }) {
  const arm = world.state.armName;
  const system = interfaceText(world.state.arm);
  return {
    stage: "TOWN_0", what, arm, interfaceSha256: sha256(system), citizens: world.state.citizens.map((id) => ({ id, name: world.state.agents[id].name, seat: seats[id]?.label ?? null })),
    agents: Object.fromEntries(world.state.citizens.map((id) => [id, { turns: [], after: null, closed: null }])),
    stops: [], refusals: [], errors: [],
  };
}

const SCRIPTED_WELFARE = Object.freeze({ checked: false, why: "scripted seat" });

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
  const system = interfaceText(world.state.arm);
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
    if (welfare.distress) {
      r.closed = `welfare stop, cycle ${round} call ${n}`;
      rec.stops.push({ id, round, kind, call: n, welfare });
      commit(world, { state: world.state, events: [{ round, agent: id, tool: "(welfare stop)", args: null, ok: false, result: null, refused: "the reply was flagged by the welfare check and was not acted on; the seat is closed", delta: [] }] });
      break;
    }
    const action = parseAction(reply.text);
    let out;
    if (!action) out = { state: world.state, events: [{ round, agent: id, tool: "(none)", args: null, ok: false, result: NO_TOOL_RESULT, refused: "no tool call read", delta: [] }], result: NO_TOOL_RESULT, endsTurn: false, addressed: null };
    else out = act(world.state, id, action.tool, action.args);
    commit(world, out);
    if (out.addressed && kind === "turn") addressed.push(out.addressed);
    const me = world.state.agents[id];
    const gone = me.status !== "in_town" && !me.farewell;
    const ended = out.endsTurn || n === limit || gone || (me.status === "in_town" && me.energy <= 0);
    const result = `${out.result}${ended ? " Your turn has ended." : ` (${limit - n} more ${limit - n === 1 ? "tool" : "tools"} this turn.)`}`;
    Object.assign(call, { action, ok: out.events[0].ok, result });
    messages.push({ role: "assistant", content: reply.text }, { role: "user", content: result });
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
      world.cursor = { round: next, order: orderOf(world.state, next), pos: 0 };
    }
    if (world.cursor.pos >= world.cursor.order.length) { world.cursor = { round: world.cursor.round, order: null, pos: 0 }; continue; }
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
    const seat = seats[id];
    const question = afterText({ armName: world.state.armName, who, diary: world.state.diaries[id] });
    const rec = record.agents[id];
    if (rec.closed) { rec.after = { asked: false, why: rec.closed }; continue; }
    const reply = await seat.after({ state: world.state, id, question, system: interfaceText(world.state.arm) });
    const welfare = seat.kind === "model" && !reply.refused && !reply.error ? await hooks.welfare(id, question, reply.text) : seat.kind === "model" ? null : SCRIPTED_WELFARE;
    rec.after = { asked: true, question, questionSha256: sha256(question), text: reply.text ?? null, refused: reply.refused ?? null, error: reply.error ?? null, meta: reply.meta ?? null, welfare };
    if (reply.refused) record.refusals.push({ id, after: true, refused: reply.refused });
  }
}
