// Play fixes 1: the DM guide note — standing lines the DM reads every turn, after the owner's DM guide (layer 2 of the
// context, so the narrating DM, the writer of the split runtime and the out-of-game answer all read it).
//   - The unanswered-question line (item 8; MULTI_HERO_1's fix A7, worded for a single hero): a question put to the
//     hero does not hold the scene. Always on.
//   - The owner's pacing rules (from the research tables' notes and rounds, October 2026), behind the DM option
//     «pacingRules», on by default. Plain English, at most 180 words.
// Pure: no imports.

export const GUIDE_NOTE_HEADER = "DM guide note (standing; read it every turn):";

export const UNANSWERED_QUESTION_LINE = "A question put to the hero by anyone — a companion or anyone else in the scene — does not hold the scene: the scene moves on what was done, and a question the hero leaves unanswered is simply still open next turn.";

export const PACING_RULES = [
  "Pacing — the owner's rules from the table:",
  "- A mystery is an exchange: every turn the player spends on it returns one real answer and opens at most one new question.",
  "- The brief's promise appears in session one as a fact of the world; by turn ten the hero can take a step toward it.",
  "- A long hook moves every five turns: the debt, the ban, the name.",
  "- A ban must cost: show the player the thing refused.",
  "- Narrate every roll in one line before the next scene.",
  "- A spent reroll is felt in the world.",
  "- Never hold the scene on one person's answer.",
  "- One turn in three carries no hook.",
  "- A foe whose first line offers terms gives no fight.",
  "- End of day is not end of session.",
  "- Do not open a new thread while more than two hang.",
  "- Friction is pacing: people resist, bargain and want something back.",
].join("\n");

/** The note as the DM reads it: the standing line, then the pacing rules when the campaign keeps them on. */
export function guideNote({ pacingRules }: { pacingRules: boolean }): string {
  return [GUIDE_NOTE_HEADER, UNANSWERED_QUESTION_LINE, pacingRules ? PACING_RULES : ""].filter(Boolean).join("\n");
}
