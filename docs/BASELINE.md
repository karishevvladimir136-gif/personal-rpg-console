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
  (`C:\Users\karis\.cache\codex-runtimes\codex-primary-runtime\…`); системного Node на PATH нет.
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
