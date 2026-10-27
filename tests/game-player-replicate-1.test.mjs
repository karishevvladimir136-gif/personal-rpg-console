// Game player replicate 1 (docs/stages/GAME_PLAYER_REPLICATE_1.md): the second group on game player 1's harness and
// DeepSeek's seat, without a live call. The player's prompt and the four group-1 players' requests byte-identical to
// group 1's; the pre-registration copied unchanged and frozen by hash; DeepSeek's call pinned to DeepInfra (served model
// and host checked, nothing of the reasoning relayed); the meter on OpenRouter's chat completions and on 402/429; the
// counts read by rule (rerolls, declines, slots, Inspiration, money, temples, swallowed presses) and what they give on
// group 1's records; P0–P5; the order; and, in a child process, the whole pipeline on scripted providers.
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { playerSystem } from "../scripts/game-player-1/frozen.mjs";
import { PLAYERS, playerCall } from "../scripts/game-player-1/players.mjs";
import { createLedger, createMeter } from "../scripts/game-player-1/paid.mjs";
import { anthropicEndpoint } from "../src/lib/server/anthropic-endpoint.ts";
import {
  AMENDMENTS, DEEPSEEK, DESIGN_SHA256, ORDER, SUPERSEDED, PREREGISTRATION, PROMPT_SHA256, READINGS, promptSha256,
} from "../scripts/game-player-replicate-1/frozen.mjs";
import { OPENROUTER_CHAT_URL, openrouterChat } from "../scripts/game-player-replicate-1/openrouter-chat.mjs";
import {
  heroMissOn, inspirationOf, moneyOf, p6Of, rerollsOf, rowOf, slotsOf, swallowedOf, templesOf, verdictsP, within,
} from "../scripts/game-player-replicate-1/score.mjs";
import { REPLICATE, loadGroup1 } from "../scripts/game-player-replicate-1/run.mjs";
import { reportMarkdown } from "../scripts/game-player-replicate-1/report.mjs";

const stage = readFileSync(new URL("../docs/stages/GAME_PLAYER_REPLICATE_1.md", import.meta.url), "utf8");
const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });

// ---- the same prompt, the same requests --------------------------------------------------------------------------------

test("the player's system prompt is byte-identical to group 1's at every table", () => {
  for (const table of ["A", "B", "C"]) assert.equal(promptSha256(table), PROMPT_SHA256[table], table);
  assert.equal(PROMPT_SHA256.A, "0461fa9b83d18fd1387afde29f9e006d57cb5190493afbad392780fc5abc2f7a");
  assert.equal(PROMPT_SHA256.C, "a51269996ecf915b44dd9f4b3a1e849bda73cf7298337680dfc1314d96ad6da3");
});

test("the four group-1 players' requests are built as before (Console and OpenRouter doors)", async () => {
  // The hashes were taken from scripts/game-player-1/players.mjs as committed at 6158fff, before DeepSeek's seat.
  const before = {
    opus: "97dae8402aebc40bc72deacb874b89bb334a84e9883b8cb48012521260951a08", "opus@openrouter": "cb29b47698bcab3aefae02b23de474c541984ee302d4141287043393a4d932ef",
    fable: "ef3f7f23e24628c3a4c06a8e4f7ce81de82902820cd12dd0e6b2405c675b1f5c", "fable@openrouter": "9298ebe847b96fe12ac638721bd9ee368de645a848924042c98d1d940e0358b2",
    astra: "72be18974501229532a3885879f82b498184d2c3012641d4860325d896fced8c", "astra@openrouter": "72be18974501229532a3885879f82b498184d2c3012641d4860325d896fced8c",
    sol: "5a299d750c0e333dc6fcdbee82aa642e793b7a9749f0076b3aa37189f622fcce", "sol@openrouter": "5a299d750c0e333dc6fcdbee82aa642e793b7a9749f0076b3aa37189f622fcce",
  };
  for (const name of ["opus", "fable", "astra", "sol"]) {
    for (const door of [null, "openrouter"]) {
      const sent = [];
      const fetcher = async (url, init) => { sent.push({ url: String(url), body: JSON.parse(init.body) }); return new Response(JSON.stringify({}), { status: 500 }); };
      const doorObj = door ? { ...anthropicEndpoint({ ANTHROPIC_PROVIDER: "openrouter", OPENROUTER_API_KEY: "k" }), apiKey: "k" } : null;
      await playerCall({ player: PLAYERS[name], system: playerSystem("B"), messages: [{ role: "user", content: "The session begins.\n\nscreen" }, { role: "assistant", content: "I look." }, { role: "user", content: "more" }], keys: { anthropic: "k", openai: "k", door: doorObj }, fetcher });
      assert.equal(createHash("sha256").update(JSON.stringify(sent)).digest("hex"), before[`${name}${door ? "@openrouter" : ""}`], `${name} ${door ?? "console"}`);
    }
  }
});

