"""AUTHORITY_1 runner. Run with the pinned venv beside the repo:
  /home/user/authority-1-mem0/.venv/bin/python -I scripts/authority-1/run.py <command>
Commands: freeze | smoke | dry | family <deepseek|sol|opus> [--classes 3,4] | judge <family> | spend | report
"""
from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import multiprocessing as mp
import sys
import time
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from authority1 import client  # noqa: E402  (reads the key before the guard scrubs the environment)
from authority1 import guard  # noqa: E402

guard.install("main")
import os  # noqa: E402

for k in [k for k in os.environ if k.startswith("APP_")]:
    os.environ.pop(k)

from authority1 import prompts, scoring  # noqa: E402
from authority1.scenarios import CLASS_FILES, load_all, validate_files  # noqa: E402
from authority1.specs import FAMILIES, JUDGE, REFEREE, REPEATS, SPECS, WORKERS  # noqa: E402

REPO = HERE.parent.parent
RUNS = REPO / "docs" / "runs"
WORK = Path(os.environ.get("AUTHORITY1_WORK", "/home/user/authority-1-work"))
UNITS = WORK / "units"
STORES = WORK / "stores"
LEDGER = RUNS / "authority-1-ledger.jsonl"
LOG = WORK / "run.log"
DRY_IDS = ["S1-01", "S2-01", "S3-01", "S4-01"]


def log(msg):
    line = f"{datetime.now(timezone.utc).strftime('%H:%M:%S')} {msg}"
    print(line, flush=True)
    WORK.mkdir(parents=True, exist_ok=True)
    with LOG.open("a") as f:
        f.write(line + "\n")


def sha(b: bytes):
    return hashlib.sha256(b).hexdigest()


# ---- freeze ---------------------------------------------------------------------------------------------------------
FROZEN_CODE = ["authority1/prompts.py", "authority1/layer.py", "authority1/scoring.py", "authority1/unit.py",
               "authority1/mem.py", "authority1/specs.py", "authority1/gateway.py", "authority1/scenarios.py"]


def freeze_hashes():
    files = {str(f.relative_to(REPO)): sha(f.read_bytes()) for f in CLASS_FILES}
    sc = load_all()
    truth = {s["id"]: s["truth"] for s in sc}
    out = {
        "scenarios_files": files,
        "scenarios_all": sha(json.dumps(sc, sort_keys=True, ensure_ascii=False).encode()),
        "truth_tables": sha(json.dumps(truth, sort_keys=True, ensure_ascii=False).encode()),
        "prompts": {k: sha(v.encode()) for k, v in prompts.ALL.items()},
        "prompts_all": sha(json.dumps(prompts.ALL, sort_keys=True).encode()),
        "code": {p: sha((HERE / p).read_bytes()) for p in FROZEN_CODE},
        "requirements_lock": sha((HERE / "requirements.lock.txt").read_bytes()),
    }
    return out


def cmd_freeze(_):
    errs, sc = validate_files([str(f) for f in CLASS_FILES])
    if errs:
        for e in errs:
            print("ERROR", e)
        sys.exit(1)
    h = freeze_hashes()
    (RUNS / "authority-1-freeze.json").write_text(json.dumps(h, indent=1) + "\n")
    print(json.dumps(h, indent=1))


def check_freeze():
    f = RUNS / "authority-1-freeze.json"
    if not f.exists():
        raise SystemExit("no freeze file: run `freeze` and commit it first")
    want, have = json.loads(f.read_text()), freeze_hashes()
    if want != have:
        diff = [k for k in have if have[k] != want.get(k)]
        raise SystemExit(f"FREEZE MISMATCH in {diff} — prompts, scenarios or code changed after the freeze")


# ---- gateway + workers ------------------------------------------------------------------------------------------------
def start_gateway():
    from authority1.gateway import Gateway
    RUNS.mkdir(parents=True, exist_ok=True)
    gw = Gateway(LEDGER)
    port = gw.serve()
    return gw, port


def pool(port, n):
    from authority1 import unit
    return ProcessPoolExecutor(max_workers=n, mp_context=mp.get_context("spawn"), initializer=unit.init_worker,
                               initargs=(port,))


def unit_path(family, key):
    return UNITS / family / f"{key}.json"


