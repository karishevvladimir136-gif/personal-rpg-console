// Explicitly opt-in synthetic Stage 2. No owner database or application imports.
import assert from "node:assert/strict";
import { createHash, randomInt } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseEnv } from "node:util";
import { stage1Limits } from "../../spikes/astra-primary-dm/evaluation.mjs";
import { ShadowJournal, runShadowTurn } from "../../spikes/astra-primary-dm/prototype.mjs";
import { pairedRollScheduleVersion, pairedToolRandom } from "../../spikes/astra-primary-dm/paired-rng.mjs";
import { createStage2Runs, nextStage2Packet, recordStage2Commit,
  recordStage2Failure, stage2Arc } from "../../spikes/astra-primary-dm/stage2.mjs";

const candidate = "0a0495457349bc0ecdfd86186709ed4016fd72d8";
const model = "gpt-6-astra", reasoning = "high", serviceTier = "default";
const maxRequests = 112, maxSpendUsd = 50, maxTurns = 28;
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

function publicState(state) {
  return {
    revision: state.revision, locationId: state.currentLocationId, worldMinutes: state.worldMinutes,
    actors: Object.fromEntries(Object.entries(state.actors).map(([id, row]) =>
      [id, { name: row.name, hp: row.hp, resources: row.resources, position: row.position }])),
    items: Object.fromEntries(Object.entries(state.items).map(([id, row]) =>
      [id, { name: row.name, quantity: row.quantity, ownerId: row.ownerId }])),
    sceneCount: state.recentScenes?.length ?? 0,
    memoryCount: state.historicalMemory?.length ?? 0,
  };
}

function fitPacket(packet, input) {
  const fitted = structuredClone(packet);
  const context = fitted.consoleContext;
  const trim = { recentScenes: 0, retrievedMemory: 0 };
  const size = () => textBytes(JSON.stringify(requestBody(fitted, [], input)));
  while (size() > stage1Limits.maxInputTokensPerCall) {
    if (context?.recentScenes.length > 4) {
      context.recentScenes.shift();
      trim.recentScenes++;
    } else {
      const removable = context?.retrievedMemory.findLastIndex((row) =>
        !(fitted.caseId === "arc-13" && row.id === "promise-1")) ?? -1;
      if (removable >= 0) {
        context.retrievedMemory.splice(removable, 1);
        trim.retrievedMemory++;
      } else if (context?.recentScenes.length > 0) {
        context.recentScenes.shift();
        trim.recentScenes++;
      } else throw Error("mandatory_context_over_input_cap");
    }
  }
  return { packet: fitted, trim, initialBodyBytes: size() };
}

function fitContinuation(packet, transcript, input) {
  const fitted = structuredClone(packet);
  const context = fitted.consoleContext;
  const trim = { recentScenes: 0, retrievedMemory: 0 };
  const size = () => textBytes(JSON.stringify(requestBody(fitted, transcript, input)));
  while (size() > stage1Limits.maxInputTokensPerCall) {
    if (context?.recentScenes.length > 0) {
      context.recentScenes.shift();
      trim.recentScenes++;
    } else {
      const removable = context?.retrievedMemory.findLastIndex((row) =>
        !(fitted.caseId === "arc-13" && row.id === "promise-1")) ?? -1;
      if (removable >= 0) {
        context.retrievedMemory.splice(removable, 1);
        trim.retrievedMemory++;
      } else break;
    }
  }
  return { packet: fitted, trim, bodyBytes: size() };
}

