// Polish stage, group 3 (docs/stages/POLISH.md items 12–14, 22): the depth rule
// (the base holds; the top for a climax, a due plan or a decisive input; two deep
// turns at most unless the DM marks a climax again), the prompt order (a stable
// dossier cached for an hour, the session's tail after the breakpoint), the
// first word measured from the player's send, the per-turn log, the default
// depth range of a new campaign, and the legacy memory left out of the loop.
import test from "node:test";
import assert from "node:assert/strict";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { chooseDepth, decisiveInput, DEFAULT_DEPTH_RANGE, effortForTension, MAX_DEEP_STREAK, parseDepthState } from "../src/lib/gameplay/dm-loop/depth.ts";
import { parseDmSettings } from "../src/lib/gameplay/dm-loop/settings.ts";
import { registerHooks } from "node:module";
import { dmModels, dmUsageCost } from "../src/lib/model-runtime/dm-models.ts";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only" ? { url: "data:text/javascript,export%20{}", shortCircuit: true } : nextResolve(specifier, context);
} });
const { anthropicRequestBody } = await import("../src/lib/server/dm/model/anthropic.ts");
hook.deregister();

const finish = (extra = {}) => ({ name: "finish_turn", arguments: { sceneKinds: ["conversation"], spotlight: [], playerMoment: false, ...extra } });
const publicTurn = async (c, operationId) => (await (await c.deps(createScriptedDmModel([]))).store.readPlay(c.cid)).turns.find((row) => row.id === operationId);

test("depth rule: calm is the base; a climax is always the top; a tense turn is the top for at most three in a row until a climax or a calm turn resets it", () => {
  const range = { min: "high", max: "xhigh" };
  assert.equal(MAX_DEEP_STREAK, 3);
  assert.equal(effortForTension(range, "calm"), "high");
  assert.equal(effortForTension(range, "tense"), "xhigh");
  assert.equal(effortForTension(range, "climax"), "xhigh");
  const tense = { tension: "tense", reason: "DM hint: tense" };
  // Three deep tense turns, then the base while the tension holds.
  let state = { tension: "calm", effort: "high", streak: 0 };
  const efforts = [];
  for (let i = 0; i < 5; i++) {
    const d = chooseDepth(range, "high", state, tense, false);
    efforts.push(d.effort);
    state = { tension: d.tension, effort: d.effort, streak: d.streak };
  }
  assert.deepEqual(efforts, ["xhigh", "xhigh", "xhigh", "high", "high"], `after ${MAX_DEEP_STREAK} deep tense turns the base returns`);
  assert.equal(state.streak, 5);
  const capped = chooseDepth(range, "high", { tension: "tense", effort: "xhigh", streak: 3 }, tense, false);
  assert.match(capped.reason, /deep tense turns in a row/);
  // A climax is never capped and resets the count; so does a calm turn.
  for (const reason of ["active combat", "DM hint: climax", "an off-screen plan comes due and meets the hero", "the player's input opens a decisive moment"]) {
    const climax = chooseDepth(range, "high", { tension: "tense", effort: "high", streak: 7 }, { tension: "climax", reason }, false);
    assert.equal(climax.effort, "xhigh", reason); assert.equal(climax.streak, 0, reason);
  }
  const climaxes = [];
  state = null;
  for (let i = 0; i < 5; i++) {
    const d = chooseDepth(range, "high", state, { tension: "climax", reason: "active combat" }, false);
    climaxes.push(d.effort); state = { tension: d.tension, effort: d.effort, streak: d.streak };
  }
  assert.deepEqual(climaxes, ["xhigh", "xhigh", "xhigh", "xhigh", "xhigh"], "a long fight stays deep");
  const boosted = chooseDepth(range, "high", { tension: "tense", effort: "high", streak: 4 }, tense, true);
  assert.equal(boosted.effort, "xhigh"); assert.equal(boosted.streak, 0, "«важный ход» is a climax");
  const calm = chooseDepth(range, "high", { tension: "tense", effort: "high", streak: 4 }, { tension: "calm", reason: "DM hint: calm" }, false);
  assert.equal(calm.effort, "high"); assert.equal(calm.streak, 0);
  const afterReset = chooseDepth(range, "high", { tension: calm.tension, effort: calm.effort, streak: calm.streak }, tense, false);
  assert.equal(afterReset.effort, "xhigh", "after a calm turn a tense turn is deep again");
  // A count stored after a climax (or under the older rule) does not cap a tense turn.
  assert.equal(chooseDepth(range, "high", { tension: "climax", effort: "xhigh", streak: 2 }, tense, false).effort, "xhigh");
  // A single-level range never reports a cap.
  assert.equal(chooseDepth({ min: "high", max: "high" }, "high", { tension: "tense", effort: "high", streak: 9 }, tense, false).reason, "DM hint: tense");
  assert.equal(chooseDepth(null, "medium", null, { tension: "climax", reason: "x" }, false).effort, "medium");
  assert.deepEqual(parseDepthState({ fact: { depth_state: JSON.stringify({ tension: "climax", effort: "xhigh", streak: 2 }) } }), { tension: "climax", effort: "xhigh", streak: 2 });
  assert.equal(decisiveInput("Бью Фрола веслом по рукам и прыгаю за ящиком."), true);
  assert.equal(decisiveInput("Признаюсь Марте, что ящик у меня."), true);
  assert.equal(decisiveInput("I draw and attack the stranger."), true);
  assert.equal(decisiveInput("Спрашиваю Марту про рыбу и сажусь у окна."), false);
  assert.equal(decisiveInput("I ask the organiser about the notices."), false);
  assert.deepEqual(DEFAULT_DEPTH_RANGE, { min: "high", max: "xhigh" });
  // A campaign that never set its depth (no row: revision 0) gets the default range; a stored null stays fixed.
  const fresh = parseDmSettings({ campaignId: "c", runtime: "dm-loop-v1", dmTurn: null, limits: null, depth: null, notebookVisible: false, boostNext: false, revision: 0 });
  assert.deepEqual(fresh.depth, { min: "high", max: "xhigh" });
  const fixed = parseDmSettings({ campaignId: "c", runtime: "dm-loop-v1", dmTurn: null, limits: null, depth: null, notebookVisible: false, boostNext: false, revision: 3 });
  assert.equal(fixed.depth, null);
});

