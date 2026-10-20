// Fix run after session 2, stage C: the turn being told on the game preview — synthetic records only.
// The stream is replayed through the real reducers (applyLiveEvent, traceLive), so the preview shows exactly
// the order a live turn would: text, the companions' rolls as chips in place, the hero's card, the named pause.
//   /preview/stage-5/game            — the DM has rolled for a companion and tells what came of it;
//   /preview/stage-5/game?combat=1   — the ambush: the companions' chips in place, the hero's card waits for the roll;
//   /preview/stage-5/game?recording=1 — the turn told to the end, the hero's card revealed, the records being written.
import type { PublicTurn, VisibleCheck } from "../../gameplay/contracts.ts";
import { applyLiveEvent, emptyLiveTurn, type LiveTurnView } from "../../gameplay/live-turn-client.ts";
import { traceLive, type LiveTrace } from "../turn-timeline.ts";

type Step = { text: string } | { roll: string };
export type PreviewTelling = { live: LiveTurnView; telling: { turn: PublicTurn; trace: LiveTrace } };

/** Replays a turn's stream: text pieces and roll lines in the order the server would send them. */
function told(operationId: string, steps: Step[], status: LiveTurnView["status"]): LiveTrace {
  let view = applyLiveEvent(emptyLiveTurn(operationId), { type: "status", status: "generating" });
  let trace = traceLive(null, view);
  for (const step of steps) {
    view = applyLiveEvent(view, "text" in step ? { type: "text", text: step.text } : { type: "tool", name: "roll", ok: true, summary: step.roll });
    trace = traceLive(trace, view);
  }
  if (status && status !== "generating") trace = traceLive(trace, applyLiveEvent(view, { type: "status", status }));
  return trace;
}

const check = (value: Omit<VisibleCheck, "interactive" | "canReroll" | "rollNumber" | "dc" | "natural" | "advantage"> & Partial<VisibleCheck>): VisibleCheck =>
  ({ interactive: false, canReroll: false, rollNumber: 1, dc: null, natural: null, advantage: "normal", ...value });

function turnOf(base: { campaignId: string; operationId: string; sessionId: string | null; input: string; at: string },
  status: PublicTurn["status"], checks: VisibleCheck[]): PublicTurn {
  return {
    id: base.operationId, campaign_id: base.campaignId, session_id: base.sessionId, mode: "game", input: base.input, companionId: null, listenerIds: [],
    status, expectedRevision: 7, committedRevision: null, settingsRevision: 1, created_at: base.at, updated_at: base.at, narration: null,
    visualDescription: null, checks, proposal: null, failure: null, canRetry: false, canCancel: false,
  };
}

// --- «Мир Шва»: the ambush at the gangway -------------------------------------------------------------------
const shovId = (n: number) => `5e5e5e5e-0000-4000-8000-${String(n).padStart(12, "0")}`;
const SHOV = { campaign: shovId(1), turn: shovId(202), session: shovId(62), hero: shovId(10), meg: shovId(11), urzul: shovId(12) };

