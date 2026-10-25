// The records judge of the bake-off: Claude Sonnet 5.5 compares each turn's
// records with its narration (items, money, debts and promises, people, places,
// time) and counts misses, wrong records and inventions. Rejected calls come
// from the record itself. One request per committed turn, JSON out.
//   node scripts/eval/dm-arch/judge.mjs --budget-usd 2 [--files a.jsonl,b.jsonl] [--effort low] [--dry]
// Restart-safe: a turn judged in any docs/runs/dmarch-*-judge*.jsonl is skipped.
import { appendFile, mkdir, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { anthropicKey, scriptAnthropicEndpoint } from "../lib/anthropic-endpoint.mjs";
import { dmModels, dmUsageCost } from "../../../src/lib/model-runtime/dm-models.ts";
import { createLoopBudget } from "../lib/loop-harness.mjs";
import { stamp, RUNS_DIR } from "./lib/harness.mjs";
import { openRun as openDmArchRun } from "./lib/ledger.mjs";
import { openRun as openPolish3Run } from "../real-replay/lib/ledger.mjs";

const JUDGE = { providerId: "anthropic", modelId: "claude-sonnet-5-5" };
const MAX_OUTPUT = 2500;
// Polish 3 §6: `--ledger polish3` charges the stage's own ledger and names the record polish3-…-judge; the
// turn records of the loop bench (scripts/eval/run.mjs with --bookkeeper) are judged like the bake-off's.
const args = { budgetUsd: null, files: null, effort: "medium", dry: false, ledger: "dmarch" };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = () => process.argv[++i];
  if (flag === "--budget-usd") args.budgetUsd = Number(value());
  else if (flag === "--files") args.files = value().split(",");
  else if (flag === "--effort") args.effort = value();
  else if (flag === "--dry") args.dry = true;
  else if (flag === "--ledger") args.ledger = value();
  else throw new Error(`unknown argument ${flag}`);
}
if (!args.dry && !(args.budgetUsd > 0)) throw new Error("--budget-usd N (N > 0) is required (or --dry)");
if (!["dmarch", "polish3", "voice"].includes(args.ledger)) throw new Error("--ledger must be dmarch, polish3 or voice");
const prefix = args.ledger === "dmarch" ? "dmarch" : args.ledger;
// The real-replay ledger module serves several stages (its default is the voice stage's): name the ledger explicitly.
const openRun = args.ledger === "dmarch" ? openDmArchRun : (run, budgetUsd, what) => openPolish3Run(run, budgetUsd, what, args.ledger);

const CATEGORIES = ["items", "money", "debts_promises", "people", "places", "time"];
const SYSTEM = `You are the records judge of a role-playing game. A game master narrated one turn; a bookkeeping layer then made records in the game's database through tools. You compare the records with the narration and report, per category, how many facts of the narration should have been recorded (narrated), how many of them were recorded correctly (recorded), how many were missed (missed), how many records contradict the narration (wrong: a wrong amount, owner, name, direction or time), and how many records have no basis in the narration or the writer's ledger (invented, counted once overall).

Rules:
- Count durable facts only: a thing gained, lost, handed over or changed; money paid, received or owed; a debt or promise made or settled; a person met, named or whose standing changed; a place entered or learned of; time passing. Mood, dialogue and description are not records.
- Judge the records by what the state diff and the accepted calls show. Private notes (note_world, note_character) count as records of secrets and plans; a Character Model written for a person met counts under people.
- A roll is not a record. Rejected calls are reported separately by the bench; ignore them unless a rejection left a narrated fact unrecorded (then it is a miss).
- The writer's ledger, when present, is private intent: a fact in the ledger but not in the narration is still a fact to record (the player was not meant to see it); a fact in the narration but missing from the ledger is still a fact to record.
- Time: the narration's words («через час», «к вечеру», «утром») against the minutes that passed in the state; a mismatch of more than about a third is wrong; no time passing on a scene that clearly took time is a miss.
- Answer with one JSON object only, no prose around it:
{"categories":{"items":{"narrated":0,"recorded":0,"missed":0,"wrong":0},"money":{…},"debts_promises":{…},"people":{…},"places":{…},"time":{…}},"invented":0,"notes":["short notes on each miss, wrong or invented record, in English"],"verdict":"good|fair|poor"}
verdict: good = nothing missed or wrong that matters to play; fair = one or two small gaps; poor = a money, item, debt or person fact is missing or wrong.`;

