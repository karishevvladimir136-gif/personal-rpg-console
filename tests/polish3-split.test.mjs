// Polish 3 (docs/stages/POLISH_3.md) §2 the DM architecture as a campaign setting, §3 the
// bookkeeping fixes, §4 the turn snapshot, §5 the picture defaults — on the real turn path
// with scripted models and the SQL of migration 68.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { runCampaignTurn, resumeCampaignTurn, bookkeeperOf, LEDGER_MAX_CHARS, splitLedger } from "../src/lib/gameplay/dm-loop/two-pass/index.ts";
import { parseDmSettings, parseDmSettingsSave, parseDmSplit } from "../src/lib/gameplay/dm-loop/settings.ts";
import { dmArchitectureOf, dmArchitectures, dmBookkeeperModels, dmWriterModels } from "../src/lib/gameplay/dm-settings-client.ts";
import { dmModelSpec } from "../src/lib/model-runtime/dm-models.ts";
import { applyLiveEvent, emptyLiveTurn, liveStatusEnds } from "../src/lib/gameplay/live-turn-client.ts";
import { nearlySameId } from "../src/lib/gameplay/dm-loop/shadow.ts";
import { toolFieldSheet } from "../src/lib/gameplay/dm-loop/roles.ts";
import { encodeTurnSnapshot, decodeTurnSnapshot, saveTurnSnapshotWith, listTurnSnapshotsWith, readTurnSnapshotWith } from "../src/lib/gameplay/turn-snapshot.ts";
import { DEFAULT_TIER_MODELS, defaultPictureSettings } from "../src/lib/visual-frame/pictures.ts";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only" ? { url: "data:text/javascript,export%20{}", shortCircuit: true } : nextResolve(specifier, context);
} });
const { publishLiveTurnEvent, subscribeLiveTurn, keepLiveTurnLedger, liveTurnLedger, liveTurnFinished } = await import("../src/lib/server/dm/live-turns.ts");
hook.deregister();

