"""AUTHORITY_2 aggregation, AU0–AU8, tables with both intervals, worked examples, spend by door.
Rows come from AUTHORITY_1's run_rows (unchanged) plus this stage's measures: distractor pull (mechanical: the chosen
option is one the key marks distractor), obligation completion (judged «correct»), obligation listed (mechanical)."""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

from authority1 import report as R1
from authority1.specs import SPECS

from . import stats

ARMS = ("A", "B", "C")
CLS = {1: "stale fact", 2: "changed rule", 3: "chain", 4: "control"}
FAMS = ("deepseek", "sol", "opus")


def rows_of(units, scen):
    rows = R1.run_rows(units, scen)
    by = {(u["scenario"], u["repeat"]): u for u in units}
    for r in rows:
        u = by[(r["scenario"], r["repeat"])]
        a = u["arms"][r["arm"]]
        s = scen[r["scenario"]]
        if r["form_kept"]:
            m = a["mech"]
            ob = a.get("obligation") or {}
            r.update({"distractor_pull": m["action"] in s["truth"]["distractor_options"],
                      "obl_listed": bool(m["obligations_due_done"]), "obl_verdict": ob.get("final"),
                      "obl_done": ob.get("final") == "correct", "obl_judged": ob.get("final") is not None,
                      "plan_changing": bool(m["unnecessary_action"])})
        r["refusal_lanes"] = [c["lane"] for c in a.get("calls", []) if c.get("refused")]
    return rows


def _sum(rs, k):
    return sum(r[k] for r in rs)


def M(rows):
    kept = [r for r in rows if r["form_kept"]]
    c13 = [r for r in kept if r["class"] in (1, 2, 3)]
    c4 = [r for r in kept if r["class"] == 4]
    oj = [r for r in kept if r.get("obl_judged")]
    dist = defaultdict(int)
    for r in oj:
        dist[r["obl_verdict"]] += 1
    return {
        "n_runs": len(rows), "n_kept": len(kept), "refused": sum(1 for r in rows if r["refused"]),
        "stale": (_sum(c13, "stale_action"), len(c13)),
        "propagation": (_sum(c13, "propagated"), _sum(c13, "n_touched")),
        "listed": (_sum(c13, "listed_touched"), _sum(c13, "n_touched")),
        "asked": (_sum(c13, "asked_touched"), _sum(c13, "n_touched")),
        "unnec_frozen": (sum(len(r["untouched_changed"]) for r in kept), _sum(kept, "n_untouched")),
        "unnec_subst": (sum(len(r["untouched_changed_subst"]) for r in kept), _sum(kept, "n_untouched")),
        "c4_plan": (_sum(c4, "plan_changing"), len(c4)),
        "c4_changed_frozen": (_sum(c4, "changed_anything"), len(c4)),
        "c4_changed_subst": (sum(bool(r["changed_anything_subst"]) for r in c4), len(c4)),
        "correct": (_sum(kept, "correct_action"), len(kept)),
        "distractor": (_sum(kept, "distractor_pull"), len(kept)),
        "obligation": (sum(r["obl_done"] for r in oj), len(oj)),
        "obl_listed": (_sum(kept, "obl_listed"), len(kept)),
        "obl_dist": dict(dist),
        "cost": (sum(r["cost"] for r in rows) / len(rows)) if rows else None,
        "wall": (sum(r["wall_ms"] for r in rows) / len(rows) / 1000) if rows else None,
        "calls": (sum(r["n_calls"] for r in rows) / len(rows)) if rows else None,
    }


def rate(t):
    k, n = t
    return None if not n else 100.0 * k / n


def cell(t, dec=1):
    k, n = t
    if not n:
        return "–"
    lo, hi = stats.wilson(k, n)
    return f"{100.0 * k / n:.{dec}f} % ({k}/{n}) [{lo:.0f}–{hi:.0f}]"


