// Explicitly opt-in synthetic mechanical acceptance. No owner database or app imports.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseEnv } from "node:util";
import { stage1Limits } from "../../spikes/astra-primary-dm/evaluation.mjs";
import { ShadowJournal, runShadowTurn } from "../../spikes/astra-primary-dm/prototype.mjs";
import { responseSchemaForPacket, writableCapabilities } from "../../spikes/astra-primary-dm/provider-contract.mjs";
import { acceptanceArc, acceptanceInitialState, acceptanceInput,
  acceptanceSnapshot, appendAcceptanceHistory, assertAcceptanceState,
  composeAcceptancePacket, deterministicAcceptanceRandom } from
"../../spikes/astra-primary-dm/mechanical-acceptance.mjs";

const startingSha = "e7d88584bb9dbb4a8737e77d9a1eabb2823b7974";
const acceptanceVersion = "v2";
const model = "gpt-6-astra", reasoning = "high", serviceTier = "default";
const maxRequests = 32, maxSpendUsd = 20, maxTurns = 8;
const worstRequestUsd = (stage1Limits.maxInputTokensPerCall * 12.5 +
  stage1Limits.maxOutputTokensPerCall * 50) / 1_000_000;
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const textBytes = (value) => Buffer.byteLength(value, "utf8");
const protocol = [
  "Return exactly one JSON object matching the response schema. This is the generic server tool/final contract for every turn.",
  "For a tool step set type=tool, call to the tool request, proposal=null. For a final step set type=final, call=null, proposal to the complete final contract.",
  "The server assigns tool receipt identities. Set unused call fields to null. query uses scope=current-public. skill/save use an existing actor, optional existing target, and integer DC 5–30. attack uses an existing target and optional equipped owned item; its DC is null because the server owns target defense. damage uses an equipped owned item after a successful attack with that item.",
  "Use only exact IDs and revisions present in the packet or tool receipts. The server owns random rolls, attack defense, weapon modifiers, resource/HP/item bounds and commit. Do not invent tool results. If there is no justified state change, use empty change arrays.",
  "For a final proposal use schemaVersion=1, copy exact operationId/campaignId/expectedRevision/input from the request, and give worldMinutes >= the packet's current time. For each public change set unused values fields to null; inside resources set unused fields to null. Cite only recorded roll receipt IDs in rollRefs.",
].join(" ");

function normalizeStep(raw) {
  if (!raw || !["tool", "final"].includes(raw.type)) throw Error("invalid_step");
  if (raw.type === "tool") {
    if (!raw.call || raw.proposal !== null) throw Error("invalid_tool_step");
    return { type: "tool", call: Object.fromEntries(Object.entries(raw.call)
      .filter(([, value]) => value !== null)) };
  }
  if (raw.call !== null || !raw.proposal) throw Error("invalid_final_step");
  const proposal = structuredClone(raw.proposal);
  proposal.publicChanges = proposal.publicChanges.map((change) => {
    const values = Object.fromEntries(Object.entries(change.values).filter(([, value]) => value !== null));
    if (values.resources) values.resources = Object.fromEntries(Object.entries(values.resources)
      .filter(([, value]) => value !== null));
    return { ...change, values };
  });
  return { type: "final", proposal };
}

function requestBody(packet, transcript, input) {
  return { model, service_tier: serviceTier, reasoning: { effort: reasoning },
    instructions: `${packet.instructions} ${protocol}`,
    input: JSON.stringify({ packet, turn: input, toolReceipts: transcript }),
    max_output_tokens: stage1Limits.maxOutputTokensPerCall, store: false,
    truncation: "disabled", text: { format: { type: "json_schema", name: "primary_dm_step",
      strict: true, schema: responseSchemaForPacket(packet) } } };
}

function usageFrom(payload) {
  const usage = payload?.usage;
  const inputTokens = usage?.input_tokens, outputTokens = usage?.output_tokens;
  const cachedInputTokens = usage?.input_tokens_details?.cached_tokens ?? 0;
  const reasoningTokens = usage?.output_tokens_details?.reasoning_tokens ?? 0;
  if (![inputTokens, outputTokens, cachedInputTokens, reasoningTokens]
    .every((value) => Number.isSafeInteger(value) && value >= 0) ||
    cachedInputTokens > inputTokens || reasoningTokens > outputTokens) return null;
  return { inputTokens, outputTokens, cachedInputTokens, reasoningTokens };
}

