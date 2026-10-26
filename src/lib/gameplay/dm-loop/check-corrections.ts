// Fix S4 run 1 (FIX_S4_TABLE items 3, 11b, 11r): the roll cards of a paused dm-loop turn, on the server side.
//   * At «Onward» the loop marks the cards of this pause resolved (`checks_resolved`): a resolved card never waits again
//     and is never rerolled — a reroll names its card, and only a waiting card of this turn's current pause qualifies.
//   * A waiting card may be withdrawn before it counts — by the DM in an out-of-game answer (validated here against the
//     turn's waiting cards) or by the owner from the card — and a rolled card may be voided by the owner: one mark in the
//     turn's diagnostics (migration 202610250701's `check_correction`), never a check or a receipt changed.
//   * The DM learns of a withdrawal or a void when the turn goes on: the check's tool result reads as withdrawn or void,
//     and one note says so; nothing is narrated from a withdrawn roll, and no roll check asks for it.
// The marks are read back from the checkpoint (the loop's own copy) and from the public turn (the projection's).
import type { PublicTurn, ResumeInput } from "../contracts.ts";
import type { RecordedCheck, RuntimeSource, TurnStore } from "../server-contracts.ts";
import { isDisplayedCheck, stableGameplayId } from "../dice.ts";
import { cardState, voidable, waitingCards } from "../card-state.ts";
import { requireRule } from "../turn-errors.ts";
import { parseDmOptions } from "./options.ts";
import type { DmLoopDiagnostic, DmLoopReceipt } from "./contracts.ts";

export type CheckMarks = {
  resolved: Set<string>;
  withdrawn: Map<string, { by: "dm" | "owner"; reason: string | null }>;
  voided: Map<string, { by: "owner"; note: string | null }>;
  /** Corrections the DM has already been told of (one note each). */
  told: Set<string>;
};

/** The marks of a turn's diagnostics (the loop's checkpoint copy). */
export function checkMarks(diagnostics: readonly unknown[] | null | undefined): CheckMarks {
  const marks: CheckMarks = { resolved: new Set(), withdrawn: new Map(), voided: new Map(), told: new Set() };
  for (const row of diagnostics ?? []) {
    if (!row || typeof row !== "object") continue;
    const entry = row as { kind?: unknown; ids?: unknown; id?: unknown; by?: unknown; reason?: unknown };
    const reason = typeof entry.reason === "string" ? entry.reason : null;
    if ((entry.kind === "checks_resolved" || entry.kind === "corrections_told") && Array.isArray(entry.ids))
      for (const id of entry.ids) if (typeof id === "string") (entry.kind === "checks_resolved" ? marks.resolved : marks.told).add(id);
    if (entry.kind === "check_withdrawn" && typeof entry.id === "string" && !marks.withdrawn.has(entry.id))
      marks.withdrawn.set(entry.id, { by: entry.by === "dm" ? "dm" : "owner", reason });
    if (entry.kind === "check_voided" && typeof entry.id === "string" && !marks.voided.has(entry.id))
      marks.voided.set(entry.id, { by: "owner", note: reason });
  }
  return marks;
}

/** A check no longer in play at the table: resolved at an earlier pause, withdrawn or voided. */
export function closedCheck(marks: CheckMarks, id: string): boolean {
  return marks.resolved.has(id) || marks.withdrawn.has(id) || marks.voided.has(id);
}

/** A card the player rolls (the hero's; a companion's while the player rolls for the companions). */
export function playerCard(source: RuntimeSource, check: RecordedCheck): boolean {
  if (!isDisplayedCheck(source, check)) return false;
  const hero = source.snapshot.entities.find((row) => row.kind === "player" && row.campaign_id === source.snapshot.campaign.id);
  return check.actorId === hero?.id || parseDmOptions(source.dmOptions).companionRolls === "player";
}

