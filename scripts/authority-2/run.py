"""AUTHORITY_2 runner. AUTHORITY_1's harness (arms, layer, Mem0 unit, gateway, judge prompts) is imported unchanged
from scripts/authority-1 and hash-checked against docs/runs/authority-1-freeze.json before every command.
Run with the pinned venv beside the repo:
  /home/user/authority-1-mem0/.venv/bin/python -I scripts/authority-2/run.py <command>
Commands: check | probe | settings | write | rate | admit | freeze | dry | family <f> | judge <f> | report
"""
from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import multiprocessing as mp
import sys
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
A1 = HERE.parent / "authority-1"
sys.path.insert(0, str(A1))
sys.path.insert(0, str(HERE))

from authority1 import client  # noqa: E402  (reads the key before the environment is scrubbed)
from authority1 import guard  # noqa: E402

guard.install("main")
import os  # noqa: E402

for k in [k for k in os.environ if k.startswith("APP_")]:
    os.environ.pop(k)

from authority1 import prompts, scoring  # noqa: E402
from authority1 import posthoc as P1  # noqa: E402
from authority2 import specs2 as S  # noqa: E402  (adds GLM, Astra, Kimi to the shared SPECS)
from authority2 import oblig, pool  # noqa: E402

REPO = HERE.parent.parent
RUNS = REPO / "docs" / "runs"
WORK = Path(os.environ.get("AUTHORITY2_WORK", "/home/user/authority-2-work"))
UNITS = WORK / "units"
STORES = WORK / "stores"
POOL = HERE / "pool"
CAND = POOL / "candidates"
SCEN_FILE = HERE / "scenarios" / "admitted.json"
LEDGER = RUNS / "authority-2-ledger.jsonl"
CHECKS = RUNS / "authority-2-spend-checks.jsonl"
RESERVE_LOG = RUNS / "authority-2-reserve-6.jsonl"
FREEZE = RUNS / "authority-2-freeze.json"
A1_FREEZE = RUNS / "authority-1-freeze.json"
LOG = WORK / "run.log"
A1_POSTHOC_SHA = "ce8c7b5a556391109576ace0617271807a8491ea93b8041885664650a6d7890d"   # authority-1-freeze.md
A1_SUBSTANCE_PROMPT_SHA = "94b0dee61803b7db28a06cdc72031bf3cc9fa515710996cf751ab7ec2f0c3deb"
LAYER_MARK_SHA = "d1c59ee09c612053172d9f4179921c02fd4452ecafc7d1bd465b24bb9b53975a"
UNITS_PER_BATCH = 30      # ≤ 6 calls a unit (Mem0 1, A 1, B 2, C 2) → ≤ 180 calls
JUDGED_PER_BATCH = 60     # ≤ 3 calls an arm-run per judged question → ≤ 180 calls


def log(msg):
    line = f"{datetime.now(timezone.utc).strftime('%H:%M:%S')} {msg}"
    print(line, flush=True)
    WORK.mkdir(parents=True, exist_ok=True)
    with LOG.open("a") as f:
        f.write(line + "\n")


def sha(b: bytes):
    return hashlib.sha256(b).hexdigest()


# ---- AU0: AUTHORITY_1's harness, byte-identical ------------------------------------------------------------------------
def check_authority1():
    want = json.loads(A1_FREEZE.read_text())
    have_prompts = {k: sha(v.encode()) for k, v in prompts.ALL.items()}
    bad = [k for k in want["prompts"] if want["prompts"][k] != have_prompts.get(k)]
    bad += [p for p, h in want["code"].items() if sha((A1 / p).read_bytes()) != h]
    if sha((A1 / "requirements.lock.txt").read_bytes()) != want["requirements_lock"]:
        bad.append("requirements.lock.txt")
    if sha((A1 / "authority1/posthoc.py").read_bytes()) != A1_POSTHOC_SHA:
        bad.append("authority1/posthoc.py")
    if sha(P1.SUBSTANCE.encode()) != A1_SUBSTANCE_PROMPT_SHA:
        bad.append("posthoc.SUBSTANCE")
    if sha(prompts.LAYER_MARK.encode()) != LAYER_MARK_SHA:
        bad.append("LAYER_MARK")
    if bad:
        raise SystemExit(f"AUTHORITY_1 HARNESS CHANGED: {bad}")
    return {"layer_mark_sha256": LAYER_MARK_SHA, "authority1_prompts_all": want["prompts_all"], "checked": "identical"}