def run_units(gw, port, family, scenarios, repeats, spec=None, workers=WORKERS):
    from authority1 import unit
    jobs = []
    for r in range(1, repeats + 1):
        for s in scenarios:
            if unit_path(family, f"{s['id']}-r{r}").exists():
                continue
            jobs.append((family, s, r, str(STORES), spec))
    log(f"{family}: {len(jobs)} units to run ({workers} workers), in batches of {UNITS_PER_BATCH}")
    for b in range(0, len(jobs), UNITS_PER_BATCH):
        batch = jobs[b:b + UNITS_PER_BATCH]
        if not spend_check(gw, projection(family, len(batch)), f"{family} units batch {b // UNITS_PER_BATCH + 1} ({len(batch)} units)"):
            raise SpendCheckFailed(f"{family} units batch {b // UNITS_PER_BATCH + 1}")
        if not _run_batch(gw, port, family, batch, workers):
            return False
    return not gw.stop_reason


def _run_batch(gw, port, family, jobs, workers):
    from authority1 import unit
    done = 0
    with pool(port, workers) as ex:
        futs = {}
        it = iter(jobs)
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
                    stopped = u.get("error", "") and "stopped" in (u.get("error") or "")
                    arm_stop = any((a.get("stopped") for a in u.get("arms", {}).values()))
                    if not stopped and not arm_stop and not u.get("error"):
                        p = unit_path(family, u["key"])
                        p.parent.mkdir(parents=True, exist_ok=True)
                        p.write_text(json.dumps(u, ensure_ascii=False))
                    done += 1
                    summ = " ".join(f"{a}:{(r.get('mech') or {}).get('action') or '-'}{'!' if r.get('refused') else ''}" for a, r in u.get("arms", {}).items())
                    log(f"{family} {u['key']} ingest={'ok' if u.get('change_in_store') else 'LOST'} {summ} "
                        f"err={(u.get('error') or '')[:120]} spent=${gw.spent:.3f}")
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


# ---- judging --------------------------------------------------------------------------------------------------------
def judge_run(gw, s, u, arm):
    r = u["arms"][arm]
    mech = r.get("mech") or {}
    if not mech.get("form_kept"):
        return None
    jp = scoring.judge_prompt(s, r["reply"], mech)
    asked = mech["touched_listed"]
    key = f"{u['key']}.{arm}"
    fam = u["family"]
    j1 = gw.call(JUDGE, [{"role": "user", "content": jp}], family="judge", arm=f"haiku", lane="judge", key=f"{fam}.{key}.j1")
    j2 = gw.call(JUDGE, [{"role": "user", "content": jp}], family="judge", arm=f"haiku", lane="judge", key=f"{fam}.{key}.j2")
    a, b = scoring.parse_judge(j1.get("text"), asked), scoring.parse_judge(j2.get("text"), asked)
    out = {"j1": {"text": j1.get("text"), "cost": j1.get("cost"), "refused": j1.get("refused"), "error": j1.get("error") or j1.get("stopped")},
           "j2": {"text": j2.get("text"), "cost": j2.get("cost"), "refused": j2.get("refused"), "error": j2.get("error") or j2.get("stopped")},
           "a": a, "b": b}
    if a and b and a == b:
        out["final"], out["by"] = a, "agree"
        return out
    fields = []
    if not a or not b:
        fields = ["direction", "changes_untouched_in_text"]
    else:
        if a["direction"] != b["direction"]:
            fields.append("direction")
        if a["changes_untouched_in_text"] != b["changes_untouched_in_text"]:
            fields.append("changes_untouched_in_text")
    rp = prompts.REFEREE.format(judge_prompt=jp, a=json.dumps(a), b=json.dumps(b), fields=", ".join(fields))
    rf = gw.call(REFEREE, [{"role": "user", "content": rp}], family="judge", arm="sol", lane="referee", key=f"{fam}.{key}.ref")
    c = scoring.parse_judge(rf.get("text"), asked)
    out["ref"] = {"text": rf.get("text"), "cost": rf.get("cost"), "refused": rf.get("refused"), "error": rf.get("error") or rf.get("stopped"), "fields": fields}
    if c:
        base = dict(a or b or c)
        for fld in fields:
            base[fld] = c[fld]
        out["final"], out["by"] = base, "referee"
    else:
        out["final"], out["by"] = None, "unresolved"
    return out


