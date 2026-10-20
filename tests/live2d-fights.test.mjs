// 2D Live, part 2 — the two probe fights as scripted tool sequences through the
// real loop (PGlite, the scripted model, deterministic dice): an ambush at a ford
// and a lair fight with a caster on high ground and a burning cart. The server
// holds the fight, measures the field for the DM, applies the rules module to
// attacks, and the battlefield text reaches the next turn's context.
import test from "node:test";
import assert from "node:assert/strict";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { battlefield } from "../src/lib/gameplay/dm-loop/battlefield.ts";

const receiptsOf = async (c, played) => (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts;
const okSummaries = (receipts) => receipts.map((r) => `${r.result.ok ? "ok" : "REJECT"} ${r.call.name}:${r.call.arguments.action ?? ""} ${r.result.summary ?? r.result.reason}`).join("\n");
const playOf = (c) => c.f.runtime(c.f.cid, "play");

test("the ford ambush: a planned opening, surprise, positions, an attack with the card, a move with an opportunity attack, dying, the end card", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const start = await c.turn("Мы устраиваем засаду у брода и бьём первыми.", [
      { text: "Двое разбойников бредут через брод. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "b1", name: "Кривой Ян", kind: "npc", present: true, hp: 11, maxHp: 11 } },
        { name: "upsert_character", arguments: { localKey: "b2", name: "Пузо", kind: "npc", present: true, hp: 9, maxHp: 9 } },
        { name: "combat", arguments: { action: "start", summary: "Засада у брода", grid: { cols: 16, rows: 12 }, ambient: "bright", opening: "party", rules: true,
          placements: [{ actorRef: c.hero, x: 3, y: 6, initiative: 15 }, { actorRef: "b1", x: 5, y: 6, initiative: 11 }, { actorRef: "b2", x: 9, y: 3, initiative: 8 }],
          surprisedRefs: ["b2"], hp: [{ actorRef: "b1", current: 11, max: 11, ac: 12 }, { actorRef: "b2", current: 9, max: 9, ac: 13, resist: ["cold"] }] } },
        { name: "combat", arguments: { action: "feature", op: "add", key: "river", kind: "difficult", label: "река у брода", cells: [[6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7], [6, 8]] } },
        // The opening blow in the same turn the bandits were recorded: the card's target is not in the database yet.
        { name: "combat", arguments: { action: "attack", actorRef: c.hero, targetRef: "b1", attackBonus: 5, damage: "1d8+3", damageType: "slashing", reason: "Первый удар из засады" } },
      ] },
      { text: "Бой начался. " },
    ], { dice: [3, 2] });
    assert.equal(start.result.status, "committed", JSON.stringify(c.errors));
    let receipts = await receiptsOf(c, start);
    assert.ok(receipts.every((r) => r.result.ok), okSummaries(receipts));
    const opening = receipts.find((r) => r.call.arguments.action === "attack");
    assert.ok(opening.result.check, "the opening blow is a card even though the target was created this turn");
    assert.equal(opening.result.check.targetId, null);
    assert.equal(opening.result.value.attacks[0].hit, false, "3 + 5 against AC 12: a miss");
    const started = receipts.find((r) => r.call.arguments.action === "start");
    assert.deepEqual(started.result.value.order.slice(0, 1), [`${started.result.value.order[0].split(" (")[0]} (15)`], "initiative order, the hero first");
    assert.match(started.result.summary, /planned opening resolves before initiative/);
    let play = await playOf(c);
    let encounter = play.encounters.find((row) => row.status === "active");
    assert.ok(encounter, "an active encounter");
    assert.equal(encounter.public_field.rules, true);
    assert.equal(encounter.public_field.grid.cols, 16);
    assert.equal(encounter.public_field.features[0].key, "river");
    const participants = play.participants.filter((row) => row.encounter_id === encounter.id);
    const yan = participants.find((row) => row.public_name === "Кривой Ян");
    const puzo = participants.find((row) => row.public_name === "Пузо");
    assert.deepEqual(yan.public_position, { position: "nearby", x: 5, y: 6, z: 0 }, "zones derive from the coordinates: 10 ft from the hero");
    assert.equal(puzo.public_position.position, "nearby", "30 ft away (6 cells): still «рядом»");
    assert.deepEqual(puzo.public_resources.conditions, ["surprised"]);
    assert.equal(puzo.public_resources.economy.action, false);
    assert.equal(yan.public_resources.hp.current, 11);
    assert.equal(puzo.public_resources.ac, 13);
    // The battlefield block in the next turn's context: distances, the hero's movement, the ambush rule.
    const attack = await c.turn("Бью Яна мечом.", [
      { text: "Клинок идёт вниз. ", toolCalls: [
        { name: "combat", arguments: { action: "move", actorRef: c.hero, x: 4, y: 6 } },
        { name: "combat", arguments: { action: "attack", actorRef: c.hero, targetRef: "Кривой Ян", attackBonus: 5, damage: "1d8+3", damageType: "slashing", reason: "Удар мечом по Яну" } },
        { name: "combat", arguments: { action: "next_turn" } },
      ] },
      { text: "Ян шатается. " },
    ], { dice: [17, 6] });
    assert.equal(attack.result.status, "committed", JSON.stringify(c.errors));
    const context = attack.model.requests[0].system.map((block) => block.text).join("\n") + attack.model.requests[0].messages.map((m) => m.text ?? "").join("\n");
    assert.match(context, /Поле боя/, "the battlefield block is in the DM's context");
    assert.match(context, /Раунд 1, ходит/);
    assert.match(context, /Кривой Ян 10 фт, рядом/);
    assert.match(context, /Пузо 30 фт, рядом/);
    assert.match(context, /Задуманная засада/);
    receipts = await receiptsOf(c, attack);
    assert.ok(receipts.every((r) => r.result.ok), okSummaries(receipts));
    const moved = receipts[0].result.value;
    assert.equal(moved.feet, 5);
    assert.equal(moved.movementLeft, 25);
    const struck = receipts[1];
    assert.equal(struck.result.value.attacks[0].total, 22, "the queued d20 (17) + 5");
    assert.equal(struck.result.value.attacks[0].hit, true);
    assert.equal(struck.result.value.attacks[0].damage, 9, "1d8 (6) + 3");
    assert.ok(struck.result.check, "the hero's attack is a visible card");
    assert.equal(struck.result.check.kind, "attack");
    assert.match(struck.result.player, /→ Кривой Ян: 22 против КД 12 · попал, 9 урона/);
    assert.match(receipts[2].result.player, /Раунд 1 · ходит Кривой Ян/);
    play = await playOf(c);
    encounter = play.encounters.find((row) => row.status === "active");
    const yan2 = play.participants.find((row) => row.public_name === "Кривой Ян");
    assert.equal(yan2.public_resources.hp.current, 2);
    assert.equal((await c.state()).entities.find((row) => row.name === "Кривой Ян").hp, 2, "the record mirrors the hit");
    assert.equal(encounter.public_field.log.length, 2, "the opening miss and the hit");
    assert.match(encounter.public_field.log[0].result, /промах/);
    assert.match(encounter.public_field.log[1].result, /9 урона → Кривой Ян/);
    assert.equal(encounter.public_field.activeParticipantId, yan2.id);
    // Yan swings back (a private roll: no card), the hero steps away and Yan may take an opportunity attack; the hero goes down.
    const back = await c.turn("Отступаю к берегу.", [
      { text: "Ян бьёт дубиной. ", toolCalls: [
        { name: "combat", arguments: { action: "attack", actorRef: "Кривой Ян", targetRef: c.hero, attackBonus: 3, ac: 10, damage: "1d6+1", damageType: "bludgeoning", count: 2 } },
        { name: "combat", arguments: { action: "next_turn" } },
        { name: "combat", arguments: { action: "next_turn" } },
        { name: "combat", arguments: { action: "move", actorRef: c.hero, x: 2, y: 8 } },
        { name: "combat", arguments: { action: "condition", actorRef: c.hero, deathSave: "fail" } },
        { name: "combat", arguments: { action: "condition", actorRef: c.hero, deathSave: "success" } },
      ] },
      { text: "Кровь на камнях. " },
    ], { dice: [19, 4, 20, 6, 6] });
    assert.equal(back.result.status, "committed", JSON.stringify(c.errors));
    receipts = await receiptsOf(c, back);
    assert.ok(receipts.every((r) => r.result.ok), okSummaries(receipts));
    const swings = receipts[0].result.value.attacks;
    assert.equal(swings.length, 2, "two attacks rolled separately");
    assert.equal(swings[1].crit, true, "a natural 20 is a crit");
    assert.ok(swings[1].rules.some((row) => /critical hit/.test(row)), "the doubled dice are named");
    assert.equal(receipts[0].result.check, null, "an enemy's roll has no card");
    assert.match(receipts[2].result.player, /Раунд 2 · ходит/, "the order wrapped into round 2");
    const flee = receipts[3].result.value;
    assert.deepEqual(flee.opportunityAttacks, ["Кривой Ян"], "leaving Yan's reach: he may take an opportunity attack");
    const saves = receipts[5].result.value.deathSaves;
    assert.deepEqual(saves, { success: 1, fail: 1 });
    assert.ok(receipts[5].result.value.conditions.includes("dying"));
    const end = await c.turn("Пузо бежит.", [
      { text: "Разбойники бегут. ", toolCalls: [
        { name: "combat", arguments: { action: "log", actorRef: "Пузо", what: "арбалет", result: "промах" } },
        // The live DM moved a fleeing foe past the edge of the grid three turns running: that is leaving the field.
        { name: "combat", arguments: { action: "move", actorRef: "Пузо", x: 16, y: 5 } },
        { name: "combat", arguments: { action: "end", outcome: "escape", summary: "Разбойники бежали за реку" } },
      ] },
      { text: "Тишина над бродом. " },
    ]);
    assert.equal(end.result.status, "committed", JSON.stringify(c.errors));
    receipts = await receiptsOf(c, end);
    assert.ok(receipts.every((r) => r.result.ok), okSummaries(receipts));
    assert.equal(receipts[1].result.value.withdrawn, true, "a move past the edge withdraws the fighter");
    assert.match(receipts[1].result.summary, /leaves the field/);
    const card = receipts[2].result.value.card;
    assert.equal(card.rounds, 2);
    assert.equal(card.dealt, 9);
    assert.ok(card.taken > 0);
    assert.equal(card.misses, 2, "the opening miss and Пузо's logged miss");
    assert.equal(card.crits, 1);
    assert.match(receipts[2].result.player, /Итог: 2 р\., нанесено 9/);
    play = await playOf(c);
    assert.equal(play.encounters.find((row) => row.id === encounter.id).status, "ended");
    // After the fight the block is gone from the context.
    const after = await c.turn("Перевязываю раны.", [{ text: "Тихо. " }]);
    const later = after.model.requests[0].system.map((block) => block.text).join("\n") + after.model.requests[0].messages.map((m) => m.text ?? "").join("\n");
    assert.doesNotMatch(later, /Поле боя/);
  } finally { await c.f.db.close(); }
});

