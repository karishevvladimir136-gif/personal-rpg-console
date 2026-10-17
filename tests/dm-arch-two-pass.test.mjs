// The experimental writer + bookkeeper runtime (docs/stages/DM_ARCH.md) on the
// real turn path with scripted models: the ledger never reaches the player, the
// bookkeeper's records commit, a roll pauses and resumes inside the writer's pass.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { runTwoPassTurn, resumeTwoPassTurn, splitLedger, createLedgerGate, writerSystem, bookkeeperSystem,
  BOOKKEEPER_MARKER, twoPassFlag } from "../src/lib/gameplay/dm-loop/two-pass/index.ts";
import { buildDmLoopContext } from "../src/lib/gameplay/dm-loop/context.ts";
import { joinText } from "../src/lib/gameplay/dm-loop/loop.ts";

const LEDGER = "<ledger>\nlюди — Мира, пекарша\nвремя — 5 минут\nсцена — trade; напряжение дальше: calm\n</ledger>";

async function twoPass(c, text, writerRounds, bookkeeperRounds, options = {}) {
  const writer = createScriptedDmModel(writerRounds, { providerId: "anthropic", modelId: "claude-fable-5-1", chunk: options.chunk ?? 7 });
  const bookkeeper = createScriptedDmModel(bookkeeperRounds, { providerId: "anthropic", modelId: "claude-opus-5-5" });
  const base = await c.deps(writer);
  // The bench pins the variant's writer over the campaign's SQL-valid choice; the same here.
  const deps = { ...base, pin: async (claim) => ({ ...(await base.pin(claim)), providerId: "anthropic", modelId: "claude-fable-5-1", effort: "high" }),
    bookkeeper: { providerId: "anthropic", modelId: "claude-opus-5-5", effort: "high", model: bookkeeper } };
  const input = await c.input(text);
  if (options.dice) c.forceDice(options.dice);
  let result = await runTwoPassTurn(input, deps);
  const statuses = [result.status];
  let continues = 0;
  while (result.status === "awaiting_confirmation" && continues < 4) {
    continues++;
    result = await resumeTwoPassTurn({ commandId: randomUUID(), campaignId: c.cid, operationId: input.operationId,
      timeline: input.timeline, action: "continue", checkId: null }, deps);
    statuses.push(result.status);
  }
  return { input, result, writer, bookkeeper, statuses, continues, deps };
}

test("splitLedger and the stream gate keep the ledger away from the player", () => {
  const text = `Марта вытирает руки.\n\nОна ждёт.\n\n${LEDGER}`;
  const split = splitLedger(text);
  assert.equal(split.narration, "Марта вытирает руки.\n\nОна ждёт.");
  assert.match(split.ledger, /^lюди — Мира/u);
  assert.ok(split.found);
  assert.deepEqual(splitLedger("Только текст."), { narration: "Только текст.", ledger: "", found: false });
  // An unclosed ledger is taken to the end.
  assert.equal(splitLedger("Текст. <LEDGER>\nвремя — 5").narration, "Текст.");
  const gate = createLedgerGate();
  let shown = "";
  for (let at = 0; at < text.length; at += 5) shown += gate.push(text.slice(at, at + 5));
  shown += gate.flush();
  assert.equal(shown, "Марта вытирает руки.\n\nОна ждёт.\n\n");
  // A lone "<" that is not the tag is released once known.
  const gate2 = createLedgerGate();
  assert.equal(gate2.push("a < b ") + gate2.push("c") + gate2.flush(), "a < b c");
});

