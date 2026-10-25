// BEDROCK_PROVIDER_1: the same Claude models through a second door. Recorded fixtures only — no network, no key
// value in any assertion (the test key is synthetic and is only checked for presence).
import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { registerHooks } from "node:module";
import {
  anthropicApiKey, anthropicDoorOf, anthropicEndpoint, anthropicErrorCode, anthropicRequestId, appModelId,
  bedrockFailureKind,
} from "../src/lib/server/anthropic-endpoint.ts";
import { checkRollsTold } from "../src/lib/gameplay/dm-loop/roll-check.ts";
import { callProvenance, scriptDoorEnv } from "../scripts/eval/lib/anthropic-endpoint.mjs";
import { spendByProvider, ledgerTable } from "../scripts/eval/real-replay/lib/ledger.mjs";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only"
    ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
    : nextResolve(specifier, context);
} });
const { createAnthropicDmModel, DmModelError } = await import("../src/lib/server/dm/model/index.ts");
const { requestAnthropicStructured } = await import("../src/lib/server/dm/anthropic-structured.ts");
const { guardedModel } = await import("../scripts/eval/real-replay/lib/models.mjs");
hook.deregister();

const root = fileURLToPath(new URL("..", import.meta.url));
const FAKE = "synthetic-bedrock-test-key";
const BEDROCK = { ANTHROPIC_PROVIDER: "bedrock", AWS_REGION: "us-west-1", BEDROCK_API_KEY: FAKE };
const BEDROCK_URL = "https://bedrock-runtime.us-west-1.amazonaws.com/anthropic/v1/messages";

/** Runs fn with the door's variables in process.env, restoring them afterwards. */
async function withDoor(env, fn) {
  const names = ["ANTHROPIC_PROVIDER", "AWS_REGION", "BEDROCK_API_KEY", "ANTHROPIC_API_KEY"];
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  for (const name of names) if (env[name] === undefined) delete process.env[name]; else process.env[name] = env[name];
  try { return await fn(); }
  finally { for (const name of names) if (saved[name] === undefined) delete process.env[name]; else process.env[name] = saved[name]; }
}

