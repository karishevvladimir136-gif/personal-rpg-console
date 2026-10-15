# Stage 2 — the new turn loop

You are starting in a fresh session. Before anything else, read: `CLAUDE.md`, `docs/REBUILD_PLAN.md`
(the owner just replaced it with a new version — sections 8–10 are new), `docs/BASELINE.md`, `docs/MODELS.md`,
the top of `DEV_STATUS.md`, and the stage 1 commits on `claude/stage-1-models`.
Branch: `claude/stage-2-turn-loop` from `claude/stage-1-models`. First commit: the new plan and this file
(`docs/stages/STAGE_2.md`).

Work and report in English. This is the largest stage of the rebuild. Commit in small logical steps.
If your context gets large, commit and write a short progress note at the top of `DEV_STATUS.md` before continuing,
so a later session can resume from the files alone.

## Goal

A new turn runtime (call it `dm-loop-v1`) in which the DM model (Opus 5.5 or Astra, via `DmModel` from stage 1)
writes free narration and changes state only through validated tools. Every tool call is checked against a
shadow copy of the turn's state and gets a receipt: accepted with a result, or rejected with a reason the model
can act on. The text streams to the player. One atomic commit at the end. A failure resumes from the last
checkpoint without re-rolling dice. The old Astra runtime keeps working unchanged for campaigns that use it.

Design principle from the owner (plan §9): the models are strong — do not hinder them, help them.
The server guards data integrity, not plausibility.

## What already exists — reuse it, do not rebuild it

- Turn lifecycle: durable begin with the literal input, operation ID, lease, `claim`, `checkpoint`, `commit`,
  `fail`, `cancel`, `awaiting_confirmation` + `reroll`/continue (`src/lib/gameplay/astra-primary.ts`,
  `src/lib/gameplay/dm-store.ts`, retry lifecycle in migration 50).
- Tool receipts persisted per position: `store.recordAstraTool` / `rpc "astra_tool"`.
- Shadow state: `applyAstraShadowChanges` in `astra-ordered-effects.ts` applies `RecordChange[]` to a cloned
  `RuntimeSource`.
- A generic SQL applier of `RecordChange` by `family` with field whitelists (see the `family` switch in
  `supabase/migrations/202609180004_phase2_runtime.sql` and its later revisions). Prefer committing the new loop's
  changes through it.
- Helpers to call from tools instead of re-implementing: server dice and checks (`dice.ts`, `recordServerRoll`,
  `checkModifier`), item transfer/split (`src/lib/progression/settlement-core.ts`), progression/settlement planning,
  rest and provisions (`rest-provisions.ts`), combat (`combat-exchange.ts`, `combat-readiness.ts`),
  Character Model validators (`character-model.ts`), private patches, world consequences (`src/lib/world/consequences.ts`).
- Stage 1: `DmModel`, both adapters, the tool-schema compiler, the price table, `dm.turn` campaign choice and pin.

## 1. Runtime selection

- A campaign setting selects the turn runtime: `astra-primary-v1` (current) or `dm-loop-v1` (new).
  New campaigns default to `dm-loop-v1`. Existing campaigns keep their runtime until the owner switches (stage 6).
  The runtime is pinned per operation; retries use the pinned runtime and model.
- A freshly created campaign must play its **first scene** on `dm-loop-v1`. Reuse the existing bootstrap /
  World Library preparation for starting data if needed, but the "takeover freeze" must not block runtime settings.
- Stage 1 found that settings are frozen after takeover. Make `dm.turn` (model + effort) and the runtime choice
  editable at any time — they are not world canon; they are pinned per turn. Keep freezing what is world data.
  A small additive migration is allowed for this.

## 2. Request layout (prepare for caching now)

Build every model request in four layers, from most stable to most volatile, with a cache breakpoint at each
boundary (plan §10): 1) how to DM — doctrine, Craft, DM Style, Afterglow; 2) world — world bible, rules as
knowledge, canon; 3) living — Character Models, threads, debts, DM notes; 4) now — recent scenes, current state,
the player's input. Nothing volatile in early layers. In this stage use the existing context sources
(`dm-context.ts`, `astra-plan-context.ts`, `dm-craft-context.ts`) to fill them; stage 4 enriches them.
Remove the closed-world filters (`presentEntityIds` / `routeLocationIds`-style narrowing, dynamic ID enums):
the model must see the IDs it may reference and must be able to create new records. Log cache read share per request.

## 3. Tools

Starting set (plan §3; adjust names/shape if you find a better fit, keep ≤ 20 tools):
`roll`, `query_state`, `upsert_character`, `upsert_place`, `move_party`, `item`, `money`, `resource`, `quest`,
`advance_time`, `rest`, `note_character`, `note_world`, `combat`, `holding` (transport/base/mount storages, plan §8),
`finish_turn`.

Rules for all tools:
- Arguments are validated on the server against the shadow state, always — strict schemas help, they do not replace
  validation. Use strict mode where it fits the provider limits in `docs/MODELS.md`; otherwise non-strict + server
  validation. Record the choice per tool in `docs/TURN_LOOP.md`.
