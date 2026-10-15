# Release checklist — moving the owner's database to the new turn loop

Written in Stage 3 for Stage 6. Nothing here has been run against the owner's database; the
procedure was rehearsed on disposable PGlite databases (`tests/dm-loop-compat.test.mjs`:
migration 54 over a campaign with old turns and saves; a long taken-over campaign with saves
and a branch switched to `dm-loop-v1`, rewound and continued on either runtime).

Rules that always apply (CLAUDE.md): never touch the owner's database without a fresh full dump
the owner has confirmed; never edit applied migrations; never delete or rewrite historical
turns, saves, scenes, Canon or document versions; no paid calls beyond the stage's budget.

## 1. Dump

1. The owner starts the app as usual (`Start RPG Console.cmd`), plays nothing, closes it.
2. Take a full dump of the local Supabase Postgres (all schemas: `public`, `rpg_private`,
   `auth`, `storage`), e.g. from the Supabase CLI or `pg_dump -Fc` against the local port.
   Name it with the date; keep it outside the repository.
3. Verify the dump restores into a throwaway database and that `select count(*) from
   public.rpg_campaigns` matches the owner's campaign list. Only then continue.

## 2. Apply the migrations to a copy

Work on the restored copy, never on the live database:

1. Apply every migration newer than the copy's last applied one, in file order
   (`supabase/migrations/202610150054_record_integrity.sql` and whatever later stages add).
2. Check the two constraints that validate existing rows. If either is still `NOT VALID`, the
   migration printed a NOTICE and a legacy row violates it:

   ```sql
   select conname, convalidated from pg_constraint
    where conname in ('rpg_entities_resources_within_bounds','rpg_quests_reward_operation_fk');
   -- rows that keep rpg_entities_resources_within_bounds from validating:
   select id, campaign_id, name, resources from public.rpg_entities
    where not rpg_private.resources_within_bounds(resources);
   -- rows that keep rpg_quests_reward_operation_fk from validating:
   select q.id, q.campaign_id, q.title, q.reward_operation_id from public.rpg_quests q
    left join rpg_private.turns t on t.campaign_id=q.campaign_id and t.id=q.reward_operation_id
    where q.reward_operation_id is not null and t.id is null;
   ```

   Correct such rows **through the app** (owner correction of the character or quest), never by
   rewriting history; then `alter table … validate constraint …` on the copy and note what was
   done for the live run.
3. Confirm every existing campaign has its DM settings row and still plays on the old runtime:
   `select campaign_id, runtime, limits from rpg_private.dm_settings` — one row per campaign,
   `runtime='astra-primary-v1'`, `limits` null (defaults).

## 3. Smoke play on the copy

Point an isolated app instance at the copy (its own `.env.local`, another port, never
`127.0.0.1:3000` — see `tests/preview-target.mjs`). For one campaign of each kind the owner has
(a World Logic takeover campaign, a plain one):

1. Open it, read the last scene, open Saves and Timeline: everything displays as before.
2. Play one turn on the old runtime; save; load the save; continue. All four work.
3. In Campaign Settings → DM runtime and model, switch the campaign to the new turn loop
   (`dm-loop-v1`), keep the model as it is. Play three or four turns: a conversation, a purchase,
   a job with a reward and its payment. Check the list of accepted changes under each turn and
   the party sheet. Rewind to the save made in step 2 and continue on the new loop; switch the
   setting back to the old runtime and play one turn; switch forward again.
4. Watch the server log for `dm_loop_failed`, `rpg_reward_claimed`, `rpg_limit_exceeded` or
   `rpg_immutable_history`: none is expected.

Budget: a smoke play of this size on GPT‑6 Astra costs about $0.10 per turn; agree the cap with
the owner before step 3 and report every paid call.

## 4. Switch the owner's campaigns

Only after steps 1–3 pass on the copy, and on the same day as a fresh dump:

1. Apply the migrations to the live database (same files, same order). Re-run the two
   constraint queries of step 2.2; they must come back validated (or the known rows corrected).
2. Do **not** switch campaigns in SQL. The owner switches each campaign in Campaign Settings →
   DM runtime and model, one at a time, after reading its last scene; new campaigns are on the
   loop already. A turn in flight keeps its own runtime and pin.
3. Keep the old runtime available (the setting can go back at any time, also after loop turns:
   both runtimes read the same records, and the loop's claims and notes are ordinary rows).
4. The per-turn limits stay at their defaults unless the owner wants a tighter campaign; they are
   edited in the same settings panel (Stage 5 UI) and apply from the next turn.

## 5. If something goes wrong

- A failed migration leaves the database unchanged (each migration is one transaction): fix the
  cause on the copy first, then retry on the live database.
- A campaign that misbehaves on the new loop: switch its setting back to `astra-primary-v1`;
  nothing of its history was rewritten. Report the operation ID of the bad turn.
- Last resort: restore the dump of step 1 (losing play since the dump); say so to the owner
  before doing it.
