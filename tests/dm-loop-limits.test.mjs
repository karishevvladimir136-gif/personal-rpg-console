// Stage 3 §2 and §4: per-turn campaign limits as settings, pinned per
// operation and enforced per call; the folded finish_turn round.
import test from "node:test";
import assert from "node:assert/strict";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { DM_LOOP_DEFAULT_LIMITS, DM_LOOP_LIMIT_CEILINGS, parseDmLoopLimits } from "../src/lib/gameplay/dm-loop/limits.ts";
import { foldsFinish } from "../src/lib/gameplay/dm-loop/loop.ts";

const SMALL = { moneyPerTurn: 10, itemsPerTurn: 2, charactersPerTurn: 1, minutesPerTurn: 30, toolCallsPerTurn: 12, modelRequestsPerTurn: 2 };

test("campaign limits are settings: defaults, custom values, keep, reset, and validation in TypeScript and SQL", async () => {
  const c = await loopCampaign();
  try {
    const initial = await c.settings.read();
    assert.deepEqual(initial.limits, DM_LOOP_DEFAULT_LIMITS);
    assert.equal(initial.customLimits, false);
    const custom = await c.settings.save({ expectedRevision: 0, runtime: "dm-loop-v1", dmTurn: null, limits: SMALL });
    assert.deepEqual(custom.limits, SMALL);
    assert.equal(custom.customLimits, true);
    // A save without the key (the stage 2 panel) keeps the stored limits.
    const kept = await c.settings.save({ expectedRevision: custom.revision, runtime: "dm-loop-v1",
      dmTurn: { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" } });
    assert.deepEqual(kept.limits, SMALL);
    assert.equal(kept.dmTurn.modelId, "claude-opus-5-5");
    // null returns to the defaults.
    const reset = await c.settings.save({ expectedRevision: kept.revision, runtime: "dm-loop-v1", dmTurn: null, limits: null });
    assert.deepEqual(reset.limits, DM_LOOP_DEFAULT_LIMITS);
    assert.equal(reset.customLimits, false);
    // Validation: whole numbers within the ceilings, exactly the six keys.
    for (const bad of [{ ...SMALL, itemsPerTurn: 0 }, { ...SMALL, minutesPerTurn: DM_LOOP_LIMIT_CEILINGS.minutesPerTurn.max + 1 },
      { ...SMALL, moneyPerTurn: 1.5 }, { ...SMALL, extra: 1 }, (({ toolCallsPerTurn: _t, ...rest }) => rest)(SMALL), "many", null]) {
      if (bad !== null) assert.throws(() => parseDmLoopLimits(bad), RangeError);
      if (bad !== null) await assert.rejects(c.settings.save({ expectedRevision: reset.revision, runtime: "dm-loop-v1", dmTurn: null, limits: bad }), { code: "validation" });
    }
    // The SQL function refuses the same values when TypeScript is bypassed.
    for (const bad of [{ ...SMALL, charactersPerTurn: 101 }, { ...SMALL, modelRequestsPerTurn: 0 }, { moneyPerTurn: 5 }]) {
      const response = await c.dmSettingsRpc({ p_owner_id: c.owner, p_campaign_id: c.cid, p_action: "save",
        p_payload: { expectedRevision: reset.revision, runtime: "dm-loop-v1", dmTurn: null, limits: bad } });
      assert.match(response.error?.message ?? "", /rpg_validation/);
    }
    await assert.rejects(c.f.one("update rpg_private.dm_settings set limits='{\"moneyPerTurn\":-1}' where campaign_id=$1", [c.cid]), /dm_settings_limits_check/);
    assert.deepEqual((await c.settings.read()).limits, DM_LOOP_DEFAULT_LIMITS);
  } finally { await c.f.db.close(); }
});

test("the limits are pinned with the model when the turn starts and enforced per call from the pin", async () => {
  const c = await loopCampaign();
  try {
    await c.settings.save({ expectedRevision: 0, runtime: "dm-loop-v1", dmTurn: null, limits: SMALL });
    const played = await c.turn("I hire a crowd, buy the market and wait a day.", [
      { text: "The square fills. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "a", name: "Ann", kind: "npc", description: "A porter." } },
        { name: "upsert_character", arguments: { localKey: "b", name: "Bert", kind: "npc", description: "Another porter." } },
        { name: "item", arguments: { action: "create", name: "Rope", category: "gear", ownerRef: c.hero } },
        { name: "item", arguments: { action: "create", name: "Lantern", category: "gear", ownerRef: c.hero } },
        { name: "item", arguments: { action: "create", name: "Tent", category: "gear", ownerRef: c.hero } },
        { name: "money", arguments: { action: "grant", currency: "coins", amount: 8, toRef: c.hero, reason: "found" } },
        { name: "money", arguments: { action: "grant", currency: "coins", amount: 5, toRef: c.hero, reason: "found again" } },
        { name: "money", arguments: { action: "transfer", currency: "coins", amount: 3, fromRef: c.hero, toRef: "a" } },
        { name: "advance_time", arguments: { minutes: 20, reason: "waiting" } },
        { name: "advance_time", arguments: { minutes: 20, reason: "waiting more" } },
      ] },
      { text: "Evening. ", toolCalls: [{ name: "query_state", arguments: { topic: "time" } }] },
      { text: "Night falls. " },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const row = await c.row(played.input.operationId);
    assert.deepEqual(row.checkpoint.dmLoop.pin.limits, SMALL);
    const results = row.checkpoint.dmLoop.receipts.map((r) => r.result);
    assert.deepEqual(results.map((r) => r.ok), [true, false, true, true, false, true, false, true, true, false, true]);
    assert.match(results[1].reason, /1 new characters/);
    assert.match(results[4].reason, /2 items/);
    assert.match(results[6].reason, /already created 8 in money.*10 per turn/);
    assert.match(results[9].reason, /at most 30/);
    // Transfers move money without creating it; the request cap ended the turn after two requests.
    assert.ok(row.checkpoint.dmLoop.diagnostics.some((d) => d.kind === "request_cap_reached"),
      JSON.stringify({ diagnostics: row.checkpoint.dmLoop.diagnostics, requests: row.checkpoint.dmLoop.requests, results: results.map((r) => r.summary) }));
    assert.equal(row.checkpoint.dmLoop.requests, 2);
    assert.equal(row.checkpoint.dmLoop.shadow.counters.moneyGranted, 8);
    assert.equal(row.checkpoint.dmLoop.shadow.counters.itemsCreated, 2);
    assert.equal(row.checkpoint.dmLoop.shadow.counters.charactersCreated, 1);
    const state = await c.state();
    assert.equal(state.runtime.world_minutes, 20);
    assert.equal(state.entities.find((row) => row.id === c.hero).resources.currency_coins, 5);
    assert.equal(state.entities.filter((row) => ["Ann", "Bert"].includes(row.name)).length, 1);
    assert.equal(state.items.filter((row) => ["Rope", "Lantern", "Tent"].includes(row.name)).length, 2);
  } finally { await c.f.db.close(); }
});

test("a settings change during a turn does not reach the pinned operation; the retry keeps the first pin", async () => {
  const c = await loopCampaign();
  try {
    await c.settings.save({ expectedRevision: 0, runtime: "dm-loop-v1", dmTurn: null, limits: SMALL });
    // (a deciding call keeps the conversation open, so the scripted crash on the next request is reached)
    const played = await c.turn("I look around.", [
      { text: "Dust. ", toolCalls: [{ name: "advance_time", arguments: { minutes: 10, reason: "looking" } },
        { name: "query_state", arguments: { topic: "time" } }] },
      { failBefore: "transport" },
    ]);
    assert.equal(played.result.status, "failed");
    assert.equal(played.result.canRetry, true);
    const current = await c.settings.read();
    await c.settings.save({ expectedRevision: current.revision, runtime: "dm-loop-v1", dmTurn: null, limits: { ...SMALL, minutesPerTurn: 5 } });
    played.model.prepare([{ text: "Nothing more. ", toolCalls: [
      { name: "advance_time", arguments: { minutes: 15, reason: "a long look" } },
      { name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [], playerMoment: false } },
    ] }]);
    const retried = await c.retry(played);
    assert.equal(retried.result.status, "committed", JSON.stringify(c.errors));
    const row = await c.row(played.input.operationId);
    assert.deepEqual(row.checkpoint.dmLoop.pin.limits, SMALL);
    // 10 + 15 = 25 ≤ the pinned 30: accepted although the live setting is now 5.
    assert.ok(row.checkpoint.dmLoop.receipts.every((r) => r.result.ok));
    assert.equal((await c.state()).runtime.world_minutes, 25);
  } finally { await c.f.db.close(); }
});

test("foldsFinish: accepted bookkeeping that closes with time passing; never a deciding or rejected call", () => {
  const receipt = (id, name, ok, args = {}) => ({ position: 0, id, call: { id, name, arguments: args }, result: ok ? { ok: true, value: {}, summary: "", check: null } : { ok: false, reason: "no", hint: null, summary: "" } });
  const calls = (...names) => names.map((name, index) => ({ id: `c${index}`, name, arguments: "{}" }));
  assert.equal(foldsFinish(calls("upsert_character", "advance_time"), [receipt("c0", "upsert_character", true), receipt("c1", "advance_time", true)]), true);
  assert.equal(foldsFinish(calls("note_character", "move_party"), [receipt("c0", "note_character", true), receipt("c1", "move_party", true)]), true);
  assert.equal(foldsFinish(calls("item", "advance_time"), [receipt("c0", "item", true, { action: "create" }), receipt("c1", "advance_time", true)]), true);
  assert.equal(foldsFinish(calls("quest", "advance_time"), [receipt("c0", "quest", true, { action: "complete" }), receipt("c1", "advance_time", true)]), true);
  assert.equal(foldsFinish(calls("upsert_character"), [receipt("c0", "upsert_character", true)]), false, "no time passed");
  assert.equal(foldsFinish(calls("upsert_character", "advance_time"), [receipt("c0", "upsert_character", false), receipt("c1", "advance_time", true)]), false, "a rejected call");
  assert.equal(foldsFinish(calls("roll", "advance_time"), [receipt("c0", "roll", true), receipt("c1", "advance_time", true)]), false, "a roll decides");
  assert.equal(foldsFinish(calls("money", "advance_time"), [receipt("c0", "money", true, { action: "grant" }), receipt("c1", "advance_time", true)]), false);
  assert.equal(foldsFinish(calls("item", "advance_time"), [receipt("c0", "item", true, { action: "transfer" }), receipt("c1", "advance_time", true)]), false);
  assert.equal(foldsFinish(calls("quest", "advance_time"), [receipt("c0", "quest", true, { action: "claim_reward" }), receipt("c1", "advance_time", true)]), false);
  assert.equal(foldsFinish(calls("combat", "advance_time"), [receipt("c0", "combat", true, { action: "start" }), receipt("c1", "advance_time", true)]), false);
  assert.equal(foldsFinish([], []), false);
});

test("Astra's finish_turn round is folded into the final bookkeeping message; Opus and open rounds are untouched", async () => {
  const c = await loopCampaign();
  try {
    // Astra (OpenAI pin, the default): text, then one message of bookkeeping ending with time → the turn ends there.
    const folded = await c.turn("I greet the miller.", [
      { text: "Oswin looks up from the grindstone. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "miller", name: "Oswin the miller", kind: "npc", description: "Floury.", present: true } },
        { name: "note_world", arguments: { kind: "fact", key: "mill_debt", operation: "set", value: "Oswin owes the baker." } },
        { name: "advance_time", arguments: { minutes: 10, reason: "greetings" } },
      ] },
      { text: "", toolCalls: [{ name: "finish_turn", arguments: { sceneKinds: ["conversation"], spotlight: ["miller"], playerMoment: false } }] },
    ]);
    assert.equal(folded.result.status, "committed", JSON.stringify(c.errors));
    let row = await c.row(folded.input.operationId);
    assert.equal(row.checkpoint.dmLoop.requests, 1, "no finish_turn round");
    assert.ok(row.checkpoint.dmLoop.diagnostics.some((d) => d.kind === "implicit_finish" && d.calls === 3));
    const miller = (await c.state()).entities.find((row) => row.name === "Oswin the miller");
    assert.deepEqual(row.checkpoint.dmLoop.meta, { sceneKinds: [], spotlight: [miller.id], playerMoment: false });
    assert.equal(folded.model.rounds.length, 1, "the scripted finish_turn round was never requested");
    // A bookkeeping message without time keeps the conversation open; a round with a deciding call too.
    const open = await c.turn("I buy a loaf.", [
      { text: "“Two coins,” she says. ", toolCalls: [{ name: "money", arguments: { action: "spend", currency: "coins", amount: 2, fromRef: c.hero, reason: "bread" } }] },
      { text: "No coins. Then bookkeeping. ", toolCalls: [{ name: "upsert_character", arguments: { localKey: "baker", name: "Mara the baker", kind: "npc", description: "Warm hands." } }] },
      { text: "", toolCalls: [{ name: "advance_time", arguments: { minutes: 5, reason: "the stall" } }, { name: "finish_turn", arguments: { sceneKinds: ["trade"], spotlight: ["baker"], playerMoment: false } }] },
    ]);
    assert.equal(open.result.status, "committed", JSON.stringify(c.errors));
    row = await c.row(open.input.operationId);
    assert.equal(row.checkpoint.dmLoop.requests, 3);
    assert.ok(!row.checkpoint.dmLoop.diagnostics.some((d) => d.kind === "implicit_finish"));
    assert.deepEqual(row.checkpoint.dmLoop.meta.sceneKinds, ["trade"]);
    // Opus (Anthropic pin) batches finish_turn itself; its rounds are never folded.
    const current = await c.settings.read();
    await c.settings.save({ expectedRevision: current.revision, runtime: "dm-loop-v1",
      dmTurn: { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" } });
    const opus = await c.turn("I leave the mill.", [
      { text: "The lane again. ", toolCalls: [{ name: "advance_time", arguments: { minutes: 10, reason: "walking" } }] },
      { text: "The village opens below. ", toolCalls: [{ name: "finish_turn", arguments: { sceneKinds: ["travel"], spotlight: [], playerMoment: false } }] },
    ], { model: { providerId: "anthropic", modelId: "claude-opus-5-5" } });
    assert.equal(opus.result.status, "committed", JSON.stringify(c.errors));
    row = await c.row(opus.input.operationId);
    assert.equal(row.checkpoint.dmLoop.pin.providerId, "anthropic");
    assert.equal(row.checkpoint.dmLoop.requests, 2);
    assert.match(row.narration, /village opens below/);
  } finally { await c.f.db.close(); }
});
