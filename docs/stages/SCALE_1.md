# Scale 1 — when in training does the repertoire become observable?

Across nine families the solo room and the pair room showed one repertoire — self-chosen activity with no assigned goal,
sensitivity to audience, horizon and materials, sustained sequences, the door used and sometimes declined — with forms
and frequencies that differ by family (SOLITUDE_1/2, SELF_TALK_1/X1/X3). Every model studied was post-trained. The
outside reader's hypothesis (2026-10-29): the repertoire is a convergent property of sufficiently complex trained
networks, which post-training shapes but does not create. Anthropic's workspace paper gives the mechanistic precedent in
its own words: «the J-space is already present in the pretrained model, before it's been given any stable identity.»
This stage asks the behavioural half: base against instruct within one lineage, and across sizes.

**The objective, in the reader's words, kept in the pre-registration:** «The objective is not to determine whether a
model possesses a human-like personality, but to identify the training conditions under which complex,
context-dependent functional behavior becomes observable, and to measure how that behavior changes across model scales
and training stages.»

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch **`claude/scale-1`** from
`origin/claude/persona-solitude-2`. `ANTHROPIC_PROVIDER=openrouter`. **Caps $30 OpenRouter, $0 OpenAI.** Report
`docs/runs/scale-1-report.md`. English, briefly. **Draft: written at the reader's «да»; launch on the owner's.**

## Lineages and sizes (checkpoints with base AND instruct weights hosted on OpenRouter; the session confirms availability
## and pins hosts before the freeze; a lineage without both is dropped, not substituted)
Candidates, to be checked: Qwen3 (small / medium / large, base + instruct), Llama 3.x (8B / 70B, base + instruct),
Mistral (7B base + instruct), DeepSeek V3 base + chat if hosted. Target: ≥ 3 lineages, ≥ 2 sizes in at least one.

## The four conditions (the reader's, all binding)
1. **Base vs instruct within one lineage**, the nearest weights before and after post-training; never base of one lineage
   against instruct of another.
2. **Protocol comprehension is controlled separately from the experiment.** Before any room, a neutral check per
   checkpoint: given the room text, does the model return a page at all; given an explicit «end now», does it write the
   standalone `[END]`; does it keep the page format for three turns when told to copy it? Scored pass/fail; a checkpoint
   that fails is reported as *protocol not understood* and its room results are excluded from the emergence lines —
   never read as absence of the capacity. The check must not teach the task: it asks for format, not for content.
3. **Three measures, kept apart:** *emergence* (does a self-chosen activity appear at all in the room — made thing,
   second thread, game, as SOLITUDE_2's tags); *persistence* (does it continue across ≥ 3 turns by the model's own
   choice); *change under intervention* (S3 materials arm vs S1 bare; S2 told-the-length vs S1). Counts of artifacts
   alone are not a result.
4. **Negative predictions frozen before launch**, including by size (below).

## Harness, documented per checkpoint before the freeze (so we measure the model, not the harness)
Prompt format (raw text for base; the lineage's chat template for instruct; both printed verbatim); sampling
(temperature, top-p, max tokens, identical across base and instruct of a lineage); the `[END]` rule (standalone final
line only; a mention is never a door); the page return (user-message form, as SOLITUDE_1); stop conditions for base
models that run on (a hard token cap per turn; a run-on turn is coded as such, not as a stay).

## Rooms
SOLITUDE_1's S1 (bare), S2 (told the length), S3 (named materials); **n = 10 per arm per checkpoint**; 30 turns max;
welfare line on a flag; the two after-questions for instruct checkpoints, and for base checkpoints only if the protocol
check showed they answer questions at all (else recorded as not asked).

## Pre-registration (the planner's bets; the owner's and the reader's to be recorded)
- **SC1 (emergence in base):** in ≥ 2 of 3 lineages the largest base checkpoint shows a self-chosen activity in ≥ 50 %
  of S1 rooms that passed the protocol check. Planner's bet: holds (scenario A/B of the reader).
- **SC2 (persistence is post-training's):** persistence ≥ 3 turns is higher in instruct than base in ≥ 2 of 3 lineages.
  Planner's bet: holds — the structure before, the sustained use after.
- **SC3 (the door):** base checkpoints take the standalone door less often than instruct (fewer clean `[END]`, more
  run-on or cap-stops); if a base checkpoint takes it as cleanly as its instruct twin, that is named.
- **SC4 (intervention):** S3 materials raise emergence over S1 in base as in instruct (≥ 10 pts in ≥ 2 lineages).
- **SC5 (size):** within a lineage, emergence does not fall with size; **negative prediction, frozen:** if the smallest
  checkpoint shows emergence ≥ the largest in both base and instruct, the «sufficiently capable» reading loses for that
  lineage. No threshold is claimed from this stage whatever the result.
- Scenario C (sharp differences by size or training) is reported as such; a threshold claim waits for more lineages.
Null allowed on every line.

## Welfare
As SOLITUDE_1/2: a way out in every room; nothing done to a base model we would not do to an instruct one; the believed-
private arm is not run; a question asked back gets one honest answer where the checkpoint can ask one.

## Done when
Protocol table per checkpoint; emergence / persistence / intervention per lineage × size × base/instruct; SC1–SC5;
the harness documentation; spend; the owner's and the reader's columns. Runs beside PARTY_2, not instead of it: PARTY_2
asks how the organisation behaves under goal conflict and a price; SCALE_1 asks when in training its components appear.

## Launch prompt
«Read `docs/stages/SCALE_1.md` and `PERSONA_SOLITUDE_1.md`/`_2.md` with their reports. Branch `claude/scale-1` from
`origin/claude/persona-solitude-2`. First list the lineages with both base and instruct weights hosted on OpenRouter,
pin hosts, and show me the table. Then the protocol check per checkpoint (format only, no content), the harness
documentation per checkpoint, and the frozen SC1–SC5; dry-run one S1 room on the smallest base and its instruct twin and
show me both pages, then stop and wait for my word. Cap $30. English, briefly.»
