import test from "node:test";
import assert from "node:assert/strict";
import { fixture, id, turn } from "./phase2-mechanics-fixtures.mjs";
import {
  emptyPlan,
  memoryStore,
  providerDouble,
} from "./phase2-turn-store-fixture.mjs";
import {
  runTurn,
  resumeTurn,
  clarificationNarration,
} from "../src/lib/gameplay/turn-engine.ts";
import { TurnError } from "../src/lib/gameplay/turn-errors.ts";

const resume = (input, action = "retry", checkId = null, command = action) => ({
  commandId: id(command),
  campaignId: input.campaignId,
  operationId: input.operationId,
  action,
  checkId,
});
const skillPlan = (visibility = "player") => ({
  ...emptyPlan(),
  checks: [
    {
      index: 0,
      actorId: id("player"),
      targetId: null,
      kind: "skill",
      stat: "skill",
      dc: 10,
      dcPublic: false,
      visibility,
      important: true,
      uncertainty: "meaningful",
      advantage: "normal",
    },
  ],
});

test("duplicate operation returns committed result without repeated provider calls or consequences", async () => {
  const source = fixture(),
    { store, state } = memoryStore(source),
    { provider, calls } = providerDouble();
  const input = turn(source, {
    kind: "resource.spend",
    entityId: id("player"),
    resource: "focus",
    amount: 1,
  });
  const first = await runTurn(input, { store, provider }),
    duplicate = await runTurn(input, { store, provider });
  assert.equal(first.status, "committed");
  assert.deepEqual(duplicate, first);
  assert.equal(calls.narrate, 0);
  assert.equal(state.commits, 1);
  assert.match(first.narration, /^Mechanical result:/);
  assert.equal(state.source.snapshot.entities[0].resources.focus, 3);
  await assert.rejects(
    runTurn(
      { ...input, input: "Different action under same identity." },
      { store, provider },
    ),
    /conflict/,
  );
});

test("accepted literal input survives provider failure and retry reuses the stored operation", async () => {
  const source = fixture(),
    { store, state } = memoryStore(source),
    { provider, calls } = providerDouble();
  const input = { ...turn(source), input: "  My exact words / мои слова.  " },
    original = provider.plan;
  provider.plan = async () => {
    throw new Error("SYNTHETIC_PRIVATE_PROVIDER_ERROR");
  };
  const failed = await runTurn(input, { store, provider });
  assert.equal(failed.status, "failed");
  assert.equal(failed.input, input.input);
  assert.equal(failed.narration, null);
  assert.doesNotMatch(JSON.stringify(failed), /SYNTHETIC_PRIVATE/);
  assert.equal(state.commits, 0);
  provider.plan = original;
  const retried = await resumeTurn(resume(input), { store, provider });
  assert.equal(retried.status, "committed");
  assert.equal(state.turns.size, 1);
  assert.equal(calls.narrate, 1);
});

test("visible dice are durably recorded before narration; refresh/retry do not reroll", async () => {
  const source = fixture(),
    { store, state } = memoryStore(source),
    { provider, calls } = providerDouble(skillPlan());
  const input = turn(source),
    waiting = await runTurn(input, { store, provider });
  assert.equal(waiting.status, "awaiting_confirmation");
  assert.equal(waiting.narration, null);
  assert.equal(calls.narrate, 0);
  assert.equal(waiting.checks[0].dc, null);
  assert.deepEqual(await runTurn(input, { store, provider }), waiting);
  assert.deepEqual(
    await resumeTurn(resume(input), { store, provider }),
    waiting,
  );
  assert.equal(state.rollsWritten, 1);
  const done = await resumeTurn(resume(input, "continue"), { store, provider });
  assert.equal(done.status, "committed");
  assert.equal(calls.narrate, 1);
  assert.equal(state.rollsWritten, 1);
  assert.deepEqual(done.checks[0].dice, waiting.checks[0].dice);
  assert.equal(done.checks[0].canReroll, false);
});