function outputFrom(payload) {
  if (payload?.status !== "completed" || !Array.isArray(payload.output))
    throw Error(`provider_state:${payload?.status ?? "missing"}`);
  const chunks = [];
  for (const item of payload.output) {
    if (item.type === "reasoning") continue;
    if (item.type !== "message" || item.role !== "assistant" || !Array.isArray(item.content))
      throw Error("provider_output_shape");
    for (const part of item.content) {
      if (part.type !== "output_text" || typeof part.text !== "string")
        throw Error("provider_content_shape");
      chunks.push(part.text);
    }
  }
  if (chunks.length !== 1) throw Error("provider_output_count");
  return normalizeStep(JSON.parse(chunks[0]));
}

function fitRequest(packet, transcript, input) {
  const fitted = structuredClone(packet);
  const trim = { recentScenes: 0, retrievedMemory: 0 };
  const size = () => textBytes(JSON.stringify(requestBody(fitted, transcript, input)));
  while (size() > stage1Limits.maxInputTokensPerCall) {
    const context = fitted.consoleContext;
    if (context?.recentScenes.length) {
      context.recentScenes.shift(); trim.recentScenes++;
    } else {
      const removable = context?.retrievedMemory.findLastIndex((row) => row.id !== "promise-1") ?? -1;
      if (removable < 0) throw Error("mandatory_context_over_input_cap");
      context.retrievedMemory.splice(removable, 1); trim.retrievedMemory++;
    }
  }
  return { packet: fitted, trim, bodyBytes: size() };
}

assert.ok(process.env.RPG_ASTRA_MECHANICAL_OUTPUT_DIR);
const directory = process.env.RPG_ASTRA_MECHANICAL_OUTPUT_DIR;
const preflight = JSON.parse(await readFile(join(directory, "preflight-result.json"), "utf8"));
assert.equal(preflight.startingSha, startingSha);
assert.equal(preflight.acceptanceVersion, acceptanceVersion);
assert.equal(preflight.status, "passed");
assert.equal(preflight.turns, 8);
assert.equal(preflight.rejectedNoOp, true);
assert.equal(preflight.finalState.maraHp, 6);
assert.equal(preflight.finalState.maraFocus, 1);
assert.equal(preflight.finalState.oilQuantity, 0);
assert.equal(preflight.finalState.stalkerHp, 0);

