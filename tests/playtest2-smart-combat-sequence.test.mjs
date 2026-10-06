import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { setup, examples, usage } from "./universal-bootstrap-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { runTurn, resumeTurn } from "../src/lib/gameplay/turn-engine.ts";
import { worldLogicTurnPreparer, worldTurnPreparer } from "../src/lib/production/turn-world.ts";

const example = {
  ...examples.fantasy,
  description: "I carry a longsword. I know navigation and careful observation. I cannot cast spells.",
  item: "longsword",
  npc: "The innkeeper",
  location: "Inn doorway",
  situation: "The innkeeper stands nearby in the inn doorway.",
  narration: "The innkeeper stands nearby in the inn doorway.",
};

const turns = [
  { text: "I kiss him", method: "improvise", npc: "defend" },
  { text: "I strike him with my sword", method: "attack", npc: "attack" },
  { text: "I kick him toward the wall", method: "improvise", npc: "attempt" },
  { text: "I jump onto the table to get advantage and slash him", method: "attack", npc: "move" },
  { text: "I feint and stab", method: "attack", npc: "end-turn" },
  { text: "I try to knock the sword from his hand", method: "improvise", npc: "attack" },
  { text: "I throw a mug toward his face", method: "improvise", npc: "defend" },
  { text: "I tackle him", method: "improvise", npc: "attempt" },
  { text: "I elbow him", method: "attack", npc: "move" },
  { text: "I slam his head toward the table", method: "improvise", npc: "end-turn" },
];

