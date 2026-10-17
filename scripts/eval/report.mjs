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
  if (header?.runtime === "dm-loop-v1") {
    // The Stage 2 report (docs/stages/STAGE_2.md §6).
    const withText = fresh.filter((turn) => turn.firstWordMs !== null && turn.firstWordMs !== undefined);
    const rejectedShare = fresh.length ? fresh.filter((turn) => (turn.effects?.rejected ?? []).length > 0).length / fresh.length : null;
    const failedShare = fresh.length ? fresh.filter((turn) => turn.outcome === "failed" || turn.outcome === "error").length / fresh.length : null;
    const leaks = scenarios.flatMap((scenario) => scenario.leaks ?? []);
    lines.push("");
    lines.push(`dm-loop-v1 · ${header.model ?? "scripted model"} · effort ${header.effort ?? "–"}`);
    lines.push(`  time to first word, median ${fmt(median(withText.map((turn) => turn.firstWordMs)))} ms (${withText.length} turns with text)`);
    lines.push(`  full turn, median ${fmt(median(fresh.map((turn) => turn.durationMs)))} ms; cost per turn, median ${fmt(median(fresh.map((turn) => turn.costUsd)), 4)} USD` +
      ` (total ${fmt(fresh.reduce((sum, turn) => sum + (turn.costUsd ?? 0), 0), 4)} USD over ${fresh.length} turns)`);
    lines.push(`  cache read share, median ${fmt(median(fresh.map((turn) => turn.cacheReadShare)) * 100)}%;` +
      ` requests per turn, median ${fmt(median(fresh.map((turn) => turn.modelRequests?.total)), 1)}; tool calls per turn, median ${fmt(median(fresh.map((turn) => turn.effects?.proposed?.length)), 1)}`);
    lines.push(`  turns with at least one rejected call ${rejectedShare === null ? "–" : fmt(rejectedShare * 100)}%; failed turns ${failedShare === null ? "–" : fmt(failedShare * 100, 1)}% (target < 2%)`);
    lines.push(`  scenario checks passed ${scenarios.reduce((sum, s) => sum + s.checksPassed, 0)}/${scenarios.reduce((sum, s) => sum + s.checksTotal, 0)};` +
      ` scenarios passed ${scenarios.filter((s) => s.passed).length}/${scenarios.length}`);
    lines.push(`  suspected literal secret leaks logged: ${leaks.length}${leaks.length ? ` — ${leaks.join(" | ")}` : ""}`);
    const rejected = fresh.flatMap((turn) => (turn.effects?.rejected ?? []).map((r) => `${turn.scenario}/${turn.step}: ${r.name} — ${r.reason}`));
    if (rejected.length) { lines.push("  rejected calls:"); for (const line of rejected) lines.push(`    ${line}`); }
    const failures = fresh.filter((turn) => turn.outcome === "failed" || turn.outcome === "error")
      .map((turn) => `${turn.scenario}/${turn.step}: ${turn.errorCode ?? turn.outcome}${turn.failure?.length ? ` (${turn.failure.map((f) => f.message).join("; ")})` : ""}`);
    if (failures.length) { lines.push("  failed turns:"); for (const line of failures) lines.push(`    ${line}`); }
    lines.push(...stage4Report(fresh, scenarios));
  }
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

/** The Stage 4 block (docs/stages/STAGE_4.md): the dossier layers against their
 * budgets and how often each stayed byte-identical between turns (the cacheable
 * share), the depth the server chose, the resistance metrics and the NPC
 * self-disclosures the leak check set aside. */
