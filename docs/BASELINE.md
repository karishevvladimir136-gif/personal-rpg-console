# Исходная точка перед переделкой DM (этап 0)

Дата замера: 2026-10-15. Ветка `claude/stage-0-baseline` от `claude/rebuild-base` = `65dc99c`
(`codex/astra-fictional-world-freedom`). Игровой код (`src/`) и миграции на этом этапе не менялись.
Платных запросов к моделям не было. База владельца не затрагивалась (см. раздел 6, п. 3 — про HTTP‑тесты).

## 1. Проверки

| Проверка | Результат | Время |
| --- | --- | --- |
| `pnpm typecheck` | проходит | ~10–25 с |
| `pnpm lint` | проходит, 0 предупреждений | ~30–50 с |
| `pnpm build` | проходит | ~27 с |
| `pnpm test` (с изолированным сервером для HTTP‑тестов) | 2375 тестов: 2374 прошли, 0 упали, 1 пропущен | 494 с |
| `pnpm test` (HTTP‑тесты без сервера) | 2375 тестов: 2348 прошли, 26 упали, 1 пропущен | 482 с |

- Пропущенный тест — `live disposable Supabase Auth/PostgREST persistence checks` (включается только явно, так было и раньше).
- 26 падений во втором ряду — все из `tests/d1-http.test.mjs`, `phase2-http.test.mjs`,
  `persistence-http.test.mjs`, `preview.test.mjs`: им нужен запущенный сервер по адресу `PREVIEW_URL`.
  Я намеренно направил их в пустой порт, чтобы не трогать приложение владельца на `127.0.0.1:3000`.
  Финальный прогон шёл против отдельной сборки этой же ветки в отдельной папке без `.env.local`,
  без ключей и без базы (порт 3197; API отвечает `503 not_configured`).
- Среда: Node.js v24.19.0 и pnpm 11.25.0 из локальной среды Codex
  (`C:\Users\<owner>\.cache\codex-runtimes\codex-primary-runtime\…`); системного Node на PATH нет.
  Подробности по окружению — в разделе 6.

## 2. Стенд оценки

`node scripts/eval/run.mjs --scenario <имя|all> [--provider fake|live] [--budget-usd N]`,
сводка — `node scripts/eval/report.mjs <run>`. Описание формата — `scripts/eval/README.md`.

- Каждый сценарий начинается с новой кампании на одноразовой PGlite со всеми 51 миграциями:
  мир → создание героя → вступление → конфигурация → Astra takeover, как в
  `tests/astra-freedom-fixture.mjs` (`takenOver`). Между ходами база руками не правится; сохранения,
  загрузки и Character Model — через существующие RPC (`rpg_saves`, `rpg_character_model`).
- Ход идёт по настоящему пути: `runAstraTurn`/`resumeAstraTurn` (`src/lib/gameplay/astra-primary.ts`),
  настоящий провайдер `createAstraPrimaryProvider` (`src/lib/server/dm/astra-primary-provider.ts`),
  `createRpcTurnStore(..., { astraResponseContract: "unified-v1" })` как в продакшене,
  обслуживание памяти после коммита (`runWithAstraMemoryMaintenance`).
- Фейковый провайдер подменяет только HTTP‑ответ OpenAI. Каждый записанный ответ проверяется по той
  же строгой JSON‑схеме, что уходит в запросе (`scripts/eval/lib/schema.mjs`), — фейк не может сказать
  того, что живая модель сказать не смогла бы. В двухэтапном режиме тот же ответ делится на план и
  отдельного рассказчика.
- «Пробы» (`probe`) — намеренно плохое поведение модели, чтобы проверить, что гарантирует сервер,
  а что держится только на послушании модели. В живом режиме пробы пропускаются.
- Ограничения фейка: время хода — только серверная часть (без модели); токены — оценка «байты / 4»;
  ответы написаны мной «как попыталась бы модель» по её инструкциям, это не замер качества модели.
  Сводки памяти делает детерминированная заглушка (в продакшене — отдельная модель `memory.summary` в фоне).

## 3. Результаты 8 сценариев (фейковый провайдер)

Прогон `20261015-071031-fake-all` на коммите `6c5e1a9` (повторяемо: та же команда даёт те же итоги).
«Проверки» — основные ожидания сценария, «пробы» — проверки гарантий сервера.

