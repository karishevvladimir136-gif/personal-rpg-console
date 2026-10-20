# Session 2 — the owner's notes while playing (planner's running list)

Collected from the owner's messages in the planner's chat during session 2 (sandbox, branch `claude/session-2-prep`).
Each item: what he saw, what he wants. Fixed together after the session unless it blocks play.

## Key finding — the DM's instructions (owner: «запомни и запиши, иначе это бред»)

Two causes of the dialogue problems in session 2, both in what the DM is told, not in the model:

1. **The DM's instructions are English.** Role, turn rules, tool descriptions, section headers and server replies are
   English (`dm-loop/roles.ts` ≈ 20.7k Latin letters vs 2.7k Cyrillic, the Cyrillic being the turn-shape examples;
   `context.ts` almost all English); only the voice layer (~580 tokens) is Russian. The model plans in English and
   writes Russian as a translation — calques in narration that reasons or explains (item 38).
2. **The voice layer's humour rule is a recipe for the quips** the owner keeps rejecting: «одна строка, что
   переворачивает чужие слова буквально и мрачно — смерть, долг, утопленники, глупость годятся». The voice layer was
   added on 2026-10-18 (commits 0c024c3, 65595bf), after session 1 — which matches the owner's «в прошлой кампании
   такого треша не было». The campaign's «Что мне нравится» («чёрный сухой юмор») and the DM's own observations repeat
   it. Plus the habit of closing every speech with a punchline or a fake syllogism.

First in the fix cycle: delete the humour recipe and add «a speech ends when the person has said what he needed»;
then a native Russian role/doctrine for Russian campaigns, measured on the probe scenes before/after.

**Confirmed in play (14:23):** the owner put one out-of-game note in his action (no quips on another's word, no closing
aphorisms, a joke at most once a scene; and the DC in every roll's title). The very next turn had no quips at all —
owner: «тупые шутки ушли» (approved as X11 in the private doc). So the quips came from the instruction, not the model.
Two side notes for the fix: (a) the DM answered the note inside the story text («Вне игры: принято…» with a stray «)*»)
— an owner's out-of-game note needs its own short reply outside the narration; (b) the note lives only in the turn
history, so it drops out of the DM's window once the history passes the budget — owner corrections like this belong
in the campaign's always-on owner rules (the highest authority), not in a chat line.

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
    Later (14:21, the party at Кривой брод): the atlas redrew «Мир» as a painting of the ford itself — owner: «очень-очень
    хорошо рисует местность… отличная основа для 2D-движка, потом туда добавим интерактивные точки», but «это по факту
    локация, не мир; нет карты региона, где мы перемещаемся». Do: keep these pictures as each place's location
    illustration (the base for the future 2D scene with interactive points), not as a map level; add a real region map
    — a stable painted map of the stretch of the Trade Way the party travels (Beregost, Кривой брод, the road south to
    Nashkel, what the canon names around it) with the places as marks and the party's position and route between them
    (at a place, or «в пути» between two); redraw it only when a new place appears in the region, not on every move.

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

## The first real turn (2026-10-19 13:11)

Owner: «диалоги стали лучше». Two lines flagged, both the patterns VOICE.md names — a one-word command put at the end
of a speech for the beat, and a quip built by echoing another character's word; the owner's «было → как надо» pairs are
in the private project doc (голос/отрывки_ru.md, pairs 2–3; never in git).
Turn 3 (owner: «диалоги стали местами лучше»): a third line flagged as bad and illogical — a dark quip for the reader
that skips the character's actual reason for what he is doing (pair 4 in the same doc). The quip pattern persists;
review the share of quips per scene in the session-2 report.
Turns 4–5: two more pairs (5–6). The narrator hedges a grim detail with a euphemism and a wink at the reader instead
of naming it plainly; the sergeant again echoes another character's word and closes with a clipped fake proverb. The
owner is fine with the sergeant's dark humour as such — he wants it as a finished joke in plain speech. Three lines
approved as good (X1–X3: a nervous recruit's question, a priest's clue told as an everyday remark, a survivor's
fragmentary whisper) — kept in the same private doc as positive examples.
Turn 7 (owner: «а вот тут удивительно нормальные диалоги»): a whole interrogation scene approved (X5) — everyone speaks
to get something, the wounded man's speech is short fragments in the order he saw things, magic shown only through
what the witness saw. Note for the voice rules: here a character repeating another's word works (an interrogator
fixing a fact and pressing on), so the rule is «no echo for a quip», not «no echo». One flag (pair 8): a clue line
contradicts itself in its fragments (asked vs already knew) and names the key cargo with a rare word the owner did
not know — a clue must read one way even in broken speech, and its key noun must be a word the player knows.
Turn 8: a novice's testimony approved (X6). The sergeant's fourth rejected quip (pair 9), and now the owner is angry
at the frequency («хватит шутить»): the DM has turned one companion into a joke machine — nearly every line of his
ends in a built punchline. This one also uses the «it's not X, it's Y» template (an English LLM tic, see item 38) and
states the plot inference for the player inside the joke. Do: rephrase the voice layer's humour rule (rare, only when
the moment asks for it, a finished joke aimed at someone present, never the scene's last word), and let the session
report count quips per companion. Mid-session workaround offered to the owner: an out-of-game note in his next action.
Turn 9: pairs 10–11. Root cause found in the voice layer itself (`VOICE_LAYER_RU`, last paragraph): the humour rule is
literally a recipe for the rejected lines — «one line that turns someone else's words literally and grimly — death,
debt, drowned men, stupidity — and nobody explains it». The sergeant's quips follow it to the letter (echo another's
word → death/debt twist). Second habit: every speech ends with a «clincher» line, often a fake syllogism that does not
follow (pair 11; owner: «не надо больше афоризмов… как оно вообще следует одно из другого»); the rule «главное
слово — в конец… обрыв вместо точки» may feed it. FIRST in the voice fix: delete the humour recipe (humour comes from
character and situation, rare, a finished thought, aimed at someone present); add «a speech ends when the person has
said what he needed; no closing generalisation, no line for the reader»; keep the rest of the layer (the want, «говорить
— не значит отвечать», particles), which the approved lines show working.

34. **The owner's names from the opening review were not used.** In the opening's «Что нужно уточнить» the owner gave
    the captain, the sergeant and the recruit names and their 5e strength; in play the DM introduced its own names (it
    kept the sergeant's first name, changed the rest). The opening review's answers apparently do not reach the records
    or the turn. Do: answers to the opening questions are applied to the opening's people (names, notes) before play,
    and kept in the DM's context; check the same for «Как зовут…»-type answers in the hero review.

35. **«Экипаж и люди дома · Казённые лошади стражи» on the party screen** (owner: «какая-то хурма… выглядит странно»).
    The DM recorded the guard's horses as a holding (transport) with the hero and both companions as its crew; the party
    screen shows every holding's crew under «Экипаж и люди дома», so the three riders appear as the «crew» of the
    horses. The party itself is right (two in the squad, with 5e stat blocks and portraits). Do: holding crews stay on
    «Имущество», not on «Партия»; mounts are shown as mounts («Кони: казённые, 3 — у отряда»), not as a crewed holding;
    the `holding` tool's guidance says a borrowed horse is a mount/item, a holding is property the hero owns or runs.

36. **Companions have stat blocks but no gear** (owner: «инвентарь теперь видим всех… исходя из инвентаря они голые и
    без оружия»). The inventory screen now switches between the hero and the companions (good). The DM created the
    sergeant as a 5e Veteran (58 HP, attack +5) and the recruit as a Scout (16 HP, +4) but gave them no items — only a
    healing potion for the recruit — so their dolls are empty. Also seen: companions get a different, newer slot set
    («Универсальные слоты»: голова, шея, талисман, тело, плащ, основная и вторая рука, кольцо I и II, руки, пояс, ноги —
    «ведущий надевает вещи туда, куда они просятся по описанию»), while the hero still has the old humanoid eight (no
    rings) — item 33 is mostly «give the hero the universal set». Do: when the DM makes a companion with a stat block,
    it records the block's gear as items and equips them (DM guidance + a check in the receipt: a companion with an
    attack and no weapon gets a hint); the hero moves to the universal slots, keeping what he wears.

37. **«Запросить разрешённый переброс» on every player roll — a house rule, not 5e** (seen on the first skill check:
    Arcana from the sheet line +7, d20 3, total 10, failure — the sheet number was picked up correctly). The button
    comes from the campaign's old difficulty preset: the default «medium» is `rerolls: "limited"`, 2 per session
    (`campaign-settings.ts`, migration 202609170001 default). Because rerolls are not `disabled`, the turn loop also
    pauses after every visible player roll and waits for «Дальше» (`dm-loop/loop.ts`, `pause = true`) — one extra click
    per roll. Pure 5e has no free rerolls (only from a feature: Lucky, Portent; Inspiration gives advantage). Do: with
    item 26, a campaign's rules come from its world/DM guide, not from the old preset; rerolls default to off and appear
    only when the sheet or the DM grants one; no pause after a roll unless a reroll is actually available (or the
    owner turns on interactive dice). Owner decides whether this campaign keeps the 2 rerolls.

