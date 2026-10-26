// FIX_S4 run 1 (docs/stages/FIX_S4_RUN_1.md, docs/stages/FIX_S4_TABLE.md): the lead's part — item 1 (the table notes),
// the players' rules (items 2, 4, 11d, 11f–11j, 11m, 11n, 11p, 11q), 11c (the clock line and the act plan), 11o (no
// presentation leaks), 11t (what changed, and the session's compact summary) and the keep-list as prompt-level tests.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { loopFeedbackProvider } from "../src/lib/gameplay/dm-loop/feedback.ts";
import { runTurn } from "../src/lib/gameplay/turn-engine.ts";
import { buildDigestRequest, runDigest, NOTEBOOK_MAX_CHARS } from "../src/lib/gameplay/dm-loop/digest.ts";
import { tableNotesOf, tableNotesText, tableNotesForNotebook, TABLE_NOTES_MAX_CHARS } from "../src/lib/gameplay/dm-loop/table-notes.ts";
import { BOOKKEEPER_ROLE, DM_ROLE, PLAYERS_RULES, PLAYERS_RULES_RU, TABLE_RULES, WRITER_ROLE, dmRoleText, writerRoleText } from "../src/lib/gameplay/dm-loop/roles.ts";
import { TABLE_RULES_RU } from "../src/lib/gameplay/dm-loop/roles-ru.ts";
import { ACT_PLAN_KEY, ERRAND_OFFERED_KEY, clockFacts, clockLine, defaultActs, parseActPlan, playMinutesOf, serializeActPlan } from "../src/lib/gameplay/dm-loop/clock.ts";
import { buildPrepRequest, parsePrep, prepWrites } from "../src/lib/gameplay/dm-loop/hidden-layer.ts";
import { buildDmLoopContext } from "../src/lib/gameplay/dm-loop/context.ts";
import { createMarkupGate, presentable, stripToolMarkup } from "../src/lib/gameplay/dm-loop/presentation.ts";
import { splitLedger } from "../src/lib/gameplay/dm-loop/two-pass/prompts.ts";
import { currencyAmount } from "../src/lib/gameplay/dm-loop/receipt-text.ts";
import { sessionStanding } from "../src/lib/ui/campaign-view.ts";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const finish = (extra = {}) => ({ name: "finish_turn", arguments: { sceneKinds: ["conversation"], spotlight: [], playerMoment: false, ...extra } });
const noProvider = { plan: async () => { throw new Error("never"); }, narrate: async () => { throw new Error("never"); }, feedback: async () => { throw new Error("never"); } };
const systemText = (request) => request.system.map((block) => block.text).join("\n");
const roles = { "single DM, English": DM_ROLE, "writer, English": WRITER_ROLE, "single DM, Russian": dmRoleText(true), "writer, Russian": writerRoleText(true) };

/** An out-of-game exchange through the app's own path for a loop campaign (the turn engine with the loop's feedback provider). */
async function askOutOfGame(c, question, answer) {
  const model = createScriptedDmModel([{ text: JSON.stringify({ narration: answer, guidanceProposal: null, teachingCandidate: null }) }]);
  const d = await c.deps(model);
  const input = await c.input(question, "ooc");
  const turn = await runTurn(input, { store: d.store, provider: loopFeedbackProvider(model, "medium", noProvider) });
  return { turn, model };
}

// --- Item 1 -------------------------------------------------------------------------------------------------------