test("explicit reroll commands are deduplicated and the session allowance is enforced", async () => {
  const source = fixture(),
    { store, state } = memoryStore(source),
    { provider } = providerDouble(skillPlan());
  const input = turn(source),
    waiting = await runTurn(input, { store, provider });
  const command = resume(input, "reroll", waiting.checks[0].id, "reroll1");
  const first = await resumeTurn(command, { store, provider });
  const duplicate = await resumeTurn(command, { store, provider });
  assert.deepEqual(first.checks, duplicate.checks);
  assert.equal(state.quota, 1);
  assert.equal(state.rollsWritten, 2);
  const second = await resumeTurn(
    { ...command, commandId: id("reroll2") },
    { store, provider },
  );
  assert.equal(second.checks[0].rollNumber, 3);
  assert.equal(second.checks[0].canReroll, false);
  assert.equal(state.quota, 2);
  const denied = await resumeTurn(
    { ...command, commandId: id("reroll3") },
    { store, provider },
  );
  assert.equal(denied.status, "awaiting_confirmation");
  assert.equal(state.quota, 2);
  assert.equal(state.commits, 0);
  assert.equal(
    (await resumeTurn(resume(input, "continue"), { store, provider })).status,
    "committed",
  );
});

test("private/hidden checks never create awaiting hints or public identifiers, DCs, or private source content", async () => {
  for (const visibility of ["private", "player"]) {
    const source = fixture();
    if (visibility === "player")
      source.snapshot.settings.values.dicePresentation = "hidden";
    const { store, state } = memoryStore(source),
      { provider, calls } = providerDouble(skillPlan(visibility));
    const result = await runTurn(turn(source), { store, provider });
    assert.equal(result.status, "committed");
    assert.deepEqual(result.checks, []);
    assert.equal(state.rollsWritten, 1);
    assert.doesNotMatch(
      JSON.stringify(result),
      /SYNTHETIC_PRIVATE|"dc"|"dice"|"targetId"/,
    );
    assert.deepEqual(
      calls.sources.find((s) => s.stage === "narrate").source.privateState,
      {},
    );
  }
});

test("two concurrent state-changing submissions serialize; old lease cannot checkpoint after takeover", async () => {
  const source = fixture(),
    { store, state } = memoryStore(source),
    { provider } = providerDouble();
  const input = turn(source),
    original = provider.plan;
  let release;
  provider.plan = () =>
    new Promise((resolve) => {
      release = resolve;
    });
  const first = runTurn(input, { store, provider });
  while (!release) await new Promise((resolve) => setImmediate(resolve));
  assert.equal(state.turns.get(input.operationId).input.input, input.input);
  await assert.rejects(
    runTurn({ ...input, operationId: id("competing") }, { store, provider }),
    /conflict/,
  );
  assert.equal(
    (await runTurn(input, { store, provider })).status,
    "generating",
  );
  state.clock = 301;
  provider.plan = original;
  const recovered = await resumeTurn(resume(input), { store, provider });
  assert.equal(recovered.status, "committed");
  assert.equal(state.commits, 1);
  release({
    output: emptyPlan(),
    usage: {
      model: "test",
      inputTokens: 0,
      outputTokens: 0,
      calls: 1,
      latencyMs: 0,
    },
  });
  await assert.rejects(first, /conflict/);
  assert.equal(state.commits, 1);
});

test("crash after durable dice insertion reloads the same result without another roll", async () => {
  const source = fixture(),
    { store, state } = memoryStore(source),
    { provider } = providerDouble(skillPlan());
  const original = store.recordChecks;
  store.recordChecks = async (...args) => {
    await original(...args);
    throw new TurnError("unavailable", true);
  };
  const input = turn(source),
    failed = await runTurn(input, { store, provider });
  assert.equal(failed.status, "failed");
  const saved = structuredClone(
    state.turns.get(input.operationId).checkpoint.checks,
  );
  store.recordChecks = original;
  const retry = await resumeTurn(resume(input), { store, provider });
  assert.equal(retry.status, "awaiting_confirmation");
  assert.equal(state.rollsWritten, 1);
  assert.deepEqual(state.turns.get(input.operationId).checkpoint.checks, saved);
});

test("manual correction or settings change makes a pending proposal terminally stale", async () => {
  const source = fixture(),
    { store, state } = memoryStore(source),
    { provider } = providerDouble(skillPlan());
  const input = turn(source);
  await runTurn(input, { store, provider });
  state.source.snapshot.entities[0].hp = 9;
  state.source.runtime.revision++;
  state.source.snapshot.settings.revision++;
  const result = await resumeTurn(resume(input, "continue"), {
    store,
    provider,
  });
  assert.equal(result.status, "failed");
  assert.equal(result.failure, "conflict");
  assert.equal(result.canRetry, false);
  assert.equal(state.source.snapshot.entities[0].hp, 9);
  assert.equal(state.commits, 0);
  assert.equal(result.settingsRevision, 1);
});

