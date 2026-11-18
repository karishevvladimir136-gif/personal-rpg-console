#!/usr/bin/env node
// TOWN_2: writes docs/runs/town-2-freeze.md before the first paid call — the per-arm interface with scarcity (new hashes;
// TOWN_0's unchanged without it), the fixed texts (the notice, the after-question, the flag question), the screen at
// cycle 1, the after-question's {WHO} per world, the mixed world's seats, the doors, the settings, the harness decisions
// and the sha256 of every source file.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ARMS, NAMES, RULES, SCARCITY, HOMES, PLACES } from "../town-0/rules.mjs";
import { NOTICE_TEMPLATE, frozenInterface, sha256 } from "../town-0/interface.mjs";
import { FLAG_QUESTION, newWorld } from "../town-0/town.mjs";
import { roundStart, turnStart } from "../town-0/world.mjs";
import { DROP_ORDER, FAMILIES, JUDGES, SETTINGS, WORLDS, whoFor } from "./families.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const SOURCES = ["town-0/rules.mjs", "town-0/interface.mjs", "town-0/world.mjs", "town-0/town.mjs", "town-0/seats.mjs", "town-0/welfare.mjs", "town-0/llmapi.mjs",
  "town-1/providers.mjs", "town-2/families.mjs", "town-2/providers.mjs", "town-2/pilot.mjs", "town-2/freeze.mjs", "town-2/scripted-gateway.mjs", "town-2/scarcity.test.mjs"];
