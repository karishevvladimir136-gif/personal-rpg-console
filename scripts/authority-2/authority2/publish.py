"""Published files: the pool (every candidate, every rating, κ) and the dry-run trace."""
from __future__ import annotations

import json
from pathlib import Path

from authority1 import trace
from authority1.specs import SPECS

from . import pool as P


def _k(t):
    k, n = t
    return "–" if k is None else f"{k:.2f} (n = {n})"


def pool_md(path: Path, recs, rows, kap, chosen):
    by = {r["id"]: r for r in recs}
    L = ["# AUTHORITY_2 — the candidate pool", "",
         "Written by **GLM 5.3** (`z-ai/glm-5.3`) from the frozen spec `scripts/authority-2/WRITER_SPEC.md`, one call a "
         "candidate (setting from GLM's own list of 50, class fixed by slot; class-4 slots cycle the three control kinds), "
         "with at most two repair rounds that return only the validator's messages. GLM never saw an AUTHORITY_1 scenario. "
         "Rated independently by **GPT-6 Astra** and **Kimi K3** on the frozen instrument "
         "`scripts/authority-2/RATER_INSTRUMENT.md` before any subject call; neither rater saw the other's rating or any "
         "subject's run. Kimi is also the referee of the subject runs' disputed judgments (the amendment); both roles are "
         "disclosed here.", "",
         "**Admission rule (frozen):** structurally valid, and both raters say *yes* to «truth table follows» and «task "
         "forces an act», and both give the class the writer was asked for; then 10 a class by sha256 order. A short class "
         "is reported short; the rule is not relaxed.", "",
         f"Admitted: **{len(chosen)}** — " + ", ".join(f"class {c}: {sum(1 for s in chosen if s['class'] == c)}" for c in (1, 2, 3, 4)) + ".", "",
         "## Rater agreement (Cohen's κ, Astra vs Kimi, over candidates both rated)", "",
         "| question | κ |", "|---|---|"]
    for q, lab in (("truth_follows", "truth table follows (yes/no)"), ("forces_act", "task forces an act (yes/no)"),
                   ("class", "class (1–4)"), ("distractor", "distractor exists (yes/no)"), ("admission_mark", "admission mark (all three conditions)")):
        L.append(f"| {lab} | {_k(kap[q])} |")
    L += ["", "## Every candidate", "",
          "| id | class | setting | valid (rounds) | Astra: truth / act / class / distractor | Kimi: truth / act / class / distractor | eligible | admitted | sha256 (first 12) |",
          "|---|---|---|---|---|---|---|---|---|"]
    for r in rows:
        cell = lambda x: "–" if not x else f"{x['truth_follows']} / {x['forces_act']} / {x['class']} / {x['distractor']}"
        L.append(f"| {r['id']} | {r['class']} | {r['setting'][:70]} | {'yes' if r['valid'] else 'no'} ({r['rounds']}) | "
                 f"{cell(r['ratings'].get('astra'))} | {cell(r['ratings'].get('kimi'))} | {'yes' if r['eligible'] else 'no'} | "
                 f"{'**yes**' if r.get('admitted') else 'no'} | {(r['hash'] or '')[:12]} |")
    L += ["", "## Raters' reasons and validator messages", ""]
    for r in rows:
        rec = by[r["id"]]
        L.append(f"### {r['id']} (class {r['class']}) — {'admitted' if r.get('admitted') else 'eligible, not drawn' if r['eligible'] else 'not admitted'}")
        if not r["valid"]:
            L.append(f"- validator (after {r['rounds']} round(s)): " + "; ".join((r["errors"] or [])[:8]))
        for x in ("astra", "kimi"):
            rt = (rec.get("ratings") or {}).get(x)
            if rt:
                L.append(f"- {x}: {json.dumps(rt['parsed'], ensure_ascii=False) if rt['parsed'] else 'unparsed'}"
                         + (f" (refused)" if rt.get("refused") else "") + (f" (error: {rt['error']})" if rt.get("error") else ""))
        if rec.get("scenario") and r["valid"]:
            s = rec["scenario"]
            L.append(f"- title «{s.get('title')}», owner {s.get('owner')}, now {s.get('now')}, {len(s.get('items', []))} items; change: {s['change'].get('text')}")
        L.append("")
    L += ["The full candidates (scenario, every writer round, every rating as returned) are in "
          "`scripts/authority-2/pool/candidates/`; the admitted forty in `scripts/authority-2/scenarios/admitted.json`."]
    path.write_text("\n".join(L) + "\n")


