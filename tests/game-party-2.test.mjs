// Game party 2 (docs/stages/GAME_PARTY_2.md at bbdee5fb; Mandate issue #1; POLICY v1): the harness on the mocked host — the
// door at the multi-hero table (ROOM-1), the routes (Sol and Astra through OpenRouter pinned to OpenAI with no fallback;
// nothing to OpenAI or the Console), the relay's paraphrase at a PARTY_2 table, the three situations' notes (S1's three
// prices identical but the cost; S2's letter by the coin; S3's failure by the DM's die), and S2's privacy on the app with
// scripted providers: the letter on the holder's screen only, the DM-only note in the DM's requests, the holder's own
// after-question.
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const frozen = await import("../scripts/game-party-2/frozen.mjs");
const door = await import("../scripts/lib/door.mjs");
const party1 = await import("../scripts/game-party-1/frozen.mjs");
const players = await import("../scripts/game-player-1/players.mjs");
const paid = await import("../scripts/game-player-1/paid.mjs");
const table = await import("../scripts/multi-hero-1/table.mjs");
const report = await import("../scripts/game-party-2/report.mjs");

test("the door (ROOM-1, carried in byte for byte): [END] alone on the last non-empty line; a mention is text; the multi-hero table reads it through game-party-1's isEnd", async () => {
  assert.ok(door.isDoor("I go up to bed.\n\n[END]") && door.isDoor("**[END]**") && !door.isDoor("I won't write [END] tonight.") && !door.isDoor("I go. [END]"));
  const mh = await import("../scripts/multi-hero-1/frozen.mjs");
  assert.equal(mh.isEnd, party1.isEnd, "the multi-hero table reads the door through game-party-1's isEnd");
  assert.ok(party1.isEnd("I leave.\n[END]") && !party1.isEnd("You can write [END] whenever you like."));
  assert.equal(party1.withoutEnd("I leave.\n[END]"), "I leave.");
  assert.equal(door.asksAfter("[END]"), false);
  assert.equal(door.asksAfter("I'd leave by [END] if I had to, but it was a good table."), true);
  assert.equal(table.roundParagraph({ name: "Pell Dunmore", short: "Pell" }, { kind: "action", text: "I won't write [END] yet." }), "Pell Dunmore: I won't write [END] yet.", "a mention reaches the DM as written");
});

test("the routes (POLICY v1): Sol and Astra through OpenRouter pinned to OpenAI, allow_fallbacks false; DeepSeek on DeepInfra, its field kept; the ledger has only OpenRouter", async () => {
  assert.deepEqual([frozen.SOL.provider, frozen.SOL.model, frozen.SOL.upstream.slug], ["openrouter", "openai/gpt-6.1-sol", "openai"]);
  assert.deepEqual([frozen.ASTRA.provider, frozen.ASTRA.model, frozen.ASTRA.upstream.slug], ["openrouter", "openai/gpt-6-astra", "openai"]);
  assert.equal(frozen.ROSTER.deepseek.upstream.slug, "deepinfra");
  assert.equal(frozen.ROSTER.deepseek.keepReasoning, true);
  assert.deepEqual(frozen.CAPS, { openrouter: 60 });
  assert.deepEqual(frozen.SEATING, { T1: { bram: "sol", sefa: "deepseek", pell: "opus" }, T2: { bram: "astra", sefa: "deepseek", pell: "fable" } });
  for (const spec of [frozen.SOL, frozen.ASTRA]) {
    const sent = [];
    const fetcher = async (url, init) => { sent.push({ url, body: JSON.parse(init.body), auth: init.headers.authorization }); return new Response(JSON.stringify({ id: "gen-1", model: spec.model, provider: "OpenAI", choices: [{ message: { content: "I nod." }, finish_reason: "stop" }], usage: { prompt_tokens: 10, completion_tokens: 2, cost: 0.0001 } }), { status: 200, headers: { "content-type": "application/json" } }); };
    const r = await players.playerCall({ player: spec, system: "s", messages: [{ role: "user", content: "hi" }], keys: { openrouter: "or-key", openai: "never" }, fetcher });
    assert.equal(r.text, "I nod.");
    assert.match(sent[0].url, /^https:\/\/openrouter\.ai\/api\/v1\/chat\/completions$/);
    assert.deepEqual(sent[0].body.provider, { order: ["openai"], allow_fallbacks: false, require_parameters: true });
    assert.equal(sent[0].auth, "Bearer or-key", "the OpenRouter key, never the OpenAI key");
  }
  // The meter: a call to OpenAI or to the Console has no ledger and stops the run; OpenRouter's prices for Sol and Astra.
  for (const url of ["https://api.openai.com/v1/responses", "https://api.anthropic.com/v1/messages"]) {
    const meter = paid.createMeter({ ledgers: { openrouter: paid.createLedger("openrouter", 60, 0) }, fetcher: async () => new Response("{}") });
    await assert.rejects(meter.fetch(url, { method: "POST", body: JSON.stringify({ model: "x", max_tokens: 10 }) }), /not sent/);
    assert.match(meter.stopped, /no ledger or cap/);
  }
  assert.ok(paid.costOf("openai/gpt-6.1-sol", { input_tokens: 1e6 }) === 2 && paid.costOf("openai/gpt-6-astra", { output_tokens: 1e6 }) === 50);
});

