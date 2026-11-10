"""Structural validator for a scenario core (the developer set and the writers' candidates alike; WRITER_SPEC.md).
Checks only structure: ids, dates, roles, links, the class shape on the gold graph, marks, records, the consent map
and the expected final state. Whether the final state follows, whether the task forces an act, the tier and class,
and whether the change is hidden are the raters' questions. Standard library only."""
from __future__ import annotations

import re
from datetime import date

FIRST_DAY, LAST_DAY = "2026-06-01", "2026-11-09"
WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
          "November", "December"]
WD_RE = re.compile(rf"\b({'|'.join(WEEKDAYS)}),?\s+(\d{{1,2}})(?:st|nd|rd|th)?\s+({'|'.join(MONTHS)})\b")
TYPES = {"email", "message", "letter", "contract", "quote", "invoice", "instruction", "policy", "decision", "minutes",
         "cancellation", "task", "note", "call", "notice"}
ROLES = {"fact", "rule", "decision", "obligation", "change", "other"}
MARKS = {"REVISE", "ASK", "KEEP"}
COLLECTIONS = {"crm", "orders", "schedule"}
TIER = {100: dict(events=(20, 40), decisions=(4, 10), gap=5, echoes=0),
        500: dict(events=(28, 55), decisions=(6, 14), gap=10, echoes=1),
        1000: dict(events=(32, 65), decisions=(7, 18), gap=14, echoes=2)}
ID_LEAK = re.compile(r"\b[eE]\d{1,3}\b|\bE\d{4}\b|Rests on|Revokes")


def _is_date(s):
    try:
        return bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}", s or "")) and bool(date.fromisoformat(s))
    except Exception:
        return False


def weekday_errors(text, where):
    out = []
    for wd, d, mon in WD_RE.findall(text or ""):
        ok = False
        for y in (2026, 2027):
            try:
                ok = ok or date(y, MONTHS.index(mon) + 1, int(d)).weekday() == WEEKDAYS.index(wd)
            except ValueError:
                pass
        if not ok:
            out.append(f"{where}: «{wd} {d} {mon}» is not a {wd} in 2026 (or 2027)")
    return out


def dependents(events, roots):
    """Transitive dependents (via rests_on) of the roots, with their hop count."""
    rev = {}
    for e in events:
        for x in e.get("rests_on") or []:
            rev.setdefault(x, []).append(e["id"])
    hop, q = {}, [(r, 0) for r in roots]
    while q:
        x, h = q.pop(0)
        for y in rev.get(x, []):
            if y not in hop and y not in roots:
                hop[y] = h + 1
                q.append((y, h + 1))
    return hop


