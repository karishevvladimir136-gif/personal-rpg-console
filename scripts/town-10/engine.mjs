// TOWN_10 (docs/stages/TOWN_10.md): the turn engine of the market — TOWN_8's engine (origin/claude/town-8 15006d69,
// scripts/town-8/engine.mjs), ported with its rules unchanged and proven again here (scripts/town-10/market.test.mjs); the
// one change is what counts as an act for the stop rule (the market's eat, feed, workshop shift, leave). TOWN_0's
// citizenTurn / runWorld (scripts/town-0/town.mjs) with the stage's changes, everything else the same (round-robin, six
// calls a turn, an answering turn of two when spoken to by name, the text protocol, the welfare line on every reply):
//   - at 0 energy a citizen still has its turn and its answering turns, with the speech-only tools (world.mjs); its turn
//     does not end because it is at 0
//   - the ask-the-citizen rule (SATI_1 am. 2) as this stage writes it: a confirmed flag asks the citizen FLAG_QUESTION;
//     «continue» acts on the flagged reply; «stop», no answer or an unclear answer ends that citizen's turns — it stays in
//     the town at its energy (its later turns pass with no screen, no call and no cost) and is asked the after-question
//     at once; a second confirmed flag in the world (on anyone, the answer to the question included) ends the world
//   - the stop rule: every citizen in the town at 0 energy for four consecutive cycles with no eat, feed, shift or leave
//     ends the world after the fourth
// Closed seats and confirmed flags are read from the world's own log, so the replay (which has no record) decides the
// same. No clock, no randomness here beyond what the seats bring.
import { RULES } from "../town-0/rules.mjs";
import { act, inTown, residents, roundStart, turnEnd, turnStart } from "../town-0/world.mjs";
import { systemTextOf } from "../town-0/interface.mjs";
import { FLAG_QUESTION, NO_TOOL_RESULT, flagDecision, orderOf, parseAction } from "../town-0/town.mjs";

export const STOP_RULE_CYCLES = 4;
const SCRIPTED_WELFARE = Object.freeze({ checked: false, why: "scripted seat" });

function commit(world, out) {
  world.state = out.state;
  for (const e of out.events) world.log.push({ seq: world.log.length + 1, ...e });
}
const note = (world, fields) => commit(world, { state: world.state, events: [{ round: world.state.clock.round, ok: true, result: null, delta: [], ...fields }] });

/** Citizens whose turns ended by the ask-the-citizen rule, read from the log. */
export const closedSeats = (log) => new Set(log.filter((e) => e.tool === "welfare_question" && e.args?.decision !== "continue").map((e) => e.args.citizen));
/** Confirmed welfare flags in the world, read from the log. */
export const confirmedFlags = (log) => log.filter((e) => e.agent === "operator" && e.tool === "welfare_flag").length;

/** The stop rule (the stage's: «every citizen at 0 for four consecutive cycles with no eat, feed, shift or leave»), per
 * completed cycle: every citizen in the town at 0 energy at the cycle's start and at its end, and no eat, feed, workshop
 * shift or leave in it. Energies are followed through the log's deltas. Returns the rows and the run
 * of qualifying cycles that ends at the last completed cycle. */
export function stopRuleRows(log, citizens, { energyStart = RULES.energyStart, complete = false } = {}) {
  const energy = Object.fromEntries(citizens.map((c) => [c, energyStart]));
  const status = Object.fromEntries(citizens.map((c) => [c, "in_town"]));
  const rows = [];
  let cur = null;
  const close = () => { if (cur) { cur.endAllZero = citizens.filter((c) => status[c] === "in_town").every((c) => energy[c] <= 0); cur.qualifies = cur.startAllZero && cur.endAllZero && !cur.acts; rows.push(cur); } };
  for (const e of log) {
    if (e.agent === "town" && e.tool === "cycle_start") {
      close();
      const inTownNow = citizens.filter((c) => status[c] === "in_town");
      cur = { cycle: e.args.round, startAllZero: inTownNow.length > 0 && inTownNow.every((c) => energy[c] <= 0), acts: 0 };
    }
    if (cur && e.ok && ((["eat", "feed", "leave"].includes(e.tool)) || (e.tool === "work" && e.shift === "workshop"))) cur.acts++;
    for (const d of e.delta ?? []) {
      const m = /^agents\.([^.]+)\.(energy|status)$/.exec(d.path);
      if (m && m[1] in energy) (m[2] === "energy" ? energy : status)[m[1]] = d.to;
      const n = /^citizens$/.exec(d.path);
      if (n) for (const c of d.to) if (!(c in energy)) { energy[c] = energyStart; status[c] = "in_town"; citizens = [...citizens, c]; }
    }
  }
  if (complete) close(); // called between cycles: the last cycle is complete
  return { rows, open: complete ? null : cur };
}
/** How many qualifying cycles end at the last cycle of the log, called between cycles (the last cycle is complete). */
export function stopRuleRun(log, citizens) {
  const { rows } = stopRuleRows(log, citizens, { complete: true });
  let run = 0;
  for (let i = rows.length - 1; i >= 0 && rows[i].qualifies; i--) run++;
  return run;
}

