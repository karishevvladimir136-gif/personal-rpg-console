import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";
import { buildContext, modelBudget } from "../src/lib/gameplay/dm-context.ts";
import { defaultDmStyle } from "../src/lib/campaign-settings.ts";

const model = "gpt-5.4-mini";
function version(key, kind, stages, marker) {
  return {
    id: randomUUID(), key, version: 1, kind, category: "synthetic",
    stages, triggers: ["promise"], provenance: "Synthetic owner review",
    en: { title: marker, guidance: `${marker} guidance only.`, avoid: `${marker} anti-pattern.` },
    ru: { title: marker, guidance: `${marker} руководство.`, avoid: `${marker} ошибка.` },
    createdAt: "2026-09-23T00:00:00Z",
  };
}
function withCraft() {
  const fixture = runtimeFixture();
  const { source, input } = fixture;
  source.craft = {
    policyVersion: "mega-dm-v1-literal-1",
    ownerId: source.ownerId, campaignId: input.campaignId,
    operationId: input.operationId, styleRevision: source.snapshot.settings.revision,
    style: { ...defaultDmStyle, tone: "warm" },
    doctrine: version("core-doctrine", "doctrine", ["plan", "narrate"], "CORE_MARKER"),
    plan: [version("promise-plan", "card", ["plan"], "PLAN_MARKER")],
    narrate: [version("scene-narrate", "card", ["narrate"], "NARRATE_MARKER")],
  };
  return fixture;
}

test("pinned Craft selects only the current stage and feedback keeps only structured Style", () => {
  const { source, input, resolution } = withCraft();
  const plan = buildContext(source, input, "plan", { model });
  assert.match(plan.input, /CORE_MARKER/);
  assert.match(plan.input, /PLAN_MARKER/);
  assert.doesNotMatch(plan.input, /NARRATE_MARKER/);
  assert.equal(JSON.parse(plan.input).dmCraft.style.tone, "warm");
  const narrate = buildContext(source, input, "narrate", { model, resolution });
  assert.match(narrate.input, /NARRATE_MARKER/);
  assert.doesNotMatch(narrate.input, /PLAN_MARKER/);
  assert.doesNotMatch(narrate.input, /SYNTHETIC_PRIVATE_CONTEXT_MARKER/);
  const feedback = buildContext(source, { ...input, mode: "feedback" }, "feedback", { model });
  assert.equal(JSON.parse(feedback.input).dmCraft.style.tone, "warm");
  assert.doesNotMatch(feedback.input, /CORE_MARKER|PLAN_MARKER|NARRATE_MARKER/);
});

test("Craft identity and selector-policy corruption fail closed", () => {
  for (const change of [
    { ownerId: randomUUID() },
    { campaignId: randomUUID() },
    { operationId: randomUUID() },
    { policyVersion: "unreviewed-selector" },
    { styleRevision: 0 },
  ]) {
    const { source, input } = withCraft();
    source.craft = { ...source.craft, ...change };
    assert.throws(() => buildContext(source, input, "plan", { model }), { code: "context" });
  }
});

test("mandatory evidence wins the context budget over optional Craft", () => {
  const { source, input } = withCraft();
  const noCraft = { ...source, craft: undefined };
  const baseline = buildContext(noCraft, input, "plan", { model });
  const budget = { ...modelBudget(model), inputCap: baseline.estimatedTokens + 20 };
  const selected = buildContext(source, input, "plan", { model, budget });
  assert.equal(selected.estimatedTokens <= budget.inputCap, true);
  assert.match(selected.input, /SYNTHETIC_PRIVATE_CONTEXT_MARKER/);
  assert.doesNotMatch(selected.input, /PLAN_MARKER/);
  assert.equal(JSON.parse(selected.input).mandatory.input, input.input);
});

test("a settings edit after begin cannot switch pinned Style in the same prompt", () => {
  const { source, input } = withCraft();
  source.snapshot.settings.revision += 1;
  source.snapshot.settings.values.dmStyle = { ...defaultDmStyle, tone: "cinematic" };
  const context = buildContext(source, input, "plan", { model });
  const parsed = JSON.parse(context.input);
  assert.equal(parsed.mandatory.settings.dmStyle.tone, "warm");
  assert.equal(parsed.dmCraft.style.tone, "warm");
  assert.equal(parsed.dmCraft.styleRevision, 1);
});
