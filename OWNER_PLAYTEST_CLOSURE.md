# Owner playtest closure — ready for owner review

Base: `02ebc4b42ff06606b25e9989bb7f9eda068727d7`.
Branch: `codex/owner-playtest-closure`. Implementation and authorized verification
complete. Not activated or owner-accepted. Owner DB remains at Migration 48.

## Commit scopes

- `509b71f96c9f12854c82fcd743aec79b1e024e11`: shared private-plan context and
  capacity accounting, bounded summary reread, food provisions, private Migration
  49 parity, disposable fixture/tests and bounded acceptance harness.
- `b8d9c7ced676efba472a13cc8dd7c293e016e475`: English-only natural narration
  guidance and its two focused tests.
- `bcf0dc2c038b8b200156852cf5aa568eec204466`: rest-only private/restricted/quest
  policy exclusion in TypeScript/SQL and negative regressions.
- Final UX/report commit: scoped Game/Character/Inventory presentation, safe
  resource labels, exact-subject artwork fallback, synthetic preview coverage and
  this final evidence. No gameplay authority changes in the UX commit.

## Runtime closure

The preserved Iris operation `574862da-14ee-4881-a5cb-6a23f144458e` is untouched.
Its original nonretryable `plan/context` failure was reproduced read-only before
implementation. Public narration preflight fitted while private planning did not.
The original Memory response/stack was not saved; both plausible private-summary
visibility states reproduced the capacity failure against the frozen source.

One shared `buildAstraPlanContext` now projects the Astra packet before required
sizing, Memory retrieval-room calculation, optional-history selection and final
assembly. The final provider guard uses the same actual schema, instructions,
receipt/check envelope, model/reasoning/tier body and 2,048-byte framing reserve.
Legacy planner-only instructions/schema and house-profile text are not charged
against an Astra packet that will never send them. Authoritative current state,
current scene, private state, relevant Canon/Memory and world evidence remain.
Generic legacy context and public narration caps are unchanged.

Read-only measurements of the frozen owner source (no owner provider call):

| Packet/coverage | Required bytes | Full selected bytes |
| --- | ---: | ---: |
| Old private precursor, private summary ready | 67,150 | — |
| Old private precursor, private summary not ready | 68,094 | — |
| New actual Astra packet, public summaries unavailable | 72,931 | 79,620 |
| New packet after first public summary | 61,687 | 71,305 before optional trimming |
| New packet after both public summaries | 49,954 | 62,167 |

The last two columns use the real provider schema/body accounting. Measurement
temporarily used an in-memory 96k budget to inspect untrimmed sizes; production
remains **64,000 bytes**. Completing summary coverage solves the demonstrated
pressure without raising the cap or dropping mandatory evidence.

Durable begin and runtime pin still precede all context/provider work. Astra now
claims the operation before its private-plan Memory preflight, so duplicate
requests cannot each initiate preflight for that operation. The claimant can
complete up to three existing summary jobs, then performs one deterministic
Memory reread/re-evaluation. There are no sleeps, polls, or unbounded retries.
If another worker still owns essential coverage, capacity remains a safe,
retryable pause rather than a permanent failure. Summaries remain derived,
source-linked evidence and do not reconstruct gameplay state.

## Rest provisions and Migration 49

`202610090049_astra_rest_provisions.sql` is required for independent SQL parity.
It was applied only to disposable PGlite databases. Owner DB remains at 48.
It adds one private provision predicate and replaces exactly two guarded
predicates in the effective Migration-48 reconstruction function. Existing
function identity/permissions and unrelated 47/48 authority remain intact.

An accessible ordinary Item unit qualifies when category is `food` or `supply`,
or it has the explicit supply tag. Weapons, meal/coffee servings, inaccessible
NPC inventory, zero quantities and private/restricted/quest sources remain excluded
by the shared classification and existing ownership/storage/visibility guards.
One quantity unit pays one provision unit. No Item category is rewritten.

The disposable Iris-shaped acceptance uses a known visited roadside market,
public tonight-sleep permission, no persistent safe-location entry, no encounter,
HP 10/10, silver 2, minute 13 and one untagged ordinary vegetables Item. Fake
Astra reaches production planning, proposes existing `formal_rest` with temporary
safety, and commits quantity 1→0, minute 13→493, HP 10/10 and one complete rest.
Money, Location, Quests and other Items stay unchanged. Exact committed replay
performs no provider work and applies no second consumption or time advance.

## Verification at runtime checkpoint

- Context/Memory/runtime/provider/parser focused batches: 77/77 passed.
- Rest/ordered effects/recovery/Migration-49 batch: 44/44 passed.
- Bounded live-harness offline tests: 3/3 passed.
- Populated 48→49 preserves 15 relevant campaign-table fingerprints, committed
  and pinned pending turns, other Astra definitions and target function grants.
