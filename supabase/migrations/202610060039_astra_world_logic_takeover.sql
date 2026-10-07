-- Save-aware, owner-explicit World Logic to Astra-primary ordinary-play handoff.
-- World Foundation and its event ledger remain historical; standard runtime
-- rows own post-handoff gameplay. No old turn or immutable manifest is rewritten.
begin;

alter table rpg_private.world_foundations add column astra_takeover jsonb
  check (astra_takeover is null or (
    jsonb_typeof(astra_takeover)='object' and
    astra_takeover->'schemaVersion'='1'::jsonb and
    astra_takeover->>'runtime'='astra-primary-v1' and
    astra_takeover->>'sourceRuleset'='world-logic-v1' and
    astra_takeover->>'campaignId'=campaign_id::text and
    jsonb_typeof(astra_takeover->'createdAt')='string'
  ));

-- A taken-over playable World Foundation is reference history. Older entry
-- points must not mutate it behind Astra's standard public/runtime authority.
-- Timeline restoration is the only exception: it replaces the full saved row.
create function rpg_private.astra_takeover_freeze_world() returns trigger
language plpgsql set search_path='' as $$
begin
 if tg_op='DELETE' then
   if old.astra_takeover is not null and
     not rpg_private.timeline_restoring(old.campaign_id) then
     raise exception 'rpg_conflict'; end if;
   return old;
 end if;
 if old.astra_takeover is not null and
   not rpg_private.timeline_restoring(old.campaign_id) and
   (to_jsonb(new)-'revision'-'updated_at') is distinct from
   (to_jsonb(old)-'revision'-'updated_at') then
   raise exception 'rpg_conflict';
 end if;
 return new;
end $$;
create trigger astra_takeover_freeze_world before update or delete
  on rpg_private.world_foundations for each row
  execute function rpg_private.astra_takeover_freeze_world();

create function rpg_private.astra_takeover_freeze_events() returns trigger
language plpgsql set search_path='' as $$
begin
 if rpg_private.astra_takeover_active(new.campaign_id) and
   not rpg_private.timeline_restoring(new.campaign_id) then
   raise exception 'rpg_conflict';
 end if;
 return new;
end $$;
create trigger astra_takeover_freeze_events before insert
  on rpg_private.world_events for each row
  execute function rpg_private.astra_takeover_freeze_events();

create function rpg_private.astra_takeover_active(cid uuid) returns boolean
language sql stable set search_path='' as $$
 select exists(select 1 from rpg_private.world_foundations f
   where f.campaign_id=cid and f.astra_takeover->>'runtime'='astra-primary-v1'
     and f.ruleset->>'id'='world-logic-v1')
$$;

-- Projection only. Saved Foundation rows and historical World Events stay byte
-- identical; the controlled Actor's playable position comes from the matching
-- saved public-state row, or from the active public state for a live read.
create function rpg_private.astra_takeover_project_world(raw_world jsonb, controlled uuid, current_place uuid)
returns jsonb language sql immutable set search_path='' as $$
 select case when raw_world is null or controlled is null or current_place is null
   then raw_world else jsonb_set(raw_world,'{actors}',
     coalesce((select jsonb_agg(case when a.value->>'entityId'=controlled::text
       and a.value->>'control'='player' and
       a.value->>'locationId' is distinct from current_place::text
       then jsonb_set(jsonb_set(a.value,'{locationId}',to_jsonb(current_place)),
         '{revision}',to_jsonb((a.value->>'revision')::integer+1))
       else a.value end order by a.n)
       from jsonb_array_elements(raw_world->'actors') with ordinality a(value,n)),
       '[]'::jsonb)) end
$$;

-- A private, bounded, pinned packet. It is never returned from public.rpg_world
-- or from runtime_public_turn. World text here is for Astra's private planning.
create function rpg_private.astra_takeover_context(cid uuid, source jsonb)
returns jsonb language plpgsql stable set search_path='' as $$
declare f rpg_private.world_foundations%rowtype; place uuid; controller uuid;
 actor jsonb; present jsonb:='[]'; actors jsonb:='[]'; routes jsonb:='[]';
 events jsonb:='[]'; destination record; token text; n integer:=0;
