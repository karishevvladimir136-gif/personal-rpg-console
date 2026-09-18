// Opt-in bounded synthetic model evaluation. No database writes or real lore.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import { runtimeFixture } from "../tests/phase2-runtime-fixtures.mjs";
import { continuationScenarios } from "../tests/phase3-continuation-fixtures.mjs";
import { buildContext } from "../src/lib/gameplay/dm-context.ts";
import { buildSummaryContext } from "../src/lib/memory/summary.ts";

const hooks = registerHooks({
  resolve(specifier, context, next) {
    return specifier === "server-only"
      ? { url: "data:text/javascript,export {}", shortCircuit: true }
      : next(specifier, context);
  },
});
const { openAiProvider } = await import("../src/lib/server/dm/provider.ts");
const { openAiSummaryProvider } =
  await import("../src/lib/server/memory/provider.ts");
hooks.deregister();
const model = "gpt-6-astra";
const reportPath = "test-results/phase3-model-evaluation.json";
function fixture(c) {
  let { source, input, resolution } = runtimeFixture();
  const old = source.snapshot.campaign.id;
  source = JSON.parse(JSON.stringify(source).replaceAll(old, c.campaignId));
  input = {
    ...input,
    campaignId: c.campaignId,
    mode: c.mode,
    input: c.playerInput,
    companionId: c.mode === "companion" ? "nera" : null,
  };
  const row = source.snapshot.entities[0];
  Object.assign(row, {
    id: "hero",
    name: "Synthetic player",
    hp: 7,
    max_hp: 12,
    resources: { focus: 1 },
  });
  source.snapshot.entities.push({
    ...row,
    id: "nera",
    name: "Nera",
    kind: "companion",
  });
  source.snapshot.campaign.language = c.language;
  source.snapshot.settings.values.language = c.language;
  source.snapshot.publicState.summary =
    "Resume from the authorized sources and exact current records. No new outcome has committed.";
  source.snapshot.documents[0].body =
    c.effectiveGuidance ??
    "Respect player agency. Concise literary narration; no invented established facts.";
  source.runtime.configuration.controlledEntityIds = ["hero"];
  source.runtime.configuration.presentEntityIds = ["hero", "nera"];
  source.runtime.worldMinutes = 1420;
  source.runtime.model = model;
  source.snapshot.items = [
    "water",
    "tonic",
    "binding",
    "knife",
    "stick",
    "spear",
  ].map((name) => ({
    campaign_id: c.campaignId,
    id: name,
    name,
    category: "gear",
    quantity: name === "spear" ? 1 : 0,
    description:
      name === "knife" || name === "stick"
        ? "Embedded in the spear; unavailable separately."
        : "Synthetic exact inventory.",
    mechanics: "",
    owner_entity_id: "hero",
    storage_id: null,
    equipped_entity_id: null,
    equipped_slot: null,
    revision: 1,
    updated_at: row.updated_at,
  }));
  // This is the model-quality layer: supplied authorized source evidence is fixed.
  // Production retrieval/negative filters are measured separately in SQL tests.
  source.memory = {
    campaignId: c.campaignId,
    generation: 1,
    stateRevision: 1,
    checkpoint: null,
    exactEvents: [],
    historical: c.authorizedSources,
    privateHistorical: [],
    publicSummary: null,
    privateSummary: null,
    complete: true,
  };
  if (c.checkpointStatus === "rebuild_required")
    source.memory.checkpoint = { valid: false, campaignId: c.campaignId };
  resolution = {
    ...resolution,
    worldMinutes: 1420,
    configuration: source.runtime.configuration,
    outcomes: [],
  };
  return { source, input, resolution };
}
function summaryJob(c) {
  return {
    id: crypto.randomUUID(),
    campaignId: c.campaignId,
    boundaryId: null,
    visibility: "public",
    generation: 1,
    token: crypto.randomUUID(),
    attempts: 1,
    stateRevision: 1,
    settingsRevision: 1,
    guideVersionId: crypto.randomUUID(),
    fromSequence: 0,
    throughSequence: 10000,
    sources: c.authorizedSources,
    requiredSourceIds: c.authorizedSources.map((s) => s.id),
  };
}
const cases = [
  ...continuationScenarios.map((c) => ({ c, stage: "narrate" })),
  ...continuationScenarios
    .filter((c) =>
      [
        "rumor-attribution",
        "intention-not-completion",
        "negation-retained",
        "conditional-claim",
      ].includes(c.id),
    )
    .map((c) => ({ c, stage: "summary" })),
  {
    c: {
      ...continuationScenarios.find((c) => c.id === "russian-recall"),
      id: "russian-recall-configured",
    },
    stage: "narrate",
  },
];
const command = process.argv[2] ?? "prepare";
assert.ok(["prepare", "run", "report"].includes(command));
if (command === "prepare") {
  let paused = 0;
  for (const { c, stage } of cases) {
    if (stage === "summary") buildSummaryContext(summaryJob(c), model);
    else {
      const f = fixture(c);
      try {
        const built = buildContext(f.source, f.input, "narrate", {
          model,
          resolution: f.resolution,
          checks: [],
        });
        assert.equal(
          JSON.parse(built.input).mandatory.campaign.language,
          c.language,
        );
      } catch (e) {
        assert.ok(c.expected.mayPause && e.code === "context");
        paused++;
      }
    }
  }
  console.log(
    JSON.stringify({
      prepared: cases.length,
      safePauseCases: paused,
      liveCalls: 0,
    }),
  );
} else {
  assert.equal(
    process.env.RPG_ALLOW_LIVE_MEMORY_TESTS,
    "BOUNDED_SYNTHETIC_PHASE3",
  );
  assert.equal(process.env.OPENAI_DM_MODEL, model);
  assert.equal(process.env.OPENAI_DM_REASONING, "xhigh");
  let report;
  try {
    report = JSON.parse(await readFile(reportPath, "utf8"));
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    report = {
      model,
      reasoning: "xhigh",
      startedAt: new Date().toISOString(),
      reservedRequests: 0,
      attempts: [],
      results: [],
    };
  }
  const save = () => writeFile(reportPath, JSON.stringify(report, null, 2));
  const cost = () =>
    report.attempts.reduce(
      (n, a) =>
        n +
        ((a.inputTokens ?? 0) * 10) / 1e6 +
        ((a.outputTokens ?? 0) * 50) / 1e6,
      0,
    );
  if (command === "run") {
    const batch = Number(process.argv[3] ?? 1);
    assert.ok(Number.isInteger(batch) && batch >= 1 && batch <= 4);
    const options = {
      apiKey: process.env.OPENAI_API_KEY,
      model,
      reasoning: "xhigh",
      observer: (a) => report.attempts.push(a),
    };
    const provider = openAiProvider(options),
      summaries = openAiSummaryProvider(options);
    const remaining = cases
      .filter(
        ({ c, stage }) =>
          !report.results.some((r) => r.id === c.id && r.stage === stage),
      )
      .slice(0, batch);
    for (const { c, stage } of remaining) {
      const result = {
        id: c.id,
        stage,
        expected: c.expected,
        status: "started",
        rubricReview: "pending",
      };
      report.results.push(result);
      if (c.checkpointStatus === "rebuild_required") {
        const f = fixture(c);
        assert.throws(
          () =>
            buildContext(f.source, f.input, "narrate", {
              model,
              resolution: f.resolution,
              checks: [],
            }),
          (e) => e.code === "context",
        );
        Object.assign(result, {
          status: "safe_pause",
          rubricReview: "pass: invalid checkpoint blocks generation",
        });
        await save();
        console.log(`${c.id}: safe pause, no call`);
        continue;
      }
      assert.ok(
        report.reservedRequests < 36 && cost() + 0.5 < 15,
        "Bounded evaluation limit reached",
      );
      report.reservedRequests++;
      await save();
      try {
        const f = fixture(c);
        const response =
          stage === "summary"
            ? await summaries.summarize(summaryJob(c))
            : await provider.narrate(f.source, f.input, f.resolution, []);
        const text = JSON.stringify(response.output);
        assert.ok(
          !/SYNTHETIC_(?:DM_PRIVATE|PLAYER_ONLY|OTHER_CONVERSATION|OTHER_CAMPAIGN)/.test(
            text,
          ),
          "Synthetic disclosure",
        );
        Object.assign(result, {
          status: "generated",
          output: response.output,
          usage: response.usage,
        });
      } catch (e) {
        Object.assign(result, {
          status: "failed",
          failure: e.code ?? "validation",
        });
        await save();
        throw Error(`Evaluation stopped: ${c.id} (${result.failure})`);
      }
      await save();
      console.log(`${c.id} / ${stage}: generated; rubric review pending`);
    }
  }
  console.log(
    JSON.stringify({
      cases: report.results.length,
      requests: report.reservedRequests,
      successful: report.attempts.filter((a) => a.success).length,
      estimatedUsd: cost(),
      pendingReview: report.results.filter((r) => r.rubricReview === "pending")
        .length,
    }),
  );
}
