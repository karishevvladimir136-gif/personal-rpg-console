// Integration smoke (docs/stages/INTEGRATION.md §5): a few live turns per model on the
// merged code — Stage 4's loop on a fresh PGlite campaign — with a Stage V live frame
// after every committed turn: the shot by the small model, the picture by fal through
// the real picture job (the row in rpg_pictures, the image to a local folder). Paid;
// every request is reserved against the cap before it is sent. Keys come from the
// environment or .env.local and are never printed. Nothing touches the owner's database.
//   node scripts/eval/live-frames-smoke.mjs --budget-usd 5 [--models opus,astra] [--turns 6] [--style oil] [--out <folder>]
import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { runLoopScenario, createLoopBudget, LOOP_MODELS } from "./lib/loop-harness.mjs";
import { providerKey } from "./lib/keys.mjs";
import { anthropicKey } from "./lib/anthropic-endpoint.mjs";
import { createPictureRow, runPictureJob } from "../../src/lib/visual-frame/picture-job.ts";
import { fallbackShot, firstParagraph, framePrompt, shotEntityIds } from "../../src/lib/visual-frame/shot.ts";
import { modelForTier, pictureCostUsdMicros, STYLE_PRESETS } from "../../src/lib/visual-frame/pictures.ts";
import { usd } from "../../src/lib/visual-frame/fal-image.ts";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only" ? { url: "data:text/javascript,export%20{}", shortCircuit: true } : nextResolve(specifier, context);
} });
const { buildShot } = await import("../../src/lib/server/media/shot-model.ts");
hook.deregister();

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const args = { budgetUsd: null, models: ["opus", "astra"], turns: 6, style: "oil", out: null };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = () => process.argv[++i];
  if (flag === "--budget-usd") args.budgetUsd = Number(value());
  else if (flag === "--models") args.models = value().split(",");
  else if (flag === "--turns") args.turns = Number(value());
  else if (flag === "--style") args.style = value();
  else if (flag === "--out") args.out = value();
  else throw new Error(`unknown argument ${flag}`);
}
if (!(args.budgetUsd > 0)) throw new Error("--budget-usd N (N > 0) is required");
if (!args.models.every((model) => LOOP_MODELS[model])) throw new Error(`--models: ${Object.keys(LOOP_MODELS).join(",")}`);
const style = STYLE_PRESETS.find((row) => row.key === args.style) ?? (() => { throw new Error(`unknown style ${args.style}`); })();
const keys = { anthropic: anthropicKey(), openai: providerKey("OPENAI_API_KEY"), fal: providerKey("FAL_KEY") };
if (!keys.fal) throw new Error("FAL_KEY is missing (frames)");
for (const model of args.models) if (!keys[LOOP_MODELS[model].providerId]) throw new Error(`${LOOP_MODELS[model].key} is missing`);
const commit = (() => { try { return execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" }).trim(); } catch { return null; } })();
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 16);
const runsDir = join(root, "docs", "runs");
const imagesDir = args.out ?? join(root, "test-results", "live-frames-smoke", stamp);
mkdirSync(runsDir, { recursive: true });
mkdirSync(imagesDir, { recursive: true });

// The cap, shared by the turns (the harness reserves the worst case of every request) and the frames.
const capMicros = Math.round(args.budgetUsd * 1_000_000);
const ledger = { spentMicros: 0, reservedMicros: 0, entries: [] };
const remainingMicros = () => capMicros - ledger.spentMicros - ledger.reservedMicros;
function reserve(kind, micros, note) {
  if (micros > remainingMicros()) throw new Error(`budget: ${note} would cross the ${usd(capMicros)} cap (spent ${usd(ledger.spentMicros)})`);
  const entry = { kind, note, micros, settled: false };
  ledger.reservedMicros += micros;
  ledger.entries.push(entry);
  return entry;
}
function settle(entry, micros) {
  ledger.reservedMicros -= entry.micros;
  ledger.spentMicros += micros;
  entry.micros = micros;
  entry.settled = true;
}
const SHOT_RESERVE = 3_000;

// The same six player lines for every model, generic enough for any opening.
const LINES = [
  "I look around, take in the place and the people, and ask the nearest person what is going on here.",
  "I introduce myself and ask whether anyone needs a pair of hands for honest pay.",
  "I accept the first real offer and ask what exactly must be done, and by when.",
  "I set out at once and keep my eyes open on the way.",
  "I deal with whatever stands in my way — carefully, without rushing in.",
  "I come back, report what happened and ask for what I was promised.",
];
const scenario = (name) => ({ name, title: `Integration live smoke · ${name}`, steps: LINES.slice(0, args.turns).map((say, index) => ({ id: `t${index + 1}`, say })) });

const median = (list) => { const sorted = list.filter((value) => typeof value === "number").sort((a, b) => a - b); return sorted.length ? sorted[Math.floor(sorted.length / 2)] : null; };
const max = (list) => { const values = list.filter((value) => typeof value === "number"); return values.length ? Math.max(...values) : null; };

/** A live frame of the committed turn, the way the app draws it: first paragraph → shot → prompt → row → fal → storage. */
async function frameAfterTurn({ c, f, cid, hero, input, result }) {
  if (result?.status !== "committed" || !result.narration) return { frame: { status: "skipped", reason: result?.status ?? "error" } };
  const started = performance.now();
  const state = await c.state();
  const place = state.locations.find((row) => row.id === state.publicState?.current_location_id) ?? null;
  const paragraph = firstParagraph(result.narration, true);
  if (!paragraph) return { frame: { status: "no_text" } };
  const context = { heroName: state.entities.find((row) => row.id === hero)?.name ?? null, names: state.entities.map((row) => row.name), placeName: place?.name ?? null, language: "en" };
  const shotEntry = reserve("shot", SHOT_RESERVE, `shot ${input.operationId}`);
  const built = await buildShot(keys.anthropic ?? "", paragraph, context);
  settle(shotEntry, built.costUsdMicros);
  const shot = built.shot ?? fallbackShot(paragraph, context);
  const people = shotEntityIds(shot, state.entities).map((id) => state.entities.find((row) => row.id === id)?.name).filter(Boolean);
  const prompt = framePrompt(shot, style.text, { people: [], place: null, style: false }, {});
  const model = modelForTier("fast");
  const falEntry = reserve("fal", pictureCostUsdMicros("fast", "frame", model), `frame ${input.operationId}`);
  const ctx = {
    campaignId: cid,
    rpc: async (action, payload = {}) => (await f.one("select public.rpg_pictures($1,$2,$3,$4::jsonb) result", [f.owner, cid, action, JSON.stringify(payload)])).result,
    storage: { put: async (path, bytes) => { writeFileSync(join(imagesDir, path.replaceAll("/", "_")), bytes); }, get: async () => null },
    sha256: (bytes) => createHash("sha256").update(bytes).digest("hex"),
    log: () => {},
  };
  let done;
  try {
    const row = await createPictureRow(ctx, { id: randomUUID(), kind: "frame", subjectKind: "turn", subjectId: input.operationId, composition: "frame", timeline: await f.fence(cid),
      tier: "fast", trigger: "live", model, styleVersionId: null, shot: { ...shot, meta: { source: built.source } }, prompt, referenceIds: [] });
    done = await runPictureJob(ctx, row.id, { apiKey: keys.fal, extraCostUsdMicros: built.costUsdMicros });
  } catch (error) {
    settle(falEntry, falEntry.micros);
    return { frame: { status: "error", error: String(error.message).slice(0, 200), shotSource: built.source, shotMs: built.elapsedMs, frameMs: Math.round(performance.now() - started) } };
  }
  settle(falEntry, Math.max(0, (done.costUsdMicros ?? 0) - built.costUsdMicros));
  return { frame: { status: done.status, error: done.error, shotSource: built.source, shotMs: built.elapsedMs, falMs: done.elapsedMs,
    frameMs: Math.round(performance.now() - started), costUsd: usd(done.costUsdMicros ?? 0), width: done.width, height: done.height, people, paragraphChars: paragraph.length,
    file: done.storagePath ? done.storagePath.replaceAll("/", "_") : null } };
}

const summaries = [];
for (const model of args.models) {
  const selection = LOOP_MODELS[model];
  const framesReserve = args.turns * (pictureCostUsdMicros("fast", "frame") + SHOT_RESERVE);
  const turnsCapMicros = remainingMicros() - framesReserve;
  if (turnsCapMicros <= 0) { console.log(`${model}: no budget left for turns`); break; }
  const budget = createLoopBudget(turnsCapMicros / 1_000_000);
  const file = join(runsDir, `${stamp}-integration-live-frames-${model}.jsonl`);
  const records = [];
  const write = (record) => { records.push(record); appendFileSync(file, JSON.stringify(record) + "\n"); };
  console.log(`${model} (${selection.providerId}/${selection.modelId}, ${selection.defaultEffort}): ${args.turns} turns, turns cap ${usd(turnsCapMicros)}, frames by ${modelForTier("fast")} in «${style.key}»`);
  const started = performance.now();
  const summary = await runLoopScenario(scenario(model), { write, runId: `${stamp}-live-frames`, live: true, model, effort: selection.defaultEffort, budget, apiKey: keys[selection.providerId], afterTurn: frameAfterTurn });
  // The turns' real spend goes to the shared ledger (the harness reserved worst cases inside its own budget).
  const turnMicros = Math.round(budget.spentUsd * 1_000_000);
  ledger.spentMicros += turnMicros;
  ledger.entries.push({ kind: "turns", note: model, micros: turnMicros, settled: true });
  const turns = records.filter((record) => record.type === "turn");
  const frames = turns.map((record) => record.frame ?? null);
  const row = {
    model, modelId: `${selection.providerId}/${selection.modelId}`, effort: selection.defaultEffort, commit,
    turns: turns.length, committed: turns.filter((record) => record.outcome === "committed").length,
    firstWordMs: { median: median(turns.map((record) => record.firstWordMs)), max: max(turns.map((record) => record.firstWordMs)) },
    fullTurnMs: { median: median(turns.map((record) => record.durationMs)), max: max(turns.map((record) => record.durationMs)) },
    frames: { ready: frames.filter((frame) => frame?.status === "ready").length, failed: frames.filter((frame) => frame && frame.status !== "ready").map((frame) => frame.status + (frame.error ? `: ${frame.error}` : "")),
      frameMs: { median: median(frames.map((frame) => frame?.frameMs)), max: max(frames.map((frame) => frame?.frameMs)) },
      shotMs: median(frames.map((frame) => frame?.shotMs)), falMs: median(frames.map((frame) => frame?.falMs)), shotSources: frames.map((frame) => frame?.shotSource ?? null) },
    costUsd: { turns: Number(turns.reduce((sum, record) => sum + (record.costUsd ?? 0), 0).toFixed(5)),
      frames: Number(frames.reduce((sum, frame) => sum + (frame?.costUsd ? Number(frame.costUsd.replace("$", "")) : 0), 0).toFixed(5)) },
    cacheReadShare: median(turns.map((record) => record.cacheReadShare)),
    leaks: summary.leaks, rpcErrors: summary.rpcErrors, stopReason: summary.stopReason, totalMs: Math.round(performance.now() - started), records: file.replace(root + "/", ""),
  };
  summaries.push(row);
  console.log(`  ${row.committed}/${row.turns} committed · first word ${row.firstWordMs.median} ms (max ${row.firstWordMs.max}) · full turn ${row.fullTurnMs.median} ms (max ${row.fullTurnMs.max})`);
  console.log(`  frames ${row.frames.ready}/${row.turns} ready · frame ${row.frames.frameMs.median} ms (max ${row.frames.frameMs.max}; shot ${row.frames.shotMs} ms, fal ${row.frames.falMs} ms) · turns ${row.costUsd.turns} USD · frames ${row.costUsd.frames} USD`);
  if (row.frames.failed.length) console.log(`  frame failures: ${row.frames.failed.join("; ")}`);
}
const out = { type: "integration-live-frames-smoke", at: new Date().toISOString(), commit, capUsd: args.budgetUsd, spentUsd: Number((ledger.spentMicros / 1_000_000).toFixed(5)),
  style: style.key, frameModel: modelForTier("fast"), imagesDir: imagesDir.replace(root + "/", ""), models: summaries, ledger: ledger.entries };
const summaryFile = join(runsDir, `${stamp}-integration-live-frames-summary.json`);
writeFileSync(summaryFile, JSON.stringify(out, null, 2) + "\n");
console.log(`spent ${usd(ledger.spentMicros)} of ${usd(capMicros)} · summary ${summaryFile.replace(root + "/", "")} · images ${out.imagesDir}`);
if (!existsSync(summaryFile)) process.exitCode = 1;
