import assert from "node:assert/strict";
import test from "node:test";
import {
  moduleFromSource,
  sourceText,
  qaFixture,
  running,
} from "./d1-qa-fixture.mjs";

for (const prefix of [7, 9, 10, 11, 12, 13]) {
  test(`D1 QA populated prefix ${prefix} upgrades through migration 14 without rewriting legacy state or save history`, async () => {
    const { fixture, world } = await moduleFromSource(
      "tests/phase35-storage-fixture.mjs",
    );
    const f = await fixture(prefix);
    try {
      const fencedRuntime = f.runtime;
      if (prefix === 7)
        f.runtime = async (cid, action, payload = {}) =>
          (
            await f.one(
              "select public.rpg_runtime($1,$2,$3,$4::jsonb) result",
              [f.owner, cid, action, JSON.stringify(payload)],
            )
          ).result;
      const w = await world(f, `QA upgrade prefix ${prefix}`);
      f.runtime = fencedRuntime;
      if (prefix >= 10)
        await f.one(
          "insert into rpg_private.world_foundations(campaign_id) values($1)",
          [w.cid],
        );
      const core = async () =>
        f.one(
          `select
        (select jsonb_agg(to_jsonb(e) order by e.id) from public.rpg_entities e where campaign_id=$1) entities,
        (select jsonb_agg(to_jsonb(i) order by i.id) from public.rpg_items i where campaign_id=$1) items,
        (select contents from rpg_private.dm_state where campaign_id=$1) private`,
          [w.cid],
        );
      const before = await core();
      let save, versions, manifests, points;
      if (prefix >= 9) {
        save = await f.saves(
          w.cid,
          "create",
          await f.command(w.cid, {
            kind: "manual",
            name: `QA prefix ${prefix}`,
          }),
        );
        versions = await f.query(
          "select id,digest,payload from rpg_private.timeline_versions where campaign_id=$1 order by id",
          [w.cid],
        );
        manifests = await f.query(
          "select id,refs,schema_version,public_metadata,canon_generation from rpg_private.timeline_manifests where campaign_id=$1 order by id",
          [w.cid],
        );
        points = await f.query(
          "select * from rpg_private.save_points where campaign_id=$1 order by id",
          [w.cid],
        );
      }
      for (const file of f.files.slice(prefix, 14))
        await f.db.exec(await sourceText(`supabase/migrations/${file}`));
      assert.deepEqual(await core(), before);
      if (save) {
        assert.deepEqual(
          await f.query(
            "select id,digest,payload from rpg_private.timeline_versions where campaign_id=$1 order by id",
            [w.cid],
          ),
          versions,
        );
        assert.deepEqual(
          await f.query(
            "select id,refs,schema_version,public_metadata,canon_generation from rpg_private.timeline_manifests where campaign_id=$1 order by id",
            [w.cid],
          ),
          manifests,
        );
        assert.deepEqual(
          await f.query(
            "select * from rpg_private.save_points where campaign_id=$1 order by id",
            [w.cid],
          ),
          points,
        );
        await f.saves(
          w.cid,
          "load",
          await f.command(w.cid, {
            saveId: save.saveId,
            label: "QA historical load",
            recovery: false,
          }),
        );
        assert.deepEqual(await core(), before);
        assert.deepEqual(
          await f.query(
            "select id,digest,payload from rpg_private.timeline_versions where campaign_id=$1 and id=any($2::uuid[]) order by id",
            [w.cid, versions.map((v) => v.id)],
          ),
          versions,
        );
        assert.deepEqual(
          await f.query(
            "select id,refs,schema_version,public_metadata,canon_generation from rpg_private.timeline_manifests where campaign_id=$1 and id=any($2::uuid[]) order by id",
            [w.cid, manifests.map((m) => m.id)],
          ),
          manifests,
        );
        assert.deepEqual(
          await f.query(
            "select * from rpg_private.save_points where campaign_id=$1 and id=any($2::uuid[]) order by id",
            [w.cid, points.map((p) => p.id)],
          ),
          points,
        );
      }
      assert.ok((await f.saves(w.cid, "read")).timelines.length > 0);
      assert.equal(
        (
          await f.one(
            "select count(*)::integer n from rpg_private.world_lab_runs where campaign_id=$1",
            [w.cid],
          )
        ).n,
        0,
      );
    } finally {
      await f.db.close();
    }
  });
}

