import { fixture as worldFixture } from "./wave1-world-fixtures.mjs";
import {
  makeSource,
  makePack,
  evidence,
  entry,
} from "./wave1-library-fixtures.mjs";
import { stableGameplayId } from "../src/lib/gameplay/dice.ts";
import { buildCampaignBinding } from "../src/lib/world-packs/bindings.ts";
import { sha256 } from "../src/lib/world-library/parsers.ts";

export const id = (name) =>
  stableGameplayId("wave4-preparation-synthetic", name);

export function fixture() {
  const base = worldFixture();
  const text =
    "Mara is a porter. Mara tends Harbor. Mara intends to repair the quay. Harbor is a quiet port. Council governs the port.";
  const source = makeSource({
    original: { kind: "text", text },
    digest: sha256(text),
  });
  const pack = makePack(source);
  const [person, place, group] = [
    id("source-person"),
    id("source-place"),
    id("source-group"),
  ];
  pack.body.entities = [
    {
      id: person,
      name: "Mara",
      kind: "person",
      aliases: ["PRIVATE_ALIAS_MARKER"],
    },
    { id: place, name: "Harbor", kind: "location", aliases: [] },
    { id: group, name: "Council", kind: "faction", aliases: [] },
  ];
  const claim = (name, subjectId, text, extra = {}) => ({
    ...pack.body.claims[0],
    id: id(name),
    subjectId,
    text,
    knownByEntityIds: [],
    knowledge: "canon_at_entry",
    evidence: [evidence(source, { knowledge: "canon_at_entry" })],
    ...extra,
  });
  pack.body.claims = [
    claim("person-description", person, "Mara is a porter."),
    claim("person-place", person, "Mara tends Harbor.", {
      structure: { kind: "geography", objectId: place },
    }),
    claim("person-goal", person, "Mara intends to repair the quay.", {
      predicate: "goal",
      epistemic: "intention",
    }),
    claim("place-description", place, "Harbor is a quiet port."),
    claim("group-description", group, "Council governs the port."),
  ];
  let index = 0;
  const binding = buildCampaignBinding({
    id: id("binding"),
    campaignId: base.snapshot.campaignId,
    ownerId: source.ownerId,
    pack,
    entry: entry(),
    sourcePriority: pack.body.sourcePriority,
    allocateEntityId: () => id(`campaign-instance-${index++}`),
  });
  base.snapshot.ownerId = source.ownerId;
  base.snapshot.bindings = [binding];
  base.source.snapshot.timeline = structuredClone(base.snapshot.timeline);
  const state = {
    schemaVersion: 1,
    version: 1,
    profile: base.snapshot.ruleset,
    progression: "off",
    currencies: [],
    itemPolicies: [],
    merchants: [],
    tracks: [],
    rewards: [],
    progress: [],
    pending: [],
    preparations: [],
  };
  return {
    source: {
      binding,
      pack,
      sources: [source],
      characterEntityId: base.source.snapshot.entities.find(
        (entity) => entity.kind === "player",
      ).id,
      worldMinutes: 0,
    },
    context: {
      foundation: base.snapshot,
      snapshot: base.source.snapshot,
      world: base.snapshot.world,
      state,
      events: [],
    },
    ids: { person, place, group },
  };
}

export function apply(context, plan) {
  const next = structuredClone(context);
  next.world = structuredClone(plan.world);
  next.state = structuredClone(plan.state);
  next.foundation.world = structuredClone(plan.world);
  for (const change of [
    ...plan.changes,
    ...plan.storageCreates.map((row) => ({ ...row, family: "storages" })),
  ]) {
    const rows = next.snapshot[change.family];
    const index = rows.findIndex((row) => row.id === change.id);
    const before =
      index >= 0
        ? rows[index]
        : {
            id: change.id,
            campaign_id: next.snapshot.campaign.id,
            revision: 0,
            updated_at: "",
          };
    const after = {
      ...before,
      ...structuredClone(change.values),
      revision: before.revision + 1,
    };
    if (index >= 0) rows[index] = after;
    else rows.push(after);
  }
  for (const event of plan.events)
    next.events.push({
      ...structuredClone(event),
      schemaVersion: 1,
      id: id(`event-${next.events.length}`),
      campaignId: next.foundation.campaignId,
      originTimelineId: next.foundation.timeline.timelineId,
      operationId: id(`operation-${next.events.length}`),
      sequence: next.events.length + 1,
      worldMinutes: next.foundation.worldMinutes,
      evidence: [],
    });
  return next;
}