const initialRuns = createStage2Runs(randomInt(2) ? ["B", "C"] : ["C", "B"]);
assert.equal(stage2Arc.length, 14);
if (process.argv.includes("--dry-run")) {
  const initial = initialRuns.map((run) => {
    const scenario = stage2Arc[0];
    const input = { operationId: `stage2-${scenario.id}-${run.label}`,
      campaignId: run.state.campaignId, timeline: run.state.timeline,
      expectedRevision: run.state.revision, input: scenario.input };
    const fitted = fitPacket(nextStage2Packet(run).packet, input);
    return { label: run.label, bodyBytes: fitted.initialBodyBytes,
      packetBytes: textBytes(JSON.stringify(fitted.packet)), trim: fitted.trim };
  });
  process.stdout.write(JSON.stringify({ candidate, turns: maxTurns, maximumRequests: maxRequests,
    maximumSpendUsd: maxSpendUsd, pairedRollScheduleVersion, initial, providerCalls: 0 }) + "\n");
  process.exit(0);
}
if (process.argv.includes("--check-saved-resume")) {
  assert.ok(process.env.RPG_ASTRA_STAGE2_OUTPUT_DIR);
  const saved = JSON.parse(await readFile(join(process.env.RPG_ASTRA_STAGE2_OUTPUT_DIR,
    "journal-arc-05-X.json"), "utf8"));
  const turn = Object.values(saved.turns)[0];
  const view = fitContinuation(turn.checkpoint.packet, turn.checkpoint.tools, turn.input);
  process.stdout.write(JSON.stringify({ bodyBytes: view.bodyBytes, trim: view.trim,
    underCap: view.bodyBytes <= stage1Limits.maxInputTokensPerCall, providerCalls: 0 }) + "\n");
  process.exit(0);
}
if (process.argv.includes("--check-next-context")) {
  assert.ok(process.env.RPG_ASTRA_STAGE2_OUTPUT_DIR);
  const saved = JSON.parse(await readFile(join(process.env.RPG_ASTRA_STAGE2_OUTPUT_DIR,
    "stage2-private-ledger.json"), "utf8"));
  const next = ["X", "Y"].map((label) => {
    const run = saved.runs[label];
    const scenario = stage2Arc[run.turnIndex];
    const input = { operationId: `stage2-${scenario.id}-${label}`,
      campaignId: run.state.campaignId, timeline: run.state.timeline,
      expectedRevision: run.state.revision, input: scenario.input };
    const packet = nextStage2Packet(run).packet;
    const view = fitPacket(packet, input);
    const minimal = structuredClone(packet);
    if (minimal.consoleContext) {
      minimal.consoleContext.recentScenes = [];
      minimal.consoleContext.retrievedMemory = minimal.consoleContext.retrievedMemory.filter((row) =>
        scenario.id === "arc-13" && row.id === "promise-1");
    }
    return { label, caseId: scenario.id,
      rawBytes: textBytes(JSON.stringify(requestBody(packet, [], input))),
      minimalBytes: textBytes(JSON.stringify(requestBody(minimal, [], input))),
      fittedBytes: view.initialBodyBytes, trim: view.trim };
  });
  process.stdout.write(JSON.stringify({ next, providerCalls: 0 }) + "\n");
  process.exit(0);
}

assert.ok(process.argv.includes("--live-stage2-approved"));
assert.ok(process.env.RPG_ASTRA_STAGE1_ENV_FILE && process.env.RPG_ASTRA_STAGE2_OUTPUT_DIR);
const directory = process.env.RPG_ASTRA_STAGE2_OUTPUT_DIR;
await mkdir(directory, { recursive: true });
const ledgerPath = join(directory, "stage2-private-ledger.json");
const key = parseEnv(await readFile(process.env.RPG_ASTRA_STAGE1_ENV_FILE, "utf8")).OPENAI_API_KEY;
assert.ok(key && typeof key === "string");
let ledger;
try { ledger = JSON.parse(await readFile(ledgerPath, "utf8")); }
catch (error) {
  if (error.code !== "ENOENT") throw error;
  ledger = { candidate, model, reasoning, serviceTier,
    arcDigest: hash(stage2Arc), pairedRollScheduleVersion,
    runs: Object.fromEntries(initialRuns.map((run) => [run.label, run])),
    requests: [], turns: [], stopReason: null };
  await writeFile(ledgerPath, JSON.stringify(ledger, null, 2));
  await writeFile(join(directory, "stage2-private-reveal.json"),
    JSON.stringify(initialRuns.map((run) => ({ label: run.label, arm: run.arm })), null, 2));
}
assert.equal(ledger.candidate, candidate);
assert.equal(ledger.arcDigest, hash(stage2Arc));
assert.equal(ledger.pairedRollScheduleVersion, pairedRollScheduleVersion);
assert.equal(ledger.requests.length <= maxRequests, true);
if (ledger.requests.some((row) => row.status === "started") ||
  ledger.turns.some((row) => row.status === "started"))
  throw Error("ambiguous in-flight Stage 2 operation; no automatic retry");
if (ledger.stopReason && ledger.stopReason !== "conservative_input_byte_cap")
  throw Error("Stage 2 stopped for a non-resumable reason");
const save = async () => {
  const temporary = `${ledgerPath}.next`;
  await writeFile(temporary, JSON.stringify(ledger, null, 2));
  await rename(temporary, ledgerPath);
};
const upperSpent = () => ledger.requests.reduce((total, row) => total + (row.upperUsd ?? worstRequestUsd), 0);
let hardStop = null;

