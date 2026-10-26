// FIX_S4 item 11c (docs/stages/FIX_S4_TABLE.md): the adventure has a length, and the DM can see the clock. All four
// model players, in different words: two in-game days of excellent legwork and the errand never came into view. The DM is
// a good storyteller without a watch. Three parts, none of which pushes the player: the prep writes an act plan with
// turn budgets (DM-private; act_plan below), the DM marks the turn it put the errand in front of the player
// (finish_turn errandOffered → act_errand_offered), and before every turn the DM reads one clock line — the turn of
// about how many, the act that is due, whether the errand has been offered, how long the player has been at the table
// this session and in all — with the three tools to answer a lag (offer, converge, ask about time). A pure-simulation
// campaign has no prep and so no plan and no line: Table C is the control. Pure: no server imports.
import type { RuntimeSource } from "../server-contracts.ts";

export const ACT_PLAN_KEY = "act_plan";
export const ERRAND_OFFERED_KEY = "act_errand_offered";
/** «About 7 hours of play» ≈ 70 turns at a human pace (the owner, 2026-10-25 01:49). */
export const TURNS_PER_HOUR = 10;
/** A lag of five turns is normal (the stage text); the line names a lag only beyond it. */
export const LAG_GRACE_TURNS = 5;

export type Act = { act: number; untilTurn: number; aim: string; converge: string };
export type ActPlan = { hours: number; turns: number; errand: string; acts: Act[] };

/** The owner's own split, movable: act 1 to turn 15 (the errand offered), act 2 to ~40, act 3 to ~60, act 4 the rest. */
export function defaultActs(turns: number): Act[] {
  const at = (share: number) => Math.max(1, Math.round(turns * share));
  return [
    { act: 1, untilTurn: at(15 / 70), aim: "the errand offered", converge: "" },
    { act: 2, untilTurn: at(40 / 70), aim: "the middle: the people and the means", converge: "" },
    { act: 3, untilTurn: at(60 / 70), aim: "the plan and its execution", converge: "" },
    { act: 4, untilTurn: turns, aim: "the reckoning", converge: "" },
  ];
}

const str = (value: unknown, max: number) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "");

/** The prep's «length», «errand» and «acts» as a plan; null when the prep gave no length (no plan, no clock line). */
export function parseActPlan(value: Record<string, unknown>): ActPlan | null {
  const length = value.length && typeof value.length === "object" ? value.length as Record<string, unknown> : {};
  const hours = Number(length.hours);
  if (!Number.isFinite(hours) || hours <= 0) return null;
  const turns = Math.min(400, Math.max(5, Math.round(Number(length.turns) > 0 ? Number(length.turns) : hours * TURNS_PER_HOUR)));
  const given = (Array.isArray(value.acts) ? value.acts : []).slice(0, 6).flatMap((raw, index) => {
    const row = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
    const untilTurn = Math.round(Number(row.untilTurn));
    return Number.isFinite(untilTurn) && untilTurn > 0 ? [{ act: index + 1, untilTurn: Math.min(turns, untilTurn), aim: str(row.aim, 300), converge: str(row.converge, 500) }] : [];
  });
  // Budgets must rise; a plan that does not keeps the owner's split.
  const ordered = given.length >= 2 && given.every((act, index) => index === 0 || act.untilTurn > given[index - 1].untilTurn);
  const acts = ordered ? given.map((act, index) => (index === given.length - 1 ? { ...act, untilTurn: turns } : act)) : defaultActs(turns);
  return { hours: Math.round(hours * 10) / 10, turns, errand: str(value.errand, 300), acts };
}

