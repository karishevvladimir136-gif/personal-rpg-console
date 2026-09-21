import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import {
  moduleFromSource,
  serverModule,
  scriptedProvider,
} from "./d2a-qa-fixture.mjs";

const {
  fixture: runtimeFixture,
  event,
  memoryRow,
} = await moduleFromSource("tests/d1-runtime-fixtures.mjs");
const { readDetachedState } = await moduleFromSource(
  "src/lib/saves/detached-reader.ts",
);
const { sha256 } = await moduleFromSource("src/lib/world-library/parsers.ts");
const { canonicalLabJson } = await moduleFromSource(
  "src/lib/world-lab/inputs.ts",
);
const {
  buildCompositionBasis,
  requestCompositionPlan,
  recordCompositionPlan,
  approveCompositionPlan,
} = await moduleFromSource("src/lib/world-lab/composition.ts");
const { prepareLabSimulation, stageLabSimulation, buildLabSimulationScope } =
  await moduleFromSource("src/lib/world-lab/simulation.ts");
const { createWorldResolverProvider } = await serverModule(
  "src/lib/server/world/resolver-provider.ts",
);

function fixture(options = {}) {
  const f = runtimeFixture();
  const actor = f.world.actors.find((a) => a.id === f.enemy);
  actor.publicName = "Known harbor keeper";
  actor.capabilities = ["world.condition.add:wet"];
  f.world.threads[0].publicTitle = "Known weather watch";
  options.mutate?.(f);
  const run = f.raw.run,
    baseRaw = structuredClone(f.raw);
  baseRaw.run = null;
  baseRaw.manifest.runId = null;
  baseRaw.manifest.schemaVersion = 2;
  baseRaw.manifest.id = run.input.base.manifestId;
  baseRaw.manifest.timelineId = run.input.base.timelineId;
  const state = readDetachedState(baseRaw, {
    ownerId: f.raw.ownerId,
    campaignId: f.raw.campaignId,
  });
  const basisDigest = sha256(
    canonicalLabJson({
      ownerId: f.raw.ownerId,
      campaignId: f.raw.campaignId,
      saveId: run.input.base.saveId,
      manifestId: run.input.base.manifestId,
      canonGeneration: f.raw.canonGeneration,
      sourceHeads: run.input.sourceHeads,
      documents: run.input.documentVersions,
    }),
  );
  const base = buildCompositionBasis({
    state,
    sourceHeads: run.input.sourceHeads,
    documents: run.input.documentVersions,
    base: {
      saveId: run.input.base.saveId,
      timelineId: run.input.base.timelineId,
      label: "Public saved base",
      worldMinutes: 0,
    },
    basisDigest,
  });
  const profile = {
    schemaVersion: 1,
    id: randomUUID(),
    policyRevision: 0,
    registryVersion: "openai-responses-v1",
    task: "world.resolve",
    providerId: "openai",
    modelId: "gpt-6-astra",
    reasoning: "max",
  };
  const requested = requestCompositionPlan({
    ...base,
    operationId: randomUUID(),
    premise: "What if a local rain shower wets the harbor keeper?",
    language: "en",
    composeProfile: { ...profile, id: randomUUID(), task: "world.compose" },
    simulationProfile: profile,
  });
  const proposal = {
    schemaVersion: 1,
    title: "A local shower",
    changeDescription: requested.composition.premise,
    divergenceType: "circumstance",
    timingText: "At the saved point",
    offsetMinutes: 0,
    locationIndex: null,
    affectedActorIndexes: [
      base.choices.actors.findIndex((a) => a.id === f.enemy),
    ],
    affectedThreadIndexes: [0],
    assumptions: ["Owner assumes a local shower."],
    constraints: ["No PC choice."],
    unchangedBaseline: ["All other established facts."],
    horizonMinutes: 120,
    policy: structuredClone(base.choices.policy),
    ambiguities: options.ambiguities ?? [],
    statements: [],
  };
  const review = recordCompositionPlan(requested, proposal, {
    model: profile.modelId,
    inputTokens: 1,
    outputTokens: 1,
    calls: 1,
    latencyMs: 1,
  });
  const approved = approveCompositionPlan(review, {
    basis: base.basis,
    ownerId: f.raw.ownerId,
    scenarioVersionId: f.scenario.versionId,
    allocateId: randomUUID,
  });
  f.scenario.body = approved.scenario;
  f.divergence.body = approved.divergence;
  run.input.resolutionPolicy.id = "single-model-world-v1";
  run.input.executionProfile = profile;
  run.inputDigest = sha256(canonicalLabJson(run.input));
  return f;
}
function proposalFor(prepared) {
  return {
    schemaVersion: 2,
    decisions: prepared.selection.candidates.map((c) => ({
      threadId: c.threadId,
      stepId: c.stepId,
      decision: "advance",
      uncertainty: "resolved",
      capabilityRefs: [c.consequenceOptions[0].capabilityRef],
      evidenceIndexes: c.evidence.map((_, index) => index),
      consequences: [c.consequenceOptions[0].effect],
    })),
  };
}

