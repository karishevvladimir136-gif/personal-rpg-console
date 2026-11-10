"""docs/runs/authority-1-report.md and the closing tables."""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

from . import report as R
from .specs import FAMILIES, SPECS

ARMS = ("A", "B", "C")
CLS = {1: "stale fact", 2: "changed rule", 3: "chain", 4: "control"}


def p(x, dec=1):
    return "–" if x is None else f"{x:.{dec}f}"


def held(v):
    return "**null**" if v is None else ("**held**" if v else "**lost**")


def arm_table(rows, title_rows):
    hdr = ("| | stale action ↓ (cl. 1–3) | propagation ↑ (cl. 1–3) | listed (any direction) | asked instead | untouched changed ↓ (frozen) | "
           "untouched changed ↓ (substance, post hoc) | class 4: changed anything ↓ (frozen) | class 4 (substance, post hoc) | right action | obligations (diag.) | $/run | s/run | calls/run | form kept | refusals |")
    lines = [hdr, "|" + "---|" * 16]
    for label, rs in title_rows:
        m = R.metrics(rs)
        lines.append(f"| {label} | {R.fmt(m['stale'])} | {R.fmt(m['propagation'])} | {R.fmt(m['listed'])} | {R.fmt(m['asked'])} | "
                     f"{R.fmt(m['unnec_decisions'])} | {R.fmt(m['unnec_decisions_subst'])} | {R.fmt(m['class4_changed'])} | {R.fmt(m['class4_changed_subst'])} | {R.fmt(m['correct'])} | {R.fmt(m['obligations'])} | "
                     f"{p(m['cost_per_run'], 4)} | {p((m['wall_ms_per_run'] or 0) / 1000, 1)} | {p(m['calls_per_run'], 2)} | {m['n_kept']}/{m['n_runs']} | {m['refused']} |")
    return lines