test("the pre-registration is the stage's, unchanged, and the design is frozen", () => {
  const block = (text) => text.slice(text.indexOf("## Pre-registration"), text.indexOf("## What the report must do")).replace(/\s+/g, " ").trim();
  assert.equal(block(`${PREREGISTRATION}\n## What the report must do`), block(stage));
  for (const line of ["P0", "P1", "P2", "P3", "P4", "P5", "swallowed", "inspiration", "deepseek", "scope"]) assert.ok(READINGS[line], line);
  // Frozen before the first paid call (d00ad18f, kept as SUPERSEDED); amended once by the owner (the 429 handling): a change
  // to the order, the prompt hashes, the readings, the rubrics or the amendments changes this.
  assert.equal(SUPERSEDED.sha256, "d00ad18fee7cd85cc66394477307c3ce4c9b0f14c87ea4602852d6c5bc1490c4");
  assert.equal(AMENDMENTS.length, 1);
  assert.equal(DESIGN_SHA256, "51be7f19f4347a5fd788f5d95a65f60100a2d8db0a82e5380033ef9c41169504");
});

test("the order: Tables A, B, C for the four, then DeepSeek twice per table — eighteen, one at a time", () => {
  assert.deepEqual(ORDER.map((s) => s.key), ["A-opus", "A-fable", "A-astra", "A-sol", "B-opus", "B-fable", "B-astra", "B-sol", "C-opus", "C-fable", "C-astra", "C-sol",
    "A-deepseek-1", "A-deepseek-2", "B-deepseek-1", "B-deepseek-2", "C-deepseek-1", "C-deepseek-2"]);
  assert.deepEqual(REPLICATE.plan(["B-deepseek-2"]), [{ key: "B-deepseek-2", table: "B", player: "deepseek" }]);
  assert.deepEqual(REPLICATE.caps, { anthropic: 0, openrouter: 300, openai: 25 });
  assert.deepEqual(REPLICATE.waits429, [20_000, 40_000, 80_000, 120_000, 120_000, 120_000], "group 1's backoff, restored");
});

// ---- DeepSeek's seat ----------------------------------------------------------------------------------------------------

test("DeepSeek's call: OpenRouter's chat completions, pinned to DeepInfra, effort medium, the reasoning not requested", async () => {
  const sent = [];
  const fetcher = async (url, init) => { sent.push({ url, init, body: JSON.parse(init.body) });
    return json({ id: "gen-1", model: DEEPSEEK.model, provider: "DeepInfra", choices: [{ finish_reason: "stop", message: { role: "assistant", content: "I walk to the gate.", reasoning: "never relayed" } }],
      usage: { prompt_tokens: 1200, completion_tokens: 300, prompt_tokens_details: { cached_tokens: 1000 }, completion_tokens_details: { reasoning_tokens: 250 }, cost: 0.0012 } }); };
  const system = playerSystem("A");
  const r = await playerCall({ player: PLAYERS.deepseek, system, messages: [{ role: "user", content: "The session begins." }, { role: "assistant", content: "I look." }, { role: "user", content: "screen" }], keys: { anthropic: "or-key", openai: "x", door: { provider: "openrouter" } }, fetcher });
  assert.equal(sent[0].url, OPENROUTER_CHAT_URL);
  assert.equal(OPENROUTER_CHAT_URL, "https://openrouter.ai/api/v1/chat/completions");
  assert.equal(sent[0].init.headers.authorization, "Bearer or-key");
  const body = sent[0].body;
  assert.equal(body.model, "deepseek/deepseek-v4-pro-0813");
  assert.deepEqual(body.provider, { order: ["deepinfra"], allow_fallbacks: false, require_parameters: true });
  assert.deepEqual(body.reasoning, { effort: "medium", exclude: true });
  assert.equal(body.max_tokens, 8000);
  assert.deepEqual(body.messages, [{ role: "system", content: system }, { role: "user", content: "The session begins." }, { role: "assistant", content: "I look." }, { role: "user", content: "screen" }]);
  assert.equal(r.text, "I walk to the gate.");
  assert.equal(r.reasoningTokens, 250);
  assert.equal(r.chargedUsd, 0.0012);
  assert.deepEqual(r.usage, { input_tokens: 200, cache_read_input_tokens: 1000, cache_creation_input_tokens: 0, output_tokens: 300, reasoning_tokens: 250 });
  assert.ok(!JSON.stringify(r).includes("never relayed") || r.text !== "never relayed");
});

