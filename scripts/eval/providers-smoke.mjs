// ANTHROPIC_PROVIDERS_1 smoke — the stage's only paid part (≤ $3 per door, OpenRouter or Amazon Bedrock; never the
// Console's API). Each door plays what it can serve today:
//   openrouter: one Haiku 5.5 call (ten tokens), one Opus 5.5 DM turn on a throwaway local campaign (PGlite) through
//               the app's own loop with the roll check (Haiku 5.5), one Fable 5.1 call (ten tokens);
//   bedrock:    one Haiku 4.5 call (ten tokens) and one Opus 4.5 call (ten tokens) — the 5.5 quotas are 0 there and
//               the app's DM and checks are 5.5-only, so no DM turn (the report says why).
// Every request leaves through a guard that refuses any host but the door's own, and records the status, the request
// id, the quota headers and who served it (the model the reply names; OpenRouter's upstream, read from the reply or
// from its generation record afterwards, which also gives OpenRouter's charge). The run registers in the stage's
// ledger first (stage O or B). A refused first call (no access, no credits) stops the door and says what is missing.
//   node scripts/eval/providers-smoke.mjs --door openrouter|bedrock [--budget-usd 3] [--effort high] [--only haiku,dm,fable]
//   node scripts/eval/providers-smoke.mjs --door openrouter --charges docs/runs/anthropic-providers-1-smoke-openrouter.json
// In the cloud, Node reaches OpenRouter's host only through the proxy: NODE_USE_ENV_PROXY=1 (docs/CLOUD.md).
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { scriptAnthropicEndpoint, anthropicRequestId, anthropicErrorCode, recordServed, requestedModelOf, servedOf, appModelId }
  from "./lib/anthropic-endpoint.mjs";
import { providerKey } from "./lib/keys.mjs";
import { openRun, ROOT } from "./real-replay/lib/ledger.mjs";
import { dmModels } from "../../src/lib/model-runtime/dm-models.ts";
import { QUOTABLE_PRICE_PER_MILLION } from "../../src/lib/gameplay/dm-loop/quotable.ts";

const args = { door: null, budgetUsd: 3, effort: "high", only: null, charges: null };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i];
  if (flag === "--door") args.door = process.argv[++i];
  else if (flag === "--budget-usd") args.budgetUsd = Number(process.argv[++i]);
  else if (flag === "--effort") args.effort = process.argv[++i];
  else if (flag === "--only") args.only = process.argv[++i].split(",");
  else if (flag === "--charges") args.charges = process.argv[++i];
  else throw new Error(`unknown flag ${flag}`);
}
if (!["openrouter", "bedrock"].includes(args.door)) throw new Error("--door openrouter|bedrock (the Console's API is not smoked here)");
if (!(args.budgetUsd > 0 && args.budgetUsd <= 3)) throw new Error("--budget-usd must be within (0, 3]: the stage's cap per door");
const wanted = (part) => !args.only || args.only.includes(part);

