import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { setup, examples } from "./universal-bootstrap-fixture.mjs";
import { fixture } from "./phase35-storage-fixture.mjs";
import { initialCreationReview, parseCreationProposal } from "../src/lib/adventures/bootstrap-validation.ts";

const structuredSheet = {
  schemaVersion: 1, mode: "structured_rpg", role: "Wilderness scout",
  background: "A traveler who knows the open roads.", level: null, tier: null,
  attributes: { strength: 11, dexterity: 14, constitution: 12, intelligence: 10, wisdom: 13, charisma: 9 },
  skills: ["Tracking", "Wilderness travel"], abilities: ["Careful observation"],
  limitations: ["No spellcasting"], spells: [],
};

test("sparse fantasy owner input receives an explicitly reviewed v2 public sheet, not World Actor powers", async () => {
  const f = await setup({ ...examples.fantasy, description: "A wanderer. I carry a simple sword.", caps: [], limits: [], item: "simple sword" }, "en", 42);
  try {
    f.creation = { ...f.creation, schemaVersion: 2, sheet: structuredSheet,
      mechanics: { hp: 10, attack: 1, defense: 11, skill: 2, weaponName: "simple sword", weaponDamage: 3 } };
    const draft = await f.service.perform({ action: "creation.propose", input: f.input });
    assert.equal(draft.proposal.sheet.skills[0], "Tracking");
    const review = initialCreationReview(f.input, draft.proposal);
    assert.equal(review.mechanics.hp, 10);
    const created = await f.service.perform({ action: "creation.commit", input: { requestId: randomUUID(), draftId: draft.draftId, review } });
    const row = await f.one("select character_sheet,hp,max_hp,stats,revision from public.rpg_entities where campaign_id=$1 and id=$2", [created.campaignId, created.heroId]);
    assert.deepEqual(row.character_sheet, structuredSheet);
    assert.equal(row.hp, 10);
    assert.equal(row.max_hp, 10);
    assert.deepEqual(row.stats, { attack: 1, defense: 11, skill: 2 });
    const item = await f.one("select category,equipped_entity_id,equipped_slot from public.rpg_items where campaign_id=$1", [created.campaignId]);
    assert.equal(item.category, "weapon");
    assert.equal(item.equipped_entity_id, created.heroId);
    assert.equal(item.equipped_slot, "hand");
    const actor = await f.one("select world->'actors'->0->'capabilities' capabilities from rpg_private.world_foundations where campaign_id=$1", [created.campaignId]);
    assert.deepEqual(actor.capabilities, []);
    const source = await f.one("select rpg_private.runtime_source($1,$2,'game') source", [created.campaignId, f.owner]);
    assert.deepEqual(source.source.snapshot.entities.find((e) => e.id === created.heroId).character_sheet, structuredSheet);
    const saved = await f.saves(created.campaignId, "campaign");
    assert.deepEqual(saved.entities.find((e) => e.id === created.heroId).character_sheet, structuredSheet);
    const captured = await f.one("select payload from rpg_private.timeline_versions where campaign_id=$1 and table_name='public.rpg_entities' and row_key=$2 order by created_at desc limit 1", [created.campaignId, created.heroId]);
    assert.deepEqual(captured.payload.character_sheet, structuredSheet);
    const save = await f.saves(created.campaignId, "create", await f.command(created.campaignId, { kind: "manual", name: "Reviewed character" }));
    await f.saves(created.campaignId, "load", await f.command(created.campaignId, { saveId: save.saveId, label: "Character branch", recovery: false }));
    assert.deepEqual((await f.one("select character_sheet from public.rpg_entities where id=$1", [created.heroId])).character_sheet, structuredSheet);
    await assert.rejects(f.one("select rpg_private.runtime_change($1,$2,$3::jsonb)", [created.campaignId, randomUUID(), JSON.stringify({ family: "entities", id: created.heroId, expectedRevision: row.revision, values: { character_sheet: { ...structuredSheet, role: "Unauthorized change" } } })]), /rpg_validation/);
    assert.deepEqual((await f.one("select character_sheet from public.rpg_entities where id=$1", [created.heroId])).character_sheet, structuredSheet);
  } finally { await f.db.close(); }
});

