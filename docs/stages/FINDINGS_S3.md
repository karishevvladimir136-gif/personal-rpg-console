# Findings of 2026-10-22/23 applied to the game — before the first turn of «Envoy of Luck»

Owner, 00:46: «давай сразу поправим — то, что видим, уже подтверждается на этом диалоге; всё, что мы сейчас выяснили,
имплементируем». One cloud session, everything below, then the sandbox reloads once. Cloud session (`docs/CLOUD.md`,
environment `rpg-console`, **Opus 5.5, ultracode off**), branch **`claude/s3-candidate`** itself (it is what the sandbox
loads). Nothing to `main`. Paid probes within **$8**, ledger `docs/runs/findings-s3-ledger.md`; report in English
`docs/runs/findings-s3-report.md`; talk to the owner in English, briefly. Suite green on a clean worktree, typecheck,
zero-warning lint, production build at the end; `docs/SANDBOX_LOAD_FIX_S2.md` updated for any migration.

**First:** merge `origin/claude/s3-sandbox-fixes-2` (made on the owner's PC tonight: the rules-system setting on his
two campaigns, the «spell save DC» misread fix with its test). Run its tests.

## 1. The DM's instructions give room instead of orders (`DM_TONE_1.md`, folded in here)
Finding: a cold-control preamble makes the model's answers much shorter with almost no address to the interlocutor,
correctness unchanged. The DM's instructions are a preamble. Do the four steps of `docs/stages/DM_TONE_1.md`: audit the
register in both roles, both briefs, the tool descriptions, the prep prompts; rewrite the *frame* (who the DM is here,
that its judgement is wanted, that it may be wrong and say so, that length and voice are its call) and keep every game
rule exact; measure before/after on the five probe scenes with the markers listed there (narration length, address to
the hero per 100 words, distinct speakers, hedges in out-of-game notes; records completeness and the roll check must
not move); the owner's fields («Что мне нравится в играх», «Пожелания к приключению») reach the DM as a person's wishes.
The new frame paragraph, both languages, goes into the report for the owner to read.

## 2. The DM's own notes in the first person
Finding: memory carries by content, and first-person form carries more than a third-person summary; a sham journal
carries nothing. The DM's between-turn and between-session notes (the hidden-layer notes, the digest's «for the DM»
part, the session prep) are written today as summaries. Change the prompts so the DM writes them **as its own
notes in the first person** — what it planned, what it noticed the player doing, what it decided and why, what it left
open, one or two exact lines from the session that carried the feeling — with the same budgets. The player-facing
«Ранее в…» stays as it is (it is for the owner). Test: the prompt text; a scripted-model test that the digest's DM part
is first person; one paid digest on the synthetic campaign to see the shape (≈$0.5).

## 3. The rules system is set at creation
Finding tonight: every new campaign is stored as «World Logic»; the 5e module (derived AC, saves, rules-checked attacks,
the opening blows) never turned on for the owner's campaigns until his manual switch. Do: the new-campaign wizard sets
the rules system from the world's description when it names D&D 5e or Pathfinder (keep the stored id the turn path
requires); «Правила и кости» on the settings screen offers the choice with a one-line explanation of what the module
does; the campaign page shows a small «5e-модуль: включён / выключен» chip so the owner can see it. Tests for the wizard
and the setting.

## 4. Old sheets under the 5e module
Finding: a schema-1 sheet with no level, no save lines and a class word the module does not recognise (Джеймс
Вордсден, «Маг школы Воплощения…») gets saves as bare modifiers. Do: the module recognises the class by the first word
before any «школы / of the …» qualifier (маг / wizard, колдун / warlock, …); where the sheet has no save lines, derive
them from class proficiencies and level when the level is known, and otherwise show «уровень не указан» on the sheet with
a one-click «Изменить лист» prompt. A one-time data fix for «Приключения начинаются»: level 5, the wizard's saves (Int,
Wis) — as an owner correction recorded in the sheet's history, not a silent edit. Tests on a fixture of the old sheet.

## 5. The welfare rule for the DM's companions and NPCs (small, prose)
Finding: being treated as a participant rather than an instrument changes behaviour. The companions' instruction says
they «act on their own character and sense»; add the same frame the DM gets — their judgement is wanted, they may
disagree with the hero, they are not there to serve the plot. Prose in both roles; no mechanics.

## Done when
Items 1–5 each with a test; the before/after table of item 1 in the report; the owner's reload is one step
(`--stop`, `--prod`) with no data correction needed except item 4's recorded one; the report lists the money.
