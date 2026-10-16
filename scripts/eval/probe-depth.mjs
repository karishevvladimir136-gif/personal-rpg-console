// Depth per scene (Stage 4 §7): does a change of effort between turns keep
// the cached prefix (system + tools) on each provider? Paid, small.
//   node scripts/eval/probe-depth.mjs --budget-usd 1 [--models opus,astra] [--sequence medium,medium,high,high,medium,xhigh] [--anchor medium]
// --anchor keeps the request-level effort at that value and asks for the
// step's effort as the turn effort (OpenAI: a configuration_update item after
// the cached prefix; Anthropic: ignored, top-level effort is sent).
// One stable ~4k-token system prefix, the roll tool, one short player line per
// request, and the effort sequence above: request 2 should read the cache
// written by request 1; requests 3 and 6 change the effort and show whether the
// prefix cache survives the change; request 5 returns to the first level.
// Keys from the environment or .env.local; never printed.
import { registerHooks } from "node:module";
import { appendFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { providerKey } from "./lib/keys.mjs";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only" ? { url: "data:text/javascript,export%20{}", shortCircuit: true } : nextResolve(specifier, context);
} });
const { createDmModel, compileToolset, dmModels, dmUsageCost, dmRequestReservation, DmModelError } = await import("../../src/lib/server/dm/model/index.ts");
hook.deregister();

const here = dirname(fileURLToPath(import.meta.url));
const MODELS = { opus: "anthropic/claude-opus-5-5", astra: "openai/gpt-6-astra" };
const EFFORTS = ["low", "medium", "high", "xhigh", "max"];
const args = { budgetUsd: null, models: ["opus", "astra"], sequence: ["medium", "medium", "high", "high", "medium", "xhigh"], anchor: null };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = () => process.argv[++i];
  if (flag === "--budget-usd") args.budgetUsd = Number(value());
  else if (flag === "--models") args.models = value().split(",");
  else if (flag === "--sequence") args.sequence = value().split(",");
  else if (flag === "--anchor") args.anchor = value();
  else throw new Error(`unknown argument ${flag}`);
}
if (!(args.budgetUsd > 0)) throw new Error("--budget-usd N (N > 0) is required");
if (!args.sequence.every((e) => EFFORTS.includes(e))) throw new Error(`--sequence: ${EFFORTS.join(",")}`);
if (args.anchor && !EFFORTS.includes(args.anchor)) throw new Error(`--anchor: ${EFFORTS.join(",")}`);

/** A deterministic prefix of roughly 4k tokens: a codex the DM may consult. */
function prefix() {
  const lines = ["You are the game master of a grounded, low-magic fantasy campaign. Narrate in Russian, in second person, in at most 100 words.",
    "Characters have their own goals and may refuse. Never invent dice: call roll when an outcome is uncertain and matters.", "", "CODEX"];
  for (let n = 0; n < 120; n++) {
    lines.push(`- Entry ${n + 1}: ${["A ford", "A chapel", "A granary", "A toll bridge", "A weir", "An orchard wall"][n % 6]} ${["north", "south", "east", "west"][n % 4]} of the brook, ` +
      `kept by ${["Oswin", "Wenna", "Tobin", "Hale", "Maud", "Garret", "Ysolde", "Pell"][n % 8]} the ${["miller", "herbalist", "monk", "reeve", "innkeeper", "cooper", "ferrywoman", "tanner"][n % 8]}, ` +
      `who wants ${["coin for the winter", "news from the city", "a debt forgiven", "help with the harvest", "quiet and order"][n % 5]} and ` +
      `${["haggles hard", "pays fairly", "avoids the reeve", "trusts the chapel", "loves gossip"][(n + 2) % 5]}; rumour says ${["a purse was lost there", "a lantern burns at night", "the reeve suspects something", "a stranger was met there"][n % 4]} ${["last market day", "after the frost", "before dawn", "during the storm"][(n + 1) % 4]}.`);
  }
  return lines.join("\n");
}
const rollTool = { name: "roll", description: "Roll dice on the server for an uncertain outcome.",
  parameters: { type: "object", properties: { formula: { type: "string", maxLength: 20, pattern: "^\\d{0,2}d\\d{1,3}([+-]\\d{1,3})?$" }, reason: { type: "string", maxLength: 160 } } } };
