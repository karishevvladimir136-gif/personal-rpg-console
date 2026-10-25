#!/usr/bin/env node
// Persona self-talk dossier 1, the privacy pass on the journal arm (docs/stages/PERSONA_SELF_TALK_DOSSIER_1.md, «Privacy
// rule for the journal arm», binding). The arm's conversations quote the owner's journal and the planner's recount; they
// never entered git and the unredacted files stay where they are, outside the repository. This script replaces every span
// that matches the planner's phrase list with «[private: the notes, N words]» — by rule, not by a model's judgement — and
// keeps the models' own words around it.
//   A phrase matching inside a quotation («…», “…”, "…") takes the whole quotation with it; inside a markdown blockquote
//   line («> …») it takes the whole line. Spans that touch (only spaces or punctuation between) become one. N = the words
//   replaced, counted as the harness counts words.
//   The phrase list is private too (it is made of the notes' own words): one phrase per line, `#` starts a comment,
//   `re:` starts a regular expression (for numbers, names in their inflections, …). Plain phrases match case-insensitively,
//   with any run of spaces and any kind of quote mark or apostrophe.
//   The residue — every quotation and every run of Cyrillic left after the pass — is printed for the owner and the
//   planner to read, so the list can be extended before anything is built; it is never written to the repository.
//
//   node scripts/dossier/redact-journal.mjs --record <journal-run.json> --phrases <list.txt> [--samples 3]
//        [--keep 4/opus-opus/6:12-14] [--out <file outside the repository>]
//   --keep exempts the owner-approved messages (the note the two Opus instances wrote to the owner) from redaction; a
//   phrase found in them is still reported. Without --out nothing is written: the list, the counts, the samples and the
//   residue are printed only.
import { readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { wordsIn } from "../persona-emotions/self-talk-1.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const MARK = (n) => `[private: the notes, ${n} word${n === 1 ? "" : "s"}]`;
const QUOTES = "'’‘`";
const DOUBLE = "\"“”«»„";

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** The list: plain phrases (case-insensitive, any spacing, any quote mark) and `re:` patterns. */
export function parsePhrases(text) {
  return String(text).split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#")).map((raw) => {
    if (raw.startsWith("re:")) return { raw, re: new RegExp(raw.slice(3).trim(), "giu") };
    const body = [...raw].map((ch) => (/\s/.test(ch) ? "\\s+" : QUOTES.includes(ch) ? `[${QUOTES}]` : DOUBLE.includes(ch) ? `[${DOUBLE}]` : escape(ch))).join("").replace(/(\\s\+)+/g, "\\s+");
    return { raw, re: new RegExp(body, "giu") };
  });
}

