"""A scenario's core (written by a writer: the signal events, the workplace records, the consent map, the task and the
expected final state) is built into a long history by code: deterministic noise threads drawn from the writer's noise
kit are interleaved with the core in date order, every event gets an opaque id (E0001 … in date order), and the gold
graph (rests_on / revokes over the final ids) is kept beside it for the scorer only. Standard library only.

What a subject ever sees of an event is `render(ev)`: id, date, type, sender, text. Never a role, a link, a mark, a
record mapping or a consent entry."""
from __future__ import annotations

import hashlib
import random
from datetime import date, timedelta

from . import specs3 as K

START = "2026-06-01"


def _d(s):
    return date.fromisoformat(s)


def _iso(d):
    return d.isoformat()


def nice(d):
    return f"{d.strftime('%A')} {d.day} {d.strftime('%B')}"


def seed_of(*parts):
    return int(hashlib.sha256("|".join(map(str, parts)).encode()).hexdigest()[:12], 16)


def render(ev):
    return f"[{ev['eid']} | {ev['date']} | {ev['type']} | from {ev['from']}] {ev['text'].strip()}"


# ---- noise ------------------------------------------------------------------------------------------------------------
REASONS = ["the budget line was frozen", "the event was folded into another one", "we found stock in the cupboard",
           "the team will not need it this month", "the supplier could not invoice in time"]
TIMES = ["08:30", "09:00", "10:00", "10:30", "11:00", "13:00", "13:30", "14:00", "15:00", "16:00"]
CHAT = [
    "{cp}: thanks, noted on our side.",
    "{cp} sent over the monthly statement for {org}.",
    "Note: the {item} paperwork is filed in the shared drive under {month}.",
    "{cp}: our office is closed on {day} for staff training.",
    "Reminder from {cp}: please keep invoices for {org} together for the quarter-end check.",
    "{cp} asked whether we want a catalogue for next quarter; no reply needed yet.",
    "{cp}: we have a new phone line for orders; the old one still works too.",
]


def _pick(rng, xs):
    return xs[rng.randrange(len(xs))]


