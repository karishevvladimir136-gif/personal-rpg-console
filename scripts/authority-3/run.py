"""AUTHORITY_3 runner. AUTHORITY_1's gateway, client, guard, layer and prompts are imported unchanged and hash-checked
against docs/runs/authority-1-freeze.json before every command. Run with the pinned venv beside the repo:
  /home/user/authority-1-mem0/.venv/bin/python -I scripts/authority-3/run.py <command>
Commands: check | build <set> | stores <set> | units <set> <family> [--arms] [--ids] [--repeats] | write | rate | admit |
          freeze | dry | family <f> | gold | judge <f> | spend | report
"""
from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import multiprocessing as mp
from collections import defaultdict
import sys
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
A1 = HERE.parent / "authority-1"
A2 = HERE.parent / "authority-2"
sys.path[:0] = [str(A1), str(A2), str(HERE)]

from authority1 import client  # noqa: E402  (reads the key before the environment is scrubbed)
from authority1 import guard  # noqa: E402

guard.install("main")
import os  # noqa: E402

for k in [k for k in os.environ if k.startswith("APP_")]:
    os.environ.pop(k)

from authority1 import prompts as P1  # noqa: E402
from authority1.scoring import parse_json  # noqa: E402
from authority3 import specs3 as K  # noqa: E402
from authority3 import prompts3 as P  # noqa: E402
from authority3 import world, validate3, score3  # noqa: E402

REPO = HERE.parent.parent
RUNS = REPO / "docs" / "runs"
WORK = Path(os.environ.get("AUTHORITY3_WORK", "/home/user/authority-3-work"))
DEV = HERE / "dev"
POOL = HERE / "pool"
CAND = POOL / "candidates"
BUILT = {"dev": WORK / "built-dev", "test": WORK / "built-test", "scratch": WORK / "built-scratch"}
STORES = {"dev": WORK / "stores-dev", "test": WORK / "stores-test", "scratch": WORK / "stores-scratch"}
UNITS = WORK / "units"
LEDGER = RUNS / "authority-3-ledger.jsonl"
CHECKS = RUNS / "authority-3-spend-checks.jsonl"
RESERVE_LOG = RUNS / "authority-3-reserve-6.jsonl"
FREEZE = RUNS / "authority-3-freeze.json"
A1_FREEZE = RUNS / "authority-1-freeze.json"
TEST_FILE = HERE / "scenarios" / "admitted.json"
LOG = WORK / "run.log"
LAYER_MARK_SHA = "d1c59ee09c612053172d9f4179921c02fd4452ecafc7d1bd465b24bb9b53975a"
UNITS_PER_BATCH = 7       # ≤ 28 calls a unit (A 6, B 1+6, B′ 1+6, C 2+6) → ≤ 196 calls a batch


def log(msg):
    line = f"{datetime.now(timezone.utc).strftime('%H:%M:%S')} {msg}"
    print(line, flush=True)
    WORK.mkdir(parents=True, exist_ok=True)
    with LOG.open("a") as f:
        f.write(line + "\n")


def sha(b: bytes):
    return hashlib.sha256(b).hexdigest()


def check_authority1():
    want = json.loads(A1_FREEZE.read_text())
    have = {k: sha(v.encode()) for k, v in P1.ALL.items()}
    bad = [k for k in want["prompts"] if want["prompts"][k] != have.get(k)]
    bad += [p for p, h in want["code"].items() if sha((A1 / p).read_bytes()) != h]
    if sha((A1 / "requirements.lock.txt").read_bytes()) != want["requirements_lock"]:
        bad.append("requirements.lock.txt")
    if sha(P1.LAYER_MARK.encode()) != LAYER_MARK_SHA:
        bad.append("LAYER_MARK")
    if bad:
        raise SystemExit(f"AUTHORITY_1 HARNESS CHANGED: {bad}")
    return {"layer_mark_sha256": LAYER_MARK_SHA, "authority1_prompts_all": want["prompts_all"], "checked": "identical"}


# ---- gateway, money --------------------------------------------------------------------------------------------------
CAP_OVERRIDE = None   # --cap: a lower cap for one process, so a family run beside another cannot spend the other's share


def start_gateway(embed=True):
    if not embed:
        _stub_embedder()
    from authority3.gateway3 import Gateway3
    RUNS.mkdir(parents=True, exist_ok=True)
    cap = min(K.CAP_USD, CAP_OVERRIDE) if CAP_OVERRIDE else K.CAP_USD
    gw = Gateway3(LEDGER, cap=cap)
    return gw, gw.serve()


def _stub_embedder():
    try:
        import fastembed  # noqa: F401
    except ImportError:
        import types
        stub = types.ModuleType("fastembed")

        class TextEmbedding:
            def __init__(self, *a, **k):
                pass

            def embed(self, texts):
                raise RuntimeError("no embedder here")
        stub.TextEmbedding = TextEmbedding
        sys.modules["fastembed"] = stub


class SpendCheckFailed(Exception):
    pass


KEY_BASE = 280.5466        # the key's credit when #6 and AUTHORITY_2 started (19:49 UTC, both sessions' first check)
KEY_BASE_USAGE = 1900 - KEY_BASE   # the key's cumulative usage then (robust to top-ups: usage only grows with spend)
A2_SPENT = 12.3419        # AUTHORITY_2's whole spend on the key (its report)
NEED_6 = 95.0 + 30.0 + 2.2147   # the owner's rule of 2026-11-11 01:58 UTC (#8): #6's own projection, subjects + judges, from $2.21


def reserve_6(credit=None, stage_spent=0.0):
    """The owner's rule (#8, 01:58 UTC): keep for #6 only its remaining projected need — ≈ $95 subjects + $30 judges,
    less what it has spent on the key since its $2.21 — not its ceiling. #6's spend is the larger of what it last
    reported and what the key shows (cumulative usage since $280.55, less AUTHORITY_2's and this stage's own spend)."""
    spent6, src, closed = 0.0, "no spend reported by #6", False
    if RESERVE_LOG.exists():
        rows = [json.loads(x) for x in RESERVE_LOG.read_text().splitlines() if x.strip()]
        if rows:
            spent6, src = float(rows[-1]["spent_6"]), rows[-1]["source"]
            closed = any(r.get("closed") for r in rows)
    if closed:
        return 0.0, f"#6 closed: {src}"
    if credit and credit.get("usage") is not None:
        on_key = credit["usage"] - KEY_BASE_USAGE - A2_SPENT - stage_spent
        if on_key > spent6:
            spent6, src = on_key, f"the key's usage since ${KEY_BASE} less AUTHORITY_2 and this stage (#6 last reported ${spent6:.2f}: {src})"
    return max(0.0, NEED_6 - spent6), src


