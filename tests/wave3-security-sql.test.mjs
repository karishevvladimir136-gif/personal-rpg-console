import test from "node:test";
import assert from "node:assert/strict";
import { qaFixture, resolverStage, actionStage, checkpoint, stage } from "./wave3-qa-fixture.mjs";

test("QA SQL: stripping every typed resolver payload cannot downgrade an authoritative consequence to legacy", async () => {
  const f = await qaFixture();
  try {
    const prepared = await resolverStage(f);
    assert.equal(prepared.staged.status, "staged");
    assert.equal(prepared.staged.consequenceChanges.length, 1);
    await checkpoint(f, prepared);
    const forged = structuredClone(prepared.staged.settlement);
    for (const event of forged.events) {
      delete event.payload.consequences;
      delete event.payload.consequenceAuthority;
      delete event.payload.consequenceFacts;
    }
    const result = await stage(f, prepared, forged);
    assert.ok(result.error, "A legacy-looking payload must not discard the stored step's typed effect");
    assert.equal(
      (await f.one("select count(*)::integer n from rpg_private.world_stages where campaign_id=$1", [prepared.w.cid])).n,
      0,
    );
    assert.deepEqual(
      (await f.one("select conditions from public.rpg_entities where id=$1", [prepared.w.npc])).conditions,
      [],
    );
  } finally {
    await f.db.close();
  }
});

for (const [kind, field] of [["inventory.consume", "quantity"], ["resource.spend", "amount"]]) {
  test(`QA SQL: ${kind} requires a JSON integer rather than a numeric string`, async () => {
    const f = await qaFixture();
    try {
      const prepared = await actionStage(f, kind);
      assert.equal(prepared.staged.status, "staged");
      const forgedProposal = structuredClone(prepared.proposal);
      forgedProposal.consequences[0][field] = "1";
      const forged = structuredClone(prepared.staged.settlement);
      forged.events[0].payload.consequences[0][field] = "1";
      await checkpoint(f, prepared, { worldLogic: forgedProposal });
      const result = await stage(f, prepared, forged);
      assert.ok(result.error, "SQL must independently preserve the typed consequence schema");
    } finally {
      await f.db.close();
    }
  });
}

test("QA SQL: correctly typed v2 input remains accepted by the independent settlement validator", async () => {
  const f = await qaFixture();
  try {
    const prepared = await actionStage(f);
    await checkpoint(f, prepared, { worldLogic: prepared.proposal });
    const result = await stage(f, prepared);
    assert.equal(result.error, undefined, JSON.stringify(result.error));
    assert.deepEqual(result.data, prepared.staged.settlement);
  } finally {
    await f.db.close();
  }
});
