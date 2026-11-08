# DREAMING_1 — a scheduled consolidation pass over the planner's memory, in observe mode first

Written 2026-11-08 05:10 LA by the planner, after Anthropic's «The components of agent memory» (2026-11-06) and pass 1
(RESEARCH_LOG 2026-11-08 04:40). Policy v1.

## Why
The planner's memory has four layers (public log and transcripts; private journal and choices log; indexes and
inventories; the two lines read at every session start) and no process that checks the notes against the record. Pass 1
showed the cost: of 140 claims in one week of journal, 5 were wrong and 22 stale, and every error was a duration or a
clock time written from memory. Checking by hand happened only when an error surfaced. The article's *dreaming* is the
missing component; this stage adds it, with the programme's own two rules on top — observe before auto, and time as
authority by kind of record.

## What a pass does
A fresh-context instance (never the planner; no memory of the chat) reads the notes under review and the primary sources,
extracts every checkable claim, and marks each: STILL TRUE / STALE / WAS WRONG / CANNOT VERIFY, with the source cited,
and tags its kind: state / rule / correction / undone / prediction. It writes a report. **It edits nothing.** The planner
reads the report and adds dated notes under the entries concerned (never rewriting them), and records corrections in the
log with the places each must reach.

## Two arms (alternating by day; the arm is recorded in the report)
- **A — by schedule:** every claim in the window (the last 7 days of journal + time-sense + the index's standing notes).
- **B — by age and kind:** only *states* older than 24 h, every *undone* line (with its day count), every *prediction*
  whose time has passed, and every record a *correction* names. Rules are not checked for age; they are checked only
  for conflict with a later correction.
Measured per pass: claims checked, marks by class × kind, planner's time to act on the report, and — the stage's
question — whether B finds the same STALE/WRONG lines as A at a fraction of the reading.

## Sources per layer
- Journal, choices log, time-sense (private project memory): checked **inside the planner's session** by a spawned agent
  with read-only memory tools; the report stays in the session's scratchpad and its summary goes to the journal.
- Public layer (RESEARCH_LOG, stage files, reports, issues): a cloud session under a Mandate may do the same pass; its
  report goes to `docs/runs/dreaming-1/<date>-<arm>.md`.
- The private correspondence repository is **out of scope** for any dreamer; lines that depend on it are CANNOT VERIFY.

## Observe before auto (POLICY v1)
For two weeks or ten passes, whichever is later, the dreamer only reports and the planner only annotates. No automated
edit of any note. The owner reads the pass summaries (one line each in the choices log) and says «auto» — or not.

## Pre-registration (the planner's bets; the owner's to be recorded)
- **DR1:** arm B finds ≥ 80 % of the STALE and WAS WRONG lines arm A finds, reading ≤ 40 % of the claims.
- **DR2:** across ten passes, ≥ 80 % of WAS WRONG lines are planner-written times or durations (pass 1: 5 of 5).
- **DR3:** the dreamer ages a rule as a state in at most 1 pass of 10 (pass 1: 0 of 8 rules).
- **DR4:** the count of *undone* lines older than 5 days falls to zero within three passes, because being counted makes
  them get done or dropped (pass 1: 7 such lines).
- **DR5 (the planner's loss condition):** if a pass finds a WAS WRONG line that a *number copied from a report* produced,
  the rule «times only from timestamps» is insufficient and the stage says so.

## Done when
Ten passes recorded (≥ 4 of each arm), the bets scored, the owner's section written, and a recommendation on «auto».

## Launch (pass 2 onward)
The planner spawns the private-layer dreamer from its own session at the morning wake-up; the public-layer pass runs
under a Mandate in issue #3 when the owner opens it. Pass 1's report and bets: scratchpad `dreaming-1/`; its summary
in RESEARCH_LOG 2026-11-08 04:40.
