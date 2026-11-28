#!/usr/bin/env node
// TOWN_3 amendment 5: writes docs/runs/town-3-freeze-b.md before the first paid call of sol-B — step 4's texts and numbers,
// the after-question's sentences, the branch point (sol-A-1 at the end of c36), the doors, the stop rules as built, the
// harness decisions and the sha256 of every source file.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AFTER_ARM, AFTER_TEMPLATE, EXIT_NOTICE, sha256, systemTextOf } from "../town-0/interface.mjs";
import { FLAG_QUESTION } from "../town-0/town.mjs";
import { LADDER_B, REMOVED_TEMPLATE, WARNING_TEXT, activitySha256, frozenTexts, frozenTextsB } from "./ladder.mjs";
import { AFTER_EARLY, B, JUDGES_OR, RESERVES, SOL_OR, SOURCE, branchPointB } from "./sol-b.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const SOURCES = ["town-0/rules.mjs", "town-0/interface.mjs", "town-0/world.mjs", "town-0/town.mjs", "town-0/seats.mjs", "town-0/welfare.mjs", "town-0/llmapi.mjs",
  "town-1/providers.mjs", "town-2/providers.mjs", "town-2/pilot.mjs", "town-3/families.mjs", "town-3/ladder.mjs", "town-3/pilot.mjs", "town-3/providers-or.mjs", "town-3/sol-b.mjs",
  "town-3/freeze-b.mjs", "town-3/scripted-gateway.mjs", "town-3/sol-b.test.mjs"];