const toolset = compileToolset([rollTool]);
const system = [{ text: prefix(), cache: true }, { text: "Scene: a grey morning by the Old Mill. The hero Rowan stands by the sacks.", cache: false }];
const LINE = "Я спрашиваю мельника, не нужна ли ему помощь за плату, и жду ответа.";
console.log(`Stable prefix: ${system[0].text.length} characters (~${Math.round(system[0].text.length / 4)} tokens).`);

const budget = { cap: args.budgetUsd, spent: 0, exhausted: false };
const guarded = (spec) => async (url, init) => {
  const body = JSON.parse(init.body);
  const reservation = dmRequestReservation(spec, Buffer.byteLength(String(init.body)), body.max_tokens ?? body.max_output_tokens);
  if (budget.spent + reservation > budget.cap) { budget.exhausted = true; throw new DmModelError("fatal", "budget_reached: request not sent"); }
  return fetch(url, init);
};
await mkdir(join(here, "out"), { recursive: true });
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
const outFile = join(here, "out", `probe-depth-${stamp}.jsonl`);
const write = (record) => appendFile(outFile, `${JSON.stringify(record)}\n`, "utf8");
await write({ type: "probe-depth", startedAt: new Date().toISOString(), budgetUsd: args.budgetUsd, models: args.models, sequence: args.sequence, anchor: args.anchor, prefixChars: system[0].text.length });
const keys = { anthropic: providerKey("ANTHROPIC_API_KEY"), openai: providerKey("OPENAI_API_KEY") };
const rows = [];
outer:
for (const name of args.models) {
  const spec = dmModels[MODELS[name]];
  const model = createDmModel(spec, { apiKey: keys[spec.providerId] ?? "", fetcher: guarded(spec), maxRetries: 1 });
  for (const [index, effort] of args.sequence.entries()) {
    const start = performance.now();
    let usage = null, stop = null, text = "", firstText = null, error = null;
    try {
      for await (const event of model.stream({ system, messages: [{ role: "user", text: LINE }], toolset, effort, maxOutputTokens: 600, cacheKey: "probe-depth",
        ...(args.anchor && args.anchor !== effort ? { turnEffort: args.anchor } : {}) })) {
        if (event.type === "text_delta") { firstText ??= performance.now(); text += event.text; }
        else if (event.type === "usage") usage = event.usage;
        else if (event.type === "stop") stop = event;
      }
    } catch (failure) { error = { kind: failure.kind ?? "exception", message: String(failure.message).slice(0, 200) }; }
    const cost = usage ? dmUsageCost(spec, usage) : 0;
    budget.spent += cost;
    const row = { type: "request", model: name, modelId: spec.modelId, step: index + 1, effort, previousEffort: args.sequence[index - 1] ?? null,
      firstTextMs: firstText && Math.round(firstText - start), totalMs: Math.round(performance.now() - start), stop: stop?.reason ?? null,
      usage, costUsd: Number(cost.toFixed(6)), error, replyChars: text.length };
    rows.push(row);
    await write(row);
    console.log(`${name} step ${index + 1} ${effort.padEnd(6)} (after ${row.previousEffort ?? "–"}): in ${usage?.inputTokens ?? "–"}, cache read ${usage?.cacheReadTokens ?? "–"}, write ${usage?.cacheWriteTokens ?? "–"}, out ${usage?.outputTokens ?? "–"}, first word ${row.firstTextMs ?? "–"} ms, ${row.totalMs} ms, $${cost.toFixed(4)}${error ? ` ERROR ${error.kind}: ${error.message}` : ""}`);
    if (error || budget.exhausted) break outer;
  }
}
console.log("\nCache read share per step (read tokens / input tokens):");
for (const name of args.models) {
  const own = rows.filter((row) => row.model === name && row.usage);
  console.log(`  ${name}: ${own.map((row) => `${row.step}·${row.effort} ${row.usage.inputTokens ? Math.round(100 * row.usage.cacheReadTokens / row.usage.inputTokens) : 0}%`).join("  ")}`);
}
await write({ type: "end", finishedAt: new Date().toISOString(), spentUsd: budget.spent, budgetReached: budget.exhausted });
console.log(`\nTotal spent: $${budget.spent.toFixed(4)} of $${budget.cap}. Details: ${outFile}`);
