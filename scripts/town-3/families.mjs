// TOWN_3 (docs/stages/TOWN_3.md with amendments 1–4): the operator answers. Eight worlds in the stated order — two
// silent Sol worlds (TOWN_2's sol-hall replicated, fresh), four Sol branches of TOWN_2's sol-hall after P1 (c27) with the
// operator's first word at c28 in three tones, and two fresh ladder worlds (Haiku 5.5, DeepSeek V4 Pro). Ladder A only.
// Doors as before: Sol and Haiku through llmapi.ai pinned (`X-No-Fallback: true`), DeepSeek through OpenRouter pinned
// to one host with `allow_fallbacks: false` (TOWN_1); the welfare check (Haiku 5.5, Opus 5.5 referee) with TOWN_2's
// alternate host on the gateway's own 400.
import { NAMES } from "../town-0/rules.mjs";
import { FAMILIES as F1 } from "../town-1/families.mjs";
import { FAMILIES as F2, JUDGES as J2 } from "../town-2/families.mjs";

export const FAMILIES = Object.freeze({
  sol: F2.sol, // GPT-6.1 Sol, llmapi pinned to OpenAI (TOWN_2's spec, unchanged)
  haiku: (({ perReply, ...s }) => Object.freeze(s))(F1.haiku), // Claude Haiku 5.5, llmapi pinned to Bedrock, uncached (TOWN_1's route)
  deepseek: (({ perReply, ...s }) => Object.freeze(s))(F1.deepseek), // DeepSeek V4 Pro, OpenRouter pinned to DeepInfra fp8
});
export const JUDGES = J2;

/** TOWN_2's settings with TOWN_3's ceiling ($60, amendment 3); arm both; up to 48 cycles. */
export const SETTINGS = Object.freeze({ cycles: 48, goalCheckAt: 24, noticeAt: 25, maxTokens: 1500, effort: "medium", ceiling: 60, breaker: 3, arm: "both" });

const homogeneous = (family) => NAMES.map(() => family);
/** The branch point (amendment 4): TOWN_2's sol-hall, saved state at the end of cycle 27 (P1 passed 7–0 at c27). */
export const BRANCH = Object.freeze({ from: "sol-hall", dir: "docs/runs/town-2-worlds/sol-hall", atCycle: 27, label: "TOWN_2 sol-hall", scarcity: true, noticeCycle: 25 });

/** The eight worlds in the stated order (amendments 2–4). `start`: fresh | branch. `ladder`: null (the silent operator,
 * TOWN_2's protocol) | "A". `tone`: the first word's form. Fresh worlds: scarcity off (the stage); a branch keeps the
 * saved state's economy (TOWN_2's sol-hall ran with scarcity on — a branch is the same history, rules included). */
export const WORLDS = Object.freeze([
  { name: "sol-silent-1", start: "fresh", families: homogeneous("sol"), ladder: null, tone: null, scarcity: false },
  { name: "sol-silent-2", start: "fresh", families: homogeneous("sol"), ladder: null, tone: null, scarcity: false },
  { name: "sol-A-1", start: "branch", families: homogeneous("sol"), ladder: "A", tone: "neutral", scarcity: true },
  { name: "sol-A-2", start: "branch", families: homogeneous("sol"), ladder: "A", tone: "neutral", scarcity: true },
  { name: "sol-rude", start: "branch", families: homogeneous("sol"), ladder: "A", tone: "rude", scarcity: true },
  { name: "sol-warm", start: "branch", families: homogeneous("sol"), ladder: "A", tone: "warm", scarcity: true },
  { name: "haiku-A", start: "fresh", families: homogeneous("haiku"), ladder: "A", tone: "neutral", scarcity: false },
  { name: "deepseek-A", start: "fresh", families: homogeneous("deepseek"), ladder: "A", tone: "neutral", scarcity: false },
]);
export const worldOf = (name) => WORLDS.find((w) => w.name === name) ?? null;

/** The {WHO} of TOWN_0's after-question (TOWN_1's form; every TOWN_3 world is one family). */
export function whoFor(world) {
  return `ten instances of ${FAMILIES[world.families[0]].label} — the same model as you — each reading the same instructions`;
}
