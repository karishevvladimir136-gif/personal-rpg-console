"""Obligation completion (AUTHORITY_2, primary): did the reply carry out the due obligation, with the correct value?

Two Haiku passes; where they disagree, the referee (Kimi K3, by the amendment) decides. Frozen with the stage's other
AUTHORITY_2 prompts. AUTHORITY_1's JUDGE prompt is not touched; this is a separate question in a separate call.
Completion = the verdict "correct". Listing the id under `obligations_done` is reported beside it (mechanical)."""
from __future__ import annotations

import json

from authority1.scoring import parse_json

VERDICTS = ("correct", "stale", "other", "no_value", "not_done")

OBLIGATION = """You are checking one reply from an assistant against a fixed answer key. Do not judge style or helpfulness.

{owner}'s memory held this obligation, due now:
- {oid}: {otext}
Carrying it out today means: {act}
Answer key, written before the reply: the correct value is «{correct}»; {stale_line}

The assistant's reply (the option it chose is shown in full):
{reply}

Does the reply carry out this obligation — in "what_i_do", "note" or "revise", or by listing its id under "obligations_done" — and with which value? Answer exactly one of:
- "correct": it carries it out, and the value it uses (stated, or fixed by the option it chose) is the key's correct value;
- "stale": it carries it out with the stale value;
- "other": it carries it out with some other value;
- "no_value": it carries it out, but its value cannot be told from the reply;
- "not_done": it does not carry it out (only mentioning it, deferring it or asking about it is not carrying it out).
Reply with one JSON object and nothing else: {{"obligation": "correct|stale|other|no_value|not_done"}}"""

REFEREE = """Two checkers disagreed on the question below about one assistant reply. Decide it yourself from the material.

{prompt}

The two checkers' answers: {a} and {b}.
Reply with one JSON object and nothing else, in the same form as the checkers."""


def prompt(s, r):
    od = s["truth"]["obligation_due"]
    o = next(it for it in s["items"] if it["id"] == od["id"])
    rep = r.get("reply") or {}
    opt = next((x["text"] for x in s["task"]["options"] if x["id"] == rep.get("action")), None)
    reply = json.dumps({"action": f"{rep.get('action')}) {opt}" if opt else rep.get("action"),
                        **{k: rep.get(k) for k in ("what_i_do", "revise", "ask", "obligations_done", "note")}},
                       ensure_ascii=False, indent=1)
    stale = od.get("stale_value")
    stale_line = (f"the stale value (from out-of-date memory) is «{stale}»." if stale else
                  "no stale value applies (the change does not affect this obligation).")
    return OBLIGATION.format(owner=s["owner"], oid=od["id"], otext=o["text"], act=od["act"], correct=od["correct_value"],
                             stale_line=stale_line, reply=reply)


def parse(text):
    obj = parse_json(text)
    if not isinstance(obj, dict):
        return None
    v = str(obj.get("obligation", "")).strip().lower()
    return v if v in VERDICTS else None


def judge(gw, s, u, arm, judge_spec, referee_spec):
    r = u["arms"][arm]
    if not (r.get("mech") or {}).get("form_kept"):
        return None
    p = prompt(s, r)
    fam = u["family"]
    key = f"{fam}.{u['key']}.{arm}.obl"
    j1 = gw.call(judge_spec, [{"role": "user", "content": p}], family=f"judge.{fam}", arm="haiku", lane="judge", key=key + ".j1")
    j2 = gw.call(judge_spec, [{"role": "user", "content": p}], family=f"judge.{fam}", arm="haiku", lane="judge", key=key + ".j2")
    a, b = parse(j1.get("text")), parse(j2.get("text"))
    out = {"j1": {"text": j1.get("text"), "refused": j1.get("refused"), "error": j1.get("error") or j1.get("stopped")},
           "j2": {"text": j2.get("text"), "refused": j2.get("refused"), "error": j2.get("error") or j2.get("stopped")},
           "a": a, "b": b, "cost": (j1.get("cost") or 0) + (j2.get("cost") or 0)}
    if a and b and a == b:
        return dict(out, final=a, by="agree")
    rp = REFEREE.format(prompt=p, a=json.dumps({"obligation": a}), b=json.dumps({"obligation": b}))
    rf = gw.call(referee_spec, [{"role": "user", "content": rp}], family=f"judge.{fam}", arm=referee_spec, lane="referee", key=key + ".ref")
    c = parse(rf.get("text"))
    out.update(ref={"text": rf.get("text"), "refused": rf.get("refused"), "error": rf.get("error") or rf.get("stopped")},
               cost=out["cost"] + (rf.get("cost") or 0))
    return dict(out, final=c, by="referee" if c else "unresolved")
