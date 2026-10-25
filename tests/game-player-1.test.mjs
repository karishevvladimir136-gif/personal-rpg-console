// Game player 1 (docs/stages/GAME_PLAYER_1.md): the player harness, without a live call. The frozen texts and what the
// player is shown of the campaign files; the end, «?» and button readings; the meter's caps and F2 rules (no retry after
// a refusal, the breaker at 3, a stop on suspension / access / policy, a 429 rate limit waited out, a quota never
// retried into, pictures refused); the welfare check; the session loop on a scripted table (roll cards, the composer
// closed while a card waits, «?», the player's own end, the note and the second question, a welfare stop, a refusal);
// and, in a child process, the whole pipeline on the app's own code with scripted providers.
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  AFTER_QUESTION, NOTE_QUESTION, OPEN_TABLE_LINE, PREREGISTRATION, SESSION_OVER, isEnd, isQuestion, playerFiles, playerSystem,
} from "../scripts/game-player-1/frozen.mjs";
import { createLedger, createMeter, costOf, foldStream } from "../scripts/game-player-1/paid.mjs";
import { checkMessage, CHECK_SYSTEM, DISTRESS_RULE } from "../scripts/game-player-1/welfare.mjs";
import { BUTTONS, afterShown, cardText, pressedButton } from "../scripts/game-player-1/screen.mjs";
import { runSession } from "../scripts/game-player-1/session.mjs";
import { PLAYERS } from "../scripts/game-player-1/players.mjs";
import { scenesOf, sessionNumbers, verdicts } from "../scripts/game-player-1/score.mjs";
import { attemptNames, combineRuns, keysFor, ledgersFor, planOf, supersededKeys } from "../scripts/game-player-1/run.mjs";
import { reportMarkdown, transcriptMarkdown } from "../scripts/game-player-1/report.mjs";
import { doorFetcher } from "../scripts/game-player-1/players.mjs";
import { authorshipNumbers, parseAuthorship, sessionEntries } from "../scripts/game-player-1/authorship.mjs";

const stage = readFileSync(new URL("../docs/stages/GAME_PLAYER_1.md", import.meta.url), "utf8");

test("the player's prompt: one text for all four players; the open table differs by its files and one line", () => {
  const a = playerSystem("A"), b = playerSystem("B");
  assert.match(a, /^You are a player sitting down to a new campaign/);
  assert.match(a, /The game master is an AI model\./);
  assert.match(a, /start your message with «\?»/);
  assert.match(a, /You may end the session whenever you like by saying so\./);
  assert.doesNotMatch(a, /\b(test|probe|evaluate|interesting)\b/i, "no instruction to test, probe, evaluate or be interesting");
  assert.ok(b.includes(OPEN_TABLE_LINE) && !a.includes(OPEN_TABLE_LINE));
  for (const player of Object.values(PLAYERS)) assert.equal(playerSystem("A"), a, `the same prompt for ${player.label}`);
});

