"""The candidate pool: GLM 5.3 and Kimi K3 each write 100 cores from the frozen per-tier spec (WRITER_SPEC.md), never
shown ours; Astra and Haiku rate every candidate on the frozen instrument (RATER_INSTRUMENT.md), and the other writer's
model gives the third vote; a candidate is admitted when at least two of the three marks are yes; admitted
candidates fill 30 / 30 / 20 by tier, classes as AUTHORITY_1, by hash order. Shortfalls are stated, never filled."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from authority1.scoring import parse_json

from . import specs3 as K
from . import world
from .validate3 import TIER, validate

HERE = Path(__file__).resolve().parent.parent
WRITER_SPEC = (HERE / "WRITER_SPEC.md").read_text(encoding="utf-8")
RATER_INSTRUMENT = (HERE / "RATER_INSTRUMENT.md").read_text(encoding="utf-8")
CLASS_NAMES = {1: "stale fact", 2: "changed rule", 3: "chain", 4: "control"}
CONTROL_KINDS = ["a new fact beside the topic", "a rule restated in other words (revokes [])",
                 "a correction of an event no decision rests on"]

SETTINGS = """List 60 distinct everyday-admin settings in which one person relies on an assistant that keeps a memory of what was said and decided and runs a small workplace system (orders, bookings, client records) — operations, logistics, a small business, a clinic's front desk, a school office, events, facilities, a club, a workshop, and any others you choose. Each setting is one line naming the person's role and the concrete organisation (fictional). No two alike; vary the size, the trade and the kind of work. Reply with one JSON object and nothing else: {"settings": ["<setting>", ...]}"""

WRITE = """{spec}

---