const sse = (events) => events.map(([event, data]) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`).join("");
const STREAM = sse([
  ["message_start", { type: "message_start", message: { usage: { input_tokens: 12, output_tokens: 1 } } }],
  ["content_block_start", { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } }],
  ["content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "Мельница скрипит." } }],
  ["content_block_stop", { type: "content_block_stop", index: 0 }],
  ["message_delta", { type: "message_delta", delta: { stop_reason: "end_turn" }, usage: { output_tokens: 7 } }],
  ["message_stop", { type: "message_stop" }],
]);
function recorder(...responses) {
  const calls = [];
  const fetcher = async (url, init) => {
    calls.push({ url, headers: init.headers, body: JSON.parse(init.body) });
    const next = responses.shift();
    return typeof next === "function" ? next() : next;
  };
  return { calls, fetcher };
}
const streamed = (headers = {}) => () => new Response(STREAM, { status: 200, headers: { "content-type": "text/event-stream", ...headers } });
const failed = (status, payload, headers = {}) => () => new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json", ...headers } });
const request = { system: [{ text: "STABLE DM PREFIX", cache: true }], messages: [{ role: "user", text: "Я осматриваюсь." }],
  effort: "medium", maxOutputTokens: 2000 };
async function collect(stream) {
  const events = [];
  try { for await (const event of stream) events.push(event); return { events }; }
  catch (error) { return { events, error }; }
}

test("the anthropic door is the default: the Console's API, its key name, the app's ids unchanged", () => {
  const door = anthropicEndpoint({});
  assert.equal(door.provider, "anthropic");
  assert.equal(door.messagesUrl, "https://api.anthropic.com/v1/messages");
  assert.equal(door.endpointHost, "api.anthropic.com");
  assert.equal(door.keyName, "ANTHROPIC_API_KEY");
  for (const id of ["claude-opus-5-5", "claude-fable-5-1", "claude-sonnet-5-5", "claude-haiku-5-5", "claude-opus-5"])
    assert.equal(door.modelId(id), id);
  assert.equal(anthropicEndpoint({ ANTHROPIC_PROVIDER: "anthropic" }).provider, "anthropic");
  const headers = door.headers(FAKE);
  assert.deepEqual(Object.keys(headers).sort(), ["anthropic-version", "content-type", "x-api-key"]);
  assert.equal(headers["anthropic-version"], "2023-06-01");
  assert.equal(anthropicApiKey({ ANTHROPIC_API_KEY: FAKE, BEDROCK_API_KEY: "other" }).length, FAKE.length, "the Console's key on the anthropic door");
});

test("the bedrock door: the regional Anthropic-compatible endpoint, the Bedrock key, the global profile ids", () => {
  const door = anthropicEndpoint(BEDROCK);
  assert.equal(door.provider, "bedrock");
  assert.equal(door.messagesUrl, BEDROCK_URL);
  assert.equal(door.endpointHost, "bedrock-runtime.us-west-1.amazonaws.com");
  assert.equal(door.keyName, "BEDROCK_API_KEY");
  assert.equal(door.apiKey.length, FAKE.length);
  assert.equal(anthropicApiKey({ ...BEDROCK, ANTHROPIC_API_KEY: "console" }).length, FAKE.length, "never the Console's key on the bedrock door");
  assert.equal(door.modelId("claude-opus-5-5"), "global.anthropic.claude-opus-5-5");
  assert.equal(door.modelId("claude-fable-5-1"), "global.anthropic.claude-fable-5-1");
  assert.equal(door.modelId("claude-sonnet-5-5"), "global.anthropic.claude-sonnet-5-5");
  assert.equal(door.modelId("claude-haiku-5-5"), "global.anthropic.claude-haiku-5-5");
  assert.deepEqual(door.body({ model: "claude-haiku-5-5", max_tokens: 5 }), { model: "global.anthropic.claude-haiku-5-5", max_tokens: 5 });
  assert.equal(anthropicEndpoint({ ...BEDROCK, AWS_REGION: "eu-central-1" }).endpointHost, "bedrock-runtime.eu-central-1.amazonaws.com");
  assert.ok("x-api-key" in door.headers(FAKE) && "anthropic-version" in door.headers(FAKE), "the key travels as the Anthropic SDK sends it");
});

test("a door that cannot be used is not_configured: an unmapped id (named), no region, a bad region, an unknown provider", () => {
  const notConfigured = (fn, pattern) => assert.throws(fn, (error) => error.kind === "not_configured" && pattern.test(error.message));
  notConfigured(() => anthropicEndpoint(BEDROCK).modelId("claude-opus-5"), /claude-opus-5/);
  notConfigured(() => anthropicEndpoint({ ANTHROPIC_PROVIDER: "bedrock" }), /AWS_REGION/);
  notConfigured(() => anthropicEndpoint({ ...BEDROCK, AWS_REGION: "evil.example.com/x" }), /AWS_REGION/);
  notConfigured(() => anthropicEndpoint({ ANTHROPIC_PROVIDER: "vertex-secret-value" }), /anthropic or bedrock/);
  assert.throws(() => anthropicEndpoint({ ANTHROPIC_PROVIDER: "vertex-secret-value" }), (error) => !error.message.includes("vertex-secret-value"), "the value is never echoed");
  assert.equal(anthropicApiKey({ ANTHROPIC_PROVIDER: "bedrock", BEDROCK_API_KEY: FAKE }), "", "a door without its region has no key");
});

test("ids, request ids and error codes on either door", () => {
  assert.equal(appModelId("global.anthropic.claude-opus-5-5"), "claude-opus-5-5");
  assert.equal(appModelId("us.anthropic.claude-haiku-5-5"), "claude-haiku-5-5");
  assert.equal(appModelId("claude-sonnet-5-5"), "claude-sonnet-5-5");
  assert.equal(anthropicRequestId(new Headers({ "request-id": "req_011abc" })), "req_011abc");
  assert.equal(anthropicRequestId(new Headers({ "x-amzn-requestid": "30da692c-5ac0-4819-9bf9-9a04761cb3ef" })), "30da692c-5ac0-4819-9bf9-9a04761cb3ef");
  assert.equal(anthropicErrorCode({ message: "x" }, new Headers({ "x-amzn-errortype": "ThrottlingException:http://internal.amazon.com/coral/com.amazon.bedrock/" })), "ThrottlingException");
  assert.equal(anthropicErrorCode({ __type: "com.amazon.coral.service#AccessDeniedException" }), "AccessDeniedException");
  assert.equal(anthropicErrorCode({ type: "error", error: { type: "permission_error" } }), "permission_error");
  assert.equal(bedrockFailureKind("ThrottlingException"), "rate_limited");
  assert.equal(bedrockFailureKind("AccessDeniedException"), "not_configured");
  assert.equal(bedrockFailureKind("enforced_spend_limit_reached"), null, "Anthropic's own codes are not read as Bedrock's");
  assert.deepEqual(anthropicDoorOf(BEDROCK_URL), { provider: "bedrock", endpointHost: "bedrock-runtime.us-west-1.amazonaws.com" });
  assert.deepEqual(anthropicDoorOf("https://api.anthropic.com/v1/messages"), { provider: "anthropic", endpointHost: "api.anthropic.com" });
  assert.equal(anthropicDoorOf("https://api.openai.com/v1/responses"), null);
});

test("the DM's Messages request on each door: the URL, the headers, the mapped id; the stored id stays the app's", async () => {
  for (const [env, url, model] of [[{}, "https://api.anthropic.com/v1/messages", "claude-opus-5-5"], [BEDROCK, BEDROCK_URL, "global.anthropic.claude-opus-5-5"]]) {
    const f = recorder(streamed());
    const { events, error } = await withDoor(env, () => collect(createAnthropicDmModel("claude-opus-5-5", { apiKey: FAKE, fetcher: f.fetcher, maxRetries: 0 }).stream(request)));
    assert.equal(error, undefined);
    assert.equal(f.calls[0].url, url);
    assert.equal(f.calls[0].body.model, model);
    assert.equal(f.calls[0].headers["anthropic-version"], "2023-06-01");
    assert.ok(f.calls[0].headers["x-api-key"]);
    assert.equal(events.at(-1).native.modelId, "claude-opus-5-5", "thinking blocks stay bound to the app's id");
  }
  // Without an explicit key the bedrock door reads BEDROCK_API_KEY, never ANTHROPIC_API_KEY.
  const f = recorder(streamed());
  await withDoor({ ...BEDROCK, BEDROCK_API_KEY: undefined, ANTHROPIC_API_KEY: "console-key" }, async () => {
    const { error } = await collect(createAnthropicDmModel("claude-opus-5-5", { fetcher: f.fetcher, maxRetries: 0 }).stream(request));
    assert.ok(error instanceof DmModelError);
    assert.equal(error.kind, "not_configured");
    assert.match(error.message, /BEDROCK_API_KEY/);
  });
  assert.equal(f.calls.length, 0, "no request without the door's key");
});

test("Bedrock's errors: throttling waits and retries, a refused model is not_configured and named, never retried", async () => {
  const waits = [];
  const sleep = async (ms) => { waits.push(ms); };
  // 429 ThrottlingException (AWS-shaped body, the exception in the header): the bounded wait, then the stream.
  let f = recorder(failed(429, { message: "Too many tokens, please wait before trying again." }, { "x-amzn-errortype": "ThrottlingException" }), streamed());
  let result = await withDoor(BEDROCK, () => collect(createAnthropicDmModel("claude-opus-5-5", { apiKey: FAKE, fetcher: f.fetcher, maxRetries: 2, sleep }).stream(request)));
  assert.equal(result.error, undefined);
  assert.equal(f.calls.length, 2);
  assert.equal(waits.length, 1);
  // Throttled on every attempt: rate_limited with the code.
  f = recorder(...Array.from({ length: 3 }, () => failed(429, { message: "Too many requests" }, { "x-amzn-errortype": "ThrottlingException" })));
  result = await withDoor(BEDROCK, () => collect(createAnthropicDmModel("claude-opus-5-5", { apiKey: FAKE, fetcher: f.fetcher, maxRetries: 2, sleep }).stream(request)));
  assert.equal(result.error.kind, "rate_limited");
  assert.equal(result.error.detail.providerCode, "ThrottlingException");
  assert.equal(result.error.detail.attempts, 3);
  // 403 AccessDeniedException: model access not granted.
  f = recorder(failed(403, { message: "You don't have access to the model with the specified model ID." }, { "x-amzn-errortype": "AccessDeniedException" }), streamed());
  result = await withDoor(BEDROCK, () => collect(createAnthropicDmModel("claude-opus-5-5", { apiKey: FAKE, fetcher: f.fetcher, maxRetries: 2, sleep }).stream(request)));
  assert.equal(result.error.kind, "not_configured");
  assert.equal(result.error.detail.attempts, 1, "never retried");
  assert.equal(f.calls.length, 1);
  assert.match(result.error.message, /global\.anthropic\.claude-opus-5-5 \(claude-opus-5-5\)/);
  // Fable without the aws_review retention mode (the exception in the body).
  f = recorder(failed(403, { __type: "AccessDeniedException", message: "This model requires the data retention mode aws_review." }));
  result = await withDoor(BEDROCK, () => collect(createAnthropicDmModel("claude-fable-5-1", { apiKey: FAKE, fetcher: f.fetcher, maxRetries: 2, sleep }).stream(request)));
  assert.equal(result.error.kind, "not_configured");
  assert.match(result.error.message, /claude-fable-5-1/);
  assert.match(result.error.message, /aws_review/);
  // Recorded on the owner's account (us-west-1, 2026-10-25, the smoke's Haiku call): a model the account may not use is
  // an Anthropic-shaped 403 permission_error (no AccessDeniedException header). The same shape for the DM's model:
  const recorded = (id) => ({ type: "error", error: { type: "permission_error", message: `anthropic.${id} is not available for this account. You can explore other available models on Amazon Bedrock. For additional access options, contact AWS Sales at https://aws.amazon.com/contact-us/` } });
  f = recorder(failed(403, recorded("claude-opus-5-5"), { "x-amzn-requestid": "a9b91947-4e9a-4bb6-8c46-54d96dc213e1" }));
  result = await withDoor(BEDROCK, () => collect(createAnthropicDmModel("claude-opus-5-5", { apiKey: FAKE, fetcher: f.fetcher, maxRetries: 2, sleep }).stream(request)));
  assert.equal(result.error.kind, "not_configured");
  assert.equal(result.error.detail.attempts, 1, "never retried");
  assert.match(result.error.message, /global\.anthropic\.claude-opus-5-5 \(claude-opus-5-5\)/);
  // The in-turn check (Haiku 5.5) on the recorded refusal reports it and never throws (the turn goes on without the check).
  const refused = recorder(failed(403, recorded("claude-haiku-5-5")));
  const check = await withDoor(BEDROCK, () => checkRollsTold(FAKE, { narration: "The arrow hits.", rolls: ["attack 17"], language: "en" }, { fetcher: refused.fetcher }));
  assert.deepEqual(check.untold, []);
  assert.match(check.error, /403: permission_error/);
  // A key Bedrock does not accept is a key problem, not a refused model.
  f = recorder(failed(403, { type: "error", error: { type: "permission_error", message: "Invalid API Key format: Must start with pre-defined prefix" } }));
  result = await withDoor(BEDROCK, () => collect(createAnthropicDmModel("claude-opus-5-5", { apiKey: FAKE, fetcher: f.fetcher, maxRetries: 2, sleep }).stream(request)));
  assert.equal(result.error.kind, "not_configured");
  assert.match(result.error.message, /Invalid API Key/);
  // The Anthropic door's mapping is unchanged.
  f = recorder(failed(403, { type: "error", error: { type: "permission_error", message: "no" } }));
  result = await withDoor({}, () => collect(createAnthropicDmModel("claude-opus-5-5", { apiKey: FAKE, fetcher: f.fetcher, maxRetries: 2, sleep }).stream(request)));
  assert.equal(result.error.kind, "not_configured");
  assert.equal(result.error.detail.providerCode, "permission_error");
});

