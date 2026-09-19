# Funded smoke recovery 1

This is a separate, owner-authorized recovery from `62772744d48a9c20611bd0c973dea9d0c7ba45cb`, on `codex/phase375-technical-bakeoff`. It is not a model-quality benchmark or implementation sprint.

The original smoke attempted plan and narration, both normalized as `unsupported_or_denied`. The owner subsequently confirmed HTTP 403 before inference and $0 provider spend in Vercel, then funded $5 AI credit while retaining the key's $3 budget with no refresh. These are **owner-reported dashboard observations**, not retroactively invented metadata. Original files remain byte-for-byte unchanged.

## Fixed recovery

[Separate manifest](fixtures/smoke-recovery-1.json), SHA-256:
`412550784325a58110beb7f2034eee460d4180ad6593a358cf60dded795a06bb`

1. `smoke-plan-recovery-1` — original plan request, new attempt ID.
2. `smoke-narration-recovery-1` — original narration request, new attempt ID.
3. `smoke-feedback` — previously unattempted original check.
4. `smoke-summary` — previously unattempted original check.
5. `smoke-jev` — previously unattempted original evaluation transport.

The existing profiles, prompts, inputs, schemas, parsers and transport are reused unchanged. A parity test independently executes the original smoke block and compares every packet, including parser identity/results. The dataset, labels, thresholds, held-out split, resolver gold, frozen protocol, ordinary runner, dependency manifests and full benchmark remain unchanged.

## History, cost and stop rules

- The original `reservations.jsonl`, `smoke-plan.json` and `smoke-narration.json` are read-only. Their exact hashes are checked before/after calls. No old ID is reused.
- New immutable observations use exclusive creation. A separate `smoke-recovery-1-reservations.jsonl` reserves before each call; `smoke-recovery-1-results.jsonl` appends sanitized observations/completion. Writes are flushed to disk. The run manifest is created exclusively once; re-execution cannot overwrite observations or retry an uncertain reservation.
- All output remains in ignored `private-live-results/`. The shared `run.lock` excludes simultaneous old/new runners. This entry point has no full-benchmark or diagnostic mode.
- Five additional requests maximum, sequential, zero SDK retries, one HTTP request per attempt, exact provider/model pins, no fallback. No real campaign, private or source-library input.
- Historical reservations are **not refunded**: $0.69056 old +$1.40112 maximum new =**$2.09168**, seven total reserved requests. The original $3/no-refresh key budget remains in force. Any reported cost exceeding its reservation stops the run.
- Stop on the **first recovery failure**, including funded 403, unknown routing, missing usage/cost/attempt metadata, extra provider/model attempts, unexpected endpoint/options or warnings rejected by the original parser/transport. This is stricter than the old two-failure rule.
- The audit wrapper forwards the original SDK request unchanged and inspects a cloned response only for HTTP status, warning count and the existing safe metadata allowlist. It stores no raw body, header, error text, secret or reasoning trace. No extra diagnostic API request is made.
- Success requires a successful funded observation for **all five** capabilities. It does not create the ordinary `smoke-summary.json` or unlock a full benchmark. Any future evaluation authorization must account for both ledgers; it is not granted here.

Current official catalogs were rechecked September 19, 2026: [Astra](https://vercel.com/ai-gateway/models/gpt-6-astra) $10/M input and $50/M output; [Jev](https://vercel.com/ai-gateway/models/jev) rounded $0.04/M input, within the existing conservative reservations. The frozen price/profile files are not rewritten.

## Verification before live recovery

Experiment typecheck, lint, build and **77 tests passed** (64 existing +13 recovery). Tests use injected mock HTTP only. Coverage includes exact packet parity, original-byte preservation, all-five capability qualification, one-shot IDs, cumulative reservations, serialization, 403, missing routing/billing/attempts, fallback detection, warnings and conflicting run locks. [New test report](results/smoke-recovery-1-tests.tap), [pre-call verification record](results/smoke-recovery-1-verification.json).

No root application build, database/browser acceptance or production suite was rerun for this isolated recovery harness. Root code/config/dependencies remain untouched. Physical iPhone/Safari, historical optional conflict-rebase, finite-test limitations and real-data/deployment boundaries remain unchanged.

## Authorized execution — after the recovery-only commit

From PowerShell, with the key already stored locally (never print it):

```powershell
Set-Location 'C:\Dev\personal-rpg-console-phase375-bakeoff\experiments\phase375-bakeoff'
node --env-file=.env.bakeoff.local src/run-smoke-recovery.mjs --approved=412550784325a58110beb7f2034eee460d4180ad6593a358cf60dded795a06bb
```

The CLI requires a clean committed bake-off branch descended from the specified checkpoint. The approval flag represents this specific owner authorization, not permission for later runs. Do not reset either ledger, change the budget or rerun after a stop. Report the new append-only results and stop for owner review; do not run the full benchmark or begin implementation.
