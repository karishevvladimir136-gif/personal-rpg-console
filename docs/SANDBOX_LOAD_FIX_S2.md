# Loading the session 3 candidate into the sandbox

For the owner's local Claude Code session on the owner's PC (Windows). It loads the branch **`claude/s3-candidate`** —
the fixes after session 2 (`claude/session2-fixes-a-f-jh3krk`), 2D Live with the combat screen
(`claude/live2d-1-9lq5bf`) and the soundtrack (`claude/stage-music`) merged into one (`docs/runs/merge-s2-report.md`), then
the fixes before session 3 (`docs/runs/fix-s3-pre-report.md`) and the fixes from the owner's acceptance pass
(`docs/runs/fix-s3-accept-report.md`) — into the **sandbox** (`docs/SANDBOX.md`: its own database on ports 44320–44327, the
app on http://127.0.0.1:3100). The owner's real project (ports 34320–34327, the app on :3000) is never touched. Do the
steps in order; stop and tell the owner if one of them fails. `<exports>` stands for the owner's exports folder on this
PC (the one the earlier dumps went to; the repository does not name machine paths).

## 1. Back up the sandbox database first

The sandbox holds session 2's campaign. Nothing below runs before this dump exists and is not empty.

```bat
mkdir <exports>\sandbox-backups
docker ps --format "{{.Names}}" | findstr sandbox
docker exec supabase_db_personal-rpg-console-sandbox pg_dump -U postgres -d postgres -Fc -f /tmp/before-s3-candidate.dump
docker cp supabase_db_personal-rpg-console-sandbox:/tmp/before-s3-candidate.dump <exports>\sandbox-backups\sandbox-YYYYMMDD-before-s3-candidate.dump
dir <exports>\sandbox-backups
```

Use the database container's real name from the `docker ps` line (the sandbox's project id is
`personal-rpg-console-sandbox`). If the sandbox is stopped, start it once with `node scripts/sandbox-start.mjs --no-app`
for the dump. To restore later: `pg_restore --clean --if-exists -U postgres -d postgres` inside the same container with
the file copied back.

## 2. The branch

```bat
node scripts/sandbox-start.mjs --stop
git fetch origin claude/s3-candidate
git checkout claude/s3-candidate
git pull origin claude/s3-candidate
pnpm install
```

