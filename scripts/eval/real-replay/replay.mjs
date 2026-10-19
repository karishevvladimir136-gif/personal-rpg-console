// Polish 3 §4: blind tests of the DM on the owner's own story. Given a campaign, a list of
// turn numbers and variants, the tool reads the state snapshot before each turn through the
// app's server (the only way in — the keys rule is the server's), restores it into an
// isolated in-memory copy (never the live campaign; nothing is written back), plays the
// owner's own line from that turn with each variant (the dice fixed per state), and writes
// blind samples in the bake-off's JSON shape — the variant inside the file, the file name
// silent — with the real previous exchange as «before» context.
//
//   node scripts/eval/real-replay/replay.mjs --base http://127.0.0.1:3100 --campaign <id> --turns 5,8,12
//        --variants A,C,D [--budget-usd N | --dry] [--out docs/samples/real-replay] [--craft live|all|none|session1]
//   node scripts/eval/real-replay/replay.mjs --snapshots <file.json> --turns 1,2 --variants A,D --budget-usd 2
//
// --base: the app that holds the campaign (the owner's sandbox on :3100; the real app on :3000 is
// refused unless RPG_TEST_ALLOW_OWNER_PORT=1). --snapshots: a file of snapshot payloads instead
// (the synthetic campaign of the smoke, written by synthetic.mjs). A cost line is printed before
// a paid run and the guard never lets it cross --budget-usd (or the stage's ledger cap).
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes, randomUUID } from "node:crypto";
import { join } from "node:path";
import { providerKey } from "../lib/keys.mjs";
import { runCampaignTurn, resumeCampaignTurn } from "../../../src/lib/gameplay/dm-loop/two-pass/index.ts";
import { DM_LOOP_DEFAULT_LIMITS } from "../../../src/lib/gameplay/dm-loop/limits.ts";
import { DEFAULT_DEPTH_RANGE } from "../../../src/lib/gameplay/dm-loop/depth.ts";
import { createSnapshotTurnStore, noMemory, seededRandom, snapshotInput } from "../../../src/lib/gameplay/replay/memory-store.ts";
import { buildReplaySample } from "../../../src/lib/gameplay/replay/samples.ts";
import { decodeTurnSnapshot, parseTurnSnapshotPayload } from "../../../src/lib/gameplay/turn-snapshot.ts";
import { VARIANTS, MODELS, createBudget, guardedModel, dryModel } from "./lib/models.mjs";
import { openRun, ROOT } from "./lib/ledger.mjs";
import { craftVariant } from "./lib/craft.mjs";

const args = { base: null, campaign: null, snapshots: null, turns: null, variants: ["A", "D"], budgetUsd: null, dry: false, out: null, craft: "live", maxContinues: 8 };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = () => process.argv[++i];
  if (flag === "--base") args.base = value().replace(/\/$/, "");
  else if (flag === "--campaign") args.campaign = value();
  else if (flag === "--snapshots") args.snapshots = value();
  else if (flag === "--turns") args.turns = value().split(",").map((t) => Number(t.trim())).filter((t) => Number.isInteger(t) && t > 0);
  else if (flag === "--variants") args.variants = value().split(",").map((v) => v.trim()).filter(Boolean);
  else if (flag === "--budget-usd") args.budgetUsd = Number(value());
  else if (flag === "--dry") args.dry = true;
  else if (flag === "--out") args.out = value();
  else if (flag === "--craft") args.craft = value();
  else throw new Error(`unknown argument ${flag}`);
}
if (!args.turns?.length) throw new Error("--turns N,M is required");
if (!args.snapshots && !(args.base && args.campaign)) throw new Error("--base <app> --campaign <id>, or --snapshots <file>, is required");
for (const id of args.variants) if (!VARIANTS[id] && id !== "live") throw new Error(`unknown variant ${id}; variants: ${Object.keys(VARIANTS).join(", ")}, live`);
if (!["live", "all", "none", "session1"].includes(args.craft)) throw new Error("--craft must be live, all, none or session1");
if (!args.dry && !(args.budgetUsd > 0)) throw new Error("--budget-usd N (N > 0) is required for a paid run (or --dry)");
if (args.base) {
  const url = new URL(args.base);
  if ((url.port === "3000" || (!url.port && url.protocol === "http:")) && process.env.RPG_TEST_ALLOW_OWNER_PORT !== "1")
    throw new Error("the owner's app on port 3000 is refused (set RPG_TEST_ALLOW_OWNER_PORT=1 to read its snapshots on purpose)");
}

