import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";

// Executes PostgreSQL, including grants/RLS/transactions. auth.uid/users are test-only stubs:
// this is NOT verification of Supabase Auth, cookies, PostgREST or a hosted project.
test("PostgreSQL persistence and security with an explicit test-only auth stub", async (t) => {
  const db = new PGlite();
  const owner = randomUUID(),
    outsider = randomUUID();
  let first,
    second,
    entityA,
    entityB,
    storageA,
    storageB,
    itemA,
    documentA,
    versionA,
    sessionA,
    sceneA;
  const privateMarker = "SYNTHETIC_PRIVATE_DO_NOT_EXPOSE_7ec128";
  async function role(name, user = "") {
    await db.exec(`reset role; set role ${name};`);
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      user,
    ]);
  }
  async function mutation(
    operation,
    campaignId,
    payload,
    revision = 0,
    requestId = randomUUID(),
  ) {
    const response = await db.query(
      "select public.rpg_apply_mutation($1,$2,$3,$4,$5::jsonb) as result",
      [requestId, operation, campaignId, revision, JSON.stringify(payload)],
    );
    return response.rows[0].result;
  }
  async function one(sql, values = []) {
    return (await db.query(sql, values)).rows[0];
  }
  const person = (name) => ({
    kind: "player",
    name,
    details: "Invented test character",
    hp: 8,
    max_hp: 10,
    stats: { strength: 2 },
    resources: { focus: 2 },
    conditions: [],
    equipment_slots: [{ id: "hand", label: "Hand", accepts: ["tool"] }],
  });
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202609170001_phase1_persistence.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await db.query("insert into auth.users(id) values($1),($2)", [
      owner,
      outsider,
    ]);
    await db.query(
      "insert into rpg_private.owner_registry(user_id) values($1)",
      [owner],
    );

    await t.test(
      "anonymous and non-owner direct requests are rejected",
      async () => {
        await role("anon");
        await assert.rejects(
          db.query("select * from public.rpg_campaigns"),
          /permission denied/,
        );
        await assert.rejects(
          mutation("campaign.create", null, {
            title: "Denied",
            subtitle: "",
            language: "en",
          }),
          /permission denied/,
        );
        await role("authenticated", outsider);
        assert.equal(
          (await one("select public.rpg_is_owner() as allowed")).allowed,
          false,
        );
        assert.deepEqual(
          (await db.query("select * from public.rpg_campaigns")).rows,
          [],
        );
        await assert.rejects(
          mutation("campaign.create", null, {
            title: "Denied",
            subtitle: "",
            language: "en",
          }),
          /rpg_forbidden/,
        );
      },
    );
    await t.test(
      "two unrelated synthetic campaigns are created once despite repeated request",
      async () => {
        await role("authenticated", owner);
        const request = randomUUID(),
          payload = {
            title: "Synthetic · Tidal Observatory",
            subtitle: "Invented ocean survey",
            language: "en",
          };
        first = await mutation("campaign.create", null, payload, 0, request);
        assert.deepEqual(
          await mutation("campaign.create", null, payload, 0, request),
          first,
        );
        await assert.rejects(
          mutation(
            "campaign.create",
            null,
            { ...payload, title: "Changed" },
            0,
            request,
          ),
          /rpg_conflict/,
        );
        second = await mutation("campaign.create", null, {
          title: "Synthetic · Copper Orchard",
          subtitle: "Invented rural mystery",
          language: "ru",
        });
        assert.notEqual(first.id, second.id);
        assert.equal(
          (await one("select count(*)::int as count from public.rpg_campaigns"))
            .count,
          2,
        );
        const settings = await one(
          "select values from public.rpg_settings where campaign_id=$1",
          [first.id],
        );
        assert.equal(settings.values.rulesSystem.label, "Custom rules");
        assert.equal(settings.values.campaign_id, first.id);
      },
    );
    await t.test(
      "owner direct table writes and private schema access are denied",
      async () => {
        await assert.rejects(
          db.query("update public.rpg_campaigns set title='bypass'"),
          /permission denied/,
        );
        await assert.rejects(
          db.query("select * from rpg_private.dm_state"),
          /permission denied/,
        );
        await assert.rejects(
          db.query("select * from rpg_private.mutation_receipts"),
          /permission denied/,
        );
        await assert.rejects(
          db.query("select rpg_private.assert(true)"),
          /permission denied/,
        );
        await assert.rejects(
          db.query(
            "insert into public.rpg_encounters(campaign_id,status,settings_revision) values($1,'active',1)",
            [first.id],
          ),
          /permission denied/,
        );
      },
    );
    await t.test(
      "private data stays absent from every public table",
      async () => {
        await role("postgres");
        await db.query(
          "insert into rpg_private.dm_state(campaign_id,contents) values($1,$2::jsonb)",
          [first.id, JSON.stringify({ invented: privateMarker })],
        );
        await role("authenticated", owner);
        const tables = await db.query(
          "select tablename from pg_tables where schemaname='public' and tablename like 'rpg_%'",
        );
        for (const { tablename } of tables.rows)
          assert.ok(
            !JSON.stringify(
              (await db.query(`select * from public.${tablename}`)).rows,
            ).includes(privateMarker),
          );
      },
    );
    await t.test(
      "documents preserve immutable history, restore as new version, reject stale or cross-campaign edits",
      async () => {
        documentA = await mutation("document.save", first.id, {
          title: "Tides",
          status: "canon",
          body: "First invented text",
        });
        versionA = await one(
          "select current_version_id from public.rpg_documents where id=$1",
          [documentA.id],
        );
        const changed = await mutation(
          "document.save",
          first.id,
          {
            id: documentA.id,
            title: "Tides",
            status: "reference",
            body: "Second invented text",
          },
          1,
        );
        assert.equal(changed.revision, 2);
        await assert.rejects(
          mutation(
            "document.save",
            first.id,
            {
              id: documentA.id,
              title: "Stale",
              status: "canon",
              body: "Lost edit",
            },
            1,
          ),
          /rpg_conflict/,
        );
        await assert.rejects(
          mutation(
            "document.save",
            second.id,
            {
              id: documentA.id,
              title: "Cross scope",
              status: "canon",
              body: "No",
            },
            0,
          ),
          /rpg_validation/,
        );
        const restored = await mutation(
          "document.restore",
          first.id,
          { id: documentA.id, versionId: versionA.current_version_id },
          2,
        );
        assert.equal(restored.revision, 3);
        assert.equal(
          (
            await one("select body from public.rpg_documents where id=$1", [
              documentA.id,
            ])
          ).body,
          "First invented text",
        );
        assert.equal(
          (
            await one(
              "select count(*)::int as count from public.rpg_document_versions where document_id=$1",
              [documentA.id],
            )
          ).count,
          3,
        );
        await role("postgres");
        await assert.rejects(
          db.query("update public.rpg_document_versions set body='overwrite'"),
          /rpg_immutable_history/,
        );
        await assert.rejects(
          db.query("delete from public.rpg_settings_revisions"),
          /rpg_immutable_history/,
        );
        await role("authenticated", owner);
      },
    );
    await t.test(
      "preferences and campaign settings are independent and Hidden retains toggles",
      async () => {
        await mutation("preferences.save", null, {
          language: "ru",
          largeText: true,
          suggestions: false,
        });
        const original = (
          await one(
            "select values from public.rpg_settings where campaign_id=$1",
            [first.id],
          )
        ).values;
        const next = {
          ...original,
          dicePresentation: "hidden",
          interactiveDice: true,
          showDc: true,
          language: "en",
          storyStructure: "sandbox",
        };
        await mutation("settings.save", first.id, next, 1);
        const stored = (
          await one(
            "select values from public.rpg_settings where campaign_id=$1",
            [first.id],
          )
        ).values;
        assert.equal(stored.interactiveDice, true);
        assert.equal(stored.showDc, true);
        assert.equal(
          (await one("select language from public.rpg_preferences")).language,
          "ru",
        );
        assert.equal(
          (
            await one(
              "select values from public.rpg_settings where campaign_id=$1",
              [second.id],
            )
          ).values.storyStructure,
          "balanced",
        );
        await assert.rejects(
          mutation(
            "settings.save",
            first.id,
            { ...next, campaign_id: second.id },
            2,
          ),
          /rpg_validation/,
        );
        await assert.rejects(
          mutation(
            "settings.save",
            first.id,
            { ...next, interactiveDice: "true" },
            2,
          ),
          /rpg_validation/,
        );
      },
    );
    await t.test(
      "scenes retain effective settings revision and resume links require the same campaign/session",
      async () => {
        sessionA = await mutation("session.save", first.id, {
          title: "Synthetic watch",
          status: "open",
          recap: "Owner-written recap",
        });
        sceneA = await mutation("scene.save", first.id, {
          session_id: sessionA.id,
          title: "Arrival",
          body: "Owner-written scene",
          role: "narration",
        });
        assert.equal(
          (
            await one(
              "select settings_revision from public.rpg_scenes where id=$1",
              [sceneA.id],
            )
          ).settings_revision,
          2,
        );
        const settings = (
          await one(
            "select values from public.rpg_settings where campaign_id=$1",
            [first.id],
          )
        ).values;
        await mutation(
          "settings.save",
          first.id,
          { ...settings, playerRole: "significant" },
          2,
        );
        await mutation(
          "scene.save",
          first.id,
          {
            id: sceneA.id,
            session_id: sessionA.id,
            title: "Corrected arrival",
            body: "Owner correction",
            role: "note",
          },
          1,
        );
        assert.equal(
          (
            await one(
              "select settings_revision from public.rpg_scenes where id=$1",
              [sceneA.id],
            )
          ).settings_revision,
          2,
        );
        await mutation(
          "state.save",
          first.id,
          {
            summary: "Saved watch",
            current_session_id: sessionA.id,
            current_scene_id: sceneA.id,
            current_location_id: null,
          },
          1,
        );
        await assert.rejects(
          mutation("scene.save", second.id, {
            session_id: sessionA.id,
            title: "Wrong",
            body: "",
            role: "note",
          }),
          /foreign key/,
        );
        const session2 = await mutation("session.save", first.id, {
          title: "Other session",
          status: "open",
          recap: "",
        });
        await assert.rejects(
          mutation(
            "state.save",
            first.id,
            {
              summary: "Wrong session",
              current_session_id: session2.id,
              current_scene_id: sceneA.id,
              current_location_id: null,
            },
            2,
          ),
          /foreign key/,
        );
      },
    );
    await t.test(
      "entity, storage, and item records enforce campaign scope and equipment compatibility",
      async () => {
        entityA = await mutation(
          "entity.save",
          first.id,
          person("Synthetic Neri"),
        );
        entityB = await mutation(
          "entity.save",
          second.id,
          person("Synthetic Olan"),
        );
        storageA = await mutation("storage.save", first.id, {
          name: "Neri pack",
          kind: "player",
          entity_id: entityA.id,
        });
        storageB = await mutation("storage.save", second.id, {
          name: "Olan pack",
          kind: "player",
          entity_id: entityB.id,
        });
        const input = {
          name: "Survey tool",
          category: "tool",
          quantity: 1,
          description: "Invented",
          mechanics: "Manual entry",
          owner_entity_id: null,
          storage_id: storageA.id,
          equipped_entity_id: entityA.id,
          equipped_slot: "hand",
        };
        const request = randomUUID();
        itemA = await mutation("item.save", first.id, input, 0, request);
        assert.deepEqual(
          await mutation("item.save", first.id, input, 0, request),
          itemA,
        );
        await assert.rejects(
          mutation("item.save", first.id, { ...input, name: "Duplicate slot" }),
          /unique constraint/,
        );
        await assert.rejects(
          mutation(
            "item.save",
            first.id,
            { ...input, id: itemA.id, storage_id: storageB.id },
            1,
          ),
          /rpg_validation|foreign key/,
        );
        await assert.rejects(
          mutation(
            "item.save",
            first.id,
            { ...input, id: itemA.id, owner_entity_id: entityB.id },
            1,
          ),
          /foreign key/,
        );
        await assert.rejects(
          mutation(
            "item.save",
            first.id,
            { ...input, id: itemA.id, category: "armor" },
            1,
          ),
          /rpg_validation/,
        );
        await assert.rejects(
          mutation(
            "item.save",
            first.id,
            { ...input, id: itemA.id, quantity: 0 },
            1,
          ),
          /check constraint/,
        );
        await assert.rejects(
          mutation(
            "item.save",
            first.id,
            { ...input, id: itemA.id, quantity: 1.5 },
            1,
          ),
          /rpg_validation/,
        );
        await assert.rejects(
          mutation(
            "item.save",
            first.id,
            { ...input, id: itemA.id, equipped_slot: null },
            1,
          ),
          /rpg_validation|check constraint/,
        );
        await assert.rejects(
          mutation(
            "entity.save",
            first.id,
            {
              ...person("Synthetic Neri"),
              id: entityA.id,
              equipment_slots: [],
            },
            1,
          ),
          /rpg_validation/,
        );
        await assert.rejects(
          mutation(
            "storage.save",
            first.id,
            { id: storageA.id, name: "Camp", kind: "camp", entity_id: null },
            1,
          ),
          /rpg_validation/,
        );
        assert.equal(
          (
            await one("select revision from public.rpg_items where id=$1", [
              itemA.id,
            ])
          ).revision,
          1,
        );
      },
    );
    await t.test(
      "manual corrections are atomic and stale retries cannot apply a second effect",
      async () => {
        const item = await one(
          "select name,category,quantity,description,mechanics,owner_entity_id,storage_id,equipped_entity_id,equipped_slot from public.rpg_items where id=$1",
          [itemA.id],
        );
        const request = randomUUID();
        const saved = await mutation(
          "item.save",
          first.id,
          { ...item, id: itemA.id, quantity: 2 },
          1,
          request,
        );
        assert.equal(saved.revision, 2);
        assert.deepEqual(
          await mutation(
            "item.save",
            first.id,
            { ...item, id: itemA.id, quantity: 2 },
            1,
            request,
          ),
          saved,
        );
        await assert.rejects(
          mutation(
            "item.save",
            first.id,
            { ...item, id: itemA.id, quantity: 3 },
            1,
          ),
          /rpg_conflict/,
        );
        assert.equal(
          (
            await one("select quantity from public.rpg_items where id=$1", [
              itemA.id,
            ])
          ).quantity,
          2,
        );
        assert.equal(
          (
            await one(
              "select count(*)::int as count from public.rpg_items where campaign_id=$1",
              [second.id],
            )
          ).count,
          0,
        );
      },
    );
    await t.test(
      "unknown operations and injected private or scope fields are rejected",
      async () => {
        for (const operation of [
          "combat.resolve",
          "rest.complete",
          "dice.roll",
          "recipe.cook",
          "private.read",
        ])
          await assert.rejects(
            mutation(operation, first.id, {}),
            /rpg_validation/,
          );
        await assert.rejects(
          mutation("entity.save", first.id, {
            ...person("Bad"),
            dm_private: privateMarker,
          }),
          /rpg_validation/,
        );
        await assert.rejects(
          mutation("entity.save", first.id, {
            ...person("Bad"),
            campaign_id: second.id,
          }),
          /rpg_validation/,
        );
        await assert.rejects(
          mutation("entity.save", first.id, { ...person("Bad"), name: 123 }),
          /rpg_validation/,
        );
      },
    );
    await t.test(
      "sign-out/non-owner reads remain denied after durable writes",
      async () => {
        await role("authenticated", outsider);
        for (const table of [
          "rpg_campaigns",
          "rpg_documents",
          "rpg_items",
          "rpg_scenes",
          "rpg_settings_revisions",
        ])
          assert.deepEqual(
            (await db.query(`select * from public.${table}`)).rows,
            [],
          );
        await role("authenticated", owner);
        assert.equal(
          (await one("select count(*)::int as count from public.rpg_campaigns"))
            .count,
          2,
        );
        assert.equal(
          (
            await one(
              "select current_scene_id from public.rpg_public_state where campaign_id=$1",
              [first.id],
            )
          ).current_scene_id,
          sceneA.id,
        );
      },
    );
  } finally {
    await db.close();
  }
});