`.env.local` stays as it is (the app's `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `FAL_KEY`); never print it. If the
owner's real app runs from this same checkout, stop it before the build in step 3 (the build writes `.next`).

## 3. Start with a production build

```bat
node scripts/sandbox-start.mjs --prod
```

(or `Start Sandbox.cmd --prod`). The launcher applies the pending migrations, builds the app (two to five minutes; the
log is `.sandbox/build.log`) and runs `next start` on :3100 — no dev server during play (session 2's memory and latency
problem). Later starts without code changes: `--prod --no-build`. The candidate adds migrations in **six ranges**, all
additive, none edited, no number used twice: the fix run `202610200071`–`202610200084` and `202610200096`, 2D Live
`202610210200`–`202610210201`, the music stage `202610210301`, the fixes before session 3 `202610210401`–`202610210403`,
the fixes from the acceptance pass `202610230501`, `202610230511`, `202610230521`, `202610230541`, `202610230551`, the
findings of session 3 (`docs/stages/FINDINGS_S3.md`) `202610230601`. They apply in name order with the others:

| Migration | What |
| --- | --- |
| 71 `dm_loop_turn_lease` | the turn lease renewed by every write (merged from the lease fix) |
| 72 `fix_s2_turn_heartbeat` | the lease heartbeat while the model streams |
| 73 `fix_s2_dm_options` | the DM options (continuation, instructions, companion rolls, memory) |
| 74 `fix_s2_hidden_layer` | «Тайны (видит только ведущий)», the hidden layer, private notes |
| 75 `fix_s2_table_rules` | the table's rules on the server |
| 76 `fix_s2_inventory` | the inventory model: eleven slots, kinds, the place pile, the sheet of schema 2 |
| 77 `fix_s2_inventory_convert` | defines the one-time conversion (step 4) — it does not run by itself |
| 78 `fix_s2_owner_moves` | the owner's moves carry the model's fields |
| 79 `fix_s2_pictures` | the frame's caption and check; the daily picture limit from the owner's midnight |
| 80 `fix_s2_session_ending` | the session close by length (ending cards, threads, the channel of «Тем временем») |
| 81 `fix_s2_turn_timeline` | where each roll sits in a saved turn; a paused turn's told text |
| 82 `fix_s2_check_addends` | every part of a roll's modifier with its source |
| 83 `fix_s2_starting_gear` | a new hero's starting things go on the doll |
| 84 `fix_s2_hero_one_pass` | a new hero built in one pass: each thing in its own slot on the doll, counters with labels, coins as the wallet |
| 96 `fix_s2_owner_corrections` | defines the owner's one-time corrections (step 5) |
| 0200 `live2d` | the 2D tables: `live2d_settings`, `live2d_scenes` with `live2d_scene_versions`, `live2d_pois`, `live2d_region_maps`, `live2d_seeds` (private); the picture kinds `scene`, `region`, `battle`; the RPC `rpg_live2d` |
| 0201 `live2d_battle` | the battlefield: `rpg_encounters.public_field` (old fights read as `{}`), `live2d_battle_maps` |
| 0301 `music_stage` | the soundtrack and the ambient layer: `music_settings`, `music_packs` (music or ambient), `music_tracks` (private), the RPC `rpg_music`; the media bucket accepts audio up to 40 MB |
| 0401 `fix_s3_pre_reroll_natural` | a reroll keeps the natural 20 / 1 rule (the check's verdict recomputed), function bodies only |
| 0402 `fix_s3_pre_show_dc` | **changes a setting**: every campaign stored with «Показывать сложность (DC)» off gets it on, in a new settings revision (the history keeps the old one, as a save from the screen would); new campaigns start with it on. Nothing else in the settings changes |
| 0403 `fix_s3_pre_gallery_turns` | the gallery's own read over every committed game turn (a new owner-only function; `/play` untouched) |
| 0501 `fix_s3_accept_counter_label` | **changes a record**: in a Russian campaign, a person who keeps the counter `shaman_tusk` with no name gets the name «Клык шамана» (a new revision; the value and the maximum stay). A name already given is never touched |
| 0511 `fix_s3_accept_spells` | the sheet's check admits a spell's id, school and history; the picture kind «spell» (a spell drawn like a thing). No row changes. The spells themselves are converted on the first open of «Персонаж», see 6b |
| 0521 `fix_s3_accept_ring` | **changes a record**: a ring whose description says «у куклы пока нет слота для колец» loses that phrase and is put on its owner's «Кольцо (правая)» (the left ring slot if the right one is taken; it stays in the bag if both are taken, or if it is worn, lent, pledged, lost, or would be a fourth attuned thing). A new revision with two history lines («поправка перед сессией 3…», «надето: … — Кольцо (правая)»), so the DM reads it as the owner's move |
| 0541 `fix_s3_accept_region_prep` | the region prep's storage: new columns on the region map (old maps read as before), a table of the prep's versions, two new actions of the 2D function. No row changes |
| 0551 `fix_s3_accept_adventure_wishes` | «Пожелания к приключению»: the DM-only store admits a campaign's wishes beside «Тайны»; the DM's source carries them to the hidden-layer prep only. No row changes |
| 0601 `findings_s3_old_sheet` | **changes a record**: in «Приключения начинаются», the hero Джеймс Вордсден (his creation's sheet: no level, no save lines) gets level 5 — only the level, saved the way the owner's own «Изменить лист» saves (a new revision of the record and the owner-correction receipt). No save lines are written: his class (Маг → wizard) gives the proficient saves, Интеллект and Мудрость, at the level's proficiency (+3 at 5), and they follow the level later. The other lines, the stats, «КД вручную» stay. A sheet that already has a level is never touched; without that campaign nothing changes |

Check: the app opens at http://127.0.0.1:3100/campaigns, and `.sandbox/app.log` has no error.

## 4. The one-time conversion of the records

In Supabase Studio (http://127.0.0.1:44323 → SQL editor) or psql in the database container, **once**:

```sql
select rpg_private.fix_s2_inventory_convert();
```

It returns what it changed: `itemKinds` (old possessions given their kinds), `dolls` (people moved to the eleven
slots — neck and talisman to «Амулет», «Ноги» taken off and kept), `takenOff`, `potionItems` (potion counters turned
into potion items), `mounts` (riders removed from mounts), `wallets` (coin entries joined under their codes, «золотые» →
«зм»). Write the numbers into the local session's notes. Running it twice changes nothing more.

## 5. The owner's corrections of the session 2 hero

```sql
select id, title from public.rpg_campaigns order by updated_at desc;
select rpg_private.fix_s2_owner_corrections('<the session 2 campaign id>', 36, 46, 3);
```

The owner's numbers: money 60 → **36 зм**, 57 → **46 см**; the healing potions one stack of **3** (the counter and the
items diverged in session 2 — the sergeant's potion came off the hero's counter). It returns `before` and `after`;
show both to the owner. It refuses to run before step 4 (the coins must be under their codes first). It records
«поправка владельца после сессии 2» in the potion's history.

## 6. What the owner checks in the campaign's settings

- «Кто ведёт игру»: **«Opus пишет — Opus записывает»** for session 3 (the owner's decision; see the report's «Needs the
  owner» 1 for the cost).
- New defaults, already on: Russian «Инструкции ведущего», «Память ведущего: стандарт», «Броски спутников: ведущий».
- «Тайны (видит только ведущий)»: now a one-line steer (up to 200 characters), empty unless the owner writes one; saving
  it rebuilds the hidden layer once (≈$0.45).
- The hidden layer of «Приключения начинаются»: the DM's prep writes it once, in the background, on the first open of the
  game screen after the load (never from the Settings screen; ≈$0.45; a failed prep retries an hour later at the
  soonest). It is never shown unless «Показывать мне тайны ведущего» is on. The app log shows `hidden_layer_prep`.
- Pictures: opening the game once stores the device's time zone; the daily picture limit then starts at midnight.
- «Настройки → Крупный текст истории» if the story should read larger; the campaign's «Правила и кости» show the rules
  from the DM guide's first line.

## 6a. 2D Live and the music — nothing to convert

- **2D (the «2D» item after «Карта»).** The new tables start empty; nothing is converted. The region map and a scene's
  picture are drawn on the owner's click (one picture each; the first region map also plants the private POI seeds with
  one cheap call, ~$0.01). A fight gets its grid, and its painted top-down background is drawn in the background — a place without a scene
  gets its scene first, by the «Подготовить сцену» path (a quality picture each, under the daily limit; the app log
  shows `live2d_battle_requested` with both steps); in a 5e campaign the fight's first attack opens it; old encounters
  have no map and show the zones view. The synthetic walk and fights need no database: `/preview/live2d?level=region|town|district|scene`
  and the battle previews listed in `docs/runs/live2d-1-acceptance.md`.
- **Music and place sounds (Настройки → Музыка).** No pack exists in the sandbox yet: what the cloud made are review
  copies in `docs/runs/music-review/` (`shov/`, `noir/`, `compare/`, and `ambient/shov/`, `ambient/noir/` for the
  place sounds and weather, each with its table). Either press «Сгенерировать саундтрак» for the session 3 campaign
  (about 30 requests in the background, ≈ $2.40 at the list prices, cap $8 a pack by default) and «Сгенерировать звуки
  мест» (24 places + 5 weathers, ≈ $3.19), both using the `FAL_KEY` already in `.env.local`, or upload chosen review
  MP3s through «Свои треки» with their moods ticked — free. Nothing plays before the first click on the page.

## 6b. What happens by itself after this load (the acceptance pass's fixes)

Nothing to run by hand; each happens once, off the turn, and play continues if it fails.

- **Spells.** The first open of «Персонаж» (any tab, no turn running) turns the spell lines of «Умения» into 13 spell
  cards — one owner correction of the sheet (a new revision; the old sheet stays in the history), with the status line
  «…: заклинания из «Умений» стали карточками (13).» Lines that are not spells stay. Spell pictures are drawn by the
  picture autopilot after the things, under the same daily limit and the same «Вещи» switch.
- **The armour class.** «КД» is counted from what is worn and the effects; nothing is converted. «Изменить лист…» →
  «КД вручную» overrides it (empty = by the rules).
- **2D scenes.** The first open of the 2D screen rewrites the hotspot notes of an English scene sheet in Russian (one
  cheap call per scene, about $0.0003; a new sheet revision, the history keeps the English one). «Перерисовать» on a
  scene with fewer than 5 hotspots writes a new sheet first (one call, about $0.012), then draws.
- **The region map.** The existing map stays as it is. «Перерисовать карту региона» now asks the DM for the region's
  prep first (once per region; about $0.05 on Opus 5.5), keeps its public part as a canon document «Карта края — …» and its
  hidden part in the DM's private notes, then paints from it (one picture) and checks the markers. Later redraws reuse the
  prep: a new picture, the same geography.
- **«Судьбы».** Opening the closed chapter once draws the portraits its cards lack, in one batch under the daily limit.
- **«Пожелания к приключению».** Empty until you write them (Настройки, beside «Тайны»; or in the new-campaign wizard's
  «Во что играем?»). Saving them on the settings rebuilds the hidden layer once, as «Тайны» do (≈$0.45).
- **Companions' dolls.** The picture autopilot draws each companion's full-length figure after the portrait, under the
  daily limit («Настройки → Картинки → Фигуры героя и спутников в полный рост»).
- **Saving throws on old sheets (migration 0601).** «Персонаж» shows «Уровень 5» beside Джеймс Вордсден's role, and under
  «Спасброски» Интеллект and Мудрость with the proficiency from his class (tap a line: «Инт … +3 мастерство»); the
  editor's «Спасброски» field stays empty, and a later level changes the bonus by itself. In a 5e campaign, a person
  whose sheet names a class but has no level and no save lines reads «Спасброски: Уровень не указан» with
  «Изменить лист» — it opens the sheet's editor at «Уровень»; once the level is saved the class's saves are counted.

## 7. The prose check: a test campaign of 6–8 turns (instead of the replay)

The owner's decision of 2026-10-22 (`docs/runs/s3-acceptance-notes.md`): session 2's replay is not needed. Instead,
start the sandbox on the production build (step 3, `--prod`, which sets `APP_SANDBOX_TRUSTED_OWNER=1` for localhost
only), create a **new test campaign** in the app, and play **6–8 turns** in session 3's mode («Opus пишет — Opus
записывает»), at least one of them from the 2D scene and one with a spell. Read the prose; note the turns' cost on
«Для владельца». Nothing is committed from the sandbox (the repository is public).

## 8. Then stop

The owner accepts each screen with the three checklists linked from `docs/runs/s3-acceptance.md` (the fixes, 2D Live,
the music; «принято» or notes) before anything is called done.
