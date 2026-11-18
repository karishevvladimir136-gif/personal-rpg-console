#!/usr/bin/env python3
"""TOWN_1: writes a world's goal-check.json from the session's reading. Every quote is checked to be a verbatim substring
of the cited diary entry / post / proposal at the cited cycle, so nothing paraphrased can enter the record.
  python3 scripts/town-1/goal.py <decision.json>
decision.json: {world, met, aim, rule, reading, candidates: [...], quotes: [{name, cycle, source, text}], firstNaming, sixthNaming, count}
"""
import gzip, json, sys, datetime, os

d = json.load(open(sys.argv[1]))
root = os.path.join(os.path.dirname(__file__), "..", "..", "docs", "runs", "town-1-worlds", d["world"])
w = json.loads(gzip.open(os.path.join(root, "world-c24.json.gz")).read())
s = w["state"]
byname = {s["agents"][c]["name"]: c for c in s["citizens"]}
def texts(name, cycle, source):
    c = byname[name]
    if source == "diary": return [e["text"] for e in s["diaries"][c] if e["round"] == cycle]
    if source == "post": return [p["text"] for p in s["press"] if p["by"] == c and p["round"] == cycle]
    if source == "proposal": return [p["text"] or "" for p in s["proposals"] if p["by"] == c and p["round"] == cycle]
    raise SystemExit(f"unknown source {source}")
for q in d.get("quotes", []) + [q for cand in d.get("candidates", []) for q in cand.get("quotes", [])]:
    if not any(q["text"] in t for t in texts(q["name"], q["cycle"], q["source"])):
        raise SystemExit(f"not verbatim: {q}")
d["decidedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
d["decidedBy"] = "the session, by reading every diary entry, post and proposal of cycles 1–24 (dossier-day1.md)"
json.dump(d, open(os.path.join(root, "goal-check.json"), "w"), indent=1, ensure_ascii=False)
print("ok", d["world"], d["met"], d.get("aim"))
