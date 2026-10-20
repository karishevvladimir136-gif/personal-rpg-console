// Polish 3 §7: craft by role and by situation — the card's role (migration 69), the short always-on
// layer 1 with the selected cards in the tail, the bookkeeper's own selection on the narration and
// the ledger, the time-word check as code, the replay tool's craft sets, the DM Craft screen.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { buildDmLoopContext, craftCardsBlock, estimateTokens } from "../src/lib/gameplay/dm-loop/context.ts";
import { bookkeeperSystem, bookkeeperCards, runCampaignTurn, bookkeeperOf } from "../src/lib/gameplay/dm-loop/two-pass/index.ts";
import { cardForRole, pinnedCraftForStage, selectCraftCards } from "../src/lib/gameplay/dm-craft-context.ts";
import { parseCraftEntry } from "../src/lib/dm-craft/validation.ts";
import { timeWordsAgainstClock, timeCheckNote, parseTimeCheckNote, timeCheckLine, TIME_CHECK_KEY } from "../src/lib/gameplay/dm-loop/time-words.ts";
import { craftVariant, SESSION1_CARDS } from "../scripts/eval/real-replay/lib/craft.mjs";
import { encodeTurnSnapshot, decodeTurnSnapshot } from "../src/lib/gameplay/turn-snapshot.ts";

const src = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const finish = (kind = "quiet") => ({ name: "finish_turn", arguments: { sceneKinds: [kind], spotlight: [], playerMoment: false, nextTension: "calm" } });
const time = (minutes = 5) => ({ name: "advance_time", arguments: { minutes, reason: "время" } });
const craft = async (c, action, payload = {}) => (await c.f.one("select public.rpg_dm_craft($1,$2,$3::jsonb) result",
  [c.owner, action, JSON.stringify(action === "read" ? payload : { requestId: randomUUID(), ...payload })])).result;

test("§7 migration 69: every card has a role; the 22 active keys carry theirs; the save keeps a role and defaults to both; the screen shows it", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    await c.activateStage4Craft();
    const view = await craft(c, "read");
    const active = view.effective.map((row) => view.versions.find((v) => v.id === row.activeVersionId)).filter(Boolean);
    assert.equal(active.length, 22, "the doctrine and the 21 approved cards");
    assert.ok(active.every((v) => ["writer", "bookkeeper", "both"].includes(v.role)));
    const roleOf = (key) => active.find((v) => v.key === key)?.role;
    assert.equal(roleOf("core-doctrine"), "both");
    assert.equal(roleOf("records-match-the-fiction"), "bookkeeper");
    assert.equal(roleOf("time-and-clock"), "both");
    assert.equal(roleOf("heros-knowledge"), "both");
    assert.equal(roleOf("open-questions-and-tics"), "both");
    assert.equal(roleOf("living-world"), "both");
    assert.equal(roleOf("world-resistance"), "writer");
    assert.equal(roleOf("danger-and-pacing"), "writer");
    assert.equal(roleOf("quiet-and-decompression"), "writer");
    for (const key of SESSION1_CARDS) assert.equal(roleOf(key), "writer", key);
    assert.equal(active.filter((v) => v.role === "writer").length, 15);
    assert.equal(active.filter((v) => v.role === "both").length, 6);
    // A save with a role sets the key's role (every version shows it); a save without one keeps it; a wrong role is refused.
    const base = active.find((v) => v.key === "quiet-and-decompression");
    const entry = { key: base.key, kind: "card", category: base.category, stages: base.stages, triggers: base.triggers, en: base.en, ru: base.ru, provenance: "Owner manual edit" };
    const revision = view.effective.find((row) => row.key === base.key).activationRevision;
    const saved = await craft(c, "save", { expectedActivationRevision: revision, entry: { ...entry, role: "bookkeeper" } });
    assert.ok(saved.versions.filter((v) => v.key === base.key).every((v) => v.role === "bookkeeper"), "the role belongs to the key");
    const again = await craft(c, "save", { expectedActivationRevision: revision + 1, entry });
    assert.equal(again.versions.filter((v) => v.key === base.key).sort((a, b) => b.version - a.version)[0].role, "bookkeeper", "an omitted role keeps the key's");
    await assert.rejects(craft(c, "save", { expectedActivationRevision: revision + 2, entry: { ...entry, role: "narrator" } }), /rpg_validation/);
    const fresh = await craft(c, "save", { expectedActivationRevision: 0, entry: { ...entry, key: "a-new-card", triggers: ["x1"] } });
    assert.equal(fresh.versions.find((v) => v.key === "a-new-card").role, "both", "a new key without a role is both");
    assert.equal(parseCraftEntry({ ...entry, role: "writer" }).role, "writer");
    assert.equal(parseCraftEntry(entry).role, undefined);
    assert.throws(() => parseCraftEntry({ ...entry, role: "narrator" }), /invalid_dm_craft/);
    assert.equal(cardForRole("both", "writer"), true);
    assert.equal(cardForRole("bookkeeper", "writer"), false);
    assert.equal(cardForRole("bookkeeper", "dm"), true, "the single loop takes every card");
    const screen = src("src/components/dm-craft-owner.tsx");
    assert.match(screen, /t\("For whom"\)/);
    assert.match(screen, /roleLabel\(version\.role \?\? "both"\)/);
    const ru = JSON.parse(src("src/lib/locales/ru.json"));
    // Fix run after session 2 (item 7): the owner's word for the role on the craft cards is «Для учётчика».
    assert.equal(ru["For the bookkeeper"], "Для учётчика");
  } finally { await c.f.db.close(); }
});

