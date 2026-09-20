-- Wave 2: additive owner controls, bounded execution and safe stage continuation.
-- Applied only to disposable synthetic databases during this sprint.
begin;

create function rpg_private.wave2_model_selection(v jsonb) returns void
language plpgsql immutable set search_path='' as $$
begin
 perform rpg_private.fields(v,array['providerId','modelId','reasoning']);
 perform rpg_private.assert(v->>'providerId'='openai' and v->>'modelId' in ('gpt-6-astra','gpt-5.4','gpt-5.4-mini'));
 perform rpg_private.assert(v->'reasoning'='null' or (jsonb_typeof(v->'reasoning')='string' and
  ((v->>'modelId'='gpt-6-astra' and v->>'reasoning' in ('low','medium','high','xhigh','max')) or
   (v->>'modelId'<>'gpt-6-astra' and v->>'reasoning' in ('none','low','medium','high','xhigh')))));
end $$;

create function rpg_private.wave2_runtime_policy(v jsonb, previous jsonb) returns void
language plpgsql immutable set search_path='' as $$
declare task text; selection jsonb; begin
 if v='null' then return; end if;
 perform rpg_private.fields(v,array['schemaVersion','revision','primary','taskOverrides']);
 perform rpg_private.assert(v->>'schemaVersion'='1' and (v->>'revision')::integer=coalesce((previous->>'revision')::integer,0)+1 and jsonb_typeof(v->'taskOverrides')='object');
 if v->'primary'<>'null' then perform rpg_private.wave2_model_selection(v->'primary'); end if;
 for task,selection in select key,value from jsonb_each(v->'taskOverrides') loop
  perform rpg_private.assert(task in ('dm.plan','dm.narrate','dm.feedback','memory.summary','world.resolve'));
  perform rpg_private.wave2_model_selection(selection);
 end loop;
end $$;

-- Add a narrow owner action to the existing authority; it never accepts actors,
-- threads, evidence, arbitrary state patches or provider credentials from a browser.
do $$ declare d text; old text; addition text; begin
 select pg_get_functiondef('public.rpg_world(uuid,uuid,text,jsonb,jsonb)'::regprocedure) into d; old:=d;
 addition:=$body$
 elsif p_action='owner_configure' then
  perform rpg_private.fields(p_payload,array['command','worldPolicy','ruleset','executionPolicy']);
  if exists(select 1 from rpg_private.turns where campaign_id=cid and status not in ('committed','cancelled')) or exists(select 1 from public.rpg_encounters where campaign_id=cid and status='active') then raise exception 'rpg_conflict'; end if;
  v:=p_payload->'ruleset';
  perform rpg_private.assert(v in ('{"id":"console-basic-v1","version":1,"mode":"full_ruleset","validatorVersion":"console-basic-v1"}'::jsonb,'{"id":"world-logic-v1","version":1,"mode":"world_logic","validatorVersion":"world-logic-v1"}'::jsonb));
  perform rpg_private.wave2_runtime_policy(p_payload->'executionPolicy',snap->'executionPolicy');
  v:=p_payload->'worldPolicy';
  perform rpg_private.fields(v,array['simulation','autonomy','deadlinePressure']);
  perform rpg_private.assert(jsonb_typeof(v->'simulation')='boolean' and v->>'autonomy' in ('low','moderate','high') and v->>'deadlinePressure' in ('off','critical_only','normal'));
  w:=nullif(snap->'world','null');
  if w is null then
   w:=jsonb_build_object('schemaVersion',1,'campaignId',cid,'policy',v,'policyChangedAtWorldMinutes',snap->'worldMinutes','actors','[]'::jsonb,'threads','[]'::jsonb,'hooks','[]'::jsonb,'warnings','[]'::jsonb);
  else
   -- Enabling an overdue schedule needs a separate explicit reconciliation.
   -- This bounded settings surface never runs a hidden backlog.
   if v->>'simulation'='true' and (w#>>'{policy,simulation}'='false' or array_position(array['off','critical_only','normal'],v->>'deadlinePressure')>array_position(array['off','critical_only','normal'],w#>>'{policy,deadlinePressure}')) and exists(
    select 1 from jsonb_array_elements(w->'threads') th,jsonb_array_elements(th->'steps') with ordinality step(value,n)
    where th->>'status'='active' and n>(th->>'cursor')::integer and value#>>'{trigger,kind}' in ('deadline','autonomy') and (value#>>'{trigger,atWorldMinutes}')::bigint<=(snap->>'worldMinutes')::bigint
   ) then raise exception 'rpg_conflict'; end if;
   w:=jsonb_set(jsonb_set(w,'{policy}',v),'{policyChangedAtWorldMinutes}',snap->'worldMinutes');
  end if;
  perform rpg_private.world_validate_state(p_owner_id,cid,w,snap->'bindings');
  insert into rpg_private.world_foundations(campaign_id,world,ruleset,execution_policy) values(cid,w,p_payload->'ruleset',nullif(p_payload->'executionPolicy','null'))
   on conflict(campaign_id) do update set world=excluded.world,ruleset=excluded.ruleset,execution_policy=excluded.execution_policy,revision=rpg_private.world_foundations.revision+1;
  if (select values->>'worldAutonomy' from public.rpg_settings where campaign_id=cid) is distinct from v->>'autonomy' then
   update public.rpg_settings set values=jsonb_set(values,'{worldAutonomy}',v->'autonomy'),revision=revision+1,updated_at=now() where campaign_id=cid;
   insert into public.rpg_settings_revisions(campaign_id,revision,values) select campaign_id,revision,values from public.rpg_settings where campaign_id=cid;
  end if;
 elsif p_action='configure' then