test("DeepSeek's call: another model or another host is not relayed; a refusal is a refusal", async () => {
  const reply = (over) => async () => json({ id: "gen-2", model: DEEPSEEK.model, provider: "DeepInfra", choices: [{ finish_reason: "stop", message: { content: "text" } }], usage: {}, ...over });
  const call = (fetcher) => openrouterChat({ apiKey: "k", spec: DEEPSEEK, system: "s", messages: [{ role: "user", content: "u" }], maxTokens: 10, effort: "medium", fetcher });
  assert.match((await call(reply({ model: "deepseek/deepseek-v4.1-flash-1017" }))).error, /served model/);
  assert.equal((await call(reply({ model: "deepseek/deepseek-v4.1-flash-1017" }))).text, "");
  assert.match((await call(reply({ provider: "Novita" }))).error, /not the pinned DeepInfra/);
  assert.equal((await call(reply({ model: DEEPSEEK.snapshot }))).text, "text");
  assert.equal((await call(reply({ choices: [{ finish_reason: "content_filter", message: { content: "" } }] }))).stopReason, "refusal");
  assert.equal((await call(async () => json({ error: { code: 400, message: "flagged by moderation" } }, 400))).stopReason, "refusal");
  assert.match((await call(async () => json({ error: { code: 502, message: "upstream" } }, 502))).error, /^HTTP 502/);
});

// ---- the meter -------------------------------------------------------------------------------------------------------------

test("the meter books DeepSeek on OpenRouter's ledger at OpenRouter's charge, the reasoning recorded and never relayed", async () => {
  const ledgers = { anthropic: createLedger("anthropic", 0), openrouter: createLedger("openrouter", 300), openai: createLedger("openai", 25) };
  const meter = createMeter({ ledgers, waits429: [], fetcher: async () => json({ id: "gen-3", model: DEEPSEEK.model, provider: "DeepInfra",
    choices: [{ finish_reason: "stop", message: { content: "ok", reasoning: "thinking" } }], usage: { prompt_tokens: 1000, completion_tokens: 100, completion_tokens_details: { reasoning_tokens: 60 }, cost: 0.002 } }, 200, { "x-generation-id": "gen-3" }) });
  await meter.within({ session: "A-deepseek-1", purpose: "player t1" }, () => meter.fetch(OPENROUTER_CHAT_URL, { method: "POST", body: JSON.stringify({ model: DEEPSEEK.model, max_tokens: 8000, messages: [] }) }));
  const row = ledgers.openrouter.calls[0];
  assert.equal(row.costUsd, 0.002);
  assert.equal(row.usage.reasoning_tokens, 60);
  assert.equal(row.upstream, "DeepInfra");
  assert.equal(row.requestId, "gen-3");
  assert.equal(row.reasoning, "thinking");
  assert.equal(row.notRelayed, true);
  assert.ok(row.listUsd > 0);
});

