# Phase 3.8B preparation — verified results

2026-09-19. Prepared from owner-approved Phase 3.8A `444f6836a5abce2014c3de4b6f234bf2a75399af`, on isolated `codex/phase38-spatial-preparation`. **Preparation only; exact final commit requires owner authorization before live execution.**

Protocol SHA-256 (canonical JSON): `496360cc4171778eb153009ff4fe445d8ef75b08ab9aa0c4e884452e21c3bacb`. The separate [freeze manifest](freeze.json) covers harness, fixtures, instructions, results and official evidence. LF attributes make byte hashes stable across Windows checkouts. The final Git commit also pins the root documentation.

## Actual checks

- 91 experiment mock tests passed, zero failures/skips. HTTP is injected and global implicit fetch is disabled. Includes four submissions / $4.75 ceiling, duplicate/rerun/crash/lock refusal, every failure stage, unknown-charge preservation, URL/model pins, no retry/fallback, bounded request/read/download bytes and counts, stale/invalid outputs, secret masking and no production imports/state endpoints.
- Existing offline regression suite: 256 tests, **255 passed, 1 explicitly opted-out live Supabase test skipped**, zero failures. Three HTTP-dependent files (`preview.test.mjs`, `phase2-http.test.mjs`, `persistence-http.test.mjs`) were excluded; no production/local server or database was contacted for acceptance. The included PostgreSQL tests use ephemeral synthetic PGlite, not the application's database.
- Full project typecheck passed (`next typegen`, then `tsc --noEmit`); isolated harness TypeScript emit/build passed; full project ESLint passed.
- Default Next.js production build passed. Initial cross-worktree dependency junction was rejected by Turbopack; resolved with a worktree-local copy of the same already-installed dependencies and internal package links. No dependency version, package manifest, lockfile or production configuration change. Available Node binaries ran the exact underlying scripts because npm is not on this shell's PATH. Generated `next-env.d.ts` changes were restored before commit.
- Official public documentation rechecked: exact endpoints/models/options and published prices unchanged. Details and sources: [official evidence](OFFICIAL_EVIDENCE.md). No authenticated documentation/account probe.
- Original checkout's two uncommitted documents unchanged by SHA-256; all 29 historic bake-off artifacts/ledgers and 17 tracked result files preserved. Local main remains `96964964a7d5046ff34b6b6ae695ecf494885cc4`; remote production main remains `cb7f6be2fb513de13604d381046a3240f3261383`; closed bake-off remains `9d5a99c0e93917190f415eedab3d4067c63b8ee2`.
- Live generation requests: **0**. Credentials requested/read/created: **none**. No live run directory, anchor or reservation ledger initialized; mock ledgers exist only in disposable test directories. No production runtime/schema/gameplay UI/deployment mutation and no new production or experiment dependencies.

## Frozen submissions and limits

| ID | Exact pin / input | Published maximum | Reservation |
| --- | --- | --- | --- |
| spatial-room-1 | World Labs `marble-1.1`; reviewed furnished-room prompt, seed 38001, private | $1.264 | $1.30 |
| spatial-courtyard-1 | World Labs `marble-1.1-plus`; reviewed courtyard prompt, seed 38002, private | $2.464 | $2.50 |
| spatial-fal-world-1 | `fal-ai/hunyuan_world/image-to-world`; only approved compatible/permitted synthetic room panorama, frozen labels and `export_drc=true` | $0.300 | $0.35 |
| spatial-chest-1 | `fal-ai/hunyuan-3d/v3.1/pro/text-to-3d`; reviewed synthetic chest, Normal, PBR enabled, default face count | $0.525 | $0.60 |

Exact endpoint URLs and UTF-8 prompts are in [protocol.json](protocol.json); no runtime overrides. Maximum four submissions, one at a time, **$4.75 cumulative reserved**, published maximum $4.553. Every reservation is retained after success, failure or unknown charge. No automatic retry/fallback or diagnostics. First unexplained failure stops before the next generation; success still requires manual review and verified billing.

45 polls/job, at 20-second spacing within a 15-minute job deadline. At most two fal result reads and four World Labs world reads; 190 authenticated API requests overall. At most 14 downloads; supported happy path uses 10. JSON body 2 MiB, individual asset 256 MiB, cumulative asset body 1 GiB, remaining-byte allowance applied before transport. Downloads send no API credentials and do not follow redirects.

Minimum account funding is not generation spend: World Labs documents **$5 / 6,250 credits**; fal minimum top-up is **UNKNOWN** from current official public documentation. No purchase requested now. Unknown live charge pauses for a matching manual dashboard receipt and retains the entire reservation.

## Limitations and remaining work

No live entitlement, provider output, cost receipt, format compatibility, visual boundary, hosted persistence, quality, permission or browser/device acceptance is claimed. SPZ/GLB/image checks are structural; they are not a renderer or universal codec. Unsupported opaque DRC/archive, external material dependencies or unknown CDN hosts stop for review, with no conversion or extra generation. Generated chest lid articulation may be absent; no extra part-splitting call is authorized. Panorama format/sharing must be confirmed before fal receives it. Physical iPhone/Safari and the historical optional Phase 1 conflict-rebase confirmation remain unverified; finite synthetic tests do not guarantee universal recovery or perfect memory/branching. No hosted deployment or real campaign/private-data acceptance has occurred.

The owner roadmap is recorded without implementation: EXPLORE committed v1, Marble intended initial provider absent a concrete blocker, asset-first after Phase 4's canonical asset foundation; Text RPG permanently independent; optional future style-agnostic 2D presentation over the same authority. No renderer architecture, Phase 4, implementation sprint, real import or deployment is started.

Recommended next step: owner reviews this exact preparation checkpoint. Stop. Do not run `init` or `next`, request keys, or submit any spatial job until explicitly authorized at that SHA.

## Exact changed-file list

Root documentation:

- DEV_STATUS.md
- DEVELOPMENT_PLAN.md
- MASTER_SPEC.md
- PHASE38B_LIVE_PROTOCOL.md

Within `experiments/phase38-spatial/`:

- .gitattributes
- .gitignore
- OFFICIAL_EVIDENCE.md
- PREPARATION_RESULTS.md
- README.md
- freeze.json
- package.json
- protocol.json
- tsconfig.json
- src/cli.ts
- src/freeze.ts
- src/ledger.ts
- src/outputs.ts
- src/protocol.ts
- src/runner.ts
- src/transport.ts
- tests/fixtures.mjs
- tests/guards.test.mjs
