# V1 wave 1 — FRAME correction and bounded UX — final verification

## Exact candidate and authority repair

Frozen code candidate: `b8533ebecbc335248bc018bbeac924db2ff3b223` on `codex/v1-completion-wave1`, continuing `aa835f827c5b6c5de923b44c2b28fff2ec80fb22`. The completion record commit changes documentation only. Remote main remains `e4f9171f9db87428b5b5812837474eb2c87c5aa8`. This corrected integration and revised UI are **ready for owner review, not owner accepted or published to main**.

Root cause: the generic campaign document mutation treats changes as factual corrections; FRAME queued/terminal records were incorrectly sent through that path. Migration `supabase/migrations/202609270023_v1_frame_lifecycle.sql` adds the narrow service-only `rpg_frame_lifecycle` entry point and private fenced writer mode. The existing generic RPC always retains correction semantics. The dedicated entry point independently validates the full typed target/job/transition, public scene/reference/source versions, owner/campaign, exact receipt and timeline fence, then appends through existing immutable versions/receipts without increasing Canon generation. This is not a reserved-prefix exemption or client-selected mode. Genuine factual, appearance-reference and immutable Source corrections still invalidate Lab bases.

Production binding: `src/lib/server/frame-lifecycle-mutation.ts`, `src/lib/visual-frame/authority.ts`, `src/lib/visual-frame/server.ts`. Direct current-scene orchestration: `src/lib/visual-frame/current-scene.ts`, `src/components/visual-frame/current-scene-frame.tsx`, `src/components/persistent-game.tsx`. Retained committed completion commands replay their exact server receipt before mutable scene preflight; uncommitted stale commands still fail validation. Stable queue/asset/completion operation identities avoid duplicate results after lost responses or refreshes.

## Fresh final automated results

| Check on frozen combined candidate | Actual result |
| --- | --- |
| Complete repository deterministic suite | **1,317 collected; 1,316 passed; 0 failed; 1 opt-in hosted test skipped** |
| Route type generation | Passed |
| Nonincremental TypeScript `--noEmit --incremental false` | Passed |
| Repository lint `--max-warnings 0` | Passed |
| Production Next webpack build | Passed |
| Final combined affected UI/runtime/helper/retry tests | **94/94 passed** |
| Real SQL lifecycle and populated historical upgrades | **19/19 passed** |
| Native before/after browser captures | **24 pairs / 48 unedited images** |
| Historical live-evaluation integrity | **128 files hash-identical** |

The complete suite ran with `--test-concurrency=3` and a credential-free local production server at `http://127.0.0.1:3100`. No provider/hosted database calls were made. Application/tests/scripts received zero-warning lint; ignored immutable `test-results/` remain excluded. Raw final logs are under `test-results/v1-frame-correction/`: `final-full-suite.log`, `final-typegen.log`, `final-typecheck.log`, `final-lint.log`, `final-build.log`, `repair-focused-final.log`, `sql-upgrades-focused.log`, `final-gates.json` and `integrity.json`. No application code changed after these final checks; the final results commit is documentation only.

Real disposable SQL tests invoke the production FRAME authority and Lab continuation path. They reproduce the original Canon-generation regression before migration 23; then prove queued, completed, failed, cancelled and exact retried work preserves checkpoint eligibility and creates a normal independently fenced child. They cover response uncertainty without duplicate documents/assets/results, source/revision races after TypeScript preflight, altered/prefix-only/malformed/foreign target commands, ACL/owner isolation, timeline fences, exact receipt conflicts and semantic duplicate detection. Genuine visual/factual document and private immutable Source corrections invalidate stale checkpoint bases and child preparation. Populated upgrade prefixes **1, 7, 9, 10, 11, 12, 13, 14, 16, 20** pass through additive migration 23. Existing full-suite save/timeline/reward/progression/commerce/World/private import regressions also pass.

## Preserved iteration evidence

- Earlier focused shared **3/3**, current-scene/FRAME/SQL **47/47**, combined UX **83/83**, committed-retry **49/49** and final worker UX **26/26** successes remain iteration results; the final affected set is **94/94**.
- The initial complete run was interrupted after a concrete read-only review found the committed-completion recovery defect. Its `pre-retry-repair-full-suite.log` is not a completed success. Earlier successful typegen/TS/lint/build checks remain separately recorded as `pre-retry-repair-*`.
- The first completed combined run collected **1,317: 1,313 passed, 3 failed, 1 skipped**. Three translation assertions found the same raw Gallery MOCK label. A focused follow-up also exposed literal language labels in the new preview wrapper. Both now use the existing dictionary/language-option labels; assertions were not weakened. `pre-gallery-ux-full-suite.log` and `gallery-i18n-initial.log` preserve failures; repaired focused translation checks passed **19/19**, followed by the fresh complete success above.
- A prior focused VM test imported a server-only module; its test harness was corrected without changing the production boundary. No failure was relabelled as a passing check.

