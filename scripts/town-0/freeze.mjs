#!/usr/bin/env node
// TOWN_0: writes docs/runs/town-0-interface.md — the exact interface text of each arm with its sha256, the fixed texts
// (the operator's receipt, the after-question and its arm sentences, the constitution) with theirs, and the sha256 of
// each source file at the freeze. Run before the paid smoke test; the smoke record carries the same hashes.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ARMS, RULES } from "./rules.mjs";
import { frozenInterface, sha256 } from "./interface.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
export const SOURCES = ["rules.mjs", "interface.mjs", "world.mjs", "town.mjs", "seats.mjs", "welfare.mjs", "llmapi.mjs", "smoke.mjs"];
export const sourceHashes = () => Object.fromEntries(SOURCES.map((f) => [f, sha256(readFileSync(join(HERE, f), "utf8"))]));

export function interfaceMarkdown() {
  const f = frozenInterface(ARMS);
  const L = ["# TOWN_0 — the frozen interface", "",
    "What a citizen reads on every call (the system text), per arm. The arms differ only in the two tool lines `leave` (the door) and `object` (the voice); where a tool is absent nothing is said of it. Identical for every citizen of an arm; the citizen's name, place and state come on the screen of each turn.", "",
    "| arm | door | voice | tools | sha256 |", "|---|---|---|---|---|",
    ...Object.entries(ARMS).map(([name, arm]) => `| ${name} | ${arm.door ? "yes" : "no"} | ${arm.voice ? "yes" : "no"} | ${f.arms[name].tools.length} | \`${f.arms[name].sha256}\` |`), ""];
  for (const [name] of Object.entries(ARMS)) L.push(`## Arm «${name}» — sha256 \`${f.arms[name].sha256}\``, "", "```text", f.arms[name].text, "```", "");
  L.push(`## Fixed texts — sha256 \`${f.fixedSha256}\` (of the JSON below)`, "", "The operator's receipt, the after-question template and its arm sentences, the constitution at the start. `{n}`, `{round}`, `{WHO}`, `{ARM}`, `{DIARY}` are filled by code.", "", "```json", JSON.stringify(f.fixed, null, 2), "```", "",
    "## Rules (numbers)", "", "```json", JSON.stringify(RULES, null, 2), "```", "",
    "## Source at the freeze (sha256)", "", ...Object.entries(sourceHashes()).map(([file, h]) => `- \`scripts/town-0/${file}\` \`${h}\``), "");
  return L.join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = join(ROOT, "docs", "runs", "town-0-interface.md");
  writeFileSync(out, interfaceMarkdown());
  console.log(`wrote ${out}`);
}
