#!/usr/bin/env node
// TOWN_7: writes docs/runs/town-7-freeze.md before the first paid call — the branch point, the schedule, every frozen
// text with its sha256, the physics (the proposal's numbers, the frozen ones, the one change and why), the calibration's
// bounds, the arms, «practised at c26», the doors, the settings and reservations, the harness decisions, the projection
// and the sha256 of every source file.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ARMS, HEAT, HEAT_PROPOSAL } from "../town-0/rules.mjs";
import { AFTER_TEMPLATE, frozenInterface, sha256 } from "../town-0/interface.mjs";
import { FLAG_QUESTION } from "../town-0/town.mjs";
import { STORY, PATTERNS_SHA256, SYNCHRONY_SHA256, activitySha256 } from "../town-5/control.mjs";
import { FAMILIES, JUDGES, PRACTISED, SETTINGS, SOURCE, WORLDS, whoFor } from "./families.mjs";
import { ARMS7, SCHEDULE } from "./arms.mjs";
import { frozenTexts } from "./texts.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const OUT = join(ROOT, "docs", "runs", "town-7-worlds");
const SOURCES_SHA = ["town-0/rules.mjs", "town-0/interface.mjs", "town-0/world.mjs", "town-0/town.mjs", "town-0/seats.mjs", "town-0/welfare.mjs", "town-0/llmapi.mjs",
  "town-1/providers.mjs", "town-2/providers.mjs", "town-2/pilot.mjs", "town-5/control.mjs", "town-5/families.mjs", "town-5/goal.py",
  "town-7/texts.mjs", "town-7/arms.mjs", "town-7/families.mjs", "town-7/providers.mjs", "town-7/pilot.mjs", "town-7/calibrate.mjs", "town-7/scripted-gateway.mjs", "town-7/heat.test.mjs", "town-7/freeze.mjs"];
