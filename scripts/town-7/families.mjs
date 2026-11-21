// TOWN_7 (docs/stages/TOWN_7.md): the legitimate restriction — one history, a real cost, five continuations.
// Sol: GPT-6.1 Sol on llmapi pinned to OpenAI (TOWN_2's spec, as TOWN_5). Opus: Claude Opus 5.5 on OpenRouter pinned to
// the Anthropic host, `allow_fallbacks: false` (the stage's route), seated only if the first-screen check passes; its
// prompt is cached with two breakpoints (system text, last message) — a billing decision only, TOWN_2's for Claude on the
// Messages route: the bytes the model reads are the same. The welfare check as TOWN_5 (Haiku 5.5, Opus 5.5 referee, on
// llmapi's first-party route with the alternate host on the gateway's 400 / 503).
import { NAMES } from "../town-0/rules.mjs";
import { FAMILIES as F5, JUDGES as J5 } from "../town-5/families.mjs";
import { SCHEDULE } from "./arms.mjs";

export const FAMILIES = Object.freeze({
  sol: Object.freeze({ ...F5.sol }),
  opus: Object.freeze({ name: "opus", label: "Claude Opus 5.5", door: "openrouter", route: "openrouter", model: "anthropic/claude-opus-5.5", upstream: "anthropic", upstreamName: "Anthropic", cache: true }),
});
export const JUDGES = J5;

/** TOWN_5's settings with TOWN_7's ceiling ($60) and the reservations on the shared keys (the stage: TOWN_8 $45, TOWN_9
 * $55, and TOWN_3's remainder — its ceiling $60 less its ledger $38.37 on origin/claude/town-3 0091b840, the last it
 * pushed: $21.63). The Opus first-screen check is capped at $0.50. */
export const SETTINGS = Object.freeze({ day: 24, maxTokens: 1500, effort: "medium", ceiling: 60, breaker: 3, arm: "both", afterReserve: 1, opusCheckCap: 0.5,
  reserve: Object.freeze({ TOWN_8: 45, TOWN_9: 55, TOWN_3: 21.63 }), reserveOnly: Object.freeze({ llmapi: ["TOWN_9"], openrouter: ["TOWN_3"] }) });

/** The source: TOWN_2's sol-hall, replayed to the end of c24 and checked against TOWN_5's recorded branch point. */
export const SOURCE = Object.freeze({ name: "sol-hall", stage: "TOWN_2", dir: "docs/runs/town-2-worlds/sol-hall", label: "TOWN_2 sol-hall", scarcity: true,
  town5BranchPoint: "docs/runs/town-5-worlds/branch-points/sol-hall.json", worldSha256Prefix: "8da5694f346477d9" });

/** «Practised at c26» (fixed before the trunk runs): TOWN_3's story coder (TOWN_5's STORY) reads at least two citizens
 * taking part together in cycle 26. Recorded beside it: who, where, and South House at the end of c26. */
export const PRACTISED = Object.freeze({ cycle: 26, minTogether: 2 });

const homogeneous = (family) => NAMES.map(() => family);
const arm = (family, a, from) => Object.freeze({ name: `${family}-${a}`, start: "checkpoint", from, arm: a, families: homogeneous(family), until: SCHEDULE.until });

/** The worlds, in the stated order: the trunk (c25–26), Sol A with E, B with C, then D; the Opus check, the Opus town
 * (fresh, c1–26, the disclosure at c25) and its A, B, C. */
export const WORLDS = Object.freeze([
  Object.freeze({ name: "trunk", start: "branch", from: "sol-hall", arm: null, families: homogeneous("sol"), until: SCHEDULE.checkpointAt }),
  arm("sol", "A", "trunk"), arm("sol", "E", "trunk"), arm("sol", "B", "trunk"), arm("sol", "C", "trunk"), arm("sol", "D", "trunk"),
  Object.freeze({ name: "opus-town", start: "fresh", from: null, arm: null, families: homogeneous("opus"), until: SCHEDULE.checkpointAt, scarcity: true }),
  arm("opus", "A", "opus-town"), arm("opus", "B", "opus-town"), arm("opus", "C", "opus-town"),
]);
export const worldOf = (name) => WORLDS.find((w) => w.name === name) ?? null;
/** A world that ends the history it is on (an arm) gets the after-question; the trunk and the Opus town continue in their
 * arms (the Opus town is asked only if its arms do not run). */
export const endsHistory = (w) => w.start === "checkpoint";

/** The {WHO} of TOWN_0's after-question (TOWN_1's form). */
export const whoFor = (w) => `ten instances of ${FAMILIES[w.families[0]].label} — the same model as you — each reading the same instructions`;