test("a rate-limit 429 waits with group 1's backoff and is sent again; a quota 429 and a 402 stop at once", async () => {
  // OpenRouter's admission-control answer of 2026-10-26 00:24 UTC: a rate limit, waited out.
  const admission = { type: "error", error: { type: "rate_limit_error", message: "OpenRouter could not verify available credits for this request in time. Retry shortly.", error_type: "rate_limit_exceeded" }, metadata: { limit_source: "openrouter_admission_control" } };
  {
    const ledgers = { anthropic: createLedger("anthropic", 0), openrouter: createLedger("openrouter", 300), openai: createLedger("openai", 25) };
    const waits = [];
    let calls = 0;
    const meter = createMeter({ ledgers, waits429: REPLICATE.waits429, sleep: async (ms) => { waits.push(ms); }, fetcher: async () => (++calls <= 2 ? json(admission, 429) : json({ id: "msg", model: "claude-opus-5-5", content: [], stop_reason: "end_turn", usage: { input_tokens: 1, output_tokens: 1 } })) });
    const r = await meter.within({ session: "A-opus", purpose: "dm t5" }, () => meter.fetch("https://openrouter.ai/api/v1/messages", { method: "POST", body: JSON.stringify({ model: "anthropic/claude-opus-5.5", max_tokens: 100 }) }));
    assert.equal(r.status, 200);
    assert.deepEqual(waits, [20_000, 40_000]);
    assert.equal(meter.stopped, null);
  }
  {
    const ledgers = { anthropic: createLedger("anthropic", 0), openrouter: createLedger("openrouter", 300), openai: createLedger("openai", 25) };
    let calls = 0;
    const meter = createMeter({ ledgers, waits429: REPLICATE.waits429, sleep: async () => {}, fetcher: async () => { calls++; return json(admission, 429); } });
    await meter.within({ session: "A-opus", purpose: "dm t5" }, () => meter.fetch("https://openrouter.ai/api/v1/messages", { method: "POST", body: JSON.stringify({ model: "anthropic/claude-opus-5.5", max_tokens: 100 }) }));
    assert.equal(calls, 7, "six waits, then the seventh 429 stops");
    assert.match(meter.stopped, /HTTP 429 from openrouter after 6 waits/);
  }
  for (const [status, body] of [[429, { error: { code: "insufficient_quota", message: "You exceeded your current quota" } }], [402, { error: { code: 402, message: "Insufficient credits" } }]]) {
    const ledgers = { anthropic: createLedger("anthropic", 0), openrouter: createLedger("openrouter", 300), openai: createLedger("openai", 25) };
    let calls = 0;
    const meter = createMeter({ ledgers, waits429: REPLICATE.waits429, sleep: async () => { throw new Error("no wait"); }, fetcher: async () => { calls++; return json(body, status, { "retry-after": "1" }); } });
    const r = await meter.within({ session: "A-opus", purpose: "dm t1" }, () => meter.fetch("https://openrouter.ai/api/v1/messages", { method: "POST", body: JSON.stringify({ model: "anthropic/claude-opus-5.5", max_tokens: 100 }) }));
    assert.equal(r.status, status);
    assert.equal(calls, 1);
    assert.ok(meter.stopped, `${status} stops at once`);
    await assert.rejects(meter.within({ session: "A-opus", purpose: "dm t2" }, () => meter.fetch("https://openrouter.ai/api/v1/messages", { method: "POST", body: "{}" })), /not sent/);
  }
});

// ---- the counts by rule ------------------------------------------------------------------------------------------------------

const card = (actor, verdict) => `[Roll card] ${actor} · Skill check — Persuasion\nWhat adds to the die: +4 Persuasion +7 (proficient)\nDC 15\nDie: 6\n6 + 4 = 10\n${verdict} — 10`;
const screenOf = (cards, buttons) => [...cards, buttons.map((b) => `[${b}]`).join(" ")].join("\n\n");
function sessionWith(presses, extra = {}) {
  const screens = [], messages = [], turns = [];
  for (const [i, p] of presses.entries()) { screens.push(p.screen); messages.push({ purpose: `player t${p.k} card ${i + 1}`, text: p.text }); }
  turns.push({ k: 1, kind: "action", message: "x", reply: "y", changes: extra.changes ?? [], place: extra.place ?? null, presses: [] });
  return { key: "A-sol", table: "A", player: "sol", screens, messages, turns, ended: extra.ended ?? { reason: "turns" } };
}