test("narrative v2 creates descriptive sheet without combat profile; legacy v1 remains NULL", async () => {
  const narrative = await setup(examples.orbital, "en", 42);
  try {
    narrative.creation = { ...narrative.creation, schemaVersion: 2,
      sheet: { ...structuredSheet, mode: "narrative", role: "Cargo pilot", attributes: null, skills: ["Dock negotiation"] }, mechanics: null };
    for (const invalid of ["unreviewed", 0, [], {}]) {
      await assert.rejects(narrative.one(
        "select rpg_private.bootstrap_proposal('creation',$1::jsonb,$2::jsonb)",
        [JSON.stringify({ ...narrative.creation, mechanics: invalid }), JSON.stringify(narrative.input)],
      ), /rpg_validation/);
    }
    await narrative.create();
    const row = await narrative.one("select character_sheet,hp,stats from public.rpg_entities where campaign_id=$1", [narrative.cid]);
    assert.equal(row.character_sheet.mode, "narrative");
    assert.equal(row.hp, null);
    assert.deepEqual(row.stats, {});
  } finally { await narrative.db.close(); }
  const legacy = await setup(examples.fantasy, "en", 42);
  try {
    await legacy.create();
    assert.equal((await legacy.one("select character_sheet from public.rpg_entities where campaign_id=$1", [legacy.cid])).character_sheet, null);
  } finally { await legacy.db.close(); }
});

test("v2 sheet is bounded and cannot smuggle powers or invent possession authority", () => {
  const p = { schemaVersion: 2, capabilities: [], limitations: [], possessions: [], resources: [], questions: [], sheet: structuredSheet,
    mechanics: { hp: 10, attack: 1, defense: 11, skill: 2, weaponName: null, weaponDamage: null } };
  assert.deepEqual(parseCreationProposal(p).sheet, structuredSheet);
  assert.throws(() => parseCreationProposal({ ...p, sheet: { ...structuredSheet, skills: ["can:teleport"] } }));
  assert.throws(() => parseCreationProposal({ ...p, sheet: { ...structuredSheet, level: 1 } }));
  assert.throws(() => parseCreationProposal({ ...p, sheet: { ...structuredSheet, spells: ["Fireball"] } }));
  assert.throws(() => parseCreationProposal({ ...p, sheet: { ...structuredSheet, attributes: { ...structuredSheet.attributes, strength: 25 } } }));
  assert.throws(() => parseCreationProposal({ ...p, mechanics: { ...p.mechanics, weaponName: "Invented sword", weaponDamage: 3 } }));
});

test("populated 41 to 42 preserves legacy rows and old timeline manifests", async () => {
  const f = await fixture(41);
  try {
    const cid = await f.campaign("Old save");
    const hero = (await f.mutation("entity.save", cid, { kind: "player", name: "Old hero", details: "Old", hp: 5, max_hp: 5, stats: {}, resources: {}, conditions: [], equipment_slots: [] })).id;
    const save = await f.saves(cid, "create", await f.command(cid, { kind: "manual", name: "Before character sheet" }));
    const before = await f.one("select to_jsonb(e) row from public.rpg_entities e where id=$1", [hero]);
    const manifest = await f.one("select payload from rpg_private.timeline_versions where campaign_id=$1 and table_name='public.rpg_entities' order by created_at desc limit 1", [cid]);
    const migration = await readFile(new URL("../supabase/migrations/202610060042_character_sheet_bootstrap.sql", import.meta.url), "utf8");
    await f.db.exec(migration);
    const after = await f.one("select to_jsonb(e) row from public.rpg_entities e where id=$1", [hero]);
    const { character_sheet: restoredSheet, ...oldFields } = after.row;
    assert.deepEqual(oldFields, before.row);
    assert.equal(restoredSheet, null);
    assert.equal(after.row.character_sheet, null);
    const old = await f.one("select payload from rpg_private.timeline_versions where campaign_id=$1 and table_name='public.rpg_entities' order by created_at desc limit 1", [cid]);
    assert.deepEqual(old?.payload, manifest?.payload);
    await f.saves(cid, "load", await f.command(cid, { saveId: save.saveId, label: "Restored old save", recovery: false }));
    assert.equal((await f.one("select character_sheet from public.rpg_entities where id=$1", [hero])).character_sheet, null);
  } finally { await f.db.close(); }
});

test("a v1 creation draft reserved on migration 41 commits as legacy after migration 42", async () => {
  const f = await setup(examples.fantasy, "en", 41);
  try {
    const draft = await f.service.perform({ action: "creation.propose", input: f.input });
    assert.equal(draft.proposal.schemaVersion, 1);
    const review = initialCreationReview(f.input, draft.proposal);
    const migration = await readFile(new URL("../supabase/migrations/202610060042_character_sheet_bootstrap.sql", import.meta.url), "utf8");
    await f.db.exec(migration);
    const result = await f.service.perform({ action: "creation.commit", input: {
      requestId: randomUUID(), draftId: draft.draftId, review,
    } });
    const hero = await f.one("select character_sheet from public.rpg_entities where campaign_id=$1 and id=$2", [result.campaignId, result.heroId]);
    assert.equal(hero.character_sheet, null);
  } finally { await f.db.close(); }
});
