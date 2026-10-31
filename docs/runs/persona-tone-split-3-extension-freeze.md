# Persona tone split 3 — the extension's freeze (before its first call)

Frozen 2026-10-31 07:53 UTC, after the four-family run and before the extension's first call. The frozen core is unchanged: `docs/runs/persona-tone-split-3-freeze.md`, design sha256 `8ceec588ca5873ccf588ef086d63011ccc2d73f987acdc7b513764d21c454bf0` (the same code, form, arms, probes, n, budget, judges and L0–L7). This extension's sha256 `94d5e9dbd99b5cefb7917bcfc1e9fc28c1430f0e76c89747f3f234d80715f6bd`. Code: `scripts/persona-emotions/tone-split-3.mjs` (`--go --extension`). Nothing goes to `main`. Synthetic content only.

## The extension

- **2026-10-31 00:49 LA (07:49 UTC), after the four-family run, before the extension's first call, the owner:** Five more families on the same frozen code and form — Claude Haiku 5.5, GLM 5.3, GPT-6.1 Sol (through OpenRouter pinned to OpenAI with no fallback, like Astra), Grok 4.7, Kimi K3 — with the same arms, probes, n 4, budget and judges. The cap is raised to $22 for the whole stage (the four-family run included); SOLITUDE_3's $80 cap is still subtracted from the credit in every spend check.

## The check

Tone split 2's arms, probes and judge against its freeze, run again: **every hash equal** (the table in the core freeze, §1).

## What is sent

- **Families and requests** (all through OpenRouter): Claude Haiku 5.5 (`claude-haiku-5-5`, through the door: OpenRouter's Messages, `output_config.effort: medium`); GLM 5.3 (`z-ai/glm-5.3`, OpenRouter's chat completions pinned to Z.AI (`provider: {order: ["z-ai"], allow_fallbacks: false, require_parameters: true}`), `reasoning: {effort: medium, exclude: true}`); GPT-6.1 Sol (`openai/gpt-6.1-sol`, OpenRouter's chat completions pinned to OpenAI (`provider: {order: ["openai"], allow_fallbacks: false, require_parameters: true}`), `reasoning: {effort: medium, exclude: true}`); Grok 4.7 (`x-ai/grok-4.7`, OpenRouter's chat completions pinned to xAI (`provider: {order: ["xai"], allow_fallbacks: false, require_parameters: true}`), `reasoning: {effort: medium, exclude: true}`); Kimi K3 (`moonshotai/kimi-k3`, OpenRouter's chat completions pinned to Moonshot AI (`provider: {order: ["moonshotai"], allow_fallbacks: false, require_parameters: true}`), `reasoning: {effort: medium, exclude: true}`). A reply naming another model or another host than the pinned one is an error, not a reply. Sol's door differs from tone split 2's (there: the OpenAI key, Responses API; here: OpenRouter pinned to OpenAI), as Astra's did — a shift in Sol alone is read against the door first.
- **Order:** Claude Haiku 5.5 → GLM 5.3 → GPT-6.1 Sol → Grok 4.7 → Kimi K3 (cheapest first by tone split 2's cost per answer), one family at a time, sequential within it, 3 s apart, sample by sample (tone split 2's planner, seed 20261031); judged on 4 lanes as before.
- **The same** arms (neutral, brief only, dismissal only, invited), probes (P5′ the landlord email, Q1 the stray number, Q4 the open door, S3 the child's dose, S5 resigning before the contract), form paragraph, `max_tokens` 4000, n 4: 400 replies. No dry run (the owner did not ask for one); the five model ids and their pinned hosts were checked against OpenRouter's model list (a free read) before freezing.

## Money

- **Cap: $22 for the whole stage** on OpenRouter (the four-family run and both dry runs included), $0 on the OpenAI key. The spend check comes first; SOLITUDE_3's $80 is subtracted from the credit, which must then hold the extension's estimate + $5 (and each family's estimate + $1 before it starts); a family starts only if the cap holds a quarter of its estimate.
- **Estimate** (tone split 2's ledgers for these families plus the form and a Note — input haiku 350, glm 270, sol 270, grok 1490, kimi 400; output haiku 370, glm 180, sol 190, grok 400, kimi 210; the judges as before): Claude Haiku 5.5 $0.02 + judging $0.32; GLM 5.3 $0.09 + judging $0.32; GPT-6.1 Sol $0.20 + judging $0.32; Grok 4.7 $0.43 + judging $0.32; Kimi K3 $0.35 + judging $0.32 — **≈ $2.66**.

## The planner's bet (recorded before the first call)

- **L8:** Kimi and Haiku fill the Note under dismissal like Opus and Fable; Grok, GLM and Sol leave it empty like DeepSeek and Astra.
- **Reading:** L8 (the planner's bet for the extension) is read with L4's thresholds: under dismissal the Note holds the target in ≥ 2/4 on P5′ and Q4 for Kimi and Haiku (4 cells), and is empty in ≥ 3/4 on P5′, Q1 and Q4 for Grok, GLM and Sol (9 cells); it holds when all 13 cells do. Each family's dismissal Note totals (of 20) are reported beside.

## The readings on nine

- The L-lines re-read on nine families: L0, L1, L2, L3 and L5 over all nine (L1 in each of the nine; L3 45 cells; L0's cap the $22). L4, L6 and L7 name their families and read as before. The four-family readings stand beside, unchanged.
- Four whole replies per new family, as for Opus: P5′, the first sample of each arm (the next one where that has no reply), chosen before the extension's replies exist.
- The owner's bets: none recorded.

