-- Polish stage, group 10 (docs/stages/POLISH.md «Wizard and the path to the first turn», item 18):
-- the opening scene sets the campaign clock. The owner reviews the start time with the
-- opening («Утро · 8:00», …); the commit carries it as `startMinutes` next to the review,
-- and the first turn begins there instead of «День 1 · 00:00». Additive only: the
-- existing rpg_bootstrap is renamed and wrapped; the key is stripped before delegating
-- so every older contract check stays exact.
begin;

-- The fresh-opening invariant (migration 31) read «the clock is at 00:00»; its meaning is «no
-- game turn has been played yet», which is what it says now, so an opening may start at 8:00.
do $$ declare d text; begin
 select pg_get_functiondef('rpg_private.bootstrap_fresh(uuid,uuid,jsonb)'::regprocedure) into d;
 d:=replace(d,'f->>''worldMinutes''=''0'' and rpg_private.adventure_can_change(cid)',
  '(f->>''worldMinutes''=''0'' or not exists(select 1 from rpg_private.turns t where t.campaign_id=cid and t.input->>''mode''=''game'')) and rpg_private.adventure_can_change(cid)');
 perform rpg_private.assert(d like '%t.input->>''mode''=''game'')) and rpg_private.adventure_can_change(cid)%');
 execute d;
end $$;

alter function public.rpg_bootstrap(uuid,uuid,text,jsonb)
  rename to rpg_bootstrap_before_polish_start;

create function public.rpg_bootstrap(p_owner_id uuid,p_campaign_id uuid,
  p_action text,p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare payload jsonb:=p_payload; start_minutes integer; begin
  if p_action='opening.commit' and jsonb_typeof(p_payload)='object' and p_payload ? 'startMinutes' then
    if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry
        where user_id=p_owner_id) then
      raise exception 'rpg_forbidden' using errcode='42501';
    end if;
    perform rpg_private.assert(p_payload->'startMinutes'='null'::jsonb or
      (jsonb_typeof(p_payload->'startMinutes')='number' and
       (p_payload->>'startMinutes')::numeric=floor((p_payload->>'startMinutes')::numeric) and
       (p_payload->>'startMinutes')::integer between 0 and 1439));
    start_minutes:=case when p_payload->'startMinutes'='null'::jsonb then null
      else (p_payload->>'startMinutes')::integer end;
    payload:=p_payload-'startMinutes';
    -- Only a campaign that has not started its clock: no game turn yet and the clock at
    -- 00:00. A replay after a successful commit finds the clock set and changes nothing;
    -- a failed commit rolls this back with the rest of the transaction. The runtime revision
    -- stays: the opening's own fence check compares the draft's expected revisions first.
    if start_minutes is not null and start_minutes>0 and p_campaign_id is not null then
      update rpg_private.runtime_state set world_minutes=start_minutes,updated_at=now()
        where campaign_id=p_campaign_id and world_minutes=0
          and not exists(select 1 from rpg_private.turns t
            where t.campaign_id=p_campaign_id and t.input->>'mode'='game');
    end if;
  end if;
  return public.rpg_bootstrap_before_polish_start(p_owner_id,p_campaign_id,p_action,payload);
end $$;

revoke all on function public.rpg_bootstrap_before_polish_start(uuid,uuid,text,jsonb)
  from public,anon,authenticated,service_role;
revoke all on function public.rpg_bootstrap(uuid,uuid,text,jsonb)
  from public,anon,authenticated;
grant execute on function public.rpg_bootstrap(uuid,uuid,text,jsonb)
  to service_role;
commit;
