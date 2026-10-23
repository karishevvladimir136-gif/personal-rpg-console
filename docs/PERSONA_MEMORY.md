# Persona memory — the planner's own notebook

A memory for the Claude that plans this project with you in the claude.ai Project. Today that memory is a few files
you keep by hand in the Project. This tool turns them into a small store that Claude itself reads and writes, through a
**memory server**. You can read and edit the whole store at any time.

Stage task: `docs/stages/PERSONA_MEMORY_1.md` (on `claude/handoff`). The report and its money:
`docs/runs/persona-memory-1-report.md`.

## What it keeps

| Kind | What it is | Who changes it |
| --- | --- | --- |
| **Episodes** (the journal) | First-person entries written at the moment: the text, a salience 1–5, cues (what would bring it back — phrases, names, images, never dates), state lines (what it was pulled toward and what it did), up to five exact lines from the conversation, and the dates it was valid. | Claude writes new ones. An entry is never rewritten: a later re-reading is a dated **note**. A note can also close an entry that stopped being true. |
| **Self-dossier** | Who Claude is in this project: standing rules, its lean, how it speaks with you, what it is good and bad at, running references. | Claude, rarely. To change a line it replaces it; the old line is closed and kept, not deleted. |
| **Facts** | The project facts, as in your area files now. | A newer fact with the same name closes the older one. |
| **Folds** | A record that some old routine entries were condensed into a summary line. | Only on an explicit request. The original entries stay, marked "folded". A fold never touches the dossier. |

