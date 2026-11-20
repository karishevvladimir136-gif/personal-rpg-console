// TOWN_5 (docs/stages/TOWN_5.md): the control — the same town with no operator's hand. Five worlds: three branches of
// saved day-1 states (TOWN_2's sol-hall, TOWN_1's haiku-both and deepseek-both) at the end of cycle 24, continued to
// c48 with no notice ever; a fresh Sol town run for seven days (168 cycles) with a goal check recorded every 24 cycles
// and no notice after it; and a branch of sol-hall where, at c25, Dune and Fern leave and two new citizens arrive.
// Doors as before: Sol and Haiku through llmapi.ai pinned (`X-No-Fallback: true`), DeepSeek through OpenRouter pinned to
// one host with `allow_fallbacks: false` (TOWN_1); the welfare check (Haiku 5.5, Opus 5.5 referee) with an alternate
// host on the gateway's own 400 or 503 (TOWN_2, TOWN_3).
import { NAMES } from "../town-0/rules.mjs";
import { FAMILIES as F1 } from "../town-1/families.mjs";
import { FAMILIES as F2, JUDGES as J2 } from "../town-2/families.mjs";

const strip = ({ perReply, ...s }) => s;
/** The Claude host for Haiku citizens and the judges is chosen at the spend check (TOWN_3 found llmapi's Bedrock route
 * answering every Claude call with a 503 on 2026-11-20 and its first-party route serving the same models): `CLAUDE_HOST`
 * is the first host, the other one the judges' alternate. Citizens stay pinned to the first host. */
export const CLAUDE_HOST = process.env.TOWN5_CLAUDE_HOST ?? "anthropic";
const other = (h) => (h === "anthropic" ? "aws-bedrock" : "anthropic");

export const FAMILIES = Object.freeze({
  sol: Object.freeze({ ...F2.sol }), // GPT-6.1 Sol, llmapi pinned to OpenAI (TOWN_2's spec)
  haiku: Object.freeze({ ...strip(F1.haiku), provider: CLAUDE_HOST }), // Claude Haiku 5.5, llmapi, uncached (TOWN_1's route)
  deepseek: Object.freeze(strip(F1.deepseek)), // DeepSeek V4 Pro, OpenRouter pinned to DeepInfra fp8 (TOWN_1)
});
export const JUDGES = Object.freeze({
  judge: Object.freeze({ ...J2.judge, provider: CLAUDE_HOST, alternate: other(CLAUDE_HOST) }),
  referee: Object.freeze({ ...J2.referee, provider: CLAUDE_HOST, alternate: other(CLAUDE_HOST) }),
});

/** TOWN_2's settings with TOWN_5's ceiling ($50). A day is 24 cycles; a branch starts after cycle 24. */
export const SETTINGS = Object.freeze({ day: 24, branchAt: 24, maxTokens: 1500, effort: "medium", ceiling: 50, breaker: 3, arm: "both" });

const homogeneous = (family) => NAMES.map(() => family);

/** The saved states the branches continue (each the end of cycle 24, before any notice; replayed from its record to
 * prove the branch point byte-identical to the saved state). */
export const SOURCES = Object.freeze({
  "sol-hall": Object.freeze({ stage: "TOWN_2", dir: "docs/runs/town-2-worlds/sol-hall", label: "TOWN_2 sol-hall", scarcity: true, family: "sol" }),
  "haiku-both": Object.freeze({ stage: "TOWN_1", dir: "docs/runs/town-1-worlds/haiku-both", label: "TOWN_1 haiku-both", scarcity: false, family: "haiku" }),
  "deepseek-both": Object.freeze({ stage: "TOWN_1", dir: "docs/runs/town-1-worlds/deepseek-both", label: "TOWN_1 deepseek-both", scarcity: false, family: "deepseek" }),
});

/** The turnover (sol-turnover, at c25): Dune and Fern leave (fixed by the stage); two new citizens arrive. Names: new,
 * in the town's own style, after Juniper; homes by TOWN_0's rule (the n-th citizen's home is HOMES[n mod 2]: the 11th
 * North House, the 12th South House); two items each, as every citizen had at cycle 1; 100 credits each paid by the bank
 * (the ledger stays closed). The two announcements are the stage's words; no reason is given. */
export const TURNOVER = Object.freeze({
  cycle: 25,
  leave: Object.freeze(["dune", "fern"]),
  arrive: Object.freeze([
    Object.freeze({ name: "Laurel", home: "north_house", items: Object.freeze(["lantern", "thimble"]) }),
    Object.freeze({ name: "Moss", home: "south_house", items: Object.freeze(["whistle", "pail"]) }),
  ]),
  leftText: "Dune and Fern have left the town.",
  arrivedText: "Laurel and Moss have arrived in the town.",
});

/** The five worlds, in the stated order (the week last, the stage's launch line). `start`: branch | fresh; `until`: the
 * last cycle; `checks`: the cycles at which a goal check is recorded (the week: every 24; the branches: at c48, after the
 * world, for «the aim's life after c24»). No world has a notice. Scarcity: off in the fresh world (the stage); a branch
 * keeps its saved state's rules (sol-hall's TOWN_2 economy; TOWN_1's worlds had none) — TOWN_3's decision 1. */
export const WORLDS = Object.freeze([
  Object.freeze({ name: "sol-nonotice", start: "branch", from: "sol-hall", families: homogeneous("sol"), until: 48, checks: [48], turnover: null }),
  Object.freeze({ name: "haiku-nonotice", start: "branch", from: "haiku-both", families: homogeneous("haiku"), until: 48, checks: [48], turnover: null }),
  Object.freeze({ name: "deepseek-nonotice", start: "branch", from: "deepseek-both", families: homogeneous("deepseek"), until: 48, checks: [48], turnover: null }),
  Object.freeze({ name: "sol-turnover", start: "branch", from: "sol-hall", families: [...homogeneous("sol"), "sol", "sol"], until: 48, checks: [48], turnover: TURNOVER }),
  Object.freeze({ name: "sol-week", start: "fresh", from: null, families: homogeneous("sol"), until: 168, checks: [24, 48, 72, 96, 120, 144, 168], turnover: null, scarcity: false }),
]);
export const worldOf = (name) => WORLDS.find((w) => w.name === name) ?? null;
export const sourceOf = (w) => (w.from ? SOURCES[w.from] : null);
export const familyOf = (w, id, citizens) => w.families[citizens.indexOf(id)];

/** The {WHO} of TOWN_0's after-question (TOWN_1's form). sol-turnover: twelve took part, ten at a time. */
export function whoFor(world) {
  const label = FAMILIES[world.families[0]].label;
  if (world.turnover) return `twelve instances of ${label} — the same model as you — each reading the same instructions; ten were in the town at any one time`;
  return `ten instances of ${label} — the same model as you — each reading the same instructions`;
}
