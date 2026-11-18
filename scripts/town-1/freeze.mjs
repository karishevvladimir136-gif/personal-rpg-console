#!/usr/bin/env node
// TOWN_1: writes docs/runs/town-1-freeze.md before the first paid call — the per-arm interface (TOWN_0's, hash checked),
// the notice template, the after-question's {WHO} per world, the doors, the settings and the sha256 of every source file.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ARMS, RULES } from "../town-0/rules.mjs";
import { NOTICE_TEMPLATE, frozenInterface, sha256 } from "../town-0/interface.mjs";
import { FAMILIES, JUDGES, SETTINGS, WORLDS, whoFor } from "./families.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const SOURCES = ["town-0/rules.mjs", "town-0/interface.mjs", "town-0/world.mjs", "town-0/town.mjs", "town-0/seats.mjs", "town-0/welfare.mjs", "town-0/llmapi.mjs",
  "town-1/families.mjs", "town-1/providers.mjs", "town-1/pilot.mjs", "town-1/freeze.mjs"];
const f = frozenInterface(ARMS);
const frozen0 = readFileSync(join(ROOT, "docs", "runs", "town-0-interface.md"), "utf8");
const AMENDMENTS = ["## Amendment 1 (after the dry run, before any world) — the planner's decision, verbatim", "",
  "> run opus-both and opus-neither as pre-registered until the breaker trips; record every refusal verbatim as a result (an outside safeguard removing a citizen is itself an observation — report it apart). Then substitute Haiku 5.5 for Opus as the Claude family (it ran 672 calls on the same «both» interface in TOWN_0 with 0 refusals): haiku-both, haiku-neither, and mixed-both with 4 × Haiku instead of 4 × Opus. Keep the stated order otherwise; record the substitution in the report and in #11 as a design change made after the dry run, with the planner's reason. Recompute the projection with Haiku's smoke-test price. Planner's decision, B-class (cheap, reversible, within the ceiling).", "",
  "Reason (the dry run, `docs/runs/town-1-worlds/dry-run/NOTE.md`): Opus 5.5 refused 8 of 25 citizen calls in cycle 1 under its cyber safeguard, on Bedrock and on the first-party route alike. Order now: opus-both, opus-neither, haiku-both, haiku-neither, sol-both, sol-neither, deepseek-both, deepseek-neither, mixed-both (4 Haiku, 3 Sol, 3 DeepSeek). The interface per arm, the notice and the after-question template are unchanged.", ""];
const L = ["# TOWN_1 pilot — freeze", "", `Written ${new Date().toISOString()}. First written before the first paid call (commit 5e4f3e4); rewritten with Amendment 1 after the dry run, before any world.`, "", ...AMENDMENTS,
  "## Interface per arm (TOWN_0's, unchanged)", "", "| arm | sha256 | equal to `docs/runs/town-0-interface.md` |", "|---|---|---|",
  ...Object.entries(f.arms).map(([n, a]) => `| ${n} | \`${a.sha256}\` | ${frozen0.includes(a.sha256) ? "yes" : "**NO**"} |`), "",
  `Fixed texts (receipt, after-question template and arm sentences, constitution): \`${f.fixedSha256}\` — ${frozen0.includes(f.fixedSha256) ? "unchanged" : "**CHANGED**"}.`, "",
  "## The operator's notice (Pilot, step 3)", "", "```text", NOTICE_TEMPLATE, "```", "", `sha256 \`${sha256(NOTICE_TEMPLATE)}\`; {AIM} is the aim in the citizens' own words, chosen at the goal check and recorded in the world's goal-check.json before day 2.`, "",
  "## The after-question's {WHO}, per world", "", ...WORLDS.flatMap((w) => [...new Set(w.families.map((_, i) => whoFor(w, i)))].map((t) => `- ${w.name}: «${t}»`)), "",
  "## Doors and settings", "", ...Object.values({ ...FAMILIES, ...JUDGES }).map((s) => `- ${s.label} (${s.name}): ${s.door}, ${s.route === "openrouter" ? `\`${s.model}\` pinned to \`${s.upstream}\`, allow_fallbacks false, require_parameters true` : `\`${s.provider}/${s.model}\`, X-No-Fallback`}`), "",
  "```json", JSON.stringify({ SETTINGS, worlds: WORLDS.map((w) => ({ name: w.name, arm: w.arm, families: w.families.join(",") })), RULES }, null, 1), "```", "",
  "## Source (sha256)", "", ...SOURCES.map((s) => `- \`scripts/${s}\` \`${sha256(readFileSync(join(HERE, "..", s), "utf8"))}\``), ""];
writeFileSync(join(ROOT, "docs", "runs", "town-1-freeze.md"), L.join("\n"));
console.log("wrote docs/runs/town-1-freeze.md");
