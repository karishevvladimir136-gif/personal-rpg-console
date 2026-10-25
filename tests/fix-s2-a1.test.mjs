// Fix run after session 2, stage A1 (docs/stages/FIX_S2_AB.md): turns are never lost to the lease or the
// output cap.
//   * the lease is renewed while a model request streams (migration 72, `lease_heartbeat`), only for the
//     claimant that holds it;
//   * one output ceiling for every depth — 32 000 then; 64 000 since fix S3-pre B-16 (the owner, 2026-10-20 18:15);
//   * a request the cap cut never fails the turn: the cut tool call is dropped by the adapter (never sent back
//     to the provider), unsigned thinking too, and the loop continues once from the complete part;
//   * a failed move says plainly that nothing changed in the game.
// Disposable PGlite databases and scripted models only; no network.
import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { CUT_BY_CAP, dmOutputCap, leaseHeartbeat, runDmLoopTurn } from "../src/lib/gameplay/dm-loop/loop.ts";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { lowerEffort } from "../src/lib/gameplay/dm-loop/depth.ts";
import { dmLoopLimits } from "../src/lib/gameplay/dm-loop/limits.ts";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only" ? { url: "data:text/javascript,export%20{}", shortCircuit: true } : nextResolve(specifier, context);
} });
const { createAnthropicDmModel, createOpenAiDmModel } = await import("../src/lib/server/dm/model/index.ts");
hook.deregister();

const finish = (extra = {}) => ({ name: "finish_turn", arguments: { sceneKinds: ["conversation"], spotlight: [], playerMoment: false, ...extra } });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test("the output cap is one ceiling of 64 000 tokens for every depth (fix S3-pre B-16); a cut request continues one level lower", () => {
  assert.equal(dmLoopLimits.maxOutputTokens, 64000);
  assert.equal(dmOutputCap(), 64000);
  assert.equal(lowerEffort("xhigh"), "high");
  assert.equal(lowerEffort("high"), "medium");
  assert.equal(lowerEffort("low"), "low");
});

test("the lease is renewed while a request streams, and only for the claimant that holds it", async () => {
  const c = await loopCampaign();
  try {
    const lease = (operationId) => c.f.one(`select lease_token,extract(epoch from lease_until-now())::float8 seconds from rpg_private.turns where id=$1`, [operationId]);
    const scripted = createScriptedDmModel([{ text: "The organiser counts the coins slowly. ", toolCalls: [finish()] }]);
    let held = null;
    let renewals = 0;
    const d = await c.deps(scripted);
    // A request that streams for a while: the lease is nearly gone when it starts.
    const slow = { ...scripted, stream: async function* (request) {
      await c.f.query("update rpg_private.turns set lease_until=now()+interval '2 seconds' where id=$1", [held]);
      await sleep(160);
      yield* scripted.stream(request);
    } };
    const store = { ...d.store, renewLease: async (given) => { renewals++; return d.store.renewLease(given); } };
    const input = await c.input("I wait while the organiser counts.");
    held = input.operationId;
    const seen = [];
    const result = await runDmLoopTurn(input, { ...d, store, model: () => slow, heartbeatMs: 40,
      observe: (o) => { if (o.type === "request_finished") seen.push(o); d.observe(o); } });
    assert.equal(result.status, "committed", JSON.stringify(c.errors));
    assert.ok(renewals >= 2, `the heartbeat ran while the request streamed (${renewals})`);
    assert.equal((await lease(input.operationId)).lease_token, null, "a committed turn holds no lease");

    // The SQL side: the claimant's token renews, any other token renews nothing.
    const other = await c.input("I ask again.");
    await c.f.runtime(c.cid, "begin", { ...other, serverRuntime: "dm-loop-v1" });
    const claim = await c.f.runtime(c.cid, "claim", { operationId: other.operationId });
    await c.f.query("update rpg_private.turns set lease_until=now()+interval '3 seconds' where id=$1", [other.operationId]);
    const stranger = await c.f.runtime(c.cid, "lease_heartbeat", { operationId: other.operationId, token: "00000000-0000-4000-8000-000000000000" });
    assert.equal(stranger.renewed, false);
    assert.ok((await lease(other.operationId)).seconds < 5, "a stranger's heartbeat changed nothing");
    const own = await c.f.runtime(c.cid, "lease_heartbeat", { operationId: other.operationId, token: claim.lease.token });
    assert.equal(own.renewed, true);
    assert.ok((await lease(other.operationId)).seconds > 290, "the claimant's heartbeat renewed the lease");
    await assert.rejects(c.f.runtime(c.cid, "lease_heartbeat", { operationId: "nope", token: claim.lease.token }), /rpg_validation/);
  } finally { await c.f.db.close(); }
});