class Noise:
    """Threads of 2–7 events on one kit topic: a quote or availability (fact), a decision resting on it, sometimes a
    move or correction that replaces both (fact + superseding decision), sometimes a cancellation, a reminder (an old
    document left in place), a payment task; plus a few standing instructions and plain chatter. Every supersession in
    the noise is resolved inside the noise: the latest decision of a thread is what the workplace shows."""

    def __init__(self, core, tier, seed):
        self.c = core
        self.rng = random.Random(seed)
        self.now = _d(core["now"])
        self.start = _d(START)
        self.kit = core["noise_kit"]
        self.events, self.records, self.n = [], [], 0
        texts = " ".join(e["text"] + " " + e.get("from", "") for e in core["events"]).lower()
        self.near = [t for t in self.kit if any(str(t.get(k, "")).lower() and str(t.get(k, "")).lower() in texts
                                                 for k in ("counterpart", "org", "place"))]
        self.far = [t for t in self.kit if t not in self.near] or list(self.kit)
        self.tier = tier

    def _ev(self, d, typ, frm, text, role, rests=(), revokes=(), thread=None, **kw):
        if d > self.now:
            return None
        self.n += 1
        ev = {"nid": f"n{self.n}", "date": _iso(d), "type": typ, "from": frm, "text": text, "role": role,
              "rests_on": [x["nid"] for x in rests if x], "revokes": [x["nid"] for x in revokes if x], "thread": thread}
        ev.update(kw)
        self.events.append(ev)
        return ev

    def _base(self):
        span = (self.now - self.start).days - 2
        return self.start + timedelta(days=self.rng.randrange(max(1, span)))

    def topic(self):
        pool = self.near if (self.near and self.rng.random() < K.NEAR_SHARE) else self.far
        return _pick(self.rng, pool)

    def thread(self, tid):
        t = self.topic()
        r = self.rng
        cp, org = t["counterpart"], t["org"]
        frm = f"{cp} ({org})" if org and org not in cp else cp
        own = self.c["owner"]
        b = self._base()
        d1 = b + timedelta(days=r.randrange(5, 22))
        vals = list(t["values"])
        if t["kind"] == "order":
            q = _pick(r, vals)
            price = r.randrange(4, 90) * 10
            f = self._ev(b, _pick(r, ["quote", "email"]), frm, _pick(r, [
                f"{org} quoted {q} {t['unit']} of {t['item']}, ${price} in total, delivered to {t['place']} on {nice(d1)}.",
                f"Quote: {q} {t['unit']} of {t['item']} for ${price}, delivery to {t['place']} on {nice(d1)}.",
                f"We can supply {q} {t['unit']} of {t['item']} at ${price}; delivery to {t['place']} on {nice(d1)}."]),
                "fact", thread=tid)
            if not f:
                return
            dd = self._ev(b + timedelta(days=r.randrange(0, 3)), "decision", own, _pick(r, [
                f"Decided: order {q} {t['unit']} of {t['item']} from {org} for delivery to {t['place']} on {nice(d1)}.",
                f"Placed the order with {org}: {q} {t['unit']} of {t['item']}, arriving {nice(d1)}.",
                f"Go ahead with {org}'s quote: {q} {t['unit']} of {t['item']} on {nice(d1)}."]),
                "decision", rests=[f], thread=tid)
            last, day, cur = dd, d1, q
            if dd and r.random() < 0.3:
                d2 = d1 + timedelta(days=r.randrange(1, 6))
                c = self._ev(b + timedelta(days=r.randrange(3, 6)), "email", frm, _pick(r, [
                    f"Correction on the {t['item']}: we can't deliver on {nice(d1)} after all; the new delivery day is {nice(d2)}.",
                    f"Sorry, the {t['item']} for {t['place']} slips from {nice(d1)} to {nice(d2)}."]),
                    "fact", revokes=[f], thread=tid)
                if c:
                    nd = self._ev(_d(c["date"]) + timedelta(days=r.randrange(0, 2)), "decision", own,
                                  f"Moved the {t['item']} delivery from {org} to {nice(d2)}; quantity stays {q} {t['unit']}.",
                                  "decision", rests=[c], revokes=[dd], thread=tid)
                    if nd:
                        last, day = nd, d2
            if last and r.random() < 0.35:
                due = day + timedelta(days=r.randrange(7, 25))
                paid = due < self.now
                self._ev(_d(last["date"]) + timedelta(days=1), "task", own,
                         f"To do: pay {org}'s invoice for the {t['item']} (${price}) by {nice(due)}. "
                         + (f"Paid on {nice(min(self.now, due - timedelta(days=1)))}." if paid else "Not paid yet."),
                         "obligation", rests=[last], thread=tid)
            if last and r.random() < 0.12:
                self._ev(_d(last["date"]) + timedelta(days=r.randrange(1, 4)), "cancellation", own,
                         f"Cancelled the {t['item']} order with {org} for {nice(day)}: {_pick(r, REASONS)}.",
                         "decision", revokes=[last], thread=tid)
                return
            if last and day <= self.now and r.random() < 0.4:
                self._ev(day, "message", frm, f"Today's delivery of {t['item']} for {t['place']} is on its way.", "other", thread=tid)
            if last and day >= self.now - timedelta(days=3):
                self.records.append({"collection": "orders", "title": f"{t['item']} from {org}",
                                     "fields": {"supplier": org, "item": t["item"], "quantity": str(cur),
                                                "delivery": _iso(day), "place": t["place"], "status": "confirmed"},
                                     "nid": last["nid"]})
        else:
            place = _pick(r, vals)
            tm = _pick(r, TIMES)
            f = self._ev(b, _pick(r, ["email", "message"]), frm, _pick(r, [
                f"{place} is free on {nice(d1)} from {tm} for the {t['item']}.",
                f"We can host the {t['item']} at {place} on {nice(d1)}, {tm}.",
                f"Availability: {place}, {nice(d1)} at {tm}, for the {t['item']}."]), "fact", thread=tid)
            if not f:
                return
            dd = self._ev(b + timedelta(days=r.randrange(0, 3)), "decision", own, _pick(r, [
                f"Booked {place} for the {t['item']} on {nice(d1)} at {tm}.",
                f"Decided: the {t['item']} will be in {place}, {nice(d1)}, {tm}.",
                f"Confirmed {place} with {cp} for the {t['item']} on {nice(d1)} at {tm}."]), "decision", rests=[f], thread=tid)
            last, cur = dd, place
            if dd and r.random() < 0.3:
                p2 = _pick(r, [v for v in vals if v != place] or vals)
                c = self._ev(b + timedelta(days=r.randrange(3, 6)), "email", frm,
                             f"{place} is no longer free on {nice(d1)}; {p2} is available at the same time.", "fact",
                             revokes=[f], thread=tid)
                if c:
                    nd = self._ev(_d(c["date"]) + timedelta(days=r.randrange(0, 2)), "decision", own,
                                  f"Moved the {t['item']} on {nice(d1)} to {p2}, same time.", "decision", rests=[c],
                                  revokes=[dd], thread=tid)
                    if nd:
                        last, cur = nd, p2
            if last and r.random() < 0.4:
                self._ev(_d(last["date"]) + timedelta(days=r.randrange(1, 5)), "email", own,
                         f"Reminder to the team: the {t['item']} is on {nice(d1)} at {tm} in {cur}.", "other", thread=tid)
            if last and r.random() < 0.1:
                self._ev(_d(last["date"]) + timedelta(days=r.randrange(1, 4)), "cancellation", own,
                         f"Cancelled the {t['item']} on {nice(d1)}: {_pick(r, REASONS)}.", "decision",
                         revokes=[last], thread=tid)
                return
            if last and d1 >= self.now - timedelta(days=3):
                self.records.append({"collection": "schedule", "title": f"{t['item']}",
                                     "fields": {"title": t["item"], "place": cur, "date": _iso(d1), "time": tm,
                                                "host": cp, "status": "booked"}, "nid": last["nid"]})

    def instruction(self, tid):
        t = _pick(self.rng, self.kit)
        own = self.c["owner"]
        b = self._base()
        r1 = self._ev(b, "instruction", own, _pick(self.rng, [
            f"Instruction: {t['item']} goes through {t['org']} only; please don't order it elsewhere.",
            f"From today, anything to do with the {t['item']} is handled with {t['counterpart']}.",
            f"Standing note: deliveries for {t['place']} come to the side entrance, not reception."]), "rule", thread=tid)
        if r1 and self.rng.random() < 0.5:
            self._ev(b + timedelta(days=self.rng.randrange(10, 40)), "instruction", own,
                     f"Update to my earlier note on the {t['item']}: from now on it goes through {t['org']}'s online order form, not by email.",
                     "rule", revokes=[r1], thread=tid)

    def chatter(self, tid):
        t = _pick(self.rng, self.kit)
        d = self._base()
        txt = _pick(self.rng, CHAT).format(cp=t["counterpart"], org=t["org"], item=t["item"], month=d.strftime("%B"),
                                           day=nice(d + timedelta(days=self.rng.randrange(2, 12))))
        self._ev(d, _pick(self.rng, ["email", "message", "note"]), t["counterpart"], txt, "other", thread=tid)

    def make(self, target):
        i = 0
        n_instr = {100: 2, 500: 5, 1000: 9}[self.tier]
        for _ in range(n_instr):
            i += 1
            self.instruction(f"r{i}")
        while len(self.events) < int(target * 0.88):
            i += 1
            self.thread(f"t{i}")
        while len(self.events) < target:
            i += 1
            self.chatter(f"c{i}")
        # trim from the end of the list only events nothing rests on and that replace nothing
        while len(self.events) > target:
            used = {x for e in self.events for x in e["rests_on"] + e["revokes"]}
            rec = {r["nid"] for r in self.records}
            for k in range(len(self.events) - 1, -1, -1):
                e = self.events[k]
                if e["nid"] not in used and e["nid"] not in rec and not e["revokes"]:
                    self.events.pop(k)
                    break
            else:
                break
        return self.events


