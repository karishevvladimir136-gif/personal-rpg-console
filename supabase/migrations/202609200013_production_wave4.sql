-- Wave 4. Additive state on the existing save family; no seed, network or real-data execution.
begin;
alter table rpg_private.world_foundations add column loop_state jsonb;
alter table public.rpg_storages drop constraint rpg_storages_kind_check;
alter table public.rpg_storages add constraint rpg_storages_kind_check check(kind in ('player','companion','camp','transport','merchant'));

-- Ordinary storage remains the only inventory container authority.
do $$ declare d text; begin
 d:=pg_get_functiondef('rpg_private.runtime_change(uuid,uuid,jsonb)'::regprocedure);
 d:=replace(d, 'when ''entities'' then fields:=', 'when ''storages'' then fields:=array[''name'',''kind'',''entity_id'']; revisioned:=true; when ''entities'' then fields:=');
 execute d;
 d:=pg_get_functiondef('rpg_private.apply_base_mutation(uuid,text,uuid,integer,jsonb)'::regprocedure);
 d:=replace(d, 'or s.kind=p_payload->>''kind''', 'or (s.kind=''merchant'' and p_payload->>''kind''=''npc'') or s.kind=p_payload->>''kind''');
 d:=replace(d, 'or p_payload->>''kind''=entity->>''kind''', 'or (p_payload->>''kind''=''merchant'' and entity->>''kind''=''npc'') or p_payload->>''kind''=entity->>''kind''');
 execute d;
end $$;