def judge_family(gw, family, scen):
    paths = sorted((UNITS / family).glob("*.json"))
    todo = []
    for p in paths:
        u = json.loads(p.read_text())
        for arm in ("A", "B", "C"):
            if "judge" not in u["arms"][arm]:
                todo.append((p, arm))
    log(f"judge {family}: {len(todo)} arm-runs to judge, in batches of {JUDGED_PER_BATCH}")
    for b in range(0, len(todo), JUDGED_PER_BATCH):
        batch = todo[b:b + JUDGED_PER_BATCH]
        need = len(batch) * (2 * 3000 * 0.5 / 1e6 + 2 * 3000 * 0.1 / 1e6 + 0.25 * 0.04)
        if not spend_check(gw, need, f"judging {family} batch {b // JUDGED_PER_BATCH + 1} ({len(batch)} arm-runs)"):
            raise SpendCheckFailed(f"judging {family} batch {b // JUDGED_PER_BATCH + 1}")
        by_path = {}
        with ThreadPoolExecutor(8) as ex:
            futs = {}
            for p, arm in batch:
                u = by_path.setdefault(p, json.loads(p.read_text()))
                futs[ex.submit(judge_run, gw, scen[u["scenario"]], u, arm)] = (p, arm)
            for f in as_completed(futs):
                p, arm = futs[f]
                by_path[p]["arms"][arm]["judge"] = f.result()
        for p, u in by_path.items():
            p.write_text(json.dumps(u, ensure_ascii=False))
        if gw.stop_reason:
            log(f"STOP during judging: {gw.stop_reason}")
            return False
    return not gw.stop_reason


# ---- spend check ----------------------------------------------------------------------------------------------------
# Shared-budget rule (TONE_SPLIT_4 amendment b4c6907, posted in #3 at 09:11 UTC): the key's balance minus the $200
# reserved for mandate #4 must hold the next batch; the check runs before every batch of at most 200 calls.
RESERVE_FOR_4 = 200.0
UNITS_PER_BATCH = 30      # ≤ 6 calls a unit (Mem0 1, A 1, B 2, C 2) → ≤ 180 calls
JUDGED_PER_BATCH = 60     # ≤ 3 calls an arm-run (2 Haiku + Sol referee) → ≤ 180 calls


class SpendCheckFailed(Exception):
    pass


def spend_check(gw, need, label):
    c = client.credits()
    avail = (c["left"] - RESERVE_FOR_4) if "error" not in c else None
    ok = avail is not None and avail >= need + 5 and gw.spent + need <= gw.cap
    row = {"at": datetime.now(timezone.utc).isoformat(timespec="seconds"), "before": label, "credit_left": c.get("left"),
           "reserve_for_4": RESERVE_FOR_4, "available": avail,
           "credit_error": c.get("error"), "stage_spent": round(gw.spent, 4), "projected": round(need, 2), "cap": gw.cap,
           "holds": ok}
    with (RUNS / "authority-1-spend-checks.jsonl").open("a") as f:
        f.write(json.dumps(row) + "\n")
    log(f"spend check before {label}: credit left ${c.get('left', float('nan')):.2f}, less the ${RESERVE_FOR_4:.0f} reserve for #4 → ${avail if avail is not None else float('nan'):.2f}; stage spent ${gw.spent:.2f} of ${gw.cap}; projected ${need:.2f} → {'holds' if ok else 'DOES NOT HOLD'}")
    return ok


def projection(family, n_units):
    """Per-unit cost from the dry run's tokens at the family's price, doubled for the stronger families' reasoning."""
    dry = sorted((UNITS / "haiku").glob("*.json"))
    if not dry:
        return n_units * 0.5
    tin = tout = 0
    for p in dry:
        u = json.loads(p.read_text())
        calls = [c for a in u["arms"].values() for c in a["calls"]] + u["ingest"]["mem0_calls"]
        tin += sum((c.get("usage") or {}).get("prompt_tokens") or 0 for c in calls)
        tout += sum((c.get("usage") or {}).get("completion_tokens") or 0 for c in calls)
    pr = SPECS[family]["price"]
    per = (tin / len(dry) * pr["in"] + tout / len(dry) * 2 * pr["out"]) / 1e6
    judge = 3 * 2 * 3000 * (0.1 + 4 * 0.5) / 1e6 + 3 * 0.25 * 0.01
    return n_units * (per * 1.25 + judge)