test("narration failure after resolution retries safely without spending or rolling twice", async () => {
  const source = fixture();
  source.snapshot.settings.values.interactiveDice = false;
  source.snapshot.settings.values.difficulty.rerolls = "disabled";
  const { store, state } = memoryStore(source),
    { provider } = providerDouble(skillPlan());
  const original = provider.narrate;
  provider.narrate = async () => {
    throw new TurnError("provider", true);
  };
  const input = turn(source);
  const failed = await runTurn(input, { store, provider });
  assert.equal(failed.status, "failed");
  assert.equal(state.rollsWritten, 1);
  assert.equal(state.commits, 0);
  provider.narrate = original;
  const result = await resumeTurn(resume(input), { store, provider });
  assert.equal(result.status, "committed");
  assert.equal(state.rollsWritten, 1);
  assert.equal(state.commits, 1);
});

test("feedback/OOC stay separate from mechanics/private state and proposals remain unapproved", async () => {
  const source = fixture(),
    { store, state } = memoryStore(source),
    { provider, calls } = providerDouble();
  const before = structuredClone(source.snapshot);
  const feedback = await runTurn(
    { ...turn(source), mode: "feedback" },
    { store, provider },
  );
  assert.equal(feedback.status, "committed");
  assert.equal(feedback.proposal.status, "proposed");
  assert.deepEqual(state.source.snapshot, before);
  assert.deepEqual(calls.sources[0].source.privateState, {});
  assert.equal(calls.plan, 0);
  const ooc = await runTurn(
    { ...turn(state.source, null, "ooc"), mode: "ooc" },
    { store, provider },
  );
  assert.equal(ooc.proposal, null);
  assert.deepEqual(state.source.snapshot, before);
});

test("clarification uses neutral trusted text; invalid/private patches never become narration", async () => {
  const source = fixture(),
    { store, state } = memoryStore(source),
    { provider, calls } = providerDouble({
      ...emptyPlan(),
      clarification: "SYNTHETIC_PRIVATE_CONFLICT",
    });
  const result = await runTurn(turn(source), { store, provider });
  assert.equal(result.narration, clarificationNarration);
  assert.equal(calls.narrate, 0);
  assert.doesNotMatch(JSON.stringify(result), /SYNTHETIC_PRIVATE/);
  assert.equal(state.source.runtime.worldMinutes, 0);
  const invalid = providerDouble({
    ...emptyPlan(),
    privatePatches: [
      {
        kind: "table",
        key: "evil",
        operation: "set",
        value: "x",
        amount: null,
      },
    ],
  });
  const rejected = await runTurn(turn(state.source, null, "bad-private"), {
    store,
    provider: invalid.provider,
  });
  assert.equal(rejected.failure, "validation");
  assert.equal(rejected.narration, null);
});

test("companion availability and listeners are validated; cross-campaign operations fail", async () => {
  const source = fixture(),
    { store } = memoryStore(source),
    { provider } = providerDouble();
  await assert.rejects(
    runTurn({ ...turn(source), campaignId: id("other") }, { store, provider }),
  );
  const absent = await runTurn(
    { ...turn(source), mode: "companion", companionId: id("absent") },
    { store, provider },
  );
  assert.equal(absent.failure, "validation");
  const listener = await runTurn(
    {
      ...turn(source, null, "listener"),
      mode: "companion",
      companionId: id("companion"),
      listenerIds: [id("foreign")],
    },
    { store, provider },
  );
  assert.equal(listener.failure, "validation");
});

test("explicit mechanical actions need no provider and use campaign-language trusted result text", async () => {
  const source = fixture();
  source.runtime.configured = false;
  source.snapshot.settings.values.language = "ru";
  const { store, state } = memoryStore(source);
  const unavailable = async () => {
    throw new Error("No provider must be invoked.");
  };
  const result = await runTurn(
    turn(source, {
      kind: "resource.spend",
      entityId: id("player"),
      resource: "focus",
      amount: 1,
    }),
    {
      store,
      provider: {
        plan: unavailable,
        narrate: unavailable,
        feedback: unavailable,
      },
    },
  );
  assert.equal(result.status, "committed");
  assert.match(result.narration, /^Результат по правилам:/);
  assert.equal(state.source.snapshot.entities[0].resources.focus, 3);
});
