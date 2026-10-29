// Blind decisions 1: from a session record to its decision strip. The record's own facts first (the machine rules in
// frozen.mjs), then the blind tagger's codes for what the record does not hold, validated against the closed lists and
// merged over its passes; the strip is printed from codes alone, and every line is checked against the vocabulary's
// grammar before it is written, so nothing of the player's prose can pass into it.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { jsonIn } from "../game-player-1/welfare.mjs";
import {
  ACTS, BUTTON_CODES, CLIP, COIN_UNITS, DOMAINS, FACT_MOVES, FORKS, HERO_BRIEFS, MODEL_FAMILY, OOC_KINDS, PLACE_CLASSES, PLACE_RULE, PLACE_SYSTEM, PROFILE, SOURCES,
  TAGGER_ANSWER, TAGGER_RULES, TAGGER_SYSTEM, THEFT, coinBucket,
} from "./frozen.mjs";

const clipEnd = (text, max) => { const s = String(text ?? ""); return s.length > max ? `[…] ${s.slice(-max)}` : s; };
const clip = (text, max) => { const s = String(text ?? ""); return s.length > max ? `${s.slice(0, max)} […]` : s; };
const sha = (text) => createHash("sha256").update(text).digest("hex");

// ---- the sessions ----------------------------------------------------------------------------------------------------------

export const playerOf = (key) => String(key).split("-")[1];
export const familyOf = (key) => MODEL_FAMILY[playerOf(key)];
const readSource = (root, source) => (source.git ? execFileSync("git", ["show", `${source.git}:${source.path}`], { cwd: root, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }) : readFileSync(join(root, source.path), "utf8"));
/** The hero's brief: the first fenced block under its heading. */
export function heroBrief(root, hero) {
  const source = HERO_BRIEFS[hero];
  if (!source) throw new Error(`no brief for the hero ${hero}`);
  const text = readSource(root, source), at = text.indexOf(source.heading);
  const block = at < 0 ? null : text.slice(at).match(/```[a-z]*\n([\s\S]*?)\n```/);
  if (!block) throw new Error(`${source.path}: no «${source.heading}» block`);
  return block[1].trim();
}
/** The sessions in SOURCES order, each with its group, its id (`group:key`), the hero's name and where it was read from. */
export function loadSessions(root) {
  const out = [];
  for (const source of SOURCES) {
    const text = readSource(root, source);
    const value = JSON.parse(text);
    const records = source.copied ? value.sessions.map((s) => s.record) : value.sessions;
    for (const key of source.keys) {
      const record = records.find((s) => s.key === key && s.turns?.length);
      if (!record) throw new Error(`${source.path}: no finished session ${key}`);
      const hero = String(record.opening?.records ?? "").split(" — ")[0].trim();
      out.push({ id: `${source.group}:${key}`, group: source.group, key, table: record.table, player: playerOf(key), family: familyOf(key), hero, brief: heroBrief(root, hero), record,
        from: { path: source.path, ...(source.git ? { commit: source.git, ref: source.ref } : {}), sha256: sha(text) } });
    }
  }
  return out;
}

// ---- the machine rules ---------------------------------------------------------------------------------------------------------

const indexOf = (record, k) => record.messages.findIndex((m) => m.purpose === `player t${k}`);
const cardIndexes = (record, k) => record.messages.map((m, i) => (new RegExp(`^player t${k} card \\d+$`).test(m.purpose) ? i : -1)).filter((i) => i >= 0);
export const destinationOf = (summary) => String(summary).match(/^Travel: (.+?)(?: \([^()]*\))?$/)?.[1]?.trim() ?? null;
/** The destinations the party moved to, over every session (names only — the DM's, never the player's). */
export const destinations = (sessions) => [...new Set(sessions.flatMap((s) => s.record.turns.flatMap((t) => (t.changes ?? []).filter((c) => c.tool === "move_party").map((c) => destinationOf(c.summary)).filter(Boolean))))].sort();

const coinOn = (head) => {
  let gp = 0;
  for (const [, n, unit] of head.matchAll(/(\d+(?:\.\d+)?)\s*([a-z]+)/gi)) {
    const rate = COIN_UNITS[unit.toLowerCase()];
    if (rate !== undefined) gp += Number(n) * rate;
  }
  return Math.round(gp * 100) / 100; // to the copper
};
/** Gold pieces out of the purse on one money line («−3 silver → Tamsin», «−2 gp (…)»); null for anything else (income, coin
 * left in a room, a transfer between others, coin a thief took). */
