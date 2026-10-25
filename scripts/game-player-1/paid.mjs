// Game player 1: one meter for every paid call of the run — the DM's turns and preparation, the app's own in-turn checks,
// the players, the welfare checks and the judges. It sits in front of `fetch` for the whole process, so a call made deep
// inside the app is metered and gated exactly like the harness's own:
//   - a ledger and a cap per door (the Anthropic Console, OpenRouter for the Claude models since ANTHROPIC_PROVIDERS_1,
//     OpenAI); every call is held at its worst cost while in flight, and a call that could pass its cap — or that goes
//     to a door the stage has no ledger for — is not sent;
//   - persona memory F2's rules: no retry after a refusal (a refusal closes its context: the session it belongs to sends
//     nothing more), the circuit breaker at 3 refusals in the stage, a stop at once on an error that mentions
//     suspension, access or policy (or HTTP 401/403), never a retry into a quota;
//   - on HTTP 429 that is a rate limit (not a quota) the call waits (retry-after, else 20 s, 40 s, 80 s …) and is sent
//     again, invisibly to the app — «on 429 wait and continue»;
//   - pictures are off for this run: any request to the picture providers is refused before it is sent.
// Streamed answers are read on a copy of the stream for their usage; the app reads the other copy untouched. Keys are
// never seen here beyond the request headers the callers set, and nothing of a request or a key is logged.
import { AsyncLocalStorage } from "node:async_hooks";
import { anthropicDoorOf } from "../../src/lib/server/anthropic-endpoint.ts";

export const MAX_REFUSALS = 3;
export const STOP_PATTERN = /suspend|access|policy/i;
/** A 429 that is a quota (never retried into) rather than a rate limit (waited out): OpenAI's `insufficient_quota`, or a
 * message about the quota, the credit balance, billing or a spend / usage limit; a provider's own `rate_limit_error` /
 * `rate_limit_exceeded` whose message names none of these is a rate limit. The response text is kept on the ledger row. */
const QUOTA = /insufficient_quota|exceeded your (?:current )?quota|credit balance|billing|spend limit|usage limits?\b(?! for| increase)/i;
export function quotaOf(detail) {
  let body = null;
  try { body = JSON.parse(detail); } catch { body = null; }
  const code = String(body?.error?.code ?? body?.error?.type ?? "");
  const message = String(body?.error?.message ?? detail ?? "");
  if (code === "insufficient_quota") return true;
  return QUOTA.test(message);
}
export const WAITS_429 = [20_000, 40_000, 80_000, 120_000, 120_000, 120_000];

/** USD per 1M tokens (docs/MODELS.md, src/lib/model-runtime/dm-models.ts; Sol's cached input booked at the full input
 * price, as X1 did, an over-statement). */
export const PRICES = {
  "claude-opus-5-5": { provider: "anthropic", input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5, cacheWrite1h: 8 },
  "claude-fable-5-1": { provider: "anthropic", input: 10, output: 50, cacheRead: 0.25, cacheWrite: 12.5, cacheWrite1h: 20 },
  "claude-sonnet-5-5": { provider: "anthropic", input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5, cacheWrite1h: 4 },
  "claude-haiku-5-5": { provider: "anthropic", input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125, cacheWrite1h: 0.2 },
  "gpt-6-astra": { provider: "openai", input: 10, output: 50, cacheRead: 1, cacheWrite: 12.5 },
  "gpt-6.1-sol": { provider: "openai", input: 2, output: 10, cacheRead: 2, cacheWrite: 2.5 },
  "gpt-6-luna": { provider: "openai", input: 0.1, output: 0.5, cacheRead: 0.1, cacheWrite: 0.125 },
  "text-embedding-3-small": { provider: "openai", input: 0.02, output: 0, cacheRead: 0.02, cacheWrite: 0.02 },
  "text-embedding-3-large": { provider: "openai", input: 0.13, output: 0, cacheRead: 0.13, cacheWrite: 0.13 },
};
/** The ledger a request goes on: a Claude door as the app's endpoint helper names it (the Console, OpenRouter, Bedrock —
 * the same Messages bodies and streams on each, its own ledger at list prices), or OpenAI; null for any other host. */