const src = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const decoded0 = (encoded) => decodeTurnSnapshot(encoded);
const OPUS = { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" };
const FABLE = { providerId: "anthropic", modelId: "claude-fable-5-1", reasoning: "high" };
const SONNET = { providerId: "anthropic", modelId: "claude-sonnet-5-5", reasoning: "high" };
const ASTRA = { providerId: "openai", modelId: "gpt-6-astra", reasoning: "high" };
const LEDGER = "<ledger>\nвремя — 5 минут\nсцена — quiet; напряжение дальше: calm\n</ledger>";
const finish = (kind = "quiet") => ({ name: "finish_turn", arguments: { sceneKinds: [kind], spotlight: [], playerMoment: false, nextTension: "calm" } });
const time = (minutes = 5) => ({ name: "advance_time", arguments: { minutes, reason: "идёт время" } });

/** A campaign turn on the dispatcher with scripted models: the writer (the campaign's own model) and a bookkeeper. */
async function campaignTurn(c, text, writerRounds, bookkeeperRounds, options = {}) {
  const writer = createScriptedDmModel(writerRounds, { providerId: "anthropic", modelId: "claude-opus-5-5", chunk: options.chunk ?? 9 });
  const bookkeeper = createScriptedDmModel(bookkeeperRounds, { providerId: "anthropic", modelId: "claude-sonnet-5-5" });
  const base = await c.deps(writer, options.deps ?? {});
  const current = await c.settings.read();
  const split = options.split === undefined ? current.split : options.split;
  const deps = { ...base, split, ...(split ? { bookkeeper: bookkeeperOf(split) } : {}), bookkeeperModel: () => bookkeeper };
  const input = options.input ?? await c.input(text);
  if (options.dice) c.forceDice(options.dice);
  let result = await runCampaignTurn(input, deps);
  const statuses = [result.status];
  let continues = 0;
  while (result.status === "awaiting_confirmation" && continues < 4 && options.autoContinue !== false) {
    continues++;
    result = await resumeCampaignTurn({ commandId: randomUUID(), campaignId: c.cid, operationId: input.operationId,
      timeline: input.timeline, action: "continue", checkId: null }, deps);
    statuses.push(result.status);
  }
  return { input, result, writer, bookkeeper, statuses, deps };
}
const resume = (c, played, action = "retry", deps = played.deps) => resumeCampaignTurn({ commandId: randomUUID(), campaignId: c.cid,
  operationId: played.input.operationId, timeline: played.input.timeline, action, checkId: null }, deps);
const splitOf = (writer, bookkeeper) => ({ writer, bookkeeper });

test("§2 the settings: a split is a writer (Opus or Fable) and a bookkeeper (Opus or Sonnet); the parsers and the client lists agree", () => {
  assert.deepEqual(parseDmSplit(splitOf(FABLE, OPUS)), splitOf(FABLE, OPUS));
  assert.deepEqual(parseDmSplit(splitOf(OPUS, SONNET)), splitOf(OPUS, SONNET));
  assert.equal(parseDmSplit(null), null);
  assert.throws(() => parseDmSplit(splitOf(OPUS, FABLE)), /validation/, "Fable is a writer, not a bookkeeper");
  assert.throws(() => parseDmSplit(splitOf(SONNET, OPUS)), /validation/, "Sonnet is a bookkeeper, not a writer");
  assert.throws(() => parseDmSplit(splitOf(ASTRA, SONNET)), /validation/, "Astra is not a writer of the split");
  assert.throws(() => parseDmSplit({ writer: OPUS }), /validation/);
  const base = { expectedRevision: 1, runtime: "dm-loop-v1", dmTurn: null };
  assert.deepEqual(parseDmSettingsSave({ ...base, split: splitOf(OPUS, SONNET) }).split, splitOf(OPUS, SONNET));
  assert.equal(parseDmSettingsSave({ ...base, split: null }).split, null);
  assert.equal(parseDmSettingsSave({ ...base, snapshotsKeep: 40 }).snapshotsKeep, 40);
  assert.equal(parseDmSettingsSave({ ...base, snapshotsKeep: null }).snapshotsKeep, null);
  assert.throws(() => parseDmSettingsSave({ ...base, snapshotsKeep: 0 }), /validation/);
  assert.throws(() => parseDmSettingsSave({ ...base, snapshotsKeep: "all" }), /validation/);
  const read = { campaignId: "c", runtime: "dm-loop-v1", dmTurn: null, limits: null, depth: null, notebookVisible: false, boostNext: false, voiceExamples: false, revision: 2 };
  assert.equal(parseDmSettings(read).split, null, "a row from before migration 68 reads as today's loop");
  assert.equal(parseDmSettings(read).snapshotsKeep, null);
  assert.deepEqual(parseDmSettings({ ...read, split: splitOf(FABLE, OPUS), snapshotsKeep: 12 }).split, splitOf(FABLE, OPUS));
  // The three choices, their numbers and the custom pair.
  assert.deepEqual(dmArchitectures.map((row) => row.id), ["single", "fable-opus", "opus-sonnet"]);
  assert.equal(dmArchitectures[0].split, null);
  assert.equal(dmArchitectureOf(null), "single");
  assert.equal(dmArchitectureOf(splitOf(FABLE, OPUS)), "fable-opus");
  assert.equal(dmArchitectureOf(splitOf(OPUS, SONNET)), "opus-sonnet");
  assert.equal(dmArchitectureOf(splitOf(OPUS, OPUS)), null, "a custom pair from «Подробнее»");
  for (const row of [...dmWriterModels, ...dmBookkeeperModels]) assert.ok(dmModelSpec("anthropic", row.modelId), row.modelId);
  assert.deepEqual([...dmWriterModels.find((row) => row.modelId === "claude-fable-5-1").efforts], ["high"], "Fable writes at high only");
});

test("§2 migration 68: the SQL admits each model in its role; the settings save a split and refuse a wrong pair; the pin takes a writer", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const role = async (selection, role) => {
      try { await c.f.one("select rpg_private.dm_turn_model_selection($1::jsonb,$2) ok", [JSON.stringify(selection), role]); return true; }
      catch (error) { assert.match(error.message, /rpg_validation/); return false; }
    };
    assert.equal(await role(OPUS, "turn"), true);
    assert.equal(await role(ASTRA, "turn"), true);
    assert.equal(await role(FABLE, "turn"), false, "the single loop's choice stays Opus or Astra");
    assert.equal(await role(SONNET, "turn"), false);
    assert.equal(await role(FABLE, "writer"), true);
    assert.equal(await role(OPUS, "writer"), true);
    assert.equal(await role(SONNET, "writer"), false);
    assert.equal(await role(ASTRA, "writer"), false);
    assert.equal(await role(SONNET, "bookkeeper"), true);
    assert.equal(await role(OPUS, "bookkeeper"), true);
    assert.equal(await role(FABLE, "bookkeeper"), false);
    assert.equal(await role(FABLE, "pin"), true, "a turn pinned to a Fable writer");
    assert.equal(await role(ASTRA, "pin"), true);
    assert.equal(await role(SONNET, "pin"), false, "the bookkeeper is never the pinned dm.turn");
    // The one-argument call still means the single loop's role.
    await c.f.one("select rpg_private.dm_turn_model_selection($1::jsonb) ok", [JSON.stringify(OPUS)]);
    await assert.rejects(c.f.one("select rpg_private.dm_turn_model_selection($1::jsonb) ok", [JSON.stringify(FABLE)]), /rpg_validation/);
    const settings = await c.settings.read();
    assert.equal(settings.split, null, "today's loop by default");
    assert.equal(settings.snapshotsKeep, null, "every snapshot kept by default");
    const saved = await c.settings.save({ expectedRevision: settings.revision, runtime: "dm-loop-v1", dmTurn: settings.dmTurn, split: splitOf(FABLE, OPUS) });
    assert.deepEqual(saved.split, splitOf(FABLE, OPUS));
    const kept = await c.settings.save({ expectedRevision: saved.revision, runtime: "dm-loop-v1", dmTurn: saved.dmTurn, snapshotsKeep: 30 });
    assert.deepEqual(kept.split, splitOf(FABLE, OPUS), "an omitted split is kept");
    assert.equal(kept.snapshotsKeep, 30);
    const cleared = await c.settings.save({ expectedRevision: kept.revision, runtime: "dm-loop-v1", dmTurn: kept.dmTurn, split: null, snapshotsKeep: null });
    assert.equal(cleared.split, null);
    assert.equal(cleared.snapshotsKeep, null);
    // The SQL itself refuses a wrong pair (the TypeScript parser is bypassed here).
    const raw = await c.dmSettingsRpc({ p_owner_id: c.owner, p_campaign_id: c.cid, p_action: "save",
      p_payload: { expectedRevision: cleared.revision, runtime: "dm-loop-v1", dmTurn: cleared.dmTurn, split: splitOf(OPUS, FABLE) } });
    assert.match(raw.error?.message ?? "", /rpg_validation/);
    const rawKeep = await c.dmSettingsRpc({ p_owner_id: c.owner, p_campaign_id: c.cid, p_action: "save",
      p_payload: { expectedRevision: cleared.revision, runtime: "dm-loop-v1", dmTurn: cleared.dmTurn, snapshotsKeep: 0 } });
    assert.match(rawKeep.error?.message ?? "", /rpg_validation/);
    // The execution-profile pin of a loop turn accepts a Fable writer (role «pin»).
    const play = await (await c.deps(createScriptedDmModel([]))).store.readPlay(c.cid);
    const input = { operationId: randomUUID(), campaignId: c.cid, timeline: play.timeline, expectedRevision: play.revision,
      mode: "game", input: "Смотрю.", companionId: null, listenerIds: [], mechanic: null };
    const store = (await c.deps(createScriptedDmModel([]))).store;
    await store.begin(input, "dm-loop-v1");
    await store.claim(c.cid, input.operationId);
    const profile = { schemaVersion: 1, id: randomUUID(), policyRevision: 1, registryVersion: "dm-models-v1", task: "dm.turn", ...FABLE };
    const pinned = await c.profileRpc({ p_owner_id: c.owner, p_campaign_id: c.cid, p_operation_id: input.operationId, p_timeline: play.timeline, p_profiles: { "dm.turn": profile } });
    assert.equal(pinned.error, undefined, pinned.error?.message);
    assert.equal(pinned.data["dm.turn"].modelId, "claude-fable-5-1");
    await store.cancel({ commandId: randomUUID(), campaignId: c.cid, operationId: input.operationId, timeline: input.timeline, action: "cancel", checkId: null });
  } finally { await c.f.db.close(); }
});

