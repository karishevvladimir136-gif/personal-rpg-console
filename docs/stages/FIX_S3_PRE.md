# Fixes before session 3 — on the candidate, after the audit

Cloud session (`docs/CLOUD.md`, environment `rpg-console`), **Opus 5.5**. Branch **`claude/s3-candidate`** itself (commit
on it; it is the branch the sandbox and the deploy will take). Nothing to `main`. Paid probes within **$15**, ledger
`docs/runs/fix-s3-pre-ledger.md`. Report in English `docs/runs/fix-s3-pre-report.md`; talk to the owner in English,
briefly. Every item ends with a test; the stage ends with the full suite green on a clean worktree, typecheck,
zero-warning lint, the production build, and the three acceptance checklists updated where a path changed.

## Part 1 — the two gaps the merge found (`docs/runs/merge-s2-report.md`, checks 1 and 2)

### 1. In «пишет — записывает» the writer's attacks go through the server
Today the writer has one dice tool, `roll`, so in a fight its attacks bypass `combat attack` and the rules module
(cover's AC, crits, resistances, the point-blank rule, conditions' advantage/disadvantage) never applies; the writer
added cover by hand (correctly, but its attack bonus drifted +5/+4). Owner's decision stands: session 3 runs on this
mode and the combat must be as honest as the single DM's. Do: give the writer an attack path that the server resolves —
either `combat attack` in the writer's toolset while a fight is open (the bookkeeper keeps the rest of `combat`), or an
`attack` shape inside `roll` (attacker, target, weapon/spell, the server fills the modifiers from the sheet and the
battlefield and applies the rules), whichever keeps the writer's prompt small and the ledger consistent. The card shows
every applied rule as in the single DM. The writer's instructions (Russian and English) say: in a fight, attacks go
through this path, never a bare d20. Probe: the ford and the lair in session 3's mode — 0 bare attack rolls, the rules
visibly applied, records complete, cost and seconds per turn unchanged within noise.

### 2. The «every roll told» check sees attacks and declared actions
`roll-check.ts` reads only `roll` receipts. Do: (a) `combat attack` cards count as visible rolls; (b) a **declared-action
check**: the player's line names an attack / spell / check the fiction allows → the turn must contain its roll or card,
or an out-of-game sentence saying why not (the rule «the hero's will is the player's»); a miss → one continuation asking
for it; (c) an outcome told only by implication (a companion's line, a receipt) does not count as told for the hero's own
decisive roll — the check wants the event in the narration. Tests from the merge report's ford turns 1, 3, 4 and the 2D
session's original finding (three turns narrated around declared attacks).

## Part 2 — the audit's «Fix before the owner looks» (`docs/runs/audit-s3-report.md`, filled in by the planner)
<!-- the planner pastes the filtered list here with item numbers, the audit's evidence lines and the smallest fix -->

## Part 3 — small things already known
- English in player-visible text found so far: the enemy card's `concentrating`, `+10 ft` on the battle map (units
  «фт»), any counter key still Latin on a chip — sweep with the audit's F list.
- The battle map's painted top-down background: confirm a live fight draws it (the synthetic preview shows a dark grid
  only); if the live path does not request it, wire it as `LIVE2D_1.md` Part 2 says.
- The hidden layer's prep on the owner's existing campaign runs once on the next session start (B1); confirm it is
  armed for «Приключения начинаются» after the sandbox load and never shown.

## Done when
Probes green, suite green, the report lists each item with its test and the money; `docs/SANDBOX_LOAD_FIX_S2.md`
re-checked against the candidate's final migration list; `DEV_STATUS.md` top section updated.