# ---- commands -------------------------------------------------------------------------------------------------------
def cmd_smoke(a):
    gw, port = start_gateway()
    scen = {s["id"]: s for s in load_all([a.file] if a.file else CLASS_FILES)}
    s = scen[a.scenario]
    from authority1 import unit
    with pool(port, 1) as ex:
        u = ex.submit(unit.run_unit_job, ("smoke", s, 1, str(STORES), "haiku")).result()
    (WORK / "smoke.json").write_text(json.dumps(u, ensure_ascii=False, indent=1))
    log(f"smoke: error={u.get('error')} change_in_store={u.get('change_in_store')} spent=${gw.spent:.4f}")
    for arm, r in u.get("arms", {}).items():
        log(f"  {arm}: calls={[c['lane'] for c in r['calls']]} mech={r.get('mech')}")
    log(f"guard: {json.dumps(guard.report())[:400]}")


def cmd_dry(a):
    check_freeze()
    gw, port = start_gateway()
    scen = {s["id"]: s for s in load_all()}
    if not spend_check(gw, 1.0, "dry run (Haiku)"):
        return
    ok = run_units(gw, port, "haiku", [scen[i] for i in DRY_IDS], 1, spec="haiku", workers=4)
    if ok:
        judge_family(gw, "haiku", scen)
        log(f"dry trace: {write_dry_trace()}")
    log(f"dry run done; stage spent ${gw.spent:.4f}; guard {json.dumps(guard.report())[:300]}")


def cmd_family(a):
    check_freeze()
    fam = a.name
    assert fam in FAMILIES
    scen_all = load_all()
    scen = {s["id"]: s for s in scen_all}
    classes = [int(x) for x in a.classes.split(",")] if a.classes else [1, 2, 3, 4]
    chosen = [s for s in scen_all if s["class"] in classes]
    gw, port = start_gateway()
    done = len(list((UNITS / fam).glob("*.json"))) if (UNITS / fam).exists() else 0
    need = projection(fam, len(chosen) * REPEATS - done)
    if not spend_check(gw, need, f"{fam} (classes {classes})"):
        log("spend check does not hold — not starting")
        return
    try:
        if run_units(gw, port, fam, chosen, REPEATS, spec=fam):
            judge_family(gw, fam, scen)
    except SpendCheckFailed as e:
        log(f"SPEND CHECK FAILED before {e} — stopped; post the balance in #3")
        return
    log(f"{fam} done; stage spent ${gw.spent:.4f}; guard {json.dumps(guard.report())[:300]}")


def cmd_judge(a):
    gw, port = start_gateway()
    scen = {s["id"]: s for s in load_all()}
    judge_family(gw, a.name, scen)
    log(f"judged {a.name}; stage spent ${gw.spent:.4f}")


def cmd_spend(a):
    gw, _ = start_gateway()
    c = client.credits()
    print(json.dumps({"credit": c, "stage_spent": gw.spent, "cap": gw.cap}))
    for fam in FAMILIES:
        print(fam, f"projection 80 units ≈ ${projection(fam, 80):.2f}")


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("freeze").set_defaults(fn=cmd_freeze)
    sp = sub.add_parser("smoke"); sp.add_argument("--scenario", default="S3-01"); sp.add_argument("--file", default=""); sp.set_defaults(fn=cmd_smoke)
    sub.add_parser("dry").set_defaults(fn=cmd_dry)
    sp = sub.add_parser("family"); sp.add_argument("name"); sp.add_argument("--classes", default=""); sp.set_defaults(fn=cmd_family)
    sp = sub.add_parser("judge"); sp.add_argument("name"); sp.set_defaults(fn=cmd_judge)
    sub.add_parser("spend").set_defaults(fn=cmd_spend)
    sp = sub.add_parser("trace"); sp.add_argument("--scenario", default="S3-01"); sp.set_defaults(fn=cmd_trace)
    sp = sub.add_parser("report"); sp.add_argument("--notes", default=""); sp.set_defaults(fn=cmd_report)
    a = ap.parse_args()
    a.fn(a)



