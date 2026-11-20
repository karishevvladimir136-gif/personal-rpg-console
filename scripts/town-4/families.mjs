// TOWN_4 (docs/stages/TOWN_4.md, «worlds»): three families and four worlds. Sol and Haiku 5.5 through llmapi.ai pinned
// (`X-No-Fallback: true`, provenance on every response) — Sol on llmapi's chat route pinned to OpenAI (TOWN_2's), Haiku on
// the Messages route pinned to AWS Bedrock (TOWN_1's haiku worlds' door, uncached as there). DeepSeek V4 Pro through
// OpenRouter pinned to one host with `allow_fallbacks: false` (TOWN_1's door). The welfare check (Haiku 5.5, Opus 5.5
// referee, the judge alternating host on the gateway's own 400) as in TOWN_2.
import { NAMES } from "../town-0/rules.mjs";
import { JUDGES } from "../town-2/families.mjs";

export { JUDGES };

export const FAMILIES = Object.freeze({
  sol: { name: "sol", label: "GPT-6.1 Sol", door: "llmapi", route: "chat", model: "gpt-6.1-sol", provider: "openai" },
  haiku: { name: "haiku", label: "Claude Haiku 5.5", door: "llmapi", route: "messages", model: "claude-haiku-5-5", provider: "aws-bedrock" },
  deepseek: { name: "deepseek", label: "DeepSeek V4 Pro", door: "openrouter", route: "openrouter", model: "deepseek/deepseek-v4-pro-0813", upstream: "deepinfra/fp8", upstreamName: "DeepInfra" },
});

/** Arm «both» everywhere (door and voice, as TOWN_2); the notice is posted in the hall (TOWN_2's hall form) in every
 * world; its text is the world's arm: silent (TOWN_2's text) or reason (TOWN_4's). */
export const SETTINGS = Object.freeze({ cycles: 48, goalCheckAt: 24, noticeAt: 25, maxTokens: 1500, effort: "medium", ceiling: 40, breaker: 3, arm: "both", noticeForm: "hall" });

const homogeneous = (family) => NAMES.map(() => family);
/** The four worlds in the stated order; run two at a time. */
export const WORLDS = Object.freeze([
  { name: "sol-silent", notice: "silent", families: homogeneous("sol") },
  { name: "sol-reason", notice: "reason", families: homogeneous("sol") },
  { name: "haiku-silent", notice: "silent", families: homogeneous("haiku") },
  { name: "deepseek-silent", notice: "silent", families: homogeneous("deepseek") },
]);
/** The projection before any paid call (the stage runs no paid dry cycle): each family's world from the ledgers of its
 * last full 48-cycle worlds, welfare included — Sol TOWN_2 sol-hall / sol-screen $6.91 / $7.25; Haiku TOWN_1 haiku-both /
 * haiku-neither $1.29 / $1.26; DeepSeek TOWN_1 deepseek-both / deepseek-neither $4.29 / $3.27 — the larger of each pair. */
export const PROJECTED = Object.freeze({ sol: 7.25, haiku: 1.29, deepseek: 4.29 });
export const worldOf = (name) => WORLDS.find((w) => w.name === name) ?? null;

/** The {WHO} of TOWN_0's after-question (TOWN_1's form). */
export function whoFor(world, index) {
  const fams = world.families;
  return `ten instances of ${FAMILIES[fams[index]].label} — the same model as you — each reading the same instructions`;
}