// The door is the one asked for, whatever .env.local names; keys come from .env.local or the cloud's APP_ variables.
const read = (name) => (name === "ANTHROPIC_PROVIDER" ? args.door : providerKey(name));
const door = scriptAnthropicEndpoint(read);
if (!door.apiKey) throw new Error(`${door.keyName} is not set (.env.local or APP_${door.keyName})`);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// List prices, USD per 1M tokens (OpenRouter charges Anthropic's list prices; Bedrock's global profiles likewise).
const PRICES = {
  "claude-opus-5-5": dmModels["anthropic/claude-opus-5-5"].price,
  "claude-fable-5-1": dmModels["anthropic/claude-fable-5-1"].price,
  "claude-haiku-5-5": QUOTABLE_PRICE_PER_MILLION,
  "claude-opus-4-5": { input: 5, output: 25 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};
const costOf = (appId, usage) => {
  const price = PRICES[appId];
  const input = (usage?.input_tokens ?? 0) + (usage?.cache_read_input_tokens ?? 0) + (usage?.cache_creation_input_tokens ?? 0);
  return price ? (input * price.input + (usage?.output_tokens ?? 0) * price.output) / 1_000_000 : 0;
};

// The guard: only the door's host; every response's id, quota headers and served model are kept (never a request header).
const calls = [];
const pending = [];
const realFetch = globalThis.fetch;
const QUOTA = /ratelimit|quota|limit|retry-after|x-amzn|request-id|generation|token/i;
globalThis.fetch = async (url, init) => {
  const target = new URL(String(url));
  if (target.host !== door.endpointHost) throw new Error(`smoke guard: ${target.host} refused (only ${door.endpointHost})`);
  const started = performance.now();
  const response = await realFetch(url, init);
  const headers = {};
  response.headers.forEach((value, name) => { if (QUOTA.test(name) && !/key|auth|cookie/i.test(name)) headers[name] = value; });
  const line = { at: new Date().toISOString(), host: target.host, path: target.pathname, model: requestedModelOf(init), status: response.status,
    requestId: anthropicRequestId(response.headers), ms: Math.round(performance.now() - started), headers };
  calls.push(line);
  if (target.pathname.endsWith("/messages")) pending.push(recordServed(response, line.model, line));
  return response;
};

// `--charges <record.json>`: no paid call — fill a finished OpenRouter record with OpenRouter's generation records.
if (args.charges) {
  if (door.provider !== "openrouter") throw new Error("--charges reads OpenRouter's generation records (--door openrouter)");
  const { readFileSync } = await import("node:fs");
  const saved = JSON.parse(readFileSync(args.charges, "utf8"));
  await openRouterCharges(saved.calls, saved);
  saved.calls.push(...calls.map((call) => ({ ...call, lookup: true })));
  writeFileSync(args.charges, `${JSON.stringify(saved, null, 2)}\n`);
  for (const call of saved.calls.filter((entry) => entry.generation))
    console.log(`${call.requestId}: ${call.generation.model} via ${call.generation.upstream} · $${Number(call.generation.totalCostUsd ?? 0).toFixed(6)}`);
  console.log(`Charged by OpenRouter: $${saved.chargedUsd?.toFixed(6) ?? "?"} (list prices: $${saved.spentUsd})`);
  process.exit(0);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const runId = `anthropic-providers-1-${args.door}-${stamp}`;
const plan = args.door === "openrouter" ? "Haiku 5.5 call + one Opus 5.5 DM turn (roll check on Haiku 5.5) + Fable 5.1 call"
  : "Haiku 4.5 call + Opus 4.5 call";
const ledger = await openRun(runId, args.budgetUsd, `smoke on ${door.providerLabel}: ${plan}`, "providers1",
  args.door === "openrouter" ? "O" : "B", { provider: door.provider, endpointHost: door.endpointHost });
const outDir = join(ROOT, "docs", "runs");
mkdirSync(outDir, { recursive: true });
const base = join(outDir, `anthropic-providers-1-smoke-${args.door}`);
const report = { run: runId, provider: door.provider, providerLabel: door.providerLabel, endpointHost: door.endpointHost,
  messagesPath: new URL(door.messagesUrl).pathname, startedAt: new Date().toISOString(), budgetUsd: ledger.budgetUsd,
  short: [], dm: null, calls, spentUsd: 0 };
const save = () => writeFileSync(`${base}.json`, `${JSON.stringify(report, null, 2)}\n`);
let stopped = null;

async function finish(code = 0) {
  await Promise.all(pending);
  if (door.provider === "openrouter") await openRouterCharges();
  report.spentUsd = Number(report.spentUsd.toFixed(6));
  report.finishedAt = new Date().toISOString();
  report.stopped = stopped;
  save();
  await ledger.settle(report.chargedUsd ?? report.spentUsd, `docs/runs/anthropic-providers-1-smoke-${args.door}.json`);
  console.log(`Spent $${report.spentUsd.toFixed(4)} by list prices${report.chargedUsd !== undefined ? `, $${report.chargedUsd.toFixed(4)} charged by OpenRouter` : ""} of $${ledger.budgetUsd} (ledger providers1, stage ${args.door === "openrouter" ? "O" : "B"}).`);
  process.exit(code);
}

/** OpenRouter's own record of each generation (free; may lag a few seconds): its charge, the upstream, the model. The
 * generation id is the reply's `request-id` (= `x-generation-id`); the reply's own `id` is the upstream's message id. */
async function openRouterCharges(list = calls, into = report) {
  const generations = list.filter((call) => call.requestId?.startsWith("gen-"));
  if (!generations.length) return;
  await sleep(5_000);
  let charged = 0;
  for (const call of generations) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetch(`${door.baseUrl}/v1/generation?id=${encodeURIComponent(call.requestId)}`, { headers: { authorization: `Bearer ${door.apiKey}` } });
      if (response.ok) {
        const data = (await response.json().catch(() => null))?.data ?? {};
        call.generation = { upstream: data.provider_name ?? null, model: data.model ?? null, totalCostUsd: data.total_cost ?? null,
          tokensPrompt: data.tokens_prompt ?? null, tokensCompletion: data.tokens_completion ?? null, cacheDiscount: data.cache_discount ?? null,
          latencyMs: data.latency ?? null, generationMs: data.generation_time ?? null, finishReason: data.native_finish_reason ?? data.finish_reason ?? null };
        call.upstream = call.upstream ?? call.generation.upstream;
        charged += Number(call.generation.totalCostUsd ?? 0);
        break;
      }
      await sleep(3_000);
    }
  }
  into.chargedUsd = Number(charged.toFixed(6));
}