- Migration-49 independent SQL rejects a forged inaccessible food payment.
- These focused batches overlap; they are not presented as one distinct-test
  total. Final integrated results and live acceptance follow below.

## Owner safety

No owner gameplay, saves/timelines, database migration, media call, main merge,
owner app/environment change or deployment is part of candidate development.
The only authorized live work is one fresh disposable long-rest turn after
offline gates: one Astra High planner and one Astra Medium narrator, default
tier, at most two requests, no quality retry and a conservative $2 ceiling.

## Prose

English campaign narration receives one compact instruction for idiomatic,
natural conversation while retaining character/setting voice and intentional
fantasy diction. Other campaign languages are unchanged. There is no text
postprocessor or hardcoded replacement dialogue. Tests inspect the actual
public narrator instruction, not the generated sentence.

## UX

Presentation-only changes retain the existing charcoal/bronze layout and story
hierarchy. Shared rem tokens are body 1rem (16px), controls .94rem (~15px),
metadata .875rem (14px), and card titles 1.25rem (20px). Main narration retains
its existing 19px scale. Game rail body is 16px; Character stats/skills are 16px.
The desktop rail is 290px wide. Equipment columns are 96px with 88px image
plates, readable labels, dark backplates, warm borders and focus/hover contrast.
Inventory cards are at least 154×190px, with larger thumbnails, two-line names,
full accessible titles and display-only initial capitalization.

Character separates Money from non-currency Resources; Game displays Silver
rather than `currency_silver`. The helper prefers a supplied public currency
label and otherwise humanizes the standard currency prefix. Valid ordinary
resource slugs remain distinguishable; UUID/path/private-looking keys receive
a neutral label. A legacy custom currency without the standard prefix or an
available public registry label cannot safely be inferred to be money and stays
under Resources. No stored resource key or canonical Item name is changed.

The frozen public waterskin record had no selected accepted image. The reported
bird-like appearance therefore remains untraced; no borrowed live Asset cause
is claimed. A preventive regression now rejects a real subject-image reference
whose embedded Item identity belongs to another Item. Missing trusted artwork
uses the existing neutral Package icon. No pixels were generated or modified;
portrait contents never establish equipment state.

UX files: `src/app/globals.css`; `src/components/live-game.module.css`,
`live-inventory-presentation.module.css`, `live-inventory-presentation.tsx`,
`live-ui-review.tsx`, `persistent-game.tsx`, `persistent-records.tsx`,
`phase0-character.module.css`, `phase0-character.tsx`,
`phase0-record-doll.module.css`; `src/lib/resource-presentation.ts`,
`live-inventory-view.ts`, `locales/ru.json`, `visual-frame/subject-visual.ts`.
Four focused presentation test files cover labels, display-only formatting,
accepted artwork/fallback, Game and Character rendering. UX focused: 36/36.

## Final acceptance evidence

### Offline gates

| Gate | Actual result |
| --- | --- |
| Context/Memory/runtime/provider/parser focused batches | 77/77 passed |
| Rest/ordered/recovery/Migration-49 batch | 44/44 passed |
| Migration-49 focused tests within the rest batch | 7/7 passed |
| Existing formal-rest focused tests | 25/25 passed |
| Bounded live-harness tests | 3/3 passed |
| English narration instruction tests | 2/2 passed |
| Final UI presentation batch | 36/36 passed |
| Complete repository suite | 2,241 passed / 2,242 total; zero failures, one existing opt-in Supabase Auth/PostgREST skip |
| TypeScript | Passed, including after restoring the tracked generated Next header |
| Repository ESLint | Passed with zero warnings |
| Production webpack build | Passed, repeated after the final rail empty-state font correction |

The early integrated run exposed a brittle new test assuming exactly two fixture
turns although the reused fixture contains six. The assertion was corrected to
check preservation and exact known identities. No production behavior was changed
to accommodate it. The final focused and complete results above supersede that
intermediate failure; its ignored log is retained.

### One fresh real-Astra disposable rest

Operation: `09d877ec-73dd-41b7-989b-fe3f779e3e05`.
Input: `i take long rest`. Fresh PGlite campaign, no owner connection.

**Committed and acceptance passed.** Astra High privately planned existing
`formal_rest`; Astra Medium narrated the validated public outcome, default tier.
No quality retry, extra turn, check/tool roll, media call or SQL error occurred.

