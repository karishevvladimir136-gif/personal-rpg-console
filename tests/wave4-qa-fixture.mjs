import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { fixture, world } from "./phase35-storage-fixture.mjs";

// Optional local review target. Never edits Lead's production files, contacts a
// provider, or uses application credentials. Every SQL test uses fresh PGlite.
export const sourceRoot = process.env.WAVE4_QA_SOURCE_ROOT
  ? pathToFileURL(
      `${process.env.WAVE4_QA_SOURCE_ROOT.replaceAll("\\", "/").replace(/\/$/, "")}/`,
    )
  : new URL("../", import.meta.url);
export const source = (path) => new URL(path, sourceRoot);
export const moduleFromSource = (path) =>
  import(source(`src/lib/${path}`).href);
const { readFoundationLoop, loopCommand, createLoopStore } =
  await moduleFromSource("foundation-loop/authority.ts");
const { planCommerceConfiguration } = await moduleFromSource(
  "foundation-loop/configuration.ts",
);
const { createTradeQuote, executeTradeQuote } =
  await moduleFromSource("commerce/index.ts");
const { planProgressionDefinitions, planReward } = await moduleFromSource(
  "progression/index.ts",
);

export async function qaFixture() {
  const f = await fixture(12);
  await f.db.exec(
    await readFile(
      process.env.WAVE4_QA_MIGRATION ??
        source("supabase/migrations/202609200013_production_wave4.sql"),
      "utf8",
    ),
  );
  const w = await world(f, "Synthetic independent Wave 4 QA");
  const rpc = async (args) => {
    try {
      const row = await f.one(
        "select public.rpg_world($1,$2,$3,$4::jsonb,$5::jsonb) result",
        [
          args.p_owner_id,
          args.p_campaign_id,
          args.p_action,
          JSON.stringify(args.p_payload),
          JSON.stringify(args.p_timeline),
        ],
      );
      return { data: row.result };
    } catch (error) {
      return { error: { message: error.message, code: error.code } };
    }
  };
  const read = async () =>
    readFoundationLoop(rpc, f.owner, w.cid, await f.fence(w.cid));
  const store = createLoopStore(rpc, f.owner, w.cid);
  const prepare = async (kind, input, planner, operationId = randomUUID()) => {
    const context = await read(),
      command = loopCommand(context, operationId);
    return {
      context,
      request: { command, kind, input },
      plan: planner(context, command, input),
    };
  };
  const rawCommit = (prepared, extra = {}) =>
    rpc({
      p_owner_id: f.owner,
      p_campaign_id: w.cid,
      p_action: "loop_commit",
      p_timeline: prepared.request.command.timeline,
      p_payload: { ...prepared.request, plan: prepared.plan },
      ...extra,
    });
  const commit = async (prepared) =>
    store.commit(prepared.request, prepared.plan);
  const checkpoint = async (name = "QA exact point") =>
    f.saves(w.cid, "create", await f.command(w.cid, { kind: "manual", name }));
  const load = async (saveId) =>
    f.saves(
      w.cid,
      "load",
      await f.command(w.cid, {
        saveId,
        label: "QA synthetic fork",
        recovery: false,
      }),
    );
  const switchTo = async (timelineId) =>
    f.saves(
      w.cid,
      "switch",
      await f.command(w.cid, { timelineId, recovery: false }),
    );
  return {
    ...f,
    ...w,
    rpc,
    read,
    store,
    prepare,
    rawCommit,
    commit,
    checkpoint,
    load,
    switchTo,
  };
}

