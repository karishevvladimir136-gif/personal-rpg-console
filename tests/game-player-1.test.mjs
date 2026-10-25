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
import { planOf } from "../scripts/game-player-1/run.mjs";

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

test("the order: Table A for all four players, then Table B in the order Opus, Fable, Astra, Sol", () => {
  assert.deepEqual(planOf().map((p) => p.key), ["A-opus", "A-fable", "A-astra", "A-sol", "B-opus", "B-fable", "B-astra", "B-sol"]);
});

test("the whole pipeline on the app's own code with scripted providers (a child process; no network, no key)", { timeout: 240_000 }, () => {
  const out = mkdtempSync(join(tmpdir(), "game-player-1-"));
  const script = `const { run } = await import(${JSON.stringify(new URL("../scripts/game-player-1/run.mjs", import.meta.url).href)});
    const r = await run({ dry: true, only: ["A-opus", "B-sol"], turns: 4, lanes: 2, out: ${JSON.stringify(out)}, log: () => {} });
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
    const r = await run({ dry: true, only: ["B-fable"], turns: 1, lanes: 1, out: ${JSON.stringify(out)}, score: false, log: () => {}, fetcher: scriptedFetcher({ failOpenings: 1 }) });
    const s = r.sessions[0];
    console.log("RESULT " + JSON.stringify({ crashed: s.crashed ?? null, opening: s.campaign?.steps.find((x) => x.step === "opening") ?? null, turns: s.turns?.length ?? 0 }));`;
  const stdout = execFileSync(process.execPath, ["--experimental-transform-types", "--input-type=module", "-e", script], { cwd: new URL("..", import.meta.url), encoding: "utf8",
    env: { ...process.env, APP_ANTHROPIC_API_KEY: "", APP_OPENAI_API_KEY: "", ANTHROPIC_API_KEY: "", OPENAI_API_KEY: "" }, maxBuffer: 64 * 1024 * 1024 });
  const result = JSON.parse(stdout.split("\n").find((line) => line.startsWith("RESULT ")).slice(7));
  assert.equal(result.crashed, null);
  assert.equal(result.opening.proposals, 2);
  assert.equal(result.turns, 1);
});
