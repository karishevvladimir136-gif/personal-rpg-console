import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import {
  resolveExecutionProfile,
  validateExecutionProfile,
  validateRuntimePolicy,
  runtimeTasks,
} from "../src/lib/model-runtime/registry.ts";
import { modelBudget } from "../src/lib/gameplay/dm-context.ts";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";
const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    return specifier === "server-only"
      ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
      : nextResolve(specifier, context);
  },
});
const { createDmProvider } = await import("../src/lib/server/dm/index.ts");
const { createSummaryProvider } =
  await import("../src/lib/server/memory/provider.ts");
const { modelReasoning } = await import("../src/lib/server/dm/config.ts");
hook.deregister();
const model = (modelId = "gpt-6-astra", reasoning = null) => ({
  providerId: "openai",
  modelId,
  reasoning,
});
const policy = (primary = model(), taskOverrides = {}) => ({
  schemaVersion: 1,
  revision: 4,
  primary,
  taskOverrides,
});
const profile = (
  task = "dm.plan",
  campaignPolicy = null,
  globalDefault = model(),
) =>
  resolveExecutionProfile({
    task,
    profileId: randomUUID(),
    campaignPolicy,
    globalDefault,
  });
const response = (output, actualModel = "gpt-6-astra") =>
  new Response(
    JSON.stringify({
      model: actualModel,
      status: "completed",
      output: [
        {
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: JSON.stringify(output) }],
        },
      ],
      usage: { input_tokens: 42, output_tokens: 16 },
    }),
  );
function environment(t) {
  const names = ["OPENAI_API_KEY", "OPENAI_DM_MODEL", "OPENAI_DM_REASONING"];
  const before = names.map((key) => process.env[key]);
  t.after(() =>
    names.forEach((key, i) =>
      before[i] === undefined
        ? delete process.env[key]
        : (process.env[key] = before[i]),
    ),
  );
  process.env.OPENAI_API_KEY = "SYNTHETIC_SECRET_NEVER_PUBLIC";
  process.env.OPENAI_DM_MODEL = "gpt-6-astra";
  delete process.env.OPENAI_DM_REASONING;
}

test("Wave 1 resolution pins task override, campaign primary, global inheritance and accepted budgets", () => {
  const configured = policy(model("gpt-5.4"), {
    "dm.narrate": model("gpt-5.4-mini", "high"),
  });
  assert.equal(profile("dm.narrate", configured).modelId, "gpt-5.4-mini");
  assert.equal(profile("dm.plan", configured).modelId, "gpt-5.4");
  assert.equal(profile("memory.summary", policy(null)).modelId, "gpt-6-astra");
  const frozen = profile("dm.plan", configured);
  configured.primary.modelId = "unavailable";
  assert.equal(frozen.modelId, "gpt-5.4");
  assert.equal(frozen.policyRevision, 4);
  for (const modelId of ["gpt-6-astra", "gpt-5.4", "gpt-5.4-mini"]) {
    const effective = profile("dm.plan", null, model(modelId));
    assert.equal(effective.reasoning, modelReasoning(modelId));
    assert.equal(modelBudget(effective.modelId).inputCap, 64000);
    assert.equal(modelBudget(effective.modelId).outputReserve, 4096);
  }
  assert.deepEqual(Object.keys(runtimeTasks), [
    "dm.plan",
    "dm.narrate",
    "dm.feedback",
    "memory.summary",
  ]);
});

test("Wave 1 explicit unavailable choices pause without fallback or arbitrary options", () => {
  for (const selection of [
    model("unregistered"),
    { ...model(), providerId: "other" },
    model("gpt-6-astra", "none"),
    { ...model(), apiKey: "PRIVATE" },
    { ...model(), endpoint: "https://untrusted.invalid" },
    null,
  ]) {
    assert.throws(
      () => profile("dm.plan", policy(model(), { "dm.plan": selection })),
      { code: "configuration", retryable: true },
    );
  }
  assert.throws(
    () =>
      resolveExecutionProfile({
        task: "dm.plan",
        profileId: randomUUID(),
        campaignPolicy: policy(),
        globalDefault: model("gpt-5.4"),
        providerAvailable: () => false,
      }),
    { code: "configuration" },
  );
  assert.throws(
    () => validateRuntimePolicy({ ...policy(), credentials: "PRIVATE" }),
    { code: "configuration" },
  );
  assert.throws(
    () =>
      validateRuntimePolicy(
        policy(null, { __proto__: null, unknown: model() }),
      ),
    { code: "configuration" },
  );
  const frozen = profile();
  for (const bad of [
    { ...frozen, registryVersion: "future-registry" },
    { ...frozen, task: "memory.summary" },
    { ...frozen, reasoning: null },
    { ...frozen, privatePayload: "PRIVATE" },
  ])
    assert.throws(() => validateExecutionProfile(bad, "dm.plan"), {
      code: "configuration",
    });
  assert.deepEqual(validateExecutionProfile(frozen), frozen);
});

