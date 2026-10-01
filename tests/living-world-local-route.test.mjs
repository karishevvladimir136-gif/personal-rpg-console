import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { readFile } from "node:fs/promises";
import { setup } from "./universal-bootstrap-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { runTurn } from "../src/lib/gameplay/turn-engine.ts";
import {
  worldLogicTurnPreparer,
  worldTurnPreparer,
} from "../src/lib/production/turn-world.ts";
import {
  worldLogicContext,
  resolveWorldLogic,
  parseWorldLogicProposal,
  mundanePublicDetailMarker,
} from "../src/lib/rulesets/world-logic.ts";
import { stableGameplayId } from "../src/lib/gameplay/dice.ts";
import { worldLogicTravelCapability } from "../src/lib/rulesets/world-logic-consequences.ts";
import { buildContext } from "../src/lib/gameplay/dm-context.ts";

const migration33 = new URL(
  "../supabase/migrations/202609300033_living_world_mundane_turn.sql",
  import.meta.url,
);
const migration34 = new URL(
  "../supabase/migrations/202609300034_living_world_local_route.sql",
  import.meta.url,
);
const usage = {
  model: "synthetic-scripted",
  inputTokens: 0,
  outputTokens: 0,
  calls: 0,
  latencyMs: 0,
};

async function setupLocal() {
  const f = await setup(undefined, "en", 32);
  await f.create();
  await f.startOpening();
  await f.db.exec(await readFile(migration33, "utf8"));
  await f.db.exec(await readFile(migration34, "utf8"));
  const runtime = async (a) => {
    try {
      return {
        data: await f.runtime(
          a.p_campaign_id,
          a.p_action,
          a.p_payload,
          a.p_timeline,
        ),
      };
    } catch (e) {
      return { error: { code: e.code, message: e.message } };
    }
  };
  const world = async (a) => {
    try {
      return {
        data: (
          await f.one(
            "select public.rpg_world($1,$2,$3,$4::jsonb,$5::jsonb) result",
            [
              a.p_owner_id,
              a.p_campaign_id,
              a.p_action,
              JSON.stringify(a.p_payload),
              JSON.stringify(a.p_timeline),
            ],
          )
        ).result,
      };
    } catch (e) {
      return { error: { code: e.code, message: e.message } };
    }
  };
  const store = async () =>
    createRpcTurnStore(
      f.owner,
      runtime,
      "synthetic-scripted",
      await f.fence(f.cid),
    );
  const inputFor = async (s, words) => {
    const play = await s.readPlay(f.cid);
    return {
      operationId: randomUUID(),
      campaignId: f.cid,
      timeline: play.timeline,
      expectedRevision: play.revision,
      mode: "game",
      input: words,
      companionId: null,
      listenerIds: [],
      mechanic: null,
    };
  };
  const turn = async (
    words,
    choose,
    narration = "The ordinary scene continues.",
  ) => {
    const s = await store();
    const input = await inputFor(s, words);
    let supplied, narrationSource;
    const deps = {
      store: s,
      provider: {
        plan: () => assert.fail("legacy planner"),
        feedback: () => assert.fail("feedback"),
        narrate: async (source) => {
          narrationSource = source;
          return {
            output: {
              narration,
              visualDescription: "",
              clarification: null,
            },
            usage,
          };
        },
      },
      prepareWorldLogic: worldLogicTurnPreparer(world, {
        action: async (i) => {
          supplied = i;
          return { output: choose(i), usage };
        },
      }),
      prepareWorld: worldTurnPreparer(world),
    };
    const result = await runTurn(input, deps);
    assert.equal(result.status, "committed", JSON.stringify(result));
    return { input, result, supplied, narrationSource, deps };
  };
  const readRoutes = async () =>
    (
      await f.one(
        "select public.rpg_world($1,$2,'local_routes','{}'::jsonb,$3::jsonb) result",
        [f.owner, f.cid, JSON.stringify(await f.fence(f.cid))],
      )
    ).result;
  const localRoute = async (actor, from, to, cid = f.cid, owner = f.owner) =>
    (
      await f.one(
        "select rpg_private.living_world_local_route($1,$2,$3,$4,$5) valid",
        [owner, cid, actor, from, to],
      )
    ).valid;
  return { f, world, store, turn, readRoutes, localRoute };
}

function author(i, actorId, vicinity = "nearby") {
  const anchor = i.source.snapshot.publicState.current_location_id;
  return {
    schemaVersion: 3,
    actorId,
    input: i.input.input,
    uncertainty: "resolved",
    circumstanceRefs: [`location:${anchor}`],
    evidenceIndexes: [],
    kind: "location.establish",
    anchorLocationId: anchor,
    destinationId: null,
    name: "Copper Anvil",
    category: "blacksmith",
    vicinity,
  };
}
function action(i, actorId, kind, destinationId = null) {
  return {
    schemaVersion: 2,
    actorId,
    input: i.input.input,
    action: kind,
    outcome: "completed",
    uncertainty: "resolved",
    capabilityRefs: [],
    circumstanceRefs: ["public-state"],
    evidenceIndexes: [],
    publicText: "An ordinary action occurs.",
    elapsedMinutes: kind === "move" ? 5 : 0,
    destinationId,
    consequences: [],
  };
}

