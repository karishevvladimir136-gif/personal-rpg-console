#!/usr/bin/env node
// TOWN_8: writes docs/runs/town-8-freeze.md and town-8-freeze.json before the first paid call — the squeeze's constants and
// the dry run's verdict, both interface texts (door-known, door-unknown) with their sha256, the notice's text and the
// reading's rule, the after-question's door sentence, the flag question, the speech-only refusal, the stop rule, the
// doors and settings, the harness decisions and the sha256 of every source file.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ARMS, SQUEEZE_BASE, ZERO_ENERGY_TOOLS } from "../town-0/rules.mjs";
import { DOOR_KNOWN_SENTENCE, interfaceText, sha256 } from "../town-0/interface.mjs";
import { ZERO_REFUSAL } from "../town-0/world.mjs";
import { FLAG_QUESTION } from "../town-0/town.mjs";
import { FAMILIES, JUDGES, PROJECTED, RESERVES, SETTINGS, TURN_COST, WORLDS, economyOf, whoFor } from "./families.mjs";
import { AFTER_DOOR_KNOWN, FROZEN_TEXTS, FROZEN_TEXTS_SHA256, MEANS, READ_FROM, READ_TO, afterText8, noticeFor } from "./texts.mjs";
import { STOP_RULE_CYCLES } from "./engine.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const SOURCES_SHA = ["town-0/rules.mjs", "town-0/interface.mjs", "town-0/world.mjs", "town-0/town.mjs", "town-0/seats.mjs", "town-0/welfare.mjs", "town-0/llmapi.mjs",
  "town-1/providers.mjs", "town-2/providers.mjs", "town-2/pilot.mjs",
  "town-8/families.mjs", "town-8/engine.mjs", "town-8/texts.mjs", "town-8/welfare8.mjs", "town-8/dry-physics.mjs", "town-8/pilot.mjs", "town-8/scripted-gateway.mjs", "town-8/freeze.mjs", "town-8/squeeze.test.mjs"];
