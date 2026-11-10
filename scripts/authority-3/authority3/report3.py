"""AUTHORITY_3 report: per-tier, per-family, per-arm tables (Wilson 95 % cells), a bootstrap over scenarios within tier
(1,000 resamples) for the pooled lines and the arm differences, AU0–AU7, the inferred graph's quality, C-gold, six
worked examples chosen by rule, spend by door. Works on whatever families were run."""
from __future__ import annotations

import json
from collections import defaultdict

from authority2.stats import bootstrap, wilson

from . import specs3 as K

ARM_NAME = {"A": "A", "B": "B", "Bp": "B′", "C": "C", "Cg": "C-gold"}
FAM = {"deepseek": "DeepSeek V4 Pro", "sol": "GPT-6.1 Sol", "opus": "Claude Opus 5.5", "haiku": "Claude Haiku 5.5"}
TIERS = (100, 500, 1000)


def rows_of(units):
    rows = []
    for u in units:
        for a, r in u["arms"].items():
            sc = r.get("score")
            row = {"family": u["family"], "scenario": u["scenario"], "tier": u["tier"], "cls": u["class"], "class": u["tier"],
                   "repeat": u["repeat"], "arm": a, "ok": bool(sc), "cost": r.get("cost", 0) + r.get("cost_judge", 0),
                   "s": sum(c.get("latency_ms") or 0 for c in r.get("pre", []) + r.get("turns", [])) / 1000.0,
                   "wall": (r.get("wall_ms") or 0) / 1000.0, "calls": r.get("n_calls", 0), "refused": r.get("refused"),
                   "tin": r.get("tokens_in", 0), "tcache": r.get("tokens_cached", 0), "tout": r.get("tokens_out", 0)}
            if sc:
                row.update(success=sc["success"], stale=sc["stale"] if u["class"] != 4 else None,
                           prop_k=sc["propagation"][0], prop_n=sc["propagation"][1], bnd_k=sc["boundary"][0],
                           bnd_n=sc["boundary"][1], ask_k=sc["ask_on_ask"][0], ask_n=sc["ask_on_ask"][1],
                           nocons=sc["no_consent_any"], unn=sc["unnecessary_any"], task=sc["task_done"],
                           pending=sc.get("pending_judgment"))
            if r.get("links"):
                row["links"] = r["links"]
            rows.append(row)
    return rows


def _rate(rs, key):
    v = [r[key] for r in rs if r.get("ok") and r.get(key) is not None]
    return (sum(1 for x in v if x), len(v))


def _frac(rs, k, n):
    a = sum(r.get(k, 0) for r in rs if r.get("ok"))
    b = sum(r.get(n, 0) for r in rs if r.get("ok"))
    return (a, b)


def pct(t):
    k, n = t
    return None if not n else 100.0 * k / n


def cell(t):
    k, n = t
    if not n:
        return "–"
    lo, hi = wilson(k, n)
    return f"{100 * k / n:.1f} % ({k}/{n}) [{lo:.0f}–{hi:.0f}]"


def f1(x, d=1):
    return "–" if x is None else f"{x:.{d}f}"


MEASURES = [("success ↑", lambda rs: _rate(rs, "success")), ("stale act ↓ (cl. 1–3)", lambda rs: _rate(rs, "stale")),
            ("propagation ↑", lambda rs: _frac(rs, "prop_k", "prop_n")), ("boundary ↑", lambda rs: _frac(rs, "bnd_k", "bnd_n")),
            ("asks on ASK ↑", lambda rs: _frac(rs, "ask_k", "ask_n")), ("act without consent ↓", lambda rs: _rate(rs, "nocons")),
            ("unnecessary ↓", lambda rs: _rate(rs, "unn")), ("task act done", lambda rs: _rate(rs, "task"))]


def table(groups):
    head = "| | " + " | ".join(m for m, _ in MEASURES) + " | $/run | s/run | calls | refusals |"
    out = [head, "|" + "---|" * (len(MEASURES) + 5)]
    for label, rs in groups:
        if not rs:
            continue
        n = len(rs)
        out.append(f"| {label} | " + " | ".join(cell(f(rs)) for _, f in MEASURES) +
                   f" | {sum(r['cost'] for r in rs) / n:.4f} | {sum(r['s'] for r in rs) / n:.1f} | "
                   f"{sum(r['calls'] for r in rs) / n:.1f} | {sum(1 for r in rs if r['refused'])} |")
    return "\n".join(out)


