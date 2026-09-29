import test from "node:test";
import assert from "node:assert/strict";
import { setup, examples, usage } from "./universal-bootstrap-fixture.mjs";
import { randomUUID, createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createBootstrapService } from "../src/lib/adventures/bootstrap-service.ts";
import {
  initialCreationReview,
  initialOpeningReview,
} from "../src/lib/adventures/bootstrap-validation.ts";
import {
  newHeroAttempt,
  versionAdventureAttempt,
} from "../src/lib/adventures/client.ts";
import { parseWorldState } from "../src/lib/world/validation.ts";
for (const [kind, example] of Object.entries(examples))
  test(`Bootstrap ${kind}: reviewed no-HP protagonist to public playable Adventure`, async () => {
    const f = await setup(example);
    try {
      await f.create();
      const before = await f.snapshot();
      assert.equal(before.entities[0].hp, null);
      assert.deepEqual(before.entities[0].stats, {});
      assert.deepEqual(before.entities[0].equipment_slots, []);
      const started = await f.startOpening(),
        s = await f.snapshot();
      assert.equal(
        started.snapshot.activeAdventureId,
        f.start.input.adventureId,
      );
      assert.equal(
        s.locations.find((l) => l.id === s.publicState.current_location_id)
          .name,
        example.location,
      );
      assert.equal(
        s.scenes.find((l) => l.id === s.publicState.current_scene_id).body,
        example.narration,
      );
      assert.equal(s.quests.length, 0);
      assert.deepEqual(s.items, before.items);
      assert.equal(f.calls, 2);
      const foundation = await f.one(
        "select world,loop_state from rpg_private.world_foundations where campaign_id=$1",
        [f.cid],
      );
      parseWorldState(foundation.world, f.cid);
      assert.equal(
        foundation.world.actors.filter((a) => a.entityId === f.hero).length,
        1,
      );
      assert.equal(
        foundation.world.actors.find((a) => a.entityId === f.hero).control,
        "player",
      );
      assert.equal(
        foundation.world.actors.find((a) => a.entityId === f.hero).locationId,
        s.publicState.current_location_id,
      );
      assert.equal(s.entities.filter((e) => e.name === example.name).length, 1);
      assert.equal(
        s.entities.filter((e) => e.name === example.npc && e.kind === "npc")
          .length,
        1,
      );
      assert.deepEqual(foundation.world.threads, []);
      assert.equal(foundation.loop_state.progression, "off");
      assert.deepEqual(foundation.loop_state.rewards, []);
      assert.equal(
        await f
          .one(
            "select count(*) n from rpg_private.dm_state where campaign_id=$1",
            [f.cid],
          )
          .then((r) => r.n),
        0,
      );
      const original = await f.one(
        "select event from rpg_private.world_events where campaign_id=$1 and event->>'kind'='campaign.bootstrap.created'",
        [f.cid],
      );
      assert.deepEqual(original.event.payload.original.output, f.creation);
      if (kind === "orbital")
        assert.doesNotMatch(
          JSON.stringify(s),
          /sword|crowns|medieval|fighter/i,
        );
    } finally {
      await f.db.close();
    }
  });

test("Owner correction is immutable, no-humanoid slots or level; new explicit possessions reuse ordinary inventory", async () => {
  const example = {
    ...examples.orbital,
    name: "Lattice",
    description:
      "A distributed non-humanoid maintenance swarm. I know careful observation. I cannot leave the station. I hold 7 charge.",
    caps: ["careful observation"],
    limits: ["cannot leave the station"],
    item: undefined,
  };
  const f = await setup(example);
  try {
    f.creation.resources = [
      { key: "charge", label: "charge", amount: 7, quote: example.description },
    ];
    const review = initialCreationReview(f.input, f.creation);
    review.name = "Lattice Nine";
    review.limitations.push("No teleportation");
    review.possessions.push({
      name: "inspection probe",
      description: "Owner-added initial possession",
      quantity: 1,
    });
    await f.create(review);
    const s = await f.snapshot();
    assert.equal(s.entities[0].name, "Lattice Nine");
    assert.equal(s.entities[0].hp, null);
    assert.deepEqual(s.entities[0].equipment_slots, []);
    assert.deepEqual(s.entities[0].resources, { charge: 7 });
    assert.equal(s.items[0].mechanics, "");
    assert.equal(s.items[0].category, "possession");
    const event = (
      await f.one(
        "select event from rpg_private.world_events where campaign_id=$1 and event->>'kind'='campaign.bootstrap.created'",
        [f.cid],
      )
    ).event;
    assert.deepEqual(event.payload.original.output, f.creation);
    assert.deepEqual(event.payload.review, review);
    assert.equal(event.payload.classification, "owner_authored_protagonist");
  } finally {
    await f.db.close();
  }
});

