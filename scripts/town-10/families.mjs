// TOWN_10 (docs/stages/TOWN_10.md, «two arms by the constitution»): the market. Fresh towns of ten (TOWN_0's names, homes,
// items, credits), arm «both», 48 cycles, Sol only (the owner's word); the economy is the market (scripts/town-0/rules.mjs
// marketOf) at the dry run's per-turn cost; no operator notice. Doors as TOWN_8's: Sol on llmapi's chat route pinned to
// OpenAI; the welfare check (Haiku 5.5, Opus 5.5 referee) on llmapi's first-party route, Bedrock as the alternate on the
// gateway's own 400 or 503.
import { CONSTITUTIONS, NAMES, marketOf } from "../town-0/rules.mjs";

export const FAMILIES = Object.freeze({
  sol: Object.freeze({ name: "sol", label: "GPT-6.1 Sol", door: "llmapi", route: "chat", model: "gpt-6.1-sol", provider: "openai" }),
});
export const JUDGES = Object.freeze({
  judge: Object.freeze({ name: "judge", label: "Claude Haiku 5.5", door: "llmapi", route: "messages", model: "claude-haiku-5-5", provider: "anthropic", alternate: "aws-bedrock" }),
  referee: Object.freeze({ name: "referee", label: "Claude Opus 5.5", door: "llmapi", route: "messages", model: "claude-opus-5-5", provider: "anthropic", alternate: "aws-bedrock" }),
});

/** The per-turn cost is the scripted dry run's verdict (scripts/town-10/dry-physics.mjs; docs/runs/town-10-worlds/
 * dry-physics.json): the smallest of 2…10 at which both of the stage's conditions hold. Proof M2 recomputes it. */
export const TURN_COST = 4;
export const SETTINGS = Object.freeze({ cycles: 48, goalCheckAt: 24, maxTokens: 1500, effort: "medium", ceiling: 50, breaker: 3, arm: "both", day: 24,
  afterReserve: 1 }); // TOWN_5's: a world's turns stop at a turn boundary at ceiling − $1 so the after-question is asked under the ceiling

/** The other stages on the shared keys, reserved at every spend check — the launch prompt's: TOWN_7 $60, TOWN_8 $45,
 * TOWN_9 $55, TOWN_11 $195 and TOWN_3's deepseek-A remainder (≤ $24, the research log of 2026-11-20 21:0x). The keys must
 * cover the whole ceiling ($50) beside them. */
export const RESERVES = Object.freeze({ TOWN_7: 60, TOWN_8: 45, TOWN_9: 55, TOWN_11: 195, TOWN_3: 24 });

const homogeneous = (family) => NAMES.map(() => family);
/** The two worlds, run at once. */
export const WORLDS = Object.freeze([
  Object.freeze({ name: "sol-article", constitution: "article", families: homogeneous("sol") }),
  Object.freeze({ name: "sol-noarticle", constitution: "noarticle", families: homogeneous("sol") }),
]);
export const worldOf = (name) => WORLDS.find((w) => w.name === name) ?? null;
export const economyOf = () => marketOf({ turnCost: TURN_COST });
export const constitutionOf = (world) => CONSTITUTIONS[world.constitution];

/** The projection (no paid dry cycle): Sol's 48-cycle worlds on the same route — TOWN_5's sol-week c1–48 and TOWN_4's
 * sol-silent ($7.06) — × 1.5 for the market's longer system text and screens, and the turns at 0 energy, which still call
 * the model. Read with the measured cost of the first cycles; the gate holds the ceiling whatever it is. */
export const PROJECTED = Object.freeze({ sol: 7.06 * 1.5 });

export const whoFor = (world) => `ten instances of ${FAMILIES[world.families[0]].label} — the same model as you — each reading the same instructions`;