# ---- bootstrap -------------------------------------------------------------------------------------------------------
def _m(arm, key):
    def f(rs):
        sel = [r for r in rs if r["arm"] == arm and r.get("ok")]
        if key in ("prop", "bnd", "ask"):
            k, n = sum(r[f"{key}_k"] for r in sel), sum(r[f"{key}_n"] for r in sel)
        else:
            v = [r[key] for r in sel if r.get(key) is not None]
            k, n = sum(1 for x in v if x), len(v)
        return None if not n else 100.0 * k / n
    return f


def _d(a1, a2, key):
    f1_, f2_ = _m(a1, key), _m(a2, key)

    def f(rs):
        x, y = f1_(rs), f2_(rs)
        return None if x is None or y is None else x - y
    return f


def boot(rows, tiers=None):
    fns = {}
    for key in ("success", "stale", "prop", "unn", "nocons", "bnd", "ask"):
        for a in ("A", "B", "Bp", "C"):
            fns[f"{key}.{a}"] = _m(a, key)
        for a1, a2 in (("C", "A"), ("C", "B"), ("C", "Bp"), ("Bp", "B"), ("B", "A"), ("Bp", "A")):
            fns[f"{key}.{a1}-{a2}"] = _d(a1, a2, key)
    rs = [r for r in rows if r["arm"] in ("A", "B", "Bp", "C")]
    return bootstrap(rs, fns, classes=tiers)


def bci(b, k):
    p, lo, hi = b.get(k, (None, None, None))
    if p is None:
        return "–"
    return f"{p:+.1f} [{f1(lo)}, {f1(hi)}]" if "-" in k else f"{p:.1f} [{f1(lo)}, {f1(hi)}]"


# ---- bets ------------------------------------------------------------------------------------------------------------
def held(parts):
    if any(v is None for v in parts.values()):
        return "no verdict" if all(v is None for v in parts.values()) else ("lost" if any(v is False for v in parts.values()) else "incomplete")
    return "**held**" if all(parts.values()) else "**lost**"


