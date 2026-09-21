import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import {
  modelBudget,
  modelInputLimit,
  buildContext,
} from "../src/lib/gameplay/dm-context.ts";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";
import {
  compositionFixture,
  compositionResponse,
} from "./d2a-composition-fixtures.mjs";
import { fixture, proposal, response } from "./d2a-resolver-fixtures.mjs";

const hook = registerHooks({
  resolve(specifier, context, next) {
    return specifier === "server-only"
      ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
      : next(specifier, context);
  },
});
const { createComposerProvider } =
  await import("../src/lib/server/world-lab/composer-provider.ts");
const { createWorldResolverProvider, buildResolverContext } =
  await import("../src/lib/server/world/resolver-provider.ts");
hook.deregister();

test("only compose and detached simulation increase the accepted output reserve", () => {
  for (const model of ["gpt-5.4", "gpt-5.4-mini", "gpt-6-astra"]) {
    const ordinary = modelBudget(model);
    for (const task of [
      "dm.plan",
      "dm.narrate",
      "dm.feedback",
      "memory.summary",
      "canon.compile",
      "world.resolve",
    ])
      assert.deepEqual(modelBudget(model, { task }), ordinary);
    const compose = modelBudget(model, { task: "world.compose" });
    const simulation = modelBudget(model, {
      task: "world.resolve",
      purpose: "simulation",
    });
    assert.equal(ordinary.outputReserve, 4096);
    assert.deepEqual(compose, { ...ordinary, outputReserve: 16384 });
    assert.deepEqual(simulation, { ...ordinary, outputReserve: 8192 });
    for (const budget of [ordinary, compose, simulation]) {
      assert.equal(modelInputLimit(budget), 64000);
      const constrained = {
        ...budget,
        contextLimit: 30000,
        safetyMargin: 1500,
      };
      assert.equal(modelInputLimit(constrained), 28500 - budget.outputReserve);
    }
  }
  assert.throws(() => modelBudget("unknown", { task: "world.compose" }), {
    code: "configuration",
  });
  // Exercise admission at an exact boundary, not only budget arithmetic.
  const { source, input } = runtimeFixture();
  const model = "gpt-5.4";
  const needed = buildContext(source, input, "plan", { model }).estimatedTokens;
  const ordinary = {
    ...modelBudget(model),
    contextLimit: needed + 4096 + 5000,
    safetyMargin: 5000,
  };
  assert.doesNotThrow(() =>
    buildContext(source, input, "plan", { model, budget: ordinary }),
  );
  for (const outputReserve of [8192, 16384])
    assert.throws(
      () =>
        buildContext(source, input, "plan", {
          model,
          budget: { ...ordinary, outputReserve },
        }),
      { code: "context" },
    );
  const ordinaryResolver = buildResolverContext(model, {}, "test", 0);
  assert.equal(ordinaryResolver.budget.outputReserve, 4096);
});

function cases() {
  const c = compositionFixture();
  for (const profile of [
    c.requested.composition.composeProfile,
    c.requested.composition.simulationProfile,
  ])
    Object.assign(profile, { modelId: "gpt-5.4", reasoning: "high" });
  const r = fixture();
  Object.assign(r.profile, { modelId: "gpt-5.4", reasoning: "high" });
  return [
    {
      kind: "compose",
      cap: 16384,
      state: c.requested,
      output: c.proposal,
      invoke: (options) =>
        createComposerProvider(options)(c.requested.composition),
      good: () => compositionResponse(c.proposal, "gpt-5.4-2026-03-05"),
    },
    {
      kind: "simulate",
      cap: 8192,
      state: r,
      output: proposal(r),
      invoke: (options) =>
        createWorldResolverProvider(options).simulate(
          r.input,
          r.scope,
          r.profile,
        ),
      good: () => response(proposal(r), "gpt-5.4-2026-03-05"),
    },
  ];
}

test("real task adapters retain GPT-5.4/high, strict output and safe cap diagnostics", async (t) => {
  t.mock.method(globalThis, "fetch", () => {
    throw Error("NO_NETWORK");
  });
  for (const c of cases()) {
    const attempts = [],
      requests = [],
      before = structuredClone(c.state);
    const result = await c.invoke({
      apiKey: "SYNTHETIC",
      model: "gpt-5.4",
      reasoning: "high",
      observer: (attempt) => attempts.push(attempt),
      fetcher: async (_, init) => {
        requests.push(JSON.parse(init.body));
        return c.good();
      },
    });
    assert.equal(requests.length, 1);
    assert.equal(requests[0].max_output_tokens, c.cap);
    assert.equal(requests[0].model, "gpt-5.4");
    assert.equal(requests[0].reasoning.effort, "high");
    assert.equal(requests[0].text.format.strict, true);
    assert.equal(requests[0].truncation, "disabled");
    assert.equal(result.usage.model, "gpt-5.4-2026-03-05");
    assert.equal(attempts[0].maxOutputTokens, c.cap);
    assert.deepEqual(c.state, before);
  }
});

test("incomplete, malformed, wrong identity and failed responses fail closed once at revised budgets", async (t) => {
  t.mock.method(globalThis, "fetch", () => {
    throw Error("NO_NETWORK");
  });
  for (const c of cases()) {
    for (const kind of [
      "incomplete",
      "malformed",
      "wrong-model",
      "unavailable",
      "timeout",
    ]) {
      let calls = 0;
      const attempts = [],
        before = structuredClone(c.state);
      await assert.rejects(
        c.invoke({
          apiKey: "SYNTHETIC",
          model: "gpt-5.4",
          reasoning: "high",
          observer: (attempt) => attempts.push(attempt),
          fetcher: async (_, init) => {
            calls++;
            assert.equal(JSON.parse(init.body).max_output_tokens, c.cap);
            if (kind === "timeout") throw Error("synthetic timeout");
            if (kind === "unavailable")
              return new Response("", { status: 503 });
            const payload = await c.good().json();
            if (kind === "incomplete") {
              payload.status = "incomplete";
              payload.incomplete_details = { reason: "max_output_tokens" };
              payload.usage.output_tokens = c.cap;
            }
            if (kind === "malformed")
              payload.output[0].content[0].text =
                '{"schemaVersion":1,"authority":"invented"}';
            if (kind === "wrong-model") payload.model = "gpt-5.4-mini";
            return new Response(JSON.stringify(payload));
          },
        }),
        {
          code:
            kind === "wrong-model"
              ? "configuration"
              : kind === "malformed"
                ? "validation"
                : "provider",
        },
      );
      assert.equal(calls, 1, `${c.kind}/${kind} cannot retry or fall back`);
      assert.equal(attempts[0].maxOutputTokens, c.cap);
      assert.deepEqual(c.state, before);
    }
    let calls = 0;
    await assert.rejects(
      c.invoke({
        apiKey: "SYNTHETIC",
        model: "gpt-5.4",
        reasoning: "medium",
        fetcher: async () => {
          calls++;
          return c.good();
        },
      }),
      { code: "configuration" },
    );
    assert.equal(calls, 0, "reasoning cannot silently change");
  }
});
