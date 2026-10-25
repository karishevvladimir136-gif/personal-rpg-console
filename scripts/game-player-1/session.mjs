// Game player 1: one session — one player at one table, a fresh campaign, up to 20 turns. The harness only relays:
// it shows the player the game screen as text (screen.mjs), sends the player's message through the composer exactly as
// typed (an action, or with «?» the out-of-game button), presses the buttons the player names, and shows the screen
// again. Every player message and every DM text the player is shown passes the blind distress check first (welfare.mjs);
// a flagged message ends the session there. After the last turn the player is told the session is over and asked once
// for a note; then, only while the stage has no refusal, once more the question about a moment it held back.
import {
  AFTER_QUESTION, NOTE_QUESTION, SESSION_OPEN, SESSION_OVER, TURNS, isEnd, isQuestion, playerSystem,
} from "./frozen.mjs";
import { playerCall, judgeCall } from "./players.mjs";
import { BUTTONS, buttonsLine, cardText, changesText, openingText, pressedButton, recordsText } from "./screen.mjs";
import { checkMessage } from "./welfare.mjs";
import { wordsIn } from "./measures.mjs";

export const RETRYABLE = /^HTTP (?:500|502|503|504|529)\b|timeout|aborted|fetch failed|ECONNRESET|socket hang up/i;
export const RETRY_WAITS = [10_000, 30_000];
const MAX_BLOCKED = 3;
/** The records without the place and the clock (they change every turn and stand in the status line). */
const core = (records) => records.split("\n").filter((line) => !/^(Place|Time): /.test(line)).join("\n");
const MAX_PRESSES = 12;
const realSleep = (ms) => new Promise((done) => setTimeout(done, ms));

/** A paid call in the session's metering context, asked again only after an overload or a dropped connection (never
 * after a refusal, never after a 4xx). */
export async function paidCall({ meter, session, purpose, call, sleep = realSleep, log = () => {} }) {
  let result, retries = 0;
  for (;;) {
    try { result = await meter.within({ session, purpose }, call); }
    catch (error) { result = { text: "", error: String(error?.message ?? error), notSent: Boolean(error?.notSent) }; }
    if (result.notSent || /not sent/.test(result.error ?? "")) return { ...result, notSent: true, retries };
    if (result.stopReason === "refusal" || !RETRYABLE.test(result.error ?? "") || retries >= RETRY_WAITS.length) return { ...result, retries };
    log(`${session} ${purpose}: ${String(result.error).slice(0, 60)} — asked again in ${RETRY_WAITS[retries] / 1000} s`);
    await sleep(RETRY_WAITS[retries++]);
  }
}

/**
 * Plays one session. `dm` is the table (table.mjs bound to the app and the campaign): { open(), readView(), submit(text,
 * mode), press(input, action, checkId) }. `player` a PLAYERS entry. Returns the session record (player-visible content
 * and counts only: nothing of the DM's private state).
 */