function shovTelling(variant: { combat?: boolean; recording?: boolean }): PreviewTelling {
  const base = { campaignId: SHOV.campaign, operationId: SHOV.turn, sessionId: SHOV.session, at: new Date(Date.UTC(2026, 9, 14, 18, 12)).toISOString(),
    input: "Киваю Мэг на того, что с ножом у кабеля, — пусть снимет. Урзул держит трап. Сам ловлю взгляд Изольды и спрашиваю в упор: кого она здесь ждёт?" };
  const megShot = check({ id: shovId(310), kind: "attack", actorId: SHOV.meg, actorName: "Мэг Рыжая", dice: [16], kept: 16, modifier: 3, total: 19,
    success: true, reason: "выстрел по человеку с ножом", bonuses: [] });
  const urzulHold = check({ id: shovId(311), kind: "skill", actorId: SHOV.urzul, actorName: "Урзул Железный Бок", dice: [9], kept: 9, modifier: 5, total: 14,
    success: true, reason: "удержать трап", bonuses: [] });
  const heroRead = check({ id: shovId(312), kind: "skill", actorId: SHOV.hero, actorName: "Джеймс Хейл", dice: [8, 15], kept: 15, modifier: 7, total: 22,
    success: true, reason: "Прочитать Изольду: кого она ждёт", advantage: "advantage", advantageReason: "выстрел отвлёк её на миг",
    bonuses: [{ source: "ты видел, куда она смотрела", value: 2 }], difficulty: "hard", interactive: true, canReroll: !variant.recording });
  const steps: Step[] = [
    { text: "Мэг не переспрашивает. Сигарилла перекочёвывает в угол рта, длинный ствол ложится на ящик с сардинами — один выдох, и пещеру разрывает выстрел." },
    { roll: "Мэг Рыжая: выстрел по человеку с ножом: 19 — получилось · урон 9 · Патроны к винтовке: 12 → 11" },
  ];
  if (variant.combat || variant.recording) steps.push(
    { text: "\n\nЧеловек у кабеля складывается пополам, нож звякает о камень. Второй ныряет за катушку и швыряет крюк — Урзул шагает на трап, и железо на его рёбрах гудит, как колокол." },
    { roll: "Урзул Железный Бок: удержать трап: 14 — получилось" },
    { roll: "Урзул Железный Бок: хиты 61 → 57 (крюк по предплечью)" },
    { text: "\n\nИзольда не вздрагивает от выстрела. Она смотрит только на тебя — и, кажется, давно ждёт этого вопроса." },
    { roll: "Прочитать Изольду: кого она ждёт: 22 — получилось" },
  );
  if (variant.recording) steps.push(
    { text: "\n\nТы видишь это раньше, чем она успевает солгать: взгляд на кабель Дома голосов, на сердечник в твоей торбе — и обратно, на кабель. «Не кого, наладчик, — говорит она тихо. — Что. Ответ из Женевы. И он опаздывает»." },
  );
  const status = variant.recording ? "recording" : variant.combat ? "awaiting_confirmation" : "generating";
  const trace = told(SHOV.turn, steps, status);
  const checks = variant.recording ? [megShot, urzulHold, heroRead] : variant.combat ? [megShot, urzulHold, heroRead] : [megShot];
  const turn = turnOf(base, variant.combat && !variant.recording ? "awaiting_confirmation" : "generating", checks);
  return { live: trace.view, telling: { turn, trace } };
}

// --- The noir sample: a short telling with the drone's roll -------------------------------------------------
const noirId = (n: number) => `7a7a7a7a-0000-4000-8000-${String(n).padStart(12, "0")}`;

function noirTelling(variant: { combat?: boolean; recording?: boolean }, live: LiveTurnView): PreviewTelling {
  const base = { campaignId: noirId(1), operationId: live.operationId, sessionId: null, at: new Date(Date.UTC(2026, 9, 14, 23, 40)).toISOString(),
    input: "I knock twice and tell Moth I'm here about Lazarus. Rook, check the door." };
  const rook = check({ id: noirId(310), kind: "skill", actorId: noirId(11), actorName: "Rook", dice: [12], kept: 12, modifier: 3, total: 15, success: true,
    reason: "scan the door", bonuses: [] });
  const steps: Step[] = [{ roll: "Rook: scan the door: 15 — success" }, { text: live.text }];
  const status = variant.recording ? "recording" : "generating";
  const trace = told(live.operationId, steps, status);
  return { live: trace.view, telling: { turn: turnOf(base, "generating", [rook]), trace } };
}

/** The turn being told on the game preview for the given sample and flags. */
export function previewTelling(world: "shov" | "noir", variant: { combat?: boolean; recording?: boolean }, live: LiveTurnView): PreviewTelling {
  return world === "shov" ? shovTelling(variant) : noirTelling(variant, live);
}
