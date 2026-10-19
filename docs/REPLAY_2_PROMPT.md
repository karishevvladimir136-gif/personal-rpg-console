# Message for the local Claude session: update the sandbox to the voice stage, load the bank, replay session 1 with four voice variants

Send to the local session on the owner's laptop (the one that runs the sandbox), after the voice stage (branch
`claude/voice`; the stage's report is `docs/runs/voice-report.md`). The owner first saves his passage bank from the
project file «голос/отрывки_ru» as a plain text file **outside the repository**, for example
`C:\dev\rpg-exports\voice\bank-source.md` (the repo is public: the bank never goes into git, a log, a fixture or a
sample).

```
Owner request: update my sandbox to the voice stage, load my passage bank into «Образцы голоса», then replay session 1
blind with four voice variants for the planner. Talk to me in RUSSIAN, briefly.

Hard rules: sandbox only (the Supabase project «personal-rpg-console-sandbox», ports 4432x; the sandbox app on :3100) —
never my real project and never port 3000; never print, log or commit a key; nothing to main; paid calls only within the
caps below. My bank and the samples contain my campaign's text and other authors' passages, and the repo is public:
never commit or push the bank, the converted file or the samples; never paste a passage into a message, a log or a test.

1. Update the sandbox. In the checkout the sandbox runs from: fetch, check out origin/claude/voice, pnpm install, apply
   the new migration (70, `202610190070_voice_stage.sql`) to the sandbox database the way the sandbox start script
   applies migrations, restart the sandbox app on :3100. Check and tell me: Settings → «Образцы голоса» shows the
   three-way «Образцы в подсказке ведущего» (Выключено · Пять · Все) with «Выключено» selected and the new format text
   (`---` between passages, `## вид` at the head of a passage).

2. Convert the bank. Read C:\dev\rpg-exports\voice\bank-source.md (the project file's format: each passage has a
   source line naming the author/book and a kind). Write C:\dev\rpg-exports\voice\bank.md in the repository's passage
   format: drop every source line (author, book, page — nothing that names where a passage comes from), keep one
   `## <kind>` line at the head of each passage (торг, ссора, быт, драка, тишина, смешное, переход…, as the project
   file labels them), separate passages with a line `---`, keep the passages' text otherwise untouched. Tell me how
   many passages and how many kinds the file has, and roughly how many characters (not a word of the text).

3. Load the bank. Campaign: the one of session 1 (hero «рэй», world «Ржавое побережье»). Either paste bank.md into
   Settings → «Образцы голоса» (scope «Этой кампании») and save, or POST it to the sandbox's dossier route:
   POST http://127.0.0.1:3100/api/campaigns/<id>/dossier with {"action":"voice_save","scope":"campaign","samples":<the
   file's text>}. Leave «Образцы в подсказке ведущего» on «Выключено» (the replays set their own voice variant; my live
   play keeps today's prompt until I choose). Check with GET …/dossier?view=voice that the campaign's samples are
   there (report the length only).

4. Session 1's turns: the same eight as the writer page — the turns the transcript numbers 1, 16, 21, 23, 24, 34, 38
   and 41 (C:\dev\rpg-exports\session-1\transcript.md; match by the player's input text where a number does not
   match, as in the first replay, and say which). The snapshot list GET /api/campaigns/<id>/snapshots now lists every
   turn of session 1 (the voice stage fixed it) and the tool's --base path reads the route directly (fixed too): no
   workaround file is needed.

5. The writer: the one I chose on the writer page — put its letter in place of <W> below (A = Opus runs alone, C =
   Fable writes + Opus records, D = Opus writes + Sonnet records). If I have not told you, ask me once and wait.

6. Money. These replays are approved by me for up to $10 more: in docs/runs/voice-ledger.json raise capUsd from 8 to 18
   before the first paid run (commit only that file, or leave it uncommitted). Each run below reserves its own budget;
   the tool refuses to cross it.

7. The voice page — four runs, the same eight turns and the same writer, one voice variant each (the examples file is
   read at run time from outside the repo and never copied into the samples; only the passage count is recorded):
   node scripts/eval/real-replay/replay.mjs --base http://127.0.0.1:3100 --campaign <id> --turns <the eight> --variants <W> --craft all --voice off   --budget-usd 2.5 --out docs/samples/real-replay/s1-voice-off
   node scripts/eval/real-replay/replay.mjs --base http://127.0.0.1:3100 --campaign <id> --turns <the eight> --variants <W> --craft all --voice layer --budget-usd 2.5 --out docs/samples/real-replay/s1-voice-layer
   node scripts/eval/real-replay/replay.mjs --base http://127.0.0.1:3100 --campaign <id> --turns <the eight> --variants <W> --craft all --voice five  --examples-file C:\dev\rpg-exports\voice\bank.md --budget-usd 2.5 --out docs/samples/real-replay/s1-voice-five
   node scripts/eval/real-replay/replay.mjs --base http://127.0.0.1:3100 --campaign <id> --turns <the eight> --variants <W> --craft all --voice all   --examples-file C:\dev\rpg-exports\voice\bank.md --budget-usd 2.5 --out docs/samples/real-replay/s1-voice-all
   The «all» run's first turn writes the whole bank into the one-hour cache (dearer once, then almost free); if a run
   stops on its budget, say which turns it completed and do not restart it without asking me.

8. The metrics, once per folder set:
   node scripts/eval/voice-metrics.mjs docs/samples/real-replay/s1-voice-off docs/samples/real-replay/s1-voice-layer docs/samples/real-replay/s1-voice-five docs/samples/real-replay/s1-voice-all
   Save the table as C:\dev\rpg-exports\replay-2\metrics.md (outside the repo).

9. Pack. Zip the four folders docs/samples/real-replay/s1-voice-* together with the runs' records
   (docs/runs/real-replay-<time>.jsonl of each run) and metrics.md into C:\dev\rpg-exports\replay-2\samples.zip (create
   the folder; it is outside the repo). Delete nothing; do not commit or push the samples. Then tell me in Russian:
   which turns were used, the writer, the cost of each run and the total, any turn that failed or was refused, the
   metrics table in one glance (which variant has more particles, fewer short paragraphs, fewer quotable flags), and
   where the zip is — I will attach it to the planner's chat; the planner builds the blind page (prose and dialogue
   judged separately).
```
