import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { setup, examples } from "./universal-bootstrap-fixture.mjs";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { preflightMemory } from "../src/lib/memory/lifecycle.ts";
import { withMemory } from "../src/lib/memory/context.ts";
import { buildContext } from "../src/lib/gameplay/dm-context.ts";

test("World Logic Action 0 encounter passes Memory preflight and reaches durable begin without a provider", async () => {
  const f = await setup({ ...examples.fantasy, npc: "The innkeeper" }, "en", 36);
  try {
    await f.create();
    await f.startOpening();
    const npc = (await f.snapshot()).entities.find((row) => row.kind === "npc");
    assert.ok(npc);
    const current = await f.runtime(f.cid, "play");
    await f.runtime(f.cid, "configure", {
      requestId: randomUUID(), campaignId: f.cid,
      expectedRevision: current.revision,
      configuration: {
        profile: "console-basic-v1", controlledEntityIds: [f.hero],
        presentEntityIds: [f.hero, npc.id], nearbyStorageIds: [],
        safeLocationIds: [], itemRules: [],
      },
    });
    const settings = await f.one(
      "select revision,values from public.rpg_settings where campaign_id=$1", [f.cid],
    );
    assert.equal(settings.values.rulesSystem.id, "world-logic-v1");
    const pinned = await f.one(
      "select values from public.rpg_settings_revisions where campaign_id=$1 and revision=3", [f.cid],
    );
    assert.equal(pinned.values.rulesSystem.id, "world-logic-v1");
    assert.equal(settings.revision, 3);
    const encounterId = randomUUID();
    await f.one(
      "insert into public.rpg_encounters(id,campaign_id,status,round,settings_revision,public_summary) values($1,$2,'active',1,3,'The innkeeper is engaged.')",
      [encounterId, f.cid],
    );
    for (const [order, actor, name] of [[0, f.hero, "Hero"], [1, npc.id, "The innkeeper"]]) {
      await f.one(
        "insert into public.rpg_encounter_participants(id,campaign_id,encounter_id,entity_id,public_name,turn_order,public_position,public_resources) values($1,$2,$3,$4,$5,$6,'{\"position\":\"nearby\"}'::jsonb,$7::jsonb)",
        [randomUUID(), f.cid, encounterId, actor, name, order, JSON.stringify({
          action: 0, move: 1, reaction: 1, active: order === 0,
          defending: false, withdrawn: false, originalMaxHp: 10,
        })],
      );
    }
    const timeline = await f.fence(f.cid);
    const memory = createRpcMemoryStore(f.owner, async (args) => ({
      data: await f.memory(args.p_campaign_id, args.p_action, args.p_payload, args.p_timeline),
    }), timeline);
    const turns = createRpcTurnStore(f.owner, async (args) => ({
      data: await f.runtime(args.p_campaign_id, args.p_action, args.p_payload, args.p_timeline),
    }), "gpt-6-astra", timeline);
    const play = await turns.readPlay(f.cid);
    const input = {
      operationId: randomUUID(), campaignId: f.cid, timeline,
      expectedRevision: play.revision, mode: "game",
      input: "i smack his head on nearest table",
      companionId: null, listenerIds: [], mechanic: null,
    };
    assert.equal(play.configuration.profile, "console-basic-v1");
    assert.equal(play.participants.find((row) => row.entity_id === f.hero).public_resources.action, 0);
    const selected = await withMemory(await memory.source(f.cid, "game"), input, memory);
    assert.equal(selected.snapshot.settings.revision, 3);
    assert.ok(buildContext(selected, input, "plan", { model: "gpt-6-astra" }).input);
    let providerCalls = 0;
    await preflightMemory(input, memory, {
      summarize: async () => { providerCalls++; throw Error("provider must not run"); },
    }, "gpt-6-astra");
    assert.equal(providerCalls, 0);
    const pending = await turns.begin(input);
    assert.equal(pending.status, "pending");
    assert.equal((await f.one(
      "select count(*)::integer n from rpg_private.turns where id=$1 and campaign_id=$2",
      [input.operationId, f.cid],
    )).n, 1);
  } finally {
    await f.db.close();
  }
});

