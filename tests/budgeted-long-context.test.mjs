import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";
import { memorySource } from "./phase3-long-fixtures.mjs";
import { buildContext, modelBudget } from "../src/lib/gameplay/dm-context.ts";
import { ContextCapacityError } from "../src/lib/gameplay/dm-errors.ts";
import { withMemory } from "../src/lib/memory/context.ts";
import { retrieveMemory, selectCriticalSourceIds } from "../src/lib/memory/retrieval.ts";

const model = "gpt-6-astra";
const action =
  "i jump on top of nearest table to get advantage and strike innkeeper with my sword";
const size = (value) => Buffer.byteLength(JSON.stringify(value));

function fixture(turnCount = 350) {
  const { source, input, actorId } = runtimeFixture();
  const cid = input.campaignId;
  const sessionId = source.snapshot.sessions[0].id;
  input.input = action;
  source.snapshot.settings.values.rulesSystem.id = "world-logic-v1";
  source.snapshot.entities[0].hp = 10;
  source.snapshot.entities[0].max_hp = 10;
  const innkeeper = {
    ...source.snapshot.entities[0], id: randomUUID(), kind: "npc",
    name: "The innkeeper", hp: 6, max_hp: 8,
  };
  source.snapshot.entities.push(innkeeper);
  for (let index = 0; index < 6; index++) {
    source.snapshot.entities.push({
      ...innkeeper, id: randomUUID(), name: `Public traveler ${index}`,
    });
    source.snapshot.items.push({
      id: randomUUID(), campaign_id: cid, revision: 1,
      name: `Ordinary item ${index}`, quantity: 1,
      description: "A mundane possession available in the current campaign.",
    });
    source.snapshot.quests.push({
      id: randomUUID(), campaign_id: cid, revision: 1,
      title: `Open errand ${index}`, status: "open",
    });
  }
  const encounterId = randomUUID();
  source.runtime.encounters.push({
    id: encounterId, campaign_id: cid, status: "active", round: 3,
    settings_revision: 1, public_summary: "The innkeeper is engaged.",
  });
  for (const [index, entity] of [source.snapshot.entities[0], innkeeper].entries()) {
    source.runtime.participants.push({
      id: randomUUID(), campaign_id: cid, encounter_id: encounterId,
      entity_id: entity.id, public_name: entity.name, turn_order: index,
      public_position: { position: "nearby" },
      public_resources: {
        action: index === 0 ? 1 : 0, move: 1, reaction: 1,
        active: index === 0, defending: index !== 0, withdrawn: false,
      },
    });
  }
  source.snapshot.locations.push({
    id: randomUUID(), campaign_id: cid, revision: 1,
    name: "The roadside inn", status: "known",
  });
  source.snapshot.publicState.current_location_id = source.snapshot.locations[0].id;
  const history = [];
  function addTurn(index) {
    const sceneId = randomUUID();
    const body = `At the inn, public scene ${index}: the innkeeper notes a table and a sheathed sword. ` +
      "This narration is historical evidence with its own revision. ".repeat(5);
    source.snapshot.scenes.push({
      id: sceneId, campaign_id: cid, revision: 1, session_id: sessionId,
      role: "dm", body,
    });
    source.snapshot.publicState.current_scene_id = sceneId;
    source.runtime.turns.push({
      id: randomUUID(), campaign_id: cid, session_id: sessionId,
      status: "committed", mode: "game", input: `Previous action ${index}`,
      narration: body, listenerIds: [],
    });
    if (index >= turnCount - 24) {
      history.push(memorySource(`historical-${index}`, body, {
        campaignId: cid, ref: {
          campaignId: cid, kind: "scene", id: sceneId,
          version: "1", part: 0, visibility: "public",
        },
        sequence: index, significance: index % 3,
      }));
    }
  }
  for (let index = 0; index < turnCount; index++) addTurn(index);
  const privateHistory = Array.from({ length: 12 }, (_, index) => {
    const row = memorySource(`private-${index}`, "The innkeeper has a private concern about the table.", {
      campaignId: cid, sequence: index,
    });
    row.ref = { ...row.ref, kind: "private_event", visibility: "private" };
    return row;
  });
  const digest = history.slice(-4);
  const exactEvents = [
    memorySource("exact-public-position", "The innkeeper is still at the nearby table.", {
      campaignId: cid, sequence: turnCount + 1,
    }),
    memorySource("exact-public-remark", "A traveler witnessed the innkeeper's last remark.", {
      campaignId: cid, sequence: turnCount + 2,
    }),
    memorySource("exact-private-motive", "The innkeeper privately worries about the traveler.", {
      campaignId: cid, sequence: turnCount + 3,
    }),
  ];
  exactEvents[2].ref = {
    ...exactEvents[2].ref, kind: "private_event", visibility: "private",
  };
  const publicSummary = {
    id: randomUUID(), campaignId: cid, visibility: "public", valid: true,
    generation: 1, sourceRefs: digest.map((row) => row.ref), entries: digest,
  };
  const store = {
    context: async (_cid, _actors, includePrivate) => ({
      campaignId: cid, generation: 1, stateRevision: source.runtime.revision,
      checkpoint: null, publicSummary,
      privateSummary: includePrivate ? {
        id: randomUUID(), campaignId: cid, visibility: "private", valid: true,
        generation: 1, sourceRefs: privateHistory.slice(0, 2).map((row) => row.ref),
        entries: privateHistory.slice(0, 2),
      } : null,
      uncovered: includePrivate
        ? exactEvents
        : exactEvents.filter((row) => row.ref.visibility === "public"),
      overflow: false, aliases: [],
    }),
    search: async (request) => ({
      campaignId: cid, generation: 1, aliases: [],
      sources: request.visibility === "private" ? privateHistory : history,
    }),
  };
  return { source, input, store, addTurn, history, privateHistory, exactEvents, actorId };
}

