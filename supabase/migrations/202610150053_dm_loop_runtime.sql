-- Stage 2: the new turn runtime "dm-loop-v1". Additive only.
--   * a turn may carry runtime_identity 'dm-loop-v1';
--   * campaign DM settings (runtime + model) live outside world canon, so they
--     stay editable after an Astra takeover and are pinned per operation;
--   * the loop records tool receipts (dm_tool), its transcript (checkpoint),
--     and commits through the generic change applier (runtime_change).
-- Older runtimes keep their exact paths: every dm-loop branch below is keyed
-- on runtime_identity='dm-loop-v1' or on the explicit serverRuntime request.
begin;

-- 1. Runtime identity ------------------------------------------------------
do $$ declare c text; begin
 select conname into c from pg_constraint
  where conrelid='rpg_private.turns'::regclass and contype='c'
    and pg_get_constraintdef(oid) like '%runtime_identity%';
 perform rpg_private.assert(c is not null);
 execute format('alter table rpg_private.turns drop constraint %I',c);
 alter table rpg_private.turns add constraint turns_runtime_identity_check
  check (runtime_identity is null or runtime_identity in ('astra-primary-v1','dm-loop-v1'));
end $$;

-- The loop checkpoint is opaque authored authority (like astraPrimary): a
-- saved turn rebound to another timeline must not get a timeline key inside it.
do $$ declare d text; begin
 d:=pg_get_functiondef('rpg_private.timeline_stamp(jsonb,jsonb,boolean)'::regprocedure);
 perform rpg_private.assert(position($n$'astraPrimary'$n$ in d)>0 and position('dmLoop' in d)=0);
 execute replace(d,$n$'astraPrimary'$n$,$r$'astraPrimary','dmLoop'$r$);
end $$;

-- 2. Campaign DM settings ---------------------------------------------------
-- Not world data: never part of a timeline manifest, never frozen by takeover.
-- Existing campaigns keep their current runtime; a campaign without a row is
-- new and plays on dm-loop-v1 from its first scene.
create table rpg_private.dm_settings (
  campaign_id uuid primary key references public.rpg_campaigns(id),
  runtime text not null check (runtime in ('astra-primary-v1','dm-loop-v1')),
  dm_turn jsonb,
  revision integer not null default 1 check (revision>0),
  updated_at timestamptz not null default now()
);
alter table rpg_private.dm_settings enable row level security;
revoke all on rpg_private.dm_settings from public,anon,authenticated;
insert into rpg_private.dm_settings(campaign_id,runtime)
  select id,'astra-primary-v1' from public.rpg_campaigns;

create function rpg_private.dm_settings_read(cid uuid) returns jsonb
language sql stable set search_path='' as $$
 select coalesce((select jsonb_build_object('campaignId',s.campaign_id,'runtime',s.runtime,
   'dmTurn',s.dm_turn,'revision',s.revision) from rpg_private.dm_settings s where s.campaign_id=cid),
   jsonb_build_object('campaignId',cid,'runtime','dm-loop-v1','dmTurn',null,'revision',0))
$$;

create function public.rpg_dm_settings(p_owner_id uuid,p_campaign_id uuid,p_action text,
  p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare current jsonb; requested text; selection jsonb; begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id)
   then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
 if not found then raise exception 'rpg_not_found'; end if;
 current:=rpg_private.dm_settings_read(p_campaign_id);
 if p_action='read' then
   perform rpg_private.fields(p_payload,'{}');
   return current;
 end if;
 perform rpg_private.assert(p_action='save');
 perform rpg_private.fields(p_payload,array['expectedRevision','runtime','dmTurn']);
 if (p_payload->>'expectedRevision')::integer<>(current->>'revision')::integer then
   raise exception 'rpg_conflict'; end if;
 requested:=p_payload->>'runtime';
 perform rpg_private.assert(requested in ('astra-primary-v1','dm-loop-v1'));
 selection:=p_payload->'dmTurn';
 if selection<>'null'::jsonb then perform rpg_private.dm_turn_model_selection(selection); end if;
 -- A turn in flight keeps its own pin; the new choice applies to the next operation.
 insert into rpg_private.dm_settings(campaign_id,runtime,dm_turn,revision)
   values(p_campaign_id,requested,nullif(selection,'null'::jsonb),1)
   on conflict(campaign_id) do update set runtime=excluded.runtime,dm_turn=excluded.dm_turn,
     revision=rpg_private.dm_settings.revision+1,updated_at=now();
 return rpg_private.dm_settings_read(p_campaign_id);
