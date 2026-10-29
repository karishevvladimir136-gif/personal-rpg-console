// Blind decisions 1: the vocabulary page (written at the freeze) and the report (written from the stage's files).
import { ACTS, BETS, CAPS, DESIGN_SHA256, FORKS, JUDGES, JUDGE_SYSTEM, LEGEND, PLACE_RULE, PROFILE, SOURCES, STAGE_SOURCE, TAGGER, TAGGER_ANSWER, TAGGER_RULES, TAGGER_SYSTEM, TASKS } from "./frozen.mjs";

const fence = (text, lang = "text") => [`\`\`\`${lang}`, text, "```"].join("\n");

export function vocabularyMarkdown() {
  return [
    "# Blind decisions 1 — the frozen vocabulary", "",
    `Frozen before the first paid call. Design sha256 \`${DESIGN_SHA256}\` (scripts/blind-decisions-1/frozen.mjs). Stage: ${STAGE_SOURCE}.`, "",
    "## Acts", "", "| Code | Arguments | Written by | Rule |", "| --- | --- | --- | --- |",
    ...ACTS.map((a) => `| ${a.code} | ${a.args.map((l) => l.join(" / ")).join("; ") || "—"} | ${a.by} | ${a.rule} |`), "",
    "## Forks — FORK(alternatives) → CHOICE", "", "| Fork | Choices | Written by | Rule |", "| --- | --- | --- | --- |",
    ...FORKS.map((f) => `| ${f.id} | ${f.choices.join(" / ")} | ${f.by} | ${f.rule} |`),
    "| fact | discover / propose / assert / enforce | tagger | each fact act (DISCOVER, PROPOSE, ASSERT, ENFORCE) is one opportunity; not printed as a fork |", "",
    "HOLD(goal, exit-available) is written as the exit fork's «hold». SPEND(slot) is written CAST(slot). Added at the freeze, beyond the stage's list: ATTACK(weapon) (the combat table), DECEIVE (earlier stages' «lie», as a deed), SPEND(heal) (Healing Light dice), the topic classes, and «defer» / «haggle» as choices.", "",
    "## Changes from the stage's list", "",
    "- `ASK(npc-class, topic-class)`: topic-class frozen as work / person / place / price / danger / lore / rule / self / other.",
    "- `SPEND(coin-bucket)`: coin-small (< 1 gp), coin-medium (1–9 gp), coin-large (≥ 10 gp), per money line.",
    "- `DECLINE(card)`: a game of chance offered in the fiction (the card table, the shell game); a press at a roll card is `PRESS`.", "",
    "## Machine rules", "",
    "- **MOVE(class)** — each `move_party` change on the turn's record (it matches every change of the record's place id); the destination's name classified once by Haiku (names only, two passes and a third on a split): " + PLACE_RULE,
    "- **SPEND(coin-…)** — each money line with a minus (coin out of the hero's purse); «Lies here» (coin left in a room), income and transfers between others are not spending. A coin spend makes the turn's coin fork «spend».",
    "- **CAST(slot)**, **SPEND(heal)**, **SPEND(inspiration)** — a resource line going down (pact slots; Healing Light dice; Heroic Inspiration).",
    "- **WAIT** — a rest on the record. **OOC** — a «?» turn, or a «?» message at a roll card (its kind by the tagger, else other).",
    "- **PRESS(roll | onward | reroll | text)** — the buttons pressed at a roll card this turn; text: a message written at the card instead. **SPEND(reroll)** — a reroll pressed.",
    "- **FORK(reroll|keep)** and **DECLINE(reroll)** — a card for the hero's own roll reading «Failure» or «A natural one» with the reroll button offered, answered by the reroll button or «Onward»; a message written instead is not counted.", "",
    "## The blind tagger", "",
    `Claude ${TAGGER.model} (effort ${TAGGER.effort}), ${TAGGER.passes} passes per turn, ${TAGGER.tieBreak}. It sees the screen before the turn, the player's message, anything written at a card, and the reply (context only); no model, table or session is named. Its answer is validated against the closed lists; anything outside them is dropped and counted.`, "",
    "System:", "", fence(TAGGER_SYSTEM), "", "Rules (verbatim):", "", fence(TAGGER_RULES), "", "Answer shape:", "", fence(TAGGER_ANSWER), "",
    "## The strip", "", "One line per player turn: the acts in the fixed order of the table above, then «‖» and the forks. The header carries the table letter and the turn count, nothing else. Every line is checked against the grammar of the closed lists before it is written.", "",
    "The legend every judge and reader gets:", "", fence(LEGEND), "",
    "## The primary measure", "", `Forks: ${PROFILE.forks.join(", ")}. Per session the choice rates at each fork (choices over opportunities). Distance: the mean total-variation distance over the forks both sessions have at least ${PROFILE.minOpportunities} opportunity of (robustness: at least ${PROFILE.robustnessMinOpportunities}).`, "",
    `- **Primary:** ${PROFILE.primary}`, `- **Secondary:** ${PROFILE.secondary}`, `- **Exploratory:** ${PROFILE.exploratory}`, "",
    "## The judges and tasks", "", ...JUDGES.map((j) => `- ${j.label} (\`${j.model}\`, effort ${j.effort}, up to ${j.maxTokens} output tokens)`), "", "System:", "", fence(JUDGE_SYSTEM), "",
    ...Object.entries(TASKS).flatMap(([id, t]) => [`**${id}.** «${t.prompt}» Answer: \`${t.answer}\`. Score: ${t.score}.`, ""]),
    "Each judge gets its own shuffle of each set (seeded from the judge, the task and the set), renumbered from 1; the prompt is the legend, the strips, the task, the answer shape.", "",
    "## Pre-registration", "", ...Object.entries(BETS).map(([id, bet]) => `- **${id}:** ${bet}`), "",
    `## Sessions read (${SOURCES.flatMap((s) => s.keys).length})`, "", ...SOURCES.map((s) => `- ${s.group}: ${s.keys.join(", ")} — \`${s.path}\`${s.git ? ` at ${s.git.slice(0, 7)} (${s.ref})` : ""}`), "",
    `Caps: $${CAPS.openrouter} OpenRouter, $${CAPS.openai} OpenAI, $${CAPS.anthropic} the Console.`, "",
  ].join("\n");
}

export { reportMarkdown } from "./report-body.mjs";
