// Polish 3 §6: where the first word's time goes. For every committed turn of the given loop-bench
// records: the first word from the player's send, split into the queue before the first request
// (the durable begin, the claim, the dossier and the memory retrieval — what the loop does before
// the model is asked), the request's time to its first token, and the uncached input of that
// request (tokens sent at the plain rate: the tail, «now», the turn's own messages) against the
// cached prefix. Medians per run, and the correlation of the first word with the uncached tokens.
//   node scripts/eval/first-word.mjs docs/runs/<run>.jsonl [more.jsonl …]
import { readFile } from "node:fs/promises";

function median(values) {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
const fmt = (v, d = 0) => (v === null || v === undefined || Number.isNaN(v) ? "–" : Number(v).toFixed(d));
function correlation(xs, ys) {
  const pairs = xs.map((x, i) => [x, ys[i]]).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (pairs.length < 3) return null;
  const mx = pairs.reduce((s, [x]) => s + x, 0) / pairs.length, my = pairs.reduce((s, [, y]) => s + y, 0) / pairs.length;
  const sxy = pairs.reduce((s, [x, y]) => s + (x - mx) * (y - my), 0);
  const sx = Math.sqrt(pairs.reduce((s, [x]) => s + (x - mx) ** 2, 0)), sy = Math.sqrt(pairs.reduce((s, [, y]) => s + (y - my) ** 2, 0));
  return sx && sy ? sxy / (sx * sy) : null;
}

export function firstWordRows(records) {
  return records.filter((r) => r.type === "turn" && r.outcome === "committed" && r.calls?.length).map((turn) => {
    // The request where the first word came: the first one with text; the loop's own firstWordMs when it recorded it.
    const first = turn.calls.find((call) => call.firstTextMs !== null && call.firstTextMs !== undefined) ?? turn.calls[0];
    const firstWordMs = turn.loopFirstWordMs ?? turn.firstWordMs ?? null;
    const requestIndex = turn.calls.indexOf(first);
    const earlier = turn.calls.slice(0, requestIndex).reduce((sum, call) => sum + (call.latencyMs ?? 0), 0);
    const ttft = first.firstTextMs ?? null;
    const queueMs = firstWordMs !== null && ttft !== null ? Math.max(0, firstWordMs - ttft - earlier) : null;
    const uncached = Math.max(0, (first.inputTokens ?? 0) - (first.cachedInputTokens ?? 0) - (first.cacheWriteTokens ?? 0));
    return { step: turn.step, firstWordMs, queueMs, earlierRequestsMs: earlier, ttftMs: ttft, requestIndex: requestIndex + 1,
      inputTokens: first.inputTokens ?? 0, cachedTokens: first.cachedInputTokens ?? 0, cacheWriteTokens: first.cacheWriteTokens ?? 0, uncachedTokens: uncached,
      outputTokens: first.outputTokens ?? 0, effort: first.effort ?? turn.effort ?? null, requestBytes: turn.requestBytes?.[0] ?? null };
  });
}

export function firstWordReport(label, rows) {
  const lines = [];
  lines.push(`${label}: ${rows.length} committed turns`);
  lines.push(`  first word, median ${fmt(median(rows.map((r) => r.firstWordMs)))} ms (p75 ${fmt(percentile(rows.map((r) => r.firstWordMs), 0.75))}, max ${fmt(Math.max(...rows.map((r) => r.firstWordMs ?? 0)))})`);
  lines.push(`  = queue before the first request ${fmt(median(rows.map((r) => r.queueMs)))} ms + time to the first token ${fmt(median(rows.map((r) => r.ttftMs)))} ms (medians; earlier requests of the turn ${fmt(median(rows.map((r) => r.earlierRequestsMs)))} ms)`);
  lines.push(`  the first request: input ${fmt(median(rows.map((r) => r.inputTokens)))} tokens, of which cached ${fmt(median(rows.map((r) => r.cachedTokens)))}, written to the cache ${fmt(median(rows.map((r) => r.cacheWriteTokens)))}, uncached ${fmt(median(rows.map((r) => r.uncachedTokens)))}`);
  lines.push(`  first word vs uncached tokens r=${fmt(correlation(rows.map((r) => r.uncachedTokens), rows.map((r) => r.firstWordMs)), 2)}; vs cached tokens r=${fmt(correlation(rows.map((r) => r.cachedTokens), rows.map((r) => r.firstWordMs)), 2)}; vs cache writes r=${fmt(correlation(rows.map((r) => r.cacheWriteTokens), rows.map((r) => r.firstWordMs)), 2)}; vs output tokens of the request r=${fmt(correlation(rows.map((r) => r.outputTokens), rows.map((r) => r.firstWordMs)), 2)}`);
  const deep = rows.filter((r) => r.effort === "xhigh"), base = rows.filter((r) => r.effort !== "xhigh");
  if (deep.length) lines.push(`  at xhigh (${deep.length}): first word ${fmt(median(deep.map((r) => r.firstWordMs)))} ms, ttft ${fmt(median(deep.map((r) => r.ttftMs)))} ms; at the base (${base.length}): ${fmt(median(base.map((r) => r.firstWordMs)))} ms, ttft ${fmt(median(base.map((r) => r.ttftMs)))} ms`);
  return lines.join("\n");
}
function percentile(values, p) {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop())) {
  for (const file of process.argv.slice(2)) {
    const records = (await readFile(file, "utf8")).split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
    const header = records.find((r) => r.type === "run");
    const rows = firstWordRows(records);
    console.log(firstWordReport(`${file.split(/[\\/]/).pop()} (${header?.model ?? "?"}${header?.bookkeeper ? ` + ${header.bookkeeper}` : ""}, ${header?.effort ?? "?"})`, rows));
    console.log("  per turn: " + rows.map((r) => `${r.step} ${fmt(r.firstWordMs)}=${fmt(r.queueMs)}+${fmt(r.ttftMs)}${r.requestIndex > 1 ? `(req ${r.requestIndex})` : ""}/${r.uncachedTokens}u`).join("  "));
    console.log("");
  }
}
