-- Fix run after session 2, stage E (item 81, the owner's design): the session's ending. One digest per session
-- (stage A's guard) now also writes how the session closes, by its length: after a short one «что было» in a few
-- lines; after a long one the ending cards — one per person or group the hero met, with where they are, how they
-- stand with the hero and one line of fate («неизвестно» when the hero does not know); then the open threads; then
-- the channel that carried «Тем временем» (a report to the captain, a rumour, a letter). The «Тем временем» text
-- itself stays in `stinger`. Public: everything here is what the hero knows.
-- Additive only: one column with a default; the runtime source, the restore defaults and rpg_dossier digest patched.
begin;

alter table public.rpg_sessions add column ending jsonb not null default '{}'::jsonb;
alter table public.rpg_sessions add constraint rpg_sessions_ending_check check (jsonb_typeof(ending)='object' and octet_length(ending::text)<=16000);

-- Older saves restore with the default.
create or replace function rpg_private.timeline_row_defaults(tab text) returns jsonb language sql immutable set search_path='' as $$
 select case tab
  when 'public.rpg_entities' then '{"public_profile":{}}'::jsonb
  when 'public.rpg_quests' then '{"kind":"quest","detail":{}}'::jsonb
  when 'public.rpg_locations' then '{"detail":{}}'::jsonb
  when 'public.rpg_storages' then '{"detail":{}}'::jsonb
  when 'public.rpg_items' then '{"detail":{}}'::jsonb
  when 'public.rpg_sessions' then '{"stinger":"","ending":{}}'::jsonb
  when 'public.rpg_campaigns' then '{"play_minutes":0,"status":"active","player_likes":"","theme":"","pinned_facts":[]}'::jsonb
  else '{}'::jsonb end
$$;

-- The runtime source (and so the public snapshot) carries the ending with each session.
alter function rpg_private.runtime_source(uuid,uuid,text) rename to runtime_source_before_ending;
create function rpg_private.runtime_source(cid uuid,uid uuid,mode text default 'game') returns jsonb
language plpgsql stable set search_path='' as $$
declare result jsonb:=rpg_private.runtime_source_before_ending(cid,uid,mode); rows jsonb; begin
 select coalesce(jsonb_agg(x.value||jsonb_build_object('ending',s.ending) order by x.ordinality),'[]'::jsonb) into rows
  from jsonb_array_elements(result#>'{snapshot,sessions}') with ordinality x(value,ordinality)
  join public.rpg_sessions s on s.campaign_id=cid and s.id=(x.value->>'id')::uuid;
 return jsonb_set(result,'{snapshot,sessions}',rows);
end $$;
revoke all on function rpg_private.runtime_source_before_ending(uuid,uuid,text),rpg_private.runtime_source(uuid,uuid,text) from public,anon,authenticated;

-- rpg_dossier digest: {…, ending?} — an object; a digest without it keeps the session's ending.
do $$ declare d text; begin
 select pg_get_functiondef('public.rpg_dossier(uuid,uuid,text,jsonb,jsonb)'::regprocedure) into d;
 d:=replace(d,'array[''requestId'',''sessionId'',''recap'',''title'',''notebook'',''plans''],array[''playerLikes'',''stinger'']',
             'array[''requestId'',''sessionId'',''recap'',''title'',''notebook'',''plans''],array[''playerLikes'',''stinger'',''ending'']');
 d:=replace(d,'stinger=left(coalesce(p_payload->>''stinger'',stinger),4000),',
             'stinger=left(coalesce(p_payload->>''stinger'',stinger),4000),ending=case when jsonb_typeof(p_payload->''ending'')=''object'' then p_payload->''ending'' else ending end,');
 perform rpg_private.assert(d like '%''playerLikes'',''stinger'',''ending''%' and d like '%ending=case when jsonb_typeof(p_payload->''ending'')=''object''%');
 execute d;
end $$;

commit;