test("Round 3 owner-shaped action fits without granting advantage or calling a provider", async () => {
  const f = fixture(35);
  let calls = 0;
  f.store.search = ((search) => async (request) => {
    calls++;
    return search(request);
  })(f.store.search);
  const selected = await withMemory(f.source, f.input, f.store, false, {
    model, stage: "narrate",
  });
  const built = buildContext(selected, f.input, "narrate", { model });
  const payload = JSON.parse(built.input);
  assert.equal(payload.mandatory.input, action);
  assert.equal(payload.mandatory.current.encounters[0].round, 3);
  assert.equal(payload.mandatory.current.participants[0].public_resources.action, 1);
  assert.equal(payload.mandatory.current.entities[1].hp, 6);
  assert.ok(built.estimatedTokens <= 64000);
  assert.ok(calls > 0);
  assert.equal(payload.mandatory.outcomes?.length ?? 0, 0);
  assert.ok(!built.input.includes('"advantage:'));
  assert.ok(!built.input.includes("exact-private-motive"));
});

test("aged campaign stays bounded and deterministic through five consecutive combat contexts", async (t) => {
  const f = fixture(400);
  const sizes = [];
  for (let turn = 0; turn < 5; turn++) {
    f.input.operationId = randomUUID();
    f.input.expectedRevision = f.source.runtime.revision;
    const selected = await withMemory(f.source, f.input, f.store, true, {
      model, stage: "plan",
    });
    const retried = await withMemory(f.source, f.input, f.store, true, {
      model, stage: "plan",
    });
    assert.deepEqual(
      selected.memory.historical.map((row) => row.id),
      retried.memory.historical.map((row) => row.id),
    );
    assert.deepEqual(
      selected.memory.privateHistorical.map((row) => row.id),
      retried.memory.privateHistorical.map((row) => row.id),
    );
    const first = buildContext(selected, f.input, "plan", { model });
    const second = buildContext(selected, f.input, "plan", { model });
    assert.equal(first.input, second.input);
    assert.ok(first.estimatedTokens <= 64000);
    const payload = JSON.parse(first.input);
    assert.equal(payload.mandatory.current.encounters[0].status, "active");
    assert.equal(payload.mandatory.current.entities[1].hp, 6);
    assert.equal(payload.mandatory.current.items.length, 6);
    assert.equal(payload.mandatory.current.quests.length, 6);
    assert.equal(payload.mandatory.activeActivitySettings.encounters[0].revision, 1);
    assert.ok(payload.memory.privateContinuity);
    assert.equal(payload.memory.exactEvents.length, 2);
    assert.equal(payload.memory.privateContinuity.exactEvents.length, 1);
    sizes.push(first.estimatedTokens);
    f.addTurn(400 + turn);
    f.source.runtime.revision++;
  }
  assert.ok(Math.max(...sizes) - Math.min(...sizes) < 3000);
  for (let turn = 0; turn < 180; turn++) f.addTurn(405 + turn);
  f.input.expectedRevision = f.source.runtime.revision;
  const aged = await withMemory(f.source, f.input, f.store, true, {
    model, stage: "plan",
  });
  const later = buildContext(aged, f.input, "plan", { model });
  assert.ok(later.estimatedTokens <= 64000);
  assert.ok(later.estimatedTokens - sizes[0] < 12000);
  for (let turn = 0; turn < 180; turn++) f.addTurn(585 + turn);
  const evenLater = buildContext(
    await withMemory(f.source, f.input, f.store, true, { model, stage: "plan" }),
    f.input,
    "plan",
    { model },
  );
  assert.ok(Math.abs(evenLater.estimatedTokens - later.estimatedTokens) < 1000);
  assert.equal(f.source.runtime.turns.length, 765);
  t.diagnostic(JSON.stringify({ fiveTurnBytes: sizes, after585: later.estimatedTokens,
    after765: evenLater.estimatedTokens }));
});

