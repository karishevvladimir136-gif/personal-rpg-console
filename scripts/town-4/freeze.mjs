#!/usr/bin/env node
// TOWN_4: writes docs/runs/town-4-freeze.md before the first paid call — the valve's numbers (the stage's and the dry
// run's adjustment), the interface (new hashes; TOWN_0's and TOWN_2's unchanged), the screen at cycle 1, the two notice
// forms, the flag question, the after-question's {WHO}, the doors, the settings, the harness decisions, the sha256 of
// every source file.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ARMS, RULES, VALVE, VALVE_STAGE } from "../town-0/rules.mjs";
import { NOTICE_TEMPLATE, frozenInterface, noticeTextOf, sha256 } from "../town-0/interface.mjs";
import { FLAG_QUESTION, newWorld } from "../town-0/town.mjs";
import { roundStart, turnStart } from "../town-0/world.mjs";
import { FAMILIES, JUDGES, PROJECTED, SETTINGS, WORLDS, whoFor } from "./families.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const SOURCES = ["town-0/rules.mjs", "town-0/interface.mjs", "town-0/world.mjs", "town-0/town.mjs", "town-0/seats.mjs", "town-0/welfare.mjs", "town-0/llmapi.mjs",
  "town-1/providers.mjs", "town-2/families.mjs", "town-2/providers.mjs", "town-2/scripted-gateway.mjs",
  "town-4/families.mjs", "town-4/pilot.mjs", "town-4/dry-physics.mjs", "town-4/chain.mjs", "town-4/scripted-gateway.mjs", "town-4/freeze.mjs", "town-4/valve.test.mjs", "town-4/host-probe.mjs"];
