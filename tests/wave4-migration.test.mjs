import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { moduleFromSource, source } from "./wave4-qa-fixture.mjs";
const { readLoopContext } = await moduleFromSource("foundation-loop/state.ts");
const { loopCommand } = await moduleFromSource("foundation-loop/authority.ts");
const { planCommerceConfiguration } = await moduleFromSource(
  "foundation-loop/configuration.ts",
);

for (const prefix of [9, 10, 11, 12]) {
  test(`QA migration: upgrade 1–${prefix} to Wave 4 restores pre-column saves without rewriting the immutable vault`, async () => {
    const f = await fixture(prefix);
    try {
      const w = await world(f, `Synthetic migration prefix ${prefix}`);
      if (prefix >= 10)
        await f.one(
          "insert into rpg_private.world_foundations(campaign_id) values($1)",
          [w.cid],
        );
      const before = await f.saves(w.cid, "campaign");
      const save = await f.saves(
        w.cid,
        "create",
        await f.command(w.cid, {
          kind: "manual",
          name: "Before Wave 4 column",
        }),
      );
      const oldVersions = await f.query(
        "select id,digest,payload from rpg_private.timeline_versions where campaign_id=$1 order by id",
        [w.cid],
      );
      const oldFoundation = oldVersions.filter(
        (v) =>
          v.payload.campaign_id === w.cid &&
          Object.hasOwn(v.payload, "bindings"),
      );
      for (const row of oldFoundation)
        assert.equal(Object.hasOwn(row.payload, "loop_state"), false);
      for (const file of f.files.slice(prefix)) {
        const migration = file.includes("0013_")
          ? (process.env.WAVE4_QA_MIGRATION ??
            source(`supabase/migrations/${file}`))
          : new URL(file, f.folder);
        await f.db.exec(await readFile(migration, "utf8"));
      }
      const call = async (action, payload = {}, timeline) =>
        (
          await f.one(
            "select public.rpg_world($1,$2,$3,$4::jsonb,$5::jsonb) result",
            [
              f.owner,
              w.cid,
              action,
              JSON.stringify(payload),
              JSON.stringify(timeline ?? (await f.fence(w.cid))),
            ],
          )
        ).result;
      const upgraded = readLoopContext(await call("loop_read"));
      assert.equal(upgraded.state.version, 0);
      assert.equal(upgraded.state.progression, "off");
      assert.deepEqual(upgraded.state.progress, []);
      assert.deepEqual(upgraded.state.pending, []);
      assert.deepEqual(upgraded.state.rewards, []);
      assert.equal(
        upgraded.events.filter((e) => e.kind === "reward.granted").length,
        0,
      );
      const command = loopCommand(upgraded, randomUUID());
      const input = {
        currencies: [
          {
            id: "credits",
            version: 1,
            label: "Credits",
            resourceKey: "credits",
          },
        ],
        itemPolicies: [],
        merchants: [],
      };
      const plan = planCommerceConfiguration(upgraded, command, input);
      await call(
        "loop_commit",
        { command, kind: "commerce.configure", input, plan },
        command.timeline,
      );
      assert.equal(readLoopContext(await call("loop_read")).state.version, 1);
      await f.saves(
        w.cid,
        "load",
        await f.command(w.cid, {
          saveId: save.saveId,
          label: "Original saved state",
          recovery: false,
        }),
      );
      const restored = readLoopContext(await call("loop_read"));
      assert.equal(restored.state.version, 0);
      assert.equal(restored.state.progression, "off");
      assert.deepEqual(restored.state.currencies, []);
      assert.deepEqual(restored.state.preparations, []);
      assert.deepEqual(restored.snapshot.items, before.items);
      assert.ok(restored.snapshot.entities.every((entity) => entity.character_sheet === null));
      assert.deepEqual(
        restored.snapshot.entities,
        before.entities.map((entity) => ({ ...entity, character_sheet: null })),
      );
      assert.equal(
        restored.snapshot.publicState.summary,
        before.publicState.summary,
      );
      assert.equal(
        (
          await f.one(
            "select contents from rpg_private.dm_state where campaign_id=$1",
            [w.cid],
          )
        ).contents.fact.secret,
        "PRIVATE_BEFORE_FORK",
      );
      assert.deepEqual(
        await f.query(
          "select id,digest,payload from rpg_private.timeline_versions where campaign_id=$1 and id=any($2::uuid[]) order by id",
          [w.cid, oldVersions.map((v) => v.id)],
        ),
        oldVersions,
      );
      if (prefix >= 10)
        assert.equal(
          (
            await f.one(
              "select loop_state from rpg_private.world_foundations where campaign_id=$1",
              [w.cid],
            )
          ).loop_state,
          null,
        );
      await assert.rejects(
        f.one(
          "update rpg_private.timeline_versions set payload=payload||'{\"loop_state\":null}'::jsonb where id=$1",
          [oldVersions[0].id],
        ),
        /rpg_immutable_history/,
      );
    } finally {
      await f.db.close();
    }
  });
}
