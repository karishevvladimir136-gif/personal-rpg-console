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
