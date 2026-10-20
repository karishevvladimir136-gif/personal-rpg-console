# Unstick one turn in the sandbox (session 2, 2026-10-19)

For the local Claude Code session on the owner's PC. Report in English, short.

**Scope: the sandbox only** — the app on `127.0.0.1:3100` and the sandbox Supabase project
«personal-rpg-console-sandbox» (ports 4432x). Never the owner's real database, never port 3000. Do not print keys,
`.env.sandbox` or `owner-login.txt`. Do not restart the app unless step 3 needs it.

## What happened

Campaign `d65fefb9-45dd-4534-8b2b-7a8e0dc794fc`, turn (operation) `8a6f627f-5cb2-41bd-bd8c-c2446a91804b`.
The DM loop finished the turn (10 requests, 13 rolls) and the commit failed: `dm_loop_failed code=conflict
retryable=false` (most likely a background picture write moved the campaign revision). Since then the play screen shows
«Ведущий думает…» and «Попробовать снова», no «Отправить». Both «Попробовать снова» (`retry`) and «Отказаться от этого
действия» (`cancel`) post to `/api/campaigns/<id>/turns/<op>/resume` and get **422** every time (8× in app.log). A page
reload did not help. The owner cannot send a new action.

## Do

1. Read the turn row (read-only first):
   `select id, status, failure, retryable, lease_until, expected_revision, updated_at from rpg_private.turns
    where id = '8a6f627f-5cb2-41bd-bd8c-c2446a91804b';`
   Also the campaign's current runtime revision, and whether any other turn of this campaign is not
   `committed`/`cancelled`/`failed`.
2. Find why `cancel` returns 422: reproduce the UI's request shape (see `gameplay-turn.tsx` → `onCommand("cancel")`,
   `request-validation.ts` → resume input, `dm-loop/loop.ts` → `resumeDmLoopTurn`, `dm-store.ts` → `rpc("cancel")`,
   the active `rpg_runtime(... 'cancel' ...)` definition). Note the exact error (validation field, SQL assert,
   `requireRule`). Do not change code now — write it down for the fix cycle.
3. Unstick with the least change:
   - preferred: cancel the turn through the app's own path with a valid payload (the same RPC the UI should have
     called), so the database records it as `cancelled` with its command row;
   - only if that is impossible: in one transaction update exactly this one row —
     `status = 'failed', failure = 'conflict', retryable = false, lease_token = null, lease_until = null,
      updated_at = now()` where `id = '8a6f627f-…'` and `status not in ('committed','cancelled')` — check that exactly
     one row changed, commit. Touch nothing else (no other turns, no history, no records).
4. Tell the owner to reload the play page: the composer should show «Отправить» again with no pending turn.
5. Report: the row before/after, which way you unstuck it, the exact cause of the 422 on `retry` and on `cancel`, and
   whether the client re-reads the turn after a 409 (it did not). Commit nothing to the app branches.
