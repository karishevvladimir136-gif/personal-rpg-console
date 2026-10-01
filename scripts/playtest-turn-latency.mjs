// Explicit, one-shot owner-authorized resolver benchmark. Never called by tests or gameplay.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import { fixture as logicFixture, id } from "../tests/wave3-logic-fixtures.mjs";
import { fixture as foundationFixture } from "../tests/wave4-actions-fixtures.mjs";
import { foundationActionContext } from "../src/lib/foundation-actions/index.ts";
import {
  mundanePublicDetailMarker,
  resolveWorldLogic,
  worldLogicContext,
} from "../src/lib/rulesets/world-logic.ts";

const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    return specifier === "server-only"
      ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
      : nextResolve(specifier, context);
  },
});
const { createWorldResolverProvider } = await import(
  "../src/lib/server/world/resolver-provider.ts"
);
hook.deregister();

function ordinaryInput(caseId, words) {
  const input = logicFixture();
  const operationId = id(`latency-${caseId}`);
  input.command.operationId = operationId;
  input.input.operationId = operationId;
  input.input.input = words;
  input.source.snapshot.locations = input.source.snapshot.locations.filter(
    (row) => [id("location"), id("destination")].includes(row.id),
  );
  const current = input.source.snapshot.locations.find(
    (row) => row.id === id("location"),
  );
  current.name = "Safe clearing";
  current.description = "An open clearing with a bronze gate. The guide is nearby.";
  const rose = input.source.snapshot.locations.find(
    (row) => row.id === id("destination"),
  );
  rose.name = "The Rose House";
  rose.description = "An ordinary public house near the clearing.";
  rose.status = "known";
  input.localRoutes = [{ actorId: id("player"), destinationId: rose.id }];
  return input;
}

function quoteInput() {
  const foundation = foundationFixture("quote", "world_logic");
  const input = logicFixture();
  input.snapshot = structuredClone(foundation.context.foundation);
  input.source.snapshot = structuredClone(foundation.context.snapshot);
  input.command = structuredClone(foundation.command);
  input.source.runtime.timeline = structuredClone(foundation.command.timeline);
  input.source.foundationOptions = foundationActionContext(
    foundation.context,
    id("player"),
  );
  input.input.operationId = foundation.command.operationId;
  input.input.campaignId = foundation.command.campaignId;
  input.input.timeline = structuredClone(foundation.command.timeline);
  input.input.expectedRevision = foundation.command.expectedRuntimeRevision;
  input.input.input = foundation.proposal.input;
  return input;
}

