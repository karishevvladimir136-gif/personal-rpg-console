# Phase 1 persistence setup

No project was created or deployed. The application needs one Supabase database and one owner account before persistent screens can save. The approved synthetic Phase 0 preview remains separate.

## Smallest owner checklist

1. Use a **local, disposable Supabase instance** for verification first. Docker and the Supabase CLI are required on the computer; they were not installed in this implementation environment. Install them using the [official local-development instructions](https://supabase.com/docs/guides/local-development/cli/getting-started), then run `supabase start` from this repository. This is local development, not deployment.
2. Inspect the selected database before applying anything. In local Studio (`http://127.0.0.1:54323`), check that there is no existing `rpg_` data. Apply the repository migration files in filename order in the SQL editor. For an existing project, review and back up its data first. **Do not run `supabase db reset` against existing data.** There is no automatic seed.
3. In Studio → Authentication → Users, create the owner email/password account. Confirm the account. Public signup is disabled in the committed local configuration; also disable “Allow new users to sign up” in any separately configured project's authentication settings. There is no registration screen.
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
