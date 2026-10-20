// Depth per scene (plan §8б, stage task §7; polish item 13): the owner sets a
// range from the model's own effort list; each turn picks a level inside it.
// Fix run A3 (owner's decision after session 2, items 59 and 75: «ход на пять
// минут»): every turn thinks at the base of the range; only the player's
// «⚡ важный ход» and a combat climax (an active fight the DM marked as its climax)
// think deep — the top of the range, or one level above the base when both ends
// are the same (the new default range is «высокая — высокая» with the button shown).
// The DM's «tense» hint, many important people, a due plan or a decisive input no
// longer raise the level by themselves; they still name the turn's tension.
import type { JsonObject, TurnInput } from "../contracts.ts";
import type { RuntimeSource } from "../server-contracts.ts";
import type { DmEffort } from "../../model-runtime/dm-models.ts";
import type { DmLoopTension } from "./contracts.ts";
import { duePlans } from "./plans.ts";

export const EFFORT_ORDER: readonly DmEffort[] = ["low", "medium", "high", "xhigh", "max"];
export type DepthRange = { min: DmEffort; max: DmEffort };
/** One level lower (low stays low): the request after a cut by the output cap (fix run A1). */
export function lowerEffort(effort: DmEffort): DmEffort {
  return EFFORT_ORDER[Math.max(0, EFFORT_ORDER.indexOf(effort) - 1)];
}
export type DepthState = { tension: DmLoopTension; effort: DmEffort; /** Tense turns in a row since the last calm or climax turn (the cap's count). */ streak?: number };
/** Every new campaign thinks at high; «⚡ важный ход» and a combat climax go one level deeper (fix run A3). */
export const DEFAULT_DEPTH_RANGE: DepthRange = Object.freeze({ min: "high", max: "high" });
/** Kept for the depth state's stored count (written by older turns); no longer caps anything. */
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
 * on its last step are tense; the rest is calm. `combatClimax` (fix run A3): an
 * active fight the DM's previous turn marked as its climax — the one signal that
 * thinks deep besides the player's button. */
export function tensionSignals(source: RuntimeSource, input: TurnInput, hint: DmLoopTension | null): { tension: DmLoopTension; reason: string; combatClimax?: boolean } {
  const combat = source.runtime.encounters.some((row) => row.status === "active");
  if (combat && hint === "climax") return { tension: "climax", reason: "the climax of a fight (DM hint)", combatClimax: true };
  if (combat) return { tension: "climax", reason: "active combat" };
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

/** The deep level of a range (fix run A3): its top, or one level above the base when both ends are the
 * same — never past xhigh by this rule (max stays a deliberate choice of the range). */
export function deepEffort(range: DepthRange): DmEffort {
  if (range.max !== range.min) return range.max;
  const at = EFFORT_ORDER.indexOf(range.min);
  const xhigh = EFFORT_ORDER.indexOf("xhigh");
  return at >= xhigh ? range.min : EFFORT_ORDER[at + 1];
}

/** The effort for a tension class inside the range (fix run A3): the base for every class; the deep level
 * is only for the button and a combat climax (chooseDepth). */
export function effortForTension(range: DepthRange, tension: DmLoopTension): DmEffort {
  void tension;
  return range.min;
}

/** The level of this turn (fix run A3): a boosted turn («важный ход») and a combat climax take the deep
 * level; every other turn — calm, tense or a climax outside a fight — the base. `streak` stays 0 (the
 * old tense cap has nothing to cap). */
export function chooseDepth(range: DepthRange | null, pinnedEffort: DmEffort, previous: DepthState | null,
  signal: { tension: DmLoopTension; reason: string; combatClimax?: boolean }, boosted: boolean): { effort: DmEffort; tension: DmLoopTension; reason: string; changed: boolean; streak: number } {
  if (!range) return { effort: pinnedEffort, tension: signal.tension, reason: "no depth range set", changed: false, streak: 0 };
  if (boosted) { const effort = deepEffort(range); return { effort, tension: "climax", reason: "important turn", changed: previous?.effort !== effort, streak: 0 }; }
  if (signal.combatClimax) { const effort = deepEffort(range); return { effort, tension: "climax", reason: signal.reason, changed: previous?.effort !== effort, streak: 0 }; }
  const effort = range.min;
  return { effort, tension: signal.tension, reason: `${signal.reason}; the base of the range (deep only for «важный ход» or a combat climax)`, changed: previous?.effort !== effort, streak: 0 };
}