test("leaseHeartbeat is a no-op for a store without renewal and never throws when a renewal fails", async () => {
  const stop = leaseHeartbeat({}, { campaignId: "c", operationId: "o", token: "t", expectedRevision: 0 }, 5);
  stop();
  let calls = 0;
  const failing = { renewLease: async () => { calls++; throw new Error("database away"); } };
  const stopFailing = leaseHeartbeat(failing, { campaignId: "c", operationId: "o", token: "t", expectedRevision: 0 }, 5);
  await sleep(30);
  stopFailing();
  assert.ok(calls >= 2);
});

test("a request cut by the cap with text only continues once from where it stopped, one level lower, and commits", async () => {
  const c = await loopCampaign();
  try {
    const played = await c.turn("I ask about the night shift at the mine.", [
      { text: "The foreman rubs his neck and starts to tell how the night shift went: the lamps went out first, then", stop: "max_tokens" },
      { text: " the bell by the shaft rang twice and nobody answered.", toolCalls: [finish()] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const requests = played.model.requests;
    assert.equal(requests.length, 2);
    const last = requests[1].messages.at(-1);
    assert.equal(last.role, "user");
    assert.equal(last.text, CUT_BY_CAP);
    assert.equal(requests[1].maxOutputTokens, 64000);
    const row = await c.row(played.input.operationId);
    assert.match(row.narration, /then the bell by the shaft rang twice/);
    const kinds = row.checkpoint.dmLoop.diagnostics.map((d) => d.kind);
    assert.ok(kinds.includes("max_tokens") && kinds.includes("cut_continued"));
  } finally { await c.f.db.close(); }
});

test("a request cut by the cap after complete tool calls executes them, then asks once to continue", async () => {
  const c = await loopCampaign();
  try {
    const played = await c.turn("I search the foreman's desk.", [
      { text: "The drawer sticks; inside lie a ledger and", toolCalls: [
        { name: "roll", arguments: { formula: "2d6", reason: "what the drawer holds", actorRef: "dm", visibility: "private" } },
      ], stop: "max_tokens" },
      { text: " a folded note with green wax.", toolCalls: [{ name: "advance_time", arguments: { minutes: 5, reason: "a search" } }, finish()] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const second = played.model.requests[1].messages;
    assert.equal(second.at(-2).role, "tool_results", "the complete call's result went back");
    assert.equal(second.at(-1).text, CUT_BY_CAP, "then the note to continue");
    const row = await c.row(played.input.operationId);
    assert.equal(row.checkpoint.dmLoop.receipts.filter((r) => r.call.name === "roll").length, 1, "the roll ran once");
  } finally { await c.f.db.close(); }
});

test("a request cut before it wrote anything leaves no empty assistant message; the turn still commits", async () => {
  const c = await loopCampaign();
  try {
    const played = await c.turn("I think about what to do.", [
      { text: "", stop: "max_tokens" },
      { text: "You weigh the two roads in silence.", toolCalls: [finish()] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const messages = played.model.requests[1].messages;
    assert.ok(!messages.some((m) => m.role === "assistant" && !m.text && !m.toolCalls.length), "no empty assistant message");
  } finally { await c.f.db.close(); }
});

// --- the adapters: a cut message never goes back to the provider broken ---------------------------
const sse = (events) => events.map(([event, data]) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`).join("");
const response = (text) => new Response(new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode(text)); controller.close(); } }),
  { status: 200, headers: { "content-type": "text/event-stream" } });
const request = { system: [{ text: "PREFIX", cache: true }], messages: [{ role: "user", text: "Я жду." }], toolset: null, effort: "high", maxOutputTokens: 32000 };

test("Anthropic: at max_tokens the cut tool call is dropped (no tool_call event, not in the native turn), so is unsigned thinking", async () => {
  const events = [
    ["message_start", { type: "message_start", message: { usage: { input_tokens: 10, output_tokens: 1 } } }],
    ["content_block_start", { type: "content_block_start", index: 0, content_block: { type: "thinking", thinking: "", signature: "" } }],
    ["content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "thinking_delta", thinking: "plan" } }],
    ["content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "signature_delta", signature: "SIG" } }],
    ["content_block_stop", { type: "content_block_stop", index: 0 }],
    ["content_block_start", { type: "content_block_start", index: 1, content_block: { type: "text", text: "" } }],
    ["content_block_delta", { type: "content_block_delta", index: 1, delta: { type: "text_delta", text: "Он ждёт." } }],
    ["content_block_stop", { type: "content_block_stop", index: 1 }],
    ["content_block_start", { type: "content_block_start", index: 2, content_block: { type: "tool_use", id: "t1", name: "roll", input: {} } }],
    ["content_block_delta", { type: "content_block_delta", index: 2, delta: { type: "input_json_delta", partial_json: "{\"formula\":\"1d20\"" } }],
    ["content_block_stop", { type: "content_block_stop", index: 2 }],
    ["content_block_start", { type: "content_block_start", index: 3, content_block: { type: "thinking", thinking: "", signature: "" } }],
    ["content_block_delta", { type: "content_block_delta", index: 3, delta: { type: "thinking_delta", thinking: "more" } }],
    ["content_block_stop", { type: "content_block_stop", index: 3 }],
    ["message_delta", { type: "message_delta", delta: { stop_reason: "max_tokens" }, usage: { output_tokens: 32000 } }],
    ["message_stop", { type: "message_stop" }],
  ];
  const model = createAnthropicDmModel("claude-opus-5-5", { apiKey: "synthetic-test-key-not-real", fetcher: async () => response(sse(events)) });
  const out = [];
  for await (const event of model.stream(request)) out.push(event);
  assert.equal(out.filter((e) => e.type === "tool_call").length, 0, "the cut call is not executed");
  const stop = out.find((e) => e.type === "stop");
  assert.equal(stop.reason, "max_tokens");
  assert.deepEqual(stop.native.items.map((item) => item.type), ["thinking", "text"], "only complete blocks go back");
  assert.ok(!stop.native.items.some((item) => "incomplete" in item));
});

test("Anthropic: a whitespace-only text block left before the cut is not sent back (the API refuses one)", async () => {
  const events = [
    ["message_start", { type: "message_start", message: { usage: { input_tokens: 10, output_tokens: 1 } } }],
    ["content_block_start", { type: "content_block_start", index: 0, content_block: { type: "thinking", thinking: "", signature: "" } }],
    ["content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "signature_delta", signature: "SIG" } }],
    ["content_block_stop", { type: "content_block_stop", index: 0 }],
    ["content_block_start", { type: "content_block_start", index: 1, content_block: { type: "text", text: "" } }],
    ["content_block_delta", { type: "content_block_delta", index: 1, delta: { type: "text_delta", text: "Стражник поднимает щит." } }],
    ["content_block_stop", { type: "content_block_stop", index: 1 }],
    ["content_block_start", { type: "content_block_start", index: 2, content_block: { type: "text", text: "" } }],
    ["content_block_delta", { type: "content_block_delta", index: 2, delta: { type: "text_delta", text: "\n\n" } }],
    ["content_block_stop", { type: "content_block_stop", index: 2 }],
    ["message_delta", { type: "message_delta", delta: { stop_reason: "max_tokens" }, usage: { output_tokens: 32000 } }],
    ["message_stop", { type: "message_stop" }],
  ];
  const model = createAnthropicDmModel("claude-opus-5-5", { apiKey: "synthetic-test-key-not-real", fetcher: async () => response(sse(events)) });
  const out = [];
  for await (const event of model.stream(request)) out.push(event);
  assert.deepEqual(out.find((e) => e.type === "stop").native.items.map((item) => item.type), ["thinking", "text"]);
});

test("A1: a continuation after a cut that the provider refuses goes again once with the cut message as plain text; the turn commits", async () => {
  const c = await loopCampaign();
  try {
    const played = await c.turn("I listen to the foreman's story.", [
      { text: "The foreman rubs his neck and begins: first the lamps went out, then", stop: "max_tokens" },
      { failBefore: "rejected" },
      { text: " the bell at the shaft rang twice and nobody answered.", toolCalls: [finish()] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const kinds = (await c.row(played.input.operationId)).checkpoint.dmLoop.diagnostics.map((d) => d.kind);
    assert.ok(kinds.includes("cut_continued") && kinds.includes("provider_error") && kinds.includes("cut_plain_retry"), kinds.join(","));
    const third = played.model.requests[2];
    assert.equal(third.messages[1].role, "assistant");
    assert.equal(third.messages[1].native, null, "the cut message goes back without its native blocks");
    assert.equal(third.messages.at(-1).text, CUT_BY_CAP);
    assert.match(played.result.narration, /then the bell at the shaft rang twice/);
    const again = await c.turn("I ask once more.", [
      { text: "He shrugs, and then", stop: "max_tokens" }, { failBefore: "rejected" }, { failBefore: "rejected" },
    ]);
    assert.equal(again.result.status, "failed", "only one plain retry");
  } finally { await c.f.db.close(); }
});

test("OpenAI: at max_output_tokens a trailing reasoning item without its following item is not sent back", async () => {
  const events = [
    ["response.output_item.done", { type: "response.output_item.done", output_index: 0, item: { type: "message", role: "assistant", content: [{ type: "output_text", text: "Он ждёт." }] } }],
    ["response.output_item.done", { type: "response.output_item.done", output_index: 1, item: { type: "reasoning", id: "rs_1", summary: [] } }],
    ["response.incomplete", { type: "response.incomplete", response: { usage: { input_tokens: 10, output_tokens: 32000 }, incomplete_details: { reason: "max_output_tokens" } } }],
  ];
  const model = createOpenAiDmModel("gpt-6-astra", { apiKey: "synthetic-test-key-not-real", fetcher: async () => response(sse(events)) });
  const out = [];
  for await (const event of model.stream(request)) out.push(event);
  const stop = out.find((e) => e.type === "stop");
  assert.equal(stop.reason, "max_tokens");
  assert.deepEqual(stop.native.items.map((item) => item.type), ["message"]);
});

// --- A3: bundled rolls -------------------------------------------------------------------------
test("A3: an attack with its damage is one call — damage only on a hit, a natural 20 doubles the dice, the target's hit points drop", async () => {
  const c = await loopCampaign();
  try {
    const brute = { name: "upsert_character", arguments: { localKey: "brute", name: "Brute", kind: "npc", present: true, hp: 30, maxHp: 30 } };
    // Dice: the hero's d20 rolls are forced; the damage dice follow.
    const played = await c.turn("I strike the brute with my staff, then again.", [
      { text: "You swing twice. ", toolCalls: [brute,
        { name: "roll", arguments: { formula: "1d20+5", reason: "staff at the brute", actorRef: c.hero, visibility: "player", kind: "attack", dc: 12, damage: "1d6+2", targetRef: "brute" } },
        { name: "roll", arguments: { formula: "1d20+5", reason: "staff again", actorRef: c.hero, visibility: "player", kind: "attack", dc: 12, damage: "1d6+2", targetRef: "brute" } },
        { name: "roll", arguments: { formula: "1d20+5", reason: "a third swing", actorRef: c.hero, visibility: "player", kind: "attack", dc: 12, damage: "1d6+2", targetRef: "brute" } }] },
      { text: "The first lands hard, the second cracks his jaw, the third misses.", toolCalls: [finish()] },
    ], { dice: [20, 4, 3, 10, 5, 1] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const receipts = (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts.filter((r) => r.call.name === "roll");
    assert.equal(receipts.length, 3);
    const [crit, hit, fumble] = receipts.map((r) => r.result.value.damage);
    assert.equal(crit.critical, true); assert.equal(crit.dice.length, 2, "a natural 20 doubles the dice"); assert.equal(crit.total, 4 + 3 + 2);
    assert.equal(hit.critical, false); assert.equal(hit.dice.length, 1); assert.equal(hit.total, 5 + 2);
    assert.equal(fumble.hit, false, "a natural 1 misses"); assert.equal(fumble.total, 0);
    // Fix S3-pre (wounds in words): the record carries the band the player reads instead of the foe's numbers.
    assert.deepEqual(crit.applied, { target: "Brute", before: 30, after: 21, max: 30, band: "lightly wounded" });
    assert.deepEqual(hit.applied, { target: "Brute", before: 21, after: 14, max: 30, band: "bloodied" });
    assert.equal((await c.state()).entities.find((e) => e.name === "Brute").hp, 14, "the commit carries the damage");
    assert.equal(played.model.requests.length, 2, "one request for the round, one to close");
    assert.match(receipts[0].result.player, /урон 9|damage 9/);
  } finally { await c.f.db.close(); }
});

test("A3: a save with its effect — full damage on a failure, half with halfOnSave on a success; damage without a difficulty is refused", async () => {
  const c = await loopCampaign();
  try {
    const goons = [
      { name: "upsert_character", arguments: { localKey: "g1", name: "Goon One", kind: "npc", present: true, hp: 20, maxHp: 20 } },
      { name: "upsert_character", arguments: { localKey: "g2", name: "Goon Two", kind: "npc", present: true, hp: 20, maxHp: 20 } },
    ];
    const played = await c.turn("I cast the fire at both.", [
      { text: "Fire rolls over them. ", toolCalls: [...goons,
        { name: "roll", arguments: { formula: "1d20+1", reason: "Goon One dodges the fire", actorRef: "g1", visibility: "private", kind: "save", dc: 15, damage: "4d6", halfOnSave: true } },
        { name: "roll", arguments: { formula: "1d20+1", reason: "Goon Two dodges the fire", actorRef: "g2", visibility: "private", kind: "save", dc: 15, damage: "4d6", halfOnSave: true } },
        { name: "roll", arguments: { formula: "2d6", reason: "no difficulty", actorRef: "dm", visibility: "private", damage: "1d6" } }] },
      { text: "One falls burning, the other rolls clear, scorched.", toolCalls: [finish()] },
    ], { dice: [3, 6, 6, 6, 6, 18, 5, 5, 5, 5] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const receipts = (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts.filter((r) => r.call.name === "roll");
    assert.equal(receipts[0].result.value.damage.total, 24, "failed: full");
    assert.equal(receipts[0].result.value.damage.applied.after, 0);
    assert.equal(receipts[1].result.value.damage.total, 10, "saved: half of 20");
    assert.equal(receipts[1].result.value.damage.applied.after, 10);
    assert.equal(receipts[2].result.ok, false);
    assert.match(receipts[2].result.reason, /damage needs an attack/);
  } finally { await c.f.db.close(); }
});

// --- A2: the turn's own breakpoints -------------------------------------------------------------
test("A2: a continuation marks the end of the previous request and its own end; the system keeps the latest two of its own", async () => {
  const { turnBreakpoints, anthropicRequestBody } = await import("../src/lib/server/dm/model/anthropic.ts");
  const user = { role: "user", text: "Я жду." };
  const reply = { role: "assistant", text: "Ты ждёшь.", toolCalls: [{ id: "t1", name: "roll", arguments: "{}" }], native: null };
  const results = { role: "tool_results", results: [{ callId: "t1", output: "{}", isError: false }] };
  assert.deepEqual(turnBreakpoints([user]), [0]);
  assert.deepEqual(turnBreakpoints([user, reply, results]), [0, 2]);
  const system = [{ text: "role", cache: true, ttl: "1h" }, { text: "world", cache: true, ttl: "1h" }, { text: "h1", cache: true, ttl: "1h", breakpoint: false },
    { text: "h2", cache: true, ttl: "1h", breakpoint: true }, { text: "living", cache: true, ttl: "5m", breakpoint: false }, { text: "tail", cache: false }, { text: "now", cache: false }];
  const body = anthropicRequestBody("claude-opus-5-5", { system, messages: [user, reply, results], toolset: null, effort: "high", maxOutputTokens: 100, cacheTurn: true });
  const systemMarks = body.system.map((block, index) => (block.cache_control ? index : null)).filter((v) => v !== null);
  assert.deepEqual(systemMarks, [1, 3], "the world and the history's end");
  assert.deepEqual(body.messages[0].content.at(-1).cache_control, { type: "ephemeral" }, "where the previous request ended");
  assert.deepEqual(body.messages[2].content.at(-1).cache_control, { type: "ephemeral" }, "this request's end");
  const total = body.system.filter((b) => b.cache_control).length + body.messages.flatMap((m) => m.content).filter((c) => c.cache_control).length;
  assert.equal(total, 4, "the provider's limit");
});

test("A2: the DM's observations are appended, never rewritten; a known line adds nothing; the oldest leave first when full", async () => {
  const { appendObservations, OBSERVATIONS_CAP } = await import("../src/lib/gameplay/dm-loop/observations.ts");
  assert.equal(appendObservations("", "Любит торговаться."), "Любит торговаться.");
  assert.equal(appendObservations("Любит торговаться.", "Просит показывать сложность в каждом броске."), "Любит торговаться.\nПросит показывать сложность в каждом броске.");
  assert.equal(appendObservations("Любит торговаться.", "любит торговаться"), "Любит торговаться.", "the same line is not repeated");
  const full = Array.from({ length: 60 }, (_, i) => `Наблюдение номер ${i} о том, что нравится игроку.`).join("\n");
  assert.ok(full.length > OBSERVATIONS_CAP);
  const next = appendObservations(full, "Новое наблюдение.");
  assert.ok(next.length <= OBSERVATIONS_CAP);
  assert.ok(next.endsWith("Новое наблюдение."));
  assert.ok(!next.startsWith("Наблюдение номер 0 "), "the oldest line left first");
});

// --- the DM options (migration 73) ---------------------------------------------------------------
test("the DM options: stored as one object, merged key by key, defaults in TypeScript, unknown values refused; the turn's source carries them", async () => {
  const c = await loopCampaign();
  try {
    const before = await c.settings.read();
    assert.deepEqual(before.options, { continuation: "same", instructions: "ru", companionRolls: "dm", secretsVisible: false, memory: "standard", pureSimulation: false });
    const saved = await c.settings.save({ expectedRevision: before.revision, runtime: "dm-loop-v1", dmTurn: before.dmTurn, options: { continuation: "lighter", memory: "wide" } });
    assert.equal(saved.options.continuation, "lighter");
    assert.equal(saved.options.memory, "wide");
    const again = await c.settings.save({ expectedRevision: saved.revision, runtime: "dm-loop-v1", dmTurn: saved.dmTurn, options: { instructions: "en" } });
    assert.deepEqual(again.options, { continuation: "lighter", instructions: "en", companionRolls: "dm", secretsVisible: false, memory: "wide", pureSimulation: false }, "merged");
    await assert.rejects(c.settings.save({ expectedRevision: again.revision, runtime: "dm-loop-v1", dmTurn: again.dmTurn, options: { continuation: "never" } }), /validation/);
    await assert.rejects(c.settings.save({ expectedRevision: again.revision, runtime: "dm-loop-v1", dmTurn: again.dmTurn, options: { memory: "huge" } }), /validation/);
    // The source of the next turn carries them; a lighter continuation runs one notch below the turn.
    const played = await c.turn("I ask about the work.", [
      { text: "She checks the board. ", toolCalls: [{ name: "roll", arguments: { formula: "2d6", reason: "her mood", actorRef: "dm", visibility: "private" } }] },
      { text: "Then she names the pay.", toolCalls: [{ name: "advance_time", arguments: { minutes: 5, reason: "talk" } }, finish()] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const row = await c.row(played.input.operationId);
    assert.equal(row.source.dmOptions.memory, "wide");
    const pin = row.checkpoint.dmLoop.pin;
    assert.equal(played.model.requests[1].effort, pin.continuationEffort);
    assert.notEqual(pin.continuationEffort, pin.effort);
  } finally { await c.f.db.close(); }
});

test("A3: on the lighter continuation, the request that answers «narrate the outcome» thinks at the turn's own depth", async () => {
  const c = await loopCampaign();
  try {
    const before = await c.settings.read();
    await c.settings.save({ expectedRevision: before.revision, runtime: "dm-loop-v1", dmTurn: before.dmTurn, options: { continuation: "lighter" } });
    const played = await c.turn("I try to pick the lock.", [
      { text: "You kneel at the lock. ", toolCalls: [{ name: "roll", arguments: { formula: "1d20+2", reason: "picking the lock", actorRef: c.hero, visibility: "player", difficulty: "normal" } }] },
      { text: "", toolCalls: [{ name: "advance_time", arguments: { minutes: 5, reason: "the lock" } }, finish()] },
      { text: "The pins give one by one and the lock opens.", toolCalls: [finish()] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const row = await c.row(played.input.operationId);
    assert.ok(row.checkpoint.dmLoop.diagnostics.some((d) => d.kind === "outcome_asked"));
    const pin = row.checkpoint.dmLoop.pin;
    assert.equal(played.model.requests[1].effort, pin.continuationEffort, "the plain continuation is lighter");
    assert.equal(played.model.requests[2].effort, pin.effort, "the outcome is narrated at the turn's depth");
  } finally { await c.f.db.close(); }
});

// --- A3: the party council is a light call ---------------------------------------------------------
test("A3: a council line is a light call — the role layer and one small block, notes and time only, medium depth, the hero never a listener", async () => {
  const c = await loopCampaign();
  try {
    const join = await c.turn("I hire Tam to come along.", [{ text: "Tam shoulders his pack. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "tam", name: "Tam", kind: "companion", party: true, present: true, description: "A dry, careful porter." } },
      { name: "note_character", arguments: { actorRef: "tam", identity: { wants: ["get paid on time"], observableVoice: "Dry." } } }, finish()] }]);
    assert.equal(join.result.status, "committed", JSON.stringify(c.errors));
    const tam = (await c.state()).entities.find((row) => row.name === "Tam");
    const played = await c.turn("Tam, what do you make of the organiser?", [{ text: "— Pays late, — Tam says.", toolCalls: [
      { name: "advance_time", arguments: { minutes: 2, reason: "a word on the road" } }, finish()] }],
      { mode: "companion", companionId: tam.id, listenerIds: [c.hero] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const request = played.model.requests[0];
    assert.equal(request.system.length, 2, "the cached role layer and the council block");
    assert.match(request.system[1].text, /Party council/);
    assert.match(request.system[1].text, /Tam \(.*speaks\)[\s\S]*get paid on time/);
    assert.doesNotMatch(request.system[1].text, /listens\)[^\n]*Garrick|Garrick \([^)]*listens/, "the hero is never a listener");
    assert.deepEqual(request.toolset.tools.map((tool) => tool.name).sort(), ["advance_time", "finish_turn", "note_character", "note_world"]);
    assert.equal(request.effort, "medium");
    const full = join.model.requests[0];
    assert.equal(request.system[0].text, full.system[0].text, "the role layer is the turns' own (its cache is shared)");
    const bytes = (blocks) => blocks.reduce((sum, block) => sum + block.text.length, 0);
    assert.ok(bytes(request.system) < bytes(full.system), "smaller than a full turn's request");
  } finally { await c.f.db.close(); }
});

// --- A3: polling ---------------------------------------------------------------------------------
test("A3: the poll never overlaps, grows its delay while it must poll, backs off harder after a failure and pauses in a hidden tab", async () => {
  const { createBackoffPoll } = await import("../src/lib/ui/backoff-poll.ts");
  const queue = [];
  const timers = { set: (fn, ms) => { const handle = { fn, ms }; queue.push(handle); return handle; }, clear: (handle) => { const at = queue.indexOf(handle); if (at >= 0) queue.splice(at, 1); } };
  let hidden = false, active = true, calls = 0, fail = false, release = null;
  const run = () => { calls++; if (fail) return Promise.reject(new Error("503")); return new Promise((resolve) => { release = resolve; }); };
  const poll = createBackoffPoll({ run, active: () => active, baseMs: 1000, maxMs: 8000, factor: 2, timers, hidden: () => hidden });
  const step = async () => { const next = queue.shift(); await next.fn(); return next.ms; };
  // The first tick starts a read that does not settle yet.
  const first = queue.shift();
  assert.equal(first.ms, 1000);
  void first.fn();
  await Promise.resolve();
  assert.equal(calls, 1);
  // A tick while the read runs schedules, never overlaps (the read has not settled yet).
  release(); await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(queue[0].ms, 2000, "the delay grew after a poll that must go on");
  fail = true;
  await step();
  assert.equal(queue[0].ms, 8000, "a failure backs off twice as hard (capped at twice the max)");
  hidden = true; fail = false;
  await step();
  assert.equal(calls, 2, "a hidden tab is not polled");
  assert.equal(queue[0].ms, 1000, "back to the base while hidden");
  hidden = false; active = false;
  await step();
  assert.equal(calls, 2, "nothing to poll, nothing asked");
  poll.kick();
  assert.equal(queue.at(-1).ms, 0, "a kick asks now");
  poll.stop();
  assert.equal(queue.length, 0);
});

// --- A4: the digest -----------------------------------------------------------------------------
test("A4: an unparsed digest names why; the digest gets the loop's ceiling", async () => {
  const { unparsedReason, DIGEST_OUTPUT_TOKENS } = await import("../src/lib/gameplay/dm-loop/digest.ts");
  assert.equal(DIGEST_OUTPUT_TOKENS, 32000);
  assert.equal(unparsedReason("{\"recap\": \"Ранее", "max_tokens"), "cut by the output cap");
  assert.equal(unparsedReason("", "end"), "no text in the answer");
  assert.equal(unparsedReason("Ранее в кампании…", "end"), "no JSON object in the answer");
  assert.match(unparsedReason("{\"recap\": \"x\"}", "end"), /lacks a recap or a title/);
});

test("A4: one digest per session at a time; no entry digest while one runs or after one failed; the entry check at most once a minute", async () => {
  const guard = await import("../src/lib/gameplay/dm-loop/digest-guard.ts");
  const now = 1_000_000;
  assert.equal(guard.entryCheckDue("camp-a", now), true);
  assert.equal(guard.entryCheckDue("camp-a", now + 30_000), false, "within the minute");
  assert.equal(guard.entryCheckDue("camp-a", now + 61_000), true);
  assert.equal(guard.entryCheckDue("camp-b", now + 30_000), true, "per campaign");
  assert.equal(guard.entryDigestAllowed("camp-a", "s1"), true, "nothing known: allowed");
  // The end digest is scheduled and starts; an entry digest that comes meanwhile is refused.
  assert.equal(guard.digestSchedulable("camp-a", "s1"), true);
  guard.setStatus("camp-a", "s1", { state: "running", reason: null, costUsd: null });
  assert.equal(guard.digestSchedulable("camp-a", "s1"), false, "a scheduled digest blocks a second one");
  assert.equal(guard.enterDigest("camp-a", "s1"), true);
  assert.equal(guard.enterDigest("camp-a", "s1"), false, "never two runs");
  assert.equal(guard.entryDigestAllowed("camp-a", "s1"), false);
  guard.setStatus("camp-a", "s1", { state: "failed", reason: "unparsed", costUsd: 0.4 });
  guard.leaveDigest("camp-a", "s1");
  assert.equal(guard.entryDigestAllowed("camp-a", "s1"), false, "a failed digest is not retried on entry");
  assert.equal(guard.digestSchedulable("camp-a", "s1"), true, "the owner's «Повторить» may schedule it");
  // A «running» left by a schedule that never started does not block the retry.
  guard.setStatus("camp-a", "s2", { state: "running", reason: null, costUsd: null });
  guard.clearStaleRunning("camp-a", "s2");
  assert.equal(guard.readDigestStatus("camp-a", "s2"), null);
});

// --- A3/A6: the owner panel's reading of a turn's price ---------------------------------------------
test("the owner panel flags a turn over $1 or 4 requests and names its causes in Russian; the unrecorded phrase agrees in number", async () => {
  const { causeLabel, turnFlagged, unrecordedPhrase } = await import("../src/lib/ui/turn-costs.ts");
  assert.equal(turnFlagged({ stats: { costUsd: 0.46, requests: 3 } }), false);
  assert.equal(turnFlagged({ stats: { costUsd: 0.52, requests: 4 } }), false, "four requests is the limit, not over it");
  assert.equal(turnFlagged({ stats: { costUsd: 1.06, requests: 1 } }), true);
  assert.equal(turnFlagged({ stats: { costUsd: 0.3, requests: 5 } }), true);
  assert.equal(causeLabel("rolls not bundled: 3 requests ended on rolls alone", "ru"), "броски не собраны вместе: 3 запроса только с бросками");
  assert.equal(causeLabel("deep thinking (xhigh)", "ru"), "глубокое обдумывание (очень высокая)");
  assert.equal(causeLabel("a low cache share (0.45)", "ru"), "мало прочитано из кэша (45%)");
  assert.equal(causeLabel("a long continuation chain: 6 requests", "en"), "a long continuation chain: 6 requests");
  assert.equal(causeLabel("something new", "ru"), "something new");
  assert.deepEqual([1, 2, 5, 11, 21, 22, 112].map(unrecordedPhrase), ["1 незаписанное событие", "2 незаписанных события", "5 незаписанных событий",
    "11 незаписанных событий", "21 незаписанное событие", "22 незаписанных события", "112 незаписанных событий"]);
});
