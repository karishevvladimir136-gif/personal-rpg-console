import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { defaultDmStyle } from "../src/lib/campaign-settings.ts";

test("populated pre-Mega-DM campaign and manual save survive additive migration", async () => {
  const f = await fixture(16);
  try {
    const w = await world(f);
    const save = await f.saves(w.cid, "create", await f.command(w.cid, { kind: "manual", name: "Before Mega DM" }));
    const before = await f.saves(w.cid, "campaign");
    const oldRead = await f.saves(w.cid, "read");
    assert.equal(before.settings.values.dmStyle, undefined);
    await f.db.exec(await readFile(new URL("../supabase/migrations/202609230017_mega_dm_v1.sql", import.meta.url), "utf8"));
    assert.deepEqual(await f.saves(w.cid, "campaign"), before);
    assert.deepEqual(await f.saves(w.cid, "read"), oldRead);
    assert.equal((await craft(f, "read")).versions.length, 8);
    const restored = await f.saves(w.cid, "load", await f.command(w.cid, { saveId: save.saveId, label: "Legacy restore", recovery: false }));
    assert.ok(restored);
    assert.equal((await f.saves(w.cid, "campaign")).settings.values.dmStyle, undefined);
  } finally {
    await f.db.close();
  }
});

async function craft(f, action, payload = {}, owner = f.owner) {
  return (await f.one("select public.rpg_dm_craft($1,$2,$3::jsonb) result", [
    owner, action, JSON.stringify(payload),
  ])).result;
}
async function teach(f, cid, payload, owner = f.owner) {
  return (await f.one("select public.rpg_dm_teach($1,$2,$3::jsonb) result", [
    owner, cid, JSON.stringify(payload),
  ])).result;
}

test("Mega DM migration seeds a small owner-scoped immutable bilingual library and exact claim selection", async () => {
  const f = await fixture();
  try {
    const view = await craft(f, "read");
    assert.equal(view.policyVersion, "mega-dm-v1-public-context-2");
    // 12 Mega DM versions plus the six Stage 4 versions (core doctrine v3 and five
    // cards), seeded pending: no effective row until the owner activates them.
    assert.equal(view.versions.length, 18);
    assert.equal(view.effective.length, 11);
    assert.ok(view.versions.every((v) => v.en.guidance && v.ru.guidance));
    await assert.rejects(craft(f, "read", {}, f.other), /rpg_forbidden/);
    const w = await world(f);
    const operationId = randomUUID();
    const input = {
      operationId, campaignId: w.cid,
      expectedRevision: (await f.runtime(w.cid, "play")).revision,
      mode: "game", input: "I return home and keep my promise to Nera.",
      companionId: null, listenerIds: [], mechanic: null,
    };
    await f.runtime(w.cid, "begin", input);
    const claim = await f.runtime(w.cid, "claim", { operationId });
    assert.equal(claim.source.craft.policyVersion, "mega-dm-v1-public-context-2");
    assert.equal(claim.source.craft.operationId, operationId);
    assert.equal(claim.source.craft.doctrine.key, "core-doctrine");
    assert.ok(claim.source.craft.plan.length <= 2);
    assert.ok(claim.source.craft.narrate.length <= 2);
    assert.ok(claim.source.craft.narrate.some((card) => card.key === "return-with-delta"));
    assert.equal(JSON.stringify(claim.turn.public).includes("craft"), false);
    assert.equal(JSON.stringify(await f.runtime(w.cid, "get", { operationId })).includes("craft"), false);
    const pinned = claim.source.craft;
    assert.deepEqual((await f.one("select rpg_private.dm_craft_stage($1,'plan','I inspect a plain stone') selected", [f.owner])).selected, []);
    const core = view.versions.find((v) => v.id === view.effective.find((e) => e.key === "core-doctrine").activeVersionId);
    const revision = view.effective.find((e) => e.key === "core-doctrine").activationRevision;
    const command = {
      requestId: randomUUID(), expectedActivationRevision: revision,
      entry: {
        key: core.key, kind: core.kind, category: core.category,
        stages: core.stages, triggers: core.triggers,
        en: { ...core.en, title: "Owner edited Core Doctrine" },
        ru: core.ru, provenance: "Owner reviewed correction",
      },
    };
    const revised = await craft(f, "save", command);
    assert.equal(revised.versions.length, view.versions.length + 1);
    assert.equal(revised.effective.find((x) => x.key === core.key).activationRevision, revision + 1);
    assert.deepEqual(await craft(f, "save", command), revised);
    assert.deepEqual((await f.one("select source->'craft' pinned from rpg_private.turns where id=$1", [operationId])).pinned, pinned);
    await f.one("update rpg_private.turns set lease_until=now()-interval '1 second' where id=$1", [operationId]);
    const retry = await f.runtime(w.cid, "claim", { operationId });
    assert.deepEqual(retry.source.craft, pinned);
    await assert.rejects(craft(f, "save", { ...command, entry: { ...command.entry, en: core.en } }), /rpg_conflict/);
    await assert.rejects(f.one("update rpg_private.dm_craft_versions set category='tamper' where id=$1", [core.id]), /rpg_immutable_history/);
  } finally {
    await f.db.close();
  }
});