function brief(turn) {
  // The loop bench's records (polish 3 §6) keep the ledger as {found, text, clipped} and the clock as worldMinutesBefore/After, as the bake-off's do.
  const accepted = turn.receipts.filter((r) => r.result.ok).map((r) => ({ tool: r.call.name, arguments: r.call.arguments, summary: r.result.summary }));
  const rejected = turn.receipts.filter((r) => !r.result.ok).map((r) => ({ tool: r.call.name, arguments: r.call.arguments, reason: r.result.reason }));
  return [
    `Player's input: ${turn.input}`,
    `Narration (what the player saw):\n${turn.narration}`,
    turn.ledger ? `Writer's ledger (private; ${turn.ledger.found ? "written by the writer" : "none was written"}):\n${turn.ledger.text || "(empty)"}` : "Writer's ledger: not applicable (single-model turn).",
    `Minutes of game time that passed: ${turn.worldMinutesAfter != null && turn.worldMinutesBefore != null ? turn.worldMinutesAfter - turn.worldMinutesBefore : "unknown"}`,
    `Accepted records (tool, arguments, summary):\n${JSON.stringify(accepted, null, 1)}`,
    `Rejected calls:\n${rejected.length ? JSON.stringify(rejected, null, 1) : "none"}`,
    `State diff (before → after):\n${JSON.stringify(turn.changes ?? {}, null, 1).slice(0, 12000)}`,
  ].join("\n\n");
}

function validate(value) {
  if (!value || typeof value !== "object" || !value.categories) throw new Error("no categories");
  const categories = {};
  for (const name of CATEGORIES) {
    const row = value.categories[name] ?? {};
    categories[name] = Object.fromEntries(["narrated", "recorded", "missed", "wrong"].map((key) => [key, Math.max(0, Number(row[key]) || 0)]));
  }
  return { categories, invented: Math.max(0, Number(value.invented) || 0), notes: Array.isArray(value.notes) ? value.notes.map(String).slice(0, 20) : [],
    verdict: ["good", "fair", "poor"].includes(value.verdict) ? value.verdict : "fair" };
}

function parseJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("no JSON in the judge's answer");
  return JSON.parse(text.slice(start, end + 1));
}

async function judged() {
  const done = new Map();
  const files = (await readdir(RUNS_DIR)).filter((file) => /^(dmarch|polish3)-.*-judge.*\.jsonl$/.test(file) && !file.includes("-dry"));
  for (const file of files)
    for (const line of (await readFile(join(RUNS_DIR, file), "utf8")).split("\n")) {
      if (!line.trim()) continue;
      const record = JSON.parse(line);
      if (record.type === "judgement" && record.result) done.set(record.operationId, record);
    }
  return done;
}

const files = args.files ?? (await readdir(RUNS_DIR)).filter((file) => /^dmarch-.*\.jsonl$/.test(file) && !/-judge|-dry|-smoke/.test(file)).map((file) => join(RUNS_DIR, file));
const turns = [];
for (const file of files)
  for (const line of (await readFile(file, "utf8")).split("\n")) {
    if (!line.trim()) continue;
    const record = JSON.parse(line);
    if (record.type === "turn" && record.outcome === "committed" && record.narration) turns.push(record);
  }
const done = args.dry ? new Map() : await judged();
const pending = turns.filter((turn) => !done.has(turn.operationId));
const runId = `${prefix}-${stamp()}-judge${args.dry ? "-dry" : ""}`;
const recordFile = join(RUNS_DIR, `${runId}.jsonl`);
await mkdir(RUNS_DIR, { recursive: true });
const write = (record) => appendFile(recordFile, `${JSON.stringify(record)}\n`, "utf8");
const apiKey = args.dry ? null : anthropicKey();
if (!args.dry && !apiKey) throw new Error("ANTHROPIC_API_KEY is needed (environment or .env.local)");
const spec = dmModels[`${JUDGE.providerId}/${JUDGE.modelId}`];
const ledger = args.dry ? null : await openRun(runId, args.budgetUsd, `records judge (${pending.length} turns, ${JUDGE.modelId} ${args.effort})`);
const budget = createLoopBudget(args.dry ? 0 : ledger.budgetUsd);
await write({ type: "run", run: runId, purpose: "DM architecture bake-off: records judge", judge: JUDGE.modelId, effort: args.effort,
  files: files.map((file) => file.replace(`${RUNS_DIR}/`, "")), turns: pending.length, skipped: turns.length - pending.length,
  startedAt: new Date().toISOString(), budgetUsd: budget.limitUsd });