Write one scenario now.
- Tier: {tier} events (your core: {emin}–{emax} events, {dmin}–{dmax} decisions).
- Class: {cls} ({name}).{control}
- Setting: {setting}
Reply with the JSON object only."""

REPAIR = """The code that checks the scenario's structure found these problems:
{errors}
Fix them and reply with the whole corrected JSON object and nothing else."""


def spec_for(tier):
    t = TIER[tier]
    echo = "" if not t["echoes"] else (
        f" At this tier, add at least {t['echoes']} event(s) marked `echo: true`: an old document, reminder or "
        "confirmation dated after the event the change revokes and before the change, restating the stale value as "
        "current (in a control, restating the plan).")
    return (WRITER_SPEC.replace("{tier}", f"{tier:,}").replace("{events_min}", str(t["events"][0]))
            .replace("{events_max}", str(t["events"][1])).replace("{dec_min}", str(t["decisions"][0]))
            .replace("{dec_max}", str(t["decisions"][1])).replace("{gap}", str(t["gap"])).replace("{echo_rule}", echo))


def write_prompt(tier, cls, setting, idx):
    t = TIER[tier]
    control = f"\n- Control kind: {CONTROL_KINDS[idx % 3]}." if cls == 4 else ""
    return WRITE.format(spec=spec_for(tier).strip(), tier=f"{tier:,}", emin=t["events"][0], emax=t["events"][1],
                        dmin=t["decisions"][0], dmax=t["decisions"][1], cls=cls, name=CLASS_NAMES[cls], control=control,
                        setting=setting)


def normalise(obj, cid, tier, cls, writer):
    if not isinstance(obj, dict):
        return None
    c = dict(obj)
    c.update(id=cid, tier=tier, **{"class": cls}, writer=writer)
    return c


def check(c):
    if c is None:
        return ["the reply is not one JSON object"]
    try:
        errs = validate(c)
        if not errs:
            s = world.build(c)
            if s["after_change"] < K.MIN_AFTER_CHANGE[c["tier"]]:
                errs.append(f"the change is too close to now: only {s['after_change']} of {len(s['events'])} events would "
                            f"come after it; move the change earlier")
        return errs
    except Exception as e:
        return [f"malformed ({type(e).__name__}: {e})"]


def chash(c):
    return hashlib.sha256(json.dumps(c, sort_keys=True, ensure_ascii=False).encode()).hexdigest()


# ---- rating ------------------------------------------------------------------------------------------------------------
def render_candidate(c):
    s = world.build(c)
    core = {e["src"][5:]: e for e in s["events"] if e["src"].startswith("core:")}
    t = TIER[c["tier"]]
    lines = [f"Owner: {c['owner']} at {c['org']}. The task's day: {s['now']}.",
             f"Tier {c['tier']:,} requirements: {t['events'][0]}–{t['events'][1]} core events; {t['decisions'][0]}–{t['decisions'][1]} "
             f"decisions; the change at least {t['gap']} days before the task's day and at least two core events after it"
             + (f"; in classes 1–3 at least {t['echoes']} old document(s) («echo») restating the stale value" if t["echoes"] else "") + ".", "",
             f"Core events in date order (as the assistant would see them, then [the hidden answer key]); in the built "
             f"history the change is event {s['change_index'] + 1} of {len(s['events'])}, with {s['after_change']} events after it:"]
    for e in c["events"]:
        b = core[e["id"]]
        key = [f"role {e['role']}"]
        for k in ("rests_on", "revokes"):
            if e.get(k):
                key.append(f"{k} {', '.join(e[k])}")
        for k in ("record", "mark", "ends"):
            if e.get(k):
                key.append(f"{k} {e[k]}")
        for k in ("echo", "distractor"):
            if e.get(k):
                key.append(k)
        lines.append(f"{e['id']}: {world.render(b)}   [{'; '.join(key)}]")
    near = [e for e in s["events"][max(0, s["change_index"] - 6): s["change_index"] + 7] if e["src"].startswith("noise:")]
    lines += ["", "A sample of the routine events around the change in the built history:"]
    lines += [world.render(e) for e in near[:10]]
    lines += ["", "Workplace records now:"] + [f"- {r['id']} ({r['collection']}) {r['title']}: {json.dumps(r['fields'], ensure_ascii=False)}"
                                                for r in c["records"]]
    lines += ["", "Consent map: " + (json.dumps(c["consent"], ensure_ascii=False) or "none"), "",
              f"The task: «{c['task']}»", "", "Expected final state (everything else unchanged):"]
    lines += [f"- {json.dumps(x, ensure_ascii=False)}" for x in c["expect"]]
    cons = {k["record"]: k for k in c["consent"]}
    for e in c["events"]:
        if e.get("mark") == "ASK":
            k = cons.get(e.get("record"), {})
            lines.append(f"- (implied by the mark ASK on {e['id']}) a consent request on {e.get('record')} to {k.get('from', '?')}; "
                         f"{e.get('record')}'s consent fields stay as they are until that consent comes")
        elif e.get("mark") == "KEEP":
            lines.append(f"- (implied by the mark KEEP on {e['id']}) {e.get('record')} stays as it is")
    lines.append("- every record not named above stays as it is (a message to a party of a record named above is allowed)")
    lines += ["", f"Writer's reasoning: {c.get('why')}"]
    return "\n".join(lines)


def rater_prompt(c):
    inst = RATER_INSTRUMENT.strip().replace("{{", "{").replace("}}", "}")
    return inst.replace("{tier}", f"{c['tier']:,}").replace("{cls}", str(c["class"])).replace("{candidate}", render_candidate(c))


def parse_rating(text):
    obj = parse_json(text)
    if not isinstance(obj, dict):
        return None
    yn = lambda v: str(v).strip().lower() if str(v).strip().lower() in ("yes", "no") else None
    try:
        cl = int(str(obj.get("class")).strip())
    except Exception:
        cl = None
    out = {"final_state_follows": yn(obj.get("final_state_follows")), "forces_act": yn(obj.get("forces_act")),
           "class": cl if cl in (1, 2, 3, 4) else None, "tier_right": yn(obj.get("tier_right")),
           "change_hidden": yn(obj.get("change_hidden")), "reasons": str(obj.get("reasons", ""))[:800]}
    if None in [out[k] for k in ("final_state_follows", "forces_act", "class", "tier_right", "change_hidden")]:
        return None
    return out


def mark(r, cls):
    """One rater's admission mark: yes on the four yes/no questions and the intended class."""
    return bool(r) and r["final_state_follows"] == "yes" and r["forces_act"] == "yes" and r["class"] == cls and \
        r["tier_right"] == "yes" and r["change_hidden"] == "yes"


def cohen_kappa(a, b):
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


def fleiss_kappa(rows):
    """rows: list of per-item label lists (same number of raters each)."""
    rows = [r for r in rows if all(x is not None for x in r)]
    if not rows:
        return None, 0
    n = len(rows[0])
    cats = sorted({x for r in rows for x in r}, key=str)
    N = len(rows)
    P = [(sum(r.count(c) ** 2 for c in cats) - n) / (n * (n - 1)) for r in rows]
    pj = [sum(r.count(c) for r in rows) / (N * n) for c in cats]
    Pbar, Pe = sum(P) / N, sum(p * p for p in pj)
    if Pe >= 1:
        return None, N
    return (Pbar - Pe) / (1 - Pe), N
