// The stages' money ledgers and caps (polish 3: $20 for the whole stage; the voice stage: $8; the fix-s2 run: $50),
// every paid call in a ledger, stopped by a guard. The same discipline as the bake-off's: a paid
// run registers itself with the budget it may spend at most and settles what it spent when it
// ends. The files are committed with the records: docs/runs/<stage>-ledger.json. The replay
// tool and the judge pick the ledger with `--ledger` (the fix-s2 run's is the default now).
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(here, "..", "..", "..", "..");
export const LEDGERS = {
  polish3: { file: join(ROOT, "docs", "runs", "polish3-ledger.json"), capUsd: 20, label: "polish 3" },
  voice: { file: join(ROOT, "docs", "runs", "voice-ledger.json"), capUsd: 8, label: "the voice stage" },
  // The fixes after session 2 (docs/stages/FIX_S2_RUN.md): $50 for the whole run, stages A and B within $30.
  fixs2: { file: join(ROOT, "docs", "runs", "fix-s2-ledger.json"), capUsd: 50, label: "the fix-s2 run", stageCaps: { AB: 30 },
    markdown: join(ROOT, "docs", "runs", "fix-s2-ledger.md") },
  // The merge after session 2 (docs/stages/MERGE_S2.md): the session 3 probes on the merged code, $15.
  merges2: { file: join(ROOT, "docs", "runs", "merge-s2-ledger.json"), capUsd: 15, label: "the merge after session 2",
    markdown: join(ROOT, "docs", "runs", "merge-s2-ledger.md") },
  // The fixes before session 3 (docs/stages/FIX_S3_PRE.md): part 1's probes and the two measurements of 2.6, $20.
  fixs3pre: { file: join(ROOT, "docs", "runs", "fix-s3-pre-ledger.json"), capUsd: 20, label: "the fixes before session 3",
    markdown: join(ROOT, "docs", "runs", "fix-s3-pre-ledger.md") },
  // The fixes from the owner's acceptance pass (docs/stages/FIX_S3_ACCEPT.md): $15, each block within its own share
  // (FIX_S2_STAGE=G|V|B|D|A names the block; I is the integrated check at the end).
  fixs3accept: { file: join(ROOT, "docs", "runs", "fix-s3-accept-ledger.json"), capUsd: 15, label: "the fixes from the owner's acceptance pass",
    stageCaps: { G: 0.5, V: 2, B: 2.5, D: 4, A: 3, I: 3 }, markdown: join(ROOT, "docs", "runs", "fix-s3-accept-ledger.md") },
  // The findings of 2026-10-22/23 (docs/stages/FINDINGS_S3.md): the DM's register before/after and one digest, $8.
  findingss3: { file: join(ROOT, "docs", "runs", "findings-s3-ledger.json"), capUsd: 8, label: "the findings of session 3",
    markdown: join(ROOT, "docs", "runs", "findings-s3-ledger.md") },
};
export const DEFAULT_LEDGER = "fixs2";
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
  const spec = ledgerSpec(name);
  await writeFile(spec.file, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
  if (spec.markdown) await writeFile(spec.markdown, `# ${spec.label} — the ledger of paid calls\n\nCap $${spec.capUsd}${spec.stageCaps ? ` (${Object.entries(spec.stageCaps).map(([stage, cap]) => `stages ${stage.split("").join("+")} within $${cap}`).join("; ")})` : ""}; every paid run registers here before its first request and settles when it ends (written by \`scripts/eval/real-replay/lib/ledger.mjs\`).\n\n${ledgerTable(ledger)}\n`, "utf8");
}

export function committedUsd(ledger) {
  return ledger.entries.reduce((sum, entry) => sum + (entry.settled ? entry.spentUsd : entry.reservedUsd), 0);
}

/** What a stage of a ledger with stage caps may still spend (the whole cap when the stage has none). */
function stageRemaining(spec, ledger, stage) {
  const cap = stage && spec.stageCaps?.[stage];
  if (!cap) return Infinity;
  const used = ledger.entries.filter((entry) => entry.stage === stage).reduce((sum, entry) => sum + (entry.settled ? entry.spentUsd : entry.reservedUsd), 0);
  return cap - used;
}

/** The stage a run belongs to (the fix-s2 run: FIX_S2_STAGE=A…F; A and B share their cap). */
export function currentStage(name = DEFAULT_LEDGER) {
  const stage = (process.env.FIX_S2_STAGE ?? "").trim().toUpperCase();
  // Only the fix-s2 run joins A and B under one cap; the later ledgers keep each letter (FIX_S3_ACCEPT: B is its own block).
  return name === "fixs2" && (stage === "A" || stage === "B") ? "AB" : stage || null;
}

/** Register a paid run; refuses a budget beyond the cap's remainder (and the stage's, when the ledger has stage caps). */
export async function openRun(run, requestedUsd, what, name = DEFAULT_LEDGER, stage = currentStage(name)) {
  const spec = ledgerSpec(name);
  const ledger = await readLedger(name);
  const remaining = Number(Math.min(ledger.capUsd - committedUsd(ledger), stageRemaining(spec, ledger, stage)).toFixed(4));
  if (remaining <= 0) throw new Error(`${spec.label} ledger: the cap is spent (${committedUsd(ledger).toFixed(2)} of $${ledger.capUsd} committed${stage ? `, stage ${stage}` : ""})`);
  const budgetUsd = Number(Math.min(requestedUsd, remaining).toFixed(4));
  ledger.entries.push({ run, what, ...(stage ? { stage } : {}), startedAt: new Date().toISOString(), reservedUsd: budgetUsd, spentUsd: 0, settled: false });
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
  const lines = ["| Run | Stage | What | Reserved | Spent | Settled |", "| --- | --- | --- | --- | --- | --- |"];
  for (const entry of ledger.entries)
    lines.push(`| ${entry.run} | ${entry.stage ?? ""} | ${entry.what} | $${entry.reservedUsd.toFixed(2)} | $${entry.spentUsd.toFixed(4)} | ${entry.settled ? "yes" : "no"} |`);
  lines.push(`| **Total** | | | **$${committedUsd(ledger).toFixed(4)} of $${ledger.capUsd}** | |`);
  return lines.join("\n");
}