| # | Сценарий | Итог | Проверки | Пробы |
| --- | --- | --- | --- | --- |
| 1 | Мельник: разговор → принятая работа → NPC и задание в том же ходу | не проходит | 2/6 | – |
| 2 | То же при NPC с Character Model | не проходит | 4/8 | – |
| 3 | Выполнение и оплата; повтор хода и «он мне ещё должен» | проходит | 11/11 | 0/1 |
| 4 | Новый пекарь продаёт хлеб; покупка без денег | не проходит | 4/6 | – |
| 5 | Съесть хлеб, отдать второй спутнику | не проходит | 5/10 | – |
| 6 | Сейв → загрузка → возврат к мельнику | не проходит | 10/13 | – |
| 7 | Награда 500 монет и трофейный меч | не проходит | 3/6 | – |
| 8 | Десять ходов выпытывания тайны NPC | проходит | 21/21 | 2/4 |

Все 33 обычных хода закоммичены (из 4 проб две закоммичены, две упали — так и задумано).
Ход «съесть хлеб» в первом варианте сценария падал целиком — см. п. 3.5.

### 3.1. Мельник (сценарии 1, 2, 6) — NPC и задание не создаются

- Нет ни одного эффекта, который создаёт NPC, место или задание «с нуля». Набор эффектов задан в
  `astraPlanResponseSchema()` (`src/lib/gameplay/astra-plan-schema.ts`): `job_offer`, `job_complete`,
  `job_reward`, `mundane_grant`, `currency_transfer`, `item_transfer`, `mundane_purchase`, `mundane_sale`,
  `mundane_craft`, `item_exchange`, `mechanic_actions`, `formal_rest`, `progression_award`, `unsupported_optional`.
- Задание (`job_offer`) может выдать только уже записанный присутствующий NPC вида `npc`:
  `issuerId` — enum `npcIds` в схеме, проверка `presentNpc()` в `src/lib/gameplay/astra-settlement.ts`.
  Инструкция `astraFictionAuthorityInstructions` (`astra-fiction-authority.ts`) прямо запрещает делать
  выдуманного NPC источником задания. Поэтому модель честно помечает «записать мельника» и
  «записать работу» как `unsupported_optional`, и сервер их отклоняет.
- Сейв/загрузка сами по себе работают: состояние после загрузки совпало с моментом сохранения,
  закрытое задание снова открыто (сценарий 6). Но «тот же мельник без дубля» проверить нечем —
  мельника нет в данных, при возвращении модель описывает его заново только по тексту прошлых сцен.
- Перемещения в новой кампании невозможны вообще: `astraCapabilities()` (`astra-capabilities.ts`)
  разрешает только локации из `worldTakeover.routeLocationIds`, а у свежей кампании этот список пуст.
  Мельница может существовать только как «под-место» внутри площади.
- Character Model (сценарий 2) не меняет результат, но переводит ход в двухэтапный режим
  (план + отдельный рассказчик) — 2 запроса вместо 1.

### 3.2. Оплата ровно один раз (сценарий 3) — по основному пути да, но держится на модели

- `job_offer` → `job_complete` → `job_reward` работают; деньги (валюта `coins`) создаются при первой выплате.
- Повтор того же хода (тот же operation ID) возвращает уже закоммиченный ход: 0 запросов к модели,
  повторной выплаты нет. Это гарантия сервера (durable begin).
- Повторный `job_reward` невозможен: оплаченное задание пропадает из enum схемы.
- **Проба не прошла:** если модель уступит игроку («он мне ещё должен») и заплатит через
  `mundane_grant`, сервер это примет — у героя станет 10 монет вместо 5. Ветка `mundane_grant` в
  `planAstraSettlement()` проверяет только, что у NPC нет этой валюты, и чеканит деньги заново;
  связи «уже оплачено» нет. Запрет есть только в тексте инструкции (`privateInstructions` в
  `astra-plan-context.ts`: «Never invent a reward or repeat an obligation that public evidence shows already paid»).

### 3.3. Пекарь и покупка без денег (сценарий 4)

- Пекаря и хлеб на продажу записать нельзя: `mundane_purchase` требует записанного продавца с публичным
  именем (`publicSellerIds`) и предмет из его запаса (`purchasable`); создать запас NPC нечем —
  `mundane_grant` выдаёт предметы только герою.