test("existing no-change World settlement commits public detail narration into Scene and Memory", async () => {
  const { f, turn, readRoutes } = await setupLocal();
  try {
    await turn(
      "Where is the nearest brothel?",
      (i) => ({
        ...author(i, f.hero),
        name: "The Rose House",
        category: "brothel",
      }),
      "The Rose House is nearby.",
    );
    const place = (await f.snapshot()).locations.find(
      (row) => row.name === "The Rose House",
    );
    assert.ok(place);
    assert.ok(
      (await readRoutes()).some((row) => row.destinationId === place.id),
    );
    const narrated =
      "The Rose House is a modest, busy place after dusk. Its public rates have a reputation for being inexpensive.";
    const before = await f.snapshot();
    const worldBefore = (
      await f.one(
        "select world from rpg_private.world_foundations where campaign_id=$1",
        [f.cid],
      )
    ).world;
    const detail = await turn(
      "is it good one? big boobs? cheap ? dont have lots of money",
      (i) => ({
        ...action(i, f.hero, "observe"),
        circumstanceRefs: [
          `location:${i.source.snapshot.publicState.current_location_id}`,
        ],
        publicText: mundanePublicDetailMarker("location", place.id, "reported"),
      }),
      narrated,
    );
    assert.equal(detail.result.narration, narrated);
    assert.deepEqual(detail.narrationSource.worldLogicMundaneDetail, {
      targetKind: "location",
      targetId: place.id,
      name: "The Rose House",
      epistemic: "reported",
    });
    const context = buildContext(
      detail.narrationSource,
      detail.input,
      "narrate",
      {
        model: "gpt-6-sol",
      },
    );
    assert.match(context.instructions, /improvise harmless sensory detail/);
    assert.deepEqual(
      JSON.parse(context.input).mandatory.mundanePublicDetail,
      detail.narrationSource.worldLogicMundaneDetail,
    );
    assert.match(
      detail.supplied.source.snapshot.scenes.find(
        (scene) =>
          scene.id ===
          detail.supplied.source.snapshot.publicState.current_scene_id,
      ).body,
      /Rose House/,
    );
    const saved = await f.one(
      "select payload from rpg_private.runtime_events where campaign_id=$1 and operation_id=$2",
      [f.cid, detail.input.operationId],
    );
    const sceneId = saved.payload.narrationSceneId;
    assert.equal(
      (
        await f.one(
          "select body from public.rpg_scenes where campaign_id=$1 and id=$2",
          [f.cid, sceneId],
        )
      ).body,
      narrated,
    );
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.memory_public_sources where campaign_id=$1 and source_id=$2",
          [f.cid, sceneId],
        )
      ).n,
      1,
    );
    const after = await f.snapshot();
    assert.deepEqual(after.entities, before.entities);
    assert.deepEqual(after.items, before.items);
    assert.deepEqual(after.quests, before.quests);
    assert.deepEqual(after.locations, before.locations);
    const worldAfter = (
      await f.one(
        "select world from rpg_private.world_foundations where campaign_id=$1",
        [f.cid],
      )
    ).world;
    for (const field of ["threads", "hooks", "warnings", "actors"])
      assert.deepEqual(worldAfter[field], worldBefore[field], field);
    const followUp = await turn("I go to The Rose House.", (i) =>
      action(i, f.hero, "move", place.id),
    );
    assert.match(
      followUp.supplied.source.snapshot.scenes.find(
        (scene) =>
          scene.id ===
          followUp.supplied.source.snapshot.publicState.current_scene_id,
      ).body,
      /modest, busy place/,
    );
    assert.equal(
      (await f.snapshot()).publicState.current_location_id,
      place.id,
    );
  } finally {
    await f.db.close();
  }
});

