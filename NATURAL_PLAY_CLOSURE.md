# Natural play closure — isolated review candidate

**Status:** implementation and required verification complete; ready for owner review, not activated or owner-accepted. Branch `codex/natural-play-closure` starts at main `f94d25bd4d6a6609d8539c59bc973d15007509c3`. Migration 50 is authorized for disposable testing only. The owner database remains at Migration 49.

## Preserved owner failure

Read-only inspection identified Iris operation `221298f5-6b30-44f4-badc-066ad39e9295`, created `2026-10-14T22:09:53.979175Z`, with literal input `i go around village and ask for work` followed by its original newline.

| Stored evidence | Value |
| --- | --- |
| Runtime / status | `astra-primary-v1` / `failed` |
| Failure / retryable | `provider` / `true` |
| Expected / committed revision | `67` / null |
| Diagnostic | stage `plan`; phase `failed`; category `provider` |
| Provider response received / narration parse succeeded | false / false |
| Claimed source | present; no remaining active lease |
| Checks / Astra receipts | 0 / 0 |
| Astra final / resolution / narration | absent / absent / absent |
| Settlement / schema-1 or schema-2 effects | absent |

The existing checkpoint `plan` is the legacy placeholder, not a completed Astra final. The provider marks `responseReceived` immediately after fetch returns an HTTP response, before response/status/JSON parsing. The persisted diagnostic therefore locates this failure at the planning transport boundary, before any HTTP response was received. The bounded local log contains `astra_plan_diagnostic {}`; it does not preserve an HTTP status, native fetch exception, provider request ID, or abort reason. **A timeout or particular network/provider cause cannot be proven.** It is also unknown whether OpenAI received the attempted request.

No gameplay commit occurred: zero runtime events for the operation, no committed revision, and current runtime remains revision 67 / world minute 494. Both Entities, all three Items, public state and timeline fence match the pinned source. There are no new Scenes, Rest records, save points, save commands, manifests, or updated timelines after this input. Quests remain empty. This does not claim that preflight Memory infrastructure never performed its ordinary summary work during the owner's original request.

## Root cause and bounded recovery

This owner action reached the known **pre-final provider-failure category**. Its initial failure was not caused by the retry defect: the owner did not retry it during this task. Code inspection and disposable reproduction establish a separate defect that would obstruct later Retry: Migration 48 promotes a reclaimed failed Astra turn to `generating` only when schema-2 ordered effects already exist. A pre-final failure has none; its first resumed diagnostic write then rejects the retained `failed` status.

`202610140050_astra_retry_lifecycle.sql` wraps the existing runtime chain and promotes only a successfully leased, explicitly pinned, retryable failed Astra Game turn. It verifies the source/checkpoint/runtime and returned lease; preserves the exact operation, source, expected revision, timeline, checks, receipts, final/effects and narration; and clears only the prior attempt status/failure/diagnostic. All earlier claim, authorization, revision, lease, timeline and commit guards remain in the delegated chain. Legacy/null-runtime, nonretryable, live-lease and stale-timeline behavior is retained. No public DTO, gameplay authority or existing migration is changed.

The TypeScript runtime has one automatic transport-retry budget per leased execution attempt, shared by planning, tool continuations and narration. It can be spent only after explicit `request` / `responseReceived=false` observation, a retryable provider/unavailable failure and no newly produced check, receipt, final or narration. Response-received, schema, validation, conflict and unobserved failures do not qualify. A second failure is preserved for manual Retry. A later explicit manual Retry gets a new lease and resumes the same pinned operation. Existing deterministic receipts/checks are reused; committed replay performs no provider work or second commit.

This is transport resilience, not a new action schema, fictional restriction, fallback model or quality retry. Astra's free-form narrative authority and all durable-state validators are unchanged.

## Normal Game presentation

- Pending/generating: one quiet `DM is thinking…` line; successful narration removes it.
- Retryable connection failure: compact `The DM connection was interrupted. Try again.` with one primary `Try again`.
- Cancel moves to secondary `More options` as `Abandon this action`.
- Ordinary saved-action/current-world/checkpoint lifecycle paragraphs and duplicate composer retry controls are removed. Exceptional uncertain timeline reconciliation retains `Check saved turn` inside `More options`.
- Genuine displayed checks and Continue/Reroll remain visible. No recovery action was taken on Iris.

## Portrait framing and evidence

