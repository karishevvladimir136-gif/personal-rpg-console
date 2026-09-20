import {
  fixture as legacyFixture,
  proposal as legacyProposal,
  id,
} from "./wave2-logic-fixtures.mjs";
import { consequenceCapability } from "../src/lib/world/consequences.ts";
export { id };
export function fixture() {
  const input = legacyFixture();
  input.input.input =
    "I use my supplies, catch my breath, and inspect the entrance.";
  input.source.snapshot.locations[0].description =
    "The courtyard has a bronze gate.";
  input.source.snapshot.quests[0].description = "Inspect the entrance.";
  input.snapshot.world.actors[1].publicName = "Known guide";
  return input;
}
export function grant(input, effects, actorId = id("player")) {
  const actor = input.snapshot.world.actors.find((a) => a.id === actorId);
  actor.capabilities = [
    ...new Set([...actor.capabilities, ...effects.map(consequenceCapability)]),
  ];
}
export function proposal(input = fixture(), effects = [], overrides = {}) {
  return {
    ...legacyProposal(input),
    schemaVersion: 2,
    action: "attempt",
    capabilityRefs: effects.map(consequenceCapability),
    consequences: effects,
    ...overrides,
  };
}
export function effects() {
  return [
    {
      kind: "inventory.consume",
      actorId: id("player"),
      itemId: id("supply"),
      quantity: 2,
    },
    {
      kind: "resource.spend",
      actorId: id("player"),
      resource: "focus",
      amount: 1,
    },
    { kind: "condition.add", actorId: id("player"), condition: "wet" },
    {
      kind: "actor.relocate",
      actorId: id("enemy"),
      fromLocationId: id("location"),
      toLocationId: id("destination"),
    },
    { kind: "fact.observe", family: "locations", recordId: id("location") },
    { kind: "quest.complete", questId: id("quest") },
  ];
}
