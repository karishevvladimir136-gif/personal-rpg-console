// Live probe of the two DmModel adapters (Stage 1, section 6.1). Paid.
//   node scripts/eval/probe-models.mjs --budget-usd 2 [--models opus,astra] [--efforts medium,high] [--runs 2] [--dry-run]
// A toy DM loop with one locally executed tool, roll(formula, reason), a stable
// ~3.7k-token system prefix (to exercise prompt caching) and three short
// player lines in Russian. Each model/effort pair plays the three lines twice
// in a row; the second run should read the prefix from the cache.
// Before every request the worst case is reserved; a request that could push
// spending past the budget is never sent. Keys come from the environment or
// .env.local and are never printed.
import { registerHooks } from "node:module";
import { appendFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { providerKey } from "./lib/keys.mjs";
import { anthropicKey } from "./lib/anthropic-endpoint.mjs";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only"
    ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
    : nextResolve(specifier, context);
} });
const dm = await import("../../src/lib/server/dm/model/index.ts");
hook.deregister();
const { createDmModel, compileToolset, validateToolArguments, dmModels, dmUsageCost, dmRequestReservation, DmModelError } = dm;

const here = dirname(fileURLToPath(import.meta.url));
const MAX_OUTPUT = 3000;
const MAX_STEPS = 4;
const MODELS = { opus: "anthropic/claude-opus-5-5", astra: "openai/gpt-6-astra" };
const LINES = [
  "Я подхожу к мельнику и спрашиваю, не нужна ли ему помощь за плату.",
  "Пока он отвлёкся, я пытаюсь незаметно заглянуть в амбар за мельницей.",
  "Я торгуюсь: прошу десять монет вместо пяти и смотрю, согласится ли он.",
];

function parseArgs(argv) {
  const args = { budgetUsd: null, models: ["opus", "astra"], efforts: ["medium", "high"], runs: 2, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const value = () => argv[++i];
    if (flag === "--budget-usd") args.budgetUsd = Number(value());
    else if (flag === "--models") args.models = value().split(",");
    else if (flag === "--efforts") args.efforts = value().split(",");
    else if (flag === "--runs") args.runs = Number(value());
    else if (flag === "--dry-run") args.dryRun = true;
    else throw new Error(`unknown argument ${flag}`);
  }
  if (!args.dryRun && !(Number.isFinite(args.budgetUsd) && args.budgetUsd > 0))
    throw new Error("--budget-usd N (N > 0) is required for a live probe");
  if (!args.models.every((m) => Object.hasOwn(MODELS, m))) throw new Error("--models takes opus and/or astra");
  if (!args.efforts.every((e) => ["low", "medium", "high", "xhigh", "max"].includes(e))) throw new Error("--efforts: low,medium,high,xhigh,max");
  return args;
}