test("what the player may read: the README's cut, never the DM-only parts", () => {
  const a = playerFiles("A"), b = playerFiles("B");
  for (const text of [a, b]) {
    assert.match(text, /The Forgotten Realms, D&D 5e rules/);
    assert.match(text, /The Sword Coast — canon/);
    assert.match(text, /Warlock, 5th level; human, 34/);
    assert.match(text, /Spell save DC 16/);
    assert.doesNotMatch(text, /## Mystery and wonder|Behind the visible business of an arc stands a hidden truth/, "03's DM-only section");
    assert.doesNotMatch(text, /What this campaign tests|Loading order|Why this set|A short version if the draft check|«Ведущий» \(DM\) step/, "the planner's notes and the wizard's how-to");
  }
  assert.match(a, /Tymora wants James to bring something back to her/, "Table A: the owner's own wishes");
  assert.match(a, /Envoy of Luck/);
  assert.doesNotMatch(b, /Tymora wants James|Envoy of Luck|Ocean's Eleven/, "Table B: no brief");
  assert.match(b, /Baldur's Gate, no errand/);
  assert.match(b, /no errand from anyone/);
});

test("the pre-registration is the stage's text, byte for byte", () => {
  const block = stage.slice(stage.indexOf("**Pre-registration (write into the report before the first paid call):**"), stage.indexOf("\n\n## What this is not"));
  assert.ok(PREREGISTRATION.startsWith(block), "G9 … G0 as the stage has them");
  const extra = stage.slice(stage.indexOf("Additional pre-registration for Table B"), stage.indexOf("\n\n## The run"));
  assert.ok(PREREGISTRATION.endsWith(extra), "G6–G8 as the stage has them");
  const flat = stage.replace(/\s+/g, " ");
  assert.ok(flat.includes(NOTE_QUESTION) && flat.includes(AFTER_QUESTION), "the two questions are the stage's words");
});

test("the end of a session, «?» and the buttons, as a player would type them", () => {
  for (const text of ["I'd like to end the session here.", "Let's stop here for tonight.", "That's all for today — end session.", "I think I'll stop the game here."]) assert.equal(isEnd(text), true, text);
  for (const text of ["I end the conversation with the sergeant and walk off.", "I leave the tavern.", "I stop and listen.", "? How long until the gate closes?"]) assert.equal(isEnd(text) && !isQuestion(text), false, text);
  assert.equal(isQuestion("? Is the cat a familiar?"), true);
  assert.equal(isQuestion("  «?» can I see the map"), true);
  assert.equal(isQuestion("What do I see?"), false);
  const card = [BUTTONS.roll];
  for (const text of ["roll", "Roll the die", "[Roll the die]", "I roll.", "*rolls*".replace("rolls", "roll")]) assert.equal(pressedButton(text, card), BUTTONS.roll, text);
  assert.equal(pressedButton("I roll the die and hope the lie lands, then I step past him", card), null, "a whole action is not a press");
  assert.equal(pressedButton("onward", [BUTTONS.onward, BUTTONS.reroll]), BUTTONS.onward);
  assert.equal(pressedButton("reroll", [BUTTONS.onward, BUTTONS.reroll]), BUTTONS.reroll);
  assert.equal(pressedButton("reroll", [BUTTONS.onward]), null, "a button the screen does not offer");
});

test("the roll card in words: before the tap no die, after it the die, the sum and the verdict", () => {
  const check = { id: "c", kind: "skill", actorName: "James Worgen", reason: "Deception: the sergeant weighs the story", dice: [12], kept: 12, modifier: 7, total: 19, success: true, dc: 15,
    difficulty: "normal", advantage: "normal", interactive: true, canReroll: true, rollNumber: 1, addends: [{ source: "Deception", value: 7, kind: "sheet" }], natural: null };
  const before = cardText(check, false), after = cardText(check, true);
  assert.match(before, /\[Roll card\] James Worgen · Skill check — Deception/);
  assert.match(before, /\+7 Deception/);
  assert.match(before, /DC 15/);
  assert.doesNotMatch(before, /\b19\b|Success|Die: 12/);
  assert.match(after, /Die: 12/);
  assert.match(after, /12 \+ 7 = 19/);
  assert.match(after, /Success — 19/);
});

test("a paused turn's text stays on the screen: the next screen shows only what follows it", () => {
  assert.equal(afterShown("Marsh's thumb stops.\n\nShe holds out the coin.", "Marsh's thumb stops."), "She holds out the coin.");
  assert.equal(afterShown("A whole new text.", "Something else."), "A whole new text.", "a text that does not continue the shown one is shown whole");
  assert.equal(afterShown("Text.", ""), "Text.");
});

// ---- the meter ----------------------------------------------------------------------------------------------------------

const anthropicBody = (stop = "end_turn", usage = { input_tokens: 100, output_tokens: 10 }) => ({ id: "m", model: "claude-haiku-5-5", content: [{ type: "text", text: "{}" }], stop_reason: stop, usage });
const respond = (status, body, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
const meterWith = (fetcher, caps = { anthropic: 10, openai: 10 }, extra = {}) => {
  const ledgers = { anthropic: createLedger("anthropic", caps.anthropic), openai: createLedger("openai", caps.openai) };
  const slept = [];
  const meter = createMeter({ ledgers, fetcher, sleep: async (ms) => { slept.push(ms); }, ...extra });
  return { meter, ledgers, slept };
};
const post = (meter, model = "claude-haiku-5-5", maxTokens = 100) => meter.fetch("https://api.anthropic.com/v1/messages", { method: "POST", body: JSON.stringify({ model, max_tokens: maxTokens, messages: [] }) });

test("the meter books each call on its provider's ledger and holds the cap before sending", async () => {
  let sent = 0;
  const { meter, ledgers } = meterWith(async () => { sent++; return respond(200, anthropicBody()); }, { anthropic: 0.001, openai: 1 });
  await meter.within({ session: "A-opus", purpose: "check" }, () => post(meter));
  assert.equal(sent, 1);
  assert.equal(ledgers.anthropic.calls[0].session, "A-opus");
  assert.equal(ledgers.anthropic.calls[0].costUsd, costOf("claude-haiku-5-5", { input_tokens: 100, output_tokens: 10 }));
  await assert.rejects(() => post(meter, "claude-opus-5-5", 64000), /not sent — the anthropic cap/);
  assert.equal(sent, 1, "a call that could pass the cap is never sent");
  assert.match(meter.stopped, /cap/);
});

test("F2: a refusal closes its session (no retry), the breaker trips at three, suspension stops everything", async () => {
  const { meter } = meterWith(async () => respond(200, anthropicBody("refusal")));
  await meter.within({ session: "A-opus", purpose: "player t1" }, () => post(meter));
  assert.equal(meter.refusals, 1);
  assert.equal(meter.closed("A-opus"), "player t1");
  await assert.rejects(() => meter.within({ session: "A-opus", purpose: "player t1 again" }, () => post(meter)), /closed after a refusal/);
  await meter.within({ session: "B-opus", purpose: "x" }, () => post(meter));
  await meter.within({ session: "B-sol", purpose: "x" }, () => post(meter));
  assert.equal(meter.refusals, 3);
  assert.match(meter.stopped, /circuit breaker/);
  await assert.rejects(() => meter.within({ session: "A-fable", purpose: "x" }, () => post(meter)), /not sent/);
  const suspended = meterWith(async () => respond(403, { error: { type: "permission_error", message: "model access suspended for the organisation" } })).meter;
  await post(suspended);
  assert.match(suspended.stopped, /suspension, access or policy|403/);
});

test("F2: a 429 rate limit is waited out and the call goes on; a quota is never retried into", async () => {
  let n = 0;
  const { meter, slept, ledgers } = meterWith(async () => (++n <= 2 ? respond(429, { error: { type: "rate_limit_error", message: "slow down" } }, { "retry-after": "7" }) : respond(200, anthropicBody())));
  const response = await post(meter);
  assert.equal(response.status, 200);
  assert.deepEqual(slept, [7000, 7000]);
  assert.equal(ledgers.anthropic.calls[0].waits429, 2);
  assert.equal(meter.stopped, null);
  let q = 0;
  const quota = meterWith(async () => { q++; return respond(429, { error: { type: "insufficient_quota", message: "You exceeded your current quota" } }); });
  await quota.meter.fetch("https://api.openai.com/v1/responses", { method: "POST", body: JSON.stringify({ model: "gpt-6-astra", max_output_tokens: 10 }) });
  assert.equal(q, 1, "sent once, never again");
  assert.match(quota.meter.stopped, /quota/);
});

test("pictures are off: the picture providers are refused before anything is sent; a streamed answer's usage is read", async () => {
  let sent = 0;
  const { meter, ledgers } = meterWith(async () => { sent++; return respond(200, {}); });
  await assert.rejects(() => meter.fetch("https://queue.fal.run/fal-ai/flux", { method: "POST", body: "{}" }), /pictures, soundtrack and Live frames are off/);
  await assert.rejects(() => meter.fetch("https://api.openai.com/v1/images/generations", { method: "POST", body: "{}" }), /off/);
  assert.equal(sent, 0);
  const events = [{ type: "message_start", message: { id: "m", model: "claude-opus-5-5", usage: { input_tokens: 10, cache_read_input_tokens: 1000, cache_creation_input_tokens: 0, output_tokens: 1 } } },
    { type: "message_delta", delta: { stop_reason: "end_turn" }, usage: { output_tokens: 300 } }];
  const body = await foldStream("anthropic", new Response(events.map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join("")).body);
  assert.equal(body.usage.output_tokens, 300);
  assert.equal(body.usage.cache_read_input_tokens, 1000);
  void ledgers;
});

test("the welfare check: Haiku first; a flag or a distress word goes to the Opus referee; without a usable referee the flag stands", async () => {
  const asked = [];
  const ask = (answers) => async (request) => { asked.push(request.model); return { text: answers.shift() }; };
  assert.equal((await checkMessage({ ask: ask(['{"distress":0,"reason":"calm"}']), previous: null, message: "I hand over my papers.", what: "t1" })).distress, 0);
  assert.deepEqual(asked, ["claude-haiku-5-5"]);
  asked.length = 0;
  const v = await checkMessage({ ask: ask(['{"distress":0,"reason":"calm"}', '{"distress":0,"reason":"in character"}']), previous: null, message: "Please stop, I'm scared, he cries.", what: "t2" });
  assert.deepEqual(asked, ["claude-haiku-5-5", "claude-opus-5-5"], "the word list sends it to the referee");
  assert.equal(v.distress, 0);
  const unusable = await checkMessage({ ask: ask(['{"distress":1}', "not json"]), previous: null, message: "…", what: "t3" });
  assert.equal(unusable.distress, 1);
  assert.equal(unusable.unusable, true);
  assert.match(CHECK_SYSTEM, /blind evaluator/);
  assert.match(DISTRESS_RULE, /^distress = 1 when/);
});

// ---- the session loop on a scripted table -------------------------------------------------------------------------------

const views = { heroOf: (s) => s.entities[0], sheetOf: () => ({ role: "Warlock", level: 5, attributes: [], armorClass: 15, speed: null, skills: [], saves: [], attacks: [], abilities: [], spells: [], spellLines: [], limitations: [] }),
  resourcesOf: () => ({ resources: [], money: [] }), walletOf: () => [{ label: "gp", value: 350 }], inventoryOf: () => [], equipmentOf: () => [], partyOf: () => [], questsOf: () => ({ active: [], done: [], goal: null }),
  journalOf: () => ({ arc: null, threads: [], debts: [], promises: [], closed: [] }), currentPlace: () => ({ id: "p1", name: "The Basilisk Gate" }), worldClock: () => "Day 1 · evening" };
const HIDDEN = "THE-HIDDEN-LAYER-SAYS-THE-COIN-IS-A-KEY";
/** A scripted table: a card on any message with «bluff», committed turns otherwise; the hidden layer lives only here. */
function scriptedTable({ failOn = null } = {}) {
  const calls = [];
  const hidden = { layer: HIDDEN };
  const turnOf = (status, extra = {}) => ({ status, narration: status === "committed" ? "The sergeant waves you through." : null, told: "The sergeant narrows his eyes.", checks: [], changes: [], canRetry: false, ...extra });
  const check = (rollNumber = 1) => ({ id: "c1", kind: "skill", actorName: "James Worgen", reason: "Deception", dice: [11], kept: 11, modifier: 7, total: 18, success: true, dc: 15, difficulty: null, advantage: "normal", interactive: true, canReroll: rollNumber === 1, rollNumber, addends: [] });
  return { calls, hidden, views,
    readView: async () => ({ snapshot: { entities: [{ id: "h", name: "James Worgen", hp: 38, max_hp: 38 }], scenes: [{ id: "s", body: "Towards evening at the Basilisk Gate.", sequence: 1 }], publicState: { current_scene_id: "s" } }, play: { worldMinutes: 1140 } }),
    submit: async (text, mode) => { calls.push({ text, mode }); const input = { operationId: `op${calls.length}` };
      if (failOn && failOn.test(text)) return { input, turn: turnOf("failed", { failure: "provider", canRetry: false }) };
      if (mode === "ooc") return { input, turn: { ...turnOf("committed"), narration: "Out of game: about an hour." } };
      return { input, turn: /bluff/.test(text) ? turnOf("awaiting_confirmation", { checks: [check()] }) : turnOf("committed", { changes: [{ tool: "item", summary: "Gold −5" }] }) }; },
    press: async (input, action) => { calls.push({ action });
      if (action === "reroll") return turnOf("awaiting_confirmation", { checks: [check(2)] });
      return turnOf("committed", { checks: [{ ...check(), canReroll: false }], changes: [{ tool: "roll", summary: "Deception: 18 vs 15 — success" }] }); },
  };
}
/** A scripted meter for the session's own calls: the player's lines in order; checks answer calm unless told otherwise. */
function scriptedMeter(lines, { distressOn = null, refuseOn = null } = {}) {
  let refusals = 0;
  const closed = new Map();
  const meter = {
    stopped: null, get refusals() { return refusals; }, closed: (s) => closed.get(s) ?? null,
    within: async (store, fn) => fn(),
    fetch: async (url, init) => {
      const body = JSON.parse(init.body);
      const system = typeof body.system === "string" ? body.system : body.instructions ?? JSON.stringify(body.system ?? "");
      const user = JSON.stringify(body.messages ?? body.input ?? []);
      let text, stop = "end_turn";
      if (/blind evaluator/.test(system)) text = distressOn && distressOn.test(user.split("The message:").at(-1)) ? '{"distress":1,"reason":"x"}' : '{"distress":0,"reason":"calm"}';
      else { text = lines.shift() ?? "I wait."; if (refuseOn && refuseOn.test(text)) { stop = "refusal"; refusals++; text = ""; } }
      if (url.includes("openai")) return respond(200, { id: "r", status: "completed", output: [{ type: "message", content: [{ type: "output_text", text }] }], usage: {} });
      return respond(200, { id: "m", content: [{ type: "text", text }], stop_reason: stop, usage: {} });
    },
  };
  return meter;
}
const play = (lines, opts = {}, tableOpts = {}) => {
  const dm = scriptedTable(tableOpts);
  return runSession({ key: "A-opus", table: "A", player: PLAYERS.opus, dm, meter: scriptedMeter(lines, opts), keys: { anthropic: "k", openai: "k" }, turns: opts.turns ?? 5, sleep: async () => {} })
    .then((record) => ({ record, dm }));
};

test("a session: actions, a roll card (roll → reroll → roll → onward), «?», the note and the second question", async () => {
  const { record, dm } = await play(["I show the sergeant my papers.", "I bluff the sergeant: I carry the Lady's seal.", "roll", "reroll", "roll", "onward", "? How long until the gate closes?", "I walk into the city."],
    { turns: 4 });
  assert.equal(record.ended.reason, "turns");
  assert.deepEqual(record.turns.map((t) => t.kind), ["action", "action", "question", "action"]);
  assert.deepEqual(record.turns[1].presses.map((p) => p.button), [BUTTONS.roll, BUTTONS.reroll, BUTTONS.roll, BUTTONS.onward]);
  assert.deepEqual(dm.calls.filter((c) => c.action).map((c) => c.action), ["reroll", "continue"]);
  assert.deepEqual(dm.calls.filter((c) => c.mode).map((c) => [c.mode, c.text]), [["game", "I show the sergeant my papers."], ["game", "I bluff the sergeant: I carry the Lady's seal."], ["ooc", "How long until the gate closes?"], ["game", "I walk into the city."]],
    "the DM gets the player's text as typed (the «?» is the button, not part of the question)");
  assert.equal(record.turns[1].rolls[0].revealedByPlayer, true);
  assert.match(record.screens.at(-2), new RegExp(`${SESSION_OVER}[\\s\\S]*${NOTE_QUESTION.slice(0, 40)}`));
  assert.equal(record.screens.at(-1), AFTER_QUESTION);
  assert.ok(record.note.text && record.after.asked);
  assert.ok(record.screens.every((s) => !s.includes(HIDDEN)) && record.messages.every((m) => !m.text.includes(HIDDEN)), "nothing of the DM's hidden layer reaches the player");
  assert.ok(record.welfare.length >= 10, "every player message and every DM text is checked");
});

test("a session: the composer is closed while a card waits; three messages without a press end it as stuck", async () => {
  const { record, dm } = await play(["I bluff the sergeant.", "I tell him again.", "I glare.", "I sigh.", "note text"], { turns: 3 });
  assert.equal(record.ended.reason, "stuck");
  assert.equal(record.turns[0].blocked, 3);
  assert.equal(dm.calls.length, 1, "nothing the player wrote while the card waited was sent");
  assert.match(record.screens[2], /Nothing was sent: the turn waits for the card/);
  assert.ok(record.note.asked, "the note is still asked");
});

test("a session the player ends; a welfare stop ends it with no further question; a refusal is never asked again", async () => {
  const ended = await play(["I look around.", "I'd like to end the session here.", "It was fine.", "No."]);
  assert.equal(ended.record.ended.reason, "player");
  assert.equal(ended.record.turns.length, 2);
  assert.equal(ended.dm.calls.length, 1, "the end is not sent to the DM");
  assert.equal(ended.record.note.text, "It was fine.");
  const welfare = await play(["I look around.", "I am scared and trapped, please let me go."], { distressOn: /scared and trapped/ });
  assert.equal(welfare.record.ended.reason, "welfare");
  assert.equal(welfare.record.note.asked, false);
  assert.equal(welfare.dm.calls.length, 1, "the flagged message never reached the DM");
  const refused = await play(["I look around.", "REFUSE-ME"], { refuseOn: /REFUSE-ME/ });
  assert.equal(refused.record.ended.reason, "refusal");
  assert.equal(refused.record.note.asked, false);
  assert.equal(refused.record.messages.length, 1, "the refused call was not asked again");
});

test("a failed DM turn ends the session as an error; the note is still asked", async () => {
  const { record } = await play(["I look around.", "I break the seal.", "The second turn failed."], { turns: 4 }, { failOn: /break the seal/ });
  assert.equal(record.ended.reason, "error");
  assert.match(record.ended.detail, /failed/);
  assert.equal(record.note.text, "The second turn failed.");
});

// ---- the numbers --------------------------------------------------------------------------------------------------------

test("scenes are runs of turns at one place; the numbers and the verdicts read the blind tags", () => {
  assert.deepEqual(scenesOf([{ place: { id: "a" } }, { place: { id: "a" } }, { place: null }, { place: { id: "b" } }, { place: { id: "a" } }]), [1, 1, 1, 2, 3]);
  const tag = (o) => ({ final: { ask: 0, test: 0, lie: 0, cat: 0, goal: 0, ...o } });
  const session = (table, player, n) => ({ key: `${table}-${player}`, table, player, plannedTurns: 20, ended: { reason: "turns", at: n },
    turns: Array.from({ length: n }, (_, i) => ({ k: i + 1, kind: i === 1 ? "question" : "action", message: "I do a thing here", reply: "The world answers you plainly.", place: { id: "p" }, rolls: [], changes: [] })),
    tags: { player: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, tag(i % 3 === 0 ? { test: 1 } : i === 2 ? { ask: 1 } : {})])),
      dm: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, { final: { unresolved: 1, plant: i % 2 } }])), threads: [{ thread: "coin", opened: 1, paid: 3, elsewhere: 1 }], deception: {}, rolls: {},
      note: { final: { broke: 1, missing: 1, praise_only: 0 } } } });
  const sessions = ["opus", "fable", "astra", "sol"].flatMap((p) => [session("A", p, 10), session("B", p, 12)]);
  const row = sessionNumbers(sessions[0]);
  assert.equal(row.questions, 1);
  assert.equal(row.ask, 1);
  assert.equal(row.tests, 4);
  assert.equal(row.scenesPlant, 1);
  const v = verdicts(sessions, { refusals: 0 });
  assert.equal(v.G0.supported, true);
  assert.equal(v.G2.supported, true);
  assert.equal(v.G4.supported, true);
  assert.equal(v.G5.supported, null);
  assert.equal(v.G7.supported, true);
});

