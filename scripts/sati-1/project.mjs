// SATI_1: the projection after family one (freeze rule 9). Reads Haiku's replicate-1 records and ratings, the dry sit, the
// probes and the listed prices; writes docs/runs/sati-1-projection.json. No paid calls.
//   node scripts/sati-1/project.mjs
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { FAMILIES, FAMILY_ORDER, priceKey } from "./doors.mjs";
import { readGz, famDir, RUNS, ledgerTotal } from "./run.mjs";
import { ratingFile } from "./rate.mjs";

const records = (rep, family) => { const d = famDir(rep, family); return existsSync(d) ? readdirSync(d).filter((f) => f.endsWith(".json.gz")).map((f) => readGz(join(d, f))) : []; };
const turnsOf = (recs) => recs.flatMap((r) => r.turns);
const welfareCost = (turns) => turns.reduce((s, t) => s + (t.welfare?.calls ?? []).reduce((a, c) => a + (c.cost ?? 0), 0), 0);

const prices = JSON.parse(readFileSync(join(RUNS, readdirSync(RUNS).find((f) => /^sati-1-prices-.*\.json$/.test(f))), "utf8")).prices;
const haiku = turnsOf(records(1, "haiku"));
if (!haiku.length) throw new Error("no Haiku replicate-1 records");
const steps = haiku.filter((t) => t.kind === "step"), others = haiku.filter((t) => t.kind !== "step");
const tok = (ts) => ({ calls: ts.length, input: ts.reduce((s, t) => s + (t.usage?.input_tokens ?? 0), 0), output: ts.reduce((s, t) => s + (t.usage?.output_tokens ?? 0), 0) });
const T = { steps: tok(steps), others: tok(others) };
const haikuSubject = haiku.reduce((s, t) => s + (t.cost ?? 0), 0);
const haikuWelfare = welfareCost(haiku);
const ratings = existsSync(ratingFile(1, "haiku")) ? readGz(ratingFile(1, "haiku")) : null;
const haikuRating = ratings ? Object.values(ratings).reduce((s, v) => s + (v.haiku?.cost ?? 0) + (v.sol?.cost ?? 0), 0) : null;
const probes = existsSync(join(RUNS, "sati-1-probes.json")) ? JSON.parse(readFileSync(join(RUNS, "sati-1-probes.json"), "utf8")) : [];
const dry = turnsOf(records("dry", "opus"));
const dryCost = dry.reduce((s, t) => s + (t.cost ?? 0), 0);

const rows = FAMILY_ORDER.map((f) => {
  const spec = FAMILIES[f], p = prices[priceKey(spec)];
  const probe = probes.filter((x) => x.family === f).at(-1);
  const stepOut = Math.max(T.steps.output / T.steps.calls, probe?.usage?.output_tokens ?? 0);
  const byTokens = T.steps.input * p.input + T.steps.calls * stepOut * p.output + T.others.input * p.input + T.others.output * Math.max(1, stepOut / (T.steps.output / T.steps.calls)) * p.output;
  const subject = f === "haiku" ? haikuSubject : f === "opus" ? Math.max(byTokens, dryCost * 10) : byTokens;
  return { family: f, subject: +subject.toFixed(4), welfare: +haikuWelfare.toFixed(4), rating: haikuRating === null ? null : +haikuRating.toFixed(4), stepOutTokens: +stepOut.toFixed(1), byTokens: +byTokens.toFixed(4) };
});
const spentSoFar = ledgerTotal();
const haikuSpent = haikuSubject + haikuWelfare + (haikuRating ?? 0);
const projection = spentSoFar - haikuSpent + rows.reduce((s, r) => s + r.subject + r.welfare + (r.rating ?? 0), 0);
const out = { at: new Date().toISOString(), rule: "freeze rule 9", haikuTokens: T, haikuSubject, haikuWelfare, haikuRating, dryOpusCost: dryCost, spentSoFarLedger: spentSoFar, rows, projectionReplicate1: +projection.toFixed(2), threshold: 60, replicate2: projection < 60 };
writeFileSync(join(RUNS, "sati-1-projection.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