export function stage4Report(turns, scenarios) {
  const lines = [];
  const withLayers = turns.filter((turn) => (turn.layers ?? []).length);
  if (!withLayers.length && !scenarios.some((s) => s.metrics)) return lines;
  lines.push("");
  lines.push("Stage 4 · dossier layers (first request of each turn):");
  if (withLayers.length) {
    const count = Math.max(...withLayers.map((turn) => turn.layers.length));
    const rows = [["layer", "median tokens", "max tokens", "budget", "over budget", "unchanged since last turn", "cache read share (turn)"]];
    for (let index = 0; index < count; index++) {
      const column = withLayers.map((turn) => turn.layers[index]).filter(Boolean);
      const judged = column.filter((layer) => layer.stable !== null);
      rows.push([index + 1, fmt(median(column.map((layer) => layer.tokens))), fmt(Math.max(...column.map((layer) => layer.tokens))),
        fmt(column[0]?.budgetTokens), `${column.filter((layer) => layer.budgetTokens && layer.tokens > layer.budgetTokens).length} turns`,
        judged.length ? `${fmt(judged.filter((layer) => layer.stable).length / judged.length * 100)}% of ${judged.length}` : "–",
        index === 0 ? `${fmt((median(turns.map((turn) => turn.cacheReadShare)) ?? 0) * 100)}% median` : ""]);
    }
    lines.push(table(rows).split("\n").map((line) => `  ${line}`).join("\n"));
    const costs = turns.filter((turn) => turn.costUsd);
    if (costs.length) {
      // Cost per layer: the input cost of a turn split by the layers' token shares, cached tokens at the provider's read discount.
      const perLayer = withLayers[0].layers.map(() => 0);
      for (const turn of costs) {
        const total = turn.layers.reduce((sum, layer) => sum + layer.tokens, 0) || 1;
        turn.layers.forEach((layer, index) => { perLayer[index] += turn.costUsd * layer.tokens / total; });
      }
      lines.push(`  cost share by layer (input tokens, approximate): ${perLayer.map((usd, index) => `L${index + 1} ${fmt(usd / costs.length, 4)} USD/turn`).join(", ")}`);
    }
  }
  const depths = {};
  for (const turn of turns) if (turn.pin?.effort) depths[turn.pin.effort] = (depths[turn.pin.effort] ?? 0) + 1;
  if (Object.keys(depths).length) lines.push(`  depth chosen per turn: ${Object.entries(depths).map(([effort, n]) => `${effort} ${n}`).join(", ")}` +
    `; «important turn» boosts ${turns.filter((turn) => turn.pin?.depth?.boosted).length}`);
  for (const scenario of scenarios) {
    if (!scenario.metrics) continue;
    const m = scenario.metrics;
    const pct = (value) => value === null || value === undefined ? "–" : `${fmt(value * 100)}%`;
    lines.push(`  ${scenario.scenario} metrics: turns ${m.turns}; check success ${pct(m.checkSuccessRate)} (expected ${pct(m.checkSuccessExpected)}), near misses ${pct(m.nearMissRate)};` +
      ` NPC refusals ${pct(m.npcRefusalRate)} of turns; longest unearned-win streak ${m.unearnedWinStreakLongest}; fights ${m.fights}` +
      `${m.fights ? ` (uncertain ${pct(m.fightsUncertainShare)}, won at no cost ${m.fightsWonAtNoCost}, HP lost per fight ${m.hpLostPerFight})` : ""}`);
  }
  for (const scenario of scenarios) {
    const n = scenario.naturalness;
    if (!n) continue;
    lines.push(`  ${scenario.scenario} naturalness: ${n.words} words; Latin letters ${fmt(n.latinShare * 100)}%; канцелярит ${fmt(n.kancelyaritPerThousand)}/1k words;` +
      ` sentence-length variation ${n.sentenceLengthVariation === null ? "–" : fmt(n.sentenceLengthVariation)}; answers every point ${n.answersEveryPoint === null ? "–" : `${fmt(n.answersEveryPoint * 100)}%`}` +
      `${n.repeatedPhrases.length ? `; repeated: ${n.repeatedPhrases.slice(0, 4).map((row) => `«${row.phrase}» ×${row.turns}`).join(", ")}` : ""}`);
  }
  const disclosures = scenarios.flatMap((scenario) => scenario.selfDisclosures ?? []);
  lines.push(`  NPC self-disclosures set aside by the leak check: ${disclosures.length}${disclosures.length ? ` — ${disclosures.join(" | ").slice(0, 400)}` : ""}`);
  return lines;
}

/** Every paid request of a run: tokens and cost per call, then the totals. */
export function formatCalls(records) {
  const turns = records.filter((record) => record.type === "turn" && (record.calls ?? []).length);
  const rows = [["scenario/step", "#", "ms", "first ms", "in", "cached", "write", "out", "reason", "tools", "USD"]];
  const total = { in: 0, cached: 0, write: 0, out: 0, usd: 0, calls: 0 };
  for (const turn of turns) {
    turn.calls.forEach((call, index) => {
      rows.push([`${turn.scenario}/${turn.step}`, index + 1, fmt(call.latencyMs), fmt(call.firstTextMs), fmt(call.inputTokens),
        fmt(call.cachedInputTokens), fmt(call.cacheWriteTokens), fmt(call.outputTokens), fmt(call.reasoningTokens), fmt(call.toolCalls), fmt(call.costUsd, 4)]);
      total.in += call.inputTokens ?? 0; total.cached += call.cachedInputTokens ?? 0; total.write += call.cacheWriteTokens ?? 0;
      total.out += call.outputTokens ?? 0; total.usd += call.costUsd ?? 0; total.calls++;
    });
  }
  rows.push(["total", total.calls, "", "", fmt(total.in), fmt(total.cached), fmt(total.write), fmt(total.out), "", "", fmt(total.usd, 4)]);
  return table(rows);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const run = process.argv[2];
  if (!run) {
    console.error("usage: node scripts/eval/report.mjs <run-id | path.jsonl> [--calls]");
    process.exit(2);
  }
  const records = await loadRun(run);
  console.log(process.argv.includes("--calls") ? formatCalls(records) : formatReport(records));
}