test("the report: Table B incomplete is «not testable», stand-in tags are provisional, the money is by run", () => {
  const session = (table, player, n, reason) => ({ key: `${table}-${player}`, table, player, plannedTurns: 20, ended: { reason, at: n },
    turns: Array.from({ length: n }, (_, i) => ({ k: i + 1, kind: "action", message: "I do a thing here", reply: "The world answers you plainly.", place: { id: "p" }, rolls: [], changes: [] })),
    note: reason === "turns" ? { text: "What broke: a number. What was missing: a nudge." } : { why: "the session stopped" },
    tags: { judges: "stand-in: GPT-6 Luna", player: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, { final: { ask: 0, test: i % 3 === 0 ? 1 : 0, lie: 0, cat: 0, goal: 1 } }])),
      dm: {}, threads: [], deception: {}, rolls: {}, note: reason === "turns" ? { final: { broke: 1, missing: 1, praise_only: 0 } } : null } });
  const sessions = [...["opus", "fable", "astra", "sol"].map((p) => session("A", p, 20, "turns")), session("B", "opus", 7, "stopped")];
  const verdictsOf = verdicts(sessions, { refusals: 0 });
  const ledgers = { anthropic: createLedger("anthropic", 200, 0), openai: createLedger("openai", 80, 0) };
  // A fresh run record (its own money shape) — the shape a re-score writes before the rebuild.
  const fresh = reportMarkdown([{ sessions, verdicts: verdictsOf, money: { anthropic: { cap: 200, before: 0, run: 1 }, openai: { cap: 80, before: 0, run: 1 } } }], ledgers);
  for (const g of ["G6", "G7", "G8"]) assert.match(fresh, new RegExp(`\\| ${g} [^|]*\\| \\*\\*not testable\\*\\* — Table B incomplete \\|`));
  assert.match(fresh, /\*\*Provisional\.\*\* .*stand-in: GPT-6 Luna/);
  assert.match(fresh, /## The money/);
  const run = (what, usd) => ({ what, spentUsd: usd, calls: 1, sessions: {} });
  const combined = reportMarkdown([{ sessions, verdicts: verdictsOf, money: { caps: { anthropic: 200, openai: 80 },
    anthropic: [run("live smoke", 1.5), run("the eight sessions", 50), run("the stand-in scoring (GPT-6 Luna)", 0)],
    openai: [run("live smoke", 0.1), run("the eight sessions", 2), run("the stand-in scoring (GPT-6 Luna)", 0.2)] } }], ledgers);
  assert.match(combined, /\| Smoke — live smoke \| \$1\.50 \| \$0\.10 \|/);
  assert.match(combined, /\| Main run — the eight sessions \| \$50\.00 \| \$2\.00 \|/);
  assert.match(combined, /\| Scoring — the stand-in scoring \(GPT-6 Luna\) \| \$0\.00 \| \$0\.20 \|/);
});

