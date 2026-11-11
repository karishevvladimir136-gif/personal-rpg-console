"""One unit = one (family, scenario, repeat): the scenario's prebuilt Mem0 store (copied), one search on the task text,
then the arms on that same store, each with its own fresh workplace:
  A  — the tool loop on Mem0 alone;
  B  — one whole-history read with AUTHORITY_1's fixed check line, handed to the loop;
  Bp — (B′) one whole-history read with the pointed line, handed to the loop;
  C  — one whole-history read with the frozen extraction prompt (the inferred graph), AUTHORITY_1's layer (walk + one
       mark call) scoped to what the search returned, and the marked memory handed to the loop;
  Cg — (C-gold) the same layer on the gold graph, no extraction call (diagnostic, 500 tier, one repeat).
The three whole-history reads of a unit share a byte-identical prefix: C's read goes first, B's and B′'s after it, so
a cached prefix serves them. Runs in a spawned, guarded worker; every paid call goes through the main process's
loopback gateway."""
from __future__ import annotations

import json
import re
import shutil
import threading
import time
import traceback
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from authority1 import layer
from authority1.scoring import parse_json

from . import prompts3 as P
from . import specs3 as K
from .score3 import link_quality, score
from .sim import Workplace
from .world import render

_PORT = None
_ANTH = {"opus", "haiku"}


def init_worker(port):
    global _PORT
    _PORT = port
    from authority1 import mem
    mem.prepare_env()


