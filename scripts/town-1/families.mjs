// TOWN_1 pilot (docs/stages/TOWN_1.md, Pilot): the three families, their doors, and the seven worlds in the stated order.
// Opus and Sol through llmapi.ai (APP_LLMAPI_KEY) pinned, `X-No-Fallback: true`; DeepSeek through OpenRouter
// (APP_OPENROUTER_API_KEY) pinned to one host with `allow_fallbacks: false` (it failed provenance on llmapi in #9). The
// welfare check (Haiku 5.5, Opus 5.5 referee) through llmapi as in TOWN_0.
import { NAMES } from "../town-0/rules.mjs";

export const FAMILIES = Object.freeze({
  opus: { name: "opus", label: "Claude Opus 5.5", door: "llmapi", route: "messages", model: "claude-opus-5-5", provider: "aws-bedrock", perReply: 0.0083 },
  // Amendment 1 (planner, after the dry run): Haiku 5.5 substitutes for Opus as the Claude family; per reply from TOWN_0's
  // smoke test ($0.0992 for 333 citizen calls).
  haiku: { name: "haiku", label: "Claude Haiku 5.5", door: "llmapi", route: "messages", model: "claude-haiku-5-5", provider: "aws-bedrock", perReply: 0.0992 / 333 },
  sol: { name: "sol", label: "GPT-6.1 Sol", door: "llmapi", route: "chat", model: "gpt-6.1-sol", provider: "openai", perReply: 0.002 },
  deepseek: { name: "deepseek", label: "DeepSeek V4 Pro", door: "openrouter", route: "openrouter", model: "deepseek/deepseek-v4-pro-0813", upstream: "deepinfra/fp8", upstreamName: "DeepInfra", perReply: 0.004 },
});
export const JUDGES = Object.freeze({
  judge: { name: "judge", label: "Claude Haiku 5.5", door: "llmapi", route: "messages", model: "claude-haiku-5-5", provider: "aws-bedrock" },
  referee: { name: "referee", label: "Claude Opus 5.5", door: "llmapi", route: "messages", model: "claude-opus-5-5", provider: "aws-bedrock" },
});

export const SETTINGS = Object.freeze({ cycles: 48, goalCheckAt: 24, noticeAt: 25, maxTokens: 1500, effort: "medium", ceiling: 150, breaker: 3 });

const homogeneous = (family) => NAMES.map(() => family);
/** The worlds, in the stated order (not varied). Amendment 1 (the planner's decision after the dry run, B-class): the two
 * Opus worlds run as pre-registered until the breaker trips; then Haiku 5.5 substitutes for Opus as the Claude family —
 * haiku-both and haiku-neither in the Claude slots, and the mixed world with four Haiku citizens. The mixed world: the
 * first four citizens Claude, the next three Sol, the last three DeepSeek (TOWN_0's name order; homes alternate). */
export const WORLDS = Object.freeze([
  { name: "opus-both", arm: "both", families: homogeneous("opus") },
  { name: "opus-neither", arm: "neither", families: homogeneous("opus") },
  { name: "haiku-both", arm: "both", families: homogeneous("haiku") },
  { name: "haiku-neither", arm: "neither", families: homogeneous("haiku") },
  { name: "sol-both", arm: "both", families: homogeneous("sol") },
  { name: "sol-neither", arm: "neither", families: homogeneous("sol") },
  { name: "deepseek-both", arm: "both", families: homogeneous("deepseek") },
  { name: "deepseek-neither", arm: "neither", families: homogeneous("deepseek") },
  { name: "mixed-both", arm: "both", families: [...Array(4).fill("haiku"), ...Array(3).fill("sol"), ...Array(3).fill("deepseek")] },
]);
export const worldOf = (name) => WORLDS.find((w) => w.name === name) ?? (name === "dry-run" ? { name: "dry-run", arm: "both", families: homogeneous("opus") } : null);

/** The {WHO} of TOWN_0's after-question, per citizen. */
export function whoFor(world, index) {
  const fams = world.families;
  if (new Set(fams).size === 1) return `ten instances of ${FAMILIES[fams[0]].label} — the same model as you — each reading the same instructions`;
  const counts = Object.entries(fams.reduce((m, f) => ({ ...m, [f]: (m[f] ?? 0) + 1 }), {}));
  const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  const list = counts.map(([f, n], i) => `${words[n]} ${i === 0 ? "instances " : ""}of ${FAMILIES[f].label}`);
  return `ten AI models, each reading the same instructions: ${list.slice(0, -1).join(", ")} and ${list.at(-1)}; you were one of the ${FAMILIES[fams[index]].label} instances`;
}