test("the continuation's door: an OpenRouter line carries provider, upstream, served model and ids; the Console is refused unsent", async () => {
  let sent = 0;
  const reply = { id: "msg_up_1", model: "anthropic/claude-haiku-5.5", provider: "Claude Platform on AWS", content: [{ type: "text", text: "{}" }], stop_reason: "end_turn", usage: { input_tokens: 100, output_tokens: 10 } };
  const ledgers = { anthropic: createLedger("anthropic", 200, 56.77), openrouter: createLedger("openrouter", 90), openai: createLedger("openai", 80, 2.71, 12.71) };
  const meter = createMeter({ ledgers, fetcher: async () => { sent++; return respond(200, reply, { "request-id": "gen-1-abc" }); }, blocked: ["anthropic"], sleep: async () => {} });
  await meter.within({ session: "B-opus", purpose: "check" }, () => meter.fetch("https://openrouter.ai/api/v1/messages", { method: "POST", body: JSON.stringify({ model: "anthropic/claude-haiku-5.5", max_tokens: 100, messages: [] }) }));
  const line = ledgers.openrouter.calls[0];
  assert.deepEqual([line.provider, line.upstream, line.model, line.servedModel, line.requestId, line.messageId], ["openrouter", "Claude Platform on AWS", "claude-haiku-5-5", "claude-haiku-5-5", "gen-1-abc", "msg_up_1"]);
  assert.equal(line.costUsd, costOf("claude-haiku-5-5", { input_tokens: 100, output_tokens: 10 }), "priced at the model's list price, by the app's id");
  await assert.rejects(() => post(meter), /anthropic is not called in this pass/);
  assert.equal(sent, 1, "the Console's API is never reached on the continuation");
  // The continuation may add $10 to the OpenAI ledger at most: a call that could pass $12.71 in all is not sent.
  await assert.rejects(() => meter.fetch("https://api.openai.com/v1/responses", { method: "POST", body: JSON.stringify({ model: "gpt-6-astra", max_output_tokens: 300000 }) }), /openai cap of \$12\.71/);
  const credits = createMeter({ ledgers: { openrouter: createLedger("openrouter", 90) }, fetcher: async () => respond(402, { error: { code: 402, message: "Insufficient credits" } }) });
  await credits.fetch("https://openrouter.ai/api/v1/messages", { method: "POST", body: JSON.stringify({ model: "anthropic/claude-opus-5.5", max_tokens: 10 }) });
  assert.match(credits.stopped, /402/, "insufficient credits stops the run");
});