const paidOf = (url) => {
  const door = anthropicDoorOf(url);
  if (door) return { provider: door.provider, format: "anthropic" };
  return url.startsWith("https://api.openai.com/") ? { provider: "openai", format: "openai" } : null;
};
/** The app's model id for a door's id (OpenRouter's `anthropic/claude-opus-5.5` → `claude-opus-5-5`), for the prices.
 * Only an OpenRouter Claude slug is rewritten: every other id (`gpt-6.1-sol` among them) is priced as it is. */
export const priceId = (model) => {
  const id = String(model ?? "");
  return /^anthropic\/claude-/.test(id) ? id.slice("anthropic/".length).replace(/(\d)\.(\d)/g, "$1-$2") : id;
};
const BLOCKED = (url) => /^https:\/\/([a-z0-9-]+\.)*fal\.(run|media|ai)\//i.test(url) || /\/v1\/images\//.test(url);

/** USD of one call from its usage in the Anthropic field names (input = the uncached remainder). */
export function costOf(model, usage = {}) {
  const p = PRICES[priceId(model)];
  if (!p) return null;
  const write1h = usage.cache_write_1h ?? 0, write5m = Math.max(0, (usage.cache_creation_input_tokens ?? 0) - write1h);
  return ((usage.input_tokens ?? 0) * p.input + (usage.cache_read_input_tokens ?? 0) * p.cacheRead + write5m * p.cacheWrite
    + write1h * (p.cacheWrite1h ?? p.cacheWrite) + (usage.output_tokens ?? 0) * p.output) / 1e6;
}
/** The most a call can cost: its body as input at the dearest input rate (≈ 3 characters a token) and its output cap. */
export function worstOf(model, bodyChars, maxTokens) {
  const p = PRICES[priceId(model)] ?? { input: 10, output: 50, cacheWrite: 12.5, cacheWrite1h: 20 };
  return ((bodyChars / 3) * Math.max(p.input, p.cacheWrite ?? 0, p.cacheWrite1h ?? 0) + (maxTokens ?? 32_000) * p.output) / 1e6;
}

/** Usage from an Anthropic Messages body or an OpenAI Responses / embeddings body, in the Anthropic names. */
export function usageOf(provider, body) {
  if (!body) return {};
  if (provider === "anthropic") {
    const u = body.usage ?? {};
    return { input_tokens: u.input_tokens ?? 0, cache_read_input_tokens: u.cache_read_input_tokens ?? 0, cache_creation_input_tokens: u.cache_creation_input_tokens ?? 0,
      cache_write_1h: u.cache_creation?.ephemeral_1h_input_tokens ?? 0, output_tokens: u.output_tokens ?? 0 };
  }
  const u = body.usage ?? {};
  const cached = u.input_tokens_details?.cached_tokens ?? 0, written = u.input_tokens_details?.cache_write_tokens ?? 0;
  const input = u.input_tokens ?? u.prompt_tokens ?? 0;
  return { input_tokens: Math.max(0, input - cached - written), cache_read_input_tokens: cached, cache_creation_input_tokens: written, output_tokens: u.output_tokens ?? 0,
    reasoning_tokens: u.output_tokens_details?.reasoning_tokens ?? 0 };
}
/** Whether a finished body is a refusal (Anthropic stop_reason, an OpenAI refusal part or content filter). */
export function refusalOf(provider, body) {
  if (!body) return null;
  if (provider === "anthropic") return body.stop_reason === "refusal" ? (body.stop_details?.category ?? "refusal") : null;
  const parts = (body.output ?? []).filter((o) => o.type === "message").flatMap((o) => o.content ?? []);
  if (parts.some((p) => p.type === "refusal")) return "refusal";
  if (body.status === "incomplete" && body.incomplete_details?.reason === "content_filter") return "content_filter";
  return null;
}

