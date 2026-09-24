import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { defaultDmStyle } from "../src/lib/campaign-settings.ts";
import { fixture, world } from "./phase35-storage-fixture.mjs";

test("a settings edit invalidates an unclaimed turn before it can switch Style", async () => {
  const f = await fixture();
  try {
    const w = await world(f);
    const initial = (await f.saves(w.cid, "campaign")).settings;
    await f.mutation("settings.save", w.cid, {
      ...initial.values,
      dmStyle: { ...defaultDmStyle, tone: "warm" },
    }, initial.revision);
    const atBegin = (await f.saves(w.cid, "campaign")).settings;
    const operationId = randomUUID();
    await f.runtime(w.cid, "begin", {
      operationId,
      campaignId: w.cid,
      expectedRevision: (await f.runtime(w.cid, "play")).revision,
      mode: "game",
      input: "I keep my promise to Nera.",
      companionId: null,
      listenerIds: [],
      mechanic: null,
    });
    await f.mutation("settings.save", w.cid, {
      ...atBegin.values,
      dmStyle: { ...defaultDmStyle, tone: "cinematic" },
    }, atBegin.revision);
    assert.equal(await f.runtime(w.cid, "claim", { operationId }), null);
    const stale = await f.one("select status, failure, source from rpg_private.turns where id=$1", [operationId]);
    assert.equal(stale.status, "failed");
    assert.equal(stale.failure, "conflict");
    assert.equal(stale.source, null);
    const nextOperationId = randomUUID();
    await f.runtime(w.cid, "begin", {
      operationId: nextOperationId,
      campaignId: w.cid,
      expectedRevision: (await f.runtime(w.cid, "play")).revision,
      mode: "game",
      input: "I return home.",
      companionId: null,
      listenerIds: [],
      mechanic: null,
    });
    const next = await f.runtime(w.cid, "claim", { operationId: nextOperationId });
    assert.equal(next.source.craft.styleRevision, atBegin.revision + 1);
    assert.equal(next.source.craft.style.tone, "cinematic");
    assert.deepEqual(next.source.craft.timeline, await f.fence(w.cid));
  } finally {
    await f.db.close();
  }
});