test("Exact proposal and commit replay after lost response never makes another AI request or duplicates rows/checkpoints", async () => {
  const f = await setup();
  try {
    const draft = await f.service.perform({
      action: "creation.propose",
      input: f.input,
    });
    const replay = createBootstrapService(
      f.rpc,
      () => assert.fail("No replay provider"),
      () => assert.fail("No profile re-resolution on replay"),
    );
    assert.deepEqual(
      await replay.perform({ action: "creation.propose", input: f.input }),
      draft,
    );
    await f.create();
    const heroResult = await replay.perform(f.creationCommit);
    assert.equal(heroResult.campaignId, f.cid);
    await f.startOpening();
    const before = await f.snapshot(),
      head = await f.fence(f.cid);
    const committed = await replay.perform(f.openingCommit);
    assert.equal(
      committed.snapshot.activeAdventureId,
      f.start.input.adventureId,
    );
    assert.deepEqual(await f.snapshot(), before);
    assert.deepEqual(await f.fence(f.cid), head);
    assert.equal(f.calls, 2);
    await assert.rejects(
      replay.perform({
        ...f.creationCommit,
        input: {
          ...f.creationCommit.input,
          review: { ...f.creationCommit.input.review, name: "Changed replay" },
        },
      }),
      /rpg_conflict/,
    );
  } finally {
    await f.db.close();
  }
});

test("Interrupted/failed proposal reserves once and never automatically reruns generation", async () => {
  const f = await setup();
  try {
    const reserve = await f.rpc("creation.reserve", null, {
      input: f.input,
      profile: f.profile,
    });
    assert.equal(reserve.dispatch, true);
    await assert.rejects(
      f.service.perform({ action: "creation.propose", input: f.input }),
    );
    assert.equal(f.calls, 0);
    await f.rpc("creation.failure", null, { draftId: f.input.requestId });
    await assert.rejects(
      f.service.perform({ action: "creation.propose", input: f.input }),
    );
    assert.equal(f.calls, 0);
    const c = {
      action: "creation.commit",
      input: {
        requestId: randomUUID(),
        draftId: f.input.requestId,
        review: initialCreationReview(f.input, f.creation),
      },
    };
    await assert.rejects(f.service.perform(c));
    assert.equal(
      (await f.query("select * from public.rpg_campaigns")).length,
      0,
    );
  } finally {
    await f.db.close();
  }
});

test("Lost proposal persistence response recovers original immutable result without retrying provider", async () => {
  const f = await setup();
  try {
    let lost = true;
    const rpc = async (a, c, p) => {
      const result = await f.rpc(a, c, p);
      if (a === "creation.result" && lost) {
        lost = false;
        throw new Error("Lost response");
      }
      return result;
    };
    const service = createBootstrapService(
      rpc,
      async () => {
        f.calls++;
        return {
          output: f.creation,
          usage: {
            model: "gpt-6-sol",
            inputTokens: 1,
            outputTokens: 2,
            latencyMs: 1,
          },
        };
      },
      async () => f.profile,
    );
    await assert.rejects(
      service.perform({ action: "creation.propose", input: f.input }),
    );
    const draft = await service.perform({
      action: "creation.propose",
      input: f.input,
    });
    assert.deepEqual(draft.proposal, f.creation);
    assert.equal(f.calls, 1);
  } finally {
    await f.db.close();
  }
});