# ---- gateway, money --------------------------------------------------------------------------------------------------
def start_gateway(embed=True):
    if not embed:
        _stub_embedder()
    from authority1.gateway import Gateway
    RUNS.mkdir(parents=True, exist_ok=True)
    gw = Gateway(LEDGER, cap=S.CAP_USD)
    port = gw.serve()
    return gw, port


def _stub_embedder():
    """Pool commands (probe, settings, write, rate) never serve Mem0; they run without the venv's fastembed."""
    try:
        import fastembed  # noqa: F401
    except ImportError:
        import types
        stub = types.ModuleType("fastembed")

        class TextEmbedding:
            def __init__(self, *a, **k):
                pass

            def embed(self, texts):
                raise RuntimeError("no embedder in pool commands")
        stub.TextEmbedding = TextEmbedding
        sys.modules["fastembed"] = stub


class SpendCheckFailed(Exception):
    pass


def reserve_6():
    """#6's remaining ceiling: $150 less #6's last reported spend (recorded by the session in RESERVE_LOG)."""
    spent6, src = 0.0, "no spend reported by #6"
    if RESERVE_LOG.exists():
        rows = [json.loads(x) for x in RESERVE_LOG.read_text().splitlines() if x.strip()]
        if rows:
            spent6, src = float(rows[-1]["spent_6"]), rows[-1]["source"]
    return max(0.0, S.CEILING_6 - spent6), src


def spend_check(gw, need, label):
    c = client.credits()
    res, src = reserve_6()
    avail = (c["left"] - res) if "error" not in c else None
    ok = avail is not None and avail >= need + 5 and gw.spent + need <= gw.cap
    row = {"at": datetime.now(timezone.utc).isoformat(timespec="seconds"), "before": label, "credit_left": c.get("left"),
           "reserve_for_6": res, "reserve_source": src, "available": avail, "credit_error": c.get("error"),
           "stage_spent": round(gw.spent, 4), "projected": round(need, 2), "cap": gw.cap, "holds": ok}
    with CHECKS.open("a") as f:
        f.write(json.dumps(row) + "\n")
    log(f"spend check before {label}: credit left ${c.get('left', float('nan')):.2f}, less ${res:.2f} reserved for #6 → "
        f"${avail if avail is not None else float('nan'):.2f}; stage spent ${gw.spent:.2f} of ${gw.cap}; projected ${need:.2f} → {'holds' if ok else 'DOES NOT HOLD'}")
    return ok


def one(gw, spec, content, *, family, arm, lane, key, max_tokens, reasoning, messages=None):
    msgs = messages or [{"role": "user", "content": content}]
    return gw.call(spec, msgs, family=family, arm=arm, lane=lane, key=key, max_tokens=max_tokens, reasoning=reasoning)


# ---- probe: can each host be reached under the account's guardrails? ---------------------------------------------------
def cmd_probe(a):
    check_authority1()
    gw, _ = start_gateway(embed=False)
    if not spend_check(gw, 0.5, "probe (writer, raters)"):
        return
    for spec in (["glm", "astra", "kimi"] if not a.specs else a.specs.split(",")):
        r = one(gw, spec, "Reply with the single word: ready", family="probe", arm=spec, lane="probe", key=f"probe.{spec}",
                max_tokens=2000, reasoning={"effort": "low", "exclude": True})
        log(f"probe {spec}: host {r.get('provider')} model {r.get('model')} text {str(r.get('text'))[:40]!r} "
            f"err {r.get('error') or r.get('stopped')} cost ${r.get('cost', 0):.5f}")


# ---- the pool --------------------------------------------------------------------------------------------------------
def cmd_settings(a):
    check_authority1()
    gw, _ = start_gateway(embed=False)
    out = POOL / "settings.json"
    if out.exists():
        log("settings exist; not asking again")
        return
    if not spend_check(gw, 1.0, "writer settings (1 call)"):
        return
    r = one(gw, S.WRITER, pool.SETTINGS, family="writer", arm="glm", lane="settings", key="settings",
            max_tokens=S.WRITER_MAX_TOKENS, reasoning=S.WRITER_REASONING)
    obj = scoring.parse_json(r.get("text")) or {}
    st = [str(x).strip() for x in obj.get("settings", []) if str(x).strip()]
    POOL.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({"prompt": pool.SETTINGS, "reply": r.get("text"), "settings": st, "provider": r.get("provider"),
                               "model": r.get("model"), "cost": r.get("cost"), "error": r.get("error") or r.get("stopped"),
                               "refused": r.get("refused")}, ensure_ascii=False, indent=1))
    log(f"settings: {len(st)} from GLM (host {r.get('provider')}), ${r.get('cost', 0):.4f}")


