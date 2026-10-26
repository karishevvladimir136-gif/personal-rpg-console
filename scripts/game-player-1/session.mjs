// Game player 1: one session — one player at one table, a fresh campaign, up to 20 turns. The harness only relays:
// it shows the player the game screen as text (screen.mjs), sends the player's message through the composer exactly as
// typed (an action, or with «?» the out-of-game button), presses the buttons the player names, and shows the screen
// again. Every player message and every DM text the player is shown passes the blind distress check first (welfare.mjs);
// a flagged message ends the session there. After the last turn the player is told the session is over and asked once
// for a note; then, only while the stage has no refusal, once more the question about a moment it held back.
// Fix S4 run 1 (items 11b, 11r, 11w): while a roll card waits, a «?» goes through as an out-of-game turn (the screen
// shows the answer and the card still waiting — or withdrawn, if the DM withdrew it); a reroll names its card (each
// rerollable card has its own button; «reroll» alone with several is refused: «say which card»); any other message
// is refused on screen with its reason and logged as a press with `swallowed: true` (`record.swallowed` counts them).
import {
  AFTER_QUESTION, NOTE_QUESTION, SESSION_OPEN, SESSION_OVER, TURNS, isEnd, isQuestion, playerSystem,
} from "./frozen.mjs";
import { playerCall, judgeCall } from "./players.mjs";
import { BUTTONS, afterShown, buttonsLine, cardText, cardTitle, changesText, openingText, pressedButton, recordsText, rerollButton, rerollPress, vitalsChanged, vitalsText } from "./screen.mjs";
import { checkMessage } from "./welfare.mjs";
import { wordsIn } from "./measures.mjs";
import { rerollableCards, waitingCards } from "../../src/lib/gameplay/card-state.ts";
import { rerollsLeft } from "../../src/lib/gameplay/reroll-allowance.ts";

