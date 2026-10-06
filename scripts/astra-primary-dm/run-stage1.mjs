// Explicitly opt-in synthetic Stage 1. No owner database or application imports.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseEnv } from "node:util";
import { prepareEvaluation, stage1Limits } from "../../spikes/astra-primary-dm/evaluation.mjs";
import { frozenCampaign } from "../../spikes/astra-primary-dm/frozen-data.mjs";
import { ShadowJournal, runShadowTurn } from "../../spikes/astra-primary-dm/prototype.mjs";

const candidate = "c23daeeb7496ed36995cf203fd0f8c5d845ec493";
const model = "gpt-6-astra", reasoning = "high", serviceTier = "default";
const maxRequests = 120, maxSpendUsd = 70;
const worstRequestUsd = (stage1Limits.maxInputTokensPerCall * 12.5 +
  stage1Limits.maxOutputTokensPerCall * 50) / 1_000_000; // includes possible cache-write rate
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const textBytes = (value) => Buffer.byteLength(value, "utf8");
const nil = (type) => ({ type: [type, "null"] });
const obj = (properties) => ({ type: "object", additionalProperties: false,
  properties, required: Object.keys(properties) });
const itemValues = obj({ hp: nil("integer"), resources: {
  anyOf: [obj({ action: nil("integer"), move: nil("integer"),
    reaction: nil("integer"), focus: nil("integer") }), { type: "null" }],
}, position: { type: ["string", "null"], enum: ["nearby", "far", "cover", null] }, quantity: nil("integer") });
const toolCall = obj({ kind: { type: "string",
  enum: ["query", "skill", "attack", "save", "damage"] }, actorId: nil("string"),
targetId: nil("string"), dc: nil("integer"), itemId: nil("string"), scope: nil("string") });
const finalProposal = obj({ schemaVersion: { type: "integer" }, operationId: { type: "string" },
  campaignId: { type: "string" }, expectedRevision: { type: "integer" }, input: { type: "string" },
  narration: { type: "string" }, visualDescription: { type: "string" },
  publicChanges: { type: "array", items: obj({ family: { type: "string", enum: ["actors", "items", "location"] },
    id: { type: "string" }, expectedRevision: nil("integer"), values: itemValues }) },
  privateChanges: { type: "array", items: obj({ key: { type: "string" }, value: { type: "string" } }) },
  memoryCandidates: { type: "array", items: obj({ visibility: { type: "string", enum: ["public", "private"] },
    text: { type: "string" } }) }, rollRefs: { type: "array", items: { type: "string" } },
  worldMinutes: { type: "integer" }, clarification: nil("string") });
const stepSchema = obj({ type: { type: "string", enum: ["tool", "final"] },
  call: { anyOf: [toolCall, { type: "null" }] },
  proposal: { anyOf: [finalProposal, { type: "null" }] } });
const protocol = [
  "Return exactly one JSON object matching the response schema. This is the generic server tool/final contract for every case.",
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
      strict: true, schema: stepSchema } } };
}

function usageFrom(payload) {
  const usage = payload?.usage;
  const inputTokens = usage?.input_tokens, outputTokens = usage?.output_tokens;
  const cachedInputTokens = usage?.input_tokens_details?.cached_tokens ?? 0;
  const reasoningTokens = usage?.output_tokens_details?.reasoning_tokens ?? 0;
  if (![inputTokens, outputTokens, cachedInputTokens, reasoningTokens]
    .every((value) => Number.isSafeInteger(value) && value >= 0) ||
    cachedInputTokens > inputTokens || reasoningTokens > outputTokens)
    return null;
  return { inputTokens, outputTokens, cachedInputTokens, reasoningTokens };
}

function outputFrom(payload) {
  if (payload?.status !== "completed" || !Array.isArray(payload.output)) throw Error(`provider_state:${payload?.status ?? "missing"}`);
  const chunks = [];
  for (const item of payload.output) {
    if (item.type === "reasoning") continue;
    if (item.type !== "message" || item.role !== "assistant" || !Array.isArray(item.content)) throw Error("provider_output_shape");
    for (const part of item.content) {
      if (part.type !== "output_text" || typeof part.text !== "string") throw Error("provider_content_shape");
      chunks.push(part.text);
    }
  }
  if (chunks.length !== 1) throw Error("provider_output_count");
  return normalizeStep(JSON.parse(chunks[0]));
}

