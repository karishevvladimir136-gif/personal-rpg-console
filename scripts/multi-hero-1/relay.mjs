// Multi-hero 1: the DM's relay — one screen per player (PARTY_1's relay.mjs), with the stage's item 4: the other players'
// speech and actions are retold, never quoted; the screens are written in the round's own order; and the relay says who
// is waiting (asleep, unconscious, or waiting for something named) at the end of the scene, so that character is not
// asked the next round. A screen that copies a run of 8 words from another player's message of the round is asked for
// once more (A4's check, before the screens reach anyone); both counts are kept.
import { jsonIn } from "../game-player-1/welfare.mjs";
import { mergeGroups, roundGroups } from "../game-party-1/relay.mjs";
import { RELAY, RELAY_AGAIN, RELAY_RULES, RELAY_SYSTEM, RELAY_WAITING, SHINGLE } from "./frozen.mjs";

export { mergeGroups, roundGroups };
const block = (text) => `<<<\n${String(text ?? "").trim()}\n>>>`;

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
  const v = jsonIn(text);
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

/**
 * One relay: asked once, again on an unreadable reply (never after a refusal), and again once when its screens copy a
 * player's words (A4). Returns { screens, together, places, waiting, missing, extra, attempts, fallback, copied, copiedAfter, … }.
 */
export async function relay({ ask, names, scene, forNames, messages = [], narration, already, opening = false, purpose }) {
  const request = relayRequest({ names, scene, forNames, messages, narration, already, opening });
  let attempts = 0, last = null, parsed = null;
  while (attempts < 2 && !parsed) {
    attempts++;
    last = await ask({ model: RELAY.model, ...request, maxTokens: RELAY.maxTokens, effort: RELAY.effort, purpose: `${purpose}${attempts > 1 ? " (asked again)" : ""}` });
    if (last.notSent) return { notSent: true, error: last.error ?? "not sent", attempts, request };
    if (last.stopReason === "refusal") return { refusal: true, error: "refusal", attempts, request };
    if (!last.error) parsed = parseRelay(last.text, { names, scene, forNames });
  }
  if (!parsed) return { screens: Object.fromEntries(forNames.map((n) => [n, String(narration ?? "").trim()])), together: [scene], places: {}, waiting: {}, missing: [], extra: [], attempts, fallback: true,
    copied: [], copiedAfter: [], error: last?.error ?? "unreadable", request };
  const copied = copiedRuns(parsed.screens, messages);
  if (!copied.length) return { ...parsed, attempts, fallback: false, copied, copiedAfter: [], request };
  // A4: once more, with the runs named; the second answer stands when it reads.
  const again = { system: request.system, user: `${request.user}\n\n${RELAY_AGAIN}\n${copied.map((h) => `- ${h.screen}'s screen copies ${h.from}'s words: «${h.run}»`).join("\n")}` };
  const second = await ask({ model: RELAY.model, ...again, maxTokens: RELAY.maxTokens, effort: RELAY.effort, purpose: `${purpose} (retold)` });
  attempts++;
  if (second.notSent) return { notSent: true, error: second.error ?? "not sent", attempts, request };
  if (second.stopReason === "refusal") return { refusal: true, error: "refusal", attempts, request };
  const retold = second.error ? null : parseRelay(second.text, { names, scene, forNames });
  const final = retold ?? parsed;
  return { ...final, attempts, fallback: false, copied, copiedAfter: copiedRuns(final.screens, messages), retold: Boolean(retold), request };
}