/** Reads a server-sent-event stream (a copy) to its end and folds the events into one body with the usage and stop. */
export async function foldStream(provider, stream) {
  const decoder = new TextDecoder();
  let buffer = "", body = provider === "anthropic" ? { usage: {}, stop_reason: null, model: null } : null;
  const take = (data) => {
    let event;
    try { event = JSON.parse(data); } catch { return; }
    if (provider === "anthropic") {
      if (event.type === "message_start") { body.model = event.message?.model ?? null; body.id = event.message?.id ?? null; if (event.message?.provider) body.provider = event.message.provider; Object.assign(body.usage, event.message?.usage ?? {}); }
      else if (event.type === "message_delta") { Object.assign(body.usage, Object.fromEntries(Object.entries(event.usage ?? {}).filter(([, v]) => v !== null && v !== undefined))); if (event.delta?.stop_reason) body.stop_reason = event.delta.stop_reason; if (event.delta?.stop_details) body.stop_details = event.delta.stop_details; }
    } else if (event.type === "response.completed" || event.type === "response.incomplete" || event.type === "response.failed") body = event.response ?? body;
  };
  const reader = stream.getReader();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let at;
    while ((at = buffer.indexOf("\n\n")) >= 0) {
      const chunk = buffer.slice(0, at); buffer = buffer.slice(at + 2);
      const data = chunk.split("\n").filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("\n");
      if (data && data !== "[DONE]") take(data);
    }
  }
  return body;
}

const realSleep = (ms) => new Promise((done) => setTimeout(done, ms));

/** The ledger of one provider: its cap, what was spent before this process (earlier runs of the stage), the calls. */
export function createLedger(provider, capUsd, spentBefore = 0) {
  const calls = [];
  return {
    provider, capUsd, spentBefore, calls,
    get runUsd() { return calls.reduce((sum, c) => sum + (c.costUsd ?? 0), 0); },
    get spentUsd() { return spentBefore + this.runUsd; },
  };
}

/**
 * The meter. `fetcher` is the real fetch; `ledgers` { anthropic, openai }. `context` (an AsyncLocalStorage) carries the
 * purpose and the session of the call: `meter.within({ session, purpose }, fn)`.
 */
