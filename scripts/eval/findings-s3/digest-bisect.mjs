// Findings S3 §2/§7: the paid digest on the synthetic campaign came back as a refusal (no text, 260 ms). This finds which
// part of the request does it, cheaply: the same cached system layers, the variants of the instructions and of the «now»
// block, each with a 200-token output cap (a refusal shows at once; an answer is cut after its first lines). Each variant's
// stop reason and first characters go to docs/runs/findings-s3-digest-bisect-<stamp>.json; the findings ledger holds the money.
//   node scripts/eval/findings-s3/digest-bisect.mjs --snapshots scripts/eval/out/findings-s3-probes-b.json --turn 4 --budget-usd 3
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { openRun, ROOT } from "../real-replay/lib/ledger.mjs";
import { createBudget, guardedModel, MODELS } from "../real-replay/lib/models.mjs";
import { providerKey } from "../lib/keys.mjs";
import { buildDigestRequest, sessionShape, DM_NOTES_VOICE } from "../../../src/lib/gameplay/dm-loop/digest.ts";
import { dmModels, dmUsageCost } from "../../../src/lib/model-runtime/dm-models.ts";

const args = { snapshots: null, turn: 4, budgetUsd: 0, scenes: 40, only: null, old: null };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = () => process.argv[++i];
  if (flag === "--snapshots") args.snapshots = value();
  else if (flag === "--turn") args.turn = Number(value());
  else if (flag === "--budget-usd") args.budgetUsd = Number(value());
  else if (flag === "--only") args.only = value().split(",");
  else if (flag === "--old") args.old = value();
  else throw new Error(`unknown argument ${flag}`);
}
if (!args.snapshots || !(args.budgetUsd > 0)) throw new Error("--snapshots and --budget-usd are required");
const apiKey = providerKey("ANTHROPIC_API_KEY");
const file = JSON.parse(await readFile(args.snapshots, "utf8"));
const source = (Array.isArray(file) ? file : file.snapshots).find((entry) => entry.turnNo === args.turn).payload.source;
const rows = [...source.snapshot.scenes].sort((a, b) => a.sequence - b.sequence).slice(-args.scenes);
const request = buildDigestRequest(source, { id: rows.at(-1)?.session_id ?? "synthetic", title: "Синтетическая сессия", scenes: rows.map((s) => ({ role: s.role, body: s.body })),
  startWorldMinutes: null, endWorldMinutes: source.runtime.worldMinutes, shape: sessionShape(rows) }, "high");
const text = request.messages[0].text;
const now = request.system.at(-1).text;
const withoutVoices = (t) => t.replace(/,\n  "voices": \[[^\n]*\]/, "");
const withoutNow = (n) => n.replace(/\n\nPEOPLE WITHOUT A VOICE OF THEIR OWN[^\n]*/, "");
const variants = {
  as_sent: { text, now },
  no_voices: { text: withoutVoices(text), now: withoutNow(now) },
  no_first_person: { text: text.replace(` the way a game master writes for themself — ${DM_NOTES_VOICE}`, ""), now },
  neither: { text: withoutVoices(text.replace(` the way a game master writes for themself — ${DM_NOTES_VOICE}`, "")), now: withoutNow(now) },
  // The item-7 line of the layer without «your own reasoning»; and the notebook line before this stage.
  layer_no_reasoning: { text: text.replace(" — where the room allows, keep more of the exact lines that carried a scene and more of your own reasoning (why you decided what you did), rather than a summary", ""), now },
  layer_lines_only: { text: text.replace("keep more of the exact lines that carried a scene and more of your own reasoning (why you decided what you did), rather than a summary", "keep more of the exact lines that carried a scene, rather than a summary"), now },
  layer_plans_reasons: { text: text.replace("more of your own reasoning (why you decided what you did)", "more of your plans with the reasons behind them"), now },
  json_only: { text: "Write a two-line summary of the session above as JSON: {\"recap\": \"…\"}.", now },
};
// The instructions before this stage (55fb00e), from a temporary copy of that module (--old <path to it>).
if (args.old) {
  const old = await import(args.old);
  const oldRequest = old.buildDigestRequest(source, { id: rows.at(-1)?.session_id ?? "synthetic", title: "Синтетическая сессия", scenes: rows.map((s) => ({ role: s.role, body: s.body })),
    startWorldMinutes: null, endWorldMinutes: source.runtime.worldMinutes, shape: sessionShape(rows) }, "high");
  variants.old_instructions = { text: oldRequest.messages[0].text, now: withoutNow(now) };
  variants.old_request = { text: oldRequest.messages[0].text, now: oldRequest.system.at(-1).text, system: oldRequest.system.slice(0, -1) };
}
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
const run = `findings-s3-digest-bisect-${stamp}`;
const ledger = await openRun(run, args.budgetUsd, "findings S3 §2/§7: why the synthetic digest was refused — variants of its instructions, 200-token cap, Opus 5.5", "findingss3");
const budget = createBudget(ledger.budgetUsd);
const log = [];
const results = [];
let spent = 0;
try {
  const guarded = guardedModel({ ...MODELS.opus }, budget, apiKey, log);
  const { model } = guarded;
  for (const [name, variant] of Object.entries(variants)) {
    if (args.only && !args.only.includes(name)) continue;
    let out = "", stop = null, usage = null;
    const system = [...(variant.system ?? request.system.slice(0, -1)), { text: variant.now, cache: false }];
    for await (const event of model.stream({ system, messages: [{ role: "user", text: variant.text }], toolset: null, effort: "high", maxOutputTokens: 200, cacheKey: source.snapshot.campaign.id })) {
      if (event.type === "text_delta") out += event.text;
      else if (event.type === "usage") usage = event.usage;
      else if (event.type === "stop") stop = event.reason;
    }
    const cost = usage ? dmUsageCost(dmModels["anthropic/claude-opus-5-5"], usage) : 0;
    spent += cost;
    guarded.settle(cost);
    results.push({ variant: name, stop, chars: out.length, start: out.slice(0, 160), costUsd: Number(cost.toFixed(4)), cacheRead: usage?.cacheReadTokens ?? null });
    console.log(`${name}: ${stop} · ${out.length} chars · $${cost.toFixed(4)} · cache read ${usage?.cacheReadTokens ?? "–"}`);
  }
} finally {
  await writeFile(join(ROOT, "docs", "runs", `${run}.json`), `${JSON.stringify({ run, results, transport: log }, null, 2)}\n`, "utf8");
  await ledger.settle(spent, `docs/runs/${run}.json`);
}