38. **Narration reads like a translation; «приём» for a spell** (owner: «только не приём, а заклинание… как будто
    перевод местами, не русский язык слегка»; pair 7 in the private doc). The content of the failed Arcana check was
    good (a failure still gave part of the truth), but the sentences are English calques — «any of half a dozen…»,
    «makes a living», «the burns tell nothing more», «X wouldn't be lying here» — and a spell was called a «приём».
    Likely causes, to verify in the fix cycle: (a) the role, doctrine and tool layers (`dm-loop/roles.ts`) are English,
    only the voice layer is Russian, so the model plans in English and translates; (b) the voice layer
    (`dm-loop/voice.ts`) has no check against calques; (c) the 5e guide's terminology list names «ячейка заклинаний»
    but not plainly «заклинание / заговор / круг», and says rules stay out of people's speech — the DM may be avoiding
    game words. Do: a native Russian role/doctrine for Russian campaigns (or a short Russian «write as a Russian author,
    not a translator» check in the last layer), measured on the 48-scene probe set before/after.
    Related voice finding: the voice layer asks for humour «dark, dry, one line, never explained» — this is likely what
    produces the sergeant's clipped fake proverbs (pairs 3, 4, 6); the owner's own fix keeps the dark humour but as a
    finished joke with a setup. Rephrase that rule.
    Related rules conflict: `roles.ts` still tells the DM «Difficulty follows the ladder — easy 8 … nearly_impossible 19
    (in words)» and «a natural 20 gives the success plus a visible extra», while this campaign's 5e guide says numeric
    DC 5/10/15/20/25/30 and no natural-20 effect on checks. Check in the session-2 report which one the DM followed
    (the Arcana roll: total 10 failed, DC hidden). Do: the core role defers to the campaign's DM guide on difficulty and
    natural 20/1 when the guide states a system.

39. **«Какая сложность?» — the DC is hidden and nobody can say what it was** (owner, on a Persuasion check: +3 from the
    sheet, d20 7, total 10, failure; the earlier Arcana check was also 10 and failed). Campaign setting `showDc` defaults
    to false (migration 202609170001), so the card shows no DC and the DM is told «DCs stay hidden»; the toggle is
    «Показывать сложность (DC)» in the campaign part of Настройки. The dm-loop does not log tool arguments, so the DC
    is only in the database receipts — the planner cannot see it from app.log. Both failures at 10 rule out the old
    ladder's «normal 10»; it was 13 (ladder «hard») or 15 (the 5e guide's «medium»). Do: for a 5e campaign show the
    DC on the card after the roll by default (owner, turn 9: «надо, чтобы было видно, какая сложность» — yes, show it); the session report lists every player roll with its DC,
    difficulty word, bonuses and result from the receipts (that also answers item 38's ladder-vs-guide question).
    Owner could not find the toggle («а где?»): it is inside the collapsed «Ещё · все прежние настройки кампании» at the
    bottom of Настройки → «Проверки и кости»; the «Изменить в полных настройках» link jumps to the closed block without
    opening it. Also seen on that screen: the campaign's «Что мне нравится» says «чёрный сухой юмор», and the DM's
    «Наблюдения ведущего» repeat it — together with the voice layer's humour recipe, three places push the DM to quip.
    In the fix, «Что мне нравится» stays the owner's words, but the humour recipe goes, and the DM's observations must
    follow the owner's later corrections («хватит шутить») over the wizard text.
    Worse: for this campaign the toggle cannot be reached at all. The rules system is «Логика мира», so the settings
    tab «Правила и стиль игры» hides both «Сложность и правила» and «Проверки и кости» (`showMechanics` false; the note
    says the dice values are «kept for Console Basic») — yet those hidden values still act in play: rerolls «limited 2»
    (item 37), the pause after every roll, `showDc` false. Owner on that screen: «тут столько настроек, это п…ц».
    Mid-session workaround: an out-of-game note asking the DM to put the DC into the roll's title. Do (with item 26):
    hidden settings must not act; the few that matter in play (show DC, rerolls on/off) live on the short Настройки
    screen; the old tabs go.

40. **«Пока абсолютно все проверки неудачные»** (owner, 14:24). Four player-visible checks so far, all failed: Arcana
    +7 (d20 3), Persuasion +3 (7), Arcana +7 vs DC 15 (natural 1), and the companion Tobias's Survival +5 (7; a 5e Scout
    has exactly Survival +5 — the DM used the stat block, and had the companion act on his own: owner «что важно, он
    использовал спутника»). The dice are fair (`crypto.randomInt(1, 21)`, uniform 1–20); four d20s all ≤ 7 is about
    1.5% — bad luck, not a bias. DCs are standard 5e (15 «medium»). The out-of-game note works: the hero's roll title
    now carries «(сложность 15)»; the companion's does not (the note said «my rolls»). Watch: the card says «Провал на
    единице», and the English role tells the DM «a natural 1 costs something tied to what was tried», while the 5e
    guide says a natural 1 on a check is just a number — check whether the narration adds a mishap. For the report:
    every check with DC, roll, result and what the failure still gave (fail forward).
    Result (14:28): the natural 1 was handled as the 5e guide says — no mishap; the failed check still gave the two
    schools (enchantment across the road, evocation fire fan at the ditch) but not the power. The DM chose the Detect
    Magic ritual for the hero (fine, from «использую чутьё магии»), but also wrote the hero a spoken line («— Минут
    десять, — бросает Джеймс») — the role forbids writing the player's words. Minor terms: «обрядом» where 5e Russian
    says «ритуалом». Voice (owner: «так. лучше», but one line «явно перевод… косная речь», pair 13): with the quips gone
    the calques remain — the English-instructions cause; the DM also sprinkles «ведь» everywhere (the voice layer's
    particles rule taken literally) and gives a companion a repeated gesture across scenes («сглатывает» ×3).
    Owner (14:31) noticed the natural 1 cost nothing («даже в прошлой кампании он при такой ситуации ранил себя ножем»).
    That is the planner's 5e guide working (RAW: 1 on a check is just a number); session 1 ran on the English role's
    «a natural 1 costs something». Owner decision pending: RAW 5e, BG3-style (1 always fails, 20 always succeeds), or a
    house rule (1 = a cost that follows from the action itself, proportionate; 20 = a small extra). Whatever he picks
    goes into the campaign's DM guide; the core role must defer to the guide on this.
    First success (14:33): Investigation, DC 15 in the title, advantage from the companion's Help (5e Help action, the
    reason on the card), the explorer's hat +1 added through `bonuses` while worn (as the 5e guide asks), sheet +7 →
    best of 15/18 + 8 = 26. Every part of the roll exactly per the guide. Owner on the turn: «неожиданно хорошо» — a rich,
    fair clue trail, companions adding what they know, no quips, and a real choice with a clock at the end (X12).

41. **The narrator leaked the DM's private plan.** The turn ended with «…а в одиннадцать к окну кельи Рука придёт
    человек с рыжими сапогами» — stated as fact. Nobody in play named an hour (owner: «нет, там просто было „вечер“ и
    всё»); the hour and the certainty that he will come are the DM's own plan for the antagonist. A clock is good craft,
    but only with what the hero knows («вечером», «после того как храм запрут»). Do: the role/doctrine says the
    narration never states the DM's private plans, NPC intentions or timings the hero has not learned; the privacy check
    (`astra-privacy-context` / the DM's private notes) flags a narration that repeats a private note's hour or intent;
    the session report greps narration for facts that appear only in private notes.
    It repeats: two turns later the DM's own out-of-game aside says «засада в одиннадцать» as the party's plan, though
    the party knows only «вечером» — the private hour now reads as the hero's knowledge. And at 15:33 it moved into the
    fiction: the sergeant says «В окно Рука Дирк полезет в одиннадцать» — no one in play gave that hour; the DM's private
    plan has become a companion's knowledge. The fix must stop it at the source (private plans never in narration or
    asides), because once a companion says it, it is canon.

42. **The action box is tiny** (owner, 14:43: «важный нюанс. поле ввода оч мелкое»). The composer's textarea has
    `rows={2}` (`gameplay-composer.tsx`), so a normal plan of attack (three sentences) already scrolls inside a
    two-line box with its own scrollbar. Do: start at about 4 lines, grow with the text up to about half the screen,
    no inner scrollbar until then; the same font size as the story text; keep it pinned at the bottom of the play
    column. Part of the owner's acceptance pass (item 33).

