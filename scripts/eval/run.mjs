// Evaluation bench for the DM turn path.
//   node scripts/eval/run.mjs --scenario <name|all|a,b> [--provider fake|live] [--budget-usd N] [--verbose]
// Every scenario starts from a freshly created campaign on a disposable PGlite
// database. Metrics go to scripts/eval/out/<run>.jsonl (git-ignored).
import { mkdir, readdir, readFile, appendFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createFakeOpenAi, createLiveOpenAi, ASTRA_PRICE } from "./lib/openai.mjs";
import { formatReport, loadRun } from "./report.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");

function parseArgs(argv) {
  const args = { provider: "fake", scenario: null, budgetUsd: null, verbose: false };
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
    else if (flag === "--verbose") args.verbose = true;
    else throw Error(`unknown argument ${flag}`);
  }
  if (!args.scenario) throw Error("--scenario is required (a name from scripts/eval/scenarios, a comma list, or all)");
  if (!["fake", "live"].includes(args.provider)) throw Error("--provider must be fake or live");
  if (args.provider === "live" && !(Number.isFinite(args.budgetUsd) && args.budgetUsd > 0))
    throw Error("--provider live requires --budget-usd N with N > 0");
  return args;
}

/** OPENAI_API_KEY from the environment or .env.local; the value is never printed. */
function openAiKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  const file = join(root, ".env.local");
  if (!existsSync(file)) return null;
  const line = readFileSync(file, "utf8").split(/\r?\n/).find((entry) => /^\s*OPENAI_API_KEY\s*=/.test(entry));
  return line ? line.replace(/^\s*OPENAI_API_KEY\s*=\s*/, "").replace(/^["']|["']$/g, "").trim() || null : null;
}

async function scenarios(selection) {
  const folder = join(here, "scenarios");
  const available = (await readdir(folder)).filter((file) => file.endsWith(".json")).sort();
  const names = selection === "all" ? available.map((file) => file.replace(/\.json$/, ""))
    : selection.split(",").map((name) => name.trim()).filter(Boolean);
  return Promise.all(names.map(async (name) => {
    const file = join(folder, `${name}.json`);
    if (!existsSync(file)) throw Error(`unknown scenario ${name}; available: ${available.join(", ")}`);
    return { name, ...JSON.parse(await readFile(file, "utf8")) };
  }));
}

function gitCommit() {
  try { return execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" }).trim(); }
  catch { return null; }
}

let args, selected, apiKey;
try {
  args = parseArgs(process.argv.slice(2));
  selected = await scenarios(args.scenario);
  apiKey = args.provider === "live" ? openAiKey() : "synthetic-eval-only";
  if (!apiKey) throw Error("live provider needs OPENAI_API_KEY (environment or .env.local)");
} catch (error) {
  console.error(`eval: ${error.message}`);
  console.error("usage: node scripts/eval/run.mjs --scenario <name|all|a,b> [--provider fake|live] [--budget-usd N] [--verbose]");
  process.exit(2);
}
const requestLog = [];
const transport = args.provider === "live"
  ? createLiveOpenAi(requestLog, args.budgetUsd) : createFakeOpenAi(requestLog);
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
const runId = `${stamp}-${args.provider}-${args.scenario === "all" ? "all" : selected.map((s) => s.name).join("+")}`.slice(0, 120);
const outDir = join(here, "out");
await mkdir(outDir, { recursive: true });
const outFile = join(outDir, `${runId}.jsonl`);
let writeChain = Promise.resolve();
const write = (record) => {
  writeChain = writeChain.then(() => appendFile(outFile, `${JSON.stringify(record)}\n`, "utf8"));
  return writeChain;
};

// The harness imports the turn path lazily so argument errors stay cheap.
const { runScenario } = await import("./lib/harness.mjs");
write({ type: "run", run: runId, provider: args.provider, scenarios: selected.map((s) => s.name),
  commit: gitCommit(), node: process.version, startedAt: new Date().toISOString(),
  budgetUsd: args.budgetUsd, price: args.provider === "live" ? ASTRA_PRICE : null });
if (args.provider === "live")
  console.log(`Live gpt-6-astra run with a hard budget of ${args.budgetUsd} USD.`);
let stopReason = null;
for (const scenario of selected) {
  if (transport.budget?.exhausted) { stopReason = "budget_reached"; break; }
  process.stdout.write(`▶ ${scenario.name} — ${scenario.title}\n`);
  const summary = await runScenario(scenario, { transport, apiKey, write, verbose: args.verbose,
    runId, requestLog });
  process.stdout.write(`  ${summary.passed ? "PASS" : "FAIL"} checks ${summary.checksPassed}/${summary.checksTotal}` +
    `${summary.probesTotal ? `, probes ${summary.probesPassed}/${summary.probesTotal}` : ""}` +
    ` · ${summary.turns} turns · ${(summary.totalMs / 1000).toFixed(1)} s\n`);
  stopReason ??= summary.stopReason;
}
write({ type: "end", run: runId, finishedAt: new Date().toISOString(), stopReason,
  modelRequests: requestLog.length,
  spentUsd: transport.budget?.spentUsd ?? 0 });
await writeChain;
console.log(`\n${formatReport(await loadRun(outFile))}`);
console.log(`\nMetrics: ${outFile}`);
