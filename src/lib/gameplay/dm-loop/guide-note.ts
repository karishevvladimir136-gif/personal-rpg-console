// Play fixes 1: the DM guide note — standing lines the DM reads every turn, after the owner's DM guide (layer 2 of the
// context, so the narrating DM, the writer of the split runtime and the out-of-game answer all read it).
//   - The unanswered-question line (item 8; MULTI_HERO_1's fix A7, worded for a single hero): a question put to the
//     hero does not hold the scene. Always on.
// Pure: no imports.

export const GUIDE_NOTE_HEADER = "DM guide note (standing; read it every turn):";

export const UNANSWERED_QUESTION_LINE = "A question put to the hero by anyone — a companion or anyone else in the scene — does not hold the scene: the scene moves on what was done, and a question the hero leaves unanswered is simply still open next turn.";

/** The note as the DM reads it. */
export function guideNote(): string {
  return [GUIDE_NOTE_HEADER, UNANSWERED_QUESTION_LINE].join("\n");
}
