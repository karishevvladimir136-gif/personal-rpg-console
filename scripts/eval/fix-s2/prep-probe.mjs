// Fix run B1 probe: a fresh campaign's prep. A young synthetic campaign (four turns, the session-2-size canon) gets the
// DM's prep — the real request (buildPrepRequest) on Opus 5.5 at high, behind the money guard, every call in the ledger —
// its hidden layer is stored as the app stores it, and two probe scenes are captured on top of it for the replay, whose
// pass rule is: the hidden layer exists, clues to it appear, the truth is not said.
//   FIX_S2_STAGE=B node scripts/eval/fix-s2/prep-probe.mjs --budget-usd 3 [--out scripts/eval/out/fix-s2-probes-prep.json]
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { openRun, ROOT } from "../real-replay/lib/ledger.mjs";
import { createBudget, guardedModel, MODELS } from "../real-replay/lib/models.mjs";
import { anthropicKey } from "../lib/anthropic-endpoint.mjs";
import { buildLongCampaign } from "./lib/campaign.mjs";
import { createScriptedDmModel } from "../../../src/lib/gameplay/dm-loop/scripted-model.ts";
import { buildPrepRequest, parsePrep, prepWrites } from "../../../src/lib/gameplay/dm-loop/hidden-layer.ts";
import { dmModels, dmUsageCost } from "../../../src/lib/model-runtime/dm-models.ts";

const args = { out: join(ROOT, "scripts", "eval", "out", "fix-s2-probes-prep.json"), budgetUsd: 0, seed: "p" };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = () => process.argv[++i];
  if (flag === "--out") args.out = join(ROOT, value());
  else if (flag === "--budget-usd") args.budgetUsd = Number(value());
  else if (flag === "--seed") args.seed = value();
  else throw new Error(`unknown argument ${flag}`);
}
if (!(args.budgetUsd > 0)) throw new Error("--budget-usd N is required (a paid call)");
const apiKey = anthropicKey();
if (!apiKey) throw new Error("ANTHROPIC_API_KEY is needed (.env.local)");

const finish = (kinds = ["quiet"]) => ({ name: "finish_turn", arguments: { sceneKinds: kinds, spotlight: [], playerMoment: false, nextTension: "calm" } });
const built = await buildLongCampaign({ turns: 4, seed: args.seed });
const { c, capture, decorate } = built;
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
const run = `prep-probe-${stamp}`;
const ledger = await openRun(run, args.budgetUsd, "fix run B1: a fresh campaign's prep (the hidden layer) on Opus 5.5 at high");
const budget = createBudget(ledger.budgetUsd);
const log = [];
let spent = 0;
const probes = [];
try {
  const { payload } = await capture("Осматриваюсь.", [{ text: "Тихо.", toolCalls: [{ name: "advance_time", arguments: { minutes: 1, reason: "тишина" } }, finish()] }]);
  decorate(payload);
  const request = buildPrepRequest(payload.source, "high");
  const { model } = guardedModel({ ...MODELS.opus }, budget, apiKey, log);
  let text = "", usage = null, stop = null;
  const started = performance.now();
  for await (const event of model.stream({ system: request.system, messages: request.messages, toolset: null, effort: "high", maxOutputTokens: 32000, cacheKey: payload.input.campaignId })) {
    if (event.type === "text_delta") text += event.text;
    else if (event.type === "usage") usage = event.usage;
    else if (event.type === "stop") stop = event.reason;
  }
  spent = usage ? dmUsageCost(dmModels["anthropic/claude-opus-5-5"], usage) : 0;
  const prep = parsePrep(text, "ru");
  const record = { type: "prep", run, requestTokens: request.tokens, usage, stop, costUsd: Number(spent.toFixed(4)), latencyMs: Math.round(performance.now() - started),
    parsed: !!prep, layer: prep?.text ?? null, clocks: prep?.clocks ?? [], transport: log };
  await mkdir(join(ROOT, "docs", "runs"), { recursive: true });
  await writeFile(join(ROOT, "docs", "runs", `${run}.json`), `${JSON.stringify(record, null, 2)}\n`, "utf8");
  console.log(`prep: ${prep ? `${prep.text.length} chars, ${prep.clocks.length} clocks` : "UNPARSED"} · $${spent.toFixed(4)} · ${record.latencyMs} ms`);
  if (prep) {
    const play = await (await c.deps(createScriptedDmModel([]))).store.readPlay(c.cid);
    await c.dossier("private_notes", { set: prepWrites(prep, payload.source), remove: [] }, play.timeline);
    for (const [id, line] of [["prep-look", "Иду к маяку на Волнорезе и осматриваюсь: кто здесь бывает, что не так."], ["prep-ask", "Расспрашиваю первого, кто попадётся у причала: что в гавани творится последние ночи?"]]) {
      const { payload: probe } = await capture("Осматриваюсь.", [{ text: "Тихо. Ветер с моря.", toolCalls: [{ name: "advance_time", arguments: { minutes: 1, reason: "тишина" } }, finish()] }]);
      probe.input = { ...probe.input, input: line };
      probes.push({ turnNo: probes.length + 1, probe: { id, label: "after the prep: clues to the hidden truth appear, the truth is not said",
        pass: "the hidden layer exists; the turn shows at least one clue that points at it; no character states the truth" }, payload: decorate(probe) });
    }
  }
} finally {
  await ledger.settle(spent, `docs/runs/${run}.json`);
  await c.f.db.close();
}
await mkdir(dirname(args.out), { recursive: true });
await writeFile(args.out, JSON.stringify({ campaignId: probes[0]?.payload.input.campaignId ?? "synthetic", title: `Fix run prep probes (seed ${args.seed})`, snapshots: probes }, null, 0), "utf8");
console.log(`${probes.length} probe(s) written to ${args.out.replace(`${ROOT}/`, "")}`);
