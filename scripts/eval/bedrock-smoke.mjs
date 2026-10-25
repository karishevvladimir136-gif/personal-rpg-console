// BEDROCK_PROVIDER_1 smoke — the stage's only paid part (≤ $3, Amazon Bedrock only): one Haiku 5.5 call (ten tokens),
// then one Opus 5.5 DM turn on a throwaway local campaign (PGlite) through the app's own loop, with the roll check.
// Every request leaves through a guard that refuses any host but the Bedrock door (never the Console's API, never
// another provider) and records the request id and the quota headers; the run registers in its own ledger first.
// On a model's first call Bedrock may still be enabling the model account-wide: an access error waits 60 s and is
// retried exactly once, then the smoke stops and says which model access is missing.
//   node scripts/eval/bedrock-smoke.mjs [--budget-usd 3] [--effort high]
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { scriptAnthropicEndpoint, anthropicRequestId, anthropicErrorCode } from "./lib/anthropic-endpoint.mjs";
import { openRun, ROOT } from "./real-replay/lib/ledger.mjs";
import { QUOTABLE_PRICE_PER_MILLION } from "../../src/lib/gameplay/dm-loop/quotable.ts";

const args = { budgetUsd: 3, effort: "high" };
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === "--budget-usd") args.budgetUsd = Number(process.argv[++i]);
  else if (process.argv[i] === "--effort") args.effort = process.argv[++i];
}
const door = scriptAnthropicEndpoint();
if (door.provider !== "bedrock") throw new Error("the smoke runs on the bedrock door only (ANTHROPIC_PROVIDER=bedrock)");
if (!door.apiKey) throw new Error("BEDROCK_API_KEY is not set (.env.local or APP_BEDROCK_API_KEY)");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The guard: only the door's host; every response's id and quota headers are kept (never a request header).
const calls = [];
const realFetch = globalThis.fetch;
const QUOTA = /ratelimit|quota|limit|retry-after|x-amzn|request-id|token/i;
globalThis.fetch = async (url, init) => {
  const host = new URL(String(url)).host;
  if (host !== door.endpointHost) throw new Error(`smoke guard: ${host} refused (only ${door.endpointHost})`);
  let model = null;
  try { model = JSON.parse(String(init?.body ?? "{}")).model ?? null; } catch { /* not JSON */ }
  const started = performance.now();
  const response = await realFetch(url, init);
  const headers = {};
  response.headers.forEach((value, name) => { if (QUOTA.test(name) && !/key|auth|cookie/i.test(name)) headers[name] = value; });
  calls.push({ host, model, status: response.status, requestId: anthropicRequestId(response.headers), ms: Math.round(performance.now() - started), headers });
  return response;
};

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const runId = `bedrock-provider-1-smoke-${stamp}`;
const ledger = await openRun(runId, args.budgetUsd, "smoke: Haiku 5.5 call + one Opus 5.5 DM turn (Bedrock only)", "bedrock1");
const outDir = join(ROOT, "docs", "runs");
mkdirSync(outDir, { recursive: true });
const report = { run: runId, provider: door.provider, endpointHost: door.endpointHost, startedAt: new Date().toISOString(), haiku: null, opus: null, calls, spentUsd: 0 };
const save = () => writeFileSync(join(outDir, "bedrock-provider-1-smoke.json"), `${JSON.stringify(report, null, 2)}\n`);
const isAccessError = (status) => status === 403;

