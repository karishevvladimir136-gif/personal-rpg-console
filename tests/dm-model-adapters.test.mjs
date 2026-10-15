// Contract tests for the DmModel adapters on hand-written stream recordings in
// the documented formats (docs/MODELS.md). No network, no keys.
import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only"
    ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
    : nextResolve(specifier, context);
} });
const dm = await import("../src/lib/server/dm/model/index.ts");
hook.deregister();
const {
  createAnthropicDmModel, createOpenAiDmModel, createDmModel, anthropicRequestBody, openAiRequestBody,
  compileToolset, validateToolArguments, DmToolSchemaError, DmModelError, dmModels, dmUsageCost, dmRequestReservation,
} = dm;

const KEY = "synthetic-test-key-not-real";
const rollTool = {
  name: "roll",
  description: "Roll dice on the server.",
  parameters: { type: "object", properties: {
    formula: { type: "string", description: "Dice formula such as 1d20+3.", maxLength: 40 },
    reason: { type: "string", description: "Why the roll is made.", maxLength: 160 },
  } },
};
const toolset = compileToolset([rollTool]);
const request = (extra = {}) => ({
  system: [{ text: "STABLE DM PREFIX", cache: true }, { text: "Scene: the mill.", cache: false }],
  messages: [{ role: "user", text: "Я осматриваюсь." }],
  toolset, effort: "medium", maxOutputTokens: 2000, ...extra,
});

