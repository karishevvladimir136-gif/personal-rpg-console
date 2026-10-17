// Polish stage, group 4 (docs/stages/POLISH.md): the DM's craft from session 1 —
// the new doctrine as pending DM Craft versions (never activated by the
// migration), the likes note in two parts (the player's own words and the DM's
// observations), the clock with the part of the day in words, and the bench's
// time-word check.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { partOfDay } from "../src/lib/gameplay/dm-loop/context.ts";
import { PLAYER_LIKES_CAP } from "../src/lib/gameplay/dm-loop/execute.ts";
import { evaluateCheck } from "../scripts/eval/lib/state.mjs";

const finish = (extra = {}) => ({ name: "finish_turn", arguments: { sceneKinds: ["conversation"], spotlight: [], playerMoment: false, ...extra } });
const POLISH_KEYS = ["heros-knowledge", "danger-and-pacing", "heros-moment", "time-and-clock", "open-questions-and-tics", "records-match-the-fiction"];

test("the polish cards are seeded pending: a version each, none active, one line «what changes»; the owner's approval puts them into layer 1", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const craft = async (action, payload = {}) => (await c.f.one("select public.rpg_dm_craft($1,$2,$3::jsonb) result",
      [c.owner, action, JSON.stringify(action === "read" ? payload : { requestId: randomUUID(), ...payload })])).result;
    const view = await craft("read");
    for (const key of POLISH_KEYS) {
      const versions = view.versions.filter((row) => row.key === key);
      assert.equal(versions.length, 1, `${key} has exactly one version`);
      assert.equal(versions[0].kind, "card");
      assert.match(versions[0].provenance, /^Polish: /, "the provenance is the one line «what changes»");
      assert.ok(versions[0].en.title && versions[0].ru.title && versions[0].en.guidance.length <= 1600 && versions[0].ru.guidance.length <= 1600);
      const effective = view.effective.find((row) => row.key === key);
      assert.ok(!effective || effective.activeVersionId === null, `${key} is pending, never activated by the migration`);
    }
    const before = await c.turn("Здороваюсь с Фролом.", [{ text: "Фрол кивает. ", toolCalls: [finish()] }]);
    assert.equal(before.result.status, "committed", JSON.stringify(c.errors));
    const layer1Before = before.model.requests[0].system[0].text;
    assert.doesNotMatch(layer1Before, /Знание героя и три улики/, "a pending card is not in the DM's hands");
    await c.activateStage4Craft();
    const after = await c.turn("Спрашиваю Фрола о лодке.", [{ text: "Фрол пожимает плечами. ", toolCalls: [finish()] }]);
    assert.equal(after.result.status, "committed", JSON.stringify(c.errors));
    const layer1 = after.model.requests[0].system[0].text;
    for (const title of ["Знание героя и три улики на тайну", "Опасность от противника, бой как бой, ясный финал", "Момент героя — и никогда не решать за героя",
      "Слова о времени — по часам", "Открытые вопросы остаются открытыми; тик — раз за сцену", "Записи, совпадающие с историей"])
      assert.match(layer1, new RegExp(`## ${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`), `the approved card «${title}» is in layer 1`);
  } finally { await c.f.db.close(); }
});