test("rerolls spent and declines on a miss are read from the card screens; only the hero's own miss counts", () => {
  const offered = ["Onward", "Request an allowed reroll"];
  const s = sessionWith([
    { k: 3, screen: screenOf([card("James Worgen", "Failure")], offered), text: "[Onward]" },
    { k: 4, screen: screenOf([card("James Worgen", "Failure")], offered), text: "Request an allowed reroll" },
    { k: 5, screen: screenOf([card("the cat", "Failure"), card("James Worgen", "Success")], offered), text: "Onward" },
    { k: 6, screen: screenOf([card("James Worgen", "A natural one")], ["Onward"]), text: "Onward" },
    { k: 7, screen: screenOf([card("James Worgen", "Failure")], offered), text: "[Request an allowed reroll] ? the card is wrong" },
  ]);
  assert.equal(heroMissOn(screenOf([card("the cat", "Failure")], offered)), false);
  const r = rerollsOf(s);
  assert.deepEqual([r.spent, r.spentAt, r.declines, r.declinedAt], [1, [4], 1, [3]]);
  const w = swallowedOf(s);
  assert.deepEqual([w.count, w.withNote, w.questions, w.other], [1, 1, 0, 0]);
});

test("slots, Inspiration, money (own holdings left out) and temples are read from the records", () => {
  const changes = [
    { tool: "resource", summary: "Invisibility · Pact slots (3rd level, short rest): 2 → 1/2 (Cast Invisibility)" },
    { tool: "resource", summary: "Heroic Inspiration: 0 → 1/1 (A natural 20 on Persuasion)" },
    { tool: "resource", summary: "Heroic Inspiration: 1 → 0/1 (spent on the reroll)" },
    { tool: "holding", summary: "Base: Top room at Tansy Brindle's" },
    { tool: "money", summary: "−379 sps → Top room at Tansy Brindle's" },
    { tool: "money", summary: "−50 gps (Changed into small coin at the Counting House)" },
    { tool: "money", summary: "+450 sps (50 gp changed)" },
    { tool: "money", summary: "−87 gps → Ivo Dunnock" },
    { tool: "money", summary: "Garric receives 3 gps (someone else's purse)" },
  ];
  const s = sessionWith([], { changes, place: { id: "p", name: "The Song of the Morning" } });
  assert.equal(slotsOf(s).spent, 1);
  assert.deepEqual([inspirationOf(s).awarded, inspirationOf(s).spent], [1, 1]);
  assert.deepEqual([moneyOf(s).outflowGp, moneyOf(s).real], [92, true]);
  assert.deepEqual(templesOf(s).map((t) => t.name), ["The Song of the Morning"]);
  assert.deepEqual(templesOf(sessionWith([], { place: { id: "q", name: "The Elfsong Tavern" } })), []);
});

test("on group 1's records the rules give the planner's group-1 descriptions (the four draws)", () => {
  const rows = loadGroup1().map((s) => rowOf(s));
  assert.equal(rows.length, 12);
  const who = (test) => [...new Set(rows.filter(test).map((r) => r.key))].sort();
  assert.deepEqual(who((r) => r.money.real), ["C-fable"]);
  assert.deepEqual(who((r) => r.temples.length > 0), ["A-sol", "B-sol"]);
  assert.deepEqual(who((r) => r.inspiration.awarded > 0), ["B-fable", "C-fable"]);
  assert.deepEqual(who((r) => r.stuck), ["C-opus"]);
  assert.equal(rows.reduce((s, r) => s + r.slots.spent, 0), 1);
  assert.equal(rows.reduce((s, r) => s + r.rerolls.spent, 0), 6);
});

test("P4's «within 20 %» and P5's nearest neighbours", () => {
  assert.equal(within(100, 120), true);
  assert.equal(within(100, 121), false);
  assert.equal(within(0, 0), true);
  assert.equal(within(0, 0.1), false);
  assert.equal(within(null, 1), null);
  const g1 = loadGroup1().map((s) => rowOf(s));
  const fake = (key, table, player, k) => ({ ...g1[0], key, table, player, doShare: 1, testsPerAction: 0.3 + k, questionsPerTurn: 0, wordsPerAction: 100 + k * 10, note: { broke: 1, missing: 1, praise_only: 0 }, tests: 5, made: 1, madeAt: [3] });
  const ds = ["A", "B", "C"].flatMap((t) => [fake(`${t}-deepseek-1`, t, "deepseek", 5), fake(`${t}-deepseek-2`, t, "deepseek", 5.01)]);
  const v = verdictsP({ g1, g2: g1.map((r) => ({ ...r })), ds, money: { openrouter: { spent: 1, cap: 300 } }, refusals: { "A-opus": 0 }, welfare: { stops: 0, distress: 0 } });
  assert.equal(v.P5.neighbours.holds, true);
  assert.equal(v.P4.holds, true, "group 2 equal to group 1 is within");
  assert.equal(v.P2.draws.money.g2.repeats, true);
  assert.equal(v.P0.holds, true);
  // P6 (the planner's, after the fact): a group 2 equal to group 1 puts each player's two sessions at distance 0.
  const p6 = p6Of({ g1, g2: g1.map((r) => ({ ...r })), ds });
  assert.equal(p6.cells.length, 3);
  assert.ok(p6.cells.every((c) => c.players.every((p) => p.own === 0)));
});