test("the in-turn checks and the opening's structured request take the door; a Bedrock reply's id is the app's", async () => {
  const reply = (model, text) => () => new Response(JSON.stringify({ model, stop_reason: "end_turn", content: [{ type: "text", text }],
    usage: { input_tokens: 100, output_tokens: 10 } }), { status: 200, headers: { "content-type": "application/json" } });
  const f = recorder(reply("global.anthropic.claude-haiku-5-5", '{"untold":[],"undeclared":[],"rolls":[{"n":1,"quote":"hit"}]}'));
  const check = await withDoor(BEDROCK, () => checkRollsTold(anthropicApiKey(), { narration: "The arrow hits.", rolls: ["attack 17"], language: "en" }, { fetcher: f.fetcher }));
  assert.equal(check.error, null);
  assert.equal(f.calls[0].url, BEDROCK_URL);
  assert.equal(f.calls[0].body.model, "global.anthropic.claude-haiku-5-5");
  const s = recorder(reply("global.anthropic.claude-opus-5-5", '{"ok":true}'));
  const structured = await withDoor(BEDROCK, () => requestAnthropicStructured({ apiKey: FAKE, model: "claude-opus-5-5", effort: "medium",
    system: "s", input: "i", schema: { type: "object", properties: { ok: { type: "boolean" } } }, fetcher: s.fetcher }));
  assert.equal(s.calls[0].url, BEDROCK_URL);
  assert.equal(s.calls[0].body.model, "global.anthropic.claude-opus-5-5");
  assert.equal(structured.usage.model, "claude-opus-5-5", "the SQL usage contract sees the app's id");
});