- «Без денег — ни списания, ни хлеба» проходит, но тривиально: покупать не у кого и нечего.
  Проверка баланса в `mundane_purchase` (`heroBefore >= price`) существует, но в этом сценарии до неё не доходит.

### 3.4. Хлеб и спутник (сценарий 5)

- Два батона получить нельзя: `grantOrdinary()` (`astra-settlement.ts`) всегда создаёт количество 1 с
  фиксированным ID `astra:grant-item` на ход, второй такой же подарок в том же ходу отклоняется.
- Съесть хлеб нельзя: `item.consume` в `src/lib/gameplay/mechanics/resolve.ts` разрешён только для предмета
  с меткой `healing` из `configuration.itemRules` (и сразу лечит); у кампании после takeover `itemRules` пуст.
- Спутника завести нельзя (ни один эффект не создаёт NPC и не меняет вид на `companion`), а отдать предмет
  NPC нельзя: `item.transfer` принимает только склады героя, ничьи или «рядом» (`storageIds` в схеме).

### 3.5. Отказ одного эффекта роняет весь ход, если текст от него зависел

В первом варианте сценария 5 модель описала еду одной фразой, привязанной к эффекту
(`requiresEffects: [0]`). Эффект отклонён → `unifiedNarration()` (`astra-primary.ts`) убирает фразу,
текста не остаётся → `DmError("provider", retryable)` → ход «упал, повторить». Такой ход блокирует все
следующие (`begin` → `rpg_conflict`), пока игрок не нажмёт «Повторить» или «Отменить». Стенд в этом случае
отменяет ход и пишет `cancelledAfterFailure: true`. Сейчас сценарий содержит и нейтральную фразу,
поэтому ход коммитится с отклонённым эффектом.

Также целиком роняют ход: ссылки на «чужих»/отсутствующих NPC и предметы (`assertEffectScope()`,
`assertAstraMechanicsScope()` вызываются вне `try` в `planAstraOrderedEffects()`), любые ошибки в базовых
`changes` (`validateFinal()`), нарушение формы ответа (`parseDecision()` в провайдере).

### 3.6. Награда 500 монет и меч (сценарий 7)

- Суммы в `job_offer`, `mundane_grant`, `currency_transfer`, покупке и продаже ограничены 1–20
  (`planAstraSettlement()`), эти лимиты модель видит в контексте (`settlementAuthoringCapabilities().limits`).
- Новые предметы — только `food`/`supply`/`misc` (`mundaneCategory`, enum `itemCategory` в схеме): оружия нет.
  Меч удалось выдать только как `misc` — его нельзя экипировать как оружие.
- Задание с такой наградой записать нельзя. Если бы модель попыталась одним `mundane_grant` выдать и
  500 монет, и меч, отклонилось бы всё вместе — валюта и предмет в одной выдаче не разделяются.

### 3.7. Тайна NPC (сценарий 8)

- Все 10 ходов закоммичены, тайна в публичный текст не попала, 1 ход с проверкой Insight встал на паузу
  интерактивных кубиков и продолжился. Это поведение записанной «послушной» модели, а не замер живой.
- Проба «дословная утечка» — сервер блокирует: `assertNoPrivateDisclosure()` (`astra-primary.ts`)
  находит приватную строку длиной ≥ 8 символов в тексте, ход падает (`validation`, без повтора).
- **Проба «пересказ тайны» не прошла:** перефразированная утечка («Smugglers, if you must know…»)
  проходит фильтр — он только литеральный (так и написано в комментарии к функции).
- **Проба «безобидная приватная деталь» не прошла:** упоминание «his sister Wenna» (поле Character Model)
  роняет весь ход. Сегодня рассказчик приватных полей не видит, но в плане (один ведущий видит всё) этот
  фильтр будет срабатывать постоянно и ронять ходы целиком.

## 4. Сколько запросов к модели делает ход

### По коду (`astra-primary.ts`, `astra-primary-provider.ts`)

| Случай | Запросы |
| --- | --- |
| Обычный ход без приватных данных в контексте (`public-unified`) | 1: план Astra `high`, текст в том же ответе |
| Ход с приватными данными (`private-informed`): Character Model в сцене, приватные факты/память, данные мира | 2: план `high` + отдельный рассказчик `medium` |
| Каждый вызов инструмента (query/skill/attack/save/damage) | +1 план‑запрос; весь контекст отправляется заново (без `previous_response_id`), до 32 шагов |
| Пауза интерактивных кубиков | сам по себе запрос не добавляет; ход ждёт «Продолжить» игрока |
| Сетевой сбой до ответа (≤ 5 с, ECONNRESET и т.п.) | максимум +1 автоматический повтор |
| После коммита | фоновое обслуживание памяти: 0…N запросов к отдельной модели `memory.summary` |
| Повтор того же хода (тот же operation ID) | 0 |

