# Phase 3.8B exact fal artifact recovery — OFFLINE CORRECTION ONLY

This checkpoint is a candidate for future owner authorization, not permission to initialize or retrieve live. No provider/result/asset requests, asset DNS, reservations, generations, chest calls or credential access occur during preparation. Only the requested GitHub commit push uses network traffic.

## Permanent stopped history and new identity

The old `phase38b-fal-exact-artifact-1` execution **STOPPED before initialization**. It made zero successful initializations, result/asset GETs, DNS resolutions, provider requests, reservations, generations or chest calls. Nothing is rewritten as success.

| Binding | Exact value |
|---|---|
| Original preparation SHA | `dcbf8105ce7e18928901620dcf899d76ec000e8b` |
| Original manifest | `fal-exact-artifact.json` (unchanged) |
| Original identity/hash | `phase38b-fal-exact-artifact-1` / `310e802e1df5781a97336f9915668855421a50ff17e0c74532c44fc5df647f53` |
| Original manifest file SHA-256 | `2015ddbc3b0b233d37e297ef951b8856c8d9f047fed6583de22b02f53950244a` |
| Stop evidence commit | `5c01cb463ea677186de5ed85aba874a4a363c746` |
| Stop evidence file | `results/fal-exact-artifact-001.json` |
| Stop evidence file SHA-256 | `a7eb980b950c3a30f0c4686fdd9c4529d9e02927d38b63ab2df6ecf65c915760` |
| Prior diagnostic evidence | `745ee77f32ca61f795948f1292f7921d4fe406e7` |
| New candidate identity | **`phase38b-fal-exact-artifact-recovery-1`** |
| New manifest | **`fal-exact-artifact-recovery.json`** |

The new manifest explicitly binds the old manifest/preparation and stop evidence. It contains the original capability fields unchanged; import-time validation checks that only identity/recovery bindings differ. The new manifest's canonical SHA-256 is the recovery identity hash. Original descriptor/evidence/limits/accounting, original manifest bytes and all historical observations remain immutable.

Before any future initialization/request, the normal source verifier also verifies the stopped evidence file's exact hash, original identity, zero-network/zero-initialization facts and unchanged accounting. CLI verifies both the diagnostic and stop evidence commits are ancestors with exact committed file hashes. New anchors/ledgers identify the new contract/hash; an old identity can never be opened/reset as the recovery identity.

The original preparation worktree's private directory/anchor remain absent. Use only the new correction worktree for future authorization. The private path still has the frozen leaf `experiments/phase38-spatial/private-fal-artifact/` and sibling `.anchor`; no alternate/private-path CLI override exists. Initialization continues to refuse any existing root/anchor rather than reset/reuse it.

## Root cause and exact correction

The previous CLI passed the **absent directory** plus anchor to `git check-ignore` and counted stdout lines. A trailing-slash directory-only ignore pattern does not classify that absent path as a directory. Only the anchor matched, causing `artifact_private_ignore_required` before initializeArtifact.

The corrected CLI calls the actual tested `requireArtifactPrivateIgnore(repo)` helper. It derives the fixed private root from its own repository, then independently runs:

- `git check-ignore -q -- <fixed-root>/artifact.zip.partial`
- `git check-ignore -q -- <fixed-root>.anchor`

Both must succeed. Exit 1/error fails closed with the same safe assertion. No stdout-count/quoting assumption. No directory, anchor or child is created to make the check pass. `.gitignore` is unchanged and the guard is preserved. The helper's repository argument is supplied internally by the CLI; synthetic tests supply temporary Git repositories, not operator-selected download destinations.

The existing exact-SHA/live/clean-checkout condition was extracted unchanged into `requireArtifactCheckout` so negative authorization/dirty checks exercise the same helper used by `init`. Argument validation, exact source lineage and source hashes still run before initialization. No URL/hash/limit override is added.

## Unchanged future capability and accounting

Future separately authorized recovery remains **one exact fal result GET, followed by at most one exact artifact GET**. No polling, POST, retry, redirect following, result refresh, alternate object/address, fallback, new generation, billing request, next or chest.

- Request: `01a0bc76-ae7f-7e02-960b-a207094622d2`; model `fal-ai/hunyuan_world/image-to-world`.
- Result body SHA-256 before interpretation: `5dd84907167313f73db618cc1e1768bb658c59fafdb4dc2fb4119d7e2c1e78d6`.
- HTTPS, exact `storage.googleapis.com` hostname/hash, full URL hash `28e7ae50a56a53c390eaf1da596976d58f4e1b4273d28a0255d9cd6ab293d771`, pathname hash `8437ed77f94ab487679dd8f75014ee3448af3eaf18d63c67037e7d11648d2723`, signed query only from unchanged result, no credentials/fragment/explicit port, exact ZIP descriptor and **85,481,294 bytes**.
- No general GCS allowlist; no FAL credential, Authorization or cookies to asset host.
- Result 60 seconds/2 MiB; asset 300 seconds including single public-address DNS resolution, **90 MiB** ceiling, exact final byte count and any Content-Length; whole operation 900 seconds.
- ZIP safety/inspection unchanged: 1,024 entries; 256 MiB per entry; 512 MiB aggregate; 200:1 ratio; 120-second inspection; no extraction/execution. DRC header validity is not full Draco decoding; visual/navigation quality remains unverified. Manual STOP after future inspection; no automatic approval or next-job release.

Accounting remains **$4.15 / $4.75 reserved; $2.528 known reported billing; fal charge UNKNOWN; existing $0.35 fal reservation retained once; $0.60 chest allocation unreleased**. Historical totals: 46 API requests, 8 downloads and 3 generations. No new reservation, refund, charge inference or ledger mutation.

`fal-artifact-download.ts`, `fal-artifact-zip.ts`, `fal-artifact.ts`, all original transport/URL-policy/parser modules and `.gitignore` are byte-for-byte unchanged by this correction. No production/root dependency/schema/UI/main changes.

## Regression verification

New tests use isolated synthetic Git repositories with the exact directory-only ignore pattern and absent private directory/anchor. They reproduce the old one-line result, call the helper actually used by the CLI, require the fixed check to pass, and prove no files/dirs/anchors are created. Removing either ignore pattern, explicit child unignore, or substituting an alternate nonignored path fails. Actual checkout helper tests cover dirty tracked/untracked files, wrong SHA and missing authorization; actual CLI negative tests reject unauthorized init and URL/hash/limit/path/manifest overrides before initialization. Additional tests preserve the exact stop hash, inherited pins/accounting and non-reuse of an old identity.

All original deterministic tests remain in place. Only synthetic temporary fixtures create test state; neither original nor recovery live private state is initialized during this preparation. Full deterministic suite, typecheck, zero-warning lint and isolated build results are recorded in DEV_STATUS.md. No production test/build is necessary because production is unchanged.

## Future execution boundary

The existing `fal-artifact-cli.ts` now selects only the recovery manifest. Offline `inspect` prints the new candidate identity/hash and unchanged limits/accounting without reading credentials or creating state. The previous preparation instructions remain historical; future commands must use **the newly owner-approved correction SHA**, the new recovery worktree and current freeze. All existing fixed source-root flags remain unchanged; no new override flags exist.

After owner review, a separate authorization must explicitly permit initialization and the single retrieval. Verify exact clean HEAD/freeze and unchanged histories, confirm the original stopped worktree still has no private state and the new worktree's root/anchor are absent, then use the frozen CLI. Do not execute this sequence during preparation.

**STOP for owner review after the offline correction commit/push.** Do not initialize, fetch a result/artifact, refresh signed URLs, run chest/next, begin additional phases, merge main or deploy.
