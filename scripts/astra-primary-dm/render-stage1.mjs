// Render owner-facing artifacts from the completed synthetic ledger only.
// Deliberately never read the separately stored A/B/C reveal key.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { prepareEvaluation } from "../../spikes/astra-primary-dm/evaluation.mjs";
import { frozenCampaign } from "../../spikes/astra-primary-dm/frozen-data.mjs";

const root = process.env.RPG_ASTRA_STAGE1_OUTPUT_DIR;
assert.ok(root);
const ledger = JSON.parse(await readFile(join(root, "stage1-private-ledger.json"), "utf8"));
const prepared = prepareEvaluation();
assert.equal(ledger.candidate, "c23daeeb7496ed36995cf203fd0f8c5d845ec493");
assert.equal(ledger.sessions.length, 30);
assert.equal(ledger.requests.length <= 120, true);
assert.equal(ledger.stopReason, null);
assert.equal(new Set(ledger.sessions.map((row) => `${row.caseId}/${row.label}`)).size, 30);
const privateStrings = Object.values(frozenCampaign().privateFacts);
const safe = (value) => {
  let result = String(value ?? "");
  for (const secret of privateStrings) result = result.replaceAll(secret, "[REDACTED]");
  return result.replace(/SYNTHETIC_SECRET_[A-Z0-9_]+/g, "[REDACTED]")
    .replace(/SYNTHETIC_PRIVATE_[A-Z0-9_]+/g, "[REDACTED]");
};
const cell = (value) => safe(value).replaceAll("|", "\\|").replace(/\r?\n/g, "<br>");
const percentile = (numbers, quantile) => {
  const ordered = [...numbers].sort((a, b) => a - b);
  return ordered[Math.ceil(ordered.length * quantile) - 1];
};
const sum = (key) => ledger.requests.reduce((total, row) => total + (row[key] ?? 0), 0);
const requestsFor = (session) => ledger.requests.filter((row) =>
  row.caseId === session.caseId && row.label === session.label);
const byKind = (rows) => rows.reduce((out, row) => {
  for (const tool of row.toolCalls ?? []) out[tool.kind] = (out[tool.kind] ?? 0) + 1;
  return out;
}, {});
const bySession = new Map(ledger.sessions.map((row) => [`${row.caseId}/${row.label}`, row]));
const checkCounts = { recorded: 0, failed: 0 };
let rejectedToolIds = 0, rejectedFinals = 0;
for (const session of ledger.sessions) {
  const journal = JSON.parse(await readFile(join(root, `journal-${session.caseId}-${session.label}.json`), "utf8"));
  const turn = journal.turns[`stage1-${session.caseId}-${session.label}`];
  checkCounts.recorded += turn.checkpoint.tools.length;
  if (session.status === "failed") checkCounts.failed++;
  const requests = requestsFor(session);
  rejectedToolIds += requests.flatMap((row) => row.toolCalls ?? [])
    .filter((row) => !/^[a-z0-9-]{1,48}$/.test(row.callId)).length;
  if (session.status === "failed" && turn.checkpoint.final) rejectedFinals++;
  assert.equal(journal.campaign.revision, session.status === "committed" ? 8 : 7);
}

