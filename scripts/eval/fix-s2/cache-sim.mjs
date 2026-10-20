// Fix run A2: what a turn costs at high on Opus 5.5 under the old and the new cache layout, over every turn of
// the synthetic long campaign (long-campaign.mjs) — no model is called. Each turn's real request is built by the
// app's own code (buildDmLoopContext → anthropicRequestBody, the same bytes the adapter would send), its blocks
// are measured with the app's token estimate, and the provider's prompt cache is simulated by its documented
// rules (docs/MODELS.md): a breakpoint writes the prefix up to it; a request reads the longest prefix that ends at
// one of its breakpoints or within 20 blocks before one; a 5-minute entry lives 5 minutes from its last use, a
// one-hour entry an hour; uncached input is everything after the last breakpoint.
// The turn's own shape is modelled on session 2's medians (item 83): `--requests` per turn (2), each reply
// `--reply` tokens of thinking + text + calls (3000) and `--results` tokens of tool results (600), turns
// `--gap` seconds apart (150) and continuations 25 s apart. The live check of the same layout is replay-cost.mjs.
//   node scripts/eval/fix-s2/cache-sim.mjs --snapshots scripts/eval/out/long-campaign-a.json [--from 1 --to 45] [--requests 2]
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { registerHooks } from "node:module";
import { buildDmLoopContext, estimateTokens } from "../../../src/lib/gameplay/dm-loop/context.ts";
import { dmLoopToolset } from "../../../src/lib/gameplay/dm-loop/loop.ts";
import { dmModels } from "../../../src/lib/model-runtime/dm-models.ts";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only" ? { url: "data:text/javascript,export%20{}", shortCircuit: true } : nextResolve(specifier, context);
} });
const { anthropicRequestBody } = await import("../../../src/lib/server/dm/model/anthropic.ts");
hook.deregister();

const args = { snapshots: null, from: 1, to: Infinity, requests: 2, reply: 3000, results: 600, gap: 150, output: 3000, json: false };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = () => process.argv[++i];
  if (flag === "--snapshots") args.snapshots = value();
  else if (flag === "--from") args.from = Number(value());
  else if (flag === "--to") args.to = Number(value());
  else if (flag === "--requests") args.requests = Number(value());
  else if (flag === "--reply") args.reply = Number(value());
  else if (flag === "--results") args.results = Number(value());
  else if (flag === "--gap") args.gap = Number(value());
  else if (flag === "--output") args.output = Number(value());
  else if (flag === "--json") args.json = true;
  else throw new Error(`unknown argument ${flag}`);
}
if (!args.snapshots) throw new Error("--snapshots <file> is required");
const price = dmModels["anthropic/claude-opus-5-5"].price;
const file = JSON.parse(await readFile(args.snapshots, "utf8"));
const rows = file.snapshots.filter((row) => row.turnNo >= args.from && row.turnNo <= args.to);

/** The provider's view of a request: blocks in prefix order (tools, system, messages), each with its tokens,
 * the hash of the prefix up to it, and its breakpoint TTL when it carries one. */
function blocksOf(body) {
  const blocks = [];
  const add = (text, control) => blocks.push({ tokens: estimateTokens(text), text, ttl: control ? control.ttl ?? "5m" : null });
  add(JSON.stringify(body.tools ?? []), null);
  for (const block of body.system) add(block.text, block.cache_control);
  for (const message of body.messages) for (const part of message.content)
    add(part.type === "text" ? part.text : JSON.stringify({ ...part, cache_control: undefined }), part.cache_control);
  let hash = createHash("sha256");
  for (const block of blocks) { hash.update(block.text); block.prefix = hash.copy().digest("hex"); }
  return blocks;
}