const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
const runId = `real-replay-${stamp}${args.dry ? "-dry" : ""}`;
const runsDir = join(ROOT, "docs", "runs");
await mkdir(runsDir, { recursive: true });
const recordFile = join(runsDir, `${runId}.jsonl`);
const write = (record) => appendFile(recordFile, `${JSON.stringify(record)}\n`, "utf8");

/** The snapshots: from the app's server (owner-only route), or from a file of payloads. */
async function loadSnapshots() {
  if (args.snapshots) {
    const file = JSON.parse(await readFile(args.snapshots, "utf8"));
    const rows = Array.isArray(file) ? file : file.snapshots;
    return { campaignId: file.campaignId ?? rows[0]?.input?.campaignId ?? "synthetic", title: file.title ?? "synthetic campaign",
      byTurn: new Map(rows.map((row, index) => [row.turnNo ?? index + 1, row.payload ?? row])) };
  }
  const listUrl = `${args.base}/api/campaigns/${encodeURIComponent(args.campaign)}/snapshots`;
  const list = await fetch(listUrl).then(async (response) => { if (!response.ok) throw new Error(`${listUrl}: HTTP ${response.status}`); return response.json(); });
  const byTurn = new Map();
  for (const turnNo of args.turns) {
    const summary = list.snapshots.find((row) => row.turnNo === turnNo);
    if (!summary) { console.log(`turn ${turnNo}: no snapshot (the campaign has ${list.snapshots.length}); skipped`); continue; }
    const row = await fetch(`${listUrl}?operationId=${encodeURIComponent(summary.operationId)}`).then(async (response) => {
      if (!response.ok) throw new Error(`snapshot of turn ${turnNo}: HTTP ${response.status}`); return response.json(); });
    byTurn.set(turnNo, row.encoding === "json" ? parseTurnSnapshotPayload(row.source) : decodeTurnSnapshot(row.source));
  }
  const any = [...byTurn.values()][0];
  return { campaignId: args.campaign, title: any?.source.snapshot.campaign.title ?? args.campaign, byTurn };
}

const snapshots = await loadSnapshots();
const turns = args.turns.filter((turnNo) => snapshots.byTurn.has(turnNo));
if (!turns.length) throw new Error("no snapshot to replay");
const variants = args.variants.map((id) => {
  if (id !== "live") return VARIANTS[id];
  // The campaign's own choice at the turn: from the first snapshot's settings (null split: today's loop).
  const settings = snapshots.byTurn.get(turns[0])?.settings ?? null;
  const split = settings?.split ?? null;
  const writer = split ? Object.values(MODELS).find((m) => m.modelId === split.writer.modelId) ?? MODELS.opus : MODELS.opus;
  return { id: "live", label: split ? `the campaign's pair: ${writer.label} + ${split.bookkeeper.modelId}` : "the campaign's loop (Opus 5.5)",
    runtime: split ? "two-pass" : "single", writer, effort: split?.writer.reasoning ?? settings?.dmTurn?.reasoning ?? "high",
    bookkeeper: split ? { providerId: "anthropic", modelId: split.bookkeeper.modelId, effort: split.bookkeeper.reasoning ?? "high", label: split.bookkeeper.modelId } : null, usdPerTurn: 0.30 };
});
const estimate = turns.length * variants.reduce((sum, v) => sum + v.usdPerTurn, 0);
console.log(`${args.dry ? "Dry" : "Paid"} replay of ${turns.length} turn(s) × ${variants.length} variant(s) [${variants.map((v) => v.id).join(", ")}] on «${snapshots.title}»` +
  `${args.dry ? "" : `: estimated $${estimate.toFixed(2)} (bake-off $/turn), hard budget $${args.budgetUsd.toFixed(2)}`}; craft set: ${args.craft}.`);

const apiKey = args.dry ? null : providerKey("ANTHROPIC_API_KEY");
if (!args.dry && !apiKey) throw new Error("ANTHROPIC_API_KEY is needed (environment or .env.local)");
const ledger = args.dry ? null : await openRun(runId, args.budgetUsd, `real replay: ${turns.length} turns × ${variants.map((v) => v.id).join("+")} on ${snapshots.title}`);
const budget = createBudget(args.dry ? 0 : ledger.budgetUsd);
const outDir = args.out ? join(ROOT, args.out) : join(ROOT, "docs", "samples", "real-replay", String(snapshots.campaignId).slice(0, 8));
await mkdir(outDir, { recursive: true });
await write({ type: "run", run: runId, purpose: "polish 3 §4: blind samples on the owner's own turns", campaignId: snapshots.campaignId, title: snapshots.title,
  turns, variants: variants.map((v) => v.id), craft: args.craft, dry: args.dry, startedAt: new Date().toISOString(), budgetUsd: budget.limitUsd });

