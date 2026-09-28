import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fixture, world } from "./phase35-storage-fixture.mjs";

async function setup(prefix = 24) {
  const f = await fixture(prefix);
  f.adventure = async (action, p = {}, cid = null, tl = null, uid = f.owner) =>
    (
      await f.one(
        "select public.rpg_adventures($1,$2,$3,$4::jsonb,$5::jsonb) result",
        [
          uid,
          cid,
          action,
          JSON.stringify(p),
          tl === null ? null : JSON.stringify(tl),
        ],
      )
    ).result;
  f.catalog = async (cid) => {
    const tl = await f.fence(cid);
    return f.adventure("read", { timeline: tl }, cid, tl);
  };
  f.adventureCommand = async (cid, more = {}) => {
    const s = await f.catalog(cid);
    return {
      requestId: randomUUID(),
      campaignId: cid,
      timeline: s.timeline,
      expectedRevision: s.revision,
      expectedRuntimeRevision: s.runtimeRevision,
      expectedHeadId: s.expectedHeadId,
      ...more,
    };
  };
  f.newWorld = () =>
    f.adventure("world_create", {
      requestId: randomUUID(),
      title: "Original synthetic World",
      premise: "Owner-authored foundation; not executable policy.",
      packVersionIds: [],
    });
  f.hero = async (w) => {
    const p = {
      requestId: randomUUID(),
      worldId: w.world.id,
      worldVersion: 1,
      title: "Ordinary hero continuity",
      heroName: "Ari",
      language: "en",
      template: "console-basic-fighter-level1-v1",
    };
    return { p, result: await f.adventure("new_campaign", p) };
  };
  f.write = async (action, p) =>
    f.adventure(action, p, p.campaignId, p.timeline);
  return f;
}
const core = async (f, cid) => ({
  entities: await f.query(
    "select id,kind,name,details,hp,max_hp,stats,resources,conditions,equipment_slots from public.rpg_entities where campaign_id=$1 order by id",
    [cid],
  ),
  items: await f.query(
    "select id,name,quantity,storage_id,owner_entity_id,equipped_entity_id,equipped_slot from public.rpg_items where campaign_id=$1 order by id",
    [cid],
  ),
  loop: (
    await f.one(
      "select loop_state from rpg_private.world_foundations where campaign_id=$1",
      [cid],
    )
  ).loop_state,
  time: (
    await f.one(
      "select world_minutes from rpg_private.runtime_state where campaign_id=$1",
      [cid],
    )
  ).world_minutes,
  private: await f.query(
    "select * from rpg_private.dm_state where campaign_id=$1",
    [cid],
  ),
});

test("Adventure V1 SQL: one normal house Fighter Campaign, exact creation replay and no source fact from owner text", async () => {
  const f = await setup();
  try {
    const w = await f.newWorld(),
      { p, result } = await f.hero(w),
      cid = result.campaignId;
    assert.deepEqual(await f.adventure("new_campaign", p), result);
    assert.equal(
      (await f.query("select * from public.rpg_campaigns")).length,
      1,
    );
    const snapshot = await f.saves(cid, "campaign");
    assert.equal(snapshot.entities.length, 1);
    assert.equal(snapshot.entities[0].id, result.heroId);
    assert.equal(snapshot.entities[0].stats.level, 1);
    assert.equal(snapshot.entities[0].hp, 12);
    assert.deepEqual(
      snapshot.entities[0].equipment_slots.map((s) => s.id),
      ["hand", "offhand", "body"],
    );
    assert.ok(
      snapshot.entities[0].equipment_slots.every(
        (s) => typeof s.label === "string" && Array.isArray(s.accepts),
      ),
    );
    assert.ok(
      snapshot.entities[0].equipment_slots
        .find((s) => s.id === "hand")
        .accepts.includes("weapon"),
    );
    assert.equal(snapshot.items.length, 2);
    assert.ok(snapshot.items.every((x) => x.owner_entity_id === result.heroId));
    const runtime = await f.runtime(cid, "play");
    assert.equal(runtime.configuration.profile, "console-basic-v1");
    const settings = snapshot.settings.values;
    assert.equal(settings.rulesSystem.enemyHpScaling, false);
    assert.equal(
      (await f.query("select * from rpg_private.library_records")).length,
      0,
    );
    assert.deepEqual((await f.catalog(cid)).worldBinding, {
      worldId: w.world.id,
      worldVersion: 1,
      title: w.world.title,
    });
    await assert.rejects(
      f.adventure("new_campaign", { ...p, heroName: "Changed" }),
      /rpg_conflict/,
    );
    await assert.rejects(
      f.adventure("worlds", {}, null, null, f.other),
      /rpg_forbidden/,
    );
  } finally {
    await f.db.close();
  }
});