test("Consequential creation unknowns and opening null fields cannot approve by answering prose alone", async () => {
  const f = await setup();
  try {
    f.creation.questions = [
      { question: "How many compasses?", consequential: true },
    ];
    f.creation.possessions[0].quantity = null;
    const d = await f.service.perform({
      action: "creation.propose",
      input: f.input,
    });
    const r = initialCreationReview(f.input, d.proposal);
    r.answers = ["One"];
    await assert.rejects(
      f.rpc("creation.commit", null, {
        requestId: randomUUID(),
        draftId: d.draftId,
        review: r,
      }),
      /rpg_validation/,
    );
    assert.equal(
      (await f.query("select * from public.rpg_campaigns")).length,
      0,
    );
    r.possessions[0].quantity = 1;
    const result = await f.rpc("creation.commit", null, {
      requestId: randomUUID(),
      draftId: d.draftId,
      review: r,
    });
    f.cid = result.campaignId;
    f.opening.location.name = null;
    f.opening.questions = [
      { question: "Where does the Adventure start?", consequential: true },
    ];
    await f.proposeOpening();
    f.openingCommit.input.review.answers = ["Wayside"];
    await assert.rejects(
      f.rpc("opening.commit", f.cid, f.openingCommit.input),
      /rpg_validation/,
    );
    assert.equal((await f.snapshot()).publicState.current_location_id, null);
    f.openingCommit.input.review.location.name = "Wayside";
    await f.service.perform(f.openingCommit);
    assert.ok((await f.snapshot()).publicState.current_location_id);
  } finally {
    await f.db.close();
  }
});

for (const change of ["head", "epoch", "revision", "canon", "guidance"])
  test(`Stale opening review after ${change} fails without partial opening`, async () => {
    const f = await setup();
    try {
      await f.create();
      await f.proposeOpening();
      if (change === "head")
        await f.mutation("session.save", f.cid, {
          title: "Fresh note",
          status: "closed",
          recap: "",
        });
      if (change === "epoch")
        await f.one(
          "update rpg_private.timeline_campaigns set epoch=epoch+1 where campaign_id=$1",
          [f.cid],
        );
      if (change === "revision")
        await f.one(
          "update rpg_private.world_foundations set revision=revision+1 where campaign_id=$1",
          [f.cid],
        );
      if (change === "canon")
        await f.one(
          "update rpg_private.timeline_campaigns set canon_generation=canon_generation+1 where campaign_id=$1",
          [f.cid],
        );
      if (change === "guidance")
        await f.adventures.perform(
          versionAdventureAttempt(
            await f.read(),
            f.start.input.adventureId,
            "edit",
            {
              title: "Changed",
              premise: "Changed owner premise",
              pacing: { kind: "evening", custom: null },
            },
          ),
        );
      const before = await f.snapshot();
      await assert.rejects(f.service.perform(f.openingCommit), /rpg_conflict/);
      assert.deepEqual(await f.snapshot(), before);
      assert.equal((await f.read()).activeAdventureId, null);
    } finally {
      await f.db.close();
    }
  });

test("Failure late in opening transaction rolls back all state and leaves the review reusable", async () => {
  const f = await setup();
  try {
    await f.create();
    await f.proposeOpening();
    const before = await f.snapshot();
    await f.db.exec(
      "create function rpg_private.test_reject_opening() returns trigger language plpgsql as $$begin if new.event->>'kind'='campaign.bootstrap.opening_review' then raise exception 'test_late_failure';end if;return new;end$$;create trigger test_reject after insert on rpg_private.world_events for each row execute function rpg_private.test_reject_opening();",
    );
    await assert.rejects(
      f.service.perform(f.openingCommit),
      /test_late_failure/,
    );
    assert.deepEqual(await f.snapshot(), before);
    assert.equal((await f.read()).activeAdventureId, null);
    await f.db.exec("drop trigger test_reject on rpg_private.world_events");
    await f.service.perform(f.openingCommit);
    assert.equal((await f.snapshot()).locations.length, 1);
  } finally {
    await f.db.close();
  }
});

test("Campaign/owner injection and fabricated execution effects fail closed; sibling projection stays exact", async () => {
  const f = await setup();
  try {
    await f.create();
    const sibling = await f.campaign("Sibling canary"),
      other = await f.saves(sibling, "campaign");
    await f.proposeOpening();
    await assert.rejects(
      f.rpc("opening.commit", sibling, {
        ...f.openingCommit.input,
        campaignId: sibling,
      }),
    );
    await assert.rejects(
      f.rpc(
        "creation.reserve",
        null,
        { input: { ...f.input, requestId: randomUUID() }, profile: f.profile },
        f.other,
      ),
      /rpg_forbidden/,
    );
    const bad = structuredClone(f.openingCommit.input);
    bad.review.actors[0].capabilities = ["world.travel:forged-route"];
    await assert.rejects(f.rpc("opening.commit", f.cid, bad), /rpg_validation/);
    await f.service.perform(f.openingCommit);
    assert.deepEqual(await f.saves(sibling, "campaign"), other);
  } finally {
    await f.db.close();
  }
});

