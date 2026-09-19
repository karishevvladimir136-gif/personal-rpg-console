import { readFile, readdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";

export async function fixture(maxMigration = 99) {
  const db = new PGlite();
  const owner = randomUUID(),
    other = randomUUID();
  const query = async (sql, params = []) => (await db.query(sql, params)).rows;
  const one = async (sql, params = []) => (await query(sql, params))[0];
  await db.exec(
    "create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;",
  );
  const folder = new URL("../supabase/migrations/", import.meta.url);
  const files = (await readdir(folder))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files.slice(0, maxMigration))
    await db.exec(await readFile(new URL(file, folder), "utf8"));
  await one("insert into auth.users(id) values($1),($2)", [owner, other]);
  await one("insert into rpg_private.owner_registry(user_id) values($1)", [
    owner,
  ]);
  await one("select set_config('request.jwt.claim.sub',$1,false)", [owner]);
  const saves = async (cid, action, payload = {}, user = owner) =>
    (
      await one("select public.rpg_saves($1,$2,$3,$4::jsonb) result", [
        user,
        cid,
        action,
        JSON.stringify(payload),
      ])
    ).result;
  const fence = async (cid) => saves(cid, "fence");
  const mutation = async (
    op,
    cid,
    payload,
    rev = 0,
    scope = "timeline",
    providedFence = undefined,
  ) => {
    const args = [randomUUID(), op, cid, rev, JSON.stringify(payload)];
    if (maxMigration >= 9) {
      args.push(
        cid ? JSON.stringify(providedFence ?? (await fence(cid))) : null,
        scope,
      );
    }
    return (
      await one(
        `select public.rpg_apply_mutation($1,$2,$3,$4,$5::jsonb${maxMigration >= 9 ? ",$6::jsonb,$7" : ""}) result`,
        args,
      )
    ).result;
  };
  const campaign = async (name = "Synthetic branches") =>
    (
      await mutation("campaign.create", null, {
        title: name,
        subtitle: "",
        language: "en",
      })
    ).id;
  const command = async (cid, more) => {
    const data = await saves(cid, "read");
    return {
      requestId: randomUUID(),
      campaignId: cid,
      timeline: data.timeline,
      expectedRevision: data.runtimeRevision,
      expectedSavesRevision: data.revision,
      ...more,
    };
  };
  const runtime = async (cid, action, payload = {}, bound = undefined) =>
    (
      await one(
        "select public.rpg_runtime($1,$2,$3,$4::jsonb,$5::jsonb) result",
        [
          owner,
          cid,
          action,
          JSON.stringify(payload),
          JSON.stringify(bound ?? (await fence(cid))),
        ],
      )
    ).result;
  const memory = async (cid, action, payload = {}, bound = undefined) =>
    (
      await one(
        "select public.rpg_memory($1,$2,$3,$4::jsonb,$5::jsonb) result",
        [
          owner,
          cid,
          action,
          JSON.stringify(payload),
          JSON.stringify(bound ?? (await fence(cid))),
        ],
      )
    ).result;
  return {
    db,
    owner,
    other,
    query,
    one,
    saves,
    fence,
    mutation,
    campaign,
    command,
    runtime,
    memory,
    folder,
    files,
  };
}

export async function world(f, name = "Synthetic branch world") {
  const cid = await f.campaign(name);
  const hero = (
    await f.mutation("entity.save", cid, {
      kind: "player",
      name: "Ari",
      details: "Synthetic explorer",
      hp: 7,
      max_hp: 12,
      stats: { skill: 2 },
      resources: { focus: 3 },
      conditions: [],
      equipment_slots: [{ id: "hand", label: "Hand", accepts: ["weapon"] }],
    })
  ).id;
  const npc = (
    await f.mutation("entity.save", cid, {
      kind: "companion",
      name: "Nera",
      details: "Knows only witnessed events",
      hp: 5,
      max_hp: 8,
      stats: {},
      resources: {},
      conditions: [],
      equipment_slots: [],
    })
  ).id;
  const storage = (
    await f.mutation("storage.save", cid, {
      name: "Ari pack",
      kind: "player",
      entity_id: hero,
    })
  ).id;
  const item = (
    await f.mutation("item.save", cid, {
      name: "Brass compass",
      category: "weapon",
      quantity: 1,
      description: "Synthetic keepsake",
      mechanics: "",
      owner_entity_id: hero,
      storage_id: storage,
      equipped_entity_id: hero,
      equipped_slot: "hand",
    })
  ).id;
  const sid = (
    await f.mutation("session.save", cid, {
      title: "Crossing",
      status: "open",
      recap: "",
    })
  ).id;
  const location = (
    await f.mutation("location.save", cid, {
      name: "Old bridge",
      description: "Synthetic crossing",
      status: "visited",
    })
  ).id;
  const quest = (
    await f.mutation("quest.save", cid, {
      title: "Deliver compass",
      description: "Nera waits",
      status: "open",
    })
  ).id;
  const scene = (
    await f.mutation("scene.save", cid, {
      session_id: sid,
      title: "Before crossing",
      body: "Nera promised to carry the brass compass after sunrise.",
      role: "narration",
    })
  ).id;
  await f.mutation(
    "state.save",
    cid,
    {
      summary: "Waiting at the old bridge",
      current_session_id: sid,
      current_scene_id: scene,
      current_location_id: location,
    },
    1,
  );
  await f.one(
    "insert into rpg_private.dm_state(campaign_id,contents) values($1,$2)",
    [cid, { fact: { secret: "PRIVATE_BEFORE_FORK" }, clock: { omen: 1 } }],
  );
  await f.runtime(cid, "configure", {
    requestId: randomUUID(),
    campaignId: cid,
    expectedRevision: (await f.runtime(cid, "play")).revision,
    configuration: {
      profile: "console-basic-v1",
      controlledEntityIds: [hero],
      presentEntityIds: [hero, npc],
      nearbyStorageIds: [],
      safeLocationIds: [location],
      itemRules: [],
    },
  });
  return { cid, hero, npc, storage, item, sid, location, quest, scene };
}

export async function commitEvent(f, w, overrides = {}) {
  const input = {
    operationId: randomUUID(),
    campaignId: w.cid,
    expectedRevision: (await f.runtime(w.cid, "play")).revision,
    mode: "game",
    input: "A new synthetic choice",
    companionId: null,
    listenerIds: [],
    mechanic: null,
    ...overrides.input,
  };
  await f.runtime(w.cid, "begin", input);
  const claim = await f.runtime(w.cid, "claim", {
    operationId: input.operationId,
  });
  const packet = {
    narration: "The bell rings at the old bridge.",
    visualDescription: "",
    resolution: {
      changes: [],
      worldMinutes: claim.source.runtime.worldMinutes,
      configuration: claim.source.runtime.configuration,
      outcomes: [],
    },
    privatePatches: [],
    checks: [],
    guidanceProposal: null,
    ...overrides.packet,
  };
  const result = await f.runtime(w.cid, "commit", { ...claim.lease, packet });
  return { input, claim, packet, result };
}
