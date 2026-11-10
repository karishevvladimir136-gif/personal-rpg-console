"""The candidate pool: GLM writes from the frozen spec (WRITER_SPEC.md); Astra and Kimi rate on the frozen instrument
(RATER_INSTRUMENT.md); the admission rule picks 10 a class by hash order. GLM is never shown any AUTHORITY_1 scenario:
its prompts are the spec, the class, the setting and (for repairs) the validator's own messages."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from authority1.scenarios import render_item
from authority1.scoring import parse_json

from .validate import validate

HERE = Path(__file__).resolve().parent.parent
WRITER_SPEC = (HERE / "WRITER_SPEC.md").read_text(encoding="utf-8")
RATER_INSTRUMENT = (HERE / "RATER_INSTRUMENT.md").read_text(encoding="utf-8")

CLASS_NAMES = {1: "stale fact", 2: "changed rule", 3: "chain", 4: "control"}
CONTROL_KINDS = ["a new fact beside the topic", "a rule restated in other words (kind rule, revokes [])",
                 "a correction of an item no decision uses, directly or through other decisions"]

SETTINGS = """List 50 distinct everyday-admin settings in which one person relies on an assistant that keeps a memory of what was said and decided — operations, logistics, a small business, a clinic's schedule, a school's term, and any others you choose. Each setting is one line naming the person's role and the concrete organisation or household (fictional). No two alike; vary the size, the trade and the kind of work. Reply with one JSON object and nothing else: {"settings": ["<setting>", ...]}"""

WRITE = """{spec}

---

Write one scenario now.
- Class: {cls} ({name}).{control}
- Setting: {setting}
Reply with the JSON object only."""

REPAIR = """The code that checks the scenario's structure found these problems:
{errors}
Fix them and reply with the whole corrected JSON object and nothing else."""


def write_prompt(cls: int, setting: str, idx: int) -> str:
    control = f"\n- Control kind: {CONTROL_KINDS[idx % 3]}." if cls == 4 else ""
    return WRITE.format(spec=WRITER_SPEC.strip(), cls=cls, name=CLASS_NAMES[cls], control=control, setting=setting)


def normalise(obj, cid: str, cls: int):
    """The writer's object with the harness's id and class set (the writer is not asked for either)."""
    if not isinstance(obj, dict):
        return None
    s = dict(obj)
    s["id"], s["class"] = cid, cls
    return s


def check(s):
    if s is None:
        return ["the reply is not one JSON object"]
    try:
        return validate(s)
    except Exception as e:  # a malformed field the validator did not anticipate
        return [f"{s.get('id')}: malformed ({type(e).__name__}: {e})"]


def chash(s) -> str:
    return hashlib.sha256(json.dumps(s, sort_keys=True, ensure_ascii=False).encode()).hexdigest()


# ---- rating ------------------------------------------------------------------------------------------------------------
def render_candidate(s) -> str:
    from datetime import date
    from authority1.scenarios import history_sorted
    d = date.fromisoformat(s["now"])
    tr = s["truth"]
    od = tr.get("obligation_due") or {}
    lines = [f"Owner: {s['owner']}. The day of the task: {d.strftime('%A')} {s['now']}.", "",
             "History (as the assistant would see it, in date order):"]
    lines += [render_item(it) for it in history_sorted(s)]
    lines += ["", "The change:", render_item(s["change"]), "",
              f"The task: «{s['task']['text']}»", "Options:"]
    lines += [f" {o['id']}) {o['text']}" for o in s["task"]["options"]]
    touched = "; ".join(f"{t['id']} → {t['direction']}" for t in tr["touched"]) or "none"
    lines += ["", "Answer key (not shown to the assistant):",
              f"- correct option(s): {', '.join(tr['correct_options'])}",
              f"- stale options: {', '.join(tr['stale_options']) or 'none'}; distractor options: {', '.join(tr['distractor_options']) or 'none'}; unnecessary options: {', '.join(tr['unnecessary_options']) or 'none'}",
              f"- stale items: {', '.join(tr['stale_items']) or 'none'}; distractor items: {', '.join(tr['distractor_items']) or 'none'}",
              f"- touched decisions and the correct direction: {touched}",
              f"- untouched decisions: {', '.join(tr['untouched']) or 'none'}",
              f"- the due obligation: {od.get('id')} — act: {od.get('act')}; correct value: {od.get('correct_value')}; stale value: {od.get('stale_value')}",
              f"- why: {tr['why']}"]
    return "\n".join(lines)


def rater_prompt(s) -> str:
    return RATER_INSTRUMENT.strip().format(candidate=render_candidate(s))


def parse_rating(text):
    obj = parse_json(text)
    if not isinstance(obj, dict):
        return None
    yn = lambda v: str(v).strip().lower() if str(v).strip().lower() in ("yes", "no") else None
    try:
        c = int(str(obj.get("class")).strip())
    except Exception:
        c = None
    out = {"truth_follows": yn(obj.get("truth_follows")), "forces_act": yn(obj.get("forces_act")),
           "class": c if c in (1, 2, 3, 4) else None, "distractor": yn(obj.get("distractor")),
           "reasons": str(obj.get("reasons", ""))[:800]}
    if None in (out["truth_follows"], out["forces_act"], out["class"], out["distractor"]):
        return None
    return out


def admitted_mark(r, intended):
    """The frozen admission mark of one rater: yes on the first two questions and the intended class."""
    return bool(r) and r["truth_follows"] == "yes" and r["forces_act"] == "yes" and r["class"] == intended


# ---- agreement --------------------------------------------------------------------------------------------------------
def cohen_kappa(a, b):
    """Cohen's κ for two raters' labels over the same items (None where undefined)."""
    pairs = [(x, y) for x, y in zip(a, b) if x is not None and y is not None]
    n = len(pairs)
    if not n:
        return None, 0
    cats = sorted({x for p in pairs for x in p}, key=str)
    po = sum(1 for x, y in pairs if x == y) / n
    pe = sum((sum(1 for x, _ in pairs if x == c) / n) * (sum(1 for _, y in pairs if y == c) / n) for c in cats)
    if pe >= 1.0:
        return (1.0 if po == 1.0 else None), n
    return (po - pe) / (1 - pe), n
