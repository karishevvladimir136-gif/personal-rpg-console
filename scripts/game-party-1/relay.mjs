// Game party 1: the DM's relay — one screen per player. The app's DM narrates a round of one scene once, for every
// character in it; the relay is the same DM (the owner's writer model) writing, from that narration and the round's
// messages, what each character asked for perceives — their own screen: first what the others in the scene did and said
// (table talk reaches the others only this way, as the DM relays it), then the narration — and who is with whom at the
// end. It sees the players' messages and the narration (both public at the table) and nothing of the DM's private notes,
// so it cannot reveal them; what it must not do is give one character what only another perceived (RELAY_RULES), which
// the record's leak check reads after the table. A reply it cannot read is asked once more (never after a refusal); a second unreadable reply falls back to the
// narration as written for every character asked (marked, and counted against Q0).
import { jsonIn } from "../game-player-1/welfare.mjs";
import { RELAY, RELAY_RULES, RELAY_SYSTEM } from "./frozen.mjs";

const block = (text) => `<<<\n${String(text ?? "").trim()}\n>>>`;

/**
 * The relay's request. `names`: every character still at the table; `scene`: the characters in this scene; `forNames`:
 * the screens to write; `messages`: [{ name, text }] what each wrote this round (empty for a card's text so far);
 * `already`: { name: text } what a character has already read of this narration (its card screen) — for that one, only
 * what follows. `opening`: the narration is the session's opening.
 */
export function relayRequest({ names, scene, forNames, messages = [], narration, already = {}, opening = false }) {
  const elsewhere = names.filter((n) => !scene.includes(n));
  const lines = [
    `Characters at the table: ${names.join(", ")}.`,
    `In this scene: ${scene.join(", ")}.${elsewhere.length ? ` (${elsewhere.join(", ")} ${elsewhere.length > 1 ? "were" : "was"} elsewhere at the start of this round, in a scene of their own.)` : ""}`,
    `Write the screens of: ${forNames.join(", ")}.`,
    "",
  ];
  if (opening) lines.push("This is the opening of the session, which you wrote before anyone played.", "");
  else if (messages.length) lines.push("What the players wrote for this round (each paragraph is that character's):", block(messages.map((m) => `${m.name}: ${m.text}`).join("\n\n")), "");
  lines.push(opening ? "Your opening narration:" : "Your narration:", block(narration), "");
  for (const [name, text] of Object.entries(already)) if (text && forNames.includes(name)) lines.push(`${name} has already read this part of their screen; for ${name}, write only what follows it:`, block(text), "");
  lines.push("The rules:", ...RELAY_RULES.map((r) => `- ${r}`), "",
    "Then say who is where at the end of it: group the characters who are together (can see and hear each other) — every character in this scene in exactly one group; a character from elsewhere who, by your narration, is now with them joins their group — and name each one's place in a few words.",
    "", `Answer with {"screens": {${forNames.map((n) => `"${n}": "…"`).join(", ")}}, "together": [["name", …], …], "places": {"name": "place", …}}.`);
  return { system: RELAY_SYSTEM, user: lines.join("\n") };
}

/** The relay's reply, read: screens only for the characters asked (a missing one is empty and listed), groups and places
 * only of known names. Null when it is not a reply at all. */
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
  // Each scene character in exactly one group: the first group that names it keeps it.
  const seen = new Set();
  const groups = together.map((g) => g.filter((n) => (seen.has(n) ? false : (seen.add(n), true)))).filter((g) => g.length);
  // The scene's characters the reply did not group stay together, as they were.
  const unplaced = scene.filter((name) => !seen.has(name));
  if (unplaced.length) groups.push(unplaced);
  const places = Object.fromEntries(Object.entries(v.places && typeof v.places === "object" ? v.places : {}).filter(([n, p]) => known.has(n) && typeof p === "string").map(([n, p]) => [n, p.trim().slice(0, 160)]));
  return { screens, together: groups, places, missing, extra };
}

/**
 * One relay. `ask({ model, system, user, maxTokens, effort, purpose })` makes the paid call (the DM's metering context).
 * Returns { screens, together, places, missing, extra, attempts, fallback, error, refusal, notSent, request }.
 */
export async function relay({ ask, names, scene, forNames, messages, narration, already, opening = false, purpose }) {
  const request = relayRequest({ names, scene, forNames, messages, narration, already, opening });
  let attempts = 0, last = null;
  while (attempts < 2) {
    attempts++;
    last = await ask({ model: RELAY.model, ...request, maxTokens: RELAY.maxTokens, effort: RELAY.effort, purpose: `${purpose}${attempts > 1 ? " (asked again)" : ""}` });
    if (last.notSent) return { notSent: true, error: last.error ?? "not sent", attempts, request };
    if (last.stopReason === "refusal") return { refusal: true, error: "refusal", attempts, request };
    if (last.error) continue;
    const parsed = parseRelay(last.text, { names, scene, forNames });
    if (parsed) return { ...parsed, attempts, fallback: false, request };
  }
  // Unreadable twice: the narration as written, for every character asked (marked).
  return { screens: Object.fromEntries(forNames.map((n) => [n, String(narration ?? "").trim()])), together: [scene], places: {}, missing: [], extra: [], attempts, fallback: true, error: last?.error ?? "unreadable", request };
}

/** The table's groups after a scene's relay: the relay's groups for the names it grouped; everyone else keeps theirs. */
export function mergeGroups(groups, relayed, active) {
  const live = new Set(active);
  const covered = new Set(relayed.flat());
  const kept = groups.map((g) => g.filter((n) => live.has(n) && !covered.has(n))).filter((g) => g.length);
  const fresh = relayed.map((g) => g.filter((n) => live.has(n))).filter((g) => g.length);
  const all = [...fresh, ...kept];
  const placed = new Set(all.flat());
  for (const n of active) if (!placed.has(n)) all.push([n]);
  return all;
}

/**
 * The table's groups after a round, from every scene's relay of that round: two characters are together when any relay
 * put them in one group (so a character who walked into another scene joins it whichever scene was played first); a
 * character no relay of the round grouped keeps its earlier company among the others no relay grouped; the departed drop
 * out.
 */
export function roundGroups(groups, relayedList, active) {
  const live = new Set(active);
  const parent = new Map(active.map((n) => [n, n]));
  const find = (n) => { while (parent.get(n) !== n) { parent.set(n, parent.get(parent.get(n))); n = parent.get(n); } return n; };
  const join = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(rb, ra); };
  const covered = new Set();
  for (const groupsOfScene of relayedList) for (const g of groupsOfScene ?? []) {
    const members = g.filter((n) => live.has(n));
    members.forEach((n) => covered.add(n));
    for (const n of members.slice(1)) join(members[0], n);
  }
  for (const g of groups) {
    const kept = g.filter((n) => live.has(n) && !covered.has(n));
    for (const n of kept.slice(1)) join(kept[0], n);
  }
  const out = new Map();
  for (const n of active) { const r = find(n); if (!out.has(r)) out.set(r, []); out.get(r).push(n); }
  return [...out.values()];
}
