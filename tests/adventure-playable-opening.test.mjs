import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fixture } from "./phase35-storage-fixture.mjs";
import { createAdventureService } from "../src/lib/adventures/service.ts";
import {
  createWorldAttempt,
  newHeroAttempt,
  prepareAdventureAttempt,
  versionAdventureAttempt,
} from "../src/lib/adventures/client.ts";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { runTurn } from "../src/lib/gameplay/turn-engine.ts";

async function setup(prefix = 30, language = "en") {
  const f = await fixture(prefix);
  const invoke = async (args) => {
    try {
      return {
        data: (
          await f.one(
            "select public.rpg_adventures($1,$2,$3,$4::jsonb,$5::jsonb) result",
            [
              args.p_owner_id,
              args.p_campaign_id,
              args.p_action,
              JSON.stringify(args.p_payload),
              args.p_timeline === null ? null : JSON.stringify(args.p_timeline),
            ],
          )
        ).result,
      };
    } catch (e) {
      return { error: { code: e.code, message: e.message } };
    }
  };
  f.service = createAdventureService(f.owner, invoke);
  f.read = async (cid) => f.service.read(cid, await f.fence(cid));
  f.world = (
    await f.service.performWorld(
      createWorldAttempt(await f.service.worlds(), {
        title: "Simple classic fantasy",
        premise:
          "A simple classic fantasy world. Ordinary people, settlements and open choices. No predetermined hidden truth.",
        packVersionIds: [],
      }),
    )
  ).world;
  f.newHero = async (lang = language) =>
    f.service.performWorld(
      newHeroAttempt(
        { worlds: [f.world], packs: [] },
        f.world.id,
        "Synthetic P0A hero",
        "Ari",
        lang,
      ),
    );
  const hero = await f.newHero();
  f.cid = hero.campaignId;
  f.heroId = hero.heroId;
  const prepared = await f.service.perform(
    prepareAdventureAttempt(await f.read(f.cid), {
      title: "Ordinary paid work",
      premise:
        "An unknown ordinary Level 1 Fighter wants ordinary plausible paid work. Preserve freedom to refuse or explore; do not make the hero famous, chosen or central. Do not pre-author a hidden truth, culprit, villain, twist or correct route.",
      pacing: { kind: "evening", custom: null },
    }),
  );
  f.start = versionAdventureAttempt(
    prepared.snapshot,
    prepared.snapshot.adventures[0].id,
    "start",
  );
  f.snapshot = () => f.saves(f.cid, "campaign");
  f.core = async () => ({
    hero: await f.one(
      "select * from public.rpg_entities where campaign_id=$1 and id=$2",
      [f.cid, f.heroId],
    ),
    items: await f.query(
      "select * from public.rpg_items where campaign_id=$1 order by id",
      [f.cid],
    ),
    loop: await f.one(
      "select loop_state from rpg_private.world_foundations where campaign_id=$1",
      [f.cid],
    ),
    private: await f.query(
      "select * from rpg_private.dm_state where campaign_id=$1",
      [f.cid],
    ),
    time: (
      await f.one(
        "select world_minutes from rpg_private.runtime_state where campaign_id=$1",
        [f.cid],
      )
    ).world_minutes,
  });
  return f;
}

test("P0A reproduction: accepted migration29 activates metadata but leaves New Hero without a current location", async () => {
  const f = await setup(29);
  try {
    await f.service.perform(f.start);
    const s = await f.snapshot();
    assert.equal(s.publicState.current_location_id, null);
    assert.equal(s.locations.length, 0);
    assert.equal(s.entities.length, 1);
    assert.equal(s.scenes.length, 1);
    assert.equal(
      (await f.read(f.cid)).activeAdventureId,
      f.start.input.adventureId,
    );
  } finally {
    await f.db.close();
  }
});