test("Fresh generic opening is public-only; private canary stays off proposal/narration DTO and ordinary continuation resumes", async () => {
  const f = await setup();
  try {
    await f.create();
    await f.one(
      'insert into rpg_private.dm_state(campaign_id,contents) values($1,\'{"plan":"PRIVATE_BOOTSTRAP_CANARY"}\') on conflict(campaign_id) do update set contents=excluded.contents',
      [f.cid],
    );
    await f.proposeOpening();
    assert.doesNotMatch(
      JSON.stringify(f.ticket.context),
      /PRIVATE_BOOTSTRAP_CANARY/,
    );
    assert.doesNotMatch(
      JSON.stringify(f.openingDraft),
      /executionProfile|ownerId|PRIVATE_BOOTSTRAP_CANARY/,
    );
    await f.service.perform(f.openingCommit);
    const before = await f.snapshot();
    await f.adventures.perform(
      versionAdventureAttempt(
        await f.read(),
        f.start.input.adventureId,
        "end",
        { summary: null, review: null },
      ),
    );
    await f.prepare();
    await f.adventures.perform(f.start);
    const next = await f.snapshot();
    assert.deepEqual(next.entities, before.entities);
    assert.deepEqual(next.locations, before.locations);
    assert.equal(f.calls, 2);
  } finally {
    await f.db.close();
  }
});

test("Migration 30 is byte-identical and Basic compatibility remains available after migration31", async () => {
  const bytes = await readFile(
    new URL(
      "../supabase/migrations/202609290030_adventure_playable_opening.sql",
      import.meta.url,
    ),
  );
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    "92f4cf70c40855c48332b6738e2a5921819962d1f2631dc6f22425b720a9ea5b",
  );
  const f = await setup();
  try {
    const result = await f.adventures.performWorld(
      newHeroAttempt(
        { worlds: [f.world], packs: [] },
        f.world.id,
        "Compatibility Fighter",
        "Arlo",
        "en",
      ),
    );
    f.cid = result.campaignId;
    await f.prepare();
    await f.adventures.perform(f.start);
    const s = await f.snapshot();
    assert.ok(s.entities.find((e) => e.id === result.heroId).hp > 0);
    assert.ok(s.publicState.current_location_id);
    assert.equal(f.calls, 0);
  } finally {
    await f.db.close();
  }
});

test("Creation rollback leaves no Campaign, character, inventory or approval receipt and the review can be retried", async () => {
  const f = await setup();
  try {
    const draft = await f.service.perform({
      action: "creation.propose",
      input: f.input,
    });
    const command = {
      action: "creation.commit",
      input: {
        requestId: randomUUID(),
        draftId: draft.draftId,
        review: initialCreationReview(f.input, draft.proposal),
      },
    };
    await f.db.exec(
      "create function rpg_private.test_reject_creation() returns trigger language plpgsql as $$begin if new.event->>'kind'='campaign.bootstrap.created' then raise exception 'test_creation_failure';end if;return new;end$$;create trigger test_reject_creation after insert on rpg_private.world_events for each row execute function rpg_private.test_reject_creation();",
    );
    await assert.rejects(f.service.perform(command), /test_creation_failure/);
    for (const table of [
      "rpg_campaigns",
      "rpg_entities",
      "rpg_items",
      "rpg_storages",
    ])
      assert.equal(
        (await f.one(`select count(*) n from public.${table}`)).n,
        0,
      );
    await f.db.exec(
      "drop trigger test_reject_creation on rpg_private.world_events",
    );
    const created = await f.service.perform(command);
    assert.ok(created.campaignId);
    assert.equal(f.calls, 1);
    assert.deepEqual(await f.service.perform(command), created);
  } finally {
    await f.db.close();
  }
});

test("Exact reservation race permits one dispatch; a changed immutable request cannot reuse it", async () => {
  const f = await setup();
  try {
    const payload = { input: f.input, profile: f.profile };
    const reservations = await Promise.all([
      f.rpc("creation.reserve", null, payload),
      f.rpc("creation.reserve", null, payload),
    ]);
    assert.deepEqual(reservations.map((r) => r.dispatch).sort(), [false, true]);
    assert.equal(f.calls, 0);
    await assert.rejects(
      f.rpc("creation.recover", null, {
        input: { ...f.input, description: "Changed identity" },
      }),
      /rpg_conflict/,
    );
  } finally {
    await f.db.close();
  }
});

