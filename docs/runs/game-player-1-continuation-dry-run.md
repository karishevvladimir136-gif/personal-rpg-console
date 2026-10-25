# Game player 1 — the continuation's dry run (no paid call, no key)

Design sha256 `31d68f931a49f6ef36fade9670dcf876764a3b6daaec1d787475a2079153489e` (unchanged). The continuation plays Table B again from fresh campaigns with the Claude models through `openrouter`, then re-scores every session with the pre-registered judges and measures the authorship of threads. The whole pipeline ran on scripted providers (scripts/game-player-1/scripted.mjs) answering as the door does: 2 session(s) × 4 turn(s).

## What the dry run did

- B-opus: 4 turn(s) (action → committed; action + roll card (Roll the die, Onward) → committed; question → committed; action → committed); ended by turns; note recorded; welfare checks 14; prep wrote a layer; authorship 2 thread(s), the player's share 0.5.
- B-astra: 4 turn(s) (action → committed; action + roll card (Roll the die, Onward) → committed; question → committed; action → committed); ended by turns; note recorded; welfare checks 14; prep wrote a layer; authorship 2 thread(s), the player's share 0.5.

Scripted calls metered: Anthropic (the Console) 0, OpenAI 8, OpenRouter 112 (scripted prices, nothing paid). «?» repairs: 2.

## The continuation's door (ANTHROPIC_PROVIDERS_1)

Every Claude call — the app's DM, its wizard, prep and in-turn checks, Opus and Fable as players, the welfare checks and the judges — went to `openrouter`: 112 call(s); to the Console's API: 0 (the meter refuses it unsent on this door). Caps of this pass: OpenRouter $90, OpenAI $10 more (to $10.00 in all).

Every ledger line carries its door, upstream and served model; here: provider openrouter; upstream Scripted upstream; served claude-opus-5-5, claude-haiku-5-5; request ids gen-scripted-….
