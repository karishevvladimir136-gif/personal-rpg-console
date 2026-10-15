-- Stage 1: the campaign may choose its DM model for a whole turn ("dm.turn"):
-- Claude Opus 5.5 or GPT-6 Astra. Every other task stays OpenAI-only, so an
-- Anthropic choice can never reach an OpenAI-only adapter. Additive only:
-- earlier migrations are unchanged; two functions are replaced in full.
begin;

-- Matches the TypeScript dm.turn registry (src/lib/model-runtime/dm-models.ts).
create function rpg_private.dm_turn_model_selection(v jsonb) returns void
language plpgsql immutable set search_path='' as $$
begin
 perform rpg_private.fields(v,array['providerId','modelId','reasoning']);
 perform rpg_private.assert((v->>'providerId'='anthropic' and v->>'modelId'='claude-opus-5-5')
  or (v->>'providerId'='openai' and v->>'modelId'='gpt-6-astra'));
 perform rpg_private.assert(v->'reasoning'='null'::jsonb or (jsonb_typeof(v->'reasoning')='string'
  and v->>'reasoning' in ('low','medium','high','xhigh','max')));
end $$;

-- As in production_wave2, plus the "dm.turn" override with its own model set.
create or replace function rpg_private.wave2_runtime_policy(v jsonb, previous jsonb) returns void
language plpgsql immutable set search_path='' as $$
declare task text; selection jsonb; begin
 if v='null' then return; end if;
 perform rpg_private.fields(v,array['schemaVersion','revision','primary','taskOverrides']);
 perform rpg_private.assert(v->>'schemaVersion'='1' and (v->>'revision')::integer=coalesce((previous->>'revision')::integer,0)+1 and jsonb_typeof(v->'taskOverrides')='object');
 if v->'primary'<>'null' then perform rpg_private.wave2_model_selection(v->'primary'); end if;
 for task,selection in select key,value from jsonb_each(v->'taskOverrides') loop
  perform rpg_private.assert(task in ('dm.plan','dm.narrate','dm.feedback','memory.summary','world.resolve','dm.turn'));
  if task='dm.turn' then perform rpg_private.dm_turn_model_selection(selection);
  else perform rpg_private.wave2_model_selection(selection); end if;
 end loop;
end $$;

-- As in production_wave1 with the production_wave2 World Logic branch. New:
-- an Astra-runtime turn pins the campaign's "dm.turn" choice together with the
-- profiles that actually serve it (dm.plan / dm.narrate), so the operation
-- records both what was chosen and what ran. A retry reads the same pin.
create or replace function public.rpg_execution_profile(p_owner_id uuid,p_campaign_id uuid,p_operation_id uuid,p_profiles jsonb,p_timeline jsonb,p_token uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_column
declare result jsonb; p jsonb; t rpg_private.turns%rowtype; j rpg_private.memory_jobs%rowtype; task text; begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update; if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_assert(p_campaign_id,p_timeline);
 select coalesce(jsonb_object_agg(e.task,e.profile),'{}') into result from rpg_private.execution_profiles e where e.campaign_id=p_campaign_id and e.operation_id=p_operation_id;
 if result<>'{}' then return result; end if;
 if p_profiles is null then return '{}'::jsonb; end if;
 select * into t from rpg_private.turns where campaign_id=p_campaign_id and id=p_operation_id;
 if found then
  perform rpg_private.assert((t.status in ('pending','generating','awaiting_confirmation') or (t.status='failed' and t.retryable)) and t.lease_until>now() and t.expected_revision=(select revision from rpg_private.runtime_state where campaign_id=p_campaign_id));
  if t.input->>'mode' in ('feedback','ooc') then perform rpg_private.fields(p_profiles,array['dm.feedback']);
  elsif t.runtime_identity='astra-primary-v1' then perform rpg_private.fields(p_profiles,array['dm.turn','dm.plan','dm.narrate']);
  elsif (select ruleset->>'id' from rpg_private.world_foundations where campaign_id=p_campaign_id)='world-logic-v1' then perform rpg_private.fields(p_profiles,array['world.resolve','dm.narrate']);
  else perform rpg_private.fields(p_profiles,array['dm.plan','dm.narrate'],array['world.resolve']); end if;
 else
  select * into j from rpg_private.memory_jobs where campaign_id=p_campaign_id and id=p_operation_id;
  perform rpg_private.assert(j.id is not null and j.token=p_token and j.status='generating' and j.lease_until>now());
  perform rpg_private.fields(p_profiles,array['memory.summary']);
 end if;
 for task,p in select key,value from jsonb_each(p_profiles) loop
  perform rpg_private.fields(p,array['schemaVersion','id','policyRevision','registryVersion','task','providerId','modelId','reasoning']);
  if task='dm.turn' then
   perform rpg_private.assert(p->>'schemaVersion'='1' and p->>'task'=task and p->>'registryVersion'='dm-models-v1' and (p->>'policyRevision')::integer>=0 and p->'reasoning'<>'null'::jsonb);
   perform rpg_private.dm_turn_model_selection(p-array['schemaVersion','id','policyRevision','registryVersion','task']);
  else
   perform rpg_private.assert(p->>'schemaVersion'='1' and p->>'task'=task and p->>'providerId'='openai' and p->>'modelId' in ('gpt-6-astra','gpt-5.4','gpt-5.4-mini') and (p->>'policyRevision')::integer>=0 and length(p->>'registryVersion') between 1 and 100);
  end if;
  insert into rpg_private.execution_profiles values((p->>'id')::uuid,p_campaign_id,p_operation_id,task,p);
 end loop;
 return p_profiles;
end $$;

revoke all on function rpg_private.dm_turn_model_selection(jsonb) from public,anon,authenticated;
revoke all on function public.rpg_execution_profile(uuid,uuid,uuid,jsonb,jsonb,uuid) from public,anon,authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then
 revoke all on function rpg_private.dm_turn_model_selection(jsonb) from service_role;
 grant execute on function public.rpg_execution_profile(uuid,uuid,uuid,jsonb,jsonb,uuid) to service_role;
end if; end $$;

commit;
