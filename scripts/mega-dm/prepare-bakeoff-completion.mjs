// Offline preparation for the owner-authorized two-probe evaluation only.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { livingSmokeProductionInput, LIVING_SMOKE_VERSION, LIVING_SMOKE_FIXTURE_DIGEST }
  from "../../test-fixtures/mega-dm/living-smoke-completion-v5.mjs";
import { livingSmokeProductionInput as oldInput } from "../../test-fixtures/mega-dm/living-smoke-v1.mjs";
import { parsePlan } from "../../src/lib/gameplay/dm-schema.ts";
import { validatePlan } from "../../src/lib/gameplay/mechanics/resolve.ts";

globalThis.fetch = () => { throw new Error("Offline preparation cannot dispatch a request"); };
const previous = resolve("test-results/openai-dm-model-bakeoff-2026-09-27");
const output = resolve("test-results/openai-dm-model-bakeoff-completion-v5");
mkdirSync(output, { recursive: false });
const hash = (value) => createHash("sha256").update(value).digest("hex");
const save = (name, object) => writeFileSync(join(output, name), JSON.stringify(object, null, 2) + "\n", { flag: "wx" });
const files = Object.fromEntries(readdirSync(previous).map((name) => [name, hash(readFileSync(join(previous, name)))]));
save("previous-evidence-hashes.json", { folder: previous, files });
const previousRecord = JSON.parse(readFileSync(join(previous, "execution-record.json"), "utf8"));
assert.equal(previousRecord.networkAttempts, 9);
assert.equal(previousRecord.totalCalculatedChargeUSD, 1.0098322);
save("COMPLETED_REPAIR_OWNER_REVIEW.json", {
  scope: "One completed evidence point only; no overall model winner",
  inheritedFixtureVersion: "mega-dm-living-smoke-v4-structured-scene",
  inheritedFixtureDigest: previousRecord.fixtureDigest,
  probe: "Repair / History / Shared Joy", review: "Owner preferred X before reveal",
  revealedLabels: { X: "gpt-6-astra", Y: "gpt-6-sol" },
  ownerPreferenceForThisProbeOnly: "gpt-6-astra",
  priorRawOutputsAndBlindArtifactUnchanged: true,
});

const diagnostics = [];
for (const [number, probeId, model] of [[1, "identity-knowledge-refusal", "gpt-6-sol"],
  [2, "identity-knowledge-refusal", "gpt-6-astra"], [5, "cognitive-world-fingerprint", "gpt-6-sol"]]) {
  const file = `path-${number}-plan-original-output.json`;
  const original = JSON.parse(readFileSync(join(previous, file), "utf8"));
  const { source, input } = oldInput({ probeId, arm: "full" });
  validatePlan(source, input, parsePlan(original));
  const corrected = livingSmokeProductionInput({ probeId, arm: "full" });
  const identity = probeId === "identity-knowledge-refusal";
  diagnostics.push({ probeId, model, originalFile: file, originalSHA256: files[file],
    exactClarification: original.clarification, originalParserAndAuthorityValidator: "PASS",
    authorityCorrect: true,
    missingFact: identity ? "The recorded private disclosure to Talin does not establish whether a separate private conversation with Orin occurred. v4 contains no explicit communication-status fact through the current Workshop checkpoint."
      : "The new warning's proposed wording and intended position are absent. The request concerns potential traces, but the model reasonably asks for these details before narrating a concrete proposal.",
    minimumGrounding: JSON.parse(corrected.source.memory.exactEvents.at(-1).text),
    preservedUncertainty: identity ? "Orin still has no knowledge of the private lc18 disclosure's contents. No new character belief, relationship, capability or historical event was added."
      : "The warning remains proposed and unplaced. Material, durability, travelers noticing it, later records and broader social consequences remain unresolved; no action or guaranteed effect was pre-committed.",
  });
}
save("OFFLINE_CLARIFICATION_DIAGNOSIS.json", { providerCalls: 0, originalEvidencePreserved: true,
  fixtureVersion: LIVING_SMOKE_VERSION, fixtureDigest: LIVING_SMOKE_FIXTURE_DIGEST, paths: diagnostics });
const diagnosis = diagnostics.map((row) => `## ${row.probeId} / ${row.model}\n\nOriginal clarification: **${row.exactClarification}**\n\n${row.missingFact}\n\nAuthority-correct: yes. The minimum added grounding is a bounded current fact / intention record: \`${JSON.stringify(row.minimumGrounding)}\`.\n\n${row.preservedUncertainty}\n`).join("\n");
writeFileSync(join(output, "OFFLINE_CLARIFICATION_DIAGNOSIS.md"), "# Offline clarification diagnosis\n\nZero provider calls. All original outputs remain unchanged.\n\n" + diagnosis, { flag: "wx" });

