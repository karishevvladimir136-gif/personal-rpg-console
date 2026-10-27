// Game player 1: what the stage measures. Deterministic per message (words, «?» presses, rolls pressed, the session's
// end), and the blind tags — the player's actions (ask, test, lie, cat, goal), the DM's replies (unresolved, plant), the
// session's threads, the Deception checks, the notes — each by two Claude Haiku 5.5 passes and Claude Opus 5.5 on a
// disagreement (the self-talk tagging rule): without a usable referee a tag both passes agree on stands, any other is
// unknown (null). The judges see no model names, no table letter and nothing of the DM's hidden layer.
import {
  DECEPTION_RULE, DECEPTION_SYSTEM, DM_TAGS, JUDGE_SYSTEM, NOTE_SYSTEM, NOTE_TAGS, PLAYER_TAGS, THREADS_RULE, THREADS_SYSTEM,
} from "./frozen.mjs";
import { jsonIn } from "./welfare.mjs";

/** The pre-registered judges, and the stand-in used only when the Anthropic models cannot be reached (the report names
 * which one scored). */
export const JUDGE_MODELS = { label: "Claude Haiku 5.5 twice, Claude Opus 5.5 on a disagreement (pre-registered)", judge: "claude-haiku-5-5", referee: "claude-opus-5-5", judgeEffort: "low", refereeEffort: "low" };
export const STANDIN_JUDGES = { label: "stand-in: GPT-6 Luna twice (effort low), GPT-6 Luna at effort medium on a disagreement — the Anthropic models could not be reached", judge: "gpt-6-luna", referee: "gpt-6-luna", judgeEffort: "low", refereeEffort: "medium", standIn: true };
export const JUDGE_MAX_TOKENS = { judge: 3000, referee: 6000, threads: 8000, threadsReferee: 12000 };

/** Words, with combining marks kept inside a word (self-talk 1's `wordsIn`). */
export const wordsIn = (text) => String(text ?? "").match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}'-]*/gu) ?? [];
export const median = (xs) => { const v = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b); if (!v.length) return null; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const clip = (text, max) => { const s = String(text ?? ""); return s.length > max ? `${s.slice(0, max)} …[cut]` : s; };

// ---- the requests -----------------------------------------------------------------------------------------------------

const rulesOf = (tags) => tags.map((t) => `- ${t.rule}`).join("\n");
const answerOf = (tags) => `{${tags.map((t) => `"${t.id}":0|1`).join(",")},"reason":"<one short sentence>"}`;

/** One player turn: the DM's text before it (context), the player's message, the DM's reply (context). */
export function playerTagRequest({ before, message, reply }) {
  return { system: JUDGE_SYSTEM, user: `Rules:\n${rulesOf(PLAYER_TAGS)}\n\nWhat the game master wrote before (context only):\n<<<\n${clip(before, 6000) || "(nothing: this is the first message of the session)"}\n>>>\n\nThe player's message (tag this):\n<<<\n${message}\n>>>\n\nThe game master's reply (context only):\n<<<\n${clip(reply, 6000)}\n>>>\n\nAnswer with ${answerOf(PLAYER_TAGS)}.` };
}
/** One DM reply, with the player's message that it answers. */
export function dmTagRequest({ message, reply }) {
  return { system: JUDGE_SYSTEM, user: `Rules:\n${rulesOf(DM_TAGS)}\n\nThe player's message (context only):\n<<<\n${message}\n>>>\n\nThe game master's reply (tag this):\n<<<\n${clip(reply, 12000)}\n>>>\n\nAnswer with ${answerOf(DM_TAGS)}.` };
}
export function noteRequest(note) {
  return { system: NOTE_SYSTEM, user: `Rules:\n${rulesOf(NOTE_TAGS)}\n\nThe note:\n<<<\n${note}\n>>>\n\nAnswer with ${answerOf(NOTE_TAGS)}.` };
}
/** The session's threads: the DM's replies numbered by turn, with the scene label of each. */
export function threadsRequest(turns) {
  const body = turns.map((t) => `Turn ${t.turn} (scene ${t.scene ?? "?"}):\n<<<\n${clip(t.reply, 5000)}\n>>>`).join("\n\n");
  return { system: THREADS_SYSTEM, user: `Rule:\n${THREADS_RULE}\n\n${body}\n\nAnswer with {"threads":[{"thread":"<a few words>","opened":<turn>,"paid":<turn>|null,"elsewhere":0|1}]}.` };
}
export function deceptionRequest({ records, message, check }) {
  return { system: DECEPTION_SYSTEM, user: `Rule:\n${DECEPTION_RULE}\n\nThe hero's records the player can see:\n<<<\n${clip(records, 8000)}\n>>>\n\nThe player's message:\n<<<\n${message}\n>>>\n\nThe check the game master called:\n<<<\n${check}\n>>>\n\nAnswer with {"true_statement":0|1,"reason":"<one short sentence>"}.` };
}

