# Personal RPG Console — rules for Claude Code

Private single-user home app for long AI-DM role-playing campaigns. Not a SaaS.
The owner is non-technical: **always work and report to the owner in English**, in plain words —
what changed, how to check it, what is next. Code, comments and commit messages are in English.
Stage task files may be written in Russian; treat them as the spec.

## Current initiative

DM rebuild, described in `docs/REBUILD_PLAN.md`. Work strictly **one stage at a time**.
Never start the next stage until the owner writes «дальше» (or an equivalent explicit go-ahead).
Each stage has its own task file (`STAGE_N.md`) handed to you by the owner.

Product hierarchy that must keep working: App → World → Campaign → Adventure/Arc → Session → Scene.
Any world and any campaign created in the app must play on the new turn loop.
Rules of any RPG system are knowledge (World Library sources or model knowledge), not code.

## Design principles

1. **The model is the DM; the server guards data integrity, not plausibility.**
2. **Tools for state, text for story.** State changes happen through validated tool calls;
   narration is free text streamed to the player.
3. **Reject one call, not the turn.** A rejected tool call returns a reason to the model.
   Whole-turn failure only for owner/fence/revision/lease violations or broken transport.
4. **Keep what already works:** durable begin with the literal input, operation IDs, leases,
   atomic commit, exact-once rewards, server-side dice with receipts, saves/timelines/fences,
   Memory, DM Craft, Character Models, owner corrections as the highest authority.
5. Logic lives once, in TypeScript. SQL applies changes atomically and enforces invariants
   (non-negative quantities and balances, HP bounds, one reward claim, unique operation IDs).
   Do not re-implement game logic in PL/pgSQL.

## Hard rules

- Never put secrets in code, commits, logs, test fixtures or chat. Keys live in `.env.local`
  (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`); provider keys are server-only.
- Never touch the owner's database (the running local Supabase with real campaigns) unless the
  stage task says so **and** the owner confirms a fresh full dump exists. Tests use disposable
  PGlite databases only.
- HTTP tests and acceptance scripts must never reach the owner's app on `127.0.0.1:3000`. They run only
  with an explicit `PREVIEW_URL` pointing at an isolated server without `.env.local` (otherwise they are
  skipped); port 3000 is refused unless `RPG_TEST_ALLOW_OWNER_PORT=1` is set (`tests/preview-target.mjs`).
- Never edit or delete already-applied migrations. New migrations are additive.
- Never delete or rewrite historical turns, saves, scenes, Canon or document versions.
- No paid model/media calls unless the stage task allows them and states a budget.
  Report every paid call's token usage and cost. Stop when the budget is reached.
- Do not touch FRAME, VIDEO or World Lab code unless the stage requires it.
- Do not add new agents, classifiers, registries or "handle" types beyond what the plan names.
- Ask the owner before any destructive or irreversible action.

## Workflow

- Base branch: `claude/rebuild-base` (created in stage 0 from `65dc99c`).
  Each stage: branch `claude/stage-N-<short-name>` from the previous accepted stage.
- While iterating, run focused tests. Before saying a stage is done, run on the final code:
  `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`. Report real results, including failures.
- Commit in small logical steps. Do not merge to `main` and do not push to `main`.
- Finish every stage with a short owner report in English (what changed, what to click/try,
  known limits, what the next stage is) and update the top section of `DEV_STATUS.md`.

## Commands

```sh
pnpm install
pnpm typecheck
pnpm lint
pnpm test              # node --test tests/*.test.mjs
pnpm build
```
Owner startup on Windows: `Start RPG Console.cmd` (uses existing local Supabase volumes).

## Map of the current turn path

`src/components/gameplay-composer.tsx` → `src/lib/server/gameplay-service.ts` →
`src/lib/gameplay/astra-primary.ts` (turn loop, validation) → `astra-plan-context.ts` /
`astra-plan-schema.ts` (prompt and response schema) → `src/lib/server/dm/astra-primary-provider.ts`
→ `src/lib/server/dm/provider.ts` (OpenAI Responses transport) → `src/lib/gameplay/dm-store.ts`
→ `public.rpg_runtime(...)` in `supabase/migrations`.

Related: `astra-capabilities.ts`, `astra-settlement.ts`, `astra-ordered-effects.ts`,
`astra-privacy-context.ts`, `dm-context.ts`, `src/lib/memory/*`, `character-model.ts`,
`src/lib/dm-craft/*`, `src/lib/model-runtime/*`.

Useful test helpers: `tests/universal-bootstrap-fixture.mjs`, `tests/astra-freedom-fixture.mjs`
(creates a bootstrapped campaign on PGlite), `test-fixtures/mega-dm/*` (48 synthetic scenes,
character and afterglow probes).
