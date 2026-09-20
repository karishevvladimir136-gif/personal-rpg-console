import {
  fixture as mechanicsFixture,
  id,
} from "./phase2-mechanics-fixtures.mjs";
export { id };
export function step(name = "step", fields = {}) {
  return {
    id: id(name),
    trigger: {
      kind: "deadline",
      atWorldMinutes: 10,
      scenarioCritical: false,
      established: true,
    },
    resolution: "deterministic",
    consequence: "background",
    privateText: "PRIVATE_WORLD_CAUSE",
    evidence: [],
    publicOutcome: null,
    warning: null,
    hookChanges: [],
    ...fields,
  };
}
export function thread(name = "thread", fields = {}) {
  return {
    id: id(name),
    campaignId: id("campaign"),
    revision: 1,
    title: "PRIVATE_THREAD",
    publicTitle: null,
    actorIds: [id("enemy")],
    decisionActorIds: [id("enemy")],
    locationIds: [id("location")],
    prerequisiteThreadIds: [],
    status: "active",
    cursor: 0,
    steps: [step(name + "-step")],
    ...fields,
  };
}
export function fixture() {
  const source = mechanicsFixture();
  source.runtime.timeline = { timelineId: id("timeline"), epoch: 2 };
  const world = {
    schemaVersion: 1,
    campaignId: id("campaign"),
    policy: {
      simulation: true,
      autonomy: "moderate",
      deadlinePressure: "normal",
    },
    policyChangedAtWorldMinutes: 0,
    actors: ["player", "enemy"].map((name) => ({
      id: id(name),
      campaignId: id("campaign"),
      revision: 1,
      kind: "entity",
      entityId: id(name),
      control: name === "player" ? "player" : "autonomous",
      publicName: name === "player" ? "Known player" : null,
      locationId: id("location"),
      capabilities: [],
      knowledge: [],
    })),
    threads: [thread()],
    hooks: [],
    warnings: [],
  };
  const snapshot = {
    schemaVersion: 1,
    ownerId: source.ownerId,
    campaignId: id("campaign"),
    timeline: source.runtime.timeline,
    revision: 3,
    runtimeRevision: 1,
    headId: id("head"),
    worldMinutes: 0,
    world,
    bindings: [],
    ruleset: {
      id: "console-basic-v1",
      version: 1,
      mode: "full_ruleset",
      validatorVersion: "console-basic-v1",
    },
    executionPolicy: null,
  };
  return {
    snapshot,
    command: {
      operationId: id("operation"),
      campaignId: id("campaign"),
      timeline: structuredClone(snapshot.timeline),
      expectedRevision: 3,
      expectedRuntimeRevision: 1,
      expectedHeadId: id("head"),
    },
    source,
    resolution: {
      changes: [],
      worldMinutes: 20,
      configuration: source.runtime.configuration,
      outcomes: [],
    },
    trigger: "time_skip",
  };
}
export function evidence(fields = {}) {
  return {
    ownerId: id("owner"),
    sourceId: id("source"),
    sourceVersionId: id("source-version"),
    locator: { kind: "section", value: "synthetic-1" },
    digest: "a".repeat(64),
    visibility: "private",
    knowledge: "canon_at_entry",
    ...fields,
  };
}
export function bind(input) {
  input.snapshot.bindings.push({
    schemaVersion: 1,
    id: id("binding"),
    campaignId: id("campaign"),
    ownerId: id("owner"),
    packId: id("pack"),
    packVersionId: id("pack-version"),
    scenarioVersionId: null,
    sourceVersionIds: [id("source-version")],
    sourcePriority: [id("source-version")],
    entry: { label: "Synthetic entry", worldMinutes: 0, evidence: [] },
    mappings: [],
  });
}
