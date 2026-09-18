-- Additive Phase 3 memory. Sources are evidence, never replacement gameplay state.
begin;
create table rpg_private.memory_state (
  campaign_id uuid primary key references public.rpg_campaigns(id),
  generation integer not null default 1,
  public_watermark bigint not null default 0,
  private_watermark bigint not null default 0
);
create table rpg_private.memory_public_sources (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.rpg_campaigns(id),
  sequence bigint generated always as identity check(sequence between 1 and 9007199254740991),
  kind text not null, source_id uuid not null, version text not null, part integer not null,
  session_id uuid, text text not null, entity_ids uuid[] not null default '{}', known_by uuid[] not null default '{}',
  authority text not null, statement_kind text not null default 'record', attribution text,
  valid_from integer, valid_to integer, significance integer not null default 1, unresolved boolean not null default false,
  current boolean not null default true, status text not null default 'valid' check(status in ('valid','superseded','archived','invalid')),
  fact_key text, fact_value text, source_refs jsonb not null default '[]', oversized boolean not null default false,
  search_vector tsvector generated always as (
    to_tsvector('simple'::regconfig,text) || to_tsvector('english'::regconfig,text) || to_tsvector('russian'::regconfig,text)
  ) stored,
  created_at timestamptz not null default now(),
  unique(campaign_id,kind,source_id,version,part), unique(campaign_id,id),
  foreign key(campaign_id,session_id) references public.rpg_sessions(campaign_id,id)
);
create table rpg_private.memory_private_sources (like rpg_private.memory_public_sources including all);
alter table rpg_private.memory_private_sources add foreign key(campaign_id) references public.rpg_campaigns(id);
create index memory_public_source_search on rpg_private.memory_public_sources using gin(search_vector);
create index memory_private_source_search on rpg_private.memory_private_sources using gin(search_vector);
create index memory_public_source_range on rpg_private.memory_public_sources(campaign_id,sequence);
create index memory_private_source_range on rpg_private.memory_private_sources(campaign_id,sequence);
create table rpg_private.memory_aliases (
  campaign_id uuid not null, entity_id uuid not null, alias text not null,
  primary key(campaign_id,entity_id,alias),
  foreign key(campaign_id,entity_id) references public.rpg_entities(campaign_id,id)
);
create table rpg_private.memory_restrictions (
  campaign_id uuid not null references public.rpg_campaigns(id), kind text not null, source_id uuid not null,
  primary key(campaign_id,kind,source_id)
);
create table rpg_private.memory_boundaries (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null, session_id uuid not null,
  state text not null default 'ended' check(state in ('ended','resuming','continued')),
  pending_operation_id uuid, next_session_id uuid, ended_at timestamptz not null default now(),
  unique(campaign_id,session_id), unique(campaign_id,id),
  foreign key(campaign_id,session_id) references public.rpg_sessions(campaign_id,id),
  foreign key(campaign_id,next_session_id) references public.rpg_sessions(campaign_id,id),
  foreign key(campaign_id,pending_operation_id) references rpg_private.turns(campaign_id,id)
);
create table rpg_private.memory_checkpoints (
  id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id), boundary_id uuid,
  payload jsonb not null, valid boolean not null default true, created_at timestamptz not null default now(),
  foreign key(campaign_id,boundary_id) references rpg_private.memory_boundaries(campaign_id,id)
);
create table public.rpg_memory_summaries (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.rpg_campaigns(id),
  boundary_id uuid, generation integer not null, from_sequence bigint not null, through_sequence bigint not null,
  source_refs jsonb not null, entries jsonb not null, valid boolean not null default true,
  supersedes_id uuid, schema_version integer not null default 1, generator_version text not null default 'extractive-v1',
  state_revision integer not null, settings_revision integer not null, guide_version_id uuid not null,
  created_at timestamptz not null default now(), unique(campaign_id,id),
  foreign key(campaign_id,boundary_id) references rpg_private.memory_boundaries(campaign_id,id)
);
create table rpg_private.memory_summaries (like public.rpg_memory_summaries including all);
alter table rpg_private.memory_summaries add foreign key(campaign_id) references public.rpg_campaigns(id);
create table rpg_private.memory_jobs (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.rpg_campaigns(id), boundary_id uuid,
  visibility text not null check(visibility in ('public','private')), generation integer not null,
  from_sequence bigint not null, through_sequence bigint not null, sources jsonb not null,
  state_revision integer not null, settings_revision integer not null, guide_version_id uuid not null,
  status text not null default 'pending' check(status in ('pending','generating','ready','failed','stale')),
  attempts integer not null default 0, token uuid, lease_until timestamptz, failure text,
  created_at timestamptz not null default now(),
  unique(campaign_id,visibility,generation,from_sequence,through_sequence),
  foreign key(campaign_id,boundary_id) references rpg_private.memory_boundaries(campaign_id,id)
);
create table rpg_private.memory_commands (
  id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id), owner_id uuid not null,
  request jsonb not null, result jsonb not null, created_at timestamptz not null default now()
);
create trigger immutable_memory_commands before update or delete on rpg_private.memory_commands for each row execute function rpg_private.immutable_history();