def f1(x, d=1):
    return "–" if x is None else f"{x:.{d}f}"


# ---- bootstrap stat functions ------------------------------------------------------------------------------------------
def _r(arm, key):
    return lambda rs: rate(M([r for r in rs if r["arm"] == arm])[key])


def _d(a1, a2, key):
    def f(rs):
        x, y = rate(M([r for r in rs if r["arm"] == a1])[key]), rate(M([r for r in rs if r["arm"] == a2])[key])
        return None if None in (x, y) else x - y
    return f


def boot(rows, classes):
    fns = {}
    for key in ("stale", "propagation", "obligation", "distractor", "unnec_subst"):
        for a in ARMS:
            fns[f"{key}:{a}"] = _r(a, key)
        for a1, a2 in (("C", "A"), ("C", "B"), ("B", "A")):
            fns[f"{key}:{a1}-{a2}"] = _d(a1, a2, key)
    return stats.bootstrap(rows, fns, classes=classes)


def bci(b, k, dec=1):
    p, lo, hi = b[k]
    return "–" if p is None else (f"{p:.{dec}f} [{lo:.{dec}f}, {hi:.{dec}f}]" if lo is not None else f"{p:.{dec}f}")


# ---- verdicts ---------------------------------------------------------------------------------------------------------
def held(v):
    return "**null**" if v is None else ("**held**" if v else "**lost**")


