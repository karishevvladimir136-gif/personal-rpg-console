import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { commerceFixture, persistedState } from "./wave4-qa-fixture.mjs";
import {
  ownerLootView,
  planOwnerLootConfiguration,
} from "../src/lib/adventure-loot/owner-planning.ts";
import { readLootObject } from "../src/lib/adventure-loot/state.ts";

async function setup() {
  const f = await commerceFixture();
  try {
    for (const file of f.files.slice(13))
      await f.db.exec(await readFile(new URL(file, f.folder), "utf8"));
    return f;
  } catch (error) {
    await f.db.close();
    throw error;
  }
}
const createInput = async (f) => {
  const view = ownerLootView(await f.read());
  assert.ok(view.choices.storages.some((s) => s.id === f.stockStorage));
  assert.ok(view.choices.capabilities.length);
  return {
    action: "create",
    storageId: f.stockStorage,
    locationId: f.location,
    ownerEntityId: f.merchant,
    label: "  Merchant wooden chest  ",
    access: "locked",
    portable: true,
    capability: view.choices.capabilities[0],
    lockDc: 18,
    forceDc: 8,
  };
};
const prepare = (f, input) =>
  f.prepare("loot.configure", input, (c, cmd, raw) =>
    planOwnerLootConfiguration(c, cmd, raw, f.owner),
  );

test("owner object SQL: public create/edit preserve inventory, private immutable history and exact replay", async () => {
  const f = await setup();
  try {
    const initial = await f.read(),
      created = await prepare(f, await createInput(f));
    await f.commit(created);
    const objectId = created.plan.events[0].payload.object.id,
      context = await f.read();
    assert.deepEqual(context.snapshot.items, initial.snapshot.items);
    assert.deepEqual(context.snapshot.entities, initial.snapshot.entities);
    const version = readLootObject(context, objectId);
    assert.equal(version.object.label, "Merchant wooden chest");
    assert.deepEqual(
      version.policy.approaches.map((r) => r.check.dc),
      [18, 8],
    );
    const committed = await persistedState(f);
    assert.deepEqual(
      await f.store.commit(created.request, created.plan),
      await f.store.receipt(created.request),
    );
    assert.deepEqual(await persistedState(f), committed);
    const edited = await prepare(f, {
      action: "edit",
      objectId,
      expectedObjectRevision: 1,
      label: "Ручное исправление",
      access: "closed",
      portable: false,
    });
    await f.commit(edited);
    const next = await f.read(),
      after = readLootObject(next, objectId);
    assert.equal(after.object.revision, 2);
    assert.equal(after.object.label, "Ручное исправление");
    assert.deepEqual(after.policy, version.policy);
    assert.deepEqual(after.privateItems, version.privateItems);
    assert.deepEqual(next.snapshot.items, initial.snapshot.items);
    assert.equal(
      next.events.filter((e) => e.payload.object?.id === objectId).length,
      2,
    );
    const checkpoint = await f.checkpoint();
    await f.load(checkpoint.saveId);
    assert.deepEqual(readLootObject(await f.read(), objectId), after);
    await assert.rejects(prepare(f, edited.request.input));
  } finally {
    await f.db.close();
  }
});

test("owner object SQL: fabricated private policy or inventory changes fail atomically", async () => {
  const f = await setup();
  try {
    const prepared = await prepare(f, await createInput(f)),
      before = await persistedState(f);
    for (const modify of [
      (p) => {
        p.events[0].payload.policy.approaches[0].check.dc = 1;
      },
      (p) => {
        p.events[0].payload.object.knownBy = [f.merchant];
      },
      (p) => {
        p.changes.push({
          family: "items",
          id: f.stock,
          expectedRevision: 1,
          values: { quantity: 999 },
        });
      },
      (p) => {
        p.events[0].payload.privateItems.push({
          itemId: f.stock,
          hidden: { trueIdentity: "PRIVATE" },
        });
      },
    ]) {
      const attempted = structuredClone(prepared);
      modify(attempted.plan);
      assert.ok((await f.rawCommit(attempted)).error);
      assert.deepEqual(await persistedState(f), before);
    }
    await f.commit(prepared);
    assert.ok(
      readLootObject(await f.read(), prepared.plan.events[0].payload.object.id),
    );
  } finally {
    await f.db.close();
  }
});

test("owner object SQL: World Logic owner edits require the existing controlled player but no HP or legacy configuration", async () => {
  const f = await setup();
  try {
    await f.one(
      "update public.rpg_entities set hp=null,max_hp=null,stats='{}' where campaign_id=$1 and id=$2",
      [f.cid, f.hero],
    );
    await f.one(
      "update rpg_private.runtime_state set configuration=null where campaign_id=$1",
      [f.cid],
    );
    const context = await f.read();
    const profile = {
      id: "world-logic-v1",
      version: 1,
      mode: "world_logic",
      validatorVersion: "world-logic-v1",
    };
    context.state.profile = profile;
    await f.one(
      "update rpg_private.world_foundations set ruleset=$2::jsonb,loop_state=$3::jsonb where campaign_id=$1",
      [f.cid, JSON.stringify(profile), JSON.stringify(context.state)],
    );
    const prepared = await prepare(f, await createInput(f));
    await f.commit(prepared);
    assert.ok(
      readLootObject(await f.read(), prepared.plan.events[0].payload.object.id),
    );
  } finally {
    await f.db.close();
  }
});
