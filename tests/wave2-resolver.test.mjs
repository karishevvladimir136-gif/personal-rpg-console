import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import {
  selectWorldResolverWork,
  stageResolvedWorldTransition,
  validateResolvedWorldSettlement,
} from "../src/lib/world/resolver.ts";
import {
  fixture,
  thread,
  step,
  evidence,
  bind,
  id,
} from "./wave1-world-fixtures.mjs";
import {
  fixture as logicFixture,
  proposal as logicProposal,
} from "./wave2-logic-fixtures.mjs";
const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    return specifier === "server-only"
      ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
      : nextResolve(specifier, context);
  },
});
const { createWorldResolverProvider, buildResolverContext } =
  await import("../src/lib/server/world/resolver-provider.ts");
hook.deregister();
function input() {
  const f = fixture();
  f.snapshot.world.threads[0].steps[0].resolution = "resolver_required";
  f.snapshot.world.threads[0].steps[0].publicOutcome = {
    text: "Public consequence",
    actorIds: [],
    evidence: [],
  };
  return f;
}
function proposal(f) {
  const selected = selectWorldResolverWork(f);
  assert.equal(selected.status, "ready");
  return {
    schemaVersion: 1,
    decisions: selected.candidates.map((c) => ({
      threadId: c.threadId,
      stepId: c.stepId,
      decision: "advance",
      uncertainty: "resolved",
      capabilityRefs: [],
      evidenceIndexes: c.evidence.map((_, i) => i),
    })),
  };
}
const response = (output) =>
  new Response(
    JSON.stringify({
      status: "completed",
      model: "gpt-6-astra",
      output: [
        {
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: JSON.stringify(output) }],
        },
      ],
      usage: { input_tokens: 20, output_tokens: 10 },
    }),
    { status: 200 },
  );

test("bounded resolver preserves existing thread definitions and stable event identities", () => {
  const f = input(),
    original = structuredClone(f),
    p = proposal(f);
  const result = stageResolvedWorldTransition(f, p);
  assert.equal(result.status, "staged");
  assert.equal(result.settlement.events.length, 2);
  assert.equal(result.settlement.nextWorld.threads[0].status, "resolved");
  assert.equal(
    result.settlement.nextWorld.threads[0].steps[0].resolution,
    "resolver_required",
  );
  const receipt = result.settlement.events[0].payload.resolverReceipt;
  assert.equal(receipt.operationId, f.command.operationId);
  assert.equal(receipt.stepId, p.decisions[0].stepId);
  assert.equal(receipt.uncertainty, "resolved");
  assert.deepEqual(result.settlement.events[1].payload, {});
  assert.deepEqual(f, original);
  assert.deepEqual(stageResolvedWorldTransition(f, p), result);
  assert.deepEqual(
    validateResolvedWorldSettlement(f, p, result.settlement),
    result.settlement,
  );
});

test("resolver validates all candidates and rejects invented patches/capabilities/evidence", () => {
  const f = input();
  const base = proposal(f);
  for (const p of [
    { ...base, nextWorld: {} },
    { schemaVersion: 1, decisions: [] },
    { schemaVersion: 1, decisions: [...base.decisions, ...base.decisions] },
    {
      schemaVersion: 1,
      decisions: [{ ...base.decisions[0], threadId: id("other-thread") }],
    },
    {
      schemaVersion: 1,
      decisions: [{ ...base.decisions[0], evidenceIndexes: [0] }],
    },
    {
      schemaVersion: 1,
      decisions: [{ ...base.decisions[0], capabilityRefs: ["invented-power"] }],
    },
    {
      schemaVersion: 1,
      decisions: [{ ...base.decisions[0], publicText: "Forged outcome" }],
    },
  ])
    assert.throws(() => stageResolvedWorldTransition(f, p));
  const p = proposal(f);
  p.decisions[0].uncertainty = "missing_evidence";
  assert.deepEqual(stageResolvedWorldTransition(f, p), {
    status: "paused",
    reason: "uncertainty",
    modelRequests: 0,
  });
});

test("PC agency, unknown/future evidence, warnings and capacity pause before any resolver call", async () => {
  const cases = [
    (f) => {
      f.snapshot.world.actors[1].control = "player";
    },
    (f) => {
      f.source.snapshot.entities[2].kind = "player";
    },
    (f) => {
      bind(f);
      f.snapshot.world.threads[0].steps[0].evidence = [evidence()];
    },
    (f) => {
      bind(f);
      const e = evidence({ knowledge: "future_source" });
      f.snapshot.world.threads[0].steps[0].evidence = [e];
      f.snapshot.world.actors[1].knowledge = [e];
    },
    (f) => {
      f.snapshot.world.threads[0].steps[0].consequence =
        "surface_before_complete";
    },
    (f) => {
      f.snapshot.world.threads = Array.from({ length: 9 }, (_, n) =>
        thread("limit" + n, {
          steps: [step("step" + n, { resolution: "resolver_required" })],
        }),
      );
    },
  ];
  for (const mutate of cases) {
    const f = input();
    mutate(f);
    let calls = 0;
    const provider = createWorldResolverProvider({
      apiKey: "synthetic",
      model: "gpt-6-astra",
      fetcher: async () => {
        calls++;
        throw Error("should not run");
      },
    });
    const result = await provider.resolve(f);
    assert.equal(result.result.status, "paused");
    assert.equal(calls, 0);
    assert.equal(result.usage, null);
  }
});

