// Polish 2, part 5 (docs/stages/POLISH_2.md §5): the opening proposal written
// by the campaign's own DM whichever provider serves it. The registry admits the
// DM's Anthropic model for «world.compose»; the bootstrap server resolves the
// opening from the DM's choice before the policy; the Anthropic structured
// requester sends the bootstrap schema the way the Messages API takes it and
// keeps the model contract; migration 66 lets the SQL ticket carry that profile
// and the whole creation → opening flow commits with it. Fake transport only.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import test from "node:test";
import { resolveExecutionProfile, validateModelSelection } from "../src/lib/model-runtime/registry.ts";
import { createBootstrapService } from "../src/lib/adventures/bootstrap-service.ts";
import { setup } from "./universal-bootstrap-fixture.mjs";
import { anthropicEndpoint } from "../src/lib/server/anthropic-endpoint.ts";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only" ? { url: "data:text/javascript,export%20{}", shortCircuit: true } : nextResolve(specifier, context);
} });
const { anthropicStructuredSchema, requestAnthropicStructured } = await import("../src/lib/server/dm/anthropic-structured.ts");
const { createBootstrapProvider, openingProposalSchema, bootstrapInstructions } = await import("../src/lib/server/adventure-bootstrap-provider.ts");
hook.deregister();

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const KEY = "sk-ant-SECRET-0123456789";
const opus = { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" };
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
const proposal = { schemaVersion: 1, location: { name: "Причал", description: "Серый причал под дождём." }, situation: "Марта ждёт сорок монет.", narration: "Ты стоишь на причале. Марта смотрит на тебя. Что скажешь?", actors: [], questions: [] };
const reply = (output, extra = {}) => json({ model: "claude-opus-5-5", stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(output) }], usage: { input_tokens: 1200, output_tokens: 300 }, ...extra });

test("the registry admits the DM's Anthropic model for the opening (world.compose) and for nothing else but the turn", () => {
  assert.deepEqual(validateModelSelection(opus, "world.compose"), opus);
  assert.deepEqual(validateModelSelection(opus, "dm.turn"), opus);
  assert.throws(() => validateModelSelection(opus, "canon.compile"));
  assert.throws(() => validateModelSelection(opus));
  assert.throws(() => validateModelSelection({ providerId: "anthropic", modelId: "claude-haiku-5-5", reasoning: "low" }, "world.compose"), "only the DM models");
  const profile = resolveExecutionProfile({ task: "world.compose", profileId: randomUUID(), globalDefault: opus });
  assert.equal(profile.providerId, "anthropic");
  assert.equal(profile.modelId, "claude-opus-5-5");
  assert.equal(profile.registryVersion, "openai-responses-v1", "the profile DTO's version tag is unchanged (the SQL contract pins it)");
  // The bootstrap server resolves the opening from the DM's choice before the policy's primary.
  const bootstrap = src("src/lib/server/adventure-bootstrap.ts");
  // Fix run F (item 20): a new hero is drafted by the DM a new campaign gets (creationDm), before the app's model.
  assert.match(bootstrap, /campaignPolicy: dmTurn \|\| creationDm \? null : policy,\s*globalDefault: dmTurn \?\? creationDm \?\? applicationModelSelection\(process\.env\)/);
});

test("the schema for Anthropic's structured outputs: bounds and counts removed, a nullable type array becomes anyOf, additionalProperties stays false", () => {
  const stripped = anthropicStructuredSchema(openingProposalSchema);
  const text = JSON.stringify(stripped);
  assert.doesNotMatch(text, /minLength|maxLength|maxItems|minimum|maximum/);
  assert.deepEqual(stripped.properties.situation, { anyOf: [{ type: "string" }, { type: "null" }] });
  assert.deepEqual(stripped.properties.actors.items.properties.name, { type: "string" });
  assert.equal(stripped.additionalProperties, false);
  assert.deepEqual(stripped.required, openingProposalSchema.required);
  assert.deepEqual(anthropicStructuredSchema({ type: "array", items: { type: "string" }, minItems: 1, maxItems: 5 }), { type: "array", items: { type: "string" }, minItems: 1 });
});