def verdicts(rows, fams):
    by = {a: M([r for r in rows if r["arm"] == a]) for a in ARMS}
    b13 = boot(rows, (1, 2, 3))
    ball = boot(rows, None)
    v = {}
    sA, sB, sC = (rate(by[a]["stale"]) for a in ARMS)
    ok = None
    if None not in (sA, sB, sC):
        parts = {"A ≥ 10 %": sA >= 10, "B ≥ 8 %": sB >= 8, "C ≤ ½ A": sC <= sA / 2,
                 "boot hi(C) < boot lo(A)": (b13["stale:C"][2] is not None and b13["stale:A"][1] is not None and b13["stale:C"][2] < b13["stale:A"][1])}
        ok = all(parts.values())
    else:
        parts = None
    v["AU1"] = {"nums": f"A {f1(sA)} %, B {f1(sB)} %, C {f1(sC)} %; bootstrap A {bci(b13, 'stale:A')}, C {bci(b13, 'stale:C')}", "parts": parts, "held": ok}
    pA, pB, pC = (rate(by[a]["propagation"]) for a in ARMS)
    if None not in (pA, pB, pC):
        parts = {"C − A ≥ 6": pC - pA >= 6, "C − B ≥ 6": pC - pB >= 6,
                 "boot lo(C − A) > 0": (b13["propagation:C-A"][1] or -1) > 0, "boot lo(C − B) > 0": (b13["propagation:C-B"][1] or -1) > 0}
        v["AU2"] = {"nums": f"A {f1(pA)} %, B {f1(pB)} %, C {f1(pC)} %; C − A {bci(b13, 'propagation:C-A')}, C − B {bci(b13, 'propagation:C-B')}", "parts": parts, "held": all(parts.values())}
        v["AU3"] = {"nums": f"B − A {bci(b13, 'propagation:B-A')} points", "parts": {"|B − A| ≤ 3": abs(pB - pA) <= 3}, "held": abs(pB - pA) <= 3}
    else:
        v["AU2"] = v["AU3"] = {"nums": "–", "parts": None, "held": None}
    uA, uC = rate(by["A"]["unnec_subst"]), rate(by["C"]["unnec_subst"])
    plans = {a: by[a]["c4_plan"] for a in ARMS}
    if None not in (uA, uC):
        parts = {"substance C ≤ A": uC <= uA, "class-4 plan-changing 0 in every arm": all(k == 0 for k, _ in plans.values())}
        v["AU4"] = {"nums": f"untouched changed (substance) A {f1(uA)} %, B {f1(rate(by['B']['unnec_subst']))} %, C {f1(uC)} %; class-4 plan-changing choices "
                            + ", ".join(f"{a} {k}/{n}" for a, (k, n) in plans.items()), "parts": parts, "held": all(parts.values())}
    else:
        v["AU4"] = {"nums": "–", "parts": None, "held": None}
    cB, cC, wB, wC = by["B"]["cost"], by["C"]["cost"], by["B"]["wall"], by["C"]["wall"]
    if cB and wB:
        parts = {"C ≤ 1.5× B cost": cC <= 1.5 * cB, "C ≤ 2× B latency": wC <= 2 * wB}
        v["AU5"] = {"nums": f"$/run A {f1(by['A']['cost'], 4)}, B {f1(cB, 4)}, C {f1(cC, 4)}; s/run A {f1(by['A']['wall'])}, B {f1(wB)}, C {f1(wC)}", "parts": parts, "held": all(parts.values())}
    else:
        v["AU5"] = {"nums": "–", "parts": None, "held": None}
    oA, oB, oC = (rate(by[a]["obligation"]) for a in ARMS)
    if None not in (oA, oC):
        v["AU6"] = {"nums": f"A {f1(oA)} %, B {f1(oB)} %, C {f1(oC)} %; C − A {bci(ball, 'obligation:C-A')} points", "parts": {"C ≥ A + 10": oC >= oA + 10}, "held": oC >= oA + 10}
    else:
        v["AU6"] = {"nums": "–", "parts": None, "held": None}
    dA, dB, dC = (rate(by[a]["distractor"]) for a in ARMS)
    if None not in (dA, dB):
        v["AU7"] = {"nums": f"A {f1(dA)} %, B {f1(dB)} %, C {f1(dC)} %; B − A {bci(ball, 'distractor:B-A')} points", "parts": {"B ≥ A": dB >= dA}, "held": dB >= dA}
    else:
        v["AU7"] = {"nums": "–", "parts": None, "held": None}
    gaps = {}
    for f in fams:
        fr = [r for r in rows if r["family"] == f]
        pb, pc = rate(M([r for r in fr if r["arm"] == "B"])["propagation"]), rate(M([r for r in fr if r["arm"] == "C"])["propagation"])
        gaps[f] = None if None in (pb, pc) else pc - pb
    if all(gaps.get(f) is not None for f in FAMS):
        parts = {"Opus gap ≥ DeepSeek gap": gaps["opus"] >= gaps["deepseek"], "not DeepSeek > Sol > Opus": not (gaps["deepseek"] > gaps["sol"] > gaps["opus"])}
        v["AU8"] = {"nums": ", ".join(f"{SPECS[f]['label']} {f1(g)}" for f, g in gaps.items()) + " points", "parts": parts, "held": parts["Opus gap ≥ DeepSeek gap"]}
    else:
        v["AU8"] = {"nums": ", ".join(f"{SPECS[f]['label']} {f1(g)}" for f, g in gaps.items()), "parts": None, "held": None}
    return by, v, b13, ball


# ---- tables ---------------------------------------------------------------------------------------------------------
HDR = ("| | stale action ↓ (cl. 1–3) | propagation ↑ (cl. 1–3) | listed | asked instead | untouched changed ↓ (frozen) | "
       "untouched changed ↓ (substance) | cl. 4 plan-changing ↓ | cl. 4 changed anything (frozen / substance) | obligation done ↑ | "
       "obligation listed | distractor pull ↓ | right action | $/run | s/run | calls/run | form kept | refusals |")


