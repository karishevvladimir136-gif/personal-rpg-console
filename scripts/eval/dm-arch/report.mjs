// The bake-off's tables from the records in docs/runs/dmarch-*.jsonl:
// per variant on the scene turns (speed, cost, projected session cost, records
// correctness, craft checks), the reference run over all its turns, the
// continuity runs, and the split's own numbers.
//   node scripts/eval/dm-arch/report.mjs [--md]
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { RUNS_DIR } from "./lib/harness.mjs";
import { VARIANTS, SCENES } from "./lib/variants.mjs";

const SESSION_TURNS = 41;
const CATEGORIES = ["items", "money", "debts_promises", "people", "places", "time"];

async function load() {
  const files = (await readdir(RUNS_DIR)).filter((file) => /^dmarch-.*\.jsonl$/.test(file) && !/-dry|-smoke/.test(file)).sort();
  const records = [];
  for (const file of files)
    for (const line of (await readFile(join(RUNS_DIR, file), "utf8")).split("\n")) {
      if (!line.trim()) continue;
      records.push({ ...JSON.parse(line), file });
    }
  return records;
}

const median = (values) => { const sorted = values.filter((v) => v != null && Number.isFinite(v)).sort((a, b) => a - b); if (!sorted.length) return null; const mid = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2; };
const mean = (values) => { const list = values.filter((v) => v != null && Number.isFinite(v)); return list.length ? list.reduce((a, b) => a + b, 0) / list.length : null; };
const sec = (ms) => (ms == null ? "–" : `${(ms / 1000).toFixed(1)} s`);
const usd = (value, digits = 2) => (value == null ? "–" : `$${value.toFixed(digits)}`);
const pct = (value) => (value == null ? "–" : `${Math.round(value * 100)}%`);

function judgeTotals(judgements) {
  const sum = { narrated: 0, recorded: 0, missed: 0, wrong: 0, invented: 0, turns: 0, poor: 0, fair: 0, good: 0 };
  for (const j of judgements) {
    if (!j.result) continue;
    sum.turns++;
    sum.invented += j.result.invented;
    sum[j.result.verdict]++;
    for (const name of CATEGORIES) for (const key of ["narrated", "recorded", "missed", "wrong"]) sum[key] += j.result.categories[name][key];
  }
  return sum;
}

function rows(turns, judgements, label) {
  const committed = turns.filter((t) => t.outcome === "committed");
  const byTurn = new Map(judgements.map((j) => [j.operationId, j]));
  const judged = committed.map((t) => byTurn.get(t.operationId)).filter(Boolean);
  const jt = judgeTotals(judged);
  const writerCost = mean(committed.map((t) => t.phases?.writer?.costUsd ?? t.costUsd));
  const bookkeeperCost = mean(committed.map((t) => t.phases?.bookkeeper?.costUsd ?? 0));
  const cost = mean(committed.map((t) => t.costUsd));
  const timeChecks = committed.flatMap((t) => (t.checks ?? []).filter((c) => c.kind === "timeWordsMatchClock"));
  const nat = (field) => mean(committed.map((t) => t.naturalness?.[field]));
  return {
    label, turns: committed.length, failed: turns.length - committed.length,
    firstWord: median(committed.map((t) => t.firstWordMs)), textDone: median(committed.map((t) => t.textDoneMs)), recordsDone: median(committed.map((t) => t.recordsDoneMs ?? t.durationMs)),
    requests: mean(committed.map((t) => t.requests)), calls: mean(committed.map((t) => t.effects.accepted.length + t.effects.rejected.length)),
    rejected: committed.reduce((s, t) => s + t.effects.rejected.length, 0),
    writerCost, bookkeeperCost, cost, session: cost == null ? null : cost * SESSION_TURNS,
    cacheShare: median(committed.map((t) => t.cacheReadShare)),
    words: mean(committed.map((t) => (t.narration ?? "").split(/\s+/).filter(Boolean).length)),
    outputTokens: mean(committed.map((t) => t.tokens.output)),
    judge: jt, timeWords: timeChecks.length ? `${timeChecks.filter((c) => c.pass).length}/${timeChecks.length}` : "–",
    leaks: committed.reduce((s, t) => s + t.leaks.length, 0), moments: committed.filter((t) => t.meta?.playerMoment).length,
    xhigh: committed.filter((t) => t.pin?.effort === "xhigh").length,
    ledgerMissing: committed.filter((t) => t.ledger && !t.ledger.found).length,
    unfinished: committed.filter((t) => (t.twoPass ?? []).some((e) => e.event === "bookkeeper_finished" && !e.finished)).length,
    naturalness: { latin: nat("latinShare"), kancelyarit: nat("kancelyaritPer1000"), variation: nat("sentenceLengthVariation") },
  };
}