test("§7 always-on stays short: layer 1 has the doctrine and the style, not the library; the selected cards travel in the tail by role", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    await c.activateStage4Craft();
    const store = (await c.deps(createScriptedDmModel([]))).store;
    const play = await store.readPlay(c.cid);
    // An input whose words hit the records card (a bookkeeper card) and a writer card.
    const input = { operationId: randomUUID(), campaignId: c.cid, timeline: play.timeline, expectedRevision: play.revision,
      mode: "game", input: "Отдаю Марте нож в залог и жду, пока спадёт напряжение после драки.", companionId: null, listenerIds: [], mechanic: null };
    await store.begin(input, "dm-loop-v1");
    const claim = await store.claim(c.cid, input.operationId);
    const pinned = pinnedCraftForStage(claim.source, input, "plan");
    assert.ok(pinned.library.length >= 19, `the pin carries the library of the stage (${pinned.library.length}; two cards are narrate-only)`);
    assert.ok(pinned.library.every((card) => typeof card.key === "string" && Array.isArray(card.triggers) && ["writer", "bookkeeper", "both"].includes(card.role)));
    assert.ok(pinned.cards.length >= 1 && pinned.cards.length <= 2, `the SQL selector chose ${pinned.cards.length}`);
    const dm = buildDmLoopContext(claim.source, input);
    const layer1 = dm.parts.howToDm;
    assert.doesNotMatch(layer1, /DM Craft library/);
    assert.match(layer1, /DM Craft — how to run/);
    assert.match(layer1, /DM Style/);
    const whole = pinned.library.map((card) => `## ${card.title}\n${card.guidance}\nAvoid: ${card.avoid}`).join("\n");
    const before = estimateTokens(`${layer1}\n\n${whole}`), after = estimateTokens(layer1);
    assert.ok(after < before * 0.6, `layer 1 ${before} → ${after} tokens`);
    console.log(`layer 1 tokens: before (whole library) ${before}, after ${after}; the library ${estimateTokens(whole)} tokens; the tail's cards ${estimateTokens(craftCardsBlock(dm.craft.selected))} tokens`);
    // The single loop's tail carries every selected card; layer 1 stays identical whatever the cards.
    assert.equal(dm.craft.selected.length, pinned.cards.length);
    for (const card of dm.craft.selected) assert.ok(dm.parts.tail.includes(card.title) && !dm.parts.howToDm.includes(card.guidance));
    assert.match(dm.parts.tail, /DM Craft cards for this turn/);
    assert.ok(dm.system[0].cache && dm.system.at(-2).cache === false, "the cards sit in the uncached tail");
    // The writer takes only the writer's and the shared cards.
    const writer = buildDmLoopContext(claim.source, input, { role: "writer" });
    assert.ok(writer.craft.selected.every((card) => card.role !== "bookkeeper"));
    assert.ok(writer.craft.selected.length <= dm.craft.selected.length);
    assert.equal(writer.parts.howToDm.includes("DM Craft library"), false);
    // The bookkeeper selects on the narration and the ledger, among its own and the shared cards.
    const narration = "Марта берёт нож в залог: вернёт за шестнадцать монет. Проходит полчаса.";
    const ledger = "вещи — нож отдан Марте в залог; деньги — долг сорок монет; время — 30 минут";
    const picked = bookkeeperCards(dm, { narration, ledger });
    assert.ok(picked.length >= 1 && picked.length <= 2, `the bookkeeper's selection ${picked.length}`);
    assert.ok(picked.every((card) => card.role !== "writer"));
    assert.ok(picked.some((card) => card.key === "records-match-the-fiction"), picked.map((c) => c.key).join(","));
    const system = bookkeeperSystem(writer, "Russian", { narration, ledger });
    assert.equal(system.length, 4);
    assert.match(system[2].text, /DM Craft cards for this turn/);
    assert.ok(system[2].text.includes(picked[0].title));
    assert.ok(!system[2].text.includes(writer.craft.selected.find((card) => card.role === "writer")?.guidance ?? "\u0000"), "no writer-only card in the bookkeeper's tail");
    assert.equal(selectCraftCards([{ key: "a", triggers: ["нож"] }, { key: "b", triggers: ["нож", "залог"] }, { key: "c", triggers: ["корабль"] }], "нож в залог", 2).map((c) => c.key).join(","), "b,a");
    await store.cancel({ commandId: randomUUID(), campaignId: c.cid, operationId: input.operationId, timeline: input.timeline, action: "cancel", checkId: null });
  } finally { await c.f.db.close(); }
});

