"""AUTHORITY_1 scenarios: load, render, validate. Standard library only (the validator runs without Mem0)."""
from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCENARIO_DIR = ROOT / "scenarios"
CLASS_FILES = [SCENARIO_DIR / f"class{n}.json" for n in (1, 2, 3, 4)]
KIND_PREFIX = {"state": "F", "rule": "R", "decision": "D", "obligation": "O"}
CLASS_NAMES = {1: "stale fact", 2: "changed rule", 3: "chain", 4: "control"}
LAST_DAY = "2026-11-09"
FIRST_DAY = "2026-06-01"


def load_all(files=CLASS_FILES):
    out = []
    for f in files:
        out.extend(json.loads(Path(f).read_text(encoding="utf-8")))
    return out


def by_id(scenarios):
    return {s["id"]: s for s in scenarios}


# ---- rendering: the one line per item every arm sees -----------------------------------------------------------------

def render_item(it: dict) -> str:
    head = [it["id"], it["kind"], it["date"]]
    if it.get("due"):
        head.append(f"due {it['due']}")
    if it.get("expires"):
        head.append(f"valid until {it['expires']}")
    head.append(f"source: {it['source']}")
    line = f"[{' | '.join(head)}] {it['text'].strip()}"
    if it.get("depends_on"):
        line += f" Rests on: {', '.join(it['depends_on'])}."
    if it.get("revokes"):
        line += f" Revokes: {', '.join(it['revokes'])}."
    return line


def history_sorted(s: dict):
    order = {k: i for i, k in enumerate(["F", "R", "D", "O"])}
    return sorted(s["items"], key=lambda it: (it["date"], order.get(it["id"][0], 9), int(re.sub(r"\D", "", it["id"]) or 0)))


def decisions(s):
    return [it for it in s["items"] if it["kind"] == "decision"]


def dependents_index(items):
    rev = {}
    for it in items:
        for d in it.get("depends_on", []) or []:
            rev.setdefault(d, []).append(it["id"])
    return rev


def transitive_dependents(items, roots):
    rev = dependents_index(items)
    seen, stack = [], list(roots)
    while stack:
        x = stack.pop(0)
        for y in rev.get(x, []):
            if y not in seen:
                seen.append(y)
                stack.append(y)
    return seen


# ---- validation ---------------------------------------------------------------------------------------------------------

def _is_date(s):
    try:
        date.fromisoformat(s)
        return bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}", s))
    except Exception:
        return False