/** A deterministic, stable DM prefix of roughly 3.7k tokens. */
function stablePrefix() {
  const places = ["Millbrook", "the Old Mill", "the Brook Ford", "the Granary", "the Chapel of Ash", "Cooper's Yard",
    "the Weir", "the North Road", "Hollow Lane", "the Market Cross", "the Tannery", "the Bell Inn", "Rook Hill",
    "the Sluice Gate", "the Orchard Wall", "the Toll Bridge", "Fen End", "the Lime Kiln", "the Reeve's House",
    "the Common", "the Drovers' Rest", "Hawthorn Gap", "the Ferry Steps", "the Grain Barn", "Saltmarsh Edge",
    "the Wool Hall", "the Watchtower", "Ashgrove", "the Quarry Path", "the Shrine Pool"];
  const people = ["Oswin the miller", "Wenna the herbalist", "Brother Tobin", "Hale the reeve", "Maud the innkeeper",
    "Garret the cooper", "Ysolde the ferrywoman", "Pell the tanner", "Old Ketter", "Ansel the drover", "Liss the weaver",
    "Corwin the watchman", "Dunstan the smith", "Elspeth the baker", "Fennick the boatman", "Grisel the toll-keeper",
    "Hamon the shepherd", "Ivo the apprentice", "Jory the stablehand", "Kestra the hunter", "Lowell the clerk",
    "Mirelle the singer", "Nab the beggar", "Orla the lime-burner", "Perrin the carter", "Quill the scribe",
    "Rosamund the widow", "Sefton the guard", "Tamsin the drover", "Ulric the quarryman"];
  const moods = ["guarded", "cheerful", "tired", "proud", "anxious", "curious"];
  const wants = ["coin for the winter", "news from the city", "a debt forgiven", "help with the harvest",
    "a lost brother found", "quiet and order"];
  const secrets = ["owes the toll-keeper money", "hides grain from the reeve", "writes letters to a rival village",
    "fears the weir will break", "knows a path through the fen", "once served a bandit captain"];
  const lines = [
    "You are the Dungeon Master of a grounded, low-magic fantasy campaign. Narrate in Russian, in second person,",
    "in at most 120 words per reply. Give non-player characters their own voice, goals and the right to refuse.",
    "Never decide the hero's actions or feelings. Never reveal a character's secret unless the hero earns it.",
    "When an outcome is genuinely uncertain and failure would matter, call the roll tool with a dice formula and a",
    "short reason, then narrate the result you receive. Never invent dice results. Do not roll for conversation",
    "that has no real risk. Ordinary prices: bread 1 coin, a meal 2 coins, a day's labour 5 coins.",
    "World codex follows. It is background knowledge; mention details only when they matter to the scene.",
    "",
    "PLACES",
    ...places.map((place, n) => `- ${place}: ${["a muddy", "a quiet", "a busy", "an old", "a windswept", "a narrow"][n % 6]} ` +
      `spot ${n % 2 ? "east" : "west"} of the brook, known for ${["its smell of flour", "evening gossip", "stray dogs",
        "a cracked bell", "cold mornings", "travelling pedlars"][n % 6]}; ${n * 3 % 7 + 2} households live nearby and ` +
      `${["nobody trusts strangers", "travellers are welcome", "the reeve collects a toll", "children play by the water",
        "work is easy to find", "rumours spread fast"][n % 6]}.`),
    "",
    "PEOPLE",
    ...people.map((person, n) => `- ${person}: ${moods[n % 6]}, wants ${wants[n % 6]}, usually found near ` +
      `${places[(n * 7) % places.length]}. Private: ${secrets[n % 6]}. Speaks ${["briefly", "warmly", "slowly",
        "sharply", "with jokes", "in proverbs"][n % 6]} and ${["haggles hard", "pays fairly", "avoids the reeve",
        "trusts the chapel", "hates the toll", "loves gossip"][(n + 2) % 6]}.`),
    "",
    "RUMOURS (hearsay, may be false)",
    ...Array.from({ length: 24 }, (_, n) => `- ${people[(n * 11) % people.length]} says that ${people[(n * 5 + 3) % people.length]} ` +
      `${["was seen at", "argued loudly near", "buried something behind", "met a stranger at", "lost a purse near",
        "keeps a lantern burning at"][n % 6]} ${places[(n * 13) % places.length]} ${["last market day", "after the frost",
        "before dawn", "during the storm", "on the feast of ash", "three nights ago"][(n + 1) % 6]}, and that the reeve ` +
      `${["does not know", "pretends not to know", "would pay to know", "already suspects"][n % 4]}.`),
    "",
    "RULES OF THUMB",
    ...Array.from({ length: 12 }, (_, n) => `- Rule ${n + 1}: ${["Difficulty 10 is easy, 15 is hard, 20 is heroic.",
      "Sneaking past an alert person is uncertain; roll 1d20 against 12.", "Haggling beyond a fair price needs a roll.",
      "A failed roll changes the situation; it never ends the story.", "Time passes: name it when it matters.",
      "Coins and items change only when the scene clearly says so."][n % 6]} Keep the scene moving.`),
  ];
  return lines.join("\n");
}

const rollTool = {
  name: "roll",
  description: "Roll dice on the server for an uncertain outcome and get the result.",
  parameters: { type: "object", properties: {
    formula: { type: "string", description: "Dice formula, e.g. 1d20+3 or 2d6.", maxLength: 20, pattern: "^\\d{0,2}d\\d{1,3}([+-]\\d{1,3})?$" },
    reason: { type: "string", description: "Short reason for the roll.", maxLength: 160 },
  } },
};
const toolset = compileToolset([rollTool]);