test("P0A fresh World / New Hero / Evening Start commits a public playable opening with no outcomes or hidden plot", async () => {
  const f = await setup();
  try {
    const before = await f.core(),
      prior = await f.snapshot();
    assert.equal(prior.publicState.current_location_id, null);
    const result = await f.service.perform(f.start),
      s = await f.snapshot();
    assert.equal(result.snapshot.activeAdventureId, f.start.input.adventureId);
    const place = s.locations.find(
        (x) => x.id === s.publicState.current_location_id,
      ),
      scene = s.scenes.find((x) => x.id === s.publicState.current_scene_id),
      npc = s.entities.find((x) => x.kind === "npc");
    assert.ok(place && scene && npc);
    assert.equal(place.status, "visited");
    assert.equal(scene.role, "narration");
    assert.equal(scene.session_id, s.publicState.current_session_id);
    assert.match(scene.body, /paid work/);
    assert.match(scene.body, /unfamiliar adventurer/);
    assert.equal(scene.body, s.publicState.summary);
    assert.equal(result.snapshot.adventures[0].start.sceneId, scene.id);
    assert.equal(result.snapshot.adventures[0].start.worldMinutes, 0);
    assert.deepEqual(await f.core(), before);
    assert.equal(s.quests.length, 0);
    assert.equal(
      s.scenes.find((x) => x.id === prior.scenes[0].id).body,
      prior.scenes[0].body,
    );
    const world = (
      await f.one(
        "select world from rpg_private.world_foundations where campaign_id=$1",
        [f.cid],
      )
    ).world;
    assert.deepEqual(world.threads, []);
    assert.deepEqual(world.hooks, []);
    assert.deepEqual(world.warnings, []);
    assert.ok(world.actors.every((x) => x.locationId === place.id));
    assert.equal(world.actors.find((x) => x.id === f.heroId).control, "player");
    const event = (
      await f.one(
        "select event from rpg_private.world_events where campaign_id=$1 and event->>'kind'='adventure.opening'",
        [f.cid],
      )
    ).event;
    assert.equal(event.visibility, "public");
    assert.equal(event.payload.classification, "campaign_authored_opening");
    assert.deepEqual(event.evidence, []);
    assert.deepEqual(event.threadIds, []);
    assert.doesNotMatch(
      scene.body + " " + npc.details,
      /culprit|villain|betrayal|chosen one|supernatural|secret identity/i,
    );
    assert.ok(
      await f.one(
        "select rpg_private.lab_validate_manifest(campaign_id,head_manifest_id) result from rpg_private.timelines where campaign_id=$1 and id=$2",
        [f.cid, result.snapshot.timeline.timelineId],
      ),
    );
  } finally {
    await f.db.close();
  }
});

test("P0A natural first actions run through production parser, mechanics, RPC settlement and public narration with established facts", async () => {
  const f = await setup();
  try {
    await f.service.perform(f.start);
    let calls = 0;
    const store = createRpcTurnStore(
      f.owner,
      async (args) => {
        try {
          return {
            data: (
              await f.one(
                "select public.rpg_runtime($1,$2,$3,$4::jsonb,$5::jsonb) result",
                [
                  args.p_owner_id,
                  args.p_campaign_id,
                  args.p_action,
                  JSON.stringify(args.p_payload),
                  JSON.stringify(args.p_timeline),
                ],
              )
            ).result,
          };
        } catch (e) {
          return { data: null, error: { code: e.code, message: e.message } };
        }
      },
      "scripted-only",
      await f.fence(f.cid),
    );
    const usage = {
      model: "scripted-only",
      inputTokens: 0,
      outputTokens: 0,
      calls: 0,
      latencyMs: 0,
    };
    const provider = {
      async plan(source) {
        calls++;
        assert.ok(
          source.snapshot.locations.some(
            (l) => l.id === source.snapshot.publicState.current_location_id,
          ),
        );
        assert.ok(source.snapshot.entities.some((e) => e.kind === "npc"));
        assert.match(source.snapshot.publicState.summary, /paid work/);
        assert.match(source.adventureContext.premise, /unknown ordinary/);
        return {
          usage,
          output: {
            narration:
              "Observe the existing public room or discuss the already offered work. No decision is made for Ari.",
            checks: [],
            publicPatches: [],
            privatePatches: [],
            visualDescription: "",
            clarification: null,
            guidanceProposal: null,
          },
        };
      },
      async narrate(source, input) {
        calls++;
        assert.deepEqual(source.privateState, {});
        return {
          usage,
          output: {
            narration:
              input.input === "I look around"
                ? "The work organiser and notices table are in the public meeting room."
                : "The work organiser explains that help carrying and checking ordinary supplies is available; you may discuss terms without committing to the job.",
            visualDescription: "",
            clarification: null,
          },
        };
      },
      feedback() {
        assert.fail("No feedback/model service is used for bootstrap.");
      },
    };
    // Source loading may initialize an empty private row. Its contents must stay
    // empty; the strict Start-only preservation proof is in the preceding test.
    const core = await f.core();
    assert.ok(
      core.private.every((row) => Object.keys(row.contents).length === 0),
    );
    for (const input of ["I look around", "I ask about paid work"]) {
      const play = await store.readPlay(f.cid);
      const result = await runTurn(
        {
          operationId: randomUUID(),
          campaignId: f.cid,
          expectedRevision: play.revision,
          timeline: play.timeline,
          mode: "game",
          input,
          companionId: null,
          listenerIds: [],
          mechanic: null,
        },
        { store, provider },
      );
      assert.equal(result.status, "committed");
      assert.doesNotMatch(result.narration, /Please clarify/);
      assert.equal(result.failure, null);
    }
    const after = await f.core();
    assert.equal(calls, 4);
    assert.deepEqual({ ...after, private: core.private }, core);
    assert.ok(
      after.private.every((row) => Object.keys(row.contents).length === 0),
    );
  } finally {
    await f.db.close();
  }
});