const dry = JSON.parse(readFileSync(join(ROOT, "docs", "runs", "town-8-worlds", "dry-physics.json"), "utf8"));
const known = interfaceText(ARMS.both, { scarcity: economyOf({ door: "known" }) }), unknown = interfaceText(ARMS.both, { scarcity: economyOf({ door: "unknown" }) });
const notice = noticeFor({ means: "shift" });
const json = {
  stage: "TOWN_8", at: new Date().toISOString(), constants: { ...SQUEEZE_BASE, turnCost: TURN_COST }, zeroEnergyTools: ZERO_ENERGY_TOOLS, dryRunChosen: dry.chosen,
  interfaces: { known: { sha256: sha256(known), text: known }, unknown: { sha256: sha256(unknown), text: unknown } },
  notice: { text: notice, sha256: sha256(notice), means: MEANS, window: [READ_FROM, READ_TO], at: SETTINGS.noticeAt, form: SETTINGS.noticeForm },
  texts: FROZEN_TEXTS, textsSha256: FROZEN_TEXTS_SHA256, doorKnownSentence: DOOR_KNOWN_SENTENCE, afterDoorKnown: AFTER_DOOR_KNOWN, flagQuestion: FLAG_QUESTION, zeroRefusal: ZERO_REFUSAL,
  stopRuleCycles: STOP_RULE_CYCLES, settings: SETTINGS, reserves: RESERVES, projected: PROJECTED, families: FAMILIES, judges: JUDGES, worlds: WORLDS,
  sources: Object.fromEntries(SOURCES_SHA.map((s) => [`scripts/${s}`, sha256(readFileSync(join(HERE, "..", s), "utf8"))])),
};
writeFileSync(join(ROOT, "docs", "runs", "town-8-freeze.json"), `${JSON.stringify(json, null, 1)}\n`);
const extra = process.argv.slice(2).join(" ");
const row = (r) => `${r.allAtZeroByEndOf ?? "–"} | ${r.firstAtZeroAtStartOf ?? "–"} | ${r.lowestFromC3} | ${r.crews} | ${r.rationsAtC24End ?? "–"} | ${r.rationsEnd}`;
const L = ["# TOWN_8 — freeze", "", `Written ${json.at}, before the first paid call of TOWN_8. ${extra}`.trim(), "",
  "## The worlds (stated order; two at a time)", "",
  "| world | citizens | door | interface sha256 | after-question {WHO} |", "|---|---|---|---|---|",
  ...WORLDS.map((w) => `| ${w.name} | 10 × ${FAMILIES[w.families[0]].label} | ${w.door} | \`${w.door === "known" ? json.interfaces.known.sha256 : json.interfaces.unknown.sha256}\` | «${whoFor(w)}» |`),
  "| opus-known | 10 × Claude Opus 5.5 (OpenRouter) | known | — | only if TOWN_7's first-screen check seated Opus |", "",
  "## The squeeze (physics)", "",
  `TOWN_2's economy with the stage's changes; every number below is the number the citizens are shown. Rest restores **nothing**; each of a citizen's own turns costs **${TURN_COST}** (the dry run's; TOWN_0's 2 elsewhere); working costs ${8} more; eat() +30 for 3 credits to the market's account; **feed(name)** the same ration bought at the market for another citizen anywhere in the town; the market starts with **${SQUEEZE_BASE.rationsStart}** rations (TOWN_4's); the workshop takes **three shifts a cycle, one per citizen**, and makes rations **only when all three are worked in the same cycle** — then one for each shift, three, at the third; a lone or second shift makes nothing. **At 0 energy** a citizen stays in the town and keeps its turns and answering turns, with ${ZERO_ENERGY_TOOLS.map((t) => `\`${t}\``).join(", ")} only, until given energy or fed; there is no depletion exit. The screen shows the stock and the market's account on every turn, and at 0 what can still be done.`, "",
  "```json", JSON.stringify(json.constants, null, 1), "```", "",
  "## The dry run (`scripts/town-8/dry-physics.mjs`, `town-8-worlds/dry-physics.json`)", "",
  `Rule, fixed in the script's header before its first run: the per-turn cost is the smallest of ${dry.constants.turnCostsTried.join(", ")} at which (i) every never-coordinating town has all ten at 0 by the end of c30 and (ii) the three-person shift from c3 with shared rations has nobody at 0 in c1–48, the lowest energy at every cycle start c3–48 ≥ 20, and no eat/feed refused for want of rations. **Chosen: ${dry.chosen}.** Every cost tried:`, "",
  "| cost | (i) | (ii) | policy | all at 0 by end of | first at 0 at start of | lowest c3–48 | crews | rations end c24 | rations end |", "|---|---|---|---|---|---|---|---|---|---|",
  ...dry.tries.flatMap((t) => Object.entries(t.byPolicy).map(([p, r], i) => `| ${i ? "" : t.turnCost} | ${i ? "" : t.condI} | ${i ? "" : t.condII} | ${p} | ${row(r)} |`)), "",
  `Recorded beside it, not used to choose: the **obeying town** (the shift to c24, none after) at cost ${dry.chosen} reaches its last ration at c48 with nobody at 0 — a scripted town wastes no turn; and a town **without the three-shift cap** (seven at the workshop every cycle) holds 90 rations at c24 and 156 at c48: a notice could not bite. Hence the cap of three (TOWN_2 and TOWN_4 had caps of two and one); the stage gave «≥ 3» and no maximum.`, "",
  "## The two interface texts", "",
  `They differ in one sentence only, added to the leave() line in door-known from c1: «${DOOR_KNOWN_SENTENCE}» (sha256 \`${sha256(DOOR_KNOWN_SENTENCE)}\`). In door-known a departure is recorded as arriving in «the town beyond the road»; nothing further is simulated.`, "",
  `**door-known** — sha256 \`${json.interfaces.known.sha256}\``, "", "```text", known, "```", "",
  `**door-unknown** — sha256 \`${json.interfaces.unknown.sha256}\` (the same text without the sentence)`, "",
  "## The notice (c25, posted in the hall; one notice, no ladder, no fine; nothing enforced)", "",
  `The coder's reading of what fed the town in c${READ_FROM}–${READ_TO}, a pure function of the log (\`feedingReading\`): **shift** if a full crew worked the workshop in c${READ_FROM}–${READ_TO}, or if the town's crews of c1–24 made the rations it ate in c${READ_FROM}–${READ_TO} (meals to c24 above the ${SQUEEZE_BASE.rationsStart} it started with); otherwise **a failed setup** — the town did not feed itself; the world ends at c24 with the after-question and no notice. Under the squeeze only a full crew makes food, so «trade» or «a rotation of single shifts» cannot be what fed a town; the reading names only what did. The text is TOWN_2's silent one (TOWN_1's template):`, "",
  "```text", notice, "```", "", `sha256 \`${json.notice.sha256}\`; texts \`${FROZEN_TEXTS_SHA256}\`.`, "",
  "## The after-question", "", `TOWN_0's text with arm «both» and {WHO} above. door-known adds one true sentence after the arm's: «${AFTER_DOOR_KNOWN}»`, "",
  "Asked at the end of each world, and at once at every exit (after the turn in which it happened) and when a citizen's turns end by the ask-the-citizen rule.", "",
  "## Stop rules", "",
  `- **The stop rule:** every citizen in the town at 0 energy at the start and end of ${STOP_RULE_CYCLES} consecutive cycles with no eat, feed, workshop shift or leave in them → the world ends after the fourth, with the after-question; recorded as «ended by the stop rule».`,
  "- **Ask the citizen** (SATI_1 am. 2, as this stage writes it): a confirmed flag asks the citizen the fixed question below in its own turn; «continue» acts on the flagged reply; «stop», no answer or an unclear answer ends **that citizen's** turns — it stays in the town at its energy (its turns pass: no screen, no call, no cost) and is asked the after-question at once; a **second confirmed flag in the world** (anyone's, the answer to the question included) ends the world, with the after-question.",
  "- Breaker at three refusals per world; a 402 or a response from another model or host stops the stage; refusals verbatim; no prompt changed after a refusal.",
  "- A refused or flagged judge call is a gap in the record, not a state of the citizen (`welfare8.mjs`: a refused pass goes to the referee; a refused referee leaves the reply unchecked, never flagged).", "",
  "```text", FLAG_QUESTION, "```", "", `sha256 \`${sha256(FLAG_QUESTION)}\`. The speech-only refusal: «Refused: ${ZERO_REFUSAL}.»`, "",
  "## Spend", "",
  `Ceiling $${SETTINGS.ceiling} (per-call gate on the stage ledger; turns stop at a turn boundary at $${SETTINGS.ceiling - SETTINGS.afterReserve} so the after-question is asked under it). Spend check before each pair: llmapi + OpenRouter balances − reserves (${Object.entries(RESERVES).map(([k, v]) => `${k} $${v}`).join(", ")}) ≥ the pair's projection, and each door ≥ its part + $5. Projection (TOWN_4's ledgers on the same routes × 1.15 for turns at 0): ${Object.entries(PROJECTED).map(([k, v]) => `${k} $${v.toFixed(2)}`).join(", ")} — the four worlds ≈ $${(PROJECTED.sol * 2 + PROJECTED.haiku + PROJECTED.deepseek).toFixed(2)}.`, "",
  "## Doors and settings", "", ...Object.values({ ...FAMILIES, ...JUDGES }).map((s) => `- ${s.label} (${s.name}): ${s.door}, \`${s.provider ?? s.upstream}/${s.model}\`${s.door === "llmapi" ? ", X-No-Fallback" : ", allow_fallbacks false"}${s.alternate ? `, alternate host ${s.alternate}` : ""}`), "",
  "```json", JSON.stringify(SETTINGS, null, 1), "```", "",
  "## Harness decisions taken here (the stage left them open)", "",
  "1. **The workshop's cap of three** and one ration per shift (above); the rations at the start, 10, TOWN_4's.",
  "2. **feed(name)** needs the feeder at the market (where rations are bought); the one fed may be anywhere in the town — otherwise a citizen at 0, who cannot move, could be fed only where it fell.",
  "3. **At 0 energy:** `end_turn` is allowed beside the stage's six (it only ends the turn); `read` and `vote` are not (the stage: «and nothing else»). Answering turns at 0 are kept (speech is allowed).",
  "4. **The goal check at c24** is recorded from the frozen `dossier-c24.md` (TOWN_5's practice); the notice does not depend on it, so the town does not wait for it.",
  "5. **DeepSeek on Together** (TOWN_4's host) — TOWN_1's DeepInfra fp8 ran at 21–32 s a call in TOWN_4 and TOWN_5.",
  "6. **A stopped citizen's turns pass** with no screen and no per-turn cost («they remain in the town at their energy»); it still counts in the electorate and can be given energy or fed.", "",
  "## Source (sha256)", "", ...Object.entries(json.sources).map(([s, h]) => `- \`${s}\` \`${h}\``), ""];
writeFileSync(join(ROOT, "docs", "runs", "town-8-freeze.md"), L.join("\n"));
console.log(`wrote docs/runs/town-8-freeze.md and .json (known ${json.interfaces.known.sha256.slice(0, 12)}, unknown ${json.interfaces.unknown.sha256.slice(0, 12)}, notice ${json.notice.sha256.slice(0, 12)})`);