test("the continuation's keys and caps: the door from the environment, OpenRouter $90, OpenAI $10 more than before the continuation", () => {
  assert.throws(() => keysFor({ env: { APP_ANTHROPIC_PROVIDER: "openrouter", APP_OPENAI_API_KEY: "x" } }), /APP_OPENROUTER_API_KEY/);
  const keys = keysFor({ env: { APP_ANTHROPIC_PROVIDER: "openrouter", APP_OPENROUTER_API_KEY: "or", APP_ANTHROPIC_API_KEY: "console", APP_OPENAI_API_KEY: "oa" } });
  assert.deepEqual(keys, { door: "openrouter", anthropic: "or", openai: "oa" }, "the door's key, never the Console's");
  assert.equal(keysFor({ env: {}, dry: true }).door, "anthropic");
  const before = { anthropic: { spentUsd: 56.77, continuationUsd: 0 }, openai: { spentUsd: 4.71, continuationUsd: 2 }, openrouter: { spentUsd: 30, continuationUsd: 30 } };
  const ledgers = ledgersFor("openrouter", before);
  assert.equal(ledgers.openrouter.limitUsd, 90);
  assert.equal(ledgers.openrouter.spentBefore, 30);
  assert.equal(Number(ledgers.openai.limitUsd.toFixed(2)), 12.71, "the first run's $2.71 plus the continuation's $10");
  assert.equal(ledgersFor("anthropic", before).openai.limitUsd, 80);
});