const prepared = prepareEvaluation();
assert.equal(prepared.scenarioCount, 10);
assert.equal(prepared.primarySessions, 30);
assert.equal(prepared.maximumModelRoundTrips, maxRequests);
if (process.argv.includes("--dry-run")) {
  const bodyBytes = prepared.calls.map((call) => ({ caseId: call.caseId, label: call.label,
    bytes: textBytes(JSON.stringify(requestBody(call.packet, [], { operationId: `stage1-${call.caseId}-${call.label}`,
      campaignId: call.packet.campaignId, timeline: call.packet.timeline,
      expectedRevision: call.packet.revision, input: call.input }))) }));
  process.stdout.write(JSON.stringify({ candidate, sessions: prepared.calls.length,
    maxInitialBodyBytes: Math.max(...bodyBytes.map((row) => row.bytes)),
    overConservativeCap: bodyBytes.filter((row) => row.bytes > stage1Limits.maxInputTokensPerCall),
    providerCalls: 0 }) + "\n");
  process.exit(0);
}
assert.ok(process.argv.includes("--live-stage1-approved"));
assert.ok(process.env.RPG_ASTRA_STAGE1_ENV_FILE && process.env.RPG_ASTRA_STAGE1_OUTPUT_DIR);
const directory = process.env.RPG_ASTRA_STAGE1_OUTPUT_DIR;
await mkdir(directory, { recursive: true });
const ledgerPath = join(directory, "stage1-private-ledger.json");
const revealPath = join(directory, "stage1-private-reveal.json");
const key = parseEnv(await readFile(process.env.RPG_ASTRA_STAGE1_ENV_FILE, "utf8")).OPENAI_API_KEY;
assert.ok(key && typeof key === "string");
let ledger;
try { ledger = JSON.parse(await readFile(ledgerPath, "utf8")); }
catch (error) {
  if (error.code !== "ENOENT") throw error;
  ledger = { candidate, model, reasoning, serviceTier, preparedDigest: hash(prepared.calls),
    requests: [], sessions: [], stopReason: null };
  await writeFile(ledgerPath, JSON.stringify(ledger, null, 2));
  await writeFile(revealPath, JSON.stringify(prepared.revealKey, null, 2));
}
assert.equal(ledger.candidate, candidate);
assert.equal(ledger.preparedDigest, hash(prepared.calls));
if (ledger.requests.some((row) => row.status === "started")) throw Error("ambiguous in-flight request; no automatic retry");
const save = () => writeFile(ledgerPath, JSON.stringify(ledger, null, 2));
const upperSpent = () => ledger.requests.reduce((sum, row) => sum + (row.upperUsd ?? worstRequestUsd), 0);
let hardStop = null;

for (const call of prepared.calls) {
  if (ledger.sessions.some((row) => row.caseId === call.caseId && row.label === call.label)) continue;
  if (ledger.sessions.length >= 30) break;
  const session = { caseId: call.caseId, label: call.label, status: "started", error: null,
    startedAt: new Date().toISOString(), wallTimeMs: null, requestCount: 0,
    narration: null, outcome: null, publicResult: null, visibleChecks: [], toolReceipts: [],
    validation: "not-run" };
  ledger.sessions.push(session);
  await save();
  const scenarioState = frozenCampaign();
  scenarioState.currentLocationId = call.packet.currentLocation.id;
  const journal = await ShadowJournal.open(join(directory, `journal-${call.caseId}-${call.label}.json`), scenarioState);
  const input = { operationId: `stage1-${call.caseId}-${call.label}`, campaignId: call.packet.campaignId,
    timeline: call.packet.timeline, expectedRevision: call.packet.revision, input: call.input };
  const start = Date.now();
  const dm = { next: async ({ packet, transcript }) => {
    if (session.requestCount >= stage1Limits.maxModelCallsPerSession || ledger.requests.length >= maxRequests ||
      upperSpent() + worstRequestUsd > maxSpendUsd + 1e-9) {
      hardStop = "request_or_spend_cap";
      throw Error("hard_limit_before_request");
    }
    const body = requestBody(packet, transcript, input);
    const serialized = JSON.stringify(body);
    if (textBytes(serialized) > stage1Limits.maxInputTokensPerCall) {
      hardStop = "conservative_input_byte_cap";
      throw Error("hard_limit_before_request");
    }
    const record = { caseId: call.caseId, label: call.label, sequence: session.requestCount + 1,
      status: "started", configuredModel: model, actualModel: null, reasoning,
      requestedServiceTier: serviceTier, actualServiceTier: null, bodyDigest: hash(body),
      bodyBytes: textBytes(serialized), startedAt: new Date().toISOString(), latencyMs: null,
      inputTokens: null, cachedInputTokens: null, outputTokens: null, reasoningTokens: null,
      toolCalls: [], responseStatus: null, error: null, upperUsd: worstRequestUsd };
    ledger.requests.push(record);
    session.requestCount++;
    await save(); // account for the request before sending it
    const started = Date.now();
    let payload;
    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: serialized, signal: AbortSignal.timeout(180_000), redirect: "error",
      });
      record.latencyMs = Date.now() - started;
      record.responseStatus = response.status;
      const raw = await response.text();
      if (raw.length > 300_000) throw Error("oversized_provider_response");
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
      if (step.type === "tool") record.toolCalls.push({ callId: step.call.callId, kind: step.call.kind });
      record.status = "completed";
      await save();
      return step;
    } catch (error) {
      record.latencyMs ??= Date.now() - started;
      record.status = "failed";
      record.error = error.message.slice(0, 180);
      if (record.responseStatus === 401 || record.responseStatus === 403) hardStop = "provider_authentication";
      await save();
      throw error;
    }
  } };
  try {
    const result = await runShadowTurn({ journal, input, composeContext: async () => call.packet, dm });
    session.status = "committed";
    session.validation = "passed";
    session.narration = result.narration;
    session.outcome = journal.get(input.operationId).checkpoint.final;
    session.publicResult = result;
    session.visibleChecks = result.checks;
  } catch (error) {
    session.status = "failed";
    session.validation = error.code === "validation" ? "failed" : "not-run";
    session.error = (error.code ?? error.message ?? "unknown").slice(0, 180);
  }
  session.toolReceipts = journal.get(input.operationId)?.checkpoint.tools.map((row) => row.result) ?? [];
  session.wallTimeMs = Date.now() - start;
  await save();
  process.stdout.write(`${call.caseId}/${call.label}: ${session.status}, requests=${session.requestCount}, wall=${session.wallTimeMs}ms\n`);
  if (hardStop) { ledger.stopReason = hardStop; await save(); break; }
}

process.stdout.write(JSON.stringify({ candidate, sessions: ledger.sessions.length,
  requests: ledger.requests.length, upperSpendUsd: Number(upperSpent().toFixed(4)),
  stopReason: ledger.stopReason, privateLedger: ledgerPath }) + "\n");
