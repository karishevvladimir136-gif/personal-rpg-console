// Transport doubles for the real Astra provider (src/lib/server/dm/
// astra-primary-provider.ts). Only the HTTP exchange with OpenAI is replaced:
// request building, schema, parsing and every server validator stay real.
import { validateSchema } from "./schema.mjs";
import { dmModels, dmRequestReservation, dmUsageCost } from "../../../src/lib/model-runtime/dm-models.ts";

const RESPONSES_URL = "https://api.openai.com/v1/responses";

/** gpt-6-astra prices from the single price table (docs/MODELS.md). */
export const ASTRA_PRICE = dmModels["openai/gpt-6-astra"].price;

const bytes = (text) => Buffer.byteLength(text, "utf8");
const stageOf = (body) => String(body?.text?.format?.name ?? "unknown").replace(/^dm_/, "");

function responsesPayload(outputText, usage) {
  return {
    id: `resp_eval_${Math.random().toString(16).slice(2, 10)}`,
    model: "gpt-6-astra",
    service_tier: "default",
    status: "completed",
    output: [{ type: "message", role: "assistant", status: "completed",
      content: [{ type: "output_text", text: outputText }] }],
    usage,
  };
}

/** Narration a private-informed narrator would return for the same scene. */
function narrationFrom(final) {
  const beats = final?.publicNarration?.beats ?? [];
  return {
    narration: beats.map((beat) => beat.text).filter(Boolean).join("\n\n") || "The scene continues.",
    visualDescription: final?.publicNarration?.visualDescription?.text ?? "",
    clarification: null,
  };
}

/**
 * Scripted fake of the OpenAI Responses endpoint. For each turn the harness
 * calls `prepare(candidate)` with one resolved scripted model answer:
 *   { plan: [rawDecision, ...], narrate?: {narration, visualDescription, clarification} }
 * Plan decisions are returned in order for successive plan requests (tool
 * steps, then the final). In private-informed mode the request schema has no
 * publicNarration, so it is removed from the final and used as the separate
 * narrator answer, exactly as the same model would split it.
 */
export function createFakeOpenAi(log) {
  let script = null;
  return {
    kind: "fake",
    prepare(candidate) {
      script = { plan: [...(candidate?.plan ?? [])], narrate: candidate?.narrate ?? null, stashed: null };
    },
    fetcher: async (url, init) => {
      const started = performance.now();
      const serialized = String(init?.body ?? "");
      const body = JSON.parse(serialized);
      const stage = stageOf(body);
      const entry = { stage, requestBytes: bytes(serialized), schemaViolations: [], scriptError: null,
        inputTokens: null, outputTokens: null, cachedInputTokens: 0, reasoningTokens: 0,
        tokensEstimated: true, costUsd: 0, latencyMs: 0 };
      log.push(entry);
      if (url !== RESPONSES_URL) throw Error("eval_endpoint_not_allowed");
      let output;
      if (stage === "plan") {
        output = script?.plan.shift();
        if (output && output.type === "final" && output.final) {
          // public-unified finals carry narration; private-informed finals do not.
          const wantsNarration = JSON.stringify(body.text.format.schema).includes("\"publicNarration\"");
          if (!wantsNarration && Object.hasOwn(output.final, "publicNarration")) {
            script.stashed = narrationFrom(output.final);
            const rest = { ...output.final };
            delete rest.publicNarration;
            output = { ...output, final: rest };
          }
        }
      } else if (stage === "narrate") {
        output = script?.narrate ?? script?.stashed ?? null;
      }
      if (!output) {
        entry.scriptError = `no scripted ${stage} answer left for this request`;
        return new Response(JSON.stringify({ error: { type: "server_error", code: null } }), { status: 500 });
      }
      entry.schemaViolations = validateSchema(body.text.format.schema, output).slice(0, 8);
      if (entry.schemaViolations.length) {
        // The live API enforces strict schemas; it could never return this.
        return new Response(JSON.stringify({ error: { type: "server_error", code: null } }), { status: 500 });
      }
      const text = JSON.stringify(output);
      // Token counts are rough UTF-8 byte estimates (bytes / 4), not measured usage.
      entry.inputTokens = Math.ceil(entry.requestBytes / 4);
      entry.outputTokens = Math.ceil(bytes(text) / 4);
      entry.latencyMs = Math.round(performance.now() - started);
      return new Response(JSON.stringify(responsesPayload(text, {
        input_tokens: entry.inputTokens, output_tokens: entry.outputTokens,
        input_tokens_details: { cached_tokens: 0 }, output_tokens_details: { reasoning_tokens: 0 },
      })), { headers: { "x-request-id": "req_eval_fake" } });
    },
  };
}

