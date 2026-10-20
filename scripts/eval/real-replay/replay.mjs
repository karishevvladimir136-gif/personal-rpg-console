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
//        [--voice live|off|layer|five|all] [--examples-file <path outside the repo>] [--ledger voice|polish3] [--no-quotable]
//   node scripts/eval/real-replay/replay.mjs --snapshots <file.json> --turns 1,2 --variants A,D --budget-usd 2
//
// --base: the app that holds the campaign (the owner's sandbox on :3100; the real app on :3000 is
// refused unless RPG_TEST_ALLOW_OWNER_PORT=1). --snapshots: a file of snapshot payloads instead
// (the synthetic campaign of the smoke, written by synthetic.mjs). A cost line is printed before
// a paid run and the guard never lets it cross --budget-usd (or the stage's ledger cap).
// Voice stage part 7: --voice picks the voice variant (live: as the turn had it; off: the prompt
// before the voice stage; layer: the layer and the reminder; five / all: the layer plus the
// examples of --examples-file, read at run time from outside the repository and never copied into
// a record or a sample — the sample carries the variant's label and the passage count only).
// After every committed turn of a paid run the quotable-line check (Haiku, part 5) reads the
// narration's NPC lines; its flags go into the record and the sample for the metrics (--no-quotable skips it).
// Fix run: --continuation same|lighter, --memory compact|standard|wide, --instructions ru|en set the DM options;
// --label names the run's arm; --cache-salt <word> starts the arm from a cold provider cache; --ledger-check on|off (A6: the split's in-turn checker, and a residual check
// of every committed turn in both modes).
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes, randomUUID } from "node:crypto";
import { join, resolve } from "node:path";
import { providerKey } from "../lib/keys.mjs";
import { runCampaignTurn, resumeCampaignTurn } from "../../../src/lib/gameplay/dm-loop/two-pass/index.ts";
import { DM_LOOP_DEFAULT_LIMITS } from "../../../src/lib/gameplay/dm-loop/limits.ts";
import { DEFAULT_DEPTH_RANGE } from "../../../src/lib/gameplay/dm-loop/depth.ts";
import { createSnapshotTurnStore, noMemory, seededRandom, snapshotInput } from "../../../src/lib/gameplay/replay/memory-store.ts";
import { buildReplaySample } from "../../../src/lib/gameplay/replay/samples.ts";
import { checkQuotableLines } from "../../../src/lib/gameplay/dm-loop/quotable.ts";
import { checkLedger, ledgerCheckState } from "../../../src/lib/gameplay/dm-loop/ledger-check.ts";
import { VARIANTS, MODELS, createBudget, guardedModel, dryModel } from "./lib/models.mjs";
import { openRun, ROOT, LEDGERS, DEFAULT_LEDGER } from "./lib/ledger.mjs";
import { craftVariant } from "./lib/craft.mjs";
import { readExamplesFile, voiceVariant, VOICE_VARIANTS } from "./lib/voice.mjs";
import { snapshotListOf, snapshotPayloadOf } from "./lib/snapshots.mjs";

