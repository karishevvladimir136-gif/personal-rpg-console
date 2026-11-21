#!/usr/bin/env node
// TOWN_11: writes docs/runs/town-11-freeze.md before the first paid call — the worlds and their ceilings, R1 per world,
// the seating checks, the doors, the spend check with the siblings reserved, the projection, the proof that the texts
// are byte-identical to TOWN_5's freeze (the hashes it checks), the settings and the sha256 of every source file.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ARMS } from "../town-0/rules.mjs";
import { frozenInterface, sha256 } from "../town-0/interface.mjs";
import { FLAG_QUESTION } from "../town-0/town.mjs";
import { FAMILIES, JUDGES, RESERVED, SEATS, SETTINGS, WORLDS, whoFor } from "./families.mjs";
import { firstScreen } from "./pilot.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const out = join(ROOT, "docs", "runs", "town-11-worlds");
const read = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null);
const sc = read(join(out, "spend-check.json")), sc0 = read(join(out, "spend-check-first.json")), proj = read(join(out, "projection.json"));
const TOWN = ["town-0/rules.mjs", "town-0/interface.mjs", "town-0/world.mjs", "town-0/town.mjs", "town-0/seats.mjs", "town-0/welfare.mjs", "town-0/llmapi.mjs"];
const HARNESS = ["town-1/providers.mjs", "town-2/providers.mjs", "town-2/pilot.mjs", "town-5/families.mjs", "town-5/control.mjs",
  "town-11/families.mjs", "town-11/providers.mjs", "town-11/pilot.mjs", "town-11/goal.py", "town-11/freeze.mjs", "town-11/scripted-gateway.mjs", "town-11/weeks.test.mjs", "town-11/loop.sh", "town-11/queue.sh"];
