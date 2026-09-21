import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";

// Optional independent integration review target. No credentials, network,
// provider, hosted database, or mutation of that target is used by this suite.
export const sourceRoot = process.env.D1_QA_SOURCE_ROOT
  ? pathToFileURL(
      `${process.env.D1_QA_SOURCE_ROOT.replaceAll("\\", "/").replace(/\/$/, "")}/`,
    )
  : new URL("../", import.meta.url);
export const source = (path) => new URL(path, sourceRoot);
export const moduleFromSource = (path) => import(source(path).href);
export const sourceText = (path) => readFile(source(path), "utf8");

export async function qaFixture(options) {
  const { labFixture } = await moduleFromSource("tests/d1-sql-fixture.mjs");
  const f = await labFixture(options);
  const call = f.lab;
  f.lab = async (...args) => {
    try {
      return await call(...args);
    } catch (error) {
      // Keep a useful SQL location while avoiding massive fixture payload dumps.
      const safe = new Error(error.message);
      safe.code = error.code;
      safe.where = error.where;
      safe.internalQuery = error.internalQuery;
      throw safe;
    }
  };
  return f;
}

export async function running(f, request = f.request) {
  const run = await f.store.prepare(request);
  return f.store.claim({
    operationId: randomUUID(),
    campaignId: f.cid,
    runId: run.id,
    expectedRevision: run.revision,
  });
}

export async function commitPlan(
  f,
  run,
  through = 30,
  operationId = randomUUID(),
) {
  const { buildDetachedWorldCommit } = await moduleFromSource(
    "src/lib/world-lab/writer.ts",
  );
  const { createDetachedRunFence } = await moduleFromSource(
    "src/lib/saves/detached-fence.ts",
  );
  const state = await f.store.readDetached(f.cid, run.id);
  const rt = state.records["rpg_private.runtime_state"][0];
  const wf = state.records["rpg_private.world_foundations"][0];
  const timeline = { timelineId: run.timelineId, epoch: 1 };
  const snapshot = {
    schemaVersion: 1,
    ownerId: f.owner,
    campaignId: f.cid,
    timeline,
    revision: wf.revision,
    runtimeRevision: rt.revision,
    headId: state.manifest.id,
    worldMinutes: rt.world_minutes,
    world: wf.world,
    bindings: wf.bindings,
    ruleset: wf.ruleset,
    executionPolicy: wf.execution_policy,
  };
  // Minimal input for the existing pure World validator, built solely from the
  // exact detached read. This is not a substitute for a playable RuntimeSource.
  const input = {
    state,
    fence: createDetachedRunFence(state.run),
    operationId,
    throughWorldMinutes: through,
    worldInput: {
      snapshot,
      command: {
        operationId,
        campaignId: f.cid,
        timeline,
        expectedRevision: wf.revision,
        expectedRuntimeRevision: rt.revision,
        expectedHeadId: state.manifest.id,
      },
      source: {
        ownerId: f.owner,
        snapshot: {
          campaign: { id: f.cid },
          timeline,
          entities: state.records["public.rpg_entities"],
          locations: state.records["public.rpg_locations"],
          publicState: state.records["public.rpg_public_state"][0],
        },
        runtime: {
          campaignId: f.cid,
          revision: rt.revision,
          worldMinutes: rt.world_minutes,
          configuration: rt.configuration,
          timeline,
        },
      },
      resolution: {
        changes: [],
        worldMinutes: through,
        configuration: rt.configuration,
        outcomes: [],
      },
      trigger: "time_skip",
    },
  };
  return { state, input, plan: buildDetachedWorldCommit(input) };
}

