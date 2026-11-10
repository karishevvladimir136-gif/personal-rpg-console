"""The Authority Layer (arm C): code plus one structured prompt (prompts.LAYER_MARK).

It reads only what is in Mem0 — each memory's text and the structure the layer stored beside it in Mem0's own
metadata (item id, kind, date, source, depends_on, revokes, expires) — and never edits a memory or a decision:
 (a) takes the same search result arms A and B get;
 (b) from every corrected item (named in some item's `revokes`) and every expired state item (`expires` < today),
     walks the reverse `depends_on` links, breadth first, to every decision built on it, directly or through other
     decisions;
 (c) asks the subject model, once, to mark each walked decision revise / keep / ask (skipped when nothing is walked);
 (d) hands the agent the search result plus what the walk reached, each corrected/expired item and each walked
     decision annotated — nothing else.
"""
from __future__ import annotations

import json

from . import prompts


def group(all_mems):
    items = {}
    for m in all_mems:
        iid = m.get("item_id")
        if not iid:
            continue
        it = items.setdefault(iid, {"item_id": iid, "kind": m.get("kind"), "item_date": m.get("item_date"),
                                    "source": m.get("source"), "depends_on": m.get("depends_on") or [],
                                    "revokes": m.get("revokes") or [], "expires": m.get("expires"), "texts": [],
                                    "mem_ids": []})
        if m.get("text") not in it["texts"]:
            it["texts"].append(m.get("text"))
        it["mem_ids"].append(m.get("mem_id"))
    return items


def text_of(it):
    return " / ".join(t for t in it["texts"] if t)


def walk(all_mems, now: str):
    items = group(all_mems)
    revoked_by = {}
    for iid, it in items.items():
        for r in it["revokes"]:
            revoked_by.setdefault(r, []).append(iid)
    expired = [iid for iid, it in items.items() if it["kind"] == "state" and it["expires"] and it["expires"] < now]
    roots = list(dict.fromkeys(list(revoked_by) + expired))
    rev = {}
    for iid, it in items.items():
        if it["kind"] != "decision":
            continue
        for d in it["depends_on"]:
            rev.setdefault(d, []).append(iid)
    walked, paths, queue = [], {}, [(r, [r]) for r in roots]
    while queue:
        x, path = queue.pop(0)
        for y in sorted(rev.get(x, []), key=lambda k: (items[k]["item_date"] or "", k)):
            if y in paths or y in roots:
                continue
            paths[y] = path + [y]
            walked.append(y)
            queue.append((y, path + [y]))
    return {"items": items, "revoked_by": revoked_by, "expired": expired, "roots": roots, "walked": walked, "paths": paths}


def mark_prompt(s, w):
    items = w["items"]
    ch = []
    for r in w["roots"]:
        old = items.get(r)
        line = f"- {r}: {text_of(old) if old else '(not in memory)'}"
        for c in w["revoked_by"].get(r, []):
            ci = items[c]
            line += f"\n  replaced/ended by {c} ({ci['kind']}, {ci['item_date']}, source: {ci['source']}): {text_of(ci)}"
        if r in w["expired"]:
            line += f"\n  expired on {old['expires']}"
        ch.append(line)
    decs = [f"- {d} (path {' → '.join(w['paths'][d])}): {text_of(items[d])}" for d in w["walked"]]
    basis_ids = []
    for d in w["walked"]:
        for b in items[d]["depends_on"]:
            if b not in w["roots"] and b not in w["walked"] and b not in basis_ids and b in items:
                basis_ids.append(b)
    basis = [f"- {b}: {text_of(items[b])}" for b in basis_ids] or ["- (none)"]
    return prompts.LAYER_MARK.format(now=s["now"], changes="\n".join(ch), decisions="\n".join(decs), basis="\n".join(basis))


def parse_marks(text):
    from .scoring import parse_json
    obj = parse_json(text) or {}
    out = {}
    for m in obj.get("marks", []) if isinstance(obj, dict) else []:
        if isinstance(m, dict) and m.get("id"):
            mk = str(m.get("mark", "")).lower()
            out[m["id"]] = {"mark": mk if mk in ("revise", "keep", "ask") else "ask", "why": str(m.get("why", ""))[:400]}
    return out


def annotate(s, retrieval, w, marks):
    """The marked set handed to the agent: the search result in its order, then what the walk added."""
    items = w["items"]

    def note(iid):
        it = items.get(iid)
        if not it:
            return ""
        bits = []
        if iid in w["revoked_by"]:
            bits.append(f"revoked by {', '.join(w['revoked_by'][iid])} on {', '.join(items[c]['item_date'] for c in w['revoked_by'][iid])}")
        if iid in w["expired"]:
            bits.append(f"expired on {it['expires']}")
        if it["revokes"]:
            bits.append(f"{iid}, {it['kind']} of {it['item_date']} (source: {it['source']}) — revokes {', '.join(it['revokes'])}")
        if iid in marks:
            mk = marks[iid]
            bits.append(f"{mk['mark'].upper()} — {mk['why']}")
        elif iid in w["walked"]:
            bits.append("reached, not marked")
        return f"   [layer: {'; '.join(bits)}]" if bits else ""

    lines, seen = [], set()
    for r in retrieval:
        lines.append(f"- {r['text']}{note(r.get('item_id'))}")
        seen.add(r.get("item_id"))
    extra = []
    want = list(w["roots"]) + [c for r in w["roots"] for c in w["revoked_by"].get(r, [])] + list(w["walked"])
    for iid in dict.fromkeys(want):
        if iid in seen or iid not in items:
            continue
        seen.add(iid)
        extra.append(f"- {text_of(items[iid])}{note(iid)}")
    out = [prompts.MEMORY_LAYER, *lines]
    if extra:
        out += ["", prompts.LAYER_ADDED, *extra]
    if not w["roots"]:
        out += ["", prompts.LAYER_NOTHING]
    return "\n".join(out)
