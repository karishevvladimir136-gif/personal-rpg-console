// Fix S3-accept Д3: is the probe's prep model refusing everything right now, or only the region prep? One tiny,
// harmless request (a village in two sentences) and the region prep's system prompt with a one-place request; reports
// stop_reason and the refusal category only. Registered in the stage ledger (fixs3accept, stage D).
//   FIX_S2_STAGE=D node scripts/eval/live2d/region-prep-sanity.mjs --model claude-opus-5
import { providerKey } from "../lib/keys.mjs";
import { openRun } from "../real-replay/lib/ledger.mjs";
import { regionPrepRequest } from "../../../src/lib/live2d/region-prep.ts";

const args = process.argv.slice(2);
const model = args.includes("--model") ? args[args.indexOf("--model") + 1] : "claude-opus-5";
const price = { "claude-opus-5": { input: 5, output: 25 }, "claude-sonnet-5": { input: 2, output: 10 }, "claude-fable-5-1": { input: 10, output: 50 } }[model];
const run = await openRun(`fix-s3-accept-d-sanity-${new Date().toISOString().slice(0, 19)}`, 0.15, `Д3 prep model sanity (${model})`, "fixs3accept", "D");
const prep = regionPrepRequest({ language: "ru", campaignTitle: "Проба", region: { id: null, name: "", description: "Тихий край у реки." }, canon: [], passages: [], hidden: "", existing: null,
  places: [{ id: "00000000-0000-4000-8000-000000000001", name: "Заречье", status: "visited", description: "Деревня у реки.", parentId: null, whereabouts: "" }] });
const cases = [
  ["plain", "You are a helpful writer.", "Describe a quiet riverside village in two sentences."],
  ["prep-one-place", prep.system, prep.user],
];
let spent = 0;
const rows = [];
for (const [name, system, user] of cases) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "x-api-key": providerKey("ANTHROPIC_API_KEY"), "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model, max_tokens: 3000, output_config: { effort: "low" }, system, messages: [{ role: "user", content: user }] }),
  });
  const body = await response.json().catch(() => null);
  const usage = body?.usage ?? { input_tokens: 0, output_tokens: 0 };
  spent += (usage.input_tokens * price.input + usage.output_tokens * price.output) / 1e6;
  rows.push({ case: name, http: response.status, stop: body?.stop_reason ?? null, category: body?.stop_details?.category ?? null, input: usage.input_tokens, output: usage.output_tokens });
}
await run.settle(spent, { rows });
console.log(JSON.stringify({ model, rows, spentUsd: Number(spent.toFixed(4)) }));