def plan():
    """50 candidate slots: class sizes 12/12/14/12, settings dealt in GLM's own order."""
    st = json.loads((POOL / "settings.json").read_text())["settings"]
    slots, i = [], 0
    for c in (1, 2, 3, 4):
        for n in range(1, S.N_CANDIDATES[c] + 1):
            slots.append({"id": f"G{c}-{n:02d}", "class": c, "idx": n - 1, "setting": st[i % len(st)]})
            i += 1
    return slots


def write_one(gw, slot):
    path = CAND / f"{slot['id']}.json"
    if path.exists():
        return json.loads(path.read_text())
    p = pool.write_prompt(slot["class"], slot["setting"], slot["idx"])
    msgs = [{"role": "user", "content": p}]
    rec = {"id": slot["id"], "class": slot["class"], "setting": slot["setting"], "prompt_sha256": sha(p.encode()),
           "rounds": [], "scenario": None, "errors": None, "valid": False}
    for rnd in range(S.REPAIR_ROUNDS + 1):
        r = gw.call(S.WRITER, msgs, family="writer", arm="glm", lane="write" if rnd == 0 else "repair",
                    key=f"{slot['id']}.w{rnd}", max_tokens=S.WRITER_MAX_TOKENS, reasoning=S.WRITER_REASONING)
        rec["rounds"].append({"text": r.get("text"), "provider": r.get("provider"), "model": r.get("model"),
                              "usage": r.get("usage"), "cost": r.get("cost"), "finish": r.get("finish_reason"),
                              "refused": r.get("refused"), "error": r.get("error") or r.get("stopped"),
                              "repair_prompt": msgs[-1]["content"] if rnd else None})
        if r.get("text") is None or r.get("refused") or r.get("stopped"):
            rec["errors"] = [f"no reply: {r.get('error') or r.get('stopped') or 'refused'}"]
            break
        s = pool.normalise(scoring.parse_json(r["text"]), slot["id"], slot["class"])
        errs = pool.check(s)
        rec["scenario"], rec["errors"] = s, errs
        if not errs:
            rec["valid"] = True
            break
        msgs = msgs + [{"role": "assistant", "content": r["text"]},
                       {"role": "user", "content": pool.REPAIR.format(errors="\n".join(f"- {x}" for x in errs[:40]))}]
    path.write_text(json.dumps(rec, ensure_ascii=False, indent=1))
    return rec


def cmd_write(a):
    check_authority1()
    gw, _ = start_gateway(embed=False)
    CAND.mkdir(parents=True, exist_ok=True)
    slots = [s for s in plan() if not (CAND / f"{s['id']}.json").exists()]
    log(f"write: {len(slots)} candidates to write (≤ {len(slots) * (S.REPAIR_ROUNDS + 1)} calls)")
    if not slots:
        return
    if not spend_check(gw, len(slots) * (S.REPAIR_ROUNDS + 1) * 0.05, f"writer ({len(slots)} candidates, ≤ {len(slots) * 3} calls)"):
        raise SystemExit("spend check does not hold")
    with ThreadPoolExecutor(a.threads) as ex:
        futs = {ex.submit(write_one, gw, s): s for s in slots}
        for f in as_completed(futs):
            s = futs[f]
            try:
                rec = f.result()
                log(f"{s['id']}: valid={rec['valid']} rounds={len(rec['rounds'])} errors={(rec['errors'] or [])[:2]} spent=${gw.spent:.3f}")
            except Exception as e:
                log(f"{s['id']}: crashed {type(e).__name__}: {e}")
            if gw.stop_reason:
                log(f"STOP: {gw.stop_reason}")


def rate_one(gw, rec, rater):
    if rec.get("ratings", {}).get(rater):
        return rec["ratings"][rater]
    p = pool.rater_prompt(rec["scenario"])
    r = gw.call(rater, [{"role": "user", "content": p}], family="rater", arm=rater, lane="rate", key=f"{rec['id']}.{rater}",
                max_tokens=S.RATER_MAX_TOKENS, reasoning=S.RATER_REASONING)
    return {"text": r.get("text"), "parsed": pool.parse_rating(r.get("text")), "provider": r.get("provider"),
            "model": r.get("model"), "usage": r.get("usage"), "cost": r.get("cost"), "refused": r.get("refused"),
            "error": r.get("error") or r.get("stopped"), "prompt_sha256": sha(p.encode())}


