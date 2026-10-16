# The sandbox: play a branch without touching your real campaigns

The sandbox is a second, separate copy of the local database. It has its own name
(`personal-rpg-console-sandbox`), its own ports and its own Docker volumes, so nothing in it can reach the
project that holds your real campaigns (ports 34320–34327, `Start RPG Console.cmd`). You can create worlds,
play, break things and delete the sandbox afterwards.

## What you need

- Docker Desktop running (the same one the normal start uses).
- Node.js installed (the normal start uses it too), and `pnpm install` done once in this checkout.
- The Supabase command-line tool. The launcher uses, in this order: the copy in `test-results/supabase-cli/`,
  a `supabase` on your PATH, or downloads a pinned version through `npx` on first use.
- Optional: `.env.local` with `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` to play on the real models, and `FAL_KEY` for
  the pictures (live frames, portraits, places; Settings → Картинки). Without keys, start with `--fake` and play on a
  stand-in game master that costs nothing; without `FAL_KEY` the game plays on and the picture panel says the key is missing.

## Start, stop, delete

| What | Windows | Any system |
| --- | --- | --- |
| Start (or reuse) and open the browser | double-click **Start Sandbox.cmd** | `node scripts/sandbox-start.mjs` |
| Start on the free stand-in DM | `Start Sandbox.cmd --fake` from a terminal | `node scripts/sandbox-start.mjs --fake` |
| Stop (data kept) | double-click **Stop Sandbox.cmd** | `node scripts/sandbox-start.mjs --stop` |
| Delete the sandbox and its data | `Stop Sandbox.cmd --reset` | `node scripts/sandbox-start.mjs --reset` |

The first start downloads Docker images and takes a few minutes; later starts take about half a minute.
The app opens at **http://127.0.0.1:3100/campaigns** and signs you in as the sandbox owner on its own. The
sandbox's Supabase Studio is at http://127.0.0.1:44323 if you want to look at the tables.

A second start while the sandbox runs just opens the browser again. Stopping keeps every campaign in the
sandbox; the next start continues them, and applies any migration added to the branch since.

## What the launcher does

1. Writes `.sandbox/supabase/config.toml` (the committed config with the sandbox name and ports) and copies the
   committed migrations next to it. `.sandbox/` is ignored by Git.
2. `supabase start` in that folder. A new sandbox gets every migration applied; an existing one gets the
   pending ones through `supabase migration up`.
3. Creates the sandbox owner `owner@sandbox.local` through the local Auth admin API (the password is generated
   once and kept in `.sandbox/owner-login.txt`), and registers that user as the one owner in
   `rpg_private.owner_registry`.
4. Starts `next dev` on port 3100 with the sandbox's Supabase values and the trusted local owner mode, exactly
   like the normal start does for your real project. Your AI keys are read from `.env.local`; its Supabase
   values and owner ID are deliberately **not** passed through.
5. Writes `.sandbox/.env.sandbox` (the sandbox's URL, keys and owner ID) for scripts and tests that want to
   talk to the sandbox database directly.

Addresses: API/Auth `http://127.0.0.1:44321`, Postgres `127.0.0.1:44322`, Studio `44323`, test mail `44324`.
Analytics, the edge runtime, realtime and the image proxy are not started; the app does not use them.

## The stand-in DM (`--fake`)

With `--fake` the server sets `RPG_DM_FAKE_MODEL=1` and every DM request is answered by a built-in stand-in:
it narrates a short, plain reply that quotes your input and ends the turn through the real `finish_turn`
tool. The whole turn pipeline (tools, receipts, saves, journal, session digest) runs as usual; only the model
is missing. Nothing is sent anywhere and nothing is paid. Production never honours this switch.

## Proven in the cloud VM

Stage 4 proved the launcher in the cloud VM (Docker, Supabase CLI 2.121.0 through `npx`): start, create a
world and a campaign, play three turns on the stand-in DM, stop, start again and continue the same campaign.
The VM's proxy blocks the default image registry, so there it ran with
`RPG_SANDBOX_IMAGE_REGISTRY=docker.io` (forwarded to the CLI as `SUPABASE_INTERNAL_IMAGE_REGISTRY`); on a
laptop with ordinary internet this variable is not needed. The two Windows wrappers cannot be run in the VM:
they only locate `node` and call the same script, so keep them as they are.

## If something goes wrong

- *Docker is not running*: start Docker Desktop and retry.
- *Port 3100 is used by another program*: close it, or set `RPG_SANDBOX_APP_PORT` to another port.
- *The sandbox database did not start*: the message shows the CLI's last lines. `Stop Sandbox.cmd --reset`
  deletes only the sandbox; your real project is a different Docker project and is not touched.
- The app's output is in `.sandbox/app.log`.
