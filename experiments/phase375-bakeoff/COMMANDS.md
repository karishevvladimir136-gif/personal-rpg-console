# Correction command record

September 19, 2026. Branch `codex/phase375-technical-bakeoff`, correction based on accepted offline foundation `68126be972b2fdecfd650fde08d64f8b768eec01`. Node `24.19.0`, pnpm `11.19.0`. No application environment/key was loaded; no live inference command was executed. No dependency install occurred in this correction.

## Paths

```powershell
$bakeoffRoot = 'C:\Users\karis\OneDrive\Documents\GitHub\personal-rpg-console\.worktrees\phase375-bakeoff'
$bakeoffPnpm = 'C:\Users\karis\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd'
Set-Location "$bakeoffRoot\experiments\phase375-bakeoff"
```

The pinned package/lockfile is unchanged. A fresh checkout may need the foundation's isolated install (`pnpm install --frozen-lockfile --ignore-scripts`); that is not a command run during this correction.

## Executed offline checks

```powershell
node src/prepare.mjs
node src/offline.mjs
& $bakeoffPnpm typecheck
& $bakeoffPnpm lint
node --test --test-reporter=tap test/*.test.mjs > results/harness-tests.tap
& $bakeoffPnpm build
```

Final result: **64 tests passed; typecheck, lint, build and offline replay passed.** Tests use injected synthetic HTTP, never provider inference. During correction, an inherited test that searched ordinary prose for the word “truth” was updated to check forbidden JSON keys; no payload boundary was relaxed. A wrong working-directory path in an editing command was corrected before final generation. Generated JSON freezes dataset/request/profile/policy/plan/resolver hashes, split membership, rejected candidates and deterministic decisions. `dist/` remains ignored; scripts run from source so relative fixture paths are correct.

## Executed unchanged-application checks

```powershell
Set-Location $bakeoffRoot
& $bakeoffPnpm typecheck
& $bakeoffPnpm lint --ignore-pattern 'experiments/**'
node --test --test-reporter=tap tests/phase2-runtime.test.mjs tests/phase3-summary.test.mjs > experiments/phase375-bakeoff/results/application-tests.tap
& $bakeoffPnpm build
git restore --worktree -- next-env.d.ts
git diff --check
git diff --name-only 68126be972b2fdecfd650fde08d64f8b768eec01 -- src supabase tests scripts package.json pnpm-lock.yaml PHASE2_CONTRACTS.md PHASE3_CONTRACTS.md PHASE3_5_CONTRACTS.md next-env.d.ts
```

**21 tests passed**, with application typecheck, lint and production build passing. The final production diff is empty. Only this experiment checkout's generated Next declaration was restored; original dirty documentation was untouched. No server restart, database operation, full application suite or HTTP/browser/device acceptance occurred.

## Not executed — owner review and stage approval required

No key is requested now. A future owner-approved stage may follow [OWNER_SETUP.md](OWNER_SETUP.md). Do not print its secret file or put credentials on command lines. This protocol hash is public:

```powershell
Set-Location "$bakeoffRoot\experiments\phase375-bakeoff"
# Only after owner review, smoke approval, budget and fresh tariff check:
node --env-file=.env.bakeoff.local src/run-live.mjs --smoke --approved=5b8f0afccc8c2c4eeddbadb098188d1127cd3c3b58c7c98840706b171aac0a5d
# Only after successful smoke review AND separate full-run approval:
node --env-file=.env.bakeoff.local src/run-live.mjs --full --approved=5b8f0afccc8c2c4eeddbadb098188d1127cd3c3b58c7c98840706b171aac0a5d
```

CLI flags are an operator guard, not authorization by themselves. There is no diagnostic CLI switch: extra requests require a separately reviewed diagnostic command and explicit manifest-slot approval, not automatic retries. A file lock serializes the process and a durable ledger reserves each request first. Saved results are reused; failed/uncertain reservations remain spent. Never delete results/ledger to reset approval. Live artifacts remain ignored under `private-live-results/`; only safe fields can enter a later reviewed report. No raw headers, errors or chain of thought are persisted.

Only experiment/report/status files belong in this correction. No main merge or force-push. See [exact changed files](results/changed-files.txt) and [verification](results/verification.json).