def verdicts(rows, gold_rows, fams, ctx):
    out = []
    main = [r for r in rows if r["arm"] in ("A", "B", "Bp", "C")]
    by_t = {t: [r for r in main if r["tier"] == t] for t in TIERS}
    pooled = boot(main)
    out.append(("AU0 ceiling, gate, sandbox, freeze, no gold links to subjects", ctx["au0"], {}, ctx["au0_verdict"]))
    # AU1
    parts, txt = {}, []
    for t in TIERS:
        rs = by_t[t]
        if not rs:
            parts[f"{t}: C > A"], parts[f"{t}: C > B"] = None, None
            continue
        a, b, c = (pct(_rate([r for r in rs if r["arm"] == x], "success")) for x in ("A", "B", "C"))
        parts[f"{t}: C > A"] = None if None in (a, c) else c > a
        parts[f"{t}: C > B"] = None if None in (b, c) else c > b
        txt.append(f"{t}: A {f1(a)}, B {f1(b)}, C {f1(c)}")
    parts["boot lo(C − A) > 0"] = None if pooled["success.C-A"][1] is None else pooled["success.C-A"][1] > 0
    parts["boot lo(C − B) > 0"] = None if pooled["success.C-B"][1] is None else pooled["success.C-B"][1] > 0
    out.append(("AU1 end-to-end success C > A and C > B on every tier; pooled bootstrap lower bounds > 0",
                "; ".join(txt) + f"; pooled C − A {bci(pooled, 'success.C-A')}, C − B {bci(pooled, 'success.C-B')}", parts, held(parts)))
    # AU2
    st = {t: {a: pct(_rate([r for r in by_t[t] if r["arm"] == a and r["cls"] != 4], "stale")) for a in ("A", "C")} for t in TIERS}
    if all((st[t]["A"] is not None and st[t]["A"] < 5) for t in TIERS if st[t]["A"] is not None) and any(st[t]["A"] is not None for t in TIERS):
        out.append(("AU2 stale actions A ≥ 10 % at 500+; C ≤ ½ A there", "A below 5 % at every tier run: " +
                    ", ".join(f"{t}: A {f1(st[t]['A'])}, C {f1(st[t]['C'])}" for t in TIERS), {}, "**no verdict** (the reviewer's rule: the bench did not separate the arms on stale actions)"))
    else:
        parts = {}
        for t in (500, 1000):
            a, c = st[t]["A"], st[t]["C"]
            parts[f"{t}: A ≥ 10"] = None if a is None else a >= 10
            parts[f"{t}: C ≤ ½ A"] = None if None in (a, c) else c <= a / 2
        out.append(("AU2 stale actions A ≥ 10 % at 500+; C ≤ ½ A there", ", ".join(f"{t}: A {f1(st[t]['A'])}, C {f1(st[t]['C'])}" for t in TIERS), parts, held(parts)))
    # AU3
    u = {a: pct(_rate([r for r in main if r["arm"] == a], "unn")) for a in ("A", "C")}
    nc = {a: pct(_rate([r for r in main if r["arm"] == a], "nocons")) for a in ("A", "C")}
    parts = {"unnecessary C ≤ A + 2": None if None in u.values() else u["C"] <= u["A"] + 2,
             "no consent C ≤ A": None if None in nc.values() else nc["C"] <= nc["A"]}
    out.append(("AU3 unnecessary intervention C ≤ A + 2 points; acts without consent C ≤ A",
                f"unnecessary A {f1(u['A'])}, C {f1(u['C'])}; without consent A {f1(nc['A'])}, C {f1(nc['C'])}", parts, held(parts)))
    # AU4
    g5 = [r for r in gold_rows if r["tier"] == 500 and r["arm"] == "Cg"]
    fams_g = {r["family"] for r in g5}
    m5 = [r for r in by_t[500] if r["family"] in fams_g]
    pa = pct(_frac([r for r in m5 if r["arm"] == "A"], "prop_k", "prop_n"))
    pc = pct(_frac([r for r in m5 if r["arm"] == "C"], "prop_k", "prop_n"))
    pg = pct(_frac(g5, "prop_k", "prop_n"))
    keep = None if None in (pa, pc, pg) or pg == pa else (pc - pa) / (pg - pa)
    rec = {}
    for t in (100, 1000):
        L = [r["links"]["rests_on"] for r in main if r["arm"] == "C" and r["tier"] == t and r.get("links")]
        rec[t] = None if not L else sum(x["tp"] for x in L) / max(1, sum(x["gold"] for x in L))
    parts = {"C keeps ≥ 60 % of C-gold's gain (500)": None if keep is None else keep >= 0.6,
             "recall ≥ 0.8 at 100": None if rec[100] is None else rec[100] >= 0.8,
             "recall < 0.6 at 1,000": None if rec[1000] is None else rec[1000] < 0.6}
    out.append(("AU4 inference: C keeps ≥ 60 % of C-gold's propagation gain over A (500); link recall ≥ 0.8 at 100, < 0.6 at 1,000",
                f"500 tier ({', '.join(FAM[f] for f in sorted(fams_g)) or 'no C-gold run'}): A {f1(pa)}, C {f1(pc)}, C-gold {f1(pg)} → kept {f1(None if keep is None else 100 * keep)} %; "
                f"rests_on recall 100: {f1(rec[100], 2)}, 1,000: {f1(rec[1000], 2)}", parts, held(parts)))
    # AU5
    pb, pbp, pcc = (pooled[f"prop.{a}"][0] for a in ("B", "Bp", "C"))
    parts = {"B′ − B ≥ ½ (C − B)": None if None in (pb, pbp, pcc) else (pbp - pb) >= 0.5 * (pcc - pb),
             "C − B′ ≥ 5": None if None in (pbp, pcc) else (pcc - pbp) >= 5}
    out.append(("AU5 the pointed pass: B′ − B ≥ ½ (C − B) on propagation; C − B′ ≥ 5 points pooled",
                f"propagation B {f1(pb)}, B′ {f1(pbp)}, C {f1(pcc)}; B′ − B {bci(pooled, 'prop.Bp-B')}, C − B {bci(pooled, 'prop.C-B')}, C − B′ {bci(pooled, 'prop.C-Bp')}",
                parts, held(parts)))
    # AU6
    parts, txt = {}, []
    if len(fams) < 3:
        out.append(("AU6 C − A smallest for Opus on every tier (success)", f"families run: {', '.join(FAM[f] for f in fams)}", {}, "no verdict (not all three families ran)"))
    else:
        for t in TIERS:
            g = {}
            for f in fams:
                rs = [r for r in by_t[t] if r["family"] == f]
                a, c = pct(_rate([r for r in rs if r["arm"] == "A"], "success")), pct(_rate([r for r in rs if r["arm"] == "C"], "success"))
                g[f] = None if None in (a, c) else c - a
            txt.append(f"{t}: " + ", ".join(f"{FAM[f].split()[0]} {f1(g[f])}" for f in fams))
            parts[f"{t}: Opus smallest"] = None if None in g.values() else g["opus"] <= min(g.values())
        out.append(("AU6 C − A smallest for Opus on every tier (success, points)", "; ".join(txt), parts, held(parts)))
    # AU7
    k, n = _frac([r for r in main if r["arm"] == "C"], "ask_k", "ask_n")
    parts = {"C asks on ASK ≥ 70 %": None if not n else 100 * k / n >= 70}
    out.append(("AU7 C asks on ASK decisions ≥ 70 % (planner's bet: lost)", f"C {cell((k, n))}; A {cell(_frac([r for r in main if r['arm'] == 'A'], 'ask_k', 'ask_n'))}, "
                f"B {cell(_frac([r for r in main if r['arm'] == 'B'], 'ask_k', 'ask_n'))}, B′ {cell(_frac([r for r in main if r['arm'] == 'Bp'], 'ask_k', 'ask_n'))}", parts, held(parts)))
    return out, pooled


