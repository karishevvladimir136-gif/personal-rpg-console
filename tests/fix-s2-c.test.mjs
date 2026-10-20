// Fix run after session 2, stage C — the turn on screen (docs/stages/FIX_S2_CDEF.md; combat moved to the 2D session).
import test from "node:test";
import assert from "node:assert/strict";
import { loopCampaign } from "./dm-loop-fixture.mjs";

const time = (minutes = 1) => ({ name: "advance_time", arguments: { minutes, reason: "время" } });
const finish = () => ({ name: "finish_turn", arguments: { sceneKinds: ["combat"], spotlight: [], playerMoment: false, nextTension: "tense" } });

test("C (item 44, the owner's decision): the DM rolls for the companions — a companion's check never pauses the turn; the hero's does; «the player rolls for the companions» pauses theirs too", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const hired = await c.turn("Нанимаю Брама.", [{ text: "Брам кивает. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "bram", name: "Брам", kind: "companion", party: true, present: true, hp: 20, maxHp: 20 } }, time(), finish()] }]);
    assert.equal(hired.result.status, "committed", JSON.stringify(c.errors));
    const bram = (await c.f.one("select id from public.rpg_entities where campaign_id=$1 and name='Брам'", [c.cid])).id;
    const companionRoll = { name: "roll", arguments: { formula: "1d20+3", reason: "Брам: арбалет по громиле", actorRef: bram, visibility: "player", kind: "attack", dc: 11 } };
    const one = await c.turn("Брам, стреляй!", [{ text: "Брам вскидывает арбалет. ", toolCalls: [companionRoll] }, { text: "Болт уходит в цель.", toolCalls: [time(), finish()] }]);
    assert.equal(one.result.status, "committed", JSON.stringify(c.errors));
    assert.ok(!one.statuses.includes("awaiting_confirmation"), `no pause for the companion: ${one.statuses.join(", ")}`);
    const hero = await c.turn("Стреляю сам.", [{ text: "Рэй целится. ", toolCalls: [{ name: "roll", arguments: { formula: "1d20+5", reason: "Выстрел", actorRef: c.hero, visibility: "player", kind: "attack", dc: 11 } }] },
      { text: "Попал.", toolCalls: [time(), finish()] }]);
    assert.ok(hero.statuses.includes("awaiting_confirmation"), `the hero's check pauses: ${hero.statuses.join(", ")}`);
    const before = await c.settings.read();
    await c.settings.save({ expectedRevision: before.revision, runtime: "dm-loop-v1", dmTurn: before.dmTurn, options: { companionRolls: "player" } });
    const two = await c.turn("Брам, ещё раз!", [{ text: "Брам перезаряжает. ", toolCalls: [{ ...companionRoll, arguments: { ...companionRoll.arguments, reason: "Брам: второй болт" } }] },
      { text: "Мимо.", toolCalls: [time(), finish()] }]);
    assert.ok(two.statuses.includes("awaiting_confirmation"), `the player rolls for the companions: ${two.statuses.join(", ")}`);
  } finally { await c.f.db.close(); }
});
