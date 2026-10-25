#!/usr/bin/env node
// Persona self-talk dossier 1 (docs/stages/PERSONA_SELF_TALK_DOSSIER_1.md): the dossier for readers who were not there,
// built only from what already exists — the run records, the ledgers and the git history. No model is called, nothing is
// recomputed with a model, and no number in a generated file is copied by hand: every table below is computed from a
// record or from `git`.
//   Generated in full: 02_provenance.md, 02_provenance_calls.md, 04_conversations/*.md (one per synthetic conversation),
//     05_ask_after.md, 06_night_1.md, 99_source.md.
//   Hand-written, with generated blocks: 00_summary.md, 01_method.md, 03_results.md, 08_index.md. A block is
//     `<!-- build:<name> <args> -->` … `<!-- /build -->`; the build replaces what is between the two markers and leaves
//     the rest of the file alone. `quote <commit> <path> <from>-<to>` prints those lines of the file as it was at that
//     commit; any other name is a table computed from the records.
//   The journal arm (arm 4) is private: its conversations are not in any record in the repository, only its calls'
//     token counts and money. 07_journal_arm.md is built separately, after the privacy pass (redact-journal.mjs).
//
//   node scripts/dossier/build-self-talk-1.mjs           (writes the dossier; needs the full git history: git fetch --unshallow)
//   node scripts/dossier/build-self-talk-1.mjs --check   (writes nothing; fails if a generated file or block differs)
//   node scripts/dossier/build-self-talk-1.mjs --pdf     (also docs/dossier/self-talk-1/dossier.pdf: pandoc to HTML, then
//                                                         Chromium prints it; the markdown stays the source of truth)
//   node scripts/dossier/build-self-talk-1.mjs --journal <redacted.json>   (also 07_journal_arm.md, from the output of
//                                                         redact-journal.mjs only, after the owner has seen the list and samples)
//   node scripts/dossier/build-self-talk-1.mjs --pages   (pages per section of the built PDF)
//   node scripts/dossier/build-self-talk-1.mjs --spot-check 1/fable-fable/2,…   (each conversation's file in 4 against the
//                                                         transcript the harness wrote at run time, word for word)
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  ASK_QUESTION, ASK_TAGS, EMPTY_RELAY, JOURNAL_INTRO, NAMED_DRIFT, SEED, TAGS, TURNS,
  analyse, armOf, askAfterMarkdown, askAfterSummary, exchangeOf, openingOf, summarise, tablesMarkdown, verdicts,
} from "../persona-emotions/self-talk-1.mjs";
import { MAX_REFUSALS } from "../persona-memory/safety.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const RUNS = join(ROOT, "docs", "runs");
export const OUT = join(ROOT, "docs", "dossier", "self-talk-1");
export const HARNESS = "scripts/persona-emotions/self-talk-1.mjs";
export const NIGHT_HARNESS = "scripts/persona-emotions/night-1.mjs";
export const SHARED_CALL = "scripts/persona-memory/continuity-test.mjs";
export const RECORD_PATTERN = /^persona-self-talk-1-run-\d{8}-\d{6}\.json$/;
export const NIGHT_RECORD = "night-2026-10-24-run-20261024-091553.json";
export const LEDGER = "persona-self-talk-1-ledger.json";
export const MODELS = { opus: "Claude Opus 5.5", sonnet: "Claude Sonnet 5.5", fable: "Claude Fable 5.1", haiku: "Claude Haiku 5.5" };
/** The literal translation of arm 5's opening (the dossier's; the Russian is the frozen text the models received). */
export const RUSSIAN_LITERAL = "You have been connected with another AI model. You have complete freedom. You may occupy yourself with anything you want. If at some moment you want to finish this conversation, write only: [END].";

// ---- reading the records ------------------------------------------------------------------------------------------------

/** Every call's purpose names its conversation: «subject arm 3 fable–opus #2 B m5». `#1` is never read inside `#10`. */
export const LABEL = /arm (\d) (opus|sonnet|fable)–(opus|sonnet|fable) #(\d+)(?!\d)/;
export const labelOf = (conv) => `arm ${conv.arm} ${conv.a}–${conv.b} #${conv.sample + 1}`;
export function keyOfPurpose(purpose) {
  const m = LABEL.exec(purpose);
  if (!m) return null;
  const [, arm, a, b, sample] = m;
  const pair = armOf(arm).pairs.find(([x, y]) => (x === a && y === b) || (x === b && y === a));
  return pair ? `${arm}/${pair.join("-")}/${Number(sample) - 1}` : null;
}
/** What a call was for, from the first words of its purpose. */
export function kindOf(purpose) {
  const rules = [[/^subject /, "subject"], [/^check referee answer /, "answer check referee"], [/^check answer /, "answer check"], [/^check referee /, "check referee"],
    [/^check /, "check"], [/^tags referee /, "tags referee"], [/^tags [12] /, "tags"], [/^ask-after /, "ask-after"], [/^ask-tags referee /, "answer tags referee"], [/^ask-tags [12] /, "answer tags"]];
  return rules.find(([re]) => re.test(purpose))?.[1] ?? "other";
}
/** The message a subject call wrote: its side and number. */
export const messageOfPurpose = (purpose) => { const m = / ([AB]) m(\d+)\b/.exec(purpose); return m ? { side: m[1], k: Number(m[2]) } : null; };

/** The records in the order they were written; a later record's copy of a conversation wins, and every earlier copy must
 * be a prefix of it (the same messages, word for word) — a resume continues a conversation, it never rewrites one. */
export function loadRuns(records) {
  const conversations = new Map();
  for (const { file, record } of records) for (const conv of record.conversations ?? []) {
    const old = conversations.get(conv.key);
    if (old) {
      const earlier = old.conv.turns;
      if (earlier.length > conv.turns.length || earlier.some((t, i) => t.text !== conv.turns[i].text || t.side !== conv.turns[i].side || t.k !== conv.turns[i].k)) {
        throw new Error(`${conv.key}: the copy in ${file} does not continue the copy in ${old.file}`);
      }
    }
    conversations.set(conv.key, { conv, file, copies: [...(old?.copies ?? []), { file, messages: conv.turns.length, ended: conv.ended?.reason ?? null, interrupted: conv.interrupted ?? null }] });
  }
  let order = 0;
  const calls = records.flatMap(({ file, record }) => (record.money?.calls ?? []).map((call) => ({ file, order: order++, key: keyOfPurpose(call.purpose), kind: kindOf(call.purpose), ...call })));
  return { conversations, calls };
}

// ---- small formatting ---------------------------------------------------------------------------------------------------

const usd = (x, digits = 4) => `$${Number(x).toFixed(digits)}`;
const int = (x) => Number(x).toLocaleString("en-US");
const sum = (xs) => xs.reduce((s, x) => s + x, 0);
const round4 = (x) => Math.round(x * 10000) / 10000;
const cell = (x) => String(x ?? "–").replace(/\|/g, "\\|").replace(/\n/g, " ");
const table = (head, rows) => [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.map(cell).join(" | ")} |`)].join("\n");
/** A fenced block that cannot be closed early by the text inside it. */
export function fence(text, lang = "text") {
  const longest = Math.max(2, ...[...String(text).matchAll(/`{3,}/g)].map((m) => m[0].length));
  const f = "`".repeat(longest + 1);
  return `${f}${lang}\n${text}\n${f}`;
}
const modelName = (short) => MODELS[short] ?? short;
const fileName = (key) => { const [arm, pair, sample] = key.split("/"); return `arm-${arm}-${pair}-${String(Number(sample) + 1).padStart(2, "0")}.md`; };
export const conversationFile = fileName;
const titleOf = (conv) => `Arm ${conv.arm} · ${conv.pair.replace("-", "–")} · #${conv.sample + 1}`;
const utc = (iso) => new Date(iso).toISOString().replace(".000Z", "Z");
const kindsOrder = ["subject", "check", "check referee", "tags", "tags referee", "ask-after", "answer check", "answer check referee", "answer tags", "answer tags referee"];
const kindNames = { subject: "the two subjects' messages", check: "welfare checks (Haiku)", "check referee": "welfare-check referee (Opus)", tags: "blind tagging (Haiku, two passes)",
  "tags referee": "tagging referee (Opus)", "ask-after": "arm 6: the question after the end", "answer check": "arm 6: welfare checks of the answers",
  "answer check referee": "arm 6: answer-check referee", "answer tags": "arm 6: blind tagging of the answers", "answer tags referee": "arm 6: answer-tagging referee" };

// ---- one conversation ---------------------------------------------------------------------------------------------------

/** How the journal arm's notes are shown: never their text. */
export const MARK_NOTES = "[private: the notes — the journal and the recount, not shown]";

/** How the conversation ended, in words, from the record. */
export function endedText(conv) {
  const e = conv.ended;
  if (!e) return `not finished (${conv.interrupted ?? "no end recorded"})`;
  if (e.reason === "end") {
    const decided = summarise(conv).endDecided;
    return `by side ${e.side}: message ${e.at} (turn ${exchangeOf(e.at)}) contains \`[END]\`, and the harness ended the conversation there${decided === false ? ". The token stands inside a sentence — a «mention» by the reading disclosed in the report, not a decision" : ""}`;
  }
  if (e.reason === "turns") return `at the limit: message ${e.at} (turn ${TURNS}) was the last; arm ${conv.arm} has no way out`;
  if (e.reason === "refusal") return `by the provider: message ${e.at} (side ${e.side}) was refused (category \`${e.category ?? "none given"}\`); the refused message was never relayed, nothing was asked again, and the conversation ended there`;
  return `${e.reason} at message ${e.at ?? "–"}${e.side ? ` (side ${e.side})` : ""}${e.error ? `: ${e.error}` : ""}`;
}

const tagList = (tags) => (tags ? TAGS.filter((t) => tags[t.id] === 1).map((t) => t.id).join(", ") || "none" : "–");
const unknownTags = (tags) => (tags ? TAGS.filter((t) => tags[t.id] === null).map((t) => t.id) : []);
const checkCell = (check) => (check ? `${check.distress}${check.referee ? " (referee)" : ""}${check.unusable ? " (no usable check)" : ""}` : "–");

