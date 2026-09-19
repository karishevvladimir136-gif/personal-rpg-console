# Bake-off command record

Windows PowerShell, Node `v24.19.0`, pnpm `11.19.0`. No app `.env` file was copied or loaded. Public documentation/npm metadata and package downloads are not model inference. No live command below was executed.

## Paths used

```powershell
$bakeoffRoot = 'C:\Users\karis\OneDrive\Documents\GitHub\personal-rpg-console\.worktrees\phase375-bakeoff'
$bakeoffPnpm = 'C:\Users\karis\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd'
Set-Location "$bakeoffRoot\experiments\phase375-bakeoff"
```

All paths are local; a fresh clone may use a different Node/pnpm installation. Pinned package/lockfile contents, not the mutable `latest` tag, define this experiment.

## Executed experiment commands

```powershell
& $bakeoffPnpm install --ignore-scripts
& $bakeoffPnpm prepare-evaluation
& $bakeoffPnpm typecheck
& $bakeoffPnpm lint
& $bakeoffPnpm test
& $bakeoffPnpm build
& $bakeoffPnpm offline
node --test --test-reporter=tap test/*.test.mjs
```

The last TAP output is saved in `results/harness-tests.tap`; the ordinary test command ran during iteration too. Generated JSON includes the exact frozen dataset/request/policy/profile hashes, split membership, each authorized/rejected candidate and offline decisions. `dist/` remains ignored; run source scripts, whose relative fixture paths are intentional.

Initial tooling issues: `npm` was absent from PATH, so public npm metadata was inspected without npm and installation used the bundled pnpm. The first pnpm install discovered the parent workspace and installed its **unchanged existing** application dependencies locally; no root manifest/lockfile changed. A nested `pnpm-workspace.yaml` then isolated the experimental dependencies. pnpm recorded narrow release-age exceptions for the pinned current SDK packages. No dependency install scripts were enabled. Initial harness syntax/type errors and a wrapped-timeout normalization failure were fixed before the final successful checks.

## Executed unchanged-application checks

```powershell
Set-Location $bakeoffRoot
& $bakeoffPnpm typecheck
& $bakeoffPnpm lint --ignore-pattern 'experiments/**'
node --test tests/phase2-runtime.test.mjs tests/phase3-summary.test.mjs
& $bakeoffPnpm build
git diff --check
git diff --name-only cb7f6be2fb513de13604d381046a3240f3261383 -- src supabase tests scripts package.json pnpm-lock.yaml PHASE2_CONTRACTS.md PHASE3_CONTRACTS.md PHASE3_5_CONTRACTS.md next-env.d.ts
```

`pnpm exec eslint src tests scripts *.mjs` initially could not resolve the executable; the existing `lint` script above succeeded. App checks use the app's existing lint/TypeScript versions; experimental checks use their isolated versions. Next's generated `next-env.d.ts` route-path changes were restored to baseline after the build. The production diff command is empty. No running server was restarted, no database touched, and no complete HTTP/live/browser acceptance suite was invoked.

## Not executed — requires explicit owner approval first

The owner follows [OWNER_SETUP.md](OWNER_SETUP.md); Codex runs these only after the applicable stage is approved. Never put a credential on a command line or print the environment file. The protocol hash below is public, not a key.

```powershell
Set-Location "$bakeoffRoot\experiments\phase375-bakeoff"
# Only after smoke approval, configured key quota, tariff/privacy review:
node --env-file=.env.bakeoff.local src/run-live.mjs --smoke --approved=a0e853cbd6bcab495af5ef428712a74f1e0ee70a01d9adf8d7bed250074fdbc9
# Only after successful smoke review AND separate full-run approval:
node --env-file=.env.bakeoff.local src/run-live.mjs --full --approved=a0e853cbd6bcab495af5ef428712a74f1e0ee70a01d9adf8d7bed250074fdbc9
```

CLI approval flags are an operator guard, not owner authorization by themselves. The runner acquires a single-process file lock and appends a durable reservation before each request. Re-running does not reset budget, retry failed/uncertain calls or silently pay twice: saved results are reused; an unresolved reservation needs review. Never delete its ledger to evade a cap. Live artifacts remain ignored under `private-live-results/` pending manual safe-field/billing review before any report is committed. No raw HTTP responses/headers or chain of thought are persisted.

## Repository isolation

Created `codex/phase375-technical-bakeoff` in its own worktree at the exact baseline. No merge to main or force-push. Only experiment files and focused report/status/architecture notes belong in the commit; the original checkout's unrelated DEV_STATUS.md / PHASE3_EVALUATION.md remain untouched. The final response identifies the resulting commit SHA.
