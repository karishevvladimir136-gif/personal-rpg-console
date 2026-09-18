import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import {
  buildSummaryContext,
  parseSummary,
  summaryEntries,
  summarySchemaFor,
} from "../src/lib/memory/summary.ts";
import { processMemoryJobs } from "../src/lib/memory/jobs.ts";
import { validateMemoryRequest } from "../src/lib/memory/request-validation.ts";
import { projectMemory } from "../src/lib/memory/projection.ts";
import { buildContext } from "../src/lib/gameplay/dm-context.ts";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";

function fixture(visibility = "public") {
  const campaignId = randomUUID();
  const row = {
    id: randomUUID(),
    campaignId,
    ref: {
      campaignId,
      kind: "scene",
      id: randomUUID(),
      version: "1",
      part: 0,
      visibility,
    },
    sequence: 1,
    sessionId: randomUUID(),
    text: 'Mira says: "I intend to return tomorrow, unless the bridge is closed." Nobody has returned yet.',
    entityIds: [],
    knownBy: [],
    authority: "history",
    statementKind: "intention",
    attribution: "Mira",
    validFrom: 0,
    validTo: null,
    significance: 5,
    unresolved: true,
    current: true,
    status: "valid",
    factKey: null,
    factValue: null,
    sourceRefs: [],
  };
  const job = {
    id: randomUUID(),
    campaignId,
    boundaryId: randomUUID(),
    visibility,
    generation: 1,
    token: randomUUID(),
    attempts: 1,
    stateRevision: 3,
    settingsRevision: 1,
    guideVersionId: randomUUID(),
    fromSequence: 0,
    throughSequence: 1,
    sources: [row],
    requiredSourceIds: [row.id],
  };
  return {
    row,
    job,
    output: {
      schemaVersion: 1,
      selections: [{ sourceId: row.id, version: "1" }],
    },
  };
}
test("extractive summaries preserve full attribution, negation, condition and intention", () => {
  const { row, job, output } = fixture();
  assert.equal(summarySchemaFor(job).properties.selections.minItems, 1);
  assert.deepEqual(
    summarySchemaFor(job).properties.selections.items.properties.sourceId.enum,
    [row.id],
  );
  assert.deepEqual(summaryEntries(output, job), [row]);
  for (const bad of [
    { ...output, narration: "Mira returned." },
    {
      ...output,
      selections: [{ sourceId: row.id, version: "1", text: "Mira returned." }],
    },
    { ...output, selections: [] },
    { ...output, selections: [{ sourceId: row.id, version: "old" }] },
    { ...output, selections: [...output.selections, ...output.selections] },
    { ...output, publicPatches: [{ kind: "heal", amount: 99 }] },
  ])
    assert.throws(() => parseSummary(bad, job), { code: "validation" });
});
test("summary sources validate campaign, visibility, range, revision and current validity", () => {
  const { job, output } = fixture();
  for (const change of [
    { campaignId: randomUUID() },
    { ref: { ...job.sources[0].ref, visibility: "private" } },
    { current: false },
    { status: "superseded" },
    { sequence: 99 },
    { sourceRefs: [{ ...job.sources[0].ref, campaignId: randomUUID() }] },
  ])
    assert.throws(
      () =>
        parseSummary(output, {
          ...job,
          sources: [{ ...job.sources[0], ...change }],
        }),
      { code: "validation" },
    );
  assert.throws(() => parseSummary(output, { ...job, stateRevision: -1 }), {
    code: "validation",
  });
});
test("failed generation retains previous coverage; explicit later retry uses same source identity", async () => {
  const { job, output } = fixture();
  let published = 0,
    coverage = 0,
    failed = 0,
    claimed = 0;
  const store = {
    claim: async () => (++claimed === 1 ? job : null),
    publish: async (actual, value) => {
      assert.equal(actual.id, job.id);
      parseSummary(value, actual);
      published++;
      coverage = actual.throughSequence;
    },
    fail: async () => failed++,
  };
  const bad = {
    summarize: async () => {
      throw new Error("PRIVATE PROVIDER PAYLOAD");
    },
  };
  assert.deepEqual(await processMemoryJobs(job.campaignId, store, bad), {
    processed: 0,
    failed: true,
  });
  assert.equal(published, 0);
  assert.equal(coverage, 0);
  assert.equal(failed, 1);
  claimed = 0;
  assert.deepEqual(
    await processMemoryJobs(job.campaignId, store, {
      summarize: async () => ({ output, usage: {} }),
    }),
    { processed: 1, failed: false },
  );
  assert.equal(coverage, 1);
});
test("one request cannot run an unbounded summary loop or pay for empty private history", async () => {
  const { job } = fixture("private");
  let publishes = 0,
    paid = 0;
  const store = {
    claim: async () => ({ ...job, sources: [], requiredSourceIds: [] }),
    publish: async () => publishes++,
    fail: async () => assert.fail(),
  };
  await processMemoryJobs(
    job.campaignId,
    store,
    {
      summarize: async () => {
        paid++;
        throw Error();
      },
    },
    9999,
  );
  assert.equal(publishes, 4);
  assert.equal(paid, 0);
});
test("public memory projection excludes private paths and unknown companion knowledge", () => {
  const { source, input } = runtimeFixture();
  const { row } = fixture();
  const publicRow = {
    ...row,
    campaignId: input.campaignId,
    ref: { ...row.ref, campaignId: input.campaignId },
    knownBy: [],
  };
  const privateRow = {
    ...publicRow,
    id: randomUUID(),
    ref: { ...publicRow.ref, visibility: "private" },
    text: "SYNTHETIC_PRIVATE_MEMORY_CANARY",
  };
  source.memory = {
    campaignId: input.campaignId,
    generation: 1,
    stateRevision: source.runtime.revision,
    checkpoint: null,
    exactEvents: [publicRow, privateRow],
    historical: [publicRow],
    privateHistorical: [privateRow],
    publicSummary: null,
    privateSummary: null,
    complete: true,
  };
  assert.ok(
    JSON.stringify(projectMemory(source, input, "plan")).includes(
      privateRow.text,
    ),
  );
  assert.ok(
    !JSON.stringify(projectMemory(source, input, "narrate")).includes(
      privateRow.text,
    ),
  );
  const companion = {
    ...input,
    mode: "companion",
    companionId: randomUUID(),
    listenerIds: [],
  };
  const projected = projectMemory(source, companion, "plan");
  assert.deepEqual(projected.history, []);
  assert.deepEqual(projected.exactEvents, []);
  assert.ok(!JSON.stringify(projected).includes(privateRow.text));
  source.memory.historical = [privateRow];
  assert.throws(() => projectMemory(source, input, "narrate"), {
    code: "context",
  });
});
test("validated memory admits bounded recent exchanges without dropping exact uncovered evidence", () => {
  const { source, input } = runtimeFixture();
  const template = {
    ...source.runtime.turns[0],
    id: randomUUID(),
    campaign_id: input.campaignId,
    status: "committed",
    mode: "game",
    input: "A synthetic passing cloud.",
    narration: "The cloud passes.",
    listenerIds: [],
  };
  source.runtime.turns = Array.from({ length: 1000 }, (_, i) => ({
    ...template,
    id: randomUUID(),
    input: `Cloud ${i}.`,
  }));
  assert.throws(
    () => buildContext(source, input, "plan", { model: "gpt-6-astra" }),
    { code: "context" },
  );
  const { row } = fixture();
  const evidence = {
    ...row,
    campaignId: input.campaignId,
    ref: { ...row.ref, campaignId: input.campaignId },
  };
  source.memory = {
    campaignId: input.campaignId,
    generation: 1,
    stateRevision: source.runtime.revision,
    checkpoint: null,
    exactEvents: [evidence],
    historical: [],
    privateHistorical: [],
    publicSummary: null,
    privateSummary: null,
    complete: true,
  };
  const built = buildContext(source, input, "plan", { model: "gpt-6-astra" });
  const parsed = JSON.parse(built.input);
  assert.equal(parsed.exchanges.length, 8);
  assert.equal(parsed.memory.exactEvents[0].text, evidence.text);
  assert.ok(built.estimatedTokens <= built.budget.inputCap);
  source.memory.exactEvents[0].text =
    "Never drop this required evidence. ".repeat(4000);
  assert.throws(
    () => buildContext(source, input, "plan", { model: "gpt-6-astra" }),
    { code: "context" },
  );
});
test("memory commands reject cross-campaign IDs, extra fields and forged state", () => {
  const campaignId = randomUUID();
  const end = {
    requestId: randomUUID(),
    campaignId,
    expectedRevision: 2,
    sessionId: randomUUID(),
  };
  assert.deepEqual(validateMemoryRequest(end, campaignId, "end"), end);
  for (const bad of [
    { ...end, campaignId: randomUUID() },
    { ...end, privateCheckpoint: {} },
    { ...end, expectedRevision: 0 },
  ])
    assert.throws(() => validateMemoryRequest(bad, campaignId, "end"), {
      code: "validation",
    });
});
test("summary Responses requests reuse Astra/xhigh strict output without public/private draft mixing", async () => {
  const hook = registerHooks({
    resolve(specifier, context, next) {
      return specifier === "server-only"
        ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
        : next(specifier, context);
    },
  });
  const { openAiSummaryProvider } =
    await import("../src/lib/server/memory/provider.ts");
  hook.deregister();
  const { job, output } = fixture();
  const observed = [];
  let requests = 0;
  const provider = openAiSummaryProvider({
    apiKey: "SYNTHETIC_TEST_ONLY",
    model: "gpt-6-astra",
    reasoning: "xhigh",
    observer: (row) => observed.push(row),
    fetcher: async (_url, options) => {
      requests++;
      const body = JSON.parse(options.body);
      assert.deepEqual(body.reasoning, { effort: "xhigh" });
      assert.equal(body.store, false);
      assert.equal(body.truncation, "disabled");
      assert.equal(body.text.format.strict, true);
      assert.equal(body.text.format.name, "dm_summary");
      assert.ok(!body.input.includes("SYNTHETIC_PRIVATE_MEMORY_CANARY"));
      return new Response(
        JSON.stringify({
          model: "gpt-6-astra",
          status: "completed",
          output: [
            {
              type: "message",
              role: "assistant",
              status: "completed",
              content: [{ type: "output_text", text: JSON.stringify(output) }],
            },
          ],
          usage: { input_tokens: 50, output_tokens: 20 },
        }),
      );
    },
  });
  assert.deepEqual((await provider.summarize(job)).output, output);
  assert.equal(requests, 1);
  assert.ok(!JSON.stringify(observed).includes(job.sources[0].text));
  assert.throws(
    () =>
      buildSummaryContext(
        {
          ...job,
          sources: [
            {
              ...job.sources[0],
              ref: { ...job.sources[0].ref, visibility: "private" },
            },
          ],
        },
        "gpt-6-astra",
      ),
    { code: "validation" },
  );
});