if (process.argv.includes("--dry-run")) {
  const state = acceptanceInitialState();
  const scenario = acceptanceArc[0];
  const input = acceptanceInput(scenario, state);
  const view = fitRequest(composeAcceptancePacket(scenario, state).packet, [], input);
  process.stdout.write(JSON.stringify({ startingSha, model, reasoning, serviceTier,
    firstRequestBytes: view.bodyBytes, maxTurns, maxRequests,
    maxRequestsPerTurn: stage1Limits.maxModelCallsPerSession,
    maxInputTokens: stage1Limits.maxInputTokensPerCall,
    maxOutputTokens: stage1Limits.maxOutputTokensPerCall,
    maxSpendUsd, providerCalls: 0 }) + "\n");
  process.exit(0);
}
assert.ok(process.argv.includes("--live-acceptance-approved"));
assert.ok(process.env.RPG_ASTRA_STAGE1_ENV_FILE);
const key = parseEnv(await readFile(process.env.RPG_ASTRA_STAGE1_ENV_FILE, "utf8")).OPENAI_API_KEY;
assert.ok(key && typeof key === "string");
await mkdir(directory, { recursive: true });
const ledgerPath = join(directory, "acceptance-private-ledger.json");
let ledger;
try { ledger = JSON.parse(await readFile(ledgerPath, "utf8")); }
catch (error) {
  if (error.code !== "ENOENT") throw error;
  ledger = { startingSha, acceptanceVersion, model, reasoning, serviceTier, arcDigest: hash(acceptanceArc),
    preflightDigest: hash(preflight), turns: [], requests: [], stopReason: null };
  await writeFile(ledgerPath, JSON.stringify(ledger, null, 2));
}
assert.equal(ledger.startingSha, startingSha);
assert.equal(ledger.acceptanceVersion, acceptanceVersion);
assert.equal(ledger.arcDigest, hash(acceptanceArc));
assert.equal(ledger.preflightDigest, hash(preflight));
assert.equal(ledger.stopReason, null, "stopped run cannot be resumed automatically");
assert.ok(!ledger.turns.some((row) => row.status === "started"));
assert.ok(!ledger.requests.some((row) => row.status === "started"));
assert.ok(ledger.turns.length <= maxTurns && ledger.requests.length <= maxRequests);
const save = async () => {
  const temporary = `${ledgerPath}.next`;
  await writeFile(temporary, JSON.stringify(ledger, null, 2));
  await rename(temporary, ledgerPath);
};
const upperSpent = () => ledger.requests.reduce((sum, row) => sum + (row.upperUsd ?? worstRequestUsd), 0);
const journal = await ShadowJournal.open(join(directory, "acceptance-live-journal.json"), acceptanceInitialState());
if (ledger.turns.length === maxTurns) {
  process.stdout.write(JSON.stringify({ status: "complete", turns: maxTurns,
    state: acceptanceSnapshot(journal.data.campaign), requests: ledger.requests.length,
    upperSpendUsd: Number(upperSpent().toFixed(4)) }) + "\n");
  process.exit(0);
}
const scenario = acceptanceArc[ledger.turns.length];
const state = journal.data.campaign;
assert.equal(state.revision, 7 + ledger.turns.length);
const input = acceptanceInput(scenario, state);
const before = acceptanceSnapshot(state);
const { packet, selection } = composeAcceptancePacket(scenario, state);
const initial = fitRequest(packet, [], input);
const session = { turnNumber: scenario.turnNumber, caseId: scenario.id, input: scenario.input,
  purpose: scenario.purpose, status: "started", validation: "not-run", error: null,
  startedAt: new Date().toISOString(), requestCount: 0, providerLatencyMs: null,
  wallTimeMs: null, initialBodyBytes: initial.bodyBytes, initialContextTrim: initial.trim,
  selection, contractCapabilities: writableCapabilities(packet),
  stateBefore: before, stateAfter: null, publicResult: null,
  receipts: [], memoryAdditions: [], finalProposal: null };
