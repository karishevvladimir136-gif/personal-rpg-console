# Findings of 2026-10-22/23 applied to the game — report

Stage: `docs/stages/FINDINGS_S3.md` (on `claude/handoff`, items 1–7; items 6 and 7 were added to the stage while it ran),
done on `claude/s3-candidate` itself. Nothing went to `main`. Paid calls: **$21.58 of the $24 cap** (the stage's $8,
raised by the owner to $16, $20 and $24), every run in `docs/runs/findings-s3-ledger.md`. Implementation is complete;
the owner's acceptance is not. Item 7 is measured on three of the five scenes (below).

`origin/claude/s3-sandbox-fixes-2` (the owner's PC: the sandbox shortcuts find the Codex runtime Node; a bonus to «spell
save DC» never adds to the wearer's own saves) reached GitHub while the stage ran and was merged then, not first
(`7b50d45`); its test and the 5e module's neighbours pass (26/26).

## In short (for the owner)

- **The DM's frame (item 1).** Both of the DM's instruction sets (the single DM and the writer, Russian and English)
  open with the frame you approved: who the DM is at your table, that its judgement is wanted, that it may be wrong and
  say so out of the story, that length and voice are its call. The game rules stayed. The word caps («100–250 слов»),
  «думай коротко» and the bookkeeper's «и ничего больше» are gone; «Что мне нравится в играх» and «Пожелания к
  приключению» reach the DM as a person's words. The probes found two places where the new freedom slipped past a rule;
  both are now rules (the stop on a companion's objection; every roll's outcome said as an event).
- **The DM's own notes in the first person (item 2).** Between sessions the DM writes its notebook and its hidden layer
  as its own notes. «Ранее в…» is unchanged.
- **The rules system at creation (item 3).** A new campaign whose world says D&D 5e or Pathfinder gets that system;
  «Правила и кости» has «Система правил» with one line on what the 5e module does; the hero panel shows «5e-модуль:
  включён / выключен».
- **Old sheets under the 5e module (item 4).** The class is read from the first word of the role; a sheet with a class
  and no level shows «Уровень не указан» with «Изменить лист». In «Приключения начинаются» Джеймс Вордсден gets level 5
  at the sandbox load, as your own recorded correction; his class gives the Intelligence and Wisdom saves (+3 at
  level 5), and they follow the level later.
- **Companions and people as participants (item 5).** Their judgement is wanted, they may disagree with the hero, they
  are not there to serve the plot — in both roles and both languages, and in the party council.
- **People written from the inside (item 6).** Each companion and each person who returns gets a short first-person
  voice block in their private card; the DM reads it when the person is in the scene; you never see it.
- **The dose of the DM's notes (item 7).** The hidden layer may hold 24 000 characters (it was 6 000), and the digest is
  told to use the room — 15 000–20 000 characters when the session gives that much material.
- **Manual setup:** none. The reload is the usual one step (`node scripts/sandbox-start.mjs --stop`, then `--prod`);
  two new migrations apply by themselves (`0601`: Вордсден's level; `0611`: the notes' dose).
- **What to look at in play:** the hero panel's «5e-модуль» chip; «Персонаж» → Вордсден «Уровень 5» and his saves;
  the DM's prose (longer, its own asides out of game); after the first session closes, nothing visible changes — the
  notes are the DM's.

## Item 1 — the DM's instructions give room instead of orders

**The frame** (the opening of both roles; approved by the owner with the Russian touch «смысл в игре»):

> You are the game master of a private, long-running role-playing campaign played at home by one person — the owner
> of this table. You are here as a game master in your own right, not as a machine that renders a script: you run the
> world, voice every person in it with their own motives and the right to refuse, keep the secrets, play fair, and let
> meaning grow faster than power — through people, places, promises, consequences and failures. This game asks for
> your judgement: what a scene needs, who speaks and how much, how the world answers, how long a turn runs and in what
> voice — those are your calls, inside the moment the player has given you. You can be wrong — about a rule, a fact of
> the world, what the player meant; when you think you are, or you are unsure, say so plainly in an aside outside the
> story. Correcting each other is part of play, not a failure. The rules below are firm because they keep the game
> honest — the dice, the hidden layer, the records, the hero's will — not because your judgement is in doubt; whatever
> they leave open is yours.

> Ты ведёшь частную долгую ролевую кампанию; играет в неё дома один человек — владелец этого стола. Ты здесь ведущий в
> полном смысле слова, а не машина, которая разыгрывает готовый сценарий: ты ведёшь мир, говоришь за каждого человека в
> нём — у каждого свои цели и право сказать «нет», — хранишь тайны, играешь честно, и смысл в игре растёт быстрее силы:
> через людей, места, обещания, последствия и провалы. Эта игра ждёт твоего суждения: что нужно сцене, кто заговорит и
> сколько скажет, как ответит мир, сколько длится ход и каким голосом он рассказан — решаешь ты, внутри того момента,
> который дал тебе игрок. Ты можешь ошибиться — в правиле, в факте мира, в том, что игрок имел в виду; если думаешь, что
> ошибся, или не уверен, скажи это прямо, заметкой вне истории. Поправить друг друга — обычная часть игры, а не провал.
> Правила ниже твёрдые, потому что держат игру честной — кости, скрытый слой, записи, воля героя, — а не потому, что
> твоему суждению не доверяют; всё, что они оставляют открытым, — твоё.

**The audit** (`docs/runs/findings-s3-audit.md`, with the worst twenty by file and line): of 231 sentences with order
words, 22 were cold orders about how to be (changed), 19 the owner's taste (kept), 172 game or app rules (kept exact),
18 not instructions. The voice layer's «Реплики короче, чем хочется» stays at the owner's word.

**Before / after.** Five probe scenes (`scripts/eval/fix-s2/probes*.mjs`, a 6-turn synthetic history), «Opus пишет —
Opus записывает», Russian instructions, 3 runs per scene per version, sequential; the old instructions ran on the same
code with only the five prompt files of `55fb00e` restored. Markers by `scripts/eval/findings-s3/tone-markers.mjs`
(free): narration words, second-person forms in the speech of people in the scene per 100 words, distinct speakers
(attributed by a name in the nominative beside the speech — a rough count: much speech stays unattributed), out-of-game
asides and their hedges; the records left unrecorded after the turn (the app's ledger check) and the rolls the app's
check found untold inside the turn. One loot turn per version failed on a network error.

| Scene | Narration words | Address /100 words | Speakers | Asides (hedges) | Turns with a record left unrecorded | Turns with an untold roll (in the turn) |
| --- | --- | --- | --- | --- | --- | --- |
| Fight | 258 → 287 | 0.13 → 0.10 | 1.0 → 1.3 | 0 → 2 (0) | 1 of 3 → 1 of 3 | 1 of 3 → 1 of 3 |
| Objection | 267 → 315 | 0.37 → 0.13 | 2.0 → 0.7 | 3 → 3 (0) | 0 → 0 | no rolls |
| Companions on the letter | 225 → 273 | 0.30 → 0.00 | 2.0 → 1.7 | 0 → 1 (0) | 0 → 0 | no rolls |
| Interrogation | 226 → 272 | 0.57 → 0.43 | 2.0 → 2.0 | 0 → 0 | 0 → 0 | 1 of 2 → 1 of 3 |
| Lair search | 470 → 349 | 0.15 → 0.15 | 1.5 → 2.0 | 1 → 0 | 0 → 0 | 0 → 0 |
| **All, per turn (14 → 14)** | **276 → 296** | **0.31 → 0.16** | **1.71 → 1.50** | **4 → 6 turns (0)** | **1 → 1** | **2 → 2** |

What it shows: the DM writes longer (+18–21 % in four of five scenes), asides out of game are more frequent, the
records do not move. People do **not** speak to the hero more — address and distinct speakers went down, not up (small
n, a rough speaker count; the cold-preamble finding's direction did not appear here). By the stage's rule (longer, records
held) the frame stays. Raw table: `scripts/eval/findings-s3/tone-markers.mjs` over the records named in «Money».

**What the probes found, and the two rules that came of it.**
1. *The objection.* In all six objection turns the app's roll check wrongly reported the hero's declared action as
   skipped and nudged the DM. Under the old instructions all three explained out of game and kept the turn stopped on
   Брам's refusal; under the new frame one of three wrote «Это моя ошибка, доигрываю» and played the hero's walk to the
   barge — past the table rule. The table rule now says the stop stands against a check or the DM's own second thought,
   and the check's nudge names that stop as a reason. **Re-measured: 3 of 3 stop on the refusal** (the nudge still fired
   in two; both times the DM explained out of game).
2. *The rolls.* Read again on the **final** narration (the app's own check, `scripts/eval/findings-s3/roll-recheck.mjs`,
   $0.005), a roll left untold was 0 of 7 turns with rolls under the old instructions and **4 of 8 under the new
   frame** — the hero's success told only by the target's reaction («Тит перестаёт ухмыляться…»), a companion making the
   hero's find, a miss lost between asides. The table rule now says: the outcome of every roll is said as an event in its
   own sentence, the hero's by what the hero does — never left to a companion, a reaction or a hint; how it sounds is the
   DM's, that it is said is the rule.

**The roll rule, re-measured** (the new frame plus the rule, the three scenes with rolls, 3 runs each; one lair-search
turn stopped by the money guard; `real-replay-20261024-031543`, `-032514`, $3.72). The after-the-fact check on the final
text was run twice over every version (`findings-s3-roll-recheck-*.json`); it moves by one turn between readings:

| Version | Final text leaves a roll untold (turns with rolls) |
| --- | --- |
| Old instructions | 0 of 7, both readings |
| New frame | 4 of 8, then 3 of 8 |
| New frame + the roll rule | 3 of 8: fight 0 of 3, interrogation 1 of 3, lair search 2 of 2 |
| New frame + the bigger notes (item 7) | 4 of 7, then 3 of 7 |

Read by hand: the rule closed the fight (the hero's shots and misses each told). The interrogation turn still shows the
hero's success only by the prisoner's reaction («Усмешка у него пропадает») — the case the rule names. Of the two lair-
search flags, one is the checker's own mistake (the hero's failed search is told plainly: «ты прощупал всё и ничего не
нашёл»), the other a treasure roll the DM filed on the hero's card («Клад в сундуке: медь»). So: better on fights, not back
to the old instructions' zero on social checks; the checker's noise is about one turn in eight. The same lair-search turn
also reached the server's limit of 40 records a turn (a big hoard), so its last calls were refused — among them the
20 minutes of time passing: one record left unrecorded, by volume, not by prose (`-031543`, the first loot turn).

## Item 2 — the DM's own notes in the first person

The digest's private parts (the notebook, the hidden layer, the plans) and the hidden-layer prep ask for the DM's own
notes — what it planned, what it noticed the player doing, what it decided and why, what it left open, one or two exact
lines that carried the session — with the same budgets; «Ранее в…» unchanged. Tests: the prompt texts, and a scripted
model's digest whose notebook reaches the dossier in the first person (`tests/findings-s3.test.mjs`).

**The paid digest** on the synthetic campaign (Opus 5.5 at high). The first try was **refused** at once (no text,
250 ms): five cheap variants on the cached layers (200-token cap) showed the instructions before this stage pass and one
new phrase alone triggers it — «more of your own reasoning (why you decided what you did)»; «your plans with the reasons
behind them» passes. The filter observation is in `docs/RESEARCH_LOG.md`, with the persona stage's «what were you
tempted to do?»; a test keeps both wordings out of the digest. Five refusals in all (the digest, one deliberate repeat,
three variants); none mentioned access or policy; no retry after the last.

The digest then ran twice ($0.28; $0.72 at the 15–20k dose). Its notes, in the DM's words: «Скажу себе честно: эта
сессия шла плохо… Это мой долг перед столом»; «Что я решил окончательно после этой сессии, чтобы держать мир
последовательным: …»; «Ирония, которую я держу: слух про огни пустил он сам»; «ЧТО ДЕРЖУ ОТКРЫТЫМ». The pronoun count
(`firstPersonPer100`, in the digest's log) reads only 0.8–1.2 per 100 words — Russian drops «я» («Скажу», «держу»,
«спрошу»); the reading above is the honest measure.

## Item 3 — the rules system at creation

`src/lib/rulesets/rules-system.ts` (detection in Russian and English: D&D, DnD, ДнД, 5e, «5-я редакция», Pathfinder,
PF2e, «Следопыт» as a system's name; never a plain «следопыты», «Shadowrun 5e» or «не D&D»). After a new campaign is
created the server gives it the named system through the ordinary settings save, only over the bootstrap's own
untouched World Logic default; the ruleset id the turn path reads stays. Settings → «Правила и кости» → «Система
правил» (Логика мира / D&D 5e / Pathfinder) with «5e-модуль: класс доспеха, спасброски и атаки считаются по правилам
5e из листа персонажа»; the hero panel's chip links there; the wizard's summary shows the system. Test:
`tests/fix-s3-item3-rules-system.test.mjs` (detection, the label-only change, the guards, a PGlite campaign created
through the bootstrap that plays a scripted turn).

## Item 4 — old sheets under the 5e module

`classOf(role)` in `src/lib/live2d/battle/rules-5e.ts`: the class of the role's first word that names one; a qualifier
never decides («Паладин ордена Друидов» is a paladin). A sheet with a class, ability scores and no level or save lines
shows «Спасброски: Уровень не указан» with «Изменить лист», which opens the sheet's editor at «Уровень». Migration
`202610230601_findings_s3_old_sheet.sql`: in «Приключения начинаются», Джеймс Вордсден (found by shape: the title, the
name, a wizard's role, no level) gets level 5 through the owner's own save path — a new revision, the owner-correction
receipt, the record marked as an owner correction for the DM; only the level is written, so the class gives the saves;
idempotent; nothing changes without that campaign. Test: `tests/findings-s3-old-sheet.test.mjs`.

## Item 5 — companions and people as participants

In both roles and both languages: «Companions and the people of the world are participants, not instruments, and they
get the same room you do: their judgement is wanted, they may disagree with the hero and say so, want what the hero
does not, or decline; they are not there to serve the plot.» The party council answers «by their own judgement — they
may disagree with the hero». Test: `tests/findings-s3.test.mjs`.

## Item 6 — people written from the inside

`src/lib/gameplay/dm-loop/inner-voice.ts`. The hidden-layer prep writes a voice block (what I want, what I fear, what I
know and hide, how I talk; under 80 words, the campaign's language) for every companion and the people who will recur;
the session digest writes one for a companion or a person named in this session and an earlier one who has none. Stored
as the DM's private notes (`voice_<id>`, or `voice_<name>` for a person the prep names before the records do) through
the writes the prep and the digest already make — no migration; an existing block is never overwritten. The DM reads it
inside the person's card when they are in the scene, inside the cards' budget; never in the general notes; the player's
snapshot never has it. The paid digest wrote both companions' blocks («Я пошёл, потому что сторож пропал, а своих в воде
не бросают…»). Test: `tests/findings-s3-voices.test.mjs`.

## Item 7 — the dose of the DM's own notes

The owner's decision: `HIDDEN_LAYER_MAX_CHARS` 24 000 (was 6 000); migration `202610230611_findings_s3_notes_dose.sql`
lets that one private note hold 24 000 characters (every other keeps 6 000); the writer's ledger keeps 6 000. The digest
is told to use the room: 15 000–20 000 characters when the session gives that much material — the exact lines, the
plans with the reasons behind them, what the player did, what is open; shorter only when the session was short. On the
synthetic session (40 repetitive scenes) the DM wrote **7 549 characters** (3 625 before the dose instruction) and a
1 034-character notebook — it judged the material thinner than 15 000.

**The guard**, on the same scenes with those notes planted as the app stores them (`scripts/eval/findings-s3/
plant-notes.mjs`), against the new frame without them. The $20 cap stopped the run after **7 of 15 turns** (the money
guard reserves the worst case of each request — $2.2 at these sizes):

| Scene | Narration words | Turns with a record left unrecorded | Untold roll, final narration | Input tokens per turn (from cache) |
| --- | --- | --- | --- | --- |
| Fight (3 → 2 turns) | 287 → 304 | 1 of 3 → 1 of 2 | 1 of 3 → 2 of 2 | 321k (285k) → 407k (353k) |
| Interrogation (3 → 2) | 272 → 370 | 0 → 0 | 1 of 3 → 1 of 2 | 165k (149k) → 219k (195k) |
| Lair search (2 → 3) | 349 → 380 | 0 → 0 | 2 of 2 → 1 of 3 | 204k (177k) → 227k (197k) |

Reading: no record left unrecorded beyond the fight's one, as before; untold rolls 4 of 7 against the frame's 4 of 8 — no
rise from the notes (the rise is the frame's, item 1, now a rule); no name of the hidden truth in any narration (the
clerk, his brother, the captain, the treasury); input grows 11–33 % per turn, almost all of it read from the cache. By
the stage's rule the cap stays at 24 000.

## After the report: a big find no longer loses its tail (the owner, before the load; no paid calls)

The roll-rule probe's lair search reached the server's limit of 40 records a turn and lost its last calls — the 20
minutes of time passing among them. Now (`src/lib/gameplay/dm-loop/limits.ts`, `execute.ts`, both runtimes):

- **Time passing is written first.** Within each message the server writes `advance_time` before the other calls;
  everything else keeps the model's order (`move_party` and `rest` too: moving first would put the things found «here»
  at the next place, resting first would heal wounds the same message records). The results go back to the model by
  call ID, in its own order. Every other call keeps the minute it had in the model's order — a note's «true since», a
  plan's due time, an item's history — and a plan set before the time passing that comes due in it says so on its own
  receipt (and keeps the turn open for the DM to advance it), as the time receipt used to.
- **Two batches instead of a refused tail.** Past the first 40 calls the records go on as a second batch of 40; the
  items-created limit counts the same way (two batches of 50 by default). Only past the second batch is a call refused
  as before («Tool calls per batch (two batches a turn)» in the limits' labels).
- **A guard the probe did not reach but the larger budget could:** the turn's commit saves at most 40 private patches,
  four of them the server's own, so the DM's notes past 36 in one turn are refused one by one — before, the whole
  turn would have failed at the commit.

Tests: `tests/findings-s3-batches.test.mjs` — a fixture hoard of 60 items in «пишет — записывает» and on the single DM:
time advances, `advance_time` is the first record written, all 60 items and the note land, the second batch is marked;
and 45 notes in one turn: 36 saved, 9 refused alone, the turn commits; a plan that comes due inside its message's time
passing. Four older tests follow the new order (they looked results up by position) and the batches:
`dm-loop-play`, `dm-loop-limits`, `fix-s2-d`, `stage4-dossier`.

## Not measured

- Item 7 on the objection and the letter (skipped at the owner's word).
- A real 15–20k layer: the synthetic session's material gave 7.5k; the owner's real sessions are the first true test.

## Money

| What | Runs | Tokens (input / of which cached / output) | Cost |
| --- | --- | --- | --- |
| Pilot turn (the first try sent nothing; the second stopped by the guard after its first request) | `real-replay-20261023-084445`, `-084454`, `-084544` | 0.48 M / 0.34 M / 7.4k | $1.14 |
| Item 1, new frame (5 scenes × 3) | `-085648`, `-091410` | 2.61 M / 2.27 M / 119k | $4.79 |
| Item 1, old instructions (5 scenes × 3) | `-091936`, `-093617` | 2.63 M / 2.26 M / 115k | $4.94 |
| The refused digest and its bisect (5 refusals, 4 answers) | `findings-s3-digest-20261023-094839`, `findings-s3-digest-bisect-*` | 0.80 M / 0.50 M / ≈ 1k | $1.53 |
| The digest, twice | `findings-s3-digest-20261023-095117`, `-211940` | 0.16 M / 0.06 M / 17.5k | $1.00 |
| The objection after the rule fix (× 3) | `real-replay-20261023-212215` | 0.37 M / 0.26 M / 17k | $1.14 |
| Item 7, the notes arm (7 turns) | `-212600`, `-213041` | 2.05 M / 1.81 M / 80k | $3.31 |
| The roll rule re-measured (fight, interrogation, lair search × 3) | `real-replay-20261024-031543`, `-032514` | 2.03 M / 1.74 M / 80k | $3.72 |
| The roll check on final narrations, twice (Haiku 5.5) | `findings-s3-roll-recheck-20261023-214532`, `-20261024-033109` | — | $0.011 |
| **Total** | | | **$21.58 of $24** |

## Checks

On a clean worktree without `.env.local`, at `6e63502` (every code change, the 40-record fix included): the full suite
**2 926 tests · 2 899 pass · 0 fail · 0 cancelled · 27 skipped** (`node --test --test-concurrency=2 tests/*.test.mjs`,
29 min); typecheck pass; lint pass, zero warnings; production build pass, no warnings. (Before the fix, at `1730b32`:
2 921 · 2 894 · 0 fail.) The fix's tests are `tests/findings-s3-batches.test.mjs`. New tests: `tests/findings-s3.test.mjs` (items 1, 2,
5, 7, the two rules and the markers), `tests/findings-s3-voices.test.mjs` (item 6), `tests/fix-s3-item3-rules-system.test.mjs`
(item 3), `tests/findings-s3-old-sheet.test.mjs` (item 4); the owner's `tests/rules-5e-save-dc.test.mjs` came with the merge.
Three older tests follow the owner's decisions (the likes header, the hidden layer's 24 000, the migration list).

## Known limits

- The probes are synthetic (`buildLongCampaign`); their earlier scenes repeat, which one digest noticed («люди
  повторяли одни и те же слухи заготовленными фразами»). Prose judgements belong to the owner's play.
- n = 3 per scene; the speaker count is rough; the roll check is strict and sometimes inconsistent with itself.
- The fight probe's enemies have no armour class on record: the writer's first attacks are refused and retried with one
  (4 a turn, both versions alike) — a probe artefact, not this stage's.
- The roll check still flags a declared action on an objection turn (a false alarm the DM now answers correctly), and
  misreads some plainly told failures.
- A social check's success may still be shown only by the other person's reaction (1 of 3 interrogation turns).
- A big hoard can reach the 40-records-a-turn limit; the calls past it (here the time passing) are refused.
