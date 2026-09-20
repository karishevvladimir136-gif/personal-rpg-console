import { fixture as worldFixture, id } from "./wave1-world-fixtures.mjs";
import { WORLD_LOGIC_REF } from "../src/lib/rulesets/profiles.ts";
export { id };
export function fixture() {
  const base = worldFixture();
  base.snapshot.ruleset = { ...WORLD_LOGIC_REF };
  base.snapshot.world.threads = [];
  base.snapshot.world.actors[0].capabilities = [
    "careful-observation",
    "walking",
  ];
  base.source.runtime.configuration = null;
  base.source.snapshot.entities[0].hp = null;
  base.source.snapshot.entities[0].max_hp = null;
  base.source.snapshot.entities[0].stats = {};
  base.source.snapshot.locations.push({
    ...base.source.snapshot.locations[0],
    id: id("destination"),
    name: "Known courtyard",
    status: "known",
  });
  return {
    snapshot: base.snapshot,
    command: base.command,
    source: base.source,
    input: {
      timeline: structuredClone(base.snapshot.timeline),
      operationId: base.command.operationId,
      campaignId: base.snapshot.campaignId,
      expectedRevision: base.snapshot.runtimeRevision,
      mode: "game",
      input: "I examine the courtyard entrance.",
      companionId: null,
      listenerIds: [],
      mechanic: null,
    },
  };
}
export function proposal(input = fixture(), extra = {}) {
  return {
    schemaVersion: 1,
    actorId: id("player"),
    input: input.input.input,
    action: "observe",
    outcome: "completed",
    uncertainty: "resolved",
    capabilityRefs: ["careful-observation"],
    circumstanceRefs: ["public-state"],
    evidenceIndexes: [],
    publicText: "You inspect the familiar entrance.",
    elapsedMinutes: 1,
    destinationId: null,
    ...extra,
  };
}