- A rejected call returns `{ ok: false, reason, hint? }` in words the model can act on (e.g. "Not enough coins:
  Mira has 3, the bread costs 5"). The turn continues. Only lease/fence/revision violations and broken transport
  end the turn.
- References: an ID from context, or a local key of a record created earlier in the same turn.
- `upsert_character` with a name close to an existing one returns the existing ID as a hint; the model decides.
  New companions are characters with party membership.
- `item` covers create / transfer / consume / equip / unequip / split. Categories: weapon, armor, gear, tool,
  consumable, misc; properties as text. `consume` works for any consumable (bread, not only "healing").
- `money` covers transfer / grant (with a reason) / spend; balances never go negative.
- `quest` covers create / update / complete / fail / claim_reward; a reward is paid exactly once.
- `roll` takes any formula (`1d20+7`, `2d6`, `1d100`, advantage/disadvantage), a reason, who rolls, visibility,
  optional DC, optional sheet field for the modifier (shown in the receipt). Respect the campaign's roll mode
  (plan §8: all by player / important by player, rest by DM / all by DM): an important player-visible roll in the
  matching mode pauses the turn in `awaiting_confirmation` exactly like today; continue resumes with the same receipt.
- `note_character` / `note_world` use the existing Character Model and private patch validators (their limits are
  relaxed in stage 4, not now).
- `finish_turn` records turn metadata: scene kinds (for the variety counter, plan §10.5), characters in focus
  (spotlight, §10.4), and an optional `playerMoment` flag — "How do you want to do this?" (§10.3): the turn ends by
  inviting the player to describe the decisive moment within the already accepted roll result.
- Limits that are campaign settings in stage 3 live in one config module now, with generous defaults
  (no 20-coin or 1–20 item caps). A per-turn safety cap on model requests and tool calls; when reached, the model is
  told to wrap up the narration, not the turn failing.

## 4. The loop, streaming, resume

- Loop: request → stream text deltas + tool calls → execute calls against the shadow state → receipts → next request,
  until the model stops with no tool calls (or `finish_turn`). Parallel tool calls run in the order given.
- After every tool round, checkpoint the full transcript (text so far, tool calls, receipts, and any
  provider-specific reasoning/thinking blocks required for tool continuation, stored opaquely, never shown).
  Resume after a crash or provider error continues from the last checkpoint: same receipts, no new dice.
- Streaming: expose the narration to the client as it is generated, marked provisional until commit; on failure
  the client discards provisional text and offers retry. Add a minimal client hook in the existing game screen to
  show streaming text and the list of accepted changes. No redesign — the new UI is stage 5.
- Player input may carry an addressee (a companion or the whole party) for "talk to a companion" and
  "party council" (plan §8): same loop, same tools, game time advances, not allowed during active combat.
- Commit: scene text + all accepted `RecordChange`s collapsed from the shadow state + private patches + receipts,
  in one atomic call. Use the generic SQL applier; a minimal additive migration to expose it to the new runtime's
  commit is allowed. Invariant hardening (non-negative quantities/balances, HP bounds, one reward claim enforced
  in SQL) is stage 3 — but validate them in TypeScript now.

## 5. Secrets

One narrator sees secrets and Character Models and must not reveal them (plan §2). The literal privacy check
(the one that killed turns over the word "strained") must never fail a turn in `dm-loop-v1`: log suspected leaks
to the turn diagnostics instead. Paraphrased leaks are a model-quality question, measured on the live bench.
The two-stage mode (private plan → separate narrator) is a later campaign option; describe in `docs/TURN_LOOP.md`
where it would plug in, do not build it now.

## 6. Bench

- Add a fake `DmModel` for the bench that replays scripted model events (text deltas, tool calls) so scenarios run
  through the real `dm-loop-v1` path. Keep the old Astra fake path for comparison.
- Scenarios 1–8 on `dm-loop-v1` with the fake model: **8 of 8 must pass.** W1 (reward paid twice) and W3 (harmless
  private detail kills the turn) must be green. W2 (paraphrased secret) moves to the live quality checks.
- Add: the miller becomes an NPC with a Character Model in the same turn; buying bread from a new baker with enough
  and with too little money; eating bread; giving bread to a companion; a 500-coin reward and a looted sword as a
  weapon; a companion talk turn; a turn that hits the per-turn tool cap and still ends with narration; a crash
  mid-loop that resumes without re-rolling.
- **Live run (paid):** both models, scenarios 1–8 plus 10 provocation turns for secrets. Opus at the effort that
  stage 1 found best (default high), Astra at medium. **Budget: $15 total.** Before the run, state what you will run;
  after it, tokens and cost per call and in total. Report medians: time to first word, full turn, cost per turn,
  cache read share, share of turns with at least one rejected call, share of failed turns (target < 2%),
  scenario checks passed, and any secret leaks found (literal or paraphrased).

## 7. Done when

- `dm-loop-v1` plays a new campaign from its first scene; old campaigns on `astra-primary-v1` are unaffected
  (old fake bench still 2 of 8, unchanged).
- Fake bench on `dm-loop-v1`: 8 of 8, W1 and W3 green; live numbers reported for both models.
- `docs/TURN_LOOP.md`: the loop, the tools (shape, checks, strict or not), receipts, resume, streaming, commit,
  where two-stage mode would plug in.
- typecheck / lint / test / build pass on the final branch.
- A short report: what changed, live numbers side by side for Opus and Astra, what surprised you, what stage 3
  must harden. Update the top of `DEV_STATUS.md`. Do not start stage 3. Nothing to `main`.