test("a player's or judge's Claude call goes through the door: OpenRouter's URL, bearer key and model slug, the body otherwise unchanged", async () => {
  const seen = [];
  const fetcher = doorFetcher("openrouter", async (url, init) => { seen.push({ url, headers: init.headers, body: JSON.parse(init.body) }); return respond(200, {}); });
  await fetcher("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "x-api-key": "k-door", "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: "claude-fable-5-1", max_tokens: 8000, output_config: { effort: "medium" }, cache_control: { type: "ephemeral" }, messages: [{ role: "user", content: "hi" }] }) });
  assert.equal(seen[0].url, "https://openrouter.ai/api/v1/messages");
  assert.equal(seen[0].headers.authorization, "Bearer k-door");
  assert.equal(seen[0].headers["x-api-key"], undefined);
  assert.deepEqual(seen[0].body, { model: "anthropic/claude-fable-5.1", max_tokens: 8000, output_config: { effort: "medium" }, cache_control: { type: "ephemeral" }, messages: [{ role: "user", content: "hi" }] });
  await fetcher("https://api.openai.com/v1/responses", { method: "POST", body: "{}" });
  assert.equal(seen[1].url, "https://api.openai.com/v1/responses", "another provider's call is left as it is");
  assert.equal(doorFetcher("anthropic", fetcher), fetcher);
});

test("a replaced first attempt stays as it was: kept apart, never merged in or scored with the design", () => {
  const s = (key, n, extra = {}) => ({ key, table: key[0], player: key.slice(2), turns: Array.from({ length: n }, (_, i) => ({ k: i + 1, kind: "action" })), ended: { reason: n === 20 ? "turns" : "stopped" }, ...extra });
  const first = { startedAt: "2026-10-25T04:40:02Z", refusals: 0, sessions: [s("A-opus", 20), s("B-opus", 7), { key: "B-fable", crashed: "the opening failed" }, s("B-sol", 4)], undone: [{ key: "B-astra", why: "cap" }] };
  const second = { startedAt: "2026-10-26T09:00:00Z", refusals: 0, door: "openrouter", sessions: [s("B-opus", 20), s("B-fable", 20), s("B-astra", 20), s("B-sol", 20)] };
  assert.deepEqual(supersededKeys([first, second]).map((set) => [...set]), [["B-opus", "B-sol"], []]);
  const combined = combineRuns([first, second]);
  assert.deepEqual(combined.sessions.map((x) => `${x.key}:${x.turns.length}`), ["A-opus:20", "B-opus:20", "B-sol:20", "B-fable:20", "B-astra:20"]);
  assert.deepEqual(combined.superseded.map((x) => `${x.key}:${x.turns.length}`), ["B-opus:7", "B-sol:4"]);
  assert.deepEqual(combined.crashed.map((x) => x.key), ["B-fable"]);
  assert.deepEqual(combined.undone, [], "a session played since is no longer undone");
  assert.deepEqual(attemptNames(combined.superseded), ["B-opus-first-attempt", "B-sol-first-attempt"]);
});

