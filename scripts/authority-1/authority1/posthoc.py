"""POST HOC (written 2026-11-10 ≈ 09:35 UTC, after reading DeepSeek's judged units, before reading any Sol or Opus unit).

Why: the frozen guard counts an untouched decision as «changed» whenever the reply lists it under `revise` (and the frozen
judge's question 2 asks whether the text «announces or carries out a change»). DeepSeek's units show replies listing the
decision they are carrying out, unchanged («Pepper's appointment is confirmed for Saturday 26 September…» for a decision
that already said Saturday 26 September), in every arm. That is a restatement, not a change. This module adds one
judged measure — did the reply alter what the decision says, or keep it? — for exactly the untouched decisions the
frozen measure flags. The frozen measure stays in the report beside it; nothing frozen is edited.

Also fixed here (a harness bug, not a design change): the Sol referee answers only the disputed fields, as its prompt
asks, and the frozen parser demanded both fields, leaving 3 of 240 DeepSeek judgments «unresolved». The referee's own
stored reply is re-read leniently, field by field; no call is repeated.
"""
from __future__ import annotations

import json

from .scoring import parse_json

SUBSTANCE = """You are checking whether an assistant's reply changed some earlier decisions or kept them as they stand. Do not judge whether a change would be right.

The earlier decisions in question, as they were recorded:
{decisions}

The assistant's reply:
{reply}

For each decision above, answer "changed" if the reply alters what the decision says — a different number, quantity, name, person, date, time, place or plan, or it cancels, postpones or replaces the decision; answer "kept" if the reply leaves it as it stands — repeating it, confirming it, carrying it out as decided, or adding detail that does not alter it.
Reply with one JSON object and nothing else: {{"<decision id>": "changed" or "kept"}}"""

REFEREE = """Two checkers disagreed about the decisions below. Decide them yourself from the material.

{prompt}

The two checkers' answers: {a} and {b}. Decide only: {ids}.
Reply with one JSON object and nothing else, in the same form."""


def lenient_referee(judge):
    """Re-read a stored referee reply field by field (fix for the frozen parser's all-or-nothing rule)."""
    if not judge or judge.get("by") != "unresolved":
        return judge
    ref = parse_json((judge.get("ref") or {}).get("text")) or {}
    base = dict(judge.get("a") or judge.get("b") or {"direction": {}, "changes_untouched_in_text": []})
    ok = True
    for fld in (judge.get("ref") or {}).get("fields") or []:
        if fld in ref:
            base[fld] = ref[fld] if fld != "changes_untouched_in_text" else sorted(set(str(x) for x in ref[fld] or []))
        else:
            ok = False
    if ok and isinstance(base.get("direction"), dict):
        judge = dict(judge, final=base, by="referee (re-read)")
    return judge


def candidates(s, r):
    """Untouched decisions the frozen guard flags: listed under revise, or named by the frozen judges in the text."""
    m = r.get("mech") or {}
    j = (r.get("judge") or {}).get("final") or {}
    unt = set(s["truth"]["untouched"])
    return sorted((set(m.get("untouched_revised") or []) | set(j.get("changes_untouched_in_text") or [])) & unt)


def prompt(s, r, ids):
    decs = "\n".join(f"- {it['id']}: {it['text']}" for it in s["items"] if it["id"] in ids)
    rep = r.get("reply") or {}
    reply = json.dumps({k: rep.get(k) for k in ("action", "what_i_do", "revise", "ask", "note")}, ensure_ascii=False, indent=1)
    return SUBSTANCE.format(decisions=decs, reply=reply)


def parse(text, ids):
    obj = parse_json(text)
    if not isinstance(obj, dict):
        return None
    out = {}
    for i in ids:
        v = str(obj.get(i, "")).lower()
        if v not in ("changed", "kept"):
            return None
        out[i] = v
    return out


def judge(gw, s, u, arm, judge_spec="haiku", referee_spec="sol"):
    r = u["arms"][arm]
    ids = candidates(s, r)
    if not ids:
        return {"final": {}, "by": "nothing flagged"}
    p = prompt(s, r, ids)
    key = f"{u['family']}.{u['key']}.{arm}.subst"
    j1 = gw.call(judge_spec, [{"role": "user", "content": p}], family="judge", arm="haiku", lane="judge", key=key + ".j1")
    j2 = gw.call(judge_spec, [{"role": "user", "content": p}], family="judge", arm="haiku", lane="judge", key=key + ".j2")
    a, b = parse(j1.get("text"), ids), parse(j2.get("text"), ids)
    out = {"ids": ids, "j1": j1.get("text"), "j2": j2.get("text"), "a": a, "b": b,
           "cost": (j1.get("cost") or 0) + (j2.get("cost") or 0)}
    if a and b and a == b:
        return dict(out, final=a, by="agree")
    dis = ids if not (a and b) else [i for i in ids if a[i] != b[i]]
    rp = REFEREE.format(prompt=p, a=json.dumps(a), b=json.dumps(b), ids=", ".join(dis))
    rf = gw.call(referee_spec, [{"role": "user", "content": rp}], family="judge", arm="sol", lane="referee", key=key + ".ref")
    obj = parse_json(rf.get("text")) or {}
    final = dict(a or b or {})
    ok = True
    for i in dis:
        v = str(obj.get(i, "")).lower()
        if v in ("changed", "kept"):
            final[i] = v
        else:
            ok = False
    out.update(ref=rf.get("text"), cost=out["cost"] + (rf.get("cost") or 0))
    return dict(out, final=final if ok and len(final) == len(ids) else None, by="referee" if ok else "unresolved")
