// Multi-hero 1: the DM's relay — one screen per player (PARTY_1's relay.mjs), with the stage's item 4: the other players'
// speech and actions are retold, never quoted; the screens are written in the round's own order; and the relay says who
// is waiting (asleep, unconscious, or waiting for something named) at the end of the scene, so that character is not
// asked the next round. Fix A4 (the amendment of 2026-10-29 02:30 LA): after the relay's pass, a screen that copies a run of
// 8 words from another player's message of the round is sent back once, alone, with the runs marked; it is accepted only
// when no run remains; the amendment of 2026-10-29 18:10 LA: a screen that still copies goes back once more, and what
// remains after that second pass is logged as a defect (before the screens reach anyone).
import { jsonIn } from "../game-player-1/welfare.mjs";
import { mergeGroups, roundGroups } from "../game-party-1/relay.mjs";
import { RELAY, RELAY_ALONE, RELAY_MARKS, RELAY_MISSING, RELAY_PASSES, RELAY_RESEND, RELAY_RULES, RELAY_SYSTEM, RELAY_WAITING, SHINGLE } from "./frozen.mjs";

export { mergeGroups, roundGroups };
const block = (text) => `<<<\n${String(text ?? "").trim()}\n>>>`;

/** Game party 2 (the Haiku dry run of 2026-11-01: two relay answers in a row could not be read, and the table fell back to
 * the DM's narration, verbatim, on every screen): the reply read as JSON, and when it is not, read again after the two
 * slips long multi-paragraph answers make — a raw line break (or tab) inside a string, and a double quote inside a string
 * left unescaped (a quote is taken as closing its string only when the next non-blank character is , } ] or :). */
export function jsonLoose(text) {
  const strict = jsonIn(text);
  if (strict) return strict;
  const s = String(text ?? "");
  const from = s.indexOf("{"), to = s.lastIndexOf("}");
  if (from < 0 || to <= from) return null;
  const body = s.slice(from, to + 1);
  let out = "", inString = false;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (!inString) { out += c; if (c === '"') inString = true; continue; }
    if (c === "\\") { out += c + (body[i + 1] ?? ""); i++; continue; }
    if (c === "\n") { out += "\\n"; continue; }
    if (c === "\r") { continue; }
    if (c === "\t") { out += "\\t"; continue; }
    if (c === '"') {
      let j = i + 1;
      while (j < body.length && /\s/.test(body[j])) j++;
      if (j >= body.length || [",", "}", "]", ":"].includes(body[j])) { out += c; inString = false; }
      else out += '\\"';
      continue;
    }
    out += c;
  }
  try { return JSON.parse(out); } catch { return null; }
}

/** Game party 2 (the owner's decision after S1-none-T1): the DM's out-of-game asides — a paragraph that opens «(Out of game:
 * …)», «*(Out of game: …)*» or «Out of game: …» (OOC alike), or such a parenthesis inside a paragraph — taken out of a text;
 * returns { text, asides } (the asides as written, for the record). Text with no aside comes back unchanged. */
