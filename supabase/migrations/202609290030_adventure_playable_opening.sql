-- P0A: starting a fresh supported hero prepares public play before activation.
-- Existing scenes/canon are never repaired by guessing during ordinary turns.
begin;

create function rpg_private.adventure_prepare_opening(uid uuid,cid uuid,op uuid) returns jsonb
language plpgsql set search_path='' as $$
declare st public.rpg_public_state%rowtype; hero uuid; place uuid:=rpg_private.wave4_id(op,'adventure-opening:location'); npc uuid:=rpg_private.wave4_id(op,'adventure-opening:npc'); scene uuid:=rpg_private.wave4_id(op,'adventure-opening:scene');
 lang text; title text; description text; person text; details text; opening text; w jsonb; binding jsonb; source rpg_private.adventure_world_versions%rowtype; config jsonb;
begin
 select * into strict st from public.rpg_public_state where campaign_id=cid;
 -- An established continuity resumes exactly where it is; no new job/Actors.
 if st.current_location_id is not null then
  perform rpg_private.assert(exists(select 1 from public.rpg_locations where campaign_id=cid and id=st.current_location_id));
  return null;
 end if;
 -- The supported New Hero template is explicit provenance, not a client flag.
 perform rpg_private.assert(exists(select 1 from rpg_private.library_commands where owner_id=uid and request->>'action'='new_campaign' and request#>>'{payload,template}'='console-basic-fighter-level1-v1' and result->>'campaignId'=cid::text));
 binding:=rpg_private.adventure_binding(cid);
 source:=rpg_private.adventure_world_current(uid,(binding->>'worldId')::uuid,(binding->>'worldVersion')::integer);
 -- No automatic instantiation of source canon or altered/part-played worlds.
 perform rpg_private.assert(source.pack_version_ids='[]' and st.summary='' and st.current_session_id is not null and st.current_scene_id is not null and not exists(select 1 from public.rpg_locations where campaign_id=cid) and not exists(select 1 from public.rpg_quests where campaign_id=cid) and (select count(*)=1 from public.rpg_entities where campaign_id=cid) and (select count(*)=1 from public.rpg_scenes where campaign_id=cid) and exists(select 1 from public.rpg_scenes where campaign_id=cid and id=st.current_scene_id and session_id=st.current_session_id and role='note') and exists(select 1 from public.rpg_sessions where campaign_id=cid and id=st.current_session_id and status='open'));
 select id into hero from public.rpg_entities where campaign_id=cid and kind='player';
 select language into lang from public.rpg_campaigns where id=cid;
 select world into strict w from rpg_private.world_foundations where campaign_id=cid;
 select configuration into strict config from rpg_private.runtime_state where campaign_id=cid;
 perform rpg_private.assert(hero is not null and config->>'profile'='console-basic-v1' and config->'controlledEntityIds'=jsonb_build_array(hero) and jsonb_array_length(w->'actors')=1 and w->'threads'='[]' and w->'hooks'='[]' and w->'warnings'='[]' and (select world_minutes=0 from rpg_private.runtime_state where campaign_id=cid));
 title:=case when lang='ru' then 'Общинный дом поселения' else 'Settlement meeting house' end;
 description:=case when lang='ru' then 'Открытая для посетителей комната в небольшом поселении. Стол для объявлений и обычная работа для желающих; никаких известных опасностей или особого поручения.' else 'A public room in a small settlement, with a table for notices and ordinary work for willing hands. No danger or special mission is established.' end;
 person:=case when lang='ru' then 'Местный устроитель работ' else 'Local work organiser' end;
 details:=case when lang='ru' then 'Находится у стола объявлений. Ищет желающих помочь перенести и проверить доставку обычных припасов. Готов обсудить работу и условия; оплата ещё не согласована. Не знаком с героем.' else 'At the notices table, looking for help carrying and checking a delivery of ordinary supplies. Will discuss the work and its terms; payment has not been agreed. Does not know the hero.' end;
 opening:=case when lang='ru' then 'Вы стоите в общинном доме небольшого поселения. У стола объявлений местный устроитель работ ищет желающих помочь перенести и проверить доставку обычных припасов. Работа оплачиваемая, но условия ещё предстоит обсудить. Здесь вы пока незнакомый путешественник: никто не назначил вам задачу. Можно осмотреться, спросить о работе или пойти своим путём.' else 'You stand in the public meeting house of a small settlement. At the notices table, a local work organiser is seeking help carrying and checking a delivery of ordinary supplies. It is paid work, with the terms still to be discussed. You are an unfamiliar adventurer here; nobody has assigned you a task. You can look around, ask about the work, or go your own way.' end;
 -- The same owning validators as reviewed foundation preparation.
 perform rpg_private.runtime_change(cid,op,jsonb_build_object('family','locations','id',place,'expectedRevision',null,'values',jsonb_build_object('name',title,'description',description,'status','visited')));
 perform rpg_private.runtime_change(cid,op,jsonb_build_object('family','entities','id',npc,'expectedRevision',null,'values',jsonb_build_object('kind','npc','name',person,'details',details,'hp',null,'max_hp',null,'stats','{}'::jsonb,'resources','{}'::jsonb,'conditions','[]'::jsonb,'equipment_slots','[]'::jsonb)));
 insert into public.rpg_scenes(id,campaign_id,session_id,title,body,role,settings_revision,revision)
 select scene,cid,st.current_session_id,title,opening,'narration',s.revision,1 from public.rpg_settings s where campaign_id=cid;
 perform rpg_private.runtime_change(cid,op,jsonb_build_object('family','public_state','id',cid,'expectedRevision',st.revision,'values',jsonb_build_object('summary',opening,'current_location_id',place,'current_scene_id',scene)));
 select jsonb_set(w,'{actors}',jsonb_agg(a||jsonb_build_object('locationId',place,'revision',(a->>'revision')::integer+1))) into w from jsonb_array_elements(w->'actors') a;
 w:=jsonb_set(w,'{actors}',(w->'actors')||jsonb_build_array(jsonb_build_object('id',npc,'campaignId',cid,'revision',1,'kind','entity','entityId',npc,'control','autonomous','publicName',person,'locationId',place,'capabilities',jsonb_build_array('ordinary conversation about publicly offered work'),'knowledge','[]'::jsonb)));
 perform rpg_private.world_validate_state(uid,cid,w,'[]');
 update rpg_private.world_foundations set world=w where campaign_id=cid;
 update rpg_private.runtime_state set configuration=jsonb_set(configuration,'{presentEntityIds}',jsonb_build_array(hero,npc)) where campaign_id=cid;
 return jsonb_build_object('sceneId',scene,'sessionId',st.current_session_id,'locationId',place,'actorIds',jsonb_build_array(hero,npc),'text',opening,'template','console-basic-opening-v1');
end $$;
revoke all on function rpg_private.adventure_prepare_opening(uuid,uuid,uuid) from public,anon,authenticated;

create or replace function public.rpg_adventures(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_column
declare uid uuid:=p_owner_id; cid uuid:=p_campaign_id; op uuid; request jsonb:=jsonb_build_object('action',p_action,'campaignId',p_campaign_id,'timeline',p_timeline,'payload',p_payload); result jsonb; saved record; w rpg_private.adventure_world_versions%rowtype; pv text; pack jsonb; f jsonb; binding jsonb; old jsonb; a jsonb; history jsonb; basis jsonb; mid uuid; kind text; data jsonb; required text[]; command jsonb; nextversion integer; opening jsonb; opening_event uuid;
begin
 if uid is null or not exists(select 1 from rpg_private.owner_registry where user_id=uid) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform rpg_private.assert(jsonb_typeof(p_payload)='object' and octet_length(p_payload::text)<=131072);
 if p_action in ('worlds','world_create','new_campaign') then
  perform rpg_private.assert(cid is null and p_timeline is null);
  if p_action='worlds' then
   perform rpg_private.fields(p_payload,'{}');
   return jsonb_build_object('worlds',coalesce((select jsonb_agg(rpg_private.adventure_world_json(x) order by x.title,x.id) from (select distinct on(id) * from rpg_private.adventure_world_versions where owner_id=uid order by id,version desc) x),'[]'),
   'packs',coalesce((select jsonb_agg(jsonb_build_object('versionId',version_id,'title',body->>'title') order by created_at desc) from rpg_private.library_records p where owner_id=uid and kind='pack' and body->>'status'='approved' and not exists(select 1 from rpg_private.library_records newer where newer.owner_id=p.owner_id and newer.kind=p.kind and newer.id=p.id and newer.version>p.version)),'[]'));
  end if;
  op:=(p_payload->>'requestId')::uuid; perform rpg_private.assert(op is not null);
  perform 1 from rpg_private.owner_registry where user_id=uid for update;
  select * into saved from rpg_private.library_commands where id=op;
  if found then if saved.owner_id<>uid or saved.request<>request then raise exception 'rpg_conflict'; end if; return saved.result; end if;
  if p_action='world_create' then
   perform rpg_private.fields(p_payload,array['requestId','title','premise','packVersionIds']);
   perform rpg_private.assert(jsonb_typeof(p_payload->'title')='string' and length(btrim(p_payload->>'title')) between 1 and 200 and jsonb_typeof(p_payload->'premise')='string' and length(btrim(p_payload->>'premise')) between 1 and 20000);
   perform rpg_private.uuid_array(p_payload->'packVersionIds',16);
   for pv in select jsonb_array_elements_text(p_payload->'packVersionIds') loop pack:=rpg_private.library_ref(uid,pv,'pack'); perform rpg_private.assert(pack#>>'{body,status}'='approved'); end loop;
   insert into rpg_private.adventure_world_versions(owner_id,id,version_id,version,title,premise,pack_version_ids) values(uid,gen_random_uuid(),gen_random_uuid(),1,p_payload->>'title',p_payload->>'premise',p_payload->'packVersionIds') returning * into w;
   perform rpg_private.adventure_world_current(uid,w.id,1);
   result:=jsonb_build_object('requestId',op,'world',rpg_private.adventure_world_json(w));
  else
   perform rpg_private.fields(p_payload,array['requestId','worldId','worldVersion','title','language','heroName','template']);
   perform rpg_private.assert(jsonb_typeof(p_payload->'title')='string' and length(btrim(p_payload->>'title')) between 1 and 200 and jsonb_typeof(p_payload->'heroName')='string' and length(btrim(p_payload->>'heroName')) between 1 and 200 and p_payload->>'language' in ('en','ru') and p_payload->>'template'='console-basic-fighter-level1-v1' and rpg_private.wave4_integer(p_payload->'worldVersion',1));
   w:=rpg_private.adventure_world_current(uid,(p_payload->>'worldId')::uuid,(p_payload->>'worldVersion')::integer);
   result:=rpg_private.adventure_new_fighter(uid,p_payload); cid:=(result->>'campaignId')::uuid;
   binding:=jsonb_build_object('worldId',w.id,'worldVersion',w.version,'title',w.title);
   perform rpg_private.adventure_record(uid,cid,gen_random_uuid(),'bind','{}','adventure.world_bound',jsonb_build_object('schemaVersion',1,'binding',binding,'worldVersionId',w.version_id));
   mid:=rpg_private.timeline_capture(cid); update rpg_private.timelines set head_manifest_id=mid,head_public=rpg_private.timeline_public_metadata(cid) where campaign_id=cid and id=(rpg_private.timeline_fence(cid)->>'timelineId')::uuid;
   result:=result||jsonb_build_object('requestId',op);
  end if;
  insert into rpg_private.library_commands values(op,uid,request,result);
  return result;
 end if;
 perform 1 from public.rpg_campaigns where id=cid for update; if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_assert(cid,p_timeline,p_action<>'read');
 if p_action='read' then perform rpg_private.fields(p_payload,array['timeline']); perform rpg_private.assert(p_payload->'timeline'=p_timeline); return rpg_private.adventure_catalog(uid,cid); end if;
 perform rpg_private.assert(p_action in ('bind','prepare','edit','start','end','abandon','review'));
 op:=(p_payload->>'requestId')::uuid; perform rpg_private.assert(op is not null);
 select * into saved from rpg_private.world_commands where id=op;
 if found then if saved.campaign_id<>cid or saved.request<>request then raise exception 'rpg_conflict'; end if; return saved.result; end if;
 if exists(select 1 from rpg_private.timeline_command_ids where id=op) then raise exception 'rpg_conflict'; end if;
 required:=array['requestId','campaignId','timeline','expectedRevision','expectedRuntimeRevision','expectedHeadId'];
 if p_action='bind' then required:=required||array['worldId','worldVersion'];
 elsif p_action='prepare' then required:=required||array['title','premise','pacing','mode'];
 else required:=required||array['adventureId','expectedAdventureVersion'];
  if p_action='edit' then required:=required||array['title','premise','pacing'];
  elsif p_action='end' then required:=required||array['summary','review'];
  elsif p_action='abandon' then required:=required||array['summary'];
  elsif p_action='review' then required:=required||array['review']; end if;
 end if;
 perform rpg_private.fields(p_payload,required);
 perform rpg_private.assert(p_payload->>'campaignId'=cid::text and p_payload->'timeline'=p_timeline and rpg_private.wave4_integer(p_payload->'expectedRevision') and rpg_private.wave4_integer(p_payload->'expectedRuntimeRevision',1) and (p_payload->'expectedHeadId'='null' or (p_payload->>'expectedHeadId')::uuid is not null));
 command:=jsonb_build_object('operationId',op,'campaignId',cid,'timeline',p_timeline,'expectedRevision',p_payload->'expectedRevision','expectedRuntimeRevision',p_payload->'expectedRuntimeRevision','expectedHeadId',p_payload->'expectedHeadId');
 f:=rpg_private.foundation_fence(uid,cid,command);
 if not rpg_private.adventure_can_change(cid) then raise exception 'rpg_conflict'; end if;
 binding:=rpg_private.adventure_binding(cid);
 if p_action='bind' then
  if binding is not null then raise exception 'rpg_conflict'; end if;
  perform rpg_private.assert(rpg_private.wave4_integer(p_payload->'worldVersion',1));
  w:=rpg_private.adventure_world_current(uid,(p_payload->>'worldId')::uuid,(p_payload->>'worldVersion')::integer);
  binding:=jsonb_build_object('worldId',w.id,'worldVersion',w.version,'title',w.title); kind:='adventure.world_bound';
  data:=jsonb_build_object('schemaVersion',1,'binding',binding,'worldVersionId',w.version_id);
 else
  perform rpg_private.assert(binding is not null);
  w:=rpg_private.adventure_world_current(uid,(binding->>'worldId')::uuid,(binding->>'worldVersion')::integer);
  if p_action='prepare' then
   perform rpg_private.adventure_setup(p_payload); perform rpg_private.assert(p_payload->>'mode'='canon');
   a:=jsonb_build_object('id',gen_random_uuid(),'versionId',gen_random_uuid(),'previousVersionId',null,'version',1,'campaignId',cid,'timelineId',p_timeline->'timelineId','worldId',w.id,'worldVersion',w.version,
    'title',p_payload->'title','premise',p_payload->'premise','pacing',p_payload->'pacing','mode','canon','status','prepared','start',null,'completion',null,'summary',null,'review',null,'createdAt',now());
  else
   perform rpg_private.assert(rpg_private.wave4_integer(p_payload->'expectedAdventureVersion',1));
   select event#>'{payload,adventure}' into old from rpg_private.world_events where campaign_id=cid and event->>'kind'='adventure.version' and event#>>'{payload,adventure,id}'=p_payload->>'adventureId' order by sequence desc limit 1;
   if old is null or old->'version'<>p_payload->'expectedAdventureVersion' or old->>'worldId'<>w.id::text then raise exception 'rpg_conflict'; end if;
   nextversion:=(old->>'version')::integer+1;
   a:=old||jsonb_build_object('versionId',gen_random_uuid(),'previousVersionId',old->'versionId','version',nextversion,'timelineId',p_timeline->'timelineId','createdAt',now());
   if p_action='edit' then
    perform rpg_private.assert(old->>'status' in ('prepared','active')); perform rpg_private.adventure_setup(p_payload);
    a:=a||jsonb_build_object('title',p_payload->'title','premise',p_payload->'premise','pacing',p_payload->'pacing');
   elsif p_action='start' then
    perform rpg_private.assert(old->>'status'='prepared' and not exists(select 1 from jsonb_array_elements(rpg_private.adventure_catalog(uid,cid)->'adventures') x where x->>'status'='active'));
    -- Preparation follows the existing fence and lifecycle checks, and shares
    -- their transaction, immutable receipt and final manifest capture.
    opening:=rpg_private.adventure_prepare_opening(uid,cid,op);
    if opening is not null then
     opening_event:=rpg_private.world_event_id(op,'adventure','opening','public');
     insert into rpg_private.world_events(id,campaign_id,operation_id,event) values(opening_event,cid,op,jsonb_build_object('schemaVersion',1,'id',opening_event,'campaignId',cid,'originTimelineId',p_timeline->'timelineId','operationId',op,'worldMinutes',f->'worldMinutes','kind','adventure.opening','actorIds',opening->'actorIds','threadIds','[]'::jsonb,'visibility','public','text',opening->'text','evidence','[]'::jsonb,'payload',jsonb_build_object('template',opening->'template','sceneId',opening->'sceneId','adventureId',old->'id','classification','campaign_authored_opening')));
     perform rpg_private.memory_index(cid,'event',opening_event,'1',opening->>'text','public',(opening->>'sessionId')::uuid,array[(opening#>>'{actorIds,0}')::uuid,(opening#>>'{actorIds,1}')::uuid],array[(opening#>>'{actorIds,0}')::uuid,(opening#>>'{actorIds,1}')::uuid],'history','record');
     perform rpg_private.memory_invalidate(cid);
    end if;
    a:=a||jsonb_build_object('status','active','start',jsonb_build_object('worldMinutes',f->'worldMinutes','sceneId',(select current_scene_id from public.rpg_public_state where campaign_id=cid)));
   elsif p_action in ('end','abandon') then
    perform rpg_private.assert(case when p_action='end' then old->>'status'='active' else old->>'status' in ('prepared','active') end and (p_payload->'summary'='null' or (jsonb_typeof(p_payload->'summary')='string' and length(p_payload->>'summary')<=12000)));
    if p_action='end' then perform rpg_private.adventure_review(p_payload->'review'); end if;
    a:=a||jsonb_build_object('status',case when p_action='end' then 'completed' else 'abandoned' end,'completion',jsonb_build_object('worldMinutes',f->'worldMinutes','sceneId',(select current_scene_id from public.rpg_public_state where campaign_id=cid)),'summary',p_payload->'summary','review',case when p_action='end' then p_payload->'review' else 'null'::jsonb end);
   else
    perform rpg_private.assert(old->>'status' in ('completed','abandoned') and p_payload->'review'<>'null'); perform rpg_private.adventure_review(p_payload->'review'); a:=a||jsonb_build_object('review',p_payload->'review');
   end if;
  end if;
  mid:=rpg_private.timeline_capture(cid);
  basis:=jsonb_build_object('manifestId',mid,'canonGeneration',(select canon_generation from rpg_private.timeline_campaigns where campaign_id=cid),'worldVersionId',w.version_id,'packVersionIds',w.pack_version_ids,'ruleset',f->'ruleset');
  kind:='adventure.version'; data:=jsonb_build_object('schemaVersion',1,'adventure',a,'basis',basis);
 end if;
 perform rpg_private.adventure_record(uid,cid,op,p_action,p_payload,kind,data);
 mid:=rpg_private.timeline_capture(cid); update rpg_private.timelines set head_manifest_id=mid,head_public=rpg_private.timeline_public_metadata(cid) where campaign_id=cid and id=(p_timeline->>'timelineId')::uuid;
 result:=jsonb_build_object('requestId',op,'snapshot',rpg_private.adventure_catalog(uid,cid));
 insert into rpg_private.world_commands values(op,cid,request,result);
 -- Capture the receipt as well, so save/load and same-timeline retry cannot
 -- lose an already-completed metadata operation or create its version twice.
 mid:=rpg_private.timeline_capture(cid); update rpg_private.timelines set head_manifest_id=mid,head_public=rpg_private.timeline_public_metadata(cid) where campaign_id=cid and id=(p_timeline->>'timelineId')::uuid;
 -- The immutable receipt returns its original basis; clients refresh catalog
 -- after success. No mutation of an existing receipt or history is permitted.
 return result;
end $$;
revoke all on function public.rpg_adventures(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_adventures(uuid,uuid,text,jsonb,jsonb) to service_role;
commit;
