import test from "node:test";
import assert from "node:assert/strict";
import {
  testOptIn,
  testConfig,
  testClient,
  signInTestOwner,
  seedSynthetic,
  apply,
} from "../scripts/persistence-fixtures.mjs";

test(
  "live disposable Supabase Auth/PostgREST persistence checks (explicit opt-in)",
  { skip: process.env.RPG_ALLOW_DISPOSABLE_TESTS !== testOptIn },
  async () => {
    const config = testConfig();
    assert.ok(
      process.env.RPG_TEST_NONOWNER_EMAIL &&
        process.env.RPG_TEST_NONOWNER_PASSWORD,
      "Configure a separate synthetic non-owner test account.",
    );
    const anonymous = testClient(config);
    assert.ok((await anonymous.from("rpg_campaigns").select("id")).error);
    const other = testClient(config);
    assert.equal(
      (
        await other.auth.signInWithPassword({
          email: process.env.RPG_TEST_NONOWNER_EMAIL,
          password: process.env.RPG_TEST_NONOWNER_PASSWORD,
        })
      ).error,
      null,
    );
    assert.equal((await other.rpc("rpg_is_owner")).data, false);
    assert.deepEqual((await other.from("rpg_campaigns").select("id")).data, []);
    await assert.rejects(
      apply(other, "campaign.create", null, {
        title: "Denied",
        subtitle: "",
        language: "en",
      }),
    );
    const owner = await signInTestOwner(config);
    const [a, b] = await seedSynthetic(owner);
    const cid = a.campaign.id;
    const guideBefore = await owner
      .from("rpg_dm_guides")
      .select("document_id")
      .eq("campaign_id", cid)
      .single();
    assert.equal(guideBefore.error, null);
    const feedbackRequest = crypto.randomUUID();
    const feedbackBody = "Literal synthetic feedback. Не менять здоровье.";
    const feedback = await apply(
      owner,
      "feedback.send",
      cid,
      { body: feedbackBody },
      0,
      feedbackRequest,
    );
    assert.deepEqual(
      await apply(
        owner,
        "feedback.send",
        cid,
        { body: feedbackBody },
        0,
        feedbackRequest,
      ),
      feedback,
    );
    assert.deepEqual(
      (await other.from("rpg_dm_feedback").select("id")).data,
      [],
    );
    assert.equal(
      (
        await owner
          .from("rpg_dm_feedback")
          .select("id")
          .eq("campaign_id", b.campaign.id)
      ).data.length,
      0,
    );
    assert.equal(
      (
        await owner
          .from("rpg_documents")
          .select("revision")
          .eq("id", guideBefore.data.document_id)
          .single()
      ).data.revision,
      1,
    );
    const requestId = crypto.randomUUID();
    const p = {
      id: a.document.id,
      title: "Edited synthetic notes",
      status: "reference",
      body: "Second invented document version",
    };
    const versions = await owner
      .from("rpg_document_versions")
      .select("id")
      .eq("document_id", a.document.id)
      .order("version");
    const saved = await apply(owner, "document.save", cid, p, 1, requestId);
    assert.deepEqual(
      await apply(owner, "document.save", cid, p, 1, requestId),
      saved,
    );
    await assert.rejects(apply(owner, "document.save", cid, p, 1));
    assert.equal(
      (
        await apply(
          owner,
          "document.restore",
          cid,
          { id: a.document.id, versionId: versions.data[0].id },
          2,
        )
      ).revision,
      3,
    );
    assert.equal(
      (
        await owner
          .from("rpg_document_versions")
          .select("id")
          .eq("document_id", a.document.id)
      ).data.length,
      3,
    );
    const record = (
      await owner
        .from("rpg_items")
        .select(
          "name,category,quantity,description,mechanics,owner_entity_id,storage_id,equipped_entity_id,equipped_slot",
        )
        .eq("id", a.item.id)
        .single()
    ).data;
    await assert.rejects(
      apply(
        owner,
        "item.save",
        cid,
        { ...record, id: a.item.id, storage_id: b.storage.id },
        1,
      ),
    );
    assert.ok(
      (
        await owner
          .from("rpg_items")
          .update({ quantity: 100 })
          .eq("id", a.item.id)
      ).error,
    );
    assert.ok(
      (await owner.schema("rpg_private").from("dm_state").select("*")).error,
    );
    for (const operation of ["dice.roll", "combat.resolve", "rest.complete"])
      await assert.rejects(apply(owner, operation, cid, {}));
    const settings = (
      await owner
        .from("rpg_settings")
        .select("values")
        .eq("campaign_id", cid)
        .single()
    ).data.values;
    await apply(
      owner,
      "settings.save",
      cid,
      {
        ...settings,
        dicePresentation: "hidden",
        interactiveDice: true,
        showDc: true,
      },
      1,
    );
    await apply(owner, "preferences.save", null, {
      language: "ru",
      largeText: false,
      suggestions: false,
    });
    await owner.auth.signOut({ scope: "local" });
    assert.ok((await owner.from("rpg_campaigns").select("id")).error);
    const relogin = await signInTestOwner(config);
    assert.equal(
      (await relogin.from("rpg_campaigns").select("id")).data.length,
      2,
    );
    assert.equal(
      (
        await relogin
          .from("rpg_dm_feedback")
          .select("body")
          .eq("id", feedback.id)
          .single()
      ).data.body,
      feedbackBody,
    );
    assert.equal(
      (
        await relogin
          .from("rpg_scenes")
          .select("settings_revision")
          .eq("id", a.scene.id)
          .single()
      ).data.settings_revision,
      1,
    );
    assert.equal(
      (
        await relogin
          .from("rpg_public_state")
          .select("current_scene_id")
          .eq("campaign_id", cid)
          .single()
      ).data.current_scene_id,
      a.scene.id,
    );
    assert.equal(
      (
        await relogin
          .from("rpg_settings")
          .select("values")
          .eq("campaign_id", b.campaign.id)
          .single()
      ).data.values.dicePresentation,
      "key-rolls",
    );
    assert.deepEqual((await other.from("rpg_documents").select("id")).data, []);
    await Promise.all([
      relogin.auth.signOut({ scope: "local" }),
      other.auth.signOut({ scope: "local" }),
    ]);
  },
);