test("P0A duplicate/lost-response Start and competing callbacks do not duplicate the opening, receipts or time", async () => {
  const f = await setup();
  try {
    const result = await f.service.perform(f.start),
      snapshot = await f.snapshot();
    const replay = await f.service.perform(f.start);
    assert.equal(replay.requestId, result.requestId);
    assert.deepEqual(await f.snapshot(), snapshot);
    const conflict = structuredClone(f.start);
    conflict.input.requestId = randomUUID();
    await assert.rejects(f.service.perform(conflict), { code: "conflict" });
    assert.equal(
      (
        await f.query(
          "select * from rpg_private.world_events where campaign_id=$1 and event->>'kind'='adventure.opening'",
          [f.cid],
        )
      ).length,
      1,
    );
    assert.equal(
      (
        await f.query("select * from rpg_private.world_commands where id=$1", [
          f.start.input.requestId,
        ])
      ).length,
      1,
    );
    assert.equal((await f.core()).time, 0);
  } finally {
    await f.db.close();
  }
});

test("P0A failed opening insertion rolls back location, NPC, activation, receipt and checkpoint atomically", async () => {
  const f = await setup();
  try {
    const before = await f.snapshot(),
      catalog = await f.read(f.cid);
    await f.db.exec(
      "create function rpg_private.synthetic_opening_failure() returns trigger language plpgsql as $$ begin if new.role='narration' then raise exception 'synthetic insertion failure'; end if; return new; end $$; create trigger synthetic_opening_failure before insert on public.rpg_scenes for each row execute function rpg_private.synthetic_opening_failure();",
    );
    await assert.rejects(f.service.perform(f.start));
    assert.deepEqual(await f.snapshot(), before);
    assert.deepEqual(await f.read(f.cid), catalog);
    assert.equal(
      (
        await f.query("select * from rpg_private.world_commands where id=$1", [
          f.start.input.requestId,
        ])
      ).length,
      0,
    );
    await f.db.exec(
      "drop trigger synthetic_opening_failure on public.rpg_scenes; drop function rpg_private.synthetic_opening_failure();",
    );
    await f.service.perform(f.start);
    assert.equal((await f.snapshot()).locations.length, 1);
  } finally {
    await f.db.close();
  }
});