// --- stream helpers --------------------------------------------------------
const sse = (events) => events.map(([event, data]) =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`).join("");
/** Body delivered in small chunks so the parser must handle split events. */
function body(text, { failAfter = null } = {}) {
  const bytes = new TextEncoder().encode(text);
  let offset = 0;
  return new ReadableStream({
    pull(controller) {
      if (failAfter !== null && offset >= failAfter) {
        controller.error(new TypeError("terminated"));
        return;
      }
      if (offset >= bytes.length) { controller.close(); return; }
      const end = Math.min(bytes.length, offset + 37, failAfter ?? Infinity);
      controller.enqueue(bytes.slice(offset, end));
      offset = end;
    },
  });
}
const ok = (text, options) => new Response(body(text, options), { status: 200,
  headers: { "content-type": "text/event-stream" } });
const fail = (status, payload, headers = {}) => new Response(JSON.stringify(payload), { status, headers });
function fetcher(...responses) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body), headers: init.headers });
    const next = responses.shift();
    if (!next) throw new Error("no more recorded responses");
    return typeof next === "function" ? next() : next;
  };
  fn.calls = calls;
  return fn;
}
async function collect(model, req = request()) {
  const events = [];
  try {
    for await (const event of model.stream(req)) events.push(event);
    return { events };
  } catch (error) {
    return { events, error };
  }
}
const sleeps = [];
const options = (fetch, extra = {}) => ({ apiKey: KEY, fetcher: fetch, sleep: async (ms) => { sleeps.push(ms); }, ...extra });
const text = (events) => events.filter((e) => e.type === "text_delta").map((e) => e.text).join("");

// --- Anthropic recordings ---------------------------------------------------
const aStart = (usage = { input_tokens: 12, cache_creation_input_tokens: 0, cache_read_input_tokens: 3000, output_tokens: 1 }) =>
  ["message_start", { type: "message_start", message: { id: "msg_1", type: "message", role: "assistant",
    content: [], model: "claude-opus-5-5", stop_reason: null, usage } }];
const aThinking = (index) => [
  ["content_block_start", { type: "content_block_start", index, content_block: { type: "thinking", thinking: "", signature: "" } }],
  ["content_block_delta", { type: "content_block_delta", index, delta: { type: "signature_delta", signature: "SIG-1" } }],
  ["content_block_stop", { type: "content_block_stop", index }],
];
const aText = (index, parts) => [
  ["content_block_start", { type: "content_block_start", index, content_block: { type: "text", text: "" } }],
  ["ping", { type: "ping" }],
  ...parts.map((part) => ["content_block_delta", { type: "content_block_delta", index, delta: { type: "text_delta", text: part } }]),
  ["content_block_stop", { type: "content_block_stop", index }],
];
const aTool = (index, id, json) => [
  ["content_block_start", { type: "content_block_start", index, content_block: { type: "tool_use", id, name: "roll", input: {} } }],
  ...json.map((part) => ["content_block_delta", { type: "content_block_delta", index, delta: { type: "input_json_delta", partial_json: part } }]),
  ["content_block_stop", { type: "content_block_stop", index }],
];
const aEnd = (reason, output = 42) => [
  ["message_delta", { type: "message_delta", delta: { stop_reason: reason, stop_sequence: null }, usage: { output_tokens: output } }],
  ["message_stop", { type: "message_stop" }],
];

test("Anthropic: text only, with signed thinking kept for replay and cache-read usage", async () => {
  const f = fetcher(ok(sse([aStart(), ...aThinking(0), ...aText(1, ["Мельница ", "скрипит."]), ...aEnd("end_turn")])));
  const { events, error } = await collect(createAnthropicDmModel("claude-opus-5-5", options(f)));
  assert.equal(error, undefined);
  assert.equal(text(events), "Мельница скрипит.");
  const usage = events.find((e) => e.type === "usage").usage;
  assert.deepEqual(usage, { inputTokens: 3012, outputTokens: 42, cacheReadTokens: 3000, cacheWriteTokens: 0, reasoningTokens: null });
  const stop = events.at(-1);
  assert.equal(stop.type, "stop");
  assert.equal(stop.reason, "end");
  assert.deepEqual(stop.native.items.map((item) => item.type), ["thinking", "text"]);
  assert.equal(stop.native.items[0].signature, "SIG-1");
  assert.equal(f.calls[0].url, "https://api.anthropic.com/v1/messages");
  assert.equal(f.calls[0].headers["x-api-key"], KEY);
  assert.equal(f.calls[0].headers["anthropic-version"], "2023-06-01");
  assert.equal(f.calls[0].body.stream, true);
  assert.deepEqual(f.calls[0].body.output_config, { effort: "medium" });
  assert.equal(f.calls[0].body.thinking, undefined);
  assert.equal(f.calls[0].body.tool_choice, undefined, "forced tool choice is unavailable on Opus 5.5");
});

test("Anthropic: one tool call streams its arguments; two parallel calls arrive in order", async () => {
  const one = fetcher(ok(sse([aStart(), ...aThinking(0), ...aTool(1, "toolu_1", ['{"formula": "1d2', '0+3", "reason": "засада"}']),
    ...aEnd("tool_use", 60)])));
  const single = await collect(createAnthropicDmModel(undefined, options(one)));
  const call = single.events.find((e) => e.type === "tool_call");
  assert.deepEqual(call, { type: "tool_call", id: "toolu_1", name: "roll", arguments: '{"formula": "1d20+3", "reason": "засада"}' });
  assert.equal(single.events.at(-1).reason, "tool_use");
  assert.deepEqual(single.events.at(-1).native.items[1].input, { formula: "1d20+3", reason: "засада" });
  const two = fetcher(ok(sse([aStart(), ...aText(0, ["Бросаю дважды."]),
    ...aTool(1, "toolu_a", ['{"formula":"1d6","reason":"a"}']), ...aTool(2, "toolu_b", ['{"formula":"1d8","reason":"b"}']),
    ...aEnd("tool_use")])));
  const parallel = await collect(createAnthropicDmModel(undefined, options(two)));
  assert.deepEqual(parallel.events.filter((e) => e.type === "tool_call").map((e) => e.id), ["toolu_a", "toolu_b"]);
});

test("Anthropic: continuation replays the native turn unchanged and returns all tool results in one message", () => {
  const native = { providerId: "anthropic", modelId: "claude-opus-5-5", items: [
    { type: "thinking", thinking: "", signature: "SIG-1" },
    { type: "tool_use", id: "toolu_a", name: "roll", input: { formula: "1d6", reason: "a" } },
    { type: "tool_use", id: "toolu_b", name: "roll", input: { formula: "1d8", reason: "b" } },
  ] };
  const body = anthropicRequestBody("claude-opus-5-5", request({ messages: [
    { role: "user", text: "Я атакую." },
    { role: "assistant", text: "", toolCalls: [], native },
    { role: "tool_results", results: [
      { callId: "toolu_a", output: '{"total":4}', isError: false },
      { callId: "toolu_b", output: "formula rejected: 1d0", isError: true },
    ] },
  ] }));
  assert.deepEqual(body.messages[1], { role: "assistant", content: native.items });
  assert.deepEqual(body.messages[2], { role: "user", content: [
    { type: "tool_result", tool_use_id: "toolu_a", content: '{"total":4}' },
    { type: "tool_result", tool_use_id: "toolu_b", content: "formula rejected: 1d0", is_error: true },
  ] });
  assert.deepEqual(body.system, [
    { type: "text", text: "STABLE DM PREFIX", cache_control: { type: "ephemeral" } },
    { type: "text", text: "Scene: the mill." },
  ]);
  assert.deepEqual(body.cache_control, { type: "ephemeral" });
  assert.equal(body.tools[0].strict, true);
  // A turn recorded by another model is rebuilt from neutral fields.
  const foreign = anthropicRequestBody("claude-opus-5-5", request({ messages: [
    { role: "user", text: "x" },
    { role: "assistant", text: "Ок.", toolCalls: [{ id: "call_1", name: "roll", arguments: '{"formula":"1d4","reason":"r"}' }],
      native: { providerId: "openai", modelId: "gpt-6-astra", items: [{ type: "reasoning" }] } },
  ] }));
  assert.deepEqual(foreign.messages[1].content, [{ type: "text", text: "Ок." },
    { type: "tool_use", id: "call_1", name: "roll", input: { formula: "1d4", reason: "r" } }]);
});

test("Anthropic: output limit and refusal are reported as stop reasons", async () => {
  const limited = await collect(createAnthropicDmModel(undefined, options(fetcher(ok(sse([aStart(),
    ...aText(0, ["Длинный отв"]), ...aEnd("max_tokens", 2000)]))))));
  assert.equal(limited.events.at(-1).reason, "max_tokens");
  const refused = await collect(createAnthropicDmModel(undefined, options(fetcher(ok(sse([aStart(), ...aEnd("refusal", 3)]))))));
  assert.equal(refused.events.at(-1).reason, "refusal");
  assert.equal(refused.events.at(-1).providerReason, "refusal");
});

test("Anthropic: 429 and 5xx before the first event are retried; failures mid-stream are not", async () => {
  sleeps.length = 0;
  const retried = fetcher(fail(429, { type: "error", error: { type: "rate_limit_error", message: "slow down" } }, { "retry-after": "2" }),
    fail(529, { type: "error", error: { type: "overloaded_error", message: "Overloaded" } }),
    ok(sse([aStart(), ...aText(0, ["Готово."]), ...aEnd("end_turn")])));
  const result = await collect(createAnthropicDmModel(undefined, options(retried)));
  assert.equal(result.error, undefined);
  assert.equal(text(result.events), "Готово.");
  assert.equal(retried.calls.length, 3);
  assert.deepEqual(sleeps, [2000, 1000]);
  const always429 = fetcher(...Array.from({ length: 3 }, () =>
    fail(429, { type: "error", error: { type: "rate_limit_error", message: "x" } })));
  const limited = await collect(createAnthropicDmModel(undefined, options(always429)));
  assert.equal(limited.error.kind, "rate_limited");
  assert.equal(limited.error.detail.attempts, 3);
  // An in-stream error after text was shown: surfaced once, never retried.
  const midStream = fetcher(ok(sse([aStart(), ...aText(0, ["Нача"]).slice(0, 3),
    ["error", { type: "error", error: { type: "overloaded_error", message: "Overloaded" } }]])), ok("unused"));
  const broken = await collect(createAnthropicDmModel(undefined, options(midStream)));
  assert.equal(text(broken.events), "Нача");
  assert.equal(broken.error.kind, "retryable_transport");
  assert.equal(broken.error.detail.afterFirstEvent, true);
  assert.equal(midStream.calls.length, 1);
  // A dropped connection after text: same rule.
  const recording = sse([aStart(), ...aText(0, ["Раз", "два"]), ...aEnd("end_turn")]);
  const dropped = fetcher(() => ok(recording, { failAfter: recording.indexOf("два") + 10 }), ok("unused"));
  const cut = await collect(createAnthropicDmModel(undefined, options(dropped)));
  assert.equal(cut.error.detail.afterFirstEvent, true);
  assert.equal(dropped.calls.length, 1);
  // A dropped connection before any event is retried.
  const early = fetcher(() => ok(recording, { failAfter: 20 }), ok(recording));
  const recovered = await collect(createAnthropicDmModel(undefined, options(early)));
  assert.equal(recovered.error, undefined);
  assert.equal(text(recovered.events), "Раздва");
});

test("Anthropic: rejected and unauthorized requests are not retried; a missing key never calls the API", async () => {
  const rejected = fetcher(fail(400, { type: "error", error: { type: "invalid_request_error",
    message: `bad request for key ${KEY}` } }));
  const bad = await collect(createAnthropicDmModel(undefined, options(rejected)));
  assert.equal(bad.error.kind, "provider_rejected");
  assert.equal(rejected.calls.length, 1);
  assert.ok(!bad.error.message.includes(KEY), "the key is redacted from provider messages");
  const unauthorized = await collect(createAnthropicDmModel(undefined, options(fetcher(fail(401,
    { type: "error", error: { type: "authentication_error", message: "invalid x-api-key" } })))));
  assert.equal(unauthorized.error.kind, "not_configured");
  const saved = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    const none = fetcher();
    const missing = await collect(createAnthropicDmModel(undefined, { fetcher: none }));
    assert.ok(missing.error instanceof DmModelError);
    assert.equal(missing.error.kind, "not_configured");
    assert.match(missing.error.message, /ANTHROPIC_API_KEY/);
    assert.equal(none.calls.length, 0);
  } finally { if (saved !== undefined) process.env.ANTHROPIC_API_KEY = saved; }
  const controller = new AbortController();
  controller.abort();
  const aborted = await collect(createAnthropicDmModel(undefined, options(async () => { throw new DOMException("aborted", "AbortError"); })),
    request({ signal: controller.signal }));
  assert.equal(aborted.error.kind, "fatal");
});

// --- OpenAI recordings -------------------------------------------------------
const oCreated = ["response.created", { type: "response.created", sequence_number: 0, response: { id: "resp_1", status: "in_progress" } }];
const oReasoning = (index) => ["response.output_item.done", { type: "response.output_item.done", sequence_number: 1,
  output_index: index, item: { type: "reasoning", id: `rs_${index}`, summary: [], encrypted_content: "ENC" } }];
const oText = (index, parts) => [
  ...parts.map((part, n) => ["response.output_text.delta", { type: "response.output_text.delta", sequence_number: 2 + n,
    item_id: "msg_1", output_index: index, content_index: 0, delta: part }]),
  ["response.output_item.done", { type: "response.output_item.done", sequence_number: 9, output_index: index,
    item: { type: "message", id: "msg_1", role: "assistant", status: "completed",
      content: [{ type: "output_text", text: parts.join(""), annotations: [] }] } }],
];
const oTool = (index, callId, args) => [
  ["response.function_call_arguments.delta", { type: "response.function_call_arguments.delta", sequence_number: 3,
    item_id: `fc_${index}`, output_index: index, delta: args.slice(0, 5) }],
  ["response.function_call_arguments.done", { type: "response.function_call_arguments.done", sequence_number: 4,
    item_id: `fc_${index}`, output_index: index, arguments: args }],
  ["response.output_item.done", { type: "response.output_item.done", sequence_number: 5, output_index: index,
    item: { type: "function_call", id: `fc_${index}`, call_id: callId, name: "roll", arguments: args, status: "completed" } }],
];
const oUsage = { input_tokens: 3200, input_tokens_details: { cached_tokens: 3000, cache_write_tokens: 0 },
  output_tokens: 50, output_tokens_details: { reasoning_tokens: 20 }, total_tokens: 3250 };
const oDone = (usage = oUsage) => ["response.completed", { type: "response.completed", sequence_number: 20,
  response: { id: "resp_1", status: "completed", usage } }];

test("OpenAI: text only with encrypted reasoning kept for replay and cache-read usage", async () => {
  const f = fetcher(ok(sse([oCreated, oReasoning(0), ...oText(1, ["Мельница ", "скрипит."]), oDone()])));
  const { events, error } = await collect(createOpenAiDmModel("gpt-6-astra", options(f)));
  assert.equal(error, undefined);
  assert.equal(text(events), "Мельница скрипит.");
  assert.deepEqual(events.find((e) => e.type === "usage").usage,
    { inputTokens: 3200, outputTokens: 50, cacheReadTokens: 3000, cacheWriteTokens: 0, reasoningTokens: 20 });
  const stop = events.at(-1);
  assert.equal(stop.reason, "end");
  assert.deepEqual(stop.native.items.map((item) => item.type), ["reasoning", "message"]);
  assert.equal(stop.native.items[0].encrypted_content, "ENC");
  const sent = f.calls[0].body;
  assert.equal(f.calls[0].url, "https://api.openai.com/v1/responses");
  assert.equal(f.calls[0].headers.Authorization, `Bearer ${KEY}`);
  assert.deepEqual([sent.stream, sent.store, sent.service_tier, sent.reasoning.effort, sent.max_output_tokens],
    [true, false, "default", "medium", 2000]);
  assert.equal(sent.instructions, "STABLE DM PREFIX");
  assert.deepEqual(sent.input[0], { role: "developer", content: "Scene: the mill." });
  assert.deepEqual(sent.include, ["reasoning.encrypted_content"]);
});

test("OpenAI: one tool call and two parallel calls; continuation returns reasoning with the outputs", async () => {
  const one = await collect(createOpenAiDmModel(undefined, options(fetcher(ok(sse([oCreated, oReasoning(0),
    ...oTool(1, "call_1", '{"formula":"1d20+3","reason":"засада"}'), oDone()]))))));
  assert.deepEqual(one.events.find((e) => e.type === "tool_call"),
    { type: "tool_call", id: "call_1", name: "roll", arguments: '{"formula":"1d20+3","reason":"засада"}' });
  assert.equal(one.events.at(-1).reason, "tool_use");
  const two = await collect(createOpenAiDmModel(undefined, options(fetcher(ok(sse([oCreated,
    ...oTool(0, "call_a", '{"formula":"1d6","reason":"a"}'), ...oTool(1, "call_b", '{"formula":"1d8","reason":"b"}'), oDone()]))))));
  assert.deepEqual(two.events.filter((e) => e.type === "tool_call").map((e) => e.id), ["call_a", "call_b"]);
  const native = two.events.at(-1).native;
  const body = openAiRequestBody("gpt-6-astra", request({ messages: [
    { role: "user", text: "Я атакую." },
    { role: "assistant", text: "", toolCalls: [], native },
    { role: "tool_results", results: [
      { callId: "call_a", output: '{"total":4}', isError: false },
      { callId: "call_b", output: "formula rejected", isError: true },
    ] },
  ] }));
  assert.deepEqual(body.input.slice(2, 4), native.items);
  assert.deepEqual(body.input.slice(4), [
    { type: "function_call_output", call_id: "call_a", output: '{"total":4}' },
    { type: "function_call_output", call_id: "call_b", output: "ERROR: formula rejected" },
  ]);
  assert.deepEqual([body.tool_choice, body.parallel_tool_calls, body.tools[0].strict], ["auto", true, true]);
});

test("OpenAI: output limit, refusal and failed responses", async () => {
  const limited = await collect(createOpenAiDmModel(undefined, options(fetcher(ok(sse([oCreated, ...oText(0, ["Длинн"]),
    ["response.incomplete", { type: "response.incomplete", sequence_number: 9, response: { status: "incomplete",
      incomplete_details: { reason: "max_output_tokens" }, usage: oUsage } }]]))))));
  assert.equal(limited.events.at(-1).reason, "max_tokens");
  const refused = await collect(createOpenAiDmModel(undefined, options(fetcher(ok(sse([oCreated,
    ["response.refusal.delta", { type: "response.refusal.delta", sequence_number: 2, item_id: "msg_1", output_index: 0, content_index: 0, delta: "Не могу" }],
    ["response.output_item.done", { type: "response.output_item.done", sequence_number: 3, output_index: 0,
      item: { type: "message", id: "msg_1", role: "assistant", status: "completed", content: [{ type: "refusal", refusal: "Не могу" }] } }],
    oDone()]))))));
  assert.equal(refused.events.at(-1).reason, "refusal");
  assert.equal(text(refused.events), "", "refusal text is not narration");
  const failed = await collect(createOpenAiDmModel(undefined, options(fetcher(ok(sse([oCreated,
    ["response.failed", { type: "response.failed", sequence_number: 2, response: { status: "failed",
      error: { code: "invalid_prompt", message: "rejected" } } }]]))))));
  assert.equal(failed.error.kind, "provider_rejected");
});

test("OpenAI: rate limits and 5xx retry before the first event; quota errors and mid-stream errors do not", async () => {
  sleeps.length = 0;
  const retried = fetcher(fail(429, { error: { code: "rate_limit_exceeded", message: "slow" } }, { "retry-after": "1" }),
    fail(500, { error: { code: "server_error", message: "oops" } }), ok(sse([oCreated, ...oText(0, ["Ок"]), oDone()])));
  const result = await collect(createOpenAiDmModel(undefined, options(retried)));
  assert.equal(result.error, undefined);
  assert.equal(retried.calls.length, 3);
  assert.deepEqual(sleeps, [1000, 1000]);
  const quota = fetcher(fail(429, { error: { code: "insufficient_quota", type: "insufficient_quota", message: "no credits" } }));
  const noQuota = await collect(createOpenAiDmModel(undefined, options(quota)));
  assert.equal(noQuota.error.kind, "provider_rejected");
  assert.equal(quota.calls.length, 1);
  const midStream = fetcher(ok(sse([oCreated, ...oText(0, ["Нача"]).slice(0, 1),
    ["error", { type: "error", sequence_number: 3, code: "server_error", message: "boom", param: null }]])), ok("unused"));
  const broken = await collect(createOpenAiDmModel(undefined, options(midStream)));
  assert.equal(text(broken.events), "Нача");
  assert.equal(broken.error.detail.afterFirstEvent, true);
  assert.equal(midStream.calls.length, 1);
  const saved = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const none = fetcher();
    const missing = await collect(createOpenAiDmModel(undefined, { fetcher: none }));
    assert.equal(missing.error.kind, "not_configured");
    assert.match(missing.error.message, /OPENAI_API_KEY/);
    assert.equal(none.calls.length, 0);
  } finally { if (saved !== undefined) process.env.OPENAI_API_KEY = saved; }
});

test("factory picks the adapter for a pinned selection and refuses unknown models without network", () => {
  assert.equal(createDmModel({ providerId: "anthropic", modelId: "claude-opus-5-5" }, { apiKey: KEY }).providerId, "anthropic");
  assert.equal(createDmModel({ providerId: "openai", modelId: "gpt-6-astra" }, { apiKey: KEY }).providerId, "openai");
  assert.throws(() => createDmModel({ providerId: "openai", modelId: "gpt-5.4" }), { kind: "not_configured" });
  assert.throws(() => createDmModel({ providerId: "other", modelId: "x" }), { kind: "not_configured" });
});

// --- schema compiler ----------------------------------------------------------
const upsert = {
  name: "upsert_character",
  description: "Create or update an NPC.",
  parameters: { type: "object", properties: {
    name: { type: "string", maxLength: 80 },
    kind: { type: "string", enum: ["npc", "companion"] },
    note: { type: "string", optional: true, maxLength: 400 },
    hp: { type: "integer", nullable: true, minimum: 0, maximum: 999 },
    tags: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 5, optional: true },
    location: { type: "object", optional: true, properties: { id: { type: "string" }, known: { type: "boolean" } } },
  } },
};

test("schema compiler: Anthropic leaves optional fields out of required and moves bounds into descriptions", () => {
  const compiled = compileToolset([rollTool, upsert]).anthropic[1];
  const schema = compiled.input_schema;
  assert.equal(compiled.strict, true);
  assert.deepEqual(schema.required, ["name", "kind", "hp"]);
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.name.maxLength, undefined);
  assert.match(schema.properties.name.description, /at most 80 characters/);
  assert.deepEqual(schema.properties.hp.type, ["integer", "null"]);
  assert.equal(schema.properties.hp.minimum, undefined);
  assert.equal(schema.properties.tags.maxItems, undefined);
  assert.equal(schema.properties.tags.minItems, 1);
  assert.deepEqual(schema.properties.location.required, ["id", "known"]);
  assert.equal(schema.properties.location.additionalProperties, false);
  assert.ok(!/"(minLength|maxLength|minimum|maximum|maxItems|pattern)":/.test(JSON.stringify(schema)));
  assert.match(schema.properties.hp.description, /minimum 0; maximum 999/);
});

test("schema compiler: OpenAI makes every field required and optional fields nullable, keeping bounds", () => {
  const schema = compileToolset([upsert]).openai[0].parameters;
  assert.deepEqual(schema.required, ["name", "kind", "note", "hp", "tags", "location"]);
  assert.deepEqual(schema.properties.note.type, ["string", "null"]);
  assert.equal(schema.properties.note.maxLength, 400);
  assert.deepEqual(schema.properties.kind, { type: "string", enum: ["npc", "companion"] });
  assert.deepEqual(schema.properties.tags.type, ["array", "null"]);
  assert.deepEqual([schema.properties.tags.minItems, schema.properties.tags.maxItems], [1, 5]);
  assert.deepEqual(schema.properties.location.type, ["object", "null"]);
  assert.deepEqual(schema.properties.location.required, ["id", "known"]);
});

test("schema compiler: provider limits fail at compile time with every problem listed", () => {
  const tool = (name, properties) => ({ name, description: "x", parameters: { type: "object", properties } });
  const many = Array.from({ length: 21 }, (_, n) => tool(`t${n}`, { a: { type: "string" } }));
  assert.throws(() => compileToolset(many), (error) => error instanceof DmToolSchemaError && /21 strict tools/.test(error.message));
  const optional = Object.fromEntries(Array.from({ length: 25 }, (_, n) => [`o${n}`, { type: "string", optional: true }]));
  assert.throws(() => compileToolset([tool("opt", optional)]), /25 optional parameters exceed the limit of 24/);
  const nullable = Object.fromEntries(Array.from({ length: 17 }, (_, n) => [`n${n}`, { type: "string", nullable: true }]));
  assert.throws(() => compileToolset([tool("nul", nullable)]), /17 nullable \(union-type\) parameters exceed the limit of 16/);
  let deep = { type: "string" };
  for (let n = 0; n < 11; n++) deep = { type: "object", properties: { x: deep } };
  assert.throws(() => compileToolset([tool("deep", { x: deep })]), /nesting depth 12 exceeds the limit of 10/);
  try {
    compileToolset([tool("bad name!", {}), tool("dup", {}), tool("dup", { "bad-key": { type: "string" } })]);
    assert.fail("expected a schema error");
  } catch (error) {
    assert.ok(error instanceof DmToolSchemaError);
    assert.equal(error.problems.length, 3);
  }
});

test("server-side argument validation enforces what strict mode cannot", () => {
  assert.deepEqual(validateToolArguments(upsert, { name: "Мельник", kind: "npc", hp: null }), []);
  assert.deepEqual(validateToolArguments(upsert, { name: "Мельник", kind: "npc", hp: 5, note: null, tags: null, location: null }), []);
  const problems = validateToolArguments(upsert, { name: "x".repeat(81), kind: "god", hp: 1000, extra: 1, tags: [] });
  assert.equal(problems.length, 5, problems.join("; "));
  assert.deepEqual(validateToolArguments(upsert, { kind: "npc", hp: 3 }), ["upsert_character.name: missing"]);
});

test("cost by usage and the pre-request reservation use one price table", () => {
  const opus = dmModels["anthropic/claude-opus-5-5"];
  const astra = dmModels["openai/gpt-6-astra"];
  const usage = { inputTokens: 3012, outputTokens: 42, cacheReadTokens: 3000, cacheWriteTokens: 0, reasoningTokens: null };
  assert.equal(dmUsageCost(opus, usage), (12 * 4 + 3000 * 0.2 + 42 * 20) / 1_000_000);
  const written = { inputTokens: 3200, outputTokens: 50, cacheReadTokens: 0, cacheWriteTokens: 3000, reasoningTokens: 20 };
  assert.equal(dmUsageCost(astra, written), (200 * 10 + 3000 * 12.5 + 50 * 50) / 1_000_000);
  assert.ok(dmRequestReservation(astra, 12_800, 2000) > dmUsageCost(astra, { ...written, inputTokens: 12_800, outputTokens: 2000 }));
});