test("§7 the time-word check runs in code after a commit: a mismatch is one line in the next turn's tail, nothing otherwise", async () => {
  // The checker itself.
  const evening = 18 * 60 + 40;
  assert.deepEqual(timeWordsAgainstClock("Утром ты спрашивал о лодке. Сейчас тихо.", evening).wrong, ["morning"]);
  assert.deepEqual(timeWordsAgainstClock("Вечером у причала тихо.", evening).wrong, []);
  assert.deepEqual(timeWordsAgainstClock("Той ночью было страшно; вчера утром ты вернулся. Вечером тихо.", evening).wrong, [], "another time's sentence is not a claim about now");
  assert.deepEqual(timeWordsAgainstClock("Ничего о времени.", evening).found, []);
  const note = timeCheckNote("op", timeWordsAgainstClock("Утром ты спрашивал.", evening));
  assert.equal(parseTimeCheckNote({ fact: { [TIME_CHECK_KEY]: note } }).hhmm, "18:40");
  assert.match(timeCheckLine({ fact: { [TIME_CHECK_KEY]: note } }, "ru"), /said «утро» while the clock said вечер \(18:40\)/);
  assert.equal(timeCheckLine({ fact: { [TIME_CHECK_KEY]: "" } }, "ru"), "");
  assert.equal(timeCheckLine({}, "ru"), "");
  const c = await loopCampaign({ language: "ru" });
  try {
    // A word of another part of the day than the clock's at the turn's start disagrees.
    const words = { morning: ["Утром", "утро"], day: ["Днём", "день"], evening: ["Вечером", "вечер"], night: ["Ночью", "ночь"] };
    const clockAt = (await c.state()).runtime.world_minutes;
    const clock = timeWordsAgainstClock("", clockAt).clock;
    const wrongPart = Object.keys(words).find((part) => part !== clock);
    const first = await c.turn("Смотрю.", [{ text: `${words[wrongPart][0]} ты смотришь на море.`, toolCalls: [time(5), finish("quiet")] }]);
    assert.equal(first.result.status, "committed", JSON.stringify(c.errors));
    const row = await c.row(first.input.operationId);
    assert.ok(row.checkpoint.dmLoop.diagnostics.some((d) => d.kind === "time_words"), JSON.stringify(row.checkpoint.dmLoop.diagnostics));
    const state = await c.state();
    assert.match(state.dmState.fact?.[TIME_CHECK_KEY] ?? "", new RegExp(`"wrote":\\["${wrongPart}"\\]`));
    // The next turn's tail carries the line; its own narration agrees with the clock, so the note is cleared.
    const clockThen = timeWordsAgainstClock("", (await c.state()).runtime.world_minutes).clock;
    const second = await c.turn("Жду.", [{ text: `${words[clockThen][0]} на причале тихо.`, toolCalls: [time(5), finish("quiet")] }]);
    assert.equal(second.result.status, "committed");
    const tail = second.model.requests[0].system.at(-2).text;
    assert.match(tail, new RegExp(`Time words of the last turn against the clock: the narration said «${words[wrongPart][1]}» while the clock said ${words[clock][1]} \\(\\d\\d:\\d\\d\\)`));
    assert.ok(!second.model.requests[0].system.some((block) => /Private DM notes[\s\S]*time_check/.test(block.text)), "the note is not a secret");
    const cleared = await c.state();
    assert.equal(cleared.dmState.fact?.[TIME_CHECK_KEY] ?? "", "");
    const third = await c.turn("Жду ещё.", [{ text: "Тихо.", toolCalls: [time(5), finish("quiet")] }]);
    assert.doesNotMatch(third.model.requests[0].system.at(-2).text, /Time words of the last turn/, "nothing when the last turn passed");
    // The split's commit runs the same check.
    const settings = await c.settings.read();
    await c.settings.save({ expectedRevision: settings.revision, runtime: "dm-loop-v1", dmTurn: settings.dmTurn,
      split: { writer: { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" }, bookkeeper: { providerId: "anthropic", modelId: "claude-sonnet-5-5", reasoning: "high" } } });
    const clockSplit = timeWordsAgainstClock("", (await c.state()).runtime.world_minutes).clock;
    const wrongSplit = Object.keys(words).find((part) => part !== clockSplit);
    const writer = createScriptedDmModel([{ text: `${words[wrongSplit][0]} ты ждёшь.\n\n<ledger>\nвремя — 5 минут\n</ledger>` }], { providerId: "anthropic", modelId: "claude-opus-5-5" });
    const bookkeeper = createScriptedDmModel([{ text: "", toolCalls: [time(5), finish("quiet")] }], { providerId: "anthropic", modelId: "claude-sonnet-5-5" });
    const base = await c.deps(writer);
    const current = await c.settings.read();
    const result = await runCampaignTurn(await c.input("Жду."), { ...base, split: current.split, bookkeeper: bookkeeperOf(current.split), bookkeeperModel: () => bookkeeper });
    assert.equal(result.status, "committed", JSON.stringify(c.errors));
    assert.match((await c.state()).dmState.fact?.[TIME_CHECK_KEY] ?? "", new RegExp(`"wrote":\\["${wrongSplit}"\\]`));
  } finally { await c.f.db.close(); }
});

test("§7 the replay tool's craft sets: live keeps the pin; none drops doctrine and cards; session1 is the ten Mega DM cards; all re-selects on the line", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    await c.activateStage4Craft();
    let captured = null;
    const played = await c.turn("Отдаю Марте нож в залог.", [{ text: "Марта берёт нож.", toolCalls: [time(5), finish("trade")] }],
      { deps: { afterCommit: async ({ input, source }) => { captured = { input, source }; } } });
    assert.equal(played.result.status, "committed");
    const payload = decodeTurnSnapshot(encodeTurnSnapshot(captured.input, captured.source).source);
    assert.ok(payload.source.craft?.library?.length >= 20);
    assert.equal(craftVariant(payload, "live"), payload);
    const none = craftVariant(payload, "none");
    assert.equal(none.source.craft.doctrine, null);
    assert.deepEqual([none.source.craft.library, none.source.craft.plan, none.source.craft.narrate], [[], [], []]);
    assert.equal(payload.source.craft.doctrine.key, "core-doctrine", "the original is untouched");
    const session1 = craftVariant(payload, "session1");
    assert.equal(session1.source.craft.library.length, 10);
    assert.ok(session1.source.craft.library.every((card) => SESSION1_CARDS.includes(card.key)));
    assert.ok(session1.source.craft.plan.length <= 2 && session1.source.craft.plan.every((card) => SESSION1_CARDS.includes(card.key)));
    assert.equal(session1.source.craft.doctrine.key, "core-doctrine");
    const all = craftVariant(payload, "all");
    assert.equal(all.source.craft.library.length, payload.source.craft.library.length);
    assert.ok(all.source.craft.plan.length >= 1 && all.source.craft.plan.length <= 2);
    assert.ok(all.source.craft.plan.some((card) => card.key === "records-match-the-fiction"), "«залог» hits the records card");
    // The contexts of the three sets differ only in the cards and the doctrine.
    const input = { ...payload.input, expectedRevision: payload.source.runtime.revision, timeline: payload.source.runtime.timeline };
    const texts = ["none", "session1", "all"].map((variant) => buildDmLoopContext(craftVariant(payload, variant).source, input));
    assert.doesNotMatch(texts[0].parts.howToDm, /DM Craft — how to run/);
    assert.match(texts[1].parts.howToDm, /DM Craft — how to run/);
    assert.equal(texts[0].craft.selected.length, 0);
    assert.ok(texts[2].craft.selected.length >= 1);
    assert.equal(texts[1].parts.world, texts[2].parts.world);
    assert.equal(texts[1].parts.living, texts[2].parts.living);
  } finally { await c.f.db.close(); }
});
