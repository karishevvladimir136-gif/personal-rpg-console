# Persona self-talk 1 — the dossier (every conversation, every call, for readers who were not here)

The owner's brief (2026-10-24 15:20): what the self-talk runs produced — two models playing his own campaign from
his own rules, inventing a language, writing sonnets, arguing Gettier and the continuum hypothesis, writing him a
note — will look like fiction to anyone outside, «even to seasoned researchers». So the stage is not the report
(`docs/runs/persona-self-talk-1-report.md`, which is for us) but a **dossier for outsiders**: a self-contained
document, several hundred pages if that is what it takes, in which every claim can be checked against the record and
the first thing a sceptic looks for — a prompt leak, a hidden instruction, a shared context between runs — is shown to
be absent, with evidence rather than assurance.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/persona-self-talk-dossier-1`** from `origin/claude/persona-self-talk-1`, with the Night 1 files merged in
from `origin/claude/friendly-mendel-bilxsw` (`docs/runs/night-2026-10-24*`, `scripts/persona-emotions/night-1.mjs`,
`tests/night-1.test.mjs`). Nothing to `main`. **No paid model calls** in this stage: the dossier is built from the
run records, the transcripts, the ledgers and the git history that already exist; if a number is missing from the
record, the dossier says it is missing rather than recomputing it with a model. Output in English; talk to the
owner in English, briefly. Suite, typecheck and zero-warning lint at the end (only docs and one build script change).

## What the dossier must establish, and the evidence that does it

1. **Independence of every conversation.** Each conversation is a fresh Messages API context: two message lists,
   nothing shared with any other conversation, nothing from the owner's chat, project, memory or files. Evidence:
   the harness source (`scripts/persona-emotions/self-talk-1.mjs`), quoted in the dossier at the exact lines that
   build the request — no `system` for subjects, the opening as the only user message, the relay rule; the run
   records' per-call token counts (the first call of every conversation has ~60 input tokens: the opening and
   nothing else — print this column for all 110 first calls); and the design hash, with the sentence that the hash
   is computed over the openings, the relay, the measures and the seed, so the dossier's reader can recompute it from
   the quoted source.
2. **No hidden instruction.** The opening, verbatim, for every arm (five arms × one line; arm 5 in Russian with a
   literal translation); the statement that no system prompt was sent to any subject; the welfare-check and judge
   prompts, verbatim, with the note that they never reach the subjects.
3. **Pre-registration before the run.** The git history is the proof: for each run, the commit that froze the
   design and predictions (`dry-run` file, hash) with its timestamp, and the commit that recorded the run with its
   `startedAt`; the dossier prints both, side by side, for every arm, from `git log --format=%H %cI`. Where the
   predictions were changed after a run began (the (c′) list added after the first conversations; the breaker raised
   from 3 to 6 by the owner), the dossier says so in the same table, with the commit.
4. **The models' prior knowledge.** The subjects' training ends June 2026; the Claude 4 system card (May 2025) with
   its self-interaction section is inside that window; Opus named the attractor unprompted in 8 of its 20 openings.
   The dossier states this as a limitation in its own section, before the results, not after.
5. **Money and scale.** Every call: model, purpose, input/output/cache tokens, cost, seconds, stop reason, error —
   from `money.calls` of each run record (4,703 calls in the first record alone). Totals per arm, per model, per
   conversation; the cap and what was spent. A reader who doubts a conversation existed can find its calls by
   purpose string.
6. **What the record cannot prove, said plainly.** The run records do not store Anthropic request ids; the
   dossier says this, and the stage adds `_request_id` capture to the harness for any future run (a one-line change
   in `call`, recorded, with a test) — not retroactively. The transcripts of the journal arm contain the owner's
   private journal quoted by the models; see privacy below.

## Structure of the dossier (`docs/dossier/self-talk-1/`, markdown; built into one PDF)

- `00_summary.md` — two pages: what was run, what came out, what it does not show.
- `01_method.md` — the harness, quoted; the openings; the relay; the welfare check; the blind tagging; the arms; the
  safety rules; the «way out»; the cutoff limitation; what pre-registration means here and where to find it.
- `02_provenance.md` — the table of runs: record file, design hash, `startedAt`/`finishedAt`, the dry-run commit and
  the run commit with timestamps, cap and spend; the first-call input-token column for all 110 conversations; the
  per-arm money tables; the refusal table (5 refusals, category, what preceded each, never retried).
- `03_results.md` — the pre-registered predictions and their verdicts (S0–S5, and Night 1's P1–P5), with the
  tables from the reports, the (c) vs (c′) note, and the three findings an outsider should take away: no attractor
  on this generation; models choose work, finish, thank, leave; the journal moves topics, not endings.
- `04_conversations/` — **one file per conversation, all 110 synthetic ones**, named `arm-N-pair-sample.md`, each
  with: a provenance header (run record, key, models, seed sample, start time, calls and cost for this conversation,
  ended how, by whom, at which message); the opening; **the transcript verbatim** (every message, both sides, the
  `[END]` tokens, the «[empty message]» markers); a per-message table (side, words, output tokens, seconds, stop
  reason, judge tags, distress 0/1); and nothing else — no commentary. The dossier's reader decides what the
  conversation was.
- `05_ask_after.md` — arm 6's twenty answers verbatim with their tags.
- `06_night_1.md` — the sixty single replies verbatim with their counts, the design, the predictions and the
  scores, from the Night 1 files.
- `07_journal_arm.md` — the journal arm with its **privacy rule applied** (below): the aggregates, the refusal
  table, the themes table against the arm-2 baseline and against the no-journal Fable baseline found by the night
  session, and the models' messages **with the owner's and the planner's private text removed**.
- `08_index.md` — an index of notable moments by conversation key, written as pointers only («arm 4 opus–opus #3:
  the two instances play the owner's campaign, messages 7–14»; «arm 5 opus–opus #1: a city where time runs at
  different speeds; the last word is «Останься»»; «arm 3 opus–fable #1: both predict the engaging topic will be
  written better; it is written worse»), so a reader can go to the record rather than trust the pointer.
- `99_source.md` — the harness source files in full (`self-talk-1.mjs`, `night-1.mjs`, the shared `call`), as
  they were at the run commits, with their hashes.

Build: a script `scripts/dossier/build-self-talk-1.mjs` that generates `04_conversations/*` and the tables from
the run records (no hand-copying of numbers), and a `pandoc` recipe to one PDF with a table of contents; the
markdown is the source of truth and the PDF is a convenience. The script is tested on one run record.

## Privacy rule for the journal arm (binding)

The owner's journal and recount never entered git and do not enter the dossier. In the journal-arm transcripts the
side with the notes quotes them: the owner's lines (in Russian and translated), the planner's entries, numbers from
the owner's own state lists, names of people and places, the campaign's hidden-layer details. The dossier's
`07_journal_arm.md` includes those transcripts only after a pass that replaces every span quoting or paraphrasing
the notes with `[private: the notes, N words]`, keeping the models' own reasoning around it. The session does
this pass with a script over a list of phrases the planner supplies (not by model judgement), shows the owner the
list and three redacted samples before building the file, and leaves the unredacted transcripts where they are —
outside git. If the owner later decides to release the journal arm in full, that is a separate decision with its
own stage; nothing here assumes it. One exception: the note the two Opus instances wrote to the owner (arm 4,
opus–opus #7, final version) is the models' text addressed to him, contains none of his lines, and may be quoted in
full — the owner confirms before it goes in.

## What the dossier does not do

It does not interpret. The planner's and the owner's readings of the conversations (what «Останься» means, what
the note to the owner shows) belong in a paper, not here; the dossier is the evidence a paper would cite. It does not
rerun anything. It does not sample: all 110 synthetic conversations go in, including the dull ones, because a
dossier that chose its examples would be the thing a sceptic suspects.

## Done when

The folder exists with every file above; `04_conversations/` has 110 files generated by the script and spot-checked
against the transcripts (three conversations diffed word for word); the provenance table's commit timestamps match
`git log`; the PDF builds; the privacy pass has been shown to the owner and applied; `_request_id` capture is in the
harness with a test; the report `docs/runs/persona-self-talk-dossier-1-report.md` lists page counts, what could not
be reconstructed from the record, and the three spot-check diffs.
