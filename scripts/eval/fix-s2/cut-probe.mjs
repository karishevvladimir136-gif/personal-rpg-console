// Fix run A1: the cut → continue path against the live provider, in a few cents — a short conversation whose
// second answer is cut by a small output cap (once during thinking, once during the text), then the app's own
// continuation (the adapter's completeBlocks + CUT_BY_CAP). Prints each request's stop and any provider error.
//   FIX_S2_STAGE=A node scripts/eval/fix-s2/cut-probe.mjs --budget-usd 0.6
import { registerHooks } from "node:module";
import { openRun } from "../real-replay/lib/ledger.mjs";
import { createBudget, guardedModel, MODELS } from "../real-replay/lib/models.mjs";
import { providerKey } from "../lib/keys.mjs";
import { CUT_BY_CAP, dmLoopToolset } from "../../../src/lib/gameplay/dm-loop/loop.ts";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only" ? { url: "data:text/javascript,export%20{}", shortCircuit: true } : nextResolve(specifier, context);
} });
await import("../../../src/lib/server/dm/model/anthropic.ts");
hook.deregister();

const budgetUsd = Number(process.argv[process.argv.indexOf("--budget-usd") + 1] || 0);
if (!(budgetUsd > 0)) throw new Error("--budget-usd N is required");
const apiKey = providerKey("ANTHROPIC_API_KEY");
if (!apiKey) throw new Error("ANTHROPIC_API_KEY is needed (.env.local)");
const run = `cut-probe-${new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-")}`;
const ledger = await openRun(run, budgetUsd, "fix run A1: the cut → continue path on the live provider (small caps)");
const budget = createBudget(ledger.budgetUsd);
const log = [];
const { model, settle } = guardedModel({ ...MODELS.opus }, budget, apiKey, log);
const system = [{ text: "You are the narrator of a short fantasy scene, in Russian. When the player attacks, call roll first (actorRef \"dm\", visibility \"private\"), then narrate.", cache: false }];

async function ask(messages, effort, maxOutputTokens) {
  const events = { text: "", calls: [], stop: null, usage: null, error: null };
  try {
    for await (const event of model.stream({ system, messages, toolset: dmLoopToolset, effort, maxOutputTokens })) {
      if (event.type === "text_delta") events.text += event.text;
      else if (event.type === "tool_call") events.calls.push(event);
      else if (event.type === "usage") events.usage = event.usage;
      else if (event.type === "stop") events.stop = event;
    }
  } catch (error) { events.error = `${error.kind ?? "error"}: ${String(error.message).slice(0, 400)}`; }
  if (events.usage) settle(((events.usage.inputTokens * 4) + (events.usage.outputTokens * 20)) / 1_000_000);
  return events;
}
const results = [];
try {
  for (const [label, cap] of [["cut during thinking", 300], ["cut during the text", 1600]]) {
    const messages = [{ role: "user", text: "Бью стражника посохом. Опиши подробно, в шести длинных абзацах, весь бой и площадь вокруг." }];
    const first = await ask(messages, "low", 4000);
    if (first.error || !first.calls.length) { results.push({ label, step: 1, error: first.error, stop: first.stop?.reason, calls: first.calls.length }); continue; }
    messages.push({ role: "assistant", text: first.text, toolCalls: first.calls.map((c) => ({ id: c.id, name: c.name, arguments: c.arguments })), native: first.stop.native });
    messages.push({ role: "tool_results", results: first.calls.map((c) => ({ callId: c.id, output: JSON.stringify({ ok: true, total: 14, summary: "The DM rolls 1d20: 14" }), isError: false })) });
    const second = await ask(messages, "high", cap);
    const kinds = (second.stop?.native?.items ?? []).map((item) => `${item.type}${item.type === "text" ? `(${item.text.length})` : ""}`);
    results.push({ label, step: 2, stop: second.stop?.reason, textChars: second.text.length, sentBack: kinds, error: second.error });
    if (second.stop?.reason !== "max_tokens") continue;
    if (second.text.trim() || second.calls.length) messages.push({ role: "assistant", text: second.text, toolCalls: [], native: second.stop.native });
    messages.push({ role: "user", text: CUT_BY_CAP });
    const third = await ask(messages, "medium", 3000);
    results.push({ label, step: 3, stop: third.stop?.reason, textChars: third.text.length, error: third.error });
  }
} finally {
  await ledger.settle(budget.spentUsd, `scripts/eval/fix-s2/cut-probe.mjs (${run})`);
}
console.log(JSON.stringify({ run, spentUsd: Number(budget.spentUsd.toFixed(4)), results, transport: log }, null, 2));
