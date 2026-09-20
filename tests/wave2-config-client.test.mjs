import test from "node:test";
import assert from "node:assert/strict";
import { id } from "./wave1-world-fixtures.mjs";
import {
  createProductionAttempt,
  effectiveSelection,
  loadProductionSettings,
  loadProviderSettings,
  ProductionClientError,
  productionDraft,
  productionScopeMatches,
  productionTasks,
  sameProductionDraft,
  saveProductionSettings,
  selectableRulesets,
  validateProductionSettings,
  validateProviderSettings,
} from "../src/lib/production-client.ts";
import { wave2ConfigText } from "../src/lib/locales/wave2-config.ts";

const model = (modelId = "gpt-6-astra", reasoning = "xhigh") => ({
  providerId: "openai",
  modelId,
  reasoning,
});
function providers() {
  return {
    schemaVersion: 1,
    providers: [
      { id: "openai", label: "OpenAI", status: "configured_not_tested" },
    ],
    models: [
      {
        providerId: "openai",
        id: "gpt-6-astra",
        label: "Astra",
        reasoning: ["low", "xhigh"],
      },
      {
        providerId: "openai",
        id: "gpt-5.4",
        label: "GPT 5.4",
        reasoning: ["none", "high"],
      },
    ],
    globalDefault: model(),
    globalDefaultStatus: "configured_not_tested",
  };
}
function settings() {
  return {
    campaignId: id("campaign"),
    timeline: { timelineId: id("timeline"), epoch: 3 },
    revision: 5,
    runtimeRevision: 22,
    headId: id("head"),
    worldPolicy: {
      simulation: false,
      autonomy: "moderate",
      deadlinePressure: "off",
    },
    ruleset: structuredClone(selectableRulesets[0]),
    runtimePolicy: null,
    pins: [],
    providers: providers(),
  };
}

test("only public configuration fields and supported exact profile refs cross the client boundary", () => {
  const input = settings();
  assert.deepEqual(validateProductionSettings(input, input.campaignId), input);
  assert.deepEqual(
    selectableRulesets.map((row) => row.id),
    ["console-basic-v1", "world-logic-v1"],
  );
  for (const change of [
    (row) => (row.privateState = { secret: "PRIVATE_MARKER" }),
    (row) => (row.ruleset.validatorVersion = "unreviewed"),
    (row) => (row.ruleset.id = "custom-rules"),
    (row) => (row.timeline.epoch = -1),
    (row) => (row.worldPolicy.simulation = "true"),
    (row) =>
      (row.runtimePolicy = {
        schemaVersion: 1,
        revision: 1,
        primary: null,
        taskOverrides: { "unknown.task": model() },
      }),
    (row) =>
      (row.runtimePolicy = {
        schemaVersion: 1,
        revision: 1,
        primary: { ...model(), apiKey: "SECRET" },
        taskOverrides: {},
      }),
    (row) =>
      (row.pins = [
        {
          bindingId: id("binding"),
          packId: id("pack"),
          packVersionId: id("version"),
          sourceVersionIds: [],
          privateText: "PRIVATE",
        },
      ]),
  ]) {
    const row = settings();
    change(row);
    assert.throws(
      () => validateProductionSettings(row, row.campaignId),
      (error) =>
        error instanceof ProductionClientError &&
        error.message === "unavailable",
    );
  }
  assert.throws(() => validateProductionSettings(input, id("other-campaign")));
});

test("provider DTO rejects credential fields, duplicates and invalid statuses without echoing values", () => {
  assert.deepEqual(validateProviderSettings(providers()), providers());
  for (const change of [
    (row) => (row.apiKey = "SECRET"),
    (row) => (row.providers[0].status = "tested"),
    (row) => row.providers.push(row.providers[0]),
    (row) => row.models.push(row.models[0]),
    (row) => (row.models[0].providerId = "unlisted"),
    (row) => row.models[0].reasoning.push("xhigh"),
    (row) => (row.globalDefault.secret = "SECRET"),
  ]) {
    const row = providers();
    change(row);
    assert.throws(
      () => validateProviderSettings(row),
      (error) => error.message === "unavailable",
    );
  }
});