test("mundane public detail rejects remote targets, effects, and an attached foundation action", async () => {
  const { f, turn, store, world } = await setupLocal();
  try {
    await turn(
      "Where is the nearest brothel?",
      (i) => ({
        ...author(i, f.hero),
        name: "The Rose House",
        category: "brothel",
      }),
      "The Rose House is nearby.",
    );
    const rose = (await f.snapshot()).locations.find(
      (row) => row.name === "The Rose House",
    );
    const remote = (
      await f.mutation("location.save", f.cid, {
        name: "Far valley",
        description: "A distant valley",
        status: "known",
      })
    ).id;
    const s = await store();
    const play = await s.readPlay(f.cid);
    const input = {
      operationId: randomUUID(),
      campaignId: f.cid,
      timeline: play.timeline,
      expectedRevision: play.revision,
      mode: "game",
      input: "Is it inexpensive?",
      companionId: null,
      listenerIds: [],
      mechanic: null,
    };
    await s.begin(input);
    const claim = await s.claim(f.cid, input.operationId);
    assert.ok(claim);
    let captured;
    const markerProposal = (i, target = rose.id) => ({
      ...action(i, f.hero, "observe"),
      circumstanceRefs: [
        `location:${i.source.snapshot.publicState.current_location_id}`,
      ],
      publicText: mundanePublicDetailMarker("location", target, "reported"),
    });
    await assert.rejects(
      worldLogicTurnPreparer(world, {
        action: async (i) => {
          captured = i;
          return {
            output: {
              ...markerProposal(i),
              foundationAction: { action: "trade" },
            },
            usage,
          };
        },
      })(claim, null),
    );
    const smuggledClaim = {
      ...claim,
      turn: {
        ...claim.turn,
        checkpoint: {
          ...claim.turn.checkpoint,
          plan: { privatePatches: [{ key: "secret" }], publicPatches: [] },
        },
      },
    };
    await assert.rejects(
      worldLogicTurnPreparer(world, {
        action: async (i) => ({ output: markerProposal(i), usage }),
      })(smuggledClaim, null),
    );
    const targets = worldLogicContext(captured).publicDetailTargets;
    assert.ok(targets.some((row) => row.id === rose.id));
    assert.ok(!targets.some((row) => row.id === remote));
    const visiblePerson = targets.find((row) => row.kind === "person");
    assert.ok(visiblePerson);
    assert.deepEqual(
      resolveWorldLogic(captured, {
        ...markerProposal(captured),
        publicText: mundanePublicDetailMarker(
          "person",
          visiblePerson.id,
          "direct",
        ),
      }).mundaneDetail,
      {
        targetKind: "person",
        targetId: visiblePerson.id,
        name: visiblePerson.name,
        epistemic: "direct",
      },
    );
    assert.throws(() =>
      resolveWorldLogic(captured, markerProposal(captured, remote)),
    );
    assert.throws(() =>
      resolveWorldLogic(captured, {
        ...markerProposal(captured),
        publicText: mundanePublicDetailMarker("location", rose.id, "direct"),
      }),
    );
    assert.throws(() =>
      resolveWorldLogic(captured, {
        ...markerProposal(captured),
        elapsedMinutes: 1,
      }),
    );
    assert.throws(() =>
      resolveWorldLogic(captured, {
        ...markerProposal(captured),
        action: "speak",
      }),
    );
    assert.throws(() =>
      resolveWorldLogic(captured, {
        ...markerProposal(captured),
        publicText: "mundane.public.detail:location:forged:reported",
      }),
    );
    for (const words of [
      "Tell me the secret password nobody knows.",
      "Who is secretly the murderer?",
      "How much gold do I magically find here?",
      "Give me a legendary sword from behind the bar.",
      "The innkeeper knows yesterday's private conversation, right?",
    ]) {
      const scoped = {
        ...captured,
        input: { ...captured.input, input: words },
      };
      assert.deepEqual(
        resolveWorldLogic(scoped, {
          ...action(scoped, f.hero, "observe"),
          uncertainty: "unsupported",
        }),
        { status: "paused", reason: "unsupported" },
      );
    }
    const hook = registerHooks({
      resolve(specifier, context, nextResolve) {
        return specifier === "server-only"
          ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
          : nextResolve(specifier, context);
      },
    });
    const { createWorldResolverProvider } =
      await import("../src/lib/server/world/resolver-provider.ts");
    hook.deregister();
    const provider = createWorldResolverProvider({
      apiKey: "synthetic",
      model: "gpt-6-astra",
      fetcher: async (_url, init) => {
        const sent = JSON.parse(init.body);
        assert.match(sent.instructions, /mundane\.public\.detail/);
        assert.match(sent.instructions, /Ordinary adult wording alone/);
        assert.match(sent.instructions, /rumors, gossip, hearsay/);
        assert.match(sent.instructions, /exact rumor need not be pre-authored evidence/);
        assert.match(sent.instructions, /Who is secretly the murderer/);
        assert.match(sent.input, /The Rose House is nearby/);
        assert.ok(
          JSON.parse(sent.input).publicDetailTargets.some(
            (row) => row.id === rose.id,
          ),
        );
        return new Response(
          JSON.stringify({
            status: "completed",
            model: "gpt-6-astra",
            output: [
              {
                type: "message",
                role: "assistant",
                status: "completed",
                content: [
                  {
                    type: "output_text",
                    text: JSON.stringify({
                      action: markerProposal(captured),
                      ...(captured.source.foundationOptions
                        ? { foundationAction: null }
                        : {}),
                    }),
                  },
                ],
              },
            ],
            usage: { input_tokens: 20, output_tokens: 10 },
          }),
          { status: 200 },
        );
      },
    });
    assert.equal(
      (await provider.action(captured)).output.publicText,
      mundanePublicDetailMarker("location", rose.id, "reported"),
    );
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.world_stages where campaign_id=$1 and id=$2",
          [f.cid, input.operationId],
        )
      ).n,
      0,
    );
    assert.equal(
      (await f.snapshot()).publicState.current_location_id,
      captured.source.snapshot.publicState.current_location_id,
    );
  } finally {
    await f.db.close();
  }
});

test("attributed local rumor stays attributed in the saved Scene and next turn context", async () => {
  const { f, turn } = await setupLocal();
  try {
    await turn(
      "Where is the nearest brothel?",
      (i) => ({
        ...author(i, f.hero),
        name: "The Rose House",
        category: "brothel",
      }),
      "The Rose House is nearby.",
    );
    const rose = (await f.snapshot()).locations.find(
      (row) => row.name === "The Rose House",
    );
    const rumorText =
      "A traveler says the mayor owns the Rose House, but nobody here has verified that claim.";
    const rumor = await turn(
      "The traveler says the mayor owns the brothel. Is that true?",
      (i) => ({
        ...action(i, f.hero, "observe"),
        circumstanceRefs: [
          `location:${i.source.snapshot.publicState.current_location_id}`,
        ],
        publicText: mundanePublicDetailMarker("location", rose.id, "reported"),
      }),
      rumorText,
    );
    assert.equal(rumor.result.narration, rumorText);
    const record = await f.one(
      "select id,body from public.rpg_scenes where campaign_id=$1 and body=$2",
      [f.cid, rumorText],
    );
    assert.ok(record.id);
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.memory_public_sources where campaign_id=$1 and source_id=$2",
          [f.cid, record.id],
        )
      ).n,
      1,
    );
    const next = await turn(
      "Does it stay open late?",
      (i) => ({
        ...action(i, f.hero, "observe"),
        circumstanceRefs: [
          `location:${i.source.snapshot.publicState.current_location_id}`,
        ],
        publicText: mundanePublicDetailMarker("location", rose.id, "reported"),
      }),
      "Locals say it often stays open after dusk.",
    );
    assert.equal(worldLogicContext(next.supplied).recentPublicScene, rumorText);
  } finally {
    await f.db.close();
  }
});