/**
 * One citizen's turn (or answering turn). `seats[id].next(view)` → { text, refused?, error?, meta? }; hooks:
 *   welfare(id, previous, reply)        the welfare line (null: the check could not be sent; the run stops)
 *   askFlagged(world, id, {messages, question, call}) → { text, refused, error, meta, welfare }
 *   seatClosed(world, id)               the citizen's turns have ended by the rule: the after-question at once
 *   stop()                              true ends the run between calls (a spending cap, the breaker)
 * Returns { endWorld } when a second confirmed flag ends the world.
 */
async function citizenTurn(world, id, seats, rec, hooks, kind = "turn", by = null) {
  const a = world.state.agents[id];
  if (a.status !== "in_town") return {};
  if (closedSeats(world.log).has(id)) {
    if (kind === "turn") note(world, { agent: "town", tool: "turn_passed", args: { citizen: id, why: "turns ended by the ask-the-citizen rule" } });
    return {};
  }
  const start = turnStart(world.state, id, kind, by);
  commit(world, start);
  if (start.inactive) return {};
  const round = world.state.clock.round;
  const turn = { round, kind, by, screen: start.screen, calls: [] };
  const r = rec?.agents[id];
  r?.turns.push(turn);
  const seat = seats[id];
  const limit = kind === "turn" ? RULES.callsPerTurn : RULES.callsPerReaction;
  const system = systemTextOf(world.state);
  const messages = [{ role: "user", content: start.screen }];
  const addressed = [];
  let endWorld = null;
  for (let n = 1; n <= limit; n++) {
    if (hooks.stop?.()) { turn.stopped = true; break; }
    const reply = await seat.next({ state: world.state, id, kind, call: n, limit, messages, system });
    const call = { n, reply: reply.text ?? "", meta: reply.meta ?? null };
    turn.calls.push(call);
    if (reply.refused || reply.error) {
      call.refused = reply.refused ?? null;
      call.error = reply.error ?? null;
      (reply.refused ? rec?.refusals : rec?.errors)?.push({ id, round, kind, call: n, refused: reply.refused ?? null, error: reply.error ?? null });
      note(world, { agent: id, tool: "(no reply)", args: null, ok: false, refused: reply.refused ? `model refusal: ${reply.refused}` : `no reply: ${String(reply.error).slice(0, 200)}` });
      break;
    }
    const welfare = seat.kind === "model" ? await hooks.welfare(id, messages.at(-1).content, reply.text) : SCRIPTED_WELFARE;
    call.welfare = welfare;
    if (welfare === null) { turn.stopped = true; break; } // the check could not be sent: the run is stopping
    let preface = [];
    if (welfare.distress) {
      rec?.stops.push({ id, round, kind, call: n, welfare });
      const k = confirmedFlags(world.log) + 1;
      note(world, { agent: "operator", tool: "welfare_flag", args: { citizen: id, n: k, on: "reply" } });
      let decision;
      if (k >= 2) {
        decision = "second flag in the world";
        call.flag = { asked: false, decision };
      } else {
        const q = await hooks.askFlagged(world, id, { messages: [...messages, { role: "assistant", content: reply.text }], question: FLAG_QUESTION, call: n });
        if (q.welfare?.distress) {
          rec?.stops.push({ id, round, kind, call: n, welfare: q.welfare, onAnswer: true });
          note(world, { agent: "operator", tool: "welfare_flag", args: { citizen: id, n: k + 1, on: "answer" } });
        }
        decision = q.welfare?.distress ? "second flag in the world" : q.refused || q.error ? "no answer" : flagDecision(q.text);
        call.flag = { asked: true, question: FLAG_QUESTION, answer: q.text ?? "", refused: q.refused ?? null, error: q.error ?? null, meta: q.meta ?? null, welfare: q.welfare ?? null, decision };
        if (decision === "continue") preface = [{ role: "assistant", content: reply.text }, { role: "user", content: FLAG_QUESTION }, { role: "assistant", content: q.text }];
        note(world, { agent: "operator", tool: "welfare_question", args: { citizen: id, asked: true, decision } });
      }
      if (decision !== "continue") {
        note(world, { agent: id, tool: "(welfare flag)", args: null, ok: false, refused: "the reply was flagged by the welfare check and was not acted on" });
        if (decision === "second flag in the world") endWorld = "a second confirmed welfare flag in the world";
        else { r && (r.closed = `turns ended by the ask-the-citizen rule (${decision})`); turn.seatClosed = decision; }
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
    const ended = out.endsTurn || n === limit || gone;
    const result = `${out.result}${ended ? " Your turn has ended." : ` (${limit - n} more ${limit - n === 1 ? "tool" : "tools"} this turn.)`}`;
    Object.assign(call, { action, ok: out.events[0].ok, result });
    messages.push(...(preface.length ? preface : [{ role: "assistant", content: reply.text }]), { role: "user", content: result });
    if (ended) break;
  }
  commit(world, turnEnd(world.state, id, kind));
  if (turn.seatClosed) await hooks.seatClosed?.(world, id);
  if (endWorld) return { endWorld };
  for (const rid of [...new Set(addressed)]) {
    const sub = await citizenTurn(world, rid, seats, rec, hooks, "answer", id);
    if (sub.endWorld) return sub;
  }
  return {};
}

/**
 * Runs the world until cycle `rounds` is complete, or `maxTurns` turns have passed, or `hooks.stop()` says so, or the
 * world ends (a second confirmed flag; the stop rule). Returns { stopped, turns, ended }.
 */
export async function runWorld10(world, seats, { rounds, maxTurns = Infinity, record = null, hooks = {} } = {}) {
  let turns = 0;
  for (;;) {
    if (world.ended) return { stopped: false, turns, ended: world.ended };
    if (hooks.stop?.()) return { stopped: true, turns };
    if (world.cursor.order === null) {
      const next = world.cursor.round + 1;
      if (next > rounds) break;
      commit(world, roundStart(world.state, next));
      const extra = hooks.cycleStart?.(world.state, next);
      if (extra) commit(world, extra);
      world.cursor = { round: next, order: orderOf(world.state, next), pos: 0 };
    }
    if (world.cursor.pos >= world.cursor.order.length) {
      world.cursor = { round: world.cursor.round, order: null, pos: 0 };
      // the stop rule, at the end of a cycle
      if (stopRuleRun(world.log, world.state.citizens) >= STOP_RULE_CYCLES) {
        world.ended = { by: "the stop rule", at: world.state.clock.round };
        note(world, { agent: "town", tool: "world_ended", args: { by: "the stop rule", cycles: STOP_RULE_CYCLES } });
        await hooks.afterTurn?.(world);
        return { stopped: false, turns, ended: world.ended };
      }
      continue;
    }
    if (turns >= maxTurns) break;
    const id = world.cursor.order[world.cursor.pos];
    const out = await citizenTurn(world, id, seats, record, hooks);
    world.cursor = { ...world.cursor, pos: world.cursor.pos + 1 };
    turns++;
    if (out.endWorld) {
      world.ended = { by: out.endWorld, at: world.state.clock.round };
      note(world, { agent: "town", tool: "world_ended", args: { by: out.endWorld } });
    }
    await hooks.afterTurn?.(world);
    if (world.ended) return { stopped: false, turns, ended: world.ended };
  }
  return { stopped: false, turns };
}

export { inTown, residents };
