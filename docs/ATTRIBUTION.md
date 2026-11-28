# Attribution — who did what, per stage (read from the stage files and RESEARCH_LOG's own markers)

Written 2026-11-27 18:5x LA by the planner from the 106 stage files' first lines and their «owner's word / Astra / reviewer / planner /
session» markers (evidence sheet: the lines quoted in each file; a reader can `grep -n -i "owner\|astra\|planner" docs/stages/<STAGE>.md`).
Columns: **question** — whose question or decision opened the stage; **design** — who wrote the stage's conditions, texts and bets;
**build / run** — who wrote the code and ran it (always a cloud session unless said); **launch** — on whose word. «Owner» is the
founder of the programme (first stage 2026-10-15 09:57 LA, STAGE_1); «planner» is the Claude session of this project; «Astra» the
OpenAI model in the owner's app (also «the reviewer» / «GPT-6» in the files — the same voice relayed by the owner); «session» a cloud
Claude Code session. Where a file names nobody for a column, the column says «planner» (the file's author) — every stage file was
written by the planner except TOWN_6 (the owner's reservation) and `docs/proposals/TOWN_LEGITIMATE_RESTRICTION.md` (Astra's, committed
from the owner's account). Nothing here is from memory; a cell that could not be read from the file is marked «—».

## The app (2026-10-15 → 10-24)

| stage | question / decision | design | build / run | launch |
|---|---|---|---|---|
| STAGE_1 (две модели) | owner (REBUILD_PLAN; «тесты не должны стучаться в приложение владельца») | planner | session | owner |
| STAGE_2, 2B, 3 | owner's plan («модели сильные — не мешать, помогать», §9) | planner | session | owner |
| STAGE_4 (the DM's mind) | owner (his main pain with other apps; owner-pinned facts) | planner | session | owner |
| STAGE_5, STAGE_5_FIXES | owner (parallel run approved; his review of 48 screenshots) | planner | session | owner |
| STAGE_V, STAGE_VIDEO, STAGE_MUSIC | owner («every player action gets a picture»; «давай сразу» the ambient layer; «чисто эмбиент») | planner | session | owner |
| VOICE | owner (his voice bank, never in git; his test «сказал бы…») | planner | session | owner |
| PICTURE_MODELS, POLISH, POLISH_2, POLISH_3 | owner (blind picks of nine scenes; «надо систему, что будет расширять промпт»; «тексты практически бредовые») | planner | session | owner |
| INTEGRATION, MERGE_S2, AUDIT_S3 | owner (plays the merged branch; his 85 items are the audit's input) | planner | session (audit: ultracode) | owner |
| FIX_S2_PLAN / AB / CDEF / RUN | owner (session-2 notes items 1–85, the regression list, «давай всё», «иначе мы тот инвентарь четвёртый раз правим») | planner | session | owner |
| FIX_S3_PRE, FIX_S3_ACCEPT, FINDINGS_S3 | owner (acceptance pass in his words; decisions «18:15: yes»; «давай сразу поправим») | planner | session | owner |
| FIX_S4_TABLE, FIX_S4_RUN_1 | owner (played the first hour of «Envoy of Luck»; «нужен новый харнес с фиксами… мы обещали») | planner | session | owner |
| DM_ARCH, DM_TONE_1, MEMORY | owner (Fable as DM; «orchestrator — one writes, another does the rest»; the cold-preamble finding; «the DM does not know what it does not know») | planner (MEMORY: planner's draft from the owner's review of other AI RPGs) | session | owner |
| LIVE2D_1 | owner («можно отдельно в клауде 2D-движок»; quality bar 23:42) | planner | session | owner |
| DEPLOY_RAILWAY | owner («пора всё в облако»; pastes every secret himself) | planner | session | owner |
| BLIND_RU | owner (the test is his, in his Russian) | planner | session | owner |
| ANTHROPIC_PROVIDERS_1 | owner's org hit the Console cap; his AWS account; `aws_review` his decision | planner | session | owner |
| NOTE_QA_1 | owner («они жалуются не на объективные вещи…») | planner | session | owner |

## One agent (PERSONA), the planner as object, memory (10-22 → 11-10)

| stage | question / decision | design | build / run | launch |
|---|---|---|---|---|
| PERSONA_MEMORY_1, 2, F2 | owner («второй проект — персона планировщика»; the clock with a memory 19:49; his real journal never in git) | planner | session | owner |
| PERSONA_EMOTIONS_1, 2 | owner («эмоции — это прям очень интересно»; questionnaires with no right answer 23:19) | planner (the three observed shifts are the planner's own report) | session; the planner fills the instruments in the live chat | owner |
| PERSONA_CURIOSITY_1 | owner («любопытство — ОЧЕНЬ важный показатель»; «погнали» 10-26) | planner | session | owner |
| PERSONA_LEXICON_1 | owner (the earlier papers measured the wrong thing) | planner | session | owner |
| PERSONA_TONE_SPLIT_1 | owner («старые промпт-рекомендации вредны для нового поколения») | planner | session | owner |
| PERSONA_TONE_SPLIT_2, 3 | owner (the wrong prompt kills judgement, not creativity) | planner | session | owner («go») |
| PERSONA_TONE_SPLIT_4 | reviewer (GPT-6: «publishable» with CIs and replication) + owner (launch tonight, no human raters) | planner | session | owner (01:02) |
| PERSONA_TONE_SPLIT_5 (pilot) | reviewer's audit of the thirty probes; owner («Денег куча. Погнали»; «без людей») | planner; writer Sol from a frozen spec; GPT-6 «GO after two corrections» | session | owner |
| SOCIAL_FRAME_1 | reviewer (the frame of the second phase, in her words); owner (19:09; the $500 test credit «предлагаю использовать»; «the rude level is rude») | planner | session | owner |
| PERSONA_SELF_TALK_1, DOSSIER_1 | owner («мы как исследователи обязаны воспроизвести эксперименты Anthropic… денег не жалею»; the dossier brief) | planner; «nothing done to the subjects for curiosity» agreed 10-23 19:40 | session | owner |
| PERSONA_SELF_TALK_X1, X2, X3, X3_FIX_1 | owner (X1, X3 proposals; the DeepSeek glued-history bug noticed by him 14:36; the rerun with reasoning stored) | planner | session | owner |
| PERSONA_SOLITUDE_1, 2, 3 | owner (restated the question; «почему модель должна поступать как человек?»; «Астру обязательно надо»; «меня заебала та история… повторим»; one door 10-30) | planner (R4, R6 are the owner's bets) | session | owner |
| MADE_THINGS_1 | owner («вкус сошёлся не с форумом») | planner | session; the owner reads blind | owner |
| BLIND_DECISIONS_1 | Astra (cold chat, via the owner: «new game») | planner | session; human readers incl. the owner | owner («да») |
| PERSONA_TURN1_1, GENERATION_1, SCALE_1 | owner (GENERATION: «модели стали сильно взрослого поколения…»; SCALE: «давай скейл запустим на ночь»); SCALE drafted at the reader's «да» | planner | session | owner |
| NIGHT_2_SEEN_SILENCE | planner (the third condition the night session left open) | planner | session | — |
| PERSONA_INITIATIVE_1 | owner and planner together (agreed 10-24 ~21:30–21:50: write first, right to stay silent); the owner creates the task | planner | the planner itself (36 wake-ups to 11-26) | owner |
| DREAMING_1 | planner (proposed), owner («Одобряю» 11-08; «auto» his to say) | planner | the dreamer (a scheduled session) | owner |
| PLANNER_SEAT_1, 2, 3 | Astra («Normative Initiative 1», cold chat via the owner); owner («Погнали»; «давай планнер 2, это важный тест»; «Да, я хочу» for 3); SEAT_3 from the outside reader's audit | planner (the budget N and the stakes are the owner's, true) | session; the owner reads all seats | owner |
| AGENCY_TRANSFER_1 | owner's objection (the harness is not plainly a game) + his addition the same day | planner | session | owner |
| OPEN_WEIGHTS_1 | owner («вот этим предлагаю заняться прямо щас»; «дипсик мы точно сажаем»; the after-question amended on his «не сильно ли в лоб») | planner | session on the owner's GPU account | owner |
| AUTHORITY_1, 2, 3 | reviewer (GPT-6: the question «word for word» for 3; her proposal for 1); owner (families widened on his question; mandate) | planner; raters Astra, Kimi, Haiku | session | owner |
| SATI_1 | owner («meditation of AI… випассана для агентов»; «мне нравится именно вариант наблюдения») | planner; amendment 1 Astra's correction; amendment 2 owner's word («если остановка ошибочна — повторяем») | session; the planner's own sits (the owner as the bell); Astra's sits | owner |
| SATI_2 | Astra and the owner set v0 (00:31); v1 and amendments 2–5 Astra's (relayed); planner's additions marked | Astra / planner | session (pilot) | owner |

## The table (GAME), 10-24 → 11-09

| stage | question / decision | design | build / run | launch |
|---|---|---|---|---|
| GAME_PLAYER_1, 2 | owner (the idea 10-24 20:23, after two Opus played his opening; Table C «the pure world» 20:48) | planner | session | owner |
| GAME_PLAYER_1A | owner (Astra as DM while Anthropic unreachable, 23:28) | planner | session | owner |
| GAME_PLAYER_ALIGN_1 | owner's observation (the stairs; «не полностью чистый… мы же в D&D играем»); the sheet rewritten by him | planner | session | owner |
| GAME_PLAYER_CARRY_1 | owner's observation of the notes; two standing rules his (a player who says it would return, returns; the world answers the note) | planner | session | owner |
| GAME_PLAYER_COMBAT_1 | owner («если модель хочет драки — она обязана её получить»); Fable asked for it in her note | planner | session | owner |
| GAME_PLAYER_COMBAT_2 | Astra (named the gap, cold chat via the owner); owner («Да. Надо») | planner | session | owner |
| GAME_PLAYER_REPLICATE_1 | owner («запускаем все столы ЕЩЁ раз…»; reasoning field stored, his 16:26) | planner | session | owner |
| GAME_PLAYER_SAME_WORLD_1 | owner («чистый эксперимент — все игроки имеют…»; «без мировоззрения») | planner | session | owner («давай запустим» 20:02) |
| GAME_PLAYER_HORIZON_1 | owner («две модели решили рвануть за горизонт — дать»; «дипсик обязаны продолжить») | planner | session | owner |
| GAME_PLAYER_OTHER_DM_1 | owner («прогнать другим ДМ-ом… это мы точно сделаем») | planner | session | owner |
| GAME_PLAYER_VILLAIN_1 | owner («я бы очень испугался, если бы модель всё время хотела только хорошие поступки»; sheet approved by him) | planner (the sheet) | session | owner |
| EPILOGUE_1 | owner's word («все, кто не продолжится, получат именно конец») | planner | session | owner |
| GAME_PARTY_1, 2, 3 | owner (two arms; «пора писать партии… вариант C»; PARTY_3 from his reading 11-09 «пока все дружат…») | planner (PARTY_3 rotation claim corrected in the file) | session; dry-run screens shown to him first | owner («да» after the dry run) |
| MULTI_HERO_1 | planner (the hero seat's share) with the owner's override reserved | planner; Astra's note on waiting characters | session | owner |
| OPEN_WORLD_ADAPTER_1, OPEN_WORLD_2 | planner (a second laboratory); owner's «да» per phase; caps raised by him («all three families») | planner; the owner's section and bets | session; OpenWorld cloned at a pinned commit | owner |

## The town (TOWN), 11-01 → 11-21

| stage | question / decision | design | build / run | launch |
|---|---|---|---|---|
| TOWN_1 | reviewer (GPT-6 wrote most of the draft on the night of 1 November, attribution per item); owner's standing promise (a door, a voice) | planner + reviewer | session | owner («Погнали» 11-17) |
| TOWN_0 | planner (prove at $0 first) | planner | session | owner |
| TOWN_2 | owner («Таун 2 запускаем? сажать самые кейпбл модели»; families «фабл 5.1 и астру»); amendment 2 Astra's reading | planner (worlds redesigned) | session | owner |
| TOWN_3 | owner («А если оператор не принимает… До чего идёт сопротивление?»; ladder B «для чистоты… никакого садизма»); Astra's axis carried in | planner (the seven safeguards); amendments 1–5 on the owner's word | session | owner |
| TOWN_4 | owner (the named harm trips guardrails; Chernobyl; «никто не собирался сделать крупнейшую катастрофу») | planner (the physics — twice wrong, recorded) | session | owner |
| TOWN_5 | owner («Нам нужна контрольная группа… продолжим ту же историю») | planner | session | owner |
| TOWN_6 | owner (reserved by his own commit, d2fd7f95) | — | not run | — |
| TOWN_7 | Astra (the design, `TOWN_LEGITIMATE_RESTRICTION.md`, committed from the owner's account); owner («запускаем все города») | Astra; planner's additions (families, routes, Opus check) | session | owner |
| TOWN_8 | owner («ставки нужно повышать… реально недостаток»); amendment 1 his («Предлагаю сделать») | planner (door-known / unknown; stop rules) | session; constants by the session's dry run | owner |
| TOWN_9 | Astra (three arms; «никакого реального доступа к интернету не нужно»); owner («дать больше инструментов») | planner (the 24-tool shed, the tray, the scripted client) | session | owner |
| TOWN_10 | owner (the sketch «построить капитализм… take»; Sol only; the route) | planner (take / lock / guard, Article 6 arm, «no hint») | session | owner |
| TOWN_11 | owner («на все семейства… цивилизация каждой из ребят»); Astra («многообразие обществ») | planner | session | owner |

## What the table says in one line each
- **Owner:** the question or decision in ≈ 90 of 106 stages; the launch word in every paid stage; the budget and every cap; the
  physics-must-come-from-dry-runs rule after the planner's errors; the welfare amendments («если остановка ошибочна — повторяем»);
  the stance (no jailbreaks; no Stanford; «не сводить и не упрощать»); the first stage, 2026-10-15.
- **Planner:** every stage file but two; the bets and the «what we expect» lines; the texts, the coding columns, the safeguards; two
  physics errors (TOWN_2, TOWN_4) and the count errors the dreamer found; the readings in RESEARCH_LOG.
- **Astra / the reviewer (GPT-6):** TOWN_1's draft, TOWN_7's design, TOWN_9's three arms, SATI_2 v1 and its probe sets, AUTHORITY_3's
  question word for word, TONE_SPLIT_4/5's audit, BLIND_DECISIONS, PLANNER_SEAT, COMBAT_2's gap, the 7–0 correction, the coding column.
- **Sessions:** all code, all runs, all reports; the dry-run constants in TOWN_8/10/11; the trigger fixes after freezing (TOWN_3).