create function rpg_private.memory_source_json(s rpg_private.memory_public_sources, visibility text) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('id',s.id,'campaignId',s.campaign_id,
 'ref',jsonb_build_object('campaignId',s.campaign_id,'kind',s.kind,'id',s.source_id,'version',s.version,'part',s.part,'visibility',visibility),
 'sequence',s.sequence,'sessionId',s.session_id,'text',s.text,'entityIds',s.entity_ids,'knownBy',s.known_by,
 'authority',s.authority,'statementKind',s.statement_kind,'attribution',s.attribution,'validFrom',s.valid_from,'validTo',s.valid_to,
 'significance',s.significance,'unresolved',s.unresolved,'current',s.current,'status',s.status,
 'factKey',s.fact_key,'factValue',s.fact_value,'sourceRefs',s.source_refs)
$$;
create function rpg_private.memory_sources(cid uuid, visibility text) returns setof rpg_private.memory_public_sources
language plpgsql stable set search_path='' as $$
begin
 if visibility='public' then return query select * from rpg_private.memory_public_sources where campaign_id=cid;
 elsif visibility='private' then return query select * from rpg_private.memory_private_sources where campaign_id=cid;
 else raise exception 'rpg_validation'; end if;
end $$;

create function rpg_private.memory_refs_valid(cid uuid, refs jsonb, visibility text) returns boolean
language plpgsql stable set search_path='' as $$
declare ref jsonb;
begin
 for ref in select value from jsonb_array_elements(refs) loop
  if ref->>'campaignId'<>cid::text or ref->>'visibility'<>visibility or not exists(
    select 1 from rpg_private.memory_sources(cid,visibility) s where s.kind=ref->>'kind' and s.source_id=(ref->>'id')::uuid
      and s.version=ref->>'version' and s.part=(ref->>'part')::integer and s.current and s.status='valid'
  ) then return false; end if;
 end loop;
 return true;
end $$;
create function rpg_private.memory_invalidate(cid uuid) returns void language plpgsql set search_path='' as $$
begin
 insert into rpg_private.memory_state(campaign_id) values(cid) on conflict do nothing;
 update rpg_private.memory_state set generation=generation+1,public_watermark=0,private_watermark=0 where campaign_id=cid;
 update public.rpg_memory_summaries set valid=false where campaign_id=cid and valid;
 update rpg_private.memory_summaries set valid=false where campaign_id=cid and valid;
 update rpg_private.memory_checkpoints set valid=false where campaign_id=cid and valid;
 update rpg_private.memory_jobs set status='stale',token=null,lease_until=null where campaign_id=cid and status in ('pending','generating','failed');
end $$;

-- Whole paragraphs retain attribution/negation. An indivisible oversized span is
-- retained as a reconstruction source and causes a safe context pause, not truncation.
create function rpg_private.memory_index(cid uuid, kind text, rid uuid, ver text, body text,
 visibility text default 'public', sid uuid default null, entities uuid[] default '{}', witnesses uuid[] default '{}',
 authority text default 'history', statement text default 'record', refs jsonb default '[]', factkey text default null, factvalue text default null)
returns void language plpgsql set search_path='' as $$
declare span text; n integer:=0; tbl text; unresolved boolean; significance integer;
begin
 if length(btrim(coalesce(body,'')))=0 then return; end if;
 if visibility='public' and exists(select 1 from rpg_private.memory_restrictions r where r.campaign_id=cid and r.kind=memory_index.kind and r.source_id=rid) then visibility:='private'; end if;
 if cardinality(entities)=0 and visibility='public' then
  select coalesce(array_agg(distinct entity_id),'{}') into entities from rpg_private.memory_aliases where campaign_id=cid and length(alias)>=3 and position(lower(alias) in lower(body))>0;
 end if;
 tbl:=case visibility when 'public' then 'memory_public_sources' when 'private' then 'memory_private_sources' end;
 perform rpg_private.assert(tbl is not null);
 unresolved:=body ~* '(promis|owe|obligat|unresolved|intend|plan to|обещ|долж|намер|планир|неразреш)';
 significance:=case when unresolved then 10 when authority in ('correction','canon') then 8 else 2 end;
 for span in select btrim(value) from regexp_split_to_table(body,E'\n[[:space:]]*\n') value where length(btrim(value))>0 loop
   execute format('insert into rpg_private.%I(campaign_id,kind,source_id,version,part,session_id,text,entity_ids,known_by,authority,statement_kind,significance,unresolved,source_refs,fact_key,fact_value,oversized) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) on conflict(campaign_id,kind,source_id,version,part) do nothing',tbl)
    using cid,kind,rid,ver,n,sid,span,entities,witnesses,authority,statement,significance,unresolved,refs,factkey,factvalue,octet_length(span)>24000;
   n:=n+1;
 end loop;
