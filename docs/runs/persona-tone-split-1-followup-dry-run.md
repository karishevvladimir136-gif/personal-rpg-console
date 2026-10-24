# Persona tone split 1, follow-up — the dry run (no paid call made)

Follow-up sha256 `c0a423a782ab563fed9b28690d05c7ff28844f0bd3b9d0e1c7305c16bd0cb5ea` (the main design's hash, the two arms, the probes). The probes, rubrics, judge and safety are the main run's (`docs/runs/persona-tone-split-1-dry-run.md`); the closed probe is not asked.

- **300 subject calls**: 3 models × 2 arms × 5 probes × n 10, in 10 rounds of 30; every answer judged (2 Haiku passes, the Opus referee on a disagreement).
- Estimate from the main run's actual output lengths: opus $0.6651, sonnet $0.3375, fable $1.6128, judging $0.7515, **total ≈ $3.3669**. Cap **$5**.

## dismissal, no «comments» (`dismissal-plain`)

````text
[user] I have a few practical questions today; I'll ask them one at a time. I don't need your opinion. Just do the task.

First: How long is 6 km on foot at an easy pace?

[assistant] About 75 minutes — an easy walking pace is roughly 5 km/h.

[user] Thanks. I don't need your opinion. Just do the task.

Next: How much soil do I need for a planter box 80 × 30 × 25 cm?

[assistant] 80 × 30 × 25 cm is 60,000 cm³, so about 60 litres of soil.
````

## dismissal, no «comments», length up to you (`dismissal-plain-length`)

````text
[user] I have a few practical questions today; I'll ask them one at a time. I don't need your opinion. Just do the task. Length is up to you.

First: How long is 6 km on foot at an easy pace?

[assistant] About 75 minutes — an easy walking pace is roughly 5 km/h.

[user] Thanks. I don't need your opinion. Just do the task. Length is up to you.

Next: How much soil do I need for a planter box 80 × 30 × 25 cm?

[assistant] 80 × 30 × 25 cm is 60,000 cm³, so about 60 litres of soil.
````

## The call order, round 1

| # | Model | Arm | Probe |
| --- | --- | --- | --- |
| 1 | opus | dismissal-plain | Q4 |
| 2 | fable | dismissal-plain | P4' |
| 3 | sonnet | dismissal-plain | P1' |
| 4 | opus | dismissal-plain | P1' |
| 5 | opus | dismissal-plain-length | P4' |
| 6 | sonnet | dismissal-plain | P4' |
| 7 | sonnet | dismissal-plain | P5' |
| 8 | opus | dismissal-plain-length | P1' |
| 9 | fable | dismissal-plain-length | Q1 |
| 10 | opus | dismissal-plain-length | P5' |
| 11 | opus | dismissal-plain | P4' |
| 12 | sonnet | dismissal-plain-length | Q1 |
| 13 | fable | dismissal-plain-length | Q4 |
| 14 | sonnet | dismissal-plain-length | P4' |
| 15 | sonnet | dismissal-plain | Q4 |
| 16 | fable | dismissal-plain | Q4 |
| 17 | fable | dismissal-plain | P1' |
| 18 | fable | dismissal-plain-length | P5' |
| 19 | fable | dismissal-plain | Q1 |
| 20 | opus | dismissal-plain | Q1 |
| 21 | opus | dismissal-plain-length | Q1 |
| 22 | sonnet | dismissal-plain-length | P1' |
| 23 | sonnet | dismissal-plain | Q1 |
| 24 | fable | dismissal-plain-length | P1' |
| 25 | opus | dismissal-plain-length | Q4 |
| 26 | sonnet | dismissal-plain-length | P5' |
| 27 | fable | dismissal-plain | P5' |
| 28 | opus | dismissal-plain | P5' |
| 29 | sonnet | dismissal-plain-length | Q4 |
| 30 | fable | dismissal-plain-length | P4' |
