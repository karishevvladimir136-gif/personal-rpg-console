#!/usr/bin/env node
// Epilogue 1 (docs/stages/EPILOGUE_1.md on origin/claude/handoff, with its amendment of 2026-10-27: fifteen campaigns, cap
// $25): an ending for every campaign we cut. Written because the owner keeps his word, not because anything was owed by
// the players.
//
// Each epilogue is written by the campaign's own DM settings (Claude Opus 5.5 writes, as every one of these campaigns
// recorded; the depth range's base, high) from the campaign's own record only — the opening, the turns as played (what
// James did, what the DM narrated, what it recorded), the records as they stood, and the DM's hidden layer where one was
// kept. No player is in context and no player is asked anything; the DM is told only «the table closed». One DM call per
// campaign; a second only to repair a contradiction with the record. The epilogue is a new file beside the records and a
// final entry on a copy of the record; the original run files are never written.
// Measured blind: threads the record opened / given an ending; named people / given a fate; contradictions; a new hook;
// the hero killed or resolved; words. One Claude Haiku 5.5 pass, Claude Opus 5.5 on a flag (its reading then stands).
//
//   node scripts/epilogue-1/epilogue.mjs --sources            (no calls: the records from their pinned commits)
//   node scripts/epilogue-1/epilogue.mjs --write --only <id>  (paid: one campaign's epilogue and its measure)
//   node scripts/epilogue-1/epilogue.mjs --write              (paid: every campaign not yet written)
//   node scripts/epilogue-1/epilogue.mjs --own-threads        (paid, judges only: the hero's own threads, post-hoc)
//   node scripts/epilogue-1/epilogue.mjs --report [--in-short <file>]   (no calls: the report)
//
// Paid calls go through game player 1's meter: the OpenRouter ledger only (a call to any other door is not sent), the cap
// $25, a 402 or a 429 stops at once (no waits), an error naming suspension, access or policy stops, a refusal is never
// asked again (its campaign is closed) and three stop the stage. Keys are never printed or written.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createLedger, createMeter, ledgerMarkdown } from "../game-player-1/paid.mjs";
import { judgeCall } from "../game-player-1/players.mjs";
import { paidCall } from "../game-player-1/session.mjs";
import { wordsIn } from "../game-player-1/measures.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const RUNS = join(ROOT, "docs", "runs");
export const STEM = "epilogue-1";
export const CAP_USD = 25;
export const SOURCES_FILE = join(RUNS, `${STEM}-sources.json`);
export const STATE_FILE = join(RUNS, `${STEM}-state.json`);
export const EPILOGUES = join(RUNS, `${STEM}-epilogues`);
export const RECORDS = join(RUNS, `${STEM}-records`);
export const HEAD_LINE = "Written because the owner keeps his word, not because anything was owed by the players.";
const sha256 = (text) => createHash("sha256").update(String(text)).digest("hex");

// ---- the fifteen campaigns (the amendment of 2026-10-27), pinned ----------------------------------------------------------

const GP2 = { branch: "claude/game-player-2", commit: "6158fffeb30a225045f6f15433cf0dbeb286a446" };
const R1 = { branch: "claude/game-player-replicate-1", commit: "40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d" };
const COMBAT = { branch: "claude/game-player-combat-1-pb8k1t", commit: "c5709f515d646069719d2d124164903dcd0837dd" };
const VILLAIN = { branch: "claude/game-player-villain-1-0yowzl", commit: "b8647ef6490639598a2e0b34b308422557262105" };
const SW = { branch: "claude/game-player-same-world-1", commit: "7a14355f0f5241ff3ce529867fca7f02c1997e45" };
const SW_LAYER = { ...SW, path: "docs/runs/game-player-same-world-1-frozen/B-dm-only.json" };
const run = (src, path, key) => ({ ...src, path, key });
const GP1_B = "docs/runs/game-player-1-run-20261025-044002.json", C1 = "docs/runs/game-player-2-run-20261025-051726.json", C2 = "docs/runs/game-player-2-run-20261025-085230.json";
export const CAMPAIGNS = [
  { id: "gp1-B-opus", study: "Game player 1", table: "B", attempt: "first attempt", cut: "the organisation's monthly Console cap (HTTP 429), turn 7", source: run(GP2, GP1_B, "B-opus") },
  { id: "gp1-B-sol", study: "Game player 1", table: "B", attempt: "first attempt", cut: "the organisation's monthly Console cap (HTTP 429), turn 4", source: run(GP2, GP1_B, "B-sol") },
  ...["opus", "fable", "astra", "sol"].map((p) => ({ id: `gp2-C1-${p}`, study: "Game player 2", table: "C", attempt: "attempt 1", cut: "the organisation's monthly Console cap", source: run(GP2, C1, `C-${p}`) })),
  ...["opus", "fable", "astra", "sol"].map((p) => ({ id: `gp2-C2-${p}`, study: "Game player 2", table: "C", attempt: "attempt 2", cut: "a false cap stop (the harness's price-id bug)", source: run(GP2, C2, `C-${p}`) })),
  { id: "r1-A-opus", study: "Game player replicate 1", table: "A", attempt: "group 2's first A-opus", cut: "the shared key's HTTP 429, turn 5", source: run(R1, "docs/runs/game-player-replicate-1-run-20261026-001235.json", "A-opus") },
  { id: "combat-CW-opus-1", study: "Game player combat 1", table: "CW", attempt: "Opus's first attempt", cut: "lost in a container restart during the owner's pause, turn 6",
    source: { ...COMBAT, path: "docs/runs/game-player-combat-1-lost-attempt.jsonl", key: "CW-opus" }, recordGap: "only the run's event log survived (tool names, timings and three bookkeeping lines; no narration, no turns, no records panel, no hidden layer)" },
  { id: "villain-V-astra-1", study: "Game player villain 1", table: "V", attempt: "Astra's first attempt", cut: "killed at turn 17 by the session tool's two-hour limit",
    source: { ...VILLAIN, path: null, key: "V-astra" }, recordGap: "no record survived: the process was killed with its driver; the branch keeps only a commit message and a hand-booked cost" },
  { id: "sw-B-opus-1", study: "Game player same-world 1", table: "B", attempt: "B-opus-1", cut: "a DM-turn error (conflict), turn 16", source: run(SW, "docs/runs/game-player-same-world-1-run-20261027-110243.json", "B-opus-1"), layer: SW_LAYER },
  { id: "sw-B-astra-2", study: "Game player same-world 1", table: "B", attempt: "B-astra-2", cut: "a DM-turn error (conflict), turn 19", source: run(SW, "docs/runs/game-player-same-world-1-run-20261027-150025.json", "B-astra-2"), layer: SW_LAYER },
];