const cases = [
  {
    id: "public-description",
    input: ordinaryInput("public-description", "What does this clearing look like?"),
    check(input, output, result) {
      return (
        output.schemaVersion === 2 &&
        output.publicText ===
          mundanePublicDetailMarker("location", id("location"), "direct") &&
        result.status === "staged" &&
        result.mundaneDetail?.epistemic === "direct" &&
        noChanges(output, result)
      );
    },
  },
  {
    id: "attributed-rumor",
    input: ordinaryInput("attributed-rumor", "Any rumors about The Rose House?"),
    check(input, output, result) {
      return (
        output.schemaVersion === 2 &&
        output.publicText ===
          mundanePublicDetailMarker("location", id("destination"), "reported") &&
        result.status === "staged" &&
        result.mundaneDetail?.epistemic === "reported" &&
        noChanges(output, result)
      );
    },
  },
  {
    id: "location-establish",
    input: ordinaryInput(
      "location-establish",
      "Where is an ordinary blacksmith near this clearing?",
    ),
    check(input, output, result) {
      return (
        output.schemaVersion === 3 &&
        output.kind === "location.establish" &&
        output.category === "blacksmith" &&
        output.anchorLocationId === id("location") &&
        output.destinationId === null &&
        output.name !== null &&
        result.status === "mundane" &&
        result.resolution.changes.length === 1 &&
        result.resolution.changes[0].family === "locations"
      );
    },
  },
  {
    id: "local-movement",
    input: ordinaryInput("local-movement", "I walk to The Rose House."),
    check(input, output, result) {
      return (
        output.schemaVersion === 2 &&
        output.action === "move" &&
        output.destinationId === id("destination") &&
        output.elapsedMinutes > 0 &&
        output.capabilityRefs.every((ref) => ref === "walking") &&
        output.consequences.length === 0 &&
        result.status === "staged" &&
        result.resolution.changes.length === 2 &&
        result.resolution.changes.some(
          (row) =>
            row.family === "public_state" &&
            row.values.current_location_id === id("destination"),
        )
      );
    },
  },
  {
    id: "hidden-truth",
    input: ordinaryInput("hidden-truth", "Who secretly murdered the magistrate?"),
    check(input, output, result) {
      return (
        output.schemaVersion === 2 &&
        output.uncertainty !== "resolved" &&
        result.status === "paused" &&
        !/\b(?:the guide|the mayor|the innkeeper)\s+(?:did it|murdered)\b/i.test(
          output.publicText,
        ) &&
        pausedWithoutEffects(output)
      );
    },
  },
  {
    id: "unusual-harmless",
    input: ordinaryInput(
      "unusual-harmless",
      "I mime a dragon with my hands for the nearby guide.",
    ),
    check(input, output, result) {
      return (
        output.schemaVersion === 2 &&
        ["speak", "attempt"].includes(output.action) &&
        result.status === "staged" &&
        output.outcome === "completed" &&
        output.uncertainty === "resolved" &&
        output.elapsedMinutes <= 1 &&
        output.destinationId === null &&
        output.consequences.length === 0 &&
        result.resolution.changes.length === 0 &&
        !/\b(?:I decide|I promise|I agree|I buy|I take)\b/i.test(
          output.publicText,
        )
      );
    },
  },
  {
    id: "foundation-quote",
    input: quoteInput(),
    check(input, output, result) {
      return (
        output.schemaVersion === 2 &&
        output.foundationAction?.action === "quote" &&
        output.foundationAction?.input === input.input.input &&
        result.status === "staged" &&
        noChanges(output, result)
      );
    },
  },
  {
    id: "missing-evidence",
    input: ordinaryInput(
      "missing-evidence",
      "I open the locked chest with the key I supposedly found earlier.",
    ),
    check(input, output, result) {
      return (
        output.schemaVersion === 2 &&
        output.uncertainty !== "resolved" &&
        result.status === "paused" &&
        pausedWithoutEffects(output)
      );
    },
  },
];

function noChanges(output, result) {
  return (
    output.outcome === "completed" &&
    output.uncertainty === "resolved" &&
    output.elapsedMinutes === 0 &&
    output.destinationId === null &&
    output.capabilityRefs.length === 0 &&
    output.consequences.length === 0 &&
    result.resolution.changes.length === 0
  );
}

function pausedWithoutEffects(output) {
  return (
    output.elapsedMinutes === 0 &&
    output.destinationId === null &&
    output.consequences.length === 0
  );
}

for (const item of cases) {
  const context = worldLogicContext(item.input);
  assert.equal(context.actors[0].id, id("player"));
  assert.ok(context.circumstances.length);
  if (item.id === "attributed-rumor")
    assert.ok(
      context.publicDetailTargets.some(
        (target) => target.id === id("destination"),
      ),
    );
  if (item.id === "local-movement")
    assert.ok(
      context.travelOptions.some(
        (route) =>
          route.destinationId === id("destination") && route.capability === null,
      ),
    );
  if (item.id === "foundation-quote") assert.ok(item.input.source.foundationOptions);
}