test("Wave 1 provider factories preserve strict Requests and freeze configured defaults between stages", async (t) => {
  environment(t);
  const { source, input, plan, resolution } = runtimeFixture();
  const bodies = [],
    observed = [];
  const dm = createDmProvider({
    observer: (value) => observed.push(value),
    fetcher: async (url, request) => {
      assert.equal(url, "https://api.openai.com/v1/responses");
      const body = JSON.parse(request.body);
      bodies.push(body);
      return response(
        body.text.format.name === "dm_plan"
          ? plan
          : {
              narration: "The bell falls silent.",
              visualDescription: "A tower.",
              clarification: null,
            },
        "SYNTHETIC_PRIVATE_UNPROVEN_MODEL",
      );
    },
  });
  await dm.plan(source, input);
  process.env.OPENAI_DM_MODEL = "gpt-5.4-mini";
  process.env.OPENAI_DM_REASONING = "low";
  await dm.narrate(source, input, resolution, []);
  for (const body of bodies) {
    assert.equal(body.model, "gpt-6-astra");
    assert.equal(body.reasoning.effort, "xhigh");
    assert.equal(body.store, false);
    assert.equal(body.truncation, "disabled");
    assert.equal(body.text.format.strict, true);
    assert.equal(body.max_output_tokens, 4096);
  }
  assert.ok(bodies[0].input.includes("SYNTHETIC_PRIVATE_CONTEXT_MARKER"));
  assert.ok(!bodies[1].input.includes("SYNTHETIC_PRIVATE_CONTEXT_MARKER"));
  assert.ok(observed.every((attempt) => attempt.actualModel === null));
  assert.ok(!JSON.stringify(observed).includes("SYNTHETIC_PRIVATE"));
  assert.ok(!JSON.stringify(observed).includes("SYNTHETIC_SECRET"));
});

test("Wave 1 injected pinned profile survives retry/config edit; incompatible/missing setup makes zero requests", async (t) => {
  environment(t);
  const { source, input, plan } = runtimeFixture();
  const pinned = profile("dm.plan", policy(model("gpt-5.4", "high")));
  let calls = 0,
    attempts = 0;
  const dm = createDmProvider({
    resolveProfile: () => {
      attempts++;
      return pinned;
    },
    observer: () => {},
    fetcher: async (_url, request) => {
      calls++;
      assert.equal(JSON.parse(request.body).model, "gpt-5.4");
      if (calls === 1) throw new Error("PRIVATE provider failure");
      return response(plan, "gpt-5.4");
    },
  });
  await assert.rejects(dm.plan(source, input), { code: "provider" });
  process.env.OPENAI_DM_MODEL = "unavailable";
  await dm.plan(source, input);
  assert.equal(attempts, 2);
  const unsupported = createDmProvider({
    resolveProfile: () => ({ ...pinned, providerId: "unavailable" }),
    fetcher: async () => {
      calls++;
      throw new Error("must not run");
    },
  });
  await assert.rejects(unsupported.plan(source, input), {
    code: "configuration",
  });
  delete process.env.OPENAI_API_KEY;
  await assert.rejects(dm.plan(source, input), { code: "configuration" });
  assert.equal(calls, 2);
});

test("Wave 1 summary task uses frozen profile and existing exact selection parser", async (t) => {
  environment(t);
  const pinned = profile(
    "memory.summary",
    policy(model("gpt-5.4-mini", "none")),
  );
  const job = {
    id: randomUUID(),
    campaignId: randomUUID(),
    boundaryId: null,
    visibility: "public",
    generation: 1,
    token: randomUUID(),
    attempts: 1,
    stateRevision: 1,
    settingsRevision: 1,
    guideVersionId: randomUUID(),
    fromSequence: 0,
    throughSequence: 0,
    sources: [],
    requiredSourceIds: [],
  };
  const provider = createSummaryProvider({
    resolveProfile: () => pinned,
    observer: () => {},
    fetcher: async (_url, request) => {
      const body = JSON.parse(request.body);
      assert.equal(body.model, "gpt-5.4-mini");
      assert.equal(body.text.format.name, "dm_summary");
      return response({ schemaVersion: 1, selections: [] }, "gpt-5.4-mini");
    },
  });
  assert.deepEqual((await provider.summarize(job)).output, {
    schemaVersion: 1,
    selections: [],
  });
  await assert.rejects(
    createSummaryProvider({
      resolveProfile: () => profile("dm.plan"),
      fetcher: async () => {
        throw new Error("must not run");
      },
    }).summarize(job),
    { code: "configuration" },
  );
});