test("Simulation Off, Deadline Off and no due work avoid model calls", async () => {
  for (const mutate of [
    (f) => {
      f.snapshot.world.policy.simulation = false;
    },
    (f) => {
      f.snapshot.world.policy.deadlinePressure = "off";
    },
    (f) => {
      f.snapshot.world.threads[0].steps[0].trigger.atWorldMinutes = 100;
    },
  ]) {
    const f = input();
    mutate(f);
    let calls = 0;
    const provider = createWorldResolverProvider({
      apiKey: "synthetic",
      model: "gpt-6-astra",
      fetcher: async () => {
        calls++;
        throw Error("unexpected");
      },
    });
    assert.equal((await provider.resolve(f)).result.status, "noop");
    assert.equal(calls, 0);
  }
});

test("required knowledge and capability references are exact and public output omits private cause", () => {
  const f = input();
  bind(f);
  const e = evidence();
  f.snapshot.world.actors[1].knowledge = [e];
  f.snapshot.world.actors[1].capabilities = ["construction"];
  f.snapshot.world.threads[0].steps[0].evidence = [e];
  const p = proposal(f);
  p.decisions[0].capabilityRefs = [`${id("enemy")}:construction`];
  const result = stageResolvedWorldTransition(f, p);
  assert.equal(result.status, "staged");
  assert.equal(JSON.stringify(result.publicEvents).includes("PRIVATE"), false);
  assert.equal(
    JSON.stringify(result.publicEvents).includes("construction"),
    false,
  );
  p.decisions[0].evidenceIndexes = [];
  assert.throws(() => stageResolvedWorldTransition(f, p));
});

test("same direct structured requester performs one bounded synthetic resolver call", async () => {
  const f = input();
  f.source.privateState = { unrelated: "UNRELATED_SECRET_MARKER" };
  let calls = 0,
    sent;
  const provider = createWorldResolverProvider({
    apiKey: "synthetic",
    model: "gpt-6-astra",
    fetcher: async (_url, init) => {
      calls++;
      sent = JSON.parse(init.body);
      return response(proposal(f));
    },
  });
  const result = await provider.resolve(f);
  assert.equal(calls, 1);
  assert.equal(result.result.status, "staged");
  assert.equal(result.usage.calls, 1);
  assert.equal(sent.text.format.strict, true);
  assert.equal(sent.text.format.schema.additionalProperties, false);
  assert.equal(sent.store, false);
  assert.equal(JSON.stringify(sent).includes("UNRELATED_SECRET_MARKER"), false);
});

test("synthetic action provider uses public-only structured request and validates before return", async () => {
  const f = logicFixture();
  f.source.privateState = { marker: "PRIVATE_ACTION_MARKER" };
  let sent;
  const provider = createWorldResolverProvider({
    apiKey: "synthetic",
    model: "gpt-6-astra",
    fetcher: async (_url, init) => {
      sent = JSON.parse(init.body);
      return response(logicProposal(f));
    },
  });
  const result = await provider.action(f);
  assert.equal(result.output.action, "observe");
  assert.equal(result.usage.calls, 1);
  assert.equal(JSON.stringify(sent).includes("PRIVATE_ACTION_MARKER"), false);
  const bad = createWorldResolverProvider({
    apiKey: "synthetic",
    model: "gpt-6-astra",
    fetcher: async () => response(logicProposal(f, { actorId: id("enemy") })),
  });
  await assert.rejects(bad.action(f), (e) => e.code === "validation");
});

test("resolver provider failure and oversized context never return partial settlement or retry", async () => {
  let calls = 0;
  const provider = createWorldResolverProvider({
    apiKey: "synthetic",
    model: "gpt-6-astra",
    fetcher: async () => {
      calls++;
      return new Response("{}", { status: 503 });
    },
  });
  await assert.rejects(provider.resolve(input()), (e) => e.code === "provider");
  assert.equal(calls, 1);
  assert.throws(
    () =>
      buildResolverContext(
        "gpt-6-astra",
        { huge: "x".repeat(64000) },
        "mandatory",
        1,
      ),
    (e) => e.code === "context",
  );
});

test("resolver retry rejects changed event text, receipts, head and source versions", () => {
  const f = input(),
    p = proposal(f),
    result = stageResolvedWorldTransition(f, p);
  for (const mutate of [
    (s) => {
      s.events[0].text = "forged";
    },
    (s) => {
      s.events[0].payload.resolverReceipt.operationId = id("other");
    },
    (s) => {
      s.expectedHeadId = id("new-head");
    },
    (s) => {
      s.sourceVersionIds = [id("foreign-source")];
    },
    (s) => {
      s.nextWorld.threads[0].steps[0].resolution = "deterministic";
    },
  ]) {
    const changed = structuredClone(result.settlement);
    mutate(changed);
    assert.throws(() => validateResolvedWorldSettlement(f, p, changed));
  }
});