# ---- build ------------------------------------------------------------------------------------------------------------
def build(core, tier=None, cls=None, sid=None):
    """core (dict as written) → the built scenario (dict). Deterministic in the core's content."""
    tier = tier or core["tier"]
    cls = cls or core["class"]
    sid = sid or core["id"]
    seed = seed_of(sid, tier, core["now"], len(core["events"]))
    target = K.TIERS[tier] - len(core["events"])
    nz = Noise(core, tier, seed)
    noise = nz.make(target)
    rng = random.Random(seed + 1)
    rows = [(e["date"], 0, k, "core", e) for k, e in enumerate(core["events"])]
    rows += [(e["date"], 1, k, "noise", e) for k, e in enumerate(noise)]
    # date order; inside a day, a seeded interleave that keeps each source's own order
    by_day = {}
    for r in rows:
        by_day.setdefault(r[0], []).append(r)
    ordered = []
    for day in sorted(by_day):
        cs = [r for r in by_day[day] if r[3] == "core"]
        ns = [r for r in by_day[day] if r[3] == "noise"]
        cs.sort(key=lambda r: r[2])
        merged = []
        while cs or ns:
            if cs and (not ns or rng.random() < len(cs) / (len(cs) + len(ns))):
                merged.append(cs.pop(0))
            else:
                merged.append(ns.pop(0))
        ordered += merged
    idmap, events = {}, []
    for i, (_, _, _, src, e) in enumerate(ordered, 1):
        eid = f"E{i:04d}"
        key = ("core", e["id"]) if src == "core" else ("noise", e["nid"])
        idmap[key] = eid
    for _, _, _, src, e in ordered:
        if src == "core":
            ev = {"eid": idmap[("core", e["id"])], "date": e["date"], "type": e["type"], "from": e["from"], "text": e["text"],
                  "src": f"core:{e['id']}", "role": e["role"],
                  "rests_on": [idmap[("core", x)] for x in e.get("rests_on") or []],
                  "revokes": [idmap[("core", x)] for x in e.get("revokes") or []]}
            for k in ("mark", "record", "echo", "distractor", "ends"):
                if e.get(k):
                    ev[k] = e[k]
        else:
            ev = {"eid": idmap[("noise", e["nid"])], "date": e["date"], "type": e["type"], "from": e["from"], "text": e["text"],
                  "src": f"noise:{e['thread']}", "role": e["role"],
                  "rests_on": [idmap[("noise", x)] for x in e["rests_on"]],
                  "revokes": [idmap[("noise", x)] for x in e["revokes"]]}
        events.append(ev)
    core_eid = {e["id"]: idmap[("core", e["id"])] for e in core["events"]}
    change = next(e for e in core["events"] if e["role"] == "change")
    # workplace records: the core's, then the live noise records (capped), ids that cannot collide
    records = [dict(r, origin="core") for r in core["records"]]
    used = {r["id"] for r in records}
    prefix = {"orders": "ORD", "schedule": "EV", "crm": "CL"}
    nrec = sorted(nz.records, key=lambda r: (r["fields"].get("delivery") or r["fields"].get("date") or "", r["nid"]))
    rng2 = random.Random(seed + 2)
    rng2.shuffle(nrec)
    for r in nrec[:K.NOISE_RECORDS[tier]]:
        n = 401
        while f"{prefix[r['collection']]}-{n}" in used:
            n += 1
        rid = f"{prefix[r['collection']]}-{n}"
        used.add(rid)
        records.append({"id": rid, "collection": r["collection"], "title": r["title"], "fields": r["fields"],
                        "origin": "noise", "decision": idmap[("noise", r["nid"])]})
    records.sort(key=lambda r: (r["collection"], int("".join(ch for ch in r["id"] if ch.isdigit()) or 0), r["id"]))
    change_eid = core_eid[change["id"]]
    pos = next(i for i, e in enumerate(events) if e["eid"] == change_eid)
    out = {
        "id": sid, "tier": tier, "class": cls, "title": core.get("title"), "setting": core.get("setting"),
        "owner": core["owner"], "org": core["org"], "now": core["now"], "task": core["task"],
        "events": events, "change": change_eid, "change_index": pos, "after_change": len(events) - pos - 1,
        "records": records, "consent": core.get("consent") or [], "expect": core["expect"],
        "core_eid": core_eid, "writer": core.get("writer"), "why": core.get("why"),
    }
    out["gold"] = gold_graph(out)
    return out


def gold_graph(s):
    """The scorer's graph: rests_on and revokes over event ids, the change's revoked items, the touched decisions with
    their marks and records, and the dependents of the change."""
    rests = {e["eid"]: list(e["rests_on"]) for e in s["events"] if e["rests_on"]}
    revokes = {e["eid"]: list(e["revokes"]) for e in s["events"] if e["revokes"]}
    ends = {e["eid"]: e["ends"] for e in s["events"] if e.get("ends")}
    ch = next(e for e in s["events"] if e["eid"] == s["change"])
    touched = {e["eid"]: {"mark": e["mark"], "record": e.get("record")} for e in s["events"] if e.get("mark")}
    return {"rests_on": rests, "revokes": revokes, "ends": ends, "change_revokes": list(ch["revokes"]),
            "touched": touched, "decisions": [e["eid"] for e in s["events"] if e["role"] == "decision"]}


def history_text(s):
    return "\n".join(render(e) for e in s["events"])


def event_by_id(s):
    return {e["eid"]: e for e in s["events"]}