for (let turnNumber = 1; turnNumber <= stage2Arc.length && !hardStop; turnNumber++) {
  const scenario = stage2Arc[turnNumber - 1];
  for (const label of ["X", "Y"]) {
    const priorSession = ledger.turns.find((row) => row.caseId === scenario.id && row.label === label);
    if (priorSession && !(priorSession.status === "failed" &&
      priorSession.error === "hard_limit_before_request" &&
      ledger.stopReason === "conservative_input_byte_cap")) continue;
    if (!priorSession && ledger.turns.length >= maxTurns) { hardStop = "turn_cap"; break; }
    const run = ledger.runs[label];
    assert.equal(run.turnIndex, turnNumber - 1);
    const input = { operationId: `stage2-${scenario.id}-${label}`,
      campaignId: run.state.campaignId, timeline: run.state.timeline,
      expectedRevision: run.state.revision, input: scenario.input };
    const fitted = fitPacket(nextStage2Packet(run).packet, input);
    const packet = fitted.packet;
    const before = publicState(run.state);
    const beforeMemoryCount = run.state.historicalMemory.length;
    const beforeModels = structuredClone(run.state.characterModels);
    const session = priorSession ?? { caseId: scenario.id, label, probe: scenario.probe, turnNumber,
      input: scenario.input, status: "started", error: null, validation: "not-run",
      startedAt: new Date().toISOString(), wallTimeMs: null, requestCount: 0,
      providerLatencyMs: null, packetBytes: textBytes(JSON.stringify(packet)),
      initialBodyBytes: fitted.initialBodyBytes, contextTrim: fitted.trim,
      stateBefore: before, stateAfter: null, publicResult: null,
      visibleChecks: [], toolReceipts: [], memoryAdditions: [], characterModelChanges: [],
      finalProposal: null };
    if (priorSession) {
      assert.equal(priorSession.requestCount, 1);
      assert.equal(priorSession.stateBefore.revision, run.state.revision);
      session.status = "started";
      session.error = null;
      ledger.stopReason = null;
    } else ledger.turns.push(session);
    await save();
    const journal = await ShadowJournal.open(join(directory, `journal-${scenario.id}-${label}.json`), run.state);
    const started = Date.now(), previousWallMs = session.wallTimeMs ?? 0;
    const dm = { next: async ({ packet: pinnedPacket, transcript }) => {
      if (session.requestCount >= stage1Limits.maxModelCallsPerSession ||
        ledger.requests.length >= maxRequests || upperSpent() + worstRequestUsd > maxSpendUsd + 1e-9) {
        hardStop = "request_or_spend_cap";
        throw Error("hard_limit_before_request");
      }
      const view = fitContinuation(pinnedPacket, transcript, input);
      const body = requestBody(view.packet, transcript, input);
      const serialized = JSON.stringify(body);
      if (textBytes(serialized) > stage1Limits.maxInputTokensPerCall) {
        hardStop = "conservative_input_byte_cap";
        throw Error("hard_limit_before_request");
      }
      const record = { caseId: scenario.id, label, turnNumber, sequence: session.requestCount + 1,
        status: "started", configuredModel: model, actualModel: null, reasoning,
        requestedServiceTier: serviceTier, actualServiceTier: null, bodyDigest: hash(body),
        bodyBytes: textBytes(serialized), startedAt: new Date().toISOString(), latencyMs: null,
        contextTrim: view.trim,
        inputTokens: null, cachedInputTokens: null, outputTokens: null, reasoningTokens: null,
        toolCalls: [], responseStatus: null, error: null, upperUsd: worstRequestUsd };
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
        if (record.responseStatus === 401 || record.responseStatus === 403)
          hardStop = "provider_authentication";
        await save();
        throw error;
      }
    } };
    try {
      const result = await runShadowTurn({ journal, input, composeContext: async () => packet, dm,
        randomForTool: ({ call, checkpointTools }) =>
          pairedToolRandom({ turnNumber, call, checkpointTools }) });
      session.status = "committed";
      session.validation = "passed";
      session.publicResult = result;
      session.visibleChecks = result.checks;
      session.finalProposal = journal.get(input.operationId).checkpoint.final;
      recordStage2Commit(run, { publicResult: result, stateAfter: journal.data.campaign });
      session.memoryAdditions = structuredClone(run.state.historicalMemory.slice(beforeMemoryCount));
      session.characterModelChanges = Object.keys(run.state.characterModels).filter((id) =>
        hash(run.state.characterModels[id]) !== hash(beforeModels[id]));
    } catch (error) {
      session.status = "failed";
      session.error = (error.code ?? error.message ?? "unknown").slice(0, 180);
      session.validation = error.code === "validation" ? "failed" : "not-run";
      session.finalProposal = journal.get(input.operationId)?.checkpoint.final ?? null;
      if (error.code === "validation" && !hardStop) {
        recordStage2Failure(run, { caseId: scenario.id, sourceRevision: before.revision,
          error: session.error });
      } else hardStop ??= "provider_or_harness_failure";
    }
    session.toolReceipts = journal.get(input.operationId)?.checkpoint.tools.map((row) =>
      ({ position: row.position, call: row.call, result: row.result })) ?? [];
    session.stateAfter = publicState(run.state);
    session.wallTimeMs = previousWallMs + Date.now() - started;
    session.providerLatencyMs = ledger.requests.filter((row) => row.caseId === scenario.id &&
      row.label === label).reduce((total, row) => total + (row.latencyMs ?? 0), 0);
    await save();
    process.stdout.write(`${scenario.id}/${label}: ${session.status}, requests=${session.requestCount}, wall=${session.wallTimeMs}ms\n`);
    if (hardStop) break;
  }
}
ledger.stopReason = hardStop;
await save();
process.stdout.write(JSON.stringify({ candidate, attempted: ledger.turns.length,
  committed: ledger.turns.filter((row) => row.status === "committed").length,
  requests: ledger.requests.length, upperSpendUsd: Number(upperSpent().toFixed(4)),
  stopReason: ledger.stopReason, privateLedger: ledgerPath }) + "\n");
