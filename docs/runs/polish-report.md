# Polish run — owner report (2026-10-17)

Branch `claude/polish` from `origin/claude/integration`, with `origin/claude/fix-dm-craft-payload` merged first. Spec:
`docs/stages/POLISH.md` («Scope of this run», «Order of work»). Everything below is on `claude/polish`; nothing went to
`main`. Resume notes: `docs/runs/polish-progress.md`. The picture-models files listed in the scope were not touched.

## In one paragraph

The ten groups of the order of work are done and each is proved by its own test file (`tests/polish-group1` … `group10`,
~70 tests) plus the updated older suites. The turn now shows every text part, speaks Russian in its chips, pays in the
world's own currency, rolls with the sheet's bonus and a difficulty in words, runs at the base depth unless the scene is a
climax, keeps a 1-hour cache on the stable prompt, measures the first word from the player's send, has six new pending
DM Craft cards for the owner to approve, one picture path, one page scroll with a compact composer, the mechanics for the
Russian voice (off until the voice stage), a wallet and paper doll for any ruleset, a map that lays places out by itself,
a whole-world codex, a wizard that creates any sheet and leads into the first turn, an opening that sets the clock, and
«Ещё» split into the player's actions and the owner's editor. Final checks: __CHECKS__. Paid: __SPEND__ of the $15 cap.

## What changed, group by group, and how it is proved

**1 · Correctness of the turn and the records** (`docs/TURN_LOOP.md` §11, migration 57). Every text part reaches the player
with paragraph breaks (the Мокей and turn-28 cases); a turn that ends on a roll is asked once for the outcome; the
player's chips are server-written lines in the campaign language, and private rolls, DM notes, plans and Character Models
never reach them; a person recorded ahead of the story is hidden until met; money is the world's own word and
`claim_reward` pays on an open quest; items can be lost, modified, pledged and lent; «Твой момент» only after a resolved
successful check in a tense scene; «Закончить сессию» ends the session, runs the digest and shows the title, «Ранее в…»
and the «Тем временем…» stinger; play time counts; the DM Craft screen has «Review and approve». Proof:
`tests/polish-group1.test.mjs` (11), `tests/dm-craft-server-payload.test.mjs` (the merged fix).

**2 · Rolls** (§12, migration 58). The roll tool takes the skill by name (the server resolves the sheet bonus: a stat, a
«+2» line, or +2/+4/+6 for умеет/хорошо/мастер), the fiction's bonuses with sources (capped ±6), the difficulty ladder in
words, an advantage reason; a controlled character's d20 is always the player's card; natural 20/1 flagged with the
hero's-moment hint. The card shows reason, die, total, bonuses, difficulty in words, one «Дальше». Proof:
`tests/polish-group2.test.mjs`, bench scenario `17-trade-bonus` (fake 3/3).

**3 · Speed and cost** (§13, `docs/SPEED.md` §7, migration 59). Depth: the base of the range is the base, the top only for a
climax (combat, the DM's climax hint, a due off-screen plan, a decisive input), at most twice in a row; the reason is on
the turn. Prompt in five blocks by volatility, blocks 1–3 on a 1-hour cache (`ttl: "1h"`, the 1h write rate priced);
the first word measured from the player's send; legacy memory summaries no longer queued for loop campaigns; chat and
digest share the cache. Proof: `tests/polish-group3.test.mjs`; the live numbers are below.

**4 · The DM's craft from session 1** (§14, migration 60). Six **pending** DM Craft versions (never activated by me):
`heros-knowledge`, `danger-and-pacing`, `heros-moment`, `time-and-clock`, `open-questions-and-tics`,
`records-match-the-fiction`. The likes note in two parts (the player's own words, then the DM's observations in
`dm_likes`, clipped at 1 200 with a notice instead of a refusal); the clock in words in the state block; the digest's
notebook names clues met and next. Proof: `tests/polish-group4.test.mjs`, scenario `18-heros-knowledge` (fake 4/4), the
bench checks `timeWordsMatchClock` and `narrationIncludes`.

**5 · Pictures** (`docs/stages/STAGE_V.md` §8). One Stage V path for every picture button (`RedrawAnchor`), the OpenAI
anchors trap removed (provider always fal), «Кадр сцены» on Stage V, «Скрыть/Показать» working, the strip lightbox.
Proof: `tests/polish-group5.test.mjs`, `map-atlas-ui`, `persistent-secondary-pages` updated.

**6 · Game screen** (§15). One stage (the frame replaces the place art), one page scroll, the sticky compact composer with
icon tools, the addressee read from the text («Тамсин, …»), one «Ведущий думает…», the turn's changes folded and led by
items/money with the «⚡ думал глубже» mark, the clock in words, no adventure card, «Зацепки» and «Долги и обещания», the
goal from the taken quest or the arc, the hero line in words. Proof: `tests/polish-group6.test.mjs`, `stage5-ui`,
`playtest-game-character-ui`; screenshots below.

**7 · The mechanics for the Russian voice, and the budgets** (§16, migration 61). Speech profiles on Character Models with
the tic counter in the session tail; the budgets of item 8 (canon 40k, codex 30k, scenes 30k, exchanges 15k verbatim,
newest first); the voice slots and «Образцы голоса» built and *off*; `finish_turn` asked once when the model stops after
the narration; the naturalness metrics on every bench run; the opening written by the campaign's DM when it is an OpenAI
model. Proof: `tests/polish-group7.test.mjs` (10).

**8 · Character and inventory for any ruleset** (migration 62). The wallet always exists in the world's currency (Cyrillic
currencies are money), the universal twelve-slot paper doll for a record without slots, the backstory block, stub zeros
hidden, the owner's HP correction, Russian «Навык/Защита», a narrative hero may get the humanoid slots. Proof:
`tests/polish-group8.test.mjs`.

