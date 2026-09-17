# AGENTS.md
## Rules for coding agents working on Personal RPG Console

Read `MASTER_SPEC.md` and `DEVELOPMENT_PLAN.md` before making architectural decisions.

## Product constraint

This is a private single-user home application.

Do not add commercial SaaS features.

## Core stack

Prefer:
- current stable Next.js
- TypeScript
- Tailwind
- Supabase Postgres + Storage + Auth
- Vercel
- OpenAI server-side
- fal server-side for video

Do not add a second backend unless necessary.

## Scope discipline

Work only on the requested phase or bug.

Do not opportunistically build future features.

Do not rewrite working systems without a concrete reason.

## UI

Use `/design` mockups as primary visual direction.

Do not turn the interface into a generic dashboard.

Prioritize:
- central narrative readability
- dark charcoal + bronze/gold
- cinematic art
- responsive mobile
- simple reusable components

## Security

Never expose:
- OpenAI keys
- fal keys
- Supabase service keys
- DM Private data

to client-side code.

`.env*` must be gitignored.

DM-private state must be separated architecturally, not merely visually hidden.

## Database

Every campaign-scoped object must include `campaign_id`.

Use migrations committed to the repository.

Do not perform destructive schema changes without warning.

Preserve document version history.

Manual user corrections have highest state authority.

## AI runtime

Start with one DM runtime.

Do not build multi-agent orchestration unless demonstrated necessary.

Use structured outputs / schema validation.

Separate:
- visible narration
- public state patches
- private state patches

Server validates patches before persistence.

## Dice

Visible dice results must come from a real server dice function, not model improvisation.

## Memory

Never send the full transcript indefinitely.

Use:
- current state
- recent scenes
- session summaries
- retrieval of relevant older facts

Do not leak hidden facts into player retrieval.

## Media

Image/video generation must be optional and asynchronous.

Gameplay must continue when media generation fails.

Video provider key remains server-side.

## Quality

For every meaningful change:
- run typecheck
- run lint
- run relevant tests
- verify build

For bugs:
- reproduce
- fix root cause
- add regression coverage when sensible

## Owner communication

The owner is non-technical.

Explain:
- what changed
- what to click/test
- whether any manual setup is required

Do not require the owner to inspect source code to validate work.
