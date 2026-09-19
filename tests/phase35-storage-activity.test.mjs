import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fixture, world, commitEvent } from "./phase35-storage-fixture.mjs";

test("Phase 3.5 rest/encounter/effects/provenance exact restoration and opaque authored JSON", async () => {
  const f = await fixture();
  try {
    const w = await world(f);
    await f.one(
      'update public.rpg_entities set resources=\'{"campaignId":4,"focus":3}\',stats=\'{"campaignId":2,"skill":2}\' where id=$1',
      [w.hero],
    );
    await f.one(
      'update rpg_private.dm_state set contents=\'{"campaignId":"opaque","fact":{"campaignId":"literal"}}\' where campaign_id=$1',
      [w.cid],
    );
    const event = await commitEvent(f, w);
    const rest = randomUUID(),
      recipe = randomUUID(),
      effect = randomUUID(),
      encounter = randomUUID(),
      participant = randomUUID(),
      pending = randomUUID(),
      provenance = randomUUID();
    await f.one(
      "insert into public.rpg_rest_records(id,campaign_id,kind,status,settings_revision,public_outcome) values($1,$2,'long','planned',2,$3)",
      [
        rest,
        w.cid,
        {
          participantIds: [w.hero],
          startedAtMinutes: 0,
          campaignId: "opaque-rest",
        },
      ],
    );
    await f.one(
      "insert into public.rpg_recipes(id,campaign_id,name,ingredients,effect_definition) values($1,$2,'Synthetic meal','[]','{\"campaignId\":\"opaque-recipe\"}')",
      [recipe, w.cid],
    );
    await f.one(
      "insert into public.rpg_effects(id,campaign_id,entity_id,recipe_id,definition) values($1,$2,$3,$4,$5)",
      [
        effect,
        w.cid,
        w.hero,
        recipe,
        {
          kind: "meal",
          status: "active",
          creatingRestId: rest,
          remaining: 1,
          campaignId: "opaque-effect",
        },
      ],
    );
    await f.one(
      "insert into public.rpg_encounters(id,campaign_id,status,round,settings_revision,public_summary) values($1,$2,'active',2,2,'Synthetic encounter')",
      [encounter, w.cid],
    );
    await f.one(
      'insert into public.rpg_encounter_participants(id,campaign_id,encounter_id,entity_id,public_name,turn_order,public_position,public_resources) values($1,$2,$3,$4,\'Ari\',1,\'{"position":"cover"}\',\'{"action":0,"reaction":1,"move":1}\')',
      [participant, w.cid, encounter, w.hero],
    );
    await f.one(
      "insert into public.rpg_pending_actions(id,campaign_id,encounter_id,participant_id,status,public_proposal) values($1,$2,$3,$4,'confirmed','{\"action\":\"defend\"}')",
      [pending, w.cid, encounter, participant],
    );
    await f.one(
      'insert into public.rpg_provenance(id,campaign_id,operation_id,session_id,inputs,"outputItemIds") values($1,$2,$3,$4,$5,$6)',
      [
        provenance,
        w.cid,
        event.input.operationId,
        w.sid,
        [{ itemId: w.item, quantity: 1, role: "retained" }],
        [],
      ],
    );
    const saved = await f.saves(
      w.cid,
      "create",
      await f.command(w.cid, { kind: "manual", name: "Exact activity point" }),
    );
    const before = await f.runtime(w.cid, "play");
    await f.one(
      "update public.rpg_rest_records set status='complete' where id=$1",
      [rest],
    );
    await f.one(
      'update public.rpg_effects set definition=\'{"status":"expired"}\' where id=$1',
      [effect],
    );
    await f.one(
      "update public.rpg_encounters set status='ended',round=4,outcome='escape' where id=$1",
      [encounter],
    );
    await f.one(
      'update public.rpg_encounter_participants set public_resources=\'{"action":1,"reaction":0,"move":0}\' where id=$1',
      [participant],
    );
    await f.saves(
      w.cid,
      "load",
      await f.command(w.cid, {
        saveId: saved.saveId,
        label: "Preserved activities",
        recovery: false,
      }),
    );
    const after = await f.runtime(w.cid, "play");
    const strip = (v) =>
      Array.isArray(v)
        ? v.map(strip)
        : v && typeof v === "object"
          ? Object.fromEntries(
              Object.entries(v)
                .filter(([k]) => k !== "timeline")
                .map(([k, value]) => [k, strip(value)]),
            )
          : v;
    for (const field of [
      "restRecords",
      "recipes",
      "effects",
      "encounters",
      "participants",
      "pendingActions",
      "provenance",
    ])
      assert.deepEqual(strip(after[field]), strip(before[field]));
    const source = await f.memory(w.cid, "source", { mode: "game" });
    assert.deepEqual(
      source.snapshot.entities.find((e) => e.id === w.hero).resources,
      { campaignId: 4, focus: 3 },
    );
    assert.deepEqual(source.privateState, {
      campaignId: "opaque",
      fact: { campaignId: "literal" },
    });
    assert.equal(after.effects[0].definition.campaignId, "opaque-effect");
    assert.equal(after.effects[0].definition.timeline, undefined);
  } finally {
    await f.db.close();
  }
});
