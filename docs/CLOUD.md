# Cloud sessions — environment and session start

From Stage 4 on, development runs in Claude Code cloud sessions (claude.ai/code, the Claude app, or the Desktop app with
**Cloud** selected). Each session gets its own VM (about 4 vCPU, 16 GB RAM, 30 GB disk, Ubuntu 24.04), clones the repo
from GitHub, and pushes `claude/*` branches back. The owner's computer and database are never reachable from it.

## Environment `rpg-console` (configured once by the owner)

**Network access: Custom**, with «Also include default list of common package managers» checked (that list already has
npm, nodejs.org, Ubuntu archives, Google Fonts). Allowed domains:

```
api.openai.com
queue.fal.run
*.fal.run
fal.media
*.fal.media
cdn.playwright.dev
playwright.download.prss.microsoft.com
playwright.azureedge.net
```

**Environment variables.** Keys use an `APP_` prefix on purpose: an `ANTHROPIC_API_KEY` variable can make Claude Code
itself bill that key instead of the owner's subscription. The session writes the app's `.env.local` from these.

```
APP_ANTHROPIC_API_KEY=…
APP_OPENAI_API_KEY=…
APP_FAL_KEY=…
PLAYWRIGHT_MODULE=/opt/node24/lib/node_modules/playwright
```

**Setup script** (runs as root before Claude starts; cached for about seven days when it finishes in under five minutes):

```bash
#!/bin/bash
# Node 24 for the project (the image ships 20-22), pnpm, and Chromium for screenshots.
# Never fails the session start: a missing piece is reported by the session itself.
install_node24() {
  [ -x /opt/node24/bin/node ] && return 0
  V=$(curl -fsSL https://nodejs.org/dist/index.json | python3 -c "import json,sys; print(next(r['version'] for r in json.load(sys.stdin) if r['version'].startswith('v24.')))") || return 1
  curl -fsSL "https://nodejs.org/dist/$V/node-$V-linux-x64.tar.xz" | tar -xJ -C /opt || return 1
  mv "/opt/node-$V-linux-x64" /opt/node24
}
install_node24 || echo "node24 install failed"
export PATH=/opt/node24/bin:$PATH
npm install -g pnpm playwright || echo "pnpm/playwright install failed"
playwright install --with-deps chromium || echo "chromium install failed"
echo 'export PATH=/opt/node24/bin:$PATH' > /etc/profile.d/node24.sh
for f in /root/.bashrc /root/.profile; do
  grep -q /opt/node24/bin "$f" 2>/dev/null || echo 'export PATH=/opt/node24/bin:$PATH' >> "$f"
done
exit 0
```

## Session start (every cloud session does this first)

1. `git fetch origin <branch> claude/handoff` and check out the branch named in the task.
2. `export PATH=/opt/node24/bin:$PATH`; `node -v` must start with `v24`. If `/opt/node24` is missing, stop and say so.
3. Write `.env.local` (git-ignored) without printing any value: `ANTHROPIC_API_KEY` from `$APP_ANTHROPIC_API_KEY`,
   `OPENAI_API_KEY` from `$APP_OPENAI_API_KEY`, `FAL_KEY` from `$APP_FAL_KEY`. Never put `ANTHROPIC_API_KEY` into
   Claude Code's own environment. There is no owner database here: anything that needs Supabase settings gets local
   placeholders, never a real project URL or key.
4. `pnpm install`, then typecheck, lint, test and build for a baseline. The VM has 4 vCPUs: run the full suite as
   `node --test --test-concurrency=2 tests/*.test.mjs` — at default parallelism about 290 tests time out from load alone. Cloud clones can be shallow: run
   `git fetch --unshallow` (ignore the error if it is already complete) before tests that read git history.
5. Known environment differences from the owner's Windows machine: a test that fails only because of Windows line
   endings (CRLF) or missing git history is environment-specific — record it in the report, do not rewrite line endings
   of tracked files to make it pass. If the `APP_*` variables are missing, the session was started in the wrong
   environment: say so at once (live runs need the `rpg-console` environment).

Long background jobs: never sit on a waiter for more than about 15 minutes without looking at the job's own process
and log. A chain that failed quietly leaves the waiter waiting forever; when that happens, resume from the last
completed step and never repeat paid steps that already finished.

Rules stay as in `CLAUDE.md`: work only on the task's `claude/*` branch, never `main`; paid calls only within the task's
cap; report in English. If a push to an existing `claude/*` branch is refused, push to the session's own branch and say
its name.