export function createMeter({ ledgers, fetcher = globalThis.fetch, sleep = realSleep, now = Date.now, log = () => {}, maxRefusals = MAX_REFUSALS, waits429 = WAITS_429, blocked = [] }) {
  const context = new AsyncLocalStorage();
  const inFlight = Object.fromEntries(Object.keys(ledgers).map((name) => [name, 0]));
  const closedSessions = new Map();
  let refusals = 0, stopped = null, waited429 = 0;
  const stop = (why) => { if (!stopped) { stopped = why; log(`STOP: ${why}`); } };
  const notSent = (why) => Object.assign(new Error(`game-player-1: not sent — ${why}`), { name: "GamePlayerStop", notSent: true });

  async function metered(input, init = {}) {
    const url = typeof input === "string" ? input : input?.url ?? String(input);
    if (BLOCKED(url)) throw notSent("pictures, soundtrack and Live frames are off for this run");
    const paid = paidOf(url);
    if (!paid) return fetcher(input, init);
    if (blocked.includes(paid.provider)) throw notSent(`${paid.provider} is not called in this pass`);
    const ctx = context.getStore() ?? {};
    const purpose = ctx.purpose ?? "unlabelled", session = ctx.session ?? null;
    if (stopped) throw notSent(stopped);
    if (session && closedSessions.has(session)) throw notSent(`session ${session} closed after a refusal (no retry after a refusal)`);
    const ledger = ledgers[paid.provider];
    if (!ledger) { stop(`a call to ${paid.provider}, which this stage has no ledger or cap for`); throw notSent(stopped); }
    const format = paid.format;
    const text = typeof init.body === "string" ? init.body : "";
    let request = {};
    try { request = JSON.parse(text); } catch { request = {}; }
    const model = request.model ?? "unknown";
    const worst = worstOf(model, text.length, request.max_tokens ?? request.max_output_tokens);
    if (ledger.spentUsd + inFlight[paid.provider] + worst > ledger.capUsd) {
      stop(`the ${paid.provider} cap of $${ledger.capUsd} would be passed (spent $${ledger.spentUsd.toFixed(4)}, this call at worst $${worst.toFixed(4)})`);
      throw notSent(stopped);
    }
    inFlight[paid.provider] += worst;
    const started = now();
    const row = { n: ledger.calls.length + 1, at: new Date(started).toISOString(), session, purpose, provider: paid.provider, model, endpoint: url.replace(/^https:\/\/[^/]+/, ""),
      status: null, stream: Boolean(request.stream), usage: null, costUsd: 0, seconds: null, stopReason: null, refusal: null, error: null, requestId: null, waits429: 0 };
    ledger.calls.push(row);
    const settle = (body, error = null) => {
      inFlight[paid.provider] -= worst;
      row.seconds = Math.round((now() - started) / 100) / 10;
      if (error) row.error = String(error).slice(0, 200);
      if (body) {
        row.usage = usageOf(format, body);
        row.costUsd = costOf(model, row.usage) ?? worst;
        row.stopReason = body.stop_reason ?? body.status ?? null;
        if (body.model && body.model !== model) row.servedModel = body.model;
        if (typeof body.provider === "string") row.upstream = body.provider.slice(0, 80);
        const refusal = refusalOf(format, body);
        if (refusal) countRefusal(row, refusal, session);
      } else if (row.status && row.status >= 200 && row.status < 300) row.costUsd = worst; // an unreadable success is booked at its worst
    };
    try {
      let response;
      for (let attempt = 0; ; attempt++) {
        response = await fetcher(input, init);
        row.status = response.status;
        row.requestId = response.headers?.get?.("request-id") ?? response.headers?.get?.("x-generation-id") ?? response.headers?.get?.("x-request-id") ?? null;
        if (response.status !== 429) break;
        const detail = await response.clone().text().catch(() => "");
        row.detail429 = [...(row.detail429 ?? []), detail.replace(/\s+/g, " ").slice(0, 400)];
        if (quotaOf(detail)) { stop(`a quota error from ${paid.provider} (HTTP 429): never retried into — ${detail.replace(/\s+/g, " ").slice(0, 200)}`); settle(null, `HTTP 429 quota: ${detail.replace(/\s+/g, " ").slice(0, 300)}`); return response; }
        if (attempt >= waits429.length || stopped) { stop(`HTTP 429 from ${paid.provider} after ${attempt} waits`); settle(null, "HTTP 429"); return response; }
        const after = Number(response.headers?.get?.("retry-after"));
        const wait = Number.isFinite(after) && after > 0 ? Math.min(after * 1000, 300_000) : waits429[attempt];
        row.waits429++; waited429++;
        log(`${purpose}: HTTP 429 rate limit — waiting ${Math.round(wait / 1000)} s, then the same call again`);
        await sleep(wait);
        if (stopped) { settle(null, "stopped while waiting on a 429"); throw notSent(stopped); }
      }
      if (!response.ok) {
        const detail = await response.clone().text().catch(() => "");
        const short = `HTTP ${response.status}: ${detail.replace(/\s+/g, " ").slice(0, 200)}`;
        if (STOP_PATTERN.test(detail) && !(response.status === 400 && /invalid_prompt|usage polic|flagged/i.test(detail))) stop(`an error mentions suspension, access or policy: ${short.slice(0, 160)}`);
        if (response.status === 401 || response.status === 403) stop(`the provider answered ${short.slice(0, 160)}`);
        // OpenRouter's «insufficient credits»: the account must be topped up — never retried into.
        if (response.status === 402) stop(`${paid.provider} refused for lack of credits: ${short.slice(0, 160)}`);
        if (paid.provider === "openai" && response.status === 400 && /invalid_prompt|usage polic|flagged|content.?filter/i.test(detail)) countRefusal(row, "invalid_prompt", session);
        settle(null, short);
        return response;
      }
      const type = response.headers?.get?.("content-type") ?? "";
      if (type.includes("text/event-stream") && response.body) {
        const [mine, theirs] = response.body.tee();
        foldStream(format, mine).then((body) => settle(body), (error) => settle(null, error?.message ?? error));
        return new Response(theirs, { status: response.status, statusText: response.statusText, headers: response.headers });
      }
      const body = await response.clone().json().catch(() => null);
      settle(body);
      return response;
    } catch (error) {
      if (row.seconds === null) settle(null, error?.message ?? error);
      throw error;
    }
  }

  function countRefusal(row, category, session) {
    row.refusal = category;
    refusals++;
    log(`refusal ${refusals} of ${maxRefusals} allowed in the stage (${row.purpose}, ${row.model}, ${category})`);
    if (session) closedSessions.set(session, row.purpose);
    if (refusals >= maxRefusals) stop(`the circuit breaker: ${refusals} refusals in the stage`);
  }

  return {
    fetch: metered,
    within: (store, fn) => context.run({ ...(context.getStore() ?? {}), ...store }, fn),
    install() { const previous = globalThis.fetch; globalThis.fetch = metered; return () => { globalThis.fetch = previous; }; },
    closed: (session) => closedSessions.get(session) ?? null,
    get refusals() { return refusals; },
    get stopped() { return stopped; },
    get waited429() { return waited429; },
    stop,
    ledgers,
    /** Waits for every streamed call to be settled (their usage arrives after the app has read the stream). */
    async drain(timeoutMs = 30_000) { const until = now() + timeoutMs; while (Object.values(inFlight).some((x) => x > 1e-12) && now() < until) await sleep(200); },
  };
}