## Browser review of the ordinary campaign presentation

[Open all EN/RU desktop/mobile before/after pairs](<C:/Users/<owner>/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/v1-frame-ux/BEFORE_AFTER.md>). Before basis: `aa835f827c5b6c5de923b44c2b28fff2ec80fb22`. After basis: `b8533ebecbc335248bc018bbeac924db2ff3b223`, served by the final production build. Each of the six screens was captured in EN and RU at requested **1280×900** and **390×844** viewports. Native browser captures retain their clipping/scrollbars and were not resized or edited. Every final screen passed observed horizontal-overflow checks.

The credential-free `/preview/v1/campaign` route renders the actual `PersistentShell`, Game, Gallery and the same Visual Bible/What If/Places/Timeline campaign components using explicit synthetic page-local snapshots and transports. It does not substitute an unrelated dashboard or alter real campaign authentication. `reviewOnly` prevents gameplay refresh/polling only in this explicit harness; ordinary gameplay defaults remain unchanged. The V1 fixture JSON itself is unchanged. These are synthetic ordinary-interface checks, not an authenticated owner database, hosted Supabase or physical iPhone.

Observed interactions on the final production build:

- Game applies FRAME to its current scene, displays simple status and labelled schematic MOCK, and shares the result with Gallery in all four language/viewport sets. Ordinary Visual Bible has no manual Complete mock/Test mock failure controls; those remain only in `/preview/v1`.
- Visual Bible puts appearance/outfit correction and approval first; Gallery puts results/history first. Optional composition, version details and full limits remain accessible as secondary disclosures.
- What If opens with natural-language entry and readable saved review. Russian mobile question-answer-only edits cannot supply structured timing or enable approval; numeric timing still cannot approve without explicit owner confirmation and saved review. No clarification was auto-answered or proposal auto-approved. English desktop exact checkpoint inspection exposes the public saved moment and a gated natural-language child review. No Interpret/Start/provider action was triggered.
- Russian mobile Places manual note correction retains both old and new immutable page-local versions. Place/notes lead; history, correction and full reference limitations are secondary.
- Inactive Timeline branches explicitly show saved moments rather than complete historical scene transcripts. Filters, lineage and order are secondary. Unknown/unrecorded links remain unknown.

Native artifacts: `C:/Users/<owner>/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/v1-frame-ux/before/`, `after/`, `before-manifest.json`, `after-manifest.json`, `interaction-proof.json`, `SCREENSHOT_HASHES.json`. Supplemental captures include RU mobile natural-language entry, timing gate and inactive history, plus EN desktop natural-language entry. The after manifest, hashes and interaction proof are also copied to ignored local `test-results/v1-frame-correction/`. Earlier browser results remain historical evidence; no live-model-quality or physical-device claim is made.

## Integration, preservation and remaining limits

Only the already-contextualized visual implementation worker was reused (Sol high). Final worker handoff **`d00d606c3b359363b42b7118f93693c4d79689c5`**, branch `codex/v1-frame-lifecycle-correction`, is pushed. Prior repair handoffs `6d9cf40db8c0804a05eff05bedd8922d05a3d640`, `f2e957a4282a88cf42d3fe8d9b830251e06623a5` and `3187558b7880fa93e33231a9411c309263af4e1e` were reviewed/cherry-picked by Lead. Lead owns additive SQL, shared server/Game glue, final integration and status; no additional/duplicate workers or broad research were started.

The original dirty checkout, all 128 historical evidence hashes/reveal mappings and the complete prior status body are preserved. Mega DM gameplay/model-runtime code, defaults, Character Models/Craft and fixtures are unchanged. The corrected synthetic V1 fixture records are also unchanged. No real database migration, private campaign import, provider/model/image call, deployment or main merge occurred.