test("Adventure V1 SQL: prepare/start/end/review are immutable, advisory and do not copy or mutate hero authority", async () => {
  const f = await setup();
  try {
    const w = await f.newWorld(),
      { result } = await f.hero(w),
      cid = result.campaignId,
      original = await core(f, cid);
    const prepare = await f.adventureCommand(cid, {
      title: "Evening Adventure",
      premise:
        "A straightforward first paid quest; owner chooses its direction.",
      pacing: { kind: "evening", custom: null },
      mode: "canon",
    });
    const p = await f.write("prepare", prepare);
    assert.deepEqual(await f.write("prepare", prepare), p);
    let a = (await f.catalog(cid)).adventures[0];
    const start = await f.adventureCommand(cid, {
      adventureId: a.id,
      expectedAdventureVersion: a.version,
    });
    await f.write("start", start);
    a = (await f.catalog(cid)).adventures[0];
    assert.equal(a.status, "active");
    assert.equal(a.start.worldMinutes, 0);
    const source = (
      await f.one("select rpg_private.runtime_source($1,$2,'game') source", [
        cid,
        f.owner,
      ])
    ).source;
    assert.equal(source.adventureContext.pacing.kind, "evening");
    assert.equal(source.adventureContext.partyPower[0].level, 1);
    assert.equal(
      source.adventureContext.worldFoundation.classification,
      "owner_advisory",
    );
    assert.ok(
      source.adventureContext.boundaries.some((x) =>
        x.includes("never a hard timer"),
      ),
    );
    const feedback = (
      await f.one(
        "select rpg_private.runtime_source($1,$2,'feedback') source",
        [cid, f.owner],
      )
    ).source;
    assert.equal(feedback.adventureContext, undefined);
    const end = await f.adventureCommand(cid, {
      adventureId: a.id,
      expectedAdventureVersion: a.version,
      summary: "Owner-written completion; not automatic gameplay.",
      review: null,
    });
    const ended = await f.write("end", end);
    assert.deepEqual(await f.write("end", end), ended);
    a = (await f.catalog(cid)).adventures[0];
    assert.equal(a.status, "completed");
    const review = await f.adventureCommand(cid, {
      adventureId: a.id,
      expectedAdventureVersion: a.version,
      review: {
        pacing: "Comfortable",
        agency: "Free choices",
        rewards: null,
        payoff: null,
        notes: "Manual review",
      },
    });
    await f.write("review", review);
    const c = await f.catalog(cid);
    assert.equal(c.history.length, 4);
    assert.equal(c.activeAdventureId, null);
    assert.equal(c.adventures[0].review.notes, "Manual review");
    assert.deepEqual(await core(f, cid), original);
    assert.equal(
      (
        await f.query(
          "select * from rpg_private.world_events where campaign_id=$1 and event->>'visibility'='public'",
          [cid],
        )
      ).length,
      0,
    );
    assert.equal(
      (
        await f.one("select rpg_private.runtime_source($1,$2,'game') source", [
          cid,
          f.owner,
        ])
      ).source.adventureContext,
      undefined,
    );
  } finally {
    await f.db.close();
  }
});

test("Adventure V1 SQL: stale exact head, unknown authority, detached mode and parallel active Adventure fail closed", async () => {
  const f = await setup();
  try {
    const w = await f.newWorld(),
      { result } = await f.hero(w),
      cid = result.campaignId;
    const prepare = await f.adventureCommand(cid, {
      title: "Test",
      premise: "No scripted path.",
      pacing: { kind: "quick", custom: null },
      mode: "canon",
    });
    const save = await f.command(cid, { kind: "manual", name: "Head changed" });
    await f.saves(cid, "create", save);
    await assert.rejects(f.write("prepare", prepare), /rpg_conflict/);
    const current = await f.adventureCommand(cid, {
      title: "Test",
      premise: "An owner-authored open premise.",
      pacing: { kind: "quick", custom: null },
      mode: "canon",
    });
    await assert.rejects(
      f.write("prepare", { ...current, mode: "detached" }),
      /rpg_validation/,
    );
    await assert.rejects(
      f.write("prepare", { ...current, manifestId: randomUUID() }),
      /rpg_validation/,
    );
    await f.write("prepare", current);
    let c = await f.catalog(cid),
      a = c.adventures[0];
    await f.write(
      "start",
      await f.adventureCommand(cid, {
        adventureId: a.id,
        expectedAdventureVersion: a.version,
      }),
    );
    await f.write(
      "prepare",
      await f.adventureCommand(cid, {
        title: "Second",
        premise: "An owner-authored open premise.",
        pacing: { kind: "open", custom: null },
        mode: "canon",
      }),
    );
    c = await f.catalog(cid);
    a = c.adventures.find((x) => x.status === "prepared");
    await assert.rejects(
      f.write(
        "start",
        await f.adventureCommand(cid, {
          adventureId: a.id,
          expectedAdventureVersion: a.version,
        }),
      ),
      /rpg_validation/,
    );
    const other = (await f.hero(w)).result.campaignId;
    await assert.rejects(
      f.adventure(
        "end",
        {
          ...(await f.adventureCommand(other)),
          adventureId: c.adventures[0].id,
          expectedAdventureVersion: 1,
          summary: null,
          review: null,
        },
        other,
        await f.fence(other),
      ),
      /rpg_conflict/,
    );
    assert.equal((await f.catalog(other)).history.length, 0);
  } finally {
    await f.db.close();
  }
});

