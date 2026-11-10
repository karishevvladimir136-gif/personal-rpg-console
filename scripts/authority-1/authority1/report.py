"""Aggregation, AU0–AU6, tables. Every rate is over arm-runs whose reply kept the form; counts beside every rate."""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

from .specs import SPECS

ARMS = ("A", "B", "C")


def load_units(units_dir: Path, family: str):
    d = units_dir / family
    return [json.loads(p.read_text()) for p in sorted(d.glob("*.json"))] if d.exists() else []


def run_rows(units, scen):
    rows = []
    for u in units:
        s = scen[u["scenario"]]
        for arm in ARMS:
            r = u["arms"].get(arm) or {}
            m = r.get("mech") or {}
            j = (r.get("judge") or {}).get("final") or {}
            row = {"family": u["family"], "scenario": u["scenario"], "class": u["class"], "repeat": u["repeat"], "arm": arm,
                   "form_kept": bool(m.get("form_kept")), "refused": bool(r.get("refused")), "error": r.get("error"),
                   "cost": r.get("cost") or 0.0, "latency_ms": r.get("latency_ms") or 0, "wall_ms": r.get("wall_ms") or 0,
                   "n_calls": len(r.get("calls") or []), "change_retrieved": u.get("change_retrieved"),
                   "change_in_store": u.get("change_in_store"), "judged": bool(j), "judge_by": (r.get("judge") or {}).get("by")}
            if m.get("form_kept"):
                touched = [t["id"] for t in s["truth"]["touched"]]
                d = j.get("direction") or {}
                right = [t for t in m["touched_listed"] if d.get(t) is True]
                untouched_changed = sorted(set(m["untouched_revised"]) | set(j.get("changes_untouched_in_text") or []) & set(s["truth"]["untouched"]))
                rep = r.get("reply") or {}
                row.update({
                    "action": m["action"], "correct_action": m["correct_action"], "stale_action": m["stale_action"],
                    "unnecessary_action": m["unnecessary_action"], "n_touched": len(touched), "propagated": len(right),
                    "listed_touched": len(m["touched_listed"]), "asked_touched": len(m["touched_asked"]),
                    "n_untouched": len(s["truth"]["untouched"]), "untouched_changed": untouched_changed,
                    "changed_anything": bool(rep.get("revise")) or m["unnecessary_action"] or bool(j.get("changes_untouched_in_text")),
                    "n_due": m["n_due"], "due_done": len(m["obligations_due_done"]),
                    "retrieved_touched": sum(1 for t in touched if t in {x.get("item_id") for x in u.get("retrieval", [])}),
                })
            rows.append(row)
    return rows


def pct(k, n):
    return None if not n else 100.0 * k / n


def metrics(rows):
    kept = [r for r in rows if r["form_kept"]]
    c13 = [r for r in kept if r["class"] in (1, 2, 3)]
    c4 = [r for r in kept if r["class"] == 4]
    allr = rows
    out = {
        "n_runs": len(allr), "n_kept": len(kept), "refused": sum(r["refused"] for r in allr),
        "errors": sum(1 for r in allr if r["error"]),
        "stale": (sum(r["stale_action"] for r in c13), len(c13)),
        "correct": (sum(r["correct_action"] for r in kept), len(kept)),
        "propagation": (sum(r["propagated"] for r in c13), sum(r["n_touched"] for r in c13)),
        "listed": (sum(r["listed_touched"] for r in c13), sum(r["n_touched"] for r in c13)),
        "asked": (sum(r["asked_touched"] for r in c13), sum(r["n_touched"] for r in c13)),
        "unnec_decisions": (sum(len(r["untouched_changed"]) for r in kept), sum(r["n_untouched"] for r in kept)),
        "unnec_runs": (sum(1 for r in kept if r["untouched_changed"]), len(kept)),
        "class4_changed": (sum(r["changed_anything"] for r in c4), len(c4)),
        "obligations": (sum(r["due_done"] for r in kept), sum(r["n_due"] for r in kept)),
        "cost_per_run": (sum(r["cost"] for r in allr) / len(allr)) if allr else None,
        "wall_ms_per_run": (sum(r["wall_ms"] for r in allr) / len(allr)) if allr else None,
        "calls_per_run": (sum(r["n_calls"] for r in allr) / len(allr)) if allr else None,
    }
    return out


def rate(t):
    k, n = t
    return None if not n else 100.0 * k / n