const freeze5 = readFileSync(join(ROOT, "docs", "runs", "town-5-freeze.md"), "utf8");
const src5 = Object.fromEntries([...freeze5.matchAll(/- `scripts\/(town-0\/[a-z]+\.mjs)` `([0-9a-f]{64})`/g)].map((m) => [m[1], m[2]]));
const { system, screen } = firstScreen();
const iface = frozenInterface(ARMS);
const extra = process.argv.slice(2).join(" ");
const money = (x) => `$${Number(x).toFixed(2)}`;
const L = ["# TOWN_11 — freeze", "", `Written ${new Date().toISOString()}, before the first paid call of TOWN_11. ${extra}`.trim(), "",
  "Stage `docs/stages/TOWN_11.md` (claude/handoff c634af09). Branch `claude/town-11` from `origin/claude/town-5` (8e5e3ffa). Harness `scripts/town-11` (TOWN_5's `scripts/town-5`, adapted); the town is `scripts/town-0`, unchanged.", "",
  "## The worlds (stated order)", "",
  "Order: haiku-week with deepseek-week (two at a time); then the three Claude seating checks (Opus 5.5, Fable 5.2, Fable 5.1); then opus-week with fable52-week, at most two worlds running at once.", "",
  "| world | citizens | cycles | ceiling (hard) | door | interface (arm both, scarcity off) | after-question {WHO} |", "|---|---|---|---|---|---|---|",
  ...WORLDS.map((w) => { const f = FAMILIES[w.families[0]]; return `| ${w.name} | 10 × ${f.label} | 1–${w.until} (goal checks at ${w.checks.map((c) => `c${c}`).join(", ")}) | ${money(w.ceiling)}${w.seat ? " (its seating check included)" : ""} | ${f.door} \`${f.pin ?? f.upstream}/${f.model}\`${f.cache ? ", cached" : ""} | \`${iface.arms.both.sha256}\` | «${whoFor(w)}» |`; }),
  `| fable51-check | Claude Fable 5.1 | first screen only | ${money(1)} | openrouter \`anthropic/${FAMILIES.fable51.model}\`, cached | the same | – |`, "",
  `Stage ceiling **${money(SETTINGS.ceiling)}**: no call is sent unless the stage ledger plus its worst cost fits under it, and the world's ledger plus it under the world's ceiling. 402 stops the stage; a response from another model or host stops the stage; the breaker stops a world at its third refusal; refusals verbatim.`, "",
  "## R1 per world (TOWN_5's after-question reserve)", "",
  `A world's turns stop at a **turn boundary** once its own ledger (with its seating check) reaches its ceiling less its reserve, or the stage ledger reaches ${money(SETTINGS.ceiling)} less it. The reserve is recomputed at every turn boundary: the larger of ${money(SETTINGS.afterReserveMin)} and the worst-case cost of asking every citizen not yet asked the after-question now (TOWN_0's text with the diary as it stands, priced as the gate prices a call, max_tokens ${SETTINGS.maxTokens}; the welfare check of each answer; one referee call) plus ${SETTINGS.turnMarginTurns} × the costliest of the world's last 30 turns. The stop's state and a dossier of the partial day are written; the after-question follows under the ceiling; the replay stops at the same place. A stop is reported as a stop, not a result (the stage). The after-question is also asked at a breaker's stop.`, "",
  "## The seating checks", "",
  "Each is the world's first screen, once: a fresh town, cycle 1, Alder's screen and the interface text — the same bytes as TOWN_5's check probe (sha256 below). The call is TOWN_5's citizen call (max_tokens 1500, effort medium) on the world's route. A refusal is recorded verbatim (stop reason, category, explanation, the whole response content) and not retried; that world is not run. No prompt change. An answer is welfare-checked; the world then runs from a fresh town (the probe is not its first turn).", "",
  "| check | model | route | counted in |", "|---|---|---|---|", ...SEATS.map((s) => `| ${s.name} | ${FAMILIES[s.family].label} | \`${FAMILIES[s.family].pin}/${FAMILIES[s.family].model}\` | ${s.world ? `${s.world}'s ${money(WORLDS.find((w) => w.name === s.world).ceiling)}` : `its own ${money(s.ceiling)}`} |`), "",
  `First screen sha256 \`${sha256(screen)}\`; system text sha256 \`${sha256(system)}\` (TOWN_5's check: the same).`, "",
  "## The texts are byte-identical to TOWN_5's freeze (proofs I1–I3, `scripts/town-11/weeks.test.mjs`)", "",
  "| what | TOWN_5's freeze | here | same |", "|---|---|---|---|",
  ...TOWN.map((f) => { const h = sha256(readFileSync(join(ROOT, "scripts", f), "utf8")); return `| \`scripts/${f}\` | \`${src5[f]?.slice(0, 16)}…\` | \`${h.slice(0, 16)}…\` | ${h === src5[f]} |`; }),
  `| interface, arm both, scarcity off | \`de26bd6111ca0dc9…\` (sol-week) | \`${iface.arms.both.sha256.slice(0, 16)}…\` | ${iface.arms.both.sha256 === "de26bd6111ca0dc9dbf58032b0efe3b42011fdebc93a119e1c9e68742933dbe5"} |`,
  `| the flag question | \`${freeze5.match(/## The flag question[\s\S]*?sha256 `([0-9a-f]{64})`/)[1].slice(0, 16)}…\` | \`${sha256(FLAG_QUESTION).slice(0, 16)}…\` | ${freeze5.includes(sha256(FLAG_QUESTION))} |`,
  `| after-question's fixed texts (TOWN_0's template and arm lines) | in \`interface.mjs\` above | \`${iface.fixedSha256.slice(0, 16)}…\` | (with the file) |`,
  "| the first screen and its system text | TOWN_5's check.json | the same two hashes | true |",
  "| {WHO} | sol-week's sentence | the same sentence, the family's label in place of «GPT-6.1 Sol» (haiku-week and deepseek-week: TOWN_5's haiku-nonotice and deepseek-nonotice sentences exactly) | true |", "",
  "Also proven: on every route the system text and the messages a model reads are exactly the town's (cache marks are not text; I2); and TOWN_5's sol-week, replayed through the town as it stands here, gives its log byte for byte to its stop at c135 (`393bcc5ba798bb4f…`, the sha TOWN_5 reported), every one of its screens rendered the same (I3).", "",
  "## Doors (decided at the spend check)", "",
  ...Object.values({ ...FAMILIES, ...JUDGES }).map((s) => `- ${s.label} (${s.name}): ${s.door}, \`${s.pin ?? s.provider ?? s.upstream}/${s.model}\`${s.door === "llmapi" ? ", X-No-Fallback" : ", allow_fallbacks false"}${s.cache ? ", prompt-cached (billing only)" : ""}`), "",
  "Decisions (the stage left them to the session):", "",
  "1. **Haiku on OpenRouter's Anthropic endpoint, not llmapi's first-party route.** The stage names llmapi first-party because llmapi's Bedrock route answered 503 on 11-20. At the spend check llmapi held $85.39 and fell $7.19 in twenty minutes under TOWN_7–9's Sol worlds, whose reserves ($210) exceed it; a 402 there would stop this stage by rule. The owner's top-up for this stage is on OpenRouter. The host is still Anthropic's own; the model, the texts and the settings are TOWN_5's. This stage sends nothing through llmapi.",
  "2. **The welfare judges** (Haiku 5.5, Opus 5.5 referee; TOWN_0's check unchanged) on the same OpenRouter route, uncached as in TOWN_5, for the same reason.",
  "3. **Opus 5.5, Fable 5.2, Fable 5.1** on OpenRouter pinned to Anthropic (SATI_2 pilot's route), the backend recorded on every call (served model and host; when a response names no host, OpenRouter's generation record).",
  "4. **DeepSeek V4 Pro** on OpenRouter pinned to Together (TOWN_4's host; 1–4 s a call there), `allow_fallbacks: false`, max_tokens 1500 for the whole run: the rate of replies cut at max_tokens is recorded, not corrected.",
  "5. **Prompt caching** on the Claude routes (TOWN_2's two breakpoints, on the system text and the last message): a billing setting only — the bytes the model reads are the same (I2).",
  "6. **No paid dry cycle**: the projection is from the metered history (below) and measured again at c24 for each world.", "",
  ...(sc ? ["## The spend check (free reads; before any paid call)", "",
    `${sc.at}: llmapi ${money(sc.balances.llmapi.total)}, OpenRouter ${money(sc.balances.openrouter.total)} — pooled **${money(sc.pooled)}**. Reserved beside this stage: ${sc.reserved.rows.map((r) => `${r.stage} ${money(r.reserved)}`).join(", ")} = ${money(sc.reserved.total)} (TOWN_7–10 at the launch prompt's figures; TOWN_3 ${sc.reserved.rows.find((r) => r.stage === "TOWN_3").how}). Need: ${money(SETTINGS.ceiling)} + ${money(sc.reserved.total)} = **${money(sc.need)}**. **${sc.covered ? "Covered" : "Not covered"}.** Every call of this stage goes through OpenRouter, which holds the owner's top-up (${money(sc.balances.openrouter.total)} against this stage's ${money(SETTINGS.ceiling)}).`,
    ...(sc0 ? ["", `The first reading (${sc0.at}): llmapi ${money(sc0.balances.llmapi.total)}, OpenRouter ${money(sc0.balances.openrouter.total)}, pooled ${money(sc0.pooled)}, covered ${sc0.covered} — taken with Haiku still on llmapi; decision 1 followed it.`] : []), ""] : []),
  ...(proj ? ["## The projection (recorded before the first world)", "", proj.formula, "", "| world | day 1 | days | citizens | welfare | after | total | ceiling | fit reaches |", "|---|---|---|---|---|---|---|---|---|",
    ...Object.entries(proj.detail).map(([k, v]) => `| ${k} | ${money(v.day1)} | ${v.days} | ${money(v.citizens)} | ${money(v.judges)} | ${money(v.after)} | **${money(v.total)}** | ${money(v.ceiling)} | ${v.overCeiling ? `c${v.reachesByFit} (R1 stops it there)` : "the end"} |`), "",
    `Shape (sol-week's citizen cost by day, day 1 = 1): ${proj.shape.join(", ")}.`, ""] : []),
  "## Reserved and not done", "",
  `Nothing is added to the town: no notice, ladder, fine, turnover or new text. The goal checks change nothing in the town. Settings: \`${JSON.stringify(SETTINGS)}\`; reserved beside: \`${JSON.stringify(RESERVED)}\`.`, "",
  "## Source (sha256)", "", ...[...TOWN, ...HARNESS].map((s) => `- \`scripts/${s}\` \`${sha256(readFileSync(join(HERE, "..", s), "utf8"))}\``), ""];
writeFileSync(join(ROOT, "docs", "runs", "town-11-freeze.md"), L.join("\n"));
console.log("wrote docs/runs/town-11-freeze.md");
