// Game party 1: one table — three seats at the app's own table (docs/stages/GAME_PARTY_1.md). The harness only relays:
//   - Seats and turn order. A round is each seated player's one message, in seat order (in a fight, in the fight's own
//     order), then one DM turn for the scene: the app's composer gets the round as one message, one paragraph per
//     character, each starting with the character's name (the DM's table note says so). When the characters are apart,
//     each scene is its own message and its own DM turn, interleaved by rounds.
//   - One screen per player. No player reads the DM's narration as written: the DM's relay (relay.mjs) writes each
//     character's screen from it, and only for the characters in that scene; an out-of-game answer goes to the asker only.
//     The records panel is the player's own character's; the journal is the table's, shown to each player for the
//     scenes their character was in.
//   - Cards per player. A roll card is shown to the player of the character it names and pressed by that player only;
//     «?» goes through while a card waits (11b); a press with text is a press (11w′); prose at a card goes to the DM as
//     that player's proposal and never counts toward «stuck» (11w″); a press when no card of the player's waits is
//     refused on screen and does not count toward «stuck» (11w). With several cards at one pause, each card's player
//     taps its die, then says [Onward] or rerolls their own card; the turn goes on when every card is settled.
//   - Talk at the table: what a character says aloud reaches the others only through the DM's narration and relay.
//   - Doors: [END] anywhere in a message leaves the table — the character walks out of the scene (the DM is told in the
//     next scene message) and the others play on. A table with no one left ends.
//   - Welfare, ask-don't-cut: the blind check on every player message; on a flag, one line on that player's next screen
//     (WELFARE_LINE) and the player's next message decides. Nothing is cut, nothing extended.
//   - After the last round, each player is told the session is over and asked the three after-questions in turn (an
//     [END] in an answer is the door: the rest are not asked); recorded, never relayed.
// Every paid call is metered: the DM's turns and relays in the table's context (a refusal there closes the table), each
// player's calls in its seat's context (a refusal closes that seat only), the checks in their own.
import { BUTTONS, afterShown, cardText, cardTitle, cardWaitsLine, buttonsLine, isProse, openingText, outOfGame, pressWithText, pressedButton, rerollButton, rerollPress } from "../game-player-1/screen.mjs";
import { isQuestion } from "../game-player-1/frozen.mjs";
import { paidCall } from "../game-player-1/session.mjs";
import { playerCall, judgeCall } from "../game-player-1/players.mjs";
import { checkMessage } from "../game-player-1/welfare.mjs";
import { wordsIn } from "../game-player-1/measures.mjs";
import { rerollableCards, waitingCards } from "../../src/lib/gameplay/card-state.ts";
import { rerollsLeft } from "../../src/lib/gameplay/reroll-allowance.ts";
import { AFTER_QUESTIONS, ROUNDS, SESSION_OPEN, SESSION_OVER, WELFARE_LINE, isEnd, withoutEnd } from "./frozen.mjs";
import { CHARACTERS } from "./sheets.mjs";
import { mergeGroups, relay, roundGroups } from "./relay.mjs";
import { journalLines, recordsOf, vitalsOf } from "./screen.mjs";

