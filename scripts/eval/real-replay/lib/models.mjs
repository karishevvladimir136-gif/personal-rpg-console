// The models of a replay: the live adapters behind the money guard (the loop bench's rule —
// the worst case of every request is reserved before dispatch; a request that could cross
// the cap is not sent), or dry stand-ins that prove the harness without a provider.
import { registerHooks } from "node:module";
import { dmModels, dmRequestReservation } from "../../../../src/lib/model-runtime/dm-models.ts";
import { dmLoopLimits } from "../../../../src/lib/gameplay/dm-loop/limits.ts";
import { anthropicRequestId, callProvenance } from "../../lib/anthropic-endpoint.mjs";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only" ? { url: "data:text/javascript,export%20{}", shortCircuit: true } : nextResolve(specifier, context);
} });
const { createDmModel } = await import("../../../../src/lib/server/dm/model/index.ts");
hook.deregister();

const RESERVE_OUTPUT_TOKENS = dmLoopLimits.maxOutputTokens;

export const MODELS = {
  opus: { providerId: "anthropic", modelId: "claude-opus-5-5", label: "Opus 5.5" },
  fable: { providerId: "anthropic", modelId: "claude-fable-5-1", label: "Fable 5.1" },
  sonnet: { providerId: "anthropic", modelId: "claude-sonnet-5-5", label: "Sonnet 5.5" },
};

/** The variants a replay may play; «live» means the campaign's own choice at the turn (from the snapshot's settings). */
export const VARIANTS = {
  A: { id: "A", label: "Opus 5.5, single loop", runtime: "single", writer: MODELS.opus, effort: "high", bookkeeper: null, usdPerTurn: 0.30 },
  C: { id: "C", label: "Fable 5.1 writer + Opus 5.5 bookkeeper", runtime: "two-pass", writer: MODELS.fable, effort: "high", bookkeeper: { ...MODELS.opus, effort: "high" }, usdPerTurn: 0.67 },
  D: { id: "D", label: "Opus 5.5 writer + Sonnet 5.5 bookkeeper", runtime: "two-pass", writer: MODELS.opus, effort: "high", bookkeeper: { ...MODELS.sonnet, effort: "high" }, usdPerTurn: 0.28 },
  Dm: { id: "Dm", label: "Opus 5.5 writer + Sonnet 5.5 bookkeeper at medium", runtime: "two-pass", writer: MODELS.opus, effort: "high", bookkeeper: { ...MODELS.sonnet, effort: "medium" }, usdPerTurn: 0.26 },
  // Fix run A6: Opus writes and Opus records (the facts' baseline of the split).
  O: { id: "O", label: "Opus 5.5 writer + Opus 5.5 bookkeeper", runtime: "two-pass", writer: MODELS.opus, effort: "high", bookkeeper: { ...MODELS.opus, effort: "high" }, usdPerTurn: 0.40 },
};

export function createBudget(limitUsd) {
  return { limitUsd, spentUsd: 0, reservedUsd: 0, exhausted: false, requests: 0 };
}

/** Fix run: a run's cache salt — one neutral line before the first system block, so each arm of a comparison starts
 * from a cold provider cache (the arms' prompts are otherwise byte-identical and the later arm would read the earlier
 * arm's cache). Transport only: the app's request is otherwise unchanged. */
function salted(init, salt) {
  if (!salt || typeof init?.body !== "string") return init;
  const body = JSON.parse(init.body);
  if (!Array.isArray(body.system) || !body.system.length || typeof body.system[0].text !== "string") return init;
  body.system[0] = { ...body.system[0], text: `Run ${salt}.\n${body.system[0].text}` };
  return { ...init, body: JSON.stringify(body) };
}