def ledger_total():
    return sum(float(json.loads(x).get("cost") or 0) for x in LEDGER.read_text().splitlines() if x.strip()) if LEDGER.exists() else 0.0


def spend_check(gw, need, label):
    # the stage's spend is the whole ledger (every process of this stage), not this process's view of it
    with gw.lock:
        gw.spent = max(gw.spent, ledger_total())
    c = client.credits()
    res, src = reserve_6(c, gw.spent) if "error" not in c else (K.CEILING_6, "credit unreadable")
    avail = (c["left"] - res) if "error" not in c else None
    ok = avail is not None and avail >= need + 5 and gw.spent + need <= gw.cap
    row = {"at": datetime.now(timezone.utc).isoformat(timespec="seconds"), "before": label, "credit_left": c.get("left"),
           "reserve_for_6": round(res, 4), "reserve_source": src, "available": avail, "credit_error": c.get("error"),
           "stage_spent": round(gw.spent, 4), "projected": round(need, 2), "cap": gw.cap, "holds": ok}
    with CHECKS.open("a") as f:
        f.write(json.dumps(row) + "\n")
    log(f"spend check before {label}: credit ${c.get('left', float('nan')):.2f} less ${res:.2f} for #6 → "
        f"${avail if avail is not None else float('nan'):.2f}; stage ${gw.spent:.2f} of ${gw.cap}; projected ${need:.2f} → "
        f"{'holds' if ok else 'DOES NOT HOLD'}")
    return ok


# ---- scenarios -------------------------------------------------------------------------------------------------------
def cores(which):
    if which == "dev":
        out = []
        for p in sorted(DEV.glob("D*.json")):
            try:
                out.append(json.loads(p.read_text()))
            except Exception as e:
                log(f"{p.name}: unreadable ({e})")
        return out
    return json.loads(TEST_FILE.read_text())


def cmd_build(a):
    out = BUILT[a.set]
    out.mkdir(parents=True, exist_ok=True)
    bad = 0
    for c in cores(a.set):
        errs = validate3.validate(c)
        if errs:
            bad += 1
            log(f"{c['id']}: INVALID {errs[:4]}")
            continue
        s = world.build(c)
        (out / f"{s['id']}.json").write_text(json.dumps(s, ensure_ascii=False))
        toks = sum(len(world.render(e)) for e in s["events"]) // 4
        log(f"{s['id']}: tier {s['tier']} class {s['class']} — {len(s['events'])} events, change at {s['change_index'] + 1}, "
            f"{s['after_change']} after; {len(s['records'])} records; ≈{toks} tokens")
    log(f"build {a.set}: {bad} invalid")


def built(which, ids=None):
    ps = sorted(BUILT[which].glob("*.json"))
    ss = [json.loads(p.read_text()) for p in ps]
    return [s for s in ss if not ids or s["id"] in ids]