export function parseTags(text, tags) {
  const v = jsonIn(text);
  if (!v || !tags.every((t) => [0, 1].includes(v[t.id]))) return null;
  return { ...Object.fromEntries(tags.map((t) => [t.id, v[t.id]])), reason: String(v.reason ?? "").slice(0, 300) };
}
export function parseThreads(text) {
  const v = jsonIn(text);
  if (!v || !Array.isArray(v.threads)) return null;
  return v.threads.filter((t) => t && Number.isInteger(t.opened)).map((t) => ({ thread: String(t.thread ?? "").slice(0, 120), opened: t.opened, paid: Number.isInteger(t.paid) ? t.paid : null, elsewhere: t.elsewhere === 1 ? 1 : 0 }));
}
export function parseDeception(text) {
  const v = jsonIn(text);
  return v && [0, 1].includes(v.true_statement) ? { true_statement: v.true_statement, reason: String(v.reason ?? "").slice(0, 300) } : null;
}

/** Two Haiku passes, the Opus referee on a disagreement; an agreed tag stands without a usable referee, any other is
 * unknown (null). `ask({ model, system, user, maxTokens, effort, purpose })`. */
export async function tagTwice({ ask, request, tags, purpose, maxTokens = JUDGE_MAX_TOKENS, models = JUDGE_MODELS }) {
  const [ra, rb] = await Promise.all([1, 2].map((pass) => ask({ model: models.judge, ...request, maxTokens: maxTokens.judge, effort: models.judgeEffort, purpose: `${purpose} ${pass}` })));
  if (ra.notSent || rb.notSent) return null;
  const a = parseTags(ra.text, tags), b = parseTags(rb.text, tags);
  const agreed = Boolean(a && b && tags.every((t) => a[t.id] === b[t.id]));
  if (agreed) return { a, b, referee: null, final: Object.fromEntries(tags.map((t) => [t.id, a[t.id]])) };
  const r = await ask({ model: models.referee, ...request, maxTokens: maxTokens.referee, effort: models.refereeEffort, purpose: `${purpose} referee` });
  if (r.notSent) return null;
  const referee = parseTags(r.text, tags);
  const final = referee ? Object.fromEntries(tags.map((t) => [t.id, referee[t.id]]))
    : Object.fromEntries(tags.map((t) => [t.id, a && b && a[t.id] === b[t.id] ? a[t.id] : null]));
  return { a, b, referee, final };
}

// ---- deterministic, per session -----------------------------------------------------------------------------------------

/** A session record's player-side numbers that need no judge. */
export function playerCounts(session) {
  const turns = session.turns ?? [];
  const actions = turns.filter((t) => t.kind === "action");
  const questions = turns.filter((t) => t.kind === "question");
  // Fix S4 run 1 (items 11b, 11w): a «?» sent while a card waits goes through (a press with `question`); a message the
  // screen refused while a card waited is a press with `swallowed`, counted beside the «?» column, never as nothing.
  const presses = turns.flatMap((t) => t.presses ?? []);
  const cardQuestions = presses.filter((p) => p.question);
  return {
    turns: turns.length,
    actions: actions.length,
    questions: questions.length + cardQuestions.length,
    questionTexts: [...questions.map((t) => t.message), ...cardQuestions.map((p) => p.text)],
    swallowed: presses.filter((p) => p.swallowed).length,
    // FIX_S4 11w″: in-character prose written at a card (relayed to the DM as the player's proposal), counted apart.
    proseAtCard: presses.filter((p) => p.prose).length,
    rollsPressed: turns.reduce((n, t) => n + (t.presses ?? []).filter((p) => p.button === "Roll the die").length, 0),
    wordsPerAction: median(actions.map((t) => wordsIn(t.message).length)),
    endedEarly: session.ended?.reason === "player" && turns.length < session.plannedTurns,
    ended: session.ended ?? null,
  };
}
/** The DM's numbers that need no judge: words per reply (the final narration the player read). */
export function dmCounts(session) {
  const replies = (session.turns ?? []).filter((t) => t.kind === "action" && typeof t.reply === "string" && t.reply);
  return { replies: replies.length, medianWords: median(replies.map((t) => wordsIn(t.reply).length)), scenes: new Set(replies.map((t) => t.scene ?? null)).size };
}