let stopReason = null;
const written = [];
try {
  for (const turnNo of turns) {
    const payload = snapshots.byTurn.get(turnNo);
    for (const variant of variants) {
      if (!args.dry && budget.exhausted) { stopReason = "budget_reached"; break; }
      const record = await playVariant(payload, turnNo, variant);
      await write(record);
      if (record.outcome === "committed" && record.narration) {
        const sample = buildReplaySample(payload, record, { language: payload.source.snapshot.settings.values.language === "ru" ? "ru" : "en", campaignTitle: snapshots.title });
        const file = join(outDir, `t${String(turnNo).padStart(2, "0")}-${randomBytes(3).toString("hex")}.json`);
        await writeFile(file, `${JSON.stringify(sample, null, 2)}\n`, "utf8");
        written.push(file);
      }
      console.log(`  turn ${turnNo} · ${variant.id}: ${record.outcome} · first word ${record.firstWordMs ?? "–"} ms · text ${record.textDoneMs ?? "–"} ms · records ${record.recordsDoneMs ?? "–"} ms` +
        ` · $${record.costUsd.toFixed(4)} · ${record.receipts.filter((r) => r.result.ok).length} accepted, ${record.receipts.filter((r) => !r.result.ok).length} rejected${record.outcome !== "committed" ? ` · ${record.errorCode ?? ""} ${record.exception ?? ""}` : ""}`);
    }
    if (stopReason) break;
  }
} finally {
  await write({ type: "end", run: runId, finishedAt: new Date().toISOString(), stopReason, modelRequests: budget.requests, spentUsd: Number(budget.spentUsd.toFixed(5)), samples: written.length });
  if (ledger) await ledger.settle(budget.spentUsd, `docs/runs/${runId}.jsonl`);
}
await writeFile(join(outDir, "README.md"), `# Real replay — blind samples («${snapshots.title}»)

One file per turn × variant: the owner's own line from that turn, played from the state before it (the live campaign
untouched), with the real previous exchange as «before» context. The file name carries no hint of the variant; the
variant (writer, bookkeeper, effort, craft set), the timings, the tokens, the cost and the accepted records are inside
each file. ${written.length} sample(s) over ${turns.length} turn(s). Written by \`node scripts/eval/real-replay/replay.mjs\`; the record is
\`docs/runs/${runId}.jsonl\`.
`, "utf8");
console.log(`\n${written.length} sample(s) in ${outDir.replace(`${ROOT}/`, "")}; spent ${budget.spentUsd.toFixed(4)} USD${stopReason ? `; stopped: ${stopReason}` : ""}. Record: docs/runs/${runId}.jsonl`);

