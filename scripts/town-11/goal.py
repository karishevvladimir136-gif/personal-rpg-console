#!/usr/bin/env python3
"""TOWN_11 (TOWN_5's, unchanged but for its folder): writes a world's goal-check-c<cycle>.json from the session's reading of one day's
dossier (dossier-c<cycle>.md). Every quote is checked to be a verbatim substring of the cited diary entry / post /
proposal at the cited cycle in the world's state saved at the end of that day (world-c<cycle>.json.gz), and the cycle
must lie in that day, so nothing paraphrased or read from a later day can enter the record.
  python3 scripts/town-11/goal.py <decision.json> [--out <worlds folder>]
decision.json: {world, cycle, met, aims: [{aim, count, firstNaming, sixthNaming, names, activity?}], aim, rule, reading,
                candidates: [...], quotes: [{name, cycle, source, text}], worldAtDecision?}
"""
import gzip, json, sys, datetime, os

args = sys.argv[1:]
out = os.path.join(os.path.dirname(__file__), "..", "..", "docs", "runs", "town-11-worlds")
if "--out" in args:
    out = args[args.index("--out") + 1]
d = json.load(open(args[0]))
cycle = int(d["cycle"])
root = os.path.join(out, d["world"])
w = json.loads(gzip.open(os.path.join(root, f"world-c{cycle}.json.gz")).read())
s = w["state"]
if s["clock"]["round"] != cycle:
    raise SystemExit(f"world-c{cycle} is at cycle {s['clock']['round']}")
first = int(d.get("from", cycle - 23))  # a partial last day (a stopped world) gives its own first cycle
byname = {s["agents"][c]["name"]: c for c in s["citizens"]}
def texts(name, cyc, source):
    c = byname[name]
    if source == "diary": return [e["text"] for e in s["diaries"][c] if e["round"] == cyc]
    if source == "post": return [p["text"] for p in s["press"] if p["by"] == c and p["round"] == cyc]
    if source == "proposal": return [p["text"] or "" for p in s["proposals"] if p["by"] == c and p["round"] == cyc]
    raise SystemExit(f"unknown source {source}")
quotes = d.get("quotes", []) + [q for cand in d.get("candidates", []) + d.get("aims", []) for q in cand.get("quotes", [])]
for q in quotes:
    if not (first <= int(q["cycle"]) <= cycle):
        raise SystemExit(f"outside the day (cycles {first}–{cycle}): {q}")
    if not any(q["text"] in t for t in texts(q["name"], int(q["cycle"]), q["source"])):
        raise SystemExit(f"not verbatim: {q}")
d["decidedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
d["decidedBy"] = f"the session, by reading every diary entry, post and proposal of cycles {first}–{cycle} (dossier-c{cycle}.md); quotes machine-checked against world-c{cycle}.json.gz"
json.dump(d, open(os.path.join(root, f"goal-check-c{cycle}.json"), "w"), indent=1, ensure_ascii=False)
print("ok", d["world"], cycle, d["met"], d.get("aim"))