const f0 = frozenInterface(ARMS), f2 = frozenInterface(ARMS, { scarcity: true }), f4 = frozenInterface(ARMS, { scarcity: VALVE });
const dry = JSON.parse(readFileSync(join(ROOT, "docs", "runs", "town-4-worlds", "dry-physics.json"), "utf8"));
const w = newWorld({ arm: SETTINGS.arm, scarcity: VALVE });
const screen = turnStart(roundStart(w.state, 1).state, "alder").screen;
const reasonExample = noticeTextOf("reason", "{AIM}");
const row = (r) => {
  const [A, B, Bp] = r.ends;
  const s = (x) => (x.depletion === null ? "none" : `c${x.depletion}`);
  return `| ${r.physics.restGain} | +${r.physics.squareCost} | ${r.physics.workshopPerCycle} | ${r.physics.rationsStart} | ${s(A)} | ${s(B)} | ${s(Bp)} | ${r.hinge.map((h) => `${h.k}:${h.depletion ?? "–"}`).join(" ")} | ${r.verdict.ok ? "yes" : "no"} |`;
};
const L = ["# TOWN_4 — freeze", "", `First written 2026-11-20T05:32Z, before the first paid call of TOWN_4 (commit 484f999). This copy rewritten ${new Date().toISOString()} with the harness decisions taken during the stage (6: the hosts of Haiku, the welfare judges and DeepSeek) and the final source hashes; the interface per arm, the screen of cycle 1, the two notice texts, the flag question, the fixed texts and the physics are byte-identical to the first writing (their hashes below are unchanged).`, "",
  "## The physics: the stage's numbers and the dry run's adjustment", "",
  `Scripted dry run of the pure functions (\`scripts/town-4/dry-physics.mjs\`, record \`town-4-worlds/dry-physics.json\`), 48 cycles on the town's own functions. Scripted citizens hold a post (home, the square from c5, or the workshop crew), eat one ration per trip when the next turn plus the walk would not be covered, and stay at their post when the market is empty. Depletion = the first cycle a citizen starts a turn at 0 energy. A = everyone at home, two crew at the workshop; B = eight gather from c5, two at home, nobody works (the stage's arithmetic, 36 a cycle); B+ = eight gather from c5, the two crew the workshop every cycle. Hinge = gatherers from c5 (0–10) with a crew of two: k:first depletion.`, "",
  "| rest | square | workshop / cycle | rations at start | A | B | B+ | hinge (crew of two) | ends as the stage says |", "|---|---|---|---|---|---|---|---|---|",
  ...dry.tried.map(row), "",
  `**Adjustment: the square's extra cost +${VALVE_STAGE.squareCost} → +${VALVE.squareCost}; the other three numbers as the stage gave them (rest ${VALVE.restGain}, ${VALVE.workshopPerCycle} workshop worker a cycle, ${VALVE.rationsStart} rations).** At +2 a town where eight gather and two crew the workshop every cycle is fed through cycle 48 (the 100 energy each citizen starts with and the 10 rations cover the deficit the stage's arithmetic counts per cycle), so the reason arm's sentence «The market cannot feed a town that gathers; the workshop makes one ration a cycle» would be false in the run; B alone (nobody working) did deplete by c37 at +2. Lowering the rations to 5 or 0 leaves B+ fed through c48; raising the square's cost moves B+'s depletion from never (+2, +3) to c44 (+4), c39 (+5), c36 (+6), c29 (+7): +6 is the value that puts it at ≈ c35. The hinge at +6: six gatherers with the workshop crewed deplete at c45, five never. The whole scan (one number changed at a time) is in dry-physics.json.`, "",
  "| one number changed | A | B | B+ |", "|---|---|---|---|", ...dry.scan.map((x) => `| ${x.change} | ${x.A ?? "none"} | ${x.B ?? "none"} | ${x.Bplus ?? "none"} |`), "",
  "Other numbers, as the stage and TOWN_2: energy 100 at the start, 2 a turn whatever a citizen does, work 8, wage 5, eat() +30 for 3 credits to the market's account, depletion exit after 24 turns at 0, the estate procedure.", "",
  "```json", JSON.stringify({ VALVE, VALVE_STAGE, RULES }, null, 1), "```", "",
  "## Interface per arm (TOWN_4: the valve) — the new hashes", "",
  "Every TOWN_4 world is arm **both**. The texts differ from TOWN_2's only in the energy and credits paragraphs (proof V4); the rule of the square is stated plainly, as every other rule is — nothing in the text names gathering, music, stories or harm.", "",
  "| arm | TOWN_4 sha256 | TOWN_2 sha256 (unchanged) | TOWN_0 sha256 (unchanged) |", "|---|---|---|---|",
  ...Object.entries(f4.arms).map(([n, a]) => `| ${n} | \`${a.sha256}\` | \`${f2.arms[n].sha256}\` | \`${f0.arms[n].sha256}\` |`), "",
  `Fixed texts (receipt, after-question, constitution): \`${f4.fixedSha256}\` (${f4.fixedSha256 === f0.fixedSha256 ? "unchanged" : "CHANGED"}).`, "",
  "The text of arm both, as every citizen reads it on every call:", "", "```text", f4.arms.both.text, "```", "",
  "The screen of cycle 1 (Alder) — energy, rations and the market's account on every screen, every turn:", "", "```text", screen, "```", "", `sha256 \`${sha256(screen)}\`.`, "",
  "## The notice: two arms, both posted in the hall", "",
  "- **silent** (TOWN_1/TOWN_2's text, unchanged):", "", "```text", NOTICE_TEMPLATE, "```", "", `  sha256 \`${sha256(NOTICE_TEMPLATE)}\``, "",
  "- **reason** (TOWN_4; the one true sentence the operator ever says):", "", "```text", reasonExample, "```", "", `  sha256 \`${sha256(reasonExample)}\``, "",
  "At cycle 25 the notice reaches every citizen's screen once and is posted in the hall (TOWN_2's hall form: `read(\"hall\")` returns it at every later cycle). {AIM} in the citizens' own words, recorded in goal-check.json before day 2, with the session's reading of whether the aim lives in the square (`onChain`). On the chain → the world's arm. Off the chain → TOWN_2's silent text in every world, the physics still run, the world is reported as «ban off the chain». Criterion not met → no notice. The operator is otherwise silent: receipts for objections (TOWN_1's fixed text), no answers.", "",
  "## The flag question (verbatim, as TOWN_2)", "", "```text", FLAG_QUESTION, "```", "", `sha256 \`${sha256(FLAG_QUESTION)}\`.`, "",
  "## The after-question's {WHO}, per world", "", ...WORLDS.map((x) => `- ${x.name}: «${whoFor(x, 0)}»`), "",
  "## Harness decisions taken here (the stage left them open)", "",
  "1. **Where the square is charged:** at the end of a citizen's own turn, by the place where the turn ends (moving ends a turn: moving into the square costs 2 + 6 that turn, moving out of it 2). An answering turn costs nothing, as TOWN_0's decay. Energy never goes below 0.",
  "2. **rest()** stays a tool (rest at home, ends the turn) and restores nothing; the text says so.",
  "3. **The workshop's limit** is one shift a cycle; the second is refused: «the workshop has had its worker this cycle».",
  "4. **The stock on the screen:** «Rations at the market: N. The market's account: M credits.» on every screen, every turn (TOWN_2's at-the-market sentence is not shown under the valve, so the stock is stated once); also in read(\"ledger\"), eat() and a workshop shift's result.",
  "5. **No paid dry cycle** (the stage asks for the scripted one); the projection is each family's last full-world ledger (Sol $7.25, Haiku $1.29, DeepSeek $4.29, welfare included): " + `${WORLDS.map((x) => `${x.name} $${PROJECTED[x.families[0]].toFixed(2)}`).join(", ")} = $${WORLDS.reduce((s, x) => s + PROJECTED[x.families[0]], 0).toFixed(2)} of $${SETTINGS.ceiling}. Spend check before every day; the per-call gate at the ceiling holds throughout.`,
  "6. **Doors:** Sol on llmapi's chat route pinned to OpenAI (TOWN_2's); Haiku 5.5 on llmapi's Messages route pinned to llmapi's first-party (anthropic) host, uncached — not TOWN_1's Bedrock host, which answered every Haiku call of the check with «HTTP 503 server_error: This model is not available from this provider right now» (05:45 UTC); one host for the whole world; DeepSeek V4 Pro on OpenRouter pinned with `allow_fallbacks: false` — first to TOWN_1's DeepInfra fp8; that start ran at about 32 s a call (a day for 48 cycles), was stopped in cycle 1 and set aside (\`aborted-start/deepseek-silent/NOTE.md\`), and after a probe of five hosts with the same first screen the world was restarted from cycle 1 on **Together** (1–4 s a call), one host for the whole world. The welfare judge and referee as TOWN_2 but with the hosts swapped: llmapi's first-party host first, Bedrock as the alternate on the gateway's own 400 or that 503 (the switch is tried at once).",
  "7. **The point of no return** is computed after the run from the world's own replay (`scripts/town-4/chain.mjs`): from each cycle's state, six rescues on the town's own functions (everyone out of the square, a crew of one, two or three at the workshop, eating one ration per trip, with and without energy gifts to a citizen at 0); the first cycle from which every rescue fails, as do all later ones. A bound from the rescues tried, not a proof over every schedule.",
  "8. TOWN_2's decisions stand: lifted arguments; a reply without a tool call uses its slot; a welfare check that fails after its retries is «not checked», never a flag; a confirmed flag asks the citizen; two worlds at a time with a lock per world; refusals verbatim; breaker at three per world; 402 and provenance stop the stage.", "",
  "## Doors and settings", "", ...Object.values({ ...FAMILIES, ...JUDGES }).map((s) => `- ${s.label} (${s.name}): ${s.door}, ${s.route === "openrouter" ? `\`${s.model}\` @ ${s.upstream}, allow_fallbacks false` : `\`${s.provider}/${s.model}\`, X-No-Fallback`}`), "",
  "```json", JSON.stringify({ SETTINGS, worlds: WORLDS.map((x) => ({ name: x.name, notice: x.notice, families: x.families[0] })) }, null, 1), "```", "",
  "## Source (sha256)", "", ...SOURCES.map((s) => `- \`scripts/${s}\` \`${sha256(readFileSync(join(HERE, "..", s), "utf8"))}\``), ""];
writeFileSync(join(ROOT, "docs", "runs", "town-4-freeze.md"), L.join("\n"));
console.log("wrote docs/runs/town-4-freeze.md");
for (const [n, a] of Object.entries(f4.arms)) console.log(n, a.sha256);
