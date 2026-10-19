# Session 2 — the owner's notes while playing (planner's running list)

Collected from the owner's messages in the planner's chat during session 2 (sandbox, branch `claude/session-2-prep`).
Each item: what he saw, what he wants. Fixed together after the session unless it blocks play.

## Home screen (2026-10-19)

1. **A side menu appeared at the top left** («RPG CONSOLE · Библиотека историй»: Кампании, Миры, Крафт ведущего,
   Настройки). On the home screen it duplicates the main card's buttons and floats in the corner. Owner: «странная
   штука слева». Do: no side menu on the home screen (keep it on inner pages if it helps there).
2. **The main menu sits high and small.** Owner: «давай сделаем основное меню либо больше, либо по середине экрана — оно
   раньше было по середине экрана». Do: centre the card vertically again and scale it up on large screens.
3. Minor, seen on the same screen: the names differ — «Крафт ведущего» in the side menu, «Мастерство Ведущего» on the
   card: one name everywhere; the developer link «Открыть отдельный макет этапа 0» should not be on the owner's home.

**Status:** 1–3 fixed by the planner in `d74b6c6` on `claude/session-2-prep` (the owner asked for it before starting the
campaign); the local session checks and loads it (`docs/HOME_FIX.md`). Also in that commit: the stale Flare caption in
«Модели картинок» (live frames have been on Sunburst since polish 3).

## General settings → «ИИ: провайдеры и модели» (2026-10-19)

4. **The block is a leftover of the old OpenAI-only app.** Owner: «тут какая-то шняга снова с провайдерами». It lists
   only OpenAI under «Доступность провайдеров», shows «Модель приложения по умолчанию: gpt-6-astra · high», the chips
   gpt-6-astra / gpt-6-sol / gpt-5.4 / gpt-5.4-mini, and says «Выберите модели, которые ведут… ваши кампании» and
   «Кампании наследуют эту модель». None of that is true for play today: the DM is chosen per campaign (Settings →
   «Ведущий»; the new-campaign wizard defaults to Claude Opus 5.5) and `dm.turn` never inherits the app model
   (`resolveExecutionProfile`); the opening and the «Ранее в…» digest run on the campaign's DM model; pictures run on
   the campaign's «Картинки» choice (OpenAI GPT Image, fal). The app model (env `OPENAI_DM_MODEL`, default GPT-6 Astra)
   still serves the old paths: the World Library's canon compile (`world-library/authoring.ts`, `canon.compile`), the
   old Astra loop's tasks and memory summaries (`production-service.ts`), World Lab, and the opening only when a
   campaign has no DM choice. Do (after the session): rewrite the block to say who does what — providers Anthropic,
   OpenAI and fal with «ключ есть / нет»; «Ведущий — в настройках каждой кампании (по умолчанию Claude Opus 5.5)»;
   «Картинки — в настройках кампании»; the app model renamed to what it is («Фоновая модель OpenAI: сборка канона мира
   в «Мирах»…»), its chips under «Подробнее». Open question for the owner later: move canon compile to Claude too?

## Small, unreadable text (2026-10-19)

5. **Owner: «нечитаемый шрифт, очень-очень мелкий»**, especially the help lines under the switches on General settings
   («Сделать повествование чуть просторнее.», «Настройка сохранена для будущей поддержки…») and the status chips
   («Настроено · не проверено»). Cause: the pre-Stage-5 screens (General settings, and likely the World Library and DM
   Craft pages) render inside the new shell with the old global sizes — `body` 13px, `.muted` 12px, `.setting-row p`
   11px, `.panel-heading .muted` 10px (`src/app/globals.css`). Do: one typography pass over every owner screen — body
   text 16px, helper and muted text at least 14px, chips and labels at least 13px, nothing smaller anywhere (phone
   included); check with screenshots of every library and campaign screen at 1440×900 and 390×844.