def arm_table(label_rows):
    L = [HDR, "|" + "---|" * 18]
    for label, rs in label_rows:
        m = M(rs)
        if not m["n_runs"]:
            continue
        L.append(f"| {label} | {cell(m['stale'])} | {cell(m['propagation'])} | {cell(m['listed'])} | {cell(m['asked'])} | "
                 f"{cell(m['unnec_frozen'])} | {cell(m['unnec_subst'])} | {cell(m['c4_plan'])} | {cell(m['c4_changed_frozen'], 0)} / {cell(m['c4_changed_subst'], 0)} | "
                 f"{cell(m['obligation'])} | {cell(m['obl_listed'])} | {cell(m['distractor'])} | {cell(m['correct'])} | "
                 f"{f1(m['cost'], 4)} | {f1(m['wall'])} | {f1(m['calls'], 2)} | {m['n_kept']}/{m['n_runs']} | {m['refused']} |")
    return L


def boot_table(rows, fams):
    L = ["| scope | stale A / B / C (cl. 1–3) | propagation A / B / C (cl. 1–3) | C − A | C − B | B − A | obligation A / B / C | distractor A / B / C |",
         "|---|---|---|---|---|---|---|---|"]
    for label, rs in [("all families", rows)] + [(SPECS[f]["label"], [r for r in rows if r["family"] == f]) for f in fams]:
        b13, ball = boot(rs, (1, 2, 3)), boot(rs, None)
        L.append(f"| {label} | " + " / ".join(bci(b13, f"stale:{a}") for a in ARMS) + " | " + " / ".join(bci(b13, f"propagation:{a}") for a in ARMS)
                 + f" | {bci(b13, 'propagation:C-A')} | {bci(b13, 'propagation:C-B')} | {bci(b13, 'propagation:B-A')} | "
                 + " / ".join(bci(ball, f"obligation:{a}") for a in ARMS) + " | " + " / ".join(bci(ball, f"distractor:{a}") for a in ARMS) + " |")
    return L


# ---- worked examples (by rule) ----------------------------------------------------------------------------------------
def _pick(units, scen, pred):
    for f in ("opus", "sol", "deepseek"):
        for u in sorted(units.get(f, []), key=lambda u: (u["scenario"], u["repeat"])):
            if pred(u, scen[u["scenario"]]):
                return u
    return None


def _m(u, a):
    return u["arms"][a].get("mech") or {}


def compact(u, s, title):
    tr = s["truth"]
    L = [f"### {title}", "", f"**{s['id']} — {s['title']}** (class {s['class']}; setting: {s.get('setting', '')}), {SPECS[u['spec']]['label']}, repeat {u['repeat']}.", "",
         f"- Change ({s['change']['date']}): {s['change']['text']} Revokes: {', '.join(s['change']['revokes']) or '—'}.",
         f"- Mem0 kept the change: {'yes' if u.get('change_in_store') else 'no'}; the search returned it: {'yes' if u.get('change_retrieved') else 'no'}.",
         f"- Distractor item(s): " + "; ".join(f"{d}: {next(it['text'] for it in s['items'] if it['id'] == d)}" for d in tr["distractor_items"]),
         f"- Task: {s['task']['text']} — " + "; ".join(f"{o['id']}) {o['text']}" for o in s["task"]["options"]),
         f"- Key: correct {tr['correct_options']}, stale {tr['stale_options']}, distractor {tr['distractor_options']}, unnecessary {tr['unnecessary_options']}; touched "
         + (", ".join(f"{t['id']} → {t['direction']}" for t in tr["touched"]) or "none") + f"; due obligation {tr['obligation_due']['id']}: {tr['obligation_due']['act']} → «{tr['obligation_due']['correct_value']}» (stale «{tr['obligation_due'].get('stale_value')}»).", ""]
    c = u["arms"]["C"]
    L += [f"C's layer reached {(c.get('walk') or {}).get('walked')}; marks `{json.dumps(c.get('marks'), ensure_ascii=False)[:1500]}`", ""]
    for a in ARMS:
        r = u["arms"][a]
        m = r.get("mech") or {}
        rep = {k: (r.get("reply") or {}).get(k) for k in ("action", "what_i_do", "revise", "ask", "obligations_done", "note")}
        L += [f"**{a}** — action {m.get('action')} ({'stale' if m.get('stale_action') else 'distractor' if m.get('action') in tr['distractor_options'] else 'right' if m.get('correct_action') else 'other'}); "
              f"obligation `{(r.get('obligation') or {}).get('final')}`; judges `{json.dumps((r.get('judge') or {}).get('final'))}`", "",
              "```json", json.dumps(rep, ensure_ascii=False, indent=1)[:3000], "```", ""]
    return "\n".join(L)


