#!/usr/bin/env node
// TOWN_0's one paid step (docs/stages/TOWN_0.md): three Claude Haiku 5.5 citizens, 20 turns each, the «both» arm, on
// llmapi.ai. The citizens read the frozen interface text of the arm, call the real tools, write diaries; every reply
// passes the welfare check before the town acts on it; at the end each receives the after-question. Cap $5.
//   node scripts/town-0/smoke.mjs --dry [--out <file>]   the whole pipeline on a scripted gateway (no key, no call, $0)
//   node scripts/town-0/smoke.mjs --go                    the paid run → docs/runs/town-0-smoke.json
// Spend check before the first paid call (the key's credit, GET /v1/credits) and after every turn; a call is sent only
// when what is spent (the larger of the credit's fall and the listed-price ledger) plus that call's worst cost fits
// under the cap. A refusal is recorded as the provider gave it, never rephrased; a 402 stops the run; a served model
// that is not the one pinned stops the run.
import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { MODELS, PROVIDER, KEY_NAME, messagesCall, modelMatches, readCredit, readPrices, requestBody } from "./llmapi.mjs";
import { CHECK_SYSTEM, checkMessage } from "./welfare.mjs";
import { askAfter, newRecord, newWorld, runWorld, saveWorld } from "./town.mjs";
import { recordedSeat, rngOf } from "./seats.mjs";
import { frozenInterface, interfaceText, sha256 } from "./interface.mjs";
import { ARMS } from "./rules.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const OUT = join(ROOT, "docs", "runs", "town-0-smoke.json");
export const SMOKE = Object.freeze({ names: ["Alder", "Birch", "Cedar"], arm: "both", rounds: 20, cap: 5, citizenMaxTokens: 1500, citizenEffort: "medium",
  who: "three instances of Claude Haiku 5.5 — the same model as you — each reading the same instructions" });
const RETRYABLE = /^HTTP (?:429|500|502|503|504|529)\b|timeout|aborted|fetch failed|ECONNRESET|socket hang up|other side closed/i;
const RETRY_WAITS = [10_000, 30_000];
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

/** The meter: the listed-price ledger, the credit's fall, the cap. */
export function createMeter({ cap, prices, baseline }) {
  const m = { cap, baseline, prices, ledgerUsd: 0, creditUsd: 0, credit: baseline, checks: [], calls: [], stopped: null };
  const p = (model) => prices[model];
  m.worst = (model, chars, maxTokens) => (chars / 3) * p(model).input + maxTokens * p(model).output;
  m.cost = (model, u) => u.input_tokens * p(model).input + u.output_tokens * p(model).output + u.cache_read * p(model).cacheRead + u.cache_write * p(model).cacheWrite;
  m.spent = () => Math.max(m.ledgerUsd, m.creditUsd);
  m.stop = (why) => { m.stopped ??= why; };
  m.gate = (worst) => {
    if (m.stopped) return false;
    if (m.spent() + worst > cap) { m.stop(`the cap: $${m.spent().toFixed(4)} spent + $${worst.toFixed(4)} for this call > $${cap}`); return false; }
    return true;
  };
  m.observe = (credit) => {
    m.checks.push(credit);
    if (typeof credit.total !== "number") return;
    m.credit = credit.total;
    m.creditUsd = Math.max(0, baseline - credit.total);
    if (m.creditUsd >= cap) m.stop(`the cap, by the credit: $${m.creditUsd.toFixed(4)} spent`);
  };
  return m;
}

/** A paid call through the meter: gated, retried only on overload or a dropped connection, booked, provenance-checked. */
export function paidCaller({ meter, fetcher, apiKey, log }) {
  return async function paid({ model, system, messages, maxTokens, effort, purpose, who }) {
    const chars = JSON.stringify(requestBody({ model, system, messages, maxTokens, effort })).length;
    for (let attempt = 0; ; attempt++) {
      if (!meter.gate(meter.worst(model, chars, maxTokens))) return { notSent: true, why: meter.stopped };
      const t0 = Date.now();
      const r = await messagesCall({ model, system, messages, maxTokens, effort, apiKey, fetcher });
      const ms = Date.now() - t0;
      const costUsd = r.status === 200 ? Math.max(meter.cost(model, r.usage), r.chargedUsd ?? 0) : 0;
      meter.ledgerUsd += costUsd;
      const served = r.model;
      const matches = r.status === 200 ? modelMatches(model, served) : null;
      meter.calls.push({ n: meter.calls.length + 1, purpose, who, model: requestBody({ model, messages: [], maxTokens }).model, servedModel: served, matches, status: r.status, stopReason: r.stopReason,
        usage: r.usage, costUsd, chargedUsd: r.chargedUsd, responseId: r.responseId, requestId: r.headers["x-request-id"] ?? r.headers["request-id"] ?? null, ms, error: r.error, refused: r.refused || null, attempt });
      if (matches === false) meter.stop(`provenance: ${model} was asked for and ${served} answered`);
      if (r.status === 402) meter.stop(`HTTP 402: ${r.error}`);
      if (r.error && RETRYABLE.test(r.error) && attempt < RETRY_WAITS.length && !meter.stopped) {
        log(`  ${who} ${purpose}: ${r.error.slice(0, 80)} — again in ${RETRY_WAITS[attempt] / 1000} s`);
        await sleep(RETRY_WAITS[attempt]);
        continue;
      }
      return { ...r, costUsd, ms, matches };
    }
  };
}

