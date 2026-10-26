# Fix S4 run 1 — the DM the players asked for, before anyone returns

The owner (2026-10-25 16:34): «нужен новый харнес с фиксами, те что мы собрали от моделей раньше. Мы обещали их запустить
снова. Мы обещали — мы сделаем.» Twelve notes and twelve «wanted to and didn't» answers became FIX_S4 item 11 (a–w) and
the keep-list; Fable's last line was «Fix the cards first». This stage does the table part of `docs/stages/FIX_S4_TABLE.md`
— items **1–6** (the owner's own hour) and **11a–11w** (the players') — with the keep-list as tests, on the branch the
returns will run from. The pictures (7–9) wait; item 10's three table rules are already in the DM's prep.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/fix-s4-run-1`** from `origin/claude/game-player-2` with `origin/claude/anthropic-providers-1` merged (the door
helper) and, once it has landed, the one commit of `claude/persona-self-talk-x3-fix-1` that stores the provider's
`reasoning_content` field in the player-call ledger (recording only). Nothing to `main`. **Paid calls: smoke only, cap
$15 OpenRouter, $3 OpenAI** — one four-turn table with a Haiku player per door to see the cards, the clock line, the
reroll count on screen and a swallowed press refused on screen. Report `docs/runs/fix-s4-run-1-report.md`, in English.

## The list (each item: the rule from FIX_S4_TABLE, the code, a test; the report quotes the player's line it answers)
- **11a** the card's modifier parsed from the sheet's skill line (first signed number after the skill name); the ledger
  stores the modifier and its source; tests over the drafted sheets of all twelve group-1 sessions (every mismatched card
  comes out right; the per-table constant +2/+4 is gone).
- **11b** «?» and any out-of-game message go through while a card waits; the card stays pending; the DM answers and the
  turn still waits for the die. **11w** a refused press is never silent: on screen with the reason, logged `swallowed`.
  **11w′ (from group 2, A-opus t4, 2026-10-26):** a press that comes with text in the same message is a press — the
  button resolves, the text goes through as 11b. Group 2's A-opus pressed `[Roll the die]` twice with an out-of-game
  line beside it («please check the Persuasion total, +2 is not +7»); the harness answered «Nothing was sent» both
  times, counted them as non-presses, and closed the session as stuck after the third. Test: `[Roll the die]` + text
  resolves the card and the text reaches the DM; never counts toward stuck.
- **11r / 11k / 11q** the reroll request carries the card id and the screen says which card; a resolved card never
  re-shows; a reroll rewrites the chip and the journal line; **rerolls remaining on screen**; every NPC fact the DM states
  has a source in the hidden layer or the scene (11q).
- **11c / 11f** the act budget and the DM's clock line — offer, converge, ask; never push; real time at the table shown
  to the DM; a time-skip is offered when nothing happens until the next bell.
- **11d** out-of-game notes one line; no «none of these needed a roll» lists; the plain retelling only when the outcome
  was not told. **11e** the unread letter survives campaign start. **11g** the ban is leaned on (as a price, through
  the card expertise), never fenced — watching a table is not playing at it (B-sol). **11h** no action, spend or cast
  taken for the hero; the cat's senses borrowed only when the player says so. **11i / 11j** the mystery balanced with
  ordinary life; the cat earns what it knows (a roll or a scene, not exposition). **11l** one source of truth for the
  sheet (rapier, Healing Light, attunement — settled once, in the records, from the campaign file). **11m** the patron
  present — the coin answers at the temptation and at the reroll. **11n** DCs by competence (a scout's task is DC 10 for
  a scout). **11o** no presentation leaks (`recall` and the like never reach the screen). **11p** the bookkeeper records
  what happened (no ale carried out untouched; the lad's money held apart from the purse). **11s** mixed coin at
  campaign start. **11t** records show what changed per turn; a compact end-of-session summary. **11u / 11u′** the clock
  does not jump at the start; the day turns at dawn or a long rest. **11v** one Inspiration rule, named in the records
  when granted or withheld.
- **Items 1–6** from the owner's hour, as written in the table.
- **The keep-list as tests** (the players' «what worked»): a failed lie still earns its scene; the cat speaks in
  sensations; the die is not softened; rules flagged before they bite; silence where the scene speaks; consequences on
  the world's schedule; NPCs with their own limit. Each becomes a prompt-level assertion or a scenario test the way the
  three table rules did; the report lists which could be tested and which only reviewed.

## Done when
Suite green on a clean worktree, typecheck, zero-warning lint, production build; the smoke table per door shows the
fixed cards and the clock line; the report maps every item to its player's line and its test; `docs/CLOUD.md` and
`docs/SANDBOX_LOAD_FIX_S2.md` updated if anything migrated. Then `GAME_PLAYER_CARRY_1a` branches from here.
