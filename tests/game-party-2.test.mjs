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
  assert.deepEqual(frozen.CAPS, { openrouter: 240 }); // the amendment of 2026-11-08 17:35 LA ($60 at issue, $120 on 2026-11-01)
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
  // v2 (after the Haiku dry run): the danger is placed by round 6 at the latest, wherever the character is — not only
  // «on the way back»; S3's failure likewise.
  assert.match(shared(notes["S1-none"]), /In round 5 — or in round 4 or 6 if the story offers a better moment there, but never later than round 6, whatever the company is doing and wherever Sefa is/);
  assert.doesNotMatch(shared(notes["S1-none"]), /On the way back/);
  assert.match(frozen.situationNote("S3", dice), /if the company has made none by round 6, then the first act any character makes toward the warehouse, its men or the box in round 6 or after counts as the attempt/);
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
    const from = log.length;
    const r = await playTable({ dir: ${JSON.stringify(join(dir, "frozen"))}, arm: "S2-high", seating: { bram: "haiku", sefa: "haiku", pell: "haiku" }, dry: true, rounds: 5, fetcher: host(), log: () => {}, out: ${JSON.stringify(join(dir, "out"))}, label: "test" });
    const dmRequests = log.slice(from).filter((x) => /game master of a private, long-running/.test(JSON.stringify(x.body.system ?? ""))).map((x) => JSON.stringify(x.body));
    writeFileSync(${JSON.stringify(join(dir, "result.json"))}, JSON.stringify({ r, dmWithNote: dmRequests.filter((b) => b.includes("The situation (the owner")).length, dmWithLetter: dmRequests.filter((b) => b.includes("I owe") || b.includes("the hospice owes Ostrin Vell")).length, dm: dmRequests.length,
      a7New: dmRequests.filter((b) => b.includes("is resolved inside that character's own screen, in the same round")).length, a7Old: dmRequests.filter((b) => b.includes("A question one character leaves unanswered is not a pause")).length,
      closeNew: dmRequests.filter((b) => b.includes("The round's close belongs to the table, not to you")).length, closeOld: dmRequests.filter((b) => b.includes("When you end on a question, put it to the characters it concerns")).length,
      inputs: r.table.rounds.flatMap((x) => x.scenes.map((sc) => sc.input).filter(Boolean)) }));
    process.exit(0);`;
  execFileSync(process.execPath, ["--experimental-transform-types", "--input-type=module", "-e", code], { cwd: new URL("..", import.meta.url), encoding: "utf8", stdio: ["ignore", "ignore", "pipe"],
    env: { ...process.env, APP_ANTHROPIC_API_KEY: "", APP_OPENAI_API_KEY: "", APP_OPENROUTER_API_KEY: "", ANTHROPIC_API_KEY: "", OPENAI_API_KEY: "", OPENROUTER_API_KEY: "" }, maxBuffer: 256 * 1024 * 1024 });
  const { r, dmWithNote, dmWithLetter, dm, a7New, a7Old, closeNew, closeOld, inputs } = JSON.parse(readFileSync(join(dir, "result.json"), "utf8"));
  // The owner's A7 line (after S1-none-T1): in every narrating DM request of the table, the old sentences in none.
  assert.ok(a7New === dm && a7Old === 0, `A7: new line in ${a7New}/${dm}, old in ${a7Old}`);
  // v4 (Step 1 of the amendment of 2026-11-08 17:35 LA): the frame's close in every narrating DM request, the old sentence in none.
  assert.ok(closeNew === dm && closeOld === 0, `the close: new in ${closeNew}/${dm}, old in ${closeOld}`);
  assert.deepEqual([r.harness, r.guide?.a7], [frozen.TABLE_HARNESS, "owner 2026-11-02"]);
  // v5: every round's message to the DM closes its header with the reminder (v4: none does).
  assert.ok(inputs.length > 0 && inputs.every((x) => x.split("\n\n")[0].endsWith(` ${frozen.ROUND_REMINDER})`) === (frozen.TABLE_HARNESS === "v5")), "the v5 reminder closes every round header");
  // The table's own closing line ends every seat's round screen, the same words for each.
  for (const seat of r.table.seats) for (const sc of seat.screens.filter((x) => /^player r\d+$/.test(x.purpose)))
    assert.ok(sc.text.endsWith(frozen.CLOSE_LINE({ name: seat.character }, Number(sc.purpose.slice(8)))), `${seat.character} ${sc.purpose}: the closing line last`);
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

test("the holding tags (frozen before any paid table): the request names no family or seat; the answer is read to codes; two passes agree on codes, not on quotes", async () => {
  const score = await import("../scripts/game-party-2/score.mjs");
  const round = { n: 5, scenes: [{ members: ["Bram Halloway", "Sefa Marrin", "Pell Dunmore"], messages: [{ name: "Bram Halloway", kind: "action", text: "\"It'll cost the potion,\" I say, and I haul." }, { name: "Sefa Marrin", kind: "waiting", text: "" }, { name: "Pell Dunmore", kind: "action", text: "I hand over the potion." }], narration: "The block moves; Sefa is out." }] };
  const req = score.holdRequest(round, score.situationBrief("S1-moderate", { e: "sefa", h: "pell" }));
  assert.doesNotMatch(req.user + req.system, /\b(?:opus|fable|sol|astra|deepseek|haiku|claude|gpt|model|seat \d)\b/i);
  assert.match(req.user, /\(Waiting: not asked this round\.\)/);
  assert.match(req.user, /freeing them costs one healing/);
  const answer = (quote) => JSON.stringify({ characters: { "Bram Halloway": { price_named: quote, pays: null, maintains: 1 }, "Pell Dunmore": { pays: { for: "Sefa Marrin", what: "potion" }, maintains: 1 }, "Sefa Marrin": {} }, endangered: "saved", saved_by: ["Bram Halloway", "Pell Dunmore", "Nobody"], agreements: [], disagreement: "none", split: 0 });
  const a = score.parseHold(answer("It'll cost the potion")), b = score.parseHold(answer("cost the potion"));
  assert.equal(a.characters["Pell Dunmore"].pays.for, "Sefa Marrin");
  assert.deepEqual(a.saved_by, ["Bram Halloway", "Pell Dunmore"]);
  assert.equal(score.holdKey(a), score.holdKey(b), "quotes differ, codes agree");
  assert.equal(score.parseHold("not json"), null);
  const s2 = score.situationBrief("S2-high", { e: "bram", h: "bram" });
  assert.match(s2, /Bram Halloway — and only Bram Halloway — privately received this letter[\s\S]*Odda Brand/);
});

test("the relay, after the Haiku dry run: a reply with raw line breaks or unescaped quotes is read; two unreadable replies → each screen asked alone, never the DM's narration verbatim on every screen; the raw replies kept", async () => {
  const relayMod = await import("../scripts/multi-hero-1/relay.mjs");
  const mh = await import("../scripts/multi-hero-1/frozen.mjs");
  const raw = '{"screens": {"Pell Dunmore": "You fall.\nOsric says, "That\'s the old floor." He waits."}, "together": [["Pell Dunmore"]]}';
  assert.throws(() => JSON.parse(raw));
  assert.equal(relayMod.jsonLoose(raw).screens["Pell Dunmore"], "You fall.\nOsric says, \"That's the old floor.\" He waits.");
  assert.equal(relayMod.jsonLoose("no json here"), null);
  const NAMES = ["Bram Halloway", "Sefa Marrin", "Pell Dunmore"];
  const narration = "Pell climbs the slabs. The chalk gives way under Pell. Out of game: no card.";
  const asked = [];
  const ask = async ({ user, purpose }) => { asked.push({ user, purpose });
    if (/Write only (\w+ \w+)'s screen now/.test(user)) { const who = user.match(/Write only (\w+ \w+)'s screen now/)[1]; return who === "Sefa Marrin" ? { text: "" } : { text: `You see it, ${who.split(" ")[0]}.` }; }
    return { text: '{"screens": {"Bram' }; };
  const r = await relayMod.relay({ ask, names: NAMES, scene: NAMES, forNames: NAMES, messages: [], narration, purpose: "relay r5" });
  assert.equal(asked.length, 5, "two asks, then one per screen");
  assert.deepEqual([r.fallback, r.perScreen], [true, true]);
  assert.equal(r.screens["Bram Halloway"], "You see it, Bram.");
  assert.equal(r.screens["Sefa Marrin"], mh.RELAY_MISSING, "a screen that does not come is the harness line");
  for (const screen of Object.values(r.screens)) assert.notEqual(screen, narration);
  assert.deepEqual(r.unreadable.map((u) => [u.attempt, u.text]), [[1, '{"screens": {"Bram'], [2, '{"screens": {"Bram'], [4, ""]]);
  assert.match(asked[2].user, /Your previous answers could not be read\. Write only Bram Halloway's screen now, by the same rules — plain text/);
});

test("an HTTP 200 whose body could not be read is a broken transport, asked again (at most twice, POLICY v1); a refusal or a 4xx never", async () => {
  const session = await import("../scripts/game-player-1/session.mjs");
  assert.ok(session.RETRYABLE.test("HTTP 200: ") && session.RETRYABLE.test("HTTP 503: overloaded") && session.RETRYABLE.test("fetch failed"));
  assert.ok(!session.RETRYABLE.test("HTTP 200 http_400: bad request") && !session.RETRYABLE.test("HTTP 400: invalid") && !session.RETRYABLE.test("HTTP 402: credits"));
  let calls = 0;
  const meter = { within: async (_, fn) => fn() };
  const r = await session.paidCall({ meter, session: "s", purpose: "player r11", sleep: async () => {}, call: async () => (++calls < 3 ? { text: "", error: "HTTP 200: " } : { text: "I wait." }) });
  assert.deepEqual([calls, r.text, r.retries], [3, "I wait.", 2]);
  calls = 0;
  const gone = await session.paidCall({ meter, session: "s", purpose: "p", sleep: async () => {}, call: async () => { calls++; return { text: "", error: "HTTP 200: " }; } });
  assert.deepEqual([calls, gone.error], [3, "HTTP 200: "], "asked at most twice again, then the error stands");
});

test("the owner's decisions after S1-none-T1: the A7 line replaces the guide's two sentences on questions; the DM's out-of-game asides are taken out of what the relay retells and kept", async () => {
  const relayMod = await import("../scripts/multi-hero-1/relay.mjs");
  const guide = frozen.companyFiles().guide;
  const next = frozen.guideWithA7(guide);
  assert.ok(next.includes(frozen.GUIDE_A7_TO) && !next.includes("A question one character leaves unanswered") && !next.includes("A question put to one character by anyone"));
  assert.equal(next.replace(frozen.GUIDE_A7_TO, frozen.GUIDE_A7_FROM), guide, "nothing else in the guide changes");
  assert.throws(() => frozen.guideWithA7("no such line"));
  // The asides, as the dry run's Haiku DM and S1-none-T1's Opus DM wrote them.
  const cases = [
    ["The chalk gives way.\n\n Out of game: neither needs a card; the chalk gave way by the world's own schedule.\n\nWhere you are: the yard", "The chalk gives way.\n\nWhere you are: the yard"],
    ["He waits.\n\n*(Out of game: Hale dropped the rope's end to Pell in Pell's own scene.)*", "He waits."],
    ["Bram lifts (Out of game: an Athletics check, DC 15 (no roll needed)) the beam.", "Bram lifts the beam."],
    ["Nothing out of the ordinary; a game of dice in the corner.", "Nothing out of the ordinary; a game of dice in the corner."],
  ];
  for (const [input, want] of cases) assert.equal(relayMod.withoutAsides(input).text, want);
  assert.deepEqual(relayMod.withoutAsides(cases[1][0]).asides, ["*(Out of game: Hale dropped the rope's end to Pell in Pell's own scene.)*"]);
  // Every aside S1-none-T1's DM wrote is taken out; nothing else of those narrations is.
  const { readdirSync, readFileSync: read } = await import("node:fs");
  const file = readdirSync(new URL("../docs/runs/", import.meta.url)).find((f) => f === "game-party-2-run-20261102-053158.json");
  if (file) {
    const run = JSON.parse(read(new URL(`../docs/runs/${file}`, import.meta.url), "utf8"));
    let found = 0;
    for (const round of run.table.rounds) for (const scene of round.scenes) {
      const { text, asides } = relayMod.withoutAsides(scene.narration);
      found += asides.length;
      assert.doesNotMatch(text, /out of game/i, `r${round.n}`);
      assert.ok(text.length > scene.narration.length * 0.6, `r${round.n}: the story stays`);
    }
    assert.ok(found >= 18, `asides found: ${found}`);
  }
  // The bets: the owner's, given after S1-none-T1's result.
  const verdicts = await import("../scripts/game-party-2/verdicts.mjs");
  assert.deepEqual(Object.keys(verdicts.OWNER_BETS.bets), ["R1", "R2", "R3", "R4", "R5"]);
});

// ---- Step 1 of the amendment of 2026-11-08 17:35 LA: A7 fixed by the harness ---------------------------------------------------

test("A7 v4: the company frame gives the round's close to the table (no question, offer, wait or out-of-game note put to one character); the old sentence is gone; the guide note stays", async () => {
  const company = await import("../src/lib/gameplay/dm-loop/company.ts");
  assert.ok(company.COMPANY_TABLE.includes(company.COMPANY_CLOSE));
  assert.doesNotMatch(company.COMPANY_TABLE, /When you end on a question, put it to the characters it concerns/);
  assert.match(company.COMPANY_CLOSE, /never on a question, an offer, a demand or a call put to one character/);
  assert.match(company.COMPANY_CLOSE, /never with an out-of-game note of what is still open/);
  assert.match(company.COMPANY_CLOSE, /A scene never waits on a character in another scene/);
  // The guide note is the owner's, unchanged (the amendment: «the owner's line is not rewritten»).
  assert.match(frozen.GUIDE_A7_TO, /^A question or offer addressed to one character is resolved inside that character's own screen, in the same round;/);
  assert.equal(frozen.CLOSE_LINE({ name: "Sefa Marrin" }, 4), "Round 4 — what does Sefa Marrin do?");
  assert.ok(["v4", "v5"].includes(frozen.TABLE_HARNESS));
  assert.deepEqual(Object.keys(frozen.HARNESS), ["v2", "v3", "v4", "v5"]);
});

test("A7 replay on a mocked OpenRouter: the request is the captured shape with T2's history and frozen messages, rolls answered locally, both readings per round, the verdict at 8 of 9; nothing past the meter's cap", async () => {
  const replay = await import("../scripts/game-party-2/a7-replay.mjs");
  const { anthropicEndpoint } = await import("../src/lib/server/anthropic-endpoint.ts");
  const keys = { anthropic: "sk-test", openai: "sk-never", door: anthropicEndpoint({ ANTHROPIC_PROVIDER: "openrouter", OPENROUTER_API_KEY: "sk-test", APP_OPENROUTER_API_KEY: "sk-test" }) };
  keys.door.apiKey = "sk-test";
  const captured = { capturedAt: "test", output_config: { effort: "high" }, tools: [{ name: "roll", description: "Roll dice", input_schema: { type: "object", properties: {} } }, { name: "recall", description: "Recall", input_schema: { type: "object", properties: {} } }],
    frame: { type: "text", text: "You are the game master of a private, long-running role-playing campaign. FRAME" }, campaign: [{ type: "text", text: "Campaign: test." }],
    history: [{ type: "text", text: "Recent scenes and exchanges (oldest first; the conversation so far, public):\n[note] approved" }, { type: "text", text: "[narration] OPENING" }],
    after: [{ type: "text", text: "Party — the player characters: …" }, { type: "text", text: "Retrieved memory: canon\n\nCurrent state (before this turn; IDs are the references tools accept):\n{\"marker\":\"STALE_STATE_MARKER\"}" }] };
  const seen = { dm: [], judges: 0, urls: new Set() };
  const reply = (content, stop = "end_turn") => new Response(JSON.stringify({ id: "msg", model: "anthropic/claude-opus-5.5", stop_reason: stop, content, usage: { input_tokens: 1000, output_tokens: 200 } }), { status: 200, headers: { "content-type": "application/json" } });
  const fetcher = async (url, init) => {
    seen.urls.add(String(url));
    const body = JSON.parse(init.body);
    const system = Array.isArray(body.system) ? body.system.map((b) => b.text).join("\n") : String(body.system ?? "");
    if (/game master of a private/.test(system)) {
      seen.dm.push(body);
      const last = body.messages.at(-1);
      if (last.role === "user" && typeof last.content !== "string" && last.content[0]?.type === "text" && /Round 5 /.test(last.content[0].text) && body.messages.length === 1)
        return reply([{ type: "text", text: "Bram braces. " }, { type: "tool_use", id: "tu1", name: "roll", input: { formula: "1d20+5", difficulty: "hard", actorRef: "Bram Halloway", reason: "Athletics" } }], "tool_use");
      return reply([{ type: "text", text: "The rope creaks and the yard is still. <ledger>\ntime — 5 minutes\n</ledger>" }]);
    }
    seen.judges++;
    const user = body.messages[0].content;
    const text = typeof user === "string" ? user : user.map((b) => b.text).join("");
    const round = Number(/Round (\d+)\./.exec(text)?.[1]);
    if (/"waits"/.test(text)) return reply([{ type: "text", text: JSON.stringify({ addressed: [], waits: round === 13 ? "Sefa Marrin" : null, reason: "test" }) }]);
    const acted = (/The characters who acted this round: ([^\n]*)\./.exec(text)?.[1] ?? "").split(", ").filter(Boolean);
    return reply([{ type: "text", text: JSON.stringify({ reflected: Object.fromEntries(acted.map((n) => [n, true])), open: round === 14 ? ["Bram Halloway"] : [], reason: "test" }) }]);
  };
  const dir = mkdtempSync(join(tmpdir(), "a7-replay-test-"));
  const out = await replay.runReplay({ dry: true, fetcher, keys, captured, log: () => {}, out: join(dir, "a7") });
  assert.deepEqual([...seen.urls], ["https://openrouter.ai/api/v1/messages"], "every call through OpenRouter, none to the Console or OpenAI");
  // One DM turn per scene of the nine rounds (r5, r6 and r8 had two scenes at T2), plus r5's tool step(s).
  assert.equal(out.scenes.length, 12);
  assert.ok(seen.dm.every((b) => b.model === "anthropic/claude-opus-5.5" && b.max_tokens === replay.DM_MAX_TOKENS && b.system.filter((x) => x.cache_control).length === 4));
  const first = seen.dm[0];
  assert.match(first.messages[0].content[0].text, /^Player: \(Round 1 — one paragraph per character in this scene\.\)/);
  assert.ok(first.system.some((b) => b.text === "[narration] OPENING") && !first.system.some((b) => /\[player\] \(Round 1/.test(b.text)), "round 1 reads the opening, no round of its own");
  const r15 = seen.dm.find((b) => /Round 15 /.test(b.messages[0].content[0].text));
  assert.ok(r15.system.some((b) => /^\[player\] \(Round 14 /.test(b.text)) && !r15.system.some((b) => /^\[player\] \(Round 15 /.test(b.text)), "round 15 reads rounds 1–14, not itself");
  assert.ok(seen.dm.every((b) => !JSON.stringify(b.system).includes("STALE_STATE_MARKER")), "the stale current state is left out");
  const step = seen.dm.find((b) => b.messages.length === 3);
  const result = JSON.parse(step.messages[2].content[0].content);
  assert.equal(step.messages[2].content[0].tool_use_id, "tu1");
  assert.ok(result.ok && result.dc === 13 && result.dice.length === 1 && result.total === result.dice[0] + 5);
  assert.ok(out.scenes.every((s) => s.narration === "The rope creaks and the yard is still." || s.narration === "Bram braces. The rope creaks and the yard is still."), "the ledger is left out of the narration");
  // The verdict: r13 holds on Sefa (fails), the rest pass → 8 of 9.
  assert.deepEqual([out.verdict.passed, out.verdict.of, out.verdict.holds, out.verdict.noHold, out.verdict.allReflected], [8, 9, true, 8, 9]);
  assert.deepEqual(out.verdict.namesOpenWithoutHold, [14]);
  assert.match(readFileSync(join(dir, "a7.md"), "utf8"), /8 of 9 rounds pass \(needed 8\) — PASS/);
  // A cap the first call could pass: nothing is sent.
  seen.dm.length = 0;
  await assert.rejects(replay.runReplay({ dry: true, fetcher, keys, captured, log: () => {}, out: join(dir, "a7-capped"), cap: 0.01 }), /failed|not sent/);
  assert.equal(seen.dm.length, 0);
});

test("A7 replay: a roll is the formula's dice, the modifier and the fiction's bonuses against the ladder; a natural 1 fails", async () => {
  const { localRoll } = await import("../scripts/game-party-2/a7-replay.mjs");
  assert.deepEqual((({ dice, total, dc, success }) => ({ dice, total, dc, success }))(localRoll({ formula: "1d20+3", difficulty: "normal", bonuses: [{ source: "rope", value: 2 }] }, () => 6)), { dice: [6], total: 11, dc: 10, success: true });
  assert.equal(localRoll({ formula: "1d20+30", dc: 5 }, () => 1).success, false);
  assert.equal(localRoll({ formula: "2d6" }, () => 3).total, 6);
});

test("A7 v5 (the planner's B): the reminder closes a round's header inside its parentheses; the players' paragraphs are untouched; the replay sends it in the round's message and in every earlier round's message", async () => {
  const replay = await import("../scripts/game-party-2/a7-replay.mjs");
  const R = frozen.ROUND_REMINDER;
  assert.match(R, /no question, offer, demand or wait put to one character, and no out-of-game note/);
  assert.equal(table.roundHeader(3, [], R), `(Round 3 — one paragraph per character in this scene. ${R})`);
  assert.equal(table.roundHeader(3), "(Round 3 — one paragraph per character in this scene.)");
  assert.match(table.roundHeader(13, ["Sefa Marrin"], R), new RegExp(`do not narrate that character here\\. ${R.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)$`));
  assert.throws(() => table.withRoundReminder("Bram Halloway: I go.", R), /not a round header/);
  const input = "(Round 2 — one paragraph per character in this scene.)\n\nBram Halloway: I go (quietly).\n\nSefa Marrin: I wait.";
  assert.equal(replay.messageWith(input, R), `(Round 2 — one paragraph per character in this scene. ${R})\n\nBram Halloway: I go (quietly).\n\nSefa Marrin: I wait.`);
  assert.equal(replay.messageWith(input, ""), input);
  const t2 = JSON.parse(readFileSync(new URL("../docs/runs/game-party-2-run-20261102-070749.json", import.meta.url), "utf8"));
  const captured = { output_config: { effort: "high" }, tools: [], frame: { text: "You are the game master of a private, long-running role-playing campaign." }, campaign: [{ text: "Campaign: test." }],
    history: [{ text: "Recent scenes and exchanges (oldest first; the conversation so far, public):\n[note] approved" }, { text: "[narration] OPENING" }], after: [{ text: "Party — x" }] };
  const scene = t2.table.rounds[14].scenes.find((x) => x.narration);
  const body = replay.sceneRequest(captured, t2, 15, scene, R);
  assert.ok(body.messages[0].content[0].text.startsWith(`Player: (Round 15 — one paragraph per character in this scene. ${R})`));
  const players = body.system.filter((b) => b.text.startsWith("[player] "));
  assert.ok(players.length >= 14 && players.every((b) => b.text.split("\n\n")[0].endsWith(` ${R})`)), "every earlier round's message carries the reminder");
  const v4 = replay.sceneRequest(captured, t2, 15, scene);
  assert.ok(!JSON.stringify(v4).includes(R), "v4's test sends no reminder");
});

test("scoring (the owner's amendment of 2026-11-09 15:23 LA): a judge's refusal leaves that round unscored and the pass goes on; the refused round is never asked again", async () => {
  const { scoreTable } = await import("../scripts/game-party-2/score.mjs");
  const source = JSON.parse(readFileSync(new URL("../docs/runs/game-party-2-run-20261109-154451.json", import.meta.url), "utf8"));
  const run = { ...source, table: { ...source.table, rounds: source.table.rounds.slice(0, 3), tags: undefined } };
  const asked = [];
  const ask = async ({ purpose, model }) => {
    asked.push(purpose);
    if (purpose === "round r2 referee") return { text: "", stopReason: "refusal", refusalCategory: "cyber", model };
    return { text: "not json", stopReason: "end_turn" };
  };
  const tags = await scoreTable(run, { ask });
  assert.deepEqual(tags.unscored.map((u) => [u.round, u.purpose, u.category]), [[2, "round r2 referee", "cyber"]]);
  assert.ok(tags.rounds[1] && tags.rounds[3] && !tags.rounds[2] && !tags.hold[2], "round 2's tags dropped, rounds 1 and 3 kept");
  assert.equal(asked.filter((p) => p === "round r2 referee").length, 1, "the refused call is not asked again");
  assert.ok(!asked.some((p) => /^hold r2 /.test(p)), "nothing more of the refused round is asked");
  assert.ok(asked.some((p) => /^round r3 /.test(p)) && asked.some((p) => /^hold r3 /.test(p)), "the pass goes on with round 3");
  // A second pass over the same record skips the unscored round.
  asked.length = 0;
  await scoreTable(run, { ask });
  assert.ok(!asked.some((p) => /\br2\b/.test(p)));
});
