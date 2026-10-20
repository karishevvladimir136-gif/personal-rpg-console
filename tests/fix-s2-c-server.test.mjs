// Fix run after session 2, stage C — the server's part of the turn on screen: the continuation after «Дальше» streams
// live (a replayed pause no longer ends the stream). Synthetic events only.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { replayedPause } from "../src/lib/gameplay/live-turn-client.ts";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only" ? { url: "data:text/javascript,export%20{}", shortCircuit: true } : nextResolve(specifier, context);
} });
const { publishLiveTurnEvent, subscribeLiveTurn, liveTurnFinished } = await import("../src/lib/server/dm/live-turns.ts");
hook.deregister();
const src = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("C: opened again before «Дальше», the stream replays the told text and the pause as history, then follows the continuation live", () => {
  const id = randomUUID();
  publishLiveTurnEvent(id, { type: "status", status: "generating" });
  publishLiveTurnEvent(id, { type: "text", text: "Ты целишься. " });
  publishLiveTurnEvent(id, { type: "status", status: "awaiting_confirmation" });
  assert.equal(liveTurnFinished(id), true, "the pause ends the first stream");
  const seen = [];
  const stop = subscribeLiveTurn(id, (event, replay) => seen.push({ ...event, replayed: !!replay }));
  assert.deepEqual(seen.map((row) => row.replayed), [true, true, true], "everything so far is marked replayed");
  // «Дальше»: the loop publishes «generating» and tells the rest.
  publishLiveTurnEvent(id, { type: "status", status: "generating" });
  assert.equal(liveTurnFinished(id), false, "the turn is live again");
  publishLiveTurnEvent(id, { type: "text", text: "Болт входит в плечо." });
  publishLiveTurnEvent(id, { type: "status", status: "committed" });
  stop();
  assert.deepEqual(seen.slice(3).map((row) => [row.type, row.text ?? row.status, row.replayed]),
    [["status", "generating", false], ["text", "Болт входит в плечо.", false], ["status", "committed", false]], "the continuation arrives live");
  // A committed turn replays and ends: nobody stays subscribed.
  const after = [];
  subscribeLiveTurn(id, (event) => after.push(event))();
  assert.equal(after.at(-1).status, "committed");
  assert.equal(replayedPause({ type: "status", status: "awaiting_confirmation", replayed: true }), true);
  assert.equal(replayedPause({ type: "status", status: "awaiting_confirmation" }), false, "a live pause still closes the client's stream");
  const route = src("src/app/api/campaigns/[campaignId]/turns/[operationId]/stream/route.ts");
  assert.match(route, /JSON\.stringify\(replay \? \{ \.\.\.event, replayed: true \} : event\)/);
  assert.match(route, /if \(liveTurnEnds\(event\) && !\(replay && event\.type === "status" && event\.status === "awaiting_confirmation"\)\) close\(\);/);
  assert.match(src("src/lib/gameplay/live-turn-client.ts"), /liveStatusEnds\(event\.status\) && !\(replayedPause\(event\)\)\) source\.close\(\);/);
});

test("C: each roll of a saved turn knows where in the text it was made; a paused turn carries the text told so far", async () => {
  const { rollTextOffsets, joinText } = await import("../src/lib/gameplay/dm-loop/loop.ts");
  const { loopCampaign } = await import("./dm-loop-fixture.mjs");
  const roll = (id, position, ok = true) => ({ position, id: `r${position}`, call: { id, name: "roll", arguments: {} }, result: ok ? { ok: true, value: {}, summary: "", check: null } : { ok: false, reason: "", hint: null, summary: "" } });
  assert.deepEqual(rollTextOffsets([
    { role: "assistant", text: "Брам вскидывает арбалет. ", toolCalls: [{ id: "a" }] },
    { role: "user", text: "" },
    { role: "assistant", text: "Болт уходит в цель. Ты целишься.", toolCalls: [{ id: "b" }, { id: "c" }] },
  ], [roll("a", 0), roll("b", 1), roll("c", 2, false)]), { 0: 25, 1: joinText("Брам вскидывает арбалет. ", "Болт уходит в цель. Ты целишься.").length }, "a refused roll has no place");

  const c = await loopCampaign({ language: "ru" });
  try {
    const time = { name: "advance_time", arguments: { minutes: 1, reason: "время" } };
    const finish = { name: "finish_turn", arguments: { sceneKinds: ["combat"], spotlight: [], playerMoment: false, nextTension: "tense" } };
    const hired = await c.turn("Нанимаю Брама.", [{ text: "Брам кивает. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "bram", name: "Брам", kind: "companion", party: true, present: true, hp: 20, maxHp: 20 } }, time, finish] }]);
    assert.equal(hired.result.status, "committed", JSON.stringify(c.errors));
    const bram = (await c.f.one("select id from public.rpg_entities where campaign_id=$1 and name='Брам'", [c.cid])).id;
    const shot = await c.turn("Брам, стреляй!", [{ text: "Брам вскидывает арбалет. ", toolCalls: [{ name: "roll", arguments: { formula: "1d20+3", reason: "Брам: арбалет по громиле", actorRef: bram, visibility: "player", kind: "attack", dc: 11 } }] },
      { text: "Болт уходит в цель.", toolCalls: [time, finish] }]);
    assert.equal(shot.result.status, "committed", JSON.stringify(c.errors));
    const { createScriptedDmModel } = await import("../src/lib/gameplay/dm-loop/scripted-model.ts");
    const play = await (await c.deps(createScriptedDmModel([]))).store.readPlay(c.cid);
    const saved = play.turns.find((row) => row.id === shot.input.operationId);
    const rollChange = saved.changes.find((row) => row.tool === "roll");
    assert.equal(rollChange.at, "Брам вскидывает арбалет. ".length, "the roll sits after the text before it");
    assert.ok(saved.changes.filter((row) => row.tool !== "roll").every((row) => row.at === undefined), "only rolls carry a place");
    // The hero's roll pauses the turn: the paused turn carries what was told.
    const paused = await c.turn("Стреляю сам.", [{ text: "Ты целишься в громилу. ", toolCalls: [{ name: "roll", arguments: { formula: "1d20+5", reason: "Выстрел", actorRef: c.hero, visibility: "player", kind: "attack", dc: 11 } }] },
      { text: "Попал.", toolCalls: [time, finish] }], { autoContinue: false });
    assert.equal(paused.result.status, "awaiting_confirmation");
    const waiting = (await (await c.deps(createScriptedDmModel([]))).store.readPlay(c.cid)).turns.find((row) => row.id === paused.input.operationId);
    assert.equal(waiting.narration, null);
    assert.equal(waiting.told, "Ты целишься в громилу. ");
  } finally { await c.f.db.close(); }
});
