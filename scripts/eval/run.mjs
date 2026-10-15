// Evaluation bench for the DM turn path.
//   node scripts/eval/run.mjs --scenario <name|all|a,b> [--runtime astra-primary-v1|dm-loop-v1]
//        [--provider fake|live] [--model opus|astra] [--effort low|medium|high|xhigh|max] [--budget-usd N] [--verbose]
// Every scenario starts from a freshly created campaign on a disposable PGlite
// database. Metrics go to scripts/eval/out/<run>.jsonl (git-ignored).
// --runtime astra-primary-v1 (default) is the Stage 0 path, unchanged.
// --runtime dm-loop-v1 plays the same scenarios on the new loop with scripted
// model events (fake) or the live DmModel adapters (live, both models).
import { mkdir, readdir, readFile, appendFile } from "node:fs/promises";
import { providerKey } from "./lib/keys.mjs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createFakeOpenAi, createLiveOpenAi, ASTRA_PRICE } from "./lib/openai.mjs";
import { formatReport, loadRun } from "./report.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");

function parseArgs(argv) {
  const args = { provider: "fake", scenario: null, budgetUsd: null, verbose: false, runtime: "astra-primary-v1",
    model: "astra", effort: null, continuationEffort: null };
  for (let index = 0; index < argv.length; index++) {
    const flag = argv[index];
    const value = () => {
      const next = argv[++index];
      if (next === undefined) throw Error(`${flag} needs a value`);
      return next;
    };
    if (flag === "--scenario") args.scenario = value();
    else if (flag === "--provider") args.provider = value();
    else if (flag === "--budget-usd") args.budgetUsd = Number(value());
    else if (flag === "--runtime") args.runtime = value();
    else if (flag === "--model") args.model = value();
    else if (flag === "--effort") args.effort = value();
    else if (flag === "--continuation-effort") args.continuationEffort = value();
    else if (flag === "--verbose") args.verbose = true;
    else throw Error(`unknown argument ${flag}`);
  }
  if (args.continuationEffort && !["low", "medium", "high", "xhigh", "max"].includes(args.continuationEffort))
    throw Error("--continuation-effort must be low, medium, high, xhigh or max");
  if (!args.scenario) throw Error("--scenario is required (a name from scripts/eval/scenarios, a comma list, or all)");
  if (!["fake", "live"].includes(args.provider)) throw Error("--provider must be fake or live");
  if (!["astra-primary-v1", "dm-loop-v1"].includes(args.runtime)) throw Error("--runtime must be astra-primary-v1 or dm-loop-v1");
  if (!["opus", "astra"].includes(args.model)) throw Error("--model must be opus or astra");
  if (args.effort && !["low", "medium", "high", "xhigh", "max"].includes(args.effort)) throw Error("--effort must be low, medium, high, xhigh or max");
  if (args.provider === "live" && !(Number.isFinite(args.budgetUsd) && args.budgetUsd > 0))
    throw Error("--provider live requires --budget-usd N with N > 0");
  return args;
}

/** A provider key from the environment or .env.local; the value is never printed. */
const openAiKey = () => providerKey("OPENAI_API_KEY");

async function scenarios(selection, runtime) {
  const folder = join(here, "scenarios");
  const files = (await readdir(folder)).filter((file) => file.endsWith(".json")).sort();
  const all = await Promise.all(files.map(async (file) =>
    ({ name: file.replace(/\.json$/, ""), ...JSON.parse(await readFile(join(folder, file), "utf8")) })));
  // A scenario written for one runtime only says so; "all" picks the fitting ones.
  const fits = (scenario) => !scenario.runtime || scenario.runtime === runtime;
  if (selection === "all") return all.filter(fits);
  const names = selection.split(",").map((name) => name.trim()).filter(Boolean);
  return names.map((name) => {
    const scenario = all.find((entry) => entry.name === name);
    if (!scenario) throw Error(`unknown scenario ${name}; available: ${all.map((s) => s.name).join(", ")}`);
    return scenario;
  });
}

