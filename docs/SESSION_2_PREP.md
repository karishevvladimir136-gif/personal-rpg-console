# Message for the local Claude session: get the sandbox ready for session 2 (no blind pages)

The owner decided on 2026-10-18 to test everything in real play instead of more blind pages: session 2 runs on
**Opus alone** (the writer page: Opus alone 5 of 8, Fable + Opus 3, Opus + Sonnet 0), **all 22 DM Craft entries** with
the per-situation routing (the craft page was a tie), **the new voice layer with five examples**, and **deep thinking
on hard scenes**. Send to the local session on the owner's laptop.

```
Owner request: get my sandbox ready for session 2. No paid replays. Talk to me in RUSSIAN, briefly.

Hard rules: sandbox only (Supabase «personal-rpg-console-sandbox», ports 4432x; the app on :3100) — never my real
project and never port 3000; never print, log or commit a key; nothing to main. My passage bank contains other
authors' texts and the repo is public: never commit, push, log or paste it.

1. Code. Branch claude/session-2-prep from origin/claude/voice. One change, in src/lib/gameplay/dm-loop/depth.ts:
   deep thinking (the top of the depth range, xhigh by default) on hard scenes, not only on a climax. Today a tense
   turn (the DM's «tense» hint, three or more important people present, the main arc on its last step) thinks at the
   base (high); make it think at the top too. Keep the cap against sticking, but only for tense turns: at most three
   deep tense turns in a row, then back to the base until a climax or a calm turn resets it; a climax (active combat,
   the DM's climax hint, a due off-screen plan, a decisive player input, «важный ход») is always deep. Update the
   file's header comment and the tests that pin the old rule (tests/polish-group3.test.mjs, tests/stage4-dossier.test.mjs
   if it does), run them plus tests/voice-stage.test.mjs, typecheck and lint; commit and push the branch.

2. Update the sandbox to claude/session-2-prep: pnpm install, apply migration 70 (`202610190070_voice_stage.sql`) the
   way the sandbox start script applies migrations, restart the app on :3100.

3. Load my passage bank: C:\Dev\rpg-exports\voice\bank.md (already in the app's format: 45 passages, `## <kind>`,
   `---`). Save it into «Образцы голоса» for all campaigns (the owner-wide scope), so a new campaign gets it; report
   only the length and the passage count. If the examples mode («Образцы в подсказке ведущего») has an owner-wide
   default, set it to «Пять»; if it is per campaign only, tell me and I will set it after creating the campaign.

4. Check and tell me: DM Craft shows 22 active entries with «Как вести игру» v4; Settings → «Ведущий» = «Opus ведёт
   один»; «Картинки»: «Режиссёр кадра» off, live frames on GPT Image 2.5 Sunburst; the voice samples are saved.

After session 2 I will ask you for the mission report (docs/SESSION_REPORT_PROMPT.md into C:\Dev\rpg-exports\session-2\).
```
