# Fix: a long DM turn no longer gets stuck — owner report

Branch `claude/stage-fix-turn-lease` (from `claude/session-2-prep`). No paid model calls; tests ran on throwaway
databases only. Your database and the app on port 3000 were not touched.

## What went wrong in session 2

When the DM starts a turn, the server reserves that turn for five minutes. That reservation is called a lease, and it
was never extended. A deep-thinking turn that took a little over five minutes (ten Opus requests) found its
reservation gone when it tried to save, and gone again when it tried to record the failure. So the turn was neither
saved nor marked as failed: it stayed "The DM is composing a response…" forever.

Then two more things went wrong. The screen offered «Повторить» (retry), but the server refused a retry of a turn in
that state. And the page kept the refused retry in the tab's memory and sent it again on every later click, so
«Отказаться» (cancel) also sent the old retry and was refused too. Reloading the page didn't help.

## What changed

1. **The reservation is extended while the DM works.** Each time the turn records a tool result or saves its progress,
   the five minutes start again. A turn can take as long as it needs, as long as it keeps making progress. If another
   attempt has already taken the turn over, the old attempt can no longer write anything, same as before.
2. **A stuck turn can be retried.** If a turn's runner goes silent, «Повторить» now picks the turn up from its last
   saved step. Dice already rolled stay rolled, and a turn that had already finished writing is simply saved, with
   no new request to the model. «Отказаться» works as before.
3. **A refused button press is forgotten.** If the server refuses a retry or cancel (for example, because the turn's
   state changed in the meantime), the page drops that command. The next button you press sends what you chose. If
   the connection drops and the page can't tell whether the server got the command, it still re-sends the same command
   (so a reroll is never granted twice).

## What to try

There's no switch to turn on. Install the branch in the sandbox the usual way: the new database update (migration 71)
applies when the sandbox starts.

- Play session 2 with deep thinking on tense scenes as planned. A long turn should end normally: the narration
  appears, the stats show its length, and the composer is free again.
- If a turn ever does stay on "The DM is composing…" for more than five minutes with nothing streaming, press
  «Повторить»: it should finish the turn from where it stopped. «Отказаться» should cancel it on the first press.

## Checks

| Check | Result |
| --- | --- |
| Typecheck | pass |
| Lint (zero warnings) | pass |
| Build | pass |
| The fix's own tests (`tests/dm-loop-turn-lease.test.mjs`) | 7 of 7 pass; without the fix, the tests for it fail |
| Full test suite | 2,627 tests: 2,598 pass, 27 skipped, 2 fail |

The 2 failures are the same two Windows line-ending quirks earlier reports listed (a style file and the sandbox
settings file). They're unrelated to this fix. The 27 skipped tests need a separate test server and are skipped on
purpose.

## Known limits

- If a single model request on its own runs longer than five minutes, «Повторить» shows up while it is still running.
  If you leave it alone, the turn finishes normally. If you press it, the retry takes the turn over and the old
  attempt stops cleanly; nothing is applied twice.
- Retrying a turn whose DM stopped without the closing step may cost one more model request. That was already true
  for any retried turn.
