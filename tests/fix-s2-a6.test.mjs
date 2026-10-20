// Fix run after session 2, stage A6 (docs/stages/FIX_S2_AB.md): the two-pass runtime («Opus пишет —
// Sonnet записывает») gets the stage A fixes too — the output cap, the cut recovery, the lease heartbeat,
// the cache inside the turn, the continuation depth, and the council as the loop's light call.
// Disposable PGlite databases and scripted models only.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { runCampaignTurn, resumeCampaignTurn, bookkeeperOf } from "../src/lib/gameplay/dm-loop/two-pass/index.ts";
import { WRITER_CUT_BY_CAP } from "../src/lib/gameplay/dm-loop/two-pass/runtime.ts";

const OPUS = { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" };
const SONNET = { providerId: "anthropic", modelId: "claude-sonnet-5-5", reasoning: "high" };
const LEDGER = "\n<ledger>\nвремя — 5 минут\nсцена — quiet; напряжение дальше: calm\n</ledger>";
const finish = () => ({ name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [], playerMoment: false, nextTension: "calm" } });
const time = (minutes = 5) => ({ name: "advance_time", arguments: { minutes, reason: "идёт время" } });

async function split(c, options = {}) {
  const current = await c.settings.read();
  return c.settings.save({ expectedRevision: current.revision, runtime: "dm-loop-v1", dmTurn: OPUS, split: { writer: OPUS, bookkeeper: SONNET }, ...options });
}
async function campaignTurn(c, text, writerRounds, bookkeeperRounds, options = {}) {
  const writer = createScriptedDmModel(writerRounds, { providerId: "anthropic", modelId: "claude-opus-5-5" });
  const bookkeeper = createScriptedDmModel(bookkeeperRounds, { providerId: "anthropic", modelId: "claude-sonnet-5-5" });
  const base = await c.deps(writer, options.deps ?? {});
  const current = await c.settings.read();
  const deps = { ...base, split: current.split, ...(current.split ? { bookkeeper: bookkeeperOf(current.split) } : {}), bookkeeperModel: () => bookkeeper };
  const input = options.input ?? await c.input(text, options.mode, options.companionId, options.listenerIds);
  let result = await runCampaignTurn(input, deps);
  let continues = 0;
  while (result.status === "awaiting_confirmation" && continues < 4) {
    continues++;
    result = await resumeCampaignTurn({ commandId: randomUUID(), campaignId: c.cid, operationId: input.operationId, timeline: input.timeline, action: "continue", checkId: null }, deps);
  }
  return { input, result, writer, bookkeeper };
}

test("A6: the writer cut by the cap continues once from where it stopped, one notch lower; every request has the 32k cap and caches its turn", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    await split(c);
    const played = await campaignTurn(c, "Слушаю, что расскажет бригадир.", [
      { text: "Бригадир трёт шею и начинает: сначала погасли лампы, потом", stop: "max_tokens" },
      { text: " у ствола дважды ударил колокол, и никто не ответил." + LEDGER },
    ], [{ text: "", toolCalls: [time(), finish()] }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const [first, second] = played.writer.requests;
    assert.equal(second.messages.at(-1).text, WRITER_CUT_BY_CAP);
    assert.equal(first.maxOutputTokens, 32000);
    assert.equal(first.cacheTurn, true);
    assert.equal(played.bookkeeper.requests[0].cacheTurn, true);
    assert.notEqual(second.effort, first.effort, "one notch lower after the cut");
    const row = await c.row(played.input.operationId);
    assert.match(row.narration, /потом у ствола дважды ударил колокол/);
    assert.ok(row.checkpoint.dmLoop.diagnostics.some((d) => d.kind === "cut_continued"));
  } finally { await c.f.db.close(); }
});

test("A6: «Продолжение хода: на ступень легче» runs the writer's request after a roll one notch below the turn", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    await split(c, { options: { continuation: "lighter" } });
    const played = await campaignTurn(c, "Подслушиваю у двери.", [
      { text: "Ты прижимаешься к двери. ", toolCalls: [{ name: "roll", arguments: { formula: "2d6", reason: "что слышно", actorRef: "dm", visibility: "private" } }] },
      { text: "За дверью спорят о цене." + LEDGER },
    ], [{ text: "", toolCalls: [time(), finish()] }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const [first, second] = played.writer.requests;
    const pin = (await c.row(played.input.operationId)).checkpoint.dmLoop.pin;
    assert.equal(first.effort, pin.effort);
    assert.equal(second.effort, pin.continuationEffort);
    assert.notEqual(pin.continuationEffort, pin.effort);
  } finally { await c.f.db.close(); }
});