function table(list) {
  const lines = [
    "| Variant | Turns | First word (median) | Text done | Records done | Requests | Tool calls | Rejected | Writer $/turn | Bookkeeper $/turn | Total $/turn | 41-turn session | Cache read | Words | Output tokens |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ];
  for (const r of list)
    lines.push(`| ${r.label} | ${r.turns}${r.failed ? ` (+${r.failed} failed)` : ""} | ${sec(r.firstWord)} | ${sec(r.textDone)} | ${sec(r.recordsDone)} | ${r.requests?.toFixed(1) ?? "–"} | ${r.calls?.toFixed(1) ?? "–"} | ${r.rejected} | ${usd(r.writerCost, 3)} | ${r.bookkeeperCost ? usd(r.bookkeeperCost, 3) : "–"} | ${usd(r.cost, 3)} | ${usd(r.session)} | ${pct(r.cacheShare)} | ${r.words?.toFixed(0) ?? "–"} | ${r.outputTokens?.toFixed(0) ?? "–"} |`);
  return lines.join("\n");
}

function judgeTable(list) {
  const lines = [
    "| Variant | Judged turns | Facts narrated | Recorded | Missed | Wrong | Invented | Verdicts good / fair / poor | Rejected calls | Time words | Leaks | «Твой момент» | xhigh turns | Ledger missing | Bookkeeper unfinished |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ];
  for (const r of list) {
    const j = r.judge;
    lines.push(`| ${r.label} | ${j.turns} | ${j.narrated} | ${j.recorded} | ${j.missed} | ${j.wrong} | ${j.invented} | ${j.good} / ${j.fair} / ${j.poor} | ${r.rejected} | ${r.timeWords} | ${r.leaks} | ${r.moments} | ${r.xhigh} | ${r.ledgerMissing} | ${r.unfinished} |`);
  }
  return lines.join("\n");
}

function naturalnessTable(list) {
  const lines = ["| Variant | Latin letters | Канцелярит per 1 000 words | Sentence-length variation |", "| --- | --- | --- | --- |"];
  for (const r of list) lines.push(`| ${r.label} | ${r.naturalness.latin == null ? "–" : `${(r.naturalness.latin * 100).toFixed(1)}%`} | ${r.naturalness.kancelyarit?.toFixed(2) ?? "–"} | ${r.naturalness.variation?.toFixed(2) ?? "–"} |`);
  return lines.join("\n");
}

const records = await load();
const turns = records.filter((r) => r.type === "turn");
const judgements = records.filter((r) => r.type === "judgement");
const out = [];
const sceneTurns = turns.filter((t) => t.scene && SCENES.includes(t.step));
// Per (step, variant) the latest scene turn: a reference turn or a branch.
const latestScene = new Map();
for (const t of sceneTurns) latestScene.set(`${t.step}:${t.variant}`, t);
const scenes = [...latestScene.values()];
out.push("## Scene turns (the same saved state per scene, one turn per variant)", "");
out.push(table(Object.keys(VARIANTS).map((id) => rows(scenes.filter((t) => t.variant === id), judgements, `${id} — ${VARIANTS[id].label}`))), "");
out.push("### Records correctness (judge: Claude Sonnet 5.5) and craft checks, scene turns", "");
out.push(judgeTable(Object.keys(VARIANTS).map((id) => rows(scenes.filter((t) => t.variant === id), judgements, id))), "");
out.push(naturalnessTable(Object.keys(VARIANTS).map((id) => rows(scenes.filter((t) => t.variant === id), judgements, id))), "");
const references = turns.filter((t) => /-reference-/.test(t.file));
if (references.length) {
  out.push("## Reference run (the whole replay)", "");
  const byRun = new Map();
  for (const t of references) (byRun.get(t.run) ?? byRun.set(t.run, []).get(t.run)).push(t);
  out.push(table([...byRun.entries()].map(([run, list]) => rows(list, judgements, `${list[0].variant} — ${run}`))), "");
  out.push(judgeTable([...byRun.entries()].map(([run, list]) => rows(list, judgements, `${list[0].variant} — ${run}`))), "");
  for (const [run, list] of byRun) {
    const depths = {};
    for (const t of list) if (t.pin?.effort) depths[t.pin.effort] = (depths[t.pin.effort] ?? 0) + 1;
    out.push(`Depth per turn in ${run}: ${Object.entries(depths).map(([k, v]) => `${k} ${v}`).join(", ")}.`, "");
  }
}
const continuity = turns.filter((t) => /-continuity-/.test(t.file));
if (continuity.length) {
  out.push("## Continuity runs (the first turns in sequence)", "");
  const byRun = new Map();
  for (const t of continuity) (byRun.get(t.run) ?? byRun.set(t.run, []).get(t.run)).push(t);
  out.push(table([...byRun.entries()].map(([run, list]) => rows(list, judgements, `${list[0].variant} — ${run}`))), "");
  out.push(judgeTable([...byRun.entries()].map(([run, list]) => rows(list, judgements, `${list[0].variant} — ${run}`))), "");
}
const splits = turns.filter((t) => t.runtime === "two-pass" && t.outcome === "committed");
if (splits.length) {
  out.push("## The split's own numbers (all two-pass turns)", "");
  for (const id of ["C", "D"]) {
    const list = splits.filter((t) => t.variant === id);
    if (!list.length) continue;
    const writerReq = mean(list.map((t) => t.phases.writer.requests));
    const bookReq = mean(list.map((t) => t.phases.bookkeeper.requests));
    const bookCalls = mean(list.map((t) => t.receipts.filter((r) => r.call.name !== "roll").length));
    const bookRejected = list.reduce((s, t) => s + t.receipts.filter((r) => r.call.name !== "roll" && !r.result.ok).length, 0);
    const ledgerChars = mean(list.map((t) => t.ledger?.text?.length ?? 0));
    out.push(`- **${id}**: ${list.length} turns; writer ${writerReq?.toFixed(1)} requests, bookkeeper ${bookReq?.toFixed(1)} requests and ${bookCalls?.toFixed(1)} calls per turn (${bookRejected} rejected in all); ledger ${ledgerChars?.toFixed(0)} characters on average, missing on ${list.filter((t) => !t.ledger?.found).length} turn(s); bookkeeper did not finish_turn on ${list.filter((t) => (t.twoPass ?? []).some((e) => e.event === "bookkeeper_finished" && !e.finished)).length}; text done median ${sec(median(list.map((t) => t.textDoneMs)))}, records done median ${sec(median(list.map((t) => t.recordsDoneMs)))}; writer output tokens ${mean(list.map((t) => t.phases.writer.outputTokens))?.toFixed(0)}, bookkeeper output tokens ${mean(list.map((t) => t.phases.bookkeeper.outputTokens))?.toFixed(0)}.`);
  }
  out.push("");
}
const spent = records.filter((r) => r.type === "end").reduce((s, r) => s + (r.spentUsd ?? 0), 0);
out.push(`Paid in the records: $${spent.toFixed(4)} over ${records.filter((r) => r.type === "end").length} run(s).`);
console.log(out.join("\n"));
