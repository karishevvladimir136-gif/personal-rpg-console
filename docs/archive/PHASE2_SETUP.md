# Local Phase 2 setup and review

Phase 1 is owner-approved. Phase 2 is authorized for local implementation and synthetic acceptance only. No deployment or real campaign import is authorized. Check `DEV_STATUS.md` for the actual verification checkpoint; this guide does not claim acceptance has passed.

**September 18 checkpoint:** Phase 2 is READY FOR OWNER ACCEPTANCE, not owner-approved. Billing is configured and the bounded 26-turn Astra/xhigh synthetic test passed. Final typecheck, lint, 217 automated tests, production build, real local Supabase privacy/durability checks and browser checks passed; one empty-database test remains deliberately skipped on populated fixtures. See DEV_STATUS.md for actual calls, usage, failures, recovery and unverified items. No manual setup or additional paid test is required for review. Do not reset/reseed the database or recreate keys.

## What stays on this computer

The existing local Supabase database and owner account remain in place. Do not reset the database or repeat the Phase 1 account/seed procedure. The additive Phase 2 migration is applied after a local backup and deterministic checks. The runtime uses a server-only service credential behind verified owner/campaign authorization; ordinary browser credentials cannot call that private runtime RPC.

The agent can obtain the disposable local Supabase service credential from the existing CLI and place it directly in ignored `.env.local`. You should not copy it into chat. The application's server needs these names:

