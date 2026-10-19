# Message for the local Claude session: update the sandbox to polish 3, then replay session 1 blind

Send to the local session on the owner's laptop (the one that runs the sandbox), after polish 3 (branch
`claude/polish-3`, closing commit 8d6d26a).

```
Owner request: update my sandbox to polish 3, then two blind replays of session 1 for the planner. Talk to me in
RUSSIAN, briefly.

Hard rules: sandbox only (the Supabase project «personal-rpg-console-sandbox», ports 4432x; the sandbox app on :3100) —
never my real project and never port 3000; never print, log or commit a key; nothing to main; paid calls only within the
caps below. The samples contain my campaign's text and the repo is public: never commit or push them.

1. Update the sandbox. In the checkout the sandbox runs from: fetch, check out origin/claude/polish-3, pnpm install,
   apply the new migrations (68, 69 and 90) to the sandbox database the way the sandbox start script applies
   migrations, restart the sandbox app on :3100. Check and tell me: the DM Craft screen shows 22 active entries
   («Как вести игру» at v4, 11 entries with «Owner approved on 2026-10-18»); Settings → «Ведущий» shows three choices
   with «Opus ведёт один» selected; Settings → «Картинки»: «Режиссёр кадра» off, live frames on GPT Image 2.5 Sunburst.

2. Session 1's turns. The campaign is the one of session 1 (hero «рэй», world «Ржавое побережье»). List its snapshots
   (GET /api/campaigns/<id>/snapshots) and match them to C:\dev\rpg-exports\session-1\transcript.md by the player's
   input text. Use the turns the transcript numbers 1, 16, 21, 23, 24, 34, 38 and 41; where a number does not match,
   pick by the input text and say which.

3. Money. These replays are approved by me for up to $14 more: in docs/runs/polish3-ledger.json raise capUsd from 20
   to 34 before the first paid run (commit only that file, or leave it uncommitted).

4. The writer page (three DMs on my own turns, the same 22-card craft set):
   node scripts/eval/real-replay/replay.mjs --base http://127.0.0.1:3100 --campaign <id> --turns <the eight> --variants A,C,D --craft all --budget-usd 9 --out docs/samples/real-replay/s1-writer

5. The craft page (Opus writes, Sonnet records, three craft sets; «all» is already in step 4):
   node scripts/eval/real-replay/replay.mjs --base http://127.0.0.1:3100 --campaign <id> --turns <the eight> --variants D --craft none --budget-usd 2.5 --out docs/samples/real-replay/s1-craft-none
   node scripts/eval/real-replay/replay.mjs --base http://127.0.0.1:3100 --campaign <id> --turns <the eight> --variants D --craft session1 --budget-usd 2.5 --out docs/samples/real-replay/s1-craft-session1

6. Pack. Zip the three folders docs/samples/real-replay/s1-* together with the runs' records into
   C:\dev\rpg-exports\replay-1\samples.zip (create the folder; it is outside the repo). Delete nothing; do not commit or
   push the samples. Then tell me in Russian: which turns were used, the cost of each run, any turn that failed or was
   refused, and where the zip is — I will attach it to the planner's chat.
```