test("all five tasks inherit campaign then global choices with no model substitution", () => {
  const row = settings();
  assert.equal(productionTasks.length, 5);
  assert.ok(productionTasks.includes("world.resolve"));
  for (const task of productionTasks) {
    assert.deepEqual(effectiveSelection(row, task), {
      selection: model(),
      inheritedFrom: "global",
      status: "configured_not_tested",
    });
  }
  row.runtimePolicy = {
    schemaVersion: 1,
    revision: 9,
    primary: model("gpt-5.4", "high"),
    taskOverrides: { "world.resolve": model() },
  };
  assert.equal(effectiveSelection(row, "world.resolve").inheritedFrom, "task");
  assert.equal(effectiveSelection(row, "dm.plan").inheritedFrom, "campaign");
  row.runtimePolicy.taskOverrides["dm.plan"] = model(
    "unavailable-model",
    "high",
  );
  const unavailable = effectiveSelection(row, "dm.plan");
  assert.equal(unavailable.status, "unavailable");
  assert.equal(unavailable.selection.modelId, "unavailable-model");
  assert.equal(unavailable.inheritedFrom, "task");
  row.runtimePolicy.taskOverrides["dm.narrate"] = model(
    "gpt-5.4",
    "unsupported-reasoning",
  );
  assert.equal(effectiveSelection(row, "dm.narrate").status, "unavailable");
});

test("provider availability and absent application default remain explicit", () => {
  const row = settings();
  row.providers.providers[0].status = "unavailable";
  assert.equal(effectiveSelection(row).status, "unavailable");
  assert.deepEqual(effectiveSelection(row).selection, model());
  row.providers.globalDefault = null;
  assert.equal(effectiveSelection(row).selection, null);
  assert.equal(effectiveSelection(row).status, "unavailable");
});

test("uncertain retry preserves exact request identity, fence, profiles and independent world policy", () => {
  const baseline = settings(),
    draft = productionDraft(baseline);
  draft.worldPolicy = {
    simulation: true,
    autonomy: "high",
    deadlinePressure: "off",
  };
  draft.ruleset = structuredClone(selectableRulesets[1]);
  draft.runtimePolicy = {
    schemaVersion: 1,
    revision: 0,
    primary: null,
    taskOverrides: { "world.resolve": model() },
  };
  let created = 0;
  const attempt = createProductionAttempt(null, baseline, draft, () => {
    created++;
    return id("request");
  });
  assert.equal(attempt.operationId, id("request"));
  assert.equal(attempt.runtimePolicy.revision, 1);
  assert.deepEqual(attempt.worldPolicy, draft.worldPolicy);
  assert.deepEqual(attempt.timeline, baseline.timeline);
  assert.equal(attempt.expectedHeadId, baseline.headId);
  assert.equal(attempt.expectedRuntimeRevision, 22);
  assert.equal(attempt.expectedRevision, 5);
  const changedDraft = productionDraft(baseline);
  const later = {
    ...baseline,
    timeline: { timelineId: id("sibling"), epoch: 4 },
    revision: 6,
  };
  const retry = createProductionAttempt(attempt, later, changedDraft, () => {
    created++;
    return id("wrong-new-request");
  });
  assert.deepEqual(retry, attempt);
  assert.equal(created, 1);
  retry.worldPolicy.autonomy = "low";
  assert.equal(attempt.worldPolicy.autonomy, "high");
  assert.equal(baseline.worldPolicy.simulation, false);
  assert.equal(draft.runtimePolicy.revision, 0);
});

test("policy revision advances from saved policy while resetting to inheritance sends null", () => {
  const row = settings();
  row.runtimePolicy = {
    schemaVersion: 1,
    revision: 8,
    primary: model(),
    taskOverrides: {},
  };
  const draft = productionDraft(row);
  assert.equal(
    createProductionAttempt(null, row, draft).runtimePolicy.revision,
    9,
  );
  draft.runtimePolicy = null;
  assert.equal(createProductionAttempt(null, row, draft).runtimePolicy, null);
});