- Existing: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (or `SUPABASE_ANON_KEY`), `RPG_OWNER_USER_ID`.
- New: `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `OPENAI_DM_MODEL`, `OPENAI_DM_REASONING`.

None uses a `NEXT_PUBLIC_` prefix. `.env*`, backups, test credentials and local acceptance outputs are ignored by Git. Never put credentials in source files, documentation, screenshots or chat.

## Secure OpenAI setup for the owner

Do this when the agent reports that deterministic integration is green and asks for local OpenAI configuration.

1. Open [OpenAI Platform API keys](https://platform.openai.com/api-keys) in your browser and sign in. API billing is separate from a ChatGPT subscription. If the Platform says billing is required, use its Billing page to set up API billing and a spending budget you are comfortable with.
2. Create a project API key using **Create new secret key**. Name it something recognizable, such as `Personal RPG Console local`. Keep the key in that browser until the next steps are ready. Do not send it to the agent.
3. Open **File Explorer** and go to `C:\Users\<owner>\OneDrive\Documents\GitHub\personal-rpg-console`. Right-click `.env.local`, choose **Open with**, then **Notepad**. If it is not listed, use Notepad's **File → Open**, select **All files**, and open `.env.local` in that folder.
4. Preserve the existing lines. Add or replace these three lines locally:

   ```dotenv
   OPENAI_API_KEY=PASTE_YOUR_NEW_KEY_HERE_ONLY_IN_THIS_LOCAL_FILE
   OPENAI_DM_MODEL=gpt-6-astra
   OPENAI_DM_REASONING=xhigh
   ```

   Replace only the placeholder after `OPENAI_API_KEY=` with your actual key. No spaces around `=` are needed. The owner-selected baseline is **GPT-6 Astra with xhigh reasoning**. The [official Astra model page](https://developers.openai.com/api/docs/models/gpt-6-astra) confirms this model ID, `xhigh`, Structured Outputs and a 1,050,000-token context window (verified September 18, 2026). The [official migration guidance](https://developers.openai.com/api/docs/guides/latest-model) specifies `reasoning.effort` for Responses; the server sends `reasoning: { effort: "xhigh" }`.
5. Press **Ctrl+S**, close Notepad, and tell the agent only **“OpenAI is configured locally.”** Do not paste the file or key. The agent will check presence without displaying values, restart the local application, and perform the authorized small synthetic live test.

If a key was accidentally shared, revoke it on the API keys page and create a replacement. Do not send the replacement in chat.

## Explicit model and reasoning choices

`OPENAI_DM_MODEL` is required; a missing or unknown model never falls back to another model. `OPENAI_DM_REASONING` is server-only and applies to planning, narration and feedback alike. Supported values are lowercase:

| Explicit model | Reasoning choices | If reasoning is omitted | Verified context window |
| --- | --- | --- | --- |
| `gpt-6-astra` | `low`, `medium`, `high`, `xhigh`, `max` | `xhigh` (application baseline) | 1,050,000 |
| `gpt-5.4` | `none`, `low`, `medium`, `high`, `xhigh` | `none` (preserves previous behavior) | 1,050,000 |
| `gpt-5.4-mini` | `none`, `low`, `medium`, `high`, `xhigh` | `none` (preserves previous behavior) | 400,000 |

The previous models remain explicit owner-selectable alternatives, verified against their official [GPT-5.4](https://developers.openai.com/api/docs/models/gpt-5.4) and [mini](https://developers.openai.com/api/docs/models/gpt-5.4-mini) pages. Astra does not support `none` or `minimal`; the 5.4 alternatives do not support `max`. Invalid values, including a blank reasoning assignment, stop with a configuration error before a provider call. There is no automatic fallback, effort reduction or model switching.

The larger model window does not expand the application's context policy: the conservative 64,000 input cap, 5% model-window safety margin, complete-exchange limit and safe continuity pauses remain. The existing **4,096-token output reserve includes reasoning and the visible response**, with the existing 60-second request timeout. Incomplete or timed-out responses preserve input for retry. Strict Structured Outputs and public/private boundaries are unchanged. The configuration-only update made no live calls; subsequent live acceptance results and actual latency/usage are recorded separately in `DEV_STATUS.md`.

## If generation reports insufficient quota

An `insufficient_quota` generation response can require credit or limit changes for the API organization/project associated with the key. A successful model-access check alone does not prove generation is funded. Repeated retries do not fix billing/quota errors; see the official [error guidance](https://developers.openai.com/api/docs/guides/error-codes). During local acceptance the initial quota error cleared after the owner configured billing. A later `rate_limit_exceeded` is a temporary request/token limit: wait before using **Resume this turn**. Keep the same saved action; do not submit a duplicate or change models automatically.

1. Open [API Billing](https://platform.openai.com/settings/organization/billing), sign in, and select the organization used when you created this API key.
2. Check the available credit/billing status. If no funded API balance is available, use the billing page to add a payment method or credits only if you choose to do so. The owner chooses the amount.
3. If credit is available, open [Organization limits](https://platform.openai.com/settings/organization/limits) and check whether a spending or approved usage limit has been reached. Then open [Project settings](https://platform.openai.com/settings/), select the key's project, and choose **Limits** to check its spending limit. Keep any limit changes within a budget you choose; the agent will not purchase credits or change limits for you. The [official spend-limit guide](https://developers.openai.com/api/docs/guides/spend-limits) explains these separate limits.
4. Once API access is funded and within its limits, tell the agent **“API billing/quota is ready.”** Do not send keys, payment details or billing screenshots. We will resume the existing synthetic operation and then the remaining bounded acceptance checks.

## Opening the application

With Docker Desktop and the local preview server running, open [Campaigns](http://127.0.0.1:3000/campaigns). Use the existing synthetic owner account. Local test sign-in instructions remain in the ignored `test-results/LOCAL_TEST_LOGIN.txt`; enter credentials only in the application.

New campaigns do not silently acquire a rules engine. In campaign **Settings**, explicitly select the supported house profile and identify controlled/present characters, safe locations, nearby cargo and item rules. Existing free-text descriptions do not become mechanical powers. Save a current open session and location before play. The synthetic acceptance campaigns are prepared by the test procedure, so the owner can inspect them without editing JSON or source code.

Game remains the main free-text play screen. Dice are generated and recorded on the server; animation only displays that saved result. **Continue** accepts a pending visible roll, while an explicitly available **Reroll** spends the campaign's allowance. A failed request keeps the same input and operation for retry. Owner corrections or settings changes can invalidate a pending turn; review current state before submitting a new action.

**Chat with DM** is out of game. A proposed guidance change remains unapplied until **This session** or **Save for this campaign** is chosen. Manual guide edits and restores remain versioned. Changes affect future turns. FRAME/VIDEO remain inactive.

## Verification boundaries

- Ordinary tests use deterministic substitutes, embedded PostgreSQL with explicit test-only Auth, and unauthenticated HTTP checks against a running preview. These are separate from real Supabase and live OpenAI results.
- `scripts/gameplay-app-acceptance.mjs` uses the real local owner/non-owner accounts and application APIs. It appends two new synthetic campaigns, preserves existing campaigns, and verifies mechanics without calling OpenAI. Its opt-in and environment files are the same ignored disposable-test setup described in `SUPABASE_SETUP.md`.
- `scripts/gameplay-access-acceptance.mjs` reuses those fixtures for read-only owner/non-owner/anonymous runtime access, normal API privacy and production client-bundle checks. Build first; the script makes no OpenAI calls and does not create another campaign. Add --live to use the live-acceptance fixture pair instead of the earlier deterministic fixtures.
- Live model acceptance runs only after deterministic integration is green. Report the actual selected model, calls, usage, approximate cost, failures/retries and the synthetic 20–30 turn results separately. No large model-quality evaluation is authorized by this setup guide.
- `scripts/gameplay-live-acceptance.mjs` is separately gated by `RPG_ALLOW_LIVE_DM_TESTS=SMALL_SYNTHETIC_PHASE2_ACCEPTANCE` and the ignored local test environment. It appends fresh synthetic fixtures only on its first run, records operation identity before each request, and stops on a failure. The lead advances the fixed small sequence one step at a time; retries reuse the saved operation. It is never part of ordinary tests and must not be run against real campaigns. The local report can be resumed across process restarts. `verify` checks duplicate submissions, relogin durability and campaign isolation without generating new responses.
- Phase 2 has a conservative bounded context window and pauses when necessary exact history/current sources cannot safely fit. It does not generate summaries, search historical/semantic memory, embed documents or silently switch models. Phase 3 remains deferred.
- Physical iPhone/Safari and the optional Phase 1 conflict-rebase confirmation remain disclosed unverified items unless explicitly tested later.

The agent stops for owner review after the required gates pass. Only the owner can accept Phase 2.