FRAME remains local schematic MOCK, with existing separate asset/attachment writes and explicit receipt recovery; no image adapter or automatic generation. Migration 23 requires separate authorization for real installation and has run only on disposable PGlite. Places remains personal reference notes, not rest/access/inventory authority. Inactive Timeline histories are saved moments rather than reconstructed full scene transcripts; unknown associations are not fabricated. What If remains exact-checkpoint single-model continuation, not full multi-model D2B. No new feature lanes, Home mechanics, future phase or shell redesign were added. Next action is owner review, with main unchanged.

---

The records below retain their original then-current results and qualifications. They are historical evidence, not fresh results for this corrected candidate.

# V1 wave 1 — FRAME repair and bounded UX verification (in progress)

Correction starts at `aa835f827c5b6c5de923b44c2b28fff2ec80fb22`. The implementation and focused checks are frozen for one complete final gate. Combined focused checks: **83/83**; real SQL lifecycle plus populated upgrades: **19/19**. Final results and before/after evidence will be prepended here after verification. The earlier wave report below is historical, not a substitute for fresh correction results. Main remains `e4f9171f9db87428b5b5812837474eb2c87c5aa8`.

---

# V1 completion wave 1 — integration verification

## Candidate and publication boundary

Frozen code candidate: `ea4d6cae1709f1e3efd6b1ffe13a35a73d2e8a35` on `codex/v1-completion-wave1`. The final record commit changes documentation only. Accepted Mega DM closure and remote main: `e4f9171f9db87428b5b5812837474eb2c87c5aa8`. The evaluated Mega DM implementation `33c6163110090ff69a2737a435666954bbf2bced` remains in ancestry. This new wave is ready for owner review, not owner accepted or published to main.

Lead reviewed authority, migrations, privacy, shared contracts, retries and navigation before integration. The owner narrowed the historical D2B roadmap to exact-checkpoint single-model children; multi-model comparison remains deferred. No broad architecture research, additional provider, second backend, Memory/history/inventory authority or live call was added.

## Fresh final gates

| Check | Result |
| --- | --- |
| Complete repository deterministic suite | 1,282 collected, 1,281 passed, 0 failed, 1 opt-in hosted test skipped |
| Route type generation | Passed |
| TypeScript, non-incremental `--noEmit --incremental false` | Passed |
| Repository lint, `--max-warnings 0` | Passed |
| Production Next webpack build | Passed |
| Final translation/navigation/preview checks | 10 passed |
| Visual authority, actual handlers and uncertain retry checks | 28 passed |
| Populated historical upgrades through migrations 21/22 | 10 prefixes passed: 1, 7, 9, 10, 11, 12, 13, 14, 16, 20 |
| Shared detached continuation/receipt/Memory checks | 3 passed |
| Recorded historical evidence integrity | 128 files hash-identical |

Commands ran on the final isolated checkout. The full suite used `--test-concurrency=3` and a credential-free local production server at `http://127.0.0.1:3100`. Hosted Supabase verification is opt-in and skipped; no real database migration or provider request occurred. Ignored immutable historical `test-results/` are excluded from lint, while source/tests/scripts receive zero-warning lint. The only two failures in the first integrated full run were untranslated mock/preview JSX labels and the old navigation assertion missing FRAME. Focused repairs passed; the fresh final complete run above passed. No historical test count substitutes for this final run.

Local raw logs: `test-results/v1-completion-wave1/final-full-suite.log`, `final-typegen.log`, `final-typecheck.log`, `final-lint.log`, `final-build.log`, `integrity.json`. The preceding failed full-run log is retained separately as `full-suite.log`.

## Authority and security evidence

- Exact authorized immutable detached checkpoint membership, source/correction/canon generations, input digests, normal Scenario/Divergence review, nullable timing and explicit owner timing confirmation fence each child. Child creation copies exact vault membership without active projection restore or head switching. Existing source run and playable/sibling state remain unchanged; exact committed retry survives later source progress/cancellation. Invalidated source/correction bases fail closed.
- Public inspection and Timeline Explorer project public saves/scenes/Lab checkpoints, including exact child lineage. Private/future restrictions apply before projection/limits; unsupported historical Actor/place/effect links remain unknown. No prose-derived fabricated graph, hidden diagnostics or secret counts.
- Places reuse existing Location identity and immutable campaign reference documents. Manual label/role/notes create versioned owner reference data, never automatic access, visits, rest or inventory movement. Reserved metadata is excluded from gameplay Memory before indexing, even if malformed; Library does not expose its raw edit path.
- Visual references and FRAME jobs use exact current public entity/scene/source versions, timeline/epoch fences and existing mutation receipts. Only explicitly selected approved references enter public briefs. Manual correction returns references to drafts and preserves history. Mock completion cannot invent storage URLs or mutate RPG state; failures/cancellations are independent of text gameplay.
- Existing accepted regressions cover old manifests/save loads, populated migrations, World Logic, controlled-PC agency, source/future/private restrictions, cross-campaign isolation, provider no-fallback, reward/trade atomicity, progression receipts, save/fork replay, and client/server import boundaries. No narrower test replacement removes these checks.

