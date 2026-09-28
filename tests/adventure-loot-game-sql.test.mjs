import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

// Read-only review override. Integrated CI uses its own helper/code/migrations.
// Everything below runs in fresh in-memory PGlite; no credentials/provider/DB.
const root = process.env.ADVENTURE_LOOT_TEST_ROOT
  ? pathToFileURL(
      process.env.ADVENTURE_LOOT_TEST_ROOT.replaceAll("\\", "/").replace(
        /\/$/,
        "",
      ) + "/",
    )
  : new URL("../", import.meta.url);
const { commerceFixture, persistedState } = await import(
  new URL("tests/wave4-qa-fixture.mjs", root).href
);
const moduleFromSource = (path) =>
  import(new URL("src/lib/" + path, root).href);
const { createRpcTurnStore } = await moduleFromSource("gameplay/dm-store.ts");
const { recordServerRoll, stableGameplayId } =
  await moduleFromSource("gameplay/dice.ts");
const { runTurn, resumeTurn } = await moduleFromSource(
  "gameplay/turn-engine.ts",
);
const { validatePlan } = await moduleFromSource(
  "gameplay/mechanics/resolve.ts",
);
const { foundationTurnPreparer } = await moduleFromSource(
  "foundation-loop/turn.ts",
);
const { worldTurnPreparer } = await moduleFromSource(
  "production/turn-world.ts",
);
const { planLootObjectCorrection } = await moduleFromSource(
  "adventure-loot/planning.ts",
);
const { readLootObject } = await moduleFromSource("adventure-loot/state.ts");
const { lootActionOptions } = await moduleFromSource(
  "adventure-loot/runtime.ts",
);
const { foundationActionContext } = await moduleFromSource(
  "foundation-actions/context.ts",
);
const { buildContext } = await moduleFromSource("gameplay/dm-context.ts");
const { projectLootObjects } = await moduleFromSource(
  "adventure-loot/public.ts",
);
const { planCommerceConfiguration } = await moduleFromSource(
  "foundation-loop/configuration.ts",
);
const usage = {
  model: "synthetic-scripted",
  inputTokens: 0,
  outputTokens: 0,
  calls: 0,
  latencyMs: 0,
};
const budget = {
  model: "synthetic-scripted",
  contextLimit: 128000,
  outputReserve: 8192,
  safetyMargin: 8192,
  inputCap: 64000,
  accountingVersion: "synthetic",
};