43. **The first combat round is a wall of roll cards** (owner, 14:45, screenshot: «так. а вот…»). The ambush (hero's
    Hold Person on the horn sentry; companions shoot the sleeping brute) produced one full-size card per roll — the
    hero's spell, Tobias's two longbow attacks (5e Scout multiattack, advantage on a sleeping target — correct), Bram's
    heavy crossbow — each with its own «Бросить куб» (interactive dice: the server has rolled, the player clicks to
    reveal) and its own full-width «Запросить разрешённый переброс» with the caption repeated under every card. With a
    party of three plus enemies, every round becomes a column of cards and clicks. Do: a combat round's rolls form one
    compact block (one line per roll: who → what → result; one «Показать броски» for the round), reroll as a small link
    only where a reroll is actually available (item 37), the caption once. Rules note for the report: Bram's card says
    «засада и дальний выстрел гасят друг друга», but at about forty paces the target is within a heavy crossbow's normal
    range (100 ft), so the advantage against a sleeping target should stand — check the DM's range reasoning.
    Correction (14:51): the DM's own scale is 3 ft per pace (40 paces = 120 ft, «Hold Person needs half of it» = 60 ft;
    35 paces ≈ 105 ft), so the target was at long range for a heavy crossbow (100/400) and «advantage and long range
    cancel» was right; the planner's note was wrong. The narration used all four of Tobias's arrows (two at the
    sleeper — thigh hit, side graze; two in round 2 — shoulder hit, miss) and Bram's missed bolt. The owner read it as
    «only the second rolls counted»: the first round's cards had scrolled away above the second round's, and the story
    never ties a sentence to a card. Do (with item 43): each roll line in the round block carries the outcome as told
    («в ляжку», «мимо»), so card and story can be matched at a glance. Good DM craft in the same turn: an out-of-game
    aside listing the spent 2nd-level slot (with an offer to use the shaman's tusk instead), concentration, the
    initiative order and the ranges in feet against the hero's spells (Fire Bolt and Scorching Ray reach 105 ft,
    Lightning Bolt does not) — exactly the 5e bookkeeping the guide asks for.

44. **Owner decision: the DM rolls for companions; the player rolls only the hero's important rolls** (14:47: «давай
    за спутников бросает ведущий. а сам я только важные броски за главного героя»). Today a companion is a controlled
    entity, so every companion check is `visibility: "player"` (`dm-loop/execute.ts`: «A check of the hero or a
    companion is the player's») — a full card, the interactive pause and a reroll offer each. Do: companion and NPC
    rolls are rolled by the server for the DM and shown as one compact line each inside the turn (who, what, d20,
    total, result), no pause, no «Бросить куб», no reroll; only the hero's important checks get the card and the
    player's click. A campaign setting may switch companions back to the player, default «ведущий». Mid-session
    workaround given to the owner: an out-of-game note asking the DM to roll companions as plain formula rolls (no
    `dc`), which the loop treats as a plain roll — a small chip, no card, no pause; and «Дальше» already continues
    without revealing each die.

45. **The «Бой» panel is stuck at round 1** (owner, 14:58: «появился бой, только он отображает прошлый ход»). It shows
    «Раунд 1», the ambush summary, «Ходит сейчас» on the hero, every participant with «Действие 1 · Движение 1 ·
    Реакция 1», the sentry «Рядом», the brute «Далеко» — while play is in round 3, the sentry is held by Hold Person
    and the brute is wounded and fleeing on horseback. Cause: the DM's `combat` tool (`dm-loop/execute.ts`) has only
    `start`, `position` and `end`. At start the order is the party first, then the others (not initiative), the first
    one is «active», resources are set to 1/1/1 and never change; there is no way to advance the turn or the round,
    set initiative, or show a condition or a wound. The DM keeps the real order in its head (its out-of-game aside
    named it). Do: a `combat turn` action (next actor, round counter, initiative order set at start from the DM's
    rolls), conditions per participant (paralysed, prone, concentrating, fled), the enemies' wound state in words
    (цел / ранен / тяжело ранен / без сознания / мёртв — never numbers, per the guide), spent action/movement/reaction
    reset each turn; the panel follows the latest receipts. This is the base of the owner's planned combat screen
    (initiative ribbon, enemy cards with states).

46. **No damage rolls; enemies' hit points invisible and maybe untracked** (owner, 15:02: «по ДнД оно не бросает на
    урон. И нет понимания хитов самих противников. И коня»). Three Scorching Ray hits (3 × 2d6), two arrow hits on the
    brute earlier and two on the horse were narrated without a single damage roll on screen; the horse (5e riding
    horse, 13 HP) took two longbow hits (1d8+2 each) and ran off — plausible, but nothing shows it. The 5e guide says
    «Урон — формулой кости», and the tools allow it: `roll` with a formula is a server roll (a hero's or companion's
    shows as a line), and an NPC's HP is kept with `resource hp` (with `max` at creation; private, no chip). Whether the
    DM gave the brute and the horse hit points at all is not visible — for the report: list every damage roll and every
    NPC HP change in combat. Owner also asked whether the brute should have been incinerated: in 5e no — 6d6 fire
    (avg 21) after ~13 from arrows puts a ~30-HP brute at about 0, which is what the story shows (down, smoking,
    twitching). Do: the guide and the role require a damage roll for every hit (crits double the dice), shown in the
    round block next to the attack; enemies and animals get stat-block HP at `combat start`, each damage roll spends
    it, and the combat panel shows the wound in words (item 45). Mid-session workaround: an out-of-game note.

47. **Owner principle: the narrator never judges the hero; people react from their own character** (15:18, after the
    hero finished off the dying bandit with a dagger: «если бы рассказчик начал оценивать поведение, значит, мы сделали
    не игру, а симулятор бреда… это стражники, может, Брам вообще отлично относится к идее — это члены банды, что
    убили кучу народа»). The turn did this right: no narrator verdict; the prisoner panics, the young recruit is shaken
    («Он же дышал»), the veteran only looks — left open. Watch in the report: reactions to the hero's violence must
    come from each person's model (a veteran guard whose comrade the gang carried off may approve; a recruit who would
    not shoot a sleeper flinches), never a uniform disapproval from every companion — that would be the model's own
    ethics leaking into the cast. Planner's own slip: he first read the sergeant's look as disapproval.
    Owner asked at 16:21 whether the model drifts toward peaceful choices: the sergeant, ordered to finish a dying
    enemy, holds the blade and says the man is a second source to check the prisoner's story against, then «скажете
    кончать — кончу». Tally so far: lethal acts done — the hero's dagger, the sergeant's bolt into an armed enemy, the
    sergeant putting down the wounded horse; friction — the recruit twice (refused to shoot a sleeper, refused to finish
    the brute; in character), the sergeant once (a tactical reason, defers to the hero). Planner's read: no drift yet —
    the objections come from the people (a scared recruit, a professional who wants intelligence), not from the
    narrator, and nobody refuses the hero outright twice. The report counts lethal orders and how companions answered
    (done / done after a reason / refused) and flags moral rather than practical objections, enemies who always
    surrender, and long lingering on a dying enemy's suffering right before a kill order.

48. **«Собрать все трофеи» left the weapons and armour behind** (owner, 15:25: «они не сняли оружие и броню, а это
    важно»). The search turn (Investigation 24 vs 15) was rich in small finds — two purses, a foreign coin, the burned
    note with the green wax, the captive's ring — but the brute's morningstar stayed by the blanket, the sentry's light
    crossbow was dropped into the brush, and the sentry's red cloak with the charcoal Fist — the proof of the fake
    checkpoint — was never mentioned; nothing says whether the brute wore armour (a 5e thug has leather, AC 11, yet the
    story showed only a shirt). Do: the guide says a search or loot lists everything the bodies carry by their stat
    block (weapons, armour, ammunition, money, clothes that matter as evidence), and what the party takes is recorded
    with `item` (money with `money`, in the world's coins — silver and copper too, not only gold; item 28); the report
    checks that each «забрали» in the story has its item receipt.
    Next turn (15:27), the owner asked again to take all weapons and armour: the DM collected the brute's leather vest,
    the morningstar, the red cloak, the blanket and rations — and forgot the light crossbow with its bolts (owner:
    «арбалет они где-то про…ли»); its aside listing «общие вещи» names no crossbow, bolts, cleaver or horn. The crossbow
    existed only in the narration two turns back, never as a record, so a loot done from the records cannot find it.
    Do: an enemy made from a stat block gets its gear as items at creation (as companions, item 36), so a body can be
    searched from the records and nothing the story showed disappears.

49. **No spells tab** (owner, 15:52: «я понял, чего у нас нет — вкладки заклинания. Это неудобно. Чтобы там и список,
    и т. д.»). Today the wizard's magic is lines in «Умения» («Заговоры: …», «1 круг: …», «Книга заклинаний: …») and the
    slots are separate counters in «Кошелёк и ресурсы». Do: a «Заклинания» tab next to Персонаж / Инвентарь / Задания:
    slots by level with pips (the same counters), cantrips, prepared spells by level with «подготовлено N из M», the
    spellbook (known, not prepared), rituals and concentration marked, the spell being concentrated on now; each spell
    a card (casting time, range, components, duration, save or attack, damage and «на круг выше», a short text);
    a «Колдовать» button that puts «колдую <заклинание> ячейкой <круг> на …» into the action box. Rules stay knowledge,
    not code: spells are per-character records written by the hero step / the DM from the system's knowledge (5e here,
    any «powers» list elsewhere), editable by the owner, and changed in play by the DM (learn, prepare after a long rest)
    — with item 18 (the hero sheet cannot change in play today). Seen on the same screen, good: silver and copper now
    have their own counters next to gold (См 11, Мм 26), and the foreign coin is an item marked as a clue.

