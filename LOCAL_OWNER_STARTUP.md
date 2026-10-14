# One-click local owner startup

Double-click **Start RPG Console.cmd** in this checkout. It opens the local campaign list after Docker, the preserved Supabase project and the application are ready. A second launch reuses the running application.

This is a development-only convenience for the owner's computer, not a deployed authentication mode. Normal use needs no email/password entry. The existing Supabase owner account, verified Auth cookies, `requireOwner()`, `rpg_is_owner()` and database RLS remain the security authority.

## Local addresses

| Service | Address |
| --- | --- |
| RPG Console | `http://127.0.0.1:3000/campaigns` |
| Supabase API/Auth | `http://127.0.0.1:34321` |
| PostgreSQL | `127.0.0.1:34322` |
| Supabase Studio | `http://127.0.0.1:34323` |
| Local test mail | `http://127.0.0.1:34324` |
| Supabase analytics | `127.0.0.1:34327` |

The former 54321 range overlaps a Windows networking reservation on the owner's machine. The selected range is below Windows' ordinary dynamic TCP range. The launcher reports conflicts and does not change Windows networking or require Administrator access.

## Credentials and local trust

Credentials stay in the existing ignored `test-results/LOCAL_TEST_LOGIN.txt`. A worktree may use the same ignored source from the primary repository. The launcher reads it privately and passes the email/password only in the child server's environment. It does not print them, put them on a command line, write another credentials file or send them to browser JavaScript.

Silent bootstrap requires all of: non-production Node environment, explicit `RPG_TRUSTED_LOCAL_OWNER=1`, a request addressed to `localhost` or `127.0.0.1`, loopback Supabase URL and a configured owner UUID. It signs in through Supabase Auth, verifies both that UUID and `rpg_is_owner()`, then uses the normal HTTP-only cookies. Failed checks deny access. Outside that gate the existing login and sign-out behavior remains available. No RLS or database grants are relaxed.

## Preservation and failures

The launcher requires this project's existing database and storage volumes. It does not initialize a replacement database, reset, reseed, run migrations or create an owner. It reuses the existing local project/network and excludes the optional Vector collector. Existing stopped services can be started; healthy services are reused. An unrelated process on port 3000 is reported rather than terminated.

Docker Desktop, the existing Supabase CLI and installed Node/pnpm dependencies are prerequisites. The launcher locates the already-installed tools; it does not reinstall packages each time. A bounded startup failure leaves a readable error in its window.

Trusted local owner mode deliberately trusts applications and people with access to this computer and loopback interface. Do not expose this development server through a tunnel, reverse proxy or LAN binding. Production never uses automatic local sign-in.

## Review verification

Cold-start, duplicate-launch and integrity results are recorded in `DEV_STATUS.md`. No gameplay input, failed-operation recovery, Astra request or media generation is part of startup verification. No migration is added or applied.