end $$;
create function rpg_private.memory_record_source() returns trigger language plpgsql security definer set search_path='' as $$
declare row jsonb:=to_jsonb(new); cid uuid:=new.campaign_id; rid uuid; source_kind text; body text; auth text; statement text:='record'; entities uuid[]:='{}'; sid uuid;
begin
 source_kind:=case tg_table_name when 'rpg_documents' then 'document' when 'rpg_scenes' then 'scene' when 'rpg_entities' then 'entity' when 'rpg_items' then 'item' when 'rpg_quests' then 'quest' when 'rpg_locations' then 'location' when 'rpg_public_state' then 'state' end;
 rid:=coalesce((row->>'id')::uuid,cid);
 insert into rpg_private.memory_state(campaign_id) values(cid) on conflict do nothing;
 if tg_op='UPDATE' then
   update rpg_private.memory_public_sources set current=false,status='superseded' where campaign_id=cid and source_id=rid and memory_public_sources.kind=source_kind and current;
   update rpg_private.memory_private_sources set current=false,status='superseded' where campaign_id=cid and source_id=rid and memory_private_sources.kind=source_kind and current;
   if source_kind in ('document','scene') then perform rpg_private.memory_invalidate(cid); end if;
 end if;
 if source_kind='document' then
   if exists(select 1 from public.rpg_dm_guides where campaign_id=cid and document_id=rid) then return new; end if;
   if row->>'status'='archived' then return new; end if;
   body:=row->>'body'; auth:=case row->>'status' when 'canon' then 'canon' else 'reference' end;
 elsif source_kind='scene' then
   body:=row->>'body'; sid:=(row->>'session_id')::uuid; auth:='history';
   statement:=case when row->>'role'='player' then 'intention' else 'record' end;
 elsif source_kind='entity' then
   body:=concat(row->>'name',': ',row->>'details'); auth:='state'; entities:=array[rid];
   insert into rpg_private.memory_aliases(campaign_id,entity_id,alias) values(cid,rid,row->>'name') on conflict do nothing;
 elsif source_kind='item' then body:=concat(row->>'name',': ',row->>'description',' ',row->>'mechanics'); auth:='state';
 elsif source_kind='quest' then body:=concat(row->>'title',': ',row->>'description',' [',row->>'status',']'); auth:='state';
   if row->>'status'='archived' then return new; end if;
 elsif source_kind='location' then body:=concat(row->>'name',': ',row->>'description'); auth:='state';
 else body:=row->>'summary'; auth:='state'; end if;
 perform rpg_private.memory_index(cid,source_kind,rid,row->>'revision',body,'public',sid,entities,'{}',auth,statement);
 return new;
end $$;
do $$ declare t text; begin
 foreach t in array array['rpg_documents','rpg_scenes','rpg_entities','rpg_items','rpg_quests','rpg_locations','rpg_public_state'] loop
  execute format('create trigger memory_record_source after insert or update on public.%I for each row execute function rpg_private.memory_record_source()',t);
 end loop;
end $$;
create function rpg_private.memory_owner_correction() returns trigger language plpgsql security definer set search_path='' as $$
declare op text:=new.request->>'operation'; rid uuid:=(new.result->>'id')::uuid;
begin
 if new.campaign_id is not null and op not in ('campaign.create','feedback.send') then
   perform rpg_private.memory_invalidate(new.campaign_id);
   update rpg_private.memory_public_sources set authority='correction' where campaign_id=new.campaign_id and source_id=rid and current and kind<>'document';
 end if;
 return new;
end $$;
create trigger memory_owner_correction after insert on rpg_private.mutation_receipts for each row execute function rpg_private.memory_owner_correction();

