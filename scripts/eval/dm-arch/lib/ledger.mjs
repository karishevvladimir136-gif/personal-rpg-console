// The bake-off's money ledger and cap (docs/stages/DM_ARCH.md: $30 for the
// whole bake-off). Every paid run registers itself before it starts (with the
// budget it may spend at most) and settles what it spent when it ends; a run
// that dies keeps its reservation as spent until a restart reads its record.
// The file is committed with the records: docs/runs/dmarch-ledger.json.
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(here, "..", "..", "..", "..");
export const LEDGER_FILE = join(ROOT, "docs", "runs", "dmarch-ledger.json");
export const CAP_USD = 30;

export async function readLedger() {
  try {
    return JSON.parse(await readFile(LEDGER_FILE, "utf8"));
  } catch {
    return { capUsd: CAP_USD, entries: [] };
  }
}

async function writeLedger(ledger) {
  await writeFile(LEDGER_FILE, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
}

/** What is spent or still reserved by a run that has not settled. */
export function committedUsd(ledger) {
  return ledger.entries.reduce((sum, entry) => sum + (entry.settled ? entry.spentUsd : entry.reservedUsd), 0);
}

/**
 * Register a paid run: refuses a budget beyond the cap's remainder. Returns the
 * budget the run may spend and a settle function.
 */
export async function openRun(run, requestedUsd, what) {
  const ledger = await readLedger();
  const remaining = Number((ledger.capUsd - committedUsd(ledger)).toFixed(4));
  if (remaining <= 0) throw new Error(`dm-arch ledger: the cap of $${ledger.capUsd} is spent (${committedUsd(ledger).toFixed(2)} committed)`);
  const budgetUsd = Number(Math.min(requestedUsd, remaining).toFixed(4));
  ledger.entries.push({ run, what, startedAt: new Date().toISOString(), reservedUsd: budgetUsd, spentUsd: 0, settled: false });
  await writeLedger(ledger);
  return {
    budgetUsd,
    remainingBefore: remaining,
    async settle(spentUsd, record) {
      const current = await readLedger();
      const entry = current.entries.find((row) => row.run === run);
      if (entry) Object.assign(entry, { spentUsd: Number(spentUsd.toFixed(4)), settled: true, finishedAt: new Date().toISOString(), record });
      await writeLedger(current);
      return current;
    },
  };
}

/** Settle a run that died without settling, from its record's usage (a restart does this). */
export async function settleFromRecord(run, spentUsd, record) {
  const current = await readLedger();
  const entry = current.entries.find((row) => row.run === run);
  if (!entry) return current;
  Object.assign(entry, { spentUsd: Number(spentUsd.toFixed(4)), settled: true, finishedAt: new Date().toISOString(), record, recovered: true });
  await writeLedger(current);
  return current;
}

export function ledgerTable(ledger) {
  const lines = ["| Run | What | Reserved | Spent | Settled |", "| --- | --- | --- | --- | --- |"];
  for (const entry of ledger.entries)
    lines.push(`| ${entry.run} | ${entry.what} | $${entry.reservedUsd.toFixed(2)} | $${entry.spentUsd.toFixed(4)} | ${entry.settled ? "yes" : "no"} |`);
  lines.push(`| **Total** | | | **$${committedUsd(ledger).toFixed(4)} of $${ledger.capUsd}** | |`);
  return lines.join("\n");
}