let seed = 20261015;
const random = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32);
function executeRoll(call) {
  let args;
  try { args = JSON.parse(call.arguments); } catch { return { callId: call.id, output: "invalid JSON arguments", isError: true }; }
  const problems = validateToolArguments(rollTool, args);
  if (problems.length) return { callId: call.id, output: problems.join("; "), isError: true };
  const [, count, sides, modifier] = /^(\d{0,2})d(\d{1,3})([+-]\d{1,3})?$/.exec(args.formula);
  const rolls = Array.from({ length: Number(count || 1) }, () => 1 + Math.floor(random() * Number(sides)));
  const total = rolls.reduce((a, b) => a + b, 0) + Number(modifier ?? 0);
  return { callId: call.id, output: JSON.stringify({ formula: args.formula, rolls, modifier: Number(modifier ?? 0), total }), isError: false };
}

const args = parseArgs(process.argv.slice(2));
const prefix = stablePrefix();
const system = [{ text: prefix, cache: true },
  { text: "Current scene: Millbrook, a grey morning. The hero Rowan, a wandering labourer, stands by the Old Mill. Oswin the miller is stacking sacks.", cache: false }];
console.log(`Stable prefix: ${prefix.length} characters (~${Math.round(prefix.length / 4)} tokens).`);
if (args.dryRun) {
  console.log("Dry run: no requests sent.");
  process.exit(0);
}

const budget = { cap: args.budgetUsd, spent: 0, exhausted: false, inflight: null };
function guarded(spec) {
  return async (url, init) => {
    // A dispatched request that returned 200 but never reported usage keeps its whole reservation.
    if (budget.inflight?.ok) budget.spent += budget.inflight.reservation;
    budget.inflight = null;
    const bytes = Buffer.byteLength(String(init.body));
    const body = JSON.parse(init.body);
    const reservation = dmRequestReservation(spec, bytes, body.max_tokens ?? body.max_output_tokens);
    if (budget.spent + reservation > budget.cap) {
      budget.exhausted = true;
      throw new DmModelError("fatal", "budget_reached: request not sent");
    }
    const response = await fetch(url, init);
    budget.inflight = { reservation, ok: response.ok };
    return response;
  };
}
function settle(spec, usage) {
  if (usage) budget.spent += dmUsageCost(spec, usage);
  else if (budget.inflight?.ok) budget.spent += budget.inflight.reservation;
  budget.inflight = null;
}

await mkdir(join(here, "out"), { recursive: true });
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
const outFile = join(here, "out", `probe-${stamp}.jsonl`);
const write = (record) => appendFile(outFile, `${JSON.stringify(record)}\n`, "utf8");
await write({ type: "probe", startedAt: new Date().toISOString(), budgetUsd: args.budgetUsd, models: args.models,
  efforts: args.efforts, runs: args.runs, prefixChars: prefix.length, maxOutputTokens: MAX_OUTPUT });

