# Audit of the session 3 candidate — independent, with dynamic workflows (ultracode)

Cloud session (`docs/CLOUD.md`, environment `rpg-console`) with **ultracode on**: fan the checks out to agents and have
second agents verify every finding before it is reported. Read-only on the code: this session changes nothing in
`src/`, `supabase/`, `tests/` — it writes only its report. Branch to audit: **`claude/s3-candidate`** (check it out; the
audit's own files go to a new branch `claude/audit-s3` from it). Nothing to `main`. No paid model calls except through the
app's own probes if a check cannot be settled by reading code and tests (cap **$10**, ledger `docs/runs/audit-s3-ledger.md`).
Report in English: `docs/runs/audit-s3-report.md`. Talk to the owner in English, briefly.

## What the audit answers
For every claim below: **confirmed / partial / missing / contradicted**, the file and line (or test) that proves it, and —
for anything but confirmed — one sentence on what differs from the owner's phrasing. The owner's phrasing is the
standard, not the implementer's summary of it.

### Inputs (read in this order)
1. `docs/runs/session2-owner-notes.md` on `origin/claude/handoff` — the owner's verdict (the regression list), key findings 1
   and 2, items 1–85. **This is the source of truth for what was asked.**
2. `docs/runs/s3-audit-input.md` on the candidate — the implementer's own mapping item → commit (72 done / 15 partial /
   3 no code). Treat it as a claim to verify, not as evidence.
3. The stage docs on `claude/handoff`: `FIX_S2_PLAN.md` (the owner's decisions — each one is a claim), `FIX_S2_AB.md`,
   `FIX_S2_CDEF.md`, `LIVE2D_1.md` (incl. the quality section and Part 2), `STAGE_MUSIC.md`, `MERGE_S2.md`.
4. The reports on the candidate: `docs/runs/fix-s2-report.md`, `live2d-1-report.md`, `music-report.md`,
   `merge-s2-report.md`; the three Russian acceptance checklists (`docs/runs/s3-acceptance.md` index).

### Checks
A. **The 85 items and the two key findings** — one agent per 5–8 items; each agent reads the item as the owner wrote it,
   finds the code and the test, runs the focused test, and reports. The 15 «partial» rows and the five flagged in the
   audit input (9, 37, 38, 41, 62) get their own agents.
B. **The owner's decisions in `FIX_S2_PLAN.md`** (natural 1/20 as BG3, the ambush opening, potion as bonus action,
   rerolls + Inspiration, the DM rolls for companions, enemy HP visible, coup de grâce, every roll told, session 3's mode
   Opus+Opus with the ledger checker, Russian instructions default, memory «стандарт», hidden layer never shown or
   written by the owner, the gallery, the session close by length, the «never bake in one player» rule in new code).
C. **The two gaps the merge named** — verify and size them:
   1. in «Opus пишет — Opus записывает» the writer's attacks bypass `combat attack`, so the server rules module (cover,
      crits, resistances, point-blank) does not apply; where exactly, and what the smallest change is for the writer to
      resolve attacks through the server;
   2. `roll-check.ts` reads only `roll` receipts; no check for a declared-but-unrolled hero action; an implied outcome
      passes — confirm, and name the test that should exist.
D. **The regression list** (the owner's verdict): for each line, which probe or test on the candidate demonstrates it
   still holds; name any line with no evidence.
E. **Secrets and privacy**: no campaign dialogue, voice-bank passages or owner data in the repo; no key or `.env`
   content in any committed file or log; the hidden layer and private notes never reach a player-visible payload
   (trace the `/play` and stream payloads); `APP_ANTHROPIC_API_KEY` only.
F. **Russian on the owner's screens**: any English left in player-visible text (labels, chips, counters, conditions
   like `concentrating`, units like `ft`), with file and line.
G. **The acceptance checklists vs the code**: every «проверить ☐» line in the three Russian checklists maps to a
   working path on the candidate (a route, a button, a setting that exists); name any that does not.

### Output
`docs/runs/audit-s3-report.md`: (1) a table of all rows (A–G) with status, evidence and the difference; (2) **«Fix before
the owner looks»** — the short ordered list of real gaps, each with the smallest fix and its risk; (3) «Ask the owner»
— questions only the owner can settle; (4) what the audit could not check and why. Keep findings cross-verified: a
finding one agent raises and a second cannot reproduce is reported as «unverified», not as a gap.
