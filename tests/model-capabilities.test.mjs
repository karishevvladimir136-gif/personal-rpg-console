import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { modelBudget } from "../src/lib/gameplay/dm-context.ts";
import {
  modelCapabilities,
  recognizedActualModel,
} from "../src/lib/model-runtime/capabilities.ts";
import { validateModelSelection } from "../src/lib/model-runtime/registry.ts";
import { providerSettings } from "../src/lib/production/configuration.ts";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";

const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    return specifier === "server-only"
      ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
      : nextResolve(specifier, context);
  },
});
const { modelReasoning } = await import("../src/lib/server/dm/config.ts");
const { openAiProvider } = await import("../src/lib/server/dm/provider.ts");
hook.deregister();

const select = (modelId, reasoning) =>
  validateModelSelection({ providerId: "openai", modelId, reasoning });
const response = (output, model) =>
  new Response(JSON.stringify({
    model,
    status: "completed",
    output: [{
      type: "message",
      role: "assistant",
      status: "completed",
      content: [{ type: "output_text", text: JSON.stringify(output) }],
    }],
    usage: { input_tokens: 12, output_tokens: 8 },
  }));

test("Sol capability is 1.05M/128K and keeps the accepted production input and ordinary output caps", () => {
  assert.equal(modelCapabilities("gpt-6-sol").contextLimit, 1_050_000);
  assert.equal(modelCapabilities("gpt-6-sol").maxOutputTokens, 128_000);
  assert.deepEqual(modelBudget("gpt-6-sol"), {
    model: "gpt-6-sol",
    contextLimit: 1_050_000,
    outputReserve: 4096,
    safetyMargin: 52_500,
    inputCap: 64_000,
    accountingVersion: "utf8-byte-upper-bound-v1+2048-framing",
  });
  assert.equal(modelBudget("gpt-6-astra").contextLimit, 1_050_000);
  assert.equal(modelBudget("gpt-5.4").contextLimit, 1_050_000);
  assert.equal(modelBudget("gpt-5.4-mini").contextLimit, 400_000);
});

test("Sol requires explicit reasoning and accepts high, xhigh and max without fallback", () => {
  for (const effort of ["none", "low", "medium", "high", "xhigh", "max"]) {
    assert.equal(modelReasoning("gpt-6-sol", effort), effort);
    assert.equal(select("gpt-6-sol", effort).reasoning, effort);
  }
  for (const bad of [null, "minimal", "ultra", "HIGH", "", "SYNTHETIC_PRIVATE"]) {
    assert.throws(() => modelReasoning("gpt-6-sol", bad ?? undefined), { code: "configuration" });
    assert.throws(() => select("gpt-6-sol", bad), { code: "configuration" });
  }
  assert.throws(() => modelBudget("gpt-6-unknown"), { code: "configuration" });
  assert.throws(() => select("gpt-6-unknown", "high"), { code: "configuration" });
});

test("Astra and GPT-5.4 reasoning/defaults remain unchanged", () => {
  assert.equal(modelReasoning("gpt-6-astra"), "xhigh");
  assert.equal(modelReasoning("gpt-5.4"), "none");
  assert.equal(modelReasoning("gpt-5.4-mini"), "none");
  assert.equal(select("gpt-6-astra", null).reasoning, "xhigh");
  assert.equal(select("gpt-5.4", null).reasoning, "none");
  assert.throws(() => modelReasoning("gpt-6-astra", "none"), { code: "configuration" });
  assert.throws(() => modelReasoning("gpt-5.4", "max"), { code: "configuration" });
  const settings = providerSettings({ OPENAI_API_KEY: "SYNTHETIC" });
  assert.deepEqual(settings.globalDefault, {
    providerId: "openai", modelId: "gpt-6-astra", reasoning: "high",
  });
  assert.deepEqual(settings.models.find((model) => model.id === "gpt-6-sol").reasoning,
    ["none", "low", "medium", "high", "xhigh", "max"]);
});

test("returned Sol aliases are recognized, dated or undated, without accepting arbitrary names", async () => {
  const { source, input, plan } = runtimeFixture();
  for (const actual of ["gpt-6-sol", "gpt-6-sol-2026-09-24"]) {
    const attempts = [];
    const provider = openAiProvider({
      apiKey: "SYNTHETIC_ONLY",
      model: "gpt-6-sol",
      reasoning: "high",
      observer: (attempt) => attempts.push(attempt),
      fetcher: async (_url, init) => {
        const body = JSON.parse(init.body);
        assert.equal(body.model, "gpt-6-sol");
        assert.equal(body.reasoning.effort, "high");
        return response(plan, actual);
      },
    });
    const result = await provider.plan(source, input);
    assert.equal(result.usage.model, actual);
    assert.equal(attempts[0].actualModel, actual);
  }
  for (const bad of ["gpt-6-sol-other", "gpt-6-sol-2026-9-24", "gpt-6-sol\nSECRET", "unknown-model"]) {
    assert.equal(recognizedActualModel(bad), null);
  }
  assert.equal(recognizedActualModel("gpt-6-astra-2026-09-24"), "gpt-6-astra-2026-09-24");
  assert.equal(recognizedActualModel("gpt-5.4-2026-03-05"), "gpt-5.4-2026-03-05");
});

test("unsupported Sol effort fails before transport and cannot trigger model fallback", async () => {
  const { source, input } = runtimeFixture();
  let calls = 0;
  const provider = openAiProvider({
    apiKey: "SYNTHETIC_ONLY",
    model: "gpt-6-sol",
    reasoning: "ultra",
    fetcher: async () => { calls++; throw new Error("unexpected transport"); },
  });
  await assert.rejects(provider.plan(source, input), { code: "configuration" });
  assert.equal(calls, 0);
});
