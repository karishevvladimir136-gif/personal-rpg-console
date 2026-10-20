# Loading the fixes after session 2 into the sandbox

For the owner's local Claude Code session on the owner's PC (Windows). It loads the branch
`claude/session2-fixes-a-f-jh3krk` into the **sandbox** (`docs/SANDBOX.md`: its own database on ports 44320–44327, the
app on http://127.0.0.1:3100). The owner's real project (ports 34320–34327, the app on :3000) is never touched. Do the
steps in order; stop and tell the owner if one of them fails.

## 1. Back up the sandbox database first

The sandbox holds session 2's campaign. Nothing below runs before this dump exists and is not empty.

```bat
mkdir C:\Dev\rpg-exports\sandbox-backups
docker ps --format "{{.Names}}" | findstr sandbox
docker exec supabase_db_personal-rpg-console-sandbox pg_dump -U postgres -d postgres -Fc -f /tmp/before-fix-s2.dump
docker cp supabase_db_personal-rpg-console-sandbox:/tmp/before-fix-s2.dump C:\Dev\rpg-exports\sandbox-backups\sandbox-YYYYMMDD-before-fix-s2.dump
dir C:\Dev\rpg-exports\sandbox-backups
```

Use the database container's real name from the `docker ps` line (the sandbox's project id is
`personal-rpg-console-sandbox`). If the sandbox is stopped, start it once with `node scripts/sandbox-start.mjs --no-app`
for the dump. To restore later: `pg_restore --clean --if-exists -U postgres -d postgres` inside the same container with
the file copied back.

## 2. The branch

```bat
node scripts/sandbox-start.mjs --stop
git fetch origin claude/session2-fixes-a-f-jh3krk
git checkout claude/session2-fixes-a-f-jh3krk
git pull origin claude/session2-fixes-a-f-jh3krk
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
problem). Later starts without code changes: `--prod --no-build`. The migrations this branch adds, all additive:

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
- «Тайны (видит только ведущий)»: empty unless the owner writes the world's truth there (the DM's prep builds on it).
- Pictures: opening the game once stores the device's time zone; the daily picture limit then starts at midnight.
- «Настройки → Крупный текст истории» if the story should read larger; the campaign's «Правила и кости» show the rules
  from the DM guide's first line.

## 7. Replay session 2's heavy turns

Without touching the live campaign (the replay restores each turn's state into an in-memory copy and writes nothing
back), play the heavy turns of session 2 again in session 3's mode and compare cost, requests and records with the
session 2 log. The planner's local prompt names the turns (the mine fight, the long rest, and the others it lists):

```bat
set FIX_S2_STAGE=F
node scripts/eval/real-replay/replay.mjs --base http://127.0.0.1:3100 --campaign <id> --turns <the planner's list> --variants O --ledger-check on --budget-usd <the planner's cap>
```

Every paid run registers in the run's ledger and stops at its budget. The records go to `docs/runs/` locally — they
hold campaign text, so **do not commit them** (the repository is public); report the numbers only.

## 8. Then stop

The owner accepts each screen with `docs/runs/fix-s2-acceptance.md` («принято» or notes) before anything is called
done.