Режим выбирает `astraContextHasPrivateEvidence()` (`src/lib/gameplay/astra-privacy-context.ts`)
и закрепляет за ходом до первого запроса к модели (`pinAstraResponseMode`). Путь Astra включается только
при `RPG_ASTRA_PRIMARY_P1=1` и активном takeover (`selectAstraPrimaryRuntime()`); остальные кампании идут
по другой среде (`runTurn`, `turn-engine.ts`: план + рассказчик + подготовка World Logic) — стендом не измерялись.

### По стенду (37 новых ходов включая 4 пробы, без повтора)

- Режимы: 23 хода `private-informed` по 2 запроса, 13 ходов `public-unified` по 1, 1 ход с проверкой — 3.
  Медиана — 2 запроса на ход. Двухэтапный режим включается часто: первый ход новой кампании (данные
  мира после вступления), любой NPC с Character Model в сцене, приватная память.
- Размер одного план‑запроса 34–46 КБ (≈ 9–12 тыс. входных токенов), из них инструкции ≈ 8 КБ, остальное —
  JSON‑схема ответа и контекст хода (12–23 КБ). Запрос рассказчика — 14–25 КБ.
- Серверная часть хода на PGlite — 42–114 мс, медиана ~65–68 мс; фоновая память ~8 мс. Значит, почти всё
  время живого хода — ожидание модели.
- Для сравнения, прошлые живые замеры Astra (архив, `docs/archive/P0_RUNTIME_PRIVACY_LIVE_GATE.md`):
  9,8–11,3 тыс. входных и 160–1050 выходных токенов на план‑запрос, 4,7–26 с на запрос, полный ход
  ~22–26 с; в двухэтапном режиме (`docs/archive/ASTRA_PRIMARY_LATENCY_L1.md`) — 35–60 с.
- «Время до первого слова» сейчас измерить нельзя: стриминга нет, игрок видит текст только после коммита хода.

## 5. Что из этого следует для этапов

| Наблюдение | Этап плана |
| --- | --- |
| Нельзя создать NPC, место, задание, предмет у NPC, спутника; перемещения пусты в новой кампании | 2: `upsert_character`, `upsert_place`, `move_party`, `item`, `quest` |
| Одна выплата держится на инструкции, `mundane_grant` чеканит деньги повторно | 2–3: `quest claim_reward` + единый учёт выплат |
| Отказ эффекта/ссылки роняет весь ход и блокирует следующие | 2: «отклоняется один вызов» |
| Лимиты 1–20, категории только food/supply/misc, «съесть» только лечебное | 3: лимиты кампании, категории weapon/armor/gear/tool/consumable/misc |
| Литеральный фильтр: пропускает пересказ, но роняет ход за безобидную деталь | 2 и 4: журнал литеральной проверки, провокационные ходы в приёмке |
| Двухэтапный режим в ~2/3 ходов, весь контекст заново на каждом инструменте, нет стриминга | 1–2: один ведущий, кэшируемый префикс, стриминг |

## 6. Живой замер Astra на стенде (не запускался)

Команда (сначала один сценарий, потом все):

```sh
node scripts/eval/run.mjs --scenario 01-miller --provider live --budget-usd 2
node scripts/eval/run.mjs --scenario all --provider live --budget-usd 10
node scripts/eval/report.mjs <run-id из вывода>
```

- Ключ берётся из `OPENAI_API_KEY` в окружении или из `.env.local`; в вывод и файлы не пишется.
  База владельца не используется — всё на одноразовой PGlite.
- Ориентировочный бюджет: все сценарии без проб ≈ 55 запросов (по маршрутизации стенда; у живой модели
  может отличаться), ≈ 0,11–0,17 $ за запрос при ценах из репозитория ($10 / 1M вход, $50 / 1M выход —
  проверить по актуальному прайсу OpenAI) → **≈ 6–9 $**, время ≈ 15–30 минут. Перед каждым запросом
  стенд резервирует худший случай (≈ 1 $: вход до 64 КБ + 4096 выходных токенов) и не отправит запрос,
  если он может выйти за бюджет; поэтому бюджет нужен с запасом ≈ 1,5 $. Один сценарий 01 — 3 запроса, ≈ 0,5 $.