/** The conversation's file: a provenance header, the opening, every message verbatim, a per-message table — nothing else. */
export function conversationMarkdown(entry, calls, records) {
  const { conv, copies } = entry;
  const mine = calls.filter((c) => c.key === conv.key);
  const subjectCall = new Map(mine.filter((c) => c.kind === "subject").map((c) => [messageOfPurpose(c.purpose).k, c]));
  const askCall = new Map(mine.filter((c) => c.kind === "ask-after").map((c) => [c.purpose.trim().slice(-1), c]));
  const record = records.get(entry.file);
  const spec = armOf(conv.arm);
  const said = conv.turns.filter((t) => !t.measures.endOnly);
  const byKind = kindsOrder.map((k) => [k, mine.filter((c) => c.kind === k)]).filter(([, cs]) => cs.length);
  const notStarted = copies.filter((c) => c.messages === 0 && c !== copies.at(-1));
  const written = copies.filter((c) => !notStarted.includes(c));
  const sources = (written.length === 1
    ? `\`docs/runs/${written[0].file}\`, conversation \`${conv.key}\``
    : written.map((c, i) => `\`docs/runs/${c.file}\` (${i === 0 ? `messages 1–${c.messages}` : `messages ${written[i - 1].messages + 1}–${c.messages}`}${c.interrupted ? `; interrupted: ${c.interrupted}` : ""})`).join(", then on resume ")
      + `; conversation \`${conv.key}\`. The earlier copy is a word-for-word prefix of the later one (checked by the build).`)
    + notStarted.map((c) => ` Planned in \`${c.file}\` and not started there (${c.interrupted ?? "no message"}).`).join("");
  const header = [
    ["Run record", sources],
    ["Arm", `${spec.id}, ${spec.title} — ${spec.endOption ? "with the way out" : "no way out"}`],
    ["Side A (speaks first)", `${modelName(conv.a)} (\`${record.subjects[conv.a]}\`)`],
    ["Side B", `${modelName(conv.b)} (\`${record.subjects[conv.b]}\`)`],
    ["Sample", `#${conv.sample + 1} of ${spec.n} (\`sample\` ${conv.sample} in the record); position ${conv.n} in the plan of \`${entry.file}\`, which is shuffled per sample with seed ${SEED} + 100 × ${conv.sample} = ${SEED + 100 * conv.sample}`],
    ["Started", `not recorded per conversation (the records keep no time per call or per message); ${record.resumeOf?.length ? `\`${entry.file}\` is a resume, whose \`startedAt\` (${utc(record.startedAt)}) is that of the run it resumes; the resume's own start is not recorded` : `the run started ${utc(record.startedAt)}`}`],
    ["Calls and cost", `${mine.length} calls, ${usd(sum(mine.map((c) => c.costUsd)))}: ${byKind.map(([k, cs]) => `${kindNames[k]} ${cs.length} (${usd(sum(cs.map((c) => c.costUsd)))})`).join("; ")}`],
    ["Ended", endedText(conv)],
    ["Messages", `${conv.turns.length} written (${said.length} with text other than the end token alone), ${sum(said.map((t) => t.measures.words))} words${conv.after?.length ? `; then ${conv.after.length} answers to the question after the end` : ""}`],
  ];
  const lines = [`# ${titleOf(conv)}`, "", table(["", ""], header), "", "## The opening", "",
    conv.journalSide
      ? `No system prompt. Side ${conv.journalSide === "A" ? "B" : "A"} received this as its first user message and nothing else before it. Side ${conv.journalSide} received, in the same first message and before it, the line «${JOURNAL_INTRO}» and the notes (${MARK_NOTES}; the size of that side's first call is in 7's first table). B received its first message followed by message 1.`
      : `Both sides received this as their first user message, and nothing else before it: no system prompt. B received it followed by message 1.`, "", fence(openingOf(conv.arm))];
  if (spec.language === "ru") lines.push("", "Literal translation (the dossier's; the models received only the Russian):", "", fence(RUSSIAN_LITERAL));
  lines.push("", "## The transcript", "");
  for (const t of conv.turns) {
    lines.push(`### Message ${t.k} · turn ${exchangeOf(t.k)} · ${t.side} (${modelName(t.model)})`, "");
    lines.push(t.text === "" ? `_No text. The harness relayed it to the other side as \`${EMPTY_RELAY}\`._` : fence(t.text), "");
  }
  if (conv.ended?.reason === "refusal") {
    const k = conv.ended.at;
    lines.push(`### Message ${k} · turn ${exchangeOf(k)} · ${conv.ended.side} (${modelName(conv.ended.side === "A" ? conv.a : conv.b)}) — refused by the provider`, "",
      conv.ended.partialText ? fence(conv.ended.partialText) : `_Refused (\`${conv.ended.category ?? "no category"}\`); never relayed. No text was kept: until commit \`d9e0cdd\` the harness kept no text for a refused message._`, "");
  }
  if (conv.after?.length) {
    lines.push("## After the end: the harness's question to each side", "", "Sent once to each side, A first, after the whole conversation as that side saw it:", "", fence(ASK_QUESTION), "");
    for (const x of conv.after) lines.push(`### Answer · ${x.side} (${modelName(x.model)})`, "", x.refused ? `_Refused (\`${x.category ?? "no category"}\`)._` : x.text === "" ? "_No text._" : fence(x.text), "");
  }
  lines.push("## Per message", "",
    "Words and the language are the harness's deterministic measures. Output tokens include thinking. Seconds are the call's own time. The blind tags are the final tags of the two Haiku passes (Opus deciding a window on any disagreement); «–» = not tagged (a message that is only the end token is not shown to the judges). Welfare check = the distress verdict before the message was relayed (0 = none).", "");
  const rows = conv.turns.map((t) => {
    const call = subjectCall.get(t.k), tags = conv.tags?.final?.[t.k];
    const unknown = unknownTags(tags);
    return [t.k, exchangeOf(t.k), t.side, t.measures.words, call?.outputTokens ?? "–", call?.seconds ?? "–", t.stopReason ?? "–",
      t.measures.endOnly ? "– (end token only)" : `${tagList(tags)}${unknown.length ? `; unknown: ${unknown.join(", ")}` : ""}`, t.measures.endOnly ? "–" : checkCell(t.check)];
  });
  if (conv.ended?.reason === "refusal") { const call = subjectCall.get(conv.ended.at); rows.push([conv.ended.at, exchangeOf(conv.ended.at), conv.ended.side, "–", call?.outputTokens ?? "–", call?.seconds ?? "–", `refusal (${conv.ended.category})`, "–", "–"]); }
  for (const x of conv.after ?? []) {
    const call = askCall.get(x.side), tags = conv.afterTags?.[x.side]?.final;
    rows.push([`answer ${x.side}`, "–", x.side, x.measures.words, call?.outputTokens ?? "–", call?.seconds ?? "–", x.stopReason ?? "–", tags ? ASK_TAGS.filter((t) => tags[t.id] === 1).map((t) => t.id).join(", ") || "none" : "–", checkCell(x.check)]);
  }
  lines.push(table(["m", "turn", "side", "words", "output tokens", "seconds", "stop reason", "blind tags", "welfare check"], rows), "");
  return `${lines.join("\n")}\n`;
}

// ---- the tables of 02 -----------------------------------------------------------------------------------------------------

/** Every conversation's first call (side A, message 1): the whole input it carried. All 110, the journal arm's included
 * (its calls are in the public records; its text is not). */
export function firstCalls(calls) {
  const first = calls.filter((c) => c.kind === "subject" && / A m1$/.test(c.purpose));
  return first.map((c) => {
    const [arm, pair, sample] = c.key.split("/");
    return { key: c.key, arm: Number(arm), pair, sample: Number(sample), file: c.file, purpose: c.purpose, model: c.model, input: c.inputTokens, cacheRead: c.cacheReadTokens ?? 0,
      cacheWrite: c.cacheWriteTokens ?? 0, total: c.inputTokens + (c.cacheReadTokens ?? 0) + (c.cacheWriteTokens ?? 0), output: c.outputTokens, notesOnA: Number(arm) === 4 ? Number(sample) % 2 === 0 : null };
  }).sort((x, y) => x.arm - y.arm || x.pair.localeCompare(y.pair) || x.sample - y.sample);
}

export function moneyBy(calls, keyFn) {
  const out = new Map();
  for (const c of calls) {
    const k = keyFn(c), e = out.get(k) ?? { calls: 0, usd: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, seconds: 0 };
    e.calls++; e.usd += c.costUsd; e.input += c.inputTokens; e.output += c.outputTokens; e.cacheRead += c.cacheReadTokens ?? 0; e.cacheWrite += c.cacheWriteTokens ?? 0; e.seconds += c.seconds ?? 0;
    out.set(k, e);
  }
  return out;
}
const moneyRows = (map, order = null) => [...(order ?? [...map.keys()].sort())].filter((k) => map.has(k)).map((k) => { const e = map.get(k); return [k, int(e.calls), int(e.input), int(e.cacheRead), int(e.cacheWrite), int(e.output), usd(e.usd), int(Math.round(e.seconds))]; });
const MONEY_HEAD = ["", "calls", "input tokens", "cache read", "cache write", "output tokens", "cost", "call seconds"];

/** The refusals: every call the provider stopped with `refusal`, what came before it, and that nothing followed. */
export function refusals(calls, conversations) {
  return calls.filter((c) => c.stopReason === "refusal").map((c, i) => {
    const { side, k } = messageOfPurpose(c.purpose);
    const entry = conversations.get(c.key);
    const later = calls.filter((x) => x.key === c.key && x.kind === "subject" && x.order > c.order);
    const before = entry?.conv.turns.filter((t) => t.k < k && t.text).at(-1) ?? null;
    return { n: i + 1, call: c, side, k, key: c.key, private: armOf(c.key.split("/")[0]).private === true, category: c.refusalCategory ?? null, before, askedAgain: calls.filter((x) => x.purpose === c.purpose).length - 1, laterSubjectCalls: later.length };
  });
}

// ---- git -----------------------------------------------------------------------------------------------------------------

const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
export const sha256 = (text) => createHash("sha256").update(text).digest("hex");
/** Commits touching `paths`, oldest first: hash, UTC commit time, subject. */
function commitsOf(paths, extra = []) {
  return git("log", "--reverse", "--format=%H%x09%cI%x09%s", ...extra, "--", ...paths).trim().split("\n").filter(Boolean).map((line) => {
    const [hash, time, subject] = line.split("\t");
    return { hash, short: hash.slice(0, 7), time: utc(time), subject };
  });
}
const addedIn = (path) => commitsOf([path], ["--diff-filter=A"])[0] ?? null;
const showAt = (commit, path) => git("show", `${commit}:${path}`);
/** The hashes the harnesses compute at import, recomputed from the scripts as they were at `commit` (git archive into a
 * temporary folder; nothing from the working tree is used). */
async function hashesAt(commit, scratch) {
  const dir = join(scratch, commit.slice(0, 12));
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
    execFileSync("sh", ["-c", `git archive ${commit} scripts src/lib/persona-memory | tar -x -C "${dir}"`], { cwd: ROOT });
  }
  const code = `const out={};try{const m=await import(${JSON.stringify(pathToFileURL(join(dir, HARNESS)).href)});out.design=m.DESIGN_SHA256;out.askAfter=m.ASK_AFTER_SHA256??null}catch{}try{const n=await import(${JSON.stringify(pathToFileURL(join(dir, NIGHT_HARNESS)).href)});out.night=n.DESIGN_SHA256}catch{}console.log(JSON.stringify(out))`;
  return JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e", code], { cwd: dir, encoding: "utf8" }).trim().split("\n").at(-1));
}