test("P0A save/load preserves exact opening and source campaign isolation; later Adventure resumes existing facts", async () => {
  const f = await setup();
  try {
    const sibling = await f.newHero(),
      siblingBefore = await f.saves(sibling.campaignId, "campaign");
    await f.service.perform(f.start);
    const opened = await f.snapshot();
    assert.deepEqual(
      await f.saves(sibling.campaignId, "campaign"),
      siblingBefore,
    );
    const created = await f.saves(
      f.cid,
      "create",
      await f.command(f.cid, { kind: "manual", name: "P0A opening" }),
    );
    await f.saves(
      f.cid,
      "load",
      await f.command(f.cid, {
        saveId: created.saveId,
        label: "P0A saved opening",
        recovery: false,
      }),
    );
    const restored = await f.snapshot();
    assert.equal(
      restored.publicState.current_location_id,
      opened.publicState.current_location_id,
    );
    assert.equal(
      restored.publicState.current_scene_id,
      opened.publicState.current_scene_id,
    );
    assert.deepEqual(restored.entities, opened.entities);
    assert.deepEqual(restored.locations, opened.locations);
    assert.deepEqual(restored.scenes, opened.scenes);
    const current = await f.read(f.cid);
    await f.service.perform(
      versionAdventureAttempt(current, f.start.input.adventureId, "end", {
        summary: null,
        review: null,
      }),
    );
    const second = await f.service.perform(
      prepareAdventureAttempt(await f.read(f.cid), {
        title: "Next chapter",
        premise: "Continue from our saved place.",
        pacing: { kind: "evening", custom: null },
      }),
    );
    await f.service.perform(
      versionAdventureAttempt(
        second.snapshot,
        second.snapshot.adventures.find((x) => x.status === "prepared").id,
        "start",
      ),
    );
    const resumed = await f.snapshot();
    assert.equal(
      resumed.publicState.current_location_id,
      opened.publicState.current_location_id,
    );
    assert.equal(resumed.entities.length, 2);
    assert.equal(resumed.scenes.length, 2);
  } finally {
    await f.db.close();
  }
});

test("P0A foreign owner, stale head/timeline and client supplied opening fields fail closed before public writes", async () => {
  const f = await setup();
  try {
    const initial = await f.snapshot();
    for (const delta of [
      { expectedHeadId: randomUUID() },
      { expectedAdventureVersion: 2 },
      { opening: { location: "INJECTED" } },
      { timeline: { timelineId: randomUUID(), epoch: 1 } },
    ]) {
      const command = structuredClone(f.start);
      Object.assign(command.input, delta);
      await assert.rejects(f.service.perform(command));
      assert.deepEqual(await f.snapshot(), initial);
    }
    await assert.rejects(
      f.one("select public.rpg_adventures($1,$2,'start',$3::jsonb,$4::jsonb)", [
        f.other,
        f.cid,
        JSON.stringify(f.start.input),
        JSON.stringify(f.start.input.timeline),
      ]),
      /rpg_forbidden/,
    );
    await f.mutation(
      "state.save",
      f.cid,
      {
        summary: "An established different starting situation.",
        current_session_id: initial.publicState.current_session_id,
        current_scene_id: initial.publicState.current_scene_id,
        current_location_id: null,
      },
      initial.publicState.revision,
    );
    const stale = await f.snapshot();
    await assert.rejects(f.service.perform(f.start));
    const latest = versionAdventureAttempt(
      await f.read(f.cid),
      f.start.input.adventureId,
      "start",
    );
    await assert.rejects(f.service.perform(latest));
    assert.deepEqual(await f.snapshot(), stale);
    assert.equal((await f.read(f.cid)).activeAdventureId, null);
  } finally {
    await f.db.close();
  }
});

test("P0A Russian opening uses campaign story language and preserves ordinary job freedom", async () => {
  const f = await setup(30, "ru");
  try {
    await f.service.perform(f.start);
    const s = await f.snapshot();
    assert.match(s.publicState.summary, /Работа оплачиваемая/);
    assert.match(s.publicState.summary, /незнакомый путешественник/);
    assert.match(s.locations[0].name, /Общинный дом/);
    assert.equal(s.scenes.at(-1).role, "narration");
    assert.equal(s.quests.length, 0);
  } finally {
    await f.db.close();
  }
});