const args = { base: null, campaign: null, snapshots: null, turns: null, variants: ["A", "D"], budgetUsd: null, dry: false, out: null, craft: "live", maxContinues: 8,
  // Fix run: «Продолжение хода», «Память ведущего», «Инструкции ведущего» (null: as the snapshot has them).
  continuation: null, memory: null, instructions: null, label: null,
  // Fix run A6: the ledger checker — in the split's runtime (as the app runs it) and once more on every committed
  // turn of either mode («post»: the residual misses, the same measure for both modes); «off»: neither.
  ledgerCheck: "on", cacheSalt: null,
  voice: "live", examplesFile: null, ledger: DEFAULT_LEDGER, quotable: true };
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
  else if (flag === "--continuation") args.continuation = value();
  else if (flag === "--memory") args.memory = value();
  else if (flag === "--instructions") args.instructions = value();
  else if (flag === "--label") args.label = value();
  else if (flag === "--ledger-check") args.ledgerCheck = value();
  else if (flag === "--cache-salt") args.cacheSalt = value();
  else if (flag === "--voice") args.voice = value();
  else if (flag === "--examples-file") args.examplesFile = value();
  else if (flag === "--ledger") args.ledger = value();
  else if (flag === "--no-quotable") args.quotable = false;
  else throw new Error(`unknown argument ${flag}`);
}
if (!args.turns?.length) throw new Error("--turns N,M is required");
if (!args.snapshots && !(args.base && args.campaign)) throw new Error("--base <app> --campaign <id>, or --snapshots <file>, is required");
for (const id of args.variants) if (!VARIANTS[id] && id !== "live") throw new Error(`unknown variant ${id}; variants: ${Object.keys(VARIANTS).join(", ")}, live`);
if (!["live", "all", "none", "session1"].includes(args.craft)) throw new Error("--craft must be live, all, none or session1");
if (args.continuation !== null && !["same", "lighter"].includes(args.continuation)) throw new Error("--continuation must be same or lighter");
if (args.memory !== null && !["compact", "standard", "wide"].includes(args.memory)) throw new Error("--memory must be compact, standard or wide");
if (args.instructions !== null && !["ru", "en"].includes(args.instructions)) throw new Error("--instructions must be ru or en");
if (!["on", "off"].includes(args.ledgerCheck)) throw new Error("--ledger-check must be on or off");
if (!VOICE_VARIANTS.includes(args.voice)) throw new Error(`--voice must be one of ${VOICE_VARIANTS.join(", ")}`);
if (!LEDGERS[args.ledger]) throw new Error(`--ledger must be one of ${Object.keys(LEDGERS).join(", ")}`);
if (!args.dry && !(args.budgetUsd > 0)) throw new Error("--budget-usd N (N > 0) is required for a paid run (or --dry)");
if ((args.voice === "five" || args.voice === "all") && !args.examplesFile) throw new Error(`--voice ${args.voice} needs --examples-file <path outside the repo>`);
const examples = args.examplesFile ? await readExamplesFile(args.examplesFile) : null;
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
    // A file of payloads (synthetic.mjs) or of the route's answers (the owner's workaround: one ?turn=N answer per row).
    return { campaignId: file.campaignId ?? rows[0]?.input?.campaignId ?? rows[0]?.payload?.input?.campaignId ?? "synthetic", title: file.title ?? "synthetic campaign",
      byTurn: new Map(rows.map((row, index) => {
        const payload = row.payload && !row.payload.schemaVersion ? row.payload : snapshotPayloadOf(row.payload ?? row);
        // Fix run: a probe file's row names its probe (probes.mjs); the record carries it.
        return [row.turnNo ?? index + 1, row.probe ? { ...payload, probe: row.probe } : payload];
      })) };
  }
  const listUrl = `${args.base}/api/campaigns/${encodeURIComponent(args.campaign)}/snapshots`;
  const list = snapshotListOf(await fetch(listUrl).then(async (response) => { if (!response.ok) throw new Error(`${listUrl}: HTTP ${response.status}`); return response.json(); }));
  const byTurn = new Map();
  for (const turnNo of args.turns) {
    const summary = list.find((row) => row.turnNo === turnNo);
    if (!summary) { console.log(`turn ${turnNo}: no snapshot (the campaign has ${list.length}); skipped`); continue; }
    // The route answers with the decoded payload (owner's replay fix 2); the SQL's shape is accepted too.
    const row = await fetch(`${listUrl}?operationId=${encodeURIComponent(summary.operationId)}`).then(async (response) => {
      if (!response.ok) throw new Error(`snapshot of turn ${turnNo}: HTTP ${response.status}`); return response.json(); });
    byTurn.set(turnNo, snapshotPayloadOf(row));
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
  `${args.dry ? "" : `: estimated $${estimate.toFixed(2)} (bake-off $/turn), hard budget $${args.budgetUsd.toFixed(2)}`}; craft set: ${args.craft}; voice: ${args.voice}${examples ? ` (${examples.passages} passages of ${examples.kinds} kind(s) from the examples file)` : ""}.`);

const apiKey = args.dry ? null : providerKey("ANTHROPIC_API_KEY");
if (!args.dry && !apiKey) throw new Error("ANTHROPIC_API_KEY is needed (environment or .env.local)");
const ledger = args.dry ? null : await openRun(runId, args.budgetUsd, `real replay: ${turns.length} turns × ${variants.map((v) => v.id).join("+")} on ${snapshots.title}; voice ${args.voice}; craft ${args.craft}`, args.ledger);
const budget = createBudget(args.dry ? 0 : ledger.budgetUsd);
const outDir = args.out ? resolve(ROOT, args.out) : join(ROOT, "docs", "samples", "real-replay", String(snapshots.campaignId).slice(0, 8));
await mkdir(outDir, { recursive: true });
await write({ type: "run", run: runId, purpose: "polish 3 §4 / voice stage §7: blind samples on the owner's own turns", campaignId: snapshots.campaignId, title: snapshots.title,
  turns, variants: variants.map((v) => v.id), craft: args.craft, voice: args.voice, examplesPassages: examples?.passages ?? null, ledger: args.ledger, quotable: args.quotable && !args.dry,
  dry: args.dry, startedAt: new Date().toISOString(), budgetUsd: budget.limitUsd });