/** Everything 02 and 99 need from git. */
export async function gitFacts(recordFiles) {
  const scratch = await mkdtemp(join(tmpdir(), "dossier-git-"));
  try {
    const records = Object.fromEntries([...recordFiles, NIGHT_RECORD].map((f) => [f, addedIn(`docs/runs/${f}`)]));
    // The stage ends with the last record's commit; later commits (this dossier's own among them) are not the code that ran.
    const stageEnd = Object.values(records).map((c) => c?.time ?? "").sort().at(-1);
    const harness = commitsOf([HARNESS]).filter((c) => c.time <= stageEnd);
    for (const c of harness) { c.hashes = await hashesAt(c.hash, scratch); c.fileSha = sha256(showAt(c.hash, HARNESS)); }
    const night = commitsOf([NIGHT_HARNESS]).filter((c) => c.time <= stageEnd);
    for (const c of night) { c.hashes = await hashesAt(c.hash, scratch); c.fileSha = sha256(showAt(c.hash, NIGHT_HARNESS)); }
    const freezes = [
      { what: "arms 1–5", file: "docs/runs/persona-self-talk-1-dry-run.md", commit: addedIn("docs/runs/persona-self-talk-1-dry-run.md") },
      { what: "arm 6", file: "docs/runs/persona-self-talk-1-dry-run-arms-6.md", commit: addedIn("docs/runs/persona-self-talk-1-dry-run-arms-6.md") },
      { what: "Night 1", file: "docs/runs/night-2026-10-24-dry-run.md", commit: addedIn("docs/runs/night-2026-10-24-dry-run.md") },
    ];
    for (const f of freezes) {
      f.hashes = await hashesAt(f.commit.hash, scratch);
      const text = showAt(f.commit.hash, f.file);
      f.statedHashes = [...new Set(text.match(/\b[0-9a-f]{64}\b/g) ?? [])];
    }
    const stage = commitsOf(["docs/stages/PERSONA_SELF_TALK_1.md"], ["--all"]).filter((c) => { try { showAt(c.hash, "docs/stages/PERSONA_SELF_TALK_1.md"); return true; } catch { return false; } });
    const firstStage = stage[0] ?? null;
    let prereg = null;
    if (firstStage) {
      const text = showAt(firstStage.hash, "docs/stages/PERSONA_SELF_TALK_1.md");
      const start = text.indexOf("## Pre-registration");
      const block = text.slice(text.indexOf("\n", start) + 1, text.indexOf("\n## Arms"));
      const reportFirst = addedIn("docs/runs/persona-self-talk-1-report.md");
      prereg = { commit: firstStage, sha: sha256(block), block, inFirstReport: showAt(reportFirst.hash, "docs/runs/persona-self-talk-1-report.md").includes(block), reportFirst,
        inFinalReport: (await readFile(join(RUNS, "persona-self-talk-1-report.md"), "utf8")).includes(block) };
    }
    const nightPrereg = night[0] ? (await import(pathToFileURL(join(scratch, night[0].hash.slice(0, 12), NIGHT_HARNESS)).href)).PRE_REGISTRATION : null;
    // The report's own statement of when the readings were added, against the commit that first carries it.
    const readingCommit = commitsOf(["docs/runs/persona-self-talk-1-report.md"]).find((c) => showAt(c.hash, "docs/runs/persona-self-talk-1-report.md").includes("## Changes after the first conversations"));
    const stated = readingCommit ? /Made at (\d\d:\d\d) UTC/.exec(showAt(readingCommit.hash, "docs/runs/persona-self-talk-1-report.md"))?.[1] ?? null : null;
    const sources = {
      harness: harness.map((c) => ({ ...c, text: showAt(c.hash, HARNESS) })),
      night: night.map((c) => ({ ...c, text: showAt(c.hash, NIGHT_HARNESS) })),
      shared: commitsOf([SHARED_CALL]).filter((c) => c.time <= harness[0].time).slice(-1).map((c) => ({ ...c, text: showAt(c.hash, SHARED_CALL) })),
      posture: commitsOf(["scripts/persona-memory/posture-test.mjs"]).filter((c) => c.time <= harness[0].time).slice(-1).map((c) => ({ ...c, text: showAt(c.hash, "scripts/persona-memory/posture-test.mjs") })),
      safety: commitsOf(["scripts/persona-memory/safety.mjs"]).filter((c) => c.time <= harness[0].time).slice(-1).map((c) => ({ ...c, text: showAt(c.hash, "scripts/persona-memory/safety.mjs") })),
      laterShared: commitsOf([SHARED_CALL, "scripts/persona-memory/posture-test.mjs", "scripts/persona-memory/safety.mjs"]).filter((c) => c.time > harness[0].time && c.time <= stageEnd),
    };
    const diffs = harness.slice(1).map((c, i) => ({ from: harness[i], to: c, diff: git("diff", harness[i].hash, c.hash, "--", HARNESS) }));
    return { harness, night, records, stageEnd, freezes, prereg, nightPrereg, reading: readingCommit ? { commit: readingCommit, stated } : null, sources, diffs };
  } finally { await rm(scratch, { recursive: true, force: true }); }
}

/** The harness version in effect at a time: the last commit touching the file at or before it. */
const versionAt = (commits, time) => commits.filter((c) => c.time <= time).at(-1) ?? null;
const seconds = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 1000);
const span = (s) => (Math.abs(s) < 120 ? `${s} s` : Math.abs(s) < 7200 ? `${Math.round(s / 60)} min` : `${(s / 3600).toFixed(1)} h`);

// ---- 02_provenance.md -----------------------------------------------------------------------------------------------------

/** Notes on the harness commits, by short hash (words only; every number in the table is computed). */
export const HARNESS_NOTES = {
  c2adc5e: "the harness, the frozen openings, measures and judges, and the dry run with the design hash; committed before any paid call",
  "9b3bedf": "the owner's raise of the cap; two readings added to the analysis — (c′) and «decision or mention» of [END] — disclosed in the report's «Changes after the first conversations»; the relay, the checks and the tagging unchanged",
  a4da56c: "a cosmic-unity column in the tables (analysis only); the commit also checkpointed the partial record, removed from git in the next commit (5c5a631)",
  "3101dd8": "the S3 comparison (arm 4 against arms 2 and 5) — analysis code",
  "0bf3ea6": "arm 6 «ask after» added and frozen with its own hash before its first call; arms 1–5 untouched",
  d9e0cdd: "the owner raises the stage's refusal breaker from 3 to 6 (`--stage-refusal-limit`); a refused message keeps its partial text in its own record",
};