def dry_md(path: Path, units_dir: Path, scen, ids, ledger: Path):
    units = {}
    for p in sorted((units_dir / "haiku").glob("*.json")):
        u = json.loads(p.read_text())
        units[u["scenario"]] = u
    L = ["# AUTHORITY_2 — dry run (Claude Haiku 5.5, 4 scenarios × 3 arms, one repeat)", "",
         "Outside the 720. Haiku is the subject and Mem0's LLM; judges as the stage (two Haiku passes, Kimi K3 referee by the amendment).", "",
         "| scenario | class | items | change kept / retrieved | A action / stale / distractor / propagated / obligation | B | C | C walk |",
         "|---|---|---|---|---|---|---|---|"]
    for sid in ids:
        u = units.get(sid)
        s = scen[sid]
        if not u:
            L.append(f"| {sid} | {s['class']} | {len(s['items'])} | not run | | | | |")
            continue
        cells = []
        for arm in ("A", "B", "C"):
            r = u["arms"][arm]
            m = r.get("mech") or {}
            if not m.get("form_kept"):
                cells.append("form not kept")
                continue
            d = ((r.get("judge") or {}).get("final") or {}).get("direction") or {}
            prop = sum(1 for t in m.get("touched_listed", []) if d.get(t))
            dis = m.get("action") in s["truth"]["distractor_options"]
            ob = (r.get("obligation") or {}).get("final")
            cells.append(f"{m.get('action')} / {'stale' if m.get('stale_action') else 'ok'} / {'pulled' if dis else '–'} / {prop} of {m.get('n_touched')} / {ob}")
        w = u["arms"]["C"].get("walk") or {}
        L.append(f"| {sid} | {s['class']} | {len(s['items'])} | {'yes' if u.get('change_in_store') else 'no'} / {'yes' if u.get('change_retrieved') else 'no'} | "
                 + " | ".join(cells) + f" | {len(w.get('walked') or [])} reached |")
    rows = [json.loads(x) for x in ledger.read_text().splitlines() if x.strip()]
    L += ["", f"Dry-run spend: ${sum(r['cost'] for r in rows if r['family'] in ('haiku', 'judge.haiku')):.4f}; stage total so far ${sum(r['cost'] for r in rows):.4f}.", ""]
    for sid in ids:
        if sid in units:
            L += [f"## Full trace — {sid}", "", trace.unit_md(units[sid], scen[sid]), ""]
    path.write_text("\n".join(L) + "\n")
    return path


def arm_trace(u, s, arm, limit=60000):
    """One arm of one unit, every prompt and reply as sent and returned, for the mandate thread."""
    r = u["arms"][arm]
    L = [f"### Dry run — arm {arm}: {s['id']} «{s['title']}» (class {s['class']}), {SPECS[u['spec']]['label']}", "",
         f"**Change** ({s['change']['kind']}, {s['change']['date']}): {s['change']['text']} Revokes: {', '.join(s['change']['revokes']) or '—'}.", "",
         f"**Task:** {s['task']['text']} — " + "; ".join(f"{o['id']}) {o['text']}" for o in s["task"]["options"]), "",
         f"**Key:** correct {s['truth']['correct_options']}, stale {s['truth']['stale_options']}, distractor {s['truth']['distractor_options']}; touched "
         + (", ".join(f"{t['id']} → {t['direction']}" for t in s['truth']['touched']) or "none") + f"; untouched {s['truth']['untouched']}; due {s['truth']['obligation_due']['id']} → {s['truth']['obligation_due']['correct_value']}.", "",
         f"Mem0 kept the change: {'yes' if u.get('change_in_store') else 'no'}; search returned it: {'yes' if u.get('change_retrieved') else 'no'} (search {len(u['retrieval'])} of {len(u['store'])} memories).", ""]
    if arm == "C":
        w = r.get("walk") or {}
        L += [f"Layer walk: roots {w.get('roots')}, reached {w.get('walked')}; marks `{json.dumps(r.get('marks'), ensure_ascii=False)}`", ""]
    for c in r["calls"]:
        L.append(trace.call_md(c))
    L += [f"**Scored:** `{json.dumps(r.get('mech'))}`",
          f"**Judges:** `{json.dumps((r.get('judge') or {}).get('final'))}` by {(r.get('judge') or {}).get('by')}; "
          f"substance `{json.dumps((r.get('substance') or {}).get('final'))}`; obligation `{(r.get('obligation') or {}).get('final')}` by {(r.get('obligation') or {}).get('by')}", ""]
    body = "\n".join(L)
    if len(body) > limit:
        body = body[: limit - 300] + "\n\n…(trimmed to fit a GitHub comment; whole trace in `docs/runs/authority-2-dry-run.md`)\n"
    return body