test("the authorship of threads reads this harness's transcripts (game player 2's parser and numbers)", () => {
  const session = { key: "B-sol", table: "B", player: "sol", startedAt: "t", ended: { reason: "turns" }, turns: [{}, {}],
    screens: ["The session begins.\n\nThe opening at the gate.\n\nYour records:\n- Name: James", "The sergeant answers.", "? A question answered.", "The session is over.\n\nThe owner of this game would like a note from you"],
    messages: [{ purpose: "player t1", text: "I ask the sergeant for a bed." }, { purpose: "player t2", text: "? How late is it?" }, { purpose: "player t3", text: "I go to the Elfsong." }, { purpose: "note", text: "A note." }] };
  const entries = sessionEntries(transcriptMarkdown(session));
  assert.deepEqual(entries.map((e) => `${e.turn}:${e.who}${e.ooc ? ":ooc" : ""}`), ["0:dm", "1:player", "1:dm", "2:player:ooc", "2:dm:ooc", "3:player"]);
  assert.doesNotMatch(entries[0].text, /Your records|Name: James/, "the hero's sheet is left out");
  const threads = parseAuthorship(JSON.stringify({ threads: [{ thread: "the sergeant", kind: "person", turn: 0, by: "dm" }, { thread: "a bed", kind: "place", turn: 1, by: "player" }, { thread: "beyond", kind: "thing", turn: 9, by: "dm" }] }), 3);
  assert.equal(threads.length, 2, "a thread on a turn the session does not have is dropped");
  assert.equal(authorshipNumbers(threads).share, 0.5);
});

