# Audit of the session 3 candidate — paid-call ledger

Task: `docs/stages/AUDIT_S3.md` (on `origin/claude/handoff`). Cap **$10**. Paid calls are allowed only through the app's
own probes, and only for a check that cannot be settled by reading code and tests.

| # | When (UTC) | What | Model(s) | Provider-measured spend | Running total |
| --- | --- | --- | --- | --- | --- |
| — | 2026-10-20/21 | No paid probe was run: every check was settled from the code on HEAD, the tests and the committed probe records (`docs/runs/20261020-18*`, `real-replay-20261020-18*`). | — | $0.00 | **$0.00** |

The audit's own agents ran on the session's subscription, not on the app's keys; `.env.local` was written from the
`APP_*` variables at session start and never read by any agent.
