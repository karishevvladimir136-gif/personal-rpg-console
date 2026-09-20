import { fixture as worldFixture, id } from "./wave1-world-fixtures.mjs";
import { stableGameplayId } from "../src/lib/gameplay/dice.ts";
export { id };

export function fixture() {
  const input = worldFixture();
  const snapshot = input.source.snapshot;
  snapshot.timeline = structuredClone(input.snapshot.timeline);
  snapshot.quests[0].status = "complete";
  snapshot.storages.push({
    id: id("reward-stock"),
    campaign_id: id("campaign"),
    revision: 1,
    updated_at: "",
    name: "Recorded stock",
    kind: "companion",
    entity_id: id("enemy"),
  });
  const item = snapshot.items.find((row) => row.id === id("knife"));
  item.owner_entity_id = id("enemy");
  item.storage_id = id("reward-stock");
  const state = {
    schemaVersion: 1,
    version: 1,
    profile: structuredClone(input.snapshot.ruleset),
    progression: "on",
    currencies: [
      { id: "coin", version: 1, label: "Marks", resourceKey: "marks" },
    ],
    itemPolicies: [
      {
        itemId: id("knife"),
        version: 1,
        currencyId: "coin",
        unitValue: 2,
        trade: "allowed",
        origin: "legitimate",
        visibility: "public",
      },
    ],
    merchants: [],
    preparations: [],
    tracks: [
      {
        id: "xp",
        version: 1,
        label: "Experience",
        kind: "classic_xp",
        thresholds: [10, 20, 30],
        choices: [
          { id: "scout", label: "Scouting", capability: "Scout access" },
          { id: "guide", label: "Guidance", capability: "Guide access" },
          { id: "speaker", label: "Speaking", capability: "Speaker access" },
        ],
      },
    ],
    rewards: [
      {
        id: "objective",
        version: 1,
        label: "PRIVATE_REWARD_TEMPLATE",
        source: { kind: "quest", id: id("quest") },
        distribution: "actor",
        recipientIds: [id("player")],
        entries: [
          { kind: "progression", trackId: "xp", amount: 25 },
          { kind: "currency", currencyId: "coin", amount: 10 },
          { kind: "item", itemId: id("knife"), quantity: 3 },
        ],
      },
    ],
    progress: [],
    pending: [],
  };
  return {
    context: {
      foundation: input.snapshot,
      state,
      snapshot,
      world: input.snapshot.world,
      events: [],
    },
    command: input.command,
    claim: { rewardId: "objective", expectedRewardVersion: 1 },
  };
}

export function commit(input, plan, name = "next-operation") {
  const next = structuredClone(input);
  next.context.state = structuredClone(plan.state);
  next.context.world = structuredClone(plan.world);
  next.context.foundation.world = structuredClone(plan.world);
  for (const change of plan.changes) {
    const rows = next.context.snapshot[change.family];
    const row = rows.find((row) => row.id === change.id);
    if (row)
      Object.assign(row, structuredClone(change.values), {
        revision: row.revision + 1,
      });
    else
      rows.push({
        id: change.id,
        campaign_id: next.context.foundation.campaignId,
        revision: 1,
        updated_at: "",
        ...structuredClone(change.values),
      });
  }
  const count = next.context.events.length;
  next.context.events.push(
    ...plan.events.map((event, index) => ({
      schemaVersion: 1,
      id: stableGameplayId(input.command.operationId, `event:${index}`),
      campaignId: input.context.foundation.campaignId,
      originTimelineId: input.command.timeline.timelineId,
      operationId: input.command.operationId,
      sequence: count + index + 1,
      worldMinutes: input.context.foundation.worldMinutes,
      evidence: [],
      ...structuredClone(event),
    })),
  );
  next.context.foundation.revision += 1;
  next.context.foundation.runtimeRevision += 1;
  next.context.foundation.headId = input.command.operationId;
  next.command = {
    ...next.command,
    operationId: id(name),
    expectedRevision: next.context.foundation.revision,
    expectedRuntimeRevision: next.context.foundation.runtimeRevision,
    expectedHeadId: next.context.foundation.headId,
  };
  return next;
}

export function event(fields = {}) {
  return {
    schemaVersion: 1,
    id: id("source-event"),
    campaignId: id("campaign"),
    originTimelineId: id("timeline"),
    operationId: id("source-operation"),
    sequence: 1,
    worldMinutes: 0,
    kind: "world.logic.resolved",
    actorIds: [id("player")],
    threadIds: [],
    visibility: "private",
    text: "PRIVATE_SOURCE_EVENT",
    evidence: [],
    payload: {},
    ...fields,
  };
}