test("ten consecutive natural combat exchanges preserve one atomic turn each", async () => {
  const f = await setup(example, "en", 36);
  try {
    await f.create();
    await f.startOpening();
    const readiness = async (action, payload = {}) => (await f.one(
      "select public.rpg_combat_readiness($1,$2,$3,$4::jsonb) result",
      [f.owner, f.cid, action, JSON.stringify(payload)],
    )).result;
    const proposal = await readiness("inspect");
    await readiness("confirm", {
      requestId: randomUUID(), proposal,
      player: {
        hp: proposal.hero.hp === null ? 10 : null,
        attack: proposal.hero.attack === null ? 2 : null,
        defense: proposal.hero.defense === null ? 10 : null,
        skill: proposal.hero.skill === null ? 1 : null,
      },
      weaponIndex: 1, weaponDamage: 2,
    });
    const npc = (await f.snapshot()).entities.find((entity) => entity.kind === "npc");
    const sword = (await f.snapshot()).items.find((item) => item.name === "longsword");
    assert.ok(npc && sword);
    // Disposable fixture durability: neither combatant can be removed before
    // all ten independent player decisions have been exercised.
    await f.one("update public.rpg_entities set hp=30,max_hp=30,revision=revision+1 where id in ($1,$2)",
      [f.hero, npc.id]);
    const otherCampaign = await f.campaign("Unrelated disposable campaign");
    const otherBefore = await f.one("select to_jsonb(c) row from public.rpg_campaigns c where id=$1", [otherCampaign]);
    const unrelatedRows = () => f.one(`select
      (select count(*)::integer from public.rpg_entities where campaign_id=$1) entities,
      (select count(*)::integer from public.rpg_items where campaign_id=$1) items,
      (select count(*)::integer from public.rpg_scenes where campaign_id=$1) scenes,
      (select count(*)::integer from public.rpg_encounters where campaign_id=$1) encounters,
      (select count(*)::integer from rpg_private.turns where campaign_id=$1) turns,
      (select count(*)::integer from rpg_private.memory_public_sources where campaign_id=$1) memory`,
      [otherCampaign]);
    const otherRowsBefore = await unrelatedRows();
    const runtime = async (args) => {
      try { return { data: await f.runtime(args.p_campaign_id, args.p_action, args.p_payload, args.p_timeline) }; }
      catch (error) { return { error: { code: error.code, message: error.message } }; }
    };
    const world = async (args) => {
      try { return { data: (await f.one(
        "select public.rpg_world($1,$2,$3,$4::jsonb,$5::jsonb) result",
        [args.p_owner_id, args.p_campaign_id, args.p_action,
          JSON.stringify(args.p_payload), JSON.stringify(args.p_timeline)],
      )).result }; }
      catch (error) { return { error: { code: error.code, message: error.message } }; }
    };
    const store = createRpcTurnStore(f.owner, runtime, "gpt-6-astra", await f.fence(f.cid));
    let playerResolverCalls = 0, npcResolverCalls = 0, narratorCalls = 0;
    const deps = {
      store,
      provider: {
        plan: () => assert.fail("legacy plan is not the World Logic combat path"),
        feedback: () => assert.fail("feedback is not combat"),
        narrate: async (_source, _input, resolution) => {
          narratorCalls++;
          assert.ok(resolution.outcomes.some((row) => row.kind === "encounter.action"));
          return { usage, output: {
            narration: `Validated combat exchange ${narratorCalls}.`,
            visualDescription: "", clarification: null,
          } };
        },
      },
      prepareWorldLogic: worldLogicTurnPreparer(world, {
        action: async (input) => {
          const scripted = turns[playerResolverCalls++];
          assert.equal(input.input.input, scripted.text);
          const equippedSword = scripted.method === "attack" &&
            /sword|slash|stab/i.test(scripted.text);
          return { usage, output: {
            schemaVersion: 4, input: input.input.input,
            actorId: f.hero, targetId: npc.id,
            method: scripted.method,
            itemId: equippedSword ? sword.id : null,
            equipmentName: equippedSword ? sword.name : null,
          } };
        },
      }),
      prepareWorld: worldTurnPreparer(world),
      prepareCombatIntent: async (decision) => {
        const scripted = turns[npcResolverCalls++];
        assert.deepEqual(decision.actorsToDecide, [npc.id]);
        return { usage, output: [{
          actorId: npc.id,
          action: scripted.npc,
          targetId: ["attack", "attempt"].includes(scripted.npc) ? f.hero : null,
          itemId: null,
          position: scripted.npc === "move" ? "cover" : null,
          description: `The innkeeper chooses ${scripted.npc}.`,
        }] };
      },
    };
    const checkIds = new Set();
    let priorHeroHp = 30, priorNpcHp = 30;
    for (const [index, scripted] of turns.entries()) {
      const play = await store.readPlay(f.cid);
      const input = {
        operationId: randomUUID(), campaignId: f.cid, timeline: play.timeline,
        expectedRevision: play.revision, mode: "game", input: scripted.text,
        companionId: null, listenerIds: [], mechanic: null,
      };
      const pending = await runTurn(input, deps);
      assert.equal(pending.status, "awaiting_confirmation", `turn ${index + 1}`);
      assert.equal(pending.checks.length, 1);
      if (index === 3) {
        const same = await runTurn(input, deps);
        assert.deepEqual(same.checks, pending.checks);
        assert.equal(npcResolverCalls, index);
      }
      const committed = await resumeTurn({
        commandId: randomUUID(), campaignId: f.cid,
        operationId: input.operationId, timeline: input.timeline,
        action: "continue", checkId: null,
      }, deps);
      assert.equal(committed.status, "committed", `turn ${index + 1}`);
      const saved = (await f.one(
        "select checkpoint from rpg_private.turns where id=$1", [input.operationId],
      )).checkpoint;
      assert.equal(saved.combatExchange.npcIntents[0].action, scripted.npc);
      assert.equal(saved.checks.length, 1);
      assert.equal(saved.checks[0].advantage, "normal");
      assert.equal(saved.combatExchange.npcChecks.length,
        ["attack", "attempt"].includes(scripted.npc) ? 1 : 0);
      for (const check of [...saved.checks, ...saved.combatExchange.npcChecks]) {
        assert.ok(!checkIds.has(check.id), "one distinct deterministic roll per checked action");
        checkIds.add(check.id);
      }
      const after = await store.readPlay(f.cid);
      assert.equal(after.encounters.find((row) => row.status === "active").round, index + 2);
      const hero = after.participants.find((row) => row.entity_id === f.hero);
      const enemy = after.participants.find((row) => row.entity_id === npc.id);
      assert.equal(hero.public_resources.active, true);
      assert.equal(hero.public_resources.action, 1);
      assert.equal(hero.public_resources.move, 1);
      assert.equal(hero.public_resources.reaction, 1);
      assert.equal(enemy.public_resources.active, false);
      assert.equal(enemy.public_resources.action,
        ["move", "end-turn"].includes(scripted.npc) ? 1 : 0);
      assert.equal(enemy.public_resources.move, scripted.npc === "move" ? 0 : 1);
      const entities = (await f.snapshot()).entities;
      const heroHp = entities.find((row) => row.id === f.hero).hp;
      const npcHp = entities.find((row) => row.id === npc.id).hp;
      assert.ok(heroHp <= priorHeroHp && npcHp <= priorNpcHp);
      if (scripted.method === "improvise") assert.equal(npcHp, priorNpcHp,
        "an improvised contact never grants damage, displacement or a condition");
      priorHeroHp = heroHp;
      priorNpcHp = npcHp;
      const duplicate = await runTurn(input, deps);
      assert.equal(duplicate.status, "committed");
      assert.equal(npcResolverCalls, index + 1);
      assert.equal((await f.snapshot()).entities.find((row) => row.id === npc.id).hp, npcHp);
    }
    assert.equal(playerResolverCalls, 10);
    assert.equal(npcResolverCalls, 10);
    assert.equal(narratorCalls, 10);
    assert.deepEqual(new Set(turns.map((row) => row.npc)),
      new Set(["defend", "attack", "attempt", "move", "end-turn"]));
    assert.equal((await f.one("select count(*)::integer n from public.rpg_scenes where campaign_id=$1 and role='narration'", [f.cid])).n, 11);
    const memory = await f.memory(f.cid, "context", { actorIds: [], includePrivate: false });
    assert.ok(memory && typeof memory === "object");
    const indexed = await f.one(
      "select count(*)::integer n from rpg_private.memory_public_sources where campaign_id=$1 and text like 'Validated combat exchange %'",
      [f.cid],
    );
    assert.equal(indexed.n, 10, "each committed narration remains available to public Memory");
    assert.deepEqual(await f.one("select to_jsonb(c) row from public.rpg_campaigns c where id=$1", [otherCampaign]), otherBefore);
    assert.deepEqual(await unrelatedRows(), otherRowsBefore);
  } finally {
    await f.db.close();
  }
});