$body$;
 d:=replace(d,'elsif p_action=''configure'' then',addition);
 perform rpg_private.assert(d<>old); execute d;
end $$;

-- Existing settings writes are still supported, but one campaign policy wins.
-- The persistent UI removes its duplicate autonomy picker; older clients remain coherent.
create function rpg_private.wave2_sync_autonomy() returns trigger language plpgsql set search_path='' as $$
begin
 if not rpg_private.timeline_restoring(new.campaign_id) and new.values->>'worldAutonomy' is distinct from old.values->>'worldAutonomy' then
  update rpg_private.world_foundations set world=jsonb_set(world,'{policy,autonomy}',new.values->'worldAutonomy'),revision=revision+1
   where campaign_id=new.campaign_id and world is not null and world#>>'{policy,autonomy}' is distinct from new.values->>'worldAutonomy';
 end if;
 return new;
end $$;
create trigger wave2_sync_autonomy after update on public.rpg_settings for each row execute function rpg_private.wave2_sync_autonomy();

-- Preserve old two-stage execution profiles; new World Logic turns explicitly
-- pin their resolver and primary narrator together before requesting either.
do $$ declare d text; old text; begin
 select pg_get_functiondef('public.rpg_execution_profile(uuid,uuid,uuid,jsonb,jsonb,uuid)'::regprocedure) into d; old:=d;
 d:=replace(d,'else perform rpg_private.fields(p_profiles,array[''dm.plan'',''dm.narrate'']); end if;',
  'elsif (select ruleset->>''id'' from rpg_private.world_foundations where campaign_id=p_campaign_id)=''world-logic-v1'' then perform rpg_private.fields(p_profiles,array[''world.resolve'',''dm.narrate'']); else perform rpg_private.fields(p_profiles,array[''dm.plan'',''dm.narrate''],array[''world.resolve'']); end if;');
 perform rpg_private.assert(d<>old); execute d;
end $$;

revoke all on all functions in schema rpg_private from public,anon,authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then revoke all on all functions in schema rpg_private from service_role; end if; end $$;
commit;