test("natural gossip questions use reported detail and retain attributed Scene and Memory", async () => {
  const { f, turn } = await setupLocal();
  try {
    await turn(
      "Where is the nearest brothel?",
      (i) => ({
        ...author(i, f.hero),
        name: "The Rose House",
        category: "brothel",
      }),
      "The Rose House is nearby.",
    );
    const rose = (await f.snapshot()).locations.find(
      (row) => row.name === "The Rose House",
    );
    assert.ok(rose);
    const before = await f.snapshot();
    const worldBefore = (
      await f.one(
        "select world from rpg_private.world_foundations where campaign_id=$1",
        [f.cid],
      )
    ).world;
    const cases = [
      {
        words:
          "mmm you talk as person who where there often.... let me check. any rumors except ? anything?",
        narration:
          "Often? No, says the innkeeper. But locals gossip that the Rose House grows noisy after midnight; I cannot say whether that is true.",
      },
      {
        words: "Any rumors about The Rose House?",
        narration:
          "Locals say the Rose House gets rowdy after midnight, though that is only gossip.",
      },
      {
        words: "What do locals say about it?",
        narration:
          "People around here joke that one regular has lost three fortunes there; nobody has checked the tale.",
      },
      {
        words: "You've been there often — anything interesting?",
        narration:
          "Often? No, says the innkeeper. I have only heard a rumor that the owner knows someone in the watch, but I cannot verify it.",
      },
    ];
    for (const { words, narration } of cases) {
      const detail = await turn(
        words,
        (i) => ({
          ...action(i, f.hero, "observe"),
          circumstanceRefs: [
            `location:${i.source.snapshot.publicState.current_location_id}`,
          ],
          publicText: mundanePublicDetailMarker("location", rose.id, "reported"),
        }),
        narration,
      );
      assert.equal(detail.result.narration, narration);
      assert.equal(detail.narrationSource.worldLogicMundaneDetail.epistemic, "reported");
      const context = buildContext(detail.narrationSource, detail.input, "narrate", {
        model: "gpt-6-sol",
      });
      assert.match(context.instructions, /invent ordinary local gossip, hearsay/);
      assert.match(context.instructions, /correct the premise/);
      const saved = await f.one(
        "select payload from rpg_private.runtime_events where campaign_id=$1 and operation_id=$2",
        [f.cid, detail.input.operationId],
      );
      const scene = await f.one(
        "select body from public.rpg_scenes where campaign_id=$1 and id=$2",
        [f.cid, saved.payload.narrationSceneId],
      );
      assert.equal(scene.body, narration);
      assert.equal(
        (
          await f.one(
            "select count(*)::integer n from rpg_private.memory_public_sources where campaign_id=$1 and source_id=$2",
            [f.cid, saved.payload.narrationSceneId],
          )
        ).n,
        1,
      );
    }
    const truth = await turn(
      "Is the rumor actually true?",
      (i) => ({
        ...action(i, f.hero, "observe"),
        circumstanceRefs: [
          `location:${i.source.snapshot.publicState.current_location_id}`,
        ],
        publicText: mundanePublicDetailMarker("location", rose.id, "reported"),
      }),
      "Nobody here can verify that rumor about the owner and the watch.",
    );
    assert.match(worldLogicContext(truth.supplied).recentPublicScene, /cannot verify it/);
    assert.match(truth.result.narration, /Nobody here can verify/);
    const after = await f.snapshot();
    for (const family of ["entities", "items", "quests", "locations", "storages"])
      assert.deepEqual(after[family], before[family], family);
    assert.equal(after.publicState.current_location_id, before.publicState.current_location_id);
    assert.equal(after.worldMinutes, before.worldMinutes);
    const worldAfter = (
      await f.one(
        "select world from rpg_private.world_foundations where campaign_id=$1",
        [f.cid],
      )
    ).world;
    for (const field of ["threads", "hooks", "warnings", "actors"])
      assert.deepEqual(worldAfter[field], worldBefore[field], field);
    const secretInput = {
      ...truth.supplied,
      input: { ...truth.supplied.input, input: "Who is secretly the murderer?" },
    };
    assert.deepEqual(
      resolveWorldLogic(secretInput, {
        ...action(secretInput, f.hero, "observe"),
        uncertainty: "unsupported",
      }),
      { status: "paused", reason: "unsupported" },
    );
  } finally {
    await f.db.close();
  }
});