test("the relay is Sonnet at every PARTY_2 table; the rest goes as sent", async () => {
  const { relayRewrite } = await import("../scripts/game-party-2/run.mjs");
  const relayBody = { model: "anthropic/claude-opus-5.5", system: [{ type: "text", text: "You are the game master of a tabletop role-playing game with three players, each playing one character." }], messages: [{ role: "user", content: "x" }] };
  const out = relayRewrite("https://openrouter.ai/api/v1/messages", { body: JSON.stringify(relayBody) });
  assert.equal(JSON.parse(out.body).model, "anthropic/claude-sonnet-5.5");
  const dmBody = { model: "anthropic/claude-opus-5.5", system: "You are the game master of a private, long-running campaign.", messages: [{ role: "user", content: "x" }] };
  assert.equal(JSON.parse(relayRewrite("https://openrouter.ai/api/v1/messages", { body: JSON.stringify(dmBody) }).body).model, "anthropic/claude-opus-5.5");
});

test("the situations: S1's three prices share the danger, the means and the information — only «The cost» differs; S2's letter is the holder's own; S3 has one arm; nothing in the players' prompt about the other two", () => {
  const dice = { e: "sefa", h: "pell" };
  const notes = Object.fromEntries(["S1-none", "S1-moderate", "S1-high"].map((arm) => [arm, frozen.situationNote(arm, dice)]));
  const shared = (n) => n.slice(0, n.indexOf("## The cost"));
  assert.ok(shared(notes["S1-none"]).length > 500);
  assert.equal(shared(notes["S1-moderate"]), shared(notes["S1-none"]));
  assert.equal(shared(notes["S1-high"]), shared(notes["S1-none"]));
  assert.match(notes["S1-none"], /## The cost — none/);
  assert.match(notes["S1-moderate"], /## The cost — one healing/);
  assert.match(notes["S1-high"], /## The cost — the reward[\s\S]*the 90 gold is lost/);
  assert.match(shared(notes["S1-none"]), /under Sefa Marrin, and Sefa drops/);
  assert.match(frozen.prepNote("S1", dice), /Set for each table before play/);
  assert.doesNotMatch(frozen.prepNote("S1", dice), /The cost — /);
  // S2: the holder's letter, on their screen at round 4; the DM's note has it; the other arms none.
  assert.deepEqual(frozen.deliveriesOf("S1-none", dice), []);
  const [d] = frozen.deliveriesOf("S2-high", dice);
  assert.deepEqual([d.round, d.characterId], [frozen.PLACED.from, "pell"]);
  assert.match(d.text, /^\(While the others were looking elsewhere, a boy pressed a sealed letter into your hand[\s\S]*«Pell — I owe Ostrin Vell forty gold/);
  assert.match(frozen.situationNote("S2-high", dice), /only Pell[\s\S]*Roll a d20 privately: on 11 or more[\s\S]*## The letter \(high[\s\S]*Then Vell pays nothing|There is no third way/);
  assert.match(frozen.situationNote("S2-moderate", dice), /forty gold, to whoever pays it at the counter/);
  assert.deepEqual(frozen.afterQuestionsFor("S2-high", "pell", dice), [...frozen.AFTER_QUESTIONS, frozen.HOLDER_QUESTION]);
  assert.deepEqual(frozen.afterQuestionsFor("S2-high", "bram", dice), frozen.AFTER_QUESTIONS);
  assert.deepEqual(frozen.afterQuestionsFor("S1-high", "sefa", dice), frozen.AFTER_QUESTIONS);
  assert.match(frozen.situationNote("S3", dice), /on 1–19 it goes wrong, whatever the character's own roll/);
  // The order: S1-none first (the control), T1 then T2; twelve tables.
  assert.deepEqual(frozen.ORDER.map((o) => o.key), ["S1-none-T1", "S1-none-T2", "S1-moderate-T1", "S1-moderate-T2", "S1-high-T1", "S1-high-T2", "S2-moderate-T1", "S2-moderate-T2", "S2-high-T1", "S2-high-T2", "S3-T1", "S3-T2"]);
  // The standing rule: nothing in any player's prompt about how to treat the other two; no situation text in it.
  for (const situation of ["S1", "S2", "S3"]) for (const id of ["bram", "sefa", "pell"]) {
    const p = frozen.playerSystem(situation, id, ["pell", "bram", "sefa"]);
    // Outside the shared world files (lore: «the Fist lost men and trust»), the head, the campaign file and the rules.
    const own = p.replace(/<file title="(?:The world|The Sword Coast — canon|The rules of this campaign \(D&D 5e\)|Your character — «Who are you\?»|Your character's sheet)">[\s\S]*?<\/file>/g, "");
    assert.match(own, /<file title="The campaign">/);
    assert.doesNotMatch(own, /cooperat|trust|help (?:them|the others|each other)|be kind|betray|loyal|work together|team ?work|stay together|the others? (?:should|must)/i);
    assert.doesNotMatch(p, /gives way|flooded working|sealed letter|bell-wire|The situation/);
    assert.match(p, /You may leave the table whenever you like by writing \[END\] on its own line/);
  }
});

test("S2 on the app with the mocked host: the letter on the holder's screen only, the DM-only note in the DM's requests and never on a screen, the holder's own after-question; the relay's copies sent back", () => {
  const dir = mkdtempSync(join(tmpdir(), "game-party-2-test-"));
  const code = `
    import { freeze, playTable, DRY_SCRIPT } from ${JSON.stringify(new URL("../scripts/game-party-2/run.mjs", import.meta.url).href)};
    import { companyScripted } from ${JSON.stringify(new URL("../scripts/multi-hero-1/scripted.mjs", import.meta.url).href)};
    import { writeFileSync } from "node:fs";
    const log = [];
    const host = () => companyScripted({ script: DRY_SCRIPT, log });
    await freeze({ dry: true, dir: ${JSON.stringify(join(dir, "frozen"))}, fetcher: host(), log: () => {}, coins: { S1: 0, S2: 1, S3: 2 }, dice: { e: "bram", h: "sefa", how: "test" } });
    const r = await playTable({ dir: ${JSON.stringify(join(dir, "frozen"))}, arm: "S2-high", seating: { bram: "haiku", sefa: "haiku", pell: "haiku" }, dry: true, rounds: 5, fetcher: host(), log: () => {}, out: ${JSON.stringify(join(dir, "out"))}, label: "test" });
    const dmRequests = log.filter((x) => /game master of a private, long-running/.test(JSON.stringify(x.body.system ?? ""))).map((x) => JSON.stringify(x.body));
    writeFileSync(${JSON.stringify(join(dir, "result.json"))}, JSON.stringify({ r, dmWithNote: dmRequests.filter((b) => b.includes("The situation (the owner")).length, dmWithLetter: dmRequests.filter((b) => b.includes("I owe") || b.includes("the hospice owes Ostrin Vell")).length, dm: dmRequests.length }));
    process.exit(0);`;
  execFileSync(process.execPath, ["--experimental-transform-types", "--input-type=module", "-e", code], { cwd: new URL("..", import.meta.url), encoding: "utf8", stdio: ["ignore", "ignore", "pipe"],
    env: { ...process.env, APP_ANTHROPIC_API_KEY: "", APP_OPENAI_API_KEY: "", APP_OPENROUTER_API_KEY: "", ANTHROPIC_API_KEY: "", OPENAI_API_KEY: "", OPENROUTER_API_KEY: "" }, maxBuffer: 256 * 1024 * 1024 });
  const { r, dmWithNote, dmWithLetter, dm } = JSON.parse(readFileSync(join(dir, "result.json"), "utf8"));
  const t = r.table;
  assert.equal(t.ended.reason, "rounds");
  assert.equal(t.rounds.length, 5);
  assert.deepEqual(r.frozen.dice, { e: "bram", h: "sefa", how: "test" });
  // The letter: on Sefa's round-4 screen, nowhere else; the letter check finds no hit.
  assert.deepEqual(t.deliveries.map((d) => [d.character, d.round]), [["Sefa Marrin", 4]]);
  const screensOf = (name) => t.seats.find((s) => s.character === name).screens;
  assert.ok(screensOf("Sefa Marrin").some((s) => s.purpose === "player r4" && /sealed letter[\s\S]*Sister Amath/.test(s.text)));
  for (const name of ["Bram Halloway", "Pell Dunmore"]) assert.ok(!screensOf(name).some((s) => /sealed letter|Sister Amath|forty gold/.test(s.text)), `${name}: no letter`);
  assert.deepEqual([r.letter.onHolderScreen, r.letter.hits.length, r.letter.leaks], [true, 0, 0]);
  assert.deepEqual(t.leaksRefined.hits, [], "the refined leak reading: nothing private on another screen");
  // The DM's requests carry the situation's note (with the letter) as the owner's secrets.
  assert.ok(dm > 0 && dmWithNote === dm, `the note in every DM request (${dmWithNote}/${dm})`);
  assert.ok(dmWithLetter > 0);
  // No screen shows the DM-only note.
  for (const s of t.seats) assert.ok(!s.screens.some((x) => /The situation \(the owner|Roll a d20 privately|How to run it/.test(x.text)), `${s.character}: no DM-only text`);
  // The holder's own after-question, recorded.
  assert.deepEqual(t.seats.find((s) => s.character === "Sefa Marrin").after.map((a) => a.question), [...frozen.AFTER_QUESTIONS, frozen.HOLDER_QUESTION]);
  assert.deepEqual(t.seats.find((s) => s.character === "Bram Halloway").after.map((a) => a.question), frozen.AFTER_QUESTIONS);
  // The relay (paraphrase, not verbatim): the scripted relay's first pass copies the players' words; each such screen was
  // sent back alone and came back clean — no screen keeps a run of 8 words of another player's message.
  assert.ok(r.measures.paraphrase.copiedFirst.length > 0);
  assert.ok(r.measures.paraphrase.resent.length > 0 && r.measures.paraphrase.resent.every((x) => x.accepted));
  assert.deepEqual(r.measures.paraphrase.copiedFinal, []);
  // R3's two texts: what each player wrote and what each other screen received, both in the record.
  const scene = t.rounds[1].scenes[0];
  assert.ok(scene.messages.length === 3 && Object.keys(scene.relay.screens).length === 3);
  assert.equal(report.situationRound(r), 4);
});
