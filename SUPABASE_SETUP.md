# Phase 1 persistence setup

**Current local owner startup:** use [Start RPG Console.cmd](Start%20RPG%20Console.cmd) and [the local startup guide](LOCAL_OWNER_STARTUP.md). The preserved owner project now uses API **34321**, PostgreSQL **34322**, Studio **34323** to avoid the former Windows-reserved range. The launcher reuses existing volumes and performs silent verified owner sign-in only in explicitly enabled loopback development. The historical setup/account-creation instructions below are not steps to repeat against the populated owner database.

This document preserves the accepted Phase 1 setup procedure. For the authorized Phase 2 additions, use [PHASE2_SETUP.md](PHASE2_SETUP.md): the server runtime also needs a local service credential and an owner-configured OpenAI key/model. Do not repeat the empty-database seed or reset the accepted local database. Actual results are in `DEV_STATUS.md`.

No hosted project was created or deployed. The application needs one Supabase database and one owner account before persistent screens can save. The approved synthetic Phase 0 preview remains separate.

The disposable environment on this machine is now configured and verified; see [DEV_STATUS.md](DEV_STATUS.md) for actual results and remaining limitations. Open `http://127.0.0.1:3000/campaigns` for owner review. Do not repeat account creation, migrations or synthetic seeding on the populated acceptance database. Test sign-in details are in the ignored local `test-results/LOCAL_TEST_LOGIN.txt` file; enter them only in the application, never in chat.

On this Windows host, the optional Supabase Vector log collector was excluded because it repeatedly restarted. The required database, Auth and REST services passed the acceptance checks. This does not add or enable embedding/vector-search functionality. If restarting the preserved stack, use its existing network and exclusion:

```powershell
$env:PATH = (Join-Path $env:LOCALAPPDATA 'Programs\DockerDesktop\resources\bin') + ';' + $env:PATH
& '.\test-results\supabase-cli\supabase.exe' start --network-id rpg-phase1-acceptance --exclude vector
node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3000
```

Run these from the repository folder after opening Docker Desktop, only when the existing preview is stopped. Keep the terminal open. The ignored CLI executable was downloaded from the official release and checksum-verified; the commands preserve the existing database volume.

## Smallest owner checklist