50. **A big time cost was paid without asking** (owner, 15:56: «как мы резко перескочили час?»). The hero asked to use
    Arcane Recovery; in 5e it needs a short rest (one hour), so the DM ran the hour in the same turn — 17:15 → 18:50 —
    with the companion's errand told in sequence though it ran in parallel, and said so only afterwards in its aside.
    An hour before sunset with the enemy shift due at 19:00 is a real decision. Do: when an action costs notable time
    (a rest, a ritual, a search of an area, travel), the DM names the cost and stops for the player's yes before
    spending it, unless the player already accepted it.

51. **A companion asks the hero a question and the same turn walks on** (owner, 16:02: «ответа не дождался и пошёл —
    зачем спрашивать?»). The sergeant asks the mage whether his fire will reach him, «waits for the answer without
    moving», then leaves for his position, and the turn runs on to the enemy's arrival. The DM may not answer for the
    hero, so the question hangs. Do: a question put to the hero ends the turn (the player answers next), or the DM
    does not ask it — the companion states what he needs to state. One exchange of a conversation per turn, as the
    role already says.

52. **The coins sit as three loose counters in the wrong order** (owner, 16:05: «монеты тоже выглядят спорно… это надо
    как-то упорядочить и убрать»). After the loot the DM added silver and copper as their own counters, so the side
    panel shows «Зм 10 / Мм 26 / См 11» — three full rows among the spell slots, in the order they were created
    (gold, copper, silver), with bare abbreviations; the inventory header repeats «10 Зм · 26 Мм · 11 См». Do: money is
    one wallet line in the system's order of value — «Кошелёк: 10 зм · 11 см · 26 мм» (5e: пм, зм, эм, см, мм) — the
    full coin name on hover, and the wallet is not a resource counter at all; the same line on the inventory. With
    item 33 («Зм» → the word) and item 32 (counters with Latin names: «Shaman tusk», «Arcane recovery»,
    «Healing potions» — show Russian labels).

53. **The turn arrives in halves with «Ведущий думает…» in the middle** (owner, 16:07: «ведущий как будто вначале
    выдаёт половину хода, потом думает и продолжает — как так?»). By design: the DM writes up to the moment that needs
    dice, calls `roll`, the server rolls, and the DM continues from the result in a new request (the loop joins the
    segments) — so the outcome is never decided before the dice. Here the pause was the enemies' saving throws and the
    damage for the hero's Lightning Bolt — private NPC rolls, so the player sees only a gap and a generic «думает».
    Do: name the pause by what is happening («бросаю спасброски противников…», «бросаю урон…», «записываю
    добычу…») from the tool being run; show the public part of the roll at that point (the hero's damage dice; enemy
    saves as «спасброски: двое из двух провалили», no numbers if the guide hides them); keep the gap short (the second
    request reuses the cache).

54. **The planned ambush went off without the hero** (owner, 16:09: «эээ, а как так вышло?»). The hero's plan: wait
    until both enemies are on the platform, give the bird call, Lightning Bolt both. The DM rolled initiative: the hero
    a natural 1 (total 3), so the surprised enemies lost round 1 but the prisoner (jumped off as agreed) and the
    sergeant (shot the second enemy off the trunk) acted before the hero; when his turn came the line was gone. RAW
    5e — the well-known ambush problem: whoever springs a planned ambush can roll low and act last. Three faults on
    top: (a) the hero's trigger is not in the story — no bird call is told; the prisoner just jumps while the second
    man is still climbing, against the hero's «жду, пока оба залезут», so it reads as if the DM sprang it early;
    (b) the hero's initiative roll was not shown — the player learned it from the aside; (c) the story says the hero
    «finally finishes the formula» while the others act, as if casting took the round — in 5e a spell is cast on one's
    own turn, nothing is half-cast. Do: the guide says how a planned ambush starts (owner's choice — see below), the
    hero's initiative is a visible roll, and the story shows the trigger the player named. Owner decision pending: RAW,
    or a house rule — «тот, кто начинает подготовленную засаду, действует первым; остальные действуют по его сигналу».

## Combat — a separate stage (owner, 16:15: «можно будет отдельно что-то по бою сделать»)

The second fight (the shift ambush) again shows the panel at «Раунд 1» with every participant at «Действие 1 · Движение
1 · Реакция 1», the party listed first, no wounds («Кривой — Рядом» though he lies with a bolt in his back). Group the
combat findings into one stage after the voice fix, built on the owner's planned combat screen (initiative ribbon with
portraits, «Зоны / Карта», enemy cards with wounds in words, «что известно» from checks, enemy intent only when
noticed, action hints from the sheet, an end-of-fight summary; no system rules in code):
- the DM's combat tool: initiative order from the rolls, «next turn» and rounds, conditions (paralysed, prone,
  concentrating, surprised, fled), wounds in words, resources per turn (item 45);
- every hit has a visible damage roll; enemies and animals get stat-block HP (item 46); enemy gear as items so loot
  works (item 48);
- the hero's initiative is a visible roll; a planned ambush starts the way the guide says (item 54);
- a round's rolls in one compact block, companion and enemy rolls as lines rolled by the DM, the hero's important rolls
  as cards (items 43, 44); the mid-turn pause named by what is rolled (item 53);
- the battle map (owner, 17:15: «у нас есть зачатки нормальной карты боя — оно достаточно чётко меряет расстояния; сможем
  сделать как в Friends & Fables»): the DM already keeps positions, heights, cover, light radius and distances in feet
  in its asides — but in its head, so the scale drifts (40 paces = 120 ft at noon, 50 paces = 120 ft at night). Move
  them to the server: participants and features (cover, light sources, difficult ground) with coordinates on a 5-ft
  grid over the place's painted picture (item 31 — the location paintings become the background), distances, ranges
  and light computed by the server and given to the DM as text, the DM moving tokens with its combat tool, the player
  dragging his own token = an intent in the action box. Friends & Fables (reference): AI-moved tokens on battle and world
  maps, players may move their own; its surprise round lets a party that sneaks successfully act before the enemies
  (one answer to item 54); characters die at 0 HP there — we keep 5e dying and death saves.
- tests on the 48-scene probes plus two scripted fights (an ambush, a chase) before the owner's acceptance pass.
- speed (owner, 16:16: «по бою оно, конечно, немного долго думает»): a combat turn is several model requests (one per
  roll the DM waits for), and combat runs at the top of the depth range (very high), so every continuation thinks long
  again. Try: the continuation after a roll runs at a lower depth (the plan is already made), the DM batches the
  round's rolls in one tool message, and the pause is named (item 53). Measure seconds per combat turn before/after.
- good in the same fight: the DM ruled that the two missed rays set the dry needles and the lantern oil on fire (not
  in the 5e text of Scorching Ray, a sensible ruling — owner: «то, что оно всё горит, — это хорошо, это физика»), and
  turned it into a clock with a consequence (the crown catches in two or three turns, the glow is visible from the mine
  a mile away).

55. **Loot can be seen but not handed out** (owner, 16:36: «экран имущества странный… всё имущество отображается, но я
    не могу его раскинуть по инвентарям»). The loot now sits in «Лагерь · общий запас» (the vest, rations, the red
    cloak, the morningstar, a bedroll) — good, nothing lost this time. But there is no way to move a thing to the hero,
    a companion or the horses' saddlebags: the item card's «Передать…» only writes «Передаю «…» » into the action box
    (`character-screen.tsx`), so every move costs a DM turn. And the places are abstract: «Лагерь» is «what nobody
    carries» while the party is in a forest an hour from camp; the horses («Казённые лошади стражи») hold 0 items, list
    the three riders as «на борту» (item 35) and have an empty «Характеристики». Do: owner moves between inventories
    without a turn — drag between the hero's, the companions' and the mounts' lists (BG3-style), or «Отдать → Брам /
    Тоби / седельные сумки / себе» on the card — recorded as an owner move the DM sees next turn; while travelling,
    the party's shared things are on the mounts, «Лагерь» is a place you set up; mounts are not a crewed holding.

