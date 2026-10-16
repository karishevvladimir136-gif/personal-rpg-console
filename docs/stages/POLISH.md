# Polish — after the owner's first sandbox play

Cloud session (`docs/CLOUD.md`, environment `rpg-console`), branch `claude/polish` from `origin/claude/integration`.
The owner's notes from the first play are added below by the planner before launch.

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
   Let NPCs speak like people, once; let the hero's conclusions stay the player's.

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
  test for both cases.
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
- **Healing.** The hero lost HP twice (9, then 8) and has no visible way back: rest (short/long by ruleset), first aid
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
- Good, keep (turn 8): a natural 1 played as «fail forward» — the gear slips through a gap into the water, the hero
  skins his knuckles (HP 10 → 9, shown everywhere: sidebar, sheet, receipt), and the scene now asks for a dive, the
  hero's own skill; the pistol given to Dunya as a pledge left the inventory; the debt «Пятнадцать монет Дуне» joined
  the journal.
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
    are not enough, within ~300 ms) may raise this turn's depth inside the range. Show nothing in the UI; record the
    chosen depth and its reason in the turn record for the research track. The depth range stays in campaign settings. (d) «DM обдумывает ответ…» → «Ведущий думает…» (Russian, no «DM»).
  - **«Что изменилось за ход» collapsed by default.** One small line under the turn, «Изменения за ход · 6 ▸», that
    opens the chips on a tap; closed again on the next turn. (Plus the Russian wording and the hidden private items
    above.)
  - **Owner, after three turns:** «язык удивительно хороший, сильно лучше, чем в тест-образцах; скорость — просто
    топ». Evidence for item 7: with the owner's own world text written in living Russian, Opus high writes living
    Russian; the blind fixture's machine-translated world dragged the register down. Keep this in the research record.
  - **Remove the «Приключение» card from the game sidebar** — it breaks immersion; adventure management lives in the
    «Приключения» section of the left menu.
  - The story sits in its own inner scroll box under a very large frame (nested scrolling, arrows, «К последнему
    ходу»). One page scroll; see the one-stage layout in STAGE_V §7.
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