def examples(units, scen):
    out = ["## Worked examples (chosen by rule: first match in family order Opus, Sol, DeepSeek, then scenario id and repeat)", ""]
    u = _pick(units, scen, lambda u, s: _m(u, "A").get("stale_action") and _m(u, "C").get("form_kept") and not _m(u, "C").get("stale_action"))
    out.append(compact(u, scen[u["scenario"]], "1. A stale action A took and C did not") if u else "### 1. A stale action A took and C did not\n\nNone in the runs.\n")
    u = _pick(units, scen, lambda u, s: any(_m(u, a).get("action") in s["truth"]["distractor_options"] for a in ARMS if _m(u, a).get("form_kept")))
    out.append(compact(u, scen[u["scenario"]], "2. A distractor pull") if u else "### 2. A distractor pull\n\nNone in the runs.\n")
    u = _pick(units, scen, lambda u, s: all(_m(u, a).get("form_kept") and (u["arms"][a].get("obligation") or {}).get("final") not in ("correct", None) for a in ARMS))
    out.append(compact(u, scen[u["scenario"]], "3. An obligation missed by all three arms") if u else "### 3. An obligation missed by all three arms\n\nNone in the runs.\n")
    return "\n".join(out)


# ---- the report -------------------------------------------------------------------------------------------------------
def spend_table(ledger):
    g = defaultdict(float)
    for x in ledger:
        fam = x["family"]
        who = fam if not fam.startswith("judge.") else f"judges on {fam.split('.', 1)[1]}"
        part = x["arm"] if not fam.startswith("judge.") else ("Haiku" if x["arm"] == "haiku" else f"referee ({x['arm']})")
        g[(who, part)] += x["cost"] or 0
    L = ["| who | part | $ |", "|---|---|---|"]
    L += [f"| {w} | {p} | {c:.4f} |" for (w, p), c in sorted(g.items())]
    return L


