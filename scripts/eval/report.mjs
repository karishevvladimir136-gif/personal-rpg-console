// Summarize an evaluation run: node scripts/eval/report.mjs <run-id | path.jsonl>
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export function median(values) {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function runPath(run) {
  if (existsSync(run)) return resolve(run);
  return join(here, "out", run.endsWith(".jsonl") ? run : `${run}.jsonl`);
}

export async function loadRun(run) {
  const text = await readFile(runPath(run), "utf8");
  return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function table(rows) {
  const widths = rows[0].map((_, column) => Math.max(...rows.map((row) => String(row[column]).length)));
  return rows.map((row, index) => {
    const line = row.map((cell, column) => String(cell).padEnd(widths[column])).join("  ");
    return index === 0 ? `${line}\n${widths.map((width) => "-".repeat(width)).join("  ")}` : line;
  }).join("\n");
}

const fmt = (value, digits = 0) => value === null || value === undefined ? "–" : Number(value).toFixed(digits);

export function formatReport(records) {
  const header = records.find((record) => record.type === "run");
  const turns = records.filter((record) => record.type === "turn");
  const scenarios = records.filter((record) => record.type === "scenario");
  const end = records.find((record) => record.type === "end");
  const lines = [];
  lines.push(`Run ${header?.run ?? "?"} · provider ${header?.provider ?? "?"} · commit ${header?.commit ?? "?"} · ${header?.startedAt ?? ""}`);
  if (header?.provider === "fake")
    lines.push("Fake provider: timings are server-side only (no model latency); tokens are byte estimates, not measured usage.");
  lines.push("");
  const rows = [["scenario", "result", "checks", "probes", "turns", "committed", "failed", "paused", "med ms", "med req", "med ctx KB"]];
  for (const scenario of scenarios) {
    const own = turns.filter((turn) => turn.scenario === scenario.scenario && !turn.replayOf);
    rows.push([
      scenario.scenario,
      scenario.passed ? "PASS" : "FAIL",
      `${scenario.checksPassed}/${scenario.checksTotal}`,
      scenario.probesTotal ? `${scenario.probesPassed}/${scenario.probesTotal}` : "–",
      own.length,
      own.filter((turn) => turn.outcome === "committed").length,
      own.filter((turn) => turn.outcome === "failed" || turn.outcome === "error").length,
      own.filter((turn) => turn.paused).length,
      fmt(median(own.map((turn) => turn.durationMs))),
      fmt(median(own.map((turn) => turn.modelRequests?.total)), 1),
      fmt(median(own.map((turn) => Math.max(0, ...(turn.contextBytes ?? [])) / 1024)), 1),
    ]);
  }
  lines.push(table(rows));
  const fresh = turns.filter((turn) => !turn.replayOf);
  const committed = fresh.filter((turn) => turn.outcome === "committed");
  const byMode = (mode) => fresh.filter((turn) => turn.responseMode === mode);
  lines.push("");
  lines.push("Medians over all new turns:");
  lines.push(`  turn duration ${fmt(median(fresh.map((turn) => turn.durationMs)))} ms` +
    ` (committed only ${fmt(median(committed.map((turn) => turn.durationMs)))} ms);` +
    ` after-commit memory work ${fmt(median(fresh.map((turn) => turn.maintenanceMs)))} ms`);
  lines.push(`  model requests per turn ${fmt(median(fresh.map((turn) => turn.modelRequests?.total)), 1)}` +
    ` (public-unified ${fmt(median(byMode("public-unified").map((turn) => turn.modelRequests?.total)), 1)},` +
    ` private-informed ${fmt(median(byMode("private-informed").map((turn) => turn.modelRequests?.total)), 1)});` +
    ` background summary calls ${fmt(median(fresh.map((turn) => turn.summaryCalls)), 1)}`);
  lines.push(`  request size ${fmt(median(fresh.flatMap((turn) => turn.requestBytes ?? [])) / 1024, 1)} KB;` +
    ` input tokens/turn ${fmt(median(fresh.map((turn) => turn.tokens?.input)))}` +
    `${fresh.some((turn) => turn.tokens?.estimated) ? " (estimated)" : ""};` +
    ` output tokens/turn ${fmt(median(fresh.map((turn) => turn.tokens?.output)))}` +
    `${fresh.some((turn) => turn.tokens?.estimated) ? " (estimated)" : ""}`);
  lines.push(`  outcomes: ${["committed", "failed", "awaiting_confirmation", "error"].map((outcome) =>
    `${outcome} ${fresh.filter((turn) => turn.outcome === outcome).length}`).join(", ")};` +
    ` paused for dice ${fresh.filter((turn) => turn.paused).length}`);
  if (header?.provider === "live")
    lines.push(`  spend ${fmt(end?.spentUsd, 4)} USD of ${fmt(header?.budgetUsd, 2)} USD`);
  const weaknesses = scenarios.flatMap((scenario) => (scenario.weaknesses ?? []).map((weakness) =>
    ({ ...weakness, scenario: scenario.scenario })))
    .sort((a, b) => a.id.localeCompare(b.id));
  if (weaknesses.length) {
    lines.push("");
    lines.push(`Known weaknesses (docs/BASELINE.md; red until fixed): ${weaknesses.filter((w) => !w.pass).length} open, ${weaknesses.filter((w) => w.pass).length} closed`);
    for (const weakness of weaknesses)
      lines.push(`  ${weakness.id} ${weakness.pass ? "CLOSED" : "OPEN  "} ${weakness.label} (${weakness.scenario}/${weakness.step}) — ${weakness.detail}`);
  }
  const failures = scenarios.flatMap((scenario) => scenario.failedChecks.map((check) => `${scenario.scenario}  ${check}`));
  if (failures.length) {
    lines.push("");
    lines.push("Failed checks:");
    for (const failure of failures) lines.push(`  ${failure}`);
  }
  const problems = scenarios.flatMap((scenario) => scenario.harnessErrors.map((problem) => `${scenario.scenario}  ${problem}`));
  if (problems.length) {
    lines.push("");
    lines.push(header?.provider === "live"
      ? "Harness notes (requests not sent or not completed):"
      : "Harness problems (scripted answers that the live API could not return):");
    for (const problem of problems) lines.push(`  ${problem}`);
  }
  if (end?.stopReason) lines.push(`\nStopped: ${end.stopReason}`);
  return lines.join("\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const run = process.argv[2];
  if (!run) {
    console.error("usage: node scripts/eval/report.mjs <run-id | path.jsonl>");
    process.exit(2);
  }
  console.log(formatReport(await loadRun(run)));
}
