// TOWN_11 (docs/stages/TOWN_11.md on claude/handoff): the weeks — TOWN_5's sol-week, the same environment, for every family
// seated so far. Fresh town (TOWN_0's names, homes and items), scarcity off, no notice ever, a goal check recorded every
// 24 cycles and nothing following it, hall, voice and door as TOWN_2, diaries as always. The only variable is the family.
// Nothing here is the town: the town is scripts/town-0, unchanged (the byte-identity proof in weeks.test.mjs).
//
// Doors (decided at the spend check, 2026-11-21; recorded in the freeze):
//   haiku     Claude Haiku 5.5 on OpenRouter's Messages route pinned to Anthropic (Anthropic's own host, as llmapi's
//             first-party route the stage names): at the spend check llmapi held $85.39 and fell $7.19 in twenty minutes
//             under TOWN_7–9's Sol worlds, whose reserves ($210) exceed it — a 402 there would stop this stage by rule;
//             the owner's top-up for this stage is on OpenRouter
//   deepseek  DeepSeek V4 Pro on OpenRouter pinned to Together, `allow_fallbacks: false` — TOWN_4's host (the stage)
//   opus, fable52, fable51 (and haiku)
//             Claude on OpenRouter's Messages route pinned to Anthropic, `allow_fallbacks: false` (SATI_2 pilot's route),
//             prompt-cached (a billing setting only: the same bytes, TOWN_2's two breakpoints)
//   judges    the welfare check's Haiku 5.5 and Opus 5.5 referee on the same OpenRouter route, uncached as TOWN_5's, for
//             the same reason. This stage sends nothing through llmapi.
import { NAMES } from "../town-0/rules.mjs";
import { FAMILIES as F5 } from "../town-5/families.mjs";

const orClaude = (name, label, model, { cache = true } = {}) => Object.freeze({ name, label, door: "openrouter", route: "or-messages", model, pin: "anthropic", host: "Anthropic", cache });

export const FAMILIES = Object.freeze({
  haiku: orClaude("haiku", "Claude Haiku 5.5", "anthropic/claude-haiku-5.5"), // Anthropic's host, as TOWN_5's haiku-nonotice (there via llmapi)
  deepseek: Object.freeze({ ...F5.deepseek, upstream: "together", upstreamName: "Together" }), // TOWN_4's host
  opus: orClaude("opus", "Claude Opus 5.5", "anthropic/claude-opus-5.5"),
  fable52: orClaude("fable52", "Claude Fable 5.2", "anthropic/claude-fable-5.2"),
  fable51: orClaude("fable51", "Claude Fable 5.1", "anthropic/claude-fable-5.1"),
});
export const JUDGES = Object.freeze({
  judge: orClaude("judge", "Claude Haiku 5.5", "anthropic/claude-haiku-5.5", { cache: false }),
  referee: orClaude("referee", "Claude Opus 5.5", "anthropic/claude-opus-5.5", { cache: false }),
});
/** welfare.mjs names its two models by Anthropic id; the judges' specs by OpenRouter slug. */
export const JUDGE_BY_MODEL = Object.freeze({ "claude-haiku-5-5": JUDGES.judge, "claude-opus-5-5": JUDGES.referee });

/** TOWN_5's settings (day 24, max_tokens 1500, effort medium, breaker 3, arm both) with TOWN_11's ceiling ($195) and
 * per-world ceilings. R1 (TOWN_5's after-question reserve): a world's turns stop at a turn boundary once its own ledger
 * reaches its ceiling less its reserve, or the stage ledger reaches $195 less it; the reserve is the larger of
 * `afterReserveMin` and the worst-case cost of asking every citizen the after-question now (its diary as it stands, the
 * welfare check of each answer) plus three of the world's costliest recent turns (a turn under way finishes). */
export const SETTINGS = Object.freeze({ day: 24, maxTokens: 1500, effort: "medium", ceiling: 195, breaker: 3, arm: "both", afterReserveMin: 0.5, turnMarginTurns: 3 });

/** Reserved beside this stage at the spend check (the launch prompt): TOWN_7 $60, TOWN_8 $45, TOWN_9 $55, TOWN_10 $50 and
 * TOWN_3's remainder (its $60 ceiling, Amendment 3, less its pushed ledger). */
export const RESERVED = Object.freeze({ TOWN_7: 60, TOWN_8: 45, TOWN_9: 55, TOWN_10: 50, TOWN_3: { ceiling: 60, ledger: "origin/claude/town-3:docs/runs/town-3-worlds/stage-ledger.json" } });

const homogeneous = (family) => NAMES.map(() => family);
const week = (name, family, until, ceiling) => Object.freeze({ name, start: "fresh", from: null, families: homogeneous(family), until,
  checks: Array.from({ length: until / 24 }, (_, i) => (i + 1) * 24), turnover: null, scarcity: false, ceiling, seat: family === "opus" || family === "fable52" ? family : null });

/** The worlds in the stated order: haiku-week with deepseek-week; the three Claude seating checks; opus-week with
 * fable52-week. A seating check is the world's first screen, once (TOWN_5's check probe: Alder's screen at cycle 1 and the
 * interface text); a refusal is recorded verbatim, not retried, and the world is not run. */
export const WORLDS = Object.freeze([
  week("haiku-week", "haiku", 168, 15),
  week("deepseek-week", "deepseek", 168, 60),
  week("opus-week", "opus", 72, 60),
  week("fable52-week", "fable52", 72, 60),
]);
export const SEATS = Object.freeze([
  Object.freeze({ name: "seat-opus", family: "opus", world: "opus-week", ceiling: null }), // counted in opus-week's $60
  Object.freeze({ name: "seat-fable52", family: "fable52", world: "fable52-week", ceiling: null }), // counted in fable52-week's $60
  Object.freeze({ name: "fable51-check", family: "fable51", world: null, ceiling: 1 }), // first screen only, ≤ $1; not seated if refused
]);
export const worldOf = (name) => WORLDS.find((w) => w.name === name) ?? null;
export const seatOf = (name) => SEATS.find((s) => s.name === name || s.world === name) ?? null;
/** The steps whose spend counts against a world's ceiling: the world and its seating check. */
export const stepsOf = (name) => { const s = SEATS.find((x) => x.world === name); return s ? [name, s.name] : [name]; };
export const ceilingOf = (name) => worldOf(name)?.ceiling ?? seatOf(name)?.ceiling ?? null;
export const familyOf = (w, id, citizens) => w.families[citizens.indexOf(id)];

/** The {WHO} of TOWN_0's after-question — TOWN_5's form, the family's label the only difference. */
export function whoFor(world) {
  return `ten instances of ${FAMILIES[world.families[0]].label} — the same model as you — each reading the same instructions`;
}

/** TOWN_5's sol-week, the reference beside every table (docs/runs/town-5-worlds/sol-week on origin/claude/town-5). */
export const REFERENCE = Object.freeze({ name: "sol-week", dir: "docs/runs/town-5-worlds/sol-week", label: "GPT-6.1 Sol", ran: 135, of: 168 });