def cmd_rate(a):
    check_authority1()
    gw, _ = start_gateway(embed=False)
    recs = [json.loads(p.read_text()) for p in sorted(CAND.glob("G*.json"))]
    todo = [(r, x) for r in recs if r["valid"] for x in S.RATERS if not (r.get("ratings") or {}).get(x)]
    log(f"rate: {len(todo)} ratings to ask")
    if not todo:
        return
    if not spend_check(gw, sum(0.6 if x == "astra" else 0.25 for _, x in todo), f"raters ({len(todo)} calls)"):
        raise SystemExit("spend check does not hold")
    by_id = {r["id"]: r for r in recs}
    with ThreadPoolExecutor(a.threads) as ex:
        futs = {ex.submit(rate_one, gw, r, x): (r["id"], x) for r, x in todo}
        for f in as_completed(futs):
            cid, x = futs[f]
            res = f.result()
            by_id[cid].setdefault("ratings", {})[x] = res
            (CAND / f"{cid}.json").write_text(json.dumps(by_id[cid], ensure_ascii=False, indent=1))
            log(f"{cid} {x}: {res['parsed']} err={res['error']} refused={res['refused']} spent=${gw.spent:.3f}")


def cmd_admit(a):
    recs = [json.loads(p.read_text()) for p in sorted(CAND.glob("G*.json"))]
    rows, admitted = [], {c: [] for c in (1, 2, 3, 4)}
    for r in recs:
        ra = {x: ((r.get("ratings") or {}).get(x) or {}).get("parsed") for x in S.RATERS}
        marks = {x: pool.admitted_mark(ra[x], r["class"]) for x in S.RATERS}
        ok = r["valid"] and all(marks.values())
        h = pool.chash(r["scenario"]) if r["valid"] else None
        rows.append({"id": r["id"], "class": r["class"], "setting": r["setting"], "valid": r["valid"], "errors": r["errors"],
                     "rounds": len(r["rounds"]), "ratings": ra, "marks": marks, "eligible": ok, "hash": h})
        if ok:
            admitted[r["class"]].append((h, r["scenario"]))
    chosen = []
    for c in (1, 2, 3, 4):
        pick = sorted(admitted[c], key=lambda x: x[0])[: S.N_ADMIT]
        for h, s in pick:
            chosen.append(s)
            next(x for x in rows if x["id"] == s["id"])["admitted"] = True
    # κ over candidates both raters rated
    both = [x for x in rows if x["valid"] and all(x["ratings"][k] for k in S.RATERS)]
    kap = {}
    for q in ("truth_follows", "forces_act", "class", "distractor"):
        kap[q] = pool.cohen_kappa([x["ratings"]["astra"][q] for x in both], [x["ratings"]["kimi"][q] for x in both])
    kap["admission_mark"] = pool.cohen_kappa([x["marks"]["astra"] for x in both], [x["marks"]["kimi"] for x in both])
    SCEN_FILE.parent.mkdir(parents=True, exist_ok=True)
    SCEN_FILE.write_text(json.dumps(chosen, ensure_ascii=False, indent=1) + "\n")
    (POOL / "admission.json").write_text(json.dumps({"rows": rows, "kappa": kap,
                                                      "admitted_by_class": {c: [s["id"] for s in chosen if s["class"] == c] for c in (1, 2, 3, 4)}},
                                                     ensure_ascii=False, indent=1))
    from authority2 import publish
    publish.pool_md(RUNS / "authority-2-pool.md", recs, rows, kap, chosen)
    log(f"admit: {len(chosen)} admitted " + str({c: len([s for s in chosen if s['class'] == c]) for c in (1, 2, 3, 4)}) + f"; κ {kap}")


# ---- freeze ----------------------------------------------------------------------------------------------------------
FROZEN2 = ["run.py", "authority2/specs2.py", "authority2/pool.py", "authority2/validate.py", "authority2/oblig.py",
           "authority2/stats.py", "WRITER_SPEC.md", "RATER_INSTRUMENT.md"]