| State | Before | After |
| --- | --- | --- |
| HP / max HP | 10/10 | 10/10 |
| Vegetables quantity | 1 | 0 |
| World minutes | 13 | 493 |
| Complete rests | 0 | 1 |
| Silver | 2 | 2 |
| Quests | 0 | 0 |
| Active encounters | 0 | 0 |
| Location / other Items | Existing roadside market / unchanged | Same |

Committed-operation replay returned the same result with zero provider calls,
zero further consumption and zero further time advance. Persistent safe Location
configuration remained unchanged; suitability was operation-scoped.

Accounting: **2 requests**, **13,051 input**, **538 output**, **0 cached** and
**191 reasoning tokens**. Provider latency: planner **11.374 s**, narrator
**7.199 s**, sum **18.573 s**. Conservative estimate **$0.15741** using the
existing harness estimate ($10/M input, $50/M output), below the $2 bound. This is
an estimate, not a billing receipt. One attempt marker prevents an accidental
repeat. Core Doctrine and one recovery/rhythm Craft card were selected privately;
public narration selected recovery/rhythm and quiet/decompression guidance.

Raw bounded synthetic diagnostics/accounting are retained at
`test-results/owner-playtest-closure/live-long-rest.json`, SHA-256
`DAA974CBBC61564A60671168FB5C41919220199055E2CCACFCCA6381AF422458`.
No request headers, credentials or owner private prose are stored there.

### Responsive visual evidence

All artifacts are under the ignored local directory:
`C:/Users/karis/.codex/worktrees/owner-playtest-closure/personal-rpg-console/test-results/owner-playtest-closure/`.

Before: `before-{game,character,inventory}-1920.jpg`, plus
`before-{right-rail,equipment,inventory-cards}-1920.png`.
After: `after-{game,character,inventory}-{1920,2560,390}.png`, matching
`viewport-*` images, and `after-{right-rail,equipment,character-inventory,inventory-cards,composer,item-focus,equipment-focus}-1920.png`.

| Viewport | Game / Character / Inventory | Overflow / zoom / page errors |
| --- | --- | --- |
| 1920×1080 | Visually inspected | None / 1 / none |
| 2560×1440 | Visually inspected | None / 1 / none |
| 390×844 | Visually inspected | None / 1 / none |

Metrics are in `ui-layout-matrix.json` and `ui-type-details.json`. Desktop
navigation is 15.04px, breadcrumbs 14px, narration 19px, rail body 16px and
headings 20px. The remaining rail empty-state exception was corrected to 14px.
Equipment cards are 96px wide desktop and 84px mobile, with 88px desktop image
plates; labels increase total card height to about 148–152px. Character inventory
cards measure about 161×190px and standalone inventory 176×205px. Item names
are 16px, category labels 14px and filters 15.04px. Full vegetables names,
neutral waterskin placeholders and visible keyboard focus were inspected.

The in-app capture failed; the owner explicitly authorized headless capture.
Headless Edge used only the synthetic preview, with no owner session or external
requests. Baseline Game/Character capture width is 1904px including the original
scrollbar convention; baseline Inventory is 1920px. The synthetic fixture also
expanded from three slots/two Items to eight slots/four Items, so these are
presentation comparisons rather than identical-data screenshots.

The review-only composer intentionally disables gameplay. Separately,
`css-only-sticky-probe.json` / `css-only-sticky-{1920,390}.png` exercise the built
production CSS and existing form structure in a static synthetic DOM. The form
pins at 12px desktop / 68px mobile during scroll, releases at its container end,
and its controls fit 390px. Submission and all subsequent network were blocked.
This is a CSS geometry check, not a real owner gameplay submission.

## Limitations and next step

- Three summary jobs and one reread are bounded. If required coverage is still
  unavailable, the operation pauses retryably. The existing 300-second lease
  remains a timing limit on unusually slow multi-summary turns.
- Legacy custom currencies need a public label or the standard prefix to be
  categorized as Money; no new public registry endpoint was added.
- The historical bird-like waterskin appearance remains untraced. Exact-subject
  binding/fallback is regression-covered; no owner art was regenerated.
- The synthetic portrait is a neutral placeholder. Equipment leaves a central
  clear region (about 295px desktop / 152px mobile); this proves geometry, not
  inspection of the owner's illustrated face.
- No owner long rest was performed, and the historical failed operation is
  unchanged. Its final read-only row hash remains
  `5456e0aa9c9717acff2a6cdd10cd54e2`, status `failed`, failure `context`, expected
  revision 56, nonretryable. Candidate development does not rewrite history.

Main remains `02ebc4b42ff06606b25e9989bb7f9eda068727d7`; owner DB remains at 48.
No owner app/environment, Iris gameplay, saves/timelines, portrait, media or
deployment was changed. Separate owner review and authorization are required
before integration, owner Migration 49 or runtime activation.