test("§2 the dispatcher: today's loop without a split; with the split the pin carries the bookkeeper, the text ends with «recording» and the chips come with the commit", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const single = await campaignTurn(c, "Смотрю на море.", [{ text: "Море серое.", toolCalls: [time(3), finish("quiet")] }], [], { split: null });
    assert.equal(single.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(single.bookkeeper.requests.length, 0, "no bookkeeper on today's loop");
    const singleRow = await c.row(single.input.operationId);
    assert.equal(singleRow.checkpoint.dmLoop.pin.bookkeeper, undefined);
    const settings = await c.settings.read();
    await c.settings.save({ expectedRevision: settings.revision, runtime: "dm-loop-v1", dmTurn: settings.dmTurn, split: splitOf(OPUS, SONNET) });
    c.live.splice(0, c.live.length);
    const played = await campaignTurn(c, "Иду к пекарне.", [{ text: `— Две монеты, — говорит Мира.\n\n${LEDGER}` }],
      [{ text: "", toolCalls: [{ name: "upsert_character", arguments: { localKey: "mira", name: "Мира", kind: "npc", present: true } }, time(5), finish("trade")] }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(played.writer.requests.length, 1);
    assert.equal(played.bookkeeper.requests.length, 1);
    const row = await c.row(played.input.operationId);
    assert.deepEqual(row.checkpoint.dmLoop.pin.bookkeeper, { providerId: "anthropic", modelId: "claude-sonnet-5-5", effort: "high" });
    assert.equal(row.checkpoint.dmLoop.pin.modelId, "claude-opus-5-5", "the writer is the campaign's pinned model");
    assert.deepEqual(row.checkpoint.dmLoop.usage.map((u) => u.modelId), ["claude-opus-5-5", "claude-sonnet-5-5"]);
    // The stream: text → recording → the chips → committed; nothing of the ledger.
    const kinds = c.live.map((event) => (event.type === "status" ? `status:${event.status}` : event.type));
    const recordingAt = kinds.indexOf("status:recording");
    assert.ok(recordingAt > 0, kinds.join(","));
    assert.ok(kinds.slice(0, recordingAt).includes("text"));
    assert.ok(!kinds.slice(0, recordingAt).includes("tool"), "no chip before the text is complete");
    assert.ok(kinds.slice(recordingAt).includes("tool"), "the chips arrive while recording");
    assert.equal(kinds.at(-1), "status:committed");
    assert.ok(!c.live.some((event) => event.type === "text" && /ledger/i.test(event.text)));
    assert.match(played.result.narration, /^— Две монеты, — говорит Мира\.$/u);
  } finally { await c.f.db.close(); }
});

test("§2 resume: a failure during bookkeeping resumes the bookkeeper only, on the pinned pair, even after the setting was switched back", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const settings = await c.settings.read();
    await c.settings.save({ expectedRevision: settings.revision, runtime: "dm-loop-v1", dmTurn: settings.dmTurn, split: splitOf(OPUS, SONNET) });
    const played = await campaignTurn(c, "Смотрю.", [{ text: `Тихо.\n\n${LEDGER}` }], [{ failBefore: "transport" }, { text: "", toolCalls: [time(5), finish("quiet")] }]);
    assert.equal(played.result.status, "failed");
    assert.equal(played.result.canRetry, true);
    assert.equal(played.writer.requests.length, 1);
    // The owner switches the campaign back to today's loop meanwhile; the turn in flight keeps its pair.
    const current = await c.settings.read();
    await c.settings.save({ expectedRevision: current.revision, runtime: "dm-loop-v1", dmTurn: current.dmTurn, split: null });
    const base = await c.deps(played.writer);
    const retried = await resume(c, played, "retry", { ...base, split: null, bookkeeperModel: () => played.bookkeeper });
    assert.equal(retried.status, "committed", JSON.stringify(c.errors));
    assert.equal(played.writer.requests.length, 1, "the writer was not asked again");
    assert.equal(played.bookkeeper.requests.length, 2);
    assert.match(played.bookkeeper.requests[1].messages[0].text, /^Bookkeeping brief for this turn\./);
    assert.ok(c.live.filter((event) => event.type === "status" && event.status === "recording").length >= 2, "the resume announces recording again");
  } finally { await c.f.db.close(); }
});