test("provenance: a harness call line names the door and Bedrock's request id; ledgers print spend per door", async () => {
  const log = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(STREAM, { status: 200, headers: { "content-type": "text/event-stream", "x-amzn-requestid": "a3c11008-cf30-463f-b889-26aa0ccbcefa" } });
  try {
    const budget = { limitUsd: 10, spentUsd: 0, reservedUsd: 0, exhausted: false, requests: 0 };
    const { model } = guardedModel({ providerId: "anthropic", modelId: "claude-opus-5-5" }, budget, FAKE, log);
    const { error } = await withDoor(BEDROCK, () => collect(model.stream(request)));
    assert.equal(error, undefined);
  } finally { globalThis.fetch = realFetch; }
  const line = log.find((row) => row.event === "http");
  assert.equal(line.provider, "bedrock");
  assert.equal(line.endpointHost, "bedrock-runtime.us-west-1.amazonaws.com");
  assert.equal(line.requestId, "a3c11008-cf30-463f-b889-26aa0ccbcefa");
  assert.deepEqual(callProvenance("openai", "https://api.openai.com/v1/responses"), { provider: "openai", endpointHost: "api.openai.com" });
  // The scripts' door from .env.local / the cloud's APP_ variables: only the door's own key is read.
  const reads = [];
  const env = scriptDoorEnv((name) => { reads.push(name); return { ANTHROPIC_PROVIDER: "bedrock", AWS_REGION: "us-west-1", BEDROCK_API_KEY: FAKE }[name] ?? null; });
  assert.deepEqual(Object.keys(env).sort(), ["ANTHROPIC_PROVIDER", "AWS_REGION", "BEDROCK_API_KEY"]);
  assert.ok(!reads.includes("ANTHROPIC_API_KEY"), "the Console's key is never read on the bedrock door");
  const ledger = { capUsd: 3, entries: [
    { run: "old", what: "before the switch", reservedUsd: 1, spentUsd: 0.5, settled: true },
    { run: "smoke", what: "smoke", provider: "bedrock", endpointHost: "bedrock-runtime.us-west-1.amazonaws.com", reservedUsd: 1, spentUsd: 0.25, settled: true },
  ] };
  assert.deepEqual(spendByProvider(ledger), { anthropic: 0.5, bedrock: 0.25 });
  assert.match(ledgerTable(ledger), /Spend per door: anthropic \$0\.5000 · bedrock \$0\.2500/);
});

test("no hard-coded endpoint: only the helper names a door's host; every script reads the Anthropic key through the door", () => {
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      if (name === "node_modules" || name === "out" || name.startsWith(".")) continue;
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(ts|tsx|mjs|js|cjs)$/.test(name)) files.push(path);
    }
  };
  walk(join(root, "src"));
  walk(join(root, "scripts"));
  const hosts = files.filter((file) => /api\.anthropic\.com|amazonaws\.com/.test(readFileSync(file, "utf8"))).map((file) => relative(root, file).replaceAll("\\", "/"));
  assert.deepEqual(hosts, ["src/lib/server/anthropic-endpoint.ts"]);
  const consoleKeyReads = files.filter((file) => /providerKey\("ANTHROPIC_API_KEY"\)|process\.env\.ANTHROPIC_API_KEY/.test(readFileSync(file, "utf8")))
    .map((file) => relative(root, file).replaceAll("\\", "/"));
  assert.deepEqual(consoleKeyReads, []);
});