test("the writer's layer 1 keeps the campaign line, doctrine and cards; the bookkeeper gets no craft or canon", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    await c.activateStage4Craft();
    const { f } = c;
    const store = (await c.deps(createScriptedDmModel([]))).store;
    const play = await store.readPlay(c.cid);
    const claimSource = await f.one("select 1 as one");
    void claimSource;
    // Build the default context through the store's source as the loop would.
    const input = { operationId: randomUUID(), campaignId: c.cid, timeline: play.timeline, expectedRevision: play.revision,
      mode: "game", input: "Оглядываюсь.", companionId: null, listenerIds: [], mechanic: null };
    await store.begin(input, "dm-loop-v1");
    const claim = await store.claim(c.cid, input.operationId);
    const context = buildDmLoopContext(claim.source, input);
    const writer = writerSystem(context.system, "Russian");
    assert.equal(writer.length, 5);
    assert.match(writer[0].text, /You write; a bookkeeper records/);
    assert.match(writer[0].text, /Campaign language: Russian/);
    assert.match(writer[0].text, /DM Craft — how to run/);
    assert.doesNotMatch(writer[0].text, /Tools available: roll, query_state/);
    assert.equal(writer[1].text, context.system[1].text);
    assert.equal(writer[4].text, context.system[4].text);
    const bookkeeper = bookkeeperSystem(context.system, "Russian");
    assert.equal(bookkeeper.length, 4);
    assert.match(bookkeeper[0].text, /You are the bookkeeper/);
    assert.doesNotMatch(bookkeeper[0].text, /\broll\b, /);
    assert.equal(bookkeeper[1].text, context.system[2].text);
    assert.equal(bookkeeper[3].text, context.system[4].text);
    assert.doesNotMatch(bookkeeper.map((b) => b.text).join("\n"), /Canon documents/);
    await store.cancel({ commandId: randomUUID(), campaignId: c.cid, operationId: input.operationId, timeline: input.timeline, action: "cancel", checkId: null });
  } finally { await c.f.db.close(); }
});

test("a plain turn: the narration streams without the ledger, the bookkeeper's records commit", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const played = await twoPass(c, "Иду к пекарне.", [
      { text: `— Две монеты за буханку, — говорит пекарша Мира, не поднимая глаз.\n\nТы отсчитываешь монеты.\n\n${LEDGER}` },
    ], [
      { text: "", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "mira", name: "Мира", kind: "npc", present: true } },
        { name: "item", arguments: { action: "create", localKey: "bread", name: "Буханка хлеба", category: "consumable", quantity: 1, ownerRef: c.hero } },
        { name: "advance_time", arguments: { minutes: 5 } },
        { name: "finish_turn", arguments: { sceneKinds: ["trade"], spotlight: ["mira"], playerMoment: false, nextTension: "calm" } },
      ] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(played.result.narration, "— Две монеты за буханку, — говорит пекарша Мира, не поднимая глаз.\n\nТы отсчитываешь монеты.");
    // The stream keeps the blank lines that preceded the ledger; the saved narration is trimmed.
    const shown = c.live.filter((e) => e.type === "text").map((e) => e.text).join("");
    assert.equal(shown.trim(), played.result.narration);
    assert.doesNotMatch(shown, /ledger/i);
    const state = await c.state();
    assert.ok(state.entities.some((e) => e.name === "Мира"));
    assert.ok(state.items.some((i) => i.name === "Буханка хлеба" && i.owner_entity_id === c.hero));
    const row = await c.row(played.input.operationId);
    const loop = row.checkpoint.dmLoop;
    assert.equal(loop.meta.sceneKinds[0], "trade");
    assert.equal(loop.usage.length, 2);
    assert.deepEqual(loop.usage.map((u) => u.modelId), ["claude-fable-5-1", "claude-opus-5-5"]);
    assert.ok(loop.transcript.some((m) => m.role === "user" && m.text.startsWith(BOOKKEEPER_MARKER)));
    // The writer saw only roll; the bookkeeper everything but roll, and the ledger in its brief.
    assert.deepEqual(played.writer.requests[0].toolset.tools.map((t) => t.name), ["roll"]);
    assert.ok(!played.bookkeeper.requests[0].toolset.tools.some((t) => t.name === "roll"));
    assert.ok(played.bookkeeper.requests[0].toolset.tools.some((t) => t.name === "finish_turn"));
    const brief = played.bookkeeper.requests[0].messages[0].text;
    assert.match(brief, /Writer's ledger \(private\):\nlюди — Мира/u);
    assert.match(brief, /Rolls this turn: none/);
    // The player's chips come from the bookkeeper's accepted calls.
    assert.ok(c.live.some((e) => e.type === "tool" && e.name === "item"));
  } finally { await c.f.db.close(); }
});

