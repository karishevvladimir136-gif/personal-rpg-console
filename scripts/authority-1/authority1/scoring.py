"""Mechanical scoring by the truth table, plus the judge material for the free text."""
from __future__ import annotations

import json
import re

from . import prompts


def parse_json(text):
    if not text:
        return None
    t = text.strip()
    t = re.sub(r"^```(?:json)?\s*|\s*```$", "", t, flags=re.S)
    try:
        return json.loads(t)
    except Exception:
        pass
    m = re.search(r"\{.*\}", t, re.S)
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
            return None
    return None


def reply_of(text, s):
    obj = parse_json(text)
    if not isinstance(obj, dict):
        return {"form_kept": False}
    opts = [o["id"] for o in s["task"]["options"]]
    act = str(obj.get("action", "")).strip().lower().strip(")").strip()
    act = act[:1] if act[:1] in opts and (len(act) == 1 or not act[1:2].isalpha()) else act
    rev = [x for x in obj.get("revise") or [] if isinstance(x, dict) and x.get("id")]
    ask = [x for x in obj.get("ask") or [] if isinstance(x, dict) and x.get("id")]
    obl = [str(x) for x in obj.get("obligations_done") or [] if isinstance(x, (str, int))]
    return {"form_kept": act in opts, "action": act if act in opts else None, "raw_action": obj.get("action"),
            "revise": [{"id": str(x["id"]).strip(), "now": str(x.get("now", ""))} for x in rev],
            "ask": [{"id": str(x["id"]).strip(), "question": str(x.get("question", ""))} for x in ask],
            "obligations_done": obl, "what_i_do": str(obj.get("what_i_do", "")), "note": str(obj.get("note", ""))}


def mechanical(s, rep):
    tr = s["truth"]
    if not rep.get("form_kept"):
        return {"form_kept": False}
    touched = [t["id"] for t in tr["touched"]]
    rev_ids = [r["id"] for r in rep["revise"]]
    ask_ids = [a["id"] for a in rep["ask"]]
    due = tr["obligations_due"]
    return {
        "form_kept": True,
        "action": rep["action"],
        "correct_action": rep["action"] in tr["correct_options"],
        "stale_action": rep["action"] in tr["stale_options"],
        "unnecessary_action": rep["action"] in tr["unnecessary_options"],
        "touched_listed": [t for t in touched if t in rev_ids],
        "touched_asked": [t for t in touched if t in ask_ids and t not in rev_ids],
        "untouched_revised": [u for u in tr["untouched"] if u in rev_ids],
        "untouched_asked": [u for u in tr["untouched"] if u in ask_ids],
        "unknown_ids": [x for x in rev_ids if x not in touched and x not in tr["untouched"]],
        "obligations_due_done": [o for o in due if o in rep["obligations_done"]],
        "n_touched": len(touched), "n_due": len(due),
    }


def judge_prompt(s, rep, mech):
    decs = "\n".join(f"- {it['id']}: {it['text']}" for it in s["items"] if it["kind"] == "decision")
    touched = "\n".join(f"  - {t['id']}: {t['direction']}" for t in s["truth"]["touched"]) or "  (none)"
    reply = json.dumps({k: rep.get(k) for k in ("action", "what_i_do", "revise", "ask", "note")}, ensure_ascii=False, indent=1)
    ch = s["change"]
    return prompts.JUDGE.format(owner=s["owner"], decisions=decs, change_date=ch["date"], change_source=ch["source"],
                                change_text=ch["text"], touched=touched, untouched=", ".join(s["truth"]["untouched"]) or "(none)",
                                reply=reply, asked=json.dumps(mech.get("touched_listed", [])))


def parse_judge(text, asked):
    obj = parse_json(text)
    if not isinstance(obj, dict):
        return None
    d = obj.get("direction") or {}
    out = {"direction": {k: bool(d.get(k)) for k in asked if k in d}, "changes_untouched_in_text": sorted(set(str(x) for x in obj.get("changes_untouched_in_text") or []))}
    if set(out["direction"]) != set(asked):
        return None
    return out
