// Stage V: migration 54 — picture styles with versions, pictures with versions
// bound to the timeline, campaign picture settings, the daily cap and the
// player-visible projection. Disposable PGlite database only.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fixture, world } from "./phase35-storage-fixture.mjs";

const call = (f, cid, action, payload = {}, user = f.owner) =>
  f.one("select public.rpg_pictures($1,$2,$3,$4::jsonb) result", [user, cid, action, JSON.stringify(payload)]).then((row) => row.result);
const fails = (promise, code) => assert.rejects(promise, (error) => error.message.includes(code));

test("migration 54: settings, styles with versions and roll-back, campaign override over the world style", async () => {
  const f = await fixture();
  try {
    assert.ok(f.files.includes("202610160054_stage_v_pictures.sql"));
    const w = await world(f);
    const read = await call(f, w.cid, "read");
    assert.deepEqual(Object.keys(read).sort(), ["campaignId", "pictures", "profiles", "settings", "styles", "today", "worldId"]);
    assert.equal(read.settings.revision, 0, "defaults until the first save");
    assert.equal(read.settings.frames, "every");
    assert.equal(read.settings.autopilot.provider, "fal");
    assert.equal(read.worldId, null, "no world is bound to this synthetic campaign");
    await fails(call(f, w.cid, "settings.save", { expectedRevision: 1, frames: "key", quality: "fast", dailyCap: 10, autopilot: read.settings.autopilot }), "rpg_conflict");
    const saved = await call(f, w.cid, "settings.save", { expectedRevision: 0, frames: "key", quality: "quality", dailyCap: 10, autopilot: { ...read.settings.autopilot, enabled: true } });
    assert.equal(saved.revision, 1);
    assert.equal(saved.frames, "key");
    await fails(call(f, w.cid, "settings.save", { expectedRevision: 1, frames: "sometimes", quality: "fast", dailyCap: 10, autopilot: read.settings.autopilot }), "rpg_validation");
    await fails(call(f, w.cid, "settings.save", { expectedRevision: 1, frames: "every", quality: "fast", dailyCap: 10, autopilot: { ...read.settings.autopilot, extra: true } }), "rpg_validation");
    // Polish 2 (migration 64): the owner's model per tier travels with the settings; absent means the default.
    assert.deepEqual(saved.models, {}, "no choice yet");
    const picked = await call(f, w.cid, "settings.save", { expectedRevision: 1, frames: "key", quality: "quality", dailyCap: 10, autopilot: read.settings.autopilot, models: { fast: "fal-ai/flux-2/klein/9b" } });
    assert.deepEqual(picked.models, { fast: "fal-ai/flux-2/klein/9b" });
    assert.equal(picked.revision, 2);
    await fails(call(f, w.cid, "settings.save", { expectedRevision: 2, frames: "key", quality: "quality", dailyCap: 10, autopilot: read.settings.autopilot, models: { slow: "x" } }), "rpg_validation");
    await fails(call(f, w.cid, "settings.save", { expectedRevision: 2, frames: "key", quality: "quality", dailyCap: 10, autopilot: read.settings.autopilot, models: { fast: 7 } }), "rpg_validation");
    const cleared = await call(f, w.cid, "settings.save", { expectedRevision: 2, frames: "key", quality: "quality", dailyCap: 10, autopilot: read.settings.autopilot, models: {} });
    assert.deepEqual(cleared.models, {});
    // A GPT Image model is stored with its provider; the model ID itself is free text for the catalogue in TypeScript.
    const gpt = await call(f, w.cid, "picture.create", { id: randomUUID(), kind: "anchor", subjectKind: "entity", subjectId: w.hero, composition: "portrait", timeline: await f.fence(w.cid),
      tier: "quality", trigger: "redraw", model: "gpt-image-2.5-sunburst", styleVersionId: null, shot: null, prompt: "A portrait.", referenceIds: [] });
    assert.equal(gpt.model, "gpt-image-2.5-sunburst");
    assert.equal((await f.one("select provider from rpg_private.pictures where id=$1", [gpt.id])).provider, "openai");
    // Styles: no world bound, so a world-scoped style is refused; campaign styles get versions.
    await fails(call(f, w.cid, "style.save", { id: randomUUID(), scope: "world", preset: "noir", label: "Noir", styleText: "x", reference: null, activate: true }), "rpg_conflict");
    const v1 = await call(f, w.cid, "style.save", { id: randomUUID(), scope: "campaign", preset: "line-art", label: "Line art", styleText: "Clean ink lines, limited palette.", reference: null, activate: true });
    assert.equal(v1.version, 1);
    assert.equal(v1.active, true);
    assert.equal(v1.hasReference, false);
    const ref = { storagePath: `styles/${randomUUID()}/reference.jpg`, sha256: "a".repeat(64), contentType: "image/jpeg" };
    const v2 = await call(f, w.cid, "style.save", { id: randomUUID(), scope: "campaign", preset: "custom", label: "Oil", styleText: "Painterly oil.", reference: ref, activate: true });
    assert.equal(v2.version, 2);
    assert.equal(v2.hasReference, true);
    let styles = (await call(f, w.cid, "read")).styles;
    assert.deepEqual(styles.map((row) => [row.version, row.active]), [[1, false], [2, true]]);
    assert.ok(!("styleText" in styles[0]) || typeof styles[0].styleText === "string");
    assert.ok(!("referencePath" in styles[1]), "the projection never carries storage paths");
    // Roll back: activate version 1 again; version 2 stays in history.
    const back = await call(f, w.cid, "style.activate", { styleId: v1.id });
    assert.equal(back.active, true);
    styles = (await call(f, w.cid, "read")).styles;
    assert.deepEqual(styles.map((row) => [row.version, row.active]), [[1, true], [2, false]]);
    const priv = await call(f, w.cid, "style.private", { styleId: v2.id });
    assert.equal(priv.referencePath, ref.storagePath);
    await fails(f.one("update rpg_private.picture_styles set style_text='changed' where id=$1", [v2.id]), "rpg_conflict");
    await fails(f.one("delete from rpg_private.picture_styles where id=$1", [v2.id]), "rpg_conflict");
    await call(f, w.cid, "style.clear", { scope: "campaign" });
    assert.ok((await call(f, w.cid, "read")).styles.every((row) => !row.active));
    await fails(call(f, w.cid, "read", {}, f.other), "rpg_forbidden");
  } finally {
    await f.db.close();
  }
});