async function lootFixture({ distinctActor = false } = {}) {
  const f = await commerceFixture();
  try {
    assert.ok(
      f.files[25]?.includes("026_adventure_loot"),
      "This regression requires the integrated migration 26.",
    );
    for (const file of f.files.slice(13, 26)) {
      try {
        await f.db.exec(await readFile(new URL(file, f.folder), "utf8"));
      } catch (error) {
        throw new Error("Disposable migration " + file + ": " + error.message);
      }
    }
    const context = await f.read(),
      player = context.world.actors.find((a) => a.entityId === f.hero);
    assert.ok(player);
    const actorId = distinctActor ? randomUUID() : player.id;
    player.id = actorId;
    player.capabilities.push("lockpick", "force-wood");
    await f.one(
      "update rpg_private.world_foundations set world=$2::jsonb,revision=revision+1 where campaign_id=$1",
      [f.cid, JSON.stringify(context.world)],
    );
    await f.one(
      "update rpg_private.timeline_campaigns set policy=jsonb_set(policy,'{autosave}','\"turn\"') where campaign_id=$1",
      [f.cid],
    );
    const secret = (
      await f.mutation("item.save", f.cid, {
        name: "Unopened wrapped stock",
        category: "tool",
        quantity: 137,
        description: "Contents have not been disclosed.",
        mechanics: "",
        owner_entity_id: f.merchant,
        storage_id: f.stockStorage,
        equipped_entity_id: null,
        equipped_slot: null,
      })
    ).id;
    const current = await f.read();
    // Trusted initial fixture facts are seeded privately, before gameplay.
    // The public owner command deliberately cannot author hidden ItemPolicy rows.
    current.state.itemPolicies.push({
      itemId: secret,
      version: 1,
      currencyId: "credits",
      unitValue: 9137,
      trade: "allowed",
      origin: "legitimate",
      visibility: "private",
    });
    current.state.version += 1;
    await f.one(
      "update rpg_private.world_foundations set loop_state=$2::jsonb,revision=revision+1 where campaign_id=$1",
      [f.cid, JSON.stringify(current.state)],
    );
    const objectId = randomUUID(),
      cacheId = randomUUID();
    const cacheStorage = (
      await f.mutation("storage.save", f.cid, {
        name: "Unspecified drawer",
        kind: "merchant",
        entity_id: f.merchant,
      })
    ).id;
    const route = (id, dc, to, extra = {}) => ({
      id,
      capability: id === "force" ? "force-wood" : "lockpick",
      from: ["locked"],
      lockClass: null,
      structureClass: null,
      environmentTags: [],
      requiresPortable: false,
      requiredItemIds: [],
      resourceCost: null,
      check: { index: 0, stat: "skill", dc },
      to,
      noise: to === "broken",
      fragileLoss: to === "broken" ? 1 : 0,
      ...extra,
    });
    const object = {
      schemaVersion: 1,
      campaignId: f.cid,
      id: objectId,
      revision: 1,
      storageId: f.stockStorage,
      locationId: f.location,
      ownerEntityId: f.merchant,
      label: "Weak wooden box",
      access: "locked",
      lockClass: "difficult-lock",
      structureClass: "weak-wood",
      environmentTags: ["stone-landing"],
      portable: true,
      contentsEstablished: true,
      materializationId: stableGameplayId(objectId, "established-stock"),
      knownBy: [actorId],
      contentsKnownBy: [],
    };
    const version = {
      schemaVersion: 1,
      expectedObjectRevision: null,
      authority: "owner",
      object,
      policy: {
        schemaVersion: 1,
        campaignId: f.cid,
        objectId,
        id: "synthetic-weak-wood",
        version: 1,
        profile: (await f.read()).state.profile,
        discoveryCheck: null,
        contents: [],
        approaches: [
          route("lock", 20, "open", { lockClass: "difficult-lock" }),
          route("force", 8, "broken", {
            structureClass: "weak-wood",
            environmentTags: ["stone-landing"],
            requiresPortable: true,
          }),
        ],
      },
      privateItems: [
        {
          itemId: f.stock,
          fragile: true,
          hidden: {
            trueIdentity: "PRIVATE_LANTERN_IDENTITY",
            properties: ["PRIVATE_LANTERN_EFFECT"],
            provenance: "PRIVATE_LANTERN_PROVENANCE",
            usableCapabilities: [],
          },
        },
        {
          itemId: secret,
          fragile: false,
          hidden: {
            trueIdentity: "PRIVATE_STOCK_IDENTITY",
            properties: ["PRIVATE_STOCK_EFFECT"],
            provenance: "PRIVATE_STOCK_PROVENANCE",
            usableCapabilities: [],
          },
        },
      ],
    };
    const cache = {
      ...structuredClone(version),
      object: {
        ...object,
        id: cacheId,
        storageId: cacheStorage,
        label: "Small open drawer",
        access: "open",
        lockClass: null,
        contentsEstablished: false,
        materializationId: null,
        knownBy: [actorId],
        contentsKnownBy: [],
      },
      policy: {
        ...structuredClone(version.policy),
        objectId: cacheId,
        id: "synthetic-cache",
        approaches: [],
        contents: [
          {
            key: "token",
            visible: {
              name: "Worn token",
              category: "trinket",
              quantity: 1,
              description: "Dim old engraving.",
              mechanics: "Dormant; no active mechanical effect.",
            },
            commerce: {
              currencyId: "credits",
              unitValue: 50,
              trade: "allowed",
              origin: "legitimate",
              visibility: "public",
            },
            private: {
              trueIdentity: "PRIVATE_RELIC_IDENTITY",
              properties: ["PRIVATE_RELIC_EFFECT"],
              provenance: "PRIVATE_RELIC_PROVENANCE",
              usableCapabilities: [],
            },
            fragile: false,
          },
        ],
      },
      privateItems: [],
    };
    // Trusted initial fixture authoring only: full private policy is not a
    // public owner input. Reuse a committed fixture operation for its required
    // FK; no test gameplay action writes state outside runTurn/RPC settlement.
    const configure = async (version) => {
      const prepared = await f.prepare(
        "loot.configure",
        version,
        (context, command, input) =>
          planLootObjectCorrection(context, command, input, f.owner),
      );
      const operationId = prepared.context.events.at(-1).operationId;
      const eventId = randomUUID();
      const event = {
        ...prepared.plan.events[0],
        schemaVersion: 1,
        id: eventId,
        campaignId: f.cid,
        originTimelineId: prepared.request.command.timeline.timelineId,
        operationId,
        worldMinutes: prepared.context.foundation.worldMinutes,
        evidence: [],
      };
      await f.one(
        "insert into rpg_private.world_events(id,campaign_id,operation_id,event) values($1,$2,$3,$4::jsonb)",
        [eventId, f.cid, operationId, JSON.stringify(event)],
      );
      await f.one(
        "update rpg_private.world_foundations set loop_state=$2::jsonb,revision=revision+1 where campaign_id=$1",
        [f.cid, JSON.stringify(prepared.plan.state)],
      );
    };
    await configure(version);
    await configure(cache);
    return { ...f, actorId, objectId, cacheId, secret, configure, errors: [] };
  } catch (error) {
    await f.db.close();
    throw error;
  }
}
async function exact(f) {
  return {
    ...(await persistedState(f)),
    ...(await f.one(
      "select (select count(*)::integer from public.rpg_scenes where campaign_id=$1) scenes,(select count(*)::integer from rpg_private.runtime_events where campaign_id=$1) runtime_events",
      [f.cid],
    )),
  };
}
function unchangedAuthority(before, after) {
  for (const key of [
    "entities",
    "items",
    "events",
    "receipts",
    "versions",
    "saves",
    "scenes",
    "runtime_events",
  ])
    assert.deepEqual(after[key], before[key], key);
  assert.deepEqual(after.foundation.loop_state, before.foundation.loop_state);
}
function captureContext(observations, ...args) {
  try {
    return buildContext(...args);
  } catch (error) {
    observations.contextError = error.stack;
    throw error;
  }
}
async function play(
  f,
  {
    kind = "search",
    objectId = f.objectId,
    approachId = null,
    itemId = null,
    quantity = 1,
    die = 20,
    commerce = null,
    onPlan = null,
    beforeCommit = null,
    beforeChecks = null,
  } = {},
) {
  const context = await f.read(),
    timeline = await f.fence(f.cid),
    version = readLootObject(context, objectId);
  const operationId = randomUUID();
  const text = commerce
    ? "Sell the known item under the stated current merchant terms."
    : kind === "access"
      ? "I strike the weak wooden structure against the stone landing."
      : kind === "take"
        ? "I take the specified known quantity into my pack."
        : "I search the available drawer.";
  const intent = {
    kind,
    actorId: f.actorId,
    objectId,
    ...(kind === "access"
      ? { approachId }
      : kind === "take"
        ? { itemId, quantity, destinationStorageId: f.storage }
        : {}),
  };
  const proposal = commerce
    ? {
        schemaVersion: 1,
        action: "trade",
        input: text,
        intent: commerce,
        expectedPayment: null,
      }
    : { schemaVersion: 1, action: "loot", input: text, intent };
  const required =
    kind === "access"
      ? version.policy.approaches.find((a) => a.id === approachId)?.check
      : kind === "search"
        ? version.policy.discoveryCheck
        : null;
  const checks =
    !commerce && required
      ? [
          {
            ...required,
            actorId: f.hero,
            targetId: objectId,
            kind: required.stat,
            dcPublic: true,
            visibility: "player",
            important: true,
            uncertainty: "meaningful",
            advantage: "normal",
          },
        ]
      : [];
  const observations = {
    plans: 0,
    narrations: 0,
    recorded: [],
    source: null,
    planContext: null,
    narrationContext: null,
    packet: null,
  };
  const runtimeRpc = async (args) => {
    try {
      return {
        data: await f.runtime(
          args.p_campaign_id,
          args.p_action,
          args.p_payload,
          args.p_timeline,
        ),
      };
    } catch (error) {
      f.errors.push({
        action: args.p_action,
        message: error.message,
        where: error.where,
      });
      return { error: { message: error.message, code: error.code } };
    }
  };
  const store = createRpcTurnStore(
    f.owner,
    runtimeRpc,
    "synthetic-scripted",
    timeline,
  );
  const dependencies = {
    store: {
      ...store,
      recordChecks: async (lease, rolled) => {
        const seeded = rolled.map((check) =>
          recordServerRoll(operationId, check, check.modifier, 1, () => die),
        );
        if (beforeChecks)
          await beforeChecks({ lease, checks: seeded, timeline });
        const result = await store.recordChecks(lease, seeded);
        observations.recorded = structuredClone(result);
        return result;
      },
      commit: async (lease, packet) => {
        observations.packet = structuredClone(packet);
        if (beforeCommit) await beforeCommit({ lease, packet, timeline });
        return store.commit(lease, packet);
      },
    },
    prepareWorld: worldTurnPreparer(f.rpc),
    prepareFoundation: foundationTurnPreparer(f.rpc),
    provider: {
      plan: async (source, input) => {
        observations.plans++;
        observations.source = structuredClone(source);
        assert.ok(
          source.historyComplete,
          "fixture runtime history must be complete",
        );
        assert.ok(
          source.snapshot.documents.some(
            (doc) => doc.id === source.snapshot.dmGuideDocumentId,
          ),
          "fixture must contain the established DM Guide",
        );
        assert.equal(source.runtime.revision, input.expectedRevision);
        assert.ok(
          !source.memory || source.memory.complete,
          "fixture memory must be complete",
        );
        const options = {
          ...foundationActionContext(context, f.actorId),
          loot: lootActionOptions(context, f.actorId),
        };
        observations.planContext = captureContext(
          observations,
          { ...source, foundationOptions: options },
          input,
          "plan",
          { model: "synthetic-scripted", budget },
        );
        const plan = {
          narration: "Interpret only the requested action.",
          checks,
          publicPatches: [],
          privatePatches: [],
          visualDescription: "",
          clarification: null,
          guidanceProposal: null,
          foundationAction: proposal,
        };
        if (onPlan) await onPlan({ source, input, plan });
        return { output: plan, usage };
      },
      narrate: async (source, input, resolution, recorded) => {
        observations.narrations++;
        observations.narrationContext = captureContext(
          observations,
          source,
          input,
          "narrate",
          {
            model: "synthetic-scripted",
            budget,
            resolution,
            checks: recorded,
          },
        );
        return {
          output: {
            narration: "The action resolves from recorded facts.",
            visualDescription: "",
            clarification: null,
          },
          usage,
        };
      },
      feedback: () => assert.fail("Game must not call feedback"),
    },
  };
  const input = {
    operationId,
    campaignId: f.cid,
    expectedRevision: (await f.runtime(f.cid, "play")).revision,
    timeline,
    mode: "game",
    input: text,
    companionId: null,
    listenerIds: [],
    mechanic: null,
  };
  let result = await runTurn(input, dependencies);
  if (result.status === "awaiting_confirmation")
    result = await resumeTurn(
      {
        commandId: randomUUID(),
        campaignId: f.cid,
        operationId,
        timeline,
        action: "continue",
        checkId: null,
      },
      dependencies,
    );
  return {
    result,
    input,
    observations,
    replay: () => runTurn(input, dependencies),
  };
}
async function committed(x, f) {
  assert.equal(
    x.result.status,
    "committed",
    JSON.stringify({
      result: x.result,
      errors: f.errors,
      contextError: x.observations.contextError,
    }),
  );
  assert.equal(x.observations.plans, 1);
  assert.equal(x.observations.narrations, 1);
  assert.doesNotMatch(
    JSON.stringify(x.result),
    /PRIVATE_|foundationSettlement|privateItems|itemPolicies/,
  );
  return x;
}
test("Adventure loot Game SQL: normal search materializes once, narrates public facts, retries exactly and autosaves Item/private Event authority", async () => {
  const f = await lootFixture();
  try {
    const first = await committed(await play(f, { objectId: f.cacheId }), f);
    const itemId = stableGameplayId(f.cacheId, "loot:item:token"),
      after = await exact(f);
    assert.equal(after.items.find((i) => i.id === itemId).quantity, 1);
    assert.equal(
      readLootObject(await f.read(), f.cacheId).object.contentsEstablished,
      true,
    );
    assert.doesNotMatch(
      first.observations.narrationContext.input,
      /PRIVATE_RELIC_|PRIVATE_LANTERN_|PRIVATE_STOCK_|PRIVATE_BEFORE_FORK/,
    );
    assert.ok(
      !first.observations.narrationContext.input.includes(f.secret),
      "Unknown private stock identity must not enter narration context",
    );
    assert.equal(first.observations.source.lootChecks.length, 2);
    assert.ok(
      first.observations.source.lootChecks.every(
        (row) => row.entityId === f.hero && row.actorId === f.actorId,
      ),
    );
    assert.doesNotMatch(
      JSON.stringify(first.observations.source.lootChecks),
      /PRIVATE_|contents|privateItems/,
    );
    assert.deepEqual(await first.replay(), first.result);
    assert.deepEqual(await exact(f), after);
    assert.equal(first.observations.plans, 1);
    assert.equal(first.observations.narrations, 1);
    await committed(await play(f, { objectId: f.cacheId }), f);
    assert.equal(
      (
        await f.query(
          "select * from public.rpg_items where campaign_id=$1 and id=$2",
          [f.cid, itemId],
        )
      ).length,
      1,
    );
    const captured = await f.query(
      "select v.table_name,v.payload from rpg_private.save_points s join rpg_private.timeline_manifests m on m.id=s.manifest_id and m.campaign_id=s.campaign_id cross join lateral jsonb_each(m.refs) refs cross join lateral jsonb_array_elements_text(refs.value) r(id) join rpg_private.timeline_versions v on v.id=r.id::uuid and v.campaign_id=s.campaign_id where s.campaign_id=$1 and s.trigger_key=$2",
      [f.cid, "turn:" + first.input.operationId],
    );
    assert.ok(
      captured.some(
        (r) => r.table_name === "public.rpg_items" && r.payload.id === itemId,
      ),
    );
    assert.ok(
      captured.some(
        (r) =>
          r.table_name === "rpg_private.world_events" &&
          r.payload.event.kind === "loot.object.changed" &&
          r.payload.operation_id === first.input.operationId,
      ),
    );
    assert.ok(
      captured.some(
        (r) =>
          r.table_name === "rpg_private.world_foundations" &&
          r.payload.loop_state.itemPolicies.some((p) => p.itemId === itemId),
      ),
    );
  } finally {
    await f.db.close();
  }
});
test("Adventure loot Game SQL: weaker force uses pinned server check, bounded fragile loss/noise and finite stolen take followed by normal Commerce", async () => {
  const f = await lootFixture();
  try {
    const lock = await committed(
      await play(f, { kind: "access", approachId: "lock", die: 10 }),
      f,
    );
    assert.equal(lock.observations.recorded[0].dc, 20);
    assert.equal(lock.observations.recorded[0].success, false);
    assert.equal(
      readLootObject(await f.read(), f.objectId).object.access,
      "locked",
    );
    assert.equal(
      (await f.read()).snapshot.items.find((item) => item.id === f.stock)
        .quantity,
      6,
    );
    const force = await committed(
      await play(f, { kind: "access", approachId: "force", die: 10 }),
      f,
    );
    assert.equal(force.observations.recorded[0].dc, 8);
    assert.equal(force.observations.recorded[0].targetId, f.objectId);
    assert.equal(
      (await f.read()).snapshot.items.find((i) => i.id === f.stock).quantity,
      5,
    );
    assert.equal(
      readLootObject(await f.read(), f.objectId).object.access,
      "broken",
    );
    assert.match(force.result.narration, /audible crash/);
    assert.equal(
      (
        await f.query(
          "select * from rpg_private.world_events where operation_id=$1 and event->>'kind'='loot.noise'",
          [force.input.operationId],
        )
      ).length,
      1,
    );
    const merchantBefore = (await f.read()).world.actors.find(
      (a) => a.entityId === f.merchant,
    );
    assert.deepEqual(merchantBefore.knowledge, []);
    await committed(await play(f), f);
    const take = await committed(
      await play(f, { kind: "take", itemId: f.stock, quantity: 2 }),
      f,
    );
    const transfer =
      take.observations.packet.foundationSettlement.plan.events.find(
        (e) => e.kind === "loot.item.transferred",
      ).payload.transferredItemId;
    let state = await f.read();
    assert.equal(
      state.snapshot.items.find((i) => i.id === f.stock).quantity,
      3,
    );
    assert.equal(
      state.snapshot.items.find((i) => i.id === transfer).quantity,
      2,
    );
    assert.equal(
      state.state.itemPolicies.find((p) => p.itemId === transfer).origin,
      "stolen",
    );
    assert.equal(
      readLootObject(state, f.objectId).privateItems.find(
        (i) => i.itemId === transfer,
      ).hidden.provenance,
      "PRIVATE_LANTERN_PROVENANCE",
    );
    const commerce = {
      merchantActorId: f.merchant,
      playerEntityId: f.hero,
      take: [],
      give: [{ itemId: transfer, quantity: 2 }],
      currencyId: "credits",
      haggle: "none",
    };
    const before = await exact(f),
      refused = await play(f, { commerce });
    assert.equal(refused.result.status, "failed");
    const unchanged = await exact(f);
    assert.deepEqual(unchanged.items, before.items);
    assert.deepEqual(unchanged.entities, before.entities);
    assert.equal(unchanged.events, before.events);
    state = await f.read();
    await f.commit(
      await f.prepare(
        "commerce.configure",
        {
          currencies: state.state.currencies,
          itemPolicies: state.state.itemPolicies.filter(
            (policy) => policy.visibility === "public",
          ),
          merchants: state.state.merchants.map((m) => ({
            ...m,
            acceptsStolen: true,
            version: m.version + 1,
          })),
        },
        planCommerceConfiguration,
      ),
    );
    const sale = await committed(await play(f, { commerce }), f);
    assert.equal(
      sale.observations.packet.foundationSettlement.plan.events[0].kind,
      "commerce.trade",
    );
    state = await f.read();
    assert.equal(
      state.snapshot.items.find((i) => i.id === transfer).owner_entity_id,
      f.merchant,
    );
    assert.equal(
      state.snapshot.entities.find((e) => e.id === f.hero).resources.credits,
      110,
    );
    assert.doesNotMatch(
      JSON.stringify(projectLootObjects(state, f.actorId)),
      /PRIVATE_|137|9137|Unopened wrapped stock/,
    );
  } finally {
    await f.db.close();
  }
});
test("Adventure loot Game SQL: save/load and fork inherit exact committed contents/provenance while isolating later depletion", async () => {
  const f = await lootFixture();
  try {
    await committed(await play(f, { kind: "access", approachId: "force" }), f);
    await committed(await play(f), f);
    const saved = await f.checkpoint("Exact known fragile stock"),
      main = (await f.fence(f.cid)).timelineId;
    await committed(
      await play(f, { kind: "take", itemId: f.stock, quantity: 2 }),
      f,
    );
    assert.equal(
      (await f.read()).snapshot.items.find((i) => i.id === f.stock).quantity,
      3,
    );
    await f.load(saved.saveId);
    assert.notEqual((await f.fence(f.cid)).timelineId, main);
    assert.equal(
      (await f.read()).snapshot.items.find((i) => i.id === f.stock).quantity,
      5,
    );
    const child = await committed(
      await play(f, { kind: "take", itemId: f.stock, quantity: 1 }),
      f,
    );
    const transferred =
      child.observations.packet.foundationSettlement.plan.events.find(
        (e) => e.kind === "loot.item.transferred",
      ).payload.transferredItemId;
    assert.equal(
      (await f.read()).state.itemPolicies.find((p) => p.itemId === transferred)
        .origin,
      "stolen",
    );
    await f.switchTo(main);
    assert.equal(
      (await f.read()).snapshot.items.find((i) => i.id === f.stock).quantity,
      3,
    );
    assert.ok(
      !(await f.read()).snapshot.items.some((i) => i.id === transferred),
    );
    await f.load(saved.saveId);
    assert.equal(
      (await f.read()).snapshot.items.find((i) => i.id === f.stock).quantity,
      5,
    );
    assert.equal(
      readLootObject(await f.read(), f.objectId).object.access,
      "broken",
    );
  } finally {
    await f.db.close();
  }
});
test("Adventure loot Game SQL: durable failed force retains access and fragile stock without noise or partial gains", async () => {
  const f = await lootFixture();
  try {
    const before = await f.read(),
      x = await committed(
        await play(f, { kind: "access", approachId: "force", die: 1 }),
        f,
      );
    assert.equal(x.observations.recorded[0].success, false);
    assert.equal(
      readLootObject(await f.read(), f.objectId).object.access,
      "locked",
    );
    assert.deepEqual((await f.read()).snapshot.items, before.snapshot.items);
    assert.equal(
      (
        await f.query(
          "select * from rpg_private.world_events where operation_id=$1 and event->>'kind'='loot.noise'",
          [x.input.operationId],
        )
      ).length,
      0,
    );
  } finally {
    await f.db.close();
  }
});
test("Adventure loot Game SQL: late base commit failure rolls back Item, object Event, history and autosave together before exact valid commit", async () => {
  const f = await lootFixture();
  try {
    let checked = false;
    const x = await committed(
      await play(f, {
        objectId: f.cacheId,
        beforeCommit: async ({ lease, packet, timeline }) => {
          const before = await exact(f);
          await assert.rejects(
            f.runtime(
              f.cid,
              "commit",
              { ...lease, packet: { ...packet, narration: "" } },
              timeline,
            ),
            /rpg_validation/,
          );
          unchangedAuthority(before, await exact(f));
          checked = true;
        },
      }),
      f,
    );
    assert.equal(checked, true);
    assert.equal(
      (await f.read()).snapshot.items.filter(
        (i) => i.id === stableGameplayId(f.cacheId, "loot:item:token"),
      ).length,
      1,
    );
    assert.deepEqual(await x.replay(), x.result);
  } finally {
    await f.db.close();
  }
});
test("Adventure loot Game SQL: pinned source rejects forged object DC, extra mechanical patches and corrupted settlement atomically", async () => {
  const f = await lootFixture();
  try {
    let validated = false,
      guarded = false,
      checkGuarded = false;
    await committed(
      await play(f, {
        kind: "access",
        approachId: "force",
        beforeChecks: async ({ lease, checks, timeline }) => {
          const before = await exact(f);
          for (const patch of [
            { dc: 1 },
            { targetId: randomUUID() },
            { actorId: f.merchant },
          ]) {
            const forged = checks.map((check) => ({
              ...check,
              ...patch,
              success: check.total >= (patch.dc ?? check.dc),
            }));
            await assert.rejects(
              f.runtime(
                f.cid,
                "checks",
                { ...lease, checks: forged },
                timeline,
              ),
              /rpg_validation/,
            );
            assert.deepEqual(await exact(f), before);
            const turn = await f.one(
              "select checkpoint from rpg_private.turns where campaign_id=$1 and id=$2",
              [f.cid, lease.operationId],
            );
            assert.deepEqual(turn.checkpoint.checks, []);
          }
          checkGuarded = true;
        },
        onPlan: ({ source, input, plan }) => {
          assert.ok(
            source.lootChecks.some(
              (r) => r.objectId === f.objectId && r.requirement.dc === 8,
            ),
          );
          const fake = structuredClone(plan);
          fake.checks[0].dc = 1;
          source.foundationOptions = {
            loot: [
              {
                id: f.objectId,
                actorId: f.actorId,
                actorEntityId: f.hero,
                approaches: [
                  { id: "force", check: { index: 0, stat: "skill", dc: 1 } },
                ],
              },
            ],
          };
          assert.throws(() => validatePlan(source, input, fake));
          const doubled = structuredClone(plan);
          doubled.publicPatches = [
            {
              kind: "item.transfer",
              itemId: f.stock,
              quantity: 1,
              destinationStorageId: f.storage,
            },
          ];
          assert.throws(() => validatePlan(source, input, doubled));
          validated = true;
        },
        beforeCommit: async ({ lease, packet, timeline }) => {
          const before = await exact(f),
            forged = structuredClone(packet);
          forged.foundationSettlement.plan.changes[0].values.quantity = 9999;
          await assert.rejects(
            f.runtime(f.cid, "commit", { ...lease, packet: forged }, timeline),
            /rpg_(validation|conflict)/,
          );
          unchangedAuthority(before, await exact(f));
          guarded = true;
        },
      }),
      f,
    );
    assert.equal(validated, true);
    assert.equal(checkGuarded, true);
    assert.equal(guarded, true);
  } finally {
    await f.db.close();
  }
});
test("Adventure loot Game SQL: unsupported distinct WorldActor and Entity identity fails closed before gameplay", async () => {
  await assert.rejects(
    lootFixture({ distinctActor: true }),
    (error) =>
      error.name === "WorldValidationError" && error.code === "invalid_world",
  );
});
test("Adventure loot Game SQL: locked search and unsupported creative access pause without invented contents or mechanics", async () => {
  const f = await lootFixture();
  try {
    const before = await exact(f);
    const search = await committed(await play(f), f);
    assert.equal(
      readLootObject(await f.read(), f.objectId).object.access,
      "locked",
    );
    assert.deepEqual((await f.read()).snapshot.items, before.items);
    assert.deepEqual(
      readLootObject(await f.read(), f.objectId).object.contentsKnownBy,
      [],
    );
    assert.ok(
      !JSON.stringify(lootActionOptions(await f.read(), f.actorId)).includes(
        f.secret,
      ),
    );
    const steady = await exact(f);
    const unsupported = await play(f, {
      kind: "access",
      approachId: "invented-physics",
    });
    assert.equal(unsupported.result.status, "failed");
    assert.equal(unsupported.observations.narrations, 0);
    const after = await exact(f);
    assert.deepEqual(after.items, steady.items);
    assert.deepEqual(after.foundation.loop_state, steady.foundation.loop_state);
    assert.equal(after.events, steady.events);
    assert.deepEqual(await search.replay(), search.result);
  } finally {
    await f.db.close();
  }
});
