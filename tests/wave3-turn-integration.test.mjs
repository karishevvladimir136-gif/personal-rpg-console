import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { waveFixture } from "./wave1-integration-fixture.mjs";
import {
  consequenceWorld,
  consequenceDependencies,
} from "./wave3-turn-fixture.mjs";
import { runTurn, resumeTurn } from "../src/lib/gameplay/turn-engine.ts";

for (const resolver of [false, true])
  test(`Wave3 SQL typed action ${resolver ? "and resolver settle together" : "settles six bounded effects"} without HP/d20`, async () => {
    const f = await waveFixture();
    try {
      const w = await consequenceWorld(f, resolver),
        x = await consequenceDependencies(f, w);
      const result = await runTurn(x.input, x.deps);
      assert.equal(
        result.status,
        "committed",
        JSON.stringify({ result, errors: x.errors }),
      );
      const hero = await f.one(
        "select hp,resources,conditions from public.rpg_entities where id=$1",
        [w.hero],
      );
      assert.equal(hero.hp, null);
      assert.equal(hero.resources.focus, 2);
      assert.deepEqual(result.checks, []);
      if (resolver) {
        assert.deepEqual(
          (
            await f.one(
              "select conditions from public.rpg_entities where id=$1",
              [w.npc],
            )
          ).conditions,
          ["cold"],
        );
        assert.equal(x.calls.resolver, 1);
      } else {
        assert.deepEqual(hero.conditions, ["wet"]);
        assert.equal(
          (
            await f.one("select quantity from public.rpg_items where id=$1", [
              w.item,
            ])
          ).quantity,
          2,
        );
        assert.equal(
          (
            await f.one("select status from public.rpg_quests where id=$1", [
              w.quest,
            ])
          ).status,
          "complete",
        );
        assert.equal(
          (await f.read(w.cid)).world.actors.find((a) => a.id === w.npc)
            .locationId,
          w.destination,
        );
      }
      await runTurn(x.input, x.deps);
      assert.equal(x.calls.action, 1);
      assert.equal(
        (
          await f.one("select resources from public.rpg_entities where id=$1", [
            w.hero,
          ])
        ).resources.focus,
        2,
      );
      assert.ok(!JSON.stringify(result).includes("PRIVATE_WAVE1_EVENT"));
    } finally {
      await f.db.close();
    }
  });

for (const activate of [false, true])
  test(`Wave3 typed recovery after ${activate ? "load/branch/epoch" : "manual save/head"} preserves input, costs and event provenance`, async () => {
    const f = await waveFixture();
    try {
      const w = await consequenceWorld(f, true),
        x = await consequenceDependencies(f, w, { failNarration: true });
      const pending = await runTurn(x.input, x.deps);
      assert.equal(
        pending.failure,
        "provider",
        JSON.stringify({ pending, errors: x.errors }),
      );
      const original = (
        await f.one(
          "select settlement from rpg_private.world_stages where campaign_id=$1",
          [w.cid],
        )
      ).settlement;
      const saved = await f.saves(
        w.cid,
        "create",
        await f.command(w.cid, { kind: "manual", name: "Typed pending" }),
      );
      if (activate)
        await f.saves(
          w.cid,
          "load",
          await f.command(w.cid, {
            saveId: saved.snapshot.saves.find((s) => s.name === "Typed pending")
              .id,
            label: "Typed child",
            recovery: false,
          }),
        );
      const y = await consequenceDependencies(f, w);
      const command = {
        commandId: randomUUID(),
        campaignId: w.cid,
        operationId: x.input.operationId,
        timeline: await f.fence(w.cid),
        action: "retry",
        checkId: null,
      };
      const completed = await resumeTurn(command, y.deps);
      assert.equal(
        completed.status,
        "committed",
        JSON.stringify({ completed, errors: y.errors }),
      );
      assert.equal(y.calls.action, 0);
      assert.equal(y.calls.resolver, 0);
      assert.deepEqual(completed.checks, []);
      assert.equal(
        (
          await f.one("select resources from public.rpg_entities where id=$1", [
            w.hero,
          ])
        ).resources.focus,
        2,
      );
      assert.deepEqual(
        (
          await f.one(
            "select conditions from public.rpg_entities where id=$1",
            [w.npc],
          )
        ).conditions,
        ["cold"],
      );
      assert.deepEqual(
        (
          await f.one(
            "select settlement from rpg_private.world_stages where campaign_id=$1",
            [w.cid],
          )
        ).settlement,
        original,
      );
      const events = await f.query(
        "select event from rpg_private.world_events where campaign_id=$1",
        [w.cid],
      );
      assert.equal(events.length, 3);
      assert.ok(
        events.every(
          (r) => r.event.originTimelineId === original.timeline.timelineId,
        ),
      );
      assert.equal((await resumeTurn(command, y.deps)).status, "committed");
      assert.equal(
        (
          await f.one("select resources from public.rpg_entities where id=$1", [
            w.hero,
          ])
        ).resources.focus,
        2,
      );
    } finally {
      await f.db.close();
    }
  });
