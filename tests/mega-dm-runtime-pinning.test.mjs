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

test("Teach DM Style approval cannot switch an already claimed gameplay turn", async () => {
  const f = await fixture();
  try {
    const w = await world(f);
    const gameOperationId = randomUUID();
    const revision = (await f.runtime(w.cid, "play")).revision;
    await f.runtime(w.cid, "begin", {
      operationId: gameOperationId,
      campaignId: w.cid,
      expectedRevision: revision,
      mode: "game",
      input: "I ask Nera about the road.",
      companionId: null,
      listenerIds: [],
      mechanic: null,
    });
    const before = await f.runtime(w.cid, "claim", { operationId: gameOperationId });
    const feedbackOperationId = randomUUID();
    const proposalId = randomUUID();
    await f.runtime(w.cid, "begin", {
      operationId: feedbackOperationId,
      campaignId: w.cid,
      expectedRevision: revision,
      mode: "feedback",
      input: "Make companions more active.",
      companionId: null,
      listenerIds: [],
      mechanic: null,
    });
    await f.runtime(w.cid, "claim", { operationId: feedbackOperationId });
    await f.one("update rpg_private.turns set status='committed',proposal=$2::jsonb where id=$1", [
      feedbackOperationId,
      JSON.stringify({
        id: proposalId,
        text: "More companion initiative.",
        status: "proposed",
        scope: null,
        sessionId: w.sid,
        documentRevision: 1,
      }),
    ]);
    const settings = (await f.saves(w.cid, "campaign")).settings;
    const taught = await f.one("select public.rpg_dm_teach($1,$2,$3::jsonb) result", [
      f.owner,
      w.cid,
      JSON.stringify({
        action: "approve-style",
        requestId: randomUUID(),
        campaignId: w.cid,
        timeline: await f.fence(w.cid),
        operationId: feedbackOperationId,
        proposalId,
        expectedSettingsRevision: settings.revision,
        style: { ...defaultDmStyle, companionAgency: "high" },
      }),
    ]);
    assert.equal(taught.result.status, "applied");
    await f.one("update rpg_private.turns set lease_until=now()-interval '1 second' where id=$1", [gameOperationId]);
    const retried = await f.runtime(w.cid, "claim", { operationId: gameOperationId });
    assert.equal(retried, null);
    const stale = await f.one("select status, failure, source->'craft' craft from rpg_private.turns where id=$1", [gameOperationId]);
    assert.equal(stale.status, "failed");
    assert.equal(stale.failure, "conflict");
    assert.deepEqual(stale.craft, before.source.craft);
    assert.equal((await f.saves(w.cid, "campaign")).settings.values.dmStyle.companionAgency, "high");
  } finally {
    await f.db.close();
  }
});