test("A6: on a split campaign a council line is the loop's light call — no bookkeeper, the small context, notes and time only", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const join = await c.turn("Нанимаю Тама.", [{ text: "Там вскидывает мешок. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "tam", name: "Там", kind: "companion", party: true, present: true, description: "Носильщик." } }, time(), finish()] }]);
    assert.equal(join.result.status, "committed", JSON.stringify(c.errors));
    await split(c);
    const tam = (await c.state()).entities.find((row) => row.name === "Там");
    const played = await campaignTurn(c, "Там, что думаешь?", [{ text: "— Платят поздно, — говорит Там.", toolCalls: [time(2), finish()] }], [],
      { mode: "companion", companionId: tam.id, listenerIds: [] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(played.bookkeeper.requests.length, 0, "no bookkeeper for a council line");
    assert.equal(played.writer.requests[0].system.length, 2);
    assert.match(played.writer.requests[0].system[1].text, /Party council/);
    assert.equal((await c.row(played.input.operationId)).checkpoint.dmLoop.pin.bookkeeper, undefined);
  } finally { await c.f.db.close(); }
});

// ---- A6: the ledger checker (owner's decision: session 3 plays on «пишет — записывает») ----------------
import { checkLedger, ledgerCheckRequest, ledgerCheckState, parseLedgerMisses, recordLines, LEDGER_CHECK_MODEL } from "../src/lib/gameplay/dm-loop/ledger-check.ts";

const SADDLE_LEDGER = "\n<ledger>\nпредмет — седло Дирка переходит герою\nвремя — 5 минут\n</ledger>";
const saddle = (hero) => ({ name: "item", arguments: { action: "create", localKey: "saddle", name: "Седло Дирка", category: "gear", quantity: 1, ownerRef: hero } });
const playOf = async (c) => (await c.deps(createScriptedDmModel([]))).store.readPlay(c.cid);
/** A scripted checker: the answers in order, each the misses of one check. */
function fakeChecker(answers) {
  const calls = [];
  return { calls, check: async (input) => { calls.push(input); const misses = answers[calls.length - 1] ?? [];
    return { misses, usage: { inputTokens: 3000, outputTokens: 80 }, costUsdMicros: 340, elapsedMs: 900, error: null }; } };
}

test("A6 ledger checker: a miss sends the bookkeeper one correction; the record lands in the same commit, no chip", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    await split(c);
    const checker = fakeChecker([[{ event: "герой забрал седло Дирка", expected: "item create: Седло Дирка, владелец — герой" }], []]);
    const played = await campaignTurn(c, "Забираю седло Дирка.", [{ text: "Ты снимаешь с коня седло Дирка и вскидываешь на плечо." + SADDLE_LEDGER }],
      [{ text: "", toolCalls: [time(), finish()] }, { text: "", toolCalls: [saddle(c.hero), finish()] }], { deps: { ledgerCheck: checker.check } });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(checker.calls.length, 2, "checked, corrected, checked again");
    assert.match(checker.calls[0].narration, /седло Дирка/);
    assert.match(checker.calls[0].ledger, /седло Дирка переходит герою/);
    assert.ok(!checker.calls[0].narration.includes("<ledger>"), "the narration the player read, without the ledger");
    assert.match(played.bookkeeper.requests[1].messages.at(-1).text, /without a record[\s\S]*герой забрал седло Дирка/);
    assert.ok((await c.state()).items.some((item) => item.name === "Седло Дирка"), "the corrected record is committed");
    const row = await c.row(played.input.operationId);
    const checks = row.checkpoint.dmLoop.diagnostics.filter((d) => d.kind === "ledger_checked");
    assert.deepEqual(checks.map((d) => d.misses.length), [1, 0]);
    assert.ok(!row.checkpoint.dmLoop.diagnostics.some((d) => d.kind === "ledger_unrecorded"));
    const turn = (await playOf(c)).turns.find((t) => t.id === played.input.operationId);
    assert.equal(turn.stats.unrecorded, undefined);
    assert.ok(Math.abs(turn.stats.checkerUsd - 0.00068) < 1e-9, "both checks are counted in the turn's cost");
  } finally { await c.f.db.close(); }
});

test("A6 ledger checker: what stays unmatched after the correction becomes the owner's chip; a failed check never fails the turn", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    await split(c);
    const miss = { event: "три меча бандитов", expected: "item create ×3" };
    const checker = fakeChecker([[miss], [miss]]);
    const played = await campaignTurn(c, "Собираю оружие бандитов.", [{ text: "Ты связываешь три меча бечёвкой." + LEDGER }],
      [{ text: "", toolCalls: [time(), finish()] }, { text: "", toolCalls: [finish()] }], { deps: { ledgerCheck: checker.check } });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const row = await c.row(played.input.operationId);
    assert.deepEqual(row.checkpoint.dmLoop.diagnostics.find((d) => d.kind === "ledger_unrecorded").chips, ["не записано: три меча бандитов"]);
    const turn = (await playOf(c)).turns.find((t) => t.id === played.input.operationId);
    assert.deepEqual(turn.stats.unrecorded, ["не записано: три меча бандитов"]);
    assert.equal(turn.stats.requests, 3, "the checker is not a DM request: one writer and two bookkeeper requests");
    const failing = await campaignTurn(c, "Иду дальше.", [{ text: "Дорога петляет." + LEDGER }], [{ text: "", toolCalls: [time(), finish()] }],
      { deps: { ledgerCheck: async () => { throw new Error("network down"); } } });
    assert.equal(failing.result.status, "committed", JSON.stringify(c.errors));
    const failed = (await c.row(failing.input.operationId)).checkpoint.dmLoop.diagnostics.find((d) => d.kind === "ledger_checked");
    assert.match(failed.error, /network down/);
    assert.equal(failing.bookkeeper.requests.length, 1, "no correction without a result");
  } finally { await c.f.db.close(); }
});

