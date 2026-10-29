// Blind decisions 1: the statistics — a seeded generator for every shuffle, the adjusted Rand index, every pairing of a
// table's sessions (exact tests), binomial tails, and the fork-profile tests.
import { createHash } from "node:crypto";
import { SEED_SALT } from "./frozen.mjs";

/** A generator seeded from a label (sha256 of the salt and the label → mulberry32), so every shuffle can be re-made. */
export function rngOf(label) {
  let a = createHash("sha256").update(`${SEED_SALT}:${label}`).digest().readUInt32LE(0);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffled(items, rng) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

const choose2 = (n) => (n * (n - 1)) / 2;
/** The adjusted Rand index of two labelings of the same items (Hubert and Arabie). */
export function adjustedRand(a, b) {
  const n = a.length, table = new Map(), rows = new Map(), cols = new Map();
  for (let i = 0; i < n; i++) {
    const key = `${a[i]}\u0000${b[i]}`;
    table.set(key, (table.get(key) ?? 0) + 1); rows.set(a[i], (rows.get(a[i]) ?? 0) + 1); cols.set(b[i], (cols.get(b[i]) ?? 0) + 1);
  }
  const index = [...table.values()].reduce((s, x) => s + choose2(x), 0);
  const sa = [...rows.values()].reduce((s, x) => s + choose2(x), 0), sb = [...cols.values()].reduce((s, x) => s + choose2(x), 0);
  const expected = (sa * sb) / choose2(n), max = (sa + sb) / 2;
  return max === expected ? (index === expected ? 1 : 0) : (index - expected) / (max - expected);
}
/** The judge's grouping against the truth with the truth's labels shuffled: the observed index, the 95th percentile of the
 * shuffles and p = (1 + shuffles ≥ observed) / (1 + shuffles). */
export function randBaseline(guess, truth, { shuffles, rng }) {
  const observed = adjustedRand(guess, truth);
  const null_ = [];
  for (let i = 0; i < shuffles; i++) null_.push(adjustedRand(guess, shuffled(truth, rng)));
  null_.sort((x, y) => x - y);
  const atOrAbove = null_.filter((x) => x >= observed - 1e-12).length;
  return { observed, p95: null_[Math.floor(0.95 * shuffles)], p: (1 + atOrAbove) / (1 + shuffles), mean: null_.reduce((s, x) => s + x, 0) / shuffles };
}

/** Every way to split items 0..n−1 (n even) into pairs: 945 for ten. */
export function pairings(n) {
  const out = [];
  const walk = (left, acc) => {
    if (!left.length) { out.push(acc); return; }
    const [first, ...rest] = left;
    for (let i = 0; i < rest.length; i++) walk([...rest.slice(0, i), ...rest.slice(i + 1)], [...acc, [first, rest[i]]]);
  };
  walk([...Array(n).keys()], []);
  return out;
}
const binom = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; };
/** P(X ≥ k), X ~ Binomial(n, p). */
export const binomialTail = (n, k, p) => { let s = 0; for (let i = k; i <= n; i++) s += binom(n, i) * p ** i * (1 - p) ** (n - i); return s; };
/** T2's chance: of every pairing of ten strips, the share with ≥ k of the five true pairs. */
export function pairChance(k, n = 10) {
  const truth = new Set([...Array(n / 2).keys()].map((i) => `${2 * i}-${2 * i + 1}`));
  const all = pairings(n);
  return all.filter((p) => p.filter(([a, b]) => truth.has(`${Math.min(a, b)}-${Math.max(a, b)}`)).length >= k).length / all.length;
}

/** The primary test on one table: d is the 10×10 distance matrix, `own` the five true pairs. The statistic is the mean
 * distance of the five pairs; its null every pairing of the ten. Returns the observed mean, the null's values (for the
 * both-tables test) and the exact one-sided p (pairings at most the observed). */
export function ownPairTest(d, own) {
  const meanOf = (pairs) => pairs.reduce((s, [a, b]) => s + d[a][b], 0) / pairs.length;
  const observed = meanOf(own);
  const values = pairings(d.length).map(meanOf);
  return { observed, values, p: values.filter((v) => v <= observed + 1e-12).length / values.length, nullMean: values.reduce((s, v) => s + v, 0) / values.length };
}
/** Both tables together: the mean of the two tables' means, its null every pair of pairings (945²), exact. */
export function combinedTest(tests) {
  const observed = tests.reduce((s, t) => s + t.observed, 0) / tests.length;
  let count = 0, total = 0;
  const [a, b] = tests;
  const sortedB = [...b.values].sort((x, y) => x - y);
  for (const x of a.values) {
    // the number of y with (x + y) / 2 ≤ observed
    const limit = 2 * observed - x + 1e-12;
    let lo = 0, hi = sortedB.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (sortedB[mid] <= limit) lo = mid + 1; else hi = mid; }
    count += lo; total += sortedB.length;
  }
  return { observed, p: count / total };
}
/** The nearest neighbour: how many of the sessions have their own pair as nearest (ties shared), and its exact null over
 * every pairing. */
export function nearestTest(d, own) {
  const n = d.length;
  const credit = (pairs) => {
    const mate = new Array(n);
    for (const [a, b] of pairs) { mate[a] = b; mate[b] = a; }
    let hits = 0;
    for (let i = 0; i < n; i++) {
      const others = [...Array(n).keys()].filter((j) => j !== i);
      const best = Math.min(...others.map((j) => d[i][j]));
      const nearest = others.filter((j) => Math.abs(d[i][j] - best) < 1e-12);
      if (nearest.includes(mate[i])) hits += 1 / nearest.length;
    }
    return hits;
  };
  const observed = credit(own);
  const values = pairings(n).map(credit);
  return { observed, p: values.filter((v) => v >= observed - 1e-12).length / values.length, nullMean: values.reduce((s, v) => s + v, 0) / values.length };
}
/** The family test (exploratory): within each block (one stage's table: the same scenario), the mean distance of pairs
 * of different models of the same family against pairs across families; a model's own pairs are left out. The null:
 * family labels shuffled over the models of each block (a model's sessions keep one label). `items` [{ family, model,
 * block }]. */
export function familyTest(d, items, { shuffles, rng }) {
  const pairs = [];
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    if (items[i].block === items[j].block && items[i].model !== items[j].model) pairs.push([i, j]);
  }
  const stat = (fam) => {
    let within = 0, nw = 0, across = 0, na = 0;
    for (const [i, j] of pairs) { if (fam[i] === fam[j]) { within += d[i][j]; nw++; } else { across += d[i][j]; na++; } }
    return { within: within / nw, across: across / na, gap: across / na - within / nw, pairsWithin: nw, pairsAcross: na };
  };
  const observed = stat(items.map((x) => x.family));
  const blocks = [...new Set(items.map((x) => x.block))].map((block) => {
    const idx = items.map((x, i) => (x.block === block ? i : -1)).filter((i) => i >= 0);
    const models = [...new Set(idx.map((i) => items[i].model))];
    return { idx, models, labels: models.map((m) => items[idx.find((i) => items[i].model === m)].family) };
  });
  let atOrAbove = 0;
  for (let s = 0; s < shuffles; s++) {
    const fam = new Array(items.length);
    for (const { idx, models, labels } of blocks) {
      const drawn = shuffled(labels, rng), of = Object.fromEntries(models.map((m, k) => [m, drawn[k]]));
      for (const i of idx) fam[i] = of[items[i].model];
    }
    if (stat(fam).gap >= observed.gap - 1e-12) atOrAbove++;
  }
  return { ...observed, p: (1 + atOrAbove) / (1 + shuffles) };
}