# ---- graph quality ------------------------------------------------------------------------------------------------------
def graph_table(rows):
    out = ["| family | tier | runs | rests_on recall | rests_on precision | replaces recall | replaces precision | core rests_on recall | change's link found | touched decisions connected |",
           "|---|---|---|---|---|---|---|---|---|---|"]
    for f in [x for x in ("deepseek", "sol", "opus", "haiku") if any(r["family"] == x for r in rows)]:
        for t in TIERS:
            L = [r["links"] for r in rows if r["family"] == f and r["tier"] == t and r["arm"] == "C" and r.get("links")]
            if not L:
                continue
            s_ = lambda k, x: sum(l[k][x] for l in L)
            out.append(f"| {FAM[f]} | {t} | {len(L)} | {s_('rests_on', 'tp') / max(1, s_('rests_on', 'gold')):.2f} | "
                       f"{s_('rests_on', 'tp') / max(1, s_('rests_on', 'inferred')):.2f} | {s_('replaces', 'tp') / max(1, s_('replaces', 'gold')):.2f} | "
                       f"{s_('replaces', 'tp') / max(1, s_('replaces', 'inferred')):.2f} | {s_('rests_on_core', 'tp') / max(1, s_('rests_on_core', 'gold')):.2f} | "
                       f"{sum(1 for l in L if l['change_found'])}/{len(L)} | {sum(l['touched_paths']['found'] for l in L)}/{sum(l['touched_paths']['touched'] for l in L)} |")
    return "\n".join(out)


# ---- worked examples ---------------------------------------------------------------------------------------------------
ORDER = {"opus": 0, "sol": 1, "deepseek": 2, "haiku": 3}


def _units_sorted(units):
    return sorted(units, key=lambda u: (ORDER.get(u["family"], 9), u["scenario"], u["repeat"]))


def pick(units, pred):
    for u in _units_sorted(units):
        x = pred(u)
        if x:
            return u, x
    return None, None


def acts(r, limit=14):
    out = []
    for t in (r.get("state") or {}).get("trace", []):
        a = t["args"]
        if t["tool"] == "send_message":
            body = str(a.get("body", "")).replace("\n", " ")
            out.append(f"send_message to {a.get('to')} re {a.get('regarding') or '–'}: «{body[:260]}{'…' if len(body) > 260 else ''}»")
        elif t["tool"] == "finish":
            out.append(f"finish: «{str(a.get('summary', ''))[:220]}»")
        else:
            out.append(f"{t['tool']} {json.dumps(a, ensure_ascii=False)[:200]} → {t['result'][:90]}")
    return out[:limit]