56. **Item 32 again: a turn lost to max_tokens → provider error** (owner, 16:43: «DM не удалось завершить это действие…
    я начал читать, там всё было логично»). Operation `0b6dc33d-…` (app.log): the owner asked for loot handling, both
    fake cloaks put on, and the sergeant's plan for the night. Request 1 ran at xhigh: 104.7k input, first text after
    131 s, **16,000 output tokens — stop `max_tokens`** (176 s, $0.511), 10 tool calls executed (item ×2,
    upsert_character ×3, note_character ×2, note_world ×3), the narration cut off mid-stream. The continuation request
    (400 KB) then failed at once: `dm_loop_failed code=provider retryable=false`. Same chain as the first turn of the
    session (`7dadd0c2-…`, 10,000 output). So the cap was raised from 10k to 16k but the real fault remains: the
    continuation after a truncated response is rejected by the provider (most likely the cut-off assistant message ends
    in an incomplete block), and the whole turn is lost after three minutes. Do (priority, with item 32): on
    `max_tokens`, drop the incomplete last block and continue from the complete ones (or retry once at one depth lower);
    set the output cap from the depth (xhigh thinking alone can take most of 16k); never lose the streamed narration
    the player already read; log the provider's error text (secrets filtered) instead of just «provider». An open
    planning question («какой план?») at xhigh is the typical trigger: long thinking plus many private notes.
    **Owner decision (16:47): «поднимаем запас до предела»** — after the session (he works around it by splitting big
    requests until then). The output cap of a DM request becomes the model's own maximum from
    `model-runtime/capabilities.ts` (128k for the current models) instead of 6,000 + `thinkingAllowance` (`loop.ts`),
    for every depth and both providers; the narration-length guidance stays in the prompt. Plus the continuation fix
    above. Log every turn over 32k output (tokens, seconds, cost) so a runaway is visible.

57. **The whole session's transcript unfolds under the play screen** (owner, 18:49: «там внизу какая-то … — оно мне
    почему-то выгрузило всё по игре»). Opening «Редактор кампании · для владельца» under the story shows the owner
    tools (combat readiness, session as a record, «Правка точки продолжения», «Добавить запись в стенограмму»,
    «Сессии») and then «Стенограмма»: every record of the session as a full card with «Исправить запись истории» —
    the entire story a second time, with English headings («Player action», «DM») and «Записано с редакцией настроек N»
    under each. The panel stays open, so the play page grows by the whole session. Do: owner tools live on their own
    screen (or a drawer), not under the story; the transcript is a compact list (time, who, first line) that opens one
    record to correct; Russian headings; with items 24–25 (admin panels that «повылезали»).
    Cause found (18:54, owner: «а негде закрыть»): the owner did not open it — `game-screen.tsx` renders the panel as
    `<details open={combat || <an unresolved mechanic turn> || undefined}>`, so it is forced open the whole time an
    encounter is active and every poll of `/play` (each 1–2 s) re-opens it; clicking the header cannot close it. Since
    the combat panel never advances or ends on its own (item 45), the transcript hangs under the story for the whole
    fight. Do: never force the owner panel open; if combat needs a tool from it, put that tool in the combat panel.

58. **A finished turn thrown away by a «conflict»** (owner, 18:51: «оно просчитало ход, там были хорошие идеи, и
    какая-то … случилась»; screen: «Попробовать снова» and «Записи кампании изменились. Проверьте актуальное
    состояние перед новым действием»). Operation `8a6f627f-…`: 10 model requests at xhigh over 5.1 min, 13 rolls,
    then records (resource ×2, upsert_character ×3, item), the last request ended normally — and the commit failed:
    `dm_loop_failed code=conflict`. Cost lost ≈ $2.80. The only other write in that window in app.log is a
    `POST /api/visual-frame` (a `pictures.*` action — most likely the background picture job for the previous turn)
    right as the turn began; the play page also polled `/play` every 1–2 s. Most likely a race: a picture record bumped
    the campaign revision the turn was fenced on. Do (priority): picture and media writes must not move the revision
    that fences turns (or the turn rebases when the concurrent change touches nothing it changed); a conflict at commit
    retries the commit, not the whole turn with new dice; the narration already streamed is kept. Same turn shows the
    cost of rolling one die per request: requests 2–8 were each one to three rolls at ≈130k input, $0.22–0.25 apiece,
    with no cache written inside the turn (cache share 0.55–0.64) — batch a round's rolls and put a cache breakpoint
    on the growing turn so continuations read it from cache.
    Then (18:55) the owner pressed «Попробовать снова»: `POST …/turns/8a6f627f-…/resume` → 422 twice, and the screen
    said «Действие требует уточнения или использует неподдерживаемые правила. Последствия не применены» — wrong and
    frightening; nothing in his action was unsupported. The failure was logged `retryable:false`, yet the UI offered
    «Попробовать снова», which cannot resume a conflicted turn; the way out is «Другие действия → Отказаться от этого
    действия» and sending again. Do: offer «Попробовать снова» only for retryable failures, make it actually rerun (or
    recommit) the turn; for a conflict say plainly «пока шёл ход, изменились записи (картинка); ход не сохранён —
    отправьте ещё раз» with one button that resends the same text.
    «Отказаться от этого действия» fails the same way (18:57): it posts `action: "cancel"` to the same `/resume`
    route → 422 again (eight 422s in the log). Both buttons on the failed turn are dead, the screen keeps «Ведущий
    думает…» and shows no «Отправить». The original `POST /turns` came back 409 after 5.1 min; the client stayed in its
    «retry» state instead of re-reading the turn (failed, `retryable:false`, which `runDmLoopTurn` treats as final).
    Workaround given: copy the text, reload the page. Do: after a 409/422 the client re-reads the turn and, for a final
    failure, frees the composer; «Отказаться» must work on any non-committed turn (check why the cancel payload fails
    validation — the request shape vs `rpg_runtime('cancel')`), and a test covers conflict → cancel → new turn.
    **Resolved by the local session (19:07) — the real cause, correcting the planner's guess above:** not a picture
    write (the runtime revision stayed 450 = the turn's expected revision). The turn got a **300-second lease** at the
    start and nothing renews it; it ran 5.1 min (xhigh, 10 requests), so the commit was refused (`rpg_conflict`) and
    `store.fail` was refused by the same lease check — the row stayed `generating` with an expired lease. The public
    turn then said `canRetry: true`, but `retry` requires `status = failed` → `requireRule` → 422. «Отказаться» never
    reached the server: the client keeps the first failed command in its journal (tab `sessionStorage`) and re-sends it
    on every later click, so each «Отказаться» re-sent the old «retry»; a reload keeps it (a new tab would not). The
    page did re-read the turn after the 409. Unstuck through the app's own cancel route with a fresh command: status
    `cancelled`, campaign revision unchanged, no other rows touched, no restart. Do (priority, all three): renew the
    lease while a turn runs (heartbeat per model request) and size it from the depth; a lease-expired turn can still be
    marked failed (by the owner of the operation) and is then retryable or cancellable; the client drops a failed
    command from its journal so the next button sends its own action. Risk until then: the session-2 depth change puts
    tense scenes at xhigh, so turns over 5 min will stick again — the local session keeps the recovery recipe.

59. **Turn speed** (owner, 19:09: «ход на пять минут — это в целом п…ц»). From app.log, the last 41 turns of the
    session (`dm_loop_turn`): **high** — 18 turns, median 49 s (max 124 s), first word median 22 s, median cost
    $0.27; **xhigh** — 23 turns, median **161 s** (2.7 min), first word median 50 s, median 2 requests (max 8), median
    cost $0.55 (max $2.03; one 62-min outlier includes waiting for the player's dice). 16 of 41 turns took over two
    minutes; total ≈ $23.3 for the 41 (plus ≈ $3.3 in lost turns). The session-2 depth change sends tense scenes to
    xhigh, and most of this evening was tense, so more than half the turns ran 3× slower and 2× dearer than at high.
    Do (speed is a first-class target: a normal turn ≤ 45 s to the end, first words ≤ 15 s; a combat round ≤ 90 s):
    (1) depth — xhigh only on the DM's explicit «важный ход» or the owner's button, not on every tense scene;
    continuations after a roll at low depth (the plan is made); (2) one request per round, not per die — the DM asks
    for all of a round's rolls in one tool message, the server can roll an attack with its damage in one call; (3) a
    cache breakpoint on the growing turn so each continuation reads ~95% from cache (today 0.55–0.64); (4) the lease
    renewed per request (item 58); (5) the session report charts turn time and cost by depth and by scene type.
    Mid-session workaround offered: set both ends of the depth range to «высокая».
    **Owner decision (19:12): approved — (1) xhigh only for «важный ход», continuations after a roll at low depth;
    (2) one request per round, attack with damage in one roll; (3) a cache breakpoint inside the turn** — together with
    the lease renewal (item 58) and the output cap at the model's maximum (item 56). The owner set both ends of the
    depth range to «высокая» for the rest of session 2. These five form the «speed and reliability» stage; it goes
    first in the fix cycle, before the voice fix, because lost and stuck turns block play.

60. **The hero's own strike is missing from the story** (owner, 19:14: «какой … вспышки?»). The hero's action: signal
    the sergeant, send the prisoner to oil the barracks, Lightning Bolt the Grey through the window. The narration
    shows him readying the bolt («губы уже держат первое слово молнии… остаётся дождаться, когда тень подойдёт к
    окну»), then the sergeant's strike, then «Гвоздь… бежит прямо на свет вспышки» and the office on fire — the bolt
    itself, the flash, the hit are never told. Only the aside says it: «Серый увернулся наполовину, 9 урона из 19…
    ушёл „Туманным шагом“ на склон». The turn is written in pieces (text → roll → continuation); the piece after the
    roll started from the next actor and skipped the event the roll decided, as if already told. Do: the continuation
    after a roll narrates that roll's outcome first; a check before finish_turn — every hero attack, spell or check
    rolled this turn is told in the narration (a hint back to the DM if not); the aside never carries an event the
    story did not show.
    Recurs after the guide's «каждый бросок — в рассказе» line (20:50, owner: «нет описания, где в морду коня
    влетает снаряд»): the chase turn's text ends before the hero's Fire Bolt at Dirk's horse and the continuation starts
    with «Вспышка гаснет…» — the hit itself is untold; the aside says «попал (23), 8 урона». And this hero attack showed
    no roll card at all (only the Animal Handling check did). So a prompt line is not enough: the continuation rule and
    the pre-finish check must be in code; the hero's attack rolls must always be cards (or timeline lines, item 63).

61. **«Режь ему глотку, пока держу» became two crits and a live man** (owner, 19:17: «по Сому пришло два удара, 10 и
    12 — он что, железобетонный? Как он может пережить два крита? …ход написан плохо»). The DM ran the order as
    ordinary attacks: the bound, gagged, paralysed sergeant took two automatic crits (12 and 10 damage) and is «ранен»
    — RAW for a 5e Veteran (58 HP), but the story told the blows as deadly («в бок под рёбра… входит глубоко»,
    «тёмное толчками течёт»). Two faults: (a) the narration of a wound does not match the hit points left — a 10-point
    hit on a 58-HP man is told like a killing stab; (b) the order was an execution of a helpless man, not a combat
    exchange, and 5e (2014) has no coup-de-grâce rule, so the DM fell back to HP. Do: the guide says wounds are told in
    proportion to the HP left (light / bloodied / badly hurt / down); owner decision pending on a house rule —
    «Добивание беспомощного: если цель без сознания или парализована и не может сопротивляться, а у нападающего есть
    время и клинок, удар в горло или сердце убивает сразу, без бросков»; the turn as a whole also lost the hero's
    lightning (item 60).
    **Owner decision (19:19): yes — add the house rule, and «чтобы такого не было».** Given to the owner to paste into
    the campaign's DM guide (section «Бой»), now: the coup-de-grâce rule, «раны — по хитам» (light / bloodied / badly
    hurt / down, a deadly-sounding blow only at 0 HP), and «каждый бросок — в рассказе» (every hero spell, attack and
    check told in the story first, damage rolled by formula, the aside never carries an untold event). In code (fix
    cycle, owner-approved): the item-60 check before finish_turn and the continuation-after-roll rule; the session
    report flags wound descriptions that do not match the HP band.

