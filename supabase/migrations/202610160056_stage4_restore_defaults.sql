-- Stage 4 follow-up: a save captured before migration 55 holds rows without the
-- Stage 4 columns (quest kind and detail, public profile, place and storage
-- detail, the campaign's play time, status, notes and pins). The timeline
-- restore inserts every column of the saved row through jsonb_populate_record,
-- which turns a missing key into NULL and tripped the NOT NULL constraints.
-- The restore now merges the Stage 4 defaults under the saved row (saved keys
-- win), so every older save loads exactly as before plus the defaults.
create function rpg_private.timeline_row_defaults(tab text) returns jsonb language sql immutable set search_path='' as $$
 select case tab
  when 'public.rpg_entities' then '{"public_profile":{}}'::jsonb
  when 'public.rpg_quests' then '{"kind":"quest","detail":{}}'::jsonb
  when 'public.rpg_locations' then '{"detail":{}}'::jsonb
  when 'public.rpg_storages' then '{"detail":{}}'::jsonb
  when 'public.rpg_campaigns' then '{"play_minutes":0,"status":"active","player_likes":"","theme":"","pinned_facts":[]}'::jsonb
  else '{}'::jsonb end
$$;
revoke all on function rpg_private.timeline_row_defaults(text) from public, anon, authenticated;

do $$
declare def text; patched text;
begin
 def := pg_get_functiondef('rpg_private.timeline_activate_before_wave1(uuid,uuid,uuid)'::regprocedure);
 patched := replace(def, 'using rowdata; end if;', 'using rpg_private.timeline_row_defaults(tab)||rowdata; end if;');
 if patched = def then raise exception 'timeline_activate_before_wave1: the restore statement to patch was not found'; end if;
 execute patched;
end $$;