export async function seedWave4(f) {
  const { readFoundationLoop, loopCommand } = await moduleFromSource(
    "src/lib/foundation-loop/authority.ts",
  );
  const { planCommerceConfiguration } = await moduleFromSource(
    "src/lib/foundation-loop/configuration.ts",
  );
  const { planProgressionDefinitions, planReward } = await moduleFromSource(
    "src/lib/progression/index.ts",
  );
  const rpc = async (args) => ({
    data: await f.foundation(args.p_action, args.p_payload),
  });
  const apply = async (kind, input, planner) => {
    const context = await readFoundationLoop(
      rpc,
      f.owner,
      f.cid,
      await f.fence(f.cid),
    );
    const command = loopCommand(context, randomUUID());
    return f.foundation("loop_commit", {
      command,
      kind,
      input,
      plan: planner(context, command, input),
    });
  };
  await apply(
    "commerce.configure",
    {
      currencies: [
        { id: "credits", label: "Credits", resourceKey: "credits", version: 1 },
      ],
      itemPolicies: [
        {
          itemId: f.item,
          currencyId: "credits",
          unitValue: 3,
          version: 1,
          trade: "allowed",
          origin: "legitimate",
          visibility: "public",
        },
      ],
      merchants: [],
    },
    planCommerceConfiguration,
  );
  await f.one(
    "update public.rpg_quests set status='complete',revision=revision+1 where id=$1",
    [f.quest],
  );
  await apply(
    "progression.configure",
    {
      progression: "on",
      tracks: [
        {
          id: "experience",
          version: 1,
          label: "Experience",
          kind: "classic_xp",
          thresholds: [10, 20],
          choices: [{ id: "scout", label: "Scouting", capability: "Scouting" }],
        },
      ],
      rewards: [
        {
          id: "qa_delivery",
          version: 1,
          label: "Delivery reward",
          source: { kind: "quest", id: f.quest },
          distribution: "actor",
          recipientIds: [f.hero],
          entries: [
            { kind: "progression", trackId: "experience", amount: 15 },
            { kind: "currency", currencyId: "credits", amount: 7 },
          ],
        },
      ],
    },
    planProgressionDefinitions,
  );
  await apply(
    "reward",
    { rewardId: "qa_delivery", expectedRewardVersion: 1 },
    planReward,
  );
  await f.saves(
    f.cid,
    "create",
    await f.command(f.cid, { kind: "manual", name: "QA Wave 4 base" }),
  );
  const save = await f.one(
    "select * from rpg_private.save_points where campaign_id=$1 and name='QA Wave 4 base' order by created_at desc limit 1",
    [f.cid],
  );
  f.request = { ...f.request, operationId: randomUUID(), saveId: save.id };
  f.save = save;
}

export async function seedSource(f, transformPack = () => {}) {
  const { makeSource, makePack, entry } = await moduleFromSource(
    "tests/wave1-library-fixtures.mjs",
  );
  const { buildCampaignBinding } = await moduleFromSource(
    "src/lib/world-packs/bindings.ts",
  );
  const record = { ...makeSource(), ownerId: f.owner };
  const pack = makePack(record);
  pack.ownerId = f.owner;
  pack.body.approval.ownerId = f.owner;
  transformPack(pack);
  await f.library(record);
  await f.library(pack);
  const binding = buildCampaignBinding({
    id: randomUUID(),
    ownerId: f.owner,
    campaignId: f.cid,
    pack,
    entry: entry(),
    sourcePriority: [record.versionId],
    allocateEntityId: () => f.npc,
  });
  const snap = await f.foundation();
  await f.foundation("bind", {
    command: {
      operationId: randomUUID(),
      campaignId: f.cid,
      timeline: snap.timeline,
      expectedRevision: snap.revision,
      expectedRuntimeRevision: snap.runtimeRevision,
      expectedHeadId: snap.headId,
    },
    binding,
  });
  await f.saves(
    f.cid,
    "create",
    await f.command(f.cid, { kind: "manual", name: "QA source base" }),
  );
  f.save = await f.one(
    "select * from rpg_private.save_points where campaign_id=$1 and name='QA source base' order by created_at desc limit 1",
    [f.cid],
  );
  f.request = { ...f.request, operationId: randomUUID(), saveId: f.save.id };
  return record;
}

export async function liveProjection(f, campaignId = f.cid) {
  const { tables } = await f.one(
    "select to_jsonb(rpg_private.timeline_tables()) tables",
  );
  const rows = {};
  for (const table of tables) {
    // These identifiers come exclusively from the accepted SQL family allowlist.
    if (!/^(?:public|rpg_private)\.[a-z_]+$/.test(table))
      throw new Error("Invalid SQL family");
    const { data } = await f.one(
      `select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]') data from ${table} t where campaign_id=$1`,
      [campaignId],
    );
    rows[table] = data;
  }
  const authority = await f.one(
    `select
      (select to_jsonb(c) from rpg_private.timeline_campaigns c where campaign_id=$1) campaign,
      (select jsonb_agg(to_jsonb(t) order by t.id) from rpg_private.timelines t where campaign_id=$1 and purpose='playable') timelines`,
    [campaignId],
  );
  return { authority, rows };
}

export async function vaultState(f, campaignId = f.cid) {
  return f.one(
    `select
      (select count(*)::integer from rpg_private.timeline_versions where campaign_id=$1) versions,
      (select count(*)::integer from rpg_private.timeline_manifests where campaign_id=$1) manifests,
      (select jsonb_agg(to_jsonb(t) order by t.id) from rpg_private.timelines t where campaign_id=$1) timelines,
      (select jsonb_agg(to_jsonb(r) order by r.id) from rpg_private.world_lab_runs r where campaign_id=$1) runs,
      (select jsonb_agg(to_jsonb(c) order by c.operation_id,c.stage) from rpg_private.world_lab_commands c where campaign_id=$1) receipts`,
    [campaignId],
  );
}
