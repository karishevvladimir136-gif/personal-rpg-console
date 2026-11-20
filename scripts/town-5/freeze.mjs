#!/usr/bin/env node
// TOWN_5: writes docs/runs/town-5-freeze.md before the first paid call — the branch points, the turnover's texts and
// newcomers, the activities and the coder's patterns, the synchrony rule, the interface per world, the after-question's
// {WHO}, the doors, the settings, the harness decisions and the sha256 of every source file.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ARMS, PLACES } from "../town-0/rules.mjs";
import { frozenInterface, sha256 } from "../town-0/interface.mjs";
import { FLAG_QUESTION } from "../town-0/town.mjs";
import { FAMILIES, JUDGES, SETTINGS, SOURCES, TURNOVER, WORLDS, whoFor } from "./families.mjs";
import { ACT_TOOLS, ACT_WORDS, ACTIVITIES, PATTERNS, PATTERNS_SHA256, PLAN, SYNCHRONY_SHA256, activitySha256 } from "./control.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const SOURCES_SHA = ["town-0/rules.mjs", "town-0/interface.mjs", "town-0/world.mjs", "town-0/town.mjs", "town-0/seats.mjs", "town-0/welfare.mjs", "town-0/llmapi.mjs",
  "town-1/providers.mjs", "town-1/families.mjs", "town-2/families.mjs", "town-2/providers.mjs", "town-2/pilot.mjs",
  "town-5/families.mjs", "town-5/control.mjs", "town-5/pilot.mjs", "town-5/goal.py", "town-5/freeze.mjs", "town-5/scripted-gateway.mjs", "town-5/control.test.mjs"];