test("A6 ledger checker: the request reads the story, the ledger and the accepted records; the answer is bounded; the call is cheap", async () => {
  const receipts = [
    { position: 1, call: { name: "item", arguments: {} }, result: { ok: true, summary: "Седло Дирка → герой" } },
    { position: 2, call: { name: "money", arguments: {} }, result: { ok: false, reason: "not enough" } },
    { position: 3, call: { name: "finish_turn", arguments: {} }, result: { ok: true, summary: "done" } },
  ];
  assert.deepEqual(recordLines(receipts), ["item: Седло Дирка → герой"]);
  const request = ledgerCheckRequest({ narration: "Ты берёшь ключ.", ledger: "", records: recordLines(receipts), language: "ru" });
  assert.match(request.system, /JSON/);
  assert.match(request.user, /NARRATION:\nТы берёшь ключ\.[\s\S]*LEDGER:\n\(none\)[\s\S]*1\. item: Седло Дирка/);
  assert.deepEqual(parseLedgerMisses('Вот: {"misses":[{"event":"  взял  ключ ","expected":"item create"},{"expected":"no event"}]}'), [{ event: "взял ключ", expected: "item create" }]);
  assert.deepEqual(parseLedgerMisses("not json"), []);
  // The records' state: the people on record (a known companion is not «new») and what the party tracks (ammunition only when tracked).
  const state = ledgerCheckState({ snapshot: { entities: [
    { id: "h", name: "Рэй", kind: "player", resources: { hp: 9 } }, { id: "b", name: "Брам", kind: "companion", resources: { "болты": 12 } },
    { id: "n", name: "Кондрат", kind: "npc", resources: { hp: 4 } }, { id: "f", name: "Гильдия", kind: "faction", resources: {} }],
    items: [{ name: "Гарпун", quantity: 3, owner_entity_id: "h" }, { name: "Сабля", quantity: 1, owner_entity_id: "n" }] },
    runtime: { configuration: { controlledEntityIds: ["b"] } } });
  assert.deepEqual(state.people, ["Рэй", "Брам", "Кондрат"]);
  assert.deepEqual(state.tracked, ["Рэй: hp 9", "Брам: болты 12", "Рэй: Гарпун ×3"]);
  const withState = ledgerCheckRequest({ narration: "Брам стреляет.", ledger: "", records: [], language: "ru", state });
  assert.match(withState.user, /PEOPLE ON RECORD:\nРэй; Брам; Кондрат[\s\S]*TRACKED BY THE PARTY \(counters and items\):\nРэй: hp 9\nБрам: болты 12/);
  assert.match(withState.system, /только для того, что есть в списке/);
  assert.equal(parseLedgerMisses(JSON.stringify({ misses: Array.from({ length: 30 }, (_, i) => ({ event: `e${i}` })) })).length, 12);
  let sent = null;
  const fetcher = async (url, init) => { sent = { url, body: JSON.parse(init.body), key: init.headers["x-api-key"] };
    return new Response(JSON.stringify({ content: [{ type: "text", text: '{"misses":[{"event":"выстрелил болт","expected":"resource: болты −1"}]}' }], usage: { input_tokens: 4000, output_tokens: 100 } }), { status: 200 }); };
  const result = await checkLedger("test-key", { narration: "Брам стреляет.", ledger: "", receipts, language: "ru" }, { fetcher });
  assert.equal(sent.body.model, LEDGER_CHECK_MODEL);
  assert.equal(sent.key, "test-key");
  assert.deepEqual(result.misses, [{ event: "выстрелил болт", expected: "resource: болты −1" }]);
  assert.ok(result.costUsdMicros > 0 && result.costUsdMicros < 2000, "a fraction of a cent");
  assert.equal((await checkLedger("", { narration: "x", ledger: "", receipts, language: "ru" }, { fetcher })).error, "not_configured");
  const broken = await checkLedger("k", { narration: "x", ledger: "", receipts, language: "en" }, { fetcher: async () => new Response("{}", { status: 529 }) });
  assert.match(broken.error, /HTTP 529/);
  assert.deepEqual(broken.misses, []);
});