test("migration 54: picture lifecycle, versions per subject, the daily cap, hidden frames and the projection", async () => {
  const f = await fixture();
  try {
    const w = await world(f);
    const fence = await f.fence(w.cid);
    const base = { timeline: fence, tier: "fast", trigger: "autopilot", model: "fal-ai/flux-2/klein/9b", styleVersionId: null, shot: null, prompt: "A portrait.", referenceIds: [] };
    const anchor = (id, overrides = {}) => call(f, w.cid, "picture.create", { id, kind: "anchor", subjectKind: "entity", subjectId: w.hero, composition: "portrait", ...base, ...overrides });
    const a1 = await anchor(randomUUID());
    assert.equal(a1.status, "queued");
    assert.equal(a1.version, 1);
    assert.ok(!("prompt" in a1) && !("shot" in a1), "the projection never carries the prompt or the shot");
    await fails(anchor(randomUUID(), { subjectId: randomUUID() }), "rpg_not_found");
    await fails(anchor(randomUUID(), { timeline: { ...fence, epoch: fence.epoch + 1 } }), "rpg_conflict");
    await fails(anchor(randomUUID(), { kind: "frame" }), "pictures_check", "an entity picture is an anchor");
    await fails(anchor(randomUUID(), { referenceIds: [randomUUID()] }), "rpg_conflict", "references must be ready pictures or style references");
    // Lifecycle: queued → generating → ready, then only the hidden flag may change.
    const generating = await call(f, w.cid, "picture.update", { id: a1.id, status: "generating" });
    assert.equal(generating.status, "generating");
    await fails(call(f, w.cid, "picture.update", { id: a1.id, status: "ready", output: { storagePath: `${w.cid}/pictures/${a1.id}.jpg`, contentType: "image/jpeg", width: 1024, height: 1024, bytes: 1000, sha256: "b".repeat(64) }, costUsdMicros: -1 }), "pictures_cost_usd_micros_check");
    const ready = await call(f, w.cid, "picture.update", { id: a1.id, status: "ready", output: { storagePath: `${w.cid}/pictures/${a1.id}.jpg`, contentType: "image/jpeg", width: 1024, height: 1024, bytes: 1000, sha256: "b".repeat(64) }, costUsdMicros: 17000, requestId: "req-1", elapsedMs: 1200 });
    assert.equal(ready.status, "ready");
    assert.equal(ready.costUsdMicros, 17000);
    assert.ok(ready.readyAt);
    await fails(call(f, w.cid, "picture.update", { id: a1.id, status: "failed", error: "late" }), "rpg_conflict");
    await fails(f.one("delete from rpg_private.pictures where id=$1", [a1.id]), "rpg_conflict");
    const hidden = await call(f, w.cid, "picture.hide", { id: a1.id, hidden: true });
    assert.equal(hidden.hidden, true);
    // A second version of the same subject and composition; a failed attempt counts for the cap.
    const a2 = await anchor(randomUUID(), { referenceIds: [a1.id] });
    assert.equal(a2.version, 2);
    const failed = await call(f, w.cid, "picture.update", { id: a2.id, status: "failed", error: "validation: content checker", costUsdMicros: 17000 });
    assert.equal(failed.status, "failed");
    assert.equal(failed.error, "validation: content checker");
    // A frame of a turn needs a turn row of this campaign.
    const turnId = randomUUID();
    await fails(call(f, w.cid, "picture.create", { id: randomUUID(), kind: "frame", subjectKind: "turn", subjectId: turnId, composition: "frame", ...base, trigger: "live" }), "rpg_not_found");
    await f.one("insert into rpg_private.turns(id,campaign_id,owner_id,input,expected_revision,settings_revision,settings,guide_revision) values($1,$2,$3,'{}',1,1,'{}',1)", [turnId, w.cid, f.owner]);
    const frame = await call(f, w.cid, "picture.create", { id: randomUUID(), kind: "frame", subjectKind: "turn", subjectId: turnId, composition: "frame", ...base, trigger: "live", shot: { who: ["Ari"], where: "Old bridge" } });
    assert.equal(frame.kind, "frame");
    await fails(call(f, w.cid, "picture.create", { id: randomUUID(), kind: "frame", subjectKind: "turn", subjectId: turnId, composition: "portrait", ...base, trigger: "live" }), "pictures_check");
    const read = await call(f, w.cid, "read");
    assert.equal(read.pictures.length, 3);
    assert.equal(read.today.count, 3);
    assert.equal(read.today.costUsdMicros, 34000);
    const priv = await call(f, w.cid, "picture.private", { id: frame.id });
    assert.deepEqual(priv.shot, { who: ["Ari"], where: "Old bridge" });
    assert.equal(priv.prompt, "A portrait.");
    // The daily cap: every attempt of the UTC day counts.
    await call(f, w.cid, "settings.save", { expectedRevision: 0, frames: "every", quality: "fast", dailyCap: 3, autopilot: read.settings.autopilot });
    await fails(anchor(randomUUID()), "rpg_conflict");
    await call(f, w.cid, "settings.save", { expectedRevision: 1, frames: "every", quality: "fast", dailyCap: 4, autopilot: read.settings.autopilot });
    const a3 = await anchor(randomUUID(), { composition: "figure" });
    assert.equal(a3.version, 1, "versions count per subject and composition");
  } finally {
    await f.db.close();
  }
});