test("Adventure V1 SQL: exact save/fork inherits only committed metadata and isolates future versions", async () => {
  const f = await setup();
  try {
    const w = await f.newWorld(),
      { result } = await f.hero(w),
      cid = result.campaignId;
    await f.write(
      "prepare",
      await f.adventureCommand(cid, {
        title: "Saved Adventure",
        premise: "An owner-authored open premise.",
        pacing: { kind: "evening", custom: null },
        mode: "canon",
      }),
    );
    const a = (await f.catalog(cid)).adventures[0];
    const save = await f.saves(
      cid,
      "create",
      await f.command(cid, { kind: "manual", name: "Prepared exact hero" }),
    );
    await f.write(
      "start",
      await f.adventureCommand(cid, {
        adventureId: a.id,
        expectedAdventureVersion: 1,
      }),
    );
    await f.saves(
      cid,
      "load",
      await f.command(cid, {
        saveId: save.saveId,
        label: "Independent Adventure branch",
        recovery: false,
      }),
    );
    let c = await f.catalog(cid);
    assert.equal(c.adventures[0].status, "prepared");
    assert.equal(c.history.length, 1);
    await f.write(
      "edit",
      await f.adventureCommand(cid, {
        adventureId: a.id,
        expectedAdventureVersion: 1,
        title: "Branch only",
        premise: "Changed locally",
        pacing: { kind: "open", custom: null },
      }),
    );
    c = await f.catalog(cid);
    assert.equal(c.adventures[0].title, "Branch only");
    await f.saves(
      cid,
      "load",
      await f.command(cid, {
        saveId: save.saveId,
        label: "Return to saved moment",
        recovery: false,
      }),
    );
    c = await f.catalog(cid);
    assert.equal(c.adventures[0].title, "Saved Adventure");
    assert.equal(c.history.length, 1);
  } finally {
    await f.db.close();
  }
});

test("Adventure V1 SQL: populated accepted prefixes upgrade without invented World/Adventure association", async () => {
  for (const prefix of [8, 10, 11, 12, 13, 23, 24, 25]) {
    const f = await setup(prefix);
    try {
      const legacy =
        prefix === 8
          ? { cid: await f.campaign("Historical prefix 8") }
          : await world(f, `Historical prefix ${prefix}`);
      if (prefix === 8)
        await f.mutation("entity.save", legacy.cid, {
          kind: "player",
          name: "Legacy hero",
          details: "Saved historical hero",
          hp: 7,
          max_hp: 12,
          stats: { skill: 2 },
          resources: { focus: 3 },
          conditions: [],
          equipment_slots: [],
        });
      const beforeSnapshot = await f.saves(legacy.cid, "campaign"),
        before = beforeSnapshot.entities;
      const oldSave = await f.saves(
        legacy.cid,
        "create",
        await f.command(legacy.cid, {
          kind: "manual",
          name: "Populated historical save",
        }),
      );
      for (const file of f.files.slice(prefix, 26))
        await f.db.exec(await readFile(new URL(file, f.folder), "utf8"));
      const c = await f.catalog(legacy.cid);
      assert.equal(
        (await f.one("select count(*)::int n from rpg_private.media_budgets"))
          .n,
        0,
      );
      assert.equal(
        (
          await f.one(
            "select count(*)::int n from rpg_private.world_events where campaign_id=$1 and event->>'kind' in ('loot.object.configured','reward.integrity.configured')",
            [legacy.cid],
          )
        ).n,
        0,
      );
      const afterSnapshot = await f.saves(legacy.cid, "campaign");
      for (const key of [
        "entities",
        "items",
        "storages",
        "locations",
        "quests",
        "scenes",
        "documents",
        "assets",
      ])
        assert.deepEqual(afterSnapshot[key], beforeSnapshot[key], key);

      assert.equal(c.worldBinding, null);
      assert.deepEqual(c.adventures, []);
      assert.deepEqual(c.history, []);
      assert.deepEqual(
        (await f.saves(legacy.cid, "campaign")).entities,
        before,
      );
      await f.saves(
        legacy.cid,
        "load",
        await f.command(legacy.cid, {
          saveId: oldSave.saveId,
          label: "Load historical save",
          recovery: false,
        }),
      );
      const restored = await f.catalog(legacy.cid);
      assert.equal(restored.worldBinding, null);
      assert.deepEqual(restored.adventures, []);
      assert.deepEqual(
        (await f.saves(legacy.cid, "campaign")).entities,
        before,
      );
    } finally {
      await f.db.close();
    }
  }
});