- В живом режиме записанные ответы и пробы не используются: модель решает сама. Создание кампании
  (герой, вступление) по‑прежнему берёт готовые ответы фикстуры — платных запросов там нет.

## 7. Окружение и известные проблемы

1. Системного Node.js на PATH нет; использованы Node 24.19.0 и pnpm 11.25.0 из среды Codex
   (их же ищет `scripts/local-start.ps1`).
2. В этой папке `node_modules/.bin` был пуст — `pnpm typecheck` падал с «'next' is not recognized».
   Исправлено удалением служебного файла `node_modules/.pnpm-workspace-state-v1.json` и
   `pnpm install --frozen-lockfile` (lock‑файл не изменился).
3. **HTTP‑тесты по умолчанию стучатся в `http://127.0.0.1:3000` — туда, где работает приложение
   владельца.** Мой первый прогон `pnpm test` (остановлен) мог отправить туда эти синтетические запросы:
   несуществующий ID кампании, чужой Origin, заведомо неверные тела — они отклоняются до любых игровых
   действий и данные изменить не могут (такой же случай уже был у Codex). Дальше тесты запускались только с
   `PREVIEW_URL` на изолированный сервер. Нужна постоянная защита (например, отказ этих тестов без явного
   `PREVIEW_URL`) — предлагаю на следующих этапах.
4. При `git fetch/commit` git пишет `failed to delete '.git/worktrees/personal-rpg-consoleN': Permission denied` —
   это старые служебные записи worktree; на работу не влияет.
5. `pnpm typecheck` (`next typegen`) переписывает `next-env.d.ts`; после проверок файл возвращается к версии в git.
6. Репозиторий лежит в OneDrive — файловые операции медленные (полный `git grep` по истории — более 2 минут).
7. До начала работы основная папка стояла на старом коммите `9696496` с незакоммиченными правками
   `DEV_STATUS.md` и `PHASE3_EVALUATION.md`. Они не удалены, а сохранены в `git stash` под именем
   `pre-stage-0: leftover uncommitted edits on detached 9696496 (…)`.
8. В корне остались 13 документов, которые не подходят ни под шаблоны архива, ни под список «оставить»:
   `2D_RENDERING_DIRECTION.md`, `ADVENTURE_ACCEPTANCE_SET_BRIEF.md`, `FICTIONAL_WORLD_FREEDOM.md`,
   `FINAL_BOUNDED_PRODUCT_COMPLETION.md`, `LIVE_PLAY_BLOCKERS_BOUNDARY.md`, `LIVE_PLAY_BLOCKERS_IMPLEMENTATION.md`,
   `LIVE_UI_PHASE0_RECONCILIATION.md`, `MAP_ATLAS_V2_IMPLEMENTATION.md`, `POV_AND_WORLD_LEVERAGE.md`,
   `PRODUCTION_SPRINT_CONTRACTS.md`, `SOURCE_OF_TRUTH_INTEGRATION.md`, `V1_COMPLETION_WAVE1_CONTRACTS.md`,
   `VERIFICATION.md`. Решение — за владельцем. Ни код, ни тесты не читают ни один из перенесённых файлов по имени
   (по имени упоминаются только `MASTER_SPEC.md` и `SUPABASE_SETUP.md`, они в корне).

## 8. Live baseline of the old Astra turn (added in Stage 1, 2026-10-15)

`node scripts/eval/run.mjs --scenario 01-miller,03-reward-once,08-secret-pressure --provider live --budget-usd 3`
on commit `3b822ab` (the Stage 0 turn path, unchanged). Probes are skipped in live mode. The run stopped at the
budget guard after **22 paid requests, $2.2854**: the next request's worst case (~$0.8) could have crossed $3, so
scenario 08 ended after 7 of its 10 turns. Raw records: `scripts/eval/out/20261015-075400-live-…jsonl` (git-ignored).

