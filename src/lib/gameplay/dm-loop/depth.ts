// Depth per scene (plan §8б, stage task §7; polish item 13): the owner sets a
// range from the model's own effort list; each turn picks a level inside it.
// Fix run A3 (owner's decision after session 2, items 59 and 75: «ход на пять
// минут»): every turn thinks at the base of the range; only the player's
// «⚡ важный ход» and a combat climax (an active fight the DM marked as its climax)
// think deep — the top of the range, or one level above the base when both ends
// are the same (the new default range is «высокая — высокая» with the button shown).
// The DM's «tense» hint, many important people, a due plan or a decisive input no
// longer raise the level by themselves; they still name the turn's tension.
// FIX_S4 item 6 (depth by meaning): outside a fight, a line that decides something
// irreversible (an oath, a deal, a betrayal, a killing blow, giving away or destroying
// something, a point of no return) thinks deep too; the button stays a manual override.
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

// FIX_S4 item 6 (depth by meaning): the player's line decides something that cannot be taken back — an oath or a
// promise, a deal struck, a betrayal, a killing blow, giving away or destroying something, a point of no return. A
// quiet conversation that decides such a thing is not calm: it thinks deep without the «⚡» button (which stays a
// manual override). Word stems in both campaign languages; an ordinary attack, a jump or a question is not here.
const IRREVERSIBLE_PHRASES = [
  // An oath, a vow, a promise, one's word given.
  "клянусь", "поклянусь", "присягаю", "даю (?:тебе |вам |ему |ей |им )?слово", "обещаю", "даю обет", "приношу клятву",
  // (Not a question or a condition about one: «what did I promise her?», «if I swear…».)
  "(?<!(?:did|do|didn't|don't|never|not|if|would|should|could|can't|won't) )i (?:swear|vow|promise|pledge)",
  "you have my word", "i give (?:you |him |her |them )?my word", "i take (?:the |an )?oath", "on my honou?r",
  // A deal struck («По рукам.», «Ладно, по рукам» — never «бью веслом по рукам»).
  "(?<!\\p{L} )по рукам", "заключаю сделку", "соглашаюсь на (?:сделку|условия|цену)", "соглас(?:ен|на|ны) на (?:сделку|условия|цену)", "принимаю (?:сделку|условия|предложение)",
  "it'?s a deal", "it is a deal", "we have a deal", "i accept (?:the|your|her|his|their) (?:deal|offer|terms|bargain)",
  "i agree to (?:the|your|her|his|their) (?:deal|terms|bargain|price)", "shake on it",
  // A betrayal.
  "предаю", "выдаю (?:его|её|ее|их)", "сдаю (?:его|её|ее|их)", "доношу на",
  "i betray", "i sell (?:him|her|them) out", "i turn (?:him|her|them) in", "i hand (?:him|her|them) over",
  // A killing blow.
  "убиваю", "добиваю", "приканчиваю", "казню", "перерезаю (?:ему |ей |им )?горло", "наношу смертельный удар",
  "i kill (?:him|her|them|it|the|that|this)\\b", "kill (?:him|her|them)\\b", "finish (?:him|her|them|it) off", "i execute (?:him|her|them|the)\\b",
  "(?:slit|cut) (?:his|her|their) throat", "killing blow", "coup de gr[aâ]ce", "death ?blow",
  // Giving away or destroying something.
  "отдаю (?:ей |ему |им |вам |тебе )?(?:карты|колоду|кольцо|амулет|меч|письмо|всё)", "отказываюсь от", "расстаюсь с", "дарю", "сжигаю", "уничтожаю",
  "разбиваю (?:кольцо|амулет|печать|сосуд|фиал|зеркало)", "ломаю печать", "рву (?:письмо|договор|контракт|расписку)",
  "бросаю (?:его |её |ее |их )?в (?:огонь|море|реку|пропасть|колодец)",
  "i give up the", "i give away", "i hand over the", "i surrender", "i renounce", "i relinquish", "i part with", "i burn the", "i destroy",
  "i break the seal", "i tear up the", "i throw (?:it|them|the [\\p{L} ]{1,30}) into the (?:fire|sea|river|chasm|well)",
  // A point of no return.
  "назад пути нет", "пути назад нет", "сжигаю мосты", "подписываю", "no turning back", "point of no return", "burn (?:my|our|the) bridges", "i sign the",
];
const IRREVERSIBLE = new RegExp(`(^|[^\\p{L}])(?:${IRREVERSIBLE_PHRASES.join("|")})`, "iu");
export function irreversibleInput(text: string): boolean {
  return IRREVERSIBLE.test(text.toLocaleLowerCase().replace(/[’`]/g, "'"));
}

/** The server's reading of this turn's tension: active combat, the DM's climax
 * hint, an off-screen plan that comes due now or a decisive player input are a
 * climax; the DM's tense hint, many important people in the scene or an open arc
 * on its last step are tense; the rest is calm. `combatClimax` (fix run A3): an
 * active fight the DM's previous turn marked as its climax — a signal that
 * thinks deep besides the player's button. `irreversible` (FIX_S4 item 6): outside a
 * fight, the player's line decides something that cannot be taken back — the other. */
export type TensionSignal = { tension: DmLoopTension; reason: string; combatClimax?: boolean; irreversible?: boolean };
export function tensionSignals(source: RuntimeSource, input: TurnInput, hint: DmLoopTension | null): TensionSignal {
  const combat = source.runtime.encounters.some((row) => row.status === "active");
  if (combat && hint === "climax") return { tension: "climax", reason: "the climax of a fight (DM hint)", combatClimax: true };
  if (combat) return { tension: "climax", reason: "active combat" };
  if (input.mode !== "companion" && irreversibleInput(input.input))
    return { tension: "climax", reason: "something irreversible is being decided", irreversible: true };
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

/** The level of this turn (fix run A3; FIX_S4 item 6): a boosted turn («важный ход»), a combat climax and an
 * irreversible decision take the deep level; every other turn — calm, tense or a climax outside a fight — the
 * base. `streak` stays 0 (the old tense cap has nothing to cap). */
export function chooseDepth(range: DepthRange | null, pinnedEffort: DmEffort, previous: DepthState | null,
  signal: TensionSignal, boosted: boolean): { effort: DmEffort; tension: DmLoopTension; reason: string; changed: boolean; streak: number } {
  if (!range) return { effort: pinnedEffort, tension: signal.tension, reason: "no depth range set", changed: false, streak: 0 };
  if (boosted) { const effort = deepEffort(range); return { effort, tension: "climax", reason: "important turn", changed: previous?.effort !== effort, streak: 0 }; }
  if (signal.combatClimax || signal.irreversible) { const effort = deepEffort(range); return { effort, tension: "climax", reason: signal.reason, changed: previous?.effort !== effort, streak: 0 }; }
  const effort = range.min;
  return { effort, tension: signal.tension, reason: `${signal.reason}; the base of the range (deep only for «важный ход», a combat climax or an irreversible decision)`, changed: previous?.effort !== effort, streak: 0 };
}