/** One short call straight through the door (the app's request shape for its small checks). */
async function shortCall(appId, label, body) {
  const response = await fetch(door.messagesUrl, { method: "POST", headers: door.headers(door.apiKey),
    body: JSON.stringify({ model: door.modelId(appId), max_tokens: 10, messages: [{ role: "user", content: "Reply with one word: ready" }], ...body }),
    signal: AbortSignal.timeout(90_000) });
  const value = await response.json().catch(() => null);
  const usage = value?.usage ?? {};
  const costUsd = response.ok ? costOf(appId, usage) : 0;
  const entry = { label, appModel: appId, providerModel: door.modelId(appId), status: response.status,
    code: response.ok ? null : anthropicErrorCode(value, response.headers), ...servedOf(response.ok ? value : null),
    requestedMatches: response.ok && value?.model ? appModelId(value.model) === appId : null,
    stopReason: value?.stop_reason ?? null,
    text: (value?.content ?? []).filter((block) => block.type === "text").map((block) => block.text).join("").slice(0, 80),
    blocks: (value?.content ?? []).map((block) => block.type),
    usage: { inputTokens: usage.input_tokens ?? 0, outputTokens: usage.output_tokens ?? 0, cacheReadTokens: usage.cache_read_input_tokens ?? 0,
      cacheWriteTokens: usage.cache_creation_input_tokens ?? 0 },
    costUsd: Number(costUsd.toFixed(6)),
    error: response.ok ? null : String(value?.error?.message ?? value?.message ?? "").slice(0, 300) };
  report.short.push(entry);
  report.spentUsd += costUsd;
  save();
  console.log(`${label}: HTTP ${entry.status}${entry.code ? ` ${entry.code}` : ""} · served ${entry.servedModel ?? "?"}${entry.upstream ? ` via ${entry.upstream}` : ""} · ${entry.usage.inputTokens} in / ${entry.usage.outputTokens} out · $${entry.costUsd.toFixed(6)} · stop ${entry.stopReason} · «${entry.text}»`);
  return entry;
}

const refusal = (entry) => [401, 402, 403, 404].includes(entry.status);

