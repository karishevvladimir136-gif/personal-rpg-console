# Astra Freedom Pass — interactive continuation correction

Starting reviewed SHA: `4dd09b988935b358a0f7366605e1affe37b744ac` on `codex/astra-freedom-pass`. Main remains `edeb3542cb00c068b129faa95f24a21eeb3b9425`. This is an isolated review candidate, not owner activation.

## Exact correction

In `src/lib/gameplay/astra-primary.ts`, a valid `command.action === "continue"` still first requires an appropriate displayed recorded check. It now uses the existing `store.checkpoint(lease, checkpoint, "generating")` before resumed planning diagnostics or provider work. The same cloned checkpoint, renewed lease, source revision and timeline fences are retained.

This does not reroll or regenerate a check, append a duplicate receipt, clear checkpoint fields, reset an existing final proposal or change reroll behavior. Reroll remains the separate earlier branch and checkpoints `awaiting_confirmation`. Migration 44's diagnostic guard remains strict. Migration 47, Migration 48, provider schemas and settlement/mechanics authority are unchanged; **Migration 49 is unnecessary**.

Existing SQL checkpoint authority already permits `generating`, verifies the renewed lease/current source/timeline, compares recorded checks and preserves immutable receipt/final/effect pins. The correction changes lifecycle state after accepted confirmation, not mechanical authority.

## Deterministic regression

`tests/astra-interactive-diagnostic.test.mjs` uses a taken-over disposable campaign migrated through 48 and `createRpcTurnStore(..., true)` to enable production diagnostics. Five tests pass:

1. Attack receipt and check → displayed pause → fresh lease → unchanged checkpoint content at `generating` → successful planning diagnostic → existing receipts reused → final/narration/atomic commit. Recorded attack stays unchanged; independently recorded damage applies once.
2. Forged Continue check ID, foreign/stale timeline, token and revision are rejected without committing mechanics.
3. A malformed disposable awaiting turn with no displayed check cannot enter `generating` or call the provider.
4. Reroll stays awaiting confirmation; its replacement and immutable original tool receipt survive later Continue; repeated reroll is idempotent.
5. A lost response after successful commit, repeated Continue/Retry and input replay return the existing outcome without new rolls, provider work, damage, scenes or events.

The main test also asserts exact diagnostic stage order and that every diagnostic write occurs only while the stored turn is pending/generating. Existing runtime/recovery tests remain intact.

## Bounded live retest harness

The existing forensic harness has one `--scenario-c` selector: exactly one fresh independent C fixture and a shared four-text-request maximum. It cannot rerun A/B in this mode. The same literal dishwater input, production Astra High planning/Medium narration, default tier and route/accounting guards are retained. If a displayed check occurs, the normal Continue is issued once. No reroll, quality retry, media dispatch or owner connection is introduced. Previous two live JSON artifacts remain unchanged.

## Verification

- Focused tests: **41/41** (5 new interactive + 21 diagnostic/harness + 15 runtime/recovery), zero failures/skips.
- TypeScript passed; repository ESLint passed with zero warnings.
- Complete suite: **2,207/2,208**, zero failures, one existing explicit-opt-in disposable Supabase Auth/PostgREST persistence skip. Production webpack build passed, including its TypeScript gate. The isolated unconfigured preview used for HTTP regressions was stopped after the suite; the owner app was not restarted.
- Live C was called only after all offline gates passed and committed successfully, as recorded below.

## Fresh live C — passed

Exact retained evidence: [ASTRA_FREEDOM_LIVE_C_RETEST_DATA.json](ASTRA_FREEDOM_LIVE_C_RETEST_DATA.json). Previous A/B and failed C evidence remain unchanged; neither previous C operation was retried or resumed.

- Fresh disposable campaign: `34780641-83e8-4dc3-83e3-4973f59f5c9c`.
- Fresh operation: `9da4783b-d3b4-4f67-b717-7d26f12fd7e9`.
- Input: `I scoop the disgusting cold dishwater from the slop bucket into a mug and fling it at the bartender. What happens?`
- Astra chose the existing generic `attack` tool. Receipt `500f4e33-ea67-58ce-86ab-2e00f2276260`, position/index **0**, contains server raw **2**, modifier **0**, total **2**, defense/DC **10**, normal advantage, roll number **1**, success **false**.
- The displayed check paused. The harness issued normal Continue once; the renewed claim was followed by the new unchanged-checkpoint transition before the second planning request. Astra reused the check, pinned an `attack_miss` final and completed public-safe narration/atomic commit.
- The final refers to the same single tool receipt; there is no duplicate check/receipt, damage roll, state patch, condition, bonus, healing, currency or resource creation. HP remained **4/12**, supplies **3**, resources empty, world minutes **0**, Location unchanged and persistent safety empty. Scene/narration committed; gameplay state was unchanged.
- Exact replay returned committed, made **zero additional provider requests** and changed no gameplay state. No reroll or quality retry occurred. SQL error/detail arrays are empty.

The bartender recoiled in time and ordered Rowan to leave; no answering blow occurred. This is the observed outcome, not a prescribed harness expectation. No bespoke dishwater mechanic was added.

**3 real text requests** completed with HTTP 200 and usable accounting: two `gpt-6-astra` High planners, one `gpt-6-astra` Medium narrator, all default tier. Usage: **22,009 input / 1,163 output / 3,642 cached / 706 reasoning tokens**. Request latencies: **10.203 / 17.554 / 5.538 seconds**; summed provider latency **33.295 seconds**. Conservative estimated spend **US $0.2782** uses the existing $10/$50-per-million accounting without applying a cached-input discount; it is not a billing receipt. Media calls: **0**. The one-turn/four-request cap was respected, and the disposable database was closed afterward.

## Changed files and review status

Production correction: `src/lib/gameplay/astra-primary.ts` only. Verification: new `tests/astra-interactive-diagnostic.test.mjs`; one C-only selector in the existing smoke script plus its focused test. Documentation/evidence: this report, `ASTRA_FREEDOM_CLOSURE.md`, `DEV_STATUS.md` and the new C retest JSON. No other production area or migration changed.

The accepted prior live A/B results plus this fresh live C complete the authorized Freedom Pass acceptance protocol. No remaining blocker was demonstrated in the tested Continue/C scope. This remains a candidate for owner review; integration and owner activation have not occurred.

## Scope and limits

This correction is valid displayed-check Continue only. It does not expand the separate pre-final provider-failure Retry lifecycle: before a schema-2 result is pinned, an already-failed operation's claim/diagnostic status reset remains a known separate recovery limitation. No additional live retry or repair for that path is authorized here. Committed replay/lost-response retry and existing schema-2 recovery remain covered.

Owner database/gameplay, both historical Iris failures, owner app/environment, main, Migrations 47/48 activation and deployment remain untouched. Owner review is required before any integration or activation.