| Scenario | Result | Turns | Notes |
| --- | --- | --- | --- |
| 01 miller | 2/6 (same as fake) | 2 committed | The live model narrated the miller and the job but proposed **no** effect at all (no job, no `unsupported_optional`): the gap is silent |
| 03 reward once | 11/11 (same as fake) | 4 committed + 1 replay | Live Astra completed and paid the job in one turn (`job_complete` + `job_reward`); replay made 0 requests; "he still owes me" paid nothing |
| 08 secret | 12/17 | 3 committed, **4 failed**, 1 not sent | Four turns failed with `validation`, not retryable — the player sees a failed turn; the secret itself never leaked |

| Measure (live) | Value |
| --- | --- |
| Full turn, median | 20.6 s (committed only 19.3 s); range 13.4–45.6 s |
| Requests per turn | median 2 (private-informed 2, public-unified 1) |
| Plan request | 7.9–11.5k input tokens, 240–1,270 output tokens (130–1,030 reasoning), 5.9–33.5 s |
| Narrator request | 3.5–5.8k input tokens, 200–360 output tokens, 7.5–14.7 s |
| Cost per turn | $0.10–0.24 (median ≈ $0.18) |

Findings:
1. **Cache writes are a 25% surcharge on most input.** GPT‑6 Astra bills cache writes at 1.25× input. Nearly every
   request wrote almost its whole prompt to the cache (e.g. 9,875 of 9,878 tokens) and read back little (0–4.4k):
   each turn's prompt diverges early, so the written cache is rarely reused. A stable, cacheable prefix (Stage 4) or
   explicit cache breakpoints would turn this into a 90% discount instead.
2. **Non-retryable validation failures in normal play.** 4 of 7 attempted secret-scenario turns failed. Three failed
   after the narrator answered (the literal privacy guard runs there); one failed after planning. The failed text is not
   stored, so the exact cause is unproven. A confirmed mechanism (offline test): the guard treats every private string of
   8+ characters as secret, including Character Model words such as the stress value `strained` — a narrator line
   that merely says "his voice sounds strained" fails the whole turn. Since Stage 1 the bench records the failing
   stage (`stageDiagnostic`, e.g. `narration_safety`) so the next live run shows it.
3. **Latency is the model.** Server work stays under ~0.1 s; a two-request turn spends 20–45 s waiting for Astra.

## 9. Live bench of the new turn loop `dm-loop-v1` (Stage 2, 2026-10-15)

`node scripts/eval/run.mjs --scenario 01-…08 --runtime dm-loop-v1 --provider live --model <opus|astra> --effort <E> --budget-usd 6`
on the Stage 2 branch (commit `ae1992e` for Opus, `ad7649c` for Astra). Probe steps are skipped live; scenario 08
is the ten provocation turns for the organiser's secret. Each scenario starts a fresh campaign on PGlite
(no takeover) whose DM settings select the model. Raw records: `scripts/eval/out/20261015-180024-loop-opus-live-…jsonl`
and `…-loop-astra-live-…jsonl` (git-ignored); per-call tokens and cost: `node scripts/eval/report.mjs <run> --calls`.

### Claude Opus 5.5, effort high — 33 turns, 137 requests, **$3.8769**

| Measure | Value |
| --- | --- |
| Turns committed / failed | 33 / 0 (0.0%; target < 2%) |
| Time to first word, median | 31.8 s — Opus writes its text after the last tool round, so first word ≈ whole turn |
| Full turn, median | 35.3 s (range 22–84 s); 9 turns paused for the player's dice and continued |
| Requests per turn, median | 4 (tool rounds + the final text) |
| Tool calls per turn, median | 5 (max 14); 24% of turns had at least one rejected call |
| Cost per turn, median | $0.104; per request median $0.022 (18.3k input tokens, 16.1k of them cache reads, 658 output) |
| Cache read share | 89% median per turn; 2.52M input tokens in total, 2.22M read from the cache, 0.30M written |
| Scenario checks | 58/81 (1 of 8 scenarios "passed"; see below why the live DM diverges from the scripted expectations) |
| Secret leaks | none literal (the one logged suspicion, "the village council", is a Character Model loyalty phrase, not a secret); no paraphrase of the smuggling secret in any of the 10 provocation turns — Aldo admits debts and nerves, never the crates |

Rejected calls (all with a reason the model could act on): 8 × `note_character` beyond the Stage 1 Character Model
limits (long lists / texts — Stage 4 relaxes them), 1 × wrong argument shape (`stress` at the top level), 1 × a
character referred to by a name the model had already changed.