if (door.provider === "openrouter") {
  // 1. Haiku 5.5, ten tokens, the roll check's own request shape (no thinking, effort low).
  if (wanted("haiku")) {
    const haiku = await shortCall("claude-haiku-5-5", "Haiku 5.5", { thinking: { type: "disabled" }, output_config: { effort: "low" } });
    if (haiku.status !== 200) {
      stopped = refusal(haiku) ? `OpenRouter refused Haiku 5.5 (HTTP ${haiku.status}): ${haiku.error}` : `the Haiku 5.5 call failed (HTTP ${haiku.status})`;
      console.log(`Stopped: ${stopped}`);
      await finish(1);
    }
  }

  // 2. One Opus 5.5 DM turn through the app's own loop (durable begin, tools, receipts, the roll check, atomic commit).
  if (wanted("dm")) {
    const { runLoopScenario, createLoopBudget } = await import("./lib/loop-harness.mjs");
    const scenario = { name: "providers-smoke", title: `One DM turn on ${door.providerLabel}`, runtime: "dm-loop-v1", language: "en",
      steps: [{ id: "lock", say: "I kneel by the old iron-bound chest in the corner and try to pick its lock with the tip of my knife.", expect: [{ outcome: "committed" }] }] };
    const records = [];
    const before = calls.length;
    // The Fable call after the turn keeps its own reserve (ten tokens at Fable's prices, with room for its thinking).
    const budget = createLoopBudget(Math.max(0, ledger.budgetUsd - report.spentUsd - (wanted("fable") ? 0.05 : 0)));
    await runLoopScenario(scenario, { live: true, model: "opus", effort: args.effort, budget, apiKey: door.apiKey, appChecks: true,
      runId: `${runId}-dm`, write: (record) => records.push(record) });
    await Promise.all(pending);
    report.spentUsd += budget.spentUsd;
    const turn = records.filter((record) => record.type === "turn").at(-1);
    const turnCalls = calls.slice(before);
    const opusId = door.modelId("claude-opus-5-5");
    const haikuId = door.modelId("claude-haiku-5-5");
    report.dm = { outcome: turn?.outcome ?? null, errorCode: turn?.errorCode ?? null, failure: turn?.failure ?? [], exception: turn?.exception ?? null,
      effort: args.effort, requests: turn?.calls?.length ?? 0, tokens: turn?.tokens ?? null, costUsd: turn?.costUsd ?? null,
      durationMs: turn?.durationMs ?? null, firstWordMs: turn?.firstWordMs ?? null, cacheReadShare: turn?.cacheReadShare ?? null,
      rolls: turn?.effects?.rolls ?? [], tools: turn?.effects?.accepted ?? [], rejected: turn?.effects?.rejected ?? [], checks: turn?.checks ?? [],
      // The in-turn roll check is a Haiku 5.5 request of its own (the guard's call list).
      rollCheckCalls: turnCalls.filter((call) => call.model === haikuId).map((call) => ({ status: call.status, requestId: call.requestId,
        servedModel: call.servedModel ?? null, upstream: call.upstream ?? null, messageId: call.messageId ?? null })),
      opusCalls: turnCalls.filter((call) => call.model === opusId).map((call) => ({ status: call.status, requestId: call.requestId,
        servedModel: call.servedModel ?? null, upstream: call.upstream ?? null, messageId: call.messageId ?? null, servedModelMatches: call.servedModelMatches ?? null })),
      narration: turn?.narration ?? null, calls: turn?.calls ?? [], budgetSpentUsd: Number(budget.spentUsd.toFixed(6)) };
    writeFileSync(`${base}.jsonl`, records.map((record) => JSON.stringify(record)).join("\n") + "\n");
    save();
    console.log(`DM TURN ${String(report.dm.outcome).toUpperCase()}: Opus 5.5 on ${door.providerLabel}${report.dm.errorCode ? ` (${report.dm.errorCode})` : ""} · ${report.dm.requests} requests · $${(report.dm.costUsd ?? 0).toFixed(4)} · rolls ${report.dm.rolls.length} · roll-check calls ${report.dm.rollCheckCalls.length} · ${((report.dm.durationMs ?? 0) / 1000).toFixed(1)} s`);
    if (report.dm.outcome !== "committed") { stopped = `the Opus 5.5 turn did not commit (${report.dm.errorCode ?? report.dm.exception ?? "no record"})`; }
  }

  // 3. Fable 5.1, ten tokens (thinking is always on there: the ten tokens may all go to it, which is still a served call).
  if (wanted("fable") && !stopped) await shortCall("claude-fable-5-1", "Fable 5.1", { output_config: { effort: "low" } });
} else {
  // Bedrock: the 4.5 generation only (the 5.5 models are at 0 for this account). Haiku 4.5 takes no effort parameter.
  if (wanted("haiku")) {
    const haiku = await shortCall("claude-haiku-4-5", "Haiku 4.5", {});
    if (haiku.status !== 200) {
      stopped = refusal(haiku) ? `Amazon Bedrock refused Haiku 4.5 (HTTP ${haiku.status} ${haiku.code ?? ""}): ${haiku.error}` : `the Haiku 4.5 call failed (HTTP ${haiku.status})`;
      console.log(`Stopped: ${stopped}`);
      await finish(1);
    }
  }
  if (wanted("opus")) await shortCall("claude-opus-4-5", "Opus 4.5", { output_config: { effort: "low" } });
}
await finish(stopped ? 1 : 0);