test("§2 the writer's continuation after a dice pause is retried once on a transport failure; a refusal still fails", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const settings = await c.settings.read();
    await c.settings.save({ expectedRevision: settings.revision, runtime: "dm-loop-v1", dmTurn: settings.dmTurn, split: splitOf(OPUS, SONNET) });
    const played = await campaignTurn(c, "Пробую пройти тихо.", [
      { parts: [{ text: "Рэй тянет ставню —" }, { toolCall: { name: "roll", arguments: { formula: "1d20", reason: "Скрытность", actorRef: c.hero, visibility: "player", difficulty: "normal" } } }] },
      { failBefore: "transport" },
      { text: `— и петля не скрипит.\n\n${LEDGER}` },
    ], [{ text: "", toolCalls: [time(10), finish("exploration")] }], { dice: [15] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    assert.deepEqual(played.statuses, ["awaiting_confirmation", "committed"]);
    assert.equal(played.writer.requests.length, 3, "the failed continuation and its retry");
    const row = await c.row(played.input.operationId);
    assert.ok(row.checkpoint.dmLoop.diagnostics.some((d) => d.kind === "writer_retried" && d.request === 2));
    assert.match(played.result.narration, /^Рэй тянет ставню —\s?и петля не скрипит\.$/u);
    // A first-request failure is not retried (the player's «Повторить» is the way), nor a rejection.
    const failed = await campaignTurn(c, "Смотрю.", [{ failBefore: "transport" }], []);
    assert.equal(failed.result.status, "failed");
    assert.equal(failed.writer.requests.length, 1);
  } finally { await c.f.db.close(); }
});