let runner = readFileSync(join(previous, "run.mjs"), "utf8");
const replace = (from, to) => { assert.ok(runner.includes(from), `Expected runner anchor missing: ${from.slice(0, 80)}`); runner = runner.replace(from, to); };
replace('"../../test-fixtures/mega-dm/living-smoke-v1.mjs"', '"../../test-fixtures/mega-dm/living-smoke-completion-v5.mjs"');
replace('const FIXTURE_DIGEST = "84e5843f47f1ef99c368e30922ce01b3cc6a3af635ffb4693e8f542457a5d366";', `const FIXTURE_DIGEST = "${LIVING_SMOKE_FIXTURE_DIGEST}";`);
replace('const MAX_CALLS = 12, CAP = 10;', `const MAX_CALLS = 8, CAP = 10, HISTORICAL_CHARGE = ${previousRecord.totalCalculatedChargeUSD};`);
const frozenPaths = ["test-fixtures/mega-dm/living-smoke-completion-v5.mjs", "tests/mega-dm-bakeoff-completion.test.mjs", "scripts/mega-dm/prepare-bakeoff-completion.mjs"];
const frozenFiles = Object.fromEntries(frozenPaths.map((path) => [path, hash(readFileSync(path))]));
replace('assert.equal(git("status", "--porcelain"), "", "Tracked implementation and fixtures must be clean");',
  `assert.equal(git("diff", "--name-only", "HEAD"), "", "No tracked implementation or v4 changes");\n  const expectedStatus = ${JSON.stringify(frozenPaths.map((path) => `?? ${path}`).sort())};\n  assert.deepEqual(git("status", "--porcelain").split("\\n").filter(Boolean).sort(), expectedStatus);\n  for (const [path, expected] of Object.entries(${JSON.stringify(frozenFiles)})) assert.equal(hash(readFileSync(join(root, path))), expected);\n  const prior = load("previous-evidence-hashes.json");\n  for (const [name, expected] of Object.entries(prior.files)) assert.equal(hash(readFileSync(join(prior.folder, name))), expected, "Historical evidence must remain unchanged");`);
replace('"Repair / History / Shared Joy", "Cognitive World Fingerprint"', '"Cognitive World Fingerprint"');
replace('index < 3', 'index < 2');
replace('fixtureSha: FIXTURE_SHA,', 'fixtureSha: null, inheritedV4FixtureSha: FIXTURE_SHA, fixtureFiles: ' + JSON.stringify(frozenFiles) + ',');
replace('conservativeEnvelopeUSD: 6 * (reserves.S + reserves.A), rates,',
  'conservativeEnvelopeUSD: 4 * (reserves.S + reserves.A), historicalChargeUSD: HISTORICAL_CHARGE, combinedHardCapUSD: CAP, rates,');
replace('maximumCalls: MAX_CALLS, hardCapUSD: CAP, networkAttempts: 0, successfulCalls: 0,',
  'maximumCalls: MAX_CALLS, hardCapUSD: CAP, historicalChargeUSD: HISTORICAL_CHARGE, networkAttempts: 0, successfulCalls: 0,');
replace('pathIndex < 6', 'pathIndex < 4');
replace('record.totalCalculatedChargeUSD + record.unknownChargeReserveUSD + reserves[path.modelKey] <= CAP',
  'HISTORICAL_CHARGE + record.totalCalculatedChargeUSD + record.unknownChargeReserveUSD + reserves[path.modelKey] <= CAP');
replace('record.totalCalculatedChargeUSD + record.unknownChargeReserveUSD <= CAP',
  'HISTORICAL_CHARGE + record.totalCalculatedChargeUSD + record.unknownChargeReserveUSD <= CAP');
assert.equal((runner.match(/createStructuredRequester\(/g) ?? []).length, 1);
writeFileSync(join(output, "run.mjs"), runner, { flag: "wx" });
console.log(JSON.stringify({ offlinePrepared: true, providerCalls: 0, originalEvidenceFilesFrozen: Object.keys(files).length,
  newFixtureVersion: LIVING_SMOKE_VERSION, newFixtureDigest: LIVING_SMOKE_FIXTURE_DIGEST,
  trackedProductionChanges: 0, frozenFixtureFiles: frozenPaths, maximumNewAttempts: 8,
  conservativeNewEnvelopeUSD: 4 * (0.20096 + 1.0048), combinedHardCapUSD: 10,
  recordedRepairOwnerPreferenceAsOnePointOnly: true }));