/**
 * Live OpenAI transport with a hard spend cap. Before each dispatch the
 * worst case (request bytes + framing as input tokens, full max_output_tokens)
 * is reserved; a request that could exceed the budget is never sent.
 */
export function createLiveOpenAi(log, budgetUsd) {
  if (!(Number.isFinite(budgetUsd) && budgetUsd > 0)) throw Error("live provider requires --budget-usd N (N > 0)");
  const budget = { limitUsd: budgetUsd, spentUsd: 0, reservedUsd: 0, exhausted: false };
  return {
    kind: "live",
    budget,
    prepare() {},
    fetcher: async (url, init) => {
      if (url !== RESPONSES_URL) throw Error("eval_endpoint_not_allowed");
      const serialized = String(init?.body ?? "");
      const body = JSON.parse(serialized);
      const entry = { stage: stageOf(body), requestBytes: bytes(serialized), schemaViolations: [],
        scriptError: null, inputTokens: null, outputTokens: null, cachedInputTokens: null,
        reasoningTokens: null, tokensEstimated: false, costUsd: null, latencyMs: null, httpStatus: null };
      log.push(entry);
      const maxOutput = Number(body.max_output_tokens);
      const reservation = dmRequestReservation(dmModels["openai/gpt-6-astra"], entry.requestBytes,
        Number.isSafeInteger(maxOutput) ? maxOutput : 128000);
      if (budget.spentUsd + budget.reservedUsd + reservation > budget.limitUsd) {
        budget.exhausted = true;
        entry.scriptError = "budget_reached: request not sent";
        throw Error("eval_budget_reached");
      }
      budget.reservedUsd += reservation;
      const started = performance.now();
      try {
        const response = await fetch(url, init);
        entry.httpStatus = response.status;
        const payload = await response.clone().json().catch(() => null);
        const usage = payload?.usage;
        if (usage) {
          entry.inputTokens = usage.input_tokens ?? null;
          entry.outputTokens = usage.output_tokens ?? null;
          entry.cachedInputTokens = usage.input_tokens_details?.cached_tokens ?? null;
          entry.cacheWriteTokens = usage.input_tokens_details?.cache_write_tokens ?? 0;
          entry.reasoningTokens = usage.output_tokens_details?.reasoning_tokens ?? null;
          entry.costUsd = dmUsageCost(dmModels["openai/gpt-6-astra"], {
            inputTokens: entry.inputTokens ?? 0, outputTokens: entry.outputTokens ?? 0,
            cacheReadTokens: entry.cachedInputTokens ?? 0, cacheWriteTokens: entry.cacheWriteTokens,
            reasoningTokens: entry.reasoningTokens });
        } else {
          // Unknown usage after dispatch: keep the whole reservation as spent.
          entry.costUsd = reservation;
        }
        return response;
      } catch (error) {
        entry.costUsd = reservation;
        throw error;
      } finally {
        entry.latencyMs = Math.round(performance.now() - started);
        budget.reservedUsd -= reservation;
        budget.spentUsd += entry.costUsd ?? reservation;
        if (budget.spentUsd >= budget.limitUsd) budget.exhausted = true;
      }
    },
  };
}
