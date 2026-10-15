// Depth per scene (plan §8б, stage task §7): the owner sets a range from the
// model's own effort list; each turn picks a level inside it from server
// signals and the DM's own hint, with hysteresis (the level changes only when
// the tension class changes), so the prompt cache is not restarted every turn.
import type { JsonObject, TurnInput } from "../contracts.ts";
import type { RuntimeSource } from "../server-contracts.ts";
import type { DmEffort } from "../../model-runtime/dm-models.ts";
import type { DmLoopTension } from "./contracts.ts";

export const EFFORT_ORDER: readonly DmEffort[] = ["low", "medium", "high", "xhigh", "max"];
export type DepthRange = { min: DmEffort; max: DmEffort };
export type DepthState = { tension: DmLoopTension; effort: DmEffort };

export function parseDepthRange(value: unknown): DepthRange | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  const min = v.min, max = v.max;
  if (!EFFORT_ORDER.includes(min as DmEffort) || !EFFORT_ORDER.includes(max as DmEffort)) return null;
  if (EFFORT_ORDER.indexOf(min as DmEffort) > EFFORT_ORDER.indexOf(max as DmEffort)) return null;
  return { min: min as DmEffort, max: max as DmEffort };
}

export function parseDepthState(privateState: JsonObject): DepthState | null {
  const facts = privateState.fact;
  const raw = facts && typeof facts === "object" && !Array.isArray(facts) ? facts.depth_state : undefined;
  if (typeof raw !== "string") return null;
  try {
    const value = JSON.parse(raw) as Partial<DepthState>;
    if ((value.tension === "calm" || value.tension === "tense" || value.tension === "climax") && EFFORT_ORDER.includes(value.effort as DmEffort))
      return { tension: value.tension, effort: value.effort as DmEffort };
  } catch { /* a malformed note is not state */ }
  return null;
}

/** The server's reading of the next turn's tension: active combat and the DM's
 * climax hint are a climax; the DM's tense hint, many important people in the
 * scene or an open arc on its last step are tense; the rest is calm. */
export function tensionSignals(source: RuntimeSource, input: TurnInput, hint: DmLoopTension | null): { tension: DmLoopTension; reason: string } {
  if (source.runtime.encounters.some((row) => row.status === "active")) return { tension: "climax", reason: "active combat" };
  if (hint === "climax") return { tension: "climax", reason: "DM hint: climax" };
  const present = new Set(source.runtime.configuration?.presentEntityIds ?? []);
  const important = source.snapshot.entities.filter((row) => present.has(row.id) && row.kind === "npc" && row.public_profile?.important).length;
  const arc = source.snapshot.quests.find((row) => row.status === "open" && row.kind === "arc");
  const lastStep = !!arc?.detail?.steps?.length && arc.detail.steps.filter((step) => !step.done).length === 1;
  if (hint === "tense") return { tension: "tense", reason: "DM hint: tense" };
  if (important >= 3) return { tension: "tense", reason: `${important} important people present` };
  if (lastStep) return { tension: "tense", reason: "the main arc is on its last step" };
  if (input.mode === "companion") return { tension: "calm", reason: "a talk with a companion" };
  return { tension: "calm", reason: hint === "calm" ? "DM hint: calm" : "no tension signal" };
}

/** The effort for a tension class inside the range: calm → the bottom, tense →
 * the middle (rounded up), climax → the top. */
export function effortForTension(range: DepthRange, tension: DmLoopTension): DmEffort {
  const lo = EFFORT_ORDER.indexOf(range.min), hi = EFFORT_ORDER.indexOf(range.max);
  if (tension === "climax") return EFFORT_ORDER[hi];
  if (tension === "calm") return EFFORT_ORDER[lo];
  return EFFORT_ORDER[Math.ceil((lo + hi) / 2)];
}

/** The level of this turn with hysteresis: a boosted turn («важный ход») takes
 * the top of the range; otherwise the level changes only when the tension
 * class differs from the stored one. */
export function chooseDepth(range: DepthRange | null, pinnedEffort: DmEffort, previous: DepthState | null,
  signal: { tension: DmLoopTension; reason: string }, boosted: boolean): { effort: DmEffort; tension: DmLoopTension; reason: string; changed: boolean } {
  if (!range) return { effort: pinnedEffort, tension: signal.tension, reason: "no depth range set", changed: false };
  if (boosted) return { effort: range.max, tension: "climax", reason: "important turn", changed: previous?.effort !== range.max };
  if (previous && previous.tension === signal.tension && EFFORT_ORDER.includes(previous.effort) &&
    EFFORT_ORDER.indexOf(previous.effort) >= EFFORT_ORDER.indexOf(range.min) && EFFORT_ORDER.indexOf(previous.effort) <= EFFORT_ORDER.indexOf(range.max))
    return { effort: previous.effort, tension: signal.tension, reason: `${signal.reason} (unchanged)`, changed: false };
  const effort = effortForTension(range, signal.tension);
  return { effort, tension: signal.tension, reason: signal.reason, changed: previous?.effort !== effort };
}
