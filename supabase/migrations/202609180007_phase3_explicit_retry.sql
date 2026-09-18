-- A new explicit owner retry starts a bounded attempt window; duplicate command IDs remain idempotent.
begin;
create or replace function public.rpg_memory(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare cid uuid:=p_campaign_id; uid uuid:=p_owner_id; ms rpg_private.memory_state%rowtype; boundary rpg_private.memory_boundaries%rowtype;
 saved rpg_private.memory_commands%rowtype; job rpg_private.memory_jobs%rowtype; pending rpg_private.turns%rowtype;
 request_id uuid; bid uuid; sid uuid; rev integer; result jsonb; cp jsonb; sources jsonb; refs jsonb; selections jsonb; chosen jsonb; item jsonb;
 visibility text; actors uuid[]; entities uuid[]; required uuid[]; query tsquery; term text; summaryid uuid; oldid uuid; count_sources integer; highpublic bigint; highprivate bigint;
begin
 if uid is null or not exists(select 1 from rpg_private.owner_registry where user_id=uid) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform rpg_private.assert(cid is not null and jsonb_typeof(p_payload)='object' and octet_length(p_payload::text)<=1000000);
 perform 1 from public.rpg_campaigns where id=cid for update;
 if not found then raise exception 'rpg_not_found'; end if;
 select revision into strict rev from rpg_private.runtime_state where campaign_id=cid for update;
 insert into rpg_private.memory_state(campaign_id) values(cid) on conflict do nothing;
 select * into strict ms from rpg_private.memory_state where campaign_id=cid for update;
 if p_action='read' then return rpg_private.memory_read(cid); end if;
 if p_action='source' then
  perform rpg_private.assert(p_payload->>'mode' in ('game','companion','mechanic'));
  return rpg_private.runtime_source(cid,uid,p_payload->>'mode');
 end if;
 if p_action in ('end','continue','retry') then
  request_id:=(p_payload->>'requestId')::uuid;
  perform rpg_private.assert(request_id is not null and p_payload->>'campaignId'=cid::text);
  select * into saved from rpg_private.memory_commands where id=request_id;
  if found then
   if saved.campaign_id<>cid or saved.owner_id<>uid or saved.request<>jsonb_build_object('action',p_action,'payload',p_payload) then raise exception 'rpg_conflict'; end if;
   return rpg_private.memory_read(cid);
  end if;
  if p_action<>'retry' and (p_payload->>'expectedRevision')::integer<>rev then raise exception 'rpg_conflict'; end if;
  if p_action='end' then
   perform rpg_private.fields(p_payload,array['requestId','campaignId','expectedRevision','sessionId']);
   sid:=(p_payload->>'sessionId')::uuid;
   perform rpg_private.assert(exists(select 1 from public.rpg_public_state p join public.rpg_sessions s on s.campaign_id=p.campaign_id and s.id=p.current_session_id where p.campaign_id=cid and s.id=sid and s.status='open'));
   select * into boundary from rpg_private.memory_boundaries where campaign_id=cid and session_id=sid;
   if not found then
    select * into pending from rpg_private.turns where campaign_id=cid and session_id=sid and input->>'mode' in ('game','companion','mechanic') and (status in ('pending','generating','awaiting_confirmation') or (status='failed' and retryable)) order by sequence desc limit 1;
    insert into rpg_private.memory_boundaries(campaign_id,session_id,pending_operation_id) values(cid,sid,pending.id) returning * into boundary;
    update rpg_private.turns set lease_token=null,lease_until=null where id=pending.id and campaign_id=cid;
    perform rpg_private.memory_capture(cid,boundary.id);
    perform rpg_private.memory_queue(cid,boundary.id);
   end if;
  elsif p_action='continue' then
   perform rpg_private.fields(p_payload,array['requestId','campaignId','expectedRevision','boundaryId']);
   select * into boundary from rpg_private.memory_boundaries where campaign_id=cid and id=(p_payload->>'boundaryId')::uuid for update;
   if not found then raise exception 'rpg_not_found'; end if;
   if boundary.state<>'continued' then
    select * into pending from rpg_private.turns where campaign_id=cid and id=boundary.pending_operation_id;
    if pending.id is not null and (pending.status in ('pending','generating','awaiting_confirmation') or (pending.status='failed' and pending.retryable)) then
     update rpg_private.memory_boundaries set state='resuming' where id=boundary.id;
    else
     cp:=rpg_private.memory_capture(cid,boundary.id);
     sid:=gen_random_uuid();
     update public.rpg_sessions set status='closed',revision=revision+1,updated_at=now() where campaign_id=cid and id=boundary.session_id;
     insert into public.rpg_sessions(id,campaign_id,title,status,recap,revision) values(sid,cid,case (select language from public.rpg_campaigns where id=cid) when 'ru' then 'Следующая сессия' else 'Next session' end,'open','',1);
     update public.rpg_public_state set current_session_id=sid,current_scene_id=null,revision=revision+1,updated_at=now() where campaign_id=cid;
     update rpg_private.memory_boundaries set state='continued',next_session_id=sid where id=boundary.id;
     -- New boundary metadata is prospective. Pending jobs are repinned only when no provider owns them.
     update rpg_private.memory_jobs set state_revision=(select revision from rpg_private.runtime_state where campaign_id=cid) where campaign_id=cid and status='pending';
     perform rpg_private.memory_queue(cid,boundary.id);
    end if;
   end if;
  else
   perform rpg_private.fields(p_payload,array['requestId','campaignId','boundaryId']);
   bid:=(p_payload->>'boundaryId')::uuid;
   if bid is not null and not exists(select 1 from rpg_private.memory_boundaries where campaign_id=cid and id=bid) then raise exception 'rpg_not_found'; end if;
   update rpg_private.memory_jobs set status='pending',attempts=0,token=null,lease_until=null,failure=null,
    state_revision=rev,settings_revision=(select revision from public.rpg_settings where campaign_id=cid),
    guide_version_id=(select d.current_version_id from public.rpg_documents d join public.rpg_dm_guides g on g.campaign_id=d.campaign_id and g.document_id=d.id where g.campaign_id=cid)
    where campaign_id=cid and generation=ms.generation and (status='failed' or (status='generating' and lease_until<=now())) and (bid is null or boundary_id=bid);
   perform rpg_private.memory_capture(cid,bid);
   perform rpg_private.memory_queue(cid,bid);
  end if;
  result:=rpg_private.memory_read(cid);
  insert into rpg_private.memory_commands(id,campaign_id,owner_id,request,result) values(request_id,cid,uid,jsonb_build_object('action',p_action,'payload',p_payload),result);
  return result;
 elsif p_action='enqueue' then
  perform rpg_private.assert(p_payload->>'reason' in ('pressure','rebuild'));
  select id into bid from rpg_private.memory_boundaries where campaign_id=cid and state<>'continued' order by ended_at desc limit 1;
  perform rpg_private.memory_capture(cid,bid); perform rpg_private.memory_queue(cid,bid); return 'null';
 elsif p_action='claim' then
  select * into job from rpg_private.memory_jobs where campaign_id=cid and generation=ms.generation and attempts<5
   and from_sequence=(case memory_jobs.visibility when 'public' then ms.public_watermark else ms.private_watermark end)+1
   and (status='pending' or (status='generating' and lease_until<=now())) order by from_sequence,case memory_jobs.visibility when 'public' then 0 else 1 end,created_at for update skip locked limit 1;
  if not found then return 'null'; end if;
  update rpg_private.memory_jobs set status='generating',attempts=attempts+1,token=gen_random_uuid(),lease_until=now()+interval '300 seconds',
   state_revision=rev,settings_revision=(select revision from public.rpg_settings where campaign_id=cid),
   guide_version_id=(select d.current_version_id from public.rpg_documents d join public.rpg_dm_guides g on g.campaign_id=d.campaign_id and g.document_id=d.id where g.campaign_id=cid)
   where id=job.id returning * into job;
  return jsonb_build_object('id',job.id,'campaignId',cid,'boundaryId',job.boundary_id,'visibility',job.visibility,'generation',job.generation,'token',job.token,'attempts',job.attempts,
   'stateRevision',job.state_revision,'settingsRevision',job.settings_revision,'guideVersionId',job.guide_version_id,'fromSequence',job.from_sequence,'throughSequence',job.through_sequence,
   'sources',job.sources,'requiredSourceIds',coalesce((select jsonb_agg(value->'id') from jsonb_array_elements(job.sources) where (value->>'unresolved')::boolean),'[]'));
 elsif p_action in ('publish','fail') then
  select * into job from rpg_private.memory_jobs where campaign_id=cid and id=(p_payload->>'jobId')::uuid for update;
  if not found then raise exception 'rpg_not_found'; end if;
  if job.status<>'generating' or job.token is distinct from (p_payload->>'token')::uuid or job.lease_until<=now() or job.generation<>ms.generation then raise exception 'rpg_conflict'; end if;
  if p_action='fail' then
   perform rpg_private.assert(p_payload->>'category' in ('provider','validation','context','unavailable'));
   update rpg_private.memory_jobs set status='failed',failure=p_payload->>'category',token=null,lease_until=null where id=job.id; return 'null';
  end if;
  if job.state_revision<>rev or job.settings_revision<>(select revision from public.rpg_settings where campaign_id=cid) or job.guide_version_id<>(select d.current_version_id from public.rpg_documents d join public.rpg_dm_guides g on g.campaign_id=d.campaign_id and g.document_id=d.id where g.campaign_id=cid) then raise exception 'rpg_conflict'; end if;
  perform rpg_private.fields(p_payload->'summary',array['schemaVersion','selections']);
  perform rpg_private.assert(p_payload#>>'{summary,schemaVersion}'='1' and jsonb_typeof(p_payload#>'{summary,selections}')='array' and jsonb_array_length(p_payload#>'{summary,selections}')<=24);
  selections:=p_payload#>'{summary,selections}'; chosen:='[]';
  select coalesce(jsonb_agg(value->'ref'),'[]') into refs from jsonb_array_elements(job.sources);
  if not rpg_private.memory_refs_valid(cid,refs,job.visibility) then raise exception 'rpg_conflict'; end if;
  for item in select value from jsonb_array_elements(selections) loop
   perform rpg_private.fields(item,array['sourceId','version']);
   select value into result from jsonb_array_elements(job.sources) where value->>'id'=item->>'sourceId' and value#>>'{ref,version}'=item->>'version';
   perform rpg_private.assert(result is not null and not exists(select 1 from jsonb_array_elements(chosen) where value->>'id'=item->>'sourceId'));
   chosen:=chosen || jsonb_build_array(result);
  end loop;
  perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(job.sources) s where (s.value->>'unresolved')::boolean and not exists(select 1 from jsonb_array_elements(chosen) c where c.value->>'id'=s.value->>'id')));
  -- Publish strictly in stream order; no job may mark unseen prior source ranges covered.
  if job.from_sequence<>(case job.visibility when 'public' then ms.public_watermark else ms.private_watermark end)+1 then raise exception 'rpg_conflict'; end if;
  summaryid:=gen_random_uuid();
  if job.visibility='public' then
   select id into oldid from public.rpg_memory_summaries where campaign_id=cid and valid order by through_sequence desc limit 1;
   insert into public.rpg_memory_summaries(id,campaign_id,boundary_id,generation,from_sequence,through_sequence,source_refs,entries,supersedes_id,state_revision,settings_revision,guide_version_id) values(summaryid,cid,job.boundary_id,job.generation,job.from_sequence,job.through_sequence,refs,chosen,oldid,job.state_revision,job.settings_revision,job.guide_version_id);
   update rpg_private.memory_state set public_watermark=job.through_sequence where campaign_id=cid;
  else
   select id into oldid from rpg_private.memory_summaries where campaign_id=cid and valid order by through_sequence desc limit 1;
   insert into rpg_private.memory_summaries(id,campaign_id,boundary_id,generation,from_sequence,through_sequence,source_refs,entries,supersedes_id,state_revision,settings_revision,guide_version_id) values(summaryid,cid,job.boundary_id,job.generation,job.from_sequence,job.through_sequence,refs,chosen,oldid,job.state_revision,job.settings_revision,job.guide_version_id);
   update rpg_private.memory_state set private_watermark=job.through_sequence where campaign_id=cid;
  end if;
  update rpg_private.memory_jobs set status='ready',token=null,lease_until=null where id=job.id;
  return 'null';
 elsif p_action='context' then
  select coalesce(array_agg(value::uuid),'{}') into actors from jsonb_array_elements_text(coalesce(p_payload->'actorIds','[]')) value;
  perform rpg_private.assert(cardinality(actors)<=20 and jsonb_typeof(p_payload->'includePrivate')='boolean' and (cardinality(actors)=0 or not (p_payload->>'includePrivate')::boolean));
  select payload || jsonb_build_object('valid',valid) into cp from rpg_private.memory_checkpoints where campaign_id=cid order by created_at desc,id desc limit 1;
  if cardinality(actors)>0 then cp:=null; end if;
  with permitted as materialized (
   select s.*, 'public'::text visibility from rpg_private.memory_public_sources s where campaign_id=cid and sequence>ms.public_watermark and current and status='valid' and kind in ('scene','document','event') and actors<@known_by and rpg_private.memory_refs_valid(cid,s.source_refs,'public')
   union all
   select s.*, 'private'::text visibility from rpg_private.memory_private_sources s where campaign_id=cid and sequence>ms.private_watermark and current and status='valid' and (p_payload->>'includePrivate')::boolean and rpg_private.memory_refs_valid(cid,s.source_refs,'private')
  ), bounded as (select * from permitted order by permitted.visibility,sequence limit 49)
  select coalesce(jsonb_agg(rpg_private.memory_source_json(jsonb_populate_record(null::rpg_private.memory_public_sources,to_jsonb(b)-'visibility'),b.visibility) order by b.visibility,sequence),'[]'),count(*) into sources,count_sources from bounded b;
  select coalesce(max(sequence),0) into highpublic from rpg_private.memory_public_sources where campaign_id=cid and current and status='valid' and kind in ('scene','event','document');
  select coalesce(max(sequence),0) into highprivate from rpg_private.memory_private_sources where campaign_id=cid and current and status='valid';
  return jsonb_build_object('campaignId',cid,'generation',ms.generation,'stateRevision',rev,'checkpoint',cp,
   'publicSummary',case when cardinality(actors)=0 then rpg_private.memory_summary_json(cid,'public') else null end,
   'privateSummary',case when (p_payload->>'includePrivate')::boolean then rpg_private.memory_summary_json(cid,'private') else null end,
   'publicWatermark',ms.public_watermark,'privateWatermark',case when (p_payload->>'includePrivate')::boolean then ms.private_watermark else 0 end,
   'publicHighWatermark',highpublic,'privateHighWatermark',case when (p_payload->>'includePrivate')::boolean then highprivate else 0 end,
   'uncovered',sources,'overflow',count_sources>48 or octet_length(sources::text)>48000 or exists(select 1 from rpg_private.memory_public_sources where campaign_id=cid and current and status='valid' and oversized),
   'aliases',rpg_private.memory_alias_json(cid));
 elsif p_action='search' then
  visibility:=p_payload->>'visibility'; perform rpg_private.assert(visibility in ('public','private') and p_payload->>'campaignId'=cid::text and length(p_payload->>'query')<=4000);
  select coalesce(array_agg(value::uuid),'{}') into actors from jsonb_array_elements_text(p_payload->'actorIds') value;
  select coalesce(array_agg(value::uuid),'{}') into entities from jsonb_array_elements_text(p_payload->'entityIds') value;
  select coalesce(array_agg(value::uuid),'{}') into required from jsonb_array_elements_text(p_payload->'requiredSourceIds') value;
  perform rpg_private.assert(cardinality(actors)<=20 and cardinality(entities)<=100 and cardinality(required)<=48 and (visibility='public' or cardinality(actors)=0));
  -- Expanded aliases/languages are alternatives, not one impossible AND clause.
  query:=''::tsquery;
  for term in select value from regexp_split_to_table(lower(p_payload->>'query'),'[^[:alnum:]_]+') value
   where length(value)>=3 and value<>all(array['the','and','what','where','who','about','tell','does','this','that','with','have','was','are','как','что','где','кто','это','мне','про','для','или','его','она','они']) limit 100 loop
   query:=query || plainto_tsquery('simple',term) || plainto_tsquery('english',term) || plainto_tsquery('russian',term);
  end loop;
  with permitted as materialized (
   select s.* from rpg_private.memory_sources(cid,visibility) s where
    ((s.current and s.status='valid') or ((p_payload->>'historicalComparison')::boolean and s.status in ('superseded','archived')))
    and not s.oversized and actors<@s.known_by
    and (not coalesce((p_payload->>'historicalOnly')::boolean,false) or s.kind in ('scene','document','event','private_event','summary'))
    and (s.valid_from is null or s.valid_from<=(p_payload->>'worldMinutes')::integer)
    and (s.valid_to is null or s.valid_to>(p_payload->>'worldMinutes')::integer)
    and rpg_private.memory_refs_valid(cid,s.source_refs,visibility)
  ), ranked as (
   select s.* from permitted s where id=any(required) or s.entity_ids&&entities or s.search_vector@@query
   order by (id=any(required)) desc,(s.authority in ('correction','state','canon') and (s.entity_ids&&entities or s.search_vector@@query)) desc,
    (s.unresolved and (s.entity_ids&&entities or s.search_vector@@query)) desc,s.significance desc,ts_rank(s.search_vector,query) desc,s.sequence desc limit 48
  ) select coalesce(jsonb_agg(rpg_private.memory_source_json(s,visibility)),'[]') into sources from ranked s;
  return jsonb_build_object('campaignId',cid,'generation',ms.generation,'sources',sources,'aliases',rpg_private.memory_alias_json(cid));
 else raise exception 'rpg_validation'; end if;
end $$;

commit;
