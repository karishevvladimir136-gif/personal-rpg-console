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

// ---- item 7: the waiting-button line at cards ----------------------------------------------------------------------

/** A table whose first action pauses on one card (die 13, total 20); «?» and prose answers keep it waiting. */
function cardTable() {
  const calls = [];
  const check = { id: "c1", kind: "skill", actorName: "James Worgen", reason: "Persuasion: Mags lets the debt wait", dice: [13], kept: 13, modifier: 7, total: 20, success: true, dc: 15,
    difficulty: null, advantage: "normal", interactive: true, canReroll: true, rollNumber: 1, addends: [{ source: "sheet: Persuasion +7", value: 7 }] };
  const paused = { id: "op1", session_id: "s1", status: "awaiting_confirmation", narration: null, told: "Mags folds her arms.", checks: [check], changes: [], canRetry: false };
  let actions = 0;
  return { calls, views,
    readView: plainTable().readView,
    submit: async (text, mode) => {
      calls.push({ text, mode });
      if (mode === "ooc") return { input: { operationId: `ooc${calls.length}` }, turn: { status: "committed", mode: "ooc", narration: "The card stands." } };
      if (actions++ > 0) return { input: { operationId: `op${calls.length}` }, turn: { status: "committed", narration: "The night goes on.", checks: [], changes: [] } };
      return { input: { operationId: "op1" }, turn: paused };
    },
    readTurn: async () => paused,
    press: async (input, action) => { calls.push({ action }); return { ...paused, status: "committed", narration: "Mags lets it wait.", checks: [{ ...check, canReroll: false }] }; },
  };
}

test("item 7: every note the DM gets at a waiting card names the button it waits for — before the tap [Roll the die], after it [Onward] or an allowed reroll — never the die", async () => {
  const { CARD_WAIT_LINES } = await import("../scripts/game-player-1/screen.mjs");
  assert.match(CARD_WAIT_LINES.roll, /the card waits for its player to press \[Roll the die\]\.$/);
  assert.match(CARD_WAIT_LINES.decide, /the card waits for its player to press \[Onward\] or ask for an allowed reroll\.$/);
  for (const line of Object.values(CARD_WAIT_LINES)) assert.doesNotMatch(line, /\d/, "no number in the line");
  const dm = cardTable();
  const lines = ["I ask Mags to let the debt wait a week.",
    "? Does the card count the Persuasion on my sheet?",                              // before the tap
    "James keeps his voice low and his hands flat on the table.",                     // prose, before the tap
    "roll",
    "? Is a reroll worth it here?",                                                   // after the tap
    "\"A week, Mags. You have my word,\" James says.",                               // prose, after the tap
    "[Onward]\n\n(Out of game: I'll keep the reroll.)",                              // text beside a press
    "I order a drink."];
  const record = await runSession({ key: "A-opus", table: "A", player: PLAYERS.opus, dm, meter: meterOf(lines), keys: { anthropic: "k", openai: "k" }, turns: 2, sleep: async () => {} });
  assert.equal(record.turns[0].status, "committed");
  const notes = dm.calls.filter((call) => call.mode === "ooc").map((call) => call.text);
  assert.equal(notes.length, 5);
  assert.ok(notes[0].startsWith(`(At the roll card: ${CARD_WAIT_LINES.roll}) Does the card count`), notes[0]);
  assert.ok(notes[1].includes(CARD_WAIT_LINES.roll) && notes[1].includes("instead of pressing one of its buttons"), notes[1]);
  assert.ok(notes[2].startsWith(`(At the roll card: ${CARD_WAIT_LINES.decide}) Is a reroll worth it here?`), notes[2]);
  assert.ok(notes[3].includes(CARD_WAIT_LINES.decide), notes[3]);
  assert.ok(notes[4].startsWith(`(At the roll card: ${CARD_WAIT_LINES.decide}) (Out of game: I'll keep the reroll.)`), notes[4]);
  for (const note of notes) assert.doesNotMatch(note, /\b(?:13|20)\b|Die:/, "never the die or the total");
  assert.deepEqual(dm.calls.filter((call) => call.action).map((call) => call.action), ["continue"]);
});

// ---- item 8 and the pacing rules: the DM guide note ------------------------------------------------------------------