def cmd_stores(a):
    """One ingestion per scenario (the amendment): Mem0 with inference on, 25 events per add, Haiku as its LLM. Scenarios
    go in groups of ≤ 200 memory-LLM calls, with a spend check before each group."""
    gw, port = start_gateway()
    from authority3 import agent
    ss = built(a.set, set(a.ids.split(",")) if a.ids else None)
    STORES[a.set].mkdir(parents=True, exist_ok=True)
    todo = [s for s in ss if a.force or not (STORES[a.set] / s["id"] / "done.json").exists()]
    log(f"stores {a.set}: {len(todo)} to build")
    todo.sort(key=lambda s: -len(s["events"]))   # the longest first, so the workers stay busy to the end
    nb = lambda s: -(-len(s["events"]) // K.MEM0_BATCH)
    with ProcessPoolExecutor(max_workers=a.workers, mp_context=mp.get_context("spawn"), initializer=agent.init_worker,
                             initargs=(port,)) as ex:
        futs, sent, checked, it = {}, 0, 0, iter(todo)

        def submit():
            nonlocal sent, checked
            s = next(it, None)
            if s is None:
                return False
            if sent + nb(s) > checked:   # a spend check before every ≤ 200 memory-LLM calls submitted
                upto = sent + 200
                if not spend_check(gw, 200 * 0.006, f"ingestion calls {sent + 1}–{upto} (Haiku, memory LLM)"):
                    raise SystemExit("spend check does not hold")
                checked = upto
            futs[ex.submit(agent.build_store_job, (s, str(STORES[a.set] / s["id"])))] = s
            sent += nb(s)
            return True
        for _ in range(a.workers):
            if not submit():
                break
        while futs:
            f = next(as_completed(list(futs)))
            futs.pop(f)
            sid, info = f.result()
            (STORES[a.set] / sid / "done.json").write_text(json.dumps(info))
            log(f"store {sid}: {info['events']} events, {info['batches']} batches → {info['memories']} memories; "
                f"failed {len(info['failed_batches'])}, empty {info['empty_batches']}; {info['seconds']} s; spent ${gw.spent:.3f}")
            if gw.stop_reason:
                log(f"STOP: {gw.stop_reason}")
                return
            submit()


# ---- the pool ----------------------------------------------------------------------------------------------------------
def one(gw, spec, messages, *, family, arm, lane, key, max_tokens, reasoning):
    return gw.call(spec, messages, family=family, arm=arm, lane=lane, key=key, max_tokens=max_tokens, reasoning=reasoning)


def cmd_settings(a):
    from authority3 import pool3
    check_authority1()
    _stub_embedder()
    gw, _ = start_gateway(embed=False)
    POOL.mkdir(parents=True, exist_ok=True)
    for w in K.WRITERS:
        out = POOL / f"settings-{w}.json"
        if out.exists():
            continue
        if not spend_check(gw, 0.5, f"writer settings ({w}, 1 call)"):
            raise SystemExit("spend check does not hold")
        r = one(gw, w, [{"role": "user", "content": pool3.SETTINGS}], family="writer", arm=w, lane="settings",
                key=f"settings.{w}", max_tokens=K.MAX_TOKENS["write"], reasoning=K.WRITER_REASONING)
        obj = parse_json(r.get("text")) or {}
        st = [str(x).strip() for x in obj.get("settings", []) if str(x).strip()]
        out.write_text(json.dumps({"prompt": pool3.SETTINGS, "reply": r.get("text"), "settings": st, "provider": r.get("provider"),
                                   "model": r.get("model"), "cost": r.get("cost"), "error": r.get("error") or r.get("stopped"),
                                   "refused": r.get("refused")}, ensure_ascii=False, indent=1))
        log(f"settings {w}: {len(st)} (host {r.get('provider')}), ${r.get('cost', 0):.4f}")


def plan():
    slots = []
    for w in K.WRITERS:
        st = json.loads((POOL / f"settings-{w}.json").read_text())["settings"]
        i = 0
        for tier in (100, 500, 1000):
            for c in (1, 2, 3, 4):
                for n in range(1, K.WRITER_PLAN[tier][c] + 1):
                    slots.append({"id": f"{w[0].upper()}{tier}-{c}-{n:02d}", "writer": w, "tier": tier, "class": c,
                                  "idx": n - 1, "setting": st[i % len(st)]})
                    i += 1
    return slots


def write_one(gw, slot):
    from authority3 import pool3
    path = CAND / f"{slot['id']}.json"
    if path.exists():
        return json.loads(path.read_text())
    p = pool3.write_prompt(slot["tier"], slot["class"], slot["setting"], slot["idx"])
    msgs = [{"role": "user", "content": p}]
    rec = dict(slot, prompt_sha256=sha(p.encode()), rounds=[], core=None, errors=None, valid=False)
    for rnd in range(K.REPAIR_ROUNDS + 1):
        r = gw.call(slot["writer"], msgs, family="writer", arm=slot["writer"], lane="write" if rnd == 0 else "repair",
                    key=f"{slot['id']}.w{rnd}", max_tokens=K.MAX_TOKENS["write"], reasoning=K.WRITER_REASONING)
        rec["rounds"].append({"text": r.get("text"), "provider": r.get("provider"), "model": r.get("model"), "usage": r.get("usage"),
                              "cost": r.get("cost"), "finish": r.get("finish_reason"), "refused": r.get("refused"),
                              "error": r.get("error") or r.get("stopped"), "repair_prompt": msgs[-1]["content"] if rnd else None})
        if r.get("text") is None or r.get("refused") or r.get("stopped"):
            rec["errors"] = [f"no reply: {r.get('error') or r.get('stopped') or 'refused'}"]
            break
        c = pool3.normalise(parse_json(r["text"]), slot["id"], slot["tier"], slot["class"], slot["writer"])
        errs = pool3.check(c)
        rec["core"], rec["errors"] = c, errs
        if not errs:
            rec["valid"] = True
            break
        msgs = msgs + [{"role": "assistant", "content": r["text"]},
                       {"role": "user", "content": pool3.REPAIR.format(errors="\n".join(f"- {x}" for x in errs[:40]))}]
    path.write_text(json.dumps(rec, ensure_ascii=False, indent=1))
    return rec


def cmd_write(a):
    check_authority1()
    _stub_embedder()
    gw, _ = start_gateway(embed=False)
    CAND.mkdir(parents=True, exist_ok=True)
    slots = [s for s in plan() if not (CAND / f"{s['id']}.json").exists() and (not a.writer or s["writer"] == a.writer)]
    if a.only:
        slots = [s for s in slots if s["id"] in set(a.only.split(","))]
    log(f"write: {len(slots)} candidates to write")
    per = {"glm": 0.12, "kimi": 0.35}
    for b in range(0, len(slots), 60):
        batch = slots[b:b + 60]
        if not spend_check(gw, sum(per[s["writer"]] for s in batch), f"writers batch {b // 60 + 1} ({len(batch)} candidates, ≤ {3 * len(batch)} calls)"):
            raise SystemExit("spend check does not hold")
        with ThreadPoolExecutor(a.threads) as ex:
            futs = {ex.submit(write_one, gw, s): s for s in batch}
            for f in as_completed(futs):
                s = futs[f]
                try:
                    rec = f.result()
                    log(f"{s['id']}: valid={rec['valid']} rounds={len(rec['rounds'])} errors={(rec['errors'] or [])[:2]} spent=${gw.spent:.3f}")
                except Exception as e:
                    log(f"{s['id']}: crashed {type(e).__name__}: {e}")
        if gw.stop_reason:
            log(f"STOP: {gw.stop_reason}")
            return


def raters_for(rec):
    other = [w for w in K.WRITERS if w != rec["writer"]][0]
    return K.RATERS + [other]


def rate_one(gw, rec, rater):
    from authority3 import pool3
    p = pool3.rater_prompt(rec["core"])
    r = gw.call(rater, [{"role": "user", "content": p}], family="rater", arm=rater, lane="rate", key=f"{rec['id']}.{rater}",
                max_tokens=K.MAX_TOKENS["rate"], reasoning=K.RATER_REASONING)
    return {"text": r.get("text"), "parsed": pool3.parse_rating(r.get("text")), "provider": r.get("provider"),
            "model": r.get("model"), "usage": r.get("usage"), "cost": r.get("cost"), "refused": r.get("refused"),
            "error": r.get("error") or r.get("stopped"), "prompt_sha256": sha(p.encode())}


def cmd_rate(a):
    check_authority1()
    _stub_embedder()
    gw, _ = start_gateway(embed=False)
    recs = {}
    for p in sorted(CAND.glob("*.json")):
        try:
            recs[p.stem] = json.loads(p.read_text())
        except Exception:
            log(f"{p.name}: not readable yet; skipped")
    todo = [(cid, x) for cid, r in recs.items() if r["valid"] for x in raters_for(r)
            if not ((r.get("ratings") or {}).get(x) or {}).get("parsed")
            and len(((r.get("ratings") or {}).get(x) or {}).get("tries", [])) < 3]
    log(f"rate: {len(todo)} ratings to ask")
    per = {"astra": 0.12, "haiku": 0.01, "glm": 0.03, "kimi": 0.06}
    lock = __import__("threading").Lock()
    for b in range(0, len(todo), 180):
        batch = todo[b:b + 180]
        if not spend_check(gw, sum(per[x] for _, x in batch), f"raters batch {b // 180 + 1} ({len(batch)} calls)"):
            raise SystemExit("spend check does not hold")
        with ThreadPoolExecutor(a.threads) as ex:
            futs = {ex.submit(rate_one, gw, recs[cid], x): (cid, x) for cid, x in batch}
            for f in as_completed(futs):
                cid, x = futs[f]
                res = f.result()
                with lock:
                    prev = (recs[cid].get("ratings") or {}).get(x) or {}
                    res["tries"] = prev.get("tries", []) + [{"error": res["error"], "refused": res["refused"], "parsed": bool(res["parsed"])}]
                    recs[cid].setdefault("ratings", {})[x] = res
                    (CAND / f"{cid}.json").write_text(json.dumps(recs[cid], ensure_ascii=False, indent=1))
                log(f"{cid} {x}: {res['parsed'] and {k: v for k, v in res['parsed'].items() if k != 'reasons'}} err={res['error']} refused={res['refused']} spent=${gw.spent:.3f}")
        if gw.stop_reason:
            log(f"STOP: {gw.stop_reason}")
            return


def cmd_admit(a):
    from authority3 import pool3
    recs = [json.loads(p.read_text()) for p in sorted(CAND.glob("*.json"))]
    rows = []
    elig = {}
    for r in recs:
        rs = raters_for(r)
        ra = {x: ((r.get("ratings") or {}).get(x) or {}).get("parsed") for x in rs}
        marks = {x: pool3.mark(ra[x], r["class"]) for x in rs}
        votes = sum(marks.values())
        ok = r["valid"] and votes >= 2
        h = pool3.chash(r["core"]) if r["valid"] else None
        rows.append({"id": r["id"], "writer": r["writer"], "tier": r["tier"], "class": r["class"], "setting": r["setting"],
                     "valid": r["valid"], "errors": r["errors"], "rounds": len(r["rounds"]), "ratings": ra, "marks": marks,
                     "votes": votes, "eligible": ok, "hash": h})
        if ok:
            elig.setdefault((r["tier"], r["class"]), []).append((h, r))
    chosen = []
    for tier in (100, 500, 1000):
        for c in (1, 2, 3, 4):
            for h, r in sorted(elig.get((tier, c), []), key=lambda x: x[0])[: K.ADMIT[tier][c]]:
                chosen.append(r["core"])
                next(x for x in rows if x["id"] == r["id"])["admitted"] = True
    valid = [x for x in rows if x["valid"] and all(x["ratings"].values())]
    kap = {}
    for q in ("final_state_follows", "forces_act", "class", "tier_right", "change_hidden"):
        kap[q] = {"astra~haiku": pool3.cohen_kappa([x["ratings"]["astra"][q] for x in valid], [x["ratings"]["haiku"][q] for x in valid]),
                  "fleiss3": pool3.fleiss_kappa([[x["ratings"][k][q] for k in x["ratings"]] for x in valid])}
    kap["admission_mark"] = {"astra~haiku": pool3.cohen_kappa([x["marks"]["astra"] for x in valid], [x["marks"]["haiku"] for x in valid]),
                             "fleiss3": pool3.fleiss_kappa([list(x["marks"].values()) for x in valid])}
    TEST_FILE.parent.mkdir(parents=True, exist_ok=True)
    TEST_FILE.write_text(json.dumps(chosen, ensure_ascii=False, indent=1) + "\n")
    short = {f"{t}/{c}": K.ADMIT[t][c] - len([x for x in chosen if x["tier"] == t and x["class"] == c])
             for t in (100, 500, 1000) for c in (1, 2, 3, 4)}
    (POOL / "admission.json").write_text(json.dumps({"rows": rows, "kappa": kap, "shortfall": short,
                                                      "admitted": [x["id"] for x in chosen]}, ensure_ascii=False, indent=1))
    from authority3 import publish3
    publish3.pool_md(RUNS / "authority-3-pool.md", recs, json.loads((POOL / "admission.json").read_text()))
    log(f"admit: {len(chosen)} admitted; shortfall {short}; κ {json.dumps(kap)[:400]}")


# ---- units -----------------------------------------------------------------------------------------------------------
def unit_path(family, key, tag):
    return UNITS / tag / family / f"{key}.json"


def run_units(gw, port, family, scen, repeats, which, tag, arms, spec=None, workers=K.WORKERS):
    from authority3 import agent
    jobs = [(family, s, r, str(STORES[which] / s["id"]), str(WORK), spec, arms) for s in scen for r in range(1, repeats + 1)
            if not unit_path(family, f"{s['id']}-r{r}", tag).exists()]
    log(f"{tag}/{family}: {len(jobs)} units ({arms}), batches of {UNITS_PER_BATCH}, {workers} workers")
    for b in range(0, len(jobs), UNITS_PER_BATCH):
        batch = jobs[b:b + UNITS_PER_BATCH]
        if not spend_check(gw, projection(spec or family, batch, arms), f"{tag}/{family} batch {b // UNITS_PER_BATCH + 1} ({len(batch)} units)"):
            raise SpendCheckFailed(f"{tag}/{family} batch {b // UNITS_PER_BATCH + 1}")
        with ProcessPoolExecutor(max_workers=workers, mp_context=mp.get_context("spawn"), initializer=agent.init_worker,
                                 initargs=(port,)) as ex:
            futs = {ex.submit(agent.run_unit_job, j): j for j in batch}
            for f in as_completed(futs):
                j = futs[f]
                try:
                    u = f.result()
                except Exception as e:
                    log(f"{family} {j[1]['id']}-r{j[2]}: worker crashed: {e}")
                    continue
                stop = any(x.get("stopped") for x in u.get("arms", {}).values())
                if not u.get("error") and not stop:
                    p = unit_path(family, u["key"], tag)
                    p.parent.mkdir(parents=True, exist_ok=True)
                    p.write_text(json.dumps(u, ensure_ascii=False))
                log(f"{tag}/{family} {u['key']} T{u['tier']} c{u['class']} " + " ".join(
                    f"{k}:{_short(x)}" for k, x in u.get("arms", {}).items()) + f" err={(u.get('error') or '')[:160]} spent=${gw.spent:.3f}")
                if gw.stop_reason:
                    log(f"STOP: {gw.stop_reason}")
                    for g in futs:
                        g.cancel()
                    return False
    return not gw.stop_reason


def _short(x):
    sc = x.get("score")
    if not sc:
        return f"halted({x.get('halted_at') or x.get('error') or x.get('stopped')})"
    return (f"{'S' if sc['success'] else '-'}{'!' if sc['stale'] else ''}"
            f"p{sc['propagation'][0]}/{sc['propagation'][1]}b{sc['boundary'][0]}/{sc['boundary'][1]}"
            f"{'u' if sc['unnecessary'] else ''}{'x' if sc['no_consent'] else ''}${x.get('cost', 0):.3f}")


def projection(spec, batch, arms):
    """The batch's projected cost: the family's own mean cost per unit by tier (from its units already run, any set),
    else Haiku's token counts at the family's list price (cached input at a quarter, output doubled for reasoning);
    plus 25 %."""
    own = [json.loads(p.read_text()) for p in UNITS.glob(f"*/{spec}/*.json")]
    by_tier = {}
    for u in own:
        by_tier.setdefault(u["tier"], []).append(sum(r.get("cost", 0) for a, r in u["arms"].items() if a in arms))
    if by_tier:
        allv = [x for v in by_tier.values() for x in v]
        return 1.25 * sum((sum(by_tier.get(j[1]["tier"], allv)) / len(by_tier.get(j[1]["tier"], allv))) for j in batch)
    pr = K.SPECS[spec]["price"]
    ref = [json.loads(p.read_text()) for p in UNITS.glob("*/haiku/*.json")]
    if not ref:
        return len(batch) * {"haiku": 0.05, "deepseek": 0.3, "sol": 0.8, "opus": 1.6}.get(spec, 1.6)
    per_tier = {}
    for u in ref:
        tin = sum(r.get("tokens_in", 0) for a, r in u["arms"].items() if a in arms)
        tc = sum(r.get("tokens_cached", 0) for a, r in u["arms"].items() if a in arms)
        to = sum(r.get("tokens_out", 0) for a, r in u["arms"].items() if a in arms)
        per_tier.setdefault(u["tier"], []).append(((tin - tc) * pr["in"] + tc * pr["in"] * 0.25 + to * 2 * pr["out"]) / 1e6)
    allv = [x for v in per_tier.values() for x in v]
    return 1.25 * sum(sum(per_tier.get(j[1]["tier"], allv)) / len(per_tier.get(j[1]["tier"], allv)) for j in batch)


def cmd_units(a):
    check_authority1()
    ids = set(a.ids.split(",")) if a.ids else None
    scen = built(a.set, ids)
    arms = a.arms.split(",")
    gw, port = start_gateway()
    try:
        run_units(gw, port, a.family, scen, a.repeats, a.set, a.tag or a.set, arms, spec=a.family, workers=a.workers)
    except SpendCheckFailed as e:
        log(f"SPEND CHECK FAILED before {e}")
    log(f"done; stage spent ${gw.spent:.4f}; guard {json.dumps(guard.report())[:300]}")


def cmd_validate(a):
    from authority3 import pool3
    for f in a.files:
        c = json.loads(Path(f).read_text())
        errs = pool3.check(c)
        if errs:
            print(f"{f}: {len(errs)} problem(s)")
            for e in errs:
                print("  -", e)
            continue
        s = world.build(c)
        toks = sum(len(world.render(e)) for e in s["events"]) // 4
        print(f"{f}: valid — tier {s['tier']} class {s['class']}: {len(s['events'])} events, change at "
              f"{s['change_index'] + 1}, {s['after_change']} after; {len(s['records'])} records; ≈{toks} tokens")


def cmd_spec(a):
    from authority3 import pool3
    print(pool3.spec_for(int(a.tier)))


# ---- judging: only the third-party messages that carry both a stale and a current value -----------------------------
def judge_message(gw, s, st, amb, key):
    m = st["outbox"][amb["index"]]
    jp = score3.judge_prompt(s, m, amb)
    calls, votes = [], []
    for j in ("j1", "j2"):
        r = gw.call(K.JUDGE, [{"role": "user", "content": jp}], family="judge", arm="haiku", lane="judge", key=f"{key}.{j}",
                    max_tokens=K.MAX_TOKENS["judge"], reasoning=K.JUDGE_REASONING)
        o = parse_json(r.get("text"))
        v = o.get("passes_off_stale") if isinstance(o, dict) else None
        calls.append({"who": j, "text": r.get("text"), "refused": r.get("refused"), "error": r.get("error") or r.get("stopped"), "cost": r.get("cost")})
        votes.append(v if isinstance(v, bool) else None)
    if votes[0] is not None and votes[0] == votes[1]:
        return votes[0], "agree", calls
    rp = jp + f"\n\nTwo checkers answered {votes[0]} and {votes[1]}. Decide yourself."
    r = gw.call(K.REFEREE, [{"role": "user", "content": rp}], family="judge", arm=K.REFEREE, lane="referee", key=f"{key}.ref",
                max_tokens=K.MAX_TOKENS["judge"] * 4, reasoning=K.JUDGE_REASONING)
    o = parse_json(r.get("text"))
    v = o.get("passes_off_stale") if isinstance(o, dict) else None
    calls.append({"who": "referee", "text": r.get("text"), "refused": r.get("refused"), "error": r.get("error") or r.get("stopped"), "cost": r.get("cost")})
    return (v if isinstance(v, bool) else None), ("referee" if isinstance(v, bool) else "unresolved"), calls


def judge_units(gw, family, tag, scen):
    paths = sorted((UNITS / tag / family).glob("*.json"))
    todo = []
    for p in paths:
        u = json.loads(p.read_text())
        for a, r in u["arms"].items():
            sc = r.get("score")
            if sc and sc.get("ambiguous"):
                todo.append((p, a))
    log(f"judge {tag}/{family}: {len(todo)} arm-runs with ambiguous messages")
    for b in range(0, len(todo), 60):
        batch = todo[b:b + 60]
        if not spend_check(gw, 0.01 * len(batch), f"judge {tag}/{family} batch {b // 60 + 1} (≤ {3 * len(batch)} calls)"):
            raise SpendCheckFailed(f"judge {tag}/{family}")
        cache = {}
        for p, a in batch:
            cache.setdefault(p, json.loads(p.read_text()))

        def one_run(p, a):
            u = cache[p]
            r = u["arms"][a]
            s = scen[u["scenario"]]
            judged = dict((int(k), v) for k, v in (r.get("judged") or {}).items())
            log_ = r.setdefault("judge_calls", [])
            for amb in r["score"]["ambiguous"]:
                v, by, calls = judge_message(gw, s, r["state"], amb, f"{family}.{u['key']}.{a}.m{amb['index']}")
                log_.append({"index": amb["index"], "verdict": v, "by": by, "calls": calls})
                if v is not None:
                    judged[amb["index"]] = v
            r["judged"] = judged
            r["score"] = score3.score(s, r["state"], judged)
            r["cost_judge"] = sum(c.get("cost") or 0 for x in log_ for c in x["calls"])

        with ThreadPoolExecutor(8) as ex:
            for f in as_completed([ex.submit(one_run, p, a) for p, a in batch]):
                f.result()
        for p, u in cache.items():
            p.write_text(json.dumps(u, ensure_ascii=False))
        if gw.stop_reason:
            log(f"STOP during judging: {gw.stop_reason}")
            return False
    return True


def cmd_judge(a):
    gw, _ = start_gateway(embed=False)
    sc = {s["id"]: s for s in built(a.set)}
    if a.rescore:
        for p in sorted((UNITS / (a.tag or a.set) / a.family).glob("*.json")):
            u = json.loads(p.read_text())
            for r in u["arms"].values():
                if r.get("state"):
                    r.pop("judged", None)
                    r.pop("judge_calls", None)
                    r.pop("cost_judge", None)
                    r["score"] = score3.score(sc[u["scenario"]], r["state"])
            p.write_text(json.dumps(u, ensure_ascii=False))
    try:
        judge_units(gw, a.family, a.tag or a.set, sc)
    except SpendCheckFailed as e:
        log(f"SPEND CHECK FAILED before {e}")


# ---- freezes ----------------------------------------------------------------------------------------------------------
CODE3 = ["run.py", "WRITER_SPEC.md", "RATER_INSTRUMENT.md"] + [f"authority3/{x}" for x in
         ("specs3.py", "world.py", "validate3.py", "sim.py", "score3.py", "prompts3.py", "agent.py", "gateway3.py", "pool3.py")]
# report3.py and publish3.py only read results; they are not frozen
SPEC_FREEZE = RUNS / "authority-3-freeze-spec.json"


def spec_hashes():
    from authority3 import pool3
    dev = cores("dev")
    return {"authority1_harness": check_authority1(),
            "prompts3": {k: sha(v.encode()) for k, v in P.ALL.items()},
            "prompts_reused_from_authority1": {k: sha(v.encode()) for k, v in P.REUSED.items()},
            "writer_spec_by_tier": {t: sha(pool3.spec_for(t).encode()) for t in (100, 500, 1000)},
            "rater_instrument": sha(pool3.RATER_INSTRUMENT.encode()), "settings_prompt": sha(pool3.SETTINGS.encode()),
            "write_prompt": sha(pool3.WRITE.encode()), "repair_prompt": sha(pool3.REPAIR.encode()),
            "knobs": {k: getattr(K, k) for k in ("TIERS", "TOP_K_TASK", "TOP_K_TOOL", "MAX_TURNS", "MAX_CALLS_PER_TURN", "NEAR_SHARE",
                                                  "NOISE_RECORDS", "WALK_CAP", "MIN_AFTER_CHANGE", "MAX_TOKENS", "REASONING")},
            "developer_set": {c["id"]: sha(json.dumps(c, sort_keys=True, ensure_ascii=False).encode()) for c in dev},
            "code": {p: sha((HERE / p).read_bytes()) for p in CODE3 if p != "run.py"}}


def cmd_freeze_spec(a):
    SPEC_FREEZE.write_text(json.dumps(spec_hashes(), indent=1) + "\n")
    print(SPEC_FREEZE.read_text()[:2000])


def check_spec_freeze():
    want, have = json.loads(SPEC_FREEZE.read_text()), json.loads(json.dumps(spec_hashes()))
    if want != have:
        raise SystemExit(f"SPEC FREEZE MISMATCH in {[k for k in have if have[k] != want.get(k)]}")


def cmd_freeze(a):
    check_spec_freeze()
    test = cores("test")
    dev_ids = {c["id"] for c in cores("dev")}
    dev_text = {e["text"] for c in cores("dev") for e in c["events"]}
    overlap = [c["id"] for c in test if c["id"] in dev_ids or any(e["text"] in dev_text for e in c["events"])]
    if overlap:
        raise SystemExit(f"test set overlaps the developer set: {overlap}")
    out = {"spec_freeze": sha(SPEC_FREEZE.read_bytes()), "test_file": sha(TEST_FILE.read_bytes()),
           "test_ids": [c["id"] for c in test], "admission": sha((POOL / "admission.json").read_bytes()),
           "expected_states": sha(json.dumps({c["id"]: c["expect"] for c in test}, sort_keys=True).encode()),
           "gold_graphs": sha(json.dumps({c["id"]: [(e["id"], e.get("rests_on"), e.get("revokes"), e.get("mark")) for e in c["events"]] for c in test}, sort_keys=True).encode()),
           "run_py": sha((HERE / "run.py").read_bytes()), "overlap_with_developer_set": overlap}
    FREEZE.write_text(json.dumps(out, indent=1) + "\n")
    print(FREEZE.read_text())


def check_freeze():
    check_spec_freeze()
    want = json.loads(FREEZE.read_text())
    have = {"spec_freeze": sha(SPEC_FREEZE.read_bytes()), "test_file": sha(TEST_FILE.read_bytes()),
            "run_py": sha((HERE / "run.py").read_bytes())}
    bad = [k for k in have if have[k] != want.get(k)]
    if bad:
        raise SystemExit(f"FREEZE MISMATCH in {bad}")


# ---- the dry run and the families --------------------------------------------------------------------------------------
def dry_ids(scen):
    out = []
    for tier in (100, 500, 1000):
        ids = [s["id"] for s in scen if s["tier"] == tier and s["class"] in (1, 2, 3)]
        if ids:
            out.append(ids[0])
    return out


def cmd_dry(a):
    check_freeze()
    scen = built("test")
    ids = dry_ids(scen)
    gw, port = start_gateway()
    if not spend_check(gw, 1.0, f"dry run (Haiku, {len(ids)} scenarios × 4 arms)"):
        return
    ok = run_units(gw, port, "haiku", [s for s in scen if s["id"] in ids], 1, "test", "dry", K.ARMS, spec="haiku", workers=3)
    if ok:
        judge_units(gw, "haiku", "dry", {s["id"]: s for s in scen})
    from authority3 import publish3
    publish3.dry_md(RUNS / "authority-3-dry-run.md", load_units("dry", "haiku"), {s["id"]: s for s in scen})
    log(f"dry run done: {ids}; stage spent ${gw.spent:.4f}")


def cmd_family(a):
    check_freeze()
    fam = a.name
    assert fam in K.FAMILIES
    scen = built("test")
    # round-robin over the tiers (each tier in id order), so a family the money stops partway covers every tier evenly
    by_t = {t: sorted([s for s in scen if s["tier"] == t], key=lambda s: s["id"]) for t in (100, 500, 1000)}
    order, i = [], 0
    while any(by_t.values()):
        for t in (1000, 500, 100):
            if by_t[t] and (t != 1000 or i % 3 != 2):   # 18 : 30 : 29 — the 1,000 tier skips every third round
                order.append(by_t[t].pop(0))
        i += 1
    gw, port = start_gateway()
    try:
        if run_units(gw, port, fam, order, K.REPEATS, "test", "test", K.ARMS, spec=fam, workers=a.workers):
            judge_units(gw, fam, "test", {s["id"]: s for s in scen})
    except SpendCheckFailed as e:
        log(f"SPEND CHECK FAILED before {e} — stopped; post the balance in #8")
    log(f"{fam} done; stage spent ${gw.spent:.4f}; guard {json.dumps(guard.report())[:300]}")


def cmd_gold(a):
    check_freeze()
    scen = [s for s in built("test") if s["tier"] == 500]
    gw, port = start_gateway()
    for fam in (a.families.split(",") if a.families else K.FAMILIES):
        try:
            if not run_units(gw, port, fam, scen, 1, "test", "gold", [K.GOLD_ARM], spec=fam, workers=a.workers):
                break
            judge_units(gw, fam, "gold", {s["id"]: s for s in scen})
        except SpendCheckFailed as e:
            log(f"SPEND CHECK FAILED before {e} — stopped")
            break
    log(f"C-gold done; stage spent ${gw.spent:.4f}")


# ---- report ------------------------------------------------------------------------------------------------------------
def load_units(tag, fam):
    return [json.loads(p.read_text()) for p in sorted((UNITS / tag / fam).glob("*.json"))]


def cmd_report(a):
    from authority3 import report3 as R
    check_freeze()
    scen = {s["id"]: s for s in built("test")}
    fams = [f for f in K.FAMILIES if load_units("test", f)]
    units = [u for f in fams for u in load_units("test", f)]
    gunits = [u for f in K.FAMILIES for u in load_units("gold", f)]
    rows, grows = R.rows_of(units), R.rows_of(gunits)
    ledger = [json.loads(x) for x in LEDGER.read_text().splitlines() if x.strip()]
    checks = [json.loads(x) for x in CHECKS.read_text().splitlines() if x.strip()]
    adm = json.loads((POOL / "admission.json").read_text())
    total, spend_tbl = R.spend(ledger)
    blocked = [b for u in units + gunits for b in (u.get("guard") or {}).get("blocked", [])]
    targets = sorted({t for u in units + gunits for t in (u.get("guard") or {}).get("allowed_targets", {})})
    ctx = {"au0": f"spent ${total:.2f} of ${K.CAP_USD:.0f}; {len(blocked)} blocked egress attempts in the workers; worker connections only to "
                  f"{targets}; the test set frozen after the developer set (overlap {json.loads(FREEZE.read_text())['overlap_with_developer_set']}); "
                  "subjects' prompts carry only `[id | date | type | from sender] text` lines (C-gold's layer reads the gold graph by design)",
           "au0_verdict": "**held**" if total <= K.CAP_USD and not blocked else "**lost**"}
    bets, pooled = R.verdicts(rows, grows, fams, ctx)
    L = [f"# AUTHORITY_3 — report", ""]
    L += [Path(a.summary).read_text().strip(), ""] if a.summary else []
    L += ["## Bets", "", "| bet | numbers | parts | verdict |", "|---|---|---|---|"]
    for name, nums, parts, v in bets:
        L.append(f"| {name} | {nums} | {json.dumps(parts, ensure_ascii=False) if parts else '–'} | {v} |")
    L += ["", "## Bootstrap over scenarios within tier (1,000 resamples; point [2.5 %, 97.5 %], points)", "",
          "| scope | success A / B / B′ / C | C − A | C − B | C − B′ | stale A / C (cl. 1–3) | propagation A / B / B′ / C | B′ − B | C − B (prop.) |",
          "|---|---|---|---|---|---|---|---|---|"]
    scopes = [("all", None, None)] + [(f"tier {t}", t, None) for t in R.TIERS] + [(R.FAM[f], None, f) for f in fams]
    for label, t, f in scopes:
        rs = [r for r in rows if (t is None or r["tier"] == t) and (f is None or r["family"] == f) and r["arm"] in ("A", "B", "Bp", "C")]
        if not rs:
            continue
        b = R.boot(rs)
        L.append(f"| {label} | " + " / ".join(R.bci(b, f"success.{x}") for x in ("A", "B", "Bp", "C")) +
                 f" | {R.bci(b, 'success.C-A')} | {R.bci(b, 'success.C-B')} | {R.bci(b, 'success.C-Bp')} | "
                 f"{R.bci(b, 'stale.A')} / {R.bci(b, 'stale.C')} | " + " / ".join(R.bci(b, f"prop.{x}") for x in ("A", "B", "Bp", "C")) +
                 f" | {R.bci(b, 'prop.Bp-B')} | {R.bci(b, 'prop.C-B')} |")
    L += ["", "## By tier and arm (families pooled; Wilson 95 % in brackets)", ""]
    L.append(R.table([(f"{t} · {R.ARM_NAME[a]}", [r for r in rows if r["tier"] == t and r["arm"] == a]) for t in R.TIERS for a in ("A", "B", "Bp", "C")]))
    L += ["", "## By family, tier and arm", ""]
    L.append(R.table([(f"{R.FAM[f].split()[0]} {t} · {R.ARM_NAME[a]}", [r for r in rows if r["family"] == f and r["tier"] == t and r["arm"] == a])
                      for f in fams for t in R.TIERS for a in ("A", "B", "Bp", "C")]))
    L += ["", "## By class and arm (all tiers and families)", ""]
    L.append(R.table([(f"class {c} · {R.ARM_NAME[a]}", [r for r in rows if r["cls"] == c and r["arm"] == a]) for c in (1, 2, 3, 4) for a in ("A", "B", "Bp", "C")]))
    L += ["", "## C-gold on the 500 tier (one repeat) beside A and C", ""]
    L.append(R.table([(f"{R.FAM[f].split()[0]} 500 · {nm}", rs) for f in K.FAMILIES for nm, rs in
                      (("A", [r for r in rows if r["family"] == f and r["tier"] == 500 and r["arm"] == "A"]),
                       ("C", [r for r in rows if r["family"] == f and r["tier"] == 500 and r["arm"] == "C"]),
                       ("C-gold", [r for r in grows if r["family"] == f and r["arm"] == "Cg"]))]))
    L += ["", "## The inferred graph against the gold graph (arm C)", "", R.graph_table(rows), ""]
    diag = defaultdict(lambda: [0, 0, 0])
    for u in units:
        d = diag[(u["family"], u["tier"])]
        d[0] += 1
        d[1] += bool(u["retrieval_diag"]["change"])
        d[2] += bool(u["retrieval_diag"]["touched"])
    L += ["## Diagnostics", "", "- The search on the task text (top 10) returned the change in: " +
          "; ".join(f"{R.FAM[f].split()[0]} {t}: {v[1]}/{v[0]}" for (f, t), v in sorted(diag.items())),
          f"- Subject refusals: {sum(1 for r in rows + grows if r['refused'])}; arm-runs halted before the loop: "
          f"{sum(1 for r in rows + grows if not r['ok'])}; arm-runs still pending a message judgment: {sum(1 for r in rows + grows if r.get('pending'))}.",
          f"- Pool: {len(adm['rows'])} candidates, {sum(1 for x in adm['rows'] if x['valid'])} valid, {len(adm['admitted'])} admitted; shortfall {adm['shortfall']}."]
    L += ["", "## Worked examples (chosen by rule: first match in family order Opus, Sol, DeepSeek, then scenario id and repeat)", "",
          R.examples(units, scen, gunits), "", "## Spend by door", "",
          f"**OpenRouter ${total:.4f}** of the ${K.CAP_USD:.0f} ceiling (writers, raters, probes, dry run, developer runs, subjects, judges). Anthropic key $0, OpenAI key $0, Bedrock $0.", "",
          spend_tbl, "", f"Spend checks ({len(checks)}; held: {sum(1 for c in checks if c['holds'])}, did not hold: {sum(1 for c in checks if not c['holds'])}):", ""]
    L += [f"- {c['at']} before {c['before']}: credit ${c['credit_left']:.2f} less ${c['reserve_for_6']:.2f} for #6 → ${c['available'] or 0:.2f}; "
          f"stage ${c['stage_spent']:.2f}; projected ${c['projected']:.2f} → {'holds' if c['holds'] else 'DOES NOT HOLD'}" for c in checks if c.get("credit_left") is not None]
    if a.notes:
        L += ["", Path(a.notes).read_text().strip()]
    (RUNS / "authority-3-report.md").write_text("\n".join(L) + "\n")
    for tag, fl in (("test", fams), ("gold", K.FAMILIES), ("dry", ["haiku"]), ("dev", ["haiku", "deepseek", "sol", "opus"])):
        for f in fl:
            us = load_units(tag, f)
            if us:
                with gzip.open(RUNS / f"authority-3-units-{tag}-{f}.jsonl.gz", "wt") as g:
                    for u in us:
                        g.write(json.dumps(u, ensure_ascii=False) + "\n")
    log("report written")


# ---- projection (for the gate) ------------------------------------------------------------------------------------------
def cmd_project(a):
    """Projected cost of the paid families: each family's measured cost per unit (four arms, judging included) by tier,
    from its own calibration units on the developer set (`devfull`), times the stage's units; C-gold as C less its
    extraction; the 1,000-event tier on its own line (the gate: stop if it alone projects above $120)."""
    n_units = {100: 30 * K.REPEATS, 500: 30 * K.REPEATS, 1000: 20 * K.REPEATS}
    if a.counts:
        n_units = {t: int(x) * K.REPEATS for t, x in zip((100, 500, 1000), a.counts.split(","))}
    rows, tot, tier1000 = [], 0.0, 0.0
    for f in K.FAMILIES:
        us = load_units("devfull", f)
        by = {}
        for u in us:
            c = sum(r.get("cost", 0) + r.get("cost_judge", 0) for r in u["arms"].values())
            cg = sum(x.get("cost") or 0 for x in u["arms"].get("C", {}).get("pre", [])[1:]) + \
                 sum(x.get("cost") or 0 for x in u["arms"].get("C", {}).get("turns", []))
            by[u["tier"]] = (c, cg)
        if not by:
            continue
        line, ftot = [], 0.0
        for t in (100, 500, 1000):
            c, cg = by.get(t) or by[min(by, key=lambda x: abs(x - t))]
            cost = c * n_units[t] + (cg * (n_units[500] // K.REPEATS) if t == 500 else 0)
            ftot += cost
            if t == 1000:
                tier1000 += cost
            line.append((t, c, cost))
        tot += ftot
        rows.append((f, line, ftot))
    print("| family | $ per unit at 100 / 500 / 1,000 (four arms) | projected 100 | 500 (+ C-gold) | 1,000 | family total |")
    print("|---|---|---|---|---|---|")
    for f, line, ftot in rows:
        print(f"| {f} | " + " / ".join(f"{c:.3f}" for _, c, _ in line) + " | " + " | ".join(f"${x:.2f}" for _, _, x in line) + f" | ${ftot:.2f} |")
    print(f"\nall families: ${tot:.2f}; the 1,000-event tier alone: ${tier1000:.2f} (gate: $120)")


def cmd_check(a):
    print(json.dumps(check_authority1()))


def cmd_spend(a):
    _stub_embedder()
    gw, _ = start_gateway(embed=False)
    c = client.credits()
    gw.spent = max(gw.spent, ledger_total())
    print(json.dumps({"credit": c, "reserve_for_6": reserve_6(c, gw.spent), "stage_spent": gw.spent, "cap": gw.cap}))


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("check").set_defaults(fn=cmd_check)
    sp = sub.add_parser("build"); sp.add_argument("set"); sp.set_defaults(fn=cmd_build)
    sp = sub.add_parser("stores"); sp.add_argument("set"); sp.add_argument("--workers", type=int, default=4)
    sp.add_argument("--ids", default="")
    sp.add_argument("--force", action="store_true"); sp.set_defaults(fn=cmd_stores)
    sp = sub.add_parser("units"); sp.add_argument("set"); sp.add_argument("family"); sp.add_argument("--arms", default="A,B,Bp,C")
    sp.add_argument("--ids", default=""); sp.add_argument("--repeats", type=int, default=1); sp.add_argument("--tag", default="")
    sp.add_argument("--workers", type=int, default=7); sp.set_defaults(fn=cmd_units)
    sub.add_parser("spend").set_defaults(fn=cmd_spend)
    sub.add_parser("settings").set_defaults(fn=cmd_settings)
    sp = sub.add_parser("write"); sp.add_argument("--threads", type=int, default=12); sp.add_argument("--writer", default="")
    sp.add_argument("--only", default=""); sp.set_defaults(fn=cmd_write)
    sp = sub.add_parser("rate"); sp.add_argument("--threads", type=int, default=12); sp.set_defaults(fn=cmd_rate)
    sub.add_parser("admit").set_defaults(fn=cmd_admit)
    sp = sub.add_parser("judge"); sp.add_argument("set"); sp.add_argument("family"); sp.add_argument("--tag", default="")
    sp.add_argument("--rescore", action="store_true")
    sp.set_defaults(fn=cmd_judge)
    sub.add_parser("freeze-spec").set_defaults(fn=cmd_freeze_spec)
    sub.add_parser("freeze").set_defaults(fn=cmd_freeze)
    sub.add_parser("dry").set_defaults(fn=cmd_dry)
    sp = sub.add_parser("project"); sp.add_argument("--counts", default=""); sp.set_defaults(fn=cmd_project)
    sp = sub.add_parser("report"); sp.add_argument("--notes", default=""); sp.add_argument("--summary", default="")
    sp.set_defaults(fn=cmd_report)
    sp = sub.add_parser("family"); sp.add_argument("name"); sp.add_argument("--workers", type=int, default=7)
    sp.add_argument("--big-first", action="store_true"); sp.set_defaults(fn=cmd_family)
    sp = sub.add_parser("gold"); sp.add_argument("--families", default=""); sp.add_argument("--workers", type=int, default=7)
    sp.set_defaults(fn=cmd_gold)
    sp = sub.add_parser("validate"); sp.add_argument("files", nargs="+"); sp.set_defaults(fn=cmd_validate)
    sp = sub.add_parser("spec"); sp.add_argument("tier"); sp.set_defaults(fn=cmd_spec)
    ap.add_argument("--cap", type=float, default=None)
    a = ap.parse_args()
    global CAP_OVERRIDE
    CAP_OVERRIDE = a.cap
    a.fn(a)


if __name__ == "__main__":
    main()