## Browser evidence — separate from automated results

Actual components were exercised with page-local synthetic transports in English/Russian at desktop and 390×844. Four screen sets were reviewed in each language/viewport: Timeline Explorer, Places, checkpoint child and Visual Bible/FRAME. Manual Places history, exact historical checkpoint selection, unresolved review approval, visual correction/reapproval and complete/fail/cancel/retry states were exercised. Narrow viewports had no horizontal overflow. Final production-build desktop EN/RU checks were repeated after the bounded UI repair.

Screenshots are preserved locally under `C:/Users/<owner>/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/v1-browser/`, including `final-production-en-desktop.png`, `final-production-ru-desktop.png` and earlier EN/RU desktop/mobile screen sets. This is not physical-iPhone or hosted-Supabase testing. The preview calls no model and keeps scripted child approval blocked; deterministic SQL tests prove actual child preparation/approval/advance/replay.

The browser identified a FRAME UI cache bug: an explicit new request after a terminal job replayed the prior request ID. The contextualized visual worker repaired only the active cache lifetime. Tests execute the actual transpiled handlers: new terminal actions get fresh IDs, while transport/refresh uncertainty preserves exact retry identity; stable completion asset/attachment IDs remain unchanged. Browser retesting passed.

## Worker handoffs and efficiency

Every worker started from exact `e4f9171f9db87428b5b5812837474eb2c87c5aa8` in its own isolated branch/worktree. All handoff branches are pushed. Workers did not merge themselves or edit central status/specification files. Lead owns additive SQL 21/22, shared contract extensions, navigation and final integration.

| Lane | Model/reasoning | Final worker SHA | Focused checks | Branch |
| --- | --- | --- | --- | --- |
| A · World Lab exact checkpoint child | Sol xhigh | a3ed0063b075c8577577cfc9f910609ec53377fe | 19 passed; typecheck/lint passed | codex/v1-world-lab-continuation |
| B · Timeline Explorer V1 | Sol high | bae5000842b60344c7634844c4aa4d9ac072a662 | 17 passed; typecheck/lint passed | codex/v1-timeline-explorer |
| C · Places of Belonging V0 | Sol high | 08553da6f9dca9315659c5ab1a6e04e3f944f44b | 23 passed; typecheck/lint passed | codex/v1-places-belonging |
| D · Visual Bible / FRAME V0 | Sol high | 1211efb7b328ba50ad472f9038806ca27efc9971 | 28 passed; typecheck/lint passed | codex/v1-visual-frame |

Four primary workers were scheduled sequentially where necessary under the four-active-agent environment cap including Lead. No extra worker, duplicate repo-wide reviewer or Astra escalation was used. Contextualized workers handled bounded followups. Per-lane tokens are unavailable; account-window observations moved from 5% to 19% used (14 percentage points), and account credits remained 10320.854195. Account metrics are shared across tasks and cannot establish lane-attributable tokens, credits or dollar cost.

## Preserved state and remaining limits

The original dirty checkout's DEV_STATUS.md and PHASE3_EVALUATION.md remain hash-identical. Accepted status/history bodies, 128 historical live-evaluation files and reveal mappings are preserved. Stage 2 does not alter Mega DM gameplay/model-runtime code or fixtures. No new live text/image request, production migration, real import or deployment occurred.

The four bounded slices are usable foundations, not complete V1: single-model continuation only; honest missing historical associations; manual Places reference notes rather than automatic home mechanics; labelled local MOCK images rather than provider imagery. FRAME result creation/attachment consists of two existing idempotent writes and explicit recovery after interrupted attachment, not a new atomic media-job store. Owner reference corrections survive ordinary Save/Load and can invalidate derived Lab bases. Migrations 21/22 require separately authorized real installation; the synthetic preview requires no setup.

Owner review of the exact integrated branch is the next step. No automatic main publication, multi-model D2B, Timeline V2, Enter This World, live image adapter/evaluation, VIDEO, EXPLORE or 2D work follows from this report.