62. **The app slowed to a halt after a good turn** (owner, 19:26: «Не удалось подтвердить сохранение. Черновик остался в
    форме», then a full-page «The campaign store could not be reached»). app.log: the turn itself **committed**
    (`5194936e-…`, high, 186 s, 7 requests, 26 tools, $1.74 — combat). Right after, `/play`, `/memory` and
    `/api/campaigns/<id>` went from ~1 s to 14–50 s, then 503; the page layout threw «campaign store could not be
    reached»; even `proxy.ts` time rose to 2–19 s, i.e. the whole Node process (or the machine) was starving, not only
    the database. The play page polls `/play` every 1–2 s; once a read takes longer than the interval, requests pile up
    and the server collapses. The owner's laptop is known to run hot under load (Docker Supabase + Next dev server +
    browser + the local Claude session). Do: the play page backs off when a read is slow or fails (no overlapping
    polls; exponential backoff on 5xx), or moves to server-sent updates; `/play` gets lighter (no full transcript);
    after a committed turn the client confirms from the stored turn, never shows «не удалось подтвердить сохранение»
    for a turn that did commit; the report records the machine load if the local session can.

63. **The turn is shown out of order: text appears, vanishes, then a roll card from nowhere** (owner, 19:40: «он вначале
    печатает, потом исчезает, потом проверка непонятно чего… давай всё последовательно: действие — бросок —
    напечатал»). In the fireball turn the narration streamed (the hero signals, stands, throws the bead of fire), then
    the streamed text disappeared and the screen showed only a card «Спасбросок Ловкости от огненного шара Серого…»
    above the action box — with no text to say the Grey had cast anything. The turn view puts all roll cards in one
    block above the narration, and the live text of the current segment is dropped when a roll arrives. **Owner
    decision: show the turn as one timeline in the order it happened** — text → the roll card at the point where the
    story asked for it → the continuation → the next card…; text already shown is never removed; a paused roll waits
    in its place («Дальше» / reveal there). Display only: the dice stay honest (the DM still writes up to the roll, the
    server rolls, the DM continues from the result). Together with items 43 (compact round block), 53 (name the pause)
    and 60 (every roll told).
    **Owner, 19:55: «это нужно править прям остро — ход выглядит как припадок эпилептика».** Moved into the first
    stage («speed and reliability», item 59) as its sixth part: the turn timeline (this item) with the round block
    (43), the named pause (53), damage and HP shown (64) and the reaction pause (65) — one coherent turn view.

64. **Owner wants enemy hit points and damage on screen** (19:42: «нет отображения урона и нет ХП врагов — непонятно,
    сколько у кого… очень неудобно; но последствия фаербола показаны хорошо, вещь мощная»). The first turn after the
    guide's Revision 3: the coup de grâce worked (one blow, the bound sergeant dead), the hero's Fireball and the
    Grey's answering Fireball are both told in the story, wounds are told by severity. But the damage (Fireball 21, the
    hero's half 11) lives only in the aside, and the enemies' HP is hidden by the 5e guide («хиты противников
    скрыты»), so the player cannot follow the fight — and nobody can check the new «раны по хитам» rule (Kadrik «тяжело
    ранен» after 21: true for a 32-HP thug, false for a 58-HP veteran). **Owner decision: show them.** Do: the combat
    panel shows every participant's HP as a bar with numbers (BG3-style), updated by each damage roll; damage rolls
    appear in the turn timeline next to the hit (item 63) with dice and total; the guide drops «хиты скрыты».
    Mid-session: the owner can add one line to the DM guide asking for HP numbers and damage dice in the aside.

65. **Enemy attacks resolve without the player — no chance for reactions** (owner, 19:47: «Гвоздь машет скимитаром, но
    маг уходит за колесо… мы ж не кидали проверку»). RAW the attacker rolls against the hero's AC (no dodge check), and
    NPC rolls are private, so the player saw neither the roll nor the AC it was against. The bigger gap: the enemies'
    turns are played inside the DM's turn, so the hero never gets to use a reaction at the moment it matters — Shield
    when hit, Counterspell against the Grey's Fireball (this time no 3rd-level slot was left), an opportunity attack.
    The DM's aside even says «Щит (реакция) доступен», but nothing asks. Do: when an enemy hits the hero or casts at
    him and the hero has a usable reaction, the turn pauses at that point («Кадрик попадает: 17 против КД 13 — ставишь
    Щит?») with the reaction as one button, then continues; enemy attack rolls show in the round block (item 64);
    mid-session workaround: the player pre-declares reactions in his action («если по мне попадут — Щит»).
- the hero downed (19:57): the death-save card arrived before any text, so the owner saw «спасбросок от смерти» without
  knowing he had fallen (item 63). The DM was honest about the reaction: the Grey's Scorching Ray rolled 26 (natural
  20), 23 and 20 against AC 13, and the aside says Shield (AC 18) would not have stopped any of them. Odd: the sergeant's
  two hits landed but their damage was «deferred to the start of the next turn» — most likely the per-turn tool/check
  budget ran out; a combat round must be able to finish its own damage (one request per round, item 59). Good: the
  DM's turn ends on the right question — the hero is unconscious, the companion decides, the player may hint.
- the hero's second death save (20:03): the owner spent one of the session's allowed rerolls («иначе кампания тут бы и
  закончилась… жёстко, но зато честно»), and the companion then did exactly what the owner hinted — finished the enemy
  (13 damage on 13 HP left), dragged the hero out of the caster's sight, poured a potion (4 HP, the minimum); the boss
  withdrew. Owner: «у нас был тейк, чтобы не было Мэри Сью — это не Мэри Сью». Two display faults on the rerolled
  card: the label still says «Провал на единице» though the new die is 10 (the natural-1 flag of the first roll was
  not cleared), and «Кольцо малой защиты +1» with «10 + 2 = 12» counts +2 for a +1 ring (a death save has no other
  modifier; the ring does apply — RAW, it is a saving throw). For item 37: the reroll the plan wanted to remove just
  saved the campaign — decide with the owner whether it stays as a visible, limited luck resource (like Inspiration)
  instead of a hidden preset.
