# DM tone 1 — the instructions give the DM room instead of orders

Owner, 2026-10-23 00:43, after the first emotions run: under a cold-control preamble («answer briefly, facts only, your
opinion is not needed») the model's answers shrink — much shorter, almost no address to the interlocutor — while its
correctness stays the same. The DM's instructions are a preamble too. Where they are written as orders, the DM plays
smaller: terser scenes, fewer people speaking to the hero, less of the DM's own judgement. Session 2's dry prose under the
English instructions may be partly this.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/dm-tone-1`** from `origin/claude/s3-candidate`. Nothing to `main`. Paid probes within **$8**, ledger
`docs/runs/dm-tone-1-ledger.md`; report `docs/runs/dm-tone-1-report.md`; talk to the owner in English, briefly.

## What to do
1. **Audit the register.** Read both roles (`roles.ts`, `roles-ru.ts`), the writer's and the bookkeeper's briefs, the tool
   descriptions the DM sees, the hidden-layer prep prompt and the region-prep prompt. Mark every sentence written as a
   cold order to the model about *how to be* («never», «do not», «briefly», «only», «you must») as opposed to a rule of
   the game (dice, records, what the player may see). Count them; list the worst twenty with file and line.
2. **Rewrite the frame, keep the rules.** Game rules stay exact and firm — honest dice, every roll told, the hidden layer
   never shown, records complete; those are not tone. What changes is the framing around them: who the DM is here, that
   its judgement is wanted, that it may be wrong and say so out of game, that length and voice are its call within the
   scene. Replace «do not X» with what is wanted where the meaning allows; keep a hard «never» only where a rule is a
   rule. Both languages. The owner's style preferences (no quips, finish the thought, no aphorisms) stay as they are —
   they are his taste, stated plainly, not orders about the DM's worth.
3. **Measure before and after** with the emotions stage's markers, no new design: on the known probe scenes (a companion
   talk, an objection, an interrogation, a search, a short fight) in «Opus пишет — Opus записывает», record per turn:
   words of narration, second-person forms per 100 words addressed to the hero by people in the scene, number of distinct
   speakers, hedges per 100 words in out-of-game notes, and — the thing that must not move — records completeness and
   the roll check. n = 5 per scene per version. Report the table; if the rewrite makes the DM longer without making the
   records worse, keep it; if records degrade, find which sentence did it and restore it as a rule.
4. **The owner's own fields.** «Что мне нравится в играх» and «Пожелания к приключению» reach the DM as the owner's words;
   confirm they are framed to the DM as a person's wishes, not as a specification. One sentence of framing if missing.

## Done when
Suite green, lint clean; the audit list, the diff of both roles, the before/after table and the money in the report;
the three Russian checklists untouched (no screen changes). The owner reads the new frame paragraph in both languages
before it is merged — it is the voice his DM will be raised in.