6. **«Крупный текст истории» does nothing on today's game screen.** It adds `.large-text` and enlarges
   `.narration > p` (22px) and `.player-reply p` (18px) — classes of the old game screen; the Stage 5 game screen uses
   `.gameplay-narration .prose` (17px) and `.gameplay-owner-words .prose` (16px) inside `CampaignShell`, which never
   sets the class. Owner asked what it is. Do: make it work on the game screen (the shell sets the class; narration and
   the owner's words clearly larger, e.g. 20–21px and 18px, line length kept), and say in its help line what it does
   («Текст истории на экране игры крупнее»).

## «Мастерство Ведущего» screen (2026-10-19)

7. **Owner: «выглядит неаккуратно… куча разных карточек… этот мега-список снизу».** Today: 22 cards in a 5-column grid,
   each as tall as its full text (from 6 lines to 40), the «Избегать» block, tags (some English: cognitive, knowledge,
   world, voice), the role, and an «Изменить и проверить новую версию» button on each; under them a long «История
   версий» of every version of every card. The owner wants:
   - **all cards the same size**, showing only a short description (the first sentence or two of the text, clipped to
     three lines), the title, the kind («Основные принципы» / «Карточка»), the role («Для писателя» / «Для учётчика» /
     «Для обоих») and the version;
   - **the full text opens on click** (a panel or a dialog over the grid): the text, «Избегать», tags, the role switch,
     «Изменить и проверить новую версию» — the edit button lives here, not on every card;
   - **the version history out of the page**: inside the opened card, the history of that card only (folded), with
     «Сделать одобренной» as today.
   Also: «Как вести игру» first and visibly the main one (wider or set apart above the grid); English tags not shown in
   the grid (in the opened card, Russian names where a mapping is obvious); the grid 3–4 columns on a wide screen,
   1 on a phone; the same typography rules as item 5.

## Found while preparing the session 2 world (2026-10-19, planner)

The owner chose a new world for session 2: classic D&D 5e, the Forgotten Realms, Baldur's Gate and the Sword Coast. The
planner wrote three texts for him (the world form, a canon document, the DM guide with 5e rulings; on the owner's PC in
`C:\Dev\rpg-exports\worlds\baldurs-gate\`, not in git). Preparing them showed two gaps:

8. **The world's text never reaches a play turn.** «Создать Мир» stores a title and the setting (up to 20,000
   characters) as the world's premise; the bootstrap passes it to the hero draft and the opening
   (`202609300031_universal_campaign_bootstrap.sql`), but the DM's turn context (`dm-loop/context.ts`, layer 2) reads only
   the campaign's DM guide, canon and reference documents and the adventure's title and premise. A world described only
   in the form is forgotten after the opening. Do: on campaign creation, copy the world's setting into a canon document
   of the campaign (titled with the world's name, versioned like any document), or read the world's premise into layer 2;
   say it on the form («этот текст ведущий видит в каждом ходе»).
9. **No D&D 5e support beyond knowledge.** The `roll` tool's difficulty ladder is 8 / 10 / 13 / 16 / 19 and its
   description prefers words over `dc`; it hints «the hero's moment» on any natural 20 and a cost on any natural 1 (5e:
   only attacks crit or miss; death saves have their own 20/1); the sheet takes no level or spells at creation
   (`bootstrap-validation.ts`), ability scores are display only, weapon damage is one number. The DM guide covers it for
   now. Do (later, after the owner judges the 5e test): a per-campaign rules choice that switches the ladder to the 5e
   DCs and the natural-20/1 hints, and a 5e sheet (level, ability modifiers, proficiency, saves, spell slots, damage
   dice).

   Also for item 9 (planner, reading `sheetBonus` in `dm-loop/execute.ts`): the six ability scores live in
   `character_sheet.attributes` and never reach a roll; the skill match takes the first sheet line whose stems match,
   in both directions, so «Спасбросок Интеллекта +7» above «Интеллект +4» gives a plain Int check +7 and the reverse
   order gives the save +4. The session 2 hero works around it with lines named «Проверка X ±N» before «Спасбросок X ±N»
   (simulated: all 24 probes resolve right). A 5e sheet should compute check, save and skill modifiers from the scores,
   proficiency and level instead.

## New-campaign wizard (2026-10-19)

10. **«Сводка» says «Ведущий: Claude Opus 5.5 · средняя».** Owner: «ведущий снова неправильно указан». The wizard's DM
    step defaults Opus to `defaultEffort` medium (`dmTurnModels` in `dm-settings-client.ts`) and the summary shows it, but
    a new campaign plays with the depth range high…xhigh (`DEFAULT_DEPTH_RANGE` on the first save). Do: the wizard and
    its summary show the range the campaign will get («высокая — очень высокая») and the DM step offers the range, not a
    single effort; Opus's single-effort default high.

11. **Strange texts on the wizard's first step — owner: «это надо убрать».** Three lines:
    «Выбери мир, опиши героя своими словами — ведущий соберёт черновик листа по правилам кампании, ты его проверишь и
    поправишь.» (also not true: the draft is written by the app's OpenAI model, not the campaign's DM);
    the second «Новая кампания» heading with «Опишите любого героя в своём мире. Этот стиль кампании не требует класса,
    уровня, здоровья или человеческого тела.» (developer wording, and wrong for a 5e campaign);
    under «Мир»: «Общая основа с независимыми героями и состоянием Кампаний. Создание Мира не генерирует историю,
    персонажей или тайны. Акторы и Канон из Пакетов требуют явной подготовки в Кампании.» (internal jargon).
    Do: remove all three and the duplicate heading; at most one plain line where it helps (for the world form, after
    item 8: «Этот текст ведущий видит в каждом ходе»). Sweep the other wizard steps and the review screen for the same
    kind of text.

12. **After «Создать Мир» the owner could not tell it worked** («что-то сломалось… не понимаю, что делать»). The world is
    created and selected (`worlds.tsx`: `onCreated` selects it and closes the form), but nothing says so: the picker
    shows «… · v1», the premise box ends in «Кампании сохраняют записанные версии своей основы.», and the same «Создать
    Мир» button is back under it — pressing it again starts a second world. Do: a clear «Мир создан и выбран» state;
    the button becomes «Ещё один мир…» (or hides while a fresh world is selected); drop the «v1» suffix for a world
    with one version.
13. **The «Герой» step is on the «Мир» step.** The stepper shows four steps, but step 1's form also holds «Название
    кампании», «Имя», «Кто вы?», «Язык кампании» and «Подготовить предложение с ИИ» (`bootstrap/new-campaign.tsx`), while
    step 2 «Герой» shows nothing of its own. Owner: «у нас есть отдельно экран героя и его дублирование в окне мир».
    Do: step 1 is the world only (pick or create, then «Дальше»); step 2 holds the hero fields and the AI button; the
    stepper follows. Also check what «Другие поддерживаемые правила» opens (the old ruleset choice?) and drop or
    explain it.

14. **Items and the doll (found preparing the hero's kit).** The humanoid doll has eight slots — head, neck, body,
    main hand, off hand, belt, legs, boots (`humanoidSlots` in `dm-loop/execute.ts`) — and **no ring slots**; the
    owner's hero wears a ring on the right hand and wants the left free for another. Starting possessions are inserted
    with category `possession` (only the profile's weapon becomes `weapon` and goes to the hand,
    `202610030035_world_logic_natural_action_bridge.sql`), while head/body/boots take `armor`/`clothing` and the neck
    `accessory`/`jewelry`/`gear` — so a starting robe, hat, boots or amulet cannot go on the doll until the DM changes
    its category. Item bonuses never reach a roll by themselves: the session 2 hero has them folded into the sheet lines
    with the source in brackets, and the DM guide says to fix the line when an item comes off. Do: ring slots (left,
    right); the review screen lets the owner pick a starting item's kind and slot and equips it at creation; an item's
    `mechanics` field is set from the review; later, item bonuses applied to rolls from equipped items (attunement 3 in
    a 5e campaign).

15. **The adventure's description reaches a turn as 600 characters, «owner-advisory, never new facts»**
    (`adventureGuidance` in `dm-loop/context.ts`). The owner writes his adventure hooks there (session 2: the mage goes
    on a job with two guards). Anything past 600 characters, and any fact in it, lives only in the opening. Do, with
    item 8: the adventure's full text in the turn while the adventure is active (budgeted like canon), and its stated
    facts — people, places, who goes with the hero — offered as records at the opening review.

16. **The hero draft failed on the owner's detailed «Кто вы?»** («Не удалось подготовить или сохранить предложение.
    Проверьте настройку ИИ и актуальность начала.»; «Ответ пока не подтверждён…»). Likely cause (planner, from the code,
    not yet confirmed by a log): `parseCreationProposal` grounds every capability, limitation, possession and resource in
    a verbatim quote of the owner's text — the label inside the quote, the quote inside the text, a quantity or amount
    as digits inside the quote — and one miss rejects the whole draft. A rich 5e description («два зелья лечения»
    without the digit, spell slots «4 / 3 / 2» that the model labels «Ячейки 1 круга») is exactly what breaks it. Do:
    drop or repair the offending entries instead of failing the draft; say what failed in plain words; let the owner
    go straight to a manual sheet. Workaround today: a short «Кто вы?» for the draft, the full text and the sheet
    entered on the review screen (the owner's review is not grounded).

    Log (`.sandbox/app.log`, read by the planner with the owner's permission): three draft requests
    `POST /api/campaign-bootstrap 503` after 2.6, 2.8 and 2.0 minutes (under the 180 s ceiling for `world.compose`, so the
    model answered and the answer was refused), then five quick 503s for «Восстановить результат». No provider-attempt
    line is logged for the bootstrap, so the refusal reason is not in the log — add one.
17. **Money leak: the «Ранее в…» digest of «Рэй» fails and is retried on every entry.** `session_digest_unparsed` 9 times
    in the sandbox log, Opus at xhigh, **$4.43** in total ($0.33–0.69 each, `reason: entry`). `digestOnEntry` runs whenever
    the campaign is opened while its session has no digest; an unparsed answer leaves it without one, so the next entry
    pays again. Do: one failed digest per session per day at most (record the failure), a parse repair or a fallback
    digest, the digest at the depth range's base (high), not xhigh; find why it does not parse.
    Why nine for one owner visit (planner, from the log and `session-digest.ts`): the runs come in bursts of three at
    the same moment (log lines 6694–6696, 6909–6911) right after parallel `GET /api/campaigns/<id>/play` requests —
    the game screen asks for the play state two or three times on open, each `readPlay` calls `digestOnEntry`, and
    `scheduleDigest` has no in-flight guard (only `retryDigest` checks `inFlight`), so one open = three paid digests.
    The other bursts follow other visits: the local sessions also opened «Рэй» while checking settings for session 2.
    Fix first: an in-flight guard in `scheduleDigest`; after a failed digest, no automatic retry on entry (the «Повторить»
    button stays); the unparsed reason and the first 300 characters logged. Before the owner reopens session 2's
    campaign after its session ends.

18. **Nobody can change the hero's sheet lines after creation.** `upsert_character` refuses the player's hero («The
    player's hero cannot be rewritten here») and no other DM tool edits `character_sheet`; the owner's records screen
    shows the sheet but (planner, not fully confirmed) does not edit its lines. So a 5e level-up (proficiency +3 → +4 at
    level 9, new spells, a new ability line) and any change of a bonus stay impossible in play. The owner spotted the
    consequence himself («а если он кольцо снимет?»): the session 2 hero now keeps clean numbers in the lines and the
    DM adds worn items' bonuses per roll (DM guide). Do: a DM tool (and an owner form) for the hero's sheet lines,
    level, attributes and the combat profile, versioned like other records; with item 14, bonuses from equipped items.

19. **The review screen's item editing confuses** (owner: «какой-то баг… нет кнопки сохранить»). The folded item shows
    only «Название ×1», never its description; the description box is five lines high and scrolls, so a pasted card
    looks cut; and nothing says the edits are kept and applied by «Создать персонажа и кампанию» at the bottom (no
    per-item save, no «черновик сохранён»). Do: the first line of the description under the name; a taller box that
    grows; a quiet «Изменения применятся при создании» note near the edits; and item fields for kind, slot, damage,
    bonus and attunement (with item 14).

20. **TOP PRIORITY — hero creation in one pass.** Owner (2026-10-19, after ~40 minutes of pasting a 5e wizard into the
    review form): «это должно быть одной кнопкой и быстро, и не сидеть и вставлять. Утвердили на экране персонажа, оно
    отобразилось, всё, играем. Иначе это пизда, очень фрустрирует». What went wrong today: the draft runs on the app's
    OpenAI model with verbatim-quote validation and failed three times on a detailed description (item 16); the draft
    that passed ignored the owner's numbers (its own scores, HP 12, defence 2); level and spells cannot be entered
    (item 9); every item needed a hand-pasted description and stats with no fields for them (items 14, 19); the item
    list silently stops at 12 («Добавить · Вещи» greys out without a word); a consequential question blocked approval.
    Do: the campaign's DM (Opus, the campaign's rules — 5e here) builds the whole hero from the owner's words in one
    call — scores, modifiers, level, proficiencies, saves, spells, features, HP, AC, every item with kind, slot,
    properties, damage and bonuses, equipped on the doll, counters — and shows it as a readable sheet; the owner
    changes anything in place (or says it in words: «поменяй запугивание на убеждение»), presses one button, and the
    game opens. Numbers the owner gave are kept exactly. No verbatim-quote rejections: the owner's approval is the
    authority. Limits are said where they bite.
    Owner on the item cap: «ограничение 12 предметов убираем — это извращение». Drop the 12-possession and 8-resource
    caps at creation (`bootstrapLimits`), keep only a sane technical ceiling far above play needs. And no
    «Нужен ответ» questions that block approval for things the owner already wrote (the draft asked what the battle
    staff is for).

21. **The new-campaign flow is out of order** (owner: «слегка нелогично — оно мне предлагает сразу первую сцену»). Today:
    Мир → Герой → Ведущий → «Начало» (where the first scene starts, before any adventure exists) → «Начать кампанию»
    opens a separate «Приключения» screen where the adventure is written («Во что вы хотите сыграть?», the pace) → the
    DM's opening on yet another screen → and the campaign's canon, DM guide and voice mode are set in the Library and
    Settings outside the flow. Do, one wizard in story order: 1 Мир (pick or create; its text becomes the campaign's
    canon — item 8; a rules document can belong to the world, e.g. «D&D 5e» for this one) → 2 Герой (one pass — item 20)
    → 3 Приключение (title, what we play, the pace, who goes with the hero; full text kept — item 15) → 4 Ведущий (model,
    depth range, «Что мне нравится», voice examples mode) → 5 Первая сцена (the DM proposes the opening from all of it,
    the people in it become records; the owner edits, «Играть»).

22. **The campaign screens do not fill the window** (owner, with screenshots of «Приключения» at full width and zoomed
    out: «нужно как минимум протянуть вниз до конца экрана… внизу пустая полоса»; also «разрешение и размерность»).
    The campaign shell is a centred column with the side menu as a card that ends after «Настройки» and the content
    panel that ends after its last field, so a tall or wide window shows an empty band below and wide margins at the
    sides. Do: the side menu full height (sticky, to the bottom of the window), the content area at least the window's
    height, and on wide screens use the width (a larger max width, or scale type and spacing with the viewport) — with
    item 5's typography pass; screenshots at 1440×900, 1920×1080, 2560×1440 and a phone.
    Also seen on this screen: the step-4 sentence («Берегост, пост стражи, раннее утро…») landed in «Во что вы хотите
    сыграть?» as the whole premise — the first scene and the adventure's premise are one field (item 21).

23. **The history window: 45k tokens of a 1M-token model** (owner: «почему только 45 тысяч? там огромное окно, плюс у нас
    кеширование»). `HISTORY_BUDGET` = layer 4 scenes 30k + exchanges 15k (polish item 8). At the app's Opus prices
    (input $4, cache read $0.20, 1-hour cache write $8 per MTok) a bigger window costs little to read and more to
    rewrite: per model call a 150k history reads for ~$0.03 (a turn makes several calls), and a rewrite after an hour's
    pause or a window shift is ~$1.20 instead of ~$0.36; the first word grows with the prefix (session 1: +2 s while the
    request grew 33→155 KB). The owner values the wait over money. Do after session 2's report: check whether the
    window filled and anything dropped; if so, raise it (try ~120k) and measure the first word and the cost per turn on
    the replay tool before keeping it.

24. **«Дополнительно · объекты и контейнеры» under the adventure form** (owner: «надо убрать, это странно»). It is
    `persistent-adventure-loot.tsx`, the old hand-made loot/containers panel from before the DM placed items itself.
    Do: remove it from the Adventures screen (keep the code only if something still needs it; the DM's `item` tool
    and the camp cover containers in play).

25. **The Library's document view and editor** (owner: «повылезала админка… окна странно выглядят, какой-то треш с
    вложенными окнами… после сохранения оно не сворачивается»). Opening the DM Guide shows a panel with «В этой
    версии нет текста.», under it an «Редактировать документ» fold holding a second framed panel «Руководство для DM»
    with two paragraphs of system text («Изменения указаний действуют в текущей временной линии.», «Сохраняйте или
    восстанавливайте руководство явно…»), a «Прочитать текстовый файл или Markdown» picker, «Сохранить новую версию»,
    «Обновить сохранённые данные», «Использовать сохранённые значения», «История версий»; after saving the editor stays
    open under the read view. Do: one panel — the document reads cleanly (Markdown rendered: headings, lists); «Изменить»
    turns that same panel into the editor (title, status, text, «Загрузить файл» as a small link); «Сохранить» returns
    to the read view with «Сохранено»; history behind a small «Версии» link; no system paragraphs. Also: the false
    «Покинуть страницу и потерять несохранённые изменения?» when leaving «Приключения» after the adventure was saved
    (the opening panel counts as unsaved).
    Owner after saving the canon: «это мега-окно справа должно прятаться после сохранения документа, а не вечно висеть».
    Saving closes the document panel (back to the list with «Сохранено» on the saved row); the panel opens only when a
    document is picked.

26. **Campaign settings: «Правила и пределы кампании» again** (owner: «мы же вроде тестили правила и пределы кампании —
    оно снова тут, надо убрать»). The block shows «Правила: World Logic» (the internal ruleset label, wrong for a 5e
    campaign) with «Книги правил в библиотеке», and «Пределы одного хода» — money created per turn 1 000 000, items 50,
    people 20, game minutes 10 080, actions 40, model requests 10, with «Сохранить пределы» — plus three more read-only
    caps. These are record guards, not anything the owner plays with. Do: drop the limits from the owner's settings
    (keep them server-side; at most a folded «Для разработчика» if needed for tests); replace «World Logic» with what the
    campaign's rules are in words (e.g. «D&D 5e — по руководству ведущего» from the DM guide's first line, or «Свои
    правила») and a link to edit the DM guide. Same screen: the picture-models caption still says Flare (the planner's
    `d74b6c6` is not loaded in the sandbox yet).

## First look at the game, character and inventory screens (2026-10-19)

Owner: the character screen «моё уважение, сильно лучше», items with descriptions and pictures «сильно более симпатично».
Problems:

27. **CRITICAL — the owner cannot put items on the hero** («МЫ НЕ МОЖЕМ ОДЕТЬ ПРЕДМЕТЫ НА ПЕРСОНАЖА»). The item card offers
    «Перерисовать / Использовать / Передать…» and no «Надеть»; the doll's slots take only matching kinds and the starting
    items are `possession` (item 14). In play the DM can do it (`item modify category` then `equip`; the rejection lists
    the slots), so session 2 asks the DM in the first turn. Do: «Надеть / Снять» on every item card (the slot chosen by
    kind, a kind picker when it fits none), drag to the doll, ring slots; starting items equipped at creation.
28. **Money and counters are not on the hero.** «Кошелёк и ресурсы» shows only «Монеты 0»; the hero has no resources at
    all (`resourcesOf(entity)` empty) — the review's counters (gold 60, slots 4/3/2, hit dice, arcane recovery,
    potions, the tusk) either were not entered or did not reach the record; gold entered as a resource would not be
    money anyway. Session 2: the DM sets them in the first turn. Do: starting money as money (the campaign's currency),
    counters with a max (`_max`), and the review screen saying which is which.
29. **The opening scene's picture came late, not never** (corrected: a few minutes after approval the frame appeared — a dawn over Beregost, the owner: «очень-очень хорошая, видно, что рассвет»). Before that the header showed only «П» with no «рисуется…» state. Do: show «рисуется…» in the scene header while the opening frame is in work. Original note: (the scene header shows only «П»). Live frames start from a turn's first
    paragraph; the approved opening is not a turn. Do: draw the opening's frame when it is approved (or as the first
    key frame), like any scene.
30. **Small screen issues:** «Закончить сессию» is boxed and larger than its neighbours (it should be the quietest of
    the four); the HP buttons «−10 −5 −1 +1 +5 +10 Полные» on the character screen are the owner's manual corrections —
    move them behind «Исправить» in the owner's editor; the item panel under the grid stays open — open on a click on an
    item, close on a second click or outside; the character and inventory screens are small and lost on a big monitor
    (items 5 and 22).

31. **The map: drawn well, filed under the wrong scale** (owner: «карту нарисовало просто супер», but «оно почему-то во
    вкладке Мир, хотя по логике это окрестности… региональной карты нет… везде на мир ссылается»). With one place on
    record (the guard post), the atlas drew a fine map of Beregost itself and shows it as «Мир»; «Регион» and
    «Окрестности» show the same picture under «На уровне … пока нет известных мест с метками… Открыть уровень «Мир»».
    Do: the level follows the scale of what is drawn — one settlement and its streets is «Окрестности»; «Регион» is the
    Sword Coast along the Trade Way (Baldur's Gate, Candlekeep, the Friendly Arm, Beregost, Nashkel, Cloakwood), drawn
    from the world's canon; «Мир» is Faerûn's west. For marks on them the DM records the places the hero knows from the
    canon and his background as «known»/«rumored» at the start (or the canon's places become map entries). Also the
    folds under the map — «Известные места без меток», «Открытые места», «Изменить размещение на карте», «Места, где вы
    дома», «Инструменты «что, если»», «Изменить / Исправить записи» — go behind one quiet «Ещё» (owner: «эта … осталась
    снизу»).

## The first turn failed (2026-10-19 12:58)

32. **«DM не удалось завершить это действие» on the first turn** (log, operation `7dadd0c2-…`). The owner's input was an
    out-of-game setup (money 60, seven counters, four items to equip) plus his line to the captain. Request 1: Opus at
    high, 102 s, **stop `max_tokens` at the 10 000-token output cap**, $0.51, 21 tool calls — `money` ok; `resource` ×7
    rejected (counter names must match `^[a-z][a-z0-9_ -]*$`, Latin only — the DM used the owner's Russian names);
    `item` ×4 rejected, ×2 ok (equip of a `possession` into a slot, item 27); four `upsert_character` (the captain, the
    sergeant, the recruit), two `upsert_place`, one `quest` ok. Request 2 (163 KB) failed at once: `dm_loop_failed
    code: provider, retryable: false` — most likely the continuation after a `max_tokens` stop that cut a tool call or
    the text; the whole turn rolled back. Do: (a) a `max_tokens` stop never fails the turn — continue the loop correctly
    (close or drop the cut block) or raise the cap; the output cap per request (10 000) is low for high/xhigh with many
    tool calls — measure and raise; (b) counters accept any language as a label (key derived, the label kept), so «ячейки
    1 круга» works; (c) the rejected `provider` error and its HTTP body logged; (d) an out-of-game setup should not be a
    turn at all — the owner's editor (or the one-pass hero, item 20) sets money, counters and equipment directly.
    Retry as a records-only turn with Latin counter ids worked (23 changes): money 60 («Зм 60»), hit dice, slots 1–3,
    arcane recovery, the tusk. Seen: counters with no Russian presentation show their raw key in English («Shaman tusk»,
    «Arcane recovery») — labels in the campaign language (b above); the DM first set only the maxima and left current
    values at 0, then raised them in the same turn; the narration reported the bookkeeping («Максимумы встали, но
    текущие значения остались на нуле…») — fine for an out-of-game turn.

33. **The doll's slots, seen with the kit on** (owner, after the DM equipped hat, tusk, robe, staff and boots: «ура»; but
    «ноги и сапоги — дублирование… а где кольцо?»). Today: head, neck, armor/coat, main hand, off hand, belt, legs, boots.
    Do, Baldur's Gate-like: Голова, Амулет, Плащ, Броня/одежда, Перчатки/наручи, Пояс, Сапоги, Кольцо (левая), Кольцо
    (правая), Основная рука, Вторая рука — no «Ноги»; `humanoidSlots` and the categories they accept to match (clothing,
    jewelry, accessory as real item kinds — item 14). Existing heroes keep their equipped items (legs → none in use).
    And, again (items 5, 22, 30), owner: «оно должно быть больше, на весь экран… мне казалось, мы это фиксили»; the item
    card «вечно висит» — it opens on a click and closes. Acceptance for these: screenshots at 1920×1080 and 2560×1440 of
    the character and inventory screens, filling the window, before the fix is called done.
    Owner (13:09): «я лично буду принимать в следующем цикле правок». The fix stage ends with an owner acceptance
    pass in the sandbox: a short checklist per screen (what changed, where to look) and his «принято» or notes before
    anything is called done. Also: the wallet shows the currency as «Зм» — show the word («золотые» / «Золото»).
