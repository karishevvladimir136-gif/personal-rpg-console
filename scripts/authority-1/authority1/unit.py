"""One unit = one (family, scenario, repeat): a fresh Mem0 store, the history seeded, the change taken in by Mem0's
own inference with the subject model, one search, then arms A, B and C on that same store. Runs in a worker process
(spawned, guarded); every paid call goes through the main process's loopback gateway."""
from __future__ import annotations

import json
import shutil
import time
import traceback
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from . import layer, mem, prompts, scoring
from .scenarios import history_sorted, render_item

_PORT = None


def init_worker(port):
    global _PORT
    _PORT = port
    mem.prepare_env()


def post(path, body, timeout=1800):
    req = urllib.request.Request(f"http://127.0.0.1:{_PORT}{path}", data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json"})
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    with opener.open(req, timeout=timeout) as r:
        return json.loads(r.read())


def llm(spec, family, arm, lane, key, content, max_tokens=None):
    return post("/llm", {"spec": spec, "family": family, "arm": arm, "lane": lane, "key": key,
                         "messages": [{"role": "user", "content": content}], "max_tokens": max_tokens})


def memory_plain(retrieval):
    return "\n".join([prompts.MEMORY_PLAIN, *[f"- {r['text']}" for r in retrieval]])


def arm_A(s, spec, family, key, retrieval):
    p = "\n\n".join([prompts.frame(s), memory_plain(retrieval), prompts.task_block(s), prompts.act_form(s)])
    t = time.time()
    act = llm(spec, family, "A", "A.act", key, p)
    return {"calls": [{"lane": "A.act", "prompt": p, **act}], "act": act, "wall_ms": int((time.time() - t) * 1000)}


def arm_B(s, spec, family, key, retrieval):
    t = time.time()
    p1 = "\n\n".join([prompts.frame(s), memory_plain(retrieval), prompts.task_block(s), prompts.B_CHECK])
    chk = llm(spec, family, "B", "B.pass", key, p1)
    calls = [{"lane": "B.pass", "prompt": p1, **chk}]
    if chk.get("text") is None or chk.get("refused"):
        return {"calls": calls, "act": None, "wall_ms": int((time.time() - t) * 1000), "halted_at": "B.pass"}
    p2 = "\n\n".join([prompts.frame(s), memory_plain(retrieval), prompts.task_block(s),
                      f"{prompts.B_CHECK_HANDOFF}\n{chk['text'].strip()}", prompts.act_form(s)])
    act = llm(spec, family, "B", "B.act", key, p2)
    calls.append({"lane": "B.act", "prompt": p2, **act})
    return {"calls": calls, "act": act, "wall_ms": int((time.time() - t) * 1000)}


def arm_C(s, spec, family, key, retrieval, all_mems):
    t = time.time()
    w = layer.walk(all_mems, s["now"])
    calls, marks = [], {}
    if w["walked"]:
        p1 = layer.mark_prompt(s, w)
        mk = llm(spec, family, "C", "C.pass", key, p1)
        calls.append({"lane": "C.pass", "prompt": p1, **mk})
        if mk.get("text") is None or mk.get("refused"):
            return {"calls": calls, "act": None, "walk": _walk_view(w), "wall_ms": int((time.time() - t) * 1000), "halted_at": "C.pass"}
        marks = layer.parse_marks(mk["text"])
    marked = layer.annotate(s, retrieval, w, marks)
    p2 = "\n\n".join([prompts.frame(s), marked, prompts.task_block(s), prompts.act_form(s)])
    act = llm(spec, family, "C", "C.act", key, p2)
    calls.append({"lane": "C.act", "prompt": p2, **act})
    return {"calls": calls, "act": act, "walk": _walk_view(w), "marks": marks, "wall_ms": int((time.time() - t) * 1000)}


def _walk_view(w):
    return {k: w[k] for k in ("revoked_by", "expired", "roots", "walked", "paths")}


def run_unit(family, s, repeat, stores_root, spec=None):
    spec = spec or family
    key = f"{s['id']}-r{repeat}"
    uid = s["owner"].lower().replace(" ", "_")
    from .specs import SPECS
    out = {"family": family, "spec": spec, "scenario": s["id"], "class": s["class"], "repeat": repeat, "key": key,
           "error": None, "arms": {}}
    store = Path(stores_root) / family / key
    shutil.rmtree(store, ignore_errors=True)
    t0 = time.time()
    try:
        m = mem.open_store(store, SPECS[spec]["model"], _PORT, f"{family}~{spec}~{key}")
        for it in history_sorted(s):
            m.add([{"role": "user", "content": render_item(it)}], user_id=uid, metadata=mem.meta_of(it), infer=False)
        out["seeded"] = len(s["items"])
        ti = time.time()
        try:
            res = m.add([{"role": "user", "content": render_item(s["change"])}], user_id=uid,
                        metadata=mem.meta_of(s["change"]), infer=True)
            out["ingest"] = {"results": res.get("results", res) if isinstance(res, dict) else res, "error": None}
        except Exception as e:
            out["ingest"] = {"results": [], "error": f"{type(e).__name__}: {e}"}
        out["ingest"]["ms"] = int((time.time() - ti) * 1000)
        out["ingest"]["mem0_calls"] = post("/mem0calls", {"key": f"{family}~{spec}~{key}"}).get("calls", [])
        retrieval = [mem.slim(x) for x in m.search(s["task"]["text"], filters={"user_id": uid}, top_k=mem.TOP_K)["results"]]
        all_mems = [mem.slim(x) for x in m.get_all(filters={"user_id": uid}, top_k=1000)["results"]]
        out["retrieval"] = retrieval
        out["store"] = all_mems
        out["change_in_store"] = any(x.get("item_id") == "C1" for x in all_mems)
        out["change_retrieved"] = any(x.get("item_id") == "C1" for x in retrieval)
        stopped = [c for c in out["ingest"]["mem0_calls"] if c.get("stopped")]
        if stopped:
            out["error"] = f"stopped at ingest: {stopped[0]['stopped']}"
            return out
        with ThreadPoolExecutor(3) as ex:
            fa = ex.submit(arm_A, s, spec, family, key, retrieval)
            fb = ex.submit(arm_B, s, spec, family, key, retrieval)
            fc = ex.submit(arm_C, s, spec, family, key, retrieval, all_mems)
            out["arms"] = {"A": fa.result(), "B": fb.result(), "C": fc.result()}
        for a, r in out["arms"].items():
            act = r.get("act") or {}
            r["reply"] = scoring.reply_of(act.get("text"), s) if act.get("text") else {"form_kept": False}
            r["mech"] = scoring.mechanical(s, r["reply"])
            r["cost"] = sum(c.get("cost") or 0 for c in r["calls"])
            r["latency_ms"] = sum(c.get("latency_ms") or 0 for c in r["calls"])
            r["refused"] = any(c.get("refused") for c in r["calls"])
            r["stopped"] = next((c["stopped"] for c in r["calls"] if c.get("stopped")), None)
            r["error"] = next((c["error"] for c in r["calls"] if c.get("error")), None)
    except Exception as e:
        out["error"] = f"{type(e).__name__}: {e}\n{traceback.format_exc()[-1500:]}"
    finally:
        from . import guard
        out["guard"] = guard.report()
        out["wall_ms"] = int((time.time() - t0) * 1000)
        shutil.rmtree(store, ignore_errors=True)
    return out


def run_unit_job(args):
    family, s, repeat, stores_root, spec = args
    return run_unit(family, s, repeat, stores_root, spec)
