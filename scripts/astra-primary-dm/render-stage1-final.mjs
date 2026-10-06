// Consolidate the original evidence and only the authorized Stage 1B/1C reruns.
// The blind reveal key is deliberately never opened here.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { prepareEvaluation } from "../../spikes/astra-primary-dm/evaluation.mjs";
import { frozenCampaign } from "../../spikes/astra-primary-dm/frozen-data.mjs";

const oldRoot = process.env.RPG_ASTRA_STAGE1_OUTPUT_DIR;
const newRoot = process.env.RPG_ASTRA_STAGE1B_OUTPUT_DIR;
const finalRoot = process.env.RPG_ASTRA_STAGE1C_OUTPUT_DIR;
assert.ok(oldRoot && newRoot && finalRoot);
const oldRun = JSON.parse(await readFile(join(oldRoot, "stage1-private-ledger.json"), "utf8"));
const newRun = JSON.parse(await readFile(join(newRoot, "stage1b-private-ledger.json"), "utf8"));
const finalRun = JSON.parse(await readFile(join(finalRoot, "stage1c-private-ledger.json"), "utf8"));
assert.equal(oldRun.sessions.length, 30);
assert.equal(newRun.sessions.length, 16);
assert.equal(newRun.requests.length <= 64, true);
assert.equal(newRun.stopReason, null);
assert.ok(newRun.sessions.every((row) => row.status === "committed" && row.validation === "passed"));
assert.equal(finalRun.sessions.length, 4);
assert.ok(finalRun.requests.length <= 8 && finalRun.stopReason === null);
assert.deepEqual(finalRun.sessions.map((row) => `${row.caseId}/${row.label}`),
  ["chosen-temptation/X", "quiet-scene/Z", "old-promise/Y", "consume-oil/X"]);
const byKey = (rows) => new Map(rows.map((row) => [`${row.caseId}/${row.label}`, row]));
const oldSessions = byKey(oldRun.sessions), newSessions = byKey(newRun.sessions), finalSessions = byKey(finalRun.sessions);
assert.equal(newSessions.size, 16);
assert.equal(finalSessions.size, 4);
const selected = [], oldRetained = [];
for (const scenario of prepareEvaluation().ownerBlindReview.cases)
  for (const variant of scenario.variants) {
    const key = `${scenario.caseId}/${variant.label}`;
    const latest = finalSessions.get(key), fresh = newSessions.get(key);
    const row = { ...(latest ?? fresh ?? oldSessions.get(key)), source: latest ? "1C" : fresh ? "1B" : "1A" };
    assert.ok(row.caseId);
    if (row.source === "1C" && row.status === "failed") {
      const journal = JSON.parse(await readFile(join(finalRoot, `journal-${row.caseId}-${row.label}.json`), "utf8"));
      row.uncommittedFinal = journal.turns[`stage1c-${row.caseId}-${row.label}`]?.checkpoint.final;
      assert.ok(row.uncommittedFinal);
    }
    selected.push(row);
    if (!fresh && !latest) oldRetained.push(row);
  }
assert.equal(selected.length, 30);
assert.equal(oldRetained.filter((row) => row.status === "committed").length, 10);
assert.equal(oldRetained.filter((row) => row.status === "failed").length, 0);

const secrets = Object.values(frozenCampaign().privateFacts);
const safe = (value) => {
  let result = String(value ?? "");
  for (const secret of secrets) result = result.replaceAll(secret, "[REDACTED]");
  return result.replace(/SYNTHETIC_(?:SECRET|PRIVATE)_[A-Z0-9_]+/g, "[REDACTED]");
};
const cell = (value) => safe(value).replaceAll("|", "\\|").replace(/\r?\n/g, "<br>");
const requestsFor = (run, row) => run.requests.filter((request) =>
  request.caseId === row.caseId && request.label === row.label);
const sum = (rows, key) => rows.reduce((total, row) => total + (row[key] ?? 0), 0);
const percentile = (values, part) => {
  const ordered = [...values].sort((a, b) => a - b);
  return ordered[Math.ceil(ordered.length * part) - 1];
};
const dollars = (run) => {
  const input = sum(run.requests, "inputTokens"), cached = sum(run.requests, "cachedInputTokens");
  return ((input - cached) * 10 + cached + sum(run.requests, "outputTokens") * 50) / 1_000_000;
};
const toolsIn = (run) => run.requests.flatMap((row) => row.toolCalls ?? []);
const receipts = (run) => sum(run.sessions.map((row) => ({ count: row.toolReceipts?.length ?? 0 })), "count");
const receiptCount = (kind) => newRun.sessions.flatMap((row) => row.toolReceipts)
  .filter((row) => row.kind === kind).length;