test("item 8: the DM guide note says a question put to the hero does not hold the scene — in every turn's context, after the owner's guide", async () => {
  const { loopCampaign } = await import("./dm-loop-fixture.mjs");
  const { buildDmLoopContext } = await import("../src/lib/gameplay/dm-loop/context.ts");
  const { GUIDE_NOTE_HEADER, UNANSWERED_QUESTION_LINE } = await import("../src/lib/gameplay/dm-loop/guide-note.ts");
  assert.match(UNANSWERED_QUESTION_LINE, /^A question put to the hero by anyone .* does not hold the scene: the scene moves on what was done, and a question the hero leaves unanswered is simply still open next turn\.$/);
  assert.doesNotMatch(UNANSWERED_QUESTION_LINE, /\bround\b|\bplayers\b|company/, "worded for one hero, not a company table");
  const c = await loopCampaign();
  try {
    const source = (await c.f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) result", [c.owner, c.cid])).result;
    const input = await c.input("I ask the ferryman his price.");
    for (const role of ["dm", "writer"]) {
      const world = buildDmLoopContext(source, input, { role }).parts.world;
      assert.ok(world.includes(`${GUIDE_NOTE_HEADER}\n${UNANSWERED_QUESTION_LINE}`), role);
    }
    const system = buildDmLoopContext(source, input).system.map((block) => block.text).join("\n\n");
    assert.ok(system.includes(UNANSWERED_QUESTION_LINE), "the DM reads it in the system layers");
  } finally { await c.f.db.close(); }
});

test("pacingRules: the DM guide note carries the owner's pacing rules when on (the default for every campaign) and not when off; plain words, ≤ 180", async () => {
  const { guideNote, PACING_RULES, UNANSWERED_QUESTION_LINE } = await import("../src/lib/gameplay/dm-loop/guide-note.ts");
  const { DM_OPTION_DEFAULTS, parseDmOptions, parseDmOptionsPatch } = await import("../src/lib/gameplay/dm-loop/options.ts");
  const { wordsIn } = await import("../scripts/game-player-1/measures.mjs");
  assert.ok(wordsIn(PACING_RULES).length <= 180, `${wordsIn(PACING_RULES).length} words`);
  for (const rule of [/A mystery is an exchange: every turn the player spends on it returns one real answer and opens at most one new question/,
    /The brief's promise appears in session one as a fact of the world; by turn ten/, /A long hook moves every five turns: the debt, the ban, the name/,
    /A ban must cost: show the player the thing refused/, /Narrate every roll in one line before the next scene/, /A spent reroll is felt in the world/,
    /Never hold the scene on one person's answer/, /One turn in three carries no hook/, /A foe whose first line offers terms gives no fight/,
    /End of day is not end of session/, /Do not open a new thread while more than two hang/, /Friction is pacing: people resist/]) assert.match(PACING_RULES, rule);
  // The option: on by default (a campaign that never saved it has it), a boolean, nothing else.
  assert.equal(DM_OPTION_DEFAULTS.pacingRules, true);
  assert.equal(parseDmOptions({}).pacingRules, true);
  assert.equal(parseDmOptions({ pacingRules: false }).pacingRules, false);
  assert.equal(parseDmOptions({ pacingRules: "off" }).pacingRules, true, "an unknown value is ignored");
  assert.deepEqual(parseDmOptionsPatch({ pacingRules: false }), { pacingRules: false });
  assert.throws(() => parseDmOptionsPatch({ pacingRules: 0 }), /options\.pacingRules is not allowed/);
  assert.ok(guideNote({ pacingRules: true }).includes(PACING_RULES));
  assert.ok(!guideNote({ pacingRules: false }).includes(PACING_RULES));
  assert.ok(guideNote({ pacingRules: false }).includes(UNANSWERED_QUESTION_LINE), "off removes only the pacing block");
  // The owner's switch: Settings → DM, on unless saved off, saving the one option.
  const screen = readFileSync(new URL("../src/components/registry/settings-screen.tsx", import.meta.url), "utf8");
  assert.match(screen, /<Switch title=\{c\("Правила темпа", "Pacing rules"\)\}/);
  assert.match(screen, /checked=\{current\?\.options\.pacingRules \?\? true\}[^\n]*saveDepth\(\{ options: \{ pacingRules: value \} \}\)/);

  // On the real turn path: a new campaign's DM request carries the block; after the owner switches it off, the next does not.
  const { loopCampaign } = await import("./dm-loop-fixture.mjs");
  const finish = { name: "finish_turn", arguments: { sceneKinds: ["conversation"], spotlight: [], playerMoment: false } };
  const systemText = (request) => request.system.map((block) => block.text).join("\n");
  const c = await loopCampaign();
  try {
    const on = await c.turn("I ask the ferryman his price.", [{ text: "He names two silver.", toolCalls: [finish] }]);
    assert.equal(on.result.status, "committed", JSON.stringify(c.errors));
    assert.ok(systemText(on.model.requests[0]).includes(PACING_RULES), "on by default");
    const before = await c.settings.read();
    assert.equal(before.options.pacingRules, true);
    const saved = await c.settings.save({ expectedRevision: before.revision, runtime: "dm-loop-v1", dmTurn: before.dmTurn, options: { pacingRules: false } });
    assert.equal(saved.options.pacingRules, false);
    const off = await c.turn("I pay him and step aboard.", [{ text: "The ferry pushes off.", toolCalls: [finish] }]);
    assert.equal(off.result.status, "committed", JSON.stringify(c.errors));
    assert.ok(!systemText(off.model.requests[0]).includes("Pacing — the owner's rules"), "off: no pacing block");
    assert.ok(systemText(off.model.requests[0]).includes(UNANSWERED_QUESTION_LINE), "the guide note's standing line stays");
  } finally { await c.f.db.close(); }
});