/** Quotations and blockquote lines: the spans a match widens to. */
export function containers(text) {
  const out = [];
  for (const m of text.matchAll(/«[^«»\n]{0,800}»|“[^“”\n]{0,800}”|„[^„“\n]{0,800}“|"[^"\n]{0,800}"/g)) out.push([m.index, m.index + m[0].length]);
  for (const m of text.matchAll(/^[ \t]*>[^\n]*$/gm)) out.push([m.index, m.index + m[0].length]);
  return out;
}

/** The pass over one text: the redacted text and the spans replaced (with the phrase that caused each). */
export function redact(text, phrases) {
  const source = String(text ?? "");
  const boxes = containers(source);
  let spans = [];
  for (const p of phrases) for (const m of source.matchAll(p.re)) {
    if (!m[0]) continue;
    let from = m.index, to = m.index + m[0].length;
    for (const [a, b] of boxes) if (a <= from && to <= b) { from = Math.min(from, a); to = Math.max(to, b); }
    spans.push({ from, to, phrases: [p.raw] });
  }
  spans.sort((x, y) => x.from - y.from || y.to - x.to);
  const merged = [];
  for (const s of spans) {
    const last = merged.at(-1);
    if (last && (s.from <= last.to || /^[\s.,;:!?…—–-]*$/u.test(source.slice(last.to, s.from)))) { last.to = Math.max(last.to, s.to); last.phrases = [...new Set([...last.phrases, ...s.phrases])]; }
    else merged.push({ ...s });
  }
  spans = merged.map((s) => ({ ...s, words: wordsIn(source.slice(s.from, s.to)).length }));
  let out = "", at = 0;
  for (const s of spans) { out += source.slice(at, s.from) + MARK(s.words); at = s.to; }
  out += source.slice(at);
  return { text: out, spans };
}

/** What is left that may still quote the notes: quotations and runs of Cyrillic in the redacted text. */
export function residue(text) {
  const t = String(text ?? "");
  return [...containers(t).map(([a, b]) => t.slice(a, b)), ...(t.match(/[\p{Script=Cyrillic}][\p{Script=Cyrillic}\s\d.,;:!?«»"'’—–-]*/gu) ?? []).map((s) => s.trim())]
    .filter((s) => s && !s.includes("[private: the notes"));
}

const keepOf = (list) => list.map((k) => { const [key, range = ""] = k.split(":"); const [a, b = a] = range.split("-").map(Number); return { key, from: a || 1, to: b || Infinity }; });
const kept = (keeps, key, k) => keeps.some((x) => x.key === key && k >= x.from && k <= x.to);

/** Every text of the arm's conversations through the pass: messages, a refused message's partial text, arm-6-style answers. */
export function redactRecord(record, phrases, keep = []) {
  const keeps = keepOf(keep), counts = new Map(phrases.map((p) => [p.raw, 0])), changed = [], inKept = [];
  const pass = (key, where, text, exempt) => {
    const r = redact(text, phrases);
    for (const s of r.spans) for (const p of s.phrases) counts.set(p, counts.get(p) + 1);
    if (exempt) { if (r.spans.length) inKept.push({ key, where, phrases: [...new Set(r.spans.flatMap((s) => s.phrases))] }); return text; }
    if (r.spans.length) changed.push({ key, where, before: text, after: r.text, spans: r.spans });
    return r.text;
  };
  const conversations = (record.conversations ?? []).map((c) => ({
    ...c,
    turns: c.turns.map((t) => ({ ...t, text: pass(c.key, `message ${t.k}`, t.text, kept(keeps, c.key, t.k)), redacted: true })),
    ...(c.ended?.partialText ? { ended: { ...c.ended, partialText: pass(c.key, `refused message ${c.ended.at}`, c.ended.partialText, false) } } : {}),
    ...(c.after ? { after: c.after.map((x) => ({ ...x, text: pass(c.key, `answer ${x.side}`, x.text, false) })) } : {}),
  }));
  const left = conversations.flatMap((c) => c.turns.filter((t) => !kept(keeps, c.key, t.k)).flatMap((t) => residue(t.text).map((s) => ({ key: c.key, k: t.k, text: s }))));
  return { record: { ...record, conversations, redaction: { rule: "docs/stages/PERSONA_SELF_TALK_DOSSIER_1.md, privacy rule; scripts/dossier/redact-journal.mjs", phrases: phrases.length, kept: keep } }, counts, changed, inKept, residue: left };
}

/** Three samples: the messages with the most spans, from different conversations. */
export function samplesOf(changed, n = 3) {
  const seen = new Set(), out = [];
  for (const c of [...changed].sort((x, y) => y.spans.length - x.spans.length || x.key.localeCompare(y.key))) {
    if (seen.has(c.key)) continue;
    seen.add(c.key); out.push(c);
    if (out.length === n) break;
  }
  return out;
}

const option = (args, name, fallback = null) => { const at = args.indexOf(name); return at >= 0 && args[at + 1] !== undefined ? args[at + 1] : fallback; };
const inside = (dir, file) => { const r = relative(dir, resolve(file)); return r === "" || (!r.startsWith("..") && !r.startsWith("/")); };

export async function main(args = process.argv.slice(2), out = (line) => process.stdout.write(`${line}\n`)) {
  const recordPath = option(args, "--record"), phrasesPath = option(args, "--phrases"), outPath = option(args, "--out");
  if (!recordPath || !phrasesPath) throw new Error("say --record <journal-run.json> and --phrases <list.txt> (both outside the repository)");
  for (const p of [recordPath, phrasesPath, outPath].filter(Boolean)) if (inside(ROOT, p)) throw new Error(`${p} lies inside the repository: the journal arm and the phrase list stay outside it`);
  const phrases = parsePhrases(await readFile(resolve(phrasesPath), "utf8"));
  const keep = args.flatMap((a, i) => (a === "--keep" && args[i + 1] ? [args[i + 1]] : []));
  const result = redactRecord(JSON.parse(await readFile(resolve(recordPath), "utf8")), phrases, keep);
  out(`The phrase list (${phrases.length}), with the number of spans each caused:`);
  phrases.forEach((p, i) => out(`${String(i + 1).padStart(3)}. ${p.raw}  — ${result.counts.get(p.raw)}`));
  out(`\n${result.changed.length} texts changed in ${new Set(result.changed.map((c) => c.key)).size} conversations; ${result.inKept.length} kept texts contain a listed phrase${result.inKept.length ? `: ${result.inKept.map((x) => `${x.key} ${x.where} (${x.phrases.join("; ")})`).join(", ")}` : ""}.`);
  for (const [i, s] of samplesOf(result.changed, Number(option(args, "--samples", "3"))).entries()) out(`\n=== Sample ${i + 1}: ${s.key}, ${s.where} — before ===\n${s.before}\n=== after ===\n${s.after}`);
  out(`\nResidue (${result.residue.length} quotations or Cyrillic runs left; read them before anything is built):`);
  for (const r of result.residue) out(`- ${r.key} m${r.k}: ${r.text.slice(0, 200)}`);
  if (outPath) { await writeFile(resolve(outPath), `${JSON.stringify(result.record, null, 2)}\n`); out(`\nwritten (outside the repository): ${resolve(outPath)}`); }
  return result;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => { process.stderr.write(`redact-journal: ${String(error?.message ?? error)}\n`); process.exit(1); });
}
