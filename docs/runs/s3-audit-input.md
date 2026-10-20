# Session 3 candidate — audit input: the owner's session 2 notes mapped to the commits that address them

Source: `docs/runs/session2-owner-notes.md` on `origin/claude/handoff` (the two «Key finding» sections as five KF rows, then items 1–85; every number 1–85 is used in the notes).
Branches: **fix** = `origin/claude/session2-fixes-a-f-jh3krk` (stages A–F, 69 commits, tip `7456479`); **2D** = `origin/claude/live2d-1-9lq5bf` (16, tip `b4e96e6`); **music** = `origin/claude/stage-music` (3, tip `865b849`); **lease** = `origin/claude/stage-fix-turn-lease` (2, tip `fb40961`, merged into fix as `a49c1e2` and into 2D as `5ab2722`); **base** = `origin/claude/session-2-prep` at `d74b6c6`, under all of them.

| # | The owner's note (≤ 12 words) | Status | Commit(s) | Branch | Where it is described (report section) |
| --- | --- | --- | --- | --- | --- |
| KF-hidden-layer | The app gives the DM no hidden layer; creation forbids one | done | 01d7402, 1232fbb, e9ea144, 7cedebe | fix | report B1 «The hidden layer»; B probes table, «A fresh campaign's prep» row; NtO 5; acc. 2.2. The 2D POI seeds (`bcb5c3d`) are stored privately but not joined to this layer (2D report «Proposals» 2) |
| KF-instructions-language | The DM's instructions are English; the Russian reads translated | done | 01d7402, 7cedebe | fix | report B4; B voice-metrics table; NtO 3 (Russian is now the default); acc. 2.1 |
| KF-humour-recipe | The voice layer's humour rule is a recipe for the quips | done | 01d7402 | fix | report B4 («The humour recipe is gone»); acc. 2.1 |
| KF-ooc-reply | An out-of-game note was answered inside the story text | done (rule in the instructions) | 01d7402 | fix | not named in the report; the line is in `TABLE_RULES` (`roles.ts`, `roles-ru.ts`) |
| KF-owner-rules | Owner corrections live in chat history and drop out | done | 01d7402, 22b748b | fix | report B2 («an owner's out-of-game rule is pinned as an owner fact»); A2 (the DM's observations append-only) |
| 1 | A side menu on the home screen looks odd | done | d74b6c6 | base | notes item 1–3 «Status» (fixed before session 2); report F «The screens fill the window» (items 22, 33, 1–3) |
| 2 | The main menu sits high and small; centre it | done | d74b6c6, 40998c8 | base + fix | as item 1; acc. 7.1 |
| 3 | Two names for DM Craft; developer link on the home | done | d74b6c6 | base | notes item 1–3 «Status» |
| 4 | The «ИИ: провайдеры и модели» block is an OpenAI-only leftover | done | 353aaa4 | fix | report F «General settings»; acc. 7.5 (the owner's question on moving canon compile to Claude stays open) |
| 5 | Unreadable, very small text on the owner's screens | partial: World Lab keeps its old sizes; the 2D and music text panels got the 13 px floor in the merge (on-token badges of the battle map stay map drawing) | 8745c52, b718733, 9831952, f23c512 | fix + merge | report F «Readable text», «Not done, and why»; acc. 7.1 |
| 6 | «Крупный текст истории» does nothing on the game screen | done | 1da6fd5 | fix | report F «Крупный текст истории works»; acc. 7.2 |
| 7 | «Мастерство Ведущего» looks messy: uneven cards, long history | done | 66b01b1, 3701857 | fix | report F «Мастерство Ведущего»; acc. 7.3 |
| 8 | The world's text never reaches a play turn | done | a2a467a, a0b9125 | fix | report F «What the DM reads from the start»; acc. 6.4 |
| 9 | No D&D 5e support beyond knowledge (ladder, nat 20/1, sheet) | partial: the 5e sheet (schema 2) and the BG3 nat-20/1 rule landed; no per-campaign rules switch for the 8–19 ladder, `sheetBonus` first-match unchanged (per code) | 6cedf0c, a2a467a, 01d7402 (+ 87f877a, 2D rules module for combat sums) | fix (+ 2D) | not named in the plan or the report (the notes said «later»); report D «The model», F «The hero in one pass», B3 |
| 10 | The wizard's summary shows the wrong DM depth | done | a3112b9, a0b9125, e4211bc | fix | report F «Depth»; acc. 6.4 |
| 11 | Strange developer texts on the wizard's first step | done | a0b9125 | fix | report F «One wizard in story order»; acc. 6.1 |
| 12 | After «Создать Мир» nothing shows it worked | done | a0b9125 | fix | report F «One wizard in story order»; acc. 6.1 |
| 13 | The hero's fields sit on the World step | done | a0b9125, e4211bc | fix | report F «One wizard in story order»; acc. 6.1 |
| 14 | No ring slots; starting items cannot go on the doll | done | 6cedf0c, 8c7b2ca, 65faf8c, e762714, a0b9125 | fix | report D «The model», «Starting things on the doll»; acc. 3.1, 6.3 |
| 15 | The adventure's description reaches a turn as 600 characters | partial: the people who go with the hero join the party only on the DM's first turn | a3112b9, a2a467a | fix | report F «What the DM reads from the start», «Not done, and why»; NtO 11; acc. 6.4 |
| 16 | The hero draft failed on a detailed «Кто вы?» | partial: no «fill in by hand» before a model call (the manual sheet opens only after a DM failure) | a2a467a, 3af4a34 | fix | report F «The hero in one pass», «Not done, and why»; A5 (bootstrap attempt logged) |
| 17 | A failed «Ранее в…» digest is retried and paid every entry | done | 3af4a34 | fix | report A4; acc. 5.5 |
| 18 | Nobody can change the hero's sheet lines after creation | done | 65faf8c, 9d62244, 2c74835 | fix | report D «The DM's tools», «The screens»; acc. 3.6 |
| 19 | The review screen's item editing confuses; no save cue | done | a0b9125 | fix | report F «The sheet and «Утвердить героя»»; acc. 6.3 |
| 20 | TOP: hero creation in one pass, the owner's numbers kept | partial: changing the sheet in words («поменяй…») not built | a2a467a, a0b9125, 83236a0 | fix | report F «The hero in one pass», «The hero probe», «Not done, and why»; NtO 10; acc. 6.2 |
| 21 | The new-campaign flow is out of story order | partial: a per-world rules document (optional in the item) not built | a0b9125, d49eea4 | fix | report F «One wizard in story order», «Not done, and why»; acc. 6.1 |
| 22 | The campaign screens do not fill the window | done | 8745c52, 1f76073, 40998c8, b718733 | fix | report F «The screens fill the window»; acc. 7.1 |
| 23 | The history window is only 45k tokens of a 1M model | done | 22b748b, 3af4a34, 7cedebe | fix | report A2; B «Память ведущего — the three presets measured»; NtO 4; acc. 2.3 |
| 24 | The old loot and containers panel under the adventure form | done | a3112b9 | fix | report F «Small things»; acc. 6.6 |
| 25 | The Library's document view and editor: nested admin panels | done | 3602bd0, 7589091, 008509b, bdd334a | fix | report F «The Library»; acc. 7.4 |
| 26 | Campaign settings show internal rules and per-turn limits again | done | 6bca4c9, 7589091 (+ d74b6c6 for the Flare caption) | fix (+ base) | report F «Campaign settings»; NtO 12; acc. 7.6 |
| 27 | CRITICAL: the owner cannot put items on the hero | done | 6cedf0c, 8c7b2ca, 2c74835, e762714 | fix | report D «The screens», «Starting things on the doll»; acc. 3.1, 3.2 |
| 28 | Money and counters are missing from the hero | done | 6cedf0c, 65faf8c, 2c74835, a2a467a | fix | report D «The model»; F «The hero in one pass» (counters with max, purse in coins); acc. 3.3, 3.4 |
| 29 | The opening picture came late, with no «рисуется…» | done | 1da6fd5 | fix | report F «The opening's frame»; acc. 6.5 |
| 30 | Small screen issues: session button, HP buttons, item panel | done | 1da6fd5, 8745c52, 40998c8 | fix | report F «Small things»; acc. 7.7 |
| 31 | The map is filed under the wrong scale; no region map | partial: the region map, travel and place scenes are built; the atlas levels and the folds under the map unchanged | ad0b2a1, bcb5c3d, 45d3fef, d62379b | 2D | 2D report Part 1 (1–4), «Needs the owner»; progress «Owner's instructions» (moved to 2D) |
| 32 | The first turn failed: max_tokens, then a provider error | done | 22b748b, e9ea144, 4593089, a2a467a | fix | report A1; F «Small things» (32 b); acc. 1.1 |
| 33 | Doll slots duplicate legs and boots, no ring; screens small | done | 6cedf0c, 8c7b2ca, 2c74835, 8745c52, 1da6fd5 | fix | report D «The model», «The screens»; F; acc. 3.1 (the owner's acceptance is still open) |
| 34 | The owner's names from the opening review were not used | done | a2a467a, a0b9125 | fix | report F «What the DM reads from the start»; acc. 6.5 |
| 35 | Horses shown as a holding with the party as crew | done | 6cedf0c, 65faf8c, 2c74835 | fix | report D «The DM's tools» (mounts), «The screens»; acc. 4.2 |
| 36 | Companions have stat blocks but no gear | done | 65faf8c, 2c74835, 6cedf0c | fix | report D «The DM's tools»; acc. 4.1 |
| 37 | A reroll offer and a pause after every player roll | partial: rerolls kept by the owner's decision and shown in settings; companions never pause; the hero's shown roll still pauses whenever rerolls are on (per code) | 6bca4c9, 716b306, 1232fbb | fix | report F «Campaign settings», C «Roll cards»; `FIX_S2_PLAN.md` «Decided … 23:19» (Luck: both) |
| 38 | The narration reads like a translation; «приём» for a spell | partial: the Russian role and the author check are done; the role still names the 8–19 ladder, with no deferral to the DM guide (per code) | 01d7402, 7cedebe | fix | report B4; B voice-metrics table |
| 39 | The DC is hidden and its toggle unreachable | done | 01d7402, 6bca4c9 | fix | report B3; F «Campaign settings»; acc. 7.6 |
| 40 | All checks failed; a natural 1 cost nothing; hero's line written | done | 01d7402 | fix | report B3 (BG3 nat 20/1, the hero's will); `FIX_S2_PLAN.md` «Decided … 23:19» |
| 41 | The narrator stated the DM's private plan as fact | partial: a rule in the DM's instructions; no new server check for private hours or intents (the old literal-leak check is unchanged, per code) | 01d7402 | fix | report B3 («private plans' hours and places never said early») |
| 42 | The action box is tiny | done | 6419590 | fix | report C «The screen»; acc. 1.4 |
| 43 | The first combat round is a wall of roll cards | done | 6419590, 727c1e5 (+ 87f877a fight log) | fix (+ 2D) | report C «Roll cards»; acc. 1.3 |
| 44 | Owner decision: the DM rolls for the companions | done | 716b306, 6419590 | fix | report C «Roll cards»; progress «Stage C, part 1» |
| 45 | The «Бой» panel is stuck at round 1 | done | 56adf18, 87f877a | 2D | 2D report Part 2 «The `combat` tool grew», «The battle screen»; moved to 2D by `7485f13` (doc) |
| 46 | No damage rolls; enemies' hit points invisible | done | 22b748b, 01d7402, 56adf18, 87f877a | fix + 2D | report A1–A3 (damage bundled with the attack), B3 (damage per ray); 2D report Part 2 |
| 47 | Principle: the narrator never judges the hero | no code needed: the turn did it right; a watch item for the session report | — (B probe in 7cedebe checks reactions «from his own character») | fix | report B probes table («Companions react to a letter») |
| 48 | «Собрать все трофеи» left the weapons and armour behind | done | 65faf8c, 3af4a34, fb9ff8d | fix | report D «The DM's tools», «Numbers»; A6 (the ledger checker) |
| 49 | No spells tab | done | 6cedf0c, 2c74835 | fix | report D «The screens»; acc. 3.5 |
| 50 | A big time cost was paid without asking | done | 01d7402 | fix | report B3 (the hero's will: no time or resource without the player) |
| 51 | A companion asks the hero something, then walks on | done | 01d7402 | fix | report B3 (a question to the hero ends the turn) |
| 52 | The coins sit as three loose counters, wrong order | done | 6cedf0c, 65faf8c, 2c74835 | fix | report D «The model» (the wallet line); acc. 3.3 |
| 53 | The turn arrives in halves with a generic «думает» | done | 6419590, 727c1e5, c30eef8 | fix | report C «One timeline per turn»; acc. 1.2 |
| 54 | The planned ambush went off without the hero | partial: `opening: "party"` exists but the DM applies it at will; the hero's initiative as a visible roll and the told trigger not addressed | 56adf18, 87f877a | 2D | 2D report Part 2 «The `combat` tool grew», «Needs the owner (Part 2)» (the ambush rule) |
| 55 | Loot can be seen but not handed out | done | 2c74835, 9d62244, e762714, 65faf8c | fix | report D «The screens»; acc. 3.2 |
| 56 | A turn lost to max_tokens and a provider error again | done | 22b748b, e9ea144 | fix | report A1 (the cap is 32 000, not the model's 128k: the lease limit of item 73) |
| 57 | The whole session's transcript unfolds under the play screen | done | 6419590 | fix | report C «The screen»; acc. 1.4 |
| 58 | A finished turn thrown away by a «conflict»; dead buttons | done | 048e5b1, fb40961, 22b748b | lease + fix | lease report; report «Already fixed on the base branch», A1 (heartbeat while streaming); acc. 1.1 |
| 59 | Turn speed: five-minute turns | done | 22b748b, 3af4a34, e9ea144 | fix | report A3, «The numbers — four probes»; NtO 2 (the lighter continuation kept off by measurement) |
| 60 | The hero's own strike is missing from the story | done | 1232fbb, 01d7402, 87f877a | fix + 2D | report B3 («every roll the player saw is told»); 2D report Part 2 (the hero's attack is a roll card) |
| 61 | A coup de grâce became two crits and a live man | partial: the item-60 check is in code; no coup-de-grâce or wounds-by-HP rule in code (2D has only the RAW auto-crit on a helpless target) | 1232fbb, 87f877a | fix + 2D | report B3; 2D report Part 2 «The optional rules module»; `FIX_S2_CDEF.md` (moved to 2D) |
| 62 | The app slowed to a halt after a good turn | partial: the poll backs off with one read in flight; a lighter `/play` and the post-commit confirmation not reported | 3af4a34, f54f317 | fix | report A3 (polling) |
| 63 | The turn shown out of order; text appears and vanishes | done | 6419590, c30eef8 | fix | report C «One timeline per turn»; acc. 1.2 |
| 64 | The owner wants enemy hit points and damage on screen | done | 56adf18, 87f877a, 22b748b | 2D + fix | 2D report Part 2 «The battle screen», «Needs the owner (Part 2)» (HP numbers) |
| 65 | Enemy attacks resolve with no chance for reactions | partial: a reaction card through the DM ending its turn; no server pause; enemy rolls stay private (the ring counted twice is fixed) | 56adf18, 87f877a, 65faf8c | 2D + fix | 2D report Part 2 «Needs the owner (Part 2)» (Reactions); report D (worn-item bonus) |
| 66 | Modifiers counted twice; the hero's rolls inflated | done | 01d7402, 727c1e5, 65faf8c | fix | report B3; C «Roll cards»; D «The DM's tools» |
| 67 | The DM decided for the hero | done | 01d7402, 7cedebe | fix | report B3; B probes table («A companion objects to an order») |
| 68 | A name with no anchor; a deduction said three times | done | 01d7402, 7cedebe | fix | report B3, B4; B probes table («Companions react to a letter») |
| 69 | The reveal closed with a quip; gestures and tics repeat | done | 01d7402 | fix | report B4 (the Russian probe let one gesture appear twice in a scene) |
| 70 | Feet turned into paces one to one | done | 01d7402, 56adf18 | fix + 2D | report B3 (distances in feet); 2D report Part 2 (5-ft grid) |
| 71 | The DC hidden again; the owner's note wore off | done | 01d7402, 22b748b, 6bca4c9 | fix | report B2, B3, A2 |
| 72 | A motive told as a riddle; a person's name as a place | done | 01d7402, 1232fbb | fix | report B3, B4 |
| 73 | A second max_tokens failure, on the long rest | done | 22b748b, 01d7402, e9ea144 | fix | report A1; B3 (one `rest`); A probes («Long rest») |
| 74 | Good inventories; small points on stacks and coin order | done | 65faf8c, 6cedf0c | fix | report D «The DM's tools» (stacks merge), «The model» (coin order) |
| 75 | One line in the party council runs a full DM turn | done | 3af4a34, 22b748b, e0445c9 | fix | report A3 (the council as a light call), E (the hero never a listener); acc. 4.3 |
| 76 | Good: portraits, the hero, the map, a place picture reused | no code needed: kept; the owner's reference frame is the E probe's target | 5475fbb (probe) | fix | report E «The picture probe» |
| 77 | «Нарисовать кадр» scrolls to the top and draws nothing | done | b3940ce, 71b2678, 3af4a34 | fix | report E «The frame appears in its turn»; A5 (frame status logged); acc. 5.2 |
| 78 | Frames mismatch captions; a generic wizard; out-of-game frames | done | b5f772e, 71b2678, 9d1fcd2, 39c42ee, f9fbf1f, 5475fbb | fix | report E «Frames match their turn», «The default path»; acc. 5.1 |
| 79 | Same face, same gaze in every frame | partial: no second portrait angle (one neutral angle now) | b5f772e, 9d1fcd2, 39c42ee, 5475fbb | fix | report E; NtO 7, 8; acc. 5.1, 5.3 |
| 80 | Replace «Хроника» with a gallery | done | 71b2678, 91d5583 | fix | report E «The gallery replaces the chronicle»; NtO 9; acc. 5.4 |
| 81 | «Закончить сессию»: two digests, the card twice, an odd recap | done | 3af4a34, e0445c9 | fix | report A4; E «The session close by length»; acc. 5.5 |
| 82 | The main complaint: no big mystery, no wonder, stingy loot | done | 01d7402, 7cedebe | fix | report B1; B probes table («A lair search», «A fresh campaign's prep») |
| 83 | Session 2 cost three times session 1 | done | 22b748b, 3af4a34, e9ea144 | fix | report A2; «The numbers — four probes» |
| 84 | The DM's private sheet held nothing bigger in reserve | no code needed: an answer to 82; the fix is KF-hidden-layer | — | — | the notes only; see KF-hidden-layer |
| 85 | The dossier's facts layer overflows and silently drops facts | done | 01d7402, 1232fbb, 3af4a34 | fix | report B2; A5 (every budget drop logged); acc. 2.3 |

## Counts

| | done | partial | not addressed | no code needed | total |
| --- | --- | --- | --- | --- | --- |
| Items 1–85 | 67 | 15 | 0 | 3 | 85 |
| Key-finding rows (KF) | 5 | 0 | 0 | 0 | 5 |
| **All rows** | **72** | **15** | **0** | **3** | **90** |

## Notes for the auditor

- Abbreviations in the last column: *report* = `docs/runs/fix-s2-report.md` (fix branch), *2D report* =
  `docs/runs/live2d-1-report.md`, *lease report* = `docs/runs/turn-lease-fix-report.md`, *acc. N* = section N of
  `docs/runs/fix-s2-acceptance.md`, *NtO N* = item N of the report's «Needs the owner», *progress* =
  `docs/runs/fix-s2-progress.md`. «Per code» marks a gap that no report states; it was found by reading the branch's code.
- **music** (`0fb918a`, `89ea1ba`, `865b849`) addresses no item of the notes: the soundtrack is its own stage (`docs/stages/STAGE_MUSIC.md` on handoff). **lease** addresses item 58 only (and item 59's fourth point, the lease renewal).
- The unnumbered section «Combat — a separate stage» (battle map, initiative ribbon, enemy cards, combat speed) went to the 2D session: `56adf18` (server: the battle model, the grid, the grown `combat` tool), `87f877a` (the attack action, the rules module, the battle screen), `c90edc5`, `36afe72`, `f870805` (follow-ups from the live fights); the 2D report Part 2 measured combat speed (a lower continuation depth did not shorten a combat turn: 77 s → 79 s).
- Item 45: the old «Бой» panel (`gameplay-combat.tsx`) is untouched, but the 2D combat tool keeps writing the old `active` / `action` / `move` / `reaction` keys and the round, so the panel follows the fight; the full view is the new battle screen on «2D».
- The «per code» gaps (items 9, 37, 38, 41) are not in any report; they are what the branch's code shows and are worth
  confirming in the audit. Item 62's two open points are simply absent from the reports (not checked in code).