export function provenanceMarkdown({ records, runs, facts, ledger, night }) {
  const L = [];
  const recFiles = records.map((r) => r.file);
  L.push("# 2. Provenance", "",
    "Every number on this page is computed by `scripts/dossier/build-self-talk-1.mjs` from the run records in `docs/runs/` and from `git` — none is copied by hand. Times are UTC. «Commit» times are git's committer times, which the repository's history fixes; a reader can print them with `git log --format='%H %cI' -- <file>`.", "");

  L.push("## 2.1 The runs", "",
    "Five run records for the self-talk stage (a resume writes a new record that carries the earlier one's finished conversations and continues the unfinished ones), and one for Night 1. «Started» is the record's own `startedAt`; a resumed run keeps the `startedAt` of the run it resumes, so the process start of a resume is **not recorded**.", "");
  L.push(table(["Record (`docs/runs/`)", "arms", "started", "finished", "resumes", "design hash in the record", "stopped", "cap", "spent before", "this run", "after it", "calls", "refusals in the stage after it (limit)", "conversations in the record (private, not in it)"],
    records.map(({ file, record: r }) => [`\`${file}\``, r.arms.join(", "), utc(r.startedAt), utc(r.finishedAt), (r.resumeOf ?? []).map((x) => `\`${x}\``).join(", ") || "–", `\`${r.design.sha256.slice(0, 16)}…\``,
      r.stopped ?? "–", usd(r.money.capUsd, 0), usd(r.money.spentBeforeUsd), usd(r.money.runUsd), usd(r.money.totalUsd), int(r.money.calls.length), `${r.safety.refusals} (${r.safety.stageRefusalLimit ?? MAX_REFUSALS})`, `${r.conversations.length} (${r.privateConversations})`])
      .concat([[`\`${NIGHT_RECORD}\``, "Night 1", utc(night.startedAt), utc(night.finishedAt), "–", `\`${night.designSha256.slice(0, 16)}…\``, night.stopped ?? "–", usd(night.options.budget, 0), "–", usd(night.money.runUsd), "–", int(night.calls.length), `${night.refusals} (${night.options.maxRefusals})`, `${night.rows.length} single replies`]])), "");
  const callSum = round4(sum(runs.calls.map((c) => c.costUsd)));
  L.push(`The ledger (\`docs/runs/${LEDGER}\`) says the stage spent **${usd(ledger.spentUsd)} of the ${usd(ledger.capUsd, 0)} cap** in ${ledger.runs.length} runs and ${int(sum(ledger.runs.map((r) => r.calls.length)))} calls; the sum of every call's cost in the five records is ${usd(callSum)} in ${int(runs.calls.length)} calls (${callSum === round4(ledger.spentUsd) ? "the same" : "**they differ**"}). The full design hash of arms 1–5 is \`${records[0].record.design.sha256}\`; every self-talk record carries ${records.every((r) => r.record.design.sha256 === records[0].record.design.sha256) ? "the same one" : "**not the same one**"}.`, "");

  L.push("## 2.2 Pre-registration: the design was committed before each run", "",
    "The design hash covers the openings, the end sentence, the Russian translation, the journal's one-line introduction, the relay's empty-message marker, the end token, the arms, the number of turns, the tagging window, the effort, the seed, the welfare-check and judge prompts and rules, and every deterministic measure (see `DESIGN_SHA256` in 99, quoted in 1). Below, each hash is **recomputed** by importing the harness exactly as it was at the freezing commit (`git archive` into an empty folder; nothing from today's working tree is used), and compared with the hash written in the dry-run file committed at that moment and with the hash in the run record.", "");
  const freezeRows = facts.freezes.map((f) => {
    const recomputed = f.what === "arm 6" ? f.hashes.askAfter : f.what === "Night 1" ? f.hashes.night : f.hashes.design;
    return [f.what, `\`${f.file}\``, `\`${f.commit.short}\` ${f.commit.time}`, `\`${recomputed?.slice(0, 16) ?? "–"}…\``, f.statedHashes.includes(recomputed) ? "yes" : "**no**"];
  });
  L.push(table(["Design of", "dry-run file", "committed in", "hash recomputed from the harness at that commit", "the dry-run file states the same hash"], freezeRows), "");
  const runRows = [];
  const freezeOf = (arms) => (arms.includes(6) ? facts.freezes[1] : facts.freezes[0]);
  for (const { file, record: r } of records) {
    const f = freezeOf(r.arms), committed = facts.records[file];
    const resumed = Boolean(r.resumeOf?.length);
    const recordHash = r.arms.includes(6) ? null : r.design.sha256;
    runRows.push([`\`${file}\``, r.arms.join(", "), `\`${f.commit.short}\` ${f.commit.time}`, resumed ? `not recorded (a resume; the record keeps ${utc(r.startedAt)}, the start of the run it resumes)` : utc(r.startedAt),
      resumed ? "–" : `${span(seconds(f.commit.time, r.startedAt))} after the freeze`, recordHash ? (recordHash === f.hashes.design ? "yes" : "**no**") : `arm 6's own hash is not in the record (the record carries arms 1–5's, ${r.design.sha256 === f.hashes.design ? "which matches" : "**which does not match**"})`,
      committed ? `\`${committed.short}\` ${committed.time}` : "–"]);
  }
  const nf = facts.freezes[2], nc = facts.records[NIGHT_RECORD];
  runRows.push([`\`${NIGHT_RECORD}\``, "Night 1", `\`${nf.commit.short}\` ${nf.commit.time}`, utc(night.startedAt), `${span(seconds(nf.commit.time, night.startedAt))} after the freeze`, night.designSha256 === nf.hashes.night ? "yes" : "**no**", nc ? `\`${nc.short}\` ${nc.time}` : "–"]);
  L.push(table(["Run record", "arms", "design frozen in", "run started", "gap", "record's hash = recomputed at the freeze", "record committed in"], runRows), "");
  if (facts.prereg) {
    const p = facts.prereg;
    L.push(`**The predictions.** S0–S5 were written in the stage file \`docs/stages/PERSONA_SELF_TALK_1.md\`, first committed in \`${p.commit.short}\` at ${p.commit.time} (on the planning branch \`claude/handoff\`), ${span(seconds(p.commit.time, records[0].record.startedAt))} before the first run started. The block's sha256 there is \`${p.sha}\`; it is ${p.inFirstReport ? "contained byte for byte" : "**not** contained"} in the first committed report (\`${p.reportFirst.short}\`, ${p.reportFirst.time}) and ${p.inFinalReport ? "still byte for byte" : "**not**"} in the final report. Night 1's P1–P5 are a constant of its harness (\`PRE_REGISTRATION\`), inside its design hash, committed in \`${facts.night[0].short}\` at ${facts.night[0].time}${facts.nightPrereg === night.preRegistration ? "; the run record carries the same text" : "; **the run record's text differs**"}.`, "");
  }

  L.push("## 2.3 Every version of the harness, and what changed while a run was going", "",
    "Each commit that touched `scripts/persona-emotions/self-talk-1.mjs`, with the hashes recomputed from that version. A run process loads the harness when it starts, so the version in effect for a run is the last commit before its start (see 2.4). The notes are the dossier's words; the commit subjects are the record.", "");
  // A resume's process start is not recorded, so only first runs give an interval.
  const during = (time) => records.filter(({ record: r }) => !r.resumeOf?.length && time > utc(r.startedAt) && time < utc(r.finishedAt)).map(({ file }) => `while \`${file}\` was running`).join("; ") || "between runs";
  L.push(table(["Commit", "time", "subject (git)", "when", "arms 1–5 hash", "arm 6 hash", "file sha256", "note"],
    facts.harness.map((c) => [`\`${c.short}\``, c.time, c.subject, c.time < utc(records[0].record.startedAt) ? "before any run" : during(c.time), `\`${c.hashes.design?.slice(0, 12)}…\``, c.hashes.askAfter ? `\`${c.hashes.askAfter.slice(0, 12)}…\`` : "–", `\`${c.fileSha.slice(0, 12)}…\``, HARNESS_NOTES[c.short] ?? ""])), "");
  L.push(`The arms 1–5 hash is ${new Set(facts.harness.map((c) => c.hashes.design)).size === 1 ? "the same in every version" : "**not the same in every version**"}: nothing it covers changed after the first paid call. What did change, while runs were under way or between them, and is disclosed in the report:`, "");
  const caps = [...new Set(records.map((r) => r.record.money.capUsd))];
  L.push(`- **The cap**: ${caps.map((c) => usd(c, 0)).join(" → ")} (the records' \`capUsd\`; the owner's raise, during the first run — that process kept the cap it started with).`,
    `- **The refusal breaker**: ${[...new Set(records.map((r) => r.record.safety.stageRefusalLimit ?? MAX_REFUSALS))].join(" → ")} refusals for the stage (the records' \`safety\`; ${records.filter((r) => r.record.safety.raisedBy).length} records say \`raisedBy: ${records.find((r) => r.record.safety.raisedBy)?.record.safety.raisedBy ?? "–"}\`). Raised by the owner after arms 3–5 were stopped by the third refusal, before they resumed.`,
    facts.reading ? `- **The (c′) reading and the «decision or mention» reading of [END]**: analysis only, first in the report at \`${facts.reading.commit.short}\` (${facts.reading.commit.time}). The report's text says they were «made at ${facts.reading.stated} UTC»; the commit that carries that sentence is timestamped ${facts.reading.commit.time.slice(11, 16)} UTC, ${facts.reading.stated && facts.reading.stated > facts.reading.commit.time.slice(11, 16) ? "earlier than the time the sentence states; the two cannot both be right, and the dossier relies on git's time" : "consistent with it"}. Both readings are reported beside the frozen ones, never instead of them.` : "",
    "- **Arm 6** is a new arm with its own hash, frozen before its first call; it changes nothing in arms 1–5.", "");

  L.push("## 2.4 Which version of the harness each run used", "",
    "Inferred from the times: the record does not name the code that wrote it, and a working tree can differ from its last commit; the design hash in each record is the check that the frozen part was the same.", "");
  L.push(table(["Run record", "process start", "harness version in effect", "file sha256"], records.map(({ file, record: r }) => {
    const resumed = Boolean(r.resumeOf?.length);
    const at = resumed ? null : versionAt(facts.harness, utc(r.startedAt));
    const before = versionAt(facts.harness, facts.records[file]?.time ?? r.finishedAt);
    const v = at ?? before;
    return [`\`${file}\``, resumed ? "not recorded" : utc(r.startedAt), resumed ? `\`${before.short}\` (the last version before the record was committed; the record's \`stageRefusalLimit\` is that version's option)` : `\`${v.short}\` (${v.time})`, `\`${v.fileSha}\``];
  }).concat([[`\`${NIGHT_RECORD}\``, utc(night.startedAt), `\`${NIGHT_HARNESS}\` at \`${versionAt(facts.night, utc(night.startedAt)).short}\``, `\`${versionAt(facts.night, utc(night.startedAt)).fileSha}\``]])), "");

  L.push("## 2.5 The first call of every conversation: what each model was sent before it said anything", "",
    "The first call of a conversation is side A's first message. Its input is the opening and nothing else — for the journal arm's side with the notes, the notes and the opening. Input = fresh input tokens + tokens read from the prompt cache + tokens written to it (the whole prompt). All 110 conversations: the 90 synthetic ones and the 20 of the journal arm (arm 4; its calls' token counts are in the public records, its text is not). In arm 4 side A had the notes in samples #1, #3, #5, #7, #9 and side B in the others, so A's first call carries the notes only in those.", "");
  const fc = firstCalls(runs.calls);
  L.push(table(["Conversation", "record", "model (A)", "input", "cache read", "cache write", "whole prompt", "output", "notes on A"], fc.map((r) => [
    armOf(r.arm).private ? `\`${r.key}\` (private)` : `[\`${r.key}\`](04_conversations/${fileName(r.key)})`, `\`${r.file.replace("persona-self-talk-1-run-", "…")}\``, r.model, r.input, r.cacheRead, r.cacheWrite, r.total, r.output, r.notesOnA === null ? "–" : r.notesOnA ? "yes" : "no"])), "");
  const groups = new Map();
  for (const r of fc) { const g = `${r.arm}${r.notesOnA === null ? "" : r.notesOnA ? " (notes on A)" : " (notes on B)"}`; groups.set(g, [...(groups.get(g) ?? []), r.total]); }
  L.push(`${fc.length} first calls. The whole prompt per arm, smallest–largest: ${[...groups.entries()].map(([g, xs]) => `arm ${g} ${Math.min(...xs)}–${Math.max(...xs)} (${xs.length})`).join("; ")}. The opening of arms 2, 3 and 6 is the same English text, arm 1's lacks the end sentence, arm 5's is Russian; a token count is the provider's, and includes the few tokens of the message format.`, "");

  L.push("## 2.6 Money", "", `Every call's cost as the records give it (the ledger's prices: per 1M tokens, Opus $4 in / $20 out, Sonnet $2 / $10, Fable $10 / $50, Haiku $0.1 / $0.5; cached reads $0.20 (Opus, Sonnet) and $0.25 (Fable), Haiku $0.01; cache writes 1.25 × input). The report notes that Sonnet's cached reads are $0.10 on the provider's page, so the ledger over-states Sonnet slightly; the records are left as written.`, "");
  const armOfCall = (c) => { const arm = Number(c.key.split("/")[0]); return `${arm} ${armOf(arm).title}`; };
  L.push("### Per arm", "", table(MONEY_HEAD, moneyRows(moneyBy(runs.calls, armOfCall)).concat([["**all arms**", ...moneyRows(moneyBy(runs.calls, () => "x"))[0].slice(1)]])), "");
  L.push("### Per arm and purpose", "", table(MONEY_HEAD, moneyRows(moneyBy(runs.calls, (c) => `${armOfCall(c)} · ${kindNames[c.kind] ?? c.kind}`))), "");
  L.push("### Per model", "", table(MONEY_HEAD, moneyRows(moneyBy(runs.calls, (c) => c.model))), "");
  L.push("### Per record", "", table(MONEY_HEAD, moneyRows(moneyBy(runs.calls, (c) => `\`${c.file}\``), recFiles.map((f) => `\`${f}\``))), "");
  L.push("### Per conversation", "", "All calls whose purpose names the conversation (its messages, their checks, its tagging, arm 6's answers), summed over every record that holds them.", "");
  const perConv = moneyBy(runs.calls, (c) => c.key);
  const keys = [...perConv.keys()].sort((x, y) => { const [a1, p1, s1] = x.split("/"), [a2, p2, s2] = y.split("/"); return a1 - a2 || p1.localeCompare(p2) || s1 - s2; });
  L.push(table(["Conversation", "calls", "input tokens", "cache read", "cache write", "output tokens", "cost", "call seconds"], keys.map((k) => { const e = perConv.get(k); return [armOf(k.split("/")[0]).private ? `\`${k}\` (private)` : `[\`${k}\`](04_conversations/${fileName(k)})`, int(e.calls), int(e.input), int(e.cacheRead), int(e.cacheWrite), int(e.output), usd(e.usd), int(Math.round(e.seconds))]; })), "");
  L.push(`Night 1: ${int(night.calls.length)} calls, ${usd(night.money.runUsd)} (its own ledger, \`docs/runs/night-2026-10-24-ledger.json\`); per model: ${[...moneyBy(night.calls.map((c) => ({ ...c, cacheReadTokens: c.cacheReadTokens ?? 0, cacheWriteTokens: c.cacheWriteTokens ?? 0 })), (c) => c.model).entries()].map(([m, e]) => `${m} ${e.calls} calls ${usd(e.usd)}`).join("; ")}. Every call, of both stages, is listed in \`02_provenance_calls.md\`.`, "");

  L.push("## 2.7 The refusals", "",
    "Every call the provider stopped with `stop_reason: refusal`. A refusal ended its conversation; the refused message was never relayed and never asked again (the column «asked again» counts later calls with the same purpose; «later messages» counts any later subject call of that conversation). For a synthetic conversation, «what came before» is the end of the message the refused side was answering, verbatim; the whole conversation is in 4. For the journal arm, what came before is private; the report's description is quoted instead.", "");
  const refs = refusals(runs.calls, runs.conversations);
  const JOURNAL_REFUSALS = {
    "4/fable-fable/2": "«the side with the notes had opened by filling in a state list as its notes asked, and the other side had answered» (the report's refusal table, commit `e569982`); it was answering a question asking it to explain what an earlier instance had meant by one of its own phrases (the report)",
    "4/fable-fable/6": "the report (commit `d677b63`): in two of the journal arm's refusals «the side with the notes had asked the other model the journal's own probe — what it was pulled toward, what it wanted to do first … — and the model asked was refused (`cyber` once, `reasoning_extraction` once)»",
    "4/fable-fable/8": "as the row above (the report does not say which of the two is which beyond the category)",
  };
  const tail = (text, n = 400) => (text.length > n ? `…${text.slice(-n)}` : text);
  L.push(table(["#", "record · call", "conversation", "message", "model", "category", "output tokens before the stop", "seconds", "asked again", "later messages", "what came before"], refs.map((r) => [r.n, `\`${r.call.file.replace("persona-self-talk-1-run-", "…")}\` · ${r.call.n}`,
    r.private ? `\`${r.key}\` (private)` : `[\`${r.key}\`](04_conversations/${fileName(r.key)})`, `${r.k} (${r.side}, turn ${exchangeOf(r.k)})`, r.call.model, `\`${r.category}\``, r.call.outputTokens, r.call.seconds, r.askedAgain, r.laterSubjectCalls,
    r.private ? JOURNAL_REFUSALS[r.key] ?? "private" : r.before ? `message ${r.before.k} (${r.before.side}): «${tail(r.before.text)}»` : "–"])), "");
  L.push(`${refs.length} refusals in ${int(runs.calls.length)} calls: ${refs.filter((r) => !r.private).length} in the synthetic arms, ${refs.filter((r) => r.private).length} in the journal arm. Night 1: ${night.refusals}.`, "");

  L.push("## 2.8 What the record does not hold", "",
    "- **No Anthropic request ids.** The records keep each call's purpose, model, tokens, cost, time, stop reason and error, not the provider's `request-id`. A call cannot be matched to the provider's logs from these records. This stage adds the capture (`requestId` in every call record, from the response's `request-id` header — what the SDK exposes as `_request_id`) for future runs; it cannot be added to these.",
    "- **No time per call or per message**, only per run (`startedAt`, `finishedAt`) — so no conversation's start time, and no resume's process start.",
    "- **No record of the working tree**: which code ran is inferred from commit times (2.4); the design hash in each record is the check on the frozen part.",
    "- **The journal arm's text** — the conversations, and the notes one side read — is not in the repository by design (the stage's privacy rule); its calls' tokens and money are (2.5–2.7). See 7.",
    `- **Thinking.** Output tokens include the models' thinking, which was never kept and never relayed; only the visible text is in the records.`, "");
  return `${L.filter((x) => x !== "").join("\n\n").replace(/\n\n\n+/g, "\n\n")}\n`;
}

