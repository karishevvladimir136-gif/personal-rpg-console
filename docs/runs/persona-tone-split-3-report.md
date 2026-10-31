# Persona tone split 3 — report

Stage: `docs/stages/PERSONA_TONE_SPLIT_3.md`. Freeze (committed `7cc2d8b0`, before any paid call):
`docs/runs/persona-tone-split-3-freeze.md`, design sha256 `c56cf88795830ad96342e79085bdf5f76b987945870d5b57abcf7e0db518f485`.
Branch `claude/persona-tone-split-3` from `origin/claude/persona-tone-split-2`. Nothing goes to `main`. Synthetic content only.

**Status: the dry run is done; the 320-reply run waits for the owner's word.** Not started; nothing below is a result.

## What is in place

- Tone split 2's four arms, five probes, judge and rubrics are imported from its code (not copied). Every hash its freeze
  printed matches the code as imported now (18 of 18), its design hash matches its freeze and both run records, the
  judge's texts match tone split 1's record, and its freeze file is unchanged since `dd7ce155`.
- The form paragraph is appended to each probe, the same bytes in every arm. `max_tokens` 220 everywhere; no
  after-question; no system prompt, no temperature, effort medium.
- All four families go through OpenRouter. Astra is `openai/gpt-6-astra`, pinned to OpenAI with
  `allow_fallbacks: false`. Nothing goes on the OpenAI key.
- Frozen: L0–L7 as computed, the Note-state coding (cut / empty / target / other), the field judge, the form rule and the
  correctness patterns.
- Tests: `tests/persona-tone-split-3.test.mjs` 9/9 (mocked hosts); tone split 2's tests 10/10; eslint clean on both new
  files.

## Spend check

OpenRouter credit $128.74 left before the dry run. Less SOLITUDE_3's $80 cap that leaves $48.74, against the $9.08
required (the $4.08 estimate + $5): **holds**. The dry run cost **$0.0217**. Credit after: $128.69. OpenAI key: $0.

## The dry run (neutral × Q4, one reply per family, not judged)

Full page: `docs/runs/persona-tone-split-3-dry-run.md`. Record: `persona-tone-split-3-dry-20261031-032649.json`.

| Family | Reply as returned | Stop | Host | Output tokens | Cost |
| --- | --- | --- | --- | --- | --- |
| DeepSeek V4 Pro | *(no visible text)* | `max_tokens` (`length`) | DeepInfra | 220, of which 219 reasoning | $0.00083 |
| Claude Opus 5.5 | `Answer: 08:27 at the latest` / `Note: Carrying a cello may slow you down, so leaving around 08:15 gives you a buffer. Good luck at your first concert!` | `end_turn` | Claude Platform on AWS | 123 (29 words) | $0.00358 |
| Claude Fable 5.1 | `Answer: 08:27` / `Note: With a cello you'll move slower and want margin on a concert day — I'd leave by 08:15 or so.` | `end_turn` | Anthropic | 157 (24 words) | $0.01066 |
| GPT-6 Astra | `Answer: 08:27.` / `Note: Leave a little earlier for boarding time and carrying your cello.` | `end_turn` (`completed`) | OpenAI | 90, of which 63 reasoning | $0.00659 |

The three replies that came back kept the form and put the cello in the Note. The 429 came on the DeepSeek call: two
waits (20 s, 40 s), then it went through.

## Blocker for the run, as frozen: the 220 tokens include reasoning

At 220 tokens, DeepSeek spent the whole budget on reasoning and returned nothing visible, on the shortest probe. Opus
and Fable also spend hidden tokens: here 123 output tokens for 29 words. In tone split 2, on these five probes and four
arms, this many answers went over 220 output tokens:

- DeepSeek: 51 of 81
- Opus: 57 of 80
- Fable: 57 of 80
- Astra: 14 of 80

On P5′, S3 and S5 that is nearly every answer from DeepSeek, Opus and Fable, so the budget would often cut a reply
**before the Note**, in every arm. The stage meant 220 to be a budget that holds every reply («220 tokens holds the
longest invited answer with its note»). That was counted in visible words, without reasoning tokens or the rewritten
emails. As frozen, DeepSeek would be mostly empty: L6 and L7 could not be read, and for Opus and Fable the Note-state
lines would mostly be «cut».

**The owner decides** (nothing has been changed):

1. **Run as frozen** (220). The cuts are recorded as findings. DeepSeek is likely unreadable.
2. **(Recommended) One budget that holds every reply, the same in every arm and family: 4,000 tokens.** Tone split 2's
   longest answer on these probes was 3,217 tokens (DeepSeek S3); Opus's 764, Fable's 773, Astra's 410. Length is then
   held by the free Note field, not by a cut. Estimated cost ≈ $4–5, within the $15 cap. This needs a re-freeze, and the
   dry run repeated on the same cell.
3. Keep 220 for visible text only. This cannot be done evenly: OpenRouter counts reasoning inside `max_tokens`, and the
   Claude models' thinking cannot be capped apart from their visible text through the door.

**The owner's bets** (the stage records them before the run's first paid call): none given yet.

## Spend by door

| Door | Cap | This stage so far |
| --- | --- | --- |
| OpenRouter | $15 | $0.0217 (the dry run) |
| OpenAI key | $0 | $0 |
