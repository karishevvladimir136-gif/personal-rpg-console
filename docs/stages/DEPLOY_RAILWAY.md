# Deploy — the app in the cloud (Railway + Supabase cloud), prepared in parallel with the merge

Owner (2026-10-20 11:11): «чтобы оно всё не висело у меня на компе — пора всё в облако». Host: **Railway** (always-on
process, GitHub deploys, streaming held open). Database and storage: a **new Supabase cloud project for the cloud
sandbox** («personal-rpg-console-cloud-sandbox») — never the owner's real project in this stage. The owner's PC keeps the
local sandbox for acceptance; the cloud instance is for session 3 if it proves itself, and for everything after.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`). Branch `claude/deploy-railway` from
`origin/claude/session-2-prep` now; rebase onto `claude/s3-candidate` when the merge lands (the deploy files are
additive: Dockerfile/railway config, a health route, docs, scripts). Nothing to `main`. Report in English in
`docs/runs/deploy-report.md`; talk to the owner in English, briefly. No paid model calls except the two live checks
below (cap **$5**, ledger `docs/runs/deploy-ledger.md`).

Hard rules: no key is ever printed, logged or committed; the owner pastes every secret into Railway's variables and
Supabase himself — the stage produces the exact list of variable names and where each goes, not the values; the
environment variable for Anthropic stays `APP_ANTHROPIC_API_KEY`; never the owner's real Supabase project; nothing
destructive without the owner.

## What the app needs from a host (read `docs/CLOUD.md`, `DEV_STATUS.md`, the sandbox start script, `docs/SPEED.md`)
- a long-lived Node process: a turn streams for up to 5 minutes; the lease heartbeat, pictures, the digest, the music
  pack and the ledger checker run in-process after the response (`schedule(...)` in the services) — a serverless host
  would kill them;
- Supabase (Postgres with the `rpg_*` schemas and RPCs, Storage for pictures and music, auth for the owner's login);
- outbound HTTPS to Anthropic and fal; ffmpeg for the music review tools (if the runtime needs it);
- the production build (`next build` / `next start`), one instance, 1–2 GB RAM; the owner's login as today.

## Work
1. **Container and config**: a Dockerfile (or Railway's Nixpacks if it builds cleanly), `railway.json`/`railway.toml`
   with a health check route (`/api/health` — add it, no secrets), the start command, the port from `PORT`; a
   `.dockerignore`; the list of environment variables with one line each on what it is and where it comes from
   (Supabase URL / anon / service keys, `APP_ANTHROPIC_API_KEY`, fal, the owner login, the base URL).
2. **Supabase cloud sandbox**: a script and a written step list to create the project's schema from the repo's
   migrations (all ranges, including 2026102102xx and 2026102103xx once the merge lands), the Storage buckets with the
   same names and policies as the local sandbox, and to restore the owner's local sandbox dump into it
   (`C:\Dev\rpg-exports\sandbox-backups\`, the newest) so the campaign comes along; migrations are applied by the
   Supabase CLI from the owner's PC with his credentials, never from this session.
3. **Background work survives**: confirm that `schedule(...)` jobs run to completion on Railway (no request-scoped
   teardown), that the lease heartbeat ticks during a 5-minute streamed turn, and that nothing depends on local disk
   except temp files.
4. **Two live checks after the owner has deployed** (he will say when): a 5-minute streamed turn on the synthetic
   campaign with the stream held open end to end; a picture frame and a music track generated and served from
   Supabase Storage. Time to first word and full turn compared with the local sandbox numbers.
5. **Docs**: `docs/DEPLOY.md` — the owner's step list in Russian: create the Railway project from GitHub, which branch,
   the variables to paste, the Supabase project to create and how to run the migrations and the restore, how to
   check the health route, how to roll back (redeploy the previous commit), what it costs (Railway's usage line,
   Supabase's plan), and «how to keep the local sandbox as a second environment».

## Done when
The Dockerfile/config builds locally in the session (`docker build` or Nixpacks dry run) and the app starts against a
throwaway local Postgres with the migrations applied; the variable list is complete; `docs/DEPLOY.md` is written; the
two live checks are described as a checklist for the owner to trigger. The owner then creates the Railway project and
the Supabase cloud sandbox himself and reports; the session finishes the live checks on the deployed instance.