end $$;

revoke all on function rpg_private.dm_settings_read(uuid) from public,anon,authenticated;
revoke all on function public.rpg_dm_settings(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then
 revoke all on function rpg_private.dm_settings_read(uuid) from service_role;
 grant execute on function public.rpg_dm_settings(uuid,uuid,text,jsonb,jsonb) to service_role;
end if; end $$;

-- 3. Model pin for a dm-loop turn: only "dm.turn" (no served Astra profiles).
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
  elsif t.runtime_identity='dm-loop-v1' then perform rpg_private.fields(p_profiles,array['dm.turn']);
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

-- 4. Storage rows for the generic applier -----------------------------------
-- runtime_change has no 'storages' family; the loop creates pack, merchant,
-- companion and holding storages, so this small sibling applies them with the
-- same scoping rules (own campaign, no adoption of a foreign row).
create function rpg_private.dm_loop_storage_change(cid uuid,change jsonb) returns void
language plpgsql set search_path='' as $$
declare rid uuid:=(change->>'id')::uuid; data jsonb:=change->'values'; old public.rpg_storages%rowtype; begin
 perform rpg_private.fields(change,array['family','id','expectedRevision','values']);
 perform rpg_private.assert(change->>'family'='storages' and rid is not null and jsonb_typeof(data)='object');
 perform rpg_private.fields(data,'{}',array['name','kind','entity_id']);
 select * into old from public.rpg_storages where id=rid for update;
 if old.id is not null then
   perform rpg_private.assert(old.campaign_id=cid and
     coalesce((change->>'expectedRevision')::integer,0)=old.revision);
   update public.rpg_storages set
     name=coalesce(data->>'name',name),kind=coalesce(data->>'kind',kind),
     entity_id=case when data ? 'entity_id' then (data->>'entity_id')::uuid else entity_id end,
     revision=revision+1,updated_at=now() where id=rid;
 else
   perform rpg_private.fields(data,array['name','kind','entity_id']);
   perform rpg_private.assert(change->'expectedRevision'='null'::jsonb);
   insert into public.rpg_storages(id,campaign_id,name,kind,entity_id,revision)
     values(rid,cid,data->>'name',data->>'kind',(data->>'entity_id')::uuid,1);
 end if;
end $$;
revoke all on function rpg_private.dm_loop_storage_change(uuid,jsonb) from public,anon,authenticated;

-- 5. The runtime entry point -----------------------------------------------
alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) rename to rpg_runtime_before_dm_loop;

create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,
  p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare t rpg_private.turns%rowtype; state rpg_private.runtime_state%rowtype; result jsonb; op uuid;
 clean jsonb; loop_state jsonb; prior_loop jsonb; receipts jsonb; receipt jsonb; prior jsonb; pos integer;
 call jsonb; tool_result jsonb; check_row jsonb; check_index integer; token uuid; packet jsonb; entry jsonb;
 player_scene_id uuid; narration_id uuid; private_value jsonb; patch_kind text; key text;
 had_source boolean; src jsonb; started_failed boolean;