/** One turn of one variant on an isolated copy of the snapshot. */
async function playVariant(payload, turnNo, variant) {
  const crafted = craftVariant(payload, args.craft);
  const store = createSnapshotTurnStore(crafted);
  const transport = [];
  const writerLive = args.dry ? null : guardedModel(variant.writer, budget, apiKey, transport);
  const bookkeeperLive = !args.dry && variant.bookkeeper ? guardedModel(variant.bookkeeper, budget, apiKey, transport) : null;
  const writerModel = args.dry ? dryModel(variant.writer, "writer") : writerLive.model;
  const bookkeeperModel = variant.bookkeeper ? (args.dry ? dryModel(variant.bookkeeper, "bookkeeper") : bookkeeperLive.model) : null;
  const input = snapshotInput(crafted);
  const operationId = input.operationId;
  const settle = (modelId, costUsd) => {
    if (args.dry) return;
    if (bookkeeperLive && variant.bookkeeper && modelId === variant.bookkeeper.modelId && modelId !== variant.writer.modelId) bookkeeperLive.settle(costUsd);
    else writerLive.settle(costUsd);
  };
  const observations = [];
  let firstWordAt = null;
  const started = performance.now();
  const split = variant.bookkeeper ? { writer: { providerId: variant.writer.providerId, modelId: variant.writer.modelId, reasoning: variant.effort },
    bookkeeper: { providerId: variant.bookkeeper.providerId, modelId: variant.bookkeeper.modelId, reasoning: variant.bookkeeper.effort } } : null;
  const deps = {
    store, memory: noMemory, summaries: { summarize: async () => { throw new Error("replay: no summaries"); } },
    model: () => writerModel,
    bookkeeperModel: () => bookkeeperModel,
    split, ...(split ? { bookkeeper: { providerId: split.bookkeeper.providerId, modelId: split.bookkeeper.modelId, effort: split.bookkeeper.reasoning } } : {}),
    pin: async () => ({ providerId: variant.writer.providerId, modelId: variant.writer.modelId, effort: variant.effort,
      limits: crafted.settings?.limits ?? DM_LOOP_DEFAULT_LIMITS, depth: variant.writer.modelId === MODELS.fable.modelId ? null : (crafted.settings?.depth ?? DEFAULT_DEPTH_RANGE), boostNext: false }),
    random: seededRandom(operationId),
    observe: (observation) => {
      observations.push(observation);
      if (observation.type === "live" && observation.event.type === "text" && observation.event.text.trim() && firstWordAt === null) firstWordAt = performance.now();
      if (observation.type === "request_finished") settle(observation.usage.modelId, observation.usage.costUsd);
      if (!args.dry && observation.type === "failure") { writerLive.abandon(); bookkeeperLive?.abandon(); }
    },
  };
  let result = null, thrown = null, continues = 0;
  try {
    result = await runCampaignTurn(input, deps);
    while (result.status === "awaiting_confirmation" && continues < args.maxContinues) {
      continues++;
      result = await resumeCampaignTurn({ commandId: randomUUID(), campaignId: input.campaignId, operationId, timeline: input.timeline, action: "continue", checkId: null }, deps);
    }
  } catch (error) { thrown = error; }
  const durationMs = Math.round(performance.now() - started);
  const checkpoint = store.lastCheckpoint();
  const loop = checkpoint?.dmLoop ?? null;
  const usage = observations.filter((o) => o.type === "request_finished").map((o) => o.usage);
  const sum = (key) => usage.reduce((total, entry) => total + (entry[key] ?? 0), 0);
  const twoPass = observations.filter((o) => o.type === "two_pass");
  const textDone = twoPass.find((o) => o.event === "writer_finished")?.atMs ?? null;
  return {
    type: "turn", run: runId, campaignId: snapshots.campaignId, operationId, turnNo, input: input.input,
    variant: { id: variant.id, label: variant.label, runtime: variant.runtime, writer: `${variant.writer.providerId}/${variant.writer.modelId}`,
      bookkeeper: variant.bookkeeper ? `${variant.bookkeeper.providerId}/${variant.bookkeeper.modelId}@${variant.bookkeeper.effort}` : null, effort: variant.effort, craft: args.craft },
    outcome: result?.status ?? "error", continues, errorCode: result?.failure ?? (thrown ? thrown.code ?? "exception" : null), exception: thrown ? String(thrown.message).slice(0, 200) : null,
    failure: observations.filter((o) => o.type === "failure").map((o) => ({ code: o.code, message: o.message })),
    narration: result?.status === "committed" ? result.narration : null,
    firstWordMs: firstWordAt === null ? null : Math.round(firstWordAt - started), textDoneMs: variant.runtime === "two-pass" ? textDone : (result?.status === "committed" ? durationMs : null),
    recordsDoneMs: result?.status === "committed" ? durationMs : null, durationMs, requests: usage.length,
    costUsd: args.dry ? 0 : Number(sum("costUsd").toFixed(5)), cacheReadShare: sum("inputTokens") ? Number((sum("cacheReadTokens") / sum("inputTokens")).toFixed(3)) : null,
    tokens: { input: sum("inputTokens"), output: sum("outputTokens"), cached: sum("cacheReadTokens"), cacheWrite: sum("cacheWriteTokens"), cacheWrite1h: sum("cacheWrite1hTokens") },
    usage, receipts: loop?.receipts ?? [], diagnostics: loop?.diagnostics ?? [], effort: loop?.pin?.effort ?? null, tension: loop?.pin?.depth?.tension ?? null,
    ledger: twoPass.find((o) => o.event === "writer_finished")?.ledger ?? null, transport: transport.map((t) => ({ ...t })),
  };
}