export async function commerceFixture() {
  const f = await qaFixture();
  try {
    const merchant = (
      await f.mutation("entity.save", f.cid, {
        kind: "npc",
        name: "QA merchant",
        details: "Synthetic trader",
        hp: null,
        max_hp: null,
        stats: {},
        resources: { credits: 200 },
        conditions: [],
        equipment_slots: [],
      })
    ).id;
    const stockStorage = (
      await f.mutation("storage.save", f.cid, {
        kind: "merchant",
        name: "QA stock",
        entity_id: merchant,
      })
    ).id;
    const stock = (
      await f.mutation("item.save", f.cid, {
        name: "QA lantern",
        category: "tool",
        quantity: 6,
        description: "Public synthetic stock",
        mechanics: "",
        owner_entity_id: merchant,
        storage_id: stockStorage,
        equipped_entity_id: null,
        equipped_slot: null,
      })
    ).id;
    // Controlled fixture setup, not an application API: give the player explicit
    // non-fantasy currency while preserving the unrelated focus resource.
    await f.one(
      "update public.rpg_entities set resources=resources||'{\"credits\":100}'::jsonb,revision=revision+1 where id=$1",
      [f.hero],
    );
    const definitions = {
      currencies: [
        { id: "credits", label: "Credits", resourceKey: "credits", version: 1 },
      ],
      itemPolicies: [
        {
          itemId: stock,
          currencyId: "credits",
          unitValue: 10,
          version: 1,
          trade: "allowed",
          origin: "legitimate",
          visibility: "public",
        },
      ],
      merchants: [
        {
          actorId: merchant,
          entityId: merchant,
          label: "QA merchant",
          version: 1,
          storageId: stockStorage,
          currencyIds: ["credits"],
          available: true,
          acceptsStolen: false,
          usesFunds: true,
          capacity: null,
          buyBasisPoints: 5000,
          sellBasisPoints: 10000,
          haggleLimitBasisPoints: 1000,
        },
      ],
    };
    const configured = await f.prepare(
      "commerce.configure",
      definitions,
      planCommerceConfiguration,
    );
    await f.commit(configured);
    const quote = async (more = {}, operationId = randomUUID()) => {
      const context = await f.read(),
        command = loopCommand(context, operationId);
      const input = createTradeQuote(context, command, {
        merchantActorId: merchant,
        playerEntityId: f.hero,
        take: [{ itemId: stock, quantity: 2 }],
        give: [],
        currencyId: "credits",
        haggle: "none",
        ...more,
      });
      return {
        context,
        request: { command, kind: "trade", input },
        plan: executeTradeQuote(context, input),
      };
    };
    return { ...f, merchant, stockStorage, stock, definitions, quote };
  } catch (error) {
    await f.db.close();
    throw error;
  }
}

export async function rewardFixture() {
  const f = await commerceFixture();
  try {
    await f.one(
      "update public.rpg_quests set status='complete',revision=revision+1 where id=$1",
      [f.quest],
    );
    const definitions = {
      progression: "on",
      tracks: [
        {
          id: "experience",
          version: 1,
          label: "Experience",
          kind: "classic_xp",
          thresholds: [10, 20],
          choices: [
            { id: "scout", label: "Scouting", capability: "Scouting" },
            { id: "guide", label: "Guiding", capability: "Guiding" },
          ],
        },
      ],
      rewards: [
        {
          id: "delivery",
          version: 1,
          label: "Delivery reward",
          source: { kind: "quest", id: f.quest },
          distribution: "actor",
          recipientIds: [f.hero],
          entries: [
            { kind: "progression", trackId: "experience", amount: 15 },
            { kind: "currency", currencyId: "credits", amount: 7 },
            { kind: "item", itemId: f.stock, quantity: 1 },
          ],
        },
      ],
    };
    await f.commit(
      await f.prepare(
        "progression.configure",
        definitions,
        planProgressionDefinitions,
      ),
    );
    const reward = (
      input = { rewardId: "delivery", expectedRewardVersion: 1 },
    ) => f.prepare("reward", input, planReward);
    return { ...f, rewardDefinitions: definitions, reward };
  } catch (error) {
    await f.db.close();
    throw error;
  }
}

export async function persistedState(f) {
  return f.one(
    `select
    (select jsonb_agg(to_jsonb(e) order by e.id) from public.rpg_entities e where campaign_id=$1) entities,
    (select jsonb_agg(to_jsonb(i) order by i.id) from public.rpg_items i where campaign_id=$1) items,
    (select to_jsonb(w) from rpg_private.world_foundations w where campaign_id=$1) foundation,
    (select revision from rpg_private.runtime_state where campaign_id=$1) runtime,
    (select count(*)::integer from rpg_private.turns where campaign_id=$1) turns,
    (select count(*)::integer from rpg_private.world_events where campaign_id=$1) events,
    (select count(*)::integer from rpg_private.world_commands where campaign_id=$1) receipts,
    (select count(*)::integer from rpg_private.timeline_versions where campaign_id=$1) versions,
    (select count(*)::integer from rpg_private.save_points where campaign_id=$1) saves`,
    [f.cid],
  );
}