test("source-version dedup keeps distinct attributed claims and current scene", async () => {
  const f = fixture(35);
  const originalContext = f.store.context;
  f.store.context = async (...args) => {
    const context = await originalContext(...args);
    const source = context.publicSummary.entries[0];
    context.publicSummary.entries.push({
      ...source, id: `${source.id}-rumor`,
      text: "Locals rumor that the innkeeper moved a table after midnight.",
      statementKind: "rumor", attribution: "locals",
    });
    return context;
  };
  const selected = await withMemory(f.source, f.input, f.store, false, {
    model, stage: "narrate",
  });
  const payload = JSON.parse(buildContext(selected, f.input, "narrate", { model }).input);
  const currentSceneId = f.source.snapshot.publicState.current_scene_id;
  assert.ok(payload.originalScenes.some((scene) => scene.id === currentSceneId));
  const historicalRefIds = new Set(payload.memory.history.map((row) => row.ref.id));
  assert.ok(payload.originalScenes.every(
    (scene) => scene.id === currentSceneId || !historicalRefIds.has(scene.id),
  ));
  assert.ok(payload.memory.digest.some((row) => row.statementKind === "rumor"));
  assert.ok(payload.memory.history.length > 0);
});

test("oversized mandatory state has a specific capacity condition", async () => {
  const f = fixture(40);
  f.source.snapshot.publicState.summary = "x".repeat(75000);
  await assert.rejects(
    withMemory(f.source, f.input, f.store, true, { model, stage: "plan" }),
    (error) => error instanceof ContextCapacityError &&
      error.message === "context_capacity_mandatory",
  );
  assert.ok(size(f.source.snapshot.publicState) > 64000);
});

test("critical retrieved evidence fails closed when its own bytes cannot fit", async () => {
  const f = fixture(35);
  const selected = await withMemory(f.source, f.input, f.store, true, {
    model, stage: "plan",
  });
  assert.ok(selected.memory.historical.length > 0);
  selected.memory.publicSummary = null;
  selected.memory.privateSummary = null;
  const without = buildContext(selected, f.input, "plan", {
    model, requiredOnly: true,
  });
  selected.memory.requiredHistoricalSourceIds = [selected.memory.historical[0].id];
  const withRequired = buildContext(selected, f.input, "plan", {
    model, requiredOnly: true,
  });
  assert.ok(withRequired.estimatedTokens > without.estimatedTokens);
  const budget = {
    ...modelBudget(model), inputCap: without.estimatedTokens + 1,
  };
  assert.throws(
    () => buildContext(selected, f.input, "plan", { model, budget }),
    (error) => error instanceof ContextCapacityError,
  );
});

test("exact-event pressure is marked recoverable only through validated coverage", async () => {
  const f = fixture(35);
  const selected = await withMemory(f.source, f.input, f.store);
  selected.memory.exactEvents[0].text = "e".repeat(20000);
  const withoutExact = structuredClone(selected);
  withoutExact.memory.exactEvents = [];
  const baseline = buildContext(withoutExact, f.input, "plan", {
    model, requiredOnly: true,
  });
  const budget = {
    ...modelBudget(model), inputCap: baseline.estimatedTokens + 5000,
  };
  assert.throws(
    () => buildContext(selected, f.input, "plan", { model, budget }),
    (error) => error instanceof ContextCapacityError && error.summaryMayHelp,
  );
  assert.equal(selected.memory.exactEvents[0].text.length, 20000);
});

test("relevant Canon and owner corrections outrank optional recall bytes", () => {
  const f = fixture(35);
  const correction = memorySource("owner-correction", "The innkeeper corrected the table description.", {
    campaignId: f.input.campaignId, authority: "correction",
  });
  const canon = memorySource("current-canon", "The innkeeper's sword is still sheathed at the table.", {
    campaignId: f.input.campaignId, authority: "canon",
  });
  const unrelated = memorySource("unrelated-correction", "The distant harbor gate is closed.", {
    campaignId: f.input.campaignId, authority: "correction",
  });
  const request = {
    campaignId: f.input.campaignId, visibility: "public", actorIds: [],
    query: f.input.input, entityIds: [], requiredSourceIds: [],
    worldMinutes: 1, maxBytes: 30, maxExcerpts: 12,
    historicalComparison: false,
  };
  const batch = {
    campaignId: f.input.campaignId, generation: 1, aliases: [],
    sources: [correction, canon, unrelated],
  };
  const required = selectCriticalSourceIds(request, batch);
  assert.ok(required.includes(correction.id));
  assert.ok(required.includes(canon.id));
  assert.ok(!required.includes(unrelated.id));
  assert.equal(
    retrieveMemory({ ...request, requiredSourceIds: required }, batch).reason,
    "budget",
  );
});