test("item 1: a «?» exchange is a table note — the next turn's prompt holds it, the digest carries it into the notebook", async () => {
  const c = await loopCampaign();
  try {
    const opening = await c.turn("I look around the gate.", [{ text: "The gate is busy. ", toolCalls: [finish()] }]);
    assert.equal(opening.result.status, "committed", JSON.stringify(c.errors));
    const question = "Does a check come up if James tells her the truth about the Lady's words?";
    const answer = "Only if James chooses to lie. Her assumption is her belief, not a fact about James — that is now a fact of James's story: the Lady's words were «give up the cards».";
    const ooc = await askOutOfGame(c, question, answer);
    assert.equal(ooc.turn.status, "committed", JSON.stringify(c.errors));
    const next = await c.turn("I tell her the truth.", [{ text: "She listens. ", toolCalls: [finish()] }]);
    assert.equal(next.result.status, "committed");
    const prompt = systemText(next.model.requests[0]);
    assert.match(prompt, /Agreed at the table — the out-of-game exchanges with the owner/);
    assert.ok(prompt.includes(question) && prompt.includes("the Lady's words were «give up the cards»"), "the exchange, both sides, in the next turn");
    assert.match(prompt, /Never say you cannot find a discussion that is here/);
    // A later «?» sees the earlier one too (the feedback context is the same dossier, public parts).
    const again = await askOutOfGame(c, "And the cat — can it hear her?", "Within a hundred feet, yes.");
    assert.ok(systemText(again.model.requests[0]).includes(question), "the second «?» answers with the first one in view");
    // The digest: the session's notes go into the request and ride in the notebook whatever the model writes.
    const source = (await c.f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) result", [c.owner, c.cid])).result;
    const sessionId = source.snapshot.publicState.current_session_id;
    const session = { id: sessionId, title: "The gate", scenes: source.snapshot.scenes.map((row) => ({ role: row.role, body: row.body })), startWorldMinutes: null, endWorldMinutes: source.runtime.worldMinutes,
      shape: { turns: 2, playMinutes: 20, form: "short" } };
    const request = buildDigestRequest(source, session, "high");
    assert.ok(request.tableNotes.includes(question.slice(0, 40)), "the carry names the exchange");
    assert.ok(request.system.at(-1).text.includes("Agreed at the table (this session)"));
    const digested = await runDigest(createScriptedDmModel([{ text: JSON.stringify({ recap: "James came to the Gate.", title: "The gate", notebook: "I set up the gate.", plans: [] }) }]), request, source, source.runtime.worldMinutes);
    assert.match(digested.digest.notebook, /^I set up the gate\.\n\nAgreed at the table \(this session\):\n- «Does a check come up/);
    // The notebook keeps its SQL ceiling: the model's part gives way, the record does not.
    const long = await runDigest(createScriptedDmModel([{ text: JSON.stringify({ recap: "r", title: "t", notebook: "x".repeat(6000), plans: [] }) }]), request, source, 0);
    assert.ok(long.digest.notebook.length <= NOTEBOOK_MAX_CHARS && long.digest.notebook.endsWith(request.tableNotes));
  } finally { await c.f.db.close(); }
});

test("item 1: the notes' shape — this session whole, earlier ones in a line, newest kept within the ceiling; the journal shows them", () => {
  const turn = (id, session, minute, input, narration, extra = {}) => ({ id, mode: "ooc", status: "committed", session_id: session, created_at: `2026-10-25T10:${String(minute).padStart(2, "0")}:00Z`, input, narration, ...extra });
  const notes = tableNotesOf([turn("a", "s1", 1, "Old question?", "Old answer."), turn("b", "s2", 2, "New question?", "New answer."),
    turn("c", "s2", 3, "Failed?", "x", { status: "failed" }), { ...turn("d", "s2", 4, "An action", "Narration."), mode: "game" },
    turn("e", null, 5, "Adventure review", "Adventure review saved.")]);
  assert.deepEqual(notes.map((note) => note.operationId), ["a", "b"], "committed out-of-game turns of a session only (not the server's metadata records), oldest first");
  const text = tableNotesText(notes, "s2").text;
  assert.match(text, /- \(an earlier session\) «Old question\?» → «Old answer\.»\n- The owner: «New question\?» — you answered: «New answer\.»/);
  assert.match(tableNotesText(notes, "s2", true).text, /^Договорились за столом/);
  const many = tableNotesOf(Array.from({ length: 40 }, (_, index) => turn(`n${index}`, "s2", index % 60, `Q${index} ${"why ".repeat(60)}`, `A${index} ${"because ".repeat(60)}`)));
  const bounded = tableNotesText(many, "s2");
  assert.ok(bounded.text.length <= TABLE_NOTES_MAX_CHARS + 600 && bounded.dropped > 0 && bounded.text.includes("Q39"), "the newest stay");
  assert.match(tableNotesForNotebook(notes, "s2"), /^Agreed at the table \(this session\):\n- «New question\?» → «New answer\.»$/);
  const journal = src("src/components/registry/journal-codex.tsx");
  assert.match(journal, /c\("Договорились за столом", "Agreed at the table"\)/);
  assert.match(journal, /loadPlay\(campaignId\)\.then\(\(play\) => \{ if \(live\) setNotes\(tableNotesOf\(play\.turns\)\); \}\)/);
});

// --- The players' rules -----------------------------------------------------------------------------------------------