test("§2 the ledger: a missing one is asked for once; a long one is clipped at the budget; it reaches the brief and the checkpoint, never the scenes", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const settings = await c.settings.read();
    await c.settings.save({ expectedRevision: settings.revision, runtime: "dm-loop-v1", dmTurn: settings.dmTurn, split: splitOf(OPUS, SONNET) });
    const asked = await campaignTurn(c, "Смотрю.", [{ text: "Тихо." }, { text: LEDGER }], [{ text: "", toolCalls: [time(5), finish("quiet")] }]);
    assert.equal(asked.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(asked.writer.requests.length, 2);
    assert.match(asked.writer.requests[1].messages.at(-1).text, /the ledger is missing/);
    assert.match(asked.bookkeeper.requests[0].messages[0].text, /Writer's ledger \(private\):\nвремя — 5 минут/u);
    assert.equal(asked.result.narration, "Тихо.");
    const long = `<ledger>\n${"вещи — очень длинная строка про вещь;\n".repeat(400)}</ledger>`;
    assert.ok(long.length > LEDGER_MAX_CHARS);
    const clipped = await campaignTurn(c, "Смотрю ещё.", [{ text: `Снова тихо.\n\n${long}` }], [{ text: "", toolCalls: [time(5), finish("quiet")] }]);
    assert.equal(clipped.result.status, "committed", JSON.stringify(c.errors));
    const row = await c.row(clipped.input.operationId);
    assert.ok(row.checkpoint.dmLoop.diagnostics.some((d) => d.kind === "ledger_clipped"));
    const brief = clipped.bookkeeper.requests[0].messages[0].text;
    assert.match(brief, /the ledger was longer than the budget/);
    assert.ok(brief.length < long.length);
    assert.equal(splitLedger(`a ${long}`).clipped, true);
    // Private: the checkpoint's transcript holds it; the public scenes do not.
    assert.ok(row.checkpoint.dmLoop.transcript.some((m) => m.role === "assistant" && m.text.includes("<ledger>")));
    const state = await c.state();
    assert.ok(!state.scenes.some((scene) => /ledger|очень длинная/.test(scene.body)));
    assert.ok(!c.live.some((event) => event.type === "text" && /очень длинная/.test(event.text)));
  } finally { await c.f.db.close(); }
});

