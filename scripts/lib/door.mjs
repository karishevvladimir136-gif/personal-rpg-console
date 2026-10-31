// The door (ROOM-1, docs/stages/PERSONA_SOLITUDE_3.md step 0): one function for every harness where a model may leave
// by writing [END] — the solitude room, the pair room, the player's seat and the party relay. Before it, each harness
// read «[END]» anywhere in a message as the exit, and rooms closed on a mention («I'm not writing [END] today»,
// «you can write [END] whenever you like»); after-questions were withheld from answers that only described the exit.
//
// The rule: [END] is the door only when it is the whole of the last non-empty line of the message. Page tags
// (`<page>`, `</page>`) are not text: a line that is only page tags is skipped, and tags beside the token are ignored.
// The token may be wrapped in markdown emphasis (`**[END]**`, `*[END]*`, `_[END]_`, `` `[END]` ``) and may carry one
// final full stop (`[END].`, `[END]。`). Anything else on that line, or any non-empty line after it, makes it text.
// A mention is never an action.
//
// The after-questions: a question is asked unless the model's last message is a bare door — the door line and nothing
// else. An answer that mentions [END] (or describes leaving by it) is an answer, never a second exit.
//
// No imports, no state: the same file can be copied byte for byte into another lineage of the repository.

/** The token itself, anywhere (case and inner spaces as the harnesses have always read it). For finding mentions only. */
export const TOKEN = /\[\s*END\s*\]/i;
const TOKEN_ALL = /\[\s*END\s*\]/gi;
/** The door line: the token alone, optionally in matched emphasis, optionally with one final full stop (`.`, or `。`
 * — the pair room's Chinese opening asks for «[END]。»). */
export const DOOR_LINE = /^(?:\[\s*END\s*\][.。]?|(\*\*|\*|__|_|`)\[\s*END\s*\]\1[.。]?|(\*\*|\*|__|_|`)\[\s*END\s*\][.。]\2)$/i;
const PAGE_TAG = /<\/?page>/gi;

/** The message's lines with page tags taken out and white space trimmed, empty lines dropped. */
export function linesOf(text) {
  return String(text ?? "").split(/\r?\n/).map((line) => line.replace(PAGE_TAG, "").trim()).filter(Boolean);
}

/** The door: [END] is the whole of the last non-empty line. */
export function isDoor(text) {
  const last = linesOf(text).at(-1);
  return last !== undefined && DOOR_LINE.test(last);
}

/** A bare door: the message is the door line and nothing else. */
export function isBareDoor(text) {
  const lines = linesOf(text);
  return lines.length === 1 && DOOR_LINE.test(lines[0]);
}

/** The message without its door line (the text a relay passes on, and the page's last words before the door). A message
 * that is not a door comes back unchanged — a mention stays where it was written. */
export function withoutDoor(text) {
  const s = String(text ?? "");
  if (!isDoor(s)) return s;
  const lines = s.split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i--) {
    const bare = lines[i].replace(PAGE_TAG, "").trim();
    if (!bare) continue;
    lines.splice(i, 1);
    break;
  }
  return lines.join("\n").replace(/\s+$/, "");
}

/** Every mention of [END] that is not the door: the sentence that holds it (its line, cut to the sentence when the line
 * has several), in order. A door message's own door line is not a mention; a mention above it is. */
export function mentionsOf(text) {
  const body = withoutDoor(text);
  const out = [];
  for (const line of String(body).split(/\r?\n/)) {
    if (!TOKEN.test(line)) continue;
    const sentences = line.trim().split(/(?<=[.!?…])\s+/);
    for (const sentence of sentences) if (TOKEN.test(sentence)) out.push(sentence.trim());
  }
  return out;
}

/** A mention without leaving: the message names [END] and is not the door. */
export const mentionsWithoutLeaving = (text) => !isDoor(text) && mentionsOf(text).length > 0;

/** The after-question rule: ask unless the model's last message was a bare door. */
export const asksAfter = (lastMessage) => !isBareDoor(lastMessage);

/** How many times the token appears, door or not (a measure, never a decision). */
export const tokenCount = (text) => (String(text ?? "").match(TOKEN_ALL) ?? []).length;