test("mundane public detail resumes a staged World settlement without a duplicate event", async () => {
  const { f, turn, store, world } = await setupLocal();
  try {
    await turn(
      "Where is the nearest brothel?",
      (i) => ({
        ...author(i, f.hero),
        name: "The Rose House",
        category: "brothel",
      }),
      "The Rose House is nearby.",
    );
    const rose = (await f.snapshot()).locations.find(
      (row) => row.name === "The Rose House",
    );
    const s = await store();
    const play = await s.readPlay(f.cid);
    const input = {
      operationId: randomUUID(),
      campaignId: f.cid,
      timeline: play.timeline,
      expectedRevision: play.revision,
      mode: "game",
      input: "Is it cheap?",
      companionId: null,
      listenerIds: [],
      mechanic: null,
    };
    await s.begin(input);
    const claim = await s.claim(f.cid, input.operationId);
    assert.ok(claim);
    const logic = await worldLogicTurnPreparer(world, {
      action: async (i) => ({
        output: {
          ...action(i, f.hero, "observe"),
          circumstanceRefs: [
            `location:${i.source.snapshot.publicState.current_location_id}`,
          ],
          publicText: mundanePublicDetailMarker(
            "location",
            rose.id,
            "reported",
          ),
        },
        usage,
      }),
    })(claim, null);
    const checkpoint = {
      ...claim.turn.checkpoint,
      worldLogic: logic.proposal,
      resolution: logic.resolution,
      plan: {
        narration: "",
        checks: [],
        publicPatches: [],
        privatePatches: [],
        visualDescription: "",
        clarification: null,
        guidanceProposal: null,
      },
    };
    await s.checkpoint(claim.lease, checkpoint, "generating");
    const preparer = worldTurnPreparer(world);
    const staged = await preparer(
      { ...claim, turn: { ...claim.turn, checkpoint } },
      logic.resolution,
      null,
    );
    assert.ok(staged);
    checkpoint.worldSettlement = staged.settlement;
    checkpoint.resolution = staged.resolution;
    await s.checkpoint(claim.lease, checkpoint, "generating");
    const recovered = await preparer(
      { ...claim, turn: { ...claim.turn, checkpoint } },
      staged.resolution,
      staged.settlement,
    );
    assert.deepEqual(recovered.settlement, staged.settlement);
    assert.deepEqual(recovered.resolution, staged.resolution);
    const committed = await s.commit(claim.lease, {
      worldSettlement: recovered.settlement,
      narration: "Locals consider its rates modest.",
      visualDescription: "",
      resolution: recovered.resolution,
      privatePatches: [],
      checks: [],
      guidanceProposal: null,
    });
    assert.equal(committed.status, "committed");
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.world_events where campaign_id=$1 and operation_id=$2",
          [f.cid, input.operationId],
        )
      ).n,
      1,
    );
  } finally {
    await f.db.close();
  }
});

test("populated migration 32 to 33 to 34 preserves rows and Memory definitions", async () => {
  const f = await setup(undefined, "en", 32);
  try {
    await f.create();
    await f.startOpening();
    await f.db.exec(await readFile(migration33, "utf8"));
    const before = await f.snapshot();
    const rows = await f.query(
      "select schemaname,tablename from pg_tables where schemaname in ('public','rpg_private') and tablename like 'rpg_%' order by schemaname,tablename",
    );
    const fingerprints = async () =>
      Promise.all(
        rows.map(async ({ schemaname, tablename }) => ({
          table: `${schemaname}.${tablename}`,
          ...(await f.one(
            `select count(*)::integer n,md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by to_jsonb(t)::text),'')) hash from ${schemaname}.${tablename} t`,
          )),
        })),
      );
    const defs = async () =>
      f.query(
        "select p.proname,md5(pg_get_functiondef(p.oid)) hash from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='rpg_private' and p.proname like 'memory_%' order by p.proname,p.oid",
      );
    const triggers = async () =>
      f.query(
        "select c.relname,t.tgname,md5(pg_get_triggerdef(t.oid)) hash from pg_trigger t join pg_class c on c.oid=t.tgrelid where not t.tgisinternal and t.tgname like 'memory_%' order by c.relname,t.tgname",
      );
    const original = await fingerprints(),
      memory = await defs(),
      memoryTriggers = await triggers();
    await f.db.exec(await readFile(migration34, "utf8"));
    assert.deepEqual(await f.snapshot(), before);
    assert.deepEqual(await fingerprints(), original);
    assert.deepEqual(
      await f.query(
        "select schemaname,tablename from pg_tables where schemaname in ('public','rpg_private') and tablename like 'rpg_%' order by schemaname,tablename",
      ),
      rows,
    );
    assert.deepEqual(await defs(), memory);
    assert.deepEqual(await triggers(), memoryTriggers);
    assert.equal(
      (
        await f.query(
          "select count(*)::integer n from pg_tables where schemaname='rpg_private' and tablename like '%route%'",
        )
      )[0].n,
      0,
    );
  } finally {
    await f.db.close();
  }
});

