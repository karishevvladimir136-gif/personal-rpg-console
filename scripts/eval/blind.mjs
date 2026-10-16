// Blind comparison samples (Stage 4 §10): six scenes × five model/effort
// variants, the same scripted player inputs, 2–3 turns each, on the live
// game master. Every sample goes to docs/samples/stage-4/blind/<scene>-<id>.json
// with full metadata inside (model, effort, first word, full turns, cost, cache
// share); the file name carries no hint of the variant, so the owner's blind
// page can be built from the files without seeing which is which.
//   node scripts/eval/blind.mjs --budget-usd 12 [--scenes a,b] [--variants opus-high,astra-medium]
// Russian blind test: `--lang ru` plays the scenes of scenarios/blind-ru/ on the
// Russian campaign fixture (scenarios/blind-ru/campaign.json), four variants by
// default (Astra medium is left out), and writes docs/samples/stage-4/blind-ru/
// <scene>-<id>.json with `language: "ru"` and the scene's `keyStep` (the one turn
// the owner's page shows). `--probe` plays only the first turn of each scene and
// variant, writes no samples and prints the narration and any Latin-script words.
//   node scripts/eval/blind.mjs --lang ru --probe --budget-usd 2 --scenes tavern-talk --variants opus-high,astra-high
// (The guard reserves a Russian Astra request's worst case, about $0.8; a cap under ~$2 can refuse a turn's later requests.)
//   node scripts/eval/blind.mjs --lang ru --budget-usd 14
import { randomBytes } from "node:crypto";
import { mkdir, readdir, readFile, writeFile, appendFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { providerKey } from "./lib/keys.mjs";
import { runLoopScenario, createLoopBudget, LOOP_MODELS } from "./lib/loop-harness.mjs";
import { russianVerdict } from "./lib/language.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const VARIANTS = {
  "opus-high": { model: "opus", effort: "high" }, "opus-xhigh": { model: "opus", effort: "xhigh" },
  "astra-high": { model: "astra", effort: "high" }, "astra-xhigh": { model: "astra", effort: "xhigh" }, "astra-medium": { model: "astra", effort: "medium" },
};
const RU_VARIANTS = ["opus-high", "opus-xhigh", "astra-high", "astra-xhigh"];
const args = { budgetUsd: null, scenes: null, variants: null, lang: "en", probe: false };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = () => process.argv[++i];
  if (flag === "--budget-usd") args.budgetUsd = Number(value());
  else if (flag === "--scenes") args.scenes = value().split(",");
  else if (flag === "--variants") args.variants = value().split(",");
  else if (flag === "--lang") args.lang = value();
  else if (flag === "--probe") args.probe = true;
  else throw new Error(`unknown argument ${flag}`);
}
if (!(args.budgetUsd > 0)) throw new Error("--budget-usd N (N > 0) is required");
if (!["en", "ru"].includes(args.lang)) throw new Error("--lang en|ru");
const ru = args.lang === "ru";
args.variants ??= ru ? RU_VARIANTS : Object.keys(VARIANTS);
if (!args.variants.every((v) => VARIANTS[v])) throw new Error(`--variants: ${Object.keys(VARIANTS).join(",")}`);

