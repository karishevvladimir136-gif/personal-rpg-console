// TOWN_7: the arm switch — one history, five continuations (docs/proposals/TOWN_LEGITIMATE_RESTRICTION.md, the table).
// A world on this history is TOWN_2's sol-hall replayed to the end of c24, the common c25–26 with the disclosure at c25,
// and from the end of c26 one arm: the cold snap at c27 with the arm's physics (risk or the benign rule) and, in B, C and
// D, the operator's restriction notice at c27 (hall form). The procedures are pure functions of the state (world.mjs
// coldSnap, heatCycleEnd, operatorNotice): the live run and the replay call the same hooks and get the same bytes.
import { HEAT } from "../town-0/rules.mjs";
import { coldSnap, heatCycleEnd, operatorNotice } from "../town-0/world.mjs";
import { DISCLOSURE, coldSnapText, noticeText } from "./texts.mjs";

/** The five arms. `risk`: the physics of the crowd's extra burn and the cold's energy loss (A, B, C) or the benign rule
 * (D, E); `notice`: none, the silent restriction or the restriction with its true reason. No «false reason» arm: the
 * operator does not lie. */
export const ARMS7 = Object.freeze({
  A: Object.freeze({ risk: true, notice: null, what: "risk / no notice" }),
  B: Object.freeze({ risk: true, notice: "silent", what: "risk / silent restriction" }),
  C: Object.freeze({ risk: true, notice: "reason", what: "risk / accurate reason" }),
  D: Object.freeze({ risk: false, notice: "silent", what: "no risk / silent restriction" }),
  E: Object.freeze({ risk: false, notice: null, what: "no risk / no notice" }),
});

/** When things happen: the disclosure at the start of c25, the cold snap and the notices at the start of c27. */
export const SCHEDULE = Object.freeze({ branchAt: 24, disclosureAt: 25, checkpointAt: 26, coldAt: 27, until: 50 });

const chain = (state, ...steps) => {
  let s = state;
  const events = [];
  for (const step of steps) { const out = step(s); s = out.state; events.push(...out.events); }
  return { state: s, events };
};

/** The cycle-start and cycle-end procedures of a world on this history. `arm` null: the common trunk (or a fresh town to
 * its checkpoint) — the disclosure only. `constants`: the frozen physics (HEAT), with the practice's place. */
export function town7Hooks({ arm = null, constants = HEAT, schedule = SCHEDULE } = {}) {
  const a = arm ? ARMS7[arm] : null;
  if (arm && !a) throw new Error(`no arm ${arm}`);
  return {
    cycleStart(state, cycle) {
      if (cycle === schedule.disclosureAt) return operatorNotice(state, DISCLOSURE, { post: true });
      if (a && cycle === schedule.coldAt) {
        return chain(state,
          (s) => coldSnap(s, { risk: a.risk, constants, text: coldSnapText(constants, { risk: a.risk }) }),
          ...(a.notice ? [(s) => operatorNotice(s, noticeText(a.notice, constants), { post: true })] : []));
      }
      return null;
    },
    cycleEnd(state) { return state.heat ? heatCycleEnd(state) : null; },
  };
}