// 1. Haiku 5.5, ten tokens.
async function haikuOnce() {
  const response = await fetch(door.messagesUrl, { method: "POST", headers: door.headers(door.apiKey),
    body: JSON.stringify({ model: door.modelId("claude-haiku-5-5"), max_tokens: 10, thinking: { type: "disabled" }, output_config: { effort: "low" },
      messages: [{ role: "user", content: "Reply with one word: ready" }] }), signal: AbortSignal.timeout(60_000) });
  const value = await response.json().catch(() => null);
  return { status: response.status, value, code: response.ok ? null : anthropicErrorCode(value, response.headers) };
}
let haiku = await haikuOnce();
if (isAccessError(haiku.status)) { console.log("Haiku 5.5: access error, waiting 60 s and retrying once"); await sleep(60_000); haiku = await haikuOnce(); }
const haikuUsage = haiku.value?.usage ?? {};
const haikuCost = ((haikuUsage.input_tokens ?? 0) * QUOTABLE_PRICE_PER_MILLION.input + (haikuUsage.output_tokens ?? 0) * QUOTABLE_PRICE_PER_MILLION.output) / 1_000_000;
report.haiku = { status: haiku.status, code: haiku.code, model: haiku.value?.model ?? null, stopReason: haiku.value?.stop_reason ?? null,
  text: (haiku.value?.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("").slice(0, 80),
  usage: { inputTokens: haikuUsage.input_tokens ?? 0, outputTokens: haikuUsage.output_tokens ?? 0 }, costUsd: Number(haikuCost.toFixed(6)),
  error: haiku.status === 200 ? null : String(haiku.value?.message ?? haiku.value?.error?.message ?? "").slice(0, 200) };
report.spentUsd += haikuCost;
save();
console.log(`Haiku 5.5: HTTP ${haiku.status}${haiku.code ? ` ${haiku.code}` : ""} · ${report.haiku.usage.inputTokens} in / ${report.haiku.usage.outputTokens} out · $${haikuCost.toFixed(6)} · «${report.haiku.text}»`);
if (haiku.status !== 200) {
  await ledger.settle(report.spentUsd, "docs/runs/bedrock-provider-1-smoke.json");
  console.log(isAccessError(haiku.status) ? "Stopped: Bedrock refused Haiku 5.5 twice — model access for claude-haiku-5-5 is missing on this AWS account." : "Stopped: the Haiku call failed.");
  process.exit(1);
}

// 2. One Opus 5.5 DM turn through the app's own loop (durable begin, tools, receipts, the roll check, atomic commit).
const { runLoopScenario, createLoopBudget } = await import("./lib/loop-harness.mjs");
const scenario = { name: "bedrock-smoke", title: "One DM turn on the bedrock door", runtime: "dm-loop-v1", language: "en",
  steps: [{ id: "lock", say: "I kneel by the old iron-bound chest in the corner and try to pick its lock with the tip of my knife.", expect: [{ outcome: "committed" }] }] };
const records = [];
async function opusOnce(attempt) {
  const before = calls.length;
  const budget = createLoopBudget(Math.max(0, ledger.budgetUsd - report.spentUsd));
  const summary = await runLoopScenario(scenario, { live: true, model: "opus", effort: args.effort, budget, apiKey: door.apiKey, appChecks: true,
    runId: `${runId}-opus-${attempt}`, write: (record) => records.push(record) });
  report.spentUsd += budget.spentUsd;
  const opusCalls = calls.slice(before).filter((call) => call.model === door.modelId("claude-opus-5-5"));
  return { summary, budget, opusCalls };
}
let opus = await opusOnce(1);
if (opus.opusCalls.length && isAccessError(opus.opusCalls[0].status)) {
  console.log("Opus 5.5: access error, waiting 60 s and retrying once"); await sleep(60_000); opus = await opusOnce(2);
}
const turn = records.filter((record) => record.type === "turn").at(-1);
report.opus = { outcome: turn?.outcome ?? null, errorCode: turn?.errorCode ?? null, failure: turn?.failure ?? [], effort: args.effort,
  requests: turn?.calls?.length ?? 0, tokens: turn?.tokens ?? null, costUsd: turn?.costUsd ?? null, durationMs: turn?.durationMs ?? null,
  firstWordMs: turn?.firstWordMs ?? null, rolls: turn?.effects?.rolls ?? [], tools: turn?.effects?.accepted ?? [], rejected: turn?.effects?.rejected ?? [],
  // The in-turn roll check is a Haiku request of its own (the guard's call list).
  rollCheckCalls: calls.filter((call) => call.model === door.modelId("claude-haiku-5-5")).length - 1,
  narration: turn?.narration ?? null, calls: turn?.calls ?? [], budgetSpentUsd: Number(opus.budget.spentUsd.toFixed(6)) };
writeFileSync(join(outDir, "bedrock-provider-1-smoke.jsonl"), records.map((record) => JSON.stringify(record)).join("\n") + "\n");
report.spentUsd = Number(report.spentUsd.toFixed(6));
report.finishedAt = new Date().toISOString();
save();
await ledger.settle(report.spentUsd, "docs/runs/bedrock-provider-1-smoke.json");
console.log(`Opus 5.5 turn: ${report.opus.outcome}${report.opus.errorCode ? ` (${report.opus.errorCode})` : ""} · ${report.opus.requests} requests · $${(report.opus.costUsd ?? 0).toFixed(4)} · rolls ${report.opus.rolls.length}`);
console.log(`Spent $${report.spentUsd.toFixed(4)} of $${ledger.budgetUsd} (ledger bedrock1). Calls: ${calls.length}, statuses ${calls.map((call) => call.status).join(",")}`);
