import { fixture as worldFixture, id } from "./wave1-world-fixtures.mjs";
export { id };

export function fixture() {
  const base = worldFixture();
  const foundation = base.snapshot,
    snapshot = base.source.snapshot,
    world = foundation.world;
  snapshot.timeline = structuredClone(foundation.timeline);
  world.threads = [];
  world.actors.find((a) => a.id === id("enemy")).publicName =
    "Synthetic merchant";
  snapshot.entities.find((e) => e.id === id("player")).resources = {
    focus: 4,
    credits: 1000,
  };
  snapshot.entities.find((e) => e.id === id("enemy")).resources = {
    focus: 2,
    credits: 1000,
  };
  snapshot.storages.push({
    id: id("merchant-storage"),
    campaign_id: foundation.campaignId,
    revision: 1,
    updated_at: "2026-01-01T00:00:00Z",
    name: "Merchant stock",
    kind: "merchant",
    entity_id: id("enemy"),
  });
  snapshot.items = snapshot.items.filter((i) =>
    [id("coffee"), id("knife"), id("weapon")].includes(i.id),
  );
  const stock = {
    ...snapshot.items[0],
    id: id("stock"),
    name: "Synthetic lantern",
    quantity: 10,
    owner_entity_id: id("enemy"),
    storage_id: id("merchant-storage"),
    category: "tool",
  };
  const secret = {
    ...stock,
    id: id("private-stock"),
    name: "PRIVATE_STOCK_NAME",
    quantity: 173,
    description: "PRIVATE_STOCK_DESCRIPTION",
    mechanics: "PRIVATE_STOCK_MECHANICS",
  };
  snapshot.items.push(stock, secret);
  const state = {
    schemaVersion: 1,
    version: 1,
    profile: structuredClone(foundation.ruleset),
    progression: "off",
    currencies: [
      { id: "credits", label: "Credits", resourceKey: "credits", version: 1 },
    ],
    itemPolicies: snapshot.items.map((i) => ({
      itemId: i.id,
      version: 1,
      currencyId: "credits",
      unitValue: i.id === secret.id ? 9173 : 20,
      trade: "allowed",
      origin: "legitimate",
      visibility: i.id === secret.id ? "private" : "public",
    })),
    merchants: [
      {
        actorId: id("enemy"),
        entityId: id("enemy"),
        version: 1,
        label: "Synthetic merchant",
        storageId: id("merchant-storage"),
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
    tracks: [],
    rewards: [],
    progress: [],
    pending: [],
    preparations: [],
  };
  const context = { foundation, state, snapshot, world, events: [] };
  return {
    context,
    command: commandFor(context),
    intent: {
      merchantActorId: id("enemy"),
      playerEntityId: id("player"),
      take: [{ itemId: id("stock"), quantity: 2 }],
      give: [],
      currencyId: "credits",
      haggle: "none",
    },
  };
}

export function commandFor(context, name = "commerce-operation") {
  return {
    operationId: id(name),
    campaignId: context.foundation.campaignId,
    timeline: structuredClone(context.foundation.timeline),
    expectedRevision: context.foundation.revision,
    expectedRuntimeRevision: context.foundation.runtimeRevision,
    expectedHeadId: context.foundation.headId,
  };
}

export function grantHaggle(context, overrides = {}) {
  const merchant = context.state.merchants[0];
  const event = {
    schemaVersion: 1,
    id: id("haggle-event"),
    campaignId: context.foundation.campaignId,
    originTimelineId: context.foundation.timeline.timelineId,
    operationId: id("haggle-operation"),
    sequence: 1,
    worldMinutes: context.foundation.worldMinutes,
    kind: "commerce.haggle_granted",
    visibility: "public",
    text: "Terms successfully negotiated.",
    actorIds: [merchant.actorId, id("player")],
    threadIds: [],
    evidence: [],
    payload: {
      schemaVersion: 1,
      merchantActorId: merchant.actorId,
      playerEntityId: id("player"),
      profile: structuredClone(context.state.profile),
      stateVersion: context.state.version,
      merchantVersion: merchant.version,
      timeline: structuredClone(context.foundation.timeline),
      worldMinutes: context.foundation.worldMinutes,
    },
    ...overrides,
  };
  context.events.push(event);
  context.foundation.headId = event.id;
  context.foundation.revision += 1;
  context.foundation.runtimeRevision += 1;
  return event;
}

// Disposable in-memory commit double. Production commit/locks/autosave remain
// the lead's SQL integration tests, not a claim made by these pure tests.
export function applyPlan(context, command, plan) {
  const next = structuredClone(context);
  for (const change of plan.changes) {
    const rows = next.snapshot[change.family];
    const index = rows.findIndex((row) => row.id === change.id);
    if (change.expectedRevision === null) {
      if (index !== -1) throw new Error("duplicate insert");
      rows.push({
        id: change.id,
        campaign_id: command.campaignId,
        revision: 1,
        updated_at: "synthetic",
        ...change.values,
      });
    } else {
      if (index === -1 || rows[index].revision !== change.expectedRevision)
        throw new Error("stale row");
      Object.assign(rows[index], change.values, {
        revision: rows[index].revision + 1,
      });
    }
  }
  next.state = structuredClone(plan.state);
  next.world = structuredClone(plan.world);
  next.foundation.world = next.world;
  next.foundation.revision += 1;
  next.foundation.runtimeRevision += 1;
  for (const [index, draft] of plan.events.entries()) {
    const event = {
      schemaVersion: 1,
      id: id(`event:${command.operationId}:${index}`),
      campaignId: command.campaignId,
      operationId: command.operationId,
      originTimelineId: command.timeline.timelineId,
      sequence: (next.events.at(-1)?.sequence ?? 0) + 1,
      worldMinutes: next.foundation.worldMinutes,
      evidence: [],
      ...draft,
    };
    next.events.push(event);
    next.foundation.headId = event.id;
  }
  return next;
}