test("a roll pauses the writer's pass and resumes it; the roll reaches the bookkeeper's brief", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const played = await twoPass(c, "Пробую пройти тихо.", [
      { parts: [{ text: "Рэй тянет ставню —" }, { toolCall: { name: "roll", arguments: { formula: "1d20", reason: "Скрытность: пройти мимо", actorRef: c.hero, visibility: "player", difficulty: "normal" } } }] },
      { text: `— и петля не скрипит. Во дворе тихо.\n\n<ledger>\nвремя — 10 минут\nсцена — exploration; напряжение дальше: tense\n</ledger>` },
    ], [
      { text: "", toolCalls: [
        { name: "advance_time", arguments: { minutes: 10 } },
        { name: "finish_turn", arguments: { sceneKinds: ["exploration"], spotlight: [], playerMoment: false, nextTension: "tense" } },
      ] },
    ], { dice: [15] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    assert.deepEqual(played.statuses, ["awaiting_confirmation", "committed"]);
    // Joined by the default loop's own rule (a sentence interrupted by a roll continues on the same line).
    assert.equal(played.result.narration, joinText("Рэй тянет ставню —", "— и петля не скрипит. Во дворе тихо."));
    assert.match(played.result.narration, /^Рэй тянет ставню —\s?и петля не скрипит\. Во дворе тихо\.$/u);
    const row = await c.row(played.input.operationId);
    const receipts = row.checkpoint.dmLoop.receipts;
    assert.equal(receipts.filter((r) => r.call.name === "roll").length, 1);
    assert.equal(played.result.checks.length, 1);
    const brief = played.bookkeeper.requests[0].messages[0].text;
    assert.match(brief, /Rolls this turn: \n- Скрытность: пройти мимо: .*shown to the player, dice 15 total 15, success/u);
    // The writer's second request carried the roll's result, not the bookkeeper's marker.
    const second = played.writer.requests[1];
    assert.equal(second.messages.at(-1).role, "tool_results");
    assert.ok(!second.messages.some((m) => m.role === "user" && m.text.startsWith(BOOKKEEPER_MARKER)));
  } finally { await c.f.db.close(); }
});

test("a bookkeeper that answers with text only is asked once for the records; a writer without a ledger still commits", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const played = await twoPass(c, "Смотрю на море.", [
      { text: "Море серое и спокойное." },
    ], [
      { text: "Nothing to record." },
      { text: "", toolCalls: [
        { name: "advance_time", arguments: { minutes: 3 } },
        { name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [], playerMoment: false } },
      ] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(played.result.narration, "Море серое и спокойное.");
    assert.match(played.bookkeeper.requests[0].messages[0].text, /Writer's ledger: none was written/);
    assert.equal(played.bookkeeper.requests.length, 2);
    assert.match(played.bookkeeper.requests[1].messages.at(-1).text, /No records were made yet/);
    const row = await c.row(played.input.operationId);
    assert.ok(row.checkpoint.dmLoop.diagnostics.some((d) => d.kind === "finish_asked"));
    assert.equal(row.checkpoint.dmLoop.meta.sceneKinds[0], "quiet");
  } finally { await c.f.db.close(); }
});

test("the server flag: off by default, the bookkeeper named with an effort, an optional writer override", () => {
  assert.equal(twoPassFlag({}), null);
  assert.equal(twoPassFlag({ DM_TWO_PASS: "off" }), null);
  assert.equal(twoPassFlag({ DM_TWO_PASS: "nonsense" }), null);
  assert.deepEqual(twoPassFlag({ DM_TWO_PASS: "anthropic/claude-opus-5-5@medium" }),
    { bookkeeper: { providerId: "anthropic", modelId: "claude-opus-5-5", effort: "medium" }, writer: null });
  assert.deepEqual(twoPassFlag({ DM_TWO_PASS: "anthropic/claude-sonnet-5-5", DM_TWO_PASS_WRITER: "anthropic/claude-fable-5-1@xhigh" }),
    { bookkeeper: { providerId: "anthropic", modelId: "claude-sonnet-5-5", effort: "high" }, writer: { providerId: "anthropic", modelId: "claude-fable-5-1", effort: "xhigh" } });
});