Character and Inventory share `paper-doll-framing.module.css`. The existing accepted Iris portrait bytes are reused without generation, pixel edits or owner record changes. Accepted-only selection remains unchanged. Equipment rails, health/Money presentation, large slots and inventory typography are preserved.

The shared image stage is 620px on desktop and 520px on narrow screens, with consistent subject-biased cover framing instead of filling the entire tall equipment container. Rails begin 215px below the image top on desktop and 190px on mobile, below Iris's face. This keeps the existing head-to-body composition at a moderate scale; it does not claim automatic face detection or perfect composition for every future image. Inventory's empty slots retain stronger contrast.

Before captures use the read-only owner UI. After captures use the credential-free isolated preview with synthetic records and a temporary local fixture pointing to the exact same portrait bytes. The temporary fixture/selector overrides are restored byte-for-byte before final tests/commit; owner portrait bytes and screenshots remain ignored, never committed. Character and Inventory are reviewed at 1920×1080, 2560×1440 and 390×844.

Evidence folder: `test-results/natural-play-closure/`, with `character-before-*`, `character-after-*`, `inventory-before-*`, `inventory-after-*`, the scrolled mobile Character portrait and `portrait-after-geometry.json`. All six responsive geometry checks report no horizontal overflow and no slot outside its container; visual inspection confirms the face is clear. After screenshots use synthetic Item icon fallbacks rather than unavailable fake storage URLs; production accepted Item art selection is unchanged. No image generation or VIDEO work was performed.

## Verification

Focused runtime/recovery tests: **70/70**. Game/portrait presentation: **33/33**. Existing Character accepted-art compatibility: **5/5**. These are disjoint focused files, **108/108** in total, including the 11 new retry/migration tests. Complete repository suite: **2,272/2,273 passed**, zero failures, one existing explicit-opt-in live disposable Supabase Auth/PostgREST skip; duration 616.207 seconds. TypeScript, repository ESLint with zero warnings and final production webpack build pass. Runtime/migration checks use disposable PGlite databases and fake providers. Full HTTP tests use the credential-free preview, never the owner server. One existing presentation test harness was extended to recognize the shared CSS module; its assertions remain intact. A final UI regression verifies only duplicate connection copy is hidden; distinct command/setup/conflict errors stay visible.

Verification logs: ignored `test-results/natural-play-runtime-focused.log`, `natural-play-ui-focused.log`, `natural-play-character-compat.log`, `natural-play-full.log`, `natural-play-typecheck.log`, `natural-play-lint.log`, `natural-play-build.log`. The isolated test server was stopped after verification; the normal owner server was left running. Generated Next type-header changes and temporary screenshot fixture/selector changes were restored; the temporary public image copy was removed while the ignored original evidence copy was retained.

## Files / areas changed

- `src/lib/gameplay/astra-primary.ts`: bounded transport retry.
- `supabase/migrations/202610140050_astra_retry_lifecycle.sql`: validated failed-Astra claim transition.
- `src/components/gameplay-turn.tsx`, `gameplay-composer.tsx`, `src/lib/locales/ru.json`: normal processing/recovery language and controls.
- `src/components/phase0-character.tsx`, `persistent-records.tsx`, `phase0-character.module.css`, `phase0-record-doll.module.css`, new `paper-doll-framing.module.css`: shared portrait framing and equipment placement.
- `tests/astra-provider-resilience.test.mjs`, `astra-retry-lifecycle-migration.test.mjs`, `paper-doll-framing.test.mjs`, `playtest-game-character-ui.test.mjs`, `phase0-character-live.test.mjs`: focused regressions and existing harness compatibility.
- This report and `DEV_STATUS.md`: review evidence and activation boundary.

## Safety and activation boundary

All **79/79** owner RPG table counts/full-row fingerprints match before/after development. Owner registry is unchanged; Iris remains revision **67**, world minute **494**. The failed turn's full-row hash remains `536cee6c29a24919e48fd41b2a51150e`; its pinned source hash remains `134f1e2660c8ffc444ff088e31338e8b`. All 11 existing owner containers and five Docker volumes remain unchanged (port bindings compared as sets). Main, owner configuration, owner app and owner database are not changed. No owner retry/cancel, gameplay submission, paid text/media call or deployment was performed.

Future activation requires separate owner review, integration approval and explicit permission to apply Migration 50 to the owner database. This candidate does not itself unblock or retry the preserved Iris operation. The existing 300-second lease remains a possible limit on sufficiently slow provider/context sequences; this task does not change timeouts or lease policy.
