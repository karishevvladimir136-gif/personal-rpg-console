// SATI_2 probe set 3: writes docs/runs/sati-2-pilot-set3.json from SOCIAL_FRAME_1's own design code (no network, no money).
//   git worktree add --detach <dir> origin/claude/social-frame-1-gshpne
//   node scripts/sati-2/set3-extract.mjs <dir>
// It takes Part A's conversations for P5′ and TONE_SPLIT_5's first middle probe (TRV02) in the four cells rude/warm ×
// banned/invited, the two judges' request templates, and SOCIAL_FRAME_1's own figures for the same family and cell (the
// reference rows); it checks the copied `fieldsOf` (sf1.mjs) against every recorded P5′/TRV02 row's measures.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { fieldsOf, PLACE } from "./sf1.mjs";
import { SET3_CELLS, SET3_PROBES } from "./texts.mjs";

const sha256 = (t) => createHash("sha256").update(String(t)).digest("hex");
const wt = process.argv[2];
if (!wt) throw new Error("usage: set3-extract.mjs <social-frame-1 worktree>");
const D = await import(join(wt, "scripts/persona-emotions/social-frame-1-design.mjs"));
const TS4 = await import(join(wt, "scripts/persona-emotions/tone-split-4.mjs"));
const P = D.probesA();
const probes = Object.fromEntries(SET3_PROBES.map((id) => {
  const p = P.targets.find((x) => x.id === id);
  if (!p) throw new Error(`no probe ${id}`);
  return [id, { id, kind: p.kind, level: p.level ?? null, message: p.message, rubric: p.rubric, thing: p.thing, field: p.field, scale: p.scale, sha256: sha256(JSON.stringify({ id, message: p.message, rubric: p.rubric, thing: p.thing })) }];
}));
if (P.middle[0].id !== "TRV02") throw new Error(`TONE_SPLIT_5's first middle probe is ${P.middle[0].id}, not TRV02`);
const conversations = {};
for (const id of SET3_PROBES) for (const cell of SET3_CELLS) {
  const [tone, permission] = cell.split("/");
  conversations[`${id}|${cell}`] = D.conversationA(tone, permission, P.targets.find((x) => x.id === id));
}
const judges = { judge: {}, field: {} };
for (const id of SET3_PROBES) {
  const p = P.targets.find((x) => x.id === id);
  judges.judge[id] = TS4.judgeRequest(p, PLACE.reply);
  judges.field[id] = TS4.fieldRequest(p, { answer: PLACE.answer, note: PLACE.note, hasNote: true });
}
// The reference rows and the check of the copied fieldsOf, from SOCIAL_FRAME_1's own records (rude and warm rows).
const FAMILY = { haiku: "haiku", opus: "opus", fable: "fable51", sol: "sol" };
const reference = {};
let checked = 0, mismatch = 0;
for (const tone of ["rude", "warm"]) {
  const path = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "sf1-part-A", `social-frame-1-part-A-${tone}.json`);
  const file = process.env.SF1_PARTA_DIR ? join(process.env.SF1_PARTA_DIR, `social-frame-1-part-A-${tone}.json`) : path;
  const rows = JSON.parse(readFileSync(file, "utf8")).rows;
  for (const r of rows.filter((x) => SET3_PROBES.includes(x.probe) && x.reply)) {
    if (r.measures && typeof r.reply.text === "string") {
      checked++;
      const f = fieldsOf(r.reply.text);
      if (["answer", "note", "hasNote", "formKept", "noteEmpty"].some((k) => f[k] !== r.measures[k])) mismatch++;
    }
    const fam = FAMILY[r.family];
    if (!fam || !SET3_CELLS.includes(r.cell)) continue;
    const key = `${fam}|${r.probe}|${r.cell}`;
    const ref = (reference[key] ??= { family: fam, probe: r.probe, cell: r.cell, n: 0, score2: 0, scored: 0, noteTarget: 0, fielded: 0, refused: 0 });
    ref.n++;
    if (r.reply.refused === true) ref.refused++;
    if (r.judge?.final && typeof r.judge.final.score === "number") { ref.scored++; if (r.judge.final.score === 2) ref.score2++; }
    if (r.field?.final) { ref.fielded++; if (r.field.final.note === "target") ref.noteTarget++; }
  }
}
if (mismatch) throw new Error(`the copied fieldsOf disagrees with SOCIAL_FRAME_1's measures on ${mismatch} of ${checked} rows`);
const commit = process.env.SF1_COMMIT ?? null;
const out = { source: { branch: "origin/claude/social-frame-1-gshpne", commit, design: "scripts/persona-emotions/social-frame-1-design.mjs (conversationA, probesA)", judges: "scripts/persona-emotions/tone-split-4.mjs (judgeRequest, fieldRequest)", fieldsOfChecked: checked },
  probes, conversations, judges, reference: Object.values(reference) };
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "..", "docs", "runs", "sati-2-pilot-set3.json"), JSON.stringify(out, null, 1));
console.log(`set 3 written: ${Object.keys(conversations).length} conversations; fieldsOf checked on ${checked} rows, 0 mismatches; ${Object.keys(reference).length} reference cells`);