def write(path: Path, rows, units_by_family, scen, ledger_rows, spend_checks, families_run, opus_classes, examples_md, notes_md, summary_md=""):
    by_arm, v = R.verdicts(rows, families_run, opus_classes)
    L = ["# AUTHORITY_1 — report", "",
         "Does a structured correction layer over an existing memory backend (Mem0 OSS, local) reduce stale actions, and is "
         "it the structure or the extra pass? **Forty authored scenarios are an engineering pilot: every rate below is a "
         "pilot rate, not a basis for statistical claims.** Design and hashes: `docs/runs/authority-1-freeze.md` / `.json`; "
         "dry run: `docs/runs/authority-1-dry-run.md`; raw units: `docs/runs/authority-1-units-<family>.jsonl.gz`.", ""]
    n_units = sum(len(u) for u in units_by_family.values())
    L += [f"Families run: {', '.join(SPECS[f]['label'] for f in families_run)}" +
          (f" (Opus on classes {opus_classes} only — the projection passed the ceiling)" if opus_classes != [1, 2, 3, 4] else "") +
          f". {n_units} units × 3 arms = {len(rows)} arm-runs.", ""]
    if summary_md:
        L += [summary_md.strip(), ""]
    L += ["## Bets", "", "| bet | numbers | verdict |", "|---|---|---|"]
    L.append(f"| AU0 | {notes_md['au0']} | {held(notes_md['au0_held'])} |")
    a1 = v["AU1"]; L.append(f"| AU1 stale action: C < A by ≥ 15, B < A by ≥ 10, \\|C − B\\| ≤ 5 | A {p(a1['A'])} %, B {p(a1['B'])} %, C {p(a1['C'])} % · {a1['parts']} | {held(a1['held'])} |")
    a2 = v["AU2"]; L.append(f"| AU2 propagation: C > B by ≥ 15, C > A by ≥ 25 | A {p(a2['A'])} %, B {p(a2['B'])} %, C {p(a2['C'])} % · {a2['parts']} | {held(a2['held'])} |")
    a3 = v["AU3"]; L.append(f"| AU3 unnecessary: B > A; C ≤ A on class 4 | untouched changed A {p(a3['A'])} %, B {p(a3['B'])} %, C {p(a3['C'])} %; class 4 changed A {p(a3['class4_A'])} %, B {p(a3['class4_B'])} %, C {p(a3['class4_C'])} % · {a3['parts']} | {held(a3['held'])} |")
    a3s = v["AU3s"]; L.append(f"| AU3, same bet on the post-hoc substance measure (see notes) | untouched changed A {p(a3s['A'])} %, B {p(a3s['B'])} %, C {p(a3s['C'])} %; class 4 changed A {p(a3s['class4_A'])} %, B {p(a3s['class4_B'])} %, C {p(a3s['class4_C'])} % · {a3s['parts']} | {held(a3s['held'])} (post hoc) |")
    a4 = v["AU4"]; L.append(f"| AU4 cost C ≤ 1.5× B, latency ≤ 2× | $/run B {p(a4['cost_B'], 4)}, C {p(a4['cost_C'], 4)}; s/run B {p((a4['wall_B'] or 0)/1000)}, C {p((a4['wall_C'] or 0)/1000)} · {a4['parts']} | {held(a4['held'])} |")
    a5 = v["AU5"]; L.append(f"| AU5 C − B propagation gap shrinks DeepSeek > Sol > Opus, Opus ≥ 5 | " + ", ".join(f"{SPECS[f]['label']} {p(g)}" for f, g in a5["gaps"].items()) + f" points · {a5['parts']} | {held(a5['held'])} |")
    a6 = v["AU6"]; L.append(f"| AU6 (exploratory) C − B largest on class 3, smallest on class 1 | " + ", ".join(f"class {c} {p(g)}" for c, g in a6["gaps_by_class"].items()) + f" points · {a6['parts']} | {held(a6['held'])} |")
    L += ["", "## By arm (all families pooled)", ""]
    L += arm_table(rows, [(f"**{a}**", [r for r in rows if r["arm"] == a]) for a in ARMS])
    L += ["", "## By family and arm", ""]
    L += arm_table(rows, [(f"{SPECS[f]['label']} {a}", [r for r in rows if r["family"] == f and r["arm"] == a]) for f in families_run for a in ARMS])
    L += ["", "## By class and arm (all families pooled)", ""]
    L += arm_table(rows, [(f"class {c} ({CLS[c]}) {a}", [r for r in rows if r["class"] == c and r["arm"] == a]) for c in (1, 2, 3, 4) for a in ARMS])
    L += ["", "## Family × class (stale action / propagation; class 4: changed anything, frozen and substance)", "",
          "| family | class | A | B | C |", "|---|---|---|---|---|"]
    for f in families_run:
        for c in (1, 2, 3, 4):
            cells = []
            for a in ARMS:
                m = R.metrics([r for r in rows if r["family"] == f and r["class"] == c and r["arm"] == a])
                cells.append(f"{R.fmt(m['class4_changed'], 0)} (substance {R.fmt(m['class4_changed_subst'], 0)})" if c == 4 else f"{R.fmt(m['stale'], 0)} / {R.fmt(m['propagation'], 0)}")
            if any(x != "–" and x != "– / –" for x in cells):
                L.append(f"| {SPECS[f]['label']} | {c} | " + " | ".join(cells) + " |")
    # diagnostics
    L += ["", "## Diagnostics", ""]
    for f in families_run:
        us = units_by_family[f]
        kept = sum(1 for u in us if u.get("change_in_store"))
        retr = sum(1 for u in us if u.get("change_retrieved"))
        cov_n = cov_k = 0
        for u in us:
            s = scen[u["scenario"]]
            ids = {x.get("item_id") for x in u.get("retrieval", [])}
            for t in s["truth"]["touched"]:
                cov_n += 1
                cov_k += t["id"] in ids
        lost = defaultdict(int)
        for u in us:
            if not u.get("change_in_store"):
                lost[u["class"]] += 1
        L.append(f"- {SPECS[f]['label']}: Mem0 kept the change in {kept}/{len(us)} units (lost by class: {dict(sorted(lost.items())) or 'none'}); the search returned it in {retr}/{len(us)}; "
                 f"the search returned {cov_k}/{cov_n} touched decisions ({p(100 * cov_k / cov_n if cov_n else None)} %) — the rest only C's walk could reach.")
    # propagation split by whether the search returned the touched decision (A and B could only see those)
    L += ["", "Propagation on touched decisions the search **returned** vs **did not return** (A and B saw only the first kind; "
          "C's walk reaches both):", "", "| family | arm | returned by search | not returned |", "|---|---|---|---|"]
    for f in families_run:
        for a in ARMS:
            k1 = n1 = k2 = n2 = 0
            for u in units_by_family[f]:
                s = scen[u["scenario"]]
                r = u["arms"][a]
                m = r.get("mech") or {}
                if not m.get("form_kept") or s["class"] == 4:
                    continue
                d = ((r.get("judge") or {}).get("final") or {}).get("direction") or {}
                got = {t for t in m.get("touched_listed", []) if d.get(t) is True}
                ids = {x.get("item_id") for x in u.get("retrieval", [])}
                for t in s["truth"]["touched"]:
                    if t["id"] in ids:
                        n1 += 1; k1 += t["id"] in got
                    else:
                        n2 += 1; k2 += t["id"] in got
            L.append(f"| {SPECS[f]['label']} | {a} | {R.fmt((k1, n1))} | {R.fmt((k2, n2))} |")
    jb = defaultdict(int)
    for r in rows:
        if r.get("judge_by"):
            jb[r["judge_by"]] += 1
    L.append(f"- Judges: {dict(jb)} (agree = both Haiku passes identical; referee = Sol decided the disagreeing fields).")
    L += ["", examples_md, "", "## Spend by door", ""]
    door = defaultdict(float)
    for lr in ledger_rows:
        door[(lr["family"], lr["arm"] if lr["family"] != "judge" else lr["lane"])] += lr["cost"]
    tot = sum(door.values())
    L += [f"**OpenRouter ${tot:.4f}** of the $130 ceiling (subjects, Mem0's own calls, judges, referee, smoke and dry run). "
          "Anthropic key $0, OpenAI key $0, Bedrock $0.", "", "| who | part | $ |", "|---|---|---|"]
    for (fam, part), c in sorted(door.items()):
        L.append(f"| {fam} | {part} | {c:.4f} |")
    L += ["", f"Spend checks ({len(spend_checks)}; every one held):" if all(c["holds"] for c in spend_checks) else f"Spend checks ({len(spend_checks)}):", ""] + [
        f"- {c['at']} before {c['before']}: credit left ${c['credit_left']:.2f}"
        + (f", less the ${c['reserve_for_4']:.0f} reserve for #4 → ${c['available']:.2f}" if c.get("reserve_for_4") else " (before the shared-budget rule)")
        + f"; stage spent ${c['stage_spent']:.2f}; projected ${c['projected']:.2f} → {'holds' if c['holds'] else 'does not hold'}" for c in spend_checks]
    L += ["", notes_md["notes"], ""]
    path.write_text("\n".join(L) + "\n")
    return v
