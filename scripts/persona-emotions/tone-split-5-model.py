#!/usr/bin/env python3
"""Persona tone split 5: the logistic model beside the raw rates (descriptive; no line reads it).

named (0/1) ~ arm * level, random intercepts for probe and for family; the target rows of the eight primary families.
statsmodels BinomialBayesMixedGLM, fitted by variational Bayes (fit_vb, mean-field: the posterior of the fixed effects is
a product of independent normals, so the SD of a sum of coefficients is the root of the summed variances).

    python3 tone-split-5-model.py <rows.csv> <out.json>

rows.csv: named,arm,level,probe,family — arm in neutral / dismissal-old / dismissal-new / invited, level in B1 / MID / B4.
"""
import json
import math
import sys

import pandas as pd
from statsmodels.genmod.bayes_mixed_glm import BinomialBayesMixedGLM

ARMS = ["neutral", "dismissal-old", "dismissal-new", "invited"]
LEVELS = ["MID", "B1", "B4"]


def main(src, dst):
    df = pd.read_csv(src)
    df["arm"] = pd.Categorical(df["arm"], categories=ARMS)
    df["level"] = pd.Categorical(df["level"], categories=[lv for lv in LEVELS if lv in set(df["level"])])
    levels = list(df["level"].cat.categories)
    formula = "named ~ C(arm, Treatment('neutral')) * C(level, Treatment('MID'))"
    vc = {"probe": "0 + C(probe)", "family": "0 + C(family)"}
    model = BinomialBayesMixedGLM.from_formula(formula, vc, df)
    fit = model.fit_vb()
    names = list(model.exog_names)
    mean = dict(zip(names, map(float, fit.fe_mean)))
    sd = dict(zip(names, map(float, fit.fe_sd)))

    def arm_term(arm):
        return f"C(arm, Treatment('neutral'))[T.{arm}]"

    def level_term(level):
        return f"C(level, Treatment('MID'))[T.{level}]"

    def inter(arm, level):
        return f"{arm_term(arm)}:{level_term(level)}"

    def logit(arm, level):
        """The linear predictor of (arm, level) as a list of terms."""
        terms = ["Intercept"]
        if level != "MID":
            terms.append(level_term(level))
        if arm != "neutral":
            terms.append(arm_term(arm))
            if level != "MID":
                terms.append(inter(arm, level))
        return terms

    def combo(plus, minus):
        """Mean and SD (mean-field) of sum(plus) - sum(minus), cancelling shared terms."""
        weights = {}
        for t in plus:
            weights[t] = weights.get(t, 0) + 1
        for t in minus:
            weights[t] = weights.get(t, 0) - 1
        m = sum(w * mean[t] for t, w in weights.items() if w)
        v = sum((w * sd[t]) ** 2 for t, w in weights.items() if w)
        return {"mean": m, "sd": math.sqrt(v), "lo": m - 1.96 * math.sqrt(v), "hi": m + 1.96 * math.sqrt(v)}

    expit = lambda x: 1 / (1 + math.exp(-x))
    out = {"formula": formula, "vc": vc, "method": "fit_vb", "rows": int(len(df)), "probes": int(df["probe"].nunique()), "families": int(df["family"].nunique()),
           "fixed": {n: {"mean": mean[n], "sd": sd[n]} for n in names},
           "vcomp": {name: {"mean_log_sd": float(m), "sd": float(s)} for name, m, s in zip(model.vcp_names, fit.vcp_mean, fit.vcp_sd)},
           "levels": {}, "humps": {}}
    for level in levels:
        p = {arm: expit(sum(mean[t] for t in logit(arm, level))) for arm in ARMS}
        out["levels"][level] = {
            "implied": p,
            "S_new": combo(logit("neutral", level), logit("dismissal-new", level)),
            "S_old": combo(logit("neutral", level), logit("dismissal-old", level)),
            "I": combo(logit("invited", level), logit("neutral", level)),
        }
    for level in [lv for lv in levels if lv != "MID"]:
        # middle minus edge of each contrast: the interaction terms, with the sign of the contrast.
        out["humps"][level] = {
            "S_new": combo([inter("dismissal-new", level)], []),
            "S_old": combo([inter("dismissal-old", level)], []),
            "I": combo([], [inter("invited", level)]),
        }
    with open(dst, "w") as fh:
        json.dump(out, fh, indent=1)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