test("draft comparisons respect explicit inheritance and every world axis", () => {
  const row = settings(),
    before = productionDraft(row),
    next = productionDraft(row);
  assert.equal(sameProductionDraft(before, next), true);
  next.worldPolicy.deadlinePressure = "critical_only";
  assert.equal(sameProductionDraft(before, next), false);
  next.worldPolicy.deadlinePressure = "off";
  next.runtimePolicy = {
    schemaVersion: 1,
    revision: 0,
    primary: model(),
    taskOverrides: {},
  };
  assert.equal(sameProductionDraft(before, next), false);
  assert.equal(productionScopeMatches(row, row.campaignId, row.timeline), true);
  assert.equal(
    productionScopeMatches(row, id("other-campaign"), row.timeline),
    false,
  );
  assert.equal(
    productionScopeMatches(row, row.campaignId, { ...row.timeline, epoch: 4 }),
    false,
  );
  assert.equal(
    productionScopeMatches(row, row.campaignId, {
      ...row.timeline,
      timelineId: id("sibling"),
    }),
    false,
  );
  assert.equal(productionScopeMatches(row, row.campaignId, undefined), false);
});

test("client uses only same-origin configuration routes; reads never invoke a provider or mutate", async (t) => {
  const calls = [];
  const row = settings();
  t.mock.method(globalThis, "fetch", async (url, init) => {
    calls.push({ url, init });
    return new Response(
      JSON.stringify(url === "/api/settings/ai" ? providers() : row),
      { status: 200 },
    );
  });
  await loadProviderSettings();
  await loadProductionSettings(row.campaignId);
  const input = createProductionAttempt(null, row, productionDraft(row));
  await saveProductionSettings(row.campaignId, input);
  assert.deepEqual(
    calls.map((row) => row.init.method),
    ["GET", "GET", "POST"],
  );
  assert.equal(calls[0].url, "/api/settings/ai");
  assert.equal(calls[1].url, `/api/campaigns/${row.campaignId}/production`);
  assert.deepEqual(JSON.parse(calls[2].init.body), input);
  assert.equal(calls[0].init.body, undefined);
  for (const { init } of calls) {
    assert.equal(init.credentials, "same-origin");
    assert.equal(init.cache, "no-store");
  }
});

test("uncertain HTTP response can be retried with the same body; cross-timeline success is rejected", async (t) => {
  const row = settings(),
    input = createProductionAttempt(null, row, productionDraft(row));
  const bodies = [];
  let mode = "lost";
  t.mock.method(globalThis, "fetch", async (_url, init) => {
    bodies.push(init.body);
    if (mode === "lost") throw new Error("SECRET network details");
    if (mode === "sibling")
      return new Response(
        JSON.stringify({
          ...row,
          timeline: { timelineId: id("sibling"), epoch: 4 },
        }),
      );
    return new Response(JSON.stringify(row));
  });
  await assert.rejects(
    saveProductionSettings(row.campaignId, input),
    (error) => error.message === "unavailable",
  );
  mode = "saved";
  await saveProductionSettings(
    row.campaignId,
    createProductionAttempt(input, row, productionDraft(row)),
  );
  assert.equal(bodies[0], bodies[1]);
  mode = "sibling";
  await assert.rejects(
    saveProductionSettings(row.campaignId, input),
    (error) => error.code === "conflict",
  );
});

test("server private error messages are never passed to UI", async (t) => {
  const row = settings();
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(
        JSON.stringify({
          error: { code: "conflict", message: "PRIVATE_REASON" },
        }),
        { status: 409 },
      ),
  );
  await assert.rejects(
    loadProductionSettings(row.campaignId),
    (error) => error.code === "conflict" && error.message === "conflict",
  );
});

test("English and Russian cover every configuration UI string", () => {
  const en = wave2ConfigText("en"),
    ru = wave2ConfigText("ru");
  assert.deepEqual(Object.keys(ru).sort(), Object.keys(en).sort());
  for (const value of Object.values(ru))
    assert.ok(typeof value === "string" && value.length > 0);
  assert.match(ru.conflict, /незавершённое действие/);
  assert.match(ru.uncertain, /Точный запрос сохранён/);
});
