import {
  fixture as actionFixture,
  grant,
  id,
} from "./wave3-logic-fixtures.mjs";
import { thread, step } from "./wave1-world-fixtures.mjs";
import { selectWorldSimulationWork } from "../src/lib/world/resolver.ts";
export { id, grant, thread, step };

export function fixture() {
  const input = actionFixture();
  input.source.snapshot.storages.push({
    ...input.source.snapshot.storages[0],
    id: id("npc-storage"),
    entity_id: id("enemy"),
  });
  input.source.snapshot.items.push({
    ...input.source.snapshot.items[0],
    id: id("npc-supplies"),
    storage_id: id("npc-storage"),
    owner_entity_id: id("enemy"),
    equipped_entity_id: null,
    equipped_slot: null,
  });
  const effects = [
    {
      kind: "inventory.consume",
      actorId: id("enemy"),
      itemId: id("npc-supplies"),
      quantity: 2,
    },
    {
      kind: "resource.spend",
      actorId: id("enemy"),
      resource: "focus",
      amount: 2,
    },
    { kind: "condition.add", actorId: id("enemy"), condition: "wet" },
  ];
  grant(input, effects, id("enemy"));
  input.snapshot.world.threads = [
    thread("branch-thread", {
      steps: [
        step("branch-step", {
          publicOutcome: {
            text: "UNCOMMITTED_FIXED_PROSE",
            actorIds: [id("enemy")],
            evidence: [],
          },
        }),
      ],
    }),
  ];
  input.resolution = {
    changes: [],
    worldMinutes: 20,
    configuration: input.source.runtime.configuration,
    outcomes: [],
  };
  input.trigger = "time_skip";
  const scope = {
    schemaVersion: 1,
    scenarioVersionId: id("scenario"),
    divergenceVersionId: id("divergence"),
    atWorldMinutes: 0,
    actorIds: [id("enemy")],
    threadIds: [id("branch-thread")],
    language: "en",
    locationId: null,
    change: "The guide crosses a flooded courtyard and uses supplies.",
    assumptions: ["Rain has soaked the courtyard in this branch."],
    constraints: ["No player choices or new resources."],
    unchangedBaseline: ["Existing capabilities remain."],
    knowledge: [{ threadId: id("branch-thread"), records: [], excerpts: [] }],
  };
  const profile = {
    schemaVersion: 1,
    id: id("resolve-profile"),
    policyRevision: 1,
    registryVersion: "openai-responses-v1",
    task: "world.resolve",
    providerId: "openai",
    modelId: "gpt-6-astra",
    reasoning: "max",
  };
  return { input, scope, effects, profile };
}

export function proposal(f, effects = f.effects) {
  const selected = selectWorldSimulationWork(f.input, f.scope);
  if (selected.status !== "ready")
    throw Error(`Unexpected ${JSON.stringify(selected)}`);
  return {
    schemaVersion: 2,
    decisions: selected.candidates.map((c) => ({
      threadId: c.threadId,
      stepId: c.stepId,
      decision: "advance",
      uncertainty: "resolved",
      capabilityRefs: c.consequenceOptions
        .filter((option) => effects.some((e) => e.kind === option.effect.kind))
        .map((option) => option.capabilityRef),
      evidenceIndexes: c.evidence.map((_, i) => i),
      consequences: structuredClone(effects),
    })),
  };
}

export function response(output, model = "gpt-6-astra") {
  return new Response(
    JSON.stringify({
      status: "completed",
      model,
      output: [
        {
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: JSON.stringify(output) }],
        },
      ],
      usage: { input_tokens: 25, output_tokens: 40 },
    }),
    { status: 200 },
  );
}