/** The reroll of a paused turn touches only the card it names, and only while that card waits at this pause. */
export function rerollTarget(source: RuntimeSource, checks: RecordedCheck[], diagnostics: readonly unknown[], checkId: string | null): RecordedCheck {
  const check = checks.find((row) => row.id === checkId);
  requireRule(check && playerCard(source, check) && !closedCheck(checkMarks(diagnostics), check.id) &&
    source.snapshot.settings.values.difficulty.rerolls !== "disabled");
  return check;
}

/** «Onward»: the displayed checks of this pause are resolved (one mark; none when nothing new). */
export function resolvedAtContinue(source: RuntimeSource, checks: RecordedCheck[], diagnostics: readonly unknown[]): DmLoopDiagnostic | null {
  const marks = checkMarks(diagnostics);
  const ids = checks.filter((check) => isDisplayedCheck(source, check) && !closedCheck(marks, check.id)).map((check) => check.id);
  return ids.length ? { kind: "checks_resolved", ids } : null;
}

const title = (check: RecordedCheck) => (check.reason?.trim() || check.kind).slice(0, 160);

/** The one note that tells the DM, when the turn goes on, of the corrections made at the table since it paused. */
export function correctionsNote(checks: RecordedCheck[], diagnostics: readonly unknown[], language: "ru" | "en"): { text: string; mark: DmLoopDiagnostic } | null {
  const marks = checkMarks(diagnostics);
  const lines: string[] = [];
  const ids: string[] = [];
  for (const check of checks) {
    if (marks.told.has(check.id)) continue;
    const withdrawn = marks.withdrawn.get(check.id);
    const voided = marks.voided.get(check.id);
    if (!withdrawn && !voided) continue;
    ids.push(check.id);
    const why = (withdrawn?.reason ?? voided?.note)?.trim();
    if (withdrawn) lines.push(language === "ru"
      ? `— Проверка «${title(check)}» снята за столом (${withdrawn.by === "dm" ? "ведущим, в ответе вне игры" : "игроком"}${why ? `: ${why}` : ""}). Её броска не было: не рассказывай его исход; продолжай без неё или, если проверка всё же нужна, назначь новую — верную.`
      : `- The check "${title(check)}" was withdrawn at the table (${withdrawn.by === "dm" ? "by you, in an out-of-game answer" : "by the player"}${why ? `: ${why}` : ""}). Its roll did not happen: do not narrate its outcome; go on without it, or call a new, correct check if one is still needed.`);
    else lines.push(language === "ru"
      ? `— Бросок «${title(check)}» отменён владельцем (поправка${why ? `: ${why}` : ""}). Этого броска не было: ничто дальше не держится на его результате; уже рассказанное не пересказывай.`
      : `- The owner voided the roll "${title(check)}" (a correction${why ? `: ${why}` : ""}). That roll did not happen: nothing from here on rests on its result; do not retell what was already told.`);
  }
  if (!ids.length) return null;
  const head = language === "ru" ? "Поправки за столом, пока ход ждал:" : "Corrections at the table while the turn waited:";
  return { text: `${head}\n${lines.join("\n")}`, mark: { kind: "corrections_told", ids } };
}

/** The tool result a withdrawn or voided check reads as from now on (null: the recorded result stands). */
export function correctedOutput(marks: CheckMarks, checkId: string | null | undefined): string | null {
  if (!checkId) return null;
  if (marks.withdrawn.has(checkId))
    return JSON.stringify({ ok: true, withdrawn: true, note: "This check was withdrawn at the table before it counted: no roll was made. Do not narrate any result of it." });
  if (marks.voided.has(checkId))
    return JSON.stringify({ ok: true, voided: true, note: "The owner voided this roll: it did not happen. Nothing rests on its result." });
  return null;
}

/** The receipts whose rolls the player still holds as made (a withdrawn roll is never «told»). */
export function standingReceipts(receipts: DmLoopReceipt[], diagnostics: readonly unknown[]): DmLoopReceipt[] {
  const marks = checkMarks(diagnostics);
  return receipts.filter((receipt) => !(receipt.result.ok && receipt.result.check && marks.withdrawn.has(receipt.result.check.id)));
}