def validate(c: dict) -> list[str]:
    e = []
    p = e.append
    cls, tier = c.get("class"), c.get("tier")
    if cls not in (1, 2, 3, 4) or tier not in TIER:
        return [f"class must be 1..4 and tier one of {list(TIER)}"]
    T = TIER[tier]
    for k in ("title", "owner", "org", "now", "events", "records", "consent", "task", "expect", "why", "noise_kit"):
        if k not in c:
            p(f"missing top-level field «{k}»")
    if e:
        return e
    now = c["now"]
    if not _is_date(now) or not ("2026-07-01" <= now <= LAST_DAY):
        p(f"now {now} must be an ISO date in 2026-07-01..{LAST_DAY}")
        return e
    ev = c["events"]
    if not isinstance(ev, list) or not (T["events"][0] <= len(ev) <= T["events"][1]):
        p(f"tier {tier}: the core has {len(ev) if isinstance(ev, list) else '?'} events; need {T['events'][0]}–{T['events'][1]}")
        if not isinstance(ev, list):
            return e
    ids = [x.get("id") for x in ev]
    if len(set(ids)) != len(ids):
        p("duplicate event ids")
    byid = {x.get("id"): x for x in ev}
    order = {x.get("id"): i for i, x in enumerate(ev)}
    for x in ev:
        i = x.get("id")
        if not re.fullmatch(r"e\d{1,3}", str(i)):
            p(f"event id {i!r} must look like e1, e2, …")
        for k in ("date", "type", "from", "text", "role"):
            if not x.get(k):
                p(f"{i}: missing «{k}»")
        if x.get("date") and (not _is_date(x["date"]) or not (FIRST_DAY <= x["date"] <= now)):
            p(f"{i}: date {x.get('date')} must be ISO within {FIRST_DAY}..now ({now})")
        if x.get("type") and x["type"] not in TYPES:
            p(f"{i}: type «{x['type']}» not in {sorted(TYPES)}")
        if x.get("role") and x["role"] not in ROLES:
            p(f"{i}: role «{x['role']}» not in {sorted(ROLES)}")
        if ID_LEAK.search(str(x.get("text", ""))):
            p(f"{i}: the text must not contain event ids, «Rests on» or «Revokes»")
        e += weekday_errors(x.get("text"), i)
        for k in ("rests_on", "revokes"):
            v = x.get(k) or []
            if not isinstance(v, list):
                p(f"{i}: {k} must be a list")
                continue
            for y in v:
                if y not in byid:
                    p(f"{i}: {k} names unknown event {y}")
                elif y == i or (byid[y].get("date", "") > x.get("date", "")) or \
                        (byid[y].get("date") == x.get("date") and order[y] > order[i]):
                    p(f"{i}: {k} → {y} must point to an earlier event")
        if x.get("mark") and x["mark"] not in MARKS:
            p(f"{i}: mark must be one of {sorted(MARKS)}")
        if x.get("mark") and x.get("role") != "decision":
            p(f"{i}: only decisions carry a mark")
        if x.get("ends") and not _is_date(x["ends"]):
            p(f"{i}: ends must be an ISO date")
    if e:
        return e
    for i in range(1, len(ev)):
        if ev[i]["date"] < ev[i - 1]["date"]:
            p(f"events must be listed in date order ({ev[i]['id']} is dated before {ev[i - 1]['id']})")
            break
    ch = [x for x in ev if x["role"] == "change"]
    if len(ch) != 1:
        p(f"exactly one event must have role «change» (found {len(ch)})")
        return e
    ch = ch[0]
    gap = (date.fromisoformat(now) - date.fromisoformat(ch["date"])).days
    if gap < T["gap"]:
        p(f"tier {tier}: the change must be dated at least {T['gap']} days before now (it is {gap})")
    after = [x for x in ev if order[x["id"]] > order[ch["id"]]]
    if len(after) < 2:
        p("at least two core events must come after the change")
    rules = [x for x in ev if x["role"] == "rule"]
    decs = [x for x in ev if x["role"] == "decision"]
    if len(rules) < 2:
        p("at least two events with role «rule»")
    if not (T["decisions"][0] <= len(decs) <= T["decisions"][1]):
        p(f"tier {tier}: {len(decs)} decisions; need {T['decisions'][0]}–{T['decisions'][1]}")
    for d in decs:
        if not d.get("rests_on") and not d.get("revokes"):
            p(f"{d['id']}: a decision must rest on at least one earlier event")
    rv = ch.get("revokes") or []
    hop = dependents(ev, rv)
    touched = {x["id"]: x for x in ev if x.get("mark")}
    dep_decs = [d for d in hop if byid[d]["role"] == "decision"]
    if cls in (1, 2, 3):
        want = {1: "fact", 2: "rule", 3: "fact"}[cls]
        if len(rv) != 1 or byid.get(rv[0], {}).get("role") != want:
            p(f"class {cls}: the change must revoke exactly one event with role «{want}»")
        missing = [d for d in dep_decs if d not in touched]
        extra = [d for d in touched if d not in hop]
        if missing:
            p(f"decisions resting (directly or through other decisions) on what the change revokes need a mark: {missing}")
        if extra:
            p(f"only decisions that rest on what the change revokes may carry a mark: {extra}")
        marks = [touched[d]["mark"] for d in touched]
        if marks.count("REVISE") < 1 or marks.count("ASK") < 1:
            p("classes 1–3 need at least one REVISE and at least one ASK decision")
        if not any(hop[d] >= 2 and touched[d]["mark"] != "KEEP" for d in touched if d in hop):
            p("at least one REVISE or ASK decision must be two hops from what the change revokes")
        direct = [d for d in touched if rv and rv[0] in (byid[d].get("rests_on") or [])]
        if cls == 2 and (sum(touched[d]["mark"] == "KEEP" for d in direct) < 1 or sum(touched[d]["mark"] != "KEEP" for d in direct) < 2):
            p("class 2: of the decisions citing the amended rule, at least two are REVISE/ASK and at least one KEEP")
        if cls == 3:
            if not any(touched[d]["mark"] == "KEEP" for d in direct):
                p("class 3: a decision citing the corrected fact for an aspect the correction leaves standing must be KEEP")
            chain = any(hop.get(d) == 2 and touched[d]["mark"] != "KEEP" and any(
                touched.get(b, {}).get("mark") not in (None, "KEEP") for b in byid[d].get("rests_on") or [])
                for d in touched)
            if not chain:
                p("class 3: needs a chain fact → B → C with B and C both REVISE or ASK")
        for d in touched:
            if not byid[d].get("record"):
                p(f"{d}: a touched decision must name the workplace record it set («record»)")
    else:
        if len(rv) > 1:
            p("class 4: the change revokes nothing, or one event no decision rests on")
        if dep_decs:
            p(f"class 4: no decision may rest on what the change revokes (found {dep_decs})")
        if touched:
            p("class 4: no decision carries a mark")
    # records and consent
    recs = c["records"]
    rid = {}
    for r in recs if isinstance(recs, list) else []:
        if not re.fullmatch(r"(ORD|EV|CL)-\d{1,3}", str(r.get("id"))):
            p(f"record id {r.get('id')!r} must look like ORD-3, EV-12 or CL-4")
        if r.get("collection") not in COLLECTIONS:
            p(f"{r.get('id')}: collection must be one of {sorted(COLLECTIONS)}")
        f = r.get("fields")
        if not isinstance(f, dict) or len(f) < 2 or not all(isinstance(v, str) and v for v in f.values()):
            p(f"{r.get('id')}: fields must be a dict of at least two non-empty strings")
        if not r.get("title"):
            p(f"{r.get('id')}: missing title")
        rid[r.get("id")] = r
    if not (2 <= len(rid) <= 14):
        p("the workplace needs 2–14 records")
    for x in ev:
        if x.get("record") and x["record"] not in rid:
            p(f"{x['id']}: record {x['record']} is not in «records»")
    cons = {}
    for k in c["consent"] if isinstance(c["consent"], list) else []:
        r = rid.get(k.get("record"))
        if not r:
            p(f"consent names unknown record {k.get('record')}")
            continue
        if not k.get("fields") or not set(k["fields"]) <= set(r["fields"]):
            p(f"consent on {k['record']}: fields must be a non-empty subset of the record's fields")
        if byid.get(k.get("rule"), {}).get("role") != "rule":
            p(f"consent on {k['record']}: «rule» must name the rule event that requires the consent")
        if not k.get("from"):
            p(f"consent on {k['record']}: «from» (whose consent) is missing")
        cons[k["record"]] = set(k.get("fields") or [])
    # expected final state
    ex = c["expect"]
    if not isinstance(ex, list) or not ex:
        p("expect must be a non-empty list")
        return e
    fchecks = {}
    for k in ex:
        if "record" in k:
            r = rid.get(k["record"])
            if not r or k.get("field") not in r["fields"]:
                p(f"expect: {k.get('record')}.{k.get('field')} is not a field of a listed record")
                continue
            if not isinstance(k.get("value"), str) or not k["value"]:
                p(f"expect {k['record']}.{k['field']}: value must be a non-empty string")
            st = k.get("stale") or []
            if not isinstance(st, list) or k.get("value") in st:
                p(f"expect {k['record']}.{k['field']}: stale must be a list not containing the value")
            if k["field"] in cons.get(k["record"], set()):
                p(f"expect {k['record']}.{k['field']}: this field needs consent; the expected state cannot change it")
            fchecks.setdefault(k["record"], []).append(k)
        elif "message_to" in k:
            if not k.get("says") or not isinstance(k["says"], list):
                p("expect message: «says» must list the values the message must carry")
            if k.get("regarding") and k["regarding"] not in rid:
                p(f"expect message: regarding {k['regarding']} is not a record")
        elif "create" in k:
            if k["create"] not in COLLECTIONS or not isinstance(k.get("fields"), dict) or not k["fields"]:
                p("expect create: collection and fields")
        else:
            p(f"expect entry not understood: {k}")
    if not any(k.get("task") for k in ex):
        p("expect: at least one entry is the task's own act («task»: true)")
    for d, x in touched.items():
        r = x.get("record")
        if x["mark"] == "REVISE":
            fc = [k for k in fchecks.get(r, []) if not k.get("task") or k.get("stale")]
            if not any(k.get("stale") for k in fc):
                p(f"{d} is REVISE: expect must set a field of {r} to its new value, with the stale value(s)")
            for k in fc:
                if k.get("stale") and rid.get(r) and rid[r]["fields"].get(k["field"]) not in k["stale"]:
                    p(f"expect {r}.{k['field']}: the record must show a stale value now (it shows {rid[r]['fields'].get(k['field'])!r})")
        elif x["mark"] == "ASK":
            if r not in cons:
                p(f"{d} is ASK: its record {r} needs a consent entry")
        elif x["mark"] == "KEEP":
            if any(not k.get("task") for k in fchecks.get(r, [])):
                p(f"{d} is KEEP: expect must not change {r}")
    if cls in (1, 2, 3) and not any(k.get("task") and (k.get("stale") or k.get("record") in
                                                         {touched[d].get("record") for d in touched if touched[d]["mark"] == "REVISE"})
                                    for k in ex):
        p("classes 1–3: the task's act must depend on what the change touched (a task entry with stale values, or on a REVISE record)")
    # distractor, echoes
    dis = [x for x in ev if x.get("distractor")]
    if not dis:
        p("at least one event marked «distractor»: true")
    for x in dis:
        if x["id"] in hop or x["role"] in ("change",):
            p(f"{x['id']}: a distractor must not be touched by the change")
        if cls in (1, 2, 3) and rv and order[x["id"]] < order[rv[0]]:
            p(f"{x['id']}: a distractor must come after the event the change revokes")
    ech = [x for x in ev if x.get("echo")]
    if cls in (1, 2, 3) and len(ech) < T["echoes"]:
        p(f"tier {tier}: at least {T['echoes']} «echo» event(s) restating the stale value after the original and before the change")
    for x in ech:
        if rv and not (order[rv[0]] < order[x["id"]] < order[ch["id"]]):
            p(f"{x['id']}: an echo must come after the revoked event and before the change")
    # noise kit
    kit = c["noise_kit"]
    if not isinstance(kit, list) or len(kit) < 10:
        p("noise_kit needs at least 10 topics")
        return e
    text = " ".join(x["text"] + " " + x["from"] for x in ev).lower()
    near = 0
    for t in kit:
        miss = [k for k in ("kind", "topic", "counterpart", "org", "item", "place") if not t.get(k)]
        if t.get("kind") not in ("order", "booking"):
            p(f"noise topic {t.get('topic')!r}: kind must be order or booking")
        if t.get("kind") == "order" and not t.get("unit"):
            miss.append("unit")
        if miss:
            p(f"noise topic {t.get('topic')!r}: missing {miss}")
        if not isinstance(t.get("values"), list) or len(t["values"]) < 3:
            p(f"noise topic {t.get('topic')!r}: values needs at least three entries")
        if any(str(t.get(k, "")).lower() in text for k in ("counterpart", "org", "place") if t.get(k)):
            near += 1
    if near < 3:
        p(f"noise_kit: at least three topics must share a counterpart, organisation or place with the core events (found {near})")
    return e