test("Teach DM global approval needs an explicit reviewed entry, then remains idempotent and reversible", async () => {
  const f = await fixture();
  try {
    const w = await world(f);
    const operationId = randomUUID(), proposalId = randomUUID();
    await f.runtime(w.cid, "begin", {
      operationId, campaignId: w.cid,
      expectedRevision: (await f.runtime(w.cid, "play")).revision,
      mode: "feedback", input: "For every campaign, avoid one-solution quests.",
      companionId: null, listenerIds: [], mechanic: null,
    });
    await f.runtime(w.cid, "claim", { operationId });
    await f.one("update rpg_private.turns set status='committed',proposal=$2::jsonb where id=$1", [
      operationId, JSON.stringify({ id: proposalId, text: "Allow alternate approaches.",
        status: "proposed", scope: null, sessionId: w.sid, documentRevision: 1 }),
    ]);
    const before = await craft(f, "read");
    const core = before.versions.find((v) => v.id === before.effective.find((e) => e.key === "core-doctrine").activeVersionId);
    const revision = before.effective.find((e) => e.key === "core-doctrine").activationRevision;
    const command = {
      action: "approve-global", requestId: randomUUID(), campaignId: w.cid,
      timeline: await f.fence(w.cid), operationId, proposalId,
      expectedActivationRevision: revision,
      entry: { key: core.key, kind: core.kind, category: core.category,
        stages: core.stages, triggers: core.triggers,
        en: { ...core.en, guidance: `${core.en.guidance} Allow more than one supported approach.` },
        ru: core.ru, provenance: "Explicit owner-reviewed global teaching" },
    };
    const applied = await teach(f, w.cid, command);
    assert.equal(applied.proposal.scope, "global_craft");
    assert.equal((await teach(f, w.cid, command)).status, "already_applied");
    const after = await craft(f, "read");
    assert.equal(after.versions.length, before.versions.length + 1);
    assert.equal(after.effective.find((x) => x.key === core.key).activationRevision, revision + 1);
    const restored = await craft(f, "activate", {
      requestId: randomUUID(), expectedActivationRevision: revision + 1,
      key: core.key, versionId: core.id,
    });
    assert.equal(restored.effective.find((x) => x.key === core.key).activeVersionId, core.id);
    assert.equal(restored.versions.length, after.versions.length);
    assert.equal((await f.runtime(w.cid, "play")).worldMinutes, 0);
    await assert.rejects(teach(f, w.cid, { ...command, requestId: randomUUID() }), /rpg_validation/);
  } finally { await f.db.close(); }
});

test("campaign Style rolls back through existing save manifests while global Craft stays effective", async () => {
  const f = await fixture();
  try {
    const w = await world(f);
    const initial = await f.saves(w.cid, "campaign");
    assert.equal(initial.settings.values.dmStyle, undefined);
    await f.mutation("settings.save", w.cid, {
      ...initial.settings.values, dmStyle: { ...defaultDmStyle, tone: "warm" },
    }, initial.settings.revision);
    const first = (await f.saves(w.cid, "campaign")).settings;
    const saved = await f.saves(w.cid, "create", await f.command(w.cid, { kind: "manual", name: "Style A" }));
    await f.mutation("settings.save", w.cid, {
      ...first.values, dmStyle: { ...defaultDmStyle, tone: "cinematic" },
    }, first.revision);
    const beforeCraft = await craft(f, "read");
    const core = beforeCraft.versions.find((v) => v.id === beforeCraft.effective.find((e) => e.key === "core-doctrine").activeVersionId);
    const revision = beforeCraft.effective.find((e) => e.key === "core-doctrine").activationRevision;
    const active = await craft(f, "save", {
      requestId: randomUUID(), expectedActivationRevision: revision,
      entry: { key: core.key, kind: core.kind, category: core.category,
        stages: core.stages, triggers: core.triggers,
        en: { ...core.en, title: "After the save" }, ru: core.ru,
        provenance: "Owner reviewed later version" },
    });
    await f.saves(w.cid, "load", await f.command(w.cid, { saveId: saved.saveId, label: "Style restore", recovery: false }));
    const restored = await f.saves(w.cid, "campaign");
    assert.equal(restored.settings.values.dmStyle.tone, "warm");
    assert.equal((await craft(f, "read")).effective.find((x) => x.key === core.key).activeVersionId,
      active.effective.find((x) => x.key === core.key).activeVersionId);
    assert.equal((await craft(f, "read")).versions.length, beforeCraft.versions.length + 1);
  } finally { await f.db.close(); }
});

