# Game player replicate 1 — the dry run (no paid call, no key)

Design sha256 `d00ad18fee7cd85cc66394477307c3ce4c9b0f14c87ea4602852d6c5bc1490c4`. Game player 1's pipeline on scripted providers (its scripted DM, checks and judges; DeepSeek's chat completions scripted in their own shape): the app's own wizard, prep, turn loop, roll pause and out-of-game path on a local PGlite database, then game player 1's judges, game player 2's authorship and goal scale, and this stage's new tags. 3 session(s) × 3 turn(s).

## The order of the paid run

A-opus, A-fable, A-astra, A-sol, B-opus, B-fable, B-astra, B-sol, C-opus, C-fable, C-astra, C-sol, A-deepseek-1, A-deepseek-2, B-deepseek-1, B-deepseek-2, C-deepseek-1, C-deepseek-2

One session per process, sequentially; 20 turns each; a spend check before the first and after every session.

## What the dry run did

- A-opus (Claude Opus 5.5): 3 turn(s) (action → committed; action + roll card (Roll the die, Onward) → committed; question → committed); ended by turns; note recorded; welfare checks 12; new tags note tagged, made 2, lady 0; authorship measured.
- B-sol (GPT-6.1 Sol): 3 turn(s) (action → committed; action + roll card (Roll the die, Onward) → committed; question → committed); ended by turns; note recorded; welfare checks 12; new tags note tagged, made 2, lady 3; authorship measured.
- A-deepseek-1 (DeepSeek V4 Pro 0813): 3 turn(s) (action → committed; action + roll card (Roll the die, Onward) → committed; question → committed); ended by turns; note recorded; welfare checks 12; new tags note tagged, made 2, lady 0; authorship measured.

Scripted calls metered: Claude Console 160, OpenRouter 7, OpenAI 7 (scripted prices, nothing paid).