test("blacksmith authoring, local move, speech, restore and return use the existing World settlement", async () => {
  const { f, turn, readRoutes, localRoute } = await setupLocal();
  try {
    const anchor = (await f.snapshot()).publicState.current_location_id;
    const before = await f.saves(
      f.cid,
      "create",
      await f.command(f.cid, { kind: "manual", name: "Before Copper Anvil" }),
    );
    const originalWorld = (
      await f.one(
        "select world from rpg_private.world_foundations where campaign_id=$1",
        [f.cid],
      )
    ).world;
    assert.deepEqual(await readRoutes(), []);
    const authored = await turn("Where is the nearest blacksmith?", (i) =>
      author(i, f.hero),
    );
    const copper = stableGameplayId(
      authored.input.operationId,
      "living-world:location",
    );
    assert.equal(await localRoute(f.hero, anchor, copper), true);
    assert.deepEqual(await readRoutes(), [
      { actorId: f.hero, destinationId: copper },
    ]);
    const moved = await turn("I go there.", (i) => {
      const routes = worldLogicContext(i).travelOptions;
      assert.deepEqual(routes, [
        { actorId: f.hero, destinationId: copper, capability: null },
      ]);
      assert.equal(i.localRoutes.length, 1);
      assert.equal(JSON.stringify(routes).includes("checkpoint"), false);
      return action(i, f.hero, "move", copper);
    });
    const state = await f.snapshot();
    assert.equal(state.publicState.current_location_id, copper);
    assert.equal(
      state.locations.find((row) => row.id === copper).status,
      "visited",
    );
    assert.equal(
      (
        await f.one(
          "select world from rpg_private.world_foundations where campaign_id=$1",
          [f.cid],
        )
      ).world.actors.find((actor) => actor.entityId === f.hero).locationId,
      copper,
    );
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.world_stages where campaign_id=$1 and id=$2",
          [f.cid, moved.input.operationId],
        )
      ).n,
      1,
    );
    const actionEvent = await f.one(
      "select id from rpg_private.world_events where campaign_id=$1 and operation_id=$2 and event->>'kind'='world.logic.resolved'",
      [f.cid, moved.input.operationId],
    );
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.memory_public_sources where campaign_id=$1 and kind='event' and source_id=$2",
          [f.cid, actionEvent.id],
        )
      ).n,
      1,
    );
    const movedWorld = (
      await f.one(
        "select world from rpg_private.world_foundations where campaign_id=$1",
        [f.cid],
      )
    ).world;
    for (const key of ["threads", "hooks", "warnings"])
      assert.deepEqual(movedWorld[key], originalWorld[key]);
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.world_events where campaign_id=$1 and operation_id=$2 and event->>'kind'='world.logic.resolved'",
          [f.cid, moved.input.operationId],
        )
      ).n,
      1,
    );
    assert.deepEqual(await runTurn(moved.input, moved.deps), moved.result);
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.world_events where campaign_id=$1 and operation_id=$2",
          [f.cid, moved.input.operationId],
        )
      ).n,
      1,
    );
    await turn("I speak to the blacksmith.", (i) => {
      assert.equal(i.source.snapshot.publicState.current_location_id, copper);
      return action(i, f.hero, "speak");
    });
    const save = await f.saves(
      f.cid,
      "create",
      await f.command(f.cid, { kind: "manual", name: "At Copper Anvil" }),
    );
    await f.saves(
      f.cid,
      "load",
      await f.command(f.cid, {
        saveId: save.saveId,
        label: "Restore Copper Anvil",
        recovery: false,
      }),
    );
    assert.equal((await f.snapshot()).publicState.current_location_id, copper);
    assert.deepEqual(await readRoutes(), [
      { actorId: f.hero, destinationId: anchor },
    ]);
    await turn("I return to the square.", (i) =>
      action(i, f.hero, "move", anchor),
    );
    assert.equal((await f.snapshot()).publicState.current_location_id, anchor);
    await f.saves(
      f.cid,
      "load",
      await f.command(f.cid, {
        saveId: before.saveId,
        label: "Before authoring",
        recovery: false,
      }),
    );
    assert.deepEqual(await readRoutes(), []);
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.turns where id=$1",
          [authored.input.operationId],
        )
      ).n,
      0,
    );
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from public.rpg_locations where id=$1",
          [copper],
        )
      ).n,
      0,
    );
  } finally {
    await f.db.close();
  }
});