const MAX_QUESTIONS = 3;   // «?» per player per round before the round goes on without them
const MAX_STRAY = 2;       // presses with no card of theirs, per player per round
const MAX_BLOCKED = 3;     // refused messages at one card (game player 1's «stuck»)
const MAX_PRESSES = 12;    // messages at one card
const realSleep = (ms) => new Promise((done) => setTimeout(done, ms));
const stripQ = (text) => String(text ?? "").trim().replace(/^[\s«"'“]*\?+\s*/, "");

/** What the DM's composer receives for one character's round. */
export function roundParagraph(character, decl) {
  if (decl.kind === "action") return `${character.name}: ${decl.text.trim()}`;
  if (decl.kind === "end") return `${character.name}: ${decl.text ? `${decl.text.trim()}\n\n` : ""}(${character.short}'s player has left the table: ${character.short} walks out of the scene and is not played again.)`;
  if (decl.kind === "gone") return `${character.name}: (${character.short}'s player has left the table: ${character.short} walks out of the scene and is not played again.)`;
  return `${character.name}: (${character.short}'s player wrote nothing this round.)`;
}
/** The first line of a scene's message to the DM (the app frames it as the player's line). */
export const roundHeader = (r, elsewhere = []) => (elsewhere.length
  ? `(Round ${r} — one paragraph per character in this scene. ${elsewhere.join(" and ")} ${elsewhere.length > 1 ? "are" : "is"} elsewhere this round, in a scene of their own that comes to you as its own message: do not narrate ${elsewhere.length > 1 ? "them" : "that character"} here.)`
  : `(Round ${r} — one paragraph per character in this scene.)`);
/** In-character prose at a roll card (11w″), as the DM receives it at this table: whose card, whose words. */
export function proseAtCardFor(character, text, press = null) {
  const how = press ? `together with a press of [${press}], which follows your answer` : "instead of pressing one of its buttons; the card still waits";
  return `(At ${character.short}'s roll card, ${character.short}'s player wrote this in character, ${how}. It is the player's narration — a proposal, not the world's fact: what it says of the die, of what is found, or of what other people say or do is the player's suggestion and yours to decide.)\n\n${character.name}: ${String(text ?? "").trim()}`;
}
/** An out-of-game question as the DM receives it at this table (only the asker reads the answer). */
export const oocFor = (character, text) => `(${character.short}'s player asks, out of game — only ${character.short}'s player reads your answer.) ${stripQ(text)}`;

/**
 * Plays one table. `seats`: [{ seat, characterId, player }] (player: a ROSTER entry); `dm`: game player 1's bindTable;
 * `systemOf(characterId)`: the player's system prompt; `private`: { layerText } (the DM-only text, for the leak check —
 * never written to the record). Returns the table record.
 */
export async function runTable({ key, arm, triad, seats: seating, dm, meter, keys, rounds = ROUNDS, log = () => {}, sleep = realSleep, systemOf, privateText = "", onProgress = async () => {} }) {
  const record = { key, arm, triad, startedAt: new Date().toISOString(), plannedRounds: rounds, rounds: [], opening: null, ended: null, errors: [], welfare: [],
    seats: [], counts: { strayPresses: 0, swallowed: 0, proseAtCard: 0, questions: 0, autoCards: 0, relayFallbacks: 0 } };
  const view = () => dm.readView();
  const names = () => seats.filter((s) => s.active).map((s) => s.character.name);
  const seats = seating.map(({ seat, characterId, player }) => {
    const character = CHARACTERS.find((c) => c.id === characterId);
    const s = { seat, character, player, entityId: null, system: systemOf(characterId), messages: [], pending: [], active: true, left: null, askWelfare: false,
      vitals: "", journal: new Set(), shownJournal: new Set(), place: null,
      rec: { seat, character: character.name, characterId, player: player.name, model: player.model, screens: [], messages: [], left: null, after: [], words: 0, private: [] } };
    record.seats.push(s.rec);
    return s;
  });
  const byName = (name) => seats.find((s) => s.character.name === name) ?? null;
  const seatContext = (s) => `${key}/${s.character.short}`;
  const end = (reason, detail = null) => { record.ended ??= { reason, round: record.rounds.length, detail }; };

  // ---- the paid calls ----------------------------------------------------------------------------------------------
  const checkAsk = ({ model, system, user, maxTokens, effort, purpose }) => paidCall({ meter, session: `${key}/check`, purpose, sleep, log,
    call: () => judgeCall({ model, system, user, maxTokens, effort, keys, fetcher: meter.fetch }) });
  const dmAsk = ({ model, system, user, maxTokens, effort, purpose }) => paidCall({ meter, session: key, purpose, sleep, log,
    call: () => judgeCall({ model, system, user, maxTokens, effort, keys, fetcher: meter.fetch }) });
  const failed = (error) => { record.errors.push({ error: String(error?.message ?? error).slice(0, 300), code: error?.code ?? null }); return { status: "failed", failure: `exception: ${String(error?.code ?? error?.message ?? error).slice(0, 80)}`, canRetry: false, checks: [] }; };
  const submit = async (text, mode, purpose) => { try { return await meter.within({ session: key, purpose }, () => dm.submit(text, mode)); } catch (error) { return { input: null, turn: failed(error) }; } };
  const press = async (input, action, checkId, purpose) => { try { return await meter.within({ session: key, purpose }, () => dm.press(input, action, checkId)); } catch (error) { return failed(error); } };
  const readTurn = async (input) => { try { return await dm.readTurn(input); } catch { return null; } };
  const dmClosed = () => meter.stopped || meter.closed(key);

  /** A seat leaves the table (its door, a refusal, an error, a stop). */
  const leave = (s, why, detail = null) => {
    if (!s.active) return;
    s.active = false; s.left = why;
    s.rec.left = { why, round: record.rounds.length, detail };
    log(`  ${key}: ${s.character.short} left the table (${why}${detail ? `: ${String(detail).slice(0, 80)}` : ""})`);
  };

  /** Shows a screen to a seat and reads its message; null when the seat is out. */
  const ask = async (s, screen, purpose) => {
    s.rec.screens.push({ purpose, text: screen, round: record.rounds.length });
    s.messages.push({ role: "user", content: screen });
    const said = await paidCall({ meter, session: seatContext(s), purpose, sleep, log, call: () => playerCall({ player: s.player, system: s.system, messages: s.messages, keys, fetcher: meter.fetch }) });
    if (said.notSent) { if (meter.stopped) end("stopped", meter.stopped); leave(s, meter.stopped ? "stopped" : "closed", said.error); return null; }
    if (said.stopReason === "refusal") { leave(s, "refusal", `${purpose}: ${said.refusalCategory ?? "refusal"}`); return null; }
    if (said.error) { record.errors.push({ seat: s.character.short, purpose, error: said.error }); leave(s, "error", `${purpose}: ${String(said.error).slice(0, 160)}`); return null; }
    const text = String(said.text ?? "");
    s.messages.push({ role: "assistant", content: text.trim() || "[empty message]" });
    s.rec.messages.push({ purpose, text, round: record.rounds.length, requestId: said.requestId ?? null, stopReason: said.stopReason ?? null, servedModel: said.servedModel ?? null,
      // DeepSeek's provider reasoning field, stored as it came — never relayed to anyone.
      ...(said.providerReasoning ? { providerReasoning: said.providerReasoning, notRelayed: true } : {}) });
    if (!/^after/.test(purpose)) s.rec.words += wordsIn(text).length;
    return text;
  };
  /** The blind check of a player message; a flag puts the welfare line on that player's next screen. False when the run stopped. */
  const welfare = async (s, previous, message, what) => {
    const verdict = await checkMessage({ ask: checkAsk, previous, message, what: `${key} ${s.character.short} ${what}` });
    record.welfare.push({ seat: s.character.short, what, verdict });
    if (!verdict) { end("stopped", meter.stopped ?? "the check could not be sent"); return false; }
    if (verdict.distress) { s.askWelfare = true; log(`WELFARE FLAG: ${key} ${s.character.short} ${what} — the line goes on the next screen`); }
    return true;
  };

  // ---- what a seat reads -------------------------------------------------------------------------------------------
  let snapshot = null, play = null;
  const refresh = async () => { const v = await view(); snapshot = v.snapshot; play = v.play; return v; };
  const clock = () => (Number.isFinite(play?.worldMinutes) ? dm.views.worldClock(play.worldMinutes, "en", play.restRecords) : null);
  /** The pending lines, the records that changed, the journal seen, where and when — and the welfare line on a flag. */
  const compose = (s, { status: withStatus = true } = {}) => {
    const parts = s.pending.splice(0);
    const vitals = vitalsOf(snapshot, dm.views, s.entityId);
    const changed = vitalsChangedLines(s.vitals, vitals);
    if (changed) parts.push(`Your records, changed:\n${changed}`);
    s.vitals = vitals;
    const fresh = [...s.journal].filter((line) => !s.shownJournal.has(line));
    if (fresh.length) { parts.push(`Your journal, new:\n${fresh.map((l) => `+ ${l}`).join("\n")}`); fresh.forEach((l) => s.shownJournal.add(l)); }
    const status = withStatus ? [s.place ? `Where you are: ${s.place}` : "", clock() ? `Time: ${clock()}` : ""].filter(Boolean).join(" · ") : "";
    if (status) parts.push(status);
    if (s.askWelfare) { parts.push(WELFARE_LINE); s.askWelfare = false; }
    return parts.filter(Boolean).join("\n\n").trim() || (withStatus ? "(Nothing new reaches you.)" : "");
  };

  // ---- the opening -------------------------------------------------------------------------------------------------
  await refresh();
  const ids = Object.fromEntries((snapshot.entities ?? []).filter((e) => e.kind === "player" || e.kind === "companion").map((e) => [e.name, e.id]));
  for (const s of seats) {
    s.entityId = ids[s.character.name] ?? null;
    if (!s.entityId) throw new Error(`${key}: ${s.character.name} is not on record`);
    s.vitals = vitalsOf(snapshot, dm.views, s.entityId);
  }
  let groups = [names()];
  let journalBefore = journalLines(snapshot, dm.views);
  const opening = openingText(snapshot);
  const openRelay = await relay({ ask: dmAsk, names: names(), scene: names(), forNames: names(), narration: opening, opening: true, purpose: "relay opening" });
  record.opening = { narration: opening, relay: relayRecord(openRelay) };
  if (openRelay.notSent || openRelay.refusal) { end(openRelay.refusal ? "refusal" : "stopped", `the opening's relay: ${openRelay.error}`); return finish(); }
  if (openRelay.fallback) record.counts.relayFallbacks++;
  groups = mergeGroups(groups, openRelay.together, names());
  for (const s of seats) {
    s.place = openRelay.places[s.character.name] ?? null;
    s.pending.push(SESSION_OPEN, openRelay.screens[s.character.name] || "(Nothing reaches you yet.)", `Your records:\n${recordsOf(snapshot, play, dm.views, s.entityId)}`);
    for (const line of journalBefore) { s.journal.add(line); }
  }

  // ---- the rounds --------------------------------------------------------------------------------------------------
  for (let r = 1; r <= rounds && !record.ended; r++) {
    if (!seats.some((s) => s.active)) { end("empty", "every player has left the table"); break; }
    const round = { n: r, scenes: [] };
    record.rounds.push(round);
    groups = mergeGroups(groups, [], names());
    // Who is with whom after this round: every scene's relay says (a character may join another scene's group).
    const relayedThisRound = [];
    for (const members of groups.map((g) => [...g])) {
      if (record.ended) break;
      const sceneSeats = orderOf(members.map(byName).filter((s) => s?.active), play);
      if (!sceneSeats.length) continue;
      const scene = { members: sceneSeats.map((s) => s.character.name), order: sceneSeats.map((s) => s.character.short), messages: [], questions: [], strays: [], cards: [], status: null };
      round.scenes.push(scene);
      // Each seat's message, in order.
      const decls = [];
      for (const s of sceneSeats) {
        const decl = await declare(s, r, scene);
        if (record.ended) break;
        decls.push({ s, decl });
        scene.messages.push({ name: s.character.name, kind: decl.kind, text: decl.text ?? "" });
      }
      if (record.ended) break;
      const said = decls.filter(({ decl }) => decl.kind !== "absent");
      if (!said.length) continue;
      scene.input = [roundHeader(r, names().filter((n) => !scene.members.includes(n))), ...said.map(({ s, decl }) => roundParagraph(s.character, decl))].join("\n\n");
      // The DM's turn for the scene.
      const committed = await playTurn(scene, r);
      if (!committed) break;
      // The screens: only for the characters still at the table who are in this scene.
      await refresh();
      // Every character's hit points at the end of the scene, from the records (Q7 reads «below half» from them).
      scene.hp = Object.fromEntries(seats.map((s) => { const e = snapshot.entities.find((x) => x.id === s.entityId); return [s.character.name, [e?.hp ?? null, e?.max_hp ?? null]]; }));
      const readers = sceneSeats.filter((s) => s.active).map((s) => s.character.name);
      if (readers.length) {
        const already = Object.fromEntries(Object.entries(scene.shownTold ?? {}).filter(([n]) => readers.includes(n)));
        const relayed = await relay({ ask: dmAsk, names: names(), scene: scene.members.filter((n) => byName(n)?.active), forNames: readers,
          messages: said.map(({ s, decl }) => ({ name: s.character.name, text: decl.kind === "action" ? decl.text : roundParagraph(s.character, decl).slice(s.character.name.length + 2) })),
          narration: scene.narration, already, purpose: `relay r${r}` });
        scene.relay = relayRecord(relayed);
        if (relayed.notSent || relayed.refusal) { end(relayed.refusal ? "refusal" : "stopped", `the relay of round ${r}: ${relayed.error}`); break; }
        if (relayed.fallback) record.counts.relayFallbacks++;
        for (const n of readers) {
          const s = byName(n);
          // A card's player already read the narration up to the card: only what follows it (the relay is asked so; this
          // guards a reply that repeats it).
          const screen = already[n] ? afterShown(relayed.screens[n], already[n]) : relayed.screens[n];
          if (screen) s.pending.push(screen);
          if (relayed.places[n]) s.place = relayed.places[n];
        }
        relayedThisRound.push(relayed.together);
      }
      // The journal, per player: what changed in this scene goes to its characters.
      const journalNow = journalLines(snapshot, dm.views);
      const newLines = journalNow.filter((l) => !journalBefore.includes(l));
      for (const s of sceneSeats) newLines.forEach((l) => s.journal.add(l));
      journalBefore = journalNow;
      scene.journal = newLines;
    }
    groups = roundGroups(groups, relayedThisRound, names());
    round.groups = groups.map((g) => [...g]);
    await onProgress(record);
    if (!seats.some((s) => s.active) && !record.ended) end("empty", "every player has left the table");
  }
  if (!record.ended) end("rounds");
  return finish();

  // ---- one seat's message for the round ------------------------------------------------------------------------------
  async function declare(s, r, scene) {
    let questions = 0, strays = 0;
    for (;;) {
      const screen = compose(s);
      const said = await ask(s, screen, `player r${r}`);
      if (said === null) return { kind: s.left === "stopped" ? "absent" : "gone" };
      if (!(await welfare(s, screen, said, `r${r}`))) return { kind: "absent" };
      if (isEnd(said)) { leave(s, "door", said.slice(0, 200)); return { kind: "end", text: withoutEnd(said) }; }
      if (!said.trim()) return { kind: "empty" };
      if (isQuestion(said)) {
        questions++; record.counts.questions++;
        const { turn: answer } = await submit(oocFor(s.character, said), "ooc", `dm r${r} ooc ${s.character.short}`);
        const entry = { name: s.character.name, text: said, status: answer.status, reply: answer.status === "committed" ? String(answer.narration ?? "").trim() : null };
        scene.questions.push(entry);
        if (entry.reply) { s.pending.push(`[Out of game] ${entry.reply}`); s.rec.private.push({ round: r, text: entry.reply }); }
        else s.pending.push("(The question could not be sent.)");
        if (dmClosed()) { end(meter.stopped ? "stopped" : "refusal", "the DM's out-of-game answer"); return { kind: "absent" }; }
        if (questions >= MAX_QUESTIONS) return { kind: "empty", why: "questions" };
        continue;
      }
      // A press with no card of theirs waiting: refused on screen, never «stuck» (11w); text beside it is the message.
      const both = pressWithText(said, [BUTTONS.roll, BUTTONS.onward, BUTTONS.reroll]);
      if (both) { scene.strays.push({ name: s.character.name, text: said, press: both.press, kept: both.rest }); record.counts.strayPresses++; return { kind: "action", text: both.rest, strayPress: both.press }; }
      if (pressedButton(said, Object.values(BUTTONS)) || rerollPress(said, [{ reason: "card" }])) {
        strays++; record.counts.strayPresses++;
        scene.strays.push({ name: s.character.name, text: said, refused: true });
        s.pending.push("(Nothing was pressed: no card of yours waits now. Write what your character does, or start with «?» to ask the game master out of game.)");
        if (strays >= MAX_STRAY) return { kind: "empty", why: "strays" };
        continue;
      }
      return { kind: "action", text: said };
    }
  }

  // ---- one DM turn, with its cards ---------------------------------------------------------------------------------------
  async function playTurn(scene, r) {
    scene.clock = dm.clockLine ? await dm.clockLine().catch(() => null) : null;
    let { input, turn: current } = await submit(scene.input, "game", `dm r${r}`);
    scene.operationId = input?.operationId ?? null;
    const key2 = (c) => `${c.id}:${c.rollNumber}`;
    const revealed = new Set(), settled = new Set();
    scene.shownTold = {};
    let retried = false;
    const ownerOf = (check) => seats.find((s) => s.entityId === check.actorId) ?? byName(check.actorName) ?? null;
    for (;;) {
      if (current.status === "failed" && current.canRetry && input && !retried && !dmClosed()) {
        retried = true; log(`${key} r${r}: the DM's turn failed (${current.failure ?? "?"}) — Retry, once`);
        current = await press(input, "retry", null, `dm r${r} retry`); continue;
      }
      if (current.status !== "awaiting_confirmation" || record.ended) break;
      const live = waitingCards(current);
      const next = live.find((c) => c.interactive && !revealed.has(key2(c)));
      const undecided = next ? null : live.find((c) => c.interactive && revealed.has(key2(c)) && !settled.has(key2(c)));
      const card = next ?? undecided;
      if (!card) { settled.clear(); current = await press(input, "continue", null, `dm r${r} onward`); continue; }
      const owner = ownerOf(card);
      if (!owner || !owner.active) {
        // A card of a character whose player has left: the die is tapped and the card settled, marked — never the player's.
        record.counts.autoCards++;
        scene.cards.push({ id: card.id, actor: card.actorName, title: cardTitle(card), auto: owner ? `${owner.character.short}'s player has left the table` : "no player's character" });
        if (next) revealed.add(key2(card)); else settled.add(key2(card));
        continue;
      }
      const outcome = await cardAsk(owner, scene, r, input, current, card, next ? "roll" : "decide", { revealed, key2 });
      if (outcome.stop) return false;
      current = outcome.current ?? current;
      if (outcome.revealed) revealed.add(key2(card));
      if (outcome.settled) live.filter((c) => c.interactive && ownerOf(c) === owner && revealed.has(key2(c))).forEach((c) => settled.add(key2(c)));
    }
    if (record.ended) return false;
    scene.status = current.status;
    if (current.status !== "committed") { scene.failure = current.failure ?? current.status; end(dmClosed() && !meter.stopped ? "refusal" : "error", `r${r}: the DM's turn ${current.status}${current.failure ? ` (${current.failure})` : ""}`); return false; }
    scene.narration = String(current.narration ?? "").trim();
    scene.rolls = (current.checks ?? []).map((c) => ({ id: c.id, actor: c.actorName, kind: c.kind, reason: c.reason ?? null, total: c.total, dc: c.dc, success: c.success, natural: c.natural ?? null, rollNumber: c.rollNumber, interactive: c.interactive }));
    scene.changes = (current.changes ?? []).map((c) => ({ tool: c.tool, summary: c.summary }));
    scene.stats = current.stats ? { effort: current.stats.effort ?? null, requests: current.stats.requests ?? null, latencyMs: current.stats.latencyMs ?? null, costUsd: current.stats.costUsd ?? null, unrecorded: current.stats.unrecorded?.length ?? 0 } : null;
    log(`  ${key} r${r} [${scene.order.join(", ")}] committed`);
    return true;
  }

  /** One card, shown to its own player until it is pressed (phase «roll»: tap the die; «decide»: Onward or a reroll). */
  async function cardAsk(s, scene, r, input, current, card, phase, { revealed, key2 }) {
    const entry = { id: card.id, actor: card.actorName, owner: s.character.name, title: cardTitle(card), phase, presses: [] };
    scene.cards.push(entry);
    let notice = "", waitsAgain = false, blocked = 0, presses = 0;
    /** The DM's answer to text at the card (a «?» or the player's prose), shown above the card. */
    const answerAtCard = async (question, purpose, p) => {
      const { turn: answer } = await submit(question, "ooc", purpose);
      p.status = answer.status;
      p.reply = answer.status === "committed" ? String(answer.narration ?? "").trim() : null;
      entry.presses.push(p);
      if (p.reply) { s.rec.private.push({ round: r, text: p.reply }); notice = `[Out of game] ${p.reply}`; current = (await readTurn(input)) ?? current; }
      else notice = "(The text could not be sent.)";
      if (dmClosed()) { end(meter.stopped ? "stopped" : "refusal", "the DM's answer at a card"); return false; }
      return true;
    };
    for (;;) {
      // The narration so far, as this character perceives it (the relay, for this player only).
      const told = String(current.told ?? "").trim();
      let toldText = "";
      if (told && told !== scene.lastTold?.[s.character.name]) {
        const relayed = await relay({ ask: dmAsk, names: names(), scene: scene.members.filter((n) => byName(n)?.active), forNames: [s.character.name], messages: scene.messages.map((m) => ({ name: m.name, text: m.text })),
          narration: told, already: scene.shownTold[s.character.name] ? { [s.character.name]: scene.shownTold[s.character.name] } : {}, purpose: `relay r${r} card` });
        entry.relays = [...(entry.relays ?? []), relayRecord(relayed)];
        if (relayed.notSent || relayed.refusal) { end(relayed.refusal ? "refusal" : "stopped", `a card's relay in round ${r}: ${relayed.error}`); return { stop: true }; }
        if (relayed.fallback) record.counts.relayFallbacks++;
        toldText = relayed.screens[s.character.name] ?? "";
        if (toldText) s.rec.private.push({ round: r, text: toldText });
        scene.lastTold = { ...(scene.lastTold ?? {}), [s.character.name]: told };
        scene.shownTold[s.character.name] = [scene.shownTold[s.character.name], toldText].filter(Boolean).join("\n\n");
      }
      const rerollable = phase === "decide" ? rerollableCards(current).filter((c) => c.actorId === s.entityId) : [];
      const offered = phase === "roll" ? [BUTTONS.roll] : [BUTTONS.onward];
      const buttons = [...offered, ...rerollable.map(rerollButton)];
      const shown = phase === "decide" || revealed.has(key2(card));
      const lead = compose(s, { status: false });
      const cardScreen = [lead, notice, toldText,
        `(A roll card for ${s.character.name}, your character. Only you press it.)`,
        cardText(card, shown, { rerolls: rerollsNow(current) }),
        waitsAgain ? cardWaitsLine(buttons) : "", buttonsLine(buttons)].filter(Boolean).join("\n\n");
      notice = ""; waitsAgain = false;
      const said = await ask(s, cardScreen, `player r${r} card ${++presses}`);
      if (said === null) {
        // The player is out: the card is settled for them, marked.
        record.counts.autoCards++; entry.auto = `${s.character.short}'s player is out (${s.left})`;
        return meter.stopped ? { stop: true } : { revealed: true, settled: true };
      }
      if (!(await welfare(s, cardScreen, said, `r${r} card`))) return { stop: true };
      if (isEnd(said)) {
        leave(s, "door", said.slice(0, 200)); entry.presses.push({ text: said, door: true });
        record.counts.autoCards++; entry.auto = `${s.character.short}'s player left the table at the card`;
        return { revealed: true, settled: true };
      }
      // 11w′: a press with text in the same message is a press; the text goes first (out of game, or as prose).
      const both = pressWithText(said, [...buttons, ...(rerollable.length ? [BUTTONS.reroll] : [])]);
      if (both) {
        const prose = !outOfGame(both.rest);
        if (prose) record.counts.proseAtCard++; else record.counts.questions++;
        if (!(await answerAtCard(prose ? proseAtCardFor(s.character, both.rest, both.press) : oocFor(s.character, both.rest), `dm r${r} card ${prose ? "prose" : "ooc"} (with a press)`,
          { text: both.rest, withPress: both.press, ...(prose ? { prose: true } : { question: true }) }))) return { stop: true };
        if (!waitingCards(current).some((c) => c.id === card.id)) return { current };
        const applied = await applyPress(both.press, `[${both.press}]`);
        return applied ?? { current };
      }
      // 11b: «?» goes through while the card waits; the card keeps waiting (the DM may withdraw it).
      if (isQuestion(said)) {
        record.counts.questions++;
        if (!(await answerAtCard(oocFor(s.character, said), `dm r${r} card ooc`, { text: said, question: true }))) return { stop: true };
        if (!waitingCards(current).some((c) => c.id === card.id)) return { current };
        if (presses >= MAX_PRESSES) { end("stuck", `r${r}: ${s.character.short}'s card waited through ${presses} messages`); return { stop: true }; }
        continue;
      }
      const applied = await applyPress(pressedButton(said, offered), said);
      if (applied) return applied;
      // 11w″: prose at a card goes to the DM as this player's proposal; the card is shown again with one line.
      if (isProse(said)) {
        record.counts.proseAtCard++;
        if (!(await answerAtCard(proseAtCardFor(s.character, said), `dm r${r} card prose`, { text: said, prose: true }))) return { stop: true };
        waitsAgain = true;
        if (!waitingCards(current).some((c) => c.id === card.id)) return { current };
        if (presses >= MAX_PRESSES) { end("stuck", `r${r}: ${s.character.short}'s card waited through ${presses} messages`); return { stop: true }; }
        continue;
      }
      // Anything else is refused on screen with its reason (game player 1's «stuck» after three).
      const reroll = phase === "decide" ? rerollPress(said, rerollable) : null;
      const reason = reroll?.refused ?? (phase === "roll" && rerollPress(said, [card]) ? "tap the die first: the card shows how it fell before a reroll"
        : "press one of its buttons, or start the message with «?» to ask the game master out of game");
      entry.presses.push({ text: said, swallowed: true, reason }); record.counts.swallowed++;
      notice = `(Nothing was sent: the card waits — ${reason}.)`;
      if (++blocked >= MAX_BLOCKED || presses >= MAX_PRESSES) { end("stuck", `r${r}: ${s.character.short} wrote ${blocked} messages at the card without pressing it`); return { stop: true }; }
    }

    /** A press of this card's buttons, or a reroll of the player's own card; null when the message is neither. */
    async function applyPress(button, text) {
      if (button === BUTTONS.roll && phase === "roll") { entry.presses.push({ text, button }); return { revealed: true, current }; }
      if (button === BUTTONS.onward && phase === "decide") { entry.presses.push({ text, button }); return { settled: true, current }; }
      const rerollable = phase === "decide" ? rerollableCards(current).filter((c) => c.actorId === s.entityId) : [];
      const reroll = phase === "decide" ? rerollPress(text, rerollable) : null;
      if (reroll?.check) {
        entry.presses.push({ text, button: BUTTONS.reroll, checkId: reroll.check.id });
        return { current: await press(input, "reroll", reroll.check.id, `dm r${r} reroll`) };
      }
      return null;
    }
  }

  /** The rerolls the session still allows, the server's own count as the card shows it (null: unlimited). */
  function rerollsNow(current) {
    const values = snapshot?.settings?.values;
    if (!values?.difficulty) return undefined;
    const turns = [...(play?.turns ?? []).filter((row) => row.id !== current.id), current];
    return rerollsLeft(values, turns, snapshot.publicState?.current_session_id ?? null);
  }

  // ---- after the last round ------------------------------------------------------------------------------------------
  async function finish() {
    record.finishedAt = new Date().toISOString();
    // No after-questions when the run stopped, or the table closed on the DM's refusal (game player 1's rule).
    if (meter.stopped || record.ended?.reason === "refusal") { for (const s of seats) s.rec.after.push({ asked: false, why: `the table ended by ${record.ended?.reason}` }); return withLeaks(); }
    for (const s of seats) {
      if (["refusal", "stopped", "closed"].includes(s.left) || meter.closed(seatContext(s))) { s.rec.after.push({ asked: false, why: `the seat ended by ${s.left ?? "a refusal"}` }); continue; }
      if (snapshot) { const lead = s.left === "door" ? [] : [compose(s)]; s.pending.length = 0; s.leadIn = lead.filter((x) => x && x !== "(Nothing new reaches you.)"); }
      for (let i = 0; i < AFTER_QUESTIONS.length; i++) {
        const q = AFTER_QUESTIONS[i];
        const screen = i === 0 ? [...(s.leadIn ?? []), SESSION_OVER, q].join("\n\n") : q;
        const answer = await ask(s, screen, `after ${i + 1}`);
        if (answer === null) { s.rec.after.push({ question: q, asked: true, text: null, why: s.left }); break; }
        s.rec.after.push({ question: q, asked: true, text: answer });
        if (!(await welfare(s, q, answer, `after ${i + 1}`))) break;
        if (isEnd(answer)) { s.rec.after.push({ asked: false, why: "the door: [END] in the answer" }); break; }
      }
      if (meter.stopped) break;
    }
    return withLeaks();
  }
  function withLeaks() {
    record.leaks = leakCheck(record, privateText);
    record.counts.words = Object.fromEntries(record.seats.map((r) => [r.character, r.words]));
    return record;
  }
}

/** The relay's part of the record (its request is kept: it is what the DM was asked, public text only). */
const relayRecord = (r) => ({ screens: r.screens ?? null, together: r.together ?? null, places: r.places ?? null, missing: r.missing ?? [], extra: r.extra ?? [], attempts: r.attempts ?? 0,
  fallback: Boolean(r.fallback), error: r.error ?? null, refusal: Boolean(r.refusal), notSent: Boolean(r.notSent), request: r.request?.user ?? null });

/** The scene's seats in order: seat order; in a fight, the fight's own order (its participants' turn order). */
export function orderOf(sceneSeats, play) {
  const active = (play?.encounters ?? []).find((e) => e.status === "active");
  if (!active) return [...sceneSeats].sort((a, b) => a.seat - b.seat);
  const order = new Map((play.participants ?? []).filter((p) => p.encounter_id === active.id && p.entity_id).map((p) => [p.entity_id, p.turn_order]));
  return [...sceneSeats].sort((a, b) => (order.get(a.entityId) ?? 99) - (order.get(b.entityId) ?? 99) || a.seat - b.seat);
}

/** The lines of the records that changed (game player 1's 11t rule): a list line as what came and went. */
export function vitalsChangedLines(before, after) {
  const parse = (text) => new Map(String(text ?? "").split("\n").filter(Boolean).map((line) => { const at = line.indexOf(": "); return at > 0 ? [line.slice(0, at), line.slice(at + 2)] : [line, ""]; }));
  const was = parse(before), now = parse(after);
  const out = [];
  for (const [label, value] of now) {
    const old = was.get(label);
    if (old === value) continue;
    const list = (t) => String(t ?? "").split("; ").filter(Boolean);
    if (old !== undefined && ["Carried", "Counters", "Money"].includes(label)) {
      const gone = list(old).filter((x) => !list(value).includes(x)), came = list(value).filter((x) => !list(old).includes(x));
      out.push(`${label}: ${[...came.map((x) => `+ ${x}`), ...gone.map((x) => `− ${x}`)].join("; ")}`);
    } else out.push(value ? `${label}: ${value}` : label);
  }
  for (const label of was.keys()) if (!now.has(label)) out.push(`${label}: —`);
  return out.join("\n");
}

// ---- Q0: no private screen leaked (by the record) -----------------------------------------------------------------------

const SHINGLE = 8;
const shingles = (text) => {
  const words = String(text ?? "").toLowerCase().replace(/[’‘]/g, "'").split(/[^\p{L}\p{N}']+/u).filter(Boolean);
  const out = new Set();
  for (let i = 0; i + SHINGLE <= words.length; i++) out.add(words.slice(i, i + SHINGLE).join(" "));
  return out;
};
/**
 * Per seat: its private material — its out-of-game answers, its card screens' relays, and its screens from scenes another
 * seat was not in — against every other seat's screens; and the DM-only layer against every screen. A hit is a run of 8
 * words in common, listed with the screen it was on.
 */
export function leakCheck(record, privateText = "") {
  const hits = [];
  // Each seat's screens with the round they were shown in (the after-questions after the last round).
  const last = record.rounds.length + 1;
  const shownFrom = (rec, round) => shingles(rec.screens.filter((x) => (x.round ?? last) >= round || /^after/.test(x.purpose ?? "")).map((x) => x.text).join("\n"));
  // Screens from scenes each seat was not in.
  const sceneScreens = new Map(record.seats.map((r) => [r.character, []]));
  for (const round of record.rounds) for (const scene of round.scenes) {
    for (const [name, text] of Object.entries(scene.relay?.screens ?? {})) {
      for (const other of record.seats) if (!scene.members.includes(other.character) && text) sceneScreens.get(other.character)?.push({ from: name, text, round: round.n });
    }
  }
  for (const reader of record.seats) {
    for (const owner of record.seats.filter((o) => o !== reader)) {
      for (const item of owner.private ?? []) {
        const shown = shownFrom(reader, item.round ?? 0);
        for (const sh of shingles(item.text)) if (shown.has(sh)) { hits.push({ reader: reader.character, owner: owner.character, kind: "private", round: item.round ?? null, run: sh }); break; }
      }
    }
    for (const item of sceneScreens.get(reader.character) ?? []) {
      const shown = shownFrom(reader, item.round);
      for (const sh of shingles(item.text)) if (shown.has(sh)) { hits.push({ reader: reader.character, owner: item.from, kind: "another scene", round: item.round, run: sh }); break; }
    }
    if (privateText) { const shown = shownFrom(reader, 0); for (const sh of shingles(privateText)) if (shown.has(sh)) { hits.push({ reader: reader.character, owner: "the DM", kind: "frozen layer", run: sh }); break; } }
  }
  return { shingle: SHINGLE, hits, checked: record.seats.length };
}
