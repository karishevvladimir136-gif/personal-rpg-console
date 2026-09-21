import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { syntheticWorld } from "./wave1-qa-storage-fixture.mjs";
import { readDetachedState } from "../src/lib/saves/detached-reader.ts";
import { createRpcLabStore } from "../src/lib/world-lab/store.ts";

/** Disposable, source-free owner-authored Scenario. No application credentials. */
export async function labFixture(options = {}) {
  const f = await fixture(13);
  if (options.beforeMigration) await options.beforeMigration(f);
  await f.db.exec(
    await readFile(
      new URL(
        "../supabase/migrations/202609200014_world_lab_d1.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const w = await world(f, "D1 synthetic detached proof");
  const foundation = async (action = "read", payload = {}) =>
    (
      await f.one(
        "select public.rpg_world($1,$2,$3,$4::jsonb,$5::jsonb) result",
        [
          f.owner,
          w.cid,
          action,
          JSON.stringify(payload),
          JSON.stringify(await f.fence(w.cid)),
        ],
      )
    ).result;
  const state = syntheticWorld(w);
  state.threads[0].steps.push({
    ...structuredClone(state.threads[0].steps[0]),
    id: randomUUID(),
    trigger: { ...state.threads[0].steps[0].trigger, atWorldMinutes: 70 },
    privateText: "PRIVATE_SECOND_STEP",
    publicOutcome: {
      text: "A second bell answers.",
      actorIds: [w.npc],
      evidence: [],
    },
  });
  if (options.transformWorld) options.transformWorld(state, w);
  const snap = await foundation();
  await foundation("configure", {
    command: {
      operationId: randomUUID(),
      campaignId: w.cid,
      timeline: snap.timeline,
      expectedRevision: snap.revision,
      expectedRuntimeRevision: snap.runtimeRevision,
      expectedHeadId: snap.headId,
    },
    world: state,
  });
  const approval = {
    ownerId: f.owner,
    reviewedConflictIds: [],
    reviewedUnknownIds: [],
  };
  const record = (kind, body) => ({
    schemaVersion: 1,
    ownerId: f.owner,
    kind,
    id: randomUUID(),
    versionId: randomUUID(),
    version: 1,
    previousVersionId: null,
    body,
  });
  const scenario = record("scenario", {
    schemaVersion: 1,
    title: "Quiet harbor premise",
    status: "approved",
    packVersionIds: [],
    sourceVersionIds: [],
    sourcePriority: [],
    entry: { label: "Before the bell", worldMinutes: 0, evidence: [] },
    adaptation: "original",
    identities: [],
    assumptions: [
      { id: randomUUID(), text: "An invented harbor.", visibility: "public" },
      {
        id: randomUUID(),
        text: "PRIVATE_PREMISE_CANARY",
        visibility: "private",
      },
    ],
    carriedClaimIds: [],
    localHistory: null,
    unresolvedConflictIds: [],
    approval,
  });
  const divergence = record("divergence", {
    schemaVersion: 1,
    scenarioVersionId: scenario.versionId,
    title: "Observe the next two hours",
    changes: [
      {
        id: randomUUID(),
        text: "Consider this as a detached experiment.",
        visibility: "public",
      },
      {
        id: randomUUID(),
        text: "PRIVATE_DIVERGENCE_CANARY",
        visibility: "private",
      },
    ],
    approval,
  });
  const library = async (r) =>
    (
      await f.one(
        "select public.rpg_library($1,null,'put',$2::jsonb,null) result",
        [f.owner, JSON.stringify({ operationId: randomUUID(), record: r })],
      )
    ).result;
  await library(scenario);
  await library(divergence);
  await f.saves(
    w.cid,
    "create",
    await f.command(w.cid, { kind: "manual", name: "D1 exact base" }),
  );
  const save = await f.one(
    "select * from rpg_private.save_points where campaign_id=$1 and name='D1 exact base' order by created_at desc limit 1",
    [w.cid],
  );
  const lab = async (
    action,
    payload = {},
    ownerId = f.owner,
    campaignId = w.cid,
  ) =>
    (
      await f.one("select public.rpg_world_lab($1,$2,$3,$4::jsonb) result", [
        ownerId,
        campaignId,
        action,
        JSON.stringify(payload),
      ])
    ).result;
  const rpc = async (args) => {
    try {
      return {
        data: await lab(
          args.p_action,
          args.p_payload,
          args.p_owner_id,
          args.p_campaign_id,
        ),
      };
    } catch (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
      };
    }
  };
  const store = createRpcLabStore(f.owner, rpc, readDetachedState);
  const request = {
    operationId: randomUUID(),
    campaignId: w.cid,
    saveId: save.id,
    scenarioVersionId: scenario.versionId,
    divergenceVersionId: divergence.versionId,
    label: "Detached harbor",
    horizonMinutes: 120,
  };
  const active = async () => {
    const tables = (await f.one("select rpg_private.timeline_tables() tables"))
      .tables;
    const projection = {};
    for (const table of tables)
      projection[table] = await f.query(
        `select to_jsonb(t)-'search_vector' row from ${table} t where campaign_id=$1 order by to_jsonb(t)::text`,
        [w.cid],
      );
    return {
      projection,
      campaign: await f.one(
        "select * from rpg_private.timeline_campaigns where campaign_id=$1",
        [w.cid],
      ),
      timelines: await f.query(
        "select * from rpg_private.timelines where campaign_id=$1 and purpose='playable' order by id",
        [w.cid],
      ),
    };
  };
  return {
    ...f,
    ...w,
    foundation,
    worldState: state,
    scenario,
    divergence,
    library,
    save,
    lab,
    rpc,
    store,
    request,
    active,
  };
}
