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

Preserve ordinary-play authority:
- Astra is the DM; structured state is authoritative, not exhaustive.
- Missing records do not block plausible, non-contradictory mundane fiction. Do not add one subsystem per fictional verb, NPC, place or object.
- Use the closed six-family generic state contract for new durable consequences and existing deterministic mechanics internally. Narration-only is valid.
- Current pinned input, selected public context and pinned DM adjudication may establish ordinary facts, acceptance and completion. Source handles identify evidence, not semantic proof. `basis:null` is bounded adjudication, not arbitrary write authority.
- Resolve named payers explicitly; Quest claims use stored issuer/terms. Authoritatively absent balances differ from explicit zero. Never infer untracked funds from prompt omission or failed reads.
- Reject invalid optional operations/groups and dependent consequence prose while preserving valid independent narration. Never turn failed mechanics into narrated success.
- Keep recorded dice, balances, ownership, active rules, corrections, exact-once atomic commits, timeline/revision fences and private/public generation boundaries. Private-informed public text must use exact public evidence; do not launder private prose through record fields.
- Preserve old operation/save contracts and frozen historical World authority. Do not add arbitrary model writes, a second ledger, agent or backend.

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

## Development status

Maintain `DEV_STATUS.md` in the repository root.

Update it before every milestone-completion commit and after any major architectural change.

Include the current milestone, current status, completed work, files/areas changed, tests and build status, key technical decisions, known issues, remaining work, and recommended next step.

Report actual verification results and distinguish implementation completion from owner approval. Never include secrets, API keys, credentials, or DM-private content.

## Development-agent model policy

Use **GPT-6 Sol** by default for coding-agent work. Prefer Sol `xhigh` for Lead/integration, architecture, authority boundaries and difficult implementation; use Sol `high` for routine implementation, UI, tests and documentation. Escalate only a specific, unresolved material blocker to GPT-6 Astra after focused investigation. State the exact blocker, use a bounded Astra review if available, and return its result to the existing Sol Lead; do not restart or duplicate an entire sprint with Astra. This is an **agent staffing policy**, not a change to the application's `OPENAI_DM_MODEL`, provider registry or production reasoning configuration.

## Efficiency Protocol v2

- Give workers compact context packets with exact branch, task boundary, owned files, invariants and relevant prior decisions.
- Reuse an already-contextualized worker for follow-up in its area; spawn only a distinct non-overlapping critical-path task.
- Inspect and integrate diffs before rereading complete worktrees. Avoid duplicate research and repo-wide reviews.
- Run focused tests while iterating. Freeze the production candidate, then run one fresh complete integrated suite plus required typecheck, zero-warning lint and build; repeat only if a subsequent change or failure justifies it.
- Use `xhigh` where difficult architecture or correctness warrants it and `high` for routine bounded work. Passing worker checks never replace integrated verification, privacy review or owner acceptance.
- For a documentation-only consolidation, use one agent and focused documentation checks; do not create an implementation sprint or run application tests merely to edit docs.
