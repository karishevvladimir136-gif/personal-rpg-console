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