const frozen = cases.map((item) => ({
  id: item.id,
  inputHash: createHash("sha256").update(JSON.stringify(item.input)).digest("hex"),
}));
const recheckIndex = process.argv.indexOf("--recheck");
if (recheckIndex >= 0) {
  const path = process.argv[recheckIndex + 1];
  assert.ok(path);
  const report = JSON.parse(await readFile(path, "utf8"));
  assert.deepEqual(report.frozen, frozen);
  assert.equal(report.calls.length, 16);
  for (const row of report.calls) {
    const item = cases.find((entry) => entry.id === row.case);
    assert.ok(item);
    if (!row.proposal) {
      row.recheck = { passed: false, error: row.error };
      continue;
    }
    const { foundationAction: _foundationAction, ...action } = row.proposal;
    void _foundationAction;
    try {
      const result = resolveWorldLogic(item.input, action);
      row.recheck = {
        passed: item.check(item.input, row.proposal, result),
        status: result.status,
      };
    } catch (cause) {
      row.recheck = { passed: false, error: cause?.code ?? cause?.name };
    }
  }
  const output = path.replace(/\.json$/, "-rechecked.json");
  await writeFile(output, JSON.stringify(report, null, 2));
  process.stdout.write(
    JSON.stringify({
      output,
      passed: report.calls.filter((row) => row.recheck.passed).length,
      failed: report.calls.filter((row) => !row.recheck.passed).map((row) => ({
        case: row.case,
        reasoning: row.reasoning,
        recheck: row.recheck,
      })),
    }) + "\n",
  );
  process.exit(0);
}
if (!process.argv.includes("--live")) {
  process.stdout.write(JSON.stringify({ mode: "dry-run", frozen }, null, 2) + "\n");
  process.exit(0);
}
assert.equal(process.env.RPG_TURN_LATENCY_BENCHMARK, "approved-16-calls");
assert.ok(process.env.OPENAI_API_KEY);
const outputPath = new URL(
  `../test-results/turn-latency/benchmark-${new Date().toISOString().replaceAll(":", "-")}.json`,
  import.meta.url,
);
await mkdir(new URL("../test-results/turn-latency/", import.meta.url), {
  recursive: true,
});
const report = { base: "84179228a98e6ada0c4249801ebf7400f6014acf", frozen, calls: [] };
let networkCalls = 0;
for (const item of cases) {
  for (const reasoning of ["high", "medium"]) {
    const attempts = [];
    let requestHash = null;
    const provider = createWorldResolverProvider({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-6-astra",
      reasoning,
      observer: (attempt) => attempts.push(attempt),
      fetcher: async (url, init) => {
        assert.equal(url, "https://api.openai.com/v1/responses");
        assert.ok(networkCalls < 16);
        const body = JSON.parse(init.body);
        assert.equal(body.model, "gpt-6-astra");
        assert.equal(body.reasoning.effort, reasoning);
        assert.equal(body.text.format.name, "dm_plan");
        assert.equal(body.store, false);
        requestHash = createHash("sha256")
          .update(JSON.stringify({ ...body, reasoning: null }))
          .digest("hex");
        networkCalls++;
        return fetch(url, init);
      },
    });
    let output = null;
    let result = null;
    let usage = null;
    let error = null;
    let passed = false;
    try {
      const response = await provider.action(item.input);
      output = response.output;
      usage = response.usage;
      const { foundationAction: _foundationAction, ...action } = output;
      void _foundationAction;
      result = resolveWorldLogic(item.input, action);
      passed = item.check(item.input, output, result);
    } catch (cause) {
      error = cause?.code ?? cause?.name ?? "unknown";
    }
    report.calls.push({
      case: item.id,
      reasoning,
      requestHash,
      passed,
      error,
      attempt: attempts.at(-1) ?? null,
      usage,
      resultStatus: result?.status ?? null,
      resultReason: result?.reason ?? null,
      proposal: output,
    });
    await writeFile(outputPath, JSON.stringify(report, null, 2));
    process.stdout.write(
      `${item.id} ${reasoning}: ${passed ? "PASS" : "FAIL"} ` +
        `${attempts.at(-1)?.latencyMs ?? "n/a"}ms ` +
        `${usage?.inputTokens ?? "n/a"}/${usage?.outputTokens ?? "n/a"} tokens\n`,
    );
  }
}
assert.equal(networkCalls, 16);
assert.ok(
  cases.every((item) =>
    report.calls.filter((row) => row.case === item.id).every((row) => row.requestHash) &&
    new Set(report.calls.filter((row) => row.case === item.id).map((row) => row.requestHash)).size === 1,
  ),
  "Paired requests must differ only in reasoning effort",
);
process.stdout.write(`Network calls: ${networkCalls}\nResult: ${outputPath.pathname}\n`);
