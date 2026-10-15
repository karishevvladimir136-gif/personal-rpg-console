# Phase 3 local preview and memory

This remains a private local application. Do not deploy or import real campaign/private material. Existing Phase 2 Supabase/Auth and Astra/xhigh configuration is reused; no new key or service is required. Never paste credentials into chat.

## Open the preview

Keep Docker Desktop running. Open **http://127.0.0.1:3000/campaigns** and use the existing synthetic owner account. If the development server is stopped, open a terminal in this repository and run `npm run dev -- --port 3000`; leave that terminal running. Credentials remain only in the ignored local setup files described in SUPABASE_SETUP.md.

The acceptance fixtures are **Synthetic Phase 3 · Lantern Harbor** and **Synthetic Phase 3 · Frost Circuit**. Earlier synthetic campaigns are preserved. Migrations 005–007 have been applied to the backed-up disposable local database. A new disposable database needs all seven committed migrations in order. Do not reset/reseed the populated acceptance database.

## What to click

1. Open a campaign's **Game**. **END SESSION** saves the current point immediately. A public recap may then show preparing, ready or retry status.
2. Open **Sessions** to inspect a saved session and expand its saved resume point. Original transcript records remain available separately.
3. Choose **Continue from saved point**. If a roll/action is pending, review that same recorded result and explicitly finish or cancel it. Then choose **Continue to next session**. Starting a session does not heal, replenish items or advance world time.
4. **Retry recap**, **Continue preparing recap** or **Refresh saved session** processes another bounded batch when needed. A failed recap does not lose exact gameplay records. After a correction, stale recaps are withheld until rebuilt from valid original records.
5. Global **General Settings → Interface Language** switches English/Russian. Stored owner text and extractive source quotations retain their original language.

Session ending/resuming is not the future Save/Load feature. The dedicated Saves screen and timeline forks remain queued in PHASE3_5_BRIEF.md until owner acceptance of Phase 3 and separate authorization.

## Operational behavior

- Context retains exact current state, rules/guidance, valid resume metadata, uncovered evidence, relevant canon/history and a bounded set of recent complete exchanges. The 64,000 operational input cap and 80% pressure threshold remain independent of Astra's larger window.
- Supporting summaries are extractive structured selections, not a replacement transcript. Complete paragraphs retain qualifiers. An indivisible source exceeding 24,000 UTF-8 bytes pauses safely; split an oversized owner document into coherent paragraphs rather than removing important context. Oversize mandatory state/input also pauses.
- PostgreSQL simple/English/Russian text search and aliases provide up to 12 public historical excerpts (and a separate bounded private planning path). Unknown NPC knowledge is withheld. Ambiguous/missing essential history pauses or requires clarification.
- Each lifecycle request processes at most four jobs; new-turn preflight processes at most two. Jobs fence leases and publish coverage in order. Automatic lease recovery is capped; a new explicit owner retry starts another bounded attempt window. A repeated request ID reuses its saved result. Polling reads status only and never generates.
- Model failures preserve raw history, prior valid coverage and input. Fix the provider/configuration or source issue, then explicitly retry. No model fallback, hidden roll regeneration or checkpoint rollback occurs. Memory is not a backup; the ignored local pre-migration dump is separate recovery protection.

## Verification tools

Normal checks: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` (HTTP tests need a running preview). The ordinary opt-in empty-database seed test stays skipped on the populated local database; current live checks use append-only synthetic fixtures.

`scripts/memory-app-acceptance.mjs prepare` appends a synthetic pair, a real pending server roll and one explicitly injected failed supporting job, with no model calls. It will not overwrite an existing report. `correct` performs one synthetic source correction; `verify` checks real Auth/API/RLS, campaign separation, feedback exclusion, stable dice, relogin and production client privacy without calling a model. These commands use the existing ignored `.env.local` / `.env.acceptance.local` and disposable-test opt-in; they are not safe for real campaigns.

`scripts/memory-live-acceptance.mjs prepare` checks fixed synthetic contexts without calling OpenAI. `run 1` through `run 4` require `RPG_ALLOW_LIVE_MEMORY_TESTS=BOUNDED_SYNTHETIC_PHASE3` and explicitly configured Astra/xhigh. The harness reserves requests durably, limits its portion to 36 requests and $15 estimated usage (leaving room within the overall 48-request envelope for application checks), stops on failure and never reruns completed cases automatically. Model outputs require separate rubric review; successful HTTP/schema validation alone is not a quality pass. Ignored reports contain only synthetic outputs and minimized diagnostics, not credentials.

Physical iPhone/Safari and the optional Phase 1 conflict-rebase confirmation remain unverified. No perfect-memory claim is made.