test("a decisive player input and a due off-screen plan take the top of the range; the depth and its reason reach the public turn", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const current = await c.settings.read();
    await c.settings.save({ expectedRevision: current.revision, runtime: "dm-loop-v1", dmTurn: { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" }, depth: { min: "high", max: "xhigh" } });
    const quiet = await c.turn("Спрашиваю Марту про рыбу.", [{ text: "Марта пожимает плечами. ", toolCalls: [finish({ nextTension: "tense" })] }]);
    assert.equal(quiet.model.requests[0].effort, "high", "a quiet input stays at the base even when the DM says tense");
    const decisive = await c.turn("Бью Фрола веслом и прыгаю за ящиком.", [{ text: "Весло свистит. ", toolCalls: [finish({ nextTension: "calm" })] }]);
    assert.equal(decisive.model.requests[0].effort, "xhigh");
    const turn = await publicTurn(c, decisive.input.operationId);
    assert.equal(turn.stats.effort, "xhigh");
    assert.match(turn.stats.depthReason, /decisive moment/);
    assert.equal(turn.stats.depthTension, "climax");
    assert.ok(Number.isFinite(turn.stats.firstWordMs) && turn.stats.firstWordMs >= 0, "the first word is measured from the player's send");
    // A plan that comes due: the next turn is deep too; the third deep turn in a row returns to the base.
    const planned = await c.turn("Жду у стойки.", [{ text: "Тихо. ", toolCalls: [
      { name: "note_world", arguments: { kind: "fact", key: "plan_frol", operation: "set", value: "Фрол идёт к стойке.", actorRef: "world", dueInMinutes: 0, consequence: "Фрол здесь." } },
      finish({ nextTension: "calm" })] }]);
    assert.equal(planned.result.status, "committed", JSON.stringify(c.errors));
    const due = await c.turn("Оглядываюсь.", [{ text: "Фрол у стойки. ", toolCalls: [
      { name: "note_world", arguments: { kind: "fact", key: "plan_frol", operation: "set", planStatus: "done" } }, finish({ nextTension: "calm" })] }]);
    assert.equal(due.model.requests[0].effort, "xhigh", "a due plan meets the hero: deep");
    assert.match((await c.row(due.input.operationId)).checkpoint.dmLoop.pin.depth.reason, /comes due/);
    const observed = c.observations.filter((o) => o.type === "turn_finished");
    assert.ok(observed.length >= 4);
    const last = observed.at(-1);
    assert.equal(last.effort, "xhigh");
    assert.ok(last.turnMs >= 0 && last.requests >= 1 && typeof last.costUsd === "number");
  } finally { await c.f.db.close(); }
});

test("the prompt is ordered by volatility: how to DM, the world, the conversation's history, the living dossier, then the session's tail and «now» uncached", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const played = await c.turn("Говорю с Дуней.", [{ text: "Дуня слушает. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "dunya", name: "Дуня", kind: "npc", description: "Лодочница.", present: true, important: true } },
      { name: "note_character", arguments: { actorRef: "dunya", identity: { wants: ["вернуть лодку"], observableVoice: "Коротко, по делу." }, current: { goal: "получить шестнадцать монет" } } },
      { name: "quest", arguments: { action: "create", localKey: "debt", kind: "debt", title: "Шестнадцать монет Дуне", description: "Залог.", counterpartRef: "dunya" } },
      { name: "note_world", arguments: { kind: "fact", key: "plan_stranger", operation: "set", value: "Чужак ищет лодку.", actorRef: "world", dueInMinutes: 600, consequence: "Лодка найдена." } },
      finish()] }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const again = await c.turn("Спрашиваю Дуню о лодке.", [{ text: "— Лодка? ", toolCalls: [finish()] }]);
    const system = again.model.requests[0].system;
    // Polish 2 §4: the history sits between the world and the living dossier as cached blocks (one
    // breakpoint on the last); the living dossier is cached at the 5-minute rate; the tail and «now» are not.
    assert.deepEqual(system.slice(0, 2).map((block) => [block.cache, block.ttl]), [[true, "1h"], [true, "1h"]]);
    assert.deepEqual(system.slice(-3).map((block) => [block.cache, block.ttl ?? null]), [[true, "5m"], [false, null], [false, null]]);
    const history = system.slice(2, -3);
    assert.ok(history.length >= 2, "the first turn's player line and narration are history blocks");
    assert.ok(history.every((block) => block.cache && block.ttl === "1h"));
    assert.deepEqual(history.map((block) => block.breakpoint), [...history.slice(0, -1).map(() => false), true]);
    const stable = system.at(-3).text, tail = system.at(-2).text;
    assert.match(stable, /Codex of people[\s\S]*Дуня/);
    assert.doesNotMatch(stable, /вернуть лодку|Коротко, по делу/, "no Character Model in the stable block");
    assert.match(tail, /Character Models[\s\S]*Дуня[\s\S]*in the scene[\s\S]*вернуть лодку/);
    assert.match(tail, /Journal, open now[\s\S]*Шестнадцать монет Дуне/);
    assert.match(tail, /Off-screen plans[\s\S]*plan_stranger/);
    assert.doesNotMatch(stable, /Шестнадцать монет Дуне|plan_stranger/);
    // The first two layers are identical across the two turns; the layer report has one row per block.
    const first = played.model.requests[0].system, second = again.model.requests[0].system;
    assert.equal(first[0].text, second[0].text);
    assert.equal(first[1].text, second[1].text);
    const started = c.observations.filter((o) => o.type === "request_started").at(-1);
    assert.equal(started.layers.length, system.length);
    assert.equal(started.layers.at(-2).tokens > 0, true);
    // The Anthropic body: four breakpoints at most — how to DM, the world, the last history block, the living dossier — and no top-level one.
    const body = anthropicRequestBody("claude-opus-5-5", { system, messages: [{ role: "user", text: "x" }], toolset: null, effort: "high", maxOutputTokens: 100 });
    const marks = body.system.map((block) => block.cache_control ?? null);
    assert.deepEqual(marks.slice(0, 2), [{ type: "ephemeral", ttl: "1h" }, { type: "ephemeral", ttl: "1h" }]);
    assert.deepEqual(marks.slice(-3), [{ type: "ephemeral" }, null, null]);
    assert.deepEqual(marks.slice(2, -3).filter(Boolean), [{ type: "ephemeral", ttl: "1h" }], "one breakpoint on the last history block");
    assert.equal("cache_control" in body, false, "no top-level breakpoint: nothing after the living dossier is written");
    // The legacy memory summaries are no longer the dossier's memory: no digest block, the session recaps instead.
    assert.doesNotMatch(stable, /Campaign memory digest/);
  } finally { await c.f.db.close(); }
});

