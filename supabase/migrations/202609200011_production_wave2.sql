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

-- Capture proof in the existing save family. Old saved rows restore with NULL
-- proof and remain readable; changed-fence continuation for those rows pauses.
alter table rpg_private.world_stages add column authority jsonb;

create function rpg_private.wave2_recovery_authority(uid uuid,cid uuid,op uuid) returns jsonb
language plpgsql stable set search_path='' as $$
declare src jsonb; t rpg_private.turns%rowtype; profiles jsonb; begin
 select * into strict t from rpg_private.turns where campaign_id=cid and id=op;
 src:=rpg_private.runtime_source(cid,uid,t.input->>'mode');
 src:=rpg_private.timeline_stamp(src,'{"timelineId":"00000000-0000-4000-8000-000000000000","epoch":0}'::jsonb,false);
 src:=jsonb_set(src,'{runtime,revision}','0');
 src:=jsonb_set(src,'{runtime,turns}',coalesce((select jsonb_agg(value order by n) from jsonb_array_elements(src#>'{runtime,turns}') with ordinality e(value,n) where value->>'id'<>op::text),'[]'));
 select coalesce(jsonb_object_agg(task,profile),'{}') into profiles from rpg_private.execution_profiles where campaign_id=cid and operation_id=op;
 return jsonb_build_object('schemaVersion',1,'foundation',rpg_private.foundation_read(uid,cid)-array['timeline','runtimeRevision','headId'],
  'source',src,'input',t.input-array['timeline','expectedRevision'],'plan',t.checkpoint->'plan','checks',t.checkpoint->'checks','profiles',profiles,
  'worldLogic',t.checkpoint->'worldLogic');
end $$;

create function rpg_private.wave2_capture_stage_authority() returns trigger language plpgsql set search_path='' as $$
declare uid uuid; begin
 if rpg_private.timeline_restoring(new.campaign_id) then return new; end if;
 select owner_id into strict uid from rpg_private.turns where campaign_id=new.campaign_id and id=new.id;
 new.authority:=rpg_private.wave2_recovery_authority(uid,new.campaign_id,new.id);
 return new;
end $$;
create trigger wave2_capture_stage_authority before insert on rpg_private.world_stages for each row execute function rpg_private.wave2_capture_stage_authority();

create function rpg_private.wave2_effective_stage(cid uuid,op uuid,token uuid) returns jsonb
language plpgsql stable set search_path='' as $$
declare result jsonb; head jsonb; begin
 select to_jsonb(t.head_manifest_id) into head from rpg_private.timeline_campaigns c join rpg_private.timelines t on t.campaign_id=c.campaign_id and t.id=c.active_timeline_id where c.campaign_id=cid;
 select w.result->'settlement' into result from rpg_private.world_commands w
  where w.campaign_id=cid and w.request->>'action'='recover' and w.request#>>'{command,operationId}'=op::text
  and w.request->>'token'=token::text and w.request#>'{command,timeline}'=rpg_private.timeline_fence(cid)
  and w.request#>'{command,expectedHeadId}'=coalesce(head,'null'::jsonb);
 if result is not null then return result; end if;
 select settlement into result from rpg_private.world_stages where campaign_id=cid and id=op;
 return result;
end $$;

alter function public.rpg_world(uuid,uuid,text,jsonb,jsonb) set schema rpg_private;
alter function rpg_private.rpg_world(uuid,uuid,text,jsonb,jsonb) rename to world_before_wave2_recovery;
create function public.rpg_world(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare c jsonb; oldstage rpg_private.world_stages%rowtype; t rpg_private.turns%rowtype; fresh jsonb; result jsonb; receipt_id uuid; request jsonb; saved rpg_private.world_commands%rowtype; begin
 if p_action<>'recover' then return rpg_private.world_before_wave2_recovery(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline); end if;
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update; if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_assert(p_campaign_id,p_timeline);
 perform rpg_private.fields(p_payload,array['command','token']); c:=p_payload->'command';
 perform rpg_private.fields(c,array['operationId','campaignId','timeline','expectedRevision','expectedRuntimeRevision','expectedHeadId']);
 perform rpg_private.assert(c->'timeline'=p_timeline and c->>'campaignId'=p_campaign_id::text);
 perform rpg_private.foundation_fence(p_owner_id,p_campaign_id,c);
 select * into t from rpg_private.turns where campaign_id=p_campaign_id and id=(c->>'operationId')::uuid;
 if t.id is null or t.owner_id<>p_owner_id or t.status<>'generating' or t.lease_token is distinct from (p_payload->>'token')::uuid or t.lease_until<=now() or t.expected_revision<>(c->>'expectedRuntimeRevision')::integer then raise exception 'rpg_conflict'; end if;
 select * into oldstage from rpg_private.world_stages where campaign_id=p_campaign_id and id=t.id;
 if oldstage.id is null or exists(select 1 from rpg_private.world_events where campaign_id=p_campaign_id and operation_id=t.id) then raise exception 'rpg_conflict'; end if;
 -- Legacy stages can resume under their exact original fence. They have no
 -- captured authority proof and therefore cannot cross a changed fence.
 if oldstage.settlement||c=oldstage.settlement then
  perform rpg_private.world_validate_settlement(p_owner_id,p_campaign_id,oldstage.settlement,t);
  return oldstage.settlement;
 end if;
 -- Exact active projection membership came from this branch's manifest; never
 -- search vaulted/future/sibling stages or profiles to fill a missing record.
 fresh:=rpg_private.wave2_recovery_authority(p_owner_id,p_campaign_id,t.id);
 if oldstage.authority is null or oldstage.authority<>fresh then raise exception 'rpg_recovery_required'; end if;
 if (p_timeline->>'epoch')::bigint<(oldstage.settlement#>>'{timeline,epoch}')::bigint
  or ((p_timeline->>'epoch')::bigint=(oldstage.settlement#>>'{timeline,epoch}')::bigint and (oldstage.settlement->'timeline'<>p_timeline or oldstage.settlement->'expectedRuntimeRevision'<>c->'expectedRuntimeRevision'))
  or ((p_timeline->>'epoch')::bigint>(oldstage.settlement#>>'{timeline,epoch}')::bigint and (c->>'expectedRuntimeRevision')::bigint<=(oldstage.settlement->>'expectedRuntimeRevision')::bigint)
 then raise exception 'rpg_recovery_required'; end if;
 result:=oldstage.settlement||c;
 -- Original event IDs/bodies/origin timeline are preserved. The receipt binds
 -- this new serving envelope, not a rewritten historical stage.
 receipt_id:=rpg_private.world_event_id(t.id,p_timeline->>'timelineId',t.lease_token::text,'continuation');
 request:=jsonb_build_object('action','recover','command',c,'token',t.lease_token);
 select * into saved from rpg_private.world_commands where id=receipt_id;
 if found then
  if saved.campaign_id<>p_campaign_id or saved.request<>request then raise exception 'rpg_conflict'; end if;
  return saved.result->'settlement';
 end if;
 insert into rpg_private.world_commands(id,campaign_id,request,result) values(receipt_id,p_campaign_id,request,jsonb_build_object('schemaVersion',1,'origin',oldstage.settlement,'settlement',result));
 perform rpg_private.world_validate_settlement(p_owner_id,p_campaign_id,result,t);
 return result;
end $$;

-- Effective envelopes are selected only by the current lease. Preserve the
-- original immutable stage and reject stale callbacks after every activation.
do $$ declare d text; old text; begin
 select pg_get_functiondef('public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)'::regprocedure) into d; old:=d;
 d:=replace(d,'select settlement into staged from rpg_private.world_stages where campaign_id=p_campaign_id and id=t.id;',
  'staged:=rpg_private.wave2_effective_stage(p_campaign_id,t.id,(p_payload->>''token'')::uuid);');
 perform rpg_private.assert(d<>old); execute d;
end $$;

-- Only a validated current continuation may keep an older immutable event origin.
-- Domain checks still run against current authority and the original event body.
do $$ declare d text; old text; begin
 select pg_get_functiondef('rpg_private.world_validate_settlement(uuid,uuid,jsonb,rpg_private.turns)'::regprocedure) into d; old:=d;
 d:=replace(d,'e->>''originTimelineId''=p#>>''{timeline,timelineId}''',
  '(e->>''originTimelineId''=p#>>''{timeline,timelineId}'' or ((p-array[''events'',''nextWorld''])=(rpg_private.wave2_effective_stage(cid,t.id,t.lease_token)-array[''events'',''nextWorld'']) and exists(select 1 from rpg_private.world_stages os,jsonb_array_elements(os.settlement->''events'') oe where os.campaign_id=cid and os.id=t.id and oe=e)))');
 perform rpg_private.assert(d<>old); execute d;
end $$;

-- Resolver receipts authorize only existing selected steps. They cannot change
-- their consequence text, actor knowledge, deadlines or controlled-PC policy.
do $$ declare d text; old text; begin
 select pg_get_functiondef('rpg_private.world_validate_settlement(uuid,uuid,jsonb,rpg_private.turns)'::regprocedure) into d; old:=d;
 d:=replace(d,'array[''schemaVersion'',''stepId'',''previousCursor'',''nextCursor'',''hookChanges'']);',
  'array[''schemaVersion'',''stepId'',''previousCursor'',''nextCursor'',''hookChanges''],array[''resolverReceipt'']);');
 d:=replace(d,'step->>''resolution''=''deterministic''',
  '((step->>''resolution''=''deterministic'' and not (e->''payload''?''resolverReceipt'')) or (step->>''resolution''=''resolver_required'' and rpg_private.wave2_resolver_receipt(t.id,oldw,thread,step,e#>''{payload,resolverReceipt}'')))');
 perform rpg_private.assert(d<>old); execute d;
end $$;

create function rpg_private.wave2_resolver_receipt(op uuid,w jsonb,th jsonb,step jsonb,v jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare ref text; i integer; begin
 perform rpg_private.fields(v,array['schemaVersion','operationId','threadId','stepId','decision','uncertainty','capabilityRefs','evidenceIndexes']);
 perform rpg_private.assert(v->>'schemaVersion'='1' and v->>'operationId'=op::text and v->>'threadId'=th->>'id' and v->>'stepId'=step->>'id' and v->>'decision'='advance' and v->>'uncertainty'='resolved');
 perform rpg_private.assert(jsonb_typeof(v->'capabilityRefs')='array' and jsonb_array_length(v->'capabilityRefs')<=32 and jsonb_typeof(v->'evidenceIndexes')='array' and jsonb_array_length(v->'evidenceIndexes')=jsonb_array_length(step->'evidence'));
 perform rpg_private.assert((select count(*)=count(distinct value) from jsonb_array_elements(v->'capabilityRefs')) and (select count(*)=count(distinct value) from jsonb_array_elements(v->'evidenceIndexes')));
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(v->'evidenceIndexes') x where jsonb_typeof(x)<>'number' or (x#>>'{}')!~'^(0|[1-9][0-9]{0,2})$'));
 for ref in select jsonb_array_elements_text(v->'capabilityRefs') loop
  perform rpg_private.assert(exists(select 1 from jsonb_array_elements(w->'actors') a,jsonb_array_elements_text(a->'capabilities') cap where th->'decisionActorIds' ? (a->>'id') and ref=(a->>'id')||':'||cap));
 end loop;
 for i in select value::integer from jsonb_array_elements_text(v->'evidenceIndexes') loop perform rpg_private.assert(i>=0 and i<jsonb_array_length(step->'evidence')); end loop;
 return true;
end $$;

create function rpg_private.wave2_action_id(op uuid) returns uuid language plpgsql immutable set search_path='' as $$
declare h text; begin
 h:=substr(encode(sha256(convert_to('rpg-v1:'||op::text||':world-logic-v1:action','UTF8')),'hex'),1,32);
 h:=overlay(h placing '5' from 13 for 1); h:=overlay(h placing to_hex((get_byte(decode(substr(h,17,2),'hex'),0)>>4 & 3)|8) from 17 for 1);
 return h::uuid;
end $$;

alter function rpg_private.world_validate_settlement(uuid,uuid,jsonb,rpg_private.turns) rename to world_validate_settlement_before_logic;
create function rpg_private.world_validate_settlement(uid uuid,cid uuid,p jsonb,t rpg_private.turns) returns void
language plpgsql stable set search_path='' as $$
declare snap jsonb; oldw jsonb; neww jsonb; action jsonb; proposal jsonb; actor jsonb; knowledge jsonb; sources jsonb; expected_changes jsonb:='[]'; expected_actors jsonb; other jsonb; ref text; n integer; destination public.rpg_locations%rowtype; pub public.rpg_public_state%rowtype; begin
 select value into action from jsonb_array_elements(p->'events') where value->>'kind'='world.logic.resolved';
 if action is null then
  if nullif(t.checkpoint->'worldLogic','null') is not null then raise exception 'rpg_validation'; end if;
  perform rpg_private.world_validate_settlement_before_logic(uid,cid,p,t); return;
 end if;
 perform rpg_private.fields(p,array['operationId','campaignId','timeline','expectedRevision','expectedRuntimeRevision','expectedHeadId','schemaVersion','status','fromWorldMinutes','throughWorldMinutes','sourceVersionIds','events','nextWorld']);
 snap:=rpg_private.foundation_fence(uid,cid,p); oldw:=snap->'world'; neww:=p->'nextWorld'; proposal:=t.checkpoint->'worldLogic';
 perform rpg_private.assert(oldw<>'null' and snap#>>'{ruleset,id}'='world-logic-v1' and snap#>>'{ruleset,validatorVersion}'='world-logic-v1' and snap#>>'{ruleset,mode}'='world_logic' and snap#>>'{ruleset,version}'='1');
 perform rpg_private.assert(t.input->>'mode'='game' and p->>'operationId'=t.id::text and p->>'schemaVersion'='1' and p->>'status'='staged' and p->'fromWorldMinutes'=snap->'worldMinutes');
 perform rpg_private.assert(jsonb_array_length(p->'events') between 1 and 8 and (select count(*)=count(distinct value->>'id') from jsonb_array_elements(p->'events')) and (select count(*) from jsonb_array_elements(p->'events') where value->>'kind'='world.logic.resolved')=1);
 perform rpg_private.fields(proposal,array['schemaVersion','actorId','input','action','outcome','uncertainty','capabilityRefs','circumstanceRefs','evidenceIndexes','publicText','elapsedMinutes','destinationId']);
 perform rpg_private.assert(proposal->>'schemaVersion'='1' and proposal->>'input'=t.input->>'input' and proposal->>'uncertainty'='resolved' and proposal->>'action' in ('observe','speak','attempt','move','wait') and proposal->>'outcome' in ('completed','blocked') and (proposal->>'elapsedMinutes')::integer between 0 and 60 and length(proposal->>'publicText') between 1 and 2000);
 perform rpg_private.assert(exists(select 1 from public.rpg_entities e where e.campaign_id=cid and e.id=(proposal->>'actorId')::uuid and (e.kind='player' or t.source#>'{runtime,configuration,controlledEntityIds}' ? (e.id::text))));
 select value into actor from jsonb_array_elements(oldw->'actors') where value->>'entityId'=proposal->>'actorId';
 select coalesce(jsonb_agg(distinct src.value),'[]') into sources from jsonb_array_elements(snap->'bindings') b,jsonb_array_elements(b->'sourceVersionIds') src(value);
 perform rpg_private.uuid_array(p->'sourceVersionIds'); perform rpg_private.assert(sources@>(p->'sourceVersionIds') and (p->'sourceVersionIds')@>sources);
 select coalesce(jsonb_agg(value order by i),'[]') into knowledge from jsonb_array_elements(coalesce(actor->'knowledge','[]')) with ordinality a(value,i) where value->>'visibility'='public' and value->>'knowledge'='character' and sources ? (value->>'sourceVersionId') and value->>'ownerId'=uid::text;
 perform rpg_private.assert(jsonb_typeof(proposal->'capabilityRefs')='array' and jsonb_array_length(proposal->'capabilityRefs')<=32 and coalesce(actor->'capabilities','[]')@>(proposal->'capabilityRefs'));
 perform rpg_private.assert(jsonb_typeof(proposal->'circumstanceRefs')='array' and jsonb_array_length(proposal->'circumstanceRefs')<=32 and jsonb_typeof(proposal->'evidenceIndexes')='array' and jsonb_array_length(proposal->'evidenceIndexes')<=32 and jsonb_array_length(proposal->'circumstanceRefs')+jsonb_array_length(proposal->'evidenceIndexes')>0);
 for ref in select jsonb_array_elements_text(proposal->'circumstanceRefs') loop
  perform rpg_private.assert((ref='public-state' and length(btrim(t.source#>>'{snapshot,publicState,summary}'))>0) or ref='location:'||(t.source#>>'{snapshot,publicState,current_location_id}') or exists(select 1 from public.rpg_entities e where e.campaign_id=cid and ref='actor:'||e.id::text and (e.kind='player' or t.source#>'{runtime,configuration,controlledEntityIds}' ? (e.id::text))));
 end loop;
 perform rpg_private.assert((select count(*)=count(distinct value) from jsonb_array_elements(proposal->'evidenceIndexes')) and not exists(select 1 from jsonb_array_elements(proposal->'evidenceIndexes') x where jsonb_typeof(x)<>'number' or (x#>>'{}')!~'^(0|[1-9][0-9]{0,2})$'));
 for n in select value::integer from jsonb_array_elements_text(proposal->'evidenceIndexes') loop perform rpg_private.assert(n>=0 and n<jsonb_array_length(knowledge)); end loop;
 perform rpg_private.fields(action,array['schemaVersion','id','campaignId','originTimelineId','operationId','worldMinutes','kind','actorIds','threadIds','visibility','text','evidence','payload']);
 perform rpg_private.assert(action->>'schemaVersion'='1' and action->>'id'=rpg_private.wave2_action_id(t.id)::text and action->>'campaignId'=cid::text and action->>'operationId'=t.id::text and (action->>'originTimelineId'=p#>>'{timeline,timelineId}' or ((p-array['events','nextWorld'])=(rpg_private.wave2_effective_stage(cid,t.id,t.lease_token)-array['events','nextWorld']) and exists(select 1 from rpg_private.world_stages os,jsonb_array_elements(os.settlement->'events') oe where os.campaign_id=cid and os.id=t.id and oe=action))) and action->>'visibility'='public' and action->'threadIds'='[]');
 perform rpg_private.assert(action->'actorIds'=case when actor->>'publicName' is null then '[]'::jsonb else jsonb_build_array(actor->>'id') end);
 perform rpg_private.assert(action->'text'=proposal->'publicText' and action->'worldMinutes'=p->'throughWorldMinutes' and (p->>'throughWorldMinutes')::bigint=(p->>'fromWorldMinutes')::bigint+(proposal->>'elapsedMinutes')::integer);
 perform rpg_private.assert(action->'payload'=proposal-array['uncertainty','evidenceIndexes','publicText']);
 perform rpg_private.assert(action->'evidence'=coalesce((select jsonb_agg(knowledge->(value::integer) order by i) from jsonb_array_elements_text(proposal->'evidenceIndexes') with ordinality a(value,i)),'[]'));
 perform rpg_private.library_evidence(uid,action->'evidence',sources,true);
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(action->'evidence') ev join rpg_private.library_records r on r.version_id=(ev->>'sourceVersionId')::uuid where exists(select 1 from rpg_private.library_records newer where newer.owner_id=r.owner_id and newer.kind=r.kind and newer.id=r.id and newer.version>r.version)));
 expected_actors:=oldw->'actors';
 if proposal->>'action'='move' and proposal->>'outcome'='completed' then
  select * into destination from public.rpg_locations where campaign_id=cid and id=(proposal->>'destinationId')::uuid and status in ('known','visited');
  select * into pub from public.rpg_public_state where campaign_id=cid;
  perform rpg_private.assert(destination.id is not null and (proposal->>'elapsedMinutes')::integer>0 and not exists(select 1 from public.rpg_encounters where campaign_id=cid and status='active') and not exists(select 1 from public.rpg_rest_records where campaign_id=cid and status='planned'));
  expected_changes:=jsonb_build_array(jsonb_build_object('family','public_state','id',cid,'expectedRevision',pub.revision,'values',jsonb_build_object('current_location_id',destination.id)),jsonb_build_object('family','locations','id',destination.id,'expectedRevision',destination.revision,'values',jsonb_build_object('status','visited')));
  select coalesce(jsonb_agg(case when value->>'entityId'=proposal->>'actorId' then jsonb_set(jsonb_set(value,'{locationId}',proposal->'destinationId'),'{revision}',to_jsonb((value->>'revision')::integer+1)) else value end order by i),'[]') into expected_actors from jsonb_array_elements(oldw->'actors') with ordinality a(value,i);
 else perform rpg_private.assert(proposal->'destinationId'='null'); end if;
 if proposal->>'action'='wait' then perform rpg_private.assert((proposal->>'elapsedMinutes')::integer>0); end if;
 perform rpg_private.assert(t.checkpoint#>'{resolution,changes}'=expected_changes and t.checkpoint#>'{resolution,configuration}'=t.source#>'{runtime,configuration}' and t.checkpoint->'checks'='[]' and t.checkpoint#>'{plan,privatePatches}'='[]');
 perform rpg_private.assert(neww->'actors'=expected_actors and (neww-array['actors','threads','hooks','warnings'])=(oldw-array['actors','threads','hooks','warnings']));
 perform rpg_private.world_validate_state(uid,cid,neww,snap->'bindings');
 other:=jsonb_set(jsonb_set(p,'{events}',coalesce((select jsonb_agg(value order by i) from jsonb_array_elements(p->'events') with ordinality a(value,i) where value->>'kind'<>'world.logic.resolved'),'[]')),'{nextWorld,actors}',oldw->'actors');
 if jsonb_array_length(other->'events')>0 then perform rpg_private.world_validate_settlement_before_logic(uid,cid,other,t);
 else perform rpg_private.assert(neww->'threads'=oldw->'threads' and neww->'hooks'=oldw->'hooks' and neww->'warnings'=oldw->'warnings'); end if;
end $$;

do $$ declare d text; old text; begin
 select pg_get_functiondef('public.rpg_runtime_phase2(uuid,uuid,text,jsonb)'::regprocedure) into d; old:=d;
 d:=replace(d,'array[''worldSettlement'']','array[''worldSettlement'',''worldLogic'']');
 perform rpg_private.assert(d<>old); execute d;
 select pg_get_functiondef('public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)'::regprocedure) into d;
 d:=replace(d,'if p_action=''checkpoint'' and',
  'if p_action=''checkpoint'' and nullif(t.checkpoint->''worldLogic'',''null'') is not null then perform rpg_private.assert(p_payload#>''{checkpoint,worldLogic}''=t.checkpoint->''worldLogic''); end if; if p_action=''commit'' and nullif(t.checkpoint->''worldLogic'',''null'') is not null then perform rpg_private.assert(p_payload#>''{packet,resolution}''=t.checkpoint->''resolution'' and p_payload#>''{packet,privatePatches}''=''[]'' and jsonb_typeof(p_payload#>''{packet,worldSettlement}'')=''object'' and exists(select 1 from rpg_private.world_stages where campaign_id=p_campaign_id and id=t.id)); end if; if p_action=''checkpoint'' and');
 execute d;
end $$;

alter function rpg_private.runtime_public_turn(rpg_private.turns) rename to runtime_public_turn_before_wave2;
create function rpg_private.runtime_public_turn(t rpg_private.turns) returns jsonb language plpgsql stable set search_path='' as $$
declare result jsonb; begin
 result:=rpg_private.runtime_public_turn_before_wave2(t);
 if t.checkpoint#>>'{worldLogic,uncertainty}' in ('missing_evidence','contradiction','unsupported') then
  result:=result||jsonb_build_object('worldUncertainty',t.checkpoint#>>'{worldLogic,uncertainty}');
 end if;
 -- Public continuation affordances never reveal whether hidden world work exists.
 if t.status not in ('committed','cancelled') and t.input->>'mode' in ('game','mechanic','companion') then
  result:=result||jsonb_build_object('worldRecovery',case when t.status='failed' and not t.retryable then 'review_required' else 'available' end);
  if t.status in ('pending','generating') and (t.lease_until is null or t.lease_until<=now()) then result:=result||jsonb_build_object('canRetry',true); end if;
 end if;
 return result;
end $$;

-- Settlements and typed proposals retain their original internal provenance.
do $$ declare d text; old text; begin
 select pg_get_functiondef('rpg_private.world_before_wave2_recovery(uuid,uuid,text,jsonb,jsonb)'::regprocedure) into d; old:=d;
 d:=replace(d,'elsif p_action=''bind'' then','elsif p_action=''bind'' then
  if exists(select 1 from rpg_private.turns where campaign_id=cid and status not in (''committed'',''cancelled'')) then raise exception ''rpg_conflict''; end if;');
 perform rpg_private.assert(d<>old); execute d;
end $$;

-- Settlements and typed proposals retain their original internal provenance.
-- Timeline stamping belongs only to the surrounding serving envelopes.
do $$ declare d text; old text; begin
 select pg_get_functiondef('rpg_private.timeline_stamp(jsonb,jsonb,boolean)'::regprocedure) into d; old:=d;
 d:=replace(d,'''exactState'']','''exactState'',''worldSettlement'',''worldLogic'']');
 perform rpg_private.assert(d<>old); execute d;
end $$;

-- Local extraction locators count UTF-16 code units, matching preserved JS input.
-- Convert only complete Unicode character boundaries; never hash a replacement surrogate.
create function rpg_private.wave2_utf16_slice(original text, first_unit integer, last_unit integer) returns text language plpgsql immutable set search_path='' as $$
declare ch text; units integer:=0; characters integer:=0; first_char integer; last_char integer; begin
 perform rpg_private.assert(first_unit>=0 and last_unit>first_unit and last_unit<=500000);
 if first_unit=0 then first_char:=0; end if;
 foreach ch in array string_to_array(original,null) loop
  units:=units+case when ascii(ch)>65535 then 2 else 1 end; characters:=characters+1;
  if units=first_unit then first_char:=characters; end if;
  if units=last_unit then last_char:=characters; exit; end if;
  if units>last_unit then exit; end if;
 end loop;
 perform rpg_private.assert(first_char is not null and last_char is not null);
 return substring(original from first_char+1 for last_char-first_char);
end $$;

create or replace function rpg_private.library_evidence(uid uuid, evidence jsonb, allowed jsonb, public_only boolean default false) returns void language plpgsql stable set search_path='' as $$
#variable_conflict use_column
declare e jsonb; s jsonb; excerpt text; begin
 perform rpg_private.assert(jsonb_typeof(evidence)='array' and jsonb_array_length(evidence)<=100);
 for e in select value from jsonb_array_elements(evidence) loop
  perform rpg_private.fields(e,array['ownerId','sourceId','sourceVersionId','locator','digest','visibility','knowledge']);
  s:=rpg_private.library_ref(uid,e->>'sourceVersionId','source');
  perform rpg_private.assert(e->>'ownerId'=uid::text and e->>'sourceId'=s->>'id' and allowed ? (e->>'sourceVersionId'));
  perform rpg_private.assert(e->>'visibility' in ('public','private') and e->>'knowledge' in ('source','canon_at_entry','character','future_source'));
  perform rpg_private.fields(e->'locator',array['kind','value']);
  perform rpg_private.assert(e#>>'{locator,kind}' in ('text','page','section','image') and length(e#>>'{locator,value}') between 1 and 2000);
  if s#>>'{body,extraction,version}'='text-evidence-v1' and s#>>'{body,original,kind}'='text' and e#>>'{locator,kind}'='text' then
   perform rpg_private.assert(e#>>'{locator,value}' ~ '^(0|[1-9][0-9]{0,6}):(0|[1-9][0-9]{0,6})$');
   excerpt:=rpg_private.wave2_utf16_slice(s#>>'{body,original,text}',split_part(e#>>'{locator,value}',':',1)::integer,split_part(e#>>'{locator,value}',':',2)::integer);
   perform rpg_private.assert(e->>'digest'=encode(sha256(convert_to(excerpt,'UTF8')),'hex'));
  else perform rpg_private.assert(e->>'digest'=s#>>'{body,digest}'); end if;
  if s#>>'{body,knowledge}'='future_source' then perform rpg_private.assert(e->>'knowledge'='future_source'); end if;
  if e->>'visibility'='public' then perform rpg_private.assert(s#>>'{body,visibility}'='public'); end if;
  if public_only then perform rpg_private.assert(e->>'visibility'='public' and e->>'knowledge' in ('canon_at_entry','character')); end if;
 end loop;
end $$;

-- rpg_library holds the owner lock before inserting and replays prior receipts first.
-- Approval therefore cannot race a correction, while immutable approvals stay replayable.
create function rpg_private.wave2_library_approval() returns trigger language plpgsql set search_path='' as $$
declare v text; source_record rpg_private.library_records; job_record rpg_private.library_records; begin
 if new.kind<>'pack' or new.body->>'status'<>'approved' then return new; end if;
 for v in select jsonb_array_elements_text(new.body->'sourceVersionIds') loop
  select * into source_record from rpg_private.library_records where owner_id=new.owner_id and kind='source' and version_id=v::uuid;
  if not found or exists(select 1 from rpg_private.library_records where owner_id=new.owner_id and kind='source' and id=source_record.id and version>source_record.version) then raise exception 'rpg_conflict'; end if;
 end loop;
 if new.body->>'compilerJobVersionId' is not null then
  select * into job_record from rpg_private.library_records where owner_id=new.owner_id and kind='compiler_job' and version_id=(new.body->>'compilerJobVersionId')::uuid;
  if not found then raise exception 'rpg_validation'; end if;
  select * into job_record from rpg_private.library_records where owner_id=new.owner_id and kind='compiler_job' and id=job_record.id order by version desc limit 1;
  if job_record.body->>'status' not in ('awaiting_review','completed') then raise exception 'rpg_conflict'; end if;
 end if;
 return new;
end $$;
create trigger wave2_library_approval before insert on rpg_private.library_records for each row execute function rpg_private.wave2_library_approval();

revoke all on function public.rpg_world(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then grant execute on function public.rpg_world(uuid,uuid,text,jsonb,jsonb) to service_role; end if; end $$;
revoke all on all functions in schema rpg_private from public,anon,authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then revoke all on all functions in schema rpg_private from service_role; end if; end $$;
commit;
