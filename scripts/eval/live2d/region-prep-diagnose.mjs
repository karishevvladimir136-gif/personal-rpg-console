// Fix S3-accept Д3: one diagnostic call when the region prep's request comes back as a refusal — the same request the
// probe sends (scripts/eval/live2d/region-prep-probe.mjs exports nothing, so the synthetic source is rebuilt here from
// the probe's own module), reporting only stop_reason, stop_details and usage (never the text). Registered in the stage
// ledger (fixs3accept, stage D) and settled from the reply's usage.
//   FIX_S2_STAGE=D node scripts/eval/live2d/region-prep-diagnose.mjs --model claude-opus-5 [--no-hidden]
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scriptAnthropicEndpoint } from "../lib/anthropic-endpoint.mjs";
import { openRun } from "../real-replay/lib/ledger.mjs";
import { regionPrepRequest } from "../../../src/lib/live2d/region-prep.ts";
import { probeSource } from "./region-probe-campaign.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const args = process.argv.slice(2);
const model = args.includes("--model") ? args[args.indexOf("--model") + 1] : "claude-opus-5";
const PRICES = { "claude-opus-5": { input: 5, output: 25 }, "claude-sonnet-5": { input: 2, output: 10 } };
const price = PRICES[model];
if (!price) throw new Error(`no price for ${model}`);
const source = probeSource({ hidden: !args.includes("--no-hidden") });
const request = regionPrepRequest(source);
const run = await openRun(`fix-s3-accept-d-diagnose-${new Date().toISOString().slice(0, 19)}`, 0.3, `Д3 prep refusal diagnosis (${model}${args.includes("--no-hidden") ? ", no private notes" : ""})`, "fixs3accept", "D");
const door = scriptAnthropicEndpoint();
const response = await fetch(door.messagesUrl, {
  method: "POST",
  headers: door.headers(door.apiKey),
  body: JSON.stringify({ model: door.modelId(model), max_tokens: 8000, output_config: { effort: "medium" }, system: request.system, messages: [{ role: "user", content: request.user }] }),
  signal: AbortSignal.timeout(240_000),
});
const body = await response.json().catch(() => null);
const usage = body?.usage ?? null;
const spent = usage ? (usage.input_tokens * price.input + usage.output_tokens * price.output) / 1e6 : 0;
const result = { at: new Date().toISOString(), model, hidden: !args.includes("--no-hidden"), http: response.status, stopReason: body?.stop_reason ?? null, stopDetails: body?.stop_details ?? null,
  error: body?.error?.type ?? null, usage, textChars: (body?.content ?? []).filter((block) => block.type === "text").reduce((sum, block) => sum + (block.text?.length ?? 0), 0), spentUsd: Number(spent.toFixed(4)) };
await run.settle(spent, result);
const file = join(root, "docs", "runs", "fix-s3-accept-d-diagnose.json");
let rows = [];
try { rows = JSON.parse((await import("node:fs")).readFileSync(file, "utf8")); } catch { rows = []; }
writeFileSync(file, `${JSON.stringify([...rows, result], null, 2)}\n`);
console.log(JSON.stringify(result));
