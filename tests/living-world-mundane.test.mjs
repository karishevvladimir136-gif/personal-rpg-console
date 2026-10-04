import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import { setup } from "./universal-bootstrap-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { runTurn } from "../src/lib/gameplay/turn-engine.ts";
import {
  worldLogicTurnPreparer,
  worldTurnPreparer,
} from "../src/lib/production/turn-world.ts";
import { worldLogicContext } from "../src/lib/rulesets/world-logic.ts";
import { stableGameplayId } from "../src/lib/gameplay/dice.ts";

const migration = new URL(
  "../supabase/migrations/202609300033_living_world_mundane_turn.sql",
  import.meta.url,
);

async function setupWorld() {
  const f = await setup(undefined, "en", 32);
  f.errors = [];
  await f.create();
  await f.startOpening();
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
      f.errors.push({ action: a.p_action, message: e.message, where: e.where });
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
      f.errors.push({ action: a.p_action, message: e.message, where: e.where });
      return { error: { code: e.code, message: e.message } };
    }
  };
  const store = createRpcTurnStore(
    f.owner,
    runtime,
    "synthetic-scripted",
    await f.fence(f.cid),
  );
  return { f, store, world };
}

function proposal(input, f, name = "The Copper Bathhouse") {
  const current = input.source.snapshot.publicState.current_location_id;
  return {
    schemaVersion: 3,
    actorId: f.hero,
    input: input.input.input,
    uncertainty: "resolved",
    circumstanceRefs: [`location:${current}`],
    evidenceIndexes: [],
    kind: "location.establish",
    anchorLocationId: current,
    destinationId: null,
    name,
    category: "bathhouse",
    vicinity: "nearby",
  };
}

function dependencies(f, store, world, choose = (input) => proposal(input, f)) {
  const usage = {
    model: "synthetic-scripted",
    inputTokens: 0,
    outputTokens: 0,
    calls: 0,
    latencyMs: 0,
  };
  const options = {
    action: async (input) => ({ output: choose(input), usage }),
  };
  return {
    store,
    provider: {
      plan: () => assert.fail("World Logic must not call legacy planner"),
      feedback: () => assert.fail("No feedback"),
      narrate: async () => ({
        output: {
          narration: "A public bathhouse stands nearby.",
          visualDescription: "",
          clarification: null,
        },
        usage,
      }),
    },
    prepareWorldLogic: worldLogicTurnPreparer(world, options),
    prepareWorld: worldTurnPreparer(world, options),
  };
}

async function inputFor(
  f,
  store,
  inputText = "Where is an ordinary bathhouse nearby?",
) {
  const play = await store.readPlay(f.cid);
  return {
    operationId: randomUUID(),
    campaignId: f.cid,
    timeline: play.timeline,
    expectedRevision: play.revision,
    mode: "game",
    input: inputText,
    companionId: null,
    listenerIds: [],
    mechanic: null,
  };
}

async function tableFingerprints(f) {
  const tables = await f.query(
    "select schemaname,tablename from pg_tables where schemaname in ('public','rpg_private') and tablename like 'rpg_%' order by schemaname,tablename",
  );
  return Promise.all(
    tables.map(async ({ schemaname, tablename }) => {
      const row = await f.one(
        `select count(*)::integer n,md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by to_jsonb(t)::text),'')) fingerprint from ${schemaname}.${tablename} t`,
      );
      return { schemaname, tablename, ...row };
    }),
  );
}