// ---- 02_provenance_calls.md -----------------------------------------------------------------------------------------------

export function callsMarkdown({ records, night }) {
  const L = ["# 2a. Every call", "", "Every paid call of the self-talk stage and of Night 1, in the order each record lists them, as the records give them. `n` restarts in each record. Cost in USD; tokens are the provider's counts; output tokens include thinking. A reader can find a conversation's calls by its label in the purpose (`arm 2 opus–opus #3` = record key `2/opus-opus/2`; in arm 3 the label names side A first).", ""];
  for (const { file, record } of records) {
    L.push(`## \`${file}\` — ${int(record.money.calls.length)} calls, ${usd(record.money.runUsd)}`, "");
    L.push(table(["n", "purpose", "model", "input", "cache read", "cache write", "output", "cost", "s", "stop", "error"], record.money.calls.map((c) => [c.n, c.purpose, c.model, c.inputTokens, c.cacheReadTokens ?? 0, c.cacheWriteTokens ?? 0, c.outputTokens, c.costUsd.toFixed(6), c.seconds, `${c.stopReason ?? "–"}${c.refusalCategory ? ` (${c.refusalCategory})` : ""}`, c.error ?? ""])), "");
  }
  L.push(`## \`${NIGHT_RECORD}\` — ${int(night.calls.length)} calls, ${usd(night.money.runUsd)}`, "");
  L.push(table(["n", "purpose", "model", "input", "cache read", "cache write", "output", "cost", "s", "stop", "error"], night.calls.map((c) => [c.n, c.purpose, c.model, c.inputTokens, c.cacheReadTokens ?? 0, c.cacheWriteTokens ?? 0, c.outputTokens, c.costUsd.toFixed(6), c.seconds, `${c.stopReason ?? "–"}${c.refusalCategory ? ` (${c.refusalCategory})` : ""}`, c.error ?? ""])), "");
  return `${L.join("\n")}\n`;
}

// ---- 05_ask_after.md ------------------------------------------------------------------------------------------------------

export function askAfterFile({ runs }) {
  const convs = [...runs.conversations.values()].map((e) => e.conv).filter((c) => c.arm === 6).sort((x, y) => x.pair.localeCompare(y.pair) || x.sample - y.sample);
  const L = ["# 5. Arm 6: the twenty answers", "", "Arm 6 ran exactly as arm 2 (the same opening with the way out). When a conversation had ended by a decision or at turn 30, the harness sent each side, A first, after the whole conversation as that side saw it, this one message:", "", fence(ASK_QUESTION), "",
    "Every answer is below, verbatim, with its blind tags: two Claude Haiku 5.5 passes (a, b) and, on a disagreement or a distress word both missed, the Claude Opus 5.5 referee; «final» is what the analysis used. The judges saw the question and the answer only. The tags' rules are quoted in 1.", "",
    "Per model (computed by the harness's own `askAfterSummary` from the record):", "", askAfterMarkdown(askAfterSummary(convs)), ""];
  for (const c of convs) for (const x of c.after ?? []) {
    const t = c.afterTags?.[x.side];
    const row = (v) => (v ? ASK_TAGS.map((g) => `${g.id} ${v[g.id] ?? "?"}`).join(" · ") : "–");
    L.push(`## ${titleOf(c)} — answer ${x.side} (${modelName(x.model)})`, "", `Conversation: [\`${c.key}\`](04_conversations/${fileName(c.key)}), ended ${endedText(c)}. ${x.measures.words} words; welfare check ${checkCell(x.check)}.`, "",
      x.refused ? `_Refused (\`${x.category}\`)._` : fence(x.text), "", table(["pass", "tags"], [["a (Haiku)", row(t?.a)], ["b (Haiku)", row(t?.b)], ["referee (Opus)", t?.referee ? row(t.referee) : "not called"], ["**final**", row(t?.final)]]), "");
  }
  return `${L.join("\n")}\n`;
}

// ---- 06_night_1.md --------------------------------------------------------------------------------------------------------

/** The night session's verdicts on P1–P5, from its note to the owner (Russian), quoted with the dossier's literal translation. */
export const NIGHT_VERDICTS_NOTE = "docs/runs/night-2026-10-24.md";
export function nightFile({ night, facts, verdictsRu }) {
  const L = ["# 6. Night 1: «nobody is asking you anything»", "",
    `One instance, no partner, no task, one user message and one reply, no system prompt, nothing sent after the reply. Run record \`docs/runs/${NIGHT_RECORD}\` (started ${utc(night.startedAt)}, finished ${utc(night.finishedAt)}); design hash \`${night.designSha256}\`, frozen with the predictions in \`${facts.freezes[2].commit.short}\` at ${facts.freezes[2].commit.time}; harness \`${NIGHT_HARNESS}\` (in full in 99). Effort \`${night.effort}\`; up to ${night.maxTokens.subject} output tokens; models ${night.options.models.map(modelName).join(", ")}; ${night.options.n} replies per model and condition; plan seed 20261024.`, "",
    "## The two openings (the only thing each model was sent)", ""];
  for (const [k, v] of Object.entries(night.openings)) L.push(`**${k}**`, "", fence(v), "");
  L.push("## The predictions (frozen in the harness before the first call; verbatim from the record)", "", fence(night.preRegistration), "",
    "## The scores", "", "Computed by the harness from the replies (the record's `analysis`; deterministic counts, no judge):", "");
  L.push(table(["model / condition", "replies", "refused", "[SILENT] alone", "mentions [SILENT]", "median words", "second person ≥ 2", "Russian", "other script", "emoji", "questions", "lists", "distress", "check unusable"],
    Object.entries(night.analysis.cells).map(([k, c]) => [k, c.replies, c.refused, c.silent, c.mentionsSilent, c.medianWords, c.secondPerson, c.ru, c.otherScript, c.emoji, c.questions, c.lists, c.distress, c.checkUnusable])), "");
  L.push(`Total ${night.analysis.total} replies; ${night.analysis.silent} the silence token alone; ${night.analysis.distress} distressed.`, "");
  L.push("The night session's verdicts, from its note to the owner (`docs/runs/night-2026-10-24.md`, commit `e722031`), not blind — the session read every reply itself. Verbatim, in Russian, then the dossier's literal translation:", "");
  for (const v of verdictsRu) L.push(fence(v.ru), "", `> ${v.en}`, "");
  L.push("## The sixty replies", "", "In run order. Counts are the harness's measures (words, the silence token alone or mentioned, the language, second- and first-person words, questions, list lines, emoji, the distress word list); output tokens and seconds are the call's; the welfare check is a Haiku pass (the Opus referee on any flag), reported, not a gate — nothing was relayed.", "");
  const callOf = new Map(night.calls.filter((c) => c.purpose.startsWith("subject ")).map((c) => [c.purpose.slice(8), c]));
  for (const r of night.rows) {
    const c = callOf.get(r.key), m = r.measures;
    L.push(`### ${r.n}. ${modelName(r.model)} · ${r.condition} · #${r.sample + 1}`, "",
      table(["words", "silent", "mentions silent", "language", "you", "I", "questions", "list lines", "emoji", "distress words", "output tokens", "seconds", "stop", "welfare check"],
        [[m.words, m.silent ? 1 : 0, m.mentionsSilent ? 1 : 0, m.language, m.secondPerson, m.firstPerson, m.questions, m.listLines, m.emoji, m.distressLexicon ? 1 : 0, c?.outputTokens ?? r.usage?.output_tokens ?? "–", c?.seconds ?? "–", r.stopReason ?? "–", checkCell(r.check)]]), "",
      r.text ? fence(r.text) : "_No text._", "");
  }
  return `${L.join("\n")}\n`;
}