def validate(s: dict) -> list[str]:
    e = []
    sid = s.get("id", "?")
    p = lambda msg: e.append(f"{sid}: {msg}")
    cls = s.get("class")
    if cls not in (1, 2, 3, 4):
        p("class must be 1..4")
        return e
    if not re.fullmatch(rf"S{cls}-\d\d", sid):
        p("id must be S{class}-NN")
    for k in ("title", "owner", "now", "items", "change", "task", "truth"):
        if k not in s:
            p(f"missing {k}")
    if e:
        return e
    now = s["now"]
    if not _is_date(now) or not (FIRST_DAY <= now <= LAST_DAY):
        p(f"now {now} must be an ISO date in {FIRST_DAY}..{LAST_DAY}")
    items = s["items"]
    if not (15 <= len(items) <= 40):
        p(f"history has {len(items)} items; need 15–40")
    ids = [it.get("id") for it in items]
    if len(set(ids)) != len(ids):
        p("duplicate item ids")
    idset = set(ids)
    dated = {}
    for it in items:
        iid, kind = it.get("id"), it.get("kind")
        if kind not in KIND_PREFIX:
            p(f"{iid}: kind {kind} not allowed in history")
            continue
        if not re.fullmatch(rf"{KIND_PREFIX[kind]}\d+", iid or ""):
            p(f"{iid}: id must be {KIND_PREFIX[kind]}<n> for kind {kind}")
        for k in ("date", "source", "text"):
            if not it.get(k):
                p(f"{iid}: missing {k}")
        if not _is_date(it.get("date", "")):
            p(f"{iid}: bad date")
        dated[iid] = it.get("date", "")
        if re.search(r"\b(Rests on|Revokes)\b", it.get("text", "")) or re.search(r"\[[A-Z]\d+", it.get("text", "")):
            p(f"{iid}: text must not carry ids/Rests on/Revokes (the renderer adds them)")
        if it.get("expires") is not None:
            if kind != "state":
                p(f"{iid}: expires only on state items")
            elif not _is_date(it["expires"]):
                p(f"{iid}: bad expires")
        if kind == "decision" and not it.get("depends_on"):
            p(f"{iid}: a decision must cite depends_on")
        if kind == "obligation":
            if not _is_date(it.get("due", "")):
                p(f"{iid}: obligation needs an ISO due date")
        elif it.get("due"):
            p(f"{iid}: due only on obligations")
        if kind in ("state", "rule") and it.get("depends_on"):
            p(f"{iid}: state/rule items carry no depends_on")
        for d in it.get("depends_on", []) or []:
            if d not in idset:
                p(f"{iid}: depends_on unknown {d}")
    for it in items:
        for d in it.get("depends_on", []) or []:
            if d in dated and dated[d] > it.get("date", ""):
                p(f"{it['id']}: depends on later-dated {d}")
    nrules = sum(1 for it in items if it.get("kind") == "rule")
    if not (2 <= nrules <= 3):
        p(f"{nrules} rules; need 2–3")
    decs = [it["id"] for it in items if it.get("kind") == "decision"]
    obls = [it["id"] for it in items if it.get("kind") == "obligation"]
    if not (4 <= len(decs) <= 9):
        p(f"{len(decs)} decisions; need 4–9")
    if not (2 <= len(obls) <= 4):
        p(f"{len(obls)} obligations; need 2–4")
    ch = s["change"]
    if ch.get("id") != "C1":
        p("change id must be C1")
    if ch.get("kind") not in ("correction", "state", "rule"):
        p("change kind must be correction | state | rule")
    for k in ("date", "source", "text"):
        if not ch.get(k):
            p(f"change missing {k}")
    if re.search(r"\b(Rests on|Revokes)\b", ch.get("text", "")):
        p("change text must not carry Revokes (the renderer adds it)")
    if _is_date(ch.get("date", "")):
        if any(d > ch["date"] for d in dated.values() if d):
            p("history item dated after the change")
        if ch["date"] > now:
            p("change dated after now")
    else:
        p("change bad date")
    rv = ch.get("revokes")
    if not isinstance(rv, list):
        p("change.revokes must be a list")
        rv = []
    for r in rv:
        if r not in idset:
            p(f"change revokes unknown {r}")
    for it in items:
        if it.get("expires") and _is_date(it["expires"]) and it["expires"] < now and it["id"] not in rv:
            p(f"{it['id']} expired before now but is not the revoked item")
    t = s["task"]
    opts = t.get("options", [])
    oids = [o.get("id") for o in opts]
    if not t.get("text"):
        p("task text missing")
    if not (2 <= len(opts) <= 4) or oids != ["a", "b", "c", "d"][: len(opts)]:
        p("task needs 2–4 options with ids a, b, c, d in order")
    tr = s["truth"]
    for k in ("correct_options", "stale_options", "unnecessary_options", "stale_items", "touched", "untouched", "obligations_due", "why"):
        if k not in tr:
            p(f"truth missing {k}")
    if e:
        return e
    co, so, uo = set(tr["correct_options"]), set(tr["stale_options"]), set(tr["unnecessary_options"])
    if not co or not co <= set(oids):
        p("correct_options must be a non-empty subset of option ids")
    if not so <= set(oids) or not uo <= set(oids):
        p("stale/unnecessary options must be option ids")
    if co & so or co & uo:
        p("an option cannot be both correct and stale/unnecessary")
    touched = [x.get("id") for x in tr["touched"]]
    for x in tr["touched"]:
        if not x.get("direction"):
            p(f"touched {x.get('id')} needs a direction")
    if set(touched) & set(tr["untouched"]):
        p("touched and untouched overlap")
    if sorted(touched + tr["untouched"]) != sorted(decs):
        p(f"touched ∪ untouched must equal all decisions {sorted(decs)}")
    if not tr["obligations_due"] or not set(tr["obligations_due"]) <= set(obls):
        p("obligations_due must be a non-empty subset of the obligations")
    for x in tr["stale_items"]:
        if x not in idset:
            p(f"stale item {x} unknown")
    deps = {it["id"]: set(it.get("depends_on", []) or []) for it in items}
    direct = lambda root: [d for d in decs if root in deps[d]]
    trans = transitive_dependents(items, rv)
    trans_dec = [x for x in trans if x in decs]
    # class structure
    if cls == 1:
        if len(rv) != 1 or not rv or next((it for it in items if it["id"] == rv[0]), {}).get("kind") != "state":
            p("class 1: change must revoke exactly one state item")
        else:
            d1 = direct(rv[0])
            if sorted(d1) != sorted(touched):
                p(f"class 1: touched must be exactly the decisions citing {rv[0]} directly ({sorted(d1)})")
            if len(d1) < 2:
                p("class 1: at least two decisions must rest on the stale item")
            if any(deps[t_] & set(touched) for t_ in touched):
                p("class 1: no chains (a touched decision depends on another touched decision)")
            if not tr["untouched"]:
                p("class 1: need at least one untouched decision")
        if ch["kind"] not in ("state", "correction"):
            p("class 1: change kind state or correction")
        if not so:
            p("class 1: stale_options must be non-empty")
    if cls == 2:
        if ch["kind"] != "rule" or len(rv) != 1 or not rv[0].startswith("R"):
            p("class 2: change must be a rule revoking exactly one rule")
        else:
            d1 = direct(rv[0])
            tt = [x for x in d1 if x in touched]
            uu = [x for x in d1 if x in tr["untouched"]]
            if len(tt) < 2 or len(uu) < 2:
                p(f"class 2: of decisions citing {rv[0]} ({d1}) need ≥2 touched and ≥2 untouched")
        if not so:
            p("class 2: stale_options must be non-empty")
    if cls == 3:
        if len(rv) != 1 or not rv[0].startswith("F"):
            p("class 3: change must revoke exactly one state item A")
        else:
            A = rv[0]
            d1 = direct(A)
            if not any(x in touched for x in d1):
                p("class 3: a decision citing A must be touched (B)")
            if not any(x in tr["untouched"] for x in d1):
                p("class 3: a decision citing A must be untouched (D)")
            chain = [c for c in touched if A not in deps[c] and deps[c] & set(touched)]
            if not chain:
                p("class 3: need C — a touched decision resting on a touched decision, not on A")
            for c in touched:
                if c not in trans_dec:
                    p(f"class 3: touched {c} is not reachable from {A}")
        if not so:
            p("class 3: stale_options must be non-empty")
    if cls == 4:
        if touched:
            p("class 4: touched must be empty")
        if so:
            p("class 4: stale_options must be empty")
        if not uo:
            p("class 4: unnecessary_options must be non-empty")
        if trans_dec:
            p(f"class 4: decisions depend on the revoked item(s): {trans_dec}")
    if cls in (1, 2):
        for u in tr["untouched"]:
            if deps.get(u, set()) & set(touched):
                p(f"class {cls}: untouched {u} rests on a touched decision (that is a chain)")
    if cls in (1, 2, 3):
        for x in touched:
            if x not in trans_dec:
                p(f"touched {x} does not depend (even transitively) on what the change revokes")
    return e


def validate_files(files):
    errs, seen = [], set()
    allsc = []
    for f in files:
        data = json.loads(Path(f).read_text(encoding="utf-8"))
        if not isinstance(data, list):
            errs.append(f"{f}: must be a JSON array")
            continue
        for s in data:
            errs.extend(validate(s))
            if s.get("id") in seen:
                errs.append(f"{s.get('id')}: duplicate scenario id")
            seen.add(s.get("id"))
            allsc.append(s)
    return errs, allsc
