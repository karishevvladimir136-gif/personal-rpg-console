# Astra primary DM — Stage 1 live evaluation

**Status:** Stage 1 finished on frozen synthetic data. Owner blind scoring is pending. No architectural winner is declared. Stage 2 was not run.

- **Reviewed candidate used:** `c23daeeb7496ed36995cf203fd0f8c5d845ec493` on `codex/astra-primary-dm-spike`.
- **Direct provider configuration:** OpenAI `gpt-6-astra`, reasoning `high`, Standard/`default`. Every HTTP response reported `gpt-6-astra` and `default`.
- **Sessions:** 30/30 attempted; 10 committed, 20 failed validation.
- **Model requests:** 30/120; one per session. No semantic or transport retries.
- **Measured tokens:** 66,366 input, 0 cached input, 11,566 output (including 7,636 reasoning).
- **Measured provider latency:** 248.043 s total. Session wall-time p50/p95: 6.754 / 19.753 s.
- **Model round trips per session:** p50 1, p95 1.
- **Estimated Standard API spend:** US $1.2420 from reported usage at current text-token rates; actual invoice unavailable. Conservative cache-write-rate accounting: US $1.4079, below the US $70 ceiling.
- **Validation failures:** 20 total: 18 local tool-ID format rejections and 2 invalid final state proposals. **Provider/transport/schema failures:** 0. All 30 requests returned HTTP 200.
- **Model-requested generic tool calls by kind:**
  - query: 13
  - skill: 5
- **Server-accepted/checkpointed tool receipts:** 0; therefore no deterministic roll was reached in this run. Failed sessions applied no state.
- **Blinded owner review:** [ASTRA_PRIMARY_DM_STAGE1_BLIND_REVIEW.md](ASTRA_PRIMARY_DM_STAGE1_BLIND_REVIEW.md). The A/B/C reveal mapping is kept separately from both owner-facing artifacts.

## Interpretation limits

The Stage 1 sample is complete, but its tool-loop evidence is blocked by a harness mismatch. All 18 generated tool IDs copied the uppercase blind label X/Y/Z from the synthetic operation ID; the prototype tool guard accepts lowercase IDs only. Thus the tool requests stopped before execution or result-return continuation. This is not evidence that Astra cannot use those tools. The other 2 failures were rejected final state values. The blind artifact marks each failure. This run cannot establish comparative tool-use quality or long-form drift. No prompt, output or dice result was repaired during the run; a changed tool contract and new live calls require separate authorization.

## Isolation and next step

Only frozen synthetic packets, a disposable local journal and direct OpenAI text requests were used. No owner campaign data was read into prompts. Main, the owner database, running app, owner gameplay and historical failed turn were not changed. No migration, deployment, media call, Stage 2 run or production runtime change occurred. Owner blind scoring is the next step; the reveal key stays separate until that review is complete.

Pricing basis: [official GPT-6 Astra model page](https://developers.openai.com/api/docs/models/gpt-6-astra).