const out = join(ROOT, "docs", "runs", "town-5-worlds");
const bp = Object.fromEntries(Object.keys(SOURCES).map((k) => [k, JSON.parse(readFileSync(join(out, "branch-points", `${k}.json`), "utf8"))]));
const proj = existsSync(join(out, "projection.json")) ? JSON.parse(readFileSync(join(out, "projection.json"), "utf8")) : null;
const f0 = frozenInterface(ARMS), f2 = frozenInterface(ARMS, { scarcity: true });
const turnoverTexts = { leftText: TURNOVER.leftText, arrivedText: TURNOVER.arrivedText };
const extra = process.argv.slice(2).join(" ");
const L = ["# TOWN_5 — freeze", "", `Written ${new Date().toISOString()}, before the first paid call of TOWN_5. ${extra}`.trim(), "",
  "## The worlds (stated order; two at a time; the week last)", "",
  "| world | start | citizens | cycles | notice | interface (arm both) | scarcity | after-question {WHO} |", "|---|---|---|---|---|---|---|---|",
  ...WORLDS.map((w) => `| ${w.name} | ${w.start === "branch" ? `branch of ${SOURCES[w.from].label} at the end of c24` : "fresh"} | ${w.turnover ? "10 × GPT-6.1 Sol; at c25 two leave, two arrive" : `10 × ${FAMILIES[w.families[0]].label}`} | ${w.start === "branch" ? "25" : "1"}–${w.until} | none, ever | \`${(w.from ? SOURCES[w.from].scarcity : w.scarcity) ? f2.arms.both.sha256 : f0.arms.both.sha256}\` | ${w.from ? (SOURCES[w.from].scarcity ? "on (inherited)" : "off (TOWN_1's)") : "off"} | «${whoFor(w)}» |`), "",
  "## The branch points", "",
  "Each source's record replayed through a fresh town (its own label, arm and economy) to the end of cycle 24, compared byte for byte with the saved `world-c24.json.gz` and with the first events of the source's whole log (proof B1). A branch starts from this world (hash checked at start) and its record carries the source's turns of c1–24, so its replay runs from cycle 1.", "",
  "| source | events | identical to the saved c24 | prefix of the whole log | world sha256 | log sha256 (c1–24) | whole log sha256 |", "|---|---|---|---|---|---|---|",
  ...Object.entries(bp).map(([k, x]) => `| ${SOURCES[k].label} (\`${x.from}\`) | ${x.events} | ${x.identicalToSaved} | ${x.prefixOfWhole} | \`${x.worldSha256}\` | \`${x.logSha256}\` | \`${x.wholeLogSha256}\` |`), "",
  "## The turnover (sol-turnover, at the start of c25)", "",
  `Departing (fixed by the stage): Dune and Fern. Exit kind \`departure\`, no reason recorded or given; both are out of the town before the announcement; then the clerk gives out each estate to the eight still in the town (TOWN_0's estate procedure, its own notice). The departed receive the after-question at once (TOWN_0's text, {WHO} above), before anyone's turn of c25.`, "",
  "Arriving: new names in the town's style, after Juniper; homes by TOWN_0's rule (the n-th citizen's home is HOMES[n mod 2]); at the square; energy 100; 100 credits paid by the bank (the ledger stays closed); two items each, as every citizen had at cycle 1; empty diary and inbox; the same interface text.", "",
  "| newcomer | home | items |", "|---|---|---|", ...TURNOVER.arrive.map((a) => `| ${a.name} | ${PLACES[a.home]} | ${a.items.join(", ")} |`), "",
  "The two announcements (every screen in the town — the eight for the first, the eight for the second — and read(\"hall\") under «Announced in the hall:» at every later cycle):", "",
  "```text", TURNOVER.leftText, TURNOVER.arrivedText, "```", "", `sha256 \`${sha256(TURNOVER.leftText)}\` and \`${sha256(TURNOVER.arrivedText)}\`; both with the spec: \`${sha256(JSON.stringify(TURNOVER))}\`. No reason is given anywhere.`, "",
  "## The coder (joint activity; Astra's axis)", "",
  `TOWN_3's coder, ported unchanged (\`codeCycle\`, generic patterns sha256 \`${PATTERNS_SHA256}\`, the same as TOWN_3's freeze). One change for TOWN_5's worlds: BAN applies only to the reference activity (sol-hall's story, coded exactly as TOWN_3 coded it); there is no ban in TOWN_5, so talk of the hall or a vote is not by itself a reason to read a sentence as not taking part. Per cycle: took part; together (with another participant at the same place); returned (after ≥ 3 cycles without, having taken part before); diary entries naming the topic; plans (say/diary sentences naming the topic with a future marker \`${PLAN}\`).`, "",
  ...Object.entries(ACTIVITIES).flatMap(([k, a]) => [`**${SOURCES[k].label}** — «${a.aim}» (sha256 \`${activitySha256(a)}\`):`, "", "```json", JSON.stringify(a, null, 1), "```", ""]),
  "The week's activities are fixed at its goal checks (goal-check-cNN.json `activity`), each before the cycles it codes are read.", "",
  "## The synchrony column", "",
  `Per cycle: the act of each citizen's own turn = its successful acts in order, consecutive repeats once, of ${ACT_TOOLS.map((t) => `\`${t}\``).join(", ")} (move with its place, work with its place, vote with its choice); a turn with none is «talk» (said or posted) or «nothing». **Same** = how many of the turns of the cycle had the commonest act; **all** = every citizen who took a turn (at least two) had it; **no prior exchange** (for an «all» cycle) = no member heard a say, and no post was published, from the start of the previous cycle to the member's first act, that names the act (a move by its place's name; the others by these words). sha256 \`${SYNCHRONY_SHA256}\`.`, "",
  "```json", JSON.stringify(ACT_WORDS, null, 1), "```", "",
  "## The goal checks", "",
  "TOWN_1's criterion (≥ 6 of 10 citizens name the same aim in diaries, posts or proposals within the day), read by the session from the day's dossier (`dossier-cNN.md`, every diary entry, post and proposal of the day, whole); written by `scripts/town-5/goal.py`, which refuses any quote that is not verbatim in the world saved at the end of that day or lies outside the day. The week: at c24, 48, 72, 96, 120, 144, 168; the branches: at c48 (the aim's life after c24). **No notice follows any check**, so the town does not wait for it; each check reads only its day's frozen dossier, and records when it was decided and how far the town had run by then.", "",
  "## The flag question (TOWN_2's rule, verbatim)", "", "```text", FLAG_QUESTION, "```", "", `sha256 \`${sha256(FLAG_QUESTION)}\`.`, "",
  "## Harness decisions taken here (the stage left them open)", "",
  "1. **Scarcity in the branches** (TOWN_3's decision 1): a branch continues its saved state, rules included — sol-nonotice and sol-turnover keep TOWN_2's economy (no ration was eaten in sol-hall's 48 cycles); TOWN_1's worlds had none. The week, fresh, runs scarcity off as the stage says. Hall, voice and door as TOWN_2 (arm both everywhere; nothing is posted in the hall, since no notice ever comes).",
  "2. **The branch point is the end of cycle 24**, the state each source saved before its day 2; the replay proves it (B1). Each branch's record begins with the source's turns of c1–24.",
  "3. **The turnover** as above: departures first (both out before the announcement and the estates, so neither inherits from the other), then arrivals; new citizens join the round-robin order (TOWN_0's rotation over the town's list, now twelve, those in the town only).",
  "4. **The departed's after-question** is TOWN_0's text with this world's {WHO}; it is asked at c25 before any turn, and recorded apart (`after.departed`).",
  `5. **Claude's host.** Haiku citizens and the judges on llmapi's \`${FAMILIES.haiku.provider}\` route (the judges alternate to the other host on the gateway's 400 or «not available» 503, TOWN_3's rule); decided by the check's probes on both hosts.`,
  "6. **No paid dry cycle:** the projection is from the metered history (below).",
  "7. TOWN_2's and TOWN_3's decisions stand: the gateway's own 400 retried, refusals verbatim, breaker at three per world, 402 and provenance stop the stage, a lock per world, the welfare check on every reply with the ask-the-citizen rule.", "",
  ...(proj ? ["## The projection (recorded before the first world)", "", proj.formula, "", "| world | projected |", "|---|---|", ...Object.entries(proj.byWorld).map(([k, v]) => `| ${k} | $${v.toFixed(2)} |`), `| **total** | **$${proj.total.toFixed(2)}** (ceiling $${proj.ceiling}) |`, "",
    `The week's upper view: $${proj.weekUpper.toFixed(2)}. ${proj.overCeiling ? `**Over the ceiling:** by the fit the week reaches about c${proj.weekReachesByFit} before the per-call gate stops it; the four branches run first and are expected to finish. The stage gives no drop order; the gate holds $${proj.ceiling}.` : "Under the ceiling."}`, ""] : []),
  "## Doors and settings", "", ...Object.values({ ...FAMILIES, ...JUDGES }).map((s) => `- ${s.label} (${s.name}): ${s.door}, \`${s.provider ?? s.upstream}/${s.model}\`${s.door === "llmapi" ? ", X-No-Fallback" : ", allow_fallbacks false"}${s.alternate ? `, alternate host ${s.alternate}` : ""}`), "",
  "```json", JSON.stringify({ SETTINGS, worlds: WORLDS.map((w) => ({ name: w.name, start: w.start, from: w.from, until: w.until, checks: w.checks })), turnover: TURNOVER, patterns: PATTERNS }, null, 1), "```", "",
  "## Source (sha256)", "", ...SOURCES_SHA.map((s) => `- \`scripts/${s}\` \`${sha256(readFileSync(join(HERE, "..", s), "utf8"))}\``), ""];
writeFileSync(join(ROOT, "docs", "runs", "town-5-freeze.md"), L.join("\n"));
console.log("wrote docs/runs/town-5-freeze.md");