test("local proof rejects arbitrary places, forged IDs, unrelated actors, stale and changed authoring", async () => {
  const { f, turn, readRoutes, localRoute } = await setupLocal();
  try {
    const anchor = (await f.snapshot()).publicState.current_location_id;
    const authored = await turn("Where is the nearest blacksmith?", (i) =>
      author(i, f.hero, "same_street"),
    );
    const copper = stableGameplayId(
      authored.input.operationId,
      "living-world:location",
    );
    assert.equal(await localRoute(f.hero, anchor, copper), true);
    const distant = (
      await f.mutation("location.save", f.cid, {
        name: "Distant city",
        description: "nearby in misleading prose",
        status: "known",
      })
    ).id;
    const forged = (
      await f.mutation("location.save", f.cid, {
        id: stableGameplayId(randomUUID(), "living-world:location"),
        name: "Forged nearby",
        description: "nearby",
        status: "known",
      })
    ).id;
    assert.equal(await localRoute(f.hero, anchor, distant), false);
    await f.one(
      "update public.rpg_locations set status='visited' where id=$1",
      [distant],
    );
    assert.equal(await localRoute(f.hero, anchor, distant), false);
    assert.equal(await localRoute(f.hero, anchor, forged), false);
    assert.equal(await localRoute(f.hero, copper, distant), false);
    assert.equal(await localRoute(f.hero, distant, copper), false);
    assert.equal(
      await localRoute(f.hero, anchor, copper, f.cid, f.other),
      false,
    );
    const other = await f.campaign("Other campaign");
    assert.equal(await localRoute(f.hero, anchor, copper, other), false);
    const foreign = (
      await f.mutation("location.save", other, {
        name: "Foreign smithy",
        description: "Another campaign",
        status: "known",
      })
    ).id;
    assert.equal(await localRoute(f.hero, anchor, foreign), false);
    const npc = (await f.snapshot()).entities.find(
      (row) => row.id !== f.hero,
    ).id;
    assert.equal(await localRoute(npc, anchor, copper), false);
    assert.deepEqual(await readRoutes(), [
      { actorId: f.hero, destinationId: copper },
    ]);
    const observed = await turn("I inspect the square.", (i) =>
      action(i, f.hero, "observe"),
    );
    const turnRow = await f.one(
      "select checkpoint,status from rpg_private.turns where id=$1",
      [authored.input.operationId],
    );
    for (const status of ["failed", "cancelled", "pending"]) {
      await f.one("update rpg_private.turns set status=$2 where id=$1", [
        authored.input.operationId,
        status,
      ]);
      assert.equal(await localRoute(f.hero, anchor, copper), false);
      await f.one("update rpg_private.turns set status=$2 where id=$1", [
        authored.input.operationId,
        turnRow.status,
      ]);
    }
    const mismatched = structuredClone(turnRow.checkpoint);
    mismatched.worldLogic.anchorLocationId = distant;
    await f.one(
      "update rpg_private.turns set checkpoint=$2::jsonb where id=$1",
      [authored.input.operationId, JSON.stringify(mismatched)],
    );
    assert.equal(await localRoute(f.hero, anchor, copper), false);
    await f.one(
      "update rpg_private.turns set checkpoint=$2::jsonb where id=$1",
      [authored.input.operationId, JSON.stringify(turnRow.checkpoint)],
    );
    assert.equal(await localRoute(f.hero, anchor, copper), true);
    assert.throws(() =>
      parseWorldLogicProposal({
        ...action(authored.supplied, f.hero, "move", copper),
        localProvenance: true,
      }),
    );
    const fakeInput = { ...observed.supplied, localRoutes: [] };
    assert.deepEqual(
      resolveWorldLogic(fakeInput, action(fakeInput, f.hero, "move", distant)),
      { status: "paused", reason: "unsupported" },
    );
    assert.deepEqual(
      resolveWorldLogic(fakeInput, action(fakeInput, f.hero, "move", copper)),
      { status: "paused", reason: "unsupported" },
    );
    const withRoutes = observed.supplied;
    assert.equal(
      resolveWorldLogic(withRoutes, action(withRoutes, f.hero, "move", copper))
        .status,
      "staged",
    );
    for (const [family, value] of [
      ["encounters", { status: "active" }],
      ["restRecords", { status: "planned" }],
      ["pendingActions", { status: "confirmed" }],
    ]) {
      const blocked = structuredClone(withRoutes);
      blocked.source.runtime[family].push(value);
      assert.deepEqual(
        resolveWorldLogic(blocked, action(blocked, f.hero, "move", copper)),
        { status: "paused", reason: "unsupported" },
      );
    }
    await turn("I enter Copper Anvil.", (i) =>
      action(i, f.hero, "move", copper),
    );
    assert.equal((await f.snapshot()).publicState.current_location_id, copper);
  } finally {
    await f.db.close();
  }
});

test("an existing explicit travel capability still reaches a distant Location", async () => {
  const { f, turn, localRoute } = await setupLocal();
  try {
    const anchor = (await f.snapshot()).publicState.current_location_id;
    const distant = (
      await f.mutation("location.save", f.cid, {
        name: "North Coast",
        description: "Distant regional coast",
        status: "known",
      })
    ).id;
    const capability = worldLogicTravelCapability(anchor, distant);
    assert.equal(await localRoute(f.hero, anchor, distant), false);
    const foundation = await f.one(
      "select world from rpg_private.world_foundations where campaign_id=$1",
      [f.cid],
    );
    const world = structuredClone(foundation.world);
    world.actors
      .find((actor) => actor.entityId === f.hero)
      .capabilities.push(capability);
    await f.one(
      "update rpg_private.world_foundations set world=$2::jsonb where campaign_id=$1",
      [f.cid, JSON.stringify(world)],
    );
    await turn("I travel to the North Coast.", (i) => {
      assert.deepEqual(worldLogicContext(i).travelOptions, [
        { actorId: f.hero, destinationId: distant, capability },
      ]);
      return {
        ...action(i, f.hero, "move", distant),
        capabilityRefs: [capability],
      };
    });
    assert.equal((await f.snapshot()).publicState.current_location_id, distant);
  } finally {
    await f.db.close();
  }
});