test("P0A established locations keep accepted Adventure lifecycle behavior even when the preceding session is closed", async () => {
  const f = await setup();
  try {
    const initial = await f.snapshot();
    const place = await f.mutation("location.save", f.cid, {
      name: "Recorded crossroads",
      description: "An already established public place.",
      status: "visited",
    });
    await f.mutation(
      "state.save",
      f.cid,
      {
        summary: "An established continuity.",
        current_session_id: initial.publicState.current_session_id,
        current_scene_id: initial.publicState.current_scene_id,
        current_location_id: place.id,
      },
      initial.publicState.revision,
    );
    const session = initial.sessions.find(
      (row) => row.id === initial.publicState.current_session_id,
    );
    await f.mutation(
      "session.save",
      f.cid,
      {
        id: session.id,
        title: session.title,
        status: "closed",
        recap: session.recap,
      },
      session.revision,
    );
    const before = await f.snapshot(),
      core = await f.core();
    const result = await f.service.perform(
      versionAdventureAttempt(
        await f.read(f.cid),
        f.start.input.adventureId,
        "start",
      ),
    );
    assert.equal(result.snapshot.activeAdventureId, f.start.input.adventureId);
    const after = await f.snapshot();
    for (const family of ["locations", "entities", "scenes", "sessions"])
      assert.deepEqual(after[family], before[family]);
    assert.equal(after.publicState.current_location_id, place.id);
    assert.equal(after.publicState.summary, before.publicState.summary);
    assert.deepEqual(await f.core(), core);
    assert.deepEqual(
      await f.query(
        "select * from rpg_private.world_events where campaign_id=$1 and event->>'kind'='adventure.opening'",
        [f.cid],
      ),
      [],
    );
  } finally {
    await f.db.close();
  }
});

test("P0A populated migration29 upgrade preserves existing records, saved manifests, function grants and legacy continuities", async () => {
  const f = await setup(29);
  try {
    const save = await f.saves(
      f.cid,
      "create",
      await f.command(f.cid, { kind: "manual", name: "Before P0A upgrade" }),
    );
    const before = await f.snapshot(),
      core = await f.core(),
      catalog = await f.read(f.cid);
    const manifests = await f.query(
      "select * from rpg_private.timeline_manifests where campaign_id=$1 order by id",
      [f.cid],
    );
    await f.db.exec(
      await readFile(
        new URL("202609290030_adventure_playable_opening.sql", f.folder),
        "utf8",
      ),
    );
    assert.deepEqual(await f.snapshot(), before);
    assert.deepEqual(await f.core(), core);
    assert.deepEqual(await f.read(f.cid), catalog);
    assert.deepEqual(
      await f.query(
        "select * from rpg_private.timeline_manifests where campaign_id=$1 order by id",
        [f.cid],
      ),
      manifests,
    );
    for (const manifest of manifests)
      await f.one("select rpg_private.lab_validate_manifest($1,$2)", [
        f.cid,
        manifest.id,
      ]);
    const grants = await f.one(
      "select has_function_privilege('anon','public.rpg_adventures(uuid,uuid,text,jsonb,jsonb)','execute') anon,has_function_privilege('authenticated','public.rpg_adventures(uuid,uuid,text,jsonb,jsonb)','execute') authenticated,has_function_privilege('service_role','public.rpg_adventures(uuid,uuid,text,jsonb,jsonb)','execute') service",
    );
    assert.deepEqual(grants, {
      anon: false,
      authenticated: false,
      service: true,
    });
    const started = await f.service.perform(
      versionAdventureAttempt(
        await f.read(f.cid),
        f.start.input.adventureId,
        "start",
      ),
    );
    assert.equal((await f.snapshot()).locations.length, 1);
    assert.equal(started.snapshot.activeAdventureId, f.start.input.adventureId);
    await f.saves(
      f.cid,
      "load",
      await f.command(f.cid, {
        saveId: save.saveId,
        label: "Pre-upgrade checkpoint",
        recovery: false,
      }),
    );
    assert.deepEqual((await f.snapshot()).entities, before.entities);
    assert.equal((await f.snapshot()).publicState.current_location_id, null);
    await f.service.perform(
      versionAdventureAttempt(
        await f.read(f.cid),
        f.start.input.adventureId,
        "start",
      ),
    );
    assert.equal((await f.snapshot()).locations.length, 1);
  } finally {
    await f.db.close();
  }
});
