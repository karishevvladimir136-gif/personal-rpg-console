import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { commerceFixture, rewardFixture } from "./wave4-qa-fixture.mjs";

// Each probe runs inside its own rolled-back transaction, including when the
// deliberately forged service-only plan is incorrectly accepted. None is a
// public-route input or a claim that the model can directly call this RPC.
async function probe(f, prepared, mutate) {
  const forged = structuredClone(prepared);
  await f.db.exec("begin");
  try {
    await mutate(forged);
    return await f.rawCommit(forged);
  } finally {
    await f.db.exec("rollback");
  }
}

test("QA SQL defense: reward entitlements conserve approved items, progress, choices and capabilities independently of server plan fields", async (t) => {
  const f = await rewardFixture();
  try {
    const prepared = await f.reward();
    for (const [name, mutate] of [
      [
        "omit source item debit",
        (p) => {
          p.plan.changes = p.plan.changes.filter((c) => c.id !== f.stock);
        },
      ],
      [
        "inflate recipient item quantity",
        (p) => {
          p.plan.changes.find(
            (c) => c.family === "items" && c.expectedRevision === null,
          ).values.quantity = 99;
        },
      ],
      [
        "inflate progression amount",
        (p) => {
          p.plan.state.progress[0].value = 999;
        },
      ],
      [
        "substitute unapproved advancement option",
        (p) => {
          p.plan.state.pending[0].options[0].capability =
            "UNAPPROVED_CAPABILITY";
        },
      ],
      [
        "grant Actor capability without an advancement",
        (p) => {
          p.plan.world.actors
            .find((a) => a.id === f.hero)
            .capabilities.push("UNAPPROVED_CAPABILITY");
        },
      ],
    ])
      await t.test(name, async () => {
        assert.ok(
          (await probe(f, prepared, mutate)).error,
          `SQL accepted reward plan mutation: ${name}`,
        );
      });
  } finally {
    await f.db.close();
  }
});

test("QA SQL defense: trade cannot mutate unrelated inventory/resources or grant agency beyond its quote", async (t) => {
  const f = await commerceFixture();
  try {
    const prepared = await f.quote();
    for (const [name, mutate] of [
      [
        "unrelated companion currency",
        (p) => {
          const companion = p.context.snapshot.entities.find(
            (e) => e.id === f.npc,
          );
          p.plan.changes.push({
            family: "entities",
            id: f.npc,
            expectedRevision: companion.revision,
            values: { resources: { credits: 999 } },
          });
        },
      ],
      [
        "unrelated new stock stack",
        (p) => {
          const item = structuredClone(
            p.plan.changes.find(
              (c) => c.family === "items" && c.expectedRevision === null,
            ),
          );
          item.id = randomUUID();
          p.plan.changes.push(item);
        },
      ],
      [
        "unearned player capability",
        (p) => {
          p.plan.world.actors
            .find((a) => a.id === f.hero)
            .capabilities.push("UNAPPROVED_CAPABILITY");
        },
      ],
    ])
      await t.test(name, async () => {
        assert.ok(
          (await probe(f, prepared, mutate)).error,
          `SQL accepted trade plan mutation: ${name}`,
        );
      });
  } finally {
    await f.db.close();
  }
});

test("QA SQL defense: current quest restrictions, stolen-item policy, ownership and capacity overrule a previously planned trade", async (t) => {
  const f = await commerceFixture();
  try {
    const prepared = await f.quote();
    for (const [name, setup] of [
      [
        "quest restriction",
        () =>
          f.one(
            "update rpg_private.world_foundations set loop_state=jsonb_set(loop_state,'{itemPolicies,0,trade}','\"quest\"') where campaign_id=$1",
            [f.cid],
          ),
      ],
      [
        "private stock",
        () =>
          f.one(
            "update rpg_private.world_foundations set loop_state=jsonb_set(loop_state,'{itemPolicies,0,visibility}','\"private\"') where campaign_id=$1",
            [f.cid],
          ),
      ],
      [
        "foreign item owner",
        () =>
          f.one(
            "update public.rpg_items set owner_entity_id=$2,storage_id=$3 where id=$1",
            [f.stock, f.hero, f.storage],
          ),
      ],
      [
        "hidden merchant Actor",
        async () => {
          const world = structuredClone(prepared.context.world);
          world.actors.find((a) => a.id === f.merchant).publicName = null;
          await f.one(
            "update rpg_private.world_foundations set world=$2::jsonb where campaign_id=$1",
            [f.cid, JSON.stringify(world)],
          );
        },
      ],
    ])
      await t.test(name, async () => {
        assert.ok(
          (await probe(f, prepared, setup)).error,
          `SQL accepted current-state restriction: ${name}`,
        );
      });
  } finally {
    await f.db.close();
  }
});
