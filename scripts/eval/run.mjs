// Evaluation bench for the DM turn path.
//   node scripts/eval/run.mjs --scenario <name|all|a,b> [--runtime astra-primary-v1|dm-loop-v1]
//        [--provider fake|live] [--model opus|astra] [--effort low|medium|high|xhigh|max] [--budget-usd N] [--max-steps N] [--verbose]
// Every scenario starts from a freshly created campaign on a disposable PGlite
// database. Metrics go to scripts/eval/out/<run>.jsonl (git-ignored).
// --runtime astra-primary-v1 (default) is the Stage 0 path, unchanged.
// --runtime dm-loop-v1 plays the same scenarios on the new loop with scripted
// model events (fake) or the live DmModel adapters (live, both models).
import { mkdir, readdir, readFile, appendFile, copyFile } from "node:fs/promises";
import { providerKey } from "./lib/keys.mjs";
import { anthropicKey, anthropicKeyName } from "./lib/anthropic-endpoint.mjs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createFakeOpenAi, createLiveOpenAi, ASTRA_PRICE } from "./lib/openai.mjs";
import { formatReport, loadRun } from "./report.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");

function parseArgs(argv) {
  const args = { provider: "fake", scenario: null, budgetUsd: null, verbose: false, runtime: "astra-primary-v1",
    model: "astra", effort: null, continuationEffort: null, writer: null, bookkeeper: null };
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
    else if (flag === "--max-steps") args.maxSteps = Number(value());
    // Polish 3 §6: the split — `--writer opus|fable --bookkeeper sonnet|opus[@effort]` (dm-loop-v1, live).
    else if (flag === "--writer") args.writer = value();
    else if (flag === "--bookkeeper") { const [model, effort] = value().split("@"); args.bookkeeper = { model, effort: effort ?? null }; }
    // `--bookkeeper-switch 11:medium` — the bookkeeper's effort changes from that turn on (polish 3 §6: Sonnet at medium on turns 11–20).
    else if (flag === "--bookkeeper-switch") { const [turn, effort] = value().split(":"); args.bookkeeperSwitch = { turn: Number(turn), effort }; }
    // Merge after session 2: `--app-checks` runs the app's two in-turn checks on a live run — the ledger checker
    // (the split) and «every seen roll told» (both modes) — behind the run's budget, as gameplay-service wires them.
    else if (flag === "--app-checks") args.appChecks = true;
    else if (flag === "--verbose") args.verbose = true;
    else throw Error(`unknown argument ${flag}`);
  }
  if (args.writer && !["opus", "fable"].includes(args.writer)) throw Error("--writer must be opus or fable");
  if (args.bookkeeper && !["opus", "sonnet"].includes(args.bookkeeper.model)) throw Error("--bookkeeper must be opus or sonnet, optionally @medium or @high");
  if (args.bookkeeper?.effort && !["medium", "high"].includes(args.bookkeeper.effort)) throw Error("the bookkeeper's effort must be medium or high");
  if (args.bookkeeperSwitch && (!args.bookkeeper || !Number.isInteger(args.bookkeeperSwitch.turn) || args.bookkeeperSwitch.turn < 1 || !["medium", "high"].includes(args.bookkeeperSwitch.effort)))
    throw Error("--bookkeeper-switch N:effort needs --bookkeeper, a turn number and medium or high");
  if ((args.writer || args.bookkeeper) && args.runtime !== "dm-loop-v1") throw Error("--writer and --bookkeeper need --runtime dm-loop-v1");
  if (args.writer === "fable" && !args.bookkeeper) throw Error("a Fable writer needs a bookkeeper (--bookkeeper)");
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
  // Stage 4: the Mega DM campaign and probes are generated from the frozen fixtures.
  if (runtime === "dm-loop-v1") all.push(...(await import("./lib/mega-dm.mjs")).megaDmScenarios());
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
    const selection = loopModels[args.writer ?? args.model];
    // BEDROCK_PROVIDER_1: a Claude model takes the key of the door it goes through.
    const keyName = selection.providerId === "anthropic" ? anthropicKeyName() : selection.key;
    apiKey = args.provider === "live" ? (selection.providerId === "anthropic" ? anthropicKey() : providerKey(keyName)) : "synthetic-eval-only";
    if (!apiKey) throw Error(`live provider needs ${keyName} (environment or .env.local)`);
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
const label = args.runtime === "dm-loop-v1" ? (args.bookkeeper ? `loop-${args.writer ?? args.model}+${args.bookkeeper.model}${args.bookkeeper.effort ? `-${args.bookkeeper.effort}` : ""}` : `loop-${args.model}`) : "astra";
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
  const writerModel = loopModels[args.writer ?? args.model];
  const bookkeeperModel = args.bookkeeper ? loopModels[args.bookkeeper.model] : null;
  write({ type: "run", run: runId, provider: args.provider, runtime: "dm-loop-v1", model: writerModel.modelId,
    writer: writerModel.modelId, bookkeeper: bookkeeperModel ? `${bookkeeperModel.modelId}@${args.bookkeeper.effort ?? bookkeeperModel.defaultEffort}` : null,
    bookkeeperSwitch: args.bookkeeperSwitch ?? null,
    effort, continuationEffort: args.continuationEffort, scenarios: selected.map((s) => s.name), commit: gitCommit(), node: process.version,
    startedAt: new Date().toISOString(), budgetUsd: args.budgetUsd });
  if (args.provider === "live")
    console.log(`Live ${writerModel.modelId} (${effort}${args.continuationEffort ? `, continuations ${args.continuationEffort}` : ""})${bookkeeperModel ? ` writer + ${bookkeeperModel.modelId}@${args.bookkeeper.effort ?? bookkeeperModel.defaultEffort} bookkeeper` : ""} run on dm-loop-v1 with a hard budget of ${args.budgetUsd} USD.`);
  for (const scenario of selected) {
    if (budget?.exhausted) { stopReason = "budget_reached"; break; }
    const script = await loadLoopScript(scenario.name);
    if (args.provider === "fake" && !script && !scenario.loop) {
      process.stdout.write(`▶ ${scenario.name} — no loop script; skipped\n`);
      continue;
    }
    process.stdout.write(`▶ ${scenario.name} — ${scenario.title}\n`);
    const summary = await runLoopScenario({ ...scenario, loop: scenario.loop ?? script ?? {} }, { live: args.provider === "live",
      model: args.model, writer: args.writer, bookkeeper: args.bookkeeper, bookkeeperSwitch: args.bookkeeperSwitch ?? null, effort, continuationEffort: args.continuationEffort, apiKey, budget, write, runId, verbose: args.verbose, maxSteps: args.maxSteps ?? null,
      appChecks: !!args.appChecks && args.provider === "live" });
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
if (args.provider === "live") {
  // Research-grade records (docs/stages/STAGE_4.md): no paid run is thrown away.
  // The committed copy holds the same records (scenario, model, effort, layer
  // hashes, inputs, outputs, receipts, metrics, timings, tokens, cost);
  // scripts/eval/recompute.mjs recomputes the metrics from it.
  const runs = join(root, "docs", "runs");
  await mkdir(runs, { recursive: true });
  await copyFile(outFile, join(runs, `${runId}.jsonl`));
  console.log(`Research record: docs/runs/${runId}.jsonl (commit it)`);
}