begin
 select * into strict f from rpg_private.world_foundations where campaign_id=cid;
 perform rpg_private.assert(f.astra_takeover is not null and
   source#>>'{snapshot,campaign,id}'=cid::text and
   source#>>'{runtime,campaignId}'=cid::text and
   source#>>'{snapshot,settings,values,rulesSystem,id}'='world-logic-v1');
 place:=(source#>>'{snapshot,publicState,current_location_id}')::uuid;
 controller:=(source#>>'{runtime,configuration,controlledEntityIds,0}')::uuid;
 perform rpg_private.assert(place is not null and controller is not null);
 for actor in select value from jsonb_array_elements(f.world->'actors') loop
   if actor->>'entityId'=controller::text or
     (actor->>'locationId'=place::text and
       source#>'{runtime,configuration,presentEntityIds}' ?
         (actor->>'entityId')) then
     n:=n+1; perform rpg_private.assert(n<=24);
     actors:=actors||jsonb_build_array(jsonb_build_object(
       'id',actor->'id','entityId',actor->'entityId',
       'publicName',actor->'publicName','kind',actor->'kind',
       'control',actor->'control',
       'locationId',case when actor->>'entityId'=controller::text
         then to_jsonb(place) else actor->'locationId' end,
       'capabilities',actor->'capabilities',
       'limitations',actor->'limitations',
       'knowledge',coalesce((select jsonb_agg(value order by knowledge_ordinal) from
         (select value,knowledge_ordinal from jsonb_array_elements(
           coalesce(actor->'knowledge','[]'::jsonb))
           with ordinality k(value,knowledge_ordinal)
           order by knowledge_ordinal limit 8) bounded),
         '[]'::jsonb)));
     if source#>'{runtime,configuration,presentEntityIds}' ? (actor->>'entityId')
       and (actor->>'entityId'=controller::text or
         actor->>'locationId'=place::text) then
       present:=present||jsonb_build_array(actor->>'entityId');
     end if;
   end if;
 end loop;
 perform rpg_private.assert(present ? controller::text);
 for destination in select id from public.rpg_locations
   where campaign_id=cid and status in ('known','visited') and id<>place
   order by id limit 64 loop
   token:='world.travel:'||place::text||':'||destination.id::text;
   if exists(select 1 from jsonb_array_elements(f.world->'actors') a
      where a->>'entityId'=controller::text and a->'capabilities' ? token)
     or rpg_private.living_world_local_route(
       (source->>'ownerId')::uuid,cid,controller,place,destination.id) then
     routes:=routes||jsonb_build_array(destination.id);
   end if;
 end loop;
 select coalesce(jsonb_agg(v order by seq),'[]'::jsonb) into events from (
   select jsonb_build_object('id',e.id,'kind',e.event->'kind',
     'visibility',e.event->'visibility','worldMinutes',e.event->'worldMinutes',
     'actorIds',e.event->'actorIds',
     'text',left(e.event->>'text',1200)) v,e.sequence seq
   from rpg_private.world_events e where e.campaign_id=cid
     and e.event->>'kind' in ('world.logic.resolved','world.thread.advanced','world.observed')
     and exists(select 1 from jsonb_array_elements_text(e.event->'actorIds') id
       where present ? id.value)
   order by e.sequence desc limit 8
 ) selected;
 return jsonb_build_object('schemaVersion',1,
   'sourceWorldRevision',f.revision,'presentEntityIds',present,
   'routeLocationIds',routes,'actors',actors,
   'policy',f.world->'policy',
   'unresolvedThreads',coalesce((select jsonb_agg(value) from
     (select value from jsonb_array_elements(f.world->'threads') value
      where value->>'status'='active' limit 8) q),'[]'::jsonb),
   'recentWorldEvents',events);
end $$;

-- Existing detached readers use lab_rows. Project only a post-handoff saved
-- Foundation against that SAME manifest's saved public state/runtime config.
alter function rpg_private.lab_rows(uuid,uuid,text) rename to lab_rows_before_astra_takeover;
create function rpg_private.lab_rows(cid uuid,mid uuid,tab text) returns jsonb
language plpgsql stable set search_path='' as $$
declare rows jsonb; f jsonb; ps jsonb; rt jsonb; controlled uuid; place uuid;
begin
 rows:=rpg_private.lab_rows_before_astra_takeover(cid,mid,tab);
 if tab<>'rpg_private.world_foundations' or jsonb_array_length(rows)<>1
   then return rows; end if;
 f:=rows->0;
 if f->'astra_takeover' is null or f->'astra_takeover'='null'::jsonb
   then return rows; end if;
 ps:=rpg_private.lab_rows_before_astra_takeover(cid,mid,'public.rpg_public_state')->0;
 rt:=rpg_private.lab_rows_before_astra_takeover(cid,mid,'rpg_private.runtime_state')->0;
 perform rpg_private.assert(ps->>'campaign_id'=cid::text and
   rt->>'campaign_id'=cid::text and f->>'campaign_id'=cid::text);
 controlled:=(rt#>>'{configuration,controlledEntityIds,0}')::uuid;
 place:=(ps->>'current_location_id')::uuid;
 return jsonb_build_array(jsonb_set(f,'{world}',
   rpg_private.astra_takeover_project_world(f->'world',controlled,place)));
end $$;

-- A new detached run receives its own version of the saved Foundation with
-- only the controlled Actor's Location projected. The source save/manifests,
-- source World Events, and every pre-handoff detached run remain immutable.
create function rpg_private.astra_takeover_lab_refs(cid uuid, base rpg_private.timeline_manifests,
  detached_timeline uuid) returns jsonb language plpgsql set search_path='' as $$
declare saved jsonb; ps jsonb; rt jsonb; projected jsonb; projected_hash text;
  current_id uuid; new_id uuid; refs jsonb:=base.refs;
begin
  saved:=rpg_private.lab_rows_before_astra_takeover(cid,base.id,
    'rpg_private.world_foundations')->0;
  if saved->'astra_takeover' is null or
    saved->'astra_takeover'='null'::jsonb then return refs; end if;
  perform rpg_private.assert(base.campaign_id=cid and base.schema_version=2 and
    exists(select 1 from rpg_private.timelines where id=base.timeline_id
      and campaign_id=cid and purpose='playable') and
    exists(select 1 from rpg_private.timelines where id=detached_timeline
      and campaign_id=cid and purpose='simulation'));
  ps:=rpg_private.lab_rows_before_astra_takeover(cid,base.id,
    'public.rpg_public_state')->0;
  rt:=rpg_private.lab_rows_before_astra_takeover(cid,base.id,
    'rpg_private.runtime_state')->0;
  perform rpg_private.assert(saved->>'campaign_id'=cid::text and
    ps->>'campaign_id'=cid::text and rt->>'campaign_id'=cid::text and
    jsonb_array_length(refs->'rpg_private.world_foundations')=1);
  current_id:=(rt#>>'{configuration,controlledEntityIds,0}')::uuid;
  projected:=saved||jsonb_build_object('world',
    rpg_private.astra_takeover_project_world(saved->'world',current_id,
      (ps->>'current_location_id')::uuid),
    'revision',(saved->>'revision')::integer+1);
  projected_hash:=encode(sha256(convert_to(projected::text,'UTF8')),'hex');
  insert into rpg_private.timeline_versions(campaign_id,table_name,row_key,
    digest,payload,origin_timeline_id)
    values(cid,'rpg_private.world_foundations',cid::text,projected_hash,projected,
      detached_timeline)
    on conflict(campaign_id,table_name,row_key,digest) do nothing;
  select id into strict new_id from rpg_private.timeline_versions
    where campaign_id=cid and table_name='rpg_private.world_foundations'
      and row_key=cid::text and timeline_versions.digest=projected_hash
      and payload=projected;
  return jsonb_set(refs,array['rpg_private.world_foundations'],
    jsonb_build_array(new_id));
end $$;

-- Only the prepare-time copied refs change, before the new detached manifest
-- is written. The rest of World Lab's request/receipt/commit guards are intact.
do $$ declare definition text; needle text; replacement text; target regprocedure; begin
  needle:='values(mid,cid,tid,base.refs,base.public_metadata||jsonb_build_object(''labOrdinal'',0),base.canon_generation,3,rid)';
  replacement:='values(mid,cid,tid,rpg_private.astra_takeover_lab_refs(cid,base,tid),base.public_metadata||jsonb_build_object(''labOrdinal'',0),base.canon_generation,3,rid)';
  for target in select value::regprocedure from unnest(array[
    'public.rpg_world_lab(uuid,uuid,text,jsonb)',
    'rpg_private.lab_rpc_before_continuation(uuid,uuid,text,jsonb)']) value loop
    definition:=pg_get_functiondef(target);
    perform rpg_private.assert(length(definition)-length(replace(definition,needle,''))=
      length(needle) and position('astra_takeover_lab_refs' in definition)=0);
    execute replace(definition,needle,replacement);
  end loop;
end $$;

-- A World Logic-origin travel commit may deterministically shed historical
-- nearby autonomous presence. The provider cannot choose configuration fields.
create function rpg_private.astra_takeover_resolution_configuration(cid uuid,
  source jsonb, resolution jsonb) returns boolean
language sql stable set search_path='' as $$
 select case when rpg_private.astra_takeover_active(cid) and
   source->'worldTakeover' is not null and
   (select count(*) from jsonb_array_elements(resolution->'changes') c
     where c->>'family'='public_state')=1
   then resolution->'configuration'=jsonb_set(source#>'{runtime,configuration}',
     '{presentEntityIds}',source#>'{runtime,configuration,controlledEntityIds}')
   else resolution->'configuration'=source#>'{runtime,configuration}' end
$$;

-- Migration 38's exact pinned-final and receipt guards are retained. Only its
-- configuration-equality clause is extended for this deterministic projection.
do $$ declare definition text; pattern text; replacement text; begin
  definition:=pg_get_functiondef(
    'public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)'::regprocedure);
  pattern:='packet#>''\{resolution,configuration\}''=[[:space:]]*t\.source#>''\{runtime,configuration\}'' and';
  replacement:='rpg_private.astra_takeover_resolution_configuration(p_campaign_id,t.source,packet->''resolution'') and';
  perform rpg_private.assert((select count(*) from regexp_matches(definition,pattern,'g'))=1
    and position('astra_takeover_resolution_configuration' in definition)=0);
  execute regexp_replace(definition,pattern,replacement);
end $$;

-- Preserve the post-38 runtime and every post-37 legacy guard by delegation.
alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  rename to rpg_runtime_before_astra_takeover;
create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,
  p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare f rpg_private.world_foundations%rowtype; t rpg_private.turns%rowtype;
 tc rpg_private.timeline_campaigns%rowtype; tl rpg_private.timelines%rowtype;
 rt rpg_private.runtime_state%rowtype; ps public.rpg_public_state%rowtype;
 result jsonb; marker jsonb; req uuid; controller uuid; actor jsonb;
 expected_present jsonb:='[]'; source jsonb; call jsonb; changed jsonb;
 from_id uuid; to_id uuid; route text; pre_save uuid; post_save uuid;
  current_hash text; settings_id text; event_head bigint;
begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry
   where user_id=p_owner_id) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
 if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_assert(p_campaign_id,p_timeline,
   p_action not in ('play','get','astra_runtime','astra_takeover_status'));
 select * into f from rpg_private.world_foundations where campaign_id=p_campaign_id for update;
 marker:=f.astra_takeover;
 if p_action='astra_takeover_status' then
   perform rpg_private.fields(p_payload,'{}');
   return jsonb_build_object('active',rpg_private.astra_takeover_active(p_campaign_id));
 end if;
 if p_action='astra_takeover' then
   perform rpg_private.fields(p_payload,array['requestId','campaignId','timeline',
     'expectedRuntimeRevision','expectedWorldRevision','expectedPublicRevision',
    'expectedHeadId','expectedWorldDigest','expectedWorldEventSequence']);
   perform rpg_private.assert(p_payload->>'campaignId'=p_campaign_id::text and
     p_payload->'timeline'=p_timeline);
   req:=(p_payload->>'requestId')::uuid;
   perform rpg_private.assert(req is not null);
   if marker is not null then
     if marker->>'requestId'=req::text and
       marker->'request'=p_payload then
       return jsonb_build_object('status','already_active','takeoverId',req,
         'beforeSaveId',marker->'beforeSaveId',
         'afterSaveId',(select id from rpg_private.save_points
           where campaign_id=p_campaign_id and
             trigger_key='astra-takeover-after:'||req::text limit 1));
     end if;
     raise exception 'rpg_conflict';
   end if;
   select * into strict tc from rpg_private.timeline_campaigns
     where campaign_id=p_campaign_id for update;
   select * into strict tl from rpg_private.timelines where campaign_id=p_campaign_id
     and id=tc.active_timeline_id for update;
   select * into strict rt from rpg_private.runtime_state
     where campaign_id=p_campaign_id for update;
   select * into strict ps from public.rpg_public_state
     where campaign_id=p_campaign_id for update;
   current_hash:=encode(sha256(convert_to(f.world::text,'UTF8')),'hex');
   select coalesce(max(sequence),0) into event_head from rpg_private.world_events
     where campaign_id=p_campaign_id;
   perform rpg_private.assert(tl.purpose='playable' and
     tc.active_timeline_id::text=p_timeline->>'timelineId' and
     tc.epoch::text=p_timeline->>'epoch' and
     (p_payload->>'expectedRuntimeRevision')::integer=rt.revision and
     (p_payload->>'expectedWorldRevision')::integer=f.revision and
     (p_payload->>'expectedPublicRevision')::integer=ps.revision and
     p_payload->>'expectedHeadId'=tl.head_manifest_id::text and
     p_payload->>'expectedWorldDigest'=current_hash and
     (p_payload->>'expectedWorldEventSequence')::bigint=event_head and
     f.ruleset->>'id'='world-logic-v1' and f.world is not null and
     rt.configuration->>'profile'='console-basic-v1');
   select values#>>'{rulesSystem,id}' into settings_id
     from public.rpg_settings where campaign_id=p_campaign_id;
   perform rpg_private.assert(settings_id='world-logic-v1' and
     rt.world_minutes>=0 and
     not exists(select 1 from rpg_private.world_events e
       where e.campaign_id=p_campaign_id and
         (e.event->>'worldMinutes')::integer>rt.world_minutes) and
     ps.current_location_id is not null and
     exists(select 1 from public.rpg_locations where campaign_id=p_campaign_id
       and id=ps.current_location_id and status in ('known','visited')) and
     exists(select 1 from public.rpg_sessions where campaign_id=p_campaign_id
       and id=ps.current_session_id and status='open') and
     exists(select 1 from public.rpg_scenes where campaign_id=p_campaign_id
       and id=ps.current_scene_id and session_id=ps.current_session_id));
   perform rpg_private.assert(not exists(select 1 from public.rpg_encounters
       where campaign_id=p_campaign_id and status='active') and
     not exists(select 1 from public.rpg_pending_actions
       where campaign_id=p_campaign_id and status not in ('resolved','cancelled')) and
     not exists(select 1 from public.rpg_rest_records
       where campaign_id=p_campaign_id and status='planned') and
     not exists(select 1 from rpg_private.turns
       where campaign_id=p_campaign_id and
        (status in ('pending','generating','awaiting_confirmation') or
         (status='failed' and retryable) or lease_until>now())) and
     not exists(select 1 from rpg_private.world_stages s
       where s.campaign_id=p_campaign_id and not exists(
         select 1 from rpg_private.turns t where t.campaign_id=s.campaign_id
           and t.id=s.id and t.status='committed')));
   perform rpg_private.assert(f.world#>>'{policy,simulation}'='false' and
     f.world->'threads'='[]'::jsonb and f.world->'hooks'='[]'::jsonb and
     f.world->'warnings'='[]'::jsonb and
     coalesce(f.loop_state->'pending','[]'::jsonb)='[]'::jsonb and
     coalesce(f.loop_state->'itemPolicies','[]'::jsonb)='[]'::jsonb);
   perform rpg_private.assert(jsonb_array_length(
     rt.configuration->'controlledEntityIds')=1);
   controller:=(rt.configuration#>>'{controlledEntityIds,0}')::uuid;
   perform rpg_private.assert(exists(select 1 from public.rpg_entities
      where campaign_id=p_campaign_id and id=controller and kind='player') and
     (select count(*) from jsonb_array_elements(f.world->'actors') a
       where a->>'entityId'=controller::text and a->>'control'='player'
         and a->>'locationId'=ps.current_location_id::text)=1 and
     not exists(select 1 from jsonb_array_elements(f.world->'actors') a
       where a->>'entityId' is not null and not exists(
         select 1 from public.rpg_entities e where e.campaign_id=p_campaign_id
           and e.id::text=a->>'entityId')) and
     not exists(select 1 from jsonb_array_elements(f.world->'actors') a
       where a->>'locationId' is not null and not exists(
         select 1 from public.rpg_locations l where l.campaign_id=p_campaign_id
           and l.id::text=a->>'locationId')));
   select coalesce(jsonb_agg(a->>'entityId'),'[]'::jsonb) into expected_present
     from jsonb_array_elements(f.world->'actors') a
     where a->>'locationId'=ps.current_location_id::text and
       a->>'entityId' is not null;
    perform rpg_private.assert(expected_present @> (rt.configuration->'presentEntityIds')
      and (rt.configuration->'presentEntityIds') @> expected_present and
     not exists(select 1 from public.rpg_entities e
       where e.campaign_id=p_campaign_id and
         (e.hp<0 or e.hp>e.max_hp)) and
     not exists(select 1 from public.rpg_items i
       where i.campaign_id=p_campaign_id and i.quantity<0));
   -- Both saves, provenance, marker and head movement are one transaction.
   pre_save:=rpg_private.timeline_save(p_campaign_id,'safety',
     'Before Astra-primary takeover','astra-takeover-before:'||req::text);
   marker:=jsonb_build_object('schemaVersion',1,'requestId',req,
     'request',p_payload,'campaignId',p_campaign_id,
     'runtime','astra-primary-v1','sourceRuleset','world-logic-v1',
     'originTimelineId',tc.active_timeline_id,'originEpoch',tc.epoch,
     'runtimeRevision',rt.revision,'worldRevision',f.revision,
     'runtimeWorldMinutes',rt.world_minutes,'worldEventSequence',event_head,
     'publicRevision',ps.revision,'headManifestId',tl.head_manifest_id,
     'worldDigest',current_hash,'beforeSaveId',pre_save,'createdAt',now());
   update rpg_private.world_foundations set astra_takeover=marker,
     revision=revision+1 where campaign_id=p_campaign_id;
   post_save:=rpg_private.timeline_save(p_campaign_id,'safety',
     'After Astra-primary takeover','astra-takeover-after:'||req::text);
   return jsonb_build_object('status','activated','takeoverId',req,
     'beforeSaveId',pre_save,'afterSaveId',post_save);
 end if;
 if p_action='begin' and marker is not null and
   p_payload->>'mode'='game' then
   select * into t from rpg_private.turns where campaign_id=p_campaign_id
     and id=(p_payload->>'operationId')::uuid for update;
   if t.id is null then
     perform rpg_private.assert(p_payload->>'serverRuntime'='astra-primary-v1'
       and f.ruleset->>'id'='world-logic-v1' and
       (select values#>>'{rulesSystem,id}' from public.rpg_settings
          where campaign_id=p_campaign_id)='world-logic-v1');
     result:=public.rpg_runtime_before_astra_primary(p_owner_id,p_campaign_id,
       'begin',p_payload-'serverRuntime',p_timeline);
     select * into strict t from rpg_private.turns where campaign_id=p_campaign_id
       and id=(p_payload->>'operationId')::uuid for update;
     perform rpg_private.assert(t.input->>'mode'='game' and
       t.settings#>>'{rulesSystem,id}'='world-logic-v1');
     update rpg_private.turns set runtime_identity='astra-primary-v1',
       checkpoint=checkpoint||jsonb_build_object('astraPrimary',
         jsonb_build_object('schemaVersion',1,'createdTimeline',p_timeline,
           'toolReceipts','[]'::jsonb,'finalProposal',null),
         'plan',jsonb_build_object('narration','','checks','[]'::jsonb,
           'publicPatches','[]'::jsonb,'privatePatches','[]'::jsonb,
           'visualDescription','','clarification',null,'guidanceProposal',null))
       where id=t.id and campaign_id=p_campaign_id;
     return result;
   end if;
 end if;
 if p_action='claim' then
   result:=public.rpg_runtime_before_astra_takeover(p_owner_id,p_campaign_id,
     p_action,p_payload,p_timeline);
   if result is null or marker is null then return result; end if;
   select * into t from rpg_private.turns where campaign_id=p_campaign_id
     and id=(p_payload->>'operationId')::uuid for update;
   if t.runtime_identity='astra-primary-v1' then
     source:=t.source;
     if source->'worldTakeover' is null then
       source:=source||jsonb_build_object('worldTakeover',
         rpg_private.astra_takeover_context(p_campaign_id,source));
       update rpg_private.turns set source=source where id=t.id
         and campaign_id=p_campaign_id;
     end if;
     return jsonb_set(result,'{source}',source);
   end if;
   return result;
 end if;
 if p_action in ('astra_tool','commit') and marker is not null then
   select * into t from rpg_private.turns where campaign_id=p_campaign_id
     and id=(p_payload->>'operationId')::uuid;
   if t.runtime_identity='astra-primary-v1' then
     perform rpg_private.assert(t.source->'worldTakeover' is not null);
     if p_action='astra_tool' then
       call:=p_payload->'call';
       if call->>'kind'<>'query' then
         perform rpg_private.assert(t.source#>'{worldTakeover,presentEntityIds}'
           ? (call->>'actorId') and
           (call->'targetId'='null' or
             t.source#>'{worldTakeover,presentEntityIds}' ? (call->>'targetId')));
       end if;
     else
       for changed in select value from jsonb_array_elements(
         p_payload#>'{packet,resolution,changes}') loop
         if changed->>'family' in ('entities','encounter_participants') then
           perform rpg_private.assert(
             t.source#>'{worldTakeover,presentEntityIds}' ?
             case when changed->>'family'='entities' then changed->>'id'
               else (select entity_id::text from public.rpg_encounter_participants
                 where campaign_id=p_campaign_id and id=(changed->>'id')::uuid)
             end);
         end if;
         if changed->>'family'='public_state' then
           from_id:=(t.source#>>'{snapshot,publicState,current_location_id}')::uuid;
           to_id:=(changed#>>'{values,current_location_id}')::uuid;
           controller:=(t.source#>>'{runtime,configuration,controlledEntityIds,0}')::uuid;
           route:='world.travel:'||from_id::text||':'||to_id::text;
           perform rpg_private.assert(from_id<>to_id and
             not exists(select 1 from public.rpg_encounters
               where campaign_id=p_campaign_id and status='active') and
             not exists(select 1 from public.rpg_rest_records
               where campaign_id=p_campaign_id and status='planned') and
             (exists(select 1 from jsonb_array_elements(f.world->'actors') a
                where a->>'entityId'=controller::text and
                  a->'capabilities' ? route) or
              rpg_private.living_world_local_route(p_owner_id,p_campaign_id,
                controller,from_id,to_id)));
         end if;
       end loop;
     end if;
   end if;
 end if;
 return public.rpg_runtime_before_astra_takeover(p_owner_id,p_campaign_id,
   p_action,p_payload,p_timeline);
end $$;

revoke all on function public.rpg_runtime_before_astra_takeover(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated,service_role;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  to service_role;

-- The current World read is a view of the same playable Location after
-- takeover. Mutating the historical Foundation through the legacy World RPC is
-- blocked on this projection; detached World Lab uses its separate authority.
alter function public.rpg_world(uuid,uuid,text,jsonb,jsonb)
  rename to rpg_world_before_astra_takeover;
create function public.rpg_world(p_owner_id uuid,p_campaign_id uuid,p_action text,
  p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb; controlled uuid; place uuid;
begin
 if rpg_private.astra_takeover_active(p_campaign_id) then
   if p_action not in ('read','local_routes') then raise exception 'rpg_conflict'; end if;
   result:=public.rpg_world_before_astra_takeover(p_owner_id,p_campaign_id,
     p_action,p_payload,p_timeline);
   if p_action='read' then
     controlled:=(select (configuration#>>'{controlledEntityIds,0}')::uuid
       from rpg_private.runtime_state where campaign_id=p_campaign_id);
     place:=(select current_location_id from public.rpg_public_state
       where campaign_id=p_campaign_id);
     result:=jsonb_set(result,'{world}',
       rpg_private.astra_takeover_project_world(result->'world',
         controlled,place));
   end if;
   return result;
 end if;
 return public.rpg_world_before_astra_takeover(p_owner_id,p_campaign_id,
   p_action,p_payload,p_timeline);
end $$;
revoke all on function public.rpg_world_before_astra_takeover(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated,service_role;
revoke all on function public.rpg_world(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated;
grant execute on function public.rpg_world(uuid,uuid,text,jsonb,jsonb)
  to service_role;

revoke all on function rpg_private.astra_takeover_active(uuid),
  rpg_private.astra_takeover_freeze_world(),
  rpg_private.astra_takeover_freeze_events(),
  rpg_private.astra_takeover_context(uuid,jsonb),
  rpg_private.astra_takeover_project_world(jsonb,uuid,uuid),
  rpg_private.astra_takeover_lab_refs(uuid,rpg_private.timeline_manifests,uuid),
  rpg_private.astra_takeover_resolution_configuration(uuid,jsonb,jsonb),
  rpg_private.lab_rows_before_astra_takeover(uuid,uuid,text),
  rpg_private.lab_rows(uuid,uuid,text)
  from public,anon,authenticated,service_role;
commit;