create function public.rpg_item_visible(cid uuid,rid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select not exists(select 1 from rpg_private.world_foundations f,jsonb_array_elements(coalesce(f.loop_state->'itemPolicies','[]')) p where f.campaign_id=cid and p->>'itemId'=rid::text and p->>'visibility'='private')
$$;
revoke all on function public.rpg_item_visible(uuid,uuid) from public,anon;
grant execute on function public.rpg_item_visible(uuid,uuid) to authenticated,service_role;
create policy wave4_private_stock on public.rpg_items as restrictive for select to authenticated using (public.rpg_item_visible(campaign_id,id));

alter function rpg_private.runtime_source(uuid,uuid,text) rename to runtime_source_wave3;
create function rpg_private.runtime_source(cid uuid,uid uuid,mode text default 'game') returns jsonb language plpgsql stable set search_path='' as $$
declare result jsonb:=rpg_private.runtime_source_wave3(cid,uid,mode); begin
 return jsonb_set(result,'{snapshot,items}',coalesce((select jsonb_agg(x) from jsonb_array_elements(result#>'{snapshot,items}') x where public.rpg_item_visible(cid,(x->>'id')::uuid)),'[]'));
end $$;

-- Restrictive stock changes invalidate derivatives. The source reader additionally
-- checks current visibility so an old index/summary cannot reveal hidden stock.
alter function rpg_private.memory_sources(uuid,text) rename to memory_sources_wave3;
create function rpg_private.memory_sources(cid uuid,visibility text) returns setof rpg_private.memory_public_sources language sql stable set search_path='' as $$
 select s.* from rpg_private.memory_sources_wave3(cid,visibility) s where visibility<>'public' or s.kind<>'item' or public.rpg_item_visible(cid,s.source_id)
$$;

create function rpg_private.wave4_integer(v jsonb,minimum bigint default 0,maximum bigint default 1000000) returns boolean language sql immutable set search_path='' as $$
 select coalesce(jsonb_typeof(v)='number' and (v::text)::numeric between minimum and maximum and mod((v::text)::numeric,1)=0,false)
$$;

create function rpg_private.wave4_state(cid uuid,s jsonb,profile jsonb) returns void language plpgsql stable set search_path='' as $$
declare field text; v jsonb; c jsonb; begin
 perform rpg_private.fields(s,array['schemaVersion','version','profile','progression','currencies','itemPolicies','merchants','tracks','rewards','progress','pending','preparations']);
 perform rpg_private.assert(s->>'schemaVersion'='1' and rpg_private.wave4_integer(s->'version') and s->'profile'=profile and s->>'progression' in ('off','on') and octet_length(s::text)<=1048576);
 foreach field in array array['currencies','itemPolicies','merchants','tracks','rewards','progress','pending','preparations'] loop
  perform rpg_private.assert(jsonb_typeof(s->field)='array' and jsonb_array_length(s->field)<=512);
 end loop;
 foreach field in array array['currencies','tracks','rewards','pending'] loop
  perform rpg_private.assert((select count(*)=count(distinct value->>'id') from jsonb_array_elements(s->field)));
 end loop;
 perform rpg_private.assert((select count(*)=count(distinct value->>'itemId') from jsonb_array_elements(s->'itemPolicies')));
 perform rpg_private.assert((select count(*)=count(distinct value->>'actorId') from jsonb_array_elements(s->'merchants')));
 perform rpg_private.assert((select count(*)=count(distinct (value->>'entityId',value->>'trackId')) from jsonb_array_elements(s->'progress')));
 for v in select value from jsonb_array_elements(s->'currencies') loop
  perform rpg_private.fields(v,array['id','label','resourceKey','version']);
  perform rpg_private.assert(length(v->>'id') between 1 and 80 and v->>'resourceKey' ~ '^[A-Za-z][A-Za-z0-9_-]{0,79}$' and v->>'resourceKey' not in ('constructor','prototype','__proto__') and length(btrim(v->>'label')) between 1 and 200 and rpg_private.wave4_integer(v->'version',1));
 end loop;
 perform rpg_private.assert((select count(*)=count(distinct value->>'resourceKey') from jsonb_array_elements(s->'currencies')));
 for v in select value from jsonb_array_elements(s->'itemPolicies') loop
  perform rpg_private.fields(v,array['itemId','version','currencyId','unitValue','trade','origin','visibility']);
  perform rpg_private.assert(exists(select 1 from public.rpg_items where campaign_id=cid and id=(v->>'itemId')::uuid) and rpg_private.wave4_integer(v->'version',1) and rpg_private.wave4_integer(v->'unitValue') and v->>'trade' in ('allowed','restricted','quest') and v->>'origin' in ('legitimate','stolen') and v->>'visibility' in ('public','private') and exists(select 1 from jsonb_array_elements(s->'currencies') x where x->>'id'=v->>'currencyId'));
 end loop;
 for v in select value from jsonb_array_elements(s->'merchants') loop
  perform rpg_private.fields(v,array['actorId','entityId','version','label','storageId','currencyIds','available','acceptsStolen','usesFunds','capacity','buyBasisPoints','sellBasisPoints','haggleLimitBasisPoints']);
  perform rpg_private.assert(v->>'actorId'=v->>'entityId' and rpg_private.wave4_integer(v->'version',1) and length(btrim(v->>'label')) between 1 and 200 and exists(select 1 from public.rpg_entities where campaign_id=cid and id=(v->>'entityId')::uuid and kind='npc') and exists(select 1 from public.rpg_storages where campaign_id=cid and id=(v->>'storageId')::uuid and entity_id=(v->>'entityId')::uuid));
  perform rpg_private.assert(jsonb_typeof(v->'available')='boolean' and jsonb_typeof(v->'acceptsStolen')='boolean' and jsonb_typeof(v->'usesFunds')='boolean' and (v->'capacity'='null' or rpg_private.wave4_integer(v->'capacity')) and rpg_private.wave4_integer(v->'buyBasisPoints',0,50000) and rpg_private.wave4_integer(v->'sellBasisPoints',0,50000) and rpg_private.wave4_integer(v->'haggleLimitBasisPoints',0,2500));
  perform rpg_private.assert((v->>'buyBasisPoints')::integer+(v->>'haggleLimitBasisPoints')::integer<=(v->>'sellBasisPoints')::integer-(v->>'haggleLimitBasisPoints')::integer);
  for c in select value from jsonb_array_elements(v->'currencyIds') loop perform rpg_private.assert(exists(select 1 from jsonb_array_elements(s->'currencies') x where x->'id'=c)); end loop;
 end loop;
 for v in select value from jsonb_array_elements(s->'tracks') loop
  perform rpg_private.fields(v,array['id','version','label','kind','thresholds','choices']);
  perform rpg_private.assert(rpg_private.wave4_integer(v->'version',1) and length(btrim(v->>'label')) between 1 and 200 and v->>'kind' in ('classic_xp','milestone','generic') and jsonb_typeof(v->'thresholds')='array' and jsonb_array_length(v->'thresholds')<=100 and jsonb_typeof(v->'choices')='array' and jsonb_array_length(v->'choices')<=100);
  for c in select value from jsonb_array_elements(v->'thresholds') loop perform rpg_private.assert(rpg_private.wave4_integer(c,1)); end loop;
  for c in select value from jsonb_array_elements(v->'choices') loop perform rpg_private.fields(c,array['id','label','capability']); perform rpg_private.assert(length(btrim(c->>'label')) between 1 and 200 and length(btrim(c->>'capability')) between 1 and 200); end loop;
 end loop;
 for v in select value from jsonb_array_elements(s->'rewards') loop
  perform rpg_private.fields(v,array['id','version','label','source','distribution','recipientIds','entries']);
  perform rpg_private.assert(rpg_private.wave4_integer(v->'version',1) and length(btrim(v->>'label')) between 1 and 200 and v->>'distribution' in ('actor','party_equal') and v#>>'{source,kind}' in ('quest','thread','event') and (v#>>'{source,id}')::uuid is not null);
  perform rpg_private.uuid_array(v->'recipientIds',32);
  for c in select value from jsonb_array_elements(v->'recipientIds') loop perform rpg_private.assert(exists(select 1 from public.rpg_entities where campaign_id=cid and id=(c#>>'{}')::uuid and kind in ('player','companion'))); end loop;
  for c in select value from jsonb_array_elements(v->'entries') loop
   perform rpg_private.assert(c->>'kind' in ('progression','currency','item'));
   if c->>'kind'='item' then perform rpg_private.fields(c,array['kind','itemId','quantity']); perform rpg_private.assert(rpg_private.wave4_integer(c->'quantity',1) and exists(select 1 from public.rpg_items where campaign_id=cid and id=(c->>'itemId')::uuid));
   elsif c->>'kind'='currency' then perform rpg_private.fields(c,array['kind','currencyId','amount']); perform rpg_private.assert(rpg_private.wave4_integer(c->'amount',1) and exists(select 1 from jsonb_array_elements(s->'currencies') x where x->>'id'=c->>'currencyId'));
   else perform rpg_private.fields(c,array['kind','trackId','amount']); perform rpg_private.assert(rpg_private.wave4_integer(c->'amount',1) and exists(select 1 from jsonb_array_elements(s->'tracks') x where x->>'id'=c->>'trackId')); end if;
  end loop;
 end loop;
 for v in select value from jsonb_array_elements(s->'progress') loop
  perform rpg_private.fields(v,array['entityId','trackId','value','rank','unlocks']);
  perform rpg_private.assert(exists(select 1 from public.rpg_entities where campaign_id=cid and id=(v->>'entityId')::uuid) and rpg_private.wave4_integer(v->'value') and rpg_private.wave4_integer(v->'rank',0,100) and jsonb_typeof(v->'unlocks')='array');
 end loop;
 for v in select value from jsonb_array_elements(s->'pending') loop
  perform rpg_private.fields(v,array['id','entityId','trackId','trackVersion','rank','options']);
  perform rpg_private.assert((v->>'id')::uuid is not null and exists(select 1 from public.rpg_entities where campaign_id=cid and id=(v->>'entityId')::uuid) and rpg_private.wave4_integer(v->'trackVersion',1) and rpg_private.wave4_integer(v->'rank',1,100) and jsonb_typeof(v->'options')='array');
 end loop;
end $$;

create function rpg_private.wave4_events(cid uuid) returns jsonb language sql stable set search_path='' as $$
 select coalesce(jsonb_agg(event),'[]') from (
  select e.event||jsonb_build_object('sequence',e.sequence) as event from rpg_private.world_events e where e.campaign_id=cid
  union
  select (v.payload->'event')||jsonb_build_object('sequence',v.payload->'sequence') from rpg_private.timeline_versions v where v.campaign_id=cid and v.table_name='rpg_private.world_events' and v.payload#>>'{event,kind}'='reward.granted' and v.payload#>>'{event,originTimelineId}'=(rpg_private.timeline_fence(cid)->>'timelineId')
 ) events
$$;

create function rpg_private.wave4_read(uid uuid,cid uuid) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('foundation',rpg_private.foundation_read(uid,cid),'state',(select loop_state from rpg_private.world_foundations where campaign_id=cid),'snapshot',jsonb_set(rpg_private.timeline_campaign_json(cid,uid),'{items}',coalesce((select jsonb_agg(to_jsonb(i)) from public.rpg_items i where campaign_id=cid),'[]')),'events',rpg_private.wave4_events(cid))
$$;

-- Shared domain settlement: server validators supply a bounded plan; SQL owns
-- locking, exact fences, ordinary row validators, atomic history and save capture.
alter function public.rpg_world(uuid,uuid,text,jsonb,jsonb) rename to rpg_world_wave3;
create function public.rpg_world(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_column
declare cid uuid:=p_campaign_id; command jsonb; snap jsonb; op uuid; saved rpg_private.world_commands%rowtype; request jsonb; plan jsonb; s jsonb; oldstate jsonb; v jsonb; event jsonb; event_id uuid; idx integer:=0; result jsonb; rev integer; mid uuid; kind text; definition jsonb; receipt jsonb;
begin
 if p_action not in ('loop_read','loop_receipt','loop_commit') then return public.rpg_world_wave3(p_owner_id,cid,p_action,p_payload,p_timeline); end if;
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=cid for update; if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_assert(cid,p_timeline,p_action='loop_commit');
 if p_action='loop_read' then perform rpg_private.fields(p_payload,'{}'); return rpg_private.wave4_read(p_owner_id,cid); end if;
 command:=p_payload->'command'; op:=(command->>'operationId')::uuid; kind:=p_payload->>'kind';
 perform rpg_private.fields(command,array['operationId','campaignId','timeline','expectedRevision','expectedRuntimeRevision','expectedHeadId']);
 perform rpg_private.assert(command->>'campaignId'=cid::text and command->'timeline'=p_timeline and op is not null);
 request:=jsonb_build_object('action','loop_commit','payload',p_payload-'plan');
 select * into saved from rpg_private.world_commands where id=op;
 if found then if saved.campaign_id<>cid or saved.request<>request then raise exception 'rpg_conflict'; end if; return saved.result; end if;
 if exists(select 1 from rpg_private.timeline_command_ids where id=op) then raise exception 'rpg_conflict'; end if;
 if p_action='loop_receipt' then perform rpg_private.fields(p_payload,array['command','kind','input']); return null; end if;
 perform rpg_private.fields(p_payload,array['command','kind','input','plan']);
 snap:=rpg_private.foundation_fence(p_owner_id,cid,command);
 if exists(select 1 from rpg_private.turns where campaign_id=cid and (status in ('pending','generating','awaiting_confirmation') or (status='failed' and retryable))) then raise exception 'rpg_conflict'; end if;
 perform rpg_private.assert(kind in ('commerce.configure','progression.configure','progression.correct','reward','advancement','trade','prepare'));
 plan:=p_payload->'plan'; perform rpg_private.fields(plan,array['state','world','changes','events']);
 s:=plan->'state'; select loop_state into oldstate from rpg_private.world_foundations where campaign_id=cid;
 perform rpg_private.assert((s->>'version')::integer=coalesce((oldstate->>'version')::integer,0)+1 and jsonb_array_length(plan->'changes')<=128 and jsonb_array_length(plan->'events') between 1 and 32);
 if kind in ('commerce.configure','progression.configure') then perform rpg_private.assert(plan->'changes'='[]' and (snap->'world'='null' or ((plan->'world')-'actors')=((snap->'world')-'actors'))); end if;
 if kind='commerce.configure' then perform rpg_private.assert((s-array['version','currencies','itemPolicies','merchants'])=(oldstate-array['version','currencies','itemPolicies','merchants']) or oldstate is null); end if;
 if kind='progression.configure' then perform rpg_private.assert((s-array['version','progression','tracks','rewards'])=(oldstate-array['version','progression','tracks','rewards']) or oldstate is null); end if;
 -- Rewards can only claim one already committed source, never a generated amount.
 if kind='reward' then
  select value into definition from jsonb_array_elements(oldstate->'rewards') x where x->>'id'=p_payload#>>'{input,rewardId}' and x->'version'=p_payload#>'{input,expectedRewardVersion}';
  perform rpg_private.assert(definition is not null);
  if definition#>>'{source,kind}'='quest' then perform rpg_private.assert(exists(select 1 from public.rpg_quests where campaign_id=cid and id=(definition#>>'{source,id}')::uuid and status='complete'));
  elsif definition#>>'{source,kind}'='thread' then perform rpg_private.assert(exists(select 1 from jsonb_array_elements(snap#>'{world,threads}') t where t->>'id'=definition#>>'{source,id}' and t->>'status'='resolved'));
  else perform rpg_private.assert(exists(select 1 from rpg_private.world_events where campaign_id=cid and id=(definition#>>'{source,id}')::uuid and event->>'kind' not like 'reward.%' and event->>'kind' not like 'progression.%')); end if;
  for receipt in select value from jsonb_array_elements(rpg_private.wave4_events(cid)) where value->>'kind'='reward.granted' loop
   perform rpg_private.assert(receipt#>'{payload,source}' is distinct from definition->'source');
  end loop;
 end if;
 -- Parent is an ordinary committed operation in the existing turn history.
 insert into rpg_private.turns(id,campaign_id,owner_id,session_id,input,status,expected_revision,committed_revision,settings_revision,settings,guide_revision,narration,visual_description)
 select op,cid,p_owner_id,null,jsonb_build_object('operationId',op,'campaignId',cid,'timeline',p_timeline,'mode',case when kind in ('trade','reward','advancement') then 'mechanic' else 'ooc' end,'input',case when kind in ('trade','reward','advancement') then 'Reviewed action' else 'Owner configuration' end,'companionId',null,'listenerIds','[]'::jsonb,'foundationKind',kind),'committed',(snap->>'runtimeRevision')::integer,(snap->>'runtimeRevision')::integer+1,st.revision,st.values,0,coalesce((select string_agg(x->>'text',E'\n\n') from jsonb_array_elements(plan->'events') x where x->>'visibility'='public'),'Owner configuration saved.'),'' from public.rpg_settings st where st.campaign_id=cid;
 -- New entities precede their normal storages; item moves use existing validators.
 for v in select value from jsonb_array_elements(plan->'changes') order by case value->>'family' when 'entities' then 0 when 'locations' then 1 when 'storages' then 2 when 'items' then 3 else 4 end loop
  perform rpg_private.assert(v->>'family' in ('entities','items','storages','locations','quests','public_state'));
  if kind<>'prepare' then perform rpg_private.assert(v->>'family' in ('entities','items')); end if;
  if kind not in ('prepare','progression.correct','advancement') and v->>'family'='entities' then perform rpg_private.fields(v->'values',array['resources']); end if;
  perform rpg_private.runtime_change(cid,op,v);
 end loop;
 perform rpg_private.wave4_state(cid,s,snap->'ruleset');
 perform rpg_private.world_validate_state(p_owner_id,cid,plan->'world',snap->'bindings');
 insert into rpg_private.world_foundations(campaign_id,world,loop_state) values(cid,plan->'world',s) on conflict(campaign_id) do update set world=excluded.world,loop_state=excluded.loop_state,revision=rpg_private.world_foundations.revision+1;
 for v in select value from jsonb_array_elements(plan->'events') loop
  perform rpg_private.fields(v,array['kind','visibility','text','actorIds','threadIds','payload']);
  perform rpg_private.assert(v->>'visibility' in ('public','private') and length(v->>'text') between 1 and 4000 and jsonb_typeof(v->'payload')='object');
  event_id:=rpg_private.world_event_id(op,'wave4',idx::text,v->>'visibility'); idx:=idx+1;
  event:=jsonb_build_object('schemaVersion',1,'id',event_id,'campaignId',cid,'originTimelineId',p_timeline->>'timelineId','operationId',op,'worldMinutes',snap->'worldMinutes','kind',v->>'kind','actorIds',v->'actorIds','threadIds',v->'threadIds','visibility',v->>'visibility','text',v->>'text','evidence','[]'::jsonb,'payload',v->'payload');
  insert into rpg_private.world_events(id,campaign_id,operation_id,event) values(event_id,cid,op,event);
  perform rpg_private.memory_index(cid,case when v->>'visibility'='public' then 'event' else 'private_event' end,event_id,'1',v->>'text',v->>'visibility',null,'{}','{}','history','record');
  update rpg_private.memory_public_sources set valid_from=(snap->>'worldMinutes')::integer where campaign_id=cid and source_id=event_id and kind='event';
  update rpg_private.memory_private_sources set valid_from=(snap->>'worldMinutes')::integer where campaign_id=cid and source_id=event_id and kind='private_event';
 end loop;
 update rpg_private.runtime_state set revision=revision+1 where campaign_id=cid returning revision into rev;
 update rpg_private.turns set committed_revision=rev where id=op;
 perform rpg_private.memory_invalidate(cid);
 result:=jsonb_build_object('committed',true,'operationId',op);
 insert into rpg_private.timeline_command_ids values('world',op,cid);
 insert into rpg_private.world_commands values(op,cid,request,result);
 if (select policy->>'autosave'='turn' from rpg_private.timeline_campaigns where campaign_id=cid) then perform rpg_private.timeline_save(cid,'autosave','After action','turn:'||op::text);
 else mid:=rpg_private.timeline_capture(cid); update rpg_private.timelines set head_manifest_id=mid,head_public=rpg_private.timeline_public_metadata(cid) where campaign_id=cid and id=(p_timeline->>'timelineId')::uuid; end if;
 return result;
end $$;
revoke all on function public.rpg_world_wave3(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated,service_role;
revoke all on function public.rpg_world(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_world(uuid,uuid,text,jsonb,jsonb) to service_role;
revoke all on all functions in schema rpg_private from public,anon,authenticated;
commit;
