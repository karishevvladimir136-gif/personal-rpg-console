// A continuity run of the bake-off: one variant plays the first turns of the
// Russian harbour replay in sequence on a fresh campaign, so the split's drift
// shows (what the bookkeeper failed to record is missing from the writer's next
// context) and the cache behaves as in a session.
//   node scripts/eval/dm-arch/continuity.mjs --variant C --turns 8 --budget-usd 6 [--dry]
// The record: docs/runs/dmarch-<time>-continuity-<V>.jsonl.
import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { providerKey } from "../lib/keys.mjs";
import { openCampaign, loadScenario, playTurn, createLoopBudget, stamp, RUNS_DIR, ROOT } from "./lib/harness.mjs";
import { VARIANTS } from "./lib/variants.mjs";
import { openRun } from "./lib/ledger.mjs";

const args = { budgetUsd: null, variant: null, turns: 8, dry: false };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = () => process.argv[++i];
  if (flag === "--budget-usd") args.budgetUsd = Number(value());
  else if (flag === "--variant") args.variant = value();
  else if (flag === "--turns") args.turns = Number(value());
  else if (flag === "--dry") args.dry = true;
  else throw new Error(`unknown argument ${flag}`);
}
if (!args.dry && !(args.budgetUsd > 0)) throw new Error("--budget-usd N (N > 0) is required for a live run (or --dry)");
const variant = VARIANTS[args.variant];
if (!variant) throw new Error(`--variant must be one of ${Object.keys(VARIANTS).join(", ")}`);
const scenario = await loadScenario();
const steps = scenario.steps.filter((s) => s.say !== undefined).slice(0, args.turns);
const runId = `dmarch-${stamp()}-continuity-${variant.id}${args.dry ? "-dry" : ""}`;
const recordFile = join(RUNS_DIR, `${runId}.jsonl`);
await mkdir(RUNS_DIR, { recursive: true });
const write = (record) => appendFile(recordFile, `${JSON.stringify(record)}\n`, "utf8");
const commit = (() => { try { return execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim(); } catch { return null; } })();
const apiKeys = args.dry ? {} : { anthropic: providerKey("ANTHROPIC_API_KEY"), openai: providerKey("OPENAI_API_KEY") };
if (!args.dry && !apiKeys.anthropic) throw new Error("ANTHROPIC_API_KEY is needed (environment or .env.local)");
const ledger = args.dry ? null : await openRun(runId, args.budgetUsd, `continuity run ${variant.id} (${steps.length} turns)`);
const budget = createLoopBudget(args.dry ? 0 : ledger.budgetUsd);
await write({ type: "run", run: runId, purpose: "DM architecture bake-off: continuity run", variant: variant.id, label: variant.label,
  provider: args.dry ? "dry" : "live", scenario: scenario.name, steps: steps.map((s) => s.id), commit, node: process.version,
  startedAt: new Date().toISOString(), budgetUsd: budget.limitUsd });
console.log(`${args.dry ? "Dry" : "Live"} continuity run ${variant.id} (${variant.label}), ${steps.length} turn(s)${args.dry ? "" : `, hard budget ${budget.limitUsd.toFixed(2)} USD`}.`);

const c = await openCampaign(scenario);
let stopReason = null;
let played = 0;
try {
  for (const step of steps) {
    if (budget.exhausted) { stopReason = "budget_reached"; break; }
    const turn = await playTurn(c, scenario, step, variant, { live: !args.dry, apiKeys, budget, runId, scene: false });
    played++;
    await write(turn);
    const words = turn.narration ? turn.narration.split(/\s+/).length : 0;
    console.log(`  ${step.id} ${turn.outcome}${turn.pin?.effort ? ` · ${turn.pin.effort}` : ""} · first word ${turn.firstWordMs ?? "–"} ms · text ${turn.textDoneMs ?? "–"} ms · ${(turn.durationMs / 1000).toFixed(1)} s · ${turn.requests} req · ${words} words · ${turn.effects.accepted.length} ok / ${turn.effects.rejected.length} rejected · cache ${turn.cacheReadShare ?? "–"} · $${turn.costUsd.toFixed(4)} · spent $${budget.spentUsd.toFixed(4)}${turn.leaks.length ? ` · LEAK ${turn.leaks.length}` : ""}${turn.ledger && !turn.ledger.found ? " · NO LEDGER" : ""}`);
    if (turn.outcome !== "committed") { stopReason = `turn_${turn.outcome}:${turn.errorCode ?? turn.exception ?? ""}`; break; }
  }
} finally {
  await c.f.db.close();
  await write({ type: "end", run: runId, finishedAt: new Date().toISOString(), stopReason, turns: played, modelRequests: budget.requests, spentUsd: Number(budget.spentUsd.toFixed(5)) });
  if (ledger) await ledger.settle(budget.spentUsd, `docs/runs/${runId}.jsonl`);
}
console.log(`\n${played} turn(s); spent ${budget.spentUsd.toFixed(4)} USD${stopReason ? `; stopped: ${stopReason}` : ""}. Record: docs/runs/${runId}.jsonl`);