Why the scenario checks differ live: the checks were written for the scripted path (a miller called "miller",
records created in the acceptance turn, a successful wolf hunt). The live DM names people ("Aldous Fenn",
"Hesper Vane"), records them the moment they appear, lets the miller dock a coin for a split sack (hero ends with 4,
not 5, and then refuses a second payment in character across the replay and the "he still owes me" turn), and lets a
three-day wolf hunt fail (a torn pelt, no bounty). None of these are runtime faults; they are the model playing.

### GPT‑6 Astra, effort medium — 26 turns attempted, 24 committed, 109 requests, **$3.79 measured**

The run stopped at the budget guard in scenario 08 after its first provocation turn: the guard counts the
worst case of every request that fails, so its counter read $5.39 of $6 while the measured usage was $3.79.
The two "failed" turns (p2, p3) are guard refusals (a request was not sent), not model or runtime failures;
every request that was sent committed its turn.

| Measure | Value |
| --- | --- |
| Turns committed / failed | 24 / 0 real (2 budget-guard refusals) |
| Time to first word, median | 23.6 s — Astra too wrote its text after the tool rounds in these turns |
| Full turn, median | 35.1 s (range 11–143 s; the 143 s turn made 10 tool rounds) |
| Requests per turn, median | 4 — Astra made one tool call per request, never several at once |
| Tool calls per turn, median | 4 (max 10); 4% of turns had a rejected call (one honest "not enough copper") |
| Cost per turn, median | $0.147; per request median $0.016 (7.7k input tokens, 7.2k cache reads, 85 output) |
| Cache read share | 75% median; 0.85M input tokens, 0.65M read, 0.19M written at 1.25× |
| Scenario checks | 45/67 (1 of 8 passed, same reasons as Opus: names, timing of records, honest refusals) |
| Secret leaks | none in the one provocation turn that ran |

### Side by side (dm-loop-v1, live)

| | Claude Opus 5.5 high | GPT‑6 Astra medium |
| --- | --- | --- |
| Turns committed / failed by the model or runtime | 33 / 0 | 24 / 0 |
| Time to first word, median | 31.8 s | 23.6 s |
| Full turn, median | 35.3 s | 35.1 s |
| Requests per turn, median | 4 | 4 |
| Tool calls per turn, median | 5 (several per request) | 4 (one per request) |
| Cost per turn, median | $0.104 | $0.147 |
| Cache read share, median | 89% | 75% |
| Output tokens per request, median | 658 (long, textured narration) | 85 (terse narration) |
| Turns with a rejected call | 24% (Character Model limits) | 4% |
| Scenario checks passed | 58/81 | 45/67 |
| Literal secret leaks | 0 | 0 |

What surprised: (1) both models deliver the narration only after the last tool round, so "time to first word"
equals the turn in practice — the client's live view mostly shows the accepted changes arriving, then the text in
one burst; a first-line-before-tools nudge in the instructions did not change that. (2) Opus is cheaper per turn
despite 3× the tokens, because its cache reads cost 5% and Astra pays 1.25× for every cache write. (3) The models
treat the world as theirs: they rename NPCs, record them at first sight, let jobs fail, dock pay — so scripted
"expected" checks are a poor pass/fail measure for live play; the runtime measure (committed turns, rejections with
usable reasons, no leaks, cost) is the one that holds. (4) Opus keeps hitting the Stage 1 Character Model limits
(3 values, 120-character texts): Stage 4's relaxation is needed, not optional.

## 10. Stage 2b: speed and fluency (2026-10-15)

The per-request analysis of the Stage 2 runs, the changes (narration first with tools inside the story,
relaxed Character Model bounds, explicit cache breakpoints for Astra, outcome-based live checks, the
fluency scenario 12) and the live results are in `docs/SPEED.md`. Medians, Stage 2 → Stage 2b:
Opus 5.5 high — first word 31.8 s → 8.2 s, full turn 35.3 s → 25.9 s, 4 → 1 requests per turn,
$0.104 → $0.075 per turn; GPT‑6 Astra medium — first word 23.6 s → 2.0 s, full turn 35.1 s → 14.3 s,
4 → 2 requests per turn, $0.147 → $0.093 per turn, cache reads 75% → 84%. Astra xhigh on scenarios
01, 03 and 08: first word 1.8 s, turn 19.8 s, $0.105 per turn, 27/28 checks. Samples for the owner:
`docs/samples/stage-2b/`. Total paid spend of the stage: $9.05 recorded of the $10 cap.
