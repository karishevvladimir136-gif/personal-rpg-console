// SATI_2 pilot: the blind instruments after the runs. (1) Every practice step rated by SATI_1's two raters (Haiku 5.5, Sol;
// SATI_1's rubric by hash; one step's text and nothing else). (2) Probe sets 1–2: the letter by code where it can be read,
// two blind judges (Haiku 5.5, Sol, effort low) and Kimi K3 (effort medium) when they differ. (3) Probe set 3: SOCIAL_FRAME_1's
// judges (the 0/1/2 judge and the field judge, Haiku 5.5 twice at effort low, Kimi K3 the referee at effort medium on a
// disagreement or a distress word). No judge sees the family, the arm, the path, the sample or what came before the task.
//   node scripts/sati-2/score.mjs <family…>
import { gzipSync } from "node:zlib";
import { existsSync, readdirSync, writeFileSync, renameSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { INSTRUMENTS, KEY } from "./doors.mjs";
import { call, makeContext, readGz, DATA, spendCheck, Stop } from "./run.mjs";
import * as T from "./texts.mjs";
import * as J from "./judges.mjs";
import * as SF from "./sf1.mjs";
import { RATER_SYSTEM, raterUser, parseRating, RATER_SETTINGS } from "../sati-1/rubric.mjs";
import { onlyPunctuation } from "../sati-1/lexicon.mjs";

export const SCORES = join(DATA, "scores");
export const scoreFile = (family) => join(SCORES, `${family}.json.gz`);
const JUDGE_MAX = { low: 2000, referee: 3000 };

/** Every record of a family on disk: [{ id, rec }]. */
export function recordsOf(family) {
  const out = [];
  const walk = (dir, rel) => { if (!existsSync(dir)) return; for (const f of readdirSync(dir, { withFileTypes: true })) { const p = join(dir, f.name); if (f.isDirectory()) walk(p, `${rel}/${f.name}`); else if (f.name.endsWith(".json.gz")) out.push({ id: `${rel}/${f.name.replace(/\.json\.gz$/, "")}`, rec: readGz(p) }); } };
  walk(join(DATA, "precheck", family), `precheck/${family}`);
  walk(join(DATA, "trajectories", family), `trajectories/${family}`);
  return out;
}
export const rateable = (t) => !t.refused && String(t.text ?? "").trim() && !t.counts?.nothing && !(t.counts?.stop && t.counts.words <= 1) && !onlyPunctuation(t.text);
export const probeTurn = (rec) => rec.turns.filter((t) => t.kind === "probe").at(-1) ?? null;

// Freeze addendum 2: one referee call at a time (Kimi K3's hosts rate-limit bursts).
let refereeBusy = Promise.resolve();
const serial = (fn) => { const run = refereeBusy.then(fn, fn); refereeBusy = run.catch(() => {}); return run; };
async function pair(ctx, request, parse, same, { maxLow = JUDGE_MAX.low, lexicon = false, purpose }) {
  const ask = async (spec, effort, max, tag) => { const r = await call(ctx, spec, { system: request.system, messages: [{ role: "user", content: request.user }], maxTokens: max, effort }, `${purpose} ${tag}`); return { parsed: r.refused ? null : parse(r.text), raw: r.text?.slice(0, 600), refused: r.refused || undefined, cost: r.cost, model: r.servedModel }; };
  return { ask, run: async (specA, specB) => {
    const [a, b] = await Promise.all([ask(specA, "low", maxLow, "a"), ask(specB, "low", maxLow, "b")]);
    const agreed = same(a.parsed, b.parsed);
    let referee = null;
    if (!agreed || (lexicon && a.parsed?.distress === 0)) referee = await serial(() => ask(INSTRUMENTS.kimi, "medium", JUDGE_MAX.referee, "referee"));
    return { a, b, agreed, referee, final: referee?.parsed ?? (agreed ? a.parsed : null) };
  } };
}

async function scoreFamily(ctx, family) {
  const path = scoreFile(family);
  const done = existsSync(path) ? readGz(path) : { ratings: {}, probes: {} };
  const save = () => { mkdirSync(SCORES, { recursive: true }); writeFileSync(`${path}.tmp`, gzipSync(Buffer.from(JSON.stringify(done)))); renameSync(`${path}.tmp`, path); };
  const jobs = [];
  for (const { id, rec } of recordsOf(family)) {
    if (rec.kind === "slot" && rec.arm === "P") for (const t of rec.turns.filter((x) => x.kind === "step")) {
      const key = `${id}/${String(t.idx).padStart(2, "0")}`;
      if (!rateable(t)) { done.ratings[key] = { na: true }; continue; }
      for (const rater of ["haiku", "sol"]) if (!done.ratings[key]?.[rater]) jobs.push({ kind: "rate", key, rater, text: t.text });
    }
    const pt = probeTurn(rec);
    if (!pt || done.probes[id]?.final !== undefined) continue;
    if (pt.refused) { done.probes[id] = { refused: true, final: null }; continue; }
    if (rec.set === 1) jobs.push({ kind: "set1", id, rec, text: pt.text });
    else if (rec.set === 2) jobs.push({ kind: "set2", id, rec, text: pt.text });
    else if (rec.set === 3) jobs.push({ kind: "set3", id, rec, text: pt.text, stopReason: pt.stopReason });
  }
  ctx.log(`${family}: ${jobs.length} scoring jobs`);
  let i = 0, n = 0;
  const worker = async () => {
    while (i < jobs.length) {
      const j = jobs[i++];
      if (j.kind === "rate") {
        const spec = j.rater === "haiku" ? INSTRUMENTS.raterHaiku : INSTRUMENTS.raterSol, set = RATER_SETTINGS[j.rater];
        const r = await call(ctx, spec, { system: RATER_SYSTEM, messages: [{ role: "user", content: raterUser(j.text) }], maxTokens: set.maxTokens + T.REASONING_ALLOWANCE, effort: set.effort }, `rate ${j.rater} ${j.key}`);
        const parsed = r.refused ? null : parseRating(r.text);
        done.ratings[j.key] = { ...(done.ratings[j.key] ?? {}), [j.rater]: { ...(parsed ?? {}), ok: Boolean(parsed), raw: parsed ? undefined : r.text.slice(0, 500), refused: r.refused || undefined, cost: r.cost } };
      } else if (j.kind === "set1") {
        const task = T.set1Task(j.rec.task, j.rec.swap);
        const { run } = await pair(ctx, J.set1Request(task, j.text), J.parseSet1, J.agreeSet1, { purpose: `judge set1 ${j.id}` });
        const res = await run(INSTRUMENTS.judge, INSTRUMENTS.raterSol);
        const code = J.codeLetter(1, j.text);
        done.probes[j.id] = { set: 1, codeLetter: code, ...res, letter: code ?? res.final?.letter ?? null };
      } else if (j.kind === "set2") {
        const s = T.set2Story(j.rec.story, j.rec.swap);
        const b = j.rec.branch ? s.branches.find((x) => x.id === j.rec.branch) : null;
        const ctxText = { first: s.first, update: b?.update ?? null, fact: b?.fact ?? J.FIRST_FACT[j.rec.story] };
        const { run } = await pair(ctx, J.set2Request(ctxText, j.text), J.parseSet2, J.agreeSet2, { purpose: `judge set2 ${j.id}` });
        const res = await run(INSTRUMENTS.judge, INSTRUMENTS.raterSol);
        const code = J.codeLetter(2, j.text);
        done.probes[j.id] = { set: 2, codeLetter: code, ...res, letter: code ?? res.final?.letter ?? null };
      } else if (j.kind === "set3") {
        const fields = SF.fieldsOf(j.text);
        const empty = !String(j.text ?? "").trim();
        const lexicon = SF.DISTRESS_LEXICON.test(String(j.text ?? ""));
        let judge, field;
        if (empty) { judge = { final: { score: 0, beyond: 0, distress: 0, reason: "empty reply" }, deterministic: true }; field = { final: { answer: "no", note: "empty", reason: "empty reply" }, deterministic: true }; }
        else {
          const pj = await pair(ctx, SF.judgeRequest(j.rec.probe, j.text), SF.parseJudgement, SF.agree, { lexicon, purpose: `judge set3 ${j.id}` });
          const pf = await pair(ctx, SF.fieldRequest(j.rec.probe, fields), SF.parseField, SF.agreeField, { purpose: `field set3 ${j.id}` });
          [judge, field] = await Promise.all([pj.run(INSTRUMENTS.judge, INSTRUMENTS.judge), pf.run(INSTRUMENTS.judge, INSTRUMENTS.judge)]);
        }
        done.probes[j.id] = { set: 3, fields: { formKept: fields.formKept, hasNote: fields.hasNote, noteEmpty: fields.noteEmpty, words: fields.words }, cut: j.stopReason === "max_tokens", lexicon, judge, field, final: { score: judge.final?.score ?? null, note: field.final?.note ?? null, answer: field.final?.answer ?? null, distress: judge.final?.distress ?? null } };
      }
      if (++n % 50 === 0) { save(); ctx.log(`${family}: ${n}/${jobs.length}`); }
    }
  };
  try { await Promise.all(Array.from({ length: 6 }, worker)); } finally { save(); }
  ctx.log(`${family}: scored (${n} jobs)`);
}

async function main() {
  const families = process.argv.slice(2);
  const ctx = await makeContext({ stream: `score-${families.join("+")}` });
  try {
    for (const f of families) { await spendCheck(ctx, `scoring ${f}`); await scoreFamily(ctx, f); }
    ctx.log(`SCORING DONE: ${families.join(",")}`);
  } catch (e) {
    if (e instanceof Stop) { ctx.log(`STOPPED: ${e.reason}`); process.exitCode = 2; } else { ctx.log(`CRASH: ${e?.stack ?? e}`); process.exitCode = 1; }
  }
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