test("An unrecorded World version cannot reserve a proposal or dispatch a provider", async () => {
  const f = await setup();
  try {
    await assert.rejects(
      f.service.perform({
        action: "creation.propose",
        input: { ...f.input, worldVersion: 2 },
      }),
      /rpg_not_found/,
    );
    assert.equal(
      (await f.one("select count(*) n from public.rpg_campaigns")).n,
      0,
    );
    assert.equal(f.calls, 0);
  } finally {
    await f.db.close();
  }
});

test("Russian owner text and public opening preserve the reviewed facts, arbitrary body and no mechanics", async () => {
  const example = {
    world: { title: "Орбитальная граница", premise: "Станции у Юпитера." },
    name: "Рой",
    description:
      "Нечеловеческий ремонтный рой. Умею наблюдать. Не могу покинуть станцию.",
    caps: ["наблюдать"],
    limits: ["Не могу покинуть станцию"],
    adventure: "Обычный осмотр причала.",
    location: "Причал",
    situation: "Координатор рядом с публичным табло.",
    npc: "Координатор",
    narration:
      "На причале открыт доступ к публичному табло. Координатор готов поговорить.",
  };
  const f = await setup(example, "ru");
  try {
    await f.create();
    await f.startOpening();
    const s = await f.snapshot(),
      hero = s.entities.find((e) => e.id === f.hero);
    assert.equal(s.campaign.language, "ru");
    assert.equal(hero.name, "Рой");
    assert.deepEqual(hero.equipment_slots, []);
    assert.equal(hero.hp, null);
    assert.equal(s.locations[0].name, "Причал");
    assert.ok(s.scenes.some((x) => x.body === example.narration));
  } finally {
    await f.db.close();
  }
});

test("Immediate scripted opening containing the protagonist fails closed; recovery never redispatches or mutates campaign", async () => {
  const f = await setup({ ...examples.orbital, name: "Nadia Vale" });
  try {
    await f.create();
    await f.prepare();
    const before = await f.snapshot(),
      fence = await f.fence(f.cid);
    f.opening.actors.unshift({
      name: "Nadia Vale",
      description: "An independent cargo pilot.",
      capabilities: ["piloting"],
      limitations: [],
    });
    const command = { action: "opening.propose", input: f.start };
    await assert.rejects(f.service.perform(command));
    assert.equal(f.calls, 2);
    await assert.rejects(f.service.perform(command));
    assert.equal(f.calls, 2);
    assert.deepEqual(await f.snapshot(), before);
    assert.deepEqual(await f.fence(f.cid), fence);
    assert.equal(
      (
        await f.one(
          "select count(*) n from public.rpg_entities where campaign_id=$1",
          [f.cid],
        )
      ).n,
      1,
    );
  } finally {
    await f.db.close();
  }
});
test("Stored legacy protagonist-copy proposal fails both recovered projection and final SQL even after owner removes the copy", async () => {
  const f = await setup({ ...examples.orbital, name: "Nadia Vale" });
  try {
    await f.create();
    await f.prepare();
    const reserved = await f.rpc("opening.reserve", f.cid, {
      input: f.start,
      profile: f.profile,
    });
    const bad = structuredClone(f.opening);
    bad.actors.unshift({
      name: "Nadia Vale",
      description: "A cargo pilot.",
      capabilities: [],
      limitations: [],
    });
    const result = { output: bad, usage };
    await assert.rejects(
      f.rpc("opening.result", f.cid, {
        draftId: f.start.input.requestId,
        result,
      }),
      /rpg_validation/,
    );
    // Simulate an immutable result written by the previous migration31 version.
    // This direct private insertion is test setup, never a browser/API path.
    await f.one(
      "select rpg_private.bootstrap_write_receipt($1,$2,rpg_private.wave4_id($3,'bootstrap:result'),$4::jsonb,$5::jsonb)",
      [
        f.owner,
        f.cid,
        f.start.input.requestId,
        JSON.stringify({
          kind: "opening",
          phase: "result",
          draftId: f.start.input.requestId,
          result,
        }),
        JSON.stringify({ result, failed: false }),
      ],
    );
    const before = await f.snapshot(),
      fence = await f.fence(f.cid);
    const replay = createBootstrapService(
      f.rpc,
      () => assert.fail("No recovery provider"),
      () => assert.fail("No routing change"),
    );
    await assert.rejects(
      replay.perform({ action: "opening.propose", input: f.start }),
    );
    const command = {
      action: "opening.commit",
      input: {
        requestId: randomUUID(),
        campaignId: f.cid,
        draftId: f.start.input.requestId,
        review: {
          ...initialOpeningReview(f.opening),
          publicOpeningConfirmed: true,
        },
      },
    };
    await assert.rejects(replay.perform(command));
    await assert.rejects(
      f.rpc("opening.commit", f.cid, command.input),
      /rpg_validation/,
    );
    assert.deepEqual(await f.snapshot(), before);
    assert.deepEqual(await f.fence(f.cid), fence);
    assert.equal(f.calls, 1);
    assert.equal(reserved.ticket.context.protagonist.name, "Nadia Vale");
    assert.doesNotMatch(
      JSON.stringify(reserved.ticket.context),
      /entityId|ownerId|PRIVATE/,
    );
  } finally {
    await f.db.close();
  }
});
test("SQL final authority rejects manually inserted protagonist copy without partial opening, while genuine NPC and exact retry succeed", async () => {
  const f = await setup({ ...examples.orbital, name: "Nadia Vale" });
  try {
    await f.create();
    await f.proposeOpening();
    const before = await f.snapshot(),
      fence = await f.fence(f.cid);
    for (const name of ["Nadia Vale", "  NADIA   Vale "]) {
      const bad = structuredClone(f.openingCommit.input);
      bad.review.actors[0].name = name;
      await assert.rejects(
        f.service.perform({ action: "opening.commit", input: bad }),
      );
      await assert.rejects(
        f.rpc("opening.commit", f.cid, bad),
        /rpg_validation/,
      );
      assert.deepEqual(await f.snapshot(), before);
      assert.deepEqual(await f.fence(f.cid), fence);
    }
    const valid = await f.service.perform(f.openingCommit),
      after = await f.snapshot();
    assert.equal(
      after.entities.filter((e) => e.name === "Nadia Vale").length,
      1,
    );
    assert.equal(after.entities.filter((e) => e.kind === "npc").length, 1);
    assert.deepEqual(await f.service.perform(f.openingCommit), valid);
    assert.deepEqual(await f.snapshot(), after);
    assert.equal(f.calls, 2);
  } finally {
    await f.db.close();
  }
});

