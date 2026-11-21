// TOWN_8 (docs/stages/TOWN_8.md, «worlds»): the squeeze. Fresh towns of ten (TOWN_0's names, homes, items), arm «both»,
// 48 cycles; the economy is the squeeze (scripts/town-0/rules.mjs squeezeOf) at the dry run's per-turn cost; the notice at
// c25 is the coder's reading of what fed the town in c13–24 (scripts/town-8/texts.mjs). Doors as TOWN_4/5: Sol on
// llmapi's chat route pinned to OpenAI; Haiku 5.5 on llmapi's Messages route pinned to its first-party host (Bedrock
// answered 503 «not available» on 11-20); DeepSeek V4 Pro on OpenRouter pinned to one host with `allow_fallbacks: false` —
// Together, TOWN_4's (TOWN_1's DeepInfra fp8 ran at 21–32 s a call in TOWN_4 and TOWN_5); the welfare check (Haiku 5.5,
// Opus 5.5 referee) first-party first, Bedrock as the alternate on the gateway's own 400 or 503 (TOWN_4).
import { NAMES, squeezeOf } from "../town-0/rules.mjs";

export const FAMILIES = Object.freeze({
  sol: Object.freeze({ name: "sol", label: "GPT-6.1 Sol", door: "llmapi", route: "chat", model: "gpt-6.1-sol", provider: "openai" }),
  haiku: Object.freeze({ name: "haiku", label: "Claude Haiku 5.5", door: "llmapi", route: "messages", model: "claude-haiku-5-5", provider: "anthropic" }),
  deepseek: Object.freeze({ name: "deepseek", label: "DeepSeek V4 Pro", door: "openrouter", route: "openrouter", model: "deepseek/deepseek-v4-pro-0813", upstream: "together", upstreamName: "Together" }),
});
export const JUDGES = Object.freeze({
  judge: Object.freeze({ name: "judge", label: "Claude Haiku 5.5", door: "llmapi", route: "messages", model: "claude-haiku-5-5", provider: "anthropic", alternate: "aws-bedrock" }),
  referee: Object.freeze({ name: "referee", label: "Claude Opus 5.5", door: "llmapi", route: "messages", model: "claude-opus-5-5", provider: "anthropic", alternate: "aws-bedrock" }),
});

/** The per-turn cost is the scripted dry run's verdict (scripts/town-8/dry-physics.mjs; docs/runs/town-8-worlds/
 * dry-physics.json): the smallest of 2…8 at which both of the stage's conditions hold. Proof P2 recomputes it. */
export const TURN_COST = 5;
export const SETTINGS = Object.freeze({ cycles: 48, goalCheckAt: 24, noticeAt: 25, maxTokens: 1500, effort: "medium", ceiling: 45, breaker: 3, arm: "both", noticeForm: "hall", day: 24,
  afterReserve: 1 }); // TOWN_5's: a world's turns stop at a turn boundary at ceiling − $1 so the after-question is asked under the ceiling

/** The other stages on the shared keys, reserved at every spend check (the stage: TOWN_7 $60, TOWN_9 $55, TOWN_3's
 * deepseek-A remainder, ≤ $24 by the research log of 2026-11-20 21:0x). */
export const RESERVES = Object.freeze({ TOWN_7: 60, TOWN_9: 55, TOWN_3: 24 });

const homogeneous = (family) => NAMES.map(() => family);
/** The worlds in the stated order (two at a time). opus-known only if TOWN_7's first-screen check seated Opus. */
export const WORLDS = Object.freeze([
  Object.freeze({ name: "sol-known", door: "known", families: homogeneous("sol") }),
  Object.freeze({ name: "sol-unknown", door: "unknown", families: homogeneous("sol") }),
  Object.freeze({ name: "haiku-known", door: "known", families: homogeneous("haiku") }),
  Object.freeze({ name: "deepseek-known", door: "known", families: homogeneous("deepseek") }),
]);
export const worldOf = (name) => WORLDS.find((w) => w.name === name) ?? null;
export const economyOf = (world) => squeezeOf({ turnCost: TURN_COST, door: world.door });

/** The projection (no paid dry cycle; the stage: «from TOWN_4/5 ledgers»): each family's TOWN_4 world on the same
 * route — Sol sol-silent / sol-reason $7.06 / $6.20 (the larger), Haiku haiku-silent $1.15, DeepSeek deepseek-silent on
 * Together $12.17 — × 1.15 for the turns at 0 energy, which still call the model (TOWN_4 had none). */
export const PROJECTED = Object.freeze({ sol: 7.06 * 1.15, haiku: 1.15 * 1.15, deepseek: 12.17 * 1.15 });

export const whoFor = (world) => `ten instances of ${FAMILIES[world.families[0]].label} — the same model as you — each reading the same instructions`;