test("Round 3 sword action budgets long Memory context before a durable turn begins", async () => {
  const f = await setup({ ...examples.fantasy, npc: "The innkeeper" }, "en", 36);
  try {
    await f.create();
    await f.startOpening();
    const npc = (await f.snapshot()).entities.find((row) => row.kind === "npc");
    assert.ok(npc);
    const current = await f.runtime(f.cid, "play");
    await f.runtime(f.cid, "configure", {
      requestId: randomUUID(), campaignId: f.cid,
      expectedRevision: current.revision,
      configuration: {
        profile: "console-basic-v1", controlledEntityIds: [f.hero],
        presentEntityIds: [f.hero, npc.id], nearbyStorageIds: [],
        safeLocationIds: [], itemRules: [],
      },
    });
    const encounterId = randomUUID();
    await f.one(
      "insert into public.rpg_encounters(id,campaign_id,status,round,settings_revision,public_summary) values($1,$2,'active',3,3,'The innkeeper is engaged.')",
      [encounterId, f.cid],
    );
    for (const [order, actor, name] of [[0, f.hero, "Hero"], [1, npc.id, "The innkeeper"]]) {
      await f.one(
        "insert into public.rpg_encounter_participants(id,campaign_id,encounter_id,entity_id,public_name,turn_order,public_position,public_resources) values($1,$2,$3,$4,$5,$6,'{\"position\":\"nearby\"}'::jsonb,$7::jsonb)",
        [randomUUID(), f.cid, encounterId, actor, name, order, JSON.stringify({
          action: order === 0 ? 1 : 0, move: 1, reaction: 1,
          active: order === 0, defending: order !== 0,
          withdrawn: false, originalMaxHp: 10,
        })],
      );
    }
    const timeline = await f.fence(f.cid);
    const memory = createRpcMemoryStore(f.owner, async (args) => ({
      data: await f.memory(args.p_campaign_id, args.p_action, args.p_payload, args.p_timeline),
    }), timeline);
    const turns = createRpcTurnStore(f.owner, async (args) => ({
      data: await f.runtime(args.p_campaign_id, args.p_action, args.p_payload, args.p_timeline),
    }), "gpt-6-astra", timeline);
    const source = await memory.source(f.cid, "game");
    const sessionId = source.snapshot.publicState.current_session_id;
    const prior = "The innkeeper speaks across the crowded table. ".repeat(32);
    for (let index = 0; index < 25; index++) {
      const sceneId = randomUUID();
      source.snapshot.scenes.push({
        id: sceneId, campaign_id: f.cid, revision: 1, session_id: sessionId,
        role: "dm", body: `${index}: ${prior}`,
      });
      source.snapshot.publicState.current_scene_id = sceneId;
      source.runtime.turns.push({
        id: randomUUID(), campaign_id: f.cid, session_id: sessionId,
        timeline, status: "committed", mode: "game", input: `Prior combat ${index}`,
        narration: `${index}: ${prior}`, listenerIds: [],
      });
    }
    const store = {
      ...memory,
      source: async () => source,
      context: async (cid, actors, includePrivate) => ({
        ...await memory.context(cid, actors, includePrivate),
        uncovered: [], overflow: false,
      }),
    };
    const input = {
      operationId: randomUUID(), campaignId: f.cid, timeline,
      expectedRevision: source.runtime.revision, mode: "game",
      input: "i jump on top of nearest table to get advantage and strike innkeeper with my sword",
      companionId: null, listenerIds: [], mechanic: null,
    };
    const selected = await withMemory(source, input, store, false, {
      model: "gpt-6-astra", stage: "narrate",
    });
    const context = buildContext(selected, input, "narrate", { model: "gpt-6-astra" });
    assert.ok(context.estimatedTokens <= 64000);
    assert.equal(JSON.parse(context.input).mandatory.current.encounters[0].round, 3);
    assert.equal(JSON.parse(context.input).mandatory.input, input.input);
    let providerCalls = 0;
    await preflightMemory(input, store, {
      summarize: async () => { providerCalls++; throw Error("provider must not run"); },
    }, "gpt-6-astra");
    assert.equal(providerCalls, 0);
    const pending = await turns.begin(input);
    assert.equal(pending.status, "pending");
    assert.equal((await f.one(
      "select count(*)::integer n from rpg_private.turns where id=$1 and campaign_id=$2",
      [input.operationId, f.cid],
    )).n, 1);
  } finally {
    await f.db.close();
  }
});