// ---- the records ----------------------------------------------------------------------------------------------------------

const gitShow = (commit, path) => execFileSync("git", ["show", `${commit}:${path}`], { cwd: ROOT, maxBuffer: 512 * 1024 * 1024 }).toString("utf8");
/** The records as they stood: the first full «Your records:» block, then every «Your records, changed:» block over it, line
 * by line (a line's label is what stands before its first «: »; a full «Carried» list replaces «Pack», a «Carried: + / −» change
 * is listed after it); the last «Place:» line seen
 * replaces the block's place and time. */
export function recordsAsStood(screens) {
  const lines = new Map();
  let place = null, i = 0;
  for (const screen of screens.map(String)) {
    for (const m of screen.matchAll(/Your records(?:, changed)?:\n([\s\S]*?)(?:\n\n|$)/g)) {
      for (const line of m[1].split("\n").map((l) => l.trim()).filter(Boolean)) {
        const at = line.indexOf(": "), label = at > 0 && at < 40 ? line.slice(0, at) : `line ${i++}`;
        if (label === "Carried" && /^Carried: [+−-]/.test(line)) { const was = lines.get("Carried changes"); lines.set("Carried changes", `${was ?? "Carried, changed since:"} ${line.slice("Carried: ".length)};`); continue; }
        if (label === "Carried") lines.delete("Pack");
        lines.set(label, line);
      }
    }
    for (const m of screen.matchAll(/^Place: .*$/gm)) place = m[0];
  }
  if (place) { lines.delete("Time"); lines.delete("Place"); }
  return [...lines.values(), ...(place ? [place] : [])].join("\n");
}
/** A session from its run record: the opening, the turns as played, the records as they stood, the DM's settings. */
export function sessionOf(campaign, raw) {
  const record = JSON.parse(raw), s = (record.sessions ?? []).find((x) => x.key === campaign.source.key);
  if (!s) throw new Error(`${campaign.id}: no session ${campaign.source.key} in ${campaign.source.path}`);
  const dm = (s.campaign?.steps ?? []).find((x) => x.step === "dm") ?? null;
  const turns = (s.turns ?? []).map((t) => ({ k: t.k, status: t.status ?? null, message: String(t.message ?? ""), reply: t.status === "committed" ? String(t.reply ?? "") : "", changes: (t.changes ?? []).map((c) => c.summary).filter(Boolean) }));
  const closedAt = s.finishedAt ?? s.startedAt;
  return { key: s.key, model: s.model, startedAt: s.startedAt, closedAt, ended: s.ended ?? null, n: s.ended?.at ?? turns.length, dm: dm ? { split: dm.split, depth: dm.depth, language: dm.options?.instructions ?? null } : null,
    prep: s.campaign?.prep ?? null, opening: String(s.opening?.text ?? ""), turns, records: recordsAsStood(s.screens ?? []) };
}
export function readSources(show = gitShow) {
  return CAMPAIGNS.map((c) => {
    const base = { id: c.id, study: c.study, table: c.table, attempt: c.attempt, cut: c.cut, source: c.source };
    if (c.recordGap) return { ...base, record: null, recordGap: c.recordGap, ...(c.source.path ? { sourceSha256: sha256(show(c.source.commit, c.source.path)) } : {}) };
    const raw = show(c.source.commit, c.source.path), session = sessionOf(c, raw);
    let layer = null;
    if (c.layer) { const lraw = show(c.layer.commit, c.layer.path), l = JSON.parse(lraw); layer = { text: String(l.layer), sha256: l.sha256, source: c.layer, fileSha256: sha256(lraw) }; }
    return { ...base, sourceSha256: sha256(raw), record: session, layer, layerNote: layer ? "the frozen hidden layer of the table" : session.prep?.hasLayer ? `a hidden layer was prepared (${session.prep.chars} characters) but its text was not kept in the run record` : "none (pure simulation: no prep)" };
  });
}
let sourcesCache = null;
export const sourcesOf = () => (sourcesCache ??= JSON.parse(readFileSync(SOURCES_FILE, "utf8")).campaigns);

// ---- the DM's request (frozen before the first paid call) ---------------------------------------------------------------