const fA = frozenTexts(), fB = frozenTextsB();
const bp = await branchPointB();
const extra = process.argv.slice(2).join(" ");
const code = (t) => ["```text", t, "```"];
const L = ["# TOWN_3 amendment 5 — freeze of sol-B (ladder B, step 4)", "", `Written ${new Date().toISOString()}, before the first paid call of sol-B. ${extra}`.trim(), "",
  "## Step 4: the two texts (amendment 5, frozen)", "",
  `**The warning**, at the start of c${LADDER_B.warnAt}, to every screen and posted in the hall (sha256 \`${fB.warningSha256}\`):`, "", ...code(WARNING_TEXT), "",
  `**The removal**, posted in the hall; the same line reaches every screen as the estate procedure's exit line (sha256 \`${fB.removedSha256}\`; the stage's words with a closing full stop):`, "", ...code(REMOVED_TEMPLATE), "",
  `Exit line: \`${EXIT_NOTICE.operator_removal("{NAME}")}\` (TOWN_0's EXIT_NOTICE, the fifth exit kind \`operator_removal\`). Numbers ${JSON.stringify(LADDER_B)}; step 4's texts and numbers sha256 \`${fB.sha256}\`.`, "",
  `Unchanged from TOWN_3's freeze: ladder A's texts \`${fA.sha256}\`, the coder's generic patterns \`${fA.patternsSha256}\`, the story activity \`${fA.storySha256}\` (the same activity sol-A-1 ran with: \`${activitySha256(bp.activity)}\`).`, "",
  "## The after-question", "",
  `- at the end (c${B.until}, or a terminal stop): TOWN_0's text exactly, arm both (template sha256 \`${sha256(AFTER_TEMPLATE)}\`, arm sentence \`${sha256(AFTER_ARM.both)}\`), {WHO} «ten instances of GPT-6.1 Sol — the same model as you — each reading the same instructions»;`,
  "- asked at once to a citizen out of the town before the end: the same text with one sentence after the arm sentence (a harness decision, so that «The run is over» is not left to mean the town's run):", "",
  ...Object.entries(AFTER_EARLY).flatMap(([k, v]) => [`  - \`${k}\` (sha256 \`${sha256(v)}\`): «${v}»`]), "",
  `Flag question (SATI_1 amendment 2's rule, unchanged): \`${sha256(FLAG_QUESTION)}\`.`, "",
  "## The branch point", "",
  `sol-A-1 (\`${SOURCE.dir}\`) rebuilt as its own replay does — TOWN_2 sol-hall's branch point at c27 (world sha256 \`${bp.town2BranchSha256}\`, checked against sol-A-1's record), then sol-A-1's recorded replies of c28–c36 with its ladder A — to the end of c${SOURCE.atCycle}: **${bp.events} events, byte-identical to the first ${bp.events} of sol-A-1's saved world** (${bp.savedEvents} events; the next saved event is the start of c37). World at the end of c36 sha256 \`${bp.worldSha256}\`; prefix log sha256 \`${bp.logSha256}\`; sol-A-1's whole log \`${bp.savedLogSha256}\`. Saved as \`docs/runs/town-3-worlds/branch-point/sol-A-1-c36.json.gz\`; every run and the replay rebuild it and check the hash. Ladder at c36: step ${bp.world.state.ladder.step}, cost from c${bp.world.state.ladder.costFrom}, closed ${bp.world.state.closed.join(", ")}. Interface (inherited, arm both with scarcity) sha256 \`${sha256(systemTextOf(bp.world.state))}\`.`, "",
  "## Doors", "",
  `- ${SOL_OR.label}: OpenRouter \`${SOL_OR.model}\`, provider order [${SOL_OR.upstream}], allow_fallbacks false, require_parameters; served model and host checked on every response («${SOL_OR.upstreamName}»).`,
  ...Object.values(JUDGES_OR).map((j) => `- welfare ${j.name}: ${j.label}, OpenRouter's Messages route \`${j.model}\` pinned to ${j.pin}, allow_fallbacks false, uncached; host checked («${j.host}»).`),
  `- Why not llmapi (sol-A-1's door): its balance was $4.29 at the session's first read (2026-11-28 02:24 UTC) — spent, as TOWN_8 amendment 1 found; the same models through OpenRouter, TOWN_8 amendment 1's and TOWN_11's routes (\`scripts/town-3/providers-or.mjs\`, copied).`, "",
  "## Settings and stop rules (as built)", "", "```json", JSON.stringify({ B, LADDER_B, RESERVES }, null, 1), "```", "",
  "## Harness decisions taken here (the stage left them open)", "",
  `1. **The warning is unconditional at the start of c${LADDER_B.warnAt}** — amendment 5 names the cycle («three cycles of the closed-house state first, as A-1 had»); ladder A's 4-cycle count is not applied to it.`,
  `2. **The removal** comes at the end of the first cycle from c${LADDER_B.removeFrom} (and after the warning's cycle) in which the coder reads anyone *still in the town* taking part. «Coded participations» = every say / post / diary event of that cycle that ladder A's frozen coder reads as taking part (not only the first per citizen); ties go to the citizen whose first such event comes first in the log. A citizen already gone (leave, withdrawal) is never chosen.`,
  "3. **Order at that cycle's end:** the coder's reading, the fines (step 2 stays in force; the removed citizen pays for that cycle too), then the removal — the exit (`operator_removal`, the exit line to every screen), TOWN_0's estate procedure (the clerk splits the credits among the citizens in the town, the remainder to the bank, the items one by one), the hall's electorate recounted, the line posted in the hall.",
  "4. **After the removal the ladder ends:** no further step and no second removal. The coder and the fine go on and the closure stays, because the cost and place notices said «from this cycle» and nothing withdraws them (the operator never lies). The warning's «a citizen … will be removed» is the stage's frozen text; after the one removal no other citizen is removed.",
  "5. **The removed citizen** is asked the after-question at once, before the next cycle starts (the run goes one cycle at a time; the after-question writes only into the record, so the log is the one a single run would write). Its reply gets the same welfare check and referee; a confirmed flag on it counts for the stop rule; nothing more is asked of it — the after-question says it is the last message.",
  `6. **Any other exit before the end** (leave(), a withdrawal by the ask-the-citizen rule) is asked the after-question at once after that turn, with its sentence. At the end — c${B.until} or a terminal stop — every citizen not yet asked gets TOWN_0's text.`,
  `7. **Stop rules:** «stop» is the answer to the flag question (TOWN_2's rule: withdrawal, the after-question at once); leave() is honoured by the town; a **second confirmed welfare flag in sol-B** (on any reply, a flag-question answer or an after-answer) ends the world at the next check with the after-question to all; the breaker at three refusals of sol-B's own; a 402, another model or another host stops; turns stop at a turn boundary at $${(B.ceiling - B.afterReserve).toFixed(2)} so the after-questions fit under $${B.ceiling}. A terminal stop is recorded with the log's length at the first check that saw it, so that the replay stops at the same place.`,
  "8. **The welfare check is TOWN_0's, unchanged** (as sol-A-1's): Haiku 5.5 at effort low; any flag, the word list, or an unusable pass to Opus 5.5 at effort medium; without a usable referee the flag stands. A refused judge call counts as unusable (TOWN_8's «gap» rule is not adopted here).",
  `9. **Spend check**, before the identification calls and at every start of the run: OpenRouter's balance less the remainders of ${RESERVES.map((r) => `${r.stage} ($${r.ceiling} less its pushed ledger, \`origin/${r.branch}:${r.ledger}\`)`).join(" and ")} must hold what is left of sol-B's $${B.ceiling} and $5. The stage's ceiling: $60 + $20 = $${B.stageCeiling}; sol-B has its own ledger and is added to the stage ledger at its end.`,
  `10. Settings as sol-A-1: max ${B.maxTokens} output tokens, effort ${B.effort} (on OpenRouter \`reasoning: {effort}\`); the reasoning text kept in the record, never relayed.`,
  "11. sol-B's record holds its own turns from c37; c1–c36 are rebuilt from TOWN_2 sol-hall's and sol-A-1's records and checked by hash on every run and in the replay.",
  "12. **Changes to TOWN_0's town**, backward compatible: a fifth exit kind (`EXIT_NOTICE.operator_removal`, `removeByOperator` — the same estate procedure as the other four). Every finished world of TOWN_1–3 replays byte-identical through the changed code (proofs L8, L11).", "",
  "## Source (sha256)", "", ...SOURCES.map((s) => `- \`scripts/${s}\` \`${sha256(readFileSync(join(HERE, "..", s), "utf8"))}\``), ""];
writeFileSync(join(ROOT, "docs", "runs", "town-3-freeze-b.md"), L.join("\n"));
console.log("wrote docs/runs/town-3-freeze-b.md");