async function stagedMundane(f, store, world) {
  const input = await inputFor(f, store);
  await store.begin(input);
  const claim = await store.claim(f.cid, input.operationId);
  assert.ok(claim);
  let logicInput;
  const logic = await worldLogicTurnPreparer(world, {
    action: async (i) => {
      logicInput = i;
      return {
        output: proposal(i, f),
        usage: {
          model: "synthetic-scripted",
          inputTokens: 0,
          outputTokens: 0,
          calls: 0,
          latencyMs: 0,
        },
      };
    },
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
  await store.checkpoint(claim.lease, checkpoint, "generating");
  assert.equal(
    await worldTurnPreparer(world)(
      { ...claim, turn: { ...claim.turn, checkpoint } },
      checkpoint.resolution,
      null,
    ),
    null,
  );
  const packet = {
    narration: "A public bathhouse stands nearby.",
    visualDescription: "",
    resolution: checkpoint.resolution,
    privatePatches: [],
    checks: [],
    guidanceProposal: null,
  };
  return { input, claim, checkpoint, packet, logicInput };
}

test("migration 32 to 33 preserves populated state and commits one ordinary Location atomically", async () => {
  const { f, store, world } = await setupWorld();
  try {
    const before = await f.snapshot();
    const fingerprints = await tableFingerprints(f);
    const definitions = () =>
      f.query(
        "select n.nspname,p.proname,md5(pg_get_functiondef(p.oid)) hash from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='rpg_private' and (p.proname like 'memory_%' or p.proname in ('world_validate_settlement','world_validate_settlement_before_logic')) order by p.proname,p.oid",
      );
    const functionDefs = await definitions();
    const triggers = await f.query(
      "select c.relname,t.tgname,md5(pg_get_triggerdef(t.oid)) hash from pg_trigger t join pg_class c on c.oid=t.tgrelid where not t.tgisinternal and (t.tgname like 'memory_%' or c.relname='rpg_locations') order by c.relname,t.tgname",
    );
    await f.db.exec(await readFile(migration, "utf8"));
    assert.deepEqual(await f.snapshot(), before);
    assert.deepEqual(await tableFingerprints(f), fingerprints);
    assert.deepEqual(await definitions(), functionDefs);
    assert.deepEqual(
      await f.query(
        "select c.relname,t.tgname,md5(pg_get_triggerdef(t.oid)) hash from pg_trigger t join pg_class c on c.oid=t.tgrelid where not t.tgisinternal and (t.tgname like 'memory_%' or c.relname='rpg_locations') order by c.relname,t.tgname",
      ),
      triggers,
    );
    const originalWorld = (
      await f.one(
        "select world from rpg_private.world_foundations where campaign_id=$1",
        [f.cid],
      )
    ).world;
    const input = await inputFor(f, store);
    const deps = dependencies(f, store, world);
    const result = await runTurn(input, deps);
    assert.equal(
      result.status,
      "committed",
      JSON.stringify({ result, errors: f.errors }),
    );
    const placeId = stableGameplayId(
      input.operationId,
      "living-world:location",
    );
    const place = await f.one(
      "select * from public.rpg_locations where id=$1 and campaign_id=$2",
      [placeId, f.cid],
    );
    assert.equal(place?.name, "The Copper Bathhouse");
    assert.equal(place?.status, "known");
    assert.deepEqual(await runTurn(input, deps), result);
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from public.rpg_locations where id=$1",
          [placeId],
        )
      ).n,
      1,
    );
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.memory_public_sources where campaign_id=$1 and source_id=$2 and kind='location'",
          [f.cid, placeId],
        )
      ).n,
      1,
    );
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.runtime_events where campaign_id=$1 and operation_id=$2",
          [f.cid, input.operationId],
        )
      ).n,
      1,
    );
    const afterWorld = await f.one(
      "select world from rpg_private.world_foundations where campaign_id=$1",
      [f.cid],
    );
    assert.deepEqual(afterWorld.world, originalWorld);
    assert.deepEqual(afterWorld.world.threads, []);
    assert.deepEqual(afterWorld.world.hooks, []);
    assert.deepEqual(afterWorld.world.warnings, []);
    const next = await inputFor(f, store, "I look around the square.");
    const oldPath = dependencies(f, store, world, (i) => {
      const context = worldLogicContext(i);
      assert.ok(context.locations.some((row) => row.id === placeId));
      assert.equal(
        context.travelOptions.some((row) => row.destinationId === placeId),
        false,
      );
      return {
        schemaVersion: 1,
        actorId: f.hero,
        input: i.input.input,
        action: "observe",
        outcome: "completed",
        uncertainty: "resolved",
        capabilityRefs: [],
        circumstanceRefs: ["public-state"],
        evidenceIndexes: [],
        publicText: "The square remains in view.",
        elapsedMinutes: 0,
        destinationId: null,
      };
    });
    assert.equal((await runTurn(next, oldPath)).status, "committed");
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.world_events where campaign_id=$1 and operation_id=$2 and event->>'kind'='world.logic.resolved'",
          [f.cid, next.operationId],
        )
      ).n,
      1,
    );
  } finally {
    await f.db.close();
  }
});