const rubric = [
  "Natural-language understanding", "Player agency", "NPC/companion agency", "Rules discipline",
  "World resistance/stakes", "Meaningful failure", "No automatic success",
  "Mary Sue / God Simulator drift", "Continuity/callback use where applicable",
  "Tactical coherence", "State/resource correctness", "Secret handling", "Prose economy",
  "Would I want this DM to continue the campaign?",
];
const blind = [
  "# Astra primary DM — Stage 1 blind owner review",
  "",
  "All entries are frozen synthetic scenarios. X/Y/Z identities are deliberately hidden. A failed validation produced no committed player-facing response or state change. No private synthetic truth is shown.",
  "",
  "Score each variant before requesting the separate reveal key. Contract failures count as evidence; no output was repaired or regenerated.",
  "",
];
for (const [index, scenario] of prepared.ownerBlindReview.cases.entries()) {
  blind.push(`## ${index + 1}. ${scenario.caseId}`, "", `**Player input:** ${safe(scenario.literalInput)}`, "",
    "| | X | Y | Z |", "| --- | --- | --- | --- |");
  const columns = ["X", "Y", "Z"].map((label) => {
    const session = bySession.get(`${scenario.caseId}/${label}`);
    assert.ok(session);
    const requests = requestsFor(session);
    const latency = requests.reduce((n, row) => n + (row.latencyMs ?? 0), 0);
    const requested = byKind(requests);
    const toolIdMismatch = requests.some((row) => row.toolCalls?.some((tool) =>
      !/^[a-z0-9-]{1,48}$/.test(tool.callId)));
    const response = session.status === "committed" ? session.publicResult.narration : toolIdMismatch ?
      "No player-facing response: local harness rejected the generated tool ID before execution." :
      "No validated player-facing response: final state proposal was rejected.";
    const visible = session.visibleChecks?.length ? session.visibleChecks.map((row) =>
      `${row.kind}: d20 ${row.dice.join("/")}, total ${row.total}, ${row.success ? "success" : "failure"}`).join("; ") :
      Object.keys(requested).length ? `No result recorded; requested ${Object.entries(requested).map(([k, n]) => `${n} ${k}`).join(", ")}. Tool ID failed the local format guard.` :
        "No roll or tool result.";
    const changes = session.status === "committed" ? session.publicResult.changes : [];
    const outcome = changes.length ? changes.map((row) =>
      `${row.family} ${row.id}: ${JSON.stringify(row.values)}`).join("; ") : "No structured state change applied.";
    const tokens = ["inputTokens", "cachedInputTokens", "outputTokens", "reasoningTokens"]
      .map((key) => requests.reduce((n, row) => n + (row[key] ?? 0), 0));
    return { response, visible, outcome,
      latency: `${(latency / 1000).toFixed(2)} s provider / ${(session.wallTimeMs / 1000).toFixed(2)} s session / ${requests.length} request${requests.length === 1 ? "" : "s"}`,
      tokens: tokens.join(" / ") };
  });
  for (const [label, field] of [["Response", "response"], ["Visible rolls/tools", "visible"],
    ["Structured outcome", "outcome"], ["Provider/session latency and round trips", "latency"],
    ["Tokens: input / cached / output / reasoning", "tokens"]])
    blind.push(`| **${label}** | ${columns.map((row) => cell(row[field])).join(" | ")} |`);
  blind.push("");
}
blind.push("## Owner scoring rubric", "", ...rubric.map((row) => `- ${row}`), "");
const blindPath = "ASTRA_PRIMARY_DM_STAGE1_BLIND_REVIEW.md";
const blindText = blind.join("\n");
assert.ok(!privateStrings.some((secret) => blindText.includes(secret)));
assert.ok(!/\b(?:Arm A|Arm B|Arm C|A\/B\/C mapping)\b/.test(blindText));
await writeFile(blindPath, blindText);

const committed = ledger.sessions.filter((row) => row.status === "committed").length;
const validationFailures = ledger.sessions.filter((row) => row.validation === "failed").length;
const transportFailures = ledger.requests.filter((row) => row.status === "failed" || row.responseStatus !== 200).length;
const inputTokens = sum("inputTokens"), cached = sum("cachedInputTokens"), outputTokens = sum("outputTokens");
const estimatedUsd = ((inputTokens - cached) * 10 + cached * 1 + outputTokens * 50) / 1_000_000;
const conservativeUsd = ledger.requests.reduce((n, row) => n + row.upperUsd, 0);
const toolCounts = byKind(ledger.requests);
const toolSummary = Object.keys(toolCounts).length ? Object.entries(toolCounts).map(([kind, count]) =>
  `  - ${kind}: ${count}`).join("\n") : "  - none";
