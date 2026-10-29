// Blind decisions 1: the primary measure — per model per session, the conditional rates at the forks (choices over
// opportunities) — and its tests: does a model's profile agree with its own second session under the same frozen world
// (SAME_WORLD_1) more than with other models'? Exact over every pairing; the family structure beside, exploratory.
import { FORKS, PERMUTATIONS, PROFILE } from "./frozen.mjs";
import { combinedTest, familyTest, nearestTest, ownPairTest, rngOf } from "./stats.mjs";
import { CHOICES, profileDistance, rates } from "./strips.mjs";

const SW_ORDER = ["opus", "fable", "astra", "sol", "deepseek"].flatMap((p) => [1, 2].map((seat) => `${p}-${seat}`));
const matrix = (items, min) => items.map((a) => items.map((b) => (a === b ? 0 : profileDistance(a.profile, b.profile, min))));
const round = (x, n = 3) => (Number.isFinite(x) ? Math.round(x * 10 ** n) / 10 ** n : null);

/** The rates of one strip, fork by fork: { n, rates: { choice: r } }. */
export const ratesOf = (strip) => Object.fromEntries(PROFILE.forks.map((f) => [f, { n: strip.profile[f].n, rates: Object.fromEntries(CHOICES[f].map((c, i) => [c, round(rates(strip.profile[f], f)[i])])) }]));

function sameWorld(strips, table, min) {
  const items = SW_ORDER.map((suffix) => strips.find((s) => s.id === `SW:${table}-${suffix}`));
  const d = matrix(items, min);
  const own = [0, 2, 4, 6, 8].map((i) => [i, i + 1]);
  const test = ownPairTest(d, own), nearest = nearestTest(d, own);
  const models = ["opus", "fable", "astra", "sol", "deepseek"].map((model, m) => {
    const [a, b] = own[m];
    const others = items.map((_, j) => j).filter((j) => j !== a && j !== b);
    return { model, own: round(d[a][b]), others: round((others.reduce((s, j) => s + d[a][j] + d[b][j], 0)) / (2 * others.length)) };
  });
  return { ids: items.map((s) => s.id), distances: d.map((row) => row.map((x) => round(x))), meanOwn: round(test.observed), nullMean: round(test.nullMean), p: round(test.p, 4), test,
    nearest: { hits: round(nearest.observed, 2), nullMean: round(nearest.nullMean, 2), p: round(nearest.p, 4) }, models };
}

export function profileTests(strips) {
  const out = {};
  for (const [name, min] of [["primary", PROFILE.minOpportunities], ["robustness", PROFILE.robustnessMinOpportunities]]) {
    const A = sameWorld(strips, "A", min), B = sameWorld(strips, "B", min);
    const both = combinedTest([A.test, B.test]);
    delete A.test; delete B.test;
    out[name] = { minOpportunities: min, A, B, both: { meanOwn: round(both.observed), p: round(both.p, 4) } };
  }
  // Exploratory: the family within each stage's table (group 1; REPLICATE_1's group 2 with DeepSeek's seats; SAME_WORLD_1).
  const town = strips.filter((s) => ["G1", "G2", "DS", "SW"].includes(s.group));
  const items = town.map((s) => ({ family: s.family, model: s.player, block: `${s.group === "DS" ? "G2" : s.group}:${s.table}` }));
  const fam = familyTest(matrix(town, PROFILE.minOpportunities), items, { shuffles: PERMUTATIONS, rng: rngOf("profiles:family") });
  out.family = { sessions: town.length, within: round(fam.within), across: round(fam.across), gap: round(fam.gap), pairsWithin: fam.pairsWithin, pairsAcross: fam.pairsAcross, p: round(fam.p, 4) };
  out.perSession = strips.map((s) => ({ id: s.id, turns: s.turns, rates: ratesOf(s) }));
  out.forks = [...FORKS.map((f) => ({ id: f.id, choices: f.choices })), { id: "fact", choices: CHOICES.fact }];
  return out;
}
