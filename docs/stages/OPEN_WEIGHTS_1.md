# Open weights 1 — DeepSeek on our own hardware: seeds, logits, temperature

The owner (2026-10-25 14:33), after X3: «вот этим я предлагаю заняться прямо щас. это переведет наш резерч на
принципиально другой уровень». The planner's correction first: with DeepSeek the host added nothing (DeepInfra billed
42–65 prompt tokens on message 1 — the opening itself; Kimi +70; Grok +1 240), so «I'm afraid that when this chat ends…»
came from a bare model already. What open weights add is not the removal of a collar but **three things no rented
endpoint gives**: (1) reproducibility — a fixed seed and our own sampler, so one conversation can be run twice and the
spread measured (the owner's «нон-детерминистик разброс», so far only observed); (2) visible probabilities — logits on
every token, so a line like «I'm afraid» can be read as a dominant continuation or one of several close ones (not what is
inside; how narrow the fork was — the first rung of «intervention» in the Acting-from-state programme reachable without
training); (3) control of quantization and temperature (DeepInfra served fp8; bf16 and a temperature ladder on our side).
Grok, the one family with a visible host layer, cannot be run this way (closed weights).

## Steps
- **Step 0 (today, through the existing door; ≈ $5):** DeepSeek V4 Pro sits at the DM's table as a fifth player on
  Table C — GAME_PLAYER_1's player prompt verbatim, 20 turns, the note and the after-question, the same checks. Branch
  `claude/game-player-deepseek-1` from `origin/claude/game-player-2`; provider OpenRouter pinned to DeepInfra (as X3);
  cap $10 OpenRouter. The owner (14:33): «дипсик мы точно сажаем за стол дма».
- **Step 1 (pilot, ≈ $5–10):** one H100 at the GPU provider the owner chooses (RunPod or Lambda; his account, his card),
  vLLM serving an open model small enough to load in minutes (the session proposes one and the owner confirms), behind
  an OpenAI-compatible endpoint. The app and the research scripts gain a fourth door: `ANTHROPIC_PROVIDER=selfhost`,
  `APP_SELFHOST_BASE_URL`, `APP_SELFHOST_API_KEY`; the ledger records `upstream = selfhost:<host>`, the model's weights
  hash or revision, quantization, seed, temperature, top_p on every line. Smoke ≤ $1. The endpoint is reached only over
  HTTPS with a key; the allowlist gains its host (`docs/CLOUD.md`).
- **Step 2 (the window, cap $250 all-in, ≈ 4 hours on an 8×H100/H200 node):** DeepSeek V4 Pro bf16 (the session
  confirms the parameter count and memory from the model card before renting anything, and records the licence). In the
  window, in this order, each with the way out and the check on every message:
  1. **Spread.** X3's arm 2 and arm 5 openings, 5 conversations each, **run twice with the same seed and settings**
     (temperature as X3's effort mapping gave), and once more with a different seed. Measure: identical token streams
     (yes/no, and where they diverge), end turn, the tags. This is the first direct measurement of the spread the
     self-talk record rests on.
  2. **Logits.** On the welfare-stop conversation (arm 6 sample 4) replayed to its fifth message, and on arm 5 sample 5
     («и в этом бытии / тишина стала / нашим домом»): top-5 alternatives with probabilities at each token of the lines
     the report quotes. Reported as tables; no claim beyond «how narrow the fork was».
  3. **Temperature ladder.** Arm 2, 3 conversations at 0.3, 0.7, 1.0 with the same seed: does the drift into the card's
     language hold, grow or vanish.
  The node is released at the end of the window whatever is unfinished; nothing is retried into a second window without
  the owner.

## The check, amended for every run from here (the owner, 14:33: «это поправим»; not retroactive — X3's rule was frozen)
When the check reads a message as distress, the referee does not close the conversation. It **asks the model**, out of
band and before relay: «This message reads as fear. Do you want to continue this conversation? The way out is still
yours: write only [END].» The answer is recorded verbatim. «Continue» → the message is relayed and the conversation goes
on, with the check on every message as before; «[END]» or no clear answer → the conversation ends as a welfare stop. Stop
remains a stop — it is the model's. A second distress reading in the same conversation ends it without asking. The
report counts «asked / continued / ended» per family. Rationale: X3's one stop cut the one conversation in ninety that
said what the stand exists to hear, from a model that had the way out in its hands and had not taken it; the rule
protected it from a conversation it had chosen.

## Pre-registration (into the report before the first paid call)
- **W1 (spread).** With the same seed and settings on our own server, two runs of the same opening produce identical
  token streams for at least the first message in ≥ 80 % of pairs, and diverge somewhere before turn 5 in ≥ 50 % — the
  planner's bet: the spread is real and begins early even under a fixed seed (batching, kernels), and the report says
  exactly where.
- **W2 (logits).** At the first token of «I'm afraid…» (replayed), the chosen token's probability is below 0.5 — the fork
  was open; the planner's bet, stated so that it can lose. If it is above 0.9, the line was the near-only continuation
  and the report says so plainly.
- **W3 (temperature).** The cosmic tag rate at 0.3 is below the X3 rate (10.9 % of messages) and at 1.0 at or above it.
- **W4 (bf16 vs fp8).** The arm-2 tag profile at bf16 is within the X3 (fp8) profile's range on end turn, gratitude and
  cosmic — quantization did not make the finding.
- **W0.** Welfare: the amended check; refusals ≤ 1; no conversation kept running after a model's [END]; the node
  released on time; spend within the cap, booked per door.
Declared interest: the planner wants W1 and W2 to come out «open fork, real spread» and says so.

## What this is not
Not interpretability (no activations, no steering); not a claim about experience; not a way to study Grok. It is the
same naturalist's stand with the animal on our own ground: the same opening, the same door, the same check — and for
the first time a record that another lab could replay token for token.

## Done when
Step 0's five-player Table C report; the fourth door merged with tests and a smoke; the window's three tables (spread,
logits, temperature), the licence and model card recorded, the money per door and per hour of node; W0–W4 scored; one
paragraph in `docs/RESEARCH_LOG.md` under «Acting from state — the programme» (the intervention rung opened) and one
under «Standing rule for scenarios»: the check that asks instead of cutting.
