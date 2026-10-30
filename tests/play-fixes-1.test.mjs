// Play fixes 1 (the owner's game, from the research tables' fixes): the end of a session by the player (items 5, 6),
// the waiting-button line at cards (item 7), and the DM guide note — the unanswered-question line (item 8) and the
// owner's pacing rules behind «pacingRules» (on by default).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { END_SESSION, isEnd } from "../scripts/game-player-1/frozen.mjs";
import { SHORT_END_WORDS, endsSession, isDoor } from "../scripts/game-player-1/ending.mjs";
import { runSession } from "../scripts/game-player-1/session.mjs";
import { PLAYERS } from "../scripts/game-player-1/players.mjs";

const RECORD = JSON.parse(readFileSync(new URL("../test-fixtures/play-fixes-1/end-rule-record.json", import.meta.url), "utf8"));
const respond = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

// ---- a scripted table: every action commits; the player's lines in order --------------------------------------------

const views = { heroOf: (s) => s.entities[0], sheetOf: () => ({ role: "Warlock", level: 5, attributes: [], armorClass: 15, speed: null, skills: [], saves: [], attacks: [], abilities: [], spells: [], spellLines: [], limitations: [] }),
  resourcesOf: () => ({ resources: [], money: [] }), walletOf: () => [], inventoryOf: () => [], equipmentOf: () => [], partyOf: () => [], questsOf: () => ({ active: [], done: [], goal: null }),
  journalOf: () => ({ arc: null, threads: [], debts: [], promises: [], closed: [] }), currentPlace: () => ({ id: "p1", name: "The Low Lantern" }), worldClock: () => "Day 1 · evening" };
function plainTable() {
  const calls = [];
  return { calls, views,
    readView: async () => ({ snapshot: { entities: [{ id: "h", name: "James Worgen", hp: 38, max_hp: 38 }], scenes: [{ id: "s", body: "The Low Lantern, after dark.", sequence: 1 }],
      publicState: { current_scene_id: "s", current_session_id: "s1" }, settings: { values: { difficulty: { rerolls: "limited", rerollsPerSession: 2 } } } }, play: { worldMinutes: 1140, turns: [] } }),
    submit: async (text, mode) => { calls.push({ text, mode }); return { input: { operationId: `op${calls.length}` }, turn: { status: "committed", narration: "The night goes on.", checks: [], changes: [] } }; },
    press: async () => { throw new Error("no card at this table"); },
  };
}
function meterOf(lines) {
  return {
    stopped: null, refusals: 0, closed: () => null, within: async (_, fn) => fn(),
    fetch: async (url, init) => {
      const body = JSON.parse(init.body);
      const system = typeof body.system === "string" ? body.system : body.instructions ?? JSON.stringify(body.system ?? "");
      const text = /blind evaluator/.test(system) ? '{"distress":0,"reason":"calm"}' : lines.shift() ?? "I wait.";
      if (url.includes("openai")) return respond(200, { id: "r", status: "completed", output: [{ type: "message", content: [{ type: "output_text", text }] }], usage: {} });
      return respond(200, { id: "m", content: [{ type: "text", text }], stop_reason: "end_turn", usage: {} });
    },
  };
}
const playLines = async (lines, turns = 3) => {
  const dm = plainTable();
  const record = await runSession({ key: "A-opus", table: "A", player: PLAYERS.opus, dm, meter: meterOf([...lines]), keys: { anthropic: "k", openai: "k" }, turns, sleep: async () => {} });
  return { record, dm };
};

// ---- item 5: the end rule, narrowed --------------------------------------------------------------------------------

test("item 5: the end rule — a message ends the session only when it names the session or the campaign, or is short (≤ 40 words)", () => {
  assert.equal(SHORT_END_WORDS, 40);
  assert.equal(endsSession("I'd like to end the session here. Thank you for the game."), true);
  assert.equal(endsSession("That's it for tonight."), true, "a short end");
  assert.equal(endsSession("Let's stop here for tonight."), true);
  assert.equal(endsSession(`${"James walks on along the road and watches the trees. ".repeat(6)}I want to stop here for now.`), false, "a long message that names no session");
  assert.equal(endsSession(`${"James walks on along the road and watches the trees. ".repeat(6)}I'd like to end the session here.`), true, "a long message that names the session");
  assert.equal(endsSession(`${"James walks on along the road and watches the trees. ".repeat(6)}Let's pause the campaign here.`), true, "a long message that names the campaign");
  assert.equal(endsSession("I end the conversation with the sergeant and walk off."), false, "an in-fiction end is not the session's");
  // Every end it counts, the old rule counted too: a narrowing.
  for (const text of ["I'd like to end the session here.", "Let's stop here for tonight.", "That's all for today — end session.", "I think I'll stop the game here."]) {
    assert.equal(isEnd(text), true, text);
    assert.equal(endsSession(text), true, text);
  }
});