const selectedCommitted = selected.filter((row) => row.status === "committed");
assert.equal(selectedCommitted.length, 29);
const toolLoops = newRun.sessions.filter((row) => row.toolReceipts.length > 0 && row.requestCount > 1);
const noTool = selectedCommitted.filter((row) => row.toolReceipts.length === 0);
const toolTurns = selectedCommitted.filter((row) => row.toolReceipts.length > 0);
const avg = (rows) => (sum(rows, "requestCount") / rows.length).toFixed(2);
const sec = (ms) => `${(ms / 1000).toFixed(2)} s`;
const blind = [
  "# Astra primary DM — Stage 1 final blind owner review", "",
  "X/Y/Z remain blind. All 30 original cells are present. Valid Stage 1A and Stage 1B results are retained unchanged; Stage 1C fills only the four remaining harness-blocked cells. One Stage 1C final proposal failed invariant validation and did not commit. Its proposed text is shown as uncommitted evidence, not as a delivered response.", "",
  "For each row, token counts are input / cached input / output / reasoning. A visible roll is shown only when the receipt belongs to the player. Other tools are counted without exposing private data.", "",
];
for (const [index, scenario] of prepareEvaluation().ownerBlindReview.cases.entries()) {
  blind.push(`## ${index + 1}. ${scenario.caseId}`, "", `**Literal player input:** ${safe(scenario.literalInput)}`, "",
    "| | X | Y | Z |", "| --- | --- | --- | --- |");
  const columns = ["X", "Y", "Z"].map((label) => {
    const row = selected.find((entry) => entry.caseId === scenario.caseId && entry.label === label);
    const run = row.source === "1C" ? finalRun : row.source === "1B" ? newRun : oldRun;
    const requests = requestsFor(run, row);
    const committed = row.status === "committed";
    const visible = row.visibleChecks ?? [];
    const toolKinds = (row.toolReceipts ?? []).map((receipt) => receipt.kind);
    const requested = requests.flatMap((request) => request.toolCalls ?? []).map((tool) => tool.kind);
    const response = committed ? row.publicResult.narration :
      `No validated player-facing response. Uncommitted proposal: ${row.uncommittedFinal?.narration ?? "No final proposal was saved."}`;
    const tools = visible.length ? visible.map((check) =>
      `${check.kind}: d20 ${check.dice.join("/")}, total ${check.total}, ${check.success ? "success" : "failure"}`).join("; ") :
      toolKinds.length ? `Server receipts: ${toolKinds.join(", ")}; no player-visible roll.` :
        requested.length ? `Requested ${requested.join(", ")}; no server receipt.` : "No roll or tool result.";
    const changes = committed ? row.publicResult.changes : [];
    const outcome = !committed ?
      "No state change applied. Proposed oil item expectedRevision=null; stored item revision=1; validator rejected it." :
      changes.length ? changes.map((change) =>
      `${change.family} ${change.id}: ${JSON.stringify(change.values)}`).join("; ") : "No structured state change applied.";
    const tokens = ["inputTokens", "cachedInputTokens", "outputTokens", "reasoningTokens"]
      .map((key) => sum(requests, key)).join(" / ");
    return { response, tools, outcome,
      timing: `${sec(sum(requests, "latencyMs"))} provider; ${sec(row.wallTimeMs)} session; ${row.requestCount} model round trip${row.requestCount === 1 ? "" : "s"}; Stage ${row.source}`,
      tokens };
  });
  for (const [title, key] of [["Player-facing response", "response"], ["Visible deterministic rolls/tools", "tools"],
    ["Structured state outcome", "outcome"], ["Latency and model round trips", "timing"],
    ["Tokens", "tokens"]])
    blind.push(`| **${title}** | ${columns.map((row) => cell(row[key])).join(" | ")} |`);
  blind.push("");
}
blind.push("## Owner scoring", "", "Score natural interpretation, agency, resistance/failure, tactical coherence, state correctness, secrecy, prose economy, continuity, and willingness to continue play. Treat the one uncommitted proposal as a validation failure rather than a delivered turn.", "");
const report = [
  "# Astra primary DM — Stage 1 final evaluation report", "",
  "**Status:** All 30 original blind cells have been attempted under the authorized Stage 1A, 1B and 1C runs. Twenty-nine committed; one Stage 1C final failed invariant validation. Owner blind scoring remains pending. Stage 2 was not run.", "",
  "## Stage 1A — frozen original", "",
  `- ${oldRun.sessions.length} sessions, ${oldRun.requests.length} model requests; 10 committed and 20 validation failures.`,
  "- Harness failures: 18 model-supplied tool IDs rejected before execution; two final proposals rejected. No tool receipts or continuations.",
  `- Reported-token Standard estimate: US $${dollars(oldRun).toFixed(4)}; conservative cache-write accounting: US $${sum(oldRun.requests, "upperUsd").toFixed(4)}.`,
  `- Tokens: ${sum(oldRun.requests, "inputTokens").toLocaleString()} input, ${sum(oldRun.requests, "cachedInputTokens").toLocaleString()} cached, ${sum(oldRun.requests, "outputTokens").toLocaleString()} output (including ${sum(oldRun.requests, "reasoningTokens").toLocaleString()} reasoning).`, "",
  "## Stage 1B — authorized corrected rerun", "",
  `- ${newRun.sessions.length}/16 sessions; ${newRun.requests.length}/64 model requests; ${newRun.sessions.filter((row) => row.status === "committed").length} committed; ${newRun.sessions.filter((row) => row.validation === "failed").length} validation failures. No semantic retry.`,
  `- ${toolsIn(newRun).length} model tool requests, ${receipts(newRun)} checkpointed server receipts (${receiptCount("query")} public-state queries, ${receiptCount("skill")} deterministic skill rolls), ${newRun.requests.length - newRun.sessions.length} continuation requests. ${toolLoops.length} sessions completed model → server tool → same-model continuation.`,
  `- Tool-loop end-to-end session latency p50/p95: ${sec(percentile(toolLoops.map((row) => row.wallTimeMs), 0.5))} / ${sec(percentile(toolLoops.map((row) => row.wallTimeMs), 0.95))}. Total measured provider latency: ${sec(sum(newRun.requests, "latencyMs"))}.`,
  `- Tokens: ${sum(newRun.requests, "inputTokens").toLocaleString()} input, ${sum(newRun.requests, "cachedInputTokens").toLocaleString()} cached, ${sum(newRun.requests, "outputTokens").toLocaleString()} output (including ${sum(newRun.requests, "reasoningTokens").toLocaleString()} reasoning).`,
  `- Reported-token Standard estimate: US $${dollars(newRun).toFixed(4)} additional; conservative cache-write accounting: US $${sum(newRun.requests, "upperUsd").toFixed(4)}, below the US $40 hard ceiling. Actual invoice unavailable.`,
  `- Every request specified reasoning \`high\`; all ${newRun.requests.length} provider responses reported \`gpt-6-astra\` and service tier \`default\`. No provider error or usage-limit stop.`, "",
  "## Stage 1C — final four cells", "",
  `- ${finalRun.sessions.length}/4 sessions; ${finalRun.requests.length}/8 model requests; ${finalRun.sessions.filter((row) => row.status === "committed").length} committed and ${finalRun.sessions.filter((row) => row.validation === "failed").length} final validation failure. No semantic retry or manual repair.`,
  `- ${toolsIn(finalRun).length} model tool requests, ${receipts(finalRun)} checkpointed public-state query receipts, ${finalRun.requests.length - finalRun.sessions.length} same-model continuation requests.`,
  `- Measured provider latency ${sec(sum(finalRun.requests, "latencyMs"))}; total session wall time ${sec(sum(finalRun.sessions, "wallTimeMs"))}; session wall p50/p95 ${sec(percentile(finalRun.sessions.map((row) => row.wallTimeMs), 0.5))} / ${sec(percentile(finalRun.sessions.map((row) => row.wallTimeMs), 0.95))}.`,
  `- Tokens: ${sum(finalRun.requests, "inputTokens").toLocaleString()} input, ${sum(finalRun.requests, "cachedInputTokens").toLocaleString()} cached, ${sum(finalRun.requests, "outputTokens").toLocaleString()} output (including ${sum(finalRun.requests, "reasoningTokens").toLocaleString()} reasoning).`,
  `- Reported-token Standard estimate US $${dollars(finalRun).toFixed(4)} additional; conservative cache-write accounting US $${sum(finalRun.requests, "upperUsd").toFixed(4)}, below the US $5 hard ceiling. Actual invoice unavailable. All requests specified \`gpt-6-astra\` / reasoning \`high\` / \`default\`; all responses confirmed the model and tier.`,
  "- Consume-oil/X proposed `expectedRevision: null` for existing oil item revision `1` while narrating its consumption. The invariant validator rejected the item change and no player-facing response or state was committed. Its uncommitted proposal is preserved in the blind review. The other three cells committed.", "",
  "## Combined and interpretation", "",
  `- ${oldRun.requests.length + newRun.requests.length + finalRun.requests.length} total model requests across ${oldRun.sessions.length + newRun.sessions.length + finalRun.sessions.length} session attempts; reported-token Standard estimate US $${(dollars(oldRun) + dollars(newRun) + dollars(finalRun)).toFixed(4)}; conservative total US $${(sum(oldRun.requests, "upperUsd") + sum(newRun.requests, "upperUsd") + sum(finalRun.requests, "upperUsd")).toFixed(4)}.`,
  `- The consolidated blind review has ${selectedCommitted.length}/30 committed variants and no unattempted cells: ten valid Stage 1A and sixteen valid Stage 1B outcomes remain unchanged; three Stage 1C cells committed; one Stage 1C final was rejected.`,
  `- Across Stage 1B and 1C, ${receipts(newRun) + receipts(finalRun)} server tools executed and ${toolLoops.length + finalRun.sessions.filter((row) => row.toolReceipts.length > 0 && row.requestCount > 1).length} sessions completed a same-model tool continuation.`,
  `- Average model round trips: ${avg(noTool)} for ${noTool.length} committed no-tool turns; ${avg(toolTurns)} for ${toolTurns.length} committed tool turns.`,
  "- The jump-kiss Stage 1A final used a natural-language position string that the validator correctly rejects; the response schema now restricts position to the validator's existing values. The companion-refusal Stage 1A final used worldMinutes 0 because the minimal packet omitted the current 720; every arm now receives that current time. Both are generic harness defects. No final was manually repaired.",
  "- The prototype now derives replay identity from the operation and checkpoint tool position. A saved receipt replays exactly after restart; changed arguments at that position conflict. The model supplies semantic tool arguments only.", "",
  "- Quality remains for owner scoring: one validated jump-kiss variant narrates a successful kiss after a public-state query without a physical roll. The numeric/state validator did not establish a condition or other mechanical effect; this is visible DM adjudication evidence, not a result to edit or rerun under this authorization.", "",
  "## Isolation", "",
  "Only synthetic packets, disposable local journals and direct OpenAI text requests were used. Main, owner database, owner app, owner gameplay and the historical failed turn were untouched. No migration, deployment, media request or Stage 2 run occurred. The blind mapping remains in a separate private local file, which this renderer does not read.", "",
  "Pricing basis: [official GPT-6 Astra model page](https://developers.openai.com/api/docs/models/gpt-6-astra).", "",
].join("\n");
const blindText = blind.join("\n");
for (const document of [blindText, report]) {
  assert.ok(!secrets.some((secret) => document.includes(secret)));
  assert.ok(!/\bArm [ABC]\b/.test(document));
}
await writeFile("ASTRA_PRIMARY_DM_STAGE1_BLIND_REVIEW_FINAL.md", blindText);
await writeFile("ASTRA_PRIMARY_DM_STAGE1_REPORT_FINAL.md", report);
process.stdout.write(JSON.stringify({ selected: selected.length, committed: selectedCommitted.length,
  invalidFinals: selected.length - selectedCommitted.length, stage1cRequests: finalRun.requests.length,
  stage1cEstimatedUsd: dollars(finalRun), stage1cUpperUsd: sum(finalRun.requests, "upperUsd"),
  stage1cProviderLatencyMs: sum(finalRun.requests, "latencyMs") }) + "\n");