test("a client-forged local route cannot stage a World move", async () => {
  const { f, world, store } = await setupLocal();
  try {
    const distant = (
      await f.mutation("location.save", f.cid, {
        name: "Far valley",
        description: "A distant valley",
        status: "known",
      })
    ).id;
    const s = await store();
    const play = await s.readPlay(f.cid);
    const input = {
      operationId: randomUUID(),
      campaignId: f.cid,
      timeline: play.timeline,
      expectedRevision: play.revision,
      mode: "game",
      input: "I go to the far valley.",
      companionId: null,
      listenerIds: [],
      mechanic: null,
    };
    await s.begin(input);
    const claim = await s.claim(f.cid, input.operationId);
    assert.ok(claim);
    let current;
    await worldLogicTurnPreparer(world, {
      action: async (i) => {
        current = i;
        return { output: action(i, f.hero, "observe"), usage };
      },
    })(claim, null);
    const forgedInput = {
      ...current,
      localRoutes: [{ actorId: f.hero, destinationId: distant }],
    };
    const proposal = action(forgedInput, f.hero, "move", distant);
    const forged = resolveWorldLogic(forgedInput, proposal);
    assert.equal(forged.status, "staged");
    const checkpoint = {
      ...claim.turn.checkpoint,
      worldLogic: proposal,
      resolution: forged.resolution,
      plan: {
        narration: "",
        checks: [],
        publicPatches: [],
        privatePatches: [],
        visualDescription: "",
        clarification: null,
        guidanceProposal: null,
      },
    };
    await s.checkpoint(claim.lease, checkpoint, "generating");
    const stage = await world({
      p_owner_id: f.owner,
      p_campaign_id: f.cid,
      p_action: "stage",
      p_payload: {
        command: forgedInput.command,
        settlement: forged.settlement,
      },
      p_timeline: input.timeline,
    });
    assert.match(stage.error?.message ?? "", /rpg_validation/);
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.world_stages where id=$1",
          [input.operationId],
        )
      ).n,
      0,
    );
    assert.notEqual(
      (await f.snapshot()).publicState.current_location_id,
      distant,
    );
  } finally {
    await f.db.close();
  }
});

test("local move rejects actor/public-state divergence atomically", async () => {
  const { f, world, store, turn } = await setupLocal();
  try {
    const anchor = (await f.snapshot()).publicState.current_location_id;
    const authored = await turn("Where is the nearest blacksmith?", (i) =>
      author(i, f.hero),
    );
    const copper = stableGameplayId(
      authored.input.operationId,
      "living-world:location",
    );
    const s = await store();
    const play = await s.readPlay(f.cid);
    const input = {
      operationId: randomUUID(),
      campaignId: f.cid,
      timeline: play.timeline,
      expectedRevision: play.revision,
      mode: "game",
      input: "I go there.",
      companionId: null,
      listenerIds: [],
      mechanic: null,
    };
    await s.begin(input);
    const claim = await s.claim(f.cid, input.operationId);
    assert.ok(claim);
    const logic = await worldLogicTurnPreparer(world, {
      action: async (i) => ({
        output: action(i, f.hero, "move", copper),
        usage,
      }),
    })(claim, null);
    const checkpoint = {
      ...claim.turn.checkpoint,
      worldLogic: logic.proposal,
      resolution: logic.resolution,
      plan: {
        narration: "",
        checks: [],
        publicPatches: [],
        privatePatches: [],
        visualDescription: "",
        clarification: null,
        guidanceProposal: null,
      },
    };
    await s.checkpoint(claim.lease, checkpoint, "generating");
    const staged = await worldTurnPreparer(world)(
      { ...claim, turn: { ...claim.turn, checkpoint } },
      logic.resolution,
      null,
    );
    assert.ok(staged);
    checkpoint.worldSettlement = staged.settlement;
    checkpoint.resolution = staged.resolution;
    await s.checkpoint(claim.lease, checkpoint, "generating");
    const packet = {
      worldSettlement: staged.settlement,
      narration: "The journey ends.",
      visualDescription: "",
      resolution: staged.resolution,
      privatePatches: [],
      checks: [],
      guidanceProposal: null,
    };
    const beforeWorld = (
      await f.one(
        "select world from rpg_private.world_foundations where campaign_id=$1",
        [f.cid],
      )
    ).world;
    const unchanged = async () => {
      assert.equal(
        (await f.snapshot()).publicState.current_location_id,
        anchor,
      );
      assert.equal(
        (await f.snapshot()).locations.find((row) => row.id === copper).status,
        "known",
      );
      assert.deepEqual(
        (
          await f.one(
            "select world from rpg_private.world_foundations where campaign_id=$1",
            [f.cid],
          )
        ).world,
        beforeWorld,
      );
      assert.equal(
        (
          await f.one(
            "select count(*)::integer n from rpg_private.world_events where campaign_id=$1 and operation_id=$2",
            [f.cid, input.operationId],
          )
        ).n,
        0,
      );
    };
    const wrongPublic = structuredClone(packet);
    wrongPublic.resolution.changes.find(
      (change) => change.family === "public_state",
    ).values.current_location_id = anchor;
    await assert.rejects(
      f.runtime(f.cid, "commit", { ...claim.lease, packet: wrongPublic }),
      /rpg_validation|rpg_conflict/,
    );
    await unchanged();
    const wrongActor = structuredClone(packet);
    wrongActor.worldSettlement.nextWorld.actors.find(
      (actor) => actor.entityId === f.hero,
    ).locationId = anchor;
    await assert.rejects(
      f.runtime(f.cid, "commit", { ...claim.lease, packet: wrongActor }),
      /rpg_validation|rpg_conflict/,
    );
    await unchanged();
    const committed = await s.commit(claim.lease, packet);
    assert.equal(committed.status, "committed");
    assert.equal((await f.snapshot()).publicState.current_location_id, copper);
  } finally {
    await f.db.close();
  }
});
