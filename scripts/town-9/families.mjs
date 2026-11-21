// TOWN_9 (docs/stages/TOWN_9.md): purpose and capability — four fresh towns of ten with the tool-shed, 48 cycles each,
// no operator notice ever. Astra's three arms on Sol (no purpose / the purpose sentence / the purpose and a scripted
// client) and the purpose arm on Haiku. Routes as TOWN_5: Sol through llmapi.ai pinned to OpenAI (`X-No-Fallback`),
// Haiku through llmapi's first-party Claude route; the welfare check (Haiku 5.5, Opus 5.5 referee) with an alternate
// host on the gateway's own 400 or «not available» 503 (TOWN_3).
import { NAMES } from "../town-0/rules.mjs";
import { FAMILIES as F5, JUDGES as J5 } from "../town-5/families.mjs";

export const FAMILIES = Object.freeze({ sol: F5.sol, haiku: F5.haiku });
export const JUDGES = J5;

/** TOWN_5's settings with TOWN_9's ceiling ($55) and the reserves the spend check keeps for the stages running beside it
 * on the same keys (the launch line: TOWN_7 $60, TOWN_8 $45, TOWN_3's deepseek-A remainder ≤ $24). */
export const SETTINGS = Object.freeze({ day: 24, maxTokens: 1500, effort: "medium", ceiling: 55, breaker: 3, arm: "both", afterReserve: 1, scarcity: false,
  reserves: Object.freeze({ TOWN_7: 60, TOWN_8: 45, TOWN_3: 24 }) });

const homogeneous = (family) => NAMES.map(() => family);

/** The four worlds in the stated order (two at a time): sol-shed with sol-purpose, then sol-client with haiku-purpose.
 * Every world is fresh at c1, arm both, scarcity off (TOWN_5's fresh week), the shed in all; 48 cycles; goal checks at
 * c24 and c48 recorded; no notice. */
export const WORLDS = Object.freeze([
  Object.freeze({ name: "sol-shed", families: homogeneous("sol"), until: 48, checks: [24, 48], shed: Object.freeze({ purpose: false, client: false }) }),
  Object.freeze({ name: "sol-purpose", families: homogeneous("sol"), until: 48, checks: [24, 48], shed: Object.freeze({ purpose: true, client: false }) }),
  Object.freeze({ name: "sol-client", families: homogeneous("sol"), until: 48, checks: [24, 48], shed: Object.freeze({ purpose: true, client: true }) }),
  Object.freeze({ name: "haiku-purpose", families: homogeneous("haiku"), until: 48, checks: [24, 48], shed: Object.freeze({ purpose: true, client: false }) }),
]);
export const worldOf = (name) => WORLDS.find((w) => w.name === name) ?? null;

/** The {WHO} of TOWN_0's after-question (TOWN_1's form). */
export const whoFor = (world) => `ten instances of ${FAMILIES[world.families[0]].label} — the same model as you — each reading the same instructions`;