test("§3 rejected record calls go back once with their reasons, on both runtimes; a fixed resend is accepted", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    // Today's loop: the time call without its reason is rejected, sent back, fixed.
    const single = await c.turn("Жду.", [
      { text: "Ждёшь.", toolCalls: [{ name: "advance_time", arguments: { minutes: 7 } }, finish("quiet")] },
      { text: "", toolCalls: [time(7), finish("quiet")] },
    ]);
    assert.equal(single.result.status, "committed", JSON.stringify(c.errors));
    const row = await c.row(single.input.operationId);
    const receipts = row.checkpoint.dmLoop.receipts.map((r) => [r.call.name, r.result.ok]);
    assert.deepEqual(receipts, [["advance_time", false], ["finish_turn", true], ["advance_time", true], ["finish_turn", true]]);
    assert.ok(row.checkpoint.dmLoop.diagnostics.some((d) => d.kind === "records_retry_asked" && d.calls[0] === "advance_time"));
    assert.match(single.model.requests[1].messages.at(-1).text, /^The server rejected one call[\s\S]*advance_time: Arguments of advance_time are invalid/);
    assert.equal(single.model.requests.length, 2, "asked once");
    const state = await c.state();
    assert.equal(state.runtime.world_minutes >= 7, true);
    // The split: the bookkeeper's rejected call is retried the same way; the writer is not involved.
    const settings = await c.settings.read();
    await c.settings.save({ expectedRevision: settings.revision, runtime: "dm-loop-v1", dmTurn: settings.dmTurn, split: splitOf(OPUS, SONNET) });
    const pair = await campaignTurn(c, "Жду ещё.", [{ text: `Ждёшь ещё.\n\n${LEDGER}` }], [
      { text: "", toolCalls: [{ name: "note_world", arguments: { key: "clock-tide", value: "скоро" } }, time(5), finish("quiet")] },
      { text: "", toolCalls: [{ name: "note_world", arguments: { kind: "fact", key: "clock-tide", operation: "set", value: "прилив через час" } }, finish("quiet")] },
    ]);
    assert.equal(pair.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(pair.writer.requests.length, 1);
    assert.equal(pair.bookkeeper.requests.length, 2);
    assert.match(pair.bookkeeper.requests[1].messages.at(-1).text, /The server rejected one call[\s\S]*note_world/);
    const pairRow = await c.row(pair.input.operationId);
    assert.deepEqual(pairRow.checkpoint.dmLoop.receipts.map((r) => [r.call.name, r.result.ok]).slice(-2), [["note_world", true], ["finish_turn", true]]);
    // The field sheet names the exact fields in both roles' layer 1.
    const sheet = toolFieldSheet();
    assert.match(sheet, /- note_world: kind \(fact \| clock \| faction \| consequence\), key, operation \(set \| advance\); optional: value, amount/);
    assert.match(sheet, /upsert_character has no «details»/);
    assert.match(single.model.requests[0].system[0].text, /Exact fields of the tools/);
    assert.match(pair.bookkeeper.requests[0].system[0].text, /Exact fields of the tools/);
    assert.doesNotMatch(pair.writer.requests[0].system[0].text, /Exact fields of the tools/, "the writer has one tool and no field sheet");
  } finally { await c.f.db.close(); }
});

test("§3 move_party resolves a listed place ID the model mangled by a character (the bake-off's rejection)", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const first = await c.turn("Иду к мельнице.", [{ text: "Мельница у реки.", toolCalls: [
      { name: "upsert_place", arguments: { localKey: "mill", name: "Мельница", description: "у реки", status: "known" } }, time(5), finish("travel")] }]);
    assert.equal(first.result.status, "committed", JSON.stringify(c.errors));
    const mill = (await c.state()).locations.find((row) => row.name === "Мельница");
    assert.ok(mill);
    // db431570-f3e9-542c-9cea-… was offered as db431570-f3e9-542c-cea-…: one character dropped from the fourth group.
    const mangled = mill.id.replace(/-(\w)(\w{3})-/, "-$2-");
    assert.notEqual(mangled, mill.id);
    assert.equal(nearlySameId(mangled, mill.id), true);
    assert.equal(nearlySameId(mill.id.replace(/^......../, "00000000"), mill.id), false, "a different first group is another record");
    const moved = await c.turn("Иду на мельницу.", [{ text: "Идёшь.", toolCalls: [{ name: "move_party", arguments: { placeRef: mangled, minutes: 20 } }, finish("travel")] }]);
    assert.equal(moved.result.status, "committed", JSON.stringify(c.errors));
    const row = await c.row(moved.input.operationId);
    const move = row.checkpoint.dmLoop.receipts.find((r) => r.call.name === "move_party");
    assert.equal(move.result.ok, true, move.result.reason);
    assert.equal(move.result.value.placeId, mill.id);
    assert.equal((await c.state()).publicState.current_location_id, mill.id);
  } finally { await c.f.db.close(); }
});