test("items 2, 4, 11d, 11f–11j, 11m, 11n, 11p, 11q, 11o: the players' rules close the table rules of both roles in both languages", () => {
  assert.ok(TABLE_RULES.endsWith(PLAYERS_RULES) && TABLE_RULES_RU.endsWith(PLAYERS_RULES_RU));
  const en = [
    [/Truth is never rolled\. A check on what the hero says is called only when the hero chooses to lie/, "2"],
    [/ask the player out of game instead of rolling/, "2"], [/never ask the hero to account for a fact that is in no record/, "2"],
    [/in the same paragraph as the dice or the cards \(«Her king beats his queen; the question is hers»\); no out-of-game paragraph restates the numbers/, "4"],
    [/«No roll was needed» is one line, never a list[\s\S]*no retrospective summary after the narration/, "11d"],
    [/end the turn with one line that offers the time \(«Nothing else happens before the lamps unless you want it to\.»\)/, "11f"],
    [/never warn the hero off a road twice/, "11g"], [/watching a table is not playing at it/, "11g"],
    [/you may offer \(«You pay\?», «the card is there»\) and never execute/, "11h"], [/senses are borrowed only when the player says so/, "11h"],
    [/For every scene that carries a hint, one that carries none[\s\S]*at least one clue a session points the wrong way/, "11i"],
    [/The familiar earns what it knows\. It gives sensations[\s\S]*the player draws the conclusions/, "11j"],
    [/Every reroll, and every turn where luck visibly turned, carries one small sign[\s\S]*at the moment of temptation, not of comfort/, "11m"],
    [/routine work in one's own trade \(a scout reading a road for an ambush/, "11n"],
    [/you can name the source if the player asks «how does he know»[\s\S]*never omniscience/, "11q"],
    [/an ale barely touched stays on the table[\s\S]*money handed to the hero to hold or pass on is kept apart from his own purse/, "11p"],
    [/no tool name or call \(recall, roll, query_state\)[\s\S]*money in the story in words \(«eight silver»\), never in unit codes/, "11o"],
  ];
  const ru = [/Правду не бросают/, /в том же абзаце, что и кубики или карты/, /Заметка вне игры — одна строка/, /До фонарей больше ничего не случится/,
    /смотреть на стол — не значит за ним играть/, /никогда не исполняешь за него/, /На каждую сцену с намёком — сцена без него/, /Фамильяр зарабатывает то, что знает/,
    /Покровитель рядом/, /Сложность — по умению/, /никогда — всеведение/, /едва тронутая кружка эля/, /никогда кодами единиц/];
  for (const [name, text] of Object.entries(roles)) {
    if (name.endsWith("Russian")) for (const rule of ru) assert.match(text, rule, `${name}: ${rule}`);
    else for (const [rule, item] of en) assert.match(text, rule, `${name}: item ${item}`);
  }
  assert.match(BOOKKEEPER_ROLE, /Possession is what happened \(FIX_S4 11p\): an item enters a person's inventory only when the narration or the ledger says they took, bought or were given it/);
  assert.match(BOOKKEEPER_ROLE, /«held for <owner>»/);
});

test("the keep-list as prompt-level tests: what the players said worked stays a rule in every role text", () => {
  const keep = {
    "a failed lie still earns its scene": [/a failed lie or a failed check still earns its scene/, /проваленная ложь или проваленная проверка всё равно зарабатывает свою сцену/],
    "the cat speaks in sensations": [/It gives sensations — a smell, a sight, a posture, fear, «two», «wrong»/, /Он даёт ощущения — запах, вид, позу, страх, «двое», «не так»/],
    "the die is not softened": [/the die is never softened/, /кубик никогда не смягчают/],
    "rules flagged before they bite": [/the threat is shown before it lands, and so are the rules — a familiar's range, a spell's hour, a short rest — flagged before they bite/, /и правила тоже — дальность фамильяра, час заклинания, короткий отдых — называют до того, как они укусят/],
    "silence where the scene speaks": [/silence where the scene speaks: stop when the moment has landed/, /тишина там, где говорит сцена: остановись, когда миг состоялся/],
    "consequences on the world's schedule": [/consequences arrive on the world's own schedule, not the hero's/, /последствия приходят по расписанию мира, а не героя/],
    "NPCs with their own limit": [/people keep their own business and their own limit — helping someone does not make them obedient, and nobody warms up unearned/, /у людей свои дела и свой предел — помощь не делает человека послушным, и никто не теплеет незаслуженно/],
  };
  for (const [name, text] of Object.entries(roles)) for (const [what, [enRule, ruRule]] of Object.entries(keep))
    assert.match(text, name.endsWith("Russian") ? ruRule : enRule, `${name}: ${what}`);
  // The rules the keep-list rests on, from before this stage, still stand.
  for (const text of [DM_ROLE, WRITER_ROLE]) {
    assert.match(text, /NPCs may refuse; failure is canon; luck is not free/);
    assert.match(text, /The world moves for game time only, never for the player's real absence/);
    assert.match(text, /they are not there to serve the plot/);
  }
  // No fix dulls them: the new rules never ask to soften a die, to hurry the player, or to speak for the hero.
  assert.doesNotMatch(PLAYERS_RULES, /soften the|go easy|hurry the player|shorten the player's day/i);
});

// --- 11c ---------------------------------------------------------------------------------------------------------

test("11c: the prep asks for a length, the errand and an act plan; the plan is DM-private and the owner's split is the default", async () => {
  assert.deepEqual(defaultActs(70).map((act) => act.untilTurn), [15, 40, 60, 70]);
  assert.equal(parseActPlan({}), null, "no length, no plan, no clock");
  const plan = parseActPlan({ length: { hours: 7 }, errand: "Tymora's errand: recover the Marked Deck", acts: [{ untilTurn: 15, aim: "the errand offered", converge: "every thread leads to the Lady's Hall" }, { untilTurn: 40, aim: "the crew" }, { untilTurn: 60, aim: "the heist" }, { untilTurn: 99, aim: "the reckoning" }] });
  assert.equal(plan.turns, 70);
  assert.deepEqual(plan.acts.map((act) => act.untilTurn), [15, 40, 60, 70], "the last act ends at the length");
  assert.deepEqual(parseActPlan({ length: { hours: 7 }, acts: [{ untilTurn: 40 }, { untilTurn: 15 }] }).acts.map((act) => act.untilTurn), [15, 40, 60, 70], "a plan whose budgets fall keeps the owner's split");
  const prep = parsePrep(JSON.stringify({ truth: "The Lady is being robbed.", length: { hours: 7, turns: 70 }, errand: "recover the Marked Deck", acts: [{ untilTurn: 15, aim: "offered" }, { untilTurn: 70, aim: "the rest" }],
    banTest: "Ashe needs his eye at the barrel", patronMoment: "the coin burns when the deck is dealt", falseLead: "the grey woman is only a debt collector" }), "en");
  assert.match(prep.text, /The act plan \(yours alone; the player sees only the act number\): about 7 hours, ~70 turns; the errand: recover the Marked Deck/);
  assert.match(prep.text, /The hero's weakness tested \(next session, for a reason, never a trap\): Ashe needs his eye/);
  assert.match(prep.text, /The patron's moment \(at a temptation, not a comfort\): the coin burns/);
  assert.match(prep.text, /The next session's false lead: the grey woman/);
  const writes = prepWrites(prep, { privateState: {} });
  const stored = writes.find((row) => row.key === ACT_PLAN_KEY);
  assert.equal(stored.kind, "fact");
  assert.deepEqual(parseActPlan(JSON.parse(stored.value)).acts.map((act) => act.untilTurn), [15, 70]);
  const c = await loopCampaign();
  try {
    const source = (await c.f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) result", [c.owner, c.cid])).result;
    const ask = buildPrepRequest(source, "high").messages[0].text;
    assert.match(ask, /"length": \{ "hours": <the hours of play the owner's premise or wishes describe/);
    assert.match(ask, /act 1: the errand OFFERED \(put in front of the player, never forced; he may walk past\)/);
    assert.match(ask, /"converge": "how any thread the player may pick in this act leads toward the errand — never how to bring him back"/);
    assert.match(ask, /act 1 to about turn 15 \(the errand offered\), act 2 to about 40[\s\S]*act 3 to about 60[\s\S]*act 4 the reckoning/);
  } finally { await c.f.db.close(); }
});

test("11c: the clock line before every turn — turn of ~N, the act due, the errand, real time at the table; the lag's three tools; never in the player's view", async () => {
  const c = await loopCampaign();
  try {
    const plan = { hours: 7, turns: 70, errand: "recover the Marked Deck", acts: defaultActs(70).map((act) => ({ ...act, untilTurn: act.act === 1 ? 2 : act.untilTurn })) };
    const timeline = (await (await c.deps(createScriptedDmModel([]))).store.readPlay(c.cid)).timeline;
    await c.dossier("private_notes", { set: [{ kind: "fact", key: ACT_PLAN_KEY, value: serializeActPlan(plan) }], remove: [] }, timeline);
    for (const text of ["One.", "Two.", "Three."]) assert.equal((await c.turn(text, [{ text: `${text} `, toolCalls: [finish()] }])).result.status, "committed");
    const fourth = await c.turn("Four.", [{ text: "Four. ", toolCalls: [finish()] }]);
    const prompt = systemText(fourth.model.requests[0]);
    assert.match(prompt, /The clock \(yours, not the player's\): turn 4 of ~70 \(about 7 hours of play\); now act 2 — the middle: the people and the means, to turn 40; act 1 was due by turn 2 — 2 turn\(s\) behind; the errand \(«recover the Marked Deck»\) has not been offered; for the player this session has run \d+ min, session 1, \d+ min at the table in all\./);
    assert.match(prompt, /You never push the player: offer, converge the threads, ask about time/, "a lag of five turns or less is normal");
    // The lag past the grace: the three tools, never by shortening the player's day.
    for (const text of ["5", "6", "7", "8"]) await c.turn(text, [{ text: `${text}. `, toolCalls: [finish()] }]);
    const late = await c.turn("9", [{ text: "Nine. ", toolCalls: [finish({ errandOffered: true })] }]);
    const latePrompt = systemText(late.model.requests[0]);
    assert.match(latePrompt, /7 turn\(s\) behind[\s\S]*The lag is yours to answer in this turn, with one of three tools and never by shortening the player's day: offer, do not deliver[\s\S]*converge, do not compete[\s\S]*ask about time/);
    // finish_turn errandOffered: the first offer is recorded once; the line counts from it.
    const after = await c.turn("10", [{ text: "Ten. ", toolCalls: [finish({ errandOffered: true })] }]);
    assert.match(systemText(after.model.requests[0]), /the errand \(«recover the Marked Deck»\) was offered on turn 9;/);
    const source = (await c.f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) result", [c.owner, c.cid])).result;
    assert.equal(JSON.parse(source.privateState.fact[ERRAND_OFFERED_KEY]).operationId, late.input.operationId, "the first offer stands");
    assert.equal(clockFacts(source, null).act.act, 2);
    // The plan never reaches the player's or the out-of-game view (the feedback source is public), nor the private notes list twice.
    const ooc = await askOutOfGame(c, "How long is this adventure?", "About seven hours.");
    assert.doesNotMatch(systemText(ooc.model.requests[0]), /The clock \(yours|recover the Marked Deck/);
    assert.doesNotMatch(prompt, /fact act_plan/, "the plan is the clock's, not a private note in the list");
  } finally { await c.f.db.close(); }
});

test("11c: a pure-simulation campaign has no plan and no clock line (Table C, the control); real minutes count as the digest counts them", async () => {
  assert.equal(playMinutesOf(["2026-10-25T10:00:00Z", "2026-10-25T10:10:00Z", "2026-10-25T13:00:00Z", "2026-10-25T13:05:00Z"]), 10 + 15 + 5, "a long pause is not play");
  const c = await loopCampaign();
  try {
    const timeline = (await (await c.deps(createScriptedDmModel([]))).store.readPlay(c.cid)).timeline;
    await c.dossier("private_notes", { set: [{ kind: "fact", key: ACT_PLAN_KEY, value: serializeActPlan(parseActPlan({ length: { hours: 7 } })) }], remove: [] }, timeline);
    const source = (await c.f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) result", [c.owner, c.cid])).result;
    const input = await c.input("Look.");
    assert.match(buildDmLoopContext(source, input).parts.now, /The clock \(yours, not the player's\): turn 1 of ~70/);
    assert.doesNotMatch(buildDmLoopContext({ ...source, dmOptions: { pureSimulation: true } }, input).parts.now, /The clock/);
    assert.equal(clockLine({ ...source, privateState: {} }, null), "", "no plan, no line");
  } finally { await c.f.db.close(); }
});

// --- 11o ---------------------------------------------------------------------------------------------------------

test("11o: no tool call written as text, no backticked tool name and no coin code reaches the player's screen", async () => {
  // B-astra t11 of game player 1, as it reached the screen.
  const leaked = "The doorman is still waiting.\n\n<invoke name=\"recall\">\n<parameter name=\"query\">Copper Kettle</parameter>\n</invoke>  *(Out of game: that roll failed.)*\n\nI checked `recall` first.";
  const clean = stripToolMarkup(leaked);
  assert.doesNotMatch(clean, /<invoke|<parameter|`recall`/);
  assert.match(clean, /The doorman is still waiting\.\n\n {2}\*\(Out of game: that roll failed\.\)\*\n\nI checked recall first\./);
  assert.equal(stripToolMarkup("a < b, and <i>a tag</i> of the story's own"), "a < b, and <i>a tag</i> of the story's own", "nothing else is touched");
  // The stream: the gate drops the block across any split of the deltas.
  for (const size of [1, 2, 3, 7, 50]) {
    const gate = createMarkupGate();
    let shown = "";
    for (let at = 0; at < leaked.length; at += size) shown += gate.push(leaked.slice(at, at + size));
    shown += gate.flush();
    assert.doesNotMatch(shown, /<invoke|<parameter|Copper Kettle<\/parameter>/, `split ${size}`);
    assert.match(shown, /^The doorman is still waiting\.\n\n {2}\*\(Out of game/);
  }
  async function* events() { yield { type: "text_delta", text: "He nods. <inv" }; yield { type: "text_delta", text: "oke name=\"roll\">x</invoke>Then `roll`." }; yield { type: "stop", reason: "end_turn" }; }
  const out = [];
  for await (const event of presentable(events())) out.push(event);
  assert.equal(out.filter((event) => event.type === "text_delta").map((event) => event.text).join(""), "He nods. Then roll.");
  assert.equal(out.at(-1).type, "stop");
  assert.equal(splitLedger("Story <invoke name=\"recall\"><parameter name=\"q\">x</parameter></invoke>end.<ledger>\ntime — 5 minutes\n</ledger>").narration, "Story end.");
  // Coins in words on the chips (Table A's «+8 sps»).
  assert.equal(currencyAmount("en", 8, "sp"), "8 silver");
  assert.equal(currencyAmount("en", 1, "gp"), "1 gold");
  assert.equal(currencyAmount("ru", 8, "см"), "8 серебряных");
  assert.equal(currencyAmount("en", 5, "silver piece"), "5 silver pieces", "a world's own word is inflected as before");
  assert.match(src("src/lib/gameplay/dm-loop/loop.ts"), /for await \(const event of presentable\(model\.stream\(request\)\)\)/);
  assert.match(src("src/lib/gameplay/dm-loop/two-pass/runtime.ts"), /for await \(const event of presentable\(model\.stream\(body\)\)\)/);
});

test("11o: the money chip of a turn reads in words", async () => {
  const c = await loopCampaign();
  try {
    const played = await c.turn("I take the change.", [{ text: "Jory counts out the change. ", toolCalls: [
      { name: "money", arguments: { action: "grant", toRef: c.hero, amount: 8, currency: "sp", reason: "Jory's change", sourceRef: "here" } }, finish()] }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const player = (played.result.changes ?? []).map((change) => change.player ?? change.summary).join("\n");
    assert.match(player, /8 silver/, player);
    assert.doesNotMatch(player, /\bsps?\b/);
  } finally { await c.f.db.close(); }
});

// --- 11t ---------------------------------------------------------------------------------------------------------

test("11t: one compact summary at the session's end — resources, money, promises — from the public records", () => {
  const data = { campaign: { language: "en" }, entities: [{ id: "h", kind: "player", name: "James", hp: 30, max_hp: 38, resources: { spell_slots_3: 1, spell_slots_3_max: 2, currency_gp: 349, currency_sp: 8 } }],
    quests: [{ id: "q1", title: "Bring Mags word", status: "open", detail: { kind: "promise" }, updated_at: "2026-10-25T10:00:00Z" }, { id: "q2", title: "Who is the grey woman?", status: "open", detail: { kind: "thread" }, updated_at: "2026-10-25T10:00:00Z" }],
    sessions: [], scenes: [] };
  const standing = sessionStanding(data, ["What does Tymora want?"]);
  assert.match(standing.resources, /^HP 30\/38 · /);
  assert.match(standing.money, /349 gold pieces, 8 silver pieces/);
  assert.deepEqual(standing.questions, ["What does Tymora want?"]);
  assert.match(src("src/components/registry/session-end.tsx"), /c\("Где всё стоит", "Where things stand"\)/);
});

test("the turn's prompt without a «?» or a plan is as before (no empty headers)", async () => {
  const c = await loopCampaign();
  try {
    const played = await c.turn("Look.", [{ text: "Quiet. ", toolCalls: [finish()] }]);
    const prompt = systemText(played.model.requests[0]);
    assert.doesNotMatch(prompt, /Agreed at the table|The clock \(yours/);
    assert.ok(randomUUID());
  } finally { await c.f.db.close(); }
});