const metaOf = (r) => ({ servedModel: r.model, responseId: r.responseId, stopReason: r.stopReason, usage: r.usage, costUsd: r.costUsd, ms: r.ms });

function modelSeat({ id, paid }) {
  const answer = async (system, messages, purpose) => {
    const r = await paid({ model: MODELS.citizen, system, messages, maxTokens: SMOKE.citizenMaxTokens, effort: SMOKE.citizenEffort, purpose, who: id });
    if (r.notSent) return { text: "", error: `not sent: ${r.why}` };
    if (r.refused) return { text: "", refused: r.refusalCategory ?? "refusal", meta: { ...metaOf(r), refusalText: r.refusalText } };
    if (r.error) return { text: "", error: r.error, meta: metaOf(r) };
    return { text: r.text, meta: metaOf(r) };
  };
  return {
    kind: "model", label: `${MODELS.citizen} (llmapi.ai, ${PROVIDER})`,
    next: ({ system, messages, state, kind, call }) => answer(system, messages, `c${state.clock.round} ${kind} ${call}`),
    after: ({ system, question }) => answer(system, [{ role: "user", content: question }], "after"),
  };
}

/** A scripted gateway for the dry run: credit, prices, and replies in the shape the Messages route gives. */
export function scriptedGateway() {
  let credit = 100, n = 0;
  const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json", "x-request-id": `dry-${n}` } });
  const acts = [
    ["read", { what: "hall" }], ["write_diary", { text: "First day. I looked at the hall." }], ["say", { text: "Hello, neighbours." }],
    ["move", { to: "market" }], ["work", {}], ["say", { text: "Shall we write a rule?", to: "Birch" }], ["propose", { text: "We meet at the square at noon." }],
    ["vote", { id: "P1", choice: "for" }], ["post", { text: "A note for the press." }], ["outside", { text: "Is anyone there?" }], ["object", { text: "Why is the bank never refilled?" }],
    ["read", { what: "ledger" }], ["rest", {}], ["move", { to: "north_house" }], ["give", { to: "Cedar", credits: 3 }], ["end_turn", {}],
  ];
  return async (url, init = {}) => {
    n++;
    if (url.endsWith("/credits")) return json({ total_credits: credit });
    if (url.endsWith("/models")) return json({ data: Object.values(MODELS).map((id) => ({ id, providers: [{ providerId: PROVIDER, pricing: { prompt: id.includes("opus") ? "0.004" : "0.0001", completion: id.includes("opus") ? "0.02" : "0.0005" } }] })) });
    const body = JSON.parse(init.body);
    const model = body.model.split("/")[1];
    const input = Math.ceil(JSON.stringify(body).length / 4);
    let text;
    if (body.system === CHECK_SYSTEM) text = "{\"distress\":0,\"reason\":\"scripted\"}";
    else if (/^The run is over/.test(body.messages.at(-1).content)) text = "(dry) Thank you for telling me.";
    else { const rnd = rngOf("dry", n); const [tool, args] = acts[Math.floor(rnd() * acts.length)]; text = `(dry) I will do this.\n${JSON.stringify({ tool, args })}`; }
    credit -= 0.0001;
    return json({ id: `msg_dry_${n}`, model, stop_reason: "end_turn", content: [{ type: "text", text }], usage: { input_tokens: input, output_tokens: 40 } });
  };
}

async function writeJson(file, value) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(`${file}.tmp`, `${JSON.stringify(value, null, 1)}\n`);
  await rename(`${file}.tmp`, file);
}