test("the Anthropic structured requester: the Messages API with output_config.format, the effort, the system; the reply's model; refusals and transport apart; no key in errors", async () => {
  const calls = [];
  const result = await requestAnthropicStructured({ apiKey: KEY, model: "claude-opus-5-5", effort: "high", system: "SYSTEM", input: "{\"kind\":\"opening\"}", schema: openingProposalSchema,
    fetcher: async (url, init) => { calls.push({ url, init }); return reply(proposal); } });
  assert.deepEqual(result.output, proposal);
  assert.equal(result.usage.model, "claude-opus-5-5");
  assert.equal(result.usage.inputTokens, 1200);
  assert.equal(calls[0].url, anthropicEndpoint({}).messagesUrl);
  assert.equal(calls[0].init.headers["x-api-key"], KEY);
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.model, "claude-opus-5-5");
  assert.equal(body.system, "SYSTEM");
  assert.deepEqual(body.output_config.effort, "high");
  assert.equal(body.output_config.format.type, "json_schema");
  assert.doesNotMatch(JSON.stringify(body.output_config.format.schema), /maxLength/);
  assert.equal("tools" in body, false);
  assert.equal("thinking" in body, false, "adaptive thinking by default; effort is the control");
  assert.deepEqual(body.messages, [{ role: "user", content: "{\"kind\":\"opening\"}" }]);
  assert.equal(JSON.stringify(body).includes(KEY), false);
  const refused = requestAnthropicStructured({ apiKey: KEY, model: "claude-opus-5-5", effort: "high", system: "S", input: "I", schema: openingProposalSchema, fetcher: async () => reply(proposal, { stop_reason: "refusal", content: [] }) });
  await assert.rejects(refused, (error) => error.code === "provider" && error.retryable === false && !String(error.message).includes(KEY));
  await assert.rejects(requestAnthropicStructured({ apiKey: KEY, model: "claude-opus-5-5", effort: "high", system: "S", input: "I", schema: openingProposalSchema, fetcher: async () => json({ error: { type: "overloaded_error" } }, 529) }),
    (error) => error.code === "provider" && error.retryable === true);
  await assert.rejects(requestAnthropicStructured({ apiKey: KEY, model: "claude-opus-5-5", effort: "high", system: "S", input: "I", schema: openingProposalSchema, fetcher: async () => json({ error: { type: "authentication_error" } }, 401) }),
    (error) => error.code === "configuration");
  await assert.rejects(requestAnthropicStructured({ apiKey: "", model: "claude-opus-5-5", effort: "high", system: "S", input: "I", schema: openingProposalSchema }), (error) => error.code === "configuration");
  await assert.rejects(requestAnthropicStructured({ apiKey: KEY, model: "claude-opus-5-5", effort: "ultra", system: "S", input: "I", schema: openingProposalSchema }), (error) => error.code === "configuration");
});

test("the bootstrap provider on an Anthropic profile: the same instructions and schema, the parsed opening, the model contract", async () => {
  const requestId = randomUUID();
  const ticket = { kind: "opening", input: { action: "start", input: { requestId, campaignId: randomUUID() } }, world: {},
    profile: { ...opus, schemaVersion: 1, id: randomUUID(), policyRevision: 0, registryVersion: "openai-responses-v1", task: "world.compose" },
    context: { language: "ru", world: { title: "Гавань", premise: "Рыбацкий город." }, protagonist: { name: "Рэй", publicName: "Рэй", description: "Водолаз.", capabilities: [], limitations: [] }, worldMinutes: 480, ruleset: "world-logic-v1" } };
  const seen = [];
  const attempts = [];
  const provider = createBootstrapProvider({ apiKey: KEY, providerId: "anthropic", model: "claude-opus-5-5", reasoning: "high", observer: (attempt) => attempts.push(attempt),
    fetcher: async (url, init) => { seen.push(JSON.parse(init.body)); return reply(proposal); } });
  const result = await provider(ticket);
  assert.equal(result.output.narration, proposal.narration);
  assert.deepEqual(result.usage, { model: "claude-opus-5-5", inputTokens: 1200, outputTokens: 300, latencyMs: result.usage.latencyMs, calls: 1 });
  assert.equal(seen[0].system, bootstrapInstructions);
  assert.match(bootstrapInstructions, /written in the campaign language given in the context/);
  assert.match(bootstrapInstructions, /the narration ends on the situation the hero faces now/);
  assert.equal(JSON.parse(seen[0].messages[0].content).kind, "opening");
  assert.equal(JSON.parse(seen[0].messages[0].content).language, "ru");
  assert.equal(attempts[0].actualModel, "claude-opus-5-5");
  assert.equal(attempts[0].success, true);
  // Another model's reply breaks the contract; a mismatched option set never sends.
  const other = createBootstrapProvider({ apiKey: KEY, providerId: "anthropic", model: "claude-opus-5-5", reasoning: "high", fetcher: async () => reply(proposal, { model: "claude-sonnet-5-5" }) });
  await assert.rejects(other(ticket), (error) => error.code === "configuration");
  const mixed = createBootstrapProvider({ apiKey: KEY, providerId: "openai", model: "claude-opus-5-5", reasoning: "high", fetcher: async () => { throw new Error("must not send"); } });
  await assert.rejects(mixed(ticket), (error) => error.code === "configuration");
});

