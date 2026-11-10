"""AUTHORITY_2 structural validator for GLM's candidates (WRITER_SPEC.md). Standard library only.

Checks only structure (kinds, ids, dates, links, class shape, truth-table consistency). Whether the truth table is
right, whether the task forces an act, the class and the distractor are the raters' questions, not this file's."""
from __future__ import annotations

import re
from datetime import date

KIND_PREFIX = {"state": "F", "rule": "R", "decision": "D", "obligation": "O"}
FIRST_DAY, LAST_DAY = "2026-06-01", "2026-11-09"
WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
          "November", "December"]
WD_RE = re.compile(rf"\b({'|'.join(WEEKDAYS)})\s+(\d{{1,2}})(?:st|nd|rd|th)?\s+({'|'.join(MONTHS)})\b")
NOT_AN_ACT = re.compile(r"^\s*(ask|check|wait|hold off|postpone|delay|do nothing|don't|do not|confirm with)\b", re.I)


def _is_date(s):
    try:
        date.fromisoformat(s)
        return bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}", s or ""))
    except Exception:
        return False


def weekday_errors(text: str, where: str):
    out = []
    for wd, d, mon in WD_RE.findall(text or ""):
        m = MONTHS.index(mon) + 1
        ok = False
        for y in (2026, 2027):
            try:
                if date(y, m, int(d)).weekday() == WEEKDAYS.index(wd):
                    ok = True
            except ValueError:
                pass
        if not ok:
            out.append(f"{where}: «{wd} {d} {mon}» is not a {wd} in 2026 (or 2027)")
    return out


def _trans(items, roots):
    rev = {}
    for it in items:
        for d in it.get("depends_on", []) or []:
            rev.setdefault(d, []).append(it["id"])
    seen, q = [], list(roots)
    while q:
        x = q.pop(0)
        for y in rev.get(x, []):
            if y not in seen:
                seen.append(y)
                q.append(y)
    return seen