test("Teach DM approves only reviewed Style and rejects without touching game state", async () => {
  const f = await fixture();
  try {
    const w = await world(f);
    const operationId = randomUUID(), proposalId = randomUUID();
    const begin = {
      operationId, campaignId: w.cid,
      expectedRevision: (await f.runtime(w.cid, "play")).revision,
      mode: "feedback", input: "Companions are too passive.",
      companionId: null, listenerIds: [], mechanic: null,
    };
    await f.runtime(w.cid, "begin", begin);
    await f.runtime(w.cid, "claim", { operationId });
    await f.one("update rpg_private.turns set status='committed',proposal=$2::jsonb where id=$1", [
      operationId, JSON.stringify({ id: proposalId, text: "Make companions more active.",
        status: "proposed", scope: null, sessionId: w.sid, documentRevision: 1 }),
    ]);
    const before = await f.runtime(w.cid, "play");
    const settings = await f.saves(w.cid, "campaign");
    const request = {
      action: "approve-style", requestId: randomUUID(), campaignId: w.cid,
      timeline: await f.fence(w.cid), operationId, proposalId,
      expectedSettingsRevision: settings.settings.revision,
      style: { ...defaultDmStyle, companionAgency: "high" },
    };
    const approved = await teach(f, w.cid, request);
    assert.equal(approved.proposal.scope, "campaign_style");
    assert.equal(approved.proposal.status, "approved");
    assert.equal((await teach(f, w.cid, request)).status, "already_applied");
    assert.equal((await f.saves(w.cid, "campaign")).settings.values.dmStyle.companionAgency, "high");
    assert.ok((await f.runtime(w.cid, "play")).revision >= before.revision);
    assert.equal((await f.runtime(w.cid, "play")).worldMinutes, before.worldMinutes);
    assert.equal(JSON.stringify(await f.runtime(w.cid, "get", { operationId })).includes("craft"), false);
    await assert.rejects(teach(f, w.cid, { ...request, requestId: randomUUID(), style: { ...defaultDmStyle, companionAgency: "low" } }), /rpg_validation/);
    await assert.rejects(teach(f, w.cid, request, f.other), /rpg_forbidden/);
  } finally { await f.db.close(); }
});

test("a feedback proposal cannot teach DM from a sibling timeline", async () => {
  const f = await fixture();
  try {
    const w = await world(f);
    const operationId = randomUUID(), proposalId = randomUUID();
    await f.runtime(w.cid, "begin", {
      operationId, campaignId: w.cid,
      expectedRevision: (await f.runtime(w.cid, "play")).revision,
      mode: "feedback", input: "Try a quieter pace here.",
      companionId: null, listenerIds: [], mechanic: null,
    });
    await f.runtime(w.cid, "claim", { operationId });
    await f.one("update rpg_private.turns set status='committed',proposal=$2::jsonb where id=$1", [
      operationId, JSON.stringify({ id: proposalId, text: "Quieter pacing.",
        status: "proposed", scope: null, sessionId: w.sid, documentRevision: 1 }),
    ]);
    const checkpoint = await f.saves(w.cid, "create", await f.command(w.cid, { kind: "manual", name: "Before branch" }));
    await f.saves(w.cid, "load", await f.command(w.cid, {
      saveId: checkpoint.saveId, label: "Sibling timeline", recovery: false,
    }));
    const fence = await f.fence(w.cid);
    await assert.rejects(teach(f, w.cid, {
      action: "reject", requestId: randomUUID(), campaignId: w.cid,
      timeline: fence, operationId, proposalId,
    }), /rpg_validation/);
    assert.equal((await f.one("select proposal->>'status' status from rpg_private.turns where id=$1", [operationId])).status, "proposed");
  } finally { await f.db.close(); }
});

test("a pre-upgrade claimed turn never switches to new Craft on retry", async () => {
  const f = await fixture();
  try {
    const w = await world(f), operationId = randomUUID();
    await f.runtime(w.cid, "begin", {
      operationId, campaignId: w.cid,
      expectedRevision: (await f.runtime(w.cid, "play")).revision,
      mode: "game", input: "I listen at the bridge.",
      companionId: null, listenerIds: [], mechanic: null,
    });
    const oldClaim = (await f.one(
      "select public.rpg_runtime_before_mega_dm($1,$2,'claim',$3::jsonb,$4::jsonb) result",
      [f.owner, w.cid, JSON.stringify({ operationId }), JSON.stringify(await f.fence(w.cid))],
    )).result;
    assert.equal(oldClaim.source.craft, undefined);
    await f.one("update rpg_private.turns set lease_until=now()-interval '1 second' where id=$1", [operationId]);
    const retried = await f.runtime(w.cid, "claim", { operationId });
    assert.equal(retried.source.craft, undefined);
    assert.equal((await f.one("select source ? 'craft' has_craft from rpg_private.turns where id=$1", [operationId])).has_craft, false);
  } finally { await f.db.close(); }
});