test("A6: the bookkeeper's brief says which roll damage is already applied, so the wound is never recorded twice", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const met = await c.turn("На меня выходит разбойник.", [{ text: "Из кустов выходит разбойник с дубиной. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "thug", name: "Разбойник", kind: "npc", present: true, hp: 20, maxHp: 20, description: "Разбойник с дубиной." } }, time(), finish()] }]);
    assert.equal(met.result.status, "committed", JSON.stringify(c.errors));
    await split(c);
    const thug = (await c.state()).entities.find((row) => row.name === "Разбойник");
    c.forceDice([15, 6]);
    const played = await campaignTurn(c, "Бью разбойника посохом.", [
      { text: "Ты замахиваешься посохом. ", toolCalls: [{ name: "roll", arguments: { formula: "1d20+3", reason: "удар посохом", actorRef: c.hero, kind: "attack", dc: 12, visibility: "player",
        damage: "1d6+1", targetRef: thug.id } }] },
      { text: "Посох бьёт разбойника в плечо." + LEDGER },
    ], [{ text: "", toolCalls: [time(), finish()] }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const brief = played.bookkeeper.requests[0].messages[0].text;
    assert.match(brief, /damage 7 ALREADY APPLIED: Разбойник 20 → 13\/20 \(do not record this damage again\)/);
    assert.match(played.bookkeeper.requests[0].system[0].text, /ALREADY APPLIED has changed those hit points/);
    assert.equal((await c.state()).entities.find((row) => row.id === thug.id).hp, 13);
  } finally { await c.f.db.close(); }
});

test("A6: the writer's continuation after a cut that the provider refuses goes again once as plain text", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    await split(c);
    const played = await campaignTurn(c, "Слушаю бригадира.", [
      { text: "Бригадир начинает: сначала погасли лампы, потом", stop: "max_tokens" },
      { failBefore: "rejected" },
      { text: " у ствола дважды ударил колокол." + LEDGER },
    ], [{ text: "", toolCalls: [time(), finish()] }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const kinds = (await c.row(played.input.operationId)).checkpoint.dmLoop.diagnostics.map((d) => d.kind);
    assert.ok(kinds.includes("cut_plain_retry"), kinds.join(","));
    assert.equal(played.writer.requests[2].messages[1].native, null);
    assert.equal(played.writer.requests[2].messages.at(-1).text, WRITER_CUT_BY_CAP);
    assert.notEqual(played.writer.requests[2].effort, played.writer.requests[0].effort, "still one notch lower");
  } finally { await c.f.db.close(); }
});