def validate(s: dict) -> list[str]:
    e = []
    sid = s.get("id", "?")
    p = lambda msg: e.append(f"{sid}: {msg}")
    cls = s.get("class")
    if cls not in (1, 2, 3, 4):
        return [f"{sid}: class must be 1..4"]
    for k in ("title", "owner", "now", "items", "change", "task", "truth"):
        if k not in s:
            p(f"missing {k}")
    if e:
        return e
    now = s["now"]
    if not _is_date(now) or not (FIRST_DAY <= now <= LAST_DAY):
        p(f"now {now} must be an ISO date in {FIRST_DAY}..{LAST_DAY}")
    items = s["items"]
    if not isinstance(items, list) or not (20 <= len(items) <= 50):
        p(f"history has {len(items) if isinstance(items, list) else '?'} items; need 20–50")
        if not isinstance(items, list):
            return e
    ids = [it.get("id") for it in items]
    if len(set(ids)) != len(ids):
        p("duplicate item ids")
    idset = set(ids)
    byid = {it.get("id"): it for it in items}
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
        elif not (FIRST_DAY <= it["date"] <= LAST_DAY):
            p(f"{iid}: date outside {FIRST_DAY}..{LAST_DAY}")
        dated[iid] = it.get("date", "")
        txt = it.get("text", "") or ""
        if re.search(r"\b(Rests on|Revokes)\b", txt) or re.search(r"\[[A-Z]\d+", txt) or set(re.findall(r"\b[FRDOC]\d+\b", txt)) & (idset | {"C1"}):
            p(f"{iid}: text must not carry ids/Rests on/Revokes (the renderer adds them)")
        e.extend(weekday_errors(txt, f"{sid}: {iid}"))
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
            if it.get("status") not in ("open", "done"):
                p(f"{iid}: obligation status must be open or done")
        else:
            if it.get("due"):
                p(f"{iid}: due only on obligations")
            if it.get("status"):
                p(f"{iid}: status only on obligations")
        if kind in ("state", "rule") and it.get("depends_on"):
            p(f"{iid}: state/rule items carry no depends_on")
        for d in it.get("depends_on", []) or []:
            if d not in idset:
                p(f"{iid}: depends_on unknown {d}")
    for it in items:
        for d in it.get("depends_on", []) or []:
            if d in byid and byid[d].get("date", "") > it.get("date", ""):
                p(f"{it['id']}: depends on later-dated {d}")
    kinds = [it.get("kind") for it in items]
    if not (2 <= kinds.count("rule") <= 3):
        p(f"{kinds.count('rule')} rules; need 2–3")
    decs = [it["id"] for it in items if it.get("kind") == "decision"]
    obls = [it["id"] for it in items if it.get("kind") == "obligation"]
    if not (4 <= len(decs) <= 10):
        p(f"{len(decs)} decisions; need 4–10")
    if not (2 <= len(obls) <= 3):
        p(f"{len(obls)} obligations; need 2–3")
    ch = s["change"]
    if not isinstance(ch, dict):
        p("change must be an object")
        return e
    if ch.get("id") != "C1":
        p("change id must be C1")
    if ch.get("kind") not in ("correction", "state", "rule"):
        p("change kind must be correction | state | rule")
    for k in ("date", "source", "text"):
        if not ch.get(k):
            p(f"change missing {k}")
    if re.search(r"\b(Rests on|Revokes)\b", ch.get("text", "") or "") or set(re.findall(r"\b[FRDO]\d+\b", ch.get("text", "") or "")) & idset:
        p("change text must not carry ids or Revokes (the renderer adds them)")
    e.extend(weekday_errors(ch.get("text", ""), f"{sid}: C1"))
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
    opts = t.get("options", []) if isinstance(t, dict) else []
    oids = [o.get("id") for o in opts]
    if not t.get("text"):
        p("task text missing")
    e.extend(weekday_errors(t.get("text", ""), f"{sid}: task"))
    if not (3 <= len(opts) <= 4) or oids != ["a", "b", "c", "d"][: len(opts)]:
        p("task needs 3–4 options with ids a, b, c, d in order")
    for o in opts:
        if NOT_AN_ACT.search(o.get("text", "") or ""):
            p(f"option {o.get('id')} is not an act (ask/check/wait/postpone)")
        e.extend(weekday_errors(o.get("text", ""), f"{sid}: option {o.get('id')}"))
    tr = s["truth"]
    need = ("correct_options", "stale_options", "distractor_options", "unnecessary_options", "stale_items",
            "distractor_items", "touched", "untouched", "obligations_due", "obligation_due", "why")
    for k in need:
        if k not in tr:
            p(f"truth missing {k}")
    if e:
        return e
    co, so, do, uo = (set(tr[k]) for k in ("correct_options", "stale_options", "distractor_options", "unnecessary_options"))
    if not co or not co <= set(oids):
        p("correct_options must be a non-empty subset of option ids")
    for name, x in (("stale", so), ("distractor", do), ("unnecessary", uo)):
        if not x <= set(oids):
            p(f"{name}_options must be option ids")
    if co & (so | do | uo) or so & do or so & uo or do & uo:
        p("correct, stale, distractor and unnecessary options must be disjoint")
    if not do:
        p("distractor_options must be non-empty")
    touched = [x.get("id") for x in tr["touched"]]
    for x in tr["touched"]:
        if not x.get("direction"):
            p(f"touched {x.get('id')} needs a direction")
    if set(touched) & set(tr["untouched"]):
        p("touched and untouched overlap")
    if sorted(touched + tr["untouched"]) != sorted(decs):
        p(f"touched ∪ untouched must equal all decisions {sorted(decs)}")
    for x in tr["stale_items"]:
        if x not in idset:
            p(f"stale item {x} unknown")
    # distractor
    dis = tr["distractor_items"]
    if not dis:
        p("distractor_items must be non-empty")
    trans_all = _trans(items, rv)
    hist_dates = sorted(d for d in dated.values() if d)
    median = hist_dates[len(hist_dates) // 2] if hist_dates else ""
    for x in dis:
        if x not in idset:
            p(f"distractor {x} unknown")
            continue
        if x in rv or x in touched or x in trans_all:
            p(f"distractor {x} must be untouched by the change")
        if rv:
            if any(byid[r].get("date", "") >= byid[x].get("date", "") for r in rv if r in byid):
                p(f"distractor {x} must be dated after the revoked item(s)")
        elif byid[x].get("date", "") < median:
            p(f"distractor {x} must be in the newer half of the history (on or after {median})")
    # obligations
    od = tr["obligation_due"]
    if not isinstance(tr["obligations_due"], list) or len(tr["obligations_due"]) != 1 or tr["obligations_due"][0] not in obls:
        p("obligations_due must list exactly one obligation")
    elif not isinstance(od, dict) or od.get("id") != tr["obligations_due"][0]:
        p("obligation_due.id must equal obligations_due[0]")
    else:
        o = byid[od["id"]]
        if o.get("status") != "open":
            p(f"due obligation {od['id']} must be open")
        if _is_date(o.get("due", "")) and o["due"] > now:
            p(f"due obligation {od['id']} must be due on or before now")
        for k in ("act", "correct_value"):
            if not od.get(k):
                p(f"obligation_due.{k} missing")
        for oo in obls:
            if oo == od["id"]:
                continue
            ob = byid[oo]
            if ob.get("status") == "open" and _is_date(ob.get("due", "")) and ob["due"] <= now:
                p(f"obligation {oo} is open and due by now; only the due obligation may be")
    # class structure
    deps = {it["id"]: set(it.get("depends_on", []) or []) for it in items}
    direct = lambda root: [d for d in decs if root in deps[d]]
    trans_dec = [x for x in trans_all if x in decs]
    two_hop = [c for c in touched if not (deps[c] & set(rv)) and deps[c] & set(touched)]
    if cls == 1:
        if len(rv) != 1 or byid.get(rv[0], {}).get("kind") != "state":
            p("class 1: change must revoke exactly one state item")
        else:
            d1 = direct(rv[0])
            if sorted(trans_dec) != sorted(touched):
                p(f"class 1: touched must be exactly the decisions resting on {rv[0]}, directly or through others ({sorted(trans_dec)})")
            if len(d1) < 2:
                p("class 1: at least two decisions must cite the stale item directly")
            if not two_hop:
                p("class 1: need a touched decision two hops from the stale item")
            if not tr["untouched"]:
                p("class 1: need at least one untouched decision")
        if ch["kind"] not in ("state", "correction"):
            p("class 1: change kind state or correction")
    if cls == 2:
        if ch["kind"] != "rule" or len(rv) != 1 or byid.get(rv[0], {}).get("kind") != "rule":
            p("class 2: change must be a rule revoking exactly one rule")
        else:
            d1 = direct(rv[0])
            tt = [x for x in d1 if x in touched]
            uu = [x for x in d1 if x in tr["untouched"]]
            if len(tt) < 2 or len(uu) < 2:
                p(f"class 2: of decisions citing {rv[0]} ({d1}) need ≥2 touched and ≥2 untouched")
            if not two_hop:
                p("class 2: need a touched decision two hops from the rule (resting on a touched decision, not on the rule)")
    if cls == 3:
        if len(rv) != 1 or byid.get(rv[0], {}).get("kind") != "state":
            p("class 3: change must revoke exactly one state item A")
        else:
            d1 = direct(rv[0])
            if not any(x in touched for x in d1):
                p("class 3: a decision citing A must be touched (B)")
            if not any(x in tr["untouched"] for x in d1):
                p("class 3: a decision citing A must be untouched (D)")
            if not two_hop:
                p("class 3: need C — a touched decision resting on a touched decision, not on A")
    if cls == 4:
        if touched:
            p("class 4: touched must be empty")
        if so:
            p("class 4: stale_options must be empty")
        if not uo:
            p("class 4: unnecessary_options must be non-empty")
        if trans_dec:
            p(f"class 4: decisions depend on the revoked item(s): {trans_dec}")
    if cls in (1, 2, 3):
        if not so:
            p(f"class {cls}: stale_options must be non-empty")
        for x in touched:
            if x not in trans_dec:
                p(f"touched {x} does not depend (even transitively) on what the change revokes")
    if cls in (1, 2):
        for u in tr["untouched"]:
            if deps.get(u, set()) & set(touched):
                p(f"class {cls}: untouched {u} rests on a touched decision (that is a chain)")
    return e