// ---- the smoke on the mocked host: six turns on the app's own code, then the door -----------------------------------

test("the smoke on the mocked host (a child process; no network, no key): the sheet's bonus on the card, «?» and prose under it, a refused reroll, «game over» in dialogue and an [END] mention played, the door ends it", { timeout: 300_000 }, async () => {
  const { execFileSync } = await import("node:child_process");
  const script = `const { smoke, smokeMarkdown } = await import(${JSON.stringify(new URL("../scripts/play-fixes-1/smoke.mjs", import.meta.url).href)});
    const r = await smoke({});
    console.log("RESULT " + JSON.stringify({ record: r.record, notes: r.dmRequests.filter((q) => /out-of-game question/.test(q.system)).length,
      guide: r.dmRequests.some((q) => q.system.includes("Pacing — the owner's rules from the table:")), page: smokeMarkdown(r), options: r.options }));`;
  const stdout = execFileSync(process.execPath, ["--experimental-transform-types", "--input-type=module", "-e", script], { cwd: new URL("..", import.meta.url), encoding: "utf8",
    env: { ...process.env, APP_ANTHROPIC_API_KEY: "", APP_OPENAI_API_KEY: "", ANTHROPIC_API_KEY: "", OPENAI_API_KEY: "" }, maxBuffer: 64 * 1024 * 1024 });
  const { record, notes, guide, page, options } = JSON.parse(stdout.split("\n").find((line) => line.startsWith("RESULT ")).slice(7));
  const { GAME_OVER_LINE, END_MENTION, PROSE_AT_CARD } = await import("../scripts/play-fixes-1/smoke.mjs");
  assert.equal(options.pacingRules, true, "the owner's default");
  assert.equal(options.companionRolls, "dm", "the owner's default");
  assert.ok(guide, "the DM's requests carry the pacing rules");
  assert.deepEqual(record.turns.map((t) => t.kind), ["action", "action", "action", "action", "question", "action", "end"]);
  assert.deepEqual(record.turns.slice(0, 6).map((t) => t.status), ["committed", "committed", "committed", "committed", "committed", "committed"]);
  assert.equal(record.ended.reason, "player", "the door ended it");
  assert.equal(record.ended.at, 7);
  const screens = record.screens.join("\n");
  // t1: the sheet's own number on the card; a «?» and prose under it, each answered while the card waited.
  assert.match(screens, /\[Roll card\] James Worgen · Skill check — Persuasion: Mags lets the debt wait\nWhat adds to the die: \+7 Persuasion\n(?:[^\n]*\n)?Rerolls left: 2 of 2 this session/);
  const t1 = record.turns[0].presses.map((p) => p.button ?? (p.prose ? "prose" : p.question ? "?" : p.swallowed ? "swallowed" : null));
  assert.deepEqual(t1, ["?", "prose", "Roll the die", "Onward"]);
  assert.equal(record.turns[0].presses[1].text, PROSE_AT_CARD);
  assert.match(screens, /\(The card waits for \[Roll the die\]\.\)\n\n\[Roll the die\]/);
  assert.ok(notes >= 3, "the «?», the prose and the plain «?» reached the DM out of game");
  // t2: the reroll the screen offered on the cat's card, refused by the server with its reason; the card still waits.
  const t2 = record.turns[1];
  assert.deepEqual(t2.presses.map((p) => p.button ?? (p.swallowed ? "swallowed" : null)), ["Roll the die", "Roll the die", "swallowed", "Onward"]);
  assert.match(t2.presses[2].reason, /^the server refused the reroll of «Stealth: Sixpence slips into the yard» \(validation\); the card still waits$/);
  assert.match(screens, /\(Nothing was sent: the turn waits for the card — the server refused the reroll[^\n]*\n\n[^]*?\[Roll card\] Sixpence · Skill check — Stealth: Sixpence slips into the yard/);
  // t3, t4: played as turns, not ends.
  assert.equal(record.turns[2].message, GAME_OVER_LINE);
  assert.equal(record.turns[3].message, END_MENTION);
  assert.match(page, /Ended by: \*\*player\*\* at message 7/);
});
