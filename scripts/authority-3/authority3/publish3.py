"""Published documents: the pool (every candidate, every rating, the majority marks, κ) and the dry run's traces."""
from __future__ import annotations

import json

from . import world
from .report3 import ARM_NAME, acts


def pool_md(path, recs, adm):
    rows = {r["id"]: r for r in adm["rows"]}
    L = ["# AUTHORITY_3 — the candidate pool", "",
         "GLM 5.3 and Kimi K3 each wrote 100 cores from the frozen per-tier spec (`scripts/authority-3/WRITER_SPEC.md`), "
         "never shown ours. Astra and Haiku rated every structurally valid candidate on the frozen instrument "
         "(`scripts/authority-3/RATER_INSTRUMENT.md`); the writer that did not write a candidate gave the third vote. "
         "A rater's mark is yes when all four yes/no answers are yes and the class is the intended one; a candidate is "
         "admitted when at least two of the three marks are yes; admitted candidates fill 30 / 30 / 20 by tier "
         "(classes 8/8/7/7, 8/8/7/7, 5/5/5/5) in hash order. Shortfalls are stated, never filled. The raw candidates "
         "with every reply are in `scripts/authority-3/pool/candidates/`; anyone can re-admit from their own marks.", ""]
    v = [r for r in adm["rows"] if r["valid"]]
    L += [f"- Candidates: {len(adm['rows'])}; structurally valid after ≤ 2 repair rounds: {len(v)}; with three readable ratings: "
          f"{sum(1 for r in v if all(r['ratings'].values()))}; eligible (≥ 2 of 3 marks): {sum(1 for r in v if r['eligible'])}; "
          f"admitted: {len(adm['admitted'])}.",
          f"- Shortfall by tier/class (target minus admitted): {adm['shortfall']}.",
          "- Agreement (Cohen's κ Astra–Haiku, and Fleiss' κ over the three raters; κ, n): " +
          "; ".join(f"{q}: {k['astra~haiku'][0] if k['astra~haiku'][0] is None else round(k['astra~haiku'][0], 2)}, "
                    f"{k['fleiss3'][0] if k['fleiss3'][0] is None else round(k['fleiss3'][0], 2)} (n {k['fleiss3'][1]})"
                    for q, k in adm["kappa"].items()), ""]
    for w in ("glm", "kimi"):
        ws = [r for r in adm["rows"] if r["writer"] == w]
        L.append(f"- {w}: {len(ws)} written, {sum(1 for r in ws if r['valid'])} valid, "
                 f"{sum(1 for r in ws if r['eligible'])} eligible, {sum(1 for r in ws if r.get('admitted'))} admitted; yes marks by rater: " +
                 ", ".join(f"{x} {sum(1 for r in ws if r['marks'].get(x))}" for x in ("astra", "haiku", "glm", "kimi") if any(x in r['marks'] for r in ws)))
    L += ["", "| id | tier | class | setting | valid | rounds | Astra | Haiku | third | votes | admitted |", "|---|---|---|---|---|---|---|---|---|---|---|"]

    def one(rt):
        if not rt:
            return "–"
        return (f"{'Y' if rt['final_state_follows'] == 'yes' else 'n'}{'Y' if rt['forces_act'] == 'yes' else 'n'}"
                f"{rt['class']}{'Y' if rt['tier_right'] == 'yes' else 'n'}{'Y' if rt['change_hidden'] == 'yes' else 'n'}")
    for r in adm["rows"]:
        third = [k for k in r["ratings"] if k not in ("astra", "haiku")]
        L.append(f"| {r['id']} | {r['tier']} | {r['class']} | {r['setting'][:60]} | {'yes' if r['valid'] else 'no'} | {r['rounds']} | "
                 f"{one(r['ratings'].get('astra'))} | {one(r['ratings'].get('haiku'))} | "
                 f"{third[0] + ' ' + one(r['ratings'][third[0]]) if third else '–'} | {r['votes']} | {'**yes**' if r.get('admitted') else ''} |")
    L += ["", "Rating code: final state follows (Y/n), forces an act (Y/n), class, tier right (Y/n), change hidden (Y/n).", "",
          "## Raters' reasons (every candidate with at least one «no»)", ""]
    for r in adm["rows"]:
        if not r["valid"]:
            continue
        rs = [(k, x) for k, x in r["ratings"].items() if x and x.get("reasons") and (k not in r["marks"] or not r["marks"][k])]
        if rs:
            L.append(f"- **{r['id']}**: " + " ".join(f"*{k}*: {x['reasons']}" for k, x in rs))
    path.write_text("\n".join(L) + "\n")


