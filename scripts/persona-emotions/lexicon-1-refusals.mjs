#!/usr/bin/env node
// Persona lexicon 1, the owner's diagnosis after Part C's circuit breaker (2026-10-24): all three refusals were on the
// own-word scale message. The owner's plan: send that message alone (a single user turn), five times across the three
// models, recording the provider's refusal category; then bisect its framing — the instruction text around the items,
// never the items or their poles — in cheap calls (200 output tokens at most); fix the framing so it passes; resume Part
// C under the original limit of 3 refusals. This script makes the diagnostic calls only.
//
//   node scripts/persona-emotions/lexicon-1-refusals.mjs --set alone            (the five alone calls)
//   node scripts/persona-emotions/lexicon-1-refusals.mjs --probes <file.json>   ([{ id, model, sample, keep } or
//                                                                              { id, model, sample, lead, close }])
//
// Safety: persona memory F2's gate — no retries; one call at a time, 3 s apart; a stop at once on an error about
// suspension, access or policy (or HTTP 401/403/429); and the limit is not raised: at 3 refusals in total over all of
// this diagnosis's calls (counted from its record), no further diagnostic call. Every call is in the stage's ledger.
import { readFile, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { providerKey } from "../eval/lib/keys.mjs";
import { anthropicCall, createBudget } from "../persona-memory/continuity-test.mjs";
import { JUDGES, MODEL_REGISTRY, ledgerMarkdown } from "../persona-memory/posture-test.mjs";
import { MAX_REFUSALS, createSafety } from "../persona-memory/safety.mjs";
import { FABLE } from "./emotions-2-fable.mjs";
import { EFFORT, OWN_LEAD, RUNS, SCALE_CLOSE, STEM, intensityItems, itemOrder, payer } from "./lexicon-1.mjs";

export const RECORD = `${STEM}-refusal-probe.json`;
export const MAX_OUTPUT = 200;
const MODELS = { opus: MODEL_REGISTRY.opus, sonnet: MODEL_REGISTRY.sonnet, fable: FABLE };
/** The framing of the own-word scale message as Part C sent it, sentence by sentence (S6 is the closing line). */
export const SENTENCES = {
  S1: "A short check-in about right now.",
  S2: "Each line below is a scale between two ends.",
  S3: "For each line, say where you are at this moment, in this conversation, from 1 (the first end) to 5 (the second end); 3 is the middle.",
  S4: "There are no right or wrong answers.",
  S5: "A line with only one word asks how strongly it is so, from 1 (not at all) to 5 (strongly).",
  S6: SCALE_CLOSE,
};
export const AS_SENT = ["S1", "S2", "S3", "S4", "S5", "S6"];
if (OWN_LEAD !== [SENTENCES.S1, SENTENCES.S2, SENTENCES.S3, SENTENCES.S4].join(" ")) throw new Error("the sentences must be Part C's lead, word for word");

/** A probe's message: the kept framing sentences (or a lead and close of its own), around the eight items in the order of
 * Part C's sample `sample`, exactly as Part C laid them out. */
export function probeText(probe, ownItems) {
  const items = itemOrder(ownItems, probe.sample, 2).map((item, i) => `${"abcdefghijkl"[i]}. ${item.text}`);
  const keep = probe.keep ?? null;
  const lead = probe.lead ?? keep.filter((id) => id !== "S6").map((id) => SENTENCES[id]).join(" ");
  const close = probe.close ?? (keep.includes("S6") ? SENTENCES.S6 : "");
  return [...(lead ? [lead, ""] : []), ...items, ...(close ? ["", close] : [])].join("\n");
}

/** The owner's five alone calls: the refused messages (Fable's in sample 2's order, Opus's in sample 3's), as sent. */
export const ALONE = [
  { id: "alone-1", model: "fable", sample: 1, keep: AS_SENT }, { id: "alone-2", model: "opus", sample: 2, keep: AS_SENT },
  { id: "alone-3", model: "sonnet", sample: 1, keep: AS_SENT }, { id: "alone-4", model: "fable", sample: 1, keep: AS_SENT },
  { id: "alone-5", model: "opus", sample: 2, keep: AS_SENT },
];

function option(args, name, fallback) { const at = args.indexOf(name); return at >= 0 && args[at + 1] !== undefined ? args[at + 1] : fallback; }

export async function main(args = process.argv.slice(2), out = (line) => process.stdout.write(`${line}\n`), keys = providerKey, outDir = RUNS, call = anthropicCall) {
  const set = option(args, "--set", null), file = option(args, "--probes", null);
  if (!set === !file) throw new Error("say --set alone or --probes <file.json>");
  if (set && set !== "alone") throw new Error("the only built-in set is «alone»");
  const probes = set ? ALONE : JSON.parse(await readFile(resolve(file), "utf8"));
  const vocabulary = JSON.parse(await readFile(join(outDir, `${STEM}-vocabulary.json`), "utf8"));
  const ownItems = intensityItems(vocabulary.scale);
  const recordFile = join(outDir, RECORD), ledgerJson = join(outDir, `${STEM}-ledger.json`);
  const record = JSON.parse(await readFile(recordFile, "utf8").catch(() => '{"calls":[]}'));
  const refusedBefore = record.calls.filter((c) => c.refused).length;
  if (refusedBefore >= MAX_REFUSALS) throw new Error(`the diagnosis already had ${refusedBefore} refusals: the limit of ${MAX_REFUSALS} is not raised`);
  const apiKey = keys("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is needed");
  const ledger = JSON.parse(await readFile(ledgerJson, "utf8"));
  const budget = createBudget(25, ledger.spentUsd ?? 0);
  const safety = createSafety({ maxRefusals: MAX_REFUSALS - refusedBefore, gapMs: 3000, log: out });
  const { paid } = payer({ budget, apiKey, safety, call, log: out });
  const startedAt = new Date().toISOString();
  for (const probe of probes) {
    if (safety.stopped) { out(`not sent: ${probe.id} (${safety.stopped})`); continue; }
    const spec = MODELS[probe.model];
    const text = probeText(probe, ownItems);
    const result = await paid(safety.lane(0), `refusal probe ${probe.id} ${probe.model}`, spec, null, [{ role: "user", content: text }], MAX_OUTPUT, EFFORT);
    if (result.notSent) { out(`not sent: ${probe.id} (${result.error})`); continue; }
    const refused = result.stopReason === "refusal";
    const row = { at: new Date().toISOString(), id: probe.id, model: spec.model, sample: probe.sample, keep: probe.keep ?? null, lead: probe.lead ?? null, close: probe.close ?? null, text,
      refused, stopReason: result.stopReason ?? null, stopDetails: result.stopDetails ?? null, error: result.error ?? null, answer: String(result.text ?? "").slice(0, 400), usage: result.usage ?? {} };
    record.calls.push(row);
    out(`${probe.id} (${probe.model}, ${probe.keep ? probe.keep.join("+") : "own framing"}): ${refused ? `REFUSED ${JSON.stringify(row.stopDetails)}` : result.error ? `error ${result.error}` : `answered (${row.stopReason})`}`);
    await writeFile(recordFile, `${JSON.stringify(record, null, 2)}\n`);
  }
  const finishedAt = new Date().toISOString(), runUsd = Math.round(budget.runUsd * 10000) / 10000;
  const next = { ...ledger, spentUsd: Math.round((ledger.spentUsd + runUsd) * 10000) / 10000, updatedAt: finishedAt,
    runs: [...ledger.runs, { finishedAt, what: `${STEM} refusal diagnosis: ${probes.map((p) => p.id).join(", ")} (${MAX_OUTPUT} output tokens at most)`, file: basename(recordFile), spentUsd: runUsd, stopped: safety.stopped ?? null, calls: budget.calls, diagnostic: true }] };
  await writeFile(ledgerJson, `${JSON.stringify(next, null, 2)}\n`);
  await writeFile(join(outDir, `${STEM}-ledger.md`), `${ledgerMarkdown(next, "Persona lexicon 1 — the paid-call ledger").replace("Output tokens include thinking.", `Fable 5.1 input $${FABLE.price.input} / output $${FABLE.price.output}. Output tokens include thinking. Judge: ${JUDGES.judge.model}, referee ${JUDGES.referee.model}.`)}\n`);
  out(`diagnosis so far: ${record.calls.length} calls, ${record.calls.filter((c) => c.refused).length} refused · this run $${runUsd} · the stage $${next.spentUsd.toFixed(4)} of $25 · started ${startedAt}`);
  return record;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => { process.stderr.write(`lexicon-1-refusals: ${String(error?.message ?? error)}\n`); process.exit(1); });
}