export function guardedModel(selection, budget, apiKey, log, options = {}) {
  const spec = dmModels[`${selection.providerId}/${selection.modelId}`];
  if (!spec) throw new Error(`unknown model ${selection.providerId}/${selection.modelId}`);
  const reservations = new Map();
  const fetcher = async (url, rawInit) => {
    const init = salted(rawInit, options.salt);
    const bytes = Buffer.byteLength(String(init?.body ?? ""), "utf8");
    const reservation = dmRequestReservation(spec, bytes, RESERVE_OUTPUT_TOKENS);
    if (budget.spentUsd + budget.reservedUsd + reservation > budget.limitUsd) {
      budget.exhausted = true;
      log.push({ event: "budget_reached", model: selection.modelId, requestBytes: bytes, reservationUsd: reservation });
      throw Object.assign(new Error("eval_budget_reached"), { name: "EvalBudget" });
    }
    budget.reservedUsd += reservation;
    budget.requests++;
    const started = performance.now();
    try {
      const response = await fetch(url, init);
      // BEDROCK_PROVIDER_1 §4: the door of the call and the provider's request id.
      log.push({ event: "http", model: selection.modelId, status: response.status, requestBytes: bytes, latencyMs: Math.round(performance.now() - started),
        ...callProvenance(selection.providerId, url),
        requestId: anthropicRequestId(response.headers) ?? response.headers.get("x-request-id") });
      if (response.ok) reservations.set(budget.requests, reservation);
      else budget.reservedUsd -= reservation;
      return response;
    } catch (error) {
      budget.reservedUsd -= reservation;
      throw error;
    }
  };
  const model = createDmModel(selection, { apiKey, fetcher, maxRetries: 1 });
  const settle = (costUsd) => {
    for (const [key, reservation] of reservations) { budget.reservedUsd -= reservation; reservations.delete(key); }
    budget.spentUsd += costUsd;
    if (budget.spentUsd >= budget.limitUsd) budget.exhausted = true;
  };
  const abandon = () => {
    for (const [key, reservation] of reservations) { budget.reservedUsd -= reservation; budget.spentUsd += reservation; reservations.delete(key); }
    if (budget.spentUsd >= budget.limitUsd) budget.exhausted = true;
  };
  return { model, settle, abandon };
}

/** A dry stand-in per role: the writer narrates and closes with a ledger (or, in the single loop,
 * records time and finishes); the bookkeeper records time and finishes. Proves the harness, never the models. */
export function dryModel(selection, role) {
  let calls = 0;
  async function* stream(request) {
    const last = [...request.messages].reverse().find((m) => m.role === "user");
    const said = (last?.text ?? "").replace(/\s+/g, " ").slice(0, 120);
    const hasFinish = request.toolset?.tools.some((tool) => tool.name === "finish_turn") ?? false;
    const text = role === "writer" && !hasFinish
      ? `Сухой прогон. Ты сказал: «${said}». Марта вытирает руки о передник и ждёт.\n\n<ledger>\nвремя — 10 минут, герой на причале\nсцена — conversation; в фокусе Марта; напряжение дальше: calm\n</ledger>`
      : role === "writer" ? `Сухой прогон. Ты сказал: «${said}». Утро на причале тянется дальше.` : "";
    for (let at = 0; at < text.length; at += 24) yield { type: "text_delta", text: text.slice(at, at + 24) };
    const toolCalls = hasFinish ? [
      { id: `dry_${++calls}`, name: "advance_time", arguments: JSON.stringify({ minutes: 10, reason: "сухой прогон" }) },
      { id: `dry_${++calls}`, name: "finish_turn", arguments: JSON.stringify({ sceneKinds: ["conversation"], spotlight: [], playerMoment: false, nextTension: "calm" }) },
    ] : [];
    for (const call of toolCalls) yield { type: "tool_call", ...call };
    yield { type: "usage", usage: { inputTokens: 1000, outputTokens: Math.ceil(text.length / 4), cacheReadTokens: 0, cacheWriteTokens: 0, reasoningTokens: 0 } };
    yield { type: "stop", reason: toolCalls.length ? "tool_use" : "end", providerReason: "dry", native: { providerId: selection.providerId, modelId: selection.modelId, items: [] } };
  }
  return { providerId: selection.providerId, modelId: selection.modelId, stream };
}