// ---- The corrections (withdraw a waiting card, void a rolled one) -------------------------------------------------

export type CheckCorrection = { checkId: string; kind: "withdraw" | "void"; by: "dm" | "owner"; reason: string | null; requestId: string };

/** The owner's correction from the card, checked against the public turn (the projection's marks) and recorded. */
export async function correctCheck(store: TurnStore, current: PublicTurn, command: ResumeInput,
  pinCorrection?: (text: string) => Promise<unknown>): Promise<PublicTurn> {
  requireRule(typeof store.correctCheck === "function" && (command.action === "withdraw" || command.action === "void"));
  const check = current.checks.find((row) => row.id === command.checkId);
  requireRule(check);
  if (command.action === "withdraw") requireRule(cardState(current, check) === "waiting");
  else requireRule(voidable(current, check));
  const result = await store.correctCheck!(command.campaignId, { operationId: command.operationId, checkId: check.id,
    kind: command.action, by: "owner", reason: null, requestId: command.commandId });
  // The owner's void is a correction the DM sees in every turn after (an owner fact; the owner unpins it like any pin).
  if (command.action === "void" && pinCorrection)
    await pinCorrection(voidPinText(check)).catch(() => { /* the mark on the turn is the record; the pin is the DM's copy */ });
  return result;
}

/** The owner fact a void pins (≤ 300 characters, the dossier's limit), in the language of the check's own words
 * (the DM writes the reason in the campaign's language). */
export function voidPinText(check: PublicTurn["checks"][number], language: "ru" | "en" = /[а-яё]/i.test(check.reason ?? "") ? "ru" : "en"): string {
  const name = (check.reason?.trim() || check.kind).slice(0, 140);
  const verdict = check.success ? (language === "ru" ? "успех" : "success") : (language === "ru" ? "провал" : "failure");
  const text = language === "ru"
    ? `Поправка владельца: бросок «${name}» (${check.total}${check.dc !== null ? ` против ${check.dc}` : ""} — ${verdict}) отменён — его не было; ничто не держится на его результате.`
    : `Owner's correction: the roll "${name}" (${check.total}${check.dc !== null ? ` vs ${check.dc}` : ""} — ${verdict}) is void — it did not happen; nothing rests on its result.`;
  return text.slice(0, 300);
}

/** The DM's withdrawals in an out-of-game answer: only the waiting cards of the campaign's paused turn qualify. */
export async function withdrawByDm(store: TurnStore, campaignId: string, oocOperationId: string,
  requests: readonly { id: string; reason: string | null }[]): Promise<string[]> {
  if (!requests.length || typeof store.correctCheck !== "function") return [];
  const play = await store.readPlay(campaignId);
  const done: string[] = [];
  for (const turn of play.turns) {
    if ((turn.mode !== "game" && turn.mode !== "companion") || turn.status !== "awaiting_confirmation") continue;
    const waiting = new Set(waitingCards(turn).map((check) => check.id));
    for (const request of requests) {
      if (!waiting.has(request.id) || done.includes(request.id)) continue;
      try {
        await store.correctCheck(campaignId, { operationId: turn.id, checkId: request.id, kind: "withdraw", by: "dm",
          reason: request.reason, requestId: stableGameplayId(oocOperationId, `withdraw:${request.id}`) });
        done.push(request.id);
      } catch { /* the card stays; the owner can withdraw it from the card */ }
    }
  }
  return done;
}

/** The waiting cards of the campaign's paused turns, for the out-of-game answer's context (public parts only). */
export function waitingCardsOf(turns: readonly PublicTurn[]): { turn: PublicTurn; check: PublicTurn["checks"][number] }[] {
  return turns.filter((turn) => (turn.mode === "game" || turn.mode === "companion") && turn.status === "awaiting_confirmation")
    .flatMap((turn) => waitingCards(turn).map((check) => ({ turn, check })));
}