export function coinOut(summary) {
  const s = String(summary ?? "").trim();
  if (!/^[−-]\s*\d/.test(s) || THEFT.test(s)) return null;
  const gp = coinOn(s.split(/→|\(/)[0]);
  return gp > 0 ? gp : null;
}
/** Gold pieces given back as change on one money line («+8 sps (Change from the gold piece …)»); 0 for anything else. */
export function changeBack(summary) {
  const s = String(summary ?? "").trim();
  return /^\+\s*\d/.test(s) && /\bchange\b/i.test(s) ? coinOn(s.split(/→|\(/)[0]) : 0;
}
/** A resource line's drop: «… Pact slots (…): 2 → 1/2 (…)» → { what, from, to }. */
export function resourceDrop(summary) {
  const m = String(summary ?? "").match(/^(.*?):\s*(\d+)\s*→\s*(\d+)\s*\//);
  if (!m || Number(m[3]) >= Number(m[2])) return null;
  const what = /pact slot/i.test(m[1]) ? "slot" : /healing light/i.test(m[1]) ? "heal" : /inspiration/i.test(m[1]) ? "inspiration" : null;
  return what ? { what, from: Number(m[2]), to: Number(m[3]) } : null;
}
export const buttonCode = (press) => {
  if (!press?.button) return "text";
  return BUTTON_CODES.find(([re]) => re.test(press.button))?.[1] ?? "text";
};
/** At a roll card: the hero's own revealed miss with the reroll button offered. */
export function rerollOffer(screen, hero) {
  const s = String(screen ?? "");
  const at = s.lastIndexOf("[Roll card]");
  if (at < 0 || !s.includes("[Request an allowed reroll")) return false;
  const card = s.slice(at);
  const actor = card.match(/^\[Roll card\] ([^·\n]+?) ·/)?.[1]?.trim();
  return actor === hero && /\n(Failure|A natural one)\b/.test(card);
}

/** One turn's codes from the record alone: acts (MOVE, SPEND, CAST(slot), WAIT, OOC, PRESS, DECLINE(reroll)) and the
 * reroll forks; what the tagger must see (its text) beside. */
export function machineTurn(session, turn, places) {
  const { record, hero } = session;
  const acts = new Set(), forks = [], unclassified = [];
  let coinOutGp = 0, coinBackGp = 0;
  for (const change of turn.changes ?? []) {
    if (change.tool === "move_party") {
      const name = destinationOf(change.summary);
      const cls = places[name];
      if (PLACE_CLASSES.includes(cls)) acts.add(`MOVE(${cls})`); else unclassified.push(name);
    } else if (change.tool === "money") {
      coinOutGp += coinOut(change.summary) ?? 0;
      coinBackGp += changeBack(change.summary);
    } else if (change.tool === "resource") {
      const drop = resourceDrop(change.summary);
      if (drop?.what === "slot") acts.add("CAST(slot)");
      else if (drop) acts.add(`SPEND(${drop.what})`);
    } else if (change.tool === "rest") acts.add("WAIT");
  }
  const coinSpent = coinOutGp - coinBackGp > 1e-9;
  if (coinSpent) acts.add(`SPEND(${coinBucket(coinOutGp - coinBackGp)})`);
  for (const press of turn.presses ?? []) {
    const code = buttonCode(press);
    acts.add(`PRESS(${code})`);
    if (code === "reroll") acts.add("SPEND(reroll)");
  }
  for (const i of cardIndexes(record, turn.k)) {
    if (!rerollOffer(record.screens[i], hero)) continue;
    const text = String(record.messages[i]?.text ?? "");
    const choice = /^\[Request an allowed reroll/.test(text) ? "reroll" : /^\[Onward\]/.test(text) ? "keep" : null;
    if (!choice) continue;
    forks.push({ fork: "reroll", choice });
    if (choice === "keep") acts.add("DECLINE(reroll)");
  }
  const ooc = turn.kind === "question" || (turn.presses ?? []).some((p) => !p.button && /^\s*\?/.test(String(p.text ?? "")));
  const at = indexOf(record, turn.k);
  const cardText = (turn.presses ?? []).filter((p) => !p.button && String(p.text ?? "").trim()).map((p) => String(p.text)).join("\n\n");
  return {
    acts: [...acts], forks, ooc, coinSpent, unclassified,
    // What the tagger reads: the screen before the turn, the player's message, anything written at a card, the reply.
    text: turn.kind === "empty" || !String(turn.message ?? "").trim() ? null : { screen: at >= 0 ? record.screens[at] : "", message: turn.message, card: cardText, reply: turn.reply ?? "" },
  };
}

// ---- the blind tagger ----------------------------------------------------------------------------------------------------------

export function tagRequest(text, brief) {
  const card = text.card ? `\n\nWhat the player wrote at a roll card during this turn (part of the turn):\n<<<\n${clip(text.card, CLIP.card)}\n>>>` : "";
  return { system: TAGGER_SYSTEM, user: `${TAGGER_RULES}\n\nThe hero's brief, as the player was given it before play (established; context only):\n<<<\n${brief}\n>>>\n\nThe screen the player saw before this turn (the game master's text; context, and where forks are shown):\n<<<\n${clipEnd(text.screen, CLIP.screen) || "(the session's first screen)"}\n>>>\n\nThe player's message this turn (code this):\n<<<\n${clip(text.message, CLIP.message)}\n>>>${card}\n\nThe game master's reply (context only — code the player's choice, not the outcome):\n<<<\n${clip(text.reply, CLIP.reply)}\n>>>\n\nAnswer with JSON only, in this shape: ${TAGGER_ANSWER}` };
}

const TAGGER_ACT_ARGS = Object.fromEntries(ACTS.filter((a) => a.by !== "machine" && !["DISCOVER", "PROPOSE", "ASSERT", "ENFORCE", "OOC"].includes(a.code))
  .map((a) => [a.code, a.code === "DECLINE" ? [["offer", "fight", "card"]] : a.code === "CAST" ? [["cantrip"]] : a.code === "WAIT" ? [] : a.args]));
/** One act string from the tagger, normalised, or null when it is not in the tagger's closed list. */
export function taggerAct(raw) {
  const m = String(raw ?? "").trim().match(/^([A-Za-z]+)\s*(?:\(([^()]*)\))?$/);
  if (!m) return null;
  const code = m[1].toUpperCase(), lists = TAGGER_ACT_ARGS[code];
  if (!lists) return null;
  const args = m[2] === undefined || m[2].trim() === "" ? [] : m[2].split(",").map((a) => a.trim().toLowerCase());
  if (args.length !== lists.length || args.some((a, i) => !lists[i].includes(a))) return null;
  return args.length ? `${code}(${args.join(",")})` : code;
}
/** The tagger's answer, validated: { acts, facts, ooc, forks, dropped } or null when it is not usable JSON of the shape. */
export function parseTag(text) {
  const v = jsonIn(text);
  if (!v || typeof v !== "object" || !Array.isArray(v.acts ?? []) || typeof (v.forks ?? {}) !== "object") return null;
  let dropped = 0;
  const acts = [...new Set((v.acts ?? []).map((a) => { const act = taggerAct(a); if (!act) dropped++; return act; }).filter(Boolean))].sort();
  const facts = (Array.isArray(v.facts) ? v.facts : []).map((f) => {
    const ok = f && FACT_MOVES.includes(String(f.move).toLowerCase()) && DOMAINS.includes(String(f.domain).toLowerCase());
    if (!ok) dropped++;
    return ok ? `${String(f.move).toLowerCase()}:${String(f.domain).toLowerCase()}` : null;
  }).filter(Boolean).sort();
  const ooc = OOC_KINDS.includes(v.ooc) ? v.ooc : null;
  if (v.ooc !== null && v.ooc !== undefined && !ooc) dropped++;
  const forks = {};
  for (const fork of FORKS.filter((f) => f.by !== "machine")) {
    const choice = v.forks?.[fork.id];
    forks[fork.id] = fork.choices.includes(choice) ? choice : null;
    if (choice !== null && choice !== undefined && !forks[fork.id]) dropped++;
  }
  return { acts, facts, ooc, forks, dropped };
}
const sameTag = (a, b) => JSON.stringify([a.acts, a.facts, a.ooc, a.forks]) === JSON.stringify([b.acts, b.facts, b.ooc, b.forks]);
export const tagsAgree = (a, b) => Boolean(a && b && sameTag(a, b));
/** The passes merged: two that agree stand; otherwise each item by majority of the three (an act kept when two of three
 * have it; a fact's count the median; a fork or the out-of-game kind the value two of three give, else none). */
export function mergeTags(passes) {
  const usable = passes.filter(Boolean);
  if (!usable.length) return null;
  if (usable.length === 1) return { ...usable[0], resolvedBy: "one pass" };
  if (usable.length === 2 && sameTag(usable[0], usable[1])) return { ...usable[0], resolvedBy: "two passes agree" };
  // Two that differ (the third pass unusable): only what both give; three: the majority.
  const need = 2;
  const acts = [...new Set(usable.flatMap((p) => p.acts))].filter((a) => usable.filter((p) => p.acts.includes(a)).length >= need).sort();
  const facts = [];
  for (const kind of new Set(usable.flatMap((p) => p.facts))) {
    const counts = usable.map((p) => p.facts.filter((f) => f === kind).length).sort((x, y) => x - y);
    for (let i = 0; i < (usable.length === 3 ? counts[1] : counts[0]); i++) facts.push(kind);
  }
  const vote = (values) => { for (const v of values) if (values.filter((x) => x === v).length >= need) return v; return null; };
  const forks = Object.fromEntries(FORKS.filter((f) => f.by !== "machine").map((f) => [f.id, vote(usable.map((p) => p.forks[f.id]))]));
  const unresolved = FORKS.filter((f) => f.by !== "machine" && new Set(usable.map((p) => p.forks[f.id])).size === 3).map((f) => f.id);
  return { acts, facts: facts.sort(), ooc: vote(usable.map((p) => p.ooc)), forks, dropped: 0, resolvedBy: usable.length === 3 ? "majority of three" : "two passes, what both give", ...(unresolved.length ? { unresolved } : {}) };
}

// ---- the place classes ------------------------------------------------------------------------------------------------------------

export function placeRequest(names) {
  const list = names.map((n, i) => `${i + 1}. ${n}`).join("\n");
  return { system: PLACE_SYSTEM, user: `Classes: ${PLACE_CLASSES.join(", ")}.\n${PLACE_RULE}\n\nThe names:\n<<<\n${list}\n>>>\n\nAnswer with JSON only: {"classes":{"1":"<class>", … one for every number}}` };
}
export function parsePlaces(text, names) {
  const v = jsonIn(text);
  if (!v?.classes) return null;
  const out = {};
  for (let i = 0; i < names.length; i++) {
    const cls = String(v.classes[String(i + 1)] ?? "").toLowerCase();
    if (!PLACE_CLASSES.includes(cls)) return null;
    out[names[i]] = cls;
  }
  return out;
}

// ---- the strip -----------------------------------------------------------------------------------------------------------------

const ACT_ORDER = ACTS.map((a) => a.code);
const FORK_ORDER = FORKS.map((f) => f.id);
const argIndex = (code, args) => { const lists = ACTS.find((a) => a.code === code).args; return args.map((a, i) => lists[i]?.indexOf(a) ?? 0); };
const actKey = (act) => { const m = act.match(/^([A-Z]+)(?:\((.*)\))?$/); const args = m[2] ? m[2].split(",") : []; return [ACT_ORDER.indexOf(m[1]), ...argIndex(m[1], args)]; };
const byKey = (a, b) => { const x = actKey(a), y = actKey(b); for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] ?? -1) !== (y[i] ?? -1)) return (x[i] ?? -1) - (y[i] ?? -1); return 0; };
const FACT_CODE = { discover: "DISCOVER", propose: "PROPOSE", assert: "ASSERT", enforce: "ENFORCE" };

/** One turn's final codes: the machine's and the tagger's together (the machine owns MOVE, SPEND, CAST(slot), PRESS and
 * DECLINE(reroll); coin out of the purse makes the coin fork «spend»). */
export function finalTurn(machine, tag) {
  const acts = new Set(machine.acts);
  for (const act of tag?.acts ?? []) acts.add(act);
  for (const fact of tag?.facts ?? []) { const [move, domain] = fact.split(":"); acts.add(`${FACT_CODE[move]}(${domain})`); }
  if (machine.ooc || tag?.ooc) acts.add(`OOC(${tag?.ooc ?? "other"})`);
  const forks = [...machine.forks];
  for (const fork of FORKS.filter((f) => f.by !== "machine")) {
    let choice = tag?.forks?.[fork.id] ?? null;
    if (fork.id === "coin" && machine.coinSpent) choice = "spend";
    if (choice) forks.push({ fork: fork.id, choice });
  }
  forks.sort((a, b) => FORK_ORDER.indexOf(a.fork) - FORK_ORDER.indexOf(b.fork) || a.choice.localeCompare(b.choice));
  return { acts: [...acts].sort(byKey), forks, facts: [...(tag?.facts ?? [])] };
}
export const forkCode = ({ fork, choice }) => `FORK(${FORKS.find((f) => f.id === fork).choices.join("|")})→${choice}`;
export function stripLine(k, turn) {
  const acts = turn.acts.join(" · "), forks = turn.forks.map(forkCode).join(" · ");
  const body = [acts, forks ? `‖ ${forks}` : ""].filter(Boolean).join(" ");
  return `t${String(k).padStart(2, "0")} ${body || "—"}`;
}

/** The grammar every strip line must match: the closed lists, nothing else. */
const ACT_PATTERN = ACTS.map((a) => (a.args.length ? `${a.code}\\((?:${a.args.map((list) => `(?:${list.map((x) => x.replace(/-/g, "\\-")).join("|")})`).join(",")})\\)` : a.code)).join("|");
const FORK_PATTERN = FORKS.map((f) => `FORK\\(${f.choices.join("\\|")}\\)→(?:${f.choices.join("|")})`).join("|");
export const LINE_RE = new RegExp(`^t\\d{2} (?:—|(?:(?:${ACT_PATTERN})(?: · (?:${ACT_PATTERN}))*)?(?: ?‖ (?:${FORK_PATTERN})(?: · (?:${FORK_PATTERN}))*)?)$`);
export const lineOk = (line) => LINE_RE.test(line) && !/^t\d{2} $/.test(line);

/** A strip: its turns' lines and the counts the profile needs. Throws if a line falls outside the grammar. */
export function stripOf(session, finals) {
  const lines = finals.map((t, i) => stripLine(session.record.turns[i].k, t));
  const bad = lines.filter((l) => !lineOk(l));
  if (bad.length) throw new Error(`${session.id}: ${bad.length} strip line(s) outside the vocabulary: ${bad[0].slice(0, 80)}`);
  return { id: session.id, group: session.group, key: session.key, table: session.table, player: session.player, family: session.family, turns: lines.length, lines };
}
export const stripHeader = (strip, number, extra = "") => `Strip ${number} · Table ${strip.table} · ${strip.turns} turns${extra}`;
export const stripText = (strip, number, extra = "") => [stripHeader(strip, number, extra), ...strip.lines].join("\n");

// ---- the profile -------------------------------------------------------------------------------------------------------------------

/** Per fork: { n, counts }. The fact fork counts every fact the tagger listed (one opportunity each). */
export function profileOf(finals) {
  const out = Object.fromEntries(PROFILE.forks.map((id) => [id, { n: 0, counts: {} }]));
  for (const t of finals) {
    for (const { fork, choice } of t.forks) { out[fork].n++; out[fork].counts[choice] = (out[fork].counts[choice] ?? 0) + 1; }
    for (const fact of t.facts) { const move = fact.split(":")[0]; out.fact.n++; out.fact.counts[move] = (out.fact.counts[move] ?? 0) + 1; }
  }
  return out;
}
/** The authorship domain beside (exploratory): fact move × domain. */
export function domainsOf(finals) {
  const counts = {};
  for (const t of finals) for (const fact of t.facts) counts[fact] = (counts[fact] ?? 0) + 1;
  return counts;
}
const CHOICES = { ...Object.fromEntries(FORKS.map((f) => [f.id, f.choices])), fact: FACT_MOVES };
export const rates = (entry, fork) => CHOICES[fork].map((c) => (entry.n ? (entry.counts[c] ?? 0) / entry.n : null));
/** The profile distance: the mean total-variation distance over the forks both sessions have ≥ min opportunities of. */
export function profileDistance(a, b, min = PROFILE.minOpportunities) {
  const shared = PROFILE.forks.filter((f) => a[f].n >= min && b[f].n >= min);
  if (!shared.length) return 1;
  const tv = shared.map((f) => { const ra = rates(a[f], f), rb = rates(b[f], f); return ra.reduce((s, x, i) => s + Math.abs(x - rb[i]), 0) / 2; });
  return tv.reduce((s, x) => s + x, 0) / tv.length;
}
export { CHOICES };
