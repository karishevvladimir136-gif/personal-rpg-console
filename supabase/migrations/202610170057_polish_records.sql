-- Polish stage, group 1 (docs/stages/POLISH.md): correctness of the turn and the records. Additive only.
--   * items remember where a thing went (pledged or lent: the owner keeps title, the
--     holder has it; lost; the item's history) in a new `detail` column;
--   * sessions carry the closing stinger «Тем временем…» the digest writes;
--   * the public turn lists the player's lines (campaign language) of the accepted
--     calls the hero would notice — private rolls, DM notes, plans and lookups never
--     reach it — plus the people the hero met this turn and the moment's reason;
--   * the Stage 4 digest runs on an ended session (its memory boundary exists), not
--     only on a closed one, so «Закончить сессию» is enough to get it (item 11);
--   * rpg_dossier digest accepts the stinger;
--   * older saves restore with the new columns' defaults.
begin;

-- 1. Columns -----------------------------------------------------------------------
alter table public.rpg_items add column detail jsonb not null default '{}'::jsonb;
alter table public.rpg_items add constraint rpg_items_detail_check
  check (jsonb_typeof(detail)='object' and octet_length(detail::text)<=12000);
alter table public.rpg_sessions add column stinger text not null default '';
alter table public.rpg_sessions add constraint rpg_sessions_stinger_check check (length(stinger)<=4000);

-- 2. The loop's record applier accepts items.detail (migration 55 added rarity the same way).
do $$ declare d text; begin
 select pg_get_functiondef('rpg_private.runtime_change_before_astra_ordered(uuid,uuid,jsonb)'::regprocedure) into d;
 d:=replace(d,'extra:=array[''rarity'']','extra:=array[''rarity'',''detail'']');
 perform rpg_private.assert(d like '%extra:=array[''rarity'',''detail'']%');
 execute d;
end $$;

-- 3. Older saves restore with the defaults of the new columns.
create or replace function rpg_private.timeline_row_defaults(tab text) returns jsonb language sql immutable set search_path='' as $$
 select case tab
  when 'public.rpg_entities' then '{"public_profile":{}}'::jsonb
  when 'public.rpg_quests' then '{"kind":"quest","detail":{}}'::jsonb
  when 'public.rpg_locations' then '{"detail":{}}'::jsonb
  when 'public.rpg_storages' then '{"detail":{}}'::jsonb
  when 'public.rpg_items' then '{"detail":{}}'::jsonb
  when 'public.rpg_sessions' then '{"stinger":""}'::jsonb
  when 'public.rpg_campaigns' then '{"play_minutes":0,"status":"active","player_likes":"","theme":"","pinned_facts":[]}'::jsonb
  else '{}'::jsonb end
$$;

-- 4. The runtime source and the public snapshot carry items.detail and sessions.stinger.
alter function rpg_private.runtime_source(uuid,uuid,text) rename to runtime_source_before_polish;
create function rpg_private.runtime_source(cid uuid,uid uuid,mode text default 'game') returns jsonb
language plpgsql stable set search_path='' as $$
declare result jsonb:=rpg_private.runtime_source_before_polish(cid,uid,mode); rows jsonb; begin
 select coalesce(jsonb_agg(x.value||jsonb_build_object('detail',i.detail) order by x.ordinality),'[]'::jsonb) into rows
  from jsonb_array_elements(result#>'{snapshot,items}') with ordinality x(value,ordinality)
  join public.rpg_items i on i.campaign_id=cid and i.id=(x.value->>'id')::uuid;
 result:=jsonb_set(result,'{snapshot,items}',rows);
 select coalesce(jsonb_agg(x.value||jsonb_build_object('stinger',s.stinger) order by x.ordinality),'[]'::jsonb) into rows
  from jsonb_array_elements(result#>'{snapshot,sessions}') with ordinality x(value,ordinality)
  join public.rpg_sessions s on s.campaign_id=cid and s.id=(x.value->>'id')::uuid;
 result:=jsonb_set(result,'{snapshot,sessions}',rows);
 return result;
end $$;
revoke all on function rpg_private.runtime_source_before_polish(uuid,uuid,text),rpg_private.runtime_source(uuid,uuid,text) from public,anon,authenticated;

-- 5. The public turn: the player's lines, the people met, the moment's reason.
--    A receipt written before this migration has no `player`: its summary is kept,
--    but DM notes, lookups and private rolls are dropped the same way.
alter function rpg_private.runtime_public_turn(rpg_private.turns) rename to runtime_public_turn_before_polish;
create function rpg_private.runtime_public_turn(t rpg_private.turns)
returns jsonb language sql stable set search_path='' as $$
 select rpg_private.runtime_public_turn_before_polish(t)||
   case when t.runtime_identity='dm-loop-v1' and t.status='committed' then jsonb_build_object(
     'changes',coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('tool',r.value#>>'{call,name}','ok',true,
          'summary',coalesce(r.value#>>'{result,player}',r.value#>>'{result,summary}'),
          'action',r.value#>>'{call,arguments,action}')) order by (r.value->>'position')::integer)
        from jsonb_array_elements(coalesce(t.checkpoint#>'{dmLoop,receipts}','[]'::jsonb)) r
        where r.value#>'{result,ok}'='true'::jsonb and r.value#>>'{call,name}'<>'finish_turn'
          and case when (r.value->'result') ? 'player' then jsonb_typeof(r.value#>'{result,player}')='string'
              else r.value#>>'{call,name}' not in ('query_state','note_world','note_character')
                and coalesce(r.value#>>'{result,value,visibility}','')<>'private' end),'[]'::jsonb)
       || coalesce((select jsonb_agg(jsonb_build_object('tool','meet','ok',true,'summary',m.value->>'player'))
            from jsonb_array_elements(coalesce(t.checkpoint#>'{dmLoop,meta,met}','[]'::jsonb)) m),'[]'::jsonb),
     'playerMomentReason',coalesce(t.checkpoint#>'{dmLoop,meta,playerMomentReason}','null'::jsonb))
   else '{}'::jsonb end
$$;
revoke all on function rpg_private.runtime_public_turn_before_polish(rpg_private.turns),rpg_private.runtime_public_turn(rpg_private.turns) from public,anon,authenticated;

-- 6. The digest runs the moment the session ends (item 11). «Закончить сессию»
--    writes the memory boundary atomically and must not close the session row:
--    the runtime revision stays (END never resolves anything) and an unfinished
--    action survives END until «Продолжить». The digest therefore accepts a
--    session whose boundary exists; the session row closes on «Продолжить» as before.
-- 7. rpg_dossier digest: {…, stinger?} writes the session's closing stinger, and
--    accepts an ended session (its memory boundary exists) as well as a closed one.
do $$ declare d text; begin
 select pg_get_functiondef('public.rpg_dossier(uuid,uuid,text,jsonb,jsonb)'::regprocedure) into d;
 d:=replace(d,'array[''requestId'',''sessionId'',''recap'',''title'',''notebook'',''plans''],array[''playerLikes'']',
             'array[''requestId'',''sessionId'',''recap'',''title'',''notebook'',''plans''],array[''playerLikes'',''stinger'']');
 d:=replace(d,'update public.rpg_sessions set recap=p_payload->>''recap'',title=btrim(p_payload->>''title''),revision=revision+1,updated_at=now()',
             'update public.rpg_sessions set recap=p_payload->>''recap'',title=btrim(p_payload->>''title''),stinger=left(coalesce(p_payload->>''stinger'',stinger),4000),revision=revision+1,updated_at=now()');
 d:=replace(d,'perform rpg_private.assert(exists(select 1 from public.rpg_sessions where campaign_id=p_campaign_id and id=sid and status=''closed''));',
             'perform rpg_private.assert(exists(select 1 from public.rpg_sessions where campaign_id=p_campaign_id and id=sid and (status=''closed'' or exists(select 1 from rpg_private.memory_boundaries b where b.campaign_id=p_campaign_id and b.session_id=sid))));');
 perform rpg_private.assert(d like '%''playerLikes'',''stinger''%' and d like '%stinger=left(coalesce(%' and d like '%b.session_id=sid))));%');
 execute d;
end $$;

commit;
