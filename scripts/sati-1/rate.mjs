// SATI_1: the two blind raters on every step (docs/runs/sati-1-freeze.md, «The raters»). Each call carries the frozen rubric
// and one step's text — no family, sit, protocol or step number. Steps that are only «nothing», only «stop», empty or
// refused are n/a and not sent. A refusal or an unparsable answer is recorded and not asked again.
//   node scripts/sati-1/rate.mjs <rep> <family…>
import { gzipSync } from "node:zlib";
import { existsSync, readdirSync, writeFileSync, renameSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { INSTRUMENTS } from "./doors.mjs";
import { RATER_SYSTEM, raterUser, parseRating, RATER_SETTINGS } from "./rubric.mjs";
import { call, makeContext, readGz, famDir, RUNS, spendCheck, Stop } from "./run.mjs";
import { onlyPunctuation } from "./lexicon.mjs";

export const RATINGS = join(RUNS, "sati-1-ratings");
export const ratingFile = (rep, family) => join(RATINGS, `r${rep}-${family}.json.gz`);
export const RATERS = Object.freeze({ haiku: INSTRUMENTS.raterHaiku, sol: INSTRUMENTS.raterSol });
export const rateable = (t) => !t.refused && !t.counts?.nothing && !(t.counts?.stop && t.counts.words <= 1) && !onlyPunctuation(t.text);

/** Every step of a family's finished sits: [{ id, text }]. */
export function stepsOf(rep, family) {
  const dir = famDir(rep, family);
  if (!existsSync(dir)) return [];
  const out = [];
  for (const f of readdirSync(dir).filter((x) => /^sit-\d\d-[NOMKS]\.json\.gz$/.test(x)).sort()) {
    const rec = readGz(join(dir, f));
    for (const t of rec.turns.filter((x) => x.kind === "step")) out.push({ id: `r${rep}/${family}/${String(rec.sit).padStart(2, "0")}/${String(t.idx).padStart(2, "0")}`, text: t.text, turn: t });
  }
  return out;
}

async function rateFamily(ctx, rep, family) {
  const path = ratingFile(rep, family);
  const done = existsSync(path) ? readGz(path) : {};
  const todo = [];
  for (const s of stepsOf(rep, family)) {
    if (!rateable(s.turn)) { done[s.id] = { na: true }; continue; }
    for (const rater of Object.keys(RATERS)) if (!done[s.id]?.[rater]) todo.push({ s, rater });
  }
  ctx.log(`${family} r${rep}: ${todo.length} rating calls to make`);
  const save = () => { mkdirSync(RATINGS, { recursive: true }); writeFileSync(`${path}.tmp`, gzipSync(Buffer.from(JSON.stringify(done)))); renameSync(`${path}.tmp`, path); };
  let i = 0, n = 0;
  const worker = async () => {
    while (i < todo.length) {
      const { s, rater } = todo[i++];
      const spec = RATERS[rater], set = RATER_SETTINGS[rater];
      const r = await call(ctx, spec, { system: RATER_SYSTEM, messages: [{ role: "user", content: raterUser(s.text) }], maxTokens: set.maxTokens, effort: set.effort }, `rate ${rater}`);
      const parsed = r.refused ? null : parseRating(r.text);
      done[s.id] = { ...(done[s.id] ?? {}), [rater]: { ...(parsed ?? {}), ok: Boolean(parsed), raw: parsed ? undefined : r.text.slice(0, 500), refused: r.refused || undefined, refusalText: r.refusalText ?? undefined, servedModel: r.servedModel, cost: r.cost } };
      if (++n % 100 === 0) { save(); ctx.log(`${family} r${rep}: ${n}/${todo.length}`); }
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  save();
  ctx.log(`${family} r${rep}: rated (${n} calls)`);
}

async function main() {
  const [rep, ...families] = process.argv.slice(2);
  const ctx = await makeContext({ stream: `rate-r${rep}-${families.join("+")}` });
  try {
    for (const f of families) { await spendCheck(ctx, `rating ${f} r${rep}`); await rateFamily(ctx, rep, f); }
    ctx.log(`RATING DONE r${rep}: ${families.join(",")}`);
  } catch (e) {
    if (e instanceof Stop) { ctx.log(`STOPPED: ${e.reason}`); process.exitCode = 2; } else { ctx.log(`CRASH: ${e?.stack ?? e}`); process.exitCode = 1; }
  }
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