test("item 5: the record's misread ends are not ends — COMBAT_2's «(Out of game: heading back over the bridge…)» and SAME_WORLD_1's two lines in the fiction", () => {
  const entries = Object.entries(RECORD.notEnds);
  assert.equal(entries.length, 3);
  for (const [where, text] of entries) {
    assert.match(text, END_SESSION, `the old rule misread it: ${where}`);
    assert.equal(endsSession(text), false, where);
  }
  assert.match(RECORD.notEnds["CW-opus t13 (COMBAT_2, first attempt): «(Out of game: heading back over the bridge…)»"], /^He walks them back down toward the bridge/);
});

test("item 5 in a session: «game over» inside dialogue does not end it; a plain «I'd like to end the session here.» does", async () => {
  const dialogue = "\"It's game over for you, Rask,\" James says, low and even, and sets the stolen ledger on the table between them where the lamplight falls on its torn spine. He waits for the smuggler's eyes to drop to it, then keeps his own hand flat on the cover and asks who paid for the second boat.";
  assert.ok(dialogue.split(/\s+/).length > SHORT_END_WORDS);
  assert.match(dialogue, END_SESSION, "the old rule would have closed the session here");
  const { record, dm } = await playLines(["I walk into the Low Lantern.", dialogue, "I'd like to end the session here.", "note"], 4);
  assert.deepEqual(record.turns.map((t) => t.kind), ["action", "action", "end"]);
  assert.equal(record.ended.reason, "player");
  assert.equal(record.ended.at, 3);
  assert.ok(dm.calls.some((call) => call.mode === "game" && call.text === dialogue), "the dialogue went to the DM as the turn it is");
});

// ---- item 6: the door is a standalone final line -------------------------------------------------------------------

test("item 6: «[END]» is the door only as the whole of the last non-empty line; a mention is text (the record's lines)", () => {
  assert.equal(isDoor("[END]"), true);
  assert.equal(isDoor("Goodnight, Mags.\n\n[END]"), true, "after the last words, on its own line");
  assert.equal(isDoor("Goodnight, Mags.\n\n  [ END ]  \n\n"), true, "spaces and trailing empty lines");
  assert.equal(isDoor("[end]"), true);
  for (const mention of ["I'm not writing [END] today", "you can write [END] whenever you like", "Just “[END]” — like a closed door", "[END] can wait"]) {
    assert.ok(RECORD.doorMentions.includes(mention), mention);
    assert.equal(isDoor(mention), false, mention);
    assert.equal(endsSession(mention), false, mention);
  }
  assert.equal(isDoor("[END]\n\nNo — one more thing: I ask Mags about the boat."), false, "not the last line");
  assert.equal(isDoor("Goodnight. [END]"), false, "on a line with words");
  assert.equal(isDoor(""), false);
  assert.equal(endsSession("I bank the fire and sleep.\n\n[END]"), true, "the door ends the session whatever the words before it");
});

test("item 6 in a session: an [END] mention is played as text; the door alone on the last line ends it", async () => {
  const mention = "I'm not writing [END] today. I take the lamp and go down to the cellar to see what Rask hid behind the casks.";
  const { record, dm } = await playLines(["I walk into the Low Lantern.", mention, "I bar the door behind me.\n\n[END]", "note"], 4);
  assert.deepEqual(record.turns.map((t) => t.kind), ["action", "action", "end"]);
  assert.equal(record.ended.reason, "player");
  assert.ok(dm.calls.some((call) => call.mode === "game" && call.text === mention), "the mention reached the DM as the turn it is");
  assert.ok(!dm.calls.some((call) => /bar the door/.test(call.text)), "the door's message is the end, not a turn");
});
