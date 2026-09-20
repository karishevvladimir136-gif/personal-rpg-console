import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Optional read-only integration inspection before Lead commits its shared files.
const root = process.env.WAVE3_QA_INTEGRATION_ROOT
  ? pathToFileURL(path.resolve(process.env.WAVE3_QA_INTEGRATION_ROOT) + path.sep)
  : new URL("../", import.meta.url);
const { waveFixture } = await import(new URL("tests/wave1-integration-fixture.mjs", root));
const { consequenceWorld, consequenceDependencies } = await import(new URL("tests/wave3-turn-fixture.mjs", root));
const { runTurn, resumeTurn } = await import(new URL("src/lib/gameplay/turn-engine.ts", root));

for (const resolver of [false, true]) {
  for (const activate of [false, true]) {
    test(`QA SQL: typed ${resolver ? "action plus resolver" : "six-effect action"} retry after ${activate ? "save fork" : "save head"} keeps history and spends once`, async () => {
      const f = await waveFixture();
      try {
        const w = await consequenceWorld(f, resolver);
        const first = await consequenceDependencies(f, w, { failNarration: true });
        const failed = await runTurn(first.input, first.deps);
        assert.equal(failed.status, "failed", JSON.stringify({ failed, errors: first.errors }));
        assert.equal(failed.failure, "provider");
        const original = (
          await f.one("select settlement from rpg_private.world_stages where campaign_id=$1 and id=$2", [w.cid, first.input.operationId])
        ).settlement;
        assert.equal((await f.one("select resources from public.rpg_entities where id=$1", [w.hero])).resources.focus, 3);
        assert.deepEqual((await f.one("select conditions from public.rpg_entities where id=$1", [w.npc])).conditions, []);
        assert.equal((await f.one("select count(*)::integer n from rpg_private.world_events where campaign_id=$1", [w.cid])).n, 0);
        const saved = await f.saves(w.cid, "create", await f.command(w.cid, { kind: "manual", name: "QA typed pending" }));
        if (activate) {
          await f.saves(w.cid, "load", await f.command(w.cid, {
            saveId: saved.saveId,
            label: "QA typed continuation child",
            recovery: false,
          }));
        }
        const retry = await consequenceDependencies(f, w);
        const command = {
          commandId: randomUUID(),
          campaignId: w.cid,
          operationId: first.input.operationId,
          timeline: await f.fence(w.cid),
          action: "retry",
          checkId: null,
        };
        const completed = await resumeTurn(command, retry.deps);
        assert.equal(completed.status, "committed", JSON.stringify({ completed, errors: retry.errors }));
        assert.equal(retry.calls.action, 0);
        assert.equal(retry.calls.resolver, 0);
        assert.deepEqual(completed.checks, []);
        const hero = await f.one("select hp,resources,conditions from public.rpg_entities where id=$1", [w.hero]);
        assert.equal(hero.hp, null);
        assert.equal(hero.resources.focus, 2);
        if (resolver) {
          assert.deepEqual((await f.one("select conditions from public.rpg_entities where id=$1", [w.npc])).conditions, ["cold"]);
        } else {
          assert.deepEqual(hero.conditions, ["wet"]);
          assert.equal((await f.one("select quantity from public.rpg_items where id=$1", [w.item])).quantity, 2);
          assert.equal((await f.one("select status from public.rpg_quests where id=$1", [w.quest])).status, "complete");
          assert.equal((await f.read(w.cid)).world.actors.find((actor) => actor.id === w.npc).locationId, w.destination);
        }
        assert.deepEqual(
          (await f.one("select settlement from rpg_private.world_stages where campaign_id=$1 and id=$2", [w.cid, first.input.operationId])).settlement,
          original,
        );
        const events = await f.query("select event from rpg_private.world_events where campaign_id=$1", [w.cid]);
        assert.deepEqual(events.map((row) => row.event.id).sort(), original.events.map((event) => event.id).sort());
        assert.ok(events.every((row) => row.event.originTimelineId === original.timeline.timelineId));
        assert.doesNotMatch(JSON.stringify(completed), /PRIVATE_WAVE1_EVENT|consequenceAuthority|consequenceFacts/);
        assert.equal((await resumeTurn(command, retry.deps)).status, "committed");
        assert.equal((await f.one("select resources from public.rpg_entities where id=$1", [w.hero])).resources.focus, 2);
        assert.equal((await f.one("select count(*)::integer n from rpg_private.world_events where campaign_id=$1", [w.cid])).n, events.length);
        if (activate)
          await assert.rejects(() => resumeTurn({ ...command, timeline: first.input.timeline }, retry.deps), { code: "conflict" });
      } finally {
        await f.db.close();
      }
    });
  }
}

test("QA SQL: a corrected resource record invalidates typed pending authority without replaying models", async () => {
  const f = await waveFixture();
  try {
    const w = await consequenceWorld(f, true);
    const first = await consequenceDependencies(f, w, { failNarration: true });
    assert.equal((await runTurn(first.input, first.deps)).status, "failed");
    await f.one("update public.rpg_entities set resources=jsonb_set(resources,'{focus}','9'),revision=revision+1 where id=$1", [w.hero]);
    const retry = await consequenceDependencies(f, w);
    const result = await resumeTurn({
      commandId: randomUUID(),
      campaignId: w.cid,
      operationId: first.input.operationId,
      timeline: await f.fence(w.cid),
      action: "retry",
      checkId: null,
    }, retry.deps);
    assert.equal(result.status, "failed", JSON.stringify({ result, errors: retry.errors }));
    assert.equal(retry.calls.action, 0);
    assert.equal(retry.calls.resolver, 0);
    assert.equal(retry.calls.narration, 0);
    assert.equal((await f.one("select resources from public.rpg_entities where id=$1", [w.hero])).resources.focus, 9);
    assert.deepEqual((await f.one("select conditions from public.rpg_entities where id=$1", [w.npc])).conditions, []);
    assert.equal((await f.one("select count(*)::integer n from rpg_private.world_events where campaign_id=$1", [w.cid])).n, 0);
  } finally {
    await f.db.close();
  }
});