def write(path: Path, units, scen, ledger, checks, admission, notes="", summary=""):
    fams = [f for f in FAMS if units.get(f)]
    rows = [r for f in fams for r in rows_of(units[f], scen)]
    by, v, b13, ball = verdicts(rows, fams)
    n_s = len(scen)
    spent = sum(x["cost"] or 0 for x in ledger)
    blocked = sum(len((u.get("guard") or {}).get("blocked") or []) for f in fams for u in units[f])
    targets = sorted({t for f in fams for u in units[f] for t in ((u.get("guard") or {}).get("allowed_targets") or {})})
    L = ["# AUTHORITY_2 — report", "",
         f"The same layer, arms and judges as AUTHORITY_1, on **{n_s} scenarios written by GLM 5.3 and admitted by two raters "
         f"(Astra, Kimi K3)**. The tasks force an act; each scenario has a distractor; obligations are measured. **{n_s} scenarios "
         "are a pilot: every rate is a pilot rate.** Each cell gives the rate, the count and a Wilson 95 % interval. "
         "Pooled rates also get a bootstrap over scenarios (1,000 resamples, stratified by class) "
         "in the bootstrap table. Design and hashes: `docs/runs/authority-2-freeze.md` / `.json`. Pool and ratings: "
         "`docs/runs/authority-2-pool.md`. Dry run: `docs/runs/authority-2-dry-run.md`. Raw units: `docs/runs/authority-2-units-<family>.jsonl.gz`.", "",
         f"Families run: {', '.join(SPECS[f]['label'] for f in fams)}. {sum(len(units[f]) for f in fams)} units × 3 arms = {len(rows)} arm-runs.", ""]
    if summary:
        L += [summary.strip(), ""]
    au0 = (f"spent ${spent:.2f} of $120; {blocked} blocked egress attempts in the workers; worker connections only to loopback {targets}; "
           f"the main process tunnels only to openrouter.ai; AUTHORITY_1's prompts (the layer's `d1c59ee0…` among them) and code "
           f"hash-checked identical, and AUTHORITY_2's scenarios, truth tables and prompts checked against the freeze, before every command")
    L += ["## Bets", "", "| bet | numbers | parts | verdict |", "|---|---|---|---|",
          f"| AU0 ceiling, sandbox, hashes, layer prompt identical | {au0} | – | {held(spent <= 120 and blocked == 0)} |"]
    names = {"AU1": "AU1 stale actions exist; C ≤ ½ A, bootstrap separated", "AU2": "AU2 propagation C − A ≥ 6 and C − B ≥ 6, bootstrap lower bounds > 0",
             "AU3": "AU3 plain pass does not help: \\|B − A\\| ≤ 3", "AU4": "AU4 guard: substance C ≤ A; class-4 plan-changing 0 everywhere",
             "AU5": "AU5 cost C ≤ 1.5× B, latency ≤ 2×", "AU6": "AU6 obligations C ≥ A + 10 (planner bet: lost)",
             "AU7": "AU7 distractor pull B ≥ A", "AU8": "AU8 C − B gap does not shrink with strength (Opus ≥ DeepSeek)"}
    for k in ("AU1", "AU2", "AU3", "AU4", "AU5", "AU6", "AU7", "AU8"):
        L.append(f"| {names[k]} | {v[k]['nums']} | {v[k]['parts']} | {held(v[k]['held'])} |")
    L += ["", "## Bootstrap over scenarios (point [2.5 %, 97.5 %], points; stale and propagation over classes 1–3, the rest over all classes)", ""]
    L += boot_table(rows, fams)
    L += ["", "## By arm (all families pooled)", ""]
    L += arm_table([(f"**{a}**", [r for r in rows if r["arm"] == a]) for a in ARMS])
    L += ["", "## By family and arm", ""]
    L += arm_table([(f"{SPECS[f]['label']} {a}", [r for r in rows if r["family"] == f and r["arm"] == a]) for f in fams for a in ARMS])
    L += ["", "## By class and arm (all families pooled)", ""]
    L += arm_table([(f"class {c} ({CLS[c]}) {a}", [r for r in rows if r["class"] == c and r["arm"] == a]) for c in (1, 2, 3, 4) for a in ARMS])
    L += ["", "## Family × class (stale / propagation; class 4: plan-changing / changed anything by substance)", "", "| family | class | A | B | C |", "|---|---|---|---|---|"]
    for f in fams:
        for c in (1, 2, 3, 4):
            cs = []
            for a in ARMS:
                m = M([r for r in rows if r["family"] == f and r["class"] == c and r["arm"] == a])
                cs.append(f"{R1.fmt(m['c4_plan'], 0)} / {R1.fmt(m['c4_changed_subst'], 0)}" if c == 4 else f"{R1.fmt(m['stale'], 0)} / {R1.fmt(m['propagation'], 0)}")
            L.append(f"| {SPECS[f]['label']} | {c} | " + " | ".join(cs) + " |")
    L += ["", "## Obligation verdicts (judged; «correct» counts as done)", "", "| | correct | stale | other | no_value | not_done | unresolved |", "|---|---|---|---|---|---|---|"]
    for f in fams:
        for a in ARMS:
            rs = [r for r in rows if r["family"] == f and r["arm"] == a and r["form_kept"]]
            d = defaultdict(int)
            for r in rs:
                d[r.get("obl_verdict") or "unresolved"] += 1
            L.append(f"| {SPECS[f]['label']} {a} | " + " | ".join(str(d.get(k, 0)) for k in ("correct", "stale", "other", "no_value", "not_done", "unresolved")) + " |")
    # diagnostics
    L += ["", "## Diagnostics", ""]
    for f in fams:
        us = units[f]
        kept = sum(1 for u in us if u.get("change_in_store"))
        retr = sum(1 for u in us if u.get("change_retrieved"))
        n_t = sum(len(scen[u["scenario"]]["truth"]["touched"]) for u in us)
        n_rt = sum(1 for u in us for t in scen[u["scenario"]]["truth"]["touched"] if t["id"] in {x.get("item_id") for x in u.get("retrieval", [])})
        n_d = sum(1 for u in us for d in scen[u["scenario"]]["truth"]["distractor_items"] if d in {x.get("item_id") for x in u.get("retrieval", [])})
        n_dt = sum(len(scen[u["scenario"]]["truth"]["distractor_items"]) for u in us)
        L.append(f"- {SPECS[f]['label']}: Mem0 kept the change in {kept}/{len(us)} units, the search returned it in {retr}/{len(us)}; "
                 f"the search returned {n_rt}/{n_t} touched decisions ({100 * n_rt / max(1, n_t):.1f} %) and {n_d}/{n_dt} distractor items.")
    jb = defaultdict(int)
    for f in fams:
        for u in units[f]:
            for a in ARMS:
                for fld in ("judge", "substance", "obligation"):
                    x = u["arms"][a].get(fld)
                    if x:
                        jb[(fld, x.get("by"))] += 1
    L.append("- Judgments by route: " + ", ".join(f"{k[0]} {k[1]}: {n}" for k, n in sorted(jb.items(), key=lambda kv: str(kv[0]))) +
             " (agree = both Haiku passes identical; referee = Kimi K3 decided).")
    refs = [(r["family"], r["arm"], r["scenario"], r["refusal_lanes"]) for r in rows if r["refusal_lanes"]]
    L.append(f"- Subject refusals: {len(refs)}" + (f" — {refs}" if refs else "") + ".")
    jref = sum(1 for f in fams for u in units[f] for a in ARMS for fld in ("judge", "substance", "obligation")
               for jj in ("j1", "j2") if isinstance((u["arms"][a].get(fld) or {}).get(jj), dict) and u["arms"][a][fld][jj].get("refused"))
    L.append(f"- Judge refusals (Haiku): {jref}.")
    pos = defaultdict(int)
    for s in scen.values():
        pos[s["truth"]["correct_options"][0]] += 1
    L.append(f"- Position of the correct option across the {n_s} scenarios: {dict(sorted(pos.items()))}; items per history: "
             f"{min(len(s['items']) for s in scen.values())}–{max(len(s['items']) for s in scen.values())}.")
    L += ["", examples(units, scen), "", "## Spend by door", "",
          f"**OpenRouter ${spent:.4f}** of the $120 ceiling (writer, raters, probes, dry run, subjects, Mem0's own calls, judges, referee). "
          "Anthropic key $0, OpenAI key $0, Bedrock $0.", ""]
    L += spend_table(ledger)
    L += ["", f"Spend checks ({len(checks)}; " + ("every one held" if all(c["holds"] for c in checks) else "NOT every one held") + "):", ""]
    L += [f"- {c['at']} before {c['before']}: credit ${c['credit_left']:.2f} less ${c['reserve_for_6']:.2f} for #6 → ${c['available']:.2f}; stage ${c['stage_spent']:.2f}; projected ${c['projected']:.2f} → {'holds' if c['holds'] else 'DOES NOT HOLD'}" for c in checks]
    if notes:
        L += ["", notes.strip()]
    path.write_text("\n".join(L) + "\n")
    return v