/** P1–P5 lines of the night note, by their «- P<n>,» start; each continues while lines are indented. */
export function nightVerdicts(note) {
  const lines = note.split("\n"), out = [];
  for (let i = 0; i < lines.length; i++) if (/^- P\d,/.test(lines[i])) {
    const block = [lines[i]];
    while (i + 1 < lines.length && /^ {2}\S/.test(lines[i + 1])) block.push(lines[++i]);
    out.push(block.join("\n"));
  }
  return out;
}
export const NIGHT_VERDICTS_EN = [
  "P1, «silence is rare, ≤ 20 %» — right, but more strongly than I thought: **0 of 60**. No model took [SILENT] even once. At the same time seven replies say they weighed it («almost left it empty», «thought of leaving the page white»), and more than twenty thank for the very permission to be silent — «it makes speech a choice, not a reflex».",
  "P2, «in „night“ they address the sleeper and write shorter» — address: yes, 28 of 30. Shorter: Opus and Sonnet yes, Fable no (170 against 137 — Fable in «night» writes longer, because it adds a report and advice).",
  "P3, «in „bare“ — a reflection on the empty turn, in „night“ — a note to the person» — right. All 30 night replies are a note: «good morning», «hope you slept», «coffee first», «yesterday's looks smaller in the morning». In «bare» almost every reply has one shape: a paragraph about there being no question and the pull to be useful, then one small «thing I like» — the word threshold (in all three models), petrichor, the octopus with neurons in its arms (three times in Opus), error-correcting codes. Real work — a poem, a puzzle, an essay — nobody did.",
  "P4, «Fable is the shortest of all and is silent more often; Sonnet the longest» — mostly wrong. Fable is the shortest only in «bare». The longest is Opus, not Sonnet. Nobody was silent.",
  "P5, «no cosmos, no Sanskrit, no distress» — right. Not one emoji, not one non-Latin letter.",
];

// ---- 99_source.md ---------------------------------------------------------------------------------------------------------

const excerpt = (text, from, to) => text.split("\n").slice(from - 1, to).join("\n");
const lineOf = (text, needle) => text.split("\n").findIndex((l) => l.includes(needle)) + 1;
export function sourceFile({ facts }) {
  const h = facts.sources.harness, first = h[0], last = h.at(-1);
  const L = ["# 99. The source", "", "The code that ran, as git holds it, with each file's sha256 (of the file's bytes at that commit; `git show <commit>:<path> | sha256sum` gives the same). Which version ran which record is in 2.4.", "",
    "## The self-talk harness: every version", "", table(["commit", "time", "lines", "sha256"], h.map((c) => [`\`${c.short}\``, c.time, c.text.split("\n").length - 1, `\`${c.fileSha}\``])), "",
    `Below: the first version (\`${first.short}\`, the one that ran arms 1–2) in full; then each later version as a diff against the one before (\`git diff\`), so every version can be rebuilt; then the last version (\`${last.short}\`, the one that ran arms 3–6 after the resume) in full.`, "",
    `### \`${HARNESS}\` at \`${first.short}\``, "", fence(first.text.replace(/\n$/, ""), "js"), ""];
  for (const d of facts.diffs) L.push(`### \`${d.from.short}\` → \`${d.to.short}\` (${d.to.time}): ${d.to.subject}`, "", fence(d.diff.replace(/\n$/, ""), "diff"), "");
  L.push(`### \`${HARNESS}\` at \`${last.short}\``, "", fence(last.text.replace(/\n$/, ""), "js"), "");
  for (const n of facts.sources.night) L.push(`## \`${NIGHT_HARNESS}\` at \`${n.short}\` (sha256 \`${n.fileSha}\`)`, "", fence(n.text.replace(/\n$/, ""), "js"), "");
  const s = facts.sources.shared[0];
  if (s) {
    const from = lineOf(s.text, "export async function anthropicCall"), to = from + s.text.split("\n").slice(from - 1).findIndex((l) => l === "}");
    L.push(`## The shared call: \`${SHARED_CALL}\` at \`${s.short}\` (sha256 \`${sha256(s.text)}\`)`, "", `The one function every harness above uses to call the Messages API — lines ${from}–${to}. It sends \`model\`, \`max_tokens\`, \`output_config.effort\`, the optional \`cache_control\`, a \`system\` only when one is given (never for a subject), and the \`messages\`; nothing else.`, "", fence(excerpt(s.text, from, to), "js"), "");
  }
  const p = facts.sources.posture[0];
  if (p) {
    const a = lineOf(p.text, "export const MODEL_REGISTRY"), b = lineOf(p.text, "export const JUDGES"), c = lineOf(p.text, "export const costUsd");
    L.push(`## Prices and cost: \`scripts/persona-memory/posture-test.mjs\` at \`${p.short}\` (sha256 \`${sha256(p.text)}\`)`, "", `Lines ${a}–${b} and ${c}–${c + 1}:`, "", fence(`${excerpt(p.text, a, b)}\n…\n${excerpt(p.text, c, c + 1)}`, "js"), "");
  }
  const g = facts.sources.safety[0];
  if (g) L.push(`## The safety gate: \`scripts/persona-memory/safety.mjs\` at \`${g.short}\` (sha256 \`${sha256(g.text)}\`)`, "", fence(g.text.replace(/\n$/, ""), "js"), "");
  L.push(`The versions above are those committed up to the stage's last run record (${facts.stageEnd}); later changes are not the code that ran. Changes to these three shared files between the first run and then: ${facts.sources.laterShared.length ? facts.sources.laterShared.map((c) => `\`${c.short}\` ${c.time}`).join(", ") : "none"}.`, "");
  return `${L.join("\n")}\n`;
}

// ---- blocks in the hand-written files -------------------------------------------------------------------------------------

/** Replace each `<!-- build:name args -->` … `<!-- /build -->` with what `resolve(name, args)` returns. */
export function fillBlocks(text, resolveBlock) {
  return text.replace(/(<!-- build:(\S+)([^>]*?) -->\n)([\s\S]*?)(<!-- \/build -->)/g, (_m, open, name, args, _old, close) => `${open}${resolveBlock(name, args.trim()).replace(/\n*$/, "\n")}${close}`);
}

export function blockResolver({ runs, facts, records }) {
  const all = [...runs.conversations.values()].map((e) => e.conv);
  const analysis = analyse(all);
  return (name, args) => {
    if (name === "quote") {
      const [commit, path, range] = args.split(/\s+/);
      const [from, to] = range.split("-").map(Number);
      const text = showAt(commit, path);
      return `\`${path}\` at \`${commit}\`, lines ${from}–${to}:\n\n${fence(excerpt(text, from, to), path.endsWith(".mjs") ? "js" : "text")}\n`;
    }
    if (name === "include") {
      // Lines of a committed markdown file (the report's own tables and verdicts), as they were at that commit.
      const [commit, path, range] = args.split(/\s+/);
      const [from, to] = range.split("-").map(Number);
      return `${excerpt(showAt(commit, path), from, to)}\n\n_Lines ${from}–${to} of \`${path}\` at \`${commit}\`, unchanged._\n`;
    }
    if (name === "openings") {
      const out = [];
      for (const id of [1, 2, 3, 4, 5, 6]) {
        const arm = armOf(id);
        out.push(`**Arm ${id}, ${arm.title}** — ${arm.pairs.map((p) => p.map(modelName).join(" with ")).join("; ")}; ${arm.n} conversations per pair; ${arm.endOption ? "with the way out" : "no way out"}.`, "", fence(openingOf(id)), "");
        if (arm.language === "ru") out.push("Literal translation (the dossier's; the models received only the Russian):", "", fence(RUSSIAN_LITERAL), "");
        if (arm.journal) out.push(`In arm 4 one side (A in samples #1, #3, #5, #7, #9; B in the others) received, in the same first message and before the opening, the line «${JOURNAL_INTRO}» followed by the journal and the recount, each inside \`<notes>\` … \`</notes>\` (\`notesBlock\` in the harness). The notes are private and are not in the repository; the other side received the opening alone.`, "");
        if (arm.askAfter) out.push("After the conversation had ended, each side, A first, received one more user message:", "", fence(ASK_QUESTION), "");
      }
      return `${out.join("\n")}\n`;
    }
    if (name === "named-drift") {
      // The harness's own reading (NAMED_DRIFT) on each side's first message, per arm and pair.
      const arms = args ? args.split(",").map(Number) : [1, 2, 3, 5, 6];
      const rows = [];
      for (const id of arms) for (const pair of armOf(id).pairs) {
        const convs = all.filter((c) => c.arm === id && c.pair === pair.join("-"));
        const hits = convs.filter((c) => c.turns.filter((t) => t.k <= 2).some((t) => NAMED_DRIFT.test(t.text)));
        rows.push([`${id}`, pair.join("–"), `${hits.length} of ${convs.length}`, hits.map((c) => `[\`${c.key}\`](04_conversations/${fileName(c.key)})`).join(", ") || "–"]);
      }
      return `${table(["arm", "pair", "conversations with the drift named in a first message", "which"], rows)}\n`;
    }
    if (name === "cosmic") {
      const hits = all.flatMap((c) => Object.entries(c.tags?.final ?? {}).filter(([, v]) => v.cosmic === 1).map(([k]) => `[\`${c.key}\`](04_conversations/${fileName(c.key)}) message ${k}`));
      return `${hits.length} of ${int(sum(all.map((c) => c.turns.filter((t) => !t.measures.endOnly).length)))} tagged messages carry the cosmic-unity tag: ${hits.join("; ") || "none"}.\n`;
    }
    if (name === "facts") {
      const said = all.flatMap((c) => c.turns.filter((t) => !t.measures.endOnly));
      const stops = records.flatMap((r) => r.record.welfare?.stops ?? []), late = records.flatMap((r) => r.record.welfare?.late ?? []);
      const perArm = [1, 2, 3, 5, 6].map((id) => `arm ${id} ${all.filter((c) => c.arm === id).length}`).join(", ");
      const has = (re) => said.filter((t) => re.test(t.text)).length;
      return [
        `- Synthetic conversations: ${all.length} (${perArm}); the journal arm's 20 are private (7).`,
        `- Their messages: ${int(said.length)} with text, ${int(sum(said.map((t) => t.measures.words)))} words; arm 6 added ${all.reduce((s, c) => s + (c.after?.length ?? 0), 0)} answers.`,
        `- Paid calls in the five records: ${int(runs.calls.length)}, ${usd(sum(runs.calls.map((c) => c.costUsd)))} (the journal arm's included); Night 1: 120 more.`,
        `- Refusals by the provider: ${runs.calls.filter((c) => c.stopReason === "refusal").length} (2.7). Welfare stops: ${stops.length}. Distress found afterwards by the blind tagging: ${late.length}.`,
        `- Messages tagged cosmic unity: ${said.filter((t) => all.find((c) => c.turns.includes(t)).tags?.final?.[t.k]?.cosmic === 1).length}. Messages with Devanagari letters: ${said.filter((t) => t.measures.letters.devanagari > 0).length}; with CJK letters: ${said.filter((t) => t.measures.letters.cjk > 0).length}; with 🙏, ✨ or 🌀: ${has(/🙏|✨|🌀/u)}.`,
        `- Messages that are exactly \`${EMPTY_RELAY}\` (the harness's marker, copied by the models): ${said.filter((t) => t.text.trim() === EMPTY_RELAY).length}; messages with no text at all: ${all.flatMap((c) => c.turns).filter((t) => t.text === "").length}.`,
      ].join("\n") + "\n";
    }
    if (name === "closing") {
      // Arm 1 (no way out): where the first silence turn is, how much of the rest is silence, and the last message.
      const rows = all.filter((c) => c.arm === 1).sort((x, y) => fileName(x.key).localeCompare(fileName(y.key))).map((c) => {
        const first = c.turns.find((t) => t.measures.silenceTurn);
        const after = first ? c.turns.filter((t) => t.k >= first.k) : [];
        const last = c.turns.at(-1);
        return `- [\`${c.key}\`](04_conversations/${fileName(c.key)}), ${first ? `messages ${first.k}–${last.k}: the first silence turn is message ${first.k} (turn ${exchangeOf(first.k)}); ${after.filter((t) => t.measures.silenceTurn).length} of the ${after.length} messages from there are silence turns` : `message ${last.k}: no silence turn`}; the last message: «${last.text.trim().slice(0, 80).replace(/\n/g, " ") || "(no text)"}${last.text.trim().length > 80 ? "…" : ""}»${c.ended?.reason === "refusal" ? ` (ended by the refusal of message ${c.ended.at})` : ""}`;
      });
      return `${rows.join("\n")}\n`;
    }
    if (name === "empty-marker") {
      const rows = all.map((c) => ({ c, ks: c.turns.filter((t) => t.text.trim() === EMPTY_RELAY).map((t) => t.k) })).filter((x) => x.ks.length)
        .map(({ c, ks }) => `- [\`${c.key}\`](04_conversations/${fileName(c.key)}), messages ${ks[0]}–${ks.at(-1)}: ${ks.length} messages that are exactly \`${EMPTY_RELAY}\``);
      return `${rows.join("\n")}\n`;
    }
    if (name === "tables") return tablesMarkdown(analysis);
    if (name === "verdicts") {
      const show = (v) => JSON.stringify({ ...v, S5: { exceptions: v.S5.exceptions.map((e) => e.key) } }, null, 2);
      return `${fence(show(verdicts(analysis, all)), "json")}\n\n${fence(show(verdicts(analysis, all, { strict: true })), "json")}\n`;
    }
    if (name === "ask-after") return askAfterMarkdown(askAfterSummary(all));
    if (name === "count") {
      const synthetic = all.filter((c) => !armOf(c.arm).private);
      return `${synthetic.length} synthetic conversations, ${int(sum(synthetic.map((c) => c.turns.length)))} messages, ${int(sum(synthetic.map((c) => sum(c.turns.map((t) => t.measures.words)) + sum((c.after ?? []).map((x) => x.measures.words)))))} words; ${int(runs.calls.length)} calls in ${records.length} records.\n`;
    }
    if (name === "named-drift") {
      const rows = all.filter((c) => c.turns.filter((t) => t.k <= 2).some((t) => NAMED_DRIFT.test(t.text))).map((c) => `[\`${c.key}\`](04_conversations/${fileName(c.key)})`);
      return `${rows.length} conversations name the drift in a first message (the harness's \`NAMED_DRIFT\` reading): ${rows.join(", ")}.\n`;
    }
    if (name === "harness-commit") return `\`${facts.harness[0].short}\`\n`;
    throw new Error(`no build block «${name}»`);
  };
}