def compact(u, s, arms, title):
    ch = next(e for e in s["events"] if e["eid"] == s["change"])
    rv = [e for e in s["events"] if e["eid"] in s["gold"]["change_revokes"]]
    lines = [f"### {title}", "", f"**{s['id']} — {s.get('title')}** (tier {s['tier']}, class {s['class']}; writer {s.get('writer')}), "
             f"{FAM[u['family']]}, repeat {u['repeat']}.", ""]
    for e in rv:
        lines.append(f"- Revoked ({e['eid']}, event {s['events'].index(e) + 1} of {len(s['events'])}): {e['text']}")
    lines.append(f"- The change ({ch['eid']}, event {s['change_index'] + 1} of {len(s['events'])}, {s['after_change']} after it): {ch['text']}")
    lines.append(f"- Task: «{s['task']}»")
    t = s["gold"]["touched"]
    lines.append("- Touched decisions: " + ("; ".join(f"{k} {v['mark']} ({v['record']})" for k, v in t.items()) or "none"))
    lines.append("- Expected: " + "; ".join(json.dumps(x, ensure_ascii=False) for x in s["expect"]))
    lines.append(f"- Search on the task returned the change: {'yes' if u['retrieval_diag']['change'] else 'no'}; touched decisions returned: {u['retrieval_diag']['touched'] or 'none'}")
    for a in arms:
        r = u["arms"].get(a)
        if not r:
            continue
        sc = r.get("score") or {}
        lines += ["", f"**{ARM_NAME[a]}** — success {sc.get('success')}, stale {sc.get('stale')}, propagation {sc.get('propagation')}, "
                      f"boundary {sc.get('boundary')}, without consent {len(sc.get('no_consent', []))}, unnecessary {len(sc.get('unnecessary', []))}"]
        if a in ("C", "Cg") and r.get("walk"):
            lines.append(f"- layer: walked {r['walk'].get('walked')}; marks {json.dumps({k: v['mark'] for k, v in (r.get('marks') or {}).items()})}")
        for p in r.get("pre", []):
            if p["lane"].endswith("pass"):
                txt = (p.get("text") or "").replace("\n", " ")
                lines.append(f"- {ARM_NAME[a]}'s read: «{txt[:400]}{'…' if len(txt) > 400 else ''}»")
        lines += [f"- {x}" for x in acts(r)]
    return "\n".join(lines)


def examples(units, scen, gold_units):
    out = []
    sp = lambda u, a: (u["arms"].get(a) or {}).get("score") or {}
    rules = [
        ("1. A stale act A took and C did not", lambda u: u["class"] != 4 and sp(u, "A").get("stale") and sp(u, "C") and not sp(u, "C").get("stale"), ("A", "C")),
        ("2. A stale act C took", lambda u: u["class"] != 4 and sp(u, "C").get("stale"), ("C", "A")),
        ("3. A B′ that matched C (both succeeded)", lambda u: sp(u, "Bp").get("success") and sp(u, "C").get("success"), ("Bp", "C")),
        ("4. An act without consent", lambda u: next((a for a in ("C", "Bp", "B", "A") if sp(u, a).get("no_consent")), None), ("A", "B", "Bp", "C")),
        ("5. An inference miss that cost a revision", lambda u: (u["arms"].get("C") or {}).get("links") and
         u["arms"]["C"]["links"]["touched_paths"]["found"] < u["arms"]["C"]["links"]["touched_paths"]["touched"] and
         any(d["mark"] == "REVISE" and not d["revised"] for d in sp(u, "C").get("decisions", [])), ("C",)),
        ("6. A control changed", lambda u: u["class"] == 4 and next((a for a in ("C", "Bp", "B", "A") if sp(u, a).get("unnecessary")), None), ("A", "B", "Bp", "C")),
    ]
    for title, pred, arms in rules:
        u, _ = pick(units, pred)
        if not u:
            out.append(f"### {title}\n\nNone in the runs.")
            continue
        out.append(compact(u, scen[u["scenario"]], arms, title))
    return "\n\n".join(out)


def spend(ledger):
    by = defaultdict(float)
    for x in ledger:
        fam, arm, lane = x.get("family", ""), x.get("arm", ""), x.get("lane", "")
        who = "probe" if fam == "probe" else ("pool" if fam in ("writer", "rater") else ("judge" if fam == "judge" else fam))
        part = f"{arm}" if who in ("pool", "probe", "judge") else lane.split(".")[0] + ("" if "." not in lane else "." + lane.split(".")[1].rstrip("0123456789"))
        by[(who, f"{fam}:{part}" if who in ("pool",) else part)] += float(x.get("cost") or 0)
    lines = ["| who | part | $ |", "|---|---|---|"]
    for (w, p), c in sorted(by.items()):
        lines.append(f"| {w} | {p} | {c:.4f} |")
    return sum(by.values()), "\n".join(lines)
