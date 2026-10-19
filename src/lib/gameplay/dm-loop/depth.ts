// Depth per scene (plan §8б, stage task §7; polish item 13): the owner sets a
// range from the model's own effort list; each turn picks a level inside it.
// Session 1 showed «tense → xhigh» sticking for 22 of 23 turns (a heist is
// always tense), so polish item 13 kept tense turns at the base. Session 2 prep
// (owner, 2026-10-18) brings deep thinking back to hard scenes with the cap
// against sticking kept for them only:
// - calm: the base of the range;
// - climax (active combat, the DM's climax hint, an off-screen plan that comes
//   due and meets the hero, a decisive player input, «важный ход»): always the
//   top, and it resets the tense cap;
// - tense (the DM's tense hint, three or more important people present, the main
//   arc on its last step): the top, but at most MAX_DEEP_STREAK deep tense turns
//   in a row; after that the base until a climax or a calm turn resets the count.
import type { JsonObject, TurnInput } from "../contracts.ts";
import type { RuntimeSource } from "../server-contracts.ts";
import type { DmEffort } from "../../model-runtime/dm-models.ts";
import type { DmLoopTension } from "./contracts.ts";
import { duePlans } from "./plans.ts";

export const EFFORT_ORDER: readonly DmEffort[] = ["low", "medium", "high", "xhigh", "max"];
export type DepthRange = { min: DmEffort; max: DmEffort };
export type DepthState = { tension: DmLoopTension; effort: DmEffort; /** Tense turns in a row since the last calm or climax turn (the cap's count). */ streak?: number };
/** Every new campaign thinks at high and goes to xhigh for a hard scene (polish item 13, session 2 prep). */
export const DEFAULT_DEPTH_RANGE: DepthRange = Object.freeze({ min: "high", max: "xhigh" });
/** The most deep tense turns in a row; a climax is never capped. */
export const MAX_DEEP_STREAK = 3;

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
      return { tension: value.tension, effort: value.effort as DmEffort, streak: Number.isInteger(value.streak) && (value.streak as number) >= 0 ? value.streak : 0 };
  } catch { /* a malformed note is not state */ }
  return null;
}

// The player's input opens a decisive moment: an attack, a jump, a confession,
// a bargain with stakes. Rules first (polish item 13: a tiny model only if the
// rules are not enough — not needed yet); word stems in both campaign languages.
const DECISIVE = /(^|[^\p{L}])(атак|напад|бью|бьёт|ударя|ударю|стреля|выстрел|прыга|прыгну|прыгаю|бросаюсь|кидаюсь|хвата|режу|рублю|душу|толка|ломаю|вскрыва|признаю|сознаюсь|угрожа|ставлю на кон|на кон|рискну|рискую|бегу на|врыва|тараню|attack|strike|stab|shoot|fire at|jump|leap|charge|grab|tackle|smash|break down|confess|threaten|wager|bet everything|stake|risk it|dive at|lunge)/iu;
export function decisiveInput(text: string): boolean {
  return DECISIVE.test(text.toLocaleLowerCase());
}

/** The server's reading of this turn's tension: active combat, the DM's climax
 * hint, an off-screen plan that comes due now or a decisive player input are a
 * climax; the DM's tense hint, many important people in the scene or an open arc
 * on its last step are tense; the rest is calm. */
export function tensionSignals(source: RuntimeSource, input: TurnInput, hint: DmLoopTension | null): { tension: DmLoopTension; reason: string } {
  if (source.runtime.encounters.some((row) => row.status === "active")) return { tension: "climax", reason: "active combat" };
  if (hint === "climax") return { tension: "climax", reason: "DM hint: climax" };
  if (duePlans(source.privateState, source.runtime.worldMinutes).length) return { tension: "climax", reason: "an off-screen plan comes due and meets the hero" };
  if (input.mode !== "companion" && decisiveInput(input.input)) return { tension: "climax", reason: "the player's input opens a decisive moment" };
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

/** The effort for a tension class inside the range before the tense cap: the
 * base for a calm turn, the top for a tense turn and a climax. */
export function effortForTension(range: DepthRange, tension: DmLoopTension): DmEffort {
  return tension === "calm" ? range.min : range.max;
}

/** The level of this turn: a boosted turn («важный ход») and a climax always
 * take the top; a tense turn takes the top unless MAX_DEEP_STREAK tense turns
 * in a row came before it (then the base until a climax or a calm turn resets
 * the count); a calm turn is the base. `streak` is the count of tense turns in
 * a row for the next turn (0 after a calm turn or a climax). */
export function chooseDepth(range: DepthRange | null, pinnedEffort: DmEffort, previous: DepthState | null,
  signal: { tension: DmLoopTension; reason: string }, boosted: boolean): { effort: DmEffort; tension: DmLoopTension; reason: string; changed: boolean; streak: number } {
  if (!range) return { effort: pinnedEffort, tension: signal.tension, reason: "no depth range set", changed: false, streak: 0 };
  // Only a run of tense turns counts; a stored count after a calm turn or a
  // climax (or one written under the older rule) starts over.
  const streakBefore = previous?.tension === "tense" ? previous.streak ?? 0 : 0;
  if (boosted) return { effort: range.max, tension: "climax", reason: "important turn", changed: previous?.effort !== range.max, streak: 0 };
  if (signal.tension !== "tense") {
    const effort = effortForTension(range, signal.tension);
    return { effort, tension: signal.tension, reason: signal.reason, changed: previous?.effort !== effort, streak: 0 };
  }
  const capped = range.max !== range.min && streakBefore >= MAX_DEEP_STREAK;
  const effort = capped ? range.min : range.max;
  const reason = capped ? `${signal.reason}; ${streakBefore} deep tense turns in a row, back to the base until a climax or a calm turn` : signal.reason;
  return { effort, tension: "tense", reason, changed: previous?.effort !== effort, streak: streakBefore + 1 };
}