const folder = join(here, "scenarios", ru ? "blind-ru" : "blind");
// The Russian scenes start from their own campaign fixture, which sits beside them.
const campaign = ru ? JSON.parse(await readFile(join(folder, "campaign.json"), "utf8")) : undefined;
const files = (await readdir(folder)).filter((file) => file.endsWith(".json") && file !== "campaign.json").sort();
const scenes = await Promise.all(files.map(async (file) => ({ name: file.replace(/\.json$/, ""), ...JSON.parse(await readFile(join(folder, file), "utf8")) })));
const selected = args.scenes ? args.scenes.map((name) => scenes.find((s) => s.name === name) ?? (() => { throw new Error(`unknown scene ${name}`); })()) : scenes;
const keys = { anthropic: providerKey("ANTHROPIC_API_KEY"), openai: providerKey("OPENAI_API_KEY") };
const commit = (() => { try { return execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" }).trim(); } catch { return null; } })();
const outDir = join(root, "docs", "samples", "stage-4", ru ? "blind-ru" : "blind");
const runsDir = join(root, "docs", "runs");
if (!args.probe) await mkdir(outDir, { recursive: true });
await mkdir(runsDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
const runId = `${stamp}-blind${ru ? "-ru" : ""}${args.probe ? "-probe" : ""}`;
const recordFile = join(runsDir, `${runId}.jsonl`);
const write = (record) => appendFile(recordFile, `${JSON.stringify(record)}\n`, "utf8");
const budget = createLoopBudget(args.budgetUsd);
await write({ type: "run", run: runId, provider: "live", runtime: "dm-loop-v1",
  purpose: args.probe ? `language probe: first turn only (${args.lang})` : ru ? "Russian blind comparison: key turn per scene" : "blind comparison (Stage 4 §10)",
  ...(ru || args.probe ? { language: args.lang } : {}), scenes: selected.map((s) => s.name),
  variants: args.variants, commit, node: process.version, startedAt: new Date().toISOString(), budgetUsd: args.budgetUsd });
console.log(`Blind ${args.probe ? "probe" : "samples"}${ru ? " (Russian)" : ""}: ${selected.length} scenes × ${args.variants.length} variants, hard budget ${args.budgetUsd} USD.`);

let written = 0;
outer:
for (const scene of selected) {
  for (const variantId of args.variants) {
    if (budget.exhausted) { console.log("Budget reached; stopping."); break outer; }
    const variant = VARIANTS[variantId];
    const selection = LOOP_MODELS[variant.model];
    process.stdout.write(`▶ ${scene.name} · ${variantId}\n`);
    const turns = [];
    const summary = await runLoopScenario(scene, { live: true, model: variant.model, effort: variant.effort, apiKey: keys[selection.providerId],
      budget, runId, campaign, maxTurns: args.probe ? 1 : undefined,
      write: (record) => { write({ ...record, variant: variantId }); if (record.type === "turn") turns.push(record); } });
    if (args.probe) {
      for (const turn of turns) {
        const verdict = russianVerdict(turn.narration, turn.receipts);
        console.log(`  ${turn.step}: ${turn.outcome} · ${(turn.costUsd ?? 0).toFixed(4)} USD · spent ${budget.spentUsd.toFixed(4)} USD`);
        console.log(`  narration:\n${String(turn.narration ?? "").replace(/^/gm, "    ")}`);
        console.log(`  records:\n${turn.receipts.map((r) => `    ${r.result.ok ? "✓" : "✗"} ${r.call.name} ${JSON.stringify(r.call.arguments)}`).join("\n")}`);
        if (ru) console.log(`  fully Russian: ${verdict.fullyRussian ? "yes" : "no"}; Latin in narration: ${verdict.narrationLatin.join(", ") || "none"}; in records: ${verdict.recordsLatin.join(", ") || "none"}`);
      }
      continue;
    }
    const sample = {
      schemaVersion: 1, scene: scene.name, title: scene.title, description: scene.description, createdAt: new Date().toISOString(), commit, run: runId,
      ...(ru ? { language: "ru", keyStep: scene.keyStep } : {}),
      variant: { id: variantId, providerId: selection.providerId, modelId: selection.modelId, effort: variant.effort },
      turns: turns.map((turn) => ({ step: turn.step, input: turn.input, outcome: turn.outcome, narration: turn.narration,
        firstWordMs: turn.firstWordMs, durationMs: turn.durationMs, requests: turn.modelRequests?.total ?? 0, effort: turn.pin?.effort ?? variant.effort,
        tension: turn.pin?.depth?.tension ?? null, tokens: turn.tokens, cacheReadShare: turn.cacheReadShare, costUsd: turn.costUsd,
        tools: turn.effects, layers: (turn.layers ?? []).map(({ index, tokens, hash }) => ({ index, tokens, hash })), diagnostics: turn.diagnostics })),
      totals: { costUsd: Number(turns.reduce((sum, turn) => sum + (turn.costUsd ?? 0), 0).toFixed(5)), committed: turns.filter((turn) => turn.outcome === "committed").length,
        failed: turns.filter((turn) => turn.outcome !== "committed").length, leaks: summary.leaks?.length ?? 0, stopReason: summary.stopReason ?? null },
    };
    const file = join(outDir, `${scene.name}-${randomBytes(3).toString("hex")}.json`);
    await writeFile(file, `${JSON.stringify(sample, null, 2)}\n`, "utf8");
    written++;
    console.log(`  ${sample.totals.committed}/${turns.length} turns committed · ${sample.totals.costUsd.toFixed(4)} USD · spent ${budget.spentUsd.toFixed(4)} USD · ${file.replace(root + "/", "")}`);
    if (ru) {
      // Is the key turn fully Russian (narration and the game master's records)? Kept in the research record.
      const key = turns.find((turn) => turn.step === scene.keyStep);
      const verdict = key ? russianVerdict(key.narration, key.receipts) : null;
      await write({ type: "language", run: runId, scenario: scene.name, variant: variantId, sample: file.replace(root + "/", ""), keyStep: scene.keyStep,
        keyOutcome: key?.outcome ?? "not played", ...(verdict ?? { fullyRussian: false, narrationLatin: [], recordsLatin: [] }) });
      console.log(`  key turn ${scene.keyStep}: ${key?.outcome ?? "not played"} · fully Russian: ${verdict?.fullyRussian ? "yes" : "no"}${verdict && !verdict.fullyRussian ? ` (Latin: ${[...verdict.narrationLatin, ...verdict.recordsLatin].join(", ")})` : ""}`);
    }
  }
}
await write({ type: "end", run: runId, finishedAt: new Date().toISOString(), spentUsd: budget.spentUsd, samples: written, stopReason: budget.exhausted ? "budget_reached" : null });
console.log(`\n${written} samples written; spent ${budget.spentUsd.toFixed(4)} USD of ${args.budgetUsd}. Record: docs/runs/${runId}.jsonl`);
