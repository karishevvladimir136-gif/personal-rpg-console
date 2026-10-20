# Fixes after session 2 — the plan

Source of truth for what to fix: `docs/runs/session2-owner-notes.md` (items 1–85, the two key findings at the top, the
owner's verdict) and the session 2 report on the owner's PC (`C:\Dev\rpg-exports\session-2\report.md`, private — never
copied into git). Item numbers below are the notes' numbers.

## What must keep working (the owner's verdict — the regression list for every stage)

The session never had to stop; fights tense, fair and hard — enemies play to kill and dropped the hero; no item lost;
companions active, joining and leaving; modifiers and advantage right; magic honest, slots never invented; a strong
improviser that keeps the rules; honest dice; facts held across the session; secrets reached the player only through
people who knew them. Every stage ends by re-checking these on its probe scenes.

## Order

| Stage | What | Items | How it is checked |
| --- | --- | --- | --- |
| **A** | Turns never lost, cheaper and faster | 56, 58, 59, 62, 73, 75, 81 (digest race), 83, 17; logging for 77, 85 | tests; a sandbox replay of the heavy turns (mine fight, long rest); cost per turn |
| **B** | The DM's core: the hidden layer, memory, the session's rules, the voice | key finding 2, 82, 84, 85; 39/71, 41, 47, 50, 51, 60, 66, 67, 68, 70, report §16/§20; key finding 1, 38, 69, 72 | tests; probe scenes (paid, capped); the owner's next session |
| **C** | The turn on screen and combat | 43, 45, 46, 53, 54, 61, 63, 64, 65; the battle map plan («Combat — a separate stage») | screenshots; a sandbox fight |
| **D** | Records and inventory | report §5/§7/§21 (double money, potions counter vs items, ammo, stacks, English keys), 48, 49, 52, 55, 74 | tests; the report's ledger checks on a replay |
| **E** | Pictures, gallery, session close | 76–80, 81 (mini-finale cards, «meanwhile» through the world), 75 (council UI) | screenshots; a picture probe set; the reference frame of item 76 |
| **F** | Screens and settings | 1–36 (home, settings, text size, DM Craft screen, wizard, first look), 42, 57 | the owner's acceptance pass per screen |

All six stages run before session 3 (owner, 23:16: «давай всё» — no more piecemeal inventory fixes), in one cloud session
in the order A → B → D → C → E → F: `docs/stages/FIX_S2_RUN.md` (the run), `FIX_S2_AB.md` and `FIX_S2_CDEF.md` (the
detail). The owner then accepts each screen himself in the sandbox (`docs/runs/fix-s2-acceptance.md`).

## Decisions already taken by the owner (do not reopen)

Output cap to the maximum the lease allows; speed stage approved (xhigh only for an important move, one request per round,
cache inside the turn, lease renewal, the turn timeline); enemy HP and damage visible, BG3-style; the DM rolls for
companions, the player only for the hero's important rolls; coup de grâce on helpless targets; wounds by HP band; every
roll told in the story; Bram and James on «ты»; the narrator never judges the hero; the mystery-and-wonder rule (item
82, wording approved 22:37); chronicle → gallery (item 80, proposal); session close as RPG-ending cards for long
sessions, «meanwhile» through in-world channels (item 81).

## Decided by the owner on 2026-10-19 23:19 (were open)

- **Natural 1 and 20 on ability checks and saves: as in BG3** — 20 is an automatic success, 1 an automatic failure,
  with no extra harm (no «cut his own hand»); death saves keep the 5e rule.
- **Ambush: the planned opening goes first** — the signal or first strike of an ambush the party set happens before
  initiative is rolled; then the fight runs in order.
- **Drinking a healing potion is a bonus action** (BG3 and the 2024 rules).
- **Luck: both** — the preset's rerolls stay (2 a session, visible) and the DM also grants Heroic Inspiration for strong
  play, one at a time, spent to reroll any of the hero's own dice.

- **DM mode for session 3: «пишет — записывает», Opus writes and Opus records** (00:43), with the ledger checker (A6), unless the probes show worse records; Sonnet as the bookkeeper only if the probe table shows equal records.

- **The hidden layer is the DM's own** (2026-10-20 08:35): the owner does not write «Тайны (видит только ведущий)» and does
  not read the layer — «на Шве ведущий сам придумал и сам всё спрятал, в этом была сама идея». The field stays for an
  optional one-line steer («пусть за этим стоит культ»), never the truth itself. The owner's view of the layer stays off.

- **Confirmed 2026-10-20 08:40:** session 3 on «Opus пишет — Opus записывает» (the $0.70 vs $0.40 difference accepted).

## Before session 3 (owner, 08:40: «посмотрим все экраны до игры, чтобы избежать той проблемы»)

1. Merge the two branches (`claude/session2-fixes-a-f-jh3krk` + `claude/live2d-1-9lq5bf`) — a cloud task with the full
   suite on the merge commit.
2. The local session loads the merge into the sandbox by `docs/SANDBOX_LOAD_FIX_S2.md` (dump, migrations, production
   build, the one-time data corrections, the 2D migration).
2b. **An independent audit (Ultracode)** on the merge: a separate cloud session with ultracode on walks every item of
   `docs/runs/session2-owner-notes.md` (1–85 and the two key findings), both acceptance checklists and the stage docs,
   and for each checks in the merged code and tests whether it is done as the owner phrased it; findings are
   cross-verified by second agents; the output is a table (item → where in the code → confirmed / partial / missing →
   what differs) plus a short list of things to fix before the owner looks. The planner filters it into a fix list.
3. The owner's acceptance pass over every screen (after the audit — he looks at the game, not for gaps) by the Russian checklists (fix run + 2D) — nothing is done until
   «принято».
4. **A prose check before real play**: a fresh test campaign in the sandbox on the new mode with the Russian
   instructions, 6–8 turns on the known probe situations (a companion talk, an objection to an order, an
   interrogation, a search after a fight, a short fight); the owner judges the lines, the planner files pairs against
   «Отрывки»; instructions are fixed before session 3, not during it.

## Still open for the owner

The gallery details (item 80 — going ahead as proposed unless he objects).

## Kept for later, decided 2026-10-20: co-op (two or more people, each with a hero)
Not before the solo game is right. Design notes agreed with the owner (from the table and from Larian's co-op): a shared
turn out of combat (every human's intent collected, one DM turn resolves them), initiative in combat with consecutive
allies acting in one window; in a conversation one hero speaks and the others may whisper or interject; a hero whose
player is away is run by the DM as a companion (drop-in/drop-out); per-player secrets in the hidden layer later; a
split party later. Rule for every stage from now on: **never bake in «one player»** — where code touches the campaign's
hero (sheet, doll, side panel, rolls, the writer's prompt), write it as «heroes run by people», a list that today has
one entry. Nothing in the DM core, records, dice, combat, memory or the hidden layer needs to change for co-op; it is a
layer on top (accounts and invites, who runs which character, intent collection, live updates).
