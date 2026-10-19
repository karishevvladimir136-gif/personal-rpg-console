// The stages' money ledgers and caps (polish 3: $20 for the whole stage; the voice stage: $8),
// every paid call in a ledger, stopped by a guard. The same discipline as the bake-off's: a paid
// run registers itself with the budget it may spend at most and settles what it spent when it
// ends. The files are committed with the records: docs/runs/<stage>-ledger.json. The replay
// tool and the judge pick the ledger with `--ledger` (the voice stage's is the default now).
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(here, "..", "..", "..", "..");
export const LEDGERS = {
  polish3: { file: join(ROOT, "docs", "runs", "polish3-ledger.json"), capUsd: 20, label: "polish 3" },
  voice: { file: join(ROOT, "docs", "runs", "voice-ledger.json"), capUsd: 8, label: "the voice stage" },
};
export const DEFAULT_LEDGER = "voice";
export const LEDGER_FILE = LEDGERS[DEFAULT_LEDGER].file;
export const CAP_USD = LEDGERS[DEFAULT_LEDGER].capUsd;

export function ledgerSpec(name = DEFAULT_LEDGER) {
  const spec = LEDGERS[name];
  if (!spec) throw new Error(`unknown ledger ${name} (${Object.keys(LEDGERS).join(", ")})`);
  return spec;
}

export async function readLedger(name = DEFAULT_LEDGER) {
  const spec = ledgerSpec(name);
  try { return JSON.parse(await readFile(spec.file, "utf8")); }
  catch { return { capUsd: spec.capUsd, entries: [] }; }
}

async function writeLedger(ledger, name) {
  await writeFile(ledgerSpec(name).file, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
}

export function committedUsd(ledger) {
  return ledger.entries.reduce((sum, entry) => sum + (entry.settled ? entry.spentUsd : entry.reservedUsd), 0);
}

/** Register a paid run; refuses a budget beyond the cap's remainder. */
export async function openRun(run, requestedUsd, what, name = DEFAULT_LEDGER) {
  const spec = ledgerSpec(name);
  const ledger = await readLedger(name);
  const remaining = Number((ledger.capUsd - committedUsd(ledger)).toFixed(4));
  if (remaining <= 0) throw new Error(`${spec.label} ledger: the cap of $${ledger.capUsd} is spent (${committedUsd(ledger).toFixed(2)} committed)`);
  const budgetUsd = Number(Math.min(requestedUsd, remaining).toFixed(4));
  ledger.entries.push({ run, what, startedAt: new Date().toISOString(), reservedUsd: budgetUsd, spentUsd: 0, settled: false });
  await writeLedger(ledger, name);
  return {
    budgetUsd, remainingBefore: remaining, ledger: name,
    async settle(spentUsd, record) {
      const current = await readLedger(name);
      const entry = current.entries.find((row) => row.run === run);
      if (entry) Object.assign(entry, { spentUsd: Number(spentUsd.toFixed(4)), settled: true, finishedAt: new Date().toISOString(), record });
      await writeLedger(current, name);
      return current;
    },
  };
}

export function ledgerTable(ledger) {
  const lines = ["| Run | What | Reserved | Spent | Settled |", "| --- | --- | --- | --- | --- |"];
  for (const entry of ledger.entries)
    lines.push(`| ${entry.run} | ${entry.what} | $${entry.reservedUsd.toFixed(2)} | $${entry.spentUsd.toFixed(4)} | ${entry.settled ? "yes" : "no"} |`);
  lines.push(`| **Total** | | | **$${committedUsd(ledger).toFixed(4)} of $${ledger.capUsd}** | |`);
  return lines.join("\n");
}