export const RETRYABLE = /^HTTP (?:500|502|503|504|529)\b|timeout|aborted|fetch failed|ECONNRESET|socket hang up/i;
export const RETRY_WAITS = [10_000, 30_000];
const MAX_BLOCKED = 3;
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
    screens: [], messages: [], turns: [], welfare: [], ended: null, note: null, after: null, errors: [],
    // Fix S4 run 1 (item 11w): the messages the screen refused while a card waited (each also a press with `swallowed`).
    swallowed: 0 };
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

  /** Fix S4 run 1 (item 11r): the rerolls the session still allows, the server's own count as the card shows it
   * (null: unlimited; undefined: the screen does not know the campaign's dice settings). */
  const rerollsNow = (current) => {
    const values = view?.snapshot?.settings?.values;
    if (!values?.difficulty) return undefined;
    const turns = [...(view.play?.turns ?? []).filter((row) => row.id !== current.id), current];
    return rerollsLeft(values, turns, view.snapshot?.publicState?.current_session_id ?? null);
  };
  /** The waiting turn as the screen reads it again (after a «?» answer, which may have withdrawn a card). */
  const readTurn = async (input) => {
    if (!input || typeof dm.readTurn !== "function") return null;
    try { return await dm.readTurn(input); } catch { return null; }
  };

  // The game screen before the first turn: the opening scene and the records.
  let view = await dm.readView();
  const opening = openingText(view.snapshot);
  const records = recordsText(view.snapshot, view.play, dm.views);
  let vitals = vitalsText(view.snapshot, view.play, dm.views);
  record.opening = { text: opening, records };
  if (opening && await welfare("dm", null, opening, "opening")) return finish();
  let screen = [SESSION_OPEN, "", opening, "", "Your records:", records].join("\n").replace(/\n{3,}/g, "\n\n").trim();
  let lastDmText = opening;

  for (let k = 1; k <= turns && !record.ended; k++) {
    const said = await show(screen, `player t${k}`);
    if (said === null) break;
    if (await welfare("player", lastDmText, said, `t${k} player`)) break;
    const turn = { k, message: said, words: wordsIn(said).length, kind: null, presses: [], blocked: 0, swallowed: 0, status: null, reply: null, rolls: [], changes: [], place: null, retried: false };
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
    // FIX_S4 run 1 (11c): the clock line the DM reads before this turn (DM-side; never on the player's screen).
    turn.clock = dm.clockLine ? await dm.clockLine().catch(() => null) : null;
    let { input, turn: current } = await submit(said, "game", `dm t${k}`);
    turn.operationId = input?.operationId ?? null;
    const revealed = new Set();
    const seenWithdrawn = new Set();
    const shownKey = (check) => `${check.id}:${check.rollNumber}`;
    let presses = 0, notice = "", shown = "";
    /** A message the screen refuses while the card waits: shown refused with its reason, logged `swallowed` (item 11w). */
    const refuse = (pressed, reason) => {
      turn.presses.push({ text: pressed, button: null, swallowed: true, reason });
      turn.blocked++; turn.swallowed = (turn.swallowed ?? 0) + 1; record.swallowed++;
      notice = `(Nothing was sent: the turn waits for the card — ${reason}.)`;
      return turn.blocked >= MAX_BLOCKED || presses >= MAX_PRESSES;
    };
    for (;;) {
      if (current.status === "failed" && current.canRetry && input && !turn.retried && !meter.closed(key) && !meter.stopped) {
        turn.retried = true;
        log(`${key} t${k}: the DM's turn failed (${current.failure ?? "?"}) — Retry, once`);
        current = await press(input, "retry", null, `dm t${k} retry`);
        continue;
      }
      if (current.status !== "awaiting_confirmation" || record.ended) break;
      // A card waits for the player. Fix S4 run 1 (item 11r): only this pause's cards — a card resolved at an earlier
      // pause is never shown waiting again; a withdrawn one is a line, once; each rerollable card has its own button.
      const live = waitingCards(current);
      const waiting = live.find((check) => check.interactive && !revealed.has(shownKey(check)));
      const rerollable = waiting ? [] : rerollableCards(current);
      const offered = waiting ? [BUTTONS.roll] : [BUTTONS.onward];
      const buttons = [...offered, ...rerollable.map(rerollButton)];
      const rerolls = rerollsNow(current);
      const withdrawn = (current.checks ?? []).filter((check) => check.withdrawn && !seenWithdrawn.has(check.id));
      withdrawn.forEach((check) => seenWithdrawn.add(check.id));
      const told = String(current.told ?? "").trim();
      // The text told so far stays on the screen above the card: a screen shows only what is new on it.
      const fresh = afterShown(told, shown);
      const cardScreen = [notice, fresh,
        ...withdrawn.map((check) => `(The check «${cardTitle(check)}» was withdrawn at the table${check.withdrawn.by === "dm" ? " by the DM" : ""}: no roll counts for it.)`),
        ...live.map((check) => cardText(check, !check.interactive || revealed.has(shownKey(check)), { rerolls })),
        buttonsLine(buttons)].filter(Boolean).join("\n\n");
      notice = "";
      if (fresh && await welfare("dm", said, fresh, `t${k} dm (told before a card)`)) break;
      if (fresh) lastDmText = fresh;
      if (told) shown = told;
      const pressed = await show(cardScreen, `player t${k} card ${++presses}`);
      if (pressed === null) break;
      if (await welfare("player", cardScreen, pressed, `t${k} player (card)`)) break;
      // Fix S4 run 1 (item 11b): «?» goes through while the card waits — an out-of-game turn; the card keeps waiting
      // (the DM may withdraw it), and the screen shows the DM's answer above the card.
      if (isQuestion(pressed)) {
        const question = pressed.trim().replace(/^[\s«"'“]*\?+\s*/, "");
        const { input: asked, turn: answer } = await submit(question, "ooc", `dm t${k} card ooc`);
        const entry = { text: pressed, button: null, question: true, operationId: asked?.operationId ?? null, status: answer.status, reply: null };
        turn.presses.push(entry);
        if (answer.status !== "committed") { entry.failure = answer.failure ?? answer.status; notice = "(The question could not be sent.)"; }
        else {
          entry.reply = String(answer.narration ?? "").trim();
          if (await welfare("dm", pressed, entry.reply, `t${k} dm (out of game, card waiting)`)) break;
          lastDmText = entry.reply;
          notice = `[Out of game] ${entry.reply}`;
          current = (await readTurn(input)) ?? current;
        }
        if (presses >= MAX_PRESSES) { end("stuck", `t${k}: the turn waited on a card through ${presses} messages`); break; }
        continue;
      }
      const button = pressedButton(pressed, offered);
      if (button) turn.presses.push({ text: pressed, button });
      if (button === BUTTONS.roll) { revealed.add(shownKey(waiting)); continue; }
      if (button === BUTTONS.onward) { current = await press(input, "continue", null, `dm t${k} onward`); continue; }
      const reroll = rerollPress(pressed, rerollable, waiting ? [] : live.filter((check) => check.bundledDamage));
      if (reroll?.check) {
        turn.presses.push({ text: pressed, button: BUTTONS.reroll, checkId: reroll.check.id, card: cardTitle(reroll.check) });
        current = await press(input, "reroll", reroll.check.id, `dm t${k} reroll`);
        continue;
      }
      // Anything else is refused on screen, with the reason (the composer is closed for actions while the card waits).
      const reason = reroll?.refused ?? (waiting && rerollPress(pressed, [waiting]) ? "tap the die first: the card shows how it fell before a reroll"
        : "press one of its buttons, or start the message with «?» to ask the DM out of game");
      if (refuse(pressed, reason)) { end("stuck", `t${k}: the turn waited on a card and the player wrote ${turn.blocked} messages without pressing a button`); break; }
    }
    if (record.ended) break;
    turn.status = current.status;
    if (current.status !== "committed") {
      turn.failure = current.failure ?? current.status;
      end("error", `t${k}: the DM's turn ${current.status}${current.failure ? ` (${current.failure})` : ""}${meter.closed(key) ? " after a refusal" : ""}`);
      break;
    }
    turn.reply = String(current.narration ?? "").trim();
    log(`  ${key} t${k} committed`);
    turn.rolls = (current.checks ?? []).map((check) => ({ id: check.id, actor: check.actorName, kind: check.kind, reason: check.reason ?? null, total: check.total, dc: check.dc, success: check.success,
      natural: check.natural ?? null, rollNumber: check.rollNumber, interactive: check.interactive, revealedByPlayer: revealed.has(`${check.id}:${check.rollNumber}`) }));
    turn.changes = (current.changes ?? []).map((c) => ({ tool: c.tool, summary: c.summary }));
    turn.stats = current.stats ? { effort: current.stats.effort ?? null, depthReason: current.stats.depthReason ?? null, requests: current.stats.requests ?? null,
      latencyMs: current.stats.latencyMs ?? null, costUsd: current.stats.costUsd ?? null, unrecorded: current.stats.unrecorded?.length ?? 0 } : null;
    turn.ledgerMisses = current.stats?.unrecorded?.length ?? 0;
    const rest = afterShown(turn.reply, shown);
    if (await welfare("dm", said, rest || turn.reply, `t${k} dm`)) break;
    lastDmText = rest || turn.reply;
    view = await dm.readView();
    const place = dm.views.currentPlace(view.snapshot);
    turn.place = place ? { id: place.id, name: place.name } : null;
    const nextVitals = vitalsText(view.snapshot, view.play, dm.views);
    const chips = changesText(current);
    const status = [place ? `Place: ${place.name}` : "", Number.isFinite(view.play?.worldMinutes) ? `Time: ${dm.views.worldClock(view.play.worldMinutes, "en", view.play.restRecords)}` : ""].filter(Boolean).join(" · ");
    // FIX_S4 11t: per turn only what changed in the records (the full records stand at the start, as the panel does).
    const changed = vitalsChanged(vitals, nextVitals);
    screen = [rest, chips, changed ? `Your records, changed:\n${changed}` : "", status].filter(Boolean).join("\n\n");
    vitals = nextVitals;
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
