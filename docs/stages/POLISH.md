# Polish — after the owner's first sandbox play

Cloud session (`docs/CLOUD.md`, environment `rpg-console`), branch `claude/polish` from `origin/claude/integration`.
The owner's notes from the first play are added below by the planner before launch.

## Order of work (the list below is long; do it in this order, commit after each group)

1. **Correctness of the turn:** every text part reaches the player (Мокей, the silent continuation after a roll);
   private records and DM rolls never leak into player chips; removing an item is not using it up; «Твой момент» only
   after a resolved roll; the DM Craft fix branch merged.
2. **Rolls:** the skill named on the card, bonuses from the sheet and the situation, advantage, the DC ladder — four
   times in one session the hero's own trade was rolled at +0 (two natural 1s on his core skill under water).
3. **Pictures:** one picture path for every button, the OpenAI-anchors trap removed, «Кадр сцены» on Stage V,
   «Скрыть», the strip lightbox. (Model choice comes from `PICTURE_MODELS.md`.)
4. **Game screen layout:** one stage, one page scroll, compact composer, one «Ведущий думает…», collapsed Russian
   turn summary leading with items and money, no timers, no adventure card, «Зацепки», goal from the taken quest.
5. **Russian voice layer and the A/B** (item 7), plus the context budgets (item 8) and the layer-3 cache split.
6. **Character and inventory for any ruleset** (doll, wallet, backstory, registry port), healing and rest.
7. **Codex, map, journal** (whole-world codex, named things, map hierarchy, pins).
8. **Wizard and the path to the first turn**, combat profile, «Ещё» split into player actions and an editor.

## Known before the play

1. **A roll that is never narrated.** After an interactive dice roll the turn pauses; the game master's continuation
   after the roll sometimes holds only tool calls and no text, so the player sees the roll but not what happened.
   Seen on Opus in both blind runs (English and Russian). The continuation after a roll must always narrate the
   outcome; if the model returns no text, ask it once more for the narration only, and never close the turn silently.
2. **Stage V review fixes** — `docs/stages/STAGE_V.md` §7: one stage instead of two stacked pictures, a real frame in
   the review screens, a portrait anchor queued for a named person seen in a frame without one, gender and looks from
   the public text until then, visible traits kept in anchors, action text with the same person labels, no mid-word
   cuts.
3. **Latin shorthand in a Russian campaign.** «HP» and «NPC» appear in four game-master notes of the Russian blind
   run, one of them in a counter receipt («без потери HP»). Anything the player can see follows the campaign
   language; notes use the campaign's own words for these.
4. **Astra breaks the fiction about equipment.** In the Russian combat scene Astra said «по установленному снаряжению у
   Роуэна есть компас, но оружия не указано» inside the narration. Questions about the sheet belong in a short
   out-of-fiction aside or a clarifying question, never in the story voice.
5. **Astra sometimes ends a turn without `finish_turn`** (Stage 4 known limit): tension and refusal hints are lost on
   those turns.

6. **The off-screen consequence never arrived.** In the Russian blind run's travel scene (cheat at dice, then two days
   east) the owner saw no consequence in any of the four variants. Find out per variant where the chain broke: was a
   plan recorded with a due time in the cheat turn, did the travel receipt list it as due, did the game master act on
   it. Fix the break (the loop, the receipt hint or the doctrine) and prove it live on both models.
