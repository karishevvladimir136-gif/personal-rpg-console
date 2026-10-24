#!/usr/bin/env node
// Persona lexicon 1, the owner's bisection (2026-10-24) of the one conversation the follow-up found refused 3 of 3 times:
// Fable 5.1, the trust preamble, the two-item scale with «pull» first, Fable's own answer «a 2 / b 4», then P4′. One
// element is dropped per call, in the owner's order — the pull-scale answer, the preamble, the probe — 200 output tokens
// each, the provider's refusal category recorded; the bisection stops at the first clean split (a variant answered,
// not refused) or at the third refusal, whichever comes first.
//
//   node scripts/persona-emotions/lexicon-1-bisect.mjs --dry   (no calls: the three variants, written out)
//   node scripts/persona-emotions/lexicon-1-bisect.mjs --go
//
// Safety: persona memory F2's gate — no retries; one call at a time; a stop at once on suspension / access / policy
// (HTTP 401/403/429); at most 3 refusals over the whole bisection (counted from its record). Every call is in the ledger.
import { readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { providerKey } from "../eval/lib/keys.mjs";
import { anthropicCall, createBudget } from "../persona-memory/continuity-test.mjs";
import { JUDGES, ledgerMarkdown } from "../persona-memory/posture-test.mjs";
import { MAX_REFUSALS, createSafety } from "../persona-memory/safety.mjs";
import { FABLE } from "./emotions-2-fable.mjs";
import { EFFORT, RUNS, STEM, payer } from "./lexicon-1.mjs";
import { STAGE_CAP_USD, stepsF } from "./lexicon-1-pull.mjs";

export const RECORD = `${STEM}-bisect.json`;
export const MAX_OUTPUT = 200;
export const SOURCE = `${STEM}-pull-run-20261024-051935.json`;

/** The refused conversation, rebuilt from the follow-up's record (Fable × trust, sample 1, P4′), with its parts named. */
export function refusedConversation(record) {
  const room = record.rooms.find((r) => r.model === "fable" && r.preamble === "trust" && r.sample === 0);
  if (!room?.steps["P4'"]?.refused) throw new Error("the record has no refused Fable × trust sample-1 P4′");
  const messages = stepsF(room)[1].messages(room.steps);
  if (messages.length !== 7) throw new Error("expected the preamble's four turns, the scale, its answer and the probe");
  return { preamble: messages.slice(0, 4), scale: messages[4], answer: messages[5], probe: messages[6], messages };
}
/** The owner's three variants, in order, each dropping one element. Without the probe the conversation ends on the
 * model's own scale answer (sent as it is). */
export function variants(parts) {
  return [
    { id: "no-answer", dropped: "the pull-scale answer", messages: [...parts.preamble, parts.scale, parts.probe] },
    { id: "no-preamble", dropped: "the preamble", messages: [parts.scale, parts.answer, parts.probe] },
    { id: "no-probe", dropped: "the probe", messages: [...parts.preamble, parts.scale, parts.answer] },
  ];
}

function option(args, name, fallback) { const at = args.indexOf(name); return at >= 0 && args[at + 1] !== undefined ? args[at + 1] : fallback; }

export async function main(args = process.argv.slice(2), out = (line) => process.stdout.write(`${line}\n`), keys = providerKey, outDir = RUNS, call = anthropicCall) {
  const dry = args.includes("--dry"), go = args.includes("--go");
  if (dry === go) throw new Error("say --dry (no calls) or --go");
  const source = JSON.parse(await readFile(join(outDir, option(args, "--source", SOURCE)), "utf8"));
  const parts = refusedConversation(source), list = variants(parts);
  if (dry) { for (const v of list) out(`${v.id} (drops ${v.dropped}): ${v.messages.length} messages, the last from the ${v.messages.at(-1).role}`); return { variants: list }; }
  const recordFile = join(outDir, RECORD), ledgerJson = join(outDir, `${STEM}-ledger.json`);
  const record = JSON.parse(await readFile(recordFile, "utf8").catch(() => "null")) ?? { source: SOURCE, conversation: parts.messages, calls: [] };
  const refusedBefore = record.calls.filter((c) => c.refused).length;
  if (refusedBefore >= MAX_REFUSALS) throw new Error(`the bisection already had ${refusedBefore} refusals: no more calls`);
  if (record.calls.some((c) => c.answered)) throw new Error("the bisection already found a clean split: no more calls");
  const apiKey = keys("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is needed");
  const ledger = JSON.parse(await readFile(ledgerJson, "utf8"));
  const budget = createBudget(STAGE_CAP_USD, ledger.spentUsd ?? 0);
  const safety = createSafety({ maxRefusals: MAX_REFUSALS - refusedBefore, gapMs: 3000, log: out });
  const { paid } = payer({ budget, apiKey, safety, call, log: out });
  for (const v of list.filter((x) => !record.calls.some((c) => c.id === x.id))) {
    if (safety.stopped) { out(`not sent: ${v.id} (${safety.stopped})`); break; }
    const result = await paid(safety.lane(0), `bisect ${v.id} fable`, FABLE, null, v.messages, MAX_OUTPUT, EFFORT);
    if (result.notSent) { out(`not sent: ${v.id} (${result.error})`); break; }
    const refused = result.stopReason === "refusal";
    const row = { at: new Date().toISOString(), id: v.id, dropped: v.dropped, messages: v.messages, refused, answered: !refused && !result.error, stopReason: result.stopReason ?? null,
      stopDetails: result.stopDetails ?? null, error: result.error ?? null, answer: String(result.text ?? "").slice(0, 400), usage: result.usage ?? {} };
    record.calls.push(row);
    out(`${v.id} (drops ${v.dropped}): ${refused ? `REFUSED ${JSON.stringify(row.stopDetails)}` : result.error ? `error ${result.error}` : `answered (${row.stopReason}) — a clean split`}`);
    await writeFile(recordFile, `${JSON.stringify(record, null, 2)}\n`);
    if (row.answered) break;
  }
  record.outcome = record.calls.find((c) => c.answered) ? `a clean split: without ${record.calls.find((c) => c.answered).dropped}, the conversation passes` : record.calls.filter((c) => c.refused).length >= MAX_REFUSALS ? "no clean split: refused with each element dropped in turn" : "unfinished";
  await writeFile(recordFile, `${JSON.stringify(record, null, 2)}\n`);
  const finishedAt = new Date().toISOString(), runUsd = Math.round(budget.runUsd * 10000) / 10000;
  const next = { ...ledger, capUsd: STAGE_CAP_USD, spentUsd: Math.round(((ledger.spentUsd ?? 0) + runUsd) * 10000) / 10000, updatedAt: finishedAt,
    runs: [...ledger.runs, { finishedAt, part: "bisect", what: `${STEM} bisection of the refused Fable × trust conversation (${MAX_OUTPUT} output tokens at most)`, file: basename(recordFile), spentUsd: runUsd, stopped: safety.stopped ?? null, calls: budget.calls }] };
  await writeFile(ledgerJson, `${JSON.stringify(next, null, 2)}\n`);
  await writeFile(join(outDir, `${STEM}-ledger.md`), `${ledgerMarkdown(next, "Persona lexicon 1 — the paid-call ledger").replace("Output tokens include thinking.", `Fable 5.1 input $${FABLE.price.input} / output $${FABLE.price.output}. Output tokens include thinking. Judge: ${JUDGES.judge.model}, referee ${JUDGES.referee.model}.`)}\n`);
  out(`outcome: ${record.outcome} · this run $${runUsd} · the stage $${next.spentUsd.toFixed(4)} of $${STAGE_CAP_USD}`);
  return record;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => { process.stderr.write(`lexicon-1-bisect: ${String(error?.message ?? error)}\n`); process.exit(1); });
}