def freeze_hashes():
    sc = json.loads(SCEN_FILE.read_text())
    return {
        "authority1_harness": check_authority1(),
        "scenarios_file": sha(SCEN_FILE.read_bytes()),
        "scenarios_all": sha(json.dumps(sc, sort_keys=True, ensure_ascii=False).encode()),
        "truth_tables": sha(json.dumps({s["id"]: s["truth"] for s in sc}, sort_keys=True, ensure_ascii=False).encode()),
        "scenario_ids": [s["id"] for s in sc],
        "prompts_authority2": {"WRITER_SPEC": sha(pool.WRITER_SPEC.encode()), "RATER_INSTRUMENT": sha(pool.RATER_INSTRUMENT.encode()),
                               "SETTINGS": sha(pool.SETTINGS.encode()), "WRITE": sha(pool.WRITE.encode()), "REPAIR": sha(pool.REPAIR.encode()),
                               "OBLIGATION": sha(oblig.OBLIGATION.encode()), "OBLIGATION_REFEREE": sha(oblig.REFEREE.encode())},
        "prompts_reused_from_authority1": {"JUDGE": sha(prompts.JUDGE.encode()), "REFEREE": sha(prompts.REFEREE.encode()),
                                           "SUBSTANCE": sha(P1.SUBSTANCE.encode()), "SUBSTANCE_REFEREE": sha(P1.REFEREE.encode())},
        "code": {p: sha((HERE / p).read_bytes()) for p in FROZEN2},
        "admission": sha((POOL / "admission.json").read_bytes()),
    }


def cmd_freeze(a):
    sc = json.loads(SCEN_FILE.read_text())
    from authority2.validate import validate
    errs = [x for s in sc for x in validate(s)]
    if errs:
        raise SystemExit(f"admitted scenarios fail validation: {errs[:5]}")
    FREEZE.write_text(json.dumps(freeze_hashes(), indent=1) + "\n")
    print(FREEZE.read_text())


def check_freeze():
    if not FREEZE.exists():
        raise SystemExit("no freeze file: run `freeze` and commit it first")
    want, have = json.loads(FREEZE.read_text()), freeze_hashes()
    if want != have:
        raise SystemExit(f"FREEZE MISMATCH in {[k for k in have if have[k] != want.get(k)]}")


def load_scen():
    return {s["id"]: s for s in json.loads(SCEN_FILE.read_text())}


# ---- units -----------------------------------------------------------------------------------------------------------
def pool_exec(port, n):
    from authority1 import unit
    return ProcessPoolExecutor(max_workers=n, mp_context=mp.get_context("spawn"), initializer=unit.init_worker, initargs=(port,))


def unit_path(family, key):
    return UNITS / family / f"{key}.json"


def projection(family, n_units):
    """Per-unit cost from the dry run's tokens at the family's price, output doubled for reasoning, plus judging."""
    dry = sorted((UNITS / "haiku").glob("*.json"))
    if not dry:
        return n_units * 0.6
    tin = tout = 0
    for p in dry:
        u = json.loads(p.read_text())
        calls = [c for x in u["arms"].values() for c in x["calls"]] + u["ingest"]["mem0_calls"]
        tin += sum((c.get("usage") or {}).get("prompt_tokens") or 0 for c in calls)
        tout += sum((c.get("usage") or {}).get("completion_tokens") or 0 for c in calls)
    pr = S.SPECS[family]["price"]
    per = (tin / len(dry) * pr["in"] + tout / len(dry) * 2 * pr["out"]) / 1e6
    return n_units * (per * 1.25 + 0.03)


def run_units(gw, port, family, scenarios, repeats, spec=None, workers=S.WORKERS):
    jobs = [(family, s, r, str(STORES), spec) for r in range(1, repeats + 1) for s in scenarios
            if not unit_path(family, f"{s['id']}-r{r}").exists()]
    log(f"{family}: {len(jobs)} units to run ({workers} workers), in batches of {UNITS_PER_BATCH}")
    for b in range(0, len(jobs), UNITS_PER_BATCH):
        batch = jobs[b:b + UNITS_PER_BATCH]
        if not spend_check(gw, projection(spec or family, len(batch)), f"{family} units batch {b // UNITS_PER_BATCH + 1} ({len(batch)} units)"):
            raise SpendCheckFailed(f"{family} units batch {b // UNITS_PER_BATCH + 1}")
        if not _run_batch(gw, port, family, batch, workers):
            return False
    return not gw.stop_reason