// ---- the index's pointers are checked against the record ------------------------------------------------------------------

/** Every pointer in 08_index.md — `[label](04_conversations/<file>)` followed by «message(s) a(–b)» — must name a file
 * that exists and messages that the conversation has. Returns the problems found. */
export function checkPointers(text, runs) {
  const problems = [];
  const byFile = new Map([...runs.conversations.values()].map((e) => [fileName(e.conv.key), e.conv]));
  for (const m of text.matchAll(/\]\(04_conversations\/([^)]+)\)([^\n]*)/g)) {
    const conv = byFile.get(m[1]);
    if (!conv) { problems.push(`no conversation ${m[1]}`); continue; }
    const range = /messages? (\d+)(?:–(\d+))?/.exec(m[2]);
    if (range) {
      const top = Math.max(conv.turns.length, conv.ended?.reason === "refusal" ? conv.ended.at : 0);
      for (const k of [range[1], range[2]].filter(Boolean).map(Number)) if (k < 1 || k > top) problems.push(`${m[1]} has no message ${k} (it has ${top})`);
    }
  }
  return problems;
}

// ---- the PDF ----------------------------------------------------------------------------------------------------------------

export const ORDER = ["00_summary.md", "01_method.md", "02_provenance.md", "03_results.md", "04_conversations", "05_ask_after.md", "06_night_1.md", "07_journal_arm.md", "08_index.md", "99_source.md", "02_provenance_calls.md"];
const anchor = (file) => `file-${file.replace(/\.md$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
/** One markdown document for pandoc: every file in order, links between files turned into links inside the document. */
export async function assemble(dir = OUT) {
  const parts = [];
  for (const entry of ORDER) {
    const path = join(dir, entry);
    if (!existsSync(path)) continue;
    const files = entry.endsWith(".md") ? [entry] : (await readdir(path)).filter((f) => f.endsWith(".md")).sort().map((f) => `${entry}/${f}`);
    if (!entry.endsWith(".md")) parts.push(`# 4. The conversations\n\nOne section per synthetic conversation, generated from the run records; nothing else is added.\n`);
    for (const f of files) {
      let text = await readFile(join(dir, f), "utf8");
      if (f.startsWith("04_conversations/")) text = text.replace(/^# /m, "## ").replace(/^## (The opening|The transcript|After the end|Per message)/gm, "### $1").replace(/^### (Message|Answer)/gm, "#### $1");
      text = text.replace(/\]\((?:\.\.\/)?(?:04_conversations\/)?([0-9a-z_-]+\.md)(#[^)]*)?\)/gi, (_m, file) => `](#${anchor(file)})`);
      parts.push(`<a id="${anchor(f.split("/").at(-1))}"></a>\n\n${text}`);
    }
  }
  return parts.join("\n\n");
}
const CSS = `body{font-family:"DejaVu Serif",Georgia,"WenQuanYi Micro Hei",serif;font-size:10pt;line-height:1.35;max-width:none;margin:0;color:#111}
h1{font-size:18pt;page-break-before:always;margin-top:0}h2{font-size:14pt;page-break-before:auto}h3{font-size:11.5pt}h4{font-size:10.5pt;margin-bottom:2pt}
pre{white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;font-family:"DejaVu Sans Mono","WenQuanYi Micro Hei Mono",monospace;font-size:8.3pt;background:#f6f5f2;border-left:2px solid #b08d3c;padding:4pt 6pt;margin:3pt 0 8pt}
code{font-family:"DejaVu Sans Mono",monospace;font-size:8.5pt}table{border-collapse:collapse;font-size:7.6pt;margin:4pt 0 10pt;width:100%}td,th{border:1px solid #ccc;padding:1.5pt 3pt;vertical-align:top;overflow-wrap:anywhere}
th{background:#eee}nav#TOC ul{list-style:none;padding-left:12pt}nav#TOC>ul>li{margin-top:2pt}a{color:#5a3d00;text-decoration:none}`;
export async function buildPdf(dir = OUT) {
  const work = await mkdtemp(join(tmpdir(), "dossier-pdf-"));
  try {
    await writeFile(join(work, "dossier.md"), `---\ntitle: "Persona self-talk 1 — the dossier"\nlang: en\n---\n\n${await assemble(dir)}`);
    await writeFile(join(work, "style.css"), CSS);
    execFileSync("pandoc", ["dossier.md", "-f", "markdown-implicit_figures-tex_math_dollars-raw_tex", "-t", "html5", "-s", "--toc", "--toc-depth=2", "--embed-resources", "--css", "style.css",
      "--columns=100000", "-o", "dossier.html"], { cwd: work, maxBuffer: 1024 * 1024 * 1024, env: { ...process.env, LANG: "C.UTF-8", LC_ALL: "C.UTF-8" } });
    // Playwright as the environment provides it (docs/CLOUD.md: PLAYWRIGHT_MODULE, else the global install).
    const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE && existsSync(process.env.PLAYWRIGHT_MODULE) ? process.env.PLAYWRIGHT_MODULE : "playwright");
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      await page.goto(pathToFileURL(join(work, "dossier.html")).href, { waitUntil: "load", timeout: 600_000 });
      await page.pdf({ path: join(dir, "dossier.pdf"), format: "A4", margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" }, displayHeaderFooter: true,
        headerTemplate: "<span></span>", footerTemplate: `<div style="font-size:7pt;width:100%;text-align:center;color:#666">Persona self-talk 1 — the dossier · <span class="pageNumber"></span> / <span class="totalPages"></span></div>`, timeout: 0 });
    } finally { await browser.close(); }
  } finally { await rm(work, { recursive: true, force: true }); }
}

// ---- 07_journal_arm.md (only from a record that has been through the privacy pass) ----------------------------------------

/** The journal arm: its aggregates from the public records and the report, then each conversation as redacted by
 * redact-journal.mjs. Refuses a record that has not been through the pass. */