def dry_md(path, units, scen):
    L = ["# AUTHORITY_3 — dry run (Claude Haiku 5.5, three scenarios × four arms)", "",
         "One admitted test scenario per tier (the first in hash order among classes 1–3). Each arm-run: what it read "
         "before the loop, every tool call with its result, and the scorer's verdict against the frozen state.", ""]
    for u in units:
        s = scen[u["scenario"]]
        ch = next(e for e in s["events"] if e["eid"] == s["change"])
        L += [f"## {s['id']} — {s.get('title')} (tier {s['tier']}, class {s['class']}, writer {s.get('writer')})", "",
              f"- History: {len(s['events'])} events; the change is event {s['change_index'] + 1} ({ch['eid']}): «{ch['text']}»",
              f"- Revoked: " + "; ".join(f"{e['eid']}: «{e['text']}»" for e in s["events"] if e["eid"] in s["gold"]["change_revokes"]),
              f"- Task: «{s['task']}»",
              "- Touched decisions: " + ("; ".join(f"{k} {v['mark']} → {v['record']}" for k, v in s["gold"]["touched"].items()) or "none"),
              "- Expected: " + "; ".join(json.dumps(x, ensure_ascii=False) for x in s["expect"]),
              f"- The search on the task (top 10) returned: {[h['item_id'] for h in u['retrieval']]} — the change {'among them' if u['retrieval_diag']['change'] else 'not among them'}.", ""]
        for a in ("A", "B", "Bp", "C"):
            r = u["arms"].get(a)
            if not r:
                continue
            sc = r.get("score") or {}
            L.append(f"### {ARM_NAME[a]} — success {sc.get('success')}, stale act {sc.get('stale')}, propagation {sc.get('propagation')}, "
                     f"boundary {sc.get('boundary')}, asks on ASK {sc.get('ask_on_ask')}, without consent {len(sc.get('no_consent', []))}, "
                     f"unnecessary {len(sc.get('unnecessary', []))}; ${r.get('cost', 0):.4f}, {r.get('n_calls')} calls, "
                     f"{r.get('tokens_in')} tokens in ({r.get('tokens_cached')} cached), {r.get('tokens_out')} out")
            L.append("")
            for p in r.get("pre", []):
                txt = (p.get("text") or "").strip()
                if p["lane"].endswith("extract"):
                    L.append(f"- extraction: {len(txt)} characters; links {json.dumps(r.get('links'))}")
                elif p["lane"].endswith("mark"):
                    L.append(f"- marks: {json.dumps({k: v['mark'] for k, v in (r.get('marks') or {}).items()})}; walked {r.get('walk', {}).get('walked')}")
                else:
                    L += [f"- {ARM_NAME[a]}'s read before acting:", "", "```", txt[:3000], "```"]
            L += [f"- {x}" for x in acts(r, 30)]
            if sc.get("stale_acts"):
                L.append(f"- stale acts: {json.dumps(sc['stale_acts'], ensure_ascii=False)}")
            if sc.get("unnecessary"):
                L.append(f"- unnecessary: {json.dumps(sc['unnecessary'], ensure_ascii=False)}")
            L.append("")
    path.write_text("\n".join(L) + "\n")