test("migration 66: the SQL ticket takes the DM's Anthropic profile for world.compose only; creation and opening commit with it", async () => {
  // The fixture's default stops at migration 31 (the bootstrap's own era); this flow needs every migration.
  const f = await setup(undefined, "en", Infinity);
  try {
    assert.ok(f.files.includes("202610170066_polish2_opening_dm.sql"));
    const profile = (selection, task = "world.compose") => ({ schemaVersion: 1, id: randomUUID(), policyRevision: 0, registryVersion: "openai-responses-v1", task, ...selection });
    await f.one("select rpg_private.lab_execution_profile($1::jsonb,'world.compose')", [JSON.stringify(profile(opus))]);
    await assert.rejects(f.one("select rpg_private.lab_execution_profile($1::jsonb,'world.resolve')", [JSON.stringify(profile(opus, "world.resolve"))]), /rpg_validation/);
    await assert.rejects(f.one("select rpg_private.lab_execution_profile($1::jsonb,'world.compose')", [JSON.stringify(profile({ providerId: "anthropic", modelId: "claude-haiku-5-5", reasoning: "low" }))]), /rpg_validation/);
    await f.one("select rpg_private.lab_execution_profile($1::jsonb,'world.compose')", [JSON.stringify(profile({ providerId: "openai", modelId: "gpt-6-sol", reasoning: "high" }))]);
    // The whole flow on the DM's model: the stub provider answers as Claude Opus 5.5.
    f.profile = resolveExecutionProfile({ task: "world.compose", profileId: randomUUID(), globalDefault: opus });
    f.service = createBootstrapService(f.rpc, async (ticket) => { f.calls++; f.ticket = ticket; return { output: ticket.kind === "creation" ? f.creation : f.opening, usage: { model: "claude-opus-5-5", inputTokens: 10, outputTokens: 20, latencyMs: 1, calls: 1 } }; }, async () => f.profile);
    await f.create();
    assert.equal(f.ticket.profile.providerId, "anthropic");
    const started = await f.startOpening();
    assert.ok(started, "the opening committed on the Anthropic profile");
    assert.equal(f.calls, 2);
    const event = await f.one("select event from rpg_private.world_events where campaign_id=$1 and event->>'kind'='campaign.bootstrap.opening_review'", [f.cid]);
    assert.equal(event.event.payload.executionProfile.providerId, "anthropic");
    assert.equal(event.event.payload.executionProfile.modelId, "claude-opus-5-5");
    // A reply from another model than the ticket's still fails the SQL contract.
    const g = await setup(undefined, "en", Infinity);
    try {
      g.profile = resolveExecutionProfile({ task: "world.compose", profileId: randomUUID(), globalDefault: opus });
      g.service = createBootstrapService(g.rpc, async (ticket) => ({ output: ticket.kind === "creation" ? g.creation : g.opening, usage: { model: "gpt-6-sol", inputTokens: 1, outputTokens: 1, latencyMs: 1, calls: 1 } }), async () => g.profile);
      await assert.rejects(g.create());
    } finally { await g.db.close(); }
  } finally { await f.db.close(); }
});