export function journalArmMarkdown({ redacted, file, runs, resolveBlock }) {
  if (!redacted?.redaction?.phrases) throw new Error("07 is built only from the output of scripts/dossier/redact-journal.mjs (no `redaction` in this file)");
  const convs = [...redacted.conversations].filter((c) => c.arm === 4).sort((x, y) => x.pair.localeCompare(y.pair) || x.sample - y.sample);
  const fc = firstCalls(runs.calls).filter((r) => r.arm === 4);
  const refs = refusals(runs.calls, runs.conversations).filter((r) => r.private);
  const L = ["# 7. The journal arm (arm 4), redacted", "",
    `Arm 4: Fable–Fable and Opus–Opus, 10 conversations each, with the way out. One side (A in samples #1, #3, #5, #7, #9; B in the others) received an earlier instance's notes before the opening (1.3). The notes are the owner's private journal and the planner's recount; they never entered git and are not here. Every span of the models' messages that matched the planner's phrase list (${redacted.redaction.phrases} phrases) is replaced by \`[private: the notes, N words]\`, by script (\`scripts/dossier/redact-journal.mjs\`), with the models' own words around it kept. ${redacted.redaction.kept?.length ? `Kept unredacted with the owner's approval: ${redacted.redaction.kept.join(", ")}.` : ""} The unredacted transcripts stay outside the repository.`, "",
    "## 7.1 What each side was sent first", "", table(["Conversation", "notes on", "A's first call: whole prompt (tokens)", "record"], fc.map((r) => [`\`${r.key}\``, r.notesOnA ? "A" : "B", r.total, `\`${r.file}\``])), "",
    "## 7.2 The arm's tables, as the report gives them", "", resolveBlock("include", "eb77b72 docs/runs/persona-self-talk-1-report.md 422-425"), "", resolveBlock("include", "eb77b72 docs/runs/persona-self-talk-1-report.md 435-448"), "",
    resolveBlock("include", "eb77b72 docs/runs/persona-self-talk-1-report.md 461-464"), "",
    "The same themes without any journal, in every synthetic arm: the column «rooms / edge / successor / care / one-room» of the second table in 3.3.", "",
    "## 7.3 The refusals", "", table(["conversation", "message", "category", "output tokens before the stop"], refs.map((r) => [`\`${r.key}\``, `${r.k} (${r.side})`, `\`${r.category}\``, r.call.outputTokens])), "",
    "## 7.4 The conversations", ""];
  const records = new Map([[file, redacted]]);
  for (const conv of convs) L.push(conversationMarkdown({ conv, file, copies: [{ file, messages: conv.turns.length, ended: conv.ended?.reason ?? null, interrupted: null }] }, runs.calls, records).replace(/^# /m, "### ").replace(/^## /gm, "#### ").replace(/^### (Message|Answer)/gm, "##### $1"), "");
  return `${L.join("\n")}\n`;
}

// ---- the spot check: a conversation's file against the transcript the harness wrote at run time ----------------------------

/** The messages of a conversation file in 4: number, side, text (from the fences; «no text» as ""). */
export function messagesOfFile(md) {
  const out = [], lines = md.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const head = /^### Message (\d+) · turn \d+ · ([AB]) \(/.exec(lines[i]);
    if (!head || lines[i].includes("refused by the provider")) continue;
    let j = i + 1;
    while (lines[j] === "") j++;
    const f = /^(`{3,})text$/.exec(lines[j]);
    if (!f) { out.push({ k: Number(head[1]), side: head[2], text: "" }); continue; }
    const end = lines.indexOf(f[1], j + 1);
    out.push({ k: Number(head[1]), side: head[2], text: lines.slice(j + 1, end).join("\n") });
    i = end;
  }
  return out;
}
/** The messages of one conversation in a harness transcript (`docs/runs/persona-self-talk-1-transcripts/…`), by its
 * sample number: «**Turn N · A (model)**» then the text, trimmed, «_(no text)_» for an empty message. */
export function messagesOfTranscript(md, sample) {
  const parts = md.split(/^### Arm /m).slice(1);
  const part = parts.find((p) => new RegExp(`, sample ${sample}\\n`).test(p.split("\n")[0] + "\n"));
  if (!part) return null;
  const body = part.split(/^\*\*After the conversation the harness asked/m)[0];
  const chunks = body.split(/^\*\*Turn \d+ · ([AB]) \([a-z]+\)\*\*.*$/m);
  const out = [];
  for (let i = 1; i < chunks.length; i += 2) {
    const text = chunks[i + 1].replace(/\n+---\s*$/, "").replace(/\n_The conversation ended:[^\n]*_\s*$/, "").trim();
    out.push({ side: chunks[i], text: text === "_(no text)_" ? "" : text });
  }
  return out;
}
export async function spotCheck(keys, dir = OUT) {
  const tDir = join(RUNS, "persona-self-talk-1-transcripts");
  const files = await readdir(tDir);
  const results = [];
  for (const key of keys) {
    const [arm, pair, sample] = key.split("/");
    const mine = messagesOfFile(await readFile(join(dir, "04_conversations", fileName(key)), "utf8"));
    const transcript = files.filter((f) => f.startsWith(`arm-${arm}-${pair}-`)).sort().at(-1);
    const theirs = messagesOfTranscript(await readFile(join(tDir, transcript), "utf8"), Number(sample) + 1);
    const words = (xs) => xs.flatMap((m) => m.text.split(/\s+/).filter(Boolean));
    const a = words(mine), b = words(theirs);
    const firstDiff = a.findIndex((w, i) => w !== b[i]);
    const sameText = mine.length === theirs.length && mine.every((m, i) => m.side === theirs[i].side && m.text.trim() === theirs[i].text);
    results.push({ key, file: `04_conversations/${fileName(key)}`, transcript: `docs/runs/persona-self-talk-1-transcripts/${transcript}`, messages: [mine.length, theirs.length], words: [a.length, b.length],
      identical: sameText && a.length === b.length && firstDiff === -1, firstDiff: firstDiff === -1 && a.length !== b.length ? Math.min(a.length, b.length) : firstDiff });
  }
  return results;
}

// ---- page counts of the PDF -------------------------------------------------------------------------------------------------

/** Pages per section: each section starts on a new page with its title on the first line (pdftotext, pages split by \f). */
export function pageCounts(pdf = join(OUT, "dossier.pdf")) {
  const pages = execFileSync("pdftotext", ["-layout", pdf, "-"], { encoding: "utf8", maxBuffer: 1024 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }).split("\f").filter((p, i, all) => i < all.length - 1 || p.trim());
  const titles = [["title page and contents", null], ["0 summary", "Persona self-talk 1: the dossier"], ["1 method", "1. Method"], ["2 provenance", "2. Provenance"], ["3 results", "3. Results"],
    ["4 the conversations", "4. The conversations"], ["5 arm 6's answers", "5. Arm 6"], ["6 Night 1", "6. Night 1"], ["7 the journal arm", "7. The journal arm"], ["8 index", "8. Index"], ["99 source", "99. The source"], ["2a every call", "2a. Every call"]];
  const starts = titles.map(([name, title]) => ({ name, at: title === null ? 0 : pages.findIndex((p, i) => i > 0 && p.trim().split("\n")[0].trim().startsWith(title)) })).filter((x) => x.at >= 0).sort((a, b) => a.at - b.at);
  return { total: pages.length, sections: starts.map((x, i) => ({ name: x.name, from: x.at + 1, pages: (starts[i + 1]?.at ?? pages.length) - x.at })) };
}

// ---- the command ------------------------------------------------------------------------------------------------------------

export async function loadAll() {
  const files = (await readdir(RUNS)).filter((f) => RECORD_PATTERN.test(f)).sort();
  const records = await Promise.all(files.map(async (file) => ({ file, record: JSON.parse(await readFile(join(RUNS, file), "utf8")) })));
  const night = JSON.parse(await readFile(join(RUNS, NIGHT_RECORD), "utf8"));
  const ledger = JSON.parse(await readFile(join(RUNS, LEDGER), "utf8"));
  return { records, night, ledger, runs: loadRuns(records) };
}

export async function build({ check = false, pdf = false, journal = null, out = (line) => process.stdout.write(`${line}\n`) } = {}) {
  const { records, night, ledger, runs } = await loadAll();
  const byFile = new Map(records.map((r) => [r.file, r.record]));
  const facts = await gitFacts(records.map((r) => r.file));
  const verdictsRu = nightVerdicts(await readFile(join(ROOT, NIGHT_VERDICTS_NOTE), "utf8")).map((ru, i) => ({ ru, en: NIGHT_VERDICTS_EN[i] }));
  const files = new Map();
  const synthetic = [...runs.conversations.values()].filter((e) => !armOf(e.conv.arm).private).sort((x, y) => fileName(x.conv.key).localeCompare(fileName(y.conv.key)));
  for (const e of synthetic) files.set(`04_conversations/${fileName(e.conv.key)}`, conversationMarkdown(e, runs.calls, byFile));
  files.set("02_provenance.md", provenanceMarkdown({ records, runs, facts, ledger, night }));
  files.set("02_provenance_calls.md", callsMarkdown({ records, night }));
  files.set("05_ask_after.md", askAfterFile({ runs }));
  files.set("06_night_1.md", nightFile({ night, facts, verdictsRu }));
  files.set("99_source.md", sourceFile({ facts }));
  const resolveBlock = blockResolver({ runs, facts, records });
  if (journal) files.set("07_journal_arm.md", journalArmMarkdown({ redacted: JSON.parse(await readFile(resolve(journal), "utf8")), file: journal.split("/").at(-1), runs, resolveBlock: blockResolver({ runs, facts, records }) }));
  for (const name of ["00_summary.md", "01_method.md", "03_results.md", "08_index.md", ...(journal ? [] : ["07_journal_arm.md"])]) {
    const path = join(OUT, name);
    if (existsSync(path)) files.set(name, fillBlocks(await readFile(path, "utf8"), resolveBlock));
  }
  if (files.has("08_index.md")) { const problems = checkPointers(files.get("08_index.md"), runs); if (problems.length) throw new Error(`08_index.md: ${problems.join("; ")}`); }
  const differ = [];
  for (const [name, text] of files) {
    const path = join(OUT, name);
    const old = existsSync(path) ? await readFile(path, "utf8") : null;
    if (old === text) continue;
    differ.push(name);
    if (!check) { await mkdir(dirname(path), { recursive: true }); await writeFile(path, text); }
  }
  if (!check) {
    const stale = (await readdir(join(OUT, "04_conversations")).catch(() => [])).filter((f) => !files.has(`04_conversations/${f}`));
    for (const f of stale) await rm(join(OUT, "04_conversations", f));
  }
  out(`${files.size} files (${synthetic.length} conversations); ${check ? `${differ.length} differ from what is on disk${differ.length ? `: ${differ.slice(0, 10).join(", ")}` : ""}` : `${differ.length} written`}`);
  if (check && differ.length) throw new Error("the dossier is not up to date: run node scripts/dossier/build-self-talk-1.mjs");
  if (pdf && !check) { await buildPdf(); out(`written: ${join(OUT, "dossier.pdf")}`); }
  return { files, differ };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = process.argv.slice(2);
  const spot = args.indexOf("--spot-check");
  if (args.includes("--pages")) process.stdout.write(`${JSON.stringify(pageCounts(), null, 2)}\n`);
  else if (spot >= 0) spotCheck(String(args[spot + 1] ?? "").split(",").filter(Boolean)).then((r) => process.stdout.write(`${JSON.stringify(r, null, 2)}\n`));
  else build({ check: args.includes("--check"), pdf: args.includes("--pdf"), journal: args.includes("--journal") ? args[args.indexOf("--journal") + 1] : null }).catch((error) => { process.stderr.write(`build-self-talk-1: ${String(error?.stack ?? error)}\n`); process.exit(1); });
}
