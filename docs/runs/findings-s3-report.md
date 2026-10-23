# Findings of 2026-10-22/23 applied to the game — report

Stage: `docs/stages/FINDINGS_S3.md` (on `claude/handoff`, items 1–7), done on `claude/s3-candidate` itself. Nothing went
to `main`. Paid calls: see «Money» below and `docs/runs/findings-s3-ledger.md` (cap $8, raised by the owner to $16 for
items 1 and 7). Implementation is complete; the owner's acceptance is not.

<!-- MERGE -->

## In short (for the owner)

- **The DM's frame (item 1).** Both of the DM's instruction sets (the single DM and the writer, Russian and English)
  now open with the frame you approved: who the DM is at your table, that its judgement is wanted, that it may be wrong
  and say so out of the story, that length and voice are its call. Every game rule stayed exactly as it was. The word
  caps («100–250 слов»), «думай коротко» and the bookkeeper's «и ничего больше» are gone; your «Что мне нравится в
  играх» and «Пожелания к приключению» reach the DM as a person's words, not a specification.
- **The DM's own notes in the first person (item 2).** Between sessions the DM writes its notebook and its hidden layer
  as its own notes — what it planned, what it noticed you doing, what it decided and why, what it left open, one or two
  exact lines from the session. «Ранее в…» is unchanged.
- **The rules system at creation (item 3).** A new campaign whose world says D&D 5e or Pathfinder gets that system;
  «Правила и кости» has «Система правил» with one line on what the 5e module does; the hero panel shows «5e-модуль:
  включён / выключен».
- **Old sheets under the 5e module (item 4).** The class is read from the first word of the role («Маг школы
  Воплощения» → wizard); a sheet with a class and no level shows «Уровень не указан» with «Изменить лист». In
  «Приключения начинаются» Джеймс Вордсден gets level 5 at the sandbox load, as your own recorded correction; his
  class gives the Intelligence and Wisdom saves (+3 at level 5), and they follow the level later.
- **Companions and people as participants (item 5).** The DM's instructions say it plainly: their judgement is wanted,
  they may disagree with the hero, they are not there to serve the plot.
- **People written from the inside (item 6).** Each companion and each person who returns gets a short first-person
  voice block in their private card (what I want, what I fear, what I know and hide, how I talk); the DM reads it when
  the person is in the scene; you never see it.
- **The dose of the DM's notes (item 7).** The hidden layer may now hold 24 000 characters (it was 6 000) — your
  decision; the measurement below is the guard.
- **Manual setup:** none. The reload is the usual one step (`node scripts/sandbox-start.mjs --stop`, then `--prod`);
  two new migrations apply by themselves (`0601`: Вордсден's level, `0611`: the notes' dose).

<!-- BODY -->