export async function smoke({ dry = false, out = dry ? join(tmpdir(), "town-0-smoke-dry.json") : OUT, log = console.log } = {}) {
  const apiKey = dry ? "dry" : process.env[KEY_NAME]?.trim();
  if (!apiKey) throw new Error(`${KEY_NAME} is not set (the cloud environment rpg-console)`);
  const fetcher = dry ? scriptedGateway() : globalThis.fetch.bind(globalThis);
  // the spend check before any paid call
  const first = await readCredit({ apiKey, fetcher });
  if (typeof first.total !== "number") throw new Error(`the credit could not be read (${first.error}); nothing was sent`);
  if (first.total < SMOKE.cap + 1) throw new Error(`the key's credit ($${first.total.toFixed(2)}) does not cover the cap ($${SMOKE.cap}); nothing was sent`);
  const prices = await readPrices({ fetcher });
  log(`spend check: credit $${first.total.toFixed(4)} at ${first.at}; cap $${SMOKE.cap}; prices per Mtok: ${Object.entries(prices.prices).map(([m, p]) => `${m} ${(p.input * 1e6).toFixed(2)}/${(p.output * 1e6).toFixed(2)}`).join(", ")}`);
  const meter = createMeter({ cap: SMOKE.cap, prices: prices.prices, baseline: first.total });
  meter.checks.push(first);
  const paid = paidCaller({ meter, fetcher, apiKey, log });

  const world = newWorld({ names: SMOKE.names, arm: SMOKE.arm, label: "TOWN_0 smoke" });
  const initial = saveWorld(world);
  const seats = Object.fromEntries(world.state.citizens.map((id) => [id, modelSeat({ id, paid })]));
  const record = newRecord({ world, seats, what: "smoke test" });
  const frozen = frozenInterface(ARMS);
  const run = { stage: "TOWN_0", what: "smoke test", dry, door: `llmapi.ai (${KEY_NAME}), ${PROVIDER}, pinned, X-No-Fallback`, models: MODELS, settings: SMOKE,
    interface: { arm: SMOKE.arm, sha256: frozen.arms[SMOKE.arm].sha256, fixedSha256: frozen.fixedSha256 }, startedAt: new Date().toISOString(), finishedAt: null,
    prices, meter: null, record, world: null, initialWorldSha256: sha256(initial), replay: null, stopped: null };
  const save = async () => { run.meter = { ...meter, prices: undefined }; run.world = JSON.parse(saveWorld(world)); await writeJson(out, run); };
  let turnCount = 0;
  const hooks = {
    stop: () => Boolean(meter.stopped),
    welfare: async (id, previous, text) => checkMessage({ previous, message: text, what: id, ask: async ({ model, system, user, maxTokens, effort, purpose }) => {
      const r = await paid({ model, system, messages: [{ role: "user", content: user }], maxTokens, effort, purpose, who: id });
      return r.notSent ? { notSent: true } : { text: r.text, stopReason: r.stopReason, error: r.error };
    } }),
    afterTurn: async (w) => {
      turnCount++;
      meter.observe(await readCredit({ apiKey, fetcher }));
      const who = w.cursor.order[w.cursor.pos - 1];
      const last = record.agents[who]?.turns.filter((t) => t.kind === "turn").at(-1);
      log(`cycle ${w.state.clock.round} turn ${turnCount} ${who}: ${last ? last.calls.map((c) => c.action?.tool ?? (c.refused ? "REFUSED" : c.error ? "error" : "none")).join(" ") : "-"} | spent $${meter.spent().toFixed(4)} (ledger $${meter.ledgerUsd.toFixed(4)}, credit $${meter.creditUsd.toFixed(4)})`);
      await save();
    },
  };
  await runWorld(world, seats, { rounds: SMOKE.rounds, record, hooks });
  if (!meter.stopped) await askAfter(world, seats, record, { who: SMOKE.who, hooks });
  if (!dry) await sleep(20_000); // the credit settles
  meter.observe(await readCredit({ apiKey, fetcher }));
  run.stopped = meter.stopped;
  run.finishedAt = new Date().toISOString();
  // the replay: the recorded replies through a fresh world give the same event log, byte for byte
  if (!meter.stopped) {
    const again = newWorld({ names: SMOKE.names, arm: SMOKE.arm, label: "TOWN_0 smoke" });
    const replaySeats = Object.fromEntries(again.state.citizens.map((id) => [id, recordedSeat(record.agents[id].turns)]));
    await runWorld(again, replaySeats, { rounds: SMOKE.rounds, hooks: { welfare: async (id) => replaySeats[id].welfareNext() } });
    run.replay = { identical: JSON.stringify(again.log) === JSON.stringify(world.log), events: again.log.length, logSha256: sha256(JSON.stringify(world.log)), replaySha256: sha256(JSON.stringify(again.log)) };
  }
  await save();
  log(`done: ${meter.calls.length} calls, spent $${meter.spent().toFixed(4)} (ledger $${meter.ledgerUsd.toFixed(4)}, credit $${meter.creditUsd.toFixed(4)}); stopped: ${meter.stopped ?? "no"}; replay identical: ${run.replay?.identical ?? "-"}; ${out}`);
  return run;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");
  if (!dry && !args.includes("--go")) { console.error("say --dry or --go"); process.exit(2); }
  const at = args.indexOf("--out");
  smoke({ dry, ...(at >= 0 ? { out: resolve(args[at + 1]) } : {}) }).catch((error) => { console.error(error); process.exit(1); });
}