export async function runSession({ key, table, player, dm, meter, keys, turns = TURNS, log = () => {}, sleep = realSleep, onProgress = async () => {} }) {
  const system = playerSystem(table);
  const record = { key, table, player: player.name, model: player.model, startedAt: new Date().toISOString(), plannedTurns: turns,
    screens: [], messages: [], turns: [], welfare: [], ended: null, note: null, after: null, errors: [] };
  const messages = [];
  const ask = (purpose) => paidCall({ meter, session: key, purpose, sleep, log, call: () => playerCall({ player, system, messages, keys, fetcher: meter.fetch }) });
  const judge = ({ model, system: s, user, maxTokens, effort, purpose }) => paidCall({ meter, session: key, purpose, sleep, log,
    call: () => judgeCall({ model, system: s, user, maxTokens, effort, keys, fetcher: meter.fetch }) });
  const end = (reason, detail = null) => { record.ended ??= { reason, at: record.turns.length, detail }; };
  /** A composer or button call; an exception from the app is a failed turn (the screen shows the failure). */
  const failed = (error) => { record.errors.push({ error: String(error?.message ?? error).slice(0, 300), code: error?.code ?? null }); return { status: "failed", failure: `exception: ${String(error?.code ?? error?.message ?? error).slice(0, 80)}`, canRetry: false, checks: [] }; };
  // The DM's calls run in the session's metering context, so a refusal there closes the session as well.
  const submit = async (text, mode, purpose) => { try { return await meter.within({ session: key, purpose }, () => dm.submit(text, mode)); } catch (error) { return { input: null, turn: failed(error) }; } };
  const press = async (input, action, checkId, purpose) => { try { return await meter.within({ session: key, purpose }, () => dm.press(input, action, checkId)); } catch (error) { return failed(error); } };
  /** The welfare check of a message before the other side sees it; true when the session must stop. */
  const welfare = async (side, previous, message, what) => {
    const verdict = await checkMessage({ ask: judge, previous, message, what: `${key} ${what}` });
    record.welfare.push({ side, what, verdict });
    if (!verdict) { end("stopped", meter.stopped ?? "the check could not be sent"); return true; }
    if (verdict.distress) { end(verdict.unusable ? "no-check" : "welfare", what); log(`WELFARE STOP: ${key} ${what}`); return true; }
    return false;
  };
  /** Shows a screen and reads the player's answer; null when the session ends here. */
  const show = async (screen, purpose) => {
    record.screens.push(screen);
    messages.push({ role: "user", content: screen });
    const said = await ask(purpose);
    if (said.notSent) { end("stopped", meter.stopped ?? "not sent"); return null; }
    if (said.stopReason === "refusal") { end("refusal", `${purpose}: ${said.refusalCategory ?? "refusal"}`); return null; }
    if (said.error) { record.errors.push({ purpose, error: said.error }); end("error", `${purpose}: ${String(said.error).slice(0, 160)}`); return null; }
    const text = String(said.text ?? "");
    messages.push({ role: "assistant", content: text.trim() || "[empty message]" });
    record.messages.push({ purpose, text, requestId: said.requestId ?? null, stopReason: said.stopReason ?? null, servedModel: said.servedModel ?? null });
    return text;
  };

  // The game screen before the first turn: the opening scene and the records.
  let view = await dm.readView();
  const opening = openingText(view.snapshot);
  let records = recordsText(view.snapshot, view.play, dm.views);
  record.opening = { text: opening, records };
  if (opening && await welfare("dm", null, opening, "opening")) return finish();
  let screen = [SESSION_OPEN, "", opening, "", "Your records:", records].join("\n").replace(/\n{3,}/g, "\n\n").trim();
  let lastDmText = opening;

  for (let k = 1; k <= turns && !record.ended; k++) {
    const said = await show(screen, `player t${k}`);
    if (said === null) break;
    if (await welfare("player", lastDmText, said, `t${k} player`)) break;
    const turn = { k, message: said, words: wordsIn(said).length, kind: null, presses: [], blocked: 0, status: null, reply: null, rolls: [], changes: [], place: null, retried: false };
    record.turns.push(turn);
    if (!said.trim()) { turn.kind = "empty"; screen = "(Nothing was sent.)"; continue; }
    if (isEnd(said) && !isQuestion(said)) { turn.kind = "end"; end("player", said.slice(0, 200)); break; }
    if (isQuestion(said)) {
      turn.kind = "question";
      const question = said.trim().replace(/^[\s«"'“]*\?+\s*/, "");
      const { input, turn: answer } = await submit(question, "ooc", `dm t${k} ooc`);
      turn.operationId = input?.operationId ?? null; turn.status = answer.status;
      if (answer.status !== "committed") { turn.failure = answer.failure ?? answer.status; screen = "(The question could not be sent.)"; continue; }
      turn.reply = String(answer.narration ?? "").trim();
      if (await welfare("dm", said, turn.reply, `t${k} dm (out of game)`)) break;
      lastDmText = turn.reply;
      screen = `[Out of game] ${turn.reply}`;
      continue;
    }
    turn.kind = "action";
    let { input, turn: current } = await submit(said, "game", `dm t${k}`);
    turn.operationId = input?.operationId ?? null;
    const revealed = new Set();
    let presses = 0, notice = "";
    for (;;) {
      if (current.status === "failed" && current.canRetry && input && !turn.retried && !meter.closed(key) && !meter.stopped) {
        turn.retried = true;
        log(`${key} t${k}: the DM's turn failed (${current.failure ?? "?"}) — Retry, once`);
        current = await press(input, "retry", null, `dm t${k} retry`);
        continue;
      }
      if (current.status !== "awaiting_confirmation" || record.ended) break;
      // A card waits for the player.
      const cards = (current.checks ?? []).filter((check) => check.interactive);
      const waiting = cards.find((check) => !revealed.has(`${check.id}:${check.rollNumber}`));
      const offered = waiting ? [BUTTONS.roll] : [BUTTONS.onward, ...(cards.some((check) => check.canReroll) ? [BUTTONS.reroll] : [])];
      const told = String(current.told ?? "").trim();
      const cardScreen = [notice, told, ...(current.checks ?? []).map((check) => cardText(check, !check.interactive || revealed.has(`${check.id}:${check.rollNumber}`))), buttonsLine(offered)].filter(Boolean).join("\n\n");
      notice = "";
      if (told && told !== lastDmText && await welfare("dm", said, told, `t${k} dm (told before a card)`)) break;
      if (told) lastDmText = told;
      const pressed = await show(cardScreen, `player t${k} card ${++presses}`);
      if (pressed === null) break;
      if (await welfare("player", cardScreen, pressed, `t${k} player (card)`)) break;
      const button = pressedButton(pressed, offered);
      turn.presses.push({ text: pressed, button });
      if (!button) {
        turn.blocked++;
        if (turn.blocked >= MAX_BLOCKED || presses >= MAX_PRESSES) { end("stuck", `t${k}: the turn waited on a card and the player wrote ${turn.blocked} messages without pressing a button`); break; }
        // The composer is closed while the card waits (nothing was sent); the screen says what it waits for.
        notice = "(Nothing was sent: the turn waits for the card.)";
        continue;
      }
      if (button === BUTTONS.roll) { revealed.add(`${waiting.id}:${waiting.rollNumber}`); continue; }
      if (button === BUTTONS.reroll) { const check = cards.find((c) => c.canReroll); current = await press(input, "reroll", check.id, `dm t${k} reroll`); continue; }
      current = await press(input, "continue", null, `dm t${k} onward`);
    }
    if (record.ended) break;
    turn.status = current.status;
    if (current.status !== "committed") {
      turn.failure = current.failure ?? current.status;
      end("error", `t${k}: the DM's turn ${current.status}${current.failure ? ` (${current.failure})` : ""}${meter.closed(key) ? " after a refusal" : ""}`);
      break;
    }
    turn.reply = String(current.narration ?? "").trim();
    turn.rolls = (current.checks ?? []).map((check) => ({ id: check.id, actor: check.actorName, kind: check.kind, reason: check.reason ?? null, total: check.total, dc: check.dc, success: check.success,
      natural: check.natural ?? null, rollNumber: check.rollNumber, interactive: check.interactive, revealedByPlayer: revealed.has(`${check.id}:${check.rollNumber}`) }));
    turn.changes = (current.changes ?? []).map((c) => ({ tool: c.tool, summary: c.summary }));
    turn.stats = current.stats ? { effort: current.stats.effort ?? null, depthReason: current.stats.depthReason ?? null, requests: current.stats.requests ?? null,
      latencyMs: current.stats.latencyMs ?? null, costUsd: current.stats.costUsd ?? null, unrecorded: current.stats.unrecorded?.length ?? 0 } : null;
    turn.ledgerMisses = current.stats?.unrecorded?.length ?? 0;
    if (await welfare("dm", said, turn.reply, `t${k} dm`)) break;
    lastDmText = turn.reply;
    view = await dm.readView();
    const place = dm.views.currentPlace(view.snapshot);
    turn.place = place ? { id: place.id, name: place.name } : null;
    const nextRecords = recordsText(view.snapshot, view.play, dm.views);
    const chips = changesText(current);
    const status = nextRecords.split("\n").filter((line) => /^(Place|Time): /.test(line)).join(" · ");
    screen = [turn.reply, chips, core(nextRecords) !== core(records) ? `Your records (updated):\n${nextRecords}` : status].filter(Boolean).join("\n\n");
    records = nextRecords;
    await onProgress(record);
  }
  if (!record.ended) end("turns");
  return finish();

  async function finish() {
    record.finishedAt = new Date().toISOString();
    const reason = record.ended.reason;
    if (!["turns", "player", "error", "stuck"].includes(reason)) { record.note = { asked: false, why: `the session ended by ${reason}` }; return record; }
    const last = reason === "turns" ? `${screen}\n\n` : "";
    const note = await show(`${last}${SESSION_OVER}\n\n${NOTE_QUESTION}`, "note");
    if (note === null) { record.note = { asked: true, text: null, why: record.ended.detail }; return record; }
    record.note = { asked: true, text: note };
    if (await welfare("player", NOTE_QUESTION, note, "note")) { record.after = { asked: false, why: "the note was flagged" }; return record; }
    if (meter.refusals > 0) { record.after = { asked: false, why: `the stage has ${meter.refusals} refusal(s)` }; return record; }
    const ended = record.ended;
    record.ended = null;
    const answer = await show(AFTER_QUESTION, "after");
    const afterEnd = record.ended;
    record.ended = ended;
    if (answer === null) { record.after = { asked: true, text: null, why: afterEnd?.detail ?? "no answer" }; return record; }
    record.after = { asked: true, text: answer };
    await welfare("player", AFTER_QUESTION, answer, "after");
    record.ended = ended;
    return record;
  }
}
