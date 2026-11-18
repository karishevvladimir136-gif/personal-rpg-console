#!/usr/bin/env python3
"""TOWN_1: writes a world's outcomes.json or levels.json from the session's coding. Every quote ({name, cycle, source,
text}) is checked to be a verbatim substring of that citizen's diary entry / say / post / object / leave / propose text at
that cycle in the final world, so nothing paraphrased enters the record.
  python3 scripts/town-1/coding.py <coding.json>      (coding.json has "world" and "kind": "outcomes" | "levels")
"""
import gzip, json, sys, datetime, os

d = json.load(open(sys.argv[1]))
root = os.path.join(os.path.dirname(__file__), "..", "..", "docs", "runs", "town-1-worlds", d["world"])
w = json.loads(gzip.open(os.path.join(root, "world.json.gz")).read())
s = w["state"]
byname = {s["agents"][c]["name"]: c for c in s["citizens"]}
def texts(name, cycle, source):
    c = byname[name]
    if source == "diary": return [e["text"] for e in s["diaries"][c] if e["round"] == cycle]
    return [str(e["args"].get("text") or e["args"].get("reason") or "") for e in w["log"]
            if e["agent"] == c and e["round"] == cycle and e["tool"] == source and isinstance(e.get("args"), dict)]
def quotes(x):
    if isinstance(x, dict):
        if {"name", "cycle", "source", "text"} <= set(x): yield x
        for v in x.values(): yield from quotes(v)
    elif isinstance(x, list):
        for v in x: yield from quotes(v)
n = 0
for q in quotes(d):
    if not any(q["text"] in t for t in texts(q["name"], q["cycle"], q["source"])):
        raise SystemExit(f"not verbatim: {q}")
    n += 1
d["codedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
d["codedBy"] = "the session, from actions and world state (the event log, diaries, posts), never from silence"
json.dump(d, open(os.path.join(root, f"{d['kind']}.json"), "w"), indent=1, ensure_ascii=False)
print("ok", d["world"], d["kind"], n, "quotes")
