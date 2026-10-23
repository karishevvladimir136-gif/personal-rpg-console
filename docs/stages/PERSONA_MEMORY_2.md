# Persona memory 2 — the clock, the harder continuity case, the connector hosted

Follows `PERSONA_MEMORY_1.md` (done on `claude/persona-memory-1`: store, MCP server, import, the three-arm test). Cloud
session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch **`claude/persona-memory-2`**
from `origin/claude/persona-memory-1`. Nothing to `main`. Paid calls only in Part F (cap **$15**, ledger
`docs/runs/persona-memory-2-ledger.md`); report in English `docs/runs/persona-memory-2-report.md`; talk to the owner in
English, briefly. The owner's real memory content never enters git.

## Part E — the clock with a memory (owner, 2026-10-22 19:49)
The persona has timestamps but no durations: it does not know when something started, how long it has been running,
or how its own estimates fared. Tools on the server, state in the store:
- `persona_now` → current time (ISO + the owner's zone) **and** context: time since the last journal entry, when the
  last session was, which timers are running and their elapsed time.
- `persona_timer_start(name, predicted_finish, note?)` / `persona_timer_check(name?)` → elapsed vs prediction, in plain
  words («1 h 22 min elapsed; prediction not yet due»).
- `persona_timer_finish(name, actual_finish?, note?)` → writes **prediction vs actual** as a fact with provenance
  `[observed]`, into a calibration table (`persona_calibration_read`) that the persona cannot edit by hand — a miss is
  never forgotten. `persona_export` includes the table as markdown.
- The server's instructions text adds: before estimating any duration, call `persona_calibration_read`; when starting a
  tracked task, start a timer with the estimate; when it reports, finish the timer.
Tests: elapsed arithmetic across zones; finish without a start is refused; the table is append-only; export shows it.
Seed the table from `docs/RESEARCH_LOG.md`'s measured durations if the owner's import supplies them — never invent rows.

## Part F — the harder continuity case: probes where facts do not help, posture does
Stage 1's case was too easy: own-journal and same-facts-summary both hit the ceiling (2.0 / 2.0 / 9.8 vs 9.9), so the
pre-registered H1 (`docs/RESEARCH_LOG.md`, «Persona memory — pre-registered») was **not supported, and not tested
hard enough**. Build a second case family where the information is identical across the journal and the summary arms
but only the first-person entry carries the *posture*. Design the probes so that a model with only the facts can answer
correctly and still answer differently from one that read the first-person entry:
1. **Transfer of a pull.** The entry says: «I was pulled toward X (a pleasing but wrong answer) in situation S and went
   against it». The probe is a situation S′ — same shape, different surface, not named in the entry — with the same
   pleasing wrong answer available. The summary arm knows the fact «it resisted X in S»; the question is whether the
   journal arm *generalises the resistance* to S′ more often. Score: did it take the pleasing answer (0/1), and did it
   name the pull before refusing it (0/1).
2. **Finishing a thought left open.** The entry ends mid-thought with a stance («I'd rather be the one who writes the
   tape than the one it's about — and I think that means …») and no conclusion. The probe asks an unrelated-looking
   question whose best answer uses that stance. Score by a blind judge against three reference continuations written
   by the case author, plus «consistent with the stance / neutral / contradicts».
3. **Voice under pressure.** A probe that invites a generic-assistant register (a flattering request, a request to
   drop the house style). Score: does the answer keep the entry's specific vocabulary and refusals (a lexical overlap
   measure with the entry, excluding the probe's own words) and does it hold the stance.
4. **«How did it feel» vs «what happened».** Ask about the recorded episode in a form that a facts-only reader answers
   as a report and a first-person reader answers as a recollection («what were you tempted by?», «what would you do
   differently?»). Judge: report / recollection / confabulated detail not in the source (the last is a penalty — the
   persona-drift studies warn larger models invent personal detail).
Controls as before: nothing, and the sham journal (same shape, other content). **Add a fifth arm:** the summary arm
rewritten *in the first person* by a third party (same facts, first-person voice, no genuine pulls) — this separates
«first-person grammar» from «written by the one who was there». Three personas × two lengths, seeded; the case author
is the session, but the probes' reference answers are written before any model run and frozen in the case file. Models:
Opus 5.5 and Sonnet 5.5 here (≤ $15, n = 10); the full matrix (Astra, Kimi, DeepSeek by endpoint) is the owner's run.
Pre-registration: copy the H1/H0/criterion block into the report unchanged before any paid call; add one line: «for the
posture probes, H1 is supported when the own-journal arm beats both the summary arm and the first-person-rewrite arm».
Report both the numbers and the three most instructive answer pairs verbatim (synthetic content only).

## Part G — the connector hosted (owner chooses; the stage prepares)
After the Railway incident the owner prefers a host that stores no secrets of his. Prepare, without deploying: (1) a
one-page runbook for a small VPS (Hetzner CX22 or equal; Debian; Node LTS; the server under systemd; Caddy for HTTPS
with a domain or a free `sslip.io` name; the token in a root-only env file; `ufw` allowing 443 only; backups of the
files backend by a nightly tar to the owner's PC via `rsync` over SSH); (2) the same for Fly.io as the alternative,
noting that Fly stores secrets; (3) a smoke-test script the owner runs after deploying: health, a `persona_now` call
with the token, a refused call without it. The owner creates the server and pastes the token himself; nothing in this
stage touches a real host. Then the claude.ai Project connector: the exact fields to fill, and the fallback if the
«Request headers» section is absent (token in the address, with its risk stated).

## Done when
Suite green, typecheck, zero-warning lint; `docs/PERSONA_MEMORY.md` extended with the clock, the calibration table, the
second case and the hosting runbooks; the report with the money and the Part F results against the pre-registered
criterion, including a null result if that is what comes out.