7. **Russian voice.** The owner finds the app's Russian stiff and calqued, while the same Opus in his chat campaign
   writes living Russian. Likely causes, to confirm with an A/B: the role and the procedure in layer 1 are English and
   mostly about tools; the only Russian prose in the prompt are the three turn-shape examples, written in translated
   style («проскальзывает внутрь, в запах муки»); narration is cut into pieces by mid-text tool calls; the prompt says
   almost nothing about voice; the synthetic Russian fixture was machine-translated. Do: for a Russian campaign, write
   the role's voice part natively in Russian (not translated), from the owner's codex `docs/owner/DM_CODEX_RU.md`
   (the planner adds it); replace the turn-shape examples with natural Russian ones; keep the narration in one breath
   (only a deciding roll or payment may interrupt it; bookkeeping goes after); keep tool schemas in English. Check with
   the Russian blind scenes: current prompt vs the Russian voice layer, both on Opus high, four key turns each, and the
   planner builds a blind A/B page. Record the result in `docs/runs/` (it is a research finding).
   Two tics the owner flagged in a good turn, to address in the voice text (as positive guidance, not a ban list):
   echoing an NPC's simile back as the hero's own conclusion («Старик на лестнице, точно.» — also the DM deciding the
   hero's thought), and theatrical staccato repetition («— Фланец, — говорит он наконец. — Три месяца. Фланец.»).
   Let NPCs speak like people, once; let the hero's conclusions stay the player's. A third one (turn 12): explaining
   the subtext a line already carries — «— Помпа где. / Это не вопрос.»; the owner: «— Помпа.» says it all. Trust
   the reader: no narrator gloss after a line that already works. Turn 13 (otherwise «очень логично»): (i) a calque —
   «Это уже не греблю ты у меня покупаешь, это голову» (English "it's not rowing you're buying, it's my neck"); a
   Russian boatwoman says «Тут уже не за вёсла платишь — за мою шкуру»; (ii) the DM's ledger leaking into speech —
   «У меня пятнадцать, у Мокея «квиты»» reads like reciting record values; people refer to deals the way people do
   («мне ты и так должен, Мокей своё уже взял»); (iii) a closing menu «Так что выбор у тебя такой: … или …» — the
   owner's codex: options only when the player asks; end on the situation. Collect such pairs (calque → native) from
   the owner's play into the voice examples; they are the best training signal we have. Turn 16: a stiff line in a
   note — «Равная — это от чего, умник? Твоя доля — мой же долг»; and weak humour — «Может, ты от моего имени ещё и
   жениться пообещаешь?». Humour is a known weak spot of models: give 2–3 examples of dry, situational humour from the
   owner's chat campaign and texts he likes (a joke grows out of the situation and the character, it is short and
   never explained). Owner after 16 turns: the narration is «на две головы лучше» the blind samples and on par with
   his chat campaign or slightly better; dialogue is the place that still wobbles. Record it in `docs/runs/`. Turn 20: stage directions explaining the line again — «Это она говорит тебе, не ему.»; the good side of the same
   turn — Marta answers «Отказывать ты не умеешь, так соглашаться за тебя буду я», using the hero's sheet weakness
   («не умеет отказывать друзьям») in character: keep the idea — sheet traits colour how people treat the hero — but
   the owner finds the line «через чур в лоб»: it restates the sheet. Show a trait through what people do, or a hint
   («Ты ж у нас никому не отказываешь, — Марта уже тянется за монетой»), never by naming it; the player knows his
   sheet. Same rule as for subtext: imply, don't announce. Turn 23, a player-agency slip: «— За голову, — говоришь
   ты.» — the DM wrote the hero's line and his conclusion. The narration may lay out what the hero sees and recalls;
   the decision and the words stay the player's («Где искать — решай»). Humour, turn 24: «— Я теперь копна, — сипит
   он оттуда. — Копна, не дыши» — the logic is right, the joke is flat; add to the humour examples. Turn 18:
   «работа по его ремеслу» (stilted; a man says «есть для него работа — водолазная» or «работа по его части»).
   The hero's name keeps appearing lowercase («рэя») because the wizard stored it as typed — fix with the wizard item.

   What the literature and practice say, and how it shapes the work (planner's research, 2026-10-15):
   - Prompting in the target language gives more natural output on language- and culture-sensitive generation for
     capable models (Is Translation All You Need?, NAACL 2025); LLM output in other languages carries an English
     syntactic "accent" (Do LLMs Have an English Accent?, arXiv 2410.15956). → the voice part in native Russian.
   - The prompt's own style leaks into the output; make the prompt look like the desired output (Anthropic prompting
     best practices). → the voice section is itself written as good Russian prose, not a list.
   - Examples are the most reliable lever: 3–5, relevant and diverse, in `<example>` tags (Anthropic). → 3–5 short
     passages of different kinds (dialogue, action with a roll, quiet scene, montage of days, humour), from the owner's
     own campaign and texts he provides; diverse so the model does not copy one pattern.
   - Ban lists and «пиши естественно» barely work and can backfire (Antislop, ICLR 2026; a translationese study found
     explicit naturalness instructions made GPT-4 worse). → describe the voice positively, with the reason behind each
     rule; no long ban lists in the prompt.
   - Recent context dominates the register (the roleplay community's "author's note" practice). → a short Russian
     voice reminder (≤ 120 tokens) in the last, uncached layer next to the player's input, and the last two or three
     turns of the campaign verbatim there, not only as a summary.
   - A second polishing pass reduces translationese (43% → 25% for GPT-4 in that study), but it costs latency. → not for
     live turns; allowed for the session digest, «Ранее в…» and the chronicle.
   - Slop and calques are measurable. → add Russian naturalness metrics to the bench: Latin letters in visible text,
     канцелярит markers («является», «представляет собой», «осуществляет», «данный», chains of participles), sentence
     length variance, and over-represented phrases against a Russian human reference; report them in the A/B.

8. **Use more of the context window (owner: «не будем ей мешать»).** Today the dossier is capped at about 97k tokens
   a turn (`DOSSIER_BUDGETS`: layer 1 7k, layer 2 38k, layer 3 34k, layer 4 18k) plus about 7k of tool descriptions —
   a fraction of what Opus can read. Raise the budgets where more text means better play: the recent scenes verbatim
   (layer 4 scenes 7k → ~30k: also the strongest lever for the Russian voice, see item 7), the exchanges (5k → ~15k),
   the codex (12k → ~30k), the canon (20k → ~40k). Keep the stable parts in the cached layers so the cost stays low;
   the uncached tail is what slows the first word. Measure on a long synthetic campaign (100+ turns) before and after:
   first word, full turn, cost per turn, cache read share, and recall checks (facts from early sessions used
   correctly). Choose the budgets from the numbers; record them in `docs/runs/`.

## The owner's notes from the first play

- **The seeded Stage 4 DM Craft versions cannot be activated.** In the sandbox the six never-approved versions (How to
  run the game v3, Life off screen, The long campaign, A systemic world, Villains with motives…, A world that pushes
  back) sit in «Version history»; «Restore this version» does nothing for them, and the screen offers no other way to
  approve a pending version. Root cause found by the owner's local session: the UI sent `action` inside the data
  written to the database, and the RPC answered 422. Fix and a test that reproduces the 422 are on
  `claude/fix-dm-craft-payload` (commit ae78e9b, from `claude/integration`): merge it first, run its test. Then give
  pending versions a clear «Review and approve» action (with what changes) and show an error when an action fails.
- **New campaign wizard (hero step):** every single item asks for a quantity before creation («Укажите значение перед
  созданием») — default a singular item to 1; «долг в сорок монет трактирщице Марте» became an inventory resource
  instead of a debt in the journal (Stage 4 has the `debt` kind) with Marta as a person; the Astra-only notice («Для
  новой кампании с ведущим Astra… Структурированный RPG») shows although the chosen DM is Opus; and «Создать персонажа
  и кампанию» does nothing with a narrative sheet and no message — apparently the hero step (step 2) applies the Astra
  rule because the DM is only chosen at step 3 and the app default is Astra. Choose the DM before the sheet is
  validated (or validate against the DM chosen in the wizard), and a disabled create button always says why.
- **From the wizard into the first turn the flow breaks.** The wizard's step 4 («Я опишу, где начинаю» with a
  phrase) leads to a game screen that says «Перед первым ходом закончи вступление приключения и настройку ведущего»
  and then to the Adventures screen, which asks again «Во что вы хотите сыграть?» with an empty form: the phrase is not
  carried over, so the owner enters the start twice and does not understand where he is. Carry the wizard's start into
  the adventure draft (or let the wizard's choice create the first adventure) and land on the first turn. Also: the
  campaign name fell back to the hero's name («Кампания · рэй») although the wizard has a name field; a stray «Новая
  Кампания» floats in the Adventures header; the sidebar mixes languages («Skill 0 · Атака 0 · Defense 10»); the clock
  starts at «День 1 · 00:00» whatever the opening scene says. On the Adventures screen the prepared adventure shows
  three overlapping paths at once — an «Начало приключения» box with «Подготовить предложение с ИИ», a dimmed
  «Подготовить Приключение», and «Начать / Изменить / Оставить Приключение» — with no clear next step. Owner: «флоу
  немного странный». Target: one path from the wizard to the first turn — wizard → one review screen (adventure +
  opening proposal together, edit inline) → «Начать» → the game screen with the opening scene; every button that is
  not the next step is hidden or secondary.
- **The opening scene proposal.** Check which model writes it: the Adventures screen says it calls «настроенный ИИ»,
  which in the sandbox is the app default (Astra), not the campaign's DM (Opus high). The opening must be written by
  the campaign's DM in the campaign's voice. The first proposal was thin: it reused the world text verbatim («пахнет
  смолой и жареной рыбой»), used semicolons the English way, and ended on a report line («предложение остаётся без
  ответа») instead of a situation; Marta got one good line («за напоминания я пока не беру») but no look or gesture of
  her own. Use the Russian voice layer (item 7) for the opening too. Approving it needs a checkbox and a button — one
  confirmation is enough. The hero's name is shown as typed («рэй»): offer the capitalised form in the wizard.
- **Pictures: two paths, one of them off (serious).** Stage V pictures work (the hero's figure and the item icons
  were drawn on fal), but every older picture button still goes through the legacy path and says «Создание
  изображений локально не включено»: Map → place illustration and «Создать карту» (atlas), Party → a person's
  «Перерисовать портрет» / «Создать портрет». One picture path for every button (the Stage V store on fal, in the
  campaign's style, priced, within the daily cap); no button that cannot work. A named person met in play (Marta)
  should get a portrait without a click (see §7 of STAGE_V).
- **«Кадр сцены» opens the old FRAME panel and does not work (serious).** The button under the composer shows the
  legacy FRAME block: «FRAME · проверить эту сцену», «Для изображений нужны включённая модель и лимит расходов. Запрос
  на изображение не отправлен.», «Образцы внешности», «История FRAME и восстановление», and the legacy video block
  («Примите FRAME текущей сцены…», «Создание видео недоступно…»). Same root as the two picture paths: «Кадр сцены»
  must act on the Stage V frames panel (draw or redraw the current frame); the legacy FRAME and its video block leave
  the player's screen (video comes back with the video stage, built on Stage V frames).
- **«Скрыть» on the live frame does nothing.** It must hide the frame of this turn (and «Показать» bring it back),
  as Stage V specified; add a test.
- **«Ещё · бой, отдых, сессия, записи и правки» is an editor's toolbox on the player's screen.** The owner: «выдаёт
  какой-то треш… может быть полезно, но я не понимаю, что это». It mixes player actions («Закончить сессию», «Лагерь и
  отдых», «Что я знаю?», «Записать заметку») with editing tools («Правка точки продолжения», «Добавить запись в
  стенограмму», «Исправить запись истории», «Заметка владельца… Записано с редакцией настроек 2»). Split it: player
  actions as a few clear buttons with one plain line each; the editing tools move to a separate «Редактор кампании»
  (owner mode) with an explanation of what each does and when you would need it.
- **Named things the player can look up.** The owner forgot what «Сельдь» was (Yan's sunk boat, from turn 2) and asked
  in play «селдь, какая селдь?»; the DM answered in the fiction, which is right, but the player had nowhere to check.
  Named ships, objects and places mentioned in a quest («Сельдь», «Ящик в смолёной парусине») get a codex entry the
  moment the DM records them, and quest text links to them.
- **The codex is only about people; make it about the whole world.** The DM records places (Понтонный рынок, Чёрный
  волнорез as a rumour), but the codex shows only people and factions. Owner: «кодекс — это про всё». Tabs: Люди ·
  Места · Фракции · Мир (история, обычаи, законы) · Технологии и магия · Существа · Слухи · Реликвии и предметы. Each
  entry keeps what works today — what the hero knows, from whom («знает только по рассказу Марты»), when first met, a
  pin for the DM. Places link to the map; rumoured places are marked as rumours. Lore the hero learns in play becomes
  an entry: give the DM a public `lore` record (category, title, what is known, source) or extend an existing tool,
  never exposing private notes; the world's own description seeds the «Мир» tab at the campaign start.
- **«Закреплено для ведущего» reads as an admin panel** in the codex and the journal. Keep the feature, change the
  form: a small pin on any entry with a tooltip «Ведущий всегда будет это помнить»; a pinned entry shows the pin; the
  list of pins and its explanation move to the campaign settings («Что ведущий помнит всегда»). No empty «Пока ничего
  не закреплено…» panels on player screens.
- **Map: places are recorded but not shown where they belong.** Good: the DM's places reach the map's records
  (Кабак Марты, Понтонный рынок, Чёрный волнорез). Not good: (a) they sit at the «Мир» level and only the tavern has a
  marker; Понтонный рынок is in «Известные места без меток», Чёрный волнорез nowhere on the map. Places need a parent
  and a rough position: the DM records the parent («Скрипучая Гавань») and a relation in words («на краю гавани», «у
  понтонов»), the app lays the markers out by itself (deterministic layout around the parent, no manual placing), and
  a rumoured place shows as a dashed marker «слух». The map opens at the level where the hero is (here the town), with
  all its known places together. (b) «Создать карту» (atlas background) does not work — same legacy picture path;
  draw it through the Stage V store in the campaign's style. (c) The page is full of editor sections: «Изображение
  атласа для этого уровня», «Известные места без меток», «Открытые места», «Изменить размещение на карте», «Места, где
  вы дома» (with «Общий тайник кампании»), «Изменить / Исправить записи» («Перемещение и расчёт маршрута не
  подключены»), «Инструменты «что, если»». The player's map is the map, the place card on tap and «Наметить курс»;
  holdings go to «Лагерь/Имущество», editing and placement to the «Редактор кампании», «что, если» to the library.
  (d) **Levels «Мир / Регион / Окрестности» are empty abstractions.** Every place sits at «Мир»; «Регион» and
  «Окрестности» say «нет известных мест с метками» and send the player back to «Мир». Replace the fixed three levels by
  the place hierarchy itself: breadcrumbs from the world down to where the hero is («Ржавое побережье › Скрипучая
  Гавань › Кабак Марты»), each level showing its child places as markers; the map opens on the hero's parent place
  (the town). A level with one known child shows that child, never an empty map with a redirect.
- **«Что, если» (Мастерская мира) — leave the feature, fix the entry.** It is the original repo's What-If / D2B lab
  (a non-canon branch of the world from a saved moment), kept for the research track and a later stage; not part of
  this polish beyond: (a) the «Ещё» menu items open it as a separate screen with its own wording — fine, but it must
  not appear inside the map; (b) its start point reads «After Astra-primary takeover» — an internal label; show the
  turn or save in words («после хода 3, Кабак Марты»); (c) say in one line what it costs and that the campaign is
  untouched before the first paid call. A full review of the lab comes with its own stage.
- **The «Ещё» menu** (Сессии, Сейвы, Хроника и линии времени, Мастерская мира, Чат с ведущим, Галерея, Визуальная
  библия): keep it as the place for secondary screens, but each opens a page in the same look as the main ones, with
  one plain sentence of what it is for. «Визуальная библия» and «Галерея» overlap with the Stage V picture workshop —
  merge into one «Картинки» page.
- **Rolls (turn 4, a fair d20 18 vs DC 13, server crypto RNG): working, but rough.** (a) The roll card after the
  pause reads like a form: «рэй · Проверка навыка», «Посмотреть записанную проверку», «Запросить разрешённый
  переброс», «Продолжить с этим результатом», «Другие действия». Show it as a moment in the story: the reason in words
  («Оживить компрессор Гильдии»), the die and the number big, success/failure, DC when the hero could judge it; one
  button «Дальше»; reroll only when a rule grants it. (b) The die animation: a real tumbling d20 (3D or a good 2D
  spin) that lands on the face, with a natural 20 / natural 1 flourish, as in the owner's chat registry; respects
  reduced motion. (c) The record modal's close button says «Близкий» — a machine translation of «Close» in
  `src/lib/locales/ru.json`; sweep the Russian locale for other machine-translated strings. (d) The chip «рэй rolls
  1d20: 18 vs 13 — success» in English (see the receipts item). (e) «Модификатор: 0» on a skill the hero has
  («Знание старой техники») — the stub profile again; the modifier must come from the sheet.
- **«Твой момент» appears without saying which moment.** The banner «Ведущий отдал тебе кульминацию: опиши, как ты это
  делаешь. Результат броска уже принят — твои слова станут каноном» came on a quiet walk to Мокей's pontoon; the owner
  could not tell what to describe or which roll. The banner names the moment and the result in words («Ворот Мокея ·
  получилось — опиши, как ты его оживляешь»), links to the roll, and sits right under the paragraph that sets it up.
  Doctrine: «Как ты хочешь это сделать?» is for climaxes (finishing an important enemy, the decisive act of a scene,
  as in the owner's codex), not for every success; the DM should use it rarely.
  **Worse: there was no roll at all** — the banner claimed «Результат броска уже принят» on a turn without a roll, so
  the player was asked to describe an outcome nobody had decided. The flow must be: the player acts → a roll in a tense
  or climactic scene resolves → on a success that decides the scene, the DM may hand the description to the player →
  the player's words become canon. Enforce it on the server: `finish_turn.playerMoment` is accepted only when this turn
  has a resolved player-visible roll (success) and the scene is tense or climax; otherwise the flag is rejected with a
  reason to the DM and no banner shows. The Stage V key-moment [pro] re-render follows the accepted flag only. Add a
  test for both cases. Second occurrence, turn 27: the banner came after a **failed** roll (natural 1 vs 11) on a
  non-combat step, exactly where the player would write his next action anyway — the test must cover «failure → no
  banner». Third occurrence, turn 28, again after a failure (6 vs 12): the banner now shows on most turns with a roll.
- **Lost is not used.** The knife slipped into the silt: «рэй uses нож (0 left)». Losing, dropping, breaking and
  pledging are their own outcomes in the item record and in the summary («Потерян: нож — ушёл в ил»), so the codex
  and later turns can say where a thing went.
- **Item change shown as two events.** The shirt's change was recorded as «рэй uses рубаха Яна Колоды (0 left)» +
  «рэй gets рубаха Яна Колоды без подола». Keep the mechanism if it is simplest, but the player sees one line
  «Изменено: рубаха Яна → без подола», and the item keeps its picture versions and history.
- **Rolls ignore the hero's skills, situation and gear (major).** The dive (the hero's core skill, «ныряльщик
  Гильдии», «хорошо плавает») was rolled 1d20+0 vs DC 12 with no advantage. On a narrative ruleset the sheet has no
  numbers (stub profile), so every modifier is 0. Rules: (a) a skill or trait named on the sheet gives a bonus (the
  ruleset's own value, or +2/+4/+6 by proficiency in words: умеет / хорошо / мастер) — the DM picks the matching
  `modifierField` or passes the skill name, and the server resolves the bonus; (b) the DM grants advantage or
  disadvantage from the fiction (prepared gear such as the resin gloves, help from Мокей on the line, clear water vs
  silt) and says why in the roll reason; (c) difficulty follows a stated ladder — лёгкая 8 · обычная 10 · трудная 13 ·
  очень трудная 16 · почти невозможная 19 — and an expert doing his trade in fair conditions gets «обычная» or no roll
  at all (the owner found 12 for a guild diver's dive too high); (d) the roll card shows the reason, the bonus and its
  source («ныряльщик +4»), advantage and why, and the DC in words. Test with a narrative-ruleset campaign.
  More evidence (turn 12): the player wrote «используя инструменты и прошлый опыт починки в качестве бонуса», the DM
  rolled 1d20+0 vs 13 again. The `roll` tool already accepts `formula` with a modifier and `advantage`, so this is
  doctrine plus data: (e) add `bonuses: [{ source, value }]` to `roll` (tools +1/+2, a trained skill, help, prepared
  gear) — the server adds them, caps the total by the ruleset, and the receipt lists each source; (f) the doctrine
  says it plainly, with the reason: when the fiction or the player gives a fair reason for a bonus, apply it, and when
  you refuse one, say why in one short aside; (g) a bench check: a scenario where the player names his tools and his
  trade, expecting a non-zero bonus or advantage.
- **A roll the player cannot read (turn 16).** The chips show «The DM rolls 1d20: 15» with no reason, no DC and no
  card; the owner guessed it was a persuasion check. Rule: a check of the hero (persuasion, any skill) is a player
  check with its card, reason, bonus and DC in words; a private DM roll (an NPC's reaction, a random event) never
  appears in the player's chips at all. Test both. Turn 33 shows why it matters: «Чужак в сухом пальто rolls
  1d20+2: 14 vs 11 — success» appeared with no reason while the hero bluffed with an empty belt; the narration said
  only that Фрол saw a hand under the coat. The chip tells the player that the stranger succeeded at something —
  likely seeing through the bluff — which is exactly what the hero must not know. NPC rolls are private by default.
- **«Проверка навыка» — which skill?** The card and the chip say only «Проверка навыка» / «рэй rolls 1d20: 6 vs 12 —
  failure». The title names the skill or the approach in the campaign's words («Скрытность: подслушать через щель»,
  «Убеждение: уговорить Мирона»), and the DM must always pass it (the `roll.reason` exists; make the card use it).
- **Items gained and lost must stand out.** The owner had forgotten the pistol was pledged to Dunya and saw it
  missing; the DM handled it correctly («пистолет у Дуни под кормовой банкой, это залог»). Every turn summary — even
  collapsed — leads with item and money movements in plain words: «Получено: записка на обороте счёта Яна»,
  «Отдано: гарпунный пистолет → Дуне (залог)», «−1 монета Дуне». The inventory shows pledged or lent items greyed with
  «у Дуни, залог» instead of silently removing them.
- **The «Кубы» button opens a hint panel nobody understands.** «Быстрые броски: Плавание / Вскрытие замков / Знание
  старой техники / Своя формула — Кубы бросает сервер, ведущий решает, нужна ли проверка. Кнопка только подсказывает
  текст хода.» Replace it with the registry's dice tray: a free roll the player makes himself (any dice, a reason
  line, advantage/disadvantage), logged in the turn and visible to the DM, plus quick skill checks from the sheet
  with their bonuses that send «Пробую: <навык>» as the action. One plain sentence of help, no system talk.
- **A record mistake: removing ≠ using up.** The player «took off» the resin gloves; the DM recorded «рэй uses
  смоляные рукавицы (0 left)» and the gloves vanished from the inventory. Taking off, putting away and giving are not
  consumption; the doctrine and the tool description say so, and `item use` on a non-consumable asks for a reason.
- **Healing.** Turn 14 showed the DM does heal when the story gives a reason — Dunya washed the cuts with spirit and
  bandaged them (HP 8 → 9) and charged a coin, added to her debt (15 → 16). Keep that. Still missing: rest (short/long by ruleset), first aid
  in the fiction (Мокей's resin, a bandage) as a DM-recorded heal, and the camp/rest action; the DM restores HP when
  the story gives a reason, and time passing with rest heals by the ruleset's rule. Show it in the receipts.
- **«Запросить разрешённый переброс» works**, but explain when a reroll is allowed (a rule, an inspiration-like
  resource) right on the card; never offer it when it is not.
- Good, keep (turns 9–11): the player's improvised resin gloves became an item with a fitting description and a
  drawback (sticky, no fine work, cut already); the gear from the silt is an item «Бронзовая шестерня ворота Мокея»
  with a precise note; Мокей's first aid and «Должок Мокею» recorded as a promise.
- **Item cards: a wrong word in the note.** «Чужая Мокею» on the gear: the DM meant «не родная для этого ворота»
  (foreign-made), but in Russian it reads «it does not belong to Мокей». Add to the voice item: possessive and dative
  ambiguity in short notes is a frequent model slip; short item notes are checked like narration.
- **The frame strip does not open older frames.** Clicking a thumbnail under the frame shows nothing; it must open
  that frame large (a lightbox with the turn's first line, «←/→» through the frames, Esc to close). Also: a frame
  painted readable text on the machine («GUNEWGX GUILD») although prompts forbid text — add a short negative
  («no lettering, no logos») to the frame prompt and drop the word «Guild» from object descriptions when possible.
- **Anchors get an anatomy check before acceptance.** The hero's full-figure anchor has three hands, and «Принимать
  готовые сразу» accepted it. The vision check that gates auto-accept also checks anatomy (limbs, hands, faces) and
  sends a failing anchor to review instead.
- **Owner after 30 turns: «0 галлюцинаций и забываний»** — no invented facts, no forgotten debts, items, promises,
  signals or terms across one long session. Record it in `docs/runs/` as the session-1 baseline; the long-campaign
  checks (item 8) must keep it at 100+ turns and across sessions.
- Good, keep (turn 30): long-range memory — Dunya: «Не стрелял. Значит, шестнадцать» (the pledge terms from turn 7:
  sixteen coins if the pistol is used, otherwise as agreed); the owner had forgotten, the character had not.
- **A natural 20 must change the outcome visibly.** Turn 29: the hero rolled a natural 20 to dodge and call for help;
  the narration resolved the scene through Dunya's own roll (she shoved the boat off with the gaff) and the hero's
  shout stayed muffled in the helmet. Good drama, but the player's best roll of the session left no mark of its own.
  Doctrine: a natural 20 gives the success plus a visible extra in the hero's favour (a seized oar, the enemy's hook
  lost, a better position), and a natural 1 a cost — both tied to what the hero tried. The roll card says «Крит» /
  «Провал на единице».
- Good, keep (turn 28): a failure that costs the right things — the knife lost in the silt, the palm cut on mussels
  (HP 7 → 6), the box still won; and an off-screen plan turning into a twist at the climax: the stranger's boat comes
  without the agreed three knocks, Фрол on the bow with a hook — «Ящичек сюда подай, легче лезть будет». Also a
  balance note: after six failures at +0 the hero is at 6/10 HP; with sheet bonuses this attrition would be rarer.
- Good, keep (turn 33): the player forgot the pistol was with Dunya and reached for it; the DM remembered («Пояс
  пустой. Пистолет сейчас за поясом у Дуни на кухне, нож остался в иле») and turned it into a bluff that still works
  on Фрол — the wide borrowed kaftan hides the empty belt.
- Good, keep (turn 31): the note under the shirt got soaked on the dive and became «Размокший листок из Мартиных
  счетов» — the hero's own writing ran into blue clouds, only Marta's and Мирон's lines survive, and the DM's note
  says «почти не улика: ни имён, ни места не прочесть». A consequence of the fiction changed an item's meaning.
- Good, keep (turn 27): **an item changed with the story** — the borrowed shirt became «Рубаха Яна Колоды без подола»:
  new name, a description of how and why (the hem cut on the bottom to wrap the leaking hose; Marta billed it to
  Yan's debt), a state note («мокрая, подола нет; полоса намотана на шланг помпы») and a redrawn picture. Make sure
  the redraw happens only when the visible state changes, and the old picture stays as a version.
- Good, keep (turn 26): after the interactive roll pause («Продолжить с этим результатом») the continuation came with
  full narration — item 1 did not reproduce here; the failure cost HP (10 → 8) and left a leaking patch; two
  off-screen plans resolved as the patrol boat passed overhead and moved on, heard through the water. Owner: «для
  тестовой кампании так вообще супер». Word slip: the HP chip says «Угар» for air starvation in a diving helmet
  (угар is carbon-monoxide poisoning from a stove); «удушье» or «нехватка воздуха».
- Good, keep (turn 25): suspense built without a roll (the snagged hose, thinning air, the patrol lantern as a
  clock) and the agreed signal from two turns earlier used exactly («по уговору Мирон должен спросить „как ты?“»).
- Good, keep (turns 21–22): money stays consistent across 20 turns (the 16 coins to Dunya, the crew's five each paid
  later by the stranger, «Пятёрки экипажу от чужака» recorded as a promise); facts stay consistent with the quest text
  (six fathoms on the seaward side); the pledged pistol comes back only when Dunya gives it; the DM handles the
  player's confusion inside the fiction. Owner: «не думал, что с первого раза дойдём до 18-го хода без критических
  багов… и проверки, и интересно», and the world is not D&D — a free ruleset played consistently.
- Small word choice: «Дуня отваливает» is correct nautical Russian (отвалить от пристани) but reads as slang to a
  general reader; prefer the plain word («отчаливает») unless a character speaks it.
- Good, keep (turn 18): a short rest («перекемарю до дела») became a 300-minute short rest with HP 9 → 10, no roll;
  and the **off-screen plan fired** — «1 plan(s) due», «DM plan resolved»: while the hero slept, the man in the dry
  coat came to Marta's, heard Мирон's snore through the floor and offered the hero double pay. This is item 6 working
  in live play (the blind travel scene failed); compare the two to find what the blind scene lacked.
- Good, keep (turn 8): a natural 1 played as «fail forward» — the gear slips through a gap into the water, the hero
  skins his knuckles (HP 10 → 9, shown everywhere: sidebar, sheet, receipt), and the scene now asks for a dive, the
  hero's own skill; the pistol given to Dunya as a pledge left the inventory; the debt «Пятнадцать монет Дуне» joined
  the journal.
- **Owner's verdict after 14 turns** (record it in `docs/runs/` for the research track): «самое важное работает
  весьма неплохо концептуально» — no Mary Sue, the world is realistic without being a misery simulator, rivals appear
  on their own (the man in the dry coat now asks around for a boat to the breakwater), costs are honest (healing for a
  coin, extra risk for extra pay), atmosphere holds, no invented words; the remaining issues are small speech slips
  and the interface. After 24 turns the owner compared it with a commercial AI RPG he knows («AI Realms»): «уделывает
  с головой — гораздо больше похоже на D&D-приключение, а не на симулятор спасения мира». Protect these in every later change: the bench should carry a «no Mary Sue» and «honest cost»
  check on the loop scenarios.
- Good, keep: the place header redrew itself when the hero moved (Понтонный рынок in the same style), the frame
  shows the hero with his face from the portrait, the DM asked for a roll exactly where it made sense.
- **Item descriptions.** The DM writes them with some invention, scaled by rarity: an ordinary thing gets one good
  line; a rare, unique or legendary thing gets a short story (where it came from, who held it, what it is known for).
  Today the harpoon pistol card says only «на один выстрел».
- **Page width.** The character and inventory screens use about two thirds of a wide screen and leave the right
  third empty (owner's screenshot at ~2000 px); the game screen fills it. Use the same content width on every campaign
  screen, and let the doll and the grid grow with it.
- **Character and inventory collapse on a non-5e ruleset (major).** The Stage 5 screens were tuned on the 5e sample
  («Мир Шва»: slots around the figure, «185 Золото», filters Надето / Доспехи / Расходники…, skills with bonuses,
  party portraits). On the sandbox campaign («World Logic» ruleset, narrative hero) almost all of it is gone:
  - **no money anywhere** — the hero owes Marta forty coins and nobody can see what he has. A wallet always exists
    (0 by default, the world's currency name), the wizard asks or derives the starting money, the DM records changes;
  - **no paper doll** — «У этого персонажа нет мест для снаряжения». Universal default slots for every ruleset
    (голова, шея, тело, рука, вторая рука, пояс, ноги, обувь, спина), and starting items equipped where they belong
    (пистолет — в руке, нож — на поясе, шлем — в руках или на поясе, по описанию);
  - **the backstory is not shown** — what the owner wrote in «Кто вы?» appears nowhere on the character page except a
    one-line subtitle; add a «Предыстория» block (the original design had a Background tab);
  - only «Всё / Вещи» as filters, no «Надето»; skills without any measure; the figure small in an empty panel — in the
    design the figure is the centrepiece, large, with the slots around it (`design/02_character_inventory.png`);
  - labels mix languages (SKILL / АТАКА / DEFENSE); the six ability scores are flat 10s from the stub profile.
  Rule for the fix: the character and inventory screens are complete for ANY ruleset — figure, slots, wallet, items
  with filters, backstory, traits, conditions — and show numbers only where the ruleset has them. Recapture both
  screens on the narrative sandbox campaign as well as on the 5e sample.
- **Journal does not show the obvious goal.** The opening is about a debt of forty coins to Marta and her job offer,
  yet the journal says «Цели пока нет», «Долгов и обещаний пока нет». The opening (or the first turn) records what the
  hero already knows: the debt as a `debt` to Marta, her job as an offered quest or thread, the goal «отдать долг».
- **Player screens show system text.** Owner: «вылезла админ панель». Explanations such as «"К тебе" — только то, что
  герой мог заметить сам. Тайные мысли спутников видит один ведущий…», «Ещё · прежний экран и правка записей», combat
  stats on a tavern keeper (Марта: ХИТЫ 8/8, SKILL 0, АТАКА 0) read like an admin panel. Keep player screens in the
  fiction: explanations behind a small «?», editing tools behind «Ещё», stats only for people the hero fights or leads.
- **Broken-image fallback letters.** An initial letter shows at the top-left of an empty picture box and overlaps
  badges («К» over the scene header, «М» under «РЯДОМ» on Marta's card). Use a proper empty state.
- **First real turn (Opus high), owner's notes.** The narration of the first turn is good living Russian (Marta
  sits down, the stool creaks, the dockers argue about herring, Ян Колода and his sunk «Сельдь», «саженях в шести»),
  so the weak text was the opening proposal, not the DM. The DM recorded the debt, a new person, a rumoured place and an
  off-screen plan. What to fix around it:
  - **The style differs between pictures.** The place header (Кабак Марты) and the hero are photo-like, the first
    live frame of Marta is a bright comic. If the owner changed the style after the anchors were drawn, the old anchors
    stay in the old style until «Перерисовать в новом стиле» is pressed — so at a style change ask right there
    «Перерисовать опорные картинки в новом стиле? ≈ $X» (yes by default when the campaign has few anchors). If he did
    not change it, find why the anchors and the frames used different styles.
    Found: the campaign started with a default world look «Cinematic noir» (photo-like, the owner likes it — the
    hero, the tavern and the items were drawn in it), which is not a Stage V style version and not a preset. When
    «Линейный рисунок» was picked, Stage V created «стиль мира · v1» and new frames followed it, while the anchors
    stayed cinematic; the screen says «Версии стиля (1)», so the owner cannot tell that the style changed. Fix: the
    starting look is a real version v1 with its text, shown like any other; picking another makes v2 and asks about
    re-rendering; add a «Кинематографичный» preset with the default text.
  - **«Что изменилось за ход» is in English and shows the DM's private work:** «Марта updated», «Ян Колода recorded
    as a character», «Place recorded: Чёрный волнорез (a rumour)», «Debt recorded: …», «Марта's character notes
    started», «DM note updated», «DM plan updated», «10 minutes pass (…)». Chips follow the campaign language and show
    only what the hero would notice (новый человек, слух о месте, долг записан, прошло 10 минут); notes, plans and
    character models never appear to the player.
  - **No timers.** The owner dislikes the adventure pace badge «НА ВЕЧЕР · 3–5 Ч» with «0 ч 10 мин в мире» and the
    ticking «День 1 · 00:10»: it reads as a countdown. Remove the badge and the minutes from the game screen; the
    header says the time of day in words (утро, полдень, ночь), as the registry did.
  - **«Открытые нити» is jargon.** The player sees «Цель» (here: отдать Марте сорок монет — the DM sets it when the
    goal is obvious), «Долги и обещания», and «Зацепки» for open leads (Ян Колода, ящик у Чёрного волнореза). The
    `thread` kind stays inside the records; the word «нити» does not reach the player.
  - **During a turn two indicators and a stray «Другие действия».** «DM обдумывает ответ…», then a collapsible
  «Другие действия» and «ведущий пишет… (черновик до сохранения)» all show at once. One quiet indicator «Ведущий
  думает…» → the text streams; nothing else between the player's line and the story.
- **The goal panel ignores the quest the DM recorded.** After turn 2 the DM took «Ящик с «Сельди»» as a quest with
    its reward (Marta forgives the forty coins and feeds him for a week), yet «Цель» still says «Цели пока нет». The
    active quest (or the one the hero just took) is the goal unless the DM sets another.
  - Journal after turn 2 (good): the quest «Ящик с «Сельди»» with the deadline (two days, before the customs divers),
    the patrol boat at night, Marta's yawl and rope, the reward; the debt «Сорок монет Марте» linked to the quest. To
    fix there: «Reward:» is English inside Russian text and a double full stop «..»; the goal repeats the quest's text
    word for word (show the goal as one line with a link); «Главная арка» and «Выполнено · 0» are empty boxes at the
    start — hide empty sections.
  - **Text sizes in the composer.** What the player types (and his own message in the story) is much smaller than
    the narration; use the same reading size as the story text. «ведущий пишет… (черновик до сохранения)» is a
    technical label — show a quiet «Ведущий пишет…» indicator instead.
  - **The composer is too heavy.** (a) «Кому: Миру и ведущему» is a one-option selector when no companion is near:
    hide it then; with companions present, the addressee comes from the text («Тамсин, …» or «@Тамсин») with a small
    chip showing who will answer, not a permanent row. (b) «Кубы», «Вопрос ведущему», «Кадр сцены», «Важный ход» become
    small icon buttons in one row inside the composer, next to «Отправить», each with a tooltip in plain words.
    (c) **No «Важный ход» button — the DM decides the depth himself** (owner: «модель достаточно умная, пусть сама
    решает, когда подумать глубже; кнопка ломает иммерсивность»). Stage 4 already lets the DM set the next turn's
    depth through `finish_turn.nextTension` within the campaign's depth range; make that the default: every new
    campaign gets the range high…xhigh (Opus) and the button leaves the composer. Close the gap that the DM can only
    raise the depth for the NEXT turn: when the player's input itself opens a decisive moment (an attack, a jump, a
    confession, a bargain with stakes), a cheap pre-turn check on the input (rules first; a tiny model only if rules
    are not enough, within ~300 ms) may raise this turn's depth inside the range. Record the chosen depth and its
    reason in the turn record for the research track. The depth range stays in campaign settings. Owner noticed two
    turns «чуть медленнее обычного» (tense negotiations) and could not tell why: show one quiet mark in the collapsed
    turn line when the DM thought deeper («⚡ думал глубже · 28 с»), nothing more. Also report per turn in the sandbox
    log: effort, first word, full turn, model requests, cache read share — to separate deep thinking from extra tool
    rounds or cache misses. The owner feels turns slowing down slightly as the campaign grows (turn 23). Likely
    cause to check first: layer 3 (the dossier: codex, journal, character models, plans, notebook) changes almost
    every turn, so its cache breaks every turn and the uncached part grows with the campaign. Measure cache read share
    per turn on the sandbox campaign; if it falls with the turn number, split layer 3 into a stable part (world,
    people's core models, older journal) and a small «this session's changes» tail placed after the cache breakpoint,
    and refresh the stable part only at session end or when a budget threshold is crossed. Data point, turn 25: a
    tense turn with no roll and little bookkeeping came fast — so time also follows interactive roll pauses and
    tool rounds; the per-turn metrics above must show which. (d) «DM обдумывает ответ…» → «Ведущий думает…» (Russian, no «DM»).
  - **«Что изменилось за ход» collapsed by default.** One small line under the turn, «Изменения за ход · 6 ▸», that
    opens the chips on a tap; closed again on the next turn. (Plus the Russian wording and the hidden private items
    above.)
  - **Owner, after three turns:** «язык удивительно хороший, сильно лучше, чем в тест-образцах; скорость — просто
    топ». Evidence for item 7: with the owner's own world text written in living Russian, Opus high writes living
    Russian; the blind fixture's machine-translated world dragged the register down. Keep this in the research record.
  - **Remove the «Приключение» card from the game sidebar** — it breaks immersion; adventure management lives in the
    «Приключения» section of the left menu.
  - **The story is squeezed (owner, twice).** It sits in its own inner scroll box between the frame and the strip on
    top and the composer below (nested scrolling, arrows, «К последнему ходу»), so only a few paragraphs fit. The
    story is the main thing on the screen: one page scroll; the stage (place + live frame) at the top scrolls away
    with the story and the strip of earlier frames moves into the chronicle or a small «Кадры» button; the composer
    is compact (one or two lines, grows while typing) and sticks to the bottom; at 1440×900 at least 15 lines of
    story are visible while the composer is open. See also the one-stage layout in STAGE_V §7.
- **A record the story never mentions (turn 6, «Мокей recorded as a character»).** The player asked for a second,
  quiet oarsman; the narration answered about Dunya and the pistol and never named anyone, yet the chips show «Мокей
  recorded as a character» and «Мокей's character notes started». Two problems, find which one happened from the
  turn's stored model messages: (a) **narration lost** — text the DM wrote after a tool result (same family as the
  silent continuation after a roll, item 1) did not reach the stream or the saved turn; or (b) **the DM created the
  person ahead of the story** (an off-screen plan) and the receipt chip **revealed a person the hero has not met**.
  Evidence from the next turn points to (b): asked again, the DM introduced Мокей in full (сетевяз с крайнего
  понтона, broken capstan, «говорит за неделю меньше, чем Сапог за минуту») — he had prepared the person a turn early
  and the chip showed it. Still verify (a) from the stored messages.
  Fix both regardless: every text part of every model message in a turn reaches the player and the saved turn, in
  order; a test with a tool call between two text parts. A new person created this turn appears in the player's
  chips and codex only if the narration names them (or the hero has met them); otherwise the record stays private
  until the meeting. Also «Looked up money»: the DM had to query money because the context has no wallet (see the
  character-screen item); with a wallet in the dossier this lookup disappears.
- **The sidebar hero card shows «Skill 0 · Атака 0 · Defense 10».** Mixed languages and meaningless stub numbers on
  the most visible card. Show what describes this hero: his trade and two or three best skills in words («ныряльщик ·
  механик · замки»), conditions when there are any (порезы, удушье), and numbers only when the ruleset has real ones —
  in Russian (Навык / Атака / Защита). Same source as the roll bonuses: once the sheet has real values (see the rolls
  item), the card and the rolls agree.
- **The structured combat profile in the wizard is a stub:** English labels in a Russian UI (HP, Attack modifier,
  Defense, Skill modifier), flat defaults (HP 10, 0, 10, 0) not derived from the hero's description, and «Без оружия»
  although the hero carries a knife and a harpoon pistol (weapons are not offered from his own items). Owner: fine for a
  test, not for the release. Derive a proposal from the hero (the DM drafts it, the owner approves), Russian labels,
  weapons picked from the starting items.
- The DM Craft screen is English in a Russian setup; the Russian wording of the cards is model-written. Rewrite the
  Russian texts of the doctrine and cards natively as part of item 7.

## Later, not in this stage (owner's backlog)

- **Weight and carrying.** Item weight, carrying capacity from strength (or the ruleset's own rule), containers that
  change it (a magic bag), and the DM using it when it matters. The owner: a convention is fine for now («мы не в
  симулятор водолаза играем»); design it with the ruleset work, not here.

- **Picture models: a separate parallel stage, `docs/stages/PICTURE_MODELS.md`** (blind bake-off, Seedream included).
  The adapter of the winner is merged here afterwards.
- **Stronger picture models to test (owner asks for «модель помощнее»).** Turn 18 drew the hero bare-chested although
  he had just put on Yan's shirt (clothing state and identity drift). Add to the experiment, through the same Stage V
  store and price/cap: Google's Nano Banana Pro / Nano Banana 2 on fal (`fal-ai/nano-banana-pro/edit`, up to ~10
  reference images, strong identity and clothing consistency per vendor and third-party comparisons; ~$0.08+ per 1K
  image) and OpenAI GPT Image 2 (up to ~10 references, best when people handle machines or text). Check current
  endpoints, limits and prices first. Owner's rule: quality decides, price only within the cap; frames may stay on
  the fast model while anchors and key frames go to the winner. Clothing and visible state (wounds, bandages, a
  shirt on or off) come from the hero's current items and the last turns, passed in the shot.
- **Picking «OpenAI» for anchors breaks all pictures.** «Кто рисует анкеры → OpenAI» routes to the legacy
  subject-visual path, which says «Рисование не настроено на сервере (нет ключа, модели или бюджета)», and frames stop
  too. Remove the legacy choice; if OpenAI images are wanted, they become one more model in the Stage V store (GPT
  Image 2), selected per tier, with the same key check and cap. A setting must never switch the app to a path that
  cannot work; show why a choice is unavailable instead.
- **Character consistency, a focused experiment (owner: «работает спорно; стиль держит хорошо — с этим ещё покурим»).**
  After 11 turns the style is stable across every frame, but the hero's face and age drift (younger and clean in one
  frame, older and gaunt in another), and scene facts drift too (rain on a frame whose turn says the sun is rising).
  A short paid study, not a guess: (a) when the hero is in the shot, pass both his portrait and his full figure as
  references and his appearance text (age, hair, stubble, build, clothes) from the approved anchor; (b) compare, on the
  same 20-turn scene: [klein] 9B as now · [pro] for frames with named people · an identity-preserving path on fal
  (check the current catalogue: Kontext / PuLID-type face reference, or a per-campaign LoRA of the hero trained from
  his anchors); (c) a vision check of identity on every frame with a named person, and one automatic redraw below a
  threshold (within the daily cap); (d) time of day and weather come from the world clock and the narration, not
  invented by the shot model. Report people scores, latency and price per variant; the owner picks by looking at the
  frames side by side.

## Port from the owner's chat registry «Железная Бабка»

The owner's chat campaign had a hand-built registry page (a claude.ai artifact the planner made; it reads from its own
small database). The owner compares the app's screens with it. Bring into the app what it does better, on real
records, for any ruleset (numbers only where the ruleset has them):

- **Paper doll with 12 slots** in three groups: left — голова, шея, талисман, тело, плащ; right — основная рука, вторая
  рука, кольцо I, кольцо II, руки (перчатки); bottom row — пояс, ноги. Each slot: an icon of the item coloured by
  rarity, the slot label, the item name; an empty slot is dashed «пусто». Attuned items carry «✦» and a violet edge;
  a counter «Настройка N/3» when the ruleset has attunement. Without a picture the centre shows a blueprint figure
  (a line drawing with a scale mark), never an empty box.
- **Hit points** as a gauge that turns amber at half and red at a quarter; owner correction buttons −10 −5 −1 +1 +5 +10
  «Полные» (recorded as an owner correction, visible in the turn history).
- **Resources** as pips the owner can tap, each with its recovery rule under the name («возвращается после долгого
  отдыха», «короткий отдых: +2 очка»).
- **Vitals** tiles (КД, скорость, мастерство, КС/атака) and **stats** with score and modifier; saves and skills in two
  columns; **Особенности** with a one-line description each; **Досье** (backstory).
- **The item card opens on tap and closes.** Today the parchment card under the grid is always open (the first item
  is selected by default) and takes half the screen. As in the registry: tap an item → a card (bottom sheet on the
  phone, a popover or small dialog on desktop) with the picture, tags («магическое · настроено»), what it does in one
  line and its story; it closes on «Закрыть», a tap outside or Esc. Nothing is selected by default; the grid and the
  doll get the space. Keep the item pictures as they are — the owner: «предметы генерит как боженька».
- **Inventory grid** with rarity colours and a legend (обычное / реликт Старого мира / магическое / сюжетное),
  quantity badges, categories (Всё, Расходники, Снаряжение, Реликты, Сюжет), money in the header, and a parchment
  sheet on tap with the description and quantity.
- **Dice tab:** a big result with natural 20 / natural 1 styling; normal / advantage / disadvantage; «Зачем бросок»
  (a reason line); quick rolls per character built from the sheet (checks, attacks, saves with their bonuses; damage
  and healing expressions); a free pool d4…d100 with a modifier; a roll log the DM sees («ДМ видит этот журнал»).
- **Party tab:** the current objective on top; a card per member (portrait, name, role, AC badge, HP gauge, attack
  line); the crew aboard and the people left at home as rosters with small portraits; switch the character sheet to any
  member with name chips.
- **Codex** grouped by relationship (семья, союзники, мутные, нейтральные, враги) with coloured tags; factions with
  their status; search.
- **Quests:** the main arc with steps (✓ / ○), side quests, open threads, debts and promises, done ones collapsed.
- **Ship / holdings page:** picture, description, specs, armament, the hold as an inventory grid, passengers and
  prisoners.
- **Header plate** with the place, the time of day in words and the next destination («Лиссабон · рассвет после ночи
  у Белой башни · дальше: Женева») instead of «День 1 · 00:00».

## Checks

typecheck, lint, the full suite with `--test-concurrency=2`, build, fake bench, screenshots with the overflow check, a
short live smoke on the changed paths within **$5**. Push `claude/polish` only, never `main`. Report in English.
   Turn 29: descriptions excellent (the shout trapped in the helmet as «бу-бу-бу», the gaff in the forefoot, the
   hook catching Мокей's net instead of the stern); dialogue still odd in places («Гильдейский, значит. Ну-ну. Сами
   так сами»).
   Turn 31, a reference pair for the voice examples (owner: «косноязычно слегка, диалоги неплохие, но надо
   доточить»). As written: «Мокей на кухню не идёт… Кружку отдаёт обратно со словом «Нет», а хлеб берёт. Дуня пьёт
   молча и стоя, потом вытирает рот запястьем со шкотом.» Native: «Мокей на кухню не пошёл — сел на пороге, спиной к
   теплу, шланг на коленях. От кружки отмахнулся, хлеб взял. Дуня выпила стоя, молча, и утёрла рот рукавом.»
   Patterns to teach: tense and rhythm of a living narrator (a mix of past and present is fine when deliberate);
   one clear action per clause; no stacked instrumental phrases («запястьем со шкотом»); gesture instead of quoted
   one-word lines («со словом «Нет»»).
   Also: «— Ящик на кухне. На кухне я ничего не списываю.» — the idea is good (the debt is written off only at the
   counter), the line is a rule recited, not speech (owner: «не говорят так люди»). Native: «— Он у меня на кухне
   стоит, а не на стойке. Вот вынесешь — тогда и выпьем.» People hint at their rule through the situation; they do
   not announce it as a policy. Planner's own miss: I praised that line; the owner's ear is the reference.
   Turn 32, a failed insight check narrated as a verdict on the hero's mind: «Объяснение складное, щели в нём ты не
   находишь. На барже такой приказ отдали бы и сами… Может, всё так и было. А может, и нет. Наверняка ты не скажешь.»
   It reads like the mechanic spoken aloud and decides what the hero thinks. A failed insight shows only the surface
   the hero sees — the NPC is convincing — and leaves the judgment to the player: «Он говорит спокойно, не сбивается и
   смотрит тебе в глаза.» (The planner's first try, «объяснение гладкое — как и его сухое пальто», was rejected by the
   owner: people do not compare an explanation to a coat. Plain beats clever; no decorative similes.) A success may add one telling detail (here the DM did
   it well: «patrol» is the first word he says faster than usual). Never write «ты не можешь сказать наверняка».