test("D1 QA upgrade preserves genuine schema 1 and pre-Wave-4 schema 2 vault payloads and loadability", async () => {
  const { fixture, world } = await moduleFromSource(
    "tests/phase35-storage-fixture.mjs",
  );
  const f = await fixture(9);
  try {
    const w = await world(f, "QA historical saves");
    const capture = async (name) => {
      await f.saves(
        w.cid,
        "create",
        await f.command(w.cid, { kind: "manual", name }),
      );
      return f.one(
        "select * from rpg_private.save_points where campaign_id=$1 and name=$2",
        [w.cid, name],
      );
    };
    const old1 = await capture("Actual schema 1");
    for (const file of f.files.slice(9, 12))
      await f.db.exec(await sourceText(`supabase/migrations/${file}`));
    await f.one(
      "insert into rpg_private.world_foundations(campaign_id) values($1)",
      [w.cid],
    );
    const old2 = await capture("Actual schema 2 before Wave 4");
    const manifests = await f.query(
      "select id,refs,schema_version,public_metadata,canon_generation from rpg_private.timeline_manifests where campaign_id=$1 order by id",
      [w.cid],
    );
    const versions = await f.query(
      "select * from rpg_private.timeline_versions where campaign_id=$1 order by id",
      [w.cid],
    );
    assert.equal(
      manifests.find((m) => m.id === old1.manifest_id).schema_version,
      1,
    );
    assert.equal(
      manifests.find((m) => m.id === old2.manifest_id).schema_version,
      2,
    );
    const oldWorld = versions.find(
      (v) => v.table_name === "rpg_private.world_foundations",
    );
    assert.ok(oldWorld);
    assert.equal(Object.hasOwn(oldWorld.payload, "loop_state"), false);
    for (const file of f.files.slice(12, 14))
      await f.db.exec(await sourceText(`supabase/migrations/${file}`));
    assert.deepEqual(
      await f.query(
        "select id,refs,schema_version,public_metadata,canon_generation from rpg_private.timeline_manifests where campaign_id=$1 order by id",
        [w.cid],
      ),
      manifests,
    );
    assert.deepEqual(
      await f.query(
        "select * from rpg_private.timeline_versions where campaign_id=$1 order by id",
        [w.cid],
      ),
      versions,
    );
    for (const save of [old1, old2]) {
      await f.one("select rpg_private.timeline_validate($1,$2)", [
        w.cid,
        save.manifest_id,
      ]);
      await f.saves(
        w.cid,
        "load",
        await f.command(w.cid, {
          saveId: save.id,
          label: "QA legacy load",
          recovery: false,
        }),
      );
      const restored = await f.one(
        "select * from rpg_private.world_foundations where campaign_id=$1",
        [w.cid],
      );
      assert.equal(restored?.world ?? null, null);
      assert.equal(restored?.loop_state ?? null, null);
      assert.equal(
        (
          await f.one(
            "select count(*)::integer n from rpg_private.world_lab_runs where campaign_id=$1",
            [w.cid],
          )
        ).n,
        0,
      );
    }
    const families = await f.one(
      "select to_jsonb(rpg_private.timeline_tables_v1()) v1,to_jsonb(rpg_private.timeline_tables()) v2",
    );
    assert.deepEqual(
      Object.keys(manifests.find((m) => m.id === old1.manifest_id).refs).sort(),
      families.v1.sort(),
    );
    assert.deepEqual(
      Object.keys(manifests.find((m) => m.id === old2.manifest_id).refs).sort(),
      families.v2.sort(),
    );
    assert.equal(
      families.v2.some((name) => name.includes("lab")),
      false,
    );
  } finally {
    await f.db.close();
  }
});

test("D1 QA database roles cannot call private Lab RPC or read its run/input ledger", async () => {
  const f = await qaFixture();
  try {
    const run = await running(f);
    for (const role of ["anon", "authenticated"]) {
      await f.db.exec(`set role ${role}`);
      try {
        await assert.rejects(
          () => f.lab("read", { runId: run.id }),
          /permission denied/,
        );
        await assert.rejects(
          () => f.one("select input_bundle from rpg_private.world_lab_runs"),
          /permission denied/,
        );
        await assert.rejects(
          () => f.one("select * from rpg_private.world_lab_commands"),
          /permission denied/,
        );
        await assert.rejects(
          () =>
            f.one(
              "select rpg_private.lab_run_json(r) from rpg_private.world_lab_runs r",
            ),
          /permission denied/,
        );
      } finally {
        await f.db.exec("reset role");
      }
    }
    await f.db.exec("set role service_role");
    try {
      assert.equal((await f.lab("read", { runId: run.id })).run.id, run.id);
    } finally {
      await f.db.exec("reset role");
    }
  } finally {
    await f.db.close();
  }
});
