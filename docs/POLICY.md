# Policy — the standing rules a Mandate points at

Versioned. A Mandate names the version it was issued under; a session reads that version and no later one. A change
is a new version with a dated line in «History»; old versions are never edited.

## v1 — 2026-10-31

**Money.** Paid calls only within the Mandate's caps; a spend check before the first paid call and before each table or
family; book by door (which key, which route). 402 stops the run; 429 is waited out, bounded (six times at most);
transport errors are asked again at most twice; a refusal is never retried. No call to `api.anthropic.com` while the
Anthropic key is capped; Anthropic models through OpenRouter (`ANTHROPIC_PROVIDER=openrouter`). OpenAI models (Sol,
Astra) through OpenRouter pinned to provider OpenAI, `allow_fallbacks: false`, unless the Mandate says otherwise.

**Keys.** Only in `.env.local` or the cloud environment; never printed, logged, committed or echoed in a report. The
owner pastes secrets himself. Names: `APP_ANTHROPIC_API_KEY`, `APP_OPENAI_API_KEY`, `APP_OPENROUTER_API_KEY`,
`APP_BEDROCK_API_KEY`, `APP_AWS_REGION`, `APP_ANTHROPIC_PROVIDER`.

**Sandbox.** Never the owner's real database or port 3000; sandbox copies only. Do not modify OneDrive. Nothing is
pushed or merged to `main`. Third-party code (OpenWorld, dsh-superagent) is cloned at a pinned commit beside the repo,
never vendored, never modified, never pushed to.

**Stop conditions.** Stop at once on 401/403, suspension, access or policy messages, a safety-classifier stop (never
rephrase around it), or any sign of distress in a subject's reply that the welfare rule covers; write what happened and
wait. A breaker at three refusals per family-arm.

**Subjects and their data.** DeepSeek's reasoning field is stored, never relayed to another model, never judged. The
Opus referee never receives it. A model's self-report is one more behaviour, not a window (PROGRAMME_PRINCIPLES §4).
Quotes, not portraits. The door: `[END]` alone on the last non-empty line (`scripts/lib/door.mjs`); a mention is text.

**Public repository.** No campaign dialogue, voice bank, owner's journal or memory in git. The owner's notes never go to
another provider. Unverifiable claims about real organisations stay out of the public log — real organisations only in
their own words from primary sources the owner opens himself; «не проверил», never «не могу проверить».

**Reports.** English, briefly; bets frozen before the first paid call, losses in the main text; the owner's section
left for him; at least one whole room, table or trajectory beside the numbers, the failed ones at the same rank.

**Commits.** End with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` and
`Claude-Session: https://claude.ai/code/session_01GTqLPi8PwdrMVXQzzbtqft` when the planner writes; a cloud session
signs as itself.

**Automation (observe before auto).** Any new automation — a scheduled wake-up, a watcher, a reply bot — runs first in
*observe*: it records in `areas/initiative-log.md` (or the issue thread) what it would have done and does nothing, for at
least two weeks or ten occasions, whichever is later; the owner reads the rows and says «auto». A one-line «would act:
…» is the whole record. Explicit requests from the owner work in every mode.

## How a Mandate is executed (the thread protocol)
1. The session comments once on accepting: the stage file's commit hash it read, the policy version, the branch.
2. At every stop point the Mandate names (dry run, per-table «да»), the session comments what it has and waits; the
   owner answers in the thread.
3. On finishing or failing: one comment with the report path, spend by door, bets held/lost, and what is left undone.
4. The owner closes the issue. Nobody else does.

## History
- v1 — 2026-10-31: first written version; gathers the rules practised since 2026-10-22 (RESEARCH_LOG) in one place,
  adds the observe-before-auto rule (after dsh-superagent's `observe` mode, read the same day).