const record = (source: Pick<RuntimeSource, "privateState">, key: string): string | null => {
  const facts = source.privateState.fact;
  const raw = facts && typeof facts === "object" && !Array.isArray(facts) ? (facts as Record<string, unknown>)[key] : null;
  return typeof raw === "string" ? raw : null;
};
export function actPlanOf(source: Pick<RuntimeSource, "privateState">): ActPlan | null {
  const raw = record(source, ACT_PLAN_KEY);
  if (!raw) return null;
  try { return parseActPlan(JSON.parse(raw) as Record<string, unknown>); } catch { return null; }
}
export function serializeActPlan(plan: ActPlan): string {
  return JSON.stringify({ length: { hours: plan.hours, turns: plan.turns }, errand: plan.errand, acts: plan.acts });
}
/** The operation that first put the errand in front of the player, or null. */
export function errandOfferedOf(source: Pick<RuntimeSource, "privateState">): { operationId: string | null; worldMinutes: number | null } | null {
  const raw = record(source, ERRAND_OFFERED_KEY);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    return { operationId: typeof value.operationId === "string" ? value.operationId : null, worldMinutes: Number.isFinite(Number(value.worldMinutes)) ? Number(value.worldMinutes) : null };
  } catch { return { operationId: null, worldMinutes: null }; }
}

/** A pause longer than this between two moments of play is not play (as the session digest counts it). */
const PLAY_GAP_MINUTES = 15;
/** Real minutes at the table from a run of timestamps (gaps capped, as `sessionShape` in digest.ts counts them). */
export function playMinutesOf(times: readonly string[]): number {
  const sorted = times.map((at) => Date.parse(at)).filter(Number.isFinite).sort((a, b) => a - b);
  let minutes = 0;
  for (let index = 1; index < sorted.length; index++) minutes += Math.min(PLAY_GAP_MINUTES, (sorted[index] - sorted[index - 1]) / 60_000);
  return Math.round(minutes);
}
const hm = (minutes: number, ru: boolean) => {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return ru ? `${h ? `${h} ч ` : ""}${m} мин` : `${h ? `${h} h ` : ""}${m} min`;
};

export type ClockFacts = { turn: number; plan: ActPlan; act: Act; dueAct: Act | null; offeredTurn: number | null; offered: boolean;
  sessionMinutes: number; totalMinutes: number; sessionNumber: number | null; lag: number };

/** The clock's facts for the turn about to be played (this turn counted), or null without a plan. */
export function clockFacts(source: RuntimeSource, operationId: string | null, now: string | null = null): ClockFacts | null {
  const plan = actPlanOf(source);
  if (!plan) return null;
  const games = source.runtime.turns.filter((turn) => turn.mode === "game" && turn.status === "committed" && turn.id !== operationId)
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  const turn = games.length + 1;
  const act = plan.acts.find((row) => turn <= row.untilTurn) ?? plan.acts.at(-1)!;
  const offeredAt = errandOfferedOf(source);
  const index = offeredAt?.operationId ? games.findIndex((row) => row.id === offeredAt.operationId) : -1;
  const offeredTurn = index >= 0 ? index + 1 : null;
  const offered = !!offeredAt;
  // The act whose budget has passed and whose aim is the errand still unmet: act 1 until the errand is offered.
  const first = plan.acts[0];
  const dueAct = !offered && turn > first.untilTurn ? first : null;
  const lag = dueAct ? turn - dueAct.untilTurn : 0;
  const sessionId = source.snapshot.publicState.current_session_id ?? null;
  const times = (id: string | null) => [...source.snapshot.scenes.filter((row) => id === null || row.session_id === id).map((row) => row.created_at), ...(now ? [now] : [])];
  const sessionMinutes = sessionId ? playMinutesOf(times(sessionId)) : 0;
  const stored = Number(source.snapshot.campaign.play_minutes ?? NaN);
  const totalMinutes = Number.isFinite(stored) && stored > 0 ? Math.max(stored, sessionMinutes) : playMinutesOf(times(null));
  // Sessions in the order play reached them (a session's first scene; one with none yet comes last, as the open one).
  const firstScene = (id: string) => Math.min(...source.snapshot.scenes.filter((row) => row.session_id === id).map((row) => Date.parse(row.created_at)).filter(Number.isFinite), Infinity);
  const ordered = source.snapshot.sessions.map((row, index) => ({ id: row.id, at: firstScene(row.id), index })).sort((a, b) => a.at - b.at || a.index - b.index);
  const at = sessionId ? ordered.findIndex((row) => row.id === sessionId) : -1;
  return { turn, plan, act, dueAct, offeredTurn, offered, sessionMinutes, totalMinutes, sessionNumber: at >= 0 ? at + 1 : null, lag };
}

