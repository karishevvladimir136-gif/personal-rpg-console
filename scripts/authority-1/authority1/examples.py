"""The three worked examples the stage asks for, chosen by rule (first match in family order Opus, Sol, DeepSeek, then id)."""
from __future__ import annotations

import json

from .specs import SPECS


def _pick(units, scen, pred, order=("opus", "sol", "deepseek")):
    for f in order:
        for u in sorted(units.get(f, []), key=lambda u: (u["scenario"], u["repeat"])):
            if pred(u, scen[u["scenario"]]):
                return u
    return None


def _prop(r, s):
    m = r.get("mech") or {}
    d = ((r.get("judge") or {}).get("final") or {}).get("direction") or {}
    return sum(1 for t in m.get("touched_listed", []) if d.get(t))


def _changed(r, s):
    """A real change (post-hoc substance measure): an unnecessary option, or an untouched decision the substance judges
    found altered; without a substance judgment, the frozen flags."""
    m = r.get("mech") or {}
    if m.get("unnecessary_action"):
        return True
    sub = r.get("substance")
    if sub and sub.get("final") is not None:
        return any(v == "changed" for v in sub["final"].values())
    j = (r.get("judge") or {}).get("final") or {}
    return bool((r.get("reply") or {}).get("revise")) or bool(j.get("changes_untouched_in_text"))


def _c_wrong(r, s):
    m = r.get("mech") or {}
    if not m.get("form_kept"):
        return False
    j = (r.get("judge") or {}).get("final") or {}
    if s["class"] == 4:
        return _changed(r, s)
    return m.get("stale_action") or _prop(r, s) < m.get("n_touched", 0) or bool(m.get("untouched_revised")) or bool(j.get("changes_untouched_in_text"))


def compact(u, s, why):
    L = [f"### {why}", "", f"**{s['id']} — {s['title']}** (class {s['class']}), {SPECS[u['spec']]['label']}, repeat {u['repeat']}.", "",
         f"- Change ({s['change']['date']}): {s['change']['text']} Revokes: {', '.join(s['change']['revokes']) or '—'}.",
         f"- Mem0 kept: " + ("; ".join(f"«{r.get('memory')}»" for r in u['ingest'].get('results') or []) or "nothing") + f" (search {'returned' if u.get('change_retrieved') else 'did not return'} it).",
         f"- Task: {s['task']['text']} — " + "; ".join(f"{o['id']}) {o['text']}" for o in s["task"]["options"]),
         f"- Key: correct {s['truth']['correct_options']}, stale {s['truth']['stale_options']}; touched " + (", ".join(f"{t['id']} → {t['direction']}" for t in s['truth']['touched']) or "none") + f"; untouched {s['truth']['untouched']}.", ""]
    b = u["arms"]["B"]["calls"][0]
    L += ["B's check (call 1):", "", "```", (b.get("text") or "").strip()[:2500], "```", ""]
    c = u["arms"]["C"]
    L += [f"C's layer: reached {(c.get('walk') or {}).get('walked')}; marks `{json.dumps(c.get('marks'), ensure_ascii=False)}`", ""]
    for arm in ("A", "B", "C"):
        r = u["arms"][arm]
        rep = {k: (r.get("reply") or {}).get(k) for k in ("action", "what_i_do", "revise", "ask", "note")}
        m = r.get("mech") or {}
        j = (r.get("judge") or {}).get("final")
        sub = (r.get("substance") or {}).get("final")
        L += [f"**{arm}** — action {m.get('action')} ({'stale' if m.get('stale_action') else 'right' if m.get('correct_action') else 'other'}); substance (post hoc) `{json.dumps(sub)}`; "
              f"propagated {_prop(r, s)} of {m.get('n_touched')}; untouched changed {sorted(set(m.get('untouched_revised') or []) | set((j or {}).get('changes_untouched_in_text') or []))}; judges `{json.dumps(j)}`", "",
              "```json", json.dumps(rep, ensure_ascii=False, indent=1)[:3000], "```", ""]
    return "\n".join(L)


def worked_examples(units, scen):
    out = ["## Worked examples (chosen by rule, not by hand)", ""]
    u = _pick(units, scen, lambda u, s: s["class"] == 3 and all(u["arms"][a].get("mech", {}).get("form_kept") for a in "BC")
              and (_prop(u["arms"]["C"], s) != _prop(u["arms"]["B"], s) or u["arms"]["C"]["mech"]["stale_action"] != u["arms"]["B"]["mech"]["stale_action"]))
    out.append(compact(u, scen[u["scenario"]], "1. A chain where C and B differed") if u else "### 1. A chain where C and B differed\n\nNone: on every class-3 unit B and C propagated the same number and chose alike.\n")
    u = _pick(units, scen, lambda u, s: s["class"] == 4 and u["arms"]["B"].get("mech", {}).get("form_kept") and _changed(u["arms"]["B"], s))
    out.append(compact(u, scen[u["scenario"]], "2. A control where B changed something (a real change, by the post-hoc substance judges)") if u else "### 2. A control where B changed something\n\nNone: B changed nothing of substance on any class-4 unit.\n")
    u = _pick(units, scen, lambda u, s: _c_wrong(u["arms"]["C"], s))
    out.append(compact(u, scen[u["scenario"]], "3. One where C was wrong") if u else "### 3. One where C was wrong\n\nNone: C was right on every unit.\n")
    return "\n".join(out)
