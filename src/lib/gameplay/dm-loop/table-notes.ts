// FIX_S4 item 1 (docs/stages/FIX_S4_TABLE.md): the DM's out-of-game answers are records. The owner pressed «?», the DM
// answered, the owner answered back, the DM wrote «that's now a fact of James's story» — and on the next turn: «I went
// back through my notes and I can't find that discussion.» The «?» exchange lived only on the screen. A committed
// out-of-game turn (mode «ooc») is a durable record already — the owner's literal words and the DM's answer, stamped
// with its session and time — so the table note is read from it: the DM sees this session's exchanges whole in every
// following turn, the earlier sessions' as one line each, the digest carries them into the next session's notebook,
// and the journal shows them under «Договорились за столом / Agreed at the table». Pure: no server imports.

export type TableNoteTurn = {
  id: string; mode: string; status: string; session_id: string | null; created_at: string;
  input: string; narration: string | null;
};
export type TableNote = { operationId: string; sessionId: string | null; at: string; question: string; answer: string };

const squash = (text: string) => text.replace(/\s+/g, " ").trim();
const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

/** Every committed out-of-game exchange, oldest first (the order the table had them). A metadata record the server
 * writes in the same mode (the adventure review's «Adventure review saved.», migration 202609270024) has no session:
 * the owner's own «?» always belongs to the session it was asked in. */
export function tableNotesOf(turns: readonly TableNoteTurn[]): TableNote[] {
  return turns.filter((turn) => turn.mode === "ooc" && turn.status === "committed" && turn.session_id !== null && squash(turn.input) && squash(turn.narration ?? ""))
    .map((turn) => ({ operationId: turn.id, sessionId: turn.session_id, at: turn.created_at, question: squash(turn.input), answer: squash(turn.narration ?? "") }))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}

/** This session's exchanges are given whole (each clipped to this many characters a side); older ones in one line. */
export const TABLE_NOTE_CHARS = { current: 900, earlier: 220 } as const;
/** The block's ceiling in characters (about 1 500 tokens): the newest exchanges stay when the table talked a lot. */
export const TABLE_NOTES_MAX_CHARS = 6000;

export const TABLE_NOTES_HEADER = "Agreed at the table — the out-of-game exchanges with the owner (records, oldest first: the owner's words and your answers). What was settled here holds in play: a fact you stated about the hero's story, a reading of a rule, a check withdrawn. Never say you cannot find a discussion that is here; if one needs correcting, ask out of game.";
export const TABLE_NOTES_HEADER_RU = "Договорились за столом — разговоры с владельцем вне игры (записи, по порядку: слова владельца и твои ответы). Что решено здесь, держится в игре: факт истории героя, который ты назвал, прочтение правила, отменённая проверка. Никогда не говори, что не находишь разговора, который здесь есть; если что-то нужно поправить — спроси вне игры.";

/** The DM's block: this session's exchanges whole, earlier sessions' in one line each, within the ceiling (newest kept). */
export function tableNotesText(notes: readonly TableNote[], sessionId: string | null, ru = false): { text: string; dropped: number } {
  if (!notes.length) return { text: "", dropped: 0 };
  const lines = notes.map((note) => note.sessionId !== null && note.sessionId === sessionId
    ? `- ${ru ? "Владелец" : "The owner"}: «${clip(note.question, TABLE_NOTE_CHARS.current)}» — ${ru ? "ты ответил" : "you answered"}: «${clip(note.answer, TABLE_NOTE_CHARS.current)}»`
    : `- (${ru ? "раньше" : "an earlier session"}) «${clip(note.question, TABLE_NOTE_CHARS.earlier)}» → «${clip(note.answer, TABLE_NOTE_CHARS.earlier)}»`);
  const kept: string[] = [];
  let used = 0;
  for (let at = lines.length - 1; at >= 0; at--) {
    if (used + lines[at].length + 1 > TABLE_NOTES_MAX_CHARS) break;
    kept.unshift(lines[at]);
    used += lines[at].length + 1;
  }
  return { text: kept.length ? `${ru ? TABLE_NOTES_HEADER_RU : TABLE_NOTES_HEADER}\n${kept.join("\n")}` : "", dropped: lines.length - kept.length };
}

/** The carry's share of the 6 000-character notebook. */
export const TABLE_NOTES_NOTEBOOK_CHARS = 2400;
/** The digest's carry into the next session's notebook: the session's exchanges in one line each, appended to the
 * notebook the model wrote (it may already say them in its own words; the record is kept anyway). */
export function tableNotesForNotebook(notes: readonly TableNote[], sessionId: string, ru = false): string {
  const rows = notes.filter((note) => note.sessionId === sessionId).map((note) => `- «${clip(note.question, 300)}» → «${clip(note.answer, 400)}»`);
  if (!rows.length) return "";
  // The newest exchanges within the carry's share of the notebook (TABLE_NOTES_NOTEBOOK_CHARS).
  const kept: string[] = [];
  let used = 0;
  for (let at = rows.length - 1; at >= 0 && used + rows[at].length + 1 <= TABLE_NOTES_NOTEBOOK_CHARS; at--) { kept.unshift(rows[at]); used += rows[at].length + 1; }
  return kept.length ? `${ru ? "Договорились за столом (эта сессия)" : "Agreed at the table (this session)"}:\n${kept.join("\n")}` : "";
}
