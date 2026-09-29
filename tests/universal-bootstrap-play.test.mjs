import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { setup, examples, usage } from "./universal-bootstrap-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { runTurn } from "../src/lib/gameplay/turn-engine.ts";
import {
  worldLogicTurnPreparer,
  worldTurnPreparer,
} from "../src/lib/production/turn-world.ts";
import { worldLogicContext } from "../src/lib/rulesets/world-logic.ts";
import { parseWorldState } from "../src/lib/world/validation.ts";
for (const [kind, example] of Object.entries(examples))
  test(`${kind} first supported actions use World Logic + public Mega DM narration + authoritative settlement, never dm.plan`, async () => {
    const f = await setup(example);
    try {
      await f.create();
      await f.startOpening();
      const runtime = async (a) => {
        try {
          return {
            data: await f.runtime(
              a.p_campaign_id,
              a.p_action,
              a.p_payload,
              a.p_timeline,
            ),
          };
        } catch (e) {
          return { error: { code: e.code, message: e.message } };
        }
      };
      const rpc = async (a) => {
        try {
          return {
            data: (
              await f.one(
                "select public.rpg_world($1,$2,$3,$4::jsonb,$5::jsonb) result",
                [
                  a.p_owner_id,
                  a.p_campaign_id,
                  a.p_action,
                  JSON.stringify(a.p_payload),
                  JSON.stringify(a.p_timeline),
                ],
              )
            ).result,
          };
        } catch (e) {
          return { error: { code: e.code, message: e.message } };
        }
      };
      const store = createRpcTurnStore(
        f.owner,
        runtime,
        "gpt-6-sol",
        await f.fence(f.cid),
      );
      let actionCalls = 0,
        narrations = 0;
      const options = {
        action: async (i) => {
          actionCalls++;
          const c = worldLogicContext(i);
          assert.equal(c.actors[0].name, example.name);
          assert.equal(c.actors[0].description, example.description);
          assert.deepEqual(c.actors[0].limitations, example.limits);
          assert.match(
            c.adventure.premise,
            new RegExp(kind === "fantasy" ? "paid work" : "supply shuttle"),
          );
          assert.ok(c.circumstances.some((x) => x.text.includes(example.npc)));
          assert.equal(JSON.stringify(c).includes("dmPrivate"), false);
          return {
            usage,
            output: {
              schemaVersion: 1,
              actorId: f.hero,
              input: i.input.input,
              action: i.input.input === "I look around" ? "observe" : "speak",
              outcome: "completed",
              uncertainty: "resolved",
              capabilityRefs: [],
              circumstanceRefs: ["public-state"],
              evidenceIndexes: [],
              publicText: example.situation,
              elapsedMinutes: 0,
              destinationId: null,
            },
          };
        },
      };
      const provider = {
        plan: () => assert.fail("Legacy dm.plan is forbidden"),
        feedback: () => assert.fail("No feedback"),
        narrate: async (source) => {
          narrations++;
          assert.deepEqual(source.privateState, {});
          assert.deepEqual(source.runtime.configuration, null);
          assert.ok(
            source.worldLogicPresence.presentEntityIds.includes(f.hero),
          );
          return {
            usage,
            output: {
              narration: example.situation,
              visualDescription: "",
              clarification: null,
            },
          };
        },
      };
      for (const text of ["I look around", "I ask about the public notice"]) {
        const play = await store.readPlay(f.cid);
        const input = {
          operationId: randomUUID(),
          campaignId: f.cid,
          timeline: play.timeline,
          expectedRevision: play.revision,
          mode: "game",
          input: text,
          companionId: null,
          listenerIds: [],
          mechanic: null,
        };
        const deps = {
          store,
          provider,
          prepareWorldLogic: worldLogicTurnPreparer(rpc, options),
          prepareWorld: worldTurnPreparer(rpc, options),
        };
        const result = await runTurn(input, deps);
        assert.equal(result.status, "committed", JSON.stringify(result));
        assert.equal(result.failure, null);
        assert.deepEqual(result.checks, []);
        assert.deepEqual(await runTurn(input, deps), result);
      }
      assert.equal(actionCalls, 2);
      assert.equal(narrations, 2);
      assert.equal((await f.snapshot()).quests.length, 0);
    } finally {
      await f.db.close();
    }
  });

test("No-HP character/opening/presence exact save/load and fork, historical manifests preserved", async () => {
  const f = await setup(examples.orbital);
  try {
    await f.create();
    await f.startOpening();
    const before = await f.snapshot();
    const save = await f.saves(
      f.cid,
      "create",
      await f.command(f.cid, {
        kind: "manual",
        name: "Synthetic bootstrap checkpoint",
      }),
    );
    const point = save.snapshot.saves.find(
      (s) => s.name === "Synthetic bootstrap checkpoint",
    );
    assert.ok(point);
    const result = await f.saves(
      f.cid,
      "load",
      await f.command(f.cid, {
        saveId: point.id,
        label: "Synthetic restored opening",
        recovery: false,
      }),
    );
    assert.ok(result);
    const after = await f.snapshot();
    for (const k of ["entities", "items", "storages", "locations", "scenes"])
      assert.deepEqual(after[k], before[k]);
    const foundation = (
      await f.one(
        "select world from rpg_private.world_foundations where campaign_id=$1",
        [f.cid],
      )
    ).world;
    parseWorldState(foundation, f.cid);
    assert.deepEqual(foundation.actors[0].limitations, examples.orbital.limits);
    const fork = await f.saves(
      f.cid,
      "load",
      await f.command(f.cid, {
        saveId: point.id,
        label: "Synthetic sibling",
        recovery: false,
      }),
    );
    assert.notEqual(fork.timelineId, result.timelineId);
    assert.deepEqual((await f.snapshot()).entities, before.entities);
    const manifests = await f.query(
      "select id from rpg_private.timeline_manifests where campaign_id=$1",
      [f.cid],
    );
    assert.ok(manifests.length > 0);
    for (const m of manifests)
      await f.one("select rpg_private.lab_validate_manifest($1,$2) result", [
        f.cid,
        m.id,
      ]);
  } finally {
    await f.db.close();
  }
});

test("Populated migration30 upgrade to31 preserves entities/items/saves/manifest hashes and Basic starter", async () => {
  const f = await setup(examples.fantasy, "en", 30);
  try {
    const { newHeroAttempt } = await import("../src/lib/adventures/client.ts");
    const hero = await f.adventures.performWorld(
      newHeroAttempt(
        { worlds: [f.world], packs: [] },
        f.world.id,
        "Old Basic",
        "Ari",
        "en",
      ),
    );
    f.cid = hero.campaignId;
    await f.prepare();
    await f.adventures.perform(f.start);
    await f.saves(
      f.cid,
      "create",
      await f.command(f.cid, { kind: "manual", name: "Before 31" }),
    );
    const before = await f.snapshot(),
      manifests = await f.query(
        "select * from rpg_private.timeline_manifests where campaign_id=$1 order by id",
        [f.cid],
      );
    await f.db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202609300031_universal_campaign_bootstrap.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    assert.deepEqual(await f.snapshot(), before);
    assert.deepEqual(
      await f.query(
        "select * from rpg_private.timeline_manifests where campaign_id=$1 order by id",
        [f.cid],
      ),
      manifests,
    );
  } finally {
    await f.db.close();
  }
});