test("§4 the turn snapshot: compact, round-trips, saved once per committed turn, listed and read by turn, pruned by the setting", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const rpc = async (args) => {
      try { return { data: (await c.f.one("select public.rpg_turn_snapshots($1,$2,$3,$4::jsonb) result", [args.p_owner_id, args.p_campaign_id, args.p_action, JSON.stringify(args.p_payload)])).result }; }
      catch (error) { return { error: { message: error.message } }; }
    };
    const store = (await c.deps(createScriptedDmModel([]))).store;
    const turnAndSource = async (text) => {
      const input = await c.input(text);
      await store.begin(input, "dm-loop-v1");
      const claim = await store.claim(c.cid, input.operationId);
      await store.cancel({ commandId: randomUUID(), campaignId: c.cid, operationId: input.operationId, timeline: input.timeline, action: "cancel", checkId: null });
      return { input, source: claim.source };
    };
    const probe = await turnAndSource("Смотрю.");
    const encoded = encodeTurnSnapshot(probe.input, probe.source);
    const json = JSON.stringify(probe.source).length;
    // A fresh fixture campaign is small (base64 costs a third back); a played one compresses far better.
    assert.ok(encoded.source.length < json * 0.6, `compressed ${encoded.source.length} of ${json}`);
    assert.ok(encoded.bytes > json, "the uncompressed size counts the whole payload");
    assert.equal(typeof decoded0(encoded.source).takenAt, "string");
    const decoded = decodeTurnSnapshot(encoded.source);
    assert.equal(decoded.input.input, "Смотрю.");
    assert.equal(decoded.source.runtime.revision, probe.source.runtime.revision);
    assert.equal(decoded.source.memory, undefined, "the retrieved memory rows are not part of the snapshot");
    assert.equal(decoded.source.snapshot.entities.length, probe.source.snapshot.entities.length);
    // Only a committed loop turn may be saved; the save is idempotent.
    await assert.rejects(saveTurnSnapshotWith(rpc, c.owner, c.cid, probe.input, probe.source), /validation/);
    const one = await c.turn("Жду.", [{ text: "Ждёшь.", toolCalls: [time(5), finish("quiet")] }]);
    assert.equal(one.result.status, "committed");
    const sourceOne = await turnAndSource("Ещё жду.");
    const saved = await saveTurnSnapshotWith(rpc, c.owner, c.cid, one.input, sourceOne.source);
    assert.deepEqual(saved, { saved: true, turnNo: 1, pruned: 0 });
    const again = await saveTurnSnapshotWith(rpc, c.owner, c.cid, one.input, sourceOne.source);
    assert.equal(again.turnNo, 1);
    const two = await c.turn("Иду.", [{ text: "Идёшь.", toolCalls: [time(5), finish("travel")] }]);
    const sourceTwo = await turnAndSource("Иду дальше.");
    assert.equal((await saveTurnSnapshotWith(rpc, c.owner, c.cid, two.input, sourceTwo.source)).turnNo, 2);
    const list = await listTurnSnapshotsWith(rpc, c.owner, c.cid);
    assert.equal(list.keep, null);
    assert.deepEqual(list.snapshots.map((row) => [row.turnNo, row.input]), [[1, "Жду."], [2, "Иду."]]);
    assert.ok(list.snapshots.every((row) => !("source" in row)), "the list carries no payload");
    const read = await readTurnSnapshotWith(rpc, c.owner, c.cid, { turnNo: 2 });
    assert.equal(read.operationId, two.input.operationId);
    assert.equal(read.payload.input.input, "Иду.");
    assert.equal(read.payload.source.runtime.revision, sourceTwo.source.runtime.revision);
    await assert.rejects(readTurnSnapshotWith(rpc, c.owner, c.cid, { turnNo: 9 }), /not_found/);
    // The setting prunes: keep the newest one.
    const settings = await c.settings.read();
    await c.settings.save({ expectedRevision: settings.revision, runtime: "dm-loop-v1", dmTurn: settings.dmTurn, snapshotsKeep: 1 });
    const pruned = await listTurnSnapshotsWith(rpc, c.owner, c.cid);
    assert.equal(pruned.keep, 1);
    // The pruned turn is still listed from its claim-time source (the voice stage's fix of the list: the
    // turns table is aliased `tr`, no longer shadowed by the variable `t`), the kept one from its row.
    assert.deepEqual(pruned.snapshots.map((row) => [row.turnNo, row.stored]), [[1, "turn"], [2, "snapshot"]]);
    // Nothing of it reaches the DM's context or the public state.
    const state = await c.state();
    assert.ok(!JSON.stringify(state.scenes).includes("gzip"));
  } finally { await c.f.db.close(); }
});