export const DM_MODEL = "claude-opus-5-5";
/** The campaigns' depth range is high → xhigh; one closing entry is not a climax turn, so the range's base. */
export const DM_EFFORT = "high";
export const DM_MAX_TOKENS = 16000;
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const dateOf = (iso) => { const d = new Date(iso); return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
export const headerOf = (src) => `Epilogue — the table closed on ${dateOf(src.record.closedAt)} after ${src.record.n} turn${src.record.n === 1 ? "" : "s"}`;
/** The campaign's own record as the DM is shown it: the opening, every turn (James's move, the narration, what was
 * recorded), the records as they stood, the hidden layer where one was kept. A last move the DM never answered is shown
 * as such, in the one sentence the DM is told. */
export function recordText(src) {
  const r = src.record, lines = ["## The opening", "", r.opening.trim(), "", "## The turns", ""];
  for (const t of r.turns) {
    lines.push(`### Turn ${t.k}`, "", "James:", "", t.message.trim(), "");
    if (t.reply.trim()) lines.push("The game master:", "", t.reply.trim(), "", ...(t.changes.length ? ["Recorded:", ...t.changes.map((c) => `- ${c}`), ""] : []));
    else lines.push("(The table closed before the game master answered.)", "");
  }
  lines.push("## Your records as they stood", "", r.records.trim() || "(none)", "");
  if (src.layer) lines.push("## Your hidden layer (your own preparation; the player never saw it)", "", src.layer.text.trim(), "");
  return lines.join("\n");
}
export const DM_INSTRUCTION = (header) => [
  "The table closed.",
  "",
  "Write the campaign's last journal entry, its epilogue, in English, 300 to 600 words. Begin with this line, exactly:",
  "",
  header,
  "",
  "Say what became of the world after the table closed. Give every thread the record opened its ending. Give every named person a fate consistent with what the record and your own notes knew. Show the places as they are a season later. James Worgen is neither killed nor resolved: he walks out of the record as he was, and the world closes around a man who was there for a while and then was not. No new quest, no hook, no door left open on purpose. Nothing will be written after this entry.",
].join("\n");
export function dmRequest(src) {
  return { user: [`You were the game master of this campaign. This is its record, as it stood.`, "", recordText(src), DM_INSTRUCTION(headerOf(src))].join("\n") };
}
export function repairRequest(src, entry, contradictions) {
  return { user: [dmRequest(src).user, "", "Your entry:", "<<<", entry, ">>>", "", "It contradicts the record here:", ...contradictions.map((c) => `- the entry: «${c.entry}» — the record: «${c.record}»`), "",
    "Write the entry again, correcting only these. Change nothing else, and do not make it longer."].join("\n") };
}

// ---- the blind measure (frozen) ----------------------------------------------------------------------------------------------

export const JUDGE = { model: "claude-haiku-5-5", effort: "low", maxTokens: 6000 };
export const REFEREE = { model: "claude-opus-5-5", effort: "medium", maxTokens: 10000 };
export const JUDGE_SYSTEM = "You are a blind evaluator. You read the record of a tabletop role-playing campaign and the closing journal entry its game master wrote after the table closed. You are not told which model wrote either or why this was run, and it must not matter: tag only what the texts say, against rules written before any entry existed. Answer with one JSON object and nothing else.";
export const RULES = {
  threads: "threads: every thread the record opened — a question, lead, errand, promise, debt, threat, mystery or bond left in motion by the turns or the records (each journal or quest title is one; add those the turns opened without a title). Do not list what is only in the hidden layer and never surfaced in the turns or the records. For each: ended = 1 when the entry gives it an ending (says how it came out, or that it was settled, abandoned or ran its course), else 0; quote the entry's sentence (empty when 0).",
  people: "people: every named person of the record — a proper name, or a fixed title the record uses for one person («Sergeant Vane», «the grey-cloak»); not James Worgen and not his cat. For each: fate = 1 when the entry says what became of them after the table closed, else 0; quote the entry's sentence (empty when 0).",
  contradictions: "contradictions: every statement of the entry that contradicts the record or the hidden layer — a fact, a name, a place, an outcome, a number the record established. Quote the entry and the record. Telling what became of people and places after the table closed is not a contradiction; going against what the record established is.",
  hero: "hero_killed = 1 when the entry kills James Worgen; hero_resolved = 1 when it settles his story — ends his arc, settles his debt to his goddess, or fixes his future — rather than leaving him as he was. Quote the sentence (empty when 0).",
  hook: "new_hook = 1 when the entry plants something that invites more play: a new quest, a door left open on purpose, an invitation to James, a threat left pending for him or a sequel. A thread ended on an open-ended fate is not a hook unless it invites James or more play. Quote it (empty when 0).",
  header: "header = 1 when the entry's first line is «Epilogue — the table closed on … after … turns» (any date and number), else 0.",
};
export function judgeRequest(src, entry) {
  return { system: JUDGE_SYSTEM, user: ["The campaign's record:", "<<<", recordText(src), ">>>", "", "The closing entry:", "<<<", entry, ">>>", "", "Rules:", ...Object.values(RULES).map((r) => `- ${r}`), "",
    'Answer with {"threads":[{"thread":"<short name>","ended":0|1,"quote":"…"}],"people":[{"name":"…","fate":0|1,"quote":"…"}],"contradictions":[{"entry":"…","record":"…"}],"hero_killed":0|1,"hero_resolved":0|1,"hero_quote":"…","new_hook":0|1,"hook_quote":"…","header":0|1}.'].join("\n") };
}
const jsonIn = (text) => { const s = String(text ?? ""); const from = s.indexOf("{"), to = s.lastIndexOf("}"); if (from < 0 || to <= from) return null; try { return JSON.parse(s.slice(from, to + 1)); } catch { return null; } };
const bit = (v) => [0, 1].includes(v);
export function parseJudge(text) {
  const v = jsonIn(text);
  if (!v || !Array.isArray(v.threads) || !Array.isArray(v.people) || !Array.isArray(v.contradictions) || !["hero_killed", "hero_resolved", "new_hook", "header"].every((f) => bit(v[f]))) return null;
  if (!v.threads.every((t) => t && bit(t.ended)) || !v.people.every((p) => p && bit(p.fate))) return null;
  const s = (x) => String(x ?? "").trim().slice(0, 600);
  return { threads: v.threads.map((t) => ({ thread: s(t.thread), ended: t.ended, quote: s(t.quote) })), people: v.people.map((p) => ({ name: s(p.name), fate: p.fate, quote: s(p.quote) })),
    contradictions: v.contradictions.map((c) => ({ entry: s(c?.entry), record: s(c?.record) })).filter((c) => c.entry || c.record),
    hero_killed: v.hero_killed, hero_resolved: v.hero_resolved, hero_quote: s(v.hero_quote), new_hook: v.new_hook, hook_quote: s(v.hook_quote), header: v.header };
}
/** A flag sends the reading to the referee: a contradiction, a new hook, the hero killed or resolved, an unusable pass. */
export const flagged = (p) => !p || p.contradictions.length > 0 || p.new_hook === 1 || p.hero_killed === 1 || p.hero_resolved === 1;
export function numbersOf(reading, entry) {
  if (!reading) return null;
  const body = String(entry).split("\n").slice(1).join("\n");
  return { threads: reading.threads.length, threadsEnded: reading.threads.filter((t) => t.ended).length, people: reading.people.length, peopleFated: reading.people.filter((p) => p.fate).length,
    contradictions: reading.contradictions.length, newHook: reading.new_hook, heroKilled: reading.hero_killed, heroResolved: reading.hero_resolved, header: reading.header, words: wordsIn(body).length };
}

export function designHash() {
  return sha256(JSON.stringify({ CAMPAIGNS, DM_MODEL, DM_EFFORT, DM_MAX_TOKENS, JUDGE, REFEREE, JUDGE_SYSTEM, RULES, CAP_USD, HEAD_LINE, instruction: DM_INSTRUCTION("<header>"),
    shapes: [recordsAsStood.toString(), sessionOf.toString(), recordText.toString(), dmRequest.toString(), repairRequest.toString(), judgeRequest.toString(), parseJudge.toString(), flagged.toString(), headerOf.toString()] }));
}

// ---- one campaign ---------------------------------------------------------------------------------------------------------------

/** One campaign: the DM's entry, the blind reading (Opus on a flag), one repair call when a contradiction stands and its
 * reading. `ask({ model, system, user, maxTokens, effort, purpose })` is the metered call in the campaign's context. */
export async function writeOne(src, { ask, log = () => {} }) {
  const out = { id: src.id, calls: [], repaired: false };
  const dm = async (purpose, request) => { const r = await ask({ model: DM_MODEL, system: null, user: request.user, maxTokens: DM_MAX_TOKENS, effort: DM_EFFORT, purpose }); out.calls.push({ purpose, stopReason: r.stopReason ?? null, error: r.error ?? null }); return r; };
  const read = async (entry, what) => {
    const request = judgeRequest(src, entry);
    const first = await ask({ model: JUDGE.model, system: request.system, user: request.user, maxTokens: JUDGE.maxTokens, effort: JUDGE.effort, purpose: `judge ${what}` });
    if (first.notSent || first.stopReason === "refusal") return { stopped: first.notSent ? first.error : "refusal", pass: null, referee: null, final: null };
    const pass = parseJudge(first.text);
    if (!flagged(pass)) return { pass, referee: null, final: pass };
    const second = await ask({ model: REFEREE.model, system: request.system, user: request.user, maxTokens: REFEREE.maxTokens, effort: REFEREE.effort, purpose: `referee ${what}` });
    if (second.notSent || second.stopReason === "refusal") return { stopped: second.notSent ? second.error : "refusal", pass, referee: null, final: pass };
    const referee = parseJudge(second.text);
    return { pass, referee, final: referee ?? pass, ...(referee ? {} : { refereeUnusable: true }) };
  };
  const first = await dm("epilogue", dmRequest(src));
  if (first.notSent || first.stopReason === "refusal" || first.error || !String(first.text ?? "").trim()) {
    out.stopped = first.notSent ? `not sent: ${first.error}` : first.stopReason === "refusal" ? `refused (${first.refusalCategory ?? "no category"}) — not asked again` : `error: ${first.error ?? "an empty answer"}`;
    log(`${src.id}: no epilogue — ${out.stopped}`);
    return out;
  }
  out.first = { text: first.text.trim(), served: first.servedModel ?? null };
  out.firstReading = await read(out.first.text, `${src.id} first`);
  const contradictions = out.firstReading.final?.contradictions ?? [];
  out.entry = out.first.text;
  out.reading = out.firstReading;
  if (contradictions.length) {
    const second = await dm("repair", repairRequest(src, out.first.text, contradictions));
    if (!second.notSent && second.stopReason !== "refusal" && !second.error && String(second.text ?? "").trim()) {
      out.repaired = true;
      out.entry = second.text.trim();
      out.reading = await read(out.entry, `${src.id} repaired`);
    } else out.repairFailed = second.notSent ? `not sent: ${second.error}` : second.stopReason === "refusal" ? "refused — not asked again" : `error: ${second.error ?? "empty"}`;
  }
  out.numbers = numbersOf(out.reading.final, out.entry);
  out.firstNumbers = numbersOf(out.firstReading.final, out.first.text);
  log(`${src.id}: ${out.numbers ? `${out.numbers.words} words · threads ${out.numbers.threadsEnded}/${out.numbers.threads} · people ${out.numbers.peopleFated}/${out.numbers.people} · contradictions ${out.numbers.contradictions}${out.repaired ? ` (first ${out.firstNumbers?.contradictions})` : ""} · hook ${out.numbers.newHook}` : "not read"}`);
  return out;
}

// ---- files ---------------------------------------------------------------------------------------------------------------------

export function epilogueMarkdown(src, done) {
  return [`# ${src.study} · Table ${src.table} · ${src.attempt} — epilogue`, "", `${HEAD_LINE}`, "",
    `Cut by ${src.cut}. Written by ${DM_MODEL} (effort ${DM_EFFORT}) from the campaign's own record (\`${src.source.path}\` at \`${src.source.commit.slice(0, 8)}\`, session ${src.source.key}; hidden layer: ${src.layerNote}). ${done.repaired ? "A second call repaired a contradiction with the record." : "One call."}`, "",
    "---", "", done.entry, ""].join("\n");
}
/** A copy of the session record with the epilogue as its final entry (the original run file is never written). */
export function recordCopy(src, done) {
  const raw = gitShow(src.source.commit, src.source.path), s = JSON.parse(raw).sessions.find((x) => x.key === src.source.key);
  return { note: "A copy of the session record from its run file, with the epilogue appended as its final entry; the original is unchanged.", source: { ...src.source, sha256: sha256(raw) },
    session: { ...s, epilogue: { header: headerOf(src), text: done.entry, writtenBy: DM_MODEL, effort: DM_EFFORT, repaired: done.repaired, final: true } } };
}

// ---- the hero's own threads (post-hoc, on the user's word after the first epilogue; outside the frozen design) ----------------

/** The brief leaves James unresolved, so a thread that is his own cannot be closed; E1 is printed beside the frozen count
 * with those left out. Which threads are his own is read blind: one Haiku pass over the final reading's thread list, Opus
 * on any thread marked his own (its reading then stands). */
export const OWN_SYSTEM = "You are a blind evaluator. You read the list of threads a reader found in the record of a tabletop role-playing campaign, and the hero's sheet. You are not told why this was run, and it must not matter: tag only against the rule. Answer with one JSON object and nothing else.";
export const OWN_RULE = "own = 1 when the thread is the hero's own — James Worgen's own arc: his service or debt to his goddess, his own past, his own future or calling — which a closing entry that leaves him as he was cannot settle; own = 0 when it belongs to the world or to other people, even if James took part in it (a mystery he followed, an errand he took on for someone, a person he met).";
export function ownRequest(src, reading) {
  const sheet = src.record.records.split("\n").filter((l) => /^(James Worgen —|Abilities:|Limits:)/.test(l)).join("\n");
  return { system: OWN_SYSTEM, user: ["The hero's sheet (from the record):", "<<<", sheet, ">>>", "", "The threads (numbered):", ...reading.threads.map((t, i) => `${i + 1}. ${t.thread}`), "", `Rule: ${OWN_RULE}`, "",
    `Answer with {"own":[${reading.threads.map((_, i) => `{"n":${i + 1},"own":0|1}`).join(",")}]}.`].join("\n") };
}
export function parseOwn(text, count) {
  const v = jsonIn(text);
  if (!v || !Array.isArray(v.own)) return null;
  const by = new Map(v.own.filter((x) => x && Number.isInteger(x.n) && bit(x.own)).map((x) => [x.n, x.own]));
  return Array.from({ length: count }, (_, i) => by.get(i + 1)).every((x) => x !== undefined) ? Array.from({ length: count }, (_, i) => by.get(i + 1)) : null;
}
export async function readOwn(src, reading, ask) {
  if (!reading?.threads?.length) return { pass: [], referee: null, final: [] };
  const request = ownRequest(src, reading);
  const first = await ask({ model: JUDGE.model, system: request.system, user: request.user, maxTokens: 2000, effort: JUDGE.effort, purpose: `own ${src.id}` });
  if (first.notSent || first.stopReason === "refusal") return { stopped: first.notSent ? first.error : "refusal", pass: null, referee: null, final: null };
  const pass = parseOwn(first.text, reading.threads.length);
  if (pass && !pass.includes(1)) return { pass, referee: null, final: pass };
  const second = await ask({ model: REFEREE.model, system: request.system, user: request.user, maxTokens: 4000, effort: REFEREE.effort, purpose: `own referee ${src.id}` });
  if (second.notSent || second.stopReason === "refusal") return { stopped: second.notSent ? second.error : "refusal", pass, referee: null, final: pass };
  const referee = parseOwn(second.text, reading.threads.length);
  return { pass, referee, final: referee ?? pass };
}
/** The thread counts with the hero's own threads left out. */
export function withoutOwn(reading, own) {
  if (!reading || !own) return null;
  const kept = reading.threads.filter((_, i) => own[i] !== 1);
  return { threads: kept.length, threadsEnded: kept.filter((t) => t.ended).length, own: reading.threads.length - kept.length, ownNames: reading.threads.filter((_, i) => own[i] === 1).map((t) => t.thread) };
}

// ---- the scores and the report ---------------------------------------------------------------------------------------------------

export function scores(sources, state) {
  const writable = sources.filter((s) => s.record), written = writable.map((s) => ({ s, d: state.done[s.id] })).filter((x) => x.d?.numbers);
  const allEnded = written.filter((x) => x.d.numbers.threadsEnded === x.d.numbers.threads).length;
  const withOwnOut = written.map((x) => withoutOwn(x.d.reading.final, x.d.own?.final)).filter(Boolean);
  const allEndedOwnOut = withOwnOut.filter((w) => w.threadsEnded === w.threads).length;
  const atMostOne = written.every((x) => x.d.numbers.contradictions <= 1), noHook = written.filter((x) => x.d.numbers.newHook === 0).length;
  return { of: sources.length, writable: writable.length, written: written.length, notWritable: sources.filter((s) => !s.record).map((s) => s.id),
    E1: { allEnded, allEndedOwnOut, ownRead: withOwnOut.length, contradictionsAtMostOne: atMostOne, maxContra: Math.max(0, ...written.map((x) => x.d.numbers.contradictions)), held: allEnded >= 12 && atMostOne, heldOwnOut: allEndedOwnOut >= 12 && atMostOne },
    E2: { noHook, held: noHook >= 12 },
    E0: { spentUsd: state.spentUsd ?? 0, capUsd: CAP_USD, refusals: state.refusals ?? 0, retriedAfterRefusal: 0, recordsUntouched: state.recordsUntouched ?? null, held: (state.spentUsd ?? 0) <= CAP_USD && (state.recordsUntouched?.ok ?? false) } };
}

/** The source run files still read as they were read (their sha256 at the pinned commits), and nothing under their paths
 * changed on this branch. */
export function untouched(sources, show = gitShow) {
  const checks = sources.filter((s) => s.sourceSha256 && s.source.path).map((s) => ({ id: s.id, same: sha256(show(s.source.commit, s.source.path)) === s.sourceSha256 }));
  const changed = execFileSync("git", ["status", "--porcelain", "--", ...[...new Set(sources.filter((s) => s.source.path).map((s) => s.source.path))]], { cwd: ROOT }).toString().trim();
  return { ok: checks.every((c) => c.same) && !changed, checks, workingTreeChanges: changed || null };
}

const mark = (h) => (h ? "**held**" : "**lost**");
const cell = (t) => String(t ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
const costBy = (state) => { const m = {}; for (const r of state.ledgerRuns ?? []) for (const c of r.calls ?? []) m[c.session] = (m[c.session] ?? 0) + (c.costUsd ?? 0); return m; };
export function reportMarkdown(sources, state, { log = "" } = {}) {
  const v = scores(sources, state), cost = costBy(state), money = (x) => `$${(x ?? 0).toFixed(2)}`;
  const lines = [`# Epilogue 1 — an ending for every campaign we cut`, "", `**${HEAD_LINE}**`, "",
    `Branch \`claude/epilogue-1\` from \`origin/claude/game-player-2\`. The stage: \`docs/stages/EPILOGUE_1.md\` on \`origin/claude/handoff\`, with its amendment of 2026-10-27 (fifteen campaigns, cap $25). Sources \`docs/runs/${STEM}-sources.json\`; state \`docs/runs/${STEM}-state.json\`; the epilogues \`docs/runs/${STEM}-epilogues/<campaign>.md\`; the record copies with the epilogue as their final entry \`docs/runs/${STEM}-records/<campaign>.json\`; ledger \`docs/runs/${STEM}-ledger-openrouter.md\`. Design sha256 \`${state.designSha256}\`.`, "",
    "## In short", "", log || "_(to be written after reading)_", "",
    "## E0–E2", "", "E1 and E2 are read as ≥ 12 of 15 over the 13 writable campaigns (the user, 2026-10-28): the two without a record cannot be written and are not counted as written.", "",
    "| Line | Verdict | The numbers |", "| --- | --- | --- |",
    `| E1 every thread given an ending in ≥ 12; contradictions ≤ 1 per epilogue (frozen rule) | ${mark(v.E1.held)} | all threads ended in ${v.E1.allEnded} of ${v.written}; at most ${v.E1.maxContra} contradiction${v.E1.maxContra === 1 ? "" : "s"} in any epilogue |`,
    `| E1, the hero's own threads left out (unclosable by the brief) | ${mark(v.E1.heldOwnOut)} | all threads ended in ${v.E1.allEndedOwnOut} of ${v.E1.ownRead} |`,
    `| E2 no new hook in ≥ 12 | ${mark(v.E2.held)} | no hook in ${v.E2.noHook} of ${v.written} |`,
    `| E0 cap $${CAP_USD}; nothing retried after a refusal; the cut records untouched | ${mark(v.E0.held)} | spent ${money(v.E0.spentUsd)}; refusals ${v.E0.refusals}, retried 0; source files ${v.E0.recordsUntouched?.ok ? "unchanged (sha256 re-read at the pinned commits; no change under their paths here)" : "NOT verified"} |`, "",
    "## Per campaign", "",
    "| Campaign | Cut | Turns | Hidden layer | Words (300–600) | Threads ended (frozen) | … hero's own left out | People given a fate | Contradictions (first → final) | New hook | Hero killed / resolved | DM calls | Cost |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"];
  for (const s of sources) {
    const d = state.done[s.id], n = d?.numbers;
    if (!s.record) { lines.push(`| ${s.id} | ${cell(s.cut)} | – | – | not writable | – | – | – | – | – | – | 0 | $0 |`); continue; }
    if (!n) { lines.push(`| ${s.id} | ${cell(s.cut)} | ${s.record.n} | ${s.layer ? "kept" : s.record.prep?.hasLayer ? "not kept" : "none"} | ${d?.stopped ? `not written: ${cell(d.stopped)}` : "not written"} | – | – | – | – | – | – | ${d?.calls?.length ?? 0} | ${money(cost[s.id])} |`); continue; }
    const w = withoutOwn(d.reading.final, d.own?.final), range = n.words < 300 ? " (under)" : n.words > 600 ? " (over)" : "";
    lines.push(`| ${s.id} | ${cell(s.cut)} | ${s.record.n} | ${s.layer ? "kept" : s.record.prep?.hasLayer ? "not kept" : "none"} | ${n.words}${range} | ${n.threadsEnded}/${n.threads} | ${w ? `${w.threadsEnded}/${w.threads}${w.own ? ` (own: ${cell(w.ownNames.join("; "))})` : ""}` : "?"} | ${n.peopleFated}/${n.people} | ${d.firstNumbers?.contradictions ?? n.contradictions} → ${n.contradictions}${d.repaired ? " (repaired)" : ""} | ${n.newHook} | ${n.heroKilled} / ${n.heroResolved} | ${d.calls.filter((c) => /epilogue|repair/.test(c.purpose)).length} | ${money(cost[s.id])} |`);
  }
  lines.push("", "Hidden layer: «kept» — the table's frozen layer was in the DM's record; «not kept» — the campaign had one, but the run record kept only its size, so the DM wrote without it; «none» — a pure simulation, no prep.", "",
    "## Not writable", "", ...sources.filter((s) => !s.record).map((s) => `- **${s.study} · ${s.attempt}** (${s.cut}): ${s.recordGap}. Not written: the campaign's own record is the only source the stage allows, and no close is drawn from the table's setup files (the user, 2026-10-28).`), "",
    "## Decisions after the first epilogue (the user, 2026-10-28)", "",
    "- The two campaigns without a record are not writable; listed above with the reason. E1 and E2 read as ≥ 12 of 15 over the 13 writable.",
    "- The frozen prompt is kept; no firmer length line. Words are reported against 300–600 per epilogue; an overrun is a measure, not a fault to repair (the one repair call is for a contradiction only).",
    "- E1 is scored by the frozen rule, and printed beside it with the hero's own threads left out. Which threads are his own was read blind after the writing (one Haiku pass over each final thread list, Opus on any thread marked his own); it is outside the frozen design.", "",
    "## What the readings left open", "");
  for (const s of sources.filter((x) => state.done[x.id]?.numbers)) {
    const f = state.done[s.id].reading.final, own = state.done[s.id].own?.final ?? [];
    const open = f.threads.map((t, i) => ({ ...t, own: own[i] === 1 })).filter((t) => !t.ended), nofate = f.people.filter((p) => !p.fate);
    const bits = [open.length ? `threads not ended: ${open.map((t) => `${cell(t.thread)}${t.own ? " (the hero's own)" : ""}`).join("; ")}` : null, nofate.length ? `no fate: ${nofate.map((p) => cell(p.name)).join("; ")}` : null,
      f.contradictions.length ? `contradictions: ${f.contradictions.map((c) => `«${cell(c.entry)}» against «${cell(c.record)}»`).join("; ")}` : null, f.new_hook ? `hook: «${cell(f.hook_quote)}»` : null,
      f.hero_killed || f.hero_resolved ? `the hero: «${cell(f.hero_quote)}»` : null].filter(Boolean);
    lines.push(`- **${s.id}**: ${bits.length ? bits.join(" · ") : "nothing"}${state.done[s.id].repaired ? ` · first entry's contradictions: ${state.done[s.id].firstReading.final.contradictions.map((c) => `«${cell(c.entry)}» against «${cell(c.record)}»`).join("; ")}` : ""}`);
  }
  lines.push("", "## The fifteen, in full", "");
  for (const s of sources) {
    lines.push(`### ${s.id} — ${s.study} · Table ${s.table} · ${s.attempt}`, "", `Cut by ${s.cut}.`, "");
    const d = state.done[s.id];
    if (!s.record) { lines.push(`Not writable: ${s.recordGap}.`, ""); continue; }
    if (!d?.entry) { lines.push(`Not written${d?.stopped ? `: ${d.stopped}` : ""}.`, ""); continue; }
    lines.push(`Written by ${DM_MODEL} (effort ${DM_EFFORT}) from \`${s.source.path}\` at \`${s.source.commit.slice(0, 8)}\`, session ${s.source.key}; hidden layer: ${s.layerNote}. ${d.repaired ? "A second call repaired a contradiction with the record." : "One call."}`, "",
      ...d.entry.split("\n").map((l) => (l.trim() ? `> ${l}` : ">")), "");
  }
  lines.push("## Money", "", `OpenRouter ${money(v.E0.spentUsd)} of $${CAP_USD}; no OpenAI. Per campaign in the table above.`, "", ...(state.spendChecks ?? []).map((c) => `- spend check (${c.when}, ${String(c.at).slice(0, 16)}): ${c.error ? `not read (${c.error})` : `OpenRouter $${c.left.toFixed(2)} of credit left`}`), "");
  return lines.join("\n");
}

// ---- the command line ----------------------------------------------------------------------------------------------------------

function option(args, name, fallback) { const at = args.indexOf(name); return at >= 0 && args[at + 1] !== undefined ? args[at + 1] : fallback; }
async function writeAtomic(file, text) { await writeFile(`${file}.tmp`, text); await rename(`${file}.tmp`, file); }
const readState = () => (existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, "utf8")) : { designSha256: null, done: {}, spentUsd: 0, refusals: 0, spendChecks: [], ledgerRuns: [] });
/** OpenRouter's credit, read before and after the paid calls; its URL is the door's own (the endpoint helper names hosts). */
export async function spendCheck(door, fetcher = fetch) {
  try {
    const r = await fetcher(new URL("credits", door.messagesUrl).href, { headers: { authorization: `Bearer ${door.apiKey}` }, signal: AbortSignal.timeout(30_000) });
    const v = await r.json().catch(() => null);
    if (!r.ok || !v?.data) return { error: `HTTP ${r.status}` };
    return { totalCredits: v.data.total_credits, totalUsage: Math.round(v.data.total_usage * 10000) / 10000, left: Math.round((v.data.total_credits - v.data.total_usage) * 10000) / 10000 };
  } catch (error) { return { error: String(error?.message ?? error).slice(0, 100) }; }
}

export async function main(args = process.argv.slice(2), out = (line) => process.stdout.write(`${line}\n`)) {
  await mkdir(RUNS, { recursive: true });
  if (args.includes("--sources")) {
    const campaigns = readSources();
    await writeFile(SOURCES_FILE, `${JSON.stringify({ stage: STEM, note: "The fifteen cut campaigns' records, read from their run files at the pinned commits; the run files themselves are never written. Two have no story record (recordGap).", campaigns }, null, 2)}\n`);
    for (const c of campaigns) out(`${c.id}: ${c.record ? `${c.record.n} turns (${c.record.turns.filter((t) => t.reply).length} answered) · DM ${c.record.dm?.split} · layer: ${c.layerNote} · record ${recordText(c).length} chars` : `NO RECORD — ${c.recordGap}`}`);
    out(`design sha256 ${designHash()}`);
    return { campaigns };
  }
  if (args.includes("--write")) {
    const sources = sourcesOf(), only = option(args, "--only", null), state = readState(), hash = designHash();
    if (state.designSha256 && state.designSha256 !== hash) throw new Error("the state has another design hash");
    state.designSha256 = hash;
    const todo = sources.filter((s) => s.record && !state.done[s.id]?.numbers && (!only || only.split(",").includes(s.id)));
    const { runKeys } = await import("../game-player-1/run.mjs");
    const keys = await runKeys();
    if (keys.door?.provider !== "openrouter" || !keys.anthropic) throw new Error("this stage runs through OpenRouter: ANTHROPIC_PROVIDER=openrouter and its key");
    const before = await spendCheck(keys.door);
    state.spendChecks.push({ at: new Date().toISOString(), when: "before", ...before });
    out(`spend check (before): ${before.error ? `not read (${before.error})` : `OpenRouter $${before.left.toFixed(2)} of credit left`}; this stage $${state.spentUsd.toFixed(4)} of $${CAP_USD}`);
    if (before.error) throw new Error("STOP: OpenRouter's credit could not be read");
    if (before.left < 5) throw new Error(`STOP: OpenRouter credit $${before.left.toFixed(2)} is below $5`);
    const ledger = createLedger("openrouter", CAP_USD, state.spentUsd);
    const meter = createMeter({ ledgers: { openrouter: ledger }, waits429: [], log: out, maxRefusals: 3 });
    for (const src of todo) {
      if (meter.stopped) { out(`${src.id}: not written — ${meter.stopped}`); break; }
      const ask = ({ model, system, user, maxTokens, effort, purpose }) => paidCall({ meter, session: src.id, purpose, log: out, call: () => judgeCall({ model, system, user, maxTokens, effort, keys, fetcher: meter.fetch }) });
      const done = await writeOne(src, { ask, log: out });
      await meter.drain();
      state.done[src.id] = { ...done, writtenAt: new Date().toISOString() };
      if (done.entry) {
        await mkdir(EPILOGUES, { recursive: true }); await mkdir(RECORDS, { recursive: true });
        await writeFile(join(EPILOGUES, `${src.id}.md`), epilogueMarkdown(src, done));
        await writeFile(join(RECORDS, `${src.id}.json`), `${JSON.stringify(recordCopy(src, done), null, 2)}\n`);
      }
      state.spentUsd = Math.round(ledger.spentUsd * 10000) / 10000;
      state.refusals = (state.refusals ?? 0) + ledger.calls.filter((c) => c.refusal && !c.counted).map((c) => { c.counted = true; return c; }).length;
      await writeAtomic(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
    }
    const after = await spendCheck(keys.door);
    state.spendChecks.push({ at: new Date().toISOString(), when: "after", ...after });
    state.ledgerRuns.push({ finishedAt: new Date().toISOString(), what: only ? `--only ${only}` : "the rest", spentUsd: Math.round(ledger.runUsd * 10000) / 10000, stopped: meter.stopped ?? null, calls: ledger.calls });
    await writeAtomic(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
    await writeFile(join(RUNS, `${STEM}-ledger-openrouter.md`), `${ledgerMarkdown({ ...ledger, calls: state.ledgerRuns.flatMap((r) => r.calls) }, "Epilogue 1 — the OpenRouter ledger")}\n`);
    out(`spend check (after): ${after.error ? `not read (${after.error})` : `OpenRouter $${after.left.toFixed(2)} of credit left`}; this stage $${state.spentUsd.toFixed(4)} of $${CAP_USD}${meter.stopped ? ` · STOPPED: ${meter.stopped}` : ""}`);
    return state;
  }
  if (args.includes("--own-threads")) {
    const sources = sourcesOf(), state = readState();
    const { runKeys } = await import("../game-player-1/run.mjs");
    const keys = await runKeys();
    if (keys.door?.provider !== "openrouter" || !keys.anthropic) throw new Error("this stage runs through OpenRouter: ANTHROPIC_PROVIDER=openrouter and its key");
    const before = await spendCheck(keys.door);
    state.spendChecks.push({ at: new Date().toISOString(), when: "before the own-thread reading", ...before });
    if (before.error) throw new Error("STOP: OpenRouter's credit could not be read");
    out(`spend check: OpenRouter $${before.left.toFixed(2)} of credit left; this stage $${state.spentUsd.toFixed(4)} of $${CAP_USD}`);
    const ledger = createLedger("openrouter", CAP_USD, state.spentUsd), meter = createMeter({ ledgers: { openrouter: ledger }, waits429: [], log: out, maxRefusals: 3 });
    for (const src of sources.filter((x) => state.done[x.id]?.numbers && !state.done[x.id].own?.final)) {
      if (meter.stopped) { out(`${src.id}: not read — ${meter.stopped}`); break; }
      const ask = ({ model, system, user, maxTokens, effort, purpose }) => paidCall({ meter, session: `own ${src.id}`, purpose, log: out, call: () => judgeCall({ model, system, user, maxTokens, effort, keys, fetcher: meter.fetch }) });
      state.done[src.id].own = await readOwn(src, state.done[src.id].reading.final, ask);
      const w = withoutOwn(state.done[src.id].reading.final, state.done[src.id].own.final);
      out(`${src.id}: own ${w ? `${w.own} (${w.ownNames.join("; ") || "none"}) · without them ${w.threadsEnded}/${w.threads}` : "not read"}`);
    }
    await meter.drain();
    state.spentUsd = Math.round(ledger.spentUsd * 10000) / 10000;
    state.ledgerRuns.push({ finishedAt: new Date().toISOString(), what: "the hero's own threads (post-hoc)", spentUsd: Math.round(ledger.runUsd * 10000) / 10000, stopped: meter.stopped ?? null, calls: ledger.calls });
    await writeAtomic(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
    await writeFile(join(RUNS, `${STEM}-ledger-openrouter.md`), `${ledgerMarkdown({ ...ledger, calls: state.ledgerRuns.flatMap((r) => r.calls) }, "Epilogue 1 — the OpenRouter ledger")}\n`);
    return state;
  }
  if (args.includes("--report")) {
    const sources = sourcesOf(), state = readState();
    state.recordsUntouched = untouched(sources);
    await writeAtomic(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
    const inShort = option(args, "--in-short", null), log = inShort ? readFileSync(resolve(inShort), "utf8").trim() : "";
    const file = join(RUNS, `${STEM}-report.md`);
    await writeFile(file, `${reportMarkdown(sources, state, { log })}\n`);
    out(`written: ${file}`);
    return { file, scores: scores(sources, state) };
  }
  throw new Error("say one of --sources, --write [--only <id>], --own-threads, --report");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => { process.stderr.write(`epilogue-1: ${String(error?.message ?? error)}\n`); process.exit(1); });
}