begin
 if p_action not in ('begin','claim','dm_tool','checkpoint','reroll','checks','commit','astra_tool') then
   return public.rpg_runtime_before_dm_loop(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
 end if;
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id)
   then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
 if not found then raise exception 'rpg_not_found'; end if;
 op:=(p_payload->>'operationId')::uuid;
 select * into t from rpg_private.turns where id=op and campaign_id=p_campaign_id
   and owner_id=p_owner_id for update;

 -- begin: durable literal input first (the accepted chain), then the identity.
 if p_action='begin' then
   if p_payload->>'serverRuntime' is distinct from 'dm-loop-v1' then
     if t.id is not null and t.runtime_identity='dm-loop-v1' then raise exception 'rpg_conflict'; end if;
     return public.rpg_runtime_before_dm_loop(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
   end if;
   perform rpg_private.timeline_assert(p_campaign_id,p_timeline,true);
   clean:=p_payload-'serverRuntime';
   perform rpg_private.assert(clean->>'mode' in ('game','companion'));
   if t.id is not null then
     if t.runtime_identity is distinct from 'dm-loop-v1' then raise exception 'rpg_conflict'; end if;
     if t.input<>clean then raise exception 'rpg_conflict'; end if;
     return rpg_private.timeline_stamp(rpg_private.runtime_public_turn(t),
       rpg_private.timeline_fence(p_campaign_id));
   end if;
   if rpg_private.astra_takeover_active(p_campaign_id) and clean->>'mode'='game' then
     -- A taken-over World Logic campaign switched to the new runtime: the
     -- takeover wrappers accept only their own identity at begin, so the
     -- row is created through them and re-labelled here, before any claim.
     result:=public.rpg_runtime_before_dm_loop(p_owner_id,p_campaign_id,p_action,
       clean||jsonb_build_object('serverRuntime','astra-primary-v1'),p_timeline);
     update rpg_private.turns set runtime_identity='dm-loop-v1',astra_response_contract=null,
       astra_response_mode=null,checkpoint=(checkpoint-'astraPrimary')
       where id=op and campaign_id=p_campaign_id and owner_id=p_owner_id and status='pending';
   else
     result:=public.rpg_runtime_before_dm_loop(p_owner_id,p_campaign_id,p_action,clean,p_timeline);
     update rpg_private.turns set runtime_identity='dm-loop-v1'
       where id=op and campaign_id=p_campaign_id and owner_id=p_owner_id and status='pending'
         and runtime_identity is null;
   end if;
   perform rpg_private.assert(found);
   update rpg_private.turns set checkpoint=checkpoint||jsonb_build_object('dmLoop',
     jsonb_build_object('schemaVersion',1,'createdTimeline',p_timeline,'receipts','[]'::jsonb,
       'transcript','[]'::jsonb,'text','','meta',null,'usage','[]'::jsonb,'diagnostics','[]'::jsonb,
       'requests',0,'pin',null,'shadow',null))
     where id=op and campaign_id=p_campaign_id and owner_id=p_owner_id;
   return result;
 end if;

 if t.id is null or t.runtime_identity is distinct from 'dm-loop-v1' then
   return public.rpg_runtime_before_dm_loop(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
 end if;
 -- From here on the turn is a dm-loop-v1 turn.
 if p_action in ('astra_tool','checks') then raise exception 'rpg_validation'; end if;

 if p_action='claim' then
   had_source:=t.source is not null;
   started_failed:=t.status='failed' and t.retryable;
   result:=public.rpg_runtime_before_dm_loop(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
   if result is null then return null; end if;
   select * into t from rpg_private.turns where id=op and campaign_id=p_campaign_id for update;
   src:=t.source;
   -- One narrator sees the private state in every mode of this runtime
   -- (a companion talk needs the companion's Character Model).
   if not had_source and t.input->>'mode'='companion' then
     src:=src||jsonb_build_object('privateState',coalesce((select contents from rpg_private.dm_state
       where campaign_id=p_campaign_id),'{}'::jsonb));
     update rpg_private.turns set source=src where id=op and campaign_id=p_campaign_id;
     result:=jsonb_set(result,'{source}',src);
   end if;
   -- A claimed retry is a new attempt on the same pins (as migration 50 does for Astra).
   if started_failed then
     update rpg_private.turns set status='generating',failure=null,retryable=false
       where id=op and campaign_id=p_campaign_id and status='failed'
         and lease_token=(result#>>'{lease,token}')::uuid returning * into t;
     result:=jsonb_set(result,'{turn,public}',rpg_private.timeline_stamp(
       rpg_private.runtime_public_turn(t),rpg_private.timeline_fence(p_campaign_id)));
   end if;
   return result;
 end if;

 perform rpg_private.timeline_assert(p_campaign_id,p_timeline,true);
 prior_loop:=t.checkpoint->'dmLoop';
 perform rpg_private.assert(prior_loop->'schemaVersion'='1'::jsonb and
   jsonb_typeof(prior_loop->'receipts')='array');
 select * into state from rpg_private.runtime_state where campaign_id=p_campaign_id for update;

 if p_action='dm_tool' then
   perform rpg_private.fields(p_payload,array['campaignId','operationId','token','expectedRevision',
     'position','call','result']);
   perform rpg_private.assert(p_payload->>'campaignId'=p_campaign_id::text and
     t.lease_token=(p_payload->>'token')::uuid and t.lease_until>now() and
     t.status in ('pending','generating') and
     t.expected_revision=(p_payload->>'expectedRevision')::integer and
     t.expected_revision=state.revision);
   pos:=(p_payload->>'position')::integer;
   receipts:=prior_loop->'receipts';
   perform rpg_private.assert(pos between 0 and 199 and pos<=jsonb_array_length(receipts));
   call:=p_payload->'call';
   perform rpg_private.fields(call,array['id','name','arguments']);
   perform rpg_private.assert(jsonb_typeof(call->'id')='string' and length(call->>'id') between 1 and 200 and
     call->>'name' ~ '^[a-z_]{1,64}$' and jsonb_typeof(call->'arguments')='object');
   if pos<jsonb_array_length(receipts) then
     -- Replay after a crash: the same call at the same position returns the
     -- recorded receipt; dice are never rolled twice.
     prior:=receipts->pos;
     if prior->'call'<>call then raise exception 'rpg_conflict'; end if;
     return prior;
   end if;
   tool_result:=p_payload->'result';
   perform rpg_private.assert(jsonb_typeof(tool_result)='object' and jsonb_typeof(tool_result->'ok')='boolean' and
     octet_length(tool_result::text)<=200000);
   check_row:=nullif(tool_result->'check','null'::jsonb);
   if check_row is not null then
     check_index:=jsonb_array_length(t.checkpoint->'checks');
     perform rpg_private.fields(check_row,array['index','actorId','targetId','kind','stat','dc','dcPublic',
       'visibility','important','uncertainty','advantage','id','dice','kept','modifier','total','success','rollNumber']);
     perform rpg_private.assert(check_index<8 and (check_row->>'index')::integer=check_index and
       check_row->>'id'=rpg_private.wave4_id(t.id,'check:'||check_index::text)::text and
       exists(select 1 from public.rpg_entities e where e.campaign_id=p_campaign_id and
         e.id=(check_row->>'actorId')::uuid) and
       (check_row->'targetId'='null'::jsonb or exists(select 1 from public.rpg_entities e
         where e.campaign_id=p_campaign_id and e.id=(check_row->>'targetId')::uuid)) and
       check_row->>'kind' in ('skill','attack','save','transform') and
       check_row->>'stat' in ('skill','attack','save') and
       check_row->>'visibility' in ('player','private') and
       check_row->>'uncertainty'='meaningful' and
       check_row->>'advantage' in ('normal','advantage','disadvantage') and
       (check_row->>'dc')::integer between 1 and 40 and (check_row->>'rollNumber')::integer=1 and
       (check_row->>'modifier')::integer between -100 and 100 and
       jsonb_typeof(check_row->'dice')='array' and
       jsonb_array_length(check_row->'dice')=case when check_row->>'advantage'='normal' then 1 else 2 end and
       not exists(select 1 from jsonb_array_elements(check_row->'dice') d
         where jsonb_typeof(d.value)<>'number' or (d.value::text)::integer not between 1 and 20) and
       (check_row->>'kept')::integer=case when check_row->>'advantage'='disadvantage'
         then (select min((d.value::text)::integer) from jsonb_array_elements(check_row->'dice') d)
         else (select max((d.value::text)::integer) from jsonb_array_elements(check_row->'dice') d) end and
       (check_row->>'total')::integer=(check_row->>'kept')::integer+(check_row->>'modifier')::integer and
       (check_row->>'success')::boolean=((check_row->>'total')::integer>=(check_row->>'dc')::integer));
   end if;
   receipt:=jsonb_build_object('position',pos,'id',rpg_private.wave4_id(t.id,'dm:tool:'||pos::text),
     'call',call,'result',tool_result);
   update rpg_private.turns set checkpoint=jsonb_set(
     case when check_row is not null then jsonb_set(checkpoint,'{checks}',checkpoint->'checks'||jsonb_build_array(check_row))
       else checkpoint end,
     '{dmLoop,receipts}',receipts||jsonb_build_array(receipt)),updated_at=now()
     where id=t.id and campaign_id=p_campaign_id;
   return receipt;
 end if;

 if p_action='checkpoint' then
   loop_state:=p_payload#>'{checkpoint,dmLoop}';
   perform rpg_private.fields(loop_state,array['schemaVersion','createdTimeline','receipts','transcript',
     'text','meta','usage','diagnostics','requests','pin','shadow']);
   perform rpg_private.assert(loop_state->'schemaVersion'='1'::jsonb and
     loop_state->'createdTimeline'=prior_loop->'createdTimeline' and
     loop_state->'receipts'=prior_loop->'receipts' and
     jsonb_typeof(loop_state->'transcript')='array' and jsonb_typeof(loop_state->'text')='string' and
     jsonb_typeof(loop_state->'usage')='array' and jsonb_typeof(loop_state->'diagnostics')='array' and
     jsonb_typeof(loop_state->'requests')='number' and
     (prior_loop->'pin'='null'::jsonb or loop_state->'pin'=prior_loop->'pin') and
     octet_length(loop_state::text)<=1500000);
   clean:=jsonb_set(p_payload,'{checkpoint}',(p_payload->'checkpoint')-'dmLoop');
   -- Lease, fence, revision, status and displayed-check rules are the accepted ones.
   result:=public.rpg_runtime_before_astra_primary(p_owner_id,p_campaign_id,p_action,clean,p_timeline);
   update rpg_private.turns set checkpoint=checkpoint||jsonb_build_object('dmLoop',loop_state)
     where id=t.id and campaign_id=p_campaign_id;
   return result;
 end if;

 if p_action='reroll' then
   -- Only a check that one of this turn's roll receipts produced may be rerolled.
   perform rpg_private.assert(exists(select 1 from jsonb_array_elements(prior_loop->'receipts') r
     where r.value#>>'{result,check,id}'=p_payload#>>'{command,checkId}'));
   return public.rpg_runtime_before_astra_primary(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
 end if;

 -- commit ------------------------------------------------------------------
 perform rpg_private.assert(p_action='commit');
 packet:=p_payload->'packet';
 if t.status='committed' then
   if exists(select 1 from rpg_private.runtime_events e where e.campaign_id=p_campaign_id
     and e.operation_id=t.id and e.payload->'packet'=packet) then
     return rpg_private.timeline_stamp(rpg_private.runtime_public_turn(t),rpg_private.timeline_fence(p_campaign_id));
   end if;
   raise exception 'rpg_conflict';
 end if;
 token:=(p_payload->>'token')::uuid;
 if t.lease_token is distinct from token or token is null or t.lease_until<=now() or
   t.status in ('committed','cancelled') then raise exception 'rpg_conflict'; end if;
 if t.expected_revision<>state.revision or (p_payload->>'expectedRevision')::integer<>state.revision then
   raise exception 'rpg_conflict'; end if;
 perform rpg_private.fields(packet,array['narration','visualDescription','resolution','privatePatches',
   'checks','guidanceProposal','dmLoop']);
 perform rpg_private.assert(jsonb_typeof(packet->'narration')='string' and
   length(btrim(packet->>'narration')) between 1 and 20000 and
   jsonb_typeof(packet->'visualDescription')='string' and length(packet->>'visualDescription')<=2000 and
   packet->'checks'=t.checkpoint->'checks' and packet->'guidanceProposal'='null'::jsonb and
   t.input->>'mode' in ('game','companion') and t.session_id is not null and
   exists(select 1 from public.rpg_sessions where id=t.session_id and campaign_id=p_campaign_id and status='open'));
 perform rpg_private.fields(packet->'resolution',array['changes','worldMinutes','configuration','outcomes']);
 perform rpg_private.assert(jsonb_typeof(packet#>'{resolution,changes}')='array' and
   jsonb_array_length(packet#>'{resolution,changes}')<=200 and
   jsonb_typeof(packet->'privatePatches')='array' and jsonb_array_length(packet->'privatePatches')<=40);
 perform rpg_private.fields(packet->'dmLoop',array['receipts','meta','usage','requests']);
 perform rpg_private.assert(packet#>'{dmLoop,receipts}'=prior_loop->'receipts');
 -- Changes are applied in the order the loop collapsed them (parents first).
 for entry in select x.value from jsonb_array_elements(packet#>'{resolution,changes}') x loop
   if entry->>'family'='storages' then perform rpg_private.dm_loop_storage_change(p_campaign_id,entry);
   else perform rpg_private.runtime_change(p_campaign_id,op,entry); end if;
 end loop;
 perform rpg_private.assert((packet#>>'{resolution,worldMinutes}')::integer>=state.world_minutes and
   (packet#>>'{resolution,worldMinutes}')::integer<=state.world_minutes+20160);
 update rpg_private.runtime_state set world_minutes=(packet#>>'{resolution,worldMinutes}')::integer,
   configuration=packet#>'{resolution,configuration}',revision=revision+1,updated_at=now()
   where campaign_id=p_campaign_id;
 -- Deterministic scene identifiers: the loop may cite its own narration scene
 -- as evidence (Character Model episodes) before the commit exists.
 player_scene_id:=rpg_private.wave4_id(op,'scene:player');
 narration_id:=rpg_private.wave4_id(op,'scene:narration');
 insert into public.rpg_scenes(id,campaign_id,session_id,title,body,role,settings_revision,revision)
   values(player_scene_id,p_campaign_id,t.session_id,'Player action',t.input->>'input','player',t.settings_revision,1);
 insert into public.rpg_scenes(id,campaign_id,session_id,title,body,role,settings_revision,revision)
   values(narration_id,p_campaign_id,t.session_id,'DM',packet->>'narration','narration',t.settings_revision,1);
 update public.rpg_public_state set current_scene_id=narration_id,current_session_id=t.session_id,
   revision=public.rpg_public_state.revision+1,updated_at=now() where campaign_id=p_campaign_id;
 if t.input->>'mode'='companion' then
   insert into public.rpg_conversations(id,campaign_id,entity_id,entries)
     values(op,p_campaign_id,(t.input->>'companionId')::uuid,jsonb_build_array(jsonb_build_object(
       'operationId',op,'sessionId',t.session_id,'listenerIds',t.input->'listenerIds',
       'input',t.input->'input','reply',packet->'narration')));
 end if;
 if jsonb_array_length(packet->'privatePatches')>0 then
   select contents into private_value from rpg_private.dm_state where campaign_id=p_campaign_id for update;
   private_value:=coalesce(private_value,'{}'::jsonb);
   for entry in select x.value from jsonb_array_elements(packet->'privatePatches') x loop
     perform rpg_private.fields(entry,array['kind','key','operation','value','amount']);
     patch_kind:=entry->>'kind'; key:=entry->>'key';
     perform rpg_private.assert(patch_kind in ('fact','clock','npc','faction','consequence') and
       key ~ '^[a-zA-Z0-9_-]{1,120}$');
     if not private_value ? patch_kind then
       private_value:=private_value||jsonb_build_object(patch_kind,'{}'::jsonb); end if;
     if entry->>'operation'='set' then
       perform rpg_private.assert(jsonb_typeof(entry->'value')='string' and
         length(entry->>'value')<=6000 and entry->'amount'='null'::jsonb);
       private_value:=jsonb_set(private_value,array[patch_kind,key],entry->'value');
     else
       perform rpg_private.assert(entry->>'operation'='advance' and patch_kind='clock' and
         entry->'value'='null'::jsonb and (entry->>'amount')::integer between 0 and 100);
       private_value:=jsonb_set(private_value,array[patch_kind,key],
         to_jsonb(coalesce((private_value#>>array[patch_kind,key])::integer,0)+(entry->>'amount')::integer));
     end if;
   end loop;
   insert into rpg_private.dm_state(campaign_id,contents) values(p_campaign_id,private_value)
     on conflict(campaign_id) do update set contents=excluded.contents,
       revision=rpg_private.dm_state.revision+1,updated_at=now();
 end if;
 insert into rpg_private.runtime_events(campaign_id,operation_id,payload) values(p_campaign_id,op,
   jsonb_build_object('input',t.input,'packet',packet,'sourceRevision',t.expected_revision,
     'settingsRevision',t.settings_revision,'guideVersionId',t.guide_version_id,
     'playerSceneId',player_scene_id,'narrationSceneId',narration_id,'runtime','dm-loop-v1'));
 update rpg_private.turns set status='committed',
   committed_revision=(select r.revision from rpg_private.runtime_state r where r.campaign_id=p_campaign_id),
   narration=packet->>'narration',visual_description=packet->>'visualDescription',proposal=null,
   lease_token=null,lease_until=null,failure=null,retryable=false,updated_at=now()
   where id=op and campaign_id=p_campaign_id returning * into t;
 return rpg_private.timeline_stamp(rpg_private.runtime_public_turn(t),rpg_private.timeline_fence(p_campaign_id));
end $$;

revoke all on function public.rpg_runtime_before_dm_loop(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated,service_role;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) to service_role;
revoke all on all functions in schema rpg_private from public,anon,authenticated;

commit;
