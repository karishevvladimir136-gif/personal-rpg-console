// The scene branches of the bake-off: each variant plays each scene turn from
// the reference run's saved state before that turn (the same context for every
// variant; one turn each, what the blind page shows).
//   node scripts/eval/dm-arch/scenes.mjs --variants B,C,D --budget-usd 12 [--scenes s01,s05] [--dry]
// Restart-safe: a (scene, variant) pair with a committed turn in any
// docs/runs/dmarch-*-scenes*.jsonl is skipped.
import { appendFile, mkdir, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { providerKey } from "../lib/keys.mjs";
import { anthropicKey } from "../lib/anthropic-endpoint.mjs";
import { loadScenario, playTurn, createLoopBudget, stamp, STATES_DIR, RUNS_DIR, ROOT } from "./lib/harness.mjs";
import { restoreState } from "./lib/fixture.mjs";
import { VARIANTS, SCENES } from "./lib/variants.mjs";
import { openRun } from "./lib/ledger.mjs";

const args = { budgetUsd: null, scenes: SCENES, variants: ["B", "C", "D"], dry: false, tag: null };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = () => process.argv[++i];
  if (flag === "--budget-usd") args.budgetUsd = Number(value());
  else if (flag === "--scenes") args.scenes = value().split(",");
  else if (flag === "--variants") args.variants = value().split(",");
  else if (flag === "--dry") args.dry = true;
  else if (flag === "--tag") args.tag = value(); // e.g. "smoke": the record is kept apart and never counts as a done pair
  else throw new Error(`unknown argument ${flag}`);
}
if (!args.dry && !(args.budgetUsd > 0)) throw new Error("--budget-usd N (N > 0) is required for a live run (or --dry)");
for (const id of args.variants) if (!VARIANTS[id]) throw new Error(`unknown variant ${id}`);
const scenario = await loadScenario();

export async function donePairs() {
  const done = new Set();
  const files = (await readdir(RUNS_DIR)).filter((file) => /^dmarch-.*-scenes.*\.jsonl$/.test(file) && !/-dry|-smoke/.test(file));
  for (const file of files) {
    for (const line of (await readFile(join(RUNS_DIR, file), "utf8")).split("\n")) {
      if (!line.trim()) continue;
      const record = JSON.parse(line);
      if (record.type === "turn" && record.outcome === "committed") done.add(`${record.step}:${record.variant}`);
    }
  }
  return done;
}

const done = args.dry ? new Set() : await donePairs();
const runId = `dmarch-${stamp()}-scenes${args.tag ? `-${args.tag}` : ""}${args.dry ? "-dry" : ""}`;
const recordFile = join(RUNS_DIR, `${runId}.jsonl`);
await mkdir(RUNS_DIR, { recursive: true });
const write = (record) => appendFile(recordFile, `${JSON.stringify(record)}\n`, "utf8");
const commit = (() => { try { return execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim(); } catch { return null; } })();
const apiKeys = args.dry ? {} : { anthropic: anthropicKey(), openai: providerKey("OPENAI_API_KEY") };
if (!args.dry && !apiKeys.anthropic) throw new Error("ANTHROPIC_API_KEY is needed (environment or .env.local)");
const pairs = args.scenes.flatMap((scene) => args.variants.map((variant) => ({ scene, variant }))).filter((p) => !done.has(`${p.scene}:${p.variant}`));
const ledger = args.dry ? null : await openRun(runId, args.budgetUsd, `scene branches ${args.variants.join("")} × ${args.scenes.length} scenes (${pairs.length} pairs)`);
const budget = createLoopBudget(args.dry ? 0 : ledger.budgetUsd);
await write({ type: "run", run: runId, purpose: "DM architecture bake-off: scene branches from the reference states", provider: args.dry ? "dry" : "live",
  scenario: scenario.name, scenes: args.scenes, variants: args.variants, skipped: [...done].filter((pair) => args.scenes.includes(pair.split(":")[0]) && args.variants.includes(pair.split(":")[1])),
  commit, node: process.version, startedAt: new Date().toISOString(), budgetUsd: budget.limitUsd });
console.log(`${args.dry ? "Dry" : "Live"} scene branches: ${pairs.length} (scene, variant) pair(s)${done.size ? `, ${done.size} already done` : ""}${args.dry ? "" : `, hard budget ${budget.limitUsd.toFixed(2)} USD`}.`);

let stopReason = null;
let played = 0;
try {
  for (const { scene, variant: variantId } of pairs) {
    if (budget.exhausted) { stopReason = "budget_reached"; break; }
    const variant = VARIANTS[variantId];
    const step = scenario.steps.find((s) => s.id === scene);
    if (!step) throw new Error(`unknown scene ${scene}`);
    const file = join(STATES_DIR, `before-${scene}.tar.gz`);
    process.stdout.write(`▶ ${scene} · ${variantId} (${variant.label})\n`);
    const c = await restoreState(file);
    try {
      const turn = await playTurn(c, scenario, step, variant, { live: !args.dry, apiKeys, budget, runId, scene: true });
      played++;
      await write({ ...turn, stateFile: file });
      const words = turn.narration ? turn.narration.split(/\s+/).length : 0;
      console.log(`  ${turn.outcome}${turn.pin?.effort ? ` · ${turn.pin.effort}` : ""} · first word ${turn.firstWordMs ?? "–"} ms · text ${turn.textDoneMs ?? "–"} ms · ${(turn.durationMs / 1000).toFixed(1)} s · ${turn.requests} req · ${words} words · ${turn.effects.accepted.length} ok / ${turn.effects.rejected.length} rejected · $${turn.costUsd.toFixed(4)} · spent $${budget.spentUsd.toFixed(4)}${turn.leaks.length ? ` · LEAK ${turn.leaks.length}` : ""}${turn.ledger && !turn.ledger.found ? " · NO LEDGER" : ""}`);
    } finally {
      await c.f.db.close();
    }
  }
} finally {
  await write({ type: "end", run: runId, finishedAt: new Date().toISOString(), stopReason, turns: played, modelRequests: budget.requests, spentUsd: Number(budget.spentUsd.toFixed(5)) });
  if (ledger) await ledger.settle(budget.spentUsd, `docs/runs/${runId}.jsonl`);
}
console.log(`\n${played} turn(s); spent ${budget.spentUsd.toFixed(4)} USD${stopReason ? `; stopped: ${stopReason}` : ""}. Record: docs/runs/${runId}.jsonl`);