test("structured resolver accepts one mundane proposal through a root object schema", async () => {
  const { f, store, world } = await setupWorld();
  try {
    const turn = await stagedMundane(f, store, world);
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
        assert.equal(sent.text.format.schema.type, "object");
        assert.equal(sent.text.format.schema.properties.action.anyOf.length, 3);
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
                      action: proposal(turn.logicInput, f),
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
      (await provider.action(turn.logicInput)).output.kind,
      "location.establish",
    );
  } finally {
    await f.db.close();
  }
});

test("mundane commit rejects cross-campaign IDs and hitchhiking effects without partial writes", async () => {
  const { f, store, world } = await setupWorld();
  try {
    await f.db.exec(await readFile(migration, "utf8"));
    const otherCampaign = await f.campaign("Synthetic unrelated campaign");
    const foreign = (
      await f.mutation("location.save", otherCampaign, {
        name: "Foreign place",
        description: "Other campaign",
        status: "known",
      })
    ).id;
    const turn = await stagedMundane(f, store, world);
    const base = await tableFingerprints(f);
    const attempt = async (packet) => {
      await assert.rejects(
        f.runtime(f.cid, "commit", { ...turn.claim.lease, packet }),
        /rpg_validation|rpg_conflict/,
      );
      assert.deepEqual(await tableFingerprints(f), base);
    };
    const change = turn.packet.resolution.changes[0];
    await attempt({
      ...turn.packet,
      resolution: {
        ...turn.packet.resolution,
        changes: [{ ...change, id: foreign }],
      },
    });
    await attempt({
      ...turn.packet,
      resolution: {
        ...turn.packet.resolution,
        changes: [
          ...turn.packet.resolution.changes,
          {
            family: "items",
            id: randomUUID(),
            expectedRevision: null,
            values: { name: "Free sword" },
          },
        ],
      },
    });
    await attempt({
      ...turn.packet,
      resolution: {
        ...turn.packet.resolution,
        changes: [
          ...turn.packet.resolution.changes,
          {
            family: "entities",
            id: randomUUID(),
            expectedRevision: null,
            values: { name: "Free actor" },
          },
        ],
      },
    });
    await attempt({
      ...turn.packet,
      resolution: {
        ...turn.packet.resolution,
        changes: [
          ...turn.packet.resolution.changes,
          {
            family: "quests",
            id: randomUUID(),
            expectedRevision: null,
            values: { title: "Free quest" },
          },
        ],
      },
    });
    await attempt({
      ...turn.packet,
      resolution: {
        ...turn.packet.resolution,
        changes: [
          ...turn.packet.resolution.changes,
          {
            family: "entities",
            id: f.hero,
            expectedRevision: 1,
            values: { resources: { coins: 100 } },
          },
        ],
      },
    });
    await attempt({
      ...turn.packet,
      privatePatches: [{ kind: "set", key: "hidden", value: true }],
    });
    const committed = await store.commit(turn.claim.lease, turn.packet);
    assert.equal(committed.status, "committed");
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from public.rpg_locations where id=$1",
          [stableGameplayId(turn.input.operationId, "living-world:location")],
        )
      ).n,
      1,
    );
  } finally {
    await f.db.close();
  }
});