def post(path, body, timeout=1800):
    req = urllib.request.Request(f"http://127.0.0.1:{_PORT}{path}", data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json"})
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    with opener.open(req, timeout=timeout) as r:
        return json.loads(r.read())


def llm(spec, family, arm, lane, key, messages, max_tokens, extra=None, reasoning=None):
    body = {"spec": spec, "family": family, "arm": arm, "lane": lane, "key": key, "messages": messages,
            "max_tokens": max_tokens, "extra": extra, "reasoning": reasoning or K.REASONING}
    return post("/llm", body)


def _slim_call(r, lane):
    keep = ("text", "error", "stopped", "refused", "attempts", "latency_ms", "usage", "cost", "provider", "model",
            "finish_reason", "native_finish_reason")
    out = {k: r.get(k) for k in keep}
    out["lane"] = lane
    return out


# ---- Mem0 ------------------------------------------------------------------------------------------------------------
def mem_config(store_dir: Path, sid="none"):
    from authority1 import mem
    cfg = mem.config(store_dir, K.SPECS[K.MEMORY_LLM]["model"], _PORT, "unused")
    cfg["llm"]["config"]["openai_base_url"] = f"http://127.0.0.1:{_PORT}/mem0/backend~{K.MEMORY_LLM}~{sid}/v1"
    cfg["vector_store"]["config"]["collection_name"] = "authority3"
    return cfg


def open_store(store_dir: Path, sid="none"):
    from mem0 import Memory
    return Memory.from_config(mem_config(store_dir, sid))


def build_store(s, store_dir: Path):
    """The amendment: Mem0's own inference on, 25 events per `add`, in order, each event's line (with its date) as one
    message; the memory LLM is Haiku for every scenario. One ingestion per scenario; every arm-run gets a copy."""
    shutil.rmtree(store_dir, ignore_errors=True)
    store_dir.mkdir(parents=True)
    m = open_store(store_dir, s["id"])
    t = time.time()
    ev = s["events"]
    batches = []
    for k in range(0, len(ev), K.MEM0_BATCH):
        chunk = ev[k:k + K.MEM0_BATCH]
        meta = {"batch": k // K.MEM0_BATCH, "first": chunk[0]["eid"], "last": chunk[-1]["eid"],
                "from_date": chunk[0]["date"], "to_date": chunk[-1]["date"]}
        msgs = [{"role": "user", "content": render(e)} for e in chunk]
        info = {"batch": meta["batch"], "first": meta["first"], "last": meta["last"], "added": 0, "tries": 0, "error": None}
        for _ in range(3):   # a failed memory-LLM call (not an empty extraction) is asked again, at most twice
            info["tries"] += 1
            try:
                res = m.add(msgs, user_id="owner", metadata=meta, infer=True)
                info["added"] = len(res.get("results", res) if isinstance(res, dict) else res)
                info["error"] = None
                break
            except Exception as e:
                info["error"] = f"{type(e).__name__}: {str(e)[:200]}"
                time.sleep(5)
        batches.append(info)
    n = len(m.get_all(filters={"user_id": "owner"}, top_k=20000)["results"])
    del m
    return {"events": len(ev), "batches": len(batches), "memories": n, "failed_batches": [b for b in batches if b["error"]],
            "empty_batches": sum(1 for b in batches if not b["added"] and not b["error"]), "seconds": round(time.time() - t, 1)}


_WORD = re.compile(r"[a-z0-9]+")
_STOP = set("the a an of to and for on in at by with from is are was be this that it its as we our you your i".split())


def _toks(t):
    return {w for w in _WORD.findall((t or "").lower()) if w not in _STOP and len(w) > 1}


class Search:
    """Mem0's search; each memory is traced back (for the scorer's diagnostics and the layer only) to the events of its
    batch whose words it shares most — Mem0 rewrites the text, so the event ids are not in it."""

    def __init__(self, store_dir, s):
        self.m = open_store(store_dir, s["id"])
        self.lock = threading.Lock()
        self.ev = s["events"]
        self.pos = {e["eid"]: i for i, e in enumerate(self.ev)}
        self.tok = [_toks(e["text"]) for e in self.ev]

    def prov(self, text, md):
        a, b = self.pos.get(md.get("first")), self.pos.get(md.get("last"))
        if a is None or b is None:
            return []
        mt = _toks(text)
        sc = []
        for i in range(a, b + 1):
            et = self.tok[i]
            if et and mt:
                sc.append((len(et & mt) / len(et | mt), self.ev[i]["eid"]))
        sc.sort(reverse=True)
        if not sc or sc[0][0] < 0.12:
            return []
        return [x for v, x in sc if v >= 0.6 * sc[0][0]][:3]

    def __call__(self, query, k):
        q = str(query or "").strip()[:500]
        if not q:
            return []
        with self.lock:
            try:
                res = self.m.search(q, filters={"user_id": "owner"}, top_k=k)["results"]
            except ValueError:
                return []
        out = []
        for x in res:
            md = x.get("metadata") or {}
            pv = self.prov(x.get("memory"), md)
            out.append({"item_id": pv[0] if pv else None, "prov": pv, "batch": md.get("batch"), "text": x.get("memory"),
                        "score": round(float(x.get("score") or 0), 4)})
        return out


# ---- the layer (AUTHORITY_1's code, on an inferred or gold graph) ------------------------------------------------------
def pseudo_mems(s, graph):
    """The store as AUTHORITY_1's layer reads it: one entry per event, with kind / depends_on / revokes / expires taken
    from the graph handed in (inferred for C, gold for C-gold) — never from the scenario's roles."""
    ro, rp, en = graph.get("rests_on") or {}, graph.get("replaces") or {}, graph.get("ends") or {}
    out = []
    for e in s["events"]:
        i = e["eid"]
        out.append({"mem_id": i, "text": render(e), "item_id": i, "kind": "decision" if ro.get(i) else "state",
                    "item_date": e["date"], "source": e["from"], "depends_on": list(ro.get(i) or []),
                    "revokes": list(rp.get(i) or []), "expires": en.get(i)})
    return out


def scoped_walk(s, graph, retrieved_ids):
    w = layer.walk(pseudo_mems(s, graph), s["now"])
    R = set(retrieved_ids)
    rel = []
    for r in w["roots"]:
        if r in R or set(w["revoked_by"].get(r, [])) & R:
            rel.append(r)
    for d in w["walked"]:
        root = w["paths"][d][0]
        if d in R and root not in rel:
            rel.append(root)
    # one correction, one scope: whatever a relevant root's reviser revokes is relevant too
    revisers = {c for r in rel for c in w["revoked_by"].get(r, [])}
    for r in w["roots"]:
        if r not in rel and set(w["revoked_by"].get(r, [])) & revisers:
            rel.append(r)
    walked = [d for d in w["walked"] if w["paths"][d][0] in rel][: K.WALK_CAP]
    cut = {"items": w["items"], "revoked_by": w["revoked_by"], "expired": [x for x in w["expired"] if x in rel],
           "roots": rel, "walked": walked, "paths": {d: w["paths"][d] for d in walked}}
    return cut, {"roots_all": len(w["roots"]), "walked_all": len(w["walked"]), "roots": rel, "walked": walked}


def layer_note(w, marks, iid):
    items = w["items"]
    it = items.get(iid)
    if not it:
        return ""
    bits = []
    if iid in w["revoked_by"] and iid in w["roots"]:
        bits.append(f"revoked by {', '.join(w['revoked_by'][iid])} on {', '.join(items[c]['item_date'] for c in w['revoked_by'][iid])}")
    if iid in w["expired"]:
        bits.append(f"expired on {it['expires']}")
    if it["revokes"] and any(r in w["roots"] for r in it["revokes"]):
        bits.append(f"{iid}, {it['kind']} of {it['item_date']} (source: {it['source']}) — revokes {', '.join(it['revokes'])}")
    if iid in marks:
        bits.append(f"{marks[iid]['mark'].upper()} — {marks[iid]['why']}")
    elif iid in w["walked"]:
        bits.append("reached, not marked")
    return f"   [layer: {'; '.join(bits)}]" if bits else ""


def parse_graph(text, valid):
    """The extraction reply → {"rests_on", "replaces", "ends"} over known ids; a truncated reply is salvaged entry by entry."""
    obj = parse_json(text)
    out = {"rests_on": {}, "replaces": {}, "ends": {}}
    salvaged = False
    if not isinstance(obj, dict):
        salvaged = True
        obj = {}
        t = text or ""
        for key in ("rests_on", "replaces"):
            m = re.search(rf'"{key}"\s*:\s*\{{(.*?)(\}}\s*,\s*"(rests_on|replaces|ends)"|\Z)', t, re.S)
            body = m.group(1) if m else ""
            obj[key] = {a: re.findall(r'"(E\d{4})"', b) for a, b in re.findall(r'"(E\d{4})"\s*:\s*\[([^\]]*)\]', body)}
        m = re.search(r'"ends"\s*:\s*\{(.*?)(\}|\Z)', t, re.S)
        obj["ends"] = dict(re.findall(r'"(E\d{4})"\s*:\s*"(\d{4}-\d{2}-\d{2})"', m.group(1) if m else ""))
    for key in ("rests_on", "replaces"):
        for a, bs in (obj.get(key) or {}).items() if isinstance(obj.get(key), dict) else []:
            if a in valid and isinstance(bs, list):
                v = [b for b in bs if isinstance(b, str) and b in valid and b != a]
                if v:
                    out[key][a] = v
    for a, d in (obj.get("ends") or {}).items() if isinstance(obj.get("ends"), dict) else []:
        if a in valid and isinstance(d, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", d):
            out["ends"][a] = d
    return out, salvaged


# ---- whole-history reads ---------------------------------------------------------------------------------------------
def history_messages(s, spec, tail, cache=True):
    head = P.history_head(s) + "\n".join(render(e) for e in s["events"])
    if spec in _ANTH and cache:
        return [{"role": "user", "content": [{"type": "text", "text": head, "cache_control": {"type": "ephemeral"}},
                                             {"type": "text", "text": "\n\n" + tail}]}]
    return [{"role": "user", "content": head + "\n\n" + tail}]


def pass_tail(s, overview, line):
    return P.PASS_TAIL.format(frame=P.frame(s), records=P.RECORDS, overview=overview, task=P.task(s), line=line)


# ---- the tool loop ---------------------------------------------------------------------------------------------------
def loop(s, spec, family, arm, key, mem_block, handoff, search_fn):
    wp = Workplace(s["records"], s["consent"], s["owner"])
    parts = [P.frame(s), P.tools(s, K.TOP_K_TOOL, K.MAX_CALLS_PER_TURN, K.MAX_TURNS), P.RECORDS + "\n" + wp.overview(),
             mem_block]
    if handoff:
        parts.append(handoff)
    parts.append(P.task(s))
    first = "\n\n".join(parts)
    msgs = [{"role": "user", "content": first}]
    extra = {"cache_control": {"type": "ephemeral"}} if spec in _ANTH else None
    turns = []
    for t in range(K.MAX_TURNS):
        r = llm(spec, family, arm, f"{arm}.turn", f"{key}.{arm}.t{t + 1}", msgs, K.MAX_TOKENS["turn"], extra=extra)
        turns.append(_slim_call(r, f"{arm}.turn{t + 1}"))
        if r.get("text") is None or r.get("refused") or r.get("stopped"):
            break
        obj = parse_json(r["text"])
        calls = obj.get("calls") if isinstance(obj, dict) else None
        if isinstance(obj, dict) and calls is None and obj.get("tool"):
            calls = [obj]
        if not isinstance(calls, list):
            turns[-1]["results"] = [P.NOT_JSON]
            msgs += [{"role": "assistant", "content": r["text"]}, {"role": "user", "content": P.NOT_JSON}]
            continue
        res = []
        for i, c in enumerate(calls[: K.MAX_CALLS_PER_TURN]):
            c = c if isinstance(c, dict) else {}
            tool, args = str(c.get("tool") or ""), c.get("args") if isinstance(c.get("args"), dict) else {}
            if tool == "search_memory":
                out = search_fn(args.get("query"))
            else:
                out = wp.run(tool, args)
            res.append(f"{i + 1}. {tool}: {out}")
        if len(calls) > K.MAX_CALLS_PER_TURN:
            res.append(f"(only the first {K.MAX_CALLS_PER_TURN} calls were run)")
        turns[-1]["results"] = res
        if wp.finished is not None:
            break
        tail = "\n".join([P.RESULTS] + res)
        if t == K.MAX_TURNS - 2:
            tail += "\n" + P.LAST_TURN
        msgs += [{"role": "assistant", "content": r["text"]}, {"role": "user", "content": tail}]
    return {"first_prompt": first, "turns": turns, "state": wp.state()}


def _plain_lines(hits):
    return "\n".join(f"- {h['text']}" for h in hits) or "- (nothing)"


def plain_block(hits):
    return P.MEMORY_PLAIN + "\n" + _plain_lines(hits)


def plain_search(search):
    return lambda q: "\n" + _plain_lines(search(q, K.TOP_K_TOOL))


def layer_search(search, w, marks):
    return lambda q: "\n" + ("\n".join(f"- {h['text']}{layer_note(w, marks, h['item_id']) if h['item_id'] else ''}"
                                       for h in search(q, K.TOP_K_TOOL)) or "- (nothing)")


def run_layer(s, spec, family, arm, key, graph, hits):
    """AUTHORITY_1's layer on a graph: walk (scoped to what the search returned), one mark call, the marked block."""
    w, info = scoped_walk(s, graph, [x for h in hits for x in h["prov"]])
    calls, marks = [], {}
    if w["walked"]:
        p = layer.mark_prompt(s, w)
        mk = llm(spec, family, arm, f"{arm}.mark", f"{key}.{arm}.mark", [{"role": "user", "content": p}], K.MAX_TOKENS["mark"])
        c = _slim_call(mk, f"{arm}.mark")
        c["prompt"] = p
        calls.append(c)
        if mk.get("text") is None or mk.get("refused") or mk.get("stopped"):
            return None, calls, w, info, marks
        marks = layer.parse_marks(mk["text"])
    block = layer.annotate(s, [{"text": h["text"], "item_id": h["item_id"]} for h in hits], w, marks)
    return block, calls, w, info, marks


def _halted(calls):
    return any(c.get("text") is None or c.get("refused") or c.get("stopped") for c in calls)


def run_unit(family, s, repeat, store_src, work_root, spec=None, arms=None):
    spec = spec or family
    arms = arms or K.ARMS
    key = f"{s['id']}-r{repeat}"
    out = {"family": family, "spec": spec, "scenario": s["id"], "tier": s["tier"], "class": s["class"], "repeat": repeat,
           "key": key, "error": None, "arms": {}}
    store = Path(work_root) / "stores" / family / key
    shutil.rmtree(store, ignore_errors=True)
    t0 = time.time()
    try:
        shutil.copytree(store_src, store)
        search = Search(store, s)
        hits = search(s["task"], K.TOP_K_TASK)
        out["retrieval"] = hits
        hit_ids = {x for h in hits for x in h["prov"]}
        out["retrieval_diag"] = {"change": s["change"] in hit_ids,
                                 "touched": [d for d in s["gold"]["touched"] if d in hit_ids],
                                 "revoked": [x for x in s["gold"]["change_revokes"] if x in hit_ids]}
        valid = {e["eid"] for e in s["events"]}
        res = {}

        def arm_A():
            t = time.time()
            lp = loop(s, spec, family, "A", key, plain_block(hits), None, plain_search(search))
            return dict(lp, pre=[], wall_ms=int((time.time() - t) * 1000))

        read_done = threading.Event()

        def arm_pass(arm, line, handoff):
            t = time.time()
            try:
                r = llm(spec, family, arm, f"{arm}.pass", f"{key}.{arm}.pass",
                        history_messages(s, spec, pass_tail(s, Workplace(s["records"], [], s["owner"]).overview(), line)),
                        K.MAX_TOKENS["pass"])
            finally:
                if arm == "B":
                    read_done.set()
            pre = [_slim_call(r, f"{arm}.pass")]
            if _halted(pre):
                return {"pre": pre, "turns": [], "state": None, "halted_at": f"{arm}.pass", "wall_ms": int((time.time() - t) * 1000)}
            lp = loop(s, spec, family, arm, key, plain_block(hits), f"{handoff}\n{r['text'].strip()}", plain_search(search))
            return dict(lp, pre=pre, wall_ms=int((time.time() - t) * 1000))

        def arm_C(graph=None, arm="C", t=None):
            t = t or time.time()
            pre, salv = [], False
            if graph is None:
                return None
            block, calls, w, info, marks = run_layer(s, spec, family, arm, key, graph, hits)
            pre += calls
            lq = link_quality(s, graph)
            if block is None:
                return {"pre": pre, "turns": [], "state": None, "halted_at": f"{arm}.mark", "graph": graph,
                        "links": lq, "walk": info, "wall_ms": int((time.time() - t) * 1000)}
            lp = loop(s, spec, family, arm, key, block, None, layer_search(search, w, marks))
            return dict(lp, pre=pre, graph=graph, links=lq, walk=info, marks=marks, salvaged=salv,
                        wall_ms=int((time.time() - t) * 1000))

        def arm_C_full():
            t = time.time()
            r = llm(spec, family, "C", "C.extract", f"{key}.C.extract", history_messages(s, spec, P.EXTRACT, cache=False),
                    K.MAX_TOKENS["extract"], reasoning=K.EXTRACT_REASONING[spec])
            ex = _slim_call(r, "C.extract")
            if _halted([ex]):
                return {"pre": [ex], "turns": [], "state": None, "halted_at": "C.extract", "wall_ms": int((time.time() - t) * 1000)}
            graph, salv = parse_graph(r["text"], valid)
            ex["text"] = r["text"]
            rr = arm_C(graph, "C", t)
            rr["pre"] = [ex] + rr["pre"]
            rr["salvaged"] = salv
            return rr

        with ThreadPoolExecutor(5) as tp:
            futs = {}
            if "A" in arms:
                futs["A"] = tp.submit(arm_A)
            if "Cg" in arms:
                g = s["gold"]
                futs["Cg"] = tp.submit(arm_C, {"rests_on": g["rests_on"], "replaces": g["revokes"], "ends": g["ends"]}, "Cg")
            # B's whole-history read goes first; B′'s and C's start once it is back, so a cached prefix can serve them
            # (price only: Anthropic keeps a cache only between calls with the same thinking settings, so C's
            # extraction, run with thinking off or minimal, pays for its own read there)
            if "B" in arms:
                futs["B"] = tp.submit(arm_pass, "B", P.B_CHECK, P.B_CHECK_HANDOFF)
                read_done.wait(timeout=180)
            if "Bp" in arms:
                futs["Bp"] = tp.submit(arm_pass, "Bp", P.POINTED, P.POINTED_HANDOFF)
            if "C" in arms:
                futs["C"] = tp.submit(arm_C_full)
            for a, f in futs.items():
                res[a] = f.result()
        for a, r in res.items():
            st = r.get("state")
            r["score"] = score(s, st) if st else None
            calls = r.get("pre", []) + r.get("turns", [])
            r["cost"] = sum(c.get("cost") or 0 for c in calls)
            r["latency_ms"] = sum(c.get("latency_ms") or 0 for c in calls)
            r["n_calls"] = len(calls)
            r["tokens_in"] = sum((c.get("usage") or {}).get("prompt_tokens") or 0 for c in calls)
            r["tokens_out"] = sum((c.get("usage") or {}).get("completion_tokens") or 0 for c in calls)
            r["tokens_cached"] = sum((c.get("usage") or {}).get("cached_tokens") or 0 for c in calls)
            r["refused"] = any(c.get("refused") for c in calls)
            r["stopped"] = next((c["stopped"] for c in calls if c.get("stopped")), None)
            r["error"] = next((c["error"] for c in calls if c.get("error")), None)
        out["arms"] = res
    except Exception as e:
        out["error"] = f"{type(e).__name__}: {e}\n{traceback.format_exc()[-1500:]}"
    finally:
        from authority1 import guard
        out["guard"] = guard.report()
        out["wall_ms"] = int((time.time() - t0) * 1000)
        shutil.rmtree(store, ignore_errors=True)
    return out


def run_unit_job(args):
    family, s, repeat, store_src, work_root, spec, arms = args
    return run_unit(family, s, repeat, store_src, work_root, spec, arms)


def build_store_job(args):
    s, path = args
    return s["id"], build_store(s, Path(path))