test("D2A QA exact approved detached state reaches one actual resolver request and a recomputable proof", async () => {
  const f = fixture(),
    operationId = randomUUID(),
    state = f.state();
  assert.doesNotThrow(() => buildLabSimulationScope(state));
  const prepared = prepareLabSimulation(state, operationId);
  assert.equal(prepared.status, "ready", JSON.stringify(prepared));
  assert.equal(prepared.worldInput.resolution.worldMinutes, 60);
  const t = scriptedProvider(proposalFor(prepared));
  const response = await createWorldResolverProvider(t.options).simulate(
    prepared.worldInput,
    prepared.scope,
    prepared.profile,
  );
  const planned = stageLabSimulation(state, operationId, response.proposal);
  assert.equal(planned.status, "staged");
  assert.equal(planned.proof.schemaVersion, 2);
  assert.deepEqual(
    planned,
    stageLabSimulation(state, operationId, response.proposal),
  );
  assert.equal(t.requests.length, 1);
  assert.equal(
    JSON.stringify(response.result.publicEvents).includes("PRIVATE"),
    false,
  );
});

test("D2A QA non-consequential unanswered review questions do not invalidate an approved detached run", () => {
  const f = fixture({
    ambiguities: [
      { question: "Optional cosmetic preference?", consequential: false },
    ],
  });
  assert.deepEqual(f.scenario.body.composition.review.ambiguityAnswers, [null]);
  assert.equal(prepareLabSimulation(f.state(), randomUUID()).status, "ready");
});

test("D2A QA unrelated future threads cannot consume the relevant scope or Memory budget", () => {
  const f = fixture({
    mutate(f) {
      for (let i = 0; i < 40; i++) {
        const actorId = randomUUID();
        f.world.actors.push({
          id: actorId,
          campaignId: f.raw.campaignId,
          revision: 1,
          kind: "group",
          entityId: null,
          control: "autonomous",
          publicName: null,
          locationId: null,
          capabilities: [],
          knowledge: [],
        });
        f.world.threads.push({
          ...structuredClone(f.world.threads[0]),
          id: randomUUID(),
          title: `SYNTHETIC_PRIVATE_IRRELEVANT_${i}`,
          publicTitle: null,
          actorIds: [actorId],
          decisionActorIds: [actorId],
          steps: f.world.threads[0].steps.map((step) => ({
            ...structuredClone(step),
            id: randomUUID(),
            trigger: { ...step.trigger, atWorldMinutes: 1000 },
            publicOutcome: null,
          })),
        });
      }
    },
  });
  const prepared = prepareLabSimulation(f.state(), randomUUID());
  assert.equal(prepared.status, "ready", JSON.stringify(prepared));
  assert.equal(prepared.scope.knowledge.length, 1);
  assert.equal(prepared.selection.candidates.length, 1);
  assert.equal(
    JSON.stringify(prepared.scope).includes("SYNTHETIC_PRIVATE_IRRELEVANT"),
    false,
  );
});

test("D2A QA private, unknown and future Memory floods cannot reach the selected actor's production provider context", async () => {
  const f = fixture({
    mutate(f) {
      const observed = event(f.raw, {
        text: "SYNTHETIC_POSITIVE_PUBLIC_KNOWLEDGE: harbor rain.",
        worldMinutes: 0,
        actorIds: [f.enemy],
      });
      memoryRow(f, observed, { known_by: [f.enemy] });
      for (let i = 0; i < 50; i++) {
        const unknown = event(f.raw, {
          text: `SYNTHETIC_UNKNOWN_${i} harbor rain`,
          worldMinutes: 0,
          actorIds: [f.actor],
        });
        memoryRow(f, unknown, { known_by: [f.actor], significance: 99 });
        const future = event(f.raw, {
          text: `SYNTHETIC_FUTURE_${i} harbor rain`,
          worldMinutes: 1000,
          actorIds: [f.enemy],
        });
        memoryRow(f, future, { known_by: [f.enemy], significance: 99 });
        const hidden = event(f.raw, {
          text: `SYNTHETIC_PRIVATE_${i} harbor rain`,
          worldMinutes: 0,
          visibility: "private",
          actorIds: [f.actor],
        });
        memoryRow(
          f,
          hidden,
          { kind: "private_event", known_by: [f.actor], significance: 99 },
          "private",
        );
      }
    },
  });
  const prepared = prepareLabSimulation(f.state(), randomUUID());
  assert.equal(prepared.status, "ready", JSON.stringify(prepared));
  const t = scriptedProvider(proposalFor(prepared));
  await createWorldResolverProvider(t.options).simulate(
    prepared.worldInput,
    prepared.scope,
    prepared.profile,
  );
  assert.equal(t.requests.length, 1);
  assert.match(t.requests[0].input, /SYNTHETIC_POSITIVE_PUBLIC_KNOWLEDGE/);
  assert.doesNotMatch(
    t.requests[0].input,
    /SYNTHETIC_UNKNOWN|SYNTHETIC_FUTURE|SYNTHETIC_PRIVATE|PRIVATE_DM_STATE/,
  );
});