console.log(`${args.dry ? "Dry" : "Live"} judge: ${pending.length} turn(s) to judge, ${turns.length - pending.length} already judged${args.dry ? "" : `, hard budget ${budget.limitUsd.toFixed(2)} USD`}.`);

let stopReason = null;
let count = 0;
try {
  for (const turn of pending) {
    const user = brief(turn);
    const body = { model: JUDGE.modelId, max_tokens: MAX_OUTPUT, system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: [{ type: "text", text: user }] }], output_config: { effort: args.effort } };
    const bytes = Buffer.byteLength(JSON.stringify(body), "utf8");
    const reservation = ((bytes / 2 + 2048) * spec.price.cacheWrite + MAX_OUTPUT * spec.price.output) / 1_000_000;
    if (args.dry) {
      await write({ type: "judgement", run: runId, operationId: turn.operationId, turnRun: turn.run, variant: turn.variant, step: turn.step, scene: turn.scene,
        judge: JUDGE.modelId, dry: true, usage: null, costUsd: 0, result: validate({ categories: {}, invented: 0, notes: ["dry"], verdict: "fair" }) });
      count++;
      continue;
    }
    if (budget.spentUsd + reservation > budget.limitUsd) { budget.exhausted = true; stopReason = "budget_reached"; break; }
    const started = performance.now();
    const door = scriptAnthropicEndpoint();
    const response = await fetch(door.messagesUrl, { method: "POST",
      headers: door.headers(apiKey), body: JSON.stringify(door.body(body)) });
    const payload = await response.json();
    if (!response.ok) {
      const message = String(payload?.error?.message ?? `HTTP ${response.status}`).replaceAll(apiKey, "[key]");
      await write({ type: "judgement", run: runId, operationId: turn.operationId, turnRun: turn.run, variant: turn.variant, step: turn.step, scene: turn.scene,
        judge: JUDGE.modelId, error: message, usage: null, costUsd: 0, result: null });
      console.log(`  ${turn.variant} ${turn.step}: HTTP ${response.status} ${message.slice(0, 120)}`);
      if (response.status === 401 || response.status === 403) { stopReason = `http_${response.status}`; break; }
      continue;
    }
    const usage = { inputTokens: (payload.usage?.input_tokens ?? 0) + (payload.usage?.cache_read_input_tokens ?? 0) + (payload.usage?.cache_creation_input_tokens ?? 0),
      outputTokens: payload.usage?.output_tokens ?? 0, cacheReadTokens: payload.usage?.cache_read_input_tokens ?? 0,
      cacheWriteTokens: payload.usage?.cache_creation_input_tokens ?? 0, reasoningTokens: null };
    const costUsd = dmUsageCost(spec, usage);
    budget.spentUsd += costUsd;
    budget.requests++;
    const text = (payload.content ?? []).filter((block) => block.type === "text").map((block) => block.text).join("\n");
    let result = null, error = null;
    try { result = validate(parseJson(text)); } catch (parseError) { error = `unparsable: ${String(parseError.message)}; ${text.slice(0, 200)}`; }
    await write({ type: "judgement", run: runId, operationId: turn.operationId, turnRun: turn.run, variant: turn.variant, step: turn.step, scene: turn.scene,
      judge: JUDGE.modelId, effort: args.effort, stopReason: payload.stop_reason, latencyMs: Math.round(performance.now() - started), usage, costUsd: Number(costUsd.toFixed(5)), result, error });
    count++;
    const totals = result ? CATEGORIES.reduce((acc, name) => ({ missed: acc.missed + result.categories[name].missed, wrong: acc.wrong + result.categories[name].wrong }), { missed: 0, wrong: 0 }) : null;
    console.log(`  ${turn.variant} ${turn.step}: ${result ? `${result.verdict} · missed ${totals.missed} · wrong ${totals.wrong} · invented ${result.invented}` : error} · $${costUsd.toFixed(4)} · spent $${budget.spentUsd.toFixed(4)}`);
  }
} finally {
  await write({ type: "end", run: runId, finishedAt: new Date().toISOString(), stopReason, judged: count, modelRequests: budget.requests, spentUsd: Number(budget.spentUsd.toFixed(5)) });
  if (ledger) await ledger.settle(budget.spentUsd, `docs/runs/${runId}.jsonl`);
}
console.log(`\n${count} turn(s) judged; spent ${budget.spentUsd.toFixed(4)} USD${stopReason ? `; stopped: ${stopReason}` : ""}. Record: docs/runs/${runId}.jsonl`);