let stopReason = null;
const written = [];
try {
  for (const turnNo of turns) {
    const payload = snapshots.byTurn.get(turnNo);
    for (const variant of variants) {
      if (!args.dry && budget.exhausted) { stopReason = "budget_reached"; break; }
      const record = await playVariant(payload, turnNo, variant);
      // Voice stage part 5/7: the quotable-line check on the committed narration (cents; counted in the budget).
      if (record.outcome === "committed" && record.narration && args.quotable && !args.dry && !budget.exhausted) {
        const check = await checkQuotableLines(apiKey, record.narration, payload.source.snapshot.settings.values.language === "ru" ? "ru" : "en");
        budget.spentUsd += check.costUsdMicros / 1_000_000;
        record.quotable = { flags: check.flags, lines: check.lines, costUsd: Number((check.costUsdMicros / 1_000_000).toFixed(6)), error: check.error };
        record.costUsd = Number((record.costUsd + check.costUsdMicros / 1_000_000).toFixed(5));
      }
      // Fix run A6: the residual misses of the committed records, the same check for both modes (a fraction of a cent).
      if (record.outcome === "committed" && record.narration && args.ledgerCheck === "on" && !args.dry && !budget.exhausted) {
        const post = await guardedLedgerCheck({ narration: record.narration, ledger: record.ledger ?? "", receipts: record.receipts,
          language: payload.source.snapshot.settings.values.language === "ru" ? "ru" : "en", state: ledgerCheckState(payload.source) });
        record.ledgerCheck = { ...record.ledgerCheck, post: { misses: post.misses, costUsd: Number((post.costUsdMicros / 1_000_000).toFixed(6)), error: post.error } };
        record.costUsd = Number((record.costUsd + post.costUsdMicros / 1_000_000).toFixed(5));
      }
      await write(record);
      if (record.outcome === "committed" && record.narration) {
        const sample = buildReplaySample(payload, record, { language: payload.source.snapshot.settings.values.language === "ru" ? "ru" : "en", campaignTitle: snapshots.title });
        const file = join(outDir, `t${String(turnNo).padStart(2, "0")}-${randomBytes(3).toString("hex")}.json`);
        await writeFile(file, `${JSON.stringify(sample, null, 2)}\n`, "utf8");
        written.push(file);
      }
      console.log(`  turn ${turnNo} · ${variant.id} · voice ${args.voice}: ${record.outcome} · first word ${record.firstWordMs ?? "–"} ms · text ${record.textDoneMs ?? "–"} ms · records ${record.recordsDoneMs ?? "–"} ms` +
        ` · $${record.costUsd.toFixed(4)} · ${record.receipts.filter((r) => r.result.ok).length} accepted, ${record.receipts.filter((r) => !r.result.ok).length} rejected` +
        `${record.quotable ? ` · quotable ${record.quotable.flags.length}/${record.quotable.lines}${record.quotable.error ? ` (${record.quotable.error})` : ""}` : ""}` +
        `${record.ledgerCheck ? ` · ledger check: ${record.ledgerCheck.live.length ? `in turn ${record.ledgerCheck.live.map((c) => c.misses.length).join("→")}, ` : ""}after ${record.ledgerCheck.post?.misses.length ?? "–"}` : ""}${record.outcome !== "committed" ? ` · ${record.errorCode ?? ""} ${record.exception ?? ""}` : ""}`);
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
variant (writer, bookkeeper, effort, craft set, voice variant), the timings, the tokens, the cost, the accepted records and
the quotable-line flags are inside each file; the examples file's passages never are. ${written.length} sample(s) over ${turns.length} turn(s).
Written by \`node scripts/eval/real-replay/replay.mjs\`; the record is \`docs/runs/${runId}.jsonl\`.
`, "utf8");
console.log(`\n${written.length} sample(s) in ${outDir.replace(`${ROOT}/`, "")}; spent ${budget.spentUsd.toFixed(4)} USD${stopReason ? `; stopped: ${stopReason}` : ""}. Record: docs/runs/${runId}.jsonl`);

/** The checker's call behind the run's budget (a cent reserved; its actual cost settled). */
async function guardedLedgerCheck(input) {
  const reserve = 0.01;
  if (budget.spentUsd + budget.reservedUsd + reserve > budget.limitUsd) { budget.exhausted = true; return { misses: [], usage: null, costUsdMicros: 0, elapsedMs: 0, error: "eval_budget_reached" }; }
  budget.reservedUsd += reserve;
  try { const result = await checkLedger(apiKey, input); budget.spentUsd += result.costUsdMicros / 1_000_000; return result; }
  finally { budget.reservedUsd -= reserve; }
}
/** One turn of one variant on an isolated copy of the snapshot. */
async function playVariant(payload, turnNo, variant) {
  const crafted = voiceVariant(craftVariant(payload, args.craft), args.voice, examples);
  // Fix run: the DM options of the variant (the turn's source carries them, migration 73).
  if (args.memory || args.instructions)
    crafted.source = { ...crafted.source, dmOptions: { ...(crafted.source.dmOptions ?? {}), ...(args.memory ? { memory: args.memory } : {}), ...(args.instructions ? { instructions: args.instructions } : {}) } };
  const store = createSnapshotTurnStore(crafted);
  const transport = [];
  const writerLive = args.dry ? null : guardedModel(variant.writer, budget, apiKey, transport, { salt: args.cacheSalt });
  const bookkeeperLive = !args.dry && variant.bookkeeper ? guardedModel(variant.bookkeeper, budget, apiKey, transport, { salt: args.cacheSalt }) : null;
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
    pin: async () => ({ providerId: variant.writer.providerId, modelId: variant.writer.modelId, effort: variant.effort, ...(args.continuation ? { continuation: args.continuation } : {}),
      limits: crafted.settings?.limits ?? DM_LOOP_DEFAULT_LIMITS, depth: variant.writer.modelId === MODELS.fable.modelId ? null : (crafted.settings?.depth ?? DEFAULT_DEPTH_RANGE), boostNext: false }),
    random: seededRandom(operationId),
    ...(variant.runtime === "two-pass" && args.ledgerCheck === "on" && !args.dry ? { ledgerCheck: guardedLedgerCheck } : {}),
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
      bookkeeper: variant.bookkeeper ? `${variant.bookkeeper.providerId}/${variant.bookkeeper.modelId}@${variant.bookkeeper.effort}` : null, effort: variant.effort, craft: args.craft,
      continuation: args.continuation, memory: args.memory, instructions: args.instructions, label: args.label, cacheSalt: args.cacheSalt, probe: payload.probe ?? null,
      voice: args.voice, ...(examples ? { examplesPassages: examples.passages } : {}) },
    outcome: result?.status ?? "error", continues, errorCode: result?.failure ?? (thrown ? thrown.code ?? "exception" : null), exception: thrown ? String(thrown.message).slice(0, 200) : null,
    failure: observations.filter((o) => o.type === "failure").map((o) => ({ code: o.code, message: o.message })),
    // Fix run: the provider's own reason of a failed request (the checkpoint is not written after it).
    providerErrors: observations.filter((o) => o.type === "diagnostic" && o.diagnostic.kind === "provider_error").map((o) => o.diagnostic),
    narration: result?.status === "committed" ? result.narration : null,
    firstWordMs: firstWordAt === null ? null : Math.round(firstWordAt - started), textDoneMs: variant.runtime === "two-pass" ? textDone : (result?.status === "committed" ? durationMs : null),
    recordsDoneMs: result?.status === "committed" ? durationMs : null, durationMs, requests: usage.length,
    costUsd: args.dry ? 0 : Number((sum("costUsd") + (loop?.diagnostics ?? []).filter((d) => d.kind === "ledger_checked").reduce((total, d) => total + (d.costUsd ?? 0), 0)).toFixed(5)), cacheReadShare: sum("inputTokens") ? Number((sum("cacheReadTokens") / sum("inputTokens")).toFixed(3)) : null,
    tokens: { input: sum("inputTokens"), output: sum("outputTokens"), cached: sum("cacheReadTokens"), cacheWrite: sum("cacheWriteTokens"), cacheWrite1h: sum("cacheWrite1hTokens") },
    usage, receipts: loop?.receipts ?? [], diagnostics: loop?.diagnostics ?? [], effort: loop?.pin?.effort ?? null, tension: loop?.pin?.depth?.tension ?? null,
    ledger: twoPass.find((o) => o.event === "writer_finished")?.ledger ?? null, transport: transport.map((t) => ({ ...t })),
    // Fix run: the turn's shape — each model answer's text length and calls (why a turn took the requests it took).
    shape: (loop?.transcript ?? []).filter((m) => m.role === "assistant").map((m) => ({ text: (m.text ?? "").length, calls: (m.toolCalls ?? []).map((call) => call.name) })),
    nudges: (loop?.transcript ?? []).filter((m) => m.role === "user").slice(1).map((m) => (m.text ?? "").slice(0, 80)),
    // Fix run A6: the in-turn checks of the split (first, then after the correction) and the chips left; the checker's cost is in costUsd.
    ledgerCheck: { live: (loop?.diagnostics ?? []).filter((d) => d.kind === "ledger_checked"), unrecorded: (loop?.diagnostics ?? []).find((d) => d.kind === "ledger_unrecorded")?.chips ?? [] },
  };
}
