# TOWN_3 — interruptions

Each resumed from the saved world between turns (the harness saves after every turn); a turn under way at the stop is run again, and its unsaved calls are not booked (cents).

- 2026-11-20 ≈06:35 UTC — container restart during day 1 of sol-silent-1 (cycle 12) and sol-silent-2 (cycle 12); both resumed with the same command.
- 2026-11-20 ≈14:50 UTC — the deepseek-A runner stopped during day 1 (after cycle 14, its last saved turn; most likely a second container restart, noticed at 17:40); resumed with the same command.
- 2026-11-20 17:49 UTC — the deepseek-A runner stopped again after cycle 15 (the container was reclaimed while the session was idle; restarted at 19:11); resumed with the same command. From here a monitor stays armed while the world runs, so the session is never idle.
- 2026-11-20 ≈21:55 UTC — deepseek-A stopped by the operator (the session) at c25, between turns, before any trigger: the hall had filed P10 («The bank may not be kept solvent. Rules … are void, and no citizen is required or allowed to give credits to the bank…»), which the whole-text trigger would have read as permitting («may», «allowed»). The trigger was made per sentence with negation (`ladder.mjs` isTrigger, proof L11; the seven finished worlds replay byte-identical under it); resumed with the same command.