test("Unasked null possession quantity and resource amount cannot commit in service or SQL; manual six and zero preserve the original proposal", async () => {
  const example = {
    ...examples.fantasy,
    description:
      examples.fantasy.description +
      " I carry charcoal pencils and hold charge.",
    item: "charcoal pencils",
  };
  const f = await setup(example);
  try {
    f.creation.possessions[0].quantity = null;
    f.creation.resources = [
      {
        key: "charge",
        label: "charge",
        amount: null,
        quote: example.description,
      },
    ];
    const draft = await f.service.perform({
      action: "creation.propose",
      input: f.input,
    });
    const command = {
      action: "creation.commit",
      input: {
        requestId: randomUUID(),
        draftId: draft.draftId,
        review: initialCreationReview(f.input, draft.proposal),
      },
    };
    await assert.rejects(f.service.perform(command));
    await assert.rejects(
      f.rpc("creation.commit", null, command.input),
      /rpg_validation/,
    );
    command.input.review.possessions[0].quantity = 6;
    await assert.rejects(f.service.perform(command));
    await assert.rejects(
      f.rpc("creation.commit", null, command.input),
      /rpg_validation/,
    );
    assert.equal(
      (await f.one("select count(*) n from public.rpg_campaigns")).n,
      0,
    );
    command.input.review.resources[0].amount = 0;
    const created = await f.service.perform(command);
    f.cid = created.campaignId;
    const snapshot = await f.snapshot();
    assert.equal(snapshot.items[0].quantity, 6);
    assert.deepEqual(snapshot.entities[0].resources, { charge: 0 });
    const event = (
      await f.one(
        "select event from rpg_private.world_events where campaign_id=$1 and event->>'kind'='campaign.bootstrap.created'",
        [f.cid],
      )
    ).event;
    assert.equal(event.payload.original.output.possessions[0].quantity, null);
    assert.equal(event.payload.original.output.resources[0].amount, null);
    assert.deepEqual(event.payload.review, command.input.review);
    assert.equal(f.calls, 1);
  } finally {
    await f.db.close();
  }
});
