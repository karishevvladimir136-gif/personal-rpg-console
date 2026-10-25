// Fix S3-accept Д3: which line of the region prep's system prompt trips the probe model's «cyber» refusal — the
// one-place request (region-prep-sanity.mjs) sent with each line of the system prompt left out in turn, at low effort,
// max 400 output tokens; reports stop_reason and category per variant. Registered in the stage ledger (stage D).
//   FIX_S2_STAGE=D node scripts/eval/live2d/region-prep-bisect.mjs --model claude-opus-5
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scriptAnthropicEndpoint } from "../lib/anthropic-endpoint.mjs";
import { openRun } from "../real-replay/lib/ledger.mjs";
import { regionPrepRequest } from "../../../src/lib/live2d/region-prep.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const args = process.argv.slice(2);
const model = args.includes("--model") ? args[args.indexOf("--model") + 1] : "claude-opus-5";
const price = { "claude-opus-5": { input: 5, output: 25 } }[model];
const prep = regionPrepRequest({ language: "ru", campaignTitle: "Проба", region: { id: null, name: "", description: "Тихий край у реки." }, canon: [], passages: [], hidden: "", existing: null,
  places: [{ id: "00000000-0000-4000-8000-000000000001", name: "Заречье", status: "visited", description: "Деревня у реки.", parentId: null, whereabouts: "" }] });
const lines = prep.system.split("\n");
const run = await openRun(`fix-s3-accept-d-bisect-${new Date().toISOString().slice(0, 19)}`, 0.4, `Д3 prep refusal bisect (${model})`, "fixs3accept", "D");
let spent = 0;
const rows = [];
const send = async (label, system) => {
  const door = scriptAnthropicEndpoint();
  const response = await fetch(door.messagesUrl, {
    method: "POST", headers: door.headers(door.apiKey),
    body: JSON.stringify({ model: door.modelId(model), max_tokens: 400, output_config: { effort: "low" }, system, messages: [{ role: "user", content: prep.user }] }),
  });
  const body = await response.json().catch(() => null);
  const usage = body?.usage ?? { input_tokens: 0, output_tokens: 0 };
  spent += (usage.input_tokens * price.input + usage.output_tokens * price.output) / 1e6;
  rows.push({ variant: label, stop: body?.stop_reason ?? `http ${response.status}`, category: body?.stop_details?.category ?? null });
  console.log(label, body?.stop_reason, body?.stop_details?.category ?? "");
};
await send("all lines", prep.system);
for (const [index, line] of lines.entries()) await send(`without line ${index + 1}: ${line.slice(0, 50)}`, lines.filter((_, at) => at !== index).join("\n"));
await run.settle(spent, { rows });
writeFileSync(join(root, "docs", "runs", "fix-s3-accept-d-bisect.json"), `${JSON.stringify({ at: new Date().toISOString(), model, rows, spentUsd: Number(spent.toFixed(4)) }, null, 2)}\n`);
