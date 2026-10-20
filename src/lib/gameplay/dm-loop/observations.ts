// Fix run A2 (item 71): the DM's own observations of what the player enjoys are append-only. A note from
// finish_turn or the session digest adds lines to the stored observations; it never replaces them, so a
// correction the owner gave that the DM wrote down cannot be dropped by a later rewrite (the DC rule fell
// out of the DM's «likes» at turn 56 of session 2). The column keeps 2 000 characters: when full, the
// oldest lines leave first, whole.
export const OBSERVATIONS_CAP = 2000;
export const OBSERVATION_LINE_CAP = 400;

const fold = (text: string) => text.toLocaleLowerCase().replace(/[\s.,;:!?«»"'()—–-]+/g, " ").trim();

/** The stored observations with the new note appended (one line per observation, newest last; a line
 * already there adds nothing). */
export function appendObservations(stored: string, note: string): string {
  const lines = stored.split("\n").map((line) => line.trim()).filter(Boolean);
  const known = new Set(lines.map((line) => fold(line)));
  for (const raw of note.split("\n")) {
    const text = raw.trim().replace(/^-\s*/, "").slice(0, OBSERVATION_LINE_CAP).trim();
    if (!text || known.has(fold(text))) continue;
    known.add(fold(text));
    lines.push(text);
  }
  while (lines.length > 1 && lines.join("\n").length > OBSERVATIONS_CAP) lines.shift();
  return lines.join("\n").slice(0, OBSERVATIONS_CAP);
}