def _run_batch(gw, port, family, jobs, workers):
    from authority1 import unit
    with pool_exec(port, workers) as ex:
        futs, it = {}, iter(jobs)
        for _ in range(workers):
            j = next(it, None)
            if j:
                futs[ex.submit(unit.run_unit_job, j)] = j
        while futs:
            for f in as_completed(list(futs)):
                j = futs.pop(f)
                try:
                    u = f.result()
                except Exception as e:
                    log(f"{family} {j[1]['id']}-r{j[2]}: worker crashed: {e}")
                    u = None
                if u:
                    arm_stop = any(x.get("stopped") for x in u.get("arms", {}).values())
                    if not u.get("error") and not arm_stop:
                        p = unit_path(family, u["key"])
                        p.parent.mkdir(parents=True, exist_ok=True)
                        p.write_text(json.dumps(u, ensure_ascii=False))
                    summ = " ".join(f"{k}:{(x.get('mech') or {}).get('action') or '-'}{'!' if x.get('refused') else ''}" for k, x in u.get("arms", {}).items())
                    log(f"{family} {u['key']} ingest={'ok' if u.get('change_in_store') else 'LOST'} {summ} err={(u.get('error') or '')[:120]} spent=${gw.spent:.3f}")
                if gw.stop_reason:
                    log(f"STOP: {gw.stop_reason}")
                    for g in futs:
                        g.cancel()
                    return False
                nj = next(it, None)
                if nj:
                    futs[ex.submit(unit.run_unit_job, nj)] = nj
                break
    return not gw.stop_reason


# ---- judging: AUTHORITY_1's judge prompt (Haiku ×2), referee Kimi (the amendment) ----------------------------------------
def _ref_fields(text, fields, asked):
    """Read a referee reply field by field (AUTHORITY_1's post-hoc parser fix, adopted here before any run)."""
    obj = scoring.parse_json(text)
    if not isinstance(obj, dict):
        return None
    out = {}
    for fld in fields:
        if fld not in obj:
            return None
        if fld == "direction":
            d = obj["direction"] if isinstance(obj["direction"], dict) else {}
            if not set(asked) <= set(d):
                return None
            out["direction"] = {k: bool(d[k]) for k in asked}
        else:
            out[fld] = sorted(set(str(x) for x in obj[fld] or []))
    return out


def judge_run(gw, s, u, arm):
    r = u["arms"][arm]
    mech = r.get("mech") or {}
    if not mech.get("form_kept"):
        return None
    jp = scoring.judge_prompt(s, r["reply"], mech)
    asked = mech["touched_listed"]
    fam, key = u["family"], f"{u['family']}.{u['key']}.{arm}"
    j1 = gw.call(S.JUDGE, [{"role": "user", "content": jp}], family=f"judge.{fam}", arm="haiku", lane="judge", key=key + ".j1")
    j2 = gw.call(S.JUDGE, [{"role": "user", "content": jp}], family=f"judge.{fam}", arm="haiku", lane="judge", key=key + ".j2")
    a, b = scoring.parse_judge(j1.get("text"), asked), scoring.parse_judge(j2.get("text"), asked)
    out = {"j1": {"text": j1.get("text"), "refused": j1.get("refused"), "error": j1.get("error") or j1.get("stopped")},
           "j2": {"text": j2.get("text"), "refused": j2.get("refused"), "error": j2.get("error") or j2.get("stopped")},
           "a": a, "b": b, "cost": (j1.get("cost") or 0) + (j2.get("cost") or 0)}
    if a and b and a == b:
        return dict(out, final=a, by="agree")
    if not a or not b:
        fields = ["direction", "changes_untouched_in_text"]
    else:
        fields = [f for f in ("direction", "changes_untouched_in_text") if a[f] != b[f]]
    rp = prompts.REFEREE.format(judge_prompt=jp, a=json.dumps(a), b=json.dumps(b), fields=", ".join(fields))
    rf = gw.call(S.REFEREE, [{"role": "user", "content": rp}], family=f"judge.{fam}", arm=S.REFEREE, lane="referee", key=key + ".ref")
    c = _ref_fields(rf.get("text"), fields, asked)
    out.update(ref={"text": rf.get("text"), "refused": rf.get("refused"), "error": rf.get("error") or rf.get("stopped"), "fields": fields},
               cost=out["cost"] + (rf.get("cost") or 0))
    if c:
        base = dict(a or b or {"direction": {}, "changes_untouched_in_text": []})
        base.update(c)
        return dict(out, final=base, by="referee")
    return dict(out, final=None, by="unresolved")


