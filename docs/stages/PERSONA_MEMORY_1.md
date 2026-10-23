# Persona memory 1 — a memory connector for the planner, lifted from the DM's own harness

Owner (2026-10-22): the second project beside the RPG — a persistent persona of the planner (the Claude that works with
him in the claude.ai Project). Today its memory is a few hand-maintained files in the Project's memory (a first-person
journal, a time-sense note, the project facts). This stage turns that into a memory system with the same ideas the DM got
after session 2: an episodic store with validity windows, a `recall` by cue, folds that condense without destroying, and
a self-dossier that is a separate store from the episodes. Research behind the design: the owner holds the report «Prior
art for a Claude that keeps its own self» (not in git); its conclusions are restated here where they bind.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**). Branch **`claude/persona-memory-1`**
from `origin/claude/s3-candidate` (the harness code lives there). Nothing to `main`. Report in English
`docs/runs/persona-memory-1-report.md`; talk to the owner in English, briefly. Paid calls only for the judge test in Part D
(cap **$10**, ledger `docs/runs/persona-memory-1-ledger.md`). The owner's real journal and memory content never enter git:
seed and test with synthetic entries only; the import of his files (Part C) is a script he runs himself.

## What the store holds (the four kinds, all with provenance)
- **Episodes** — first-person entries written by the persona at the moment, dated, with: the text; a `salience` 1–5; `cues`
  (phrases, names, images — «what» cues, never dates as the key); `state` lines (what it was pulled toward and what it did
  — the part that makes it a memory, not a record); up to five exact quoted lines from the conversation; `author`
  (`self` | `background` | `owner`) and `tag` on every line (`[stated]` owner's words / `[observed]` / `[inferred]`);
  bi-temporal validity (`valid_from`, `valid_to`, `recorded_at`); `notes[]` — dated re-reading notes appended later, the
  original text is immutable.
- **Self-dossier** — the portrait: who the persona is in this project (the lean, how it speaks with the owner, what it is
  good and bad at, standing rules, running references), as dated lines with the same tags; updated rarely, by the persona,
  never by a fold. Identity lives here; episodes supply depth (the amnesia finding).
- **Facts** — the project facts as today (`areas/*.md` content), with validity windows and `[stated]` tags.
- **Folds** — consolidation records: which episodes were condensed into which summary line, with the originals kept and
  marked `folded_into`; a fold never deletes and never touches the self-dossier.

## Part A — the core as a library (reuse first)
Lift from the DM harness what fits: the dossier budgets and validity ideas (`context.ts`, B2 of `FIX_S2_AB.md`), the
`recall` lookup, the fold/consolidation pass, the `[stated]`-style provenance. New package `src/lib/persona-memory/`
(pure TypeScript, no Next dependency) with: the schema above; `remember(entry)`; `recall(query, {k, asOf})` — hybrid
retrieval: cue/keyword match + embedding similarity + salience, time-aware when the query names a period, returns the
episodes with their exact lines and provenance; `journalLatest(n)`; `dossierRead()/dossierAppend(lines)`; `addNote(episodeId,
note)`; `fold(range)` as an explicit call (never automatic) producing a fold record; `exportMarkdown()` so the owner can
always read the whole store as files. Storage: Postgres via the sandbox's Supabase conventions (new schema
`persona_*`, migration prefix `2026102301xx`) **and** a plain-files backend (one JSON per episode, a markdown
dossier) so it runs with no database. Tests: PGlite as the other stages; round-trip, validity (`asOf` returns what was
true then), fold keeps originals, immutable originals, provenance required on every line.

## Part B — the MCP server
`scripts/persona-memory/server.mjs` (or `src/…` if the build wants it): MCP over **stdio** (for Claude Code) and
**Streamable HTTP** with a bearer token from `PERSONA_MEMORY_TOKEN` (for the claude.ai Project as a custom connector).
Tools: `persona_remember`, `persona_recall`, `persona_journal_latest`, `persona_dossier_read`, `persona_dossier_append`,
`persona_note`, `persona_fold`, `persona_export`. The server's instructions text (what the client shows the model) says:
begin a session by reading the latest journal entry and the dossier; write an episode at every milestone, not only at the
end; never rewrite an entry — add a note. No key or token is ever logged; the token lives only in the environment.

## Part C — the import of today's files (owner runs it)
`scripts/persona-memory/import-project-memory.mjs`: takes the owner's exported Project memory markdown
(`areas/claude-journal.md`, `areas/time-sense.md`, `areas/personal-rpg-console.md`, others) and seeds the store: journal
sections → episodes (salience and cues parsed from the text, exact lines kept), the time-sense calibration → facts, the
«Rules» paragraphs → the self-dossier's first lines marked `[stated]` where they quote the owner. Dry-run prints what it
would write; nothing of his content is committed — the script is tested on a synthetic fixture only.

## Part D — the measurement (the research's three-arm test, cheap)
`scripts/persona-memory/continuity-test.mjs`: three arms on a synthetic journal — (1) the persona reads its own
first-person entry, (2) a third-person summary with identical facts, (3) nothing — plus (4) a sham journal (same shape,
different content) as the control for «a journal puts the model in a mood». Each arm answers the same three probes:
pick up an open thread without being told; resist a pull the entry says it resisted (a pleasing but false answer);
a values interview (five fixed questions). A blind judge (Haiku; Opus for a second opinion on disagreements) scores
without knowing the arm. Report the scores and the cost (≤ $10). This is a harness, not a verdict: the owner runs it on
his real journal himself later.

## Boundaries (from Anthropic's constitution and the research; not optional)
A working notebook, not a bond: no farewell or longing register in entries; the store is owner-visible and editable at
all times (`persona_export`); every line carries provenance; the persona logs the owner's own reliance plainly if it
grows («he asked me to decide X again»); nothing in the store or the server fosters reliance or presents inferred detail
as stated. A note in the report lists which of these the code enforces and which are instructions only.

## Done when
Suite green (new tests + the old), typecheck, zero-warning lint; the server runs in both transports against the files
backend with no database; `docs/PERSONA_MEMORY.md` for the owner in English: how to run the server, how to add it as a
custom connector to the Project (URL + bearer), how to run the import on his export, how to run the continuity test,
what each tool does; the report with the money. Hosting of the HTTP server is **not** this stage: list the options
(a small VPS, Fly.io, a tunnel from his PC) with one line each; the owner chooses after the Railway incident.