const ASIDE_PARAGRAPH = /^\s*[*_]*\(?\s*(?:out[\s-]of[\s-]game|ooc)\b/i;
const ASIDE_INLINE = /\s*[*_]*\(\s*(?:out[\s-]of[\s-]game|ooc)\b[^()]*(?:\([^()]*\)[^()]*)*\)[*_]*/gi;
export function withoutAsides(text) {
  const source = String(text ?? "");
  const asides = [];
  const kept = [];
  for (const paragraph of source.split(/\n{2,}/)) {
    if (ASIDE_PARAGRAPH.test(paragraph)) { asides.push(paragraph.trim()); continue; }
    kept.push(paragraph.replace(ASIDE_INLINE, (m) => { asides.push(m.trim()); return ""; }));
  }
  if (!asides.length) return { text: source, asides };
  return { text: kept.filter((p) => p.trim()).join("\n\n").replace(/[ \t]+\n/g, "\n").trim(), asides };
}

/** The relay's request; `forNames` and `messages` come in the round's order. */
export function relayRequest({ names, scene, forNames, messages = [], narration, already = {}, opening = false }) {
  const elsewhere = names.filter((n) => !scene.includes(n));
  const lines = [
    `Characters at the table: ${names.join(", ")}.`,
    `In this scene: ${scene.join(", ")}.${elsewhere.length ? ` (${elsewhere.join(", ")} ${elsewhere.length > 1 ? "were" : "was"} elsewhere at the start of this round, in a scene of their own.)` : ""}`,
    `Write the screens of, in this order: ${forNames.join(", ")}.`,
    "",
  ];
  if (opening) lines.push("This is the opening of the session, which you wrote before anyone played.", "");
  else if (messages.length) lines.push("What the players wrote for this round, in the round's order (each paragraph is that character's):", block(messages.map((m) => `${m.name}: ${m.text}`).join("\n\n")), "");
  lines.push(opening ? "Your opening narration:" : "Your narration:", block(narration), "");
  for (const [name, text] of Object.entries(already)) if (text && forNames.includes(name)) lines.push(`${name} has already read this part of their screen; for ${name}, write only what follows it:`, block(text), "");
  lines.push("The rules:", ...RELAY_RULES.map((r) => `- ${r}`), "",
    "Then say who is where at the end of it: group the characters who are together (can see and hear each other) — every character in this scene in exactly one group; a character from elsewhere who, by your narration, is now with them joins their group — and name each one's place in a few words.",
    RELAY_WAITING,
    "", `Answer with {"screens": {${forNames.map((n) => `"${n}": "…"`).join(", ")}}, "together": [["name", …], …], "places": {"name": "place", …}, "waiting": {"name": "asleep / unconscious / waiting for … — until …", …}}.`);
  return { system: RELAY_SYSTEM, user: lines.join("\n") };
}

/** The reply, read (PARTY_1's reading, and the waiting marks of the scene's own characters). */
export function parseRelay(text, { names, scene, forNames }) {
  const v = jsonLoose(text);
  if (!v || typeof v !== "object" || !v.screens || typeof v.screens !== "object") return null;
  const known = new Set(names);
  const screens = {}, missing = [];
  for (const name of forNames) {
    const value = v.screens[name];
    if (typeof value === "string") screens[name] = value.trim();
    else { screens[name] = ""; missing.push(name); }
  }
  const extra = Object.keys(v.screens).filter((name) => !forNames.includes(name));
  const together = Array.isArray(v.together) ? v.together.filter(Array.isArray).map((g) => [...new Set(g.filter((n) => typeof n === "string" && known.has(n)))]).filter((g) => g.length) : [];
  const seen = new Set();
  const groups = together.map((g) => g.filter((n) => (seen.has(n) ? false : (seen.add(n), true)))).filter((g) => g.length);
  const unplaced = scene.filter((name) => !seen.has(name));
  if (unplaced.length) groups.push(unplaced);
  const places = Object.fromEntries(Object.entries(v.places && typeof v.places === "object" ? v.places : {}).filter(([n, p]) => known.has(n) && typeof p === "string").map(([n, p]) => [n, p.trim().slice(0, 160)]));
  const waiting = Object.fromEntries(Object.entries(v.waiting && typeof v.waiting === "object" && !Array.isArray(v.waiting) ? v.waiting : {})
    .filter(([n, why]) => scene.includes(n) && typeof why === "string" && why.trim()).map(([n, why]) => [n, why.trim().slice(0, 160)]));
  return { screens, together: groups, places, waiting, missing, extra };
}

const words = (text) => String(text ?? "").toLowerCase().replace(/[’‘]/g, "'").split(/[^\p{L}\p{N}']+/u).filter(Boolean);
const shingles = (text, n = SHINGLE) => { const w = words(text); const out = new Set(); for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(" ")); return out; };
/** A4: the runs of 8 words a screen shares with another player's message of the round — [{ screen, from, run }]. */
export function copiedRuns(screens, messages) {
  const hits = [];
  for (const [reader, text] of Object.entries(screens ?? {})) {
    if (!text) continue;
    const shown = shingles(text);
    for (const m of messages) {
      // A player's own words only (a harness line — waiting, gone — is no one's speech).
      if (m.name === reader || m.own === false) continue;
      for (const run of shingles(m.text)) if (shown.has(run)) { hits.push({ screen: reader, from: m.name, run }); break; }
    }
  }
  return hits;
}

/** A screen with its copied runs marked: every stretch of words inside a run of `SHINGLE` shared with `runs`, between
 * the marks (overlapping runs make one stretch). */
export function markRuns(text, runs) {
  const set = new Set(runs);
  const tokens = [...String(text ?? "").matchAll(/[\p{L}\p{N}'’‘]+/gu)].map((m) => ({ at: m.index, end: m.index + m[0].length, word: m[0].toLowerCase().replace(/[’‘]/g, "'") }));
  const inside = new Array(tokens.length).fill(false);
  for (let i = 0; i + SHINGLE <= tokens.length; i++) if (set.has(tokens.slice(i, i + SHINGLE).map((t) => t.word).join(" "))) for (let k = i; k < i + SHINGLE; k++) inside[k] = true;
  let out = "", from = 0;
  for (let i = 0; i < tokens.length; i++) {
    if (!inside[i] || (i > 0 && inside[i - 1])) continue;
    let j = i;
    while (j + 1 < tokens.length && inside[j + 1]) j++;
    out += `${text.slice(from, tokens[i].at)}${RELAY_MARKS[0]}${text.slice(tokens[i].at, tokens[j].end)}${RELAY_MARKS[1]}`;
    from = tokens[j].end;
  }
  return out + String(text ?? "").slice(from);
}
/** Every run of `SHINGLE` words a screen shares with the other players' messages (all of them, not one per message). */
function runsIn(text, reader, messages) {
  const shown = shingles(text);
  const out = [];
  for (const m of messages) {
    if (m.name === reader || m.own === false) continue;
    for (const run of shingles(m.text)) if (shown.has(run)) out.push({ screen: reader, from: m.name, run });
  }
  return out;
}
const screenOf = (text) => { const v = jsonLoose(text); return v && typeof v.screen === "string" && v.screen.trim() ? v.screen.trim() : null; };

/**
 * One relay: asked once, again on an unreadable reply (never after a refusal); then fix A4's check — each screen that
 * copies a player's words is sent back alone, with its runs marked, up to `RELAY_PASSES` times (the same message each
 * time, the runs that remain marked), and accepted only when no run remains (else the screen that copies least goes out
 * and the copy is logged as a defect). Returns { screens, together, places, waiting, missing, extra, attempts, fallback,
 * copied, copiedAfter, resent: [{ screen, runsBefore, perPass, runsAfter, passes, accepted, unreadable }], defects,
 * retold, … }.
 */
export async function relay({ ask, names, scene, forNames, messages = [], narration, already, opening = false, purpose }) {
  const request = relayRequest({ names, scene, forNames, messages, narration, already, opening });
  let attempts = 0, last = null, parsed = null;
  const unreadable = [];
  while (attempts < 2 && !parsed) {
    attempts++;
    last = await ask({ model: RELAY.model, ...request, maxTokens: RELAY.maxTokens, effort: RELAY.effort, purpose: `${purpose}${attempts > 1 ? " (asked again)" : ""}` });
    if (last.notSent) return { notSent: true, error: last.error ?? "not sent", attempts, request };
    if (last.stopReason === "refusal") return { refusal: true, error: "refusal", attempts, request };
    if (!last.error) parsed = parseRelay(last.text, { names, scene, forNames });
    if (!parsed) unreadable.push({ attempt: attempts, error: last.error ?? null, stopReason: last.stopReason ?? null, chars: String(last.text ?? "").length, text: String(last.text ?? "").slice(0, 6000) });
  }
  let perScreen = false;
  if (!parsed) {
    // Game party 2: never the DM's narration verbatim on every screen (it quotes the players and shows each character what
    // only another perceives). Each screen asked alone, as plain text; a screen that still does not come is a harness
    // line, never the narration.
    perScreen = true;
    const screens = {};
    for (const name of forNames) {
      const answer = await ask({ model: RELAY.model, system: request.system, user: `${request.user}\n\n${RELAY_ALONE(name)}`, maxTokens: RELAY.maxTokens, effort: RELAY.effort, purpose: `${purpose} (${name.split(" ")[0]}'s screen alone)` });
      attempts++;
      if (answer.notSent) return { notSent: true, error: answer.error ?? "not sent", attempts, request };
      if (answer.stopReason === "refusal") return { refusal: true, error: "refusal", attempts, request };
      const text = answer.error ? "" : String(answer.text ?? "").trim().replace(/^```[a-z]*\n?|\n?```$/g, "").trim();
      screens[name] = text || RELAY_MISSING;
      if (!text) unreadable.push({ attempt: attempts, screen: name, error: answer.error ?? "empty", chars: 0, text: "" });
    }
    parsed = { screens, together: [scene], places: {}, waiting: {}, missing: [], extra: [] };
  }
  const copied = copiedRuns(parsed.screens, messages);
  const screens = { ...parsed.screens };
  const resent = [], defects = [];
  // Fix A4: each copying screen, alone, with its runs marked — once, and once more while runs remain (18:10).
  for (const name of forNames) {
    const before = runsIn(screens[name], name, messages);
    if (!before.length) continue;
    let current = before, unreadable = false;
    const perPass = [];
    while (current.length && perPass.length < RELAY_PASSES) {
      const marked = markRuns(screens[name], current.map((h) => h.run));
      const answer = await ask({ model: RELAY.model, system: request.system, user: `${request.user}\n\n${RELAY_RESEND(name)}\n\n<<<\n${marked}\n>>>`, maxTokens: RELAY.maxTokens, effort: RELAY.effort,
        purpose: `${purpose} (${name.split(" ")[0]}'s screen, retold${perPass.length ? `, pass ${perPass.length + 1}` : ""})` });
      attempts++;
      if (answer.notSent) return { notSent: true, error: answer.error ?? "not sent", attempts, request };
      const again = answer.error || answer.stopReason === "refusal" ? null : screenOf(answer.text);
      if (again === null) { unreadable = true; perPass.push(null); continue; }
      const runs = runsIn(again, name, messages);
      perPass.push(runs.length);
      // The screen that copies least goes out.
      if (runs.length <= current.length) { screens[name] = again; current = runs; }
    }
    const accepted = current.length === 0;
    // A defect per copied message (as `copiedRuns` counts), with how many runs of it remain.
    const kept = accepted ? [] : copiedRuns({ [name]: screens[name] }, messages).map((h) => ({ ...h, runs: current.filter((x) => x.from === h.from).length }));
    resent.push({ screen: name, runsBefore: before.length, perPass, runsAfter: current.length, passes: perPass.length, accepted, unreadable });
    defects.push(...kept);
  }
  return { ...parsed, screens, attempts, fallback: perScreen, perScreen, unreadable, copied, copiedAfter: copiedRuns(screens, messages), resent, defects, retold: resent.some((r) => r.accepted), request };
}