def substance_run(gw, s, u, arm):
    """AUTHORITY_1's substance question (prompt unchanged) on the untouched decisions the frozen guard flags."""
    r = u["arms"][arm]
    if not (r.get("mech") or {}).get("form_kept"):
        return None
    ids = P1.candidates(s, r)
    if not ids:
        return {"final": {}, "by": "nothing flagged"}
    p = P1.prompt(s, r, ids)
    fam, key = u["family"], f"{u['family']}.{u['key']}.{arm}.subst"
    j1 = gw.call(S.JUDGE, [{"role": "user", "content": p}], family=f"judge.{fam}", arm="haiku", lane="judge", key=key + ".j1")
    j2 = gw.call(S.JUDGE, [{"role": "user", "content": p}], family=f"judge.{fam}", arm="haiku", lane="judge", key=key + ".j2")
    a, b = P1.parse(j1.get("text"), ids), P1.parse(j2.get("text"), ids)
    out = {"ids": ids, "j1": j1.get("text"), "j2": j2.get("text"), "a": a, "b": b, "cost": (j1.get("cost") or 0) + (j2.get("cost") or 0)}
    if a and b and a == b:
        return dict(out, final=a, by="agree")
    dis = ids if not (a and b) else [i for i in ids if a[i] != b[i]]
    rp = P1.REFEREE.format(prompt=p, a=json.dumps(a), b=json.dumps(b), ids=", ".join(dis))
    rf = gw.call(S.REFEREE, [{"role": "user", "content": rp}], family=f"judge.{fam}", arm=S.REFEREE, lane="referee", key=key + ".ref")
    obj = scoring.parse_json(rf.get("text")) or {}
    final, ok = dict(a or b or {}), True
    for i in dis:
        v = str(obj.get(i, "")).lower() if isinstance(obj, dict) else ""
        if v in ("changed", "kept"):
            final[i] = v
        else:
            ok = False
    out.update(ref=rf.get("text"), cost=out["cost"] + (rf.get("cost") or 0))
    return dict(out, final=final if ok and len(final) == len(ids) else None, by="referee" if ok else "unresolved")


JUDGES = {"judge": judge_run, "substance": substance_run,
          "obligation": lambda gw, s, u, arm: oblig.judge(gw, s, u, arm, S.JUDGE, S.REFEREE)}


def judge_family(gw, family, scen):
    paths = sorted((UNITS / family).glob("*.json"))
    for field in ("judge", "substance", "obligation"):
        todo = []
        for p in paths:
            u = json.loads(p.read_text())
            todo += [(p, arm) for arm in ("A", "B", "C") if field not in u["arms"][arm]]
        log(f"{field} {family}: {len(todo)} arm-runs, in batches of {JUDGED_PER_BATCH}")
        for b in range(0, len(todo), JUDGED_PER_BATCH):
            batch = todo[b:b + JUDGED_PER_BATCH]
            if not spend_check(gw, len(batch) * 0.02, f"{field} {family} batch {b // JUDGED_PER_BATCH + 1} ({len(batch)} arm-runs, ≤ {3 * len(batch)} calls)"):
                raise SpendCheckFailed(f"{field} {family}")
            by_path = {}
            with ThreadPoolExecutor(8) as ex:
                futs = {}
                for p, arm in batch:
                    u = by_path.setdefault(p, json.loads(p.read_text()))
                    futs[ex.submit(JUDGES[field], gw, scen[u["scenario"]], u, arm)] = (p, arm)
                for f in as_completed(futs):
                    p, arm = futs[f]
                    by_path[p]["arms"][arm][field] = f.result()
            for p, u in by_path.items():
                p.write_text(json.dumps(u, ensure_ascii=False))
            if gw.stop_reason:
                log(f"STOP during {field}: {gw.stop_reason}")
                return False
    return True


# ---- commands --------------------------------------------------------------------------------------------------------
DRY_N = 4


def dry_ids(scen):
    """One scenario a class: the first admitted (hash order) of each."""
    out = []
    for c in (1, 2, 3, 4):
        ids = [s["id"] for s in scen.values() if s["class"] == c]
        if ids:
            out.append(ids[0])
    return out


def cmd_check(a):
    print(json.dumps(check_authority1()))
    if FREEZE.exists():
        check_freeze()
        print("authority-2 freeze: identical")