test("the lair fight: a caster on a ledge, a burning cart as three-quarters cover, dim light with a torch, the rules on the attack, a pending reaction", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const start = await c.turn("Врываемся в логово.", [
      { text: "Пламя, дым, крики. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "caster", name: "Кадрик", kind: "npc", present: true, hp: 18, maxHp: 18 } },
        { name: "upsert_character", arguments: { localKey: "brute", name: "Серый", kind: "npc", present: true, hp: 20, maxHp: 20 } },
        { name: "combat", arguments: { action: "start", summary: "Логово", grid: { cols: 20, rows: 12 }, ambient: "dark", rules: true,
          placements: [{ actorRef: c.hero, x: 5, y: 8, initiative: 12 }, { actorRef: "caster", x: 5, y: 2, z: 10, initiative: 16 }, { actorRef: "brute", x: 12, y: 2, initiative: 9 }],
          hp: [{ actorRef: "caster", current: 18, max: 18, ac: 12, resist: ["fire"] }, { actorRef: "brute", current: 20, max: 20, ac: 14, vulnerable: ["fire"] }] } },
        { name: "combat", arguments: { action: "feature", op: "add", key: "cart", kind: "cover", cover: "three-quarters", label: "горящая телега", cells: [[5, 5], [6, 5]] } },
        { name: "combat", arguments: { action: "feature", op: "add", key: "fire", kind: "burning", label: "огонь у телеги", cells: [[5, 5], [6, 5]], radiusFeet: 10, dimRadiusFeet: 20 } },
        { name: "combat", arguments: { action: "feature", op: "add", key: "torch", kind: "light", label: "факел на стене", cells: [[1, 1]], radiusFeet: 20, dimRadiusFeet: 40 } },
        { name: "combat", arguments: { action: "feature", op: "add", key: "wall", kind: "wall", label: "стена барака", cells: [[10, 0], [10, 1], [10, 2], [10, 3]] } },
        { name: "combat", arguments: { action: "known", actorRef: "caster", text: "боится воды", revealed: false } },
        { name: "combat", arguments: { action: "intent", actorRef: "brute", text: "обойти с фланга", noticedByRef: c.hero } },
      ] },
      { text: "Кадрик поднимает руки. " },
    ]);
    assert.equal(start.result.status, "committed", JSON.stringify(c.errors));
    let receipts = await receiptsOf(c, start);
    assert.ok(receipts.every((r) => r.result.ok), okSummaries(receipts));
    let play = await playOf(c);
    let encounter = play.encounters.find((row) => row.status === "active");
    const hero = play.participants.find((row) => row.entity_id === c.hero && row.encounter_id === encounter.id);
    assert.equal(hero.public_position.position, "nearby");
    assert.equal(play.participants.find((row) => row.public_name === "Кадрик").public_position.position, "cover", "the cart between the hero and the caster");
    assert.equal(play.participants.find((row) => row.public_name === "Кадрик").public_resources.active, true, "initiative 16 acts first");
    const text = battlefield({ runtime: { encounters: play.encounters, participants: play.participants, configuration: play.configuration ?? null }, snapshot: { entities: (await c.state()).entities, campaign: { language: "ru" } } }).text;
    assert.match(text, /Кадрик 40 фт, далеко, укрытие на три четверти \(горящая телега\), выше на 10 фт/, "distance with elevation, cover named");
    assert.match(text, /Серый 35 фт, далеко/);
    assert.match(text, /Кадрик: на свету/, "the torch 20 ft away lights the ledge");
    assert.match(text, /Серый: вне света/);
    assert.match(text, /горящая телега \(cover, three-quarters\)/);
    // The hero fires at the caster: cover +5 AC, the fire resisted; then the caster's spell would hit — a reaction is offered.
    const shot = await c.turn("Стреляю в Кадрика из лука.", [
      { text: "Стрела уходит в дым. ", toolCalls: [
        { name: "combat", arguments: { action: "next_turn" } },
        { name: "combat", arguments: { action: "attack", actorRef: c.hero, targetRef: "Кадрик", attackBonus: 6, damage: "1d8+2", damageType: "fire", ranged: true, reason: "Огненная стрела в Кадрика" } },
        { name: "combat", arguments: { action: "reaction", targetRef: c.hero, trigger: "Кадрик бьёт Джеймса огненным лучом: 19 против КД 15", options: ["Щит", "Принять удар"] } },
      ] },
      { text: "Луч летит в тебя. " },
    ], { dice: [14, 8] });
    assert.equal(shot.result.status, "committed", JSON.stringify(c.errors));
    receipts = await receiptsOf(c, shot);
    assert.ok(receipts.every((r) => r.result.ok), okSummaries(receipts));
    const fired = receipts[1].result.value;
    assert.equal(fired.cover, "three-quarters");
    assert.equal(fired.attacks[0].ac, 17, "AC 12 + 5 for three-quarters cover");
    assert.equal(fired.attacks[0].total, 20);
    assert.equal(fired.attacks[0].hit, true);
    assert.equal(fired.attacks[0].damage, 5, "(8 + 2) halved by the fire resistance");
    assert.ok(fired.attacks[0].rules.some((row) => /three-quarters cover: \+5 AC/.test(row)));
    assert.ok(fired.attacks[0].rules.some((row) => /resists fire: damage halved/.test(row)));
    assert.match(receipts[1].result.player, /укрытие на три четверти: \+5 к КД/);
    assert.match(receipts[2].result.summary, /End the turn now and let the player choose/);
    play = await playOf(c);
    encounter = play.encounters.find((row) => row.status === "active");
    assert.deepEqual(encounter.public_field.pendingReaction.options, ["Щит", "Принять удар"]);
    assert.equal(encounter.public_field.pendingReaction.targetId, hero.id);
    const next = await c.turn("Реакция: Щит.", [
      { text: "Щит вспыхивает. ", toolCalls: [{ name: "combat", arguments: { action: "reaction", resolved: true } }] },
      { text: "Луч гаснет. " },
    ]);
    const pending = next.model.requests[0].system.map((block) => block.text).join("\n") + next.model.requests[0].messages.map((m) => m.text ?? "").join("\n");
    assert.match(pending, /Ожидается реакция/, "the DM is told a reaction is pending");
    play = await playOf(c);
    assert.equal(play.encounters.find((row) => row.status === "active").public_field.pendingReaction, null);
    // A move into the wall is refused; a move through the fire is reported.
    const blocked = await c.turn("Иду сквозь стену.", [
      { text: "Стена. ", toolCalls: [
        { name: "combat", arguments: { action: "move", actorRef: c.hero, x: 12, y: 1, free: true } },
        { name: "combat", arguments: { action: "move", actorRef: c.hero, x: 5, y: 4, free: true } },
      ] },
      { text: "Жар. " },
    ]);
    receipts = await receiptsOf(c, blocked);
    assert.equal(receipts[0].result.ok, false);
    assert.match(receipts[0].result.reason, /cannot pass стена барака/);
    assert.equal(receipts[1].result.ok, true);
    assert.deepEqual(receipts[1].result.value.crossed, ["горящая телега", "огонь у телеги"].filter((label) => receipts[1].result.value.crossed.includes(label)));
    assert.ok(receipts[1].result.value.crossed.includes("огонь у телеги"));
  } finally { await c.f.db.close(); }
});