function gitCommit() {
  try { return execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" }).trim(); }
  catch { return null; }
}

let args, selected, apiKey, loopModels;
try {
  args = parseArgs(process.argv.slice(2));
  selected = await scenarios(args.scenario, args.runtime);
  if (args.runtime === "dm-loop-v1") {
    ({ LOOP_MODELS: loopModels } = await import("./lib/loop-harness.mjs"));
    apiKey = args.provider === "live" ? providerKey(loopModels[args.model].key) : "synthetic-eval-only";
    if (!apiKey) throw Error(`live provider needs ${loopModels[args.model].key} (environment or .env.local)`);
  } else {
    apiKey = args.provider === "live" ? openAiKey() : "synthetic-eval-only";
    if (!apiKey) throw Error("live provider needs OPENAI_API_KEY (environment or .env.local)");
  }
} catch (error) {
  console.error(`eval: ${error.message}`);
  console.error("usage: node scripts/eval/run.mjs --scenario <name|all|a,b> [--runtime astra-primary-v1|dm-loop-v1] [--provider fake|live] [--model opus|astra] [--effort E] [--budget-usd N] [--verbose]");
  process.exit(2);
}
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
const label = args.runtime === "dm-loop-v1" ? `loop-${args.model}` : "astra";
const runId = `${stamp}-${label}-${args.provider}-${args.scenario === "all" ? "all" : selected.map((s) => s.name).join("+")}`.slice(0, 120);
const outDir = join(here, "out");
await mkdir(outDir, { recursive: true });
const outFile = join(outDir, `${runId}.jsonl`);
let writeChain = Promise.resolve();
const write = (record) => {
  writeChain = writeChain.then(() => appendFile(outFile, `${JSON.stringify(record)}\n`, "utf8"));
  return writeChain;
};

let stopReason = null;
let spentUsd = 0;
let modelRequests = 0;
if (args.runtime === "dm-loop-v1") {
  const { runLoopScenario, loadLoopScript, createLoopBudget } = await import("./lib/loop-harness.mjs");
  const effort = args.effort ?? loopModels[args.model].defaultEffort;
  const budget = args.provider === "live" ? createLoopBudget(args.budgetUsd) : null;
  write({ type: "run", run: runId, provider: args.provider, runtime: "dm-loop-v1", model: loopModels[args.model].modelId,
    effort, continuationEffort: args.continuationEffort, scenarios: selected.map((s) => s.name), commit: gitCommit(), node: process.version,
    startedAt: new Date().toISOString(), budgetUsd: args.budgetUsd });
  if (args.provider === "live")
    console.log(`Live ${loopModels[args.model].modelId} (${effort}${args.continuationEffort ? `, continuations ${args.continuationEffort}` : ""}) run on dm-loop-v1 with a hard budget of ${args.budgetUsd} USD.`);
  for (const scenario of selected) {
    if (budget?.exhausted) { stopReason = "budget_reached"; break; }
    const script = await loadLoopScript(scenario.name);
    if (args.provider === "fake" && !script && !scenario.loop) {
      process.stdout.write(`▶ ${scenario.name} — no loop script; skipped\n`);
      continue;
    }
    process.stdout.write(`▶ ${scenario.name} — ${scenario.title}\n`);
    const summary = await runLoopScenario({ ...scenario, loop: scenario.loop ?? script ?? {} }, { live: args.provider === "live",
      model: args.model, effort, continuationEffort: args.continuationEffort, apiKey, budget, write, runId, verbose: args.verbose });
    process.stdout.write(`  ${summary.passed ? "PASS" : "FAIL"} checks ${summary.checksPassed}/${summary.checksTotal}` +
      `${summary.probesTotal ? `, probes ${summary.probesPassed}/${summary.probesTotal}` : ""}` +
      `${summary.weaknesses.length ? `, known weaknesses open ${summary.weaknesses.filter((w) => !w.pass).length}` : ""}` +
      ` · ${summary.turns} turns · ${(summary.totalMs / 1000).toFixed(1)} s${budget ? ` · spent ${budget.spentUsd.toFixed(4)} USD` : ""}\n`);
    stopReason ??= summary.stopReason;
  }
  spentUsd = budget?.spentUsd ?? 0;
  modelRequests = budget?.requests ?? 0;
} else {
  const requestLog = [];
  const transport = args.provider === "live"
    ? createLiveOpenAi(requestLog, args.budgetUsd) : createFakeOpenAi(requestLog);
  // The harness imports the turn path lazily so argument errors stay cheap.
  const { runScenario } = await import("./lib/harness.mjs");
  write({ type: "run", run: runId, provider: args.provider, runtime: "astra-primary-v1", scenarios: selected.map((s) => s.name),
    commit: gitCommit(), node: process.version, startedAt: new Date().toISOString(),
    budgetUsd: args.budgetUsd, price: args.provider === "live" ? ASTRA_PRICE : null });
  if (args.provider === "live")
    console.log(`Live gpt-6-astra run with a hard budget of ${args.budgetUsd} USD.`);
  for (const scenario of selected) {
    if (transport.budget?.exhausted) { stopReason = "budget_reached"; break; }
    process.stdout.write(`▶ ${scenario.name} — ${scenario.title}\n`);
    const summary = await runScenario(scenario, { transport, apiKey, write, verbose: args.verbose,
      runId, requestLog });
    process.stdout.write(`  ${summary.passed ? "PASS" : "FAIL"} checks ${summary.checksPassed}/${summary.checksTotal}` +
      `${summary.probesTotal ? `, probes ${summary.probesPassed}/${summary.probesTotal}` : ""}` +
      `${summary.weaknesses.length ? `, known weaknesses open ${summary.weaknesses.filter((w) => !w.pass).length}` : ""}` +
      ` · ${summary.turns} turns · ${(summary.totalMs / 1000).toFixed(1)} s\n`);
    stopReason ??= summary.stopReason;
  }
  spentUsd = transport.budget?.spentUsd ?? 0;
  modelRequests = requestLog.length;
}
write({ type: "end", run: runId, finishedAt: new Date().toISOString(), stopReason, modelRequests, spentUsd });
await writeChain;
console.log(`\n${formatReport(await loadRun(outFile))}`);
console.log(`\nMetrics: ${outFile}`);
