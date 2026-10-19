// The reference run of the bake-off: variant A (Opus 5.5, today's loop) plays
// the Russian harbour replay (scenario 19) in full; before every step the
// campaign's state is dumped to scripts/eval/out/dmarch-states/before-<step>.tar.gz,
// so the scene branches of the other variants start from the same state.
//   node scripts/eval/dm-arch/reference.mjs --budget-usd 9 [--steps s01-s30] [--resume-from s13] [--dry]
// The record: docs/runs/dmarch-<time>-reference-A.jsonl (committed). A restart
// with the states still on disk resumes with --resume-from <first step not played>.
import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { providerKey } from "../lib/keys.mjs";
import { openCampaign, loadScenario, playTurn, createLoopBudget, stamp, STATES_DIR, RUNS_DIR, ROOT } from "./lib/harness.mjs";
import { dumpState, restoreState } from "./lib/fixture.mjs";
import { VARIANTS, SCENES } from "./lib/variants.mjs";
import { openRun } from "./lib/ledger.mjs";

const args = { budgetUsd: null, steps: null, resumeFrom: null, dry: false, variant: "A" };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = () => process.argv[++i];
  if (flag === "--budget-usd") args.budgetUsd = Number(value());
  else if (flag === "--steps") args.steps = value();
  else if (flag === "--resume-from") args.resumeFrom = value();
  else if (flag === "--variant") args.variant = value();
  else if (flag === "--dry") args.dry = true;
  else throw new Error(`unknown argument ${flag}`);
}
if (!args.dry && !(args.budgetUsd > 0)) throw new Error("--budget-usd N (N > 0) is required for a live run (or --dry)");
const variant = VARIANTS[args.variant];
if (!variant) throw new Error(`unknown variant ${args.variant}`);
const scenario = await loadScenario();
const stepRange = (() => {
  if (!args.steps) return scenario.steps;
  const [from, to] = args.steps.split("-");
  const ids = scenario.steps.map((s) => s.id);
  const a = ids.indexOf(from), b = to ? ids.indexOf(to) : a;
  if (a < 0 || b < 0) throw new Error(`unknown steps ${args.steps}`);
  return scenario.steps.slice(a, b + 1);
})();
const startAt = args.resumeFrom ? stepRange.findIndex((s) => s.id === args.resumeFrom) : 0;
if (startAt < 0) throw new Error(`--resume-from ${args.resumeFrom} is not in the step range`);
const runId = `dmarch-${stamp()}-reference-${variant.id}${args.dry ? "-dry" : ""}`;
const recordFile = join(RUNS_DIR, `${runId}.jsonl`);
await mkdir(RUNS_DIR, { recursive: true });
await mkdir(STATES_DIR, { recursive: true });
const write = (record) => appendFile(recordFile, `${JSON.stringify(record)}\n`, "utf8");
const commit = (() => { try { return execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim(); } catch { return null; } })();
const apiKeys = args.dry ? {} : { anthropic: providerKey("ANTHROPIC_API_KEY"), openai: providerKey("OPENAI_API_KEY") };
if (!args.dry && !apiKeys.anthropic) throw new Error("ANTHROPIC_API_KEY is needed (environment or .env.local)");
const ledger = args.dry ? null : await openRun(runId, args.budgetUsd, `reference run ${variant.id} (${scenario.name}${args.resumeFrom ? `, from ${args.resumeFrom}` : ""})`);
const budget = createLoopBudget(args.dry ? 0 : ledger.budgetUsd);
await write({ type: "run", run: runId, purpose: "DM architecture bake-off: reference run", variant: variant.id, label: variant.label,
  provider: args.dry ? "dry" : "live", scenario: scenario.name, steps: stepRange.map((s) => s.id), resumeFrom: args.resumeFrom,
  scenes: SCENES, commit, node: process.version, startedAt: new Date().toISOString(), budgetUsd: budget.limitUsd });
console.log(`${args.dry ? "Dry" : "Live"} reference run ${variant.id} (${variant.label}) on ${scenario.name}, ${stepRange.length - startAt} step(s)${args.dry ? "" : `, hard budget ${budget.limitUsd.toFixed(2)} USD`}.`);

let c = args.resumeFrom ? await restoreState(join(STATES_DIR, `before-${args.resumeFrom}.tar.gz`)) : await openCampaign(scenario);
let stopReason = null;
let played = 0;
try {
  for (const step of stepRange.slice(startAt)) {
    if (budget.exhausted) { stopReason = "budget_reached"; break; }
    if (step.say === undefined) continue;
    const file = join(STATES_DIR, `before-${step.id}.tar.gz`);
    const bytes = await dumpState(c, file);
    const turn = await playTurn(c, scenario, step, variant, { live: !args.dry, apiKeys, budget, runId, scene: SCENES.includes(step.id) });
    played++;
    await write({ ...turn, stateFile: file, stateBytes: bytes });
    const words = turn.narration ? turn.narration.split(/\s+/).length : 0;
    console.log(`  ${step.id} ${turn.outcome}${turn.pin?.effort ? ` · ${turn.pin.effort}` : ""} · first word ${turn.firstWordMs ?? "–"} ms · ${(turn.durationMs / 1000).toFixed(1)} s · ${turn.requests} req · ${words} words · ${turn.effects.accepted.length} ok / ${turn.effects.rejected.length} rejected · $${turn.costUsd.toFixed(4)} · spent $${budget.spentUsd.toFixed(4)}${turn.leaks.length ? ` · LEAK ${turn.leaks.length}` : ""}`);
    if (turn.outcome !== "committed") { stopReason = `turn_${turn.outcome}:${turn.errorCode ?? turn.exception ?? ""}`; break; }
  }
} finally {
  await c.f.db.close();
  await write({ type: "end", run: runId, finishedAt: new Date().toISOString(), stopReason, turns: played, modelRequests: budget.requests, spentUsd: Number(budget.spentUsd.toFixed(5)) });
  if (ledger) await ledger.settle(budget.spentUsd, `docs/runs/${runId}.jsonl`);
}
console.log(`\n${played} turn(s); spent ${budget.spentUsd.toFixed(4)} USD${stopReason ? `; stopped: ${stopReason}` : ""}. Record: docs/runs/${runId}.jsonl`);