/** The ledger as markdown: one line per call group (session × purpose kind × model), then the totals. */
export function ledgerMarkdown(ledger, title) {
  const kind = (purpose) => String(purpose).replace(/\bt\d+\b/g, "t*").replace(/#\d+/g, "#*");
  const groups = new Map();
  for (const c of ledger.calls) {
    const key = `${c.session ?? "—"} | ${kind(c.purpose)} | ${c.model}`;
    const g = groups.get(key) ?? { calls: 0, input: 0, cacheRead: 0, cacheWrite: 0, output: 0, usd: 0, errors: 0, refusals: 0, waits: 0 };
    g.calls++; g.input += c.usage?.input_tokens ?? 0; g.cacheRead += c.usage?.cache_read_input_tokens ?? 0; g.cacheWrite += c.usage?.cache_creation_input_tokens ?? 0;
    g.output += c.usage?.output_tokens ?? 0; g.usd += c.costUsd ?? 0; if (c.error) g.errors++; if (c.refusal) g.refusals++; g.waits += c.waits429 ?? 0;
    groups.set(key, g);
  }
  const rows = [...groups].map(([key, g]) => `| ${key} | ${g.calls} | ${g.input} | ${g.cacheRead} | ${g.cacheWrite} | ${g.output} | $${g.usd.toFixed(4)} | ${g.errors} | ${g.refusals} | ${g.waits} |`);
  return [`# ${title}`, "", `Cap $${ledger.capUsd}; spent before this run $${ledger.spentBefore.toFixed(4)}; this run $${ledger.runUsd.toFixed(4)}; total $${ledger.spentUsd.toFixed(4)}; ${ledger.calls.length} calls.`, "",
    "| Session | Purpose | Model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |", ...rows, ""].join("\n");
}
