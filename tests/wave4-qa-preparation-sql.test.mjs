import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fixture as preparationSource } from "./wave4-preparation-fixtures.mjs";
import {
  qaFixture,
  moduleFromSource,
  persistedState,
} from "./wave4-qa-fixture.mjs";
const { buildCampaignBinding } = await moduleFromSource(
  "world-packs/bindings.ts",
);
const { loopCommand } = await moduleFromSource("foundation-loop/authority.ts");
const { buildPreparationDraft, planPreparation } = await moduleFromSource(
  "playable-world/preparation.ts",
);

async function fixture() {
  const f = await qaFixture();
  try {
    const synthetic = preparationSource().source;
    synthetic.pack.ownerId = f.owner;
    synthetic.pack.body.approval.ownerId = f.owner;
    for (const claim of synthetic.pack.body.claims)
      for (const evidence of claim.evidence) evidence.ownerId = f.owner;
    for (const record of synthetic.sources) record.ownerId = f.owner;
    // Seed a fully validated approved Pack fixture. Creation/compilation of the
    // reusable library is separately covered; binding and preparation use RPC.
    for (const record of [...synthetic.sources, synthetic.pack])
      await f.one(
        "insert into rpg_private.library_records(owner_id,kind,id,version_id,version,previous_version_id,body) values($1,$2,$3,$4,$5,$6,$7::jsonb)",
        [
          record.ownerId,
          record.kind,
          record.id,
          record.versionId,
          record.version,
          record.previousVersionId,
          JSON.stringify(record.body),
        ],
      );
    synthetic.binding = buildCampaignBinding({
      id: randomUUID(),
      campaignId: f.cid,
      ownerId: f.owner,
      pack: synthetic.pack,
      entry: synthetic.binding.entry,
      sourcePriority: synthetic.pack.body.sourcePriority,
      allocateEntityId: randomUUID,
    });
    synthetic.characterEntityId = f.hero;
    const command = loopCommand(await f.read(), randomUUID());
    const bound = await f.rpc({
      p_owner_id: f.owner,
      p_campaign_id: f.cid,
      p_action: "bind",
      p_payload: { command, binding: synthetic.binding },
      p_timeline: command.timeline,
    });
    assert.equal(bound.error, undefined, JSON.stringify(bound.error));
    const draft = async () => buildPreparationDraft(synthetic, await f.read());
    const prepare = async (input) => {
      const context = await f.read(),
        command = loopCommand(context, randomUUID());
      synthetic.worldMinutes = context.foundation.worldMinutes;
      const { storageCreates, ...plan } = planPreparation(
        context,
        synthetic,
        input,
      );
      plan.changes.push(
        ...storageCreates.map((s) => ({ family: "storages", ...s })),
      );
      return {
        context,
        request: {
          command,
          kind: "prepare",
          input: { bindingId: synthetic.binding.id, draft: input },
        },
        plan,
      };
    };
    return { ...f, source: synthetic, draft, prepare };
  } catch (error) {
    await f.db.close();
    throw error;
  }
}

test("QA SQL Pack: explicit selection creates one person, location, merchant storage and Thread; correction preserves pinned Canon and identity through load", async () => {
  const f = await fixture();
  try {
    const draft = await f.draft();
    draft.entities[0].selected = true;
    draft.entities[0].merchant = true;
    draft.entities[0].merchantLabel = "Mara’s ferry";
    draft.entities[1].selected = true;
    draft.threads[0].selected = true;
    const sourceVersions = await f.query(
      "select version_id,body from rpg_private.library_records order by version_id",
    );
    const prepared = await f.prepare(draft);
    await f.commit(prepared);
    const context = await f.read();
    assert.equal(context.state.preparations.length, 2);
    assert.equal(context.state.merchants.length, 1);
    assert.equal(context.world.threads.length, 1);
    const person = context.state.preparations.find(
      (p) => p.packEntityId === draft.entities[0].packEntityId,
    );
    const merchant = context.state.merchants[0];
    assert.equal(
      context.snapshot.entities.find((e) => e.id === person.entityId).name,
      draft.entities[0].name,
    );
    assert.equal(
      context.snapshot.storages.filter(
        (s) => s.entity_id === person.entityId && s.kind === "merchant",
      ).length,
      1,
    );
    assert.equal(
      context.snapshot.items.filter((i) => i.storage_id === merchant.storageId)
        .length,
      0,
    );
    const unchanged = await persistedState(f);
    await f.commit(prepared);
    assert.deepEqual(await persistedState(f), unchanged);
    const corrected = await f.draft();
    corrected.entities[0].name = "Mara the ferryman";
    corrected.entities[0].description = "Owner-authored correction";
    corrected.entities[0].limitations = ["No night crossing"];
    corrected.threads[0].goal = "Owner goal: restore the quay";
    await f.commit(await f.prepare(corrected));
    const save = await f.checkpoint();
    await f.load(save.saveId);
    const after = await f.read();
    assert.equal(
      after.snapshot.entities.find((e) => e.id === person.entityId).name,
      "Mara the ferryman",
    );
    assert.equal(after.state.merchants[0].storageId, merchant.storageId);
    assert.deepEqual(
      after.state.preparations.find((p) => p.entityId === person.entityId)
        .sourceVersionIds,
      person.sourceVersionIds,
    );
    assert.equal((await f.draft()).threads[0].goal, corrected.threads[0].goal);
    assert.deepEqual(
      await f.query(
        "select version_id,body from rpg_private.library_records order by version_id",
      ),
      sourceVersions,
    );
  } finally {
    await f.db.close();
  }
});

test("QA SQL Pack: saving an unchanged reviewed preparation succeeds without duplicate records or events", async () => {
  const f = await fixture();
  try {
    const draft = await f.draft();
    draft.entities[0].selected = true;
    await f.commit(await f.prepare(draft));
    const repeated = await f.prepare(await f.draft());
    assert.deepEqual(repeated.plan.changes, []);
    assert.deepEqual(repeated.plan.events, []);
    const before = await persistedState(f),
      result = await f.rawCommit(repeated);
    assert.equal(
      result.error,
      undefined,
      "Unchanged preparation must be a valid no-op at the service boundary",
    );
    assert.deepEqual(await persistedState(f), before);
  } finally {
    await f.db.close();
  }
});