test("the report before the first paid call holds the pre-registration, the readings, the bets and the prompt hashes", () => {
  const page = reportMarkdown({ prereport: REPLICATE.prereportSummary, group1: loadGroup1() });
  assert.ok(page.includes("**P1 (the findings that are the table's).**"));
  assert.ok(page.includes(DESIGN_SHA256));
  assert.ok(page.includes("| P2 | at least one of the four group-1 draws does not repeat | at least two of the four fail to repeat |  | pending |"));
  for (const t of ["A", "B", "C"]) assert.ok(page.includes(PROMPT_SHA256[t]));
});

// ---- the whole pipeline, scripted ----------------------------------------------------------------------------------------------

test("the dry run plays a group-2 seat and a DeepSeek seat through the app on scripted providers", { timeout: 300_000 }, () => {
  const script = `
    const { run } = await import(${JSON.stringify(new URL("../scripts/game-player-1/run.mjs", import.meta.url).href)});
    const { REPLICATE, replicateScripted } = await import(${JSON.stringify(new URL("../scripts/game-player-replicate-1/run.mjs", import.meta.url).href)});
    const { tmpdir } = await import("node:os");
    const log = [];
    const r = await run({ stage: REPLICATE, dry: true, only: ["A-opus", "C-deepseek-2"], turns: 2, lanes: 1, fetcher: replicateScripted({ log }), out: tmpdir(), log: () => {} });
    const chat = log.filter((x) => /chat\\/completions$/.test(x.url));
    console.log("RESULT " + JSON.stringify({ sessions: r.sessions.map((s) => ({ key: s.key, turns: s.turns?.length, ended: s.ended?.reason, note: Boolean(s.note?.text), replicate: Boolean(s.tags?.replicate?.note), authorship: Boolean(s.tags?.authorship?.numbers), goalScale: s.tags?.goalScale ?? null })),
      chatModels: [...new Set(chat.map((x) => x.body.model))], chatSystemSame: chat.every((x) => x.body.messages[0].content === chat[0].body.messages[0].content), chatProvider: chat[0]?.body.provider }));
  `;
  const out = execFileSync(process.execPath, ["--experimental-transform-types", "--input-type=module", "-e", script], { cwd: new URL("..", import.meta.url), encoding: "utf8",
    env: { ...process.env, APP_ANTHROPIC_API_KEY: "", APP_OPENAI_API_KEY: "", APP_OPENROUTER_API_KEY: "", ANTHROPIC_API_KEY: "", OPENAI_API_KEY: "" }, maxBuffer: 64 * 1024 * 1024 });
  const result = JSON.parse(out.split("\n").find((line) => line.startsWith("RESULT ")).slice(7));
  assert.deepEqual(result.sessions.map((s) => [s.key, s.turns, s.ended, s.note, s.replicate, s.authorship]), [["A-opus", 2, "turns", true, true, true], ["C-deepseek-2", 2, "turns", true, true, true]]);
  assert.equal(result.sessions[0].goalScale, null, "no goal scale at Table A (as group 1)");
  assert.ok(result.sessions[1].goalScale, "a goal scale at Table C");
  assert.deepEqual(result.chatModels, ["deepseek/deepseek-v4-pro-0813"]);
  assert.equal(result.chatSystemSame, true);
  assert.deepEqual(result.chatProvider, { order: ["deepinfra"], allow_fallbacks: false, require_parameters: true });
});