**9 · Codex, map, journal** (§17). `upsert_place` takes a parent and whereabouts; the atlas lays such places out by itself
(deterministic, never saved) and shows rumours dashed; the map opens where the hero is; the codex is tabs for the whole
world; the journal hides empty sections and links the goal; the pinned list lives in the settings; the reward line is in
the campaign language. Proof: `tests/polish-group9.test.mjs`.

**10 · Wizard and the path to the first turn** (§18, migration 63). Any sheet creates and a grey button says why; a
single item counts as one; Russian combat labels and the hero's own items offered as weapons; the name offered
capitalised; the wizard's start phrase prefills the first adventure, which goes straight to the opening proposal; the
stray «Новая Кампания» link is gone; the opening review reads the scene's time («утро» → 8:00) and sets the clock once;
«Ещё» split into the player's actions and «Редактор кампании · для владельца» with one line per tool. Proof:
`tests/polish-group10.test.mjs` (5), `universal-bootstrap-ui/sql`, `playtest-game-character-ui` updated.

## Final checks

__FINAL_CHECKS__

## Before / after of items 12–14 (the live measurement)

__MEASUREMENT__

## Money spent

__MONEY__

## Pending DM Craft versions (for the owner to review and approve)

`heros-knowledge`, `danger-and-pacing`, `heros-moment`, `time-and-clock`, `open-questions-and-tics`,
`records-match-the-fiction` — each v1 with the provenance «Polish: …» as its one line «what changes». Nothing was
activated; the bench and the test fixture activate them for their synthetic owner only. Their Russian texts are my draft
for the owner's review (the voice stage rewrites the cards natively).

## Needs the owner

Decisions I did not make for you, and follow-ups outside this run:

1. **The six pending DM Craft versions** — approve them in the DM Craft screen («Review and approve»; the provenance line
   says what each changes). Their Russian wording is my draft.
2. **An Opus-written opening.** The opening proposal is written by the campaign's DM only when that DM is an OpenAI model;
   the bootstrap contract (its SQL `usage.model` check and the validators) pins OpenAI. Letting Opus write it is a bounded
   change to that contract — say if you want it before the voice stage.
3. **«Закончить сессию» closes the session row on «Продолжить»**, not inside END: the legacy invariants (END never changes
   the runtime revision; an unfinished action survives it) forbid closing it in the same transaction. The digest runs at
   once on the ended session, so the player sees no difference; the data model keeps the old meaning of «closed».
4. **The decisive-input rule for depth is rules only** (word stems in both languages), no tiny-model pre-turn check — the
   spec allowed either; the live numbers below say whether the rule is enough.
5. **The roll tool is non-strict on Anthropic** (it passed the 24-optional-parameter limit of strict tools); the server
   validates every field, so nothing is lost, but a malformed call is rejected at our side instead of the provider's.
6. **The atlas artwork («Создать карту»)** has no Stage V composition and left the map screen; the place illustration goes
   through Stage V. If you want a drawn map, it needs its own composition in the picture workshop.
7. **A `lore` record for the codex's «Мир» tab** — today the tab shows the canon documents; quest texts do not yet link the
   named things they mention («Сельдь»), the codex «Вещи» tab lists them.
8. **Debts from the wizard's hero description** («должен сорок монет Марте») still become a resource line, not a journal
   debt with Marta as a person; the DM can record the debt on the first turn, the wizard does not.
9. **The combat profile drafted from the hero's text**: the draft proposes numbers only when it picks a structured sheet
   itself; a narrative hero switched to structured still starts from the flat defaults (now in Russian, with his own items
   offered as weapons). A DM-drafted profile on demand is a small follow-up.
10. **The first adventure's form still takes two clicks** («Проверить» → «Сохранить») before the opening proposal; the
    wizard's phrase is already in it. Collapsing it into the opening review is a UI follow-up.
11. **The campaign title** is what the wizard's «Название» field holds; the hero's name is the subtitle. «Кампания · рэй» in
    session 1 came from the title typed as «Кампания» — check on the next wizard run; the name is now offered capitalised.
12. **The «Что, если» lab entry wording and the «Картинки» merge of «Визуальная библия»/«Галерея»** were not in the ten
    groups' lines of work and are not done.
13. **The conversation history is not an append-only cached message block** (group 3): recent scenes travel as text in the
    uncached «now» block; the cache numbers below say whether that costs much.
14. **The hero's equipment slots are not backfilled** for existing records; the equip tool heals missing slots on use.
15. **The parallel picture-models session** also touched `src/lib/server/media/pictures-service.ts`; expect a small merge
    overlap there when both branches meet (this run did not edit the picture-models files).

## Known limits and environment notes

- The suite ran under the shell's default Node 22 (the setup script's `/opt/node24` PATH line is not applied to
  non-login shells in this session); the build, the bench, the screenshots and the live runs ran under Node 24 explicitly.
- `tests/universal-bootstrap-sql` «Migration 30 is byte-identical»: the hash is now taken over LF-normalized bytes, so a
  Windows checkout (CRLF) and a cloud checkout agree; the migration file itself is unchanged.
- `tests/astra-first-creation-review`: its module stub list lacked `./dm-settings` since group 7 (the opening-by-the-DM
  change) — fixed in this run; it had not been run between group 7 and the final checks.
- The screenshots overwrite `docs/screens/stage-5` and `docs/screens/stage-v` (the scripts' fixed folders); the previous
  shots stay in git history.