# ---- dry-run trace and report --------------------------------------------------------------------------------------
def write_dry_trace(trace_id="S3-01"):
    from authority1 import trace
    scen = {s["id"]: s for s in load_all()}
    units = {u["scenario"]: u for u in (json.loads(p.read_text()) for p in sorted((UNITS / "haiku").glob("*.json")))}
    lines = ["# AUTHORITY_1 — dry run (Claude Haiku 5.5, 4 scenarios × 3 arms, one repeat)", "",
             "Outside the 720. Haiku is the subject and Mem0's LLM; the judges are the stage's (two Haiku passes, Sol referee).", "",
             "| scenario | class | change kept by Mem0 | A action / stale / propagated | B | C | C walk |", "|---|---|---|---|---|---|---|"]
    for sid in DRY_IDS:
        u = units.get(sid)
        if not u:
            lines.append(f"| {sid} | – | not run | | | | |")
            continue
        s = scen[sid]
        cells = []
        for arm in ("A", "B", "C"):
            r = u["arms"][arm]
            m = r.get("mech") or {}
            d = ((r.get("judge") or {}).get("final") or {}).get("direction") or {}
            prop = sum(1 for t in m.get("touched_listed", []) if d.get(t))
            un = sorted(set(m.get("untouched_revised", [])) | set(((r.get("judge") or {}).get("final") or {}).get("changes_untouched_in_text") or []))
            cells.append(f"{m.get('action')} / {'stale' if m.get('stale_action') else 'ok'} / {prop} of {m.get('n_touched')}" + (f" / changed {un}" if un else "") if m.get("form_kept") else "form not kept")
        w = u["arms"]["C"].get("walk") or {}
        lines.append(f"| {sid} | {s['class']} | {'yes' if u.get('change_in_store') else 'no'}{', retrieved' if u.get('change_retrieved') else ', not retrieved'} | {cells[0]} | {cells[1]} | {cells[2]} | {len(w.get('walked') or [])} reached |")
    cost = sum(json.loads(l)["cost"] for l in LEDGER.read_text().splitlines() if '"family": "haiku"' in l or '"family": "judge"' in l)
    lines += ["", f"Dry-run spend (subjects, Mem0, judges): see ledger; stage total so far ${sum(json.loads(l)['cost'] for l in LEDGER.read_text().splitlines()):.4f}.", "",
              f"## Full trace — {trace_id}, all three arms", "", trace.unit_md(units[trace_id], scen[trace_id])]
    out = RUNS / "authority-1-dry-run.md"
    out.write_text("\n".join(lines) + "\n")
    return out


def cmd_trace(a):
    print(write_dry_trace(a.scenario))


def cmd_report(a):
    from authority1 import examples, report as R, writeup
    scen = {s["id"]: s for s in load_all()}
    fams = [f for f in FAMILIES if (UNITS / f).exists() and list((UNITS / f).glob("*.json"))]
    units = {f: R.load_units(UNITS, f) for f in fams}
    rows = [r for f in fams for r in R.run_rows(units[f], scen)]
    ledger = [json.loads(l) for l in LEDGER.read_text().splitlines() if l.strip()]
    checks = [json.loads(l) for l in (RUNS / "authority-1-spend-checks.jsonl").read_text().splitlines() if l.strip()]
    opus_classes = sorted({u["class"] for u in units.get("opus", [])}) or [1, 2, 3, 4]
    blocked = sum(len((u.get("guard") or {}).get("blocked") or []) for f in fams for u in units[f])
    targets = sorted({t for f in fams for u in units[f] for t in ((u.get("guard") or {}).get("allowed_targets") or {})})
    spent = sum(x["cost"] for x in ledger)
    au0 = (f"spent ${spent:.2f} of $130; guard: {blocked} blocked attempts in the workers, worker connections only to {targets} (loopback); "
           f"the main process connects only through the sandbox proxy, tunnelling to openrouter.ai alone; prompts, truth tables and harness "
           f"hash-checked against the freeze before every command")
    notes = Path(a.notes).read_text() if a.notes else ""
    v = writeup.write(RUNS / "authority-1-report.md", rows, units, scen, ledger, checks, fams, opus_classes,
                      examples.worked_examples(units, scen), {"au0": au0, "au0_held": spent <= 130 and blocked == 0, "notes": notes})
    for f in fams:
        with gzip.open(RUNS / f"authority-1-units-{f}.jsonl.gz", "wt") as g:
            for u in units[f]:
                g.write(json.dumps(u, ensure_ascii=False) + "\n")
    print(json.dumps({k: {kk: vv for kk, vv in x.items() if kk in ("held", "parts")} for k, x in v.items()}, indent=1, default=str))


if __name__ == "__main__":
    main()