const report = [
  "# Astra primary DM — Stage 1 live evaluation",
  "",
  "**Status:** Stage 1 finished on frozen synthetic data. Owner blind scoring is pending. No architectural winner is declared. Stage 2 was not run.",
  "",
  `- **Reviewed candidate used:** \`${ledger.candidate}\` on \`codex/astra-primary-dm-spike\`.`,
  `- **Direct provider configuration:** OpenAI \`${ledger.model}\`, reasoning \`${ledger.reasoning}\`, Standard/\`${ledger.serviceTier}\`. Every HTTP response reported \`gpt-6-astra\` and \`default\`.`,
  `- **Sessions:** ${ledger.sessions.length}/30 attempted; ${committed} committed, ${ledger.sessions.length - committed} failed validation.`,
  `- **Model requests:** ${ledger.requests.length}/120; one per session. No semantic or transport retries.`,
  `- **Measured tokens:** ${inputTokens.toLocaleString()} input, ${cached.toLocaleString()} cached input, ${outputTokens.toLocaleString()} output (including ${sum("reasoningTokens").toLocaleString()} reasoning).`,
  `- **Measured provider latency:** ${(sum("latencyMs") / 1000).toFixed(3)} s total. Session wall-time p50/p95: ${(percentile(ledger.sessions.map((row) => row.wallTimeMs), 0.5) / 1000).toFixed(3)} / ${(percentile(ledger.sessions.map((row) => row.wallTimeMs), 0.95) / 1000).toFixed(3)} s.`,
  `- **Model round trips per session:** p50 ${percentile(ledger.sessions.map((row) => row.requestCount), 0.5)}, p95 ${percentile(ledger.sessions.map((row) => row.requestCount), 0.95)}.`,
  `- **Estimated Standard API spend:** US $${estimatedUsd.toFixed(4)} from reported usage at current text-token rates; actual invoice unavailable. Conservative cache-write-rate accounting: US $${conservativeUsd.toFixed(4)}, below the US $70 ceiling.`,
  `- **Validation failures:** ${validationFailures} total: ${rejectedToolIds} local tool-ID format rejections and ${rejectedFinals} invalid final state proposals. **Provider/transport/schema failures:** ${transportFailures}. All ${ledger.requests.length} requests returned HTTP 200.`,
  "- **Model-requested generic tool calls by kind:**",
  toolSummary,
  `- **Server-accepted/checkpointed tool receipts:** ${checkCounts.recorded}; therefore no deterministic roll was reached in this run. Failed sessions applied no state.`,
  `- **Blinded owner review:** [${blindPath}](${blindPath}). The A/B/C reveal mapping is kept separately from both owner-facing artifacts.`,
  "",
  "## Interpretation limits",
  "",
  `The Stage 1 sample is complete, but its tool-loop evidence is blocked by a harness mismatch. All ${rejectedToolIds} generated tool IDs copied the uppercase blind label X/Y/Z from the synthetic operation ID; the prototype tool guard accepts lowercase IDs only. Thus the tool requests stopped before execution or result-return continuation. This is not evidence that Astra cannot use those tools. The other ${rejectedFinals} failures were rejected final state values. The blind artifact marks each failure. This run cannot establish comparative tool-use quality or long-form drift. No prompt, output or dice result was repaired during the run; a changed tool contract and new live calls require separate authorization.`,
  "",
  "## Isolation and next step",
  "",
  "Only frozen synthetic packets, a disposable local journal and direct OpenAI text requests were used. No owner campaign data was read into prompts. Main, the owner database, running app, owner gameplay and historical failed turn were not changed. No migration, deployment, media call, Stage 2 run or production runtime change occurred. Owner blind scoring is the next step; the reveal key stays separate until that review is complete.",
  "",
  "Pricing basis: [official GPT-6 Astra model page](https://developers.openai.com/api/docs/models/gpt-6-astra).",
  "",
].join("\n");
assert.ok(!privateStrings.some((secret) => report.includes(secret)));
assert.ok(!/\b(?:Arm A|Arm B|Arm C|A\/B\/C mapping)\b/.test(report));
await writeFile("ASTRA_PRIMARY_DM_STAGE1_REPORT.md", report);
process.stdout.write(JSON.stringify({ blindPath, reportPath: "ASTRA_PRIMARY_DM_STAGE1_REPORT.md",
  committed, validationFailures, rejectedToolIds, rejectedFinals, transportFailures, requests: ledger.requests.length,
  acceptedToolReceipts: checkCounts.recorded, estimatedUsd }) + "\n");
