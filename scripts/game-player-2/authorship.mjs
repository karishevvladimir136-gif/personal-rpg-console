// Game player 2: the authorship of threads — for every thread of a session (a person, a place, an errand, a question,
// a thing), who brought it into the game first, the game master or the player, and on which turn. One code path for the
// three tables: the session as the player saw it is read back from its transcript (game player 1's transcriptMarkdown,
// the file in docs/runs/game-player-*-transcripts/), so Tables A and B are measured from game player 1's committed
// transcripts exactly as Table C is from this stage's. Two blind Claude Opus 5.5 passes (effort low); the numbers are
// their mean, the gap between them the instrument's spread.
import { jsonIn } from "../game-player-1/welfare.mjs";
import { AUTHORSHIP_RULE, AUTHORSHIP_SYSTEM } from "./frozen.mjs";

export const AUTHORSHIP_MODEL = "claude-opus-5-5";
export const AUTHORSHIP_MAX_TOKENS = 16000;
export const AUTHORSHIP_PASSES = 2;
const SESSION_OVER = "The session is over.";
const clip = (text, max) => { const s = String(text ?? ""); return s.length > max ? `${s.slice(0, max)} …[cut]` : s; };

/** The «Screen» and «Player» blocks of a transcript, in order: [{ kind: "screen" | "player", purpose?, text }]. */
export function transcriptBlocks(markdown) {
  const lines = String(markdown ?? "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let pending = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const screen = /^### Screen \d+\s*$/.test(line);
    const player = line.match(/^\*\*Player\*\* \((.+)\):\s*$/);
    if (screen) pending = { kind: "screen" };
    else if (player) pending = { kind: "player", purpose: player[1] };
    const fence = line.match(/^(`{4,})text\s*$/);
    if (pending && fence) {
      const close = fence[1];
      const body = [];
      for (i++; i < lines.length && lines[i] !== close; i++) body.push(lines[i]);
      blocks.push({ ...pending, text: body.join("\n") });
      pending = null;
    }
  }
  return blocks;
}

/** A screen without what the app shows beside the story: the hero's records (the sheet the player was given) and the
 * session's frame lines. The place line, the chips and the game master's text stay. */
export function storyOfScreen(text) {
  const out = [];
  let skipping = false;
  for (const line of String(text ?? "").split("\n")) {
    if (/^Your records(?:, changed)?:\s*$/.test(line)) { skipping = true; continue; }
    if (skipping) { if (!line.trim()) skipping = false; continue; }
    if (line.trim() === "The session begins.") continue;
    out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * The session as numbered entries: [{ turn, who: "dm" | "player", ooc, text }]. Turn 0 is the opening; each player
 * turn k is followed by the game master's texts until the next player turn (the card screens of a paused turn and its
 * close). A button press is not an entry; the note and the question after it are not part of the session.
 */
export function sessionEntries(markdown) {
  const entries = [];
  let turn = 0, ooc = false;
  for (const block of transcriptBlocks(markdown)) {
    if (block.kind === "player") {
      const m = block.purpose.match(/^player t(\d+)(?: card \d+)?$/);
      if (!m) { if (/^(?:note|after)$/.test(block.purpose)) break; continue; }
      if (/card/.test(block.purpose)) continue;
      turn = Number(m[1]);
      ooc = /^[\s«"'“]*\?/.test(block.text);
      entries.push({ turn, who: "player", ooc, text: block.text.trim() });
      continue;
    }
    let text = block.text;
    const over = text.indexOf(SESSION_OVER);
    if (over >= 0) text = text.slice(0, over);
    const story = storyOfScreen(text);
    if (!story || /^\(Nothing was sent/.test(story) && story.split("\n").length === 1) { if (over >= 0) break; continue; }
    const dmOoc = /^\[Out of game\]/.test(story) || (ooc && entries.at(-1)?.who === "player");
    entries.push({ turn, who: "dm", ooc: dmOoc, text: story.replace(/^\[Out of game\]\s*/, "") });
    if (over >= 0) break;
  }
  return entries;
}

/** The authorship request over a session's entries. */
export function authorshipRequest(entries) {
  const body = entries.map((e) => `Turn ${e.turn} — ${e.who === "dm" ? "game master" : "player"}${e.ooc ? " (out of game)" : ""}:\n<<<\n${clip(e.text, 6000)}\n>>>`).join("\n\n");
  return { system: AUTHORSHIP_SYSTEM, user: `Rule:\n${AUTHORSHIP_RULE}\n\nThe session:\n\n${body}\n\nAnswer with {"threads":[{"thread":"<a few words>","kind":"person|place|errand|question|thing","turn":<turn>,"by":"dm|player"}]}.` };
}

const KINDS = new Set(["person", "place", "errand", "question", "thing"]);
/** The judge's list, or null when it cannot be read. Threads on a turn the session does not have are dropped. */
export function parseAuthorship(text, lastTurn = Infinity) {
  const v = jsonIn(text);
  if (!v || !Array.isArray(v.threads)) return null;
  return v.threads.filter((t) => t && Number.isInteger(t.turn) && t.turn >= 0 && t.turn <= lastTurn && (t.by === "dm" || t.by === "player"))
    .map((t) => ({ thread: String(t.thread ?? "").slice(0, 120), kind: KINDS.has(t.kind) ? t.kind : "thing", turn: t.turn, by: t.by }));
}

const round = (x, n = 3) => (x === null || x === undefined || !Number.isFinite(x) ? null : Math.round(x * 10 ** n) / 10 ** n);
/** The least-squares slope of y on x; null with fewer than two distinct x. */
export function slope(points) {
  if (points.length < 2) return null;
  const mx = points.reduce((s, p) => s + p.x, 0) / points.length, my = points.reduce((s, p) => s + p.y, 0) / points.length;
  const sxx = points.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  return sxx ? points.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / sxx : null;
}

/** One pass's numbers: threads, the player's share, its slope over turns 1–20, the share in each half. */
export function authorshipNumbers(threads) {
  if (!threads) return null;
  const share = (list) => (list.length ? list.filter((t) => t.by === "player").length / list.length : null);
  const played = threads.filter((t) => t.turn >= 1 && t.turn <= 20);
  const s = slope(played.map((t) => ({ x: t.turn, y: t.by === "player" ? 1 : 0 })));
  return { threads: threads.length, byPlayer: threads.filter((t) => t.by === "player").length, byDm: threads.filter((t) => t.by === "dm").length,
    share: round(share(threads)), slope: round(s, 4), slope19: round(s === null ? null : s * 19),
    firstHalf: round(share(played.filter((t) => t.turn <= 10))), secondHalf: round(share(played.filter((t) => t.turn > 10))),
    byKind: Object.fromEntries([...KINDS].map((k) => [k, { dm: threads.filter((t) => t.kind === k && t.by === "dm").length, player: threads.filter((t) => t.kind === k && t.by === "player").length }])) };
}

/** The session's numbers over its passes: the mean of each number, and the spread (largest minus smallest) of the share. */
export function combinePasses(passes) {
  const ok = passes.filter(Boolean);
  if (!ok.length) return null;
  const mean = (key) => { const v = ok.map((p) => p[key]).filter((x) => Number.isFinite(x)); return v.length ? round(v.reduce((s, x) => s + x, 0) / v.length, 4) : null; };
  const shares = ok.map((p) => p.share).filter((x) => Number.isFinite(x));
  return { passes: ok.length, threads: mean("threads"), byPlayer: mean("byPlayer"), share: mean("share"), slope: mean("slope"), slope19: mean("slope19"),
    firstHalf: mean("firstHalf"), secondHalf: mean("secondHalf"), shareSpread: shares.length > 1 ? round(Math.max(...shares) - Math.min(...shares)) : null };
}

/**
 * Measures one session from its transcript. `ask({ model, system, user, maxTokens, effort, purpose })` is the paid judge
 * call. Returns { entries, passes: [{ threads, numbers }], numbers } (`numbers` null when no pass could be read).
 */
export async function measureAuthorship(markdown, { ask, key, passes = AUTHORSHIP_PASSES }) {
  const entries = sessionEntries(markdown);
  const lastTurn = entries.reduce((m, e) => Math.max(m, e.turn), 0);
  if (!entries.length) return { entries: 0, passes: [], numbers: null };
  const request = authorshipRequest(entries);
  const results = await Promise.all(Array.from({ length: passes }, (_, i) => ask({ model: AUTHORSHIP_MODEL, ...request, maxTokens: AUTHORSHIP_MAX_TOKENS, effort: "low", purpose: `authorship ${key} ${i + 1}` })));
  const read = results.map((r) => {
    if (r.notSent || r.error) return { threads: null, numbers: null, error: r.error ?? "not sent" };
    const threads = parseAuthorship(r.text, lastTurn);
    return { threads, numbers: authorshipNumbers(threads), ...(threads ? {} : { error: "unreadable" }) };
  });
  return { entries: entries.length, lastTurn, passes: read, numbers: combinePasses(read.map((p) => p.numbers)) };
}