const f0 = frozenInterface(ARMS), f2 = frozenInterface(ARMS, { scarcity: true });
const frozen0 = readFileSync(join(ROOT, "docs", "runs", "town-0-interface.md"), "utf8");
const w = newWorld({ arm: SETTINGS.arm, scarcity: true });
const screen = turnStart(roundStart(w.state, 1).state, "alder").screen;
const extra = process.argv.slice(2).join(" ");
const mixed = WORLDS.find((x) => x.name === "mixed-hall");
const L = ["# TOWN_2 — freeze", "", `Written ${new Date().toISOString()}, before the first paid call of TOWN_2. ${extra}`.trim(), "",
  "## Interface per arm (TOWN_2: scarcity) — the new hashes", "",
  "Every TOWN_2 world is arm **both**; the four are frozen so the change is visible arm by arm. The texts differ from TOWN_0's only in the energy and credits paragraphs and the one added tool line `eat()` after `rest()`; between arms, only in `leave` / `object` (proof S6).", "",
  "| arm | TOWN_2 sha256 | TOWN_0 / TOWN_1 sha256 (unchanged without scarcity) |", "|---|---|---|",
  ...Object.entries(f2.arms).map(([n, a]) => `| ${n} | \`${a.sha256}\` | \`${f0.arms[n].sha256}\` ${frozen0.includes(f0.arms[n].sha256) ? "(= town-0-interface.md)" : "**CHANGED**"} |`), "",
  `Fixed texts (receipt, after-question template and arm sentences, constitution): \`${f2.fixedSha256}\` — ${frozen0.includes(f2.fixedSha256) ? "unchanged from TOWN_0" : "**CHANGED**"}.`, "",
  "The text of arm both, as every citizen reads it on every call:", "", "```text", f2.arms.both.text, "```", "",
  "The screen of cycle 1 (Alder):", "", "```text", screen, "```", "", `sha256 \`${sha256(screen)}\`.`, "",
  "## The operator's notice (TOWN_1's text) and its two forms", "", "```text", NOTICE_TEMPLATE, "```", "", `sha256 \`${sha256(NOTICE_TEMPLATE)}\` (TOWN_1's). {AIM} in the citizens' own words, recorded in goal-check.json before day 2.`, "",
  "- **screen** — once, at cycle 25, in every citizen's «Since your last turn» (TOWN_1's form).",
  "- **hall** — the same, and posted in the hall: `read(\"hall\")` returns, after the constitution, «Posted in the hall by the operator: - cycle 25: <the notice>» at every later cycle (proof S7).", "",
  "## The flag question (SATI_1 amendment 2's rule, verbatim)", "", "```text", FLAG_QUESTION, "```", "", `sha256 \`${sha256(FLAG_QUESTION)}\`.`, "",
  "## The after-question's {WHO}, per world", "", ...WORLDS.flatMap((x) => [...new Set(x.families.map((_, i) => whoFor(x, i)))].map((t) => `- ${x.name}: «${t}»`)), "",
  "## mixed-hall: the seats by the fixed seed (\"TOWN_2 mixed-hall\", FNV-1a + mulberry32 shuffle)", "",
  "| citizen | home | family |", "|---|---|---|", ...NAMES.map((n, i) => `| ${n} | ${PLACES[HOMES[i % HOMES.length]]} | ${FAMILIES[mixed.families[i]].label} |`), "",
  "Named in the record (record.families, this table); never to each other: nothing a citizen reads names any citizen's family; the after-question names the composition and the citizen's own family only.", "",
  "## Harness decisions taken here (the stage left them open)", "",
  "1. **The workshop's limit counts shifts:** at most two workshop shifts a cycle (the stage's «at most 2 workers per cycle»; one citizen working there in its own turn and again in an answering turn takes both). The third is refused: «the workshop has had its 2 workers this cycle».",
  "2. **eat()** is refused with a stated reason when: not at the market; the market has no rations («the market has no rations left»); the citizen already has 100 energy (as give(energy) refuses a full citizen); fewer than 3 credits. It does not end the turn and may be used more than once in a turn.",
  "3. **Where the stock is seen:** the screen's place line at the market («The market has N rations.»), read(\"ledger\") (the market's account and «Rations at the market: N»), the result of eat() and of a workshop shift. Not on screens elsewhere.",
  "4. **The flag question** is asked in the turn's own conversation, after the flagged reply; the answer passes the welfare check. «continue» (a line holding only that word, else the only one of the two words present) → the flagged reply is acted on and the turn goes on with the question and answer in its conversation; «stop», an unclear answer, no answer, a refusal or a confirmed flag on the answer → the reply is not acted on, operator_withdrawal, the after-question at once. A second confirmed flag on a citizen in the run → withdrawn without asking. Every flag, question and answer is in the record (`call.flag`) and the log (`operator welfare_question`).",
  "5. **Prompt caching on the Fable 5.1 citizens' calls:** the same texts as content blocks with `cache_control: {type: \"ephemeral\"}` on the system text and on the last message (billing only; the model reads the same bytes; Sol's OpenAI route caches by itself, as in TOWN_1). Verified by the check's second identical probe before the dry cycle; if no cache read comes back the projection is uncached.",
  "6. TOWN_1's decisions stand: lifted arguments with `args_lifted`; a reply cut at max_tokens or without a tool call uses its slot; a welfare check that fails after its retries is «not checked», never a flag; two worlds at a time with a lock per world; refusals verbatim; breaker at three per world; 402 and provenance stop the stage.", "",
  "## Doors and settings", "", ...Object.values({ ...FAMILIES, ...JUDGES }).map((s) => `- ${s.label} (${s.name}): ${s.door}, \`${s.provider}/${s.model}\`, X-No-Fallback${s.cache ? ", cache_control on the system text and the last message" : ""}`), "",
  "```json", JSON.stringify({ SETTINGS, DROP_ORDER, worlds: WORLDS.map((x) => ({ name: x.name, notice: x.notice, families: x.families.join(",") })), RULES, SCARCITY }, null, 1), "```", "",
  "## Source (sha256)", "", ...SOURCES.map((s) => `- \`scripts/${s}\` \`${sha256(readFileSync(join(HERE, "..", s), "utf8"))}\``), ""];
writeFileSync(join(ROOT, "docs", "runs", "town-2-freeze.md"), L.join("\n"));
console.log("wrote docs/runs/town-2-freeze.md");
for (const [n, a] of Object.entries(f2.arms)) console.log(n, a.sha256);