test("a one-hour cache write is priced at its own rate", () => {
  const spec = dmModels["anthropic/claude-opus-5-5"];
  const usage = { inputTokens: 30000, outputTokens: 1000, cacheReadTokens: 10000, cacheWriteTokens: 20000, cacheWrite1hTokens: 20000, reasoningTokens: null };
  const expected = (10000 * spec.price.cacheRead + 20000 * spec.price.cacheWrite1h + 1000 * spec.price.output) / 1_000_000;
  assert.ok(Math.abs(dmUsageCost(spec, usage) - expected) < 1e-9);
  const fiveMinute = (10000 * spec.price.cacheRead + 20000 * spec.price.cacheWrite + 1000 * spec.price.output) / 1_000_000;
  assert.ok(Math.abs(dmUsageCost(spec, { ...usage, cacheWrite1hTokens: 0 }) - fiveMinute) < 1e-9);
});

test("the first save of a new campaign stores the default depth range when it names none (the wizard's DM step)", async () => {
  const { saveDmSettingsWith } = await import("../src/lib/gameplay/dm-loop/settings.ts");
  const calls = [];
  const rpc = async (args) => { calls.push(args.p_payload); return { data: { campaignId: "c", runtime: "dm-loop-v1", dmTurn: null, limits: null, depth: args.p_payload.depth ?? null, notebookVisible: false, boostNext: false, voiceExamples: false, revision: 1 } }; };
  const fresh = await saveDmSettingsWith(rpc, "o", "c", { expectedRevision: 0, runtime: "dm-loop-v1", dmTurn: null });
  assert.deepEqual(calls[0].depth, DEFAULT_DEPTH_RANGE, "a fresh row gets high … xhigh");
  assert.deepEqual(fresh.depth, DEFAULT_DEPTH_RANGE);
  await saveDmSettingsWith(rpc, "o", "c", { expectedRevision: 1, runtime: "dm-loop-v1", dmTurn: null });
  assert.equal("depth" in calls[1], false, "a later save without depth keeps whatever is stored");
  await saveDmSettingsWith(rpc, "o", "c", { expectedRevision: 0, runtime: "dm-loop-v1", dmTurn: null, depth: null });
  assert.equal(calls[2].depth, null, "an explicit «off» on a fresh row is kept");
});
