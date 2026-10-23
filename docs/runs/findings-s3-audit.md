# Findings S3 §1 — the register audit of the DM's instructions (DM_TONE_1 step 1)

What was read: both roles in both languages (`src/lib/gameplay/dm-loop/roles.ts`, `roles-ru.ts`), the writer's and the
bookkeeper's briefs (`two-pass/prompts.ts`, the bookkeeper's role), the server's nudges (`loop.ts`, `two-pass/runtime.ts`,
`NUDGES_RU`), the voice layer (`voice.ts`), the tool descriptions (`tools.ts`), the dossier's lines (`context.ts`), the
hidden-layer prep (`hidden-layer.ts`), the session digest (`digest.ts`) and the region prep (`src/lib/live2d/region-prep.ts`).

Method: every sentence of those prompt texts that carries an order word («never», «do not», «only», «must», «briefly»,
«terse», «nothing else», «always», «никогда», «не …», «только», «коротко», «ничего») was listed by a script (231
sentences), then each was read and sorted by hand into three kinds:

| Kind | Count | What it is |
| --- | ---: | --- |
| A cold order about *how to be* (register) | **22** | length caps, «be terse», «keep your thinking short», «your job … and nothing else», a person's words framed as a specification |
| The owner's taste, stated plainly | 19 | speech ends on the thought, no quips, no aphorisms, a tic once a scene, an out-of-game reply in one plain line — kept as they are |
| A rule of the game or of the app | 172 | honest dice and every roll told, the hidden layer never shown, records complete and exact, the hero's will, tool protocol, output formats — kept exact |
| Not an instruction (code, an example line) | 18 | — |

(The script missed three register sentences that carry no order word — the voice layer's «Реплики короче, чем хочется»,
the digest's six-point checklist for its notebook and the prep's «write it now»; they are counted in the 22, and one
script hit, the rebuild's «rewrite it now so it builds on them and never contradicts them», is a rule and moved there.)

The instructions are mostly rules, and rules stay. What was missing is the frame: the opening said what the DM does, never
that its judgement is wanted, that it may be wrong and say so, or that length and voice are its call.

## The worst twenty (file:line before the change)

| # | Where | The sentence | What it does to the DM | Now |
| --: | --- | --- | --- | --- |
| 1 | roles.ts:56 (single DM) | «Keep a turn to what the moment needs: usually 100–250 words, up to 400 for a set-piece scene» | a number decides the length, not the scene | length is the DM's call from the moment |
| 2 | roles.ts:110 (writer) | the same | the same, in the role the owner plays | rewritten |
| 3 | roles-ru.ts:53 (single DM) | «обычно 100–250 слов, до 400 для большой сцены» | the same | rewritten |
| 4 | roles-ru.ts:81 (writer) | the same | the same | rewritten |
| 5 | loop.ts:184 | «finish the narration briefly … Keep your thinking short.» | an order about how to think | the reason (the output limit) instead |
| 6 | two-pass/runtime.ts:49 | the same for the writer | the same | rewritten |
| 7 | roles-ru.ts:101 | «коротко закончи рассказ … Думай коротко.» | the same | rewritten |
| 8 | roles-ru.ts:106 | the same for the writer | the same | rewritten |
| 9 | roles.ts:56 | «Private notes (note_character, note_world) are terse: a few short lines, not prose.» | its own notebook as a form to fill | its own notes, first person, same few lines (§2) |
| 10 | roles-ru.ts:53 | «Приватные заметки … короткие: несколько строк, не проза.» | the same | rewritten (§2) |
| 11 | roles.ts:175 (bookkeeper) | «Your job is to make every record … and nothing else.» | an instrument, not a colleague | «that is your whole part in the turn, and the world holds together because of it» |
| 12 | context.ts:425 | «What the player asked for … theirs — never rewrite, always honour» | the owner's «Что мне нравится в играх» read as a specification | a person telling the DM what they enjoy (step 4) |
| 13 | digest.ts:66 | «Do the DM's homework in one pass … nothing else» | between-session notes as homework | the DM's own notes between sessions (§2) |
| 14 | digest.ts:72 | the notebook as a six-point checklist of summaries | a third-person report | first-person notes with the same budget (§2) |
| 15 | roles.ts:60 | «when you refuse one, say why in one short aside» | caps the DM's reason before it is given | «say why in an aside outside the story» |
| 16 | roles.ts:113 | the same in the writer's dice paragraph | the same | rewritten |
| 17 | roles-ru.ts:32 | «скажи почему, одной короткой заметкой вне игры» | the same | rewritten |
| 18 | roles.ts:56, 110; roles-ru.ts:53, 81 | «do not offer a menu of choices unless the fiction calls for one» | a «do not» where a want fits | «a menu of choices only when the fiction itself offers one» |
| 19 | hidden-layer.ts:18 | «This campaign has no hidden layer yet: write it now. … nothing else» | the prep as a chore | first-person prep (§2); the JSON format stays (the parser needs it) |
| 20 | voice.ts:19 | «Реплики короче, чем хочется» | shortens what people say to the hero | **left as is** — the voice stage the owner approved; listed for the owner to decide |

Not changed, on purpose: every game rule (dice, records, secrets, the hero's will, the table's rules), the tool
descriptions (all mechanics — none is an order about how to be), the output formats of the prep, the digest and the
region prep (their parsers need them), and the owner's taste lines.