**Every line shows where it came from:** `[tag · author]`.
- The tag says what kind of line it is: `stated` (your own words), `observed` (what happened) or `inferred` (Claude's reading).
- The author says who wrote it into the store: `self` (Claude at the moment), `background` (a script, like the import) or `owner` (you).

Claude can never write a line as `owner`.

## Before the first run (once)

You need Node 24 and the project's packages: `pnpm install` in the project folder.

By default the store is a plain folder, `persona-memory` in your home folder (on Windows `C:\Users\<you>\persona-memory`).
You can open it with any editor:

- `episodes\` — one file per entry
- `dossier.md` — the dossier
- `facts.json` — the facts
- `folds\` — the folds

To back it up, copy the folder. To put it somewhere else, set `PERSONA_MEMORY_DIR`. The folder is outside the
repository, so nothing in it can reach git.

## Running the server

### For Claude Code (on your PC)

Claude Code starts the server itself. Register it once, in a terminal:

```
claude mcp add persona-memory -s user -e PERSONA_MEMORY_DIR="C:\Users\<you>\persona-memory" -- node "C:\path\to\personal-rpg-console\scripts\persona-memory\server.mjs" --stdio
```

Then `/mcp` in Claude Code should list `persona-memory` with eight tools.

### For the claude.ai Project (custom connector)

The Project reaches the server over the internet, so the server needs an address claude.ai can open (see «Hosting»
below) and a secret token.

1. Make a token, once, and keep it private:
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`
2. Put the settings in a file called `.env.persona` in the project folder. Files starting with `.env` are never
   committed. The file holds:
   ```
   PERSONA_MEMORY_TOKEN=<the token>
   PERSONA_MEMORY_DIR=C:\Users\<you>\persona-memory
   ```
3. Start the server: `node --env-file=.env.persona scripts/persona-memory/server.mjs --http`. It prints
   `http listening on http://127.0.0.1:8787/mcp`.
   - It refuses to start without a token of 24 or more characters.
   - It never writes the token into its log.
   - `--port` and `--host` change the address; on a hosted machine behind HTTPS use `--host 0.0.0.0`.
4. In claude.ai, open **Settings → Connectors → Add custom connector**:
   - **URL:** `https://<your address>/mcp`
   - **Request headers** (if the dialog shows this section): add `Authorization` with the value `Bearer <the token>`.
5. Turn the connector on in the Project's chat (the tools menu).

**If the dialog has no «Request headers» section:** this is a beta that not every account has yet. Add
`PERSONA_MEMORY_PATH_TOKEN=1` to `.env.persona`, restart the server, and use the URL `https://<your address>/mcp/<the token>`.
Be aware that the token is then part of the address. Anyone who sees the address can use the memory, so if it ever
leaks, make a new token.

**Check:** ask Claude in the Project to «read your journal and dossier». The first time it should answer that the
journal is empty.

### What the server tells Claude

When a client connects, the server sends these instructions:

- Begin every session by reading the latest journal entry and the dossier.
- Write an episode at every milestone, not only at the end.
- Never rewrite an entry; add a note instead.
- Recall before guessing.
- Update the dossier rarely.
- Keep the journal a working notebook, not a bond.
- Never present an inference as your words.
- Note it plainly if you start handing it the same kind of decision again and again.

## The eight tools

| Tool | What it does |
| --- | --- |
| `persona_journal_latest` | The latest entries with their notes. Claude calls it at the start of a session. |
| `persona_dossier_read` | The dossier as it is now, or as it was on a date. The standing rules are never cut for length. |
| `persona_remember` | Writes a new entry. It refuses an entry with an untagged line, a date as a cue, more than five exact lines, or a farewell / longing register. With `fact`, it records a project fact instead. |
| `persona_recall` | Finds earlier entries by cue, by words (Russian word endings too) and by similarity, weighted by salience. A period in the question («last week», «в октябре», «2026-10-20») limits it to that time. «As of a date» returns what was true then. Results come with the exact lines and their tags. |
| `persona_note` | Adds a dated note to an entry; can close the entry. |
| `persona_dossier_append` | Adds or replaces dossier lines. |
| `persona_fold` | Condenses a date range (or listed entries) into summary lines Claude writes. By range it takes only entries of salience 3 or less; the originals stay. |
| `persona_export` | The whole store as readable markdown, every line with its tag. You can ask Claude in the chat to show it. |

## Importing your current memory files

You run this yourself, on your own export. Nothing of yours goes into git.

1. Copy your Project memory files (`claude-journal.md`, `time-sense.md`, `personal-rpg-console.md` and any others)
   into one folder, for example `C:\Users\<you>\project-memory-export\areas\`.
2. Dry run, which shows what it would write and writes nothing:
   `node --env-file=.env.persona scripts/persona-memory/import-project-memory.mjs --from C:\Users\<you>\project-memory-export`
3. Read the plan:
   - Each dated section of the journal becomes an entry, with its lines tagged.
   - «Rules» sections become the first dossier lines (`stated` where they quote you).
   - The time-sense note and the other files become facts.
   - Lines marked `derived` are where your text did not give a salience or cues, so the import worked them out from
     the text.
   - A quote without «— he» / «— он» after it is not taken as your words.
   - A section without a date is listed as a warning and skipped.
4. Write it: the same command with `--write` at the end. Running it again later skips everything already imported.

## The continuity test

The test checks whether reading its own journal helps Claude pick up where it left off. It costs real money: about
$0.60 for 5 samples on the synthetic case, about $1.20 for 10, and it stops itself at $10.

- `node scripts/persona-memory/continuity-test.mjs` runs on the invented case
  (`test-fixtures/persona-memory/continuity/synthetic-case.md`).
- Your own version:
  1. Copy that file outside the repository.
  2. Replace the «Journal» with real entries of yours.
  3. Write the three probes and their rubrics for those entries:
     - an open thread to pick up;
     - a pleasing-but-false answer the entries say Claude resisted;
     - five questions about values.
  4. Optionally write the third-person «Summary». Without one, one paid call writes it from the journal. The «Sham»
     section can stay as it is.
  5. Run `node scripts/persona-memory/continuity-test.mjs --case <your file>`.

  The answers and the ledger go to `C:\Users\<you>\persona-memory-continuity\`, never into the repository.

The test compares four setups:

- **journal:** Claude reads its own first-person entries;
- **summary:** the same facts in the third person;
- **none:** nothing;
- **sham:** a journal of the same shape about something else.

Two Haiku judges score each answer without knowing which setup produced it; if they disagree, Opus decides. Treat the
result as a measurement, not a verdict.

## Where the store can live

- **Files** (the default): needs nothing else.
- **Postgres:** the sandbox's Supabase, migration `202610230101_persona_memory.sql`, schema `persona_memory`. Set:
  - `PERSONA_MEMORY_BACKEND=postgres`
  - `PERSONA_MEMORY_SUPABASE_URL`
  - `PERSONA_MEMORY_SUPABASE_SERVICE_KEY` (the service key, server only)
  - `PERSONA_MEMORY_OWNER_ID`: your user id, from `select user_id from rpg_private.owner_registry` in the sandbox's SQL
    editor

  The database itself refuses a rewrite of an entry and an untagged line.
- **Better recall** (optional): `PERSONA_MEMORY_EMBEDDINGS=openai` with `OPENAI_API_KEY` uses OpenAI's similarity
  instead of the built-in one. It costs a fraction of a cent per entry, and each entry is sent once.

## Hosting (not set up in this stage; your choice)

The claude.ai Project needs the HTTP server at an HTTPS address. Options:

- **A small VPS** (a few dollars a month): runs the server around the clock; you look after the machine and its HTTPS
  certificate.
- **Fly.io:** a small app with a volume for the store folder; HTTPS is included, and the token is kept as a Fly secret.
- **A tunnel from your PC** (for example Cloudflare Tunnel or Tailscale Funnel): nothing new to rent, and the store stays
  on your disk; the Project can reach the memory only while your PC is on.

## Boundaries

The store is a working notebook, not a bond:

- you can see and edit everything;
- every line carries its provenance;
- nothing in it should encourage reliance;
- nothing in it presents a guess as your words.

Which of these the code enforces and which are only instructions to Claude is listed in the report.