function simulate(layout) {
  const cache = new Map(); // prefix hash → { expires, ttlMs }
  let clock = 0;
  const turns = [];
  for (const row of rows) {
    const { source, input } = row.payload;
    const context = buildDmLoopContext(source, input);
    // The old layout (before fix run A2): the living dossier had its own 5-minute breakpoint, no turn breakpoints.
    const system = layout === "before" ? context.system.map((block) => (block.breakpoint === false ? { ...block, breakpoint: undefined } : block)) : context.system;
    const messages = [{ role: "user", text: context.user }];
    const turn = { turnNo: row.turnNo, requests: [], costUsd: 0 };
    for (let request = 0; request < args.requests; request++) {
      const body = anthropicRequestBody("claude-opus-5-5", { system, messages, toolset: dmLoopToolset, effort: "high", maxOutputTokens: 32000, cacheTurn: layout === "after" });
      const blocks = blocksOf(body);
      const breakpoints = blocks.map((block, index) => (block.ttl ? index : -1)).filter((index) => index >= 0);
      for (const [key, entry] of cache) if (entry.expires < clock) cache.delete(key);
      // The longest cached prefix: at a breakpoint, or within 20 blocks before one.
      let hit = -1;
      for (const at of breakpoints) for (let back = at; back >= Math.max(0, at - 20); back--)
        if (cache.has(blocks[back].prefix)) { hit = Math.max(hit, back); break; }
      const tokensTo = (index) => blocks.slice(0, index + 1).reduce((sum, block) => sum + block.tokens, 0);
      const read = hit >= 0 ? tokensTo(hit) : 0;
      let write5m = 0, write1h = 0, last = hit;
      for (const at of breakpoints) {
        if (at <= hit) { const entry = cache.get(blocks[at].prefix); if (entry) entry.expires = clock + entry.ttlMs; continue; }
        const segment = tokensTo(at) - tokensTo(last);
        if (blocks[at].ttl === "1h") write1h += segment; else write5m += segment;
        cache.set(blocks[at].prefix, { ttlMs: blocks[at].ttl === "1h" ? 3_600_000 : 300_000, expires: clock + (blocks[at].ttl === "1h" ? 3_600_000 : 300_000) });
        last = at;
      }
      // A hit refreshes the entry it read.
      if (hit >= 0) { const entry = cache.get(blocks[hit].prefix); if (entry) entry.expires = clock + entry.ttlMs; }
      const total = tokensTo(blocks.length - 1);
      const uncached = total - read - write5m - write1h;
      const cost = (uncached * price.input + read * price.cacheRead + write5m * price.cacheWrite + write1h * price.cacheWrite1h + args.output * price.output) / 1_000_000;
      turn.requests.push({ total, read, write5m, write1h, uncached, cost });
      turn.costUsd += cost;
      // The reply and its tool results (the next request's new messages).
      const reply = "т".repeat(Math.round(args.reply * 2.4));
      messages.push({ role: "assistant", text: reply, toolCalls: [{ id: `c${row.turnNo}_${request}`, name: "roll", arguments: "{}" }], native: null });
      messages.push({ role: "tool_results", results: [{ callId: `c${row.turnNo}_${request}`, output: "р".repeat(Math.round(args.results * 2.4)), isError: false }] });
      clock += 25_000;
    }
    turns.push(turn);
    clock += args.gap * 1000;
  }
  return turns;
}

const median = (values) => { const sorted = [...values].sort((a, b) => a - b); const mid = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2; };
const summary = (turns, label) => {
  const all = turns.flatMap((turn) => turn.requests);
  const continuations = turns.flatMap((turn) => turn.requests.slice(1));
  const tail = turns.slice(-10);
  return { layout: label, turns: turns.length, costPerTurnMedian: Number(median(turns.map((t) => t.costUsd)).toFixed(4)),
    costPerTurnLast10: Number((tail.reduce((s, t) => s + t.costUsd, 0) / tail.length).toFixed(4)),
    inputPerRequestLast10: Math.round(tail.flatMap((t) => t.requests).reduce((s, r) => s + r.total, 0) / tail.flatMap((t) => t.requests).length),
    cacheReadShare: Number((all.reduce((s, r) => s + r.read, 0) / all.reduce((s, r) => s + r.total, 0)).toFixed(3)),
    uncachedPerFirstRequestMedian: Math.round(median(turns.map((t) => t.requests[0].uncached))),
    uncachedPerContinuationMedian: continuations.length ? Math.round(median(continuations.map((r) => r.uncached))) : null,
    writesPerTurnMedian: Math.round(median(turns.map((t) => t.requests.reduce((s, r) => s + r.write5m + r.write1h, 0)))) };
};
const before = simulate("before");
const after = simulate("after");
const result = { snapshots: args.snapshots, turns: `${rows[0]?.turnNo}–${rows.at(-1)?.turnNo}`, model: "claude-opus-5-5 at high", shape: { requests: args.requests, reply: args.reply, results: args.results, output: args.output, gapSeconds: args.gap },
  before: summary(before, "before (polish 2 layout)"), after: summary(after, "after (fix run A2)") };
if (args.json) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`Cache simulation on ${args.snapshots}, turns ${result.turns}, ${result.model}; ${args.requests} request(s) a turn, reply ${args.reply} tok, results ${args.results} tok, output ${args.output} tok a request.`);
  console.table([result.before, result.after]);
}
