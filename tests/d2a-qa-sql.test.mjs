import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { sqlFixture, moduleFromSource } from "./d2a-qa-fixture.mjs";

async function consequencesFixture() {
  const f = await sqlFixture({
    transformWorld(world) {
      world.actors[0].capabilities = [
        "world.spend:focus",
        "world.condition.add:wet",
      ];
    },
  });
  await f.one(
    "update public.rpg_entities set resources=$3::jsonb,revision=revision+1 where campaign_id=$1 and id=$2",
    [f.cid, f.npc, JSON.stringify({ focus: 4 })],
  );
  const saved = await f.saves(
    f.cid,
    "create",
    await f.command(f.cid, { kind: "manual", name: "D2A QA exact resources" }),
  );
  const { running, liveProjection, vaultState } = await moduleFromSource(
    "tests/d1-qa-fixture.mjs",
  );
  const run = await running(f, {
    ...f.request,
    saveId: saved.saveId,
    operationId: randomUUID(),
  });
  const state = await f.store.readDetached(f.cid, run.id);
  const world = state.records["rpg_private.world_foundations"][0].world;
  const effects = [
    { kind: "resource.spend", actorId: f.npc, resource: "focus", amount: 2 },
    { kind: "condition.add", actorId: f.npc, condition: "wet" },
  ];
  const caps = world.actors[0].capabilities.map((cap) => `${f.npc}:${cap}`);
  const validate = async (
    changes = effects,
    campaignId = f.cid,
    manifestId = state.manifest.id,
  ) =>
    (
      await f.one(
        "select rpg_private.wave3_consequences($1,$2::jsonb,$3::jsonb,'resolver',$4::jsonb,$5::jsonb,null,30,$6) result",
        [
          campaignId,
          JSON.stringify(world),
          JSON.stringify(changes),
          JSON.stringify([f.npc]),
          JSON.stringify(caps),
          manifestId,
        ],
      )
    ).result;
  return {
    ...f,
    state,
    run,
    world,
    effects,
    validate,
    liveProjection: () => liveProjection(f),
    vaultState: () => vaultState(f),
  };
}

test("D2A QA actual SQL consequence validation uses exact detached resource and control state after live edits", async () => {
  const f = await consequencesFixture();
  try {
    await f.one(
      "update public.rpg_entities set resources=$3::jsonb,conditions=$4::jsonb,revision=revision+1 where campaign_id=$1 and id=$2",
      [f.cid, f.npc, JSON.stringify({ focus: 900 }), JSON.stringify(["cold"])],
    );
    await f.one(
      "update rpg_private.runtime_state set configuration=jsonb_set(configuration,'{controlledEntityIds}',$2::jsonb),revision=revision+1 where campaign_id=$1",
      [f.cid, JSON.stringify([f.npc])],
    );
    const live = await f.liveProjection(),
      vault = await f.vaultState();
    const result = await f.validate();
    assert.equal(result.changes.length, 1);
    assert.deepEqual(result.changes[0].values, {
      resources: { focus: 2 },
      conditions: ["wet"],
    });
    assert.equal(
      result.changes[0].expectedRevision,
      f.state.records["public.rpg_entities"].find((e) => e.id === f.npc)
        .revision,
    );
    assert.deepEqual(await f.liveProjection(), live);
    assert.deepEqual(await f.vaultState(), vault);
    assert.deepEqual(result.publicTexts, []);
  } finally {
    await f.db.close();
  }
});

test("D2A QA SQL typed validators reject excess resources, foreign scope, protected actors and raw effects without writes", async () => {
  const f = await consequencesFixture();
  try {
    const live = await f.liveProjection(),
      vault = await f.vaultState();
    for (const effects of [
      [{ ...f.effects[0], amount: 5 }],
      [{ ...f.effects[0], amount: -1 }],
      [{ ...f.effects[0], actorId: f.hero }],
      [{ ...f.effects[0], actorId: randomUUID() }],
      [{ ...f.effects[0], resource: "unestablished_gold" }],
      [{ ...f.effects[0], values: { resources: { focus: 999 } } }],
      [{ kind: "arbitrary.patch", gold: 999 }],
      [f.effects[0], f.effects[0]],
    ])
      await assert.rejects(() => f.validate(effects));
    await assert.rejects(() => f.validate(f.effects, randomUUID()));
    await assert.rejects(() => f.validate(f.effects, f.cid, randomUUID()));
    assert.deepEqual(await f.liveProjection(), live);
    assert.deepEqual(await f.vaultState(), vault);
    for (const role of ["anon", "authenticated"]) {
      await f.db.exec(`set role ${role}`);
      try {
        await assert.rejects(() => f.validate(), /permission denied/);
      } finally {
        await f.db.exec("reset role");
      }
    }
  } finally {
    await f.db.close();
  }
});