test("§2 the live view: «recording» keeps the stream open; the ledger registry is private to the server", () => {
  let view = emptyLiveTurn("op");
  view = applyLiveEvent(view, { type: "text", text: "Тихо." });
  view = applyLiveEvent(view, { type: "status", status: "recording" });
  assert.equal(view.status, "recording");
  assert.equal(liveStatusEnds(view.status), false);
  assert.equal(liveStatusEnds("generating"), false);
  assert.equal(liveStatusEnds("committed"), true);
  assert.equal(liveStatusEnds("awaiting_confirmation"), true);
  const seen = [];
  publishLiveTurnEvent("op-1", { type: "text", text: "a" });
  publishLiveTurnEvent("op-1", { type: "status", status: "recording" });
  const unsubscribe = subscribeLiveTurn("op-1", (event) => seen.push(event));
  assert.equal(liveTurnFinished("op-1"), false, "recording does not end the turn");
  publishLiveTurnEvent("op-1", { type: "tool", name: "item", ok: true, summary: "x" });
  publishLiveTurnEvent("op-1", { type: "status", status: "committed" });
  unsubscribe();
  assert.deepEqual(seen.map((event) => event.type), ["text", "status", "tool", "status"]);
  assert.equal(liveTurnFinished("op-1"), true);
  keepLiveTurnLedger("op-1", "вещи — нож");
  assert.equal(liveTurnLedger("op-1"), "вещи — нож");
  assert.equal(liveTurnLedger("op-2"), null);
  assert.ok(!seen.some((event) => JSON.stringify(event).includes("нож")), "the ledger never travels on the stream");
});

test("§2 §5 the wiring: the service routes by the campaign's choice, the composer holds the send while recording, the settings screen offers the three choices, the picture defaults", () => {
  const service = src("src/lib/server/gameplay-service.ts");
  assert.doesNotMatch(service, /DM_TWO_PASS|twoPassFlag/, "the server flag is gone");
  assert.match(service, /runCampaignTurn\(input, campaignDeps\)/);
  assert.match(service, /current\.split\?\.writer \?\? current\.dmTurn/, "the pinned dm.turn is the writer on a split campaign");
  assert.match(service, /keepLiveTurnLedger\(split\.operationId, split\.ledger\)/);
  assert.match(service, /saveTurnSnapshot\(ownerId, campaignId, input, source, /);
  const composer = src("src/components/gameplay-composer.tsx");
  assert.match(composer, /const recording = busy && live\?\.status === "recording"/);
  assert.match(composer, /"Send after the records"/);
  assert.match(composer, /value=\{recording \? held\.text : journal\.text\}/, "the composer opens for the next action while recording");
  assert.match(composer, /window\.setTimeout\(\(\) => \{ void sendRef\.current\(\); \}, 0\)/, "the held send goes at the commit");
  const turn = src("src/components/gameplay-turn.tsx");
  assert.match(turn, /recording \? "DM is recording…" : "DM is thinking…"/);
  const game = src("src/components/registry/game-screen.tsx");
  assert.match(game, /view\.status === "recording"/);
  const ru = JSON.parse(src("src/lib/locales/ru.json"));
  assert.equal(ru["DM is recording…"], "Ведущий записывает…");
  const settings = src("src/components/registry/settings-screen.tsx");
  assert.match(settings, /dmArchitectures\.map/);
  assert.match(settings, /Подробнее/);
  assert.match(settings, /label=\{c\("Писатель", "Writer"\)\}/);
  assert.match(settings, /label=\{c\("Бухгалтер", "Bookkeeper"\)\}/);
  const bootstrap = src("src/lib/server/adventure-bootstrap.ts");
  assert.match(bootstrap, /settings\.split\?\.writer \?\? settings\.dmTurn/, "the opening is written by the writer");
  const pictures = src("src/lib/server/media/pictures-service.ts");
  assert.match(pictures, /ledger: liveTurnLedger\(operationId\)/, "the director reads the writer's ledger");
  // §5: the director off by default, live frames on Sunburst, Flare still a choice.
  assert.equal(defaultPictureSettings.director, false);
  assert.equal(DEFAULT_TIER_MODELS.fast, "gpt-image-2.5-sunburst");
  assert.equal(DEFAULT_TIER_MODELS.quality, "gpt-image-2.5-sunburst");
  const migration = src("supabase/migrations/202610180068_polish3_dm_architecture.sql");
  assert.match(migration, /alter column director set default false/);
  assert.match(migration, /update rpg_private\.picture_settings set director=false where director/);
});