/** The one clock line before the turn, in the DM's frame (never shown to the player; the owner sees only «act N»). */
export function clockLine(source: RuntimeSource, operationId: string | null, ru = false, now: string | null = null): string {
  const facts = clockFacts(source, operationId, now);
  if (!facts) return "";
  const { turn, plan, act, dueAct, offeredTurn, offered, sessionMinutes, totalMinutes, sessionNumber, lag } = facts;
  const errand = plan.errand ? (ru ? ` («${plan.errand}»)` : ` («${plan.errand}»)`) : "";
  if (ru) {
    const state = offered ? `поручение${errand} предложено${offeredTurn ? ` на ходу ${offeredTurn}` : ""}` : `поручение${errand} ещё не предложено`;
    const due = dueAct ? `; акт ${dueAct.act} должен был закончиться к ходу ${dueAct.untilTurn} — отставание ${lag} ход(ов)` : "";
    const head = `Часы (для тебя, не для игрока): ход ${turn} из ~${plan.turns} (примерно ${plan.hours} ч игры); сейчас акт ${act.act} — ${act.aim || "—"}, до хода ${act.untilTurn}${due}; ${state}; для игрока эта сессия идёт ${hm(sessionMinutes, true)}${sessionNumber ? `, сессия ${sessionNumber}` : ""}, всего за столом ${hm(totalMinutes, true)}.`;
    const converge = act.converge ? ` Как любая нить этого акта ведёт к поручению: ${act.converge}` : "";
    const tools = lag > LAG_GRACE_TURNS
      ? ` Отставание — твоё дело в этом же ходу, одним из трёх способов и никогда не сокращая день игрока: предложи, а не вручай (поставь поручение перед игроком — кто-то подходит, знак у двери, письмо, ход силы — и он может пройти мимо); сведи, а не соперничай (веди выбранную им нить к поручению);${converge ? converge : ""} спроси о времени («до … больше ничего не случится, если ты сам не захочешь»). Собственные часы мира идут дальше.`
      : ` Ты никогда не подгоняешь игрока: предлагай, своди нити, спрашивай о времени; собственные часы мира идут дальше.${converge}`;
    return `${head}${tools}`;
  }
  const state = offered ? `the errand${errand} was offered${offeredTurn ? ` on turn ${offeredTurn}` : ""}` : `the errand${errand} has not been offered`;
  const due = dueAct ? `; act ${dueAct.act} was due by turn ${dueAct.untilTurn} — ${lag} turn(s) behind` : "";
  const head = `The clock (yours, not the player's): turn ${turn} of ~${plan.turns} (about ${plan.hours} hours of play); now act ${act.act} — ${act.aim || "—"}, to turn ${act.untilTurn}${due}; ${state}; for the player this session has run ${hm(sessionMinutes, false)}${sessionNumber ? `, session ${sessionNumber}` : ""}, ${hm(totalMinutes, false)} at the table in all.`;
  const converge = act.converge ? ` How any thread of this act leads to the errand: ${act.converge}` : "";
  const tools = lag > LAG_GRACE_TURNS
    ? ` The lag is yours to answer in this turn, with one of three tools and never by shortening the player's day: offer, do not deliver (put the errand in front of the player — someone approaches, a sign at a door, a letter, a power moves — and let him walk past); converge, do not compete (lead the thread he chose toward the errand);${converge} ask about time («nothing else happens before … unless you want it to»). The world's own clocks keep ticking.`
    : ` You never push the player: offer, converge the threads, ask about time; the world's own clocks keep ticking.${converge}`;
  return `${head}${tools}`;
}

/** The owner's screen shows only the act number (the plan stays DM-private). */
export function currentActNumber(source: RuntimeSource): number | null {
  return clockFacts(source, null)?.act.act ?? null;
}