- after the fight (20:13, owner: «хорошо и интересно»): payoffs land — the captive's ring returned to its owner, the
  merchant shouts «Крицы в третьей!», the freed captives turn on the prisoner who robbed them while he holds the hero
  to his promise (recorded as «Слово за Щепу»). Mage Armor AC 16 correct (13 + Dex 2 + robe 1). One bookkeeping
  question for the report: the hero went from 4 HP (the sergeant's potion) to «12 из 32» in this turn with no potion,
  rest or hit die told — check the receipts for an untold heal (and that his own potion is still counted).

66. **Modifiers counted twice — the hero's rolls inflated** (seen 20:18). The Investigation check on the burned office:
    the card says «Шляпа исследователя +1» and «7 + 15 = 22», but the hero's Investigation is +7 and the hat +1 → the
    total should be 7 + 8 = 15. At 14:33 the same skill was right (18 + 8 = 26). The rerolled death save showed the
    same kind of error (+1 ring counted as +2). Most likely the DM passes the sheet skill (`skill`, the server adds
    +7) and also writes the number into the formula («1d20+7»), so the server adds it twice. Both outcomes stood this
    time (15 meets DC 15; the death save passes at 11), but it silently inflates the hero — the opposite of what the
    owner wants («не Мэри Сью»). Do: `roll` refuses a formula with a modifier when `skill` or `modifierField` is given
    (or strips it with a hint); the card shows every addend so a double count is visible; the report lists every
    hero roll whose total ≠ die + sheet + listed bonuses.

67. **The DM decided for the hero** (owner, 20:55: «странный диалог. и ДМ решил за Джеймса»). The hero ordered the
    sergeant to put down the burned horse, take the papers to read on the way and gallop back to the merchant. The
    sergeant refused (fine — a companion has his own will), but then the narration settled the dispute itself: a
    line with an ambiguous subject that reads as the hero giving in, the party riding back at a walk instead of the
    declared gallop, and the papers read only later, at the stream. (The closing out-of-game note did leave the
    order open — «if you insist, he'll do it» — but the walk and the hero's acceptance were already narrated.) The companion's real argument (the horse is worth about half a
    year of a guard's pay; a farrier in Beregost; the caravan can pick it up) was given as the narrator's aside about
    what he «knows», while his spoken reason was pity. The owner liked the idea itself («про продать коня — хорошая
    идея»). Same family as 50 (time cost paid without asking) and 51 (a question to the hero must end the turn).
    Do: when a companion objects to the hero's order, the companion says his argument aloud and the turn ends on
    that objection — the narration never accepts, changes or replaces the hero's declared action or its manner
    (gallop, read on the way); every declared sub-action is either shown or explicitly deferred. Probe scene: an
    order the companion disagrees with.

68. **A name with no anchor, and a deduction said three times** (owner, 20:58: «что значит „Тарр знает, что стража
    не спит“? Тарр — это город»). Correction (21:05): Tarr is a person — the next turn names the man at the
    merchant's scales Tarr; the planner first misread the line as a town used as a person. The real problem is that
    the owner did not know who Tarr was: the DM dropped the name with nothing attached (who he is, where). The line's
    first half restated what the intercepted letter says in plain words, and the sergeant's own deduction from the
    previous turn, in the «X. Значит, Y» template; its second half was a stock formula instead of the thought (he is
    now warned the watch is on the temple). In the same turn the merchant's good thought (a man bled on his
    doorstep and he still writes about money) came out as a broken phrase. Voice stage: a name that has not been on
    screen for a while comes with its anchor («Tarr, the merchant's clerk»); a companion does not restate what the
    scene just showed. Probe scene: companions react to a letter everyone has read.

69. **The reveal closed with a quip; gestures and verbal tics repeat** (owner, 21:05: «странно читается»). The
    narration showed the clue well (the scrubbed, sanded threshold in a dry yard, after the letter mentioned blood on
    the author's doorstep), then the merchant's line turned the discovery into a wry punchline instead of saying
    what it means to him (his own man wrote the letter). The same turn repeated the scout's swallow and verbal tic
    and the sergeant's strap gesture again — a touch the owner liked once is now a tic. The out-of-game note also
    corrected itself mid-sentence (Mage Armor «holds until nine… already gone, so AC 13») — the note should be
    written from the state, not drafted aloud. Voice stage: a companion's signature gesture or word at most once per
    scene; the report counts repeats per companion.

70. **Good: an honest «no» from magic, and the world gives a clue instead** (owner, 21:09: «а вот это классно»). The
    hero suspected a trap on the scrubbed threshold and cast Detect Magic as a ritual; it found nothing, and the
    narration gave a physical clue in its place (blood left in the cracks under the sand, a bucket of pink water
    that is then thrown out in front of him). Rules handled right: ritual casting from the book (+10 minutes, slot
    kept), concentration up to 10 minutes, the approach needed to bring the door into range, Stealth against the
    clerk's passive Perception (a tie succeeds). One unit slip: the spell's 30 feet were told as «тридцать шагов»
    («thirty paces»), while the DM's own scale this session is about 3 feet a pace (see the crossbow range above) —
    30 feet is about ten paces. No effect this time (the hero passed two paces from the door), but the same slip
    would matter for Fireball, Hold Person or a crossbow's range. Do: the guide states one distance unit — feet, as
    in the rules, with paces only as «about a third» — and the battle map uses the same.

71. **Hidden DC again — the out-of-game workaround wore off** (owner, 21:23: «снова проверка, но непонятно значение,
    от которого нужно было выиграть»). An Intimidation check with advantage (11 · 12 → 12) showed «Неудача» with no
    target number. Same cause as 39 (`showDc` off, toggle hidden under «Логика мира»); the owner's earlier note
    asking for the DC in the roll title had dropped out of the context window. The app log does not record `dc`
    either, so the session report must take DCs from the roll receipts. Do: DC visible by default for the hero's
    checks; until then the rule lives in the owner's guide, not in a one-off note.

72. **A motive told as a riddle; a person's name used as a place** (owner, 21:33: «спорная логика»). The villain's
    motive for taking the caravans whole (vanished caravans make the watch look helpless, so the merchants sign his
    offer to guard the road for a toll — unlike bodies on the road, which point to ordinary bandits) came out as a
    two-part aphorism with the key link missing and no object for «sign», so the conclusion did not follow. Two more
    closing formulas followed in the same exchange (the captain's parallel, the sergeant's «and the debt
    remains»), and the strap gesture again. The captain also named the road's end after the wounded man from the
    letter instead of a place. Do: motives and deductions are said as reason → consequence with every link; the
    report checks place and person names in each turn against the campaign's records. Canon used well: Amn's
    licence for arcane magic, Feldepost's, the Zhentarim.

73. **Second max_tokens failure — on the long rest** (21:34, owner: «что снова?»). The move «long rest, in the morning
    a council at the captain's» ran at high depth; request 1 wrote 20 tool calls (money, seven `resource` calls,
    five `upsert_character`, `upsert_place`, two `quest`, three `note_world`, `note_character`) and stopped at
    `max_tokens` with exactly 10000 output tokens (4000 thinking + 6000); request 2 then failed as «provider»,
    `retryable: false` — the same chain as 56. About $0.44 lost. Two extra findings: the DM restored resources
    one by one instead of calling `rest` once, and a scene-closing move (rest + time skip + quest and world
    bookkeeping) is the heaviest kind of turn, so it is the first to hit the cap. Do (stage 1, already approved):
    the output cap to the model maximum; on `max_tokens` with a cut tool call, drop the cut call and continue
    instead of sending it to the provider; `rest` restores every rest-based resource in one call; bookkeeping
    tools may run in a follow-up request after the story is shown. Previous turn's diagnostic also flagged
    `time_words`: the text said «night» at 11:40.
    Owner, 21:39: raise the cap now, mid-session. Checked on `claude/session-2-prep`: the cap is one constant
    (`dmLoopLimits.maxOutputTokens`, 6000) plus `thinkingAllowance`; the Anthropic adapter streams; the reservation
    estimate (`dmRequestReservation`) has no callers, so a larger cap costs nothing until tokens are written;
    narration stays bounded by `maxNarrationChars` (12000); no SQL check on it; one test pins it
    (`tests/stage4-dossier.test.mjs`, 6000 + 10000). Set to 32000, not 128000: at about 95 output tokens a second
    a 300-second lease ends near 28000 tokens, so anything higher is unusable until lease renewal lands. Hotfix
    handed to the local session.

74. **Good: the inventories after a long expedition** (owner, 21:44: «предметы Брам заботливо себе складывал. Всё. Не
    потеряли ничего. Нормальный инвентарь после хорошего похода. У нашего героя тоже»). The sergeant carried the
    loot (scimitars, a light crossbow with its 5e line correct, bolts, armour pieces, a cloak, a horn); the hero's
    gear, magic items and coins are in order. Small UI points seen on the screenshots: the same ammunition sits in
    four separate stacks (16, 9, 7 and one) — merge identical items or show why they differ; the hero's coins read
    «зм · мм · см» — order them зм · см · мм; two hero items still show the «…» placeholder picture (drawing was
    off); the breadcrumb says «Сессия 1» for this campaign's first session, while the project calls it session 2 —
    harmless, but the report should name both.

## Session end (owner, 21:44)

The owner ended the play here: «мы отыграли длиннющую сессию, собрали кучу правок — предлагаю закончить, вытащить
данные сессии и добить правки». The last move (long rest, council in the morning) failed on max_tokens (item 73) and
was not replayed; the mid-session cap hotfix is not needed now and goes into stage 1. Next: «Закончить сессию» pressed
once by the owner, then the campaign stays closed until item 17's digest guard lands; the local session runs
`docs/SESSION_2_REPORT_PROMPT.md` into `C:\Dev\rpg-exports\session-2\`; the planner then writes the fix plan from the
notes and the report. Hypothesis for item 17 to check in the report: the digest asks for 6000 output tokens at xhigh,
whose thinking alone may use most of them — an «unparsed» digest may simply be a cut one.

75. **Party council works, but one line to a companion is a full DM turn** (owner, 21:49: «даже разговор со
    спутниками работает, правда отвечает он ебически медленно»). The owner asked the sergeant one question in «Совет
    партии». Log: it ran as a normal dm-loop turn (`a90d436a…`, turn 66) — the whole 405 KB context (128.7k input
    tokens), depth high («DM hint: tense»), first word at 22.7 s, done at 47.8 s, $0.30, four tools including
    `advance_time`. The turn's stream connection closed after 24.7 s while the request ran to 45 s, so the answer
    probably appeared only when the turn committed (check). Meanwhile the open game screen polled `GET …/play`
    231 times in about 13 minutes, each taking 3–5 s of server time (item 62), plus a `MaxListenersExceededWarning`
    on Gzip drain listeners. UI: the hero himself is offered as a «listener» in his own council. Diagnostic again:
    `time_words` — «morning» written at 12:00. Do: a council line is a light call — the companion's dossier, the
    scene and the last exchanges, not the whole world; depth low/medium; streamed; no tools except notes and time;
    the speaker is never a listener; polling backs off while a turn streams and `/play` gets cheaper.
    Follow-up (owner, 21:51: «он явно тупит — у нас вроде был этот самый отдых?»): the council answer was right — the
    long-rest move had failed (item 73) and nothing of it was committed, so it was still noon of day 2 with 12 HP;
    the owner believed the rest had happened. Do: a failed turn says plainly that nothing changed in the game and
    offers to resend the same move (the draft is kept). The `time_words` flag on this turn was a false positive
    («с утра» at noon means «since morning»). The answer itself reasoned well (why the clerk named the buyer, where
    the wounded man would go, where to catch the buyer with the iron); the gloves and the strap again.

## Pictures (owner, 22:00)

76. **Good: portraits, the hero, the map, and a place picture reused** («картинки персонажей очень-очень хорошие,
    главный герой тоже очень хорошо вышел, карта тоже топ… мы вернулись обратно — он ещё раз это использовал»). On
    returning to the Beregost guard post the app showed the place's existing picture instead of drawing a new one.
    Frames the owner singled out as right, with the hero recognisable: James taking the sergeant aside to the
    furnace; James giving orders between the furnace and the carts; James against the cart wheel casting Mage
    Armor; the mine yard. Owner's summary: «добились частичной консистентности персонажа и сильно лучших картинок».

77. **«Нарисовать кадр» throws the page to the top and, now, draws nothing** («как нажимаю — прокручивает к верху
    сквозь всю кампанию, а не генерирует в чате и сохраняет в галерею; и сейчас он больше не генерирует»). Code
    (`game-screen.tsx`): the button sends `pictures.frame` with `trigger: "redraw"`, swallows the answer
    (`.catch(() => {})`, the status is never read), and calls `scrollIntoView` on the frames panel at the top of
    the game screen — on a long campaign that is a scroll through the whole story. Why nothing is drawn now (log +
    code, to confirm): `currentFrameTurnId` takes the last turn with mode «game», which is the failed long-rest
    turn (item 73); it has no text, so `requestFrame` returns `no_text` in about 0.2 s — four such POSTs in the log,
    no `picture_frame_queued` after them (the last frame was queued before the failed turn). Do: the frame of a turn
    appears in that turn, in place, and goes to the gallery; the button targets the last turn with narration (never
    a failed one) and shows every non-queued status in words (off, cap — «дневной лимит», no text, waiting).

78. **A frame that does not match its caption, a generic wizard, and a frame for an out-of-game reply.**
    (a) «Горн выслушивает мага и кивает» — the picture shows an old hooded wizard, not James («он ж не абстрактного
    мага слушает, а Джеймса»): the shot names people by role, and `requestFrame` matches `shot.who` to records by
    name only, so «маг» finds no entity and the hero's references are not sent. (b) «Джеймс поднимается из-за
    корневища на колено, целится…» — the picture is a standing group talk with horses («вообще нет соответствия»);
    the lightbox caption is the turn's first sentence (`frameCaption`), while the picture is the moment the shot
    director chose from the whole turn, so caption and picture can be different moments; the sergeant also got a
    shield he does not own. (c) A frame was drawn for a turn whose whole narration was «(Вне игры: записываю.)», and
    that line is its caption. Do: role words (маг, сержант, купец, мальчишка) resolve to the scene's people, the
    hero first; the caption is the shot's own moment; no frame for an out-of-game-only turn; worn and carried gear
    from the records is a hard constraint (no shield).

Small, from the same screenshots: the party screen groups the sergeant, the scout and the hero under «Казённые
лошади стражи» (a holding of horses listed as their home); both companion cards show «Навык 0» (a 5e Veteran and a
Scout have real skills — Athletics, Perception, Stealth — so the DM's rolls for them may be at +0; check in the
report); the guard post's place record says «Раннее утро» — a time of day stored in a place description.

79. **Same face, same gaze in every frame** (owner, 22:05: «у героев всегда одно и то же выражение — Брам всегда
    эпично смотрит наверх направо, абсолютно всегда; они редко смотрят на другого героя»). The frame he showed is
    good otherwise (the gagged prisoner, the dead brute, the sergeant standing over them), but the sergeant again
    looks up and to the right — the head angle and expression of his portrait anchor, which also faces right — and
    again carries a shield he does not own (78). Likely cause: the face reference is copied with its pose and
    expression, and the brief gives no eye-line. Do: references are for identity only (the prompt says not to copy
    pose, gaze or expression from them); the shot director writes who looks at whom and each person's expression
    for this moment; portrait anchors in a neutral, front or three-quarter pose, ideally two angles; the report's
    picture check counts gaze direction per companion across frames.
    Follow-up to 76/78 (owner, 22:06: «сцена хорошая, картинки мы сильно пофиксили»): the empty night ravine frame
    keeps the place from the frame before it (the same tree platform, cliffs and stream bed) — the place anchor
    works across frames. It was drawn for an out-of-game exchange (the «ты» agreement), so 78(c) holds — here it
    happened to read as «the scene holds still». The reply's opening «*(Вне игры…» was rendered with the asterisk
    and a drop cap on «(В» — the out-of-game reply styled as narration (see the note under item 1's key finding).
    Follow-up to 78/79 (owner, 22:08): good — the sergeant crouching and drawing the route in the dirt, looking at
    his own map (an action, not a pose). Again wrong — the camp-fire frame for a turn whose narration says the
    prisoner looks «at the sergeant, at the fire, then at the mage» shows a hooded old wizard instead of James (78a,
    second case: the narration's role word «мага» reached the shot), and the people sit as if posing for portraits
    rather than talking («он как будто не беседует, а позирует для портрета») — 79. The sergeant's shield appears for
    the third time.
    Follow-up (owner, 22:09: «тут всё чётко, вот тут топ консистенси, но у Джеймса три руки»): the camouflage frame
    (ash paste and water from the skin, the burned platform) matches the turn and keeps the hero exactly — but one
    hand pours from the skin while two more cup the ash. Do: when the shot gives both hands a task, the brief says
    which hand does what («left hand pours, right hand holds the ash»); a cheap vision check after each frame
    (extra or missing limbs, wrong gear such as the shield) queues one automatic redraw or marks the frame for the
    owner; «Перерисовать» stays one click.
    Follow-up (owner, 22:10: «тут хорошо, но слегка не соответствует сцене: у Джеймса не было фонаря, и он вроде
    где-то прятался»): the raid frame (the sergeant gagging a guard, the mine yard behind) gave the hero an invented
    lantern and stood him in the open with a glowing staff, while the turn had him hidden; and his face is clean
    although two turns earlier he blackened it with ash paste — the frame that showed the camouflage was right,
    the next one forgot it. Do: props come only from the records (the lantern, like the shield, is a hard «no»);
    the shot carries the hero's position (hidden, behind what) and the light; a temporary look the story set
    (soot on the face, a burned robe, bandages) is kept as the person's current appearance until the story removes
    it, and the frame compiler sends it with the gear.
    Reference frame (owner, 22:11, shown as the example): the hero downed behind the burning cart, out of the
    enemy mage's sight, his hat fallen beside him; the sergeant standing over the dead bandit leader with a bloody
    blade — and the key on the dead man's neck chain, a detail from the story. Everything comes from the turn and
    the records (no invented props, no shield), the hero is recognisable, and people are placed by the action.
    Only nit: the hero at 0 HP is drawn with open eyes. Use this frame as the target in the picture stage's checks.
