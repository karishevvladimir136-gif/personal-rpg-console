// Findings S3 §2: one paid session digest on the synthetic campaign, to see the shape of the DM's own notes in the first
// person. The state is a probe file's snapshot (the long synthetic campaign with its hidden layer, scripts/eval/fix-s2/
// probes-b.mjs); the session is its scenes; the request is the app's own (buildDigestRequest) on Opus 5.5 at high, behind
// the money guard, in the findings ledger. Writes docs/runs/findings-s3-digest-<stamp>.json.
//   node scripts/eval/findings-s3/digest-probe.mjs --snapshots scripts/eval/out/findings-s3-probes-b.json --turn 4 --budget-usd 1.5
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { openRun, ROOT } from "../real-replay/lib/ledger.mjs";
import { createBudget, guardedModel, MODELS } from "../real-replay/lib/models.mjs";
import { providerKey } from "../lib/keys.mjs";
import { buildDigestRequest, firstPersonPer100, runDigest, sessionShape } from "../../../src/lib/gameplay/dm-loop/digest.ts";
import { hiddenLayerOf } from "../../../src/lib/gameplay/dm-loop/private-notes.ts";
import { dmModels, dmUsageCost } from "../../../src/lib/model-runtime/dm-models.ts";

const args = { snapshots: null, turn: 4, budgetUsd: 0, scenes: 40 };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = () => process.argv[++i];
  if (flag === "--snapshots") args.snapshots = value();
  else if (flag === "--turn") args.turn = Number(value());
  else if (flag === "--budget-usd") args.budgetUsd = Number(value());
  else if (flag === "--scenes") args.scenes = Number(value());
  else throw new Error(`unknown argument ${flag}`);
}
if (!args.snapshots) throw new Error("--snapshots <probe file> is required");
if (!(args.budgetUsd > 0)) throw new Error("--budget-usd N is required (a paid call)");
const apiKey = providerKey("ANTHROPIC_API_KEY");
if (!apiKey) throw new Error("ANTHROPIC_API_KEY is needed (.env.local)");

const file = JSON.parse(await readFile(args.snapshots, "utf8"));
const row = (Array.isArray(file) ? file : file.snapshots).find((entry) => entry.turnNo === args.turn);
if (!row) throw new Error(`no snapshot ${args.turn} in ${args.snapshots}`);
const source = row.payload.source;
const rows = [...source.snapshot.scenes].sort((a, b) => a.sequence - b.sequence).slice(-args.scenes);
const session = { id: rows.at(-1)?.session_id ?? "synthetic", title: "Синтетическая сессия", scenes: rows.map((scene) => ({ role: scene.role, body: scene.body })),
  startWorldMinutes: null, endWorldMinutes: source.runtime.worldMinutes, shape: sessionShape(rows) };
const request = buildDigestRequest(source, session, "high");

const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
const run = `findings-s3-digest-${stamp}`;
const ledger = await openRun(run, args.budgetUsd, "findings S3 §2: one session digest on the synthetic campaign (the DM's own notes in the first person), Opus 5.5 at high", "findingss3");
const budget = createBudget(ledger.budgetUsd);
const log = [];
let spent = 0;
try {
  const { model } = guardedModel({ ...MODELS.opus }, budget, apiKey, log);
  const started = performance.now();
  const result = await runDigest(model, request, source, source.runtime.worldMinutes, { cacheKey: source.snapshot.campaign.id });
  spent = result.usage ? dmUsageCost(dmModels["anthropic/claude-opus-5-5"], result.usage) : 0;
  const digest = result.digest;
  const record = { type: "digest", run, requestTokens: request.tokens, scenes: session.scenes.length, shape: session.shape, usage: result.usage, stop: result.stop,
    costUsd: Number(spent.toFixed(4)), latencyMs: Math.round(performance.now() - started), parsed: !!digest,
    firstPersonPer100: digest ? { notebook: firstPersonPer100(digest.notebook), hiddenLayer: digest.hiddenLayer ? firstPersonPer100(digest.hiddenLayer) : null,
      hiddenLayerBefore: firstPersonPer100(hiddenLayerOf(source) ?? ""), recap: firstPersonPer100(digest.recap) } : null,
    notebookChars: digest?.notebook.length ?? null, digest, raw: digest ? null : result.text.slice(0, 2000), transport: log };
  await writeFile(join(ROOT, "docs", "runs", `${run}.json`), `${JSON.stringify(record, null, 2)}\n`, "utf8");
  console.log(`digest: ${digest ? `notebook ${digest.notebook.length} chars, first person ${record.firstPersonPer100.notebook}/100 words; hidden layer ${digest.hiddenLayer ? `${record.firstPersonPer100.hiddenLayer}/100 (was ${record.firstPersonPer100.hiddenLayerBefore})` : "unchanged"}; recap ${record.firstPersonPer100.recap}/100` : "UNPARSED"} · $${spent.toFixed(4)} · ${record.latencyMs} ms`);
} finally {
  await ledger.settle(spent, `docs/runs/${run}.json`);
}