test("the likes note in two parts: the DM's observations never overwrite the player's own words; an over-long note is clipped with a notice; the dossier shows both, the player's words first", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    await c.dossier("likes", { playerLikes: "Бои короткие, опасные и с ценой; тайны и улики." });
    const long = "Игроку нравится торговаться и готовить снаряжение. ".repeat(40).trim();
    assert.ok(long.length > PLAYER_LIKES_CAP);
    const played = await c.turn("Торгуюсь с Мартой за верёвку.", [{ text: "Марта называет цену. ", toolCalls: [finish({ playerLikes: long })] }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const receipt = (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts.at(-1);
    assert.equal(receipt.result.ok, true, JSON.stringify(receipt.result));
    assert.match(receipt.result.value.playerLikesClipped, /clipped/);
    const campaign = await c.f.one("select player_likes, dm_likes from public.rpg_campaigns where id=$1", [c.cid]);
    assert.equal(campaign.player_likes, "Бои короткие, опасные и с ценой; тайны и улики.", "the player's own words are untouched");
    assert.ok(campaign.dm_likes.length <= PLAYER_LIKES_CAP && campaign.dm_likes.startsWith("Игроку нравится торговаться"), "the DM's note is clipped, not refused");
    const view = await c.dossier("read");
    assert.equal(view.playerLikes, campaign.player_likes);
    assert.equal(view.dmLikes, campaign.dm_likes);
    const next = await c.turn("Беру верёвку.", [{ text: "Верёвка твоя. ", toolCalls: [finish()] }]);
    const tail = next.model.requests[0].system[3].text;
    const own = tail.indexOf("What the player asked for, in their own words");
    const observed = tail.indexOf("Your observations of what the player enjoys");
    assert.ok(own >= 0 && observed > own, "the dossier shows both, the player's words first");
    assert.match(tail, /Бои короткие, опасные и с ценой/);
  } finally { await c.f.db.close(); }
});

test("the state names the part of the day in the campaign language and asks the DM to check time words against it", async () => {
  assert.equal(partOfDay(0), "night");
  assert.equal(partOfDay(7 * 60, "ru"), "утро");
  assert.equal(partOfDay(13 * 60, "ru"), "день");
  assert.equal(partOfDay(17 * 60 + 5, "ru"), "вечер");
  assert.equal(partOfDay(23 * 60, "en"), "night");
  const c = await loopCampaign({ language: "ru" });
  try {
    const first = await c.turn("Жду вечера у стойки.", [{ text: "Время идёт. ", toolCalls: [
      { name: "advance_time", arguments: { minutes: 17 * 60 + 5, reason: "waiting for the evening" } }, finish()] }]);
    assert.equal(first.result.status, "committed", JSON.stringify(c.errors));
    const second = await c.turn("Смотрю на часы.", [{ text: "Вечер. ", toolCalls: [finish()] }]);
    const now = second.model.requests[0].system[4].text;
    assert.match(now, /"timeOfDay":"вечер \(check every/);
    assert.match(now, /"worldDay":"day 1 17:05"/);
  } finally { await c.f.db.close(); }
});

test("the bench's timeWordsMatchClock check: «утром» on an evening clock fails, «вечером» passes, yesterday's morning is not this morning", async () => {
  const run = (narration, worldMinutes = 17 * 60 + 5) => evaluateCheck({ timeWordsMatchClock: true }, { before: { worldMinutes }, after: { worldMinutes }, turn: { narration } });
  assert.equal((await run("Утром вы спрашивали про знак на фонарь.")).pass, false);
  assert.equal((await run("Вечером у стойки тихо; Дуня сплёвывает за борт.")).pass, true);
  assert.equal((await run("Вчера утром он ещё был здесь, а сейчас вечер.")).pass, true, "a reference to another day is not a contradiction");
  assert.equal((await run("The lamps are lit; this morning feels far away.", 9 * 60)).pass, true);
  assert.equal((await run("В полдень солнце стоит над рейдом.", 13 * 60)).pass, true);
  assert.equal((await run("Ночью на рейде тихо.", 13 * 60)).pass, false);
});

test("timeWordsMatchClock: a sentence about another time («той ночью», «наутро») is not a claim about now", async () => {
  const { evaluateCheck } = await import("../scripts/eval/lib/state.mjs");
  const run = (narration, worldMinutes = 8 * 60) => evaluateCheck({ timeWordsMatchClock: true }, { before: { worldMinutes }, turn: { narration } });
  assert.equal((await run("Мокей той же ночью лодку потерял. Наутро там уже буй стоял.")).pass, true, "past nights on a morning clock");
  assert.equal((await run("Здесь кто-то не раз сидел ночью с фонарём.")).pass, false, "a habit told without a marker still counts: the DM should anchor it");
  assert.equal((await run("Сейчас ночью тихо.")).pass, false, "a claim about now on a morning clock fails");
  assert.equal((await run("Он той ночью на воде был. Сегодня утром ты видишь мачту.")).pass, true);
});