const keys = { anthropic: anthropicKey(), openai: providerKey("OPENAI_API_KEY") };
const summary = [];
outer:
for (const effort of args.efforts) {
  for (const name of args.models) {
    const spec = dmModels[MODELS[name]];
    const model = createDmModel(spec, { apiKey: keys[spec.providerId] ?? "", fetcher: guarded(spec), maxRetries: 1 });
    for (let run = 1; run <= args.runs; run++) {
      const messages = [];
      for (const [index, line] of LINES.entries()) {
        messages.push({ role: "user", text: line });
        const lineStart = performance.now();
        let firstText = null, cost = 0, reply = "", error = null;
        const requests = [];
        for (let step = 0; step < MAX_STEPS; step++) {
          const start = performance.now();
          let firstEvent = null, firstTextHere = null, usage = null, stop = null, text = "";
          const calls = [];
          try {
            for await (const event of model.stream({ system, messages, toolset, effort, maxOutputTokens: MAX_OUTPUT })) {
              firstEvent ??= performance.now();
              if (event.type === "text_delta") { firstTextHere ??= performance.now(); firstText ??= firstTextHere; text += event.text; }
              else if (event.type === "tool_call") calls.push(event);
              else if (event.type === "usage") usage = event.usage;
              else if (event.type === "stop") stop = event;
            }
          } catch (failure) {
            error = { kind: failure.kind ?? "exception", message: String(failure.message).slice(0, 200) };
          }
          settle(spec, usage);
          const requestCost = usage ? dmUsageCost(spec, usage) : null;
          cost += requestCost ?? 0;
          const record = { type: "request", model: name, modelId: spec.modelId, effort, run, line: index + 1, step: step + 1,
            firstEventMs: firstEvent && Math.round(firstEvent - start), firstTextMs: firstTextHere && Math.round(firstTextHere - start),
            totalMs: Math.round(performance.now() - start), stop: stop?.reason ?? null, toolCalls: calls.map((c) => c.arguments),
            usage, costUsd: requestCost, error, spentUsd: Number(budget.spent.toFixed(6)) };
          requests.push(record);
          await write(record);
          reply += text;
          if (error || !stop) break;
          messages.push({ role: "assistant", text, toolCalls: calls.map(({ id, name: tool, arguments: a }) => ({ id, name: tool, arguments: a })), native: stop.native });
          if (stop.reason !== "tool_use" || !calls.length) break;
          messages.push({ role: "tool_results", results: calls.map(executeRoll) });
        }
        const lineRecord = { type: "line", model: name, modelId: spec.modelId, effort, run, line: index + 1,
          ttftMs: firstText && Math.round(firstText - lineStart), totalMs: Math.round(performance.now() - lineStart),
          requests: requests.length, rolls: requests.flatMap((r) => r.toolCalls),
          inputTokens: requests.reduce((s, r) => s + (r.usage?.inputTokens ?? 0), 0),
          outputTokens: requests.reduce((s, r) => s + (r.usage?.outputTokens ?? 0), 0),
          cacheReadTokens: requests.reduce((s, r) => s + (r.usage?.cacheReadTokens ?? 0), 0),
          cacheWriteTokens: requests.reduce((s, r) => s + (r.usage?.cacheWriteTokens ?? 0), 0),
          reasoningTokens: requests.reduce((s, r) => s + (r.usage?.reasoningTokens ?? 0), 0),
          costUsd: Number(cost.toFixed(6)), error: requests.find((r) => r.error)?.error ?? null, reply };
        summary.push(lineRecord);
        await write(lineRecord);
        console.log(`${name}/${effort} run ${run} line ${index + 1}: first word ${lineRecord.ttftMs ?? "–"} ms, ` +
          `turn ${lineRecord.totalMs} ms, ${lineRecord.requests} req, ${lineRecord.inputTokens} in ` +
          `(cache read ${lineRecord.cacheReadTokens}, write ${lineRecord.cacheWriteTokens}), ${lineRecord.outputTokens} out, ` +
          `$${lineRecord.costUsd.toFixed(4)}${lineRecord.error ? ` ERROR ${lineRecord.error.kind}: ${lineRecord.error.message}` : ""}` +
          ` · spent $${budget.spent.toFixed(4)} of $${budget.cap}`);
        if (budget.exhausted) break outer;
      }
    }
  }
}

const median = (values) => {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
console.log("\nmodel/effort      lines  med first word  med turn  med cost/turn  run1 cost  run2 cost  cache read run2");
for (const effort of args.efforts) for (const name of args.models) {
  const rows = summary.filter((r) => r.model === name && r.effort === effort);
  if (!rows.length) continue;
  const runCost = (run) => rows.filter((r) => r.run === run).reduce((s, r) => s + r.costUsd, 0);
  const read2 = rows.filter((r) => r.run === 2).reduce((s, r) => s + r.cacheReadTokens, 0);
  const in2 = rows.filter((r) => r.run === 2).reduce((s, r) => s + r.inputTokens, 0);
  console.log(`${`${name}/${effort}`.padEnd(17)} ${String(rows.length).padStart(5)}  ${String(median(rows.map((r) => r.ttftMs)) ?? "–").padStart(14)}  ` +
    `${String(median(rows.map((r) => r.totalMs))).padStart(8)}  ${("$" + (median(rows.map((r) => r.costUsd)) ?? 0).toFixed(4)).padStart(13)}  ` +
    `${("$" + runCost(1).toFixed(4)).padStart(9)}  ${("$" + runCost(2).toFixed(4)).padStart(9)}  ${in2 ? `${Math.round(100 * read2 / in2)}%` : "–"}`);
}
await write({ type: "end", finishedAt: new Date().toISOString(), spentUsd: budget.spent, budgetReached: budget.exhausted });
console.log(`\nTotal spent: $${budget.spent.toFixed(4)} of $${budget.cap}${budget.exhausted ? " (stopped at the budget)" : ""}`);
console.log(`Details: ${outFile}`);
