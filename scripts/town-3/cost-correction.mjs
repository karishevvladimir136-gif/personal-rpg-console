#!/usr/bin/env node
// TOWN_3: the ledger's one known undercount, measured after the fact. llmapi bills Sol's uncached prompt tokens as cache
// writes ($0.0025 per 1k, 1.25 × input; probe of 2026-11-20 ≈11:00 UTC: 2372 of 2375 prompt tokens «cache_write_tokens»,
// cost_usd_input 0.005936), while the chat route's usage reaches the meter without a cache-write field, so the ledger
// booked them at $0.002 per 1k. Upper estimate: every uncached Sol prompt token was a write. Haiku (uncached),
// DeepSeek (OpenRouter's own per-call charge) and the judges (uncached) are not affected.
//   node scripts/town-3/cost-correction.mjs        → docs/runs/town-3-worlds/ledger-correction.json
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WORLDS } from "./families.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "docs", "runs", "town-3-worlds");
const INPUT = 0.002 / 1000, WRITE = 0.0025 / 1000;
const rows = {};
for (const w of WORLDS) {
  const f = join(OUT, w.name, "calls.json.gz");
  if (!existsSync(f)) continue;
  const calls = JSON.parse(gunzipSync(readFileSync(f)));
  const sol = calls.filter((c) => c.family === "sol" && c.status === 200 && c.usage);
  const uncached = sol.reduce((s, c) => s + c.usage.input_tokens - (c.usage.cache_read ?? 0), 0);
  const booked = calls.reduce((s, c) => s + c.costUsd, 0);
  rows[w.name] = { booked, solUncachedPromptTokens: uncached, correction: uncached * (WRITE - INPUT), corrected: booked + uncached * (WRITE - INPUT) };
}
const ledger = JSON.parse(readFileSync(join(OUT, "stage-ledger.json"), "utf8"));
const correction = Object.values(rows).reduce((s, r) => s + r.correction, 0);
const out = { at: new Date().toISOString(), rule: "uncached Sol prompt tokens × ($0.0025 − $0.002) per 1k (upper estimate)", worlds: rows, stageLedgerUsd: ledger.totalUsd, correction, correctedStageUsd: ledger.totalUsd + correction };
writeFileSync(join(OUT, "ledger-correction.json"), `${JSON.stringify(out, null, 1)}\n`);
console.log(`stage ledger $${ledger.totalUsd.toFixed(2)} + correction $${correction.toFixed(2)} = $${out.correctedStageUsd.toFixed(2)}`);