1. Use a **local, disposable Supabase instance** for verification first. Docker and the Supabase CLI are required; see the [official local-development instructions](https://supabase.com/docs/guides/local-development/cli/getting-started). Inspect existing Docker containers/volumes before starting. Restrict published ports to localhost and verify the actual bindings. On Docker Desktop 4.91.0, the documented bridge-network loopback option alone did not restrict host publishing in this acceptance run; select localhost-only publishing in Docker Desktop network settings before continuing. This is local development, not deployment.
2. Run `supabase start` from this initialized repository using the selected local network. On a new empty database the CLI applies committed migrations automatically in filename order. Inspect migration history before applying anything manually; do not apply the same migrations twice. In local Studio (`http://127.0.0.1:54323`), check that there are no existing campaign records before synthetic verification. For an existing project, review and back up its data first. **Do not run `supabase db reset` against existing data.** There is no automatic seed.
3. In Studio → Authentication → Users, create the owner email/password account. Confirm the account. Public signup is disabled in the committed local configuration; also disable “Allow new users to sign up” in any separately configured project's authentication settings. There is no registration screen.

   Keep global `auth.enable_signup = false`. The local CLI maps `auth.email.enable_signup` to its email-provider enable flag, so that provider flag must remain `true` for existing email/password accounts to sign in. The live integration test verifies that attempted public registration still returns `signup_disabled`.
4. Copy the owner's user UUID into this one-time SQL statement and run it through the trusted SQL editor:

   ```sql
   insert into rpg_private.owner_registry (user_id)
   values ('REPLACE-WITH-OWNER-USER-UUID');
   ```

   This registry permits exactly one owner and fails rather than replacing an existing owner. Do not expose `rpg_private` in API settings. Only `public` is needed for RPG API tables; normal authenticated browser credentials have no access to the private schema.

5. Create the ignored `.env.local` file in the repository with the following **variable names**. Obtain values from your local instance; do not paste keys/passwords into chat, Git, or documentation:

   ```dotenv
   SUPABASE_URL=your-local-Supabase-URL
   SUPABASE_PUBLISHABLE_KEY=your-local-publishable-key
   RPG_OWNER_USER_ID=your-owner-user-UUID
   ```

   `SUPABASE_ANON_KEY` is supported instead of `SUPABASE_PUBLISHABLE_KEY` for a legacy local instance. No `NEXT_PUBLIC_` key or service-role key is required by the application. Ordinary reads/writes use the owner's verified cookie session plus database policies.

6. Restart `pnpm dev`, open `http://127.0.0.1:3000`, sign in, create two unrelated throwaway campaigns, save a document and an inventory correction, reload, sign out and sign back in. Both campaigns must retain their own records. Try an older document version and verify that restoring creates another version. Keep real campaign/private material out until the checks below pass.

Do not deploy. Any future deployment needs a separate owner request after authentication/access checks pass. Media providers/models remain owner-selectable and no provider is called in Phase 1.

## Repeatable synthetic verification

`node --test tests/persistence-database.test.mjs tests/persistence-validation.test.mjs` executes the actual migration in embedded PostgreSQL (PGlite), with **test-only** `auth.users`, `auth.uid`, and database roles. It exercises grants/RLS, two synthetic campaigns, scope constraints, immutable histories, revisions/idempotency, private marker isolation and manual equipment integrity. This is meaningful SQL verification, **not** real Supabase Auth, PostgREST, browser cookie or hosted integration verification.

Real integration is separately opt-in and is skipped by the ordinary suite until configured. Use an **empty disposable local database** with migrations applied and owner registered. Create a second synthetic account in Studio which is **not** in the owner registry. Add these test-only values to your local ignored environment file:

```dotenv
RPG_ALLOW_DISPOSABLE_TESTS=CREATE_SYNTHETIC_RECORDS_IN_DISPOSABLE_LOCAL_DATABASE
RPG_TEST_OWNER_EMAIL=your-test-owner-email
RPG_TEST_OWNER_PASSWORD=your-test-owner-password
RPG_TEST_NONOWNER_EMAIL=your-test-nonowner-email
RPG_TEST_NONOWNER_PASSWORD=your-test-nonowner-password
```

Run:

```powershell
node --env-file=.env.local --test tests/persistence-database-supabase.test.mjs
```

This creates two invented campaigns and leaves them available for inspection; it does not delete or reset anything. Seeding refuses a database which already contains campaigns and refuses non-local URLs. For a second run, use a fresh disposable local project. The test covers real owner/non-owner/anonymous access, direct writes, private schema rejection, scoped inventory, document restore/retry/conflict, settings separation and sign-out/sign-in persistence. It does not exercise the application's HTTP cookie adapter; complete the browser/API checklist below as well.

### Application HTTP acceptance after synthetic seeding

`scripts/persistence-app-acceptance.mjs` exercises the real Next.js cookie adapter and owner-only APIs after the integration test has created its two named synthetic campaigns. It refuses a non-local target or a different campaign set, and never resets/seeds the database. It deliberately appends synthetic document/guide versions and feedback and makes explicit manual synthetic record corrections. Do not point it at real data.

Keep the application configuration in ignored `.env.local` and the disposable test accounts/opt-in in ignored `.env.acceptance.local` if desired. Run:

```powershell
node --env-file=.env.local --env-file=.env.acceptance.local scripts/persistence-app-acceptance.mjs
```

Use the same two environment-file arguments for the initial integration test when its test settings are stored separately. The application does not need test-account passwords or a service-role key in its own environment. The HTTP checks cover anonymous/non-owner denial (including an independently authenticated non-owner cookie session), owner login/logout/relogin, campaign isolation, immutable restore/conflicts, independent settings, manual records, feedback/guide separation, and rejected gameplay/foreign-origin operations. Browser draft retention and layout checks are separate.

The local acceptance run additionally places synthetic canaries in the unexposed private schema through a trusted local SQL connection and checks their absence from public responses/client bundles. Only synthetic markers are permitted; never import real private material for this test.

The Next.js configuration preserves the original proxy URL so `127.0.0.1` is not normalized to `localhost` before the strict same-origin write check. Keep using one exact application origin, normally `http://127.0.0.1:3000`.

Alternatively, to create the same two synthetic campaigns for **manual** browser testing (without running the integration assertions), run:

```powershell
node --env-file=.env.local scripts/persistence-seed.mjs
```

Do not run both against the same already-seeded target. If a test fails halfway, no automatic cleanup/overwrite occurs: inspect what was written and use a fresh disposable target for repetition.

## Application acceptance checks after configuration

- Sign in with the owner and verify language/global preferences and independent campaign settings after reload/relogin. Hidden retains Interactive Dice and Show DC values.
- Create/open both synthetic campaigns, check distinct titles/characters/inventories/documents/session resume. A UUID from another campaign must not attach an item/storage/scene to the current one.
- Edit a document in two tabs: first save succeeds, stale second save reports conflict and preserves its text. Restore an old version; all versions remain.
- Correct quantity/location/equipment manually, verify Character/Party/Inventory use the same records, then reload. Negative quantities and incompatible/occupied slots must be rejected.
- Save scene/public state manually; changing campaign settings must not change the saved scene's effective revision.
- Sign out, then request `/api/workspace`, `/api/campaigns/UUID`, document versions and `/api/mutations` directly. No campaign data may be returned. A separately signed-in non-owner must also be denied.
- Inspect failed requests: no keys, provider payloads or private markers. Public schema must never contain DM-private information. There is intentionally no private-state API or client reader in this phase.
- Confirm previews do not save combat/rest/dice/cooking results into persistent campaigns. No gameplay mutation is supported.
- Test English/Russian desktop/mobile and reload/relogin, including unsaved-input and failed-save states. Physical iPhone/Safari remains a separate check.

## Implementation boundaries

The database applies manual corrections atomically through one allow-listed RPC. Every save has a request UUID and expected revision; reusing an ID with different input fails. Campaign row locks serialize related references/equipment edits. Direct table writes are revoked. Documents and campaign settings keep immutable history; scenes keep the settings revision from their original creation. Owner correction receipts reside in the inaccessible private schema.

Future conversations/rest/recipes/effects/encounters/participants/pending actions are inert record structures only. They have no gameplay mutation endpoint. DM-private state has separate storage with no ordinary application accessor. Asset records store metadata and campaign-prefixed paths only; uploads, signed URLs and media generation are not implemented in this phase.

Current implementation follows the primary Supabase documentation for [SSR cookies and verified identity](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), and [database function permissions/search paths](https://supabase.com/docs/guides/database/functions).

## Additive Chat with DM refinement

Migration `202609170002_dm_feedback_guide.sql` adds append-only owner feedback and a stable campaign mapping to a blank **DM Guide** reference document. Existing campaigns receive a new blank guide without changing their documents, scenes, settings or inventory. New campaigns receive one automatically. The guide uses the existing document version/restore system and cannot be switched to canon or archived via Library. Feedback sends only store the exact text: they do not edit the guide, interpret instructions, reply, consume resources or affect gameplay. The application exposes no DM-private content through this panel.

After configuration, save a message, reload, switch campaigns and confirm the thread remains separate. Explicitly save and restore a guide version. Sending feedback must not change guide versions, campaign settings, scenes, character health or items. Repeat message submission with the same request ID must produce one stored message. The SQL test suite verifies these boundaries with synthetic content. Live Supabase/browser verification still requires the local setup above.

## Ordered source-history foundation

Migration `202609170003_ordered_source_history.sql` implements only the Phase 1 storage foundation from MASTER_SPEC section 38. Scenes, feedback messages and private correction receipts receive **separate** database identity sequences. Public ordering never uses the private receipt sequence. UUIDs remain stable identities, revisions identify corrections, and original/corrected full manual payloads remain in immutable private receipts linked to their campaign, request and resulting record. There is no new public audit/private-data endpoint.

Scene corrections retain the scene's original position. Feedback and scene reads use numeric order, including when timestamps tie. Identity gaps are expected after retries/failed inserts and do not imply a missing event. Existing rows are backfilled once using their previous timestamp/UUID ordering as a deterministic baseline; this cannot reconstruct historical commit order which was never recorded. No content, settings, quantities or established scene facts change during backfill.

SQL tests verify tied timestamps, reverse UUID ordering, correction/retry behavior, exact preserved original and correction receipts, existing-data migration and sequence permissions. Summaries, checkpoints, retrieval, indexes for memory, AI context assembly and memory UI remain outside Phase 1.
