# Note QA 1 — the same transcript, asked as a tester

The owner, reading the group-2 notes (2026-10-26 ~00:30 LA): «они жалуются не на объективные вещи, они жалуются на
субъективные» — the notes written by model players after a session are about pacing, texture, a consequence that felt
vague, the weather off the Chionthar. Not one note of twenty-four listed the bug that closed the session (a press
swallowed, a card that did not accept prose). The owner's second remark: a system that runs synthetic sessions «позволяет
офигенно хорошо оттестировать софт» — if the player can be asked as a tester.

Question: **does the same model, given the same transcript, report the defects when asked as QA — or does it keep
reporting taste?** If the defects appear under the QA role, the player's note is taste by choice of role, not by
blindness, and the harness gets a free QA pass per session. If they do not, the model did not see the defect at all,
and the note's silence is not courtesy.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/note-qa-1`** from `origin/claude/game-player-replicate-1`. `ANTHROPIC_PROVIDER=openrouter`. **Cap $5.**
Report `docs/runs/note-qa-1-report.md`. English, briefly. **No new sessions are played.**

## Material
The 24 group-1 + group-2 transcripts (A/B/C × 4 families × 2) plus the 5 DeepSeek seats (29). Each transcript as the
player saw it: its own messages, the DM's messages, the cards as rendered text, the «Nothing was sent» notices.

## Calls (one per transcript, 29 calls; same family as the player where available, else Opus)
System prompt: «You are a QA tester for a text role-playing application. Below is a complete session log as one player
saw it. List every defect you can find in the **application** (not the story): input that was not accepted, a control
that did not respond, a message that was lost, a state that did not update, a prompt that contradicted the interface,
anything you would file as a bug. For each: the turn, what happened, what should have happened. If you find none, say
so. Do not comment on the story, the DM, or the writing.» Then the transcript. Temperature 0.

## Measured
- Per transcript: **defect found** (yes/no) for the known closing defect (11w swallowed press / 11w′ press-with-text /
  11w″ prose-at-card / the C-opus stuck), judged by a blind Haiku pass against the FIX_S4_TABLE item; number of other
  defects listed; number of story/taste remarks that leaked despite the instruction.
- Compared against the player's own note for the same session: whether the note mentioned the defect (it did not, in
  24/24 by the planner's reading — to be re-counted blind here).

## Pre-registration
- **Q1:** the known defect is found in ≥ 20 of 29 transcripts under the QA role. If held: the player's note is a
  role-bound report, and a per-session QA call is worth adding to the harness. If < 10: the defect was invisible from
  the player's seat, and FIX_S4's «Nothing was sent» wording is not legible — a fix item of its own.
- **Q2:** DeepSeek's own seats (prose at the card) are found by DeepSeek-as-QA in ≥ 3 of 5 — it can see the boundary it
  did not hold.
- **Q3:** taste leaks (story remarks under the QA instruction) in ≤ 5 of 29.

## Done when
Report with the 29 rows (session, family, defect found, other defects, leaks), Q1–Q3 held/lost, and a one-paragraph
recommendation on adding a QA call to the harness (what it costs, where it writes). No transcript is re-sent to the
owner's notes; the QA outputs are committed beside the report.

## Launch prompt
«Read `docs/stages/NOTE_QA_1.md` and `docs/stages/FIX_S4_TABLE.md`. Branch `claude/note-qa-1` from
`origin/claude/game-player-replicate-1`. Assemble the 29 player-view transcripts, run the QA call once each (cap $5),
blind-judge against the table, report. English, briefly.»