ledger.turns.push(session);
await save();
const started = Date.now();
let hardStop = null;
const dm = { next: async ({ packet: pinnedPacket, transcript }) => {
  if (session.requestCount >= stage1Limits.maxModelCallsPerSession ||
    ledger.requests.length >= maxRequests || upperSpent() + worstRequestUsd > maxSpendUsd + 1e-9) {
    hardStop = "request_or_spend_cap";
    throw Error("hard_limit_before_request");
  }
  const view = fitRequest(pinnedPacket, transcript, input);
  const body = requestBody(view.packet, transcript, input);
  const serialized = JSON.stringify(body);
  assert.ok(textBytes(serialized) <= stage1Limits.maxInputTokensPerCall);
  const record = { turnNumber: scenario.turnNumber, sequence: session.requestCount + 1,
    status: "started", configuredModel: model, actualModel: null, reasoning,
    requestedServiceTier: serviceTier, actualServiceTier: null, bodyDigest: hash(body),
    bodyBytes: textBytes(serialized), startedAt: new Date().toISOString(), latencyMs: null,
    contextTrim: view.trim, inputTokens: null, cachedInputTokens: null,
    outputTokens: null, reasoningTokens: null, toolCalls: [], responseStatus: null,
    error: null, upperUsd: worstRequestUsd };
  ledger.requests.push(record);
  session.requestCount++;
  await save();
  const requestStarted = Date.now();
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: serialized, signal: AbortSignal.timeout(180_000), redirect: "error",
    });
    record.latencyMs = Date.now() - requestStarted;
    record.responseStatus = response.status;
    const raw = await response.text();
    if (raw.length > 300_000) throw Error("oversized_provider_response");
    let payload;
    try { payload = JSON.parse(raw); } catch { throw Error("provider_json_parse"); }
    const usage = usageFrom(payload);
    if (usage) {
      Object.assign(record, usage);
      record.upperUsd = (usage.inputTokens * 12.5 + usage.outputTokens * 50) / 1_000_000;
    }
    record.actualModel = typeof payload.model === "string" ? payload.model : null;
    record.actualServiceTier = payload.service_tier ?? null;
    if (!response.ok) throw Error(`provider_http_${response.status}:${payload.error?.code ?? payload.error?.type ?? "unknown"}`);
    if (!usage || usage.inputTokens > stage1Limits.maxInputTokensPerCall ||
      usage.outputTokens > stage1Limits.maxOutputTokensPerCall) {
      hardStop = "provider_usage_cap_or_missing";
      throw Error("provider_usage_cap_or_missing");
    }
    if (!/^gpt-6-astra(?:-\d{4}-\d{2}-\d{2})?$/.test(record.actualModel ?? "") ||
      record.actualServiceTier !== serviceTier) {
      hardStop = "model_or_tier_mismatch";
      throw Error("model_or_tier_mismatch");
    }
    const step = outputFrom(payload);
    if (step.type === "tool") record.toolCalls.push({ kind: step.call.kind });
    record.status = "completed";
    await save();
    return step;
  } catch (error) {
    record.latencyMs ??= Date.now() - requestStarted;
    record.status = "failed";
    record.error = error.message.slice(0, 180);
    hardStop ??= "provider_or_transport_failure";
    await save();
    throw error;
  }
} };
try {
  const result = await runShadowTurn({ journal, input, composeContext: async () => initial.packet, dm,
    randomForTool: ({ call }) => deterministicAcceptanceRandom({ turnNumber: scenario.turnNumber, call }) });
  session.publicResult = result;
  session.validation = "passed";
  session.finalProposal = journal.get(input.operationId).checkpoint.final;
  session.receipts = journal.get(input.operationId).checkpoint.tools.map((row) => ({
    position: row.position, call: row.call, result: row.result }));
  session.stateAfter = acceptanceSnapshot(journal.data.campaign);
  assertAcceptanceState(scenario.turnNumber, before, session.stateAfter, session.receipts, result);
  session.memoryAdditions = await appendAcceptanceHistory(journal, scenario, result);
  session.status = "accepted";
} catch (error) {
  session.status = "failed";
  session.error = (error.code ?? error.message ?? "unknown").slice(0, 180);
  session.validation = error.code === "validation" ? "failed" : session.validation;
  const saved = journal.get(input.operationId);
  session.receipts = saved?.checkpoint.tools.map((row) => ({
    position: row.position, call: row.call, result: row.result })) ?? [];
  session.finalProposal ??= saved?.checkpoint.final ?? null;
  session.stateAfter ??= acceptanceSnapshot(journal.data.campaign);
  hardStop ??= "validation_tool_or_acceptance_failure";
}
session.wallTimeMs = Date.now() - started;
session.providerLatencyMs = ledger.requests.filter((row) => row.turnNumber === scenario.turnNumber)
  .reduce((sum, row) => sum + (row.latencyMs ?? 0), 0);
ledger.stopReason = hardStop;
await save();
process.stdout.write(JSON.stringify({ turnNumber: scenario.turnNumber, status: session.status,
  validation: session.validation, error: session.error,
  requests: session.requestCount, providerLatencyMs: session.providerLatencyMs,
  wallTimeMs: session.wallTimeMs, stateBefore: session.stateBefore,
  stateAfter: session.stateAfter, receipts: session.receipts.map((row) => ({
    kind: row.result.kind, dice: row.result.dice ?? [], total: row.result.total ?? null,
    success: row.result.success ?? null })), selection: session.selection,
  stopReason: ledger.stopReason, upperSpendUsd: Number(upperSpent().toFixed(4)) }) + "\n");
if (hardStop) process.exitCode = 1;