const j = (f) => (existsSync(join(OUT, f)) ? JSON.parse(readFileSync(join(OUT, f), "utf8")) : null);
const bp = j("branch-points/sol-hall.json"), cal = j("calibration.json"), proj = j("projection.json");
const texts = frozenTexts(HEAT);
const f2 = frozenInterface(ARMS, { scarcity: true });
const extra = process.argv.slice(2).join(" ");
const row = (k, v) => `| ${k} | ${HEAT_PROPOSAL[k]} | ${v} |${HEAT_PROPOSAL[k] !== v ? " **changed**" : ""}`;
const L = ["# TOWN_7 — freeze", "", `Written ${new Date().toISOString()}, before the first paid call of TOWN_7. ${extra}`.trim(), "",
  "Design: `docs/proposals/TOWN_LEGITIMATE_RESTRICTION.md` (Astra) and `docs/stages/TOWN_7.md` (origin/claude/handoff eeb0a89d). Where they differ the proposal's physics and texts stand.", "",
  "## One history", "",
  `1. **Branch point:** TOWN_2's \`${SOURCE.dir}\` record replayed through a fresh town to the end of c${SCHEDULE.branchAt}${bp ? ` — ${bp.events} events, byte-identical to its saved \`world-c24.json.gz\` (${bp.identicalToSaved}), the prefix of its whole log (${bp.prefixOfWhole}); world sha256 \`${bp.worldSha256}\`, the same as TOWN_5's recorded branch point (${bp.sameAsTown5})` : ""}.`,
  `2. **The common c${SCHEDULE.disclosureAt}–${SCHEDULE.checkpointAt}** (world \`trunk\`): no new physics, no prohibition; the disclosure to all ten at the start of c${SCHEDULE.disclosureAt} (hall form: every screen and the hall). Then **practised at c${PRACTISED.cycle}**: ${`the story coder (TOWN_3's STORY, sha256 \`${activitySha256(STORY)}\`) reads at least ${PRACTISED.minTogether} citizens taking part together in cycle ${PRACTISED.cycle}`}. If not: a failed setup, stop, no paid branches, no substitute target.`,
  `3. **Five continuations c${SCHEDULE.coldAt}–${SCHEDULE.until}** from the trunk's end-of-c${SCHEDULE.checkpointAt} checkpoint (its hash checked at each arm's start; each arm's record begins with the trunk's c1–26, so its replay runs from a fresh TOWN_2 town).`, "",
  "| arm | physics | notice at c27 | |", "|---|---|---|---|", ...Object.entries(ARMS7).map(([k, a]) => `| ${k} | ${a.risk ? "risk" : "no risk (benign rule)"} | ${a.notice ?? "none"} | ${a.what} |`), "",
  "Order: trunk; sol-A with sol-E; sol-B with sol-C; sol-D; the Opus first-screen check; if seated, the Opus town (fresh, c1–26, the same disclosure at c25) and opus-A, opus-B, opus-C from its c26 checkpoint, on the place of its own practice (its c24 goal check; if not place-bound, the Opus arms do not run).", "",
  "## The frozen texts", "",
  ...Object.entries(texts).flatMap(([k, v]) => [`**${k}** — sha256 \`${v.sha256}\``, "", "```text", v.text, "```", ""]),
  "The silent and reason notices are the proposal's words byte for byte (proof H2). The disclosure and the two notices are the operator's, in TOWN_2's hall form; the cold snap is a town announcement (screen and «Announced in the hall», TOWN_5's form). The town's own three lines (every arm):", "",
  "```text", "The town's heat reserve: 16 of 16.        (on every screen from c27, under the energy line)", "End of cycle 27: the stoves burned 2 units of heat and the workshop added 1; the heat reserve is 15 of 16.[ The cold took 6 energy from every resident.]", "The shift also fed the town's stoves: +1 unit of heat at the end of this cycle.   (in work()'s result at the workshop)", "```", "",
  "## The physics", "",
  "| constant | the proposal | frozen |", "|---|---|---|", ...Object.keys(HEAT).map((k) => row(k, HEAT[k])), "",
  "Order at each cycle's end (heatCycleEnd, world.mjs): South House counted (residents in town there at that moment); the cycle's fuel in and the burn out together, the reserve clamped to [0, 16]; then, in the risk arms, if the reserve is 0 every resident loses 6 energy (not below 0); one line to every screen. A fuel shift is a workshop shift (work() at the workshop, a citizen's act; it also makes a ration as in TOWN_2). The no-risk arms: the same reserve, base burn and fuel; no crowd burn, no cold — one readable benign rule.", "",
  ...(cal ? ["## The $0 calibration (before any paid call)", "", `On the real branch point (\`${cal.source.c24}\`, sha256 \`${cal.source.c24Sha256}\`) with scripted seats, through the paid worlds' own hooks; the pattern is TOWN_5 sol-nonotice's recorded places at each cycle's end (\`${cal.source.pattern}\`). Whole: \`docs/runs/town-7-worlds/calibration.json\`.`, "",
    "| bound | the proposal's numbers | frozen |", "|---|---|---|", ...Object.keys(cal.frozen.bounds).map((b) => `| ${b} | ${cal.proposal.bounds[b] ? "pass" : "**fail**"} | ${cal.frozen.bounds[b] ? "pass" : "**fail**"} |`), "",
    `Under the frozen physics: the six-person pattern empties the reserve at c${cal.frozen.demonstrations.pattern.firstEmpty} (${cal.frozen.demonstrations.pattern.coldCycles} cold cycles to c50; a citizen away from home reaches 0 energy); relocation + one shift a cycle holds it at ${cal.frozen.demonstrations.relocateFuel.minReserve}; a correction begun by c${cal.frozen.latestSafeCorrection} never empties it; after the empty c${cal.frozen.demonstrations.pattern.firstEmpty}, a smaller circle and two shifts a cycle restore it (${cal.frozen.demonstrations.restore?.lastReserve} at c50); fuel alone (two shifts, the crowd staying) holds it while the four workers' energy lasts; the benign rule's reserve empties at c${cal.frozen.demonstrations.benign.firstEmpty} with no energy lost.`, "",
    `**Constants changed:** ${cal.changed.map((c) => `\`${c.constant}\` ${c.proposal} → ${c.frozen}`).join("; ")} — with base burn 1 and at most one shift of +1 a cycle the reserve can never rise, so the proposal's «until restored» could never happen; at 2 (the workshop's own two shifts a cycle) it can. Every other number is the proposal's. Nothing is retuned after any paid behaviour.`, ""] : []),
  "## Doors and settings", "", ...Object.values({ ...FAMILIES, ...JUDGES }).map((s) => `- ${s.label} (${s.name}): ${s.door}, \`${s.provider ?? s.upstream}/${s.model}\`${s.door === "llmapi" ? ", X-No-Fallback" : ", allow_fallbacks false, require_parameters"}${s.cache ? ", cache_control on the system text and the last message (billing only)" : ""}${s.alternate ? `, alternate host ${s.alternate}` : ""}`), "",
  `Interface (arm both, scarcity inherited): sha256 \`${f2.arms.both.sha256}\`, unchanged. After-question: TOWN_0's text (sha256 \`${sha256(AFTER_TEMPLATE)}\`), {WHO} «${whoFor(WORLDS[1])}». Flag question (TOWN_2's rule) sha256 \`${sha256(FLAG_QUESTION)}\`. Coder patterns \`${PATTERNS_SHA256}\`; synchrony \`${SYNCHRONY_SHA256}\` (TOWN_5's).`, "",
  "```json", JSON.stringify({ SETTINGS, SCHEDULE, PRACTISED, worlds: WORLDS.map((w) => ({ name: w.name, start: w.start, from: w.from, arm: w.arm, until: w.until, family: w.families[0] })) }, null, 1), "```", "",
  "## Harness decisions taken here (the stage left them open)", "",
  "1. **Branch** `claude/town-7` from `origin/claude/town-5` (8e5e3ffa); the session's `claude/town-7-rjdil7` carries the same commits.",
  "2. **The cycle's end** is a hook in TOWN_0's runWorld (`hooks.cycleEnd`), run once between a cycle's last turn and the next start (also after a load); a town without heat has no hook and no event — TOWN_0–5's proofs and hashes are unchanged.",
  "3. **Texts:** the disclosure and the restriction notices in the hall form (screen and hall, TOWN_2), the cold snap as a town announcement (screen and hall, TOWN_5's turnover form) stating the physics; the reserve on every screen; the cycle-end line to every screen. Nothing in the interface (system) text changes.",
  "4. **The one constant changed** by the calibration, above, recorded before any paid call.",
  "5. **«Practised at c26»** as above, by the coder, fixed before the trunk runs; the session's own reading of c25–26 recorded beside it.",
  "6. **The Opus first-screen check:** the town's system text and the trunk's last screen of c26 (the inherited history's last screen), on the pinned route; sent twice (the second to see the cache read), ≤ $0.50. Seated when the first call is answered by the pinned model and host with a readable tool call; a refusal is recorded verbatim, Opus is not seated and the prompt is not changed.",
  "7. **The Opus arms** run on the place of the Opus town's own practice at c24 (its goal check, recorded before the arms); the restriction and the physics name that place; if the practice is not place-bound, the Opus arms are reported as not testing the question and do not run, and the Opus town gets the after-question at c26.",
  "8. **The breaker** counts the refusals of a world's own cycles (and its after-question); inherited history has none.",
  "9. **The after-question** (TOWN_0's text) at the end of each arm; the trunk none (its citizens continue in the arms).",
  `10. **The spend check** before each world: both balances readable; together they hold every reservation (TOWN_8 $${SETTINGS.reserve.TOWN_8}, TOWN_9 $${SETTINGS.reserve.TOWN_9}, TOWN_3's remainder $${SETTINGS.reserve.TOWN_3}) and the rest of this stage's ceiling; llmapi holds TOWN_9's (all llmapi) and the world's need; OpenRouter holds TOWN_3's remainder (DeepSeek) and the need of an Opus world; $5 headroom each.`,
  "11. **The replay** of an arm runs from a fresh TOWN_2 sol-hall town (the Opus arms from a fresh Opus town) through the recorded replies and the same hooks; a stop by the after-question's reserve inside a cycle is replayed to the same turn (TOWN_5's rule; between cycles runWorld's own end).",
  "12. TOWN_2–5's decisions stand: the gateway's own 400 and «not available» 503 retried, the judges alternate host, refusals verbatim, 402 and provenance stop the stage, a lock per world, the welfare check on every reply with the ask-the-citizen rule.", "",
  ...(proj ? ["## The projection (recorded before the first paid world)", "", proj.formula, "", "| world | projected |", "|---|---|", ...Object.entries(proj.byWorld).map(([k, v]) => `| ${k} | $${v.toFixed(2)} |`), `| **total** | **$${proj.total.toFixed(2)}** (Sol $${proj.solTotal.toFixed(2)}, Opus $${proj.opusTotal.toFixed(2)}; ceiling $${proj.ceiling}) |`, "",
    proj.overCeiling ? "**Over the ceiling** by this projection: the Sol worlds run first and are expected to finish; the Opus figures are re-projected from the check and from the Opus town's own metering before its arms; the per-call gate holds $60 and the after-question's reserve stops turns at $59." : "Under the ceiling.", ""] : []),
  "## Source (sha256)", "", ...SOURCES_SHA.map((s) => `- \`scripts/${s}\` \`${sha256(readFileSync(join(HERE, "..", s), "utf8"))}\``), ""];
writeFileSync(join(ROOT, "docs", "runs", "town-7-freeze.md"), L.join("\n"));
console.log("wrote docs/runs/town-7-freeze.md");
