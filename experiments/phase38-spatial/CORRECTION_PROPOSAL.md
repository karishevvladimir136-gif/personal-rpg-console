# Phase 3.8B — proposed world-metadata correction

September 19, 2026. Experiment-only; no live continuation authorized. Recovery evidence was committed and pushed separately as `98eb76618503dd2382ef97aaabfcb1377cab26e1` on `codex/phase38-spatial-evidence`. This correction is on `codex/phase38-metadata-correction`, based on that evidence. The execution checkout stays at `2f8f82edb5d5f3c960d45922b71c543e99208192`.

## Proven cause and contract comparison

Both authorized GETs returned HTTP 200. World `82a0e059-50a4-41a4-8565-5e516ffadc0e` remains retrievable. The world body hash exactly equals the original stopped response. Replaying the original pure validator fails at **`stale_prompt`**, the canonical equality of returned and submitted `world_prompt` objects. This proves the exact rejected assertion; it does not prove which text/extra-field difference occurred because raw prompts were deliberately not retained.

Current official sources, checked September 19:

- [Quickstart](https://docs.worldlabs.ai/api): returned prompts may be recaptioned; operation snapshots can have empty/null descriptive fields. Exact prompt echo is therefore not a supported identity guarantee.
- [Get Operation](https://docs.worldlabs.ai/api/reference/operations/get): completed operation response identifies the generated world. Operation identity and successful completion remain mandatory. Settled cost is separate from world validation.
- [Get World](https://docs.worldlabs.ai/api/reference/worlds/get): required world ID/name/locator and optional nullable model, time, permission and assets. Unknown model is not an invented match; unknown privacy cannot authorize asset use. A non-null prompt, when present in these text-only jobs, must retain the supported text shape.

## Exact correction

1. Pure `worldFence` binds the frozen job, durable submitted input hash (including unchanged prompt, seed, options), endpoint/model pin, receipt operation ID, successful operation and returned world ID. Conflicting operation metadata/world aliases, extra attempts, fallback and reported model mismatches fail.
2. Pure `inspectWorldMetadata` checks the current flat Get World shape against that fence. Returned text can differ; retain only prompt hash and echo-match boolean. Name equality is descriptive, not identity. Missing/null documented model or time stays unknown; a supplied stale/malformed time or conflicting model still fails. Required identity and hosted locator stay strict. Snapshot nulls are not treated as a fully populated world or fabricated provenance. An omitted optional full-world prompt is unknown; an explicitly malformed/null full-world prompt is not silently accepted as a text object.
3. `worldOutput` still requires proven private status, required usable asset metadata, valid scale, unchanged exact URL allowlisting and existing binary validators. Metadata inspection does not approve/download assets. Missing permission/assets is a valid metadata observation but a stop for output use.
4. Future runner records safe operation/world/submission identity before world validation. Results retain the actual reported model or null. Internal validation exceptions use a fixed safe-code allowlist, including URL/JSON/output failures. Arbitrary provider messages/errors are never written as stop reasons. Existing stop/review/billing/reservation behavior remains.

No migration, production runtime, application UI, root dependency/configuration, prompts, seeds, options, model/endpoint, price, count, budget or URL host changes. Protocol canonical SHA-256 remains `496360cc4171778eb153009ff4fe445d8ef75b08ab9aa0c4e884452e21c3bacb`. A new freeze manifest pins the corrected experiment source/tests/instructions only; it does not revise the approved original execution freeze.

## Offline verification and boundaries

- **141 deterministic tests passed**, zero failures/skips: original 91 plus 50 correction cases. Implicit network fetch is disabled. All submission/download calls in these tests are synthetic transport mocks.
- Experiment typecheck, ESLint (zero warnings), and isolated TypeScript emit/build passed. Production suite/build was not repeated for an isolated experiment change; historical preparation results remain in `PREPARATION_RESULTS.md`.
- Regression coverage includes the observed structural shape with substituted synthetic text/URLs, nullable provenance, wrong/malformed/stale worlds, operation/request/input/model fencing, privacy/output barriers, URL refusal, specific safe stop reasons, no next request/retry after stop, preserved reservations, and secret-free error evidence.
- The real raw provider bodies and signed URLs were not retained. The corrected parser has therefore **not** been replayed over the full real body. The original parser was replayed in memory during the authorized GET and the exact failing assertion was retained. Shape fixtures are explicitly synthetic, not fabricated live evidence.
- All real observed asset URLs also failed the frozen URL policy. The sanitizer retained URL hashes/presence and failure booleans, not the exact failed URL predicate or hostname. The two permitted GETs are exhausted. This correction does not claim to resolve that separate barrier or change the allowlist.
- No asset bytes were downloaded. File formats, sizes, content hashes, visual quality, colliders, navigability and panorama reuse/sharing remain unverified. Present URL fields are not proof of usable assets.
- Original stopped journal, witness, identity, anchor, signed-free evidence and original frozen checkout are unchanged. There is no stop-clearing, ledger-reset, replacement-run, resume or recovery-execution command in this change. No production/campaign state was accessed or changed.

## Remaining work and recommendation

Stop for owner review of these two separate checkpoints. The existing world is a candidate for reuse without regeneration, not an accepted experiment result. Any further URL-only diagnosis, asset inspection or continuation needs an explicitly bounded authorization. Do not regenerate `spatial-room-1`, initialize another run, clear its stop, proceed to courtyard/fal or interpret this as EXPLORE acceptance.

This task made exactly **2 authenticated GETs**, **0 generations**, **0 asset downloads**, **0 exports**, **0 fal calls**, **0 retries**. Correction development made no additional provider calls. Prior room billing remains **1,580 credits / $1.264** and its full **$1.30 reservation** remains retained. No new generation charge is asserted.