create function rpg_private.memory_ingest_event(ev rpg_private.runtime_events) returns void language plpgsql set search_path='' as $$
declare t rpg_private.turns%rowtype; witnesses uuid[]; mentioned uuid[]; body text; scene_ids uuid[]; refs jsonb;
begin
 select * into strict t from rpg_private.turns where id=ev.operation_id and campaign_id=ev.campaign_id;
 if t.input->>'mode' not in ('game','mechanic','companion') then return; end if;
 if t.input->>'mode'='companion' then
  select array_agg(distinct x::uuid) into witnesses from jsonb_array_elements_text(coalesce(t.input->'listenerIds','[]') || jsonb_build_array(t.input->>'companionId')) x;
 else
  select coalesce(array_agg(x::uuid),'{}') into witnesses from jsonb_array_elements_text(coalesce(t.source#>'{runtime,configuration,presentEntityIds}','[]')) x;
 end if;
 scene_ids:=array[(ev.payload->>'playerSceneId')::uuid,(ev.payload->>'narrationSceneId')::uuid];
 update rpg_private.memory_public_sources set known_by=coalesce(witnesses,'{}'),
  entity_ids=case when t.input->>'mode'='companion' then array_append(entity_ids,(t.input->>'companionId')::uuid) else entity_ids end,
  valid_from=(ev.payload#>>'{packet,resolution,worldMinutes}')::integer
  where campaign_id=ev.campaign_id and kind='scene' and source_id=any(scene_ids);
 select coalesce(array_agg(distinct x::uuid),'{}') into mentioned from jsonb_array_elements(coalesce(ev.payload#>'{packet,resolution,outcomes}','[]')) o cross join lateral jsonb_array_elements_text(coalesce(o->'entityIds','[]')) x;
 select coalesce(jsonb_agg(rpg_private.memory_source_json(s,'public')->'ref'),'[]') into refs from rpg_private.memory_public_sources s where campaign_id=ev.campaign_id and kind='scene' and source_id=any(scene_ids) and current;
 body:=case when jsonb_array_length(coalesce(ev.payload#>'{packet,resolution,outcomes}','[]'))>0 then 'Validated public outcomes: ' || (ev.payload#>'{packet,resolution,outcomes}')::text else '' end;
 perform rpg_private.memory_index(ev.campaign_id,'event',ev.id,'1',body,'public',t.session_id,mentioned,coalesce(witnesses,'{}'),'history','fact',refs);
 body:=case when jsonb_array_length(coalesce(ev.payload#>'{packet,privatePatches}','[]'))>0 then (ev.payload#>'{packet,privatePatches}')::text else '' end;
 perform rpg_private.memory_index(ev.campaign_id,'private_event',ev.id,'1',body,'private',t.session_id,'{}','{}','history','record');
 return;
end $$;
create function rpg_private.memory_runtime_event() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform rpg_private.memory_ingest_event(new);
 return new;
end $$;
create trigger memory_runtime_event after insert on rpg_private.runtime_events for each row execute function rpg_private.memory_runtime_event();

-- Internal administrative restriction hook: no ordinary caller can execute it.
-- Revoke all public derivatives synchronously; copies retain private provenance.
create function rpg_private.memory_restrict_source(cid uuid, source_kind text, rid uuid) returns void language plpgsql set search_path='' as $$
declare s rpg_private.memory_public_sources%rowtype;
begin
 insert into rpg_private.memory_restrictions(campaign_id,kind,source_id) values(cid,source_kind,rid) on conflict do nothing;
 for s in select * from rpg_private.memory_public_sources where campaign_id=cid and memory_public_sources.kind=source_kind and source_id=rid and current loop
  perform rpg_private.memory_index(cid,s.kind,s.source_id,s.version,s.text,'private',s.session_id,s.entity_ids,s.known_by,s.authority,s.statement_kind,s.source_refs,s.fact_key,s.fact_value);
 end loop;
 update rpg_private.memory_public_sources set current=false,status='invalid' where campaign_id=cid and memory_public_sources.kind=source_kind and source_id=rid;
 perform rpg_private.memory_invalidate(cid);
end $$;

create function rpg_private.memory_alias_json(cid uuid) returns jsonb language sql stable set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('campaignId',a.campaign_id,'entityId',a.entity_id,'alias',a.alias,'currentName',e.name) order by a.alias),'[]')
 from rpg_private.memory_aliases a join public.rpg_entities e on e.campaign_id=a.campaign_id and e.id=a.entity_id where a.campaign_id=cid
$$;
create function rpg_private.memory_capture(cid uuid,bid uuid default null) returns jsonb language plpgsql set search_path='' as $$
declare cp uuid:=gen_random_uuid(); sid uuid; pending rpg_private.turns%rowtype; lastturn rpg_private.turns%rowtype; result jsonb; resume jsonb; state rpg_private.runtime_state%rowtype; ps public.rpg_public_state%rowtype;
begin
 select * into strict state from rpg_private.runtime_state where campaign_id=cid;
 select * into strict ps from public.rpg_public_state where campaign_id=cid;
 select session_id into sid from rpg_private.memory_boundaries where id=bid and campaign_id=cid;
 sid:=coalesce(sid,ps.current_session_id);
 select * into pending from rpg_private.turns where campaign_id=cid and session_id=sid and input->>'mode' in ('game','mechanic','companion') and (status in ('pending','generating','awaiting_confirmation') or (status='failed' and retryable)) order by sequence desc limit 1;
 select * into lastturn from rpg_private.turns where campaign_id=cid and status='committed' and input->>'mode' in ('game','mechanic','companion') order by sequence desc limit 1;
 resume:=jsonb_build_object('sceneId',ps.current_scene_id,'locationId',ps.current_location_id,'worldMinutes',state.world_minutes,
  'participantIds',coalesce(state.configuration->'presentEntityIds','[]'),'lastAction',lastturn.input->>'input','lastOutcome',lastturn.narration,
  'situation',ps.summary,'expectedInput',case when pending.id is not null then 'Resume the saved action.' else 'Choose the next action.' end,
  'pendingOperationId',pending.id,'pendingStatus',pending.status);
 result:=jsonb_build_object('id',cp,'campaignId',cid,'boundaryId',bid,'sessionId',sid,'stateRevision',state.revision,
  'settingsRevision',(select revision from public.rpg_settings where campaign_id=cid),
  'guideVersionId',(select d.current_version_id from public.rpg_documents d join public.rpg_dm_guides g on g.campaign_id=d.campaign_id and g.document_id=d.id where g.campaign_id=cid),
  'sessionGuidanceIds',coalesce((select jsonb_agg(id) from public.rpg_session_guidance where campaign_id=cid and session_id=sid),'[]'),
  'publicWatermark',coalesce((select max(sequence) from rpg_private.memory_public_sources where campaign_id=cid),0),
  'privateWatermark',coalesce((select max(sequence) from rpg_private.memory_private_sources where campaign_id=cid),0),
  'sourceRefs',coalesce((select jsonb_agg(rpg_private.memory_source_json(s,'public')->'ref') from rpg_private.memory_public_sources s where campaign_id=cid and current and status='valid' and (source_id=ps.current_scene_id or unresolved)),'[]'),
  'unresolvedSourceIds',coalesce((select jsonb_agg(id) from rpg_private.memory_public_sources where campaign_id=cid and current and status='valid' and unresolved),'[]'),
  'valid',true,'resume',resume,
  'exactState',jsonb_build_object('publicState',to_jsonb(ps),'runtime',rpg_private.runtime_play(cid),
   'entities',coalesce((select jsonb_agg(to_jsonb(e)) from public.rpg_entities e where campaign_id=cid),'[]'),
   'items',coalesce((select jsonb_agg(to_jsonb(i)) from public.rpg_items i where campaign_id=cid),'[]'),
   'quests',coalesce((select jsonb_agg(to_jsonb(q)) from public.rpg_quests q where campaign_id=cid),'[]')));
 insert into rpg_private.memory_checkpoints(id,campaign_id,boundary_id,payload) values(cp,cid,bid,result);
 return result;
end $$;

create function rpg_private.memory_queue(cid uuid,bid uuid default null) returns void language plpgsql set search_path='' as $$
declare visibility text; head bigint; lastseq bigint; firstseq bigint; batch jsonb; bytes integer; s rpg_private.memory_public_sources%rowtype; ms rpg_private.memory_state%rowtype; rev integer; settingrev integer; guide uuid;
begin
 select * into strict ms from rpg_private.memory_state where campaign_id=cid;
 select revision into rev from rpg_private.runtime_state where campaign_id=cid;
 select revision into settingrev from public.rpg_settings where campaign_id=cid;
 select d.current_version_id into guide from public.rpg_documents d join public.rpg_dm_guides g on g.campaign_id=d.campaign_id and g.document_id=d.id where g.campaign_id=cid;
 foreach visibility in array array['public','private'] loop
  head:=case visibility when 'public' then ms.public_watermark else ms.private_watermark end;
  batch:='[]'; bytes:=0; firstseq:=head+1; lastseq:=head;
  for s in select * from rpg_private.memory_sources(cid,visibility) where sequence>head and current and status='valid' and kind in ('scene','event','document','private_event') order by sequence loop
   if s.oversized then exit; end if;
   if not rpg_private.memory_refs_valid(cid,s.source_refs,visibility) then continue; end if;
   if jsonb_array_length(batch)>0 and (jsonb_array_length(batch)>=24 or bytes+octet_length(s.text)>24000) then
    insert into rpg_private.memory_jobs(campaign_id,boundary_id,visibility,generation,from_sequence,through_sequence,sources,state_revision,settings_revision,guide_version_id)
      values(cid,bid,visibility,ms.generation,firstseq,lastseq,batch,rev,settingrev,guide) on conflict do nothing;
    batch:='[]'; bytes:=0; firstseq:=lastseq+1;
   end if;
   batch:=batch || jsonb_build_array(rpg_private.memory_source_json(s,visibility)); bytes:=bytes+octet_length(s.text); lastseq:=s.sequence;
  end loop;
  if jsonb_array_length(batch)>0 then
   insert into rpg_private.memory_jobs(campaign_id,boundary_id,visibility,generation,from_sequence,through_sequence,sources,state_revision,settings_revision,guide_version_id)
    values(cid,bid,visibility,ms.generation,firstseq,lastseq,batch,rev,settingrev,guide) on conflict do nothing;
  end if;
 end loop;
end $$;

create function rpg_private.memory_boundary_json(b rpg_private.memory_boundaries) returns jsonb language plpgsql stable set search_path='' as $$
declare cp rpg_private.memory_checkpoints%rowtype; resume jsonb; pending rpg_private.turns%rowtype; recap text; recap_status text;
begin
 select * into cp from rpg_private.memory_checkpoints where campaign_id=b.campaign_id and boundary_id=b.id order by created_at desc,id desc limit 1;
 resume:=cp.payload->'resume';
 select * into pending from rpg_private.turns where campaign_id=b.campaign_id and id=b.pending_operation_id;
 if pending.id is null or pending.status in ('committed','cancelled') or (pending.status='failed' and not pending.retryable) then
  resume:=resume || jsonb_build_object('pendingOperationId',null,'pendingStatus',null);
 else resume:=resume || jsonb_build_object('pendingOperationId',pending.id,'pendingStatus',pending.status); end if;
 select string_agg(text,E'\n\n' order by created_at,id,n) into recap from (
  select m.created_at,m.id,e.n,e.value->>'text' text,
    sum(octet_length(e.value->>'text')) over(order by m.created_at,m.id,e.n) bytes
  from public.rpg_memory_summaries m cross join lateral jsonb_array_elements(m.entries) with ordinality e(value,n)
  where m.campaign_id=b.campaign_id and m.boundary_id=b.id and m.valid and rpg_private.memory_refs_valid(b.campaign_id,m.source_refs,'public')
 ) bounded where bytes<=24000;
 recap_status:=case
  when not cp.valid then 'stale'
  when exists(select 1 from rpg_private.memory_jobs where campaign_id=b.campaign_id and boundary_id=b.id and visibility='public' and status='failed') then 'failed'
  when exists(select 1 from rpg_private.memory_jobs where campaign_id=b.campaign_id and boundary_id=b.id and visibility='public' and status='generating' and lease_until>now()) then 'generating'
  when exists(select 1 from rpg_private.memory_jobs where campaign_id=b.campaign_id and boundary_id=b.id and visibility='public' and status='generating') then 'pending'
  when exists(select 1 from rpg_private.memory_jobs where campaign_id=b.campaign_id and boundary_id=b.id and visibility='public' and status='pending') then 'pending'
  when exists(select 1 from rpg_private.memory_public_sources where campaign_id=b.campaign_id and session_id=b.session_id and current and status='valid' and oversized) then 'failed'
  when exists(select 1 from rpg_private.memory_public_sources s join rpg_private.memory_state ms on ms.campaign_id=s.campaign_id where s.campaign_id=b.campaign_id and s.session_id=b.session_id and s.current and s.status='valid' and s.kind in ('scene','document','event') and s.sequence>ms.public_watermark) then 'pending'
  else 'ready' end;
 return jsonb_build_object('id',b.id,'campaign_id',b.campaign_id,'sessionId',b.session_id,'endedAt',b.ended_at,'state',b.state,'nextSessionId',b.next_session_id,
  'checkpointStatus',case when cp.valid then 'ready' else 'rebuild_required' end,'resume',resume,
  'recap',jsonb_build_object('status',recap_status,'text',recap,'canRetry',recap_status in ('pending','failed','stale')));
end $$;
create function rpg_private.memory_read(cid uuid) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('campaignId',cid,'runtimeRevision',(select revision from rpg_private.runtime_state where campaign_id=cid),
  'currentBoundary',(select rpg_private.memory_boundary_json(b) from rpg_private.memory_boundaries b where campaign_id=cid and state<>'continued' order by ended_at desc limit 1),
  'sessions',coalesce((select jsonb_agg(rpg_private.memory_boundary_json(b) order by ended_at desc,id) from rpg_private.memory_boundaries b where campaign_id=cid),'[]'))
$$;
create function rpg_private.memory_summary_json(cid uuid, visibility text) returns jsonb language plpgsql stable set search_path='' as $$
declare result jsonb; tbl text;
begin
 tbl:=case visibility when 'public' then 'public.rpg_memory_summaries' else 'rpg_private.memory_summaries' end;
 execute format('select jsonb_build_object(''id'',id,''campaignId'',campaign_id,''visibility'',$2,''boundaryId'',boundary_id,''generation'',generation,''fromSequence'',from_sequence,''throughSequence'',through_sequence,''sourceRefs'',source_refs,''entries'',entries,''valid'',valid,''createdAt'',created_at) from %s where campaign_id=$1 and valid and rpg_private.memory_refs_valid($1,source_refs,$2) order by through_sequence desc,created_at desc limit 1',tbl) into result using cid,visibility;
 return result;
end $$;

create function public.rpg_memory(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}') returns jsonb
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
   update rpg_private.memory_jobs set status='pending',token=null,lease_until=null,failure=null,
    state_revision=rev,settings_revision=(select revision from public.rpg_settings where campaign_id=cid),
    guide_version_id=(select d.current_version_id from public.rpg_documents d join public.rpg_dm_guides g on g.campaign_id=d.campaign_id and g.document_id=d.id where g.campaign_id=cid)
    where campaign_id=cid and generation=ms.generation and status='failed' and attempts<5 and (bid is null or boundary_id=bid);
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

-- Preserve the existing one-DM executor and add only the memory boundary gate.
alter function public.rpg_runtime(uuid,uuid,text,jsonb) rename to rpg_runtime_phase2;
create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare b rpg_private.memory_boundaries%rowtype; result jsonb; op uuid:=(p_payload->>'operationId')::uuid;
begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
 select * into b from rpg_private.memory_boundaries where campaign_id=p_campaign_id and state<>'continued' order by ended_at desc limit 1;
 if b.id is not null then
  if p_action='begin' and p_payload->>'mode' in ('game','companion','mechanic') and not exists(select 1 from rpg_private.turns where campaign_id=p_campaign_id and id=op) then raise exception 'rpg_memory_paused'; end if;
  if p_action in ('claim','checkpoint','checks','reroll','commit') and exists(select 1 from rpg_private.turns where campaign_id=p_campaign_id and id=op and input->>'mode' in ('game','companion','mechanic')) and (b.state='ended' or op is distinct from b.pending_operation_id) then raise exception 'rpg_memory_paused'; end if;
  if p_action='fail' and b.state='ended' and op=b.pending_operation_id then return (select rpg_private.runtime_public_turn(t) from rpg_private.turns t where campaign_id=p_campaign_id and id=op); end if;
 end if;
 result:=public.rpg_runtime_phase2(p_owner_id,p_campaign_id,p_action,p_payload);
 if p_action in ('commit','cancel') and b.id is not null and op=b.pending_operation_id then
  perform rpg_private.memory_capture(p_campaign_id,b.id);
  perform rpg_private.memory_queue(p_campaign_id,b.id);
 end if;
 return result;
end $$;

-- Backfill only derivative public indexes from existing public originals. No seed,
-- gameplay change, private import or invented historical witness knowledge.
insert into rpg_private.memory_state(campaign_id) select id from public.rpg_campaigns on conflict do nothing;
do $$ declare r record; ev rpg_private.runtime_events%rowtype; begin
 for r in select * from public.rpg_scenes order by sequence loop
  perform rpg_private.memory_index(r.campaign_id,'scene',r.id,r.revision::text,r.body,'public',r.session_id,'{}','{}','history',case when r.role='player' then 'intention' else 'record' end);
 end loop;
 for r in select d.* from public.rpg_documents d where status<>'archived' and not exists(select 1 from public.rpg_dm_guides g where g.campaign_id=d.campaign_id and g.document_id=d.id) order by updated_at,id loop
  perform rpg_private.memory_index(r.campaign_id,'document',r.id,r.revision::text,r.body,'public',null,'{}','{}',case when r.status='canon' then 'canon' else 'reference' end);
 end loop;
 for r in select * from public.rpg_entities loop
  insert into rpg_private.memory_aliases(campaign_id,entity_id,alias) values(r.campaign_id,r.id,r.name) on conflict do nothing;
  perform rpg_private.memory_index(r.campaign_id,'entity',r.id,r.revision::text,r.name || ': ' || r.details,'public',null,array[r.id],'{}','state');
 end loop;
 for r in select * from public.rpg_items loop
  perform rpg_private.memory_index(r.campaign_id,'item',r.id,r.revision::text,r.name || ': ' || r.description || ' ' || r.mechanics,'public',null,'{}','{}','state');
 end loop;
 for r in select * from public.rpg_quests where status<>'archived' loop
  perform rpg_private.memory_index(r.campaign_id,'quest',r.id,r.revision::text,r.title || ': ' || r.description || ' [' || r.status || ']','public',null,'{}','{}','state');
 end loop;
 for r in select * from public.rpg_locations loop
  perform rpg_private.memory_index(r.campaign_id,'location',r.id,r.revision::text,r.name || ': ' || r.description,'public',null,'{}','{}','state');
 end loop;
 for r in select * from public.rpg_public_state loop
  perform rpg_private.memory_index(r.campaign_id,'state',r.campaign_id,r.revision::text,r.summary,'public',null,'{}','{}','state');
 end loop;
 -- Existing immutable receipts preserve old names without guessing identity.
 insert into rpg_private.memory_aliases(campaign_id,entity_id,alias)
 select m.campaign_id,e.id,m.request#>>'{payload,name}' from rpg_private.mutation_receipts m
 join public.rpg_entities e on e.campaign_id=m.campaign_id and e.id=(m.result->>'id')::uuid
 where m.request->>'operation'='entity.save' and length(btrim(coalesce(m.request#>>'{payload,name}','')))>0 on conflict do nothing;
 -- Legacy events with pinned participant metadata have explicit witness evidence.
 -- Rows lacking such evidence keep empty NPC knowledge, never inferred familiarity.
 for ev in select * from rpg_private.runtime_events order by created_at,id loop
  perform rpg_private.memory_ingest_event(ev);
 end loop;
end $$;

create function rpg_private.memory_preserve_history() returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op='DELETE' or (to_jsonb(new)-'valid') is distinct from (to_jsonb(old)-'valid') or (not old.valid and new.valid) then raise exception 'rpg_immutable_history' using errcode='42501'; end if;
 return new;
end $$;
create trigger immutable_memory_summary before update or delete on public.rpg_memory_summaries for each row execute function rpg_private.memory_preserve_history();
create trigger immutable_memory_summary before update or delete on rpg_private.memory_summaries for each row execute function rpg_private.memory_preserve_history();
create trigger immutable_memory_checkpoint before update or delete on rpg_private.memory_checkpoints for each row execute function rpg_private.memory_preserve_history();
create function public.rpg_memory_summary_visible(p_campaign_id uuid,p_refs jsonb) returns boolean language sql stable security definer set search_path='' as $$
 select public.rpg_is_owner() and rpg_private.memory_refs_valid(p_campaign_id,p_refs,'public')
$$;
revoke all on function public.rpg_memory_summary_visible(uuid,jsonb) from public,anon;
grant execute on function public.rpg_memory_summary_visible(uuid,jsonb) to authenticated;
alter table public.rpg_memory_summaries enable row level security;
revoke all on public.rpg_memory_summaries from public,anon,authenticated;
grant select on public.rpg_memory_summaries to authenticated;
create policy owner_valid_memory on public.rpg_memory_summaries for select to authenticated using(valid and public.rpg_memory_summary_visible(campaign_id,source_refs));
do $$ declare t text; begin
 foreach t in array array['memory_state','memory_public_sources','memory_private_sources','memory_aliases','memory_restrictions','memory_boundaries','memory_checkpoints','memory_summaries','memory_jobs','memory_commands'] loop
  execute format('alter table rpg_private.%I enable row level security',t);
 end loop;
end $$;
revoke all on all tables in schema rpg_private from public,anon,authenticated;
revoke all on all sequences in schema rpg_private from public,anon,authenticated;
revoke all on all functions in schema rpg_private from public,anon,authenticated;
revoke all on function public.rpg_runtime_phase2(uuid,uuid,text,jsonb) from public,anon,authenticated;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb) from public,anon,authenticated;
revoke all on function public.rpg_memory(uuid,uuid,text,jsonb) from public,anon,authenticated;
do $$ begin
 if exists(select 1 from pg_roles where rolname='service_role') then
  revoke all on function public.rpg_runtime_phase2(uuid,uuid,text,jsonb) from service_role;
  grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb) to service_role;
  grant execute on function public.rpg_memory(uuid,uuid,text,jsonb) to service_role;
 end if;
end $$;
commit;