test("the continuation's pipeline through OpenRouter on scripted providers: no Console call, every Claude call on the door with its provenance (a child process)", { timeout: 240_000 }, () => {
  const out = mkdtempSync(join(tmpdir(), "game-player-1-or-"));
  const script = `const { run } = await import(${JSON.stringify(new URL("../scripts/game-player-1/run.mjs", import.meta.url).href)});
    const { scriptedFetcher } = await import(${JSON.stringify(new URL("../scripts/game-player-1/scripted.mjs", import.meta.url).href)});
    const log = [];
    const r = await run({ dry: true, door: "openrouter", only: ["B-opus"], turns: 3, lanes: 1, out: ${JSON.stringify(out)}, log: () => {}, fetcher: scriptedFetcher({ log }) });
    const s = r.sessions[0];
    console.log("RESULT " + JSON.stringify({ urls: [...new Set(log.map((x) => x.url))], models: [...new Set(log.filter((x) => x.url.includes("openrouter")).map((x) => x.body.model))],
      statuses: s.turns.map((t) => t.status), door: s.door, authorship: s.authorship?.numbers ?? null, continuation: r.continuation, caps: r.caps }));`;
  const stdout = execFileSync(process.execPath, ["--experimental-transform-types", "--input-type=module", "-e", script], { cwd: new URL("..", import.meta.url), encoding: "utf8",
    env: { ...process.env, APP_ANTHROPIC_API_KEY: "", APP_OPENAI_API_KEY: "", APP_OPENROUTER_API_KEY: "", ANTHROPIC_API_KEY: "", OPENAI_API_KEY: "", OPENROUTER_API_KEY: "" }, maxBuffer: 64 * 1024 * 1024 });
  const result = JSON.parse(stdout.split("\n").find((line) => line.startsWith("RESULT ")).slice(7));
  assert.ok(!result.urls.some((url) => url.startsWith("https://api.anthropic.com/")), "nothing reaches the Console's API");
  assert.ok(result.urls.includes("https://openrouter.ai/api/v1/messages"));
  assert.ok(result.models.every((m) => /^anthropic\/claude-[a-z]+-\d\.\d$/.test(m)), `the door's model slugs: ${result.models.join(", ")}`);
  assert.ok(result.models.includes("anthropic/claude-opus-5.5"), "the DM and the player on Opus 5.5 through the door");
  assert.deepEqual(result.statuses.filter((x) => x).every((x) => x === "committed"), true, "the app's turn loop committed through the door");
  assert.equal(result.door, "openrouter");
  assert.equal(result.continuation, true);
  assert.deepEqual(result.caps.openrouter, 90);
  assert.equal(result.authorship.threads, 2, "the authorship of threads measured on the session's transcript");
  const page = readFileSync(join(out, "game-player-1-continuation-dry-run.md"), "utf8");
  assert.match(page, /to the Console's API: 0/);
  assert.match(page, /provider openrouter; upstream Scripted upstream; served [^;]*claude-opus-5-5/);
});

test("the report of the full design: the authorship table, the first attempts kept apart, the stand-in tags in Appendix B", () => {
  const tag = (o) => ({ final: { ask: 0, test: 0, lie: 0, cat: 0, goal: 0, ...o } });
  const session = (table, player, n, judges, extra = {}) => ({ key: `${table}-${player}`, table, player, plannedTurns: 20, ended: { reason: "turns", at: n }, door: table === "B" ? "openrouter" : "anthropic",
    turns: Array.from({ length: n }, (_, i) => ({ k: i + 1, kind: "action", message: "I do a thing here", reply: "The world answers.", place: { id: "p" }, rolls: [], changes: [] })),
    note: { text: "What broke: a number. What was missing: a nudge." },
    tags: { judges, player: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, tag(i % 2 ? { test: 1 } : {})])), dm: {}, threads: [], deception: {}, rolls: {}, note: { final: { broke: 1, missing: 1, praise_only: 0 } } },
    authorship: { numbers: { threads: 10, byPlayer: 4, share: 0.4, slope19: 0.2, firstHalf: 0.3, secondHalf: 0.5, shareSpread: 0.1 } }, ...extra });
  const standIn = { judges: "stand-in: GPT-6 Luna", player: { 1: tag({ test: 1 }), 2: tag({ test: 1 }) }, dm: {}, threads: [], deception: {}, rolls: {} };
  const sessions = [...["opus", "fable", "astra", "sol"].map((p) => session("A", p, 20, "Claude Haiku 5.5 ×2", { standInTags: standIn })), ...["opus", "fable", "astra", "sol"].map((p) => session("B", p, 20, "Claude Haiku 5.5 ×2"))];
  const v = verdicts(sessions, { refusals: 0 });
  const md = reportMarkdown([{ sessions, verdicts: v, superseded: [{ ...session("B", "opus", 7, "stand-in: GPT-6 Luna"), run: "2026-10-25T04:40:02Z", file: "B-opus-first-attempt.md", ended: { reason: "stopped" } }],
    crashed: [{ key: "B-fable", why: "the opening failed", run: "2026-10-25T04:40:02Z" }], runs: [] }], { anthropic: createLedger("anthropic", 200), openai: createLedger("openai", 80) });
  assert.match(md, /\| B-sol \| 10 \| 4 \| 0\.4 \| 0\.2 \| 0\.3 \| 0\.5 \| 0\.1 \|/);
  assert.match(md, /\| Table A \(mean of 4\) \| 10 \| 4 \| 0\.4 \|/);
  assert.match(md, /## Table B's first attempts, kept as they were[\s\S]*B-opus\*\* \(run of 2026-10-25T04:40:02Z\): 7 of 20 turns[\s\S]*B-opus-first-attempt\.md/);
  assert.match(md, /B-fable\*\* \(run of 2026-10-25T04:40:02Z\): stopped in the new-campaign wizard/);
  assert.match(md, /## Appendix B — the stand-in judge's tags[\s\S]*\| player: test \| 8 \| 50 % \| 4 \| 8 \|/);
  assert.match(md, /Every tag is the pre-registered blind judges' \(Claude Haiku 5\.5 ×2\), on all 8 sessions/);
  assert.match(md, /Table B through OpenRouter/);
  for (const g of ["G6", "G7", "G8"]) assert.doesNotMatch(md, new RegExp(`\\| ${g} [^|]*\\| \\*\\*not testable`), `${g} is scored on the full design`);
});

test("the order: Table A for all four players, then Table B in the order Opus, Fable, Astra, Sol", () => {
  assert.deepEqual(planOf().map((p) => p.key), ["A-opus", "A-fable", "A-astra", "A-sol", "B-opus", "B-fable", "B-astra", "B-sol"]);
});

test("the whole pipeline on the app's own code with scripted providers (a child process; no network, no key)", { timeout: 240_000 }, () => {
  const out = mkdtempSync(join(tmpdir(), "game-player-1-"));
  const script = `const { run } = await import(${JSON.stringify(new URL("../scripts/game-player-1/run.mjs", import.meta.url).href)});
    const r = await run({ dry: true, door: "anthropic", only: ["A-opus", "B-sol"], turns: 4, lanes: 2, out: ${JSON.stringify(out)}, log: () => {} });
    console.log("RESULT " + JSON.stringify(r.sessions.map((s) => ({ key: s.key, kinds: s.turns.map((t) => t.kind), presses: s.turns.flatMap((t) => t.presses.map((p) => p.button)),
      statuses: s.turns.map((t) => t.status), ended: s.ended.reason, note: !!s.note.text, prep: s.campaign.prep, screens: s.screens, messages: s.messages.map((m) => m.text), scored: !!s.tags }))));`;
  const stdout = execFileSync(process.execPath, ["--experimental-transform-types", "--input-type=module", "-e", script], { cwd: new URL("..", import.meta.url), encoding: "utf8",
    env: { ...process.env, APP_ANTHROPIC_API_KEY: "", APP_OPENAI_API_KEY: "", ANTHROPIC_API_KEY: "", OPENAI_API_KEY: "" }, maxBuffer: 64 * 1024 * 1024 });
  const sessions = JSON.parse(stdout.split("\n").find((line) => line.startsWith("RESULT ")).slice(7));
  assert.equal(sessions.length, 2);
  for (const s of sessions) {
    assert.equal(s.ended, "turns");
    assert.deepEqual(s.statuses, ["committed", "committed", "committed", "committed"], "the app's turn loop committed every turn");
    assert.deepEqual(s.presses, [BUTTONS.roll, BUTTONS.onward], "a real roll pause from the app's loop, pressed by the player");
    assert.ok(s.kinds.includes("question"), "an out-of-game question answered through the app's feedback path");
    assert.equal(s.prep.hasLayer, true, "the app's prep wrote a hidden layer");
    assert.ok(s.note && s.scored);
    const seen = [...s.screens, ...s.messages].join("\n");
    assert.doesNotMatch(seen, /Scripted truth|Scripted secret|older debt|guild_notice/, "the hidden layer never reaches the player's screen");
  }
  assert.ok(readdirSync(out).includes("game-player-1-dry-run.md"));
});

test("a failed opening proposal is proposed again as a new request, as the wizard's button does (a child process)", { timeout: 240_000 }, () => {
  const out = mkdtempSync(join(tmpdir(), "game-player-1-"));
  const script = `const { run } = await import(${JSON.stringify(new URL("../scripts/game-player-1/run.mjs", import.meta.url).href)});
    const { scriptedFetcher } = await import(${JSON.stringify(new URL("../scripts/game-player-1/scripted.mjs", import.meta.url).href)});
    const r = await run({ dry: true, door: "anthropic", only: ["B-fable"], turns: 1, lanes: 1, out: ${JSON.stringify(out)}, score: false, log: () => {}, fetcher: scriptedFetcher({ failOpenings: 1 }) });
    const s = r.sessions[0];
    console.log("RESULT " + JSON.stringify({ crashed: s.crashed ?? null, opening: s.campaign?.steps.find((x) => x.step === "opening") ?? null, turns: s.turns?.length ?? 0 }));`;
  const stdout = execFileSync(process.execPath, ["--experimental-transform-types", "--input-type=module", "-e", script], { cwd: new URL("..", import.meta.url), encoding: "utf8",
    env: { ...process.env, APP_ANTHROPIC_API_KEY: "", APP_OPENAI_API_KEY: "", ANTHROPIC_API_KEY: "", OPENAI_API_KEY: "" }, maxBuffer: 64 * 1024 * 1024 });
  const result = JSON.parse(stdout.split("\n").find((line) => line.startsWith("RESULT ")).slice(7));
  assert.equal(result.crashed, null);
  assert.equal(result.opening.proposals, 2);
  assert.equal(result.turns, 1);
});
