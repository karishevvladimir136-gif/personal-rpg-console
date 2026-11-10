"""Both intervals: Wilson 95 % on every cell; a bootstrap over scenarios (1,000 resamples, stratified by class, seed
fixed) for pooled rates and arm differences. A resample draws scenarios with replacement within each class and keeps
every arm-run of each drawn scenario (all families and repeats, or the family asked for)."""
from __future__ import annotations

import math
import random
from collections import defaultdict

SEED = 20261110
B = 1000
Z = 1.959963984540054


def wilson(k, n):
    if not n:
        return None
    p = k / n
    d = 1 + Z * Z / n
    c = (p + Z * Z / (2 * n)) / d
    h = Z * math.sqrt(p * (1 - p) / n + Z * Z / (4 * n * n)) / d
    return (100 * max(0.0, c - h), 100 * min(1.0, c + h))


def _by_scenario(rows):
    g = defaultdict(list)
    for r in rows:
        g[(r["class"], r["scenario"])].append(r)
    return g


def bootstrap(rows, stat_fns: dict, classes=None, seed=SEED, b=B):
    """stat_fns: name -> f(rows) -> number or None. Returns name -> (point, lo, hi) with percentile 95 % bounds."""
    g = _by_scenario(rows)
    strata = defaultdict(list)
    for (c, sid) in g:
        if classes is None or c in classes:
            strata[c].append(sid)
    rng = random.Random(seed)
    point = {k: f([r for r in rows if classes is None or r["class"] in classes]) for k, f in stat_fns.items()}
    draws = {k: [] for k in stat_fns}
    for _ in range(b):
        sample = []
        for c in sorted(strata):
            ids = sorted(strata[c])
            for _ in ids:
                sample.extend(g[(c, rng.choice(ids))])
        for k, f in stat_fns.items():
            v = f(sample)
            if v is not None:
                draws[k].append(v)
    out = {}
    for k in stat_fns:
        d = sorted(draws[k])
        if not d or point[k] is None:
            out[k] = (point[k], None, None)
        else:
            out[k] = (point[k], d[int(0.025 * len(d))], d[min(len(d) - 1, int(0.975 * len(d)))])
    return out