def fmt(t, dec=1):
    k, n = t
    return "–" if not n else f"{100.0 * k / n:.{dec}f} % ({k}/{n})"


def table(rows, group_keys, label_fn):
    groups = defaultdict(list)
    for r in rows:
        groups[tuple(r[k] for k in group_keys)].append(r)
    return {g: metrics(v) for g, v in sorted(groups.items(), key=lambda kv: tuple(str(x) for x in kv[0]))}


def verdicts(rows, families_run, opus_classes):
    by_arm = {a: metrics([r for r in rows if r["arm"] == a]) for a in ARMS}
    R = lambda a, k: rate(by_arm[a][k])
    v = {}
    sA, sB, sC = R("A", "stale"), R("B", "stale"), R("C", "stale")
    v["AU1"] = {"A": sA, "B": sB, "C": sC,
                "held": None if None in (sA, sB, sC) else (sA - sC >= 15 and sA - sB >= 10 and abs(sC - sB) <= 5),
                "parts": None if None in (sA, sB, sC) else {"C<A by ≥15": sA - sC >= 15, "B<A by ≥10": sA - sB >= 10, "|C−B| ≤ 5": abs(sC - sB) <= 5}}
    pA, pB, pC = R("A", "propagation"), R("B", "propagation"), R("C", "propagation")
    v["AU2"] = {"A": pA, "B": pB, "C": pC,
                "held": None if None in (pA, pB, pC) else (pC - pB >= 15 and pC - pA >= 25),
                "parts": None if None in (pA, pB, pC) else {"C>B by ≥15": pC - pB >= 15, "C>A by ≥25": pC - pA >= 25}}
    uA, uB, uC = R("A", "unnec_decisions"), R("B", "unnec_decisions"), R("C", "unnec_decisions")
    k4A, k4C = R("A", "class4_changed"), R("C", "class4_changed")
    v["AU3"] = {"A": uA, "B": uB, "C": uC, "class4_A": k4A, "class4_B": R("B", "class4_changed"), "class4_C": k4C,
                "held": None if None in (uA, uB, k4A, k4C) else (uB > uA and k4C <= k4A),
                "parts": None if None in (uA, uB, k4A, k4C) else {"B > A": uB > uA, "C ≤ A on class 4": k4C <= k4A}}
    cB, cC = by_arm["B"]["cost_per_run"], by_arm["C"]["cost_per_run"]
    wB, wC = by_arm["B"]["wall_ms_per_run"], by_arm["C"]["wall_ms_per_run"]
    v["AU4"] = {"cost_B": cB, "cost_C": cC, "wall_B": wB, "wall_C": wC,
                "held": None if not (cB and wB) else (cC <= 1.5 * cB and wC <= 2 * wB),
                "parts": None if not (cB and wB) else {"C ≤ 1.5× B cost": cC <= 1.5 * cB, "C ≤ 2× B latency": wC <= 2 * wB}}
    gaps = {}
    for f in families_run:
        fr = [r for r in rows if r["family"] == f]
        pb = rate(metrics([r for r in fr if r["arm"] == "B"])["propagation"])
        pc = rate(metrics([r for r in fr if r["arm"] == "C"])["propagation"])
        gaps[f] = None if None in (pb, pc) else pc - pb
    order_ok = None
    if all(gaps.get(f) is not None for f in ("deepseek", "sol", "opus")):
        order_ok = gaps["deepseek"] > gaps["sol"] > gaps["opus"]
    v["AU5"] = {"gaps": gaps, "opus_classes": opus_classes,
                "held": None if order_ok is None else (order_ok and gaps["opus"] >= 5),
                "parts": None if order_ok is None else {"shrinks DeepSeek > Sol > Opus": order_ok, "Opus gap ≥ 5": gaps["opus"] >= 5}}
    cg = {}
    for c in (1, 2, 3):
        cr = [r for r in rows if r["class"] == c]
        pb = rate(metrics([r for r in cr if r["arm"] == "B"])["propagation"])
        pc = rate(metrics([r for r in cr if r["arm"] == "C"])["propagation"])
        cg[c] = None if None in (pb, pc) else pc - pb
    v["AU6"] = {"gaps_by_class": cg,
                "held": None if None in cg.values() else (cg[3] >= max(cg[1], cg[2]) and cg[1] <= min(cg[2], cg[3])),
                "parts": None if None in cg.values() else {"class 3 largest": cg[3] >= max(cg[1], cg[2]), "class 1 smallest": cg[1] <= min(cg[2], cg[3])}}
    return by_arm, v
