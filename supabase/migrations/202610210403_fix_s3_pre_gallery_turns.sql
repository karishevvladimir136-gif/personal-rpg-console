-- Fixes before session 3 (docs/stages/FIX_S3_PRE.md 2.3, audit row B-13): the gallery takes its own read over every
-- committed game turn — the /play projection carries only the last 64 (202609180004 runtime_play), so the frames of the
-- earlier sessions dropped out of «Кадры» once a campaign passed 64 turns (the owner, item 80: «all frames by session»).
-- One owner-only read: each committed game turn's id, session, time, and the first line of its input and narration
-- (bounded; the captions and «К ходу» need no more). Additive: a new function; runtime_play is untouched.
begin;

create function public.rpg_gallery_turns(p_owner_id uuid, p_campaign_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id)
   then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 if not exists(select 1 from public.rpg_campaigns where id=p_campaign_id) then raise exception 'rpg_not_found'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'session_id',t.session_id,'created_at',t.created_at,'status',t.status,
     'mode',t.input->>'mode','input',left(split_part(coalesce(t.input->>'input',''),E'\n',1),300),
     'narration',left(split_part(btrim(coalesce(t.narration,'')),E'\n',1),300)) order by t.sequence)
   from rpg_private.turns t where t.campaign_id=p_campaign_id and t.status='committed' and t.input->>'mode'='game' and btrim(coalesce(t.narration,''))<>''),'[]'::jsonb);
end $$;

revoke all on function public.rpg_gallery_turns(uuid,uuid) from public,anon,authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then
 grant execute on function public.rpg_gallery_turns(uuid,uuid) to service_role;
end if; end $$;

commit;