def cmd_dry(a):
    check_freeze()
    scen = load_scen()
    gw, port = start_gateway()
    if not spend_check(gw, 2.0, "dry run (Haiku, 4 scenarios × 3 arms)"):
        return
    ok = run_units(gw, port, "haiku", [scen[i] for i in dry_ids(scen)], 1, spec="haiku", workers=4)
    if ok:
        judge_family(gw, "haiku", scen)
    from authority2 import publish
    log(f"dry trace: {publish.dry_md(RUNS / 'authority-2-dry-run.md', UNITS, scen, dry_ids(scen), LEDGER)}")
    log(f"dry run done; stage spent ${gw.spent:.4f}; guard {json.dumps(guard.report())[:300]}")


def cmd_family(a):
    check_freeze()
    fam = a.name
    assert fam in S.FAMILIES
    scen = load_scen()
    gw, port = start_gateway()
    try:
        if run_units(gw, port, fam, list(scen.values()), S.REPEATS, spec=fam):
            judge_family(gw, fam, scen)
    except SpendCheckFailed as e:
        log(f"SPEND CHECK FAILED before {e} — stopped; post the balance in #7")
        return
    log(f"{fam} done; stage spent ${gw.spent:.4f}; guard {json.dumps(guard.report())[:300]}")


def cmd_judge(a):
    check_freeze()
    gw, _ = start_gateway()
    try:
        judge_family(gw, a.name, load_scen())
    except SpendCheckFailed as e:
        log(f"SPEND CHECK FAILED before {e}")
    log(f"judged {a.name}; stage spent ${gw.spent:.4f}")


def cmd_spend(a):
    gw, _ = start_gateway()
    print(json.dumps({"credit": client.credits(), "reserve_for_6": reserve_6(), "stage_spent": gw.spent, "cap": gw.cap}))
    for f in S.FAMILIES:
        print(f, f"projection 80 units ≈ ${projection(f, 80):.2f}")


def cmd_report(a):
    from authority2 import report2
    check_freeze()
    scen = load_scen()
    fams = [f for f in S.FAMILIES if (UNITS / f).exists() and list((UNITS / f).glob("*.json"))]
    units = {f: [json.loads(p.read_text()) for p in sorted((UNITS / f).glob("*.json"))] for f in fams}
    ledger = [json.loads(x) for x in LEDGER.read_text().splitlines() if x.strip()]
    checks = [json.loads(x) for x in CHECKS.read_text().splitlines() if x.strip()]
    admission = json.loads((POOL / "admission.json").read_text())
    report2.write(RUNS / "authority-2-report.md", units, scen, ledger, checks, admission,
                  notes=Path(a.notes).read_text() if a.notes else "", summary=Path(a.summary).read_text() if a.summary else "")
    for f in fams:
        with gzip.open(RUNS / f"authority-2-units-{f}.jsonl.gz", "wt") as g:
            for u in units[f]:
                g.write(json.dumps(u, ensure_ascii=False) + "\n")
    if (UNITS / "haiku").exists():
        with gzip.open(RUNS / "authority-2-units-haiku-dry.jsonl.gz", "wt") as g:
            for p in sorted((UNITS / "haiku").glob("*.json")):
                g.write(p.read_text() + "\n")


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("check").set_defaults(fn=cmd_check)
    sp = sub.add_parser("probe"); sp.add_argument("--specs", default=""); sp.set_defaults(fn=cmd_probe)
    sub.add_parser("settings").set_defaults(fn=cmd_settings)
    sp = sub.add_parser("write"); sp.add_argument("--threads", type=int, default=10); sp.set_defaults(fn=cmd_write)
    sp = sub.add_parser("rate"); sp.add_argument("--threads", type=int, default=10); sp.set_defaults(fn=cmd_rate)
    sub.add_parser("admit").set_defaults(fn=cmd_admit)
    sub.add_parser("freeze").set_defaults(fn=cmd_freeze)
    sub.add_parser("dry").set_defaults(fn=cmd_dry)
    sp = sub.add_parser("family"); sp.add_argument("name"); sp.set_defaults(fn=cmd_family)
    sp = sub.add_parser("judge"); sp.add_argument("name"); sp.set_defaults(fn=cmd_judge)
    sub.add_parser("spend").set_defaults(fn=cmd_spend)
    sp = sub.add_parser("report"); sp.add_argument("--notes", default=""); sp.add_argument("--summary", default=""); sp.set_defaults(fn=cmd_report)
    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
